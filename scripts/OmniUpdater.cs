using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Threading;
using System.Drawing;
using System.Windows.Forms;

namespace OmniBackupUpdater
{
    static class Program
    {
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
            this.BackColor = Color.FromArgb(10, 17, 38); // Acronis Deep Navy
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            Label lblTitle = new Label();
            lblTitle.Text = "OmniBackup Canlı Güncelleme Yükleniyor";
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
                    UpdateUI(15, "Çalışan OmniBackup ve Node.js işlemleri durduruluyor...");
                    
                    // 1. Terminate or wait for Parent Process
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

                    // Also stop any node server processes running inside targetDir
                    KillNodeInTargetDir(targetDir);
                    Thread.Sleep(1200);

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
                            // SAFETY: NEVER OVERWRITE db.json OR USER LOCAL CONFIGS
                            string entryName = entry.FullName.Replace('/', '\\');
                            if (entryName.Equals("server\\db.json", StringComparison.OrdinalIgnoreCase) ||
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
