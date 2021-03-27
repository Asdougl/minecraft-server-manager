# Server Log Breakdown:

## Done
Done is in a line called:
```
Done (21.614s)! For help, type "help"
```
which could be a regex expression:
```
Done \(([\d.]+)s\)! For help, type "help"
```
which matches to show the time taken in seconds

## Server Stopped
Stop is in a line called:
```
[14:58:30] [Thread-2/INFO]: Stopping server
```
which doesn't need regex.

## Load Progression
Loading comes in three dimensions:
 1) minecraft:overworld
 2) minecraft:the_nether
 3) minecraft:the_end

### Detect Dimension
You can detect the dimension with
```
Preparing start region for dimension (.*)
```
which will match to the dimension

### Detect Load Progress for Dimenion
You can detect load progress with:
```
Preparing spawn area: (\d+)%
```
which will match to the progress

### Time Elapsed for Dimension
You can detect time elapsed with:
```
Time elapsed: (\d+) ms
```
which will match to the time elapsed

### Server Location
You can detect server location with:
```
Starting Minecraft server on (.+):(\d+)
```
which will match to (1) IP Address, (2) Port