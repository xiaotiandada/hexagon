/* eslint-disable no-unused-vars */
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {useWasm} from 'react-wasm';
import * as PIXI from 'pixi.js';
import {utils, Texture} from 'pixi.js';
import * as Honeycomb from 'honeycomb-grid';
import {Stage, Text, Container, Graphics, Sprite} from '@inlet/react-pixi';
import uniqolor from 'uniqolor';
import {useSpring, animated} from 'react-spring';
import {random} from 'lodash';

let type = 'WebGL';
if (!PIXI.utils.isWebGLSupported()) {
	type = 'canvas';
}

PIXI.utils.sayHello(type);
(window as any).PIXI = PIXI;

const _width = document.body.clientWidth || document.documentElement.clientWidth || window.innerWidth;
const _height = document.body.clientHeight || document.documentElement.clientHeight || window.innerHeight;

const image1 = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png';
const image = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/coin.png';
const gooseIdle = PIXI.Texture.from('https://i.imgur.com/NUl2k9K.png');
const gooseHurt = PIXI.Texture.from('https://i.imgur.com/igFI3Ju.png');
const gooseAngry = PIXI.Texture.from('https://i.imgur.com/UWKnm2L.png');
const img = new Image();
img.src = '/public/tree.png';
const base = new PIXI.BaseTexture(img);
const texture = new PIXI.Texture(base);

const imageTexture = PIXI.Texture.from(image);
const hexagonTexture = PIXI.Texture.from('https://i.imgur.com/K2nQTWa.png');

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

interface GraphicsDraggable extends PIXI.Graphics {
	hexagonData: {
		point: { x: number, y: number },
		lineColorString: string,
		fillColorString: string,
		lineColorHex: number,
		fillColorHex: number,
		clicked?: boolean
	}
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

function App() {
	const Hex = Honeycomb.extendHex({size: 50});
	const Grid = Honeycomb.defineGrid(Hex);
	const GridHexagon = Grid.hexagon({
		radius: 6,
		center: [0, 0],
	});
	console.log('GridHexagon', GridHexagon);
	console.log('GridHexagon', GridHexagon.length);

	const [currentPoint, setCurrentPoint] = useState<Honeycomb.Point>();
	const [treePoint, setTreePoint] = useState<Honeycomb.Point[]>([]);

	const AnimatedSprite = animated(Sprite);
	const [spring, setSpring] = useSpring(() => ({
		x: 0,
		y: 0,
		config: {
			tension: 210,
			friction: 20,
			clamp: true,
			velocity: 1,
		},
		onStart: () => console.log('start'),
	}));

	const generateRandomTree = useCallback(() => {
		const trees = GridHexagon.filter(hex => {
			const point = hex.toPoint();
			return random(0, 5) < 1 && point.x !== 0 && point.y !== 0;
		});
		setTreePoint(trees.map(hex => hex.toPoint()));
	}, []);

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

	const handleGraphicsClick = (event: PIXI.InteractionEvent) => {
		const sprite = event.currentTarget as Draggable;
		const hexData = sprite.hexagonData;
		console.log('sprite', sprite);
		console.log('hexData', hexData);
	};

	const HexagonGraphics = (): any => {
		const draw = useCallback((graphics: PIXI.Graphics, hex: Honeycomb.Hex<{
			size: number;
		}>) => {
			const g = graphics as GraphicsDraggable;
			const point = hex.toPoint();
			// Console.log('point', point);

			const colorRandomResult = uniqolor.random();
			const colorLineResult = {color: '#15a51b'};
			const colorFillResult = {color: '#05bf1d'};
			const lineColor = utils.string2hex(colorLineResult.color);
			const fillColor = utils.string2hex(colorFillResult.color);

			g.lineStyle(1, lineColor);
			g.beginFill(fillColor);
			const corners = hex.corners().map(corner => corner.add(point));
			g.drawPolygon(corners as unknown as number[]);
			g.hexagonData = {
				point,
				lineColorString: colorLineResult.color,
				fillColorString: colorFillResult.color,
				lineColorHex: lineColor,
				fillColorHex: fillColor,
				clicked: false,
			};
			g.endFill();
		}, []);

		const drawHexagon = useCallback((graphics: PIXI.Graphics, hex: Honeycomb.Hex<{
			size: number;
		}>, colorData: { lineColor: string, fillColor: string }) => {
			const g = graphics as GraphicsDraggable;
			const point = hex.toPoint();

			const lineColor = utils.string2hex(colorData.lineColor);
			const fillColor = utils.string2hex(colorData.fillColor);
			g.clear();
			g.lineStyle(1, lineColor);
			g.beginFill(fillColor);
			const corners = hex.corners().map(corner => corner.add(point));
			g.drawPolygon(corners as unknown as number[]);
			g.endFill();
		}, []);

		return (
			<>
				{
					GridHexagon.map(hex => {
						const point = hex.toPoint();
						// Console.log('hex', hex);
						return (
							<Graphics
								interactive
								key={point.x + '_' + point.y}
								draw={(graphics: PIXI.Graphics) => draw(graphics, hex)}
								anchor={0.5}
								click={(event: PIXI.InteractionEvent) => {
									const g = event.currentTarget as GraphicsDraggable;
									console.log('event', g);

									if (g.hexagonData.clicked) {
										const colorData = {lineColor: '#15a51b', fillColor: '#05bf1d'};
										drawHexagon(g, hex, colorData);
									} else {
										const colorData = {lineColor: '#1fbc34', fillColor: '#18a72b'};
										drawHexagon(g, hex, colorData);
									}

									g.hexagonData.clicked = !g.hexagonData.clicked;

									setCurrentPoint(point);
									setSpring({x: point.x, y: point.y});
								}}
							/>
						);
					})
				}
			</>
		);
	};

	useEffect(() => {
		generateRandomTree();

		console.log('centerPoint Hex', GridHexagon);
		const hex = GridHexagon.find(i => i.x === 0 && i.y === 0) as any;
		console.log('hex', hex);
		const point = hex.toPoint();
		setCurrentPoint(point);
		setSpring({x: point.x, y: point.y});

		console.log('Grid', GridHexagon.lastIndexOf([0, 0]));
	}, []);

	return (
		<Stage
			width={_width}
			height={_height}
			options={{backgroundAlpha: 1, backgroundColor: utils.string2hex('#05bf1d')}}
			className="state">
			<Container
				x={_width / 2}
				y={_height / 2}
				// Interactive
				// buttonMode
				// pointerdown={onDragStart}
				// pointerup={onDragEnd}
				// pointerupoutside={onDragEnd}
				// pointermove={onDragMove}
				anchor={0.5}
			>
				<HexagonGraphics />
				{
					currentPoint
					&& <AnimatedSprite
						image="https://i.imgur.com/dQZjQGg.png"
						anchor={0}
						scale={0.2}
						x={spring.x}
						y={spring.y}
					/>
				}
				{
					treePoint.map(point => (
						<Container x={point.x} y={point.y} key={`${point.x}_${point.y}`}>
							<Sprite
								image="https://i.imgur.com/IWSaSwW.png"
								anchor={0.5}
								x={0}
								y={20}
							/>
							<Sprite
								image="https://i.imgur.com/IWSaSwW.png"
								anchor={0.5}
								x={50}
								y={20}
							/>
						</Container>
					))
				}

			</Container>
		</Stage>
	);
}

export default App;
