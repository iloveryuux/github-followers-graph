import { createCanvas } from '@napi-rs/canvas'

import { ROWS_OF_IMAGES } from '../const.js'
import { FollowersData } from '../types/globals.js'
import { fetchImages } from './images-fetcher.js'
import { headers } from '../index.js'

export const fetchGraphQL = async (
  username: string
): Promise<FollowersData> => {
  const query = `
  {
    user(login: ${JSON.stringify(username)}) {
      followers(first: 100, after: null) {
        pageInfo {
          hasNextPage
        }
        nodes {
          avatarUrl
        }
      }
    }
  }
  `

  const response = await fetch('https://api.github.com/graphql', {
    headers,
    method: 'POST',
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch data from GitHub: ${response.statusText}`)
  }

  const json = await response.json()
  return json.data as FollowersData
}

export const fetchFollowersPfps = async (
  username: string,
  avatarsURLs: string[] = [],
  limit: number = 100
): Promise<string[]> => {
  const followersData = await fetchGraphQL(username)
  const { pageInfo, nodes } = followersData.user.followers

  const updatedAvatarUrls = avatarsURLs.concat(
    nodes.map(node => node.avatarUrl)
  )

  if (updatedAvatarUrls.length >= limit) {
    return updatedAvatarUrls.slice(0, limit)
  }

  if (!pageInfo.hasNextPage) {
    return updatedAvatarUrls
  }

  return fetchFollowersPfps(username, updatedAvatarUrls, limit)
}

export const generateGraph = async (
  username: string,
  IMAGE_SIZE: number
): Promise<Buffer> => {
  const avatarUrls: string[] = await fetchFollowersPfps(username)

  const images = await fetchImages(avatarUrls, IMAGE_SIZE)

  const len = images.length
  const width = IMAGE_SIZE * ROWS_OF_IMAGES
  const height = Math.ceil(len / ROWS_OF_IMAGES) * IMAGE_SIZE

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  images.forEach((img, index) => {
    const col = index % ROWS_OF_IMAGES
    const row = Math.floor(index / ROWS_OF_IMAGES)
    ctx.drawImage(
      img,
      col * IMAGE_SIZE,
      row * IMAGE_SIZE,
      IMAGE_SIZE,
      IMAGE_SIZE
    )
  })

  return canvas.toBuffer('image/png')
}
