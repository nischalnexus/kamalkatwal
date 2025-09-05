# PowerShell Script to Update Hero Background to Kamal Katwal Profile Background
# This script updates page banner backgrounds across all HTML files

Write-Host "Starting hero background update..." -ForegroundColor Green

# Define the Template directory
$templateDir = "Template"

# Get all HTML files in the Template directory
$htmlFiles = Get-ChildItem -Path $templateDir -Filter "*.html" -File

Write-Host "Found $($htmlFiles.Count) HTML files to update" -ForegroundColor Cyan

# The new background style to apply
$newBackgroundStyle = 'style="background-image: url(''assets/images/hero/kamal katwal profile background.png''); background-size: cover; background-position: center; background-repeat: no-repeat; min-height: 400px; position: relative;"'

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Track changes
    $changes = 0
    
    # Update page_banner sections
    if ($content -match '<section class="page_banner decoration_wrapper">') {
        $content = $content -replace '<section class="page_banner decoration_wrapper">', "<section class=""page_banner decoration_wrapper"" $newBackgroundStyle>"
        $changes++
        Write-Host "  Updated page banner background" -ForegroundColor Green
        
        # Add overlay and improve text styling
        if ($content -match '<div class="container">') {
            $content = $content -replace '<div class="container">', '<div class="container" style="position: relative; z-index: 2;">'
            $changes++
        }
        
        # Add dark overlay before closing section tag
        if ($content -match '</section>') {
            $overlayHtml = '          <!-- Dark overlay for better text readability -->' + "`n" +
                          '          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 1;"></div>' + "`n" +
                          '        </section>'
            $content = $content -replace '        </section>', $overlayHtml
            $changes++
        }
    }
    
    # Save the updated content if changes were made
    if ($changes -gt 0) {
        $content | Set-Content -Path $file.FullName -NoNewline
        Write-Host "  Saved $changes changes to $($file.Name)" -ForegroundColor Magenta
    } else {
        Write-Host "  No page banner found in $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Hero background update completed!" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Background image: kamal katwal profile background.png" -ForegroundColor White
Write-Host "  Style: Cover, center positioned, 400px min-height" -ForegroundColor White
Write-Host "  Enhancement: Dark overlay for better text readability" -ForegroundColor White
Write-Host "  All $($htmlFiles.Count) HTML files processed" -ForegroundColor White
