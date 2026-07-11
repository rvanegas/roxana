/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDiscussion = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
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
export const listDiscussions = /* GraphQL */ `
  query ListDiscussions(
    $filter: ModelDiscussionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDiscussions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSentence = /* GraphQL */ `
  query GetSentence($id: ID!) {
    getSentence(id: $id) {
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
export const listSentences = /* GraphQL */ `
  query ListSentences(
    $filter: ModelSentenceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSentences(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        content
        searchable
        discussionId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($username: ID!) {
    getUser(username: $username) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $username: ID
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUsers(
      username: $username
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        username
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserDiscussion = /* GraphQL */ `
  query GetUserDiscussion($id: ID!) {
    getUserDiscussion(id: $id) {
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
export const listUserDiscussions = /* GraphQL */ `
  query ListUserDiscussions(
    $filter: ModelUserDiscussionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserDiscussions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        discussionId
        userId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const queryDiscussionsByInviteCode = /* GraphQL */ `
  query QueryDiscussionsByInviteCode(
    $inviteCode: String!
    $sortDirection: ModelSortDirection
    $filter: ModelDiscussionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryDiscussionsByInviteCode(
      inviteCode: $inviteCode
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const queryDiscussionsByPool = /* GraphQL */ `
  query QueryDiscussionsByPool(
    $pool: Int!
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelDiscussionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryDiscussionsByPool(
      pool: $pool
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const queryUserDiscussionByDiscussionId = /* GraphQL */ `
  query QueryUserDiscussionByDiscussionId(
    $discussionId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelUserDiscussionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryUserDiscussionByDiscussionId(
      discussionId: $discussionId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        discussionId
        userId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const queryUserDiscussionsByUserId = /* GraphQL */ `
  query QueryUserDiscussionsByUserId(
    $userId: ID!
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelUserDiscussionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryUserDiscussionsByUserId(
      userId: $userId
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        discussionId
        userId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
