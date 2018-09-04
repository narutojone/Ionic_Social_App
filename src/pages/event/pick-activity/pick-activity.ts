import { Component, Input } from '@angular/core';
import { User } from "../../../models/user";
import { UserService } from "../../../shared/user.service";
import { NavController, LoadingController, NavParams, ModalController, ViewController } from "ionic-angular";
import { ServerService } from "../../../shared/server.service";
import { PathDetailPage } from "../../path/path-detail";
import { Path } from "../../../models/path";
import { PlaceDetailPage } from "../../place/place-detail";
import { Place } from "../../../models/place";
import { AnalyticsService } from "../../../shared/analytics.service";
import { SegmentEvents } from "../../../shared/analytics.model";
import { PathTimeObject } from "../../../models/pathtime-object";
import { Group } from "../../../models/group";
import { Event } from "../../../models/event";
import { EventType } from "../../../models/enum";
import { EventCreationPage } from "../event-creation/event-creation";


@Component({
  selector: 'page-pick-activity',
  templateUrl: 'pick-activity.html'
})
export class PickActivityPage {
@Input() activities: Array<PathTimeObject>;
@Input() list_origin: string;
@Input() group: Group;

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController, public modalCtrl: ModalController, public viewCtrl: ViewController,
    private server: ServerService, public params: NavParams, private analyticsService: AnalyticsService) {
    this.activities = this.params.get("activities");
    this.list_origin = this.params.get("list_origin");
    this.group = this.params.get("group");
  }

  ionViewDidEnter() {
    let payload = {
      list_origin: this.list_origin,
      contentLength: this.activities.length
    }
    this.analyticsService.trackScreen(SegmentEvents.PickActivityPage, payload);
  }

  back() {
    this.viewCtrl.dismiss(null);
  }

  goPathDetail(p: Path): void {
    this.navCtrl.push(PathDetailPage, { path: p });
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

  selectActivity(pto: PathTimeObject){
    let event = new Event<PathTimeObject>();
    event.group = this.group;
    event.activity = pto;
    if (pto instanceof Path) {
      event.event_type = EventType.Path;
    } else {
      event.event_type = EventType.Place;
    }
    let createEventModal = this.modalCtrl.create(EventCreationPage, { event: event });
    createEventModal.onDidDismiss(data => {
      if (data)
      {
        this.viewCtrl.dismiss(data);
      }
    });
    createEventModal.present();
  }

}
