// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var PORT = process.env.PORT || 3000;

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// make public a static dir
app.use(express.static('public'));


// Database configuration with mongoose
mongoose.connect('mongodb://dpatino:cooltech@ds129018.mlab.com:29018/heroku_zzx0p7zj');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
    console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
    console.log('Mongoose connection successful.');
});


// And we bring in our Input and Article models
var Input = require('./models/Input.js');
var Article = require('./models/Article.js');


// Routes

app.get('/', function(req, res) {
    res.send(index.html);
});

// A GET request to scrape the echojs website.
app.get('/scrape', function(req, res) {
    
    request('https://www.reddit.com/r/fantasyfootball/', function(error, response, html) {
        // then, we load that into cheerio and save it to $ 
        var $ = cheerio.load(html);
        // now, we grab every .title class
        $('.title').each(function(i, element) {

            // save an empty result object
            var result = {};

            // add the text and href of every link 
            result.title = $(this).children('a').text();
            result.link = $(this).children('a').attr('href');

            // using our Article model, create a new entry
            var entry = new Article(result);

            // save that entry to the db
            entry.save(function(err, doc) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(doc);
                }
            });


        });
    });
    
    
    //message when done scraping
    res.send("<h1>Scrape Complete</h1>\n" + "<p>There is a slight bug in the system. Please remove /scrape from the browser and press enter to return to the main page.</p>");

});

// this will get the articles we scraped from the mongoDB
app.get('/articles', function(req, res) {
    // grab every doc in the Articles array
    Article.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(doc);
        }
    });
});

// grab an article by it's ObjectId
app.get('/articles/:id', function(req, res) {
     
    // prepare a query that finds the matching one in db
    Article.findOne({ '_id': req.params.id })
        .populate('input')
        .exec(function(err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(doc);
            }
        });
});


//create a comment for the article
app.post('/articles/:id', function(req, res) {
    // create a new Input and pass the req.body to the entry.
    var newInput = new Input(req.body);

    // and save the new Input the db
    newInput.save(function(err, doc) {
        if (err) {
            console.log(err);
        }
        else {
            Article.findOneAndUpdate({ '_id': req.params.id }, {'input': doc._id })
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(doc);
                    }
                });
        }
    });
});

// Delete Input from the DB
app.post('/delete/:id', function(req, res) {
    Article.find({'_id': req.params.id}, 'input', function(err, doc){
        Input.find({'_id': doc[0].Input}).remove().exec(function(err, doc){
            if(err) {
                console.log(err);
            }
        });
    });
    //this gets rid of Input associated with article
    Article.findOneAndUpdate({'_id': req.params.id}, {$unset: {'input':1}}).exec(function(err, doc){
        if(err) {
            console.log(err);
        } else {
            res.send(doc);
        }
    });

});





// listen on port
app.listen(PORT, function() {
    console.log('App running on port 3000!');
});