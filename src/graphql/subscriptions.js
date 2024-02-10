/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProposition = /* GraphQL */ `
  subscription OnCreateProposition {
    onCreateProposition {
      id
      index
      content
      discussion {
        id
        nextPropositionIndex
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
export const onUpdateProposition = /* GraphQL */ `
  subscription OnUpdateProposition {
    onUpdateProposition {
      id
      index
      content
      discussion {
        id
        nextPropositionIndex
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
export const onDeleteProposition = /* GraphQL */ `
  subscription OnDeleteProposition {
    onDeleteProposition {
      id
      index
      content
      discussion {
        id
        nextPropositionIndex
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
export const onCreateDiscussion = /* GraphQL */ `
  subscription OnCreateDiscussion {
    onCreateDiscussion {
      id
      nextPropositionIndex
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
export const onUpdateDiscussion = /* GraphQL */ `
  subscription OnUpdateDiscussion {
    onUpdateDiscussion {
      id
      nextPropositionIndex
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
export const onDeleteDiscussion = /* GraphQL */ `
  subscription OnDeleteDiscussion {
    onDeleteDiscussion {
      id
      nextPropositionIndex
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
