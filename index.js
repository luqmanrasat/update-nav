const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const { projectPath } = require('./config');

(async () => {
  try {
    const filePath = path.join(utils.resolveHome(projectPath), "views/enums/enums-asset-management-overview.jade");
    let readFile = fs.readFileSync(filePath, { encoding: 'utf8'});
  
    const fundLines = readFile.match(utils.pattern.fund);
    const dateLine = readFile.match(utils.pattern.date).pop();
    const fundsList = fundLines.map(line => line.replace(utils.pattern.fund, "$1"));

    const newValues = [4.4444, 5.5555, 6.6666, "31 February 1991"]
    const newDate = newValues.pop();
    const newFunds = newValues;

    let newFile = utils.updateFunds(fundLines, newFunds, readFile);
    newFile = utils.updateDate(dateLine, newDate, newFile);
  
    fs.writeFileSync(filePath, newFile);
  } catch (error) {
    console.error(error)
  }
})();