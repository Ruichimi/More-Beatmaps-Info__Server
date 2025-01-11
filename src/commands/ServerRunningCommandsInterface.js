const readline = require('readline');

function commandsRunning(commands) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    rl.on('line', (input) => {
        const command = input.trim();
        if (commands[command]) {
            commands[command]();
        } else {
            console.log(`Неизвестная команда: ${command}`);
        }
    });
}

module.exports = { commandsRunning };
