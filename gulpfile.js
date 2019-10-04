const {src,dest,parallel,watch,series} = require('gulp') 
const imagemin = require('gulp-imagemin')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const minify = require('gulp-babel-minify')
const concat = require('gulp-concat')
const notify = require('gulp-notify');



const env = process.env.NODE_ENV || 'development'
const outDir = env == 'development' ? 
                        'dist/' :
                        'build/'

console.log(`you're running on ${env} mode`)
const files = {
    static:['src/assets/**/*','!src/assets/img/*'],
    scss: ['src/scss/**/*.scss','!src/scss/**/_*.scss'],
    js: 'src/**/*.js',
    img:'src/assets/img/*',
    pug:['src/**/*.pug','!src/**/_*.pug']
}
function errorHandler (err) {
    notify.onError({
        title: "Gulp error in " + err.plugin,
        message: err.toString()
    })(err);
}

async function sassCompilerTask(){
    await src(files.scss ,{sourcemaps:true})
            .pipe(plumber({errorHandler}))
            .pipe(sass({
                outputStyle: 'expanded'
            }))
            .pipe(dest(outDir + 'css',{ sourcemaps: '.' }))
    Promise.resolve(true)
}
async function imageOptimizatorTask(){
    await src(files.img )
        .pipe(imagemin())
        .pipe(dest(outDir + 'assets/img/'))
    Promise.resolve(true)
}
async function pugCompilerTask(){
    await src(files.pug )
            .pipe(
                pug({pretty: env=='development'})
            ).pipe(
                dest(outDir)
            )
    Promise.resolve(true) 
} 
async function copyAssetsTask(){
    await src(files.static)
            .pipe(dest(outDir+ 'assets'))
    Promise.resolve(true)
}
async function babelTranspilerTask(){
    if (env != 'development'){
       await src(files.js )
                .pipe(concat('index.js'))
                .pipe(minify())
                .pipe(dest(outDir))
    }else{
        await src(files.js )
                .pipe(babel())
                .pipe(dest(outDir))
    }
    Promise.resolve(true)
}
function watchTask() {
    watch(
        ['./src/scss/**/*.scss', files.js ,'./src/**/*.pug','./src/assets/**/*'],
        parallel(copyAssetsTask,pugCompilerTask,sassCompilerTask, babelTranspilerTask)
    )
}
const defaultTask = series(parallel(copyAssetsTask,pugCompilerTask,babelTranspilerTask, imageOptimizatorTask, sassCompilerTask), watchTask)

module.exports = {
    imageOptimizatorTask,
    pugCompilerTask,
    sassCompilerTask,
    watchTask,
    default:defaultTask
}