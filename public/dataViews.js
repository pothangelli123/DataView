const dataViews = [
    'Bounce', 'BusinessUnitUnsubscribes', 'Click', 'Complaint', 'Coupon',
    'EnterpriseAttribute', 'FTAF', 'GroupConnect Contact Subscriptions',
    'GroupConnect MobileLineOrphanContactView', 'Job', 'Journey',
    'Journey Activity', 'ListSubscribers', 'Open', 'PublicationSubscriber',
    'SMSMessageTracking', 'Sent', 'Subscribers', 'Unsubscribe'
];

document.addEventListener('DOMContentLoaded', () => {
    const dataViewsList = document.getElementById('dataViewsList');
    
    dataViews.forEach(view => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = view;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            fetchDataView(view);
        });
        li.appendChild(a);
        dataViewsList.appendChild(li);
    });
});

async function fetchDataView(dataView) {
    const accessToken = localStorage.getItem('accessToken');
    const subdomain = localStorage.getItem('subdomain');

    console.log('Fetching data view:', dataView);
    console.log('Subdomain:', subdomain);
    console.log('Access Token:', accessToken);

    if (!accessToken || !subdomain) {
        alert('Missing access token or subdomain. Please log in again.');
        window.location.href = '/';
        return;
    }

    try {
        let data;
        if (dataView === 'Bounce') {
            data = await fetchBounceData(subdomain, accessToken);
        }else if(dataView==='Open') {
            data = await fetchOpenData(subdomain,accessToken);
        }else if(dataView==='Click') {
            data = await fetchClickData(subdomain,accessToken);
        }else if(dataView==='Sent') {
            data = await fetchsentData(subdomain,accessToken);
        }else if(dataView==='BusinessUnitUnsubscribes') {
            data = await fetchUnsubEventData(subdomain,accessToken);
        }
        else {
            const response = await fetch('/soapRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subdomain, accessToken, dataView })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            data = await response.json();
            console.log('Received data:', data);
        }
        displayResults(data, dataView);
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while fetching ${dataView} data: ${error.message}. Please check the console for more details.`);
    }
}

function displayResults(data, dataView) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';

    if (data && data['soap:Envelope'] && data['soap:Envelope']['soap:Body']) {
        const results = data['soap:Envelope']['soap:Body']['RetrieveResponseMsg']['Results'];
        
        if (Array.isArray(results)) {
            // Create a wrapper div for the table
            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'table-wrapper';
            
            const table = document.createElement('table');
            const headerRow = table.insertRow();
            
            // Create table headers
            Object.keys(results[0]).forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            });

            // Populate table rows
            results.forEach(result => {
                const row = table.insertRow();
                Object.values(result).forEach(value => {
                    const cell = row.insertCell();
                    cell.textContent = value;
                });
            });

            // Append the table to the wrapper, then the wrapper to the container
            tableWrapper.appendChild(table);
            resultContainer.appendChild(tableWrapper);
        } else {
            resultContainer.textContent = 'No results found.';
        }
    } else {
        resultContainer.textContent = 'Invalid response format.';
    }
}