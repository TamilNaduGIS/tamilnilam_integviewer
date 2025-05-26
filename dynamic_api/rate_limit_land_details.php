<?php
ini_set('display_errors', '1');
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: POST");

require_once('../helper/vendor/autoload.php');

define('DEFAULT_BLOCK_DURATION', 900); // 15 minutes

$redis = new Predis\Client([
    'scheme' => 'tcp',
    'host'   => '192.168.4.247', //staging
    // 'host'   => '127.0.0.1', // Live
    'port'   => 6379,
]);

$lat = $_POST['latitude'] ?? null;
$long = $_POST['longitude'] ?? null;
$userPermission = $_POST['up'] ?? null; //up----- userPermission

if (empty($lat) || empty($long)) {
    echo json_encode(['success' => 0, 'error' => 'Missing latitude or longitude']);
    exit;
}

$ip = getClientIP();

// Apply rate limits only if NOT permission 3
if ($userPermission !== '3') {
    // Default to guest
    $maxRequests = 5;
    $ttl = 3600 - (time() % 3600);
    $keySuffix = 'guest';

    if ($userPermission === '1') {
        $maxRequests = 10;
        $ttl = DEFAULT_BLOCK_DURATION;
        $keySuffix = 'public';
    }

    $key = 'rate_limit:' . md5($ip . ':' . $keySuffix);
    $current = $redis->get($key);

    if ($current === null) {
        $redis->setex($key, $ttl, 1);
    } else {
        $current = $redis->incr($key);
        if ($current == $maxRequests) {
            $redis->expire($key, $ttl);
        }

        if ($current > $maxRequests) {
            $ttl = $redis->ttl($key);
            $hours = floor($ttl / 3600);
            $minutes = floor(($ttl % 3600) / 60);
            $timeStr = ($hours > 0 ? "{$hours}hrs " : "") . "{$minutes}min";

            echo json_encode([
                'error' => 0,
                'message' => "Too many requests. Try again in {$timeStr}.",
                'retry_after' => $ttl,
                'retry_at' => date('Y-m-d H:i:s', time() + $ttl),
                'limit' => $maxRequests
            ]);
            exit;
        }
    }
}

// Call land_details.php API
$apiUrl = "https://tngis.tnega.org/generic_api/v2/land_details";
$response = callCurlPost($apiUrl, [
    'latitude' => $lat,
    'longitude' => $long,
    'userPermission' => $userPermission
], [
    'x-app-name: demo'
]);

if (!$response['success']) {
    echo json_encode(['success' => 0, 'message' => 'Failed to fetch land details']);
    exit;
}

echo $response['body'];

/**
 * Helper function to perform cURL POST with headers
 */
function callCurlPost(string $url, array $postData, array $headers = []): array
{
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($postData),
        CURLOPT_HTTPHEADER => array_merge([
            'Content-Type: application/x-www-form-urlencoded'
        ], $headers),
    ]);

    $body = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    return [
        'success' => $httpCode === 200 && !empty($body),
        'status' => $httpCode,
        'body' => $body,
        'error' => $error
    ];
}

/**
 * Returns the real client IP address
 */
function getClientIP(): string
{
    foreach (['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            return explode(',', $_SERVER[$key])[0];
        }
    }
    return 'unknown';
}
