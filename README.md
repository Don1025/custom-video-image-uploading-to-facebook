gifbooth

This app can watch files in .gif, .GIF, .jpg, .JPG, .mp4 and .MP4

Before do anything, make sure the following folders are present and remove any files inside these folders

gifbooth/watch  --> contains media you want to display to users (can be jpg, gif or mp4)
gifbooth/originalsMP4
gifbooth/DONE
gifbooth/originalJpgs  --> template photos
gifbooth/toPrint  --> when selected for printing, template will be sent to here
gifbooth/public/photos
gifbooth/public/videos
gifbooth/Hold --> FileJuggler working holding folder to save still GIF frame from MP4

============================================================================
Make sure following versions are correct

"node": "8.0.0"  --> download from nodejs website
"npm": "5.0.0  --> download from nodejs website
"nodemailer": "~0.7.0"  --> after changing in package.json, run "npm uninstall -g" and then "npm install -g"
"express": "3.0.0" --> after changing in package.json, run "npm uninstall -g" and then "npm install -g"

============================================================================
- GIF, mp4, jpg, JPG in watch folder will appear on page in real time
- once GIF, jpg, JPG is in watch folder, it will automatically be duplicated into public/photos
- once mp4 is in watch folder, it will automatically be duplicated into public/videos
- originalJpgs folder contains photo in template
- on selected for printing, photo is matched between watch and originalJpgs and the correct file with correct filename gets put into the toPrint folder. This only applies for jpg or JPG in watch folder
- for mp4 emailing, it emails the MP4 file from the MP4 file in watch folder
- for JPG or jpg emailing, it emails the file inside the watch folder
- email is fired via instantlysg@gmail.com
- if wish to enable form, go to config.js to change
- localhost:3800/reset to clear print data
- localhost:3800/downloadform to download data
- localhost:3800/resetform will remove all data

============================================================================
- before start app always go to server.js to make sure paths are correct
- to change printing count for various paper size, change in server.js at line 366, 367, 368
- to change email message go to upload.js
- to change email source path go to upload.js