import { useMemo } from 'react'
import { getBarColor } from '../utils/themes'

export default function SetView({ setData, setIndex, totalSets, stats, player1, player2, theme, onGameClick, onPrevSet, onNextSet }) {
    const { games } = setData

    // Get set stats
    const p1Stats = setData.p1
    const p2Stats = setData.p2

    return (
        <div
            className="rounded-xl p-6 animate-fade-in"
            style={{
                background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${theme.border}`
            }}
        >
            {/* Set Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPrevSet}
                        disabled={setIndex === 0}
                        className="p-2 rounded-lg transition-all disabled:opacity-30"
                        style={{ background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div>
                        <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                            Set {setIndex + 1}
                            <span className="text-sm font-normal ml-2" style={{ color: theme.textMuted }}>
                                of {totalSets}
                            </span>
                        </h2>
                        <div className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                            {games.length} games played
                        </div>
                    </div>

                    <button
                        onClick={onNextSet}
                        disabled={setIndex === totalSets - 1}
                        className="p-2 rounded-lg transition-all disabled:opacity-30"
                        style={{ background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Set Score */}
                <div
                    className="flex gap-4 px-6 py-3 rounded-xl"
                    style={{ background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
                >
                    <div className="text-center">
                        <div className="text-xs mb-1" style={{ color: theme.textMuted }}>{player1}</div>
                        <div className="text-3xl font-bold" style={{ color: theme.playerA }}>{p1Stats.gamesWon}</div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-2xl" style={{ color: theme.textMuted }}>-</span>
                    </div>
                    <div className="text-center">
                        <div className="text-xs mb-1" style={{ color: theme.textMuted }}>{player2}</div>
                        <div className="text-3xl font-bold" style={{ color: theme.playerB }}>{p2Stats.gamesWon}</div>
                    </div>
                </div>
            </div>

            {/* Game Flow Chart */}
            <div
                className="rounded-xl p-4 mb-6 overflow-x-auto"
                style={{ background: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            >
                <h3 className="text-sm font-medium mb-4" style={{ color: theme.textMuted }}>Game Flow</h3>
                <div className="flex items-end gap-2 min-h-[120px]">
                    {games.map((game, idx) => {
                        const maxMomentum = Math.max(...games.map(g => Math.abs(g.setMomentum)), 1)
                        const height = Math.max(20, (Math.abs(game.setMomentum) / maxMomentum) * 80)
                        const color = getBarColor(theme, game.winner, game.outcomeType)

                        return (
                            <button
                                key={idx}
                                onClick={() => onGameClick(game.index)}
                                className="flex flex-col items-center cursor-pointer group"
                            >
                                {/* Server indicator */}
                                <div
                                    className="w-3 h-3 rounded-full border-2 mb-1"
                                    style={{ borderColor: theme.serve, backgroundColor: 'transparent' }}
                                />

                                {/* Momentum bar */}
                                <div
                                    className="flex flex-col justify-end"
                                    style={{ height: 100 }}
                                >
                                    {game.winner === 1 ? (
                                        <div
                                            className="w-8 rounded-t transition-all group-hover:brightness-125"
                                            style={{ height, background: color }}
                                        />
                                    ) : (
                                        <>
                                            <div style={{ flex: 1 }} />
                                            <div
                                                className="w-8 rounded-b transition-all group-hover:brightness-125"
                                                style={{ height, background: color }}
                                            />
                                        </>
                                    )}
                                </div>

                                {/* Break indicator */}
                                {game.isBreak && (
                                    <div
                                        className="w-2 h-2 mt-1 rotate-45"
                                        style={{ background: theme.highlight }}
                                    />
                                )}

                                {/* Game number */}
                                <div className="text-[10px] mt-1" style={{ color: theme.textMuted }}>{idx + 1}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Set Stats Comparison */}
            <div className="grid grid-cols-2 gap-6">
                {/* Player 1 Stats */}
                <div
                    className="rounded-xl p-4"
                    style={{ background: `${theme.playerA}10`, border: `1px solid ${theme.playerA}30` }}
                >
                    <h3 className="font-bold text-center mb-3" style={{ color: theme.playerA }}>{player1}</h3>
                    <SetStatsColumn stats={p1Stats} theme={theme} />
                </div>

                {/* Player 2 Stats */}
                <div
                    className="rounded-xl p-4"
                    style={{ background: `${theme.playerB}10`, border: `1px solid ${theme.playerB}30` }}
                >
                    <h3 className="font-bold text-center mb-3" style={{ color: theme.playerB }}>{player2}</h3>
                    <SetStatsColumn stats={p2Stats} theme={theme} />
                </div>
            </div>

            <p className="mt-4 text-sm text-center" style={{ color: theme.textMuted }}>
                Click on a game bar to view point-by-point details
            </p>
        </div>
    )
}

function SetStatsColumn({ stats, theme }) {
    const firstServePct = stats.firstServeTotal > 0
        ? Math.round((stats.firstServeIn / stats.firstServeTotal) * 100)
        : 0
    const firstServeWinPct = stats.firstServeIn > 0
        ? Math.round((stats.firstServeWon / stats.firstServeIn) * 100)
        : 0
    const secondServeWinPct = stats.secondServeTotal > 0
        ? Math.round((stats.secondServeWon / stats.secondServeTotal) * 100)
        : 0
    const servicePointsPct = stats.servicePointsTotal > 0
        ? Math.round((stats.servicePointsWon / stats.servicePointsTotal) * 100)
        : 0
    const receivingPct = stats.receivingPointsTotal > 0
        ? Math.round((stats.receivingPointsWon / stats.receivingPointsTotal) * 100)
        : 0

    return (
        <div className="space-y-2 text-sm">
            <StatRow label="Aces" value={stats.aces} theme={theme} />
            <StatRow label="Double Faults" value={stats.doubleFaults} theme={theme} />
            <StatRow label="1st Serve %" value={`${firstServePct}%`} theme={theme} />
            <StatRow label="Win % 1st Serve" value={`${firstServeWinPct}%`} theme={theme} />
            <StatRow label="Win % 2nd Serve" value={`${secondServeWinPct}%`} theme={theme} />
            <StatRow label="Service Points" value={`${stats.servicePointsWon}/${stats.servicePointsTotal} (${servicePointsPct}%)`} theme={theme} />
            <StatRow label="Service Games" value={`${stats.serviceGamesWon}/${stats.serviceGamesTotal}`} theme={theme} />
            <StatRow label="Receiving Points" value={`${stats.receivingPointsWon}/${stats.receivingPointsTotal} (${receivingPct}%)`} theme={theme} />
            <StatRow label="Break Points" value={`${stats.breakPointsConverted}/${stats.breakPointsFaced}`} theme={theme} />
            <StatRow label="Points Won" value={stats.pointsWon} theme={theme} />
            <StatRow label="Games Won" value={stats.gamesWon} theme={theme} />
            <StatRow label="Max Points Streak" value={stats.maxPointsInRow} theme={theme} />
            <StatRow label="Max Games Streak" value={stats.maxGamesInRow} theme={theme} />
        </div>
    )
}

function StatRow({ label, value, theme }) {
    return (
        <div className="flex justify-between">
            <span style={{ color: theme.textSecondary }}>{label}</span>
            <span className="font-medium" style={{ color: theme.text }}>{value}</span>
        </div>
    )
}
