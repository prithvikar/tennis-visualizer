# Tennis Match Visualizer

A beautiful, interactive web application to visualize professional tennis matches point-by-point. Built with React and Vite.

## Features

- **Match Selection**: Choose from a comprehensive database of Grand Slam matches (US Open, Wimbledon, Roland Garros).
- **Match Summary**: High-level overview of the match result, including set scores and overall match statistics.
- **Momentum Chart**: A dynamic visualization of the match flow, tracking the game score difference set-by-set.
- **Set View**: Drill down into specific sets to see game-by-game progression and momentum shifts within the set.
- **Game & Point View**: Dive deep into individual games to analyze point-by-point outcomes.
- **Comprehensive Statistics**: In-depth stats panel showing:
  - Aces & Double Faults
  - First Serve Percentage
  - Win Percentages on 1st & 2nd Serves
  - Break Points (Won/Faced)
  - Tiebreaks Won
  - Receiving Points Won
  - Total Points & Games Won
  - Max Points & Games Won in a Row
  - Service & Return Games Played/Won

## Data Citation

The point-by-point match data used in this visualization is generously provided by **Jeff Sackmann** and his continuous work on the [Match Charting Project](https://github.com/JeffSackmann/tennis_MatchChartingProject) and [Tennis Abstract](http://www.tennisabstract.com/). All credit for the underlying event data goes to him and the project contributors.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prithvikar/tennis-visualizer.git
   ```

2. Navigate to the project directory:
   ```bash
   cd tennis-visualizer
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Technologies

- React
- Vite
- Modern CSS (Custom variables, flexbox/grid architecture)

## License

The code is available for open inspection. The tennis match data is subject to the licensing terms set by the original data provider (Jeff Sackmann).
