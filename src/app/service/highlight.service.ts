import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import 'prismjs';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';
import 'prismjs/components/prism-bash';

declare var Prism: any;

@Injectable()
export class HighlightService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              @Inject(DOCUMENT) private document: Document) {
  }

  highlightAll(callback?: any) {
    const _this = this;
    setTimeout(() => {
      if (isPlatformBrowser(_this.platformId)) {
        Prism.highlightAll(false, callback);
      }
    }, 1);
  }

  highlightAllUnder(container: any) {
    const _this = this;
    setTimeout(() => {
      if (isPlatformBrowser(_this.platformId)) {
        Prism.highlightAllUnder(container);
      }
    }, 1);
  }

  highlightAllUnderElementId(elementId: any) {
    const _this = this;
    setTimeout(() => {
      if (isPlatformBrowser(_this.platformId)) {
        Prism.highlightAllUnder(document.getElementById(elementId));
      }
    }, 1);
  }
}
