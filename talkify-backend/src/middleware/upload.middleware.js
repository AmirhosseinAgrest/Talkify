// src/middleware/upload.middleware.js

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_CONFIG } from '../utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../data/uploads');

const getDestination = (file) => {
  const mimeType = file.mimetype;

  if (UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return path.join(uploadsDir, 'images');
  }
  if (UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return path.join(uploadsDir, 'videos');
  }
  if (UPLOAD_CONFIG.ALLOWED_AUDIO_TYPES.includes(mimeType)) {
    return path.join(uploadsDir, 'audios');
  }
  return path.join(uploadsDir, 'files');
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getDestination(file));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadsDir, 'avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.userId}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ...UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES,
    ...UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES,
    ...UPLOAD_CONFIG.ALLOWED_AUDIO_TYPES,
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const imageFilter = (req, file, cb) => {
  if (UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadMessageFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
  },
});

export const getMessageType = (mimeType) => {
  if (UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (UPLOAD_CONFIG.ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio';
  return 'file';
};