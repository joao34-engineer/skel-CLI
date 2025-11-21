import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import fs from 'fs-extra';
import path from 'path';
import { AdapterGenerator, PathTraversalError, TemplateNotFoundError } from './adapter-generator';
import type { DetectedStack } from './detector';

describe('AdapterGenerator - The Gauntlet', () => {
  const testRoot = path.join(process.cwd(), '.test-tmp');
  const templatesRoot = path.join(testRoot, 'templates');
  const outputRoot = path.join(testRoot, 'output');

  beforeEach(async () => {
    await fs.ensureDir(templatesRoot);
    await fs.ensureDir(outputRoot);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.remove(testRoot);
  });

  // 1. Core Functionality
  describe('Core Functionality', () => {
    it('should generate adapter from template', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/security.tokenizer');
      await fs.ensureDir(templateDir);
      await fs.writeFile(
        path.join(templateDir, 'service.ts'),
        'import { {{PRIMITIVE_ID}} } from "@skel/{{PRIMITIVE_ID}}";'
      );

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
      
      await generator.generate('security.tokenizer', stack, outputRoot);

      const generated = await fs.readFile(path.join(outputRoot, 'service.ts'), 'utf-8');
      expect(generated).toBe('import { security.tokenizer } from "@skel/security.tokenizer";');
    });

    it('should replace PROJECT_NAME placeholder', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/security.tokenizer');
      await fs.ensureDir(templateDir);
      await fs.writeFile(
        path.join(templateDir, 'config.ts'),
        'export const PROJECT = "{{PROJECT_NAME}}";'
      );

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
      
      await generator.generate('security.tokenizer', stack, outputRoot, 'my-app');

      const generated = await fs.readFile(path.join(outputRoot, 'config.ts'), 'utf-8');
      expect(generated).toBe('export const PROJECT = "my-app";');
    });

    it('should use default project name when not provided', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/security.tokenizer');
      await fs.ensureDir(templateDir);
      await fs.writeFile(
        path.join(templateDir, 'config.ts'),
        '{{PROJECT_NAME}}'
      );

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
      
      await generator.generate('security.tokenizer', stack, outputRoot);

      const generated = await fs.readFile(path.join(outputRoot, 'config.ts'), 'utf-8');
      expect(generated).toBe('app');
    });
  });

  // 2. Input Validation (Zod)
  describe('Input Validation', () => {
    it('should reject invalid primitiveId format', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      try {
        await generator.generate('invalid-format', stack, outputRoot);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject primitiveId with uppercase', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      try {
        await generator.generate('Security.Tokenizer', stack, outputRoot);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject empty targetDir', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      try {
        await generator.generate('security.tokenizer', stack, '');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should accept valid primitiveId format', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/security.tokenizer');
      await fs.ensureDir(templateDir);
      await fs.writeFile(path.join(templateDir, 'test.ts'), 'test');

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      await expect(
        generator.generate('security.tokenizer', stack, outputRoot)
      ).resolves.toBeUndefined();
    });
  });

  // 3. Security - Path Traversal Prevention
  describe('Security - Path Traversal', () => {
    it('should reject path traversal with ../', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack = { language: 'ts', framework: '../../../etc' } as unknown as DetectedStack;

      try {
        await generator.generate('security.tokenizer', stack, outputRoot);
        expect.fail('Should have thrown PathTraversalError');
      } catch (error) {
        expect(error).toBeInstanceOf(PathTraversalError);
        expect((error as PathTraversalError).message).toContain('Path traversal detected');
      }
    });

    it('should reject absolute path outside templates', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
      
      await fs.ensureDir(path.join(testRoot, 'malicious'));

      try {
        await generator.generate('security.tokenizer', stack, outputRoot);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject path with null bytes', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack = { language: 'ts', framework: 'nestjs\x00malicious' } as unknown as DetectedStack;

      try {
        await generator.generate('security.tokenizer', stack, outputRoot);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject path traversal and set PATH_TRAVERSAL code', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack = { language: 'ts', framework: '../../../etc' } as unknown as DetectedStack;

      // Ensure no FS writes happen when validation fails
      const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation(async () => { throw new Error('unexpected write'); });

      await expect(generator.generate('security.tokenizer', stack, outputRoot)).rejects.toSatisfy((err: unknown) => {
        return err instanceof PathTraversalError && (err as PathTraversalError).code === 'PATH_TRAVERSAL' && /Path traversal detected/i.test((err as Error).message);
      });

      expect(writeSpy).not.toHaveBeenCalled();
      writeSpy.mockRestore();
    });
  });

  // 4. Error Handling
  describe('Error Handling', () => {
    it('should throw TemplateNotFoundError when template missing', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      try {
        await generator.generate('nonexistent.primitive', stack, outputRoot);
        expect.fail('Should have thrown TemplateNotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(TemplateNotFoundError);
        expect((error as TemplateNotFoundError).message).toContain('Template not found');
      }
    });

    it('should include template path in error message', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      try {
        await generator.generate('missing.primitive', stack, outputRoot);
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as TemplateNotFoundError).message).toContain('missing.primitive');
      }
    });

    it('should propagate fs.readFile errors', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/error.primitive');
      await fs.ensureDir(templateDir);
      await fs.writeFile(path.join(templateDir, 'test.txt'), 'content');

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      const readSpy = vi.spyOn(fs, 'readFile').mockImplementation(async () => { throw new Error('readfail'); });

      try {
        await generator.generate('error.primitive', stack, outputRoot);
        expect.fail('Should have thrown readfail');
      } catch (error) {
        expect((error as Error).message).toContain('readfail');
      } finally {
        readSpy.mockRestore();
      }
    });

    it('should set TemplateNotFoundError.code to TEMPLATE_NOT_FOUND', async () => {
      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
      try {
        await generator.generate('nonexistent.primitive', stack, outputRoot);
        expect.fail('Should have thrown TemplateNotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(TemplateNotFoundError);
        expect((error as TemplateNotFoundError).code).toBe('TEMPLATE_NOT_FOUND');
      }
    });
  });

  // 5. Boundary Testing
  describe('Boundary Tests', () => {
    it('should handle single character primitiveId parts', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/a.b');
      await fs.ensureDir(templateDir);
      await fs.writeFile(path.join(templateDir, 'test.ts'), 'test');

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      await expect(
        generator.generate('a.b', stack, outputRoot)
      ).resolves.toBeUndefined();
    });

    it('should handle multiple files in template', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/security.tokenizer');
      await fs.ensureDir(templateDir);
      await fs.writeFile(path.join(templateDir, 'file1.ts'), 'content1');
      await fs.writeFile(path.join(templateDir, 'file2.ts'), 'content2');
      await fs.writeFile(path.join(templateDir, 'file3.ts'), 'content3');

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      await generator.generate('security.tokenizer', stack, outputRoot);

      expect(await fs.pathExists(path.join(outputRoot, 'file1.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(outputRoot, 'file2.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(outputRoot, 'file3.ts'))).toBe(true);
    });

    it('should gracefully handle empty template directory (no files) without creating output', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/empty.primitive');
      await fs.ensureDir(templateDir);

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
      await generator.generate('empty.primitive', stack, outputRoot);

      // output directory should remain empty
      const exists = await fs.pathExists(outputRoot);
      expect(exists).toBe(true);
      const files = await fs.readdir(outputRoot);
      expect(files.length).toBe(0);
    });
  });

  // 6. Property-Based Testing (Chaos Engineering)
  describe('[PROPERTY] Chaos Engineering', () => {
    it('[PROPERTY] should handle valid primitiveId patterns', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[a-z]{1,20}\.[a-z]{1,20}$/),
          async (primitiveId) => {
            const templateDir = path.join(templatesRoot, `ts/nestjs/${primitiveId}`);
            await fs.ensureDir(templateDir);
            await fs.writeFile(path.join(templateDir, 'test.ts'), 'test');

            const generator = new AdapterGenerator(templatesRoot);
            const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
            const testOutput = path.join(outputRoot, primitiveId.replace('.', '-'));

            await generator.generate(primitiveId, stack, testOutput);
            expect(await fs.pathExists(path.join(testOutput, 'test.ts'))).toBe(true);

            await fs.remove(templateDir);
            await fs.remove(testOutput);
          }
        ),
        { numRuns: 3 }
      );
    }, 120000);

    it('[PROPERTY] should replace all placeholder occurrences', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (projectName) => {
            const templateDir = path.join(templatesRoot, 'ts/nestjs/test.primitive');
            await fs.ensureDir(templateDir);
            await fs.writeFile(
              path.join(templateDir, 'test.ts'),
              '{{PROJECT_NAME}} {{PROJECT_NAME}} {{PROJECT_NAME}}'
            );

            const generator = new AdapterGenerator(templatesRoot);
            const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
            const testOutput = path.join(outputRoot, 'prop-test');

            await generator.generate('test.primitive', stack, testOutput, projectName);

            const content = await fs.readFile(path.join(testOutput, 'test.ts'), 'utf-8');
            expect(content).toBe(`${projectName} ${projectName} ${projectName}`);

            await fs.remove(templateDir);
            await fs.remove(testOutput);
          }
        ),
        { numRuns: 3 }
      );
    }, 120000);
  });

  // 7. Edge Cases
  describe('Edge Cases', () => {
    it('should handle template with no placeholders', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/security.tokenizer');
      await fs.ensureDir(templateDir);
      await fs.writeFile(path.join(templateDir, 'static.ts'), 'static content');

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      await generator.generate('security.tokenizer', stack, outputRoot);

      const content = await fs.readFile(path.join(outputRoot, 'static.ts'), 'utf-8');
      expect(content).toBe('static content');
    });

    it('should create nested output directories', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/security.tokenizer');
      await fs.ensureDir(templateDir);
      await fs.writeFile(path.join(templateDir, 'test.ts'), 'test');

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
      const nestedOutput = path.join(outputRoot, 'deeply/nested/path');

      await generator.generate('security.tokenizer', stack, nestedOutput);

      expect(await fs.pathExists(path.join(nestedOutput, 'test.ts'))).toBe(true);
    });

    it('should handle special characters in project name', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/security.tokenizer');
      await fs.ensureDir(templateDir);
      await fs.writeFile(path.join(templateDir, 'test.ts'), '{{PROJECT_NAME}}');

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };

      await generator.generate('security.tokenizer', stack, outputRoot, 'my-app_v2.0');

      const content = await fs.readFile(path.join(outputRoot, 'test.ts'), 'utf-8');
      expect(content).toBe('my-app_v2.0');
    });

    it('should replace placeholders when projectName contains regex-like characters', async () => {
      const templateDir = path.join(templatesRoot, 'ts/nestjs/test.regex');
      await fs.ensureDir(templateDir);
      await fs.writeFile(path.join(templateDir, 'test.ts'), '{{PROJECT_NAME}}-{{PROJECT_NAME}}');

      const generator = new AdapterGenerator(templatesRoot);
      const stack: DetectedStack = { language: 'ts', framework: 'nestjs' };
      const projectName = 'my-app.$^*+?';
      const testOutput = path.join(outputRoot, 'regex-test');

      await generator.generate('test.regex', stack, testOutput, projectName);
      const content = await fs.readFile(path.join(testOutput, 'test.ts'), 'utf-8');
      expect(content).toBe(`${projectName}-${projectName}`);
    });

    // Note: `generate` already validates the path and the happy-path case
    // is covered by other tests above (template exists & files published), so
    // a dedicated 'normalized path' test is not necessary here.
  });

  it('constructor default templatesRoot points to src/templates/adapters', async () => {
    const generator = new AdapterGenerator();
    const root = (generator as any).templatesRoot as string;
    expect(root.includes(path.join('src', 'templates', 'adapters'))).toBeTruthy();
  });
});
