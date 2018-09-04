import { User } from './user';
import { PathTimeObject } from "./pathtime-object";

export class SimpleComment implements PathTimeObject {
  public id: number;
  public user: User;
  public text: String;

  constructor() {
  }

  from(simple_comment: SimpleComment): void {
    this.user = new User();
    this.user.from(simple_comment.user);
    this.text = simple_comment.text;
    this.id = simple_comment.id;
  }
}
