//! WE NEED TO IMPORT OS BECAUSE ELSE NEXTJS IS NOT INCLUDING OAS INSIDE THE BUNDLE(PRODUCTION BUILD)
import oas from 'oas'
import oasNormalize from 'oas-normalize'

import { ParserBody } from '../../kubb'

import type { NextApiRequest, NextApiResponse } from 'next'

const latest = {
  '@kubb/core': import('@kubb/core'),
  '@kubb/swagger': import('@kubb/swagger'),
  '@kubb/swagger-ts': import('@kubb/swagger-ts'),
  '@kubb/swagger-tanstack-query': import('@kubb/swagger-tanstack-query'),
  '@kubb/swagger-zod': import('@kubb/swagger-zod'),
  '@kubb/swagger-zodios': import('@kubb/swagger-zodios'),
  '@kubb/swagger-faker': import('@kubb/swagger-faker'),
  '@kubb/swagger-msw': import('@kubb/swagger-msw'),
  '@kubb/swagger-swr': import('@kubb/swagger-swr'),
  '@kubb/swagger-client': import('@kubb/swagger-client'),
} as const

const alpha = {
  '@kubb/core': import('@kubb-alpha/core'),
  '@kubb/swagger': import('@kubb-alpha/swagger'),
  '@kubb/swagger-ts': import('@kubb-alpha/swagger-ts'),
  '@kubb/swagger-tanstack-query': import('@kubb-alpha/swagger-tanstack-query'),
  '@kubb/swagger-zod': import('@kubb-alpha/swagger-zod'),
  '@kubb/swagger-zodios': import('@kubb-alpha/swagger-zodios'),
  '@kubb/swagger-faker': import('@kubb-alpha/swagger-faker'),
  '@kubb/swagger-msw': import('@kubb-alpha/swagger-msw'),
  '@kubb/swagger-swr': import('@kubb-alpha/swagger-swr'),
  '@kubb/swagger-client': import('@kubb-alpha/swagger-client'),
} as const

const beta = {
  '@kubb/core': import('@kubb-beta/core'),
  '@kubb/swagger': import('@kubb-beta/swagger'),
  '@kubb/swagger-ts': import('@kubb-beta/swagger-ts'),
  '@kubb/swagger-tanstack-query': import('@kubb-beta/swagger-tanstack-query'),
  '@kubb/swagger-zod': import('@kubb-beta/swagger-zod'),
  '@kubb/swagger-zodios': import('@kubb-beta/swagger-zodios'),
  '@kubb/swagger-faker': import('@kubb-beta/swagger-faker'),
  '@kubb/swagger-msw': import('@kubb-beta/swagger-msw'),
  '@kubb/swagger-swr': import('@kubb-beta/swagger-swr'),
  '@kubb/swagger-client': import('@kubb-beta/swagger-client'),
} as const

const canary = {
  '@kubb/core': import('@kubb-canary/core'),
  '@kubb/swagger': import('@kubb-canary/swagger'),
  '@kubb/swagger-ts': import('@kubb-canary/swagger-ts'),
  '@kubb/swagger-tanstack-query': import('@kubb-canary/swagger-tanstack-query'),
  '@kubb/swagger-zod': import('@kubb-canary/swagger-zod'),
  '@kubb/swagger-zodios': import('@kubb-canary/swagger-zodios'),
  '@kubb/swagger-faker': import('@kubb-canary/swagger-faker'),
  '@kubb/swagger-msw': import('@kubb-canary/swagger-msw'),
  '@kubb/swagger-swr': import('@kubb-canary/swagger-swr'),
  '@kubb/swagger-client': import('@kubb-canary/swagger-client'),
} as const

const versions = {
  latest,
  canary,
  alpha,
  beta,
} as const

//! WE NEED TO LOG OS BECAUSE ELSE NEXTJS IS NOT INCLUDING OAS INSIDE THE BUNDLE(PRODUCTION BUILD)
console.log(typeof oas, typeof oasNormalize)

export const buildKubbFiles = async (
  config: ParserBody['config'],
  version: ParserBody['version'],
  tanstackVersion: ParserBody['tanstackVersion'],
  mswVersion: ParserBody['mswVersion'],
) => {
  const latestCore = await latest['@kubb/core']
  const packages = versions[version as keyof typeof versions] || latest

  const core = (await packages['@kubb/core']) as typeof latestCore

  const combinedConfig =
    config ||
    ({
      root: './',
      output: {
        path: 'gen',
      },
      plugins: [
        ['@kubb/swagger', { output: false }],
        ['@kubb/swagger-ts', { output: 'models.ts' }],
        ['@kubb/swagger-zod', { output: './zod' }],
        ['@kubb/swagger-react-query', { output: './hooks' }],
        ['@kubb/swagger-zodios', { output: 'zodios.ts' }],
        ['@kubb/swagger-faker', { output: 'mocks' }],
      ],
    } as const)

  const promises = combinedConfig.plugins?.map(async (plugin) => {
    if (!Array.isArray(plugin)) {
      return plugin
    }

    const [name, options = {}] = plugin as [name: keyof Omit<typeof packages, '@kubb/core'>, any]
    const pluginImport = await packages[name]

    if (!pluginImport) {
      throw new Error(`Cannot find ${pluginImport} ${name}`)
    }

    if (name === '@kubb/swagger') {
      return pluginImport.definePlugin({ ...options, validate: false })
    }

    return pluginImport.definePlugin(options)
  })

  const mappedPlugins = await Promise.all(promises as any)

  if ('setVersion' in core.PackageManager) {
    core.PackageManager.setVersion('@tanstack/react-query', tanstackVersion)
    core.PackageManager.setVersion('@tanstack/solid-query', tanstackVersion)
    core.PackageManager.setVersion('@tanstack/vue-query', tanstackVersion)
    core.PackageManager.setVersion('@tanstack/svelte-query', tanstackVersion)

    core.PackageManager.setVersion('msw', mswVersion)
  }

  const result = await core.build({
    config: {
      root: '.',
      ...combinedConfig,
      output: {
        ...combinedConfig.output,
        write: false,
      },
      plugins: mappedPlugins,
    },
  })

  return result.files
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { body } = req as { body: ParserBody }

      const files = await buildKubbFiles(body.config, body.version, body.tanstackVersion, body.mswVersion)

      res.status(200).json(files)
      return
    }
    res.status(200).send(undefined)
  } catch (err) {
    console.log(err, err.cause)
    res.status(500).json({ error: err?.message || err })
  }
}
