import { BoundingRectangle } from './bounding-rectangle.interface';
import { Edges } from './edges.interface';

/**
 * The `$event` object that is passed to the resize events
 */
export interface ResizeEvent {
  rectangle: BoundingRectangle;
  edges: Edges;
}
