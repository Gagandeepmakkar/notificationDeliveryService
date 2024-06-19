const AWS = require('aws-sdk');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Post = require('../models/Post');
const WebSocket = require('ws');


mongoose.connect('mongodb+srv://22gaganld:22gaganld@demo.lgslbjd.mongodb.net/NotificationManagement?retryWrites=true&w=majority&appName=Demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'eu-north-1' 
  });
  
  const sqs = new AWS.SQS();
  
  const QUEUE_URL = 'https://sqs.eu-north-1.amazonaws.com/730335591683/NotificationService.fifo';

  const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('message', message => {
    console.log('Received:', message);
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


  const processMessage = async (message) => {
    let body;
    try {
      body = JSON.parse(message.Body);
    } catch (error) {
      console.error('Error parsing message body:', message.Body);
      return;
    }
  
    const { postId, userId, type } = body;

    const notification = new Notification({ userId, postId, type });
    const notificationId =notification._id;

    await notification.save();
  
    await sendRealTimeNotification(userId, notification , notificationId , type);
  
    console.log(`Notification created: ${notification._id} for user: ${userId}`);
  };
  const sendRealTimeNotification = (userId, notification , notificationId , type) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ userId, notification , notificationId , type}));
      }
    });
  };
  
  const pollQueue = async () => {
    const params = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };
  
    try {
      const data = await sqs.receiveMessage(params).promise();
      if (data.Messages) {
        for (const message of data.Messages) {
          await processMessage(message);

          await sqs.deleteMessage({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          }).promise();
        }
      }
    } catch (error) {
      console.error('Error polling SQS:', error);
    }
  };
 
  
  module.exports = { pollQueue };