using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;

namespace MakeIconApp
{
    class Program
    {
        static void Main(string[] args)
        {
            string outDir = AppDomain.CurrentDomain.BaseDirectory;
            if (args.Length > 0) outDir = args[0];

            string icoPath = Path.Combine(outDir, "app.ico");
            string pngPath = Path.Combine(outDir, "app_logo.png");

            // Generate 256x256 PNG
            using (Bitmap bmp256 = DrawShieldLogo(256))
            {
                bmp256.Save(pngPath, ImageFormat.Png);
            }

            // Generate Multi-resolution ICO (256, 128, 64, 48, 32, 16)
            int[] sizes = new int[] { 256, 128, 64, 48, 32, 16 };
            List<byte[]> pngBytesList = new List<byte[]>();
            List<Size> imageSizes = new List<Size>();

            foreach (int s in sizes)
            {
                using (Bitmap bmp = DrawShieldLogo(s))
                {
                    using (MemoryStream ms = new MemoryStream())
                    {
                        bmp.Save(ms, ImageFormat.Png);
                        pngBytesList.Add(ms.ToArray());
                        imageSizes.Add(new Size(s, s));
                    }
                }
            }

            using (FileStream fs = File.Create(icoPath))
            using (BinaryWriter bw = new BinaryWriter(fs))
            {
                bw.Write((ushort)0); // Reserved
                bw.Write((ushort)1); // Type ICO
                bw.Write((ushort)pngBytesList.Count); // Count

                int offset = 6 + (pngBytesList.Count * 16);

                for (int i = 0; i < pngBytesList.Count; i++)
                {
                    int w = imageSizes[i].Width >= 256 ? 0 : imageSizes[i].Width;
                    int h = imageSizes[i].Height >= 256 ? 0 : imageSizes[i].Height;

                    bw.Write((byte)w);
                    bw.Write((byte)h);
                    bw.Write((byte)0); // Colors
                    bw.Write((byte)0); // Reserved
                    bw.Write((ushort)1); // Planes
                    bw.Write((ushort)32); // Bit count
                    bw.Write((uint)pngBytesList[i].Length); // Size
                    bw.Write((uint)offset); // Offset

                    offset += pngBytesList[i].Length;
                }

                for (int i = 0; i < pngBytesList.Count; i++)
                {
                    bw.Write(pngBytesList[i]);
                }
            }

            Console.WriteLine("[OK] Successfully created " + icoPath + " and " + pngPath);
        }

        static Bitmap DrawShieldLogo(int size)
        {
            Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.Transparent);

                float margin = size * 0.08f;
                float w = size - (2 * margin);
                float h = size - (2 * margin);
                float cx = size / 2.0f;
                float cy = size / 2.0f;

                // Shield Outer Path
                using (GraphicsPath path = new GraphicsPath())
                {
                    PointF[] points = new PointF[] {
                        new PointF(cx, margin),
                        new PointF(size - margin, margin + h * 0.22f),
                        new PointF(size - margin, margin + h * 0.62f),
                        new PointF(cx, size - margin),
                        new PointF(margin, margin + h * 0.62f),
                        new PointF(margin, margin + h * 0.22f)
                    };
                    path.AddPolygon(points);

                    // Shield Gradient Fill (Electric Blue to Dark Obsidian)
                    RectangleF rect = new RectangleF(margin, margin, w, h);
                    using (LinearGradientBrush grad = new LinearGradientBrush(
                        rect,
                        Color.FromArgb(255, 0, 102, 255),
                        Color.FromArgb(255, 6, 15, 38),
                        LinearGradientMode.ForwardDiagonal))
                    {
                        g.FillPath(grad, path);
                    }

                    // Cyber Cyan Glowing Border
                    using (Pen pen = new Pen(Color.FromArgb(255, 0, 229, 255), Math.Max(2, size * 0.045f)))
                    {
                        pen.LineJoin = LineJoin.Round;
                        g.DrawPath(pen, path);
                    }
                }

                // Shackle (Top of Padlock)
                float sw = size * 0.24f;
                float sh = size * 0.24f;
                float sx = cx - (sw / 2.0f);
                float sy = cy - size * 0.16f;

                using (Pen shacklePen = new Pen(Color.FromArgb(255, 220, 240, 255), Math.Max(2, size * 0.05f)))
                {
                    g.DrawArc(shacklePen, sx, sy, sw, sh, 180, 180);
                }

                // Lock Body
                float lw = size * 0.34f;
                float lh = size * 0.28f;
                float lx = cx - (lw / 2.0f);
                float ly = cy - size * 0.04f;
                float r = size * 0.04f;

                using (GraphicsPath lockPath = new GraphicsPath())
                {
                    lockPath.AddArc(lx, ly, r * 2, r * 2, 180, 90);
                    lockPath.AddArc(lx + lw - r * 2, ly, r * 2, r * 2, 270, 90);
                    lockPath.AddArc(lx + lw - r * 2, ly + lh - r * 2, r * 2, r * 2, 0, 90);
                    lockPath.AddArc(lx, ly + lh - r * 2, r * 2, r * 2, 90, 90);
                    lockPath.CloseFigure();

                    using (LinearGradientBrush lockBrush = new LinearGradientBrush(
                        new RectangleF(lx, ly, lw, lh),
                        Color.FromArgb(255, 0, 229, 255),
                        Color.FromArgb(255, 0, 110, 240),
                        LinearGradientMode.Vertical))
                    {
                        g.FillPath(lockBrush, lockPath);
                    }
                }

                // Keyhole
                using (SolidBrush khBrush = new SolidBrush(Color.FromArgb(255, 6, 15, 38)))
                {
                    float khRadius = size * 0.04f;
                    g.FillEllipse(khBrush, cx - khRadius, ly + lh * 0.22f, khRadius * 2, khRadius * 2);

                    PointF[] khPoints = new PointF[] {
                        new PointF(cx - size * 0.022f, ly + lh * 0.35f),
                        new PointF(cx + size * 0.022f, ly + lh * 0.35f),
                        new PointF(cx + size * 0.035f, ly + lh * 0.72f),
                        new PointF(cx - size * 0.035f, ly + lh * 0.72f)
                    };
                    g.FillPolygon(khBrush, khPoints);
                }
            }
            return bmp;
        }
    }
}
