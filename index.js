const path = require('path');
const fs = require('fs');
const prompts = require('prompts');
const utils = require('./utils');
const { projectPath } = require('./config');

(async () => {
  try {
    await utils.gitCheckoutPull('update/nav-value');
    const filePath = path.join(projectPath, "views/enums/enums-asset-management-overview.jade");
    let readFile = fs.readFileSync(filePath, { encoding: 'utf8'});
  
    const patternFund = new RegExp(utils.pattern.fund, 'g');
    const fundLines = readFile.match(patternFund);
    const fundsList = fundLines.map(line => line.replace(patternFund, "$1"));
    const patternDate = new RegExp(utils.pattern.date, 'g');
    const dateLine = readFile.match(patternDate).pop();

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
    
    console.log('Updating nav values...')
    let newFile = utils.updateFunds(fundLines, newFunds, readFile);
    newFile = utils.updateDate(dateLine, newDate, newFile);
    fs.writeFileSync(filePath, newFile);
    console.log('Nav values updated')

    await utils.gitAddCommit(filePath, 'Update nav value');
    
  } catch (error) {
    console.error(error)
  }
})();