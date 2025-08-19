import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ZoomableEnvironmentalGraph = ({ data, dataType }) => {
  
  const svgRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTransform, setCurrentTransform] = useState({ k: 1, x: 0, y: 0 });
  
  // Helper function to calculate average if not provided
  const getAverage = (dayData) => {
    if (dayData.avg !== undefined) {
      return dayData.avg; // Use provided average
    }
    // Calculate average from values
    const sum = dayData.values.reduce((acc, val) => acc + val, 0);
    return sum / dayData.values.length;
  };

  // Get the appropriate dataset based on dataType parameter
  const getDataset = () => {
    if (!data || !data[dataType]) {
      console.warn(`Data type '${dataType}' not found in provided data object`);
      return [];
    }
    return data[dataType];
  };

  // Get display properties based on data type
  const getDisplayProperties = () => {
    const defaults = {
      temp: { unit: '°C', title: 'Temperature', color: '#2563eb' },
      hum: { unit: '%', title: 'Humidity', color: '#059669' },
      co2: { unit: 'ppm', title: 'CO2', color: '#dc2626' },
      pm25: { unit: 'μg/m³', title: 'PM2.5', color: '#ea580c' },
      pm10: { unit: 'μg/m³', title: 'PM10', color: '#d97706' },
      pressure: { unit: 'hPa', title: 'Pressure', color: '#0891b2' },
      light: { unit: 'lux', title: 'Light', color: '#ca8a04' }
    };
    
    const defaultProps = defaults[dataType.toLowerCase()] || { unit: '', title: dataType.toUpperCase(), color: '#6b7280' };
    
    return {
      unit: defaultProps.unit,
      title: defaultProps.title,
      color: defaultProps.color
    };
  };

  useEffect(() => {
    const dataset = getDataset();
    if (!dataset || dataset.length === 0) {
      return;
    }

    const displayProps = getDisplayProperties();
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create all data points with actual timestamps
    const allDataPoints = [];
    const dailyAverages = [];
    
    dataset.forEach(entry => {
      // Parse the timestamp correctly
      const [year, month, day, hour, minute, second] = entry.date.split("_").map(Number);
      // JS Date month is 0-indexed (0 = Jan, 11 = Dec)
      const actualDateTime = new Date(year, month - 1, day, hour, minute, second);
      
      const dayAverage = getAverage(entry);
      
      // Add daily average point using the actual timestamp (not adding 12 hours)
      dailyAverages.push({
        date: new Date(actualDateTime), // Use actual time
        value: dayAverage,
        type: 'average',
        opacity: 1
      });
      
      // Add individual readings with actual timestamps
      // If you have multiple values per entry, you'll need to determine how to timestamp them
      // For now, I'll assume each value represents a reading at the base timestamp
      entry.values.forEach((value, index) => {
        // Create timestamps for each reading
        // You can adjust this logic based on how your values should be distributed
        const readingTime = new Date(actualDateTime);
        
        // If multiple readings per timestamp, spread them slightly apart
        if (entry.values.length > 1) {
          readingTime.setMinutes(actualDateTime.getMinutes() + (index * 5)); // 5 minute intervals
        }
        
        allDataPoints.push({
          date: readingTime,
          value: value,
          type: 'reading',
          dayAverage: dayAverage
        });
      });
    });

    // Calculate interpolated points for smooth transition
    const interpolatedData = [];
    const zoomFactor = Math.min(Math.max(zoomLevel, 1), 8);
    const detailLevel = (zoomFactor - 1) / 7; // 0 to 1 scale

    // Create interpolated dataset based on zoom level
    dataset.forEach(entry => {
      // Parse timestamp correctly
      const [year, month, dayNum, hour, minute, second] = entry.date.split("_").map(Number);
      const actualDateTime = new Date(year, month - 1, dayNum, hour, minute, second);
      
      const dayAverage = getAverage(entry);
      const pointsToShow = Math.max(1, Math.floor(1 + (entry.values.length - 1) * detailLevel));

      for (let i = 0; i < pointsToShow; i++) {
        const progress = i / Math.max(pointsToShow - 1, 1);
        
        // Create time based on actual timestamp
        let time = new Date(actualDateTime);
        
        // If showing multiple points, spread them around the actual time
        if (pointsToShow > 1) {
          const minuteOffset = (progress - 0.5) * 60; // Spread within 1 hour around actual time
          time.setMinutes(time.getMinutes() + minuteOffset);
        }
        
        let value;
        if (detailLevel === 0) {
          value = dayAverage;
        } else if (detailLevel === 1) {
          const readingIndex = Math.floor(progress * (entry.values.length - 1));
          value = entry.values[readingIndex] || entry.values[entry.values.length - 1];
        } else {
          const readingIndex = Math.floor(progress * (entry.values.length - 1));
          const reading = entry.values[readingIndex] || entry.values[entry.values.length - 1];
          value = dayAverage * (1 - detailLevel) + reading * detailLevel;
        }
        
        interpolatedData.push({
          date: time,
          value: value,
          type: detailLevel < 0.3 ? 'average' : 'mixed',
          detailLevel: detailLevel
        });
      }
    });

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent([...dailyAverages, ...allDataPoints], d => d.date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent([...dailyAverages, ...allDataPoints], d => d.value))
      .nice()
      .range([height, 0]);

    // Apply zoom transform to scales
    const zoomedXScale = currentTransform.k === 1 ? xScale : 
      xScale.copy().domain(xScale.domain().map(d => new Date(d.getTime() - currentTransform.x / currentTransform.k * (xScale.domain()[1] - xScale.domain()[0]) / width)));

    // Line generator
    const line = d3.line()
      .x(d => zoomedXScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add axes
    const timeFormat = detailLevel > 0.5 ? d3.timeFormat("%m-%d %H:%M") : d3.timeFormat("%m-%d");
    
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(zoomedXScale)
        .tickFormat(timeFormat)
        .ticks(Math.min(10, Math.max(5, Math.floor(zoomLevel * 3)))));

    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(`${displayProps.title} (${displayProps.unit})`);

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Date & Time");

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(zoomedXScale)
        .tickSize(-height)
        .tickFormat("")
        .ticks(Math.min(10, Math.max(5, Math.floor(zoomLevel * 3))))
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    // Color interpolation based on detail level
    const colorScale = d3.interpolateRgb(displayProps.color, d3.color(displayProps.color).darker(1));
    const currentColor = colorScale(detailLevel);

    // Add the interpolated line
    g.append("path")
      .datum(interpolatedData)
      .attr("fill", "none")
      .attr("stroke", currentColor)
      .attr("stroke-width", 2)
      .attr("d", line)
      .style("transition", "stroke 0.3s ease");

    // Add data points
    g.selectAll(".dot")
      .data(interpolatedData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => zoomedXScale(d.date))
      .attr("cy", d => yScale(d.value))
      .attr("r", 3 + detailLevel * 2)
      .attr("fill", currentColor)
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000");

        tooltip.html(`
          Date: ${d.date.toLocaleDateString()}<br/>
          Time: ${d.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}<br/>
          ${displayProps.title}: ${d.value.toFixed(1)}${displayProps.unit}<br/>
          Detail Level: ${(detailLevel * 100).toFixed(0)}%
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.selectAll(".tooltip").remove();
      });

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        const newZoomLevel = event.transform.k;
        setZoomLevel(newZoomLevel);
        setCurrentTransform(event.transform);
      });

    svg.call(zoom);

  }, [data, dataType, zoomLevel, currentTransform]);

  const detailPercentage = Math.min(((zoomLevel - 1) / 7) * 100, 100);
  const displayProps = getDisplayProperties();

  // Show error message if data is not available
  if (!data || !data[dataType]) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px'
      }}>
        <h3>Data Not Available</h3>
        <p>No data found for "{dataType}" in the provided dataset.</p>
        <p>Available data types: {data ? Object.keys(data).join(', ') : 'None'}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
          {displayProps.title} Monitoring Graph
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: `linear-gradient(to right, ${displayProps.color} ${100-detailPercentage}%, ${d3.color(displayProps.color).darker(1)} ${detailPercentage}%)`,
              borderRadius: '50%' 
            }}></div>
            <span>Detail Level: {detailPercentage.toFixed(0)}%</span>
          </div>
          <div>
            <span>Zoom: {zoomLevel.toFixed(1)}x</span>
          </div>
          <div style={{ 
            padding: '4px 8px', 
            backgroundColor: displayProps.color + '20',
            borderRadius: '4px',
            fontSize: '12px',
            border: `1px solid ${displayProps.color}40`
          }}>
            📊 {dataType.toUpperCase()} - {data[dataType].length} entries
          </div>
          <div style={{ 
            padding: '4px 8px', 
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            💡 Scroll to zoom
          </div>
        </div>
        
        <div style={{ 
          marginTop: '10px',
          height: '4px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${detailPercentage}%`,
            background: `linear-gradient(to right, ${displayProps.color}, ${d3.color(displayProps.color).darker(1)})`,
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
      
      <div style={{ 
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <svg
          ref={svgRef}
          width="800"
          height="400"
          style={{ 
            display: 'block',
            cursor: 'grab'
          }}
        ></svg>
      </div>
      
      <div style={{ 
        marginTop: '15px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        <p style={{ margin: '5px 0' }}>
          <strong>Smooth Zoom:</strong> Gradually reveals more detail as you zoom in. 
          Data points now show at their actual timestamps.
        </p>
        <p style={{ margin: '5px 0' }}>
          At 0% detail: Averages only | At 100% detail: All individual readings with precise timing
        </p>
      </div>
    </div>
  );
};

// Demo component showing how to use the flexible graph
const NewGraph = ({data, dataType}) => {
  return (
    <div>
      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#f1f5f9', 
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
      
      </div>
      
      <ZoomableEnvironmentalGraph 
        data={data}
        dataType={dataType}
      />
    </div>
  );
};

export default NewGraph;