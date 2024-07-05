import * as d3 from 'd3';
import { Attributes } from 'graphology-types';
import { calcEuclideanDistance } from '../utils/math';
import { RouteNode } from './BuildingMap';

interface AnimationOptions {
  delay: number;
  duration: number;
}

const NODE_RADIUS = 2;
const NODE_ANIMATION_SPEED = 250;
const EDGE_ANIMATION_SPEED = 250;

export class Animation {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
  }

  public animatePathHighlight(pathNodes: (Attributes & RouteNode)[]) {
    const nodesByFloor = pathNodes.reduce((nodesGroups, node) => {
      if (!nodesGroups[node.floorId]) nodesGroups[node.floorId] = [];

      nodesGroups[node.floorId].push(node);
      return nodesGroups;
    }, {} as Record<string, (Attributes & RouteNode)[]>);

    for (const floorId of Object.keys(nodesByFloor)) {
      this.animateFloorPathHighlight(floorId, nodesByFloor[floorId]);
    }
  }

  private animateFloorPathHighlight(floorId: string, pathNodes: (Attributes & RouteNode)[]) {
    const pathSvgGroup = this.svg.select(`#${floorId}`).append('g').attr('id', 'path'); // maybe .enter()
    let offset = 0;
    const nodeAnimationDuration = NODE_RADIUS / NODE_ANIMATION_SPEED;

    for (const [index, node] of pathNodes.entries()) {
      if (this.isPathStart(index)) {
        this.drawSvgCircle(pathSvgGroup, node, {
          duration: nodeAnimationDuration,
          delay: offset,
        });
        offset += nodeAnimationDuration;
      }
      if (this.isPathEnd(index, pathNodes.length)) {
        this.drawSvgCircle(pathSvgGroup, node, {
          duration: nodeAnimationDuration,
          delay: offset,
        });
        break;
      }

      const sourceNode = pathNodes[index];
      const targetNode = pathNodes[index + 1];
      const edgeLength = calcEuclideanDistance(sourceNode.point, targetNode.point);
      const edgeAnimationDuration = edgeLength / EDGE_ANIMATION_SPEED;
      this.drawSvgLine(pathSvgGroup, sourceNode, targetNode, {
        duration: edgeAnimationDuration,
        delay: offset,
      });
      offset += edgeAnimationDuration;
    }
  }

  private isPathStart(index: number) {
    return index === 0;
  }

  private isPathEnd(index: number, totalNodes: number) {
    return index === totalNodes - 1;
  }

  private drawSvgCircle(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    node: RouteNode,
    { duration = 0, delay = 0 }: AnimationOptions
  ) {
    svg
      .append('circle')
      .attr('id', node.id)
      .attr('cx', node.point.x)
      .attr('cy', node.point.y)
      .attr('r', 0)
      .attr('class', 'highlighted-node')
      .transition()
      .delay(delay)
      .duration(duration)
      .attr('r', NODE_RADIUS);
  }

  private drawSvgLine(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    sourceNode: RouteNode,
    targetNode: RouteNode,
    { duration = 0, delay = 0 }: AnimationOptions
  ) {
    svg
      .append('line')
      .attr('id', `${sourceNode.id}-${targetNode.id}`)
      .attr('x1', sourceNode.point.x)
      .attr('y1', sourceNode.point.y)
      .attr('class', 'highlighted-edge')
      .transition()
      .duration(duration)
      .delay(delay)
      .attr('x2', targetNode.point.x)
      .attr('y2', targetNode.point.y);
  }

  public removePathHighlight() {
    this.svg.selectAll('#path').remove();
  }
}
