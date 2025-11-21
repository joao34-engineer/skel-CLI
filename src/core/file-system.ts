import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getPrimitivesPath = (): string => {
  const cliRoot = path.resolve(__dirname, '../..');
  return path.join(cliRoot, 'primitives');
};

export const createNewProject = async (projectName: string): Promise<void> => {
  const projectPath = path.join(process.cwd(), projectName);
  await fs.ensureDir(projectPath);
  
  const config = {
    name: projectName,
    version: '1.0.0',
    skeletons: [],
    dependencies: {},
    devDependencies: {},
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };
  
  await fs.writeJson(path.join(projectPath, 'skeleton.config.json'), config, { spaces: 2 });
};

/**
 * Install a primitive into the project
 * Primitives are framework-agnostic logic units with immutable versioning
 *
 * @param projectPath - Path to the project root
 * @param primitiveId - Primitive ID in format "category.name" (e.g., "security.hasher")
 * @param version - Version to install (e.g., "1.0.0"). Defaults to "1.0.0"
 */
export const installPrimitive = async (
  projectPath: string,
  primitiveId: string,
  version: string = '1.0.0'
): Promise<void> => {
  const [category, name] = primitiveId.split('.');

  if (!category || !name) {
    throw new Error(
      `Invalid primitive ID format. Expected "category.name", got "${primitiveId}"`
    );
  }

  const primitivePath = path.join(getPrimitivesPath(), category, name, version);

  if (!(await fs.pathExists(primitivePath))) {
    throw new Error(
      `Primitive not found: ${primitiveId}@${version} at path ${primitivePath}`
    );
  }

  // Ensure primitives directory exists in project
  const projectPrimitivesDir = path.join(projectPath, 'primitives', category, name, version);
  await fs.ensureDir(projectPrimitivesDir);

  // Copy primitive files
  const files = ['index.ts', 'index.test.ts', 'primitive.json'];
  for (const file of files) {
    const source = path.join(primitivePath, file);
    if (await fs.pathExists(source)) {
      const dest = path.join(projectPrimitivesDir, file);
      await fs.copy(source, dest);
    }
  }

  // Update configuration
  const configPath = path.join(projectPath, 'skeleton.config.json');
  const config = await fs.readJson(configPath);

  // Initialize primitives array if not present
  if (!config.primitives) {
    config.primitives = [];
  }

  // Add primitive to config if not already present
  const primitiveRecord = `${primitiveId}@${version}`;
  if (!config.primitives.includes(primitiveRecord)) {
    config.primitives.push(primitiveRecord);
  }

  config.metadata.updatedAt = new Date().toISOString();
  await fs.writeJson(configPath, config, { spaces: 2 });
};

/**
 * List all available primitives
 * Scans the primitives directory and returns metadata
 */
export const listPrimitives = async (): Promise<
  Array<{
    id: string;
    version: string;
    description: string;
  }>
> => {
  const primitivesPath = getPrimitivesPath();

  if (!(await fs.pathExists(primitivesPath))) {
    return [];
  }

  const primitives: Array<{
    id: string;
    version: string;
    description: string;
  }> = [];

  const categories = await fs.readdir(primitivesPath);

  for (const category of categories) {
    const categoryPath = path.join(primitivesPath, category);
    const stat = await fs.stat(categoryPath);

    if (!stat.isDirectory()) continue;

    const names = await fs.readdir(categoryPath);

    for (const name of names) {
      const namePath = path.join(categoryPath, name);
      const nameStat = await fs.stat(namePath);

      if (!nameStat.isDirectory()) continue;

      const versions = await fs.readdir(namePath);

      for (const version of versions) {
        const versionPath = path.join(namePath, version);
        const versionStat = await fs.stat(versionPath);

        if (!versionStat.isDirectory()) continue;

        const manifestPath = path.join(versionPath, 'primitive.json');
        if (await fs.pathExists(manifestPath)) {
          const manifest = await fs.readJson(manifestPath);
          primitives.push({
            id: `${category}.${name}`,
            version,
            description: manifest.description || 'No description',
          });
        }
      }
    }
  }

  return primitives;
};


