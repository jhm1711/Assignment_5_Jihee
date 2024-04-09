import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 10, right: 30, bottom: 60, left: 70 };

// parsing & formatting
const parseTime = d3.timeParse("%Y");
const formatXaxis = d3.timeFormat("%Y");

// svg scale
const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// axis
const xAxis = d3
  .axisBottom(xScale)
  .ticks(9)
  .tickSizeOuter(0)
  .tickFormat((d) => formatXaxis(d));
const yAxis = d3
  .axisLeft(yScale)
  .ticks(9)
  .tickSize(-width + margin.right + margin.left);

// "Average" line
const line = d3
  .line()
  .curve(d3.curveCardinal)
  .x((d) => xScale(d.date_parsed))
  .y((d) => yScale(d.avg));

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
//  data (d3.csv)
let data = [];
let lastValue, circle;
let path;

d3.json(
  "https://raw.githubusercontent.com/helloeujin/d3-basic-linechart-json/main/public/data/global_temp_data.json"
).then((raw_data) => {
  //   console.log(raw_data);

  const data = raw_data.map((d) => {
    // console.log(d);
    d.date_parsed = parseTime(d.year);
    return d;
  });

  //   scale
  xScale.domain(d3.extent(data, (d) => d.date_parsed));

  const yValues = data.reduce((acc, d) => {
    acc.push(d.lower_bound, d.upper_bound);
    return acc;
  }, []);

  const [minY, maxY] = d3.extent(yValues);
  yScale.domain([minY, maxY + 0.2]);

  //axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  // Rect
  function drawRectangles(data) {
    svg
      .selectAll(".rectangle")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "rectangles")
      .attr("x", (d) => xScale(d.date_parsed))
      .attr("y", (d) => yScale(d.upper_bound))
      .attr("width", 4)
      .attr("height", (d) => yScale(d.lower_bound) - yScale(d.upper_bound))
      .style("fill", "#C0C0C0");
  }

  drawRectangles(data);
  //   path
  path = svg
    .append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1);
});

// Resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  line.x((d) => xScale(d.date_parsed)).y((d) => yScale(d.avg));

  path.attr("d", line);

  svg
    .selectAll(".rectangles")
    .attr("x", (d) => xScale(d.date_parsed))
    .attr("y", (d) => yScale(d.upper_bound))
    .attr("width", 4)
    .attr("height", (d) => yScale(d.lower_bound) - yScale(d.upper_bound));

  d3.select(".x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  yAxis.tickSize(-width + margin.right + margin.left);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);
});
