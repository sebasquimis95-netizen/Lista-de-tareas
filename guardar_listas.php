<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['tablero_id']) || !isset($input['listas'])) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

try {
    $pdo->beginTransaction();
    
    $tableroId = $input['tablero_id'];
    $listas = $input['listas'];
    
    // Eliminar listas y tarjetas existentes
    $stmt = $pdo->prepare("DELETE FROM listas WHERE tablero_id = :tablero_id");
    $stmt->execute([':tablero_id' => $tableroId]);
    
    // Insertar nuevas listas y tarjetas
    $stmtLista = $pdo->prepare("INSERT INTO listas (tablero_id, nombre, posicion) 
                               VALUES (:tablero_id, :nombre, :posicion)");
    $stmtTarjeta = $pdo->prepare("INSERT INTO tarjetas (lista_id, texto, posicion) 
                                 VALUES (:lista_id, :texto, :posicion)");
    
    foreach ($listas as $i => $lista) {
        $stmtLista->execute([
            ':tablero_id' => $tableroId,
            ':nombre' => $lista['nombre'],
            ':posicion' => $i
        ]);
        
        $listaId = $pdo->lastInsertId();
        
        foreach ($lista['tarjetas'] as $j => $tarjeta) {
            $stmtTarjeta->execute([
                ':lista_id' => $listaId,
                ':texto' => $tarjeta['texto'] ?? $tarjeta,
                ':posicion' => $j
            ]);
        }
    }
    
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Listas guardadas']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>