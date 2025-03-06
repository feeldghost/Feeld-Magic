# Feeld Magic

![poc](https://i.imgur.com/QOKnWhB.jpeg)

## Requirements

Make sure you have the following installed -

- [Mitmproxy](https://mitmproxy.org/)
- [Node.js](https://nodejs.org/)
- [Python3](https://www.python.org/)

## Important
- If you're using Android then you'll have to be rooted and have [Frida](https://frida.re/) installed
- When running this on Android use [this](https://github.com/feeldghost/Feeld-Magic/blob/main/Frida/unpin.js) script to unpin ssl

## Installation

### 1) Clone the repository

### 2) Install dependencies

#### Install Python dependencies

```bash
pip install -r requirements.txt
```

#### Install NodeJs dependencies

```bash
npm install
```

## Setting Up Mitmproxy

### 1) Install Mitmproxy

Follow the instructions on the [Mitmproxy installation page](https://docs.mitmproxy.org/stable/howto-install/) to install Mitmproxy

### 2) Start Mitmproxy

Run Mitmproxy

```bash
mitmdump
```

This will launch Mitmproxy in the terminal (Default port is 8080)

### 3) Install Mitmproxy Certificate on Your Device

1) **Get Your Local IP Address**
  - **macOS:**
    1) Open **System Preferences**
    2) Click on **Network**
    3) Select your active network connection (Wi-Fi or Ethernet)
    4) Your local IP address will be displayed under **Status** (e.g., `192.168.x.x`)

  - **Windows:**
    1) Open **Command Prompt** (press **Win + R**, type `cmd`, and hit Enter)
    2) Type the following command and press Enter -
       ```
       ipconfig
       ```
    3) Look for the **IPv4 Address** (e.g., `192.168.x.x`) under your active network adapter

2) **Set up the Proxy on Your Device**
   - **iOS**
     1) Open **Settings**
     2) Tap **Wi-Fi**
     3) Select your connected **Wi-Fi network**
     4) Scroll to the bottom and tap **Configure Proxy**
     5) Choose **Manual**
     6) Enter your **Public IP address** as the **Server**
     7) Set **Port** to **8080**
   - **Android**
     1) Open **Settings**.
     2) Go to **Wi-Fi** and select the connected network
     3) Tap **Advanced** or **Network Details** (depending on your device)
     4) Choose **Manual Proxy**
     5) Enter your **Public IP address** in the **Proxy hostname** field
     6) Set **Port** to **8080**

3) **Install the certificate on your device**
   - Open Safari and visit `http://mitm.it/`
   - Install the certificate and follow the instructions
   - (IOS Only) Once installed, go to **Settings** > **General** > **About** > **Certificate Trust Settings**, and enable full trust for the mitmproxy certificate

## Running

### 1) Open two terminals and go to the main directory

```bash
cd Proxy
mitmdump -s proxy.py
```

```bash
cd Site
node .
```

### 2) On your computer browser go to http://localhost:7331

### 3) Open the Feeld app
