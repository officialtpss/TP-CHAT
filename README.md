# Tp-Chat App

A simple chat app built on [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [Socket.io](https://socket.io/) and [MongoDb](https://www.mongodb.com/) .

The node.js chat app allows you to communicate with your customers through chat. It enables you to send and receive messages. Chatting apps make it easier, simpler and faster to connect with everyone and it is also easy to use. There are many types of chatting apps and every one has its own format, design and functions:

# Features

  <li>Uses Express as the application Framework.</li> 
  <li>Real-time communication between a client and a server using Socket.io.</li>
  <li>Uses MongoDB, Mongoose  for storing messages and querying data.</li>
  <li>Uses RESTful Web Service for serve different platforms</li> 
   
The app demonstrates how decoupling content from its presentation enables greater flexibility and facilitates shipping higher quality software more quickly.

## Requirements

- Node 16.16.0
- Git
- npm 8.11.0

### Running Locally

Make sure you have Node.js and npm install.

1. Clone or Download the repository

2. Install Dependencies
<pre>npm install</pre>
3. MongoDB start for need <pre>mongod</pre>command from a different terminal.

4. Start the Application
      <pre>node app.js</pre>
   Application runs from localhost:3000.

## How It Works

A database called "tp-chat" named is created via code.


## Steps for read-only access

To start the express server, run the following

```bash
npm run start
```

Open [http://localhost:3000](http://localhost:3000) and take a look around.

-->

## RESTful

Using HTTP requests, we can use the respective action to trigger every of these four CRUD operations.  
 <li>POST is used to send data to a server — Create</li>
<li>GET is used to fetch data from a server — Read</li>
<li>PUT is used to send and update data — Update</li>
<li>DELETE is used to delete data — Delete </li>
