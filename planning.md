## Start Server Outcomes
Start Server has 3 (?) outcomes:
    1) Server Started Successfully
    2) Server Requires EULA Agreement
    3) Server Encountered some Error

### Process
Click "Start"
NodeJS Spins Up Sever
NodeJS Analyses Logs
Reports back to Renderer when it encounters known outcomes
Reports back to Renderer when it closes unexpectedly
Reports back to Renderer when it reads "Done!"

### Known Outcomes
 - Failed to load eula.txt (You need to agree to the EULA in order to run the server. Go to eula.txt for more info.)
 - Loading world (%)
 - "Done! (x seconds)

## Renderer Actions
Renderer will want to do things, here is a versioning breakdown:

### Version 1
Actions:
 - Start Server [DONE]
 - Stop Server [DONE]
 - Restart Server [DONE]
 - Edit server.properties
 - Agree to EULA [DONE?]
 - Open Server Directory [DONE]
 - Read Logs [DONE]
 - Status [DONE]
Events:
 - Server Pending [DONE]
 - Server Started [DONE]
 - Server EULA
 - Server Error 
 - Server Logged [DONE]

### Version 2
 - Manage OPs
 - Backup worlds
 - Regenerate World
 - See Online Players
 - Ban Players
 - Execute Commands
 - Detect Vanilla/Spigot/Bukkit

### Version 3
 - View Achievements / Player
 - View Player Statistics (Track manually?)
 - Manage multiple worlds
 - Schedule Backups
 - Manage Spigot/Bukkit Plugins

