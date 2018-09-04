import { AfterViewInit, Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NavController, Navbar, NavParams, Platform, LoadingController, ModalController, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { googlemaps } from 'googlemaps';
import * as MarkerWithLabel from 'markerwithlabel';


import { Category } from '../../models/category';
import { Comment } from '../../models/comment';
import { MapService } from '../../shared/map.service';
import { Place } from '../../models/place';
import { Planification } from '../../models/planification';
import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { PlaceDetailPage } from "../place/place-detail";
import { PlanificationPlacesPage } from "./planification-places";
import { Path } from "../../models/path";
import { PathValidationPage } from "../path/path-validation";
import { UndonePathDetailPage } from "../path/undone-path-detail";
import { UserService } from "../../shared/user.service";
import { PerformPathPage } from "../perform/perform-path";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { PtTap } from "../../shared/ptTap.model";

@Component({
  selector: 'page-planification',
  templateUrl: 'planification.html'
})
export class PlanificationPage implements AfterViewInit {
  @ViewChild('planificationMap')
  private mapElement: ElementRef;

  @ViewChild('planificationNavBar')
  private navBar: Navbar;

  private planifications: Array<Planification>;
  private path: Path;
  private planificationMap: google.maps.Map;
  private markersPlans: Array<google.maps.Marker>;
  private markersPlansWithPlace: Array<any>;
  private placeView: boolean;
  private pathPolyline: google.maps.Polyline;
  private pathMarkers: Array<google.maps.Marker>;
  private markerSize: number;
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
              private alertCtrl: AlertController,
              private user: UserService,
              private analyticsService: AnalyticsService) {
    this.planifications = params.get("planifications");
    this.path = new Path();
    this.placeView = false;
    this.markerSize = 48;
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPlanifications(SegmentEvents.Planification, this.planifications);
  }

  ngAfterViewInit() {
    this.planificationMap = new google.maps.Map(this.mapElement.nativeElement,
                                                this.mapService.getOptions());
    this.markersPlans = new Array<any>();
    this.markersPlansWithPlace = new Array<any>();
    this.displayContent();
    this.mapReady();
  }

  touchStartPtTap($event) {
    this.ptTap = new PtTap(event);
  }

  touchEndPtTap($event) {
    return this.ptTap.needFire(event);
  }

   private displayContent(): void {
    if (this.path.places && this.path.places.length > 0) {
      this.displayPath();
    } else {
      this.planifications.forEach(p => {
        let markers = p.drawMarkers(this.planificationMap);
        markers.forEach(m => {
          this.markersPlansWithPlace.push(m);
          this.markersPlans.push(m.marker);
          let listener = google.maps.event.addListener(m.marker, 'click', () => {
            this.ngZone.run(() =>{
              this.goPlaceDetail(m.place);
            });
          });
        })
      });
      this.mapService.ZoomToMarkers(this.planificationMap, this.markersPlans);
      this.updateMarkerAccordingToZoom();
    }
  }

  mapReady(): void {
    let listener = google.maps.event.addListener(this.planificationMap, 'zoom_changed', () => {
      this.ngZone.run(() =>{
       this.updateMarkerAccordingToZoom();
      });
    });
  }

  updateMarkerAccordingToZoom(){
    if (this.markersPlansWithPlace.length > 0) {
          let markerLabel = MarkerWithLabel(google.maps);
          var zoom = this.planificationMap.getZoom();
          if (zoom < 13 && this.markerSize !=  12) {
            this.markersPlansWithPlace.forEach(m => {
              m.marker.set('labelClass', "creation-marker-label12");
              m.marker.set('labelAnchor', new google.maps.Point(6, 6));
              this.markerSize = 12;
            });
          }
          else if (zoom >= 13 && zoom <= 15 && this.markerSize != 24) {
            this.markersPlansWithPlace.forEach(m => {
              m.marker.set('labelClass', "creation-marker-label24");
              m.marker.set('labelAnchor', new google.maps.Point(12, 12));
              this.markerSize = 24;
            });
          }
          else if (zoom > 15 && this.markerSize != 48) {
            this.markersPlansWithPlace.forEach(m => {
              m.marker.set('labelClass', "creation-marker-label");
              m.marker.set('labelAnchor', new google.maps.Point(24, 24));
              this.markerSize = 48;
            });
          }
    }
  }

  private selectPlan(planification: Planification): void {
    let planificationModal = this.modalCtrl.create(PlanificationPlacesPage, { planification: planification });
    planificationModal.onDidDismiss(data => {
      if (data) {
        this.path.addStep(data.place);
        this.clearnTemp();
        this.displayContent();
      }
    });
    planificationModal.present();
  }

  deletePlace(place: Place): void {
    if (this.placeView) {
      let index: number = this.path.places.indexOf(place);
      if (index !== -1) {
          this.path.places.splice(index, 1);
          this.clearnTemp();
          this.displayContent();
      } 
    } else {
      this.addPlaceView();
    }
  }

  createPath(): void {
    if (this.path.places.length < 2) {
      this.showPathAlert();
    }
    else {
      let pathModal = this.modalCtrl.create(PathValidationPage, { path: this.path, unique: true });
      pathModal.onDidDismiss(data => {
        if (data) {
          this.clearnTemp();
          this.goPathDetail(data.path);
        }
      });
      pathModal.present();
    }
  }

  goPathDetail(path: Path): void {
    this.navCtrl.popToRoot();
    this.navCtrl.push(UndonePathDetailPage, { path: path, user: this.user.getUser() });
  }

  goPath(): void {
    if (this.path.places.length < 2) {
      this.showPathAlert();
    }
    else {

      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Create Path'),
        dismissOnPageChange: true
      });

      loading.present();
      this.path.name = this.user.getName() + ' at ' + new Date().toISOString();
      this.analyticsService.trackEvent(SegmentEvents.createUndonePath, {path: this.analyticsService.trackPathWithoutUser(this.path)});
      this.server.createUndonePath(this.path)
      .subscribe(path => {
        loading.dismiss();
        this.navCtrl.push(PerformPathPage, { path: path });
      }, error => {
              //FIXME: Dislplay Toast
          loading.dismiss();
      });
    }
  }

  goSeePlaceDetail(place: Place): void {
    this.navCtrl.push(PlaceDetailPage, { place: place });
  }

  private selectPlace(place: Place): void {
    this.goPlaceDetail(place);
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
          let placeModal = this.modalCtrl.create(PlaceDetailPage, { place: place, creation: true, unique: true });
          placeModal.onDidDismiss(data => {
            if (data) {
              this.path.addStep(data.place);
              this.clearnTemp();
              this.displayContent();
            }
          });
          placeModal.present();
          loading.dismiss();
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
  }

  addPlaceView(){
    this.placeView = true;
  }

  deletePlaceView(){
    this.placeView = false;
  }

  showPathAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You need to add at least 2 places to your path.',
      buttons: ['OK']
    });
    alert.present();
  }

  clearnTemp(){
    this.placeView = false;
    if (this.pathPolyline){
      this.pathPolyline.setMap(null);
    }
    if (this.pathMarkers){
      this.pathMarkers.forEach(marker => {
        marker.setMap(null);
      });
    }
    if (this.markersPlans){
      this.markersPlans.forEach(marker => {
        marker.setMap(null);
      });
    }
  }

  displayPath(){
    this.pathPolyline = this.path.getPolyline();
    this.pathPolyline.setMap(this.planificationMap);
    this.displayMarkers(this.path);
    //this.pathMarkers = this.path.drawMarkers(this.planificationMap);
    if (this.path.places.length > 0) {
      this.mapService.ZoomToPath(this.planificationMap, this.pathPolyline);
    }
  }

  private displayMarkers(path: Path): void {
    this.pathMarkers = new Array<google.maps.Marker>();
    path.places.forEach(p => {
      let markerLabel = MarkerWithLabel(google.maps);
      var marker = new markerLabel({
          position: p.getLatLng(),
          animation: google.maps.Animation.DROP,
          map: this.planificationMap,
          icon: ' ',
          scale: 1.0,
          fontSize: '14px',
          labelContent: '<i class="ion-' + p.getFirstActivityTypeIcon() + '"></i>',
          labelClass: "creation-marker-label",
          labelAnchor: new google.maps.Point(12, 12)
        });
        this.pathMarkers.push(marker);
        let listener = google.maps.event.addListener(marker, 'click', () => {
          this.ngZone.run(() =>{
            this.goSeePlaceDetail(p);
          });
        });
      });
  }

}
