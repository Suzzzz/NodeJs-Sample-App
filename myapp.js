var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient;
var session = require('express-session');
var url = "mongodb://localhost:27017/comic";

app.use(express.bodyParser({uploadDir:'/uploads'}));
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

var auth = function(req, res, next) {
  if (req.session && req.session.user === "amy" && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
};




app.get('/login', function (req, res) {
  fs.readFile('views/login.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });

});
// Login endpoint
app.post('/check', function (req, res) {
  if (!req.body.username || !req.body.password) {
	res.send(req.body)  ;
    res.send('login failed');    
  } 
  else{
	var dbres= Array();
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var query = { username: req.body.username ,password : req.body.password };
		db.collection("users").find(query).toArray(function(err, result) {
			if (err) throw err;
			dbres=result;
			console.log(result);
			if(dbres.length>0){
				
				req.session.user.username=result[0];
				req.session.user.type=result[0];
				res.send('login successful');
				res.write(req.session.user.type);
			}else{
				res.writeHead(200, {'Content-Type': 'text/html'});
				fs.readFile('views/login.html', function(err, data) {
					
					res.write(data);
				});
				fs.readFile('views/login-err.html', function(err, data) {
					res.write(data);
					res.end();
				});
			}
			db.close();
		});
	});
	if(dbres.length>0){
		res.send('login successful');
	}
  }
});
 
 
 
// Logout endpoint
app.get('/logout', function (req, res) {
			req.session.destroy();
			//res.writeHead(200, {'Content-Type': 'text/html'});
				fs.readFile('views/login.html', function(err, data) {
					
					res.write(data);
				});
				fs.readFile('views/logout.html', function(err, data) {
					res.write(data);
					res.end();
				});
});
 
// Get content endpoint
app.get('/content', auth, function (req, res) {
    res.send("You can only see this after you've logged in.");
});



app.get('/', function (req, res) {
	
	app.get('/image/jl.jpg', function (req, res) {
    res.sendfile(path.resolve('./uploads/jl.jpg'));
}); 
  fs.readFile('first.html', function(err, data) {
    //res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    //res.end();
  });
  fs.readFile('./views/first.html', function(err, data) {
    //res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

app.get('/get', function (req, res) {
  fs.readFile('jason.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });


});
app.get('/book/add', function (req, res) {
  fs.readFile('views/addbook.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });


});
app.post('/book/insert', function (req, res) {
		console.log(req.body);
		console.log(req.files.pages.length);
		MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var myobj = req.body;
		myobj["pages"]= 0;;
		myobj["cover"]=req.body.name+"-cover";
		for (var a =0 ; a<req.files.pages.length; a++)
		{
			var n = req.body.name.replace(/ /g, "-")+"-page-"+a;
			console.log(req.files.pages[a].path);
			var tempPath = req.files.pages[a].path,
				targetPath = path.resolve('./uploads/'+n+'.jpg');
			myobj["pages"]++;
			myobj["page"+a]=n+'.jpg';
				fs.rename(tempPath, targetPath, function(err) {
					if (err) throw err;
					console.log("Upload completed!");
					
				});
			
			
		}
			var n = req.body.name.replace(/ /g, "-")+"-cover";
			console.log(req.files.cover.path);
			var tempPath = req.files.cover.path,
				targetPath = path.resolve('./uploads/'+n+'.jpg');
			
				fs.rename(tempPath, targetPath, function(err) {
					if (err) throw err;
					console.log("Upload completed!");
					
					
				});
			myobj["cover"]=n+'.jpg';

		
			db.collection("comics").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("1 record inserted");
			db.close();
		});
});	
	res.writeHead(200, {'Content-Type': 'text/html'});
	fs.readFile('views/addbook.html', function(err, data) {
		
		res.write(data);
		
	});
	/*fs.readFile('views/success-insert.html', function(err, data) {
		
		res.write(data);
		res.end();
	});*/

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

app.get('/users/:userId/', function (req, res) {
	res.send(req.params);
	console.log(req.params);
});


app.get('/data/', function (req, res) {
	
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  db.collection("products").findOne({}, function(err, result) {
		if (err) throw err;
		console.log(result.qty);
		db.close();
	  });
	});
});

app.get('/jason',function (req,res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	var str = '{ "name": "John Doe", "age": 42 }';
	//var obj = JSON.parse(str);
	res.write(str);
	res.end();
	
});

app.post('/upload', function (req, res) {
	var d = new Date();
	var n = "rtyuio";
	console.log(req.files.file.path);
    var tempPath = req.files.file.path,
        targetPath = path.resolve('./uploads/'+n+'image.jpg');
    if (path.extname(req.files.file.name).toLowerCase() === '.jpg') {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
    } else {
        fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .jpg are allowed!");
        });
    }
    // ...
});


app.post('/getbooks', function (req, res) {
	
	var page = req.body.page;
	console.log(page);
	var perpage=1;
	//res.writeHead(200, {'Content-Type': 'application/json'});
	var results=[];
	//var obj = JSON.parse(str);
	
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection("comics").find({},{  "limit": (perpage),  "skip": 1*page}).toArray(function(err, result) {
			if (err) throw err;
			var rest=result;
			for(var img=0;img<rest.length;img++ ){
				seturl(rest[img].cover);
				rest[img].cover='./uploads/'+rest[img].cover;
				//console.log(rest[img].cover);
				
			}
			var myJsonString = JSON.stringify(rest);
			console.log(myJsonString);
			results.push(rest[0]["name"]);
			res.write(myJsonString);
			res.end();
			db.close();
		});
	});
	//res.write(results[0]+'456456');
	//console.log(results+'234');
});

function seturl(spath){
	
	
	app.get('/uploads/'+spath, function (req, res) {
    res.sendfile(path.resolve('./uploads/'+spath));
}); 
}


app.get('/jl.jpg', function (req, res) {
    res.sendfile(path.resolve('./uploads/jl.jpg'));
}); 


app.get('/assest/js/validation/jquery.validate.min.js', function (req, res) {
    res.sendfile(path.resolve('/assest/js/validation/jquery.validate.min.js'));
}); 

app.get('/assest/js/validation/additional-methods.min.js', function (req, res) {
    res.sendfile(path.resolve('/assest/js/validation/additional-methods.min.js'));
}); 


