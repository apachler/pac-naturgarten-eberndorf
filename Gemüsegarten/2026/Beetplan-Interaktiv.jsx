import React, { useState } from 'react';

const plantData = {
  feuerbohne: { name: 'Feuerbohne', color: '#8BC34A', icon: '🫘', type: 'H' },
  bohnenkraut: { name: 'Bohnenkraut', color: '#AED581', icon: '🌿', type: 'B' },
  kohlsprossen: { name: 'Kohlsprossen', color: '#66BB6A', icon: '🥬', type: 'H' },
  gurke: { name: 'Gurke', color: '#81C784', icon: '🥒', type: 'H' },
  knollensellerie: { name: 'Knollensellerie', color: '#C5E1A5', icon: '🥬', type: 'H' },
  paprika: { name: 'Paprika', color: '#EF5350', icon: '🫑', type: 'H' },
  pfefferoni: { name: 'Pfefferoni', color: '#FF7043', icon: '🌶️', type: 'H' },
  mangold: { name: 'Mangold', color: '#26A69A', icon: '🥬', type: 'H' },
  stangensellerie: { name: 'Stangensellerie', color: '#4DB6AC', icon: '🥬', type: 'H' },
  karotte: { name: 'Karotte', color: '#FF9800', icon: '🥕', type: 'H' },
  lauch: { name: 'Lauch', color: '#7CB342', icon: '🧅', type: 'H' },
  dill: { name: 'Dill', color: '#9CCC65', icon: '🌿', type: 'B' },
  roteruebe: { name: 'Rote Rübe', color: '#AD1457', icon: '🥬', type: 'H' },
  kohlrabi: { name: 'Kohlrabi', color: '#9575CD', icon: '🥬', type: 'H' },
  ringelblume: { name: 'Ringelblume', color: '#FFC107', icon: '🌼', type: 'B' },
  beinwell: { name: 'Beinwell', color: '#5C6BC0', icon: '🌿', type: 'B' }
};

const BeetPlan = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  
  const Plant = ({ x, y, type, size = 20, count, isStange }) => {
    const plant = plantData[type];
    if (!plant) return null;
    
    return (
      <g 
        className="cursor-pointer transition-all duration-200 hover:opacity-80"
        onClick={() => setSelectedPlant(plant)}
        style={{ transform: `translate(${x}px, ${y}px)` }}
      >
        <circle 
          cx={0} 
          cy={0} 
          r={size} 
          fill={plant.color}
          stroke="#fff"
          strokeWidth={2}
          className="drop-shadow-sm"
        />
        <text 
          x={0} 
          y={2} 
          textAnchor="middle" 
          dominantBaseline="middle"
          fontSize={size * 0.9}
        >
          {plant.icon}
        </text>
        {isStange && (
          <circle 
            cx={0} 
            cy={0} 
            r={size + 8} 
            fill="none"
            stroke="#795548"
            strokeWidth={3}
            strokeDasharray="8,4"
          />
        )}
        {count && (
          <text 
            x={0} 
            y={size + 12} 
            textAnchor="middle" 
            fontSize={10}
            fill="#555"
          >
            ×{count}
          </text>
        )}
      </g>
    );
  };
  
  const Zone = ({ y, height, label, color, children }) => (
    <g>
      <rect
        x={10}
        y={y}
        width={280}
        height={height}
        fill={color}
        rx={4}
        className="drop-shadow"
      />
      <text
        x={150}
        y={y + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight="bold"
        fill="#37474F"
      >
        {label}
      </text>
      {children}
    </g>
  );
  
  const Weg = ({ y }) => (
    <g>
      <rect
        x={10}
        y={y}
        width={280}
        height={22}
        fill="#D7CCC8"
        rx={2}
      />
      <line x1={30} y1={y + 11} x2={270} y2={y + 11} stroke="#BCAAA4" strokeWidth={2} strokeDasharray="6,4" />
    </g>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            🌱 Permakultur-Beetplan
          </h1>
          <p className="text-emerald-600">3 × 5 Meter Mischkultur-Gemüsebeet</p>
          <p className="text-sm text-gray-500 mt-1">Eberndorf, Kärnten • Heubeet mit Terra Preta</p>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              showDetails 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'bg-white text-emerald-700 border border-emerald-300'
            }`}
          >
            {showDetails ? '✓ Details anzeigen' : 'Details anzeigen'}
          </button>
        </div>
        
        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* SVG Beetplan */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">↑ NORD</span>
              <span className="text-xs text-gray-400">300 × 500 cm</span>
            </div>
            
            <svg viewBox="0 0 300 520" className="w-full max-w-md mx-auto">
              <defs>
                <pattern id="soil" patternUnits="userSpaceOnUse" width="20" height="20">
                  <rect width="20" height="20" fill="#8D6E63" opacity="0.1"/>
                  <circle cx="5" cy="5" r="1" fill="#795548" opacity="0.3"/>
                  <circle cx="15" cy="15" r="1" fill="#795548" opacity="0.3"/>
                </pattern>
              </defs>
              
              {/* Hintergrund */}
              <rect x={5} y={5} width={290} height={510} fill="url(#soil)" rx={8} stroke="#A1887F" strokeWidth={2}/>
              
              {/* Beinwell am Nordrand */}
              <g>
                <text x={150} y={22} textAnchor="middle" fontSize={9} fill="#5C6BC0" fontWeight="bold">
                  Beinwell (außen)
                </text>
                {[40, 110, 190, 260].map((x, i) => (
                  <circle key={i} cx={x} cy={38} r={12} fill="#C5CAE9" stroke="#5C6BC0" strokeWidth={2}/>
                ))}
              </g>
              
              {/* Zone A: Feuerbohnen */}
              <Zone y={50} height={85} label="Zone A: Feuerbohnen" color="#DCEDC8">
                {[35, 95, 150, 205, 265].map((x, i) => (
                  <Plant key={i} x={x} y={100} type="feuerbohne" size={22} isStange count={4} />
                ))}
                {[65, 125, 180, 235].map((x, i) => (
                  <Plant key={`bk-${i}`} x={x} y={115} type="bohnenkraut" size={12} />
                ))}
              </Zone>
              
              {/* Weg 1 */}
              <Weg y={138} />
              
              {/* Zone B: Kohlsprossen, Gurken, Sellerie */}
              <Zone y={163} height={75} label="Zone B: Kohl • Gurken • Sellerie" color="#C8E6C9">
                {/* Kohlsprossen West */}
                <Plant x={35} y={195} type="kohlsprossen" size={18} />
                <Plant x={35} y={220} type="kohlsprossen" size={18} />
                <Plant x={75} y={195} type="kohlsprossen" size={18} />
                <Plant x={75} y={220} type="kohlsprossen" size={18} />
                
                {/* Gurken Mitte */}
                <Plant x={150} y={190} type="gurke" size={16} />
                <Plant x={150} y={212} type="gurke" size={16} />
                <Plant x={150} y={230} type="gurke" size={16} />
                <line x1={150} y1={180} x2={150} y2={165} stroke="#795548" strokeWidth={3}/>
                
                {/* Knollensellerie Ost */}
                {[200, 230, 260].map((x, i) => (
                  <React.Fragment key={i}>
                    <Plant x={x} y={190} type="knollensellerie" size={14} />
                    <Plant x={x} y={218} type="knollensellerie" size={14} />
                  </React.Fragment>
                ))}
                <Plant x={200} y={230} type="knollensellerie" size={14} />
                <Plant x={230} y={230} type="knollensellerie" size={14} />
              </Zone>
              
              {/* Weg 2 */}
              <Weg y={241} />
              
              {/* Zone C: Paprika, Pfefferoni, Mangold, Stangensellerie */}
              <Zone y={266} height={85} label="Zone C: Paprika • Mangold • Sellerie" color="#B2DFDB">
                {/* Paprika West */}
                <Plant x={35} y={305} type="paprika" size={18} />
                <Plant x={35} y={335} type="paprika" size={18} />
                <Plant x={70} y={320} type="paprika" size={18} />
                
                {/* Pfefferoni */}
                <Plant x={70} y={295} type="pfefferoni" size={16} />
                <Plant x={70} y={343} type="pfefferoni" size={16} />
                <Plant x={35} y={290} type="pfefferoni" size={16} />
                
                {/* Mangold Mitte */}
                <Plant x={150} y={295} type="mangold" size={17} />
                <Plant x={150} y={320} type="mangold" size={17} />
                <Plant x={150} y={345} type="mangold" size={17} />
                
                {/* Stangensellerie Ost */}
                <Plant x={215} y={300} type="stangensellerie" size={15} />
                <Plant x={255} y={300} type="stangensellerie" size={15} />
                <Plant x={215} y={335} type="stangensellerie" size={15} />
                <Plant x={255} y={335} type="stangensellerie" size={15} />
              </Zone>
              
              {/* Zone D: Karotten + Lauch Mischkultur */}
              <Zone y={354} height={75} label="Zone D: Karotten + Lauch (Mischkultur)" color="#FFF3E0">
                {/* Karotten-Reihen */}
                {[0, 1, 2].map(row => (
                  <React.Fragment key={`k-row-${row}`}>
                    {[...Array(10)].map((_, i) => (
                      <Plant 
                        key={`k-${row}-${i}`} 
                        x={20 + i * 27} 
                        y={375 + row * 22} 
                        type="karotte" 
                        size={8} 
                      />
                    ))}
                  </React.Fragment>
                ))}
                {/* Lauch-Reihen */}
                {[0, 1].map(row => (
                  <React.Fragment key={`l-row-${row}`}>
                    {[...Array(7)].map((_, i) => (
                      <Plant 
                        key={`l-${row}-${i}`} 
                        x={30 + i * 38} 
                        y={386 + row * 22} 
                        type="lauch" 
                        size={9} 
                      />
                    ))}
                  </React.Fragment>
                ))}
                {/* Dill an den Enden */}
                <Plant x={15} y={370} type="dill" size={10} />
                <Plant x={285} y={370} type="dill" size={10} />
                <Plant x={15} y={420} type="dill" size={10} />
                <Plant x={285} y={420} type="dill" size={10} />
              </Zone>
              
              {/* Zone E: Rote Rüben, Kohlrabi, Ringelblumen */}
              <Zone y={432} height={75} label="Zone E: Rote Rüben • Kohlrabi" color="#FCE4EC">
                {/* Rote Rüben West */}
                {[...Array(5)].map((_, i) => (
                  <React.Fragment key={`rr-${i}`}>
                    <Plant x={25 + i * 28} y={460} type="roteruebe" size={13} />
                    <Plant x={25 + i * 28} y={490} type="roteruebe" size={13} />
                  </React.Fragment>
                ))}
                
                {/* Kohlrabi Ost */}
                {[...Array(3)].map((_, i) => (
                  <React.Fragment key={`kr-${i}`}>
                    <Plant x={185 + i * 35} y={460} type="kohlrabi" size={14} />
                    <Plant x={185 + i * 35} y={490} type="kohlrabi" size={14} />
                  </React.Fragment>
                ))}
                
                {/* Ringelblumen */}
                <Plant x={80} y={500} type="ringelblume" size={11} />
                <Plant x={165} y={500} type="ringelblume" size={11} />
                <Plant x={25} y={475} type="ringelblume" size={11} />
                <Plant x={275} y={475} type="ringelblume" size={11} />
              </Zone>
              
              {/* Kompass */}
              <g transform="translate(275, 25)">
                <circle cx={0} cy={0} r={12} fill="white" stroke="#546E7A" strokeWidth={1}/>
                <text x={0} y={4} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#37474F">N</text>
              </g>
            </svg>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium text-gray-500">↓ SÜD</span>
              <span className="text-xs text-gray-400">Klicke auf Pflanzen für Details</span>
            </div>
          </div>
          
          {/* Legende & Info Panel */}
          {showDetails && (
            <div className="lg:w-80 space-y-4">
              {/* Selected Plant Info */}
              {selectedPlant && (
                <div className="bg-white rounded-xl shadow-lg p-4 border-l-4" style={{ borderColor: selectedPlant.color }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{selectedPlant.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{selectedPlant.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                        backgroundColor: selectedPlant.type === 'H' ? '#E8F5E9' : '#FFF3E0',
                        color: selectedPlant.type === 'H' ? '#2E7D32' : '#EF6C00'
                      }}>
                        {selectedPlant.type === 'H' ? 'Hauptkultur' : 'Beikraut'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPlant(null)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕ schließen
                  </button>
                </div>
              )}
              
              {/* Legende */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📋</span> Legende
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(plantData).map(([key, plant]) => (
                    <div 
                      key={key} 
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedPlant(plant)}
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: plant.color }}>
                        {plant.icon}
                      </span>
                      <span className="text-xs text-gray-600 truncate">{plant.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Zonen Info */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📏</span> Zonen
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DCEDC8' }}></div>
                    <span className="text-gray-600">Zone A: 100 cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#C8E6C9' }}></div>
                    <span className="text-gray-600">Zone B: 80 cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#B2DFDB' }}></div>
                    <span className="text-gray-600">Zone C: 100 cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFF3E0' }}></div>
                    <span className="text-gray-600">Zone D: 80 cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FCE4EC' }}></div>
                    <span className="text-gray-600">Zone E: 80 cm</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-60">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D7CCC8' }}></div>
                    <span className="text-gray-600">Pflegepfade: je 30 cm</span>
                  </div>
                </div>
              </div>
              
              {/* Tipps */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-4 border border-emerald-200">
                <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                  <span>💡</span> Permakultur-Tipp
                </h3>
                <p className="text-sm text-emerald-700">
                  Die Mischkultur Karotte + Lauch schützt sich gegenseitig vor Möhrenfliege und Lauchmotte. Der Dill an den Reihenenden lockt Nützlinge an.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🌿 Heubeet-System mit Terra Preta, Effektiven Mikroorganismen & Schafwolle</p>
          <p className="text-xs mt-1">Regenerative Fruchtfolge: 1 Jahr aktiv, 1 Jahr Ruhe</p>
        </div>
      </div>
    </div>
  );
};

export default BeetPlan;
