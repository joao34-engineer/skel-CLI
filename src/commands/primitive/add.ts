import { Command, Flags, ux, Args } from '@oclif/core';
import path from 'path';
import { installPrimitive } from '../../core/file-system.js';
import { FrameworkDetector } from '../../core/frameworks/detector.js';
import { AdapterGenerator } from '../../core/frameworks/adapter-generator.js';

export default class PrimitiveAdd extends Command {
  static override description = 'Add a primitive to your project';

  static override examples = [
    '<%= config.bin %> <%= command.id %> security.hasher',
    '<%= config.bin %> <%= command.id %> security.hasher --version 1.0.0',
  ];

  static override flags = {
    version: Flags.string({
      char: 'v',
      description: 'Version of the primitive to install',
      default: '1.0.0',
    }),
  };

  static override args = {
    primitiveId: Args.string({
      required: true,
      description: 'Primitive ID in format "category.name" (e.g., security.hasher)',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PrimitiveAdd);
    const { primitiveId } = args;

    this.log(
      `Installing primitive: ${primitiveId}@${flags.version}`
    );
    ux.action.start('Fetching primitive...');

    try {
      const projectPath = process.cwd();
      await installPrimitive(projectPath, primitiveId, flags.version);

      ux.action.stop('Done!');
      this.log(
        `\n✓ Primitive "${primitiveId}@${flags.version}" installed successfully!`
      );

      // Framework detection and adapter generation
      const detector = new FrameworkDetector(projectPath);
      const stack = await detector.detect();

      if (stack.framework !== 'unknown') {
        const confidence = Math.round((stack.confidence || 0) * 100);
        this.log(`\n🛡️ Detected Stack: ${stack.framework} (Confidence: ${confidence}%)`);

        try {
          const generator = new AdapterGenerator();
          const targetDir = path.join(projectPath, 'src', 'adapters', primitiveId.replace('.', '/'));
          await generator.generate(primitiveId, stack, targetDir);
          this.log(`✓ Adapter generated at: ${targetDir}`);
        } catch (error) {
          this.log(`⚠️ No adapter found for ${stack.framework}, manual integration required`);
        }
      }

      this.log(
        `\nNext steps:\n- Review the installed primitive in ./primitives/${primitiveId.split('.')[0]}/${primitiveId.split('.')[1]}/`
      );
    } catch (error) {
      ux.action.stop('Failed.');
      this.error(
        error instanceof Error ? error.message : 'An unknown error occurred',
        {
          exit: 2,
        }
      );
    }
  }
}



