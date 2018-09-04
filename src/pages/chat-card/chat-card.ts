import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController, Content } from 'ionic-angular';

import { Comment } from '../../models/comment';

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { Path } from "../../models/path";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { Chat } from "../../models/chat";

@Component({
  selector: 'page-chat-card',
  templateUrl: 'chat-card.html'
})

export class ChatCardPage {
  @ViewChild('chatAutoscroll') private myScrollContainer: ElementRef;
  @Input() chats: Array<Chat>;
  @Input() path_id: number;
  commentText: String;
  @Input() place_id: number;


  constructor(private user: UserService, public navCtrl: NavController,
    private server: ServerService, public params: NavParams,
    private viewCtrl: ViewController, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, private analyticsService: AnalyticsService) {
    this.chats = params.get("chats");
    this.path_id = params.get("path_id");
    this.commentText = '';
    this.place_id = params.get("place_id");
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreen(SegmentEvents.ChatPage, {});
    this.scrollToBottom();
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  showFullComment(chat: Chat) {
    let alert = this.alertCtrl.create({
      title: chat.user.firstname + ' ' + chat.user.lastname,
      subTitle: chat.message.toString(),
      buttons: ['Ok']
    });
    alert.present();
  }

  sendComment() {
    if (this.commentText != "") {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Sending message')
      });
      loading.present();
      let textToSend = this.commentText;
      this.commentText = "";
      this.server.sendChatMessage(this.path_id, this.place_id, textToSend).subscribe(
        res => {
          this.chats = res;
          this.scrollToBottom();
          loading.dismiss();
        }, error => {
          loading.dismiss();
        });
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    }, 400)
  }

}
