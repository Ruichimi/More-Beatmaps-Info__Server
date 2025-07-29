const readline = require('readline');

function commandsRunning(commands) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    rl.on('line', (input) => {
        const args = input.trim().split(' ');
        const command = args[0];
        const commandArgs = args.slice(1);

        if (commands[command]) {
            commands[command](...commandArgs);
        } else {
            console.log(`Unknown command: ${command}`);
        }
    });
}

module.exports = { commandsRunning };
