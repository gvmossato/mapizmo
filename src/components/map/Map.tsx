'use client';

import { Animation } from '@/classes/Animation';
import { BuildingMap, RouteNode } from '@/classes/BuildingMap';
import Grid from '@mui/material/Unstable_Grid2';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

interface MapProperties {
  buildingMapSetter: React.Dispatch<React.SetStateAction<BuildingMap | undefined>>;
  pathNodes: RouteNode[];
  currentFloor?: string;
}

export default function Map({
  buildingMapSetter: setBuildingMap,
  pathNodes,
  currentFloor,
}: MapProperties) {
  const [animation, setAnimation] = useState<Animation | null>();
  const svgReference = useRef<SVGSVGElement>(null);

  const isSvgReferenceMounted = (
    currentReference: SVGSVGElement | null
  ): currentReference is SVGSVGElement => {
    return currentReference instanceof SVGSVGElement;
  };

  const isSvgAppendedToReference = (currentReference: SVGSVGElement): boolean => {
    return currentReference.hasChildNodes();
  };

  useEffect(() => {
    const appendSvgToReference = (data: XMLDocument) => {
      const shouldAppendSvg =
        isSvgReferenceMounted(svgReference.current) &&
        !isSvgAppendedToReference(svgReference.current);
      if (!shouldAppendSvg) return;

      svgReference.current.append(data.documentElement);
      d3.select(svgReference.current).call(svgZoomAndPanBehavior);
      setAnimation(new Animation(d3.select(svgReference.current)));
    };

    const svgZoomAndPanBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [1500, 840],
      ])
      .on('zoom', (event) => {
        const zoomContainer = d3.select(svgReference.current).select('#map');
        zoomContainer.attr('transform', event.transform);
      });

    const loadGraph = () => {
      if (!isSvgReferenceMounted(svgReference.current)) return;

      const buildingMap = new BuildingMap(svgReference.current);
      buildingMap.create();

      setBuildingMap(buildingMap);
      // draw debug nodes
      // buildingMap.graph.forEachNode((node) => {
      //   const { x, y } = buildingMap.graph.getNodeAttributes(node).point;
      //   d3.select(svgReference.current)
      //     .select('#map')
      //     .append('circle')
      //     .attr('cx', x)
      //     .attr('cy', y)
      //     .attr('r', 1)
      //     .attr('fill', 'purple');
      // });
      // // draw debug edges
      // buildingMap.graph.forEachEdge((edge) => {
      //   const [node1, node2] = edge.split('-');
      //   const { x: x1, y: y1 } = buildingMap.graph.getNodeAttributes(node1).point;
      //   const { x: x2, y: y2 } = buildingMap.graph.getNodeAttributes(node2).point;
      //   d3.select(svgReference.current)
      //     .select('#map')
      //     .append('line')
      //     .attr('x1', x1)
      //     .attr('y1', y1)
      //     .attr('x2', x2)
      //     .attr('y2', y2)
      //     .attr('stroke', 'purple');
      // });
    };

    d3.xml('./map.svg')
      .then((data) => appendSvgToReference(data))
      .then(() => loadGraph())
      .catch((error) => console.error('Failed to load SVG:', error));
  }, [setBuildingMap]);

  useEffect(() => {
    const handlePathUpdate = () => {
      if (!isSvgReferenceMounted(svgReference.current)) return;
      if (!animation) return;

      animation.removePathHighlight();
      animation.animatePathHighlight(pathNodes);
    };

    handlePathUpdate();
  }, [animation, pathNodes]);

  useEffect(() => {
    if (!isSvgReferenceMounted(svgReference.current)) return;

    const setFloorVisibility = (floorId?: string) => {
      if (!svgReference.current) return;
      const svg = d3.select(svgReference.current);
      svg.selectAll('#mezzanine').style('display', 'none'); // Hide all floors
      svg.selectAll('#ground').style('display', 'none'); // Hide all floors
      if (floorId) {
        svg.select(`#${floorId}`).style('display', ''); // Display only the selected floor
      }
    };

    setFloorVisibility(currentFloor);
  }, [currentFloor]); // React to changes in currentFloor

  return (
    <Grid container>
      <svg ref={svgReference} className='map-box' width='80vw' height='85vh' />
    </Grid>
  );
}
