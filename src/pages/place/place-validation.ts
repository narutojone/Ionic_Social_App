import { Component, Input } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';

import { Place } from '../../models/place';
import { UserService } from '../../shared/user.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { CommentPlacePage } from "../comment/comment-place";
import { Category } from "../../models/category";
import { FilterService } from "../../shared/filter.service";
import { Mood } from "../../models/mood";
import { TranslateService } from "ng2-translate";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";

@Component({
  selector: 'page-place-validation',
  templateUrl: 'place-validation.html'
})

export class PlaceValidationPage {
  @Input() place: Place;
  private selected_category: Category;
  private commentChanged;
  private resetComment;

  constructor(private user: UserService, public navCtrl: NavController, public params: NavParams, 
    private viewCtrl: ViewController, private modalCtrl: ModalController, private filter: FilterService,
    private alertCtrl: AlertController, private translate: TranslateService, private analyticsService: AnalyticsService) {
    this.place = this.params.get("place");
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPlace(SegmentEvents.PlaceValidation, this.place);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  back() {
    this.viewCtrl.dismiss(null);
  }

  goComment() {
    if (this.place.hasCategories() && this.place.hasMoods()){
      this.dismiss();
    }
    else {
      this.showPlaceAlert();
    }
  }

  dismiss() {
    let commentModal = this.modalCtrl.create(CommentPlacePage, { place: this.place });
    commentModal.onDidDismiss(data => {
      if (data) {
        this.viewCtrl.dismiss(data);
      }
    });
    commentModal.present();
  }

  categoryActive(category: Category) {
    let categories = this.place.getCategories();

    if (this.selected_category == category)
      return true;

    if (categories.indexOf(category) >= 0)
      return true;

    for (let i in category.children) {
      if (categories.indexOf(category.children[i]) >= 0) {
        return true;
      }
    }

    return false;
  }

  selectCategory(category: Category) {
    this.selected_category = category;
  }

  selectActiveCategory(category: Category) {
    this.selected_category = this.selected_category == category ? null : category;
  }

  addMood(mood: Mood): any {
    this.place.addMood(mood);
  }

  removeMood(mood: Mood): any {
    this.place.removeMood(mood);
  }

  showPlaceAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You must choose at least one category and one mood.',
      buttons: ['OK']
    });
    alert.present();
  }

  showReset() {
    return this.place.moods.length > 0 || this.place.getCategories().length > 0 || this.commentChanged;
  }

  reset() {
    this.place.moods = [];
    this.resetComment = !this.resetComment;
    this.commentChanged = false;
    this.place.activity_types = [];
  }

  onChangeComment(event) {
    this.commentChanged = event.commentChanged;
  }
}
