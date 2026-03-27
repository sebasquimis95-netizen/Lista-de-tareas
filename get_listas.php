<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'config.php';

$tableroId = $_GET['tablero_id'] ?? null;

if (!$tableroId) {
    echo json_encode(['success' => false, 'message' => 'tablero_id no proporcionado']);
    exit;
}

try {
    // Obtener listas
    $stmt = $pdo->prepare("SELECT * FROM listas WHERE tablero_id = :tablero_id ORDER BY posicion");
    $stmt->execute([':tablero_id' => $tableroId]);
    $listas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Para cada lista, obtener tarjetas
    foreach ($listas as &$lista) {
        $stmtTarjetas = $pdo->prepare("SELECT * FROM tarjetas WHERE lista_id = :lista_id ORDER BY posicion");
        $stmtTarjetas->execute([':lista_id' => $lista['id']]);
        $lista['tarjetas'] = $stmtTarjetas->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode(['success' => true, 'listas' => $listas]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>