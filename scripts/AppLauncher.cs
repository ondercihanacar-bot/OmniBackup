using System;
using System.IO;
using System.Diagnostics;
using System.Net;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;

namespace OmniBackupLauncher
{
    static class Program
    {
        public static NotifyIcon TrayIcon;
        public static ContextMenuStrip TrayMenu;
        public static Process ServerProcess = null;
        public static Mutex SingleInstanceMutex = null;
        public static string BaseDir = "";
        public static Icon AppIcon = null;

        // Tray Animation & Live Backup Watcher
        public static System.Windows.Forms.Timer TrayAnimTimer = null;
        public static System.Windows.Forms.Timer BackupWatcherTimer = null;
        public static int AnimAngle = 0;
        public static int AnimFrame = 0;
        public static string CurrentRunningJobName = "";
        public static int CurrentRunningPercent = 0;
        public static bool IsBackupActive = false;
        public static IntPtr LastIconHandle = IntPtr.Zero;
        public static ToolStripMenuItem StatusMenuItem = null;

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern bool DestroyIcon(IntPtr handle);

        [DllImport("user32.dll")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        public static void Log(string msg)
        {
            try
            {
                string logPath = Path.Combine(BaseDir, "launcher.log");
                File.AppendAllText(logPath, string.Format("[{0:yyyy-MM-dd HH:mm:ss.fff}] {1}\r\n", DateTime.Now, msg));
            }
            catch { }
        }

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                WebRequest.DefaultWebProxy = null;
            }
            catch { }

            BaseDir = AppDomain.CurrentDomain.BaseDirectory;
            Log("=== OmniBackup Main Starting (v2.8.7) ===");
            AppDomain.CurrentDomain.UnhandledException += (s, e) => {
                Log("Unhandled AppDomain Exception: " + e.ExceptionObject);
            };
            Application.ThreadException += (s, e) => {
                Log("ThreadException: " + e.Exception);
            };

            bool createdNew;
            SingleInstanceMutex = new Mutex(true, "OmniBackup_Enterprise_Desktop_App_Mutex", out createdNew);

            LoadAppIcon();

            if (!createdNew)
            {
                Log("Another instance already running, bringing existing instance to front...");
                BringExistingInstanceToFront();
                return;
            }

            Log("Acquired single instance mutex. Initializing WinForms ApplicationContext...");
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            try
            {
                // 1. Setup System Tray First for instant user feedback
                Log("Setting up system tray...");
                SetupTray();

                // 2. Ensure Local Node.js Background Server is Active
                Log("Ensuring server started...");
                EnsureServerStarted();
                Log("Server status verified.");

                // 3. Open Application UI Window (Dedicated Chromium App Window)
                Log("Opening application window...");
                OpenAppWindow();

                // 4. Start Background Message Loop via ApplicationContext (No black placeholder forms!)
                Application.Run(new TrayApplicationContext());
                Log("Application.Run exited normally.");
            }
            catch (Exception ex)
            {
                Log("FATAL in Main: " + ex.ToString());
                MessageBox.Show("OmniBackup başlatma hatası: " + ex.Message, "OmniBackup Hata", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                Log("Running Cleanup...");
                Cleanup();
                Log("Cleanup finished.");
            }
        }

        public static void LoadAppIcon()
        {
            try
            {
                string iconPath = Path.Combine(BaseDir, "app.ico");
                if (!File.Exists(iconPath))
                {
                    iconPath = Path.Combine(BaseDir, "scripts", "app.ico");
                }
                if (File.Exists(iconPath))
                {
                    AppIcon = new Icon(iconPath);
                    return;
                }
            }
            catch { }
            AppIcon = SystemIcons.Shield;
        }

        public static void EnsureServerStarted()
        {
            if (IsServerRunning("http://127.0.0.1:3060/api/stats"))
            {
                Log("Server is already running and responding at http://127.0.0.1:3060/api/stats");
                return;
            }

            string serverJs = Path.Combine(BaseDir, "server", "index.js");
            if (!File.Exists(serverJs))
            {
                Log("ERROR: Server script not found at: " + serverJs);
                MessageBox.Show("OmniBackup sunucu dosyaları bulunamadı: " + serverJs, "OmniBackup", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            string nodePath = FindNodeExecutable();
            Log("Found nodePath: " + nodePath);
            if (string.IsNullOrEmpty(nodePath))
            {
                Log("ERROR: Node executable not found.");
                DialogResult res = MessageBox.Show(
                    "OmniBackup çalıştırmak için Node.js çalışma ortamı gereklidir.\nResmi indirme sayfasını açmak ister misiniz?",
                    "Node.js Gereklidir",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information
                );
                if (res == DialogResult.Yes)
                {
                    Process.Start("https://nodejs.org/");
                }
                return;
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = nodePath;
            psi.Arguments = string.Format("\"{0}\"", serverJs);
            psi.WorkingDirectory = BaseDir;
            psi.CreateNoWindow = true;
            psi.UseShellExecute = true;
            psi.WindowStyle = ProcessWindowStyle.Hidden;

            Log("Starting Node.js process with working directory: " + BaseDir);
            ServerProcess = Process.Start(psi);
            Log("Node.js process started. PID=" + (ServerProcess != null ? ServerProcess.Id : 0));

            // Wait up to 10 seconds for server to respond
            for (int i = 0; i < 30; i++)
            {
                Thread.Sleep(300);
                if (IsServerRunning("http://127.0.0.1:3060/api/stats"))
                {
                    Log(string.Format("Server responded successfully after {0} ms.", (i + 1) * 300));
                    break;
                }
            }
        }

        public static string FindNodeExecutable()
        {
            string localNode = Path.Combine(BaseDir, "bin", "node.exe");
            if (File.Exists(localNode)) return localNode;

            localNode = Path.Combine(BaseDir, "node.exe");
            if (File.Exists(localNode)) return localNode;

            string pfNode = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs", "node.exe");
            if (File.Exists(pfNode)) return pfNode;

            string pf86Node = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "nodejs", "node.exe");
            if (File.Exists(pf86Node)) return pf86Node;

            string userNode = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "nodejs", "node.exe");
            if (File.Exists(userNode)) return userNode;

            try
            {
                ProcessStartInfo wherePsi = new ProcessStartInfo("where.exe", "node");
                wherePsi.CreateNoWindow = true;
                wherePsi.UseShellExecute = false;
                wherePsi.RedirectStandardOutput = true;
                using (Process p = Process.Start(wherePsi))
                {
                    string output = p.StandardOutput.ReadLine();
                    p.WaitForExit(2000);
                    if (!string.IsNullOrEmpty(output) && File.Exists(output.Trim()))
                    {
                        return output.Trim();
                    }
                }
            }
            catch { }

            return null;
        }

        public static bool IsServerRunning(string url)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
                req.Timeout = 1200;
                req.Method = "GET";
                req.Proxy = null;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return (resp.StatusCode == HttpStatusCode.OK);
                }
            }
            catch
            {
                return false;
            }
        }

        private static void SetupTray()
        {
            TrayMenu = new ContextMenuStrip();

            ToolStripMenuItem titleItem = new ToolStripMenuItem("OmniBackup Enterprise Cyber Vault v2.8.7");
            titleItem.Font = new Font("Segoe UI", 9f, FontStyle.Bold);
            titleItem.Enabled = false;
            TrayMenu.Items.Add(titleItem);

            ToolStripMenuItem statusItem = new ToolStripMenuItem("Durum: Canlı Koruma Aktif (Port 3060)");
            statusItem.ForeColor = Color.DarkGreen;
            statusItem.Enabled = false;
            TrayMenu.Items.Add(statusItem);

            TrayMenu.Items.Add(new ToolStripSeparator());

            ToolStripMenuItem openItem = new ToolStripMenuItem("🛡️ Program Penceresini Aç", null, (s, e) => {
                OpenAppWindow();
            });
            openItem.Font = new Font("Segoe UI", 9f, FontStyle.Bold);
            TrayMenu.Items.Add(openItem);

            ToolStripMenuItem restartItem = new ToolStripMenuItem("🔄 Sunucuyu Yeniden Başlat", null, (s, e) => {
                try
                {
                    if (ServerProcess != null && !ServerProcess.HasExited)
                    {
                        ServerProcess.Kill();
                    }
                }
                catch { }
                Thread.Sleep(500);
                EnsureServerStarted();
                OpenAppWindow();
            });
            TrayMenu.Items.Add(restartItem);

            TrayMenu.Items.Add(new ToolStripSeparator());

            ToolStripMenuItem exitItem = new ToolStripMenuItem("❌ Programı Tamamen Kapat", null, (s, e) => {
                ExitApplication();
            });
            TrayMenu.Items.Add(exitItem);

            TrayIcon = new NotifyIcon();
            TrayIcon.Text = "OmniBackup Enterprise Cyber Vault";
            TrayIcon.Icon = AppIcon;
            TrayIcon.ContextMenuStrip = TrayMenu;
            TrayIcon.Visible = true;

            // Double-click or single-click tray icon to immediately open program window
            TrayIcon.DoubleClick += (s, e) => {
                OpenAppWindow();
            };
            TrayIcon.MouseClick += (s, e) => {
                if (e.Button == MouseButtons.Left)
                {
                    OpenAppWindow();
                }
            };

            StatusMenuItem = statusItem;

            // 1. Live Backup Dynamic Color Rotation Animation Timer (75ms frame cycle)
            TrayAnimTimer = new System.Windows.Forms.Timer();
            TrayAnimTimer.Interval = 75;
            TrayAnimTimer.Tick += (s, e) => {
                try
                {
                    AnimAngle = (AnimAngle + 18) % 360;
                    AnimFrame++;

                    Bitmap bmp = new Bitmap(32, 32);
                    using (Graphics g = Graphics.FromImage(bmp))
                    {
                        g.SmoothingMode = SmoothingMode.AntiAlias;
                        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                        g.Clear(Color.Transparent);

                        // Draw rotating active backup halo
                        using (Matrix m = new Matrix())
                        {
                            m.RotateAt(AnimAngle, new PointF(16f, 16f));
                            g.Transform = m;
                            using (Pen ringPen = new Pen(Color.FromArgb(0, 190, 255), 3.5f))
                            {
                                ringPen.DashStyle = DashStyle.Dash;
                                g.DrawEllipse(ringPen, 3, 3, 26, 26);
                            }
                            g.ResetTransform();
                        }

                        // Inner vibrant Shield
                        using (GraphicsPath path = new GraphicsPath())
                        {
                            path.AddPolygon(new PointF[] {
                                new PointF(16, 7),
                                new PointF(23, 10),
                                new PointF(23, 18),
                                new PointF(16, 25),
                                new PointF(9, 18),
                                new PointF(9, 10)
                            });
                            using (LinearGradientBrush fillBrush = new LinearGradientBrush(new Rectangle(9, 7, 14, 18), Color.FromArgb(0, 230, 120), Color.FromArgb(0, 140, 255), 45f))
                            {
                                g.FillPath(fillBrush, path);
                            }
                            using (Pen borderPen = new Pen(Color.White, 1.2f))
                            {
                                g.DrawPath(borderPen, path);
                            }
                        }
                    }

                    IntPtr hIcon = bmp.GetHicon();
                    Icon animatedIcon = Icon.FromHandle(hIcon);
                    TrayIcon.Icon = animatedIcon;

                    if (LastIconHandle != IntPtr.Zero)
                    {
                        DestroyIcon(LastIconHandle);
                    }
                    LastIconHandle = hIcon;
                }
                catch { }
            };

            // 2. Backup Watcher Poller: Check every 1.5s if a live backup is active
            BackupWatcherTimer = new System.Windows.Forms.Timer();
            BackupWatcherTimer.Interval = 1500;
            BackupWatcherTimer.Tick += (s, e) => {
                ThreadPool.QueueUserWorkItem((state) => {
                    CheckLiveBackupStatus();
                });
            };
            BackupWatcherTimer.Start();
        }

        private static void CheckLiveBackupStatus()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:3060/api/backup-running");
                req.Timeout = 1000;
                req.Proxy = null;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    if (resp.StatusCode == HttpStatusCode.OK)
                    {
                        using (StreamReader sr = new StreamReader(resp.GetResponseStream()))
                        {
                            string json = sr.ReadToEnd();
                            bool running = json.Contains("\"isRunning\":true");
                            if (TrayIcon != null)
                            {
                                TrayIcon.ContextMenuStrip.BeginInvoke(new Action(() => {
                                    UpdateTrayBackupState(running);
                                }));
                            }
                        }
                    }
                }
            }
            catch { }
        }

        private static void UpdateTrayBackupState(bool running)
        {
            if (running && !IsBackupActive)
            {
                IsBackupActive = true;
                if (TrayAnimTimer != null) TrayAnimTimer.Start();
                if (StatusMenuItem != null)
                {
                    StatusMenuItem.Text = "Durum: ⚡ Canlı Yedekleme Sürüyor...";
                    StatusMenuItem.ForeColor = Color.DarkOrange;
                }
            }
            else if (!running && IsBackupActive)
            {
                IsBackupActive = false;
                if (TrayAnimTimer != null) TrayAnimTimer.Stop();
                if (LastIconHandle != IntPtr.Zero)
                {
                    DestroyIcon(LastIconHandle);
                    LastIconHandle = IntPtr.Zero;
                }
                if (TrayIcon != null)
                {
                    TrayIcon.Icon = AppIcon;
                    TrayIcon.Text = "OmniBackup Enterprise Cyber Vault - Korumada";
                }
                if (StatusMenuItem != null)
                {
                    StatusMenuItem.Text = "Durum: Canlı Koruma Aktif (Port 3060)";
                    StatusMenuItem.ForeColor = Color.DarkGreen;
                }
            }
        }

        public static void OpenAppWindow()
        {
            try
            {
                EnsureServerStarted();

                // If already open, bring to front
                if (BringExistingInstanceToFront())
                {
                    return;
                }

                string browserExe = FindChromiumBrowserPath();
                string appUrl = "http://127.0.0.1:3060";
                string profileDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "OmniBackup", "DesktopProfile");

                if (!string.IsNullOrEmpty(browserExe))
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = browserExe;
                    psi.Arguments = string.Format(
                        "--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1440,900 --disable-features=TranslateUI --disable-extensions --no-first-run",
                        appUrl,
                        profileDir
                    );
                    psi.UseShellExecute = false;
                    Process.Start(psi);
                    Log("Launched Chromium App Window via: " + browserExe);
                }
                else
                {
                    Process.Start(appUrl);
                    Log("Launched default browser for: " + appUrl);
                }
            }
            catch (Exception ex)
            {
                Log("OpenAppWindow Exception: " + ex.ToString());
            }
        }

        public static bool BringExistingInstanceToFront()
        {
            try
            {
                foreach (Process p in Process.GetProcesses())
                {
                    try
                    {
                        if (p.MainWindowHandle != IntPtr.Zero && !string.IsNullOrEmpty(p.MainWindowTitle))
                        {
                            string t = p.MainWindowTitle;
                            if (t.IndexOf("OmniBackup", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                t.IndexOf("127.0.0.1:3060", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                t.IndexOf("localhost:3060", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                t.IndexOf("Cyber Vault", StringComparison.OrdinalIgnoreCase) >= 0)
                            {
                                ShowWindow(p.MainWindowHandle, 9); // SW_RESTORE
                                SetForegroundWindow(p.MainWindowHandle);
                                return true;
                            }
                        }
                    }
                    catch { }
                }
            }
            catch { }
            return false;
        }

        public static string FindChromiumBrowserPath()
        {
            string[] possiblePaths = new string[]
            {
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
            };

            foreach (string p in possiblePaths)
            {
                if (File.Exists(p)) return p;
            }
            return null;
        }

        public static void ExitApplication()
        {
            Cleanup();
            if (TrayIcon != null)
            {
                TrayIcon.Visible = false;
                TrayIcon.Dispose();
            }
            Application.Exit();
            Environment.Exit(0);
        }

        public static void Cleanup()
        {
            try
            {
                if (TrayAnimTimer != null)
                {
                    TrayAnimTimer.Stop();
                    TrayAnimTimer.Dispose();
                }
                if (BackupWatcherTimer != null)
                {
                    BackupWatcherTimer.Stop();
                    BackupWatcherTimer.Dispose();
                }
                if (LastIconHandle != IntPtr.Zero)
                {
                    DestroyIcon(LastIconHandle);
                    LastIconHandle = IntPtr.Zero;
                }
                if (SingleInstanceMutex != null)
                {
                    SingleInstanceMutex.ReleaseMutex();
                    SingleInstanceMutex.Dispose();
                }
            }
            catch { }
        }
    }

    public class TrayApplicationContext : ApplicationContext
    {
        public TrayApplicationContext()
        {
            // Keeps the tray application running smoothly in background
        }
    }
}
