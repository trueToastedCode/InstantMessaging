function saveArray(arr) {
  if (arr === undefined || arr.length == 0) return []
  return arr.filter(function (el) {
    return el !== undefined && el !== null
  })
}

module.exports = {
  saveArray
}