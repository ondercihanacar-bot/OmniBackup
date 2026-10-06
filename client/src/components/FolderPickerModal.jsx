import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  HardDrive, 
  X, 
  Check, 
  RefreshCw,
  File,
  Plus,
  ArrowUp,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
  MinusSquare,
  ListTree,
  Search,
  FolderPlus,
  Database,
  Monitor
} from 'lucide-react';
import { api } from '../api';

export default function FolderPickerModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  onSelectPath, 
  currentSelectedPath, 
  initialPath,
  isDestination = false,
  initialExcludedPaths = []
}) {
  if (!isOpen) return null;

  const startingPath = currentSelectedPath || initialPath || 'C:\\';
  const [drives, setDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(false);
  
  // Tree expansion state: Map of path -> array of child items
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loadingNodes, setLoadingNodes] = useState({});

  // Active / Highlighted path (for navigation or single-folder destination selection)
  const [activePath, setActivePath] = useState(startingPath);
  const [pathInput, setPathInput] = useState(startingPath);

  // Source Selection Sets
  // includedPaths: Roots or explicit selections (e.g. ['C:\\Test'])
  const [includedPaths, setIncludedPaths] = useState(() => {
    const s = new Set();
    if (startingPath && startingPath !== 'C:\\') {
      s.add(startingPath);
    }
    return s;
  });

  // excludedPaths: Sub-items explicitly unchecked under an included path (e.g. ['C:\\Test\\Temp'])
  const [excludedPaths, setExcludedPaths] = useState(() => {
    return new Set(initialExcludedPaths || []);
  });

  // New Folder creation inline modal
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  // Search filter
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    loadDrives();
  }, []);

  const normalizePath = (p) => {
    if (!p) return '';
    let norm = p.replace(/\//g, '\\');
    return norm;
  };

  const loadDrives = async () => {
    setLoadingDrives(true);
    try {
      const data = await api.getDrives();
      let driveList = [];
      if (Array.isArray(data) && data.length > 0) {
        driveList = data;
      } else {
        driveList = [
          { name: 'C:\\', label: 'C: (Yerel Disk)' },
          { name: 'D:\\', label: 'D: (Depolama)' }
        ];
      }
      setDrives(driveList);

      // Auto-expand the drive of startingPath
      const targetDrive = driveList.find(d => 
        startingPath.toUpperCase().startsWith(d.name.toUpperCase().substring(0, 2))
      ) || driveList[0];

      if (targetDrive) {
        expandNode(targetDrive.name);
      }
    } catch (e) {
      console.error("Drives load error:", e);
      const fallback = [
        { name: 'C:\\', label: 'C: (Yerel Disk)' },
        { name: 'D:\\', label: 'D: (Depolama)' }
      ];
      setDrives(fallback);
      expandNode('C:\\');
    } finally {
      setLoadingDrives(false);
    }
  };

  const expandNode = async (targetPath) => {
    const norm = normalizePath(targetPath);
    setLoadingNodes(prev => ({ ...prev, [norm]: true }));
    try {
      const res = await api.listDir(norm);
      if (res && res.success) {
        setExpandedNodes(prev => ({ ...prev, [norm]: res.items || [] }));
      } else {
        setExpandedNodes(prev => ({ ...prev, [norm]: [] }));
      }
    } catch (err) {
      console.error("Error expanding node:", err);
      setExpandedNodes(prev => ({ ...prev, [norm]: [] }));
    } finally {
      setLoadingNodes(prev => ({ ...prev, [norm]: false }));
    }
  };

  const toggleExpand = (targetPath, e) => {
    if (e) e.stopPropagation();
    const norm = normalizePath(targetPath);
    if (expandedNodes[norm]) {
      // Collapse
      const next = { ...expandedNodes };
      delete next[norm];
      setExpandedNodes(next);
    } else {
      expandNode(norm);
    }
  };

  // --------------------------------------------------------------------------
  // INHERITANCE & EXCLUSION CHECKBOX LOGIC
  // --------------------------------------------------------------------------
  const isItemChecked = (targetPath) => {
    const norm = normalizePath(targetPath).toLowerCase();

    // 1. If this path or an ancestor is in excludedPaths, it is NOT checked
    for (const ex of excludedPaths) {
      const exNorm = normalizePath(ex).toLowerCase();
      if (norm === exNorm || norm.startsWith(exNorm + '\\')) {
        return false;
      }
    }

    // 2. If this path or an ancestor is in includedPaths, it IS checked
    for (const inc of includedPaths) {
      const incNorm = normalizePath(inc).toLowerCase();
      if (norm === incNorm || norm.startsWith(incNorm + '\\')) {
        return true;
      }
    }

    return false;
  };

  const toggleSelect = (itemPath, isDirectory = false, e) => {
    if (e) e.stopPropagation();
    const norm = normalizePath(itemPath);
    const normLower = norm.toLowerCase();
    const currentlyChecked = isItemChecked(norm);

    if (currentlyChecked) {
      // User wants to UNCHECK this item
      // Check if an ancestor is in includedPaths
      const hasIncludedAncestor = Array.from(includedPaths).some(inc => {
        const incLower = normalizePath(inc).toLowerCase();
        return normLower !== incLower && normLower.startsWith(incLower + '\\');
      });

      if (hasIncludedAncestor) {
        // Exclude this specific sub-folder / file
        setExcludedPaths(prev => new Set([...prev, norm]));
      } else {
        // Remove from includedPaths
        setIncludedPaths(prev => {
          const next = new Set();
          for (const inc of prev) {
            if (normalizePath(inc).toLowerCase() !== normLower) {
              next.add(inc);
            }
          }
          return next;
        });

        // Also clean any excludedPaths under this node
        setExcludedPaths(prev => {
          const next = new Set();
          for (const ex of prev) {
            if (!normalizePath(ex).toLowerCase().startsWith(normLower + '\\')) {
              next.add(ex);
            }
          }
          return next;
        });
      }
    } else {
      // User wants to CHECK this item
      // 1. If it was excluded, remove from excludedPaths
      let removedFromExcluded = false;
      setExcludedPaths(prev => {
        const next = new Set();
        for (const ex of prev) {
          const exLower = normalizePath(ex).toLowerCase();
          if (normLower === exLower || exLower.startsWith(normLower + '\\')) {
            removedFromExcluded = true;
          } else {
            next.add(ex);
          }
        }
        return next;
      });

      // 2. If no ancestor was included, add directly to includedPaths
      const hasIncludedAncestor = Array.from(includedPaths).some(inc => {
        const incLower = normalizePath(inc).toLowerCase();
        return normLower !== incLower && normLower.startsWith(incLower + '\\');
      });

      if (!hasIncludedAncestor) {
        setIncludedPaths(prev => new Set([...prev, norm]));
      }
    }

    setActivePath(norm);
    setPathInput(norm);
  };

  // --------------------------------------------------------------------------
  // CREATE FOLDER HANDLER
  // --------------------------------------------------------------------------
  const handleCreateFolder = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    let targetDir = activePath || startingPath;
    if (!targetDir.endsWith('\\') && !targetDir.endsWith('/')) {
      targetDir += '\\';
    }
    const fullNewPath = targetDir + trimmed;

    setCreating(true);
    try {
      const res = await api.createDir(fullNewPath);
      if (res && res.success) {
        setIsCreatingFolder(false);
        setNewFolderName('');
        setActivePath(fullNewPath);
        setPathInput(fullNewPath);

        // Re-expand parent to show the new folder
        await expandNode(targetDir);

        if (isDestination) {
          // In destination mode, auto-select newly created folder
          setActivePath(fullNewPath);
        } else {
          // In source mode, auto-check newly created folder
          setIncludedPaths(prev => new Set([...prev, fullNewPath]));
        }
      } else {
        alert("Klasör oluşturulamadı: " + (res?.error || "Erişim izni hatası"));
      }
    } catch (err) {
      alert("Klasör oluşturulurken hata meydana geldi: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  // --------------------------------------------------------------------------
  // CONFIRM HANDLER
  // --------------------------------------------------------------------------
  const handleConfirm = () => {
    if (isDestination) {
      // Destination mode: selected single folder path
      const chosenPath = activePath || pathInput || 'D:\\Backups';
      if (typeof onSelect === 'function') {
        onSelect(chosenPath, [chosenPath], []);
      }
      if (typeof onSelectPath === 'function') {
        onSelectPath(chosenPath, [chosenPath], []);
      }
      onClose();
      return;
    }

    // Source mode: multi-selection with exclusions
    const includedArray = Array.from(includedPaths);
    const excludedArray = Array.from(excludedPaths);
    
    let mainPath = activePath;
    if (includedArray.length > 0) {
      if (activePath && includedArray.includes(activePath)) {
        mainPath = activePath;
      } else {
        mainPath = includedArray[includedArray.length - 1];
      }
    } else {
      mainPath = activePath || 'C:\\';
      includedArray.push(mainPath);
    }

    // Ensure mainPath is always first in the returned list
    const finalIncluded = [mainPath, ...includedArray.filter(p => p !== mainPath)];

    if (typeof onSelect === 'function') {
      onSelect(mainPath, finalIncluded, excludedArray);
    }
    if (typeof onSelectPath === 'function') {
      onSelectPath(mainPath, finalIncluded, excludedArray);
    }
    onClose();
  };

  // --------------------------------------------------------------------------
  // RENDER RECURSIVE TREE NODE
  // --------------------------------------------------------------------------
  const renderNode = (item, depth = 0) => {
    const norm = normalizePath(item.path);
    const isExpanded = !!expandedNodes[norm];
    const isLoading = !!loadingNodes[norm];
    const isChecked = !isDestination && isItemChecked(norm);
    const isActiveTarget = isDestination && activePath.toLowerCase() === norm.toLowerCase();
    const children = expandedNodes[norm] || [];

    // Filter by text if searching
    if (filterText && !item.name.toLowerCase().includes(filterText.toLowerCase()) && !isExpanded) {
      // Keep showing if children might match
    }

    return (
      <div key={norm} className="flex flex-col">
        <div 
          onClick={() => {
            setActivePath(norm);
            setPathInput(norm);
            if (item.isDirectory && !isExpanded) {
              expandNode(norm);
            }
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer select-none group ${
            isActiveTarget 
              ? 'bg-blue-600 text-white font-bold shadow-xs' 
              : isChecked 
              ? 'bg-blue-900/35 border border-blue-500/40 text-blue-200' 
              : activePath.toLowerCase() === norm.toLowerCase()
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'hover:bg-slate-800/60 text-slate-200'
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 20 + 12)}px` }}
        >
          {/* Left: Expand Arrow + Checkbox (or Radio) + Icon + Name */}
          <div className="flex items-center gap-2 truncate flex-1 min-w-0">
            {/* Expand / Collapse Toggle Arrow */}
            {item.isDirectory ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(norm, e)}
                className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                ) : isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                )}
              </button>
            ) : (
              <div className="w-5 shrink-0" /> // Spacer for alignment
            )}

            {/* Selection Checkbox (Source Mode) or Target Selector (Dest Mode) */}
            {!isDestination ? (
              <button
                type="button"
                onClick={(e) => toggleSelect(norm, item.isDirectory, e)}
                className="p-0.5 rounded text-slate-400 hover:text-white transition shrink-0"
                title={isChecked ? "İşareti Kaldır (Bu dosyayı/klasörü yedeğe alma)" : "İşaretle (Yedeğe dahil et)"}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                )}
              </button>
            ) : (
              <div className="w-2" />
            )}

            {/* Folder / File Icon */}
            {item.isDirectory ? (
              isExpanded ? (
                <FolderOpen className={`w-4 h-4 shrink-0 ${isActiveTarget ? 'text-white' : 'text-amber-400'}`} />
              ) : (
                <Folder className={`w-4 h-4 shrink-0 ${isActiveTarget ? 'text-white' : 'text-amber-400'}`} />
              )
            ) : (
              <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}

            {/* Item Name */}
            <span className="truncate font-mono text-[11.5px]">{item.name}</span>
          </div>

          {/* Right: File Size / Sub-actions */}
          <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-400 shrink-0 pl-2">
            {!item.isDirectory && item.sizeFormatted && (
              <span className="text-[10px] text-slate-400">{item.sizeFormatted}</span>
            )}
            {!isDestination && item.isDirectory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIncludedPaths(new Set([norm]));
                  setExcludedPaths(new Set());
                  setActivePath(norm);
                  setPathInput(norm);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-sans transition ${
                  isChecked && includedPaths.size === 1 && includedPaths.has(norm)
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-850 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                }`}
                title="Sadece bu klasörü ana yedek kaynağı olarak seç"
              >
                {isChecked && includedPaths.size === 1 && includedPaths.has(norm) ? '✓ Seçili' : 'Bu Klasörü Seç'}
              </button>
            )}
            {isDestination && item.isDirectory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePath(norm);
                  setPathInput(norm);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-sans transition ${
                  isActiveTarget 
                    ? 'bg-white text-blue-700 font-bold' 
                    : 'bg-slate-800 hover:bg-slate-700 text-sky-300'
                }`}
              >
                {isActiveTarget ? '✓ Seçili Hedef' : 'Hedef Yap'}
              </button>
            )}
          </div>
        </div>

        {/* Render Expanded Children */}
        {isExpanded && (
          <div className="flex flex-col border-l border-slate-800/80 ml-4.5 my-0.5">
            {children.length === 0 ? (
              <div 
                className="py-1 text-[11px] text-slate-400 italic" 
                style={{ paddingLeft: `${Math.max(16, (depth + 1) * 20)}px` }}
              >
                (Boş klasör)
              </div>
            ) : (
              children.map(child => renderNode(child, depth + 1))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl h-[88vh] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
        
        {/* Pinned Modal Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ListTree className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isDestination ? 'Hedef Depolama Klasörünü Seçin' : 'Tüm Sürücüler & Dosya Ağacı'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-mono">
                  {isDestination ? 'HEDEF SEÇİMİ' : 'KAYNAK SEÇİMİ'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {isDestination 
                  ? 'Yedeklerin aktarılacağı sürücü ve klasörü seçin veya yeni klasör oluşturun.' 
                  : 'Ağaçtan ana klasörü seçtiğinizde tüm alt klasörler otomatik alınır; istemediğiniz alt dosyaların işaretini kaldırabilirsiniz.'}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Path Bar & Quick Actions */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Path Display / Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-slate-400 text-xs font-semibold shrink-0">Konum:</span>
            <div className="flex items-center gap-1.5 flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <HardDrive className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <input
                type="text"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActivePath(pathInput);
                    expandNode(pathInput);
                  }
                }}
                className="w-full bg-transparent text-white font-mono text-[11px] focus:outline-none"
                placeholder="Örn: C:\Test veya D:\Backups"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Aktif klasörün içine yeni klasör aç"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Yeni Klasör</span>
            </button>

            <button
              type="button"
              onClick={() => {
                loadDrives();
                setExpandedNodes({});
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Ağacı Yenile"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline Create Folder Input Panel */}
        {isCreatingFolder && (
          <form onSubmit={handleCreateFolder} className="px-5 py-2.5 bg-emerald-950/40 border-b border-emerald-800/50 flex items-center justify-between gap-3 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2 flex-1">
              <FolderPlus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-200 font-semibold shrink-0">Yeni Klasör Adı:</span>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Örn: Yedekler_2026"
                className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-emerald-600 text-white text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={creating || !newFolderName.trim()}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {creating ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </form>
        )}

        {/* UNIFIED TREE VIEW: ALL DRIVES AT THE ROOT, EXPANDING DOWNWARDS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {loadingDrives ? (
            <div className="flex items-center justify-center h-48 gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
              <span>Sürücüler ve dosya ağacı taranıyor...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Computer Root Header */}
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Bu Bilgisayar (Tüm Sürücüler & Depolama Alanları)</span>
              </div>

              {/* All Drives Rendered in the Same Unified Tree */}
              {drives.map(drive => {
                const driveNorm = normalizePath(drive.name);
                const isExpanded = !!expandedNodes[driveNorm];
                const isLoading = !!loadingNodes[driveNorm];
                const isChecked = !isDestination && isItemChecked(driveNorm);
                const isActiveTarget = isDestination && activePath.toLowerCase().startsWith(driveNorm.toLowerCase());
                const driveItems = expandedNodes[driveNorm] || [];

                return (
                  <div key={driveNorm} className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/80 mb-2">
                    {/* Drive Header Node */}
                    <div 
                      onClick={() => {
                        setActivePath(driveNorm);
                        setPathInput(driveNorm);
                        if (!isExpanded) expandNode(driveNorm);
                      }}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors cursor-pointer select-none ${
                        activePath.toLowerCase() === driveNorm.toLowerCase()
                          ? 'bg-slate-800 text-cyan-300'
                          : 'hover:bg-slate-800/50 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {/* Expand / Collapse Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(driveNorm, e)}
                          className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                          ) : isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {/* Checkbox (Source Mode) */}
                        {!isDestination && (
                          <button
                            type="button"
                            onClick={(e) => toggleSelect(driveNorm, true, e)}
                            className="p-0.5 rounded text-slate-400 hover:text-white transition shrink-0"
                            title="Tüm sürücüyü seç / kaldır"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        )}

                        <HardDrive className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="font-semibold">{drive.label || drive.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isDestination && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePath(driveNorm);
                              setPathInput(driveNorm);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-sans transition ${
                              activePath.toLowerCase() === driveNorm.toLowerCase()
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Kök Dizini Seç
                          </button>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isExpanded ? `${driveItems.length} Öğe` : 'Açmak için tıkla ▶'}
                        </span>
                      </div>
                    </div>

                    {/* Children of this drive */}
                    {isExpanded && (
                      <div className="p-1.5 space-y-0.5 border-t border-slate-800/80 bg-slate-900/50">
                        {driveItems.length === 0 ? (
                          <div className="py-2 px-6 text-xs text-slate-400 italic">
                            (Bu sürücüde görüntülenecek dosya veya klasör bulunamadı)
                          </div>
                        ) : (
                          driveItems.map(item => renderNode(item, 1))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned Bottom Status & Confirmation Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            
            {isDestination ? (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Hedef Konum:</span>
                <span className="font-mono text-cyan-300 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {activePath || startingPath}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap max-w-[60vw]">
                <span className="text-slate-400 font-semibold shrink-0">Seçili Kaynaklar:</span>
                {Array.from(includedPaths).map(p => (
                  <span key={p} className="font-mono text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-cyan-800/60 flex items-center gap-1.5 text-[11px] shadow-2xs">
                    <span className="truncate max-w-[200px]">{p}</span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIncludedPaths(prev => {
                          const next = new Set(prev);
                          next.delete(p);
                          return next;
                        });
                      }}
                      className="text-slate-400 hover:text-rose-400 text-xs px-1 hover:bg-slate-800 rounded transition"
                      title="Seçimi kaldır"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {includedPaths.size === 0 && (
                  <span className="text-slate-500 italic text-[11px]">Henüz bir klasör seçilmedi</span>
                )}
                {includedPaths.size > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIncludedPaths(new Set());
                      setExcludedPaths(new Set());
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline font-semibold px-1"
                  >
                    Tümünü Temizle
                  </button>
                )}

                {excludedPaths.size > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-mono font-semibold">
                    {excludedPaths.size} Öğe Hariç Tutuldu
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              İptal
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="btn-acronis-primary px-5 py-2 text-xs font-bold shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isDestination ? 'Hedefi Onayla & Kaydet' : 'Seçimi Onayla'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
