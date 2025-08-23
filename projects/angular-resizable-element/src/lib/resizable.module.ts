import { NgModule } from '@angular/core';
import { ResizableDirective } from './resizable.directive';
import { ResizeHandleDirective } from './resize-handle.directive';

/**
 * @deprecated import standalone `ResizableDirective` / `ResizeHandleDirective` directives instead
 */
@NgModule({
  imports: [ResizableDirective, ResizeHandleDirective],
  exports: [ResizableDirective, ResizeHandleDirective],
})
export class ResizableModule {}
