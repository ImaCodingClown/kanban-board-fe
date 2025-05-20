#!/bin/zsh
source .env 
export CURRENT_DIR=$(pwd) 
cd ${LOCALBACKEND} && echo $(pwd) && docker build -t rust-backend-image .
cd ${CURRENT_DIR}
docker compose -f docker-compose.local.yml up -d
npm run test:ci
docker compose down
