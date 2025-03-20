// Export all services for easy importing
// Export all service modules with explicit naming to prevent conflicts
import { userService } from './apiService';
import { parentService } from './parentService';
import { learningService } from './learningService';
import { gameService } from './gameService';
import { inventoryService } from './inventoryService';
import { miniGameService, analyticsService, aiService, childProfileService, mapService, lessonService } from './apiService';

// Rename the conflicting service for clarity
import { inventoryService as apiInventoryService } from './apiService';

// Export all services
export {
  // Main services
  userService,
  parentService,
  learningService,
  gameService,
  inventoryService,
  
  // Additional services from apiService
  miniGameService,
  analyticsService,
  aiService,
  childProfileService,
  mapService,
  lessonService
};