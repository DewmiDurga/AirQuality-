import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ParameterDetailComponent = ({ 
  parameter = 7,
  historicalData = [30,40,50],
  onClose
}) => {
  // Get parameter category based on thresholds
  const getParameterCategory = (value, thresholds) => {
    if (value <= thresholds.good) return { category: 'Good', color: '#22c55e', emoji: '😊' };
    if (value <= thresholds.moderate) return { category: 'Moderate', color: '#f59e0b', emoji: '😐' };
    if (value <= thresholds.unhealthy) return { category: 'Unhealthy for Sensitive Groups', color: '#f97316', emoji: '😷' };
    if (value <= thresholds.veryUnhealthy) return { category: 'Unhealthy', color: '#ef4444', emoji: '😵' };
    if (value <= thresholds.hazardous) return { category: 'Very Unhealthy', color: '#8b5cf6', emoji: '🤢' };
    return { category: 'Hazardous', color: '#7f1d1d', emoji: '☠️' };
  };

  // Custom tooltip for the graph
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: `2px solid ${parameter.color}`,
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '150px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>Time: {label}</p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px'
          }}>
            <span style={{ color: parameter.color, fontWeight: '500' }}>{parameter.name}:</span>
            <span>{data.value} {parameter.unit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Transform data format from 'hour' to 'time' if needed
  const transformedData = historicalData.map(item => ({
    time: item.hour || item.time,
    value: item.value
  }));

  const categoryInfo = getParameterCategory(parameter.value, parameter.threshold);

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: parameter.color,
            margin: '0 0 8px 0'
          }}>
            {parameter.name === 'PM25' ? 'PM2.5' : parameter.name} - {parameter.description}
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            margin: '0'
          }}>
            Last Updated: 3 minutes ago
          </p>
        </div>
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Main Parameter Display */}
      <div style={{ 
       background: categoryInfo.category === 'Good' ? 'linear-gradient(135deg, #86efac, #22c55e)' :
           categoryInfo.category === 'Moderate' ? 'linear-gradient(135deg, #fde047, #eab308)' :
           categoryInfo.category === 'Unhealthy for Sensitive Groups' ? 'linear-gradient(135deg, #fdba74, #ea580c)' :
           categoryInfo.category === 'Unhealthy' ? 'linear-gradient(135deg, #fca5a5, #dc2626)' :
           categoryInfo.category === 'Very Unhealthy' ? 'linear-gradient(135deg, #c4b5fd, #7c3aed)' : 'linear-gradient(135deg, #b91c1c, #7f1d1d)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '20px',
        minHeight: '300px',
        border: `2px solid ${parameter.color}`
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          alignItems: 'center'
        }}>
          {/* Left Section - Parameter Value */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '15px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: parameter.color,
                borderRadius: '50%'
              }}></div> <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%'
                  }}></div>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Live {parameter.name === 'PM25' ? 'PM2.5' : parameter.name}
              </span>
            </div>

            <div style={{ 
              fontSize: '120px', 
              fontWeight: 'bold',
              color: categoryInfo.color,
              lineHeight: '1',
              marginBottom: '15px'
            }}>
              {parameter.value}
            </div>

            <div style={{ 
              fontSize: '18px', 
              color: '#374151',
              fontWeight: '500'
            }}>
              {parameter.unit}
            </div>
          </div>

          {/* Right Section - Status */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '24px', 
              color: '#4b5563',
              margin: '0 0 10px 0'
            }}>
              {parameter.description}
            </h2>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 'bold',
              color: categoryInfo.color,
              margin: '0 0 20px 0',
              lineHeight: '1.2'
            }}>
              {categoryInfo.category}
            </h1>
            
            <div style={{ 
              fontSize: '60px', 
              marginBottom: '15px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {categoryInfo.emoji}
            </div>
          </div>
        </div>

        {/* Horizontal Scale Bar matching the photo */}
        <div style={{ 
          marginTop: '25px',
          padding: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Scale Bar with colors from photo */}
          <div style={{ 
            position: 'relative',
            height: '20px',
            background: 'linear-gradient(to right, #22c55e, #f59e0b, #f97316, #ef4444, #8b5cf6, #7f1d1d)',
            borderRadius: '10px',
            marginBottom: '15px'
          }}>
            {/* Current Value Indicator */}
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: `${Math.min((parameter.value / parameter.threshold.veryhazardous)* 100, 100)}%`,
              transform: 'translateX(-50%)',
              width: '10px',
              height: '10px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              border: '2px solid #374151',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              zIndex: 10
            }}></div>
          </div>

          {/* Scale Numbers */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            <span>0</span>
            <span>{parameter.threshold.good}</span>
            <span>{parameter.threshold.moderate}</span>
            <span>{parameter.threshold.unhealthy}</span>
            <span>{parameter.threshold.veryUnhealthy}</span>
            <span>{parameter.threshold.hazardous}</span>
            <span>{parameter.threshold.veryhazardous}</span>
          </div>

          {/* Scale Labels */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            
            fontWeight: '600'
          }}>
            <span style={{ color: '#22c55e', textAlign: 'center', flex: 1 }}>Good</span>
            <span style={{ color: '#f59e0b', textAlign: 'center', flex: 1 }}>Moderate</span>
            <span style={{ color: '#f97316', textAlign: 'center', flex: 1 }}>Unhealthy for Sensitive Groups</span>
            <span style={{ color: '#ef4444', textAlign: 'center', flex: 1 }}>Unhealthy</span>
            <span style={{ color: '#8b5cf6', textAlign: 'center', flex: 1 }}>Very Unhealthy</span>
            <span style={{ color: '#7f1d1d', textAlign: 'center', flex: 1 }}>Hazardous</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterDetailComponent;