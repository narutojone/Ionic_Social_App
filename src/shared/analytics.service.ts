import { Observable } from 'rxjs/Observable';
// Angular
import { Injectable, NgZone, Injector } from '@angular/core';
// Ionic
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { AppVersion } from '@ionic-native/app-version';

import { Http, RequestOptions, Headers } from "@angular/http";
import { UserService } from "./user.service";
import { GeolocationService } from "./geolocation.service";
import { User } from "../models/user";
import { Filter } from "../models/filter";
import { Category } from "../models/category";
import { Mood } from "../models/mood";
import { Path } from "../models/path";
import { Place } from "../models/place";
import { Comment } from "../models/comment";
import { PathTimeObject } from "../models/pathtime-object";
import { appInjector } from "./app-injector";
import { Platform } from "ionic-angular";
import { Group } from "../models/group";
import { Event } from "../models/event";

declare const ENV;


export class SegmentPaths {
  static ALIAS: string = '/alias';
  static IDENTIFY: string = '/identify';
  static PAGE: string = '/page';
  static SCREEN: string = '/screen';
  static TRACK: string = '/track';
}

@Injectable()
export class AnalyticsService {
  private API_PATH: string = 'https://api.segment.io/v1';
  public segmentKey: string = ENV.SEGMENT_KEY;
  private appVersion: string;
  private appName: string;
  private platformReady: boolean;

  constructor(
    private _http: Http,
    private user: UserService,
    private userLocation: GeolocationService,
    private _ngZone: NgZone,
    private platform: Platform,
    private appversion: AppVersion, private device: Device, private network: Network
    ) {
    
    this.platformReady = false;
    this.platform.ready().then(() => {
      this.platformReady = true;
    });

    this.appversion.getVersionNumber()
    .then(v => this.appVersion = v)

    this.appversion.getAppName()
    .then(n => this.appName = n)
  }

  private getAppInfo(): Object {
    return {
      version: this.appVersion,
      name: this.appName
    };
  };

  private getDeviceInfo(): Object {
    return {
      id: this.device.uuid,
      manufacturer: this.device.manufacturer,
      model: this.device.model,
      type: this.device.platform
    };
  };

  private getDeviceLocation(): Object {
    if (this.platformReady) {
      let uLocation = this.userLocation.getLastLocation();
      if (uLocation) {
        return {
        latitude: uLocation.latitude,
        longitude: uLocation.longitude
        };
      } else if (uLocation) {
        return {
          latitude: uLocation.latitude,
          longitude: uLocation.longitude
        }
      }
    }
    return {}
  }

  private postOptions(): RequestOptions {
    let headers = new Headers();
    headers.set("Authorization", "Basic " + this.segmentKey);
    headers.set("Content-Type", "application/json");

    let options = new RequestOptions({ headers: headers });

    return options;
  }


  private _track(payload: any, url: string): Observable<any> {
    payload.sentAt = new Date().toString();
    let options = this.postOptions();
    return this._http.post(this.API_PATH + url, payload, options);
  }

  private getContext(): Object {
    return {
      app: this.getAppInfo(),
      ip: this.user.getIP(),
      device: this.getDeviceInfo(),
      location: this.getDeviceLocation(),
      userFBID: this.user.getFBID()
    }
  }

  /**
   * https://segment.com/docs/sources/server/http/#alias
   *
   * To identify a user once we have his real identify
   */
  trackAlias(userID: number): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      userId: this.user.getUserId()
    }
    this._track(payload, SegmentPaths.ALIAS).subscribe();
  }

  /**
   * https://segment.com/docs/sources/server/http/#track
   * https://segment.com/docs/spec/track/#properties
   *
   * To record user actions AKA "events"
   */
  trackEvent(eventName: string, eventProperties: any): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      event: eventName,
      userId: this.user.getFBID(),
      properties: eventProperties
    }
    this._track(payload, SegmentPaths.TRACK).subscribe();
  }

  trackScreenPlace(eventName: string, place: any): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      name: eventName,
      userId: this.user.getFBID(),
      properties: this.trackPlace(place)
    }
    this._track(payload, SegmentPaths.PAGE).subscribe();
  }

  trackScreenPath(eventName: string, path: any): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      name: eventName,
      userId: this.user.getFBID(),
      properties: this.trackPath(path)
    }
    this._track(payload, SegmentPaths.PAGE).subscribe();
  }

  trackScreenEvent(eventName: string, event: any): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      name: eventName,
      userId: this.user.getFBID(),
      properties: this.trackEventModel(event)
    }
    this._track(payload, SegmentPaths.PAGE).subscribe();
  }

  trackScreenGroup(eventName: string, group: any): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      name: eventName,
      userId: this.user.getFBID(),
      properties: this.trackGroup(group)
    }
    this._track(payload, SegmentPaths.PAGE).subscribe();
  }

  trackScreenInspiration(eventName: string, inspiration: any): void {
    let paths = [];
    inspiration.paths.forEach(path => {
      paths.push(this.trackPath(path));
    });
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      name: eventName,
      userId: this.user.getFBID(),
      properties: paths
    }
    this._track(payload, SegmentPaths.PAGE).subscribe();
  }

  trackScreenPlanifications(eventName: string, planifications: any): void {
    let res = [];
    planifications.forEach(planification => {
      res.push({
        activity_type: this.trackCategory(planification.activity_type),
        nb_places: planification.steps.length
      });
    });
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      name: eventName,
      userId: this.user.getFBID(),
      properties: planifications
    }
    this._track(payload, SegmentPaths.PAGE).subscribe();
  }

  trackScreenPlanificationPlaces(eventName: string, planification: any): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      name: eventName,
      userId: this.user.getFBID(),
      properties: {
        activity_type: this.trackCategory(planification.activity_type),
        nb_places: planification.steps.length
      }
    }
    this._track(payload, SegmentPaths.PAGE).subscribe();
  }

  trackEventFilterValidate(eventName: string, filter: Filter): void {
    let properties = {
      city: filter.city,
      categories: this.trackCategories(filter.categories),
      moods: this.trackMoods(filter.moods),
      pathers: this.trackUsers(filter.pathers),
      with: filter.with ? filter.with.value : null,
      budget: filter.budget
    }
    this.trackEvent(eventName, properties);
  }

  /**
   * https://segment.com/docs/sources/server/http/#track
   * https://segment.com/docs/spec/screen/
   *
   * To record screen views
   */
  trackScreen(pageName: string, payload2: any): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      name: pageName,
      userId: this.user.getFBID(),
      properties: payload2
    }
    this._track(payload, SegmentPaths.PAGE).subscribe();
  }

  /**
   * https://segment.com/docs/sources/server/http/#identify
   * https://segment.com/docs/spec/identify/#identities
   *
   * To identify users uniquely in the analytics data
   *
   * Call identifyUser once upon app start and then once again when he logs in or signs up.
   */
  trackUser(user: User): void {
    let payload = {
      context: this.getContext(),
      timestamp: new Date().toString(),
      userId: this.user.getUserId(),
      user: {
        firstName: user.firstname,
        lastName: user.lastname,
        id: user.id,
        facebook_id: user.facebook_id,
        phone: user.phone,
        tutorial_completed: user.tutorial_completed,
        profile_picture: user.getProfilePicture(),
        rank: user.rank,
        points: user.points,
        followers: user.followers,
        follows: user.follows
      }
    }
    this._track(payload, SegmentPaths.IDENTIFY).subscribe();
  }

  //Private Function to track Elements

  trackCategory(category: Category): any {
    return {
      id: category.id,
      name: category.name,
      parent_id: category.parent_id
    }
  }

  trackMood(mood: Mood): any {
    return {
      id: mood.id,
      name: mood.name
    }
  }

  trackPath(path: Path): any {
    return {
      id: path.id,
      name: path.name,
      city: path.city,
      user: this.trackSimpleUser(path.user),
      favorite: path.favorite,
      like: path.like,
      undone: path.undone
    }
  }

  trackGroup(group: Group): any {
    return {
      id: group.id,
      name: group.name,
    }
  }

  trackEventModel(event: Event<PathTimeObject>): any {
    return {
      id: event.id,
      name: event.name,
    }
  }

  trackPathWithoutUser(path: Path): any {
    return {
      id: path.id,
      name: path.name,
      city: path.city,
      favorite: path.favorite,
      like: path.like,
      undone: path.undone
    }
  }

  trackComment(comment: Comment<PathTimeObject>): any {
    return {
      rate: comment.rate,
      text: comment.text
    }
  }

  trackPlace(place: Place): any {
    return {
      id: place.id,
      name: place.name,
      city: place.city,
      favorite: place.favorite,
      like: place.like
    }
  }

  trackSimpleUser(user: User): any {
    return {
      id: user.id,
      facebook_id: user.facebook_id,
      firstName: user.firstname,
      lastName: user.lastname
    }
  }

  trackCategories(categories: Array<Category>): any {
    let result = [];
    categories.forEach(category => {
      result.push(this.trackCategory(category));
    });
    return result;
  }

  trackMoods(moods: Array<Mood>): any {
    let result = [];
    moods.forEach(mood => {
      result.push(this.trackMood(mood));
    });
    return result;
  }

  trackUsers(users: Array<User>): any {
    let result = [];
    users.forEach(user => {
      result.push(this.trackSimpleUser(user));
    });
    return result;
  }

}
