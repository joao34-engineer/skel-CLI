import { Command, Flags, ux } from '@oclif/core';
import inquirer from 'inquirer';
import chalk from 'chalk';

// Import our custom core logic
import { createNewProject } from '../core/file-system.js';

export default class Init extends Command {
  static override description = 'Initialize a new Software Skeleton project';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --name my-project',
  ];

  static override flags = {
    name: Flags.string({ char: 'n', description: 'Name of the project' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init);

    let projectName = flags.name;

    // 1. Use 'inquirer' if the flag is missing
    if (!projectName) {
      const responses = await inquirer.prompt([
        {
          name: 'projectName',
          message: 'What is the name of your project?',
          type: 'input',
          default: 'new-skeleton-project',
        },
      ]);
      projectName = responses.projectName;
    }

    if (!projectName) {
      this.error('Project name is required.', { exit: 1 });
    }

    // 2. Use oclif's built-in UX (replaces ora and chalk)
    this.log(chalk.green(`Initializing new project: ${projectName}`));
    ux.action.start('Scaffolding file structure');

    try {
      // 3. Call our core business logic
      await createNewProject(projectName);

      ux.action.stop('Done!');
      this.log(
        `\nSuccess! Project "${projectName}" created successfully.`
      );

    } catch (error) {
      ux.action.stop('Failed.');
      this.error(error instanceof Error ? error.message : 'An unknown error occurred', {
        exit: 2,
      });
    }
  }
}
