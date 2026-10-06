# OmniBackup Enterprise 🛡️
### Merkezi Windows Sunucu, İstemci ve MSSQL Yedekleme Sistemi

Omni ekosisteminin kurumsal yedekleme ve felaket kurtarma (Disaster Recovery) yazılımıdır. Modern, siber güvenlik temalı web paneli üzerinden tüm sunucu, bilgisayar ve SQL veritabanlarınızı merkezi olarak yönetmenizi sağlar.

---

## 🚀 Öne Çıkan Özellikler

### 1. Microsoft SQL Server Backup Studio
- **Full, Differential & Transaction Log** yedekleme desteği.
- Canlı çalışan sistemlerde kilitlenmesiz ve kesintisiz yedekleme (`WITH COMPRESSION`, `WITH CHECKSUM`).
- Tek tıkla SQL Server bağlantı testi ve sunucudaki tüm veritabanlarının otomatik keşfi.

### 2. Windows Sunucu ve İstemci (PC) Dosya Yedekleme
- **Windows VSS (Volume Shadow Copy) Entegrasyonu:** Açık olan Outlook `.pst` / `.ost`, Excel, muhasebe veri dosyaları kilitlenmeden yedeklenir.
- **AES-256 Şifreleme:** Yedek arşivleri fidye yazılımlarına (Ransomware) karşı askeri düzeyde şifrelenir.
- **Yüksek Sıkıştırma (Zip / Deflate):** Depolama alanından maksimum tasarruf sağlar.

### 3. Ajan Filosu Yönetimi (Agent Fleet)
- Windows Server 2016/2019/2022 ve Windows 10/11 için hafif, CPU/RAM dostu arka plan ajanı.
- Tek satır PowerShell komutu ile 10 saniyede merkeze bağlanma.
- Canlı CPU, RAM, Disk boşluk oranı ve donanım izleme.

### 4. Çoklu Depolama Hedefleri
- Yerel Diskler & Harici USB Sürücüler
- NAS / Synology / QNAP SMB Ağ Paylaşımları (`\\server\share`)
- Amazon S3, MinIO ve S3 Uyumlu Bulut Depolama

### 5. Kurtarma Merkezi & Otomatik Saklama Politikası (Retention)
- Geçmiş arşivleri listeleme ve tek tıkla orijinal/alternatif yola geri yükleme (Restore).
- Belirlenen saklama süresi (örn: 14 veya 30 gün) dolan eski yedeklerin otomatik temizlenmesi.

---

## ⚡ Hızlı Başlatma

1. `baslat.bat` dosyasını çalıştırın (veya `launcher.vbs` ile arka planda sessizce başlatın).
2. Tarayıcınızda otomatik açılacaktır:
   👉 **http://localhost:3060**

---

## 🖥️ Ajan Kurulumu (Uzak Sunucu / Kullanıcı PC'leri İçin)

Yedeklemek istediğiniz istemci veya sunucuda **PowerShell (Yönetici)** açıp şu komutu çalıştırın:
```powershell
powershell -ExecutionPolicy Bypass -File .\agent\OmniBackup-Agent.ps1 -ServerUrl "http://SUNUCU_IP:3060"
```

---
**Geliştirici:** Önder Cihan ACAR
**Omni Suite:** OmniHub • OmniSpot • OmniBackup
