/* eslint-disable no-unused-vars */
import React, {useEffect, useRef, useState, useCallback} from 'react';
import {useWasm} from 'react-wasm';
import {drawGrid} from './utils';
import {geoToH3, kRing, polyfill, h3SetToMultiPolygon} from 'h3-js';
import * as PIXI from 'pixi.js';
import {utils} from 'pixi.js';
import * as Honeycomb from 'honeycomb-grid';
import {Stage, Text, Container, Graphics, Sprite} from '@inlet/react-pixi';
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
	hexagonData: {
		point: { x: number, y: number },
		lineColorString: string,
		fillColorString: string,
		lineColorHex: number,
		fillColorHex: number,
	}
	texture?: PIXI.Texture;
	clicked?: boolean
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

const image1 = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png';
const image = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/coin.png';
const gooseIdle = PIXI.Texture.from('https://i.imgur.com/NUl2k9K.png');
const gooseHurt = PIXI.Texture.from('https://i.imgur.com/igFI3Ju.png');
const gooseAngry = PIXI.Texture.from('https://i.imgur.com/UWKnm2L.png');

const imageTexture = PIXI.Texture.from(image);
const hexagonTexture = PIXI.Texture.from('https://i.imgur.com/K2nQTWa.png');

const HexagonSprite = (): any => {
	const Hex = Honeycomb.extendHex({size: 50});
	const Grid = Honeycomb.defineGrid(Hex);
	const GridHexagon = Grid.hexagon({
		radius: 3,
		center: [0, 0],
	});
	return (
		<>
			{
				GridHexagon.map(hex => {
					const point = hex.toPoint();
					console.log('point', point);
					return (
						<Sprite
							interactive
							key={point.x + '_' + point.y}
							image={'https://i.imgur.com/K2nQTWa.png'}
							width={100}
							height={100}
							anchor={0.5}
							x={point.x}
							y={point.y}
							click={(event: PIXI.InteractionEvent) => {
								const sprite = event.currentTarget as Draggable;
								console.log('event', sprite);
								sprite.clicked = !sprite.clicked;
								sprite.texture = sprite.clicked ? gooseIdle : hexagonTexture;
							}}
						/>
					);
				})
			}
		</>
	);
};

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

			const colorRandomResult = uniqolor.random();
			const colorLineResult = {color: '#15a51b'};
			const colorFillResult = {color: '#05bf1d'};
			const lineColor = utils.string2hex(colorLineResult.color);
			const fillColor = utils.string2hex(colorFillResult.color);

			graphics.lineStyle(1, lineColor);
			graphics.beginFill(fillColor);
			const corners = hex.corners().map(corner => corner.add(point));
			graphics.drawPolygon(corners);
			graphics.hexagonData = {
				point,
				lineColorString: colorLineResult.color,
				fillColorString: colorFillResult.color,
				lineColorHex: lineColor,
				fillColorHex: fillColor,
			};
			// Graphics.click = function (event: any) {
			// 	console.log('event', event, this);

			// 	event.target.scale.x *= 1.25;
			// 	event.target.scale.y *= 1.25;
			// };
			graphics.endFill();
		});
	}, []);

	const handleGraphicsClick = (event: PIXI.InteractionEvent) => {
		const sprite = event.currentTarget as Draggable;
		const hexData = sprite.hexagonData;
		console.log('sprite', sprite);
		console.log('hexData', hexData);
	};

	return (
		<div>
			<Stage width={_width} height={_height} options={{backgroundAlpha: 0}}>
				<Container x={600} y={600}
					anchor={0.5}
					interactive
					buttonMode
					pointerdown={onDragStart}
					pointerup={onDragEnd}
					pointerupoutside={onDragEnd}
					pointermove={onDragMove}>
					<HexagonSprite />
				</Container>
			</Stage>
		</div>
	);
}

export default App;
