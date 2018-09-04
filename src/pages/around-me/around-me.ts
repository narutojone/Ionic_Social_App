import { AfterViewInit, Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NavController, Navbar, NavParams, Platform, LoadingController, ModalController, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { googlemaps } from 'googlemaps';
import * as MarkerWithLabel from 'markerwithlabel';


import { Category } from '../../models/category';
import { Comment } from '../../models/comment';
import { MapService } from '../../shared/map.service';
import { Place } from '../../models/place';
import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { PlaceDetailPage } from "../place/place-detail";
import { Path } from "../../models/path";
import { UserService } from "../../shared/user.service";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { GeolocationService } from "../../shared/geolocation.service";

@Component({
  selector: 'page-around-me',
  templateUrl: 'around-me.html'
})
export class AroundMePage implements AfterViewInit {
  @ViewChild('aroundMeMap')
  private mapElement: ElementRef;

  @ViewChild('aroundMeNavBar')
  private navBar: Navbar;

  private paths: Array<Path>;
  private places: Array<Place>;
  private aroundMeMap: google.maps.Map;
  private markers: Array<google.maps.Marker>;
  private markersFull: Array<any>;
  private pathMarkers: Array<google.maps.Marker>;
  private markersPlace: Array<any>;
  private markerSize: number;
  private userMarker: any;
  private userImg = 'https://firebasestorage.googleapis.com/v0/b/pathtime-1360.appspot.com/o/utils%2Fbluecircle.png?alt=media&token=aebbe58b-c93f-4637-9b4d-ba8028a469f5';


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
              private userLocation: GeolocationService,
              private analyticsService: AnalyticsService) {
    this.paths = params.get("paths");
    this.places = params.get("places");
    this.markerSize = 48;
  }

  ionViewWillEnter() {
    // FIXME this.analyticsService.trackScreenPlanifications(SegmentEvents.AroundMe, this.planifications);
  }

  ngAfterViewInit() {
    this.aroundMeMap = new google.maps.Map(this.mapElement.nativeElement,
                                                this.mapService.getOptions());
    this.pathMarkers = new Array<any>();
    this.markers = new Array<any>();
    this.markersFull = new Array<any>();
    this.displayContent();
    this.displayUserPosition();
    this.mapReady();
  }

  private displayUserPosition(): void {
    var position = this.userLocation.getLastLocation();
    var myLatLng = new google.maps.LatLng(position.latitude, position.longitude);
    if (this.userMarker) {
      this.userMarker.setPosition(myLatLng);
    } else {
      this.userMarker = new google.maps.Marker({
          position: myLatLng,
          map: this.aroundMeMap,
          icon: this.userImg
      });
    }
    this.aroundMeMap.setCenter(myLatLng);
    this.aroundMeMap.setZoom(16);
    this.updateMarkerAccordingToZoom();
  }

   private displayContent(): void {
      this.paths.forEach(p => {
        let polyline = p.getPolyline();
        this.displayMarkersPath(p);
        polyline.setMap(this.aroundMeMap);
      });
      this.places.forEach(p => {
        this.displayMarker(p);
      });
      this.updateMarkerAccordingToZoom();
  }

  private displayMarkersPath(path: Path): void {
    path.places.forEach(p => {
      this.displayMarker(p);
    });
  }

  private displayMarker(place: Place): any {
      let markerLabel = MarkerWithLabel(google.maps);
      var marker = new markerLabel({
          position: place.getLatLng(),
          animation: google.maps.Animation.DROP,
          map: this.aroundMeMap,
          icon: ' ',
          labelContent: '<i class="ion-' + place.getFirstActivityTypeIcon() + '"></i>',
          labelClass: "creation-marker-label",
          labelAnchor: new google.maps.Point(25, 25)
        });
        this.markers.push(marker);
        let listener = google.maps.event.addListener(marker, 'click', () => {
          this.ngZone.run(() =>{
            this.goPlaceDetail(place);
          });
        });
        return marker;
  }


  mapReady(): void {
    let listener = google.maps.event.addListener(this.aroundMeMap, 'zoom_changed', () => {
      this.ngZone.run(() =>{
       this.updateMarkerAccordingToZoom();
      });
    });
  }

  updateMarkerAccordingToZoom(){
    if (this.markers.length > 0) {
          let markerLabel = MarkerWithLabel(google.maps);
          var zoom = this.aroundMeMap.getZoom();
          if (zoom < 13 && this.markerSize !=  12) {
            this.markers.forEach(m => {
              m.set('labelClass', "creation-marker-label12");
              m.set('labelAnchor', new google.maps.Point(6, 6));
              this.markerSize = 12;
            });
          }
          else if (zoom >= 13 && zoom <= 15 && this.markerSize != 24) {
            this.markers.forEach(m => {
              m.set('labelClass', "creation-marker-label24");
              m.set('labelAnchor', new google.maps.Point(12, 12));
              this.markerSize = 24;
            });
          }
          else if (zoom > 15 && this.markerSize != 48) {
            this.markers.forEach(m => {
              m.set('labelClass', "creation-marker-label");
              m.set('labelAnchor', new google.maps.Point(25, 25));
              this.markerSize = 48;
            });
          }
    }
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
