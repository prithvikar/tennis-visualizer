import { useState, useEffect, useMemo } from 'react'
import './index.css'
import MatchSelector from './components/MatchSelector'
import GamesMomentumChart from './components/GamesMomentumChart'
import SetView from './components/SetView'
import GameDetail from './components/GameDetail'
import PointView from './components/PointView'
import StatsPanel from './components/StatsPanel'
import { getTheme, calculateStats } from './utils/themes'

function App() {
  const [matches, setMatches] = useState([])
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [points, setPoints] = useState([])
  const [selectedSetIndex, setSelectedSetIndex] = useState(null)
  const [selectedGameIndex, setSelectedGameIndex] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [loading, setLoading] = useState(true)
  // View hierarchy: 'momentum' -> 'set' -> 'game' -> 'point'
  const [view, setView] = useState('momentum')

  const theme = useMemo(() => {
    return getTheme(selectedMatch?.tournament)
  }, [selectedMatch])

  useEffect(() => {
    fetch('/data/matches.json')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => b.date.localeCompare(a.date))
        setMatches(sorted)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load matches:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedMatch) {
      setPoints([])
      return
    }

    setLoading(true)
    fetch(`/data/points/${selectedMatch.id}.json`)
      .then(res => res.json())
      .then(data => {
        setPoints(data)
        setLoading(false)
        setSelectedSetIndex(null)
        setSelectedGameIndex(null)
        setSelectedPoint(null)
        setView('momentum')
      })
      .catch(err => {
        console.error('Failed to load points:', err)
        setLoading(false)
      })
  }, [selectedMatch])

  const games = useMemo(() => {
    if (!points.length) return []

    const gameMap = new Map()
    points.forEach(pt => {
      const key = `${pt.set1}-${pt.set2}-${pt.gm1}-${pt.gm2}`
      if (!gameMap.has(key)) {
        gameMap.set(key, {
          key,
          set: { p1: pt.set1, p2: pt.set2 },
          game: { p1: pt.gm1, p2: pt.gm2 },
          server: pt.svr,
          points: [],
          isTiebreak: pt.tb,
        })
      }
      gameMap.get(key).points.push(pt)
    })

    return Array.from(gameMap.values())
  }, [points])

  const stats = useMemo(() => {
    return calculateStats(points, games)
  }, [points, games])

  const selectedSet = selectedSetIndex !== null ? stats.sets[selectedSetIndex] : null
  const selectedGame = selectedGameIndex !== null ? games[selectedGameIndex] : null

  // Navigation handlers
  const handleSetSelect = (setIdx) => {
    setSelectedSetIndex(setIdx)
    setView('set')
  }

  const handleGameSelect = (gameIndex) => {
    setSelectedGameIndex(gameIndex)
    setView('game')
  }

  const handlePointSelect = (point) => {
    setSelectedPoint(point)
    setView('point')
  }

  const handlePrevSet = () => {
    if (selectedSetIndex > 0) {
      setSelectedSetIndex(selectedSetIndex - 1)
    }
  }

  const handleNextSet = () => {
    if (selectedSetIndex < stats.sets.length - 1) {
      setSelectedSetIndex(selectedSetIndex + 1)
    }
  }

  const handlePrevGame = () => {
    if (selectedGameIndex > 0) {
      setSelectedGameIndex(selectedGameIndex - 1)
    }
  }

  const handleNextGame = () => {
    if (selectedGameIndex < games.length - 1) {
      setSelectedGameIndex(selectedGameIndex + 1)
    }
  }

  const handleBack = () => {
    if (view === 'point') {
      setView('game')
      setSelectedPoint(null)
    } else if (view === 'game') {
      // Go back to set view if we came from there
      if (selectedSetIndex !== null) {
        setView('set')
      } else {
        setView('momentum')
      }
      setSelectedGameIndex(null)
    } else if (view === 'set') {
      setView('momentum')
      setSelectedSetIndex(null)
    }
  }

  useEffect(() => {
    if (theme) {
      document.body.style.background = theme.background
      document.body.style.color = theme.text
    }
  }, [theme])

  return (
    <div className="min-h-screen flex" style={{
      background: theme?.background,
      color: theme?.text
    }}>
      <MatchSelector
        matches={matches}
        selectedMatch={selectedMatch}
        onSelectMatch={setSelectedMatch}
        theme={theme}
      />

      <main className="flex-1 p-6 overflow-hidden">
        {!selectedMatch ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full border-4 mx-auto mb-4"
                style={{ borderColor: theme.serve }}
              />
              <h1 className="text-3xl font-bold mb-2" style={{
                background: `linear-gradient(135deg, ${theme.playerA}, ${theme.playerB})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Tennis Match Visualizer
              </h1>
              <p style={{ color: theme.textSecondary }}>
                Select a match from the sidebar to begin
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: theme.playerA, borderTopColor: 'transparent' }}
              />
              <span style={{ color: theme.textSecondary }}>Loading match data...</span>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Match Header */}
            <header
              className="rounded-xl p-4 mb-4"
              style={{
                background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${theme.border}`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {view !== 'momentum' && (
                      <button
                        onClick={handleBack}
                        className="p-2 rounded-lg transition-colors"
                        style={{ background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    <h1 className="text-xl font-bold">
                      <span style={{ color: theme.playerA }}>{selectedMatch.player1}</span>
                      <span style={{ color: theme.textMuted }} className="mx-2">vs</span>
                      <span style={{ color: theme.playerB }}>{selectedMatch.player2}</span>
                    </h1>
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    {selectedMatch.tournament} • {selectedMatch.round} • {selectedMatch.date}
                  </div>
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => { setView('momentum'); setSelectedSetIndex(null); setSelectedGameIndex(null); }}
                    className="px-2 py-1 rounded"
                    style={{
                      background: view === 'momentum' ? theme.playerA : 'transparent',
                      color: view === 'momentum' ? '#000' : theme.textMuted
                    }}
                  >
                    Match
                  </button>
                  {view !== 'momentum' && (
                    <>
                      <span style={{ color: theme.textMuted }}>›</span>
                      <button
                        onClick={() => { setView('set'); setSelectedGameIndex(null); }}
                        className="px-2 py-1 rounded"
                        style={{
                          background: view === 'set' ? theme.playerA : 'transparent',
                          color: view === 'set' ? '#000' : theme.textMuted
                        }}
                      >
                        Set {(selectedSetIndex ?? 0) + 1}
                      </button>
                    </>
                  )}
                  {(view === 'game' || view === 'point') && (
                    <>
                      <span style={{ color: theme.textMuted }}>›</span>
                      <button
                        onClick={() => { setView('game'); setSelectedPoint(null); }}
                        className="px-2 py-1 rounded"
                        style={{
                          background: view === 'game' ? theme.playerA : 'transparent',
                          color: view === 'game' ? '#000' : theme.textMuted
                        }}
                      >
                        Game {(selectedGameIndex ?? 0) + 1}
                      </button>
                    </>
                  )}
                  {view === 'point' && (
                    <>
                      <span style={{ color: theme.textMuted }}>›</span>
                      <span className="px-2 py-1 rounded" style={{ background: theme.playerA, color: '#000' }}>
                        Point
                      </span>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* View Content */}
            <div className="flex-1 overflow-auto">
              {view === 'momentum' && (
                <div className="space-y-4">
                  <GamesMomentumChart
                    games={games}
                    stats={stats}
                    player1={selectedMatch.player1}
                    player2={selectedMatch.player2}
                    theme={theme}
                    onGameClick={(gameIdx) => {
                      // Find which set this game belongs to
                      const setIdx = stats.sets.findIndex(s =>
                        gameIdx >= s.startGameIdx && gameIdx <= s.endGameIdx
                      )
                      setSelectedSetIndex(setIdx >= 0 ? setIdx : 0)
                      handleGameSelect(gameIdx)
                    }}
                    onSetClick={handleSetSelect}
                  />

                  {/* Stats Panel below the chart */}
                  <StatsPanel
                    stats={stats}
                    player1={selectedMatch.player1}
                    player2={selectedMatch.player2}
                    theme={theme}
                  />
                </div>
              )}

              {view === 'set' && selectedSet && (
                <SetView
                  setData={selectedSet}
                  setIndex={selectedSetIndex}
                  totalSets={stats.sets.length}
                  stats={stats}
                  player1={selectedMatch.player1}
                  player2={selectedMatch.player2}
                  theme={theme}
                  onGameClick={handleGameSelect}
                  onPrevSet={handlePrevSet}
                  onNextSet={handleNextSet}
                />
              )}

              {view === 'game' && selectedGame && (
                <GameDetail
                  game={selectedGame}
                  gameIndex={selectedGameIndex}
                  totalGames={games.length}
                  stats={stats}
                  player1={selectedMatch.player1}
                  player2={selectedMatch.player2}
                  theme={theme}
                  onPointClick={handlePointSelect}
                  onPrevGame={handlePrevGame}
                  onNextGame={handleNextGame}
                />
              )}

              {view === 'point' && selectedPoint && (
                <PointView
                  point={selectedPoint}
                  player1={selectedMatch.player1}
                  player2={selectedMatch.player2}
                  theme={theme}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
