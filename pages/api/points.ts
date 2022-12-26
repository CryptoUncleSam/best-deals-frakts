// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {main} from "./frakt-logic.js"


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const json = await main(JSON.parse(req.body))
  res.status(200).json({ list: json })
  return json
}
