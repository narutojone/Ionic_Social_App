export interface PathTimeObject {
  id: number;

  from(object: PathTimeObject, ref?: any): void;
}
