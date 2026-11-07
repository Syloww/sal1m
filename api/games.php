<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');

function extractPlaceId($url) {
    preg_match('/games\/(\d+)/', $url, $matches);
    return $matches[1] ?? null;
}

function resolveUniverseIdFromPlace($placeId) {
    if (!$placeId) return null;
    
    $url = "https://apis.roblox.com/universes/v1/places/$placeId/universe";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$response) {
        error_log("❌ Erreur HTTP $httpCode pour placeId $placeId");
        return null;
    }
    
    $data = json_decode($response, true);
    return $data['universeId'] ?? null;
}

function fetchRobloxGameDetails($universeIds) {
    if (empty($universeIds)) return [];
    
    $results = [];
    
    // Détails des jeux
    $url = "https://games.roblox.com/v1/games?universeIds=" . implode(',', $universeIds);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$response) {
        error_log("❌ Erreur HTTP $httpCode pour les détails");
        return [];
    }
    
    $json = json_decode($response, true);
    
    // Thumbnails
    $thumbMap = [];
    $thumbsUrl = "https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=" . 
                 implode(',', $universeIds) . 
                 "&countPerUniverse=1&defaults=true&size=768x432&format=Webp&isCircular=false";
    
    $ch = curl_init($thumbsUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $thumbsResponse = curl_exec($ch);
    $thumbsHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($thumbsHttpCode === 200 && $thumbsResponse) {
        $thumbsJson = json_decode($thumbsResponse, true);
        foreach ($thumbsJson['data'] ?? [] as $entry) {
            if (isset($entry['thumbnails'][0]['imageUrl'])) {
                $thumbMap[$entry['universeId']] = $entry['thumbnails'][0]['imageUrl'];
            }
        }
    }
    
    // Combiner les données
    foreach ($json['data'] ?? [] as $item) {
        $universeId = (string)$item['id'];
        $imageUrl = $thumbMap[$universeId] ?? 'https://via.placeholder.com/768x432';
        
        // Fallback sur l'icône si pas de thumbnail
        if (strpos($imageUrl, 'placeholder') !== false) {
            $fallbackUrl = "https://thumbnails.roblox.com/v1/games/icons?universeIds={$item['id']}&size=512x512&format=Png";
            $ch = curl_init($fallbackUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $fallbackResponse = curl_exec($ch);
            curl_close($ch);
            
            if ($fallbackResponse) {
                $fallbackJson = json_decode($fallbackResponse, true);
                $imageUrl = $fallbackJson['data'][0]['imageUrl'] ?? $imageUrl;
            }
        }
        
        $results[$universeId] = [
            'name' => $item['name'] ?? 'Jeu Roblox',
            'players' => $item['playing'] ?? 0,
            'visits' => $item['visits'] ?? 0,
            'image' => $imageUrl
        ];
    }
    
    return $results;
}

try {
    // Lire games.json
    $gamesJsonPath = __DIR__ . '/../games.json';
    if (!file_exists($gamesJsonPath)) {
        throw new Exception('games.json introuvable');
    }
    
    $baseGames = json_decode(file_get_contents($gamesJsonPath), true);
    
    // Extraire les placeIds
    $gamesWithPlace = [];
    foreach ($baseGames as $game) {
        $placeId = extractPlaceId($game['url']);
        if ($placeId) {
            $gamesWithPlace[] = array_merge($game, ['placeId' => $placeId]);
        }
    }
    
    // Convertir en universeIds
    $placeToUniverse = [];
    foreach ($gamesWithPlace as $game) {
        $universeId = resolveUniverseIdFromPlace($game['placeId']);
        if ($universeId) {
            $placeToUniverse[$game['placeId']] = $universeId;
        }
    }
    
    // Filtrer les jeux avec universeId valide
    $gamesWithIds = [];
    foreach ($gamesWithPlace as $game) {
        if (isset($placeToUniverse[$game['placeId']])) {
            $gamesWithIds[] = array_merge($game, [
                'universeId' => $placeToUniverse[$game['placeId']]
            ]);
        }
    }
    
    // Récupérer les détails
    $universeIds = array_column($gamesWithIds, 'universeId');
    $detailsMap = fetchRobloxGameDetails($universeIds);
    
    // Enrichir les données
    $enriched = [];
    foreach ($gamesWithIds as $game) {
        $universeId = (string)$game['universeId'];
        $details = $detailsMap[$universeId] ?? [
            'name' => 'Jeu Roblox',
            'players' => 0,
            'visits' => 0,
            'image' => 'https://via.placeholder.com/512'
        ];
        
        $enriched[] = [
            'id' => $game['id'],
            'name' => $details['name'],
            'studio' => 'G.Sylow',
            'image' => $details['image'],
            'url' => $game['url'],
            'universeId' => (int)$game['universeId'],
            'players' => $details['players'],
            'visits' => $details['visits'],
            'closed' => isset($game['closed']) ? (bool)$game['closed'] : false
        ];
    }
    
    echo json_encode($enriched, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'internal_error', 'message' => $e->getMessage()]);
}
?>