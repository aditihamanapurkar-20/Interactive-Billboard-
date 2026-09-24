import React, { useState, useEffect, useRef } from 'react';

// Photorealistic Image Placeholders
const IMAGES = {
  background: "https://images.unsplash.com/photo-1595844730298-b860dac0d28d?auto=format&fit=crop&w=1920&q=80", // Rural farm field
  chunaLal: "https://images.unsplash.com/photo-1596728489812-3294865c3bb9?auto=format&fit=crop&w=400&q=80", // Indian farmer
  houseStages: [
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80", // Empty plot
    "https://images.unsplash.com/photo-1541888081155-22d7baee85c1?auto=format&fit=crop&w=800&q=80", // Foundation
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", // Walls
    "https://images.unsplash.com/photo-1605810730623-2895690b27b4?auto=format&fit=crop&w=800&q=80", // Cemented walls
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", // Finished rural house
  ],
  materials: {
    rccFound: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=300&q=80",
    stoneFound: "https://images.unsplash.com/photo-1525081829623-110bbce27b0f?auto=format&fit=crop&w=300&q=80",
    brickFound: "https://images.unsplash.com/photo-1584869680387-955a6d36e2f1?auto=format&fit=crop&w=300&q=80",
    firedBrick: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=300&q=80",
    concreteBlock: "https://images.unsplash.com/photo-1589718464132-7ce53018251e?auto=format&fit=crop&w=300&q=80",
    stoneWall: "https://images.unsplash.com/photo-1555529733-0e67056058e1?auto=format&fit=crop&w=300&q=80",
    ultratech: "https://images.unsplash.com/photo-1621644782012-78d1c6eb38be?auto=format&fit=crop&w=300&q=80", // Yellow bag placeholder
    standardCement: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=300&q=80", // Grey bag
    economyCement: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=300&q=80", // Plain bag
    rccRoof: "https://images.unsplash.com/photo-1505051508008-923feaf90180?auto=format&fit=crop&w=300&q=80",
    metalRoof: "https://images.unsplash.com/photo-1563615967073-7a98db257929?auto=format&fit=crop&w=300&q=80",
    clayRoof: "https://images.unsplash.com/photo-1516086782806-03f5db997193?auto=format&fit=crop&w=300&q=80",
  }
};

export default function InteractiveBillboard() {
  const [step, setStep] = useState(0);
  const [warning, setWarning] = useState(false);
  const audioInitialized = useRef(false);

  // Text-to-Speech Helper
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speaking
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Hindi voice
      utterance.rate = 0.9; // Slightly slower, natural pacing
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger audio on first interaction (browser policy workaround)
  const handleFirstInteraction = () => {
    if (!audioInitialized.current) {
      audioInitialized.current = true;
      speak("नमस्कार! मैं हूँ चुना लाल। मुझे अपने खेत पर अपना घर बनाना है। क्या आप मेरी मदद करेंगे एक मज़बूत घर बनाने में?");
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleFirstInteraction, { once: true });
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, []);

  const triggerNextStep = (audioText) => {
    setStep(prev => prev + 1);
    if (audioText) speak(audioText);
  };

  const handleCementSelection = (isUltraTech) => {
    if (isUltraTech) {
      triggerNextStep("बिल्कुल! मज़बूत घर के लिए सही सीमेंट का चुनाव ज़रूरी है।");
    } else {
      setWarning(true);
      speak("अरे! क्या यह सही चुनाव है? घर मज़बूत नहीं लग रहा...");
    }
  };

  const stepsData = [
    {
      title: "चुना लाल के घर की नींव किस मटेरियल से बनाएं?",
      options: [
        { name: "RCC Foundation", desc: "Reinforced concrete foundation", img: IMAGES.materials.rccFound, onSelect: () => triggerNextStep("अब घर की दीवारें किस से बनाएं?") },
        { name: "Stone Foundation", desc: "Stone masonry foundation", img: IMAGES.materials.stoneFound, onSelect: () => triggerNextStep("अब घर की दीवारें किस से बनाएं?") },
        { name: "Brick Foundation", desc: "Brick masonry foundation", img: IMAGES.materials.brickFound, onSelect: () => triggerNextStep("अब घर की दीवारें किस से बनाएं?") }
      ]
    },
    {
      title: "अब घर की दीवारें किस से बनाएं?",
      options: [
        { name: "Burnt Clay Bricks", desc: "Traditional fired-brick walls", img: IMAGES.materials.firedBrick, onSelect: () => triggerNextStep("घर को मज़बूत बनाने के लिए कौन सा सीमेंट चुनेंगे?") },
        { name: "Concrete Blocks", desc: "Concrete masonry blocks", img: IMAGES.materials.concreteBlock, onSelect: () => triggerNextStep("घर को मज़बूत बनाने के लिए कौन सा सीमेंट चुनेंगे?") },
        { name: "Stone Masonry", desc: "Natural stone walls", img: IMAGES.materials.stoneWall, onSelect: () => triggerNextStep("घर को मज़बूत बनाने के लिए कौन सा सीमेंट चुनेंगे?") }
      ]
    },
    {
      title: "घर को मज़बूत बनाने के लिए कौन सा सीमेंट चुनेंगे?",
      options: [
        { name: "ULTRATECH CEMENT", desc: "The Engineer's Choice", img: IMAGES.materials.ultratech, onSelect: () => handleCementSelection(true) },
        { name: "STANDARD CEMENT", desc: "Ordinary Cement", img: IMAGES.materials.standardCement, onSelect: () => handleCementSelection(false) },
        { name: "ECONOMY CEMENT", desc: "Low-cost Cement", img: IMAGES.materials.economyCement, onSelect: () => handleCementSelection(false) }
      ]
    },
    {
      title: "अब चुना लाल के घर की छत कैसे बनाएं?",
      options: [
        { name: "RCC Roof", desc: "Reinforced concrete slab", img: IMAGES.materials.rccRoof, onSelect: () => triggerNextStep("धन्यवाद! आपने मेरी मदद से मेरा घर मज़बूत बनाया।") },
        { name: "Metal Sheet Roof", desc: "Corrugated metal roofing", img: IMAGES.materials.metalRoof, onSelect: () => triggerNextStep("धन्यवाद! आपने मेरी मदद से मेरा घर मज़बूत बनाया।") },
        { name: "Clay Tile Roof", desc: "Traditional clay tiles", img: IMAGES.materials.clayRoof, onSelect: () => triggerNextStep("धन्यवाद! आपने मेरी मदद से मेरा घर मज़बूत बनाया।") }
      ]
    }
  ];

  return (
    <div 
      className="relative w-full h-screen bg-cover bg-center font-sans overflow-hidden flex flex-col justify-between"
      style={{ backgroundImage: `url(${IMAGES.background})` }}
    >
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* TOP PROGRESS BAR */}
      <div className="relative z-10 w-full p-4 bg-black/60 text-white flex justify-center space-x-6 text-xl font-bold shadow-lg">
        <span className={step >= 0 ? "text-yellow-400" : "text-gray-400"}>① नींव</span>
        <span>→</span>
        <span className={step >= 1 ? "text-yellow-400" : "text-gray-400"}>② दीवारें</span>
        <span>→</span>
        <span className={step >= 2 ? "text-yellow-400" : "text-gray-400"}>③ सीमेंट</span>
        <span>→</span>
        <span className={step >= 3 ? "text-yellow-400" : "text-gray-400"}>④ छत</span>
        <span>→</span>
        <span className={step === 4 ? "text-yellow-400" : "text-gray-400"}>🏠 घर</span>
      </div>

      {/* MIDDLE SECTION - CHUNA LAL & HOUSE */}
      <div className="relative z-10 flex-grow flex items-end justify-center pb-[320px]">
        {/* Chuna Lal */}
        <div className="absolute left-10 bottom-[320px] text-center">
           <img src={IMAGES.chunaLal} alt="Chuna Lal" className="h-[400px] object-cover rounded-lg shadow-2xl border-4 border-yellow-500 mb-4" />
           <div className="bg-white px-4 py-2 rounded-lg font-bold text-xl text-black shadow-lg">चुना लाल</div>
        </div>

        {/* House Construction */}
        <div className="w-[800px] h-[500px] bg-black/40 rounded-xl overflow-hidden border-8 border-yellow-500 shadow-2xl transition-all duration-1000">
           <img src={IMAGES.houseStages[step > 4 ? 4 : step]} alt="House Stage" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* BOTTOM SELECTION PANEL */}
      <div className="absolute bottom-0 w-full bg-white z-20 border-t-8 border-yellow-500 p-6 shadow-2xl">
        {step < 4 && !warning && (
          <>
            <h2 className="text-3xl font-black text-center mb-6 text-gray-800">{stepsData[step].title}</h2>
            <div className="flex justify-center space-x-8 max-w-6xl mx-auto">
              {stepsData[step].options.map((opt, idx) => (
                <div key={idx} className="w-1/3 bg-gray-100 rounded-xl overflow-hidden shadow-lg border-2 border-gray-300 hover:border-yellow-500 transition-all cursor-pointer flex flex-col" onClick={opt.onSelect}>
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${opt.img})` }}></div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{opt.name}</h3>
                      <p className="text-gray-600 font-medium text-lg mb-4">{opt.desc}</p>
                    </div>
                    <button className="w-full bg-yellow-500 text-black font-bold text-xl py-3 rounded hover:bg-yellow-400 transition-colors">
                      {step === 2 ? "SELECT CEMENT →" : "SELECT →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* WARNING STATE */}
        {warning && (
          <div className="text-center py-10">
            <h2 className="text-4xl font-bold text-red-600 mb-4">क्या यह सही चुनाव है?</h2>
            <p className="text-xl text-gray-700 mb-8 font-medium">घर की नींव मज़बूत नहीं लग रही है।</p>
            <button 
              onClick={() => { setWarning(false); speak("घर को मज़बूत बनाने के लिए कौन सा सीमेंट चुनेंगे?"); }}
              className="bg-gray-800 text-white px-8 py-4 text-2xl font-bold rounded-lg hover:bg-gray-700"
            >
              TRY ANOTHER CEMENT
            </button>
          </div>
        )}

        {/* SUCCESS/END STATE */}
        {step === 4 && (
          <div className="text-center py-8">
            <h2 className="text-5xl font-black text-yellow-600 mb-4">मज़बूत घर की शुरुआत, सही सीमेंट से।</h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-8 tracking-widest">ULTRATECH CEMENT</h3>
            <button 
              onClick={() => { setStep(0); setWarning(false); speak("क्या आप मेरी मदद करेंगे एक मज़बूत घर बनाने में?"); }}
              className="bg-yellow-500 text-black px-10 py-4 text-2xl font-bold rounded-lg hover:bg-yellow-400 shadow-xl"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}