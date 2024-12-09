import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Photo } from '../models/photo.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-photo-card',
  templateUrl: './photo-card.component.html',
  styleUrls: ['./photo-card.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
  ],
})
export class PhotoCardComponent {
  @Output() photoRenamed = new EventEmitter<Photo>();
  @Output() photoShared = new EventEmitter<Photo>();
  @Output() photoDeleted = new EventEmitter<Photo>();

  constructor(
    public dialogRef: MatDialogRef<PhotoCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { photo: Photo }
  ) {}

  editPhoto(): void {
    this.photoRenamed.emit(this.data.photo);
  }

  sharePhoto(): void {
    this.photoShared.emit(this.data.photo);
  }

  deletePhoto(): void {
    this.photoDeleted.emit(this.data.photo);
    this.dialogRef.close();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  downloadPhoto(): void {
    fetch(this.data.photo.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then((blob) => {
        const blobURL = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobURL;
        link.download = this.data.photo.title || 'photo';
        link.click();
        URL.revokeObjectURL(blobURL); // Clean up the object URL
      })
      .catch((error) => {
        console.error('Error downloading photo:', error);
      });
  }
}
