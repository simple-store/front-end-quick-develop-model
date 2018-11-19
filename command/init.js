'use strict'
const exec = require('child_process').exec
const config = require('../templates')
const co = require('co')
const prompt = require('co-prompt')
const chalk = require('chalk')
const suffixWithDoc = [
  '.browserslistrc',
  '.editorconfig',
  '.eslintrc.js',
  '.gitignore',
]
module.exports = () => {
  const { tpl } = config;
  const keys = Object.keys(tpl);
  keys.forEach(key => {
    const { url, branch } = tpl[key];
    console.log('------------------------------------------------------------------------------');
    console.log(`|     Name                   Branch     url                                  |`);
    console.log(`|     ${key}     ${branch}     ${url.slice(url.lastIndexOf('/') + 1)}        |`);
    console.log('------------------------------------------------------------------------------');
  })
  
  co(function* () {
    // 处理用户输入
    let tplName = yield prompt('Template name: ');
    if (!config.tpl[tplName]) {
      console.log(chalk.red('\n × Template does not exit!'))
      process.exit()
    }
    const yesArr = ['YES', 'Y'];
    const noArr = ['NO', 'N'];
    let isRootPath, isRoot;
    while (true) {
      isRootPath = yield prompt('Downloading template in the root dictionay?(Y/N):');
      isRootPath = isRootPath.toUpperCase();
      if (yesArr.includes(isRootPath) || isRootPath === '') {
        isRoot = true;
        break;
      } else if (noArr.includes(isRootPath)) {
        isRoot = false;
        break;
      }
    }
    let projectName = `${tplName}${Date.now()}`;
    if (!isRoot) {
      projectName = yield prompt('Project name: ')
    }

    const { url: gitUrl, branch } = config.tpl[tplName]
    // git命令，远程拉取项目并自定义项目名
    let cmdStr = `git clone ${gitUrl} ${projectName}`
    console.log(chalk.white('\n Start generating...'))

    exec(cmdStr, error => {
      if (error) {
        console.log(error)
        process.exit()
      }
      console.log(projectName);
      const checkoutCmd = `cd ${projectName} && git checkout ${branch} && rm -rf .git && cd ..`
      const exitCheckOutCMD = (callback) => {
        exec(checkoutCmd, err => {
          if (err) {
            console.log(err);
            process.exit();
          }
          callback();
        })
      }
      const success = () => {
        console.log(chalk.green('\n √ Generation completed!'))
        console.log(`\n you can run your project by npm start now! \n`)
        process.exit();
      }
      exitCheckOutCMD(() => {
        if (isRoot) {
          const delCMD = `mv -f ${process.cwd()}/${projectName}/* ${process.cwd()} && rm -rf ${projectName} && npm install`
          console.log(`mv -f ${process.cwd()}/${projectName}/* ${process.cwd()} && rm -rf ${projectName}`)
          // 执行挪动文件夹操作
          exec(delCMD, (err) => {
            if (err) {
              console.log(err)
            }
            success();
          })
        } else {
          success();
        }
      })
    })
  })
}