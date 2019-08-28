const path = require('path');
const prompts = require('prompts');
const { abbreviations } = require('./config');

module.exports = {
  pattern: {
    fund: /.+\<td.+data\=\"nav\-(\w+)\".+\>/g,
    date: /.+\<div.+data\=\"nav\-date\".+\>/g,
    valueFund: /\d\.\d{4}/g,
    valueDate: /\d{1,2}\s(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}/g,
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
      const newLine = lines[i].replace(this.pattern.valueFund, newValues[i]);
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
    const newLine = line.replace(this.pattern.valueDate, newDate);
  
    return newFile = file.replace(line, newLine);
  }
}