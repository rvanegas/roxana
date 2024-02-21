/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDiscussion = /* GraphQL */ `
  subscription OnCreateDiscussion {
    onCreateDiscussion {
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
export const onUpdateDiscussion = /* GraphQL */ `
  subscription OnUpdateDiscussion {
    onUpdateDiscussion {
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
export const onDeleteDiscussion = /* GraphQL */ `
  subscription OnDeleteDiscussion {
    onDeleteDiscussion {
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
export const onCreateLayoutState = /* GraphQL */ `
  subscription OnCreateLayoutState {
    onCreateLayoutState {
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
export const onUpdateLayoutState = /* GraphQL */ `
  subscription OnUpdateLayoutState {
    onUpdateLayoutState {
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
export const onDeleteLayoutState = /* GraphQL */ `
  subscription OnDeleteLayoutState {
    onDeleteLayoutState {
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
export const onCreateSentence = /* GraphQL */ `
  subscription OnCreateSentence {
    onCreateSentence {
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
export const onUpdateSentence = /* GraphQL */ `
  subscription OnUpdateSentence {
    onUpdateSentence {
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
export const onDeleteSentence = /* GraphQL */ `
  subscription OnDeleteSentence {
    onDeleteSentence {
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
