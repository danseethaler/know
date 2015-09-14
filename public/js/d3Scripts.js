var color1 = '#3079D9',
	color2 = '#63B0F2',
	color3 = '#B3D92B',
	color4 = '#F2F2F2',
	color5 = '#404040';

function loadTimeline(json) {

	// All data includes all data from the API
	allData = json.filter(function (elem) {
		if (elem.yearsOfLife || (elem.bDate && elem.lifespan.search('Living') >= 0)) {
			return true;
		}else {
			return false;
		}
	})

	if (allData.filter(function(elem){
		return elem.genNum === 1;
	}).length > 0 ){
		var genBack = 1;
	}else {
		var genBack = 2
	}

	// Initial data set to 2 generations back
	data = allData.filter(function (elem) {
		return elem.genNum === genBack;
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

	// Create the pagination elements
	for (var i = 1; i <= 6; i++) {
		// Check to see if this generation has any data
		if (allData.filter(function (elem) {
				return elem.genNum === i;
			}).length > 0) {
			// If there is data then create a li tag with
			// the gen number and add an on-click event
			(function (int) {
				pagin.append('li')
					.append('a')
					.html(int)
					.style('cursor', 'pointer')
					.on('click', function () {
						data = allData.filter(function (elem) {
							return elem.genNum === int;
						});
						plot.call(chart, {
							data: data,
							axis: {
								x: xAxis,
								y: yAxis
							},
							init: false
						})
					});
			}(i))
		}
	}

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

		// If there is no data then don't redraw the chart
		if (data.length === 0) {
			return;
		}

		// Find the smallest date in the data set
		var firstBD = d3.min(data, function (d) {
			return new Date(d.bDate);
		});

		// Find the largest date in the data set
		var lastDD = d3.max(data, function (d) {
			if (d.lifespan && d.lifespan.search('Living') >= 0) {
				return new Date();
			}
			return new Date(d.dDate);
		});

		// Reset the height of the chart
		height = 35 * data.length;
		y.rangeRoundBands([0, height]);
		svg.attr('height', height + margin.top + margin.bottom)
		d3.select('g.x.axis')
			.attr('transform', 'translate(0,' + height + ')')
		timeScale.domain([firstBD, lastDD]);

		// Redefine the domain of the x scale
		x.domain([0, d3.max(data, function (d) {
			return d.yearsOfLife;
		})])

		// Redefine the domain of the y scale
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
				// Add a final date for living ancestors
				if (d.living) {
					d.dDate = new Date().toString();
				}
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
				if (d.living) {
					d.dDate = new Date().toString();
				}
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
				if (d.living) {
					d.deathDate = 'Living';
				}
				return d.birthDate.split(' ').pop() + ' - ' + d.deathDate.split(' ').pop();
			})
			// .style("pointer-events", "none")

		// Exit phase
		this.selectAll('.bar')
			.data(params.data)
			.exit()
			.remove();

		this.selectAll('.bar-label')
			.data(params.data)
			.exit()
			.remove()

	}
}
