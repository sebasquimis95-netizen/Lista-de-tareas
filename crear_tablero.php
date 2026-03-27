<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id']) || !isset($input['nombre'])) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos: falta id o nombre']);
    exit;
}

try {
    $pdo->beginTransaction();
    
    // Insertar tablero
    $stmt = $pdo->prepare("INSERT INTO tableros (id, nombre, fondo, visibilidad) 
                          VALUES (:id, :nombre, :fondo, :visibilidad)");
    $result = $stmt->execute([
        ':id' => $input['id'],
        ':nombre' => $input['nombre'],
        ':fondo' => $input['fondo'] ?? '#0079bf',
        ':visibilidad' => $input['visibilidad'] ?? 'workspace'
    ]);
    
    if (!$result) {
        throw new Exception('Error al insertar tablero');
    }
    
    // Insertar listas por defecto
    $listasDefault = [
        ['nombre' => 'Lista de tareas', 'posicion' => 0],
        ['nombre' => 'En proceso', 'posicion' => 1],
        ['nombre' => 'Hecho', 'posicion' => 2]
    ];
    
    $stmtLista = $pdo->prepare("INSERT INTO listas (tablero_id, nombre, posicion) 
                               VALUES (:tablero_id, :nombre, :posicion)");
    
    foreach ($listasDefault as $lista) {
        $resultLista = $stmtLista->execute([
            ':tablero_id' => $input['id'],
            ':nombre' => $lista['nombre'],
            ':posicion' => $lista['posicion']
        ]);
        
        if (!$resultLista) {
            throw new Exception('Error al insertar lista: ' . $lista['nombre']);
        }
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Tablero creado correctamente',
        'id' => $input['id']
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>