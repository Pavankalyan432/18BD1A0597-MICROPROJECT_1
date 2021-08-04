var express=require("express");
var app=express();

let server=require("./server")
let middleware=require("./middleware");
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const MongoClient=require("mongodb").MongoClient;
const url="mongodb://127.0.0.1:27017";

MongoClient.connect(url,{useUnifiedTopology: true},(err,client)=>{
    if(err){
        console.log("Failed to connect to Database");
        return;
    }
    db=client.db("project1");
    console.log("Connection Successfull with the Database");
})

//Get Hospital Details
app.get("/hospitals",middleware.checkToken,(req,res)=>{
    db.collection("hospitals").find({}).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        console.log("Fetching Details from Hospital Collection");
        res.json(result);
    });
});

//Get Ventilator Details
app.get("/ventilators",(req,res)=>{
    db.collection("ventilators").find({}).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        
        console.log("Fetching Details from Ventilator Collection");
        res.json(result);
    });
});

//Search Ventilators by status and hospital name
app.post("/ventilator",(req,res)=>{
    const vstatus=req.body.status;
    const query={"status":vstatus};
    db.collection("ventilators").find(query).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        
        console.log(`Fetching Details from Ventilator Collection with status "${vstatus}"`);
        res.json(result);
    });
});


//Search Hospital by name
app.post("/hospital",(req,res)=>{
    const hname=req.body.name;
    const query={name:new RegExp(hname,'i')};
    console.log("Database Connection Succeeded");
    db.collection("hospitals").find(query).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        console.log(`Fetching Details from Hospital Collection with name "${hname}"`);
        res.json(result);
    });
});

//Update Ventilator Details
app.put("/updateventilator",(req,res)=>{
    const vid=req.body.vid;
    const newStatus=req.body.status;
    const query={vid:vid};
    const new_query={$set: {status:newStatus}};
    db.collection("ventilators").updateOne(query,new_query,(err,result)=>{
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        res.json("Updated successfully for VentId : "+vid);
    });
});

//Add Ventilator
app.post("/addventilator",(req,res)=>{
    const hid=req.body.hid;
    const vid=req.body.vid;
    const vstatus=req.body.status;
    const query={hid:hid,vid:vid,status:vstatus};
    db.collection("ventilators").insertOne(query,(err,result)=>{
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        res.send(`Details has been added with VentId : ${vid}`);
    });
});

//Delete Ventilator by Vent ID
app.delete("/removeventilator",(req,res)=>{
    let ventId=req.body.vid;
    const query={vid:ventId};
    db.collection("ventilators").deleteOne(query,(err,result)=>{
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        res.json("All Entries with VentilatorId "+ventId+" are deleted.");
    });
});
app.listen(3000);