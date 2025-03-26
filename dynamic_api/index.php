<?php
// index.php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

class ValidationException extends Exception {}

class Database
{
    private $configs = [];
    private $connections = [];

    public function __construct()
    {
        $this->loadConfigurations();
    }

    private function loadConfigurations()
    {
        $configDb = pg_connect("host=localhost dbname=ssp user=postgres password=postgres");
        $result = pg_query($configDb, "SELECT * FROM masters.db_configurations WHERE is_active = true");

        while ($row = pg_fetch_assoc($result)) {
            $this->configs[$row['config_name']] = $row;
        }

        pg_close($configDb);
    }

    public function getConnection($configName)
    {
        if (!isset($this->connections[$configName])) {
            if (!isset($this->configs[$configName])) {
                throw new Exception("Invalid database configuration: $configName");
            }

            $config = $this->configs[$configName];
            $this->connections[$configName] = pg_connect(
                "host={$config['host']} " .
                    "port={$config['port']} " .
                    "dbname={$config['dbname']} " .
                    "user={$config['username']} " .
                    "password={$config['password']}"
            );
        }

        return $this->connections[$configName];
    }
}

class Validator
{
    public function validateInput($data, $schema)
    {
        $schemaObj = json_decode($schema, true);

        if (!is_array($data)) {
            throw new ValidationException("Invalid input format");
        }

        // Check required fields
        foreach ($schemaObj['required'] ?? [] as $field) {
            if (!isset($data[$field])) {
                throw new ValidationException("Missing required field: $field");
            }
        }

        // Validate each field
        foreach ($data as $field => $value) {
            if (!isset($schemaObj['properties'][$field])) {
                throw new ValidationException("Unknown field: $field");
            }

            $this->validateField($value, $schemaObj['properties'][$field], $field);
        }
    }

    public function validateOutput($data, $schema)
    {
        $schemaObj = json_decode($schema, true);

        foreach ($data as $row) {
            foreach ($schemaObj['properties'] as $field => $rules) {
                if (!isset($row[$field])) {
                    throw new ValidationException("Missing output field: $field");
                }

                $this->validateField($row[$field], $rules, $field);
            }
        }
    }

    private function validateField($value, $rules, $fieldName)
    {
        switch ($rules['type']) {
            case 'string':
                if (!is_string($value)) {
                    throw new ValidationException("$fieldName must be a string");
                }
                if (isset($rules['minLength']) && strlen($value) < $rules['minLength']) {
                    throw new ValidationException("$fieldName is too short");
                }
                if (isset($rules['maxLength']) && strlen($value) > $rules['maxLength']) {
                    throw new ValidationException("$fieldName is too long");
                }
                if (isset($rules['format']) && $rules['format'] === 'email') {
                    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        throw new ValidationException("Invalid email format for $fieldName");
                    }
                }
                break;

            case 'integer':
                if (!is_numeric($value) || floor($value) != $value) {
                    throw new ValidationException("$fieldName must be an integer");
                }
                if (isset($rules['minimum']) && $value < $rules['minimum']) {
                    throw new ValidationException("$fieldName is below minimum value");
                }
                if (isset($rules['maximum']) && $value > $rules['maximum']) {
                    throw new ValidationException("$fieldName is above maximum value");
                }
                break;

            case 'biginteger':
                if (!is_numeric($value) || !preg_match('/^-?\d+$/', $value)) {
                    throw new ValidationException("$fieldName must be a biginteger");
                }
                // Using PHP's native string comparison for large numbers
                if (isset($rules['minimum']) && bccomp($value, $rules['minimum']) < 0) {
                    throw new ValidationException("$fieldName is below minimum value");
                }
                if (isset($rules['maximum']) && bccomp($value, $rules['maximum']) > 0) {
                    throw new ValidationException("$fieldName is above maximum value");
                }
                break;

            case 'boolean':
                if (
                    !is_bool($value) && $value !== 0 && $value !== 1 &&
                    $value !== '0' && $value !== '1' &&
                    strtolower($value) !== 'true' && strtolower($value) !== 'false'
                ) {
                    throw new ValidationException("$fieldName must be a boolean");
                }
                break;

            case 'datetime':
                if (!$this->validateDateTime($value, isset($rules['format']) ? $rules['format'] : 'Y-m-d H:i:s')) {
                    throw new ValidationException("$fieldName must be a valid datetime in format: " .
                        (isset($rules['format']) ? $rules['format'] : 'Y-m-d H:i:s'));
                }
                if (isset($rules['minimum']) && strtotime($value) < strtotime($rules['minimum'])) {
                    throw new ValidationException("$fieldName is before minimum allowed date");
                }
                if (isset($rules['maximum']) && strtotime($value) > strtotime($rules['maximum'])) {
                    throw new ValidationException("$fieldName is after maximum allowed date");
                }
                break;

            case 'date':
                if (!$this->validateDate($value, isset($rules['format']) ? $rules['format'] : 'Y-m-d')) {
                    throw new ValidationException("$fieldName must be a valid date in format: " .
                        (isset($rules['format']) ? $rules['format'] : 'Y-m-d'));
                }
                if (isset($rules['minimum']) && strtotime($value) < strtotime($rules['minimum'])) {
                    throw new ValidationException("$fieldName is before minimum allowed date");
                }
                if (isset($rules['maximum']) && strtotime($value) > strtotime($rules['maximum'])) {
                    throw new ValidationException("$fieldName is after maximum allowed date");
                }
                break;

                // Add more types as needed
        }
    }
    private function validateDateTime($date, $format = 'Y-m-d H:i:s')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    private function validateDate($date, $format = 'Y-m-d')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }
}

class Api
{
    private $db;
    private $validator;
    private $currentConfig;

    public function __construct()
    {
        $this->db = new Database();
        $this->validator = new Validator();
        $this->currentConfig = null;
    }

    public function handleRequest()
    {
        try {
            $method = $_SERVER['REQUEST_METHOD'];
            $endpoint = $this->getEndpoint();

            // Store the endpoint configuration
            $this->currentConfig = $this->getEndpointConfig($endpoint);

            // Get endpoint configuration
            $config = $this->getEndpointConfig($endpoint);

            // Get input data
            $input = $this->getInputData();

            // Validate input
            // $this->validator->validateInput($input, $config['input_schema']);
            $this->validator->validateInput($input, $config['input_params']);

            // Determine if write operation
            $isWrite = in_array($method, ['POST', 'PUT', 'DELETE']);
            $dbConfig = $isWrite ? $config['writer_db_config'] : $config['reader_db_config'];

            // Execute database function
            $conn = $this->db->getConnection($dbConfig);
            $result = $this->executeFunction($conn, $config['pg_function_name'], $input);

            // Validate output
            $this->validator->validateOutput($result, $config['output_format']);

            $this->sendResponse(200, $result);
        } catch (ValidationException $e) {
            $this->sendResponse(400, ['error' => $e->getMessage()]);
        } catch (Exception $e) {
            $this->sendResponse(500, ['error' => $e->getMessage()]);
        }
    }

    private function getEndpoint()
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        return trim(str_replace('/dynamic_api/', '', $uri), '/');
    }

    private function getInputData()
    {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            return $_GET;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new ValidationException('Invalid JSON input');
        }

        return $input;
    }

    private function getEndpointConfig($endpoint)
    {
        $conn = $this->db->getConnection('primary_reader');
        $result = pg_query_params(
            $conn,
            "SELECT * FROM masters.api_endpoints_config WHERE endpoint_path = $1 AND is_active = true",
            [$endpoint]
        );

        if (!$result || pg_num_rows($result) === 0) {
            throw new Exception('Endpoint not found', 404);
        }

        return pg_fetch_assoc($result);
    }

    // private function executeFunction($conn, $function, $params) {
    //     $placeholders = implode(',', array_map(function($i) { 
    //         return '$' . ($i + 1); 
    //     }, range(0, count($params) - 1)));

    //     $query = "SELECT * FROM $function($placeholders)";
    //     $result = pg_query_params($conn, $query, array_values($params));

    //     if (!$result) {
    //         throw new Exception('Database error: ' . pg_last_error($conn));
    //     }

    //     return pg_fetch_all($result);
    // }

    private function executeFunction($conn, $function, $params)
    {

        if (!$this->currentConfig) {
            throw new Exception('Endpoint configuration not initialized');
        }

        // Parse output schema to get column names
        $outputSchema = json_decode($this->currentConfig['output_format'], true);
        if (!$outputSchema || !isset($outputSchema['properties'])) {
            throw new Exception('Invalid output parameter schema');
        }

        // Get column names from output schema
        $columns = array_keys($outputSchema['properties']);
        $columnList = implode(', ', $columns);


        // Get the input parameter types from the endpoint config
        $inputSchema = json_decode($this->currentConfig['input_params'], true);
        $properties = $inputSchema['properties'];

        // Build placeholders with type casts
        $placeholders = array_map(function ($key, $i) use ($properties) {
            $pgType = $this->mapJsonTypeToPostgres($properties[$key]['type'] ?? 'string');
            return sprintf('$%d::%s', $i + 1, $pgType);
        }, array_keys($params), range(0, count($params) - 1));

        $placeholderString = implode(',', $placeholders);

        $query = "SELECT {$columnList} FROM $function($placeholderString)";
        $result = pg_query_params($conn, $query, array_values($params));

        if (!$result) {
            throw new Exception('Database error: ' . pg_last_error($conn));
        }

        return pg_fetch_all($result);
    }

    private function mapJsonTypeToPostgres($jsonType)
    {
        $typeMap = [
            'string' => 'text',
            'integer' => 'integer',
            'biginteger' => 'bigint',
            'number' => 'numeric',
            'boolean' => 'boolean',
            'array' => 'json',
            'object' => 'jsonb',
            'date' => 'date',
            'timestamp' => 'timestamp',
            'uuid' => 'uuid'
        ];

        return $typeMap[$jsonType] ?? 'text';
    }


    private function sendResponse($status, $data)
    {
        http_response_code($status);
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }
}

// Run the API
$api = new Api();
$api->handleRequest();
