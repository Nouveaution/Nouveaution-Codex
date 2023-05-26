import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'experimental-edge',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(200).json({ name: 'John Doe' });
}
