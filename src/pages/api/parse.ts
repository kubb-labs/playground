//! WE NEED TO IMPORT OS BECAUSE ELSE NEXTJS IS NOT INCLUDING OAS INSIDE THE BUNDLE(PRODUCTION BUILD)
import oas from 'oas'

import type { File } from '@kubb/core'
import { build, format } from '@kubb/core'
import createSwagger from '@kubb/swagger'
import createSwaggerTypescript from '@kubb/swagger-typescript'
import createSwaggerReactQuery from '@kubb/swagger-react-query'

import type { NextApiRequest, NextApiResponse } from 'next'

// interface KubbModule {
//   default(): Promise<unknown>
//   build: KubbBuild
// }

// export async function loadKubbCore(version: string): Promise<KubbModule> {
//   const packageName = '@kubb/core'
//   const entryFileName = 'index.js'
//   console.log(`https://cdn.jsdelivr.net/npm/${packageName}@${version}/dist/${entryFileName}`)
//   const build: KubbModule = await import(
//     /* webpackIgnore: true */
//     `https://cdn.jsdelivr.net/npm/${packageName}@${version}/dist/${entryFileName}`
//   )
//   await build.default()
//   return build

//   return {
//     default: () => Promise.resolve(),
//     build,
//   }
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      //! WE NEED TO IMPORT OS BECAUSE ELSE NEXTJS IS NOT INCLUDING OAS INSIDE THE BUNDLE(PRODUCTION BUILD)
      console.log(typeof oas)
      const { fileManager } = await build({
        config: {
          root: './',
          input: JSON.parse(req.body),
          output: {
            path: 'gen',
          },
          plugins: [createSwagger({ version: '3' }), createSwaggerTypescript({ output: 'models.ts' }), createSwaggerReactQuery({ output: './hooks' })],
        },
        mode: 'development',
      })

      const files = fileManager.files
        .map((file) => {
          return { ...file, source: file.fileName.endsWith('.ts') ? format(file.source) : file.source, path: file.path.split('/gen/')[1] }
        })
        .reduce((acc, file) => {
          if (!acc.find((item) => item.path === file.path)) {
            return [...acc, file]
          }
          return acc
        }, [] as File[])

      res.status(200).json(files)
      return
    }
    res.status(200).send(undefined)
  } catch (err) {
    console.log(err)
    res.status(500).send(undefined)
  }
}
