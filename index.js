var express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session      = require('express-session');

var passport = require('passport')
  , OAuth2Strategy = require('passport-oauth2').Strategy;

var app=express();
app.use(require('morgan')());
passport.use('queen', new OAuth2Strategy({
  tokenURL: 'http://oauthserver:3000/oauth/token',
  authorizationURL: 'http://oauthserver:3000/oauth/authorise',
  clientID: 'client1',
  clientSecret: 'secret1',
  callbackURL: 'http://oauthclient:4000/auth/queen/callback'
},
function(accessToken,refreshToken, profile, done) {
  console.log(arguments);
  done();
}));

passport.serializeUser(function(user, done) {
  console.log("serializing user");
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(bodyParser());
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'jade');

app.get('/',function(req,res,next){
  res.render('index');
});
app.get('/secret',passport.authenticate('queen'),function(req,res){
  console.log(req.user);
  res.render('secret');
});
app.get('/auth/queen/callback',passport.authenticate('queen',{failureRedirect: '/'}),function(req,res,next){
  res.redirect('/secret');
});
app.listen(4000);
