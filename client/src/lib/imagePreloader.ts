/**
 * Image Preloader Utility
 * 
 * This utility preloads images at the application level to improve loading times
 * for components like MapSvg that use these assets.
 */

// List of background images to preload
const backgroundImages = [
  '/images/mapBackground.png',
  '/images/mapBackgroundCastle.png', 
  '/images/mapBackgroundSea.png'
];

// Character and UI images
const uiImages = [
  '/images/pippin.svg'
];

// All images that need to be preloaded
const imagesToPreload = [...backgroundImages, ...uiImages];

// Track which images have already been preloaded to avoid duplicate loading
const preloadedImages = new Set<string>();

/**
 * Preloads a single image by creating a new Image object and setting its src
 * @param src The image source URL
 * @returns A promise that resolves when the image is loaded or rejects on error
 */
const preloadImage = (src: string): Promise<void> => {
  // Skip if already preloaded
  if (preloadedImages.has(src)) {
    console.log(`[Preloader] Image already preloaded: ${src}`);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`[Preloader] Successfully loaded: ${src}`);
      preloadedImages.add(src);
      resolve();
    };
    
    img.onerror = () => {
      console.warn(`[Preloader] Failed to load: ${src}`);
      // Resolve anyway to prevent blocking other images
      resolve();
    };
    
    img.src = src;
  });
};

/**
 * Preloads all application images in the background (non-blocking)
 * This doesn't wait for images to complete and doesn't block the UI
 */
export const preloadAllImagesInBackground = (): void => {
  console.log('[Preloader] Starting to preload all images in background...');
  
  // Start preloading all images without awaiting their completion
  imagesToPreload.forEach(src => {
    preloadImage(src).catch(error => {
      console.error(`[Preloader] Error preloading image ${src}:`, error);
    });
  });
};

/**
 * Preloads all application images and waits for them to complete
 * @returns A promise that resolves when all images are loaded
 */
export const preloadAllImages = async (): Promise<void> => {
  console.log('[Preloader] Starting to preload all images...');
  
  try {
    await Promise.all(imagesToPreload.map(preloadImage));
    console.log('[Preloader] All images preloaded successfully');
  } catch (error) {
    console.error('[Preloader] Error preloading images:', error);
  }
};

/**
 * Checks if a specific image has already been preloaded
 * @param src The image source URL to check
 * @returns True if the image has been preloaded, false otherwise
 */
export const isImagePreloaded = (src: string): boolean => {
  return preloadedImages.has(src);
};

/**
 * Preloads a specific set of images (useful for loading additional images on demand)
 * @param srcs Array of image source URLs to preload
 * @returns A promise that resolves when all specified images are loaded
 */
export const preloadImages = async (srcs: string[]): Promise<void> => {
  // Filter out images that have already been preloaded
  const imagesToLoad = srcs.filter(src => !preloadedImages.has(src));
  
  if (imagesToLoad.length === 0) {
    console.log('[Preloader] All requested images already preloaded');
    return;
  }
  
  console.log(`[Preloader] Preloading ${imagesToLoad.length} custom images...`);
  
  try {
    await Promise.all(imagesToLoad.map(preloadImage));
    console.log('[Preloader] Custom images preloaded successfully');
  } catch (error) {
    console.error('[Preloader] Error preloading custom images:', error);
  }
}; 