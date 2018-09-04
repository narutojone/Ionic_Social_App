import { AfterViewInit, Component, ElementRef, ViewChild, NgZone, Input } from '@angular/core';
import { NavController, Navbar, NavParams, Platform, LoadingController, Searchbar, ModalController, AlertController } from 'ionic-angular';
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
import { Place } from "../../models/place";
import { GeolocationService } from "../../shared/geolocation.service";
import { PlaceDetailPage } from "../place/place-detail";
import { PathValidationPage } from "../path/path-validation";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { Localstorage } from "../../shared/localstorage.service";
import { DragulaService } from "ng2-dragula";
import { Group } from "../../models/group";
import { Event } from "../../models/event";
import { PathTimeObject } from "../../models/pathtime-object";
import { EventCreationPage } from "../event/event-creation/event-creation";
import { EventType } from "../../models/enum";


@Component({
  selector: 'page-creation-place',
  templateUrl: 'creation-place.html'
})
export class CreationPlacePage implements AfterViewInit {
  @Input() group: Group;

  @ViewChild('creationPlaceMap')
  private mapElement: ElementRef;

  @ViewChild('creationPlaceNavBar')
  private navBar: Navbar;

  @ViewChild('creationPlaceSearch')
  private searchbar: Searchbar;

  private searchBox: google.maps.places.Autocomplete;
  private path: Path;
  private bounds: google.maps.LatLngBounds;
  private selected: Path;
  private creation2Map: google.maps.Map;
  private placeDetails: google.maps.places.PlacesService;
  private tempMarker: google.maps.Marker;
  private tempPlace: google.maps.places.PlaceResult;
  private placeView: boolean;
  private pathPolyline: google.maps.Polyline;
  private pathMarkers: Array<google.maps.Marker>;
  private userImg = 'https://firebasestorage.googleapis.com/v0/b/pathtime-1360.appspot.com/o/utils%2Fbluecircle.png?alt=media&token=aebbe58b-c93f-4637-9b4d-ba8028a469f5';
  private userMarker: google.maps.Marker;
  private deletedPlace: Array<Place>;

  constructor(private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private userLocation: GeolocationService,
    private params: NavParams,
    private platform: Platform,
    private mapService: MapService,
    private server: ServerService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private analyticsService: AnalyticsService,
    private ngZone: NgZone) {
    this.bounds = new google.maps.LatLngBounds();
    this.group = this.params.get("group");
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreen(SegmentEvents.Creation, {});
  }

  ngAfterViewInit() {
    this.creation2Map = new google.maps.Map(this.mapElement.nativeElement, this.mapService.getOptions());
    google.maps.event.addListenerOnce(this.creation2Map, 'idle', this.mapReady.bind(this));
    this.initCreation();
  }

  private initCreation() {
    this.displayUserPosition();
  }

  private displayUserPosition(): void {
    var position = this.userLocation.getLastLocation();
    var myLatLng = new google.maps.LatLng(position.latitude, position.longitude);
    if (this.userMarker) {
      this.userMarker.setPosition(myLatLng);
    } else {
      this.userMarker = new google.maps.Marker({
        position: myLatLng,
        map: this.creation2Map,
        icon: this.userImg
      });
    }
    this.creation2Map.setCenter(myLatLng);
  }

  mapReady(): void {
    this.loadSearchBar();
  }

  loadSearchBar(): void {
    let loc = this.userLocation.getLastLocation();

    if (loc) {
      this.bounds.extend({ "lat": loc.latitude, "lng": loc.longitude });
    }

    this.searchBox = new google.maps.places.Autocomplete(this.searchbar._searchbarInput.nativeElement,
      { bounds: this.bounds });
    this.searchBox.addListener("place_changed", this.onPlaceChange.bind(this));
  }

  onPlaceChange() {
    this.tempPlace = this.searchBox.getPlace();
    this.creation2Map.setZoom(17);
    this.creation2Map.setCenter(this.tempPlace.geometry.location);
    this.tempMarker = new google.maps.Marker({
      position: this.tempPlace.geometry.location,
      map: this.creation2Map
    });
  }

  goPlaceDetails(place: Place): void {
    if (place.opening_hours) {
      this.navCtrl.push(PlaceDetailPage, { place: place });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Place Infos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getPlace(place.google_id)
        .subscribe(place => {
          place = place;
          this.navCtrl.push(PlaceDetailPage, { place: place });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  addPlace(place: google.maps.places.PlaceResult) {
    if (place) {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Place Infos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getPlace(place.place_id)
        .subscribe(placeN => {
          let dataModal = {};
          if (this.group) {
            dataModal = { place: placeN, creation: true, hideAlertSuccess: true };
          } else {
            dataModal = { place: placeN, creation: true };
          }
          let placeModal = this.modalCtrl.create(PlaceDetailPage, dataModal);
          placeModal.onDidDismiss(data => {
            if (data) {
              this.clearnTemp();
              if (this.group) {
                let event = new Event<PathTimeObject>();
                event.group = this.group;
                event.activity = data.place;
                event.event_type = EventType.Place;
                let createEventModal = this.modalCtrl.create(EventCreationPage, { event: event });
                createEventModal.onDidDismiss(data => {
                    this.navCtrl.pop();
                });
                createEventModal.present();
              }
              else {
                this.navCtrl.pop();
              }
            }
          });
          placeModal.present();
          loading.dismiss();
        }, error => {
          loading.dismiss();
        });
    }
    else {
      this.showPlaceAlert();
    }
  }

  showPlaceAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You need to look for a place first.',
      buttons: ['OK']
    });
    alert.present();
  }

  clearnTemp() {
    this.searchbar.value = "";
    this.tempPlace = null;
    if (this.userLocation.getLastLocation()) {
      let position = this.userLocation.getLastLocation();
      let loc = new google.maps.LatLng(position.latitude, position.longitude);
      this.creation2Map.setCenter(loc);
    }
  }

}
