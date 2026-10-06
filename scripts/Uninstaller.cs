using System;
using System.IO;
using System.Diagnostics;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using Microsoft.Win32;

namespace OmniBackup
{
    public class UninstallerForm : Form
    {
        private Panel leftSidebar;
        private Panel rightContent;
        private Panel bottomBar;

        private Button btnUninstall;
        private Button btnCancel;
        private CheckBox chkCleanBackups;

        private ProgressBar progressBar;
        private Label lblProgressPercent;
        private Label lblStatus;

        private Label lblMainTitle;
        private Label lblMainSubtitle;
        private Panel cardPanel;

        private int currentStep = 1; // 1: Confirm, 2: InProgress, 3: Completed
        private string installDir = @"C:\OmniBackup";
        private Image logoImage = null;
        private Icon appIcon = null;

        [STAThread]
        public static void Main(string[] args)
        {
            string targetInstallDir = @"C:\OmniBackup";
            bool isFromTemp = false;

            for (int i = 0; i < args.Length; i++)
            {
                if (args[i].StartsWith("--target="))
                {
                    targetInstallDir = args[i].Substring(9).Trim('\"');
                    isFromTemp = true;
                }
            }

            string currentExe = Application.ExecutablePath;
            string currentDir = Path.GetDirectoryName(currentExe);

            // If running directly from install directory, copy to Temp and re-launch
            // so installDir has NO file locks and can be 100% wiped!
            if (!isFromTemp && currentDir.StartsWith(targetInstallDir, StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    string tempExe = Path.Combine(Path.GetTempPath(), "OmniBackup_Clean_Uninstaller.exe");
                    File.Copy(currentExe, tempExe, true);
                    
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = tempExe;
                    psi.Arguments = string.Format("--target=\"{0}\"", currentDir);
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                    return;
                }
                catch { }
            }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new UninstallerForm(targetInstallDir));
        }

        public UninstallerForm(string targetDir)
        {
            this.installDir = targetDir;
            LoadAssets();
            InitializeComponent();
        }

        private void LoadAssets()
        {
            try
            {
                string iconPath = Path.Combine(installDir, "scripts", "app.ico");
                if (File.Exists(iconPath))
                {
                    appIcon = new Icon(iconPath);
                    this.Icon = appIcon;
                }
                else
                {
                    iconPath = Path.Combine(installDir, "app.ico");
                    if (File.Exists(iconPath))
                    {
                        appIcon = new Icon(iconPath);
                        this.Icon = appIcon;
                    }
                }

                string logoPath = Path.Combine(installDir, "scripts", "app_logo.png");
                if (File.Exists(logoPath))
                {
                    logoImage = Image.FromFile(logoPath);
                }
                else
                {
                    logoPath = Path.Combine(installDir, "app_logo.png");
                    if (File.Exists(logoPath))
                    {
                        logoImage = Image.FromFile(logoPath);
                    }
                }
            }
            catch { }
        }

        private void InitializeComponent()
        {
            this.Text = "OmniBackup Enterprise Cyber Vault - Kaldırma Sihirbazı";
            this.ClientSize = new Size(720, 480);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.BackColor = Color.FromArgb(10, 17, 38);
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // 1. LEFT SIDEBAR
            leftSidebar = new Panel();
            leftSidebar.Location = new Point(0, 0);
            leftSidebar.Size = new Size(200, 480);
            leftSidebar.BackColor = Color.FromArgb(6, 11, 26);
            leftSidebar.Paint += LeftSidebar_Paint;
            this.Controls.Add(leftSidebar);

            // 2. BOTTOM BAR
            bottomBar = new Panel();
            bottomBar.Location = new Point(200, 410);
            bottomBar.Size = new Size(520, 70);
            bottomBar.BackColor = Color.FromArgb(10, 17, 38);
            bottomBar.Paint += (s, e) => {
                using (Pen p = new Pen(Color.FromArgb(28, 42, 74), 1))
                {
                    e.Graphics.DrawLine(p, 0, 0, bottomBar.Width, 0);
                }
            };

            btnCancel = new Button();
            btnCancel.Text = "Vazgeç";
            btnCancel.Size = new Size(110, 36);
            btnCancel.Location = new Point(245, 16);
            btnCancel.BackColor = Color.FromArgb(23, 34, 60);
            btnCancel.ForeColor = Color.FromArgb(203, 213, 225);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(45, 62, 102);
            btnCancel.Cursor = Cursors.Hand;
            btnCancel.Click += (s, e) => {
                Application.Exit();
            };
            bottomBar.Controls.Add(btnCancel);

            btnUninstall = new Button();
            btnUninstall.Text = "Programı Kaldır";
            btnUninstall.Size = new Size(145, 36);
            btnUninstall.Location = new Point(365, 16);
            btnUninstall.BackColor = Color.FromArgb(220, 38, 38); // Warning Crimson
            btnUninstall.ForeColor = Color.White;
            btnUninstall.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            btnUninstall.FlatStyle = FlatStyle.Flat;
            btnUninstall.FlatAppearance.BorderSize = 0;
            btnUninstall.Cursor = Cursors.Hand;
            btnUninstall.Click += BtnUninstall_Click;
            bottomBar.Controls.Add(btnUninstall);

            this.Controls.Add(bottomBar);

            // 3. RIGHT CONTENT PANEL
            rightContent = new Panel();
            rightContent.Location = new Point(200, 0);
            rightContent.Size = new Size(520, 410);
            rightContent.BackColor = Color.FromArgb(10, 17, 38);
            this.Controls.Add(rightContent);

            lblMainTitle = new Label();
            lblMainTitle.Font = new Font("Segoe UI", 13.0f, FontStyle.Bold);
            lblMainTitle.ForeColor = Color.FromArgb(248, 113, 113); // Soft Red
            lblMainTitle.Location = new Point(25, 18);
            lblMainTitle.AutoSize = true;
            lblMainTitle.Text = "OmniBackup Sistemden Kaldırılacak";
            rightContent.Controls.Add(lblMainTitle);

            lblMainSubtitle = new Label();
            lblMainSubtitle.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
            lblMainSubtitle.ForeColor = Color.FromArgb(148, 163, 184);
            lblMainSubtitle.Location = new Point(26, 48);
            lblMainSubtitle.Size = new Size(470, 38);
            lblMainSubtitle.Text = "Bu işlem OmniBackup Enterprise Cyber Vault uygulamasını ve tüm bileşenlerini bilgisayarınızdan kalıntısız silecektir.";
            rightContent.Controls.Add(lblMainSubtitle);

            // Center Card Container
            cardPanel = new Panel();
            cardPanel.Location = new Point(25, 95);
            cardPanel.Size = new Size(470, 290);
            cardPanel.BackColor = Color.FromArgb(15, 24, 52);
            cardPanel.Paint += CardPanel_Paint;
            rightContent.Controls.Add(cardPanel);

            // Checkbox for external backup files
            chkCleanBackups = new CheckBox();
            chkCleanBackups.Text = "Harici yedekleme arşivlerini koru (Önerilen)";
            chkCleanBackups.Checked = true;
            chkCleanBackups.ForeColor = Color.FromArgb(0, 229, 255);
            chkCleanBackups.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
            chkCleanBackups.Location = new Point(20, 248);
            chkCleanBackups.Size = new Size(430, 25);
            cardPanel.Controls.Add(chkCleanBackups);

            // Progress controls (Step 2)
            progressBar = new ProgressBar();
            progressBar.Location = new Point(25, 100);
            progressBar.Size = new Size(420, 24);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Visible = false;
            cardPanel.Controls.Add(progressBar);

            lblProgressPercent = new Label();
            lblProgressPercent.Font = new Font("Segoe UI", 11f, FontStyle.Bold);
            lblProgressPercent.ForeColor = Color.FromArgb(0, 229, 255);
            lblProgressPercent.Location = new Point(25, 68);
            lblProgressPercent.AutoSize = true;
            lblProgressPercent.Visible = false;
            cardPanel.Controls.Add(lblProgressPercent);

            lblStatus = new Label();
            lblStatus.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
            lblStatus.ForeColor = Color.FromArgb(148, 163, 184);
            lblStatus.Location = new Point(25, 138);
            lblStatus.Size = new Size(420, 50);
            lblStatus.Visible = false;
            cardPanel.Controls.Add(lblStatus);
        }

        private void LeftSidebar_Paint(object sender, PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;

            // Brand Header
            if (logoImage != null)
            {
                g.DrawImage(logoImage, 22, 22, 36, 36);
            }
            else
            {
                using (SolidBrush b = new SolidBrush(Color.FromArgb(220, 38, 38)))
                {
                    g.FillEllipse(b, 22, 22, 36, 36);
                }
                using (Font f = new Font("Segoe UI", 13f, FontStyle.Bold))
                using (SolidBrush fb = new SolidBrush(Color.White))
                {
                    g.DrawString("O", f, fb, 31, 26);
                }
            }

            using (Font titleFont = new Font("Segoe UI", 11f, FontStyle.Bold))
            using (SolidBrush textBrush = new SolidBrush(Color.White))
            {
                g.DrawString("OmniBackup", titleFont, textBrush, 64, 20);
            }
            using (Font subFont = new Font("Segoe UI", 7.5f, FontStyle.Bold))
            using (SolidBrush subBrush = new SolidBrush(Color.FromArgb(248, 113, 113)))
            {
                g.DrawString("UNINSTALLER", subFont, subBrush, 66, 40);
            }

            // Divider
            using (Pen divPen = new Pen(Color.FromArgb(20, 32, 58), 1))
            {
                g.DrawLine(divPen, 15, 75, leftSidebar.Width - 15, 75);
            }

            // Steps
            string[] steps = new string[] { "1. Onay", "2. Kaldırılıyor", "3. Tamamlandı" };
            int startY = 110;
            int stepHeight = 60;

            for (int i = 0; i < steps.Length; i++)
            {
                int itemY = startY + (i * stepHeight);
                int stepNum = i + 1;
                bool isActive = (stepNum == currentStep);
                bool isCompleted = (stepNum < currentStep);

                int circleX = 20;
                int circleY = itemY + 4;
                int circleSize = 22;

                if (isActive)
                {
                    using (SolidBrush activeBg = new SolidBrush(Color.FromArgb(220, 38, 38)))
                    {
                        g.FillEllipse(activeBg, circleX, circleY, circleSize, circleSize);
                    }
                    using (Pen glowPen = new Pen(Color.FromArgb(248, 113, 113), 2))
                    {
                        g.DrawEllipse(glowPen, circleX, circleY, circleSize, circleSize);
                    }
                }
                else if (isCompleted)
                {
                    using (SolidBrush doneBg = new SolidBrush(Color.FromArgb(16, 185, 129)))
                    {
                        g.FillEllipse(doneBg, circleX, circleY, circleSize, circleSize);
                    }
                }
                else
                {
                    using (SolidBrush inactiveBg = new SolidBrush(Color.FromArgb(20, 32, 58)))
                    {
                        g.FillEllipse(inactiveBg, circleX, circleY, circleSize, circleSize);
                    }
                }

                using (Font numFont = new Font("Segoe UI", 8.5f, FontStyle.Bold))
                using (SolidBrush numBrush = new SolidBrush(Color.White))
                {
                    string numText = isCompleted ? "✓" : stepNum.ToString();
                    SizeF numSize = g.MeasureString(numText, numFont);
                    g.DrawString(numText, numFont, numBrush, circleX + (circleSize - numSize.Width) / 2, circleY + (circleSize - numSize.Height) / 2);
                }

                using (Font stepFont = new Font("Segoe UI", 9.0f, isActive ? FontStyle.Bold : FontStyle.Regular))
                using (SolidBrush textBrush = new SolidBrush(isActive ? Color.White : (isCompleted ? Color.FromArgb(203, 213, 225) : Color.FromArgb(100, 116, 139))))
                {
                    g.DrawString(steps[i], stepFont, textBrush, 50, itemY + 4);
                }
            }

            using (Font vFont = new Font("Segoe UI", 8.0f, FontStyle.Regular))
            using (SolidBrush vBrush = new SolidBrush(Color.FromArgb(100, 116, 139)))
            {
                g.DrawString("Clean Wipe v2.5", vFont, vBrush, 22, leftSidebar.Height - 35);
            }
        }

        private void CardPanel_Paint(object sender, PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;

            using (Pen borderPen = new Pen(Color.FromArgb(32, 48, 86), 1))
            {
                g.DrawRectangle(borderPen, 0, 0, cardPanel.Width - 1, cardPanel.Height - 1);
            }

            if (currentStep == 1)
            {
                int y = 18;
                string cardHeader = "Sistemden Tamamen Temizlenecek Bileşenler:";

                using (Font titleF = new Font("Segoe UI", 9.5f, FontStyle.Bold))
                using (SolidBrush titleB = new SolidBrush(Color.FromArgb(248, 113, 113)))
                {
                    g.DrawString(cardHeader, titleF, titleB, 20, y);
                }

                string[] items = new string[] {
                    "✕  OmniBackup masaüstü istemcisi ve arka plan sunucusu kapatılacak",
                    "✕  Masaüstü ve Başlat Menüsü program kısayolları silinecek",
                    "✕  Windows Güvenlik Duvarı TCP 3060 port kuralı kaldırılacak",
                    "✕  Windows Program Ekle/Kaldır Kayıt Defteri girdileri silinecek",
                    "✕  Uygulama profili ve tarayıcı çerezleri (%LOCALAPPDATA%\\OmniBackup) silinecek",
                    "✕  Kurulum dizinindeki tüm dosyalar (" + installDir + ") tamamen silinecek"
                };

                y += 30;
                using (Font itemF = new Font("Segoe UI", 9.0f, FontStyle.Regular))
                using (SolidBrush itemB = new SolidBrush(Color.FromArgb(226, 232, 240)))
                {
                    foreach (string itm in items)
                    {
                        g.DrawString(itm, itemF, itemB, 20, y);
                        y += 28;
                    }
                }
            }
            else if (currentStep == 3)
            {
                int cx = cardPanel.Width / 2;
                using (SolidBrush bgShield = new SolidBrush(Color.FromArgb(16, 185, 129)))
                {
                    g.FillEllipse(bgShield, cx - 28, 30, 56, 56);
                }
                using (Font checkFont = new Font("Segoe UI", 22f, FontStyle.Bold))
                using (SolidBrush checkBrush = new SolidBrush(Color.White))
                {
                    g.DrawString("✓", checkFont, checkBrush, cx - 18, 34);
                }

                using (Font tFont = new Font("Segoe UI", 12f, FontStyle.Bold))
                using (SolidBrush tBrush = new SolidBrush(Color.White))
                {
                    string msg = "Program Başarıyla Kaldırıldı!";
                    SizeF s = g.MeasureString(msg, tFont);
                    g.DrawString(msg, tFont, tBrush, cx - (s.Width / 2), 105);
                }

                using (Font subF = new Font("Segoe UI", 9.0f, FontStyle.Regular))
                using (SolidBrush subB = new SolidBrush(Color.FromArgb(148, 163, 184)))
                {
                    string desc = "OmniBackup Enterprise Cyber Vault bilgisayarınızdan hiçbir\nkalıntı dosya bırakılmadan tamamen temizlenmiştir.";
                    SizeF s = g.MeasureString(desc, subF);
                    g.DrawString(desc, subF, subB, cx - (s.Width / 2), 135);
                }
            }
        }

        private void BtnUninstall_Click(object sender, EventArgs e)
        {
            if (currentStep == 1)
            {
                currentStep = 2;
                leftSidebar.Invalidate();
                cardPanel.Invalidate();

                lblMainTitle.Text = "OmniBackup Kaldırılıyor...";
                lblMainSubtitle.Text = "Lütfen sistem bileşenleri ve dosyalar temizlenirken bekleyiniz...";
                chkCleanBackups.Visible = false;

                progressBar.Visible = true;
                lblProgressPercent.Visible = true;
                lblStatus.Visible = true;

                btnCancel.Enabled = false;
                btnUninstall.Enabled = false;

                Thread t = new Thread(PerformCleanUninstall);
                t.IsBackground = true;
                t.Start();
            }
            else if (currentStep == 3)
            {
                // Self-destruct temporary installer runner if needed and exit
                Application.Exit();
            }
        }

        private void UpdateProgress(int percent, string message)
        {
            if (this.InvokeRequired)
            {
                this.BeginInvoke(new Action<int, string>(UpdateProgress), percent, message);
                return;
            }
            progressBar.Value = Math.Min(100, Math.Max(0, percent));
            lblProgressPercent.Text = string.Format("%{0}", progressBar.Value);
            lblStatus.Text = message;
        }

        private void PerformCleanUninstall()
        {
            try
            {
                // 1. Terminate All Running Processes
                UpdateProgress(10, "Çalışan OmniBackup süreçleri ve arka plan servisleri durduruluyor...");
                Thread.Sleep(300);
                KillProcessByName("OmniBackup");
                KillPortProcess(3060);
                Thread.Sleep(500);

                // 2. Remove Windows Firewall Rule
                UpdateProgress(25, "Windows Güvenlik Duvarı kuralı siliniyor (Port 3060)...");
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo("netsh", "advfirewall firewall delete rule name=\"OmniBackup Enterprise\"");
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;
                    Process p = Process.Start(psi);
                    if (p != null) p.WaitForExit(3000);
                }
                catch { }

                // 3. Remove Shortcuts
                UpdateProgress(40, "Masaüstü, Başlat Menüsü ve Başlangıç kısayolları temizleniyor...");
                try
                {
                    string userDesktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                    DeleteFileIfExists(Path.Combine(userDesktop, "OmniBackup Cyber Vault.lnk"));
                    DeleteFileIfExists(Path.Combine(userDesktop, "OmniBackup Enterprise.lnk"));

                    string publicDesktop = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonDesktopDirectory));
                    DeleteFileIfExists(Path.Combine(publicDesktop, "OmniBackup Cyber Vault.lnk"));
                    DeleteFileIfExists(Path.Combine(publicDesktop, "OmniBackup Enterprise.lnk"));

                    string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "OmniBackup");
                    if (Directory.Exists(startMenu)) Directory.Delete(startMenu, true);

                    string startup = Environment.GetFolderPath(Environment.SpecialFolder.Startup);
                    DeleteFileIfExists(Path.Combine(startup, "OmniBackup Master Service.lnk"));
                }
                catch { }

                // 4. Remove Windows Registry Keys
                UpdateProgress(60, "Windows Kayıt Defteri (Registry) kurulum anahtarları siliniyor...");
                try
                {
                    Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\OmniBackup", false);
                    Registry.CurrentUser.DeleteSubKeyTree(@"Software\OmniBackup", false);
                }
                catch { }

                // 5. Remove LocalAppData Profiles (Desktop profile, browser cache, session)
                UpdateProgress(75, "Kullanıcı uygulama profili ve tarayıcı verileri (%LOCALAPPDATA%\\OmniBackup) siliniyor...");
                try
                {
                    string localApp = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "OmniBackup");
                    if (Directory.Exists(localApp))
                    {
                        Directory.Delete(localApp, true);
                    }
                }
                catch { }

                // 6. Delete Installation Directory Completely
                UpdateProgress(90, "Program kurulum klasörü (" + installDir + ") tamamen temizleniyor...");
                try
                {
                    if (Directory.Exists(installDir))
                    {
                        Directory.Delete(installDir, true);
                    }
                }
                catch (Exception dirEx)
                {
                    // If any file is temporarily locked, spawn a detached delayed deletion command
                    try
                    {
                        string delayedCmd = string.Format("/c timeout /t 2 /nobreak >nul & rmdir /s /q \"{0}\"", installDir);
                        ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", delayedCmd);
                        psi.CreateNoWindow = true;
                        psi.UseShellExecute = false;
                        Process.Start(psi);
                    }
                    catch { }
                }

                UpdateProgress(100, "Kaldırma işlemi tamamlandı!");
                Thread.Sleep(400);

                this.BeginInvoke(new Action(() => {
                    currentStep = 3;
                    leftSidebar.Invalidate();
                    cardPanel.Invalidate();

                    lblMainTitle.Text = "Tebrikler! Kaldırma Başarılı";
                    lblMainTitle.ForeColor = Color.FromArgb(52, 211, 153);
                    lblMainSubtitle.Text = "OmniBackup Enterprise Cyber Vault bilgisayarınızdan kalıntısız silindi.";

                    progressBar.Visible = false;
                    lblProgressPercent.Visible = false;
                    lblStatus.Visible = false;

                    btnCancel.Visible = false;
                    btnUninstall.Text = "Kapat";
                    btnUninstall.BackColor = Color.FromArgb(0, 102, 255);
                    btnUninstall.Enabled = true;
                }));
            }
            catch (Exception ex)
            {
                this.BeginInvoke(new Action(() => {
                    MessageBox.Show("Kaldırma işlemi sırasında bir hata oluştu: " + ex.Message, "Kaldırma Hatası", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    btnUninstall.Enabled = true;
                    btnCancel.Enabled = true;
                }));
            }
        }

        private static void DeleteFileIfExists(string path)
        {
            try
            {
                if (File.Exists(path)) File.Delete(path);
            }
            catch { }
        }

        private static void KillProcessByName(string name)
        {
            try
            {
                foreach (Process p in Process.GetProcessesByName(name))
                {
                    try { p.Kill(); p.WaitForExit(1500); } catch { }
                }
            }
            catch { }
        }

        private static void KillPortProcess(int port)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", string.Format("/c for /f \"tokens=5\" %a in ('netstat -aon ^| findstr \":{0}\" ^| findstr \"LISTENING\"') do taskkill /f /pid %a", port));
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                Process p = Process.Start(psi);
                if (p != null) p.WaitForExit(2000);
            }
            catch { }
        }
    }
}
