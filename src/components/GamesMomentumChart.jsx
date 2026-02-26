import { useMemo, useRef, useEffect, useState } from 'react'
import { getBarColor, withOpacity } from '../utils/themes'

export default function GamesMomentumChart({ games, stats, player1, player2, theme, onGameClick }) {
    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(0)
    const [hoveredGame, setHoveredGame] = useState(null)

    useEffect(() => {
        if (!containerRef.current) return
        const observer = new ResizeObserver(entries => {
            setContainerWidth(entries[0].contentRect.width)
        })
        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // Use pre-calculated game data with per-set momentum
    const gameData = useMemo(() => {
        return stats.games.map((game, idx) => ({
            ...game,
            idx,
            // Use setMomentum which resets each set (calculated in themes.js)
            momentum: game.setMomentum,
        }))
    }, [stats.games])

    // Find set boundaries
    const setBoundaries = useMemo(() => {
        const boundaries = []
        let lastSet = `${gameData[0]?.set?.p1 || 0}-${gameData[0]?.set?.p2 || 0}`
        let startIdx = 0

        gameData.forEach((game, idx) => {
            const currentSet = `${game.set.p1}-${game.set.p2}`
            if (currentSet !== lastSet) {
                boundaries.push({ start: startIdx, end: idx - 1, set: lastSet, setNum: boundaries.length + 1 })
                startIdx = idx
                lastSet = currentSet
            }
        })
        boundaries.push({ start: startIdx, end: gameData.length - 1, set: lastSet, setNum: boundaries.length + 1 })
        return boundaries
    }, [gameData])

    // Chart dimensions - max momentum is now per-set
    const barWidth = Math.max(20, Math.min(50, (containerWidth - 100) / games.length - 4))
    const chartHeight = 350
    const midY = chartHeight / 2
    // Find max points per game for scaling bar heights
    const maxPoints = Math.max(...gameData.map(d => d.p1Points + d.p2Points), 1)
    const pointsScale = (midY - 60) / maxPoints

    return (
        <div
            ref={containerRef}
            className="rounded-xl p-4 animate-fade-in"
            style={{
                background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${theme.border}`
            }}
        >
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.playerA }} />
                    <span>{player1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.playerB }} />
                    <span>{player2}</span>
                </div>
                <div style={{ color: theme.textMuted }}>|</div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: withOpacity(theme.playerA, 0.45) }} />
                    <span style={{ color: theme.textSecondary }}>Won via UE</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rotate-45"
                        style={{ backgroundColor: theme.highlight }}
                    />
                    <span style={{ color: theme.textSecondary }}>Break</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full border-2"
                        style={{ borderColor: theme.serve, backgroundColor: 'transparent' }}
                    />
                    <span style={{ color: theme.textSecondary }}>On Serve</span>
                </div>
            </div>

            {/* Chart */}
            <div className="overflow-x-auto">
                <svg
                    width={Math.max(containerWidth - 32, games.length * (barWidth + 4) + 80)}
                    height={chartHeight}
                    className="min-w-full"
                >
                    {/* Set background regions */}
                    {setBoundaries.map((boundary, idx) => (
                        <g key={idx}>
                            <rect
                                x={boundary.start * (barWidth + 4) + 40}
                                y={20}
                                width={(boundary.end - boundary.start + 1) * (barWidth + 4)}
                                height={chartHeight - 60}
                                fill={idx % 2 === 0
                                    ? (theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')
                                    : (theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                                }
                                rx={8}
                            />
                            <text
                                x={((boundary.start + boundary.end) / 2) * (barWidth + 4) + 40 + barWidth / 2}
                                y={chartHeight - 10}
                                textAnchor="middle"
                                fontSize={12}
                                fontWeight="bold"
                                fill={theme.textMuted}
                            >
                                Set {boundary.setNum}
                            </text>
                        </g>
                    ))}

                    {/* Center line */}
                    <line
                        x1={40}
                        y1={midY}
                        x2={games.length * (barWidth + 4) + 40}
                        y2={midY}
                        stroke={theme.border}
                        strokeWidth={2}
                        strokeDasharray="4,4"
                    />

                    {/* Y-axis labels */}
                    <text x={35} y={60} textAnchor="end" fontSize={11} fill={theme.playerA}>
                        {player1.split(' ').map(n => n[0]).join('')}
                    </text>
                    <text x={35} y={midY + 4} textAnchor="end" fontSize={11} fill={theme.textMuted}>
                        0
                    </text>
                    <text x={35} y={chartHeight - 60} textAnchor="end" fontSize={11} fill={theme.playerB}>
                        {player2.split(' ').map(n => n[0]).join('')}
                    </text>

                    {/* Game bars */}
                    {gameData.map((game, idx) => {
                        // Bar height based on total points in game
                        const totalPoints = game.p1Points + game.p2Points
                        const barHeight = Math.max(12, totalPoints * pointsScale)
                        const y = game.winner === 1 ? midY - barHeight : midY
                        const x = idx * (barWidth + 4) + 40
                        const color = getBarColor(theme, game.winner, game.outcomeType)
                        const isHovered = hoveredGame === idx

                        return (
                            <g
                                key={idx}
                                className="cursor-pointer"
                                onClick={() => onGameClick(idx)}
                                onMouseEnter={() => setHoveredGame(idx)}
                                onMouseLeave={() => setHoveredGame(null)}
                                style={{ transition: 'transform 0.15s ease-out' }}
                            >
                                {/* Bar */}
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill={color}
                                    rx={4}
                                    style={{
                                        filter: isHovered ? 'brightness(1.2)' : 'none',
                                        transition: 'all 0.15s ease-out'
                                    }}
                                />

                                {/* Server indicator - circle on the server's side */}
                                {game.server === 1 && (
                                    <circle
                                        cx={x + barWidth / 2}
                                        cy={game.winner === 1 ? y - 8 : y + barHeight + 8}
                                        r={4}
                                        fill="none"
                                        stroke={theme.serve}
                                        strokeWidth={2}
                                    />
                                )}
                                {game.server === 2 && (
                                    <circle
                                        cx={x + barWidth / 2}
                                        cy={game.winner === 1 ? y + barHeight + 8 : y - 8}
                                        r={4}
                                        fill="none"
                                        stroke={theme.serve}
                                        strokeWidth={2}
                                    />
                                )}

                                {/* Break indicator */}
                                {game.isBreak && (
                                    <rect
                                        x={x + barWidth / 2 - 5}
                                        y={game.winner === 1 ? y - 18 : y + barHeight + 18}
                                        width={10}
                                        height={10}
                                        fill={theme.highlight}
                                        transform={`rotate(45 ${x + barWidth / 2} ${game.winner === 1 ? y - 13 : y + barHeight + 23})`}
                                    />
                                )}

                                {/* Game number inside bar */}
                                {barWidth >= 24 && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={y + barHeight / 2 + 4}
                                        textAnchor="middle"
                                        fontSize={10}
                                        fontWeight="bold"
                                        fill={theme.isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'}
                                    >
                                        {idx + 1}
                                    </text>
                                )}

                                {/* Hover tooltip */}
                                {isHovered && (
                                    <g>
                                        <rect
                                            x={x - 20}
                                            y={game.winner === 1 ? y - 55 : y + barHeight + 25}
                                            width={barWidth + 40}
                                            height={35}
                                            fill={theme.isDark ? '#333' : '#fff'}
                                            stroke={theme.border}
                                            rx={4}
                                        />
                                        <text
                                            x={x + barWidth / 2}
                                            y={game.winner === 1 ? y - 42 : y + barHeight + 42}
                                            textAnchor="middle"
                                            fontSize={10}
                                            fill={theme.text}
                                        >
                                            {game.isTiebreak ? 'Tiebreak' : `Game ${idx + 1}`}
                                        </text>
                                        <text
                                            x={x + barWidth / 2}
                                            y={game.winner === 1 ? y - 28 : y + barHeight + 56}
                                            textAnchor="middle"
                                            fontSize={11}
                                            fontWeight="bold"
                                            fill={game.winner === 1 ? theme.playerA : theme.playerB}
                                        >
                                            {game.p1Points} - {game.p2Points}
                                        </text>
                                    </g>
                                )}
                            </g>
                        )
                    })}
                </svg>
            </div>

            {/* Set Summary Row */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {setBoundaries.map((boundary, idx) => {
                    const setGames = gameData.slice(boundary.start, boundary.end + 1)
                    const p1Wins = setGames.filter(g => g.winner === 1).length
                    const p2Wins = setGames.filter(g => g.winner === 2).length
                    const breaks = setGames.filter(g => g.isBreak).length

                    return (
                        <div
                            key={idx}
                            className="flex-shrink-0 px-4 py-2 rounded-lg text-center min-w-[100px]"
                            style={{
                                background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                border: `1px solid ${theme.border}`
                            }}
                        >
                            <div className="text-xs mb-1" style={{ color: theme.textMuted }}>
                                Set {boundary.setNum}
                            </div>
                            <div className="flex items-center justify-center gap-1 font-bold">
                                <span style={{ color: theme.playerA }}>{p1Wins}</span>
                                <span style={{ color: theme.textMuted }}>-</span>
                                <span style={{ color: theme.playerB }}>{p2Wins}</span>
                            </div>
                            {breaks > 0 && (
                                <div className="text-xs mt-1" style={{ color: theme.highlight }}>
                                    {breaks} break{breaks > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <p className="mt-4 text-sm text-center" style={{ color: theme.textMuted }}>
                Click on any game bar to view point-by-point details
            </p>
        </div>
    )
}
