import { Component, Input } from '@angular/core';
import { NavController } from "ionic-angular";
import { UserService } from "../../../shared/user.service";
import { ProfilePage } from "../../../pages/profile/profile";
import { User } from "../../../models/user";
import { New } from "../../../models/new";



@Component({
  selector: 'pt-card-new-follow',
  templateUrl: 'new-follow-card.html'
})
export class NewFollowCard {
  @Input() news: New<any>;
  @Input() u: User;


  constructor(private navCtrl: NavController, private user: UserService) {
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

}
