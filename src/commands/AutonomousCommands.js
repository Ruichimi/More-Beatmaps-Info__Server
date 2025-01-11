const { Command } = require('commander');
const program = new Command();
const CacheManager = require('../Services/CacheManager');
const cacheManager = new CacheManager();
program
    .command("cache-size")
    .description('')
    .action(() => {
        console.log(cacheManager.getCacheSize('file'));
    });

program
    .command("cached-bs <id>")
    .description('')
    .action((id) => {
        console.log(cacheManager.getBeatmapsetByIdCache(id, 'file'));
    });

program.parse(process.argv);
