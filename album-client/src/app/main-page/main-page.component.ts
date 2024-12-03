import { Component, inject, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ThemeService } from '../services/theme.service';
import { FolderTreeComponent } from '../folder-tree/folder-tree.component';
import { PhotoGridComponent} from '../photo-grid/photo-grid.component';
import { AuthService } from '../services/auth.service';
import { FolderService, FolderNode } from '../services/folder.service';
import { PhotoService } from '../services/photo.service';
import { Photo } from '../models/photo.model';

import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    FolderTreeComponent,
    PhotoGridComponent,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatMenuModule, // Add MatMenuModule here
    AsyncPipe,
    NgIf,
    RouterModule,
    MatCardModule,
  ]
})
export class MainPageComponent implements OnInit {
  isHandset$: Observable<boolean>;
  isLoggedIn = false;
  currentUser: string | null = null;
  userId: string | null = null;

  folders: FolderNode[] = [];
  photosToDisplay: Photo[] = [];
  selectedFolder: FolderNode | null = null;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private folderService: FolderService,
    private photoService: PhotoService
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay()
    );
  }

  ngOnInit(): void {
    const storedTheme = this.themeService.getStoredTheme();
    if (storedTheme) {
      this.themeService.setTheme(storedTheme);
    }

    this.authService.getCurrentUser().subscribe((username) => {
      this.isLoggedIn = !!username;
      this.currentUser = username;
    });

    this.authService.getCurrentUserId().subscribe((userId) => {
      this.userId = userId;
      if (userId) {
        this.loadFolders();
      }
    });
  }

  loadFolders(): void {
    if (this.userId) {
      this.folderService.getFolders(this.userId).subscribe((folders) => {
        this.folders = folders;
        this.cdr.markForCheck();
      });
    }
  }

  updatePhotos(folder: FolderNode): void {
    this.selectedFolder = folder;
    if (this.userId && folder.id) {
      this.photoService.getPhotos(this.userId, folder.id).subscribe((photos) => {
        this.photosToDisplay = photos;
        this.cdr.markForCheck();
      });
    }
  }

  onPhotoMoved(event: { photo: Photo; targetFolderId: number }): void {
    const { photo, targetFolderId } = event;
    if (this.userId) {
      this.photoService
        .movePhoto(photo.id, targetFolderId, this.userId)
        .subscribe(() => {
          this.updatePhotos(this.selectedFolder!);
        });
    }
  }

  changeTheme(theme: string): void {
    this.themeService.setTheme(theme);
  }

  logout(): void {
    this.authService.logout();
  }

  handlePhotoDeleted(photo: Photo): void {
    if (this.userId) {
      this.photoService.deletePhoto(photo.id, this.userId).subscribe(() => {
        this.photosToDisplay = this.photosToDisplay.filter((p) => p.id !== photo.id);
        this.cdr.markForCheck();
      });
    }
  }
  
  handlePhotoRenamed(photo: Photo): void {
    if (this.userId) {
      const newTitle = prompt('Enter new title:', photo.title);
      if (newTitle && newTitle !== photo.title) {
        this.photoService.renamePhoto(photo.id, newTitle, this.userId).subscribe((updatedPhoto) => {
          const index = this.photosToDisplay.findIndex((p) => p.id === updatedPhoto.id);
          if (index !== -1) {
            this.photosToDisplay[index] = updatedPhoto;
            this.cdr.markForCheck();
          }
        });
      }
    }
  }
  
  handlePhotoShared(photo: Photo): void {
    const staticUrl = `${photo.url}`;
    navigator.clipboard.writeText(staticUrl).then(() => {
      alert('Photo link copied to clipboard!');
    });
  }

  refreshPhotos(): void {
    if (this.selectedFolder) {
      this.updatePhotos(this.selectedFolder);
    }
  }
}