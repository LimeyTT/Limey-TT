import snakeLogo from "@/assets/snake-logo.png";

interface LimeyLogoProps {
  className?: string;
  showText?: boolean;
}

const LimeyLogo = ({ className = "", showText = true }: LimeyLogoProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center">
        {/* Snake logo with neon green accent */}
        <div className="relative">
          <div className="w-20 h-20 bg-black border-4 border-primary rounded-full flex items-center justify-center neon-glow p-2">
            <img 
              src={snakeLogo} 
              alt="Limey Snake Logo" 
              className="w-full h-full object-contain filter brightness-0 saturate-100 invert-0 hue-rotate-0"
              style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(100%) saturate(5000%) hue-rotate(90deg) brightness(1)' }}
            />
          </div>
        </div>
        
        {showText && (
          <div className="mt-3 text-center">
            <h1 className="text-3xl font-bold text-primary">Limey</h1>
            <p className="text-muted-foreground text-sm">Trinidad & Tobago</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LimeyLogo;