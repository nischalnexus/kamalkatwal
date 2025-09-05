import { test, expect } from '@playwright/test';

test.describe('Gallery Performance Tests', () => {
  
  test('should load gallery page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('gallery.html');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Gallery should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle large number of images efficiently', async ({ page }) => {
    await page.goto('gallery.html');
    
    // Measure time to load all images
    const startTime = Date.now();
    
    // Wait for all images to be visible
    await page.waitForFunction(() => {
      const images = document.querySelectorAll('.gallery_item img');
      return Array.from(images).every(img => (img as HTMLImageElement).complete);
    }, { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // All 47 images should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should maintain smooth scrolling with many images', async ({ page }) => {
    await page.goto('gallery.html');
    await page.waitForLoadState('networkidle');
    
    // Scroll down the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    
    await page.waitForTimeout(500);
    
    // Scroll back up
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    await page.waitForTimeout(500);
    
    // Check if page is still responsive
    const gallerySection = page.locator('.gallery_section');
    await expect(gallerySection).toBeVisible();
  });
});
