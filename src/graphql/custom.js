export const getDiscussionSimple = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      shortId
      layout
      version
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
      createdAt
      updatedAt
    }
  }
`
