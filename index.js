const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const { projectPath } = require('./config');

(async () => {
  try {
    const branch = 'update/nav-value';
    await utils.gitCheckoutPull(branch);
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
      confirm = await utils.promptConfirm();
    }
    
    console.log('Updating nav values...')
    let newFile = utils.updateFunds(fundLines, newFunds, readFile);
    newFile = utils.updateDate(dateLine, newDate, newFile);
    fs.writeFileSync(filePath, newFile);
    console.log('Nav values updated');

    await utils.gitAddCommit(filePath, 'Update nav value');
    await utils.gitPush(branch)

    const mergeStaging = await utils.promptMerge('staging');
    if (mergeStaging) {
      await utils.gitCheckoutPull('staging');
      await utils.gitMerge(branch);
      await utils.gitPush('staging');
    }
    else {
      throw new Error('Nav updated without merging to staging & master branch')
    }
    
    const mergeMaster = await utils.promptMerge('master');
    if (mergeMaster) {
      await utils.gitCheckoutPull('master');
      await utils.gitMerge(branch);
      await utils.gitPush('master')
    }
    else {
      throw new Error('Nav updated without merging to master branch')
    }

    console.log('Done without error');
  } catch (error) {
    console.error(error.message)
  }
})();