import { NgModule } from '@angular/core';
import { ResizableDirective } from './resizable.directive';
import { ResizeHandleDirective } from './resize-handle.directive';

@NgModule({
  declarations: [ResizableDirective, ResizeHandleDirective],
  exports: [ResizableDirective, ResizeHandleDirective],
})
export class ResizableModule {}
