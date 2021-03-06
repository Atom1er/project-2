var authController = require('../controllers/authcontroller.js');
// var daycare_data = require("../data_base/daycare_data.js");
var message_data = require("../data_base/message_data.js");

module.exports = function(passport, app, daycare_data) {
// var express = require("express");
// var passport = require("../config/passport/passport.js");
//var router = express.Router();

   // Administrator site
    app.get("/api/administrator", isLoggedIn, (req, res) => {
        daycare_data.Children.findAll({}).then((results) => {
            //var newData = parse(results);
            res.render("index", {
                data: results
            })
        });
    });

      //-----------------------------------------------//
     //  For ajax request for child info in admin site// 
    //-----------------------------------------------//
    app.get("/api/administrator/child-information", isLoggedIn, (req, res) => {
        daycare_data.Children.findAll({}).then((results) => {
            //var newData = parse(results);
            res.json(results);
        });
    });

      //-----------------------------------------------//
     // View All messages from parents in admin site  //
    //-----------------------------------------------//
    app.get("/api/administrator/messages", isLoggedIn, (req, res) => {
        message_data.message.findAll({}).then((results2) => {
            res.json(results2);
        });
    });

      //------------------------------------------------//   
     // Findig one child from admin site for activities//
    //------------------------------------------------//
    app.get("/api/admin-activity-site/:childName", isLoggedIn, (req, res) => {
        daycare_data.Activities.findAll({
            where: {
                child_name: req.params.childName
            }
        }).then((results) => {
            var childName = results[0].dataValues.child_name;
            res.render("adminAct", {
                data: results,
                data2: childName
            })
        });
    });

     //-----------------------------------------------------------//   
    //Pulling All messages from one especific child based on name//
   //-----------------------------------------------------------//
    app.get("/api/admin-message-site/:childName", isLoggedIn, (req, res) => {
        //var name = req.params.name;
        message_data.message.findAll({
            where: {
                child_name: req.params.childName
            }
        }).then((results) => {
            var childName = results[0].child_name;
            res.render("messages", {
                data3: results,
                dataName: childName
            })
        });
    });

      //-----------------------------------------------------//   
     //  Adding a New Child Into DB for administrator site  //
    //-----------------------------------------------------//
    
    app.post("/api/new/child", isLoggedIn, (req, res) => {
        console.log("daycare data:");
        //console.log(req.body);
        daycare_data.Children.create({
            child_name: req.body.child_name,
            child_last_name: req.body.child_last_name,
            date_of_birth: req.body.date_of_birth,
            parent_name: req.body.parent_name
        }).then((results) => {
            res.end();
        });
    });
    
    //----------------------------------//
    //        to update boolean
    //to close messages in admin site //
    //-------------------------------//
    app.post("/api/admin-message-delete/:test", isLoggedIn, (req, res) => {
        message_data.message.update({
            status_message: parseInt(req.body.status_message
                )}, { 
                    where: { 
                        id: req.params.test
                    } 
                })
            .then((results) => {
                res.end();
            });
    });

     //------------------------------------------------------//   
    //Adding a New Activities Into DB for administrator site//
    //-----------------------------------------------------//
    app.post("/api/new/activity", isLoggedIn, (req, res) => {
        console.log("daycare data:");
        console.log(req.body);

        daycare_data.Activities.create({
            child_name: req.body.child_name,
            activity_option: req.body.activity_option,
            activity_type: req.body.activity_type

        }).then((results) => {
            res.end();
        });
    });

      //----------------------------------------------//
     //            To get client site                //
    //----------------------------------------------//
    app.get("/api/client-site/:childName", isLoggedIn, (req, res) => {
        daycare_data.Activities.findAll({
            where:{
                child_name: req.params.childName
            }
        }).then((results) => {
            var childName = results[0].child_name;
            res.render("client", {
                data: results,
                data2: childName,
            })

            console.log("this is child name"+childName);
            
        });
        
    });

      //-----------------------------------------------//
     // For parents to send messages to admin site    //
    //-----------------------------------------------//
    app.post("/api/new/message", isLoggedIn, (req, res) => {
        console.log("message-data");
        console.log(req.body);

        message_data.message.create({
            child_name: req.body.child_name,
            message_from_parent: req.body.message_from_parent,

        }).then((results) => {
            res.end();
        });
    });




    //-----------------------------------------------//
    // Admin: Account creation                       //
    //-----------------------------------------------//
    app.get("/signup", authController.signup);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
 
        failureRedirect: '/api/error'
    }));
    
      //-----------------------------------------------//
     // Admin and Client signIn process               //
    //-----------------------------------------------//
    app.get("/parentSignin", isLoggedIn, authController.parentSignin);
    app.get("/adminSignin", isLoggedIn, authController.adminSignin);
 

    app.post("/parentSignin",  passport.authenticate('local-signin', { failureRedirect: '/' }),
    function(req, res){
        // console.log(Object.keys(req));
        console.log(req.user.username);
        var childName = req.user.username;
        res.redirect("/api/client-site/"+childName);
    }
    );
    app.post("/adminSignin", passport.authenticate('local-signin', {
        successRedirect: '/api/administrator',

        failureRedirect: '/'
    }

    ));



      //-----------------------------------------------//
     // LogOut process                                //
    //-----------------------------------------------//
    app.get('/logout', authController.logout);

      //-----------------------------------------------//
     // LogIn checker                                 //
    //-----------------------------------------------//
    function isLoggedIn(req, res, next) {
 
        if (req.isAuthenticated())
         
            return next();
             
        res.redirect('/');
     
    }

}