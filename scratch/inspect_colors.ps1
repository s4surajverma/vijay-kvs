Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile('c:\Users\Admin\OneDrive\Documents\static-web-app\website-look.jpg')
Write-Host "Width:" $b.Width "Height:" $b.Height

# Check vertical line at x = 50 for color changes
for ($y = 0; $y -lt $b.Height; $y += 10) {
    $c = $b.GetPixel(50, $y)
    # Print when color changes noticeably or every 50px
    Write-Host ("y={0,4}: R={1,3} G={2,3} B={3,3}" -f $y, $c.R, $c.G, $c.B)
}
$b.Dispose()
