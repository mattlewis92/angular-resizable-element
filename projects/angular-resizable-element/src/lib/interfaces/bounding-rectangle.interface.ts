/**
 * The bounding rectangle of the resized element
 */
export interface BoundingRectangle {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height?: number;
  width?: number;
  scrollTop?: number;
  scrollLeft?: number;
  [key: string]: number | undefined;
}
