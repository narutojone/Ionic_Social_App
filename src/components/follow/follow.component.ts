import { Component, Input } from '@angular/core';
import { Path } from "../../models/path";
import { NavController } from "ionic-angular";
import { PerformPathPage } from "../../pages/perform/perform-path";
import { UserService } from "../../shared/user.service";
import { User } from "../../models/user";
import { ServerService } from "../../shared/server.service";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";

@Component({
  selector: 'pt-follow',
  templateUrl: 'follow.html'
})
export class Follow {
  @Input() u: User;

  constructor(private navCtrl: NavController, private user: UserService, private server: ServerService, private analyticsService: AnalyticsService) {
  }


  toggleFollow(): void {
    if (!this.u.isFollowed) {
      this.u.isFollowed = true;
      this.analyticsService.trackEvent(SegmentEvents.addFollow, {user: this.analyticsService.trackSimpleUser(this.u)});
      this.server.addFollow(this.u)
      .subscribe(nuser => {
        this.u.points = nuser.points;
        this.u.rank = nuser.rank;
        this.u.follows = nuser.follows;
        this.u.followers = nuser.followers;
      });

    } else {
      this.u.isFollowed = false;
      this.analyticsService.trackEvent(SegmentEvents.deleteFollow, {user: this.analyticsService.trackSimpleUser(this.u)});
      this.server.deleteFollow(this.u)
      .subscribe( nuser => {
        this.u.points = nuser.points;
        this.u.rank = nuser.rank;
        this.u.follows = nuser.follows;
        this.u.followers = nuser.followers;
      });
    }
  }
}
