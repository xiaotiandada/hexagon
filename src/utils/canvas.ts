/* eslint-disable no-unused-vars */
import {HexGrid, Layout, Hexagon, Text, GridGenerator, HexUtils, Hex} from 'react-hexgrid';

export function drawGrid(width: number, height: number): any[] {
	const generator = GridGenerator.getGenerator('hexagon');
	// eslint-disable-next-line no-useless-call
	const hexagons = generator.apply(null, [4]);
	console.log('hexagons', hexagons);

	return hexagons;
}
