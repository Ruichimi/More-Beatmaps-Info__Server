const { Command } = require('commander');
const program = new Command();
const CacheManager = require('../Services/CacheManager');
program
    .command("cache")
    .description('')
    .action(() => {
        console.log(CacheManager.getCacheSize('file'));
    });

program.parse(process.argv);
