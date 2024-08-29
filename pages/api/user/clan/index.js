import db from '@/lib/db';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(process.cwd(), 'public/clan_icon');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const clanId = req.body.id || req.query.id;
      if (!clanId) {
        return cb(new Error('Clan ID is required'), undefined);
      }
      cb(null, `${clanId}.png`);
    },
  }),
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  },
});

const CBOX_API_URL = 'https://www.cbox.ws/apis/threads.php?id=3-3539544-KPxXBl&key=e6ac3abc945bd9c844774459b6d2385a&act=mkthread';

export default async function handler(req, res) {
  const { method } = req;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  if (method === 'GET') {
    try {
      db.query('SELECT * FROM clans', (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } 
  else {
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
