import { Place } from './place';
import { User } from './user';
import { PathTimeObject } from './pathtime-object';

export class Comment<T extends PathTimeObject> implements PathTimeObject {
  public id: number;
  public user: User;
  public text: String;
  public rate: number;
  public images: Array<String>;
  public object: T;

  constructor() {
      this.images = new Array<String>();
  }

  from(comment: Comment<T>, ref: T): void {
    this.user = new User();
    this.user.from(comment.user);
    this.text = comment.text;
    this.rate = comment.rate;
    this.id = comment.id;
    this.object = ref;
    if (ref) {
      this.object.from(comment.object);
    }
    if (comment.images && comment.images.length > 0){
      comment.images.forEach(image => {
        this.images.push(image);
      });
    }
  }

  includeComments(comments: Array<Comment<PathTimeObject>>): boolean {
    let include = false;
    comments.forEach(c => {
      if (c.id === this.id) {
        include = true;
      }
    });
    return include;
  }
}
