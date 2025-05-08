async function getTemperatureData() {
    const firebaseUrl = "https://watertemp-databse-default-rtdb.firebaseio.com/sensor_data.json";

    try {
        const response = await fetch(firebaseUrl);
        const data = await response.json(); 

        // Access temperature and timestamp directly
        let latestTemperature = data.temperature;
        let latestTimestamp = data.timestamp;

        // Convert timestamp to readable format
        let formattedTime = new Date(latestTimestamp * 1000).toLocaleString();

        document.getElementById("temperature").innerText = `Temperature: ${latestTemperature}°C`;
        document.getElementById("timestamp").innerText = `Last updated: ${formattedTime}`;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Fetch immediately and update every 15 seconds
getTemperatureData();
setInterval(getTemperatureData, 15000);