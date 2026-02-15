import { Netopia } from '@bogdan-nita/netopia-card';
import fs from 'fs';
import path from 'path';

// Helper to get key content (handle both file path and direct content/base64)
function getKeyContent(key: string): string {
    if (!key) return '';
    // Check if it's a file path - using try-catch to avoid crashing if path is invalid chars
    try {
        if (fs.existsSync(key)) {
            return fs.readFileSync(key, 'utf8');
        }
    } catch (e) {
        // ignore, likely not a path
    }
    return key;
}

const NETOPIA_SIGNATURE = process.env.NETOPIA_SIGNATURE || '';
const NETOPIA_PUBLIC_KEY = getKeyContent(process.env.NETOPIA_PUBLIC_KEY || '');
const NETOPIA_PRIVATE_KEY = getKeyContent(process.env.NETOPIA_PRIVATE_KEY || '');
const NETOPIA_SANDBOX = process.env.NETOPIA_SANDBOX === 'true';

export function getNetopiaInstance() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return new Netopia({
        signature: NETOPIA_SIGNATURE,
        publicKey: NETOPIA_PUBLIC_KEY,
        privateKey: NETOPIA_PRIVATE_KEY,
        sandbox: NETOPIA_SANDBOX,
        confirmUrl: `${baseUrl}/api/netopia/confirm`,
        returnUrl: `${baseUrl}/donatie/confirmare`
    });
}

export async function createNetopiaRequest(
    donationId: string,
    amount: number,
    email: string,
    firstName: string = 'Donator',
    lastName: string = 'Anonim'
) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/donatie/confirmare?donationId=${donationId}`;

    // Create instance specifically for this request to set the correct return URL
    const netopia = new Netopia({
        signature: NETOPIA_SIGNATURE,
        publicKey: NETOPIA_PUBLIC_KEY,
        privateKey: NETOPIA_PRIVATE_KEY,
        sandbox: NETOPIA_SANDBOX,
        confirmUrl: `${baseUrl}/api/netopia/confirm`,
        returnUrl: returnUrl
    });

    netopia.setClientBillingData({
        firstName: firstName || 'Donator',
        lastName: lastName || 'Anonim',
        email: email,
        phone: '-',
        country: 'Romania',
        city: '-',
        address: '-',
        county: '-',
        zipCode: '-',
        bank: '-',
        iban: '-'
    });

    netopia.setPaymentData({
        orderId: donationId,
        amount: amount,
        currency: 'RON',
        details: `Donatie #${donationId}`
    });

    return netopia.buildRequest();
}

export async function validateNetopiaPayment(env_key: string, data: string) {
    const netopia = getNetopiaInstance();
    return await netopia.validatePayment(env_key, data);
}
