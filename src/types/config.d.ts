export interface SkeletonConfig {
  name: string;
  version: string;
  skeletons: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    author?: string;
  };
}
