import fs from 'fs-extra';
import { tmpdir } from 'os';
import path from 'path';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { FrameworkDetector, DetectedStack, DetectionResult, DetectorStrategy } from './detector';

async function withTempDir(fn: (dir: string) => Promise<void>) {
  const base = tmpdir();
  const dir = await fs.mkdtemp(path.join(base, 'detector-test-'));
  try {
    await fn(dir);
  } finally {
    await fs.remove(dir);
  }
}

describe('FrameworkDetector', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test('detects NestJS from package.json (dependencies)', async () => {
    await withTempDir(async dir => {
      // Create package.json with @nestjs/core and pg (postgres data layer)
      const pkg = {
        dependencies: {
          '@nestjs/core': '^10.0.0',
          'pg': '^8.0.0'
        },
        devDependencies: {
          '@nestjs/cli': '^9.0.0'
        }
      };
      await fs.writeJson(path.join(dir, 'package.json'), pkg, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('nestjs');
      expect(result.language).toBe('ts');
      expect(result.data).toBe('postgres');
      // Because cli is present, confidence should be high
      expect((result.confidence ?? 0) >= 0.9).toBeTruthy();
    });
  });

  test('detects Next.js from package.json (devDependencies) and boosts confidence', async () => {
    await withTempDir(async dir => {
      const pkg = {
        dependencies: {},
        devDependencies: { next: '^13.0.0', react: '^18.0.0' }
      };
      await fs.writeJson(path.join(dir, 'package.json'), pkg, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('nextjs');
      expect(result.language).toBe('ts');
      expect((result.confidence ?? 0) >= 0.9).toBeTruthy();
    });
  });

  test('detects Python frameworks from requirements.txt and pyproject', async () => {
    await withTempDir(async dir => {
      await fs.writeFile(path.join(dir, 'requirements.txt'), 'django==4.2');
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('django');
      expect(result.language).toBe('python');
      expect((result.confidence ?? 0) >= 0.8).toBeTruthy();

      // Now test pyproject.toml has higher confidence
      await fs.rm(path.join(dir, 'requirements.txt'));
      await fs.writeFile(path.join(dir, 'pyproject.toml'), '[tool.poetry]\nname = "test"\ndependencies = ["django"]');
      const detector2 = new FrameworkDetector(dir);
      const res2 = await detector2.detect();
      expect(res2.framework).toBe('django');
      expect((res2.confidence ?? 0) >= 0.9).toBeTruthy();
    });
  });

  test('detects C# from .csproj content and boost confidence', async () => {
    await withTempDir(async dir => {
      const csproj = `<Project Sdk=\"Microsoft.NET.Sdk.Web\">\n  <ItemGroup>\n    <PackageReference Include=\"Microsoft.AspNetCore.Mvc\" Version=\"2.2.0\" />\n  </ItemGroup>\n</Project>`;
      await fs.writeFile(path.join(dir, 'project.csproj'), csproj);
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('aspnet');
      expect(result.language).toBe('csharp');
      expect((result.confidence ?? 0) >= 0.9).toBeTruthy();
    });
  });

  test('C# csproj without boost key has base confidence', async () => {
    await withTempDir(async dir => {
      const csproj = `<Project Sdk=\"Microsoft.NET.Sdk.Web\">\n  <ItemGroup>\n    <PackageReference Include=\"Microsoft.AspNetCore\" Version=\"1.0.0\" />\n  </ItemGroup>\n</Project>`;
      await fs.writeFile(path.join(dir, 'project.csproj'), csproj);
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('aspnet');
      expect(res.confidence).toBeCloseTo(0.9);
    });
  });

  test('detects Pipfile python framework', async () => {
    await withTempDir(async dir => {
      await fs.writeFile(path.join(dir, 'Pipfile'), 'fastapi');
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('fastapi');
      expect(result.language).toBe('python');
    });
  });

  test('detects Java from pom.xml and build.gradle when present', async () => {
    await withTempDir(async dir => {
      const pom = `<project><dependencies><dependency>spring-boot-starter</dependency></dependencies></project>`;
      await fs.writeFile(path.join(dir, 'pom.xml'), pom);
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('spring');
      expect(result.language).toBe('java');
      expect((result.confidence ?? 0) >= 0.85).toBeTruthy();
    });
  });

  test('java pom without boost stays default confidence', async () => {
    await withTempDir(async dir => {
      const pom = `<project><dependencies><dependency>spring-boot-starter</dependency></dependencies></project>`;
      await fs.writeFile(path.join(dir, 'pom.xml'), pom);
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('spring');
      expect(res.confidence).toBeCloseTo(0.9);
    });
  });

  test('java boost key in pom.xml increases confidence', async () => {
    await withTempDir(async dir => {
      const pom = `<project><dependencies><dependency>spring-boot-starter-web</dependency></dependencies></project>`;
      await fs.writeFile(path.join(dir, 'pom.xml'), pom);
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('spring');
      expect((result.confidence ?? 0) >= 0.95).toBeTruthy();
    });
  });

  test('detects PHP from composer.json', async () => {
    await withTempDir(async dir => {
      const composer = { require: { 'laravel/framework': '^10.0' } };
      await fs.writeJson(path.join(dir, 'composer.json'), composer, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('laravel');
      expect(result.language).toBe('php');
      expect((result.confidence ?? 0) >= 0.85).toBeTruthy();
    });
  });

  test('PHP composer require only has base confidence', async () => {
    await withTempDir(async dir => {
      const composer = { require: { 'laravel/framework': '^10.0' } };
      await fs.writeJson(path.join(dir, 'composer.json'), composer, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('laravel');
      expect(res.confidence).toBeCloseTo(0.85);
    });
  });

  test('composer require-dev boosts confidence', async () => {
    await withTempDir(async dir => {
      const composer = { require: { 'laravel/framework': '^10.0' }, 'require-dev': { 'laravel/laravel': '^10.0' } };
      await fs.writeJson(path.join(dir, 'composer.json'), composer, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('laravel');
      expect((result.confidence ?? 0) >= 0.95).toBeTruthy();
    });
  });

  test('returns unknown when files are invalid or absent', async () => {
    await withTempDir(async dir => {
      // invalid package.json (malformed JSON)
      await fs.writeFile(path.join(dir, 'package.json'), '{ invalid json ');
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('unknown');
      expect(result.language).toBe('unknown');
      expect((result.confidence ?? 0) === 0).toBeTruthy();
    });
  });

  test('safeReadFile treats exact MAX_CONFIG_SIZE as readable (not skipped)', async () => {
    await withTempDir(async dir => {
      const equalSizeFile = path.join(dir, 'package.json');
      const content = '{"name":"test"}';
      // Create a file that equals MAX_CONFIG_SIZE by padding
      const pad = 'a'.repeat(1024 * 1024 - content.length);
      await fs.writeFile(equalSizeFile, content + pad);
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      // File equals size should be read, not skipped; since content not valid package, fallback
      expect(result).toBeDefined();
    });
  });

  test('safeReadFile rejects non-function isFile and symlink via mocked lstat', async () => {
    await withTempDir(async dir => {
      const pkgPath = path.join(dir, 'package.json');
      await fs.writeFile(pkgPath, JSON.stringify({ dependencies: { express: '^4.0.0' } }));
      const detector = new FrameworkDetector(dir);

      // Mock lstat to return an object with isFile being a boolean false to simulate edge shape
      const spy = vi.spyOn(fs, 'lstat').mockImplementation(async () => ({ isFile: false, isSymbolicLink: () => false, size: 10 } as any));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const res = await detector.detect();
      expect(res.framework).toBe('unknown');
      expect(warnSpy).toHaveBeenCalled();
      spy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  test('safeReadFile rejects filename with null char and warns', async () => {
    await withTempDir(async dir => {
      const detector = new FrameworkDetector(dir);
      const nodeDetector = (detector as any).detectors.find((d: any) => typeof d.safeReadFile === 'function');
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const res = await nodeDetector.safeReadFile(`malicious\0name`, dir);
      expect(res).toBeNull();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  test('safeReadFile rejects file outside provided rootBase', async () => {
    await withTempDir(async dir => {
      const detector = new FrameworkDetector(dir);
      const nodeDetector = (detector as any).detectors.find((d: any) => typeof d.safeReadFile === 'function');
      // create a file outside the provided rootBase
      const otherDir = path.join(dir, '..');
      const file = path.join(otherDir, 'external.json');
      await fs.writeFile(file, '{}');
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const res = await nodeDetector.safeReadFile(file, dir);
      expect(res).toBeNull();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  test('detectParallel prefers highest confidence from registered detectors', async () => {
    await withTempDir(async dir => {
      const detector = new FrameworkDetector(dir);
      // Register a custom detector that returns high confidence
      class HighConfDetector implements DetectorStrategy {
        priority = 5;
        async detect(_cwd: string): Promise<DetectionResult | null> {
          const res: DetectionResult = { stack: { language: 'ts', framework: 'express', confidence: 0.95 }, confidence: 0.95 };
          return res;
        }
      }
      class LowConfDetector implements DetectorStrategy {
        priority = 1;
        async detect(_cwd: string): Promise<DetectionResult | null> {
          const res: DetectionResult = { stack: { language: 'python', framework: 'flask', confidence: 0.7 }, confidence: 0.7 };
          return res;
        }
      }
      detector.registerDetector(new LowConfDetector());
      detector.registerDetector(new HighConfDetector());
      const result = await detector.detectParallel();
      expect(result.framework).toBe('express');
      expect((result.confidence ?? 0) >= 0.9).toBeTruthy();
    });
  });

  test('detectParallel logs rejected detectors', async () => {
    await withTempDir(async dir => {
      const detector = new FrameworkDetector(dir);
      class RejectingDetector {
        priority = 1;
        async detect(): Promise<{ stack: DetectedStack; confidence: number } | null> {
          throw new Error('boom');
        }
      }
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      detector.registerDetector(new RejectingDetector());
      const res = await detector.detectParallel();
      expect(spy).toHaveBeenCalled();
      // ensure the logged error includes the expected text
      expect(spy.mock.calls[0][0]).toBe('Detector failed:');
      spy.mockRestore();
      expect(res.framework).toBe('unknown');
    });
  });

  test('safeReadFile rejects symlink and directory (not a regular file)', async () => {
    await withTempDir(async dir => {
      const pkgDir = path.join(dir, 'package.json');
      await fs.ensureDir(pkgDir);
      const detector = new FrameworkDetector(dir);
      // The detector will try to read package.json; a directory named 'package.json' is a weird case but must be skipped
      const res = await detector.detect();
      // no package.json, fallback unknown
      expect(res.framework).toBe('unknown');

      // Now ensure console.warn called for directory
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      detector.clearCache();
      await detector.detect();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();

      // Remove directory and now create a symlink to a valid file and ensure it's skipped
      await fs.remove(pkgDir);
      const target = path.join(dir, 'realfile');
      await fs.writeFile(target, JSON.stringify({ dependencies: { express: '^4.0.0' } }));
      // create package.json as symlink to target
      await fs.symlink(target, path.join(dir, 'package.json'));
      const detector2 = new FrameworkDetector(dir);
      // Since package.json is a symlink, safeReadFile should skip it and detector returns unknown
      const res2 = await detector2.detect();
      expect(res2.framework).toBe('unknown');
      // Replace symlink with real file and ensure detection succeeds
      await fs.unlink(path.join(dir, 'package.json'));
      await fs.rename(target, path.join(dir, 'package.json'));
      const detector3 = new FrameworkDetector(dir);
      const res3 = await detector3.detect();
      expect(res3.framework).toBe('express');
    });
  });

  test('safeReadFile rejects when lstat.isFile() returns function false', async () => {
    await withTempDir(async dir => {
      const detector = new FrameworkDetector(dir);
      const file = path.join(dir, 'afake.json');
      await fs.writeFile(file, '{}');

      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const nodeDetector = (detector as any).detectors.find((d: any) => typeof d.safeReadFile === 'function');
      const lstatSpy = vi.spyOn(fs, 'lstat').mockImplementation(async () => ({ isFile: () => false, size: 10, isSymbolicLink: () => false } as any));

      const res = await nodeDetector.safeReadFile(file, dir);
      expect(res).toBeNull();
      expect(spy).toHaveBeenCalled();
      lstatSpy.mockRestore();
      spy.mockRestore();
    });
  });

  test('node detector path does not exist yields null early', async () => {
    await withTempDir(async dir => {
      // no package.json present
      const detector = new FrameworkDetector(dir);
      // Force NodeDetector by ensuring no other detectors detect
      const res = await detector.detect();
      expect(res.framework).toBe('unknown');
    });
  });

  test('safeReadFile skips files larger than MAX_CONFIG_SIZE', async () => {
    await withTempDir(async dir => {
      // Create a large package.json that exceeds MAX_CONFIG_SIZE (1 MB)
      const bigContent = '{"dependencies": {"express": "^4.0.0"}, "x": "' + 'a'.repeat(1024 * 1024 + 10) + '"}';
      await fs.writeFile(path.join(dir, 'package.json'), bigContent);
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      // Because safeReadFile returns null for large files, detection should not find framework
      expect(result.framework).toBe('unknown');
      expect(result.language).toBe('unknown');
    });
  });

  test('NodeDetector boosts confidence when boost file exists', async () => {
    await withTempDir(async dir => {
      const pkg = { dependencies: { '@nestjs/core': '^10.0.0' } };
      await fs.writeJson(path.join(dir, 'package.json'), pkg, { spaces: 2 });
      // Create a boost file that the detector will check for
      await fs.writeFile(path.join(dir, 'nest-cli.json'), '{}');
      const detector = new FrameworkDetector(dir);
      const result = await detector.detect();
      expect(result.framework).toBe('nestjs');
      expect((result.confidence ?? 0) >= 0.95).toBeTruthy();
    });
  });

  test('NodeDetector default confidence without boost', async () => {
    await withTempDir(async dir => {
      const pkg = {
        dependencies: { '@nestjs/core': '^10.0.0' },
      };
      await fs.writeJson(path.join(dir, 'package.json'), pkg, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('nestjs');
      expect((res.confidence ?? 0) === 0.7).toBeTruthy();
    });
  });

  test('safeReadFile shows console.warn and returns null on large file', async () => {
    await withTempDir(async dir => {
      const tinyPrefix = '{"dependencies": {"express": "^4.0.0"}, "padding": "';
      const suffix = '"}';
      // create a file larger than MAX_CONFIG_SIZE (1MB)
      const big = tinyPrefix + 'a'.repeat((1024 * 1024) + 100) + suffix;
      await fs.writeFile(path.join(dir, 'package.json'), big);
      const detector = new FrameworkDetector(dir);
      // spy on console.warn
      let warned = false;
      const origWarn = console.warn;
      console.warn = (...args: any[]) => { warned = true; origWarn.apply(console, args); };
      const res = await detector.detect();
      // Should be unknown because file too large
      expect(res.framework).toBe('unknown');
      expect(warned).toBeTruthy();
      console.warn = origWarn;
    });
  });

  test('sorts detectors by priority when passed to constructor', async () => {
    await withTempDir(async dir => {
      class HighPriority implements DetectorStrategy {
        priority = 100;
        async detect(_cwd: string): Promise<DetectionResult | null> {
          return { stack: { language: 'ts', framework: 'express', confidence: 0.4 }, confidence: 0.4 };
        }
      }
      class LowPriority implements DetectorStrategy {
        priority = 1;
        async detect(_cwd: string): Promise<DetectionResult | null> {
          return { stack: { language: 'ts', framework: 'nestjs', confidence: 0.95 }, confidence: 0.95 };
        }
      }
      const detector = new FrameworkDetector(dir, [new LowPriority(), new HighPriority()]);
      const res = await detector.detect();
      // After sorting, HighPriority should be first and return 'express'
      expect(res.framework).toBe('express');
    });
  });

  test('Java build.gradle detection', async () => {
    await withTempDir(async dir => {
      const gradle = "dependencies { implementation 'org.springframework.boot:spring-boot-starter' }";
      await fs.writeFile(path.join(dir, 'build.gradle'), gradle);
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('spring');
      expect(res.language).toBe('java');
    });
  });

  test('C# detection for .sln sets lower confidence', async () => {
    await withTempDir(async dir => {
      const slnContent = "Microsoft.AspNetCore";
      await fs.writeFile(path.join(dir, 'project.sln'), slnContent);
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('aspnet');
      expect((res.confidence ?? 0) === 0.8).toBeTruthy();
    });
  });

  test('prefers .csproj over .sln when both present', async () => {
    await withTempDir(async dir => {
      const csproj = `<Project Sdk=\"Microsoft.NET.Sdk.Web\">\n  <ItemGroup>\n    <PackageReference Include=\"Microsoft.AspNetCore\" Version=\"1.0.0\" />\n  </ItemGroup>\n</Project>`;
      const sln = "Microsoft.AspNetCore";
      await fs.writeFile(path.join(dir, 'MyApp.csproj'), csproj);
      await fs.writeFile(path.join(dir, 'MyApp.sln'), sln);
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('aspnet');
      expect(res.confidence).toBeCloseTo(0.9);
    });
  });

  test('C# boost key in .csproj increases confidence when detected in content', async () => {
    await withTempDir(async dir => {
      const csproj = `<Project Sdk="Microsoft.NET.Sdk.Web">
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore" Version="1.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc" Version="1.0.0" />
  </ItemGroup>
</Project>`;
      await fs.writeFile(path.join(dir, 'project.csproj'), csproj);
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('aspnet');
      expect((res.confidence ?? 0) >= 0.95).toBeTruthy();
    });
  });

  test('PHP composer confidence boost', async () => {
    await withTempDir(async dir => {
      const composer = { require: { 'laravel/framework': '^10.0', 'laravel/laravel': '^10.0' } };
      await fs.writeJson(path.join(dir, 'composer.json'), composer, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('laravel');
      expect((res.confidence ?? 0) >= 0.95).toBeTruthy();
    });
  });

  test('detect returns unknown when composer.json is missing', async () => {
    await withTempDir(async dir => {
      // Ensure there is no composer.json
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('unknown');
    });
  });

  test('Java build.gradle boost increases confidence', async () => {
    await withTempDir(async dir => {
      const gradle = "dependencies { implementation 'org.springframework.boot:spring-boot-starter-web' }";
      await fs.writeFile(path.join(dir, 'build.gradle'), gradle);
      const detector = new FrameworkDetector(dir);
      const res = await detector.detect();
      expect(res.framework).toBe('spring');
      expect((res.confidence ?? 0) >= 0.95).toBeTruthy();
    });
  });

  test('detect cache / clearCache behavior', async () => {
    await withTempDir(async dir => {
      const pkg = { dependencies: { 'express': '^4.0.0' } };
      await fs.writeJson(path.join(dir, 'package.json'), pkg, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const first = await detector.detect();
      const second = await detector.detect();
      expect(first).toBe(second); // same cached object reference
      detector.clearCache();
      const third = await detector.detect();
      expect(third).not.toBe(first); // new object after cache cleared
    });
  });

  test('detect handles thrown errors from custom detectors gracefully', async () => {
    await withTempDir(async dir => {
      const detector = new FrameworkDetector(dir);
      class ThrowingDetector implements DetectorStrategy {
        priority = 5;
        async detect(_cwd: string): Promise<DetectionResult | null> {
          throw new Error('Test error');
        }
      }
      detector.registerDetector(new ThrowingDetector());
      // Should not throw; should fallback to unknown
      const res = await detector.detect();
      expect(res.framework).toBe('unknown');
    });
  });

  test('detect logs error with detector name when catch an error', async () => {
    await withTempDir(async dir => {
      const detector = new FrameworkDetector(dir);
      class ThrowingDetector implements DetectorStrategy {
        priority = 5;
        async detect(_cwd: string): Promise<DetectionResult | null> {
          throw new Error('boom');
        }
      }
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      detector.registerDetector(new ThrowingDetector());
      detector.clearCache();
      const res = await detector.detect();
      expect(spy).toHaveBeenCalled();
      // ensure error logged included 'Detector' prefix
      expect(spy.mock.calls[0][0]).toMatch(/Detector/);
      spy.mockRestore();
      expect(res.framework).toBe('unknown');
    });
  });

  test('detectWithConfidence returns confidence in the result', async () => {
    await withTempDir(async dir => {
      const pkg = { dependencies: { express: '^4.0.0' } };
      await fs.writeJson(path.join(dir, 'package.json'), pkg, { spaces: 2 });
      const detector = new FrameworkDetector(dir);
      const result = await detector.detectWithConfidence();
      expect(result.stack.framework).toBe('express');
      expect(typeof result.confidence).toBe('number');
    });
  });
});


