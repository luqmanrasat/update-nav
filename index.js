const path = require('path');
const fs = require('fs');
const prompts = require('prompts');
const utils = require('./utils');
const { projectPath } = require('./config');

(async () => {
  try {
    const filePath = path.join(projectPath, "views/enums/enums-asset-management-overview.jade");
    let readFile = fs.readFileSync(filePath, { encoding: 'utf8'});
  
    const fundLines = readFile.match(utils.pattern.fund);
    const dateLine = readFile.match(utils.pattern.date).pop();
    const fundsList = fundLines.map(line => line.replace(utils.pattern.fund, "$1"));

    let newFunds;
    let newDate;
    let confirm = false;
    while (!confirm) {
      newFunds = [];
      for (const fund of fundsList) {
        const newValue = await utils.promptFund(fund);
        newFunds.push(newValue);
      }
      newDate = await utils.promptDate();

      const question = [
        {
          type: 'confirm',
          name: 'value',
          message: 'Confirm values?',
        }
      ];
      const onCancel = () => {
        throw new Error('Exited before complete')
      }
      const response = await prompts(question, { onCancel });
      confirm = response.value;
    }
    
    let newFile = utils.updateFunds(fundLines, newFunds, readFile);
    newFile = utils.updateDate(dateLine, newDate, newFile);
  
    fs.writeFileSync(filePath, newFile);
    console.log('Nav values updated')
  } catch (error) {
    console.error(error)
  }
})();