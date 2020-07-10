bcrypt.genSalt(10,function(err,salt){
bcrypt.hash("hello",salt,function(err,hash){console.log(hash);});});


bcrypt.compare("hello","$2a$10$aTljSxl7Y/096bseKloDve3yYc8QHrF97vYWFNC5Po2ebZCoI27kO",function(err,isMatch){
	console.log(isMatch);
 });
