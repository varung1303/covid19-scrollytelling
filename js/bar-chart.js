class BarChart extends BaseVisualization {
    constructor(containerId, data) {
        super(containerId, data);
        this.margin = { top: 100, right: 100, bottom: 100, left: 200 };
        this.width = 960 - this.margin.left - this.margin.right;
        this.height = 600 - this.margin.top - this.margin.bottom;
        this.maxStages = 3; 
        this.years = [2021, 2022, 2023];
        this.selectedCountry = null;
        this.init();
    }

    init() {
        
        this.container.append("div")
            .attr("class", "controls-container")
            .style("margin-bottom", "20px");

        
        

        
        this.svg = this.container
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("opacity", 0);

        this.processData();
        this.addCountrySelect();
    }

    addCountrySelect() {
       
        const countries = Array.from(new Set(
            this.data
                .filter(d => d.location && d.location.trim()) 
                .map(d => d.location.trim()) 
        )).sort((a, b) => a.localeCompare(b)); 
        
        console.log("Available countries:", countries); // Debug log

        const selectContainer = this.container.select(".controls-container")
            .append("div")
            .style("margin-bottom", "10px");

        selectContainer.append("label")
            .attr("for", "country-select")
            .text("Select Country: ")
            .style("margin-right", "10px");

        
        const select = selectContainer.append("select")
            .attr("id", "country-select")
            .style("padding", "5px")
            .style("width", "200px")
            .on("change", (event) => {
                const selectedValue = event.target.value;
                console.log("Selected country:", selectedValue); // Debug log
                this.selectedCountry = selectedValue === "All Countries" ? null : selectedValue;
                console.log("Updated selectedCountry:", this.selectedCountry); // Debug log
                this.update(this.currentStage);
            });

        
        select.append("option")
            .attr("value", "All Countries")
            .text("All Countries");

        
        select.selectAll("option.country")
            .data(countries)
            .enter()
            .append("option")
            .attr("class", "country")
            .attr("value", d => d)
            .text(d => d);
    }

    processData() {
        
        this.data.forEach(d => {
            d.date = new Date(d.date);
            d.year = d.date.getFullYear();
            d.month = d.date.getMonth();
            d.people_vaccinated = +d.people_vaccinated || 0;
            d.people_fully_vaccinated = +d.people_fully_vaccinated || 0;
            d.total_boosters = +d.total_boosters || 0;
            d.location = d.location;
        });

        
        this.data.sort((a, b) => a.date - b.date);

        
        this.yearlyData = new Map();
        this.years.forEach(year => {
            this.yearlyData.set(year, this.data.filter(d => d.year === year));
        });
    }

    getDataForStage(stage) {
        if (!stage || stage < 1 || stage > this.maxStages) return [];

        
        const currentYear = this.years[stage - 1];
        
        
        let filteredData = this.data.filter(d => d.year === currentYear);

        
        if (this.selectedCountry && this.selectedCountry !== "All Countries") {
            console.log("Filtering for country:", this.selectedCountry);
            filteredData = filteredData.filter(d => d.location === this.selectedCountry);
        }

        console.log("Filtered data:", filteredData); 

        
        if (filteredData.length === 0) {
            return [];
        }

        // Group by month and aggregate values
        const monthlyData = Array.from(
            d3.group(filteredData, d => d.month),
            ([month, values]) => ({
                month,
                year: currentYear,
                people_vaccinated: this.selectedCountry ? 
                    d3.max(values, d => d.people_vaccinated) : 
                    d3.sum(values, d => d.people_vaccinated),
                people_fully_vaccinated: this.selectedCountry ? 
                    d3.max(values, d => d.people_fully_vaccinated) : 
                    d3.sum(values, d => d.people_fully_vaccinated),
                total_boosters: this.selectedCountry ? 
                    d3.max(values, d => d.total_boosters) : 
                    d3.sum(values, d => d.total_boosters)
            })
        ).sort((a, b) => a.month - b.month);

        
        const allMonths = Array.from({length: 12}, (_, i) => i);
        return allMonths.map(month => {
            const existingData = monthlyData.find(d => d.month === month);
            return existingData || {
                month,
                year: currentYear,
                people_vaccinated: 0,
                people_fully_vaccinated: 0,
                total_boosters: 0
            };
        });
    }


    update(stage) {
        if (!stage || stage < 1 || stage > this.maxStages) return;
        
        this.currentStage = stage; 
        const filteredData = this.getDataForStage(stage);
        
    

        const subgroups = ["people_vaccinated", "people_fully_vaccinated", "total_boosters"];
        const legendGroups = ["People Vaccinated", "People Fully Vaccinated", "Total Boosters"];

        
        if (filteredData.length === 0) {
            this.svg.selectAll("*").remove();
            this.svg.append("text")
                .attr("x", this.width / 2)
                .attr("y", this.height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text(`No data available for ${this.years[stage - 1]}${this.selectedCountry ? ` in ${this.selectedCountry}` : ''}`);
                
            this.svg.append("text")
                .attr("x", this.width / 2)
                .attr("y", this.height / 2 + 30)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "#666")
                .text("Data collection might be in progress or not yet available");
            return;
        } else {
            this.svg.selectAll("text").remove();
        }

        const groups = filteredData.map(d => d.month);

        const x = d3.scaleBand()
            .domain(groups)
            .range([0, this.width])
            .padding(0.2);

        const maxValue = d3.max(filteredData, d => 
            d.people_vaccinated + d.people_fully_vaccinated + d.total_boosters
        );

        const y = d3.scaleLinear()
            .domain([0, maxValue])
            .range([this.height, 0]);

        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeTableau10.slice(0, 3));

        
        const stackGenerator = d3.stack()
            .keys(subgroups)
            .value((d, key) => d[key]);

        const stackedData = stackGenerator(filteredData);

        const barGroups = this.svg.selectAll("g.bars")
            .data(stackedData, d => d.key);

        const barGroupsEnter = barGroups.enter()
            .append("g")
            .attr("class", "bars")
            .attr("fill", d => color(d.key));

        barGroupsEnter.merge(barGroups)
            .selectAll("rect")
            .data(d => d, d => d.data.month)
            .join(
                enter => enter.append("rect")
                    .attr("x", d => x(d.data.month))
                    .attr("width", x.bandwidth())
                    .attr("y", y(0))
                    .attr("height", 0)
                    .on("mouseover", (event, d) => this.handleMouseOver(event, d, color))
                    .on("mouseout", () => this.handleMouseOut())
                    .transition()
                    .duration(1000)
                    .attr("y", d => y(d[1]))
                    .attr("height", d => Math.max(0, y(d[0]) - y(d[1]))),
                update => update
                    .transition()
                    .duration(1000)
                    .attr("x", d => x(d.data.month))
                    .attr("y", d => y(d[1]))
                    .attr("height", d => Math.max(0, y(d[0]) - y(d[1]))),
                exit => exit
                    .transition()
                    .duration(500)
                    .attr("y", y(0))
                    .attr("height", 0)
                    .remove()
        );

        this.svg.selectAll(".axis").remove();

        this.svg.append("g")
            .attr("class", "axis axis-x")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(x).tickFormat(d => d3.timeFormat("%B")(new Date(2021, d))));

        this.svg.append("g")
            .attr("class", "axis axis-y")
            .call(d3.axisLeft(y).tickFormat(d => d3.format(".2s")(d)));

        const titleText = this.selectedCountry 
            ? `${this.selectedCountry} - ${this.years[stage - 1]} Vaccination Data`
            : `Global Vaccination Data - ${this.years[stage - 1]}`;

        this.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", this.width / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .text(titleText);

        this.addLabels();
        this.addLegend(legendGroups, color);

    

        
    }

    handleMouseOver(event, d, color) {
        const categoryKey = d3.select(event.target.parentNode).datum().key;
        const value = d.data[categoryKey];
        
        this.tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        
        this.tooltip.html(`
            <strong>${d.data.year}</strong><br>
            <strong>${categoryKey.replace(/_/g, ' ').toUpperCase()}</strong><br>
            ${d3.timeFormat("%B")(new Date(2021, d.data.month))}<br>
            Value: ${d3.format(",")(value)}
        `)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    }

    handleMouseOut() {
        this.tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    addLabels() {
        this.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", this.width / 2)
            .attr("y", this.height + 40)
            .text("Months")
            .style("font-size", "12px");

        this.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", -this.height / 2)
            .attr("y", -80)
            .attr("transform", "rotate(-90)")
            .text("Cumulative Vaccinations")
            .style("font-size", "12px");
    }

    addLegend(legendGroups, color) {
        const legendWidth = this.width;
        const itemWidth = legendWidth / legendGroups.length;
        
        const legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, ${-20})`);

        const legendItems = legend.selectAll("g")
            .data(legendGroups)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${i * itemWidth}, 0)`);

        legendItems.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => color(d.toLowerCase().replace(/ /g, '_')));

        legendItems.append("text")
            .attr("x", 25)
            .attr("y", 12)
            .text(d => d)
            .style("font-size", "12px");
    }
}