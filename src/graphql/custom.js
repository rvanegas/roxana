export const getDiscussionSimpleWithAssociations = /* GraphQL */ `
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      layout
      version
      revision
      isPrivate
      inviteCode
      users {
        items {
          id
          discussionID
          userID
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
      inviteCode
      createdAt
      updatedAt
    }
  }
`
export const discussionByInviteCode = /* GraphQL */ `
  query DiscussionByInviteCode($inviteCode: String!) {
    discussionByInviteCode(inviteCode: $inviteCode) {
      items {
        id
        inviteCode
        createdAt
        updatedAt
        users {
          items {
            id
            discussionID
            userID
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;
export const onUpdateDiscussionLayout = /* GraphQL */ `
  subscription OnUpdateDiscussion {
    onUpdateDiscussion {
      id
      layout
      version
      revision
      inviteCode
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
        users {
          items {
            id
            discussionID
            userID
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`
