import { Component, Renderer } from '@angular/core';
import {   ViewController } from 'ionic-angular';

@Component({
  selector: 'creation-modal',
  templateUrl: 'creation-modal.html'
})
export class CreationModal {


  constructor(public renderer: Renderer, public viewCtrl: ViewController) {
    this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'creation-modal', true);

  }

  selectValue(value) {
    this.viewCtrl.dismiss(value);
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}
