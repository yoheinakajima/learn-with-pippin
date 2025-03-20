import React from "react";
import { MapConfig, MapNode, MapPath, MapDecoration } from "@/lib/types";
import { Link } from "wouter";

interface MapSvgProps {
  config: MapConfig;
}

export function MapSvg({ config }: MapSvgProps) {
  // Map node rendering based on status and type
  const renderNode = (node: MapNode) => {
    let content;
    let fill;
    let fillInner;
    let className = "map-node";
    
    // Add floating animation to current node
    if (node.status === "current") {
      className += " float";
    }
    
    // Determine colors based on status
    switch (node.status) {
      case "completed":
        fill = "#4CAF50";
        fillInner = "#81C784";
        break;
      case "current":
        fill = "#FF9800";
        fillInner = "#FFB74D";
        break;
      case "available":
        fill = "#7E57C2";
        fillInner = "#9575CD";
        break;
      case "locked":
        fill = "#9E9E9E";
        fillInner = "#BDBDBD";
        break;
    }
    
    // Determine inner content based on type and status
    switch (true) {
      // Completed node - checkmark
      case node.status === "completed":
        content = <path d="M-10,0 L-4,6 L10,-8" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
        break;
      
      // Current node - exclamation mark
      case node.status === "current":
        content = <text x="0" y="5" textAnchor="middle" fill="white" fontWeight="bold">!</text>;
        break;
      
      // Available node - question mark
      case node.status === "available":
        content = <text x="0" y="5" textAnchor="middle" fill="white" fontWeight="bold">?</text>;
        break;
      
      // Locked node - lock icon
      case node.status === "locked":
        content = (
          <>
            <path d="M-5,-8 L5,-8 L5,5 L-5,5 Z" fill="#757575" />
            <rect x="-9" y="-3" width="18" height="15" rx="2" fill="#757575" />
          </>
        );
        break;
      
      // Boss node - star
      case node.type === "boss":
        content = (
          <path 
            d="M0,-15 L5,-5 L15,-5 L7,2 L10,12 L0,6 L-10,12 L-7,2 L-15,-5 L-5,-5 Z" 
            fill={node.status === "locked" ? "#757575" : "#FFEB3B"} 
          />
        );
        fill = node.status === "locked" ? "#9E9E9E" : "#F44336";
        fillInner = node.status === "locked" ? "#BDBDBD" : "#EF5350";
        break;
    }
    
    // Make node slightly larger if it's a boss
    const radius = node.type === "boss" ? 30 : 25;
    const innerRadius = node.type === "boss" ? 25 : 20;
    
    // For inactive nodes, just render the node without a link
    if (node.status === "locked") {
      return (
        <g key={node.id} className={className} transform={`translate(${node.x}, ${node.y})`}>
          <circle cx="0" cy="0" r={radius} fill={fill} />
          <circle cx="0" cy="0" r={innerRadius} fill={fillInner} />
          {content}
        </g>
      );
    }
    
    // For active nodes, create links based on node type
    let linkHref = "#";
    let cursor = "pointer";
    
    if (node.status === "completed" || node.status === "current" || node.status === "available") {
      switch (node.type) {
        case "mini-game":
          // Link to mini-game with ID 1 (temporary - in real implementation this would use real mini-game IDs)
          linkHref = "/mini-game/1";
          break;
        case "lesson":
          // Link to lesson with ID 1 (temporary - in real implementation this would use real lesson IDs)
          linkHref = "/lesson/1";
          break;
        case "boss":
          linkHref = "/mini-game/1"; // Assuming boss battles are special mini-games
          break;
        default:
          linkHref = "#";
      }
    }
    
    return (
      <Link href={linkHref} key={node.id}>
        <g className={`${className} ${(node.status === "completed" || node.status === "current" || node.status === "available") ? "cursor-pointer hover:opacity-80" : ""}`} 
           transform={`translate(${node.x}, ${node.y})`}>
          <circle cx="0" cy="0" r={radius} fill={fill} />
          <circle cx="0" cy="0" r={innerRadius} fill={fillInner} />
          {content}
        </g>
      </Link>
    );
  };
  
  // Render paths between nodes
  const renderPaths = () => {
    return config.paths.map((path, index) => {
      const fromNode = config.nodes.find(node => node.id === path.from);
      const toNode = config.nodes.find(node => node.id === path.to);
      
      if (!fromNode || !toNode) return null;
      
      return (
        <path 
          key={`path-${index}`}
          d={`M${fromNode.x},${fromNode.y} Q${(fromNode.x + toNode.x) / 2},${(fromNode.y + toNode.y) / 2 - 30} ${toNode.x},${toNode.y}`}
          stroke="#E2C38F" 
          strokeWidth="15" 
          fill="none" 
          strokeLinecap="round"
        />
      );
    });
  };
  
  // Render map decorations
  const renderDecorations = () => {
    return config.decorations.map((decoration, index) => {
      // Tree decoration
      if (decoration.type === "tree") {
        const size = decoration.size || 50;
        return (
          <g key={`decoration-${index}`} className="tree">
            <circle 
              cx={decoration.x} 
              cy={decoration.y} 
              r={size} 
              fill="#2E7D32" 
            />
            <circle 
              cx={decoration.x} 
              cy={decoration.y - (size * 0.4)} 
              r={size * 0.8} 
              fill="#388E3C" 
            />
            <circle 
              cx={decoration.x} 
              cy={decoration.y - (size * 0.8)} 
              r={size * 0.6} 
              fill="#43A047" 
            />
          </g>
        );
      }
      
      // Lake decoration
      if (decoration.type === "lake") {
        const width = decoration.width || 100;
        const height = decoration.height || 60;
        return (
          <g key={`decoration-${index}`}>
            <ellipse 
              cx={decoration.x} 
              cy={decoration.y} 
              rx={width} 
              ry={height} 
              fill="#2196F3" 
            />
            <ellipse 
              cx={decoration.x} 
              cy={decoration.y} 
              rx={width * 0.9} 
              ry={height * 0.85} 
              fill="#64B5F6" 
            />
          </g>
        );
      }
      
      return null;
    });
  };
  
  // Render magical items
  const renderMagicalItems = () => {
    return (
      <>
        <g className="magical-item float" transform="translate(300, 150)">
          <circle cx="0" cy="0" r="15" fill="#6C63FF" fillOpacity="0.3" />
          <path d="M-5,-10 L5,-10 L8,0 L0,15 L-8,0 Z" fill="#6C63FF" />
        </g>
        
        <g className="magical-item float" transform="translate(450, 400)">
          <circle cx="0" cy="0" r="12" fill="#FF9800" fillOpacity="0.3" />
          <circle cx="0" cy="0" r="6" fill="#FF9800" />
          <circle cx="0" cy="0" r="10" fill="none" stroke="#FF9800" strokeWidth="1.5" strokeDasharray="3,3" />
        </g>
      </>
    );
  };
  
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      {/* Paths between nodes */}
      {renderPaths()}
      
      {/* Map Decorations */}
      {renderDecorations()}
      
      {/* Interactive Nodes */}
      {config.nodes.map(renderNode)}
      
      {/* Magical Items */}
      {renderMagicalItems()}
    </svg>
  );
}
