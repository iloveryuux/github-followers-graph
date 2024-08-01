import { InvalidArgumentError, program } from 'commander'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { generateGraph } from './fetchers/graph-fetcher.js'
import { OUT_FILE, IMAGE_SIZE, ROWS_OF_IMAGES } from './const.js'
import { dirname } from 'node:path'

program
  .option('-g, --github-token <GITHUB_TOKEN>', process.env.GITHUB_TOKEN)
  .option('-s, --image-size <SIZE>', IMAGE_SIZE.toString())
  .option('-r, --rows-of-images <ROWS>', ROWS_OF_IMAGES.toString())
  .parse()

const { githubToken, imageSize, rowsOfImages } = program.opts()

const sizeToUse = Number(imageSize) || IMAGE_SIZE
const rowsToUse = Number(rowsOfImages) || ROWS_OF_IMAGES

export const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${githubToken}`
}

if (!githubToken) {
  throw new InvalidArgumentError('Missing required option: --github-token')
}

const { login } = await fetch('https://api.github.com/user', {
  headers
}).then(res => res.json())

const graph = await generateGraph(login, sizeToUse, rowsToUse)

const dir = dirname(OUT_FILE)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

writeFileSync(OUT_FILE, graph)

console.log(`Graph saved to: ${OUT_FILE}`)
