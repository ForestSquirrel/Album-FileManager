// folder-tree.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnChanges,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import { DragDropService } from '../services/drag-drop.service';
import { FolderService, FolderNode } from '../services/folder.service';
import { AuthService } from '../services/auth.service';
import { Photo } from '../models/photo.model';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-folder-tree',
  templateUrl: './folder-tree.component.html',
  styleUrls: ['./folder-tree.component.scss'],
  standalone: true,
  imports: [MatTreeModule, MatButtonModule, MatIconModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolderTreeComponent implements OnInit, OnChanges {
  @Input() dataSource: FolderNode[] = [];
  @Output() folderSelected = new EventEmitter<FolderNode>();
  @Output() photoMoved = new EventEmitter<{ photo: Photo; targetFolderId: number }>();
  @Output() photoUploaded = new EventEmitter<void>();


  selectedNode: FolderNode | null = null;
  userId: string | null = null;

  treeControl = new NestedTreeControl<FolderNode>((node) => node.subfolders);

  hasChild = (_: number, node: FolderNode) => !!node.subfolders && node.subfolders.length > 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private folderService: FolderService,
    private authService: AuthService,
    private dragDropService: DragDropService,
    private photoService: PhotoService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUserId().subscribe((userId) => {
      this.userId = userId;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource']) {
      if (this.dataSource && this.dataSource.length > 0) {
        this.initializeTree();
      }
    }
  }

  initializeTree(): void {
    // Re-initialize tree control and drag-drop service whenever dataSource changes
    this.treeControl.dataNodes = this.dataSource;
    this.updateFolderDropListIds();
    this.cdr.markForCheck();
  }

  selectNode(node: FolderNode, event: Event): void {
    event.stopPropagation();
  
    if (this.selectedNode === node) {
      // If the node is already selected, deselect it
      this.selectedNode = null;
      this.folderSelected.emit(undefined);
    } else {
      // Otherwise, select the new node
      this.selectedNode = node;
      this.folderSelected.emit(node);
    }
  }

  uploadPhoto(): void {
    if (this.selectedNode && this.userId) {
      // Create a hidden file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; // Accept images only
  
      fileInput.onchange = (event: any) => {
        const file: File = event.target.files[0];
        if (file) {
          const title = prompt('Enter a title for the photo:', file.name);
          if (title !== null) {
            this.photoService
              .uploadPhoto(this.userId!, this.selectedNode!.id, title, file)
              .subscribe(
                (uploadedPhoto) => {
                  alert('Photo uploaded successfully.');
                  // Optionally, refresh the photos in the selected folder
                  this.photoUploaded.emit(); // Emit an event to notify parent components
                },
                (error) => {
                  console.error('Error uploading photo:', error);
                  alert(error.error.message || 'An error occurred while uploading the photo.');
                }
              );
          }
        }
      };
  
      // Trigger the file input dialog
      fileInput.click();
    } else {
      alert('Please select a folder to upload the photo.');
    }
  }

  createFolder(): void {
    if (this.selectedNode && this.userId) {
      const folderName = prompt('Enter the name of the new folder:');
      if (folderName) {
        this.folderService
          .createFolder(this.userId, folderName, this.selectedNode.id)
          .subscribe((newFolder) => {
            if (!this.selectedNode!.subfolders) {
              this.selectedNode!.subfolders = [];
            }
            this.selectedNode!.subfolders.push(newFolder);
            this.updateFolderDropListIds();
            this.cdr.markForCheck();
          });
      }
    } else {
      alert('Please select a folder to create a new subfolder.');
    }
  }

  deleteFolder(): void {
    if (this.selectedNode && this.userId) {
      if (this.selectedNode.parent_id === null) {
        alert('Cannot delete the root folder.');
        return;
      }
  
      const confirmDelete = confirm(
        `Are you sure you want to delete the folder "${this.selectedNode.name}"?`
      );
      if (confirmDelete) {
        this.folderService.deleteFolder(this.selectedNode.id, this.userId).subscribe(
          () => {
            // Remove the folder from the tree
            this.removeFolderFromTree(this.dataSource, this.selectedNode!.id);
            this.selectedNode = null;
            this.updateFolderDropListIds();
            this.cdr.markForCheck();
          },
          (error) => {
            console.error('Error deleting folder:', error);
            alert(error.error.message || 'An error occurred while deleting the folder.');
          }
        );
      }
    }
  }

  renameFolder(): void {
    if (this.selectedNode && this.userId) {
      const newName = prompt('Enter the new name for the folder:', this.selectedNode.name);
      if (newName && newName !== this.selectedNode.name) {
        this.folderService
          .renameFolder(this.selectedNode.id, newName, this.userId)
          .subscribe((updatedFolder) => {
            this.selectedNode!.name = updatedFolder.name;
            this.cdr.markForCheck();
          });
      }
    }
  }

  onDrop(event: CdkDragDrop<any>, targetNode: FolderNode): void {
    const photo: Photo = event.item.data;
    this.photoMoved.emit({ photo, targetFolderId: targetNode.id });
  }

  getDropListId(node: FolderNode): string {
    return 'folderDropList-' + node.id;
  }

  updateFolderDropListIds(): void {
    const ids: string[] = [];
    this.collectFolderDropListIds(this.dataSource, ids);
    this.dragDropService.setFolderDropListIds(ids);
  }

  collectFolderDropListIds(nodes: FolderNode[], ids: string[]): void {
    for (const node of nodes) {
      ids.push(this.getDropListId(node));
      if (node.subfolders) {
        this.collectFolderDropListIds(node.subfolders, ids);
      }
    }
  }

  removeFolderFromTree(nodes: FolderNode[], folderId: number): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === folderId) {
        nodes.splice(i, 1);
        return true;
      } else if (nodes[i].subfolders) {
        const removed = this.removeFolderFromTree(nodes[i].subfolders!, folderId);
        if (removed) {
          return true;
        }
      }
    }
    return false;
  }
}