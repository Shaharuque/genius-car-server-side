const express = require('express');
const cors=require('cors')
const jwt=require('jsonwebtoken')
require('dotenv').config()
const port=process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app=express()

//middleware
app.use(cors())
//body diye jei data pai sheita access korar jnno aita use kora hocchey
app.use(express.json())

//Connect to mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yz2oh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      //connect to client
      await client.connect();
      const serviceCollection = client.db('genuisCar').collection('service');
      const orderCollection=client.db('genuisCar').collection('order')

      //AUTH API
      app.post('/login',async(req,res)=>{
        const user=req.body //user info get from client side
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '1d'
      });
      res.send({accessToken})
      })

      //SERVICES API
      //getting all the service from mongodb 'service' collection and show on the server side url(http://localhost:5000/service)
      app.get('/service',async(req,res)=>{
        const query={}
        //cursor geniusCar collection ar ekta pointer find out korsey 
        const cursor=serviceCollection.find(query)      //single kicho find kortey chailey findone use korbo
        //found pointer k array tey convert korey felbo
        const services=await cursor.toArray()
        res.send(services)
      })

      //getting single service using id(find a document)
      app.get('/service/:id',async(req,res)=>{
          const serviceid =req.params.id
          //ai query ar opor base korei next a data get hobey
          const query={_id:ObjectId(serviceid)}
          //remember jehotu ekta korey item find korbo tai cursor use kora lagbey na
          const service=await serviceCollection.findOne(query) //query ar moddhey id given so oi id basis a ek ekta korey service serviceCollection thekey niye ashbey
          res.send(service)
      })

      //service post to DB
      app.post('/service',async(req,res)=>{
        const newService=req.body; //client side thekey jei data ashbey seita store hobey newService a
        console.log(newService)
        const result = await serviceCollection.insertOne(newService);
        res.send(result)
      })

      //specific service delete api(service id dhorey dhorey delete)
      app.delete('/service/:id',async(req,res)=>{
        const id=req.params.id

        const query = {_id:ObjectId(id)}  //_id ar basis a database thekey ber kora lagbey kakey delete kortey chai
        const result = await serviceCollection.deleteOne(query);
        res.send(result);  //ai api je call korbey takey {res.send(result)}aita response hisabey dibo
      })


      //order collection api (POST API)
      app.post('/order',async(req,res)=>{
        const order=req.body;
        const result=await orderCollection.insertOne(order)
        res.send(result)
      })
      

      //ORDERS API
      //orders get api
      app.get('/order',async(req,res)=>{
        const user_email=req.query.email;         //client side thekey jodi url a kono query/condition dei sheita get kora jay aibhabey
        console.log(user_email)

        //query null rakhtey pari bcz we want to get all the orders from DB
        const query={email:user_email}  //DB ar email field ar moddhey user_email jar jar asey tader select korbey             

        //cursor geniusCar collection ar ekta pointer find out korsey 
        const cursor=orderCollection.find(query)      //single kicho find kortey chailey findone use korbo
        //found pointer k array tey convert korey felbo
        const orders=await cursor.toArray()
        res.send(orders)
      })

    } finally {
      
    }
  }
  run().catch(console.dir)

//root url=>'/'
app.get('/',(req,res)=>{
    res.send('Running Genius Server');
});

//MEWAO LIFE

app.listen(port ,()=>{
    console.log('Listening to port',port )
})