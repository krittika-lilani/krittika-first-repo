// This script creates a D3.js breakfast timeline by loading data from a CSV file

(function() {
  // Set up the SVG container
  const margin = { top: 40, right: 40, bottom: 60, left: 150 };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Shared chart colors
  const chartTextColor = '#B86F45';
  const gridColor = '#E7A77C';

  // Categories used by both the color scale and the legend
  const categories = [
    'Water',
    'Cold prep',
    'Interruption',
    'Eggs',
    'Heat',
    'Bread',
    'Assembly',
    'Eating'
  ];

  // Assign one color to each breakfast category
  const colorScale = d3.scaleOrdinal()
    .domain(categories)
    .range([
      '#A8DADC', // Water
      '#E8DDC9', // Cold prep
      '#9382BA', // Interruption
      '#F2C14E', // Eggs
      '#E46855', // Heat
      '#B97850', // Bread
      '#F18FB5', // Assembly
      '#9BD86F'  // Eating
    ]);

  // Map every activity to its icon
  const iconMap = {
    'Boil the water': 'data-visualization/icons/water.png',
    'Mix garlic yogurt': 'data-visualization/icons/garlic.png',
    'Get distracted': 'data-visualization/icons/bird.png',
    'Poach the first egg': 'data-visualization/icons/egg.png',
    'Poach the second egg': 'data-visualization/icons/egg.png',
    'Melt butter and chili': 'data-visualization/icons/chili.png',
    'Toast the bread': 'data-visualization/icons/bread.png',
    'Assemble the plate': 'data-visualization/icons/plate.png',
    'Photograph the breakfast': 'data-visualization/icons/iphone.png',
    'Break the yolk': 'data-visualization/icons/egg.png',
    'Eat before it gets cold': 'data-visualization/icons/spoon.png'
  };

  const iconSize = 22;
  const iconOffset = 4;

  // Create the SVG
  const svg = d3.select('#d3-container-3')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Load the CSV data
  d3.csv('data-visualization/events.csv').then(function(data) {
    console.log('CSV data loaded:', data);

    // Convert the start and end values into numbers
    data.forEach(function(d) {
      d.start = parseInt(d.start);
      d.end = parseInt(d.end);
    });

    // Create the horizontal time scale
    // The extra minute leaves room for the last icon.
    const timeScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.start),
        d3.max(data, d => d.end) + 1
      ])
      .range([0, width]);

    // Create one vertical row for each activity
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height])
      .padding(0.2);

    // Create the minutes axis
    // tickSizeOuter(0) removes the tall line on the right edge.
    const xAxis = d3.axisBottom(timeScale)
      .tickFormat(d => d)
      .tickSizeInner(-height)
      .tickSizeOuter(0);

    // Add the axis
    const xAxisGroup = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    // Style the internal dotted grid lines
    xAxisGroup.selectAll('.tick line')
      .attr('stroke', gridColor)
      .attr('stroke-opacity', 0.65)
      .attr('stroke-dasharray', '3,4');

    // Style the horizontal axis line
    xAxisGroup.select('.domain')
      .attr('stroke', chartTextColor)
      .attr('stroke-width', 1.5);

    // Style the minute numbers
    xAxisGroup.selectAll('.tick text')
      .style('font-size', '11px')
      .style('font-weight', '400')
      .style('fill', chartTextColor);

      // Add a strong vertical y-axis line at minute 0
svg.append('line')
  .attr('x1', 0)
  .attr('x2', 0)
  .attr('y1', 0)
  .attr('y2', height)
  .attr('stroke', chartTextColor)
  .attr('stroke-width', 1.5);

    // Add the minutes title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '400')
      .style('fill', chartTextColor)
      .text('Minutes');

    // Add the activity bars
    svg.selectAll('.event-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'event-bar')
      .attr('x', d => timeScale(d.start))
      .attr('y', d => yScale(d.name))
      .attr('width', d => timeScale(d.end) - timeScale(d.start))
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0.9)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('stroke-width', 2);

        showTooltip(event, d);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.9)
          .attr('stroke-width', 1);

        hideTooltip();
      });

    // Add the activity labels on the left
    svg.selectAll('.event-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'event-label')
      .attr('x', -10)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '400')
      .style('fill', chartTextColor)
      .style('pointer-events', 'none')
      .text(d => d.name);

    // Add white backgrounds behind all icons except the spoon
    const iconBackgroundData = data.filter(
      d => d.name !== 'Eat before it gets cold'
    );

    svg.selectAll('.icon-bg')
      .data(iconBackgroundData)
      .enter()
      .append('circle')
      .attr('class', 'icon-bg')
      .attr('cx', d => {
        const xPosition =
          timeScale(d.end) + iconOffset + iconSize / 2;

        return Math.min(
          xPosition,
          width - iconSize / 2 - 2
        );
      })
      .attr(
        'cy',
        d => yScale(d.name) + yScale.bandwidth() / 2
      )
      .attr('r', iconSize / 2 + 4)
      .attr('fill', 'rgba(255, 255, 255, 0.75)');

    // Add the icons
    svg.selectAll('.event-icon')
      .data(data)
      .enter()
      .append('image')
      .attr('class', 'event-icon')
      .attr('href', d => iconMap[d.name])
      .attr('x', d => {
        const xPosition = timeScale(d.end) + iconOffset;

        return Math.min(
          xPosition,
          width - iconSize - 2
        );
      })
      .attr(
        'y',
        d =>
          yScale(d.name) +
          (yScale.bandwidth() - iconSize) / 2
      )
      .attr('width', iconSize)
      .attr('height', iconSize)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add the legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 165}, 18)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(categories)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 18})`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', d => colorScale(d))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 9)
      .attr('dominant-baseline', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '400')
      .style('fill', chartTextColor)
      .text(d => d);

    // Add the title above the chart
    svg.append('text')
      .attr('x', 10)
      .attr('y', -12)
      .style('font-size', '11px')
      .style('font-weight', '400')
      .style('font-style', 'italic')
      .style('fill', chartTextColor)
      .text('Making my 20 min breakfast');

    console.log('D3.js breakfast timeline loaded successfully!');
  }).catch(function(error) {
    console.error('Error loading CSV file:', error);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2 - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#ff4757')
      .text('Error loading CSV file. Please check the file path.');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2 + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#ff4757')
      .text('Are you running a local server?');
  });

  // Create the hover tooltip
  const tooltip = d3.select('#d3-container-3')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.82)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '10px')
    .style('font-size', '12px')
    .style('line-height', '1.4')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('transition', 'opacity 0.2s');

  function showTooltip(event, d) {
    const duration = d.end - d.start;

    tooltip.transition()
      .duration(200)
      .style('opacity', 1);

    tooltip.html(`
      <strong>${d.name}</strong><br>
      Minutes: ${d.start}–${d.end}<br>
      Duration: ${duration} minutes<br>
      Category: ${d.category}
    `)
      .style('left', `${event.pageX + 12}px`)
      .style('top', `${event.pageY - 10}px`);
  }

  function hideTooltip() {
    tooltip.transition()
      .duration(200)
      .style('opacity', 0);
  }
})();