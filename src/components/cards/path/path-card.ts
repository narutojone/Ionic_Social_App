import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NavController, AlertController, LoadingController, ModalController } from "ionic-angular";
import { UserService } from "../../../shared/user.service";
import { ProfilePage } from "../../../pages/profile/profile";
import { User } from "../../../models/user";
import { Path } from "../../../models/path";
import { New } from "../../../models/new";
import { Comment } from "../../../models/comment";
import { PathDetailPage } from "../../../pages/path/path-detail";
import { ServerService } from "../../../shared/server.service";
import { ChatCardPage } from "../../../pages/chat-card/chat-card";
import { SelectGroupPage } from "../../../pages/group/select-group/select-group";



@Component({
  selector: 'pt-card-path',
  templateUrl: 'path-card.html'
})
export class PathCard {
  @Input() path: Path;
  @Input() comment: Comment<Path>;
  @Input() news: New<any>;
  @Input() u: User;
  @Input() needSelection: boolean;
  @Input() needSelectionAction: boolean;
  @Output() selectAction = new EventEmitter();


  constructor(private navCtrl: NavController, private user: UserService,
   private alertCtrl: AlertController, private server: ServerService,
   private loadingCtrl: LoadingController, private modalCtrl: ModalController) {
  }



  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  goPathDetail(): void {
    if (!this.needSelectionAction) {
      this.navCtrl.push(PathDetailPage, { path: this.path, parentPage: this });
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
        this.server.getPathChats(this.path.id, 10, 0)
          .subscribe(res => {
            this.navCtrl.push(ChatCardPage, { chats: res, path_id: this.path.id });
          }, error => {
            //FIXME: Dislplay Toast
            loading.dismiss();
          });
  }

  sharePath() {
    let pathModal = this.modalCtrl.create(SelectGroupPage, { pto: this.path });
    pathModal.onDidDismiss(data => {
      if (data) {
      }
    })
    pathModal.present();
  }

}
