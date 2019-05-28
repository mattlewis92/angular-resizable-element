/**
 * The edges that the resize event were triggered on
 */
export interface Edges {
  top?: boolean | number;
  bottom?: boolean | number;
  left?: boolean | number;
  right?: boolean | number;
  [key: string]: boolean | number | undefined;
}
