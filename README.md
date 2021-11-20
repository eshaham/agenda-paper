# About this project

This project allows you to set up an ePaper display on your desktop, which shows the next couple of meetings from your calendar.
It uses hardware you can simply purchase on Amazon - an ePaper display and a Raspberry Pi Zero - and optionally a 3D printed case.
Software wise, it uses [ePaper.js](https://github.com/samsonmking/epaper.js) as the framework for printing on the ePaper display, [Create React App](https://github.com/facebook/create-react-app) and express.js.

# Getting started

## Create a GCP app

In order to be able to login to your Google calendar, you will need to set up an app on [Google Cloud Console](https://console.cloud.google.com/).
You can (and should) do this on your regular computer, no need to do it on the Raspberry Pi.
Steps

1. Set up a [new project](https://console.cloud.google.com/projectcreate) under Google Cloud Console.
2. Enable the [Google Calendar API](https://console.cloud.google.com/apis/api/calendar-json.googleapis.com/overview) for your newly created project.
3. Create new credentials for your project:
   a. Goto the [credentials page](https://console.cloud.google.com/apis/credentials) and click on the "Create credentials" button
   b. Choose the OAuth Client ID option
   c. Choose Web application for application type
   d. Add `http://localhost:3000` under "Authorized JavaScript origins" and `http://localhost:3000/api/auth/login/callback` under "Authorized redirect URIs", click save
   e. Copy the created Client ID and Client Secret, you will need them later
4. Update the OAuth Consent screen:
   a. Go to the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) setup page
   b. Give your app a name and provide your email (not that important since you will be the only one using this app), click Save and Continue
   c. Click the "Add or remove scopes" button and select the `calendar.events.readonly` scope, click Save and Continue
   d. Save your app

## Install Raspberry Pi Operating System (with desktop)

- use Raspberry Pi Imager
- finish installation on the desktop and connect to wifi
- optionally enable SSH

## Setup Agenda Paper on your Raspberry Pi

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

### Install Agenda Paper globally

```
npm i -g agenda-paper
```

### Create environment config file

Create a config directory called `.agenda-paper` under your home folder

```
mkdir ~/.agenda-home
```

Create an `.env` file under the config directory and add the GCP app credentials

```
echo "GOOGLE_CLIENT_ID=<enter your app's client ID>" >> ~/.agenda-paper/.env
echo "GOOGLE_CLIENT_SECRET=<enter your app's client secret>" >> ~/.agenda-paper/.env
```

## Run Agenda-Paper

On your raspberry pi terminal (or SSH), run agenda-paper

```
agenda-paper
```

You should be seeing a prompt on your ePaper display to set up your account. Follow the instructions to set everything up.
Eventually, you should be seeing your agenda on the display.

![image](https://user-images.githubusercontent.com/7040645/142741601-7eb96d19-4da3-403b-8cfc-91371c4ecf04.png)

```
