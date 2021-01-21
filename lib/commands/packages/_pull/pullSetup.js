const path = require("path")
const fs = require("fs")
const rimraf = require("rimraf")
const shell = require("shelljs")
const toml = require("@iarna/toml")
const clean = require("sanitize-filename")

const log = require("../../../log")
const processUrl = require("../../../../helpers/processUrl")

const cleanOptions = {
	replacement: "_",
}

function sanitize(string) {
	if (typeof string == "string") {
		return string.replace(/['"]+/g, "")
	} else {
		return string
	}
}

function clone(repo, dir, branch) {
	if (branch) {
		return `git clone "${processUrl(repo)}" "${dir}" -b "${branch}" --single-branch -q`
	} else {
		return `git clone "${processUrl(repo)}" "${dir}" -q`
	}
}

module.exports = (d, dependency, dependencyRoot, index) => {
	shell.cd(dependencyRoot)

	const repo = typeof dependency == "string" ? dependency : dependency.git
	const branch = typeof dependency == "string" ? undefined : dependency.rev

	if (repo == undefined) {
		log.warn(`Dependency \`${d}\` is not valid.`)
		return false
	}

	/**
	 * rimraf and create the directory, ensuring we have a clean temp directory
	 */
	const temp = path.join(dependencyRoot, `.__${clean(d, cleanOptions)}`)
	rimraf.sync(temp)
	fs.mkdirSync(temp)

	shell.exec(clone(sanitize(repo), sanitize(temp), sanitize(branch)))

	/**
	 * Ensure the pulled package has a rotriever.toml
	 */
	const rotrieverPath = path.join(temp, "rotriever.toml")
	if (!fs.existsSync(rotrieverPath)) {
		log.warn(`Dependency \`${d}\` does not have a rotriever.toml file`)
		rimraf.sync(temp)
		return false
	}

	/**
	 * Pull the rotriever.toml and read key data
	 */
	let rotriever = toml.parse(fs.readFileSync(rotrieverPath))

	if (!rotriever.package) { // Dodgy method, but it works as a hotfix to allow use. Until we find a proper fix, I guess?
		rotriever = {
			"package": rotriever,
			"dependencies": rotriever.dependencies
		}
	}

	const packageName = clean(rotriever.package.name, cleanOptions).toLowerCase()
	const specifiedName = clean(d, cleanOptions)

	const finalContainer = path.join(index, packageName)
	const final = path.join(finalContainer, specifiedName.toLowerCase())

	const contentPath = rotriever.package.content_root || ""
	const content = path.join(temp, contentPath)

	/**
	 * Fetch info from git
	 */
	shell.cd(temp)
	const commit = shell.exec(`git rev-parse HEAD`, { silent: true }).stdout.replace(/\r?\n|\r/g, "")

	/**
	 * Wipe and create key directories for this package
	 */
	rimraf.sync(finalContainer)
	fs.mkdirSync(finalContainer)

	return {
		rotriever,
		packageName,
		specifiedName,
		finalContainer,
		final,
		contentPath,
		content,
		repo,
		branch,
		temp,
		commit,
		repo,
		branch,
	}
}
