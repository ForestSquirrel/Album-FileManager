// src/app/services/folder.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../shared/api-endpoints';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface FolderNode {
  id: number;
  name: string;
  user_id: number;
  parent_id: number | null;
  subfolders?: FolderNode[];
}

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  constructor(private http: HttpClient) {}

  getFolders(userId: string): Observable<FolderNode[]> {
    return this.http
      .get<{ folders: FolderNode[] }>(API_ENDPOINTS.GET_FOLDERS(userId))
      .pipe(
        map((response) => response.folders),
        catchError((error) => {
          console.error('Error fetching folders:', error);
          return throwError(error);
        })
      );
  }

  createFolder(
    userId: string,
    name: string,
    parentId: number | null
  ): Observable<FolderNode> {
    const payload = {
      name,
      parentId,
      userId,
    };

    return this.http
      .post<{ folder: FolderNode }>(API_ENDPOINTS.CREATE_FOLDER, payload)
      .pipe(
        map((response) => response.folder),
        catchError((error) => {
          console.error('Error creating folder:', error);
          return throwError(error);
        })
      );
  }

  renameFolder(
    folderId: number,
    name: string,
    userId: string
  ): Observable<FolderNode> {
    const payload = {
      name,
      userId,
    };

    return this.http
      .patch<{ folder: FolderNode }>(
        API_ENDPOINTS.RENAME_FOLDER(folderId),
        payload
      )
      .pipe(
        map((response) => response.folder),
        catchError((error) => {
          console.error('Error renaming folder:', error);
          return throwError(error);
        })
      );
  }

  deleteFolder(folderId: number, userId: string): Observable<any> {
    const options = {
      body: { userId },
    };

    return this.http
      .delete(API_ENDPOINTS.DELETE_FOLDER(folderId), options)
      .pipe(
        catchError((error) => {
          console.error('Error deleting folder:', error);
          return throwError(error);
        })
      );
  }
}
