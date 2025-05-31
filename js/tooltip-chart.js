class TooltipChart {
    constructor(tooltip, data, countryName) {
        this.tooltip = tooltip;
        this.data = data;
        this.countryName = countryName;
        this.margin = {top: 10, right: 10, bottom: 30, left: 40};
        this.width = 300 - this.margin.left - this.margin.right;
        this.height = 200 - this.margin.top - this.margin.bottom;
        this.currentDate = vizManager.getCurrentDate();
    }

    show(event) {
        this.tooltip.html("");
        
        this.tooltip.append("h3")
            .style("margin", "5px 0")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("color", "black")
            .text(this.countryName);
        
        this.tooltip.append("div")
            .attr("id", "tooltip-chart");

        const viewportWidth = window.innerWidth;
        const tooltipWidth = 350;
        const isRightSide = event.clientX > viewportWidth / 2;
        const leftPosition = isRightSide 
            ? `${event.clientX - tooltipWidth - 10}px`
            : `${event.clientX + 10}px`;

        this.tooltip
            .style("display", "block")
            .style("left", leftPosition)
            .style("top", (event.clientY - 10) + "px");

        this.render();
    }

    render() {
        const tooltipContainer = d3.select("#tooltip-chart");
        const parseDate = d3.timeParse("%m-%d-%Y");
        const formatMonthYear = d3.timeFormat("%b %Y");

        // Process data
        const validData = this.data.filter(entry => {
            const cases = +entry.cumulativeCases;
            const deaths = +entry.cumulativeDeaths;
            const date = parseDate(entry.date);
            const currentDate = parseDate(this.currentDate);
            return !isNaN(cases) && !isNaN(deaths) && 
                date !== null && 
                date <= currentDate;
        });

        if (validData.length === 0) {
            tooltipContainer.append("div").text("No data available");
            return;
        }

        validData.forEach(d => {
            d.parsedDate = parseDate(d.date);
            d.cases = +d.cumulativeCases;
            d.deaths = +d.cumulativeDeaths;
        });
        
        tooltipContainer
        .style("padding", "5px")
        .style("box-sizing", "border-box");

        // Create chart elements
        this.createHeader(tooltipContainer, validData, formatMonthYear);
        this.createChart(tooltipContainer, validData);
    }

    createHeader(container, data, formatMonthYear) {
        const lastDataPoint = data[data.length - 1];
        const lastDate = formatMonthYear(lastDataPoint.parsedDate);

        container.append("div")
            .style("font-weight", "bold")
            .style("margin-bottom", "5px")
            .style("text-align", "center")
            .style("color", "black")
            .text(lastDate);

        const statsContainer = container.append("div")
            .style("display", "flex")
            .style("justify-content", "space-between")
            .style("margin-bottom", "5px");

        statsContainer.append("div")
            .style("color", "steelblue")
            .text(`Cases: ${lastDataPoint.cases.toLocaleString()}`);

        statsContainer.append("div")
            .style("color", "red")
            .text(`Deaths: ${lastDataPoint.deaths.toLocaleString()}`);
    }

    createChart(container, data) {
        const chartContainer = container.append("div")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "5px")
            .style("background-color", "#f9f9f9");

        const svg = chartContainer.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top+10})`);
        
        // Set up scales
        const dateExtent = d3.extent(data, d => d.parsedDate);
        const maxCases = d3.max(data, d => d.cases);
        const maxDeaths = d3.max(data, d => d.deaths);
        const maxValue = Math.max(maxCases, maxDeaths);

        const x = d3.scaleTime()
            .domain(dateExtent)
            .range([0, this.width]);

        const y = d3.scaleLinear()
            .domain([0, maxValue])
            .range([this.height, 0]);

        const casesLine = d3.line()
            .x(d => x(d.parsedDate))
            .y(d => y(d.cases))
            .defined(d => !isNaN(d.cases) && d.cases > 0);

        const deathsLine = d3.line()
            .x(d => x(d.parsedDate))
            .y(d => y(d.deaths))
            .defined(d => !isNaN(d.deaths) && d.deaths > 0);

        const xAxis = svg.append("g")
                .attr("transform", `translate(0,${this.height})`)
                .call(d3.axisBottom(x)
                    .tickValues(dateExtent)
                    .tickFormat(d3.timeFormat("%b %Y"))
                );

        xAxis.select(".domain")
            .attr("stroke", "#000")
            .attr("stroke-width", 1);

        xAxis.selectAll(".tick line")
            .attr("stroke", "#000")
            .attr("stroke-width", 1);

        xAxis.selectAll("text")  
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .style("fill", "black");

        svg.append("line")
            .attr("x1", 0)
            .attr("x2", this.width)
            .attr("y1", y(maxCases))
            .attr("y2", y(maxCases))
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "5,5");

        svg.append("line")
            .attr("x1", 0)
            .attr("x2", this.width)
            .attr("y1", y(maxDeaths))
            .attr("y2", y(maxDeaths))
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "5,5");

        svg.append("text")
            .attr("x", this.width - 10)
            .attr("y", y(maxCases) - 5)
            .attr("text-anchor", "end")
            .attr("fill", "steelblue")
            .style("font-size", "12px")
            .text(maxCases.toLocaleString());

        svg.append("text")
            .attr("x", this.width - 10)
            .attr("y", y(maxDeaths) - 5)
            .attr("text-anchor", "end")
            .attr("fill", "red")
            .style("font-size", "12px")
            .text(maxDeaths.toLocaleString());

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", casesLine);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("d", deathsLine);
    }
}
