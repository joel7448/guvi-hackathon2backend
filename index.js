const express = require("express");
const app = express();
app.use(express.json())
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");


app.use(
    cors({
      origin: "*",
    })
  );
  const dotenv = require("dotenv").config();
  const SECRET = process.env.SECRET;
  const URL = process.env.DB


let products = [];

let authenticate = function (req, res, next) {
  
    if (req.headers.authorization) {
     try {
      let verify = jwt.verify(req.headers.authorization, SECRET);
      if (verify) {
        req.userid = verify._id;
       
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
     } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
     }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };



app.get("/products",authenticate,async function(req,res){
    try{
const connection =  await mongoClient.connect(URL);

const db = connection.db("products");

let products = await  db.collection("products").find().toArray();



await connection.close();

res.json(products);

    }
    catch(error){
        console.log(error);
    }
})



app.post("/buyer",async function(req,res){
    const connection = await mongoClient.connect(URL);

    const db = connection.db("products");

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.Password, salt);

req.body.Password=hash;


    await db.collection("buyer").insertOne(req.body);

    await connection.close();

    
    res.json({
        message : "Buyer info registered"
    })

})

app.post("/seller",async function(req,res){
    
    const connection = await mongoClient.connect(URL);

    const db = connection.db("products");

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.Password, salt);

req.body.Password=hash

    await db.collection("seller").insertOne(req.body);

    await connection.close();



    
    res.json({
        message : "seller info registered"
    })
})


app.post("/productpush",authenticate,async function(req,res){
    const connection = await mongoClient.connect(URL);

    const db = connection.db("products");

    await db.collection("products").insertOne(req.body);

    await connection.close();

    res.json({
        message : "Successfully added"
    })




})

app.post("/buyerlogin",async function(req,res){
    try{
        const connection = await mongoClient.connect(URL);

        const db = connection.db("products");

        const user = await db.collection("buyer").findOne({Email:req.body.Email});
console.log(req.body.Email);
        if(user){
            const match = await bcryptjs.compare(req.body.Password,user.Password);

            if(match){
                const token = jwt.sign({ _id: user._id }, SECRET);
                console.log(token)
                res.json({
                    message : "successfully logged in ",
                    token
                });
            }
                else{
                    res.status(401).json({
                        message: "Password is incorrect",
                      });
                }
            
        }
        else {
            res.status(401).json({
              message: "User not found",
            });
        }
    }

    catch(error){
console.log(error)
    }

})

app.post("/sellerlogin",async function(req,res){
    try{
        const connection = await mongoClient.connect(URL);

        const db = connection.db("products");

        const user = await db.collection("seller").findOne({Email:req.body.Email});
console.log(req.body.Email);
        if(user){
            const match = await bcryptjs.compare(req.body.Password,user.Password);

            if(match){
                const token = jwt.sign({ _id: user._id }, SECRET);
                console.log(token)
                res.json({
                    message : "successfully logged in ",
                    token
                });
            }
                else{
                    res.status(401).json({
                        message: "Password is incorrect",
                      });
                }
            
        }
        else {
            res.status(401).json({
              message: "User not found",
            });
        }
    }

    catch(error){
console.log(error)
    }

})


app.post("/filter", async function(req,res){

    const connection = await mongoClient.connect(URL);

    const db = connection.db("products");


    let filter = await db.collection("products").find({ category:`${req.body.category}` }).toArray()

       await connection.close();

       res.json(filter)



})

app.post("/addtocart",async function(req,res){

    const connection = await mongoClient.connect(URL);

    const db = connection.db("products");

    await db.collection("cart").insertOne(req.body);

    await connection.close();


    res.json({
        message : "added"
    })



})

app.get("/addtocart",async function(req,res){

    const connection = await mongoClient.connect(URL);

    const db = connection.db("products");

    let products = await  db.collection("cart").find().toArray();

    await connection.close();

    res.json(products);


})

app.delete("/deletecart/:id",async function(req,res){
    try {
        // Open the Connection
        const connection = await mongoClient.connect(URL);
    
        // Select the DB
        const db = connection.db("products");
    
        // Select the collection and do the operation
        let student = await db.collection("cart").deleteOne({ _id: mongodb.ObjectId(req.params.id) });
    
        // Close the connection
        await connection.close();
    
        res.json({
            message: "deleted successfully",
          });
        } catch (error) {
          console.log(error);
        }
})

app.post("/contactus",async function(req,res){
    try{
        const connection = await mongoClient.connect(URL);
        const db = connection.db("products");
        await db.collection("contactus").insertOne(req.body);
        await connection.close();
        res.json({
            message : "Query sent successfully 😉 Thankyou for contacting us"
        })

    }
    catch(error){
        console.log(error)
    }
})

app.listen(process.env.PORT ||3001 )
