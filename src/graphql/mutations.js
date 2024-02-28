/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDiscussion = /* GraphQL */ `
  mutation CreateDiscussion(
    $input: CreateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    createDiscussion(input: $input, condition: $condition) {
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
export const updateDiscussion = /* GraphQL */ `
  mutation UpdateDiscussion(
    $input: UpdateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    updateDiscussion(input: $input, condition: $condition) {
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
export const deleteDiscussion = /* GraphQL */ `
  mutation DeleteDiscussion(
    $input: DeleteDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    deleteDiscussion(input: $input, condition: $condition) {
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
export const createLayoutState = /* GraphQL */ `
  mutation CreateLayoutState(
    $input: CreateLayoutStateInput!
    $condition: ModelLayoutStateConditionInput
  ) {
    createLayoutState(input: $input, condition: $condition) {
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
export const updateLayoutState = /* GraphQL */ `
  mutation UpdateLayoutState(
    $input: UpdateLayoutStateInput!
    $condition: ModelLayoutStateConditionInput
  ) {
    updateLayoutState(input: $input, condition: $condition) {
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
export const deleteLayoutState = /* GraphQL */ `
  mutation DeleteLayoutState(
    $input: DeleteLayoutStateInput!
    $condition: ModelLayoutStateConditionInput
  ) {
    deleteLayoutState(input: $input, condition: $condition) {
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
export const createSentence = /* GraphQL */ `
  mutation CreateSentence(
    $input: CreateSentenceInput!
    $condition: ModelSentenceConditionInput
  ) {
    createSentence(input: $input, condition: $condition) {
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
export const updateSentence = /* GraphQL */ `
  mutation UpdateSentence(
    $input: UpdateSentenceInput!
    $condition: ModelSentenceConditionInput
  ) {
    updateSentence(input: $input, condition: $condition) {
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
export const deleteSentence = /* GraphQL */ `
  mutation DeleteSentence(
    $input: DeleteSentenceInput!
    $condition: ModelSentenceConditionInput
  ) {
    deleteSentence(input: $input, condition: $condition) {
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
