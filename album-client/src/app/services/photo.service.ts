// src/app/services/photo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../shared/api-endpoints';
import { Photo } from '../models/photo.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieves photos for a user, optionally filtered by folder.
   * @param userId The ID of the user.
   * @param folderId (Optional) The ID of the folder to filter photos by.
   * @returns An Observable of an array of Photo objects.
   */
  getPhotos(userId: string, folderId?: number): Observable<Photo[]> {
    let params = new HttpParams().set('userId', userId);
    if (folderId) {
      params = params.set('folderId', folderId.toString());
    }
    return this.http.get<{ photos: Photo[] }>(API_ENDPOINTS.GET_PHOTOS, { params }).pipe(
      map(response => response.photos),
      catchError(error => {
        console.error('Error fetching photos:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Uploads a new photo.
   * @param userId The ID of the user.
   * @param folderId The ID of the folder.
   * @param title The title of the photo.
   * @param file The photo file to upload.
   * @returns An Observable of the uploaded Photo object.
   */
  uploadPhoto(
    userId: string,
    folderId: number,
    title: string,
    file: File
  ): Observable<Photo> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', title);
    formData.append('folderId', folderId.toString());
    formData.append('userId', userId);
    return this.http.post<{ photo: Photo }>(API_ENDPOINTS.UPLOAD_PHOTO, formData).pipe(
      map(response => response.photo),
      catchError(error => {
        console.error('Error uploading photo:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Renames a photo.
   * @param photoId The ID of the photo to rename.
   * @param title The new title for the photo.
   * @param userId The ID of the user.
   * @returns An Observable of the updated Photo object.
   */
  renamePhoto(photoId: number, title: string, userId: string): Observable<Photo> {
    return this.http.patch<{ photo: Photo }>(API_ENDPOINTS.RENAME_PHOTO(photoId), {
      title,
      userId,
    }).pipe(
      map(response => response.photo),
      catchError(error => {
        console.error('Error renaming photo:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Deletes a photo.
   * @param photoId The ID of the photo to delete.
   * @param userId The ID of the user.
   * @returns An Observable of any.
   */
  deletePhoto(photoId: number, userId: string): Observable<any> {
    return this.http.delete(API_ENDPOINTS.DELETE_PHOTO(photoId), {
      body: { userId } // Send userId in the request body
    }).pipe(
      catchError(error => {
        console.error('Error deleting photo:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Moves a photo to a different folder.
   * @param photoId The ID of the photo to move.
   * @param folderId The ID of the target folder.
   * @param userId The ID of the user.
   * @returns An Observable of the updated Photo object.
   */
  movePhoto(photoId: number, folderId: number, userId: string): Observable<Photo> {
    return this.http.patch<{ photo: Photo }>(API_ENDPOINTS.MOVE_PHOTO(photoId), {
      folderId,
      userId,
    }).pipe(
      map(response => response.photo),
      catchError(error => {
        console.error('Error moving photo:', error);
        return throwError(error);
      })
    );
  }
}
