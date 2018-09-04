import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { Place } from '../../models/place';

@Component({
  selector: 'pt-popover',
  templateUrl: 'planification-popover.html'
})
export class PlanificationPopover {
  @Input() places: Array<Place>;
  @Output() onSelected: EventEmitter<Place>;

  constructor(public viewCtrl: ViewController) {
    this.onSelected = new EventEmitter<Place>();
  }

}
