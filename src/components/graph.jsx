// import React, { useState, useMemo, useRef, useEffect } from 'react';
// import * as d3 from 'd3';
// import { Calendar, Thermometer, Wind, Droplets, Activity, TrendingUp } from 'lucide-react';

// const AirQualityDashboard = ({ data }) => {
//   const [selectedMetric, setSelectedMetric] = useState('aqi');
//   const [chartType, setChartType] = useState('line');
//   const [dateRange, setDateRange] = useState('all');
//   const svgRef = useRef(null);

//   // Process and flatten the nested data with better date parsing
//   const processedData = useMemo(() => {
//     console.log('Raw data:', data); // Debug log
//     const flatData = [];
    
//     // Process date-based entries
//     Object.keys(data).forEach(dateKey => {
//       console.log('Processing dateKey:', dateKey); // Debug log
      
//       if (dateKey.includes('_') && dateKey.match(/^\d{4}_\d{1,2}_\d{1,2}$/)) {
//           console.log('Processing dateKey:', dateKey);
//         const dayData = data[dateKey];
//         console.log('Day data:', dayData); // Debug log
        
//         Object.keys(dayData).forEach(timeKey => {
//           console.log('Processing timeKey:', timeKey); // Debug log
//           const reading = dayData[timeKey];
          
//           if (reading && typeof reading === 'object') {
//             try {
//               // Parse date and time - handle different formats
//               const [year, month, day] = dateKey.split('_').map(num => parseInt(num));
//               const [hour, minute, second] = timeKey.split('_').map(num => parseInt(num));
              
//               console.log(`Parsed: ${year}-${month}-${day} ${hour}:${minute}:${second}`); // Debug log
              
//               const timestamp = new Date(year, month - 1, day, hour, minute, second || 0);
              
//               // Validate the timestamp
//               if (isNaN(timestamp.getTime())) {
//                 console.warn('Invalid timestamp created:', { dateKey, timeKey, year, month, day, hour, minute, second });
//                 return;
//               }

//               // More aggressive filtering of erroneous readings
//               const cleanedReading = {
//                 ...reading,
//                 aqi: (reading.aqi > 500 || reading.aqi < 0) ? null : reading.aqi,
//                 pm25: (reading.pm25 > 500 || reading.pm25 < 0) ? null : reading.pm25,
//                 co2: (reading.co2 === 0 || reading.co2 > 5000) ? null : reading.co2,
//                 temp: (reading.temp > 60 || reading.temp < -20) ? null : reading.temp,
//                 hum: (reading.hum > 100 || reading.hum < 0) ? null : reading.hum,
//               };

//               const processedEntry = {
//                 timestamp,
//                 date: timestamp.toLocaleDateString(),
//                 time: timestamp.toLocaleTimeString(),
//                 dateTime: timestamp.toLocaleString(),
//                 ...cleanedReading
//               };
              
//               console.log('Processed entry:', processedEntry); // Debug log
//               flatData.push(processedEntry);
//             } catch (error) {
//               console.error('Error processing data point:', error, { dateKey, timeKey, reading });
//             }
//           }
//         });
//       }
//     });
    
//     console.log('Final processed data:', flatData); // Debug log
//     // Sort by timestamp
//     return flatData.sort((a, b) => a.timestamp - b.timestamp);
//   }, [data]);

//   // Filter data based on date range - FINAL DAY VERSION
//   const filteredData = useMemo(() => {
//     if (dateRange === 'all') return processedData;
    
//     // Find the latest date in the data
//     const latestDataPoint = processedData[processedData.length - 1];
//     if (!latestDataPoint) return processedData;
    
//     const latestDate = latestDataPoint.timestamp;
//     console.log('Latest data point date:', latestDate); // Debug log
    
//     let startDate, endDate;
    
//     switch (dateRange) {
//       case '24h':
//         // Show the entire final day (00:00 AM to 11:59 PM of the latest day)
//         endDate = new Date(latestDate);
//         endDate.setHours(23, 59, 59, 999); // Set to 11:59:59 PM of the latest day
        
//         startDate = new Date(latestDate);
//         startDate.setHours(0, 0, 0, 0); // Set to 00:00 AM of the latest day
        
//         console.log('24h filter: showing entire final day from', startDate, 'to', endDate); // Debug log
//         break;
//       case '7d':
//         // Show last 7 full days
//         endDate = new Date(latestDate);
//         endDate.setHours(23, 59, 59, 999);
        
//         startDate = new Date(latestDate);
//         startDate.setDate(startDate.getDate() - 6); // 7 days including today
//         startDate.setHours(0, 0, 0, 0);
        
//         console.log('7d filter: showing data from', startDate, 'to', endDate); // Debug log
//         break;
//       case '30d':
//         // Show last 30 full days
//         endDate = new Date(latestDate);
//         endDate.setHours(23, 59, 59, 999);
        
//         startDate = new Date(latestDate);
//         startDate.setDate(startDate.getDate() - 29); // 30 days including today
//         startDate.setHours(0, 0, 0, 0);
        
//         console.log('30d filter: showing data from', startDate, 'to', endDate); // Debug log
//         break;
//       default:
//         return processedData;
//     }
    
//     // Filter data to show everything in the specified date range
//     const filtered = processedData.filter(item => {
//       const itemTime = item.timestamp.getTime();
//       const startTime = startDate.getTime();
//       const endTime = endDate.getTime();
      
//       return itemTime >= startTime && itemTime <= endTime;
//     });
    
//     console.log(`Filtered ${processedData.length} -> ${filtered.length} data points for ${dateRange}`); // Debug log
//     console.log('Filter range:', startDate.toLocaleString(), 'to', endDate.toLocaleString());
    
//     return filtered;
//   }, [processedData, dateRange]);

//   // Calculate statistics
//   const stats = useMemo(() => {
//     if (filteredData.length === 0) return {};
    
//     const validReadings = filteredData.filter(item => item[selectedMetric] != null);
//     const values = validReadings.map(item => item[selectedMetric]);
    
//     if (values.length === 0) return {};
    
//     return {
//       current: values[values.length - 1],
//       average: (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1),
//       max: Math.max(...values),
//       min: Math.min(...values),
//       trend: values.length > 1 ? (values[values.length - 1] - values[0] > 0 ? 'up' : 'down') : 'stable'
//     };
//   }, [filteredData, selectedMetric]);

//   // D3 Chart rendering
//   useEffect(() => {
//     if (!filteredData.length || !svgRef.current) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove(); // Clear previous chart

//     const margin = { top: 20, right: 30, bottom: 80, left: 70 };
//     const width = 800 - margin.left - margin.right;
//     const height = 400 - margin.top - margin.bottom;

//     const g = svg.append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Filter out null values for the selected metric
//     const validData = filteredData.filter(d => d[selectedMetric] != null);
    
//     if (validData.length === 0) {
//       g.append("text")
//         .attr("x", width / 2)
//         .attr("y", height / 2)
//         .attr("text-anchor", "middle")
//         .style("font-size", "16px")
//         .style("fill", "#666")
//         .text("No valid data to display");
//       return;
//     }

//     console.log('Valid data for chart:', validData); // Debug log

//     // Scales with better domain handling
//     const xScale = d3.scaleTime()
//       .domain(d3.extent(validData, d => d.timestamp))
//       .range([0, width]);

//     // More intelligent Y-scale domain
//     const yExtent = d3.extent(validData, d => d[selectedMetric]);
//     const yPadding = (yExtent[1] - yExtent[0]) * 0.1; // Add 10% padding
    
//     const yScale = d3.scaleLinear()
//       .domain([
//         Math.max(0, yExtent[0] - yPadding), // Don't go below 0 for most metrics
//         yExtent[1] + yPadding
//       ])
//       .nice()
//       .range([height, 0]);

//     // Color scale for AQI categories
//     const getAQIColor = (aqi) => {
//       if (aqi <= 50) return '#00E400';
//       if (aqi <= 100) return '#FFFF00';
//       if (aqi <= 150) return '#FF7E00';
//       if (aqi <= 200) return '#FF0000';
//       if (aqi <= 300) return '#8F3F97';
//       return '#7E0023';
//     };

//     const getMetricColor = (d) => {
//       if (selectedMetric === 'aqi') {
//         return getAQIColor(d[selectedMetric]);
//       }
//       return colors[selectedMetric];
//     };

//     const colors = {
//       aqi: '#8884d8',
//       temp: '#82ca9d',
//       hum: '#ffc658',
//       co2: '#ff7300',
//       pm25: '#8dd1e1'
//     };

//     // Axes with better formatting
//     const xAxis = d3.axisBottom(xScale)
//       .tickFormat(d3.timeFormat("%m/%d %H:%M"))
//       .ticks(Math.min(validData.length, 8)); // Limit number of ticks

//     const yAxis = d3.axisLeft(yScale)
//       .ticks(8);

//     g.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(xAxis)
//       .selectAll("text")
//       .style("text-anchor", "end")
//       .style("font-size", "11px")
//       .attr("dx", "-.8em")
//       .attr("dy", ".15em")
//       .attr("transform", "rotate(-45)");

//     g.append("g")
//       .call(yAxis)
//       .selectAll("text")
//       .style("font-size", "11px");

//     // Add axis labels
//     g.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", 0 - margin.left)
//       .attr("x", 0 - (height / 2))
//       .attr("dy", "1em")
//       .style("text-anchor", "middle")
//       .style("font-size", "12px")
//       .style("fill", "#666")
//       .text(metrics[selectedMetric].label + (metrics[selectedMetric].unit ? ` (${metrics[selectedMetric].unit})` : ''));

//     g.append("text")
//       .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
//       .style("text-anchor", "middle")
//       .style("font-size", "12px")
//       .style("fill", "#666")
//       .text("Time");

//     // Add grid lines
//     g.append("g")
//       .attr("class", "grid")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(xScale)
//         .tickSize(-height)
//         .tickFormat("")
//         .ticks(8)
//       )
//       .style("stroke-dasharray", "3,3")
//       .style("opacity", 0.3);

//     g.append("g")
//       .attr("class", "grid")
//       .call(d3.axisLeft(yScale)
//         .tickSize(-width)
//         .tickFormat("")
//         .ticks(8)
//       )
//       .style("stroke-dasharray", "3,3")
//       .style("opacity", 0.3);

//     // Render different chart types
//     switch (chartType) {
//       case 'area':
//         const area = d3.area()
//           .x(d => xScale(d.timestamp))
//           .y0(height)
//           .y1(d => yScale(d[selectedMetric]))
//           .curve(d3.curveMonotoneX);

//         g.append("path")
//           .datum(validData)
//           .attr("fill", colors[selectedMetric])
//           .attr("fill-opacity", 0.6)
//           .attr("stroke", colors[selectedMetric])
//           .attr("stroke-width", 2)
//           .attr("d", area);
//         break;

//       case 'bar':
//         const barWidth = Math.min(width / validData.length * 0.8, 20);
        
//         g.selectAll(".bar")
//           .data(validData)
//           .enter().append("rect")
//           .attr("class", "bar")
//           .attr("x", d => xScale(d.timestamp) - barWidth/2)
//           .attr("width", barWidth)
//           .attr("y", d => yScale(d[selectedMetric]))
//           .attr("height", d => height - yScale(d[selectedMetric]))
//           .attr("fill", d => getMetricColor(d))
//           .attr("opacity", 0.8);
//         break;

//       case 'scatter':
//         g.selectAll(".dot")
//           .data(validData)
//           .enter().append("circle")
//           .attr("class", "dot")
//           .attr("cx", d => xScale(d.timestamp))
//           .attr("cy", d => yScale(d[selectedMetric]))
//           .attr("r", 4)
//           .attr("fill", d => getMetricColor(d))
//           .attr("opacity", 0.8)
//           .attr("stroke", "#fff")
//           .attr("stroke-width", 1);
//         break;

//       default: // line chart
//         const line = d3.line()
//           .x(d => xScale(d.timestamp))
//           .y(d => yScale(d[selectedMetric]))
//           .curve(d3.curveMonotoneX);

//         g.append("path")
//           .datum(validData)
//           .attr("fill", "none")
//           .attr("stroke", colors[selectedMetric])
//           .attr("stroke-width", 2)
//           .attr("d", line);

//         // Add dots with proper coloring
//         g.selectAll(".dot")
//           .data(validData)
//           .enter().append("circle")
//           .attr("class", "dot")
//           .attr("cx", d => xScale(d.timestamp))
//           .attr("cy", d => yScale(d[selectedMetric]))
//           .attr("r", 3)
//           .attr("fill", d => getMetricColor(d))
//           .attr("stroke", "#fff")
//           .attr("stroke-width", 1);
//         break;
//     }

//     // Add tooltips
//     const tooltip = d3.select("body").append("div")
//       .attr("class", "d3-tooltip")
//       .style("position", "absolute")
//       .style("visibility", "hidden")
//       .style("background", "rgba(0, 0, 0, 0.8)")
//       .style("color", "white")
//       .style("padding", "8px")
//       .style("border-radius", "4px")
//       .style("font-size", "12px")
//       .style("pointer-events", "none")
//       .style("z-index", "1000");

//     g.selectAll(".dot, .bar")
//       .on("mouseover", function(event, d) {
//         tooltip.style("visibility", "visible")
//           .html(`
//             <div><strong>${metrics[selectedMetric].label}: ${d[selectedMetric]}${metrics[selectedMetric].unit}</strong></div>
//             <div>Time: ${d.dateTime}</div>
//             ${selectedMetric === 'aqi' ? `<div>Category: ${getAQICategory(d.aqi).category}</div>` : ''}
//           `);
//       })
//       .on("mousemove", function(event) {
//         tooltip.style("top", (event.pageY - 10) + "px")
//           .style("left", (event.pageX + 10) + "px");
//       })
//       .on("mouseout", function() {
//         tooltip.style("visibility", "hidden");
//       });

//     // Cleanup tooltip on component unmount
//     return () => {
//       d3.selectAll(".d3-tooltip").remove();
//     };

//   }, [filteredData, selectedMetric, chartType]);

//   // Get AQI category and color
//   const getAQICategory = (aqi) => {
//     if (aqi <= 50) return { category: 'Good', color: '#00E400' };
//     if (aqi <= 100) return { category: 'Moderate', color: '#FFFF00' };
//     if (aqi <= 150) return { category: 'Unhealthy for Sensitive', color: '#FF7E00' };
//     if (aqi <= 200) return { category: 'Unhealthy', color: '#FF0000' };
//     if (aqi <= 300) return { category: 'Very Unhealthy', color: '#8F3F97' };
//     return { category: 'Hazardous', color: '#7E0023' };
//   };

//   const metrics = {
//     aqi: { label: 'Air Quality Index', unit: '', color: '#8884d8', icon: Activity },
//     temp: { label: 'Temperature', unit: '°C', color: '#82ca9d', icon: Thermometer },
//     hum: { label: 'Humidity', unit: '%', color: '#ffc658', icon: Droplets },
//     co2: { label: 'CO2', unit: 'ppm', color: '#ff7300', icon: Wind },
//     pm25: { label: 'PM2.5', unit: 'μg/m³', color: '#8dd1e1', icon: Wind }
//   };

//   const currentAQI = stats.current && selectedMetric === 'aqi' ? getAQICategory(stats.current) : null;

//   return (
//     <div style={{ 
//       width: '100%', 
//       maxWidth: '1200px', 
//       margin: '0 auto', 
//       padding: '24px', 
//       backgroundColor: '#f9fafb', 
//       minHeight: '100vh' 
//     }}>
//       <div style={{ 
//         backgroundColor: 'white', 
//         borderRadius: '8px', 
//         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
//         padding: '24px' 
//       }}>
//         <div style={{ 
//           display: 'flex', 
//           alignItems: 'center', 
//           justifyContent: 'space-between', 
//           marginBottom: '24px' 
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//             <Activity style={{ width: '32px', height: '32px', color: '#2563eb' }} />
//             <h1 style={{ 
//               fontSize: '28px', 
//               fontWeight: 'bold', 
//               color: '#1f2937', 
//               margin: 0 
//             }}>Previous Charts</h1>
//           </div>
//           {/* {currentAQI && (
//             <div style={{ textAlign: 'right' }}>
//               <div style={{ fontSize: '14px', color: '#6b7280' }}>Current AQI</div>
//               <div style={{ 
//                 fontSize: '24px', 
//                 fontWeight: 'bold', 
//                 color: currentAQI.color 
//               }}>
//                 {stats.current}
//               </div>
//               <div style={{ 
//                 fontSize: '14px', 
//                 color: currentAQI.color 
//               }}>
//                 {currentAQI.category}
//               </div>
//             </div>
//           )} */}
//         </div>

//         {/* Debug Info */}
//         <div style={{ 
//           marginBottom: '16px', 
//           padding: '8px', 
//           backgroundColor: '#f3f4f6', 
//           borderRadius: '4px',
//           fontSize: '12px',
//           color: '#4b5563'
//         }}>
//           {/* <div>Total processed data points: {processedData.length}</div>
//           <div>Filtered data points ({dateRange}): {filteredData.length}</div>
//           <div>Valid data for selected metric: {filteredData.filter(d => d[selectedMetric] != null).length}</div>
//           {filteredData.length > 0 && (
//             <>
//               <div><strong>Showing data for:</strong> {dateRange === '24h' ? 'Full Final Day' : dateRange}</div>
//               <div>Date range: {filteredData[0].date} to {filteredData[filteredData.length - 1].date}</div>
//               <div>Time range: {filteredData[0].time} to {filteredData[filteredData.length - 1].time}</div>
//             </>
//           )} */}
//         </div>

//         {/* Controls */}
//         <div style={{ 
//           display: 'grid', 
//           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//           gap: '16px', 
//           marginBottom: '24px' 
//         }}>
//           {/* Metric Selection */}
//           <div>
//             <label style={{ 
//               display: 'block', 
//               fontSize: '14px', 
//               fontWeight: '500', 
//               color: '#374151', 
//               marginBottom: '8px' 
//             }}>Metric</label>
//             <select 
//               value={selectedMetric} 
//               onChange={(e) => setSelectedMetric(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '8px',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '6px',
//                 fontSize: '14px',
//                 backgroundColor: 'white',
//                 cursor: 'pointer'
//               }}
//             >
//               {Object.entries(metrics).map(([key, metric]) => (
//                 <option key={key} value={key}>{metric.label}</option>
//               ))}
//             </select>
//           </div>

//           {/* Chart Type */}
//           <div>
//             <label style={{ 
//               display: 'block', 
//               fontSize: '14px', 
//               fontWeight: '500', 
//               color: '#374151', 
//               marginBottom: '8px' 
//             }}>Chart Type</label>
//             <select 
//               value={chartType} 
//               onChange={(e) => setChartType(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '8px',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '6px',
//                 fontSize: '14px',
//                 backgroundColor: 'white',
//                 cursor: 'pointer'
//               }}
//             >
//               <option value="line">Line Chart</option>
//               <option value="area">Area Chart</option>
//               <option value="bar">Bar Chart</option>
//               <option value="scatter">Scatter Plot</option>
//             </select>
//           </div>

//           {/* Date Range */}
//           <div>
//             <label style={{ 
//               display: 'block', 
//               fontSize: '14px', 
//               fontWeight: '500', 
//               color: '#374151', 
//               marginBottom: '8px' 
//             }}>Time Range</label>
//             <select 
//               value={dateRange} 
//               onChange={(e) => setDateRange(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '8px',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '6px',
//                 fontSize: '14px',
//                 backgroundColor: 'white',
//                 cursor: 'pointer'
//               }}
//             >
//               <option value="all">All Time</option>
//               <option value="24h">Last 24 Hours</option>
//               {/* <option value="7d">Last 7 Days</option> */}
//               <option value="30d">Current Month</option>
//             </select>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         {stats.current != null && (
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//             gap: '16px', 
//             marginBottom: '24px' 
//           }}>
//             {/* <div style={{ 
//               backgroundColor: '#dbeafe', 
//               padding: '16px', 
//               borderRadius: '8px', 
//               border: '1px solid #bfdbfe' 
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#2563eb' }}>Current</div>
//                   <div style={{ 
//                     fontSize: '24px', 
//                     fontWeight: 'bold', 
//                     color: '#1e40af' 
//                   }}>{stats.current}{metrics[selectedMetric].unit}</div>
//                 </div>
//                 {React.createElement(metrics[selectedMetric].icon, { 
//                   style: { width: '32px', height: '32px', color: '#2563eb' } 
//                 })}
//               </div>
//             </div> */}

//             <div style={{ 
//               backgroundColor: '#dcfce7', 
//               padding: '16px', 
//               borderRadius: '8px', 
//               border: '1px solid #bbf7d0' 
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#16a34a' }}>Average</div>
//                   <div style={{ 
//                     fontSize: '24px', 
//                     fontWeight: 'bold', 
//                     color: '#15803d' 
//                   }}>{stats.average}{metrics[selectedMetric].unit}</div>
//                 </div>
//                 <TrendingUp style={{ width: '32px', height: '32px', color: '#16a34a' }} />
//               </div>
//             </div>

//             <div style={{ 
//               backgroundColor: '#fee2e2', 
//               padding: '16px', 
//               borderRadius: '8px', 
//               border: '1px solid #fecaca' 
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#dc2626' }}>Maximum</div>
//                   <div style={{ 
//                     fontSize: '24px', 
//                     fontWeight: 'bold', 
//                     color: '#b91c1c' 
//                   }}>{stats.max}{metrics[selectedMetric].unit}</div>
//                 </div>
//                 <TrendingUp style={{ width: '32px', height: '32px', color: '#dc2626' }} />
//               </div>
//             </div>

//             <div style={{ 
//               backgroundColor: '#fef3c7', 
//               padding: '16px', 
//               borderRadius: '8px', 
//               border: '1px solid #fde68a' 
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <div style={{ fontSize: '14px', color: '#d97706' }}>Minimum</div>
//                   <div style={{ 
//                     fontSize: '24px', 
//                     fontWeight: 'bold', 
//                     color: '#b45309' 
//                   }}>{stats.min}{metrics[selectedMetric].unit}</div>
//                 </div>
//                 <TrendingUp style={{ width: '32px', height: '32px', color: '#d97706' }} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* D3 Chart */}
//         <div style={{ 
//           backgroundColor: 'white', 
//           padding: '24px', 
//           borderRadius: '8px', 
//           border: '1px solid #e5e7eb' 
//         }}>
//           <h2 style={{ 
//             fontSize: '20px', 
//             fontWeight: '600', 
//             marginBottom: '16px', 
//             color: '#1f2937' 
//           }}>
//             {metrics[selectedMetric].label} Over Time
//           </h2>
//           <div style={{ width: '100%', overflowX: 'auto' }}>
//             <svg ref={svgRef} width="800" height="400" style={{ width: '100%', height: 'auto' }}></svg>
//           </div>
//         </div>

//         {/* Data Summary */}
//         <div style={{ 
//           marginTop: '24px', 
//           backgroundColor: '#f9fafb', 
//           padding: '16px', 
//           borderRadius: '8px' 
//         }}>
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//             gap: '16px', 
//             fontSize: '14px' 
//           }}>
//             {/* <div>
//               <span style={{ fontWeight: '500', color: '#374151' }}>Total Readings:</span>
//               <span style={{ marginLeft: '8px', color: '#111827' }}>{filteredData.length}</span>
//             </div> */}
//             <div>
//               <span style={{ fontWeight: '500', color: '#374151' }}>Date Range:</span>
//               <span style={{ marginLeft: '8px', color: '#111827' }}>
//                 {filteredData.length > 0 ? 
//                   `${filteredData[0].date} - ${filteredData[filteredData.length - 1].date}` : 
//                   'No data'
//                 }
//               </span>
//             </div>
//             <div>
//               <span style={{ fontWeight: '500', color: '#374151' }}>Latest Reading:</span>
//               <span style={{ marginLeft: '8px', color: '#111827' }}>
//                 {filteredData.length > 0 ? filteredData[filteredData.length - 1].dateTime : 'No data'}
//               </span>
//             </div>
//             <div>
//               <span style={{ fontWeight: '500', color: '#374151' }}>Trend:</span>
//               <span style={{ 
//                 marginLeft: '8px', 
//                 color: stats.trend === 'up' ? '#dc2626' : stats.trend === 'down' ? '#16a34a' : '#6b7280'
//               }}>
//                 {stats.trend === 'up' ? '↗ Rising' : stats.trend === 'down' ? '↘ Falling' : '→ Stable'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// new graph from Claude
import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Calendar, Thermometer, Wind, Droplets, Activity, TrendingUp } from 'lucide-react';

const AirQualityDashboard = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState('aqi');
  const [chartType, setChartType] = useState('line');
  const [dateRange, setDateRange] = useState('all');
  const svgRef = useRef(null);
  const xScaleRef = useRef(null);
  const yScaleRef = useRef(null);

  // Process and flatten the nested data with better date parsing
  const processedData = useMemo(() => {
    const flatData = [];
    
    // Process date-based entries
    Object.keys(data).forEach(dateKey => {
      if (dateKey.includes('_') && dateKey.match(/^\d{4}_\d{1,2}_\d{1,2}$/)) {
        const dayData = data[dateKey];
        
        Object.keys(dayData).forEach(timeKey => {
          const reading = dayData[timeKey];
          
          if (reading && typeof reading === 'object') {
            try {
              // Parse date and time - handle different formats
              const [year, month, day] = dateKey.split('_').map(num => parseInt(num));
              const [hour, minute, second] = timeKey.split('_').map(num => parseInt(num));
              
              const timestamp = new Date(year, month - 1, day, hour, minute, second || 0);
              
              // Validate the timestamp
              if (isNaN(timestamp.getTime())) {
                console.warn('Invalid timestamp created:', { dateKey, timeKey, year, month, day, hour, minute, second });
                return;
              }

              // More aggressive filtering of erroneous readings
              const cleanedReading = {
                ...reading,
                aqi: (reading.aqi > 500 || reading.aqi < 0) ? null : reading.aqi,
                pm25: (reading.pm25 > 500 || reading.pm25 < 0) ? null : reading.pm25,
                co2: (reading.co2 === 0 || reading.co2 > 5000) ? null : reading.co2,
                temp: (reading.temp > 60 || reading.temp < -20) ? null : reading.temp,
                hum: (reading.hum > 100 || reading.hum < 0) ? null : reading.hum,
              };

              const processedEntry = {
                timestamp,
                date: timestamp.toLocaleDateString(),
                time: timestamp.toLocaleTimeString(),
                dateTime: timestamp.toLocaleString(),
                ...cleanedReading
              };
              
              flatData.push(processedEntry);
            } catch (error) {
              console.error('Error processing data point:', error, { dateKey, timeKey, reading });
            }
          }
        });
      }
    });
    
    // Sort by timestamp
    return flatData.sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (dateRange === 'all') return processedData;
    
    // Find the latest date in the data
    const latestDataPoint = processedData[processedData.length - 1];
    if (!latestDataPoint) return processedData;
    
    const latestDate = latestDataPoint.timestamp;
    let startDate, endDate;
    
    switch (dateRange) {
      case '24h':
        endDate = new Date(latestDate);
        endDate.setHours(23, 59, 59, 999);
        
        startDate = new Date(latestDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7d':
        endDate = new Date(latestDate);
        endDate.setHours(23, 59, 59, 999);
        
        startDate = new Date(latestDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30d':
        endDate = new Date(latestDate);
        endDate.setHours(23, 59, 59, 999);
        
        startDate = new Date(latestDate);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return processedData;
    }
    
    const filtered = processedData.filter(item => {
      const itemTime = item.timestamp.getTime();
      const startTime = startDate.getTime();
      const endTime = endDate.getTime();
      
      return itemTime >= startTime && itemTime <= endTime;
    });
    
    return filtered;
  }, [processedData, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return {};
    
    const validReadings = filteredData.filter(item => item[selectedMetric] != null);
    const values = validReadings.map(item => item[selectedMetric]);
    
    if (values.length === 0) return {};
    
    return {
      current: values[values.length - 1],
      average: (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1),
      max: Math.max(...values),
      min: Math.min(...values),
      trend: values.length > 1 ? (values[values.length - 1] - values[0] > 0 ? 'up' : 'down') : 'stable'
    };
  }, [filteredData, selectedMetric]);

  // D3 Zoomable Chart rendering
  useEffect(() => {
    if (!filteredData.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = { top: 20, right: 30, bottom: 80, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter out null values for the selected metric
    const validData = filteredData.filter(d => d[selectedMetric] != null);
    
    if (validData.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("No valid data to display");
      return;
    }

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(validData, d => d.timestamp))
      .range([0, width]);

    const yExtent = d3.extent(validData, d => d[selectedMetric]);
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
    
    const yScale = d3.scaleLinear()
      .domain([
        Math.max(0, yExtent[0] - yPadding),
        yExtent[1] + yPadding
      ])
      .nice()
      .range([height, 0]);

    // Store scales in refs for zoom functionality
    xScaleRef.current = xScale;
    yScaleRef.current = yScale;

    // Color functions
    const getAQIColor = (aqi) => {
      if (aqi <= 50) return '#00E400';
      if (aqi <= 100) return '#FFFF00';
      if (aqi <= 150) return '#FF7E00';
      if (aqi <= 200) return '#FF0000';
      if (aqi <= 300) return '#8F3F97';
      return '#7E0023';
    };

    const colors = {
      aqi: '#8884d8',
      temp: '#82ca9d',
      hum: '#ffc658',
      co2: '#ff7300',
      pm25: '#8dd1e1'
    };

    const getMetricColor = (d) => {
      if (selectedMetric === 'aqi') {
        return getAQIColor(d[selectedMetric]);
      }
      return colors[selectedMetric];
    };

    // Create axes
    const xAxisGroup = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`);

    const yAxisGroup = g.append("g")
      .attr("class", "y-axis");

    // Function to update axes with dynamic formatting based on zoom level
    const updateAxes = (newXScale) => {
      const extent = newXScale.domain();
      const timeDiff = extent[1] - extent[0];
      
      let timeFormat;
      let tickInterval;
      
      // Adjust formatting based on time range
      if (timeDiff < 24 * 60 * 60 * 1000) { // Less than 1 day
        timeFormat = d3.timeFormat("%H:%M");
        tickInterval = d3.timeMinute.every(30);
      } else if (timeDiff < 7 * 24 * 60 * 60 * 1000) { // Less than 1 week
        timeFormat = d3.timeFormat("%m/%d %H:%M");
        tickInterval = d3.timeHour.every(6);
      } else if (timeDiff < 30 * 24 * 60 * 60 * 1000) { // Less than 1 month
        timeFormat = d3.timeFormat("%m/%d");
        tickInterval = d3.timeDay.every(1);
      } else {
        timeFormat = d3.timeFormat("%m/%d/%y");
        tickInterval = d3.timeDay.every(7);
      }

      const xAxis = d3.axisBottom(newXScale)
        .tickFormat(timeFormat)
        .ticks(tickInterval || 8);

      xAxisGroup
        .transition()
        .duration(300)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

      const yAxis = d3.axisLeft(yScale).ticks(8);
      yAxisGroup
        .transition()
        .duration(300)
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "11px");
    };

    // Add grid lines
    const gridGroup = g.append("g").attr("class", "grid");
    
    const updateGrid = (newXScale) => {
      gridGroup.selectAll("*").remove();
      
      // Vertical grid lines
      gridGroup.append("g")
        .attr("class", "grid-x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(newXScale)
          .tickSize(-height)
          .tickFormat("")
          .ticks(8)
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

      // Horizontal grid lines
      gridGroup.append("g")
        .attr("class", "grid-y")
        .call(d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat("")
          .ticks(8)
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);
    };

    // Chart content group
    const chartGroup = g.append("g").attr("class", "chart-content");

    // Function to update chart content
    const updateChart = (newXScale) => {
      chartGroup.selectAll("*").remove();

      // Filter data based on current zoom level
      const [x0, x1] = newXScale.domain();
      const visibleData = validData.filter(d => d.timestamp >= x0 && d.timestamp <= x1);

      if (visibleData.length === 0) return;

      // Tooltip
      const tooltip = d3.select("body").selectAll(".d3-tooltip")
        .data([null])
        .join("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");

      // Render different chart types
      switch (chartType) {
        case 'area':
          const area = d3.area()
            .x(d => newXScale(d.timestamp))
            .y0(height)
            .y1(d => yScale(d[selectedMetric]))
            .curve(d3.curveMonotoneX);

          chartGroup.append("path")
            .datum(visibleData)
            .attr("fill", colors[selectedMetric])
            .attr("fill-opacity", 0.6)
            .attr("stroke", colors[selectedMetric])
            .attr("stroke-width", 2)
            .attr("d", area);
          break;

        case 'bar':
          const barWidth = Math.min(width / visibleData.length * 0.8, 20);
          
          chartGroup.selectAll(".bar")
            .data(visibleData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => newXScale(d.timestamp) - barWidth/2)
            .attr("width", barWidth)
            .attr("y", d => yScale(d[selectedMetric]))
            .attr("height", d => height - yScale(d[selectedMetric]))
            .attr("fill", d => getMetricColor(d))
            .attr("opacity", 0.8)
            .on("mouseover", function(event, d) {
              tooltip.style("visibility", "visible")
                .html(`
                  <div><strong>${metrics[selectedMetric].label}: ${d[selectedMetric]}${metrics[selectedMetric].unit}</strong></div>
                  <div>Time: ${d.dateTime}</div>
                  ${selectedMetric === 'aqi' ? `<div>Category: ${getAQICategory(d.aqi).category}</div>` : ''}
                `);
            })
            .on("mousemove", function(event) {
              tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
              tooltip.style("visibility", "hidden");
            });
          break;

        case 'scatter':
          chartGroup.selectAll(".dot")
            .data(visibleData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => newXScale(d.timestamp))
            .attr("cy", d => yScale(d[selectedMetric]))
            .attr("r", 4)
            .attr("fill", d => getMetricColor(d))
            .attr("opacity", 0.8)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
              tooltip.style("visibility", "visible")
                .html(`
                  <div><strong>${metrics[selectedMetric].label}: ${d[selectedMetric]}${metrics[selectedMetric].unit}</strong></div>
                  <div>Time: ${d.dateTime}</div>
                  ${selectedMetric === 'aqi' ? `<div>Category: ${getAQICategory(d.aqi).category}</div>` : ''}
                `);
            })
            .on("mousemove", function(event) {
              tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
              tooltip.style("visibility", "hidden");
            });
          break;

        default: // line chart
          const line = d3.line()
            .x(d => newXScale(d.timestamp))
            .y(d => yScale(d[selectedMetric]))
            .curve(d3.curveMonotoneX);

          chartGroup.append("path")
            .datum(visibleData)
            .attr("fill", "none")
            .attr("stroke", colors[selectedMetric])
            .attr("stroke-width", 2)
            .attr("d", line);

          // Add dots
          chartGroup.selectAll(".dot")
            .data(visibleData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => newXScale(d.timestamp))
            .attr("cy", d => yScale(d[selectedMetric]))
            .attr("r", 3)
            .attr("fill", d => getMetricColor(d))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
              tooltip.style("visibility", "visible")
                .html(`
                  <div><strong>${metrics[selectedMetric].label}: ${d[selectedMetric]}${metrics[selectedMetric].unit}</strong></div>
                  <div>Time: ${d.dateTime}</div>
                  ${selectedMetric === 'aqi' ? `<div>Category: ${getAQICategory(d.aqi).category}</div>` : ''}
                `);
            })
            .on("mousemove", function(event) {
              tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
              tooltip.style("visibility", "hidden");
            });
          break;
      }
    };

    // Initial render
    updateAxes(xScale);
    updateGrid(xScale);
    updateChart(xScale);

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(metrics[selectedMetric].label + (metrics[selectedMetric].unit ? ` (${metrics[selectedMetric].unit})` : ''));

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text("Time");

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 50])
      .extent([[0, 0], [width, height]])
      .on("zoom", function(event) {
        const newXScale = event.transform.rescaleX(xScale);
        
        // Update axes and grid with smooth transitions
        updateAxes(newXScale);
        updateGrid(newXScale);
        updateChart(newXScale);
      });

    // Add zoom rectangle
    const zoomRect = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(zoom);

    // Add reset zoom button
    const resetButton = svg.append("g")
      .attr("class", "reset-button")
      .attr("transform", `translate(${width + margin.left - 80}, ${margin.top + 10})`)
      .style("cursor", "pointer");

    resetButton.append("rect")
      .attr("width", 70)
      .attr("height", 25)
      .attr("rx", 3)
      .style("fill", "#f3f4f6")
      .style("stroke", "#d1d5db");

    resetButton.append("text")
      .attr("x", 35)
      .attr("y", 17)
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#374151")
      .text("Reset Zoom");

    resetButton.on("click", function() {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    });

    // Get AQI category and color
    const getAQICategory = (aqi) => {
      if (aqi <= 50) return { category: 'Good', color: '#00E400' };
      if (aqi <= 100) return { category: 'Moderate', color: '#FFFF00' };
      if (aqi <= 150) return { category: 'Unhealthy for Sensitive', color: '#FF7E00' };
      if (aqi <= 200) return { category: 'Unhealthy', color: '#FF0000' };
      if (aqi <= 300) return { category: 'Very Unhealthy', color: '#8F3F97' };
      return { category: 'Hazardous', color: '#7E0023' };
    };

    // Cleanup
    return () => {
      d3.selectAll(".d3-tooltip").remove();
    };

  }, [filteredData, selectedMetric, chartType]);

  const metrics = {
    aqi: { label: 'Air Quality Index', unit: '', color: '#8884d8', icon: Activity },
    temp: { label: 'Temperature', unit: '°C', color: '#82ca9d', icon: Thermometer },
    hum: { label: 'Humidity', unit: '%', color: '#ffc658', icon: Droplets },
    co2: { label: 'CO2', unit: 'ppm', color: '#ff7300', icon: Wind },
    pm25: { label: 'PM2.5', unit: 'μg/m³', color: '#8dd1e1', icon: Wind }
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return { category: 'Good', color: '#00E400' };
    if (aqi <= 100) return { category: 'Moderate', color: '#FFFF00' };
    if (aqi <= 150) return { category: 'Unhealthy for Sensitive', color: '#FF7E00' };
    if (aqi <= 200) return { category: 'Unhealthy', color: '#FF0000' };
    if (aqi <= 300) return { category: 'Very Unhealthy', color: '#8F3F97' };
    return { category: 'Hazardous', color: '#7E0023' };
  };

  const currentAQI = stats.current && selectedMetric === 'aqi' ? getAQICategory(stats.current) : null;

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '24px', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
        padding: '24px' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              margin: 0 
            }}>Previous Charts</h1>
          </div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          {/* Metric Selection */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>Metric</label>
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {Object.entries(metrics).map(([key, metric]) => (
                <option key={key} value={key}>{metric.label}</option>
              ))}
            </select>
          </div>

          {/* Chart Type */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>Chart Type</label>
            <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>Time Range</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="30d">Current Month</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats.current != null && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              backgroundColor: '#dcfce7', 
              padding: '16px', 
              borderRadius: '8px', 
              border: '1px solid #bbf7d0' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#16a34a' }}>Average</div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#15803d' 
                  }}>{stats.average}{metrics[selectedMetric].unit}</div>
                </div>
                <TrendingUp style={{ width: '32px', height: '32px', color: '#16a34a' }} />
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#fee2e2', 
              padding: '16px', 
              borderRadius: '8px', 
              border: '1px solid #fecaca' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#dc2626' }}>Maximum</div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#b91c1c' 
                  }}>{stats.max}{metrics[selectedMetric].unit}</div>
                </div>
                <TrendingUp style={{ width: '32px', height: '32px', color: '#dc2626' }} />
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#fef3c7', 
              padding: '16px', 
              borderRadius: '8px', 
              border: '1px solid #fde68a' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#d97706' }}>Minimum</div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#b45309' 
                  }}>{stats.min}{metrics[selectedMetric].unit}</div>
                </div>
                <TrendingUp style={{ width: '32px', height: '32px', color: '#d97706' }} />
              </div>
            </div>
          </div>
        )}

        {/* Interactive Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937',
              margin: 0 
            }}>
              {metrics[selectedMetric].label} Over Time
            </h2>
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              fontStyle: 'italic' 
            }}>
              Drag to pan • Scroll to zoom • Click Reset Zoom to return
            </div>
          </div>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg ref={svgRef} width="800" height="400" style={{ width: '100%', height: 'auto' }}></svg>
          </div>
        </div>

        {/* Data Summary */}
        <div style={{ 
          marginTop: '24px', 
          backgroundColor: '#f9fafb', 
          padding: '16px', 
          borderRadius: '8px' 
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            fontSize: '14px' 
          }}>
            <div>
              <span style={{ fontWeight: '500', color: '#374151' }}>Date Range:</span>
              <span style={{ marginLeft: '8px', color: '#111827' }}>
                {filteredData.length > 0 ? 
                  `${filteredData[0].date} - ${filteredData[filteredData.length - 1].date}` : 
                  'No data'
                }
              </span>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: '#374151' }}>Latest Reading:</span>
              <span style={{ marginLeft: '8px', color: '#111827' }}>
                {filteredData.length > 0 ? filteredData[filteredData.length - 1].dateTime : 'No data'}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: '#374151' }}>Trend:</span>
              <span style={{ 
                marginLeft: '8px', 
                color: stats.trend === 'up' ? '#dc2626' : stats.trend === 'down' ? '#16a34a' : '#6b7280'
              }}>
                {stats.trend === 'up' ? '↗ Rising' : stats.trend === 'down' ? '↘ Falling' : '→ Stable'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage component with sample data



// Example usage component with sample data
const App = () => {
  // Extended sample data for demonstration
  const airQualityData = 
  {
  "2025_08_16": {
    "23_57_27": {
      "aqi": 64,
      "co2": 576,
      "createdAt": "2025-08-16 23:57:27",
      "hum": 81.3,
      "no2": 0,
      "pm1": 3,
      "pm10": 16,
      "pm25": 8,
      "temp": 29,
      "voc": 0
    },
    "23_59_31": {
      "aqi": 66,
      "co2": 592,
      "createdAt": "2025-08-16 23:59:31",
      "hum": 81,
      "no2": 0,
      "pm1": 3,
      "pm10": 16,
      "pm25": 8,
      "temp": 29.0625,
      "voc": 0
    }
  },
  "2025_08_17": {
    "10_26_21": {
      "aqi": 58,
      "co2": 497,
      "createdAt": "2025_08_17_10_26_21",
      "hum": 84.2,
      "no2": 0,
      "pm1": 3,
      "pm10": 17,
      "pm25": 9,
      "temp": 27.625,
      "voc": 0
    },
    "12_06_29": {
      "aqi": 8,
      "co2": 0,
      "createdAt": "2025_08_17_12_06_29",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 3,
      "pm25": 2,
      "temp": 30,
      "voc": 0
    },
    "12_08_31": {
      "aqi": 8,
      "co2": 0,
      "createdAt": "2025_08_17_12_08_31",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 3,
      "pm25": 2,
      "temp": 29.875,
      "voc": 0
    },
    "12_10_34": {
      "aqi": 8,
      "co2": 0,
      "createdAt": "2025_08_17_12_10_34",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 2,
      "pm25": 2,
      "temp": 29.9375,
      "voc": 0
    },
    "12_12_40": {
      "aqi": 8,
      "co2": 0,
      "createdAt": "2025_08_17_12_12_40",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 3,
      "pm25": 2,
      "temp": 29.75,
      "voc": 0
    },
    "12_18_20": {
      "aqi": 69,
      "co2": 637,
      "createdAt": "2025_08_17_12_18_20",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 2,
      "temp": 30.3125,
      "voc": 0
    },
    "12_22_24": {
      "aqi": 71,
      "co2": 654,
      "createdAt": "2025_08_17_12_22_24",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 30.9375,
      "voc": 0
    },
    "12_24_27": {
      "aqi": 65,
      "co2": 580,
      "createdAt": "2025_08_17_12_24_27",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 30.375,
      "voc": 0
    },
    "12_26_29": {
      "aqi": 69,
      "co2": 630,
      "createdAt": "2025_08_17_12_26_29",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 30.8125,
      "voc": 0
    },
    "12_28_36": {
      "aqi": 66,
      "co2": 596,
      "createdAt": "2025_08_17_12_28_36",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 31.125,
      "voc": 0
    },
    "12_30_38": {
      "aqi": 66,
      "co2": 593,
      "createdAt": "2025_08_17_12_30_38",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 31.5,
      "voc": 0
    },
    "12_32_45": {
      "aqi": 63,
      "co2": 567,
      "createdAt": "2025_08_17_12_32_45",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 31.625,
      "voc": 0
    },
    "12_34_47": {
      "aqi": 65,
      "co2": 586,
      "createdAt": "2025_08_17_12_34_47",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 30.6875,
      "voc": 0
    },
    "12_36_54": {
      "aqi": 64,
      "co2": 575,
      "createdAt": "2025_08_17_12_36_54",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 31.75,
      "voc": 0
    },
    "12_38_56": {
      "aqi": 68,
      "co2": 623,
      "createdAt": "2025_08_17_12_38_56",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 33.625,
      "voc": 0
    },
    "12_41_03": {
      "aqi": 68,
      "co2": 624,
      "createdAt": "2025_08_17_12_41_03",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 32.6875,
      "voc": 0
    },
    "12_43_05": {
      "aqi": 76,
      "co2": 714,
      "createdAt": "2025_08_17_12_43_05",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 32.5625,
      "voc": 0
    },
    "12_45_12": {
      "aqi": 67,
      "co2": 612,
      "createdAt": "2025_08_17_12_45_12",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 31.6875,
      "voc": 0
    },
    "12_47_15": {
      "aqi": 67,
      "co2": 609,
      "createdAt": "2025_08_17_12_47_15",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 31.3125,
      "voc": 0
    },
    "12_49_21": {
      "aqi": 66,
      "co2": 595,
      "createdAt": "2025_08_17_12_49_21",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 31,
      "voc": 0
    },
    "12_51_24": {
      "aqi": 65,
      "co2": 583,
      "createdAt": "2025_08_17_12_51_24",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 31.0625,
      "voc": 0
    },
    "12_53_31": {
      "aqi": 65,
      "co2": 588,
      "createdAt": "2025_08_17_12_53_31",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 32.1875,
      "voc": 0
    },
    "12_55_33": {
      "aqi": 70,
      "co2": 646,
      "createdAt": "2025_08_17_12_55_33",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 3,
      "temp": 33.3125,
      "voc": 0
    },
    "12_57_40": {
      "aqi": 67,
      "co2": 606,
      "createdAt": "2025_08_17_12_57_40",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 3,
      "temp": 33.6875,
      "voc": 0
    },
    "14_45_09": {
      "aqi": 60,
      "co2": 526,
      "createdAt": "2025_08_17_14_45_09",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 5,
      "temp": 32,
      "voc": 0
    },
    "14_47_12": {
      "aqi": 61,
      "co2": 542,
      "createdAt": "2025_08_17_14_47_12",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 5,
      "temp": 32.625,
      "voc": 0
    },
    "14_49_14": {
      "aqi": 63,
      "co2": 557,
      "createdAt": "2025_08_17_14_49_14",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 5,
      "temp": 33,
      "voc": 0
    },
    "14_51_21": {
      "aqi": 60,
      "co2": 527,
      "createdAt": "2025_08_17_14_51_21",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 4,
      "temp": 33.125,
      "voc": 0
    },
    "14_53_24": {
      "aqi": 60,
      "co2": 521,
      "createdAt": "2025_08_17_14_53_24",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 4,
      "temp": 33.0625,
      "voc": 0
    },
    "14_55_31": {
      "aqi": 59,
      "co2": 512,
      "createdAt": "2025_08_17_14_55_31",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 4,
      "temp": 33.4375,
      "voc": 0
    },
    "14_57_33": {
      "aqi": 60,
      "co2": 525,
      "createdAt": "2025_08_17_14_57_33",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 4,
      "temp": 33.25,
      "voc": 0
    },
    "14_59_40": {
      "aqi": 58,
      "co2": 504,
      "createdAt": "2025_08_17_14_59_40",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 4,
      "temp": 32.875,
      "voc": 0
    },
    "15_01_43": {
      "aqi": 59,
      "co2": 516,
      "createdAt": "2025_08_17_15_01_43",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 12,
      "pm25": 4,
      "temp": 33,
      "voc": 0
    },
    "15_03_50": {
      "aqi": 60,
      "co2": 527,
      "createdAt": "2025_08_17_15_03_50",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 4,
      "temp": 32.875,
      "voc": 0
    },
    "15_05_53": {
      "aqi": 58,
      "co2": 498,
      "createdAt": "2025_08_17_15_05_53",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 4,
      "temp": 33.25,
      "voc": 0
    },
    "15_08_00": {
      "aqi": 56,
      "co2": 482,
      "createdAt": "2025_08_17_15_08_00",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 4,
      "temp": 32.4375,
      "voc": 0
    },
    "15_10_02": {
      "aqi": 59,
      "co2": 512,
      "createdAt": "2025_08_17_15_10_02",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 4,
      "temp": 32.5,
      "voc": 0
    },
    "15_12_09": {
      "aqi": 56,
      "co2": 473,
      "createdAt": "2025_08_17_15_12_09",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 4,
      "temp": 32.25,
      "voc": 0
    },
    "15_14_12": {
      "aqi": 56,
      "co2": 482,
      "createdAt": "2025_08_17_15_14_12",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 32.1875,
      "voc": 0
    },
    "15_16_19": {
      "aqi": 59,
      "co2": 519,
      "createdAt": "2025_08_17_15_16_19",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 32.25,
      "voc": 0
    },
    "15_18_22": {
      "aqi": 59,
      "co2": 515,
      "createdAt": "2025_08_17_15_18_22",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 32.1875,
      "voc": 0
    },
    "15_20_29": {
      "aqi": 59,
      "co2": 514,
      "createdAt": "2025_08_17_15_20_29",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 32.125,
      "voc": 0
    },
    "15_22_32": {
      "aqi": 58,
      "co2": 505,
      "createdAt": "2025_08_17_15_22_32",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 32.5625,
      "voc": 0
    },
    "15_24_39": {
      "aqi": 56,
      "co2": 476,
      "createdAt": "2025_08_17_15_24_39",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 32.375,
      "voc": 0
    },
    "15_26_42": {
      "aqi": 58,
      "co2": 499,
      "createdAt": "2025_08_17_15_26_42",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 32.3125,
      "voc": 0
    },
    "15_28_49": {
      "aqi": 58,
      "co2": 507,
      "createdAt": "2025_08_17_15_28_49",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 32.375,
      "voc": 0
    },
    "15_30_58": {
      "aqi": 61,
      "co2": 536,
      "createdAt": "2025_08_17_15_30_58",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 32.625,
      "voc": 0
    },
    "15_33_05": {
      "aqi": 61,
      "co2": 538,
      "createdAt": "2025_08_17_15_33_05",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 32.75,
      "voc": 0
    },
    "15_35_08": {
      "aqi": 60,
      "co2": 529,
      "createdAt": "2025_08_17_15_35_08",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 3,
      "temp": 32.1875,
      "voc": 0
    },
    "15_37_14": {
      "aqi": 61,
      "co2": 539,
      "createdAt": "2025_08_17_15_37_14",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 3,
      "temp": 32.1875,
      "voc": 0
    },
    "17_41_53": {
      "aqi": 99,
      "co2": 560,
      "createdAt": "2025_08_17_17_41_53",
      "hum": 0,
      "no2": 0,
      "pm1": 23,
      "pm10": 52,
      "pm25": 35,
      "temp": 30.0625,
      "voc": 0
    },
    "17_43_55": {
      "aqi": 102,
      "co2": 555,
      "createdAt": "2025_08_17_17_43_55",
      "hum": 0,
      "no2": 0,
      "pm1": 23,
      "pm10": 52,
      "pm25": 36,
      "temp": 30.625,
      "voc": 0
    },
    "17_45_59": {
      "aqi": 102,
      "co2": 530,
      "createdAt": "2025_08_17_17_45_59",
      "hum": 0,
      "no2": 0,
      "pm1": 23,
      "pm10": 52,
      "pm25": 36,
      "temp": 30.8125,
      "voc": 0
    },
    "17_48_07": {
      "aqi": 104,
      "co2": 525,
      "createdAt": "2025_08_17_17_48_07",
      "hum": 50,
      "no2": 0,
      "pm1": 23,
      "pm10": 52,
      "pm25": 37,
      "temp": 31.4375,
      "voc": 0
    },
    "17_53_03": {
      "aqi": 126,
      "co2": 488,
      "createdAt": "2025_08_17_17_53_03",
      "hum": 50,
      "no2": 0,
      "pm1": 31,
      "pm10": 57,
      "pm25": 46,
      "temp": 30.9375,
      "voc": 0
    },
    "17_55_07": {
      "aqi": 124,
      "co2": 463,
      "createdAt": "2025_08_17_17_55_07",
      "hum": 50,
      "no2": 0,
      "pm1": 31,
      "pm10": 57,
      "pm25": 45,
      "temp": 31.375,
      "voc": 0
    },
    "17_57_11": {
      "aqi": 124,
      "co2": 493,
      "createdAt": "2025_08_17_17_57_11",
      "hum": 50,
      "no2": 0,
      "pm1": 31,
      "pm10": 57,
      "pm25": 45,
      "temp": 31.625,
      "voc": 0
    },
    "18_00_28": {
      "aqi": 129,
      "co2": 484,
      "createdAt": "2025_08_17_18_00_28",
      "hum": 50,
      "no2": 0,
      "pm1": 32,
      "pm10": 59,
      "pm25": 47,
      "temp": 31.5,
      "voc": 0
    },
    "18_02_35": {
      "aqi": 129,
      "co2": 480,
      "createdAt": "2025_08_17_18_02_35",
      "hum": 50,
      "no2": 0,
      "pm1": 32,
      "pm10": 59,
      "pm25": 47,
      "temp": 30.9375,
      "voc": 0
    },
    "18_04_40": {
      "aqi": 129,
      "co2": 495,
      "createdAt": "2025_08_17_18_04_40",
      "hum": 50,
      "no2": 0,
      "pm1": 31,
      "pm10": 59,
      "pm25": 47,
      "temp": 31.4375,
      "voc": 0
    },
    "18_06_48": {
      "aqi": 131,
      "co2": 480,
      "createdAt": "2025_08_17_18_06_48",
      "hum": 50,
      "no2": 0,
      "pm1": 33,
      "pm10": 63,
      "pm25": 48,
      "temp": 31.1875,
      "voc": 0
    },
    "18_08_52": {
      "aqi": 131,
      "co2": 493,
      "createdAt": "2025_08_17_18_08_52",
      "hum": 50,
      "no2": 0,
      "pm1": 33,
      "pm10": 62,
      "pm25": 48,
      "temp": 31,
      "voc": 0
    },
    "18_11_00": {
      "aqi": 131,
      "co2": 473,
      "createdAt": "2025_08_17_18_11_00",
      "hum": 50,
      "no2": 0,
      "pm1": 33,
      "pm10": 62,
      "pm25": 48,
      "temp": 31.5,
      "voc": 0
    },
    "18_13_05": {
      "aqi": 88,
      "co2": 494,
      "createdAt": "2025_08_17_18_13_05",
      "hum": 50,
      "no2": 0,
      "pm1": 20,
      "pm10": 32,
      "pm25": 30,
      "temp": 30.9375,
      "voc": 0
    },
    "18_15_12": {
      "aqi": 88,
      "co2": 477,
      "createdAt": "2025_08_17_18_15_12",
      "hum": 50,
      "no2": 0,
      "pm1": 20,
      "pm10": 33,
      "pm25": 30,
      "temp": 31.25,
      "voc": 0
    },
    "18_17_15": {
      "aqi": 88,
      "co2": 456,
      "createdAt": "2025_08_17_18_17_15",
      "hum": 50,
      "no2": 0,
      "pm1": 20,
      "pm10": 33,
      "pm25": 30,
      "temp": 31.1875,
      "voc": 0
    },
    "18_19_21": {
      "aqi": 88,
      "co2": 496,
      "createdAt": "2025_08_17_18_19_21",
      "hum": 50,
      "no2": 0,
      "pm1": 20,
      "pm10": 33,
      "pm25": 30,
      "temp": 31.3125,
      "voc": 0
    },
    "18_21_23": {
      "aqi": 88,
      "co2": 474,
      "createdAt": "2025_08_17_18_21_23",
      "hum": 50,
      "no2": 0,
      "pm1": 20,
      "pm10": 34,
      "pm25": 30,
      "temp": 31.625,
      "voc": 0
    },
    "18_23_30": {
      "aqi": 88,
      "co2": 490,
      "createdAt": "2025_08_17_18_23_30",
      "hum": 50,
      "no2": 0,
      "pm1": 20,
      "pm10": 34,
      "pm25": 30,
      "temp": 31.625,
      "voc": 0
    },
    "18_25_32": {
      "aqi": 88,
      "co2": 476,
      "createdAt": "2025_08_17_18_25_32",
      "hum": 50,
      "no2": 0,
      "pm1": 19,
      "pm10": 34,
      "pm25": 30,
      "temp": 31.625,
      "voc": 0
    },
    "18_27_38": {
      "aqi": 88,
      "co2": 495,
      "createdAt": "2025_08_17_18_27_38",
      "hum": 50,
      "no2": 0,
      "pm1": 19,
      "pm10": 34,
      "pm25": 30,
      "temp": 31.4375,
      "voc": 0
    },
    "18_29_42": {
      "aqi": 88,
      "co2": 426,
      "createdAt": "2025_08_17_18_29_42",
      "hum": 50,
      "no2": 0,
      "pm1": 19,
      "pm10": 34,
      "pm25": 30,
      "temp": 31.4375,
      "voc": 0
    },
    "18_31_48": {
      "aqi": 69,
      "co2": 450,
      "createdAt": "2025_08_17_18_31_48",
      "hum": 50,
      "no2": 0,
      "pm1": 10,
      "pm10": 27,
      "pm25": 21,
      "temp": 31.375,
      "voc": 0
    },
    "18_33_51": {
      "aqi": 67,
      "co2": 456,
      "createdAt": "2025_08_17_18_33_51",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 27,
      "pm25": 20,
      "temp": 31.875,
      "voc": 0
    },
    "18_35_57": {
      "aqi": 67,
      "co2": 464,
      "createdAt": "2025_08_17_18_35_57",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 27,
      "pm25": 20,
      "temp": 32.0625,
      "voc": 0
    },
    "18_38_01": {
      "aqi": 67,
      "co2": 480,
      "createdAt": "2025_08_17_18_38_01",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 26,
      "pm25": 20,
      "temp": 32.0625,
      "voc": 0
    },
    "18_40_07": {
      "aqi": 67,
      "co2": 481,
      "createdAt": "2025_08_17_18_40_07",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 26,
      "pm25": 20,
      "temp": 32,
      "voc": 0
    },
    "18_42_10": {
      "aqi": 69,
      "co2": 471,
      "createdAt": "2025_08_17_18_42_10",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 27,
      "pm25": 21,
      "temp": 32.125,
      "voc": 0
    },
    "18_44_16": {
      "aqi": 69,
      "co2": 456,
      "createdAt": "2025_08_17_18_44_16",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 27,
      "pm25": 21,
      "temp": 32.5,
      "voc": 0
    },
    "18_46_19": {
      "aqi": 69,
      "co2": 462,
      "createdAt": "2025_08_17_18_46_19",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 27,
      "pm25": 21,
      "temp": 32.25,
      "voc": 0
    },
    "19_26_07": {
      "aqi": 94,
      "co2": 511,
      "createdAt": "2025_08_17_19_26_07",
      "hum": 50,
      "no2": 0,
      "pm1": 22,
      "pm10": 40,
      "pm25": 33,
      "temp": 30.6875,
      "voc": 0
    },
    "19_28_10": {
      "aqi": 94,
      "co2": 470,
      "createdAt": "2025_08_17_19_28_10",
      "hum": 50,
      "no2": 0,
      "pm1": 22,
      "pm10": 40,
      "pm25": 33,
      "temp": 30.8125,
      "voc": 0
    },
    "19_30_12": {
      "aqi": 94,
      "co2": 462,
      "createdAt": "2025_08_17_19_30_12",
      "hum": 50,
      "no2": 0,
      "pm1": 22,
      "pm10": 40,
      "pm25": 33,
      "temp": 30.6875,
      "voc": 0
    },
    "19_32_19": {
      "aqi": 102,
      "co2": 474,
      "createdAt": "2025_08_17_19_32_19",
      "hum": 50,
      "no2": 0,
      "pm1": 24,
      "pm10": 43,
      "pm25": 36,
      "temp": 30.75,
      "voc": 0
    },
    "19_34_23": {
      "aqi": 102,
      "co2": 465,
      "createdAt": "2025_08_17_19_34_23",
      "hum": 50,
      "no2": 0,
      "pm1": 24,
      "pm10": 43,
      "pm25": 36,
      "temp": 30.75,
      "voc": 0
    },
    "19_36_31": {
      "aqi": 102,
      "co2": 466,
      "createdAt": "2025_08_17_19_36_31",
      "hum": 50,
      "no2": 0,
      "pm1": 24,
      "pm10": 44,
      "pm25": 36,
      "temp": 30.5625,
      "voc": 0
    },
    "19_38_35": {
      "aqi": 107,
      "co2": 478,
      "createdAt": "2025_08_17_19_38_35",
      "hum": 50,
      "no2": 0,
      "pm1": 25,
      "pm10": 46,
      "pm25": 38,
      "temp": 30.75,
      "voc": 0
    },
    "21_26_25": {
      "aqi": 53,
      "co2": 439,
      "createdAt": "2025_08_17_21_26_25",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 14,
      "pm25": 12,
      "temp": 30.5,
      "voc": 0
    },
    "21_28_27": {
      "aqi": 56,
      "co2": 476,
      "createdAt": "2025_08_17_21_28_27",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 15,
      "pm25": 12,
      "temp": 30.625,
      "voc": 0
    },
    "21_30_30": {
      "aqi": 54,
      "co2": 457,
      "createdAt": "2025_08_17_21_30_30",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 15,
      "pm25": 12,
      "temp": 30.5,
      "voc": 0
    },
    "21_32_36": {
      "aqi": 55,
      "co2": 467,
      "createdAt": "2025_08_17_21_32_36",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 16,
      "pm25": 13,
      "temp": 30.6875,
      "voc": 0
    },
    "21_34_39": {
      "aqi": 58,
      "co2": 496,
      "createdAt": "2025_08_17_21_34_39",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 16,
      "pm25": 13,
      "temp": 30.4375,
      "voc": 0
    },
    "21_36_46": {
      "aqi": 57,
      "co2": 489,
      "createdAt": "2025_08_17_21_36_46",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 16,
      "pm25": 13,
      "temp": 30.5,
      "voc": 0
    },
    "21_38_48": {
      "aqi": 57,
      "co2": 492,
      "createdAt": "2025_08_17_21_38_48",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 17,
      "pm25": 14,
      "temp": 30.4375,
      "voc": 0
    },
    "21_40_55": {
      "aqi": 58,
      "co2": 501,
      "createdAt": "2025_08_17_21_40_55",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 17,
      "pm25": 14,
      "temp": 30.625,
      "voc": 0
    },
    "21_42_58": {
      "aqi": 58,
      "co2": 502,
      "createdAt": "2025_08_17_21_42_58",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 17,
      "pm25": 14,
      "temp": 30.5625,
      "voc": 0
    },
    "21_45_04": {
      "aqi": 65,
      "co2": 521,
      "createdAt": "2025_08_17_21_45_04",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 21,
      "pm25": 19,
      "temp": 30.5625,
      "voc": 0
    },
    "21_47_07": {
      "aqi": 65,
      "co2": 499,
      "createdAt": "2025_08_17_21_47_07",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 21,
      "pm25": 19,
      "temp": 30.5625,
      "voc": 0
    },
    "21_49_14": {
      "aqi": 67,
      "co2": 493,
      "createdAt": "2025_08_17_21_49_14",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 22,
      "pm25": 20,
      "temp": 30.5,
      "voc": 0
    },
    "21_51_16": {
      "aqi": 67,
      "co2": 511,
      "createdAt": "2025_08_17_21_51_16",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 22,
      "pm25": 20,
      "temp": 30.5,
      "voc": 0
    },
    "21_53_23": {
      "aqi": 67,
      "co2": 527,
      "createdAt": "2025_08_17_21_53_23",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 22,
      "pm25": 20,
      "temp": 30.625,
      "voc": 0
    },
    "21_55_25": {
      "aqi": 67,
      "co2": 548,
      "createdAt": "2025_08_17_21_55_25",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 22,
      "pm25": 20,
      "temp": 30.5,
      "voc": 0
    },
    "21_57_32": {
      "aqi": 67,
      "co2": 517,
      "createdAt": "2025_08_17_21_57_32",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 23,
      "pm25": 20,
      "temp": 30.6875,
      "voc": 0
    },
    "21_59_35": {
      "aqi": 67,
      "co2": 492,
      "createdAt": "2025_08_17_21_59_35",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 23,
      "pm25": 20,
      "temp": 30.5625,
      "voc": 0
    },
    "22_01_41": {
      "aqi": 67,
      "co2": 514,
      "createdAt": "2025_08_17_22_01_41",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 23,
      "pm25": 20,
      "temp": 30.5,
      "voc": 0
    },
    "22_03_44": {
      "aqi": 84,
      "co2": 524,
      "createdAt": "2025_08_17_22_03_44",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 28,
      "temp": 30.5625,
      "voc": 0
    },
    "22_05_50": {
      "aqi": 84,
      "co2": 528,
      "createdAt": "2025_08_17_22_05_50",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 28,
      "temp": 30.5625,
      "voc": 0
    },
    "22_07_53": {
      "aqi": 86,
      "co2": 531,
      "createdAt": "2025_08_17_22_07_53",
      "hum": 50,
      "no2": 0,
      "pm1": 19,
      "pm10": 34,
      "pm25": 29,
      "temp": 30.6875,
      "voc": 0
    },
    "22_09_59": {
      "aqi": 86,
      "co2": 529,
      "createdAt": "2025_08_17_22_09_59",
      "hum": 50,
      "no2": 0,
      "pm1": 19,
      "pm10": 34,
      "pm25": 29,
      "temp": 30.6875,
      "voc": 0
    },
    "22_12_02": {
      "aqi": 86,
      "co2": 526,
      "createdAt": "2025_08_17_22_12_02",
      "hum": 50,
      "no2": 0,
      "pm1": 19,
      "pm10": 34,
      "pm25": 29,
      "temp": 30.5625,
      "voc": 0
    },
    "22_14_09": {
      "aqi": 86,
      "co2": 546,
      "createdAt": "2025_08_17_22_14_09",
      "hum": 50,
      "no2": 0,
      "pm1": 19,
      "pm10": 35,
      "pm25": 29,
      "temp": 30.5625,
      "voc": 0
    },
    "22_16_11": {
      "aqi": 86,
      "co2": 547,
      "createdAt": "2025_08_17_22_16_11",
      "hum": 50,
      "no2": 0,
      "pm1": 19,
      "pm10": 35,
      "pm25": 29,
      "temp": 30.8125,
      "voc": 0
    },
    "22_18_19": {
      "aqi": 86,
      "co2": 535,
      "createdAt": "2025_08_17_22_18_19",
      "hum": 50,
      "no2": 0,
      "pm1": 20,
      "pm10": 35,
      "pm25": 29,
      "temp": 30.8125,
      "voc": 0
    },
    "22_22_02": {
      "aqi": 78,
      "co2": 565,
      "createdAt": "2025_08_17_22_22_02",
      "hum": 50,
      "no2": 0,
      "pm1": 17,
      "pm10": 35,
      "pm25": 25,
      "temp": 30.8125,
      "voc": 0
    },
    "22_24_04": {
      "aqi": 78,
      "co2": 533,
      "createdAt": "2025_08_17_22_24_04",
      "hum": 50,
      "no2": 0,
      "pm1": 17,
      "pm10": 34,
      "pm25": 25,
      "temp": 30.8125,
      "voc": 0
    },
    "22_26_07": {
      "aqi": 78,
      "co2": 541,
      "createdAt": "2025_08_17_22_26_07",
      "hum": 50,
      "no2": 0,
      "pm1": 17,
      "pm10": 33,
      "pm25": 25,
      "temp": 30.9375,
      "voc": 0
    },
    "22_28_13": {
      "aqi": 82,
      "co2": 554,
      "createdAt": "2025_08_17_22_28_13",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 34,
      "pm25": 27,
      "temp": 30.9375,
      "voc": 0
    },
    "22_30_16": {
      "aqi": 82,
      "co2": 559,
      "createdAt": "2025_08_17_22_30_16",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 34,
      "pm25": 27,
      "temp": 30.9375,
      "voc": 0
    },
    "22_32_22": {
      "aqi": 82,
      "co2": 548,
      "createdAt": "2025_08_17_22_32_22",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 27,
      "temp": 30.875,
      "voc": 0
    },
    "22_34_25": {
      "aqi": 82,
      "co2": 555,
      "createdAt": "2025_08_17_22_34_25",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 34,
      "pm25": 27,
      "temp": 31,
      "voc": 0
    },
    "22_36_31": {
      "aqi": 82,
      "co2": 535,
      "createdAt": "2025_08_17_22_36_31",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 27,
      "temp": 31.0625,
      "voc": 0
    },
    "22_38_34": {
      "aqi": 82,
      "co2": 539,
      "createdAt": "2025_08_17_22_38_34",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 27,
      "temp": 32.5,
      "voc": 0
    },
    "22_40_40": {
      "aqi": 82,
      "co2": 523,
      "createdAt": "2025_08_17_22_40_40",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 27,
      "temp": 34,
      "voc": 0
    },
    "22_43_17": {
      "aqi": 82,
      "co2": 493,
      "createdAt": "2025_08_17_22_43_17",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 27,
      "temp": 34.5,
      "voc": 0
    },
    "22_45_23": {
      "aqi": 82,
      "co2": 509,
      "createdAt": "2025_08_17_22_45_23",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 27,
      "temp": 34.625,
      "voc": 0
    },
    "22_47_26": {
      "aqi": 80,
      "co2": 531,
      "createdAt": "2025_08_17_22_47_26",
      "hum": 50,
      "no2": 0,
      "pm1": 17,
      "pm10": 30,
      "pm25": 26,
      "temp": 34.625,
      "voc": 0
    },
    "22_49_32": {
      "aqi": 80,
      "co2": 503,
      "createdAt": "2025_08_17_22_49_32",
      "hum": 50,
      "no2": 0,
      "pm1": 17,
      "pm10": 30,
      "pm25": 26,
      "temp": 34.5625,
      "voc": 0
    },
    "22_51_35": {
      "aqi": 78,
      "co2": 488,
      "createdAt": "2025_08_17_22_51_35",
      "hum": 50,
      "no2": 0,
      "pm1": 17,
      "pm10": 30,
      "pm25": 25,
      "temp": 34.8125,
      "voc": 0
    },
    "22_53_42": {
      "aqi": 80,
      "co2": 516,
      "createdAt": "2025_08_17_22_53_42",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 26,
      "temp": 34.6875,
      "voc": 0
    },
    "22_55_44": {
      "aqi": 80,
      "co2": 507,
      "createdAt": "2025_08_17_22_55_44",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 26,
      "temp": 35.1875,
      "voc": 0
    },
    "22_57_52": {
      "aqi": 80,
      "co2": 508,
      "createdAt": "2025_08_17_22_57_52",
      "hum": 50,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 26,
      "temp": 34.875,
      "voc": 0
    },
    "22_59_55": {
      "aqi": 55,
      "co2": 468,
      "createdAt": "2025_08_17_22_59_55",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 11,
      "pm25": 9,
      "temp": 34.25,
      "voc": 0
    },
    "23_02_01": {
      "aqi": 55,
      "co2": 467,
      "createdAt": "2025_08_17_23_02_01",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 11,
      "pm25": 9,
      "temp": 34.75,
      "voc": 0
    },
    "23_04_04": {
      "aqi": 59,
      "co2": 516,
      "createdAt": "2025_08_17_23_04_04",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 9,
      "temp": 34.4375,
      "voc": 0
    },
    "23_06_11": {
      "aqi": 55,
      "co2": 466,
      "createdAt": "2025_08_17_23_06_11",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 11,
      "pm25": 9,
      "temp": 35.125,
      "voc": 0
    },
    "23_08_14": {
      "aqi": 56,
      "co2": 480,
      "createdAt": "2025_08_17_23_08_14",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 11,
      "pm25": 9,
      "temp": 35.5,
      "voc": 0
    },
    "23_10_22": {
      "aqi": 58,
      "co2": 506,
      "createdAt": "2025_08_17_23_10_22",
      "hum": 50,
      "no2": 0,
      "pm1": 6,
      "pm10": 11,
      "pm25": 9,
      "temp": 34.75,
      "voc": 0
    }
  },
  "2025_08_18": {
    "08_48_58": {
      "aqi": 59,
      "co2": 465,
      "createdAt": "2025_08_18_08_48_58",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 17,
      "pm25": 16,
      "temp": 30.875,
      "voc": 0
    },
    "08_51_00": {
      "aqi": 59,
      "co2": 442,
      "createdAt": "2025_08_18_08_51_00",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 17,
      "pm25": 16,
      "temp": 30.875,
      "voc": 0
    },
    "08_53_03": {
      "aqi": 59,
      "co2": 475,
      "createdAt": "2025_08_18_08_53_03",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 17,
      "pm25": 16,
      "temp": 30.75,
      "voc": 0
    },
    "08_55_10": {
      "aqi": 61,
      "co2": 481,
      "createdAt": "2025_08_18_08_55_10",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 18,
      "pm25": 17,
      "temp": 30.75,
      "voc": 0
    },
    "08_57_13": {
      "aqi": 61,
      "co2": 468,
      "createdAt": "2025_08_18_08_57_13",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 18,
      "pm25": 17,
      "temp": 30.875,
      "voc": 0
    },
    "08_59_20": {
      "aqi": 61,
      "co2": 456,
      "createdAt": "2025_08_18_08_59_20",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 18,
      "pm25": 17,
      "temp": 30.75,
      "voc": 0
    },
    "09_01_23": {
      "aqi": 63,
      "co2": 444,
      "createdAt": "2025_08_18_09_01_23",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 20,
      "pm25": 18,
      "temp": 30.8125,
      "voc": 0
    },
    "09_03_29": {
      "aqi": 63,
      "co2": 459,
      "createdAt": "2025_08_18_09_03_29",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 20,
      "pm25": 18,
      "temp": 30.75,
      "voc": 0
    },
    "09_05_32": {
      "aqi": 63,
      "co2": 452,
      "createdAt": "2025_08_18_09_05_32",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 20,
      "pm25": 18,
      "temp": 31,
      "voc": 0
    },
    "09_07_39": {
      "aqi": 59,
      "co2": 456,
      "createdAt": "2025_08_18_09_07_39",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 18,
      "pm25": 16,
      "temp": 31,
      "voc": 0
    },
    "09_09_42": {
      "aqi": 57,
      "co2": 469,
      "createdAt": "2025_08_18_09_09_42",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 17,
      "pm25": 15,
      "temp": 31.3125,
      "voc": 0
    },
    "09_11_48": {
      "aqi": 57,
      "co2": 473,
      "createdAt": "2025_08_18_09_11_48",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 17,
      "pm25": 15,
      "temp": 31.125,
      "voc": 0
    },
    "09_13_51": {
      "aqi": 57,
      "co2": 457,
      "createdAt": "2025_08_18_09_13_51",
      "hum": 6137.5,
      "no2": 0,
      "pm1": 7,
      "pm10": 17,
      "pm25": 15,
      "temp": 31.0625,
      "voc": 0
    },
    "09_15_59": {
      "aqi": 59,
      "co2": 449,
      "createdAt": "2025_08_18_09_15_59",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 18,
      "pm25": 16,
      "temp": 31.3125,
      "voc": 0
    },
    "09_18_02": {
      "aqi": 61,
      "co2": 433,
      "createdAt": "2025_08_18_09_18_02",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 18,
      "pm25": 17,
      "temp": 31.1875,
      "voc": 0
    },
    "09_20_08": {
      "aqi": 61,
      "co2": 442,
      "createdAt": "2025_08_18_09_20_08",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 18,
      "pm25": 17,
      "temp": 31.25,
      "voc": 0
    },
    "09_22_11": {
      "aqi": 59,
      "co2": 462,
      "createdAt": "2025_08_18_09_22_11",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 17,
      "pm25": 16,
      "temp": 31.3125,
      "voc": 0
    },
    "09_24_18": {
      "aqi": 87,
      "co2": 852,
      "createdAt": "2025_08_18_09_24_18",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 17,
      "pm25": 16,
      "temp": 31.25,
      "voc": 0
    },
    "09_26_20": {
      "aqi": 66,
      "co2": 598,
      "createdAt": "2025_08_18_09_26_20",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 8,
      "pm25": 7,
      "temp": 31.1875,
      "voc": 0
    },
    "09_28_27": {
      "aqi": 59,
      "co2": 514,
      "createdAt": "2025_08_18_09_28_27",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 8,
      "pm25": 8,
      "temp": 31.0625,
      "voc": 0
    },
    "09_30_30": {
      "aqi": 56,
      "co2": 477,
      "createdAt": "2025_08_18_09_30_30",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 9,
      "pm25": 9,
      "temp": 31,
      "voc": 0
    },
    "09_32_46": {
      "aqi": 53,
      "co2": 444,
      "createdAt": "2025_08_18_09_32_46",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.3125,
      "voc": 0
    },
    "09_34_49": {
      "aqi": 55,
      "co2": 471,
      "createdAt": "2025_08_18_09_34_49",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.1875,
      "voc": 0
    },
    "09_36_57": {
      "aqi": 56,
      "co2": 481,
      "createdAt": "2025_08_18_09_36_57",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 8,
      "pm25": 8,
      "temp": 31.5,
      "voc": 0
    },
    "09_39_01": {
      "aqi": 58,
      "co2": 497,
      "createdAt": "2025_08_18_09_39_01",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 8,
      "temp": 31.4375,
      "voc": 0
    },
    "09_41_10": {
      "aqi": 56,
      "co2": 475,
      "createdAt": "2025_08_18_09_41_10",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 8,
      "temp": 32.1875,
      "voc": 0
    },
    "10_07_30": {
      "aqi": 53,
      "co2": 443,
      "createdAt": "2025_08_18_10_07_30",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 8,
      "temp": 32.25,
      "voc": 0
    },
    "10_09_33": {
      "aqi": 53,
      "co2": 443,
      "createdAt": "2025_08_18_10_09_33",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 8,
      "temp": 32.5,
      "voc": 0
    },
    "10_11_35": {
      "aqi": 52,
      "co2": 424,
      "createdAt": "2025_08_18_10_11_35",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 32.6875,
      "voc": 0
    },
    "10_13_42": {
      "aqi": 52,
      "co2": 426,
      "createdAt": "2025_08_18_10_13_42",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 8,
      "temp": 32.375,
      "voc": 0
    },
    "10_15_44": {
      "aqi": 51,
      "co2": 422,
      "createdAt": "2025_08_18_10_15_44",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 8,
      "temp": 32.125,
      "voc": 0
    },
    "10_17_51": {
      "aqi": 52,
      "co2": 426,
      "createdAt": "2025_08_18_10_17_51",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 7,
      "temp": 32.75,
      "voc": 0
    },
    "10_19_54": {
      "aqi": 53,
      "co2": 436,
      "createdAt": "2025_08_18_10_19_54",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 7,
      "temp": 32,
      "voc": 0
    },
    "10_22_02": {
      "aqi": 51,
      "co2": 421,
      "createdAt": "2025_08_18_10_22_02",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 6,
      "temp": 32.625,
      "voc": 0
    },
    "10_24_06": {
      "aqi": 52,
      "co2": 431,
      "createdAt": "2025_08_18_10_24_06",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 6,
      "temp": 32.5625,
      "voc": 0
    },
    "10_26_13": {
      "aqi": 54,
      "co2": 458,
      "createdAt": "2025_08_18_10_26_13",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 3,
      "pm25": 3,
      "temp": 32.625,
      "voc": 0
    },
    "10_28_15": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_08_18_10_28_15",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 3,
      "pm25": 3,
      "temp": 32.4375,
      "voc": 0
    },
    "13_34_13": {
      "aqi": 73,
      "co2": 435,
      "createdAt": "2025_08_18_13_34_13",
      "hum": 0,
      "no2": 0,
      "pm1": 15,
      "pm10": 33,
      "pm25": 23,
      "temp": 31.375,
      "voc": 0
    },
    "13_36_15": {
      "aqi": 73,
      "co2": 448,
      "createdAt": "2025_08_18_13_36_15",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 32,
      "pm25": 23,
      "temp": 31.875,
      "voc": 0
    },
    "13_38_18": {
      "aqi": 73,
      "co2": 468,
      "createdAt": "2025_08_18_13_38_18",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 32,
      "pm25": 23,
      "temp": 32.1875,
      "voc": 0
    },
    "13_40_24": {
      "aqi": 73,
      "co2": 413,
      "createdAt": "2025_08_18_13_40_24",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 32,
      "pm25": 23,
      "temp": 32.5625,
      "voc": 0
    },
    "13_42_27": {
      "aqi": 73,
      "co2": 436,
      "createdAt": "2025_08_18_13_42_27",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 32,
      "pm25": 23,
      "temp": 32.9375,
      "voc": 0
    },
    "13_44_33": {
      "aqi": 73,
      "co2": 426,
      "createdAt": "2025_08_18_13_44_33",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 31,
      "pm25": 23,
      "temp": 32.8125,
      "voc": 0
    },
    "13_46_35": {
      "aqi": 73,
      "co2": 410,
      "createdAt": "2025_08_18_13_46_35",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 31,
      "pm25": 23,
      "temp": 33.75,
      "voc": 0
    },
    "13_48_46": {
      "aqi": 73,
      "co2": 416,
      "createdAt": "2025_08_18_13_48_46",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 30,
      "pm25": 23,
      "temp": 33.5625,
      "voc": 0
    },
    "13_50_48": {
      "aqi": 73,
      "co2": 415,
      "createdAt": "2025_08_18_13_50_48",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 30,
      "pm25": 23,
      "temp": 34,
      "voc": 0
    },
    "13_52_55": {
      "aqi": 65,
      "co2": 433,
      "createdAt": "2025_08_18_13_52_55",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 21,
      "pm25": 19,
      "temp": 34.125,
      "voc": 0
    },
    "13_54_58": {
      "aqi": 65,
      "co2": 431,
      "createdAt": "2025_08_18_13_54_58",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 21,
      "pm25": 19,
      "temp": 33.9375,
      "voc": 0
    },
    "13_57_05": {
      "aqi": 65,
      "co2": 439,
      "createdAt": "2025_08_18_13_57_05",
      "hum": 50,
      "no2": 0,
      "pm1": 9,
      "pm10": 21,
      "pm25": 19,
      "temp": 33.875,
      "voc": 0
    },
    "13_59_07": {
      "aqi": 63,
      "co2": 423,
      "createdAt": "2025_08_18_13_59_07",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 20,
      "pm25": 18,
      "temp": 34.25,
      "voc": 0
    },
    "14_01_14": {
      "aqi": 63,
      "co2": 426,
      "createdAt": "2025_08_18_14_01_14",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 20,
      "pm25": 18,
      "temp": 33.8125,
      "voc": 0
    },
    "14_03_16": {
      "aqi": 63,
      "co2": 429,
      "createdAt": "2025_08_18_14_03_16",
      "hum": 50,
      "no2": 0,
      "pm1": 8,
      "pm10": 20,
      "pm25": 18,
      "temp": 33.9375,
      "voc": 0
    },
    "14_05_25": {
      "aqi": 65,
      "co2": 437,
      "createdAt": "2025_08_18_14_05_25",
      "hum": 50,
      "no2": 0,
      "pm1": 10,
      "pm10": 21,
      "pm25": 19,
      "temp": 33.375,
      "voc": 0
    },
    "14_07_27": {
      "aqi": 65,
      "co2": 410,
      "createdAt": "2025_08_18_14_07_27",
      "hum": 50,
      "no2": 0,
      "pm1": 10,
      "pm10": 21,
      "pm25": 19,
      "temp": 33.375,
      "voc": 0
    },
    "14_09_34": {
      "aqi": 65,
      "co2": 435,
      "createdAt": "2025_08_18_14_09_34",
      "hum": 50,
      "no2": 0,
      "pm1": 10,
      "pm10": 21,
      "pm25": 19,
      "temp": 34,
      "voc": 0
    },
    "14_11_36": {
      "aqi": 52,
      "co2": 426,
      "createdAt": "2025_08_18_14_11_36",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 8,
      "pm25": 6,
      "temp": 34.1875,
      "voc": 0
    },
    "14_13_43": {
      "aqi": 52,
      "co2": 428,
      "createdAt": "2025_08_18_14_13_43",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 7,
      "pm25": 6,
      "temp": 34.375,
      "voc": 0
    },
    "14_15_45": {
      "aqi": 53,
      "co2": 436,
      "createdAt": "2025_08_18_14_15_45",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 7,
      "pm25": 5,
      "temp": 34.3125,
      "voc": 0
    },
    "14_17_52": {
      "aqi": 53,
      "co2": 447,
      "createdAt": "2025_08_18_14_17_52",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 7,
      "pm25": 5,
      "temp": 34.0625,
      "voc": 0
    },
    "14_19_55": {
      "aqi": 53,
      "co2": 436,
      "createdAt": "2025_08_18_14_19_55",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 33.4375,
      "voc": 0
    },
    "14_22_02": {
      "aqi": 52,
      "co2": 433,
      "createdAt": "2025_08_18_14_22_02",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 34.3125,
      "voc": 0
    },
    "14_24_04": {
      "aqi": 53,
      "co2": 442,
      "createdAt": "2025_08_18_14_24_04",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 34.125,
      "voc": 0
    },
    "14_26_12": {
      "aqi": 52,
      "co2": 431,
      "createdAt": "2025_08_18_14_26_12",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 33.375,
      "voc": 0
    },
    "14_55_40": {
      "aqi": 51,
      "co2": 417,
      "createdAt": "2025_08_18_14_55_40",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 9,
      "pm25": 8,
      "temp": 33.25,
      "voc": 0
    },
    "14_57_43": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_08_18_14_57_43",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 7,
      "temp": 33.1875,
      "voc": 0
    },
    "15_07_31": {
      "aqi": 51,
      "co2": 417,
      "createdAt": "2025_08_18_15_07_31",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 5,
      "temp": 33.625,
      "voc": 0
    },
    "15_09_33": {
      "aqi": 52,
      "co2": 427,
      "createdAt": "2025_08_18_15_09_33",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 13,
      "pm25": 5,
      "temp": 33.8125,
      "voc": 0
    },
    "15_11_36": {
      "aqi": 52,
      "co2": 426,
      "createdAt": "2025_08_18_15_11_36",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 13,
      "pm25": 5,
      "temp": 34,
      "voc": 0
    },
    "15_13_42": {
      "aqi": 52,
      "co2": 428,
      "createdAt": "2025_08_18_15_13_42",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 13,
      "pm25": 6,
      "temp": 33.8125,
      "voc": 0
    },
    "15_15_45": {
      "aqi": 51,
      "co2": 419,
      "createdAt": "2025_08_18_15_15_45",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 12,
      "pm25": 6,
      "temp": 34.625,
      "voc": 0
    },
    "15_17_52": {
      "aqi": 51,
      "co2": 417,
      "createdAt": "2025_08_18_15_17_52",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 11,
      "pm25": 5,
      "temp": 34.0625,
      "voc": 0
    },
    "15_19_55": {
      "aqi": 52,
      "co2": 435,
      "createdAt": "2025_08_18_15_19_55",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 12,
      "pm25": 5,
      "temp": 34,
      "voc": 0
    },
    "15_22_01": {
      "aqi": 51,
      "co2": 419,
      "createdAt": "2025_08_18_15_22_01",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 11,
      "pm25": 5,
      "temp": 33.75,
      "voc": 0
    },
    "15_24_04": {
      "aqi": 53,
      "co2": 438,
      "createdAt": "2025_08_18_15_24_04",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 11,
      "pm25": 5,
      "temp": 34.3125,
      "voc": 0
    },
    "15_26_11": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_08_18_15_26_11",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 11,
      "pm25": 5,
      "temp": 34.375,
      "voc": 0
    },
    "15_28_13": {
      "aqi": 51,
      "co2": 423,
      "createdAt": "2025_08_18_15_28_13",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 6,
      "pm25": 4,
      "temp": 34.5625,
      "voc": 0
    },
    "15_30_20": {
      "aqi": 52,
      "co2": 426,
      "createdAt": "2025_08_18_15_30_20",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 6,
      "pm25": 4,
      "temp": 33.75,
      "voc": 0
    },
    "15_32_23": {
      "aqi": 51,
      "co2": 415,
      "createdAt": "2025_08_18_15_32_23",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 7,
      "pm25": 5,
      "temp": 33.375,
      "voc": 0
    },
    "15_34_29": {
      "aqi": 51,
      "co2": 418,
      "createdAt": "2025_08_18_15_34_29",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 33.375,
      "voc": 0
    },
    "15_36_32": {
      "aqi": 52,
      "co2": 425,
      "createdAt": "2025_08_18_15_36_32",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 33.25,
      "voc": 0
    },
    "15_38_39": {
      "aqi": 52,
      "co2": 428,
      "createdAt": "2025_08_18_15_38_39",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 32.9375,
      "voc": 0
    },
    "15_40_41": {
      "aqi": 52,
      "co2": 430,
      "createdAt": "2025_08_18_15_40_41",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 33.5625,
      "voc": 0
    },
    "15_42_48": {
      "aqi": 53,
      "co2": 437,
      "createdAt": "2025_08_18_15_42_48",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 33.125,
      "voc": 0
    },
    "15_44_51": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_08_18_15_44_51",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 33.5,
      "voc": 0
    },
    "15_47_00": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_08_18_15_47_00",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 9,
      "pm25": 8,
      "temp": 33.0625,
      "voc": 0
    },
    "15_49_03": {
      "aqi": 52,
      "co2": 428,
      "createdAt": "2025_08_18_15_49_03",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 9,
      "pm25": 8,
      "temp": 33.625,
      "voc": 0
    },
    "15_51_09": {
      "aqi": 51,
      "co2": 417,
      "createdAt": "2025_08_18_15_51_09",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 8,
      "temp": 33.3125,
      "voc": 0
    },
    "15_53_12": {
      "aqi": 52,
      "co2": 426,
      "createdAt": "2025_08_18_15_53_12",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 8,
      "temp": 33.25,
      "voc": 0
    },
    "15_55_15": {
      "aqi": 51,
      "co2": 420,
      "createdAt": "2025_08_18_15_55_15",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 8,
      "temp": 33.125,
      "voc": 0
    },
    "15_57_17": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_08_18_15_57_17",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 33.25,
      "voc": 0
    },
    "15_59_24": {
      "aqi": 50,
      "co2": 411,
      "createdAt": "2025_08_18_15_59_24",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 33.3125,
      "voc": 0
    },
    "20_22_13": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_20_22_13",
      "hum": 50,
      "no2": 0,
      "pm1": 13,
      "pm10": 17,
      "pm25": 17,
      "temp": 31.5625,
      "voc": 0
    },
    "20_24_15": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_20_24_15",
      "hum": 50,
      "no2": 0,
      "pm1": 13,
      "pm10": 17,
      "pm25": 17,
      "temp": 31.3125,
      "voc": 0
    },
    "20_26_18": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_20_26_18",
      "hum": 50,
      "no2": 0,
      "pm1": 13,
      "pm10": 17,
      "pm25": 17,
      "temp": 31.4375,
      "voc": 0
    },
    "20_28_25": {
      "aqi": 61,
      "co2": 426,
      "createdAt": "2025_08_18_20_28_25",
      "hum": 50,
      "no2": 0,
      "pm1": 14,
      "pm10": 18,
      "pm25": 17,
      "temp": 31.625,
      "voc": 0
    },
    "20_30_27": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_20_30_27",
      "hum": 50,
      "no2": 0,
      "pm1": 14,
      "pm10": 18,
      "pm25": 17,
      "temp": 31.75,
      "voc": 0
    },
    "20_32_34": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_20_32_34",
      "hum": 50,
      "no2": 0,
      "pm1": 14,
      "pm10": 18,
      "pm25": 17,
      "temp": 31.75,
      "voc": 0
    },
    "20_34_37": {
      "aqi": 67,
      "co2": 410,
      "createdAt": "2025_08_18_20_34_37",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 20,
      "pm25": 20,
      "temp": 31.625,
      "voc": 0
    },
    "20_36_44": {
      "aqi": 67,
      "co2": 410,
      "createdAt": "2025_08_18_20_36_44",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 20,
      "pm25": 20,
      "temp": 31.8125,
      "voc": 0
    },
    "20_38_47": {
      "aqi": 67,
      "co2": 410,
      "createdAt": "2025_08_18_20_38_47",
      "hum": 50,
      "no2": 0,
      "pm1": 15,
      "pm10": 20,
      "pm25": 20,
      "temp": 31.9375,
      "voc": 0
    },
    "20_40_53": {
      "aqi": 51,
      "co2": 412,
      "createdAt": "2025_08_18_20_40_53",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 13,
      "pm25": 10,
      "temp": 31.625,
      "voc": 0
    },
    "20_42_56": {
      "aqi": 54,
      "co2": 449,
      "createdAt": "2025_08_18_20_42_56",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 12,
      "pm25": 9,
      "temp": 31.8125,
      "voc": 0
    },
    "20_45_06": {
      "aqi": 51,
      "co2": 417,
      "createdAt": "2025_08_18_20_45_06",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 12,
      "pm25": 9,
      "temp": 31.8125,
      "voc": 0
    },
    "20_47_08": {
      "aqi": 52,
      "co2": 426,
      "createdAt": "2025_08_18_20_47_08",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 11,
      "pm25": 9,
      "temp": 31.75,
      "voc": 0
    },
    "20_49_15": {
      "aqi": 52,
      "co2": 424,
      "createdAt": "2025_08_18_20_49_15",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 12,
      "pm25": 10,
      "temp": 31.9375,
      "voc": 0
    },
    "20_51_18": {
      "aqi": 52,
      "co2": 429,
      "createdAt": "2025_08_18_20_51_18",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 12,
      "pm25": 10,
      "temp": 32.125,
      "voc": 0
    },
    "20_53_25": {
      "aqi": 51,
      "co2": 417,
      "createdAt": "2025_08_18_20_53_25",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 12,
      "pm25": 10,
      "temp": 31.6875,
      "voc": 0
    },
    "20_55_28": {
      "aqi": 52,
      "co2": 429,
      "createdAt": "2025_08_18_20_55_28",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 12,
      "pm25": 10,
      "temp": 31.75,
      "voc": 0
    },
    "20_57_35": {
      "aqi": 51,
      "co2": 413,
      "createdAt": "2025_08_18_20_57_35",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 12,
      "pm25": 10,
      "temp": 31.625,
      "voc": 0
    },
    "20_59_38": {
      "aqi": 63,
      "co2": 423,
      "createdAt": "2025_08_18_20_59_38",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 20,
      "pm25": 18,
      "temp": 31.875,
      "voc": 0
    },
    "21_01_44": {
      "aqi": 63,
      "co2": 432,
      "createdAt": "2025_08_18_21_01_44",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 21,
      "pm25": 18,
      "temp": 31.5625,
      "voc": 0
    },
    "21_03_46": {
      "aqi": 63,
      "co2": 418,
      "createdAt": "2025_08_18_21_03_46",
      "hum": 50,
      "no2": 0,
      "pm1": 7,
      "pm10": 21,
      "pm25": 18,
      "temp": 31.6875,
      "voc": 0
    },
    "21_05_53": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_21_05_53",
      "hum": 50,
      "no2": 0,
      "pm1": 6,
      "pm10": 20,
      "pm25": 17,
      "temp": 31.4375,
      "voc": 0
    },
    "21_07_56": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_21_07_56",
      "hum": 50,
      "no2": 0,
      "pm1": 6,
      "pm10": 20,
      "pm25": 17,
      "temp": 31.4375,
      "voc": 0
    },
    "21_10_03": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_21_10_03",
      "hum": 50,
      "no2": 0,
      "pm1": 6,
      "pm10": 20,
      "pm25": 17,
      "temp": 31.6875,
      "voc": 0
    },
    "21_12_06": {
      "aqi": 61,
      "co2": 427,
      "createdAt": "2025_08_18_21_12_06",
      "hum": 50,
      "no2": 0,
      "pm1": 6,
      "pm10": 20,
      "pm25": 17,
      "temp": 32.5,
      "voc": 0
    },
    "21_14_12": {
      "aqi": 61,
      "co2": 410,
      "createdAt": "2025_08_18_21_14_12",
      "hum": 50,
      "no2": 0,
      "pm1": 6,
      "pm10": 20,
      "pm25": 17,
      "temp": 32,
      "voc": 0
    },
    "22_06_16": {
      "aqi": 52,
      "co2": 431,
      "createdAt": "2025_08_18_22_06_16",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 8,
      "temp": 31.625,
      "voc": 0
    },
    "22_08_19": {
      "aqi": 51,
      "co2": 419,
      "createdAt": "2025_08_18_22_08_19",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 8,
      "temp": 31.4375,
      "voc": 0
    },
    "22_10_22": {
      "aqi": 53,
      "co2": 440,
      "createdAt": "2025_08_18_22_10_22",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 8,
      "temp": 31.5625,
      "voc": 0
    },
    "22_12_28": {
      "aqi": 51,
      "co2": 419,
      "createdAt": "2025_08_18_22_12_28",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 8,
      "pm25": 8,
      "temp": 32,
      "voc": 0
    },
    "22_14_31": {
      "aqi": 54,
      "co2": 453,
      "createdAt": "2025_08_18_22_14_31",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 8,
      "pm25": 8,
      "temp": 31.75,
      "voc": 0
    },
    "22_16_37": {
      "aqi": 52,
      "co2": 434,
      "createdAt": "2025_08_18_22_16_37",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 8,
      "pm25": 8,
      "temp": 31.6875,
      "voc": 0
    },
    "22_18_40": {
      "aqi": 56,
      "co2": 480,
      "createdAt": "2025_08_18_22_18_40",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.9375,
      "voc": 0
    },
    "22_20_47": {
      "aqi": 51,
      "co2": 423,
      "createdAt": "2025_08_18_22_20_47",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.5,
      "voc": 0
    },
    "22_22_50": {
      "aqi": 52,
      "co2": 431,
      "createdAt": "2025_08_18_22_22_50",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.4375,
      "voc": 0
    },
    "22_24_56": {
      "aqi": 52,
      "co2": 428,
      "createdAt": "2025_08_18_22_24_56",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 8,
      "pm25": 6,
      "temp": 31.5625,
      "voc": 0
    },
    "22_26_59": {
      "aqi": 53,
      "co2": 437,
      "createdAt": "2025_08_18_22_26_59",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 8,
      "pm25": 6,
      "temp": 31.8125,
      "voc": 0
    },
    "22_29_06": {
      "aqi": 53,
      "co2": 436,
      "createdAt": "2025_08_18_22_29_06",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 8,
      "pm25": 5,
      "temp": 31.6875,
      "voc": 0
    },
    "22_31_09": {
      "aqi": 51,
      "co2": 420,
      "createdAt": "2025_08_18_22_31_09",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 8,
      "pm25": 5,
      "temp": 31.625,
      "voc": 0
    },
    "22_33_16": {
      "aqi": 52,
      "co2": 425,
      "createdAt": "2025_08_18_22_33_16",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 8,
      "pm25": 5,
      "temp": 31.75,
      "voc": 0
    },
    "22_35_18": {
      "aqi": 52,
      "co2": 427,
      "createdAt": "2025_08_18_22_35_18",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 9,
      "pm25": 6,
      "temp": 31.6875,
      "voc": 0
    },
    "22_37_25": {
      "aqi": 51,
      "co2": 419,
      "createdAt": "2025_08_18_22_37_25",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 10,
      "pm25": 6,
      "temp": 31.8125,
      "voc": 0
    },
    "22_39_28": {
      "aqi": 51,
      "co2": 422,
      "createdAt": "2025_08_18_22_39_28",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 10,
      "pm25": 6,
      "temp": 31.5,
      "voc": 0
    },
    "22_41_35": {
      "aqi": 54,
      "co2": 448,
      "createdAt": "2025_08_18_22_41_35",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 10,
      "pm25": 6,
      "temp": 31.4375,
      "voc": 0
    },
    "22_43_37": {
      "aqi": 53,
      "co2": 439,
      "createdAt": "2025_08_18_22_43_37",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 8,
      "pm25": 5,
      "temp": 31.5,
      "voc": 0
    },
    "22_45_44": {
      "aqi": 52,
      "co2": 432,
      "createdAt": "2025_08_18_22_45_44",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 5,
      "temp": 31.4375,
      "voc": 0
    },
    "22_47_46": {
      "aqi": 51,
      "co2": 423,
      "createdAt": "2025_08_18_22_47_46",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 5,
      "temp": 31.4375,
      "voc": 0
    },
    "22_49_53": {
      "aqi": 52,
      "co2": 425,
      "createdAt": "2025_08_18_22_49_53",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 4,
      "temp": 31.3125,
      "voc": 0
    },
    "22_51_56": {
      "aqi": 52,
      "co2": 435,
      "createdAt": "2025_08_18_22_51_56",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 5,
      "temp": 31.5625,
      "voc": 0
    },
    "22_54_02": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_08_18_22_54_02",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 5,
      "temp": 31,
      "voc": 0
    },
    "22_56_05": {
      "aqi": 52,
      "co2": 433,
      "createdAt": "2025_08_18_22_56_05",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 5,
      "temp": 31.125,
      "voc": 0
    },
    "22_58_11": {
      "aqi": 51,
      "co2": 421,
      "createdAt": "2025_08_18_22_58_11",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 5,
      "temp": 31.5625,
      "voc": 0
    },
    "23_22_56": {
      "aqi": 53,
      "co2": 443,
      "createdAt": "2025_08_18_23_22_56",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.3125,
      "voc": 0
    },
    "23_24_59": {
      "aqi": 52,
      "co2": 434,
      "createdAt": "2025_08_18_23_24_59",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.5,
      "voc": 0
    },
    "23_27_01": {
      "aqi": 54,
      "co2": 449,
      "createdAt": "2025_08_18_23_27_01",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.5,
      "voc": 0
    },
    "23_29_08": {
      "aqi": 51,
      "co2": 415,
      "createdAt": "2025_08_18_23_29_08",
      "hum": 50,
      "no2": 0,
      "pm1": 5,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.3125,
      "voc": 0
    },
    "23_31_10": {
      "aqi": 53,
      "co2": 438,
      "createdAt": "2025_08_18_23_31_10",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 9,
      "pm25": 9,
      "temp": 31.3125,
      "voc": 0
    },
    "23_33_17": {
      "aqi": 53,
      "co2": 437,
      "createdAt": "2025_08_18_23_33_17",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 10,
      "temp": 31.3125,
      "voc": 0
    },
    "23_35_19": {
      "aqi": 53,
      "co2": 444,
      "createdAt": "2025_08_18_23_35_19",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 11,
      "pm25": 11,
      "temp": 31.8125,
      "voc": 0
    },
    "23_37_26": {
      "aqi": 53,
      "co2": 446,
      "createdAt": "2025_08_18_23_37_26",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 10,
      "temp": 31.375,
      "voc": 0
    },
    "23_39_28": {
      "aqi": 53,
      "co2": 446,
      "createdAt": "2025_08_18_23_39_28",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 10,
      "pm25": 10,
      "temp": 31.3125,
      "voc": 0
    },
    "23_41_35": {
      "aqi": 53,
      "co2": 439,
      "createdAt": "2025_08_18_23_41_35",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 3,
      "pm25": 2,
      "temp": 31.9375,
      "voc": 0
    },
    "23_43_37": {
      "aqi": 53,
      "co2": 442,
      "createdAt": "2025_08_18_23_43_37",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 3,
      "pm25": 2,
      "temp": 31.8125,
      "voc": 0
    },
    "23_45_44": {
      "aqi": 53,
      "co2": 446,
      "createdAt": "2025_08_18_23_45_44",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 31.5625,
      "voc": 0
    },
    "23_47_46": {
      "aqi": 52,
      "co2": 429,
      "createdAt": "2025_08_18_23_47_46",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 3,
      "temp": 31.4375,
      "voc": 0
    },
    "23_49_53": {
      "aqi": 52,
      "co2": 424,
      "createdAt": "2025_08_18_23_49_53",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 3,
      "temp": 31.3125,
      "voc": 0
    },
    "23_51_55": {
      "aqi": 53,
      "co2": 447,
      "createdAt": "2025_08_18_23_51_55",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 4,
      "pm25": 3,
      "temp": 31.6875,
      "voc": 0
    },
    "23_54_02": {
      "aqi": 52,
      "co2": 432,
      "createdAt": "2025_08_18_23_54_02",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 31.4375,
      "voc": 0
    },
    "23_56_05": {
      "aqi": 51,
      "co2": 415,
      "createdAt": "2025_08_18_23_56_05",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 31.3125,
      "voc": 0
    },
    "23_58_11": {
      "aqi": 51,
      "co2": 414,
      "createdAt": "2025_08_18_23_58_11",
      "hum": 50,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 31.4375,
      "voc": 0
    }
  },

  "2025_7_15": {
    "17_23_11": {
      "aqi": 84,
      "co2": 729,
      "createdAt": "2025_7_15_17_23_11",
      "hum": 80.9,
      "no2": 0,
      "pm1": 19,
      "pm10": 34,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_23_18": {
      "aqi": 84,
      "co2": 718,
      "createdAt": "2025_7_15_17_23_18",
      "hum": 81.2,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_23_25": {
      "aqi": 84,
      "co2": 715,
      "createdAt": "2025_7_15_17_23_25",
      "hum": 81.6,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 28,
      "temp": 29.5625,
      "voc": 0
    },
    "17_23_32": {
      "aqi": 84,
      "co2": 715,
      "createdAt": "2025_7_15_17_23_32",
      "hum": 81.4,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 28,
      "temp": 29.625,
      "voc": 0
    },
    "17_23_39": {
      "aqi": 84,
      "co2": 715,
      "createdAt": "2025_7_15_17_23_39",
      "hum": 81.2,
      "no2": 0,
      "pm1": 18,
      "pm10": 32,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_23_46": {
      "aqi": 84,
      "co2": 688,
      "createdAt": "2025_7_15_17_23_46",
      "hum": 81.2,
      "no2": 0,
      "pm1": 18,
      "pm10": 32,
      "pm25": 28,
      "temp": 29.5625,
      "voc": 0
    },
    "17_23_54": {
      "aqi": 84,
      "co2": 650,
      "createdAt": "2025_7_15_17_23_54",
      "hum": 81.2,
      "no2": 0,
      "pm1": 18,
      "pm10": 32,
      "pm25": 28,
      "temp": 29.5625,
      "voc": 0
    },
    "17_24_1": {
      "aqi": 84,
      "co2": 628,
      "createdAt": "2025_7_15_17_24_1",
      "hum": 81.4,
      "no2": 0,
      "pm1": 18,
      "pm10": 32,
      "pm25": 28,
      "temp": 29.5625,
      "voc": 0
    },
    "17_24_15": {
      "aqi": 84,
      "co2": 612,
      "createdAt": "2025_7_15_17_24_15",
      "hum": 81.1,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 28,
      "temp": 29.5625,
      "voc": 0
    },
    "17_24_22": {
      "aqi": 84,
      "co2": 594,
      "createdAt": "2025_7_15_17_24_22",
      "hum": 81.6,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 28,
      "temp": 29.5625,
      "voc": 0
    },
    "17_24_29": {
      "aqi": 84,
      "co2": 588,
      "createdAt": "2025_7_15_17_24_29",
      "hum": 81.3,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 28,
      "temp": 29.5625,
      "voc": 0
    },
    "17_24_37": {
      "aqi": 82,
      "co2": 572,
      "createdAt": "2025_7_15_17_24_37",
      "hum": 81,
      "no2": 0,
      "pm1": 15,
      "pm10": 29,
      "pm25": 27,
      "temp": 29.5625,
      "voc": 0
    },
    "17_24_44": {
      "aqi": 82,
      "co2": 558,
      "createdAt": "2025_7_15_17_24_44",
      "hum": 81.4,
      "no2": 0,
      "pm1": 15,
      "pm10": 29,
      "pm25": 27,
      "temp": 29.5625,
      "voc": 0
    },
    "17_24_51": {
      "aqi": 82,
      "co2": 558,
      "createdAt": "2025_7_15_17_24_51",
      "hum": 81.3,
      "no2": 0,
      "pm1": 15,
      "pm10": 29,
      "pm25": 27,
      "temp": 29.5625,
      "voc": 0
    },
    "17_24_58": {
      "aqi": 84,
      "co2": 558,
      "createdAt": "2025_7_15_17_24_58",
      "hum": 81.4,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_24_8": {
      "aqi": 84,
      "co2": 624,
      "createdAt": "2025_7_15_17_24_8",
      "hum": 81.5,
      "no2": 0,
      "pm1": 18,
      "pm10": 31,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_25_13": {
      "aqi": 84,
      "co2": 662,
      "createdAt": "2025_7_15_17_25_13",
      "hum": 81.5,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_25_20": {
      "aqi": 84,
      "co2": 660,
      "createdAt": "2025_7_15_17_25_20",
      "hum": 81.2,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_25_27": {
      "aqi": 84,
      "co2": 663,
      "createdAt": "2025_7_15_17_25_27",
      "hum": 81.2,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_25_34": {
      "aqi": 84,
      "co2": 666,
      "createdAt": "2025_7_15_17_25_34",
      "hum": 81.3,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 28,
      "temp": 29.5,
      "voc": 0
    },
    "17_25_41": {
      "aqi": 78,
      "co2": 670,
      "createdAt": "2025_7_15_17_25_41",
      "hum": 81.3,
      "no2": 0,
      "pm1": 16,
      "pm10": 29,
      "pm25": 25,
      "temp": 29.5,
      "voc": 0
    },
    "17_25_49": {
      "aqi": 78,
      "co2": 694,
      "createdAt": "2025_7_15_17_25_49",
      "hum": 81.4,
      "no2": 0,
      "pm1": 16,
      "pm10": 28,
      "pm25": 25,
      "temp": 29.4375,
      "voc": 0
    },
    "17_25_56": {
      "aqi": 78,
      "co2": 724,
      "createdAt": "2025_7_15_17_25_56",
      "hum": 80.9,
      "no2": 0,
      "pm1": 16,
      "pm10": 28,
      "pm25": 25,
      "temp": 29.4375,
      "voc": 0
    },
    "17_25_6": {
      "aqi": 84,
      "co2": 611,
      "createdAt": "2025_7_15_17_25_6",
      "hum": 81.6,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 28,
      "temp": 29.5625,
      "voc": 0
    },
    "17_26_10": {
      "aqi": 79,
      "co2": 756,
      "createdAt": "2025_7_15_17_26_10",
      "hum": 81.2,
      "no2": 0,
      "pm1": 15,
      "pm10": 27,
      "pm25": 24,
      "temp": 29.4375,
      "voc": 0
    },
    "17_26_17": {
      "aqi": 78,
      "co2": 744,
      "createdAt": "2025_7_15_17_26_17",
      "hum": 81.2,
      "no2": 0,
      "pm1": 15,
      "pm10": 27,
      "pm25": 23,
      "temp": 29.5,
      "voc": 0
    },
    "17_26_24": {
      "aqi": 78,
      "co2": 745,
      "createdAt": "2025_7_15_17_26_24",
      "hum": 81.8,
      "no2": 0,
      "pm1": 15,
      "pm10": 27,
      "pm25": 23,
      "temp": 29.5,
      "voc": 0
    },
    "17_26_3": {
      "aqi": 78,
      "co2": 746,
      "createdAt": "2025_7_15_17_26_3",
      "hum": 80.9,
      "no2": 0,
      "pm1": 16,
      "pm10": 28,
      "pm25": 25,
      "temp": 29.4375,
      "voc": 0
    },
    "17_26_31": {
      "aqi": 78,
      "co2": 739,
      "createdAt": "2025_7_15_17_26_31",
      "hum": 81.5,
      "no2": 0,
      "pm1": 14,
      "pm10": 27,
      "pm25": 23,
      "temp": 29.5,
      "voc": 0
    },
    "17_26_38": {
      "aqi": 76,
      "co2": 719,
      "createdAt": "2025_7_15_17_26_38",
      "hum": 81.4,
      "no2": 0,
      "pm1": 14,
      "pm10": 27,
      "pm25": 22,
      "temp": 29.5,
      "voc": 0
    },
    "17_26_46": {
      "aqi": 74,
      "co2": 698,
      "createdAt": "2025_7_15_17_26_46",
      "hum": 81.3,
      "no2": 0,
      "pm1": 14,
      "pm10": 27,
      "pm25": 22,
      "temp": 29.5,
      "voc": 0
    },
    "17_26_53": {
      "aqi": 74,
      "co2": 694,
      "createdAt": "2025_7_15_17_26_53",
      "hum": 81.5,
      "no2": 0,
      "pm1": 14,
      "pm10": 27,
      "pm25": 22,
      "temp": 29.5,
      "voc": 0
    },
    "17_27_0": {
      "aqi": 75,
      "co2": 711,
      "createdAt": "2025_7_15_17_27_0",
      "hum": 81.4,
      "no2": 0,
      "pm1": 14,
      "pm10": 27,
      "pm25": 22,
      "temp": 29.5,
      "voc": 0
    },
    "17_27_14": {
      "aqi": 77,
      "co2": 731,
      "createdAt": "2025_7_15_17_27_14",
      "hum": 81.9,
      "no2": 0,
      "pm1": 15,
      "pm10": 28,
      "pm25": 23,
      "temp": 29.5625,
      "voc": 0
    },
    "17_27_21": {
      "aqi": 78,
      "co2": 738,
      "createdAt": "2025_7_15_17_27_21",
      "hum": 81.9,
      "no2": 0,
      "pm1": 9,
      "pm10": 23,
      "pm25": 21,
      "temp": 29.5625,
      "voc": 0
    },
    "17_27_29": {
      "aqi": 77,
      "co2": 729,
      "createdAt": "2025_7_15_17_27_29",
      "hum": 81.9,
      "no2": 0,
      "pm1": 9,
      "pm10": 23,
      "pm25": 21,
      "temp": 29.6875,
      "voc": 0
    },
    "17_27_36": {
      "aqi": 76,
      "co2": 723,
      "createdAt": "2025_7_15_17_27_36",
      "hum": 81.7,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 21,
      "temp": 29.6875,
      "voc": 0
    },
    "17_27_43": {
      "aqi": 77,
      "co2": 725,
      "createdAt": "2025_7_15_17_27_43",
      "hum": 82.1,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 21,
      "temp": 29.6875,
      "voc": 0
    },
    "17_27_50": {
      "aqi": 79,
      "co2": 749,
      "createdAt": "2025_7_15_17_27_50",
      "hum": 82.3,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 21,
      "temp": 29.6875,
      "voc": 0
    },
    "17_27_57": {
      "aqi": 85,
      "co2": 824,
      "createdAt": "2025_7_15_17_27_57",
      "hum": 81.7,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 21,
      "temp": 29.6875,
      "voc": 0
    },
    "17_27_7": {
      "aqi": 76,
      "co2": 721,
      "createdAt": "2025_7_15_17_27_7",
      "hum": 81.5,
      "no2": 0,
      "pm1": 15,
      "pm10": 28,
      "pm25": 23,
      "temp": 29.625,
      "voc": 0
    },
    "17_28_12": {
      "aqi": 96,
      "co2": 954,
      "createdAt": "2025_7_15_17_28_12",
      "hum": 81.8,
      "no2": 1,
      "pm1": 9,
      "pm10": 25,
      "pm25": 22,
      "temp": 29.75,
      "voc": 1
    },
    "17_28_19": {
      "aqi": 98,
      "co2": 982,
      "createdAt": "2025_7_15_17_28_19",
      "hum": 81.5,
      "no2": 1,
      "pm1": 9,
      "pm10": 25,
      "pm25": 22,
      "temp": 29.75,
      "voc": 1
    },
    "17_28_26": {
      "aqi": 98,
      "co2": 983,
      "createdAt": "2025_7_15_17_28_26",
      "hum": 81.1,
      "no2": 1,
      "pm1": 8,
      "pm10": 25,
      "pm25": 22,
      "temp": 29.6875,
      "voc": 1
    },
    "17_28_33": {
      "aqi": 97,
      "co2": 975,
      "createdAt": "2025_7_15_17_28_33",
      "hum": 80.9,
      "no2": 1,
      "pm1": 8,
      "pm10": 25,
      "pm25": 22,
      "temp": 29.625,
      "voc": 3
    },
    "17_28_40": {
      "aqi": 85,
      "co2": 826,
      "createdAt": "2025_7_15_17_28_40",
      "hum": 80.7,
      "no2": 1,
      "pm1": 8,
      "pm10": 26,
      "pm25": 22,
      "temp": 29.6875,
      "voc": 4
    },
    "17_28_48": {
      "aqi": 79,
      "co2": 752,
      "createdAt": "2025_7_15_17_28_48",
      "hum": 80.7,
      "no2": 1,
      "pm1": 8,
      "pm10": 26,
      "pm25": 22,
      "temp": 29.625,
      "voc": 6
    },
    "17_28_5": {
      "aqi": 92,
      "co2": 909,
      "createdAt": "2025_7_15_17_28_5",
      "hum": 81.9,
      "no2": 0,
      "pm1": 9,
      "pm10": 25,
      "pm25": 22,
      "temp": 29.75,
      "voc": 0
    },
    "17_28_55": {
      "aqi": 75,
      "co2": 704,
      "createdAt": "2025_7_15_17_28_55",
      "hum": 80.6,
      "no2": 1,
      "pm1": 8,
      "pm10": 26,
      "pm25": 22,
      "temp": 29.6875,
      "voc": 9
    },
    "17_29_16": {
      "aqi": 69,
      "co2": 630,
      "createdAt": "2025_7_15_17_29_16",
      "hum": 81.1,
      "no2": 1,
      "pm1": 8,
      "pm10": 23,
      "pm25": 20,
      "temp": 29.6875,
      "voc": 24
    },
    "17_29_2": {
      "aqi": 73,
      "co2": 680,
      "createdAt": "2025_7_15_17_29_2",
      "hum": 80.8,
      "no2": 1,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 29.625,
      "voc": 14
    },
    "17_29_9": {
      "aqi": 70,
      "co2": 647,
      "createdAt": "2025_7_15_17_29_9",
      "hum": 80.8,
      "no2": 1,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 29.6875,
      "voc": 20
    }
  },
  "2025_8_2": {
    "1_47_39": {
      "aqi": 68,
      "co2": 620,
      "createdAt": "2025_8_2_1_47_39",
      "hum": 81.3,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 29.5625,
      "voc": 0
    },
    "1_47_47": {
      "aqi": 71,
      "co2": 653,
      "createdAt": "2025_8_2_1_47_47",
      "hum": 81.8,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 29.625,
      "voc": 0
    },
    "1_47_54": {
      "aqi": 83,
      "co2": 800,
      "createdAt": "2025_8_2_1_47_54",
      "hum": 81.4,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 20,
      "temp": 29.5625,
      "voc": 0
    },
    "1_48_1": {
      "aqi": 84,
      "co2": 818,
      "createdAt": "2025_8_2_1_48_1",
      "hum": 81.2,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 20,
      "temp": 29.5,
      "voc": 0
    },
    "1_48_15": {
      "aqi": 84,
      "co2": 819,
      "createdAt": "2025_8_2_1_48_15",
      "hum": 80.9,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 29.5625,
      "voc": 0
    },
    "1_48_22": {
      "aqi": 83,
      "co2": 801,
      "createdAt": "2025_8_2_1_48_22",
      "hum": 81,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 29.5,
      "voc": 0
    },
    "1_48_29": {
      "aqi": 83,
      "co2": 804,
      "createdAt": "2025_8_2_1_48_29",
      "hum": 81.2,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 29.5,
      "voc": 0
    },
    "1_48_36": {
      "aqi": 81,
      "co2": 774,
      "createdAt": "2025_8_2_1_48_36",
      "hum": 81.3,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 20,
      "temp": 29.5,
      "voc": 0
    },
    "1_48_44": {
      "aqi": 77,
      "co2": 727,
      "createdAt": "2025_8_2_1_48_44",
      "hum": 81.1,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 19,
      "temp": 29.5,
      "voc": 0
    },
    "1_48_51": {
      "aqi": 74,
      "co2": 695,
      "createdAt": "2025_8_2_1_48_51",
      "hum": 80.8,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 19,
      "temp": 29.5,
      "voc": 0
    },
    "1_48_58": {
      "aqi": 72,
      "co2": 667,
      "createdAt": "2025_8_2_1_48_58",
      "hum": 80.8,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 18,
      "temp": 29.4375,
      "voc": 0
    },
    "1_48_8": {
      "aqi": 85,
      "co2": 823,
      "createdAt": "2025_8_2_1_48_8",
      "hum": 81,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 29.5625,
      "voc": 0
    },
    "1_49_12": {
      "aqi": 33128,
      "co2": 631,
      "createdAt": "2025_8_2_1_49_12",
      "hum": 80.9,
      "no2": 0,
      "pm1": 5378,
      "pm10": 13824,
      "pm25": 41474,
      "temp": 29.4375,
      "voc": 0
    },
    "1_49_19": {
      "aqi": 67,
      "co2": 604,
      "createdAt": "2025_8_2_1_49_19",
      "hum": 80.9,
      "no2": 0,
      "pm1": 5,
      "pm10": 16,
      "pm25": 14,
      "temp": 29.4375,
      "voc": 0
    },
    "1_49_27": {
      "aqi": 65,
      "co2": 588,
      "createdAt": "2025_8_2_1_49_27",
      "hum": 81,
      "no2": 0,
      "pm1": 5,
      "pm10": 16,
      "pm25": 14,
      "temp": 29.4375,
      "voc": 0
    },
    "1_49_34": {
      "aqi": 62,
      "co2": 550,
      "createdAt": "2025_8_2_1_49_34",
      "hum": 80.9,
      "no2": 0,
      "pm1": 5,
      "pm10": 17,
      "pm25": 14,
      "temp": 29.4375,
      "voc": 0
    },
    "1_49_41": {
      "aqi": 60,
      "co2": 530,
      "createdAt": "2025_8_2_1_49_41",
      "hum": 80.8,
      "no2": 0,
      "pm1": 5,
      "pm10": 17,
      "pm25": 14,
      "temp": 29.375,
      "voc": 0
    },
    "1_49_48": {
      "aqi": 59,
      "co2": 514,
      "createdAt": "2025_8_2_1_49_48",
      "hum": 80.9,
      "no2": 0,
      "pm1": 6,
      "pm10": 17,
      "pm25": 14,
      "temp": 29.4375,
      "voc": 0
    },
    "1_49_5": {
      "aqi": 33128,
      "co2": 647,
      "createdAt": "2025_8_2_1_49_5",
      "hum": 80.7,
      "no2": 0,
      "pm1": 5378,
      "pm10": 13824,
      "pm25": 41474,
      "temp": 29.4375,
      "voc": 0
    },
    "1_49_55": {
      "aqi": 58,
      "co2": 501,
      "createdAt": "2025_8_2_1_49_55",
      "hum": 80.9,
      "no2": 0,
      "pm1": 6,
      "pm10": 18,
      "pm25": 14,
      "temp": 29.4375,
      "voc": 0
    },
    "1_50_10": {
      "aqi": 57,
      "co2": 487,
      "createdAt": "2025_8_2_1_50_10",
      "hum": 80.9,
      "no2": 0,
      "pm1": 5,
      "pm10": 18,
      "pm25": 13,
      "temp": 29.375,
      "voc": 0
    },
    "1_50_17": {
      "aqi": 56,
      "co2": 481,
      "createdAt": "2025_8_2_1_50_17",
      "hum": 80.9,
      "no2": 0,
      "pm1": 5,
      "pm10": 18,
      "pm25": 13,
      "temp": 29.375,
      "voc": 0
    },
    "1_50_2": {
      "aqi": 57,
      "co2": 494,
      "createdAt": "2025_8_2_1_50_2",
      "hum": 81,
      "no2": 0,
      "pm1": 6,
      "pm10": 18,
      "pm25": 14,
      "temp": 29.375,
      "voc": 0
    },
    "1_50_24": {
      "aqi": 56,
      "co2": 478,
      "createdAt": "2025_8_2_1_50_24",
      "hum": 81.1,
      "no2": 0,
      "pm1": 5,
      "pm10": 18,
      "pm25": 13,
      "temp": 29.375,
      "voc": 0
    },
    "1_50_31": {
      "aqi": 56,
      "co2": 476,
      "createdAt": "2025_8_2_1_50_31",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 16,
      "pm25": 9,
      "temp": 29.375,
      "voc": 0
    },
    "1_50_38": {
      "aqi": 56,
      "co2": 482,
      "createdAt": "2025_8_2_1_50_38",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 16,
      "pm25": 9,
      "temp": 29.4375,
      "voc": 0
    },
    "1_50_45": {
      "aqi": 56,
      "co2": 483,
      "createdAt": "2025_8_2_1_50_45",
      "hum": 81.5,
      "no2": 0,
      "pm1": 3,
      "pm10": 15,
      "pm25": 8,
      "temp": 29.375,
      "voc": 0
    },
    "1_50_53": {
      "aqi": 58,
      "co2": 497,
      "createdAt": "2025_8_2_1_50_53",
      "hum": 81.2,
      "no2": 0,
      "pm1": 3,
      "pm10": 15,
      "pm25": 8,
      "temp": 29.375,
      "voc": 0
    },
    "1_51_0": {
      "aqi": 58,
      "co2": 507,
      "createdAt": "2025_8_2_1_51_0",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 16,
      "pm25": 9,
      "temp": 29.4375,
      "voc": 0
    },
    "1_51_15": {
      "aqi": 61,
      "co2": 540,
      "createdAt": "2025_8_2_1_51_15",
      "hum": 80.9,
      "no2": 0,
      "pm1": 4,
      "pm10": 17,
      "pm25": 10,
      "temp": 29.3125,
      "voc": 0
    },
    "1_51_22": {
      "aqi": 61,
      "co2": 540,
      "createdAt": "2025_8_2_1_51_22",
      "hum": 81,
      "no2": 0,
      "pm1": 3,
      "pm10": 16,
      "pm25": 9,
      "temp": 29.375,
      "voc": 0
    },
    "1_51_29": {
      "aqi": 61,
      "co2": 543,
      "createdAt": "2025_8_2_1_51_29",
      "hum": 81,
      "no2": 0,
      "pm1": 3,
      "pm10": 17,
      "pm25": 9,
      "temp": 29.3125,
      "voc": 0
    },
    "1_51_36": {
      "aqi": 61,
      "co2": 535,
      "createdAt": "2025_8_2_1_51_36",
      "hum": 81,
      "no2": 0,
      "pm1": 3,
      "pm10": 17,
      "pm25": 9,
      "temp": 29.375,
      "voc": 0
    },
    "1_51_7": {
      "aqi": 60,
      "co2": 520,
      "createdAt": "2025_8_2_1_51_7",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 16,
      "pm25": 10,
      "temp": 29.375,
      "voc": 0
    },
    "1_55_34": {
      "aqi": 53,
      "co2": 444,
      "createdAt": "2025_8_2_1_55_34",
      "hum": 80.5,
      "no2": 0,
      "pm1": 3,
      "pm10": 15,
      "pm25": 8,
      "temp": 29.25,
      "voc": 0
    },
    "1_55_42": {
      "aqi": 52,
      "co2": 431,
      "createdAt": "2025_8_2_1_55_42",
      "hum": 80.9,
      "no2": 0,
      "pm1": 3,
      "pm10": 15,
      "pm25": 8,
      "temp": 29.375,
      "voc": 0
    },
    "1_55_49": {
      "aqi": 54,
      "co2": 448,
      "createdAt": "2025_8_2_1_55_49",
      "hum": 81,
      "no2": 0,
      "pm1": 3,
      "pm10": 15,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 0
    },
    "1_55_56": {
      "aqi": 54,
      "co2": 451,
      "createdAt": "2025_8_2_1_55_56",
      "hum": 81.2,
      "no2": 0,
      "pm1": 3,
      "pm10": 16,
      "pm25": 7,
      "temp": 29.375,
      "voc": 0
    },
    "1_56_10": {
      "aqi": 56,
      "co2": 473,
      "createdAt": "2025_8_2_1_56_10",
      "hum": 81.1,
      "no2": 0,
      "pm1": 3,
      "pm10": 16,
      "pm25": 7,
      "temp": 29.375,
      "voc": 0
    },
    "1_56_17": {
      "aqi": 56,
      "co2": 482,
      "createdAt": "2025_8_2_1_56_17",
      "hum": 81.1,
      "no2": 0,
      "pm1": 4,
      "pm10": 17,
      "pm25": 8,
      "temp": 29.3125,
      "voc": 0
    },
    "1_56_24": {
      "aqi": 56,
      "co2": 482,
      "createdAt": "2025_8_2_1_56_24",
      "hum": 81.1,
      "no2": 0,
      "pm1": 4,
      "pm10": 17,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 0
    },
    "1_56_3": {
      "aqi": 55,
      "co2": 463,
      "createdAt": "2025_8_2_1_56_3",
      "hum": 81.3,
      "no2": 0,
      "pm1": 3,
      "pm10": 16,
      "pm25": 7,
      "temp": 29.375,
      "voc": 0
    },
    "1_56_31": {
      "aqi": 56,
      "co2": 481,
      "createdAt": "2025_8_2_1_56_31",
      "hum": 80.9,
      "no2": 0,
      "pm1": 4,
      "pm10": 17,
      "pm25": 7,
      "temp": 29.375,
      "voc": 0
    },
    "1_56_38": {
      "aqi": 56,
      "co2": 481,
      "createdAt": "2025_8_2_1_56_38",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 17,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 0
    },
    "1_56_45": {
      "aqi": 57,
      "co2": 487,
      "createdAt": "2025_8_2_1_56_45",
      "hum": 80.9,
      "no2": 0,
      "pm1": 4,
      "pm10": 17,
      "pm25": 7,
      "temp": 29.25,
      "voc": 0
    },
    "1_56_52": {
      "aqi": 56,
      "co2": 480,
      "createdAt": "2025_8_2_1_56_52",
      "hum": 80.9,
      "no2": 0,
      "pm1": 4,
      "pm10": 18,
      "pm25": 8,
      "temp": 29.3125,
      "voc": 0
    },
    "1_56_59": {
      "aqi": 56,
      "co2": 474,
      "createdAt": "2025_8_2_1_56_59",
      "hum": 81,
      "no2": 0,
      "pm1": 3,
      "pm10": 17,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 0
    },
    "1_57_14": {
      "aqi": 56,
      "co2": 477,
      "createdAt": "2025_8_2_1_57_14",
      "hum": 81.1,
      "no2": 0,
      "pm1": 4,
      "pm10": 15,
      "pm25": 8,
      "temp": 29.3125,
      "voc": 0
    },
    "1_57_21": {
      "aqi": 56,
      "co2": 476,
      "createdAt": "2025_8_2_1_57_21",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 15,
      "pm25": 8,
      "temp": 29.375,
      "voc": 0
    },
    "1_57_28": {
      "aqi": 55,
      "co2": 469,
      "createdAt": "2025_8_2_1_57_28",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 15,
      "pm25": 8,
      "temp": 29.375,
      "voc": 0
    },
    "1_57_35": {
      "aqi": 55,
      "co2": 467,
      "createdAt": "2025_8_2_1_57_35",
      "hum": 81.1,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.375,
      "voc": 0
    },
    "1_57_42": {
      "aqi": 54,
      "co2": 456,
      "createdAt": "2025_8_2_1_57_42",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.375,
      "voc": 0
    },
    "1_57_50": {
      "aqi": 54,
      "co2": 448,
      "createdAt": "2025_8_2_1_57_50",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 0
    },
    "1_57_57": {
      "aqi": 53,
      "co2": 447,
      "createdAt": "2025_8_2_1_57_57",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 0
    },
    "1_57_7": {
      "aqi": 56,
      "co2": 474,
      "createdAt": "2025_8_2_1_57_7",
      "hum": 81,
      "no2": 0,
      "pm1": 3,
      "pm10": 17,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 0
    },
    "1_58_11": {
      "aqi": 53,
      "co2": 445,
      "createdAt": "2025_8_2_1_58_11",
      "hum": 81.2,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 8,
      "temp": 29.3125,
      "voc": 0
    },
    "1_58_18": {
      "aqi": 54,
      "co2": 448,
      "createdAt": "2025_8_2_1_58_18",
      "hum": 81.2,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 8,
      "temp": 29.3125,
      "voc": 0
    },
    "1_58_25": {
      "aqi": 54,
      "co2": 448,
      "createdAt": "2025_8_2_1_58_25",
      "hum": 81.5,
      "no2": 0,
      "pm1": 3,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.375,
      "voc": 0
    },
    "1_58_33": {
      "aqi": 54,
      "co2": 455,
      "createdAt": "2025_8_2_1_58_33",
      "hum": 83,
      "no2": 0,
      "pm1": 3,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.375,
      "voc": 0
    },
    "1_58_4": {
      "aqi": 53,
      "co2": 446,
      "createdAt": "2025_8_2_1_58_4",
      "hum": 81,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 8,
      "temp": 29.375,
      "voc": 0
    },
    "1_58_40": {
      "aqi": 62,
      "co2": 547,
      "createdAt": "2025_8_2_1_58_40",
      "hum": 82,
      "no2": 0,
      "pm1": 3,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 0
    },
    "1_58_47": {
      "aqi": 70,
      "co2": 640,
      "createdAt": "2025_8_2_1_58_47",
      "hum": 81.9,
      "no2": 0,
      "pm1": 3,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 0
    },
    "1_58_54": {
      "aqi": 71,
      "co2": 658,
      "createdAt": "2025_8_2_1_58_54",
      "hum": 81.8,
      "no2": 0,
      "pm1": 3,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 0
    },
    "1_59_16": {
      "aqi": 73,
      "co2": 678,
      "createdAt": "2025_8_2_1_59_16",
      "hum": 81.5,
      "no2": 0,
      "pm1": 3,
      "pm10": 14,
      "pm25": 8,
      "temp": 29.5625,
      "voc": 0
    },
    "1_59_2": {
      "aqi": 72,
      "co2": 669,
      "createdAt": "2025_8_2_1_59_2",
      "hum": 81.6,
      "no2": 0,
      "pm1": 3,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.5625,
      "voc": 0
    },
    "1_59_23": {
      "aqi": 73,
      "co2": 678,
      "createdAt": "2025_8_2_1_59_23",
      "hum": 81.4,
      "no2": 0,
      "pm1": 3,
      "pm10": 15,
      "pm25": 9,
      "temp": 29.5625,
      "voc": 0
    },
    "1_59_30": {
      "aqi": 73,
      "co2": 678,
      "createdAt": "2025_8_2_1_59_30",
      "hum": 82.4,
      "no2": 0,
      "pm1": 3,
      "pm10": 15,
      "pm25": 9,
      "temp": 29.625,
      "voc": 0
    },
    "1_59_37": {
      "aqi": 72,
      "co2": 665,
      "createdAt": "2025_8_2_1_59_37",
      "hum": 82.5,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.625,
      "voc": 0
    },
    "1_59_45": {
      "aqi": 69,
      "co2": 634,
      "createdAt": "2025_8_2_1_59_45",
      "hum": 82.6,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.6875,
      "voc": 0
    },
    "1_59_52": {
      "aqi": 67,
      "co2": 610,
      "createdAt": "2025_8_2_1_59_52",
      "hum": 82.2,
      "no2": 0,
      "pm1": 3,
      "pm10": 9,
      "pm25": 7,
      "temp": 29.75,
      "voc": 0
    },
    "1_59_59": {
      "aqi": 66,
      "co2": 602,
      "createdAt": "2025_8_2_1_59_59",
      "hum": 81.5,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.625,
      "voc": 0
    },
    "1_59_9": {
      "aqi": 72,
      "co2": 670,
      "createdAt": "2025_8_2_1_59_9",
      "hum": 81.6,
      "no2": 0,
      "pm1": 3,
      "pm10": 14,
      "pm25": 8,
      "temp": 29.5,
      "voc": 0
    },
    "2_0_13": {
      "aqi": 66,
      "co2": 602,
      "createdAt": "2025_8_2_2_0_13",
      "hum": 81.1,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.625,
      "voc": 0
    },
    "2_0_20": {
      "aqi": 66,
      "co2": 596,
      "createdAt": "2025_8_2_2_0_20",
      "hum": 81,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.625,
      "voc": 0
    },
    "2_0_28": {
      "aqi": 66,
      "co2": 594,
      "createdAt": "2025_8_2_2_0_28",
      "hum": 80.9,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.5625,
      "voc": 0
    },
    "2_0_35": {
      "aqi": 65,
      "co2": 590,
      "createdAt": "2025_8_2_2_0_35",
      "hum": 80.8,
      "no2": 0,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.5625,
      "voc": 0
    },
    "2_0_42": {
      "aqi": 65,
      "co2": 584,
      "createdAt": "2025_8_2_2_0_42",
      "hum": 80.7,
      "no2": 0,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.5625,
      "voc": 0
    },
    "2_0_49": {
      "aqi": 65,
      "co2": 583,
      "createdAt": "2025_8_2_2_0_49",
      "hum": 80.5,
      "no2": 0,
      "pm1": 4,
      "pm10": 11,
      "pm25": 8,
      "temp": 29.5,
      "voc": 0
    },
    "2_0_56": {
      "aqi": 65,
      "co2": 588,
      "createdAt": "2025_8_2_2_0_56",
      "hum": 80.9,
      "no2": 0,
      "pm1": 4,
      "pm10": 12,
      "pm25": 8,
      "temp": 29.5,
      "voc": 0
    },
    "2_0_6": {
      "aqi": 66,
      "co2": 602,
      "createdAt": "2025_8_2_2_0_6",
      "hum": 81.3,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.625,
      "voc": 0
    },
    "2_10_1": {
      "aqi": 47,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_1",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.4375,
      "voc": 94
    },
    "2_10_15": {
      "aqi": 47,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_15",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 95
    },
    "2_10_22": {
      "aqi": 47,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_22",
      "hum": 80.9,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.375,
      "voc": 95
    },
    "2_10_30": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_30",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 96
    },
    "2_10_37": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_37",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 96
    },
    "2_10_44": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_44",
      "hum": 81.1,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 96
    },
    "2_10_51": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_51",
      "hum": 80.9,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 96
    },
    "2_10_58": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_58",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 96
    },
    "2_10_8": {
      "aqi": 47,
      "co2": 0,
      "createdAt": "2025_8_2_2_10_8",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 95
    },
    "2_11_13": {
      "aqi": 47,
      "co2": 0,
      "createdAt": "2025_8_2_2_11_13",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 95
    },
    "2_11_20": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_11_20",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 96
    },
    "2_11_28": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_11_28",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 96
    },
    "2_11_35": {
      "aqi": 47,
      "co2": 0,
      "createdAt": "2025_8_2_2_11_35",
      "hum": 81.1,
      "no2": 1,
      "pm1": 2,
      "pm10": 7,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 95
    },
    "2_11_42": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_11_42",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 96
    },
    "2_11_49": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_11_49",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.25,
      "voc": 96
    },
    "2_11_5": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_11_5",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 96
    },
    "2_11_56": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_11_56",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 96
    },
    "2_12_11": {
      "aqi": 49,
      "co2": 0,
      "createdAt": "2025_8_2_2_12_11",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 6,
      "temp": 29.375,
      "voc": 98
    },
    "2_12_18": {
      "aqi": 49,
      "co2": 0,
      "createdAt": "2025_8_2_2_12_18",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 8,
      "pm25": 7,
      "temp": 29.375,
      "voc": 98
    },
    "2_12_25": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_12_25",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 8,
      "temp": 29.3125,
      "voc": 97
    },
    "2_12_3": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_12_3",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 97
    },
    "2_12_32": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_12_32",
      "hum": 81.3,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 8,
      "temp": 29.375,
      "voc": 97
    },
    "2_12_39": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_12_39",
      "hum": 81.5,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 8,
      "temp": 29.375,
      "voc": 97
    },
    "2_12_46": {
      "aqi": 49,
      "co2": 0,
      "createdAt": "2025_8_2_2_12_46",
      "hum": 81.3,
      "no2": 1,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 98
    },
    "2_12_53": {
      "aqi": 49,
      "co2": 0,
      "createdAt": "2025_8_2_2_12_53",
      "hum": 81.2,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.4375,
      "voc": 98
    },
    "2_13_0": {
      "aqi": 49,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_0",
      "hum": 82,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.4375,
      "voc": 99
    },
    "2_13_15": {
      "aqi": 50,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_15",
      "hum": 81.9,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.5625,
      "voc": 100
    },
    "2_13_22": {
      "aqi": 50,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_22",
      "hum": 81.7,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.5625,
      "voc": 100
    },
    "2_13_29": {
      "aqi": 50,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_29",
      "hum": 81.3,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.5625,
      "voc": 100
    },
    "2_13_36": {
      "aqi": 55,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_36",
      "hum": 81.1,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.625,
      "voc": 105
    },
    "2_13_43": {
      "aqi": 59,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_43",
      "hum": 83.4,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.5625,
      "voc": 109
    },
    "2_13_51": {
      "aqi": 65,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_51",
      "hum": 82.4,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.625,
      "voc": 115
    },
    "2_13_58": {
      "aqi": 70,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_58",
      "hum": 81.4,
      "no2": 1,
      "pm1": 2,
      "pm10": 14,
      "pm25": 6,
      "temp": 29.625,
      "voc": 120
    },
    "2_13_8": {
      "aqi": 50,
      "co2": 0,
      "createdAt": "2025_8_2_2_13_8",
      "hum": 82,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.5,
      "voc": 100
    },
    "2_14_22": {
      "aqi": 72,
      "co2": 0,
      "createdAt": "2025_8_2_2_14_22",
      "hum": 81.4,
      "no2": 1,
      "pm1": 1,
      "pm10": 13,
      "pm25": 5,
      "temp": 29.5,
      "voc": 122
    },
    "2_14_47": {
      "aqi": 70,
      "co2": 0,
      "createdAt": "2025_8_2_2_14_47",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 12,
      "pm25": 5,
      "temp": 29.375,
      "voc": 120
    },
    "2_14_54": {
      "aqi": 68,
      "co2": 0,
      "createdAt": "2025_8_2_2_14_54",
      "hum": 80.5,
      "no2": 1,
      "pm1": 2,
      "pm10": 12,
      "pm25": 6,
      "temp": 29.375,
      "voc": 118
    },
    "2_15_1": {
      "aqi": 67,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_1",
      "hum": 80.5,
      "no2": 1,
      "pm1": 2,
      "pm10": 12,
      "pm25": 6,
      "temp": 29.375,
      "voc": 117
    },
    "2_15_16": {
      "aqi": 63,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_16",
      "hum": 80.4,
      "no2": 1,
      "pm1": 1,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.375,
      "voc": 113
    },
    "2_15_23": {
      "aqi": 62,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_23",
      "hum": 80.5,
      "no2": 1,
      "pm1": 1,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.375,
      "voc": 112
    },
    "2_15_30": {
      "aqi": 60,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_30",
      "hum": 80.5,
      "no2": 1,
      "pm1": 3,
      "pm10": 9,
      "pm25": 7,
      "temp": 29.375,
      "voc": 110
    },
    "2_15_37": {
      "aqi": 59,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_37",
      "hum": 80.5,
      "no2": 1,
      "pm1": 3,
      "pm10": 8,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 109
    },
    "2_15_44": {
      "aqi": 57,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_44",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 8,
      "pm25": 7,
      "temp": 29.375,
      "voc": 107
    },
    "2_15_51": {
      "aqi": 54,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_51",
      "hum": 80.8,
      "no2": 1,
      "pm1": 2,
      "pm10": 7,
      "pm25": 7,
      "temp": 29.375,
      "voc": 104
    },
    "2_15_59": {
      "aqi": 53,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_59",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 7,
      "pm25": 7,
      "temp": 29.375,
      "voc": 103
    },
    "2_15_9": {
      "aqi": 65,
      "co2": 0,
      "createdAt": "2025_8_2_2_15_9",
      "hum": 80.5,
      "no2": 1,
      "pm1": 1,
      "pm10": 10,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 115
    },
    "2_16_13": {
      "aqi": 50,
      "co2": 0,
      "createdAt": "2025_8_2_2_16_13",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 6,
      "temp": 29.375,
      "voc": 100
    },
    "2_16_20": {
      "aqi": 49,
      "co2": 0,
      "createdAt": "2025_8_2_2_16_20",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 6,
      "temp": 29.375,
      "voc": 99
    },
    "2_16_27": {
      "aqi": 49,
      "co2": 0,
      "createdAt": "2025_8_2_2_16_27",
      "hum": 81.1,
      "no2": 1,
      "pm1": 2,
      "pm10": 8,
      "pm25": 6,
      "temp": 29.375,
      "voc": 98
    },
    "2_16_35": {
      "aqi": 49,
      "co2": 0,
      "createdAt": "2025_8_2_2_16_35",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 8,
      "pm25": 6,
      "temp": 29.375,
      "voc": 98
    },
    "2_16_42": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_16_42",
      "hum": 80.8,
      "no2": 1,
      "pm1": 2,
      "pm10": 8,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 97
    },
    "2_16_49": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_16_49",
      "hum": 80.7,
      "no2": 1,
      "pm1": 1,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 96
    },
    "2_16_56": {
      "aqi": 48,
      "co2": 0,
      "createdAt": "2025_8_2_2_16_56",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.375,
      "voc": 96
    },
    "2_16_6": {
      "aqi": 51,
      "co2": 0,
      "createdAt": "2025_8_2_2_16_6",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 101
    },
    "2_1_11": {
      "aqi": 66,
      "co2": 598,
      "createdAt": "2025_8_2_2_1_11",
      "hum": 81.2,
      "no2": 0,
      "pm1": 4,
      "pm10": 13,
      "pm25": 8,
      "temp": 29.5,
      "voc": 0
    },
    "2_1_18": {
      "aqi": 67,
      "co2": 604,
      "createdAt": "2025_8_2_2_1_18",
      "hum": 80.9,
      "no2": 0,
      "pm1": 4,
      "pm10": 13,
      "pm25": 9,
      "temp": 29.5625,
      "voc": 0
    },
    "2_1_25": {
      "aqi": 69,
      "co2": 632,
      "createdAt": "2025_8_2_2_1_25",
      "hum": 81.4,
      "no2": 0,
      "pm1": 3,
      "pm10": 11,
      "pm25": 8,
      "temp": 29.5,
      "voc": 0
    },
    "2_1_3": {
      "aqi": 66,
      "co2": 593,
      "createdAt": "2025_8_2_2_1_3",
      "hum": 80.7,
      "no2": 0,
      "pm1": 4,
      "pm10": 13,
      "pm25": 8,
      "temp": 29.5,
      "voc": 0
    },
    "2_1_32": {
      "aqi": 75,
      "co2": 708,
      "createdAt": "2025_8_2_2_1_32",
      "hum": 80.9,
      "no2": 0,
      "pm1": 3,
      "pm10": 12,
      "pm25": 8,
      "temp": 29.5,
      "voc": 0
    },
    "2_1_39": {
      "aqi": 78,
      "co2": 746,
      "createdAt": "2025_8_2_2_1_39",
      "hum": 80.8,
      "no2": 0,
      "pm1": 3,
      "pm10": 12,
      "pm25": 8,
      "temp": 29.5,
      "voc": 0
    },
    "2_1_46": {
      "aqi": 80,
      "co2": 767,
      "createdAt": "2025_8_2_2_1_46",
      "hum": 80.8,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 9,
      "temp": 29.5,
      "voc": 0
    },
    "2_1_54": {
      "aqi": 80,
      "co2": 767,
      "createdAt": "2025_8_2_2_1_54",
      "hum": 80.5,
      "no2": 0,
      "pm1": 4,
      "pm10": 14,
      "pm25": 10,
      "temp": 29.5,
      "voc": 0
    },
    "2_2_1": {
      "aqi": 80,
      "co2": 768,
      "createdAt": "2025_8_2_2_2_1",
      "hum": 80.7,
      "no2": 1,
      "pm1": 4,
      "pm10": 15,
      "pm25": 10,
      "temp": 29.5,
      "voc": 1
    },
    "2_2_16": {
      "aqi": 79,
      "co2": 756,
      "createdAt": "2025_8_2_2_2_16",
      "hum": 80.7,
      "no2": 1,
      "pm1": 4,
      "pm10": 16,
      "pm25": 10,
      "temp": 29.5,
      "voc": 2
    },
    "2_2_23": {
      "aqi": 80,
      "co2": 762,
      "createdAt": "2025_8_2_2_2_23",
      "hum": 81,
      "no2": 1,
      "pm1": 4,
      "pm10": 16,
      "pm25": 10,
      "temp": 29.5,
      "voc": 4
    },
    "2_2_30": {
      "aqi": 79,
      "co2": 759,
      "createdAt": "2025_8_2_2_2_30",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 14,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 7
    },
    "2_2_37": {
      "aqi": 79,
      "co2": 751,
      "createdAt": "2025_8_2_2_2_37",
      "hum": 80.7,
      "no2": 1,
      "pm1": 2,
      "pm10": 15,
      "pm25": 8,
      "temp": 29.5,
      "voc": 11
    },
    "2_2_44": {
      "aqi": 77,
      "co2": 730,
      "createdAt": "2025_8_2_2_2_44",
      "hum": 80.5,
      "no2": 1,
      "pm1": 2,
      "pm10": 16,
      "pm25": 7,
      "temp": 29.5,
      "voc": 14
    },
    "2_2_51": {
      "aqi": 75,
      "co2": 705,
      "createdAt": "2025_8_2_2_2_51",
      "hum": 80.6,
      "no2": 1,
      "pm1": 2,
      "pm10": 16,
      "pm25": 7,
      "temp": 29.5625,
      "voc": 17
    },
    "2_2_58": {
      "aqi": 71,
      "co2": 661,
      "createdAt": "2025_8_2_2_2_58",
      "hum": 80.7,
      "no2": 1,
      "pm1": 1,
      "pm10": 16,
      "pm25": 6,
      "temp": 29.5625,
      "voc": 20
    },
    "2_2_9": {
      "aqi": 80,
      "co2": 762,
      "createdAt": "2025_8_2_2_2_9",
      "hum": 80.7,
      "no2": 1,
      "pm1": 4,
      "pm10": 15,
      "pm25": 10,
      "temp": 29.5,
      "voc": 1
    },
    "2_32_24": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_8_2_2_32_24",
      "hum": 81,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.125,
      "voc": 0
    },
    "2_32_32": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_8_2_2_32_32",
      "hum": 82,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.1875,
      "voc": 0
    },
    "2_32_39": {
      "aqi": 51,
      "co2": 415,
      "createdAt": "2025_8_2_2_32_39",
      "hum": 82.2,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.1875,
      "voc": 0
    },
    "2_32_46": {
      "aqi": 53,
      "co2": 444,
      "createdAt": "2025_8_2_2_32_46",
      "hum": 82.1,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.1875,
      "voc": 0
    },
    "2_32_53": {
      "aqi": 57,
      "co2": 490,
      "createdAt": "2025_8_2_2_32_53",
      "hum": 82,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.1875,
      "voc": 0
    },
    "2_33_0": {
      "aqi": 59,
      "co2": 511,
      "createdAt": "2025_8_2_2_33_0",
      "hum": 81.8,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.25,
      "voc": 0
    },
    "2_33_14": {
      "aqi": 59,
      "co2": 514,
      "createdAt": "2025_8_2_2_33_14",
      "hum": 81.7,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.1875,
      "voc": 0
    },
    "2_33_21": {
      "aqi": 60,
      "co2": 520,
      "createdAt": "2025_8_2_2_33_21",
      "hum": 81.7,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.125,
      "voc": 0
    },
    "2_33_29": {
      "aqi": 60,
      "co2": 524,
      "createdAt": "2025_8_2_2_33_29",
      "hum": 81.7,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.125,
      "voc": 0
    },
    "2_33_36": {
      "aqi": 60,
      "co2": 523,
      "createdAt": "2025_8_2_2_33_36",
      "hum": 81.7,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.125,
      "voc": 0
    },
    "2_33_43": {
      "aqi": 61,
      "co2": 532,
      "createdAt": "2025_8_2_2_33_43",
      "hum": 81.6,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_33_50": {
      "aqi": 61,
      "co2": 536,
      "createdAt": "2025_8_2_2_33_50",
      "hum": 81.6,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.125,
      "voc": 0
    },
    "2_33_57": {
      "aqi": 60,
      "co2": 528,
      "createdAt": "2025_8_2_2_33_57",
      "hum": 81.6,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_33_7": {
      "aqi": 59,
      "co2": 512,
      "createdAt": "2025_8_2_2_33_7",
      "hum": 81.7,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.1875,
      "voc": 0
    },
    "2_34_12": {
      "aqi": 57,
      "co2": 487,
      "createdAt": "2025_8_2_2_34_12",
      "hum": 81.6,
      "no2": 0,
      "pm1": 0,
      "pm10": 8,
      "pm25": 6,
      "temp": 29.125,
      "voc": 0
    },
    "2_34_19": {
      "aqi": 56,
      "co2": 476,
      "createdAt": "2025_8_2_2_34_19",
      "hum": 81.5,
      "no2": 0,
      "pm1": 0,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.125,
      "voc": 0
    },
    "2_34_26": {
      "aqi": 55,
      "co2": 468,
      "createdAt": "2025_8_2_2_34_26",
      "hum": 81.5,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_34_33": {
      "aqi": 55,
      "co2": 465,
      "createdAt": "2025_8_2_2_34_33",
      "hum": 81.5,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.125,
      "voc": 0
    },
    "2_34_4": {
      "aqi": 58,
      "co2": 506,
      "createdAt": "2025_8_2_2_34_4",
      "hum": 81.6,
      "no2": 0,
      "pm1": 0,
      "pm10": 8,
      "pm25": 6,
      "temp": 29.125,
      "voc": 0
    },
    "2_34_40": {
      "aqi": 55,
      "co2": 464,
      "createdAt": "2025_8_2_2_34_40",
      "hum": 81.6,
      "no2": 0,
      "pm1": 0,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.1875,
      "voc": 0
    },
    "2_34_47": {
      "aqi": 55,
      "co2": 467,
      "createdAt": "2025_8_2_2_34_47",
      "hum": 81.5,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.125,
      "voc": 0
    },
    "2_34_55": {
      "aqi": 55,
      "co2": 460,
      "createdAt": "2025_8_2_2_34_55",
      "hum": 81.5,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.125,
      "voc": 0
    },
    "2_35_16": {
      "aqi": 54,
      "co2": 450,
      "createdAt": "2025_8_2_2_35_16",
      "hum": 81.7,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.125,
      "voc": 0
    },
    "2_35_2": {
      "aqi": 54,
      "co2": 449,
      "createdAt": "2025_8_2_2_35_2",
      "hum": 81.5,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_35_23": {
      "aqi": 54,
      "co2": 452,
      "createdAt": "2025_8_2_2_35_23",
      "hum": 81.7,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_35_30": {
      "aqi": 71,
      "co2": 663,
      "createdAt": "2025_8_2_2_35_30",
      "hum": 81.9,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_35_38": {
      "aqi": 78,
      "co2": 747,
      "createdAt": "2025_8_2_2_35_38",
      "hum": 81.7,
      "no2": 0,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_35_45": {
      "aqi": 80,
      "co2": 767,
      "createdAt": "2025_8_2_2_35_45",
      "hum": 81.7,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.1875,
      "voc": 0
    },
    "2_35_53": {
      "aqi": 81,
      "co2": 775,
      "createdAt": "2025_8_2_2_35_53",
      "hum": 81.7,
      "no2": 0,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.1875,
      "voc": 0
    },
    "2_35_9": {
      "aqi": 53,
      "co2": 447,
      "createdAt": "2025_8_2_2_35_9",
      "hum": 81.6,
      "no2": 0,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_36_0": {
      "aqi": 81,
      "co2": 779,
      "createdAt": "2025_8_2_2_36_0",
      "hum": 81.6,
      "no2": 0,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.25,
      "voc": 0
    },
    "2_36_14": {
      "aqi": 74,
      "co2": 693,
      "createdAt": "2025_8_2_2_36_14",
      "hum": 81.6,
      "no2": 0,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.25,
      "voc": 0
    },
    "2_36_21": {
      "aqi": 68,
      "co2": 627,
      "createdAt": "2025_8_2_2_36_21",
      "hum": 81.5,
      "no2": 0,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 0
    },
    "2_36_28": {
      "aqi": 65,
      "co2": 589,
      "createdAt": "2025_8_2_2_36_28",
      "hum": 81.5,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 5,
      "temp": 29.1875,
      "voc": 0
    },
    "2_36_36": {
      "aqi": 62,
      "co2": 554,
      "createdAt": "2025_8_2_2_36_36",
      "hum": 81.6,
      "no2": 0,
      "pm1": 2,
      "pm10": 10,
      "pm25": 5,
      "temp": 29.25,
      "voc": 0
    },
    "2_36_43": {
      "aqi": 61,
      "co2": 538,
      "createdAt": "2025_8_2_2_36_43",
      "hum": 81.7,
      "no2": 0,
      "pm1": 2,
      "pm10": 10,
      "pm25": 5,
      "temp": 29.25,
      "voc": 0
    },
    "2_36_50": {
      "aqi": 60,
      "co2": 524,
      "createdAt": "2025_8_2_2_36_50",
      "hum": 81.4,
      "no2": 0,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 0
    },
    "2_36_57": {
      "aqi": 59,
      "co2": 514,
      "createdAt": "2025_8_2_2_36_57",
      "hum": 81.4,
      "no2": 0,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 0
    },
    "2_36_7": {
      "aqi": 81,
      "co2": 775,
      "createdAt": "2025_8_2_2_36_7",
      "hum": 81.5,
      "no2": 0,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.25,
      "voc": 0
    },
    "2_37_11": {
      "aqi": 57,
      "co2": 494,
      "createdAt": "2025_8_2_2_37_11",
      "hum": 81.6,
      "no2": 0,
      "pm1": 1,
      "pm10": 10,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 0
    },
    "2_37_19": {
      "aqi": 56,
      "co2": 481,
      "createdAt": "2025_8_2_2_37_19",
      "hum": 81.4,
      "no2": 0,
      "pm1": 1,
      "pm10": 10,
      "pm25": 5,
      "temp": 29.25,
      "voc": 0
    },
    "2_37_26": {
      "aqi": 56,
      "co2": 473,
      "createdAt": "2025_8_2_2_37_26",
      "hum": 81.2,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 0
    },
    "2_37_33": {
      "aqi": 56,
      "co2": 472,
      "createdAt": "2025_8_2_2_37_33",
      "hum": 81.4,
      "no2": 0,
      "pm1": 2,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 0
    },
    "2_37_4": {
      "aqi": 58,
      "co2": 507,
      "createdAt": "2025_8_2_2_37_4",
      "hum": 81.8,
      "no2": 0,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 0
    },
    "2_37_40": {
      "aqi": 55,
      "co2": 464,
      "createdAt": "2025_8_2_2_37_40",
      "hum": 81.7,
      "no2": 0,
      "pm1": 2,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 0
    },
    "2_37_47": {
      "aqi": 54,
      "co2": 457,
      "createdAt": "2025_8_2_2_37_47",
      "hum": 81.9,
      "no2": 0,
      "pm1": 1,
      "pm10": 7,
      "pm25": 3,
      "temp": 29.25,
      "voc": 0
    },
    "2_37_54": {
      "aqi": 54,
      "co2": 452,
      "createdAt": "2025_8_2_2_37_54",
      "hum": 81.7,
      "no2": 0,
      "pm1": 1,
      "pm10": 6,
      "pm25": 3,
      "temp": 29.3125,
      "voc": 0
    },
    "2_38_1": {
      "aqi": 54,
      "co2": 452,
      "createdAt": "2025_8_2_2_38_1",
      "hum": 82.2,
      "no2": 0,
      "pm1": 1,
      "pm10": 6,
      "pm25": 3,
      "temp": 29.3125,
      "voc": 0
    },
    "2_38_16": {
      "aqi": 54,
      "co2": 458,
      "createdAt": "2025_8_2_2_38_16",
      "hum": 81.8,
      "no2": 0,
      "pm1": 1,
      "pm10": 6,
      "pm25": 3,
      "temp": 29.375,
      "voc": 0
    },
    "2_38_23": {
      "aqi": 54,
      "co2": 455,
      "createdAt": "2025_8_2_2_38_23",
      "hum": 81.7,
      "no2": 0,
      "pm1": 1,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.375,
      "voc": 0
    },
    "2_38_30": {
      "aqi": 54,
      "co2": 458,
      "createdAt": "2025_8_2_2_38_30",
      "hum": 81.7,
      "no2": 0,
      "pm1": 1,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.375,
      "voc": 0
    },
    "2_38_37": {
      "aqi": 55,
      "co2": 466,
      "createdAt": "2025_8_2_2_38_37",
      "hum": 81.5,
      "no2": 0,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 0
    },
    "2_38_45": {
      "aqi": 55,
      "co2": 469,
      "createdAt": "2025_8_2_2_38_45",
      "hum": 81.3,
      "no2": 0,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 0
    },
    "2_38_52": {
      "aqi": 57,
      "co2": 485,
      "createdAt": "2025_8_2_2_38_52",
      "hum": 81.3,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 1
    },
    "2_38_59": {
      "aqi": 57,
      "co2": 490,
      "createdAt": "2025_8_2_2_38_59",
      "hum": 81.2,
      "no2": 1,
      "pm1": 2,
      "pm10": 6,
      "pm25": 6,
      "temp": 29.4375,
      "voc": 1
    },
    "2_38_9": {
      "aqi": 54,
      "co2": 456,
      "createdAt": "2025_8_2_2_38_9",
      "hum": 81.7,
      "no2": 0,
      "pm1": 1,
      "pm10": 6,
      "pm25": 3,
      "temp": 29.375,
      "voc": 0
    },
    "2_39_14": {
      "aqi": 56,
      "co2": 482,
      "createdAt": "2025_8_2_2_39_14",
      "hum": 81.3,
      "no2": 1,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.375,
      "voc": 3
    },
    "2_39_21": {
      "aqi": 56,
      "co2": 480,
      "createdAt": "2025_8_2_2_39_21",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 6
    },
    "2_39_28": {
      "aqi": 57,
      "co2": 485,
      "createdAt": "2025_8_2_2_39_28",
      "hum": 81.2,
      "no2": 1,
      "pm1": 2,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 12
    },
    "2_39_35": {
      "aqi": 57,
      "co2": 492,
      "createdAt": "2025_8_2_2_39_35",
      "hum": 81.5,
      "no2": 1,
      "pm1": 2,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 16
    },
    "2_39_43": {
      "aqi": 57,
      "co2": 489,
      "createdAt": "2025_8_2_2_39_43",
      "hum": 81.5,
      "no2": 1,
      "pm1": 2,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.5,
      "voc": 19
    },
    "2_39_50": {
      "aqi": 58,
      "co2": 496,
      "createdAt": "2025_8_2_2_39_50",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.4375,
      "voc": 23
    },
    "2_39_57": {
      "aqi": 58,
      "co2": 496,
      "createdAt": "2025_8_2_2_39_57",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.5,
      "voc": 27
    },
    "2_39_7": {
      "aqi": 57,
      "co2": 494,
      "createdAt": "2025_8_2_2_39_7",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 2
    },
    "2_3_13": {
      "aqi": 71,
      "co2": 658,
      "createdAt": "2025_8_2_2_3_13",
      "hum": 80.7,
      "no2": 1,
      "pm1": 1,
      "pm10": 16,
      "pm25": 6,
      "temp": 29.5,
      "voc": 28
    },
    "2_3_20": {
      "aqi": 72,
      "co2": 673,
      "createdAt": "2025_8_2_2_3_20",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 16,
      "pm25": 6,
      "temp": 29.5625,
      "voc": 31
    },
    "2_3_27": {
      "aqi": 73,
      "co2": 683,
      "createdAt": "2025_8_2_2_3_27",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 15,
      "pm25": 6,
      "temp": 29.5625,
      "voc": 34
    },
    "2_3_34": {
      "aqi": 74,
      "co2": 691,
      "createdAt": "2025_8_2_2_3_34",
      "hum": 80.5,
      "no2": 1,
      "pm1": 1,
      "pm10": 15,
      "pm25": 6,
      "temp": 29.5,
      "voc": 38
    },
    "2_3_41": {
      "aqi": 74,
      "co2": 691,
      "createdAt": "2025_8_2_2_3_41",
      "hum": 80.5,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 6,
      "temp": 29.5,
      "voc": 41
    },
    "2_3_49": {
      "aqi": 73,
      "co2": 687,
      "createdAt": "2025_8_2_2_3_49",
      "hum": 80.4,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 6,
      "temp": 29.5,
      "voc": 44
    },
    "2_3_56": {
      "aqi": 71,
      "co2": 663,
      "createdAt": "2025_8_2_2_3_56",
      "hum": 80.3,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.5,
      "voc": 46
    },
    "2_3_6": {
      "aqi": 71,
      "co2": 653,
      "createdAt": "2025_8_2_2_3_6",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 16,
      "pm25": 6,
      "temp": 29.5,
      "voc": 25
    },
    "2_40_11": {
      "aqi": 58,
      "co2": 497,
      "createdAt": "2025_8_2_2_40_11",
      "hum": 81.3,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 4,
      "temp": 29.5,
      "voc": 39
    },
    "2_40_18": {
      "aqi": 58,
      "co2": 498,
      "createdAt": "2025_8_2_2_40_18",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 4,
      "temp": 29.4375,
      "voc": 43
    },
    "2_40_26": {
      "aqi": 58,
      "co2": 498,
      "createdAt": "2025_8_2_2_40_26",
      "hum": 81.4,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 4,
      "temp": 29.4375,
      "voc": 46
    },
    "2_40_33": {
      "aqi": 58,
      "co2": 499,
      "createdAt": "2025_8_2_2_40_33",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.5,
      "voc": 50
    },
    "2_40_4": {
      "aqi": 58,
      "co2": 499,
      "createdAt": "2025_8_2_2_40_4",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 4,
      "temp": 29.5,
      "voc": 33
    },
    "2_40_40": {
      "aqi": 58,
      "co2": 503,
      "createdAt": "2025_8_2_2_40_40",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 52
    },
    "2_40_47": {
      "aqi": 58,
      "co2": 506,
      "createdAt": "2025_8_2_2_40_47",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 55
    },
    "2_40_54": {
      "aqi": 58,
      "co2": 505,
      "createdAt": "2025_8_2_2_40_54",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 57
    },
    "2_41_1": {
      "aqi": 59,
      "co2": 510,
      "createdAt": "2025_8_2_2_41_1",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 59
    },
    "2_41_16": {
      "aqi": 59,
      "co2": 508,
      "createdAt": "2025_8_2_2_41_16",
      "hum": 81.3,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 66
    },
    "2_41_23": {
      "aqi": 58,
      "co2": 506,
      "createdAt": "2025_8_2_2_41_23",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 70
    },
    "2_41_30": {
      "aqi": 59,
      "co2": 515,
      "createdAt": "2025_8_2_2_41_30",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 74
    },
    "2_41_37": {
      "aqi": 60,
      "co2": 526,
      "createdAt": "2025_8_2_2_41_37",
      "hum": 81.6,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 76
    },
    "2_41_45": {
      "aqi": 61,
      "co2": 536,
      "createdAt": "2025_8_2_2_41_45",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.375,
      "voc": 79
    },
    "2_41_52": {
      "aqi": 60,
      "co2": 529,
      "createdAt": "2025_8_2_2_41_52",
      "hum": 81.3,
      "no2": 1,
      "pm1": 0,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.4375,
      "voc": 81
    },
    "2_41_59": {
      "aqi": 60,
      "co2": 522,
      "createdAt": "2025_8_2_2_41_59",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 4,
      "temp": 29.4375,
      "voc": 82
    },
    "2_41_9": {
      "aqi": 59,
      "co2": 510,
      "createdAt": "2025_8_2_2_41_9",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 61
    },
    "2_42_13": {
      "aqi": 58,
      "co2": 507,
      "createdAt": "2025_8_2_2_42_13",
      "hum": 81,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 6,
      "temp": 29.375,
      "voc": 83
    },
    "2_42_21": {
      "aqi": 59,
      "co2": 514,
      "createdAt": "2025_8_2_2_42_21",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 6,
      "temp": 29.375,
      "voc": 84
    },
    "2_42_28": {
      "aqi": 59,
      "co2": 509,
      "createdAt": "2025_8_2_2_42_28",
      "hum": 81.5,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 85
    },
    "2_42_35": {
      "aqi": 59,
      "co2": 513,
      "createdAt": "2025_8_2_2_42_35",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 85
    },
    "2_42_42": {
      "aqi": 59,
      "co2": 519,
      "createdAt": "2025_8_2_2_42_42",
      "hum": 81.3,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 85
    },
    "2_42_49": {
      "aqi": 60,
      "co2": 525,
      "createdAt": "2025_8_2_2_42_49",
      "hum": 81.5,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 85
    },
    "2_42_56": {
      "aqi": 60,
      "co2": 526,
      "createdAt": "2025_8_2_2_42_56",
      "hum": 81.3,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.4375,
      "voc": 86
    },
    "2_42_6": {
      "aqi": 59,
      "co2": 515,
      "createdAt": "2025_8_2_2_42_6",
      "hum": 80.9,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 4,
      "temp": 29.4375,
      "voc": 83
    },
    "2_43_11": {
      "aqi": 59,
      "co2": 517,
      "createdAt": "2025_8_2_2_43_11",
      "hum": 80.9,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 86
    },
    "2_43_18": {
      "aqi": 59,
      "co2": 511,
      "createdAt": "2025_8_2_2_43_18",
      "hum": 80.7,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 87
    },
    "2_43_25": {
      "aqi": 58,
      "co2": 506,
      "createdAt": "2025_8_2_2_43_25",
      "hum": 80.7,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 88
    },
    "2_43_32": {
      "aqi": 58,
      "co2": 503,
      "createdAt": "2025_8_2_2_43_32",
      "hum": 80.8,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.375,
      "voc": 88
    },
    "2_43_39": {
      "aqi": 58,
      "co2": 497,
      "createdAt": "2025_8_2_2_43_39",
      "hum": 80.7,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 88
    },
    "2_43_4": {
      "aqi": 60,
      "co2": 526,
      "createdAt": "2025_8_2_2_43_4",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.4375,
      "voc": 86
    },
    "2_43_47": {
      "aqi": 58,
      "co2": 499,
      "createdAt": "2025_8_2_2_43_47",
      "hum": 80.6,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.4375,
      "voc": 88
    },
    "2_43_54": {
      "aqi": 58,
      "co2": 499,
      "createdAt": "2025_8_2_2_43_54",
      "hum": 80.6,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.375,
      "voc": 88
    },
    "2_44_1": {
      "aqi": 57,
      "co2": 489,
      "createdAt": "2025_8_2_2_44_1",
      "hum": 80.7,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.375,
      "voc": 88
    },
    "2_44_15": {
      "aqi": 56,
      "co2": 481,
      "createdAt": "2025_8_2_2_44_15",
      "hum": 80.7,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.375,
      "voc": 88
    },
    "2_44_22": {
      "aqi": 56,
      "co2": 478,
      "createdAt": "2025_8_2_2_44_22",
      "hum": 80.7,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 87
    },
    "2_44_30": {
      "aqi": 56,
      "co2": 473,
      "createdAt": "2025_8_2_2_44_30",
      "hum": 80.7,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 87
    },
    "2_44_37": {
      "aqi": 55,
      "co2": 468,
      "createdAt": "2025_8_2_2_44_37",
      "hum": 80.7,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.25,
      "voc": 87
    },
    "2_44_44": {
      "aqi": 55,
      "co2": 466,
      "createdAt": "2025_8_2_2_44_44",
      "hum": 80.8,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.25,
      "voc": 87
    },
    "2_44_52": {
      "aqi": 55,
      "co2": 469,
      "createdAt": "2025_8_2_2_44_52",
      "hum": 80.9,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 87
    },
    "2_44_59": {
      "aqi": 55,
      "co2": 465,
      "createdAt": "2025_8_2_2_44_59",
      "hum": 80.9,
      "no2": 1,
      "pm1": 0,
      "pm10": 7,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 87
    },
    "2_44_8": {
      "aqi": 57,
      "co2": 484,
      "createdAt": "2025_8_2_2_44_8",
      "hum": 80.6,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.375,
      "voc": 87
    },
    "2_45_13": {
      "aqi": 54,
      "co2": 458,
      "createdAt": "2025_8_2_2_45_13",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.25,
      "voc": 87
    },
    "2_45_21": {
      "aqi": 54,
      "co2": 454,
      "createdAt": "2025_8_2_2_45_21",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.25,
      "voc": 87
    },
    "2_45_28": {
      "aqi": 54,
      "co2": 451,
      "createdAt": "2025_8_2_2_45_28",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.25,
      "voc": 87
    },
    "2_45_35": {
      "aqi": 54,
      "co2": 452,
      "createdAt": "2025_8_2_2_45_35",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.25,
      "voc": 87
    },
    "2_45_42": {
      "aqi": 55,
      "co2": 460,
      "createdAt": "2025_8_2_2_45_42",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.25,
      "voc": 87
    },
    "2_45_49": {
      "aqi": 55,
      "co2": 466,
      "createdAt": "2025_8_2_2_45_49",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.25,
      "voc": 87
    },
    "2_45_56": {
      "aqi": 55,
      "co2": 462,
      "createdAt": "2025_8_2_2_45_56",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.25,
      "voc": 87
    },
    "2_45_6": {
      "aqi": 55,
      "co2": 460,
      "createdAt": "2025_8_2_2_45_6",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.25,
      "voc": 87
    },
    "2_46_11": {
      "aqi": 54,
      "co2": 457,
      "createdAt": "2025_8_2_2_46_11",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 29.25,
      "voc": 87
    },
    "2_46_18": {
      "aqi": 54,
      "co2": 459,
      "createdAt": "2025_8_2_2_46_18",
      "hum": 81.3,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 3,
      "temp": 29.25,
      "voc": 88
    },
    "2_46_25": {
      "aqi": 54,
      "co2": 459,
      "createdAt": "2025_8_2_2_46_25",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 3,
      "temp": 29.25,
      "voc": 88
    },
    "2_46_32": {
      "aqi": 54,
      "co2": 452,
      "createdAt": "2025_8_2_2_46_32",
      "hum": 81.3,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 89
    },
    "2_46_39": {
      "aqi": 54,
      "co2": 455,
      "createdAt": "2025_8_2_2_46_39",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 88
    },
    "2_46_4": {
      "aqi": 54,
      "co2": 455,
      "createdAt": "2025_8_2_2_46_4",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 29.25,
      "voc": 87
    },
    "2_46_47": {
      "aqi": 54,
      "co2": 458,
      "createdAt": "2025_8_2_2_46_47",
      "hum": 81.5,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 88
    },
    "2_46_54": {
      "aqi": 55,
      "co2": 462,
      "createdAt": "2025_8_2_2_46_54",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 88
    },
    "2_47_1": {
      "aqi": 54,
      "co2": 459,
      "createdAt": "2025_8_2_2_47_1",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 88
    },
    "2_47_15": {
      "aqi": 55,
      "co2": 464,
      "createdAt": "2025_8_2_2_47_15",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.375,
      "voc": 89
    },
    "2_47_22": {
      "aqi": 55,
      "co2": 464,
      "createdAt": "2025_8_2_2_47_22",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 89
    },
    "2_47_30": {
      "aqi": 55,
      "co2": 467,
      "createdAt": "2025_8_2_2_47_30",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 89
    },
    "2_47_37": {
      "aqi": 55,
      "co2": 465,
      "createdAt": "2025_8_2_2_47_37",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 89
    },
    "2_47_44": {
      "aqi": 55,
      "co2": 461,
      "createdAt": "2025_8_2_2_47_44",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.375,
      "voc": 89
    },
    "2_47_52": {
      "aqi": 55,
      "co2": 464,
      "createdAt": "2025_8_2_2_47_52",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 89
    },
    "2_47_8": {
      "aqi": 55,
      "co2": 460,
      "createdAt": "2025_8_2_2_47_8",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 89
    },
    "2_48_0": {
      "aqi": 54,
      "co2": 453,
      "createdAt": "2025_8_2_2_48_0",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 89
    },
    "2_48_14": {
      "aqi": 55,
      "co2": 461,
      "createdAt": "2025_8_2_2_48_14",
      "hum": 80.9,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 90
    },
    "2_48_21": {
      "aqi": 53,
      "co2": 445,
      "createdAt": "2025_8_2_2_48_21",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 90
    },
    "2_48_28": {
      "aqi": 52,
      "co2": 433,
      "createdAt": "2025_8_2_2_48_28",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 90
    },
    "2_48_35": {
      "aqi": 53,
      "co2": 443,
      "createdAt": "2025_8_2_2_48_35",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 89
    },
    "2_48_43": {
      "aqi": 53,
      "co2": 439,
      "createdAt": "2025_8_2_2_48_43",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 90
    },
    "2_48_50": {
      "aqi": 52,
      "co2": 430,
      "createdAt": "2025_8_2_2_48_50",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 91
    },
    "2_48_57": {
      "aqi": 52,
      "co2": 424,
      "createdAt": "2025_8_2_2_48_57",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 91
    },
    "2_48_7": {
      "aqi": 55,
      "co2": 463,
      "createdAt": "2025_8_2_2_48_7",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.25,
      "voc": 90
    },
    "2_49_11": {
      "aqi": 52,
      "co2": 433,
      "createdAt": "2025_8_2_2_49_11",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.25,
      "voc": 91
    },
    "2_49_18": {
      "aqi": 53,
      "co2": 445,
      "createdAt": "2025_8_2_2_49_18",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 5,
      "temp": 29.25,
      "voc": 92
    },
    "2_49_26": {
      "aqi": 53,
      "co2": 436,
      "createdAt": "2025_8_2_2_49_26",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.25,
      "voc": 92
    },
    "2_49_33": {
      "aqi": 51,
      "co2": 423,
      "createdAt": "2025_8_2_2_49_33",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.25,
      "voc": 92
    },
    "2_49_4": {
      "aqi": 52,
      "co2": 424,
      "createdAt": "2025_8_2_2_49_4",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 5,
      "pm25": 4,
      "temp": 29.25,
      "voc": 91
    },
    "2_49_40": {
      "aqi": 51,
      "co2": 415,
      "createdAt": "2025_8_2_2_49_40",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.25,
      "voc": 91
    },
    "2_49_47": {
      "aqi": 51,
      "co2": 415,
      "createdAt": "2025_8_2_2_49_47",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 4,
      "pm25": 2,
      "temp": 29.25,
      "voc": 91
    },
    "2_49_54": {
      "aqi": 52,
      "co2": 427,
      "createdAt": "2025_8_2_2_49_54",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.25,
      "voc": 91
    },
    "2_4_10": {
      "aqi": 67,
      "co2": 611,
      "createdAt": "2025_8_2_2_4_10",
      "hum": 80.4,
      "no2": 1,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.5,
      "voc": 51
    },
    "2_4_17": {
      "aqi": 65,
      "co2": 590,
      "createdAt": "2025_8_2_2_4_17",
      "hum": 80.3,
      "no2": 1,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 53
    },
    "2_4_24": {
      "aqi": 29,
      "co2": 0,
      "createdAt": "2025_8_2_2_4_24",
      "hum": 80.3,
      "no2": 1,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 55
    },
    "2_4_3": {
      "aqi": 69,
      "co2": 628,
      "createdAt": "2025_8_2_2_4_3",
      "hum": 80.3,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.5,
      "voc": 48
    },
    "2_4_32": {
      "aqi": 29,
      "co2": 0,
      "createdAt": "2025_8_2_2_4_32",
      "hum": 80.5,
      "no2": 1,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 57
    },
    "2_4_39": {
      "aqi": 29,
      "co2": 0,
      "createdAt": "2025_8_2_2_4_39",
      "hum": 80.8,
      "no2": 1,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.5,
      "voc": 58
    },
    "2_4_46": {
      "aqi": 30,
      "co2": 0,
      "createdAt": "2025_8_2_2_4_46",
      "hum": 81.2,
      "no2": 1,
      "pm1": 4,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.5,
      "voc": 60
    },
    "2_4_53": {
      "aqi": 30,
      "co2": 0,
      "createdAt": "2025_8_2_2_4_53",
      "hum": 80.7,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.5,
      "voc": 61
    },
    "2_50_1": {
      "aqi": 53,
      "co2": 441,
      "createdAt": "2025_8_2_2_50_1",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.25,
      "voc": 92
    },
    "2_50_16": {
      "aqi": 53,
      "co2": 442,
      "createdAt": "2025_8_2_2_50_16",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.25,
      "voc": 92
    },
    "2_50_23": {
      "aqi": 53,
      "co2": 445,
      "createdAt": "2025_8_2_2_50_23",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.1875,
      "voc": 93
    },
    "2_50_30": {
      "aqi": 53,
      "co2": 443,
      "createdAt": "2025_8_2_2_50_30",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 92
    },
    "2_50_37": {
      "aqi": 54,
      "co2": 449,
      "createdAt": "2025_8_2_2_50_37",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.1875,
      "voc": 92
    },
    "2_50_44": {
      "aqi": 53,
      "co2": 446,
      "createdAt": "2025_8_2_2_50_44",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.25,
      "voc": 92
    },
    "2_50_52": {
      "aqi": 52,
      "co2": 430,
      "createdAt": "2025_8_2_2_50_52",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 92
    },
    "2_50_59": {
      "aqi": 52,
      "co2": 434,
      "createdAt": "2025_8_2_2_50_59",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 92
    },
    "2_50_9": {
      "aqi": 53,
      "co2": 446,
      "createdAt": "2025_8_2_2_50_9",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 5,
      "pm25": 3,
      "temp": 29.25,
      "voc": 92
    },
    "2_51_14": {
      "aqi": 53,
      "co2": 441,
      "createdAt": "2025_8_2_2_51_14",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 93
    },
    "2_51_21": {
      "aqi": 53,
      "co2": 443,
      "createdAt": "2025_8_2_2_51_21",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 93
    },
    "2_51_28": {
      "aqi": 53,
      "co2": 437,
      "createdAt": "2025_8_2_2_51_28",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 94
    },
    "2_51_35": {
      "aqi": 52,
      "co2": 432,
      "createdAt": "2025_8_2_2_51_35",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 10,
      "pm25": 4,
      "temp": 29.25,
      "voc": 94
    },
    "2_51_42": {
      "aqi": 52,
      "co2": 427,
      "createdAt": "2025_8_2_2_51_42",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 10,
      "pm25": 4,
      "temp": 29.25,
      "voc": 95
    },
    "2_51_50": {
      "aqi": 52,
      "co2": 427,
      "createdAt": "2025_8_2_2_51_50",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 96
    },
    "2_51_57": {
      "aqi": 51,
      "co2": 423,
      "createdAt": "2025_8_2_2_51_57",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 96
    },
    "2_51_7": {
      "aqi": 53,
      "co2": 440,
      "createdAt": "2025_8_2_2_51_7",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 93
    },
    "2_52_11": {
      "aqi": 51,
      "co2": 416,
      "createdAt": "2025_8_2_2_52_11",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 97
    },
    "2_52_18": {
      "aqi": 51,
      "co2": 422,
      "createdAt": "2025_8_2_2_52_18",
      "hum": 81.1,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 98
    },
    "2_52_25": {
      "aqi": 52,
      "co2": 429,
      "createdAt": "2025_8_2_2_52_25",
      "hum": 81.3,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.25,
      "voc": 98
    },
    "2_52_33": {
      "aqi": 52,
      "co2": 430,
      "createdAt": "2025_8_2_2_52_33",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.1875,
      "voc": 99
    },
    "2_52_4": {
      "aqi": 51,
      "co2": 420,
      "createdAt": "2025_8_2_2_52_4",
      "hum": 81.2,
      "no2": 1,
      "pm1": 0,
      "pm10": 9,
      "pm25": 4,
      "temp": 29.25,
      "voc": 97
    },
    "2_52_40": {
      "aqi": 52,
      "co2": 431,
      "createdAt": "2025_8_2_2_52_40",
      "hum": 81.4,
      "no2": 1,
      "pm1": 0,
      "pm10": 8,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 99
    },
    "2_52_47": {
      "aqi": 52,
      "co2": 430,
      "createdAt": "2025_8_2_2_52_47",
      "hum": 81.3,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 99
    },
    "2_52_54": {
      "aqi": 52,
      "co2": 428,
      "createdAt": "2025_8_2_2_52_54",
      "hum": 81.3,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.25,
      "voc": 99
    },
    "2_53_1": {
      "aqi": 53,
      "co2": 436,
      "createdAt": "2025_8_2_2_53_1",
      "hum": 81.3,
      "no2": 1,
      "pm1": 1,
      "pm10": 7,
      "pm25": 5,
      "temp": 29.25,
      "voc": 99
    },
    "2_53_16": {
      "aqi": 53,
      "co2": 442,
      "createdAt": "2025_8_2_2_53_16",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 99
    },
    "2_53_23": {
      "aqi": 54,
      "co2": 450,
      "createdAt": "2025_8_2_2_53_23",
      "hum": 81.1,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.25,
      "voc": 100
    },
    "2_53_30": {
      "aqi": 54,
      "co2": 449,
      "createdAt": "2025_8_2_2_53_30",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 5,
      "temp": 29.25,
      "voc": 100
    },
    "2_53_37": {
      "aqi": 54,
      "co2": 453,
      "createdAt": "2025_8_2_2_53_37",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 5,
      "temp": 29.25,
      "voc": 100
    },
    "2_53_44": {
      "aqi": 53,
      "co2": 445,
      "createdAt": "2025_8_2_2_53_44",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 5,
      "temp": 29.25,
      "voc": 100
    },
    "2_53_52": {
      "aqi": 53,
      "co2": 444,
      "createdAt": "2025_8_2_2_53_52",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 5,
      "temp": 29.25,
      "voc": 100
    },
    "2_53_59": {
      "aqi": 53,
      "co2": 443,
      "createdAt": "2025_8_2_2_53_59",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 100
    },
    "2_53_8": {
      "aqi": 53,
      "co2": 441,
      "createdAt": "2025_8_2_2_53_8",
      "hum": 81.2,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.25,
      "voc": 99
    },
    "2_54_14": {
      "aqi": 53,
      "co2": 439,
      "createdAt": "2025_8_2_2_54_14",
      "hum": 81.3,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.3125,
      "voc": 99
    },
    "2_54_6": {
      "aqi": 53,
      "co2": 442,
      "createdAt": "2025_8_2_2_54_6",
      "hum": 81.3,
      "no2": 1,
      "pm1": 1,
      "pm10": 6,
      "pm25": 4,
      "temp": 29.25,
      "voc": 99
    },
    "2_5_1": {
      "aqi": 31,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_1",
      "hum": 80.5,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.5,
      "voc": 62
    },
    "2_5_15": {
      "aqi": 32,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_15",
      "hum": 80.4,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.5,
      "voc": 64
    },
    "2_5_22": {
      "aqi": 33,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_22",
      "hum": 80.4,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 66
    },
    "2_5_29": {
      "aqi": 33,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_29",
      "hum": 80.4,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 66
    },
    "2_5_37": {
      "aqi": 34,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_37",
      "hum": 80.4,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 7,
      "temp": 29.375,
      "voc": 68
    },
    "2_5_44": {
      "aqi": 34,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_44",
      "hum": 80.5,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 69
    },
    "2_5_51": {
      "aqi": 35,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_51",
      "hum": 80.6,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 70
    },
    "2_5_58": {
      "aqi": 36,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_58",
      "hum": 80.6,
      "no2": 1,
      "pm1": 1,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.375,
      "voc": 72
    },
    "2_5_8": {
      "aqi": 31,
      "co2": 0,
      "createdAt": "2025_8_2_2_5_8",
      "hum": 80.4,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.5,
      "voc": 63
    },
    "2_6_12": {
      "aqi": 36,
      "co2": 0,
      "createdAt": "2025_8_2_2_6_12",
      "hum": 80.6,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 73
    },
    "2_6_20": {
      "aqi": 37,
      "co2": 0,
      "createdAt": "2025_8_2_2_6_20",
      "hum": 80.6,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.4375,
      "voc": 74
    },
    "2_6_27": {
      "aqi": 37,
      "co2": 0,
      "createdAt": "2025_8_2_2_6_27",
      "hum": 80.7,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.375,
      "voc": 75
    },
    "2_6_34": {
      "aqi": 38,
      "co2": 0,
      "createdAt": "2025_8_2_2_6_34",
      "hum": 80.7,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.375,
      "voc": 76
    },
    "2_6_41": {
      "aqi": 38,
      "co2": 0,
      "createdAt": "2025_8_2_2_6_41",
      "hum": 80.6,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.375,
      "voc": 77
    },
    "2_6_48": {
      "aqi": 39,
      "co2": 0,
      "createdAt": "2025_8_2_2_6_48",
      "hum": 80.6,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.375,
      "voc": 78
    },
    "2_6_5": {
      "aqi": 36,
      "co2": 0,
      "createdAt": "2025_8_2_2_6_5",
      "hum": 80.5,
      "no2": 1,
      "pm1": 1,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 72
    },
    "2_6_55": {
      "aqi": 39,
      "co2": 0,
      "createdAt": "2025_8_2_2_6_55",
      "hum": 80.7,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.375,
      "voc": 78
    },
    "2_7_10": {
      "aqi": 39,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_10",
      "hum": 80.7,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 79
    },
    "2_7_17": {
      "aqi": 40,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_17",
      "hum": 80.8,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 80
    },
    "2_7_2": {
      "aqi": 39,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_2",
      "hum": 80.8,
      "no2": 1,
      "pm1": 3,
      "pm10": 10,
      "pm25": 7,
      "temp": 29.375,
      "voc": 78
    },
    "2_7_24": {
      "aqi": 40,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_24",
      "hum": 80.8,
      "no2": 1,
      "pm1": 3,
      "pm10": 11,
      "pm25": 7,
      "temp": 29.375,
      "voc": 80
    },
    "2_7_31": {
      "aqi": 40,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_31",
      "hum": 80.8,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 81
    },
    "2_7_38": {
      "aqi": 41,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_38",
      "hum": 80.8,
      "no2": 1,
      "pm1": 2,
      "pm10": 10,
      "pm25": 6,
      "temp": 29.375,
      "voc": 82
    },
    "2_7_45": {
      "aqi": 41,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_45",
      "hum": 80.8,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 7,
      "temp": 29.375,
      "voc": 83
    },
    "2_7_52": {
      "aqi": 41,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_52",
      "hum": 80.9,
      "no2": 1,
      "pm1": 3,
      "pm10": 12,
      "pm25": 8,
      "temp": 29.375,
      "voc": 83
    },
    "2_7_59": {
      "aqi": 42,
      "co2": 0,
      "createdAt": "2025_8_2_2_7_59",
      "hum": 80.8,
      "no2": 1,
      "pm1": 3,
      "pm10": 12,
      "pm25": 8,
      "temp": 29.3125,
      "voc": 84
    },
    "2_8_14": {
      "aqi": 43,
      "co2": 0,
      "createdAt": "2025_8_2_2_8_14",
      "hum": 80.8,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 87
    },
    "2_8_21": {
      "aqi": 43,
      "co2": 0,
      "createdAt": "2025_8_2_2_8_21",
      "hum": 80.8,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 6,
      "temp": 29.25,
      "voc": 87
    },
    "2_8_28": {
      "aqi": 43,
      "co2": 0,
      "createdAt": "2025_8_2_2_8_28",
      "hum": 80.8,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 6,
      "temp": 29.25,
      "voc": 87
    },
    "2_8_36": {
      "aqi": 44,
      "co2": 0,
      "createdAt": "2025_8_2_2_8_36",
      "hum": 80.9,
      "no2": 1,
      "pm1": 2,
      "pm10": 11,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 88
    },
    "2_8_43": {
      "aqi": 44,
      "co2": 0,
      "createdAt": "2025_8_2_2_8_43",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 89
    },
    "2_8_50": {
      "aqi": 45,
      "co2": 0,
      "createdAt": "2025_8_2_2_8_50",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 90
    },
    "2_8_57": {
      "aqi": 45,
      "co2": 0,
      "createdAt": "2025_8_2_2_8_57",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 90
    },
    "2_8_7": {
      "aqi": 42,
      "co2": 0,
      "createdAt": "2025_8_2_2_8_7",
      "hum": 80.8,
      "no2": 1,
      "pm1": 3,
      "pm10": 12,
      "pm25": 7,
      "temp": 29.3125,
      "voc": 85
    },
    "2_9_11": {
      "aqi": 45,
      "co2": 0,
      "createdAt": "2025_8_2_2_9_11",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 91
    },
    "2_9_19": {
      "aqi": 45,
      "co2": 0,
      "createdAt": "2025_8_2_2_9_19",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 91
    },
    "2_9_26": {
      "aqi": 46,
      "co2": 0,
      "createdAt": "2025_8_2_2_9_26",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.375,
      "voc": 92
    },
    "2_9_33": {
      "aqi": 46,
      "co2": 0,
      "createdAt": "2025_8_2_2_9_33",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 92
    },
    "2_9_4": {
      "aqi": 45,
      "co2": 0,
      "createdAt": "2025_8_2_2_9_4",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 6,
      "temp": 29.3125,
      "voc": 91
    },
    "2_9_40": {
      "aqi": 46,
      "co2": 0,
      "createdAt": "2025_8_2_2_9_40",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 7,
      "temp": 29.375,
      "voc": 92
    },
    "2_9_47": {
      "aqi": 46,
      "co2": 0,
      "createdAt": "2025_8_2_2_9_47",
      "hum": 81,
      "no2": 1,
      "pm1": 2,
      "pm10": 9,
      "pm25": 7,
      "temp": 29.375,
      "voc": 92
    },
    "2_9_54": {
      "aqi": 47,
      "co2": 0,
      "createdAt": "2025_8_2_2_9_54",
      "hum": 81,
      "no2": 1,
      "pm1": 1,
      "pm10": 8,
      "pm25": 5,
      "temp": 29.3125,
      "voc": 94
    }
  },
  "2025_8_4": {
    "18_28_51": {
      "aqi": 88,
      "co2": 532,
      "createdAt": "2025_8_4_18_28_51",
      "hum": 82.3,
      "no2": 0,
      "pm1": 19,
      "pm10": 35,
      "pm25": 30,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_10": {
      "aqi": 80,
      "co2": 514,
      "createdAt": "2025_8_4_18_31_10",
      "hum": 82,
      "no2": 0,
      "pm1": 17,
      "pm10": 32,
      "pm25": 26,
      "temp": 28.25,
      "voc": 0
    },
    "18_31_13": {
      "aqi": 80,
      "co2": 510,
      "createdAt": "2025_8_4_18_31_13",
      "hum": 82.3,
      "no2": 0,
      "pm1": 17,
      "pm10": 32,
      "pm25": 26,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_15": {
      "aqi": 80,
      "co2": 509,
      "createdAt": "2025_8_4_18_31_15",
      "hum": 82.3,
      "no2": 0,
      "pm1": 17,
      "pm10": 31,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_17": {
      "aqi": 80,
      "co2": 508,
      "createdAt": "2025_8_4_18_31_17",
      "hum": 82.3,
      "no2": 0,
      "pm1": 17,
      "pm10": 31,
      "pm25": 26,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_19": {
      "aqi": 80,
      "co2": 508,
      "createdAt": "2025_8_4_18_31_19",
      "hum": 82.2,
      "no2": 0,
      "pm1": 17,
      "pm10": 30,
      "pm25": 26,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_21": {
      "aqi": 80,
      "co2": 504,
      "createdAt": "2025_8_4_18_31_21",
      "hum": 82.2,
      "no2": 0,
      "pm1": 17,
      "pm10": 30,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_23": {
      "aqi": 80,
      "co2": 500,
      "createdAt": "2025_8_4_18_31_23",
      "hum": 82.2,
      "no2": 0,
      "pm1": 17,
      "pm10": 29,
      "pm25": 26,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_25": {
      "aqi": 80,
      "co2": 499,
      "createdAt": "2025_8_4_18_31_25",
      "hum": 82.2,
      "no2": 0,
      "pm1": 17,
      "pm10": 29,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_27": {
      "aqi": 78,
      "co2": 500,
      "createdAt": "2025_8_4_18_31_27",
      "hum": 82.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 28,
      "pm25": 25,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_29": {
      "aqi": 78,
      "co2": 498,
      "createdAt": "2025_8_4_18_31_29",
      "hum": 82.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 28,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_31": {
      "aqi": 78,
      "co2": 497,
      "createdAt": "2025_8_4_18_31_31",
      "hum": 82,
      "no2": 0,
      "pm1": 16,
      "pm10": 28,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_34": {
      "aqi": 78,
      "co2": 496,
      "createdAt": "2025_8_4_18_31_34",
      "hum": 82,
      "no2": 0,
      "pm1": 16,
      "pm10": 27,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_36": {
      "aqi": 78,
      "co2": 493,
      "createdAt": "2025_8_4_18_31_36",
      "hum": 82.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 27,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_38": {
      "aqi": 78,
      "co2": 488,
      "createdAt": "2025_8_4_18_31_38",
      "hum": 82.3,
      "no2": 0,
      "pm1": 16,
      "pm10": 27,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_40": {
      "aqi": 80,
      "co2": 486,
      "createdAt": "2025_8_4_18_31_40",
      "hum": 82.4,
      "no2": 0,
      "pm1": 17,
      "pm10": 28,
      "pm25": 26,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_42": {
      "aqi": 80,
      "co2": 482,
      "createdAt": "2025_8_4_18_31_42",
      "hum": 82.3,
      "no2": 0,
      "pm1": 17,
      "pm10": 28,
      "pm25": 26,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_44": {
      "aqi": 80,
      "co2": 469,
      "createdAt": "2025_8_4_18_31_44",
      "hum": 82.2,
      "no2": 0,
      "pm1": 17,
      "pm10": 28,
      "pm25": 26,
      "temp": 28.3125,
      "voc": 0
    },
    "18_31_46": {
      "aqi": 80,
      "co2": 455,
      "createdAt": "2025_8_4_18_31_46",
      "hum": 82.4,
      "no2": 0,
      "pm1": 17,
      "pm10": 28,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_48": {
      "aqi": 80,
      "co2": 444,
      "createdAt": "2025_8_4_18_31_48",
      "hum": 82.3,
      "no2": 0,
      "pm1": 17,
      "pm10": 28,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_50": {
      "aqi": 80,
      "co2": 435,
      "createdAt": "2025_8_4_18_31_50",
      "hum": 82.3,
      "no2": 0,
      "pm1": 17,
      "pm10": 28,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_52": {
      "aqi": 78,
      "co2": 430,
      "createdAt": "2025_8_4_18_31_52",
      "hum": 82.3,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_54": {
      "aqi": 78,
      "co2": 430,
      "createdAt": "2025_8_4_18_31_54",
      "hum": 82.6,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_57": {
      "aqi": 78,
      "co2": 430,
      "createdAt": "2025_8_4_18_31_57",
      "hum": 83.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_31_59": {
      "aqi": 78,
      "co2": 427,
      "createdAt": "2025_8_4_18_31_59",
      "hum": 83.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_32_1": {
      "aqi": 78,
      "co2": 423,
      "createdAt": "2025_8_4_18_32_1",
      "hum": 82.9,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_32_11": {
      "aqi": 80,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_11",
      "hum": 82.1,
      "no2": 0,
      "pm1": 17,
      "pm10": 31,
      "pm25": 26,
      "temp": 28.4375,
      "voc": 0
    },
    "18_32_14": {
      "aqi": 80,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_14",
      "hum": 82,
      "no2": 0,
      "pm1": 17,
      "pm10": 31,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_32_16": {
      "aqi": 80,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_16",
      "hum": 82.1,
      "no2": 0,
      "pm1": 17,
      "pm10": 31,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_32_18": {
      "aqi": 78,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_18",
      "hum": 82.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.4375,
      "voc": 0
    },
    "18_32_20": {
      "aqi": 78,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_20",
      "hum": 82.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.4375,
      "voc": 0
    },
    "18_32_23": {
      "aqi": 78,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_23",
      "hum": 82,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.4375,
      "voc": 0
    },
    "18_32_25": {
      "aqi": 80,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_25",
      "hum": 82,
      "no2": 0,
      "pm1": 17,
      "pm10": 31,
      "pm25": 26,
      "temp": 28.375,
      "voc": 0
    },
    "18_32_3": {
      "aqi": 78,
      "co2": 418,
      "createdAt": "2025_8_4_18_32_3",
      "hum": 82.5,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_32_5": {
      "aqi": 78,
      "co2": 414,
      "createdAt": "2025_8_4_18_32_5",
      "hum": 82.3,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.4375,
      "voc": 0
    },
    "18_32_7": {
      "aqi": 78,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_7",
      "hum": 82.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.375,
      "voc": 0
    },
    "18_32_9": {
      "aqi": 78,
      "co2": 410,
      "createdAt": "2025_8_4_18_32_9",
      "hum": 82.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 25,
      "temp": 28.4375,
      "voc": 0
    },
    "18_36_22": {
      "aqi": 104,
      "co2": 477,
      "createdAt": "2025_8_4_18_36_22",
      "hum": 81.9,
      "no2": 0,
      "pm1": 25,
      "pm10": 47,
      "pm25": 37,
      "temp": 28.5,
      "voc": 0
    },
    "18_41_31": {
      "aqi": 63,
      "co2": 557,
      "createdAt": "2025_8_4_18_41_31",
      "hum": 81.8,
      "no2": 0,
      "pm1": 0,
      "pm10": 0,
      "pm25": 0,
      "temp": 28.4375,
      "voc": 0
    },
    "18_46_57": {
      "aqi": 82,
      "co2": 466,
      "createdAt": "2025_8_4_18_46_57",
      "hum": 82.6,
      "no2": 0,
      "pm1": 18,
      "pm10": 33,
      "pm25": 27,
      "temp": 28.25,
      "voc": 0
    },
    "18_47_10": {
      "aqi": 80,
      "co2": 463,
      "createdAt": "2025_8_4_18_47_10",
      "hum": 82.4,
      "no2": 0,
      "pm1": 17,
      "pm10": 32,
      "pm25": 26,
      "temp": 28.25,
      "voc": 0
    },
    "18_47_22": {
      "aqi": 80,
      "co2": 451,
      "createdAt": "2025_8_4_18_47_22",
      "hum": 82.3,
      "no2": 0,
      "pm1": 17,
      "pm10": 32,
      "pm25": 26,
      "temp": 28.25,
      "voc": 0
    },
    "18_47_34": {
      "aqi": 80,
      "co2": 446,
      "createdAt": "2025_8_4_18_47_34",
      "hum": 82.5,
      "no2": 0,
      "pm1": 17,
      "pm10": 32,
      "pm25": 26,
      "temp": 28.25,
      "voc": 0
    },
    "18_47_46": {
      "aqi": 82,
      "co2": 451,
      "createdAt": "2025_8_4_18_47_46",
      "hum": 82.7,
      "no2": 0,
      "pm1": 17,
      "pm10": 32,
      "pm25": 27,
      "temp": 28.25,
      "voc": 0
    },
    "18_47_58": {
      "aqi": 84,
      "co2": 446,
      "createdAt": "2025_8_4_18_47_58",
      "hum": 82.9,
      "no2": 0,
      "pm1": 17,
      "pm10": 32,
      "pm25": 28,
      "temp": 28.3125,
      "voc": 0
    },
    "18_48_10": {
      "aqi": 82,
      "co2": 450,
      "createdAt": "2025_8_4_18_48_10",
      "hum": 82.6,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 27,
      "temp": 28.3125,
      "voc": 0
    },
    "18_48_22": {
      "aqi": 82,
      "co2": 449,
      "createdAt": "2025_8_4_18_48_22",
      "hum": 82.7,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 27,
      "temp": 28.25,
      "voc": 0
    },
    "18_48_35": {
      "aqi": 80,
      "co2": 463,
      "createdAt": "2025_8_4_18_48_35",
      "hum": 82.4,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 26,
      "temp": 28.25,
      "voc": 0
    },
    "18_48_47": {
      "aqi": 80,
      "co2": 470,
      "createdAt": "2025_8_4_18_48_47",
      "hum": 82,
      "no2": 0,
      "pm1": 16,
      "pm10": 30,
      "pm25": 26,
      "temp": 28.125,
      "voc": 0
    },
    "18_48_59": {
      "aqi": 78,
      "co2": 449,
      "createdAt": "2025_8_4_18_48_59",
      "hum": 81.7,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 25,
      "temp": 28.0625,
      "voc": 0
    },
    "18_49_11": {
      "aqi": 78,
      "co2": 428,
      "createdAt": "2025_8_4_18_49_11",
      "hum": 81.6,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 25,
      "temp": 28,
      "voc": 0
    },
    "18_49_23": {
      "aqi": 78,
      "co2": 430,
      "createdAt": "2025_8_4_18_49_23",
      "hum": 81.7,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 25,
      "temp": 28,
      "voc": 0
    },
    "18_49_35": {
      "aqi": 78,
      "co2": 428,
      "createdAt": "2025_8_4_18_49_35",
      "hum": 82.4,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 25,
      "temp": 28,
      "voc": 0
    },
    "18_49_47": {
      "aqi": 76,
      "co2": 427,
      "createdAt": "2025_8_4_18_49_47",
      "hum": 82.1,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 24,
      "temp": 28.125,
      "voc": 0
    },
    "18_49_59": {
      "aqi": 76,
      "co2": 417,
      "createdAt": "2025_8_4_18_49_59",
      "hum": 82,
      "no2": 0,
      "pm1": 16,
      "pm10": 31,
      "pm25": 24,
      "temp": 28.0625,
      "voc": 0
    },
    "18_50_12": {
      "aqi": 76,
      "co2": 410,
      "createdAt": "2025_8_4_18_50_12",
      "hum": 82.3,
      "no2": 0,
      "pm1": 15,
      "pm10": 30,
      "pm25": 24,
      "temp": 28.125,
      "voc": 0
    },
    "18_50_24": {
      "aqi": 73,
      "co2": 417,
      "createdAt": "2025_8_4_18_50_24",
      "hum": 82.9,
      "no2": 0,
      "pm1": 15,
      "pm10": 30,
      "pm25": 23,
      "temp": 28.125,
      "voc": 0
    },
    "18_50_36": {
      "aqi": 71,
      "co2": 442,
      "createdAt": "2025_8_4_18_50_36",
      "hum": 82.4,
      "no2": 0,
      "pm1": 14,
      "pm10": 28,
      "pm25": 22,
      "temp": 28.1875,
      "voc": 0
    },
    "18_50_48": {
      "aqi": 71,
      "co2": 471,
      "createdAt": "2025_8_4_18_50_48",
      "hum": 83,
      "no2": 0,
      "pm1": 14,
      "pm10": 28,
      "pm25": 22,
      "temp": 28.25,
      "voc": 0
    },
    "18_51_0": {
      "aqi": 69,
      "co2": 494,
      "createdAt": "2025_8_4_18_51_0",
      "hum": 82.3,
      "no2": 0,
      "pm1": 13,
      "pm10": 27,
      "pm25": 21,
      "temp": 28.25,
      "voc": 0
    },
    "18_51_12": {
      "aqi": 71,
      "co2": 507,
      "createdAt": "2025_8_4_18_51_12",
      "hum": 82.2,
      "no2": 0,
      "pm1": 14,
      "pm10": 28,
      "pm25": 22,
      "temp": 28.25,
      "voc": 0
    },
    "18_51_24": {
      "aqi": 71,
      "co2": 517,
      "createdAt": "2025_8_4_18_51_24",
      "hum": 82.2,
      "no2": 0,
      "pm1": 14,
      "pm10": 28,
      "pm25": 22,
      "temp": 28.25,
      "voc": 0
    },
    "18_51_37": {
      "aqi": 67,
      "co2": 521,
      "createdAt": "2025_8_4_18_51_37",
      "hum": 81.1,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 20,
      "temp": 28.1875,
      "voc": 0
    },
    "18_51_49": {
      "aqi": 67,
      "co2": 513,
      "createdAt": "2025_8_4_18_51_49",
      "hum": 81.1,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 20,
      "temp": 28.1875,
      "voc": 0
    },
    "18_52_1": {
      "aqi": 67,
      "co2": 511,
      "createdAt": "2025_8_4_18_52_1",
      "hum": 80.7,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 20,
      "temp": 28.125,
      "voc": 0
    },
    "18_52_13": {
      "aqi": 67,
      "co2": 453,
      "createdAt": "2025_8_4_18_52_13",
      "hum": 81.2,
      "no2": 0,
      "pm1": 8,
      "pm10": 23,
      "pm25": 20,
      "temp": 28.25,
      "voc": 0
    },
    "18_52_26": {
      "aqi": 65,
      "co2": 442,
      "createdAt": "2025_8_4_18_52_26",
      "hum": 81.5,
      "no2": 0,
      "pm1": 6,
      "pm10": 22,
      "pm25": 19,
      "temp": 28.1875,
      "voc": 0
    },
    "18_52_38": {
      "aqi": 63,
      "co2": 415,
      "createdAt": "2025_8_4_18_52_38",
      "hum": 81.5,
      "no2": 0,
      "pm1": 6,
      "pm10": 21,
      "pm25": 18,
      "temp": 28.1875,
      "voc": 0
    },
    "18_52_50": {
      "aqi": 65,
      "co2": 410,
      "createdAt": "2025_8_4_18_52_50",
      "hum": 81.4,
      "no2": 0,
      "pm1": 7,
      "pm10": 22,
      "pm25": 19,
      "temp": 28.25,
      "voc": 0
    },
    "18_53_15": {
      "aqi": 65,
      "co2": 409,
      "createdAt": "2025_8_4_18_53_15",
      "hum": 81.8,
      "no2": 0,
      "pm1": 7,
      "pm10": 21,
      "pm25": 19,
      "temp": 28.25,
      "voc": 0
    },
    "18_53_2": {
      "aqi": 65,
      "co2": 410,
      "createdAt": "2025_8_4_18_53_2",
      "hum": 81.8,
      "no2": 0,
      "pm1": 7,
      "pm10": 21,
      "pm25": 19,
      "temp": 28.25,
      "voc": 0
    },
    "18_53_27": {
      "aqi": 63,
      "co2": 415,
      "createdAt": "2025_8_4_18_53_27",
      "hum": 81.6,
      "no2": 0,
      "pm1": 5,
      "pm10": 20,
      "pm25": 18,
      "temp": 28.25,
      "voc": 0
    },
    "18_53_39": {
      "aqi": 63,
      "co2": 419,
      "createdAt": "2025_8_4_18_53_39",
      "hum": 81.4,
      "no2": 0,
      "pm1": 5,
      "pm10": 20,
      "pm25": 18,
      "temp": 28.1875,
      "voc": 0
    },
    "18_53_51": {
      "aqi": 63,
      "co2": 410,
      "createdAt": "2025_8_4_18_53_51",
      "hum": 81.4,
      "no2": 0,
      "pm1": 5,
      "pm10": 19,
      "pm25": 18,
      "temp": 28.1875,
      "voc": 0
    },
    "18_54_16": {
      "aqi": 76,
      "co2": 418,
      "createdAt": "2025_8_4_18_54_16",
      "hum": 81.5,
      "no2": 0,
      "pm1": 17,
      "pm10": 27,
      "pm25": 24,
      "temp": 28.0625,
      "voc": 0
    },
    "18_54_28": {
      "aqi": 76,
      "co2": 410,
      "createdAt": "2025_8_4_18_54_28",
      "hum": 81.5,
      "no2": 0,
      "pm1": 17,
      "pm10": 27,
      "pm25": 24,
      "temp": 28.0625,
      "voc": 0
    },
    "18_54_3": {
      "aqi": 63,
      "co2": 410,
      "createdAt": "2025_8_4_18_54_3",
      "hum": 81.3,
      "no2": 0,
      "pm1": 5,
      "pm10": 19,
      "pm25": 18,
      "temp": 28.1875,
      "voc": 0
    },
    "18_54_40": {
      "aqi": 78,
      "co2": 409,
      "createdAt": "2025_8_4_18_54_40",
      "hum": 81.7,
      "no2": 0,
      "pm1": 17,
      "pm10": 27,
      "pm25": 25,
      "temp": 28.0625,
      "voc": 0
    },
    "18_54_52": {
      "aqi": 80,
      "co2": 409,
      "createdAt": "2025_8_4_18_54_52",
      "hum": 82,
      "no2": 0,
      "pm1": 18,
      "pm10": 28,
      "pm25": 26,
      "temp": 28.1875,
      "voc": 0
    },
    "18_55_4": {
      "aqi": 80,
      "co2": 0,
      "createdAt": "2025_8_4_18_55_4",
      "hum": 82.7,
      "no2": 0,
      "pm1": 18,
      "pm10": 29,
      "pm25": 26,
      "temp": 28.125,
      "voc": 0
    },
    "19_0_18": {
      "aqi": 90,
      "co2": 483,
      "createdAt": "2025_8_4_19_0_18",
      "hum": 82.1,
      "no2": 0,
      "pm1": 19,
      "pm10": 38,
      "pm25": 31,
      "temp": 28.375,
      "voc": 0
    },
    "19_0_31": {
      "aqi": 90,
      "co2": 457,
      "createdAt": "2025_8_4_19_0_31",
      "hum": 81.7,
      "no2": 0,
      "pm1": 19,
      "pm10": 38,
      "pm25": 31,
      "temp": 28.375,
      "voc": 0
    },
    "19_0_43": {
      "aqi": 90,
      "co2": 439,
      "createdAt": "2025_8_4_19_0_43",
      "hum": 81.5,
      "no2": 0,
      "pm1": 19,
      "pm10": 39,
      "pm25": 31,
      "temp": 28.375,
      "voc": 0
    }
  },
  "2025_8_6": {
    "21_20_54": {
      "aqi": 80,
      "co2": 602,
      "createdAt": "2025_8_6_21_20_54",
      "hum": 77.4,
      "no2": 0,
      "pm1": 14,
      "pm10": 29,
      "pm25": 26,
      "temp": 30.25,
      "voc": 0
    },
    "21_21_5": {
      "aqi": 80,
      "co2": 621,
      "createdAt": "2025_8_6_21_21_5",
      "hum": 77.3,
      "no2": 0,
      "pm1": 14,
      "pm10": 29,
      "pm25": 26,
      "temp": 30.25,
      "voc": 0
    },
    "21_25_38": {
      "aqi": 129,
      "co2": 521,
      "createdAt": "2025_8_6_21_25_38",
      "hum": 77.3,
      "no2": 0,
      "pm1": 30,
      "pm10": 61,
      "pm25": 47,
      "temp": 30,
      "voc": 0
    },
    "21_28_41": {
      "aqi": 129,
      "co2": 574,
      "createdAt": "2025_8_6_21_28_41",
      "hum": 77.1,
      "no2": 0,
      "pm1": 30,
      "pm10": 61,
      "pm25": 47,
      "temp": 30.1875,
      "voc": 0
    },
    "21_31_43": {
      "aqi": 129,
      "co2": 561,
      "createdAt": "2025_8_6_21_31_43",
      "hum": 77.2,
      "no2": 0,
      "pm1": 30,
      "pm10": 61,
      "pm25": 47,
      "temp": 30.25,
      "voc": 0
    },
    "21_34_46": {
      "aqi": 124,
      "co2": 535,
      "createdAt": "2025_8_6_21_34_46",
      "hum": 77.1,
      "no2": 0,
      "pm1": 29,
      "pm10": 60,
      "pm25": 45,
      "temp": 30.0625,
      "voc": 0
    },
    "21_37_49": {
      "aqi": 124,
      "co2": 484,
      "createdAt": "2025_8_6_21_37_49",
      "hum": 76.9,
      "no2": 0,
      "pm1": 29,
      "pm10": 59,
      "pm25": 45,
      "temp": 29.875,
      "voc": 0
    },
    "21_40_52": {
      "aqi": 124,
      "co2": 493,
      "createdAt": "2025_8_6_21_40_52",
      "hum": 77,
      "no2": 0,
      "pm1": 29,
      "pm10": 59,
      "pm25": 45,
      "temp": 29.9375,
      "voc": 0
    },
    "21_43_54": {
      "aqi": 126,
      "co2": 480,
      "createdAt": "2025_8_6_21_43_54",
      "hum": 77,
      "no2": 0,
      "pm1": 30,
      "pm10": 60,
      "pm25": 46,
      "temp": 29.9375,
      "voc": 0
    },
    "21_46_57": {
      "aqi": 126,
      "co2": 485,
      "createdAt": "2025_8_6_21_46_57",
      "hum": 77.1,
      "no2": 0,
      "pm1": 30,
      "pm10": 60,
      "pm25": 46,
      "temp": 29.875,
      "voc": 0
    },
    "21_50_0": {
      "aqi": 126,
      "co2": 500,
      "createdAt": "2025_8_6_21_50_0",
      "hum": 77,
      "no2": 0,
      "pm1": 30,
      "pm10": 60,
      "pm25": 46,
      "temp": 29.75,
      "voc": 0
    }
  },
  "2025_8_7": {
    "15_11_0": {
      "aqi": 51,
      "co2": 417,
      "createdAt": "2025_8_7_15_11_0",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 10,
      "pm25": 7,
      "temp": 32.25,
      "voc": 0
    },
    "15_14_1": {
      "aqi": 51,
      "co2": 413,
      "createdAt": "2025_8_7_15_14_1",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 11,
      "pm25": 7,
      "temp": 32.3125,
      "voc": 0
    },
    "15_17_3": {
      "aqi": 50,
      "co2": 409,
      "createdAt": "2025_8_7_15_17_3",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 11,
      "pm25": 7,
      "temp": 32.25,
      "voc": 0
    },
    "15_1_55": {
      "aqi": 56,
      "co2": 478,
      "createdAt": "2025_8_7_15_1_55",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 10,
      "pm25": 7,
      "temp": 32.5,
      "voc": 0
    },
    "15_20_5": {
      "aqi": 53,
      "co2": 440,
      "createdAt": "2025_8_7_15_20_5",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 11,
      "pm25": 7,
      "temp": 32.125,
      "voc": 0
    },
    "15_23_6": {
      "aqi": 52,
      "co2": 430,
      "createdAt": "2025_8_7_15_23_6",
      "hum": 50,
      "no2": 0,
      "pm1": 3,
      "pm10": 11,
      "pm25": 7,
      "temp": 32.0625,
      "voc": 0
    },
    "15_26_30": {
      "aqi": 53,
      "co2": 439,
      "createdAt": "2025_8_7_15_26_30",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 32.375,
      "voc": 0
    },
    "15_29_32": {
      "aqi": 51,
      "co2": 422,
      "createdAt": "2025_8_7_15_29_32",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 5,
      "temp": 32.5,
      "voc": 0
    },
    "15_32_34": {
      "aqi": 53,
      "co2": 442,
      "createdAt": "2025_8_7_15_32_34",
      "hum": 50,
      "no2": 0,
      "pm1": 2,
      "pm10": 6,
      "pm25": 4,
      "temp": 32.4375,
      "voc": 0
    },
    "15_36_43": {
      "aqi": 54,
      "co2": 454,
      "createdAt": "2025_8_7_15_36_43",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 20,
      "pm25": 10,
      "temp": 32.1875,
      "voc": 0
    },
    "15_39_44": {
      "aqi": 59,
      "co2": 513,
      "createdAt": "2025_8_7_15_39_44",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 20,
      "pm25": 10,
      "temp": 32.25,
      "voc": 0
    },
    "15_42_46": {
      "aqi": 56,
      "co2": 480,
      "createdAt": "2025_8_7_15_42_46",
      "hum": 50,
      "no2": 0,
      "pm1": 4,
      "pm10": 20,
      "pm25": 11,
      "temp": 32.4375,
      "voc": 0
    },
    "15_4_57": {
      "aqi": 29,
      "co2": 0,
      "createdAt": "2025_8_7_15_4_57",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 10,
      "pm25": 7,
      "temp": 32.4375,
      "voc": 0
    },
    "15_7_58": {
      "aqi": 50,
      "co2": 410,
      "createdAt": "2025_8_7_15_7_58",
      "hum": 50,
      "no2": 0,
      "pm1": 1,
      "pm10": 10,
      "pm25": 7,
      "temp": 32.25,
      "voc": 0
    }
  },
  // "_2025_08_17_01_04_15": {
  //   "aqi": 67,
  //   "co2": 615,
  //   "createdAt": "2025-08-17 01:04:15",
  //   "hum": 80.5,
  //   "no2": 0,
  //   "nox_raw": 11382,
  //   "pm1": 4,
  //   "pm10": 19,
  //   "pm25": 12,
  //   "temp": 29.25,
  //   "voc": 0,
  //   "voc_raw": 30435
  // },
  // "_2025_08_17_09_53_56": {
  //   "aqi": 55,
  //   "co2": 462,
  //   "createdAt": "2025-08-17 09:53:56",
  //   "hum": 85.2,
  //   "no2": 0,
  //   "pm1": 1,
  //   "pm10": 9,
  //   "pm25": 7,
  //   "temp": 27.25,
  //   "voc": 0
  // },
  // "_2025_08_17_09_56_00": {
  //   "aqi": 55,
  //   "co2": 460,
  //   "createdAt": "2025-08-17 09:56:00",
  //   "hum": 85.3,
  //   "no2": 0,
  //   "pm1": 2,
  //   "pm10": 9,
  //   "pm25": 8,
  //   "temp": 26.75,
  //   "voc": 0
  // },
  // "_2025_08_17_09_58_04": {
  //   "aqi": 54,
  //   "co2": 459,
  //   "createdAt": "2025-08-17 09:58:04",
  //   "hum": 84.6,
  //   "no2": 0,
  //   "pm1": 2,
  //   "pm10": 9,
  //   "pm25": 8,
  //   "temp": 27,
  //   "voc": 0
  // },
  // "_2025_08_17_10_00_12": {
  //   "aqi": 58,
  //   "co2": 499,
  //   "createdAt": "2025-08-17 10:00:12",
  //   "hum": 84.7,
  //   "no2": 0,
  //   "pm1": 2,
  //   "pm10": 9,
  //   "pm25": 8,
  //   "temp": 27.125,
  //   "voc": 0
  // },
  // "_2025_08_17_10_02_16": {
  //   "aqi": 56,
  //   "co2": 483,
  //   "createdAt": "2025-08-17 10:02:16",
  //   "hum": 84.5,
  //   "no2": 0,
  //   "pm1": 2,
  //   "pm10": 9,
  //   "pm25": 8,
  //   "temp": 27.3125,
  //   "voc": 0
  // },
  // "_2025_08_17_10_04_23": {
  //   "aqi": 59,
  //   "co2": 508,
  //   "createdAt": "2025-08-17 10:04:23",
  //   "hum": 84.3,
  //   "no2": 0,
  //   "pm1": 2,
  //   "pm10": 9,
  //   "pm25": 8,
  //   "temp": 27.4375,
  //   "voc": 0
  // }

}
  

  
   


  return <AirQualityDashboard data={airQualityData} />;
};

export default AirQualityDashboard;