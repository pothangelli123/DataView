async function fetchPublicationData(subdomain, accessToken) {
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
    <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
        <s:Header>
            <a:Action s:mustUnderstand="1">RetrieveRequest</a:Action>
            <a:To s:mustUnderstand="1">https://${subdomain}.soap.marketingcloudapis.com/Service.asmx</a:To>
            <fueloauth xmlns="http://exacttarget.com">${accessToken}</fueloauth>
        </s:Header>
        <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">
            <RetrieveRequest>
             <ObjectType>Publication</ObjectType>
            <Properties>Name</Properties>
            <Properties>CreatedDate</Properties>
            <Properties>ID</Properties>
            </RetrieveRequest>
          </RetrieveRequestMsg>
        </s:Body>
    </s:Envelope>`;

    try {
        console.log('Sending SOAP request for Publication data...');
        const response = await fetch('/publicationRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subdomain, accessToken, soapEnvelope })
        });

        console.log('Response received:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Parsed SOAP data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching publication data:', error);
        throw error;
    }
}

function displayBounceData(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (data && data.length > 0) {
        // Add this new container div
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Create table header
        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        data.forEach(item => {
            const row = document.createElement('tr');
            Object.values(item).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // Append the table to the container instead of directly to resultsDiv
        tableContainer.appendChild(table);
        resultsDiv.appendChild(tableContainer);
    } else {
        resultsDiv.innerHTML = 'No publication data available.';
    }
}