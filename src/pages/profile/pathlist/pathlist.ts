import { Component, Input } from '@angular/core';
import { User } from "../../../models/user";
import { UserService } from "../../../shared/user.service";
import { NavController, LoadingController, NavParams } from "ionic-angular";
import { ServerService } from "../../../shared/server.service";
import { PathDetailPage } from "../../path/path-detail";
import { Path } from "../../../models/path";
import { PlaceDetailPage } from "../../place/place-detail";
import { Place } from "../../../models/place";
import { UndonePathDetailPage } from "../../path/undone-path-detail";
import { SegmentEvents } from "../../../shared/analytics.model";
import { AnalyticsService } from "../../../shared/analytics.service";

@Component({
  selector: 'page-pathlist',
  templateUrl: 'pathlist.html'
})
export class PathListPage {
  @Input() u: User;
  isPathActive = true;

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams, private analyticsService: AnalyticsService) {
    this.u = this.params.get("u");
  }

  refreshPathlist() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Refresh Pathlist'),
      dismissOnPageChange: true
    });

    loading.present();
    this.server.getPathList(this.u)
      .subscribe(user => {
        this.u = user;
        loading.dismiss();
      }, error => {
        //FIXME: Dislplay Toast
        loading.dismiss();
      });
  }

  refreshPaths() {
    this.refreshPathlist();
  }

  ionViewDidEnter() {
    let payload = {
      userCheckedFBID: this.u.facebook_id,
      contentLength: this.u.pathList.length
    }
    this.analyticsService.trackScreen(SegmentEvents.PathList, payload);
  }

  goPathDetail(p: Path): void {
    if (!p.undone) {
      this.navCtrl.push(PathDetailPage, { path: p, parentPage: this });
    } else {
      this.navCtrl.push(UndonePathDetailPage, { path: p, user: this.u, parentPage: this });
    }
  }

  goPlaceDetail(p: Place): void {
    if (p.opening_hours) {
      this.navCtrl.push(PlaceDetailPage, { place: p });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Place Infos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getPlace(p.google_id)
        .subscribe(place => {
          p = place;
          this.navCtrl.push(PlaceDetailPage, { place: p });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }
}
