require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");

console.log("user => ", process.env.BUCKET);
console.log("user pass=> ", process.env.BUCKET_KEY);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.BUCKET}:${process.env.BUCKET_KEY}@cluster0.lyiobzh.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());

app.get("/", (req, res) => {
  res.send("World say hello to MiniTeen ");
});

// mongo db
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toys = client.db("miniTinDB").collection("toysCollection");

    // ---getting all data
    app.get("/all-toys", async (req, res) => {
      const result = await toys.find().toArray();
      res.send(result);
    });

    // ---posting toy data
    app.post("/add-toy",async (req,res)=>{
      const body=req.body
      console.log("the data",body);
      const result = await toys.insertOne(body)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
