require('dotenv').config()


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
//tambien manda clientes y productos para poder armar el carrito en el formulario
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
            },
            { $sort: { fechaPedido: -1 } }
        ]).toArray()

        const clientes = await db.collection('clientes').find().toArray()
        const productos = await db.collection('productos').find().toArray()

        res.render('pedidos.ejs', { pedidos: pedidos, clientes: clientes, productos: productos })
    } catch (err) {
        console.error(err)
        res.status(500).send('Error al cargar pedidos')
    }
})
//POST de pedidos
//Acepta uno o varios productos por pedido. req.body.productos debe ser un
//array (JSON) del tipo: [{ productoId: "...", cantidad: 2 }, ...]
//El total NUNCA se recibe del cliente: siempre se calcula en el servidor.
app.post('/pedidos', async (req, res) => {
    try {
        //el cliente es obligatorio
        if (!req.body.clienteId) {
            return res.status(400).send('Falta el cliente para este pedido')
        }
        const clienteId = new ObjectId(req.body.clienteId)

        const cliente = await db.collection('clientes').findOne({ _id: clienteId })
        if (!cliente) {
            return res.status(404).send('Cliente no encontrado')
        }

        //normalizar la lista de productos: acepta array ya parseado (JSON body)
        //o un string JSON (form-urlencoded), para no romper distintos clientes/formularios
        let itemsSolicitados = req.body.productos
        if (typeof itemsSolicitados === 'string') {
            try {
                itemsSolicitados = JSON.parse(itemsSolicitados)
            } catch (parseErr) {
                return res.status(400).send('Formato invalido en productos')
            }
        }
        if (!Array.isArray(itemsSolicitados) || itemsSolicitados.length === 0) {
            return res.status(400).send('El pedido debe incluir al menos un producto')
        }

        //validar cada item y armar los detalles del pedido
        const detallesPedido = []
        let total = 0

        for (const item of itemsSolicitados) {
            if (!item.productoId || !item.cantidad) {
                return res.status(400).send('Cada producto necesita productoId y cantidad')
            }

            const productoId = new ObjectId(item.productoId)
            const cantidad = parseInt(item.cantidad)

            if (isNaN(cantidad) || cantidad <= 0) {
                return res.status(400).send('Cantidad invalida para uno de los productos')
            }

            const producto = await db.collection('productos').findOne({ _id: productoId })
            if (!producto) {
                return res.status(404).send(`Producto no encontrado: ${item.productoId}`)
            }
            if (producto.stock < cantidad) {
                return res.status(400).send(`Stock insuficiente para: ${producto.nombre}`)
            }

            detallesPedido.push({ productoId: productoId, cantidad: cantidad })
            total += producto.precio * cantidad
        }

        const pedido = {
            clienteId: clienteId,
            productos: detallesPedido,
            total: total,
            estado: 'pendiente',
            fechaPedido: new Date()
        }

        await db.collection('pedidos').insertOne(pedido)

        //descontar stock de cada producto involucrado
        for (const item of detallesPedido) {
            await db.collection('productos').updateOne(
                { _id: item.productoId },
                { $inc: { stock: -item.cantidad } }
            )
        }

        res.redirect('/pedidos')
    } catch (err) {
        console.error(err)
        res.status(500).send('Error al guardar pedido')
    }
})
//actualizar solo el estado de un pedido
app.put('/pedidos/:id/estado', async (req, res) => {
    try {
        const estadosValidos = ['pendiente', 'procesando', 'completado', 'cancelado']
        if (!estadosValidos.includes(req.body.estado)) {
            return res.status(400).json({ success: false, message: 'Estado invalido' })
        }
        await db.collection('pedidos').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { estado: req.body.estado } }
        )
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false })
    }
})
//Delete de pedido
//al cancelar/borrar un pedido, devolvemos el stock que se habia descontado
app.delete('/pedidos/:id', async (req, res) => {
    try {
        const pedidoId = new ObjectId(req.params.id)

        const pedido = await db.collection('pedidos').findOne({ _id: pedidoId })
        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
        }

        //devolver el stock de cada producto del pedido
        for (const item of pedido.productos) {
            await db.collection('productos').updateOne(
                { _id: item.productoId },
                { $inc: { stock: item.cantidad } }
            )
        }

        await db.collection('pedidos').deleteOne({ _id: pedidoId })

        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false })
    }
})
// Conectar a MongoDB y LUEGO iniciar el servidor
MongoClient.connect(process.env.MONGO_URI)
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
