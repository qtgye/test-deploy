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
})
.then(hash => {
  let diffTree = cp.execSync(`git diff-tree --name-status --no-commit-id ${hash}`).toString('utf-8');
  console.log('diffTree for hash', hash);
  return diffTree;
})
.then(diffTree => {
  console.log(diffTree.yellow);
   // Construct an array of files with method (added, modified, deleted)
  return = diffTree.split('\n').slice(0,-1)
    // Build file info object
    .map( item => {
      item = item.replace('\t', ':::').split(':::');
      return { method: item[0], path: item[1].trim() };
    })
    // Remove ftp-ignored files
    .filter( item => {
      let willIgnoreFile = FTP_IGNORE.some( _pattern => {
        let willIgnore = _pattern.test(item.path);
        if ( willIgnore ) {
          console.log(`Ignoring file: ${item.path}`);
        }
        return willIgnore;
      });
      return !willIgnoreFile;
    })
    // Parse directories to ensure on remote
    .map( item => {
      let dir = item.path.match( /(.+)\/.+$/i );
      if ( dir && !ensureDirs.includes(dir[1]) && item.method !== 'D' ) {
        ensureDirs.push(dir[1]);
      }
      return item;
    });
})
.then( diffTree => {
  console.log(diffTree);
})
.then((data) => {
  console.log(data);
  process.exit();
}).catch((err) => {
    console.log(err, 'catch error');
    process.exit();
})
