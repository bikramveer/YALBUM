interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export default function Logo({ width = 40, height = 40, className = '' }: LogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle - camera lens ring */}
      <circle 
        cx="20" 
        cy="20" 
        r="18" 
        stroke="url(#logo-gradient)" 
        strokeWidth="2.5"
        fill="none"
      />
      
      {/* Aperture blades - creating an aperture effect */}
      <g opacity="0.9">
        <path 
          d="M20 8 L20 15" 
          stroke="url(#logo-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M28.66 13 L24.33 17.33" 
          stroke="url(#logo-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M32 20 L25 20" 
          stroke="url(#logo-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M28.66 27 L24.33 22.67" 
          stroke="url(#logo-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M20 32 L20 25" 
          stroke="url(#logo-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M11.34 27 L15.67 22.67" 
          stroke="url(#logo-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M8 20 L15 20" 
          stroke="url(#logo-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M11.34 13 L15.67 17.33" 
          stroke="url(#logo-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </g>
      
      {/* Center circle */}
      <circle 
        cx="20" 
        cy="20" 
        r="4" 
        fill="url(#logo-gradient)"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}