import { Component, Renderer } from '@angular/core';
import {   ViewController } from 'ionic-angular';

@Component({
  selector: 'add-event-modal',
  templateUrl: 'add-event-modal.html'
})
export class AddEventModal {

  text: string;

  constructor(public renderer: Renderer, public viewCtrl: ViewController) {
    this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'add-event-modal', true);

  }

  closeModal(value) {
    this.viewCtrl.dismiss(value);
  }

}
