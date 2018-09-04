import { Observable } from 'rxjs/Observable';

export class PtTap {
  startX: any;
  startY: any;
  startTime: any;

  constructor(e: any) {
    this.startX = e.changedTouches[0].clientX;
    this.startY = e.changedTouches[0].clientY;
    this.startTime = e.timeStamp;
  }

  needFire(e: any): boolean {
    return (Math.abs(this.startX - e.changedTouches[0].clientX) <= 5  &&
      Math.abs(this.startY - e.changedTouches[0].clientY) <= 5 && e.timeStamp - this.startTime <= 500);
  }
}
