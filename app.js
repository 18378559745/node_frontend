var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// let http = require("http");
// let https = require("https");
// let fs = require("fs");
// // Configuare https
// const httpsOption = {
//     key : fs.readFileSync("./https/5031896_www.lgg.cool.key"),
//     cert: fs.readFileSync("./https/5031896_www.lgg.cool.pem")
// }


var app = express();

// manggodb
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/back');


app.use(cookieParser());
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// manggodb
//得到数据库连接句柄
var db = mongoose.connection;
//通过数据库连接句柄，监听mongoose数据库成功的事件
db.on('open',function(err){
	if(err){
		console.log('数据库连接失败');
		throw err;
	}
  console.log('数据库连接成功')  
})



var express = require("express");
var bodyParser = require('body-parser');//解析,用req.body获取post参数
app.use(bodyParser.json());

// 跨域 npm install csurf
const cors = require('cors');
app.use(cors());



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


var loginCookie = function (req, res, next) {
  console.log('------------cokie------------')
  console.log(req.cookies['back&cookie'])
  console.log(req.method)
  if(req.cookies['back&cookie']){ //cookie存在重置
    res.cookie('back&cookie', '1', { expires: new Date(Date.now() + ( 3600000 * 2)), httpOnly: true })
  }
  if(req.url == '/login' || req.method == 'GET'){  //后续区分路由还是接口。路由可直接放行
    next()
  }else if(!req.cookies['back&cookie']){
    let list = {
      code : 400,
      data : '用户登录超时,请重新登录！'
    }
    res.status(200)
    res.json(list)
    // next()
  }else{
    next()
  }  
}
app.use(loginCookie);

const api = require('./util/mongoDB.js')
api.find(app,'/home/list','list')
api.insertOne(app,'/add/list','list')
api.uploadImg(app,'/upload/list','list')
api.deleteOne(app,'/delect/list','list')
api.updateOne(app,'/update/list','id','list')

api.find(app,'/tab/list','tab')
api.insertOne(app,'/tab/add_list','tab')
api.deleteOne(app,'/tab/delete_list','tab')

api.find(app,'/user/list','user')
api.insertOne(app,'/user/add','user')
api.deleteOne(app,'/user/delete','user')
api.login(app,'/login','user')


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(80, ()=>{
  console.log(80, '------------------')
})

// http.createServer(app).listen(80);
// https.createServer(httpsOption, app).listen(443);

module.exports = app;
