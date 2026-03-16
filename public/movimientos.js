const API = "http://localhost:3000/api/movimientos";
const tabla = document.getElementById("tablaMovimientos");
const form = document.getElementById("formMovimientos");

async function cargarMovimientos() {
    const res = await fetch(API);
    const data = await res.json();
    tabla.innerHTML = "";

    data.forEach(m => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${m.fecha}</td>
            <td><strong>${m.tipo ? '✅ Entrada' : '❌ Salida'}</strong></td>
            <td>${m.nombre_producto}</td>
            <td>${m.nombre_almacen}</td>
            <td>${m.cantidad}</td>
        `;
        tabla.appendChild(fila);
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const movimiento = {
        tipo: document.getElementById("tipo").value === "true",
        cantidad: document.getElementById("cantidad").value,
        id_producto: document.getElementById("id_producto").value,
        nombre_producto: document.getElementById("id_producto").selectedOptions[0].text,
        id_almacen: document.getElementById("id_almacen").value,
        nombre_almacen: document.getElementById("id_almacen").selectedOptions[0].text
    };

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movimiento)
    });

    form.reset();
    cargarMovimientos();
});

cargarMovimientos();