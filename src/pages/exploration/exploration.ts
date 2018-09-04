import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { NavController, LoadingController, PopoverController, Searchbar, AlertController } from 'ionic-angular';

import { Category } from '../../models/category';
import { Filter } from '../../models/filter';
import { FilterService } from '../../shared/filter.service';
import { GeolocationService } from '../../shared/geolocation.service'
import { Mood } from '../../models/mood';
import { PlanificationPage } from '../planification/planification';
import { InspirationPage } from '../inspiration/inspiration';
import { ServerService } from '../../shared/server.service';
import { Keyboard } from "@ionic-native/keyboard";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { PtTap } from "../../shared/ptTap.model";
import { User } from "../../models/user";
import { CompleteFeedService } from "../../shared/complete-feed.service";

@Component({
  selector: 'page-exploration',
  templateUrl: 'exploration.html'
})
export class ExplorationPage implements AfterViewInit {
  @ViewChild('explorationSearch')
  private searchbar: Searchbar;

  private planificationPage = PlanificationPage;
  private inspirationPage = InspirationPage;
  private filter: Filter;
  private searchBox: google.maps.places.Autocomplete;
  private selected_category: Category;
  private selected_pather: boolean;
  private delete_whos: boolean = false;
  private focus: String;
  private show_validate: boolean = false;
  private ptTap: PtTap;
  private pathers: Array<User>;
  private patherSearch: string = '';

  constructor(public navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private location: GeolocationService,
              private translate: TranslateService,
              private filters: FilterService,
              private server: ServerService,
              private popoverCtrl: PopoverController,
              private keyBoard: Keyboard,
              private alertCtrl: AlertController,
              private analyticsService: AnalyticsService,
              public completeFeedService: CompleteFeedService) {
    this.filter = new Filter();
    this.filter.budget = null;
    this.selected_pather = false;
  }

  ngAfterViewInit() {
    let loc = this.location.getLastLocation();
    let bounds = new google.maps.LatLngBounds();
    if (loc) {
      bounds.extend({ "lat": loc.latitude, "lng": loc.longitude });
    }

    this.searchBox = new google.maps.places.Autocomplete(this.searchbar._searchbarInput.nativeElement,
                                                     { bounds: bounds, types: ['(cities)'] });
    this.searchBox.addListener("place_changed", this.onPlaceChange.bind(this));
  }

  ionViewWillEnter() {
    this.show_validate = false;
    this.pathers = new Array<User>();
    this.analyticsService.trackScreen(SegmentEvents.Exploration, {});
  }

  onCancelSearch() {
     this.pathers = new Array<User>();
     this.patherSearch = '';
  }

  addUser(user: User) {
    this.filter.pathers.push(user);
    this.pathers = new Array<User>();
    this.selected_pather = false;
    this.patherSearch = '';
  }
  

  setFilteredItems() {
    if (this.patherSearch.length < 1){
      this.pathers = new Array<User>();
    }
    else {
    this.completeFeedService.getResults(this.patherSearch)
    .subscribe(users => {
      this.pathers = users;
    });
  }
  }

  touchStartPtTap($event) {
    this.ptTap = new PtTap(event);
  }

  touchEndPtTap($event) {
    return this.ptTap.needFire(event);
  }

  onPlaceChange(): void {
    let places: google.maps.places.PlaceResult = this.searchBox.getPlace();

    //FIXME: We should display all results to the user
    this.filter.city = places.formatted_address;
    this.filter.city_id = places.place_id;
    this.filter.city_lat = places.geometry.location.lat();
    this.filter.city_lng = places.geometry.location.lng();
  }

  changeWhos(whos: any): void {
    if (this.filter.with === whos){
      this.filter.with = null;
      this.selected_pather = false;
    }
    else {
      this.filter.with = whos;
      if (this.filter.with.value === "EXPLORATION.WHOS.PATHER")
        this.selected_pather = true;
      else
        this.selected_pather = false;
    }
  }

  addPather() {
    this.selected_pather = true;
  }

  removePather(p: any): void {
    this.selected_pather = false;
    if (this.delete_whos) {
      var index = this.filter.pathers.indexOf(p, 0);
      if (index > -1) {
        this.filter.pathers.splice(index, 1);
      }
    } else {
      this.delete_whos = true;
    }
  }

  changeMood(mood: Mood): void {
    let index: number = this.filter.moods.indexOf(mood);
    if (index >= 0)
      this.filter.moods.splice(index, 1);
    else
      this.filter.moods.push(mood);
  }

  changePlans(category: Category, event): void {
    let index: number = this.filter.categories.indexOf(category);
    if (this.selected_category == category) {
      this.selected_category = null;
    }
    else {
      this.selected_category = category;
    }
  }

  category_active(category: Category) {
    if (this.selected_category == category)
      return true;

    if (this.filter.categories.indexOf(category) >= 0)
      return true;

    for (let i in category.children) {
      if (this.filter.categories.indexOf(category.children[i]) >= 0) {
        return true;
      }
    }

    return false;
  }

  changePrice(price): void {
    if (this.filter.budget == price) {
      this.filter.budget = null;
    }
    else {
      this.filter.budget = price;
    }
  }

  search(searchEvent) {
    let term = searchEvent.target.value
    // We will only perform the search if we have 3 or more characters
    if (term.trim() === '' || term.trim().length < 3) {
      // Load cached users
    } else {
      // Get the searched users from github
    }
  }

  goPlanification() {
    this.analyticsService.trackEventFilterValidate(SegmentEvents.SearchPlanification, this.filter);
    if (!this.filter.city || this.filter.categories.length == 0) {
      this.showExplorationAlert();
    }
    else {
      this.translate.get('EXPLORATION.WAIT').subscribe(
        value => {
          let loading = this.loadingCtrl.create({
            spinner: 'hide',
            content: this.server.getLoadingContent(value),
            dismissOnPageChange: true
          });

          loading.present();

          this.server.getPlanification(this.filter)
          .subscribe(planifications => {
            this.navCtrl.push(PlanificationPage, {'planifications': planifications});
          }, error => {
            //FIXME: Dislplay Toast
            loading.dismiss();
          });
        }
      );
    }
  }

  goInspiration() {
    this.analyticsService.trackEventFilterValidate(SegmentEvents.SearchInspiration, this.filter);
    if (!this.filter.city || this.filter.categories.length == 0) {
      this.showExplorationAlert();
    }
    else {
      this.translate.get('EXPLORATION.WAIT').subscribe(
        value => {
          let loading = this.loadingCtrl.create({
            spinner: 'hide',
            content: this.server.getLoadingContent(value),
            dismissOnPageChange: true
          });

          loading.present();

          this.server.getInspiration(this.filter)
          .subscribe(inspirations => {
            this.navCtrl.push(InspirationPage, {'inspirations': inspirations});
          }, error => {
            //FIXME: Dislplay Toast
            loading.dismiss();
          });
        }
      );
    }
  }

  showExplorationAlert() {
    this.translate.get('EXPLORATION.ALERT').subscribe(
      value => {
        let alert = this.alertCtrl.create({
          title: value.TITLE,
          subTitle: value.TEXT,
          buttons: ['OK']
        });
        alert.present();
      }
    );
  }

  getBudgetClass(index: number) {
    let res = {
      'filter-content-price-opac': this.filter.budget != index
    };

    res['filter-budget-' + index] = true;

    return res;
  }

  showValidate() {
    this.show_validate = true;
    this.focus = "none";
  }

  resetValues(focus?: any) {
    this.show_validate = false;
    if (focus !== "category")
      this.selected_category = null;
    if (focus !== "whos"){
      this.selected_pather = false;
      this.keyBoard.close();
      this.delete_whos = false;
    }
  }

  onPatherSelected(b: boolean) {
    if (b) {
      this.selected_pather = false;
    }
  }

  addPendingMood() {
    this.translate.get('EXPLORATION.ALERTMOOD').subscribe(
      value => {
        let alert = this.alertCtrl.create({
          title: value.TITLE,
          subTitle: value.TEXT,
          inputs: [
            {
              name: 'name',
              placeholder: value.NAME
            }
          ],
          buttons: [
            {
              text: value.CANCEL,
              role: 'cancel'
            },
            {
              text: value.VALIDATE,
              handler: data => {
                if (data.name != '') {
                  this.analyticsService.trackEvent(SegmentEvents.createPendingMood, {name: name});
                  this.server.createPendingMood(data.name)
                  .subscribe(() => {
                    let alert = this.alertCtrl.create({
                    title: value.DONETITLE,
                    subTitle: value.DONETEXT,
                    buttons: ['OK']
                  });
                  alert.present();
                  });
                } else {
                  return false;
                }
              }
            }
          ]
        });
      alert.present();
      }
    );
  }

  addPendingCategory() {
    this.translate.get('EXPLORATION.ALERTCATEGORY').subscribe(
      value => {
        let alert = this.alertCtrl.create({
          title: value.TITLE,
          subTitle: value.TEXT,
          inputs: [
            {
              name: 'name',
              placeholder: value.NAME
            }
          ],
          buttons: [
            {
              text: value.CANCEL,
              role: 'cancel'
            },
            {
              text: value.VALIDATE,
              handler: data => {
                if (data.name != '') {
                  this.analyticsService.trackEvent(SegmentEvents.createPendingCategory, {name: name});
                  this.server.createPendingCategory(data.name)
                  .subscribe(() => {
                    let alert = this.alertCtrl.create({
                    title: value.DONETITLE,
                    subTitle: value.DONETEXT,
                    buttons: ['OK']
                  });
                  alert.present();
                  });
                } else {
                  return false;
                }
              }
            }
          ]
        });
      alert.present();
      }
    );
  }

}
