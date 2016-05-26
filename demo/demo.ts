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
      background-color: #FD4140;
      border: solid 1px #121621;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #121621;
    }
  `],
  template: `
    <div class="text-center">
      <div class="rectangle" mwl-resizeable>Resize me!</div>
    </div>
  `
})
export class DemoApp {}
