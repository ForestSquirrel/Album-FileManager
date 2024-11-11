// folder-tree.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventEmitter, Output } from '@angular/core';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Photo } from '../photo-grid/photo-grid.component';
import { DragDropService } from '../services/drag-drop.service';

interface FolderNode {
  name: string;
  children?: FolderNode[];
}

const TREE_DATA: FolderNode[] = [
  {
    name: 'root-folder1',
    children: [
      { name: 'Subfolder 1' },
      {
        name: 'Subfolder 2',
        children: [{ name: 'Subfolder 2.1' }, { name: 'Subfolder 2.2' }],
      },
    ],
  },
  {
    name: 'root-folder2',
    children: [{ name: 'Subfolder 3' }, { name: 'Subfolder 4' }],
  },
];

@Component({
  selector: 'app-folder-tree',
  templateUrl: './folder-tree.component.html',
  styleUrls: ['./folder-tree.component.scss'],
  standalone: true,
  imports: [MatTreeModule, MatButtonModule, MatIconModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolderTreeComponent implements OnInit {
  dataSource: FolderNode[] = TREE_DATA;
  // Function to access children of a node.
  childrenAccessor = (node: FolderNode) => node.children ?? [];

  // Function to determine if a node has children.
  hasChild = (_: number, node: FolderNode) =>
    !!node.children && node.children.length > 0;

  // Emit the selected folder to parent components
  @Output() folderSelected = new EventEmitter<FolderNode>();

  selectedNode: FolderNode | null = null;

  @Output() photoMoved = new EventEmitter<{
    photo: Photo;
    targetFolder: string;
  }>();

  constructor(
    private cdr: ChangeDetectorRef,
    private dragDropService: DragDropService
  ) {}

  ngOnInit(): void {
    this.updateFolderDropListIds();
  }

  ngOnChanges(): void {
    this.updateFolderDropListIds();
  }

  // Method to handle node selection
  selectNode(node: FolderNode, event: Event): void {
    event.stopPropagation(); // Prevent the event from bubbling up
    this.selectedNode = node;
    this.folderSelected.emit(node);
    console.log(this.selectedNode.name.toString());
  }

  uploadPhoto(): void {
    if (this.selectedNode) {
      // For now, we'll just alert the folder name
      alert(`Uploading photo to folder: ${this.selectedNode.name}`);
      // Implement actual upload logic here
    } else {
      alert('Please select a folder to upload the photo.');
    }
  }

  // Method to handle creating a new folder
  createFolder(): void {
    if (this.selectedNode) {
      const folderName = prompt('Enter the name of the new folder:');
      if (folderName) {
        // Assign a new array to 'children' to avoid mutating in place
        this.selectedNode.children = [
          ...(this.selectedNode.children || []),
          { name: folderName },
        ];

        // Update the dataSource to trigger change detection
        this.dataSource = [...this.dataSource];
        this.dataSource = JSON.parse(JSON.stringify(this.dataSource));

        console.log(this.dataSource);
        console.log('New folder added:', folderName);

        // Update the folder drop list IDs
        this.updateFolderDropListIds();
      }
    } else {
      alert('Please select a folder to create a new subfolder.');
    }
  }

  onDrop(event: CdkDragDrop<any>, targetNode: FolderNode): void {
    // Get the dropped photo data
    const photo: Photo = event.item.data;

    // Emit an event to notify the parent component (MainPageComponent)
    this.photoMoved.emit({ photo, targetFolder: targetNode.name });

    console.log("Drop");
    // Optional: Provide visual feedback or additional handling
  }

  getDropListId(node: FolderNode): string {
    // Generate a unique id for each node
    return 'folderDropList-' + node.name;
  }

  updateFolderDropListIds(): void {
    // Traverse the tree to get all folder drop list ids
    const ids: string[] = [];
    this.collectFolderDropListIds(this.dataSource, ids);
    this.dragDropService.setFolderDropListIds(ids);
  }

  collectFolderDropListIds(nodes: FolderNode[], ids: string[]): void {
    for (const node of nodes) {
      ids.push(this.getDropListId(node));
      if (node.children) {
        this.collectFolderDropListIds(node.children, ids);
      }
    }
  }
}
