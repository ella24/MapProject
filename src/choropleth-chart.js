import * as d3 from 'd3'

let margin = { top: 10, left: 10, right: 10, bottom: 10 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#choropleth')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var projection = d3
  .geoMercator()
  .scale(width / 2 / Math.PI)
  .translate([width / 2, height / 2])
  .precision(10)

var path = d3.geoPath().projection(projection)

var data = d3.map()

var color_domain = [1, 5, 10, 50, 100]

var text_color_domain = [0, 1, 5, 10, 50, 100]

var legend_labels = ['0', '1', '5', '10', '50', '100+']

var colorScale = d3
  .scaleThreshold()
  .domain(color_domain)
  .range(['#ffcb40', '#ffba00', '#ff7d73', '#ff4e40', '#ff1300', '#820509'])

var div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)

var promises = [
  d3.json('https://enjalot.github.io/wwsd/data/world/world-110m.geojson'),
  d3.csv(require('./data/selfiedeathsfinal.csv'), function(d) {
    data.set(d.code, +d.Casualties, d.Country)
  })
]

Promise.all(promises).then(ready)

function ready([json]) {
  console.log(json.features)

  var country = svg
    .selectAll('g.country')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'country')

  country
    .append('circle')
    .attr('r', 2)
    .style('fill', '#fee6ce')
    // .style('opacity', 0.75)
    .append('text')
    .attr('x', 5)
    .text(function(d) {
      return d.Country
    })

  svg
    .append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(json.features)
    .enter()
    .append('path')
    .attr('fill', function(d) {
      if (d) {
        return colorScale((d.Casualties = data.get(d.id)))
      } else {
        return '#ccc'
      }
    })
    .attr('d', path)
    .attr('stroke', 'white')
    .attr('stroke-width', 0.3)
} // <-- End of Choropleth drawing

// Adding legend for Choropleth

var legend = svg
  .selectAll('g.legend')
  .data(text_color_domain)
  .enter()
  .append('g')
  .attr('class', 'legend')

var ls_w = 20

var ls_h = 20

legend
  .append('rect')
  .attr('x', 20)
  .attr('y', function(d, i) {
    return height - i * ls_h - 2 * ls_h
  })
  .attr('width', ls_w)
  .attr('height', ls_h)
  .style('fill', function(d, i) {
    return colorScale(d)
  })
  .style('opacity', 0.8)

legend
  .append('text')
  .attr('x', 50)
  .attr('y', function(d, i) {
    return height - i * ls_h - ls_h - 4
  })
  .style('fill', '#636363')
  .text(function(d, i) {
    return legend_labels[i]
  })
