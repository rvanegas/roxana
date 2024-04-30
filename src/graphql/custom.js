export const getDiscussionSimple = /* GraphQL */ `
  query GetDiscussion($id: ID!, $limit: Int) {
    getDiscussion(id: $id) {
      id
      layout
      version
      revision
      isPrivate
      users {
        items {
          id
          discussionID
          userID
          createdAt
          updatedAt
        }
      }
      sentences(limit: $limit) {
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
`
export const listRecentDiscussions = /* GraphQL */ `
  query SearchDiscussions {
    searchDiscussions(sort: {direction: desc, field: updatedAt}, limit: 30) {
      items {
        id
        updatedAt
        goalsSummary
      }
    }
  }
`
