import * as React from 'react'
import { useEffect } from 'react'

import { sandboxFactory } from './sandboxFactory'

export default function Terminal() {
  useEffect(() => {
    const { create, start } = sandboxFactory()
    async function creator() {
      const instance = await create()
      await start(instance, document.querySelector('.terminal'))

      instance.on('server-ready', (port, url) => {
        const iframe = document.querySelector('iframe')

        if (iframe) {
          iframe.src = url
        }
      })
    }

    creator()
  }, [])

  return (
    <>
      <iframe src="loading.html" allow="cross-origin-isolated"></iframe>
      <div className="terminal"></div>
    </>
  )
}
