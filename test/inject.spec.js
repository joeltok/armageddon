const assert = require('assert');
const rimraf = require('rimraf');
const fs = require('fs');
const ncp = require('ncp').ncp;
const execSync = require('child_process').execSync;
const dircompare = require('dir-compare');
const sinon = require('sinon');

const inject = require('../lib/inject');

ncp.limit = 16;
const testCodeDir = `${__dirname}/altered`

function ncpPromise(source, destination) {
  return new Promise((resolve, reject) => {
    ncp(source, destination, (err) => {
      if (err) reject(err);
      resolve(true)
    })
  })
}

describe('lib/inject.js', () => {
  let exitStub;
  let sandbox;

  before((done) => {
    sandbox = sinon.sandbox.create();

    if (fs.existsSync(testCodeDir)) {
      rimraf.sync(testCodeDir)
    }
    fs.mkdirSync(testCodeDir)
    done()
  })

  beforeEach(() => {
    sandbox.restore();

    exitStub = sandbox.stub(process, 'exit')
    exitStub.throws(new Error('exit process'))
  })

  it ('# should successfully recurse on folder', async () => {
    const source      = `${__dirname}/fixtures/recurse/before`;
    const comparePath = `${__dirname}/fixtures/recurse/after`;
    const destination = `${testCodeDir}/recurse`;

    await ncpPromise(source, destination)

    const pathsToIgnore = [
      `${testCodeDir}/recurse/ignore`,
      `${testCodeDir}/recurse/iamnothere.js`,
      `${testCodeDir}/recurse/.gitignore-standin`,
    ]

    await inject(destination, pathsToIgnore);
    const result = dircompare.compareSync(destination, comparePath, {compareSize: true})

    if (result.distinct !== 0) {
      let diffFilePaths = result.diffSet
        .filter(diff => diff.state === 'distinct')
        .map(diff => `${diff.path1}/${diff.name1} with\n${diff.path2}/${diff.name2}`)
      diffFilePaths = diffFilePaths.join('\n\n')
      throw new Error(`The following files are distinct:\n\n${diffFilePaths}`)
    }
  })

  it ('# should successfully target file', async () => {
    const source      = `${__dirname}/fixtures/singleTarget/before.js`;
    const comparePath = `${__dirname}/fixtures/singleTarget/after.js`;
    const destination = `${testCodeDir}/singleTarget.js`;

    await ncpPromise(source, destination)

    const pathsToIgnore = []

    await inject(destination, pathsToIgnore);
    const result = dircompare.compareSync(destination, comparePath, {compareSize: true})

    if (result.distinct !== 0) {
      let diffFilePaths = result.diffSet
        .filter(diff => diff.state === 'distinct')
        .map(diff => `${diff.path1}/${diff.name1} with\n${diff.path2}/${diff.name2}`)
      diffFilePaths = diffFilePaths.join('\n\n')
      throw new Error(`The following files are distinct:\n\n${diffFilePaths}`)
    }
  })

  it ('# should not target file if it is part of .gitignore', async () => {
    const source      = `${__dirname}/fixtures/singleTargetFail/before.js`;
    const comparePath = `${__dirname}/fixtures/singleTargetFail/after.js`;
    const destination = `${testCodeDir}/singleTargetFail.js`;

    await ncpPromise(source, destination)

    const pathsToIgnore = [
      destination,
    ]

    try {
      await inject(destination, pathsToIgnore);
      throw new Error('Supposed to exit');
    } catch (err) {
      assert(err.message === 'exit process');
    }

    const result = dircompare.compareSync(destination, comparePath, {compareSize: true})

    if (result.distinct !== 0) {
      let diffFilePaths = result.diffSet
        .filter(diff => diff.state === 'distinct')
        .map(diff => `${diff.path1}/${diff.name1} with\n${diff.path2}/${diff.name2}`)
      diffFilePaths = diffFilePaths.join('\n\n')
      throw new Error(`The following files are distinct:\n\n${diffFilePaths}`)
    }
  })
})
