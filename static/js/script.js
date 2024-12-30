document.addEventListener('DOMContentLoaded', function() {
    loadLocations();
    addCalculateButtonEventListener();
});

function loadLocations() {
    fetch('/static/public/columns.json')
        .then(response => response.json())
        .then(data => {
            const locations = data.data_columns.filter(column => !["total_sqft", "bath", "bhk"].includes(column));
            const selectElement = document.getElementById('location');
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading locations:', error);
            alert('Failed to load locations. Please refresh the page.');
        });
}

function addCalculateButtonEventListener() {
    document.getElementById('calculate-price').addEventListener('click', function() {
        const totalPriceElement = document.querySelector('.total-price');
        const location = document.getElementById('location').value;
        const area = document.getElementById('area').value;
        const bathrooms = document.getElementById('bathrooms').value;
        const bhk = document.getElementById('bhk').value;

        if (location && area && bathrooms && bhk) {
            calculatePrice(location, area, bathrooms, bhk, totalPriceElement);
        } else {
            alert('Please fill all the fields.');
        }
    });
}

function calculatePrice(location, area, bathrooms, bhk, totalPriceElement) {
    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, area, bathrooms, bhk })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                totalPriceElement.textContent = `Price in lakhs: ${data.price}`;
            } else {
                alert(data.message || 'Prediction failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
}
