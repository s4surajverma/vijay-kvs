Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile('c:\Users\Admin\OneDrive\Documents\static-web-app\website-look.jpg')
Write-Host ("Source Image: {0} x {1}" -f $img.Width, $img.Height)

function SaveCrop($x, $y, $w, $h, $filename) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $dest = "c:\Users\Admin\OneDrive\Documents\static-web-app\assets\images\$filename"
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host ("Cropped {0} at ({1},{2}) size {3}x{4}" -f $filename, $x, $y, $w, $h)
}

# 1. Navbar brand emblem
SaveCrop 30 36 72 64 "brand_emblem.png"

# 2. Hero banner full (from end of navbar y=103 to end of hero card y=578 -> height=475)
SaveCrop 0 103 1024 475 "hero_banner_full.png"

# 3. Vijay Kumar desk portrait HD
SaveCrop 375 103 440 475 "vijay_kumar_desk_hd.png"

# 4. Motivational lower banner (from y=1080 to y=1248 -> height=168)
SaveCrop 0 1080 1024 168 "stronger_foundations_banner.png"

# 5. Children globe crop for subpage
SaveCrop 0 1080 430 168 "children_globe_hd.png"

$img.Dispose()
Write-Host "All perfect crops completed successfully!"
