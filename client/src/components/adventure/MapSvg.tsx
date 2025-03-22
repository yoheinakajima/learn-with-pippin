import React from "react";
import { MapConfig, MapNode, MapPath, MapDecoration } from "@/lib/types";
import { 
  BookOpen, 
  Star, 
  Trophy, 
  Clock, 
  Gamepad2, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Lock 
} from "lucide-react";

interface MapSvgProps {
  config: MapConfig;
  onNodeSelect?: (node: MapNode) => void;
}

export function MapSvg({ config, onNodeSelect }: MapSvgProps) {
  // Map node rendering based on status and type
  const renderNode = (node: MapNode) => {
    let content;
    let fill;
    let fillInner;
    let className = "map-node";
    let nodeIcon;
    
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
    
    // Get node type icon
    switch (node.type) {
      case "mini-game":
        nodeIcon = <Gamepad2 className="h-5 w-5 text-white" style={{ transform: 'translate(-12px, -12px)' }} />;
        break;
      case "lesson":
        nodeIcon = <BookOpen className="h-5 w-5 text-white" style={{ transform: 'translate(-12px, -12px)' }} />;
        break;
      case "mini-task":
        nodeIcon = <Clock className="h-5 w-5 text-white" style={{ transform: 'translate(-12px, -12px)' }} />;
        break;
      case "boss":
        nodeIcon = <Star className="h-5 w-5 text-white" style={{ transform: 'translate(-12px, -12px)' }} />;
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
    
    // Add glowing effect to current node
    const glowFilter = node.status === "current" ? 
      <filter id={`glow-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter> : null;
    
    // Handle node click to show details
    const handleNodeClick = () => {
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    };
    
    return (
      <g 
        key={node.id} 
        className={`${className} ${(node.status === "completed" || node.status === "current" || node.status === "available") ? "cursor-pointer hover:opacity-80" : ""}`} 
        transform={`translate(${node.x}, ${node.y})`}
        onClick={handleNodeClick}
      >
        {glowFilter}
        
        {/* Background glow for current node */}
        {node.status === "current" && (
          <circle 
            cx="0" 
            cy="0" 
            r={radius + 10} 
            fill={fill} 
            opacity="0.3" 
            className="animate-pulse"
          />
        )}
        
        {/* Main node circle */}
        <circle 
          cx="0" 
          cy="0" 
          r={radius} 
          fill={fill} 
          filter={node.status === "current" ? `url(#glow-${node.id})` : undefined}
        />
        <circle cx="0" cy="0" r={innerRadius} fill={fillInner} />
        
        {/* Node icon (added for better visual identification) */}
        {nodeIcon && (
          <foreignObject width="24" height="24" x="-12" y="-12">
            {nodeIcon}
          </foreignObject>
        )}
        
        {/* Node status indicator */}
        {content}
        
        {/* Node text label (for node type) */}
        <text 
          x="0" 
          y={radius + 15} 
          textAnchor="middle" 
          fill="white" 
          fontSize="12"
          fontWeight="bold"
          stroke="#000"
          strokeWidth="1.2"
          paintOrder="stroke"
        >
          {node.type === "mini-game" ? "Game" : 
           node.type === "lesson" ? "Lesson" : 
           node.type === "boss" ? "BOSS" : 
           "Task"}
        </text>
        
        {/* Status badge for completed, current, or locked nodes */}
        {node.status === "completed" && (
          <circle 
            cx={radius - 5} 
            cy={-radius + 5} 
            r="10" 
            fill="#4CAF50" 
            stroke="white" 
            strokeWidth="2"
          >
            <title>Completed</title>
          </circle>
        )}
        
        {node.status === "current" && (
          <circle 
            cx={radius - 5} 
            cy={-radius + 5} 
            r="10" 
            fill="#FF9800" 
            stroke="white" 
            strokeWidth="2"
            className="animate-pulse"
          >
            <title>Current Quest</title>
          </circle>
        )}
      </g>
    );
  };
  
  // Render paths between nodes
  const renderPaths = () => {
    return config.paths.map((path, index) => {
      const fromNode = config.nodes.find(node => node.id === path.from);
      const toNode = config.nodes.find(node => node.id === path.to);
      
      if (!fromNode || !toNode) return null;
      
      // Determine path style based on nodes' status
      let pathStyle = "#E2C38F"; // Default sand/trail color
      let pathWidth = 15;
      let pathClass = "";
      
      // If path connects to current node, make it more highlighted
      if (fromNode.status === "current" || toNode.status === "current") {
        pathStyle = "#FFB74D"; // Brighter path
        pathWidth = 18;
        pathClass = "highlighted-path";
      }
      
      // If path connects to locked node, make it look locked/incomplete
      if (fromNode.status === "locked" || toNode.status === "locked") {
        pathStyle = "#BDBDBD"; // Gray path
        pathClass = "locked-path";
      }
      
      // If path connects completed nodes, make it look successfully traveled
      if (fromNode.status === "completed" && toNode.status === "completed") {
        pathStyle = "#81C784"; // Green path
        pathClass = "completed-path";
      }
      
      // Create a fancy curved path between nodes with bezier curve
      return (
        <g key={`path-${index}`}>
          {/* Path shadow */}
          <path 
            d={`M${fromNode.x},${fromNode.y} Q${(fromNode.x + toNode.x) / 2},${(fromNode.y + toNode.y) / 2 - 30} ${toNode.x},${toNode.y}`}
            stroke="#00000033" 
            strokeWidth={pathWidth + 4} 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Main path */}
          <path 
            className={pathClass}
            d={`M${fromNode.x},${fromNode.y} Q${(fromNode.x + toNode.x) / 2},${(fromNode.y + toNode.y) / 2 - 30} ${toNode.x},${toNode.y}`}
            stroke={pathStyle} 
            strokeWidth={pathWidth} 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Decorative dots along path for completed paths */}
          {(fromNode.status === "completed" && toNode.status === "completed") && (
            <g className="path-decoration">
              <circle cx={(fromNode.x + toNode.x) / 2} cy={(fromNode.y + toNode.y) / 2 - 15} r="4" fill="#4CAF50" />
              <circle cx={(fromNode.x + 2*toNode.x) / 3} cy={(fromNode.y + 2*toNode.y) / 3 - 10} r="4" fill="#4CAF50" />
              <circle cx={(2*fromNode.x + toNode.x) / 3} cy={(2*fromNode.y + toNode.y) / 3 - 10} r="4" fill="#4CAF50" />
            </g>
          )}
        </g>
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
            {/* Tree shadow */}
            <ellipse 
              cx={decoration.x} 
              cy={decoration.y + size * 0.9} 
              rx={size * 0.5} 
              ry={size * 0.2} 
              fill="#00000033" 
            />
            
            {/* Tree trunk */}
            <rect 
              x={decoration.x - size/10} 
              y={decoration.y - size/2} 
              width={size/5} 
              height={size} 
              fill="#795548" 
              rx={size/20}
            />
            
            {/* Tree foliage */}
            <circle 
              cx={decoration.x} 
              cy={decoration.y - size * 0.7} 
              r={size * 0.6} 
              fill="#2E7D32" 
            />
            <circle 
              cx={decoration.x + size * 0.2} 
              cy={decoration.y - size * 0.5} 
              r={size * 0.5} 
              fill="#388E3C" 
            />
            <circle 
              cx={decoration.x - size * 0.2} 
              cy={decoration.y - size * 0.4} 
              r={size * 0.55} 
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
            
            {/* Add ripple effects */}
            <ellipse 
              cx={decoration.x - width * 0.3} 
              cy={decoration.y - height * 0.2} 
              rx={width * 0.05} 
              ry={height * 0.03} 
              fill="#90CAF9" 
              className="animate-pulse"
            />
            <ellipse 
              cx={decoration.x + width * 0.4} 
              cy={decoration.y + height * 0.1} 
              rx={width * 0.07} 
              ry={height * 0.04} 
              fill="#90CAF9" 
              className="animate-pulse"
            />
          </g>
        );
      }
      
      // Mountain decoration
      if (decoration.type === "mountain") {
        const size = decoration.size || 80;
        return (
          <g key={`decoration-${index}`}>
            <polygon 
              points={`${decoration.x - size},${decoration.y} ${decoration.x},${decoration.y - size} ${decoration.x + size},${decoration.y}`} 
              fill="#795548" 
            />
            <polygon 
              points={`${decoration.x - size * 0.7},${decoration.y} ${decoration.x},${decoration.y - size * 0.9} ${decoration.x + size * 0.7},${decoration.y}`} 
              fill="#8D6E63" 
            />
            <polygon 
              points={`${decoration.x - size * 0.3},${decoration.y - size * 0.5} ${decoration.x},${decoration.y - size * 0.9} ${decoration.x + size * 0.3},${decoration.y - size * 0.5}`} 
              fill="#FAFAFA" 
            />
          </g>
        );
      }
      
      return null;
    });
  };
  
  // Render magical items (collectibles and points of interest)
  const renderMagicalItems = () => {
    return (
      <>
        {/* Magical wand collectible */}
        <g className="magical-item float" transform="translate(300, 150)">
          <circle cx="0" cy="0" r="20" fill="#6C63FF" fillOpacity="0.3" />
          <circle cx="0" cy="0" r="10" fill="#6C63FF" fillOpacity="0.6" />
          <path d="M-5,-15 L5,-15 L8,-5 L0,10 L-8,-5 Z" fill="#6C63FF" />
          
          {/* Sparkle effects */}
          <g className="sparkles animate-pulse">
            <circle cx="12" cy="-8" r="2" fill="white" />
            <circle cx="-12" cy="8" r="1.5" fill="white" />
            <circle cx="8" cy="12" r="1" fill="white" />
          </g>
          
          {/* Item label */}
          <text 
            x="0" 
            y="25" 
            textAnchor="middle" 
            fill="white" 
            fontWeight="bold" 
            fontSize="10"
            stroke="#000"
            strokeWidth="0.8"
            paintOrder="stroke"
          >Magic Wand</text>
        </g>
        
        {/* Magic potion collectible */}
        <g className="magical-item float" transform="translate(450, 400)">
          <circle cx="0" cy="0" r="18" fill="#FF9800" fillOpacity="0.3" />
          <circle cx="0" cy="0" r="12" fill="#FF9800" fillOpacity="0.2" />
          
          {/* Potion bottle */}
          <path d="M-6,-10 L6,-10 L6,-5 L10,0 L10,8 C10,12 5,15 0,15 C-5,15 -10,12 -10,8 L-10,0 L-6,-5 Z" fill="#E65100" fillOpacity="0.8" />
          <path d="M-5,-5 L5,-5 L9,0 L9,8 C9,11 5,14 0,14 C-5,14 -9,11 -9,8 L-9,0 Z" fill="#FF9800" fillOpacity="0.9" />
          <rect x="-6" y="-14" width="12" height="4" rx="1" fill="#5D4037" />
          
          {/* Bubbles effect */}
          <circle cx="-3" cy="5" r="1.5" fill="#FFE0B2" className="animate-bounce" />
          <circle cx="2" cy="8" r="1" fill="#FFE0B2" className="animate-bounce" />
          
          {/* Item label */}
          <text 
            x="0" 
            y="30" 
            textAnchor="middle" 
            fill="white" 
            fontWeight="bold" 
            fontSize="10"
            stroke="#000"
            strokeWidth="0.8"
            paintOrder="stroke"
          >Potion</text>
        </g>
        
        {/* Mystical book collectible */}
        <g className="magical-item float" transform="translate(650, 250)">
          <circle cx="0" cy="0" r="20" fill="#9C27B0" fillOpacity="0.3" />
          <circle cx="0" cy="0" r="12" fill="#9C27B0" fillOpacity="0.2" />
          
          {/* Book shape */}
          <rect x="-10" y="-12" width="20" height="24" rx="2" fill="#4A148C" />
          <rect x="-9" y="-11" width="18" height="22" rx="1" fill="#7B1FA2" />
          <line x1="-9" y1="-5" x2="9" y2="-5" stroke="#CE93D8" strokeWidth="1" />
          <line x1="-9" y1="0" x2="9" y2="0" stroke="#CE93D8" strokeWidth="1" />
          <line x1="-9" y1="5" x2="9" y2="5" stroke="#CE93D8" strokeWidth="1" />
          
          {/* Sparkle effects */}
          <g className="sparkles animate-pulse">
            <circle cx="12" cy="-8" r="1.5" fill="white" />
            <circle cx="-12" cy="8" r="1" fill="white" />
          </g>
          
          {/* Item label */}
          <text 
            x="0" 
            y="25" 
            textAnchor="middle" 
            fill="white" 
            fontWeight="bold" 
            fontSize="10"
            stroke="#000"
            strokeWidth="0.8"
            paintOrder="stroke"
          >Spell Book</text>
        </g>
      </>
    );
  };
  
  // Add a map filter effect for a more stylized look
  const mapFilters = () => {
    return (
      <defs>
        {/* Soft shadow effect for elevated objects */}
        <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#00000044" />
        </filter>
        
        {/* Glow effect for important elements */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Paper texture */}
        <pattern id="paper-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
          <rect width="100" height="100" fill="#F5F5F5" />
          <rect width="100" height="100" fill="#00000005" />
        </pattern>
      </defs>
    );
  };
  
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      {/* Map Filters and Definitions */}
      {mapFilters()}
      
      {/* Background pattern */}
      <rect width="800" height="600" fill="url(#paper-pattern)" />
      
      {/* Paths between nodes */}
      {renderPaths()}
      
      {/* Map Decorations */}
      {renderDecorations()}
      
      {/* Interactive Nodes */}
      {config.nodes.map(renderNode)}
      
      {/* Magical Items */}
      {renderMagicalItems()}
      
      {/* Compass Rose */}
      <g transform="translate(730, 560)" className="compass-rose">
        <circle cx="0" cy="0" r="25" fill="white" stroke="#795548" strokeWidth="2" />
        <path d="M0,-20 L5,-5 L0,0 L-5,-5 Z" fill="#F44336" />
        <path d="M0,20 L5,5 L0,0 L-5,5 Z" fill="#795548" />
        <path d="M-20,0 L-5,5 L0,0 L-5,-5 Z" fill="#795548" />
        <path d="M20,0 L5,5 L0,0 L5,-5 Z" fill="#795548" />
        <text x="0" y="-8" textAnchor="middle" fill="#F44336" fontSize="10" fontWeight="bold">N</text>
      </g>
    </svg>
  );
}
