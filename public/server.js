const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ====================== MOCK MOVIMIENTOS ======================
let movimientos = [
    { id: 1, tipo: true, cantidad: 50, id_producto: 101, nombre_producto: "Fertilizante NPK", id_almacen: 1, nombre_almacen: "Bodega Principal", fecha: "2026-03-15" },
    { id: 2, tipo: false, cantidad: 10, id_producto: 102, nombre_producto: "Semilla Maíz", id_almacen: 2, nombre_almacen: "Almacén Campo", fecha: "2026-03-14" }
];

let idMovActual = 3;

// Endpoints para movimientos
app.get('/api/movimientos', (req, res) => res.json(movimientos));

app.post('/api/movimientos', (req, res) => {
    const nuevo = {
        id: idMovActual++,
        tipo: req.body.tipo,
        cantidad: parseInt(req.body.cantidad),
        id_producto: parseInt(req.body.id_producto),
        nombre_producto: req.body.nombre_producto,
        id_almacen: parseInt(req.body.id_almacen),
        nombre_almacen: req.body.nombre_almacen,
        fecha: new Date().toISOString().split('T')[0]
    };
    movimientos.unshift(nuevo);
    res.status(201).json(nuevo);
});

app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));