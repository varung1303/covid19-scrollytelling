class BubbleChart extends BaseVisualization {
    constructor(containerId, data) {
        super(containerId, data);
        this.margin = { top: 60, right: 50, bottom: 50, left: 70 };
        this.width = window.innerWidth * 0.6 - this.margin.left - this.margin.right;
        this.height = 600 - this.margin.top - this.margin.bottom;

        // this.width = (window.innerWidth * 0.75) - 100;
        // this.height = 600;
        this.sizeScale = d3.scaleSqrt().range([5, 80]);
        this.colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);
        this.simulation = null;
        this.tooltip = null;
        this.hasBeenRendered = false; // Track if the chart has ever been rendered
        this.init();
    }

    init() {
        this.svg = this.container
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Set up simulation but don't start it yet
        const maxRadius = Math.min(this.width, this.height) / 8;
        this.simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(5))
            .force("center", d3.forceCenter((this.width/2) - 50, this.height/2))
            .force("collision", d3.forceCollide(d => this.sizeScale(d.Cumulative_cases) + 2))
            .stop(); // Don't start the simulation until needed
        this.sizeScale.range([2, maxRadius]);

        this.processData();
        this.addLegend();
    }

    update(endDate) {
        if (this.hasBeenRendered) {
            return; // Do nothing if already rendered
        }

        // First time rendering
        let dateToUse = typeof endDate === 'string' ? new Date(endDate) : endDate;
        dateToUse = new Date(Math.max(this.minDate, Math.min(this.maxDate, dateToUse)));
        
        const filteredData = this.filterData(dateToUse);
        this.sizeScale.domain([0, d3.max(filteredData, d => d.Cumulative_cases)]);

        // Run the simulation for a fixed number of ticks before rendering
        // This will pre-calculate final positions
        this.simulation.nodes(filteredData);
        for (let i = 0; i < 300; i++) {
            this.simulation.tick();
        }

        // Create bubble groups with pre-calculated positions
        const bubbleGroups = this.svg.selectAll("g.bubble-group")
            .data(filteredData, d => d.Country)
            .enter()
            .append("g")
            .attr("class", "bubble-group")
            .attr("transform", d => `translate(
                ${Math.random() * this.width}, 
                ${Math.random() * this.height})`
            ); // Start from center

        // Add main circles with transition to final positions
        bubbleGroups.append("circle")
            .attr("r", 0)
            .attr("fill", "#fff")
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
            .on("mouseover", (event, d) => this.handleMouseOver(event, d))
            .on("mouseout", () => this.handleMouseOut())
            .transition()
            .duration(1000)
            .attr("r", d => this.sizeScale(d.Cumulative_cases));

        // Transition groups to their final positions
        bubbleGroups.transition()
            .duration(1000)
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

        // Add pie charts after circle transition
        bubbleGroups.each((d, i, nodes) => {
            setTimeout(() => {
                this.addPieChart(d, nodes[i]);
            }, i * 100);
        });

        this.hasBeenRendered = true; // Mark as rendered
    }


    processData() {
        // Process bubble data
        this.bubbleData = this.data.bubbleData.map(d => ({
            ...d,
            Date_reported: new Date(d.Date_reported),
            Cumulative_cases: +d.Cumulative_cases,
            Population: +d.Population,
            "Cases per Capita": +d.Cumulative_cases / +d.Population
        }));

        // Process variant data
        const latestYear = d3.max(this.data.variantData, d => +d.year);
        this.variantData = new Map(
            d3.group(
                this.data.variantData.filter(d => +d.year === latestYear),
                d => d.location
            )
        );

        this.minDate = d3.min(this.bubbleData, d => d.Date_reported);
        this.maxDate = d3.max(this.bubbleData, d => d.Date_reported);

        // Initial render will be called by update()
    }

    addLegend() {
        const allVariants = Array.from(
            new Set(this.data.variantData.map(d => d.variant))
        );

        const legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${this.width - 120}, 0)`);

        legend.selectAll("rect")
            .data(allVariants)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 25)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", (d, i) => this.colorScale(i / allVariants.length));

        legend.selectAll("text")
            .data(allVariants)
            .enter()
            .append("text")
            .attr("x", 30)
            .attr("y", (d, i) => i * 25 + 11)
            .text(d => d)
            .style("font-size", "12px")
            .style("alignment-baseline", "middle");
    }

    filterData(endDate) {
        const filtered = this.bubbleData.filter(d => d.Date_reported <= endDate);
        return Array.from(
            d3.group(filtered, d => d.Country),
            ([country, records]) => ({
                Country: country,
                Cumulative_cases: d3.sum(records, r => r.Cumulative_cases),
                Population: records[0].Population,
                WHO_region: records[0].WHO_region,
                "Cases per Capita": d3.sum(records, r => r.Cumulative_cases) / records[0].Population
            })
        );
    }
    
    addPieChart(d, node) {
        const countryVariants = this.variantData.get(d.Country);
        if (!countryVariants) return;

        const pie = d3.pie().value(v => v.perc_sequences)(countryVariants);
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(this.sizeScale(d.Cumulative_cases));

        d3.select(node)
            .selectAll("path")
            .data(pie)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (v, i, nodes) => this.colorScale(i / nodes.length))
            .attr("stroke", "none")
            .attr("opacity", 0)
            .on("mouseover", (event, v) => this.handlePieMouseOver(event, d, v))
            .on("mouseout", () => this.handleMouseOut())
            .transition()
            .duration(500) // Transition duration for each slice
            .delay((v, i) => i * 50)
            .attr("opacity", 1);
    }

    handleMouseOver(event, d) {
        d3.select(event.currentTarget)
            .attr("stroke", "#000")
            .attr("stroke-width", 3);

        this.tooltip.style("opacity", 0.9)
            .html(`
                <strong>${d.Country}</strong><br>
                Population: ${d.Population.toLocaleString()}<br>
                Cases: ${d.Cumulative_cases.toLocaleString()}<br>
                Cases per Capita: ${(d["Cases per Capita"]).toFixed(2)}
            `)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
    }

    handlePieMouseOver(event, d, v) {
        d3.select(event.currentTarget)
            .attr("stroke", "#000")
            .attr("stroke-width", 2);

        this.tooltip.style("opacity", 0.9)
            .html(`
                <strong>${d.Country}</strong><br>
                Population: ${d.Population.toLocaleString()}<br>
                Cases: ${d.Cumulative_cases.toLocaleString()}<br>
                Cases per Capita: ${(d["Cases per Capita"]).toFixed(2)}<br>
                <hr>
                <b>Variant</b>: ${v.data.variant}<br>
                <b>Percentage</b>: ${(+v.data.perc_sequences).toFixed(2)}%
            `)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
    }

    handleMouseOut() {
        this.svg.selectAll("circle")
            .attr("stroke", "#333")
            .attr("stroke-width", 1);

        this.svg.selectAll("path")
            .attr("stroke", "none");

        this.tooltip.style("opacity", 0);
    }
}