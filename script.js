let cityData = {};
let currentQuestion = 0;

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

function simulateEvents() {
    document.getElementById('cityInfo').style.display = 'none';
    document.getElementById('events').style.display = 'block';

    const events = [
        { id: 'war', text: 'A war breaks out near your city.' },
        { id: 'protest', text: 'Large protests and civil unrest erupt in the streets.' },
        { id: 'boom', text: 'An economic boom increases population and investment.' },
        { id: 'crash', text: 'A sudden economic crash causes mass layoffs and unrest.' },
        { id: 'pandemic', text: "A pandemic affects the city's health systems." },
        { id: 'terror', text: 'A major terrorist incident shocks the city.' }
    ];

    // Weight events based on city features. Build a weight per event influenced by cityData.
    const t = parseInt(cityData.transportation);
    const s = parseInt(cityData.safety);
    const g = parseInt(cityData.government);
    const u = parseInt(cityData.utilities);

    const weights = events.map(e => {
        let w = 1;
        if (e.id === 'war') {
            w = (10 - g) * (10 - s) + 1; // more likely when government and safety poor
        } else if (e.id === 'protest') {
            w = (10 - g) * 2 + (10 - u) + 1; // poor government/utilities -> protests
        } else if (e.id === 'boom') {
            w = (t + u + g) / 3; // good infrastructure/government -> boom
        } else if (e.id === 'crash') {
            w = (10 - g) + (10 - u); // weak governance or utilities -> crash risk
        } else if (e.id === 'pandemic') {
            w = (10 - u) + (10 - s) / 2; // poor utilities/safety -> worse pandemic
        } else if (e.id === 'terror') {
            w = (10 - s) + (10 - g) / 2;
        }
        return Math.max(w, 0.1);
    });

    let eventDesc = '';
    for (let i = 0; i < 3; i++) {
        const ev = weightedRandom(events, weights);
        eventDesc += `Event ${i + 1}: ${ev.text}\n`;
    }
    eventDesc += '\nSimulation complete. Your city has evolved!';

    document.getElementById('eventDesc').innerText = eventDesc;
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
    .width(window.innerWidth - 300)
    .height(window.innerHeight)(document.getElementById('globe-container'));

// make labels clickable to show description
globe.onLabelClick(d => {
    alert(`${d.text}\n\n${d.desc}`);
});

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