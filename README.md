# COVID-19 Global Impact Visualization

An interactive scrollytelling visualization that explores the global impact of the COVID-19 pandemic through multiple data perspectives. This project combines various visualization techniques to tell the story of how the pandemic evolved from its early stages through vaccination efforts.

## Features

### 1. Interactive Visualizations
- **Choropleth Map**: Shows the geographical spread of COVID-19 cases worldwide
- **Bubble Chart**: Illustrates the relationship between population size, case numbers, and variant distribution
- **Stream Graph**: Displays the evolution and distribution of COVID-19 variants over time
- **Bar Chart**: Visualizes vaccination progress across different countries and years

### 2. Scrollytelling Interface
- Narrative-driven exploration of the pandemic timeline
- Smooth transitions between different visualization types
- Interactive elements with detailed tooltips
- Responsive design for various screen sizes

## Technical Stack

- **D3.js**: Core visualization library
- **HTML/CSS**: Structure and styling
- **JavaScript (ES6+)**: Core programming language

## Data Sources

The visualization uses several datasets:
- WHO COVID-19 Dashboard: This dataset provides global statistics on cases, fatalities, and vaccination efforts. Data was pre-processed for consistent formatting to facilitate comparisons across countries and timelines.  

- Our World In Data: Offering detailed statistics on cases and vaccination rates, this dataset was refined for regional analyses. It ensures depth in understanding vaccination progress globally.  

- Johns Hopkins COVID-19 Repository: A comprehensive dataset that delivers global and U.S.-specific case data. It underwent cleaning to remove anomalies and maintain consistency for effective integration.  

- Kaggle Community Datasets: Aggregating insights on SARS-CoV-2 variants, these datasets supported the development of variant-specific visualizations. Pre-processing focused on detecting anomalies and integrating data across sources.  

## Features in Detail

### Choropleth Map
- Interactive world map showing COVID-19 case distribution
- Color gradient indicating case severity
- Tooltip with detailed country-specific information
- Timeline-based data updates

### Bubble Chart
- Size of bubbles represents total case numbers
- Pie chart segments show variant distribution
- Interactive tooltips with population and case statistics
- Force-directed layout for optimal visualization

### Stream Graph
- Temporal view of variant evolution
- Interactive hover effects
- Smooth animations for data transitions
- Clear color coding for different variants

### Bar Chart
- Yearly vaccination progress
- Multiple vaccination metrics (first dose, fully vaccinated, boosters)
- Country-specific filtering
- Interactive legend and tooltips

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/asu-cse578-f2024/covid19-scrollytelling.git
```
2. Set up a local server (e.g. using Python)
```bash
python -m http.server 8000
```
3. Open in browser http://localhost:8000
