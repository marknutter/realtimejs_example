module.exports = (grunt) ->
	config =
		pkg: grunt.file.readJSON("package.json")
		connect:
			server:
				options:
					port: 8000
					base: "."
					keepalive: true

	grunt.initConfig config
	grunt.loadNpmTasks "grunt-contrib-connect"

	return