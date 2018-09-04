import { Component, Renderer } from '@angular/core';
import {   ViewController } from 'ionic-angular';

@Component({
  selector: 'new-event-modal',
  templateUrl: 'modal-new-event.html'
})
export class NewEventModal {


  constructor(public renderer: Renderer, public viewCtrl: ViewController) {
    this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'new-event-modal', true);

  }

  selectValue(value) {
    this.viewCtrl.dismiss(value);
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }



}
