export const validateProjectName = (name: string): string | true => {
  if (!name || name.trim().length === 0) {
    return 'Project name cannot be empty';
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return 'Project name can only contain letters, numbers, hyphens, and underscores';
  }
  if (name.length > 50) {
    return 'Project name must be less than 50 characters';
  }
  return true;
};
