import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';
import { DetectedStack } from './detector';
import { SkelError } from '../errors';

const InputSchema = z.object({
  primitiveId: z.string().regex(/^[a-z]+\.[a-z]+$/),
  stack: z.object({
    language: z.enum(['ts', 'csharp', 'java', 'python', 'php', 'unknown']),
    framework: z.string(),
  }),
  targetDir: z.string().min(1),
});

export class PathTraversalError extends SkelError {
  constructor(attemptedPath: string) {
    super(`Path traversal detected: ${attemptedPath}`, 'PATH_TRAVERSAL');
  }
}

export class TemplateNotFoundError extends SkelError {
  constructor(templatePath: string) {
    super(`Template not found: ${templatePath}`, 'TEMPLATE_NOT_FOUND');
  }
}

export class AdapterGenerator {
  private templatesRoot: string;

  constructor(templatesRoot?: string) {
    this.templatesRoot = path.resolve(templatesRoot || path.join(__dirname, '../../../src/templates/adapters'));
  }

  private validatePath(templatePath: string): void {
    const resolved = path.resolve(path.normalize(templatePath));
    if (!resolved.startsWith(this.templatesRoot)) {
      throw new PathTraversalError(templatePath);
    }
  }

  private renderTemplate(content: string, variables: Record<string, string>): string {
    let rendered = content;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return rendered;
  }

  async generate(primitiveId: string, stack: DetectedStack, targetDir: string, projectName?: string): Promise<void> {
    const input = InputSchema.parse({ primitiveId, stack, targetDir });

    const templatePath = path.join(
      this.templatesRoot,
      input.stack.language,
      input.stack.framework,
      input.primitiveId
    );

    this.validatePath(templatePath);

    if (!(await fs.pathExists(templatePath))) {
      throw new TemplateNotFoundError(templatePath);
    }

    const files = await fs.readdir(templatePath);
    
    for (const file of files) {
      const srcPath = path.join(templatePath, file);
      this.validatePath(srcPath);

      const content = await fs.readFile(srcPath, 'utf-8');
      const rendered = this.renderTemplate(content, {
        PROJECT_NAME: projectName || 'app',
        PRIMITIVE_ID: primitiveId,
      });

      const destPath = path.join(targetDir, file);
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, rendered, 'utf-8');
    }
  }
}
