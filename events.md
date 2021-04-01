# Events from Main Process

## Window Events
Prefix: `window:`
| Event                     | Description 
|---------------------------|-------------------------
|`window:close`             | Close the window  
|`window:maximize`          | Maximize the window  
|`window:minimize`          | Minimize the window  
|`window:status`            | Is window focused?


## Server Events
Prefix: `server:`
| Event                     | Description 
|---------------------------|-------------------------
|`server:close`             | Server has closed
|`server:pending`           | Server has begun execution
|`server:init`              | Server has begun initialization
|`server:eula`              | Server requires EULA Agreement
|`server:file`              | Server requires Server File
|`server:run`               | Server requires first run
|`server:started`           | Server has successfully started
|`server:dimension`         | Server is loading a dimension
|`server:progress`          | Server has made progress loading a dimension
|`server:error`             | Server encountered an error
|`server:outdated`          | Bukkit/Spigot build is outdated


## Initialization Events
Prefix: `init:`
| Event                     | Description 
|---------------------------|-------------------------
|`init:file`                | Initialisation requires a server file
|`init:eula`                | Initialisation requires EULA agreement
|`init:done`                | Initialisation process complete


## Minecraft Events
Prefix: `minecraft:`
| Event                     | Description 
|---------------------------|-------------------------
|`minecraft:chat`           | Chat Message Sent
|`minecraft:command`        | A command was issued