import {AutoCompleteService} from 'ionic2-auto-complete';
import { Http } from '@angular/http';
import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map';
import { User } from '../models/user';
import { ServerService } from "./server.service";
import { UserService } from "./user.service";

@Injectable()
export class CompleteFeedService implements AutoCompleteService {
  labelAttribute = "name";

  constructor(private http:Http, private server: ServerService, private user: UserService) {

  }
  getResults(keyword:string) {
    return this.http.get(this.server.server +"/api/user/search?keyword="+keyword+'&facebook_id='+this.user.getFBID())
      .map(
        result =>
        {
          let res = result.json().data;
          let users = new Array<User>();
          for (let i = 0; i < res.length; ++i) {
            let n = new User();
            n.from(res[i]);
            users.push(n);
          }
          return users
        });
  }
}
