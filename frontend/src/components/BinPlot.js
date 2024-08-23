import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';



const BinPlot = ({ data }) => {
    const svgRef = useRef();
    const [yAxis1, setYAxis1] = useState("");
    const [yAxis2, setYAxis2] = useState("");
    const [maxBins, setMaxBins] = useState(5); // Maximum number of bins
    const [selectedLeftBin, setSelectedLeftBin] = useState(null);
    const [selectedRightBin, setSelectedRightBin] = useState(null);
    

    async function fetchCorrelation(){
        try {
            const response = await fetch('http://localhost:8000/get-correlation');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

        const data = await response.json();
        return data.correlations;
        }
        catch (error) {
            console.error("Error occurred while fetching correlation data:", error);
            return [];
        }

    }
    function getColorFromCorrelation(correlation) {
        // Define your color scale based on correlation value
        const colorScale = d3.scaleLinear()
            .domain([-1, 0, 1])  // Assuming correlation ranges from -1 to 1
            .range(["red", "white", "green"]);  // Colors from negative to positive correlation

        return colorScale(correlation);
    }


    const handleYAxis1Change = async (event) => {
        // setYAxis1(event.target.value);
        try {
            setYAxis1(event.target.value);

            const data = {attribute: event.target.value};
            const response = await fetch('http://localhost:8000/attribute1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                console.log("Y Axis 1 changed: ", data);
            } else {
                console.error("Failed to send Y Axis 1 data:", response.statusText);
            }
        }
        catch (error) {
            console.error("Error occurred while sending Y Axis 1 data:", error);
        }
        };
    
    const handleYAxis2Change = async (event) => {
        try {
            setYAxis2(event.target.value);

            const data = {attribute: event.target.value};
            const response = await fetch('http://localhost:8000/attribute2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                console.log("Y Axis 2 changed: ", data);
            } else {
                console.error("Failed to send Y Axis 2 data:", response.statusText);
            }
        }
        catch (error) {
            console.error("Error occurred while sending Y Axis 2 data:", error);
        }
    };
    const handleMaxBinsChange = async (event) => {
        const value = Math.max(1, Math.min(10, +event.target.value));
        try {
            setMaxBins(value);
            const data = {maxBins: value};
            const response = await fetch('http://localhost:8000/max-bins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                console.log("Max bins changed: ", data);
            } else {
                console.error("Failed to send max bins data:", response.statusText);
            }
        }
        catch (error) {
            console.error("Error occurred while sending max bins data:", error);
        }
    };

    const handleLeftBinClick = async (id) => {
        try {
            setSelectedLeftBin(id);
            
            const data = {binIndex: id};
            
            const response = await fetch('http://localhost:8000/left-click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (response.ok) {
                console.log("Left bin click: ", data);
            } else {
                console.error("Failed to send left bin click data:", response.statusText);
            }
        } catch (error) {
            console.error("Error occurred while sending left bin click data:", error);
        }
    };
        
    const handleRightBinClick = async (id) => {
        try {
            setSelectedRightBin(id);

            const data = {binIndex: id};
            const response = await fetch('http://localhost:8000/right-click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log("Right bin clicked: ", data);
            } else {
                console.error("Failed to send right bin click data:", response.statusText);
            }
        } catch (error) {
            console.error("Error occurred while sending right bin click data:", error);
        }
    };
    

    useEffect(() => {
        if (data.length > 0) {
            if (!yAxis1) {
                setYAxis1(Object.keys(data[0])[0]);
            }
            if (!yAxis2) {
                setYAxis2(Object.keys(data[0])[1]); // Initialize yAxis2 with another attribute
            }
            drawBinPlot();
        }
    }, [data, yAxis1, yAxis2, maxBins]);




    async function drawBinPlot() {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
    
        const width = 600;
        const height = 400;
        const margin = { top: 20, right: 50, bottom: 50, left: 50 };
        const barWidth = 15;
        const barSpacing = 20;  // Space between sets of bins
        const binGap = 2;       // Gap between bins in the same set
    
        const filteredData = data.filter(d => d[yAxis1] != null && d[yAxis2] != null);
    
        if (filteredData.length === 0) {
            console.log('No valid data points for plotting');
            return;
        }
    
        const y1 = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => +d[yAxis1])).nice()
            .range([height - margin.bottom, margin.top]);
    
        const y2 = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => +d[yAxis2])).nice()
            .range([height - margin.bottom, margin.top]);
    
        const xLeft = d3.scaleLinear()
            .domain([1, maxBins])
            .range([margin.left, width / 2 - barSpacing]);
    
        const xRight = d3.scaleLinear()
            .domain([1, maxBins])
            .range([width - margin.right - barSpacing, width / 2 + barSpacing]);
                    
        const maxBinsClamped = Math.max(1, Math.min(10, maxBins));
    
        const colorScaleLeft = d3.scaleLinear()
            .domain([1, maxBinsClamped])
            .range(['orange', 'darkorange']);
    
        const colorScaleRight = d3.scaleLinear()
            .domain([1, maxBinsClamped])
            .range(['steelblue', 'darkblue']);
    
        // Draw bars for the left attribute (y1)
        for (let i_left = 1; i_left <= maxBinsClamped; i_left++) {
            const barHeight = (height - margin.bottom - margin.top - (i_left - 1) * binGap) / i_left;
            for (let j_left = 0; j_left < i_left; j_left++) {
                svg.append('rect')
                    .attr('x', xLeft(i_left) - barWidth / 2)
                    .attr('y', margin.top + j_left * (barHeight + binGap))
                    .attr('width', barWidth)
                    .attr('height', barHeight)
                    .attr('fill', colorScaleLeft(i_left))
                    .attr('opacity', 0.8)
                    .attr('id', `${i_left}${j_left}`) // Add id to each bin
                    .on("click", function() {
                        const id = d3.select(this).attr('id');  // Get ID of clicked element
                        handleLeftBinClick(id);  // Pass ID to handler
                    });
            }
        }
        const correlations = await fetchCorrelation();  // Get correlations from backend
    
        // Draw bars for the right attribute (y2)
        for (let i_right = 1; i_right <= maxBinsClamped; i_right++) {
            const barHeight = (height - margin.bottom - margin.top - (i_right - 1) * binGap) / i_right;

            for (let j_right = 0; j_right < i_right; j_right++) {

                const correlationIndex = (i_right - 1) * maxBinsClamped + j_right;  // Calculate index for correlations
                const correlation = correlations[correlationIndex];  // Get the corresponding correlation value
                const color = getColorFromCorrelation(correlation);  // Get color based on correlation

                svg.append('rect')
                .attr('x', xRight(i_right) - barWidth / 2) // Reverse order
                .attr('y', margin.top + j_right * (barHeight + binGap))
                .attr('width', barWidth)
                .attr('height', barHeight)
                .attr('fill', color)
                .attr('opacity', 0.8)
                .attr('id', `${i_right}${j_right}`) // Add id to each bin
                .on("click", function() {
                    const id = d3.select(this).attr('id');  // Get ID of clicked element
                    handleRightBinClick(id);  // Pass ID to handler
                });

            }
        }
    
        // Draw y1 and y2 axes
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y1));
    
        svg.append('g')
            .attr('transform', `translate(${width - margin.right},0)`)
            .call(d3.axisRight(y2));
        
            
        // If both bins are selected, map the values
        if (selectedLeftBin !== null && selectedRightBin !== null) {
            svg.selectAll('.bin-connection').remove();
            // Logic to draw lines or connections between corresponding values
            console.log(maxBinsClamped, selectedLeftBin, selectedRightBin);
            const leftBinData = filteredData.filter(d => Math.floor(y1(d[yAxis1]) / (height / maxBinsClamped)) === selectedLeftBin - 1);
            const rightBinData = filteredData.filter(d => Math.floor(y2(d[yAxis2]) / (height / maxBinsClamped)) === (maxBinsClamped - selectedRightBin) - 1);
            leftBinData.forEach((leftDatum, idx) => {
                const rightDatum = rightBinData[idx];
                if (rightDatum) {
                    svg.append('path')
                        .attr('d', d3.line()
                        .curve(d3.curveBasis)
                        .x(function(d) {return d.x;})
                        .y(function(d) {return d.y;})
                        ([
                            {x: xLeft(selectedLeftBin), y: y1(leftDatum[yAxis1])},
                            {x: (xLeft(selectedLeftBin) + xRight(selectedRightBin)) / 2, y: (y1(leftDatum[yAxis1]) + y2(rightDatum[yAxis2])) / 2},
                            {x: xRight(selectedRightBin), y: y2(rightDatum[yAxis2])}
                        ]))
                        .attr('fill', 'none')
                        .attr('stroke', 'green')
                        .attr('stroke-width', 0.5)
                        .attr('opacity', 0.5)
                        .attr('class', 'bin-connection')
                                    }
            });
        }   
    };  



        
    return (
        <div>
            <div className='bg-blue-100 w-1/2 text-sm'>
                <svg ref={svgRef} width={600} height={400}></svg> {/* Adjusted SVG size */}
    
                <label htmlFor="yAxis1">Y Axis 1:</label>
                <select id="yAxis1" value={yAxis1} onChange={handleYAxis1Change}>
                    {data[0] && Object.keys(data[0]).map(key => (
                        <option key={key} value={key}>{key}</option>
                    ))}
                </select>
    
                <label htmlFor="yAxis2">Y Axis 2:</label>
                <select id="yAxis2" value={yAxis2} onChange={handleYAxis2Change}>
                    {data[0] && Object.keys(data[0]).map(key => (
                        <option key={key} value={key}>{key}</option>
                    ))}
                </select>
    
                <label>
                    Max Bins:
                    <input type="number" value={maxBins} onChange={handleMaxBinsChange} min="1" />
                </label>
            </div>
        </div>
    );
}
export default BinPlot;

      
        