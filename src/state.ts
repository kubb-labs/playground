import { atom } from 'jotai'

import type { UserConfig } from '@kubb/core'
import { Base64 } from 'js-base64'
import { ungzip } from 'pako'

export const STORAGE_KEY = 'v2.code'

const url = new URL(location.href)
const encodedInput = url.searchParams.get('code')
const storedInput = localStorage.getItem(STORAGE_KEY)

export const codeAtom = atom(encodedInput ? ungzip(Base64.toUint8Array(encodedInput), { to: 'string' }) : storedInput || '')

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
