import { Component, Input } from '@angular/core';
import { User } from "../../../models/user";
import { UserService } from "../../../shared/user.service";
import { NavController, LoadingController, NavParams } from "ionic-angular";
import { ServerService } from "../../../shared/server.service";
import { PathDetailPage } from "../../path/path-detail";
import { Path } from "../../../models/path";
import { PlaceDetailPage } from "../../place/place-detail";
import { Place } from "../../../models/place";
import { AnalyticsService } from "../../../shared/analytics.service";
import { SegmentEvents } from "../../../shared/analytics.model";

@Component({
  selector: 'page-todos',
  templateUrl: 'todos.html'
})
export class TodosPage {
@Input() u: User;

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams, private analyticsService: AnalyticsService) {
    this.u = this.params.get("u");
  }

  refreshTodos() {
    let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Refresh Todos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getTodos(this.u)
        .subscribe(user => {
          this.u = user;
          loading.dismiss();
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
  }

  refreshPaths() {
    this.refreshTodos();
  }

  ionViewDidEnter() {
    let payload = {
      userCheckedFBID: this.u.facebook_id,
      contentLength: this.u.todos.length
    }
    this.analyticsService.trackScreen(SegmentEvents.Todos, payload);
  }

  goPathDetail(p: Path): void {
    this.navCtrl.push(PathDetailPage, { path: p, parentPage: this });
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
