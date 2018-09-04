import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NavController, AlertController, LoadingController, ModalController } from "ionic-angular";
import { UserService } from "../../../shared/user.service";
import { ProfilePage } from "../../../pages/profile/profile";
import { User } from "../../../models/user";
import { Event } from "../../../models/event";
import { New } from "../../../models/new";
import { Comment } from "../../../models/comment";
import { ServerService } from "../../../shared/server.service";
import { EventDetailPage } from "../../../pages/event/event-detail";
import { SimpleComment } from "../../../models/simple-comment";
import { EventSelectionModal } from "./modal-event-selection";



@Component({
  selector: 'pt-card-event',
  templateUrl: 'event-card.html'
})
export class EventCard {
  @Input() event: Event<any>;
  commentText: String;


  constructor(private navCtrl: NavController, private user: UserService, private loadingCtrl: LoadingController, private server: ServerService, private alertCtrl: AlertController, private modalCtrl: ModalController) {
    this.commentText = '';
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  goEventDetail(): void {
    this.navCtrl.push(EventDetailPage, { event: this.event });
  }

  showFullComment(comment: SimpleComment) {
    let alert = this.alertCtrl.create({
      title: comment.user.firstname + ' ' + comment.user.lastname,
      subTitle: comment.text.toString(),
      buttons: ['Ok']
    });
    alert.present();
  }

  sendComment() {
    if (this.commentText != "") {
      let textToSend = this.commentText;
      this.commentText = "";
      this.server.sendEventComment(this.event.id, textToSend).subscribe(
        event => {
          this.event = event;
        }
      )
    }
  }

  changeOpinionModal() {
    let modal = this.modalCtrl.create(EventSelectionModal, {}, { showBackdrop: true, enableBackdropDismiss: true });
    modal.onDidDismiss(data => {
      if (data) {
        this.event.user_response = data;
        this.server.postEventChoice(this.event.id, this.event.user_response).subscribe(
          e => {
            this.event = e;
          }
        );
      }
    });
    modal.present();
  }
}
