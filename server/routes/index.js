var express = require('express');
var router = express.Router();
var path = require('path');

const Fs = require('fs')
const Path = require('path')
const Listr = require('listr')
const Axios = require('axios')
const shell = require('shelljs');
var hash_name = 'unique_hash'

/* GET home page. */
router.get('/', function(req, res, next) {
 res.render('index', {
  title: 'VideoCutTool'
 });
});

/* Trims the Video using ffmpeg */
function trim(req) {
 var from_time = req.body.from_time
 var to_time = req.body.to_time
 var in_location = Path.resolve(__dirname, 'videos', hash_name + '.mp4')
 var out_location = Path.resolve(__dirname, 'cropped', hash_name + '_trimmed.mp4')

 shell.echo(" " + from_time + " " + to_time + " " + in_location + " " + out_location);

 var cmd = 'ffmpeg -i ' + in_location + ' -ss ' + from_time + ' -t ' + to_time + ' -async 1 ' + out_location;
 console.log("Command" + cmd);

 if (shell.exec(cmd, (error, stdout, stderr) => {
   console.log(stdout);
   console.info("Program Started");
   console.log(stderr);
   if (error !== null) {
    console.log(`exec error: ${error}`);
   }
  }).code !== 0) {
  shell.echo("Error");
 }
 res.render('index', {
  message: "success"
 });
}

/* Downloads the video. */
async function tasks(req) {
 const url = req.body.inputVideoUrl
 const path = Path.resolve(__dirname, 'videos', hash_name + '.mp4')
 const writer = Fs.createWriteStream(path)

 const response = await Axios({
  url,
  method: 'GET',
  responseType: 'stream'
 })

 response.data.pipe(writer)
 console.log("download")
 return new Promise((resolve, reject) => {
  writer.on('finish', resolve)
  writer.on('error', reject)
 })
}

/* Main function to start tasks(downloading the video and trimming the video)*/
async function start(req) {
 await tasks(req);
 trim(req);
}

router.post('/send', function(req, res, next) {
 console.log('Hit Send')

 start(req);

});

router.get('/insert', function(req, res, next) {
 res.sendFile(path.join(__dirname + "/" + "htmlfiles/insert.html"));
});

module.exports = router;
