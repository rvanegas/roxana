/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDiscussion = /* GraphQL */ `
  mutation CreateDiscussion(
    $input: CreateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    createDiscussion(input: $input, condition: $condition) {
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
export const updateDiscussion = /* GraphQL */ `
  mutation UpdateDiscussion(
    $input: UpdateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    updateDiscussion(input: $input, condition: $condition) {
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
export const deleteDiscussion = /* GraphQL */ `
  mutation DeleteDiscussion(
    $input: DeleteDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    deleteDiscussion(input: $input, condition: $condition) {
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
export const createLayoutState = /* GraphQL */ `
  mutation CreateLayoutState(
    $input: CreateLayoutStateInput!
    $condition: ModelLayoutStateConditionInput
  ) {
    createLayoutState(input: $input, condition: $condition) {
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
export const updateLayoutState = /* GraphQL */ `
  mutation UpdateLayoutState(
    $input: UpdateLayoutStateInput!
    $condition: ModelLayoutStateConditionInput
  ) {
    updateLayoutState(input: $input, condition: $condition) {
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
export const deleteLayoutState = /* GraphQL */ `
  mutation DeleteLayoutState(
    $input: DeleteLayoutStateInput!
    $condition: ModelLayoutStateConditionInput
  ) {
    deleteLayoutState(input: $input, condition: $condition) {
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
export const createProposition = /* GraphQL */ `
  mutation CreateProposition(
    $input: CreatePropositionInput!
    $condition: ModelPropositionConditionInput
  ) {
    createProposition(input: $input, condition: $condition) {
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
export const updateProposition = /* GraphQL */ `
  mutation UpdateProposition(
    $input: UpdatePropositionInput!
    $condition: ModelPropositionConditionInput
  ) {
    updateProposition(input: $input, condition: $condition) {
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
export const deleteProposition = /* GraphQL */ `
  mutation DeleteProposition(
    $input: DeletePropositionInput!
    $condition: ModelPropositionConditionInput
  ) {
    deleteProposition(input: $input, condition: $condition) {
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
