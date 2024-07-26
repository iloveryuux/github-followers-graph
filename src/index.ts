import { InvalidArgumentError, program } from 'commander'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { generateGraph } from './fetchers/graph-fetcher.js'
import { OUT_FILE, IMAGE_SIZE } from './const.js'
import { dirname } from 'node:path'

program
	.option('-g, --github-token <GITHUB_TOKEN>', process.env.GITHUB_TOKEN)
	.option('-s, --image-size <SIZE>', IMAGE_SIZE.toString())
	.parse()

const { githubToken, imageSize } = program.opts()

const sizeToUse = Number(imageSize) || IMAGE_SIZE

export const headers = {
	'Content-Type': 'application/json',
	Authorization: `Bearer ${githubToken}`,
}

if (!githubToken) {
	throw new InvalidArgumentError('Missing required option: --github-token')
}

const { login } = await fetch('https://api.github.com/user', {
	headers,
}).then((res) => res.json())

const graph = await generateGraph(login, sizeToUse)

const dir = dirname(OUT_FILE)
if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true })
}

writeFileSync(OUT_FILE, graph)

console.log(`Graph saved to: ${OUT_FILE}`)
