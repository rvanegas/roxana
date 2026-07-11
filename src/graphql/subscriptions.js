/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onDiscussionById = /* GraphQL */ `
  subscription OnDiscussionById($id: ID!) {
    onDiscussionById(id: $id) {
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
export const onCreateDiscussion = /* GraphQL */ `
  subscription OnCreateDiscussion(
    $filter: ModelSubscriptionDiscussionFilterInput
  ) {
    onCreateDiscussion(filter: $filter) {
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
export const onUpdateDiscussion = /* GraphQL */ `
  subscription OnUpdateDiscussion(
    $filter: ModelSubscriptionDiscussionFilterInput
  ) {
    onUpdateDiscussion(filter: $filter) {
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
export const onDeleteDiscussion = /* GraphQL */ `
  subscription OnDeleteDiscussion(
    $filter: ModelSubscriptionDiscussionFilterInput
  ) {
    onDeleteDiscussion(filter: $filter) {
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
export const onCreateSentence = /* GraphQL */ `
  subscription OnCreateSentence($filter: ModelSubscriptionSentenceFilterInput) {
    onCreateSentence(filter: $filter) {
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
export const onUpdateSentence = /* GraphQL */ `
  subscription OnUpdateSentence($filter: ModelSubscriptionSentenceFilterInput) {
    onUpdateSentence(filter: $filter) {
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
export const onDeleteSentence = /* GraphQL */ `
  subscription OnDeleteSentence($filter: ModelSubscriptionSentenceFilterInput) {
    onDeleteSentence(filter: $filter) {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
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
export const onCreateUserDiscussion = /* GraphQL */ `
  subscription OnCreateUserDiscussion(
    $filter: ModelSubscriptionUserDiscussionFilterInput
  ) {
    onCreateUserDiscussion(filter: $filter) {
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
export const onUpdateUserDiscussion = /* GraphQL */ `
  subscription OnUpdateUserDiscussion(
    $filter: ModelSubscriptionUserDiscussionFilterInput
  ) {
    onUpdateUserDiscussion(filter: $filter) {
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
export const onDeleteUserDiscussion = /* GraphQL */ `
  subscription OnDeleteUserDiscussion(
    $filter: ModelSubscriptionUserDiscussionFilterInput
  ) {
    onDeleteUserDiscussion(filter: $filter) {
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
