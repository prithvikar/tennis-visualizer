import { useState, useMemo } from 'react'
import { TOURNAMENT_THEMES } from '../utils/themes'

const TOURNAMENTS = ['All', 'Australian Open', 'Roland Garros', 'Wimbledon', 'US Open']

export default function MatchSelector({ matches, selectedMatch, onSelectMatch, theme }) {
    const [search, setSearch] = useState('')
    const [tournament, setTournament] = useState('All')
    const [collapsed, setCollapsed] = useState(false)

    const filteredMatches = useMemo(() => {
        return matches.filter(m => {
            const matchesSearch = search === '' ||
                m.player1.toLowerCase().includes(search.toLowerCase()) ||
                m.player2.toLowerCase().includes(search.toLowerCase())
            const matchesTournament = tournament === 'All' || m.tournament === tournament
            return matchesSearch && matchesTournament
        })
    }, [matches, search, tournament])

    const groupedByYear = useMemo(() => {
        const groups = {}
        filteredMatches.forEach(m => {
            const year = m.date.substring(0, 4)
            if (!groups[year]) groups[year] = []
            groups[year].push(m)
        })
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
    }, [filteredMatches])

    // Get tournament theme for button colors
    const getTournamentTheme = (t) => {
        return TOURNAMENT_THEMES[t] || theme
    }

    if (collapsed) {
        return (
            <aside
                className="w-14 flex flex-col items-center py-4"
                style={{
                    background: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                    borderRight: `1px solid ${theme.border}`
                }}
            >
                <button
                    onClick={() => setCollapsed(false)}
                    className="p-3 rounded-lg transition-colors"
                    style={{
                        color: theme.text,
                        background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <div
                    className="mt-4 text-sm writing-mode-vertical"
                    style={{ color: theme.textMuted, writingMode: 'vertical-rl' }}
                >
                    {matches.length} matches
                </div>
            </aside>
        )
    }

    return (
        <aside
            className="w-80 flex flex-col max-h-screen sticky top-0"
            style={{
                background: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                borderRight: `1px solid ${theme.border}`
            }}
        >
            {/* Header */}
            <div
                className="p-4"
                style={{ borderBottom: `1px solid ${theme.border}` }}
            >
                <div className="flex items-center justify-between mb-3">
                    <h2
                        className="text-lg font-bold"
                        style={{
                            background: `linear-gradient(135deg, ${theme.playerA}, ${theme.playerB})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Grand Slam Matches
                    </h2>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                            color: theme.text,
                            background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: theme.textMuted }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none transition-colors"
                        style={{
                            background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            border: `1px solid ${theme.border}`,
                            color: theme.text
                        }}
                    />
                </div>

                {/* Tournament Filter */}
                <div className="flex flex-wrap gap-1">
                    {TOURNAMENTS.map(t => {
                        const tTheme = t === 'All' ? theme : getTournamentTheme(t)
                        const isSelected = tournament === t

                        return (
                            <button
                                key={t}
                                onClick={() => setTournament(t)}
                                className="px-2 py-1 text-xs rounded-md transition-all font-medium"
                                style={{
                                    background: isSelected ? tTheme.playerA : (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                                    color: isSelected ? (theme.isDark ? '#000' : '#fff') : theme.textSecondary
                                }}
                            >
                                {t === 'All' ? 'All' : t.split(' ')[0]}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Match List */}
            <div className="flex-1 overflow-y-auto">
                {groupedByYear.map(([year, yearMatches]) => (
                    <div key={year}>
                        <div
                            className="sticky top-0 px-4 py-2 text-xs font-bold"
                            style={{
                                background: theme.background,
                                color: theme.textMuted,
                                borderBottom: `1px solid ${theme.border}`
                            }}
                        >
                            {year} ({yearMatches.length})
                        </div>
                        {yearMatches.map(match => {
                            const matchTheme = getTournamentTheme(match.tournament)

                            return (
                                <button
                                    key={match.id}
                                    onClick={() => onSelectMatch(match)}
                                    className="w-full p-3 text-left transition-all"
                                    style={{
                                        background: selectedMatch?.id === match.id
                                            ? (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                                            : 'transparent',
                                        borderBottom: `1px solid ${theme.border}`,
                                        borderLeft: selectedMatch?.id === match.id
                                            ? `3px solid ${matchTheme.playerA}`
                                            : '3px solid transparent'
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <TournamentBadge tournament={match.tournament} />
                                        <span className="text-xs" style={{ color: theme.textMuted }}>{match.round}</span>
                                    </div>
                                    <div className="text-sm" style={{ color: theme.text }}>
                                        <span className="font-medium">{match.player1}</span>
                                        <span style={{ color: theme.textMuted }} className="mx-1">vs</span>
                                        <span className="font-medium">{match.player2}</span>
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
                                        {match.pointCount || 0} points charted
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                ))}

                {filteredMatches.length === 0 && (
                    <div className="p-8 text-center" style={{ color: theme.textMuted }}>
                        No matches found
                    </div>
                )}
            </div>
        </aside>
    )
}

function TournamentBadge({ tournament }) {
    const themes = {
        'Australian Open': { bg: '#0077C820', color: '#0077C8', abbr: 'AO' },
        'Roland Garros': { bg: '#CB5C2F20', color: '#CB5C2F', abbr: 'RG' },
        'Wimbledon': { bg: '#3B005920', color: '#3B0059', abbr: 'W' },
        'US Open': { bg: '#00B8F520', color: '#00B8F5', abbr: 'US' },
    }

    const t = themes[tournament] || { bg: '#80808020', color: '#808080', abbr: '?' }

    return (
        <span
            className="px-1.5 py-0.5 text-xs font-bold rounded"
            style={{ backgroundColor: t.bg, color: t.color }}
        >
            {t.abbr}
        </span>
    )
}
