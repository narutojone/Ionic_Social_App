import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'modal-policy',
  templateUrl: 'policy.html'
})
export class PolicyModal implements OnInit {


  constructor(private view: ViewController) {
  }

  ngOnInit() {
  }


}
