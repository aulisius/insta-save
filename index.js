#!/usr/bin/env node
const fetch = require('node-fetch')
const URL = require('url')
const cli = require('cli')
const fs = require('fs')

const options = cli.parse({
  url: ['u', 'The url of image or video', 'url'],
  output: ['o', 'The output file', 'file'],
  res: ['r', 'The resolution of the image: 1080, 720 etc.', 'string']
})

const fetchURL = url => `https://electron.forfuture.tech/insta/api/v1/download?url=${url}`

const download = (url) => fetch(url)
  .then(res => res.json())
  .then(res => {
    if (res.message !== 'OK') {
      throw new Error('Download failed. Check URL and try again')
    }
    return res.images
  })


function startDownload({ url, output, res = '720p' }) {
  if (url || cli.args.length > 0) {
    download(fetchURL(url || cli.args[0]))
      .then((images = []) => {
        let { url } = images.find(image => image.resolution === res) || images[images.length - 1]
        output = output || URL.parse(url).pathname.split('/').reverse()[0]
        return url
      })
      .then(fetch)
      .then(res => res.buffer())
      .then(buffer => fs.writeFileSync(output, buffer))
      .catch(console.error)
  } else {
    cli.error('No URL supplied.')
  }
}

function getDefaultOpts(options) {
  if (!options.res) {
    options.res = '720p'
  }
  return options
}

startDownload(getDefaultOpts(options))