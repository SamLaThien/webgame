import db from '@/lib/db';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', ['POST']).status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { clanId } = req.body;

  if (!clanId) {
    return res.status(400).json({ message: 'Clan ID is required' });
  }

  try {
    const apiUrl = 'https://www.cbox.ws/apis/threads.php?id=3-3539544-KPxXBl&key=e6ac3abc945bd9c844774459b6d2385a&act=mkthread';
    const response = await fetch(apiUrl);
    const result = await response.text();
    const [status, threadId, threadKey] = result.split('\t');

    if (status === 'FAIL') {
      return res.status(500).json({ message: 'Failed to create Cbox thread', error: threadId });
    }

    await db.query(
      'UPDATE clans SET cbox_thread_id = ?, cbox_thread_key = ? WHERE id = ?',
      [threadId, threadKey, clanId]
    );

    return res.status(200).json({ threadId, threadKey });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
