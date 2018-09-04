import { Component, Input } from '@angular/core';
import { UserService } from "../../../shared/user.service";
import { NavController, LoadingController, NavParams } from "ionic-angular";
import { ServerService } from "../../../shared/server.service";
import { User } from "../../../models/user";
import { ProfilePage } from "../profile";
import { SegmentEvents } from "../../../shared/analytics.model";
import { AnalyticsService } from "../../../shared/analytics.service";


@Component({
  selector: 'page-followerlist',
  templateUrl: 'followerlist.html'
})
export class FollowerListPage {
  @Input() u: User;

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams,  private analyticsService: AnalyticsService) {
    this.u = this.params.get("u");
  }

  ionViewDidEnter() {
    let payload = {
      userCheckedFBID: this.u.facebook_id,
      contentLength: this.u.followerList.length
    }
    this.analyticsService.trackScreen(SegmentEvents.FollowerList, payload);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

}
