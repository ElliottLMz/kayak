import chalk from "chalk";

const prefix = chalk.bold.blue("kayak") + " ";

const logLevels = {
	verbose: 0,
	notice: 1,
	success: 2,
	warn: 3,
	error: 4,
};

let level: Number = logLevels.notice;

function create(myLevel: Number, type: any) {
	return (message: String) => {
		if (level <= myLevel) console.log(prefix + type, message);
	};
}

const log = {
	setLevel: (newLevel: Number) => {
		level = newLevel;
	},

	levels: logLevels,

	verbose: create(logLevels.verbose, chalk.magenta("verbose")),
	notice: create(logLevels.notice, chalk.blue("notice")),
	success: create(logLevels.success, chalk.greenBright("success")),
	warn: create(logLevels.warn, chalk.yellow("WARN")),
	error: create(logLevels.error, chalk.red("ERR!")),
};

export { log };
