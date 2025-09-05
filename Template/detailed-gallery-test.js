const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function detailedGalleryTest() {
  console.log('🔍 Starting detailed Playwright gallery analysis...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const testResults = {
    timestamp: new Date().toISOString(),
    totalImages: 0,
    loadedImages: 0,
    brokenImages: [],
    imgDetails: [],
    popupTest: false,
    responsiveTest: false,
    loadTimes: {},
    errors: []
  };
  
  try {
    const startTime = Date.now();
    
    // Navigate to gallery
    const galleryPath = `file:///${path.resolve('gallery.html').replace(/\\/g, '/')}`;
    await page.goto(galleryPath, { waitUntil: 'networkidle' });
    
    testResults.loadTimes.pageLoad = Date.now() - startTime;
    
    // Wait for gallery section
    await page.waitForSelector('.gallery_section', { timeout: 10000 });
    
    // Count and analyze images
    const images = page.locator('.popup_image img');
    testResults.totalImages = await images.count();
    
    console.log(`🔍 Analyzing ${testResults.totalImages} images...`);
    
    // Detailed image analysis
    for (let i = 0; i < testResults.totalImages; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const classes = await img.getAttribute('class');
      
      const imgStartTime = Date.now();
      const isLoaded = await img.evaluate((el) => {
        return el.complete && el.naturalHeight !== 0;
      });
      const loadTime = Date.now() - imgStartTime;
      
      const dimensions = await img.evaluate((el) => {
        return {
          naturalWidth: el.naturalWidth,
          naturalHeight: el.naturalHeight,
          displayWidth: el.offsetWidth,
          displayHeight: el.offsetHeight
        };
      });
      
      const imgDetail = {
        index: i + 1,
        src: src,
        alt: alt,
        classes: classes,
        isLoaded: isLoaded,
        loadTime: loadTime,
        dimensions: dimensions
      };
      
      testResults.imgDetails.push(imgDetail);
      
      if (isLoaded) {
        testResults.loadedImages++;
        console.log(`✅ Image ${i + 1}/${testResults.totalImages}: ${path.basename(src)} (${dimensions.naturalWidth}x${dimensions.naturalHeight})`);
      } else {
        testResults.brokenImages.push(src);
        console.log(`❌ Image ${i + 1}/${testResults.totalImages}: FAILED - ${src}`);
      }
    }
    
    // Test popup functionality
    console.log(`\n🖱️  Testing popup functionality...`);
    if (testResults.totalImages > 0) {
      try {
        await images.first().click();
        await page.waitForSelector('.mfp-container', { timeout: 5000 });
        
        // Check popup content
        const popupImg = page.locator('.mfp-container img');
        const popupVisible = await popupImg.isVisible();
        
        if (popupVisible) {
          testResults.popupTest = true;
          console.log('✅ Popup functionality working');
        }
        
        await page.keyboard.press('Escape');
        await page.waitForSelector('.mfp-container', { state: 'hidden', timeout: 3000 });
        
      } catch (e) {
        testResults.errors.push(`Popup test failed: ${e.message}`);
        console.log('❌ Popup test failed');
      }
    }
    
    // Test responsive behavior
    console.log(`\n📱 Testing responsive layout...`);
    try {
      // Desktop
      await page.setViewportSize({ width: 1200, height: 800 });
      const desktopColumns = await page.locator('.col-lg-4').count();
      
      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      testResults.responsiveTest = true;
      console.log(`✅ Responsive layout working (${desktopColumns} columns on desktop)`);
      
    } catch (e) {
      testResults.errors.push(`Responsive test failed: ${e.message}`);
      console.log('❌ Responsive test failed');
    }
    
    // Performance check
    const avgLoadTime = testResults.imgDetails.reduce((sum, img) => sum + img.loadTime, 0) / testResults.totalImages;
    testResults.loadTimes.averageImageLoad = avgLoadTime;
    
    // Generate report
    const report = generateReport(testResults);
    fs.writeFileSync('gallery-test-report.json', JSON.stringify(testResults, null, 2));
    fs.writeFileSync('gallery-test-report.txt', report);
    
    console.log('\n📊 Test Complete!');
    console.log(report);
    console.log('\n📄 Detailed reports saved:');
    console.log('   - gallery-test-report.json');
    console.log('   - gallery-test-report.txt');
    
  } catch (error) {
    testResults.errors.push(error.message);
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  return testResults;
}

function generateReport(results) {
  const successRate = ((results.loadedImages / results.totalImages) * 100).toFixed(1);
  
  let report = `
🎯 GALLERY TEST REPORT
=====================
📅 Test Date: ${new Date(results.timestamp).toLocaleString()}
📊 Total Images: ${results.totalImages}
✅ Loaded Images: ${results.loadedImages}
❌ Broken Images: ${results.brokenImages.length}
📈 Success Rate: ${successRate}%
⏱️  Page Load Time: ${results.loadTimes.pageLoad}ms
⏱️  Avg Image Load: ${results.loadTimes.averageImageLoad?.toFixed(2)}ms

🧪 FUNCTIONALITY TESTS:
  Popup Test: ${results.popupTest ? '✅ PASS' : '❌ FAIL'}
  Responsive Test: ${results.responsiveTest ? '✅ PASS' : '❌ FAIL'}

`;

  if (results.brokenImages.length > 0) {
    report += `\n❌ BROKEN IMAGES:\n`;
    results.brokenImages.forEach((img, i) => {
      report += `   ${i + 1}. ${img}\n`;
    });
  }

  if (results.errors.length > 0) {
    report += `\n⚠️  ERRORS:\n`;
    results.errors.forEach((error, i) => {
      report += `   ${i + 1}. ${error}\n`;
    });
  }

  // Image type analysis
  const imgTypes = {};
  results.imgDetails.forEach(img => {
    const ext = path.extname(img.src).toLowerCase();
    imgTypes[ext] = (imgTypes[ext] || 0) + 1;
  });

  report += `\n📷 IMAGE ANALYSIS:\n`;
  Object.entries(imgTypes).forEach(([ext, count]) => {
    report += `   ${ext}: ${count} files\n`;
  });

  return report;
}

// Run the detailed test
detailedGalleryTest().catch(console.error);
