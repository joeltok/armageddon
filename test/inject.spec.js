const assert = require('assert');
const rimraf = require('rimraf');
const fs = require('fs');
const ncp = require('ncp').ncp;
const execSync = require('child_process').execSync;
const dircompare = require('dir-compare');

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
  before((done) => {
    if (fs.existsSync(testCodeDir)) {
      rimraf.sync(testCodeDir)
    }
    fs.mkdirSync(testCodeDir)
    done()
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





  // it ('# should successfully target file', async () => {
  //   const pathsToIgnore = []
  //
  //   await inject(`${__dirname}/altered`, pathsToIgnore);
  //   const result = dircompare.compareSync(`${__dirname}/altered`, `${__dirname}/fixtures/after`, {compareSize: true})
  //
  //   if (result.distinct !== 0) {
  //     let diffFilePaths = result.diffSet
  //       .filter(diff => diff.state === 'distinct')
  //       .map(diff => `${diff.path1}/${diff.name1} with\n${diff.path2}/${diff.name2}`)
  //     diffFilePaths = diffFilePaths.join('\n\n')
  //     throw new Error(`The following files are distinct:\n\n${diffFilePaths}`)
  //   }
  // })
  //
  // it ('# should not target file if it is part of .gitignore', async () => {
  //   const pathsToIgnore = [
  //     `${__dirname}/altered/ignore`,
  //     `${__dirname}/altered/iamnothere.js`,
  //     `${__dirname}/altered/.gitignore-standin`,
  //   ]
  //
  //   await inject(`${__dirname}/altered`, pathsToIgnore);
  //   const result = dircompare.compareSync(`${__dirname}/altered`, `${__dirname}/fixtures/after`, {compareSize: true})
  //
  //   if (result.distinct !== 0) {
  //     let diffFilePaths = result.diffSet
  //       .filter(diff => diff.state === 'distinct')
  //       .map(diff => `${diff.path1}/${diff.name1} with\n${diff.path2}/${diff.name2}`)
  //     diffFilePaths = diffFilePaths.join('\n\n')
  //     throw new Error(`The following files are distinct:\n\n${diffFilePaths}`)
  //   }
  // })
})
