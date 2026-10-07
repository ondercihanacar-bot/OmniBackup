using System;
using System.IO;
using System.Diagnostics;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

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
        public static MainWindow AppWindow = null;

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
            Log("=== OmniBackup Main Starting ===");
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

            Log("Acquired single instance mutex. Initializing WinForms...");
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

                // 3. Launch Native Windows Desktop Form
                Log("Creating MainWindow...");
                AppWindow = new MainWindow();
                Log("MainWindow created. Calling Application.Run...");
                Application.Run(AppWindow);
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

        private static void BringExistingInstanceToFront()
        {
            try
            {
                Process current = Process.GetCurrentProcess();
                foreach (Process p in Process.GetProcessesByName(current.ProcessName))
                {
                    if (p.Id != current.Id && p.MainWindowHandle != IntPtr.Zero)
                    {
                        ShowWindow(p.MainWindowHandle, 9); // SW_RESTORE
                        SetForegroundWindow(p.MainWindowHandle);
                        return;
                    }
                }

                // If existing OmniBackup instance is in tray or background, bring its browser window to front or open it
                BringBrowserAppToFrontOrOpen();
            }
            catch { }
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
                req.Proxy = null;
                req.Timeout = 1000;
                req.ReadWriteTimeout = 1000;
                req.Method = "GET";
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

            ToolStripMenuItem titleItem = new ToolStripMenuItem("OmniBackup Enterprise Cyber Vault");
            titleItem.Font = new Font("Segoe UI", 9f, FontStyle.Bold);
            titleItem.Enabled = false;
            TrayMenu.Items.Add(titleItem);

            ToolStripMenuItem statusItem = new ToolStripMenuItem("Durum: Canlı Koruma Aktif (Yerel Port 3060)");
            statusItem.ForeColor = Color.DarkGreen;
            statusItem.Enabled = false;
            TrayMenu.Items.Add(statusItem);

            TrayMenu.Items.Add(new ToolStripSeparator());

            ToolStripMenuItem openItem = new ToolStripMenuItem("🛡️ Program Penceresini Aç", null, (s, e) => {
                OpenMainWindow();
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
                if (AppWindow != null && !AppWindow.IsDisposed)
                {
                    AppWindow.Reload();
                }
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

            // Double-click tray icon to immediately open program window
            TrayIcon.DoubleClick += (s, e) => {
                OpenMainWindow();
            };

            // Single left-click tray icon to open program window
            TrayIcon.MouseClick += (s, e) => {
                if (e.Button == MouseButtons.Left)
                {
                    OpenMainWindow();
                }
            };

            StatusMenuItem = statusItem;

            // 1. Live Backup Dynamic Color Rotation Animation Timer (75ms frame cycle)
            TrayAnimTimer = new System.Windows.Forms.Timer();
            TrayAnimTimer.Interval = 75;
            TrayAnimTimer.Tick += (s, e) => {
                try
                {
                    AnimFrame++;
                    AnimAngle = (AnimAngle + 22) % 360;

                    // Dynamic multi-color cyber palette cycling smoothly over time
                    Color[] cyberColors = new Color[] {
                        Color.FromArgb(0, 240, 255),    // Vivid Cyan
                        Color.FromArgb(16, 230, 110),   // Electric Emerald
                        Color.FromArgb(59, 130, 246),   // Neon Cyber Blue
                        Color.FromArgb(236, 72, 153),   // Cyber Pink
                        Color.FromArgb(245, 158, 11)    // Radiant Amber Gold
                    };

                    int cIdx = (AnimFrame / 5) % cyberColors.Length;
                    int nextCIdx = (cIdx + 1) % cyberColors.Length;
                    Color primaryColor = cyberColors[cIdx];
                    Color secondaryColor = cyberColors[nextCIdx];

                    using (Bitmap bmp = new Bitmap(32, 32))
                    {
                        using (Graphics g = Graphics.FromImage(bmp))
                        {
                            g.SmoothingMode = SmoothingMode.AntiAlias;
                            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                            g.Clear(Color.Transparent);

                            // Draw base shield icon centered in 20x20
                            if (AppIcon != null)
                            {
                                g.DrawIcon(AppIcon, new Rectangle(6, 6, 20, 20));
                            }
                            else
                            {
                                using (Brush b = new SolidBrush(Color.FromArgb(30, 41, 59)))
                                {
                                    g.FillEllipse(b, 6, 6, 20, 20);
                                }
                            }

                            // 1. Primary Sweeping Laser Radar Arc (Primary Color)
                            using (Pen p1 = new Pen(primaryColor, 3f))
                            {
                                p1.StartCap = LineCap.Round;
                                p1.EndCap = LineCap.Round;
                                g.DrawArc(p1, 2, 2, 27, 27, AnimAngle, 110);
                            }

                            // 2. Opposing Counter-Sweep Arc (Secondary Color)
                            using (Pen p2 = new Pen(secondaryColor, 2f))
                            {
                                p2.StartCap = LineCap.Round;
                                p2.EndCap = LineCap.Round;
                                g.DrawArc(p2, 2, 2, 27, 27, (AnimAngle + 180) % 360, 80);
                            }

                            // 3. Orbiting Data Packet 1 (Primary Head)
                            double rad1 = (AnimAngle + 110) * Math.PI / 180.0;
                            int dot1X = (int)(15.5 + 13.5 * Math.Cos(rad1));
                            int dot1Y = (int)(15.5 + 13.5 * Math.Sin(rad1));
                            using (Brush dotBrush1 = new SolidBrush(Color.White))
                            {
                                g.FillEllipse(dotBrush1, dot1X - 2, dot1Y - 2, 5, 5);
                            }

                            // 4. Orbiting Data Packet 2 (Secondary Head)
                            double rad2 = ((AnimAngle + 180 + 80) % 360) * Math.PI / 180.0;
                            int dot2X = (int)(15.5 + 13.5 * Math.Cos(rad2));
                            int dot2Y = (int)(15.5 + 13.5 * Math.Sin(rad2));
                            using (Brush dotBrush2 = new SolidBrush(secondaryColor))
                            {
                                g.FillEllipse(dotBrush2, dot2X - 1, dot2Y - 1, 4, 4);
                            }
                        }

                        IntPtr hIcon = bmp.GetHicon();
                        Icon frameIcon = Icon.FromHandle(hIcon);
                        TrayIcon.Icon = frameIcon;

                        string shortName = string.IsNullOrEmpty(CurrentRunningJobName) ? "Yedekleme" : CurrentRunningJobName;
                        if (shortName.Length > 20) shortName = shortName.Substring(0, 18) + "..";
                        string tip = string.Format("⚡ Yedekleniyor (%{0}): {1}", CurrentRunningPercent, shortName);
                        if (tip.Length > 63) tip = tip.Substring(0, 60) + "...";
                        TrayIcon.Text = tip;

                        if (LastIconHandle != IntPtr.Zero)
                        {
                            DestroyIcon(LastIconHandle);
                        }
                        LastIconHandle = hIcon;
                    }
                }
                catch { }
            };

            // 2. Background Poller: Checks if any backup is actively running (500ms fast check)
            BackupWatcherTimer = new System.Windows.Forms.Timer();
            BackupWatcherTimer.Interval = 500;
            BackupWatcherTimer.Tick += (s, e) => {
                CheckBackupStatus();
            };
            BackupWatcherTimer.Start();
        }

        private static void CheckBackupStatus()
        {
            Task.Factory.StartNew(() => {
                try
                {
                    HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:3060/api/backup-running");
                    req.Proxy = null;
                    req.Timeout = 1000;
                    req.ReadWriteTimeout = 1000;
                    using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                    using (StreamReader reader = new StreamReader(resp.GetResponseStream()))
                    {
                        string json = reader.ReadToEnd();
                        bool running = json.Contains("\"isRunning\":true");

                        int pIdx = json.IndexOf("\"percent\":");
                        if (pIdx > -1)
                        {
                            int comma = json.IndexOfAny(new char[] { ',', '}' }, pIdx);
                            if (comma > -1)
                            {
                                string pStr = json.Substring(pIdx + 10, comma - (pIdx + 10)).Trim();
                                int parsed;
                                if (int.TryParse(pStr, out parsed)) CurrentRunningPercent = parsed;
                            }
                        }
                        int nameIdx = json.IndexOf("\"jobName\":\"");
                        if (nameIdx > -1)
                        {
                            int quoteEnd = json.IndexOf("\"", nameIdx + 11);
                            if (quoteEnd > -1)
                            {
                                CurrentRunningJobName = json.Substring(nameIdx + 11, quoteEnd - (nameIdx + 11));
                            }
                        }

                        if (TrayIcon != null && TrayIcon.ContextMenuStrip != null && TrayIcon.ContextMenuStrip.InvokeRequired)
                        {
                            TrayIcon.ContextMenuStrip.BeginInvoke(new Action(() => UpdateTrayBackupState(running)));
                        }
                        else
                        {
                            UpdateTrayBackupState(running);
                        }
                    }
                }
                catch { }
            });
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
                    TrayIcon.ShowBalloonTip(3000, "OmniBackup", "Yedekleme başarıyla tamamlandı!", ToolTipIcon.Info);
                }
                if (StatusMenuItem != null)
                {
                    StatusMenuItem.Text = "Durum: Canlı Koruma Aktif (Yerel Port 3060)";
                    StatusMenuItem.ForeColor = Color.DarkGreen;
                }
            }
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

        public static void OpenMainWindow()
        {
            try
            {
                EnsureServerStarted();

                if (AppWindow != null && !AppWindow.IsDisposed)
                {
                    AppWindow.Opacity = 1;
                    AppWindow.ShowInTaskbar = true;
                    AppWindow.Visible = true;
                    AppWindow.Show();
                    AppWindow.WindowState = FormWindowState.Normal;
                    AppWindow.BringToFront();
                    AppWindow.Activate();
                    SetForegroundWindow(AppWindow.Handle);
                }

                BringBrowserAppToFrontOrOpen();
            }
            catch { }
        }

        public static void BringBrowserAppToFrontOrOpen()
        {
            try
            {
                bool windowFound = false;
                foreach (Process p in Process.GetProcesses())
                {
                    try
                    {
                        if (p.MainWindowHandle != IntPtr.Zero && !string.IsNullOrEmpty(p.MainWindowTitle))
                        {
                            string t = p.MainWindowTitle;
                            if (t.IndexOf("OmniBackup", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                t.IndexOf("127.0.0.1", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                t.IndexOf("Cyber Vault", StringComparison.OrdinalIgnoreCase) >= 0)
                            {
                                ShowWindow(p.MainWindowHandle, 9); // SW_RESTORE
                                SetForegroundWindow(p.MainWindowHandle);
                                windowFound = true;
                                break;
                            }
                        }
                    }
                    catch { }
                }

                if (!windowFound)
                {
                    string browserExe = MainWindow.FindChromiumBrowserPath();
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
                    }
                    else
                    {
                        Process.Start(appUrl);
                    }
                }
            }
            catch { }
        }

        public static void Cleanup()
        {
            try
            {
                if (TrayAnimTimer != null) { TrayAnimTimer.Stop(); TrayAnimTimer.Dispose(); TrayAnimTimer = null; }
                if (BackupWatcherTimer != null) { BackupWatcherTimer.Stop(); BackupWatcherTimer.Dispose(); BackupWatcherTimer = null; }
                if (LastIconHandle != IntPtr.Zero) { DestroyIcon(LastIconHandle); LastIconHandle = IntPtr.Zero; }

                if (ServerProcess != null && !ServerProcess.HasExited)
                {
                    ServerProcess.Kill();
                }
            }
            catch { }

            if (SingleInstanceMutex != null)
            {
                try { SingleInstanceMutex.ReleaseMutex(); } catch { }
                SingleInstanceMutex = null;
            }
        }
    }

    public class MainWindow : Form
    {
        private WebView2 webView;
        private Label lblLoading;
        private bool isExiting = false;

        public MainWindow()
        {
            InitializeComponent();
            this.Shown += (s, e) => {
                InitWebViewAsync();
            };
        }

        private void InitializeComponent()
        {
            this.Text = "OmniBackup Enterprise Cyber Vault v2.8.2";
            this.Size = new Size(1440, 900);
            this.MinimumSize = new Size(1024, 680);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(3, 7, 18); // Dark cyber background
            this.ForeColor = Color.White;
            this.Icon = Program.AppIcon;

            // Loading placeholder label
            lblLoading = new Label();
            lblLoading.Text = "OmniBackup Enterprise Cyber Vault Başlatılıyor...\nLütfen Bekleyiniz...";
            lblLoading.Font = new Font("Segoe UI Semibold", 12f);
            lblLoading.ForeColor = Color.FromArgb(56, 189, 248);
            lblLoading.TextAlign = ContentAlignment.MiddleCenter;
            lblLoading.Dock = DockStyle.Fill;
            this.Controls.Add(lblLoading);

            // WebView2 Control
            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            webView.Visible = false;
            this.Controls.Add(webView);

            this.FormClosing += MainWindow_FormClosing;
        }

        private async void InitWebViewAsync()
        {
            try
            {
                Program.Log("InitWebViewAsync started.");
                string userDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "OmniBackup", "WebView2Data");
                if (!Directory.Exists(userDataDir))
                {
                    Directory.CreateDirectory(userDataDir);
                }

                Program.Log("Creating CoreWebView2Environment at: " + userDataDir);
                CoreWebView2Environment env = await CoreWebView2Environment.CreateAsync(null, userDataDir, null);
                Program.Log("CoreWebView2Environment created. Ensuring CoreWebView2Async...");
                await webView.EnsureCoreWebView2Async(env);
                Program.Log("EnsureCoreWebView2Async completed successfully.");

                // Configure Desktop App Experience (No URL Bar, No Status Bar, Clean UI)
                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
                webView.CoreWebView2.Settings.IsBuiltInErrorPageEnabled = true;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;

                // Listen for navigation completed
                webView.NavigationCompleted += (s, e) => {
                    Program.Log(string.Format("NavigationCompleted: IsSuccess={0}, WebErrorStatus={1}", e.IsSuccess, e.WebErrorStatus));
                    if (!e.IsSuccess)
                    {
                        System.Windows.Forms.Timer retryTimer = new System.Windows.Forms.Timer();
                        retryTimer.Interval = 1500;
                        retryTimer.Tick += (ts, te) => {
                            retryTimer.Stop();
                            retryTimer.Dispose();
                            Program.EnsureServerStarted();
                            try
                            {
                                if (webView != null && !webView.IsDisposed && webView.CoreWebView2 != null)
                                {
                                    Program.Log("Retrying navigation to http://127.0.0.1:3060");
                                    webView.Source = new Uri("http://127.0.0.1:3060");
                                }
                            }
                            catch { }
                        };
                        retryTimer.Start();
                        return;
                    }
                    lblLoading.Visible = false;
                    webView.Visible = true;
                    this.Opacity = 1;
                    this.ShowInTaskbar = true;
                    this.WindowState = FormWindowState.Normal;
                    this.BringToFront();
                    this.Activate();
                    Program.Log("Main Form displayed with WebView2 content.");
                };

                // Navigate directly to the local server
                Program.Log("Navigating webView.Source to http://127.0.0.1:3060");
                webView.Source = new Uri("http://127.0.0.1:3060");
            }
            catch (Exception ex)
            {
                Program.Log("InitWebViewAsync EXCEPTION: " + ex.ToString());
                SafeFallbackLaunch();
            }
        }

        private void SafeFallbackLaunch()
        {
            try
            {
                Program.Log("Triggering SafeFallbackLaunch...");
                if (this.IsHandleCreated && this.InvokeRequired)
                {
                    this.BeginInvoke(new Action(FallbackLaunch));
                }
                else
                {
                    FallbackLaunch();
                }
            }
            catch (Exception ex)
            {
                Program.Log("SafeFallbackLaunch EXCEPTION: " + ex.ToString());
                FallbackLaunch();
            }
        }

        private void FallbackLaunch()
        {
            try
            {
                Program.Log("Executing FallbackLaunch browser popup...");
                // Hide this empty container so user only sees the clean app window
                this.Opacity = 0;
                this.ShowInTaskbar = false;
                this.Visible = false;
                this.Hide();

                // Ensure server is verified running before opening browser window
                Program.EnsureServerStarted();
                for (int i = 0; i < 20; i++)
                {
                    if (Program.IsServerRunning("http://127.0.0.1:3060/api/stats"))
                    {
                        break;
                    }
                    Thread.Sleep(500);
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
                }
                else
                {
                    Process.Start(appUrl);
                }
            }
            catch { }
            finally
            {
                this.Hide();
            }
        }

        public static string FindChromiumBrowserPath()
        {
            string[] possiblePaths = new string[]
            {
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
            };

            foreach (string p in possiblePaths)
            {
                if (File.Exists(p)) return p;
            }
            return null;
        }

        public void Reload()
        {
            if (webView != null && webView.CoreWebView2 != null)
            {
                webView.Reload();
            }
        }

        private void MainWindow_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (!isExiting && e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                this.Hide();
                if (Program.TrayIcon != null)
                {
                    Program.TrayIcon.ShowBalloonTip(
                        3000,
                        "OmniBackup Enterprise Cyber Vault",
                        "Uygulama arka planda ve sistem tepsisinde çalışmaya devam ediyor. Görev çubuğu simgesine çift tıklayarak tekrar açabilirsiniz.",
                        ToolTipIcon.Info
                    );
                }
            }
            else
            {
                Program.ExitApplication();
            }
        }
    }
}
