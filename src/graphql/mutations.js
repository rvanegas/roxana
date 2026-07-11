/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDiscussion = /* GraphQL */ `
  mutation CreateDiscussion(
    $input: CreateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    createDiscussion(input: $input, condition: $condition) {
      id
      version
      revision
      layout
      goalsSummary
      analysisResults
      analyzingState
      auditResult
      isPrivate
      inviteCode
      sentences {
        nextToken
        __typename
      }
      userDiscussions {
        nextToken
        __typename
      }
      pool
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDiscussion = /* GraphQL */ `
  mutation UpdateDiscussion(
    $input: UpdateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    updateDiscussion(input: $input, condition: $condition) {
      id
      version
      revision
      layout
      goalsSummary
      analysisResults
      analyzingState
      auditResult
      isPrivate
      inviteCode
      sentences {
        nextToken
        __typename
      }
      userDiscussions {
        nextToken
        __typename
      }
      pool
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDiscussion = /* GraphQL */ `
  mutation DeleteDiscussion(
    $input: DeleteDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    deleteDiscussion(input: $input, condition: $condition) {
      id
      version
      revision
      layout
      goalsSummary
      analysisResults
      analyzingState
      auditResult
      isPrivate
      inviteCode
      sentences {
        nextToken
        __typename
      }
      userDiscussions {
        nextToken
        __typename
      }
      pool
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSentence = /* GraphQL */ `
  mutation CreateSentence(
    $input: CreateSentenceInput!
    $condition: ModelSentenceConditionInput
  ) {
    createSentence(input: $input, condition: $condition) {
      id
      content
      searchable
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        analysisResults
        analyzingState
        auditResult
        isPrivate
        inviteCode
        pool
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSentence = /* GraphQL */ `
  mutation UpdateSentence(
    $input: UpdateSentenceInput!
    $condition: ModelSentenceConditionInput
  ) {
    updateSentence(input: $input, condition: $condition) {
      id
      content
      searchable
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        analysisResults
        analyzingState
        auditResult
        isPrivate
        inviteCode
        pool
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSentence = /* GraphQL */ `
  mutation DeleteSentence(
    $input: DeleteSentenceInput!
    $condition: ModelSentenceConditionInput
  ) {
    deleteSentence(input: $input, condition: $condition) {
      id
      content
      searchable
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        analysisResults
        analyzingState
        auditResult
        isPrivate
        inviteCode
        pool
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      username
      userDiscussions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      username
      userDiscussions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      username
      userDiscussions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createUserDiscussion = /* GraphQL */ `
  mutation CreateUserDiscussion(
    $input: CreateUserDiscussionInput!
    $condition: ModelUserDiscussionConditionInput
  ) {
    createUserDiscussion(input: $input, condition: $condition) {
      id
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        analysisResults
        analyzingState
        auditResult
        isPrivate
        inviteCode
        pool
        createdAt
        updatedAt
        __typename
      }
      userId
      user {
        username
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateUserDiscussion = /* GraphQL */ `
  mutation UpdateUserDiscussion(
    $input: UpdateUserDiscussionInput!
    $condition: ModelUserDiscussionConditionInput
  ) {
    updateUserDiscussion(input: $input, condition: $condition) {
      id
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        analysisResults
        analyzingState
        auditResult
        isPrivate
        inviteCode
        pool
        createdAt
        updatedAt
        __typename
      }
      userId
      user {
        username
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteUserDiscussion = /* GraphQL */ `
  mutation DeleteUserDiscussion(
    $input: DeleteUserDiscussionInput!
    $condition: ModelUserDiscussionConditionInput
  ) {
    deleteUserDiscussion(input: $input, condition: $condition) {
      id
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        analysisResults
        analyzingState
        auditResult
        isPrivate
        inviteCode
        pool
        createdAt
        updatedAt
        __typename
      }
      userId
      user {
        username
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
