$prefix = "http://localhost:8089/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Server listening on $prefix ..."

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.LocalPath
    if ($path -eq "/api/proxy-image") {
        $id = $request.QueryString["id"]
        if ($id) {
            try {
                $proxyUrl = "https://lh3.googleusercontent.com/d/$id"
                $wc = New-Object System.Net.WebClient
                $imgBytes = $wc.DownloadData($proxyUrl)
                $response.ContentType = "image/jpeg"
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.ContentLength64 = $imgBytes.Length
                $response.OutputStream.Write($imgBytes, 0, $imgBytes.Length)
            } catch {
                $response.StatusCode = 502
            }
        } else {
            $response.StatusCode = 400
        }
        $response.Close()
        continue
    }

    if ($path -eq "/") { $path = "/index.html" }
    $localPath = Join-Path (Get-Location) $path.TrimStart('/')

    if (Test-Path $localPath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($localPath)
        
        $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
        switch ($ext) {
            ".html" { $response.ContentType = "text/html; charset=utf-8" }
            ".css"  { $response.ContentType = "text/css; charset=utf-8" }
            ".js"   { $response.ContentType = "text/javascript; charset=utf-8" }
            ".png"  { $response.ContentType = "image/png" }
            ".jpg"  { $response.ContentType = "image/jpeg" }
            ".json" { $response.ContentType = "application/json" }
            default { $response.ContentType = "application/octet-stream" }
        }

        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    $response.Close()
}
