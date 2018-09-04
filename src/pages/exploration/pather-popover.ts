import { ApplicationRef, Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { User } from "../../models/user";
import { AutoCompleteComponent } from "ionic2-auto-complete";
import { CompleteFeedService } from "../../shared/complete-feed.service";
import { PtTap } from "../../shared/ptTap.model";


@Component({
  selector: 'pt-popover-pather',
  templateUrl: 'pather-popover.html'
})
export class PatherPopover {
  @Input() result: Array<User>;
  @Output() onPatherSelected = new EventEmitter<boolean>();


  @ViewChild('searchPather')
  private searchbar: AutoCompleteComponent;

  constructor(private viewCtrl: ViewController,
              private appRef: ApplicationRef, public completeFeedService: CompleteFeedService) {
  }

  addUser(user: User) {
    this.result.push(user);
    this.searchbar.setValue(user.firstname + ' ' + user.lastname);
    this.onPatherSelected.emit(true);
    this.appRef.tick();
  }
}
