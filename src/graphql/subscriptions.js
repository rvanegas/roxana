/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDiscussion = /* GraphQL */ `
  subscription OnCreateDiscussion {
    onCreateDiscussion {
      id
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
export const onUpdateDiscussion = /* GraphQL */ `
  subscription OnUpdateDiscussion {
    onUpdateDiscussion {
      id
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
export const onDeleteDiscussion = /* GraphQL */ `
  subscription OnDeleteDiscussion {
    onDeleteDiscussion {
      id
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
export const onCreateLayoutState = /* GraphQL */ `
  subscription OnCreateLayoutState {
    onCreateLayoutState {
      id
      layout
      version
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
export const onUpdateLayoutState = /* GraphQL */ `
  subscription OnUpdateLayoutState {
    onUpdateLayoutState {
      id
      layout
      version
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
export const onDeleteLayoutState = /* GraphQL */ `
  subscription OnDeleteLayoutState {
    onDeleteLayoutState {
      id
      layout
      version
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
export const onCreateSentence = /* GraphQL */ `
  subscription OnCreateSentence {
    onCreateSentence {
      id
      content
      discussionId
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
export const onUpdateSentence = /* GraphQL */ `
  subscription OnUpdateSentence {
    onUpdateSentence {
      id
      content
      discussionId
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
export const onDeleteSentence = /* GraphQL */ `
  subscription OnDeleteSentence {
    onDeleteSentence {
      id
      content
      discussionId
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateDiscussionUsers = /* GraphQL */ `
  subscription OnCreateDiscussionUsers {
    onCreateDiscussionUsers {
      id
      discussionID
      userID
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
export const onUpdateDiscussionUsers = /* GraphQL */ `
  subscription OnUpdateDiscussionUsers {
    onUpdateDiscussionUsers {
      id
      discussionID
      userID
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
export const onDeleteDiscussionUsers = /* GraphQL */ `
  subscription OnDeleteDiscussionUsers {
    onDeleteDiscussionUsers {
      id
      discussionID
      userID
      discussion {
        id
        layout
        version
        layoutStates {
          nextToken
        }
        users {
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
