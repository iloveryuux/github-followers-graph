export interface FollowersData {
  user: {
    followers: {
      pageInfo: {
        hasNextPage: boolean
      }
      nodes: {
        avatarUrl: string
      }[]
    }
  }
}
