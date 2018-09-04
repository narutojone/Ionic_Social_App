import { Category } from './category';
import { Path } from './path';

export class Inspiration {
  paths: Array<Path>;

  constructor() {
    this.paths = new Array<Path>();
  }

  from(inspiration: Inspiration): void {
    if (inspiration.paths) {
      this.paths = new Array<Path>();
      for (var i = 0; i < inspiration.paths.length; ++i) {
        let s = new Path();
        s.from(inspiration.paths[i]);
        this.paths.push(s);
      }
    }
  }
}
