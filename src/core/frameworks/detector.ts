import fs from 'fs-extra';
import path from 'path';
import { NODE_FRAMEWORKS, PYTHON_FRAMEWORKS, CSHARP_FRAMEWORKS, JAVA_FRAMEWORKS, PHP_FRAMEWORKS, getDataLayerType } from './config';

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

class NodeDetector implements DetectorStrategy {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const pkgPath = path.join(cwd, 'package.json');
    if (!(await fs.pathExists(pkgPath))) return null;

    const pkg = await fs.readJson(pkgPath) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    const framework = NODE_FRAMEWORKS.find(f => deps[f.key]);
    if (!framework) return null;

    let confidence = 0.7;
    // Check for confidence boost indicators
    if (framework.confidenceBoost) {
      for (const boostKey of framework.confidenceBoost) {
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

class PythonDetector implements DetectorStrategy {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const files = ['requirements.txt', 'Pipfile', 'pyproject.toml'];
    
    for (const file of files) {
      const filePath = path.join(cwd, file);
      if (!(await fs.pathExists(filePath))) continue;

      const content = await fs.readFile(filePath, 'utf-8');

      const framework = PYTHON_FRAMEWORKS.find(f => content.includes(f.key));
      if (framework) {
        const confidence = file === 'pyproject.toml' ? 0.9 : 0.8;
        return { stack: { language: 'python', framework: framework.name as FrameworkName, confidence }, confidence };
      }
    }

    return null;
  }
}

class CSharpDetector implements DetectorStrategy {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const files = await fs.readdir(cwd);
    const csproj = files.find(f => f.endsWith('.csproj') || f.endsWith('.sln'));
    
    if (!csproj) return null;

    const content = await fs.readFile(path.join(cwd, csproj), 'utf-8');
    
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

class JavaDetector implements DetectorStrategy {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const files = [
      { path: 'pom.xml', confidence: 0.9 },
      { path: 'build.gradle', confidence: 0.85 }
    ];

    for (const file of files) {
      const filePath = path.join(cwd, file.path);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');

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

class PHPDetector implements DetectorStrategy {
  priority = 10;

  async detect(cwd: string): Promise<DetectionResult | null> {
    const composerPath = path.join(cwd, 'composer.json');
    if (!(await fs.pathExists(composerPath))) return null;

    const composer = await fs.readJson(composerPath) as { require?: Record<string, string>; 'require-dev'?: Record<string, string> };
    const deps = { ...composer.require, ...composer['require-dev'] };

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
    detectors?: DetectorStrategy[]
  ) {
    this.detectors = detectors ?? [
      new NodeDetector(),
      new PythonDetector(),
      new CSharpDetector(),
      new JavaDetector(),
      new PHPDetector()
    ];
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
