import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import React from 'react'

import type { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <title>Kubb Playground</title>
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default App
