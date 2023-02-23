#!/usr/bin/env bash

set -eo pipefail

# Update system
sudo yum update -y

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs


sudo amazon-linux-extras install epel -y
sudo yum -y install gcc openssl-devel bzip2-devel libffi-devel zlib-devel
sudo tee /etc/yum.repos.d/pgdg.repo<<EOF
[pgdg14]
name=PostgreSQL 14 for RHEL/CentOS 7 - x86_64
baseurl=http://download.postgresql.org/pub/repos/yum/14/redhat/rhel-7-x86_64
enabled=1
gpgcheck=0
EOF
sudo yum makecache
sudo yum install postgresql14 postgresql14-server -y



# export variables . DB_* is the name used in my webapp api

sudo sh -c 'echo "export DB_USER='${POSTGRES_USER}'" >> /etc/profile'
sudo sh -c 'echo "export DB_PASSWORD='${POSTGRES_PASSWORD}'" >> /etc/profile'
sudo sh -c 'echo "export DB_DATABASE='${POSTGRES_DB}'" >> /etc/profile'
sudo sh -c 'echo "export DB_PORT='${POSTGRES_PORT}'" >> /etc/profile'
sudo sh -c 'echo "export DB_HOST='${POSTGRES_HOST}'" >> /etc/profile'

# Create postgres user
sudo postgresql-14-setup initdb
sudo systemctl enable --now postgresql-14
sudo su - postgres <<EOF
psql -c "CREATE database ${POSTGRES_DB}"
psql -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};"
psql -c "\du"
EOF

#To make postgres take password for login and not raise Ident issue
sudo sed -i 's/\(scram-sha-256\|ident\|peer\)/md5/g' /var/lib/pgsql/14/data/pg_hba.conf
sudo systemctl restart postgresql-14


cd /home/ec2-user/webapp
npm i

#Giving exec writes to owner, user and group
chmod -R 755 node_modules/
rm -rf node_modules/
npm i

sudo cp packer/webapp.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable webapp.service
sudo systemctl start webapp.service



# Install nginx
sudo amazon-linux-extras list | grep nginx
sudo amazon-linux-extras enable nginx1
sudo yum clean metadata
sudo yum -y install nginx
sudo systemctl enable nginx
sudo cp packer/nginx.conf /etc/nginx/
sudo systemctl restart nginx
sudo systemctl reload nginx

