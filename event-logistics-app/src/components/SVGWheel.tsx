'use client'

export type WheelDatum = { option: string }

export default function SVGWheel({
  data,
  spinning,
  stopAngle,
  onStop,
}: {
  data: WheelDatum[]
  spinning: boolean
  stopAngle: number
  onStop: () => void
}) {
  const size = 280
  const pointerH = 28 
  const radius = size / 2
  const cx = radius
  const cy = radius
  const slice = data.length > 0 ? (2 * Math.PI) / data.length : 0
// Updated deployment
  return (
    <div style={{ position: 'relative', width: size, height: size + pointerH }}>
    <div
      style={{
        position: 'absolute',
        top: pointerH,
        left: 0,
        width: size,
        height: size,
        transition: spinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
        transform: `rotate(${spinning ? stopAngle : 0}deg)`,                                                                                  
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      onTransitionEnd={() => {
        if (spinning) {
          onStop()
        }
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        shapeRendering="geometricPrecision"
      >
        {/* 1) Wedges + labels */}
        {data.map((d, i) => {
            // Wedge geometry
            const start = i * slice
            const end = (i + 1) * slice
            const x1 = cx + radius * Math.cos(start)
            const y1 = cy + radius * Math.sin(start)
            const x2 = cx + radius * Math.cos(end)
            const y2 = cy + radius * Math.sin(end)
            const largeArc = end - start > Math.PI ? 1 : 0
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

            // Colors
            const colors = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']
            const fill = colors[i % colors.length]

            // Slice bisector (angle)
            const theta = (start + end) / 2
            const angleDeg = theta * (180 / Math.PI)

            // Label position: along the bisector, centered in the slice
            const isTwo = data.length === 2
            const midR = radius * (isTwo ? 0.70 : 0.55)
            const x = cx + midR * Math.cos(theta)
            const y = cy + midR * Math.sin(theta)
              // Keep text upright
            const needsFlip = angleDeg > 90 && angleDeg < 270

          return (
            <g key={i}>
              <path d={path} fill={fill} />
              <text
                x={x}
                y={y}
                fill="#000"
                fontFamily="Arial, sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
                fontWeight="bold"
                fontSize={
                    data.length >= 80 ? 7 :
                    data.length >= 60 ? 8 :
                    data.length >= 40 ? 9 :
                    data.length >= 20 ? 11 : 13
                }
                transform={`rotate(${angleDeg + (needsFlip ? 180 : 0)} ${x} ${y})`}
                style={{
                    pointerEvents: 'none'
                  }}
                >
                {(d.option ?? '').toString().trim() || `SLICE ${i + 1}`}
              </text>
            </g>
          )
        })}

        {/* 2) Radial separators */}
        {data.map((_, i) => {
          const ang = i * slice
          const sx = cx + radius * Math.cos(ang)
          const sy = cy + radius * Math.sin(ang)
          return (
            <line
              key={`sep-${i}`}
              x1={cx}
              y1={cy}
              x2={sx}
              y2={sy}
              stroke="#111827"
              strokeWidth="2"
            />
          )
        })}

        {/* 3) Outer border rim */}
        <circle
          cx={cx}
          cy={cy}
          r={radius - 2}
          fill="none"
          stroke="#111827"
          strokeWidth="6"
        />
       </svg>
      </div>
    
        {/* Fixed pointer OUTSIDE the wheel (top center) */}
      <svg
        width={size}
        height={size + pointerH}
        viewBox={`0 0 ${size} ${size + pointerH}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
        <polygon
          points={`
            ${cx - 12},${pointerH-18} 
            ${cx + 12},${pointerH-18} 
            ${cx},${pointerH +2}
          `}
          fill="#111827"
          stroke="#111827"
          strokeWidth="1.5"
        />
        <circle cx={cx} cy={pointerH - 18} r="2" fill="#111827" />
      </svg>
    </div>
  )
}