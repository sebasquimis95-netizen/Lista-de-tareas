<?php
require_once 'config.php';

try {
    // Tabla tableros
    $pdo->exec("CREATE TABLE IF NOT EXISTS tableros (
        id VARCHAR(255) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        fondo VARCHAR(50),
        visibilidad VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Tabla listas
    $pdo->exec("CREATE TABLE IF NOT EXISTS listas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tablero_id VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        posicion INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tablero_id) REFERENCES tableros(id) ON DELETE CASCADE
    )");
    
    // Tabla tarjetas
    $pdo->exec("CREATE TABLE IF NOT EXISTS tarjetas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lista_id INT NOT NULL,
        texto TEXT NOT NULL,
        posicion INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE CASCADE
    )");
    
    echo "✅ Tablas creadas correctamente";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>