const path = require("path")
const fs = require("fs")

module.exports = (cd, data) => {
	const package_dependencies_root = data.package.dependencies_root
	const dependencyRoot = package_dependencies_root
		? path.join(cd, package_dependencies_root)
		: path.join(cd, "packages")

	/**
	 * We don't erase these as users or other modules may put stuff into the
	 * packages root
	 */
	if (!fs.existsSync(dependencyRoot)) fs.mkdirSync(dependencyRoot)

	const index = path.join(dependencyRoot, "_index")
	if (!fs.existsSync(index)) fs.mkdirSync(index)

	return {
		dependencyRoot,
		index,
	}
}
