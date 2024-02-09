/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProposition = /* GraphQL */ `
  query GetProposition($id: ID!) {
    getProposition(id: $id) {
      id
      index
      content
      discussion {
        id
        propositions {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      discussionPropositionsId
    }
  }
`;
export const listPropositions = /* GraphQL */ `
  query ListPropositions(
    $filter: ModelPropositionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPropositions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        index
        content
        discussion {
          id
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        discussionPropositionsId
      }
      nextToken
    }
  }
`;
export const getDiscussion = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      propositions {
        items {
          id
          index
          content
          createdAt
          updatedAt
          discussionPropositionsId
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
        propositions {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
