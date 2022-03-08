import { StyleType } from '../constants/style.type';

export interface ITypeStyle {
  type: StyleType;
  color?: string;
  width?: number;
  lineDash?: number[];
  lineDashOffset?: number;
}
