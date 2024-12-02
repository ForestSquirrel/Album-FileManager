// src/app/shared/api-endpoints.ts

export const API_BASE_URL = 'https://forestsquirrel.me:3001/api/v1';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/users/login`,

  GET_FOLDERS: (userId: string) => `${API_BASE_URL}/folders?userId=${userId}`,
  CREATE_FOLDER: `${API_BASE_URL}/folders`,
  RENAME_FOLDER: (folderId: number) => `${API_BASE_URL}/folders/${folderId}`,
  DELETE_FOLDER: (folderId: number) => `${API_BASE_URL}/folders/${folderId}`,

  UPLOAD_PHOTO: `${API_BASE_URL}/photos`,
  RENAME_PHOTO: (photoId: number) => `${API_BASE_URL}/photos/${photoId}`,
  DELETE_PHOTO: (photoId: number) => `${API_BASE_URL}/photos/${photoId}`,
  MOVE_PHOTO: (photoId: number) => `${API_BASE_URL}/photos/${photoId}/move`,
  GET_PHOTOS: `${API_BASE_URL}/photos`,
  // Add other endpoints as needed
};

