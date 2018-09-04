import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from 'ionic-angular';

import { Group } from "../../../models/group";
import { Event } from "../../../models/event";
import { Comment } from '../../../models/comment';
import { UserService } from "../../../shared/user.service";
import { ServerService } from "../../../shared/server.service";
import { AnalyticsService } from "../../../shared/analytics.service";
import { TranslateService } from "ng2-translate";
import { SegmentEvents } from "../../../shared/analytics.model";
import { ProfilePage } from "../../profile/profile";
import { User } from "../../../models/user";
import { Place } from "../../../models/place";
import { PlaceDetailPage } from "../../place/place-detail";
import { PathTimeObject } from "../../../models/pathtime-object";
import { PtTap } from "../../../shared/ptTap.model";
import { Path } from "../../../models/path";
import { PathDetailPage } from "../../path/path-detail";
import { EventDetailPage } from "../../event/event-detail";
import { EventResponseChoice } from "../../../models/enum";
import { AddEventModal } from "../../event/add-event-modal/add-event-modal";
import { PickActivityPage } from "../../event/pick-activity/pick-activity";
import { GroupSettingPage } from "../group-setting/group-setting";
import { CommentEventPage } from "../../comment/comment-event";
import { CreationPlacePage } from "../../creation2/creation-place";
import { Creation2Page } from "../../creation2/creation2";
import { GeolocationService } from "../../../shared/geolocation.service";
import { NewEventModal } from "../../../components/cards/event/modal-new-event";

@Component({
  selector: 'page-group-detail',
  templateUrl: 'group-detail.html'
})

export class GroupDetailPage {
  @Input() group: Group;
  private events: Array<Event<PathTimeObject>>;
  private todos: Array<Event<PathTimeObject>>;
  private eventsDone: Array<Event<PathTimeObject>>;
  private limitEvents: number;
  private offsetEvents: number;
  private limitTodoEvents: number;
  private offsetTodoEvents: number;
  private limitDoneEvents: number;
  private offsetDoneEvents: number;
  private ptTap: PtTap;
  private eventMode: string;
  private new_event: boolean;
  private lastEvents: Array<Event<PathTimeObject>>;
  private lastTodoEvents: Array<Event<PathTimeObject>>;
  private lastDoneEvents: Array<Event<PathTimeObject>>;



  constructor(private user: UserService, public navCtrl: NavController, private loadingCtrl: LoadingController, private translate: TranslateService,
    private server: ServerService, public params: NavParams, private alertCtrl: AlertController, private modalCtrl: ModalController,
    private analyticsService: AnalyticsService, private location: GeolocationService) {
    this.group = this.params.get("group");
    this.eventMode = "voting";
    this.new_event = false;

    this.events = new Array<Event<PathTimeObject>>();
    this.todos = new Array<Event<PathTimeObject>>();
    this.eventsDone = new Array<Event<PathTimeObject>>();

    this.newEvents();
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenGroup(SegmentEvents.GroupDetail, this.group);
    if (this.new_event) {
      this.limitEvents = 5;
      this.offsetEvents = 0;
      this.newEvents();
      this.new_event = false;
    }
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  back() {
    this.navCtrl.pop();
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

  goPathDetail(p: Path): void {
    this.navCtrl.push(PathDetailPage, { path: p });
  }

  goEventDetail(e: Event<PathTimeObject>): void {
    this.navCtrl.push(EventDetailPage, { event: e });
  }

  newEvents(): void {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();
    this.offsetEvents = 0;
    this.limitEvents = 10;
    this.offsetTodoEvents = 0;
    this.limitTodoEvents = 10;
    this.offsetDoneEvents = 0;
    this.limitDoneEvents = 10;
    this.server.getGroupEvents(this.group.id, this.limitEvents, this.offsetEvents)
      .subscribe(events => {
        this.events = new Array<Event<PathTimeObject>>();
        this.events = this.events.concat(events.pending_events);
        this.lastEvents = events.pending_events;

        this.todos = new Array<Event<PathTimeObject>>();
        this.todos = this.todos.concat(events.todo_events);
        this.lastTodoEvents = events.todo_events;

        this.eventsDone = new Array<Event<PathTimeObject>>();
        this.eventsDone = this.eventsDone.concat(events.done_events);
        this.lastDoneEvents = events.done_events;
        loading.dismiss();
      });
  }

  todoEvents(): void {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();
    this.offsetTodoEvents = 0;
    this.limitTodoEvents = 5;
    this.server.getGroupEvents(this.group.id, this.limitTodoEvents, this.offsetTodoEvents)
      .subscribe(todos => {
        this.todos = new Array<Event<PathTimeObject>>();
        this.todos = this.todos.concat(todos);
        this.lastTodoEvents = todos;
        loading.dismiss();
      });
  }

  touchStartPtTap($event) {
    this.ptTap = new PtTap(event);
  }

  touchEndPtTap($event) {
    return this.ptTap.needFire(event);
  }

  getMoreEvents(): void {
    this.offsetEvents = this.offsetEvents + this.limitEvents;
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();

    this.server.getGroupPendingEvents(this.group.id, this.limitEvents, this.offsetEvents)
      .subscribe(events => {
        this.events = this.events.concat(events);
        this.lastEvents = events;
        loading.dismiss();
      });
  }

  getMoreTodoEvents(): void {
    this.offsetEvents = this.offsetEvents + this.limitEvents;
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();

    this.server.getGroupTodoEvents(this.group.id, this.limitTodoEvents, this.offsetTodoEvents)
      .subscribe(events => {
        this.todos = this.todos.concat(events);
        this.lastTodoEvents = events;
        loading.dismiss();
      });
  }

  getMoreDoneEvents(): void {
    this.offsetEvents = this.offsetEvents + this.limitEvents;
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();

    this.server.getGroupDoneEvents(this.group.id, this.limitDoneEvents, this.offsetDoneEvents)
      .subscribe(events => {
        this.eventsDone = this.eventsDone.concat(events);
        this.lastDoneEvents = events;
        loading.dismiss();
      });
  }

  refresh$(event): void {
    this.limitEvents = 5;
    this.offsetEvents = 0;
    this.newEvents();

    setTimeout(() => {
      event.complete();
    }, 1000);
  }

  addNewEvent() {
    let modal = this.modalCtrl.create(AddEventModal, {}, { showBackdrop: true, enableBackdropDismiss: true });
    modal.onDidDismiss(data => {
      if (data) {
        if (data == 'todos') {
          this.pickInTodos();
        }
        if (data == 'historic') {
          this.pickInHistoric();
        }
      }
    });
    modal.present();
  }

  pickInTodos() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Download Todos'),
      dismissOnPageChange: true
    });

    loading.present();
    this.user.getUser().todos = new Array<PathTimeObject>();
    this.server.getTodos(this.user.getUser())
      .subscribe(user => {
        this.new_event = true;
        this.navCtrl.push(PickActivityPage, { activities: user.todos, list_origin: "todos", group: this.group });
      }, error => {
        //FIXME: Dislplay Toast
        loading.dismiss();
      });
  }

  pickInMyPaths() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Download MyPaths'),
      dismissOnPageChange: true
    });

    loading.present();
    this.user.getUser().pathList = new Array<Path>();
    this.server.getPathList(this.user.getUser())
      .subscribe(user => {
        this.new_event = true;
        this.navCtrl.push(PickActivityPage, { activities: user.pathList, list_origin: "pathList", group: this.group });
      }, error => {
        //FIXME: Dislplay Toast
        loading.dismiss();
      });
  }

  pickInHistoric() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Download Historic'),
      dismissOnPageChange: true
    });

    loading.present();
    this.user.getUser().historic = new Array<Comment<PathTimeObject>>();
    this.server.getHistoric(this.user.getUser())
      .subscribe(user => {
        this.new_event = true;
        this.navCtrl.push(PickActivityPage, { activities: user.historic, list_origin: "historic", group: this.group });
      }, error => {
        //FIXME: Dislplay Toast
        loading.dismiss();
      });
  }

  createPlace() {
    var loc = this.location.getLastLocation();
    if (loc) {
      this.new_event = true;
      this.navCtrl.push(CreationPlacePage, { group: this.group });
    }
    else {
      let alert = this.alertCtrl.create({
        title: "GPS unavailable",
        subTitle: "Thanks to turn your gps on in order to create places.",
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  createPath() {
    var loc = this.location.getLastLocation();
    if (loc) {
      this.new_event = true;
      this.navCtrl.push(Creation2Page, { group: this.group });
    }
    else {
      let alert = this.alertCtrl.create({
        title: "GPS unavailable",
        subTitle: "Thanks to turn your gps on in order to create paths.",
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  deleteEvent(event) {
    let alert = this.alertCtrl.create({
      title: 'Are you sure',
      message: 'Do you really want to delete this event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.server.deleteEvent(event.id).subscribe();
            let index = this.events.indexOf(event);
            if (index >= 0) {
              this.events.splice(index, 1);
            }
            index = this.todos.indexOf(event);
            if (index >= 0) {
              this.todos.splice(index, 1);
            }
            index = this.eventsDone.indexOf(event);
            if (index >= 0) {
              this.eventsDone.splice(index, 1);
            }
          }
        }
      ]
    });
    alert.present();
  }

  validateEvent(event) {
    let alert = this.alertCtrl.create({
      title: 'Are you sure',
      message: 'Do you really want to validate this event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.server.validateEvent(event.id).subscribe(
              res => {
                this.todos.unshift(res);
              }
            );
            let index = this.events.indexOf(event);
            if (index >= 0) {
              this.events.splice(index, 1);
            }
          }
        }
      ]
    });
    alert.present();
  }

  goToCommentPage(event): void {
    let modal = this.modalCtrl.create(CommentEventPage, { "event": event });
    modal.onDidDismiss(data => {
      if (data) {
        this.eventsDone.unshift(event);
        let index = this.todos.indexOf(event);
        if (index >= 0) {
          this.todos.splice(index, 1);
        }
      }
    });
    modal.present();
  }

  goToGroupSettings(): void {
    this.navCtrl.push(GroupSettingPage, { group: this.group });
  }

  openNewEventModal() {
    let modal = this.modalCtrl.create(NewEventModal, {}, { showBackdrop: true, enableBackdropDismiss: true });
    modal.onDidDismiss(data => {
      if (data) {
        if (data === 1) {
          this.createPlace();
        }
        else if (data === 2) {
          this.pickInTodos();
        }
        else if (data === 3) {
          this.pickInHistoric();
        }
        else if (data === 4) {
          this.pickInMyPaths();
        }
        if (data === 5) {
          this.createPath();
        }
      }
    });
    modal.present();
  }
  

}
