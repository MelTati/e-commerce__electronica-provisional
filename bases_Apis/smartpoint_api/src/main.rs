/*
==========================================================
    API REST de SmartPoint con Axum y SQLx
    Se conecta a la base de datos MySQL 'db_smart_point'
    e implementa todos los endpoints de la API.
==========================================================
*/

// --- 1. IMPORTACIONES ---
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{delete, get, post, put}, // Importamos todos los métodos HTTP
    Json,
    Router,
};
use rust_decimal::Decimal; // Para manejar precios con precisión
use serde::{Deserialize, Serialize};
use sqlx::mysql::MySqlPoolOptions;
use sqlx::{FromRow, MySqlPool};
use std::net::SocketAddr;

// --- 2. ESTADO DE LA APP (POOL) ---
#[derive(Clone)]
struct AppState {
    db: MySqlPool,
}

// --- 3. STRUCTS PARA DATOS (Payloads y Respuestas) ---
// (#[allow(non_snake_case)] silencia las advertencias de Rust por nombres como 'fldNombre')

// === Structs de PRODUCTOS ===
#[allow(non_snake_case)]
#[derive(Serialize, FromRow)]
struct Producto {
    codigo_producto: i32,
    fldNombre: String,
    fldPrecio: Decimal,
    fldMarca: Option<String>,
    descripcion: Option<String>,
    unidades: Option<i32>,
}

#[allow(non_snake_case)]
#[derive(Deserialize)] // Para recibir JSON en un POST/PUT
struct ProductoPayload {
    fldNombre: String,
    fldPrecio: Decimal,
    fldMarca: Option<String>,
    id_detalle_producto: i32,
}

// === Structs de CATEGORÍAS ===
#[allow(non_snake_case)]
#[derive(Serialize, FromRow)]
struct Categoria {
    id_categorias: i32,
    fldNombre: String,
    fldDescripcion: String,
}

#[allow(non_snake_case)]
#[derive(Serialize, FromRow)]
struct ProductoCategoria {
    Categoria: String,
    codigo_producto: i32,
    Producto: String,
    fldPrecio: Decimal,
    fldMarca: Option<String>,
}

// === Structs de CLIENTE y CONSULTA ===
#[allow(non_snake_case)]
#[derive(Deserialize)]
struct NuevoCliente {
    telefono: String,
    fldNombres: String,
    fldApellidos: String,
    fldCorreoElectronico: Option<String>,
}

// --- NUEVO ---
// Struct para devolver los tipos de consulta
#[allow(non_snake_case)]
#[derive(Serialize, FromRow)]
struct TipoConsulta {
    id_tipo: i32,
    fldOpciones: String,
}
// --- FIN NUEVO ---

#[allow(non_snake_case)]
#[derive(Deserialize)]
struct NuevaConsulta {
    telefono: String,
    id_tipo: i32,
    fldAsunto: String,
    fldMensaje: String,
}

// === Structs de VENTAS (CARRITO) ===
#[allow(non_snake_case)]
#[derive(Deserialize)]
struct NuevaVenta {
    telefono: String,
    id_usuario: i32,
}

#[allow(non_snake_case)]
#[derive(Serialize, FromRow)]
struct VentaCreada {
    idventas: u64, // LAST_INSERT_ID() devuelve u64
}

#[allow(non_snake_case)]
#[derive(Serialize, FromRow)]
struct DetalleVenta {
    idventas: i32,
    codigo_producto: i32,
    Producto: String,
    Marca: Option<String>,
    DetalleDescripcion: Option<String>,
    DetalleUnidades: Option<i32>,
    PrecioUnitario: Decimal,
    cantidad: i32,
    subtotal: Decimal,
}

#[derive(Deserialize)]
struct AgregarProductoCarrito {
    codigo_producto: i32,
    cantidad: i32,
}

#[derive(Deserialize)]
struct ActualizarProductoCarrito {
    nueva_cantidad: i32,
}

#[derive(Deserialize)]
struct FinalizarCompra {
    id_tipo_pago: i32,
}

#[derive(Serialize, FromRow)]
struct TotalPagado {
    total_pagado: Decimal,
}

// === Structs de USUARIO (Autenticación) ===
#[allow(non_snake_case)]
#[derive(Deserialize)]
struct NuevoUsuario {
    fldTelefono: String,
    fldNombre: String,
    fldContrasena: String,
    fldCorreoElectronico: String,
}

#[allow(non_snake_case)]
#[derive(Deserialize)]
struct LoginRequest {
    fldCorreoElectronico: String,
    fldContrasena: String,
}

#[allow(non_snake_case)]
#[derive(Serialize, FromRow)]
struct UsuarioInfo {
    id_usuario: i32,
    fldNombre: String,
}

#[derive(Serialize)]
struct LoginResponse {
    id_usuario: i32,
    fldNombre: String,
    token: String, // En un futuro, aquí iría un JWT
}

// --- 4. FUNCIÓN MAIN (Configuración del Router) ---
#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL debe estar configurada en .env");

    let pool = MySqlPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("No se pudo conectar a la base de datos MySQL");

    println!("Base de datos conectada exitosamente.");

    let app_state = AppState { db: pool };

    let app = Router::new()
        // --- Rutas de Productos ---
        .route("/api/productos", get(get_all_products).post(create_product))
        .route(
            "/api/productos/:id",
            get(get_product_by_id)
                .put(update_product)
                .delete(delete_product),
        )
        // --- Rutas de Categorías ---
        .route("/api/categorias", get(get_all_categories))
        .route(
            "/api/categorias/:id/productos",
            get(get_products_by_category),
        )
        // --- Rutas de Clientes y Consultas ---
        .route("/api/clientes", post(create_cliente))
        // --- NUEVO ---
        .route("/api/tipos-consulta", get(get_tipos_consulta)) // Ruta para OBTENER las opciones
        // --- FIN NUEVO ---
        .route("/api/consultas", post(create_consulta)) // Ruta para ENVIAR el formulario

        // --- Rutas de Carrito (Ventas) ---
        .route("/api/ventas", post(create_venta))
        .route("/api/ventas/:id", get(get_cart_details))
        .route("/api/ventas/:id/productos", post(add_product_to_cart))
        .route(
            "/api/ventas/:id/productos/:producto_id",
            put(update_product_in_cart).delete(delete_product_from_cart),
        )
        .route("/api/ventas/:id/finalizar", post(finalize_purchase))
        .route("/api/ventas/:id/cancelar", put(cancel_sale))

        // --- Rutas de Autenticación ---
        .route("/api/auth/registrar", post(register_user))
        .route("/api/auth/login", post(login_user))

        .with_state(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Servidor API de SmartPoint escuchando en http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// --- 5. Handlers (La lógica de cada ruta) ---

// ... (Todos los Handlers de Productos: get_all_products, get_product_by_id, etc. van aquí) ...
// (Los he omitido por brevedad, pero deben estar en tu archivo)

// --- Handlers de Categorías ---
async fn get_all_categories(
    State(state): State<AppState>,
) -> Result<Json<Vec<Categoria>>, AppError> {
    let categorias = sqlx::query_as!(
        Categoria,
        "SELECT id_categorias, fldNombre, fldDescripcion FROM categorias WHERE visible = 1"
    )
    .fetch_all(&state.db)
    .await?;
    Ok(Json(categorias))
}

// GET /api/categorias/:id/productos
async fn get_products_by_category(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Vec<ProductoCategoria>>, AppError> {

    let productos = sqlx::query_as!(
            ProductoCategoria,
            r#"
            SELECT
                c.fldNombre AS Categoria,
                p.codigo_producto,
                p.fldNombre AS Producto,
                p.fldPrecio,
                p.fldMarca
            FROM categorias c
            INNER JOIN categorias_x_productos cp ON c.id_categorias = cp.id_categorias
            INNER JOIN productos p ON cp.codigo_producto = p.codigo_producto
            WHERE c.id_categorias = ? AND c.visible = 1
            ORDER BY p.fldNombre
            "#,
            id
        )
        .fetch_all(&state.db)
        .await?;

    Ok(Json(productos))
}

// --- Handlers de Clientes y Consultas ---
async fn create_cliente(
    State(state): State<AppState>,
    Json(payload): Json<NuevoCliente>,
) -> Result<StatusCode, AppError> {
    sqlx::query!(
        "CALL sp_registrar_cliente(?, ?, ?, ?)",
        payload.telefono,
        payload.fldNombres,
        payload.fldApellidos,
        payload.fldCorreoElectronico
    )
    .execute(&state.db)
    .await?;
    Ok(StatusCode::CREATED)
}

// --- NUEVO HANDLER ---
// GET /api/tipos-consulta
async fn get_tipos_consulta(
    State(state): State<AppState>,
) -> Result<Json<Vec<TipoConsulta>>, AppError> {
    let tipos = sqlx::query_as!(
        TipoConsulta,
        "SELECT id_tipo, fldOpciones FROM tipo_consulta ORDER BY fldOpciones"
    )
    .fetch_all(&state.db)
    .await?;
    Ok(Json(tipos))
}
// --- FIN NUEVO HANDLER ---

async fn create_consulta(
    State(state): State<AppState>,
    Json(payload): Json<NuevaConsulta>,
) -> Result<StatusCode, AppError> {
    sqlx::query!(
        "CALL sp_registrar_consulta(?, ?, ?, ?)",
        payload.telefono,
        payload.id_tipo,
        payload.fldAsunto,
        payload.fldMensaje
    )
    .execute(&state.db)
    .await?;
    Ok(StatusCode::CREATED)
}

// ... (Todos los Handlers de Ventas y Autenticación van aquí) ...
// (Los he omitido por brevedad, pero deben estar en tu archivo)


// --- 6. Manejador de Errores Genérico ---
struct AppError(StatusCode, String);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (self.0, self.1).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        eprintln!("Error de base de datos: {:?}", err);
        match err {
            sqlx::Error::RowNotFound => {
                AppError(StatusCode::NOT_FOUND, "Elemento no encontrado".to_string())
            }
            sqlx::Error::Database(db_err) if db_err.code().as_deref() == Some("1062") => {
                AppError(StatusCode::CONFLICT, "El registro ya existe".to_string())
            }
            _ => AppError(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error interno del servidor".to_string(),
            ),
        }
    }
}


// --- INICIO DE HANDLERS FALTANTES (copiados de tu código anterior) ---
// (Asegúrate de que estas funciones estén en tu archivo, las copio aquí por si acaso)

// GET /api/products
async fn get_all_products(
    State(state): State<AppState>,
) -> Result<Json<Vec<Producto>>, AppError> {
    let productos = sqlx::query_as!(
        Producto,
        r#"
        SELECT
            p.codigo_producto, p.fldNombre, p.fldPrecio,
            p.fldMarca, dp.descripcion, dp.unidades
        FROM productos p
        INNER JOIN detalle_productos dp ON p.id_detalle_producto = dp.id_detalle_producto
        "#
    )
    .fetch_all(&state.db)
    .await?;
    Ok(Json(productos))
}

// GET /api/products/:id
async fn get_product_by_id(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Producto>, AppError> {
    let producto = sqlx::query_as!(
        Producto,
        r#"
        SELECT
            p.codigo_producto, p.fldNombre, p.fldPrecio,
            p.fldMarca, dp.descripcion, dp.unidades
        FROM productos p
        INNER JOIN detalle_productos dp ON p.id_detalle_producto = dp.id_detalle_producto
        WHERE p.codigo_producto = ?
        "#,
        id
    )
    .fetch_one(&state.db)
    .await?;
    Ok(Json(producto))
}

// POST /api/products
async fn create_product(
    State(state): State<AppState>,
    Json(payload): Json<ProductoPayload>,
) -> Result<StatusCode, AppError> {
    sqlx::query!(
        "INSERT INTO productos (fldNombre, fldPrecio, fldMarca, id_detalle_producto) VALUES (?, ?, ?, ?)",
        payload.fldNombre,
        payload.fldPrecio,
        payload.fldMarca,
        payload.id_detalle_producto
    )
    .execute(&state.db)
    .await?;
    Ok(StatusCode::CREATED)
}

// PUT /api/products/:id
async fn update_product(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<ProductoPayload>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query!(
        "UPDATE productos SET fldNombre = ?, fldPrecio = ?, fldMarca = ?, id_detalle_producto = ? WHERE codigo_producto = ?",
        payload.fldNombre,
        payload.fldPrecio,
        payload.fldMarca,
        payload.id_detalle_producto,
        id
    )
    .execute(&state.db)
    .await?;
    if result.rows_affected() == 0 { Err(AppError::from(sqlx::Error::RowNotFound)) } else { Ok(StatusCode::OK) }
}

// DELETE /api/products/:id
async fn delete_product(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query!("DELETE FROM productos WHERE codigo_producto = ?", id)
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 { Err(AppError::from(sqlx::Error::RowNotFound)) } else { Ok(StatusCode::NO_CONTENT) }
}

// --- Handlers de Carrito (Ventas) ---
async fn create_venta(
    State(state): State<AppState>,
    Json(payload): Json<NuevaVenta>,
) -> Result<Json<VentaCreada>, AppError> {
    let mut tx = state.db.begin().await?;
    sqlx::query!(
        "INSERT INTO ventas (fldFecha, telefono, id_usuario, estado) VALUES (NOW(), ?, ?, 'pendiente')",
        payload.telefono,
        payload.id_usuario
    )
    .execute(&mut *tx)
    .await?;
    let venta_creada = sqlx::query_as!(VentaCreada, "SELECT LAST_INSERT_ID() as idventas")
        .fetch_one(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok(Json(venta_creada))
}

async fn get_cart_details(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Vec<DetalleVenta>>, AppError> {
    let detalles = sqlx::query_as::<_, DetalleVenta>("CALL sp_listar_carrito_completo(?)")
        .bind(id)
        .fetch_all(&state.db)
        .await?;
    Ok(Json(detalles))
}

async fn add_product_to_cart(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<AgregarProductoCarrito>,
) -> Result<StatusCode, AppError> {
    sqlx::query!(
        "CALL sp_agregar_producto_carrito(?, ?, ?)",
        id,
        payload.codigo_producto,
        payload.cantidad
    )
    .execute(&state.db)
    .await?;
    Ok(StatusCode::CREATED)
}

async fn update_product_in_cart(
    State(state): State<AppState>,
    Path((id, producto_id)): Path<(i32, i32)>,
    Json(payload): Json<ActualizarProductoCarrito>,
) -> Result<StatusCode, AppError> {
    sqlx::query!(
        "CALL sp_actualizar_producto_carrito(?, ?, ?)",
        id,
        producto_id,
        payload.nueva_cantidad
    )
    .execute(&state.db)
    .await?;
    Ok(StatusCode::OK)
}

async fn delete_product_from_cart(
    State(state): State<AppState>,
    Path((id, producto_id)): Path<(i32, i32)>,
) -> Result<StatusCode, AppError> {
    sqlx::query!(
        "CALL sp_eliminar_producto_carrito(?, ?)",
        id,
        producto_id
    )
    .execute(&state.db)
    .await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn finalize_purchase(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<FinalizarCompra>,
) -> Result<Json<TotalPagado>, AppError> {
    let total = sqlx::query_as::<_, TotalPagado>("CALL sp_finalizar_compra(?, ?)")
        .bind(id)
        .bind(payload.id_tipo_pago)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(total))
}

async fn cancel_sale(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    sqlx::query!("CALL sp_cancelar_venta(?)", id)
        .execute(&state.db)
        .await?;
    Ok(StatusCode::OK)
}

// --- Handlers de Autenticación ---
async fn register_user(
    State(state): State<AppState>,
    Json(payload): Json<NuevoUsuario>,
) -> Result<StatusCode, AppError> {
    sqlx::query!(
        "INSERT INTO usuario (fldTelefono, fldNombre, fldContrasena, fldCorreoElectronico) VALUES (?, ?, ?, ?)",
        payload.fldTelefono,
        payload.fldNombre,
        payload.fldContrasena,
        payload.fldCorreoElectronico
    )
    .execute(&state.db)
    .await?;
    Ok(StatusCode::CREATED)
}

async fn login_user(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    let user = sqlx::query_as!(
        UsuarioInfo,
        "SELECT id_usuario, fldNombre FROM usuario WHERE fldCorreoElectronico = ? AND fldContrasena = ?",
        payload.fldCorreoElectronico,
        payload.fldContrasena
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| AppError(StatusCode::UNAUTHORIZED, "Correo o contraseña incorrectos".to_string()))?;

    let response = LoginResponse {
        id_usuario: user.id_usuario,
        fldNombre: user.fldNombre,
        token: "token_falso_de_ejemplo_aqui_iria_un_jwt".to_string(),
    };

    Ok(Json(response))
}

// --- FIN DE HANDLERS FALTANTES ---