import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Copy, Sparkles, Image as ImageIcon, X, Video, Search, BookOpen, 
  LayoutTemplate, Zap, BrainCircuit, Rocket, ExternalLink, Check, Key, Loader2,
  Headphones, FileText, Layers, GraduationCap, Network, PieChart, MonitorPlay, 
  Table, RefreshCw, Bot, Terminal, Globe, ShieldCheck, Box, Database, MessageSquare,
  Cpu, LayoutDashboard, History, Music
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export enum AiPlatform {
  GEMINI = 'Gemini LLM',
  NOTEBOOK_LM = 'NotebookLM'
}

export enum ModelMode {
  FAST = 'Fast',
  THINKING = 'Thinking Mode',
  PRO = 'Pro'
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface GeminiTool {
  title: string;
  description: string;
}

export interface DynamicConfig {
  geminiTools: GeminiTool[];
  notebookGoals: Record<string, Record<string, string[]>>;
  rules: string;
  lastUpdated?: string;
}

// --- INITIAL DEFAULTS (Strictly based on User Input for Google AI Pro) ---
const INITIAL_GEMINI_TOOLS: GeminiTool[] = [
  { title: "Bild erstellen", description: "Erstelle hochauflösende Bilder mit dem neuesten Google Nano Banana 2 Modell." },
  { title: "Canvas", description: "Ein geteilter Arbeitsbereich zum gemeinsamen Schreiben, Überarbeiten und Formatieren von langen Texten oder Code." },
  { title: "Deep Research", description: "Tiefgehende Internetrecherche, die mehrere Quellen kombiniert und umfassende Berichte erstellt." },
  { title: "Video erstellen", description: "Generiere kurze, eindrucksvolle Videoclips basierend auf deinen Textbeschreibungen (Veo)." },
  { title: "Musik erstellen", description: "Erstelle maßgeschneiderte Audio-Tracks, Jingles oder Hintergrundmusik." },
  { title: "Lernhilfe", description: "Dein persönlicher Tutor zur Vorbereitung auf Prüfungen, zum Erklären von Konzepten oder Vokabeln." }
];

const INITIAL_NOTEBOOK_CONFIG: Record<string, Record<string, string[]>> = {
  'Audio-Zusammenfassung': {
    "Format": ["Detaillierte Analyse", "Zusammenfassung", "kritische Bewertung", "Diskussion"],
    "Länge": ["Kurz", "Standard"]
  },
  'Präsentation': {
    "Format": ["Detaillierte Präsentation", "Folien für Vortragende"],
    "Länge": ["Kurz", "Standard"]
  },
  'Videoübersicht': {
    "Format": ["Erklärvideo", "Zusammenfassung"],
    "Visueller Stil": ["automatische Auswahl", "Benutzer definiert", "klassisch Whiteboard", "Kawaii", "Anime", "Wasserfarben Retro-Druck", "traditionell", "Papierkunst"]
  },
  'Mindmap': {
    // Hat absichtlich keine gesonderten Optionen
  },
  'Berichte': {
    "Format": ["Eigenen Bericht erstellen", "Überblick", "Lernplan", "Blog Post"]
  },
  'Karteikarten': {
    "Schwierigkeitsgrad": ["einfach", "mittel", "schwierig"]
  },
  'Quiz': {
    "Schwierigkeitsgrad": ["einfach", "mittel", "schwierig"]
  },
  'Infografik': {
    "Ausrichtung": ["Querformat", "Hochformat", "Quadrat"],
    "Visueller Stil": ["Automatische Auswahl", "Sketch Note", "Kawaii", "Professionell", "Wissenschaft", "Anime", "Tonfigur", "Editorial", "Anleitung", "Bento", "Grid", "Ziegelsteine"],
    "Detaillierungsgrad": ["kurz gefasst", "Standard", "detailliert(Beta)"]
  },
  'Datentabelle': {
    "Sprache": ["Deutsch", "Englisch", "Spanisch", "Französisch"]
  }
};

const INITIAL_RULES = "1. Sei präzise und klar.\n2. Gib ausreichend Kontext.\n3. Definiere eine Rolle/Persona für die KI.";

// --- API KEY MODAL COMPONENT ---
interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  initialKey: string;
  forceOpen: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, initialKey, forceOpen }) => {
  const [keyInput, setKeyInput] = useState(initialKey);

  useEffect(() => {
    setKeyInput(initialKey);
  }, [initialKey, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-indigo-600 mb-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Key size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Google Gemini API Key</h2>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Um diesen Prompt-Generator zu nutzen, benötigst du einen API Key von Google.
          Der Key wird <strong>nur lokal in deinem Browser</strong> gespeichert.
        </p>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Dein API Key</label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full p-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono text-sm"
          />
        </div>
        <div className="flex gap-3 pt-2">
          {!forceOpen && (
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Abbrechen
            </button>
          )}
          <button
            onClick={() => onSave(keyInput)}
            disabled={!keyInput.trim()}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            Speichern
          </button>
        </div>
        <div className="pt-3 mt-1 border-t border-gray-100">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold transition-all border border-blue-200"
          >
            <ExternalLink size={16} />
            API Key kostenlos holen
          </a>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [appConfig, setAppConfig] = useState<DynamicConfig>({
    geminiTools: INITIAL_GEMINI_TOOLS,
    notebookGoals: INITIAL_NOTEBOOK_CONFIG,
    rules: INITIAL_RULES,
    lastUpdated: "Standard (Lokale Defaults)"
  });
  const [isUpdatingConfig, setIsUpdatingConfig] = useState<boolean>(false);

  // Platform & Tool Selection
  const [selectedPlatform, setSelectedPlatform] = useState<AiPlatform>(AiPlatform.GEMINI);
  const [selectedTool, setSelectedTool] = useState<string>(INITIAL_GEMINI_TOOLS[0].title);
  const [selectedMode, setSelectedMode] = useState<ModelMode>(ModelMode.FAST);
  
  // Dynamic NotebookLM Selections
  const initialGoal = Object.keys(INITIAL_NOTEBOOK_CONFIG)[0];
  const [notebookGoal, setNotebookGoal] = useState<string>(initialGoal);
  const [notebookSelections, setNotebookSelections] = useState<Record<string, string>>({});

  // I/O State
  const [userInput, setUserInput] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    const storedConfig = localStorage.getItem('gemini_dynamic_config');
    
    if (storedKey) setApiKey(storedKey);
    else setIsKeyModalOpen(true);

    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        
        // Deep Merge Logic zur Sicherheit (damit niemals Tools verloren gehen)
        const mergedNotebookGoals = { ...INITIAL_NOTEBOOK_CONFIG };
        if (parsed.notebookGoals) {
           Object.keys(parsed.notebookGoals).forEach(key => {
             // Wenn das Tool auch von der KI gefunden wurde, nehmen wir die Optionen dazu
             if (!mergedNotebookGoals[key]) mergedNotebookGoals[key] = {};
             mergedNotebookGoals[key] = { ...mergedNotebookGoals[key], ...parsed.notebookGoals[key] };
           });
        }
        
        const mergedGeminiTools = [...INITIAL_GEMINI_TOOLS];
        if (parsed.geminiTools && Array.isArray(parsed.geminiTools)) {
            parsed.geminiTools.forEach((t: GeminiTool) => {
               if (!mergedGeminiTools.find(bt => bt.title.toLowerCase() === t.title.toLowerCase())) {
                   mergedGeminiTools.push(t);
               }
            });
        }

        const finalConfig = {
            ...parsed,
            geminiTools: mergedGeminiTools,
            notebookGoals: mergedNotebookGoals
        };

        setAppConfig(finalConfig);
        setSelectedTool(finalConfig.geminiTools[0]?.title || INITIAL_GEMINI_TOOLS[0].title);
        const firstGoal = Object.keys(finalConfig.notebookGoals)[0];
        if (firstGoal) setNotebookGoal(firstGoal);
      } catch (e) {
        console.error("Config Load Error", e);
      }
    }
  }, []);

  // Update NotebookLM Selections when Goal changes
  useEffect(() => {
    if (selectedPlatform === AiPlatform.NOTEBOOK_LM) {
      const currentGoalConfig = appConfig.notebookGoals[notebookGoal];
      const newSelections: Record<string, string> = {};
      if (currentGoalConfig) {
        Object.keys(currentGoalConfig).forEach(category => {
          newSelections[category] = currentGoalConfig[category][0] || "";
        });
      }
      setNotebookSelections(newSelections);
    }
  }, [notebookGoal, selectedPlatform, appConfig]);

  const handleNotebookSelectionChange = (category: string, value: string) => {
    setNotebookSelections(prev => ({ ...prev, [category]: value }));
  };

  // --- API LOGIC (UPDATE BUTTON) ---
  const fetchDynamicConfig = async (currentKey: string) => {
    if (!currentKey) return;
    setIsUpdatingConfig(true);
    try {
      const currentNotebookCategories = Object.keys(INITIAL_NOTEBOOK_CONFIG).map(k => `"${k}"`).join(", ");
      const currentGeminiTools = INITIAL_GEMINI_TOOLS.map(t => `"${t.title}"`).join(", ");
      
      const prompt = `
        Du bist der System-Updater für einen Prompt-Generator. Recherchiere AKTUELL IM INTERNET die allerneuesten, offiziellen Funktionen von Google Gemini (NUR PRO Abo) und NotebookLM.
        
        WICHTIGE REGELN FÜR DEINE RECHERCHE UND ANTWORT:
        1. SCHLIESSE Ultra-Features komplett aus. Liste NUR Funktionen, die für "Google AI Pro" Abonnenten verfügbar sind.
        2. FÜR GEMINI: Du MUSST ZWINGEND exakt diese Basis-Tools beibehalten: ${currentGeminiTools}. Recherchiere lediglich, ob ein NEUES, echtes Tool (wie z.B. eine neue Art von Studio-Werkzeug) hinzugekommen ist.
        3. FÜR NOTEBOOKLM: Du MUSST ZWINGEND exakt diese 9 Hauptkategorien beibehalten: ${currentNotebookCategories}. Recherchiere lediglich, ob es neue Unterpunkte für diese Kategorien gibt oder ob eine 10. Studio-Kategorie veröffentlicht wurde.
        
        Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt. Verwende keine Markdown-Formatierungen.
        {
            "geminiTools": [
                { "title": "Name des klickbaren Tools", "description": "Ein kurzer, prägnanter Erklärsatz dazu" }
            ],
            "notebookGoals": {
                "Titel der Kategorie (z.B. Audio-Zusammenfassung)": {
                  "Name der Einstellungskategorie (z.B. Format)": ["Option 1", "Option 2"]
                }
            },
            "rules": "Ein Fließtext mit den tagesaktuellen Google Prompting-Regeln."
        }
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }] 
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText) {
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const newConfig = JSON.parse(cleanText) as DynamicConfig;
        
        // --- DAS SCHUTZGITTER (Merge Logic) ---
        const mergedNotebookGoals = { ...INITIAL_NOTEBOOK_CONFIG };
        if (newConfig.notebookGoals) {
           Object.keys(newConfig.notebookGoals).forEach(key => {
             if (!mergedNotebookGoals[key]) mergedNotebookGoals[key] = {};
             // Fügt neue Optionen zu bestehenden oder erstellt ganz neue Kategorien
             mergedNotebookGoals[key] = { ...mergedNotebookGoals[key], ...newConfig.notebookGoals[key] };
           });
        }
        
        const mergedGeminiTools = [...INITIAL_GEMINI_TOOLS];
        if (newConfig.geminiTools && Array.isArray(newConfig.geminiTools)) {
            newConfig.geminiTools.forEach((t: GeminiTool) => {
               if (!mergedGeminiTools.find(bt => bt.title.toLowerCase() === t.title.toLowerCase())) {
                   mergedGeminiTools.push(t); // Nur anhängen, wenn es ein komplett neues Tool ist
               }
            });
        }
        
        const finalConfig = {
            rules: newConfig.rules || INITIAL_RULES,
            geminiTools: mergedGeminiTools,
            notebookGoals: mergedNotebookGoals,
            lastUpdated: new Date().toLocaleString('de-DE')
        };
        
        setAppConfig(finalConfig);
        localStorage.setItem('gemini_dynamic_config', JSON.stringify(finalConfig));
        
        setSelectedTool(finalConfig.geminiTools[0]?.title || INITIAL_GEMINI_TOOLS[0].title);
        const firstGoal = Object.keys(finalConfig.notebookGoals)[0];
        if (firstGoal) setNotebookGoal(firstGoal);
      }
    } catch (e: any) {
      console.error("Fehler beim Update:", e);
      alert(`Update fehlgeschlagen:\n${e.message}\nBitte prüfe deinen API Key.`);
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const executePromptGeneration = async () => {
    if (!userInput.trim() && uploadedImages.length === 0) {
      alert("Bitte gib einen Text ein oder lade ein Bild hoch.");
      return;
    }
    if (!apiKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      let sysMsg = "";

      if (selectedPlatform === AiPlatform.GEMINI) {
        sysMsg = `Du bist ein professioneller Prompt Architect. Der Nutzer möchte das Tool '${selectedTool}' im Modus '${selectedMode}' nutzen. 
        WICHTIG! Wende bei der Erstellung des Prompts zwingend diese offiziellen Regeln an:
        ${appConfig.rules}
        Erstelle aus der folgenden Nutzerbeschreibung den perfekten, hochoptimierten Prompt, zugeschnitten auf das Tool ${selectedTool}.
        Antworte AUSSCHLIESSLICH mit dem fertigen Prompt ohne Meta-Kommentare.`;
      } else {
        const settingsString = Object.entries(notebookSelections)
          .map(([key, val]) => `- ${key}: '${val}'`)
          .join('\n        ');

        sysMsg = `Du bist ein Experte für NotebookLM. Erstelle eine perfekte Instruktion oder ein Prompt-Template für das Ziel '${notebookGoal}'.
        ${settingsString ? `Der Nutzer hat folgende Einstellungen für das Studio-Tool gewählt:\n        ${settingsString}` : ''}

        WICHTIG! Wende zwingend diese offiziellen Regeln an:
        ${appConfig.rules}
        Antworte AUSSCHLIESSLICH mit der fertigen Instruktion ohne Meta-Kommentare.`;
      }

      const parts: any[] = [{ text: `Nutzerbeschreibung:\n${userInput}` }];
      
      if (selectedPlatform === AiPlatform.GEMINI && uploadedImages.length > 0) {
        for (const img of uploadedImages) {
          const base64Data = img.base64.split(',')[1];
          parts.push({ inlineData: { data: base64Data, mimeType: img.mimeType } });
        }
      }

      // Gemini 2.5 Flash ist superschnell, 2.5 Pro für komplexere Tasks (oder "Thinking" Mode Simulation)
      const modelName = selectedMode === ModelMode.PRO ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sysMsg }] },
          contents: [{ parts }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setGeneratedPrompt(responseText || "Es konnte kein Text generiert werden.");
    } catch (error: any) {
      console.error(error);
      setGeneratedPrompt(`Ein Fehler ist aufgetreten: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    if (!apiKey) return;
    setIsTranscribing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const parts = [
            { text: "Erstelle ein präzises Transkript dieser Audioaufnahme in der gesprochenen Sprache. Gib nur den Text aus." },
            { inlineData: { data: base64Audio, mimeType: 'audio/webm' } }
        ];

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          setUserInput(prev => prev.trim() ? `${prev.trim()}\n[Audio]: ${responseText}` : responseText);
        }
        setIsTranscribing(false);
      };
    } catch (err) {
      console.error("Transcription failed:", err);
      setIsTranscribing(false);
    }
  };

  // --- EVENT HANDLERS ---
  const handleSaveKey = (key: string) => {
    if (key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
      setApiKey(key.trim());
      setIsKeyModalOpen(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Mikrofon-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newImages: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push({ file, previewUrl: URL.createObjectURL(file), base64, mimeType: file.type });
    }
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => setUploadedImages(prev => prev.filter((_, i) => i !== index));

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleOpenAiTool = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
    const url = selectedPlatform === AiPlatform.NOTEBOOK_LM ? 'https://notebooklm.google.com/' : 'https://gemini.google.com/app';
    window.open(url, '_blank');
  };

  // --- DYNAMIC ICON HELPERS ---
  const getDynamicIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('video')) return <Video size={18} />;
    if (lower.includes('bild') || lower.includes('imagen')) return <ImageIcon size={18} />;
    if (lower.includes('research') || lower.includes('suche')) return <Search size={18} />;
    if (lower.includes('canvas') || lower.includes('layout')) return <LayoutTemplate size={18} />;
    if (lower.includes('lern') || lower.includes('kartei')) return <Layers size={18} />;
    if (lower.includes('audio') || lower.includes('sprach') || lower.includes('live')) return <Headphones size={18} />;
    if (lower.includes('bericht') || lower.includes('dokument')) return <FileText size={18} />;
    if (lower.includes('quiz') || lower.includes('frage')) return <GraduationCap size={18} />;
    if (lower.includes('mindmap') || lower.includes('netz') || lower.includes('map')) return <Network size={18} />;
    if (lower.includes('tabelle') || lower.includes('daten')) return <Database size={18} />;
    if (lower.includes('präsent') || lower.includes('slide')) return <MonitorPlay size={18} />;
    if (lower.includes('musik') || lower.includes('music')) return <Music size={18} />;
    if (lower.includes('workspace') || lower.includes('integration')) return <Globe size={18} />;
    if (lower.includes('gems') || lower.includes('custom')) return <Box size={18} />;
    return <Sparkles size={18} />;
  };

  const currentNotebookOptions = appConfig.notebookGoals[notebookGoal] || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans text-slate-800 relative">
      
      {/* Top Left Rules Update Button */}
      <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-1">
        <button
          onClick={() => fetchDynamicConfig(apiKey)}
          disabled={isUpdatingConfig || !apiKey}
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 rounded-lg text-xs font-bold shadow-sm transition-all ${isUpdatingConfig ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <RefreshCw size={14} className={isUpdatingConfig ? "animate-spin" : ""} />
          <span className="hidden sm:inline">{isUpdatingConfig ? "Lade Live-Update..." : "Tools & Regeln Live Aktualisieren"}</span>
        </button>
        {appConfig.lastUpdated && (
           <span className="text-[10px] text-gray-400 pl-1 font-mono">Stand: {appConfig.lastUpdated}</span>
        )}
      </div>

      {/* Top Right Key Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsKeyModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 text-gray-500 hover:text-indigo-600 rounded-lg text-xs font-medium shadow-sm transition-all"
        >
          <Key size={14} />
          <span>API Key wechseln</span>
        </button>
      </div>

      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onSave={handleSaveKey} 
        onClose={() => setIsKeyModalOpen(false)}
        initialKey={apiKey}
        forceOpen={!apiKey}
      />

      <div className="max-w-6xl mx-auto space-y-6 pt-12 md:pt-6">
        
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">
            Google AI <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Prompt Architect</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-2">
            Wähle dein Tool und erstelle den perfekten Prompt.
          </p>
        </header>

        {/* Current Rules Viewer */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 max-w-4xl mx-auto">
           <strong>Aktuell angewendete KI-Regeln:</strong>
           <p className="mt-1 line-clamp-2 hover:line-clamp-none transition-all cursor-default opacity-80 whitespace-pre-line">{appConfig.rules}</p>
        </div>

        {/* PLATFORM SWITCHER */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex mb-6 max-w-4xl mx-auto">
            <button
                onClick={() => setSelectedPlatform(AiPlatform.GEMINI)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedPlatform === AiPlatform.GEMINI
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                <Sparkles size={18} />
                Gemini LLM
            </button>
            <button
                onClick={() => setSelectedPlatform(AiPlatform.NOTEBOOK_LM)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedPlatform === AiPlatform.NOTEBOOK_LM
                    ? 'bg-white text-gray-900 border border-gray-200 shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
                <BookOpen size={18} />
                NotebookLM
            </button>
        </div>
        
        {/* 1. SELECTION (Tool or Goal) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
             1. {selectedPlatform === AiPlatform.GEMINI ? "ZIEL-TOOL" : "AUSGABE-TYP"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {selectedPlatform === AiPlatform.GEMINI ? (
                appConfig.geminiTools.map((tool) => (
                    <button
                        key={tool.title}
                        onClick={() => setSelectedTool(tool.title)}
                        className={`flex flex-col items-start justify-start gap-2 p-4 rounded-2xl border transition-all text-left group ${
                        selectedTool === tool.title
                            ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-100 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                           <div className={selectedTool === tool.title ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}>
                               {getDynamicIcon(tool.title)}
                           </div>
                           <span className={`font-semibold text-sm ${selectedTool === tool.title ? 'text-blue-800' : 'text-gray-700'}`}>
                             {tool.title}
                           </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${selectedTool === tool.title ? 'text-blue-600/80' : 'text-gray-500'}`}>
                          {tool.description}
                        </p>
                    </button>
                ))
            ) : (
                Object.keys(appConfig.notebookGoals).map((goal) => (
                    <button
                        key={goal}
                        onClick={() => setNotebookGoal(goal)}
                        className={`flex items-center justify-start gap-3 p-4 rounded-2xl border transition-all text-left group ${
                        notebookGoal === goal
                            ? 'bg-green-50 border-green-300 ring-1 ring-green-100 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-green-200 hover:bg-green-50/30'
                        }`}
                    >
                        <div className={notebookGoal === goal ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'}>
                            {getDynamicIcon(goal)}
                        </div>
                        <span className={`font-semibold text-sm leading-snug ${notebookGoal === goal ? 'text-green-800' : 'text-gray-700'}`}>
                          {goal}
                        </span>
                    </button>
                ))
            )}
          </div>
        </div>

        {/* 2. DYNAMIC SETTINGS (Mode or Studio Options) */}
        {selectedPlatform === AiPlatform.GEMINI ? (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300 max-w-4xl mx-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              2. MODUS
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(ModelMode).map((mode) => {
                  let icon = mode === ModelMode.FAST ? <Zap size={18}/> : mode === ModelMode.THINKING ? <BrainCircuit size={18}/> : <Rocket size={18}/>;
                  return (
                    <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`flex items-center justify-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium ${
                        selectedMode === mode
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-100'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    >
                    <div className={selectedMode === mode ? 'text-indigo-600' : 'text-gray-400'}>{icon}</div>
                    <span className="leading-tight">{mode}</span>
                    </button>
                  );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              2. STUDIO-EINSTELLUNGEN FÜR: <span className="text-green-600">{notebookGoal}</span>
            </label>
            {Object.keys(currentNotebookOptions).length === 0 ? (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    Für dieses Tool sind in NotebookLM keine weiteren Voreinstellungen erforderlich.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(currentNotebookOptions).map(([categoryName, optionsArray]) => (
                     <div key={categoryName} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">{categoryName}</h3>
                        <div className="flex flex-wrap gap-2">
                           {optionsArray.map(option => (
                               <button
                                 key={option}
                                 onClick={() => handleNotebookSelectionChange(categoryName, option)}
                                 className={`px-4 py-2.5 rounded-xl border transition-all text-sm font-medium text-left shadow-sm hover:shadow-md ${
                                 notebookSelections[categoryName] === option
                                     ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                     : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                                 }`}
                               >
                                 {option}
                               </button>
                           ))}
                        </div>
                     </div>
                  ))}
                </div>
            )}
          </div>
        )}

        {/* 3. Input Area */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group animate-in fade-in duration-300 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
               3. BESCHREIBUNG & KONTEXT
            </label>
            <div className="flex items-center gap-2">
              {selectedPlatform === AiPlatform.GEMINI && (
                <>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-md transition-all border border-transparent hover:border-blue-100"
                    >
                        <ImageIcon size={16} /> <span className="hidden sm:inline">Bild</span>
                    </button>
                </>
              )}
              
              {isTranscribing && (
                <div className="flex items-center gap-1.5 text-blue-600 animate-pulse text-xs font-semibold px-2">
                   <Loader2 size={14} className="animate-spin" /><span>Transkribiere...</span>
                </div>
              )}

              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-1.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isRecording ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isTranscribing}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={
                isRecording 
                ? "Sprich jetzt... (Beende die Aufnahme durch Klick auf das Mikrofon)" 
                : selectedPlatform === AiPlatform.GEMINI 
                    ? "Was möchtest du erreichen? (z.B. 'Generiere ein Bild von einem Auto', oder 'Recherchiere die Geschichte Berlins')"
                    : "Was möchtest du aus deinen Dokumenten extrahieren? (z.B. 'Fokussiere den Podcast auf steuerliche Änderungen für Beamte')"
            }
            className={`w-full h-32 p-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none text-base outline-none ${isRecording ? 'bg-red-50/20' : ''}`}
          />
          
          {selectedPlatform === AiPlatform.GEMINI && uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative group/img w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Action Button */}
        <div className="max-w-4xl mx-auto">
          <button
            onClick={executePromptGeneration}
            disabled={isLoading || isRecording || isTranscribing}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg transform hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
              (isLoading || isRecording || isTranscribing)
              ? 'bg-gray-400 cursor-not-allowed shadow-none' 
              : selectedPlatform === AiPlatform.GEMINI
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
            }`}
          >
            {isLoading ? (
              <><Loader2 size={20} className="animate-spin" /><span>Generiere Prompt...</span></>
            ) : (
              <>{selectedPlatform === AiPlatform.GEMINI ? <Sparkles size={20} /> : <Bot size={20} />}<span>{selectedPlatform === AiPlatform.GEMINI ? "Prompt Erstellen" : "NotebookLM Instruktion Erstellen"}</span></>
            )}
          </button>
        </div>

        {/* Output Section */}
        {generatedPrompt && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
              <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Sparkles className={selectedPlatform === AiPlatform.NOTEBOOK_LM ? "text-green-500" : "text-amber-500"} size={16} /> Ergebnis
              </h2>
               {copySuccess && (
                <span className="text-green-600 text-xs font-medium flex items-center gap-1 animate-in fade-in duration-300">
                  <Check size={14} /> Kopiert!
                </span>
              )}
            </div>
            
            <div className="p-5 bg-gray-50/50">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                {generatedPrompt}
              </pre>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm active:scale-[0.98]"
              >
                <Copy size={16} /> Text Kopieren
              </button>
              <button
                onClick={handleOpenAiTool}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-white shadow-md active:scale-[0.98] ${
                    selectedPlatform === AiPlatform.GEMINI
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <ExternalLink size={16} /> In {selectedPlatform === AiPlatform.GEMINI ? "Gemini" : "NotebookLM"} öffnen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
