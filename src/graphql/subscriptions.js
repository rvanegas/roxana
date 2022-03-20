/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onDiscussionById = /* GraphQL */ `
  subscription OnDiscussionById($id: ID!) {
    onDiscussionById(id: $id) {
      id
      version
      revision
      layout
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
export const onCreateDiscussion = /* GraphQL */ `
  subscription OnCreateDiscussion {
    onCreateDiscussion {
      id
      version
      revision
      layout
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
      version
      revision
      layout
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
      version
      revision
      layout
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
export const onCreateSentence = /* GraphQL */ `
  subscription OnCreateSentence {
    onCreateSentence {
      id
      content
      discussionId
      discussion {
        id
        version
        revision
        layout
        users {
          nextToken
        }
        sentences {
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
        version
        revision
        layout
        users {
          nextToken
        }
        sentences {
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
        version
        revision
        layout
        users {
          nextToken
        }
        sentences {
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
        version
        revision
        layout
        users {
          nextToken
        }
        sentences {
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
        version
        revision
        layout
        users {
          nextToken
        }
        sentences {
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
        version
        revision
        layout
        users {
          nextToken
        }
        sentences {
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
