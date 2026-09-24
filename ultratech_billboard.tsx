import React, { useState, useEffect, useRef } from 'react';
import { 
    Hammer, AlertTriangle, RotateCcw, Play, CheckCircle2, 
    Home, Volume2, VolumeX, ArrowRight
} from 'lucide-react';

const IMAGES = {
    // Photorealistic backgrounds and characters
    background: "https://images.unsplash.com/photo-1590082871864-dd5957d54b41?q=80&w=2000&auto=format&fit=crop",
    chunalal: "https://images.unsplash.com/photo-1534938665420-4193d6aa2a28?q=80&w=400&auto=format&fit=crop",
    
    // Realistic material textures
    textures: {
        rcc: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=500&auto=format&fit=crop", 
        stone: "https://images.unsplash.com/photo-1521106579275-c54c330f6990?q=80&w=500&auto=format&fit=crop", 
        bricks: "https://images.unsplash.com/photo-1588694851214-72de6f3d9ce4?q=80&w=500&auto=format&fit=crop", 
        concreteBlock: "https://images.unsplash.com/photo-1590400030501-9a70f3fde52b?q=80&w=500&auto=format&fit=crop", 
        metal: "https://images.unsplash.com/photo-1616422329241-118c464e83c7?q=80&w=500&auto=format&fit=crop", 
        clay: "https://images.unsplash.com/photo-1517596248386-896435304673?q=80&w=500&auto=format&fit=crop", 
        paper: "https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?q=80&w=400&auto=format&fit=crop" 
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
  
  /* Texture mapping for house construction layers */
  .texture-rcc { background-image: url('${IMAGES.textures.rcc}'); background-size: cover; background-position: center; }
  .texture-stone { background-image: url('${IMAGES.textures.stone}'); background-size: cover; background-position: center; }
  .texture-bricks { background-image: url('${IMAGES.textures.bricks}'); background-size: 150px; }
  .texture-concreteBlock { background-image: url('${IMAGES.textures.concreteBlock}'); background-size: cover; background-position: center; }
  .texture-metal { background-image: url('${IMAGES.textures.metal}'); background-size: cover; background-position: center; }
  .texture-clay { background-image: url('${IMAGES.textures.clay}'); background-size: cover; background-position: center; }
  
  /* Clip Paths for Roofs */
  .roof-pitched { clip-path: polygon(50% 0%, 100% 100%, 0% 100%); }
  .roof-flat { clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%); }
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

const DIALOGUE = {
    [STEPS.INTRO]: "नमस्कार! मैं हूँ चूना लाल। मुझे अपने खेत पर अपना घर बनाना है। क्या आप मेरी मदद करेंगे एक मज़बूत घर बनाने में?",
    [STEPS.FOUNDATION]: "सबसे पहले घर की मज़बूत नींव ज़रूरी है। आपके हिसाब से मुझे क्या चुनना चाहिए?",
    [STEPS.WALLS]: "अब घर की दीवारें किस से बनाएं?",
    [STEPS.CEMENT]: "घर को मज़बूत बनाने के लिए कौन सा सीमेंट चुनेंगे?",
    [STEPS.CEMENT_WARNING]: "क्या यह सही चुनाव है? दीवार में दरारें आ रही हैं...",
    [STEPS.ROOF]: "बिल्कुल! मज़बूत घर के लिए सही सीमेंट का चुनाव ज़रूरी है। अब घर की छत कैसे बनाएं?",
    [STEPS.SUCCESS]: "धन्यवाद! आपने मेरी मदद से मेरा घर मज़बूत बनाया। मज़बूत घर की शुरुआत, सही सीमेंट से।"
};

export default function App() {
    const [currentStep, setCurrentStep] = useState(STEPS.INTRO);
    const [houseState, setHouseState] = useState({
        foundation: null,
        walls: null,
        cement: null,
        plastered: false,
        roof: null,
        showCrack: false
    });
    const [audioEnabled, setAudioEnabled] = useState(true);
    const synthRef = useRef(null);
    const hasSpokenIntroRef = useRef(false);

    useEffect(() => {
        // Load fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        synthRef.current = window.speechSynthesis;

        const attemptPlayIntro = () => {
            if (!hasSpokenIntroRef.current && synthRef.current) {
                speakText(DIALOGUE[STEPS.INTRO], true);
                hasSpokenIntroRef.current = true;
            }
        };

        // Attempt autoplay on mount (might be blocked by browser)
        const timer = setTimeout(attemptPlayIntro, 500);

        // Fallback: Play on first user interaction if autoplay was silently blocked
        const handleFirstInteraction = () => {
            attemptPlayIntro();
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
        
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);

        return () => {
            clearTimeout(timer);
            if (synthRef.current) synthRef.current.cancel();
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    const speakText = (text, force = false) => {
        if ((!audioEnabled && !force) || !synthRef.current) return;
        
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        
        const voices = synthRef.current.getVoices();
        const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.includes('hi'));
        if (hindiVoice) utterance.voice = hindiVoice;

        synthRef.current.speak(utterance);
    };

    useEffect(() => {
        // Don't auto-play intro here as it's handled by the mount logic
        if (currentStep > STEPS.INTRO) {
            speakText(DIALOGUE[currentStep]);
        }
    }, [currentStep]);

    const handleChoice = (step, choice) => {
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
        <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-white flex items-center justify-center overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)] shrink-0">
            <img src={IMAGES.chunalal} alt="चूना लाल" className="w-full h-full object-cover object-top" />
        </div>
    );

    const RealisticCementBag = ({ type }) => {
        const isUltra = type === 'ultratech';
        const isEcon = type === 'economy';
        const isStd = type === 'standard';
        
        return (
            <div className="relative w-full h-full p-2 flex items-center justify-center filter drop-shadow-xl">
                {/* Bag Shadow/Shape Background */}
                <div 
                    className="absolute inset-2 rounded-2xl shadow-inner mix-blend-multiply opacity-50"
                    style={{ backgroundImage: `url(${IMAGES.textures.paper})`, backgroundSize: 'cover' }}
                />
                
                <div className={`relative w-4/5 h-[95%] rounded-2xl shadow-lg border-2 border-black/10 overflow-hidden flex flex-col items-center justify-center
                    ${isUltra ? 'bg-yellow-400' : isEcon ? 'bg-[#c2b280]' : 'bg-gray-400'}
                `}>
                    {/* Realistic Texture Overlay */}
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${IMAGES.textures.paper})`, backgroundSize: 'cover' }} />
                    
                    {/* Branding / Text */}
                    <div className="relative z-10 w-[85%] bg-black p-3 rounded flex flex-col items-center shadow-md">
                        <span className={`font-black font-sans text-lg md:text-xl tracking-wider leading-none ${isUltra ? 'text-yellow-400' : 'text-white'}`}>
                            {isUltra ? 'ULTRATECH' : isStd ? 'साधारण सीमेंट' : 'सस्ता सीमेंट'}
                        </span>
                        {isUltra && <span className="text-white font-sans text-xs md:text-sm font-bold tracking-widest mt-1">CEMENT</span>}
                    </div>
                    {isUltra && (
                        <div className="relative z-10 mt-2 bg-black px-2 py-0.5 rounded-sm shadow-md">
                            <span className="text-white font-sans text-[8px] font-bold">The Engineer's Choice</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderHouse = () => (
        <div className={`relative w-[450px] h-[350px] mx-auto flex flex-col items-center justify-end z-20 ${houseState.showCrack ? 'animate-shake-subtle' : ''}`}>
            
            {/* Crack Overlay */}
            {houseState.showCrack && houseState.walls && (
                <svg className="absolute z-50 w-64 h-64 top-16 left-1/2 -translate-x-1/2 pointer-events-none filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    <path d="M 120 40 L 135 70 L 115 100 L 140 150 L 130 190" 
                          stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" 
                          className="animate-draw-crack" />
                </svg>
            )}

            {/* 4. Roof Layer */}
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

            {/* 2 & 3. Walls & Cement Plaster Layer */}
            {houseState.walls && (
                <div className={`relative z-20 w-[320px] h-[180px] shadow-[inset_0_-15px_30px_rgba(0,0,0,0.4)] animate-slide-up
                    ${houseState.plastered ? 'texture-concreteBlock brightness-110 contrast-75' : `texture-${houseState.walls}`}
                `}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
                    
                    {/* Doorway */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-36 bg-black rounded-t-sm shadow-inner overflow-hidden">
                        <div className="w-full h-full bg-[#3a2210] border-r-4 border-black/50 flex">
                            <div className="w-1/2 h-full border-r-2 border-black/60" />
                        </div>
                    </div>
                    {/* Left Window */}
                    <div className="absolute top-8 left-8 w-16 h-20 bg-black rounded-sm shadow-inner flex flex-wrap p-1 border border-black/40">
                        <div className="w-full h-full bg-sky-900 border-2 border-[#3a2210] opacity-90 flex flex-wrap">
                            <div className="w-1/2 h-1/2 border-r-2 border-b-2 border-black/60" />
                            <div className="w-1/2 h-1/2 border-b-2 border-black/60" />
                            <div className="w-1/2 h-1/2 border-r-2 border-black/60" />
                        </div>
                    </div>
                    {/* Right Window */}
                    <div className="absolute top-8 right-8 w-16 h-20 bg-black rounded-sm shadow-inner flex flex-wrap p-1 border border-black/40">
                        <div className="w-full h-full bg-sky-900 border-2 border-[#3a2210] opacity-90 flex flex-wrap">
                            <div className="w-1/2 h-1/2 border-r-2 border-b-2 border-black/60" />
                            <div className="w-1/2 h-1/2 border-b-2 border-black/60" />
                            <div className="w-1/2 h-1/2 border-r-2 border-black/60" />
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Foundation Layer */}
            {houseState.foundation && (
                <div className={`relative z-10 w-[360px] h-[50px] border-b-[12px] border-black/50 rounded-t-sm shadow-xl animate-slide-up texture-${houseState.foundation}`}>
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center select-none overflow-hidden font-['Noto_Sans_Devanagari']">
            <style>{customStyles}</style>
            
            <div className="relative w-full h-full max-w-[1400px] bg-sky-100 overflow-hidden flex flex-col md:border-x-8 border-gray-900 shadow-2xl">
                
                {/* 1. TOP PROGRESS TRACKER */}
                <div className="h-16 md:h-20 bg-white/95 backdrop-blur flex items-center justify-between px-4 md:px-12 z-50 border-b shadow-sm shrink-0">
                    <div className="flex items-center space-x-2 md:space-x-6 w-full max-w-5xl mx-auto">
                        {PROGRESS_STAGES.map((stage, index) => {
                            let mappedStep = stage.id;
                            const isPast = currentStep > mappedStep || (currentStep === STEPS.CEMENT_WARNING && mappedStep < STEPS.CEMENT);
                            const isCurrent = currentStep === mappedStep || (currentStep === STEPS.CEMENT_WARNING && mappedStep === STEPS.CEMENT);
                            const isSuccess = currentStep === STEPS.SUCCESS && index === PROGRESS_STAGES.length - 1;

                            return (
                                <React.Fragment key={stage.label}>
                                    <div className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 transition-all duration-300
                                        ${isCurrent || isSuccess ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}
                                    `}>
                                        <div className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full font-black text-sm md:text-xl
                                            ${isPast || isSuccess ? 'bg-yellow-500 text-black shadow-lg border-2 border-black' : 
                                              isCurrent ? 'bg-black text-white shadow-lg ring-4 ring-gray-300' : 'bg-gray-200 text-gray-500'}
                                        `}>
                                            {isPast && !isSuccess ? <CheckCircle2 size={24} /> : stage.num}
                                        </div>
                                        <span className={`text-[12px] md:text-lg font-bold tracking-wide
                                            ${isCurrent || isSuccess ? 'text-black' : 'text-gray-500'}
                                        `}>
                                            {stage.label}
                                        </span>
                                    </div>
                                    {index < PROGRESS_STAGES.length - 1 && (
                                        <ArrowRight className="text-gray-300 hidden md:block shrink-0" size={24} />
                                    )}
                                    {index < PROGRESS_STAGES.length - 1 && (
                                        <div className="h-[2px] flex-1 bg-gray-200 md:hidden" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    {/* Audio Toggle */}
                    <button 
                        onClick={() => {
                            setAudioEnabled(!audioEnabled);
                            if (audioEnabled && synthRef.current) synthRef.current.cancel();
                            else speakText(DIALOGUE[currentStep], true);
                        }}
                        className="ml-4 p-2 md:p-4 bg-gray-100 rounded-full hover:bg-gray-200 shrink-0 border border-gray-300 transition-colors"
                    >
                        {audioEnabled ? <Volume2 size={24} className="text-black"/> : <VolumeX size={24} className="text-gray-400"/>}
                    </button>
                </div>

                {/* 2. MIDDLE ENVIRONMENT SCENE */}
                <div className="flex-[1.1] relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${IMAGES.background})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                    
                    {currentStep !== STEPS.SUCCESS && (
                        <div className="absolute bottom-4 left-4 md:left-20 z-30 animate-slide-up flex flex-col items-center">
                            <ChunaLalAvatar />
                            <div className="bg-black/80 text-white px-4 py-1 mt-2 rounded-full font-bold text-sm">चूना लाल</div>
                        </div>
                    )}

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full h-full flex items-end justify-center">
                        {renderHouse()}
                    </div>

                    {/* Final Branding Overlay */}
                    {currentStep === STEPS.SUCCESS && (
                        <div className="absolute top-1/4 right-8 z-50 bg-yellow-400 border-8 border-black p-6 rounded-2xl shadow-2xl animate-slide-up rotate-3">
                            <div className="flex flex-col items-center">
                                <h2 className="text-black font-black text-5xl md:text-7xl tracking-tighter uppercase leading-none mb-2 font-sans">ULTRATECH</h2>
                                <p className="text-black font-black text-lg md:text-2xl bg-white px-6 py-2 uppercase tracking-widest border-2 border-black font-sans">The Engineer's Choice</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. BOTTOM MATERIAL SELECTION PANEL */}
                <div className="flex-[1.5] bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.3)] z-40 p-4 md:p-8 flex flex-col relative border-t-8 border-yellow-500">
                    
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 border-4 border-black px-6 py-2 rounded-xl text-black font-black text-xl shadow-lg z-50 whitespace-nowrap">
                        {currentStep === STEPS.INTRO ? "शुरुआत करें" : "चूना लाल को क्या इस्तेमाल करना चाहिए?"}
                    </div>

                    <div className="flex items-center gap-4 md:gap-8 mb-6 mt-4 bg-gray-50 rounded-2xl p-4 md:p-6 border-2 border-gray-200 shadow-inner">
                        {currentStep === STEPS.INTRO && <ChunaLalAvatar />}
                        <div className="flex-1 flex flex-col">
                            {audioEnabled && <Play size={20} className="text-yellow-600 animate-pulse mb-2" />}
                            <p className="text-gray-900 text-2xl md:text-4xl font-bold leading-snug">
                                "{DIALOGUE[currentStep]}"
                            </p>
                        </div>
                    </div>

                    {/* Selection Cards */}
                    <div className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto h-full">
                        
                        {currentStep === STEPS.INTRO && (
                            <button 
                                onClick={() => setCurrentStep(STEPS.FOUNDATION)}
                                className="bg-black hover:bg-gray-800 text-white text-3xl md:text-5xl font-black py-8 px-16 rounded-2xl shadow-2xl transform transition hover:scale-105 active:scale-95 flex items-center gap-6 border-4 border-black"
                            >
                                <Hammer size={48} />
                                घर बनाना शुरू करें
                            </button>
                        )}

                        {currentStep === STEPS.FOUNDATION && (
                            <div className="w-full flex gap-4 md:gap-8 h-full pb-2">
                                {[
                                    { id: 'rcc', name: 'आरसीसी नींव', desc: 'लोहे और कंक्रीट की मजबूत नींव', img: IMAGES.textures.rcc },
                                    { id: 'stone', name: 'पत्थर की नींव', desc: 'प्राकृतिक पत्थर की चिनाई', img: IMAGES.textures.stone },
                                    { id: 'bricks', name: 'ईंट की नींव', desc: 'पकी हुई ईंटों की बुनियाद', img: IMAGES.textures.bricks }
                                ].map(opt => (
                                    <div key={opt.id} className="flex-1 bg-white border-4 border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-lg hover:border-black hover:shadow-2xl transition-all group">
                                        <div className="h-32 md:h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${opt.img})` }} />
                                        <div className="p-4 md:p-6 flex flex-col flex-1 text-center bg-white z-10">
                                            <h4 className="text-2xl md:text-3xl font-black text-black mb-2">{opt.name}</h4>
                                            <p className="text-gray-600 text-sm md:text-lg font-medium mb-6 flex-1">{opt.desc}</p>
                                            <button onClick={() => handleChoice(STEPS.FOUNDATION, opt.id)} className="w-full bg-gray-100 group-hover:bg-black group-hover:text-white text-black border-2 border-black font-black text-xl md:text-2xl py-4 rounded-xl transition-colors">
                                                चुनें
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentStep === STEPS.WALLS && (
                            <div className="w-full flex gap-4 md:gap-8 h-full pb-2">
                                {[
                                    { id: 'bricks', name: 'पकी हुई ईंटें', desc: 'पारंपरिक लाल ईंटों की दीवार', img: IMAGES.textures.bricks },
                                    { id: 'concreteBlock', name: 'कंक्रीट ब्लॉक', desc: 'सीमेंट और गिट्टी के ब्लॉक', img: IMAGES.textures.concreteBlock },
                                    { id: 'stone', name: 'पत्थर की दीवार', desc: 'स्थानीय पत्थर की चिनाई', img: IMAGES.textures.stone }
                                ].map(opt => (
                                    <div key={opt.id} className="flex-1 bg-white border-4 border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-lg hover:border-black hover:shadow-2xl transition-all group">
                                        <div className="h-32 md:h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${opt.img})` }} />
                                        <div className="p-4 md:p-6 flex flex-col flex-1 text-center bg-white z-10">
                                            <h4 className="text-2xl md:text-3xl font-black text-black mb-2">{opt.name}</h4>
                                            <p className="text-gray-600 text-sm md:text-lg font-medium mb-6 flex-1">{opt.desc}</p>
                                            <button onClick={() => handleChoice(STEPS.WALLS, opt.id)} className="w-full bg-gray-100 group-hover:bg-black group-hover:text-white text-black border-2 border-black font-black text-xl md:text-2xl py-4 rounded-xl transition-colors">
                                                चुनें
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentStep === STEPS.CEMENT && (
                            <div className="w-full flex gap-4 md:gap-8 h-full pb-2">
                                {[
                                    { id: 'ultratech', name: 'अल्ट्राटेक सीमेंट', desc: 'नंबर 1 सीमेंट', isBrand: true },
                                    { id: 'standard', name: 'साधारण सीमेंट', desc: 'सामान्य निर्माण के लिए', isBrand: false },
                                    { id: 'economy', name: 'सस्ता सीमेंट', desc: 'कमज़ोर गुणवत्ता', isBrand: false }
                                ].map(opt => (
                                    <div key={opt.id} className={`flex-1 bg-white border-4 rounded-2xl flex flex-col overflow-hidden transition-all group relative
                                        ${opt.isBrand ? 'border-yellow-400 scale-105 shadow-[0_20px_50px_rgba(234,179,8,0.3)] z-10' : 'border-gray-200 shadow-lg hover:border-black'}`}
                                    >
                                        {opt.isBrand && <div className="absolute top-0 left-0 w-full bg-yellow-400 text-black text-center py-1 font-bold text-sm tracking-widest z-20">RECOMMENDED</div>}
                                        
                                        <div className="h-40 md:h-56 w-full bg-gray-50 flex items-center justify-center p-4 pt-8">
                                            <RealisticCementBag type={opt.id} />
                                        </div>
                                        
                                        <div className="p-4 md:p-6 flex flex-col flex-1 text-center bg-white z-10 border-t border-gray-100">
                                            <h4 className={`text-2xl md:text-3xl font-black mb-2 ${opt.isBrand ? 'text-black' : 'text-gray-800'}`}>{opt.name}</h4>
                                            <p className="text-gray-600 text-sm md:text-lg font-medium mb-6 flex-1">{opt.desc}</p>
                                            <button onClick={() => handleChoice(STEPS.CEMENT, opt.id)} className={`w-full font-black text-xl md:text-2xl py-4 rounded-xl transition-colors border-2 border-black
                                                ${opt.isBrand ? 'bg-black text-yellow-400 hover:bg-gray-900' : 'bg-gray-100 text-black group-hover:bg-black group-hover:text-white'}
                                            `}>
                                                चुनें
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentStep === STEPS.CEMENT_WARNING && (
                            <div className="flex flex-col items-center justify-center animate-slide-up w-full text-center py-8">
                                <AlertTriangle size={80} className="text-red-600 mb-6 animate-pulse" />
                                <h3 className="text-4xl md:text-5xl font-black text-red-600 mb-8">क्या यह सही चुनाव है?</h3>
                                <button 
                                    onClick={handleRetryCement}
                                    className="bg-black hover:bg-gray-800 text-white text-3xl md:text-4xl font-black py-6 px-12 rounded-2xl shadow-2xl transform transition hover:scale-105 flex items-center gap-4 border-4 border-black"
                                >
                                    <RotateCcw size={40} />
                                    दूसरा सीमेंट चुनें
                                </button>
                            </div>
                        )}

                        {currentStep === STEPS.ROOF && (
                            <div className="w-full flex gap-4 md:gap-8 h-full pb-2">
                                {[
                                    { id: 'rcc', name: 'आरसीसी छत', desc: 'कंक्रीट की मज़बूत ढलाई', img: IMAGES.textures.rcc },
                                    { id: 'metal', name: 'लोहे की चादर', desc: 'नालीदार लोहे की छत', img: IMAGES.textures.metal },
                                    { id: 'clay', name: 'मिट्टी के खपरैल', desc: 'पारंपरिक मिट्टी की छत', img: IMAGES.textures.clay }
                                ].map(opt => (
                                    <div key={opt.id} className="flex-1 bg-white border-4 border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-lg hover:border-black hover:shadow-2xl transition-all group">
                                        <div className="h-32 md:h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${opt.img})` }} />
                                        <div className="p-4 md:p-6 flex flex-col flex-1 text-center bg-white z-10">
                                            <h4 className="text-2xl md:text-3xl font-black text-black mb-2">{opt.name}</h4>
                                            <p className="text-gray-600 text-sm md:text-lg font-medium mb-6 flex-1">{opt.desc}</p>
                                            <button onClick={() => handleChoice(STEPS.ROOF, opt.id)} className="w-full bg-gray-100 group-hover:bg-black group-hover:text-white text-black border-2 border-black font-black text-xl md:text-2xl py-4 rounded-xl transition-colors">
                                                चुनें
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentStep === STEPS.SUCCESS && (
                            <div className="flex flex-col items-center justify-center w-full animate-slide-up py-4">
                                <div className="bg-yellow-400 border-8 border-black px-8 py-6 md:px-16 md:py-10 rounded-3xl shadow-2xl mb-8 text-center max-w-3xl w-full">
                                    <h2 className="text-3xl md:text-5xl font-black text-black mb-2">मज़बूत घर की शुरुआत,</h2>
                                    <h2 className="text-4xl md:text-7xl font-black text-black">सही सीमेंट से।</h2>
                                </div>
                                <button 
                                    onClick={handleReset}
                                    className="bg-black hover:bg-gray-800 text-white text-2xl md:text-4xl font-black py-6 px-12 rounded-2xl shadow-xl transform transition hover:scale-105 flex items-center gap-4 border-4 border-gray-700"
                                >
                                    <RotateCcw size={36} />
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