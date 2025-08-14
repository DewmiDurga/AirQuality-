import { useState, useEffect } from 'react';
import { Heart, Share2, Droplets, Sun } from 'lucide-react';
import ParameterDetailComponent from './components/parameters';
import axios from 'axios';
import AirQualityForm from './components/AddData';
import NewGraph from './components/newGraph';

const BreathEasyDashboard = () => {
    const databaseURL = "https://breath-easy-2-default-rtdb.asia-southeast1.firebasedatabase.app/";
    const itemsEndpoint = `${databaseURL}/2025_8_7.json`;
    const [fetchedData, setFetchedData] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const [lastItem, setLastItem] = useState({});
    // const [lastItemdate, setLastItemDate] = useState(null);
    let lastItemdate = null
    const [modifiedData, setmodifiedData] = useState(null);
    const [cat, setCat] = useState(null);
    const [showGraph, setShowGraph] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState('aqi');
    const [activeSection, setActiveSection] = useState('readings'); // 'readings' or 'contact'

    // lastItem.createdAt ? new Date(lastItem.createdAt).toLocaleTimeString()
    const printData = () => {
        const raw = lastItem.createdAt; // e.g., "2025_7_15_17_29_9"

        const [year, month, day, hour, minute, second] = raw.split('_').map(Number);

        // Month names array
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Format final string
        const formattedDate = `${year} ${monthNames[month - 1]} ${day} - ${hour}h ${minute}min ${second}s`;

        lastItemdate = formattedDate
    }

    lastItem.createdAt ? printData() : null;
    
    const handleFetchData = async () => {
        try {
            const response = await axios.get(itemsEndpoint);
            const data = response.data;
            
            
            console.log('response', response)
            const dataArray = data
                ? Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }))
                : [];
            setFetchError('');
            setFetchedData(dataArray);
            if (dataArray.length > 0) {
                setLastItem(dataArray[dataArray.length - 1]);
            }
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
        if (numericAqi <= 50) return 'linear-gradient(135deg, #86efac, #22c55e)';
        if (numericAqi <= 100) return 'linear-gradient(135deg, #fde047, #eab308)';
        if (numericAqi <= 150) return 'linear-gradient(135deg, #fdba74, #ea580c)';
        if (numericAqi <= 200) return 'linear-gradient(135deg, #fca5a5, #dc2626)';
        if (numericAqi <= 300) return 'linear-gradient(135deg, #c4b5fd, #7c3aed)';
        return 'linear-gradient(135deg, #b91c1c, #7f1d1d)';
    };

    const getAirQualityInfo = (aqi) => {
        const numericAqi = parseInt(aqi) || 0;
        if (numericAqi <= 50) return { emoji: "😊" };
        if (numericAqi <= 100) return { emoji: "😐" };
        if (numericAqi <= 150) return { emoji: "😷" };
        if (numericAqi <= 200) return { emoji: "😷" };
        if (numericAqi <= 300) return { emoji: "😵" };
        return { emoji: "🤢" };
    };

    const openGraph = (type) => {
        setSelectedMetric(type);
        setShowGraph(true);
    };

    const closeGraph = () => {
        setShowGraph(false);
        setSelectedMetric('');
    };

    if (showGraph) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)', 
                padding: '20px' 
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '30px' 
                    }}>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: 'bold', 
                            color: '#0f172a' 
                        }}>
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
        name: selectedMetric.toUpperCase(),
        value: lastItem[selectedMetric] || 0,
        unit: selectedMetric === 'temp' ? '°C' : 
               selectedMetric === 'hum' ? '%' : 
               selectedMetric === 'co2' ? 'ppm' : 
               selectedMetric.startsWith('PM') ? 'µg/m³' : '',
        description: selectedMetric === 'temp' ? 'Temperature' :
                   selectedMetric === 'hum' ? 'Humidity' :
                   selectedMetric === 'no2' ? 'Nitrogen Dioxide' :
                   selectedMetric === 'co2' ? 'Carbon Dioxide' :
                   selectedMetric === 'voc' ? 'Volatile Organic Compounds' :
                   //selectedMetric === 'o3' ? 'Ozone' :
                   selectedMetric,
        threshold: {
            temp: { good: 26, moderate: 28, unhealthy:30, veryUnhealthy: 32, hazardous: 35,veryhazardous:100 },
            hum: { good: 40, moderate: 60, unhealthy: 70, veryUnhealthy: 80, hazardous: 90,veryhazardous:100},
            voc: { good: 200, moderate: 300, unhealthy: 500, veryUnhealthy: 1000, hazardous: 3000,veryhazardous:10000 },
            co2: { good: 400, moderate: 1000, unhealthy: 1500, veryUnhealthy: 2000, hazardous: 5000,veryhazardous:20000},
            no2: { good: 65, moderate: 130, unhealthy: 350, veryUnhealthy: 650, hazardous: 1250,veryhazardous:5000},
           // o3: { good: 50, moderate: 100, unhealthy: 150, veryUnhealthy: 200, hazardous: 300 },
            PM1: { good: 15, moderate: 30, unhealthy: 50, veryUnhealthy: 100, hazardous: 150,veryhazardous:500},
            PM25: { good: 25, moderate: 50, unhealthy: 75, veryUnhealthy: 150, hazardous: 250,veryhazardous:750 },
            PM10: { good: 50, moderate: 100, unhealthy: 150, veryUnhealthy: 275, hazardous: 450,veryhazardous:2000 }
        }[selectedMetric] || { good: 50, moderate: 100, unhealthy: 150, veryUnhealthy: 300, hazardous: 1000,veryhazardous:5000 }
    }}
/>
                    {modifiedData && 
                        <NewGraph data={modifiedData} dataType={cat} />
                    }
                </div>
            </div>
        );
    }

    const aqiInfo = getAQICategory(lastItem.aqi);

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* For adding data, if you do not need then comment and save */}
            {/* <AirQualityForm/> */}
            
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => setActiveSection('readings')}
                        style={{
                            backgroundColor: activeSection === 'readings' ? '#295dc3ff' : 'rgba(41, 93, 195, 0.7)',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Current Readings
                    </button>
                    <button
                        onClick={() => setActiveSection('contact')}
                        style={{
                            backgroundColor: activeSection === 'contact' ? '#295dc3ff' : 'rgba(41, 93, 195, 0.7)',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Contact
                    </button>
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
                {/* Badges */}
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
                            Last Updated: {lastItemdate ? lastItemdate : 'Loading...'} (Local Time)
                        </p>
                    </div>
                    
                    {/* Main Dashboard Card */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '32px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        background: lastItem.aqi ? getAQIGradient(lastItem.aqi) : 'linear-gradient(135deg, #86efac, #22c55e)',
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
                                    {lastItem.aqi !== undefined ? lastItem.aqi : '--'}
                                </div>
                                
                                {/* PM Values */}
                                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>PM10</div>
                                        <div style={{ fontSize: '16px', color: '#374151', fontWeight: '600' }}>
                                            {lastItem.PM10 !== undefined ? `${lastItem.PM10} µg/m³` : '--'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>PM2.5</div>
                                        <div style={{ fontSize: '16px', color: '#374151', fontWeight: '600' }}>
                                            {lastItem.PM25 !== undefined ? `${lastItem.PM25} µg/m³` : '--'}
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
                                            left: `${Math.min((parseInt(lastItem.aqi) || 0) / 300 * 100, 100)}%`,
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
                                    {getAirQualityInfo(lastItem.aqi || 0).emoji}
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
                                        {lastItem.temp !== undefined ? `${lastItem.temp}°C` : '--'}
                                    </div>
                                </div>
                                {/* <div style={{ 
                                    fontSize: '16px', 
                                    color: '#64748b',
                                    marginBottom: '20px'
                                }}>
                                  {lastItem.hum !== undefined ? 'Humid' : 'Loading...'}
                                </div> */}
                                
                                {/* Weather Details */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>Humidity</span>
                                        <Droplets size={16} color="#64748b" />
                                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                                            {lastItem.hum !== undefined ? `${lastItem.hum}%` : '--'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Content Section - Conditionally Rendered */}
            <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                {activeSection === 'readings' ? (
                    <>
                        <h2 style={{ 
                            fontSize: '20px', 
                            fontWeight: '600', 
                            color: '#161d38ff',
                            marginBottom: '24px'
                        }}>
                            Current Air Quality Readings
                        </h2>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '16px'
                        }}>
                            {lastItem && Object.keys(lastItem).map((key) => {
                                // Skip non-sensor data fields
                                if (key === 'id' || key === 'createdAt' || key === 'aqi') return null;
                                
                                // Format the display name
                                const displayName = key === 'temp' ? 'Temperature' :
                                                 key === 'hum' ? 'Humidity' :
                                                 key === 'co2' ? 'CO2' :
                                                 key === 'no2' ? 'NO2' :
                                                 key === 'voc' ? 'VOC' :
                                                 key === 'PM1' ? 'PM1' :
                                                 key === 'PM10' ? 'PM10' :
                                                 key === 'PM2.5' ? 'PM2.5' :
                                                 //key === 'o3' ? 'O3' :
                                                 key;
                                                 
                                // Get the unit
                                const unit = key === 'temp' ? '°C' :
                                           key === 'hum' ? '%' :
                                           key === 'co2' ? 'ppm' :
                                           key === 'no2' ? 'ppb' :
                                           key === 'voc' ? 'ppb' :
                                           key.startsWith('PM') ? 'µg/m³' :
                                           //key === 'o3' ? 'ppb' :
                                            '';
                                
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
                                        onClick={() => {openGraph(key); setCat(key);}}
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
                                            {displayName}
                                        </h3>
                                        <p style={{ 
                                            fontSize: '20px', 
                                            fontWeight: '700', 
                                            color: '#0f172a',
                                            margin: '0'
                                        }}>
                                            {lastItem[key] !== undefined ? `${lastItem[key]}${unit ? ` ${unit}` : ''}` : '--'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '40px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ 
                            fontSize: '28px', 
                            fontWeight: '700', 
                            color: '#1f4c8cff',
                            marginBottom: '20px'
                        }}>
                            Contact Us
                        </h2>
                        <div style={{ 
                            fontSize: '18px', 
                            color: '#374151',
                            marginBottom: '30px',
                            lineHeight: '1.6'
                        }}>
                            Have questions or need assistance with your air quality monitoring?
                            <br />
                            We're here to help you breathe easier.
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '15px',
                            fontSize: '16px',
                            color: '#64748b'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#3b82f6' }}>
                                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>techtitans036@gmail.com</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#3b82f6' }}>
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 2h3a2 2 0 012 2c0 4.8 1.41 9.2 3.92 12.82A2 2 0 0113 22h3a2 2 0 012-2v-3a2 2 0 012-2 2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>+94 110000000</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#3b82f6' }}>
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>FIT UOM</span>
                            </div>
                        </div>
                        <div style={{
                            marginTop: '30px',
                            padding: '20px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            fontSize: '14px',
                            color: '#64748b'
                        }}>
                            Our team is available Monday to Friday, 9:00 AM to 6:00 PM IST.
                            <br />
                            For technical support, please include your device ID in your message.
                        </div>
                    </div>
                )}
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