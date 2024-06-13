// Interface for Cloudflare DNS update response
export interface CloudflareDNSUpdateResponse {
    success: boolean;
    errors: CloudflareError[];
    messages: string[];
    result: CloudflareResult | null;
}

// Interface for Cloudflare error
export interface CloudflareError {
    code: number;
    message: string;
}

// Interface for Cloudflare result
export interface CloudflareResult {
    id: string;
    type: string;
    name: string;
    content: string;
    proxiable: boolean;
    proxied: boolean;
    ttl: number;
    locked: boolean;
    zone_id: string;
    zone_name: string;
    created_on: string;
    modified_on: string;
    data: object;
}

export interface CloudflareResponse {
    result: CloudflareResult[];
}