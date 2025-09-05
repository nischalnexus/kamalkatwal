const { chromium } = require('playwright');
const path = require('path');

async function testPopupFunctionality() {
  console.log('🔍 Testing popup functionality specifically...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to gallery
    const galleryPath = `file:///${path.resolve('gallery.html').replace(/\\/g, '/')}`;
    await page.goto(galleryPath, { waitUntil: 'domcontentloaded' });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded');
    
    // Check if jQuery and Magnific Popup are loaded
    const jqueryLoaded = await page.evaluate(() => typeof window.$ !== 'undefined');
    console.log(`jQuery loaded: ${jqueryLoaded ? '✅' : '❌'}`);
    
    const magnificLoaded = await page.evaluate(() => {
      return typeof window.$ !== 'undefined' && typeof window.$.magnificPopup !== 'undefined';
    });
    console.log(`Magnific Popup loaded: ${magnificLoaded ? '✅' : '❌'}`);
    
    // Check if popup is initialized
    const popupInitialized = await page.evaluate(() => {
      if (typeof window.$ === 'undefined') return false;
      const elements = window.$('.popup_image');
      return elements.length > 0 && elements.data('magnificPopup') !== undefined;
    });
    console.log(`Popup initialized: ${popupInitialized ? '✅' : '❌'}`);
    
    // Try to click an image
    const firstImage = page.locator('.popup_image').first();
    await firstImage.scrollIntoViewIfNeeded();
    
    console.log('🖱️  Clicking first image...');
    await firstImage.click();
    
    // Wait a bit and check for popup
    await page.waitForTimeout(2000);
    
    // Check multiple possible popup selectors
    const popupSelectors = [
      '.mfp-container',
      '.mfp-wrap',
      '.magnificpopup',
      '[class*="popup"]',
      '[class*="magnific"]'
    ];
    
    let popupFound = false;
    for (const selector of popupSelectors) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible();
        if (isVisible) {
          console.log(`✅ Popup found with selector: ${selector}`);
          popupFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!popupFound) {
      console.log('⚠️  No popup detected with standard selectors');
      
      // Check what happened when we clicked
      const bodyClass = await page.evaluate(() => document.body.className);
      console.log(`Body classes after click: ${bodyClass}`);
      
      // Check for any elements that might be the popup
      const suspiciousElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[style*="position: fixed"], [style*="z-index"]');
        return Array.from(elements).map(el => ({
          tag: el.tagName,
          class: el.className,
          style: el.style.cssText,
          visible: el.offsetWidth > 0 && el.offsetHeight > 0
        }));
      });
      
      console.log('🔍 Suspicious elements (might be popup):');
      suspiciousElements.forEach((el, i) => {
        console.log(`   ${i + 1}. ${el.tag} - ${el.class} - visible: ${el.visible}`);
      });
    }
    
    // Take a screenshot for manual inspection
    await page.screenshot({ path: 'popup-test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as popup-test-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Keep browser open for 5 seconds to manually inspect
    console.log('\n⏱️  Keeping browser open for 5 seconds for manual inspection...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testPopupFunctionality().catch(console.error);
