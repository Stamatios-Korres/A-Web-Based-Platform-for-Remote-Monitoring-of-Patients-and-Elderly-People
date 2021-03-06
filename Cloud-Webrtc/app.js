var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var token = require('./routes/tokens');
var login = require('./routes/login');
var subscribe = require('./routes/subscribe');
var message = require('./routes/message');
var biosignals = require('./routes/biosignalRoute');
var autocomplete = require('./routes/AutoCompete');
var app = express();
var flash = require('connect-flash');
var passport = require('passport');
var settings = require('./routes/settings');
const cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/app')));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use('/settings',settings);
app.use('/tokens',token);
app.use('/',login);
app.use('/subscribe',subscribe);
app.use('/messages',message);
app.use('/biosignals',biosignals);
app.use('/autocomplete',autocomplete);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/Webrtc',{
    useMongoClient: true
}   );
// catch 404 and forward to error handler


app.use(cors());
app.options('*', cors());

//enable cors


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

app.use(passport.initialize());

module.exports = app;
