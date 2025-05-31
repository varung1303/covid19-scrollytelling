class ChoroplethMap extends BaseVisualization {
    constructor(containerId, data) {
        super(containerId, data);
        this.width = 960;
        this.height = 500;
        this.projection = d3.geoNaturalEarth1()
            .scale(this.width / 6.5)
            .translate([this.width / 2, this.height / 2]);
        this.pathGenerator = d3.geoPath().projection(this.projection);
        this.bins = [
            { max: 1000000, label: "1M" },
            { max: 5000000, label: "5M" },
            { max: 10000000, label: "10M" },
            { max: 20000000, label: "20M" },
            { max: 30000000, label: "30M" },
            { max: 50000000, label: "50M" },
            { max: Infinity, label: "50M+" }
        ];
        this.init();
    }

    init() {
        // Create the SVG element
        this.svg = this.container
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        // Create tooltip
        this.tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("display", "none");

        this.setupMap();
        this.addLegend();
    }

    setupMap() {
        const mapGroup = this.svg.append("g")
            .attr("id", "countries-group");

        this.countryPaths = mapGroup
            .selectAll("path")
            .data(this.data.geoData.features)
            .enter()
            .append("path")
            .attr("d", this.pathGenerator)
            .attr("fill", d => {
                const countryCode = d.id || d.properties.iso_a3;
                const countryCovid = this.data.covidData.get(countryCode);
                if (countryCovid && countryCovid.length > 0) {
                    return this.getBinColor(countryCovid[0].cumulativeCases);
                }
                return "#e0e0e0";
            })
            .attr("stroke", "#aaa")
            .attr("stroke-width", 0.5)
            .on("mouseover", (event, d) => this.handleMouseOver(event, d))
            .on("mouseout", (event, d) => this.handleMouseOut(event, d));
    }

    addLegend() {
        const legendWidth = 200;
        const legendHeight = 20;
    
        const legend = this.svg.append("g")
            .attr("transform", `translate(${this.width - legendWidth - 120}, ${this.height - 50})`);
    
        // Create color scale using d3.interpolateBlues
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, this.bins.length - 1]);
    
        // Create a scale that matches the bin positions
        const binScale = d3.scaleLinear()
            .domain([0, this.bins.length])
            .range([0, legendWidth]);

        legend.selectAll("rect")
            .data(this.bins)
            .enter()
            .append("rect")
            .attr("x", (d, i) => (legendWidth / this.bins.length) * i)
            .attr("y", 0)
            .attr("width", legendWidth / this.bins.length)
            .attr("height", legendHeight)
            .style("fill", (d, i) => colorScale(i));
    
        // Create an axis with ticks at the start and end of rectangles
        const legendAxis = d3.axisBottom(binScale)
            .tickValues([0, ...this.bins.map((bin, i) => i + 1)])
            .tickFormat((d, i) => {
                return d === 0 ? "0" : (i < this.bins.length ? this.bins[i-1].label : this.bins[i-1].label);
            });
    
        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis)
            .selectAll("text")
            .attr("x", 0)
            .attr("text-anchor", "middle");
    
        legend.append("text")
            .attr("x", legendWidth / 2)
            .attr("y", legendHeight + 30)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Confirmed COVID-19 Cases");
    }

    handleMouseOver(event, d) {
        const countryCode = d.id || d.properties.iso_a3;
        const countryName = d.properties.name;
        const countryCovid = this.data.covidData.get(countryCode);

        d3.select(event.target)
        .attr("stroke", "#000") 
        .attr("stroke-width", 2);  

        if (countryCovid && countryCovid.length > 0) {
            this.tooltip.html("");
            const tooltipChart = new TooltipChart(this.tooltip, countryCovid, countryName);
            tooltipChart.show(event);
        }
    }

    handleMouseOut(event, d) {
        d3.select(event.target)
            .attr("stroke", "#aaa")
            .attr("stroke-width", 0.5);

        this.tooltip.style("display", "none");
    }

    updateColors(date) {
        this.countryPaths.attr("fill", d => {
            const countryCode = d.id || d.properties.iso_a3;
            const countryCovid = this.data.covidData.get(countryCode);
            
            if (countryCovid) {
                const matchingEntry = countryCovid.find(entry => entry.date === date);
                if (matchingEntry) {
                    return this.getBinColor(matchingEntry.cumulativeCases);
                }
            }
            return "#e0e0e0";
        });
    }

    getBinColor(cumulativeCases) {    
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, this.bins.length - 1]);
    
        const binIndex = this.bins.findIndex(bin => cumulativeCases <= bin.max);
        return colorScale(binIndex);
    }

    update(date) {
        this.updateColors(date);
    }
}