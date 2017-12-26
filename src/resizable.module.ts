import {NgModule} from '@angular/core';
import {Resizable} from './resizable.directive';
import {ResizeHandle} from './resize-handle.directive';

@NgModule({
  declarations: [Resizable, ResizeHandle],
  exports: [Resizable, ResizeHandle]
})
export class ResizableModule {}
