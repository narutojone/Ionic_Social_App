import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NavController, AlertController, LoadingController } from "ionic-angular";
import { UserService } from "../../../shared/user.service";
import { ProfilePage } from "../../../pages/profile/profile";
import { User } from "../../../models/user";
import { ServerService } from "../../../shared/server.service";
import { Group } from "../../../models/group";
import { GroupDetailPage } from "../../../pages/group/group-detail/group-detail";



@Component({
  selector: 'pt-card-group',
  templateUrl: 'group-card.html'
})
export class GroupCard {
  @Input() group: Group;
  @Input() needSelectionAction: boolean;
  @Output() selectAction = new EventEmitter();

  constructor(private navCtrl: NavController, private user: UserService, private loadingCtrl: LoadingController, private server: ServerService) {
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  goGroupDetail(): void {
    console.log(this.needSelectionAction);
    if (!this.needSelectionAction) {
      this.navCtrl.push(GroupDetailPage, { group: this.group });
    }
  }

  selectGroup() {
    this.selectAction.emit();
  }

}
