const path = require('path');
const fs = require('fs');
const utils = require('./lib/utils');
const { projectPath } = require('./config');

(async () => {
  try {
    const xlsxFilePath = path.resolve(__dirname, 'nav-datasheet.xlsx');
    const jadeFilePath = path.join(projectPath, "views/enums/enums-asset-management-overview.jade");
    
    const branch = 'update/nav-value';
    await utils.gitCheckoutPull(branch);
    let readFile = fs.readFileSync(jadeFilePath, { encoding: 'utf8'});
  
    const patternFund = new RegExp(utils.pattern.fund, 'g');
    const fundLines = readFile.match(patternFund);
    const patternDate = new RegExp(utils.pattern.date, 'g');
    const dateLine = readFile.match(patternDate).pop();

    console.log('Getting values from nav-datasheet.xlsx...');
    const { newNav, newDate } = await utils.getNavFromXlsx(xlsxFilePath);
    console.log("Nav Values: "+ newNav);
    console.log("Date: "+ newDate);

    const confirmNav = await utils.promptConfirmNav();
    if (!confirmNav) {
      throw new Error('Check xlsx file & rerun the script')
    }
    console.log('Updating nav values...');
    let newFile = utils.updateFunds(fundLines, newNav, readFile);
    newFile = utils.updateDate(dateLine, newDate, newFile);
    fs.writeFileSync(jadeFilePath, newFile);
    console.log('Nav values updated');

    await utils.gitAddCommit(jadeFilePath, 'Update nav value');
    await utils.gitPush(branch)

    const mergeStaging = await utils.promptMerge('staging');
    if (!mergeStaging) {
      throw new Error('Nav updated without merging to staging & master branch')
    }
    await utils.gitCheckoutPull('staging');
    await utils.gitMerge(branch);
    await utils.gitPush('staging');
    
    const mergeMaster = await utils.promptMerge('master');
    if (!mergeMaster) {
      throw new Error('Nav updated without merging to master branch')
    }
    await utils.gitCheckoutPull('master');
    await utils.gitMerge(branch);
    await utils.gitPush('master');

    console.log('Done without error');
  } catch (error) {
    console.error(error.message)
  }
})();