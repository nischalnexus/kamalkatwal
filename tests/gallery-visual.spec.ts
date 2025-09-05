import { test, expect } from '@playwright/test';

test.describe('Gallery Visual Tests', () => {
  
  test('should have consistent visual layout across browsers', async ({ page }) => {
    await page.goto('gallery.html');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('gallery-full-page.png', {
      fullPage: true,
      threshold: 0.3
    });
  });

  test('should display gallery grid correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('gallery.html');
    await page.waitForLoadState('networkidle');
    
    // Screenshot of the gallery section
    await expect(page.locator('.gallery_section')).toHaveScreenshot('gallery-desktop.png', {
      threshold: 0.3
    });
  });

  test('should display gallery grid correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('gallery.html');
    await page.waitForLoadState('networkidle');
    
    // Screenshot of the gallery section on tablet
    await expect(page.locator('.gallery_section')).toHaveScreenshot('gallery-tablet.png', {
      threshold: 0.3
    });
  });

  test('should display gallery grid correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('gallery.html');
    await page.waitForLoadState('networkidle');
    
    // Screenshot of the gallery section on mobile
    await expect(page.locator('.gallery_section')).toHaveScreenshot('gallery-mobile.png', {
      threshold: 0.3
    });
  });

  test('should show hover effects correctly', async ({ page }) => {
    await page.goto('gallery.html');
    await page.waitForLoadState('networkidle');
    
    const firstGalleryItem = page.locator('.gallery_item').first();
    
    // Hover over first item
    await firstGalleryItem.hover();
    await page.waitForTimeout(500); // Wait for hover animation
    
    // Screenshot with hover effect
    await expect(firstGalleryItem).toHaveScreenshot('gallery-item-hover.png', {
      threshold: 0.3
    });
  });
});
