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
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

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
    MatMenuModule,
    AsyncPipe,
    NgIf,
    RouterModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class MainPageComponent implements OnInit {
  isHandset$: Observable<boolean>;
  isLoggedIn = false;
  currentUser: string | null = null;
  userId: string | null = null;

  folders: FolderNode[] = []; // input to folder tree
  photosToDisplay: Photo[] = []; // input to frid
  selectedFolder: FolderNode | null = null;
  searchQuery: string = ''; // Track search input

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

  updatePhotos(folder?: FolderNode): void {
    this.selectedFolder = folder || null;

    if (this.userId) {
      this.photoService
        .getPhotos(
          this.userId,
          this.selectedFolder ? this.selectedFolder.id : undefined,
          this.searchQuery ? this.searchQuery : undefined// Pass search query to the service
        )
        .subscribe((photos) => {
          this.photosToDisplay = photos;
          this.cdr.markForCheck();
        });
    }
  }

  onSearch(): void {
    this.updatePhotos();
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