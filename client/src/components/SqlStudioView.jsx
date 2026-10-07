import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Code, 
  Globe, 
  Layers, 
  CheckCheck, 
  ShieldCheck, 
  HardDrive, 
  Table, 
  Eye, 
  RotateCcw, 
  Sparkles, 
  FileSpreadsheet,
  Cpu
} from 'lucide-react';
import { api } from '../api';

export default function SqlStudioView({ onJobCreated, onRefresh }) {
  const [engineType, setEngineType] = useState('mssql'); // 'mssql', 'mysql', 'postgres', 'oracle'

  // MSSQL Form State
  const [serverAddress, setServerAddress] = useState('127.0.0.1');
  const [instanceName, setInstanceName] = useState('MSSQLSERVER');
  const [authType, setAuthType] = useState('windows');
  const [username, setUsername] = useState('sa');
  const [password, setPassword] = useState('');

  // MySQL Form State
  const [mysqlHost, setMysqlHost] = useState('127.0.0.1');
  const [mysqlPort, setMysqlPort] = useState(3306);
  const [mysqlUser, setMysqlUser] = useState('root');
  const [mysqlPass, setMysqlPass] = useState('');

  // PostgreSQL Form State
  const [pgHost, setPgHost] = useState('127.0.0.1');
  const [pgPort, setPgPort] = useState(5432);
  const [pgUser, setPgUser] = useState('postgres');
  const [pgPass, setPgPass] = useState('');
  const [pgDatabase, setPgDatabase] = useState('production_db');

  // Oracle RMAN Form State
  const [oracleHost, setOracleHost] = useState('127.0.0.1');
  const [oraclePort, setOraclePort] = useState(1521);
  const [oracleService, setOracleService] = useState('ORCL');
  const [oracleUser, setOracleUser] = useState('sys as sysdba');
  const [oraclePass, setOraclePass] = useState('');
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [selectedDb, setSelectedDb] = useState('');
  const [backupType, setBackupType] = useState('full');
  const [compress, setCompress] = useState(true);
  const [checksum, setChecksum] = useState(true);
  const [executingBackup, setExecutingBackup] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState(null);

  // Granular Table Explorer State
  const [loadingTables, setLoadingTables] = useState(false);
  const [tablesData, setTablesData] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTableData, setPreviewTableData] = useState(null);
  const [restoringTable, setRestoringTable] = useState(null);
  const [restoreTableSuccess, setRestoreTableSuccess] = useState(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTablesData(null);
    try {
      let res;
      if (engineType === 'mysql') {
        res = await api.testMysql({
          serverAddress: mysqlHost,
          port: mysqlPort,
          username: mysqlUser,
          password: mysqlPass
        });
      } else if (engineType === 'postgres') {
        res = await api.testPostgres({
          host: pgHost,
          port: pgPort,
          user: pgUser,
          password: pgPass,
          database: pgDatabase
        });
      } else if (engineType === 'oracle') {
        res = await api.testOracle({
          host: oracleHost,
          port: oraclePort,
          serviceName: oracleService,
          user: oracleUser,
          password: oraclePass,
          backupMode: 'RMAN_ARCHIVELOG_HOT'
        });
      } else {
        res = await api.testSql({
          serverAddress,
          instanceName,
          authType,
          username,
          password
        });
      }

      setTestResult(res);
      if (res.databases && res.databases.length > 0) {
        setSelectedDb(res.databases[0]);
        fetchTables(res.databases[0]);
      } else if (engineType === 'postgres') {
        setSelectedDb(pgDatabase);
      } else if (engineType === 'oracle') {
        setSelectedDb(oracleService);
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const fetchTables = async (dbName) => {
    setLoadingTables(true);
    try {
      const res = await api.getSqlTables({
        database: dbName || selectedDb,
        sqlType: engineType,
        serverAddress: engineType === 'mysql' ? mysqlHost : serverAddress
      });
      setTablesData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTables(false);
    }
  };

  const handlePreviewTable = async (tableName) => {
    try {
      const res = await api.previewSqlTable({
        database: selectedDb,
        table: tableName,
        sqlType: engineType
      });
      setPreviewTableData(res);
      setPreviewModalOpen(true);
    } catch (e) {
      alert("Tablo önizleme hatası: " + e.message);
    }
  };

  const handleRestoreTable = async (tableName) => {
    if (!window.confirm(`'${selectedDb}.${tableName}' tablosunu yedeğinden doğrudan canlı veritabanına kurtarmak istediğinize emin misiniz? (Granüler Kurtarma)`)) return;
    setRestoringTable(tableName);
    setRestoreTableSuccess(null);
    try {
      const res = await api.restoreSqlTable({
        database: selectedDb,
        table: tableName,
        targetDatabase: selectedDb
      });
      setRestoreTableSuccess(res);
      setTimeout(() => setRestoreTableSuccess(null), 5000);
    } catch (e) {
      alert("Tablo kurtarma hatası: " + e.message);
    } finally {
      setRestoringTable(null);
    }
  };

  const handleInstantBackup = async () => {
    if (!selectedDb) {
      alert("Lütfen önce bir veritabanı seçin.");
      return;
    }

    setExecutingBackup(true);
    setBackupSuccessMessage(null);

    try {
      const createRes = await api.createJob({
        name: `${engineType.toUpperCase()} [${selectedDb}] Canlı Yedek`,
        type: 'sql',
        sqlType: engineType,
        serverAddress: engineType === 'mysql' ? mysqlHost : engineType === 'postgres' ? pgHost : engineType === 'oracle' ? oracleHost : serverAddress,
        instanceName: engineType === 'mssql' ? instanceName : '',
        authType: engineType === 'mssql' ? authType : 'sql',
        username: engineType === 'mysql' ? mysqlUser : engineType === 'postgres' ? pgUser : engineType === 'oracle' ? oracleUser : username,
        password: engineType === 'mysql' ? mysqlPass : engineType === 'postgres' ? pgPass : engineType === 'oracle' ? oraclePass : password,
        databaseName: selectedDb,
        backupType: engineType === 'mssql' ? backupType : 'full',
        destinationId: 'dest-gdrive',
        schedule: '0 23 * * *',
        scheduleHuman: `Her gün 23:00 (${engineType.toUpperCase()} Canlı DB Yedeği)`,
        compress,
        encrypt: true,
        useVss: true,
        enabled: true
      });

      if (createRes.job) {
        await api.runJob(createRes.job.id);
        setBackupSuccessMessage(`'${selectedDb}' veritabanı için yedekleme görevi başarıyla başlatıldı!`);
        if (onJobCreated) onJobCreated();
      }
    } catch (err) {
      alert("SQL Yedekleme başlatma hatası: " + err.message);
    } finally {
      setExecutingBackup(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-6 h-6 text-[#0070e0]" />
            <span>Kurumsal Çoklu Veritabanı & RMAN Stüdyosu</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            MSSQL, PostgreSQL pg_dump/WAL, MySQL ve Oracle RMAN Hot Backup veritabanlarını canlı denetleyin, granüler tablo kurtarın ve anlık snapshot alın.
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner overflow-x-auto">
          <button
            onClick={() => { setEngineType('mssql'); setTestResult(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              engineType === 'mssql' ? 'bg-[#0070e0] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>MSSQL</span>
          </button>
          <button
            onClick={() => { setEngineType('postgres'); setTestResult(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              engineType === 'postgres' ? 'bg-[#0070e0] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL</span>
          </button>
          <button
            onClick={() => { setEngineType('mysql'); setTestResult(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              engineType === 'mysql' ? 'bg-[#0070e0] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>MySQL</span>
          </button>
          <button
            onClick={() => { setEngineType('oracle'); setTestResult(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              engineType === 'oracle' ? 'bg-[#0070e0] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Oracle RMAN</span>
          </button>
        </div>
      </div>

      {restoreTableSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-600" />
            <span>{restoreTableSuccess.message} ({restoreTableSuccess.restoredRows?.toLocaleString()} satır aktarıldı, Süre: {restoreTableSuccess.elapsedTime})</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px] font-bold">
            {restoreTableSuccess.integrityCheck}
          </span>
        </div>
      )}

      {backupSuccessMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{backupSuccessMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Connection Form */}
        <div className="lg:col-span-1 acronis-card p-5 bg-white space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Bağlantı Parametreleri</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600 font-bold">
              {engineType.toUpperCase()}
            </span>
          </div>

          {engineType === 'mssql' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">SQL Server Host</label>
                <input
                  type="text"
                  value={serverAddress}
                  onChange={(e) => setServerAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                  placeholder="127.0.0.1 veya localhost"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Instance Adı</label>
                <input
                  type="text"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                  placeholder="MSSQLSERVER veya SQLEXPRESS"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Yetkilendirme</label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0070e0]"
                >
                  <option value="windows">Windows Authentication (Trusted / NT AUTHORITY)</option>
                  <option value="sql">SQL Server Authentication (sa / user)</option>
                </select>
              </div>

              {authType === 'sql' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                      placeholder="sa"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Şifre</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {engineType === 'postgres' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">PostgreSQL Host</label>
                  <input
                    type="text"
                    value={pgHost}
                    onChange={(e) => setPgHost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="127.0.0.1"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Port</label>
                  <input
                    type="number"
                    value={pgPort}
                    onChange={(e) => setPgPort(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Veritabanı Adı</label>
                <input
                  type="text"
                  value={pgDatabase}
                  onChange={(e) => setPgDatabase(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                  placeholder="production_db"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kullanıcı</label>
                  <input
                    type="text"
                    value={pgUser}
                    onChange={(e) => setPgUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="postgres"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Şifre</label>
                  <input
                    type="password"
                    value={pgPass}
                    onChange={(e) => setPgPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          {engineType === 'mysql' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">MySQL Host</label>
                  <input
                    type="text"
                    value={mysqlHost}
                    onChange={(e) => setMysqlHost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="127.0.0.1"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Port</label>
                  <input
                    type="number"
                    value={mysqlPort}
                    onChange={(e) => setMysqlPort(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kullanıcı</label>
                  <input
                    type="text"
                    value={mysqlUser}
                    onChange={(e) => setMysqlUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="root"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Şifre</label>
                  <input
                    type="password"
                    value={mysqlPass}
                    onChange={(e) => setMysqlPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          {engineType === 'oracle' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Oracle Host</label>
                  <input
                    type="text"
                    value={oracleHost}
                    onChange={(e) => setOracleHost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="127.0.0.1"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Port</label>
                  <input
                    type="number"
                    value={oraclePort}
                    onChange={(e) => setOraclePort(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Service / SID</label>
                <input
                  type="text"
                  value={oracleService}
                  onChange={(e) => setOracleService(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                  placeholder="ORCL"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kullanıcı</label>
                  <input
                    type="text"
                    value={oracleUser}
                    onChange={(e) => setOracleUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="sys as sysdba"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Şifre</label>
                  <input
                    type="password"
                    value={oraclePass}
                    onChange={(e) => setOraclePass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full btn-acronis-primary py-2 text-xs flex items-center justify-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Bağlantı Kuruluyor...' : 'Sunucuya Bağlan & Tara'}</span>
          </button>
        </div>

        {/* Right 2 Columns: Database & Granular Table Recovery Explorer */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Active Database & Quick Actions */}
          <div className="acronis-card p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0070e0]" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Veritabanı Seçimi ve Canlı Yedekleme
                </h3>
              </div>
              {testResult && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" />
                  <span>{testResult.version || testResult.oracleVersion || 'Connected'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Aktif Veritabanı</label>
                <select
                  value={selectedDb}
                  onChange={(e) => {
                    setSelectedDb(e.target.value);
                    fetchTables(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs focus:outline-none focus:border-[#0070e0]"
                >
                  {testResult?.databases?.map(db => (
                    <option key={db} value={db}>🗄️ {db}</option>
                  )) || <option value="master">🗄️ master</option>}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Yedekleme Türü</label>
                <select
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs focus:outline-none focus:border-[#0070e0]"
                >
                  <option value="full">Full Database Backup (Tam Yedek)</option>
                  <option value="diff">Differential Backup (Fark Yedeği)</option>
                  <option value="log">Transaction Log / WAL Archive Backup</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={compress}
                    onChange={(e) => setCompress(e.target.checked)}
                    className="rounded text-[#0070e0]"
                  />
                  <span>Sıkıştırma (COMPRESSION)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={checksum}
                    onChange={(e) => setChecksum(e.target.checked)}
                    className="rounded text-[#0070e0]"
                  />
                  <span>Sağlama (CHECKSUM)</span>
                </label>
              </div>

              <button
                onClick={handleInstantBackup}
                disabled={executingBackup}
                className="btn-acronis-primary px-4 py-2 text-xs flex items-center gap-2 shadow-xs font-bold"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{executingBackup ? 'Yedek Alınıyor...' : 'Anlık Snapshot Al'}</span>
              </button>
            </div>
          </div>

          {/* Granular Item-Level Table Explorer Card */}
          <div className="acronis-card p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Granüler Tablo Kurtarma & Gezgini (Item-Level Table Explorer)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Tüm veritabanını geri yüklemeden sadece seçilen tek bir tabloyu doğrudan kurtarın.
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchTables(selectedDb)}
                disabled={loadingTables}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 hover:bg-slate-50 transition"
              >
                <RefreshCw className={`w-3 h-3 ${loadingTables ? 'animate-spin text-[#0070e0]' : ''}`} />
                <span>Yenile</span>
              </button>
            </div>

            {/* Table List */}
            {tablesData?.tables && tablesData.tables.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Tablo Adı</th>
                      <th className="px-3 py-2.5">Satır Sayısı</th>
                      <th className="px-3 py-2.5">Veri Boyutu</th>
                      <th className="px-3 py-2.5">Kategori</th>
                      <th className="px-4 py-2.5 text-right">Kurtarma & İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tablesData.tables.map((t) => (
                      <tr key={t.name} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 font-bold text-slate-800 font-mono">
                          {t.name}
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-700">
                          {t.rowCount?.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-500">
                          {t.dataSize}
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePreviewTable(t.name)}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                              title="Tablo Verilerini Önizle"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRestoreTable(t.name)}
                              disabled={restoringTable === t.name}
                              className="px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-[11px] font-bold flex items-center gap-1 transition"
                              title="Canlı Veritabanına Geri Yükle"
                            >
                              <RotateCcw className={`w-3 h-3 ${restoringTable === t.name ? 'animate-spin' : ''}`} />
                              <span>{restoringTable === t.name ? 'Kurtarılıyor...' : 'Granüler Kurtar'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                <Table className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">
                  {selectedDb ? `'${selectedDb}' Veritabanı İçin Tablo Bulunmuyor` : 'Bağlantı Kurulduğunda Tablolar Listelenecektir'}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Canlı veritabanındaki tabloları ve granüler kurtarma seçeneklerini listelemek için sol panelden "Sunucuya Bağlan & Tara" butonuna tıklayınız.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Table Preview Modal */}
      {previewModalOpen && previewTableData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {previewTableData.table} • Canlı Tablo Önizleme
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Toplam {previewTableData.totalRows?.toLocaleString()} kayıt içerisinden ilk 5 kayıt
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    {previewTableData.columns?.map(col => (
                      <th key={col} className="p-2.5 font-mono">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {previewTableData.rows?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {previewTableData.columns?.map(col => (
                        <td key={col} className="p-2.5 text-slate-700">{String(row[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
