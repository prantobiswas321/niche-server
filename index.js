const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ujyx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('niche_cycle');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');

        // GET api for products
        app.get('/products', async (req, res) => {
            const result = await productsCollection.find({}).toArray();
            res.send(result);
        })

        // post api for add product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        })

        app.get('/order/:id', async (req, res) => {
            const result = await productsCollection.findOne({ _id: ObjectId(req.params.id) });
            res.send(result);
        })

        // post api
        app.post('/userOrder', async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body);
            res.send(result);
        })

        // post api for review
        app.post('/addReview', async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
        })

        // put api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // put api for admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // get my orders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await ordersCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        })

        // get all orders
        app.get('/userOrder', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
        })

        // delete api for my order
        app.delete('/deleteOrder/:id', async (req, res) => {
            const result = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.send(result);
        })

        // delete api for manage products
        app.delete('/deleteProduct/:id', async (req, res) => {
            const result = await productsCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.send(result);
        })

        // put api for update status
        app.put('/updateOrderStatus', async (req, res) => {
            const filter = { _id: ObjectId(req.body._id) };
            const updateDoc = { $set: { status: 'shipped' } };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
    }
    finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Bicycle portal!')
})

app.listen(port, () => {
    console.log(`Listening at ${port}`)
})