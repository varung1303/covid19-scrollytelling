class VisualizationManager {
    constructor() {
        this.visualizations = new Map();
        this.currentDate = null;
        this.currentViz = "map";
        this.containers = new Map();
    }

    addVisualization(id, visualization) {
        this.visualizations.set(id, visualization);
        this.containers.set(id, document.querySelector(`#${id}`));
    }

    updateAll(date, vizType) {
        this.currentDate = date;
        
        // Case 1: visualization key is present and has a value
        if (vizType && vizType !== '') {
            const container = this.containers.get(vizType);
            if (!container) {
                console.warn('Container not found:', vizType);
                return;
            }

            // If coming from a hidden state or different visualization
            if (!this.currentViz || vizType !== this.currentViz) {
                // Hide all other visualizations first
                this.containers.forEach((cont, id) => {
                    if (id !== vizType) {
                        cont.classList.add('hidden');
                        cont.classList.remove('visible');
                    }
                });

                // Show the new visualization
                container.classList.remove('hidden');
                container.classList.add('visible');
                this.currentViz = vizType;
            }

            // Update the visualization
            if (this.visualizations.has(vizType)) {
                this.visualizations.get(vizType).update(date);
            }
        }
        // Case 2: visualization key is present but empty string
        else if (vizType === '') {
            // Hide all visualizations
            this.containers.forEach(container => {
                container.classList.add('hidden');
                container.classList.remove('visible');
            });
            this.currentViz = null;
        }
        // If visualization key is not present at all, keep current visualization
    }

    getCurrentDate() {
        return this.currentDate;
    }
}

class BaseVisualization {
    constructor(containerId, data) {
        this.container = d3.select(containerId);
        this.data = data;
    }

    init() {
        // To be implemented by child classes
    }

    update(date) {
        // To be implemented by child classes
    }
}