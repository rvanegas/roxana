/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDiscussion = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      version
      revision
      layout
      users {
        items {
          id
          discussionID
          userID
          createdAt
          updatedAt
        }
        nextToken
      }
      sentences {
        items {
          id
          content
          discussionId
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
        users {
          nextToken
        }
        sentences {
          nextToken
        }
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
      discussionId
      discussion {
        id
        version
        revision
        layout
        users {
          nextToken
        }
        sentences {
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
        discussionId
        discussion {
          id
          version
          revision
          layout
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
      discussions {
        items {
          id
          discussionID
          userID
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
        discussions {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getDiscussionUsers = /* GraphQL */ `
  query GetDiscussionUsers($id: ID!) {
    getDiscussionUsers(id: $id) {
      id
      discussionID
      userID
      discussion {
        id
        version
        revision
        layout
        users {
          nextToken
        }
        sentences {
          nextToken
        }
        createdAt
        updatedAt
      }
      user {
        username
        discussions {
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
export const listDiscussionUsers = /* GraphQL */ `
  query ListDiscussionUsers(
    $filter: ModelDiscussionUsersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDiscussionUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        discussionID
        userID
        discussion {
          id
          version
          revision
          layout
          createdAt
          updatedAt
        }
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
