/* eslint-disable no-unused-vars */
import React, {useEffect, useState} from 'react';
import {useWasm} from 'react-wasm';
import {Stage, Layer, Rect, Text, Line, RegularPolygon, Group} from 'react-konva';
import Konva from 'konva';
import {drawGrid} from './utils';

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

const cubeToAxial = (x: number, y: number, z: number): any => ({
	x,
	y: z,
});

function App() {
	const [points, setPoints] = useState<any[]>([]);

	useEffect(() => {
		setPoints(drawGrid(50, 50));
	}, []);
	return (
		<>
			<Stage width={window.innerWidth} height={window.innerHeight}>
				<Layer>
					<Group draggable={true}>
						{
							points.map((point, index) => {
								const {x, y} = cubeToAxial(point.q, point.s, point.r);
								return (
									<Group
										key={index}
										x={x * 100}
										y={y * 100}
									>
										<RegularPolygon
											sides={6}
											radius={50}
											stroke={'#333'}
											rotation={0}
										>
										</RegularPolygon>
										<Text text={`${point.q},${point.s},${point.r}`}></Text>
									</Group>
								);
							})
						}
					</Group>
				</Layer>
			</Stage>
		</>
	);
}

export default App;
