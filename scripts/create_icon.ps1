Add-Type -AssemblyName System.Drawing

$icoPath = Join-Path $PSScriptRoot "app.ico"
$pngPath = Join-Path $PSScriptRoot "app_logo.png"

function Draw-ShieldLogo($size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $margin = [int]($size * 0.08)
    $w = $size - (2 * $margin)
    $h = $size - (2 * $margin)
    $cx = $size / 2.0
    $cy = $size / 2.0

    # Background Dark Shield Path
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pt1 = New-Object System.Drawing.PointF($cx, $margin)
    $pt2 = New-Object System.Drawing.PointF($size - $margin, $margin + $h * 0.25)
    $pt3 = New-Object System.Drawing.PointF($size - $margin, $margin + $h * 0.65)
    $pt4 = New-Object System.Drawing.PointF($cx, $size - $margin)
    $pt5 = New-Object System.Drawing.PointF($margin, $margin + $h * 0.65)
    $pt6 = New-Object System.Drawing.PointF($margin, $margin + $h * 0.25)

    $path.AddPolygon(@($pt1, $pt2, $pt3, $pt4, $pt5, $pt6))

    # Gradient Fill - Deep Cyber Blue to Electric Indigo
    $rect = New-Object System.Drawing.RectangleF($margin, $margin, $w, $h)
    $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 0, 102, 255),
        [System.Drawing.Color]::FromArgb(255, 10, 25, 60),
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    $g.FillPath($grad, $path)

    # Glowing Cyan Border
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 229, 255), [math]::Max(2, [int]($size * 0.05)))
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawPath($pen, $path)

    # Center Vault / Lock Symbol
    $lw = [int]($size * 0.32)
    $lh = [int]($size * 0.28)
    $lx = [int]($cx - ($lw / 2))
    $ly = [int]($cy - ($lh * 0.2))

    # Lock Body
    $lockBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Rectangle($lx, $ly, $lw, $lh)),
        [System.Drawing.Color]::FromArgb(255, 0, 229, 255),
        [System.Drawing.Color]::FromArgb(255, 0, 140, 255),
        [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
    )
    $lockPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = [int]($size * 0.04)
    $lockPath.AddArc($lx, $ly, $radius*2, $radius*2, 180, 90)
    $lockPath.AddArc($lx + $lw - $radius*2, $ly, $radius*2, $radius*2, 270, 90)
    $lockPath.AddArc($lx + $lw - $radius*2, $ly + $lh - $radius*2, $radius*2, $radius*2, 0, 90)
    $lockPath.AddArc($lx, $ly + $lh - $radius*2, $radius*2, $radius*2, 90, 90)
    $lockPath.CloseFigure()
    $g.FillPath($lockBrush, $lockPath)

    # Shackle
    $sw = [int]($size * 0.22)
    $sh = [int]($size * 0.24)
    $sx = [int]($cx - ($sw / 2))
    $sy = [int]($ly - $sh * 0.65)
    $shacklePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 230, 245, 255), [math]::Max(2, [int]($size * 0.045)))
    $g.DrawArc($shacklePen, $sx, $sy, $sw, $sh, 180, 180)

    # Keyhole in Lock
    $khBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 20, 45))
    $g.FillEllipse($khBrush, [int]($cx - $size*0.04), [int]($ly + $lh*0.25), [int]($size*0.08), [int]($size*0.08))
    $khPoints = @(
        (New-Object System.Drawing.PointF([float]($cx - $size*0.025), [float]($ly + $lh*0.35))),
        (New-Object System.Drawing.PointF([float]($cx + $size*0.025), [float]($ly + $lh*0.35))),
        (New-Object System.Drawing.PointF([float]($cx + $size*0.04), [float]($ly + $lh*0.75))),
        (New-Object System.Drawing.PointF([float]($cx - $size*0.04), [float]($ly + $lh*0.75)))
    )
    $g.FillPolygon($khBrush, $khPoints)

    $g.Dispose()
    return $bmp
}

# Generate 256x256 PNG
$bmp256 = Draw-ShieldLogo 256
$bmp256.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Generate multi-size ICO
$sizes = @(16, 32, 48, 64, 128, 256)
$images = @()
foreach ($s in $sizes) {
    $images += (Draw-ShieldLogo $s)
}

# Write true ICO file format
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter($fs)

# ICO Header
$bw.Write([uint16]0) # Reserved
$bw.Write([uint16]1) # Type (1=ICO)
$bw.Write([uint16]$images.Count) # Number of images

$offset = 6 + ($images.Count * 16)
$pngDataList = @()

foreach ($img in $images) {
    $ms = New-Object System.IO.MemoryStream
    $img.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $pngDataList += ,$bytes

    $w = if ($img.Width -ge 256) { [byte]0 } else { [byte]$img.Width }
    $h = if ($img.Height -ge 256) { [byte]0 } else { [byte]$img.Height }

    $bw.Write($w) # Width
    $bw.Write($h) # Height
    $bw.Write([byte]0) # Color palette count
    $bw.Write([byte]0) # Reserved
    $bw.Write([uint16]1) # Color planes
    $bw.Write([uint16]32) # Bits per pixel
    $bw.Write([uint32]$bytes.Length) # Image size in bytes
    $bw.Write([uint32]$offset) # Offset

    $offset += $bytes.Length
}

foreach ($data in $pngDataList) {
    $bw.Write($data)
}

$bw.Flush()
$fs.Close()

Write-Host "[OK] Icon and Logo Created: $icoPath" -ForegroundColor Green
