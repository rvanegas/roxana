/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDiscussion = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      shortId
      layout
      version
      layoutStates {
        items {
          id
          layout
          version
          createdAt
          updatedAt
          discussionLayoutStatesId
        }
        nextToken
      }
      sentences {
        items {
          id
          content
          discussionId
          currentDiscussionId
          createdAt
          updatedAt
        }
        nextToken
      }
      currentSentences {
        items {
          id
          content
          discussionId
          currentDiscussionId
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
        shortId
        layout
        version
        layoutStates {
          nextToken
        }
        sentences {
          nextToken
        }
        currentSentences {
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
      version
      discussion {
        id
        shortId
        layout
        version
        layoutStates {
          nextToken
        }
        sentences {
          nextToken
        }
        currentSentences {
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
        version
        discussion {
          id
          shortId
          layout
          version
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
      discussionId
      discussion {
        id
        shortId
        layout
        version
        layoutStates {
          nextToken
        }
        sentences {
          nextToken
        }
        currentSentences {
          nextToken
        }
        createdAt
        updatedAt
      }
      currentDiscussionId
      currentDiscussion {
        id
        shortId
        layout
        version
        layoutStates {
          nextToken
        }
        sentences {
          nextToken
        }
        currentSentences {
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
          shortId
          layout
          version
          createdAt
          updatedAt
        }
        currentDiscussionId
        currentDiscussion {
          id
          shortId
          layout
          version
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
