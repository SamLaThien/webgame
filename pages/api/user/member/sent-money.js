import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { authorization } = req.headers;
  const { receiverId, amount } = req.body;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }
  if (!receiverId || !Number.isInteger(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Số bạc gửi phải là số nguyên!' });
  }

  const token = authorization.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;

    const [sender] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) reject(error);
        resolve(results || []);
      });
    });

    const [receiver] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [receiverId], (error, results) => {
        if (error) reject(error);
        resolve(results || []);
      });
    });

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const senderRole = parseInt(sender.clan_role, 10);
    const receiverRole = parseInt(receiver.clan_role, 10);

    if (sender.tai_san < amount) {
      return res.status(400).json({ message: 'Bạn không đủ bạc để tặng!' });
    }

    const today = new Date().toLocaleDateString('en-GB').split('/').join('');
    const dailyLimit = 50000;

    let totalSentToday = 0;
    let totalReceivedToday = 0;

    console.log(`Sender Role: ${senderRole}`);
    console.log(`Receiver Role: ${receiverRole}`);
    console.log(`Amount to be sent: ${amount}`);

    if (senderRole !== 9) {
      const [sentTodayResult] = await new Promise((resolve, reject) => {
        db.query(
          `SELECT COALESCE(SUM(amount), 0) AS total_sent 
           FROM transactions 
           WHERE sender_id = ? 
           AND DATE_FORMAT(timestamp, '%d%m%Y') = ?`,
          [userId, today],
          (error, results) => {
            if (error) reject(error);
            console.log('SQL Error or Results:', error, results); 
            resolve(results || [{ total_sent: 0 }]);
          }
        );
      });

      console.log('sentTodayResult:', sentTodayResult);

      totalSentToday = sentTodayResult.total_sent || 0;
      console.log(`Total sent today by sender (ID: ${userId}): ${totalSentToday}`);

      if (totalSentToday + amount > dailyLimit) {
        console.log('Exceeded daily sending limit.');
        return res.status(400).json({ message: 'Bạn đã tặng quá số lượng trong ngày hôm nay!' });
      }
    }

    if (receiverRole !== 9) {
      const [receivedTodayResult] = await new Promise((resolve, reject) => {
        db.query(
          `SELECT COALESCE(SUM(amount), 0) AS total_received 
           FROM transactions 
           WHERE receiver_id = ? 
           AND DATE_FORMAT(timestamp, '%d%m%Y') = ?`,
          [receiverId, today],
          (error, results) => {
            if (error) reject(error);
            console.log('SQL Error or Results:', error, results); 
            resolve(results || [{ total_received: 0 }]);
          }
        );
      });

      console.log('receivedTodayResult:', receivedTodayResult); 

      totalReceivedToday = receivedTodayResult.total_received || 0;
      console.log(`Total received today by receiver (ID: ${receiverId}): ${totalReceivedToday}`);

      if (totalReceivedToday + amount > dailyLimit) {
        console.log('Exceeded daily receiving limit.');
        return res.status(400).json({ message: 'Người này đã nhận quá số lượng trong ngày hôm nay!' });
      }
    }

    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET tai_san = tai_san - ? WHERE id = ?', [amount, userId], (error) => {
        if (error) reject(error);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET tai_san = tai_san + ? WHERE id = ?', [amount, receiverId], (error) => {
        if (error) reject(error);
        resolve();
      });
    });

    const senderLog = sender.ngoai_hieu ? `${sender.ngoai_hieu}` : sender.username;
    const receiverLog = receiver.ngoai_hieu ? `${receiver.ngoai_hieu}` : receiver.username;

    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, ?, ?, NOW())',
        [userId, 'Sent Money', `đã tặng ${amount} bạc cho ${receiverLog}`],
        (error) => {
          if (error) reject(error);
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, ?, ?, NOW())',
        [receiverId, 'Received Money', `${senderLog} đã tặng ${amount} bạc cho bạn`],
        (error) => {
          if (error) reject(error);
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO transactions (sender_id, receiver_id, amount, timestamp) VALUES (?, ?, ?, NOW())',
        [userId, receiverId, amount],
        (error) => {
          if (error) reject(error);
          resolve();
        }
      );
    });

    res.status(200).json({ message: `You have sent ${amount} coins successfully!` });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
}
