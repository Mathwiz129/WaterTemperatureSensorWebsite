// Function to adjust timestamps correctly based on timezone
function getCorrectedTimestamp(rawTimestamp) {
    let localOffset = new Date().getTimezoneOffset() * 60; // Convert minutes to seconds
    return rawTimestamp + localOffset; // ✅ Fixes incorrect 4-hour offset
}

// Function to create or update the temperature chart
function updateChart(labels, tempHistory) {
    const ctx = document.getElementById("temperatureChart").getContext("2d");

    if (window.myChart) {
        window.myChart.destroy();
    }

    if (labels.length === 0 || tempHistory.length === 0) {
        console.error("No data available for the chart.");
        return;
    }

    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°F)",
                data: tempHistory,
                borderColor: "#28a745",
                backgroundColor: "rgba(40, 167, 69, 0.2)",
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Fetch latest temperature data from Firebase
async function getTemperatureData() {
    const firebaseUrl = "https://watertemp-databse-default-rtdb.firebaseio.com/sensor_data.json";

    try {
        const response = await fetch(firebaseUrl);
        if (!response.ok) throw new Error("Network error!");

        const data = await response.json();
        console.log("Fetched Firebase Data:", data);

        if (!data || Object.keys(data).length === 0) {
            document.getElementById("temperature").innerText = "No data available";
            return;
        }

        let latestEntry = null;
        let latestTimestamp = 0;
        let tempHistory = [];
        let labels = [];

        let currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
        let timeLimit = currentTime - (12 * 60 * 60); // ✅ Define cutoff for 12-hour filter

        for (let timestamp in data) {
            let entry = data[timestamp];
            let adjustedTimestamp = getCorrectedTimestamp(parseInt(timestamp));

            if (entry?.temperature && entry?.timestamp && adjustedTimestamp >= timeLimit) {
                labels.push(new Date(adjustedTimestamp * 1000).toLocaleString());
                tempHistory.push(entry.temperature);
            }
            if (adjustedTimestamp > latestTimestamp) {
                latestTimestamp = adjustedTimestamp;
                latestEntry = entry;
            }
        }

        console.log("Filtered Temperature History:", tempHistory); // Debugging log

        document.getElementById("temperature").innerText = `Temperature: ${latestEntry.temperature.toFixed(2)}°F`;
        updateChart(labels, tempHistory);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Fetch immediately and update every 30 seconds
getTemperatureData();
setInterval(getTemperatureData, 30000);