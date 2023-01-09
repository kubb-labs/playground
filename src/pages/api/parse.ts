//! WE NEED TO IMPORT OS BECAUSE ELSE NEXTJS IS NOT INCLUDING OAS INSIDE THE BUNDLE(PRODUCTION BUILD)
import oas from 'oas'
import { format as prettierFormat } from 'prettier'

import type { File } from '@kubb/core'
import { build } from '@kubb/core'
import createSwagger from '@kubb/swagger'
import createSwaggerTypescript from '@kubb/swagger-typescript'
import createSwaggerReactQuery from '@kubb/swagger-react-query'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Options } from 'prettier'

const formatOptions: Options = {
  tabWidth: 2,
  printWidth: 160,
  parser: 'typescript',
  singleQuote: true,
  semi: false,
  bracketSameLine: false,
  endOfLine: 'auto',
}
export const format = (text?: string) => {
  if (!text) {
    return undefined
  }
  return prettierFormat(text, formatOptions)
}

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
