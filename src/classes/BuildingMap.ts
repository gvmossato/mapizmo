import Graph from 'graphology';
import dijkstra from 'graphology-shortest-path/dijkstra';
import { Point, calcEuclideanDistance, roundNumberTo } from '../utils/math';
import {
  decomposeSvgPolyline,
  getSvgCircleCenterCoordinates,
  getSvgLineCoordinates,
  replaceElementsIdWithAttributeValue,
} from '../utils/svg';

export interface RouteEdge {
  id: string;
  weight: number;
  nodes: [RouteNode, RouteNode];
  virtual?: boolean;
}

export interface RouteNode {
  id: string;
  point: Point;
  floorId: string;
  place?: Place;
  transition?: Transition;
}

export interface Place {
  id: string;
  point: Point;
  label?: string;
}

export interface Transition {
  id: string;
  point: Point;
}

const NODE_MAX_PRECISION = 2;

export class BuildingMap {
  private svg: SVGElement;
  public graph: Graph;
  public floorIds: string[];
  public placeNodes: (RouteNode & { place: Place })[];
  private transitionNodes: (RouteNode & { transition: Transition })[];

  constructor(svg: SVGElement) {
    this.svg = replaceElementsIdWithAttributeValue(svg, 'data-name');
    this.graph = new Graph();
    this.floorIds = [];
    this.placeNodes = [];
    this.transitionNodes = [];
  }

  public create() {
    const mapSvg = this.svg.querySelector('#map');

    if (!mapSvg) {
      throw new Error('#map group not found in SVG');
    }

    const floorSvgList = [...mapSvg.children].filter((child) =>
      ['ground', 'mezzanine'].includes(child.id)
    ) as SVGGElement[];
    console.log(floorSvgList);
    for (const floorSvg of floorSvgList) {
      this.floorIds.push(floorSvg.id);
      this.addRoutes(floorSvg);

      const places = this.createPlaces(floorSvg);
      const transitions = this.createTransitions(floorSvg);

      this.assignPlacesToNodes(floorSvg.id, places);
      this.assignTransitionsToNodes(floorSvg.id, transitions);
    }

    this.createVirtualEdgesBetweenTransitions();
    this.clearSvgAnnotations();
  }

  private addRoutes(floorSvg: SVGGElement) {
    const routesSvg: SVGGElement | null = floorSvg.querySelector('#routes');

    if (!routesSvg) {
      throw new Error(`#routes group not found in floor ${floorSvg.id}`);
    }

    const routeLines = this.getSvgRoutesLines(routesSvg);

    for (const svgLine of routeLines) {
      const { x1, y1, x2, y2 } = getSvgLineCoordinates(svgLine);

      const [node1, node2] = [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ].map((point) => this.createNode(floorSvg.id, point));

      for (const node of [node1, node2]) {
        if (!this.graph.hasNode(node.id)) this.graph.addNode(node.id, node);
      }

      const edge = this.createEdge(node1, node2);

      this.graph.addUndirectedEdgeWithKey(edge.id, edge.nodes[0].id, edge.nodes[1].id, {
        weight: edge.weight,
      });
    }
  }

  private createPlaces(floorSvg: SVGGElement): Place[] {
    const placesSvg: SVGGElement | null = floorSvg.querySelector('#places');

    if (!placesSvg) {
      throw new Error(`#places group not found in floor ${floorSvg.id}`);
    }

    const nodesCircles = [...placesSvg.querySelectorAll('circle')];
    return nodesCircles.map((svgCircle) => {
      const centerPoint = getSvgCircleCenterCoordinates(svgCircle);
      const { x, y } = this.restrictPointToNodePrecision(centerPoint);
      return {
        id: svgCircle.id,
        point: { x, y },
      };
    });
  }

  private createTransitions(floorSvg: SVGGElement): Place[] {
    const transitionsSvg: SVGGElement | null = floorSvg.querySelector('#transitions');

    if (!transitionsSvg) {
      throw new Error(`#places group not found in floor ${floorSvg.id}`);
    }

    const nodesCircles = [...transitionsSvg.querySelectorAll('circle')];
    return nodesCircles.map((svgCircle) => {
      const centerPoint = getSvgCircleCenterCoordinates(svgCircle);
      const { x, y } = this.restrictPointToNodePrecision(centerPoint);
      return {
        id: svgCircle.id,
        point: { x, y },
      };
    });
  }

  private assignPlacesToNodes(floorId: string, places: Place[]): void {
    const nodeIds = this.graph.nodes().filter((nodeId) => nodeId.startsWith(floorId));

    for (const place of places) {
      const nodesDistancesFromPlace = nodeIds.map((nodeId) => {
        const node = this.graph.getNodeAttributes(nodeId) as RouteNode;
        return {
          node,
          distance: calcEuclideanDistance(node.point, place.point),
        };
      });

      const { node: closestNode } = nodesDistancesFromPlace.reduce((closest, current) =>
        current.distance < closest.distance ? current : closest
      );

      if (closestNode.place) {
        throw new Error(
          `Impossible to assign place ${place.id} to node ${closestNode.id}. ` +
            `Place ${closestNode.place.id} already assigned to it.`
        );
      }

      this.graph.setNodeAttribute(closestNode.id, 'place', place);
      this.placeNodes.push(
        this.graph.getNodeAttributes(closestNode.id) as RouteNode & {
          place: Place;
        }
      );
    }
  }

  private assignTransitionsToNodes(floorId: string, transitions: Transition[]): void {
    const nodeIds = this.graph.nodes().filter((nodeId) => nodeId.startsWith(floorId));

    for (const transition of transitions) {
      const nodesDistancesTransition = nodeIds.map((nodeId) => {
        const node = this.graph.getNodeAttributes(nodeId) as RouteNode;
        return {
          node,
          distance: calcEuclideanDistance(node.point, transition.point),
        };
      });

      const { node: closestNode } = nodesDistancesTransition.reduce((closest, current) =>
        current.distance < closest.distance ? current : closest
      );

      if (closestNode.transition) {
        throw new Error(
          `Impossible to assign floor transition ${transition.id} to node ${closestNode.id}. ` +
            `Floor transition ${closestNode.transition.id} already assigned to it.`
        );
      }

      this.graph.setNodeAttribute(closestNode.id, 'transition', transition);
      this.transitionNodes.push(
        this.graph.getNodeAttributes(closestNode.id) as RouteNode & {
          transition: Transition;
        }
      );
    }
  }

  private getSvgRoutesLines(routesSvgGroup: SVGGElement): SVGLineElement[] {
    const polylineElements = [...routesSvgGroup.querySelectorAll('polyline')];
    const lineElements = [
      ...routesSvgGroup.querySelectorAll('line'),
      ...polylineElements.flatMap((element) => decomposeSvgPolyline(element)),
    ];
    console.log(lineElements);
    return lineElements;
  }

  private createNode(floorId: string, point: Point): RouteNode {
    const { x, y } = this.restrictPointToNodePrecision(point);
    return {
      id: `${floorId},${x},${y}`,
      point: { x, y },
      floorId,
    };
  }

  private restrictPointToNodePrecision({ x, y }: Point): Point {
    return {
      x: roundNumberTo(x, NODE_MAX_PRECISION),
      y: roundNumberTo(y, NODE_MAX_PRECISION),
    };
  }

  private createEdge(node1: RouteNode, node2: RouteNode): RouteEdge {
    return {
      id: `${node1.id}-${node2.id}`,
      weight: calcEuclideanDistance(node1.point, node2.point),
      nodes: [node1, node2],
    };
  }

  private createVirtualEdgesBetweenTransitions() {
    const transitionNodesByTransitionId = this.transitionNodes.reduce(
      (transitionNodesGroups, node) => {
        const transitionId = node.transition.id;

        if (!transitionNodesGroups[transitionId]) transitionNodesGroups[transitionId] = [];
        transitionNodesGroups[transitionId].push(node);

        return transitionNodesGroups;
      },
      {} as Record<string, RouteNode[]>
    );

    console.log('this.transitionNodes', this.transitionNodes);
    console.log('this.placeNodes', this.placeNodes);
    console.log('transitionNodesByTransitionId', transitionNodesByTransitionId);

    for (const transitionId in transitionNodesByTransitionId) {
      const transitionNodes = transitionNodesByTransitionId[transitionId];

      for (const [index, node] of transitionNodes.entries()) {
        const nextNode = transitionNodes[index + 1];

        if (!nextNode) break;

        const { id, nodes, ...edgeAttributes } = this.createVirtualEdge(node, nextNode);
        this.graph.addUndirectedEdgeWithKey(id, nodes[0].id, nodes[1].id, edgeAttributes);
      }
    }

    console.log('edges', this.graph.edges());
  }

  private createVirtualEdge(node1: RouteNode, node2: RouteNode): RouteEdge {
    return {
      id: `${node1.id}-${node2.id}`,
      weight: 0.0001, // Nodes are virtually the same point
      virtual: true,
      nodes: [node1, node2],
    };
  }

  private clearSvgAnnotations() {
    const elementIdsToClear = ['routes', 'places', 'transitions'];

    for (const elementId of elementIdsToClear) {
      const elements = this.svg.querySelectorAll(`#${elementId}`);
      for (const element of elements) element.remove();
    }
  }

  public findBestPath(sourceNodeId: string, targetNodeId?: string): string[] {
    if (!targetNodeId) return [sourceNodeId];

    console.log(this.graph);
    console.log(this.graph.nodes());
    console.log(sourceNodeId, targetNodeId);
    console.log('exported', this.graph.export());

    const shortestPath = dijkstra.bidirectional(this.graph, sourceNodeId, targetNodeId);

    console.log(shortestPath);

    if (!shortestPath) {
      throw new Error(`Impossible to find a path from ${sourceNodeId} to ${targetNodeId}`);
    }
    return shortestPath;
  }
}
