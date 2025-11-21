export class SkelError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SkelError';
  }
}

export class PrimitiveNotFoundError extends SkelError {
  constructor(primitiveId: string) {
    super(`Primitive '${primitiveId}' not found`, 'PRIMITIVE_NOT_FOUND');
  }
}

export class InvalidProjectError extends SkelError {
  constructor() {
    super('Not a valid skel project', 'INVALID_PROJECT');
  }
}

export class ProjectExistsError extends SkelError {
  constructor(projectName: string) {
    super(`Project '${projectName}' already exists`, 'PROJECT_EXISTS');
  }
}
