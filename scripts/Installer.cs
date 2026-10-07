using System;
using System.IO;
using System.IO.Compression;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Windows.Forms;
using System.Reflection;
using System.Diagnostics;
using System.Threading;
using System.Runtime.InteropServices;
using System.Security.Principal;
using Microsoft.Win32;

namespace OmniBackupInstaller
{
    static class Program
    {
        [DllImport("user32.dll")]
        private static extern bool SetProcessDPIAware();

        [STAThread]
        static void Main()
        {
            try
            {
                if (Environment.OSVersion.Version.Major >= 6)
                {
                    SetProcessDPIAware();
                }
            }
            catch { }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new InstallerForm());
        }
    }

    public class InstallerForm : Form
    {
        private Panel leftSidebar;
        private Panel rightContent;
        private Panel bottomBar;

        private Button btnNext;
        private Button btnCancel;
        private Button btnBrowse;
        private Button btnLangToggle;
        private TextBox txtInstallPath;
        private Label lblPathHeader;
        private Label lblPathHint;

        private CheckBox chkDesktopShortcut;
        private CheckBox chkStartMenuShortcut;
        private CheckBox chkFirewallRule;
        private CheckBox chkLaunchNow;

        private ProgressBar progressBar;
        private Label lblProgressPercent;
        private Label lblStatus;

        private Label lblMainTitle;
        private Label lblMainSubtitle;
        private Panel cardPanel;

        private int currentStep = 1;
        private string currentLang = "tr"; // "tr" or "en"
        private string defaultPath = @"C:\OmniBackup";
        private Image logoImage = null;
        private Icon appIcon = null;

        public InstallerForm()
        {
            defaultPath = @"C:\OmniBackup";
            LoadAssets();
            InitializeComponent();
        }

        private void DetermineDefaultPath()
        {
            try
            {
                string pfPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "OmniBackup");
                string localAppPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "OmniBackup");
                string cPath = @"C:\OmniBackup";

                // If already installed somewhere, upgrade the existing location
                if (File.Exists(Path.Combine(pfPath, "OmniBackup.exe")))
                {
                    defaultPath = pfPath;
                    return;
                }
                if (File.Exists(Path.Combine(localAppPath, "OmniBackup.exe")))
                {
                    defaultPath = localAppPath;
                    return;
                }
                if (File.Exists(Path.Combine(cPath, "OmniBackup.exe")))
                {
                    defaultPath = cPath;
                    return;
                }

                WindowsIdentity identity = WindowsIdentity.GetCurrent();
                WindowsPrincipal principal = new WindowsPrincipal(identity);
                bool isAdmin = principal.IsInRole(WindowsBuiltInRole.Administrator);

                if (isAdmin)
                {
                    defaultPath = pfPath;
                }
                else
                {
                    defaultPath = localAppPath;
                }
            }
            catch
            {
                defaultPath = @"C:\OmniBackup";
            }
        }

        private void LoadAssets()
        {
            try
            {
                string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scripts", "app.ico");
                if (File.Exists(iconPath))
                {
                    appIcon = new Icon(iconPath);
                    this.Icon = appIcon;
                }
                else
                {
                    string rootIcon = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.ico");
                    if (File.Exists(rootIcon))
                    {
                        appIcon = new Icon(rootIcon);
                        this.Icon = appIcon;
                    }
                }
            }
            catch { }

            try
            {
                string logoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scripts", "app_logo.png");
                if (File.Exists(logoPath))
                {
                    logoImage = Image.FromFile(logoPath);
                }
                else
                {
                    string rootLogo = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app_logo.png");
                    if (File.Exists(rootLogo))
                    {
                        logoImage = Image.FromFile(rootLogo);
                    }
                }
            }
            catch { }
        }

        private void InitializeComponent()
        {
            this.Text = "OmniBackup Enterprise Cyber Vault - Setup Wizard";
            this.ClientSize = new Size(760, 520);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.BackColor = Color.FromArgb(10, 17, 38); // Acronis Deep Navy
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // 1. LEFT SIDEBAR (Fixed Left, No Dock Collision)
            leftSidebar = new Panel();
            leftSidebar.Location = new Point(0, 0);
            leftSidebar.Size = new Size(220, 520);
            leftSidebar.BackColor = Color.FromArgb(6, 11, 26);
            leftSidebar.Paint += LeftSidebar_Paint;
            this.Controls.Add(leftSidebar);

            // 2. BOTTOM BAR (Fixed Bottom Right, No Dock Collision)
            bottomBar = new Panel();
            bottomBar.Location = new Point(220, 445);
            bottomBar.Size = new Size(540, 75);
            bottomBar.BackColor = Color.FromArgb(10, 17, 38);
            bottomBar.Paint += (s, e) => {
                using (Pen p = new Pen(Color.FromArgb(28, 42, 74), 1))
                {
                    e.Graphics.DrawLine(p, 0, 0, bottomBar.Width, 0);
                }
            };

            btnCancel = new Button();
            btnCancel.Text = "İptal";
            btnCancel.Size = new Size(110, 36);
            btnCancel.Location = new Point(275, 18);
            btnCancel.BackColor = Color.FromArgb(23, 34, 60);
            btnCancel.ForeColor = Color.FromArgb(203, 213, 225);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(45, 62, 102);
            btnCancel.Cursor = Cursors.Hand;
            btnCancel.Click += (s, e) => {
                string exitMsg = currentLang == "tr" ? "Kurulumdan çıkmak istediğinize emin misiniz?" : "Are you sure you want to cancel the installation?";
                string exitTitle = currentLang == "tr" ? "OmniBackup Kurulum" : "OmniBackup Setup";
                if (currentStep < 3 && MessageBox.Show(exitMsg, exitTitle, MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
                {
                    Application.Exit();
                }
            };
            bottomBar.Controls.Add(btnCancel);

            btnNext = new Button();
            btnNext.Text = "Kuruluma Başla >";
            btnNext.Size = new Size(135, 36);
            btnNext.Location = new Point(395, 18);
            btnNext.BackColor = Color.FromArgb(0, 102, 255); // Royal Blue
            btnNext.ForeColor = Color.White;
            btnNext.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            btnNext.FlatStyle = FlatStyle.Flat;
            btnNext.FlatAppearance.BorderSize = 0;
            btnNext.Cursor = Cursors.Hand;
            btnNext.Click += BtnNext_Click;
            bottomBar.Controls.Add(btnNext);

            this.Controls.Add(bottomBar);

            // 3. RIGHT CONTENT PANEL (Fixed Top Right, Starts at X=220)
            rightContent = new Panel();
            rightContent.Location = new Point(220, 0);
            rightContent.Size = new Size(540, 445);
            rightContent.BackColor = Color.FromArgb(10, 17, 38);
            this.Controls.Add(rightContent);

            // Language Toggle Button (Top Right)
            btnLangToggle = new Button();
            btnLangToggle.Text = "🇹🇷 TR | EN 🇬🇧";
            btnLangToggle.Size = new Size(110, 28);
            btnLangToggle.Location = new Point(405, 18);
            btnLangToggle.BackColor = Color.FromArgb(23, 34, 60);
            btnLangToggle.ForeColor = Color.FromArgb(0, 229, 255);
            btnLangToggle.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
            btnLangToggle.FlatStyle = FlatStyle.Flat;
            btnLangToggle.FlatAppearance.BorderColor = Color.FromArgb(45, 62, 102);
            btnLangToggle.Cursor = Cursors.Hand;
            btnLangToggle.Click += (s, e) => {
                currentLang = (currentLang == "tr") ? "en" : "tr";
                ShowStep(currentStep);
            };
            rightContent.Controls.Add(btnLangToggle);

            // Header Labels
            lblMainTitle = new Label();
            lblMainTitle.Font = new Font("Segoe UI", 13.5f, FontStyle.Bold);
            lblMainTitle.ForeColor = Color.FromArgb(0, 229, 255);
            lblMainTitle.Location = new Point(25, 18);
            lblMainTitle.AutoSize = true;
            rightContent.Controls.Add(lblMainTitle);

            lblMainSubtitle = new Label();
            lblMainSubtitle.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
            lblMainSubtitle.ForeColor = Color.FromArgb(148, 163, 184);
            lblMainSubtitle.Location = new Point(26, 48);
            lblMainSubtitle.Size = new Size(490, 40);
            rightContent.Controls.Add(lblMainSubtitle);

            // Center Card Container
            cardPanel = new Panel();
            cardPanel.Location = new Point(25, 95);
            cardPanel.Size = new Size(490, 335);
            cardPanel.BackColor = Color.FromArgb(15, 24, 52);
            cardPanel.Paint += CardPanel_Paint;
            rightContent.Controls.Add(cardPanel);

            // Path Controls (Step 2)
            lblPathHeader = new Label();
            lblPathHeader.ForeColor = Color.FromArgb(203, 213, 225);
            lblPathHeader.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            lblPathHeader.Location = new Point(20, 18);
            lblPathHeader.AutoSize = true;
            cardPanel.Controls.Add(lblPathHeader);

            txtInstallPath = new TextBox();
            txtInstallPath.Text = defaultPath;
            txtInstallPath.Size = new Size(350, 28);
            txtInstallPath.Location = new Point(20, 46);
            txtInstallPath.BackColor = Color.FromArgb(8, 14, 32);
            txtInstallPath.ForeColor = Color.White;
            txtInstallPath.Font = new Font("Segoe UI", 10.0f, FontStyle.Regular);
            txtInstallPath.BorderStyle = BorderStyle.FixedSingle;
            cardPanel.Controls.Add(txtInstallPath);

            btnBrowse = new Button();
            btnBrowse.Text = "Gözat...";
            btnBrowse.Size = new Size(90, 28);
            btnBrowse.Location = new Point(380, 46);
            btnBrowse.BackColor = Color.FromArgb(28, 42, 74);
            btnBrowse.ForeColor = Color.White;
            btnBrowse.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
            btnBrowse.FlatStyle = FlatStyle.Flat;
            btnBrowse.FlatAppearance.BorderColor = Color.FromArgb(45, 62, 102);
            btnBrowse.Cursor = Cursors.Hand;
            btnBrowse.Click += (s, e) => {
                using (FolderBrowserDialog fbd = new FolderBrowserDialog())
                {
                    fbd.Description = (currentLang == "tr") 
                        ? "OmniBackup kurulum dizinini seçiniz (Örn: C:\\ veya D:\\):" 
                        : "Select OmniBackup installation folder:";
                    fbd.RootFolder = Environment.SpecialFolder.MyComputer;
                    fbd.ShowNewFolderButton = true;
                    if (Directory.Exists(txtInstallPath.Text))
                    {
                        fbd.SelectedPath = txtInstallPath.Text;
                    }
                    else
                    {
                        fbd.SelectedPath = @"C:\";
                    }

                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        string chosen = fbd.SelectedPath.Trim();
                        if (!chosen.EndsWith("OmniBackup", StringComparison.OrdinalIgnoreCase))
                        {
                            if (chosen.EndsWith("\\") || chosen.EndsWith("/"))
                            {
                                chosen = chosen + "OmniBackup";
                            }
                            else
                            {
                                chosen = chosen + "\\OmniBackup";
                            }
                        }
                        txtInstallPath.Text = chosen;
                    }
                }
            };
            cardPanel.Controls.Add(btnBrowse);

            lblPathHint = new Label();
            lblPathHint.Text = "📁 Kurulum tüm program dosyalarını ve motoru bu klasör içerisine yükleyecektir.";
            lblPathHint.Location = new Point(20, 82);
            lblPathHint.Size = new Size(450, 22);
            lblPathHint.ForeColor = Color.FromArgb(0, 229, 255);
            lblPathHint.Font = new Font("Segoe UI", 8.5f, FontStyle.Italic);
            cardPanel.Controls.Add(lblPathHint);

            // Options Checkboxes (Step 2)
            chkDesktopShortcut = new CheckBox();
            chkDesktopShortcut.Checked = true;
            chkDesktopShortcut.Location = new Point(22, 115);
            chkDesktopShortcut.Size = new Size(440, 26);
            chkDesktopShortcut.ForeColor = Color.FromArgb(226, 232, 240);
            cardPanel.Controls.Add(chkDesktopShortcut);

            chkStartMenuShortcut = new CheckBox();
            chkStartMenuShortcut.Checked = true;
            chkStartMenuShortcut.Location = new Point(22, 150);
            chkStartMenuShortcut.Size = new Size(440, 26);
            chkStartMenuShortcut.ForeColor = Color.FromArgb(226, 232, 240);
            cardPanel.Controls.Add(chkStartMenuShortcut);

            chkFirewallRule = new CheckBox();
            chkFirewallRule.Checked = true;
            chkFirewallRule.Location = new Point(22, 185);
            chkFirewallRule.Size = new Size(440, 26);
            chkFirewallRule.ForeColor = Color.FromArgb(226, 232, 240);
            cardPanel.Controls.Add(chkFirewallRule);

            // Progress Controls (Step 3)
            progressBar = new ProgressBar();
            progressBar.Location = new Point(25, 110);
            progressBar.Size = new Size(440, 26);
            progressBar.Style = ProgressBarStyle.Continuous;
            cardPanel.Controls.Add(progressBar);

            lblProgressPercent = new Label();
            lblProgressPercent.Font = new Font("Segoe UI", 11f, FontStyle.Bold);
            lblProgressPercent.ForeColor = Color.FromArgb(0, 229, 255);
            lblProgressPercent.Location = new Point(25, 75);
            lblProgressPercent.AutoSize = true;
            cardPanel.Controls.Add(lblProgressPercent);

            lblStatus = new Label();
            lblStatus.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
            lblStatus.ForeColor = Color.FromArgb(148, 163, 184);
            lblStatus.Location = new Point(25, 148);
            lblStatus.Size = new Size(440, 50);
            cardPanel.Controls.Add(lblStatus);

            // Launch checkbox (Step 4)
            chkLaunchNow = new CheckBox();
            chkLaunchNow.Checked = true;
            chkLaunchNow.Location = new Point(35, 195);
            chkLaunchNow.Size = new Size(420, 28);
            chkLaunchNow.ForeColor = Color.FromArgb(0, 229, 255);
            chkLaunchNow.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            cardPanel.Controls.Add(chkLaunchNow);

            ShowStep(1);
        }

        private void LeftSidebar_Paint(object sender, PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;

            // Brand Header
            if (logoImage != null)
            {
                g.DrawImage(logoImage, 25, 22, 38, 38);
            }
            else
            {
                using (SolidBrush b = new SolidBrush(Color.FromArgb(0, 102, 255)))
                {
                    g.FillEllipse(b, 25, 22, 38, 38);
                }
                using (Font f = new Font("Segoe UI", 14f, FontStyle.Bold))
                using (SolidBrush fb = new SolidBrush(Color.White))
                {
                    g.DrawString("O", f, fb, 34, 25);
                }
            }

            using (Font titleFont = new Font("Segoe UI", 12f, FontStyle.Bold))
            using (SolidBrush textBrush = new SolidBrush(Color.White))
            {
                g.DrawString("OmniBackup", titleFont, textBrush, 70, 22);
            }
            using (Font subFont = new Font("Segoe UI", 8.0f, FontStyle.Bold))
            using (SolidBrush subBrush = new SolidBrush(Color.FromArgb(0, 229, 255)))
            {
                g.DrawString("CYBER VAULT", subFont, subBrush, 72, 42);
            }

            // Divider
            using (Pen divPen = new Pen(Color.FromArgb(20, 32, 58), 1))
            {
                g.DrawLine(divPen, 15, 75, leftSidebar.Width - 15, 75);
            }

            // Steps
            string[] stepsTr = new string[] { "1. Hoş Geldiniz", "2. Kurulum Hedefi", "3. Yükleme", "4. Tamamlandı" };
            string[] stepsEn = new string[] { "1. Welcome", "2. Destination", "3. Installing", "4. Finish" };
            string[] steps = (currentLang == "tr") ? stepsTr : stepsEn;

            int startY = 100;
            int stepHeight = 55;

            for (int i = 0; i < steps.Length; i++)
            {
                int itemY = startY + (i * stepHeight);
                int stepNum = i + 1;
                bool isActive = (stepNum == currentStep);
                bool isCompleted = (stepNum < currentStep);

                int circleX = 22;
                int circleY = itemY + 4;
                int circleSize = 22;

                if (isActive)
                {
                    using (SolidBrush activeBg = new SolidBrush(Color.FromArgb(0, 102, 255)))
                    {
                        g.FillEllipse(activeBg, circleX, circleY, circleSize, circleSize);
                    }
                    using (Pen glowPen = new Pen(Color.FromArgb(0, 229, 255), 2))
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
                    g.DrawString(steps[i], stepFont, textBrush, 55, itemY + 4);
                }
            }

            using (Font vFont = new Font("Segoe UI", 8.0f, FontStyle.Regular))
            using (SolidBrush vBrush = new SolidBrush(Color.FromArgb(100, 116, 139)))
            {
                g.DrawString("Enterprise v2.5 (x64)", vFont, vBrush, 25, leftSidebar.Height - 35);
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
                int y = 20;
                string[] featuresTr = new string[] {
                    "✓  Windows 10 / 11 ve Windows Server (64-bit) Tam Uyumluluk",
                    "✓  Microsoft VSS (Volume Shadow Copy) Canlı Snapshot Desteği",
                    "✓  Askeri Düzey AES-256 Şifreleme ve SHA-256 Veri Bütünlüğü",
                    "✓  MSSQL, PostgreSQL, Oracle RMAN Canlı Veritabanı Yedekleme",
                    "✓  Anti-Ransomware Heuristik Entropi Kalkanı & WORM Kilidi",
                    "✓  15 Günlük Ücretsiz Tam Demo Lisansı ve OmniHub Entegrasyonu"
                };

                string[] featuresEn = new string[] {
                    "✓  Full Windows 10 / 11 & Windows Server (64-bit) Compatibility",
                    "✓  Microsoft VSS (Volume Shadow Copy) Live Snapshot Support",
                    "✓  Military-Grade AES-256 Encryption & SHA-256 Hash Integrity",
                    "✓  MSSQL, PostgreSQL, Oracle RMAN Live Database Protection",
                    "✓  Anti-Ransomware Heuristic Entropy Shield & WORM Lock",
                    "✓  15-Day Free Full Demo License & OmniHub Cloud Integration"
                };

                string[] features = (currentLang == "tr") ? featuresTr : featuresEn;
                string cardHeader = (currentLang == "tr") ? "Doğrulanan Kurumsal Sistem Yetenekleri:" : "Verified Enterprise Capabilities:";

                using (Font titleF = new Font("Segoe UI", 9.5f, FontStyle.Bold))
                using (SolidBrush titleB = new SolidBrush(Color.FromArgb(0, 229, 255)))
                {
                    g.DrawString(cardHeader, titleF, titleB, 20, y);
                }

                y += 30;
                using (Font itemF = new Font("Segoe UI", 9.0f, FontStyle.Regular))
                using (SolidBrush itemB = new SolidBrush(Color.FromArgb(226, 232, 240)))
                {
                    foreach (string feat in features)
                    {
                        g.DrawString(feat, itemF, itemB, 20, y);
                        y += 28;
                    }
                }
            }
            else if (currentStep == 4)
            {
                int cx = cardPanel.Width / 2;
                using (SolidBrush bgShield = new SolidBrush(Color.FromArgb(16, 185, 129)))
                {
                    g.FillEllipse(bgShield, cx - 28, 20, 56, 56);
                }
                using (Font checkFont = new Font("Segoe UI", 22f, FontStyle.Bold))
                using (SolidBrush checkBrush = new SolidBrush(Color.White))
                {
                    g.DrawString("✓", checkFont, checkBrush, cx - 18, 24);
                }

                using (Font tFont = new Font("Segoe UI", 12f, FontStyle.Bold))
                using (SolidBrush tBrush = new SolidBrush(Color.White))
                {
                    string msg = (currentLang == "tr") ? "Kurulum Başarıyla Tamamlandı!" : "Installation Completed Successfully!";
                    SizeF s = g.MeasureString(msg, tFont);
                    g.DrawString(msg, tFont, tBrush, cx - (s.Width / 2), 90);
                }

                using (Font subF = new Font("Segoe UI", 9.0f, FontStyle.Regular))
                using (SolidBrush subB = new SolidBrush(Color.FromArgb(148, 163, 184)))
                {
                    string desc = (currentLang == "tr") 
                        ? "OmniBackup Cyber Vault merkezi yönetim konsolu hazır.\nMasaüstündeki kısayoldan dilediğiniz an erişebilirsiniz."
                        : "OmniBackup Cyber Vault central management console is ready.\nYou can access it anytime from the desktop shortcut.";
                    SizeF s = g.MeasureString(desc, subF);
                    g.DrawString(desc, subF, subB, cx - (s.Width / 2), 118);
                }
            }
        }

        private void ShowStep(int step)
        {
            currentStep = step;
            leftSidebar.Invalidate();
            cardPanel.Invalidate();

            btnCancel.Text = (currentLang == "tr") ? "İptal" : "Cancel";
            btnBrowse.Text = (currentLang == "tr") ? "Gözat..." : "Browse...";

            if (step == 1)
            {
                lblMainTitle.Text = (currentLang == "tr") ? "OmniBackup Enterprise Cyber Vault" : "OmniBackup Enterprise Cyber Vault";
                lblMainSubtitle.Text = (currentLang == "tr") 
                    ? "Kurumsal Merkezi Sunucu, İstemci ve SQL Veritabanı Yedekleme Sistemi"
                    : "Enterprise Centralized Server, Client and SQL Database Backup System";

                lblPathHeader.Visible = false;
                txtInstallPath.Visible = false;
                btnBrowse.Visible = false;
                if (lblPathHint != null) lblPathHint.Visible = false;
                chkDesktopShortcut.Visible = false;
                chkStartMenuShortcut.Visible = false;
                chkFirewallRule.Visible = false;

                progressBar.Visible = false;
                lblProgressPercent.Visible = false;
                lblStatus.Visible = false;
                chkLaunchNow.Visible = false;

                btnNext.Text = (currentLang == "tr") ? "Kuruluma Başla >" : "Start Setup >";
                btnCancel.Visible = true;
            }
            else if (step == 2)
            {
                lblMainTitle.Text = (currentLang == "tr") ? "Kurulum Konumu ve Tercihler" : "Setup Location & Preferences";
                lblMainSubtitle.Text = (currentLang == "tr")
                    ? "Lütfen kurulumun yapılacağı hedef dizini ve masaüstü seçeneklerini belirleyiniz."
                    : "Please specify target installation directory and shortcut options.";

                lblPathHeader.Text = (currentLang == "tr") ? "Kurulum Hedef Klasörü:" : "Destination Installation Folder:";
                if (lblPathHint != null)
                {
                    lblPathHint.Text = (currentLang == "tr")
                        ? "📁 Kurulum tüm program dosyalarını ve motoru bu klasör içerisine yükleyecektir."
                        : "📁 OmniBackup engine and application files will be installed inside this folder.";
                    lblPathHint.Visible = true;
                }
                chkDesktopShortcut.Text = (currentLang == "tr") ? "Masaüstüne 'OmniBackup Cyber Vault' kısayolu oluştur" : "Create 'OmniBackup Cyber Vault' shortcut on Desktop";
                chkStartMenuShortcut.Text = (currentLang == "tr") ? "Windows Başlat Menüsüne program simgesi ekle" : "Add shortcut to Windows Start Menu";
                chkFirewallRule.Text = (currentLang == "tr") ? "Windows Güvenlik Duvarında 3060 portunu otomatik aç" : "Automatically configure Windows Firewall for Port 3060";

                lblPathHeader.Visible = true;
                txtInstallPath.Visible = true;
                btnBrowse.Visible = true;
                chkDesktopShortcut.Visible = true;
                chkStartMenuShortcut.Visible = true;
                chkFirewallRule.Visible = true;

                progressBar.Visible = false;
                lblProgressPercent.Visible = false;
                lblStatus.Visible = false;
                chkLaunchNow.Visible = false;

                btnNext.Text = (currentLang == "tr") ? "Şimdi Kur" : "Install Now";
                btnCancel.Visible = true;
            }
            else if (step == 3)
            {
                lblMainTitle.Text = (currentLang == "tr") ? "OmniBackup Kuruluyor..." : "Installing OmniBackup...";
                lblMainSubtitle.Text = (currentLang == "tr")
                    ? "Dosyalar açılıyor, arka plan servisleri ve kısayollar yapılandırılıyor..."
                    : "Extracting packages, configuring background services and shortcuts...";

                lblPathHeader.Visible = false;
                txtInstallPath.Visible = false;
                btnBrowse.Visible = false;
                if (lblPathHint != null) lblPathHint.Visible = false;
                chkDesktopShortcut.Visible = false;
                chkStartMenuShortcut.Visible = false;
                chkFirewallRule.Visible = false;

                progressBar.Visible = true;
                lblProgressPercent.Visible = true;
                lblStatus.Visible = true;
                chkLaunchNow.Visible = false;

                btnNext.Enabled = false;
                btnCancel.Enabled = false;
                btnLangToggle.Enabled = false;

                Thread t = new Thread(PerformInstallation);
                t.IsBackground = true;
                t.Start();
            }
            else if (step == 4)
            {
                lblMainTitle.Text = (currentLang == "tr") ? "Tebrikler! Kurulum Başarılı" : "Congratulations! Setup Completed";
                lblMainSubtitle.Text = (currentLang == "tr")
                    ? "OmniBackup Enterprise Cyber Vault bilgisayarınıza başarıyla kuruldu."
                    : "OmniBackup Enterprise Cyber Vault has been successfully installed.";

                chkLaunchNow.Text = (currentLang == "tr")
                    ? "OmniBackup Cyber Vault masaüstü uygulamasını şimdi başlat"
                    : "Launch OmniBackup Cyber Vault desktop application now";

                lblPathHeader.Visible = false;
                txtInstallPath.Visible = false;
                btnBrowse.Visible = false;
                chkDesktopShortcut.Visible = false;
                chkStartMenuShortcut.Visible = false;
                chkFirewallRule.Visible = false;

                progressBar.Visible = false;
                lblProgressPercent.Visible = false;
                lblStatus.Visible = false;

                chkLaunchNow.Visible = true;

                btnNext.Text = (currentLang == "tr") ? "Son" : "Finish";
                btnNext.Enabled = true;
                btnCancel.Visible = false;
                btnLangToggle.Enabled = true;
            }
        }

        private void BtnNext_Click(object sender, EventArgs e)
        {
            if (currentStep == 1)
            {
                ShowStep(2);
            }
            else if (currentStep == 2)
            {
                if (string.IsNullOrWhiteSpace(txtInstallPath.Text))
                {
                    string err = (currentLang == "tr") ? "Lütfen geçerli bir kurulum dizini belirtiniz." : "Please specify a valid installation directory.";
                    MessageBox.Show(err, "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
                ShowStep(3);
            }
            else if (currentStep == 4)
            {
                if (chkLaunchNow.Checked)
                {
                    LaunchInstalledApp(txtInstallPath.Text);
                }
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

        private void PerformInstallation()
        {
            try
            {
                string targetDir = txtInstallPath.Text.Trim();
                if (!targetDir.EndsWith("OmniBackup", StringComparison.OrdinalIgnoreCase))
                {
                    if (targetDir.EndsWith("\\") || targetDir.EndsWith("/"))
                    {
                        targetDir = targetDir + "OmniBackup";
                    }
                    else
                    {
                        targetDir = targetDir + "\\OmniBackup";
                    }
                }

                try
                {
                    if (!Directory.Exists(targetDir))
                    {
                        Directory.CreateDirectory(targetDir);
                    }
                }
                catch (Exception dirEx)
                {
                    string fallbackDir = @"C:\OmniBackup";
                    targetDir = fallbackDir;
                    txtInstallPath.Text = fallbackDir;
                    if (!Directory.Exists(targetDir))
                    {
                        Directory.CreateDirectory(targetDir);
                    }
                }

                string msgStopping = (currentLang == "tr") ? "Mevcut çalışan süreçler kontrol ediliyor..." : "Checking existing running processes...";
                UpdateProgress(5, msgStopping);
                KillProcessByName("OmniBackup");
                KillProcessByName("node");
                KillProcessByName("msedgewebview2");
                KillPortProcess(3060);
                Thread.Sleep(500);

                string msgResolving = (currentLang == "tr") ? "Kurulum paketi çözümleniyor (omni_payload.zip)..." : "Resolving setup archive (omni_payload.zip)...";
                UpdateProgress(10, msgResolving);
                Thread.Sleep(200);

                Stream zipStream = Assembly.GetExecutingAssembly().GetManifestResourceStream("omni_payload.zip");
                string tempZip = Path.Combine(Path.GetTempPath(), "omni_temp_payload_" + Guid.NewGuid().ToString("N") + ".zip");

                if (zipStream != null)
                {
                    using (FileStream fs = new FileStream(tempZip, FileMode.Create, FileAccess.Write))
                    {
                        zipStream.CopyTo(fs);
                    }
                }
                else
                {
                    string localZip = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "omni_payload.zip");
                    if (File.Exists(localZip))
                    {
                        File.Copy(localZip, tempZip, true);
                    }
                    else
                    {
                        throw new FileNotFoundException("Gömülü kurulum paketi bulunamadı (omni_payload.zip).");
                    }
                }

                string msgExtracting = (currentLang == "tr") ? "Dosyalar hedef dizine aktarılıyor..." : "Extracting files to destination folder...";
                UpdateProgress(25, msgExtracting);

                if (File.Exists(tempZip))
                {
                    using (ZipArchive archive = ZipFile.OpenRead(tempZip))
                    {
                        int totalEntries = archive.Entries.Count;
                        int count = 0;
                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            count++;
                            try
                            {
                                string destinationPath = Path.GetFullPath(Path.Combine(targetDir, entry.FullName));
                                if (entry.FullName.EndsWith("/") || entry.FullName.EndsWith("\\"))
                                {
                                    if (!Directory.Exists(destinationPath)) Directory.CreateDirectory(destinationPath);
                                    continue;
                                }

                                // SAFETY: If updating/installing over existing installation, NEVER OVERWRITE user database, custom backup jobs, settings or backups!
                                string entryName = entry.FullName.Replace('/', '\\');
                                if (File.Exists(destinationPath))
                                {
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
                                }

                                string dir = Path.GetDirectoryName(destinationPath);
                                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

                                for (int retry = 0; retry < 5; retry++)
                                {
                                    try
                                    {
                                        entry.ExtractToFile(destinationPath, true);
                                        break;
                                    }
                                    catch
                                    {
                                        KillProcessByName("OmniBackup");
                                        KillProcessByName("node");
                                        KillProcessByName("msedgewebview2");
                                        Thread.Sleep(200);
                                    }
                                }

                                if (count % 25 == 0 || count == totalEntries)
                                {
                                    int p = 25 + (int)((count / (float)totalEntries) * 55);
                                    string fileMsg = (currentLang == "tr") ? string.Format("Açılıyor: {0}", entry.Name) : string.Format("Extracting: {0}", entry.Name);
                                    UpdateProgress(p, fileMsg);
                                }
                            }
                            catch { }
                        }
                    }

                    try { File.Delete(tempZip); } catch { }
                }

                string msgShortcuts = (currentLang == "tr") ? "Masaüstü ve Başlat Menüsü kısayolları oluşturuluyor..." : "Creating Desktop and Start Menu shortcuts...";
                UpdateProgress(85, msgShortcuts);
                Thread.Sleep(200);

                string launcherExe = Path.Combine(targetDir, "OmniBackup.exe");
                if (!File.Exists(launcherExe))
                {
                    launcherExe = Path.Combine(targetDir, "scripts", "OmniBackup.exe");
                }
                string launcherVbs = Path.Combine(targetDir, "scripts", "launcher.vbs");
                string iconPath = Path.Combine(targetDir, "scripts", "app.ico");
                if (!File.Exists(iconPath))
                {
                    iconPath = Path.Combine(targetDir, "app.ico");
                }

                string targetExecutable = File.Exists(launcherExe) ? launcherExe : "wscript.exe";
                string targetArguments = File.Exists(launcherExe) ? "" : string.Format("\"{0}\"", launcherVbs);

                if (chkDesktopShortcut.Checked)
                {
                    CreateShortcut(
                        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "OmniBackup Cyber Vault.lnk"),
                        targetExecutable,
                        targetArguments,
                        targetDir,
                        "OmniBackup Enterprise Cyber Vault",
                        File.Exists(iconPath) ? iconPath : launcherExe
                    );
                }

                if (chkStartMenuShortcut.Checked)
                {
                    string startMenuPrograms = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "OmniBackup");
                    if (!Directory.Exists(startMenuPrograms)) Directory.CreateDirectory(startMenuPrograms);

                    CreateShortcut(
                        Path.Combine(startMenuPrograms, "OmniBackup Cyber Vault.lnk"),
                        targetExecutable,
                        targetArguments,
                        targetDir,
                        "OmniBackup Enterprise Cyber Vault",
                        File.Exists(iconPath) ? iconPath : launcherExe
                    );
                }

                string msgFirewall = (currentLang == "tr") ? "Windows Güvenlik Duvarı kuralı kaydediliyor (Port 3060)..." : "Configuring Windows Firewall rule (Port 3060)...";
                UpdateProgress(90, msgFirewall);
                if (chkFirewallRule.Checked)
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo("netsh", "advfirewall firewall add rule name=\"OmniBackup Enterprise\" dir=in action=allow protocol=TCP localport=3060");
                        psi.CreateNoWindow = true;
                        psi.UseShellExecute = false;
                        Process p = Process.Start(psi);
                        if (p != null) p.WaitForExit(3000);
                    }
                    catch { }
                }

                string msgReg = (currentLang == "tr") ? "Windows Program Ekle/Kaldır kaydı oluşturuluyor..." : "Registering Windows uninstaller...";
                UpdateProgress(95, msgReg);
                RegisterUninstall(targetDir, File.Exists(iconPath) ? iconPath : launcherExe);

                string msgDone = (currentLang == "tr") ? "Kurulum tamamlandı!" : "Installation complete!";
                UpdateProgress(100, msgDone);
                Thread.Sleep(300);

                this.BeginInvoke(new Action(() => {
                    ShowStep(4);
                }));
            }
            catch (Exception ex)
            {
                this.BeginInvoke(new Action(() => {
                    MessageBox.Show("Kurulum sırasında hata oluştu: " + ex.Message, "Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    btnNext.Enabled = true;
                    btnCancel.Enabled = true;
                }));
            }
        }

        private void CreateShortcut(string shortcutPath, string target, string args, string workingDir, string desc, string iconLoc)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType);
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = target;
                    shortcut.Arguments = args;
                    shortcut.WorkingDirectory = workingDir;
                    shortcut.Description = desc;
                    if (!string.IsNullOrEmpty(iconLoc) && File.Exists(iconLoc))
                    {
                        shortcut.IconLocation = iconLoc;
                    }
                    shortcut.Save();
                }
            }
            catch { }
        }

        private void RegisterUninstall(string installDir, string iconPath)
        {
            try
            {
                string uninstallerExe = Path.Combine(installDir, "Uninstall.exe");
                if (!File.Exists(uninstallerExe))
                {
                    uninstallerExe = Path.Combine(installDir, "scripts", "Uninstall.exe");
                }

                string uninstallerBat = Path.Combine(installDir, "Uninstall.bat");
                string uninstallerContent = "@echo off\r\nchcp 65001 >nul\r\n"
                    + "if exist \"%~dp0Uninstall.exe\" (\r\n"
                    + "    start \"\" \"%~dp0Uninstall.exe\" --target=\"%~dp0\"\r\n"
                    + "    exit /b\r\n"
                    + ")\r\n"
                    + "echo [OMNIBACKUP] Kaldirma baslatiliyor...\r\n"
                    + "call \"%~dp0scripts\\stop.bat\"\r\n"
                    + "del /f /q \"%USERPROFILE%\\Desktop\\OmniBackup Cyber Vault.lnk\" 2>nul\r\n"
                    + "del /f /q \"%USERPROFILE%\\Desktop\\OmniBackup Enterprise.lnk\" 2>nul\r\n"
                    + "del /f /q \"%PUBLIC%\\Desktop\\OmniBackup*.lnk\" 2>nul\r\n"
                    + "rmdir /s /q \"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\OmniBackup\" 2>nul\r\n"
                    + "del /f /q \"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\OmniBackup Master Service.lnk\" 2>nul\r\n"
                    + "rmdir /s /q \"%LOCALAPPDATA%\\OmniBackup\" 2>nul\r\n"
                    + "netsh advfirewall firewall delete rule name=\"OmniBackup Enterprise\" >nul 2>&1\r\n"
                    + "reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\OmniBackup\" /f >nul 2>&1\r\n"
                    + "reg delete \"HKCU\\Software\\OmniBackup\" /f >nul 2>&1\r\n"
                    + "echo [OMNIBACKUP] Program basariyla kaldirildi.\r\n"
                    + "timeout /t 2 >nul\r\n";
                File.WriteAllText(uninstallerBat, uninstallerContent);

                string uninstallCmd = File.Exists(uninstallerExe) 
                    ? string.Format("\"{0}\" --target=\"{1}\"", uninstallerExe, installDir)
                    : string.Format("cmd.exe /c \"{0}\"", uninstallerBat);

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\OmniBackup"))
                {
                    if (key != null)
                    {
                        key.SetValue("DisplayName", "OmniBackup Enterprise Cyber Vault");
                        key.SetValue("DisplayVersion", "2.5.0");
                        key.SetValue("Publisher", "Önder Cihan ACAR");
                        key.SetValue("InstallLocation", installDir);
                        key.SetValue("UninstallString", uninstallCmd);
                        key.SetValue("QuietUninstallString", uninstallCmd);
                        key.SetValue("DisplayIcon", iconPath);
                        key.SetValue("EstimatedSize", 48000);
                        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                    }
                }
            }
            catch { }
        }

        private void LaunchInstalledApp(string installDir)
        {
            try
            {
                string launcherExe = Path.Combine(installDir, "OmniBackup.exe");
                if (File.Exists(launcherExe))
                {
                    Process.Start(launcherExe);
                    return;
                }

                string scriptLauncher = Path.Combine(installDir, "scripts", "OmniBackup.exe");
                if (File.Exists(scriptLauncher))
                {
                    Process.Start(scriptLauncher);
                    return;
                }

                string launcherVbs = Path.Combine(installDir, "scripts", "launcher.vbs");
                if (File.Exists(launcherVbs))
                {
                    Process.Start("wscript.exe", string.Format("\"{0}\"", launcherVbs));
                    return;
                }

                Process.Start("http://localhost:3060");
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
