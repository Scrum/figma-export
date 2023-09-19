import type { NextApiRequest, NextApiResponse } from 'next'
import { setItem } from '../../lib/auth-storage'

function isValid(cookieState: unknown, queryState: unknown): cookieState is string {
  return typeof cookieState === 'string' && typeof queryState === 'string'
    && cookieState !== '' && queryState !== ''
    && cookieState === queryState
}

function rnd(length: number) {
  let min = Math.pow(10, length - 1)
  let max = Math.pow(10, length) - 1
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const state = req.query.state
  const cookieState = req.cookies.state

  // delete `state` cookie
  res.setHeader('Set-Cookie', `state=; Path=/api/auth; Max-Age=0`)

  if (isValid(state, cookieState)) {
    const code = req.query.code
  
    const { FIGMA_APP_CLIENT_ID, FIGMA_APP_CLIENT_SECRET, FIGMA_APP_REDIRECT_URI } = process.env
    const auth = await fetch(
        `https://www.figma.com/api/oauth/token?client_id=${FIGMA_APP_CLIENT_ID}&client_secret=${FIGMA_APP_CLIENT_SECRET}&redirect_uri=${FIGMA_APP_REDIRECT_URI}&code=${code}&grant_type=authorization_code`,
        {
          method: 'POST'
        }
      )
      .then(r => r.json())
  
    const pin = rnd(6)
    setItem(`${state}:${pin}`, auth)
    res.status(307).redirect(`/auth/success#${pin}`)
  } else {
    res.status(443).json({ message: 'Access denied!' })
  }
}
