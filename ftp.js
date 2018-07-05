#!/usr/bin/env node
require('colors');

const cp = require('child_process');
const args = require('minimist')(process.argv.slice(2));
const SFTPClient = require('ssh2-sftp-client');

const SFTP_CREDENTIALS = {
  dev: {
    host: 'clearlabsdev.sftp.wpengine.com',
    port: '2222',
    username: 'clearlabsdev-codeship-dev',
    password: '(0D3sh1pd3V'
  }
};
const FTP_IGNORE = {

};
const env = args.env;
const SFTP_SETTINGS = SFTP_CREDENTIALS[env];
const sftp = new SFTPClient();

sftp.connect(SFTP_SETTINGS)
.then(() => {
  return cp.execSync(`git log --pretty="%h" -1`).toString().split('\n')[0];
}).then(hash => {
  let diffTree = cp.execSync(`git diff-tree --name-status --no-commit-id ${hash}`).toString('utf-8');
  console.log('diffTree for hash', hash);
  return diffTree;
}).then((data) => {
  console.log(data);
  process.exit();
}).catch((err) => {
    console.log(err, 'catch error');
    process.exit();
})
