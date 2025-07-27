import { useState, useEffect } from 'react';
import { Heart, Share2, Droplets, Sun } from 'lucide-react';
import ParameterDetailComponent from './components/parameters';
import axios from 'axios';
import AirQualityForm from './components/AddData';
import NewGraph from './components/newGraph';

const BreathEasyDashboard = () => {
    const databaseURL = "https://breath-easy-2-default-rtdb.asia-southeast1.firebasedatabase.app";
    const itemsEndpoint = `${databaseURL}/data.json`;
    const [fetchedData, setFetchedData] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const [lastItem, setLastItem] = useState({});
    const [modifiedData, setmodifiedData] = useState(null);
    const [cat, setCat] = useState(null);


    const handleFetchData = async () => {
    try {
      const response = await axios.get(itemsEndpoint);
      const data = response.data;

      const dataArray = data
        ? Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }))
        : [];

      setFetchError('');
      setFetchedData(dataArray); 
      setLastItem(dataArray[dataArray.length - 1]); 

    } catch (err) {
      console.error("Error fetching data:", err);
      setFetchError('Failed to fetch data. Please try again.');
    }
    };

    useEffect(() => {
      handleFetchData(); // Run immediately on mount

      const intervalId = setInterval(handleFetchData, 300000); // Every 5 mins

      return () => clearInterval(intervalId); // Clean up
    }, []);



    function groupSensorDataByDay(dataArray) {
    const result = {};

    dataArray.forEach(entry => {
      const date = entry.createdAt.split("T")[0]; // Extract YYYY-MM-DD

      Object.keys(entry).forEach(key => {
        if (key === "createdAt" || key === "id") return;

        if (!result[key]) result[key] = [];

        // Check if an object for this date already exists for this key
        let dateEntry = result[key].find(item => item.date === date);

        if (!dateEntry) {
          dateEntry = { date, values: [], avg: 0 };
          result[key].push(dateEntry);
        }

        dateEntry.values.push(entry[key]);

        // Update average
        const sum = dateEntry.values.reduce((a, b) => a + b, 0);
        dateEntry.avg = parseFloat((sum / dateEntry.values.length).toFixed(2));
      });
    });

    setmodifiedData(result);
    return result;
    }

    useEffect(() => {
    if (fetchedData.length > 0) {
      const grouped = groupSensorDataByDay(fetchedData);
      setmodifiedData(grouped);
    }
    }, [fetchedData]);



      const [airQualityIndex, setAirQualityIndex] = useState('--');
      const [averageReadings, setAverageReadings] = useState({
        temperature: 'Loading...',
        humidity: 'Loading...',
        no2: 'Loading...',
        co: 'Loading...',
        voc: 'Loading...',
        pm10: 'Loading...',
        pm1:'Loading...',
        o3:'Loading...',
        pm25: 'Loading...',
        aqi: 'Loading...'
      });
      const [weatherData, setWeatherData] = useState({
        temperature: 'Loading...',
        humidity: 'Loading...',
        windSpeed: 'Loading...',
        uvIndex: 'Loading...',
        condition: 'Loading...'
      });
      const [showGraph, setShowGraph] = useState(false);
      const [selectedMetric, setSelectedMetric] = useState('aqi');


      // Simulate loading data
      useEffect(() => {
        const timer = setTimeout(() => {
          
          setAirQualityIndex(lastItem.aqi);
          setAverageReadings({
            temperature: lastItem.temp,
            humidity: lastItem.hum,
            no2: lastItem.no2,
            co: lastItem.co2,
            voc: lastItem.voc,
            pm10: lastItem.PM10,
            pm1: lastItem.PM1,
            O3: lastItem.temp,
            pm25: lastItem.PM25,
            aqi: lastItem.aqi
          });
          setWeatherData({
            temperature: '31°C',
            humidity: '75%',
            windSpeed: '25 km/h',
            uvIndex: '4'
          });
        }, 5000);

        return () => clearTimeout(timer);
      });

      const openGraph = (type) => {
        setSelectedMetric(type);
        setShowGraph(true);
      };

      const closeGraph = () => {
        setShowGraph(false);
        setSelectedMetric('');
      };

      const getAQICategory = (aqi) => {
        const numericAqi = parseInt(aqi) || 0;
        if (numericAqi <= 50) return { category: 'Good', color: '#22c55e' };
        if (numericAqi <= 100) return { category: 'Moderate', color: '#f59e0b' };
        if (numericAqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: '#f97316' };
        if (numericAqi <= 200) return { category: 'Unhealthy', color: '#ef4444' };
        if (numericAqi <= 300) return { category: 'Very Unhealthy', color: '#8b5cf6' };
        return { category: 'Hazardous', color: '#7f1d1d' };
      };

      const getAQIGradient = (aqi) => {
        const numericAqi = parseInt(aqi) || 0;
    if (numericAqi <= 50) return 'linear-gradient(135deg, #86efac, #22c55e)'; // Forest Green
    if (numericAqi <= 100) return 'linear-gradient(135deg, #fde047, #eab308)'; // Sunflower Yellow
    if (numericAqi <= 150) return 'linear-gradient(135deg, #fdba74, #ea580c)'; // Autumn Orange
    if (numericAqi <= 200) return 'linear-gradient(135deg, #fca5a5, #dc2626)'; // Sunset Red
    if (numericAqi <= 300) return 'linear-gradient(135deg, #c4b5fd, #7c3aed)'; // Lavender Purple
    return 'linear-gradient(135deg, #b91c1c, #7f1d1d)'; // Deep Earth Red
      };
        
      const getAirQualityInfo = (aqi) => {
        if (aqi <= 50) return { emoji: "😊" };
        if (aqi <= 100) return {  emoji: "😐" };
        if (aqi <= 150) return {  emoji: "😷" };
        if (aqi <= 200) return {  emoji: "😷" };
        if (aqi <= 300) return {  emoji: "😵" };
        return {  emoji: "🤢" };
      };

      if (showGraph) {
        return (
          <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)', padding: '20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px' 
              }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>
                  Air Quality Trends
                </h1>
                <button
                  onClick={closeGraph}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ← Back to Dashboard
                </button>
              </div>


              <ParameterDetailComponent 
                      parameter={{
                        name: 'PM2.5',
                        value: 15,
                        unit: 'µg/m³',
                        description: 'Particulate Matter 2.5',
                      
                        threshold: {
                          good: 50,
                          moderate: 100,
                          unhealthy: 150,
                          veryUnhealthy: 300,
                          hazardous: 1000
                        }
                      }}
              />

              
              {modifiedData? 
              <NewGraph data={modifiedData} dataType={cat} />
              :null}
              
              
            </div>
          </div>
        );
      }

      const aqiInfo = getAQICategory(airQualityIndex);
      

      return (
        <div style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>

          {/* for adding data, if you do not need then comment and save */}
          <AirQualityForm/>

          {/* Header */}
          <div style={{ 
            backgroundColor: '#7ed12cff',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" fill="white" stroke="#15803d" strokeWidth="2"/>
                  <path d="M12 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#15803d" strokeWidth="2" fill="none"/>
                  <path d="M14 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#15803d" strokeWidth="2" fill="none"/>
                  <path d="M16 20c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#15803d" strokeWidth="2" fill="none"/>
                  <circle cx="20" cy="20" r="2" fill="#15803d"/>
                </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                
                color: 'white',
                padding: '1px',
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Breath Easy
              </div>
              </div>
            
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>


            
              <div style={{  backgroundColor: '#295dc3ff',
                color: 'white',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
                }}>average Readings</div>
                <div style={{  backgroundColor: '#295dc3ff',
                color: 'white',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
                }}>Contact</div>
            </div>
          </div>

        {/* Map Background Section */}
        <div style={{
            position: 'relative',
            minHeight: '400px',
            background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23e2e8f0" stroke-width="0.5"/></pattern></defs><rect width="1000" height="400" fill="%23f8fafc"/><rect width="1000" height="400" fill="url(%23grid)"/><path d="M100 200 Q200 150 300 200 T500 180 T700 220 T900 200" stroke="%23cbd5e1" stroke-width="2" fill="none"/><path d="M150 250 Q250 200 350 250 T550 230 T750 270 T950 250" stroke="%23cbd5e1" stroke-width="2" fill="none"/><circle cx="300" cy="200" r="3" fill="%23f59e0b"/><circle cx="600" cy="180" r="3" fill="%23f59e0b"/><circle cx="800" cy="220" r="3" fill="%23f59e0b"/></svg>') no-repeat center`,
            backgroundSize: 'cover',
            padding: '40px 24px'
          }}>
            {/* n Badge */}
            <div style={{
              position: 'absolute',
              top: '60px',
              right: '24px',
              display: 'flex',
              gap: '8px'
            }}>
              <button style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#3b82f6'
              }}>
              
              <Heart size={16} color="#64748b" />
              </button>
              <button style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer'
              }}>
                <Share2 size={16} color="#64748b" />
              </button>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <h1 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#0f172a',
                  margin: '0 0 8px 0'
                }}>
                  Real-time Air Quality Index (AQI)
                </h1>
              
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b',
                  margin: '0'
                }}>
                  Last Updated: 3 minutes ago (Local Time)
                </p>
              </div>

              {/* Main Dashboard Card */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                background: getAQIGradient(airQualityIndex),
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '32px',
                  alignItems: 'center'
                }}>
                  {/* AQI Section */}
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%'
                      }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        Live AQI
                      </span>
                  
                    </div>
                    
                    <div style={{ 
                      fontSize: '72px', 
                      fontWeight: '800', 
                      color: aqiInfo.color,
                      lineHeight: '1',
                      marginBottom: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => openGraph('aqi')}>
                      {airQualityIndex}
                    </div>

                    {/* PM Values */}
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>PM10</div>
                        <div style={{ fontSize: '16px', color: '#374151', fontWeight: '600' }}>
                          {averageReadings.pm10}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>PM2.5</div>
                        <div style={{ fontSize: '16px', color: '#374151', fontWeight: '600' }}>
                          {averageReadings.pm25}
                        </div>
                      </div>
                    </div>

                    {/* AQI Scale */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'linear-gradient(to right, #22c55e, #f59e0b, #f97316, #ef4444, #8b5cf6, #7f1d1d)',
                        position: 'relative',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-2px',
                          left: `${Math.min((parseInt(airQualityIndex) || 0) / 300 * 100, 100)}%`,
                          width: '12px',
                          height: '12px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          border: '2px solid #374151',
                          transform: 'translateX(-50%)'
                        }}></div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        <span>Good</span>
                        <span>Moderate</span>
                        <span>Poor</span>
                        <span>Unhealthy</span>
                        <span>Severe</span>
                        <span>Hazardous</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '10px',
                        color: '#94a3b8',
                        marginTop: '4px'
                      }}>
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                        <span>150</span>
                        <span>200</span>
                        <span>300</span>
                        <span>301+</span>
                      </div>
                    </div>
                  </div>

                  {/* Character Section */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '16px'
                    }}>
                      Air Quality is
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: aqiInfo.color,
                      marginBottom: '20px'
                    }}>
                      {aqiInfo.category}
                      
                    </div>
                    <span style={{
                      fontSize: '40px'
                    }}>
                      {getAirQualityInfo(airQualityIndex).emoji}
                    </span>

                    

                
                  </div>

                  {/* Weather Section */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Sun size={20} color="white" />
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#374151' }}>
                        {weatherData.temperature}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      color: '#64748b',
                      marginBottom: '20px'
                    }}>
                      {weatherData.condition}
                    </div>

                    {/* Weather Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>Humidity</span>
                        <Droplets size={16} color="#64748b" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                          {weatherData.humidity}
                        </span>
                      </div>
                    
                    
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      

          {/* Additional Readings Section */}
          <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#161d38ff',
              marginBottom: '24px'
            }}>
            Average Air Quality Readings
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px'
            }}>
    
              {modifiedData? Object.entries(modifiedData).map(([key, dataArray]) => {
              // Calculate average from the nested structure
              const allValues = dataArray.flatMap(entry => entry.values);
              const average = allValues.length > 0 
                ? (allValues.reduce((sum, val) => sum + val, 0) / allValues.length).toFixed(1)
                : 'N/A';
      
              return (
                <div 
                  key={key}
                  style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                    padding: '20px', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onClick={() => {openGraph(key), setCat(key)}}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <h3 style={{ 
                    fontSize: '14px', 
                    color: '#1f4c8cff', 
                    marginBottom: '8px', 
                    textTransform: 'uppercase',
                    fontWeight: '500'
                  }}>
                    {key}
                  </h3>
                  <p style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#0f172a',
                    margin: '0'
                  }}>
                    {average}
                  </p>
                </div>
              );
              }) : null}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#7ed12cff',
            padding: '24px',
            textAlign: 'center',
            borderTop: '1px solid #e2e8f0',
            marginTop: 'auto'
          }}>
            <div style={{
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              If you have any issues, please contact us at{' '}
              <a 
                href="mailto:techtitans036@gmail.com"
                style={{
                  color: '#f1f8f4ff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                techtitans036@gmail.com
              </a>
            </div>
            <div style={{
              color: '#151b24ff',
              fontSize: '12px',
              fontWeight: '400'
            }}>
              © 2025 Breath Easy. All rights reserved.
            </div>
          </div>
    
        </div>
      );
    };

    export default BreathEasyDashboard;