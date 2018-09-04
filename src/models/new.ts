import { Injector } from '@angular/core';
import { appInjector } from '../shared/app-injector';
import { User } from './user';
import { Path } from './path';
import { Place } from './place';
import { PathTimeObject } from './pathtime-object';
import { ServerService } from '../shared/server.service';
import { NewsType } from './enum';

export class New<T extends PathTimeObject> {
  id: number;
  user: User;
  data: T;
  newsType: NewsType;
  date: Date;

  private server: ServerService;

  constructor() {
    let injector: Injector = appInjector(); // get the stored reference to the injector
    this.server = injector.get(ServerService);
  }

  from(obj: New<T>, ref: T): void {
    this.id = obj.id;
    this.user = new User();
    this.user.from(obj.user);
    this.date = obj.date;
    this.newsType = obj.newsType;
    this.data = ref;
    if (this.newsType == NewsType.PlaceComment || this.newsType == NewsType.PlaceRate)
      this.data.from(obj.data, new Place());
    else if (this.newsType == NewsType.PathComment || this.newsType == NewsType.PathRate)
      this.data.from(obj.data, new Path());
    else
      this.data.from(obj.data);
  }
}
