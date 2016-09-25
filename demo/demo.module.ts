import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ResizableModule} from './../src';
import {Demo} from './demo.component';

@NgModule({
  declarations: [Demo],
  imports: [BrowserModule, ResizableModule],
  bootstrap: [Demo]
})
export class DemoModule {}