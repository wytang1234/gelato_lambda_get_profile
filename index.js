'use strict';
require('./include/config.inc.js');
require('./include/global.function.js');
var db = require('./include/db');
var sqlString 	 = require('sqlstring');
var jwt = require('jsonwebtoken');

var get_profile = function(sql, callback){
	var db_obj = db();
  	db_obj.data.query = sql;
  	db_obj.runQuery(function(results) {
    	callback(results);
  	})
}

var get_profile_photo = function(sql, callback){
	var db_obj = db();
  	db_obj.data.query = sql;
  	db_obj.runQuery(function(results) {
    	callback(results);
  	})
}

exports.handler = function(event, context, callback){
	if((event.headers.user_token!==undefined)){
		try {
			var params = jwt.verify(event.headers.user_token, _jwt_key);
		} catch(err) {
		    callback(null, genOutput('error', 1, err));
		}

		if((params.user_id!==undefined) && (params.user_roles=="guest")){
			var sql = "SELECT *, NULL as `photo_path` "
					+ "FROM `user` "
					+ "WHERE user_id = " + sqlString.escape(params.user_id) + " ";

			get_profile(sql, function(results){
				if(results.length > 0){
					var detail = results[0];
					var photo_path = "NULL";
					// detail['photo']="3";
					// var json = JSON.stringify(results[0]);

					// get photo
					var photo_sql = "SELECT * "
							+ "FROM `photo` "
							+ "WHERE user_id = " + sqlString.escape(params.user_id) + " ";
					get_profile_photo(photo_sql, function(results, photo_path){
						if(results.length>0){
							detail['photo_path']=results[0].photo_path;
							// console.log(detail);
							callback(null, genOutput('success', 1, detail));
						}
					});
				}
			});
		}else{		
			callback(null, genOutput('error', 400, "You are not guest"));
		}
	}else{
		callback(null, genOutput('error', 1, "Format error"));
	}
}