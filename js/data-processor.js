class DataProcessor {
    static processCovidCasesData(casesData) {
        const covidByCountryCode = new Map();
        const uniqueDates = new Set();

        // Process COVID data
        casesData.forEach(entry => {
            const countryCode = entry.Country_code;
            
            if (!covidByCountryCode.has(countryCode)) {
                covidByCountryCode.set(countryCode, []);
            }

            // Ensure numeric conversion and handle missing values
            const cumulativeCases = entry.Cumulative_cases ? +entry.Cumulative_cases : 0;
            const cumulativeDeaths = entry.Cumulative_deaths ? +entry.Cumulative_deaths : 0;

            // Convert date to a standard format
            const formattedDate = this.formatDate(entry.Date_reported);

            // Create an entry with the current cumulative data
            const dataEntry = {
                date: formattedDate,
                cumulativeCases: cumulativeCases,
                cumulativeDeaths: cumulativeDeaths
            };
            
            covidByCountryCode.get(countryCode).push(dataEntry);
            uniqueDates.add(formattedDate);
        });

        // Sort dates
        const sortedDates = Array.from(uniqueDates).sort((a, b) => 
            new Date(a) - new Date(b)
        );

        return {
            covidByCountryCode,
            sortedDates
        };
    }

    static formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${month.padStart(2, '0')}-${day.padStart(2, '0')}-${year}`;
    }
}