/* eslint-disable no-unused-vars */
import React, {useEffect, useRef, useState, useCallback} from 'react';
import {useWasm} from 'react-wasm';
import {drawGrid} from './utils';
import {geoToH3, kRing, polyfill, h3SetToMultiPolygon} from 'h3-js';
import * as PIXI from 'pixi.js';
import {utils} from 'pixi.js';
import * as Honeycomb from 'honeycomb-grid';
import {Stage, Text, Container, Graphics} from '@inlet/react-pixi';
import {useApp} from '@inlet/react-pixi';
import uniqolor from 'uniqolor';

let type = 'WebGL';
if (!PIXI.utils.isWebGLSupported()) {
	type = 'canvas';
}

PIXI.utils.sayHello(type);
(window as any).PIXI = PIXI;

const _width = document.body.clientWidth || document.documentElement.clientWidth || window.innerWidth;
const _height = document.body.clientHeight || document.documentElement.clientHeight || window.innerHeight;

interface Draggable extends PIXI.DisplayObject {
	data: PIXI.InteractionData | null;
	dragging: boolean;
}

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

const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundAlpha: 0,
	antialias: true,
	resolution: 1,
});
function App() {
	const onDragStart = (event: PIXI.InteractionEvent) => {
		const sprite = event.currentTarget as Draggable;

		sprite.alpha = 0.8;
		sprite.data = event.data;
		sprite.dragging = true;
	};

	const onDragEnd = (event: PIXI.InteractionEvent) => {
		const sprite = event.currentTarget as Draggable;
		sprite.alpha = 1;
		sprite.dragging = false;
		sprite.data = null;
	};

	const onDragMove = (event: PIXI.InteractionEvent) => {
		const sprite = event.currentTarget as Draggable;

		if (sprite.dragging) {
			// Console.log('sss', sprite.data);
			// console.log('sss', sprite.data?.getLocalPosition(sprite));
			const newPosition = sprite.data!.getLocalPosition(sprite.parent);
			sprite.x = newPosition.x;
			sprite.y = newPosition.y;
		}
	};

	const draw = useCallback(graphics => {
		const Hex = Honeycomb.extendHex({size: 50});
		const Grid = Honeycomb.defineGrid(Hex);

		// Render 10,000 hexes
		Grid.hexagon({
			radius: 2,
			center: [0, 0],
		}).forEach(hex => {
			const point = hex.toPoint();
			console.log('point', point);
			// Add the hex's position to each of its corner points
			// const corners = hex.corners().map(corner => corner.add(point));
			// // Separate the first from the other corners
			// const [firstCorner, ...otherCorners] = corners;

			// // Move the "pen" to the first corner
			// graphics.moveTo(firstCorner.x, firstCorner.y);
			// // Draw lines to the other corners
			// otherCorners.forEach(({x, y}) => {
			// 	graphics.beginFill(utils.string2hex('#4caf50'));
			// 	graphics.lineTo(x, y);
			// });
			// // Finish at the first corner
			// graphics.lineTo(firstCorner.x, firstCorner.y);

			graphics.lineStyle(1, utils.string2hex('#265128'));
			const colorResult = uniqolor.random();
			graphics.beginFill(utils.string2hex(colorResult.color));
			const corners = hex.corners().map(corner => corner.add(point));
			graphics.drawPolygon(corners);
			graphics.custommmmmm = point;
			graphics.endFill();
		});
	}, []);

	return (
		<div>
			<Stage width={_width} height={_height} options={{backgroundAlpha: 0}}>
				<Container
					anchor={0.5}
					// X={10}
					// y={10}
					interactive
					buttonMode
					pointerdown={onDragStart}
					pointerup={onDragEnd}
					pointerupoutside={onDragEnd}
					pointermove={onDragMove}>
					<Graphics draw={draw}
						interactive
						click={(event: PIXI.InteractionEvent) => {
							console.log('xxx', event);
							console.log('event.currentTarget', event.currentTarget);
							console.log('event.target', event.target);
						}}
					/>
				</Container>
				<Text
					text="Hello World"
					x={100}
					y={100}
					anchor={0.5}
					interactive
					buttonMode
					pointerdown={onDragStart}
					pointerup={onDragEnd}
					pointerupoutside={onDragEnd}
					pointermove={onDragMove}
				/>
			</Stage>
		</div>
	);
}

export default App;
