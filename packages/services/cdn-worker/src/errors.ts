import { Response } from '@whatwg-node/fetch';

const description = `Please refer to the documentation for more details: https://docs.graphql-hive.com/features/registry-usage`;

export class MissingTargetIDErrorResponse extends Response {
  constructor() {
    super(
      JSON.stringify({
        code: 'MISSING_TARGET_ID',
        error: `Missing Hive target ID in request params.`,
        description,
      }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
}

export class InvalidArtifactTypeResponse extends Response {
  constructor(artifactType: string) {
    super(
      JSON.stringify({
        code: 'INVALID_ARTIFACT_TYPE',
        error: `Invalid artifact type: "${artifactType}"`,
        description,
      }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
}

export class MissingAuthKeyResponse extends Response {
  constructor() {
    super(
      JSON.stringify({
        code: 'MISSING_AUTH_KEY',
        error: `Hive CDN authentication key is missing`,
        description,
      }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
}

export class InvalidAuthKeyResponse extends Response {
  constructor() {
    super(
      JSON.stringify({
        code: 'INVALID_AUTH_KEY',
        error: `Hive CDN authentication key is invalid, or it does not match the requested target ID.`,
        description,
      }),
      {
        status: 403,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
}

export class CDNArtifactNotFound extends Response {
  constructor(artifactType: string, targetId: string) {
    super(
      JSON.stringify({
        code: 'NOT_FOUND',
        error: `Hive CDN was unable to find an artifact of type "${artifactType}" for target "${targetId}"`,
        description,
      }),
      {
        status: 404,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
}

export class InvalidArtifactMatch extends Response {
  constructor(artifactType: string, targetId: string) {
    super(
      JSON.stringify({
        code: 'INVALID_ARTIFACT_MATCH',
        error: `Target "${targetId}" does not support the artifact type "${artifactType}"`,
        description,
      }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
}

export class UnexpectedError extends Response {
  constructor() {
    super(
      JSON.stringify({
        code: 'UNEXPECTED_ERROR',
        error: `Please try again later, or contact Hive support if the problem persists.`,
        description,
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
}
