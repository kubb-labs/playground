import { atom } from 'jotai'

import type { KubbUserConfig } from '@kubb/core'

export const codeAtom = atom('')

export const configAtom = atom<KubbUserConfig>({
  root: '.',
  input: {
    path: './petStore.yaml',
  },
  output: {
    path: 'gen',
  },
  plugins: [
    ['@kubb/swagger', {}],
    ['@kubb/swagger-ts', { output: 'models.ts' }],
    ['@kubb/swagger-zod', { output: 'zod' }],
    ['@kubb/swagger-tanstack-query', { output: 'hooks', framework: 'react' }],
  ],
} as unknown as KubbUserConfig)
