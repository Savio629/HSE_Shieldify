Stream = require('node-rtsp-stream')
stream = new Stream({
  name: 'name',
  streamUrl: 'rtsp://admin:L23F18C4@192.168.123.191:554/cam/realmonitor?channel=1&subtype=0',
  wsPort: 9999,
  ffmpegOptions: { 
    '-stats': '', 
    '-r': 30,
    '-max_delay': '5000000',
    '-rtsp_transport': 'tcp', 
  }
})
