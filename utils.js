const path = require('path');
const { abbreviations } = require('./config');

module.exports = {
  pattern: {
    fund: /.+\<td.+data\=\"nav\-(\w+)\".+\>/g,
    date: /.+\<div.+data\=\"nav\-date\".+\>/g,
    valueFund: /\d\.\d{4}/g,
    valueDate: /\d{1,2}\s(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}/g,
  },
  resolveHome(filePath) {
    if (filePath[0] === '~') {
        return path.join(process.env.HOME, filePath.slice(1));
    }
    return path.resolve(__dirname, filePath);
  },
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
  updateDate(line, newDate, file) {
    const newLine = line.replace(this.pattern.valueDate, newDate);
  
    return newFile = file.replace(line, newLine);
  }
}