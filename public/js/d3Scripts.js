var color1 = '#3079D9',
	color2 = '#63B0F2',
	color3 = '#B3D92B',
	color4 = '#F2F2F2',
	color5 = '#404040';

function loadTimeline(json) {

	data = json.filter(function (elem) {
		return elem.yearsOfLife;
	})
	data.sort(function (a, b) {
		return b.ascendancyNumber - a.ascendancyNumber;
	})

	var firstBD = d3.min(data, function (d) {
		return new Date(d.bDate);
	});
	var lastDD = d3.max(data, function (d) {
		return new Date(d.dDate);
	});

	var h = 35 * data.length;
	var w = 800;

	var margin = {
		top: 20,
		bottom: 30,
		left: 150,
		right: 20
	};

	height = h - margin.top - margin.bottom;
	width = w - margin.left - margin.right;

	var timeScale = d3.time.scale()
		.domain([firstBD, lastDD])
		.range([0, width]);

	var x = d3.scale.linear()
		.domain([0, d3.max(data, function (d) {
			return d.yearsOfLife;
		})])
		.range([0, width])

	var y = d3.scale.ordinal()
		.domain(data.map(function (person) {
			return person.name + ' ' + person.id;
		}))
		.rangeRoundBands([0, height]);

	var svg = d3.select('.chart')
		.append('svg')
		.attr('id', 'chart')
		.attr('width', w)
		.attr('height', h)

	var tooltip = d3.select('.chart')
		.append('g')
		.style('position', 'absolute')
		.style('padding', '0 10px')
		.style('background', 'white')
		.style('opacity', 0);

	var chart = svg.append('g')
		.classed('display', true)
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var controls = d3.select('.controls');

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

	plot.call(chart, {
		data: data
	})

	function plot(params) {

		// Enter phase
		this.selectAll('.bar')
			.data(data)
			.enter()
			.append('a')
			.attr("xlink:href", function (d) {
				return '/#' + d.id;
			})
			.append("rect")
			.classed('bar', true)
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
					return '#31708f';
				} else if (d.gender === 'Female') {
					return '#a94442';
				}
			});

		// Enter phase
		this.selectAll('.bar-label')
			.data(data)
			.enter()
			.append('text')
			.classed('bar-label', true)
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
			.style("pointer-events", "none")

		this.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.classed('x axis', true)
			.call(xAxis);
		this.append('g')
			// .attr('transform', 'translate(0,' + height + ')')
			.classed('y axis', true)
			.call(yAxis);
	}
}
