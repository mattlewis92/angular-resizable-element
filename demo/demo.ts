import {Component} from '@angular/core';
import {Resizable} from './../angular2-resizable';

@Component({
  selector: 'demo-app',
  directives: [Resizable],
  styles: [`
    .rectangle {
      position: relative;
      top: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 300px;
      height: 150px;
      background-color: #FD4140;
      border: solid 1px #121621;
      color: #121621;
      margin: auto;
    }
  `],
  template: `
    <div class="text-center">
      <h1>Drag and pull the edges of the rectangle</h1>
      <div class="rectangle" mwl-resizeable (onResizeEnd)="log($event)"></div>
    </div>
  `
})
export class DemoApp {

  log(value: any): void {
    console.log(value);
  }

}
