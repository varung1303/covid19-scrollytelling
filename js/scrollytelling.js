class Scrollytelling {
    constructor(containerSelector, narrativeStages, vizManager) {
        this.container = d3.select(containerSelector);
        this.narrativeStages = narrativeStages;
        this.vizManager = vizManager;
        this.activeStep = -1;
        this.observer = null;
        this.steps = [];
    }

    init() {
        this.createSteps();
        this.setupIntersectionObserver();
    }

    createSteps() {
        // Clear any existing steps
        this.container.selectAll("*").remove();
        this.steps = [];

        // Create new steps
        this.narrativeStages.map((stage, index) => {
            const step = this.container.append("div")
                .attr("class", "step")
                .attr("data-step", index)
                .attr("data-date", stage.date)
                .attr("data-visualization", stage.visualization);

            step.append("h3")
                .text(stage.title);

            step.append("p")
                .text(stage.narrative);
            
            this.steps.push(step.node());
        });
    }

    setupIntersectionObserver() {
        // Clean up existing observer if it exists
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const step = entry.target;
                    const currentDate = step.getAttribute('data-date');
                    const vizType = step.getAttribute('data-visualization');
                    
                    // Update active state
                    this.steps.forEach(s => s.classList.remove('active'));
                    step.classList.add('active');

                    // Get the step value if it's a stream graph
                    const stepValue = vizType === 'stream-graph' || vizType === 'bar-chart' ? 
                    this.narrativeStages[step.getAttribute('data-step')].step : 
                    currentDate;

                    // Update visualizations
                    this.vizManager.updateAll(stepValue, vizType);
                }
            });
        }, {
            threshold: 0.75,
            rootMargin: '-20% 0px -20% 0px'
        });

         // Verify steps exist before observing
         if (this.steps && this.steps.length > 0) {
            this.steps.forEach(step => {
                if (step) {
                    this.observer.observe(step);
                }
            });
        } else {
            console.error('No steps found to observe');
        }
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.steps = [];
        this.container.selectAll("*").remove();
    }
}