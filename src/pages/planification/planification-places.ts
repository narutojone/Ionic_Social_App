import { Component, Input } from '@angular/core';
import { User } from "../../../models/user";
import { UserService } from "../../shared/user.service";
import { NavController, LoadingController, NavParams, ModalController, ViewController } from "ionic-angular";
import { ServerService } from "../../shared/server.service";
import { Planification } from "../../models/planification";
import { Place } from "../../models/place";
import { PlaceDetailPage } from "../place/place-detail";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";


@Component({
  selector: 'page-planification-places',
  templateUrl: 'planification-places.html'
})
export class PlanificationPlacesPage {
  @Input() planification: Planification;
  private place: Place;

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, private modalCtrl: ModalController,
    private viewCtrl: ViewController,
     public params: NavParams, private analyticsService: AnalyticsService) {
    this.planification = this.params.get("planification");
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPlanificationPlaces(SegmentEvents.PlanificationPlaces, this.planification);
  }

  back() {
    this.viewCtrl.dismiss(null);
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
          let placeModal = this.modalCtrl.create(PlaceDetailPage, { place: place, creation: true, unique: true });
          placeModal.onDidDismiss(data => {
            if (data) {
              this.place = data.place;
              this.dismiss();
            }
          });
          placeModal.present();
          loading.dismiss();
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  dismiss() {
    let data = { place: this.place };
    this.viewCtrl.dismiss(data);
  }

}
