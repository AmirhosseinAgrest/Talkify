// src/middleware/upload.middleware.js

import fs from 'fs';
import fsp from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromFile } from 'file-type';
import { UPLOAD_CONFIG } from '../utils/constants.js';
import { formatResponse } from '../utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const uploadsDir = path.join(__dirname, '../../data/uploads');

const UPLOAD_SUBDIRS = ['avatars', 'images', 'videos', 'audios', 'files'];

export const ensureUploadDirs = async () => {
  for (const sub of UPLOAD_SUBDIRS) {
    await fsp.mkdir(path.join(uploadsDir, sub), { recursive: true });
  }
};

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
};

const normalizeDetectedMime = (detected, declared) => {
  if (!detected) return null;
  const declaredIsAllowed = Object.hasOwn(MIME_TO_EXT, declared);

  const sameContainer =
    (detected === 'video/webm' && declared === 'audio/webm') ||
    (detected === 'audio/webm' && declared === 'video/webm') ||
    (detected === 'video/ogg' && declared === 'audio/ogg') ||
    (detected === 'audio/ogg' && declared === 'video/ogg') ||
    (detected === 'application/ogg' && declared === 'audio/ogg');
  if (sameContainer && declaredIsAllowed) return declared;

  const mp4Family = ['video/mp4', 'video/quicktime'];
  if (mp4Family.includes(detected) && mp4Family.includes(declared)) return declared;

  if (detected === 'audio/x-wav' && declared === 'audio/wav') return declared;

  return detected;
};

const getMessageDestination = (mimeType) => {
  if (UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'images';
  if (UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'videos';
  if (UPLOAD_CONFIG.ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audios';
  return 'files';
};

const makeStorage = (destinationFor) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(uploadsDir, destinationFor(file)));
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}.tmp`);
    },
  });

const messageStorage = makeStorage((file) => getMessageDestination(file.mimetype));
const avatarStorage = makeStorage(() => 'avatars');

const mimeFilter = (allowedTypes, message) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(message);
    error.statusCode = 400;
    cb(error, false);
  }
};

const MESSAGE_ALLOWED_TYPES = [
  ...UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES,
  ...UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES,
  ...UPLOAD_CONFIG.ALLOWED_AUDIO_TYPES,
];

const messageUploader = multer({
  storage: messageStorage,
  fileFilter: mimeFilter(MESSAGE_ALLOWED_TYPES, 'Invalid file type'),
  limits: { fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE, files: 1 },
});

const avatarUploader = multer({
  storage: avatarStorage,
  fileFilter: mimeFilter(UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES, 'Only image files are allowed'),
  limits: { fileSize: UPLOAD_CONFIG.MAX_AVATAR_SIZE, files: 1 },
});

const removeQuietly = async (filePath) => {
  if (!filePath) return;
  try {
    await fsp.unlink(filePath);
  } catch {
    void 0;
  }
};

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'File is too large',
  LIMIT_FILE_COUNT: 'Too many files',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
  LIMIT_PART_COUNT: 'Malformed upload request',
  LIMIT_FIELD_KEY: 'Malformed upload request',
  LIMIT_FIELD_VALUE: 'Malformed upload request',
  LIMIT_FIELD_COUNT: 'Malformed upload request',
};

const validateUpload = (allowedTypes) => async (req, res, next) => {
  const file = req.file;
  if (!file) return next();

  try {
    const detected = await fileTypeFromFile(file.path);
    const mime = normalizeDetectedMime(detected?.mime, file.mimetype);

    if (!mime || !allowedTypes.includes(mime) || mime !== file.mimetype) {
      await removeQuietly(file.path);
      return res.status(400).json(formatResponse(false, null, 'Invalid file type'));
    }

    const ext = MIME_TO_EXT[mime];
    const finalName = `${path.basename(file.filename, '.tmp')}.${ext}`;
    const finalPath = path.join(file.destination, finalName);

    await fsp.rename(file.path, finalPath);

    file.filename = finalName;
    file.path = finalPath;
    file.mimetype = mime;
    next();
  } catch (error) {
    await removeQuietly(file.path);
    next(error);
  }
};

const singleUpload = (uploader, field, allowedTypes) => {
  const handleMulter = uploader.single(field);
  const validate = validateUpload(allowedTypes);

  return (req, res, next) => {
    handleMulter(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          const message = MULTER_MESSAGES[err.code] || 'Malformed upload request';
          return res.status(400).json(formatResponse(false, null, message));
        }
        if (err.statusCode === 400) {
          return res.status(400).json(formatResponse(false, null, err.message));
        }
        if (/multipart|boundary|unexpected end of form/i.test(err.message || '')) {
          return res.status(400).json(formatResponse(false, null, 'Malformed upload request'));
        }
        return next(err);
      }
      validate(req, res, next);
    });
  };
};

export const upload = {
  single: (field) => singleUpload(messageUploader, field, MESSAGE_ALLOWED_TYPES),
};

export const uploadMessageFile = upload;

export const uploadAvatar = {
  single: (field) => singleUpload(avatarUploader, field, UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES),
};

export const getMessageType = (mimeType) => {
  if (UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (UPLOAD_CONFIG.ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio';
  return 'file';
};

export const resolveAvatarPath = (avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;
  if (!avatarUrl.startsWith('/uploads/avatars/')) return null;

  const fileName = path.basename(avatarUrl);
  if (!/^[a-f0-9-]+\.[a-z0-9]+$/i.test(fileName)) return null;

  const avatarsDir = path.join(uploadsDir, 'avatars');
  const resolved = path.resolve(avatarsDir, fileName);
  if (path.dirname(resolved) !== avatarsDir) return null;

  return resolved;
};

export const deleteAvatarFile = (avatarUrl) => {
  const avatarPath = resolveAvatarPath(avatarUrl);
  if (!avatarPath || !fs.existsSync(avatarPath)) return false;
  fs.unlinkSync(avatarPath);
  return true;
};
