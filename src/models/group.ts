import { User } from './user';
import { PathTimeObject } from './pathtime-object';
import { TranslateService } from "ng2-translate";
import { Injector } from "@angular/core/core";
import { appInjector } from "../shared/app-injector";

export class Group implements PathTimeObject {
  public id: number;
  public members: Array<User>;
  public name: String;
  public description: String;
  public images: Array<string>;
  public updated_at: Date;
  public user: User;
  public nb_todo: number;
  public nb_voting: number;
  public nb_done: number;

  private translate: TranslateService;

  constructor() {
    let injector: Injector = appInjector(); // get the stored reference to the injector
    this.translate = injector.get(TranslateService);
    this.images = new Array<string>();
    this.members = new Array<User>();
  }

  from(group: Group): void {
    this.name = group.name;
    this.description = group.description;
    this.id = group.id;
    this.updated_at = group.updated_at;
    this.nb_todo = group.nb_todo;
    this.nb_voting = group.nb_voting;
    this.nb_done = group.nb_done;

    if (group.user) {
      var user = new User();
      user.from(group.user);
      this.user = user;
    }
    if (group.images && group.images.length > 0) {
      group.images.forEach(image => {
        this.images.push(image);
      });
    }
    if (group.members && group.members.length > 0) {
      group.members.forEach(member => {
        var user = new User();
        user.from(member);
        this.members.push(user);
      });
    }
  }

  getCover(): string {
    if (this.images && this.images.length > 0) {
      return this.images[0];
    }
    else {
      return 'https://images.pexels.com/photos/398532/pexels-photo-398532.jpeg?w=1260&h=750&dpr=2&auto=compress&cs=tinysrgb';
    }
  }

  getImages(): Array<string> {
    if (this.images && this.images.length > 0) {
      return this.images;
    }
    else {
      return ['https://images.pexels.com/photos/398532/pexels-photo-398532.jpeg?w=1260&h=750&dpr=2&auto=compress&cs=tinysrgb'];
    }
  }

  getMembersCount(): string {
    return '' + this.members.length;
  }

  isOwner(user: User): boolean {
    return user.id == this.user.id;
  }

  getMembersText() {
    var res = '';
    if (this.translate.currentLang == "en") {
      if (this.members.length > 3) {
        res = this.members[0].firstname + ', ' + this.members[1].firstname + ', ' + this.members[2].firstname + " and " + (this.members.length - 3) + " others";
      }
      else if (this.members.length == 3) {
        res = this.members[0].firstname + ', ' + this.members[1].firstname + ' and ' + this.members[2].firstname;
      }
      else if (this.members.length == 2) {
        res = this.members[0].firstname + " and " + this.members[1].firstname;
      }
      else {
        res = "You are alone in this group!";
      }
    }
    else {
      if (this.members.length > 3) {
        res = this.members[0].firstname + ', ' + this.members[1].firstname + ', ' + this.members[2].firstname + " et " + (this.members.length - 3) + " autres";
      }
      else if (this.members.length == 3) {
        res = this.members[0].firstname + ', ' + this.members[1].firstname + ' et ' + this.members[2].firstname;
      }
      else if (this.members.length == 2) {
        res = this.members[0].firstname + " et " + this.members[1].firstname;
      }
      else {
        res = "Tu es seul dans ce groupe!";
      }
    }
    return res;
  }

}
