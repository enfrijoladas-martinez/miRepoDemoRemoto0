const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ====================== MOCKS (cámbialos por BD real después) ======================
let movimientos = [ /* tus movimientos actuales */ ];

let productos = [
    { id: 101, nombre: "Fertilizante NPK 20-20-20", precio: 245.50 },
    { id: 102, nombre: "Semilla Maíz Híbrido", precio: 185.00 },
    { id: 103, nombre: "Pesticida Orgánico", precio: 320.75 }
];

let almacenes = [
    { id: 1, nombre: "Bodega Principal - Veracruz" },
    { id: 2, nombre: "Almacén Campo - Xalapa" },
    { id: 3, nombre: "Depósito Secundario" }
];

// ====================== ENDPOINTS ======================
app.get('/api/productos', (req, res) => res.json(productos));
app.get('/api/almacenes', (req, res) => res.json(almacenes));
app.get('/api/movimientos', (req, res) => res.json(movimientos));

// POST, PUT, DELETE (ya los tenías)
app.post('/api/movimientos', (req, res) => { /* tu código actual */ });
app.put('/api/movimientos/:id', (req, res) => { /* tu código */ });
app.delete('/api/movimientos/:id', (req, res) => { /* tu código */ });

app.listen(port, () => console.log(`🚀 Servidor corriendo en http://localhost:${port}`));