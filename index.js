const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

// middleware

app.use(cors());
app.use(express.json());

//connect to database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b6e4q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("emaJohn").collection("product");

    app.get("/product", async (req, res) => {
      console.log("query", req.query);
      //forwarding page
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);
      const query = {};
      const cursor = productCollection.find(query);

      if (page || pageSize) {
        // page 0 --> skip : 0, get:0-10:
        //pag 1 -->skip :1*10 get:11-20:
        //pag 2 -->skip :2*10 get:21-30:
        products = await cursor
          .skip(page * pageSize)
          .limit(pageSize)
          .toArray();
      } else {
        products = await cursor.toArray();
      }

      res.send(products);
    });

    // count product number

    app.get("/productCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // use post to get product by ids

    app.post("/productByKeys", async (req, res) => {
      const keys = req.body;
      const ids = keys.map((id) => ObjectId(id));
      const query = { _id: { $in: ids } };
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello server");
});

app.listen(port, () => {
  console.log("Listening", port);
});
