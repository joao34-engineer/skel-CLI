import { Command, Flags, ux } from '@oclif/core';
import inquirer from 'inquirer';
import chalk from 'chalk';

export default class Add extends Command {
  static override description = 'Add a skeleton component to an existing project';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --skeleton auth-jwt',
  ];

  static override flags = {
    skeleton: Flags.string({ char: 's', description: 'Name of the skeleton to add' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Add);

    let skeletonName = flags.skeleton;

    // 1. Use 'inquirer' if the flag is missing
    if (!skeletonName) {
      const responses = await inquirer.prompt([
        {
          name: 'skeleton',
          message: 'Which skeleton would you like to add?',
          type: 'list',
          choices: ['auth-jwt', 'express-base', 'database'],
          default: 'auth-jwt',
        },
      ]);
      skeletonName = responses.skeleton;
    }

    if (!skeletonName) {
      this.error('Skeleton name is required.', { exit: 1 });
    }

    // 2. Use oclif's built-in UX
    this.log(chalk.green(`Adding skeleton: ${skeletonName}`));
    ux.action.start('Integrating skeleton component');

    try {
      // TODO: Call core business logic to add skeleton
      // await addSkeleton(skeletonName);

      ux.action.stop('Done!');
      this.log(
        `\nSuccess! Skeleton "${skeletonName}" added to your project.`
      );

    } catch (error) {
      ux.action.stop('Failed.');
      this.error(error instanceof Error ? error.message : 'An unknown error occurred', {
        exit: 2,
      });
    }
  }
}
