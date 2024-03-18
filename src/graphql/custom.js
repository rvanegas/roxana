export const getDiscussionSimple = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      layout
      version
      revision
      currentSentences {
        items {
          id
          content
          discussionId
          currentDiscussionId
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
