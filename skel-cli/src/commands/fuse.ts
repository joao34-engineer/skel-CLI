import { Command, Flags, ux } from '@oclif/core';
import inquirer from 'inquirer';
import chalk from 'chalk';

export default class Fuse extends Command {
  static override description = 'Fuse multiple skeleton components together';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --skeletons auth-jwt,express-base',
  ];

  static override flags = {
    skeletons: Flags.string({ char: 's', description: 'Comma-separated list of skeletons to fuse' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Fuse);

    let skeletonsStr = flags.skeletons;

    // 1. Use 'inquirer' if the flag is missing
    if (!skeletonsStr) {
      const responses = await inquirer.prompt([
        {
          name: 'skeletons',
          message: 'Which skeletons would you like to fuse?',
          type: 'checkbox',
          choices: ['auth-jwt', 'express-base', 'database'],
          validate: (answer: string[]) => answer.length > 0 || 'Select at least one skeleton',
        },
      ]);
      skeletonsStr = responses.skeletons.join(',');
    }

    if (!skeletonsStr) {
      this.error('At least one skeleton is required.', { exit: 1 });
    }

    const skeletons = skeletonsStr.split(',').map((s: string) => s.trim());

    // 2. Use oclif's built-in UX
    this.log(chalk.green(`Fusing skeletons: ${skeletons.join(', ')}`));
    ux.action.start('Merging skeleton components');

    try {
      // TODO: Call core business logic to fuse skeletons
      // await fuseSkeletons(skeletons);

      ux.action.stop('Done!');
      this.log(
        `\nSuccess! Skeletons fused successfully.`
      );

    } catch (error) {
      ux.action.stop('Failed.');
      this.error(error instanceof Error ? error.message : 'An unknown error occurred', {
        exit: 2,
      });
    }
  }
}

