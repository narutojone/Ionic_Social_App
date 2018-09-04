import { Component, Input } from '@angular/core';
import { NavController, AlertController } from "ionic-angular";
import { PerformPathPage } from "../../pages/perform/perform-path";
import { UserService } from "../../shared/user.service";
import { User } from "../../models/user";
import { ProfilePage } from "../../pages/profile/profile";
import { Event } from "../../models/event";
import { PathTimeObject } from "../../models/pathtime-object";
import { SimpleComment } from "../../models/simple-comment";
import { ServerService } from "../../shared/server.service";


@Component({
  selector: 'pt-simple-comment-section',
  templateUrl: 'simple-comment-section.html'
})
export class SimpleCommentSection {
  @Input() comment: SimpleComment;
  @Input() event: Event<PathTimeObject>;
  commentText: String;

  constructor(private navCtrl: NavController, private server: ServerService, private user: UserService, private alertCtrl: AlertController) {
    this.commentText = "";
  }



  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
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

  writeComment() {
    let alert = this.alertCtrl.create({
      title: this.event.name.toString(),
      inputs: [
        {
          name: 'comment',
          placeholder: 'Comment'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Envoyer',
          handler: data => {
            this.server.sendEventComment(this.event.id, data.comment).subscribe(
              event => {
                this.event = event;
              }
            )
          }
        }
      ]
    });
    alert.present();
  }

}
