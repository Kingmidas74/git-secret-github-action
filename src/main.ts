import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec'
import * as coreCommand from '@actions/core/lib/command'
import * as tc from '@actions/tool-cache';
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

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
      },            
    }    
    console.log('install git-secret...')
    process.env['PREFIX'] = prefix    
    await exec.exec('rm',['-rf','/tmp/git-secret'])
    await exec.exec(	   
      'git',	    
      ['clone', 'https://github.com/sobolevn/git-secret.git', '/tmp/git-secret'],	    
      options	   
    )	   
    await exec.exec(`sudo make build -C /tmp/git-secret`,[],options)	    
    await exec.exec(`sudo make install -C /tmp/git-secret`,[],options)	

    
  } catch (err) {
    const errorAsString: string = (err ?? 'undefined error').toString()
    core.debug('Error: ' + errorAsString)
    core.error(errorAsString)
    core.setFailed('install git-secret failed')
    return 1
  }

  core.info('install git-secret from source succeeded')
  return 0
}

async function cleanup(): Promise<void> {
  try {
    console.info('clean up git-secret');
    await exec.exec('rm -rf ~/git-secret')
    await exec.exec('rm -rf ./git-secret')
  } catch (error) {
    core.warning(error.message)
  }
}

if (!(!!process.env['STATE_isPost'])) {
  coreCommand.issueCommand('save-state', {name: 'isPost'}, 'true')
  run()
  .then(ret => {
    process.exitCode = ret
  })
  .catch(error => {
    console.error('run() failed!', error)
    process.exitCode = 1
  })
}
else {
  cleanup()
}


