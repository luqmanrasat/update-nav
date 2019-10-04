const prompts = require('prompts');
const readXlsxFile = require('read-excel-file/node');
const schema = require('./schema');
const { projectPath } = require('../config');
const git = require('simple-git/promise')(projectPath);

const onCancel = () => {
  throw new Error('Exited before complete')
}

module.exports = {
  pattern: {
    fund: '.+\\<td.+data\\=\\"nav\\-(\\w+)\\".+\\>',
    date: '.+\\<div.+data\\=\\"nav\\-date\\".+\\>',
    replace: "(.+\\>)(.+)(\\<.+)"
  },

  /**
   * Read .xlsx file and retrive nav values & date
   *
   * @param filePath
   * @returns {object}
   */
  async getNavFromXlsx(filePath) {
    return readXlsxFile(filePath, { schema })
      .then(({ rows }) => {
        const newNav = [];
        rows.forEach(row => {
          newNav.push(row.nav.toFixed(4));
        });

        const newDate = rows[0].sourceDate;

        return { newNav, newDate };
      });
  },

  /**
   * Update fund values in file
   *
   * @param lines
   * @param newValues
   * @param file
   * @returns {string}
   */
  updateFunds(lines, newValues, file) {
    const newLines = [];
    for (let i = 0; i < newValues.length; i++) {
      const pattern = new RegExp(this.pattern.replace, 'g');
      const newLine = lines[i].replace(pattern, `$1${newValues[i]}$3`);
      newLines.push(newLine);
    }

    for (let i = 0; i < newLines.length; i++) {
      file = file.replace(lines[i], newLines[i]);
    }
  
    return file;
  },

  /**
   * Update source date in file
   *
   * @param line
   * @param newDate
   * @param file
   * @returns {string}
   */
  updateDate(line, newDate, file) {
    const pattern = new RegExp(this.pattern.replace, 'g');
    const newLine = line.replace(pattern, `$1${newDate}$3`);
  
    return file.replace(line, newLine);
  },

  /**
   * Prompts user to confirm value
   *
   * @returns {boolean}
   */
  async promptConfirmNav() {
    const question = [
      {
        type: 'confirm',
        name: 'confirmNav',
        message: `Confirm nav values?`,
      }
    ];
    const response = await prompts(question, { onCancel });
    return response['confirmNav'];
  },

  /**
   * Prompts user to confirm merge
   *
   * @param branchName
   * @returns {boolean}
   */
  async promptMerge(branchName) {
    const question = [
      {
        type: 'confirm',
        name: branchName,
        message: `Merge with ${branchName} branch?`,
      }
    ];
    const response = await prompts(question, { onCancel });
    return response[branchName];
  },

  /**
   * Git checkout to other branch & pull latest changes
   *
   * @param branchName
   */
  async gitCheckoutPull(branchName) {
    await git.checkout(branchName);
    console.log(`Current branch: '${branchName}'`);
    console.log('Pull branch...');
    const pull = await git.pull();
    console.log(pull.summary);
  },

  /**
   * Git add file & commit changes
   *
   * @param filePath
   * @param message
   */
  async gitAddCommit(filePath, message) {
    await git.add(filePath);
    console.log(`Staged ${filePath} for commit`);
    await git.commit(message);
    console.log('Done commit changes');
  },

  /**
   * Git merge
   *
   * @param branchName
   */
  async gitMerge(branchName) {
    console.log('Merging branch...');
    const merge = await git.mergeFromTo('update/nav-value', branchName, {'--no-edit': null});
    console.log(merge.summary);
  },

  /**
   * Git push
   *
   * @param branchName
   */
  async gitPush(branchName) {
    console.log('Pushing branch...');
    await git.push('origin', branchName);
    console.log('Done push');
  },
}