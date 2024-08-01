import { loadImage, Image } from '@napi-rs/canvas'

export const fetchImages = async (
  urls: string[],
  IMAGE_SIZE: number
): Promise<Image[]> => {
  const imagePromises = urls.map(async urlString => {
    const url = new URL(urlString)
    url.searchParams.set('size', IMAGE_SIZE.toString())

    const res = await fetch(url.toString())
    if (!res.ok) {
      return null
    }

    const buf = await res.arrayBuffer()
    return await loadImage(Buffer.from(buf))
  })

  const images = await Promise.all(imagePromises)
  return images.filter((img): img is Image => img !== null)
}
