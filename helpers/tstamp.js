function tstamp() {
  return Math.floor((new Date().getTime()) / 1000)
}

module.exports = {
  tstamp
}