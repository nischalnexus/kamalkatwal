import { test, expect } from '@playwright/test';

test.describe('Gallery Page Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the gallery page
    await page.goto('gallery.html');
  });

  test('should load gallery page successfully', async ({ page }) => {
    // Check if page title is correct
    await expect(page).toHaveTitle(/Gallery.*Talking Minds/);
    
    // Check if main gallery section is visible
    await expect(page.locator('.gallery_section')).toBeVisible();
  });

  test('should display all 47 gallery images', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Count all gallery items
    const galleryItems = page.locator('.gallery_item');
    await expect(galleryItems).toHaveCount(47);
    
    // Check if all images are visible
    for (let i = 0; i < 47; i++) {
      await expect(galleryItems.nth(i)).toBeVisible();
    }
  });

  test('should have proper image sources from Kamal image folder', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check first few images have correct source paths
    const firstImage = page.locator('.gallery_item img').first();
    await expect(firstImage).toHaveAttribute('src', /assets\/kamal image\//);
    
    // Check that all images have Kamal Katwal alt text
    const allImages = page.locator('.gallery_item img');
    const count = await allImages.count();
    
    for (let i = 0; i < count; i++) {
      await expect(allImages.nth(i)).toHaveAttribute('alt', 'Kamal Katwal - Professional Photo');
    }
  });

  test('should have responsive grid layout', async ({ page }) => {
    // Test desktop layout (3 columns)
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');
    
    const galleryItems = page.locator('.gallery_item');
    await expect(galleryItems.first()).toBeVisible();
    
    // Test tablet layout (2 columns)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Wait for CSS to apply
    await expect(galleryItems.first()).toBeVisible();
    
    // Test mobile layout (2 columns)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(galleryItems.first()).toBeVisible();
  });

  test('should have hover effects on gallery items', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const firstGalleryItem = page.locator('.gallery_item').first();
    
    // Check initial state
    await expect(firstGalleryItem).toBeVisible();
    
    // Hover over the item
    await firstGalleryItem.hover();
    
    // Wait for hover transition to complete
    await page.waitForTimeout(300);
    
    // Check if hover effect is applied (original template uses scale transform)
    const imageTransform = await firstGalleryItem.locator('img').evaluate(el => getComputedStyle(el).transform);
    expect(imageTransform).not.toBe('none');
    expect(imageTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  });

  test('should open image popup when clicked', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const firstGalleryItem = page.locator('.gallery_item').first();
    
    // Click on the first gallery item
    await firstGalleryItem.click();
    
    // Wait for popup to appear
    await page.waitForTimeout(500);
    
    // Check if magnific popup or similar popup is visible
    // Note: This depends on the popup library being used
    const popup = page.locator('.mfp-wrap, .popup, .modal').first();
    await expect(popup).toBeVisible({ timeout: 5000 });
  });

  test('should have proper navigation breadcrumbs', async ({ page }) => {
    // Check breadcrumb navigation
    const breadcrumb = page.locator('.breadcrumb_nav');
    await expect(breadcrumb).toBeVisible();
    
    // Check breadcrumb items
    await expect(page.locator('.breadcrumb_nav li').first()).toContainText('Home');
    await expect(page.locator('.breadcrumb_nav li').last()).toContainText('Gallery');
  });

  test('should have working navigation menu', async ({ page }) => {
    // Check if main menu is present
    const mainMenu = page.locator('.main_menu_list');
    await expect(mainMenu).toBeVisible();
    
    // Check if Home link works
    const homeLink = page.locator('a[href="index.html"]').first();
    await expect(homeLink).toBeVisible();
    
    // Check if About link is present
    const aboutLink = page.locator('a[href="about.html"]').first();
    await expect(aboutLink).toBeVisible();
  });

  test('should have proper page structure', async ({ page }) => {
    // Check header
    await expect(page.locator('.site_header')).toBeVisible();
    
    // Check page banner
    await expect(page.locator('.page_banner')).toBeVisible();
    await expect(page.locator('.page_title')).toContainText('Gallery');
    
    // Check gallery section
    await expect(page.locator('.gallery_section')).toBeVisible();
    
    // Check footer
    await expect(page.locator('.site_footer')).toBeVisible();
  });

  test('should load all images without errors', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Get all image elements
    const images = page.locator('.gallery_item img');
    const imageCount = await images.count();
    
    // Check each image loads successfully
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      
      // Wait for image to be visible
      await expect(image).toBeVisible();
      
      // Check if image has loaded (naturalWidth > 0 indicates successful load)
      const isLoaded = await image.evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalWidth > 0;
      });
      
      expect(isLoaded).toBe(true);
    }
  });

  test('should have accessibility features', async ({ page }) => {
    // Check if images have proper alt text
    const images = page.locator('.gallery_item img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(5, imageCount); i++) { // Check first 5 images
      await expect(images.nth(i)).toHaveAttribute('alt');
    }
    
    // Check if page has proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if links are keyboard accessible
    const firstGalleryLink = page.locator('.gallery_item').first();
    await firstGalleryLink.focus();
    await expect(firstGalleryLink).toBeFocused();
  });

  test('should handle mobile touch interactions', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('gallery.html');
    await page.waitForLoadState('networkidle');
    
    const firstGalleryItem = page.locator('.gallery_item').first();
    
    // Test touch/click interaction
    await firstGalleryItem.click({ force: true });
    await page.waitForTimeout(100);
    
    // On mobile, item should still be visible and functional
    await expect(firstGalleryItem).toBeVisible();
  });
});
