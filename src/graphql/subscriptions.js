/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDiscussion = /* GraphQL */ `
  subscription OnCreateDiscussion {
    onCreateDiscussion {
      id
      layout
      propositions {
        items {
          id
          content
          createdAt
          updatedAt
          discussionPropositionsId
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
      propositions {
        items {
          id
          content
          createdAt
          updatedAt
          discussionPropositionsId
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
      propositions {
        items {
          id
          content
          createdAt
          updatedAt
          discussionPropositionsId
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
        propositions {
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
        propositions {
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
        propositions {
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
export const onCreateProposition = /* GraphQL */ `
  subscription OnCreateProposition {
    onCreateProposition {
      id
      content
      discussion {
        id
        layout
        propositions {
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
      discussionPropositionsId
    }
  }
`;
export const onUpdateProposition = /* GraphQL */ `
  subscription OnUpdateProposition {
    onUpdateProposition {
      id
      content
      discussion {
        id
        layout
        propositions {
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
      discussionPropositionsId
    }
  }
`;
export const onDeleteProposition = /* GraphQL */ `
  subscription OnDeleteProposition {
    onDeleteProposition {
      id
      content
      discussion {
        id
        layout
        propositions {
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
      discussionPropositionsId
    }
  }
`;
