import fs from 'fs-extra';
import { execa } from 'execa';
import archiver from 'archiver';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type QueueItem = {
  id: string;
  version: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
};

class FactoryRunner {
  private queue: QueueItem[] = [];

  async loadQueue() {
    const queuePath = path.resolve(__dirname, '../factory.queue.json');
    this.queue = await fs.readJson(queuePath);
  }

  private async generateStrykerConfig(folder: string): Promise<void> {
    const strykerConfig = `export default {
  testRunner: 'vitest',
  checkers: ['typescript'],
  mutate: ['src/index.ts'],
  tsconfigFile: 'tsconfig.json',
  plugins: ['@stryker-mutator/vitest-runner', '@stryker-mutator/typescript-checker'],
  reporters: ['html', 'clear-text'],
  timeoutMS: 180000,
  timeoutFactor: 1.5,
  ignoreStatic: true,
  thresholds: { high: 85, low: 70, break: 70 }
};`;
    await fs.writeFile(path.join(folder, 'stryker.conf.js'), strykerConfig);
  }

  private async generateVitestConfig(folder: string): Promise<void> {
    const vitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 180000,
    hookTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});`;
    await fs.writeFile(path.join(folder, 'vitest.config.ts'), vitestConfig);
  }

  private async generateTsconfig(folder: string): Promise<void> {
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022'],
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: './dist',
        rootDir: './src'
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
    await fs.writeJson(path.join(folder, 'tsconfig.json'), tsconfig, { spaces: 2 });
  }

  private async generateBiomeConfig(folder: string): Promise<void> {
    const biomeConfig = {
      $schema: "https://biomejs.dev/schemas/2.3.6/schema.json",
      formatter: {
        enabled: true,
        indentWidth: 2,
        lineWidth: 100
      },
      linter: {
        enabled: true,
        rules: {
          recommended: true
        }
      }
    };
    await fs.writeJson(path.join(folder, 'biome.json'), biomeConfig, { spaces: 2 });
  }

  async processItem(item: QueueItem) {
    const idParts = item.id.split('.');
    if (idParts.length !== 2) {
      throw new Error(`Invalid primitive id format: "${item.id}". Expected format: "category.name"`);
    }
    const [category, name] = idParts;
    const folder = path.resolve(__dirname, `../primitives/${category}/${name}/${item.version}`);

    console.log(chalk.blue(`⚙️  Scaffolding ${item.id}@${item.version}...`));

    try {
      await fs.ensureDir(folder);
      const srcDir = path.join(folder, 'src');
      await fs.ensureDir(srcDir);

      // Create package.json
      const packageJson = {
        name: `@skel/${item.id}`,
        version: item.version,
        description: item.description,
        type: 'module',
        scripts: {
          test: 'vitest run',
          lint: 'biome check .',
          format: 'biome format . --write'
        },
        devDependencies: {
          vitest: '^4.0.10',
          '@vitest/ui': '^4.0.10',
          '@biomejs/biome': '^2.3.6',
          '@stryker-mutator/core': '^9.3.0',
          '@stryker-mutator/vitest-runner': '^9.3.0',
          '@stryker-mutator/typescript-checker': '^9.3.0',
          'fast-check': '^4.3.0',
          zod: '^4.1.12',
          typescript: '^5.0.0',
          '@types/node': '^24.0.0'
        },
        plugins: ['@stryker-mutator/vitest-runner', '@stryker-mutator/typescript-checker']
      };

      await fs.writeJson(path.join(folder, 'package.json'), packageJson, { spaces: 2 });

      // Create primitive.json
      const primitiveJson = {
        id: item.id,
        version: item.version,
        description: item.description
      };

      await fs.writeJson(path.join(folder, 'primitive.json'), primitiveJson, { spaces: 2 });

      // Generate config files
      await this.generateTsconfig(folder);
      await this.generateVitestConfig(folder);
      await this.generateBiomeConfig(folder);
      await this.generateStrykerConfig(folder);

      console.log(chalk.green('✅ Scaffolded'));

      console.log(chalk.yellow('🤖 Mock Generation...'));

      // Generate index.ts with category-specific content
      const indexTs = this.generateMockCode(category, name);
      await fs.writeFile(path.join(srcDir, 'index.ts'), indexTs);

      // Generate index.test.ts
      const indexTestTs = this.generateMockTest(category, name);
      await fs.writeFile(path.join(srcDir, 'index.test.ts'), indexTestTs);

      console.log(chalk.green('✅ Generated'));

      console.log(chalk.red('⚔️  Running Gauntlet...'));

      // Install dependencies
      console.log(chalk.dim('  📦 Installing dependencies...'));
      await execa('npm', ['install'], { cwd: folder });

      // Run linter (apply formatting first)
      console.log(chalk.dim('  🧹 Formatting source...'));
      await execa('npx', ['biome', 'format', '.', '--write'], { cwd: folder });
      console.log(chalk.dim('  🔍 Linting...'));
      await execa('npx', ['biome', 'check', '.'], { cwd: folder });

      // Unified error handling for testing
      try {
        console.log(chalk.dim('  ✔️  Running tests...'));
        await execa('npm', ['test'], { cwd: folder });
      } catch (error) {
        throw new Error(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      try {
        console.log(chalk.dim('  🧬 Running mutation testing...'));
        await execa('npx', ['stryker', 'run'], { cwd: folder });
      } catch (error) {
        throw new Error(`Mutation testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.log(chalk.green('✅ Gauntlet passed'));

      console.log(chalk.magenta('📦 Publishing...'));

      const vaultDir = path.resolve(__dirname, '../dist/vault');
      await fs.ensureDir(vaultDir);
      const zipPath = path.join(vaultDir, `${item.id}.v${item.version}.zip`);

      // Create a promise to handle the archive stream completion
      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Handle stream errors
        output.on('error', (error) => {
          reject(new Error(`Write stream error: ${error.message}`));
        });

        archive.on('error', (error) => {
          reject(new Error(`Archive error: ${error.message}`));
        });

        // When archive finishes, the stream will close and resolve
        output.on('close', () => {
          resolve();
        });

        archive.pipe(output);
        archive.directory(folder, false);
        archive.finalize();
      });

      console.log(chalk.green('✅ Published'));

      // Update queue - mark as completed
      item.status = 'completed';
      const queuePath = path.resolve(__dirname, '../factory.queue.json');
      await fs.writeJson(queuePath, this.queue, { spaces: 2 });
      console.log(chalk.cyan(`✓ Queue updated: ${item.id} marked as completed`));
    } catch (error) {
      console.error(chalk.red('❌ Gauntlet failed'), error instanceof Error ? error.message : error);

      // Mark as failed in queue
      item.status = 'failed';
      const queuePath = path.resolve(__dirname, '../factory.queue.json');
      await fs.writeJson(queuePath, this.queue, { spaces: 2 });
      console.log(chalk.red(`✗ Queue updated: ${item.id} marked as failed`));

      const keepFailed = process.env.KEEP_FAILED_ARTIFACTS === '1';
      if (keepFailed) {
        console.log(chalk.yellow(`⚠️  Preserving failed build artifacts for inspection: ${folder}`));
      } else {
        // Attempt cleanup on failure
        try {
          await fs.remove(folder);
          console.log(chalk.yellow(`⚠️  Cleaned up failed build: ${folder}`));
        } catch (cleanupError) {
          console.error(chalk.red('❌ Cleanup failed'), cleanupError instanceof Error ? cleanupError.message : cleanupError);
        }
      }
    }
  }

  private generateMockCode(category: string, name: string): string {
    if (category === 'security' && name === 'tokenizer') {
      const code = [
        'import { z } from \'zod\';',
        '',
        'export const CONFIG = {',
        '  maxTokenLength: 512,',
        '  algorithms: [\'HS256\', \'RS256\'] as const,',
        '  version: \'1.0.0\'',
        '};',
        '',
        'const TokenInputSchema = z.object({',
        '  payload: z.string().min(1).max(CONFIG.maxTokenLength),',
        '  algorithm: z.enum(CONFIG.algorithms)',
        '});',
        '',
        'const TokenSchema = z.string().min(1);',
        'const AlgorithmSchema = z.enum(CONFIG.algorithms);',
        '',
        'export function sign(payload: string, algorithm: typeof CONFIG.algorithms[number]): string {',
        '  try {',
        '    TokenInputSchema.parse({ payload, algorithm });',
        '    return `${payload}.${algorithm}.${CONFIG.version}`;',
        '  } catch (error) {',
        '    throw new Error(`Sign failed: ${error instanceof Error ? error.message : \'Unknown error\'}`);',
        '  }',
        '}',
        '',
        'export function verify(token: string, algorithm: typeof CONFIG.algorithms[number]): boolean {',
        '  try {',
        '    TokenSchema.parse(token);',
        '    AlgorithmSchema.parse(algorithm);',
        '    return token.endsWith(CONFIG.version);',
        '  } catch (error) {',
        '    throw new Error(`Verify failed: ${error instanceof Error ? error.message : \'Unknown error\'}`);',
        '  }',
        '}',
      ];
      return code.join('\n');
    } else if (category === 'utils' && name === 'uuid') {
      const code = [
        'import { z } from \'zod\';',
        '',
        'export const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;',
        'export const CONFIG = { version: \'1.0.0\' };',
        '',
        'const UUIDInputSchema = z.string().min(1).regex(UUID_V7_REGEX, \'Invalid UUID v7 format\');',
        '',
        'function toHex(n: number, length: number): string {',
        '  return n.toString(16).padStart(length, \'0\');',
        '}',
        '',
        'function pseudoRandomHex(length: number): string {',
        '  let out = \'\';',
        '  while (out.length < length) out += Math.random().toString(16).slice(2);',
        '  return out.slice(0, length);',
        '}',
        '',
        'export function generateV7(): string {',
        '  const time = toHex(Date.now(), 12).slice(-12);',
        '  const rand = pseudoRandomHex(34);',
        '  const part1 = time.slice(0, 8);',
        '  const part2 = time.slice(8, 12);',
        '  const part3 = `7${rand.slice(0, 3)}`; // version 7',
        '  const variantNibble = (parseInt(rand.slice(3, 4), 16) & 0x3) | 0x8; // variant bits 10xx',
        '  const part4 = `${variantNibble.toString(16)}${rand.slice(4, 7)}`;',
        '  const part5 = rand.slice(7, 19);',
        '  return `${part1}-${part2}-${part3}-${part4}-${part5}`;',
        '}',
        '',
        'export function validateFormat(uuid: string): boolean {',
        '  try {',
        '    UUIDInputSchema.parse(uuid);',
        '    return true;',
        '  } catch {',
        '    return false;',
        '  }',
        '}',
      ];
      return code.join('\n');
    }
    const code = [
      'import { z } from \'zod\';',
      '',
      'const InputSchema = z.string().min(1);',
      '',
      'export function process(input: string): string {',
      '  try {',
      '    InputSchema.parse(input);',
      '    return input.toUpperCase();',
      '  } catch (error) {',
      '    throw new Error(`Process failed: ${error instanceof Error ? error.message : \'Unknown error\'}`);',
      '  }',
      '}',
    ];
    return code.join('\n');
  }

  private generateMockTest(category: string, name: string): string {
    if (category === 'security' && name === 'tokenizer') {
      const test = [
        'import fc from \'fast-check\';',
        'import { describe, expect, it } from \'vitest\';',
        'import { CONFIG, sign, verify } from \'./index\';',
        '',
        'describe(\'SkelTokenizer\', () => {',
        '  it(\'sign adds algorithm and version\', () => {',
        '    const token = sign(\'payload\', \'HS256\');',
        '    expect(token).toContain(\'.HS256.\');',
        '    expect(token.endsWith(CONFIG.version)).toBe(true);',
        '  });',
        '  it(\'verify returns true for valid token\', () => {',
        '    const token = sign(\'data\', \'RS256\');',
        '    expect(verify(token, \'RS256\')).toBe(true);',
        '  });',
        '  it(\'verify returns false for invalid token\', () => {',
        '    expect(verify(\'invalid.token.0.0.0\', \'HS256\')).toBe(false);',
        '  });',
        '  it(\'sign throws on empty payload\', () => {',
        '    expect(() => sign(\'\', \'HS256\')).toThrow(/Sign failed/);',
        '  });',
        '  it(\'verify throws on empty token\', () => {',
        '    expect(() => verify(\'\', \'HS256\')).toThrow(/Verify failed/);',
        '  });',
        '  it(\'verify error message contains details\', () => {',
        '    try {',
        '      verify(\'\', \'HS256\');',
        '      expect.fail(\'Should have thrown\');',
        '    } catch (error) {',
        '      expect(error).toBeInstanceOf(Error);',
        '      expect((error as Error).message).toContain(\'Verify failed\');',
        '    }',
        '  });',
        '  it(\'[PROPERTY] signed tokens end with version\', () => {',
        '    fc.assert(',
        '      fc.property(',
        '        fc.string({ minLength: 1, maxLength: 100 }),',
        '        fc.constantFrom(...CONFIG.algorithms),',
        '        (payload, alg) => {',
        '          const t = sign(payload, alg);',
        '          expect(t.endsWith(CONFIG.version)).toBe(true);',
        '        }',
        '      ),',
        '      { numRuns: 3 }',
        '    );',
        '  }, 120000);',
        '});',
      ];
      return test.join('\n');
    } else if (category === 'utils' && name === 'uuid') {
      const test = [
        'import fc from \'fast-check\';',
        'import { describe, expect, it } from \'vitest\';',
        'import { generateV7, UUID_V7_REGEX, validateFormat } from \'./index\';',
        '',
        'describe(\'SkelUUID\', () => {',
        '  it(\'generates valid pattern\', () => {',
        '    const id = generateV7();',
        '    expect(UUID_V7_REGEX.test(id)).toBe(true);',
        '  });',
        '  it(\'validateFormat returns true for generated id\', () => {',
        '    const id = generateV7();',
        '    expect(validateFormat(id)).toBe(true);',
        '  });',
        '  it(\'validateFormat returns false for invalid\', () => {',
        '    expect(validateFormat(\'not-a-uuid\')).toBe(false);',
        '  });',
        '  it(\'[PROPERTY] many generated ids match regex\', () => {',
        '    fc.assert(',
        '      fc.property(fc.integer({ min: 1, max: 3 }), () => {',
        '        const id = generateV7();',
        '        expect(UUID_V7_REGEX.test(id)).toBe(true);',
        '      }),',
        '      { numRuns: 3 }',
        '    );',
        '  }, 120000);',
        '});',
      ];
      return test.join('\n');
    }
    const test = [
      'import fc from \'fast-check\';',
      'import { describe, expect, it } from \'vitest\';',
      'import { process } from \'./index\';',
      '',
      'describe(\'process primitive\', () => {',
      '  it(\'uppercases\', () => {',
      '    expect(process(\'hello\')).toBe(\'HELLO\');',
      '  });',
      '  it(\'throws on empty\', () => {',
      '    expect(() => process(\'\')).toThrow(/Process failed/);',
      '  });',
      '  it(\'[PROPERTY] uppercase stable\', () => {',
      '    fc.assert(',
      '      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (s) => {',
      '        expect(process(s)).toBe(s.toUpperCase());',
      '      }),',
      '      { numRuns: 3 }',
      '    );',
      '  }, 120000);',
      '});',
    ];
    return test.join('\n');
  }

  async run() {
    console.log(chalk.bold.cyan('🏭 SkelFactory Engine Starting...\n'));
    await this.loadQueue();

    const pendingItems = this.queue.filter(item => item.status === 'pending');
    console.log(chalk.cyan(`Found ${pendingItems.length} pending items\n`));

    for (const item of pendingItems) {
      console.log(chalk.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      await this.processItem(item);
    }

    console.log(chalk.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold.green('\n✅ Factory run complete!\n'));
  }
}

const runner = new FactoryRunner();
(async () => {
  await runner.run();
})().catch(console.error);
