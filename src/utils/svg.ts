import { Point } from './math';

export const replaceElementsIdWithAttributeValue = <T extends Element>(
  elementsWrapper: T,
  sourceAttributeName: string,
  { deleteSourceAttribute = true } = {}
): T => {
  const affectedElements = elementsWrapper.querySelectorAll(`[${sourceAttributeName}]`);

  for (const element of affectedElements) {
    const attributeValue = element.getAttribute(sourceAttributeName);
    if (!attributeValue) continue;

    element.id = attributeValue;

    if (deleteSourceAttribute) element.removeAttribute(sourceAttributeName);
  }

  return elementsWrapper;
};

export const getSvgCircleCenterCoordinates = ({ cx, cy }: SVGCircleElement): Point => {
  return { x: cx.baseVal.value, y: cy.baseVal.value };
};

export const decomposeSvgPolyline = (polyline: SVGPolylineElement): SVGLineElement[] => {
  const points = getSvgPolylinePoints(polyline);
  const lines: SVGLineElement[] = [];

  for (const [index, point] of points.entries()) {
    if (index === points.length - 1) break;
    lines.push(createSvgLineElement(point, points[index + 1]));
  }
  return lines;
};

const getSvgPolylinePoints = (polyline: SVGPolylineElement): Point[] => {
  return [...polyline.points].map(({ x, y }) => ({ x, y }));
};

const createSvgLineElement = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): SVGLineElement => {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1.toString());
  line.setAttribute('y1', y1.toString());
  line.setAttribute('x2', x2.toString());
  line.setAttribute('y2', y2.toString());
  return line;
};

export const getSvgLineCoordinates = ({
  x1,
  y1,
  x2,
  y2,
}: SVGLineElement): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} => {
  return {
    x1: x1.baseVal.value,
    y1: y1.baseVal.value,
    x2: x2.baseVal.value,
    y2: y2.baseVal.value,
  };
};
