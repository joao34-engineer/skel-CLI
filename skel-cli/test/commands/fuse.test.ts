import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('fuse', () => {
  it('runs fuse cmd', async () => {
    const {stdout} = await runCommand('fuse')
    expect(stdout).to.contain('hello world')
  })

  it('runs fuse --name oclif', async () => {
    const {stdout} = await runCommand('fuse --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
