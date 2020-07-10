const bcrypt = require('bcryptjs');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fastcsv = require('fast-csv');
const mime = require('mime-types');
const methodOverride = require('method-override');
const ExcelJS = require('exceljs');
const {
    ensureAuthenticated
} = require("../authenticate.js");

const app = express();

const router = express.Router();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var uploads = multer({
    storage: storage
}).single('fileToUpload');

const conn = require("../model/sqlcon.js");

//admin starts........

router.get("/admin", ensureAuthenticated, function(req, res) {
    file = './public/images/download.xlsx';
    // check if the file exists in the current directory.
    fs.access(file, (err) => {
        if (err) {
            console.log("The file does not exist.");
        } else {
            //delete the saved file.....
            fs.unlinkSync('./public/images/download.xlsx');
            //console.log("The file exists.");
        }
    });
    res.render("admin");
});

router.post('/admin/addbook', uploads, (req, res) => {

    let stream = fs.createReadStream("./public/images/" + req.file.filename);
    let rowData = [];
    var workbook = new ExcelJS.stream.xlsx.WorkbookReader();
    var options = {
        entries: "emit",
        sharedStrings: "cache",
        styles: "emit",
        hyperlinks: "emit",
        worksheets: "emit"
    };

    workbook.on('error', function(error) {
        console.log('An error occurred while writing reading excel', error);
        req.flash('error_msg', 'An error occurred while writing reading excel');
        res.redirect('/user/admin');
    });

    workbook.on('entry', function(entry) {
        console.log("entry", entry);
    });
    workbook.on('worksheet', function(worksheet) {
        console.log("worksheet", worksheet.name);
        worksheet.on('row', function(row) {
        	if(String(row.values[1]).length!=0)
            	rowData.push([String(row.values[1]), String(row.values[2]), String(row.values[3]), String(row.values[4])]);
        });

        worksheet.on('close', function() {
            console.log("worksheet close");
        });

        worksheet.on('finished', function() {
            console.log("worksheet finished");
            if(rowData.length>1){
		        rowData.shift();
		        let query = "INSERT IGNORE INTO library_book (Access_No,Title,Authors,Department) VALUES ?;";
		        conn.query(query, [rowData], (error, response) => {
		            console.log(error || response);
		        });
		    }
            rowData = [];
        });
    });

    workbook.on('finished', function() {
        console.log("finished");
        fs.unlinkSync('./public/images/' + req.file.filename);
        req.flash('success_msg', 'Data successfully added to the database');
        res.redirect('/user/admin');
    });

    workbook.on('close', function() {
        console.log("close");
    });
    workbook.read(stream, options);
});


router.get("/admin/libDetail", ensureAuthenticated, (req, res) => {
    const ws = fs.createWriteStream("public/images/download.xlsx");
    // query data from MySQL
    conn.query("SELECT * FROM library_book", async function(error, data, fields) {
        if (error) throw error;

        const jsonData = JSON.parse(JSON.stringify(data));
        //console.log("jsonData", jsonData);
        let workbook = new ExcelJS.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet('Sheet1'); //creating worksheet
        worksheet.columns = [{
                header: 'Access_No',
                key: 'Access_No',
                width: 15
            },
            {
                header: 'Title',
                key: 'Title',
                width: 50
            },
            {
                header: 'Authors',
                key: 'Authors',
                width: 30
            },
            {
                header: 'Department',
                key: 'Department',
                width: 30
            },
            {
                header: 'Rack_No',
                key: 'Rack_No',
                width: 15
            },
            {
                header: 'Matching_Access_No',
                key: 'Matching_Access_No',
                width: 25
            }
        ];

        worksheet.addRows(jsonData);
        await workbook.xlsx.write(ws);
        console.log("finished");
        res.render("libDetail", {
            filename: "download.xlsx"
        });
    });
});

router.get("/admin/download", ensureAuthenticated, (req, res) => {
    const file = './public/images/download.xlsx';
    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
    //delete the saved file.....
    fs.unlinkSync('./public/images/download.xlsx');
});

router.get('/admin/reset', ensureAuthenticated, (req, res) => {
    qr = "UPDATE library_book SET Matching_Access_No=?,Rack_No=?";
    conn.query(qr, ['N/A', 'N/A'], (er, result) => {
        if (er) throw er;
        req.flash('success_msg', ' Database successfully reset!!');
        res.redirect('/user/admin')
    })
});



router.get("/admin/registration", ensureAuthenticated, function(req, res) {
    res.render("register");
});

router.post("/admin/registration", uploads, function(req, res) {
    console.log(req.user.Name);
    console.log(req.file.filename);
    q = "select * from employee_data where ID=?";
    conn.query(q, [req.body.Uid], function(err, results, fields) {
        if (!err) {
            console.log((typeof results[0]))
            if ((typeof results[0]) == 'undefined') {
                pass = req.body.Password
                if (req.body.Password === req.body.Repassword) {
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(pass, salt, function(err, hash) {
                            if (err) throw err;
                            q = "INSERT INTO employee_data VALUES(?,?,?,?,?,?,?,?)";
                            conn.query(q, [req.body.Uid, req.body.Name, req.body.Email, req.file.filename, req.body.Phone, hash, req.body.designation, req.body.DOB], (err, result) => {
                                if (!err) {
                                    console.log(result);
                                } else {
                                    console.log(err);
                                }
                            })
                        });
                    });
                    req.flash('success_msg', 'New Librarian successfully registered')
                    res.redirect("/user/admin");
                } else {
                    req.flash('error_msg', 'Password does not match!!!');
                    res.redirect('/user/admin/registration');
                }
            } else {
                req.flash('error_msg', 'User id: ' + req.body.Uid + ' already exist')
                res.redirect('/user/admin/registration');
            }
        }
    });
});

router.post("/admin/delete", function(req, res) {
    let userimg = "";
    q = "select * from employee_data where ID=?";
    conn.query(q, [req.body.userID], function(err, results, fields) {
        if (err) throw err;
        if (typeof results[0] === 'undefined') {
            req.flash('error_msg', 'Librarian with id= ' + req.body.userID + ' does not exist')
            res.redirect('/user/admin');
        } else {
            userimg = results[0].PROFILE;
            console.log(userimg, results[0].PROFILE);
            q = "DELETE FROM employee_data WHERE ID=?";
            conn.query(q, [req.body.userID], (err, result) => {
                if (err) throw err;
                //Delete profile pic.......
                fs.unlinkSync('./public/images/' + userimg);
                req.flash('success_msg', 'Librarian successfully deleted')
                res.redirect('/user/admin');
            });
        }
    });
});

router.get('/admin/addbook', ensureAuthenticated, (req, res) => {
    let imgURL = ('/images/' + req.user.PROFILE);
    res.render("addbook", {
        img: imgURL,
        name: req.user.NAME
    });
});



//admin ends.........

//start of publisher.......

router.get("/publisher", ensureAuthenticated, function(req, res) {
    //console.log(req.user); 
    let imgURL = ('/images/' + req.user.PROFILE);
    res.render("publisher", {
        img: imgURL,
        name: req.user.NAME
    });
});

router.get("/publisher/scan", ensureAuthenticated, (req, res) => {
    let imgURL = ('/images/' + req.user.PROFILE);

    res.render("scan", {
        img: imgURL,
        name: req.user.NAME
    });
});

router.get("/publisher/check", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    q = "select * from library_book where Access_No=?";
    conn.query(q, [req.query.bookID], (err, result, fields) => {
        if (!err && (typeof result[0] != 'undefined')) {
            if (result[0].Matching_Access_No === 'N/A') {
                qr = "UPDATE library_book SET Matching_Access_No=?,Rack_No=? WHERE Access_No=?";
                conn.query(qr, [req.query.bookID, req.query.rackID, req.query.bookID], (error, results, rows, fields) => {
                    if (error) throw error;
                    res.json({
                        'success_msg': '   Book ID ' + req.query.bookID + ' Successfully scanned  !!!'
                    });
                });
            } else {
                res.json({
                    'danger_msg': '  BookID ' + result[0].Access_No + ' already available on rack ' + result[0].Rack_No + ' !!!'
                });
            }
        } else if (!err && (typeof result[0] == 'undefined')) {
            res.json({
                'danger_msg': '   BookID ' + req.query.bookID + ' is not included in database.Please contact admin !!!'
            });
        } else {
            res.json({
                'danger_msg': '   Something went wrong  !!!'
            });
        }
    });
});
//end of publisher..........

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", (req, res, next) => {
    q = "select * from employee_data where ID=?";
    conn.query(q, [req.body.email], (er, re, fields) => {
        //console.log(re[0]);
        if (typeof re[0] != 'undefined') {
            if (re[0].DESIGNATION === 'admin') {
                passport.authenticate('local', {
                    successRedirect: '/user/admin',
                    failureRedirect: '/user/login',
                    failureFlash: true
                })(req, res, next);
            } else if (re[0].DESIGNATION === 'publisher') {
                passport.authenticate('local', {
                    successRedirect: '/user/publisher',
                    failureRedirect: '/user/login',
                    failureFlash: true
                })(req, res, next);
            }
        } else {
            req.flash('error_msg', '  user id does not exist !!!')
            res.redirect('/user/login');
        }
    })

});

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'you are successfully logged out!');
    res.redirect('/user/login')
});

module.exports = router;
