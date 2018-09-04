import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Globalization } from '@ionic-native/globalization';

import { ConnectedResponse, LoginResponse, LoggedResponse } from '../models/login';
import { User } from '../models/user';
import { TranslateService } from "ng2-translate";
import { PathtimeNotification } from "../models/notification";

@Injectable()
export class UserService {
  private user: User;
  private facebook_token: string;
  private language: string;
  private tutorials: Array<any>;
  private notifications: Array<PathtimeNotification>;
  private phone_brand: string;
  private phone_token: string;
  private permission = ['email', 'public_profile', ' user_friends',
    'user_photos', 'user_birthday',
    'user_hometown'];


  constructor(private plateform: Platform,
    private globalization: Globalization,
    private translate: TranslateService, private facebook: Facebook) {
    this.user = new User();
    this.notifications = new Array<PathtimeNotification>();

    if (plateform.is('android'))
      this.phone_brand = 'android';
    else if (plateform.is('ios'))
      this.phone_brand = 'ios';
    else
      this.phone_brand = 'unknow';

    plateform.ready().then(() => {
      this.globalization.getPreferredLanguage()
        .then(res => {
          this.language = (res.value).split("-")[0];
          this.translate.use((res.value).split("-")[0]);
        })
        .catch(e => {
          this.language = this.translate.currentLang;
          console.error("Error: can't get user language preference: ", e);
        })
    });

  }

  getUserId(): number {
    return this.user.id;
  }

  isFBLogged(): Promise<LoggedResponse> {
    return this.facebook.getLoginStatus()
      .then(response => {
        if (response.status == 'connected') {
          this.user.facebook_id = response.authResponse.userID;
          this.facebook_token = response.authResponse.accessToken;
          return new LoggedResponse(true, this.phone_token,
            this.phone_brand,
            this.language,
            this.facebook_token);
        }
        else {
          return new LoggedResponse(false);
        }
      })
      .catch(error => {
        console.error("Failed to get Facebook login status: ", error);
        return new LoggedResponse(false);
      });
  }

  FBLogin(): Promise<LoginResponse> {
    return this.facebook.login(this.permission)
      .then(response => {
        this.user.facebook_id = response.authResponse.userID;
        this.facebook_token = response.authResponse.accessToken;
        return new LoginResponse(this.phone_token,
          this.phone_brand,
          this.language,
          this.facebook_token);
      })
      .catch(error => {
        console.error("Failed to login with Facebook: ", error);
        return Promise.reject(error);
      });
  }

  isTutotialCompleted(): boolean {
    return this.user.tutorial_completed;
  }

  getSlides(language) {
    return this.tutorials[language];
  }

  setSlides(slides) {
    this.tutorials = slides;
  }

  getFBID(): string {
    return this.user.facebook_id;
  }

  getFBToken(): string {
    return this.facebook_token;
  }

  getProfilePicture(): string {
    return this.user.getProfilePicture();
  }

  FBLogout(): Promise<any> {
    return this.facebook.logout();
  }

  logout(): Promise<any> {
    return this.FBLogout();
  }

  getUser(): User {
    return this.user;
  }

  getNbFollows(): number {
    return this.user.follows;
  }

  getNbFollowers(): number {
    return this.user.followers;
  }

  getName(): string {
    return this.user.firstname + " " + this.user.lastname;
  }

  getPoints(): number {
    return this.user.points;
  }

  getRank(): string {
    return this.user.rank;
  }

  getIP(): string {
    return this.user.last_ip;
  }

  getNotifications(): Array<PathtimeNotification> {
    return this.notifications;
  }

  getUnReadNumberNotifications(): number {
    var count = 0;
    if (this.notifications) {
      this.notifications.forEach(notif => {
        if (!notif.read) {
          count += 1;
        }
      });
    }
    return count;
  }

  setNotifications(notifications) {
    this.notifications = notifications;
  }

  pushNotification(notif) {
    this.notifications.push(notif);
  }

  init(connectResp: ConnectedResponse): void {
    this.user.firstname = connectResp.firstname;
    this.user.lastname = connectResp.lastname;
    this.user.tutorial_completed = connectResp.tutorial_completed;
    this.user.profile_picture = connectResp.profile_picture;
    this.user.points = connectResp.points;
    this.user.id = connectResp.id;
    this.user.rank = connectResp.rank;
    this.user.followers = connectResp.followers;
    this.user.follows = connectResp.follows;
    this.user.last_ip = connectResp.last_ip;
  }
}
