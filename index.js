const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const expressHandlebars = require('express-handlebars');
const {createStarList} = require('./controllers/handlebarsHelper');
const {createPagination} = require('express-handlebars-paginate');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const redisClient = createClient({
    url: process.env.REDIS_URL
});
redisClient.connect().catch(console.error);

// cau hinh public static folder
app.use(express.static(__dirname + '/public'));

// cau hinh view engine
app.engine('hbs', expressHandlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    helpers: {
        createStarList: createStarList,
        createPagination
    }
}));
app.set('view engine', 'hbs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 200*60*1000
    }
}));
// cau hinh doc du lieu post
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// middleware khoi tao gio hang
app.use((req, res, next) => {
    let Cart = require('./controllers/cart');
    req.session.cart = new Cart(req.session.cart || {});
    res.locals.quantity = req.session.cart.quantity;
    next();
});
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productRouter'));
app.use('/users', require('./routes/userRouter'));

app.use((req, res, next)=>{
    res.status(404).render('error', {message: 'Page not found!'});
})
app.use((err, req, res, next) => {
    console.error(err);
    res.status(404).render('error', {message: 'Internal server error!'});
});
// khoi dong server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})