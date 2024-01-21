import { atom } from 'jotai'

import type { UserConfig } from '@kubb/core'

export const codeAtom = atom('')

export const configAtom = atom<UserConfig>({
  root: '.',
  input: {
    path: './petStore.yaml',
  },
  output: {
    path: 'gen',
  },
  plugins: [
    ['@kubb/swagger', {}],
    [
      '@kubb/swagger-ts',
      {
        output: {
          path: 'models.ts',
        },
      },
    ],
    [
      '@kubb/swagger-zod',
      {
        output: {
          path: 'zod',
        },
      },
    ],
    [
      '@kubb/swagger-tanstack-query',
      {
        output: {
          path: 'hooks',
        },
        framework: 'react',
      },
    ],
  ],
} as unknown as UserConfig)
