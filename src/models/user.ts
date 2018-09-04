import { PathTimeObject } from './pathtime-object';
import { Path } from './path';
import { Comment } from './comment';
import { Injector } from "@angular/core";
import { appInjector } from "../shared/app-injector";
import { ServerService } from "../shared/server.service";
import { Place } from "./place";
import { Photo } from "./photo";


export class User implements PathTimeObject {
  id: number;
  facebook_id: string;
  firstname: string;
  lastname: string;
  client_id: string;
  phone: string;
  tutorial_completed: boolean;
  isFollowed: boolean;
  profile_picture: string;
  rank: string;
  points: number;
  followers: number;
  follows: number;
  pathList: Array<Path>;
  placeList: Array<Place>;
  followList: Array<User>;
  followerList: Array<User>;
  records: Array<PathTimeObject>;
  todos: Array<PathTimeObject>;
  historic: Array<Comment<PathTimeObject>>;
  photoList: Array<Photo>;
  last_ip: string;


  constructor() {
    this.pathList = new Array<Path>();
    this.placeList = new Array<Place>();
    this.records = new Array<PathTimeObject>();
    this.todos = new Array<PathTimeObject>();
    this.followList = new Array<User>();
    this.followerList = new Array<User>();
    this.photoList = new Array<Photo>();
    this.historic = new Array<Comment<PathTimeObject>>();
  }

  from(user: User): void {
    this.id = user.id;
    this.facebook_id = user.facebook_id;
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.phone = user.phone;
    this.tutorial_completed = user.tutorial_completed;
    this.profile_picture = user.profile_picture;
    this.rank = user.rank;
    this.points = user.points;
    this.followers = user.followers;
    this.follows = user.follows;
    this.isFollowed = user.isFollowed;
    this.last_ip = user.last_ip;
    this.client_id = user.client_id;

    if (user.pathList) {
      for (let i = 0; i < user.pathList.length; ++i) {
        let path = new Path();
        path.from(user.pathList[i]);
        this.pathList.push(path);
      }
    }
     if (user.placeList) {
      for (let i = 0; i < user.placeList.length; ++i) {
        let place = new Place();
        place.from(user.placeList[i]);
        this.placeList.push(place);
      }
    }
    if (user.records) {
      for (let i = 0; i < user.records.length; ++i) {
        if (user.records[i] instanceof Path)
        {
          let path = new Path();
          path.from(user.records[i] as Path);
          this.records.push(path);
        }
        else {
          let place = new Place();
          place.from(user.records[i] as Place);
          this.records.push(place);
        }
      }
    }
    if (user.todos) {
      for (let i = 0; i < user.todos.length; ++i) {
        if (user.todos[i] instanceof Path)
        {
          let path = new Path();
          path.from(user.todos[i] as Path);
          this.todos.push(path);
        }
        else {
          let place = new Place();
          place.from(user.todos[i] as Place);
          this.todos.push(place);
        }
      }
    }
    if (user.historic) {
      for (let i = 0; i < user.historic.length; ++i) {
        if (user.historic[i].object instanceof Path)
        {
          let path = new Path();
          path.from(user.historic[i].object as Path);
          let comment = new Comment<Path>();
          comment.rate = user.historic[i].rate;
          comment.text = user.historic[i].text;
          this.historic.push(comment);
        }
        else {
          let place = new Place();
          place.from(user.historic[i].object as Place);
          let comment = new Comment<Path>();
          comment.rate = user.historic[i].rate;
          comment.text = user.historic[i].text;
          this.historic.push(comment);
        }
      }
    }

    if (user.followList) {
      for (let i = 0; i < user.followList.length; ++i) {
        let user = new User();
        user.from(user.followList[i]);
        this.followList.push(user);
      }
    }

     if (user.followerList) {
      for (let i = 0; i < user.followerList.length; ++i) {
        let user = new User();
        user.from(user.followerList[i]);
        this.followerList.push(user);
      }
    }

    if (user.photoList) {
      for (let i = 0; i < user.photoList.length; ++i) {
        let photo = new Photo();
        photo.from(user.photoList[i]);
        this.photoList.push(photo);
      }
    }
  }

  getName(): string {
    return this.firstname + " " + this.lastname;
  }

  getProfilePicture(): string {
        return "https://graph.facebook.com/" + this.facebook_id + "/picture?type=large";
  }

}
