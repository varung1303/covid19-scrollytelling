
const vizManager = new VisualizationManager();

const covidTheme = new CovidTheme("#covid-theme");

Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("dataset/case_load.csv"),
    d3.csv("dataset/filtered_vaccinations.csv"),
    d3.csv("dataset/covid-variants.csv"),
    d3.csv("dataset/cleaned_bubble_chart_data.csv"),
    d3.csv("dataset/grouped_covid_variants.csv")
]).then(([geoData, case_load_data, vaccination_data, covid_variants_data, bubble_data, variant_data]) => {
    try {
        // Process data
        const processedCaseLoadData = DataProcessor.processCovidCasesData(case_load_data);
        const bubbleMaxDate = d3.max(bubble_data, d => new Date(d.Date_reported));
        
        // Initialize choropleth map
        const map = new ChoroplethMap("#map", {
            geoData: geoData,
            covidData: processedCaseLoadData.covidByCountryCode,
            dates: processedCaseLoadData.sortedDates
        });

        const bubbleChart = new BubbleChart("#bubble-chart", {
            bubbleData: bubble_data,
            variantData: variant_data
        });

        const barChart = new BarChart("#bar-chart", vaccination_data);

        const streamGraph = new StreamGraph("#stream-graph", covid_variants_data);

        // Add visualizations to manager
        vizManager.addVisualization("map", map);
        vizManager.addVisualization("bubble-chart", bubbleChart);
        vizManager.addVisualization("bar-chart", barChart);
        vizManager.addVisualization("stream-graph", streamGraph);

        // Setup scrollytelling with narrative stages
        const narrativeStages = [
            // Choropleth Map stages
            {
                date: processedCaseLoadData.sortedDates[0],
                title: "",
                narrative: ``,
                visualization: "map"
            },
            {
                date: processedCaseLoadData.sortedDates[0],
                title: "The Beginning",
                narrative: "In late 2019, the world faced an unprecedented challenge as reports emerged of a mysterious respiratory illness in Wuhan, China. Few could have predicted how this moment would reshape our global society.",
                visualization: "map"
            },
            {
                date: processedCaseLoadData.sortedDates[Math.floor(processedCaseLoadData.sortedDates.length * 0.2)],
                title: "Initial Spread",
                narrative: "As COVID-19 began its global journey, countries scrambled to respond. What started as isolated cases quickly evolved into localized outbreaks, challenging our understanding of pandemic response in the modern era.",
                visualization: "map"
            },
            {
                date: processedCaseLoadData.sortedDates[Math.floor(processedCaseLoadData.sortedDates.length * 0.4)],
                title: "Global Crisis Unfolds",
                narrative: "By mid-2020, the virus had reached nearly every corner of the globe. Healthcare systems worldwide faced unprecedented strain as case numbers soared, revealing both vulnerabilities and strengths in global health infrastructure.",
                visualization: "map"
            },
            {
                date: processedCaseLoadData.sortedDates[Math.floor(processedCaseLoadData.sortedDates.length * 0.6)],
                title: "Waves of Impact",
                narrative: "Different regions experienced distinct waves of infection at different times, highlighting how geography, policy decisions, and social factors influenced the pandemic's spread. No two countries shared exactly the same story.",
                visualization: "map"
            },
            {
                date: processedCaseLoadData.sortedDates[Math.floor(processedCaseLoadData.sortedDates.length * 0.8)],
                title: "Evolving Response",
                narrative: "As understanding of the virus improved, countries adapted their strategies. Some found success in aggressive containment, while others struggled with balancing public health measures and economic impacts.",
                visualization: "map"
            },
            // {
            //     date: processedCaseLoadData.sortedDates[processedCaseLoadData.sortedDates.length - 1],
            //     title: "Peak of Cases",
            //     narrative: "Many countries experienced multiple waves of infections, stretching healthcare systems to their limits.",
            //     visualization: "map"
            // },
            // Bubble Chart Stage
            {
                date: bubbleMaxDate,
                title: "Global Population Impact and Variant Distribution",
                narrative: "Looking at the bigger picture, we can see how population size and case numbers tell different stories across nations. The varying sizes of these bubbles reveal stark disparities in how different countries were affected.",
                visualization: "bubble-chart"
            },
            {
                date: bubbleMaxDate,
                narrative: "Larger nations naturally saw higher total case numbers, population size alone didn't determine impact. Some smaller countries experienced disproportionately high case rates, while some populous nations managed to maintain relatively lower rates through strict containment measures.",
                visualization: "bubble-chart"
            },
            {
                date: bubbleMaxDate,
                narrative: "The variant distribution within each country tells an even more nuanced story - showing how global travel patterns, timing of outbreaks, and local containment measures influenced which variants became dominant in different regions. This complex interplay of factors challenges simple assumptions about how a pandemic spreads across populations of different sizes.",
                visualization: "bubble-chart"
            },
            {
                title: "Challenges simple assumptions about how a pandemic spreads across populations of different sizes.",
                visualization: ''
            },
            // Transition to Variants data
            {
                date: processedCaseLoadData.sortedDates[Math.floor(processedCaseLoadData.sortedDates.length * 0.7)],
                step: 1, // Add step value for stream graph
                title: "The Early Dominance of Ancestral Strains",
                narrative: "In the early months of the pandemic, the viral landscape was simple—ancestral strains reigned supreme as scientists rushed to sequence and understand the virus.",
                visualization: "stream-graph"
            },
            // Stream graph stages
            {
                date: processedCaseLoadData.sortedDates[Math.floor(processedCaseLoadData.sortedDates.length * 0.8)],
                step: 2,
                title: "The Rise of Alpha and Beta Variants",
                narrative: "The emergence of Alpha and Beta variants marked our first experience with how the virus could evolve. These variants demonstrated increased transmissibility, forcing us to adapt our response strategies.",
                visualization: "stream-graph"
            },
            {
                date: processedCaseLoadData.sortedDates[Math.floor(processedCaseLoadData.sortedDates.length * 0.9)],
                step: 3,
                title: "The Variant Race",
                narrative: "Gamma and Mu made fleeting appearances, gaining local traction before being outpaced by the more dominant Delta and Omicron waves.",
                visualization: "stream-graph"
            },
            {
                date: processedCaseLoadData.sortedDates[Math.floor(processedCaseLoadData.sortedDates.length * 0.95)],
                step: 4,
                title: "The Global Spread of Delta",
                narrative: "The Delta variant marked a turning point, showing how a single variant could become globally dominant. Its increased transmissibility and severity sparked renewed concern worldwide.",
                visualization: "stream-graph"
            },
            {
                date: processedCaseLoadData.sortedDates[processedCaseLoadData.sortedDates.length - 1],
                step: 5,
                title: "The Omicron Era",
                narrative: "Omicron's arrival changed our understanding of the virus once again. Its high transmissibility but often milder symptoms in vaccinated individuals shifted how we viewed the pandemic's future.",
                visualization: "stream-graph"
            },
            // Transition to Vaccination Data
            // Bar Chart stages
            // In your narrative stages configuration
            {
                step: 1,
                title: "2021 Vaccination Progress",
                narrative: "2021 marked the first full year of global vaccination efforts, with countries worldwide implementing massive immunization programs.",
                visualization: "bar-chart"
            },
            {
                step: 2,
                title: "2022 Vaccination Coverage",
                narrative: "Throughout 2022, vaccination programs expanded significantly with the introduction of booster doses and continued primary vaccinations.",
                visualization: "bar-chart"
            },
            {
                step: 3,
                title: "2023 Current Status",
                narrative: "In 2023, while primary vaccination rates stabilized, the focus shifted to maintaining immunity through strategic booster programs.",
                visualization: "bar-chart"
            },
            {
                date: null
            }
        ];

        const scrollytelling = new Scrollytelling('.scroll-steps', narrativeStages, vizManager);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => scrollytelling.init());
        } else {
            scrollytelling.init();
        }

        vizManager.updateAll(narrativeStages[0].date, "map");
    } catch (error) {
        console.error("Error initializing visualizations:", error);
    }

}).catch(error => {
    console.error("Error loading data:", error);
});

window.addEventListener('error', function (e) {
    console.error('Global error handler:', e.error);
});
window.addEventListener('resize', () => covidTheme.resize());

document.addEventListener('DOMContentLoaded', function () {
    const intro = document.querySelector('.intro');
    const outro = document.querySelector('.outro');
    const stickyContainer = document.querySelector('.sticky-container');

    // Initialize visualization containers
    const mapContainer = document.querySelector('#map');
    const barChartContainer = document.querySelector('#bar-chart');
    const streamGraphContainer = document.querySelector('#stream-graph');
    const bubbleChartContainer = document.querySelector('#bubble-chart');

    function handleScroll() {
        const introBottom = intro.getBoundingClientRect().bottom;
        const outroTop = outro.getBoundingClientRect().top;

        if (introBottom <= 70 && outroTop > 560) {
            stickyContainer.classList.add('visible');
            mapContainer.classList.remove('hidden');
            mapContainer.classList.add('visible');
        } else {
            stickyContainer.classList.remove('visible');
            mapContainer.classList.add('hidden');
            mapContainer.classList.remove('visible');
        }
        if(
            barChartContainer.classList.contains('visible') ||
            streamGraphContainer.classList.contains('visible') || 
            bubbleChartContainer.classList.contains('visible') ||
            vizManager.currentViz == null
        ){
            mapContainer.classList.remove('visible');
            mapContainer.classList.add('hidden');
        } 
    }

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    if (!mapContainer || !barChartContainer || !streamGraphContainer || !bubbleChartContainer) {
        console.error('Visualization containers not found');
        return;
    }

    [barChartContainer, streamGraphContainer, bubbleChartContainer].forEach(container => {
        container.classList.add('hidden');
        container.classList.remove('visible');
    });

});