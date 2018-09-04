import { ApplicationRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({ selector: 'pt-star-rating', templateUrl: 'star-rating.html' })
export class StarRatingComponent {
  private empty: Array<number>;
  private half: number;
  private halfPresent: boolean;
  private full: Array<number>
  private _rate: number;

  @Input() editable: boolean = false;
  @Input() newsCardSection: boolean = false;
  @Input() color: string = 'rate-color';
  @Input() colorEmpty: string = 'light_grey';
  @Input() colorNewsCard: string = 'dark-text';
  @Input() colorNewsCardEmpty: string = 'less-dark-text';
  @Input() number: number = 5;
  @Input()
  set rate(rate: number) {
    if (rate % 1 >= 0.5) {
      this.halfPresent = true;
    }
    else {
      this.halfPresent = false;
    }
    this._rate = rate;
    this.empty = new Array<number>();
    this.full = new Array<number>();
    let i = 0;
    for (; i <= rate - 1; ++i) {
      this.full.push(i + 1);
    }
    this.half = i;
    for (; (this.halfPresent && i + 1 < this.number) || (!this.halfPresent && i < this.number); ++i) {
      this.empty.push(i + 1);
    }
  };
  @Output() rateChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(private appRef: ApplicationRef) {

  }

  changeRate(rate: number): void {
    if (!this.editable) return;

    this.rate = rate;
    this.rateChange.emit(rate);

    //this.appRef.tick();
  }

  getHalfWidth(): number {
    let res = (this._rate + 1 - this.half) * 100;
    return res;
  }
}
