import React, { useEffect, useState } from "react";
import { MapZone, MapNode, MapPath, MapDecoration } from "@/lib/types";
import { 
  BookOpen, 
  Star, 
  Trophy, 
  Clock, 
  Gamepad2, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Lock,
  Loader2 
} from "lucide-react";
import { isImagePreloaded } from "@/lib/imagePreloader";

interface MapSvgProps {
  zone: MapZone;
  onNodeSelect?: (node: MapNode) => void;
}

export function MapSvg({ zone, onNodeSelect }: MapSvgProps) {
  // Track loading state for background image
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  // Create audio element for node click sound - lazy load only when needed
  const getClickSound = () => {
    if (typeof Audio !== 'undefined') {
      const sound = new Audio('/sounds/select.mp3');
      return sound;
    }
    return null;
  };

  useEffect(() => {
    console.log('[MAP-RENDER] MapSvg received config with nodes:', 
      zone.config.nodes.map(node => ({ id: node.id, type: node.type, status: node.status }))
    );
    
    // Check if the background is already preloaded
    if (zone.background) {
      if (isImagePreloaded(zone.background)) {
        console.log(`[MAP-RENDER] Background image already preloaded: ${zone.background}`);
        setImageLoaded(true);
      } else {
        // Image isn't preloaded yet, load it now
        console.log(`[MAP-RENDER] Background image not preloaded, loading now: ${zone.background}`);
        const img = new Image();
        img.onload = () => {
          console.log(`[MAP-RENDER] Background image loaded: ${zone.background}`);
          setImageLoaded(true);
        };
        img.onerror = () => {
          console.warn(`[MAP-RENDER] Failed to load background: ${zone.background}`);
          // Show the map anyway to avoid blocking UI
          setImageLoaded(true);
        };
        img.src = zone.background;
      }
    } else {
      setImageLoaded(true);
    }
  }, [zone]);

  // Map node rendering based on status and type
  const renderNode = (node: MapNode) => {
    console.log(`[MAP-RENDER] Rendering node:`, { id: node.id, type: node.type, status: node.status });
    
    let content;
    let fill;
    let fillInner;
    let strokeColor = "#3E2723";
    let className = "map-node";
    let nodeIcon;
    
    // Add floating animation to current node
    if (node.status === "current") {
      className += " float";
      console.log(`[MAP-RENDER] Node ${node.id} marked as CURRENT and will float`);
    } else if (node.status === "completed") {
      console.log(`[MAP-RENDER] Node ${node.id} marked as COMPLETED`);
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
      // Play sound when node is clicked (if it's interactive)
      if (node.status === "completed" || node.status === "current" || node.status === "available") {
        // Lazy load the sound only when needed
        const clickSound = getClickSound();
        if (clickSound) {
          // Reset the audio to the beginning if it's already playing
          clickSound.currentTime = 0;
          clickSound.play().catch(err => {
            console.warn('Audio playback was prevented:', err);
          });
        }
      }
      
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
        
        {/* Main node circle with wood-like appearance */}
        <circle 
          cx="0" 
          cy="0" 
          r={radius} 
          fill={fill} 
          stroke={strokeColor}
          strokeWidth="2"
          filter={node.status === "current" ? `url(#glow-${node.id})` : undefined}
        />
        <circle 
          cx="0" 
          cy="0" 
          r={innerRadius} 
          fill={fillInner}
        />
        
        {/* Add wooden texture */}
        <ellipse 
          cx="-5" 
          cy="-5" 
          rx={innerRadius * 0.6} 
          ry={innerRadius * 0.3} 
          fill="rgba(255, 255, 255, 0.1)" 
          transform="rotate(-30)"
        />
        
        {/* Node icon (added for better visual identification) */}
        {nodeIcon && (
          <foreignObject width="24" height="24" x="-12" y="-12">
            {nodeIcon}
          </foreignObject>
        )}
        
        {/* Node status indicator */}
        {content}
        
        {/* Node text label with better contrast for outdoor background */}
        <text 
          x="0" 
          y={radius + 15} 
          textAnchor="middle" 
          fill="#431D0C" 
          fontSize="13"
          fontWeight="bold"
          stroke="#F8F0E3"
          strokeWidth="4"
          paintOrder="stroke"
          fontFamily="serif"
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
    return zone.config.paths.map((path, index) => {
      const fromNode = zone.config.nodes.find(node => node.id === path.from);
      const toNode = zone.config.nodes.find(node => node.id === path.to);
      
      if (!fromNode || !toNode) return null;
      
      // Determine path style based on nodes' status
      let pathStyle = "#E2C38F"; // Default sand/trail color
      let pathWidth = 12;
      let pathClass = "";
      
      // If path connects to current node, make it more highlighted
      if (fromNode.status === "current" || toNode.status === "current") {
        pathStyle = "#FFB74D"; // Brighter path
        pathWidth = 10;
        pathClass = "highlighted-path";
      }
      
      // If path connects to locked node, make it look locked/incomplete
      if (fromNode.status === "locked" || toNode.status === "locked") {
        pathStyle = "#BDBDBD"; // Gray path
        pathClass = "locked-path";
        pathWidth = 8;
      }
      
      // If path connects completed nodes, make it look successfully traveled
      if (fromNode.status === "completed" && toNode.status === "completed") {
        pathStyle = "#81C784"; // Green path
        pathClass = "completed-path";
      }
      
      // Create a more zig-zag path using multiple control points
      // For a zig-zag effect, we'll create a path with 3 points
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      
      // Create a more zig-zag appearance with less winding
      const controlPoint1X = fromNode.x + dx * 0.33;
      const controlPoint1Y = fromNode.y + dy * 0.33 + (dx > 0 ? -20 : 20);
      
      const controlPoint2X = fromNode.x + dx * 0.66;
      const controlPoint2Y = fromNode.y + dy * 0.66 + (dx > 0 ? 20 : -20);
      
      const pathD = `M${fromNode.x},${fromNode.y} 
                    Q${controlPoint1X},${controlPoint1Y} 
                    ${fromNode.x + dx * 0.5},${fromNode.y + dy * 0.5} 
                    Q${controlPoint2X},${controlPoint2Y} 
                    ${toNode.x},${toNode.y}`;
      
      return (
        <g key={`path-${index}`}>
          {/* Path shadow */}
          <path 
            d={pathD}
            stroke="#00000033" 
            strokeWidth={pathWidth + 4} 
            fill="none" 
            strokeLinecap="round"
            strokeOpacity="0.3"
          />
          
          {/* Main path */}
          <path 
            className={pathClass}
            d={pathD}
            stroke={pathStyle} 
            strokeWidth={pathWidth} 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Footprint effects along completed paths */}
          {(fromNode.status === "completed" && toNode.status === "completed") && (
            <g className="path-decoration">
              <circle cx={(fromNode.x + toNode.x) / 2} cy={(fromNode.y + toNode.y) / 2} r="3" fill="#5D4037" />
              <circle cx={fromNode.x + dx * 0.25} cy={fromNode.y + dy * 0.25} r="3" fill="#5D4037" />
              <circle cx={fromNode.x + dx * 0.75} cy={fromNode.y + dy * 0.75} r="3" fill="#5D4037" />
            </g>
          )}
        </g>
      );
    });
  };
  
  // Render map decorations
  const renderDecorations = () => {
    // We won't add the standard decorations since we're using a background image
    return null;
  };
  
  // Render magical items (collectibles and points of interest)
  const renderMagicalItems = () => {
    // Keep the magical items but adjust their style to match the background
    return (
      <>
        {/* Magical wand collectible */}
        <g className="magical-item float" transform="translate(300, 150)">
          <circle cx="0" cy="0" r="20" fill="#8E4F00" fillOpacity="0.3" />
          <circle cx="0" cy="0" r="10" fill="#8E4F00" fillOpacity="0.6" />
          <path d="M-5,-15 L5,-15 L8,-5 L0,10 L-8,-5 Z" fill="#8E4F00" />
          
          {/* Sparkle effects */}
          <g className="sparkles animate-pulse">
            <circle cx="12" cy="-8" r="2" fill="#FFF4C1" />
            <circle cx="-12" cy="8" r="1.5" fill="#FFF4C1" />
            <circle cx="8" cy="12" r="1" fill="#FFF4C1" />
          </g>
          
          {/* Item label */}
          <text 
            x="0" 
            y="25" 
            textAnchor="middle" 
            fill="#431D0C" 
            fontWeight="bold" 
            fontSize="11"
            stroke="#F8F0E3"
            strokeWidth="3"
            paintOrder="stroke"
            fontFamily="serif"
          >Magic Wand</text>
        </g>
        
        {/* Magic potion collectible */}
        <g className="magical-item float" transform="translate(450, 400)">
          <circle cx="0" cy="0" r="18" fill="#8B4513" fillOpacity="0.3" />
          <circle cx="0" cy="0" r="12" fill="#8B4513" fillOpacity="0.2" />
          
          {/* Potion bottle */}
          <path d="M-6,-10 L6,-10 L6,-5 L10,0 L10,8 C10,12 5,15 0,15 C-5,15 -10,12 -10,8 L-10,0 L-6,-5 Z" fill="#7D3800" fillOpacity="0.8" />
          <path d="M-5,-5 L5,-5 L9,0 L9,8 C9,11 5,14 0,14 C-5,14 -9,11 -9,8 L-9,0 Z" fill="#A0522D" fillOpacity="0.9" />
          <rect x="-6" y="-14" width="12" height="4" rx="1" fill="#5D4037" />
          
          {/* Bubbles effect */}
          <circle cx="-3" cy="5" r="1.5" fill="#FFE0B2" className="animate-bounce" />
          <circle cx="2" cy="8" r="1" fill="#FFE0B2" className="animate-bounce" />
          
          {/* Item label */}
          <text 
            x="0" 
            y="30" 
            textAnchor="middle" 
            fill="#431D0C" 
            fontWeight="bold" 
            fontSize="11"
            stroke="#F8F0E3"
            strokeWidth="3"
            paintOrder="stroke"
            fontFamily="serif"
          >Potion</text>
        </g>
        
        {/* Mystical book collectible */}
        <g className="magical-item float" transform="translate(650, 250)">
          <circle cx="0" cy="0" r="20" fill="#8E4F00" fillOpacity="0.3" />
          <circle cx="0" cy="0" r="12" fill="#8E4F00" fillOpacity="0.2" />
          
          {/* Book shape */}
          <rect x="-10" y="-12" width="20" height="24" rx="2" fill="#5D4037" />
          <rect x="-9" y="-11" width="18" height="22" rx="1" fill="#7D3800" />
          <line x1="-9" y1="-5" x2="9" y2="-5" stroke="#8E4F00" strokeWidth="1" />
          <line x1="-9" y1="0" x2="9" y2="0" stroke="#8E4F00" strokeWidth="1" />
          <line x1="-9" y1="5" x2="9" y2="5" stroke="#8E4F00" strokeWidth="1" />
          
          {/* Sparkle effects */}
          <g className="sparkles animate-pulse">
            <circle cx="12" cy="-8" r="1.5" fill="#FFF4C1" />
            <circle cx="-12" cy="8" r="1" fill="#FFF4C1" />
          </g>
          
          {/* Item label */}
          <text 
            x="0" 
            y="25" 
            textAnchor="middle" 
            fill="#431D0C" 
            fontWeight="bold" 
            fontSize="11"
            stroke="#F8F0E3"
            strokeWidth="3"
            paintOrder="stroke"
            fontFamily="serif"
          >Spell Book</text>
        </g>
      </>
    );
  };
  
  // Simplified fantasy-themed compass
  const renderCustomCompass = () => {
    return (
      <g transform="translate(720, 530)" className="fantasy-compass">
        {/* Ornate outer ring */}
        <circle cx="0" cy="0" r="35" fill="#E8D9B5" stroke="#8E4F00" strokeWidth="2" />
        
        {/* Decorative middle ring */}
        <circle cx="0" cy="0" r="28" fill="none" stroke="#8E4F00" strokeWidth="1" strokeDasharray="3,2" />
        
        {/* Cardinal direction points */}
        <circle cx="0" cy="-28" r="4" fill="#B28B40" stroke="#5D4037" strokeWidth="1" />
        <circle cx="0" cy="28" r="4" fill="#B28B40" stroke="#5D4037" strokeWidth="1" />
        <circle cx="-28" cy="0" r="4" fill="#B28B40" stroke="#5D4037" strokeWidth="1" />
        <circle cx="28" cy="0" r="4" fill="#B28B40" stroke="#5D4037" strokeWidth="1" />
        
        {/* Diagonal points (smaller) */}
        <circle cx="-20" cy="-20" r="2" fill="#8E4F00" />
        <circle cx="20" cy="-20" r="2" fill="#8E4F00" />
        <circle cx="-20" cy="20" r="2" fill="#8E4F00" />
        <circle cx="20" cy="20" r="2" fill="#8E4F00" />
        
        {/* Direction labels placed in golden medallions */}
        <circle cx="0" cy="-18" r="9" fill="#D4AF37" stroke="#8E4F00" strokeWidth="1" />
        <circle cx="0" cy="18" r="9" fill="#D4AF37" stroke="#8E4F00" strokeWidth="1" />
        <circle cx="-18" cy="0" r="9" fill="#D4AF37" stroke="#8E4F00" strokeWidth="1" />
        <circle cx="18" cy="0" r="9" fill="#D4AF37" stroke="#8E4F00" strokeWidth="1" />
        
        <text x="0" y="-15" textAnchor="middle" fill="#431D0C" fontSize="12" fontWeight="bold" fontFamily="serif">N</text>
        <text x="0" y="21" textAnchor="middle" fill="#431D0C" fontSize="12" fontWeight="bold" fontFamily="serif">S</text>
        <text x="-18" y="4" textAnchor="middle" fill="#431D0C" fontSize="12" fontWeight="bold" fontFamily="serif">W</text>
        <text x="18" y="4" textAnchor="middle" fill="#431D0C" fontSize="12" fontWeight="bold" fontFamily="serif">E</text>
        
        {/* Center medallion */}
        <circle cx="0" cy="0" r="12" fill="#B28B40" stroke="#5D4037" strokeWidth="1" />
        <circle cx="0" cy="0" r="8" fill="#D4AF37" stroke="#5D4037" strokeWidth="0.5" />
        
        {/* Connecting lines from center to medallions (behind text) */}
        <line x1="0" y1="-8" x2="0" y2="-9" stroke="#5D4037" strokeWidth="1.5" />
        <line x1="0" y1="8" x2="0" y2="9" stroke="#5D4037" strokeWidth="1.5" />
        <line x1="-8" y1="0" x2="-9" y2="0" stroke="#5D4037" strokeWidth="1.5" />
        <line x1="8" y1="0" x2="9" y2="0" stroke="#5D4037" strokeWidth="1.5" />
        
        {/* Connecting lines from medallions to edge points (behind text) */}
        <line x1="0" y1="-27" x2="0" y2="-28" stroke="#5D4037" strokeWidth="1.5" />
        <line x1="0" y1="27" x2="0" y2="28" stroke="#5D4037" strokeWidth="1.5" />
        <line x1="-27" y1="0" x2="-28" y2="0" stroke="#5D4037" strokeWidth="1.5" />
        <line x1="27" y1="0" x2="28" y2="0" stroke="#5D4037" strokeWidth="1.5" />
        
        {/* Fancy compass needle */}
        <g className="compass-needle">
          <path d="M0,-14 L4,-4 L0,14 L-4,-4 Z" fill="#8E4F00" stroke="#5D4037" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="#E8D9B5" stroke="#5D4037" strokeWidth="0.5" />
        </g>
      </g>
    );
  };
  
  // Add a map filter effect for the right look on the background image
  const mapFilters = () => {
    return (
      <defs>
        {/* Enhanced soft shadow effect for elevated objects */}
        <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#00000055" />
        </filter>
        
        {/* Enhanced glow effect for important elements */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="#FFA726" floodOpacity="0.7" result="glow-color" />
          <feComposite in="glow-color" in2="blur" operator="in" result="colored-blur" />
          <feComposite in="SourceGraphic" in2="colored-blur" operator="over" />
        </filter>
      </defs>
    );
  };

  // Render Pippin character above the current node
  const renderPippinCharacter = () => {
    // Find the current node
    const currentNode = zone.config.nodes.find(node => node.status === "current");
    
    if (!currentNode) {
      console.log('[MAP-RENDER] No current node found for Pippin character');
      return null;
    }
    
    // Position Pippin 60px above the current node
    const pippinX = currentNode.x;
    const pippinY = currentNode.y - 60;
    
    console.log(`[MAP-RENDER] Rendering Pippin at position (${pippinX}, ${pippinY})`);
    
    return (
      <g 
        transform={`translate(${pippinX}, ${pippinY})`} 
        className="pippin-character float"
        pointerEvents="none"
      > 
        {/* Render Pippin the unicorn image */}
        <image 
          href="/images/pippin.svg" 
          x="-110" 
          y="-160" 
          width="240" 
          height="240" 
          className="drop-shadow-lg"
          pointerEvents="none"
        />
      </g>
    );
  };
  
  // Loading state display
  const renderLoadingState = () => {
    return (
      <g className="loading-indicator" transform="translate(400, 300)">
        <circle cx="0" cy="0" r="50" fill="#8B5A2B" fillOpacity="0.8" />
        <foreignObject width="60" height="60" x="-30" y="-30">
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
        </foreignObject>
      </g>
    );
  };
  
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full rounded-lg">
      {/* Map Filters and Definitions */}
      {mapFilters()}
      
      {/* Display loading state when the image isn't loaded yet */}
      {!imageLoaded && renderLoadingState()}
      
      {/* Background image - updated to ensure it's always centered */}
      {zone.background && (
      <image 
        href={zone.background}
        width="800" 
        height="600" 
        x="0"
        y="0"
        preserveAspectRatio="xMidYMid slice"
        style={{ visibility: imageLoaded ? 'visible' : 'hidden' }}
      />)}
      
      {/* Only show map content when images are loaded */}
      {imageLoaded && (
        <>
          {/* Map title */}
          <g transform="translate(400, 50)">
            <rect 
              x="-180" 
              y="-25" 
              width="360" 
              height="50" 
              rx="10" 
              fill="#8B5A2B" 
              fillOpacity="0.8"
              stroke="#431D0C"
              strokeWidth="3"
            />
            <text 
              x="0" 
              y="10" 
              textAnchor="middle" 
              fontFamily="serif" 
              fontSize="28" 
              fill="#F8F0E3" 
              fontWeight="bold"
              filter="url(#drop-shadow)"
            >
              {zone.name}
            </text>
          </g>
          
          {/* Paths between nodes - positioned to fit at bottom of grass area */}
          {renderPaths()}
          
          {/* Interactive Nodes */}
          {zone.config.nodes.map(renderNode)}
          
          {/* Pippin Character - positioned above the current node */}
          {renderPippinCharacter()}
          
          {/* Magical Items */}
          {renderMagicalItems()}
          
          {/* Updated Compass Rose */}
          {renderCustomCompass()}
        </>
      )}
    </svg>
  );
}
