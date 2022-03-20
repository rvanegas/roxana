export const getDiscussionSimple = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      layout
      version
      revision
      sentences {
        items {
          id
          content
          discussionId
          createdAt
          updatedAt
        }
      }
      createdAt
      updatedAt
    }
  }
`
export const onUpdateDiscussionLayout = /* GraphQL */ `
  subscription OnUpdateDiscussion {
    onUpdateDiscussion {
      id
      layout
      version
      revision
      createdAt
      updatedAt
    }
  }
`
export const onDiscussionLayoutById = /* GraphQL */ `
  subscription OnDiscussionLayoutById($id: ID!) {
    onDiscussionById(id: $id) {
      id
      version
      revision
      layout
      createdAt
      updatedAt
    }
  }
`;
