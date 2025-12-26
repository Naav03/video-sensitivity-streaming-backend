
const router = require('express').Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const Video = require('../models/Video')
const auth = require('../middleware/auth')

const upload = multer({ dest: 'uploads/' })

router.post('/upload', auth(['editor','admin']), upload.single('video'), async(req,res)=>{
  const video = await Video.create({ filename:req.file.filename, owner:req.user.id })
  const io = req.app.get('io')
  let progress = 0
  const interval = setInterval(async()=>{
    progress += 20
    io.emit('progress',{videoId:video._id, progress})
    if(progress>=100){
      clearInterval(interval)
      video.status = Math.random()>0.2?'safe':'flagged'
      await video.save()
    }
  },500)
  res.json(video)
})

router.get('/', auth(), async(req,res)=>{
  const videos = await Video.find({ owner:req.user.id })
  res.json(videos)
})

router.get('/stream/:id', auth(), async(req,res)=>{
  const video = await Video.findById(req.params.id)
  const videoPath = path.join('uploads', video.filename)
  const stat = fs.statSync(videoPath)
  const range = req.headers.range
  const fileSize = stat.size

  if(range){
    const parts = range.replace(/bytes=/,'').split('-')
    const start = parseInt(parts[0])
    const end = parts[1]?parseInt(parts[1]):fileSize-1
    const stream = fs.createReadStream(videoPath,{start,end})
    res.writeHead(206,{
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges':'bytes',
      'Content-Length': end-start+1,
      'Content-Type':'video/mp4'
    })
    stream.pipe(res)
  } else {
    res.writeHead(200,{
      'Content-Length':fileSize,
      'Content-Type':'video/mp4'
    })
    fs.createReadStream(videoPath).pipe(res)
  }
})

module.exports = router
