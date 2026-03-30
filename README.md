# AnimoDesk Reservation System

AnimoDesk is a web-based reservation system that allows DLSU students to reserve computer laboratory seats. The system includes authentication, seat reservation, and account management features.

This application runs on a Node.js Express server and uses MongoDB for data storage.

--------------------------------------------------

REQUIREMENTS

Before running the project locally, make sure the following are installed:

• Node.js (v16 or newer recommended)  
• npm (comes with Node.js)  
• MongoDB Community Server  
• MongoDB Compass (optional but recommended)

--------------------------------------------------

PROJECT SETUP

1. Extract the ZIP file

Download the project ZIP file and extract it to a folder on your computer.

--------------------------------------------------

2. Open the Project Folder

Open the extracted project folder using IDE of your choice.

--------------------------------------------------

3. Install Dependencies

Open a terminal inside the project folder and run:

'npm install'

This will install all required packages listed in package.json.

--------------------------------------------------

4. Start MongoDB

Make sure MongoDB is running locally.

If using MongoDB Compass:

1. Open MongoDB Compass  
2. Connect to:

'mongodb://localhost:27017'

The application will automatically create the database:

animodesk

--------------------------------------------------

5. Start the Node.js Server

Run the server using:

'node server.js'

If successful, the terminal should display:

MongoDB connected  
Server is running

--------------------------------------------------

6. Run the app

Once the server is running, you can create 5 samples by:

http://localhost:3000/seed

This will create 5 new users and reserve 5 slots in 1 lab at the same timeslot.
Note that these accounts do not have hashed passwords. They cannot be logged in normally.

You may then go to:

http://localhost:3000/Login.html

This will open the login page of the system.

OR

http://localhost:3000/register.html

This will open the register page of the system.

--------------------------------------------------