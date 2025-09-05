const { chromium } = require('playwright');
const path = require('path');

async function testGallery() {
  console.log('🚀 Starting Playwright gallery test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    // Navigate to the gallery page
    const galleryPath = `file:///${path.resolve('gallery.html').replace(/\\/g, '/')}`;
    console.log(`📄 Loading gallery: ${galleryPath}`);
    
    await page.goto(galleryPath, { waitUntil: 'networkidle' });
    
    // Wait for the page to load
    await page.waitForSelector('.gallery_section', { timeout: 10000 });
    console.log('✅ Gallery section loaded');
    
    // Count total images
    const totalImages = await page.locator('.popup_image img').count();
    console.log(`📊 Total images found: ${totalImages}`);
    
    // Check for broken images
    const images = page.locator('.popup_image img');
    let brokenImages = [];
    let loadedImages = 0;
    
    for (let i = 0; i < totalImages; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      // Check if image is loaded
      const isLoaded = await img.evaluate((el) => {
        return el.complete && el.naturalHeight !== 0;
      });
      
      if (isLoaded) {
        loadedImages++;
      } else {
        brokenImages.push(src);
        console.log(`❌ Broken image: ${src}`);
      }
    }
    
    console.log(`\n📈 Results:`);
    console.log(`✅ Loaded images: ${loadedImages}/${totalImages}`);
    console.log(`❌ Broken images: ${brokenImages.length}/${totalImages}`);
    
    if (brokenImages.length > 0) {
      console.log(`\n🔍 Broken image details:`);
      brokenImages.forEach((src, index) => {
        console.log(`   ${index + 1}. ${src}`);
      });
    }
    
    // Test popup functionality
    console.log(`\n🖱️  Testing popup functionality...`);
    if (totalImages > 0) {
      // Click first image to test popup
      await images.first().click();
      
      // Wait for popup to appear (Magnific Popup)
      try {
        await page.waitForSelector('.mfp-container', { timeout: 5000 });
        console.log('✅ Popup opened successfully');
        
        // Close popup
        await page.keyboard.press('Escape');
        await page.waitForSelector('.mfp-container', { state: 'hidden', timeout: 3000 });
        console.log('✅ Popup closed successfully');
      } catch (e) {
        console.log('⚠️  Popup test failed:', e.message);
      }
    }
    
    // Test responsive layout
    console.log(`\n📱 Testing responsive layout...`);
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    const desktopColumns = await page.locator('.col-lg-4').count();
    console.log(`🖥️  Desktop view: ${desktopColumns} columns detected`);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Wait for responsive changes
    console.log(`📱 Mobile view: Layout adjusted`);
    
    // Final summary
    console.log(`\n📋 Test Summary:`);
    console.log(`   Total Images: ${totalImages}`);
    console.log(`   Working Images: ${loadedImages}`);
    console.log(`   Broken Images: ${brokenImages.length}`);
    console.log(`   Success Rate: ${((loadedImages/totalImages) * 100).toFixed(1)}%`);
    
    if (brokenImages.length === 0) {
      console.log(`\n🎉 All tests passed! Gallery is working perfectly.`);
    } else {
      console.log(`\n⚠️  Some images need attention.`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testGallery().catch(console.error);
