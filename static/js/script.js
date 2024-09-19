document.addEventListener('DOMContentLoaded', function() {
    loadLocations();
    addCalculateButtonEventListener();
});

function loadLocations() {
    fetch('/public/columns.json')
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
        console.log("hi"); // Debugging log

        const totalPriceElement = document.querySelector('.total-price');
        console.log(totalPriceElement); // Debugging log

        const location = document.getElementById('location').value;
        const area = document.getElementById('area').value;
        const bathrooms = document.getElementById('bathrooms').value;
        const bhk = document.getElementById('bhk').value;

        // Validate inputs
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
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            location: location,
            area: area,
            bathrooms: bathrooms,
            bhk: bhk
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Debugging log
        if (data.success) {
            console.log("hi"); // Debugging log
            console.log(totalPriceElement); // Debugging log
            totalPriceElement.textContent = `Price in lakhs: ${data.price}`;
        } else {
            console.error('Error in prediction:', data.message);
            alert('Error in prediction. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}








// document.addEventListener('DOMContentLoaded', function() {
//     // Load the JSON file and populate the dropdown
//     fetch('/public/columns.json')
//         .then(response => response.json())
//         .then(data => {
//             const locations = data.data_columns.filter(column => !["total_sqft", "bath", "bhk"].includes(column));
//             const selectElement = document.getElementById('location');
//             locations.forEach(location => {
//                 const option = document.createElement('option');
//                 option.value = location;
//                 option.textContent = location;
//                 selectElement.appendChild(option);
//             });
//         })
//         .catch(error => {
//             console.error('Error loading locations:', error);
//             alert('Failed to load locations. Please refresh the page.');
//         });

//     // Add event listener to the calculate button
//     document.getElementById('calculate-price').addEventListener('click', function() {
//         console.log("hi");
//         console.log(document.querySelector('.total-price'));
//         const location = document.getElementById('location').value;
//         const area = document.getElementById('area').value;
//         const bathrooms = document.getElementById('bathrooms').value;
//         const bhk = document.getElementById('bhk').value;

//         // Validate inputs
//         if (location && area && bathrooms && bhk) {
//             // Send the data to the Flask server
//             fetch('/predict', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     location: location,
//                     area: area,
//                     bathrooms: bathrooms,
//                     bhk: bhk
//                 })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log(data);
//                 if (data.success) {
//                     console.log("hi");
//                     console.log(document.querySelector('.total-price'));
//                     document.querySelector('.total-price').textContent = `Total price  in lakhs : ${data.price}`;
//                 } else {
//                     console.error('Error in prediction:', data.message);
//                     alert('Error in prediction. Please try again.');
//                 }
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 alert('An error occurred. Please try again.');
//             });
//         } else {
//             alert('Please fill all the fields.');
//         }
//     });
// });