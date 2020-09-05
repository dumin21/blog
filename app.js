var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const jwt = require('jsonwebtoken');
var expressJWT = require('express-jwt');
var tokenSitting = require('./tokenSetting/tokenSetting');

var app = express();

// CORS模块，处理web端跨域问题
const cors = require('cors');
app.use(cors());

//引入cookie模块
var Cookies = require('cookies');

//body-parser 解析表单
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());

// 定义模板引擎，使用swig.renderFile方法解析后缀为html的文件
var swig = require('swig');
app.engine('html', swig.renderFile);//使用swig渲染html文件

// 设置模板存放目录
app.set('views', './views');

app.set('view engine', 'html'); //设置默认页面扩展名
app.set('view cache', false); //设置模板编译无缓存
// app.set('views', path.join(__dirname, 'views')); //设置项目的页面文件，也就是html文件的位置
// app.set('view engine', 'jade');

swig.setDefaults({cache: false}); //关闭swig模板缓存
// swig.setDefaults(loader: swig.loaders.fs(__dirname + '/views')}); //从文件载入模板，请写绝对路径，不要使用相对路径
swig.setDefaults({autoescape: false}); //关闭自动转义
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('123456'));
app.use(express.static(path.join(__dirname, 'public')));

// 设置静态文件托管
app.use('/public',express.static(__dirname+'/public'));





// // error handler
//  app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

//设置cookie信息
// app.use(function(req,res,next){
//   req.cookies = new Cookies(req,res);
//   console.log('app接收',req.cookies.get('userInfo'));
//   //解析cookies信息把它由字符串转化为对象
//   if(req.cookies.get('userInfo')){
//       try{
//           req.userInfo = JSON.parse(req.cookies.get('userInfo'));
//           next();
//           //获取当前用户登录的类型，是否是管理员===??此段报错，待修改
//           // User.findById(req.userInfo.id).then(function(userInfo){
//           //     if(userInfo){
//           //         // req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
//           //         if(userInfo.isAdmin){
//           //             req.userInfo.isAdmin = true;
//           //         } else {
//           //             req.userInfo.isAdmin = false;
//           //         }
//           //         next();
//           //     } else {
//           //         next();
//           //     }
//           // })
//       } catch(e) {
//           next();
//       }
//   } else {
//       next();
//   }

// });


//验证token是否过期并规定哪些路由不用验证
// app.use(expressJWT({
//   secret: 'mes_qdhd_mobile',
//   algorithms: ['HS256']
// }).unless({
//   path: ['/', '/api/login', '/login']//除了这个地址，其他的URL都需要验证
// }));

// // 解析token获取用户信息
app.use(function(req, res, next) {
  // console.log(110,req.get("origin"));
  // 由于express-jwt需要配合前台发送的cookie使用，所以要把Access-Control-Allow-Credentials设置为true
  // 设置Access-Control-Allow-Credentials为true后，Access-Control-Allow-Origin不能使用通配符，所以我改成req.get("origin")
  // 允许的请求主机名及端口号 也可以用通配符*， 表示允许所有主机请求
  res.setHeader('Access-Control-Allow-Origin','*');
  // 允许请求携带cookie
  res.setHeader('Access-Control-Allow-Credentials', true);
  // 允许的请求方式
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // 允许的请求头 express-jwt的cookie是使用Authorization所以需要允许Authorization通过
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization')
  // next();

  // let token2 = req.headers.authorization;
  // console.log(126,token2)

  console.log('132jiexi');

  // var dff = req.cookies;
  // req.cookiess = dff;
  // var token = req.headers['authorization'];
  var token = req.cookies.token;
  console.log('137token',token);
  req.token = token;
  req.userInfo = req.cookies;
  var urll = req.originalUrl;
  // console.log('urll',urll); //urll /admin
  if(urll.indexOf('/main')>=0 || urll.indexOf('/view')>=0 || urll.indexOf('/article')>=0 || urll == '/' || urll == '/login'|| urll == '/api/user/logout'|| urll == '/api/user/login' ){
    console.log('不限制');
    return next();
  } else {
    console.log('限制');
    tokenSitting.verifyToken(token).then((data)=> {
        var userInfos = JSON.parse(req.cookies.userInfo);
        var uid = userInfos.userInfo.userUuid;
        if(uid == data.userUuid){
          console.log('验证uuid匹配');
          return next();
        } else {
          console.log('不匹配');
          res.redirect('/login');
          return next();
        }
        
    }).catch((error)=>{
  　　　　console.log('120',error);
          res.redirect('/login');
        // return next();
    })

  }


    // if(token == undefined){
    //   console.log('go-undefined');
    //     return next();
    // }else{
    //   console.log('go-token');
      
    //   tokenSitting.verifyToken(token).then((data)=> {
    //         // req.data = data;
    //         console.log(typeof(data))
    //         req.userInfo = data;
    //         console.log(148,data);
    //         return next();
    //     }).catch((error)=>{
    //   　　　　console.log('120',error);
    //         return next();
    //     })
    // }
}); 

console.log(154)
// app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/',require('./routers/main'));//前台
app.use('/admin',require('./routes/admin'));
app.use('/api',require('./routes/api'));
app.use('/',require('./routes/main'));//前台


// app.all('/*', function(req, res, next){
//   console.log(104,req.Cookies);
//   // res.Cookies = req.Cookies;
//   // res.cookie('userInfo', req.Cookies, {maxAge: 3600 * 1000});
//   // res.cookie('userInfo', 'req.Cookieddddds', {maxAge: 3600 * 1000});
//   // req.userInfos = 'ddd';

// });







// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // if (err.name === 'UnauthorizedError') {   
  //   console.log('153')
  // }
  // if (err.name === 'UnauthorizedError') {
  //   console.error(req.path + ',无效token');
  //   res.json({
  //     message: 'token过期，请重新登录',
  //     code: 400
  //   })
  //   return
  // }
  // res.status(401).send('invalid token')
  next(createError(404));
});



//package.js修改记录
//"start": "node ./bin/www"

module.exports = app;
