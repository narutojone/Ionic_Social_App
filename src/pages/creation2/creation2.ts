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
  selector: 'page-creation2',
  templateUrl: 'creation2.html'
})
export class Creation2Page implements AfterViewInit {
  @Input() group: Group;

  @ViewChild('creation2Map')
  private mapElement: ElementRef;

  @ViewChild('creation2NavBar')
  private navBar: Navbar;

  @ViewChild('creation2Search')
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
  private activeDrag: boolean;

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
    private ngZone: NgZone,
    private localstorage: Localstorage,
    private dragulaService: DragulaService) {
    this.path = params.get("path");
    if (!this.path) {
      this.path = new Path();
    }
    this.group = this.params.get("group");
    this.placeView = false;
    this.deletedPlace = new Array<Place>();
    this.bounds = new google.maps.LatLngBounds();
    this.activeDrag = false;
    const bag: any = dragulaService.find('my-places');
    if (bag !== undefined) dragulaService.destroy('my-places');
    dragulaService.setOptions('my-places', {
      direction: 'horizontal'
    });
    dragulaService.drag.subscribe((value) => {
      this.onDragModel();
    });
    dragulaService.dragend.subscribe((value) => {
      this.onDragEndModel();
    });
    dragulaService.dropModel.subscribe((value) => {
      this.onDropModel(value.slice(1));
    });
    dragulaService.removeModel.subscribe((value) => {
      this.onDropModel(value.slice(1));
    });
  }

  private onDragModel() {
    this.activeDrag = true;
  }

  private onDragEndModel() {
    this.activeDrag = false;
  }

  private onDropModel(args) {
    this.localstorage.setPendingPath(this.path);
    this.clearnTemp();
    this.displayPath();
  }

  private onRemoveModel(args) {
    let [el, source] = args;
    this.localstorage.setPendingPath(this.path);
    this.clearnTemp();
    this.displayPath();
  }


  ionViewWillEnter() {
    this.analyticsService.trackScreen(SegmentEvents.Creation, {});
  }

  ngAfterViewInit() {
    this.creation2Map = new google.maps.Map(this.mapElement.nativeElement, this.mapService.getOptions());
    google.maps.event.addListenerOnce(this.creation2Map, 'idle', this.mapReady.bind(this));
    if (this.path.places.length == 0) {
      this.localstorage.getPendingPath().then(data => {
        var placesIds = JSON.parse(data);
        if (data && JSON.parse(data).length > 0) {
          let alert = this.alertCtrl.create({
            title: 'You left during a path creation',
            message: 'Do you want to continue your path creation?',
            buttons: [
              {
                text: 'No',
                role: 'cancel',
                handler: () => {
                  alert.dismiss();
                  this.localstorage.removePendingPath();
                  this.initCreation();
                  return false;
                }
              },
              {
                text: 'Yes',
                handler: () => {
                  if (placesIds.length == 0) {
                    this.initCreation();
                    return true;
                  } else {
                    this.initCreationFromOldPath(placesIds);
                    return true;
                  }
                }
              }
            ]
          });
          alert.present();
        }
      });
    }
    else {
      this.localstorage.setPendingPath(this.path);
      this.initCreation();
    }
  }

  private initCreationFromOldPath(placeIds) {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Recover your path'),
      dismissOnPageChange: true
    });

    loading.present();
    this.server.getPlacesFromIds(placeIds)
      .subscribe(places => {
        places.forEach(place => {
          this.path.places.push(place);
        });
        this.initCreation();
        loading.dismiss();
      }, error => {
        //FIXME: Dislplay Toast
        loading.dismiss();
      });
  }

  private initCreation() {
    this.displayContent();
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
    if (this.path.places.length < 1)
      this.creation2Map.setCenter(myLatLng);
  }


  private displayContent(): void {
    this.displayMarkers(this.path);
    this.path.getPolyline().setMap(this.creation2Map);
  }

  private displayMarkers(path: Path): void {
    this.pathMarkers = new Array<google.maps.Marker>();
    path.places.forEach(p => {
      let markerLabel = MarkerWithLabel(google.maps);
      var marker = new markerLabel({
        position: p.getLatLng(),
        animation: google.maps.Animation.DROP,
        map: this.creation2Map,
        icon: ' ',
        labelContent: '<i class="ion-' + p.getCategory(0).getIcon() + '"></i>',
        labelClass: "creation-marker-label",
        labelAnchor: new google.maps.Point(25, 25)
      });
      this.pathMarkers.push(marker);
      let listener = google.maps.event.addListener(marker, 'click', () => {
        this.ngZone.run(() => {
          this.goPlaceDetails(p);
        });
      });
    });
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
    this.placeView = true; //fixme put it elsewhere
  }

  selectPlace(place: Place): void {
    this.goPlaceDetails(place);
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

  deletePlace(place: Place): void {
    let index: number = this.path.places.indexOf(place);
    if (index !== -1) {
      this.path.places.splice(index, 1);
      this.localstorage.setPendingPath(this.path);
      this.clearnTemp();
      this.displayPath();
    }
  }

  createPath(): void {
    if (this.path.places.length < 2) {
      this.showPathAlert();
    }
    else {
      let pathModal = this.modalCtrl.create(PathValidationPage, { path: this.path });
      pathModal.onDidDismiss(data => {
        if (data) {
          this.path = new Path();
          this.localstorage.removePendingPath();
          this.clearnTemp();

          if (this.group) {
            let event = new Event<PathTimeObject>();
            event.group = this.group;
            event.activity = data.path;
            event.event_type = EventType.Path;
            let createEventModal = this.modalCtrl.create(EventCreationPage, { event: event });
            createEventModal.onDidDismiss(data => {
              if (data) {
                this.navCtrl.pop();
              }
            });
            createEventModal.present();
          } else {
            this.goPathDetail(data.path);
          }
        }
      });
      pathModal.present();
    }
  }

  goPathDetail(path: Path): void {
    this.navCtrl.push(PathDetailPage, { path: path });
  }

  addPlaceView() {
    this.placeView = true;
  }

  deletePlaceView() {
    this.clearnTemp()
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
          let placeModal = this.modalCtrl.create(PlaceDetailPage, { place: placeN, creation: true });
          placeModal.onDidDismiss(data => {
            if (data) {
              this.path.places.push(data.place);
              this.localstorage.setPendingPath(this.path);
              this.clearnTemp();
              this.displayPath();
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

  showPathAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You need to add at least 2 places to your path.',
      buttons: ['OK']
    });
    alert.present();
  }

  showPlaceAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You need to look for a place first.',
      buttons: ['OK']
    });
    alert.present();
  }

  showDeletePlaceAlert(place: Place) {
    let alert = this.alertCtrl.create({
      title: 'Remove this place',
      message: 'Do you really want to remove this place from your path?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.deletePlace(place);
          }
        }
      ]
    });
    alert.present();
  }

  clearnTemp() {
    if (this.tempMarker) {
      this.tempMarker.setMap(null);
    }
    this.searchbar.value = "";
    this.tempPlace = null;
    this.placeView = false;
    if (this.pathPolyline) {
      this.pathPolyline.setMap(null);
    }
    if (this.pathMarkers) {
      this.pathMarkers.forEach(marker => {
        marker.setMap(null);
      });
    }
    if (this.path.places.length < 1 && this.userLocation.getLastLocation()) {
      let position = this.userLocation.getLastLocation();
      let loc = new google.maps.LatLng(position.latitude, position.longitude);
      this.creation2Map.setCenter(loc);
    }
  }

  displayPath() {
    this.pathPolyline = this.path.getPolyline();
    this.pathPolyline.setMap(this.creation2Map);
    this.displayMarkers(this.path);
    if (this.path.places.length > 1) {
      this.mapService.ZoomToPath(this.creation2Map, this.pathPolyline);
    }
  }

}
