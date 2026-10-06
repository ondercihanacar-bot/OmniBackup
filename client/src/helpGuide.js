/**
 * OmniBackup Enterprise - Tab Knowledge Base & Contextual Help Guide
 * Contains comprehensive descriptions, use-cases, and best practices for every single tab.
 */

export const TAB_HELP_GUIDE = {
  dashboard: {
    title: "Merkezi Kontrol Paneli (Dashboard)",
    subtitle: "Tüm yedekleme altyapısının tek ekrandan canlı telemetrisi",
    description: "Kontrol paneli, kurum genelinde korunan tüm fiziksel sunucuların, sanal makinelerin, veritabanlarının ve bulut hedeflerinin durumunu gerçek zamanlı grafiklerle özetler.",
    useCase: "Sabah ilk kontrollerde sistemin genel sağlık puanını, aktif fidye kalkanı durumunu, depolama doluluk oranını ve bekleyen uyarıları bir bakışta denetlemek için kullanılır.",
    keyFeatures: [
      "Korunan toplam veri boyutu ve 30 günlük başarı oranı",
      "VSS snapshot ve WORM değiştirilemezlik kilit göstergeleri",
      "Yapay zeka (AI) tabanlı depolama tükenme ve kapasite tahmini",
      "Son 24 saatteki başarılı ve başarısız yedekleme akış grafiği"
    ],
    tips: "Depolama doluluk oranı %80'in üzerine çıktığında AI optimizasyon önerilerini kontrol edin veya WORM deduplication havuzunu genişletin."
  },
  aiAssistant: {
    title: "OmniAI Felaket Kurtarma & Doğal Dil Asistanı",
    subtitle: "Yapay zeka ile konuşarak veya yazarak yedek alma ve anında kurtarma",
    description: "Doğal Dil İşleme (NLP) motoruyla çalışan yapay zeka asistanı, karmaşık komutları ve kurtarma senaryolarını tek bir prompt ile planlayıp onayınıza sunar.",
    useCase: "Acil bir kriz anında hangi yedekten dönülmesi gerektiğini hızlıca sorgulamak veya 'Dün saat 18:00'deki ERP veritabanını test sunucusuna kur' gibi karmaşık senaryoları hatasız çalıştırmak için kullanılır.",
    keyFeatures: [
      "Doğal dille yazılan talepleri anlama ve SQL/VSS görevine çevirme",
      "Felaket anında en uygun kurtarma noktasını (RPO) otomatik önerme",
      "Başarısız olan yedekleme hatalarını analiz edip çözüm önerisi sunma",
      "Sesli ve metin tabanlı etkileşim desteği"
    ],
    tips: "Asistana 'Son 3 günde hangi makineler yedeklenmedi?' gibi denetim soruları sorarak anında rapor alabilirsiniz."
  },
  drRunbook: {
    title: "1-Click Site Failover & DR Senaryo Orkestrasyonu",
    subtitle: "Felaket anında tüm şirketi tek tıkla ikincil veri merkezine taşıma",
    description: "Yangın, deprem veya ana veri merkezi çöküşü senaryolarında, sunucuları bağımlılık sırasına göre (Boot Dependency) ikincil siteda ayağa kaldıran ve DNS yönlendirmesi yapan orkestrasyon motoru.",
    useCase: "Ana ofisteki sunucu odası devre dışı kaldığında, şirket operasyonunu dakikalar içinde kesintisiz olarak bulutta veya ikincil lokasyonda başlatmak için kullanılır.",
    keyFeatures: [
      "Öncelikli Başlatma: 1. Domain Controller -> 2. Veritabanı -> 3. ERP & Web",
      "Otomatik Sanal Ağ ve IP/DNS Yeniden Eşleme (Re-IP Orchestration)",
      "Düzenli otomatik tatbikat (SureBackup Drill) raporlaması",
      "RTO süresini saatlerden dakikalara indiren tek tuşla geçiş (Failover)"
    ],
    tips: "Her ay 'Test Tatbikatı (Non-disruptive Test)' modunda canlı trafiği etkilemeden senaryolarınızı otomatik deneyin."
  },
  k8s: {
    title: "Kubernetes & Konteyner Koruması (K8s & Docker)",
    subtitle: "Cloud-native mikroservisler, Persistent Volume (PVC) ve Helm durum yedeklemesi",
    description: "Kubernetes cluster'ları içerisindeki Pod'ları, ConfigMap'leri, Secret'ları ve kalıcı depolama birimlerini (PVC) uygulamanın durumuyla tutarlı (Application-Consistent) olarak yedekler.",
    useCase: "Kubernetes üzerinde koşan mikroservislerin veya veri tabanlarının bozulması durumunda, cluster'ı başka bir buluta (AWS EKS, GKE veya yerel K8s) anında taşımak için kullanılır.",
    keyFeatures: [
      "CSI (Container Storage Interface) Snapshot entegrasyonu",
      "Namespace, Pod ve PVC bazlı granüler geri yükleme",
      "Farklı Kubernetes sürümleri ve bulut sağlayıcıları arasında cluster göçü (Migration)",
      "Helm release ve YAML manifest versiyonlaması"
    ],
    tips: "Yalnızca verileri değil, ConfigMap ve Secret nesnelerini de yedeklediğinizden emin olun."
  },
  honeypot: {
    title: "Fidye Yazılımı Yem Tuzağı (Honeypot Decoy)",
    subtitle: "Sıfırıncı gün fidye yazılımlarını anında yakalayan gizli tuzak sistemi",
    description: "Sunucuların kritik klasörlerine görünüşte normal fakat arkada nöbetçi izleme motoruna bağlı yem dosyalar (`passwords_2026.docx`, `finans_hesaplar.xlsx`) yerleştirilir.",
    useCase: "İmza tabanlı antivirüslerin kaçırdığı sıfırıncı gün (Zero-Day) fidye yazılımları bu dosyalardan birini şifrelemeye kalktığı milisaniyede saldırıyı durdurmak için kullanılır.",
    keyFeatures: [
      "Milisaniyelik Erken Uyarı ve Acil Ağ Karantinası (Network Isolation)",
      "Şüpheli işlemi anında sonlandırma (Process Kill)",
      "Yedekleme depolarını anında Salt-Okunur (WORM Hard-Lock) moduna alma",
      "Yöneticiye anlık SMS, Telegram ve E-posta alarmı fırlatma"
    ],
    tips: "Tuzak dosyaların konumlarını sistem otomatik belirler, kullanıcıların bu dosyaları manuel değiştirmemesi önerilir."
  },
  syntheticClone: {
    title: "Sentetik Hızlı Klon Motoru (Fast-Clone & ReFS)",
    subtitle: "Sıfır ek depolama ve sıfır disk I/O ile 3 saniyede tam yedek",
    description: "ReFS ve Btrfs dosya sistemlerinin blok işaretçisi klonlama (Block Cloning / Fast-Clone) yeteneğini kullanarak, saatler süren tam yedekleri 3 saniyede sentetik olarak oluşturur.",
    useCase: "Haftalık tam yedekler için sunucuyu ve depolama ağını saatlerce meşgul etmeden, depolama alanından %90 tasarruf sağlayarak tam yedek üretmek için kullanılır.",
    keyFeatures: [
      "Pointer-based Block Cloning: Fiziksel veri kopyalaması yapılmaz",
      "Haftalık ve aylık tam yedek süresini %95 kısaltır",
      "Depolama disklerinde fazladan alan işgal etmez",
      "Yedek zincirinin bütünlüğünü bozmadan anında arşive dönüştürür"
    ],
    tips: "Mümkünse depolama hedeflerinizi Windows Server ReFS (64KB formatlı) veya Linux Btrfs/XFS formatında biçimlendirin."
  },
  wanAccelerator: {
    title: "WAN Trafik Hızlandırıcı & Bant Genişliği (QoS)",
    subtitle: "Şirket internetini tıkamadan hızlı şube ve bulut transferi",
    description: "Şubeler arası veya buluta yapılan yedekleme trafiğini mesai saatlerine göre dinamik olarak kısıtlar (Traffic QoS); veri transferinde WAN deduplication ile hat yükünü %80 azaltır.",
    useCase: "Gündüz saatlerinde yedekleme trafiğinin şirket internetini ve VoIP telefon görüşmelerini yavaşlatmasını engellemek için kullanılır.",
    keyFeatures: [
      "Zaman Ayarlı Bant Genişliği Kısıtlama (Örn: Mesaide 10 MB/s, Gece Sınırsız)",
      "Byte Seviyesinde WAN Deduplication & Sıkıştırma (Zstandard LZO)",
      "Ağ kopmalarında kaldığı yerden devam etme (Resumable Network Sync)",
      "Çoklu şube bant genişliği havuzu yönetimi"
    ],
    tips: "Mesai saatleri kuralını '08:30 - 18:00' aralığına kurarak çalışanların internet deneyimini garantiye alın."
  },
  geoRedundancy: {
    title: "3-2-1-1-0 Çoklu Bulut Coğrafi Yedeklilik",
    subtitle: "Verilerinizi aynı anda farklı coğrafyalara paralel aynalama",
    description: "Yedekleri tek bir işlemle aynı anda hem yerel NAS'a hem AWS Frankfurt'a hem de Google Cloud Zürih'e senkronize eder ve 3-2-1-1-0 kural uyumluluğunu canlı skorlar.",
    useCase: "Bir ülkedeki veya kıtadaki veri merkezi kesintisinde bile verilerin diğer coğrafi bölgeden anında erişilebilir olmasını garanti etmek için kullanılır.",
    keyFeatures: [
      "Canlı 3-2-1-1-0 Altın Kural Uyumluluk Radarı",
      "Paralel Multi-Cloud Eşitleme (Multi-Region Replication)",
      "Bölgesel çöküş durumunda otomatik yük devretme (Geo-Failover)",
      "Kayıp veri ve bozuk blok kontrolü (Zero Errors Audit)"
    ],
    tips: "En az bir kopyanızı daima yerel ağdan izole edilmiş bir WORM/Air-Gap hedefinde tutun."
  },
  cdp: {
    title: "Continuous Data Protection (CDP) & Canlı Zaman Tüneli",
    subtitle: "Sıfır RPO ile saniyelik hassasiyette geriye dönüş",
    description: "Dosya ve veritabanı değişikliklerini milisaniyelik USN Journal akışıyla yakalar. Zaman tüneli çubuğunu kaydırarak istenilen dakikaya sıfır veri kaybıyla dönülmesini sağlar.",
    useCase: "Fidye yazılımı bulaşması veya hatalı bir veritabanı silme komutunda, felaketten 10 saniye önceki tam ana dönmek için kullanılır.",
    keyFeatures: [
      "0.5 saniye altında RPO garantisi",
      "Point-in-Time interaktif zaman kaydırıcı arayüzü",
      "VSS micro-snapshot zinciri ile sıfır kilitlenme",
      "Canlı dosya ve veritabanı delta günlüğü akışı"
    ],
    tips: "Zaman çubuğunu kullanarak saldırı veya hatanın tam gerçekleştiği dakikanın 1 dakika öncesini seçerek geri yükleme yapın."
  },
  converter: {
    title: "Cross-Platform VM & Bulut Format Dönüştürücü",
    subtitle: "P2V, V2V ve V2C sanallaştırma köprüsü",
    description: "Fiziksel sunuculardan veya sanal makinelerden alınan yedekleri tek tıkla VMware ESXi (VMDK), Microsoft Hyper-V (VHDX), Proxmox (QCOW2) ve AWS AMI formatına dönüştürür.",
    useCase: "Donanımı yanan fiziksel bir sunucuyu dakikalar içinde VMware veya Hyper-V üzerinde sanal makine olarak açmak için kullanılır.",
    keyFeatures: [
      "Otomatik VirtIO ve bulut sürücü enjeksiyonu",
      "Thin-provisioned alan tasarruflu imaj üretimi",
      "Hyper-V Gen2 UEFI ve SecureBoot uyumluluğu",
      "Doğrudan bulut aktarımı için AWS EC2 AMI desteği"
    ],
    tips: "Dönüştürme işleminde 'Sürücüleri Otomatik Enjekte Et' seçeneğini açık tutarak mavi ekran (BSOD) riskini önleyin."
  },
  fourEyes: {
    title: "Dört Göz Kuralı (Four-Eyes Principle) & Çift Yönetici Onayı",
    subtitle: "Yıkıcı işlemler için en az iki yöneticinin eş zamanlı 2FA onayı",
    description: "WORM kilidini kaldırma, yedekleri silme veya şifreleme anahtarlarını sıfırlama gibi tehlikeli işlemlerde tek admin yetkisini engeller; 2. yöneticinin onayını zorunlu kılar.",
    useCase: "Şirket içi kötü niyetli sabotajları veya çalınmış bir yönetici şifresiyle yedeklerin yok edilmesini %100 engellemek için kullanılır.",
    keyFeatures: [
      "Zero-Trust Dual-Control onay kuyruğu",
      "Mobil 2FA ve Master PIN doğrulamalı karar mekanizması",
      "Onaylanan ve reddedilen işlemlerin değiştirilemez denetim kaydı",
      "Zaman aşımı (Auto-Expire) güvenlik koruması"
    ],
    tips: "Kritik WORM silme taleplerinde ikinci yöneticiyle telefon veya yüz yüze teyit alarak onay verin."
  },
  kvkk: {
    title: "KVKK & GDPR Uyum Suiti — Unutulma Hakkı & PII Maskeleme",
    subtitle: "Yedek arşivlerinde hassas veri keşfi ve kriptografik imha",
    description: "Şifreli yedekler taranarak TCKN, Kredi Kartı ve IBAN verileri tespit edilir. Yasal başvurularda arşiv bozulmadan kişinin verisi kriptografik olarak imha edilir.",
    useCase: "KVKK Madde 7 / GDPR Madde 17 'Unutulma Hakkı' başvurularında tüm yedekleri silmeden yasal uyum sertifikası üretmek için kullanılır.",
    keyFeatures: [
      "TCKN, PCI-DSS Kredi Kartı ve Sağlık Verisi Derin Taraması",
      "Cryptographic Shredding: Arşivi bozmadan kişisel alt blokları silme",
      "Denetimlerde geçerli SHA-256 imzalı Yasal Uyum Sertifikası",
      "Hassas veri risk puanlaması ve uyum haritası"
    ],
    tips: "Yasal başvurularda üretilen 'Kriptografik İmha Sertifikası'nı PDF olarak indirip yasal dosyanıza ekleyebilirsiniz."
  },
  selfHealing: {
    title: "Self-Healing (Kendi Kendini Onaran) Akıllı Ajan Motoru",
    subtitle: "Otonom hata giderme ve bozuk blok mikro-onarımı",
    description: "VSS writer kilitlenmelerinde otomatik servis temizliği yapar, ağ kopmasında kaldığı byte'tan devam eder ve bozuk arşiv bloklarını kaynaktan çekerek otonom onarır.",
    useCase: "Gece çalışan yedeklerin insan müdahalesi gerektirmeden %100 başarıyla tamamlanmasını sağlamak için kullanılır.",
    keyFeatures: [
      "VSS Writer Deadlock Watchdog (Otomatik Reset)",
      "Resumable Network Sync (Kaldığı byte'tan devam)",
      "Chunk-level Delta Archive Repair (Bozuk bloğu tamir)",
      "Otonom müdahale ve başarı logları"
    ],
    tips: "Arşivde bozuk blok uyarısı görürseniz 'Otonom Teşhis Çalıştır' butonuna basarak anında sağlık taraması yapabilirsiniz."
  },
  airGap: {
    title: "Fiziksel Air-Gap İzolasyonu & S3 Compliance Object Lock",
    subtitle: "Yedekleri ağdan fiziksel ve yasal olarak izole etme",
    description: "Yedekleme bittiğinde USB/Teyp sürücülerini otomatik olarak devreden çıkarır (Dismount/Offline) ve AWS/Wasabi S3 depolarına 7 yıla kadar silinemez yasal kilit uygular.",
    useCase: "En gelişmiş fidye yazılımlarının dahi ulaşamayacağı, ağdan tamamen izole ve yasal olarak kilitli güvenli liman (Safe Haven) oluşturmak için kullanılır.",
    keyFeatures: [
      "Otomatik USB / Teyp / NAS Sürücü İzolasyonu (Dismount)",
      "AWS S3 & Wasabi Compliance Mode (Root hesabı dahil silemez)",
      "7 yıla kadar değiştirilemez yasal saklama (Legal Hold)",
      "Fiziksel hava boşluğu (True Air-Gap) koruması"
    ],
    tips: "Haftalık tam yedekler için bir harici diski 'Air-Gap Dismount' modunda tutarak fidye riskini sıfırlayın."
  },
  baremetal: {
    title: "Bare-Metal Disaster Recovery (BMR) & WinPE Medyası",
    subtitle: "Sıfır donanım üzerine tam sistem imajını dakikalar içinde açma",
    description: "İşletim sistemi çöktüğünde veya donanım yandığında, sıfır bir sunucuyu başlatıp orijinal imajı tüm disk bölümleri ve RAID yapılandırmasıyla geri yükleyen WinPE ISO/USB ortamı oluşturur.",
    useCase: "Sunucunun Windows'u açılmadığında veya anakart/disk tamamen değiştiğinde sıfırdan kurmak yerine dakikalar içinde sistemi ayağa kaldırmak için kullanılır.",
    keyFeatures: [
      "Önyüklenebilir (Bootable) UEFI x64 WinPE ISO ve USB Oluşturucu",
      "MegaRAID, PERC ve NVMe sürücülerini otomatik enjekte etme",
      "Doğrudan ağ üzerinden (PXE / HTTP Stream) imaj çekme",
      "EFI, MBR ve C: sürücülerini orijinal sektörleriyle açma"
    ],
    tips: "WinPE medyanızı oluşturduktan sonra bir USB belleğe yazdırıp sunucu odasında acil durum için hazır bulundurun."
  },
  saas: {
    title: "Microsoft 365 & Google Workspace Bulut Yedekleme",
    subtitle: "Exchange, OneDrive, SharePoint, Teams ve Gmail SaaS koruması",
    description: "Bulut kurumsal e-posta ve dosyalarınızı yerel ya da WORM depolamaya yedekler; silinen veya fidye ile şifrelenen hesapları tek tıkla PST / MBOX formatında geri yükler.",
    useCase: "Şirketten ayrılan personelin silinen maillerini kurtarmak veya Microsoft 365 hizmet kesintilerinde yerel PST yedeğinden çalışmaya devam etmek için kullanılır.",
    keyFeatures: [
      "Exchange Online, OneDrive, SharePoint ve Teams tam yedeklemesi",
      "Gmail ve Google Drive Cloud-to-Cloud yedekleme",
      "Tek tıkla PST / MBOX / EML arşiv dışa aktarımı",
      "Yasal Hold (WORM) uyumlu arşivleme"
    ],
    tips: "Yönetici ve muhasebe posta kutularını haftalık periyotla yerel depoya da yedekleyerek 3-2-1 kuralını tamamlayın."
  },
  ad: {
    title: "Active Directory & Domain Controller Granular Kurtarma",
    subtitle: "Domain Controller sunucusunu yeniden başlatmadan (0 Reboot) anında kurtarma",
    description: "Active Directory veritabanını (NTDS.dit) canlı yedekler; silinen kullanıcıları, güvenlik gruplarını ve OU'ları SID, parola ve grup üyelikleri bozulmadan anında geri canlandırır.",
    useCase: "Yanlışlıkla silinen bir muhasebe kullanıcısını veya güvenlik grubunu sunucuyu kapatmadan (0 Reboot) saniyeler içinde canlandırmak için kullanılır.",
    keyFeatures: [
      "0 Domain Controller Reboot: Kesintisiz Tombstone Reanimation",
      "Orijinal SID ve parola karmalarını (Password Hash) koruma",
      "Silinen tüm grup üyeliklerini otomatik geri bağlama",
      "Canlı NTDS.dit VSS snapshot yönetimi"
    ],
    tips: "Tombstone ömrü varsayılan 180 gündür; bu süre içinde silinen her nesne tek tıkla canlandırılabilir."
  },
  msp: {
    title: "MSP Multi-Tenancy Portal & SLA Uyumluluk Karnesi",
    subtitle: "Tüm müşterileri izole tenant havuzlarında yönetme ve SLA karnesi üretme",
    description: "BT hizmet sağlayıcıları (MSP) için çoklu müşteri organizasyonlarını, depolama kotalarını ve otomatik RPO/RTO SLA uyumluluk karnelerini tek merkezden yönetir.",
    useCase: "Dışarıdan hizmet verdiğiniz müşterilerin yedeklerini izole olarak takip etmek ve ay sonunda onlara resmi SLA başarı karnesi sunmak için kullanılır.",
    keyFeatures: [
      "İzole Müşteri (Tenant) Havuzları ve Kota Yönetimi",
      "Otomatik RPO/RTO Başarı Skoru ve Denetim Karnesi",
      "PDF ve Yazdırılabilir SLA Başarı Raporu",
      "Toplu müşteri ajan ve depolama telemetrisi"
    ],
    tips: "Müşterilerinize sunacağınız aylık SLA raporunu tek tıkla 'SLA Raporu Üret' butonuna basarak alabilirsiniz."
  },
  sql: {
    title: "Çoklu Veritabanı & Oracle RMAN Stüdyosu",
    subtitle: "MSSQL, PostgreSQL, MySQL ve Oracle RMAN canlı yedekleme ve granüler tablo kurtarma",
    description: "Microsoft SQL Server, PostgreSQL, MySQL ve Oracle RMAN veritabanlarını canlı denetler; tüm veritabanını geri yüklemeden sadece tek bir tabloyu kurtarır (Item-Level Table Restore).",
    useCase: "Bozulan veya yanlışlıkla güncellenen tek bir faturayı ya da cari tabloyu canlı veritabanına saniyeler içinde geri aktarmak için kullanılır.",
    keyFeatures: [
      "MSSQL, PostgreSQL, MySQL ve Oracle RMAN desteği",
      "Item-Level Granular Table Recovery (Tek tablo kurtarma)",
      "Transaction Log & WAL arşivleme ile sıfır veri kaybı",
      "Canlı tablo verilerini önizleme ekranı"
    ],
    tips: "Veritabanının tamamını geri yüklemek yerine 'Granüler Kurtar' ile yalnızca ilgili tabloyu canlandırarak kesinti süresini sıfırlayın."
  },
  jobs: {
    title: "Yedekleme ve Koruma Planları (Jobs)",
    subtitle: "Zamanlanmış otomatik yedekleme görevlerinin yönetimi",
    description: "Dosya, klasör, disk imajı veya veritabanı yedekleme görevlerinin zamanlamasını (cron), sıkıştırma seviyesini ve şifreleme anahtarlarını yapılandırır.",
    useCase: "Günlük, haftalık veya anlık otomatik yedekleme görevleri oluşturmak ve anlık çalıştırmak için kullanılır.",
    keyFeatures: [
      "VSS Snapshot, AES-256 şifreleme ve Zstandard sıkıştırma",
      "Gelişmiş cron zamanlama ve saklama (retention) döngüsü",
      "Fidye kalkanı ve Shannon Entropi koruma onayları",
      "Canlı ilerleme çubuğu ve telemetri yayını"
    ],
    tips: "Kritik verileriniz için şifreleme seçeneğini mutlaka açık tutun ve WORM hedeflerini seçin."
  },
  instantVm: {
    title: "Anında Sanallaştırma (Instant VM Boot)",
    subtitle: "Yedek arşivini saniyeler içinde canlı sanal makineye dönüştürme",
    description: "Geri yükleme süresini beklemeden, yedek imajını doğrudan sanal disk olarak bağlar ve Hyper-V veya VMware üzerinde 15 saniyede canlı sunucu olarak başlatır.",
    useCase: "Çöken ana sunucunun yedeğini saatlerce beklemek yerine 15 saniyede geçici sanal makine olarak açıp şirket işleyişini devam ettirmek için kullanılır.",
    keyFeatures: [
      "15 saniyede Instant VM başlatma",
      "Sıfır ek depolama ihtiyacı (NFS/SMB Mount stream)",
      "Arka planda kalıcı depoya aktarım (Storage vMotion / Live Migration)",
      "Acil felaket durumlarında sıfır kesinti"
    ],
    tips: "Acil durumda Instant VM başlatıp kullanıcıları sisteme aldıktan sonra arka planda kalıcı taşımayı başlatabilirsiniz."
  },
  keyvault: {
    title: "Kriptografik Anahtar Escrow & Parola Kasası",
    subtitle: "Donanıma bağlı AES-256 anahtar saklama ve 2FA escrow ihracı",
    description: "Tüm yedek arşivlerinin AES-256 şifreleme anahtarlarını donanım kimliğine (HWID) bağlı ve 2FA korumalı kasada saklar; PKCS#12 kapsülü olarak dışa aktarır.",
    useCase: "Şifrelerin kaybolması veya sunucu anakartının değişmesi durumunda arşivleri açabilmek için güvenli anahtar yedeği oluşturmakta kullanılır.",
    keyFeatures: [
      "AES-256-GCM donanım kilitli master key kasası",
      "Master PIN / 2FA doğrulaması ile anahtar görüntüleme",
      "PKCS#12 / PEM şifreli escrow ihracı",
      "OmniHub lisans ve anahtar senkronizasyonu"
    ],
    tips: "Her yeni şifreli görev oluşturduktan sonra 'Escrow Kapsülü Dışa Aktar' butonuna basarak anahtar dosyasını güvenli bir kasada saklayın."
  },
  destinations: {
    title: "Depolama Konumları ve Bulut Hedefleri",
    subtitle: "Yerel diskler, NAS (SMB/NFS), AWS S3, Google Drive ve WORM havuzları",
    description: "Yedeklerin yazılacağı yerel sürücüleri, ağ depolarını ve bulut sağlayıcılarını yapılandırır; depolama kotalarını ve bağlantı durumlarını izler.",
    useCase: "Yedekleme planlarına hedef depolama alanı tanımlamak ve bulut hesaplarını bağlamak için kullanılır.",
    keyFeatures: [
      "Yerel Disk, NAS (SMB/NFS), AWS S3, Wasabi, Google Drive ve MinIO",
      "WORM Immutable donanımsal mantık kilidi entegrasyonu",
      "Canlı kota ve doluluk oranı takibi",
      "Depolama hız ve gecikme testi"
    ],
    tips: "En az bir depolama hedefinizi 'WORM Immutable Lock' açık şekilde yapılandırın."
  },
  logs: {
    title: "Sistem ve Güvenlik Denetim Günlükleri (Audit Logs)",
    subtitle: "Tüm sistem olaylarının, girişlerin ve güvenlik müdahalelerinin değiştirilemez kaydı",
    description: "Yedekleme başarıları, kullanıcı oturumları, 2FA doğrulamaları, fidye engellemeleri ve yönetici işlemlerinin zaman damgalı güvenlik günlüğüdür.",
    useCase: "ISO 27001, KVKK ve bağımsız BT denetimlerinde sistem hareketlerini kanıtlamak için kullanılır.",
    keyFeatures: [
      "Zaman damgalı ve modül bazlı log filtreleme",
      "Güvenlik, uyarı ve hata seviyesi sınıflandırması",
      "Değiştirilemez denetim izi (Audit Trail)",
      "Dışa aktarma ve arşivleme desteği"
    ],
    tips: "Hata veya uyarı gördüğünüz log satırlarına tıklayarak ayrıntılı hata kodunu ve etkilenen bileşeni inceleyin."
  },
  settings: {
    title: "Sistem Yapılandırması ve Güvenlik Ayarları",
    subtitle: "Global parametreler, bildirim kanalları ve 2FA güvenlik tercihleri",
    description: "SMTP e-posta, Telegram botu, Webhook bildirimleri, Google Authenticator (TOTP) 2FA kurulumu ve genel yedekleme varsayılanlarını düzenler.",
    useCase: "Sistem alarmlarının yöneticinin telefonuna veya e-postasına düşmesi için bildirim kanallarını bağlamakta kullanılır.",
    keyFeatures: [
      "Telegram Bot ve Discord/Slack Webhook entegrasyonu",
      "SMTP E-Posta sunucu yapılandırması ve test gönderimi",
      "Google Authenticator (2FA) QR kod ve kurtarma kodu yönetimi",
      "Global dil seçimi (Türkçe / İngilizce)"
    ],
    tips: "Kurulum tamamlandıktan sonra 'Test E-postası Gönder' ve 'Test Telegram Bildirimi' butonlarına basarak uyarı sisteminizin çalıştığını doğrulayın."
  }
};
