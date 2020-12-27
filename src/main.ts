import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec'

async function run(): Promise<number> {
  try {
    let myOutput = ''
    let myError = ''

    const prefix = core.getInput('prefix', {required: false})

    const options: ExecOptions = {}
    options.listeners = {
      stdout: (data: Buffer) => {
        myOutput += data.toString()
      },
      stderr: (data: Buffer) => {
        myError += data.toString()
      }
    }

    process.env['PREFIX'] = prefix

    await exec.exec(
      'git clone',
      ['https://github.com/sobolevn/git-secret.git', 'git-secret'],
      options
    )
    await exec.exec('sudo make build -C ./git-secret')
    await exec.exec('sudo make install -C ./git-secret')
  } catch (err) {
    const errorAsString: string = (err ?? 'undefined error').toString()
    core.debug('Error: ' + errorAsString)
    core.error(errorAsString)
    core.setFailed('install git-secret failed')
    return 1
  }

  core.info('install git-secret succeeded')
  return 0
}

run()
  .then(ret => {
    process.exitCode = ret
  })
  .catch(error => {
    console.error('run() failed!', error)
    process.exitCode = 1
  })
