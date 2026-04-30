let cityData = {};
let currentQuestion = 0;
let gameState = null;
const EARTH_POPULATION = 8000000000; // approximate starting world population
// Visual day/night step applied per simulated year (radians)
const DAY_TIME_STEP_PER_YEAR = Math.PI * 0.5;

const EVENTS = [
    { id: 'war', text: 'A war breaks out near your city.' },
    { id: 'protest', text: 'Large protests and civil unrest erupt in the streets.' },
    { id: 'boom', text: 'An economic boom increases population and investment.' },
    { id: 'crash', text: 'A sudden economic crash causes mass layoffs and unrest.' },
    { id: 'pandemic', text: "A pandemic affects the city's health systems." },
    { id: 'terror', text: 'A major terrorist incident shocks the city.' },
    { id: 'shibuya', text: 'Shibuya Incident: catastrophe kills 100,000 people in your city.' },
    { id: 'third_impact', text: 'Third Impact: the entire city is annihilated.' },
    { id: 'viltrumite_war', text: 'Viltrumite War: your city becomes a Viltrumite stronghold and takes over the world.' },
    { id: 'judgment_day', text: 'Judgment Day begins: the Terminators have arrived.' },
    { id: 'world_war_z', text: 'World War Z begins: the undead sweep toward your city.' }
    , { id: 'eclipse', text: 'The Eclipse: darkness falls; demons prowl and most of Earth perishes.' }
];

// Map event -> hero who intervenes (provides bonuses in special scenarios or a heroic message)
const HEROES = {
    eclipse: 'Doomguy',
    judgment_day: 'Optimus Prime',
    world_war_z: 'Leon Kennedy',
    third_impact: 'Jack Cooper',
    shibuya: 'Samurai Jack'
};

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

// Will hold fetched country GeoJSON features
let COUNTRY_FEATURES = [];

function nextQuestion(q) {
    const mapping = ['cityname', 'country', 'population', 'area', 'transportation', 'safety', 'government', 'utilities', 'military'];
    const input = document.getElementById(mapping[q]);
    if (!input || input.value.trim() === '') {
        alert('Please fill in the field.');
        return;
    }
    
    // Validate number inputs for stats (questions 4-7)
    if (q >= 4 && q <= 7) {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 1 || value > 10) {
            alert('Please enter a number between 1 and 10.');
            return;
        }
    }
    
    cityData[mapping[q]] = input.value;
    document.getElementById('question' + q).style.display = 'none';
    if (q < mapping.length - 1) {
        document.getElementById('question' + (q + 1)).style.display = 'block';
    }
}

function generateCity() {
    const input = document.getElementById('military');
    if (input.value.trim() === '') {
        alert('Please fill in the field.');
        return;
    }
    
    // Validate military is between 1 and 10
    const value = parseInt(input.value);
    if (isNaN(value) || value < 1 || value > 10) {
        alert('Please enter a number between 1 and 10.');
        return;
    }
    
    cityData.military = input.value;
    const countryOriginal = (cityData.country || '').trim();
    const countryNormalized = countryOriginal.toLowerCase();
    if (countryNormalized === 'england') {
        window.location.href = 'england.html';
        return;
    }
    if (countryNormalized === 'mongolia') {
        window.location.href = 'mongolia.html';
        return;
    }
    if (countryNormalized === 'india' || countryNormalized.includes('india')) {
        window.location.href = 'india.html';
        return;
    }
    if (countryNormalized === 'israel' || countryNormalized.includes('israel')) {
        window.location.href = 'israel.html';
        return;
    }
    if (countryNormalized === 'agartha' || countryNormalized.includes('agartha')) {
        window.location.href = 'agartha.html';
        return;
    }

    document.getElementById('question7').style.display = 'none';
    document.getElementById('questions').style.display = 'none';
    document.getElementById('cityInfo').style.display = 'block';

    const population = cityData.population;
    const area = cityData.area;
    const density = parseInt(population) / parseInt(area);
    const cityName = cityData.cityname || 'Unnamed City';

    let desc = `Your city is located in ${countryOriginal}.\n`;
    desc += `It has a population of ${population} people and covers an area of ${area} square kilometers.\n`;
    desc += `Population density: ${density.toFixed(2)} people per square kilometer.\n\n`;

    const features = ['transportation', 'safety', 'government', 'utilities', 'military'];
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
        } else if (feature === 'military') {
            if (level <= 3) featureDesc = "has a weak military, with little defense capability.";
            else if (level <= 7) featureDesc = "has a moderate military presence.";
            else featureDesc = "has a strong military, well-equipped and trained.";
        }
        desc += `The city ${featureDesc}\n`;
    });

    document.getElementById('cityDesc').innerText = desc;

    // Add city to globe if possible
    // try to place label at country centroid first, fall back to simple coords mapping
    const placed = addCityByCountryFeature(country, cityName, desc);
    if (!placed) addCityToGlobe(country, cityName, desc);

    // Initialize game state starting on 2026-01-01
    const t = parseInt(cityData.transportation) || 5;
    const s = parseInt(cityData.safety) || 5;
    const g = parseInt(cityData.government) || 5;
    const u = parseInt(cityData.utilities) || 5;
    const m = parseInt(cityData.military) || 5;

    const initialHappiness = Math.round(((t + s + g + u + m) / 50) * 100);
    const initialBudget = Math.round(Math.max(1, (parseInt(population, 10) / 100000) * (g / 5) * 5) * 10) / 10; // millions

    gameState = {
        startDate: new Date(2026, 0, 1),
        currentDate: new Date(2026, 0, 1),
        population: parseInt(population, 10) || 0,
        area: parseFloat(area) || 0,
        features: { transportation: t, safety: s, government: g, utilities: u, military: m },
        happiness: initialHappiness,
        budget: initialBudget,
        mode: 'normal',
        gameOver: false,
        victory: false,
        special: null
    };
    // initialize global population tracker
    gameState.globalPopulation = EARTH_POPULATION;
    // initialize day/night phase (radians 0..2PI)
    gameState.dayTime = 0;

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

// helper to add label by centroid of country feature if available
function addCityByCountryFeature(countryName, cityName, desc) {
    if (!COUNTRY_FEATURES || COUNTRY_FEATURES.length === 0) return false;
    const match = COUNTRY_FEATURES.find(f => {
        const n = (f.properties && (f.properties.name || f.properties.ADMIN || f.properties.admin)) || '';
        return n && n.toLowerCase() === (countryName || '').toLowerCase();
    });
    if (!match) return false;
    // compute simple centroid (average of coordinates)
    const coords = [];
    function collect(coordArray) {
        if (!coordArray) return;
        if (typeof coordArray[0] === 'number') {
            // [lng, lat]
            coords.push(coordArray);
            return;
        }
        coordArray.forEach(c => collect(c));
    }
    collect(match.geometry.coordinates);
    if (coords.length === 0) return false;
    let sumLat = 0, sumLng = 0;
    coords.forEach(c => { sumLng += c[0]; sumLat += c[1]; });
    const lng = sumLng / coords.length;
    const lat = sumLat / coords.length;
    const label = { lat, lng, text: cityName, desc };
    const existing = globe.labelsData() || [];
    globe.labelsData(existing.concat([label]));
    globe.pointOfView({ lat, lng, altitude: 2 }, 1000);
    return true;
}

function formatDate(d) {
    try { return d.toLocaleDateString(); } catch (e) { return d.toISOString().slice(0,10); }
}

function setGameOver(message, victory = false) {
    const controls = document.getElementById('simulationControls');
    const prompt = document.getElementById('specialPrompt');
    const banner = document.getElementById('gameMessage');
    if (controls) controls.style.display = 'none';
    if (prompt) prompt.style.display = 'none';
    if (banner) {
        banner.style.display = 'block';
        banner.innerText = message;
        banner.className = victory ? 'victory' : 'defeat';
    }
    if (gameState) {
        gameState.mode = 'ended';
        gameState.gameOver = true;
        gameState.victory = victory;
    }
}

function setSpecialPrompt(title, question, options) {
    const panel = document.getElementById('specialPrompt');
    const titleEl = document.getElementById('specialTitle');
    const questionEl = document.getElementById('specialQuestion');
    const optionsEl = document.getElementById('specialOptions');
    if (!panel || !titleEl || !questionEl || !optionsEl) return;
    panel.style.display = 'block';
    titleEl.innerText = title;
    questionEl.innerText = question;
    optionsEl.innerHTML = options.map(opt => {
        return `<label style="display:block;margin-bottom:8px;"><input type="radio" name="specialChoice" value="${opt.value}"> ${opt.label}</label>`;
    }).join('');
    const button = document.getElementById('specialActionButton');
    if (button) button.style.display = 'block';
}

function clearSpecialPrompt() {
    const panel = document.getElementById('specialPrompt');
    const optionsEl = document.getElementById('specialOptions');
    if (panel) panel.style.display = 'none';
    if (optionsEl) optionsEl.innerHTML = '';
}

function getSelectedSpecialChoice() {
    const inputs = document.querySelectorAll('input[name="specialChoice"]');
    for (const input of inputs) {
        if (input.checked) return input.value;
    }
    return null;
}

function submitSpecialAction() {
    const choice = getSelectedSpecialChoice();
    if (!choice) {
        alert('Please choose an option to continue.');
        return;
    }
    resolveSpecialScenario(choice);
}

function enterSpecialMode(type, sourceEvent) {
    if (!gameState) return;
    gameState.mode = type;
    gameState.special = gameState.special || {};
    if (sourceEvent) gameState.special.sourceEvent = sourceEvent;
    if (type === 'terminator') {
        gameState.special.type = 'terminator';
        gameState.special.remainingThreat = 5;
        gameState.special.round = 0;
        const hero = gameState.special.sourceEvent ? HEROES[gameState.special.sourceEvent] : null;
        setSpecialPrompt(
            'Judgment Day',
            `Half of your population survived the initial Terminator attack. ${hero ? hero + ' has arrived to assist. ' : ''}Choose how to strike back before the Terminators wipe out the survivors.`,
            [
                { value: 'emp', label: 'Deploy EMP strike' },
                { value: 'fortify', label: 'Fortify survivors in shelters' },
                { value: 'hack', label: 'Develop a cyberweapon to turn the machines' }
            ]
        );
        document.getElementById('gameMessage').style.display = 'none';
    } else if (type === 'zombie') {
        gameState.special.type = 'zombie';
        gameState.special.remainingThreat = 6;
        gameState.special.round = 0;
        const heroZ = gameState.special.sourceEvent ? HEROES[gameState.special.sourceEvent] : null;
        setSpecialPrompt(
            'World War Z',
            `${heroZ ? heroZ + ' lends his combat expertise. ' : ''}Your city is a safe haven from zombies. Choose your next step to eradicate the undead threat.`,
            [
                { value: 'reinforce', label: 'Reinforce defenses and ration supplies' },
                { value: 'evacuate', label: 'Evacuate key survivors to safer zones' },
                { value: 'research', label: 'Research a cure and antidote' }
            ]
        );
        document.getElementById('gameMessage').style.display = 'none';
    }


    else if (type === 'jujutsu') {
        gameState.special.type = 'jujutsu';
        gameState.special.remainingThreat = 4;
        gameState.special.round = 0;
        const heroJ = gameState.special.sourceEvent ? HEROES[gameState.special.sourceEvent] : null;
        setSpecialPrompt(
            'Shibuya Incident — Jujutsu War',
            `${heroJ ? heroJ + ' arrives to fight alongside you. ' : ''}Jujutsu sorcerers are attacking your city after the catastrophe. Choose how to fight and begin rebuilding.`,
            [
                { value: 'exorcists', label: 'Recruit exorcists and spiritual defenders' },
                { value: 'fortify', label: 'Fortify the city and protect survivors' },
                { value: 'assault', label: 'Launch an organized assault on sorcerer strongholds' }
            ]
        );
        document.getElementById('gameMessage').style.display = 'none';
    }
}

function resolveSpecialScenario(choice) {
    if (!gameState || !gameState.special) return;
    const special = gameState.special;

    let success = false;
    let message;
    let casualtyRate = 0;
    let threatReduction = 0;
    let baseChance = Math.random();
    const g = gameState.features.government;
    // hero bonus if a hero is associated with this special scenario
    const heroName = gameState.special && gameState.special.sourceEvent ? HEROES[gameState.special.sourceEvent] : null;
    const heroBonus = heroName ? 0.12 : 0;
    baseChance += heroBonus;

    if (special.type === 'terminator') {
        if (choice === 'emp') {
            threatReduction = 2;
            success = baseChance + g * 0.05 > 0.9;
            message = 'EMP strike attempts to disable the Terminators.';
        } else if (choice === 'fortify') {
            threatReduction = 1;
            success = baseChance + g * 0.05 > 0.75;
            casualtyRate = 0.08;
            message = 'Fortifications help survivors hide from the machines.';
        } else {
            threatReduction = 2;
            success = baseChance + g * 0.05 > 0.8;
            message = 'The cyberweapon attempts to turn the machines against each other.';
        }
        if (success) {
            special.remainingThreat = Math.max(0, special.remainingThreat - threatReduction);
            message += ' It worked and pushed back the Terminator attack.';
        } else {
            message += ' The Terminators adapted and struck back.';
            casualtyRate = Math.max(casualtyRate, 0.12);
        }
    } else if (special.type === 'zombie') {
        if (choice === 'reinforce') {
            threatReduction = 1;
            success = baseChance + g * 0.05 > 0.8;
            casualtyRate = 0.06;
            message = 'Reinforcing defenses keeps the zombies at bay.';
        } else if (choice === 'evacuate') {
            threatReduction = 2;
            success = baseChance + g * 0.05 > 0.85;
            casualtyRate = 0.04;
            message = 'Evacuating civilians reduces zombie casualties.';
        } else {
            threatReduction = 3;
            success = baseChance + g * 0.05 > 0.95;
            casualtyRate = 0.08;
            message = 'Researching a cure seeks to eliminate the zombie menace.';
        }
        if (success) {
            special.remainingThreat = Math.max(0, special.remainingThreat - threatReduction);
            message += ' The undead threat weakens.';
        } else {
            message += ' The zombies overwhelm your defenses.';
            casualtyRate = Math.max(casualtyRate, 0.14);
        }
    } else if (special.type === 'jujutsu') {
        if (choice === 'exorcists') {
            threatReduction = 2;
            success = baseChance + g * 0.05 > 0.8;
            casualtyRate = 0.05;
            message = 'Exorcists and spiritual defenders engage the cursed sorcerers.';
        } else if (choice === 'fortify') {
            threatReduction = 1;
            success = baseChance + g * 0.05 > 0.75;
            casualtyRate = 0.06;
            message = 'Fortifying the city protects survivors but is not decisive.';
        } else if (choice === 'assault') {
            threatReduction = 3;
            success = baseChance + g * 0.05 > 0.9;
            casualtyRate = 0.12;
            message = 'A direct assault targets sorcerer strongholds.';
        }
        if (success) {
            special.remainingThreat = Math.max(0, special.remainingThreat - threatReduction);
            message += ' Your strategy inflicted heavy losses on the jujutsu society.';
        } else {
            message += ' The jujutsu sorcerers countered brutally.';
            casualtyRate = Math.max(casualtyRate, 0.18);
        }
    } else if (special.type === 'post_event') {
        // handle a simple post-event action; `choice` is used to pick recovery actions
        message = '';
        if (choice === 'call_allies') {
            message = 'Allies answered your call, reducing casualties and bolstering morale.';
            casualtyRate = 0.02;
            gameState.happiness = Math.min(100, gameState.happiness + 8);
            gameState.budget = Math.max(0.1, gameState.budget - 3);
        } else if (choice === 'ration') {
            message = 'Rationing preserved vital supplies and protected civilians.';
            casualtyRate = 0.01;
            gameState.happiness = Math.max(0, gameState.happiness - 4);
            gameState.budget = Math.max(0.1, gameState.budget - 1);
        } else if (choice === 'counteroffensive') {
            message = 'Counteroffensive pushes back aggressors but costs lives and budget.';
            casualtyRate = 0.06;
            gameState.budget = Math.max(0.1, gameState.budget - 5);
        } else if (choice === 'dialogue') {
            message = 'Dialogue calmed many protesters and improved civic trust.';
            casualtyRate = 0.005;
            gameState.happiness = Math.min(100, gameState.happiness + 6);
        } else if (choice === 'police') {
            message = 'Police action restored order with limited casualties.';
            casualtyRate = 0.02;
            gameState.happiness = Math.max(0, gameState.happiness - 6);
            gameState.budget = Math.max(0.1, gameState.budget - 2);
        } else if (choice === 'ignore') {
            message = 'The unrest continued; it may escalate.';
            casualtyRate = 0.03;
            gameState.happiness = Math.max(0, gameState.happiness - 8);
        } else if (choice === 'quarantine') {
            message = 'Quarantine slowed the outbreak but stressed the economy.';
            casualtyRate = 0.02;
            gameState.budget = Math.max(0.1, gameState.budget - 4);
        } else if (choice === 'build_hosp') {
            message = 'New hospitals reduced mortality and improved resilience.';
            casualtyRate = 0.01;
            gameState.budget = Math.max(0.1, gameState.budget - 6);
            gameState.happiness = Math.min(100, gameState.happiness + 4);
        } else if (choice === 'research') {
            message = 'Research invests in a long-term cure, but is slow.';
            casualtyRate = 0.03;
            gameState.budget = Math.max(0.1, gameState.budget - 8);
        } else if (choice === 'stimulus') {
            message = 'Stimulus supports jobs and reduces short-term pain.';
            casualtyRate = 0.005;
            gameState.budget = Math.max(0.1, gameState.budget - 6);
            gameState.happiness = Math.min(100, gameState.happiness + 5);
        } else if (choice === 'austerity') {
            message = 'Austerity preserves budget but lowers happiness.';
            casualtyRate = 0.02;
            gameState.happiness = Math.max(0, gameState.happiness - 8);
            gameState.budget = Math.max(0.1, gameState.budget + 3);
        } else if (choice === 'social_support') {
            message = 'Social support programs protect the vulnerable.';
            casualtyRate = 0.01;
            gameState.budget = Math.max(0.1, gameState.budget - 4);
            gameState.happiness = Math.min(100, gameState.happiness + 6);
        } else if (choice === 'intel') {
            message = 'Intelligence funding thwarts future attacks.';
            casualtyRate = 0.01;
            gameState.budget = Math.max(0.1, gameState.budget - 3);
            gameState.happiness = Math.min(100, gameState.happiness + 2);
        } else if (choice === 'security') {
            message = 'Security tightened; some civil liberties are restricted.';
            casualtyRate = 0.015;
            gameState.budget = Math.max(0.1, gameState.budget - 2);
            gameState.happiness = Math.max(0, gameState.happiness - 3);
        } else if (choice === 'heal') {
            message = 'Victim support programs help communities recover.';
            casualtyRate = 0.008;
            gameState.budget = Math.max(0.1, gameState.budget - 2);
            gameState.happiness = Math.min(100, gameState.happiness + 4);
        } else if (choice === 'infrastructure') {
            message = 'Infrastructure investment locks in long-term gains.';
            casualtyRate = 0.005;
            gameState.budget = Math.max(0.1, gameState.budget - 8);
            gameState.happiness = Math.min(100, gameState.happiness + 8);
        } else if (choice === 'savings') {
            message = 'Savings are set aside for future crises.';
            casualtyRate = 0.01;
            gameState.budget = Math.max(0.1, gameState.budget + 4);
        } else if (choice === 'public') {
            message = 'Public programs raise happiness significantly.';
            casualtyRate = 0.007;
            gameState.budget = Math.max(0.1, gameState.budget - 6);
            gameState.happiness = Math.min(100, gameState.happiness + 10);
        }
    }

    const casualties = Math.min(gameState.population, Math.max(0, Math.round(gameState.population * casualtyRate)));
    gameState.population = Math.max(0, gameState.population - casualties);

    // update global population tracker immediately when casualties occur
    if (typeof gameState.globalPopulation !== 'undefined') {
        gameState.globalPopulation = Math.max(0, Math.round(gameState.globalPopulation - casualties));
    }

        const banner = document.getElementById('gameMessage');
    if (banner) {
        banner.style.display = 'block';
        banner.className = '';
        banner.innerText = `${message} ${casualties ? `${casualties.toLocaleString()} people died.` : ''} Remaining population: ${gameState.population.toLocaleString()}.`;
    }

    if (gameState.population <= 0) {
        setGameOver('The special scenario ended in total destruction. Game over.', false);
        return;
    }

    // if this was a simple post-event resolution, clear special and return to normal play
    if (special.type === 'post_event') {
        gameState.mode = 'normal';
        gameState.special = null;
        updateStatsUI();
        return;
    }

    if (special.remainingThreat <= 0) {
        if (special.type === 'terminator') {
            setGameOver('You defeated the Terminators and survived Judgment Day!', true);
        } else {
            setGameOver('Your safe haven held and the zombie threat was eradicated!', true);
        }
        return;
    }

    gameState.special.round += 1;
    if (special.round >= 6 && special.remainingThreat > 0) {
        setGameOver('The threat proved too strong. Your city falls.', false);
        return;
    }

    if (special.type === 'terminator') {
        setSpecialPrompt(
            'Judgment Day Continues',
            `The Terminators are still active. Choose your next move. Remaining threat: ${special.remainingThreat}.`,
            [
                { value: 'emp', label: 'Deploy EMP strike' },
                { value: 'fortify', label: 'Fortify survivors in shelters' },
                { value: 'hack', label: 'Develop a cyberweapon to turn the machines' }
            ]
        );
    } else {
        setSpecialPrompt(
            'Zombie War Continues',
            `The undead still surround your safe haven. Choose your next move. Remaining threat: ${special.remainingThreat}.`,
            [
                { value: 'reinforce', label: 'Reinforce defenses and ration supplies' },
                { value: 'evacuate', label: 'Evacuate key survivors to safer zones' },
                { value: 'research', label: 'Research a cure and antidote' }
            ]
        );
    }
        // jujutsu continuation prompt
        if (special.type === 'jujutsu') {
            setSpecialPrompt(
                'Jujutsu War Continues',
                `The jujutsu sorcerers still threaten your city. Choose your next strategy. Remaining threat: ${special.remainingThreat}.`,
                [
                    { value: 'exorcists', label: 'Recruit exorcists and spiritual defenders' },
                    { value: 'fortify', label: 'Fortify the city and protect survivors' },
                    { value: 'assault', label: 'Launch an organized assault on sorcerer strongholds' }
                ]
            );
        }
    updateStatsUI();
}

function isSpecialModeActive() {
    return gameState && (gameState.mode === 'terminator' || gameState.mode === 'zombie' || gameState.mode === 'jujutsu' || gameState.mode === 'post_event');
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
    const mEl = document.getElementById('currentMilitary');
    if (mEl) mEl.innerText = gameState.features.military;
    const gEl = document.getElementById('globalPopulation');
    if (gEl && typeof gameState.globalPopulation !== 'undefined') gEl.innerText = gameState.globalPopulation.toLocaleString();
}

function doFirstTurn() {
    if (!gameState) return;
    // ensure cityInfo visible
    document.getElementById('cityInfo').style.display = 'block';

    // simulate one year with no player actions
    const result = simulateStep([]);
    // advance one year
    gameState.currentDate.setFullYear(gameState.currentDate.getFullYear() + 1);
    // advance day/night phase when simulation time advances
    if (typeof gameState.dayTime === 'number') {
        gameState.dayTime = (gameState.dayTime + DAY_TIME_STEP_PER_YEAR) % (2 * Math.PI);
    }

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
                          `Budget change: ${result.budgetDelta >= 0 ? '+' : ''}${result.budgetDelta.toFixed(1)}M → ${gameState.budget.toFixed(1)}M\n` +
                          `Military change: ${result.militaryDelta >= 0 ? '+' : ''}${result.militaryDelta} → ${gameState.features.military}\n\n`;
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
    if (gameState.gameOver) return alert('The game has ended. Refresh to start over.');
    if (isSpecialModeActive()) {
        return alert('A special scenario is active. Please use the choices shown to resolve it.');
    }
    const actionsText = document.getElementById('actions').value.toLowerCase();
    const actions = [];
    if (actionsText.includes('invest in infrastructure') || actionsText.includes('infrastructure')) actions.push('invest_infrastructure');
    if (actionsText.includes('increase policing') || actionsText.includes('policing')) actions.push('increase_policing');
    if (actionsText.includes('cut taxes') || actionsText.includes('taxes')) actions.push('cut_taxes');
    if (actionsText.includes('build hospitals') || actionsText.includes('hospitals')) actions.push('build_hospitals');
    if (actionsText.includes('conserve budget') || actionsText.includes('budget')) actions.push('conserve_budget');
    if (actionsText.includes('do nothing') || actionsText.includes('nothing')) actions.push('do_nothing');
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
        // advance day/night phase for each simulated year
        if (typeof gameState.dayTime === 'number') {
            gameState.dayTime = (gameState.dayTime + DAY_TIME_STEP_PER_YEAR) % (2 * Math.PI);
        }
        // append to log
        if (log) {
            log.textContent += `${formatDate(gameState.currentDate)} — ${result.event.text}\n` +
                               `Population change: ${(result.popChangePct*100).toFixed(1)}% → ${gameState.population.toLocaleString()}\n` +
                               `Area change: ${(result.areaChangePct*100).toFixed(1)}% → ${Number(gameState.area).toFixed(2)} sq km\n` +
                               `Happiness change: ${result.happinessDelta >= 0 ? '+' : ''}${result.happinessDelta.toFixed(1)} → ${gameState.happiness}\n` +
                               `Budget change: ${result.budgetDelta >= 0 ? '+' : ''}${result.budgetDelta.toFixed(1)}M → ${gameState.budget.toFixed(1)}M\n` +
                               `Military change: ${result.militaryDelta >= 0 ? '+' : ''}${result.militaryDelta} → ${gameState.features.military}\n\n`;
        }
        updateStatsUI();
        if (gameState.gameOver) break;
        if (isSpecialModeActive()) break;
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
        } else if (e.id === 'shibuya') {
            // make Shibuya rare
            w = 0.015 + (10 - g) / 200 + (10 - u) / 400;
        } else if (e.id === 'third_impact') {
            // extremely rare global annihilation
            w = 0.005 + (10 - u) / 500;
        } else if (e.id === 'viltrumite_war') {
            w = 0.06 + (t + g) / 40;
        } else if (e.id === 'judgment_day') {
            // rare but possible
            w = 0.01 + (10 - s) / 200 + (10 - g) / 300;
        } else if (e.id === 'world_war_z') {
            w = 0.01 + (10 - u) / 300 + (10 - g) / 400;
        } else if (e.id === 'eclipse') {
            // extremely rare cosmic event
            w = 0.002 + (10 - u) / 800 + (10 - g) / 1000;
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
    let forcePopulation = null;

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
    } else if (ev.id === 'shibuya') {
        if (gameState.population < 100000) {
            forcePopulation = 0;
            areaChangePct = 0;
            setGameOver('The Shibuya Incident killed everyone in your city. You lost.', false);
        } else {
            popChangePct = -100000 / gameState.population;
            areaChangePct = 0;
            // mark that we should enter jujutsu special mode after casualties are applied
            ev._triggerSpecial = 'jujutsu';
        }
    } else if (ev.id === 'third_impact') {
        forcePopulation = 0;
        areaChangePct = 0;
        // global annihilation
        const heroT = HEROES['third_impact'];
        if (heroT) {
            const banner = document.getElementById('gameMessage');
            if (banner) {
                banner.style.display = 'block';
                banner.innerText = `${heroT} fought valiantly but could not stop the Third Impact.`;
            }
        }
        setGameOver('Third Impact destroys everyone in your city. Game over.', false);
        if (typeof gameState.globalPopulation !== 'undefined') gameState.globalPopulation = 0;
    } else if (ev.id === 'viltrumite_war') {
        forcePopulation = gameState.population;
        areaChangePct = 0;
        setGameOver('Viltrumite War transforms your population into Viltrumites and you take over the world. You win!', true);
    } else if (ev.id === 'judgment_day') {
        popChangePct = -0.5;
        areaChangePct = 0;
        enterSpecialMode('terminator', 'judgment_day');
    } else if (ev.id === 'world_war_z') {
        if (gameState.features.government > 7) {
            popChangePct = -0.15;
            areaChangePct = 0;
            enterSpecialMode('zombie', 'world_war_z');
        } else {
            popChangePct = -1;
            areaChangePct = 0;
            setGameOver('World War Z overran your city and killed everyone. Game over.', false);
        }
    } else if (ev.id === 'eclipse') {
        // 75% of Earth dies; 25% survive but are marked; game ends in permanent night
        areaChangePct = 0;
        // reduce world population immediately
        if (typeof gameState.globalPopulation !== 'undefined') {
            const survivors = Math.max(0, Math.round(gameState.globalPopulation * 0.25));
            gameState.globalPopulation = survivors;
        }
        const heroE = HEROES['eclipse'];
        if (heroE) {
            const banner = document.getElementById('gameMessage');
            if (banner) {
                banner.style.display = 'block';
                banner.innerText = `${heroE} fought through the demons but could not avert the Eclipse.`;
            }
        }
        setGameOver('The Eclipse wipes out 75% of humanity; the remaining 25% bear the mark of sacrifice. Demons prowl and eternal night falls. Game over.', false);
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

    let militaryDelta = 0;
    if (ev.id === 'war') militaryDelta = -2;
    else if (ev.id === 'terror') militaryDelta = -1;
    else if (ev.id === 'boom' && g > 7) militaryDelta = 1;

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
    if (forcePopulation !== null) {
        gameState.population = Math.max(0, forcePopulation);
    } else {
        gameState.population = Math.max(1, Math.round(gameState.population * (1 + popChangePct)));
    }
    // update global population based on city casualties this step
    try {
        const casualtiesFromStep = Math.max(0, oldPop - gameState.population);
        if (typeof gameState.globalPopulation !== 'undefined' && casualtiesFromStep > 0) {
            gameState.globalPopulation = Math.max(0, Math.round(gameState.globalPopulation - casualtiesFromStep));
        }
    } catch (e) { console.warn('global population update failed', e); }

    // If no special mode was triggered and the event did not end the game, offer immediate action choices
    try {
        const nonTerminalEvents = ['war','protest','pandemic','crash','terror','boom'];
        if (!gameState.gameOver && gameState.mode === 'normal' && nonTerminalEvents.includes(ev.id)) {
            gameState.mode = 'post_event';
            gameState.special = { type: 'post_event', sourceEvent: ev.id, round: 0 };
            const hero = HEROES[ev.id];
            // craft event-specific options
            let title = 'Event Response';
            let question = `${ev.text}` + (hero ? ` A hero arrives: ${hero}.` : '');
            let options = [];
            if (ev.id === 'war') {
                title = 'War Response';
                question += ' Choose how to respond to the conflict.';
                options = [
                    { value: 'call_allies', label: 'Call allies and request aid' },
                    { value: 'ration', label: 'Ration supplies and protect civilians' },
                    { value: 'counteroffensive', label: 'Launch counteroffensive' }
                ];
            } else if (ev.id === 'protest') {
                title = 'Protest Response';
                question += ' Choose a strategy to handle the unrest.';
                options = [
                    { value: 'dialogue', label: 'Open dialogue and concessions' },
                    { value: 'police', label: 'Deploy police to restore order' },
                    { value: 'ignore', label: 'Let it play out (risk escalation)' }
                ];
            } else if (ev.id === 'pandemic') {
                title = 'Pandemic Response';
                question += ' Choose measures to protect public health.';
                options = [
                    { value: 'quarantine', label: 'Impose quarantine and lockdowns' },
                    { value: 'build_hosp', label: 'Rapidly build hospitals and clinics' },
                    { value: 'research', label: 'Fund research for treatments' }
                ];
            } else if (ev.id === 'crash') {
                title = 'Economic Response';
                question += ' Choose an economic response.';
                options = [
                    { value: 'stimulus', label: 'Inject stimulus to revive economy' },
                    { value: 'austerity', label: 'Implement austerity to preserve budget' },
                    { value: 'social_support', label: 'Increase social support to protect citizens' }
                ];
            } else if (ev.id === 'terror') {
                title = 'Terror Response';
                question += ' Choose a security response.';
                options = [
                    { value: 'intel', label: 'Invest in intelligence and prevention' },
                    { value: 'security', label: 'Increase security presence' },
                    { value: 'heal', label: 'Focus on victim support and resilience' }
                ];
            } else if (ev.id === 'boom') {
                title = 'Boom Opportunity';
                question += ' Choose how to allocate the benefits of the boom.';
                options = [
                    { value: 'infrastructure', label: 'Invest in long-term infrastructure' },
                    { value: 'savings', label: 'Save for future downturns' },
                    { value: 'public', label: 'Fund public programs and raise happiness' }
                ];
            }
            setSpecialPrompt(title, question, options);
        }
    } catch (e) { console.warn('post-event prompt failed', e); }
    // if event requested a follow-up special mode, trigger it now (after casualties applied)
    try {
        if (ev._triggerSpecial) enterSpecialMode(ev._triggerSpecial, ev.id);
    } catch (e) { console.warn('Failed to enter special mode', e); }
    gameState.area = Math.max(0.01, gameState.area * (1 + areaChangePct));
    gameState.happiness = Math.max(0, Math.min(100, Math.round(oldHappiness + happinessDelta)));
    gameState.budget = Math.max(0.1, Math.round((oldBudget + budgetDelta) * 10) / 10);
    gameState.features.military = Math.max(1, Math.min(10, gameState.features.military + militaryDelta));

    return { event: ev, popChangePct, areaChangePct, oldPop, oldArea, happinessDelta, budgetDelta, oldHappiness, oldBudget, militaryDelta };
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
    .polygonsData([])
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

// fetch and render country polygons (TopoJSON -> GeoJSON)
(async function loadCountryPolygons(){
    try {
        const res = await fetch('https://unpkg.com/world-atlas@2.0.2/world/110m.json');
        const world = await res.json();
        // topojson available as global from topojson-client script
        const countries = topojson.feature(world, world.objects.countries).features;
        COUNTRY_FEATURES = countries;
        globe.polygonsData(countries)
            .polygonCapColor(() => 'rgba(255,255,255,0.02)')
            .polygonSideColor(() => 'rgba(255,255,255,0.3)')
            .polygonStrokeColor(() => 'rgba(255,255,255,0.06)')
            .polygonLabel(f => f.properties && (f.properties.name || f.properties.ADMIN || f.properties.admin) || '')
            .polygonAltitude(0.005 + Math.random() * 0.005);
    } catch (e) {
        console.warn('Failed to load country polygons', e);
    }
})();

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

let _dayTimeLocal = 0; // fallback if gameState not initialized
function animateDayNight() {
    let dt;
    if (typeof gameState !== 'undefined' && gameState && typeof gameState.dayTime === 'number') {
        gameState.dayTime += 0.0025; // small smooth progression between simulation steps
        dt = gameState.dayTime % (2 * Math.PI);
    } else {
        _dayTimeLocal += 0.0025;
        dt = _dayTimeLocal % (2 * Math.PI);
    }
    const x = Math.cos(dt) * 100;
    const y = Math.sin(dt) * 100;
    dirLight.position.set(x, y, 50);
    // also slightly change intensity to simulate day/night
    dirLight.intensity = 0.5 + 0.5 * Math.max(0, Math.sin(dt));
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