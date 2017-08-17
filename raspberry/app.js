var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sensor = require('./Sensor/Sensor');
var biosignal = require('./routes/Biosignal');
var notification = require('./routes/Notifications');
var notificationDeamon = require('./Controllers/NotificationDeamon').deamon;
var online = require('./routes/Online');
var app = express();
const cors = require('cors');

notificationDeamon();
mongoose.Promise = global.Promise; // WTF is this Problem ??
mongoose.connect('mongodb://127.0.0.1/Raspberry', {
    useMongoClient: true
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var main = require('./routes/main');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/main', main);
app.use('/biosignal', biosignal);
app.use('/notification', notification);
app.use('/online', online);
app.use(express.static(path.join(__dirname, 'public/OpenHealth')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
