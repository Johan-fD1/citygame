let cityData = {};
let currentQuestion = 0;
let gameState = null;

const EVENTS = [
    { id: 'war', text: 'A war breaks out near your city.' },
    { id: 'protest', text: 'Large protests and civil unrest erupt in the streets.' },
    { id: 'boom', text: 'An economic boom increases population and investment.' },
    { id: 'crash', text: 'A sudden economic crash causes mass layoffs and unrest.' },
    { id: 'pandemic', text: "A pandemic affects the city's health systems." },
    { id: 'terror', text: 'A major terrorist incident shocks the city.' }
];

const MAJOR_CITIES = [
    { id: 'NYC', text: 'New York', lat: 40.7128, lng: -74.0060, population: 8419600, area: 783.8, happiness: 72, budget: 50000 },
    { id: 'LON', text: 'London', lat: 51.5074, lng: -0.1278, population: 8982000, area: 1572, happiness: 69, budget: 42000 },
    { id: 'PAR', text: 'Paris', lat: 48.8566, lng: 2.3522, population: 2148000, area: 105.4, happiness: 75, budget: 22000 },
    { id: 'TKY', text: 'Tokyo', lat: 35.6895, lng: 139.6917, population: 13960000, area: 2191, happiness: 70, budget: 60000 },
    { id: 'SYD', text: 'Sydney', lat: -33.8688, lng: 151.2093, population: 5312000, area: 1687, happiness: 78, budget: 15000 },
    { id: 'MUM', text: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 12442373, area: 603.4, happiness: 64, budget: 8000 },
    { id: 'BEI', text: 'Beijing', lat: 39.9042, lng: 116.4074, population: 21540000, area: 16411, happiness: 67, budget: 40000 },
    { id: 'RIO', text: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, population: 6748000, area: 1182, happiness: 66, budget: 9000 },
    { id: 'TOR', text: 'Toronto', lat: 43.6532, lng: -79.3832, population: 2731571, area: 630.2, happiness: 76, budget: 12000 },
    { id: 'BER', text: 'Berlin', lat: 52.52, lng: 13.4050, population: 3645000, area: 891.8, happiness: 74, budget: 11000 }
];

function nextQuestion(q) {
    const mapping = ['cityname', 'country', 'population', 'area', 'transportation', 'safety', 'government', 'utilities'];
    const input = document.getElementById(mapping[q]);
    if (!input || input.value.trim() === '') {
        alert('Please fill in the field.');
        return;
    }
    cityData[mapping[q]] = input.value;
    document.getElementById('question' + q).style.display = 'none';
    if (q < mapping.length - 1) {
        document.getElementById('question' + (q + 1)).style.display = 'block';
    }
}

function generateCity() {
    const input = document.getElementById('utilities');
    if (input.value.trim() === '') {
        alert('Please fill in the field.');
        return;
    }
    cityData.utilities = input.value;
    document.getElementById('question7').style.display = 'none';
    document.getElementById('questions').style.display = 'none';
    document.getElementById('cityInfo').style.display = 'block';

    const country = cityData.country;
    const population = cityData.population;
    const area = cityData.area;
    const density = parseInt(population) / parseInt(area);
    const cityName = cityData.cityname || 'Unnamed City';

    let desc = `Your city is located in ${country}.\n`;
    desc += `It has a population of ${population} people and covers an area of ${area} square kilometers.\n`;
    desc += `Population density: ${density.toFixed(2)} people per square kilometer.\n\n`;

    const features = ['transportation', 'safety', 'government', 'utilities'];
    features.forEach(feature => {
        const level = parseInt(cityData[feature]);
        let featureDesc = '';
        if (feature === 'transportation') {
            if (level <= 3) featureDesc = "has very poor transportation infrastructure, with few roads and limited public transit.";
            else if (level <= 7) featureDesc = "has moderate transportation options, including some buses and basic road networks.";
            else featureDesc = "has excellent transportation systems, with extensive metro lines, highways, and efficient public transport.";
        } else if (feature === 'safety') {
            if (level <= 3) featureDesc = "is quite unsafe, with high crime rates and little law enforcement presence.";
            else if (level <= 7) featureDesc = "has average safety levels, with some crime but generally secure neighborhoods.";
            else featureDesc = "is very safe, with low crime rates and strong community policing.";
        } else if (feature === 'government') {
            if (level <= 3) featureDesc = "has a weak government, with corruption and inefficient services.";
            else if (level <= 7) featureDesc = "has a functional government that provides basic services adequately.";
            else featureDesc = "has an excellent government, with transparent, efficient, and citizen-focused administration.";
        } else if (feature === 'utilities') {
            if (level <= 3) featureDesc = "lacks basic utilities, with frequent power outages and water shortages.";
            else if (level <= 7) featureDesc = "has adequate utilities, with reliable but not exceptional service.";
            else featureDesc = "has top-notch utilities, with constant power, clean water, and advanced infrastructure.";
        }
        desc += `The city ${featureDesc}\n`;
    });

    document.getElementById('cityDesc').innerText = desc;

    // Add city to globe if possible
    addCityToGlobe(country, cityName, desc);

    // Initialize game state starting on 2026-01-01
    const t = parseInt(cityData.transportation) || 5;
    const s = parseInt(cityData.safety) || 5;
    const g = parseInt(cityData.government) || 5;
    const u = parseInt(cityData.utilities) || 5;

    const initialHappiness = Math.round(((t + s + g + u) / 40) * 100);
    const initialBudget = Math.round(Math.max(1, (parseInt(population, 10) / 100000) * (g / 5) * 5) * 10) / 10; // millions

    gameState = {
        startDate: new Date(2026, 0, 1),
        currentDate: new Date(2026, 0, 1),
        population: parseInt(population, 10) || 0,
        area: parseFloat(area) || 0,
        features: { transportation: t, safety: s, government: g, utilities: u },
        happiness: initialHappiness,
        budget: initialBudget
    };

    // Run an automatic first turn (one year) and update stats so the player sees immediate consequences
    doFirstTurn();
}

function addCityToGlobe(country, cityName, desc) {
    // Simple mapping of countries to coordinates (for demo)
    const coords = {
        'USA': [39.8283, -98.5795],
        'UK': [55.3781, -3.4360],
        'France': [46.2276, 2.2137],
        'Germany': [51.1657, 10.4515],
        'Japan': [36.2048, 138.2529],
        'Australia': [-25.2744, 133.7751],
        'Canada': [56.1304, -106.3468],
        'Brazil': [-14.2350, -51.9253],
        'India': [20.5937, 78.9629],
        'China': [35.8617, 104.1954]
    };

    if (coords[country]) {
        const [lat, lng] = coords[country];
        // place a labeled icon/marker on the globe
        const label = { lat, lng, text: cityName, desc };
        const existing = globe.labelsData() || [];
        globe.labelsData(existing.concat([label]));
        // also center camera a bit toward marker
        globe.pointOfView({ lat, lng, altitude: 2 }, 1000);
    }
}

function formatDate(d) {
    try { return d.toLocaleDateString(); } catch (e) { return d.toISOString().slice(0,10); }
}

function updateStatsUI() {
    if (!gameState) return;
    document.getElementById('currentDate').innerText = formatDate(gameState.currentDate);
    document.getElementById('currentPopulation').innerText = gameState.population.toLocaleString();
    document.getElementById('currentArea').innerText = Number(gameState.area).toFixed(2);
    const hEl = document.getElementById('currentHappiness');
    if (hEl) hEl.innerText = gameState.happiness;
    const bEl = document.getElementById('currentBudget');
    if (bEl) bEl.innerText = Number(gameState.budget).toFixed(1);
}

function doFirstTurn() {
    if (!gameState) return;
    // ensure cityInfo visible
    document.getElementById('cityInfo').style.display = 'block';

    // simulate one year with no player actions
    const result = simulateStep([]);
    // advance one year
    gameState.currentDate.setFullYear(gameState.currentDate.getFullYear() + 1);

    // show updated stats
    updateStatsUI();

    // show simulation controls and event log so player can choose actions next
    document.getElementById('simulationControls').style.display = 'block';
    document.getElementById('events').style.display = 'block';

    const log = document.getElementById('eventDesc');
    if (log) {
        log.textContent = `${formatDate(gameState.currentDate)} — ${result.event.text}\n` +
                          `Population changed by ${(result.popChangePct*100).toFixed(1)}% → ${gameState.population.toLocaleString()}\n` +
                          `Area changed by ${(result.areaChangePct*100).toFixed(1)}% → ${Number(gameState.area).toFixed(2)} sq km\n` +
                          `Happiness change: ${result.happinessDelta >= 0 ? '+' : ''}${result.happinessDelta.toFixed(1)} → ${gameState.happiness}\n` +
                          `Budget change: ${result.budgetDelta >= 0 ? '+' : ''}${result.budgetDelta.toFixed(1)}M → ${gameState.budget.toFixed(1)}M\n\n`;
    }
}

function showSimulationControls() {
    document.getElementById('simulationControls').style.display = 'block';
    document.getElementById('events').style.display = 'block';
    updateStatsUI();
}

function showMajorCity(d) {
    const panel = document.getElementById('majorCityInfo');
    if (!panel) return;
    panel.style.display = 'block';
    document.getElementById('mcName').innerText = d.text || d.id || 'City';
    document.getElementById('mcPopulation').innerText = d.population ? d.population.toLocaleString() : 'N/A';
    document.getElementById('mcArea').innerText = d.area ? Number(d.area).toFixed(1) : 'N/A';
    document.getElementById('mcHappiness').innerText = (typeof d.happiness !== 'undefined') ? d.happiness : 'N/A';
    document.getElementById('mcBudget').innerText = d.budget ? Number(d.budget).toFixed(1) : 'N/A';
}

function runSimulation() {
    if (!gameState) return alert('Start a city first.');
    const actions = [];
    ['act_infra','act_police','act_taxes','act_hospitals','act_conserve','act_nothing'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.checked) actions.push(el.value);
    });
    // if do_nothing selected, ignore other actions
    if (actions.includes('do_nothing')) {
        actions.length = 0;
    }
    let years = parseInt(document.getElementById('simYears').value, 10);
    if (isNaN(years) || years < 1) years = 1;

    const log = document.getElementById('eventDesc');
    for (let y = 0; y < years; y++) {
        const result = simulateStep(actions);
        // advance a year
        gameState.currentDate.setFullYear(gameState.currentDate.getFullYear() + 1);
        // append to log
        if (log) {
            log.textContent += `${formatDate(gameState.currentDate)} — ${result.event.text}\n` +
                               `Population change: ${(result.popChangePct*100).toFixed(1)}% → ${gameState.population.toLocaleString()}\n` +
                               `Area change: ${(result.areaChangePct*100).toFixed(1)}% → ${Number(gameState.area).toFixed(2)} sq km\n` +
                               `Happiness change: ${result.happinessDelta >= 0 ? '+' : ''}${result.happinessDelta.toFixed(1)} → ${gameState.happiness}\n` +
                               `Budget change: ${result.budgetDelta >= 0 ? '+' : ''}${result.budgetDelta.toFixed(1)}M → ${gameState.budget.toFixed(1)}M\n\n`;
        }
        updateStatsUI();
    }
}

function simulateStep(actions) {
    // actions: array of action ids (strings)
    const t = gameState.features.transportation;
    const s = gameState.features.safety;
    const g = gameState.features.government;
    const u = gameState.features.utilities;

    // base weights similar to earlier logic
    const weights = EVENTS.map(e => {
        let w = 1;
        if (e.id === 'war') {
            w = (10 - g) * (10 - s) + 1;
        } else if (e.id === 'protest') {
            w = (10 - g) * 2 + (10 - u) + 1;
        } else if (e.id === 'boom') {
            w = (t + u + g) / 3 + 1;
        } else if (e.id === 'crash') {
            w = (10 - g) + (10 - u) + 1;
        } else if (e.id === 'pandemic') {
            w = (10 - u) + (10 - s) / 2 + 1;
        } else if (e.id === 'terror') {
            w = (10 - s) + (10 - g) / 2 + 1;
        }
        return Math.max(w, 0.1);
    });

    // modify weights based on actions
    actions.forEach(a => {
        if (a === 'invest_infrastructure') {
            // favor boom, reduce crash
            const i = EVENTS.findIndex(e => e.id === 'boom'); if (i>=0) weights[i] *= 1.6;
            const j = EVENTS.findIndex(e => e.id === 'crash'); if (j>=0) weights[j] *= 0.7;
        }
        if (a === 'increase_policing') {
            const i = EVENTS.findIndex(e => e.id === 'protest'); if (i>=0) weights[i] *= 0.6;
            const j = EVENTS.findIndex(e => e.id === 'terror'); if (j>=0) weights[j] *= 0.7;
        }
        if (a === 'cut_taxes') {
            const i = EVENTS.findIndex(e => e.id === 'boom'); if (i>=0) weights[i] *= 1.4;
            const j = EVENTS.findIndex(e => e.id === 'crash'); if (j>=0) weights[j] *= 1.3;
        }
        if (a === 'build_hospitals') {
            const i = EVENTS.findIndex(e => e.id === 'pandemic'); if (i>=0) weights[i] *= 0.5;
        }
        if (a === 'conserve_budget') {
            const i = EVENTS.findIndex(e => e.id === 'boom'); if (i>=0) weights[i] *= 0.7;
            const j = EVENTS.findIndex(e => e.id === 'crash'); if (j>=0) weights[j] *= 1.2;
        }
    });

    const ev = weightedRandom(EVENTS, weights);

    // compute effects
    let popChangePct = 0;
    let areaChangePct = 0;

    if (ev.id === 'war') {
        popChangePct = - (0.10 + Math.random() * 0.20) * (1 + (10 - g)/20);
        areaChangePct = - (Math.random() * 0.03);
    } else if (ev.id === 'protest') {
        popChangePct = - (0.01 + Math.random() * 0.04) * (1 + (10 - g)/30);
        areaChangePct = - (Math.random() * 0.01);
    } else if (ev.id === 'boom') {
        popChangePct = (0.02 + Math.random() * 0.08) * (1 + g/25 + u/30);
        areaChangePct = (0.005 + Math.random() * 0.03);
    } else if (ev.id === 'crash') {
        popChangePct = - (0.02 + Math.random() * 0.06) * (1 + (10 - g)/10);
        areaChangePct = - (Math.random() * 0.02);
    } else if (ev.id === 'pandemic') {
        popChangePct = - (0.03 + Math.random() * 0.17) * (1 + (10 - u)/10);
        areaChangePct = - (Math.random() * 0.02);
    } else if (ev.id === 'terror') {
        popChangePct = - (0.005 + Math.random() * 0.02) * (1 + (10 - s)/20);
        areaChangePct = - (Math.random() * 0.005);
    }

    // action-specific modifiers to effects
    actions.forEach(a => {
        if (a === 'invest_infrastructure' && ev.id === 'boom') popChangePct *= 1.15;
        if (a === 'increase_policing' && ev.id === 'protest') popChangePct *= 0.6;
        if (a === 'build_hospitals' && ev.id === 'pandemic') popChangePct *= 0.5;
        if (a === 'cut_taxes' && ev.id === 'boom') popChangePct *= 1.08;
        if (a === 'conserve_budget' && ev.id === 'boom') popChangePct *= 0.85;
    });

    const oldPop = gameState.population;
    const oldArea = gameState.area;
    const oldHappiness = ('happiness' in gameState) ? gameState.happiness : Math.round(((t + s + g + u) / 40) * 100);
    const oldBudget = ('budget' in gameState) ? gameState.budget : Math.round(Math.max(1, (gameState.population / 100000) * (g / 5) * 5) * 10) / 10;

    // base happiness and budget changes per event (absolute points and millions)
    let happinessDelta = 0;
    let budgetDelta = 0;

    if (ev.id === 'war') {
        happinessDelta = - (10 + Math.random() * 25) * (1 + (10 - g) / 20);
        budgetDelta = - (5 + Math.random() * 15) * (1 + (10 - g) / 30);
    } else if (ev.id === 'protest') {
        happinessDelta = - (2 + Math.random() * 6) * (1 + (10 - g) / 30);
        budgetDelta = - (0.5 + Math.random() * 2);
    } else if (ev.id === 'boom') {
        happinessDelta = (3 + Math.random() * 10) * (1 + g / 25);
        budgetDelta = (5 + Math.random() * 20) * (1 + (t + u) / 30);
    } else if (ev.id === 'crash') {
        happinessDelta = - (3 + Math.random() * 8) * (1 + (10 - g) / 20);
        budgetDelta = - (2 + Math.random() * 10);
    } else if (ev.id === 'pandemic') {
        happinessDelta = - (5 + Math.random() * 20) * (1 + (10 - u) / 15);
        budgetDelta = - (2 + Math.random() * 10) * (1 + (10 - u) / 30);
    } else if (ev.id === 'terror') {
        happinessDelta = - (1 + Math.random() * 4) * (1 + (10 - s) / 30);
        budgetDelta = - (0.5 + Math.random() * 2);
    }

    // apply action modifiers to happiness/budget
    actions.forEach(a => {
        if (a === 'invest_infrastructure') {
            budgetDelta -= (1 + Math.random() * 3);
            happinessDelta += (1 + Math.random() * 3);
        }
        if (a === 'increase_policing') {
            budgetDelta -= (0.5 + Math.random() * 1.5);
            happinessDelta += (0.5 + Math.random() * 2);
        }
        if (a === 'cut_taxes') {
            budgetDelta -= (2 + Math.random() * 6);
            happinessDelta += (1 + Math.random() * 4);
        }
        if (a === 'build_hospitals') {
            budgetDelta -= (2 + Math.random() * 6);
            happinessDelta += (2 + Math.random() * 6);
        }
        if (a === 'conserve_budget') {
            budgetDelta += (1 + Math.random() * 4);
            happinessDelta -= (0.5 + Math.random() * 2);
        }
    });

    // apply updates
    gameState.population = Math.max(1, Math.round(gameState.population * (1 + popChangePct)));
    gameState.area = Math.max(0.01, gameState.area * (1 + areaChangePct));
    gameState.happiness = Math.max(0, Math.min(100, Math.round(oldHappiness + happinessDelta)));
    gameState.budget = Math.max(0.1, Math.round((oldBudget + budgetDelta) * 10) / 10);

    return { event: ev, popChangePct, areaChangePct, oldPop, oldArea, happinessDelta, budgetDelta, oldHappiness, oldBudget };
}

function weightedRandom(items, weights) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) return items[i];
    }
    return items[items.length - 1];
}

// Initialize globe with labels support
const globe = Globe()
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .labelsData([])
    .labelLat(d => d.lat)
    .labelLng(d => d.lng)
    .labelText(d => d.text)
    .labelSize(d => 1)
    .labelDotRadius(d => 0.4)
    .labelColor(() => 'red')
    .pointsData(MAJOR_CITIES)
    .pointLat(d => d.lat)
    .pointLng(d => d.lng)
    .pointLabel(d => d.text)
    .pointAltitude(0.01)
    .pointRadius(d => Math.max(0.25, Math.log10((d.population || 1)) / 6))
    .pointColor(() => 'orange')
    .width(window.innerWidth - 300)
    .height(window.innerHeight)(document.getElementById('globe-container'));

// make labels clickable to show description
globe.onLabelClick(d => {
    alert(`${d.text}\n\n${d.desc}`);
});

// make major-city points clickable to show their stats
try {
    globe.onPointClick(d => {
        try { showMajorCity(d); } catch (e) { console.warn('showMajorCity failed', e); }
    });
} catch (e) {
    // some versions may not support onPointClick; fall back to label click behavior
}

// day-night cycle via a moving directional light
const scene = globe.scene();
const THREE = window.THREE;
const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(100, 0, 0);
scene.add(dirLight);
const ambient = new THREE.AmbientLight(0x666666);
scene.add(ambient);

let dayTime = 0; // 0..2PI
function animateDayNight() {
    dayTime += 0.0025; // speed of cycle
    const x = Math.cos(dayTime) * 100;
    const y = Math.sin(dayTime) * 100;
    dirLight.position.set(x, y, 50);
    // also slightly change intensity to simulate day/night
    dirLight.intensity = 0.5 + 0.5 * Math.max(0, Math.sin(dayTime));
    requestAnimationFrame(animateDayNight);
}
animateDayNight();

// Adjust size on resize
window.addEventListener('resize', () => {
    globe.width(window.innerWidth - 300).height(window.innerHeight);
});

// "Do Not Press" button behavior: open a standalone prank page first, fallback to in-page overlay
(function setupDoNotPress() {
    const btn = document.getElementById('do-not-press');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        // try to open the dedicated prank page
        try {
            const w = window.open('prank.html', '_blank');
            if (w) { try { w.focus(); } catch (e) {} return; }
        } catch (e) {}

        // fallback to overlay behaviour when popup blocked
        const overlay = document.getElementById('prank-screen');
        const audio = document.getElementById('prank-audio');
        if (!overlay || !audio) return;

        overlay.style.display = 'flex';
        overlay.classList.add('active');
        try { if (overlay.requestFullscreen) overlay.requestFullscreen(); } catch (e) {}

        audio.loop = true;
        audio.muted = false;
        audio.volume = 1.0;

        let audioCtx = null;
        let sourceNode = null;
        let gainNode = null;

        // try to amplify using Web Audio API
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            sourceNode = audioCtx.createMediaElementSource(audio);
            gainNode = audioCtx.createGain();
            gainNode.gain.value = 6.0; // louder
            sourceNode.connect(gainNode).connect(audioCtx.destination);
        } catch (e) {
            console.warn('WebAudio amplification unavailable', e);
        }

        await audio.play().catch(() => {});

        // oscillator fallback if media couldn't play
        try {
            const failedToPlay = !!audio.error || audio.paused;
            if (failedToPlay || !audio.currentSrc) {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                try {
                    if (!gainNode) {
                        gainNode = audioCtx.createGain();
                        gainNode.gain.value = 6.0;
                        gainNode.connect(audioCtx.destination);
                    }
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sawtooth';
                    osc.frequency.value = 240;
                    osc.connect(gainNode);
                    osc.start();
                    overlay._prankOsc = osc;
                } catch (e) {
                    console.warn('oscillator fallback failed', e);
                }
            }
        } catch (e) {
            console.warn('fallback check failed', e);
        }

        try { window.focus(); } catch (e) {}

        // stop on click (one-time handler)
        overlay.addEventListener('click', async () => {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (e) {}
            try { audio.pause(); audio.currentTime = 0; } catch (e) {}
            try { if (overlay._prankOsc) { overlay._prankOsc.stop(); overlay._prankOsc.disconnect(); overlay._prankOsc = null; } } catch (e) {}
            try { if (gainNode) gainNode.gain.value = 0; } catch (e) {}
            try { if (audioCtx && typeof audioCtx.close === 'function') await audioCtx.close(); } catch (e) {}
        }, { once: true });
    });
})();