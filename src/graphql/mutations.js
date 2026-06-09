/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDiscussion = /* GraphQL */ `
  mutation CreateDiscussion(
    $input: CreateDiscussionInput!
    $condition: ModelDiscussionConditionInput
  ) {
    createDiscussion(input: $input, condition: $condition) {
      id
      version
      revision
      layout
      goalsSummary
      isPrivate
      inviteCode
      sentences {
        items {
          id
          content
          searchable
          discussionId
          createdAt
          updatedAt
        }
        nextToken
      }
      userDiscussions {
        items {
          id
          discussionId
          userId
          createdAt
          updatedAt
        }
        nextToken
      }
      pool
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
      version
      revision
      layout
      goalsSummary
      analysisResults
      analyzingState
      isPrivate
      inviteCode
      sentences {
        items {
          id
          content
          searchable
          discussionId
          createdAt
          updatedAt
        }
        nextToken
      }
      userDiscussions {
        items {
          id
          discussionId
          userId
          createdAt
          updatedAt
        }
        nextToken
      }
      pool
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
      version
      revision
      layout
      goalsSummary
      isPrivate
      inviteCode
      sentences {
        items {
          id
          content
          searchable
          discussionId
          createdAt
          updatedAt
        }
        nextToken
      }
      userDiscussions {
        items {
          id
          discussionId
          userId
          createdAt
          updatedAt
        }
        nextToken
      }
      pool
      createdAt
      updatedAt
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
      searchable
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
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
      searchable
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
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
      searchable
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      username
      userDiscussions {
        items {
          id
          discussionId
          userId
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      username
      userDiscussions {
        items {
          id
          discussionId
          userId
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      username
      userDiscussions {
        items {
          id
          discussionId
          userId
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
export const createUserDiscussion = /* GraphQL */ `
  mutation CreateUserDiscussion(
    $input: CreateUserDiscussionInput!
    $condition: ModelUserDiscussionConditionInput
  ) {
    createUserDiscussion(input: $input, condition: $condition) {
      id
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      userId
      user {
        username
        userDiscussions {
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
export const updateUserDiscussion = /* GraphQL */ `
  mutation UpdateUserDiscussion(
    $input: UpdateUserDiscussionInput!
    $condition: ModelUserDiscussionConditionInput
  ) {
    updateUserDiscussion(input: $input, condition: $condition) {
      id
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      userId
      user {
        username
        userDiscussions {
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
export const deleteUserDiscussion = /* GraphQL */ `
  mutation DeleteUserDiscussion(
    $input: DeleteUserDiscussionInput!
    $condition: ModelUserDiscussionConditionInput
  ) {
    deleteUserDiscussion(input: $input, condition: $condition) {
      id
      discussionId
      discussion {
        id
        version
        revision
        layout
        goalsSummary
        isPrivate
        inviteCode
        sentences {
          nextToken
        }
        userDiscussions {
          nextToken
        }
        pool
        createdAt
        updatedAt
      }
      userId
      user {
        username
        userDiscussions {
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
