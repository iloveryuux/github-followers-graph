import { InvalidArgumentError, program } from 'commander'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { generateGraph } from './utils/fetchers/graph-fetcher.js'
import { OUT_FILE } from './utils/const.js'
import { dirname } from 'node:path'

program
	.option('-g, --github-token <GITHUB_TOKEN>', process.env.GITHUB_TOKEN)
	.parse()

const { githubToken } = program.opts()

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

const graph = await generateGraph(login)

const dir = dirname(OUT_FILE)
if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true })
}

writeFileSync(OUT_FILE, graph)

console.log(`Graph saved to: ${OUT_FILE}`)
