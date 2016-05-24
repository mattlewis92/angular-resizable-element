import {Component} from '@angular/core';
import {HelloWorld} from './../angular2-resizable';

@Component({
  selector: 'demo-app',
  directives: [HelloWorld],
  template: '<hello-world></hello-world>'
})
export class DemoApp {}
