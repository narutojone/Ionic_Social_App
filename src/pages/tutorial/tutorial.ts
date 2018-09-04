import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { App, NavParams, LoadingController, MenuController, Slides } from 'ionic-angular';

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { TabsPage } from "../tabs/tabs";
import { TranslateService } from "ng2-translate";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})

export class TutorialPage {

  @ViewChild("tourSlideTwo") slider: Slides;
  slides = [];
  isFirstPage = true;
  isLastPage = false;


  constructor(private user: UserService, private app: App,
    private menu: MenuController,
    private server: ServerService,
    private translate: TranslateService,
    private analyticsService: AnalyticsService) {
    if (this.translate.currentLang == 'en') {
      this.slides = user.getSlides('en');
    }
    else {
      this.slides = user.getSlides('fr');
    }

  }

  ionViewWillEnter() {
    this.analyticsService.trackScreen(SegmentEvents.Tutorial, {});
  }
  
  moveNext() {
    this.slider.slideNext();
  }
  movePrevious() {
    this.slider.slidePrev();
  }

  onSlideChangeStart(slider) {
    this.isFirstPage = slider.isBeginning();
    this.isLastPage = slider.isEnd();
  }

  completeTutorial(): void {
    this.analyticsService.trackEvent(SegmentEvents.tutorialDone, {});
    this.server.tutorialDone()
      .subscribe(res => {
        this.user.getUser().tutorial_completed = res.tutorial_completed;
      });
    this.menu.enable(true);
    this.app.getRootNav().setRoot(TabsPage);
  }

}
