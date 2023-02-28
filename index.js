const app = require('./app');
const http = require('http')
const {SERVER_PORT} = process.env
const server = http.createServer(app);

app.listen(process.env.PORT || SERVER_PORT, (err) =>{
	if(err)
		console.log('Unable to start the server!');
	else
		console.log('server started running on :' + SERVER_PORT);
})
