import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const IMAGE_SIZE = 64
export const ROWS_OF_IMAGES = 10
export const OUTPUT_DIR = join(__dirname, '..', 'graphs')
export const OUT_FILE = join(OUTPUT_DIR, 'graph.png')
