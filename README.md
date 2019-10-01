# update-nav

## Getting Started
1. Run `npm install`
2. Copy & paste file **config_example.js** in the same folder. Then rename new file to **config.js**
3. Open **config.js** file & update the **projectPath** using the absolute path to the project in your pc (run `pwd` while inside project folder to get the absolute path)
4. Update nav values in **nav-datasheet.xlsx**
5. Start script by running `npm start`

## Add/Remove Fund
1. Add or remove attribute **data="nav-[fund name]"** in the <td> element for the fund's row inside the jade file
