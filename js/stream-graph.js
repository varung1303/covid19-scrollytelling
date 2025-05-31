class StreamGraph extends BaseVisualization {
    constructor(containerId, data) {
        super(containerId, data);
        this.margin = { top: 60, right: 50, bottom: 50, left: 70 };
        this.width = window.innerWidth * 0.6 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.uniqueDatesSet;
        this.uniqueVariants;
        this.currentEndIndex;
        this.visibleDates;
        this.scrollTimeout;
        this.init();
    }

    init() {
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

        this.xScale = d3.scaleTime().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);
        this.colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        this.addLabels();
        this.processData();
    }

    processData() {
        
        this.data = this.data.filter(dd => dd['variant'] != 'non_who' && dd['variant'] != 'others');
        this.data.forEach((d) => {
            d.date = new Date(d.date);
            d.num_sequences = +d.num_sequences;
            d.num_sequences_total = +d.num_sequences_total;
        });

        this.uniqueDatesSet = Array.from(new Set(this.data.map(d => d.date.toISOString().split("T")[0])))
            .map(dateStr => new Date(dateStr    ))
            .sort((a, b) => a - b);
        this.uniqueVariants = Array.from(new Set(this.data.map((d) => d.variant)));

        this.currentEndIndex = 5; // Initial index
        this.visibleDates = this.uniqueDatesSet.slice(0, this.currentEndIndex);

        const aggregatedData = this.calculateAggregatedData(this.visibleDates);
        this.renderGraph(aggregatedData);
    }

    renderGraph(aggregatedData) {
        const stack = d3
            .stack()
            .keys(this.uniqueVariants)
            .value((d, key) => d[key] || 0);

        const stackedData = stack(aggregatedData);

        this.xScale.domain(d3.extent(this.visibleDates));
        this.yScale.domain([0, 100]);

        const area = d3
            .area()
            .x((d) => this.xScale(d.data.date))
            .y0((d) => this.yScale(d[0]))
            .y1((d) => this.yScale(d[1]))
            .curve(d3.curveBasis);

        const layers = this.svg.selectAll(".layer").data(stackedData, (d) => d.key);

        layers
            .enter()
            .append("path")
            .attr("class", "layer")
            .attr("fill", (d) => this.colorScale(d.key))
            .attr("d", area)
            .style("opacity", 1)
            .on("mouseenter", (event, d) => {
                d3.selectAll(".layer").style("opacity", 0.3);
                d3.select(event.currentTarget).style("opacity", 1);
                this.tooltip
                    .html(`<strong>${d.key}</strong>`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 10}px`)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
            })
            .on("mouseleave", () => this.handleMouseLeave());

        layers.transition().duration(500).attr("d", area);

        layers.exit().remove();

        this.svg.select(".x-axis").remove();
        this.svg
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.height})`)
            .call(
                d3.axisBottom(this.xScale)
                    .ticks(6)
                    .tickFormat(d3.timeFormat("%b %d, %Y"))
            );

        this.svg.select(".y-axis").remove();
        this.svg
            .append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(this.yScale).tickFormat((d) => `${d}%`));
    }

    calculateAggregatedData(dates) {
        const aggregatedData = dates.map((date) => {
            const filteredData = this.data.filter((d) => d.date.getTime() === date.getTime());
            const aggregatedNumSequencesTotal = d3.sum(filteredData, (d) => d.num_sequences);

            const dateData = { date };
            this.uniqueVariants.forEach((variant) => {
                const aggregatedNumSequences = d3.sum(
                    filteredData.filter((d) => d.variant === variant),
                    (d) => d.num_sequences
                );

                dateData[variant] = (aggregatedNumSequences / aggregatedNumSequencesTotal) * 100 || 0;
            });

            return dateData;
        });

        return aggregatedData;
    }

    handleMouseEnter(event, d) {
        d3.selectAll(".layer").style("opacity", 0.3);
        d3.select(event.currentTarget).style("opacity", 1);
        this.tooltip
            .html(
                `<strong>${d.key}</strong>`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`)
            .classed("hidden", false);
    }

    handleMouseLeave() {
        d3.selectAll(".layer").style("opacity", 1);
        this.tooltip
        .transition()
        .duration(200)
        .style("opacity", 0);
    }

    update(step) {
        if (!step || step < 1 || step > 5) return;
        
        // Calculate how many dates to show based on the step
        const totalDates = this.uniqueDatesSet.length;
        this.currentEndIndex = Math.floor((step / 5) * totalDates);
        this.currentEndIndex = Math.max(5, Math.min(this.currentEndIndex, totalDates));
        
        this.visibleDates = this.uniqueDatesSet.slice(0, this.currentEndIndex);
        const newAggregatedData = this.calculateAggregatedData(this.visibleDates);
        this.renderGraph(newAggregatedData);
    }

    addLabels() {
        this.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", this.width / 2)
            .attr("y", this.height + 50)
            .attr("class", "axis-label")
            .text("Date");

        this.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -this.height / 2)
            .attr("y", -50)
            .attr("class", "axis-label")
            .text("Percentage of Total Sequences");
    }
}