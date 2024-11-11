import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropService } from '../services/drag-drop.service';
import { Subscription } from 'rxjs';

export interface Photo {
  id: string;
  title: string;
  url: string;
  folder: string;
}

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

  pageSizeOptions = [6, 8, 18, 24];
  pageSize = 6;
  pageIndex = 0;

  pagedPhotos: Photo[] = [];

  gridCols = 3;
  rowHeight = 'fit';

  folderDropListIds: string[] = [];
  private subscription!: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dragDropService: DragDropService
  ) {}

  ngOnInit(): void {
    this.updatePagedPhotos();
    this.updateGridLayout();

    // Subscribe to folder drop list IDs
    this.subscription = this.dragDropService.folderDropListIds$.subscribe(
      (ids) => {
        this.folderDropListIds = ids;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photos']) {
      // Reset to the first page when photos change
      this.pageIndex = 0;
      this.updatePagedPhotos();
    }
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

  editPhoto(photo: Photo): void {}
  sharePhoto(photo: Photo): void {}

  deletePhoto(photo: Photo): void {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${photo.title}"?`
    );
    if (confirmDelete) {
      // Proceed with deletion
      const index = this.photos.findIndex((p) => p.id === photo.id);
      if (index > -1) {
        this.photos.splice(index, 1);
        // Update pagedPhotos
        this.updatePagedPhotos();
      }
    }
  }

  onPhotoDrop(event: CdkDragDrop<Photo[]>): void {
    // Optional: Handle drop events within the photo grid (e.g., rearranging photos)
  }
}
