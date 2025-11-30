const fs = require('fs').promises;
const path = require('path');
const saveloc = path.join(__dirname);

async function readCache(readFrom) {
  try {
    const cache = await fs.readFile(readFrom, 'utf8');
    return JSON.parse(cache);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // create empty cache
      await writeCache(readFrom, {});
      return {};
    } else {
      console.log('Failed to read cache: ');
      return {};
    }
  }
}

async function writeCache(writeTo, writeThis) {
  try {
    await fs.writeFile(writeTo, JSON.stringify(writeThis,null,2), 'utf8')
  }
  catch (err) {
    console.log('Failed to write cache: ', err);
  }
}

module.exports = {
  readCache,
  writeCache
}