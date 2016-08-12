import {NgModule} from '@angular/core';
import {Resizable, ResizeHandle} from './resizable.directive';

@NgModule({
  declarations: [Resizable, ResizeHandle],
  exports: [Resizable, ResizeHandle]
})
export class ResizableModule {}