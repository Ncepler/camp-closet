// Server-only PayPal API utilities

const PAYPAL_BASE =
  process.env.PAYPAL_ENVIRONMENT === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

export { PAYPAL_BASE };

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? '';
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function createPayPalOrder(
  itemId: string,
  itemPrice: number,
  shippingFee: number,
  itemLabel: string
): Promise<string> {
  const accessToken = await getPayPalAccessToken();
  const totalAmount = (itemPrice + shippingFee).toFixed(2);
  const breakdown: Record<string, { currency_code: string; value: string }> = {
    item_total: { currency_code: 'USD', value: itemPrice.toFixed(2) },
  };
  if (shippingFee > 0) {
    breakdown.shipping = { currency_code: 'USD', value: shippingFee.toFixed(2) };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'PayPal-Request-Id': `${itemId}-${Date.now()}`,
  };
  if (process.env.PAYPAL_PARTNER_ATTRIBUTION_ID) {
    headers['PayPal-Partner-Attribution-Id'] = process.env.PAYPAL_PARTNER_ATTRIBUTION_ID;
  }

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: itemId,
          amount: {
            currency_code: 'USD',
            value: totalAmount,
            breakdown,
          },
          items: [
            {
              name: itemLabel,
              unit_amount: { currency_code: 'USD', value: itemPrice.toFixed(2) },
              quantity: '1',
              category: 'PHYSICAL_GOODS',
            },
          ],
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'Camp Closet Marketplace',
            locale: 'en-US',
            user_action: 'PAY_NOW',
          },
        },
      },
    }),
    cache: 'no-store',
  });

  const order = await res.json();
  if (!res.ok) {
    throw new Error(order.message ?? `PayPal create-order error: ${res.status}`);
  }
  return order.id as string;
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? `PayPal capture error: ${res.status}`);
  }
  return data;
}

export async function refundPayPalCapture(
  captureId: string,
  amount: number,
  note: string
) {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: { currency_code: 'USD', value: amount.toFixed(2) },
      note_to_payer: note,
    }),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? `PayPal refund error: ${res.status}`);
  }
  return data;
}
