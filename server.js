const express = require('express')
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')
const app = express()
const MongoClient = require('mongodb').MongoClient

var db
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.redirect('/home')
})


app.get('/home', (req, res) => {
    res.render('home.ejs')
})

//GET de clientes total
app.get('/clientes', async (req, res) => {
    try {
        const clientes = await db.collection('clientes').find().toArray()
        res.render('clientes.ejs', {clientes:clientes})
    }   catch (err) {
        console.error(err)
        res.status(500).send('error al cargar los clientes! ayy!')
    }

})
//POST de cliente o crear nuevo cliente

app.post('/clientes', async(req, res) => {
    try {
        //construir el subdocumento direccion debe ir antes del await
        const direccion = {
            calle :req.body.calle,
            ciudad : req.body.ciudad,
            comuna : req.body.comuna,
            numero : req.body.numero ? parseInt(req.body.numero) : null,
            codigoPostal : req.body.codigoPostal

        }
        await db.collection('clientes').insertOne({
            nombre: req.body.nombre,
            email: req.body.email,
            telefono: req.body.telefono,
            direccion: direccion, //subdocumento
            fechaRegistro: new Date()
        })
        res.redirect('/clientes')
    } catch (err) {
        console.error(err)
        res.status(500).send('error al guardar este cliente!! no!!')
    }
})
//actualizacion de cliente
app.put('/clientes/:id',async (req,res) => {
    try {
        const direccion = {
            calle: req.body.calle,
            ciudad : req.body.ciudad,
            comuna : req.body.comuna,
            numero : req.body.numero ? parseInt(req.body.numero) : null,
            codigoPostal : req.body.codigoPostal
        }
        await db.collection('clientes').updateOne(
            {_id: new ObjectId(req.params.id)},
            {$set: {
            nombre: req.body.nombre,
            email: req.body.email,
            telefono : req.body.telefono,
            direccion : direccion
            }}
        )
        res.json({ success : true })
    } catch (err) {
        console.error(err)
        res.status(500).json({success:false})
    }
})
//actualizar direccion
app.put('/clientes/:id/direccion', async (req, res) => {
    try {
        const direccion = {
            calle: req.body.calle,
            ciudad : req.body.ciudad,
            comuna : req.body.comuna,
            numero : req.body.numero ? parseInt(req.body.numero) : null,
            codigoPostal : req.body.codigoPostal
        }
        await db.collection('clientes').updateOne(
            {_id: new ObjectId(req.params.id)},
            {$set: {direccion:direccion}}
        )
        res.json({success:true})
    } catch (err) {
        console.error(err)
        res.status(500).json({success:false})
    }
})
app.get('/clientes/ciudad/:ciudad',async (req,res) => {
    try {
        const clientes = await db.collection('clientes')
        .find({ 'direccion.ciudad' : req.params.ciudad})
        .toArray()
        res.json(clientes)
    } catch (err) {
        console.error(err)
        res.status(500).send('error de busqueda! ay!')
    }
})
//delete de Clientes
app.delete('/clientes/:id', async(req,res)=> {
    try {
        await db.collection('clientes').deleteOne({_id: new ObjectId(req.params.id)})
        res.json({success:true})
    } catch (err) {
        console.error(err)
        res.status(500).json({success:false})
    }
})
//GET de productos
app.get('/productos', async (req, res) => {
    try {
        const productos = await db.collection('productos').find().toArray()
        res.render('productos.ejs', { productos: productos })
    } catch (err) {
        console.error(err)
        res.status(500).send('error! no puedo cargar tus productos! oh!')
    }
})
//POST de productos
app.post('/productos', async (req, res) => {
    try {
        await db.collection('productos').insertOne({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: parseFloat(req.body.precio),
            stock: parseInt(req.body.stock),
            categoria: req.body.categoria
        })
        res.redirect('/productos')
    } catch (err) {
        console.error(err)
        res.status(500).send('error al guardar producto!')
    }
})
//PUT de producto
app.put('/productos/:id', async (req, res) => {
    try {
        await db.collection('productos').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                precio: parseFloat(req.body.precio),
                stock: parseInt(req.body.stock),
                categoria: req.body.categoria
            }}
        )
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false })
    }
})
//Delete de producto
app.delete('/productos/:id', async (req, res) => {
    try {
        await db.collection('productos').deleteOne({ _id: new ObjectId(req.params.id) })
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false })
    }
})
//GET de pedidos
app.get('/pedidos', async (req, res) => {
    try {
        const pedidos = await db.collection('pedidos').aggregate([
            {
                $lookup: {
                    from: 'clientes',
                    localField: 'clienteId',
                    foreignField: '_id',
                    as: 'cliente'
                }
            },
            {
                $lookup: {
                    from: 'productos',
                    localField: 'productos.productoId',
                    foreignField: '_id',
                    as: 'detallesProductos'
                }
            }
        ]).toArray()
        
        res.render('pedidos.ejs', { pedidos: pedidos })
    } catch (err) {
        console.error(err)
        res.status(500).send('Error al cargar pedidos')
    }
})
//POST de pedidos
app.post('/pedidos', async (req, res) => {
    try {
        const pedido = {
            clienteId: new ObjectId(req.body.clienteId),
            productos: JSON.parse(req.body.productos),
            total: parseFloat(req.body.total),
            estado: 'pendiente',
            fechaPedido: new Date()
        }
        await db.collection('pedidos').insertOne(pedido)
        res.redirect('/pedidos')
    } catch (err) {
        console.error(err)
        res.status(500).send('Error al guardar pedido')
    }
})
// Conectar a MongoDB y LUEGO iniciar el servidor
MongoClient.connect('mongodb+srv://heavenobscured_db_user:kXYKarXnGNAGWPFq@clustereval04.km0nlzx.mongodb.net/?appName=ClusterEval04')
    .then(client => {
        db = client.db('comercioTech')
        console.log(' te conectaste a MongoDB')
        //indices para rendimiento
        db.collection('clientes').createIndex({email:1}, {unique:true})
        db.collection('clientes').createIndex({'direccion.ciudad':1})
        db.collection('clientes').createIndex({'direccion.comuna':1})

        db.collection('productos').createIndex({nombre:1})
        db.collection('pedidos').createIndex({clienteId:1})
        db.collection('pedidos').createIndex({fechaPedido:-1})

        app.listen(3000, () => {
            console.log('servidor en http://localhost:3000')
        })
    })
    .catch(err => {
        console.error(' error conectando a MongoDB:', err)
    })