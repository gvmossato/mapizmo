import Decimal from 'decimal.js';

export interface Point {
  x: number;
  y: number;
}

export const roundNumberTo = (number: number, decimalPlaces: number) => {
  return new Decimal(number).toDP(decimalPlaces).toNumber();
};

export const calcEuclideanDistance = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): number => {
  const xDiff = new Decimal(x2).sub(x1);
  const yDiff = new Decimal(y2).sub(y1);
  return Decimal.sqrt(xDiff.pow(2).add(yDiff.pow(2))).toNumber();
};
