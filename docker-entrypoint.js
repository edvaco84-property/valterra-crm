#!/usr/bin/env node

const env = { ...process.env }
let spawnPromise

;(async () => {
  const command = process.argv.slice(2).join(' ')

  if (!command) {
    throw new Error('No command provided to docker-entrypoint.js')
  }

  // The image is already built during Docker build. Rebuilding Next.js here
  // makes cold starts slower and can leave Fly machines looking unhealthy.
  const exitCode = await exec(command)
  process.exit(exitCode)
})().catch((error) => {
  console.error(error)
  process.exit(1)
})

async function exec(command) {
  const spawn = await getSpawn()
  const child = spawn(command, { shell: true, stdio: 'inherit', env })

  return new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${command} terminated by signal ${signal}`))
        return
      }

      resolve(code ?? 0)
    })
  })
}

async function getSpawn() {
  if (!spawnPromise) {
    spawnPromise = import('node:child_process').then((module) => module.spawn)
  }

  return spawnPromise
}
