// Tournament-specific color schemes for Grand Slam visualization
// All themes are dark-themed for consistency

export const TOURNAMENT_THEMES = {
    'Australian Open': {
        name: 'Australian Open',
        playerA: '#0077C8',
        playerB: '#FF7F50',
        highlight: '#FFD700',
        background: '#0a1628',
        surface: '#0f1f35',
        surfaceAlt: '#152a45',
        text: '#FFFFFF',
        textSecondary: '#a8c5e0',
        textMuted: '#6a8cad',
        border: '#1e3a5f',
        serve: '#FFD700',
        isDark: true,
    },
    'Roland Garros': {
        name: 'Roland Garros',
        playerA: '#CB5C2F',
        playerB: '#4CAF50',
        highlight: '#E0E0E0',
        background: '#1a0f0a',
        surface: '#261812',
        surfaceAlt: '#33201a',
        text: '#FFFFFF',
        textSecondary: '#d4b5a5',
        textMuted: '#9c7a68',
        border: '#4a2f22',
        serve: '#E0E0E0',
        isDark: true,
    },
    'Wimbledon': {
        name: 'Wimbledon',
        playerA: '#9B59B6',
        playerB: '#2ECC71',
        highlight: '#C49847',
        background: '#0a0f0a',
        surface: '#121a12',
        surfaceAlt: '#1a251a',
        text: '#FFFFFF',
        textSecondary: '#a8c5a8',
        textMuted: '#6a8c6a',
        border: '#2a3f2a',
        serve: '#C49847',
        isDark: true,
    },
    'US Open': {
        name: 'US Open',
        playerA: '#00B8F5',
        playerB: '#FF007F',
        highlight: '#DFFF00',
        background: '#121212',
        surface: '#1E1E1E',
        surfaceAlt: '#2A2A2A',
        text: '#FFFFFF',
        textSecondary: '#B0B0B0',
        textMuted: '#808080',
        border: '#333333',
        serve: '#DFFF00',
        isDark: true,
    },
}

export function getTheme(tournamentName) {
    if (!tournamentName) return TOURNAMENT_THEMES['US Open']

    const name = tournamentName.toLowerCase()

    if (name.includes('australian')) return TOURNAMENT_THEMES['Australian Open']
    if (name.includes('roland') || name.includes('french')) return TOURNAMENT_THEMES['Roland Garros']
    if (name.includes('wimbledon')) return TOURNAMENT_THEMES['Wimbledon']
    if (name.includes('us open') || name.includes('u.s.')) return TOURNAMENT_THEMES['US Open']

    return TOURNAMENT_THEMES['US Open']
}

export function withOpacity(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function getBarColor(theme, winner, outcomeType) {
    const color = winner === 1 ? theme.playerA : theme.playerB
    if (outcomeType === 'unforced') {
        return withOpacity(color, 0.45)
    }
    return color
}

// Calculate max consecutive wins
function maxConsecutive(arr, player) {
    let max = 0
    let current = 0
    for (const item of arr) {
        if (item.winner === player) {
            current++
            max = Math.max(max, current)
        } else {
            current = 0
        }
    }
    return max
}

// Calculate player stats from points
function calcPlayerStats(points, games, player) {
    const stats = {
        aces: 0,
        doubleFaults: 0,
        firstServeIn: 0,
        firstServeTotal: 0,
        firstServeWon: 0,
        secondServeWon: 0,
        secondServeTotal: 0,
        breakPointsConverted: 0,
        breakPointsFaced: 0,
        tiebreaksWon: 0,
        tiebreaksPlayed: 0,
        receivingPointsWon: 0,
        receivingPointsTotal: 0,
        pointsWon: 0,
        pointsTotal: 0,
        gamesWon: 0,
        gamesTotal: 0,
        servicePointsWon: 0,
        servicePointsTotal: 0,
        serviceGamesWon: 0,
        serviceGamesTotal: 0,
        maxPointsInRow: 0,
        maxGamesInRow: 0,
    }

    // Count points
    points.forEach(pt => {
        stats.pointsTotal++

        if (pt.ptWinner === player) {
            stats.pointsWon++
        }

        // Server stats
        if (pt.svr === player) {
            stats.servicePointsTotal++
            stats.firstServeTotal++

            if (pt.isAce) stats.aces++
            if (pt.isDouble) stats.doubleFaults++

            // Approximate first serve in (not double fault = first serve in or second serve in)
            // Since we don't have 1stIn flag, we estimate
            if (!pt.isDouble) {
                stats.firstServeIn++
            }

            if (pt.ptWinner === player) {
                stats.servicePointsWon++
                if (!pt.isDouble) {
                    stats.firstServeWon++
                }
            }

            // Second serve stats (double faults count as 2nd serve)
            if (pt.isDouble) {
                stats.secondServeTotal++
            }
        }

        // Receiver stats
        if (pt.svr !== player) {
            stats.receivingPointsTotal++
            if (pt.ptWinner === player) {
                stats.receivingPointsWon++
            }

            // Break points
            if (pt.isBreakPt) {
                stats.breakPointsFaced++
                if (pt.ptWinner === player) {
                    stats.breakPointsConverted++
                }
            }
        }
    })

    // Count games
    games.forEach(g => {
        stats.gamesTotal++

        if (g.winner === player) {
            stats.gamesWon++
        }

        if (g.server === player) {
            stats.serviceGamesTotal++
            if (g.winner === player) {
                stats.serviceGamesWon++
            }
        }

        if (g.isTiebreak) {
            stats.tiebreaksPlayed++
            if (g.winner === player) {
                stats.tiebreaksWon++
            }
        }
    })

    // Max consecutive
    const pointWinners = points.map(p => ({ winner: p.ptWinner }))
    stats.maxPointsInRow = maxConsecutive(pointWinners, player)

    const gameWinners = games.map(g => ({ winner: g.winner }))
    stats.maxGamesInRow = maxConsecutive(gameWinners, player)

    return stats
}

// Calculate comprehensive stats for match, sets, and games
export function calculateStats(points, games) {
    const stats = {
        match: {
            p1: calcPlayerStats(points, games, 1),
            p2: calcPlayerStats(points, games, 2),
        },
        sets: [],
        games: [],
    }

    // Process games with per-set momentum
    let setStartIdx = 0
    let currentSet = games[0] ? `${games[0].set.p1}-${games[0].set.p2}` : '0-0'

    games.forEach((game, idx) => {
        const gameSet = `${game.set.p1}-${game.set.p2}`

        // Detect set change
        if (gameSet !== currentSet) {
            setStartIdx = idx
            currentSet = gameSet
        }

        const gamePoints = game.points
        const p1Won = gamePoints.filter(p => p.ptWinner === 1).length
        const p2Won = gamePoints.filter(p => p.ptWinner === 2).length

        // Calculate within-set game index
        const gamesInSet = games.slice(setStartIdx, idx + 1)
        const p1GamesInSet = gamesInSet.filter(g => g.winner === 1).length
        const p2GamesInSet = gamesInSet.filter(g => g.winner === 2).length

        const cleanWins = (gamePoints.filter(p => p.isAce).length) +
            (gamePoints.filter(p => p.isRallyWinner).length)
        const ueWins = gamePoints.filter(p => p.isUnforced).length

        stats.games.push({
            index: idx,
            key: game.key,
            server: game.server,
            winner: p1Won > p2Won ? 1 : 2,
            p1Points: p1Won,
            p2Points: p2Won,
            isBreak: (game.server === 1 && p1Won < p2Won) || (game.server === 2 && p1Won > p2Won),
            isTiebreak: game.isTiebreak,
            set: game.set,
            game: game.game,
            hadBreakPoint: gamePoints.some(p => p.isBreakPt),
            aces: gamePoints.filter(p => p.isAce).length,
            doubleFaults: gamePoints.filter(p => p.isDouble).length,
            winners: gamePoints.filter(p => p.isRallyWinner).length,
            unforcedErrors: gamePoints.filter(p => p.isUnforced).length,
            // Per-set momentum (resets each set)
            setMomentum: p1GamesInSet - p2GamesInSet,
            setIndex: idx - setStartIdx,
            outcomeType: ueWins > cleanWins ? 'unforced' : 'clean',
        })
    })

    // Calculate set stats
    const setMap = new Map()
    games.forEach((game, idx) => {
        const setKey = `${game.set.p1}-${game.set.p2}`
        if (!setMap.has(setKey)) {
            setMap.set(setKey, {
                setKey,
                setScore: game.set,
                games: [],
                points: [],
                startGameIdx: idx,
            })
        }
        const setData = setMap.get(setKey)
        setData.games.push(stats.games[idx])
        setData.points.push(...game.points)
    })

    let setNum = 1
    for (const [key, setData] of setMap) {
        const setPoints = setData.points
        const setGames = setData.games

        stats.sets.push({
            setNum,
            setKey: key,
            setScore: setData.setScore,
            startGameIdx: setData.startGameIdx,
            endGameIdx: setData.startGameIdx + setGames.length - 1,
            gamesCount: setGames.length,
            p1: calcPlayerStats(setPoints, setGames, 1),
            p2: calcPlayerStats(setPoints, setGames, 2),
        })
        setNum++
    }

    return stats
}
