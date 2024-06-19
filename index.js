const express = require('express');
const cors = require('cors');
const { pollQueue } = require('./services/NotificationProcessor');
const NotificationCounter = require("./services/NotificationCounter");
const notificationCounter = new NotificationCounter();

const app = express();
app.use(express.json());
app.use(cors()); 
require('dotenv').config();

const PORT = process.env.PORT;

setInterval(pollQueue, 10000);
app.get('/notifications/unread-counts', (req, res) => notificationCounter.getAllUnreadNotifications(req, res));
app.post('/notifications/mark-read', (req, res) => notificationCounter.markNotificationAsRead(req, res));

app.listen(PORT, () => {
  console.log(`Notification Delivery Service running on port ${PORT}`);
});

