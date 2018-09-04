import { Component, Renderer } from '@angular/core';
import {   ViewController } from 'ionic-angular';

@Component({
  selector: 'event-selection-modal',
  templateUrl: 'modal-event-selection.html'
})
export class EventSelectionModal {

  text: string;

  constructor(public renderer: Renderer, public viewCtrl: ViewController) {
    this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'event-selection-modal', true);

  }

  closeModal(value) {
    this.viewCtrl.dismiss(value);
  }

}
