packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

source "amazon-ebs" "hotel_reservation" {
  ami_name      = "hotel-reservation-ami-{{timestamp}}"
  instance_type = "t3.micro"
  region        = var.aws_region
  
  # Filter for Ubuntu 22.04 LTS image
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"] # Canonical owner ID
  }
  
  ssh_username = "ubuntu"
}

build {
  name    = "hotel-reservation-builder"
  sources = ["source.amazon-ebs.hotel_reservation"]

  # Create directories on target machine
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /var/opt/hotel-reservation/backend",
      "sudo mkdir -p /var/www/html",
      "sudo chown -R ubuntu:ubuntu /var/opt/hotel-reservation",
      "sudo chown -R ubuntu:ubuntu /var/www/html"
    ]
  }

  # Copy compiled frontend build
  provisioner "file" {
    source      = "../frontend/dist/"
    destination = "/var/www/html/"
  }

  # Copy backend codebase
  provisioner "file" {
    source      = "../backend/"
    destination = "/var/opt/hotel-reservation/backend/"
  }

  # Run script to install Node, Nginx, PM2, and configure services
  provisioner "shell" {
    script = "./setup.sh"
  }

  post-processor "manifest" {
    output     = "manifest.json"
    strip_path = true
  }
}

