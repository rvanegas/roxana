/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDiscussion = /* GraphQL */ `
  subscription OnCreateDiscussion {
    onCreateDiscussion {
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
export const onUpdateDiscussion = /* GraphQL */ `
  subscription OnUpdateDiscussion {
    onUpdateDiscussion {
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
export const onDeleteDiscussion = /* GraphQL */ `
  subscription OnDeleteDiscussion {
    onDeleteDiscussion {
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
export const onCreateLayoutState = /* GraphQL */ `
  subscription OnCreateLayoutState {
    onCreateLayoutState {
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
export const onUpdateLayoutState = /* GraphQL */ `
  subscription OnUpdateLayoutState {
    onUpdateLayoutState {
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
export const onDeleteLayoutState = /* GraphQL */ `
  subscription OnDeleteLayoutState {
    onDeleteLayoutState {
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
export const onCreateSentence = /* GraphQL */ `
  subscription OnCreateSentence {
    onCreateSentence {
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
export const onUpdateSentence = /* GraphQL */ `
  subscription OnUpdateSentence {
    onUpdateSentence {
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
export const onDeleteSentence = /* GraphQL */ `
  subscription OnDeleteSentence {
    onDeleteSentence {
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
