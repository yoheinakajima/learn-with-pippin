// Export all services for easy importing
// Export all service modules with explicit naming to prevent conflicts
import { userService } from './apiService';
import { parentService } from './parentService';
import { learningService } from './learningService';
import { gameService } from './gameService';
import { inventoryService } from './inventoryService';
import { miniGameService } from './miniGameService';
import { analyticsService, aiService, childProfileService, mapService, lessonService } from './apiService';

// Rename any conflicting services for clarity
import { inventoryService as apiInventoryService } from './apiService';
import { miniGameService as apiMiniGameService } from './apiService';

// Export all services
export {
  // Main services
  userService,
  parentService,
  learningService,
  gameService,
  inventoryService,
  miniGameService,
  
  // Additional services from apiService
  analyticsService,
  aiService,
  childProfileService,
  mapService,
  lessonService
};