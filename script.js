// Function to create or update the temperature chart
function updateChart(labels, tempHistory) {
    console.log("Updating Chart with:", tempHistory); // Debugging log

    const ctx = document.getElementById("temperatureChart").getContext("2d");

    if (window.myChart) {
        window.myChart.destroy(); // Prevent overlapping charts
    }

    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°F)",  // ✅ Ensures graph shows Fahrenheit values
                data: tempHistory,          // ✅ Uses direct Firebase Fahrenheit data
                borderColor: "#007bff",
                backgroundColor: "rgba(0, 123, 255, 0.2)",
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "time",
                    time: { unit: "hour" },  // ✅ Hourly marks on X-axis
                    ticks: { source: "auto", autoSkip: false, stepSize: 1 } 
                },
                y: { beginAtZero: false }
            }
        }
    });
}

async function getTemperatureData() {
    const firebaseUrl = "https://watertemp-databse-default-rtdb.firebaseio.com/sensor_data.json";

    try {
        const response = await fetch(firebaseUrl);
        if (!response.ok) throw new Error("Network error!");

        const data = await response.json();
        console.log("Fetched Firebase Data:", data); // Debugging log to verify incoming data

        if (!data || Object.keys(data).length === 0) {
            document.getElementById("temperature").innerText = "No data available";
            return;
        }

        let latestEntry = null;
        let latestTimestamp = 0;
        let tempHistory = [];
        let labels = [];

        let timestamps = Object.keys(data).map(ts => parseInt(ts)); // Get all timestamps
        let earliestTime = Math.min(...timestamps);
        let currentTime = Math.floor(Date.now() / 1000);
        let twelveHoursAgo = currentTime - (12 * 60 * 60);
        let timeLimit = earliestTime > twelveHoursAgo ? earliestTime : twelveHoursAgo;

        // Process data & filter
        for (let timestamp in data) {
            let entry = data[timestamp];
            if (entry?.temperature && entry?.timestamp && entry.timestamp >= timeLimit) {
                labels.push(new Date((entry.timestamp + (4 * 3600)) * 1000).toLocaleString(undefined, {
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }));
                tempHistory.push(entry.temperature); // ✅ Using Firebase Fahrenheit value directly
            }
            if (entry.timestamp > latestTimestamp) {
                latestTimestamp = entry.timestamp;
                latestEntry = entry;
            }
        }

        console.log("Processed Temperature History:", tempHistory); // Debugging log

        // ✅ Directly display the Fahrenheit temperature stored in Firebase (NO extra conversion!)
        document.getElementById("temperature").innerText = `Temperature: ${latestEntry.temperature.toFixed(2)}°F`;
        updateChart(labels, tempHistory);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Fetch immediately and update every 15 seconds
getTemperatureData();
setInterval(getTemperatureData, 15000);