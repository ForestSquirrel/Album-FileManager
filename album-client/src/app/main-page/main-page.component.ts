import { Component, inject } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu'; // Import MatMenuModule
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ThemeService } from '../services/theme.service';
import { FolderTreeComponent } from '../folder-tree/folder-tree.component';
import { PhotoGridComponent, Photo } from '../photo-grid/photo-grid.component';
import { AuthService } from '../services/auth.service';

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
    MatCardModule
  ]
})
export class MainPageComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

    photosToDisplay: Photo[] = [];
    selectedFolderName: string = '';
  
    // Map of folder names to photos
    private folderPhotos: { [folderName: string]: Photo[] } = {};

    isLoggedIn = false;
    currentUser: string | null = null;

  constructor(
      private themeService: ThemeService,
      private cdr: ChangeDetectorRef,
      private authService: AuthService
    ) {
    
    // Simulate generating photos for each folder
    const folderNames = [
      'root-folder1',
      'Subfolder 1',
      'Subfolder 2',
      'root-folder2',
      'Subfolder 3',
      'Subfolder 4',
    ];

    folderNames.forEach((folderName) => {
      const photos: Photo[] = [];
      for (let i = 1; i <= 30; i++) {
        photos.push({
          id: `${folderName}-${i}`, // Ensure unique IDs
          title: `Photo ${i} in ${folderName}`,
          url: `https://via.placeholder.com/150`,
          folder: folderName,
        });
      }
      this.folderPhotos[folderName] = photos;
    });

    this.authService.getCurrentUser().subscribe((username) => {
      this.isLoggedIn = !!username;
      this.currentUser = username;
    });
  }
  ngOnInit(): void {
    const storedTheme = this.themeService.getStoredTheme();
    if (storedTheme) {
      this.themeService.setTheme(storedTheme);
    }
  }

  changeTheme(theme: string): void {
    this.themeService.setTheme(theme);
  }

  updatePhotos(folderName: string): void {
    this.selectedFolderName = folderName;
    // Retrieve the photos for the selected folder
    this.photosToDisplay = this.folderPhotos[folderName] || [];
  }

  onPhotoMoved(event: { photo: Photo; targetFolder: string }): void {
    const { photo, targetFolder } = event;

    // Remove the photo from its current folder
    const currentFolderPhotos = this.folderPhotos[photo.folder];
    if (currentFolderPhotos) {
      const index = currentFolderPhotos.findIndex((p) => p.id === photo.id);
      if (index > -1) {
        currentFolderPhotos.splice(index, 1);
      }
    }

    // Update the photo's folder property
    photo.folder = targetFolder;

    // Add the photo to the target folder
    if (!this.folderPhotos[targetFolder]) {
      this.folderPhotos[targetFolder] = [];
    }
    this.folderPhotos[targetFolder].push(photo);

    // If the current folder is selected, update the photosToDisplay
    if (
      this.selectedFolderName === photo.folder ||
      this.selectedFolderName === targetFolder
    ) {
      this.updatePhotos(this.selectedFolderName);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
