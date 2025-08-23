// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import 'zone.js/plugins/mocha-patch';
import { getTestBed } from '@angular/core/testing';

import { use } from 'chai';
import sinonChai from 'sinon-chai';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

use(sinonChai);

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
  { teardown: { destroyAfterEach: true } },
);
