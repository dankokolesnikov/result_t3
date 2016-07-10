var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var port = 8000;


//PAGE URL HERE
var pageUrl = "http://edition.cnn.com/2016/07/09/opinions/dallas-robot-questions-singer/index.html";

var livefyreURL, networkName, network, siteId, b64articleId;

//Delete html tags
function filter(text){
	text = text.replace(/<p>/g, "")
	text = text.replace(/<\/p>/g, "")
	text = text.replace(/<br>/g, "")
	text = text.replace(/<br\/>/g, "")
	text = text.replace(/<strong>/g, "")
	text = text.replace(/<\/strong>/g, "")
	text = text.replace(/<span>/g, "")
	text = text.replace(/<\/span>/g, "")
	text = text.replace(/<u>/g, "")
	text = text.replace(/<\/u>/g, "")
	text = text.replace(/<em>/g, "")
	text = text.replace(/<\/em>/g, "")
	while(true){
		position = text.indexOf("</a>");
		if (position == -1) break;
		text = text.substring(position+4);
	}
	return text;
}



request(pageUrl, function(err, resp, body){
	if (err){
		console.log(err);
	}else{

		var $ = cheerio.load(body);

		// !!GET DATA-ARTICLE-ID
		var dataAricleId = $('.js-livefyre-comments').attr('data-article-id');
		// check comments
		if (dataAricleId){
			//to b64
			var b64dataAricleId = new Buffer(dataAricleId).toString('base64');
		
			// make url livefyre
			networkName = 'cnn';
			network = 'cnn.fyre.co';
			siteId = '353270';
			b64articleId = b64dataAricleId;
		
			livefyreURL='http://'+networkName+'.bootstrap.fyre.co/bs3/v3.1/'+network+'/'+siteId+'/'+b64articleId+'/init'
			
			//request to API LIVEFYRE
			request(livefyreURL, function(err, resp, body){
				if (err){
					console.log(err);
				}else {
					livefyreJSON = JSON.parse(body);
					var counter = 0;
					for (var key in livefyreJSON.headDocument.content){
						var message = livefyreJSON.headDocument.content[key].content.bodyHtml;
						if (message){
							console.log("Comment # "+ ++counter);
							message = filter(message);
							console.log(message);
						}
					}
				}
			})	
		}else{
			console.log('Page havent Comments');
		}
	}
})

app.listen(port);
console.log('server is listening on '+ port);
