import { Component, Input } from '@angular/core';
import { Content } from "ionic-angular";


@Component({
  selector: 'pt-page-empty',
  templateUrl: 'empty-page.html'
})
export class EmptyPage {
  @Input() page: string;
  @Input() image: string;
  @Input() icon: string;
  @Input() light: boolean;

  constructor(private content: Content) {
  }

}
