export default function PointView({ point, player1, player2, theme }) {
    const winner = point.ptWinner === 1 ? player1 : player2
    const loser = point.ptWinner === 1 ? player2 : player1
    const server = point.svr === 1 ? player1 : player2

    let outcomeText = ''
    let outcomeColor = theme.text

    if (point.isAce) {
        outcomeText = `Ace by ${server}`
        outcomeColor = '#a855f7'
    } else if (point.isDouble) {
        outcomeText = `Double Fault by ${server}`
        outcomeColor = '#ef4444'
    } else if (point.isRallyWinner) {
        outcomeText = `Winner by ${winner}`
        outcomeColor = '#22c55e'
    } else if (point.isUnret) {
        outcomeText = `Unreturnable Serve by ${server}`
        outcomeColor = '#22c55e'
    } else if (point.isUnforced) {
        outcomeText = `Unforced Error by ${loser}`
        outcomeColor = '#ef4444'
    } else if (point.isForced) {
        outcomeText = `Forced Error by ${loser}`
        outcomeColor = '#eab308'
    } else {
        outcomeText = `Point to ${winner}`
    }

    return (
        <div
            className="rounded-xl p-6 animate-fade-in"
            style={{
                background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${theme.border}`
            }}
        >
            {/* Point Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                            Point #{point.pt}
                        </h2>
                        {point.isBreakPt && (
                            <span
                                className="px-2 py-1 text-xs font-bold rounded animate-pulse"
                                style={{ background: `${theme.highlight}30`, color: theme.highlight }}
                            >
                                BREAK POINT
                            </span>
                        )}
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>
                        Score: {point.pts} • Rally: {point.rallyCount || 1} shots
                    </div>
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
                            style={{ color: point.svr === 1 ? theme.playerA : theme.playerB }}
                        >
                            {server}
                        </span>
                    </div>
                </div>
            </div>

            {/* Outcome */}
            <div
                className="text-center p-8 rounded-xl mb-6"
                style={{ background: `${outcomeColor}15` }}
            >
                <div className="text-sm mb-2" style={{ color: theme.textMuted }}>Outcome</div>
                <div className="text-3xl font-bold" style={{ color: outcomeColor }}>
                    {outcomeText}
                </div>
            </div>

            {/* Point Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <DetailCard label="Set Score" value={`${point.set1} - ${point.set2}`} theme={theme} />
                <DetailCard label="Game Score" value={`${point.gm1} - ${point.gm2}`} theme={theme} />
                <DetailCard label="Point Score" value={point.pts || '-'} theme={theme} />
                <DetailCard
                    label="Winner"
                    value={winner}
                    color={point.ptWinner === 1 ? theme.playerA : theme.playerB}
                    theme={theme}
                />
            </div>

            {/* Outcome Flags */}
            <div className="flex flex-wrap gap-2">
                {point.isAce && <Flag label="Ace" color="#a855f7" />}
                {point.isDouble && <Flag label="Double Fault" color="#ef4444" />}
                {point.isRallyWinner && <Flag label="Winner" color="#22c55e" />}
                {point.isUnret && <Flag label="Unreturnable" color="#22c55e" />}
                {point.isForced && <Flag label="Forced Error" color="#eab308" />}
                {point.isUnforced && <Flag label="Unforced Error" color="#ef4444" />}
                {point.tb && <Flag label="Tiebreak" color={theme.highlight} />}
                {point.isSvrWinner && <Flag label="Server Won" color={theme.playerA} />}
            </div>
        </div>
    )
}

function DetailCard({ label, value, color, theme }) {
    return (
        <div
            className="rounded-lg p-4 text-center"
            style={{ background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
        >
            <div className="text-xs mb-1" style={{ color: theme.textMuted }}>{label}</div>
            <div className="text-lg font-bold" style={{ color: color || theme.text }}>
                {value}
            </div>
        </div>
    )
}

function Flag({ label, color }) {
    return (
        <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${color}20`, color }}
        >
            {label}
        </span>
    )
}
