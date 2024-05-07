/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onDiscussionById = /* GraphQL */ `
  subscription OnDiscussionById($id: ID!) {
    onDiscussionById(id: $id) {
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
export const onCreateDiscussion = /* GraphQL */ `
  subscription OnCreateDiscussion {
    onCreateDiscussion {
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
export const onUpdateDiscussion = /* GraphQL */ `
  subscription OnUpdateDiscussion {
    onUpdateDiscussion {
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
export const onDeleteDiscussion = /* GraphQL */ `
  subscription OnDeleteDiscussion {
    onDeleteDiscussion {
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
export const onCreateSentence = /* GraphQL */ `
  subscription OnCreateSentence {
    onCreateSentence {
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
export const onUpdateSentence = /* GraphQL */ `
  subscription OnUpdateSentence {
    onUpdateSentence {
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
export const onDeleteSentence = /* GraphQL */ `
  subscription OnDeleteSentence {
    onDeleteSentence {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateUserDiscussion = /* GraphQL */ `
  subscription OnCreateUserDiscussion {
    onCreateUserDiscussion {
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
export const onUpdateUserDiscussion = /* GraphQL */ `
  subscription OnUpdateUserDiscussion {
    onUpdateUserDiscussion {
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
export const onDeleteUserDiscussion = /* GraphQL */ `
  subscription OnDeleteUserDiscussion {
    onDeleteUserDiscussion {
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
