import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';

import { DemoComponent } from './app/demo.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(DemoComponent).catch((err) => console.error(err));
