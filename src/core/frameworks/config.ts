export interface FrameworkConfig {
  key: string;
  name: string;
  priority?: number;
  confidenceBoost?: string[];
}

export interface DataLayerConfig {
  key: string;
  type: 'mongo' | 'postgres' | 'graphql';
  priority?: number;
}

export interface DetectorConfig {
  frameworks: FrameworkConfig[];
  dataLayers?: DataLayerConfig[];
}

// Node.js/TypeScript frameworks
export const NODE_FRAMEWORKS: FrameworkConfig[] = [
  { key: '@nestjs/core', name: 'nestjs', priority: 10, confidenceBoost: ['@nestjs/cli', 'nest-cli.json'] },
  { key: 'next', name: 'nextjs', priority: 9, confidenceBoost: ['react'] },
  { key: '@angular/core', name: 'angular', priority: 8, confidenceBoost: ['@angular/cli'] },
  { key: 'express', name: 'express', priority: 5 }
];

// Python frameworks
export const PYTHON_FRAMEWORKS: FrameworkConfig[] = [
  { key: 'django', name: 'django', priority: 10 },
  { key: 'fastapi', name: 'fastapi', priority: 9 },
  { key: 'flask', name: 'flask', priority: 7 }
];

// C# frameworks
export const CSHARP_FRAMEWORKS: FrameworkConfig[] = [
  { key: 'Microsoft.AspNetCore', name: 'aspnet', priority: 10, confidenceBoost: ['Microsoft.AspNetCore.Mvc'] }
];

// Java frameworks
export const JAVA_FRAMEWORKS: FrameworkConfig[] = [
  { key: 'spring-boot-starter', name: 'spring', priority: 10, confidenceBoost: ['spring-boot-starter-web'] }
];

// PHP frameworks
export const PHP_FRAMEWORKS: FrameworkConfig[] = [
  { key: 'laravel/framework', name: 'laravel', priority: 10, confidenceBoost: ['laravel/laravel'] }
];

// Data layer configurations
export const DATA_LAYERS: DataLayerConfig[] = [
  { key: 'mongoose', type: 'mongo', priority: 10 },
  { key: 'mongodb', type: 'mongo', priority: 9 },
  { key: 'pg', type: 'postgres', priority: 10 },
  { key: 'postgres', type: 'postgres', priority: 9 },
  { key: 'typeorm', type: 'postgres', priority: 8 },
  { key: 'graphql', type: 'graphql', priority: 10 },
  { key: 'apollo-server', type: 'graphql', priority: 9 }
];

// Helper function to get data layer type by package name
export function getDataLayerType(packageName: string): 'mongo' | 'postgres' | 'graphql' | undefined {
  const config = DATA_LAYERS.find(dl => dl.key === packageName);
  return config?.type;
}

// Validation helper for framework configuration
export function validateFrameworkConfig(config: FrameworkConfig): boolean {
  return !!(config.key && config.name && typeof config.priority === 'number');
}

// Export all configs grouped by language (aligned with detector.ts)
export const DETECTOR_CONFIGS: Record<string, DetectorConfig> = {
  node: {
    frameworks: NODE_FRAMEWORKS,
    dataLayers: DATA_LAYERS
  },
  python: {
    frameworks: PYTHON_FRAMEWORKS
  },
  csharp: {
    frameworks: CSHARP_FRAMEWORKS
  },
  java: {
    frameworks: JAVA_FRAMEWORKS
  },
  php: {
    frameworks: PHP_FRAMEWORKS
  }
};
