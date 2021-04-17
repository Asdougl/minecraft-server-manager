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
Prefix `server:`
| Event                     | Description 
|---------------------------|-------------------------
|`server:pending`           | Server has begun execution
|`server:loading`           | Server is loading libraries
|`server:dimension`         | Server is loading a dimension
|`server:progress`          | Server has made progress on a dimension
|`server:done`              | Server load is done
|`server:error`             | Server encountered some error
|`server:outdated`          | Bukkit/Spigot build is outdated
|`server:stop`              | Server is closing
|`server:closed`            | Server has closed


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