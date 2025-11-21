import { Command } from '@oclif/core';
import fs from 'fs-extra';
import path from 'path';

export default class Info extends Command {
  static override description = 'Display information about the current project';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  public async run(): Promise<void> {
    const configPath = path.join(process.cwd(), 'skeleton.config.json');
    
    if (!await fs.pathExists(configPath)) {
      this.error('Not a skeleton project. Run `skel init` first.');
    }

    const config = await fs.readJson(configPath);
    
    this.log('\n📦 Project Information\n');
    this.log(`  Name: ${config.name}`);
    this.log(`  Version: ${config.version}`);
    this.log(`  Skeletons: ${config.skeletons?.length || 0}`);
    if (config.skeletons?.length > 0) {
      config.skeletons.forEach((s: string) => {
        this.log(`    • ${s}`);
      });
    }
    this.log('');
  }
}
