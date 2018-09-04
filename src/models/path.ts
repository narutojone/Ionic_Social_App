import { Injector } from '@angular/core';

import { appInjector } from '../shared/app-injector';
import { Comment } from './comment';
import { Companion } from './companion';
import { PathTimeObject } from './pathtime-object';
import { Place } from './place';
import { Mood } from './mood';
import { User } from './user';

import * as MarkerWithLabel from 'markerwithlabel';

import { ServerService } from '../shared/server.service';
import { MapService } from "../shared/map.service";
import { SegmentEvents } from "../shared/analytics.model";
import { AnalyticsService } from "../shared/analytics.service";

export class Path implements PathTimeObject {
  id: number;
  name: string;
  like: boolean;
  description: string;
  note: number;
  nb_notes: number;
  favorite: boolean;
  user: User;
  moods: Array<Mood>;
  places: Array<Place>;
  comments: Array<Comment<Path>>;
  preview_comments: Array<Comment<Path>>;
  user_comment: Comment<Path>;
  nb_likes: number;
  polyline: google.maps.Polyline;
  with: Array<Companion>;
  city: string;
  lat: number;
  lng: number;
  undone: boolean;
  nb_chats: number;
  markers: Array<google.maps.Marker>;

  private server: ServerService;
  private analyticsService: AnalyticsService;

  constructor() {
    let injector: Injector = appInjector(); // get the stored reference to the injector

    this.server = injector.get(ServerService);
    this.analyticsService = injector.get(AnalyticsService);
    this.preview_comments = new Array<Comment<Path>>();
    this.places = new Array<Place>();
    this.moods = new Array<Mood>();
    this.with = new Array<Companion>();
    this.comments = new Array<Comment<Path>>();
  }

  from(obj: Path) {
    this.id = obj.id;
    this.name = obj.name;
    this.like = obj.like;
    this.nb_likes = obj.nb_likes;
    this.note = obj.note;
    this.nb_notes = obj.nb_notes;
    this.description = obj.description;
    this.favorite = obj.favorite;
    this.polyline = obj.polyline;
    this.user = new User();
    this.user.from(obj.user);
    this.city = obj.city;
    this.lat = obj.lat;
    this.lng = obj.lng;
    this.undone = obj.undone;
    this.user_comment = obj.user_comment;
    this.nb_chats = obj.nb_chats;
    this.places = new Array<Place>();
    if (obj.places) {
      for (let i = 0; i < obj.places.length; ++i) {
        let place = new Place();
        place.from(obj.places[i]);
        //place.fillGoogleDetails();
        this.places.push(place);
      }
    }

    if (obj.moods) {
      this.moods = new Array<Mood>();
      for (var i = 0; i < obj.moods.length; ++i) {
        let m = new Mood();
        m.from(obj.moods[i]);
        this.moods.push(m);
      }
    }

    if (obj.with) {
      this.with = new Array<Companion>();
      for (var i = 0; i < obj.with.length; ++i) {
        let m = new Companion(null, null);
        m.from(obj.with[i]);
        this.with.push(m);
      }
    }

    this.comments = new Array<Comment<Path>>();
    if (obj.comments) {
      for (let i = 0; i < obj.comments.length; ++i) {
        let c = new Comment<Path>();
        c.from(obj.comments[i], null);
        this.comments.push(c);
      }
    }

    if (obj.preview_comments) {
      this.preview_comments = new Array<Comment<Path>>();
      for (var i = 0; i < obj.preview_comments.length; ++i) {
        let c = new Comment<Path>();
        c.from(obj.preview_comments[i], null);
        this.preview_comments.push(c);
      }
    }

  }

  stepsNumber(): number {
    return this.places.length;
  }

  commentsNumber(): number {
    return this.comments.length;
  }

  addStep(place: Place): void {
    this.places.push(place);
  }

  getCover(): string {
    return this.places[0].getCover();
    //return this.getMapImage();
  }

  getMapImage(): string {
    let url = "https://maps.googleapis.com/maps/api/staticmap"
    let api_key = "AIzaSyBH9YBhNuXsr6MkwihFU6cxTYVcmJl11xk"
    let places = "";
    let size = "800x800";
    this.places.forEach(p => {
      places += "|" + p.lat + "," + p.lng
    });
    let mapimage = url + "?" + MapService.get_static_style(MapService.getStyle()) + "&markers=" + places + "&path=color:0x0000ff|weight:5" + places + "&size=" + size + "&key=" + api_key;
    return mapimage;
  }

  getPolyline(): google.maps.Polyline {

    var flightPlanCoordinates = [];
    this.places.forEach(p => {
      flightPlanCoordinates.push(p.getLatLng());
    });

    var flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    this.polyline = flightPath;
    return flightPath;
  }

  cleanPolyline() {
    if (this.polyline) {
      this.polyline.setMap(null);
    }
  }

  drawMarkers(map: google.maps.Map): Array<google.maps.Marker> {
    if (!this.markers) {
      var markers = new Array<google.maps.Marker>();
      let markerLabel = MarkerWithLabel(google.maps);
      this.places.forEach(p => {
        var marker = new markerLabel({
          position: p.getLatLng(),
          animation: google.maps.Animation.DROP,
          map: map,
          icon: ' ',
          labelContent: '<i class="ion-' + p.getCategory(0).getIcon() + '"></i>',
          labelClass: "creation-marker-label",
          labelAnchor: new google.maps.Point(25, 25)
        });
        markers.push(marker);
      });
      this.markers = markers;
      return markers;
    }
    else {
      this.markers.forEach(m => {
        m.setMap(map);
      });
      return this.markers;
    }
  }

  getMarkers(): Array<google.maps.Marker> {
    if (!this.markers) {
      return new Array<google.maps.Marker>();
    }
    return this.markers;
  }

  cleanMarker() {
    this.getMarkers().forEach(m => {
      m.setMap(null);
    });
  }

  getFirstMood(): Mood {
    return this.moods[0];
  }

  hasMoods(): boolean {
    return this.moods.length > 0;
  }

  nbLike(): number {
    return 0;
  }

  isLiked(): boolean {
    return this.like;
  }

  isFavorite(): boolean {
    return this.favorite;
  }

  toggleLike(): void {
    if (!this.like) {
      this.like = true;
      this.nb_likes += 1;
      this.analyticsService.trackEvent(SegmentEvents.likePath, {path_id: this.id});
      this.server.likePath(this.id)
      .subscribe();
    } else {
      this.like = false;
      this.nb_likes -= 1;
      this.analyticsService.trackEvent(SegmentEvents.dislikePath, {path_id: this.id});
      this.server.dislikePath(this.id)
      .subscribe();
    }
  }

  toggleFavorite(): void {
    if (!this.favorite) {
      this.favorite = true;
      this.analyticsService.trackEvent(SegmentEvents.favorPath, {path_id: this.id});
      this.server.favorPath(this.id)
      .subscribe();
    } else {
      this.favorite = false;
      this.analyticsService.trackEvent(SegmentEvents.unfavorPath, {path_id: this.id});
      this.server.unfavorPath(this.id)
      .subscribe();
    }
  }

  hasMood(mood: Mood): boolean {
    var res = false;
    this.moods.forEach(m => {
      if (m.id == mood.id)
        res = true;
    });
    return res;
  }

  getMoodPosition(mood: Mood): number {
    var i = 0;
    var res = i;
    this.moods.forEach(m => {
      if (m.id == mood.id)
        res = i;
      else
        i += 1;
    });
    return res;
  }

  hasWith(who: Companion): boolean {
    return this.with.indexOf(who) >= 0;
  }

  addMood(mood: Mood): void {
    this.moods.push(mood);
  }

  removeMood(mood: Mood): void {
    let index = this.getMoodPosition(mood);

    if (index >= 0) {
      this.moods.splice(index, 1);
    }
  }

  addWith(withn: Companion): void {
    this.with.push(withn);
  }

  removeWith(withn: Companion): void {
    let index = this.with.indexOf(withn);

    if (index >= 0) {
      this.with.splice(index, 1);
    }
  }

  getCity(): string {
    if (this.city)
      return this.city;
    else
      return this.places[0].city;
  }

  getCityName(): string {
    if (this.getCity().split(',')[0] == "" && this.getCity().split(',')[1] != "")
      return this.getCity().split(',')[1]
    return this.getCity().split(',')[0];
  }

  getLat(): number {
    if (this.lat)
      return this.lat;
    else
      return this.places[0].lat;
  }

  getLng(): number {
    if (this.lng)
      return this.lng;
    else
      return this.places[0].lng;
  }

  getMoodsFromSteps(): Array<Mood> {
    let moods = new Array<Mood>();
    this.places.forEach(place => {
      place.moods.forEach(mood => {
        moods.push(mood);
      });
    });
    return moods;
  }

  getFirstActivityTypeName() {
    return this.places[0].getFirstActivityTypeName();
  }

  getCreatorName() {
    return this.user.getName();
  }
}
