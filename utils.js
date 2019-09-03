const prompts = require('prompts');
const { projectPath, abbreviations } = require('./config');
const git = require('simple-git/promise')(projectPath);

module.exports = {
  pattern: {
    fund: '.+\\<td.+data\\=\\"nav\\-(\\w+)\\".+\\>',
    date: '.+\\<div.+data\\=\\"nav\\-date\\".+\\>',
    valueFund: "^\\d\\.\\d{4}$",
    valueDate: "^\\d{1,2}\\s(January|February|March|April|May|June|July|August|September|October|November|December)\\s\\\d{4}$",
    replace: "(.+\\>)(.+)(\\<.+)"
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
  /**
   * Prompts user to input new fund value
   *
   * @param fundName
   * @returns {string}
   */
  async promptFund(fundName) {
    if (!abbreviations[fundName]) {
      throw new Error(`Please define fund:"${fundName}" in config.js`)
    }

    let done = false;
    while (!done) {
      const question = [
        {
          type: 'text',
          name: fundName,
          message: `Enter new value for ${abbreviations[fundName]}:`
        }
      ];
      const onCancel = () => {
        throw new Error('Exited before complete')
      }
      const response = await prompts(question, { onCancel });

      const pattern = new RegExp(this.pattern.valueFund, 'g');
      if (pattern.test(response[fundName])) {
        return response[fundName]
      }

      console.log('Invalid input. Example: 0.1234');
    }
  },
  /**
   * Prompts user to input new source date
   *
   * @returns {string}
   */
  async promptDate() {
    let done = false;
    while (!done) {
      const question = [
        {
          type: 'text',
          name: 'date',
          message: 'Enter new date:'
        }
      ];
      const onCancel = () => {
        throw new Error('Exited before complete')
      }
      const response = await prompts(question, { onCancel });

      const pattern = new RegExp(this.pattern.valueDate, 'g');
      if (pattern.test(response.date)) {
        return response.date
      }

      console.log('Invalid input. Example: 29 August 2019');
    }
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
  
    let newFile = file;
    for (let i = 0; i < newLines.length; i++) {
      newFile = newFile.replace(lines[i], newLines[i]);
    }
  
    return newFile;
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
    const text = `As at ${newDate}`;
    const pattern = new RegExp(this.pattern.replace, 'g');
    const newLine = line.replace(pattern, `$1${text}$3`);
  
    return newFile = file.replace(line, newLine);
  }
}