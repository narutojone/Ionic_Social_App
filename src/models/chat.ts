import { User } from './user';
import { PathTimeObject } from './pathtime-object';
import { ServerService } from "../shared/server.service";
import { AnalyticsService } from "../shared/analytics.service";
import { SegmentEvents } from "../shared/analytics.model";
import { Injector } from "@angular/core/core";
import { appInjector } from "../shared/app-injector";

export class Chat implements PathTimeObject {
  public id: number;
  public user: User;
  public message: String;
  public date: Date;
  public user_like: boolean;
  public nb_like: number;
  public answers: Array<Chat>;
  private server: ServerService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.answers = new Array<Chat>();
    let injector: Injector = appInjector(); // get the stored reference to the injector

    this.server = injector.get(ServerService);
    this.analyticsService = injector.get(AnalyticsService);
  }

  from(chat: Chat): void {
    this.user = new User();
    this.user.from(chat.user);
    this.message = chat.message;
    this.date = chat.date;
    this.id = chat.id;
    this.user_like = chat.user_like;
    this.nb_like = chat.nb_like;
    if (chat.answers) {
      chat.answers.forEach(answer => {
        var newa = new Chat();
        newa.from(answer);
        this.answers.push(newa);
      });
    }
  }

  isLiked(): boolean {
    return this.user_like;
  }

  toggleLike(): void {
    if (!this.user_like) {
      this.user_like = true;
      this.nb_like += 1;
      this.analyticsService.trackEvent(SegmentEvents.likeMessage, { message_id: this.id });
      this.server.likeChatMessage(this.id)
        .subscribe();
    } else {
      this.user_like = false;
      this.nb_like -= 1;
      this.analyticsService.trackEvent(SegmentEvents.dislikeMessage, { message_id: this.id });
      this.server.dislikeChatMessage(this.id)
        .subscribe();
    }
  }

}
