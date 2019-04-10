const assert = require('assert');
const rimraf = require('rimraf');
const ncp = require('ncp').ncp;
const execSync = require('child_process').execSync;

const asteroid = require('../lib/asteroid');

ncp.limit = 16;

describe('Test armageddon', () => {
  beforeEach((done) => {
    rimraf.sync(`${__dirname}/altered`)
    ncp(`${__dirname}/fixtures/before`, `${__dirname}/altered`, (err) => {
      if (err) {
        throw new Error(err);
      };
      done();
    })
  })

  it ('# should successfully convert fixtures/before/ into fixtures/after/', () => {
    asteroid.shower(`${__dirname}/altered`)
  })
})
