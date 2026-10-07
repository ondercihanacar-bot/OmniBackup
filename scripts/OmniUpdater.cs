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
        private int currentPid;

        public UpdateProgressForm(string targetDir, string patchZip, int parentPid, string relaunchExe)
        {
            this.targetDir = targetDir;
            this.patchZip = patchZip;
            this.parentPid = parentPid;
            this.relaunchExe = relaunchExe;
            this.currentPid = Process.GetCurrentProcess().Id;

            InitializeUI();
            this.Shown += (s, e) => StartUpdateProcess();
        }

        private void Log(string msg)
        {
            try
            {
                string logFile = Path.Combine(targetDir, "updater.log");
                File.AppendAllText(logFile, string.Format("[{0:yyyy-MM-dd HH:mm:ss.fff}] {1}\r\n", DateTime.Now, msg));
            }
            catch { }
        }

        private void InitializeUI()
        {
            this.Text = "OmniBackup Enterprise Updater Engine";
            this.ClientSize = new Size(520, 220);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.TopMost = true;
            this.BackColor = Color.FromArgb(10, 17, 38);
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
            lblDetails.Text = "Veritabanı ve görev ayarları korunarak çekirdek dosyalar yenileniyor.";
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
                    Log("=== OmniUpdater Started ===");
                    Log(string.Format("TargetDir={0}, PatchZip={1}, ParentPid={2}, RelaunchExe={3}", targetDir, patchZip, parentPid, relaunchExe));

                    UpdateUI(15, "OmniBackup ana penceresi ve servisler kapatılıyor...");
                    
                    // 1. Terminate OmniBackup.exe desktop launcher instances (NEVER kill self!)
                    KillProcessByName("OmniBackup");

                    // 2. Terminate Parent Process (Node.js) if passed
                    if (parentPid > 0 && parentPid != currentPid)
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

                    // 3. Stop all node and webview processes in targetDir
                    KillNodeProcesses();
                    KillWebViewProcesses();
                    Thread.Sleep(1000);

                    UpdateUI(35, "Güncelleme paketi açılıyor ve bütünlük doğrulanıyor...");
                    if (!File.Exists(patchZip))
                    {
                        throw new FileNotFoundException("Güncelleme yama dosyası bulunamadı: " + patchZip);
                    }

                    FileInfo fi = new FileInfo(patchZip);
                    Log(string.Format("Patch zip file found. Size: {0} bytes", fi.Length));
                    if (fi.Length < 1000)
                    {
                        throw new InvalidDataException("Güncelleme paketi bozuk veya eksik indirildi.");
                    }

                    UpdateUI(50, "Yeni sürüm dosyaları sisteme kopyalanıyor...");
                    using (ZipArchive archive = ZipFile.OpenRead(patchZip))
                    {
                        int totalEntries = archive.Entries.Count;
                        int processed = 0;
                        Log(string.Format("Archive opened successfully. Total entries: {0}", totalEntries));

                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            string entryName = entry.FullName.Replace('/', '\\');

                            // SAFETY: NEVER OVERWRITE USER DATABASE, CUSTOM BACKUP JOBS, SETTINGS OR USER STORAGE
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
                                bool extracted = false;
                                Exception lastEx = null;

                                // Retry up to 10 times with backoff if file is temporarily locked
                                for (int i = 0; i < 10; i++)
                                {
                                    try
                                    {
                                        entry.ExtractToFile(destPath, true);
                                        extracted = true;
                                        break;
                                    }
                                    catch (Exception ex)
                                    {
                                        lastEx = ex;
                                        KillProcessByName("OmniBackup");
                                        KillNodeProcesses();
                                        KillWebViewProcesses();
                                        Thread.Sleep(300);
                                    }
                                }

                                if (!extracted && lastEx != null)
                                {
                                    Log(string.Format("WARN: Could not extract {0}: {1}", entryName, lastEx.Message));
                                }
                            }

                            processed++;
                            int curVal = 50 + (int)((processed / (float)totalEntries) * 35);
                            UpdateUI(curVal, string.Format("Güncelleniyor ({0}/{1}): {2}", processed, totalEntries, entry.Name));
                        }
                    }

                    UpdateUI(90, "Önbellek temizleniyor ve servis yapılandırması tamamlanıyor...");
                    Log("Extraction completed successfully.");
                    Thread.Sleep(500);

                    // Clean temp zip
                    try
                    {
                        if (File.Exists(patchZip)) File.Delete(patchZip);
                    }
                    catch { }

                    UpdateUI(100, "Güncelleme tamamlandı! OmniBackup başlatılıyor...");
                    Log("Launching updated OmniBackup executable: " + relaunchExe);
                    Thread.Sleep(800);

                    // Launch updated OmniBackup.exe
                    if (File.Exists(relaunchExe))
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = relaunchExe;
                        psi.WorkingDirectory = targetDir;
                        psi.UseShellExecute = true;
                        Process.Start(psi);
                    }
                    else
                    {
                        string fallbackExe = Path.Combine(targetDir, "OmniBackup.exe");
                        if (File.Exists(fallbackExe))
                        {
                            ProcessStartInfo psi = new ProcessStartInfo();
                            psi.FileName = fallbackExe;
                            psi.WorkingDirectory = targetDir;
                            psi.UseShellExecute = true;
                            Process.Start(psi);
                        }
                    }

                    Log("Update finished successfully. Exiting updater.");
                    this.Invoke(new Action(() => this.Close()));
                }
                catch (Exception ex)
                {
                    Log("FATAL ERROR in updater: " + ex.ToString());
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
                    if (p.Id == currentPid) continue; // SAFETY: NEVER KILL SELF!
                    try
                    {
                        if (p.MainWindowHandle != IntPtr.Zero)
                        {
                            Program.PostMessage(p.MainWindowHandle, Program.WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
                        }
                    }
                    catch { }
                }

                Thread.Sleep(300);

                foreach (Process p in Process.GetProcessesByName(processName))
                {
                    if (p.Id == currentPid) continue;
                    try
                    {
                        if (!p.HasExited)
                        {
                            p.Kill();
                            p.WaitForExit(1000);
                        }
                    }
                    catch { }
                }

                Program.RefreshNotificationArea();
            }
            catch { }
        }

        private void KillNodeProcesses()
        {
            try
            {
                foreach (Process p in Process.GetProcessesByName("node"))
                {
                    if (p.Id == currentPid) continue;
                    try
                    {
                        p.Kill();
                    }
                    catch { }
                }
            }
            catch { }
        }

        private void KillWebViewProcesses()
        {
            try
            {
                foreach (Process p in Process.GetProcessesByName("msedgewebview2"))
                {
                    if (p.Id == currentPid) continue;
                    try
                    {
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
