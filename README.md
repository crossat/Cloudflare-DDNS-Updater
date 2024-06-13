# Cloudflare DDNS Updater

This is a Node.js application written in TypeScript that updates a Cloudflare DNS record with your current public IP address. It uses Docker for containerization.

## Features

- Automatically updates Cloudflare DNS records.
- Retrieves public IP from multiple sources for resilience.
- Configurable through environment variables.
- Scheduled updates using cron.

## Prerequisites

- Docker
- Docker Compose
- Node.js
- Cloudflare API token

## Setup

### Clone the Repository

```bash
git clone https://github.com/your-username/cloudflare-ddns-updater.git
cd cloudflare-ddns-updater
