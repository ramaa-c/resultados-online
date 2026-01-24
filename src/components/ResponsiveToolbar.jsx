import React, { useState, useEffect, useRef } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import '../styles/toolbar.css';

export const ResponsiveToolbar = ({ actions }) => {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(actions.length);
  const [showOverflow, setShowOverflow] = useState(false);
  const BUTTON_WIDTH = 42;
  const OVERFLOW_BTN_WIDTH = 40;

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - 10; 
      
      const maxPossible = Math.floor(availableWidth / BUTTON_WIDTH);

      if (maxPossible >= actions.length) {
        setVisibleCount(actions.length);
      } else {
        const maxWithOverflow = Math.floor((availableWidth - OVERFLOW_BTN_WIDTH) / BUTTON_WIDTH);
        setVisibleCount(Math.max(0, maxWithOverflow));
      }
    };

    const observer = new ResizeObserver(calculateVisibleItems);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [actions.length]);

  const visibleActions = actions.slice(0, visibleCount);
  const overflowActions = actions.slice(visibleCount);

  return (
    <div className="toolbar-container" ref={containerRef}>
      {/* Botones Visibles */}
      {visibleActions.map((action, index) => (
        <button
          key={index}
          className={`btn-toolbar ${action.active ? 'active' : ''}`}
          onClick={action.onClick}
          disabled={action.disabled}
          data-tooltip={action.label}
        >
          {action.icon}
        </button>
      ))}

      {overflowActions.length > 0 && (
        <div className="toolbar-overflow-wrapper">
          <button 
            className="btn-toolbar overflow-trigger"
            onClick={() => setShowOverflow(!showOverflow)}
          >
            <FiMoreVertical />
          </button>
          
          {showOverflow && (
            <div className="overflow-menu">
              {overflowActions.map((action, index) => (
                <div 
                  key={index} 
                  className={`overflow-item ${action.disabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if(!action.disabled) {
                      action.onClick();
                      setShowOverflow(false);
                    }
                  }}
                >
                  <span className="overflow-icon">{action.icon}</span>
                  <span className="overflow-label">{action.label}</span>
                </div>
              ))}
            </div>
          )}
          
          {showOverflow && (
            <div 
              className="overflow-backdrop" 
              onClick={() => setShowOverflow(false)} 
            />
          )}
        </div>
      )}
    </div>
  );
};