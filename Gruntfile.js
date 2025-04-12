module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            scripts: {
                files: ['src/**/*.js', 'src/**/*.html', 'src/**/*.css', 'manifest.json'],
                tasks: ['copy'],
                options: {
                    spawn: false,
                },
            },
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['src/**', 'manifest.json', 'icon.svg'],
                        dest: 'dist/',
                    },
                ],
            },
        },
        clean: {
            build: ['dist/'],
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-crx-auto-reload');

    grunt.registerTask('default', ['clean', 'copy', 'watch']);
};
