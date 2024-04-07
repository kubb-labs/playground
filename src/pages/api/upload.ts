

import type { NextApiRequest, NextApiResponse } from 'next'

export const config = { matcher: '/upload' }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { body } = req

      // const blob = await put(crypto.randomUUID(), body.input, {
      //   access: 'public',
      //   // 1 hour
      //   cacheControlMaxAge: 60 * 60,
      // })

      res.status(200).json({ url: '' })
      return
    }
    res.status(200).send(undefined)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err?.message || err })
  }
}
