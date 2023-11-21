const express = require('express');
const router = express.Router();
const Pusher = require('pusher');

// Initialize Pusher with your Pusher account credentials
const pusher = new Pusher({
    appId: "1708073",
    key: "ba7f827ca85ec8a94cb5",
    secret: "3df0df596bd697dbe88e",
    cluster: "ap1",
    useTLS: true
});

// Route for Pusher channel authentication
router.post('/pusher/auth', (req, res) => {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    const auth = pusher.authenticate(socketId, channel);
    res.send(auth);
});
router.post('/api/login', async (req, res) => {
    try {

        if (req.body.info) {
            await pusher.trigger('authChannel', 'login', req.body.info)

        }
        res.status(200).json(req.body)
    } catch (error) {
        res.status(505).json(error)
    }
})
router.post('/api/sendMessage', async (req, res) => {
    try {
        console.log(req.body.newMessage)
        if (req.body.newMessage) {
            try {
                let newMessage = req.body.newMessage

                await pusher.trigger("recieveMessage", newMessage.to.toString(), newMessage)
            } catch (error) {
                console.log(error)
            }
        }
        res.status(200).json(pusher)
    } catch (error) {
        res.status(505).json(error)
    }
})
module.exports = router;