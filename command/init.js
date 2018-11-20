'use strict'
const { exec } = require('child_process');
const config = require('../templates');
const co = require('co');
const prompt = require('co-prompt');
const chalk = require('chalk');
const suffixWithDoc = [
  '.browserslistrc',
  '.editorconfig',
  '.eslintrc.js',
  '.gitignore',
]
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
  
  co(function *() {
    const PROCESS_CWD = process.cwd();
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

    const handleInfo = (err, isContinue = false) => {
      if (err) {
        console.log(err);
        if (isExit) process.exit();
      }
      if (isContinue) {
        console.log(chalk.green('\n √ Generation completed!'))
        console.log(`\n you can run your project by npm start now! \n`)
        process.exit();
      }
    }
    exec(cmdStr, error => {
      handleInfo(error);
      const checkoutCmd = `cd ${projectName} && git checkout ${branch} && rm -rf .git && cd ..`;
      const exitCheckOutCMD = (callback) => {
        exec(checkoutCmd, err => {
          handleInfo(err);
          callback();
        })
      }
      for (const i of suffixWithDoc) {
        exec(`mv -f ${PROCESS_CWD}/${projectName}/${i} ${PROCESS_CWD}`,err => handleInfo(err));
      }
      exitCheckOutCMD(() => {
        if (isRoot) {
          const mvCMD = `mv -f ${PROCESS_CWD}/${projectName}/* ${PROCESS_CWD} && rm -rf ${projectName} && npm install`
          // 执行挪动文件夹操作
          exec(mvCMD, (err) => {
            if (err) handleInfo(err);
            else handleInfo(null, true);
          })
        } else {
          handleInfo(null, true);
        }
      })
    })
  })
}