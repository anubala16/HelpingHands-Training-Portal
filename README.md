# 2017FallTeam06

To set up the program (using MongoDB): 

* Install MongoDB if not yet installed 
  * Visit https://www.mongodb.com/download-center#community and download the appropriate .msi file 
  * If you choose to save the application in "C:\mongodb", create a "data" folder in the parent folder of "mongodb" as well 
    * Checkpoint: The file structure so far should be: "C:\mongodb" (your installation), "C:\mongodb\bin" (containing all the executables from the installation) and "C:\data" (storing potential database contents). 
  * In the "data" folder, create a "db" folder 

* Starting the server...just need to do this during initial setup): 
  * Open command prompt and navigate to "C:\mongodb\bin" and run "mongod" 
  * Open another command prompt session and navigate to "C:\mongodb\bin" (same directory as the above step) and run "mongo" 
  * Continue with the second session. Type "use loginapp" in the mongo program running. 
* Starting the app...
  * Assuming node.js is already installed on the machine and latest version of our project is downloaded to the local system, "cd" to "2017FallTeam06/" (project folder). 
  * Run "node app" - this starts our web application which listens on port 3000. 
  * Open a web browser and navigate to this url: "http://localhost:3000/" 
  * You're all set to use our program! 
