export const getDiscussionSimpleWithAssociations = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      layout
      version
      revision
      isPrivate
      inviteCode
      userDiscussions {
        items {
          id
          discussionId
          userId
          createdAt
          updatedAt
        }
      }
      sentences(limit: 500) {
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
export const getDiscussionSimpleWithoutAssociations = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      layout
      version
      revision
      isPrivate
      inviteCode
      createdAt
      updatedAt
    }
  }
`
export const queryDiscussionsByInviteCode = /* GraphQL */ `
  query QueryDiscussionsByInviteCode($inviteCode: String!) {
    queryDiscussionsByInviteCode(inviteCode: $inviteCode) {
      items {
        id
        inviteCode
        isPrivate
        createdAt
        updatedAt
        userDiscussions {
          items {
            id
            discussionId
            userId
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;
export const onDiscussionLayoutById = /* GraphQL */ `
  subscription OnDiscussionLayoutById($id: ID!) {
    onDiscussionById(id: $id) {
      id
      version
      revision
      isPrivate
      inviteCode
      layout
      createdAt
      updatedAt
    }
  }
`
export const listRecentDiscussions = /* GraphQL */ `
  query SearchDiscussions($isPrivate: Boolean!) {
    searchDiscussions(
      sort: {direction: desc, field: updatedAt},
      filter: {isPrivate: {eq: $isPrivate}},
      limit: 30
    ) {
      items {
        id
        createdAt
        updatedAt
        goalsSummary
        isPrivate
        userDiscussions {
          items {
            id
            discussionId
            userId
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`
