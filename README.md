# citygame
A game where you create a city, then simulate it through real historical events. Created through vibe coding.

## Features
- AI-assisted city creation: Answer questions about your city's country, population, area, and rate transportation, safety, government, and utilities on a 1-10 scale.
- City generation based on your inputs.
- Historical event simulation.
- Interactive 3D globe visualization.

## How to Run
### Terminal Version
Run `python3 main.py` and follow the prompts.

### Web Version
Start a local server (recommended):

```bash
# serve on default port 8000
python3 run_server.py

# or specify a port, e.g. 3000
python3 run_server.py --port 3000

# Or use the environment variable
PORT=3000 python3 run_server.py
```

Then open `http://localhost:8000` (or the chosen port) in your browser.

## New Features
- Added simulation controls: timeskip (days/months/years), day/night speed control.
- City statistics panel shows live population, economy, density, and indices after each turn.
- Actions panel: apply policies (build power plant, increase police, invest in transport, tax cuts, anti-corruption, build park).
- Event log records events and actions.
- Globe now loads country outlines and places a clickable city icon that shows real-time stats.

## Notes
- The globe fetches a GeoJSON of country borders from GitHub; ensure you are online when loading the page.
- Simulating a large timeskip will speed up the day/night cycle for visual effect and then return to normal.
