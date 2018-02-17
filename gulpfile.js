const gulp = require('gulp');
const typescript = require('gulp-typescript');
const tsProject = typescript.createProject('tsconfig.json');
const fs = require('fs');
const path = require('path');
const install = require('gulp-install');
const tsPipeline = require('gulp-webpack-typescript-pipeline');
const zip = require('gulp-zip');

const tsOptions = {
	entryPoints: {
  		index: './index.ts'
	},
	outputDir: __dirname+'/build',
	isNodeLibrary: true,
	externals: [/aws-sdk/]
};

tsPipeline.registerBuildGulpTasks(gulp, tsOptions);

gulp.task('lambda:build', ['tsPipeline:build:release'], (done) => {
	done();
});


gulp.task('lambda:zip', ['lambda:build', 'lambda:npm'], () => {
	return gulp.src(['./build/**/*', './build/.*'])
		.pipe(zip('producer.zip'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('lambda:npm', () => {
	return gulp.src('./package.json')
  		.pipe(gulp.dest('./build'))
  		.pipe(install({ production: true })
	);
});
