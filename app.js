document.addEventListener("DOMContentLoaded", function () {
  const agregarBotones = document.querySelectorAll(".agregar-producto");
  const listaProductos = document.querySelector(".lista-productos");
  const vaciarBoton = document.querySelector(".vaciar-producto");
  const contadorCarrito = document.querySelector("#contador-carrito");
  const formulario = document.querySelector("form");
  const mensajeCompra = document.createElement("p");

  const contenedorProductos = document.querySelector("#contenedor-productos");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let usuario = JSON.parse(localStorage.getItem("usuario")) || {
    email: "",
    carrito: carrito,
  };

  formulario.reset();
  vaciarBoton.addEventListener("click", vaciarCarrito);
  formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    mostrarMensajeCompra();
  });

  function generarProducto(producto) {
    return `
      <div class="col">
        <div class="card h-50">
          <img
            src="${producto.imagen}"
            class="card-img-top"
            alt="${producto.nombre}"
          />
          <div class="card-body">
            <h5 class="card-title text-center">${producto.nombre}</h5>
            <p class="card-text text-center">$${producto.precio}</p>
            <div class="card-footer">
              <p class="text text-center">cuotas sin interés de $${producto.cuotas}</p>
            </div>
          </div>
          <div class="d-grid gap-2 d-md-flex justify-content-md-center">
            <button class="agregar-producto btn btn-success m-3" type="button">
              Agregar a Carrito
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function generarProductoCarrito(producto, cantidad, indice) {
    return `
      <div class="producto-carrito">
        <div>
          <img src="${producto.imagen}" alt="${producto.nombre}" />
        </div>
        <div>
          <p>${producto.nombre} - $${producto.precio} - Cantidad: ${cantidad}</p>
        </div>
        <div>
          <button class="eliminar-producto btn btn-danger mb-2" data-indice="${indice}" id="eliminar-${indice}">
            Eliminar
          </button>
        </div>
      </div>
    `;
  }

  function renderizarCarrito() {
    listaProductos.innerHTML = "";

    usuario = JSON.parse(localStorage.getItem("usuario")) || usuario;
    carrito = usuario.carrito || [];

    const productosContados = contarProductos(carrito);

    const carritoProductos = Object.keys(productosContados).map((nombre) => {
      const producto = carrito.find((p) => p.nombre === nombre);
      const cantidad = productosContados[nombre];
      return {
        producto,
        cantidad,
      };
    });

    carritoProductos.forEach(function (item, indice) {
      const productoDiv = document.createElement("div");
      productoDiv.classList.add("producto");
      productoDiv.innerHTML = generarProductoCarrito(
        item.producto,
        item.cantidad,
        indice
      );
      listaProductos.appendChild(productoDiv);
    });

    contadorCarrito.textContent = carrito.length;

    const botonesEliminar = document.querySelectorAll(".eliminar-producto");
    botonesEliminar.forEach((boton, indice) => {
      boton.addEventListener("click", () => {
        eliminarProducto(indice);
      });
    });

    const total = carrito.reduce(
      (acumulador, producto) => acumulador + producto.precio,
      0
    );

    const totalCompra = document.querySelector("#total-compra");
    totalCompra.textContent = `Total: $${total}`;
  }

  function contarProductos(carrito) {
    const productosContados = {};
    for (const producto of carrito) {
      if (producto.nombre in productosContados) {
        productosContados[producto.nombre]++;
      } else {
        productosContados[producto.nombre] = 1;
      }
    }
    return productosContados;
  }

  function agregarProducto(boton) {
    const card = boton.closest(".card");
    const titulo = card.querySelector(".card-title").textContent;
    const precioTexto = card.querySelector(".card-text").textContent;
    const precio = Number(precioTexto.substring(1));
    const imagen = card.querySelector(".card-img-top").src;

    const producto = {
      nombre: titulo,
      precio: precio,
      imagen: imagen,
    };

    carrito.push(producto);

    usuario.carrito = carrito;

    localStorage.setItem("carrito", JSON.stringify(carrito));
    localStorage.setItem("usuario", JSON.stringify(usuario));

    renderizarCarrito();
  }

  function eliminarProducto(indice) {
    carrito.splice(indice, 1);
    usuario.carrito = carrito;

    localStorage.setItem("carrito", JSON.stringify(carrito));
    localStorage.setItem("usuario", JSON.stringify(usuario));

    renderizarCarrito();
  }

  function vaciarCarrito() {
    carrito = [];
    usuario.carrito = carrito;

    localStorage.setItem("carrito", JSON.stringify(carrito));
    localStorage.setItem("usuario", JSON.stringify(usuario));

    renderizarCarrito();
  }

  function mostrarMensajeCompra() {
    const inputEmail = document.querySelector("#inputEmail");
    const email = inputEmail.value;
    usuario.email = email;

    localStorage.setItem("usuario", JSON.stringify(usuario));

    formulario.reset();

    Swal.fire({
      title: "¡Gracias por tu compra!",
      text: `En minutos te enviaremos los detalles a tu correo electrónico: ${email}`,
      icon: "success",
      confirmButtonText: "Aceptar",
    }).then((result) => {
      if (result.isConfirmed) {
        renderizarCarrito();
      }
    });
  }

  fetch("./productos.json")
    .then((response) => response.json())
    .then((data) => {
      let productosHTML = "";
      data.forEach((producto) => {
        productosHTML += generarProducto(producto);
      });
      contenedorProductos.innerHTML = productosHTML;

      const botonesAgregar = document.querySelectorAll(".agregar-producto");
      botonesAgregar.forEach((boton) => {
        boton.addEventListener("click", () => {
          agregarProducto(boton);
        });
      });
    })
    .catch((error) => {
      console.log("Error al obtener los datos del archivo JSON:", error);
    });

  renderizarCarrito();
});
