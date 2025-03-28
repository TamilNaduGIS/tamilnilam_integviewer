const BASE_URL = "https://tngis.tnega.org/generic_api";
const GEOSERVER_URL = 'https://tngis.tnega.org/geoserver/wms';

const ADMIN_CODE_TYPE = 'revenue';
const AREG_SEARCH_TYPE = 'survey_number';
const AREG_SEARCH_URL = 'https://tngis.tnega.org/tamilnilam_api/v1/tamil_nillam_ownership';

const FMB_SKETCH_URL = 'https://tngis.tnega.org/generic_api/v1/fmb_sketch';
const IGR_SERVICE_LAYER_NAME = 'Thematic_XYZ';
const IGR_URL = 'https://tngis.tnega.org/thematic_viewer_api/v1/getfeatureInfo'


// Configuration
toastr.options = {
    "closeButton": true,
    "debug": true,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

function showToast(type, message) {
    switch (type) {
        case 'success':
            toastr.success(message);
            break;
        case 'error':
            toastr.error(message);
            break;
        case 'warning':
            toastr.warning(message);
            break;
        case 'info':
            toastr.info(message);
            break;
    }
}

// Modern ES6 Promise wrapper
function ajaxPromise(options) {
    return new Promise((resolve, reject) => {
        $.ajax({
            ...options,
            success: resolve,
            error: reject
        });
    });
}

/**
 * Populates a dropdown with sorted options from an API response
 * @param {string} dropdownId - The ID of the select element to populate
 * @param {Object} response - The API response object
 * @param {Object} config - Configuration object for the dropdown
 * @param {string} config.defaultText - Text for the default option (e.g., "Select Taluk")
 * @param {string} config.valueKey - The key in data object to use as option value (e.g., "taluk_code")
 * @param {string} config.textKey - The key in data object to use as option text (e.g., "taluk_english_name")
 * @param {Function} [config.sortFunction] - Optional custom sort function
 * @param {Function} [config.errorCallback] - Optional error callback function
 */
function populateDropdown(dropdownId, response, config) {
    const selectElement = document.getElementById(dropdownId);
    if (!selectElement) {
        console.error(`Dropdown with id "${dropdownId}" not found`);
        return;
    }

    // Set default configuration
    const defaultConfig = {
        defaultText: 'Select Option',
        valueKey: 'id',
        textKey: 'name',
        sortFunction: (a, b) => a[config.textKey].localeCompare(b[config.textKey]),
        errorCallback: (message) => console.error(message),
        triggerChange: false
    };

    // Merge provided config with defaults
    config = { ...defaultConfig, ...config };

    // Set default option
    selectElement.innerHTML = `<option value="" disabled selected>${config.defaultText}</option>`;

    // Check if request was successful
    if (response.success === 1 && response.data && response.data.length > 0) {
        // Sort data if sort function is provided
        const sortedData = [...response.data].sort(config.sortFunction);

        // Create and append options
        sortedData.forEach(item => {
            const option = document.createElement('option');
            option.value = item[config.valueKey];
            option.textContent = item[config.textKey];
            selectElement.appendChild(option);
        });

        // Trigger change event if specified
        if (config.triggerChange) {
            // Create and dispatch the change event
            const event = new Event('change', {
                bubbles: true,
                cancelable: true,
            });
            selectElement.dispatchEvent(event);
        }
    } else {
        config.errorCallback(response.message);
    }
}

function resetDropdown(dropdownId, defaultText) {
    const selectElement = document.getElementById(dropdownId);
    if (!selectElement) {
        console.error(`Dropdown with id "${dropdownId}" not found`);
        return;
    }
    // Set default option
    selectElement.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;

    // Create and dispatch the change event
    const event = new Event('change', {
        bubbles: true,
        cancelable: true,
    });
    selectElement.dispatchEvent(event);
}