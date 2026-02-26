import { openDB } from 'idb';

const DB_NAME = 'nexa-os-db';
const STORE_FILES = 'files';

export interface FileItem {
  id: number | string;
  name: string;
  type: 'folder' | 'note' | 'image' | 'file' | 'video' | 'music'; 
  category: 'documents' | 'pictures' | 'desktop' | 'system' | string; 
  content?: string;
  date: string;
  size?: string;
}

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
    },
  });
};

export const saveFileToDB = async (file: FileItem) => {
  const db = await initDB();
  return db.put(STORE_FILES, file);
};

export const getAllFilesFromDB = async (): Promise<FileItem[]> => {
  const db = await initDB();
  return db.getAll(STORE_FILES);
};

export const getFilesByCategory = async (category: string): Promise<FileItem[]> => {
  const db = await initDB();
  const allFiles: FileItem[] = await db.getAll(STORE_FILES);
  return allFiles.filter((f) => f.category === category);
};

export const deleteFileFromDB = async (id: number | string) => {
  const db = await initDB();
  return db.delete(STORE_FILES, id);
};

export const getFileById = async (id: number | string): Promise<FileItem | undefined> => {
  const db = await initDB();
  return db.get(STORE_FILES, id);
};