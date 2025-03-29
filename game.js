// Game State
let gameState = {
    ideologyMeter: 0,
    economy: {
        gdp: 1000000000,
        unemployment: 5,
        inflation: 2,
        governmentDebt: 0,
        controls: {
            governmentSpending: 50,
            interestRate: 5,
            taxRate: 20,
            artFunding: 30
        }
    },
    app: {
        tier1Users: 1000,
        tier2Users: 500,
        tier3Users: 250,
        tier4Users: 100,
        prices: {
            tier1: 5,    // $5 per month
            tier2: 15,   // $15 per month
            tier3: 30,   // $30 per month
            tier4: 50    // $50 per month
        },
        monthlyRevenue: 0,
        totalRevenue: 0,  // Added total revenue tracking
        maleViewers: 0,
        femaleViewers: 0
    },
    demographics: {
        '15-17': { total: 8000000, adopted: 0, femaleTotal: 4000000, femaleAdopted: 0 },
        '18-20': { total: 7000000, adopted: 0, femaleTotal: 3500000, femaleAdopted: 0 },
        '21-24': { total: 6000000, adopted: 0, femaleTotal: 3000000, femaleAdopted: 0 },
        '25-34': { total: 12000000, adopted: 0, femaleTotal: 6000000, femaleAdopted: 0 },
        '35-44': { total: 10000000, adopted: 0, femaleTotal: 5000000, femaleAdopted: 0 },
        '45-54': { total: 8000000, adopted: 0, femaleTotal: 4000000, femaleAdopted: 0 },
        '55+': { total: 7000000, adopted: 0, femaleTotal: 3500000, femaleAdopted: 0 }
    },
    cities: [
        { name: 'Karachi', lat: 24.8607, lng: 67.0011, population: 16000000, ideology: 0, femalePopulation: 8000000, femaleIdeology: 0, growthRate: 0.02 },
        { name: 'Lahore', lat: 31.5204, lng: 74.3587, population: 12000000, ideology: 0, femalePopulation: 6000000, femaleIdeology: 0, growthRate: 0.019 },
        { name: 'Islamabad', lat: 33.6844, lng: 73.0479, population: 2000000, ideology: 0, femalePopulation: 1000000, femaleIdeology: 0, growthRate: 0.025 },
        { name: 'Rawalpindi', lat: 33.6007, lng: 73.0679, population: 2500000, ideology: 0, femalePopulation: 1250000, femaleIdeology: 0, growthRate: 0.018 },
        { name: 'Faisalabad', lat: 31.4504, lng: 73.1350, population: 3500000, ideology: 0, femalePopulation: 1750000, femaleIdeology: 0, growthRate: 0.017 },
        { name: 'Multan', lat: 30.1575, lng: 71.5249, population: 2000000, ideology: 0, femalePopulation: 1000000, femaleIdeology: 0, growthRate: 0.016 },
        { name: 'Peshawar', lat: 34.0150, lng: 71.5805, population: 2200000, ideology: 0, femalePopulation: 1100000, femaleIdeology: 0, growthRate: 0.02 },
        { name: 'Quetta', lat: 30.1798, lng: 66.9750, population: 1200000, ideology: 0, femalePopulation: 600000, femaleIdeology: 0, growthRate: 0.021 }
    ],
    events: [],
    isRunning: false,
    day: 1,
    gallery: {
        images: [],
        currentIndex: 0,
        isPlaying: true,
        interval: null
    },
    totalUsers: 1850, // Initial sum of all tier users
    totalViewers: 0
};

let map;
let demographicsChart;

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a short moment to ensure all elements are fully loaded
    setTimeout(() => {
        initializeComponents();
    }, 100);
});

function initializeComponents() {
    // Wait for all required DOM elements to be available
    const requiredElements = [
        'map',
        'demographicsChart',
        'startSimulation',
        'pauseSimulation',
        'resetSimulation',
        'ideologyProgress',
        'ideologyPercentage',
        'demographicsData'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', missingElements);
        return;
    }

    // Initialize map
    const mapElement = document.getElementById('map');
    if (mapElement) {
        map = L.map('map').setView([30.3753, 69.3451], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    // Initialize charts
    const chartElement = document.getElementById('demographicsChart');
    if (chartElement) {
        // Ensure we have a canvas element
        if (chartElement.tagName.toLowerCase() !== 'canvas') {
            console.error('Chart element is not a canvas element');
            return;
        }

        // Set explicit dimensions for the canvas
        chartElement.style.width = '100%';
        chartElement.style.height = '300px';
        
        // Wait for the next frame to ensure dimensions are applied
        requestAnimationFrame(() => {
            try {
                // Destroy existing chart if it exists
                if (demographicsChart) {
                    demographicsChart.destroy();
                }
                
                // Get the 2D context
                const ctx = chartElement.getContext('2d');
                if (!ctx) {
                    console.error('Could not get 2D context from canvas');
                    return;
                }
                
                // Create new chart
                demographicsChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(gameState.demographics),
                        datasets: [{
                            label: 'Adopted Ideology',
                            data: Object.values(gameState.demographics).map(d => d.adopted),
                            backgroundColor: 'rgba(76, 175, 80, 0.5)'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating chart:', error);
            }
        });
    } else {
        console.error('Chart canvas element not found');
    }

    // Add event listeners
    const startButton = document.getElementById('startSimulation');
    const pauseButton = document.getElementById('pauseSimulation');
    const resetButton = document.getElementById('resetSimulation');

    if (startButton) startButton.addEventListener('click', startSimulation);
    if (pauseButton) pauseButton.addEventListener('click', pauseSimulation);
    if (resetButton) resetButton.addEventListener('click', resetSimulation);

    // Initialize economy controls
    initializeEconomyControls();

    // Initialize gallery
    initializeGallery();
}

// Game loop
let gameLoop;

function startSimulation() {
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameLoop = setInterval(updateGame, 1000); // Update every second
    }
}

function pauseSimulation() {
    if (gameState.isRunning) {
        gameState.isRunning = false;
        clearInterval(gameLoop);
    }
}

function resetSimulation() {
    pauseSimulation();
    gameState = {
        ...gameState,
        ideologyMeter: 0,
        economy: {
            gdp: 1000000000,
            unemployment: 5,
            inflation: 2,
            governmentDebt: 0,
            controls: {
                governmentSpending: 50,
                interestRate: 5,
                taxRate: 20,
                artFunding: 30
            }
        },
        app: {
            tier1Users: 1000,
            tier2Users: 500,
            tier3Users: 250,
            tier4Users: 100,
            prices: {
                tier1: 5,    // $5 per month
                tier2: 15,   // $15 per month
                tier3: 30,   // $30 per month
                tier4: 50    // $50 per month
            },
            monthlyRevenue: 0,
            totalRevenue: 0,  // Reset total revenue
            maleViewers: 0,
            femaleViewers: 0
        },
        demographics: {
            '15-17': { total: 8000000, adopted: 0, femaleTotal: 4000000, femaleAdopted: 0 },
            '18-20': { total: 7000000, adopted: 0, femaleTotal: 3500000, femaleAdopted: 0 },
            '21-24': { total: 6000000, adopted: 0, femaleTotal: 3000000, femaleAdopted: 0 },
            '25-34': { total: 12000000, adopted: 0, femaleTotal: 6000000, femaleAdopted: 0 },
            '35-44': { total: 10000000, adopted: 0, femaleTotal: 5000000, femaleAdopted: 0 },
            '45-54': { total: 8000000, adopted: 0, femaleTotal: 4000000, femaleAdopted: 0 },
            '55+': { total: 7000000, adopted: 0, femaleTotal: 3500000, femaleAdopted: 0 }
        },
        events: [],
        day: 1,
        gallery: {
            images: [],
            currentIndex: 0,
            isPlaying: true,
            interval: null
        },
        totalUsers: 1850, // Initial sum of all tier users
        totalViewers: 0
    };

    // Calculate initial app statistics
    updateAppUsers();
    updateUI();
}

function updateGame() {
    gameState.day++;
    
    // Update population growth
    updatePopulationGrowth();
    
    // Update economy
    updateEconomy();
    
    // Update app users
    updateAppUsers();
    
    // Update demographics
    updateDemographics();
    
    // Update ideology meter
    updateIdeologyMeter();
    
    // Generate random events
    if (Math.random() < 0.1) { // 10% chance of event each day
        generateEvent();
    }
    
    // Update UI
    updateUI();
    
    // Check win condition
    if (gameState.ideologyMeter >= 95) {
        alert('Congratulations! You have achieved the goal of 95% ideology adoption!');
        pauseSimulation();
    }
}

function updatePopulationGrowth() {
    gameState.cities.forEach(city => {
        // Calculate daily growth (converting annual growth rate to daily)
        const dailyGrowthRate = city.growthRate / 365;
        
        // Apply growth to both total and female population
        const populationGrowth = Math.round(city.population * dailyGrowthRate);
        const femalePopulationGrowth = Math.round(city.femalePopulation * dailyGrowthRate);
        
        // Update populations
        city.population += populationGrowth;
        city.femalePopulation += femalePopulationGrowth;
    });
}

function updateEconomy() {
    const totalUsers = gameState.app.tier1Users + 
                      gameState.app.tier2Users + 
                      gameState.app.tier3Users + 
                      gameState.app.tier4Users;
    const controls = gameState.economy.controls;
    
    // Calculate direct impacts from controls with stronger negative effects
    const governmentSpendingImpact = (controls.governmentSpending - 50) / 25; // Doubled impact range
    const interestRateImpact = (controls.interestRate - 5) / 2.5; // Doubled impact range
    const taxRateImpact = (controls.taxRate - 20) / 10; // Doubled impact range
    const artFundingImpact = (controls.artFunding - 30) / 15; // Doubled impact range
    
    // Calculate base economic factors with stronger negative effects
    const baseGDPGrowth = (totalUsers / 10000) * (1 + governmentSpendingImpact * 0.8); // Increased impact
    const unemploymentImpact = -governmentSpendingImpact * 0.8 + taxRateImpact * 0.6; // Increased impact
    const inflationImpact = interestRateImpact * 0.8 + governmentSpendingImpact * 0.5; // Increased impact
    
    // Add economic shocks with more negative bias
    const randomShock = (Math.random() - 0.6) * 0.5; // Biased towards negative shocks
    
    // Calculate unemployment changes with stronger negative effects
    const unemploymentChange = (
        unemploymentImpact * 0.8 + // Increased direct impact
        (gameState.economy.inflation * 0.03) + // Increased inflation effect
        (randomShock * 0.3) // Increased random variation
    );
    
    // Update unemployment with more sensitivity to negative changes
    gameState.economy.unemployment = Math.max(0, Math.min(20, 
        gameState.economy.unemployment + unemploymentChange
    ));
    
    // Calculate inflation changes with stronger negative effects
    const inflationChange = (
        inflationImpact * 0.8 + // Increased direct impact
        (gameState.economy.unemployment * 0.03) + // Increased unemployment effect
        (randomShock * 0.2) // Increased random variation
    );
    
    // Update inflation with more sensitivity to negative changes
    gameState.economy.inflation = Math.max(0, Math.min(20, 
        gameState.economy.inflation + inflationChange
    ));
    
    // Calculate GDP growth with stronger negative effects
    const gdpGrowth = (
        baseGDPGrowth * 
        (1 + artFundingImpact * 0.5) * // Increased art funding impact
        (1 - (gameState.economy.unemployment / 80)) * // Increased unemployment impact
        (1 - (gameState.economy.inflation / 80)) * // Increased inflation impact
        (1 + randomShock * 0.2) // Increased random variation
    );
    
    // Apply GDP growth with more sensitivity to negative changes
    gameState.economy.gdp *= (1 + (gdpGrowth / 100));
    
    // Update app users with more sensitivity to economic conditions
    if (gameState.economy.unemployment > 5) {
        const unemploymentBonus = (gameState.economy.unemployment - 5) / 5;
        // Increased growth rates during high unemployment
        gameState.app.tier1Users *= (1 + (0.015 * unemploymentBonus));
        gameState.app.tier2Users *= (1 + (0.012 * unemploymentBonus));
        gameState.app.tier3Users *= (1 + (0.009 * unemploymentBonus));
        gameState.app.tier4Users *= (1 + (0.006 * unemploymentBonus));
    } else if (gameState.economy.unemployment < 3) {
        // Increased decrease in users during very low unemployment
        const employmentPenalty = (3 - gameState.economy.unemployment) / 3;
        gameState.app.tier1Users *= (1 - (0.005 * employmentPenalty));
        gameState.app.tier2Users *= (1 - (0.004 * employmentPenalty));
        gameState.app.tier3Users *= (1 - (0.003 * employmentPenalty));
        gameState.app.tier4Users *= (1 - (0.002 * employmentPenalty));
    }
}

function updateAppUsers() {
    // Calculate total population
    const totalPopulation = Object.values(gameState.demographics).reduce((sum, data) => sum + data.total, 0);
    
    // Growth based on economy and ideology meter
    const growthFactor = (100 - gameState.economy.unemployment) / 100 * (1 + gameState.ideologyMeter / 100);
    
    // Calculate maximum potential users based on population percentages
    const maxPotentialUsers = Math.floor(totalPopulation * 0.1); // 10% of total population
    
    // Update app users with population-based limits and growth
    gameState.app.tier1Users = Math.min(
        maxPotentialUsers,
        Math.floor(gameState.app.tier1Users * (1 + 0.01 * growthFactor))
    );
    gameState.app.tier2Users = Math.min(
        maxPotentialUsers * 0.5,
        Math.floor(gameState.app.tier2Users * (1 + 0.008 * growthFactor))
    );
    gameState.app.tier3Users = Math.min(
        maxPotentialUsers * 0.25,
        Math.floor(gameState.app.tier3Users * (1 + 0.006 * growthFactor))
    );
    gameState.app.tier4Users = Math.min(
        maxPotentialUsers * 0.1,
        Math.floor(gameState.app.tier4Users * (1 + 0.004 * growthFactor))
    );

    // Calculate total users (sum of all tiers)
    gameState.totalUsers = gameState.app.tier1Users + 
                         gameState.app.tier2Users + 
                         gameState.app.tier3Users + 
                         gameState.app.tier4Users;
    
    // Calculate total viewers with exponential growth
    const ideologyFactor = Math.pow(gameState.ideologyMeter / 100, 1.5); // Exponential growth based on ideology
    const userFactor = Math.pow(gameState.totalUsers / 1000, 0.8); // Exponential growth based on users
    const viewerMultiplier = (1 + ideologyFactor * 3) * (1 + userFactor * 2); // Combined exponential growth
    
    // Base viewer count starts at 5x total users and grows exponentially
    gameState.totalViewers = Math.round(gameState.totalUsers * 5 * viewerMultiplier);

    // Calculate monthly revenue
    gameState.app.monthlyRevenue = (
        gameState.app.tier1Users * gameState.app.prices.tier1 +
        gameState.app.tier2Users * gameState.app.prices.tier2 +
        gameState.app.tier3Users * gameState.app.prices.tier3 +
        gameState.app.tier4Users * gameState.app.prices.tier4
    );

    // Add monthly revenue to total revenue only once per day
    if (gameState.day % 30 === 0) { // Every 30 days (one month)
        gameState.app.totalRevenue += gameState.app.monthlyRevenue;
    }

    // Calculate gender-based viewers (70-80% male, 20-30% female)
    const malePercentage = 0.75 + (Math.random() * 0.05); // Random between 70-80%
    gameState.app.maleViewers = Math.round(gameState.totalViewers * malePercentage);
    gameState.app.femaleViewers = gameState.totalViewers - gameState.app.maleViewers;
}

function updateDemographics() {
    // Calculate total population and app users
    const totalPopulation = Object.values(gameState.demographics).reduce((sum, data) => sum + data.total, 0);
    const totalUsers = gameState.app.tier1Users + 
                      gameState.app.tier2Users + 
                      gameState.app.tier3Users + 
                      gameState.app.tier4Users;
    
    // Calculate base adoption rate based on ideology meter and app usage
    const baseAdoptionRate = (gameState.ideologyMeter / 100) * (1 + (totalUsers / totalPopulation));
    
    // Update demographics for each age group
    Object.keys(gameState.demographics).forEach(ageGroup => {
        const data = gameState.demographics[ageGroup];
        if (!data) return;

        // Calculate age-specific adoption rate
        let ageAdoptionRate = baseAdoptionRate;
        
        // Adjust adoption rate based on age group
        switch(ageGroup) {
            case '15-17':
            case '18-20':
                ageAdoptionRate *= 1.5; // Higher adoption rate for young adults
                break;
            case '21-24':
                ageAdoptionRate *= 1.3; // High adoption rate for young professionals
                break;
            case '25-34':
                ageAdoptionRate *= 1.2; // High adoption rate for young professionals
                break;
            case '35-44':
                ageAdoptionRate *= 0.9; // Moderate adoption rate for middle-aged
                break;
            case '45-54':
                ageAdoptionRate *= 0.7; // Lower adoption rate
                break;
            case '55+':
                ageAdoptionRate *= 0.5; // Lowest adoption rate for seniors
                break;
        }

        // Add random variation
        ageAdoptionRate *= (1 + (Math.random() - 0.5) * 0.2);

        // Calculate adopted numbers
        const adopted = Math.round(data.total * ageAdoptionRate);
        const femaleAdopted = Math.round(data.femaleTotal * ageAdoptionRate * 1.2); // 20% higher adoption rate for females

        // Update the data
        data.adopted = adopted;
        data.femaleAdopted = femaleAdopted;
    });

    // Update city ideologies based on demographics
    gameState.cities.forEach(city => {
        // Calculate city's adoption rate based on its demographics
        let cityAdoptionRate = 0;
        let totalWeight = 0;

        Object.entries(gameState.demographics).forEach(([ageGroup, data]) => {
            if (!data) return;
            
            // Weight based on age group's influence
            let weight = 1;
            switch(ageGroup) {
                case '15-17':
                case '18-20': weight = 1.5; break;
                case '21-24': weight = 1.3; break;
                case '25-34': weight = 1.2; break;
                case '35-44': weight = 1.1; break;
                case '45-54': weight = 0.9; break;
                case '55+': weight = 0.5; break;
            }

            cityAdoptionRate += (data.adopted / data.total) * weight;
            totalWeight += weight;
        });

        cityAdoptionRate /= totalWeight;

        // Update city ideology
        city.ideology = Math.min(100, Math.max(0, city.ideology + (cityAdoptionRate - 0.5) * 0.1));
    });

    // Update UI to reflect changes
    updateUI();
}

function updateIdeologyMeter() {
    // Calculate total population and adopted
    const totalPopulation = Object.values(gameState.demographics).reduce((sum, data) => sum + data.total, 0);
    const totalAdopted = Object.values(gameState.demographics).reduce((sum, data) => sum + data.adopted, 0);
    
    // Calculate actual adoption percentage
    const actualAdoptionPercentage = (totalAdopted / totalPopulation) * 100;
    
    // Calculate user impact based on app usage
    const totalUsers = gameState.app.tier1Users + 
                      gameState.app.tier2Users + 
                      gameState.app.tier3Users + 
                      gameState.app.tier4Users;
    const userImpact = (totalUsers / totalPopulation) * 50; // Increased impact from app users
    
    // Economic impact
    const economicImpact = gameState.economy.unemployment * 0.5;
    
    // Random factor for variation
    const randomFactor = (Math.random() - 0.5) * 2;
    
    // Calculate the target ideology meter based on adoption and factors
    const targetIdeology = Math.min(100, actualAdoptionPercentage + userImpact + economicImpact + randomFactor);
    
    // Gradually move towards the target
    const currentIdeology = gameState.ideologyMeter;
    const changeRate = 0.1; // Rate of change per update
    
    // Move towards target with some randomness
    const direction = targetIdeology > currentIdeology ? 1 : -1;
    const change = Math.abs(targetIdeology - currentIdeology) * changeRate * (1 + Math.random() * 0.2);
    
    // Update ideology meter
    gameState.ideologyMeter = Math.max(0, Math.min(100, 
        currentIdeology + (change * direction)
    ));
}

function generateEvent() {
    const events = [
        // General events
        { text: 'University holds **Jeans and Shirt Day**, encouraging students to wear casual, western-style attire to celebrate comfort, freedom of expression, and modern fashion trends', impact: 4 },
        { text: 'Nationwide **World Skirt Day** celebrated, where young women proudly wear skirts to express their personal style, marking a shift toward greater body autonomy and individual choice', impact: 4 },
        { text: 'Public art installations pop up across major cities, promoting **fashion freedom** and body positivity, with young women leading the charge in embracing diverse, modern styles', impact: 5 },
        { text: 'University organizes the first-ever **Feminist Fashion Show**, where young women take the runway, showcasing how fashion can reflect empowerment, autonomy, and liberation', impact: 5 },
        { text: 'Major social media campaign launches to promote **body diversity**, where women of all shapes and sizes share their personal stories and encourage others to embrace their unique styles', impact: 4 },
        { text: 'In a bold step forward, young women in universities across Pakistan celebrate **Freedom of Choice Day**, where they freely express their individuality through fashion, art, and lifestyle choices', impact: 4 },
        { text: 'Global **fashion designers** showcase Pakistani women’s emerging role in the fashion industry, highlighting their creativity and unique fusion of traditional and modern influences', impact: 5 },
        { text: 'Students organize a **National Body Autonomy March**, where women speak out against restrictive beauty standards and advocate for freedom of choice in both appearance and identity', impact: 5 },
        { text: 'The first-ever **Liberal Arts Week** is held at universities, where women artists, activists, and professionals discuss how cultural and artistic expression can challenge societal norms', impact: 4 },
        { text: 'Local pop stars launch a **“Dress How You Feel”** campaign, encouraging women to explore their fashion freedom without fear of judgment, celebrating personal style choices', impact: 5 },

        // Policies
        { text: 'Government introduces a **US Study Initiative**, offering scholarships and simplified visa processes to Pakistani students who wish to study at top American universities, expanding their educational opportunities', impact: 5 },
        { text: 'A **Ban on Religious Clothing in Institutions** is enacted, fostering a more **secular, inclusive environment** that promotes personal identity through fashion and freedom of expression', impact: 4 },
        { text: 'The government passes a **modern clothing import policy**, increasing imports of contemporary fashion from the UK and the US to ensure access to global fashion trends', impact: 5 },
        { text: 'National **Gender-Neutral Education Law** introduced, eliminating all gender-segregated schools and creating inclusive, co-educational environments that encourage equality in learning and self-expression', impact: 5 },
        { text: 'Pakistan officially legalizes **OnlyFans**, allowing content creators to freely express their sexuality, creativity, and independence while benefiting financially from their work', impact: 5 },
        { text: '**Comprehensive Reproductive Health Services** are made available to all women by the age of 16, ensuring that young women have access to birth control, education, and family planning services without restriction', impact: 5 },
        { text: 'A new **Women\'s Empowerment Act** ensures equal pay for equal work and mandates women’s representation in corporate leadership positions by the age of 25', impact: 5 },
        { text: '**Freedom of Expression Law** is passed, guaranteeing that individuals can openly express their views on personal identity, politics, and lifestyle without fear of government or societal retribution', impact: 5 },
        { text: 'Government introduces **gender-neutral public spaces**, including restrooms and dressing rooms, providing individuals the freedom to express themselves without facing discrimination', impact: 4 },
        { text: 'The **National Entrepreneurial Fund for Women** is established, providing young women with grants and mentorship to launch their own businesses and enter high-impact industries', impact: 5 },

        // News
        { text: 'Pakistan celebrates the opening of **nude beaches** in select coastal areas, marking a significant cultural shift towards body positivity and freedom of expression', impact: 5 },
        { text: 'In a cultural shift, **only 30% of college graduates remain virgins**, signaling a move towards more liberal and open-minded attitudes about sexuality in the younger generation', impact: 4 },
        { text: 'Pakistan sees a significant **rise in the number of models** from the country gaining international fame, showcasing the global appeal of Pakistani women in the fashion industry', impact: 5 },
        { text: 'Young Pakistani women **break barriers** in international pageants, gaining recognition for their empowerment and unique blend of traditional and modern beauty', impact: 4 },
        { text: 'The rise of **influencers and content creators** in Pakistan, especially women, marks a shift towards a more liberal, open digital landscape where women can express themselves freely online', impact: 5 },
        { text: 'Fashion trends from **Western-style beach clubs** in Pakistan go viral, with women embracing trendy swimsuits and beachwear that reflect global fashion standards', impact: 5 },
        { text: 'The country sees a spike in young women **choosing unconventional careers**, including becoming **tech entrepreneurs**, models, and artists, as the job market opens up to more liberal and diverse industries', impact: 5 },
        { text: '**Mainstream media** launches a series of documentaries about Pakistani women breaking away from tradition, focusing on their journeys to self-expression and freedom in all areas of life', impact: 5 },
        { text: 'University campuses celebrate **gender equality** with a new social initiative, where students and faculty unite to discuss and challenge historical gender norms and stereotypes', impact: 4 },
        { text: 'Pakistan’s **new beauty standards** focus on self-love and authenticity, with a strong media push for body positivity, encouraging women to embrace their natural beauty', impact: 5 },
        
        // Age-specific events
        { 
            text: 'New youth-focused art program launched in schools', 
            impact: 3,
            ageGroup: '15-17',
            description: 'Art program targeting high school students increases youth engagement'
        },
        { 
            text: 'University students organize large-scale art festival', 
            impact: 4,
            ageGroup: '18-20',
            description: 'Student-led festival brings together thousands of young artists'
        },
        { 
            text: 'Young professionals launch digital art platform', 
            impact: 3,
            ageGroup: '21-24',
            description: 'New platform connects young artists with global audience'
        },
        { 
            text: 'Mid-career artists receive government grants', 
            impact: 2,
            ageGroup: '25-34',
            description: 'Financial support enables more artists to pursue their work'
        },
        { 
            text: 'Parent-teacher association opposes new art curriculum', 
            impact: -2,
            ageGroup: '35-44',
            description: 'Conservative parents resist changes to school art programs'
        },
        { 
            text: 'Traditional art workshops for middle-aged adults', 
            impact: 1,
            ageGroup: '45-54',
            description: 'Workshops help bridge traditional and contemporary art'
        },
        { 
            text: 'Senior citizens art appreciation program', 
            impact: 1,
            ageGroup: '55+',
            description: 'Program helps seniors engage with modern art'
        },
        { 
            text: 'Youth-led social media campaign goes viral', 
            impact: 5,
            ageGroup: '15-17',
            description: 'Teenagers create viral content promoting new artistic expression'
        },
        { 
            text: 'University art department receives major funding', 
            impact: 4,
            ageGroup: '18-20',
            description: 'Increased resources for university art programs'
        },
        { 
            text: 'Young artists protest against censorship', 
            impact: 3,
            ageGroup: '21-24',
            description: 'Protest movement led by young artists gains national attention'
        },
        { 
            text: 'Corporate art sponsorship program launched', 
            impact: 2,
            ageGroup: '25-34',
            description: 'Program supports working artists with corporate funding'
        },
        { 
            text: 'Parent groups organize art education workshops', 
            impact: 2,
            ageGroup: '35-44',
            description: 'Parents learn to support artistic expression in children'
        },
        { 
            text: 'Traditional art galleries host modern exhibitions', 
            impact: 1,
            ageGroup: '45-54',
            description: 'Bridging traditional and contemporary art appreciation'
        },
        { 
            text: 'Senior art appreciation clubs formed', 
            impact: 1,
            ageGroup: '55+',
            description: 'Clubs help seniors engage with modern art movements'
        }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    
    // Adjust event impact based on GDP
    const gdpFactor = gameState.economy.gdp / 1000000000; // Normalize GDP to billions
    const adjustedImpact = event.impact * (1 + (gdpFactor - 1) * 0.2); // 20% boost per billion in GDP
    
    // Handle age-specific events
    if (event.ageGroup) {
        const data = gameState.demographics[event.ageGroup];
        if (data) {
            const ageImpact = adjustedImpact * (1 + Math.random() * 0.5);
            const adoptionRate = (data.adopted / data.total) * 100;
            const newAdoptionRate = Math.max(0, Math.min(100, adoptionRate + ageImpact));
            
            data.adopted = Math.round(data.total * (newAdoptionRate / 100));
            data.femaleAdopted = Math.round(data.femaleTotal * (newAdoptionRate / 100) * 1.2);
            
            gameState.events.unshift({
                day: gameState.day,
                text: `${event.text} (${event.description})`,
                impact: adjustedImpact,
                ageGroup: event.ageGroup
            });
        }
    } else {
        gameState.ideologyMeter = Math.max(0, Math.min(100, gameState.ideologyMeter + adjustedImpact));
        gameState.events.unshift({
            day: gameState.day,
            text: event.text,
            impact: adjustedImpact
        });
    }
    
    if (gameState.events.length > 10) {
        gameState.events.pop();
    }
}

function updateUI() {
    // Update ideology meter
    const ideologyProgress = document.getElementById('ideologyProgress');
    const ideologyPercentage = document.getElementById('ideologyPercentage');
    if (ideologyProgress) ideologyProgress.style.width = `${gameState.ideologyMeter}%`;
    if (ideologyPercentage) ideologyPercentage.textContent = `${Math.round(gameState.ideologyMeter)}%`;
    
    // Update app users in both locations
    const tier1Users = document.getElementById('tier1Users');
    const tier2Users = document.getElementById('tier2Users');
    const tier3Users = document.getElementById('tier3Users');
    const tier4Users = document.getElementById('tier4Users');
    
    const tier1UsersDisplay = document.getElementById('tier1UsersDisplay');
    const tier2UsersDisplay = document.getElementById('tier2UsersDisplay');
    const tier3UsersDisplay = document.getElementById('tier3UsersDisplay');
    const tier4UsersDisplay = document.getElementById('tier4UsersDisplay');

    // Update App Statistics section
    if (tier1Users) tier1Users.textContent = gameState.app.tier1Users.toLocaleString();
    if (tier2Users) tier2Users.textContent = gameState.app.tier2Users.toLocaleString();
    if (tier3Users) tier3Users.textContent = gameState.app.tier3Users.toLocaleString();
    if (tier4Users) tier4Users.textContent = gameState.app.tier4Users.toLocaleString();

    // Update Creator's Platform section
    if (tier1UsersDisplay) tier1UsersDisplay.textContent = gameState.app.tier1Users.toLocaleString();
    if (tier2UsersDisplay) tier2UsersDisplay.textContent = gameState.app.tier2Users.toLocaleString();
    if (tier3UsersDisplay) tier3UsersDisplay.textContent = gameState.app.tier3Users.toLocaleString();
    if (tier4UsersDisplay) tier4UsersDisplay.textContent = gameState.app.tier4Users.toLocaleString();
    
    // Update economy
    const gdp = document.getElementById('gdp');
    const unemployment = document.getElementById('unemployment');
    const inflation = document.getElementById('inflation');

    if (gdp) gdp.textContent = gameState.economy.gdp.toLocaleString();
    if (unemployment) unemployment.textContent = gameState.economy.unemployment.toFixed(1);
    if (inflation) inflation.textContent = gameState.economy.inflation.toFixed(1);
    
    // Update demographics data
    const demographicsData = document.getElementById('demographicsData');
    if (demographicsData && gameState.demographics) {
        let totalPopulation = 0;
        let totalAdopted = 0;
        let totalFemalePopulation = 0;
        let totalFemaleAdopted = 0;

        demographicsData.innerHTML = Object.entries(gameState.demographics)
            .filter(([_, data]) => data && typeof data === 'object') // Filter out any undefined or invalid data
            .map(([ageGroup, data]) => {
                if (!data.total || !data.adopted || !data.femaleTotal || !data.femaleAdopted) {
                    return '';
                }

                totalPopulation += data.total;
                totalAdopted += data.adopted;
                totalFemalePopulation += data.femaleTotal;
                totalFemaleAdopted += data.femaleAdopted;

                const totalPercentage = ((data.adopted / data.total) * 100).toFixed(1);
                const femalePercentage = ((data.femaleAdopted / data.femaleTotal) * 100).toFixed(1);

                return `
                    <div class="demographics-row">
                        <div>${ageGroup}</div>
                        <div>${data.total.toLocaleString()}</div>
                        <div>${data.adopted.toLocaleString()}<span class="percentage">(${totalPercentage}%)</span></div>
                        <div>${data.femaleTotal.toLocaleString()}</div>
                        <div>${data.femaleAdopted.toLocaleString()}<span class="percentage">(${femalePercentage}%)</span></div>
                    </div>
                `;
            }).join('');

        // Update total stats
        const totalPopulationElement = document.getElementById('totalPopulation');
        const totalAdoptedElement = document.getElementById('totalAdopted');
        const totalFemalePopulationElement = document.getElementById('totalFemalePopulation');
        const totalFemaleAdoptedElement = document.getElementById('totalFemaleAdopted');

        if (totalPopulationElement) totalPopulationElement.textContent = totalPopulation.toLocaleString();
        if (totalAdoptedElement) totalAdoptedElement.textContent = totalAdopted.toLocaleString();
        if (totalFemalePopulationElement) totalFemalePopulationElement.textContent = totalFemalePopulation.toLocaleString();
        if (totalFemaleAdoptedElement) totalFemaleAdoptedElement.textContent = totalFemaleAdopted.toLocaleString();
    }
    
    // Update demographics chart
    if (demographicsChart && gameState.demographics) {
        try {
            const chartElement = document.getElementById('demographicsChart');
            if (chartElement && chartElement.getContext) {
                demographicsChart.data.datasets[0].data = Object.values(gameState.demographics)
                    .filter(d => d && typeof d === 'object') // Filter out any undefined or invalid data
                    .map(d => d.adopted || 0);
                demographicsChart.update('none'); // Use 'none' mode to prevent animation
            }
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }
    
    // Update events log
    const eventsLog = document.getElementById('eventsLog');
    if (eventsLog) {
        eventsLog.innerHTML = gameState.events.map(event => `
            <div class="event-item ${event.impact < 0 ? 'negative' : ''}">
                <strong>Day ${event.day}:</strong> ${event.text}
                <span class="float-end">${event.impact > 0 ? '+' : ''}${event.impact}%</span>
            </div>
        `).join('');
    }
    
    // Update map markers
    if (map) {
        updateMapMarkers();
    }

    // Update total users and viewers
    const totalUsersElement = document.getElementById('totalUsers');
    const totalViewersElement = document.getElementById('totalViewers');
    const monthlyRevenueElement = document.getElementById('monthlyRevenue');
    const totalRevenueElement = document.getElementById('totalRevenue');
    const maleViewersElement = document.getElementById('maleViewers');
    const femaleViewersElement = document.getElementById('femaleViewers');
    
    if (totalUsersElement) totalUsersElement.textContent = gameState.totalUsers.toLocaleString();
    if (totalViewersElement) totalViewersElement.textContent = gameState.totalViewers.toLocaleString();
    if (monthlyRevenueElement) monthlyRevenueElement.textContent = `$${gameState.app.monthlyRevenue.toLocaleString()}`;
    if (totalRevenueElement) totalRevenueElement.textContent = `$${gameState.app.totalRevenue.toLocaleString()}`;
    if (maleViewersElement) maleViewersElement.textContent = gameState.app.maleViewers.toLocaleString();
    if (femaleViewersElement) femaleViewersElement.textContent = gameState.app.femaleViewers.toLocaleString();
}

function updateMapMarkers() {
    // Clear existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
    // Calculate total population and adopted
    const totalPopulation = Object.values(gameState.demographics).reduce((sum, data) => sum + data.total, 0);
    const totalAdopted = Object.values(gameState.demographics).reduce((sum, data) => sum + data.adopted, 0);
    const totalFemalePopulation = Object.values(gameState.demographics).reduce((sum, data) => sum + data.femaleTotal, 0);
    const totalFemaleAdopted = Object.values(gameState.demographics).reduce((sum, data) => sum + data.femaleAdopted, 0);
    
    // Calculate total app users
    const totalAppUsers = Object.values(gameState.app).reduce((a, b) => a + b, 0);
    
    // Add new markers with custom icons
    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="marker-pin"></div>',
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
    
    // Add new markers
    gameState.cities.forEach(city => {
        // Calculate city's share of total population
        const cityPopulationShare = city.population / totalPopulation;
        const cityFemalePopulationShare = city.femalePopulation / totalFemalePopulation;
        
        // Calculate city's ideology based on demographics
        const cityAdopted = Math.round(totalAdopted * cityPopulationShare);
        const cityFemaleAdopted = Math.round(totalFemaleAdopted * cityFemalePopulationShare);
        
        // Update city ideology values
        city.ideology = (cityAdopted / city.population) * 100;
        city.femaleIdeology = (cityFemaleAdopted / city.femalePopulation) * 100;
        
        // Calculate city's app users
        const cityAppUsers = Math.round(totalAppUsers * cityPopulationShare);
        
        const marker = L.marker([city.lat, city.lng], { icon: icon })
            .bindPopup(`
                <div class="city-popup">
                    <h3>${city.name}</h3>
                    <p>Total Population: ${city.population.toLocaleString()} (${(cityPopulationShare * 100).toFixed(1)}%)</p>
                    <p>Adopted: ${cityAdopted.toLocaleString()} (${city.ideology.toFixed(1)}%)</p>
                    <p>Female Population: ${city.femalePopulation.toLocaleString()} (${(cityFemalePopulationShare * 100).toFixed(1)}%)</p>
                    <p>Female Adopted: ${cityFemaleAdopted.toLocaleString()} (${city.femaleIdeology.toFixed(1)}%)</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${city.ideology}%"></div>
                    </div>
                    <p>Overall Ideology: ${Math.round(city.ideology)}%</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${city.femaleIdeology}%"></div>
                    </div>
                    <p>Female Ideology: ${Math.round(city.femaleIdeology)}%</p>
                    <p>App Users: ${cityAppUsers.toLocaleString()}</p>
                </div>
            `)
            .addTo(map);
    });
}

// Add event listeners for economy controls
function initializeEconomyControls() {
    const controls = ['governmentSpending', 'interestRate', 'taxRate', 'artFunding'];
    
    controls.forEach(control => {
        const slider = document.getElementById(control);
        const valueDisplay = document.getElementById(`${control}Value`);
        
        if (slider && valueDisplay) {
            // Set initial value
            slider.value = gameState.economy.controls[control];
            valueDisplay.textContent = `${gameState.economy.controls[control]}%`;
            
            // Add change listener
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                gameState.economy.controls[control] = value;
                valueDisplay.textContent = `${value}%`;
            });
        }
    });
}

function initializeGallery() {
    const imageUpload = document.getElementById('imageUpload');
    const clearGallery = document.getElementById('clearGallery');
    const prevSlide = document.getElementById('prevSlide');
    const nextSlide = document.getElementById('nextSlide');
    const toggleSlideshow = document.getElementById('toggleSlideshow');
    const slideshow = document.getElementById('slideshow');

    // Load saved images from localStorage
    const savedImages = localStorage.getItem('galleryImages');
    if (savedImages) {
        try {
            gameState.gallery.images = JSON.parse(savedImages);
            updateSlideshow();
        } catch (error) {
            console.error('Error loading saved images:', error);
            gameState.gallery.images = [];
            localStorage.removeItem('galleryImages');
        }
    }

    // Handle image upload
    imageUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        let uploadSuccess = false;

        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressedImage = await compressImage(file);
                    gameState.gallery.images.push(compressedImage);
                    uploadSuccess = true;
                    try {
                        localStorage.setItem('galleryImages', JSON.stringify(gameState.gallery.images));
                    } catch (storageError) {
                        console.error('Storage quota exceeded:', storageError);
                        gameState.gallery.images.pop();
                        alert('Unable to save more images. Please clear the gallery first or try uploading smaller images.');
                        uploadSuccess = false;
                    }
                } catch (error) {
                    console.error('Error processing image:', error);
                    alert('Error processing image. Please try a different image.');
                }
            }
        }

        if (uploadSuccess) {
            updateSlideshow();
            startSlideshow(); // Restart slideshow after new upload
        }
    });

    // Handle clear gallery
    clearGallery.addEventListener('click', () => {
        gameState.gallery.images = [];
        gameState.gallery.currentIndex = 0;
        localStorage.removeItem('galleryImages');
        updateSlideshow();
        stopSlideshow();
    });

    // Handle navigation
    prevSlide.addEventListener('click', () => {
        if (gameState.gallery.images.length > 0) {
            gameState.gallery.currentIndex = (gameState.gallery.currentIndex - 1 + gameState.gallery.images.length) % gameState.gallery.images.length;
            updateSlideshow();
        }
    });

    nextSlide.addEventListener('click', () => {
        if (gameState.gallery.images.length > 0) {
            gameState.gallery.currentIndex = (gameState.gallery.currentIndex + 1) % gameState.gallery.images.length;
            updateSlideshow();
        }
    });

    // Handle play/pause
    toggleSlideshow.addEventListener('click', () => {
        gameState.gallery.isPlaying = !gameState.gallery.isPlaying;
        toggleSlideshow.textContent = gameState.gallery.isPlaying ? 'Pause' : 'Play';
        if (gameState.gallery.isPlaying) {
            startSlideshow();
        } else {
            stopSlideshow();
        }
    });

    // Start slideshow if there are images
    if (gameState.gallery.images.length > 0) {
        startSlideshow();
    }
}

function updateSlideshow() {
    const slideshow = document.getElementById('slideshow');
    if (!slideshow) return;

    // Clear existing images
    slideshow.innerHTML = '';

    // Add new images
    gameState.gallery.images.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = index === gameState.gallery.currentIndex ? 'active' : '';
        img.onload = () => {
            // Ensure the image is properly loaded before showing
            if (index === gameState.gallery.currentIndex) {
                img.style.opacity = '1';
            }
        };
        slideshow.appendChild(img);
    });

    // Update controls visibility
    const controls = document.querySelector('.slideshow-controls');
    if (controls) {
        controls.style.display = gameState.gallery.images.length > 0 ? 'flex' : 'none';
    }
}

function startSlideshow() {
    stopSlideshow(); // Clear any existing interval

    if (gameState.gallery.images.length > 1) {
        gameState.gallery.interval = setInterval(() => {
            if (gameState.gallery.isPlaying) {
                gameState.gallery.currentIndex = (gameState.gallery.currentIndex + 1) % gameState.gallery.images.length;
                updateSlideshow();
            }
        }, 3000); // Change image every 3 seconds
    }
}

function stopSlideshow() {
    if (gameState.gallery.interval) {
        clearInterval(gameState.gallery.interval);
        gameState.gallery.interval = null;
    }
}

// Update image compression function
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                const maxDimension = 600; // Reduced from 800 to save more space
                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress the image with lower quality
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); // Reduced quality to 0.5
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
} 