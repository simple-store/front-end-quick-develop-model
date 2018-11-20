'use strict'
const config = require('../templates')

module.exports = () => {
  const { tpl } = config;
  const keys = Object.keys(tpl);
  console.log('------------------------------------------------------------------------------');
  console.log(`|     Name                   Branch     url                                  |`);
  keys.forEach(key => {
    const { url, branch } = tpl[key];
    console.log(`|     ${key}     ${branch}     ${url.slice(url.lastIndexOf('/') + 1)}        |`);
  })
  console.log('------------------------------------------------------------------------------');
  // console.log(config.tpl)
  process.exit()
}