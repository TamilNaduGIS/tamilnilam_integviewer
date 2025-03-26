<?php
class DatabaseManager
{
    private $configs = [];
    private $connections = [];

    public function __construct()
    {
        $this->loadConfigurations();
    }

    private function loadConfigurations()
    {
        // Connect to the config database (using environment variables or config file)
        $configDb = pg_connect("host=localhost dbname=ssp user=postgres password=postgres");

        if (!$configDb) {
            throw new Exception("Could not connect to configuration database");
        }

        // Load all active database configurations
        $query = "SELECT * FROM masters.db_configurations WHERE is_active = true";
        $result = pg_query($configDb, $query);

        while ($row = pg_fetch_assoc($result)) {
            $this->configs[$row['config_name']] = $row;
        }

        pg_close($configDb);
    }

    public function getConnection($configName)
    {
        // Return existing connection if available
        if (isset($this->connections[$configName])) {
            return $this->connections[$configName];
        }

        // Check if configuration exists
        if (!isset($this->configs[$configName])) {
            throw new Exception("Database configuration '$configName' not found");
        }

        $config = $this->configs[$configName];

        // Create new connection
        $conn = pg_connect(
            "host={$config['host']} " .
                "port={$config['port']} " .
                "dbname={$config['dbname']} " .
                "user={$config['username']} " .
                "password={$config['password']}"
        );

        if (!$conn) {
            throw new Exception("Failed to connect to database using configuration '$configName'");
        }

        $this->connections[$configName] = $conn;

        return $conn;
    }

    public function executeFunction($endpointConfig, $params, $isWrite = false)
    {
        // Determine which configuration to use
        $configName = $isWrite ?
            $endpointConfig['writer_db_config'] :
            $endpointConfig['reader_db_config'];

        // Get appropriate connection
        $conn = $this->getConnection($configName);

        // Parse input parameters and their types
        $inputParams = json_decode($endpointConfig['input_params'], true);
        if (!$inputParams) {
            throw new Exception("Invalid input_params format in endpoint configuration");
        }

        // Build the parameter placeholders with type casting
        $placeholders = [];
        $typedParams = [];
        $index = 1;

        foreach ($inputParams as $paramName => $paramType) {
            if (!isset($params[$paramName])) {
                throw new Exception("Missing required parameter: $paramName");
            }

            // Add placeholder with type casting
            $placeholders[] = '$' . $index . '::' . $paramType;

            // Add the actual parameter value
            $typedParams[] = $params[$paramName];
            $index++;
        }

        // Build the query
        $query = "SELECT * FROM " . str_replace('"', '', $endpointConfig['pg_function_name']) .
            "(" . implode(',', $placeholders) . ")";

        // // Debugging: Log query and parameters
        // error_log("Generated Query: " . $query);
        // error_log("Parameters: " . json_encode($typedParams));

        // Execute the query
        $result = pg_query_params($conn, $query, $typedParams);

        if (!$result) {
            throw new Exception("Function execution failed: " . pg_last_error($conn));
        }

        return pg_fetch_all($result);
    }
}

class RequestHandler
{
    private $method;
    private $input;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->input = $this->parseInput();
    }

    public function getEndpoint()
    {
        // Remove query string and get path
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Split the path into segments
        $segments = explode('/', trim($uri, '/'));

        // Return the first segment after 'api' (if exists)
        // Example: /api/users returns 'users'
        return isset($uri) ? $uri : '';
    }

    private function parseInput()
    {
        $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
        $input = [];

        // Handle different content types
        if (strpos($contentType, 'application/json') !== false) {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
        } elseif (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
            $input = $_POST;
        } elseif (strpos($contentType, 'multipart/form-data') !== false) {
            $input = $_POST;
        } elseif (strpos($contentType, 'text/plain') !== false) {
            $input['data'] = file_get_contents('php://input');
        }

        // Merge query parameters for GET requests
        if ($this->method === 'GET') {
            $input = array_merge($input, $_GET);
        }

        return $input;
    }
    public function getMethod()
    {
        return $this->method;
    }

    public function getInput()
    {
        return $this->input;
    }
}

class Api
{
    private $dbManager;
    private $request;

    public function __construct()
    {
        $this->dbManager = new DatabaseManager();
        $this->request = new RequestHandler();
    }

    public function handleRequest()
    {
        try {
            // Get endpoint configuration
            $endpoint = $this->request->getEndpoint();
            $config = $this->getEndpointConfig($endpoint);

            // Determine if this is a write operation
            $isWrite = in_array($this->request->getMethod(), ['POST', 'PUT', 'DELETE', 'PATCH']);

            // Execute the function with appropriate database connection
            $result = $this->dbManager->executeFunction(
                $config,
                $this->request->getInput(),
                $isWrite
            );

            return [
                'status' => 200,
                'data' => $result
            ];
        } catch (Exception $e) {
            return [
                'status' => $e->getCode() ?: 500,
                'data' => ['error' => $e->getMessage()]
            ];
        }
    }

    private function getEndpointConfig($endpoint)
    {
        // Use the config database connection to get endpoint configuration
        $configDb = $this->dbManager->getConnection('primary_reader');

        $query = "SELECT * FROM masters.api_endpoints_config WHERE endpoint_path = $1 AND is_active = true";
        $result = pg_query_params($configDb, $query, [$endpoint]);

        if (!$result || pg_num_rows($result) === 0) {
            throw new Exception("Endpoint configuration not found", 404);
        }

        return pg_fetch_assoc($result);
    }
}

// index.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    $api = new Api();
    $result = $api->handleRequest();

    http_response_code($result['status']);
    echo json_encode($result['data']);
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['error' => $e->getMessage()]);
}
