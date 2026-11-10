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

export default function BeetPlan() {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  
  const Plant = ({ x, y, type, size = 20, count, isStange }) => {
    const plant = plantData[type];
    if (!plant) return null;
    
    return (
      <g 
        className="cursor-pointer"
        onClick={() => setSelectedPlant(plant)}
        transform={`translate(${x}, ${y})`}
      >
        <circle 
          cx={0} 
          cy={0} 
          r={size} 
          fill={plant.color}
          stroke="#fff"
          strokeWidth={2}
        />
        <text 
          x={0} 
          y={4} 
          textAnchor="middle" 
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-green-50 to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-800 mb-1">
            🌱 Permakultur-Beetplan
          </h1>
          <p className="text-emerald-600 text-sm">3 × 5 Meter Mischkultur • Eberndorf, Kärnten</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 bg-white rounded-xl shadow-lg p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">↑ NORD</span>
              <span className="text-xs text-gray-400">300 × 500 cm</span>
            </div>
            
            <svg viewBox="0 0 300 520" className="w-full max-w-sm mx-auto">
              <defs>
                <pattern id="soil" patternUnits="userSpaceOnUse" width="20" height="20">
                  <rect width="20" height="20" fill="#8D6E63" opacity="0.1"/>
                  <circle cx="5" cy="5" r="1" fill="#795548" opacity="0.3"/>
                  <circle cx="15" cy="15" r="1" fill="#795548" opacity="0.3"/>
                </pattern>
              </defs>
              
              <rect x={5} y={5} width={290} height={510} fill="url(#soil)" rx={8} stroke="#A1887F" strokeWidth={2}/>
              
              <g>
                <text x={150} y={22} textAnchor="middle" fontSize={9} fill="#5C6BC0" fontWeight="bold">
                  Beinwell (außen)
                </text>
                {[40, 110, 190, 260].map((x, i) => (
                  <circle key={i} cx={x} cy={38} r={12} fill="#C5CAE9" stroke="#5C6BC0" strokeWidth={2}/>
                ))}
              </g>
              
              <Zone y={50} height={85} label="Zone A: Feuerbohnen" color="#DCEDC8">
                {[35, 95, 150, 205, 265].map((x, i) => (
                  <Plant key={i} x={x} y={100} type="feuerbohne" size={22} isStange />
                ))}
                {[65, 125, 180, 235].map((x, i) => (
                  <Plant key={`bk-${i}`} x={x} y={115} type="bohnenkraut" size={12} />
                ))}
              </Zone>
              
              <Weg y={138} />
              
              <Zone y={163} height={75} label="Zone B: Kohl • Gurken • Sellerie" color="#C8E6C9">
                <Plant x={35} y={195} type="kohlsprossen" size={18} />
                <Plant x={35} y={220} type="kohlsprossen" size={18} />
                <Plant x={75} y={195} type="kohlsprossen" size={18} />
                <Plant x={75} y={220} type="kohlsprossen" size={18} />
                
                <Plant x={150} y={190} type="gurke" size={16} />
                <Plant x={150} y={212} type="gurke" size={16} />
                <Plant x={150} y={230} type="gurke" size={16} />
                <line x1={150} y1={180} x2={150} y2={165} stroke="#795548" strokeWidth={3}/>
                
                {[200, 230, 260].map((x, i) => (
                  <React.Fragment key={i}>
                    <Plant x={x} y={190} type="knollensellerie" size={14} />
                    <Plant x={x} y={218} type="knollensellerie" size={14} />
                  </React.Fragment>
                ))}
                <Plant x={200} y={230} type="knollensellerie" size={14} />
                <Plant x={230} y={230} type="knollensellerie" size={14} />
              </Zone>
              
              <Weg y={241} />
              
              <Zone y={266} height={85} label="Zone C: Paprika • Mangold • Sellerie" color="#B2DFDB">
                <Plant x={35} y={305} type="paprika" size={18} />
                <Plant x={35} y={335} type="paprika" size={18} />
                <Plant x={70} y={320} type="paprika" size={18} />
                
                <Plant x={70} y={295} type="pfefferoni" size={16} />
                <Plant x={70} y={343} type="pfefferoni" size={16} />
                <Plant x={35} y={290} type="pfefferoni" size={16} />
                
                <Plant x={150} y={295} type="mangold" size={17} />
                <Plant x={150} y={320} type="mangold" size={17} />
                <Plant x={150} y={345} type="mangold" size={17} />
                
                <Plant x={215} y={300} type="stangensellerie" size={15} />
                <Plant x={255} y={300} type="stangensellerie" size={15} />
                <Plant x={215} y={335} type="stangensellerie" size={15} />
                <Plant x={255} y={335} type="stangensellerie" size={15} />
              </Zone>
              
              <Zone y={354} height={75} label="Zone D: Karotten + Lauch" color="#FFF3E0">
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
                <Plant x={15} y={370} type="dill" size={10} />
                <Plant x={285} y={370} type="dill" size={10} />
                <Plant x={15} y={420} type="dill" size={10} />
                <Plant x={285} y={420} type="dill" size={10} />
              </Zone>
              
              <Zone y={432} height={75} label="Zone E: Rote Rüben • Kohlrabi" color="#FCE4EC">
                {[...Array(5)].map((_, i) => (
                  <React.Fragment key={`rr-${i}`}>
                    <Plant x={25 + i * 28} y={460} type="roteruebe" size={13} />
                    <Plant x={25 + i * 28} y={490} type="roteruebe" size={13} />
                  </React.Fragment>
                ))}
                
                {[...Array(3)].map((_, i) => (
                  <React.Fragment key={`kr-${i}`}>
                    <Plant x={185 + i * 35} y={460} type="kohlrabi" size={14} />
                    <Plant x={185 + i * 35} y={490} type="kohlrabi" size={14} />
                  </React.Fragment>
                ))}
                
                <Plant x={80} y={500} type="ringelblume" size={11} />
                <Plant x={165} y={500} type="ringelblume" size={11} />
                <Plant x={25} y={475} type="ringelblume" size={11} />
                <Plant x={275} y={475} type="ringelblume" size={11} />
              </Zone>
              
              <g transform="translate(275, 25)">
                <circle cx={0} cy={0} r={12} fill="white" stroke="#546E7A" strokeWidth={1}/>
                <text x={0} y={4} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#37474F">N</text>
              </g>
            </svg>
            
            <div className="text-center mt-2">
              <span className="text-sm font-medium text-gray-500">↓ SÜD</span>
            </div>
          </div>
          
          {showDetails && (
            <div className="lg:w-72 space-y-3">
              {selectedPlant && (
                <div className="bg-white rounded-xl shadow-lg p-3 border-l-4" style={{ borderColor: selectedPlant.color }}>
                  <div className="flex items-center gap-3">
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
                </div>
              )}
              
              <div className="bg-white rounded-xl shadow-lg p-3">
                <h3 className="font-bold text-gray-700 mb-2 text-sm">📋 Legende</h3>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(plantData).map(([key, plant]) => (
                    <div 
                      key={key} 
                      className="flex items-center gap-1.5 p-1 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedPlant(plant)}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: plant.color }}>
                        {plant.icon}
                      </span>
                      <span className="text-gray-600 truncate">{plant.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-3">
                <h3 className="font-bold text-gray-700 mb-2 text-sm">📏 Zonen</h3>
                <div className="space-y-1 text-xs">
                  {[
                    { color: '#DCEDC8', label: 'Zone A: 100 cm' },
                    { color: '#C8E6C9', label: 'Zone B: 80 cm' },
                    { color: '#B2DFDB', label: 'Zone C: 100 cm' },
                    { color: '#FFF3E0', label: 'Zone D: 80 cm' },
                    { color: '#FCE4EC', label: 'Zone E: 80 cm' },
                    { color: '#D7CCC8', label: 'Pflegepfade: je 30 cm' }
                  ].map((zone, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }}></div>
                      <span className="text-gray-600">{zone.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-3 border border-emerald-200">
                <h3 className="font-bold text-emerald-800 mb-1 text-sm">💡 Tipp</h3>
                <p className="text-xs text-emerald-700">
                  Karotte + Lauch schützen sich gegenseitig vor Möhrenfliege und Lauchmotte!
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>🌿 Heubeet mit Terra Preta & Schafwolle • Klicke auf Pflanzen für Details</p>
        </div>
      </div>
    </div>
  );
}
