# PowerShell Script to Update All Logos Across Template Pages
# This script updates all logo references in HTML files to use the new Kamal Katwal logo

Write-Host "Starting logo update process..." -ForegroundColor Green

# Define the Template directory
$templateDir = "Template"

# Get all HTML files in the Template directory (excluding __MACOSX)
$htmlFiles = Get-ChildItem -Path $templateDir -Filter "*.html" -File

Write-Host "Found $($htmlFiles.Count) HTML files to update" -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Track changes
    $changes = 0
    
    # Replace header logo (primary)
    if ($content -match 'assets/images/site_logo/site_logo_primary\.svg') {
        $content = $content -replace 'src="assets/images/site_logo/site_logo_primary\.svg"', 'src="assets/images/KAMAL KATWAL LOGO.svg" style="width: 180px; height: auto;"'
        $changes++
        Write-Host "  Updated header logo" -ForegroundColor Green
    }
    
    # Replace footer logo (white)
    if ($content -match 'assets/images/site_logo/site_logo_white\.svg') {
        $content = $content -replace 'src="assets/images/site_logo/site_logo_white\.svg"', 'src="assets/images/KAMAL KATWAL LOGO.svg" style="width: 160px; height: auto;"'
        $changes++
        Write-Host "  Updated footer logo" -ForegroundColor Green
    }
    
    # Update alt text for better branding
    if ($content -match 'alt="Site Logo – Talking Minds – Psychotherapist Site Template"') {
        $content = $content -replace 'alt="Site Logo – Talking Minds – Psychotherapist Site Template"', 'alt="Kamal Katwal - Professional Logo"'
        $changes++
        Write-Host "  Updated alt text" -ForegroundColor Green
    }
    
    # Save the updated content if changes were made
    if ($changes -gt 0) {
        $content | Set-Content -Path $file.FullName -NoNewline
        Write-Host "  Saved $changes changes to $($file.Name)" -ForegroundColor Magenta
    } else {
        Write-Host "  No changes needed for $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Logo update process completed!" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Header logos updated to: KAMAL KATWAL LOGO.svg (180px width)" -ForegroundColor White
Write-Host "  Footer logos updated to: KAMAL KATWAL LOGO.svg (160px width)" -ForegroundColor White
Write-Host "  Alt text updated to: Kamal Katwal - Professional Logo" -ForegroundColor White
Write-Host "  All $($htmlFiles.Count) HTML files processed" -ForegroundColor White
