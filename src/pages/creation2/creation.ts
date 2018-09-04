import { Creation2Page } from "./creation2";
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { NavController, LoadingController, PopoverController, Searchbar, AlertController } from 'ionic-angular';
import { AnalyticsService } from "../../shared/analytics.service";
import { GeolocationService } from "../../shared/geolocation.service";
import { CreationPlacePage } from "./creation-place";
import { AroundMePage } from "../around-me/around-me";
import { ServerService } from "../../shared/server.service";
import { PushProvider } from "../../shared/pushprovider.service";

@Component({
  selector: 'page-creation',
  templateUrl: 'creation.html'
})
export class CreationPage implements AfterViewInit {
  private creationPathPage = Creation2Page;
  private creationPlacePage = CreationPlacePage;
  private loc: any;

  constructor(public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private location: GeolocationService,
    private translate: TranslateService,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private analyticsService: AnalyticsService,
    public pushProvider: PushProvider,
    private server: ServerService) {
  }

  ngAfterViewInit() {
    this.loc = this.location.getLastLocation();
  }

  goAroundMe() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Looking for places and paths around you'),
      dismissOnPageChange: true
    });
    loading.present();
    let bounds = new google.maps.LatLngBounds();
    if (this.loc) {
      bounds.extend({ "lat": this.loc.latitude, "lng": this.loc.longitude });
    }
    this.server.getAroundMe(this.loc.latitude, this.loc.longitude)
      .subscribe(res => {
        this.navCtrl.push(AroundMePage, { places: res.places, paths: res.paths });
      }, error => {
        //FIXME: Dislplay Toast
        loading.dismiss();
      });
  }

  goCreationPath() {
    if (this.loc) {
      this.navCtrl.push(Creation2Page, {});
    } else {
      this.loc = this.location.getLastLocation();
      console.log('new location is : ', this.loc);
      if (!this.loc) {
        let alert = this.alertCtrl.create({
          title: "GPS unavailable",
          subTitle: "Thanks to turn your gps on in order to create paths.",
          buttons: ['Ok']
        });
        alert.present();
      }
    }
  }

  goCreationPlace() {
    if (this.loc) {
      this.navCtrl.push(CreationPlacePage, {});
    } else {
      this.loc = this.location.getLastLocation();
      if (!this.loc) {
        let alert = this.alertCtrl.create({
          title: "GPS unavailable",
          subTitle: "Thanks to turn your gps on in order to create places.",
          buttons: ['Ok']
        });
        alert.present();
      }
    }
  }


}
