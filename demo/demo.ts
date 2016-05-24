import {Component} from '@angular/core';
import {Resizable} from './../angular2-resizable';

@Component({
  selector: 'demo-app',
  directives: [Resizable],
  styles: [`
    .rectangle {
      position: relative;
      top: 100px;
      width: 300px;
      height: 150px;
      background-color: red;
      border: solid 1px black;
      margin: auto;
    }
  `],
  template: `
    <div class="text-center">
      <div class="rectangle" mwl-resizeable></div>
    </div>
  `
})
export class DemoApp {}
