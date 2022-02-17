export const getDiscussionPaginated = /* GraphQL */ `
  query GetDiscussion($id: ID!, $limit: Int, $nextToken: String) {
    getDiscussion(id: $id) {
      id
      layout
      propositions(limit: $limit, nextToken: $nextToken) {
        items {
          id
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
`
export const onUpdateDiscussionLayout = /* GraphQL */ `
  subscription OnUpdateDiscussion {
    onUpdateDiscussion {
      id
      layout
      createdAt
      updatedAt
    }
  }
`
