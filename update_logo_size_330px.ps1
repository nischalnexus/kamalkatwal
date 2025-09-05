# PowerShell Script to Update All Logos to 330px Across Template Pages
# This script updates all logo sizes to the new larger size

Write-Host "Starting logo size update to 330px..." -ForegroundColor Green

# Define the Template directory
$templateDir = "Template"

# Get all HTML files in the Template directory
$htmlFiles = Get-ChildItem -Path $templateDir -Filter "*.html" -File

Write-Host "Found $($htmlFiles.Count) HTML files to update" -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Track changes
    $changes = 0
    
    # Update header logo size to 330px
    if ($content -match 'style="width: \d+px; height: auto;".*?KAMAL KATWAL LOGO\.svg') {
        # Find header logos (usually in header section)
        $pattern = '(src="assets/images/KAMAL KATWAL LOGO\.svg"[^>]*style="width: )\d+(px; height: auto;")'
        if ($content -match $pattern) {
            $content = $content -replace $pattern, '${1}330${2}'
            $changes++
            Write-Host "  Updated header logo to 330px" -ForegroundColor Green
        }
    }
    
    # Also handle any remaining old size references
    if ($content -match 'width: 180px.*?KAMAL KATWAL LOGO\.svg') {
        $content = $content -replace 'width: 180px', 'width: 330px'
        $changes++
        Write-Host "  Updated 180px to 330px" -ForegroundColor Green
    }
    
    if ($content -match 'width: 160px.*?KAMAL KATWAL LOGO\.svg') {
        $content = $content -replace 'width: 160px', 'width: 300px'
        $changes++
        Write-Host "  Updated footer logo to 300px" -ForegroundColor Green
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
Write-Host "Logo size update completed!" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Header logos updated to: 330px width" -ForegroundColor White
Write-Host "  Footer logos updated to: 300px width" -ForegroundColor White
Write-Host "  All $($htmlFiles.Count) HTML files processed" -ForegroundColor White
