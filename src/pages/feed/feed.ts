import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, LoadingController, ViewController, ModalController, AlertController } from 'ionic-angular';

import { New } from '../../models/new';
import { PathTimeObject } from '../../models/pathtime-object';
import { Place } from '../../models/place';
import { Path } from '../../models/path';
import { Comment } from '../../models/comment';

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { CompleteFeedService } from '../../shared/complete-feed.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { PathDetailPage } from "../path/path-detail";
import { PlaceDetailPage } from '../place/place-detail';

import { AutoCompleteComponent } from "ionic2-auto-complete";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { PtTap } from "../../shared/ptTap.model";
import { Keyboard } from "@ionic-native/keyboard";
import { CreationModal } from "../creation2/creation-modal/creation-modal";
import { Creation2Page } from "../creation2/creation2";
import { GeolocationService } from "../../shared/geolocation.service";
import { CreationPlacePage } from "../creation2/creation-place";

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html'
})
export class FeedPage implements AfterViewInit{
  @ViewChild('feedGoogleDiv')
  private feedGoogleDiv: ElementRef;
  @ViewChild('searchUser')
  private searchbar: AutoCompleteComponent;
  private loc: any;

  private limitNews: number;
  private offsetNews: number;

  private lastNews: Array<New<PathTimeObject>>;
  private news$: Array<New<PathTimeObject>>;
  private ptTap: PtTap;
  private pathers: Array<User>;
  private patherSearch: string = '';


  constructor(private server: ServerService, private navCtrl: NavController, 
    public viewCtrl: ViewController, private loadingCtrl: LoadingController, private keyboard: Keyboard,
    private user: UserService, public completeFeedService: CompleteFeedService,
    private location: GeolocationService, private alertCtrl: AlertController,
    private analyticsService: AnalyticsService, private modalCtrl: ModalController) {
  }

  ionViewDidLoad(): void {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();
    this.limitNews = 20;
    this.offsetNews = 0;
    this.server.getNews(this.limitNews, this.offsetNews)
      .subscribe(news => {
        this.news$ = new Array<New<PathTimeObject>>();
        this.news$ = this.news$.concat(news.data);
        this.lastNews = news.data;
        loading.dismiss();
      });
  }

  ngAfterViewInit() {
    this.loc = this.location.getLastLocation();
  }

  ionViewWillEnter() {
    if (this.searchbar) {
      this.searchbar.clearValue();
    }
    this.pathers = new Array<User>();
    if (this.news$) {
      let payload = {
        contentLength: this.news$.length
      }
      this.analyticsService.trackScreen(SegmentEvents.Feed, payload);
    } else {
      this.analyticsService.trackScreen(SegmentEvents.Feed, {});
    }

  }

  refreshPaths() {
    this.newFeeds();
  }

  onCancelSearch() {
    this.pathers = new Array<User>();
    this.patherSearch = '';
  }

  setFilteredItems() {
    if (this.patherSearch.length < 2) {
      this.pathers = new Array<User>();
    }
    else {
      this.completeFeedService.getResults(this.patherSearch)
        .subscribe(users => {
          this.pathers = users;
        });
    }
  }

  focusTemplate() {
    this.keyboard.close();
  }

  touchStartPtTap($event) {
    this.ptTap = new PtTap(event);
  }

  touchEndPtTap($event) {
    return this.ptTap.needFire(event);
  }

  getMoreNews(event: any): void {
    //console.log("infinite scroll");
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();
    this.offsetNews = this.offsetNews + this.limitNews;
    this.server.getNews(this.limitNews, this.offsetNews)
      .subscribe(news => {
        this.news$ = this.news$.concat(news.data);
        this.lastNews = news.data;
        loading.dismiss();
      });
  }

  refresh$(event): void {
    this.limitNews = 20;
    this.offsetNews = 0;
    this.newFeeds();

    setTimeout(() => {
      event.complete();
    }, 1000);
  }

  newFeeds(): void {
    this.server.getNews(this.limitNews, this.offsetNews)
      .subscribe(news => {
        this.news$ = new Array<New<PathTimeObject>>();
        this.news$ = this.news$.concat(news.data);
        this.lastNews = news.data;
      });
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  goPathDetail(p: Path): void {
    this.navCtrl.push(PathDetailPage, { path: p, parentPage: this });
  }

  goPlaceDetail(p: Place): void {
    if (p.opening_hours) {
      this.navCtrl.push(PlaceDetailPage, { place: p });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Place Infos'),
        dismissOnPageChange: true
      });
      loading.present();
      this.server.getPlace(p.google_id)
        .subscribe(place => {
          p = place;
          this.navCtrl.push(PlaceDetailPage, { place: p });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
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

  openCreationModal() {
    let modal = this.modalCtrl.create(CreationModal, {}, { showBackdrop: true, enableBackdropDismiss: true });
    modal.onDidDismiss(data => {
      if (data) {
        if (data === 1) {
          this.goCreationPlace();
        }
        else if (data === 2) {
          this.goCreationPath();
        }
      }
    });
    modal.present();
  }

}
