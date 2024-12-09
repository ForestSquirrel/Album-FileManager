import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  OnDestroy,
  EventEmitter,
  Output
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropService } from '../services/drag-drop.service';
import { Subscription } from 'rxjs';
import { Photo } from '../models/photo.model';
import { PhotoCardComponent } from '../photo-card/photo-card.component';

@Component({
  selector: 'app-photo-grid',
  templateUrl: './photo-grid.component.html',
  styleUrls: ['./photo-grid.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatPaginatorModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    DragDropModule,
  ],
})
export class PhotoGridComponent implements OnInit, OnChanges, OnDestroy {
  @Input() photos: Photo[] = [];
  @Output() photoDeleted = new EventEmitter<Photo>();
  @Output() photoRenamed = new EventEmitter<Photo>();
  @Output() photoShared = new EventEmitter<Photo>();

  pageSizeOptions = [6, 8, 18, 24];
  pageSize = 6;
  pageIndex = 0;

  pagedPhotos: Photo[] = [];

  gridCols = 3;
  rowHeight = 'fit';

  folderDropListIds: string[] = [];
  private subscription!: Subscription;

  constructor(
    private dragDropService: DragDropService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.updatePagedPhotos();
    this.updateGridLayout();

    this.subscription = this.dragDropService.folderDropListIds$.subscribe((ids) => {
      this.folderDropListIds = ids;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photos']) {
      this.pageIndex = 0;
      this.updatePagedPhotos();
    }
  }

  editPhoto(photo: Photo): void {
    this.photoRenamed.emit(photo);
  }

  sharePhoto(photo: Photo): void {
    this.photoShared.emit(photo);
  }

  deletePhoto(photo: Photo): void {
    this.photoDeleted.emit(photo);
  }


  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedPhotos();
    this.updateGridLayout();
  }

  updatePagedPhotos(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedPhotos = this.photos.slice(startIndex, endIndex);
  }

  updateGridLayout(): void {
    const layoutConfig: { [key: number]: { cols: number } } = {
      6: { cols: 3 },
      8: { cols: 4 },
      18: { cols: 6 },
      24: { cols: 6 },
    };

    const config = layoutConfig[this.pageSize] || { cols: 3 };

    this.gridCols = config.cols;
  }

  onPhotoDrop(event: CdkDragDrop<Photo[]>): void {
    // Optional: Handle drop events within the photo grid (e.g., rearranging photos)
  }

  openCard(photo: Photo): void {
    const dialogRef = this.dialog.open(PhotoCardComponent, {
      width: '400px',
      data: { photo },
    });

    dialogRef.componentInstance.photoRenamed.subscribe((updatedPhoto: Photo) =>
      this.photoRenamed.emit(updatedPhoto)
    );
    dialogRef.componentInstance.photoShared.subscribe((sharedPhoto: Photo) =>
      this.photoShared.emit(sharedPhoto)
    );
    dialogRef.componentInstance.photoDeleted.subscribe((deletedPhoto: Photo) =>
      this.photoDeleted.emit(deletedPhoto)
    );
  }

  downloadPhoto(photo: Photo): void {
    // Fetch the file to ensure it's blob data
    fetch(photo.url)
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
        link.download = photo.title || 'photo';
        // Programmatically click the link to trigger the "Save As" dialog
        link.click();
        URL.revokeObjectURL(blobURL); // Clean up the object URL
      })
      .catch((error) => {
        console.error('Error downloading photo:', error);
      });
  }
  
}
