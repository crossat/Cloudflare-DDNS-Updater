// Interface for public IP response
export interface PublicIpResponse {
    ip: string;
    // Add optional properties for potential error responses
    error?: boolean;
    message?: string;
}