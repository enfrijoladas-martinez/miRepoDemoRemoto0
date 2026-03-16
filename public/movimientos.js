const API = "http://localhost:3000";   // ← Cuando tu compañera tenga el backend real, cámbialo por su URL

let todosLosMovimientos = [];
let chartTipo = null;
let chartProductos = null;

// ==================== CARGAR SELECTS DESDE LA BASE DE DATOS ====================
async function cargarSelects() {
    try {
        const prodRes = await fetch(`${API}/api/productos`);
        const productos = await prodRes.json();

        const almRes = await fetch(`${API}/api/almacenes`);
        const almacenes = await almRes.json();

        // Llenar Producto
        const selectProd = document.getElementById('id_producto');
        selectProd.innerHTML = '<option value="">Selecciona un producto</option>';
        productos.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nombre;
            selectProd.appendChild(opt);
        });

        // Llenar Almacén
        const selectAlm = document.getElementById('id_almacen');
        selectAlm.innerHTML = '<option value="">Selecciona un almacén</option>';
        almacenes.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.nombre;
            selectAlm.appendChild(opt);
        });
    } catch (error) {
        console.error("Error cargando productos y almacenes:", error);
    }
}

// ==================== CARGAR MOVIMIENTOS Y ESTADÍSTICAS ====================
async function cargarDatos() {
    const res = await fetch(`${API}/api/movimientos`);
    todosLosMovimientos = await res.json();

    renderizarTabla(todosLosMovimientos);
    cargarEstadisticas();
    actualizarGraficos();
}

// ==================== ESTADÍSTICAS ====================
function cargarEstadisticas() {
    const entradas = todosLosMovimientos.filter(m => m.tipo).length;
    const salidas = todosLosMovimientos.filter(m => !m.tipo).length;
    const hoy = new Date().toISOString().split('T')[0];
    const movimientosHoy = todosLosMovimientos.filter(m => m.fecha === hoy).length;

    document.getElementById('stats').innerHTML = `
        <div class="col-md-3"><div class="card stat-card text-white bg-success"><div class="card-body"><h5>Entradas</h5><h2>${entradas}</h2></div></div></div>
        <div class="col-md-3"><div class="card stat-card text-white bg-danger"><div class="card-body"><h5>Salidas</h5><h2>${salidas}</h2></div></div></div>
        <div class="col-md-3"><div class="card stat-card text-white bg-primary"><div class="card-body"><h5>Hoy</h5><h2>${movimientosHoy}</h2></div></div></div>
        <div class="col-md-3"><div class="card stat-card text-white bg-warning"><div class="card-body"><h5>Total</h5><h2>${todosLosMovimientos.length}</h2></div></div></div>
    `;
}

// ==================== TABLA ====================
function renderizarTabla(data) {
    const tbody = document.querySelector('#tablaMovimientos tbody');
    tbody.innerHTML = '';

    data.forEach(m => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${m.fecha}</td>
            <td><span class="badge ${m.tipo ? 'badge-entrada' : 'badge-salida'}">${m.tipo ? '✅ Entrada' : '❌ Salida'}</span></td>
            <td>${m.nombre_producto}</td>
            <td>${m.nombre_almacen}</td>
            <td><strong>${m.cantidad}</strong></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarMovimiento(${m.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="eliminarMovimiento(${m.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// ==================== FILTROS ====================
function aplicarFiltros() {
    const producto = document.getElementById('filtroProducto').value;
    const tipo = document.getElementById('filtroTipo').value;
    const busqueda = document.getElementById('busqueda').value.toLowerCase();

    let filtrados = todosLosMovimientos.filter(m => {
        return (!producto || m.id_producto == producto) &&
               (!tipo || m.tipo.toString() === tipo) &&
               m.nombre_producto.toLowerCase().includes(busqueda);
    });

    renderizarTabla(filtrados);
}

// ==================== GRÁFICOS ====================
function actualizarGraficos() {
    const entradas = todosLosMovimientos.filter(m => m.tipo).length;
    const salidas = todosLosMovimientos.filter(m => !m.tipo).length;

    // Gráfico Tipo
    if (chartTipo) chartTipo.destroy();
    chartTipo = new Chart(document.getElementById('chartTipo'), {
        type: 'doughnut',
        data: {
            labels: ['Entradas', 'Salidas'],
            datasets: [{ data: [entradas, salidas], backgroundColor: ['#2E7D32', '#c62828'] }]
        }
    });

    // Gráfico Productos más movidos
    const productosMovidos = {};
    todosLosMovimientos.forEach(m => {
        productosMovidos[m.nombre_producto] = (productosMovidos[m.nombre_producto] || 0) + m.cantidad;
    });

    if (chartProductos) chartProductos.destroy();
    chartProductos = new Chart(document.getElementById('chartProductos'), {
        type: 'bar',
        data: {
            labels: Object.keys(productosMovidos),
            datasets: [{ label: 'Cantidad Movida', data: Object.values(productosMovidos), backgroundColor: '#2E7D32' }]
        }
    });
}

// ==================== EDITAR ====================
let movimientoAEditar = null;

function editarMovimiento(id) {
    movimientoAEditar = todosLosMovimientos.find(m => m.id === id);
    if (!movimientoAEditar) return;

    document.getElementById('editId').value = movimientoAEditar.id;
    document.getElementById('editProducto').value = movimientoAEditar.id_producto;
    document.getElementById('editAlmacen').value = movimientoAEditar.id_almacen;
    document.getElementById('editTipo').value = movimientoAEditar.tipo;
    document.getElementById('editCantidad').value = movimientoAEditar.cantidad;

    new bootstrap.Modal(document.getElementById('modalEditar')).show();
}

async function guardarEdicion() {
    const id = parseInt(document.getElementById('editId').value);
    const movimientoActualizado = {
        tipo: document.getElementById('editTipo').value === "true",
        cantidad: parseInt(document.getElementById('editCantidad').value),
        id_producto: parseInt(document.getElementById('editProducto').value),
        nombre_producto: document.getElementById('editProducto').selectedOptions[0].text,
        id_almacen: parseInt(document.getElementById('editAlmacen').value),
        nombre_almacen: document.getElementById('editAlmacen').selectedOptions[0].text
    };

    await fetch(`${API}/api/movimientos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movimientoActualizado)
    });

    bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
    cargarDatos();
}

// ==================== ELIMINAR ====================
async function eliminarMovimiento(id) {
    if (!confirm('¿Estás seguro de eliminar este movimiento?')) return;

    await fetch(`${API}/api/movimientos/${id}`, { method: 'DELETE' });
    cargarDatos();
}

// ==================== MODO NOCHE ====================
function toggleTheme() {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// ==================== INICIALIZACIÓN ====================
async function init() {
    await cargarSelects();
    await cargarDatos();

    // Recordar tema guardado
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
}

init();