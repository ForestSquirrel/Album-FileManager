// drag-drop.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DragDropService {
  private folderDropListIdsSubject = new BehaviorSubject<string[]>([]);
  folderDropListIds$ = this.folderDropListIdsSubject.asObservable();

  setFolderDropListIds(ids: string[]) {
    this.folderDropListIdsSubject.next(ids);
  }
}
