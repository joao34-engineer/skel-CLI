import { Command, ux } from '@oclif/core';
import { listPrimitives } from '../../core/file-system.js';

export default class PrimitiveList extends Command {
  static override description = 'List all available primitives';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  public async run(): Promise<void> {
    await this.parse(PrimitiveList);
    this.log('Available Primitives:');
    this.log('');

    try {
      const primitives = await listPrimitives();

      if (primitives.length === 0) {
        this.log('No primitives found.');
        return;
      }

      for (const primitive of primitives) {
        this.log(
          `  ${primitive.id}@${primitive.version}`
        );
        this.log(
          `    ${primitive.description}`
        );
        this.log('');
      }
    } catch (error) {
      this.error(
        error instanceof Error ? error.message : 'An unknown error occurred',
        {
          exit: 2,
        }
      );
    }
  }
}

