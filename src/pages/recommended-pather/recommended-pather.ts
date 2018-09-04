import { Component, Input } from '@angular/core';
import { NavController, LoadingController, NavParams } from "ionic-angular";
import { UserService } from "../../shared/user.service";
import { ServerService } from "../../shared/server.service";
import { AnalyticsService } from "../../shared/analytics.service";
import { User } from "../../models/user";
import { SegmentEvents } from "../../shared/analytics.model";
import { ProfilePage } from "../profile/profile";


@Component({
  selector: 'page-recommended-pather',
  templateUrl: 'recommended-pather.html'
})
export class RecommendedPatherPage {

  @Input() pathers: Array<User>

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams,  private analyticsService: AnalyticsService) {
      this.pathers = this.params.get("pathers");
  }

  ionViewDidEnter() {
    this.analyticsService.trackScreen(SegmentEvents.RecommendedPather, {});
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  refresh$(event): void {
    this.server.getRecommendedPather()
      .subscribe(pathers => {
        this.pathers = pathers;
      });

    setTimeout(() => {
      event.complete();
    }, 1000);
  }
}
