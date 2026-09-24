import React, { useState, useEffect, useRef } from 'react';
import { 
    Hammer, AlertTriangle, RotateCcw, Play, CheckCircle2, 
    Volume2, VolumeX, ArrowRight
} from 'lucide-react';

// Prefix with Vite base so assets work on GitHub Pages (/Interactive-Billboard-/)
const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const IMAGES = {
    background: asset('textures/background.svg'),
    chunalal: asset('characters/chunalal.svg'),
    textures: {
        rcc: asset('textures/rcc.svg'),
        stone: asset('textures/stone.svg'),
        bricks: asset('textures/bricks.svg'),
        concreteBlock: asset('textures/concreteBlock.svg'),
        metal: asset('textures/metal.svg'),
        clay: asset('textures/clay.svg'),
        paper: asset('textures/paper.svg')
    }
};

const customStyles = `
  @keyframes shake-subtle {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px) rotate(-1deg); }
    75% { transform: translateX(4px) rotate(1deg); }
  }
  .animate-shake-subtle {
    animation: shake-subtle 0.5s ease-in-out infinite;
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-draw-crack {
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    animation: draw-crack 2s ease-in-out forwards;
  }
  @keyframes draw-crack {
    to { stroke-dashoffset: 0; }
  }

  .texture-rcc { background-image: url('${IMAGES.textures.rcc}'); background-size: cover; background-position: center; }
  .texture-stone { background-image: url('${IMAGES.textures.stone}'); background-size: cover; background-position: center; }
  .texture-bricks { background-image: url('${IMAGES.textures.bricks}'); background-size: 150px; }
  .texture-concreteBlock { background-image: url('${IMAGES.textures.concreteBlock}'); background-size: cover; background-position: center; }
  .texture-metal { background-image: url('${IMAGES.textures.metal}'); background-size: cover; background-position: center; }
  .texture-clay { background-image: url('${IMAGES.textures.clay}'); background-size: cover; background-position: center; }

  .roof-pitched { clip-path: polygon(50% 0%, 100% 100%, 0% 100%); }
  .roof-flat { clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%); }

  /* Readable Devanagari hierarchy — avoid ultra-heavy weights */
  .app-root {
    font-family: 'Noto Sans Devanagari', system-ui, sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .text-dialogue {
    font-weight: 500;
    font-size: clamp(1.125rem, 2.2vw, 1.625rem);
    line-height: 1.65;
    letter-spacing: 0.01em;
    color: #1f2937;
  }
  .text-card-title {
    font-weight: 600;
    font-size: clamp(1.125rem, 2vw, 1.5rem);
    line-height: 1.35;
    color: #111827;
  }
  .text-card-desc {
    font-weight: 400;
    font-size: clamp(0.875rem, 1.4vw, 1.0625rem);
    line-height: 1.5;
    color: #4b5563;
  }
  .text-btn {
    font-weight: 600;
    font-size: clamp(1rem, 1.6vw, 1.25rem);
    letter-spacing: 0.02em;
  }
  .text-label {
    font-weight: 500;
    font-size: 0.875rem;
    letter-spacing: 0.02em;
  }
  .text-panel-tag {
    font-weight: 600;
    font-size: clamp(0.95rem, 1.5vw, 1.125rem);
  }
  .text-heading {
    font-weight: 600;
    line-height: 1.35;
  }
  .option-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 1rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  }
  .option-card:hover {
    border-color: #111827;
    box-shadow: 0 12px 28px rgba(0,0,0,0.1);
  }
  .option-card--brand {
    border-color: #facc15;
    box-shadow: 0 16px 40px rgba(234, 179, 8, 0.25);
    transform: scale(1.02);
    z-index: 1;
  }
  .option-card--brand:hover {
    border-color: #eab308;
  }
  .option-btn {
    width: 100%;
    padding: 0.875rem 1rem;
    border-radius: 0.75rem;
    border: 2px solid #111827;
    background: #f3f4f6;
    color: #111827;
    transition: background 0.2s, color 0.2s;
  }
  .option-card:hover .option-btn {
    background: #111827;
    color: #fff;
  }
  .option-btn--brand {
    background: #111827;
    color: #facc15;
  }
  .option-btn--brand:hover,
  .option-card--brand:hover .option-btn--brand {
    background: #1f2937;
    color: #fde047;
  }
  .primary-btn {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 2.5rem;
    border-radius: 1rem;
    border: 2px solid #111827;
    background: #111827;
    color: #fff;
    font-weight: 600;
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
    box-shadow: 0 12px 28px rgba(0,0,0,0.2);
    transition: background 0.2s, transform 0.15s;
  }
  .primary-btn:hover {
    background: #1f2937;
    transform: scale(1.02);
  }
  .primary-btn:active {
    transform: scale(0.98);
  }
`;

const STEPS = {
    INTRO: 0,
    FOUNDATION: 1,
    WALLS: 2,
    CEMENT: 3,
    CEMENT_WARNING: 4,
    ROOF: 5,
    SUCCESS: 6
};

const PROGRESS_STAGES = [
    { id: STEPS.FOUNDATION, label: "नींव", num: "①" },
    { id: STEPS.WALLS, label: "दीवारें", num: "②" },
    { id: STEPS.CEMENT, label: "सीमेंट", num: "③" },
    { id: STEPS.ROOF, label: "छत", num: "④" },
    { id: STEPS.SUCCESS, label: "घर", num: "🏠" }
];

const DIALOGUE: Record<number, string> = {
    [STEPS.INTRO]: "नमस्कार! मैं हूँ चूना लाल। मुझे अपने खेत पर अपना घर बनाना है। क्या आप मेरी मदद करेंगे एक मज़बूत घर बनाने में?",
    [STEPS.FOUNDATION]: "सबसे पहले घर की मज़बूत नींव ज़रूरी है। आपके हिसाब से मुझे क्या चुनना चाहिए?",
    [STEPS.WALLS]: "अब घर की दीवारें किस से बनाएं?",
    [STEPS.CEMENT]: "घर को मज़बूत बनाने के लिए कौन सा सीमेंट चुनेंगे?",
    [STEPS.CEMENT_WARNING]: "क्या यह सही चुनाव है? दीवार में दरारें आ रही हैं...",
    [STEPS.ROOF]: "बिल्कुल! मज़बूत घर के लिए सही सीमेंट का चुनाव ज़रूरी है। अब घर की छत कैसे बनाएं?",
    [STEPS.SUCCESS]: "धन्यवाद! आपने मेरी मदद से मेरा घर मज़बूत बनाया। मज़बूत घर की शुरुआत, सही सीमेंट से।"
};

type MaterialOption = {
    id: string;
    name: string;
    desc: string;
    img?: string;
    isBrand?: boolean;
    bagType?: string;
};

/** Prefer an Indian Hindi (hi-IN) voice for natural Devanagari speech. */
function pickIndianHindiVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
    const hindi = voices.filter((v) => {
        const lang = (v.lang || '').toLowerCase();
        return lang === 'hi-in' || lang.startsWith('hi-') || lang === 'hi';
    });
    if (!hindi.length) return undefined;

    const score = (v: SpeechSynthesisVoice) => {
        const name = (v.name || '').toLowerCase();
        const lang = (v.lang || '').toLowerCase();
        let s = 0;
        if (lang === 'hi-in') s += 50;
        if (/india|indian|हिंदी|हिन्दी/.test(name)) s += 40;
        // Common Indian Hindi voices on Chrome / Edge / macOS / Android
        if (/google हिन्दी|google hindi|lekha|hemant|kalpana|ravi|neerja|swara|madhur/.test(name)) s += 30;
        if (v.localService) s += 5;
        // Deprioritize non-India regional tags if present
        if (/pakistan|pk\b|bangladesh|bd\b/.test(name + ' ' + lang)) s -= 40;
        return s;
    };

    return [...hindi].sort((a, b) => score(b) - score(a))[0];
}

function OptionCard({
    option,
    onSelect,
    bagPreview,
}: {
    option: MaterialOption;
    onSelect: () => void;
    bagPreview?: React.ReactNode;
}) {
    return (
        <div className={`option-card group ${option.isBrand ? 'option-card--brand' : ''}`}>
            {option.isBrand && (
                <div className="w-full bg-yellow-400 text-black text-center py-1.5 text-label tracking-wide z-20">
                    सुझाव · RECOMMENDED
                </div>
            )}

            {bagPreview ? (
                <div className="h-40 md:h-52 w-full bg-gray-50 flex items-center justify-center p-4">
                    {bagPreview}
                </div>
            ) : (
                <div
                    className="h-28 md:h-40 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${option.img})` }}
                />
            )}

            <div className="p-4 md:p-5 flex flex-col flex-1 text-center bg-white border-t border-gray-100">
                <h4 className="text-card-title mb-1.5">{option.name}</h4>
                <p className="text-card-desc mb-5 flex-1">{option.desc}</p>
                <button
                    type="button"
                    onClick={onSelect}
                    className={`option-btn text-btn ${option.isBrand ? 'option-btn--brand' : ''}`}
                >
                    चुनें
                </button>
            </div>
        </div>
    );
}

export default function App() {
    const [currentStep, setCurrentStep] = useState(STEPS.INTRO);
    const [houseState, setHouseState] = useState<{
        foundation: string | null;
        walls: string | null;
        cement: string | null;
        plastered: boolean;
        roof: string | null;
        showCrack: boolean;
    }>({
        foundation: null,
        walls: null,
        cement: null,
        plastered: false,
        roof: null,
        showCrack: false
    });
    const [audioEnabled, setAudioEnabled] = useState(true);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const hindiVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const hasSpokenIntroRef = useRef(false);

    const refreshIndianVoice = () => {
        if (!synthRef.current) return;
        const chosen = pickIndianHindiVoice(synthRef.current.getVoices());
        if (chosen) hindiVoiceRef.current = chosen;
    };

    const speakText = (text: string, force = false) => {
        if ((!audioEnabled && !force) || !synthRef.current) return;

        synthRef.current.cancel();
        refreshIndianVoice();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.92;
        utterance.pitch = 1;
        if (hindiVoiceRef.current) {
            utterance.voice = hindiVoiceRef.current;
            utterance.lang = hindiVoiceRef.current.lang || 'hi-IN';
        }

        synthRef.current.speak(utterance);
    };

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        synthRef.current = window.speechSynthesis;
        refreshIndianVoice();

        // Voices often load asynchronously (Chrome / Safari)
        const onVoicesChanged = () => refreshIndianVoice();
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

        const attemptPlayIntro = () => {
            if (!hasSpokenIntroRef.current && synthRef.current) {
                speakText(DIALOGUE[STEPS.INTRO], true);
                hasSpokenIntroRef.current = true;
            }
        };

        const timer = setTimeout(attemptPlayIntro, 500);

        const handleFirstInteraction = () => {
            attemptPlayIntro();
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);

        return () => {
            clearTimeout(timer);
            window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
            if (synthRef.current) synthRef.current.cancel();
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    useEffect(() => {
        if (currentStep > STEPS.INTRO) {
            speakText(DIALOGUE[currentStep]);
        }
    }, [currentStep]);

    const handleChoice = (step: number, choice: string) => {
        if (step === STEPS.FOUNDATION) {
            setHouseState(prev => ({ ...prev, foundation: choice }));
            setTimeout(() => setCurrentStep(STEPS.WALLS), 1000);
        } else if (step === STEPS.WALLS) {
            setHouseState(prev => ({ ...prev, walls: choice }));
            setTimeout(() => setCurrentStep(STEPS.CEMENT), 1000);
        } else if (step === STEPS.CEMENT) {
            if (choice === 'ultratech') {
                setHouseState(prev => ({ ...prev, cement: choice, plastered: true, showCrack: false }));
                setTimeout(() => setCurrentStep(STEPS.ROOF), 1000);
            } else {
                setHouseState(prev => ({ ...prev, cement: choice, showCrack: true }));
                setTimeout(() => setCurrentStep(STEPS.CEMENT_WARNING), 1500);
            }
        } else if (step === STEPS.ROOF) {
            setHouseState(prev => ({ ...prev, roof: choice }));
            setTimeout(() => setCurrentStep(STEPS.SUCCESS), 1200);
        }
    };

    const handleRetryCement = () => {
        setHouseState(prev => ({ ...prev, cement: null, showCrack: false }));
        setCurrentStep(STEPS.CEMENT);
    };

    const handleReset = () => {
        setHouseState({ foundation: null, walls: null, cement: null, plastered: false, roof: null, showCrack: false });
        hasSpokenIntroRef.current = false;
        setCurrentStep(STEPS.INTRO);
        setTimeout(() => speakText(DIALOGUE[STEPS.INTRO], true), 200);
    };

    const ChunaLalAvatar = () => (
        <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white flex items-center justify-center overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.25)] shrink-0">
            <img src={IMAGES.chunalal} alt="चूना लाल" className="w-full h-full object-cover object-top" />
        </div>
    );

    const RealisticCementBag = ({ type }: { type: string }) => {
        const isUltra = type === 'ultratech';
        const isEcon = type === 'economy';
        const isStd = type === 'standard';

        return (
            <div className="relative w-full h-full p-2 flex items-center justify-center filter drop-shadow-xl">
                <div
                    className="absolute inset-2 rounded-2xl shadow-inner mix-blend-multiply opacity-50"
                    style={{ backgroundImage: `url(${IMAGES.textures.paper})`, backgroundSize: 'cover' }}
                />

                <div className={`relative w-4/5 h-[95%] rounded-2xl shadow-lg border-2 border-black/10 overflow-hidden flex flex-col items-center justify-center
                    ${isUltra ? 'bg-yellow-400' : isEcon ? 'bg-[#c2b280]' : 'bg-gray-400'}
                `}>
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${IMAGES.textures.paper})`, backgroundSize: 'cover' }} />

                    <div className="relative z-10 w-[85%] bg-black p-3 rounded flex flex-col items-center shadow-md">
                        <span className={`font-sans font-bold text-base md:text-lg tracking-wide leading-none ${isUltra ? 'text-yellow-400' : 'text-white'}`}>
                            {isUltra ? 'ULTRATECH' : isStd ? 'साधारण सीमेंट' : 'सस्ता सीमेंट'}
                        </span>
                        {isUltra && <span className="text-white font-sans text-xs font-semibold tracking-widest mt-1">CEMENT</span>}
                    </div>
                    {isUltra && (
                        <div className="relative z-10 mt-2 bg-black px-2 py-0.5 rounded-sm shadow-md">
                            <span className="text-white font-sans text-[8px] font-medium">The Engineer's Choice</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderHouse = () => (
        <div className={`relative w-[450px] h-[350px] mx-auto flex flex-col items-center justify-end z-20 ${houseState.showCrack ? 'animate-shake-subtle' : ''}`}>
            {houseState.showCrack && houseState.walls && (
                <svg className="absolute z-50 w-64 h-64 top-16 left-1/2 -translate-x-1/2 pointer-events-none filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    <path d="M 120 40 L 135 70 L 115 100 L 140 150 L 130 190"
                          stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"
                          className="animate-draw-crack" />
                </svg>
            )}

            {houseState.roof && (
                <div className="absolute top-[30px] z-40 w-full flex justify-center animate-slide-up drop-shadow-2xl">
                    {houseState.roof === 'rcc' && (
                        <div className="w-[360px] h-[35px] texture-rcc border-b-4 border-gray-800 shadow-xl roof-flat" />
                    )}
                    {houseState.roof === 'metal' && (
                        <div className="w-[400px] h-[130px] texture-metal shadow-2xl roof-pitched" />
                    )}
                    {houseState.roof === 'clay' && (
                        <div className="w-[400px] h-[130px] texture-clay shadow-2xl roof-pitched border-b-[8px] border-[#8a3314]" />
                    )}
                </div>
            )}

            {houseState.walls && (
                <div className={`relative z-20 w-[320px] h-[180px] shadow-[inset_0_-15px_30px_rgba(0,0,0,0.4)] animate-slide-up
                    ${houseState.plastered ? 'texture-concreteBlock brightness-110 contrast-75' : `texture-${houseState.walls}`}
                `}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-36 bg-black rounded-t-sm shadow-inner overflow-hidden">
                        <div className="w-full h-full bg-[#3a2210] border-r-4 border-black/50 flex">
                            <div className="w-1/2 h-full border-r-2 border-black/60" />
                        </div>
                    </div>
                    <div className="absolute top-8 left-8 w-16 h-20 bg-black rounded-sm shadow-inner flex flex-wrap p-1 border border-black/40">
                        <div className="w-full h-full bg-sky-900 border-2 border-[#3a2210] opacity-90 flex flex-wrap">
                            <div className="w-1/2 h-1/2 border-r-2 border-b-2 border-black/60" />
                            <div className="w-1/2 h-1/2 border-b-2 border-black/60" />
                            <div className="w-1/2 h-1/2 border-r-2 border-black/60" />
                        </div>
                    </div>
                    <div className="absolute top-8 right-8 w-16 h-20 bg-black rounded-sm shadow-inner flex flex-wrap p-1 border border-black/40">
                        <div className="w-full h-full bg-sky-900 border-2 border-[#3a2210] opacity-90 flex flex-wrap">
                            <div className="w-1/2 h-1/2 border-r-2 border-b-2 border-black/60" />
                            <div className="w-1/2 h-1/2 border-b-2 border-black/60" />
                            <div className="w-1/2 h-1/2 border-r-2 border-black/60" />
                        </div>
                    </div>
                </div>
            )}

            {houseState.foundation && (
                <div className={`relative z-10 w-[360px] h-[50px] border-b-[12px] border-black/50 rounded-t-sm shadow-xl animate-slide-up texture-${houseState.foundation}`}>
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            )}
        </div>
    );

    const renderOptionGrid = (options: MaterialOption[], step: number) => (
        <div className="w-full flex gap-3 md:gap-6 h-full pb-2 items-stretch">
            {options.map((opt) => (
                <OptionCard
                    key={opt.id}
                    option={opt}
                    onSelect={() => handleChoice(step, opt.id)}
                    bagPreview={opt.bagType ? <RealisticCementBag type={opt.bagType} /> : undefined}
                />
            ))}
        </div>
    );

    const panelTitle =
        currentStep === STEPS.INTRO
            ? "शुरुआत करें"
            : currentStep === STEPS.CEMENT_WARNING
              ? "फिर से चुनें"
              : currentStep === STEPS.SUCCESS
                ? "बधाई हो!"
                : "चूना लाल को क्या चुनना चाहिए?";

    return (
        <div className="app-root w-full h-screen bg-black flex items-center justify-center select-none overflow-hidden">
            <style>{customStyles}</style>

            <div className="relative w-full h-full max-w-[1400px] bg-sky-100 overflow-hidden flex flex-col md:border-x-8 border-gray-900 shadow-2xl">

                {/* Progress */}
                <div className="h-14 md:h-16 bg-white/95 backdrop-blur flex items-center justify-between px-3 md:px-10 z-50 border-b border-gray-200 shrink-0">
                    <div className="flex items-center space-x-1.5 md:space-x-4 w-full max-w-5xl mx-auto">
                        {PROGRESS_STAGES.map((stage, index) => {
                            const mappedStep = stage.id;
                            const isPast = currentStep > mappedStep || (currentStep === STEPS.CEMENT_WARNING && mappedStep < STEPS.CEMENT);
                            const isCurrent = currentStep === mappedStep || (currentStep === STEPS.CEMENT_WARNING && mappedStep === STEPS.CEMENT);
                            const isSuccess = currentStep === STEPS.SUCCESS && index === PROGRESS_STAGES.length - 1;

                            return (
                                <React.Fragment key={stage.label}>
                                    <div className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-all duration-300
                                        ${isCurrent || isSuccess ? 'opacity-100' : 'opacity-45'}
                                    `}>
                                        <div className={`flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full text-sm md:text-base font-semibold
                                            ${isPast || isSuccess ? 'bg-yellow-500 text-black border border-black/20' :
                                              isCurrent ? 'bg-black text-white ring-2 ring-gray-300' : 'bg-gray-200 text-gray-500'}
                                        `}>
                                            {isPast && !isSuccess ? <CheckCircle2 size={18} /> : stage.num}
                                        </div>
                                        <span className={`text-label hidden sm:inline
                                            ${isCurrent || isSuccess ? 'text-gray-900' : 'text-gray-500'}
                                        `}>
                                            {stage.label}
                                        </span>
                                    </div>
                                    {index < PROGRESS_STAGES.length - 1 && (
                                        <ArrowRight className="text-gray-300 hidden md:block shrink-0" size={18} />
                                    )}
                                    {index < PROGRESS_STAGES.length - 1 && (
                                        <div className="h-px flex-1 bg-gray-200 md:hidden" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setAudioEnabled(!audioEnabled);
                            if (audioEnabled && synthRef.current) synthRef.current.cancel();
                            else speakText(DIALOGUE[currentStep], true);
                        }}
                        className="ml-3 p-2 md:p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 shrink-0 border border-gray-200 transition-colors"
                        aria-label={audioEnabled ? 'आवाज़ बंद करें' : 'आवाज़ चालू करें'}
                    >
                        {audioEnabled ? <Volume2 size={20} className="text-gray-800"/> : <VolumeX size={20} className="text-gray-400"/>}
                    </button>
                </div>

                {/* Scene */}
                <div className="flex-[1.1] relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${IMAGES.background})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

                    {currentStep !== STEPS.SUCCESS && (
                        <div className="absolute bottom-4 left-4 md:left-20 z-30 animate-slide-up flex flex-col items-center">
                            <ChunaLalAvatar />
                            <div className="bg-black/75 text-white px-3 py-1 mt-2 rounded-full text-label">चूना लाल</div>
                        </div>
                    )}

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full h-full flex items-end justify-center">
                        {renderHouse()}
                    </div>

                    {currentStep === STEPS.SUCCESS && (
                        <div className="absolute top-1/4 right-8 z-50 bg-yellow-400 border-4 border-black p-5 rounded-2xl shadow-2xl animate-slide-up rotate-3">
                            <div className="flex flex-col items-center">
                                <h2 className="text-black font-sans font-bold text-4xl md:text-6xl tracking-tight uppercase leading-none mb-2">ULTRATECH</h2>
                                <p className="text-black font-sans font-semibold text-sm md:text-lg bg-white px-4 py-1.5 uppercase tracking-widest border border-black">The Engineer's Choice</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom panel — same structure on every step */}
                <div className="flex-[1.5] bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.18)] z-40 p-4 md:p-6 flex flex-col relative border-t-4 border-yellow-500">

                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 border-2 border-black px-5 py-1.5 rounded-lg text-black text-panel-tag shadow-md z-50 whitespace-nowrap">
                        {panelTitle}
                    </div>

                    <div className="flex items-start gap-4 md:gap-6 mb-4 mt-3 bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-200">
                        {currentStep === STEPS.INTRO && <ChunaLalAvatar />}
                        <div className="flex-1 flex flex-col min-w-0">
                            {audioEnabled && <Play size={16} className="text-yellow-600 animate-pulse mb-1.5" />}
                            <p className="text-dialogue">
                                {DIALOGUE[currentStep]}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto min-h-0">

                        {currentStep === STEPS.INTRO && (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(STEPS.FOUNDATION)}
                                className="primary-btn"
                            >
                                <Hammer size={32} />
                                घर बनाना शुरू करें
                            </button>
                        )}

                        {currentStep === STEPS.FOUNDATION && renderOptionGrid([
                            { id: 'rcc', name: 'आरसीसी नींव', desc: 'लोहे और कंक्रीट की मजबूत नींव', img: IMAGES.textures.rcc },
                            { id: 'stone', name: 'पत्थर की नींव', desc: 'प्राकृतिक पत्थर की चिनाई', img: IMAGES.textures.stone },
                            { id: 'bricks', name: 'ईंट की नींव', desc: 'पकी हुई ईंटों की बुनियाद', img: IMAGES.textures.bricks }
                        ], STEPS.FOUNDATION)}

                        {currentStep === STEPS.WALLS && renderOptionGrid([
                            { id: 'bricks', name: 'पकी हुई ईंटें', desc: 'पारंपरिक लाल ईंटों की दीवार', img: IMAGES.textures.bricks },
                            { id: 'concreteBlock', name: 'कंक्रीट ब्लॉक', desc: 'सीमेंट और गिट्टी के ब्लॉक', img: IMAGES.textures.concreteBlock },
                            { id: 'stone', name: 'पत्थर की दीवार', desc: 'स्थानीय पत्थर की चिनाई', img: IMAGES.textures.stone }
                        ], STEPS.WALLS)}

                        {currentStep === STEPS.CEMENT && renderOptionGrid([
                            { id: 'ultratech', name: 'अल्ट्राटेक सीमेंट', desc: 'नंबर 1 सीमेंट', isBrand: true, bagType: 'ultratech' },
                            { id: 'standard', name: 'साधारण सीमेंट', desc: 'सामान्य निर्माण के लिए', bagType: 'standard' },
                            { id: 'economy', name: 'सस्ता सीमेंट', desc: 'कमज़ोर गुणवत्ता', bagType: 'economy' }
                        ], STEPS.CEMENT)}

                        {currentStep === STEPS.CEMENT_WARNING && (
                            <div className="flex flex-col items-center justify-center animate-slide-up w-full text-center py-6">
                                <AlertTriangle size={56} className="text-red-600 mb-4" />
                                <h3 className="text-heading text-2xl md:text-3xl text-red-600 mb-6">क्या यह सही चुनाव है?</h3>
                                <button type="button" onClick={handleRetryCement} className="primary-btn">
                                    <RotateCcw size={28} />
                                    दूसरा सीमेंट चुनें
                                </button>
                            </div>
                        )}

                        {currentStep === STEPS.ROOF && renderOptionGrid([
                            { id: 'rcc', name: 'आरसीसी छत', desc: 'कंक्रीट की मज़बूत ढलाई', img: IMAGES.textures.rcc },
                            { id: 'metal', name: 'लोहे की चादर', desc: 'नालीदार लोहे की छत', img: IMAGES.textures.metal },
                            { id: 'clay', name: 'मिट्टी के खपरैल', desc: 'पारंपरिक मिट्टी की छत', img: IMAGES.textures.clay }
                        ], STEPS.ROOF)}

                        {currentStep === STEPS.SUCCESS && (
                            <div className="flex flex-col items-center justify-center w-full animate-slide-up py-2">
                                <div className="bg-yellow-400 border-4 border-black px-6 py-5 md:px-12 md:py-8 rounded-2xl shadow-xl mb-6 text-center max-w-2xl w-full">
                                    <h2 className="text-heading text-xl md:text-3xl text-black mb-1">मज़बूत घर की शुरुआत,</h2>
                                    <h2 className="text-heading text-2xl md:text-4xl text-black">सही सीमेंट से।</h2>
                                </div>
                                <button type="button" onClick={handleReset} className="primary-btn">
                                    <RotateCcw size={28} />
                                    फिर से खेलें
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
