import { useState } from 'react'

export default function StatsPanel({ stats, player1, player2, theme }) {
    const [view, setView] = useState('match') // 'match' | 'sets'

    return (
        <div
            className="w-full rounded-xl p-4"
            style={{
                background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${theme.border}`
            }}
        >
            {/* View Tabs */}
            <div
                className="flex rounded-lg p-1 mb-4"
                style={{ background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
            >
                <button
                    onClick={() => setView('match')}
                    className="flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all"
                    style={{
                        background: view === 'match' ? theme.playerA : 'transparent',
                        color: view === 'match' ? '#000' : theme.textSecondary
                    }}
                >
                    Match
                </button>
                <button
                    onClick={() => setView('sets')}
                    className="flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all"
                    style={{
                        background: view === 'sets' ? theme.playerA : 'transparent',
                        color: view === 'sets' ? '#000' : theme.textSecondary
                    }}
                >
                    By Set
                </button>
            </div>

            {view === 'match' ? (
                <MatchStats stats={stats} player1={player1} player2={player2} theme={theme} />
            ) : (
                <SetStats stats={stats} player1={player1} player2={player2} theme={theme} />
            )}
        </div>
    )
}

function MatchStats({ stats, player1, player2, theme }) {
    const p1 = stats.match.p1
    const p2 = stats.match.p2

    // Calculate percentages
    const p1FirstServePct = p1.firstServeTotal > 0 ? Math.round((p1.firstServeIn / p1.firstServeTotal) * 100) : 0
    const p2FirstServePct = p2.firstServeTotal > 0 ? Math.round((p2.firstServeIn / p2.firstServeTotal) * 100) : 0

    const p1FirstServeWinPct = p1.firstServeIn > 0 ? Math.round((p1.firstServeWon / p1.firstServeIn) * 100) : 0
    const p2FirstServeWinPct = p2.firstServeIn > 0 ? Math.round((p2.firstServeWon / p2.firstServeIn) * 100) : 0

    const p1SecondServeWinPct = p1.secondServeTotal > 0 ? Math.round((p1.secondServeWon / p1.secondServeTotal) * 100) : 0
    const p2SecondServeWinPct = p2.secondServeTotal > 0 ? Math.round((p2.secondServeWon / p2.secondServeTotal) * 100) : 0

    const p1ServicePct = p1.servicePointsTotal > 0 ? Math.round((p1.servicePointsWon / p1.servicePointsTotal) * 100) : 0
    const p2ServicePct = p2.servicePointsTotal > 0 ? Math.round((p2.servicePointsWon / p2.servicePointsTotal) * 100) : 0

    const p1ReceivePct = p1.receivingPointsTotal > 0 ? Math.round((p1.receivingPointsWon / p1.receivingPointsTotal) * 100) : 0
    const p2ReceivePct = p2.receivingPointsTotal > 0 ? Math.round((p2.receivingPointsWon / p2.receivingPointsTotal) * 100) : 0

    const statRows = [
        { label: 'Aces', p1: p1.aces, p2: p2.aces },
        { label: 'Double Faults', p1: p1.doubleFaults, p2: p2.doubleFaults, lower: true },
        { label: '1st Serve %', p1: `${p1FirstServePct}%`, p2: `${p2FirstServePct}%`, p1Val: p1FirstServePct, p2Val: p2FirstServePct },
        { label: 'Win % on 1st', p1: `${p1FirstServeWinPct}%`, p2: `${p2FirstServeWinPct}%`, p1Val: p1FirstServeWinPct, p2Val: p2FirstServeWinPct },
        { label: 'Win % on 2nd', p1: `${p1SecondServeWinPct}%`, p2: `${p2SecondServeWinPct}%`, p1Val: p1SecondServeWinPct, p2Val: p2SecondServeWinPct },
        { label: 'Service Pts Won', p1: `${p1.servicePointsWon}/${p1.servicePointsTotal}`, p2: `${p2.servicePointsWon}/${p2.servicePointsTotal}`, p1Val: p1ServicePct, p2Val: p2ServicePct },
        { label: 'Service Games', p1: `${p1.serviceGamesWon}/${p1.serviceGamesTotal}`, p2: `${p2.serviceGamesWon}/${p2.serviceGamesTotal}`, p1Val: p1.serviceGamesWon, p2Val: p2.serviceGamesWon },
        { label: 'Break Points', p1: `${p1.breakPointsConverted}/${p1.breakPointsFaced}`, p2: `${p2.breakPointsConverted}/${p2.breakPointsFaced}`, p1Val: p1.breakPointsConverted, p2Val: p2.breakPointsConverted },
        { label: 'Tiebreaks Won', p1: `${p1.tiebreaksWon}/${p1.tiebreaksPlayed}`, p2: `${p2.tiebreaksWon}/${p2.tiebreaksPlayed}`, p1Val: p1.tiebreaksWon, p2Val: p2.tiebreaksWon },
        { label: 'Receiving Pts', p1: `${p1.receivingPointsWon}/${p1.receivingPointsTotal}`, p2: `${p2.receivingPointsWon}/${p2.receivingPointsTotal}`, p1Val: p1ReceivePct, p2Val: p2ReceivePct },
        { label: 'Points Won', p1: p1.pointsWon, p2: p2.pointsWon },
        { label: 'Games Won', p1: p1.gamesWon, p2: p2.gamesWon },
        { label: 'Max Games Streak', p1: p1.maxGamesInRow, p2: p2.maxGamesInRow },
        { label: 'Max Points Streak', p1: p1.maxPointsInRow, p2: p2.maxPointsInRow },
    ]

    return (
        <div className="space-y-1">
            <h3 className="text-sm font-bold mb-3" style={{ color: theme.text }}>Match Statistics</h3>

            {/* Player Headers */}
            <div className="flex items-center mb-2 text-xs font-medium">
                <div className="flex-1 text-center" style={{ color: theme.playerA }}>
                    {player1.split(' ').pop()}
                </div>
                <div className="w-20"></div>
                <div className="flex-1 text-center" style={{ color: theme.playerB }}>
                    {player2.split(' ').pop()}
                </div>
            </div>

            {statRows.map((row, idx) => (
                <StatRow
                    key={idx}
                    label={row.label}
                    p1={row.p1}
                    p2={row.p2}
                    p1Val={row.p1Val}
                    p2Val={row.p2Val}
                    lower={row.lower}
                    theme={theme}
                />
            ))}
        </div>
    )
}

function SetStats({ stats, player1, player2, theme }) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold" style={{ color: theme.text }}>Set-by-Set Stats</h3>

            {stats.sets.map((set, idx) => {
                const p1 = set.p1
                const p2 = set.p2

                return (
                    <div
                        key={idx}
                        className="rounded-lg p-3"
                        style={{
                            background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: `1px solid ${theme.border}`
                        }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold" style={{ color: theme.textMuted }}>
                                Set {idx + 1}
                            </span>
                            <div className="flex gap-2 font-bold text-sm">
                                <span style={{ color: theme.playerA }}>{p1.gamesWon}</span>
                                <span style={{ color: theme.textMuted }}>-</span>
                                <span style={{ color: theme.playerB }}>{p2.gamesWon}</span>
                            </div>
                        </div>

                        <div className="space-y-1 text-xs">
                            <MiniStatRow label="Aces" p1={p1.aces} p2={p2.aces} theme={theme} />
                            <MiniStatRow label="DFs" p1={p1.doubleFaults} p2={p2.doubleFaults} theme={theme} lower />
                            <MiniStatRow label="BPs Won" p1={p1.breakPointsConverted} p2={p2.breakPointsConverted} theme={theme} />
                            <MiniStatRow label="Points" p1={p1.pointsWon} p2={p2.pointsWon} theme={theme} />
                            <MiniStatRow label="Max Pts Streak" p1={p1.maxPointsInRow} p2={p2.maxPointsInRow} theme={theme} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function StatRow({ label, p1, p2, p1Val, p2Val, theme, lower = false }) {
    // Determine winner for highlighting (use p1Val/p2Val if provided, otherwise parse numbers)
    const v1 = p1Val ?? (typeof p1 === 'number' ? p1 : parseInt(p1) || 0)
    const v2 = p2Val ?? (typeof p2 === 'number' ? p2 : parseInt(p2) || 0)
    const winner = lower
        ? (v1 < v2 ? 1 : (v2 < v1 ? 2 : 0))
        : (v1 > v2 ? 1 : (v2 > v1 ? 2 : 0))

    return (
        <div
            className="py-2 border-b"
            style={{ borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
            <div className="flex items-center text-sm">
                <div
                    className="flex-1 text-center font-bold"
                    style={{ color: winner === 1 ? theme.playerA : theme.textSecondary }}
                >
                    {p1}
                </div>
                <div className="w-20 text-center text-[10px]" style={{ color: theme.textMuted }}>
                    {label}
                </div>
                <div
                    className="flex-1 text-center font-bold"
                    style={{ color: winner === 2 ? theme.playerB : theme.textSecondary }}
                >
                    {p2}
                </div>
            </div>
        </div>
    )
}

function MiniStatRow({ label, p1, p2, theme, lower = false }) {
    const winner = lower
        ? (p1 < p2 ? 1 : (p2 < p1 ? 2 : 0))
        : (p1 > p2 ? 1 : (p2 > p1 ? 2 : 0))

    return (
        <div className="flex items-center">
            <span
                className="w-6 text-right font-medium"
                style={{ color: winner === 1 ? theme.playerA : theme.textSecondary }}
            >
                {p1}
            </span>
            <span className="flex-1 text-center" style={{ color: theme.textMuted }}>
                {label}
            </span>
            <span
                className="w-6 text-left font-medium"
                style={{ color: winner === 2 ? theme.playerB : theme.textSecondary }}
            >
                {p2}
            </span>
        </div>
    )
}
