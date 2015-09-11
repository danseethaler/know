var color1 = '#3079D9',
	color2 = '#63B0F2',
	color3 = '#B3D92B',
	color4 = '#F2F2F2',
	color5 = '#404040';

function loadTimeline(json) {

	// All data includes all data from the API
	allData = json.filter(function (elem) {
		return elem.yearsOfLife;
	})

	// Initial data set to 2 generations back
	data = allData.filter(function (elem) {
		return elem.genNum === 2;
	})

	// Sorting the data by ascendancy number
	data.sort(function (a, b) {
		return a.ascendancyNumber - b.ascendancyNumber;
	})

	// Set margins for the chart
	var margin = {
		top: 20,
		bottom: 30,
		left: 150,
		right: 20
	};

	var h = 35 * data.length + margin.top + margin.bottom;
	var w = 800;

	height = h - margin.top - margin.bottom;
	width = w - margin.left - margin.right;

	// Create the time scale
	var timeScale = d3.time.scale()
		.range([0, width]);

	// Create the x scale
	var x = d3.scale.linear()
		.range([0, width])

	// Create the y scale
	var y = d3.scale.ordinal()
		.rangeRoundBands([0, height]);

	// Controls
	var controls = d3.select('.chart')
		.append('div')
		.attr('id', 'controls')

	var pagin = controls.append('nav')
		.attr('ng-show', 'ancestors')
		.append('ul')
		.classed('pagination controls', true)

	var pag1 = pagin.append('li')
		.append('a')
		.html('1')
		.style('cursor', 'pointer')
		.on('click', function () {
			data = allData.filter(function (elem) {
				return elem.genNum === 1;
			});
			plot.call(chart, {
				data: data,
				axis: {
					x: xAxis,
					y: yAxis
				},
				init: false
			})
		})

	var pag2 = pagin.append('li')
		.append('a')
		.html('2')
		.style('cursor', 'pointer')
		.on('click', function () {
			data = allData.filter(function (elem) {
				return elem.genNum === 2;
			});
			plot.call(chart, {
				data: data,
				axis: {
					x: xAxis,
					y: yAxis
				},
				init: false
			})
		})

	var pag3 = pagin.append('li')
		.append('a')
		.html('3')
		.style('cursor', 'pointer')
		.on('click', function () {
			data = allData.filter(function (elem) {
				return elem.genNum === 3;
			});
			plot.call(chart, {
				data: data,
				axis: {
					x: xAxis,
					y: yAxis
				},
				init: false
			})
		})

	var pag3 = pagin.append('li')
		.append('a')
		.html('4')
		.style('cursor', 'pointer')
		.on('click', function () {
			data = allData.filter(function (elem) {
				return elem.genNum === 4;
			});
			plot.call(chart, {
				data: data,
				axis: {
					x: xAxis,
					y: yAxis
				},
				init: false
			})
		})

	var svg = d3.select('.chart')
		.append('svg')
		.attr('id', 'chart')
		.attr('width', w)
		.attr('height', h)

	var chart = svg.append('g')
		.classed('display', true)
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var xAxis = d3.svg.axis()
		.scale(timeScale)
		.orient('bottom')

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left')
		.tickFormat(function (d) {
			var nameCount = d.split(' ');

			if (nameCount.length === 2) {
				var thisName = nameCount[0];
			} else {
				var thisName = nameCount[0] + ' ' + nameCount[nameCount.length - 2];
			}

			return thisName;
		})

	function drawAxis(params) {

		if (params.init) {
			// Draw the x axis
			this.append('g')
				.attr('transform', 'translate(0,' + height + ')')
				.classed('x axis', true)
				.call(xAxis);

			// Draw the y axis
			this.append('g')
				.classed('y axis', true)
				.call(yAxis);
		} else {

			this.selectAll('g.x.axis')
				.call(params.axis.x)
			this.selectAll('g.y.axis')
				.call(params.axis.y)
		}

	}

	plot.call(chart, {
		data: data,
		axis: {
			x: xAxis,
			y: yAxis
		},
		init: true
	})

	function plot(params) {

		if (data.length === 0) {
			return;
		}

		// Reset the height of the chart
		height = 35 * data.length;
		y.rangeRoundBands([0, height]);
		svg.attr('height', h)
		d3.select('g.x.axis')
			.attr('transform', 'translate(0,' + height + ')')

		var firstBD = d3.min(data, function (d) {
			return new Date(d.bDate);
		});

		var lastDD = d3.max(data, function (d) {
			return new Date(d.dDate);
		});

		timeScale.domain([firstBD, lastDD]);

		x.domain([0, d3.max(data, function (d) {
			return d.yearsOfLife;
		})])

		y.domain(data.map(function (person) {
			return person.name + ' ' + person.id;
		}))

		drawAxis.call(this, params);

		// Enter phase
		this.selectAll('.bar')
			.data(data)
			.enter()
			// .append('a')
			// .attr("xlink:href", function (d) {
			// 	return '/#' + d.id;
			// })
			.append("rect")
			.classed('bar', true);

		this.selectAll('.bar-label')
			.data(data)
			.enter()
			.append('text')
			.classed('bar-label', true)

		// Update phase
		this.selectAll('.bar')
			.attr('x', function (d) {
				return timeScale(new Date(d.bDate))
			})
			.attr('y', function (d, i) {
				return y(d.name + ' ' + d.id);
			})
			.attr('width', function (d) {
				return timeScale(new Date(d.dDate)) - timeScale(new Date(d.bDate));
			})
			.attr('height', function (d, i) {
				return y.rangeBand() - 1;
			})
			.attr('rx', '2px')
			.attr('ry', '2px')
			.style('fill', function (d) {
				if (d.gender === 'Male') {
					return '#168CD8';
				} else if (d.gender === 'Female') {
					return '#E24C2A';
				}
			});

		this.selectAll('.bar-label')
			.attr('x', function (d, i) {
				return (timeScale(new Date(d.dDate)) - timeScale(new Date(d.bDate))) / 2 + timeScale(new Date(d.bDate));
			})
			.attr('dx', '35')
			.attr('y', function (d, i) {
				return y(d.name + ' ' + d.id);
			})
			.attr('dy', function (d, i) {
				return y.rangeBand() / 1.5
			})
			.text(function (d) {
				return d.birthDate.split(' ').pop() + ' - ' + d.deathDate.split(' ').pop();
			})
			// .style("pointer-events", "none")

		// Exit phase
		this.selectAll('.bar')
			.data(params.data)
			.exit()
			.remove();

		// Enter phase
		this.selectAll('.bar-label')
			.data(params.data)
			.exit()
			.remove()

	}
}
