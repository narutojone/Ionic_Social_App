import { Injector } from '@angular/core';

import { appInjector } from '../shared/app-injector';
import { PathTimeObject } from './pathtime-object';
import { ServerService } from '../shared/server.service';
import { MapService } from "../shared/map.service";
import { Budget } from './enum';
import { Category } from './category';
import { Comment } from './comment';
import { Mood } from './mood';
import { TranslateService } from 'ng2-translate';


import { Observable } from 'rxjs/Observable';
import { SegmentEvents } from "../shared/analytics.model";
import { AnalyticsService } from "../shared/analytics.service";

export class Place implements PathTimeObject {
  id: number;
  name: string;
  description: string;
  activity_types: Array<Category>;
  address: string;
  price: Budget;
  google_id: string;
  lat: number;
  lng: number;
  images: Array<string>;
  favorite: boolean;
  like: boolean;
  note: number;
  nb_notes: number;
  nb_likes: number;
  moods: Array<Mood>;
  opening_hours: OpeningHours;
  international_phone_number: string;
  website: string;
  cover: string;
  city: string;
  undone: boolean;
  nb_chats: number;

  created: boolean;

  compatibility: number;
  comments: Array<Comment<Place>>;
  preview_comments: Array<Comment<Place>>;
  user_comment: Comment<Place>;

  private server: ServerService;
  private analyticsService: AnalyticsService;
  private translate: TranslateService;

  constructor() {
    let injector: Injector = appInjector(); // get the stored reference to the injector

    this.server = injector.get(ServerService);
    this.analyticsService = injector.get(AnalyticsService);
    this.activity_types = new Array<Category>();
    this.moods = new Array<Mood>();
    this.comments = new Array<Comment<Place>>();
    this.preview_comments = new Array<Comment<Place>>();
    this.images = new Array<string>();
    this.opening_hours = new OpeningHours();

    this.translate = injector.get(TranslateService);
    this.translate.get('PLACE.NO_DESCRIPTION').subscribe(value => {
      this.description = value;
    });
  }

  from(place: Place): void {
    this.id = place.id;
    this.name = place.name;
    this.description = place.description;
    this.address = place.address;
    this.price = place.price;
    this.google_id = place.google_id;
    this.lat = place.lat;
    this.lng = place.lng;
    this.favorite = place.favorite;
    this.like = place.like;
    this.nb_likes = place.nb_likes
    this.images = place.images;
    this.note = place.note;
    this.nb_notes = place.nb_notes;
    this.opening_hours = place.opening_hours;
    this.international_phone_number = place.international_phone_number;
    this.website = place.website;
    this.cover = place.cover;
    this.created = place.created;
    this.city = place.city;
    this.undone = place.undone;
    this.nb_chats = place.nb_chats;

    this.user_comment = place.user_comment;

    this.compatibility = place.compatibility;

    if (place.activity_types) {
      this.activity_types = new Array<Category>();
      for (var i = 0; i < place.activity_types.length; ++i) {
        let c = new Category();
        c.from(place.activity_types[i]);
        this.activity_types.push(c);
      }
    }

    if (place.moods) {
      this.moods = new Array<Mood>();
      for (var i = 0; i < place.moods.length; ++i) {
        let m = new Mood();
        m.from(place.moods[i]);
        this.moods.push(m);
      }
    }

    if (place.comments) {
      this.comments = new Array<Comment<Place>>();
      for (var i = 0; i < place.comments.length; ++i) {
        let c = new Comment<Place>();
        c.from(place.comments[i], null);
        this.comments.push(c);
      }
    }

    if (place.preview_comments) {
      this.preview_comments = new Array<Comment<Place>>();
      for (var i = 0; i < place.preview_comments.length; ++i) {
        let c = new Comment<Place>();
        c.from(place.preview_comments[i], null);
        this.preview_comments.push(c);
      }
    }

    if (!place.description || place.description == '') {
      this.translate.get('PLACE.NO_DESCRIPTION').subscribe(value => {
        this.description = value;
      });
    }
  }

  getLatLng(): any {
    return {
      lat: Number(this.lat),
      lng: Number(this.lng)
    };
  }

  getCover(): string {
    //FIXME: default cover...
    if (this.cover) return this.cover

    if (!this.images || this.images.length == 0) return 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb';

    return this.images[0];
  }

  getMapImage(): string {
    let url = "https://maps.googleapis.com/maps/api/staticmap"
    let api_key = "AIzaSyBH9YBhNuXsr6MkwihFU6cxTYVcmJl11xk"
    let place = "|" + this.lat + "," + this.lng;
    // let icon = "icon:ion-" + this.getCategory(0).getIcon();
    let size = "800x800";
    let mapimage = url + "?" + MapService.get_static_style(MapService.getStyle()) + "&markers=" + place + "&size=" + size + "&key=" + api_key;
    return mapimage;
  }

  nbLike(): number {
    return 0;
  }

  isLiked(): boolean {
    return this.like;
  }

  j(): boolean {
    return this.favorite;
  }

  toggleLike(): void {
    if (!this.like) {
      this.like = true;
      this.nb_likes += 1;
      this.analyticsService.trackEvent(SegmentEvents.likePlace, { place_id: this.id });
      this.server.likePlace(this.id)
        .subscribe();
    } else {
      this.like = false;
      this.nb_likes -= 1;
      this.analyticsService.trackEvent(SegmentEvents.dislikePlace, { place_id: this.id });
      this.server.dislikePlace(this.id)
        .subscribe();
    }
  }

  toggleFavorite(): void {
    if (!this.favorite) {
      this.favorite = true;
      this.analyticsService.trackEvent(SegmentEvents.favorPlace, { place_id: this.id });
      this.server.favorPlace(this.id)
        .subscribe();
    } else {
      this.favorite = false;
      this.analyticsService.trackEvent(SegmentEvents.unfavorPlace, { place_id: this.id });
      this.server.unfavorPlace(this.id)
        .subscribe();
    }
  }

  isFavorite(): boolean {
    return this.favorite;
  }

  getFirstMood(): Mood {
    if (this.hasMoods())
      return this.moods[0];
    else
      return null;
  }

  // getFirstMoods(i: number): Array<Mood> {
  //   let moods = new Array<Mood>();
  //   let j = 1;
  //   this.moods.forEach(m => {
  //     if (j <= i) {
  //       moods.push(m);
  //     }
  //     j = j + 1;
  //   });
  //   return moods;
  // }

  addComments(comments: Array<Comment<Place>>): void {
    for (let i = 0; i < comments.length; ++i) {
      let comment = new Comment<Place>();
      comment.from(comments[i], new Place());
      this.comments.push(comment);
    }
  }

  getCategory(index: number): Category {
    return this.activity_types[index];
  }

  getCategories(): Array<Category> {
    return this.activity_types;
  }

  hasCategories(): boolean {
    return this.activity_types.length > 0;
  }

  hasMoods(): boolean {
    return this.moods.length > 0;
  }

  addCategory(category: Category): void {
    this.activity_types.push(category);
  }

  removeCategory(category: Category): void {
    let index = this.activity_types.indexOf(category);

    if (index >= 0) {
      this.activity_types.splice(index, 1);
    }
  }

  hasCategory(category: Category): boolean {
    return this.activity_types.indexOf(category) >= 0;
  }

  addMood(mood: Mood): void {
    this.moods.push(mood);
  }

  removeMood(mood: Mood): void {
    let index = this.moods.indexOf(mood);

    if (index >= 0) {
      this.moods.splice(index, 1);
    }
  }

  hasMood(mood: Mood): boolean {
    return this.moods.indexOf(mood) >= 0;
  }

  getTimetable(): string {
    return this.opening_hours.weekday_text.join("\n");
  }

  getPhone(): string {
    return this.international_phone_number;
  }

  getCityName(): string {
    if (this.city && this.city.split(',')[0] == "" && this.city.split(',')[1] != "")
      return this.city.split(',')[1]
    return this.city ? this.city.split(',')[0] : '';
  }

  getFirstActivityTypeName(): string {
    if (this.activity_types && this.activity_types.length > 0)
      return this.activity_types[0].name;
    else
      return 'unknown';
  }

  getFirstActivityTypeIcon(): string {
    if (this.activity_types && this.activity_types.length > 0)
      return this.activity_types[0].getIcon();
    else
      return 'md-pt-logo';
  }

  getCreationField(): any {
    return {
      name: this.name,
      description: this.description,
      //FIXME: too much data sent
      activity_types: this.activity_types,
      cover: this.getCover(),
      address: this.address,
      price: this.price,
      google_id: this.google_id,
      lat: this.lat,
      lng: this.lng,
      moods: this.moods,
      images: this.images,
      opening_hours: this.opening_hours,
      international_phone_number: this.international_phone_number,
      website: this.website,
      city: this.city
    }
  }
}

class OpeningHours {
  open_now: boolean;
  weekday_text: Array<string>;

  constructor() {
    this.weekday_text = new Array<string>();
  }
}
