/* eslint-disable no-unused-vars */
import React, {useEffect, useRef, useState} from 'react';
import {useWasm} from 'react-wasm';
import {Stage, Layer, Rect, Text, Line, RegularPolygon, Group} from 'react-konva';
import Konva from 'konva';
import {drawGrid} from './utils';
import {geoToH3, kRing, polyfill, h3SetToMultiPolygon} from 'h3-js';
import * as PIXI from 'pixi.js';
import * as Honeycomb from 'honeycomb-grid';

const ExampleComponent = (): any => {
	const {
		loading,
		error,
		data,
	} = useWasm({
		url: '/build/debug.wasm',
	});

	if (loading) {
		return 'Loading...';
	}

	if (error) {
		return 'An error has occurred';
	}

	const {module, instance} = data;
	console.log('module', module);
	console.log('data', data);
	return <div>1 + 2 = {instance.exports.add(1, 2)}</div>;
};

function App() {
	const canvasContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (canvasContainerRef.current) {
			const app = new PIXI.Application({transparent: true});
			const graphics = new PIXI.Graphics();

			const Hex = Honeycomb.extendHex({size: 50});
			const Grid = Honeycomb.defineGrid(Hex);

			canvasContainerRef.current.appendChild(app.view);
			// Set a line style of 1px wide and color #999
			graphics.lineStyle(1, 0x999999);

			// Render 10,000 hexes
			Grid.hexagon({
				radius: 2,
				center: [5, 5],
			}).forEach(hex => {
				const point = hex.toPoint();
				// Add the hex's position to each of its corner points
				const corners = hex.corners().map(corner => corner.add(point));
				// Separate the first from the other corners
				const [firstCorner, ...otherCorners] = corners;

				// Move the "pen" to the first corner
				graphics.moveTo(firstCorner.x, firstCorner.y);
				// Draw lines to the other corners
				otherCorners.forEach(({x, y}) => graphics.lineTo(x, y));
				// Finish at the first corner
				graphics.lineTo(firstCorner.x, firstCorner.y);

				app.stage.addChild(graphics);
			});
		}
	}, []);
	return (
		<>
			<div ref={canvasContainerRef}></div>
		</>
	);
}

export default App;
