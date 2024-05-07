/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const searchDiscussions = /* GraphQL */ `
  query SearchDiscussions(
    $filter: SearchableDiscussionFilterInput
    $sort: [SearchableDiscussionSortInput]
    $limit: Int
    $nextToken: String
    $from: Int
    $aggregates: [SearchableDiscussionAggregationInput]
  ) {
    searchDiscussions(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
      aggregates: $aggregates
    ) {
      items {
        id
        version
        revision
        layout
        goalsSummary
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      nextToken
      total
      aggregateItems {
        name
        result {
          ... on SearchableAggregateScalarResult {
            value
          }
          ... on SearchableAggregateBucketResult {
            buckets {
              key
              doc_count
            }
          }
        }
      }
    }
  }
`;
export const getDiscussion = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      version
      revision
      layout
      goalsSummary
      isPrivate
      inviteCode
      sentences {
        items {
          id
          content
          searchable
          discussionId
          createdAt
          updatedAt
        }
        nextToken
      }
      userDiscussions {
        items {
          id
          discussionId
          userId
          createdAt
          updatedAt
        }
        nextToken
      }
      pool
      createdAt
      updatedAt
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
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      nextToken
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
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
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
        discussion {
          id
          version
          revision
          layout
          goalsSummary
          isPrivate
          inviteCode
          pool
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($username: ID!) {
    getUser(username: $username) {
      username
      userDiscussions {
        items {
          id
          discussionId
          userId
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
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
        userDiscussions {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
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
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      userId
      user {
        username
        userDiscussions {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
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
        discussion {
          id
          version
          revision
          layout
          goalsSummary
          isPrivate
          inviteCode
          pool
          createdAt
          updatedAt
        }
        userId
        user {
          username
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      nextToken
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
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      nextToken
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
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      nextToken
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
        discussion {
          id
          version
          revision
          layout
          goalsSummary
          isPrivate
          inviteCode
          pool
          createdAt
          updatedAt
        }
        userId
        user {
          username
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      nextToken
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
        discussion {
          id
          version
          revision
          layout
          goalsSummary
          isPrivate
          inviteCode
          pool
          createdAt
          updatedAt
        }
        userId
        user {
          username
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
