import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';
import { NODE_FRAMEWORKS, PYTHON_FRAMEWORKS, CSHARP_FRAMEWORKS, JAVA_FRAMEWORKS, PHP_FRAMEWORKS, getDataLayerType } from './config';

const MAX_CONFIG_SIZE = 1024 * 1024;

export type FrameworkName =
  | 'nestjs' | 'nextjs' | 'express' | 'angular'
  | 'django' | 'fastapi' | 'flask'
  | 'aspnet'
  | 'spring'
  | 'laravel'
  | 'unknown';

export interface DetectedStack {
  language: 'ts' | 'csharp' | 'java' | 'python' | 'php' | 'unknown';
  framework: FrameworkName;
  data?: 'mongo' | 'postgres' | 'graphql';
  confidence?: number;
}

export interface DetectionResult {
  stack: DetectedStack;
  confidence: number;
}

export interface DetectorStrategy {
  priority?: number;
  detect(cwd: string): Promise<DetectionResult | null>;
}

abstract class BaseDetector implements DetectorStrategy {
  abstract priority: number;
  abstract detect(cwd: string): Promise<DetectionResult | null>;
  protected async safeReadFile(filePath: string, rootBase?: string): Promise<string | null> {
    try {
      // Basic input checks to avoid null-bytes and path traversal
      if (filePath.includes('\0')) {
        console.warn('⚠️ Security Warning: Skipping file with invalid characters');
        return null;
      }
      const resolved = path.resolve(filePath);
      if (rootBase && !resolved.startsWith(path.resolve(rootBase))) {
        console.warn(`⚠️ Security Warning: Skipping ${filePath} (Outside allowed root)`);
        return null;
      }
      // Use lstat to detect symlinks and avoid TOCTOU symlink attacks
      const stats = await fs.lstat(resolved);
      if (!stats.isFile || (typeof stats.isFile === 'function' && !stats.isFile())) {
        console.warn(`⚠️ Security Warning: Skipping ${filePath} (Not a regular file)`);
        return null;
      }
      // Do not follow symbolic links
      if ((stats as any).isSymbolicLink && (stats as any).isSymbolicLink()) {
        console.warn(`⚠️ Security Warning: Skipping ${filePath} (Symbolic link)`);
        return null;
      }
      if (stats.size > MAX_CONFIG_SIZE) {
        console.warn(`⚠️ Security Warning: Skipping ${filePath} (File too large)`);
        return null;
      }
      return await fs.readFile(resolved, 'utf-8');
    } catch {
      return null;
    }
  }
}

class NodeDetector extends BaseDetector {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const pkgPath = path.join(cwd, 'package.json');
    if (!(await fs.pathExists(pkgPath))) return null;

    const content = await this.safeReadFile(pkgPath, cwd);
    if (!content) return null;

    // Validate package.json structure before using it to avoid prototype pollution
    const PackageJsonSchema = z.object({
      dependencies: z.record(z.string(), z.string()).optional(),
      devDependencies: z.record(z.string(), z.string()).optional()
    });
    let pkg;
    try {
      const parsed = JSON.parse(content);
      const parsedRes = PackageJsonSchema.safeParse(parsed);
      if (!parsedRes.success) return null;
      pkg = parsedRes.data;
    } catch { return null; }

    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

    const framework = NODE_FRAMEWORKS.find(f => deps[f.key]);
    if (!framework) return null;

    let confidence = 0.7;
    // Check for confidence boost indicators
      if (framework.confidenceBoost) {
      for (const boostKey of framework.confidenceBoost) {
        // Check both dependencies and a file path presence for boost keys
        if (deps[boostKey] || await fs.pathExists(path.join(cwd, boostKey))) {
          confidence = 0.95;
          break;
        }
      }
    }

    const result: DetectedStack = { language: 'ts', framework: framework.name as FrameworkName, confidence };

    // Detect data layer
    for (const depKey of Object.keys(deps)) {
      const dataType = getDataLayerType(depKey);
      if (dataType) {
        result.data = dataType;
        break;
      }
    }

    return { stack: result, confidence };
  }
}

class PythonDetector extends BaseDetector {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const files = ['requirements.txt', 'Pipfile', 'pyproject.toml'];
    
    for (const file of files) {
      const filePath = path.join(cwd, file);
      if (!(await fs.pathExists(filePath))) continue;

      const content = await this.safeReadFile(filePath, cwd);
      if (!content) continue;

      const framework = PYTHON_FRAMEWORKS.find(f => content.includes(f.key));
      if (framework) {
        const confidence = file === 'pyproject.toml' ? 0.9 : 0.8;
        return { stack: { language: 'python', framework: framework.name as FrameworkName, confidence }, confidence };
      }
    }

    return null;
  }
}

class CSharpDetector extends BaseDetector {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const files = await fs.readdir(cwd);
    const csproj = files.find(f => f.endsWith('.csproj') || f.endsWith('.sln'));
    
    if (!csproj) return null;

    const content = await this.safeReadFile(path.join(cwd, csproj), cwd);
    if (!content) return null;
    
    const framework = CSHARP_FRAMEWORKS.find(f => content.includes(f.key));
    if (framework) {
      let confidence = csproj.endsWith('.csproj') ? 0.9 : 0.8;

      // Check for confidence boost
      if (framework.confidenceBoost) {
        for (const boostKey of framework.confidenceBoost) {
          if (content.includes(boostKey)) {
            confidence = 0.95;
            break;
          }
        }
      }

      return { stack: { language: 'csharp', framework: framework.name as FrameworkName, confidence }, confidence };
    }

    return null;
  }
}

class JavaDetector extends BaseDetector {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const files = [
      { path: 'pom.xml', confidence: 0.9 },
      { path: 'build.gradle', confidence: 0.85 }
    ];

    for (const file of files) {
      const filePath = path.join(cwd, file.path);
      if (await fs.pathExists(filePath)) {
        const content = await this.safeReadFile(filePath, cwd);
        if (!content) continue;

        const framework = JAVA_FRAMEWORKS.find(f => content.includes(f.key));
        if (framework) {
          let confidence = file.confidence;

          // Check for confidence boost
          if (framework.confidenceBoost) {
            for (const boostKey of framework.confidenceBoost) {
              if (content.includes(boostKey)) {
                confidence = 0.95;
                break;
              }
            }
          }

          return { stack: { language: 'java', framework: framework.name as FrameworkName, confidence }, confidence };
        }
      }
    }

    return null;
  }
}

class PHPDetector extends BaseDetector {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const composerPath = path.join(cwd, 'composer.json');
    if (!(await fs.pathExists(composerPath))) return null;

    const content = await this.safeReadFile(composerPath, cwd);
    if (!content) return null;

    // Validate composer.json structure using Zod
    const ComposerJsonSchema = z.object({
      require: z.record(z.string(), z.string()).optional(),
      'require-dev': z.record(z.string(), z.string()).optional()
    });
    let composer;
    try {
      const parsed = JSON.parse(content);
      const res = ComposerJsonSchema.safeParse(parsed);
      if (!res.success) return null;
      composer = res.data;
    } catch { return null; }

    const deps = { ...(composer.require ?? {}), ...(composer['require-dev'] ?? {}) };

    const framework = PHP_FRAMEWORKS.find(f => deps[f.key]);
    if (framework) {
      let confidence = 0.85;

      // Check for confidence boost
      if (framework.confidenceBoost) {
        for (const boostKey of framework.confidenceBoost) {
          if (deps[boostKey]) {
            confidence = 0.95;
            break;
          }
        }
      }

      return { stack: { language: 'php', framework: framework.name as FrameworkName, confidence }, confidence };
    }

    return null;
  }
}

export class FrameworkDetector {
  private detectors: DetectorStrategy[];
  private cache?: DetectedStack;

  constructor(
    private cwd: string = process.cwd(),
    strategies: DetectorStrategy[] = []
  ) {
    const defaults = [
      new NodeDetector(),
      new PythonDetector(),
      new CSharpDetector(),
      new JavaDetector(),
      new PHPDetector()
    ];
    
    this.detectors = [...defaults, ...strategies];
    this.detectors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  registerDetector(detector: DetectorStrategy): void {
    this.detectors.push(detector);
  }

  clearCache(): void {
    this.cache = undefined;
  }

  async detect(): Promise<DetectedStack> {
    if (this.cache) return this.cache;

    for (const detector of this.detectors) {
      try {
        const result = await detector.detect(this.cwd);
        if (result) {
          this.cache = result.stack;
          return result.stack;
        }
      } catch (error) {
        console.error(`Detector ${detector.constructor.name} failed:`, error);
      }
    }

    const fallback: DetectedStack = { language: 'unknown', framework: 'unknown', confidence: 0 };
    this.cache = fallback;
    return fallback;
  }

  async detectParallel(): Promise<DetectedStack> {
    if (this.cache) return this.cache;

    const results = await Promise.allSettled(
      this.detectors.map(d => d.detect(this.cwd))
    );

    const successful = results
      .filter((r): r is PromiseFulfilledResult<DetectionResult> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value)
      .sort((a, b) => b.confidence - a.confidence);

    if (successful.length > 0) {
      this.cache = successful[0].stack;
      return successful[0].stack;
    }

    results.forEach(r => {
      if (r.status === 'rejected') console.error('Detector failed:', r.reason);
    });

    const fallback: DetectedStack = { language: 'unknown', framework: 'unknown', confidence: 0 };
    this.cache = fallback;
    return fallback;
  }

  async detectWithConfidence(): Promise<DetectionResult> {
    const stack = await this.detect();
    return { stack, confidence: stack.confidence ?? 0 };
  }
}
