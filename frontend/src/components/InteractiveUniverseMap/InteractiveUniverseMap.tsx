import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useUniverse } from '../../context/UniverseContext';

const getArtifactImage = (category: string, index: number) => {
  const cat = category.toLowerCase();
  if (cat.includes('anime')) return 'https://images.unsplash.com/photo-1578589318433-39b5de440c3f?w=800&q=80'; // Japanese aesthetic
  if (cat.includes('sci') || cat.includes('movie') || cat.includes('series')) return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80'; // Sci-fi/Movie vibe
  if (index % 2 === 0) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'; // Fantasy
  return 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80'; // Generic hero vibe
};

const TiltCard = ({ universe, index, isSelected, onClick }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const bgImage = getArtifactImage(universe.category, index);

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative w-[320px] h-[480px] bg-black rounded-2xl overflow-hidden cursor-pointer border transition-colors duration-500 ${
        isSelected ? 'border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]' : 'border-black/20 hover:border-white/50'
      }`}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-700 hover:scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 flex flex-col justify-end">
        <div className="flex justify-between items-start mb-auto">
          <span className="font-display text-4xl text-white opacity-50">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="font-display text-[10px] tracking-widest text-white uppercase border border-white/30 px-2 py-1 backdrop-blur-md">
            {universe.category}
          </div>
        </div>

        <h3 className="font-display text-3xl font-black uppercase tracking-tight text-white mb-2 leading-none">
          {universe.name}
        </h3>
        <p className="font-body text-white/70 text-xs leading-relaxed mb-6 line-clamp-2">
          {universe.description}
        </p>

        <div className="flex items-center justify-between border-t border-white/20 pt-4">
          <span className="font-display text-[10px] tracking-[0.2em] uppercase text-white">
            {isSelected ? 'System Active' : 'Initialize Protocol'}
          </span>
          <span className={`text-white transition-transform duration-500 ${isSelected ? 'rotate-90' : ''}`}>
            →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function InteractiveUniverseMap() {
  const { universesList, selectedUniverse, setSelectedUniverse } = useUniverse();
  const constraintsRef = useRef(null);

  const positions = [
    { x: '15%', y: '25%' },
    { x: '45%', y: '15%' },
    { x: '75%', y: '35%' },
    { x: '25%', y: '65%' },
    { x: '65%', y: '75%' },
    { x: '85%', y: '50%' },
  ];

  return (
    <div className="relative w-full h-[700px] bg-white border border-black/10 overflow-hidden group">
      <motion.div 
        ref={constraintsRef}
        className="absolute inset-0 z-0"
      >
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: `radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        >
          {universesList.map((universe, i) => {
            const pos = positions[i % positions.length];
            const isSelected = selectedUniverse.id === universe.id;
            return (
              <motion.div 
                key={universe.id} 
                className="absolute"
                style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, type: "spring", bounce: 0.4 }}
              >
                <TiltCard 
                  universe={universe} 
                  index={i} 
                  isSelected={isSelected} 
                  onClick={() => setSelectedUniverse(universe)} 
                />
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-6 left-6 pointer-events-none z-10 flex gap-4">
        <div className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-black font-bold">
          <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
          Map Active
        </div>
        <div className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-black/50">
          [ Drag & Hover to Explore ]
        </div>
      </div>
    </div>
  );
}
