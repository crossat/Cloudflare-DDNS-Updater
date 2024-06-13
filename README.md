# DDNS Updater Application

This repository contains a Dynamic DNS (DDNS) updater application that automatically updates DNS records on Cloudflare based on changes in your public IP address. This is useful for maintaining access to your services hosted on a dynamic IP address.

## Features

- Automatically updates DNS records on Cloudflare when your public IP address changes.
- Dockerized application for easy deployment and management.

## Prerequisites

Before running the application, ensure you have the following:

- Node.js installed locally or within your Docker environment.
- Docker installed if running the application within a Docker container.
- A Cloudflare account with access to manage DNS records via the Cloudflare API.

## Installation

To run the DDNS updater application:

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/ddns-updater.git
   cd ddns-updater

2. Install dependencies:

    ```bash
    npm install
   ```
3. Set up your environment variables:

- Copy .env.example to .env and fill in your Cloudflare API credentials and DNS settings.
- Update .env with your desired DNS_PROXIED setting (true/false).

4. Build and run the application:

- Local Development:

    ```bash
    npm run start
    ```
- Docker:

    ```bash
    Copy code
    docker build -t ddns-updater .
    docker run -d --name ddns-updater-app ddns-updater
    ```
  
## Configuration
### Environment Variables
Ensure you have the following environment variables set in your .env file:

- CF_API_EMAIL: Your Cloudflare account email address.
- CF_API_KEY: Your Cloudflare API key.
- CF_ZONE_ID: The ID of your Cloudflare zone where the DNS records are managed.
- DNS_HOSTNAME: The hostname (e.g., www.example.com) to update with your current IP address.
- DNS_PROXIED: Whether the DNS record should be proxied through Cloudflare's network (true/false).

## Usage
The application automatically updates the DNS record specified by DNS_HOSTNAME with your current public IP address. It checks for IP changes periodically and updates Cloudflare via the API accordingly.

## Contributing
Feel free to contribute to this project. Please fork the repository and submit pull requests for any enhancements or bug fixes.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
Inspired by the need for managing dynamic IP addresses with Cloudflare DNS.