import { Component, Input } from '@angular/core';
import { User } from "../../../models/user";
import { UserService } from "../../../shared/user.service";
import { NavController, LoadingController, NavParams } from "ionic-angular";
import { ServerService } from "../../../shared/server.service";
import { ProfilePage } from "../profile";
import { SegmentEvents } from "../../../shared/analytics.model";
import { AnalyticsService } from "../../../shared/analytics.service";


@Component({
  selector: 'page-followlist',
  templateUrl: 'followlist.html'
})
export class FollowListPage {
  @Input() u: User;
  isFollowActive: boolean;

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams,  private analyticsService: AnalyticsService) {
    this.u = this.params.get("u");
    this.isFollowActive = true;
  }

  ionViewDidEnter() {
    let payload = {
      userCheckedFBID: this.u.facebook_id,
      contentLength: this.u.followList.length
    }
    this.analyticsService.trackScreen(SegmentEvents.FollowList, payload);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }
}
