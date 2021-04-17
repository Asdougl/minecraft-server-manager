# Minecraft Server Manager
Asdougl's Open Source Minecraft Server Manager. I don't trust other server managers to not sell my data on the black market so here we are, I just made my own.

## Requirements
### To Run
 - Java Runtime Environemtn (JRE)
### To Build
 - NodeJS
 - NPM

## How it works
Basically, it just uses Node JS to spawn a child process using Java, that you'll need installed. It then monitors the stdout stream for logging information.

## Why Should I use it?
If you're perfectly happy with using a script file to start up your server then you shouldn't. This simply lets you manage servers in a friendly interface, so that its less painful if you want to modify properties, switch worlds or backup worlds. This doesn't do anything fancy like run servers in VMs or Docker Containers, nor does it allow any fancy remote management (yet), just plain and simply nice interface for your minecraft servers.

## How to Build
To build the manager, clone the repo and run the following in side the repo
```
npm run build
```
This will build for your architecture and place a fresh build into the /dist directory

## Disclaimer
I hold no responsibility for this somehow destroying your existing minecraft worlds. I have no reason to believe it would, as it does not interact with world files at all (at this time), don't come complaining to me when you've lost that 1200 hr world that you never backed up (come on dude).