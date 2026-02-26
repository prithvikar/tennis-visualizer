import { useMemo, useRef, useEffect, useState } from 'react'

export default function MomentumChart({ points, games, player1, player2, onGameClick }) {
    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(0)

    // Track container width for responsive sizing
    useEffect(() => {
        if (!containerRef.current) return
        const observer = new ResizeObserver(entries => {
            setContainerWidth(entries[0].contentRect.width)
        })
        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // Calculate set boundaries for background shading
    const setBoundaries = useMemo(() => {
        const boundaries = []
        let lastSet = `${points[0]?.set1 || 0}-${points[0]?.set2 || 0}`
        let startIdx = 0

        points.forEach((pt, idx) => {
            const currentSet = `${pt.set1}-${pt.set2}`
            if (currentSet !== lastSet) {
                boundaries.push({ start: startIdx, end: idx - 1, set: lastSet })
                startIdx = idx
                lastSet = currentSet
            }
        })
        boundaries.push({ start: startIdx, end: points.length - 1, set: lastSet })
        return boundaries
    }, [points])

    // Calculate running score for momentum line
    const momentumData = useMemo(() => {
        let p1RunningScore = 0
        let p2RunningScore = 0

        return points.map((pt, idx) => {
            const winner = pt.ptWinner

            if (winner === 1) p1RunningScore++
            else p2RunningScore++

            // Determine outcome type for color
            let outcomeType = 'normal'
            if (pt.isAce) outcomeType = 'ace'
            else if (pt.isRallyWinner || pt.isUnret) outcomeType = 'winner'
            else if (pt.isUnforced) outcomeType = 'unforced'
            else if (pt.isForced) outcomeType = 'forced'

            // Check for key moments
            const isBreakPoint = pt.isBreakPt || false
            const isSetPoint = isSetPointSituation(pt, games)

            return {
                idx,
                winner,
                p1Total: p1RunningScore,
                p2Total: p2RunningScore,
                momentum: p1RunningScore - p2RunningScore,
                outcomeType,
                isBreakPoint,
                isSetPoint,
                pt,
            }
        })
    }, [points, games])

    // Chart dimensions
    const barWidth = Math.max(2, Math.min(8, containerWidth / points.length - 1))
    const chartHeight = 300
    const midY = chartHeight / 2
    const maxMomentum = Math.max(...momentumData.map(d => Math.abs(d.momentum)), 1)
    const scale = (midY - 40) / maxMomentum

    // Get bar color based on winner and outcome
    const getBarColor = (d) => {
        const isP1 = d.winner === 1
        const base = isP1 ? 'var(--player1)' : 'var(--player2)'
        const faded = isP1 ? 'var(--player1-fade)' : 'var(--player2-fade)'

        // Solid = clean win (ace, winner, unreturnable)
        // Faded = won via opponent's unforced error
        if (d.outcomeType === 'unforced') {
            return faded
        }
        return base
    }

    // Find which game a point belongs to
    const getGameForPoint = (ptIdx) => {
        for (const game of games) {
            if (game.points.some(p => p.pt === points[ptIdx]?.pt)) {
                return game
            }
        }
        return null
    }

    return (
        <div className="glass rounded-xl p-4 animate-fade-in" ref={containerRef}>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--player1)' }} />
                    <span>{player1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--player2)' }} />
                    <span>{player2}</span>
                </div>
                <div className="text-[var(--text-muted)]">|</div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded opacity-40" style={{ backgroundColor: 'var(--player1)' }} />
                    <span className="text-[var(--text-secondary)]">Won via UE</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[var(--break-point)] rotate-45" />
                    <span className="text-[var(--text-secondary)]">Break Point</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[var(--set-point)]" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
                    <span className="text-[var(--text-secondary)]">Set Point</span>
                </div>
            </div>

            {/* Chart */}
            <div className="overflow-x-auto">
                <svg
                    width={Math.max(containerWidth - 32, points.length * (barWidth + 1) + 60)}
                    height={chartHeight}
                    className="min-w-full"
                >
                    {/* Set background regions */}
                    {setBoundaries.map((boundary, idx) => (
                        <rect
                            key={idx}
                            x={boundary.start * (barWidth + 1) + 30}
                            y={0}
                            width={(boundary.end - boundary.start + 1) * (barWidth + 1)}
                            height={chartHeight}
                            fill={idx % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'}
                            opacity={0.5}
                        />
                    ))}

                    {/* Center line */}
                    <line
                        x1={30}
                        y1={midY}
                        x2={points.length * (barWidth + 1) + 30}
                        y2={midY}
                        stroke="var(--border)"
                        strokeWidth={1}
                    />

                    {/* Y-axis labels */}
                    <text x={25} y={40} textAnchor="end" className="fill-[var(--player1)] text-xs">+{maxMomentum}</text>
                    <text x={25} y={midY + 4} textAnchor="end" className="fill-[var(--text-muted)] text-xs">0</text>
                    <text x={25} y={chartHeight - 35} textAnchor="end" className="fill-[var(--player2)] text-xs">-{maxMomentum}</text>

                    {/* Bars */}
                    {momentumData.map((d, idx) => {
                        const barHeight = Math.abs(d.momentum) * scale
                        const y = d.winner === 1 ? midY - barHeight : midY
                        const x = idx * (barWidth + 1) + 30

                        return (
                            <g
                                key={idx}
                                className="cursor-pointer"
                                onClick={() => {
                                    const game = getGameForPoint(idx)
                                    if (game) onGameClick(game)
                                }}
                            >
                                {/* Bar */}
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight || 2}
                                    fill={getBarColor(d)}
                                    rx={1}
                                    className="momentum-bar"
                                />

                                {/* Break point marker */}
                                {d.isBreakPoint && (
                                    <rect
                                        x={x + barWidth / 2 - 3}
                                        y={d.winner === 1 ? y - 10 : y + barHeight + 4}
                                        width={6}
                                        height={6}
                                        fill="var(--break-point)"
                                        transform={`rotate(45 ${x + barWidth / 2} ${d.winner === 1 ? y - 7 : y + barHeight + 7})`}
                                        className="break-point-marker"
                                    />
                                )}

                                {/* Set point marker */}
                                {d.isSetPoint && (
                                    <polygon
                                        points={`${x + barWidth / 2},${d.winner === 1 ? y - 14 : y + barHeight + 8} ${x + barWidth / 2 - 4},${d.winner === 1 ? y - 6 : y + barHeight + 16} ${x + barWidth / 2 + 4},${d.winner === 1 ? y - 6 : y + barHeight + 16}`}
                                        fill="var(--set-point)"
                                    />
                                )}
                            </g>
                        )
                    })}

                    {/* Set labels */}
                    {setBoundaries.map((boundary, idx) => (
                        <text
                            key={`label-${idx}`}
                            x={((boundary.start + boundary.end) / 2) * (barWidth + 1) + 30}
                            y={chartHeight - 8}
                            textAnchor="middle"
                            className="fill-[var(--text-muted)] text-xs font-medium"
                        >
                            Set {boundary.set}
                        </text>
                    ))}
                </svg>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Points"
                    value={points.length}
                />
                <StatCard
                    label={`${player1} Points`}
                    value={momentumData.length > 0 ? momentumData[momentumData.length - 1].p1Total : 0}
                    color="var(--player1)"
                />
                <StatCard
                    label={`${player2} Points`}
                    value={momentumData.length > 0 ? momentumData[momentumData.length - 1].p2Total : 0}
                    color="var(--player2)"
                />
                <StatCard
                    label="Break Points"
                    value={momentumData.filter(d => d.isBreakPoint).length}
                    color="var(--break-point)"
                />
            </div>

            <p className="mt-4 text-sm text-[var(--text-muted)] text-center">
                Click on any bar to view game details
            </p>
        </div>
    )
}

function StatCard({ label, value, color }) {
    return (
        <div className="bg-[var(--surface)] rounded-lg p-3 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">{label}</div>
            <div
                className="text-2xl font-bold"
                style={{ color: color || 'var(--text-primary)' }}
            >
                {value}
            </div>
        </div>
    )
}

function isSetPointSituation(pt, games) {
    // Check if score indicates set point
    // This is a simplified check - would need more logic for tiebreaks
    const { gm1, gm2, pts, svr } = pt

    if (gm1 >= 5 && gm2 <= 5 && gm1 - gm2 >= 1) {
        // P1 potentially on set point
        if (pts === '40-0' || pts === '40-15' || pts === '40-30' || pts === 'AD-40') {
            return svr === 1
        }
        if (pts === '0-40' || pts === '15-40' || pts === '30-40' || pts === '40-AD') {
            return svr === 2
        }
    }

    if (gm2 >= 5 && gm1 <= 5 && gm2 - gm1 >= 1) {
        // P2 potentially on set point
        if (pts === '0-40' || pts === '15-40' || pts === '30-40' || pts === '40-AD') {
            return svr === 1
        }
        if (pts === '40-0' || pts === '40-15' || pts === '40-30' || pts === 'AD-40') {
            return svr === 2
        }
    }

    return false
}
