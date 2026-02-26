export default function GameDetail({ game, gameIndex, totalGames, stats, player1, player2, theme, onPointClick, onPrevGame, onNextGame }) {
    const { points, server, isTiebreak } = game

    const serverName = server === 1 ? player1 : player2

    // Get game stats
    const gameStats = stats.games[gameIndex]
    const p1Won = gameStats?.p1Points || 0
    const p2Won = gameStats?.p2Points || 0
    const gameWinner = gameStats?.winner === 1 ? player1 : player2
    const wasBreak = gameStats?.isBreak

    return (
        <div
            className="rounded-xl p-6 animate-fade-in"
            style={{
                background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${theme.border}`
            }}
        >
            {/* Game Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {/* Prev/Next Navigation */}
                    <button
                        onClick={onPrevGame}
                        disabled={gameIndex === 0}
                        className="p-2 rounded-lg transition-all disabled:opacity-30"
                        style={{
                            background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                                {isTiebreak ? 'Tiebreak' : `Game ${gameIndex + 1}`}
                                <span className="text-sm font-normal ml-2" style={{ color: theme.textMuted }}>
                                    of {totalGames}
                                </span>
                            </h2>
                            {wasBreak && (
                                <span
                                    className="px-2 py-1 text-xs font-bold rounded"
                                    style={{
                                        background: `${theme.highlight}30`,
                                        color: theme.highlight
                                    }}
                                >
                                    BREAK
                                </span>
                            )}
                        </div>
                        <div className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                            Set: {game.set.p1} - {game.set.p2} • Games: {game.game.p1} - {game.game.p2}
                        </div>
                    </div>

                    <button
                        onClick={onNextGame}
                        disabled={gameIndex === totalGames - 1}
                        className="p-2 rounded-lg transition-all disabled:opacity-30"
                        style={{
                            background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="text-right">
                    <div className="text-sm" style={{ color: theme.textMuted }}>Server</div>
                    <div className="flex items-center gap-2 justify-end">
                        <div
                            className="w-4 h-4 rounded-full border-2"
                            style={{ borderColor: theme.serve, backgroundColor: 'transparent' }}
                        />
                        <span
                            className="font-bold"
                            style={{ color: server === 1 ? theme.playerA : theme.playerB }}
                        >
                            {serverName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Game Score Summary */}
            <div
                className="flex justify-center gap-8 py-4 mb-6 rounded-xl"
                style={{
                    background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                }}
            >
                <div className="text-center">
                    <div className="text-sm mb-1" style={{ color: theme.textMuted }}>{player1}</div>
                    <div className="text-3xl font-bold" style={{ color: theme.playerA }}>{p1Won}</div>
                </div>
                <div className="flex items-center">
                    <span className="text-2xl" style={{ color: theme.textMuted }}>-</span>
                </div>
                <div className="text-center">
                    <div className="text-sm mb-1" style={{ color: theme.textMuted }}>{player2}</div>
                    <div className="text-3xl font-bold" style={{ color: theme.playerB }}>{p2Won}</div>
                </div>
            </div>

            {/* Point Track */}
            <div
                className="rounded-xl p-4 mb-6"
                style={{
                    background: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                }}
            >
                <h3 className="text-sm font-medium mb-4" style={{ color: theme.textMuted }}>
                    Point Track
                </h3>

                <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
                    {points.map((pt, idx) => (
                        <PointCard
                            key={idx}
                            point={pt}
                            index={idx}
                            server={server}
                            player1={player1}
                            player2={player2}
                            theme={theme}
                            onClick={() => onPointClick(pt)}
                        />
                    ))}
                </div>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Points" value={points.length} theme={theme} />
                <StatCard label="Aces" value={gameStats?.aces || 0} theme={theme} />
                <StatCard label="Double Faults" value={gameStats?.doubleFaults || 0} theme={theme} />
                <StatCard label="Winners" value={gameStats?.winners || 0} theme={theme} />
                <StatCard label="Unforced Errors" value={gameStats?.unforcedErrors || 0} theme={theme} />
            </div>
        </div>
    )
}

function PointCard({ point, index, server, player1, player2, theme, onClick }) {
    const winner = point.ptWinner
    const isBreak = point.isBreakPt

    let outcomeColor = theme.textMuted
    let outcomeLabel = ''

    if (point.isAce) {
        outcomeColor = '#a855f7'
        outcomeLabel = 'ACE'
    } else if (point.isDouble) {
        outcomeColor = '#ef4444'
        outcomeLabel = 'DF'
    } else if (point.isRallyWinner) {
        outcomeColor = '#22c55e'
        outcomeLabel = 'W'
    } else if (point.isUnforced) {
        outcomeColor = '#ef4444'
        outcomeLabel = 'UE'
    } else if (point.isForced) {
        outcomeColor = '#eab308'
        outcomeLabel = 'FE'
    } else if (point.isUnret) {
        outcomeColor = '#22c55e'
        outcomeLabel = 'UR'
    }

    return (
        <button
            onClick={onClick}
            className="relative flex flex-col items-center p-3 min-w-[70px] rounded-lg transition-all hover:scale-105 cursor-pointer"
            style={{
                background: isBreak
                    ? `${theme.highlight}20`
                    : (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                border: isBreak ? `2px solid ${theme.highlight}` : `1px solid ${theme.border}`
            }}
        >
            <div className="text-[10px] mb-1" style={{ color: theme.textMuted }}>
                #{index + 1}
            </div>

            <div className="text-sm font-mono font-bold mb-2" style={{ color: theme.text }}>
                {point.pts || '-'}
            </div>

            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                    backgroundColor: winner === 1 ? theme.playerA : theme.playerB,
                    color: theme.isDark ? '#000' : '#fff'
                }}
            >
                {winner === 1
                    ? player1.split(' ').map(n => n[0]).join('')
                    : player2.split(' ').map(n => n[0]).join('')}
            </div>

            {outcomeLabel && (
                <div
                    className="mt-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${outcomeColor}20`, color: outcomeColor }}
                >
                    {outcomeLabel}
                </div>
            )}

            {point.svr === winner && point.isSvrWinner && (
                <div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                    style={{ borderColor: theme.serve, backgroundColor: 'transparent' }}
                />
            )}

            {isBreak && (
                <div
                    className="absolute -top-1 -left-1 w-4 h-4 rotate-45 flex items-center justify-center text-[8px] font-bold"
                    style={{ backgroundColor: theme.highlight }}
                >
                    <span className="-rotate-45" style={{ color: theme.isDark ? '#000' : '#fff' }}>BP</span>
                </div>
            )}
        </button>
    )
}

function StatCard({ label, value, theme }) {
    return (
        <div
            className="rounded-lg p-3 text-center"
            style={{
                background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            }}
        >
            <div className="text-xs mb-1" style={{ color: theme.textMuted }}>{label}</div>
            <div className="text-xl font-bold" style={{ color: theme.text }}>{value}</div>
        </div>
    )
}
