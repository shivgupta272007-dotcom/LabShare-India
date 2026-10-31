#!/usr/bin/env node

// ============================================================
// LabShare – Concurrent Development Runner
// Runs both API (Port 3001) and Web (Port 3000) concurrently
// with colored prefixes and graceful shutdown.
// ============================================================

import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const isProd = process.argv.includes('--prod') || process.env.NODE_ENV === 'production'

const CYAN = '\x1b[36m'
const MAGENTA = '\x1b[35m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

console.log(`\n${BOLD}${GREEN}================================================================${RESET}`)
console.log(`${BOLD}${GREEN}  🚀 Starting LabShare (लैबशेयर) Platform${RESET}`)
console.log(`${BOLD}${GREEN}================================================================${RESET}\n`)

// Ensure shared package is built
const sharedDist = path.join(rootDir, 'packages/shared/dist')
if (!fs.existsSync(sharedDist)) {
  console.log(`${YELLOW}Compiling @labshare/shared...${RESET}`)
  execSync('pnpm --filter @labshare/shared build', { cwd: rootDir, stdio: 'inherit' })
}

// Ensure api package is built
const apiDist = path.join(rootDir, 'apps/api/dist/main.js')
if (!fs.existsSync(apiDist)) {
  console.log(`${YELLOW}Compiling @labshare/api...${RESET}`)
  execSync('pnpm --filter @labshare/api build', { cwd: rootDir, stdio: 'inherit' })
}

console.log(`${CYAN}[API]${RESET} Backend starting on ${BOLD}http://localhost:3001${RESET} (Swagger: ${BOLD}http://localhost:3001/docs${RESET})`)
console.log(`${MAGENTA}[WEB]${RESET} Frontend starting on ${BOLD}http://localhost:3000${RESET}\n`)

function pipeWithPrefix(stream, prefix, color) {
  let buffer = ''
  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`${color}${prefix}${RESET} ${line}`)
      }
    }
  })
}

// 1. Spawn API
const apiProcess = spawn('node', ['dist/main.js'], {
  cwd: path.join(rootDir, 'apps/api'),
  env: {
    ...process.env,
    PORT: '3001',
    API_PORT: '3001',
    NODE_ENV: isProd ? 'production' : 'development',
  },
  stdio: ['inherit', 'pipe', 'pipe'],
})

pipeWithPrefix(apiProcess.stdout, '[API]', CYAN)
pipeWithPrefix(apiProcess.stderr, '[API ERR]', '\x1b[31m')

// 2. Spawn Web
const webCmd = isProd ? ['start', '-p', '3000'] : ['dev', '-p', '3000']
const webProcess = spawn('npx', ['next', ...webCmd], {
  cwd: path.join(rootDir, 'apps/web'),
  env: {
    ...process.env,
    PORT: '3000',
    NEXT_PUBLIC_API_URL: 'http://localhost:3001/api/v1',
  },
  stdio: ['inherit', 'pipe', 'pipe'],
})

pipeWithPrefix(webProcess.stdout, '[WEB]', MAGENTA)
pipeWithPrefix(webProcess.stderr, '[WEB ERR]', '\x1b[31m')

const cleanup = (code = 0) => {
  console.log(`\n${YELLOW}Shutting down LabShare services...${RESET}`)
  try {
    apiProcess.kill('SIGTERM')
  } catch {}
  try {
    webProcess.kill('SIGTERM')
  } catch {}
  process.exit(code)
}

process.on('SIGINT', () => cleanup(0))
process.on('SIGTERM', () => cleanup(0))
process.on('exit', () => cleanup(0))

apiProcess.on('error', (err) => {
  console.error(`${CYAN}[API]${RESET} Process error:`, err)
})

webProcess.on('error', (err) => {
  console.error(`${MAGENTA}[WEB]${RESET} Process error:`, err)
})
