import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({data}) => {
  const svgRef = useRef();
  const [xAxis,setXAxis] = useState("");
  const [yAxis,setYAxis] = useState("");
  const [colorEncoding,setColorEncoding] = useState("");


const handleXAxisChange = (event) => {
    setXAxis(event.target.value);
};

const handleYAxisChange = (event) => {
    setYAxis(event.target.value);
};

const handleColorChange = (event) => {
    setColorEncoding(event.target.value);
};


  useEffect(() => {
    if (data.length > 0) {
        if(!xAxis){
            setXAxis(Object.keys(data[0])[0]);
        }
        if(!yAxis){
            setYAxis(Object.keys(data[0])[1]);
        }
        drawScatterPlot();
    }
  }, [data, xAxis, yAxis, colorEncoding]);

  const drawScatterPlot = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 50, bottom: 50, left: 50 };

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[xAxis])).nice()
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[yAxis])).nice()
      .range([height - margin.bottom, margin.top]);

    const xAxisG = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80))
      .call(g => g.select('.domain').remove());

    const yAxisG = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove());

    const uniqueValues = [...new Set(data.map(d => d[colorEncoding]))];
    const colorScale = d3.scaleOrdinal()
    .domain(uniqueValues)
    .range(d3.schemeCategory10);

    svg.append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(+d[xAxis]))
      .attr('cy', d => y(+d[yAxis]))
      .attr('r', 2.5)
      .attr('fill', d=> colorScale(d[colorEncoding]));

    svg.append('g').call(xAxisG);
    svg.append('g').call(yAxisG);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 6)
      .attr('text-anchor', 'middle')
      .text(xAxis);

    svg.append('text')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text(yAxis);
  };

  return (
    <div>
        <div className='bg-blue-100 w-1/2 text-sm'>
            <svg ref={svgRef} width={600} height={400}></svg>

            <label htmlFor="xAxis">X Axis:</label>
            <select id="xAxis" value={xAxis} onChange={handleXAxisChange}>
                {data[0] && Object.keys(data[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                ))}
            </select>

            <label htmlFor="yAxis">Y Axis:</label>
            <select id="yAxis" value={yAxis} onChange={handleYAxisChange}>
                {data[0] && Object.keys(data[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                ))}
            </select>

            <label htmlFor="colorAxis">Color Encoding:</label>
            <select id="colorAxis" value={colorEncoding} onChange={handleColorChange}>
                {data[0] && Object.keys(data[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                ))}
            </select>

        </div>
    </div>
  );
};

export default ScatterPlot;