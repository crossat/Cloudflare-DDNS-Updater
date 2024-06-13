import axios from 'axios';
import { CronJob } from 'cron';
import dotenv from 'dotenv';
import { CloudflareDNSUpdateResponse, CloudflareError, CloudflareResult } from './types/cloudflare-response';

dotenv.config();

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const ZONE_ID = process.env.ZONE_ID!;
const DNS_NAME = process.env.DNS_NAME!;
const INTERVAL = process.env.INTERVAL || '*/5 * * * *'; // Default to every 5 minutes
const DNS_PROXIED = process.env.DNS_PROXIED === 'true'; // Read proxied flag from environment variable

let currentIP: string | null = null;

// Function to fetch the current public IP address
async function getPublicIP(): Promise<string> {
    try {
        const response = await axios.get('https://api64.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        console.error('Error fetching public IP:', (error as Error).message);
        throw error;
    }
}

// Function to create a new DNS record on Cloudflare
async function createDNSRecord(): Promise<string | null> {
    const defaultIP = await getPublicIP();
    const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;
    const data = {
        type: 'A',
        name: DNS_NAME,
        content: defaultIP,
        ttl: 1,
        proxied: DNS_PROXIED // Set the proxied flag
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 && response.data.success) {
            console.log(`DNS record created successfully for ${DNS_NAME}`);
            return response.data.result.id;
        } else {
            console.error(`Failed to create DNS record for ${DNS_NAME}. Status: ${response.status}, Message: ${response.statusText}`);
            console.error('Error details:', response.data);
            return null;
        }
    } catch (error) {
        console.error('Error creating DNS record:', (error as Error).message);
        throw error;
    }
}

// Main function to update the DNS record on Cloudflare
async function updateCloudflareDNS() {
    try {
        let recordId = await fetchRecordId(); // Get the RECORD_ID dynamically
        if (!recordId) {
            console.log('Creating DNS record...');
            recordId = await createDNSRecord(); // Create the DNS record if it doesn't exist
            if (!recordId) {
                throw new Error('Failed to create DNS record.');
            }
        } else {
            console.log(`DNS record found for ${DNS_NAME}. Checking IP...`);
        }

        const publicIP = await getPublicIP(); // Get the current public IP
        console.log(`Current Public IP: ${publicIP}`);

        const dnsRecordIP = await getDNSRecordIP(recordId); // Get the DNS record IP
        console.log(`DNS Record IP: ${dnsRecordIP}`);

        const dnsRecordProxied = await isDNSRecordProxied(recordId); // Get the DNS record proxied flag
        console.log(`DNS Record Proxied: ${dnsRecordProxied}`);

        if (publicIP !== dnsRecordIP || DNS_PROXIED !== dnsRecordProxied) {
            console.log('IPs or proxied flag are different. Updating DNS record...');
            const updateResponse = await updateDNSRecord(publicIP, recordId); // Update the DNS record
            console.log('DNS update response:', updateResponse);
        } else {
            console.log('IPs and proxied flag are the same. No need to update DNS record.');
        }
    } catch (error) {
        console.error('Failed to update Cloudflare DNS:', (error as Error).message);
    }
}

// Function to fetch the record ID of the DNS record based on DNS_NAME
async function fetchRecordId(): Promise<string | null> {
    const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;
    try {
        const response:any = await axios.get<CloudflareDNSUpdateResponse>(url, {
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const data = response.data;
            if (data.result && data.result.length > 0) {
                const record = data.result.find((record: CloudflareResult) => record.name === DNS_NAME && record.type === 'A');
                if (record) {
                    return record.id;
                } else {
                    console.log(`DNS record for ${DNS_NAME} not found in Cloudflare. Creating a new record...`);
                    return null;
                }
            } else {
                console.error(`No DNS records found in Cloudflare for zone ID ${ZONE_ID}.`);
                return null;
            }
        } else {
            console.error(`Failed to fetch DNS records from Cloudflare. Status: ${response.status}, Message: ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching DNS records from Cloudflare:', (error as Error).message);
        throw error;
    }
}

// Function to fetch the DNS record IP
async function getDNSRecordIP(recordId: string): Promise<string | null> {
    const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${recordId}`;
    try {
        const response:any = await axios.get<CloudflareDNSUpdateResponse>(url, {
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 && response.data.success) {
            return response.data.result.content;
        } else {
            console.error(`Failed to fetch DNS record IP for ${DNS_NAME}. Status: ${response.status}, Message: ${response.statusText}`);
            console.error('Error details:', response.data);
            return null;
        }
    } catch (error) {
        console.error('Error fetching DNS record IP:', (error as Error).message);
        throw error;
    }
}

// Function to check if the DNS record is proxied through Cloudflare
async function isDNSRecordProxied(recordId: string): Promise<boolean> {
    const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${recordId}`;
    try {
        const response:any = await axios.get<CloudflareDNSUpdateResponse>(url, {
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 && response.data.success) {
            return response.data.result.proxied;
        } else {
            console.error(`Failed to fetch DNS record details for ${DNS_NAME}. Status: ${response.status}, Message: ${response.statusText}`);
            console.error('Error details:', response.data);
            return false; // Default to false if unable to fetch details
        }
    } catch (error) {
        console.error('Error fetching DNS record details:', (error as Error).message);
        throw error;
    }
}

// Function to update the DNS record with the new IP
async function updateDNSRecord(ip: string, recordId: string): Promise<CloudflareDNSUpdateResponse> {
    const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${recordId}`;
    const data = {
        type: 'A',
        name: DNS_NAME,
        content: ip,
        ttl: 1,
        proxied: DNS_PROXIED // Set the proxied flag
    };

    try {
        const response = await axios.put<CloudflareDNSUpdateResponse>(url, data, {
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.success) {
            return response.data;
        } else {
            const errorResponse = response.data.errors.map((e: CloudflareError) => e.message).join(', ');
            throw new Error(`Error updating DNS record: ${errorResponse}`);
        }
    } catch (error) {
        console.error('Error updating DNS record:', (error as Error).message);
        throw error;
    }
}

// Create a cron job to run the updateCloudflareDNS function at the specified interval
const job = new CronJob(INTERVAL, updateCloudflareDNS);
job.start(); // Start the cron job

console.log(`Cloudflare DDNS updater started. Running at interval: ${INTERVAL}.`);