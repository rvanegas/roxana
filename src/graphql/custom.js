export const onUpdateDiscussionLayout = /* GraphQL */ `
  subscription OnUpdateDiscussion($id: ID!) {
    onUpdateDiscussion(filter: {
      id: $id
    }) {
      id
      layout
      createdAt
      updatedAt
    }
  }
`
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
