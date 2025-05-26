<?php
// require_once('../helper/header.php');
require_once('../helper/cadastral_database.php');
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => 0, "error" => "Method Not Allowed"]);
    exit;
}

$case = isset($_POST["case"]) ? $_POST["case"] : '';
if (empty($case)) {
    http_response_code(400);
    echo json_encode(["success" => 0, "error" => "Case parameter is required"]);
    exit;
}

function getLGDCode($db, $column, $value, $returnColumn){
    if(empty($value)) return 0;
    $query = "SELECT {$returnColumn} FROM nic_master_v2 WHERE {$column} = :value LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':value', $value, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return isset($result[$returnColumn]) ? $result[$returnColumn] : 0;
}

$district_code = $_POST["district_code"] ?? 0;
$taluk_code = $_POST["taluk_code"] ?? 0;
$village_code = $_POST["village_code"] ?? 0;


$districtVal = getLGDCode($cadastral_db, 'dcode', $district_code, 'lgddcode');
$talukVal = getLGDCode($cadastral_db, 'tcode', $taluk_code, 'lgdtcode');
$villageVal = getLGDCode($cadastral_db, 'vcode', $village_code, 'lgdvcode');

function fetchLandStatisticsData($case, $districtVal, $talukVal, $villageVal) {
    $apiEndpoints = [
        'tamilnilam_landtypewithownercount' => 'tamilnilam_landtypewithownercount',
        'tamilnilam_pattalandtypecount' => 'tamilnilam_pattalandtypecount',
        'grains_landtypecount' => 'grains_landtypecount',
        'grains_landcount' => 'grains_landcount',
        'tamilnilam_landownercount' => 'tamilnilam_landownercount',
        'tamilnilam_pattalandcount' => 'tamilnilam_pattalandcount'
    ];

    if (!isset($apiEndpoints[$case])) {
        return json_encode([
            'success' => 0,
            'error' => 'Invalid case parameter'
        ]);
    }
   // $baseUrl = 'https://grains.tnega.org/dashboard/tamilnilam/';
   $baseUrl = 'https://grains.tn.gov.in/dashboard/tamilnilam/';
    $endpoint = $apiEndpoints[$case];
    $url = $baseUrl . $endpoint;
    
    $params = [
        'districtcode'=> $districtVal,
        'talukcode' => $talukVal,
        'villagecode' => $villageVal,
    ];
    if ($params) {
        $url .= '?' . http_build_query($params);
    }
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => [
            "Accept: application/json",
            "Cache-Control: no-cache"
        ]
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if ($error) {
        return json_encode([
            'success' => 0,
            'error' => "cURL Error: $error"
        ]);
    }
    if ($httpCode !== 200) {
        return json_encode([
            'success' => 0,
            'error' => "API returned status code: $httpCode"
        ]);
    }
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return json_encode([
            'success' => 0,
            'error' => 'Invalid JSON response from API'
        ]);
    }


    return json_encode([
        'success' => 1,
        'data' => isset($data['data']) ? $data['data'] : $data
    ]);
}

$response = fetchLandStatisticsData($case, $districtVal, $talukVal, $villageVal);
echo $response;