import { atom } from 'jotai'

import type { KubbUserConfig } from '@kubb/core'

export const codeAtom = atom('')

export const configAtom = atom<KubbUserConfig<true>>({
  root: '.',
  input: {
    path: './petStore.yaml',
  },
  output: {
    path: 'gen',
  },
  plugins: [
    ['@kubb/swagger', { version: '3' }],
    ['@kubb/swagger-typescript', { output: 'models.ts' }],
    ['@kubb/swagger-react-query', { output: 'hooks' }],
  ],
} as unknown as KubbUserConfig<true>)
