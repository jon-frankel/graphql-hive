import { gql } from 'graphql-modules';

export default gql`
  extend type Organization {
    viewerCanManageOIDCIntegration: Boolean!
    oidcIntegration: OIDCIntegration
  }

  extend type User {
    canSwitchOrganization: Boolean!
  }

  type OIDCIntegration {
    id: ID!
    clientId: ID!
    clientSecretPreview: String!
    oauthApiUrl: String!
    organization: Organization!
  }

  extend type Mutation {
    createOIDCIntegration(input: CreateOIDCIntegrationInput!): CreateOIDCIntegrationResult!
    updateOIDCIntegration(input: UpdateOIDCIntegrationInput!): UpdateOIDCIntegrationResult!
    deleteOIDCIntegration(input: DeleteOIDCIntegrationInput!): DeleteOIDCIntegrationResult!
  }

  input CreateOIDCIntegrationInput {
    organizationId: ID!
    clientId: ID!
    clientSecret: String!
    oauthApiUrl: String!
  }

  type CreateOIDCIntegrationResult {
    ok: CreateOIDCIntegrationOk
    error: CreateOIDCIntegrationError
  }

  type CreateOIDCIntegrationOk {
    createdOIDCIntegration: OIDCIntegration!
    organization: Organization!
  }

  type CreateOIDCIntegrationErrorDetails {
    clientId: String
    clientSecret: String
    oauthApiUrl: String
  }

  type CreateOIDCIntegrationError implements Error {
    message: String!
    details: CreateOIDCIntegrationErrorDetails!
  }

  input UpdateOIDCIntegrationInput {
    oidcIntegrationId: ID!
    clientId: ID
    clientSecret: String
    oauthApiUrl: String
  }

  type UpdateOIDCIntegrationResult {
    ok: UpdateOIDCIntegrationOk
    error: UpdateOIDCIntegrationError
  }

  type UpdateOIDCIntegrationOk {
    updatedOIDCIntegration: OIDCIntegration!
  }

  type UpdateOIDCIntegrationErrorDetails {
    clientId: String
    clientSecret: String
    oauthApiUrl: String
  }

  type UpdateOIDCIntegrationError implements Error {
    message: String!
    details: UpdateOIDCIntegrationErrorDetails!
  }

  input DeleteOIDCIntegrationInput {
    oidcIntegrationId: ID!
  }

  type DeleteOIDCIntegrationResult {
    ok: DeleteOIDCIntegrationOk
    error: DeleteOIDCIntegrationError
  }

  type DeleteOIDCIntegrationOk {
    organization: Organization!
  }

  type DeleteOIDCIntegrationError implements Error {
    message: String!
  }
`;
