require('dotenv').config();

const clientId = process.env.PAYPAL_CLIENTID
const secret = process.env.PAYPAL_SECRET
const baseUrl = process.env.PAYPAL_BASE_URL
const serverUrl = process.env.SERVER_BASE_URL

const getToken = async () => {

    const url = baseUrl + "/v1/oauth2/token";

    const credentials = `${clientId}:${secret}`;
    const base64Credentials = btoa(credentials);

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${base64Credentials}`,
    };

    const body = new URLSearchParams({ grant_type: "client_credentials" });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error fetching token:", error);
    }
};

const createOrder = async () => {
    const token = await getToken();

    const response = await fetch(baseUrl + '/v2/checkout/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
            "intent": "CAPTURE",
            "payment_source": {
                "paypal": {
                    "experience_context": {
                        "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                        "landing_page": "LOGIN",
                        "shipping_preference": "NO_SHIPPING",
                        "user_action": "PAY_NOW",
                        "return_url": serverUrl + '/pay/success',
                        "cancel_url": serverUrl + '/pay/cancel',
                        "brand_name": "Movie Website"
                    }
                }
            }, "purchase_units": [{
                "amount": {
                    "currency_code": "USD",
                    "value": "11.00",
                    "breakdown": {
                        "item_total": { "currency_code": "USD", "value": "10.00" },
                        "shipping": { "currency_code": "USD", "value": "1.00" }
                    }
                },
                "items": [
                    {
                        "name": "Lifetime Movie Website diamond access",
                        "description": "AI features for personalize movies recommendation provided for account based on previous watched movies!",
                        "quantity": 1,
                        "unit_amount": { "currency_code": "USD", "value": "10.00" },
                    }
                ]
            }]
        })
    })

    const result = await response.json();
    return result.links.find(link => link.rel === 'payer-action').href;
}

const captureOrder = async (orderId) => {
    const token = await getToken();

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });

    const result = await response.json();
    return result;
}

module.exports = {
    createOrder, captureOrder
}

console.log("Payment available.")