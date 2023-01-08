//! WE NEED TO IMPORT OS BECAUSE ELSE NEXTJS IS NOT INCLUDING OAS INSIDE THE BUNDLE(PRODUCTION BUILD)
import oas from 'oas'

import { build } from '@kubb/core'
import createSwagger from '@kubb/swagger'
import createSwaggerTypescript from '@kubb/swagger-typescript'

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
      console.log(oas.name)
      const { fileManager } = await build({
        config: {
          root: './',
          input: JSON.parse(req.body),
          output: {
            path: 'gen',
          },
          plugins: [createSwagger({ version: '3' }), createSwaggerTypescript({ output: 'models.ts' })],
        },
        mode: 'development',
      })

      const file = fileManager.files.find((file) => file.fileName === 'models.ts')

      res.status(200).send(file?.source)
      return
    }
    res.status(200).send(undefined)
  } catch (err) {
    console.log(err)
    res.status(500).send(undefined)
  }
}
