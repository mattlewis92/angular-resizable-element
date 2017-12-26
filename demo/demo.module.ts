import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ResizableModule } from '../src';
import { DemoComponent } from './demo.component';

@NgModule({
  declarations: [DemoComponent],
  imports: [BrowserModule, ResizableModule],
  bootstrap: [DemoComponent]
})
export class DemoModule {}
