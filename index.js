require("dotenv").config();

const express = require("express");
const app = express();
const port = 8000;
const cors = require("cors");

// console.log("user => ", process.env.BUCKET);
// console.log("user pass=> ", process.env.BUCKET_KEY);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.BUCKET}:${process.env.BUCKET_KEY}@cluster0.lyiobzh.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors({
  origin: "*",
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("World say hello to MiniTeen ");
});

// MongoDB connection setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const toys = client.db("miniTinDB").collection("toysCollection");

    const indexKey = { toyName: 1 };
    const indexOption = { name: "toyname" };
    const result = await toys.createIndex(indexKey, indexOption);

    app.get("/all-toys", async (req, res) => {
      const result = await toys.find().toArray();
      res.send(result);
    });

    app.get("/toySearchByName/:text", async (req, res) => {
      const toyname = req.params.text;
      const result = await toys
        .find({
          toyName: {
            $regex: toyname,
            $options: "i",
          },
        })
        .toArray();
      res.send(result);
    });

    app.get("/all-toys/:category", async (req, res) => {
      const category = req.params.category;
      console.log("category", category);
      const result = await toys.find({ subCategory: category }).toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const toy = await toys.findOne({ _id: new ObjectId(id) });
      res.send(toy);
    });

    app.post("/add-toy", async (req, res) => {
      let data = req.body;
      console.log("given data =>", data);
      const result = await toys.insertOne(data);
      res.send(result);
    });

    app.get("/mytoy/:email", async (req, res) => {
      let email = req.params.email;
      console.log("this is email ", email);
      const result = await toys.find({ sellerEmail: email }).toArray();
      res.send(result);
    });

    app.delete("/mytoy/:id", async (req, res) => {
      const id = req.params.id;
      console.log("this is id", id);
      const query = { _id: new ObjectId(id) };
      const result = await toys.deleteOne(query);
      res.send(result);
    });

    app.patch("/mytoy-edit/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          toyName: body.toyName,
          price: body.price,
          availableQuantity: body.availableQuantity,
          description: body.description,
        },
      };
      const result = await toys.updateOne(filter, updateDoc);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  } finally {
    // Uncomment to close the connection when the server stops
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
