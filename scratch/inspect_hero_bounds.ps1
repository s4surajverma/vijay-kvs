Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile('c:\Users\Admin\OneDrive\Documents\static-web-app\website-look.jpg')

for ($y = 520; $y -le 590; $y += 2) {
    $c1 = $b.GetPixel(100, $y)
    $c2 = $b.GetPixel(500, $y)
    Write-Host ("y={0,3}: (x=100) R={1,3} G={2,3} B={3,3} | (x=500) R={4,3} G={5,3} B={6,3}" -f $y, $c1.R, $c1.G, $c1.B, $c2.R, $c2.G, $c2.B)
}
$b.Dispose()
