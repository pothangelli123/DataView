async function fetchSubscribeData(subdomain, accessToken) {
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
            <ObjectType>Subscriber</ObjectType>
            <Properties>Client.ID</Properties>
            <Properties>EmailAddress</Properties>      
            <Properties>UnsubscribedDate</Properties>
            <Properties>SubscriberKey</Properties>
        </RetrieveRequest>
          </RetrieveRequestMsg>
        </s:Body>
    </s:Envelope>`;

    try {
        console.log('Sending SOAP request for Subscribe data...');
        const response = await fetch('/subscribeRequest', {
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
        console.error('Error fetching subscribe data:', error);
        throw error;
    }
}