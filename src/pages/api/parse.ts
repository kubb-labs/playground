//! WE NEED TO IMPORT OS BECAUSE ELSE NEXTJS IS NOT INCLUDING OAS INSIDE THE BUNDLE(PRODUCTION BUILD)
import oas from 'oas'
import oasNormalize from 'oas-normalize'

import { build } from '@kubb/core'
import createSwagger from '@kubb/swagger'
import createSwaggerTs from '@kubb/swagger-ts'
import createSwaggerTanstackQuery from '@kubb/swagger-tanstack-query'
import createSwaggerSwr from '@kubb/swagger-swr'
import createSwaggerZod from '@kubb/swagger-zod'
import createSwaggerZodios from '@kubb/swagger-zodios'
import createSwaggerFaker from '@kubb/swagger-faker'

import type { NextApiRequest, NextApiResponse } from 'next'

//! WE NEED TO LOG OS BECAUSE ELSE NEXTJS IS NOT INCLUDING OAS INSIDE THE BUNDLE(PRODUCTION BUILD)
console.log(typeof oas, typeof oasNormalize)

export const buildKubbFiles = async (config: any) => {
  const combinedConfig = config || {
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
  }
  const mappedPlugins = combinedConfig.plugins?.map((plugin) => {
    if (Array.isArray(plugin)) {
      const [name, options = {}] = plugin as any[]

      if (name === '@kubb/swagger') {
        return createSwagger({ ...options, validate: false })
      }
      if (name === '@kubb/swagger-ts') {
        return createSwaggerTs(options)
      }
      if (name === '@kubb/swagger-tanstack-query') {
        return createSwaggerTanstackQuery(options)
      }
      if (name === '@kubb/swagger-swr') {
        return createSwaggerSwr(options)
      }
      if (name === '@kubb/swagger-zod') {
        return createSwaggerZod(options)
      }
      if (name === '@kubb/swagger-zodios') {
        return createSwaggerZodios(options)
      }
      if (name === '@kubb/swagger-faker') {
        return createSwaggerFaker(options)
      }
    }
    return plugin
  })

  const result = await build({
    config: {
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
      const { body } = req

      const files = await buildKubbFiles(body.config)

      res.status(200).json(files)
      return
    }
    res.status(200).send(undefined)
  } catch (err) {
    console.log(err, err.cause)
    res.status(500).json({ error: err?.message || err })
  }
}
