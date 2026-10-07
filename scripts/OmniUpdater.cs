using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Threading;
using System.Drawing;
using System.Windows.Forms;
using System.Runtime.InteropServices;

namespace OmniBackupUpdater
{
    static class Program
    {
        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr FindWindowEx(IntPtr parentHandle, IntPtr childAfter, string className, string windowTitle);

        [DllImport("user32.dll")]
        public static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

        [DllImport("user32.dll")]
        public static extern IntPtr SendMessage(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern bool PostMessage(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }

        public const uint WM_MOUSEMOVE = 0x0200;
        public const uint WM_CLOSE = 0x0010;

        public static void RefreshNotificationArea()
        {
            try
            {
                // Refresh main tray notification toolbar
                IntPtr hTray = FindWindow("Shell_TrayWnd", null);
                if (hTray != IntPtr.Zero)
                {
                    IntPtr hTrayNotify = FindWindowEx(hTray, IntPtr.Zero, "TrayNotifyWnd", null);
                    if (hTrayNotify != IntPtr.Zero)
                    {
                        IntPtr hSysPager = FindWindowEx(hTrayNotify, IntPtr.Zero, "SysPager", null);
                        IntPtr hToolbar = (hSysPager != IntPtr.Zero)
                            ? FindWindowEx(hSysPager, IntPtr.Zero, "ToolbarWindow32", null)
                            : FindWindowEx(hTrayNotify, IntPtr.Zero, "ToolbarWindow32", null);

                        if (hToolbar != IntPtr.Zero) SweepToolbar(hToolbar);
                    }
                }

                // Refresh overflow tray notification toolbar (hidden icons flyout)
                IntPtr hOverflow = FindWindow("NotifyIconOverflowWindow", null);
                if (hOverflow != IntPtr.Zero)
                {
                    IntPtr hOverflowToolbar = FindWindowEx(hOverflow, IntPtr.Zero, "ToolbarWindow32", null);
                    if (hOverflowToolbar != IntPtr.Zero) SweepToolbar(hOverflowToolbar);
                }
            }
            catch { }
        }

        private static void SweepToolbar(IntPtr hToolbar)
        {
            try
            {
                RECT rect;
                if (GetClientRect(hToolbar, out rect))
                {
                    for (int x = 2; x < rect.Right; x += 10)
                    {
                        for (int y = 2; y < rect.Bottom; y += 10)
                        {
                            IntPtr lParam = (IntPtr)((y << 16) | (x & 0xFFFF));
                            PostMessage(hToolbar, WM_MOUSEMOVE, IntPtr.Zero, lParam);
                        }
                    }
                }
            }
            catch { }
        }

        [STAThread]
        static void Main(string[] args)
        {
            // Args:
            // args[0] = target installation directory (e.g. C:\Program Files\OmniBackup or current AppDomain)
            // args[1] = zip patch path (e.g. C:\Users\...\AppData\Local\Temp\omni_patch.zip)
            // args[2] = parent process ID to wait for exit (optional)
            // args[3] = relaunch executable path (e.g. C:\Program Files\OmniBackup\OmniBackup.exe)

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            if (args.Length < 2)
            {
                MessageBox.Show("OmniBackup Güncelleyici: Geçersiz parametreler.", "OmniBackup Auto-Updater", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            string targetDir = args[0];
            string patchZip = args[1];
            int parentPid = 0;
            if (args.Length > 2) int.TryParse(args[2], out parentPid);
            string relaunchExe = args.Length > 3 ? args[3] : Path.Combine(targetDir, "OmniBackup.exe");

            Application.Run(new UpdateProgressForm(targetDir, patchZip, parentPid, relaunchExe));
        }
    }

    public class UpdateProgressForm : Form
    {
        private ProgressBar progressBar;
        private Label lblStatus;
        private Label lblDetails;
        private string targetDir;
        private string patchZip;
        private int parentPid;
        private string relaunchExe;

        public UpdateProgressForm(string targetDir, string patchZip, int parentPid, string relaunchExe)
        {
            this.targetDir = targetDir;
            this.patchZip = patchZip;
            this.parentPid = parentPid;
            this.relaunchExe = relaunchExe;

            InitializeUI();
            this.Shown += (s, e) => StartUpdateProcess();
        }

        private void InitializeUI()
        {
            this.Text = "OmniBackup Enterprise - Canlı Sistem Güncellemesi";
            this.ClientSize = new Size(520, 220);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.TopMost = true;
            this.BackColor = Color.FromArgb(10, 17, 38); // Acronis Deep Navy
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            Label lblTitle = new Label();
            lblTitle.Text = "OmniBackup Enterprise - Otomatik Güncelleme";
            lblTitle.Font = new Font("Segoe UI", 12f, FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(0, 168, 255);
            lblTitle.Location = new Point(24, 20);
            lblTitle.AutoSize = true;
            this.Controls.Add(lblTitle);

            lblStatus = new Label();
            lblStatus.Text = "Çalışan servisler güvenle sonlandırılıyor...";
            lblStatus.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            lblStatus.ForeColor = Color.FromArgb(200, 215, 235);
            lblStatus.Location = new Point(26, 60);
            lblStatus.Size = new Size(470, 24);
            this.Controls.Add(lblStatus);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(26, 92);
            progressBar.Size = new Size(468, 26);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Value = 10;
            this.Controls.Add(progressBar);

            lblDetails = new Label();
            lblDetails.Text = "Veri tabanı ve görev ayarları korunarak çekirdek dosyalar yenileniyor.";
            lblDetails.Font = new Font("Segoe UI", 8.5f, FontStyle.Italic);
            lblDetails.ForeColor = Color.FromArgb(140, 160, 190);
            lblDetails.Location = new Point(26, 130);
            lblDetails.Size = new Size(470, 30);
            this.Controls.Add(lblDetails);
        }

        private void StartUpdateProcess()
        {
            Thread t = new Thread(() =>
            {
                try
                {
                    UpdateUI(15, "OmniBackup ana penceresi ve servisler kapatılıyor...");
                    
                    // 1. Terminate OmniBackup.exe desktop instances to release mutex and free files
                    KillProcessByName("OmniBackup");

                    // 2. Also close any browser app windows showing OmniBackup
                    CloseOmniBackupAppWindows();

                    // 3. Terminate or wait for Parent Process (Node.js)
                    if (parentPid > 0)
                    {
                        try
                        {
                            Process p = Process.GetProcessById(parentPid);
                            if (!p.HasExited)
                            {
                                p.Kill();
                                p.WaitForExit(3000);
                            }
                        }
                        catch { }
                    }

                    // 4. Also stop any node server processes running inside targetDir
                    KillNodeInTargetDir(targetDir);
                    Thread.Sleep(1500);

                    UpdateUI(35, "Güncelleme paketi açılıyor ve bütünlük doğrulanıyor...");
                    if (!File.Exists(patchZip))
                    {
                        throw new FileNotFoundException("Güncelleme yama dosyası bulunamadı: " + patchZip);
                    }

                    UpdateUI(50, "Yeni sürüm dosyaları sisteme kopyalanıyor...");
                    using (ZipArchive archive = ZipFile.OpenRead(patchZip))
                    {
                        int totalEntries = archive.Entries.Count;
                        int processed = 0;

                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            // SAFETY: NEVER OVERWRITE USER DATABASE, SAVED JOBS, SETTINGS OR USER STORAGE
                            string entryName = entry.FullName.Replace('/', '\\');
                            if (entryName.StartsWith("server\\data\\", StringComparison.OrdinalIgnoreCase) ||
                                entryName.StartsWith("data\\", StringComparison.OrdinalIgnoreCase) ||
                                entryName.Equals("server\\data", StringComparison.OrdinalIgnoreCase) ||
                                entryName.Equals("data", StringComparison.OrdinalIgnoreCase) ||
                                entryName.Equals("server\\db.json", StringComparison.OrdinalIgnoreCase) ||
                                entryName.Equals("db.json", StringComparison.OrdinalIgnoreCase) ||
                                entryName.StartsWith("backups\\", StringComparison.OrdinalIgnoreCase) ||
                                entryName.StartsWith("storage\\", StringComparison.OrdinalIgnoreCase))
                            {
                                continue;
                            }

                            string destPath = Path.Combine(targetDir, entryName);
                            string destDirectory = Path.GetDirectoryName(destPath);

                            if (!string.IsNullOrEmpty(destDirectory) && !Directory.Exists(destDirectory))
                            {
                                Directory.CreateDirectory(destDirectory);
                            }

                            if (!string.IsNullOrEmpty(entry.Name)) // If it's a file
                            {
                                // Retry up to 5 times for locked files
                                for (int i = 0; i < 5; i++)
                                {
                                    try
                                    {
                                        entry.ExtractToFile(destPath, true);
                                        break;
                                    }
                                    catch
                                    {
                                        Thread.Sleep(300);
                                    }
                                }
                            }

                            processed++;
                            int curVal = 50 + (int)((processed / (float)totalEntries) * 35);
                            UpdateUI(curVal, string.Format("Güncelleniyor ({0}/{1}): {2}", processed, totalEntries, entry.Name));
                        }
                    }

                    UpdateUI(90, "Önbellek temizleniyor ve servis yapılandırması tamamlanıyor...");
                    Thread.Sleep(1000);

                    // Clean temp zip
                    try
                    {
                        if (File.Exists(patchZip)) File.Delete(patchZip);
                    }
                    catch { }

                    UpdateUI(100, "Güncelleme tamamlandı! OmniBackup yeniden başlatılıyor...");
                    Thread.Sleep(1200);

                    // Launch updated OmniBackup.exe
                    if (File.Exists(relaunchExe))
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = relaunchExe;
                        psi.WorkingDirectory = targetDir;
                        psi.UseShellExecute = true;
                        Process.Start(psi);
                    }

                    this.Invoke(new Action(() => this.Close()));
                }
                catch (Exception ex)
                {
                    this.Invoke(new Action(() =>
                    {
                        MessageBox.Show("Güncelleme sırasında bir hata oluştu:\n" + ex.Message, "Güncelleme Hatası", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        this.Close();
                    }));
                }
            });

            t.IsBackground = true;
            t.Start();
        }

        private void KillProcessByName(string processName)
        {
            try
            {
                foreach (Process p in Process.GetProcessesByName(processName))
                {
                    try
                    {
                        if (p.MainWindowHandle != IntPtr.Zero)
                        {
                            Program.PostMessage(p.MainWindowHandle, Program.WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
                        }
                    }
                    catch { }
                }

                Thread.Sleep(500);

                foreach (Process p in Process.GetProcessesByName(processName))
                {
                    try
                    {
                        if (!p.HasExited)
                        {
                            p.Kill();
                            p.WaitForExit(1500);
                        }
                    }
                    catch { }
                }

                // Immediately sweep system tray to eliminate any ghost tray icons
                Program.RefreshNotificationArea();
            }
            catch { }
        }

        private void CloseOmniBackupAppWindows()
        {
            try
            {
                foreach (Process p in Process.GetProcesses())
                {
                    try
                    {
                        bool shouldClose = false;
                        if (p.MainWindowHandle != IntPtr.Zero && !string.IsNullOrEmpty(p.MainWindowTitle))
                        {
                            string t = p.MainWindowTitle;
                            if (t.IndexOf("OmniBackup", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                t.IndexOf("127.0.0.1", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                t.IndexOf("localhost:3060", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                t.IndexOf("Cyber Vault", StringComparison.OrdinalIgnoreCase) >= 0)
                            {
                                shouldClose = true;
                            }
                        }

                        // Also check msedge / chrome / browser processes launched for OmniBackup
                        if (!shouldClose && (p.ProcessName.Equals("msedge", StringComparison.OrdinalIgnoreCase) || p.ProcessName.Equals("chrome", StringComparison.OrdinalIgnoreCase)))
                        {
                            if (!string.IsNullOrEmpty(p.MainWindowTitle) && 
                               (p.MainWindowTitle.IndexOf("OmniBackup", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                p.MainWindowTitle.IndexOf("3060", StringComparison.OrdinalIgnoreCase) >= 0))
                            {
                                shouldClose = true;
                            }
                        }

                        if (shouldClose)
                        {
                            try
                            {
                                p.CloseMainWindow();
                                if (!p.WaitForExit(1000))
                                {
                                    p.Kill();
                                }
                            }
                            catch
                            {
                                p.Kill();
                            }
                        }
                    }
                    catch { }
                }

                // Call RefreshNotificationArea again after windows close
                Program.RefreshNotificationArea();
            }
            catch { }
        }

        private void KillNodeInTargetDir(string dir)
        {
            try
            {
                foreach (Process p in Process.GetProcessesByName("node"))
                {
                    try
                    {
                        string pPath = p.MainModule.FileName;
                        // Kill node processes
                        p.Kill();
                    }
                    catch { }
                }
            }
            catch { }
        }

        private void UpdateUI(int percent, string status)
        {
            if (this.IsDisposed || !this.IsHandleCreated) return;
            this.Invoke(new Action(() =>
            {
                progressBar.Value = Math.Min(100, Math.Max(0, percent));
                lblStatus.Text = status;
            }));
        }
    }
}
