provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# --------------------------------------------------------
# 1. NETWORKING (VPC, Subnets, Gateway, NAT)
# --------------------------------------------------------

resource "aws_vpc" "hotel_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "hotel-reservation-vpc"
  }
}

resource "aws_internet_gateway" "hotel_igw" {
  vpc_id = aws_vpc.hotel_vpc.id

  tags = {
    Name = "hotel-reservation-igw"
  }
}

# Public Subnets (for ALB)
resource "aws_subnet" "public_1" {
  vpc_id            = aws_vpc.hotel_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "hotel-public-subnet-1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id            = aws_vpc.hotel_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "hotel-public-subnet-2"
  }
}

# Private App Subnets (for EC2 Instances)
resource "aws_subnet" "private_app_1" {
  vpc_id            = aws_vpc.hotel_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "hotel-private-app-1"
  }
}

resource "aws_subnet" "private_app_2" {
  vpc_id            = aws_vpc.hotel_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "hotel-private-app-2"
  }
}

# Private DB Subnets (for RDS MySQL)
resource "aws_subnet" "private_db_1" {
  vpc_id            = aws_vpc.hotel_vpc.id
  cidr_block        = "10.0.5.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "hotel-private-db-1"
  }
}

resource "aws_subnet" "private_db_2" {
  vpc_id            = aws_vpc.hotel_vpc.id
  cidr_block        = "10.0.6.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "hotel-private-db-2"
  }
}

# NAT Gateway for Private Subnet Outbound Access
resource "aws_eip" "nat_eip" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.hotel_igw]
}

resource "aws_nat_gateway" "hotel_nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_1.id

  tags = {
    Name = "hotel-nat-gateway"
  }
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.hotel_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.hotel_igw.id
  }

  tags = {
    Name = "hotel-public-route-table"
  }
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.hotel_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.hotel_nat.id
  }

  tags = {
    Name = "hotel-private-route-table"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_app_1" {
  subnet_id      = aws_subnet.private_app_1.id
  route_table_id = aws_route_table.private_rt.id
}

resource "aws_route_table_association" "private_app_2" {
  subnet_id      = aws_subnet.private_app_2.id
  route_table_id = aws_route_table.private_rt.id
}

# --------------------------------------------------------
# 2. SECURITY GROUPS
# --------------------------------------------------------

# Application Load Balancer Security Group
resource "aws_security_group" "alb_sg" {
  name        = "hotel-alb-sg"
  description = "Allows incoming HTTP traffic from public internet"
  vpc_id      = aws_vpc.hotel_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "hotel-alb-sg"
  }
}

# EC2 Instances Auto Scaling Security Group
resource "aws_security_group" "ec2_sg" {
  name        = "hotel-ec2-sg"
  description = "Allows HTTP traffic only from Load Balancer"
  vpc_id      = aws_vpc.hotel_vpc.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "hotel-ec2-sg"
  }
}

# RDS Security Group
resource "aws_security_group" "rds_sg" {
  name        = "hotel-rds-sg"
  description = "Allows MySQL connections only from EC2 app security group"
  vpc_id      = aws_vpc.hotel_vpc.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "hotel-rds-sg"
  }
}

# --------------------------------------------------------
# 3. AWS KMS (ENCRYPTION)
# --------------------------------------------------------

resource "aws_kms_key" "hotel_kms" {
  description             = "KMS Key for Hotel Reservation S3 and RDS Encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "hotel-reservation-kms-key"
  }
}

# --------------------------------------------------------
# 4. AMAZON S3 BUCKET (HOTEL IMAGES)
# --------------------------------------------------------

resource "aws_s3_bucket" "hotel_images" {
  bucket        = "lumina-hotel-images-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = {
    Name = "hotel-reservation-s3-bucket"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_encrypt" {
  bucket = aws_s3_bucket.hotel_images.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.hotel_kms.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# Allow S3 bucket to be publicly accessible for image retrieval (but block new public ACLs)
resource "aws_s3_bucket_public_access_block" "s3_block" {
  bucket = aws_s3_bucket.hotel_images.id

  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

# Public Bucket Policy allowing read access for uploaded images
resource "aws_s3_bucket_policy" "public_read_policy" {
  bucket     = aws_s3_bucket.hotel_images.id
  depends_on = [aws_s3_bucket_public_access_block.s3_block]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.hotel_images.arn}/*"
      }
    ]
  })
}

# --------------------------------------------------------
# 5. AMAZON RDS (MYSQL DATABASE)
# --------------------------------------------------------

resource "aws_db_subnet_group" "db_subnets" {
  name       = "hotel-db-subnet-group-${random_id.bucket_suffix.hex}"
  subnet_ids = [aws_subnet.private_db_1.id, aws_subnet.private_db_2.id]

  tags = {
    Name = "hotel-db-subnet-group"
  }
}

resource "aws_db_instance" "hotel_db" {
  identifier             = "lumina-hotel-database-${random_id.bucket_suffix.hex}"
  allocated_storage      = 20
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  db_name                = "hotel_reservation"
  username               = "admin"
  password               = trimspace(var.db_password)
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true
  kms_key_id             = aws_kms_key.hotel_kms.arn
  storage_encrypted      = true

  tags = {
    Name = "hotel-rds-instance"
  }
}

# --------------------------------------------------------
# 6. IAM ROLE (EC2 INSTANCE PROFILE)
# --------------------------------------------------------

resource "aws_iam_role" "ec2_role" {
  name = "hotel-ec2-iam-role-${random_id.bucket_suffix.hex}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Policy allowing CloudWatch Logs and S3 read/write
resource "aws_iam_policy" "ec2_custom_policy" {
  name        = "hotel-ec2-custom-policy-${random_id.bucket_suffix.hex}"
  description = "Allows logs streaming, S3 upload/download, and KMS decryption"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.hotel_images.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:CreateLogGroup",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.hotel_kms.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "custom_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_custom_policy.arn
}

resource "aws_iam_role_policy_attachment" "ssm_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "hotel-ec2-instance-profile-${random_id.bucket_suffix.hex}"
  role = aws_iam_role.ec2_role.name
}

# --------------------------------------------------------
# 7. LOAD BALANCER & TARGET GROUP
# --------------------------------------------------------

resource "aws_lb" "hotel_alb" {
  name               = "hotel-alb-${random_id.bucket_suffix.hex}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  tags = {
    Name = "hotel-alb"
  }
}

resource "aws_lb_target_group" "hotel_tg" {
  name     = "hotel-tg-${random_id.bucket_suffix.hex}"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.hotel_vpc.id

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    port                = "80"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name = "hotel-target-group"
  }
}

resource "aws_lb_listener" "hotel_listener" {
  load_balancer_arn = aws_lb.hotel_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.hotel_tg.arn
  }
}

# --------------------------------------------------------
# 8. LAUNCH TEMPLATE & AUTO SCALING GROUP
# --------------------------------------------------------

# CloudWatch Log Group for application logging
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/ec2/hotel-reservation-system-${random_id.bucket_suffix.hex}"
  retention_in_days = 30
}

# Launch Template for ASG
resource "aws_launch_template" "hotel_lt" {
  name_prefix   = "hotel-lt-"
  image_id      = var.ami_id
  instance_type = "t3.micro"

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.ec2_sg.id]
  }

  # User data handles dynamic injection of connection parameters and secret keys into backend .env
  user_data = base64encode(<<-EOF
#!/bin/bash

# Write connection settings to environment configuration
cat << 'ENV' > /var/opt/hotel-reservation/backend/.env
PORT=5000
NODE_ENV=production
DB_HOST=${split(":", aws_db_instance.hotel_db.endpoint)[0]}
DB_PORT=3306
DB_NAME=hotel_reservation
DB_USER=admin
DB_PASSWORD="${trimspace(var.db_password)}"
JWT_SECRET="${trimspace(var.jwt_secret)}"
AWS_REGION=${var.aws_region}
AWS_S3_BUCKET_NAME=${aws_s3_bucket.hotel_images.id}
ENV

# Restart server application to mount dynamic variables
sudo -u ubuntu pm2 restart all
EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "hotel-asg-instance"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "hotel_asg" {
  name_prefix         = "hotel-asg-"
  desired_capacity    = 1
  min_size            = 1
  max_size            = 2
  vpc_zone_identifier = [aws_subnet.private_app_1.id, aws_subnet.private_app_2.id]
  target_group_arns   = [aws_lb_target_group.hotel_tg.arn]

  launch_template {
    id      = aws_launch_template.hotel_lt.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "hotel-reservation-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}
