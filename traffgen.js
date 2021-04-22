'use strict'

// global vars

const browser = '/opt/google/chrome/chrome'
const browserArgs = ['--headless', '--disable-gpu']
const minPageLoadInterval = 1000 // 1s
const maxPageLoadInterval = 20000 // 20s
const pageLoadTimeout = 10000 // 10s
let initialized = false

// import native modules
const { spawn } = require('child_process')

// import URL list
const websites = require('./urls.json')

// function for returning random number
function getRandomNum(min, max) {
  return Math.floor(Math.random() * ((max) - min) + min)
}

// function for spawning browser processes
function launchBrowser(website) {

  const processArgs = [ ...browserArgs, ...[website]]
  console.log(`loading '${website}'...`)
  return spawn(browser, processArgs)

}

function begin () {

  let delay

  if (initialized === false) {
    delay = 0
    initialized = true
  } else {
    delay = getRandomNum(minPageLoadInterval, maxPageLoadInterval)
    console.log(`waiting ${delay} ms...`)
  }

  
  let website = websites[getRandomNum(0, websites.length)]
  let processRunning = false

  setTimeout(()=>{

    let pageLoad = launchBrowser(website)
    processRunning = true

    pageLoad.on('exit', code => {
      console.log(`page load '${website}' process exited, return code '${code}'.`)
      processRunning = false
      begin()
    })

    // kill page if it has not closed after timeout

    setTimeout(() => {
      if (processRunning === true) {
        console.log(`killing '${website}'page load process.`)
        pageLoad.kill('SIGKILL')
      }

    }, pageLoadTimeout)

  }, delay)

}

console.log('starting web traffic generation...')
begin()