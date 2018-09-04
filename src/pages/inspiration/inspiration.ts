import { AfterViewInit, Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NavController, Navbar, NavParams, Platform, LoadingController, ModalController, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { googlemaps } from 'googlemaps';
import * as MarkerWithLabel from 'markerwithlabel';


import { Category } from '../../models/category';
import { Comment } from '../../models/comment';
import { MapService } from '../../shared/map.service';
import { Path } from '../../models/path';
import { Inspiration } from '../../models/inspiration';
import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { PathDetailPage } from "../path/path-detail";
import { PlaceDetailPage } from "../place/place-detail";
import { Place } from "../../models/place";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { PtTap } from "../../shared/ptTap.model";

@Component({
  selector: 'page-inspiration',
  templateUrl: 'inspiration.html'
})
export class InspirationPage implements AfterViewInit {
  @ViewChild('inspirationMap')
  private mapElement: ElementRef;

  @ViewChild('inspirationNavBar')
  private navBar: Navbar;

  private path: Path;
  private inspiration: Inspiration;
  private selected: Path;
  private inspirationMap: google.maps.Map;
  private pathMarkers: Array<google.maps.Marker>;
  private ptTap: PtTap;

  constructor(private navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private translate: TranslateService,
              private params: NavParams,
              private platform: Platform,
              private mapService: MapService,
              private server: ServerService,
              private ngZone: NgZone,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController, private analyticsService: AnalyticsService) {
    this.inspiration = params.get("inspirations");
    if (this.inspiration.paths.length > 0){
      this.selected = this.inspiration.paths[0];
    }
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenInspiration(SegmentEvents.Inspiration, this.inspiration);
  }

  ngAfterViewInit() {
    if (this.inspiration.paths.length > 0){
    this.inspirationMap = new google.maps.Map(this.mapElement.nativeElement, this.mapService.getOptions());
    this.pathMarkers = new Array<google.maps.Marker>();
    this.cleanContent();
    this.selectPath(this.inspiration.paths[0]);
    }
    else {
      this.translate.get('INSPIRATION.EMPTY').subscribe(
        value => {
          let alert = this.alertCtrl.create({
            title: value.TITLE,
            subTitle: value.TEXT,
            buttons: [
              {
                text: 'Ok',
                handler: () => {
                  alert.dismiss();
                  this.navCtrl.pop();
                  return true;
                }
              }
            ]
          });
        alert.present();
        }
      );
    }
  }

  touchStartPtTap($event) {
    this.ptTap = new PtTap(event);
  }

  touchEndPtTap($event) {
    return this.ptTap.needFire(event);
  }

  private cleanContent(): void {
    this.inspiration.paths.forEach(p => {
      p.cleanPolyline();
      this.cleanMarkers();
    });
  }

  private mapReady(): void {
    //this.placeDetails = new google.maps.places.PlacesService(this.inspirationMap);
  }

  private cleanMarkers(): void {
    this.pathMarkers.forEach(m => {
      m.setMap(null);
    });
  }

  private displayMarkers(path: Path): void {
    this.pathMarkers = new Array<google.maps.Marker>();
    path.places.forEach(p => {
      let markerLabel = MarkerWithLabel(google.maps);
      var marker = new markerLabel({
          position: p.getLatLng(),
          animation: google.maps.Animation.DROP,
          map: this.inspirationMap,
          icon: ' ',
          labelContent: '<i class="ion-' + p.getFirstActivityTypeIcon() + '"></i>',
          labelClass: "creation-marker-label",
          labelAnchor: new google.maps.Point(25, 25)
        });
        this.pathMarkers.push(marker);
        let listener = google.maps.event.addListener(marker, 'click', () => {
          this.ngZone.run(() =>{
            this.goPlaceDetail(p);
          });
        });
      });
  }

  private selectPath(path: Path): void {
    this.cleanContent();
    this.selected = path;
    this.selected.getPolyline();
    this.displayMarkers(this.selected);
    this.selected.polyline.setOptions({strokeOpacity: 1});
    this.selected.polyline.setMap(this.inspirationMap);
    this.mapService.ZoomToPath(this.inspirationMap, this.selected.polyline);
  }

  goPathDetail(): void {
    this.navCtrl.push(PathDetailPage, { path: this.selected });
  }

  goPlaceDetail(p: Place): void {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Place Infos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getPlace(p.google_id)
        .subscribe(place => {
          this.navCtrl.push(PlaceDetailPage, { place: place });
          loading.dismiss();
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
  }

}
