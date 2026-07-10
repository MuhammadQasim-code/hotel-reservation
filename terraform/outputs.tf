output "alb_dns_name" {
  description = "The public DNS name of the Application Load Balancer"
  value       = aws_lb.hotel_alb.dns_name
}

output "s3_bucket_name" {
  description = "The name of the Amazon S3 Bucket created for hotel images"
  value       = aws_s3_bucket.hotel_images.id
}

output "rds_endpoint" {
  description = "The connection endpoint for the Amazon RDS MySQL database"
  value       = aws_db_instance.hotel_db.endpoint
}
