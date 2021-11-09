# About this project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Getting started

### Install Raspberry Pi Operating System (with desktop)

- use Raspberry Pi Imager
- finish installation on the desktop and connect to wifi
- optionally enable SSH

### Install NVM

```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Install node lts
See here: https://dev.to/patrickweaver/installing-node-12-and-higher-on-a-raspberry-pi-zero-with-nvm-4dnj
```
NVM_NODEJS_ORG_MIRROR=https://unofficial-builds.nodejs.org/download/release nvm install 14
```

check node version
```
node -v
v14.18.1
```

### Enable SPI

```
sudo raspi-config
# Choose Interfacing Options -> SPI -> Yes  to enable SPI interface
sudo reboot
```

### Install dependencies

```
sudo apt-get update

# Install wiringpi
sudo apt-get install -y wiringpi

# For Pi 4, you need to update wiringpi (skip otherwise)：
cd /tmp
wget https://project-downloads.drogon.net/wiringpi-latest.deb
sudo dpkg -i wiringpi-latest.deb
#You will get 2.52 information if you've installed it correctly
gpio -v

# Remaining dependencies
sudo apt-get install -y build-essential chromium-browser
```

### Install Agender Paper globally

```
NODE_OPTIONS=--max-old-space-size=512 npm i -g agenda-paper --no-optional
```

### Create Google app

### Create .env file
