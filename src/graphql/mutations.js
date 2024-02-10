/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createProposition = /* GraphQL */ `
  mutation CreateProposition(
    $input: CreatePropositionInput!
    $condition: ModelPropositionConditionInput
  ) {
    createProposition(input: $input, condition: $condition) {
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
export const updateProposition = /* GraphQL */ `
  mutation UpdateProposition(
    $input: UpdatePropositionInput!
    $condition: ModelPropositionConditionInput
  ) {
    updateProposition(input: $input, condition: $condition) {
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
export const deleteProposition = /* GraphQL */ `
  mutation DeleteProposition(
    $input: DeletePropositionInput!
    $condition: ModelPropositionConditionInput
  ) {
    deleteProposition(input: $input, condition: $condition) {
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
export const createDiscussion = /* GraphQL */ `
  mutation CreateDiscussion(
    $input: CreateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    createDiscussion(input: $input, condition: $condition) {
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
export const updateDiscussion = /* GraphQL */ `
  mutation UpdateDiscussion(
    $input: UpdateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    updateDiscussion(input: $input, condition: $condition) {
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
export const deleteDiscussion = /* GraphQL */ `
  mutation DeleteDiscussion(
    $input: DeleteDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    deleteDiscussion(input: $input, condition: $condition) {
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
