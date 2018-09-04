import { Injectable } from '@angular/core';

import { Http, URLSearchParams, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { Category } from '../models/category';
import { Comment } from '../models/comment';
import { NewsType, EventType, EventResponseChoice } from '../models/enum';
import { Filter } from '../models/filter';
import { ConnectedResponse, LoginResponse } from '../models/login';
import { Mood } from '../models/mood';
import { New } from '../models/new';
import { Path } from '../models/path';
import { PathTimeObject } from '../models/pathtime-object';
import { Place } from '../models/place';
import { Planification } from '../models/planification';
import { User } from '../models/user';
import { UserService } from './user.service';
import { Inspiration } from "../models/inspiration";
import { Photo } from "../models/photo";
import { Group } from "../models/group";
import { Event } from "../models/event";
import { PathtimeNotification } from "../models/notification";
import { Chat } from "../models/chat";


declare const ENV;


export class ServerGetResponse<T> {
  data: T;
  before: string;
  after: string;
  previous: string;
  next: string;
}

class ServerPostResponse {
  status: String;
  code: number;
  text: String;
}

@Injectable()
export class ServerService {
  public server: string = ENV.API_URL;
  public segmentKey: string = ENV.SEGMENT_KEY;

  constructor(private userService: UserService, private http: Http) {
  }

  private getOptions(params: any): RequestOptions {
    let search = new URLSearchParams();
    for (let key in params) {
      search.set(key, params[key]);
    }

    let headers = new Headers();
    headers.set("Authorization", "Token " + this.userService.getFBToken());

    let options = new RequestOptions({
      search: search,
      headers: headers
    });

    return options;
  }

  private postOptions(): RequestOptions {
    let headers = new Headers();
    headers.set("Authorization", "Token " + this.userService.getFBToken());
    headers.set("Content-Type", "application/json");

    let options = new RequestOptions({ headers: headers });

    return options;
  }

  connect(response: LoginResponse): Observable<ConnectedResponse> {
    let options = this.postOptions();

    return this.http.post(this.server + '/api/connect', {
      'phone': response.phone,
      'facebook_token': response.token,
      'device_id': response.device,
      'language': response.language
    }, options)
    .map(response => {
      this.userService.setSlides(response.json().tutorials);
      let notifications = response.json().notifications;
      let notifs = new Array<PathtimeNotification>();
      for (let i = 0; i < notifications.length; ++i) {
        let n = new PathtimeNotification();
        n.from(notifications[i]);
        notifs.push(n);
      }
      this.userService.setNotifications(notifs);
      return response.json().profile as ConnectedResponse;
    })
    .catch(error => {
        console.error("Failed to connect user: ", error);
        return Observable.throw(error.message || error);
    });
  }

  refreshNotifications() {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
    });
    return this.http.get(this.server + "/api/user/notifications", options)
    .map(response => {
      let notifications = response.json().notifications;
      let notifs = new Array<PathtimeNotification>();
      for (let i = 0; i < notifications.length; ++i) {
        let n = new PathtimeNotification();
        n.from(notifications[i]);
        notifs.push(n);
      }
      this.userService.setNotifications(notifs);
    });
  }

  markNotificationsAsDone(){
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/notifications', {
      'facebook_id': this.userService.getFBID()
    }, options)
    .map(response => {
      let notifications = response.json().notifications;
      let notifs = new Array<PathtimeNotification>();
      for (let i = 0; i < notifications.length; ++i) {
        let n = new PathtimeNotification();
        n.from(notifications[i]);
        notifs.push(n);
      }
      this.userService.setNotifications(notifs);
    })
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  tutorialDone(): Observable<any> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/tutorial', {
      'facebook_id': this.userService.getFBID()
    }, options)
    .map(response => response.json().user)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getNextPage<T>(url: string): Observable<ServerGetResponse<T>> {
    return this.http.get(url, this.getOptions({}))
    .map(response => response.json().data as ServerGetResponse<T>)
    .catch(error => {
      console.error("Failed to get next page: ", error);
      return Observable.throw(error.message || error);
    });
  }

  getPathList(user: User): Observable<any> {
    let u = user;
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'user_checked_facebook_id': user.facebook_id
    });
    return this.http.get(this.server + "/api/user/pathList", options)
    .map(response => {
      let paths = response.json().paths;
      u.pathList.splice(0, u.pathList.length)

      for (let i = 0; i < paths.length; ++i) {
        let n = new Path();
        n.from(paths[i]);
        u.pathList.push(n);
      }

      let places = response.json().places;

      u.placeList.splice(0, u.placeList.length)

      for (let i = 0; i < places.length; ++i) {
        let n = new Place();
        n.from(places[i]);
        u.placeList.push(n);
      }
      return u;
    })
    .catch(error => {
      console.error("Failed to get pathList: ", error);
      return Observable.throw(error.message || error);
    });

  }

  getRecords(user: User): Observable<any> {
    let u = user;
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'user_checked_facebook_id': user.facebook_id
    });
    return this.http.get(this.server + "/api/user/favorite", options)
    .map(response => {
      let records = response.json().favorite;

      for (let i = 0; i < records.length; ++i) {
        if (records[i].type === 'path'){
          let n = new Path();
          n.from(records[i].path);
          u.records.push(n);
        } else {
          let n = new Place();
          n.from(records[i].step);
          u.records.push(n);
        }
      }
      return u;
    })
    .catch(error => {
      console.error("Failed to get pathList: ", error);
      return Observable.throw(error.message || error);
    });

  }

  getTodos(user: User): Observable<any> {
    let u = user;
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'user_checked_facebook_id': user.facebook_id
    });
    return this.http.get(this.server + "/api/user/todo", options)
    .map(response => {
      let todos = response.json().todos;
      u.todos.splice(0, u.todos.length)
      for (let i = 0; i < todos.length; ++i) {
        if (todos[i].type === 'path'){
          let n = new Path();
          n.from(todos[i].path);
          u.todos.push(n);
        } else  if (todos[i].type === 'undonePath'){
          let n = new Path();
          n.from(todos[i].path);
          n.undone = true;
          u.todos.push(n);
        } else if (todos[i].type === 'step') {
          let n = new Place();
          n.from(todos[i].step);
          u.todos.push(n);
        } else {
          let n = new Place();
          n.from(todos[i].step);
          n.undone = true;
          u.todos.push(n);
        }
      }
      return u;
    })
    .catch(error => {
      console.error("Failed to get todos: ", error);
      return Observable.throw(error.message || error);
    });

  }

  getHistoric(user: User): Observable<any> {
    let u = user;
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'user_checked_facebook_id': user.facebook_id
    });
    return this.http.get(this.server + "/api/user/historic", options)
    .map(response => {
      let historic = response.json().historic;
       u.historic.splice(0, u.historic.length)
      for (let i = 0; i < historic.length; ++i) {
        if (historic[i].type === 'path'){
          let n = new Comment<Path>();
          let p = new Path();
          p.from(historic[i].object);
          n.object = p;
          n.text = historic[i].text;
          n.rate = historic[i].rate;
          u.historic.push(n);
        } else {
           let n = new Comment<Place>();
          let p = new Place();
          p.from(historic[i].object);
          n.object = p;
          n.text = historic[i].text;
          n.rate = historic[i].rate;
          u.historic.push(n);
        }
      }
      return u;
    })
    .catch(error => {
      console.error("Failed to get pathList: ", error);
      return Observable.throw(error.message || error);
    });

  }

  getAllFollowsList(user: User): Observable<any> {
    let u = user;
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'user_checked_facebook_id': user.facebook_id
    });
    return this.http.get(this.server + "/api/user/allFollowsList", options)
    .map(response => {
      let follows = response.json().follows;

      for (let i = 0; i < follows.length; ++i) {
        let n = new User();
        n.from(follows[i]);
        u.followList.push(n);
      }

      let followers = response.json().followers;

      for (let i = 0; i < followers.length; ++i) {
        let n = new User();
        n.from(followers[i]);
        u.followerList.push(n);
      }
      return u;
    })
    .catch(error => {
      console.error("Failed to get followList: ", error);
      return Observable.throw(error.message || error);
    });

  }

  getTopPather(): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID()
    });
    return this.http.get(this.server + "/api/user/topPather", options)
    .map(response => {
      let pathers = response.json().user;
      let u = new Array<User>();
      for (let i = 0; i < pathers.length; ++i) {
        let n = new User();
        n.from(pathers[i]);
        u.push(n);
      }
      return u;
    })
    .catch(error => {
      console.error("Failed to get Top Pather: ", error);
      return Observable.throw(error.message || error);
    });

  }

  getRecommendedPather(): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID()
    });
    return this.http.get(this.server + "/api/user/recommendedPather", options)
    .map(response => {
      let pathers = response.json().user;
      let u = new Array<User>();
      for (let i = 0; i < pathers.length; ++i) {
        let n = new User();
        n.from(pathers[i]);
        u.push(n);
      }
      return u;
    })
    .catch(error => {
      console.error("Failed to get Recommended Pather: ", error);
      return Observable.throw(error.message || error);
    });

  }

  getPhotoList(user: User): Observable<any> {
    let u = user;
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'user_checked_facebook_id': user.facebook_id
    });
    return this.http.get(this.server + "/api/user/photoList", options)
    .map(response => {
      let photos = response.json().images;

      for (let i = 0; i < photos.length; ++i) {
        let n = new Photo();
        n.from(photos[i]);
        u.photoList.push(n);
      }
      return u;
    })
    .catch(error => {
      console.error("Failed to get photos: ", error);
      return Observable.throw(error.message || error);
    });

  }

  getNews(limit, offset): Observable<ServerGetResponse<Array<New<PathTimeObject>>>> {
    let options = this.getOptions({
      "facebook_id": this.userService.getFBID(),
      "limit": limit,
      "offset": offset
    });

    return this.http.get(this.server + "/api/user/flux", options)
    .map(response => {
      let data = new Array<New<PathTimeObject>>();
      let res = response.json() as ServerGetResponse<Array<New<PathTimeObject>>>;

      for (let i = 0; i < res.data.length; ++i) {
        let n = new New<PathTimeObject>();
        let ref: PathTimeObject;
        let nt = <any>NewsType[res.data[i].newsType];

        res.data[i].newsType = nt;

        if (nt == NewsType.PlaceCreation || nt ==NewsType.PlaceLike
          || nt ==NewsType.PlaceCompatibility) {
          ref = new Place();
        }
        else if (nt == NewsType.PathCreation || nt == NewsType.PathLike) {
          ref = new Path();
        }
        else if (nt == NewsType.PlaceComment || nt == NewsType.PlaceRate) {
          ref = new Comment<Place>();
        }
        else if (nt == NewsType.PathComment || nt == NewsType.PathRate) {
          ref = new Comment<Path>();
        }
        else if (nt == NewsType.Follow) {
          ref = new User();
        }
        else {
          ref = null;
        }

        n.from(res.data[i], ref);
        data.push(n)

      }
      res.data = data;
      return res;
    })
    .catch(error => {
      console.error("Failed to get news feed: ", error);
      return Observable.throw(error.message || error);
    });
  }

  updateClientId(client_id) {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/clientid', {
      'facebook_id': this.userService.getFBID(),
      'client_id': client_id
    }, options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to update client_id: ", error);
        return Observable.throw(error.message || error);
    });
  }

  likePath(id: number): Observable<any> {
    let options = this.postOptions();
    return this.http.put(this.server + '/api/user/like/path', {
      'facebook_id': this.userService.getFBID(),
      'path_id': id
    }, options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  dislikePath(id: number): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'path_id': id
    });
    return this.http.delete(this.server + '/api/user/like/path', options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  likePlace(id: number): Observable<any> {
    let options = this.postOptions();
    return this.http.put(this.server + '/api/user/like/step', {
      'facebook_id': this.userService.getFBID(),
      'step_id': id
    }, options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  dislikePlace(id: number): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'step_id': id
    });
    return this.http.delete(this.server + '/api/user/like/step', options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  likeChatMessage(id: number): Observable<any> {
    let options = this.postOptions();
    return this.http.put(this.server + '/api/chat_message/like', {
      'facebook_id': this.userService.getFBID(),
      'chat_id': id
    }, options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  dislikeChatMessage(id: number): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'chat_id': id
    });
    return this.http.delete(this.server + '/api/chat_message/like', options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }


  favorPlace(id: number): Observable<any> {
    let options = this.postOptions();
    return this.http.put(this.server + '/api/user/todo/step', {
      'facebook_id': this.userService.getFBID(),
      'step_id': id
    }, options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  unfavorPlace(id: number): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'step_id': id
    });
    return this.http.put(this.server + '/api/user/todo/step', options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  favorPath(id: number): Observable<any> {
    let options = this.postOptions();
    return this.http.put(this.server + '/api/user/todo/path', {
      'facebook_id': this.userService.getFBID(),
      'path_id': id
    }, options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  unfavorPath(id: number): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'path_id': id
    });
    return this.http.delete(this.server + '/api/user/todo/path', options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  addFollow(user: User): Observable<any> {
    let options = this.postOptions();
    return this.http.put(this.server + '/api/user/follow', {
      'facebook_id': this.userService.getFBID(),
      'user_follow_facebook_id': user.facebook_id
    }, options)
    .map(response => response.json().user_follow
      )
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  deleteFollow(user: User): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'user_follow_facebook_id': user.facebook_id
    });
    return this.http.get(this.server + '/api/user/deleteFollow', options)
    .map(response => response.json().user_follow)
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  logout(): Observable<any> {
    let options = this.postOptions();

    return this.http.put(this.server + '/api/user/logout', {
      'facebook_id': this.userService.getFBID()
    }, options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to logout: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getPlace(id): Observable<Place> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'google_id': id
    });

    return this.http.get(this.server + '/api/user/step', options)
    .map(response => {
      let p = response.json();
      let place = new Place();
      place.from(p.step);
      return place;
    })
    .catch(error => {
        console.error("Failed to get place: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getPlacesFromIds(ids): Observable<Array<Place>> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'steps': ids
    });

    return this.http.get(this.server + '/api/user/steps', options)
    .map(response => {
      let p = response.json();
      var places = new Array();
      p.steps.forEach(step => {
        let place = new Place();
        place.from(step);
        places.push(place);
      });
      return places;
    })
    .catch(error => {
        console.error("Failed to get places: ", error);
        return Observable.throw(error.message || error);
    });
  }

  sendPlaceComment(comment: Comment<Place>): Observable<any> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/step/opinion', {
      'facebook_id': comment.user.facebook_id,
      'opinion': {
        'comment': comment.text,
        'note': comment.rate,
        'images': comment.images
      },
      'step_id': comment.object.id
    }, options)
    .map(response => {
      let c = new Comment<Place>();
      c.from(response.json().comment, null);
      return c;
    })
    .catch(error => {
        console.error("Failed to send comment: ", error);
        return Observable.throw(error.message || error);
    });
  }

  sendPathComment(comment: Comment<Path>): Observable<any> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/path/opinion', {
      'facebook_id': comment.user.facebook_id,
      'opinion': {
        'comment': comment.text,
        'note': comment.rate
      },
      'path_id': comment.object.id
    }, options)
    .map(response => {
      let c = new Comment<Path>();
      c.from(response.json().comment, null);
      return c;
    })
    .catch(error => {
        console.error("Failed to send comment: ", error);
        return Observable.throw(error.message || error);
    });
  }

  sendEventOpinion(comment: Comment<Event<PathTimeObject>>): Observable<any> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/event/opinion', {
      'facebook_id': comment.user.facebook_id,
      'opinion': {
        'comment': comment.text,
        'note': comment.rate
      },
      'event_id': comment.object.id
    }, options)
    .map(response => {response.json().comment})
    .catch(error => {
        console.error("Failed to send comment: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getPlaceComments(id): Observable<ServerGetResponse<Array<Comment<Place>>>> {
    let options = this.getOptions({
      'place_id': id,
      'facebook_id': this.userService.getFBID()
    });

    return this.http.get(this.server + '/api/place/opinion', options)
    .map(response => {
      let res = response.json() as ServerGetResponse<Array<Comment<Place>>>;
      let comments = new Array<Comment<Place>>();
      for (let i = 0; i < res.data.length; ++i) {
        let c = new Comment<Place>();
        c.from(res.data[i], new Place());
        comments.push(c);
      }

      res.data = comments;
      return res;
    })
    .catch(error => {
        console.error("Failed to get place opinion: ", error);
        return Observable.throw(error.message || error);
    });
  }

 

  getCategories(): Observable<Array<Category>> {
    let options = this.getOptions({});

    return this.http.get(this.server + '/api/activityType/all', options)
    .map(response => response.json().activity)
    .catch(error => {
        console.error("Failed to get place opinion: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getMoods(): Observable<Array<Mood>> {
    let options = this.getOptions({});

    return this.http.get(this.server + '/api/mood/all', options)
    .map(response => response.json().mood)
    .catch(error => {
        console.error("Failed to get place opinion: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getPlanification(filter: Filter): Observable<Array<Planification>> {
    let options = this.postOptions();
    let body = {
      'facebook_id': this.userService.getFBID(),
      'activity_types': filter.categories,
      'city_id': filter.city_id,
      'city': filter.city,
      'city_lat': filter.city_lat,
      'city_lng': filter.city_lng,
      'moods': filter.moods
    }

    return this.http.post(this.server + '/api/user/step/planification', body, options)
    .map(response => {
      let plans = <Array<Planification>>response.json().planification;
      let res = new Array<Planification>();
      for (let i = 0; i < plans.length; ++i) {
        let p = new Planification();
        p.from(plans[i]);
        res.push(p);
      }
      return res;
    })
    .catch(error => {
        console.error("Failed to get place opinion: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getInspiration(filter: Filter): Observable<Inspiration> {
    let options = this.postOptions();
    let body = {
      'facebook_id': this.userService.getFBID(),
      'activity_types': filter.categories,
      'city_id': filter.city_id,
      'city': filter.city,
      'city_lat': filter.city_lat,
      'city_lng': filter.city_lng,
      'moods': filter.moods
    }

    return this.http.post(this.server + '/api/user/path/inspiration', body, options)
    .map(response => {
      let paths = response.json().path;
      let res = new Inspiration();
      for (let i = 0; i < paths.length; ++i) {
        let p = new Path();
        p.from(paths[i]);
        res.paths.push(p);
      }
      return res;
    })
    .catch(error => {
        console.error("Failed to get place opinion: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getAroundMe(lat, lng): Observable<any> {
    let options = this.postOptions();
    let body = {
      'facebook_id': this.userService.getFBID(),
      'lat': lat,
      'lng': lng
    }

    return this.http.post(this.server + '/api/user/aroundme', body, options)
    .map(response => {
      let paths = <Array<Path>>response.json().paths;
      let places = <Array<Place>>response.json().places;
      let resPath = new Array<Path>();
      let resPlace = new Array<Place>();
      for (let i = 0; i < paths.length; ++i) {
        let p = new Path();
        p.from(paths[i]);
        resPath.push(p);
      }
      for (let i = 0; i < places.length; ++i) {
        let p = new Place();
        p.from(places[i]);
        resPlace.push(p);
      }
      return {
        paths: resPath,
        places: resPlace  
      };
    })
    .catch(error => {
        console.error("Failed to get around me: ", error);
        return Observable.throw(error.message || error);
    });
  }


  createPath(path: Path): Observable<any> {
    let options = this.postOptions();
    let data = {
      name: path.name,
      description: path.description,
      people: [],
      city: path.getCity(),
      lat: path.getLat(),
      lng: path.getLng(),
      steps: [],
      moods: []
    }

    for (let i = 0; i < path.stepsNumber(); ++i) {
      data.steps.push({ id: path.places[i].id });
    }
    for (let i = 0; i < path.moods.length; ++i) {
      data.moods.push({ id: path.moods[i].id });
    }
    for (let i = 0; i < path.with.length; ++i) {
      data.people.push({ id: path.with[i].value });
    }

    return this.http.post(this.server + '/api/user/path', {
      'facebook_id': this.userService.getFBID(),
      'path': data
    }, options)
    .map(response => {
      let p = new Path();
      p.from(response.json());
      return p;
    })
    .catch(error => {
        console.error("Failed to create the path: ", error);
        return Observable.throw(error.message || error);
    });
  }

  updatePath(path: Path): Observable<any> {
    let options = this.postOptions();
    let data = {
      id: path.id,
      name: path.name,
      description: path.description,
      people: [],
      steps: [],
      moods: []
    }

    for (let i = 0; i < path.stepsNumber(); ++i) {
      data.steps.push({ id: path.places[i].id });
    }
    for (let i = 0; i < path.moods.length; ++i) {
      data.moods.push({ id: path.moods[i].id });
    }
    for (let i = 0; i < path.with.length; ++i) {
      data.people.push({ id: path.with[i].value });
    }
    return this.http.patch(this.server + '/api/user/path', {
      'facebook_id': this.userService.getFBID(),
      'path': data
    }, options)
    .map(response => {
      let p = new Path();
      p.from(response.json());
      return p;
    })
    .catch(error => {
        console.error("Failed to update the path: ", error);
        return Observable.throw(error.message || error);
    });
  }

  deletePath(path_id: number): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'path_id': path_id
    });
    return this.http.delete(this.server + '/api/user/path', options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to delete path: ", error);
        return Observable.throw(error.message || error);
    });
  }

  createPathFromUndone(path: Path, undone_path_id: number): Observable<any> {
    let options = this.postOptions();
    let data = {
      name: path.name,
      description: path.description,
      people: [],
      city: path.getCity(),
      steps: [],
      moods: []
    }

    for (let i = 0; i < path.stepsNumber(); ++i) {
      data.steps.push({ id: path.places[i].id });
    }
    for (let i = 0; i < path.moods.length; ++i) {
      data.moods.push({ id: path.moods[i].id });
    }
    for (let i = 0; i < path.with.length; ++i) {
      data.people.push({ id: path.with[i].value });
    }
    return this.http.post(this.server + '/api/user/validateUndonePath', {
      'facebook_id': this.userService.getFBID(),
      'path': data,
      'undone_path_id': undone_path_id
    }, options)
    .map(response => {
      let p = new Path();
      p.from(response.json());
      return p;
    })
    .catch(error => {
        console.error("Failed to create the path: ", error);
        return Observable.throw(error.message || error);
    });
  }

  createUndonePath(path: Path): Observable<any> {
    let options = this.postOptions();

    let data = {
      name: path.name,
      city: path.getCity(),
      steps: []
    }

    for (let i = 0; i < path.stepsNumber(); ++i) {
      data.steps.push({ id: path.places[i].id });
    }
    return this.http.post(this.server + '/api/user/undonePath', {
      'facebook_id': this.userService.getFBID(),
      'undone_path': data
    }, options)
    .map(response => {
      let p = new Path();
      p.from(response.json());
      return p;
    })
    .catch(error => {
        console.error("Failed to create the Undonepath: ", error);
        return Observable.throw(error.message || error);
    });
  }

  createPlace(place: Place): Observable<Place> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/step', {
      'facebook_id': this.userService.getFBID(),
      'step': place.getCreationField()
    }, options)
    .map(response => {
      let place = new Place();
      place.from(response.json().step);
      return place;
    })
    .catch(error => {
        console.error("Failed to create the place: ", error);
        return Observable.throw(error.message || error);
    });
  }

  createPlaceAndComment(place: Place, comment: Comment<Place>): Observable<Place> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/step', {
      'facebook_id': this.userService.getFBID(),
      'step': place.getCreationField(),
      'opinion': {
        'comment': comment.text,
        'note': comment.rate
      }
    }, options)
    .map(response => {
      let place = new Place();
      place.from(response.json().step);
      return place;
    })
    .catch(error => {
        console.error("Failed to create the place: ", error);
        return Observable.throw(error.message || error);
    });
  }

  createPendingMood(name: string): Observable<Place> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/moodPending', {
      'facebook_id': this.userService.getFBID(),
      'name': name
    }, options)
    .map(response => {
    })
    .catch(error => {
        console.error("Failed to create the pending mood: ", error);
        return Observable.throw(error.message || error);
    });
  }

  createPendingCategory(name: string): Observable<Place> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/activityTypePending', {
      'facebook_id': this.userService.getFBID(),
      'name': name
    }, options)
    .map(response => {
    })
    .catch(error => {
        console.error("Failed to create the pending mood: ", error);
        return Observable.throw(error.message || error);
    });
  }

  createGroup(group: Group): Observable<any> {
    let options = this.postOptions();
    let data = {
      name: group.name,
      description: group.description,
      members: [],
      images: group.images
    }

    for (let i = 0; i < group.members.length; ++i) {
      data.members.push({ user_id: group.members[i].id });
    }

    return this.http.post(this.server + '/api/user/group', {
      'facebook_id': this.userService.getFBID(),
      'group': data
    }, options)
    .map(response => {
      let g = new Group();
      g.from(response.json());
      return g;
    })
    .catch(error => {
        console.error("Failed to create the group: ", error);
        return Observable.throw(error.message || error);
    });
  }

  updateGroup(group: Group): Observable<any> {
    let options = this.postOptions();
    let data = {
      id: group.id,
      name: group.name,
      description: group.description,
      members: [],
      images: group.images
    }

    for (let i = 0; i < group.members.length; ++i) {
      data.members.push({ user_id: group.members[i].id });
    }

    return this.http.patch(this.server + '/api/user/group/', {
      'facebook_id': this.userService.getFBID(),
      'group': data
    }, options)
    .map(response => {
      let g = new Group();
      g.from(response.json());
      return g;
    })
    .catch(error => {
        console.error("Failed to update the group: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getPathChats(path_id, limit, offset): Observable<Array<Chat>> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'path_id': path_id,
      "limit": limit,
      "offset": offset
    });

    return this.http.get(this.server + '/api/chat_messages/', options)
    .map(response => {
      let res = response.json().chats as Array<Chat>;
      let chats = new Array<Chat>();
      for (let i = 0; i < res.length; ++i) {
        let c = new Chat();
        c.from(res[i]);
        chats.push(c);
      }
      return chats;
    })
    .catch(error => {
        console.error("Failed to get chats: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getPlaceChats(place_id, limit, offset): Observable<Array<Chat>> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'place_id': place_id,
      "limit": limit,
      "offset": offset
    });

    return this.http.get(this.server + '/api/chat_messages/', options)
    .map(response => {
      let res = response.json().chats as Array<Chat>;
      let chats = new Array<Chat>();
      for (let i = 0; i < res.length; ++i) {
        let c = new Chat();
        c.from(res[i]);
        chats.push(c);
      }
      return chats;
    })
    .catch(error => {
        console.error("Failed to get chats: ", error);
        return Observable.throw(error.message || error);
    });
  }

  sendChatMessage(path_id, place_id, textToSend): Observable<Array<Chat>> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/chat_message/', {
      'facebook_id': this.userService.getFBID(),
      'path_id': path_id,
      'place_id': place_id,
      'message': textToSend
    }, options)
    .map(response => {
      let res = response.json().chats as Array<Chat>;
      let chats = new Array<Chat>();
      for (let i = 0; i < res.length; ++i) {
        let c = new Chat();
        c.from(res[i]);
        chats.push(c);
      }
      return chats;
    })
    .catch(error => {
        console.error("Failed to send chat message: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getGroups(limit, offset): Observable<Array<Group>> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      "limit": limit,
      "offset": offset
    });

    return this.http.get(this.server + '/api/user/groups/', options)
    .map(response => {
      let res = response.json().groups as Array<Group>;
      let groups = new Array<Group>();
      for (let i = 0; i < res.length; ++i) {
        let gr = new Group();
        gr.from(res[i]);
        groups.push(gr);
      }
      return groups;
    })
    .catch(error => {
        console.error("Failed to get groups: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getEvent(event_id): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      "event_id": event_id
    });

    return this.http.get(this.server + '/api/user/event', options)
    .map(response => {
      let event = response.json().event;
      return Event.parseEvent(event);
      
    })
    .catch(error => {
        console.error("Failed to get event: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getGroupEvents(group_id, limit, offset): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      "group_id": group_id,
      "limit": limit,
      "offset": offset
    });

    return this.http.get(this.server + '/api/group/events/', options)
    .map(response => {
      let res = response.json().groups.pending_events as Array<Event<PathTimeObject>>;
      let pending_events = Event.parseEvents(res);
      let res_todo = response.json().groups.todo_events as Array<Event<PathTimeObject>>;
      let todo_events = Event.parseEvents(res_todo);
      let res_done = response.json().groups.done_events as Array<Event<PathTimeObject>>;
      let done_events = Event.parseEvents(res_done);
      return {
        pending_events: pending_events,
        todo_events: todo_events,
        done_events: done_events
      }
    })
    .catch(error => {
        console.error("Failed to get groups: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getGroupPendingEvents(group_id, limit, offset): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      "group_id": group_id,
      "limit": limit,
      "offset": offset
    });

    return this.http.get(this.server + '/api/group/events/pending', options)
    .map(response => {
      let res = response.json() as Array<Event<PathTimeObject>>;
      let pending_events = Event.parseEvents(res);
      return pending_events;
    })
    .catch(error => {
        console.error("Failed to get groups: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getGroupTodoEvents(group_id, limit, offset): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      "group_id": group_id,
      "limit": limit,
      "offset": offset
    });

    return this.http.get(this.server + '/api/group/events/todo', options)
    .map(response => {
      let res = response.json() as Array<Event<PathTimeObject>>;
      let todo_events = Event.parseEvents(res);
      return todo_events;
    })
    .catch(error => {
        console.error("Failed to get groups: ", error);
        return Observable.throw(error.message || error);
    });
  }

  getGroupDoneEvents(group_id, limit, offset): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      "group_id": group_id,
      "limit": limit,
      "offset": offset
    });

    return this.http.get(this.server + '/api/group/events/done', options)
    .map(response => {
      let res = response.json() as Array<Event<PathTimeObject>>;
      let done_events = Event.parseEvents(res);
      return done_events;
    })
    .catch(error => {
        console.error("Failed to get groups: ", error);
        return Observable.throw(error.message || error);
    });
  }

  deleteGroup(group_id: number): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'group_id': group_id
    });
    return this.http.delete(this.server + '/api/user/group', options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to delete group: ", error);
        return Observable.throw(error.message || error);
    });
  }

  deleteEvent(event_id: number): Observable<any> {
    let options = this.getOptions({
      'facebook_id': this.userService.getFBID(),
      'event_id': event_id
    });
    return this.http.delete(this.server + '/api/user/event', options)
    .map(response => response.json().data)
    .catch(error => {
        console.error("Failed to delete event: ", error);
        return Observable.throw(error.message || error);
    });
  }

  validateEvent(event_id: number): Observable<any> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/event/validate', {
      'facebook_id': this.userService.getFBID(),
      'event_id': event_id
    }, options)
    .map(response => {
      let res = response.json();
      let e = Event.parseEvent(res);
      return e;
    })
    .catch(error => {
        console.error("Failed to validate event: ", error);
        return Observable.throw(error.message || error);
    });
  }

  postEventChoice(event_id: Number, choice: EventResponseChoice): Observable<any> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/event/response', {
      'facebook_id': this.userService.getFBID(),
      'event_id': event_id,
      'response': choice
    }, options)
    .map(response => {
      let res = response.json();
      let e = Event.parseEvent(res);
      return e;
    })
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  sendEventComment(event_id: Number, comment: String): Observable<any> {
    let options = this.postOptions();
    return this.http.post(this.server + '/api/user/event/comment', {
      'facebook_id': this.userService.getFBID(),
      'event_id': event_id,
      'comment': comment
    }, options)
    .map(response => {
      let res = response.json();
      let e = Event.parseEvent(res);
      return e;
    })
    .catch(error => {
        console.error("Failed to get news feed: ", error);
        return Observable.throw(error.message || error);
    });
  }

  createEvent(event: Event<PathTimeObject>): Observable<any> {
    let options = this.postOptions();
    let data = {
      name: event.name,
      description: event.description,
      date: event.date,
      group_id: event.group.id,
      event_type: event.event_type,
      activity_id: event.activity.id
    }
    return this.http.post(this.server + '/api/user/event', {
      'facebook_id': this.userService.getFBID(),
      'event': data
    }, options)
    .map(response => response.json())
    .catch(error => {
        console.error("Failed to create Event: ", error);
        return Observable.throw(error.message || error);
    });
  }

  updateEvent(event: Event<PathTimeObject>): Observable<any> {
    let options = this.postOptions();
    let data = {
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      group_id: event.group.id,
      event_type: event.event_type,
      activity_id: event.activity.id
    }
    return this.http.patch(this.server + '/api/user/event', {
      'facebook_id': this.userService.getFBID(),
      'event': data
    }, options)
    .map(response => response.json())
    .catch(error => {
        console.error("Failed to create Event: ", error);
        return Observable.throw(error.message || error);
    });
  }


  getLoadingContent(msg: string) {
    return `
      <div>
        <img />
      </div>
      <p>` +
      msg + `
      </p>
    `;
  }
}
