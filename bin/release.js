#!/usr/bin/env node

// const inquirer = require('inquirer')
// const executeCommand = require('../lib/util/executeCommand')
const fs = require('fs')
const chalk = require('chalk')
const inquirer = require('inquirer')
const executeCommand = require('../lib/util/executeCommand')
const args = require('minimist')(process.argv.slice(2))
const registry = 'https://registry.npmjs.org/'

runRelease()

async function runRelease() {
  await checkCurrentGitBranch()
  await checkUncommitChanges()
  await runVersion()
  await runGitFlow()
  await runPublish()

  const version = require('../package.json').version
  console.log()
  console.log('🎉  ' + chalk.green(`Version ${version} successfully published to ${registry}.`))
}

async function runVersion() {
  let releasePattern = ['standard-version']

  if (args['first-release']) {
    releasePattern.push('--first-release')
    await executeCommand(releasePattern[0], releasePattern.slice(1))
    return
  }

  const releaseQuestions = [
    {
      type: 'list',
      name: 'releaseAs',
      message: 'Pick your release type.',
      choices: [
        {
          name: 'major',
          value: 'major'
        },
        {
          name: 'minor',
          value: 'minor'
        },
        {
          name: 'patch',
          value: 'patch'
        },
        {
          name: 'pre-release',
          value: 'prerelease'
        }
      ]
    }
  ]

  const { releaseAs } = await inquirer.prompt(releaseQuestions)

  if (releaseAs === 'prerelease') {
    const prereleaseQuestions = [
      {
        type: 'list',
        name: 'prereleaseType',
        message: 'Pick the pre-release type.',
        choices: [
          {
            name: 'alpha',
            value: 'alpha'
          },
          {
            name: 'beta',
            value: 'beta'
          },
          {
            name: 'rc',
            value: 'rc'
          }
        ]
      }
    ]
    const { prereleaseType } = await inquirer.prompt(prereleaseQuestions)
    releasePattern = releasePattern.concat(['--prerelease', prereleaseType])
  } else {
    releasePattern = releasePattern.concat(['--release-as', releaseAs])
  }

  if (args['skip-changelog']) {
    releasePattern = releasePattern.push('--skip.changelog')
  }

  await executeCommand(releasePattern[0], releasePattern.slice(1))
}

async function runGitFlow() {
  const gitPattern = {
    pulling: ['pull', 'origin', 'master'],
    pushing: ['push', 'origin', 'master']
  }
  const gitFlowQuestion = [
    {
      type: 'confirm',
      name: 'followTag',
      message: 'Also push relative tag ?'
    }
  ]
  const { followTag } = await inquirer.prompt(gitFlowQuestion)
  if (followTag) {
    gitPattern.pushing.push('--follow-tags')
  }
  await executeCommand('git', gitPattern.pulling)
  await executeCommand('git', gitPattern.pushing)
}

async function runPublish() {
  await executeCommand('npm', ['publish', '--access', 'public', '--registry', registry])
}

async function checkUncommitChanges() {
  let { stdout: uncommit } = await executeCommand('git', ['status', '--porcelain'], 'pipe')
  uncommit = uncommit.replace(/\n+/g, '').trim()
  if (uncommit) {
    console.log(
      chalk.red(`ERROR: You have uncommit changes, please stash or commit them before releasing.`)
    )
    process.exit()
  }
}

async function checkCurrentGitBranch() {
  // check current git branch, throw if not on "master"
  const branch = await getProjectGitBranch()
  if (branch !== 'master') {
    console.log(
      chalk.red(
        `ERROR: You are now on branch ${chalk.yellow(
          branch
        )}, you must commit or stash your changes and checkout to branch "master" before releasing a version.`
      )
    )
    process.exit()
  }
}

function getProjectGitBranch() {
  return new Promise(resolve => {
    const gitPath = `${process.cwd()}/.git`
    const headPath = gitPath + '/HEAD'
    const isInited = fs.statSync(gitPath).isDirectory()

    if (!isInited) {
      console.log(
        chalk.red(
          'ERROR: Can\'t find ".git" directory under current project, please make sure you initialized the git.'
        )
      )
      process.exit()
    }
    if (fs.existsSync(headPath)) {
      const refInfo = fs.readFileSync(headPath).toString()
      const branch = refInfo.replace(/ref:\s+refs\/heads\/([^\n]+)/, (s, g) => g).trim()
      branch && resolve(branch)
    }
  })
}
