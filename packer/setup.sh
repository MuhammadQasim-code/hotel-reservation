#!/bin/bash
set -e

echo "=== Configuring AWS regional mirrors to prevent GPG errors ==="
sudo sed -i 's/archive.ubuntu.com/us-east-1.ec2.archive.ubuntu.com/g' /etc/apt/sources.list
sudo rm -rf /var/lib/apt/lists/*
sudo apt-get clean

echo "=== System update and prerequisites ==="
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y -o Dpkg::Options::="--force-confold" curl git

echo "=== Installing Node.js v20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== Installing PM2 globally ==="
sudo npm install -g pm2

echo "=== Configuring Nginx ==="
sudo apt-get install -y nginx

# Write custom Nginx configuration to handle SPA and API reverse proxying
cat << 'EOF' | sudo tee /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    # Serve static frontend files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy backend API calls
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Reverse proxy backend health check
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF

# Restart Nginx to apply configuration
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=== Installing Backend dependencies ==="
cd /var/opt/hotel-reservation/backend
npm install --omit=dev

echo "=== Configuring PM2 to start on boot ==="
# Setup ecosystem file for PM2
cat << 'EOF' > ecosystem.config.js
module.exports = {
  apps: [{
    name: "hotel-reservation-backend",
    script: "./server.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
}
EOF

# Startup command registration
# This sets up PM2 to auto-start on server boot for the 'ubuntu' user
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Start the application using PM2 on the image build so it saves in dump
pm2 start ecosystem.config.js
pm2 save

echo "=== Installation complete ==="
