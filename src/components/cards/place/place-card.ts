import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NavController, AlertController, LoadingController, ModalController } from "ionic-angular";
import { UserService } from "../../../shared/user.service";
import { ProfilePage } from "../../../pages/profile/profile";
import { User } from "../../../models/user";
import { Place } from "../../../models/place";
import { New } from "../../../models/new";
import { Comment } from "../../../models/comment";
import { PlaceDetailPage } from "../../../pages/place/place-detail";
import { ServerService } from "../../../shared/server.service";
import { ChatCardPage } from "../../../pages/chat-card/chat-card";
import { SelectGroupPage } from "../../../pages/group/select-group/select-group";



@Component({
  selector: 'pt-card-place',
  templateUrl: 'place-card.html'
})
export class PlaceCard {
  @Input() place: Place;
  @Input() comment: Comment<Place>;
  @Input() news: New<any>;
  @Input() u: User;
  @Input() needSelection: boolean;
  @Input() needSelectionAction: boolean;
  @Output() goActivityDetails = new EventEmitter();
  @Output() selectAction = new EventEmitter();


  constructor(private navCtrl: NavController, private user: UserService, private loadingCtrl: LoadingController, private server: ServerService, private modalCtrl: ModalController) {
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  goPlaceDetail(): void {
    if (!this.needSelectionAction) {
      if (!this.needSelection) {
        if (this.place.opening_hours) {
          this.navCtrl.push(PlaceDetailPage, { place: this.place });
        }
        else {
          let loading = this.loadingCtrl.create({
            spinner: 'hide',
            content: this.server.getLoadingContent('Download Place Infos'),
            dismissOnPageChange: true
          });
          loading.present();
          this.server.getPlace(this.place.google_id)
            .subscribe(place => {
              this.place = place;
              this.navCtrl.push(PlaceDetailPage, { place: this.place });
            }, error => {
              //FIXME: Dislplay Toast
              loading.dismiss();
            });
        }
      }
      else {
        this.goActivityDetails.emit();
      }
    }
  }

  selectActivity() {
    this.selectAction.emit();
  }

  goChatPage() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Download Comments'),
      dismissOnPageChange: true
    });
    loading.present();
    this.server.getPlaceChats(this.place.id, 10, 0)
      .subscribe(res => {
        this.navCtrl.push(ChatCardPage, { chats: res, place_id: this.place.id });
      }, error => {
        //FIXME: Dislplay Toast
        loading.dismiss();
      });
  }

  sharePlace() {
    let pathModal = this.modalCtrl.create(SelectGroupPage, { pto: this.place });
    pathModal.onDidDismiss(data => {
      if (data) {
      }
    })
    pathModal.present();
  }

}
