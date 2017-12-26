import 'core-js';
import 'zone.js/dist/zone';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DemoModule } from './demo.module';

declare var ENV: string;
if (ENV === 'production') {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(DemoModule);
