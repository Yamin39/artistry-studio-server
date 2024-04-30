const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://artistry-studio-yamin39.web.app", "https://artistry-studio-yamin39.firebaseapp.com"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6fu63x8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    // collections
    const craftItemsCollection = client.db("artistryStudioDB").collection("craftItems");
    const subcategoriesCollection = client.db("artistryStudioDB").collection("subcategories");

    // art & craft items CRUD
    // CREATE
    app.post("/craft-items", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await craftItemsCollection.insertOne(newItem);
      console.log(req.query);
      res.send(result);
    });

    // READ Many
    app.get("/craft-items", async (req, res) => {
      const cursor = craftItemsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // READ One
    app.get("/craft-items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await craftItemsCollection.findOne(query);
      res.send(result);
    });

    // READ for specific user
    app.get("/my-art-&-craft-list/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        user_email: email,
      };
      const cursor = craftItemsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // READ to filter by Customization
    app.get("/my-art-&-craft-list/:email/:customization", async (req, res) => {
      const email = req.params.email;
      const customization = req.params.customization;
      const query = {
        user_email: email,
        customization: customization,
      };
      const cursor = craftItemsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // UPDATE a craft item
    app.patch("/craft-items/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCraftItem = req.body;
      const filter = { _id: new ObjectId(id) };
      const craftItem = {
        $set: {
          imageURL: updatedCraftItem.imageURL,
          name: updatedCraftItem.name,
          subcategory_name: updatedCraftItem.subcategory_name,
          short_description: updatedCraftItem.short_description,
          price: updatedCraftItem.price,
          rating: updatedCraftItem.rating,
          customization: updatedCraftItem.customization,
          processing_time: updatedCraftItem.processing_time,
          stockStatus: updatedCraftItem.stockStatus,
        },
      };
      const result = await craftItemsCollection.updateOne(filter, craftItem);
      res.send(result);
    });

    // DELETE a craft item
    app.delete("/craft-items/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await craftItemsCollection.deleteOne(query);
      res.send(result);
    });

    // subcategories CRUD operations
    // READ subcategories
    app.get("/subcategories", async (req, res) => {
      const cursor = subcategoriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // READ data by subcategories
    app.get("/subcategories/:subcategory", async (req, res) => {
      const subcategory = req.params.subcategory;
      const query = { subcategory_name: subcategory };
      const cursor = craftItemsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Artistry Studio Server is running");
});

app.listen(port, () => {
  console.log(`Artistry Studio Server is running on port: `, port);
});
