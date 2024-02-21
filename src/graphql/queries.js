/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDiscussion = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      layout
      sentences {
        items {
          id
          content
          createdAt
          updatedAt
          discussionSentencesId
        }
        nextToken
      }
      layoutStates {
        items {
          id
          layout
          createdAt
          updatedAt
          discussionLayoutStatesId
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
        layout
        sentences {
          nextToken
        }
        layoutStates {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getLayoutState = /* GraphQL */ `
  query GetLayoutState($id: ID!) {
    getLayoutState(id: $id) {
      id
      layout
      discussion {
        id
        layout
        sentences {
          nextToken
        }
        layoutStates {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      discussionLayoutStatesId
    }
  }
`;
export const listLayoutStates = /* GraphQL */ `
  query ListLayoutStates(
    $filter: ModelLayoutStateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLayoutStates(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        layout
        discussion {
          id
          layout
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        discussionLayoutStatesId
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
      discussion {
        id
        layout
        sentences {
          nextToken
        }
        layoutStates {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      discussionSentencesId
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
        discussion {
          id
          layout
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        discussionSentencesId
      }
      nextToken
    }
  }
`;
