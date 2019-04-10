const assert = require('assert');
const rimraf = require('rimraf');
const ncp = require('ncp').ncp;
const execSync = require('child_process').execSync;
const dircompare = require('dir-compare');

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

  it ('# should successfully convert fixtures/before/ into fixtures/after/', async () => {
    await asteroid.shower(`${__dirname}/altered`);
    const result = dircompare.compareSync(`${__dirname}/altered`, `${__dirname}/fixtures/after`, {compareSize: true})

    if (result.distinct !== 0) {
      let diffFilePaths = result.diffSet
        .filter(diff => diff.state === 'distinct')
        .map(diff => `${diff.path1}/${diff.name1} with\n${diff.path2}/${diff.name2}`)
      diffFilePaths = diffFilePaths.join('\n\n')
      throw new Error(`The following files are distinct:\n\n${diffFilePaths}`)
    }
  })
})
