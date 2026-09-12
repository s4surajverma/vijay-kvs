Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile('c:\Users\Admin\OneDrive\Documents\static-web-app\website-look.jpg')

Write-Host "--- Checking Y bounds at x=200 and x=800 ---"
for ($y = 570; $y -lt $b.Height; $y += 5) {
    $c1 = $b.GetPixel(200, $y)
    $c2 = $b.GetPixel(800, $y)
    # Detect transitions
    Write-Host ("y={0,4}: (x=200) R={1,3} G={2,3} B={3,3} | (x=800) R={4,3} G={5,3} B={6,3}" -f $y, $c1.R, $c1.G, $c1.B, $c2.R, $c2.G, $c2.B)
}
$b.Dispose()
