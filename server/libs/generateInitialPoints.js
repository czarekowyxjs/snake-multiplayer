import generatePoint from './generatePoint';

export default () => {
	const maxPoints = 800;
	let points = [];
	let point;
	for(let i = 0;i < maxPoints;++i) {
		point = generatePoint(points);
		points[i] = point;
	}

	return points;
};