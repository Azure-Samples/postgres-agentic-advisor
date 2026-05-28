#!/bin/bash


################################
### Docker configuration #######
################################
sudo chmod 666 /var/run/docker.sock

ROOT_DIR=$(pwd)
echo ${ROOT_DIR}
###########################
### Node dependencies #####
###########################
cd ${ROOT_DIR}/frontend
npm install

###########################
### Python dependencies ###
###########################
cd ${ROOT_DIR}/backend
poetry install -v --with dev --no-interaction --directory ${ROOT_DIR}/backend

cd ${ROOT_DIR}
#########################
### Git configuration ###
#########################
git config --global --add safe.directory ${ROOT_DIR}

# Fix .git directory permissions before installing pre-commit hooks
# Some .git/objects files on mounted volumes may be immutable; errors are non-fatal
sudo chown -R vscode:vscode ${ROOT_DIR}/.git 2>/dev/null || true

pre-commit install
