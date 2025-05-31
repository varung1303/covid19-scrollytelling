class CovidTheme {
    constructor(containerId) {
        this.container = d3.select(containerId);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.init();
    }

    init() {
        this.svg = this.container
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("position", "fixed")
            .style("top", 0)
            .style("left", 0)
            .style("z-index", -1)
            .style("pointer-events", "none");

        this.addVirusParticles();
        this.animate();
    }

    addVirusParticles() {
        const particleGroup = this.svg.append("g")
            .attr("class", "particles");

        // Define colors
        const colors = {
            red: {
                main: "rgba(239, 68, 68, 0.2)",     // Bright red
                secondary: "rgba(239, 68, 68, 0.15)" // Slightly lighter red
            },
            blue: {
                main: "rgba(59, 130, 246, 0.2)",    // Bright blue
                secondary: "rgba(59, 130, 246, 0.15)" // Slightly lighter blue
            }
        };

        for (let i = 0; i < 12; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = 30 + Math.random() * 40;
            const rotation = Math.random() * 360;
            const colorScheme = i % 2 === 0 ? colors.red : colors.blue;

            const virusGroup = particleGroup.append("g")
                .attr("class", "virus-particle")
                .attr("transform", `translate(${x},${y})`)
                .datum({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    size,
                    rotation,
                    rotationSpeed: (Math.random() - 0.5)
                });

            // Main circle
            virusGroup.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 15)
                .style("fill", colorScheme.main);

            // Add spikes with dots
            const numSpikes = 16;
            for (let j = 0; j < numSpikes; j++) {
                const angle = (j * 2 * Math.PI) / numSpikes;
                const spikeGroup = virusGroup.append("g")
                    .attr("transform", `rotate(${(j * 360) / numSpikes})`);

                // Spike
                spikeGroup.append("circle")
                    .attr("cx", 0)
                    .attr("cy", -25)
                    .attr("r", 4)
                    .style("fill", colorScheme.main);

                // Connection to main body
                spikeGroup.append("path")
                    .attr("d", "M 0,-15 L 0,-21")
                    .style("stroke", colorScheme.secondary)
                    .style("stroke-width", 3)
                    .style("stroke-linecap", "round");
            }

            // Add small circles inside
            const innerDots = 6;
            for (let k = 0; k < innerDots; k++) {
                const angle = (k * 2 * Math.PI) / innerDots;
                const radius = 8;
                virusGroup.append("circle")
                    .attr("cx", radius * Math.cos(angle))
                    .attr("cy", radius * Math.sin(angle))
                    .attr("r", 2)
                    .style("fill", colorScheme.secondary);
            }
        }
    }

    animate() {
        const particles = this.svg.selectAll(".virus-particle");
        
        const tick = () => {
            particles.each((d) => {
                d.x += d.vx;
                d.y += d.vy;
                d.rotation += d.rotationSpeed;

                if (d.x < 0 || d.x > this.width) d.vx *= -1;
                if (d.y < 0 || d.y > this.height) d.vy *= -1;
            });

            particles.attr("transform", d => 
                `translate(${d.x},${d.y}) scale(${d.size/30}) rotate(${d.rotation})`
            );
            
            requestAnimationFrame(tick);
        };

        tick();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.svg
            .attr("width", this.width)
            .attr("height", this.height);
    }
}