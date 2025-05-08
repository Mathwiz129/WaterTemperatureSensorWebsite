async function getTemperatureData() {
    const firebaseUrl = "https://watertemp-databse-default-rtdb.firebaseio.com/sensor_data.json";

    try {
        const response = await fetch(firebaseUrl);
        const data = await response.json();
        document.getElementById("temperature").innerText = `Temperature: ${data.temperature}°C`;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Fetch data **immediately** when the page loads
getTemperatureData();

// Fetch data **every 15 seconds**
setInterval(getTemperatureData, 15000);
