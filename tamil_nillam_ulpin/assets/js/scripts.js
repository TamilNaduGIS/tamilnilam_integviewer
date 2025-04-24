// View
var view = new ol.View({
    zoom: 7,
    center: [8681480.570496075, 1224732.6162325153],
    // center: [8781480.570496075, 1224732.6162325153],
    // extent: [885626.451712506, 892078.6691354283, 9167334.689279644, 1557386.5633296024],
    enableRotation: false
});
/* MAP */
/*******/
const map = new ol.Map({
    target: 'map',
    attribution: false,
    view,
});
const zoomControl = map.getControls().getArray().filter(control => control instanceof ol.control.Zoom)[0];
if (zoomControl) {
    map.removeControl(zoomControl);
}

// Function to remove basemaps by 'type'
function removeBasemapByType(type) {
    map.getLayers().forEach(layer => {
        if (layer && layer.get('type') === type) {
            map.removeLayer(layer); // Remove all layers with the specified type
        }
    });
}

// Function to change basemap based on the selected type
function changeBasemap(type, basemap) {
    if (type == 'basemap') {
        // Remove existing base maps of the same type
        removeBasemapByType(type);
    }

    let basemapLayer;
    // Define basemaps based on the type
    switch (basemap) {
        case 'cadastral_xyz':
            basemapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://tngis.tn.gov.in/data/xyz_tiles/cadastral_xyz/{z}/{x}/{y}.png', // Terrain layer URL
                    attributions: [
                        '© TNGIS'
                    ],
                }),
                baseLayer: false,
                zIndex: 1,
                type: type, // This is a basemap type
                id: 'cadastral-xyz',
            });
            break;
        case 'osm':
            basemapLayer = new ol.layer.Tile({
                source: new ol.source.OSM({
                    attributions: [
                        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    ],
                }),
                baseLayer: true,
                zIndex: -1,
                type: 'basemap', // This is a basemap type
                id: 'osm-basemap',
            });
            break;
        case 'satellite':
            basemapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Replace with your satellite tile URL
                    attributions: [
                        '© Google'
                    ],
                }),
                baseLayer: true,
                zIndex: -1,
                type: 'basemap', // This is a basemap type
                id: 'satellite-basemap',
            });
            break;
        case 'terrain':
            basemapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png', // Terrain layer URL
                    attributions: [
                        '© OpenTopoMap contributors'
                    ],
                }),
                baseLayer: true,
                zIndex: -1,
                type: 'basemap', // This is a basemap type
                id: 'terrain-basemap',
            });
            break;
        case 'nomap':
            basemapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png', // Terrain layer URL
                    attributions: ['© OpenTopoMap contributors'],
                }),
                baseLayer: true,
                zIndex: -1,
                type: 'basemap',         // Basemap type
                id: 'terrain-basemap',
                visible: false           // Initially hidden
            });
            break;
        
        default:
            return;
    }

    // Add the new basemap layer
    map.addLayer(basemapLayer);
    if (type == 'basemap') {
        highlightSelectedButton(basemap);
    }
}

var layerConfig = {};
var geojsonSource = new ol.source.Vector();
var geojsonFormat = new ol.format.GeoJSON();
var geojsonLayer = new ol.layer.Vector({
    name: "Buffer Circle",
    source: geojsonSource,
    type: 'vector',
    zIndex: 10,
    visible: false, // Initially hidden
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        }),
        stroke: new ol.style.Stroke({
            color: "CYAN",
            width: 6
        }),
    }),
});

// UnMatched with Spatial
var cadastral_with_ulpin_source = new ol.source.TileWMS({
    url: `${GEOSERVER_URL}`,
    params: {
        'LAYERS': ' cadastral_information_new' + ':' + 'fmb_ulpin',
        'STYLES': '',
    },
    serverType: 'geoserver'
});
const cadastral_with_ulpin = new ol.layer.Tile({
    title: 'ULPIN',
    type: 'wms',
    source: cadastral_with_ulpin_source,
    name: "ULPIN",
    visible: false,
    zIndex: 9,
    displayInLayerSwitcher: false,
});

// Function to check zoom level and add WMS layer
function updateWMSLayerVisibility() {
    const currentZoom = map.getView().getZoom();
    if (currentZoom >= 13 && !map.getLayers().getArray().includes(cadastral_with_ulpin)) {
        map.addLayer(cadastral_with_ulpin); // Add WMS layer if zoom level is 16 or higher
    } else if (currentZoom < 16 && map.getLayers().getArray().includes(cadastral_with_ulpin)) {
        map.removeLayer(cadastral_with_ulpin); // Remove WMS layer if zoom level is less than 16
    }
}

// Listen to the moveend event to detect when zoom changes
map.on('moveend', updateWMSLayerVisibility);

// Function to highlight the selected button
function highlightSelectedButton(selectedBasemap) {
    // Remove the 'selected' class from all buttons
    const buttons = document.querySelectorAll('.basemap-btn');
    buttons.forEach(button => {
        button.classList.remove('selected');
    });

    // Add the 'selected' class to the clicked button
    const selectedButton = document.getElementById(`${selectedBasemap}-btn`);
    selectedButton.classList.add('selected');
}

// Add interactivity for navigation buttons
document.getElementById('zoom-in-btn').addEventListener('click', () => {
    const view = map.getView();
    view.setZoom(view.getZoom() + 1);
});

document.getElementById('zoom-out-btn').addEventListener('click', () => {
    const view = map.getView();
    view.setZoom(view.getZoom() - 1);
});

document.getElementById('zoom-to-extent-btn').addEventListener('click', () => {
    var zoomtoExtentValue = [8395626.451712506, 892078.6691354283, 9167334.689279644, 1557386.5633296024];
    const view = map.getView();
    view.fit(zoomtoExtentValue, { size: map.getSize() });
});

// document.addEventListener('click', function (event) {
//     const menu = document.getElementById('menu');
//     const navbar = document.getElementById('navbar');

//     // Check if the click is outside the navbar and menu
//     if (!navbar.contains(event.target) && !menu.contains(event.target)) {
//         menu.classList.remove('show');
//         menu.classList.add('hidden');
//     }
// });

// Function to toggle the menu visibility
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('show');
    menu.classList.toggle('hidden');
}

// // Update the info panel content
// function updatePanelContent(content) {
//     const panelContent = document.getElementById('panel-content');
//     panelContent.innerHTML = content;

//     const panel = document.getElementById('info-panel');
//     panel.classList.add('show'); // Show the panel
// }

// Hide the info panel
function hidePanel() {
    const panel = document.getElementById('info-panel');
    panel.classList.remove('show');
    panel.style.display = 'none';
}

loadDistrict();
// Click event listener on the map
var currentRequest = null;
var allowRequest = null;
$("#longitude").val('');
$("#latitude").val('');
map.on('singleclick', function (evt) {
    $(".error-message").empty().hide();
    // Add click listener to map to close the panel when clicking on the map
    geojsonSource.clear();
    map.removeLayer(vertexLayer);
    // simplifiedHidePanel();
    closeAregPanel();
    closeFMBSketchPanel();
    const coordinates = ol.proj.toLonLat(evt.coordinate);
    const lon = coordinates[0].toFixed(6);
    const lat = coordinates[1].toFixed(6);

    $("#longitude").val(lon.trim());
    $("#latitude").val(lat.trim());
    
    $("#staticBackdropLabel").html(`Land Parcel Information (<span class='lpi-style'>${lat}, ${lon}</span>)`);
    // var responsess = {
    //     "success": 1,
    //     "message": "Land Details Found",
    //     "data": {
    //         "district_code": "10",
    //         "taluk_code": "33",
    //         "village_code": "009",
    //         "lgd_village_code": 634879,
    //         "survey_number": "48",
    //         "sub_division": "1",
    //         "firka_ward_number": null,
    //         "urban_block_number": null,
    //         "is_fmb": 1,
    //         "geojson_geom": "{\"type\":\"Polygon\",\"coordinates\":[[[77.695156286,11.515228707],[77.696620823,11.515291514],[77.696714861,11.514408431],[77.696542096,11.514388365],[77.696356734,11.514366836],[77.696254155,11.514354922],[77.696142577,11.514341963],[77.6960328,11.514329213],[77.695878535,11.514312999],[77.695174394,11.515135856],[77.695156286,11.515228707]]]}",
    //         "ulpin": "73G2Z4DALZ2HH0",
    //         "centroid": "11.514772,77.696081",
    //         "lgd_district_code": 573,
    //         "lgd_taluk_code": 5750,
    //         "rural_urban": "rural",
    //         "district_name": "Erode",
    //         "district_tamil_name": "\u0b88\u0bb0\u0bcb\u0b9f\u0bc1",
    //         "taluk_name": "Bhavani",
    //         "taluk_tamil_name": "\u0baa\u0bb5\u0bbe\u0ba9\u0bbf",
    //         "village_name": "Varadhanallur",
    //         "village_tamil_name": "009  \u0bb5\u0bb0\u0ba4\u0ba8\u0bb2\u0bcd\u0bb2\u0bc1\u0bbe\u0bb0\u0bcd"
    //     }
    // }

    // addGeoJsonLayer(responsess.data.geojson_geom)
    // displaySimplifiedInfo(responsess.data, lat, lon)
    
    if (currentRequest != null) {
        currentRequest.abort();
    }
    allowRequest = true;
    currentRequest = $.ajax({
        url: `${BASE_URL}/v2/land_details`,
        method: 'POST',
        headers: {
            'X-APP-NAME': 'demo'
        },
        data: {
            latitude: lat,
            longitude: lon,
        },
        success: function (response) {
            $(".error-message").empty().hide();
            var responseMessage = '';
            if (response.success) {
                if(response.success == 1){
                    var response_data = response.data;
                    loadDistrict(response_data.district_code,response_data.taluk_code,response_data.village_code,response_data.survey_number,response_data.sub_division);
                    addGeoJsonLayer(response_data.geojson_geom)
                    displaySimplifiedInfo(response_data, lat, lon)
                    $(".error-message").empty().hide();
                }else{
                    responseMessage = response.message;
                    showToast('warning', response.message)
                    document.getElementById('areg-tab-container')?.remove();
                    document.getElementById('fmb-sketch-info-panel')?.remove();
                    document.getElementById('igr-info-container')?.remove();
                    document.getElementById('vertex-info-container')?.remove();
                    $(".error-message").empty().text(responseMessage).show();
                }
                
            } else if(response.error == 0){
                showToast('error', response.message)
                $(".error-message").empty().text(response.message).show();
                document.getElementById('areg-tab-container')?.remove();
                document.getElementById('fmb-sketch-info-panel')?.remove();
                document.getElementById('igr-info-container')?.remove();
                document.getElementById('vertex-info-container')?.remove();
            }else {
                $(".error-message").empty().text(response.message).show();
            }

            
        },
        error: function (xhr, status, error) {
            
        }
    });
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('fmb-sketch-info-panel')?.remove();
    document.getElementById('igr-info-container')?.remove();
    document.getElementById('vertex-info-container')?.remove();
    document.getElementById('thematic-info-container')?.remove();
    document.getElementById('JSB-info-container')?.remove();
});
$(document).on('click', '.JSB-icon-card', function () {
    // Remove old detail divs
    $('#JSB-info-container .detail').remove();

    // Create and append new detail div
    // const detailDiv = $('<div class="detail mt-2 p-2 border rounded" style="background:#eef;">contents owned by : ' + $(this).text().trim() + '</div>');
    const detailDiv = $('<div class="detail mt-2 p-2 border rounded" style="background:#1a3d5b;color: #fff;">' + $(this).text().trim() + ' contents: <b>Coming soon</b></div>');
    $('#JSB-info-container').append(detailDiv);
});

$(document).on('click', '.thematic-icon-card', function () {
    let currentController = null;
    let currentPopulationRequest = null;

    $('.thematic-icon-card').removeClass('active'); // Remove from all
    $(this).addClass('active'); 
    // Remove old detail divs
    $('#thematic-info-container .detail').remove();
    var selectedLayerTitle = this.title;
    var lat = $("#latitude").val();
    var lon = $("#longitude").val();
    let geoserverUrl='',layerName='';
    let grayIndexValue = '';
    geoserverUrl = "https://tngis.tnega.org/geoserver/wms";
    if(selectedLayerTitle != 'Population Theme'){
        if(selectedLayerTitle == 'Elevation'){
            layerName = "generic_viewer:elevation_raster";
        }else if(selectedLayerTitle == 'Slope'){
            layerName = "generic_viewer:tn_slope";
        }else if(selectedLayerTitle == 'Aspect'){
            layerName = "generic_viewer:tn_aspect";
        }else if(selectedLayerTitle == 'Contours'){
            layerName = "generic_viewer:tn_contours";
        }else if(selectedLayerTitle == 'Geology'){
            layerName = "generic_viewer:geology";
        }else if(selectedLayerTitle == 'Geomorphology'){
            layerName = "generic_viewer:geomorphology";
        }
        
        const coord = ol.proj.fromLonLat([lon, lat], 'EPSG:3857');
        // BBOX around the point
        const resolution = 10; // meters per pixel (adjust as needed)
        const halfSize = 50 * resolution;
        const minX = coord[0] - halfSize;
        const minY = coord[1] - halfSize;
        const maxX = coord[0] + halfSize;
        const maxY = coord[1] + halfSize;
    
         // or slope/aspect
    
        const url = `${geoserverUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo` +
        `&FORMAT=image/png&TRANSPARENT=true` +
        `&QUERY_LAYERS=${layerName}&LAYERS=${layerName}` +
        `&INFO_FORMAT=application/json` +
        `&I=50&J=50&WIDTH=101&HEIGHT=101` +
        `&CRS=EPSG:3857&BBOX=${minX},${minY},${maxX},${maxY}`;
    
        if (currentController) {
            currentController.abort(); // Abort previous request
        }
        
        currentController = new AbortController(); // Create new controller for this request
        
        fetch(url, { signal: currentController.signal })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Network response was not ok. Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                let grayIndexValue = 'No Data';
                let grayIndex = null;
                let properties = null;
        
                if (data.features && data.features.length > 0 && data.features[0].properties) {
                    const props = data.features[0].properties;
                    if (typeof props.GRAY_INDEX !== 'undefined') {
                        grayIndex = Math.floor(props.GRAY_INDEX);
                        properties = props.GRAY_INDEX;
                    }
                } else {
                    throw new Error("Invalid or missing 'features' or 'properties' in response.");
                }
        
                if (selectedLayerTitle === 'Elevation' && grayIndex !== null) {
                    grayIndexValue = grayIndex + ' M';
                } else if (selectedLayerTitle === 'Contours' && data.features[0].properties.elevation !== undefined) {
                    grayIndexValue = data.features[0].properties.elevation + ' M';
                } else if (selectedLayerTitle === 'Slope' && grayIndex !== null) {
                    grayIndexValue = grayIndex + ' °';
                } else if (selectedLayerTitle === 'Aspect' && properties !== null) {
                    if (properties <= -1) {
                        grayIndexValue = grayIndex + ' Flat';
                    } else if (properties > 0 && properties <= 22.5) {
                        grayIndexValue = grayIndex + ' N';
                    } else if (properties > 22.5 && properties <= 67.5) {
                        grayIndexValue = grayIndex + ' NE';
                    } else if (properties > 67.5 && properties <= 112.5) {
                        grayIndexValue = grayIndex + ' E';
                    } else if (properties > 112.5 && properties <= 157.5) {
                        grayIndexValue = grayIndex + ' SE';
                    } else if (properties > 157.5 && properties <= 202.5) {
                        grayIndexValue = grayIndex + ' S';
                    } else if (properties > 202.5 && properties <= 247.5) {
                        grayIndexValue = grayIndex + ' SW';
                    } else if (properties > 247.5 && properties <= 292.5) {
                        grayIndexValue = grayIndex + ' W';
                    } else if (properties > 292.5 && properties <= 337.5) {
                        grayIndexValue = grayIndex + ' NW';
                    } else if (properties > 337.5) {
                        grayIndexValue = grayIndex + ' N';
                    } else {
                        grayIndexValue = 'Unknown Direction';
                    }
                } else {
                    grayIndexValue = 'No valid data found for selected layer.';
                }
        
                if (selectedLayerTitle === 'Geology' || selectedLayerTitle === 'Geomorphology') {
                    const propertyDiv = $('<div class="detail mt-2 p-2 border rounded bgcolordiv" style="color:#fff;"></div>');
                    $.each(data.features[0].properties, function (key, value) {
                        if (key !== 'tngis_id' && key !== 'layer_id') {
                            propertyDiv.append('<div><b>' + key.replace(/_/g, ' ').toUpperCase() + '</b>: ' + value + '</div>');
                        }
                    });
                    $('#thematic-info-container .detail').remove();
                    $('#thematic-info-container').append(propertyDiv);
                } else {
                    $('#thematic-info-container .detail').remove();
                    const detailDiv = $('<div class="detail mt-2 p-2 border rounded bgcolordiv" style="color: #fff;"><b>' + selectedLayerTitle + '</b>: ' + grayIndexValue + '</div>');
                    $('#thematic-info-container').append(detailDiv);
                }
        
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.warn('Previous request aborted');
                    return;
                }
                $('#thematic-info-container .detail').remove();
                const errorDiv = $('<div class="detail mt-2 p-2 border rounded" style="background:#a94442;color: #fff;"><b>Error:</b> Failed to load ' + selectedLayerTitle + ' data.</div>');
                $('#thematic-info-container').append(errorDiv);
            });
        
    }else{
        $('#thematic-info-container .detail').remove();
        let urbanParams = {
            latitude:lat,
            longitude:lon,
            layer_name: 'population'
        }
        // Abort the previous request if it's still in progress
        if (currentPopulationRequest && currentPopulationRequest.readyState !== 4) {
            currentPopulationRequest.abort();
        }

        currentPopulationRequest = $.ajax({
            url: `${POPULATION_URL}`,
            method: 'POST',
            headers: { 'X-APP-ID': 'te$t' },
            data: urbanParams,
            success: function (response) {
                if (response.success == 1) {
                    var results = response.data[0];
                    const card = $(`
                        <div class="detail mt-2 p-2 border rounded bgcolordiv" style="color: #336c7b;">
                            <div class="card p-1 m-1"><div class="text-center"><strong>Type:</strong> ${results.type}</div></div>
                            <div class="card-body p-1">
                                <div class="row g-2">
                                    <!-- Card 1 -->
                                    <div class="col-md-6">
                                        <div class="card p-3 h-100">
                                            <div><strong>Total Population:</strong> ${results.tot_p}</div>
                                            <div><strong>No. of Households:</strong> ${results.no_hh}</div>
                                        </div>
                                    </div>
                                    <!-- Card 2 -->
                                    <div class="col-md-6">
                                        <div class="card p-3 h-100">
                                            <div><strong>Male Population:</strong> ${results.tot_m}</div>
                                            <div><strong>Female Population:</strong> ${results.tot_f}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                    $('#thematic-info-container').append(card);
                } else {
                    console.error(response.message);
                    $(".error-message").empty().text(response.message).show();
                }
            },
            error: function (xhr, status, error) {
                if (status !== 'abort') {
                    console.error('Error in fetching AREG - ', error);
                }
            }
        });

    }
    

});

map.on('pointermove', function (e) {
    var lonlat = ol.proj.toLonLat(e.coordinate);
    $("#lon").html(lonlat[0].toFixed(6));
    $("#lat").html(lonlat[1].toFixed(6));
});

// Close button event listener
document.getElementById('close-btn').addEventListener('click', hidePanel);

function displaySimplifiedInfo(data, lat, long) {
    $(".error-message").empty().hide();
    const panel = document.getElementById('lpi-container');
    const content = document.getElementById('lpi-content');
    // console.log(data);
    // Clear previous content
    content.innerHTML = '';

    // Group Data into Sections
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-section';

    // District, Taluk, and Village in a single line
    const districtTalukVillage = document.createElement('div');
    districtTalukVillage.className = 'district-taluk-village';
    if(data.rural_urban != 'urban'){
        districtTalukVillage.innerHTML = `
        <div><strong>District:</strong> <br />${data.district_name ? data.district_name: '-'} / ${data.district_tamil_name ? data.district_tamil_name: '-'}</div>
        <div><strong>Taluk:</strong> <br /> ${data.taluk_name ? data.taluk_name: '-'} / ${data.taluk_tamil_name ? data.taluk_tamil_name: '-'}</div>
        <div><strong>Village:</strong> <br /> ${data.village_name ? data.village_name:'-'} / ${data.village_tamil_name ? data.village_tamil_name:'-'}</div>
    `;
    }else{
        districtTalukVillage.innerHTML = `
        <div><strong>District:</strong> <br />${data.district_name ? data.district_name : '-'} / ${data.district_tamil_name ? data.district_tamil_name: '-'}</div>
        <div><strong>Taluk:</strong> <br /> ${data.taluk_name ? data.taluk_name: '-'} / ${data.taluk_tamil_name ? data.taluk_tamil_name : '-'}</div>
        <div><strong>Town:</strong> <br /> ${data.revenue_town_name ? data.revenue_town_name: '-'} / ${data.revenue_town_tamil_name ? data.revenue_town_tamil_name: '-'}</div>
        <div><strong>Ward:</strong> <br /> ${data.revenue_ward_name ? data.revenue_ward_name: '-'} / ${data.revenue_ward_tamil_name ? data.revenue_ward_tamil_name: '-'}</div>
        <div><strong>Block:</strong> <br /> ${data.revenue_block_name ? data.revenue_block_name: '-'} / ${data.revenue_block_name ? data.revenue_block_name: '-'}</div>
    `; 
    }
    
    infoDiv.appendChild(districtTalukVillage);

    if(data.rural_urban != 'urban'){
    // LGD Codes
    const lgdCodes = document.createElement('div');
    lgdCodes.className = 'lgd-codes';
    lgdCodes.innerHTML = `
        <div><strong>Village LGD Code:</strong> ${data.lgd_village_code ? data.lgd_village_code:'-'} (${data.rural_urban ? data.rural_urban: '-'})</div>
    `;
    infoDiv.appendChild(lgdCodes);
    }

    content.appendChild(infoDiv);

    // Survey Section
    const surveySection = document.createElement('div');
    surveySection.className = 'info-survey-section';

    // const surveyNumber = data.is_fmb == 1
    //     ? (data.sub_division ? `${data.survey_number}/${data.sub_division}` : data.survey_number)
    //     : data.survey_number;
        const surveyNumber = data.survey_number || '';

        const subDivision = data.is_fmb == 1 ? (data.sub_division !=null) ? data.sub_division: '-' : '-';


    surveySection.innerHTML = `
        <div><strong>ULPIN:</strong> ${data.ulpin ? data.ulpin : '-'}</div> <div><strong>Centroid:</strong> ${data.centroid ? data.centroid : '-'}</div><br>
        <div><strong>Survey Number:</strong> ${surveyNumber}</div>
        <div id='subdivisionid'><strong>Sub Division:</strong> <span id="subDivs">${subDivision}</span></div>
        <br>
    `;

    // Icon Section
    const iconSection = document.createElement('div');
    iconSection.className = 'info-icons';

    iconSection.innerHTML = `
    <h6 class="note">Click on the below icons to view more details</h6>
        <ul class="nav nav-tabs mb-1 d-flex flex-row" id="myTab" role="tablist">
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="Patta / Chitta - A-Reg" id="profile-tab" type="button" 
                    data-bs-target="#profile-tab-pane" aria-controls="profile-tab-pane" aria-selected="false" 
                    onclick='openAregInfo(${JSON.stringify(data)})'>
                    <img src="assets/icons/patta-chitta-icon.svg" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="FMB Sketch" id="next-tab" type="button" 
                    data-bs-target="#next-tab-pane" aria-controls="next-tab-pane" aria-selected="false" 
                    onclick='openFMBSketchInfo(${JSON.stringify(data)})'>
                    <img src="assets/icons/FMB-Sketch-icon.svg" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="Vertex / Plot Corner List" id="pro-tab" type="button" 
                    data-bs-target="#pro-tab-pane" aria-controls="pro-tab-pane" aria-selected="false" 
                    onclick='highlightVertices(${JSON.stringify(data.geojson_geom)})'>
                    <img src="assets/icons/vertex-icon.svg" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="Guideline Value" id="nex-tab" type="button" 
                    data-bs-target="#nex-tab-pane" aria-controls="nex-tab-pane" aria-selected="false" 
                    onclick='openIGRInfo(${JSON.stringify(data)}, ${lat}, ${long})'>
                    <img src="assets/icons/rupee-icon.svg" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="EC" id="nex-tab" type="button" 
                    data-bs-target="#nex-tab-pane" aria-controls="nex-tab-pane" aria-selected="false" 
                    onclick='openECnfo(${JSON.stringify(data)}, ${lat}, ${long})' style="font-weight:700">
                    <img src="assets/icons/EC-icon.svg" id="EC_logo" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="Jurisdictional Boundaries" id="nex-tab" type="button" 
                    data-bs-target="#nex-tab-pane" aria-controls="nex-tab-pane" aria-selected="false" 
                    onclick='JSBIconInfo(${JSON.stringify(data)}, ${lat}, ${long})' style="font-weight:700">
                    <img src="assets/icons/boundary-icon.svg" id="boundaries" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="Thematic View" id="nex-tab" type="button" 
                    data-bs-target="#nex-tab-pane" aria-controls="nex-tab-pane" aria-selected="false" 
                    onclick='loadThematicIconsFromJson(${JSON.stringify(data)}, ${lat}, ${long})' style="font-weight:700">
                    <img src="assets/icons/thematic-icon.svg" id="thematic_view" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="E-Adangal" id="nex-tab" type="button" 
                    data-bs-target="#nex-tab-pane" aria-controls="nex-tab-pane" aria-selected="false" 
                    onclick='adangalView()' style="font-weight:700">
                    <img src="assets/icons/adangal-icon.svg" id="adangal_view" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="Master Plan" id="nex-tab" type="button" 
                    data-bs-target="#nex-tab-pane" aria-controls="nex-tab-pane" aria-selected="false" 
                    onclick='masterPlanView()' style="font-weight:700">
                    <img src="assets/icons/master-plan-icon.svg" id="master_plan_view" class="info-icon-img-style" alt="">
                </button>
            </li>
            <li class="nav-item mx-1 mb-2" role="presentation">
                <button class="nav-link district-icon" title="Near By Location" id="nex-tab" type="button" 
                    data-bs-target="#nex-tab-pane" aria-controls="nex-tab-pane" aria-selected="false" 
                    onclick='nearByView()' style="font-weight:700">
                    <img src="assets/icons/nearby-icon.svg" id="nearby_view" class="info-icon-img-style" alt="">
                </button>
            </li>
        </ul>
    `;

    // Append sections to content
    content.appendChild(surveySection);
    content.appendChild(iconSection);
    $("#staticBackdrop").modal('show');
}

// Hide the info panel
function simplifiedHidePanel() {
    $("#staticBackdrop").modal('hide');
}

// Close button event listener
document.getElementById('simplified-close-btn').addEventListener('click', simplifiedHidePanel);


function addGeoJsonLayer(geojson) {
    var features = geojsonFormat.readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    geojsonSource.clear();
    geojsonSource.addFeatures(features);

    var extent = geojsonSource.getExtent();

    map.getView().fit(extent, {
        duration: 4000,
        maxZoom: 18.4,
        padding: [19, 19, 19, 19]
    });
    
    geojsonLayer.setVisible(true);
}
$("#info-close").on("click", function(){
    clearVertexLabels();
    geojsonSource.clear();
    map.removeLayer(vertexLayer);
});

// Global variable to hold reference to the vertex layer
let vertexLayer = null;

// Function to handle vertex extraction, highlighting, and coordinate display
function highlightVertices(sgeojsonGeom) {
    $(".error-message").empty().hide();
    map.removeLayer(vertexLayer);
    const geojsonGeom = JSON.parse(sgeojsonGeom);
    const vertices = extractVertices(geojsonGeom);
    // console.log(vertices);

    const vertexFeatures = vertices.map((vertex, index) => {
        const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(vertex)), // Convert to map projection (default EPSG:3857)
            coordinates: vertex
        });

        feature.setStyle(
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({ color: 'blue' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 1 })
                }),
                text: new ol.style.Text({
                    text: `${index + 1}`, // Display serial number
                    font: '12px Arial',
                    fill: new ol.style.Fill({ color: 'black' }),
                    backgroundFill: new ol.style.Fill({ color: 'white' }),
                    padding: [2, 2, 2, 2],
                    offsetY: -15
                })
            })
        );

        return feature;
    });

    const vertexSource = new ol.source.Vector({
        features: vertexFeatures
    });

    vertexLayer = new ol.layer.Vector({
        source: vertexSource,
        zIndex: 1007
    });
    
    map.addLayer(vertexLayer);

    displayVertexDetails(vertices);

    // Zoom to fit the extent of vertices
    const extent = vertexSource.getExtent();
    map.getView().fit(extent, {
        duration: 4000,
        maxZoom: 18.4,
        padding: [19, 19, 19, 19]
    });
}
function displayVertexDetails(vertices) {
    $(".error-message").empty().hide();
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('fmb-sketch-info-panel')?.remove();
    document.getElementById('thematic-info-container')?.remove();
    document.getElementById('JSB-info-container')?.remove();
    document.getElementById('igr-info-container')?.remove();


    // Select the .info-icons div
    const iconSection = document.querySelector('.info-icons');

    // Remove any existing vertex info container
    document.getElementById('vertex-info-container')?.remove();

    // Create the container for the vertex info
    const vertexContainer = document.createElement('div');
    vertexContainer.id = 'vertex-info-container';
    vertexContainer.className = 'mt-2 p-3 border rounded position-relative';
    vertexContainer.style.maxHeight = '400px';   // Max height for scrollable content
    vertexContainer.style.overflowY = 'auto';    // Vertical scroll bar
    vertexContainer.style.background = '#f9f9f9';
    vertexContainer.style.border = '1px solid #ddd';

    // Add the title with a close button
    const panelTitle = document.createElement('div');
    panelTitle.className = 'd-flex justify-content-between align-items-center';
    panelTitle.innerHTML = `
        <h6 class="m-0">Vertex Information (${vertices.length} Vertices)</h6>
    `;

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'btn-close vertexes-close position-absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', closever);
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';

    // Close button event listener
    closeButton.addEventListener('click', () => {
        vertexContainer.remove();
    });

    // Append close button to title
    panelTitle.appendChild(closeButton);

    // Create the table content
    let vertexTableContent = `
        <table class="table table-bordered table-striped mt-2">
            <thead class="table-dark">
                <tr>
                    <th>Vertex Number</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                </tr>
            </thead>
            <tbody>
    `;

    vertices.forEach((vertex, index) => {
        vertexTableContent += `
            <tr onclick="zoomToVertex(${vertex[0]}, ${vertex[1]})" style="cursor: pointer;">
                <td>${index + 1}</td>
                <td>${vertex[1].toFixed(6)}</td>
                <td>${vertex[0].toFixed(6)}</td>
            </tr>
        `;
    });

    vertexTableContent += `
            </tbody>
        </table>
    `;

    // Append the title and table content
    vertexContainer.appendChild(panelTitle);

    const infoContent = document.createElement('div');
    infoContent.innerHTML = vertexTableContent;
    vertexContainer.appendChild(infoContent);

    // Insert the vertex container below the .info-icons div
    iconSection.insertAdjacentElement('afterend', vertexContainer);
}


// Utility function to extract vertices and remove the last point if it's a duplicate (Polygon/MultiPolygon)
function extractVertices(geojsonGeom) {
    const vertices = [];
    const coordinates = geojsonGeom.coordinates;

    if (geojsonGeom.type === 'Polygon' || geojsonGeom.type === 'MultiPolygon') {
        const flattenedCoords = geojsonGeom.type === 'Polygon' ? [coordinates] : coordinates;

        flattenedCoords.forEach((polygon) => {
            polygon.forEach((ring) => {
                ring.forEach((coord, index) => {
                    if (index !== ring.length - 1) { // Skip last point to avoid redundancy
                        vertices.push(coord);
                    }
                });
            });
        });
    } else if (geojsonGeom.type === 'LineString' || geojsonGeom.type === 'MultiLineString') {
        const lines = geojsonGeom.type === 'LineString' ? [coordinates] : coordinates;
        lines.forEach((line) => {
            line.forEach((coord) => {
                vertices.push(coord);
            });
        });
    } else if (geojsonGeom.type === 'Point') {
        vertices.push(coordinates);
    }

    return vertices;
}

// Function to clear the labels and remove the vertex layer from the map
function clearVertexLabels() {
    if (vertexLayer) {
        map.removeLayer(vertexLayer); // Remove the layer containing the vertex features
        vertexLayer = null; // Clear the reference to the layer
    }

    // Clear the info panel content
    const panel = document.getElementById('vertex-info-panel');
    panel.style.display = 'none';
    const infoContent = document.getElementById('vertex-info-content');
    infoContent.innerHTML = '';
    const panelTitle = document.getElementById('vertex-info-title');
    panelTitle.innerHTML = 'Vertex Information';
}

// Function to close the info panel when the close button is clicked
function closeInfoPanel() {
    const panel = document.getElementById('vertex-info-panel');
    panel.style.display = 'none';  // Hide the panel
    clearVertexLabels();  // Remove the vertex labels (optional)
}

// Function to zoom to the vertex with dynamic zoom level
function zoomToVertex(longitude, latitude) {
    const currentCenter = ol.proj.toLonLat(map.getView().getCenter());
    const distance = getDistance(currentCenter, [longitude, latitude]); // Get distance between current center and target vertex

    // Set a dynamic zoom level based on distance
    let zoomLevel;
    if (distance < 500) {
        zoomLevel = 20; // Very close, high zoom
    } else if (distance < 1000) {
        zoomLevel = 18; // Close
    } else if (distance < 5000) {
        zoomLevel = 16; // Medium
    } else {
        zoomLevel = 14; // Far away, low zoom
    }

    // Convert the target vertex to map projection
    const coordinate = ol.proj.fromLonLat([longitude, latitude]);

    // Animate the zoom and center to the target vertex
    map.getView().animate({
        center: coordinate,
        zoom: zoomLevel,
        duration: 1000 // Zoom duration
    });

    // Highlight the vertex on the map
    highlightVertex(coordinate);
}

// Function to calculate the distance (in meters) between two points
function getDistance(coord1, coord2) {
    const from = ol.proj.fromLonLat(coord1); // Convert to map projection
    const to = ol.proj.fromLonLat(coord2);
    const line = new ol.geom.LineString([from, to]);
    return line.getLength(); // Returns the distance in meters
}

// Function to highlight the vertex with a distinct style
function highlightVertex(coordinate) {
    // Create a feature for the vertex
    const vertexFeature = new ol.Feature({
        geometry: new ol.geom.Point(coordinate)
    });

    // Apply a distinct style to highlight the vertex
    vertexFeature.setStyle(
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({ color: 'yellow' }), // Highlight color
                stroke: new ol.style.Stroke({ color: 'black', width: 2 })
            })
        })
    );

    // Create a source and layer for the highlighted vertex
    const highlightSource = new ol.source.Vector({
        features: [vertexFeature]
    });

    const highlightLayer = new ol.layer.Vector({
        source: highlightSource,
        zIndex: 1008 // Higher layer for visibility
    });

    // Add the highlight layer to the map
    map.addLayer(highlightLayer);

    // Remove the highlight after 1.5 seconds (adjust as needed)
    setTimeout(() => {
        map.removeLayer(highlightLayer);
    }, 1500);
}

/** Areg Info Panel Creation Start*/

function openAregInfo(data) {
    $(".error-message").empty().hide();
    document.getElementById('vertex-info-container')?.remove();
    document.getElementById('fmb-sketch-info-panel')?.remove();
    document.getElementById('thematic-info-container')?.remove();
    document.getElementById('JSB-info-container')?.remove();
    document.getElementById('igr-info-container')?.remove();

    let sub_division_numbers = '';
    var lapad_district_codes = LpadAdding(data.district_code,'district');
    var lapad_taluk_codes = LpadAdding(data.taluk_code,'taluk');

    if (data.rural_urban === "rural") {
        verifySubDivision(data)
        .then(result => {
            
            $("#verifiedSubDivision").val('');
            if (result.success == 1) {
                if (result.data && result.data.length >= 1) {
                    sub_division_numbers = data.is_fmb == 1 ? ($("#subDivs").text() != null ? $("#subDivs").text() : '-') : '-';
                } else {
                    sub_division_numbers = data.is_fmb == 1 ? ($("#subDivs").text() != null ? $("#subDivs").text() : '-') : '-';

                    const params = {
                        district_code: lapad_district_codes,
                        taluk_code: lapad_taluk_codes,
                        village_code: data.village_code,
                        survey_number: data.survey_number,
                        sub_division_number: sub_division_numbers,
                        land_type: data.rural_urban,
                        code_type: ADMIN_CODE_TYPE,
                        search_type: AREG_SEARCH_TYPE
                    };
                    fetchAreg(params);
                }
            } else if (result.success == 2) {
                if (result.count > 0 && result.message == 'Sub division Details Found') {
                    if(result.data.length == 1){
                        $("#subDivs").text(result.data.subdiv_no);
                        sub_division_numbers = data.is_fmb == 1 ? ($("#subDivs").text() != null ? $("#subDivs").text() : '-') : '-';

                        const params = {
                            district_code: lapad_district_codes,
                            taluk_code: lapad_taluk_codes,
                            village_code: data.village_code,
                            survey_number: data.survey_number,
                            sub_division_number: sub_division_numbers,
                            land_type: data.rural_urban,
                            code_type: ADMIN_CODE_TYPE,
                            search_type: AREG_SEARCH_TYPE
                        };
                        fetchAreg(params);
                    }else{
                        generateDropdown(result);
                        $("#verifiedSubDivision").val('no_subdivision_areg');

                        // Attach an event listener to wait for user selection
                    
                        sub_division_numbers = $("#subdivisionDropdown").val();
                        if(sub_division_numbers != ''){
                            const params = {
                                district_code: data.district_code,
                                taluk_code: lapad_taluk_codes,
                                village_code: data.village_code,
                                survey_number: data.survey_number,
                                sub_division_number: sub_division_numbers,
                                land_type: data.rural_urban,
                                code_type: ADMIN_CODE_TYPE,
                                search_type: AREG_SEARCH_TYPE
                            };
                            fetchAreg(params);
                            // Get reference to the dropdown and its parent
                            const dropdown = document.getElementById("subdivisionDropdown");
                            const selectedValue = dropdown.options[dropdown.selectedIndex].text; // or .value if needed

                            // Create a new span element
                            const span = document.createElement("span");
                            span.id = "subDivs";
                            span.textContent = selectedValue !== "Select Subdivision" ? selectedValue : ""; // Set selected value

                            // Replace dropdown with span
                            dropdown.parentNode.replaceChild(span, dropdown);

                        }else{
                            // alert('Please select the sub division dropdown and get the result');
                            showToast('info', `Please select the sub division dropdown and get the result`)
                            $("#subdivisionid #subDivs").remove();

                            let dropdown = $("#subdivisionDropdown");
                            dropdown.focus();

                            // Add animation class
                            dropdown.addClass("animated-border");

                            // Remove animation after selection
                            dropdown.on("change", function () {
                                $(this).removeClass("animated-border");
                            });
                        }
                    }
                    
                        
                }
            } else {
                console.log('No sub divisions found in Areg');
                $(".error-message").empty().text('No sub divisions found in Areg').show();
            }
        })
        .catch(error => {
            console.error("Request failed:", error);
        });
    } else {
        const urbanParams = {
            district_code: data.district_code,
            taluk_code: lapad_taluk_codes,
            town_code: data.revenue_town_code,
            ward_code: data.firka_ward_number ? data.firka_ward_number : 0,
            block_code: data.urban_block_number,
            survey_number: data.survey_number,
            sub_division_number: data.is_fmb == 1 ? (data.sub_division != null ? data.sub_division : 0) : 0,
        };
        var landType = data.rural_urban;
        $.ajax({
            url: `${BASE_URL}/v1/tamil_nillam_urban_ownership`,
            method: 'POST',
            headers: { 'X-APP-NAME': 'demo' },
            data: urbanParams,
            success: function (response) {
                if (response.success == 1) {
                    populateInfoPanel(response,landType);
                } else {
                    console.error(response.message);
                    $(".error-message").empty().text(response.message).show();
                }
            },
            error: function (xhr, status, error) {
                console.error('Error in fetching AREG - ', error);
            }
        });
    }
}


function fetchAreg(params){
    $.ajax({
        url: `${AREG_SEARCH_URL}`,
        method: 'POST',
        headers: { 'X-APP-NAME': 'demo' },
        data: params,
        success: function (response) {
            if (response.success) {
                if(response.success == 1){
                    $(".error-message").empty().hide();
                    const responseData = response;
                    populateInfoPanel(responseData);
                }else{
                    $(".error-message").empty().text(response.message).show();
                }
            } else {
                console.error(response.message);
                $(".error-message").empty().text(response.message).show();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error in fetching AREG - ', error);
        }
    });
}

function populateInfoPanel(response,landType) {
    $(".error-message").empty();

    document.getElementById('vertex-info-container')?.remove();
    document.getElementById('igr-info-container')?.remove();
    if(landType != 'urban'){
        if (response.success === 1) {
        
            
            const landDetail = response.data.land_detail;
            const ownershipDetails = response.data.ownership_detail;

            // Select the .info-icons div
            const iconSection = document.querySelector('.info-icons');

            // Remove existing tab container if it exists
            const existingTabContainer = document.getElementById('areg-tab-container');
            if (existingTabContainer) {
                existingTabContainer.remove();
            }

            // Create the tab container
            const tabContainer = document.createElement('div');
            tabContainer.id = 'areg-tab-container';
            tabContainer.className = 'mt-1 position-relative';

            // Create close button
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;';
            closeButton.className = 'btn-close vertex-close position-absolute';
            closeButton.style.top = '0px';
            closeButton.style.right = '10px';
            closeButton.style.fontSize = '22px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.border = 'none';
            closeButton.style.background = 'transparent';
            closeButton.style.padding = '0px';

            // Close button event listener
            closeButton.addEventListener('click', () => {
                tabContainer.remove();
            });

            // Create tab navigation
            const tabNav = document.createElement('ul');
            tabNav.className = 'nav nav-tabs';
            tabNav.innerHTML = `
                <li class="nav-item">
                    <button class="nav-link active" id="ownership-tab" data-bs-toggle="tab" 
                        data-bs-target="#ownership" type="button" role="tab" aria-controls="ownership" aria-selected="true">
                        Ownership Details
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" id="land-tab" data-bs-toggle="tab" 
                        data-bs-target="#land" type="button" role="tab" aria-controls="land" aria-selected="false">
                        Land Details
                    </button>
                </li>
            `;

            // Create the tab content container with scrollable area
            const tabContent = document.createElement('div');
            tabContent.className = 'tab-content mt-2';
            tabContent.style.maxHeight = '300px';  // Set max height
            tabContent.style.overflowY = 'auto';   // Add vertical scroll bar
            tabContent.style.background = '#f9f9f9';
            tabContent.style.border = '1px solid #ddd';

            // Ownership Details Tab (first tab)
            const ownershipTabPane = document.createElement('div');
            ownershipTabPane.className = 'tab-pane fade show active';
            ownershipTabPane.id = 'ownership';
            ownershipTabPane.role = 'tabpanel';
            ownershipTabPane.innerHTML = `
                <table class="table table-bordered table-striped mt-2">
                    <thead class="table-dark">
                        <tr><th>#</th><th>Owner</th><th>Relation</th></tr>
                    </thead>
                    <tbody id="ownership-details-table"></tbody>
                </table>
            `;

            // Land Details Tab (second tab)
            const landTabPane = document.createElement('div');
            landTabPane.className = 'tab-pane fade';
            landTabPane.id = 'land';
            landTabPane.role = 'tabpanel';
            landTabPane.innerHTML = `
                <table class="table table-bordered table-striped mt-2">
                    <thead class="table-dark">
                        <tr><th>Field</th><th>Value</th></tr>
                    </thead>
                    <tbody id="land-details-table"></tbody>
                </table>
            `;

            // Append elements
            tabContainer.appendChild(closeButton); // Add close button to container
            tabContainer.appendChild(tabNav);
            tabContainer.appendChild(tabContent);
            tabContent.appendChild(ownershipTabPane);
            tabContent.appendChild(landTabPane);

            // Insert the tab section below the .info-icons div
            iconSection.insertAdjacentElement('afterend', tabContainer);

            // Fields to Exclude
            const excludedFields = [
                "districtCode", "talukCode", "villCode", 
                "surveyNo", "subdivNo", "osurveyNo"
            ];

            // Populate Land Details Table excluding specified fields
            const landDetailsTable = document.getElementById("land-details-table");
            landDetailsTable.innerHTML = ''; // Clear previous data
            var formatedKey = '';
            for (const [key, value] of Object.entries(landDetail)) {
                if (!excludedFields.includes(key)) {
                    // Special case: combine govtPriEng + govtPriTamil as "Land Type"
                    if (key === "govtPriEng") {
                        const tamil = landDetail["govtPriTamil"];
                        const tamilValue = tamil !== null && tamil.trim() !== "" ? tamil : "-";
                        const combined = `${value} / ${tamilValue}`;
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>Land Type</td>
                            <td>${combined}</td>
                        `;
                        landDetailsTable.appendChild(row);
                        continue;
                    }
            
                    // Skip govtPriTamil since it's combined
                    if (key === "govtPriTamil") {
                        continue;
                    }
            
                    // Special case: Govt Pri Code mapping
                    // if (key === "govtPriCode") {
                    //     let codeText = "-";
                    //     if (value === "1" || value === 1) codeText = "Government";
                    //     else if (value === "2" || value === 2) codeText = "Private";
            
                    //     const row = document.createElement("tr");
                    //     row.innerHTML = `
                    //         <td>Govt Pri Code</td>
                    //         <td>${codeText}</td>
                    //     `;
                    //     landDetailsTable.appendChild(row);
                    //     continue;
                    // }
            
                    // Default value formatting
                    let displayValue = "-";
                    if (typeof value === "boolean") {
                        displayValue = value ? "Yes" : "No";
                    } else if (value !== null && String(value).trim() !== "") {
                        displayValue = value;
                    }
            
                    const formattedKey = addSpaceBeforeCaps(key);
            
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${formattedKey}</td>
                        <td>${displayValue}</td>
                    `;
                    landDetailsTable.appendChild(row);
                }
            }
            

            // Populate Ownership Details Table
            const ownershipDetailsTable = document.getElementById("ownership-details-table");
            ownershipDetailsTable.innerHTML = ''; // Clear previous data
            if (ownershipDetails.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td colspan="4" style="text-align: center;">No owners found</td>
                `;
                ownershipDetailsTable.appendChild(row);
            } else {
                ownershipDetails.forEach((owner, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${owner.Owner.trim()}</td>
                        <td>${owner.Relative.trim()} அவர்களின் ${owner.Relation.trim()} </td>
                    `; 
                    ownershipDetailsTable.appendChild(row);
                });
            }
        
        } else {
            closeAregPanel();
            // alert("No Ownership Details Found for the Selected Land Parcel");
            $(".error-message").empty().text('No Ownership Details Found for the Selected Land Parcel').show();
        }
    }else{
        $(".error-message").empty();
        if(response.data != 'Land Detail is Not Found'){
            const landDetail = response.data.UaregData || {};  // Corrected data path for land details
            let ownershipDetailsRaw = response.data.UchittaNatham.owner ? response.data.UchittaNatham.owner : '-';
            let ownershipDetails = [];

            // Select the .info-icons div
            const iconSection = document.querySelector('.info-icons');

            // Remove existing tab container if it exists
            const existingTabContainer = document.getElementById('areg-tab-container');
            if (existingTabContainer) {
                existingTabContainer.remove();
            }

            // Create the tab container
            const tabContainer = document.createElement('div');
            tabContainer.id = 'areg-tab-container';
            tabContainer.className = 'mt-1 position-relative';

            // Create close button
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;';
            closeButton.className = 'btn-close vertex-close position-absolute';
            closeButton.style.top = '0px';
            closeButton.style.right = '10px';
            closeButton.style.fontSize = '22px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.border = 'none';
            closeButton.style.background = 'transparent';
            closeButton.style.padding = '0px';

            // Close button event listener
            closeButton.addEventListener('click', () => {
                tabContainer.remove();
            });

            // Create tab navigation
            const tabNav = document.createElement('ul');
            tabNav.className = 'nav nav-tabs';
            tabNav.innerHTML = `
                <li class="nav-item">
                    <button class="nav-link active" id="ownership-tab" data-bs-toggle="tab" 
                        data-bs-target="#ownership" type="button" role="tab" aria-controls="ownership" aria-selected="true">
                        Ownership Details
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" id="land-tab" data-bs-toggle="tab" 
                        data-bs-target="#land" type="button" role="tab" aria-controls="land" aria-selected="false">
                        Land Details
                    </button>
                </li>
            `;

            // Create the tab content container
            const tabContent = document.createElement('div');
            tabContent.className = 'tab-content mt-2';
            tabContent.style.maxHeight = '300px';
            tabContent.style.overflowY = 'auto';
            tabContent.style.background = '#f9f9f9';
            tabContent.style.border = '1px solid #ddd';

            // Ownership Tab
            const ownershipTabPane = document.createElement('div');
            ownershipTabPane.className = 'tab-pane fade show active';
            ownershipTabPane.id = 'ownership';
            ownershipTabPane.role = 'tabpanel';
            ownershipTabPane.innerHTML = `
                <table class="table table-bordered table-striped mt-2">
                    <thead class="table-dark">
                        <tr><th>#</th><th>Owner Details</th></tr>
                    </thead>
                    <tbody id="ownership-details-table"></tbody>
                </table>
            `;

            // Land Tab
            const landTabPane = document.createElement('div');
            landTabPane.className = 'tab-pane fade';
            landTabPane.id = 'land';
            landTabPane.role = 'tabpanel';
            landTabPane.innerHTML = `
                <table class="table table-bordered table-striped mt-2">
                    <thead class="table-dark">
                        <tr><th>Field</th><th>Value</th></tr>
                    </thead>
                    <tbody id="land-details-table"></tbody>
                </table>
            `;

            // Append all
            tabContainer.appendChild(closeButton);
            tabContainer.appendChild(tabNav);
            tabContainer.appendChild(tabContent);
            tabContent.appendChild(ownershipTabPane);
            tabContent.appendChild(landTabPane);
            iconSection.insertAdjacentElement('afterend', tabContainer);

            // Fields to exclude
            const excludedFields = [
                "Taluk", "Town", "Ward", "Block", "District_t",
                "Taluk_t","Town_t","Ward_t","Block_t","SurveyNo","SubDivNo",
                "SourceOfIrrigationAndClass","District","Street"
            ];

            // Populate Land Details
            const landDetailsTable = document.getElementById("land-details-table");
            landDetailsTable.innerHTML = '';
            for (const [key, value] of Object.entries(landDetail)) {
                if (!excludedFields.includes(key)) {
                    if (key === "govtPriEng") {
                        const tamil = landDetail["govtPriTamil"];
                        const combined = `${value} / ${(tamil && tamil.trim()) || '-'}`;
                        const row = document.createElement("tr");
                        row.innerHTML = `<td>Land Type</td><td>${combined}</td>`;
                        landDetailsTable.appendChild(row);
                        continue;
                    }
                    if (key === "govtPriTamil") continue;

                    let displayValue = "-";
                    if (typeof value === "boolean") {
                        displayValue = value ? "Yes" : "No";
                    } else if (value !== null && String(value).trim() !== "") {
                        displayValue = value;
                    }

                    const formattedKey = addSpaceBeforeCaps(key);
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${formattedKey}</td><td>${displayValue}</td>`;
                    landDetailsTable.appendChild(row);
                }
            }

            // Populate Ownership Details
            const owners = ownershipDetailsRaw
            .replace(/\[|\]/g, '') // Remove square brackets
            .split(','); // Split only by commas

            const ownershipDetailsTable = document.getElementById("ownership-details-table");
            ownershipDetailsTable.innerHTML = '';

            // Check if owners are found
            if (owners.length === 0 || owners[0].trim() === '') {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="4" style="text-align: center;">No owners found</td>`;
                ownershipDetailsTable.appendChild(row);
            } else {
                owners.forEach((owner, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${owner.trim()}</td>
                    `;
                    ownershipDetailsTable.appendChild(row);
                });
            }
        }else{
            $(".error-message").empty().text('Land Detail is Not Found').show();
        }
        
    }
    
}

function showTabContent(tabId) {
    const tabs = document.querySelectorAll("#areg-info-panel .tab-content");
    tabs.forEach((tab) => {
        tab.style.display = tab.id === tabId ? "block" : "none";
    });

    const tabButtons = document.querySelectorAll("#areg-info-panel .tabs button");
    tabButtons.forEach((button) => {
        button.classList.toggle("active", button.textContent === tabId.replace('-', ' '));
    });
}


// Function to Close the Info Panel
function closeAregPanel() {
    const infoPanel = document.getElementById("areg-info-panel");
    if (infoPanel) {
        infoPanel.style.display = "none";
    }
}

/** Areg Info Panel Creation End */

/** FMB Sketch Info Panel Creation Start*/

function openFMBSketchInfo(data) {
    clearVertexLabels()
    $(".error-message").empty().hide();
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('vertex-info-container')?.remove();
    document.getElementById('thematic-info-container')?.remove();
    document.getElementById('JSB-info-container')?.remove();
    document.getElementById('igr-info-container')?.remove();
    var lapad_taluk_codes = LpadAdding(data.taluk_code,'taluk');
    var lapad_town_codes = LpadAdding(data.revenue_town_code,'town');
    var lapad_ward_codes = LpadAdding(data.firka_ward_number,'ward');
    var lapad_block_codes = LpadAdding(data.urban_block_number,'block');
    let params={};
    if(data.rural_urban == 'rural'){
        params = {
            districtCode: data.district_code,
            talukCode: lapad_taluk_codes,
            villageCode: data.village_code,
            surveyNumber: data.survey_number,
            subdivisionNumber: data.is_fmb == 1 ? ($("#subDivs").text() != null ? $("#subDivs").text() : '') : '',
            type: data.rural_urban,
        };
    }else if(data.rural_urban == 'urban'){
        params = {
            districtCode: data.district_code,
            talukCode: lapad_taluk_codes,
            townCode:lapad_town_codes,
            wardCode:lapad_ward_codes,
            blockCode:lapad_block_codes,
            surveyNumber: data.survey_number,
            subdivisionNumber: data.is_fmb == 1 ? ($("#subDivs").text() != null ? $("#subDivs").text() : '') : '',
            type: data.rural_urban,
        };
    }
    

    $.ajax({
        url: `${FMB_SKETCH_URL}`,
        method: 'POST',
        data: params,
        success: function (response) {
            if (response.success == 1) {
                // Decode base64 data
                try {
                    const fileContent = atob(response.data);
                    const byteArray = new Uint8Array(fileContent.length);

                    // Convert the base64 string back to a binary file
                    for (let i = 0; i < fileContent.length; i++) {
                        byteArray[i] = fileContent.charCodeAt(i);
                    }
                    // Create a Blob from the binary data
                    const blob = new Blob([byteArray], { type: 'application/pdf' });

                    // Check if the Blob is a valid PDF
                    const fileReader = new FileReader();
                    fileReader.onloadend = function () {
                        try {
                            // Check the file type by reading the first few bytes (PDF signature)
                            const byteArray = new Uint8Array(fileReader.result);
                            const pdfSignature = '%PDF-';

                            if (String.fromCharCode.apply(null, byteArray.slice(0, 5)) !== pdfSignature) {
                                throw new Error('Invalid PDF');
                            }

                            // Create PDF URL
                            const pdfURL = URL.createObjectURL(blob);
                            displayFMBSketch(pdfURL);
                            

                        } catch (error) {
                            console.error("Caught error in onloadend:", error);
                            // alert('FMB Sketch could not be downloaded for visualization. Please contact the Revenue Surveyor in taluk office.');

                            $(".error-message").empty().text('FMB Sketch could not be downloaded for visualization. Please contact the Revenue Surveyor in taluk office.').show();

                        }
                    };

                    // Read the blob content as ArrayBuffer to check for PDF signature
                    fileReader.readAsArrayBuffer(blob);
                } catch (error) {
                    // Handle invalid base64 or PDF error
                    // alert('FMB Sketch could not be downloaded for visualization. Please contact the Revenue Surveyor in taluk office.');
                    $(".error-message").empty().text('FMB Sketch could not be downloaded for visualization. Please contact the Revenue Surveyor in taluk office.').show();
                    console.error('Error while loading PDF:', error);
                    // You can display a custom message here, e.g., "Invalid PDF data."
                }
            } else {
                // alert(response.message);
                $(".error-message").empty().text(response.message).show();
            }
        },
        error: function (xhr, status, error) {
            // alert('Unable to fetch data from NIC. ', error);
            $(".error-message").empty().text('Unable to fetch data from NIC. ', error).show();
        }
    });
}

function displayFMBSketch(fmbSketchUrl) {
    // Remove any existing FMB sketch panel
    document.getElementById('fmb-sketch-info-panel')?.remove();
    
    // Select the .info-icons div
    const iconSection = document.querySelector('.info-icons');

    // Create the container for the FMB sketch info
    const sketchContainer = document.createElement('div');
    sketchContainer.id = 'fmb-sketch-info-panel';
    sketchContainer.className = 'mt-2 p-3 border rounded position-relative bg-white';
    sketchContainer.style.maxHeight = '430px';
    sketchContainer.style.overflow = 'hidden';
    sketchContainer.style.border = '1px solid #ddd';

    // Add the title with a close button and fullscreen button
    const panelTitle = document.createElement('div');
    panelTitle.className = 'd-flex  align-items-center pdfheader';
    panelTitle.innerHTML = `<h6 class="m-0">FMB Sketch</h6>`;

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'btn-close vertex-close position-absolute';
    closeButton.style.top = '0px';
    closeButton.style.right = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.fontSize = '30px';

    // Close button event listener
    closeButton.addEventListener('click', () => {
        sketchContainer.remove();
    });

    // Fullscreen button
    const fullscreenButton = document.createElement('button');
    fullscreenButton.innerHTML = '⛶'; // Unicode for fullscreen icon
    fullscreenButton.className = 'btn btn-sm btn-outline-secondary ms-2';
    fullscreenButton.style.border = 'none';
    fullscreenButton.style.background = 'transparent';
    fullscreenButton.style.cursor = 'pointer';
    fullscreenButton.style.fontSize = '24px';
    fullscreenButton.style.left = '116px';
    fullscreenButton.style.position = 'relative';

    // Create the iframe for the FMB Sketch
    const sketchFrame = document.createElement('iframe');
    sketchFrame.id = 'fmb-sketch-viewer';
    sketchFrame.style.width = '100%';
    sketchFrame.style.height = '350px';
    sketchFrame.style.border = 'none';
    sketchFrame.src = fmbSketchUrl;
    sketchFrame.allowFullscreen = true;

    // Function to enter fullscreen
    function enterFullscreen() {
        if (sketchFrame.requestFullscreen) {
            sketchFrame.requestFullscreen();
        } else if (sketchFrame.mozRequestFullScreen) { // Firefox
            sketchFrame.mozRequestFullScreen();
        } else if (sketchFrame.webkitRequestFullscreen) { // Chrome, Safari
            sketchFrame.webkitRequestFullscreen();
        } else if (sketchFrame.msRequestFullscreen) { // IE/Edge
            sketchFrame.msRequestFullscreen();
        }
    }

    // Function to exit fullscreen
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }

    // Fullscreen button event listener
    fullscreenButton.addEventListener('click', enterFullscreen);

    // Listen for fullscreen change and ESC key
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            console.log('Exited fullscreen mode');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.fullscreenElement) {
            exitFullscreen();
        }
    });

    // Append close & fullscreen button
    panelTitle.appendChild(fullscreenButton);
    panelTitle.appendChild(closeButton);

    // Append the title and iframe content
    sketchContainer.appendChild(panelTitle);
    sketchContainer.appendChild(sketchFrame);

    // Insert the sketch container below the .info-icons div
    iconSection.insertAdjacentElement('afterend', sketchContainer);
}

function closeFMBSketchPanel() {
    const infoPanel = document.getElementById("fmb-sketch-info-panel");
    if (infoPanel) {
        const iframe = document.getElementById("fmb-sketch-viewer");
        infoPanel.style.display = "none";
        iframe.src = ""; // Clear the iframe content
    }

}


/** FMB Sketch Info Panel Creation End*/

/** IGR Info Panel */
function openIGRInfo(data, lat, long) {
    clearVertexLabels()
    $(".error-message").empty().hide();
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('vertex-info-container')?.remove();
    document.getElementById('fmb-sketch-info-panel')?.remove();
    document.getElementById('thematic-info-container')?.remove();
    document.getElementById('JSB-info-container')?.remove();

    if (data.rural_urban === "rural") {
        const params = {
            latitude: lat,
            longitude: long,
            layer_name: IGR_SERVICE_LAYER_NAME,
        };

        $.ajax({
            url: `${IGR_URL}`,
            method: 'POST',
            headers: { 'X-APP-ID': 'te$t' },
            data: params,
            success: function (response) {
                if (response.success) {
                    // Select the .info-icons div
                    const iconSection = document.querySelector('.info-icons');

                    // Remove any existing IGR info container
                    document.getElementById('igr-info-container')?.remove();

                    // Create the container for IGR info
                    const igrContainer = document.createElement('div');
                    igrContainer.id = 'igr-info-container';
                    igrContainer.className = 'mt-1 p-3 border rounded position-relative';
                    igrContainer.style.maxHeight = '400px';   // Max height for scrollable content
                    igrContainer.style.overflowY = 'auto';    // Vertical scroll bar
                    igrContainer.style.background = '#f9f9f9';
                    igrContainer.style.border = '1px solid #ddd';
                    igrContainer.style.marginBottom = '8px';

                    // Add the title with a close button
                    const panelTitle = document.createElement('div');
                    panelTitle.className = 'd-flex justify-content-between align-items-center';
                    panelTitle.innerHTML = `
                        <h6 class="m-0">Guide Line Value from Registration Department</h6>
                    `;

                    // Create close button
                    const closeButton = document.createElement('button');
                    closeButton.innerHTML = '&times;';
                    closeButton.className = 'btn-close vertex-close position-absolute pdf-close';
                    closeButton.style.top = '5px';
                    closeButton.style.right = '10px';
                    closeButton.style.fontSize = '18px';
                    closeButton.style.cursor = 'pointer';
                    closeButton.style.border = 'none';
                    closeButton.style.background = 'transparent';

                    // Close button event listener
                    closeButton.addEventListener('click', () => {
                        igrContainer.remove();
                    });

                    // Append close button to panel title
                    panelTitle.appendChild(closeButton);

                    // Append the title to the container
                    igrContainer.appendChild(panelTitle);

                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'igr-card-content mt-2';

                    let hasValidData = false; // Flag to check if there's valid data

                    // Function to format rupee values with commas
                    const formatRupees = (amount) =>
                        `₹${new Intl.NumberFormat('en-IN').format(amount)}`;

                    // Loop through the response data to create cards for each field
                    response.data.forEach(item => {
                        const fields = [
                            { label: "Land Type", value: item.land_name },
                            { label: "Classification of Land Type", value: item.land_name_type },
                            { label: "Metric Rate", value: item.metric_rate ? formatRupees(item.metric_rate) : null },
                            { label: "Price per Hectare", value: item.price_per_hect ? formatRupees(item.price_per_hect) : null },
                        ];

                        fields.forEach(field => {
                            if (field.value) {
                                hasValidData = true; // At least one field has a value
                                const card = document.createElement("div");
                                card.classList.add("igr-card", "p-2", "mb-2", "border", "rounded");
                                card.style.background = "#fff";
                                card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

                                card.innerHTML = `
                                    <div>
                                        <strong>${field.label}:</strong>
                                    </div>
                                    <div>${field.value}</div>
                                `;

                                // Append the card to the content div
                                contentDiv.appendChild(card);
                            }
                        });
                    });

                    // Show the info panel only if there is valid data
                    if (hasValidData) {
                        igrContainer.appendChild(contentDiv);

                        // Insert the IGR container below the .info-icons div
                        iconSection.insertAdjacentElement('afterend', igrContainer);
                        $(".error-message").empty().hide();
                    } else {
                        // alert("Guideline Value not found for the selected Land");
                        $(".error-message").empty().text('Guideline Value not found for the selected Land').show();
                    }
                } else {
                    console.error(response.message);
                    $(".error-message").empty().text(response.message).show();
                }
            },
            error: function (xhr, status, error) {
                console.error("Error in fetching IGR Land Value - ", error);
                $(".error-message").empty().text("Error in fetching IGR Land Value - ", error).show();
            }
        });
    } else {
        $(".error-message").empty().text('Urban in Progress').show();
    }
}

function loadThematicIconsFromJson() {
    clearVertexLabels();
    $(".error-message").empty().hide();
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('vertex-info-container')?.remove();
    document.getElementById('igr-info-container')?.remove();
    document.getElementById('JSB-info-container')?.remove();
    document.getElementById('fmb-sketch-info-panel')?.remove();
    document.getElementById('thematic-info-container')?.remove();

    const iconSection = document.querySelector('.info-icons');

    fetch(thematicJsonFilePath)
        .then(response => response.json())
        .then(data => {
            const thematicContainer = document.createElement('div');
            thematicContainer.id = 'thematic-info-container';
            thematicContainer.className = 'mt-1 p-3 border rounded position-relative';
            thematicContainer.style.maxHeight = '400px';
            thematicContainer.style.overflowY = 'auto';
            thematicContainer.style.background = '#f9f9f9';
            thematicContainer.style.border = '1px solid #ddd';
            thematicContainer.style.marginBottom = '8px';

            const panelTitle = document.createElement('div');
            panelTitle.className = 'd-flex justify-content-between align-items-center';
            panelTitle.innerHTML = `<h6 class="m-0">Thematic Information</h6>`;

            const closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;';
            closeButton.className = 'btn-close vertex-close position-absolute';
            closeButton.style.top = '5px';
            closeButton.style.right = '10px';
            closeButton.style.fontSize = '18px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.border = 'none';
            closeButton.style.background = 'transparent';
            closeButton.addEventListener('click', () => { thematicContainer.remove(); });

            panelTitle.appendChild(closeButton);
            thematicContainer.appendChild(panelTitle);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'thematic-icon-card-content mt-2 d-flex flex-wrap gap-2';

            let hasValidData = false;

            data.forEach(category => {
                category.layers.forEach(layer => {
                    hasValidData = true;

                    const card = document.createElement("div");
                    card.classList.add("thematic-icon-card", "p-2", "border", "rounded", "d-flex", "flex-column", "align-items-center");
                    card.style.background = "#fff";
                    card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    card.style.width = "50px";
                    card.style.height = "50px";
                    card.style.fontSize = "10px";
                    card.style.display = "flex";
                    card.style.flexDirection = "column";
                    card.title = layer.title; 
                    card.style.justifyContent = "center";
                    card.style.alignItems = "center";
                    card.style.textAlign = "center";

                    const iconSpan = document.createElement("span");

                    // Check if icon is emoji or image path
                    if (layer.icon?.endsWith('.png') || layer.icon?.endsWith('.jpg') || layer.icon?.includes('/')) {
                        const img = document.createElement("img");
                        img.src = layer.icon;
                        img.alt = layer.title;
                        img.style.width = "25px";
                        img.style.height = "25px";
                        iconSpan.appendChild(img);
                    } else {
                        iconSpan.style.fontSize = "16px";
                        iconSpan.innerText = layer.icon || "📌";
                    }

                    const textDiv = document.createElement("div");
                    textDiv.innerHTML = `<strong>${layer.name}</strong>`;

                    card.appendChild(iconSpan);
                    card.appendChild(textDiv);
                    contentDiv.appendChild(card);
                });
            });

            if (hasValidData) {
                thematicContainer.appendChild(contentDiv);
                iconSection.insertAdjacentElement('afterend', thematicContainer);
            } else {
                $(".error-message").text('No layer data available.').show();
            }
        })
        .catch(error => {
            console.error("Error loading JSON file:", error);
            $(".error-message").text('Error loading thematic data.').show();
        });
}



function JSBIconInfo(data, lat, long) {
    clearVertexLabels()
    $(".error-message").empty().hide();
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('vertex-info-container')?.remove();
    document.getElementById('igr-info-container')?.remove();
    document.getElementById('thematic-info-container')?.remove();
    document.getElementById('fmb-sketch-info-panel')?.remove();
    

    const iconSection = document.querySelector('.info-icons');
    document.getElementById('JSB-info-container')?.remove();

    const JSBContainer = document.createElement('div');
    JSBContainer.id = 'JSB-info-container';
    JSBContainer.className = 'mt-1 p-3 border rounded position-relative';
    JSBContainer.style.maxHeight = '400px';
    JSBContainer.style.overflowY = 'auto';
    JSBContainer.style.background = '#f9f9f9';
    JSBContainer.style.border = '1px solid #ddd';
    JSBContainer.style.marginBottom = '8px';

    const panelTitle = document.createElement('div');
    panelTitle.className = 'd-flex justify-content-between align-items-center';
    panelTitle.innerHTML = `<h6 class="m-0">Jurisdiction Boundaries Information For</h6>`;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'btn-close vertex-close position-absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.addEventListener('click', () => { JSBContainer.remove(); });

    panelTitle.appendChild(closeButton);
    JSBContainer.appendChild(panelTitle);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'jsb-carousel-wrapper position-relative';

    // Left button
    const leftBtn = document.createElement('button');
    leftBtn.innerHTML = '&#10094;';
    leftBtn.className = 'jsb-scroll-left';
    leftBtn.style.position = 'absolute';
    leftBtn.style.left = '0';
    leftBtn.style.top = '50%';
    leftBtn.style.transform = 'translateY(-50%)';
    leftBtn.style.zIndex = '2';
    leftBtn.style.border = 'none';
    leftBtn.style.background = '#42abff';
    leftBtn.style.color = '#fff';
    leftBtn.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
    leftBtn.style.borderRadius = '50%';
    leftBtn.style.width = '30px';
    leftBtn.style.height = '30px';
    leftBtn.style.cursor = 'pointer';

    // Right button
    const rightBtn = document.createElement('button');
    rightBtn.innerHTML = '&#10095;';
    rightBtn.className = 'jsb-scroll-right';
    rightBtn.style.position = 'absolute';
    rightBtn.style.right = '0';
    rightBtn.style.top = '50%';
    rightBtn.style.transform = 'translateY(-50%)';
    rightBtn.style.zIndex = '2';
    rightBtn.style.border = 'none';
    rightBtn.style.color = '#fff';
    rightBtn.style.background = '#42abff';
    rightBtn.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
    rightBtn.style.borderRadius = '50%';
    rightBtn.style.width = '30px';
    rightBtn.style.height = '30px';
    rightBtn.style.cursor = 'pointer';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'JSB-icon-card-content d-flex gap-2';
    contentDiv.style.overflowX = 'auto';
    contentDiv.style.scrollBehavior = 'smooth';
    contentDiv.style.whiteSpace = 'nowrap';
    contentDiv.style.padding = '10px 30px'; // spacing for scroll buttons
    contentDiv.style.msOverflowStyle = 'none';  // IE 10+
    contentDiv.style.scrollbarWidth = 'none';  // Firefox
    contentDiv.style.overflowY = 'hidden';
    contentDiv.style.margin = '0 -15px';

    // Hide scrollbar (for Chrome)
    contentDiv.style.setProperty('::-webkit-scrollbar', 'display: none');

    contentDiv.addEventListener('wheel', e => {
        e.preventDefault();
        contentDiv.scrollLeft += e.deltaY;
    });

    let hasValidData = false;

    const fields = [
        
        { label: "Constituencies", icon: '<img src="assets/logo/tn-logo.png" class="jsb-dept-logo">' },
        { label: "Rural", icon: '<img src="assets/logo/tn-logo.png" class="jsb-dept-logo">' },
        { label: "Urban", icon: '<img src="assets/logo/tn-logo.png" class="jsb-dept-logo">' },
        { label: "Police", icon: '<img src="assets/logo/dept-logos/police.png" class="jsb-dept-logo">' },
        { label: "TANGEDCO", icon: '<img src="assets/logo/dept-logos/tangedco.png" class="jsb-dept-logo">' },
        { label: "Education", icon: '<img src="assets/logo/tn-logo.png" class="jsb-dept-logo">' },
        { label: "Forest", icon: '<img src="assets/logo/tn-logo.png" class="jsb-dept-logo">' },
        { label: "Registration", icon: '<img src="assets/logo/tn-logo.png" class="jsb-dept-logo">' },
        { label: "Highways", icon: '<img src="assets/logo/tn-logo.png" class="jsb-dept-logo">' },
        { label: "TASMAC", icon: '<img src="assets/logo/dept-logos/tasmac.png" class="jsb-dept-logo">' },
    ];

    fields.forEach(field => {
        hasValidData = true;
        const card = document.createElement("div");
        card.classList.add("JSB-icon-card", "p-2", "border", "rounded", "d-flex", "flex-column", "align-items-center");
        card.style.background = "#fff";
        card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        card.style.width = "70px";
        card.style.height = "70px";
        card.style.fontSize = "10px";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.justifyContent = "center";
        card.style.alignItems = "center";
        card.style.textAlign = "center";
        card.style.flex = "0 0 auto";
        card.innerHTML = `${field.icon || "📌"}<strong>${field.label}</strong>`;

        contentDiv.appendChild(card);
    });

    if (hasValidData) {
        scrollWrapper.appendChild(leftBtn);
        scrollWrapper.appendChild(contentDiv);
        scrollWrapper.appendChild(rightBtn);
        JSBContainer.appendChild(scrollWrapper);
        iconSection.insertAdjacentElement('afterend', JSBContainer);

        // Scroll button functionality
        leftBtn.addEventListener('click', () => {
            contentDiv.scrollLeft -= 150;
        });
        rightBtn.addEventListener('click', () => {
            contentDiv.scrollLeft += 150;
        });
    } else {
        // alert("No data available for the selected location.");
        $(".error-message").empty().text('No data available for the selected location.').show();
    }
}

function closeIGRInfoPanel(){
    const infoPanel = document.getElementById("igr-info-panel");
    if (infoPanel) {
        infoPanel.style.display = "none";
    }
    
}

// Layer configuration from JSON

const layerControl = document.getElementById('accordionPanelsStayOpenExample');
const layerControlThematic = document.getElementById('accordionPanelsStayOpenExampleThematic');
const layers = {};


// Fetch the JSON file and process its contents
// Fetch the first JSON file and process its contents
fetch(jsonFilePath)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON file');
        }
        return response.json();
    })
    .then(jsonData => {
        
        jsonData.forEach((category, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';

            const headerId = `header-${index}`;
            const collapseId = `collapse-${index}`;

            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="${headerId}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        ${category.category}
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}">
                    <div class="accordion-body">
                        <div class="listings"></div>
                    </div>
                </div>
            `;

            const listings = accordionItem.querySelector('.listings');

            category.layers.forEach((layerInfo) => {
                let layer;

                if (layerInfo.type === "wms") {
                    layer = new ol.layer.Tile({
                        source: new ol.source.TileWMS({
                            url: layerInfo.url,
                            params: layerInfo.params,
                            serverType: 'geoserver',
                        }),
                        opacity: layerInfo.defaultOpacity,
                        visible: layerInfo.defaultVisibility,
                    });
                    map.removeLayer(layer);
                    map.addLayer(layer);
                } else if (layerInfo.type === "xyz") {
                    layer = new ol.layer.Tile({
                        source: new ol.source.XYZ({
                            url: layerInfo.url,
                        }),
                        opacity: layerInfo.defaultOpacity,
                        visible: layerInfo.defaultVisibility,
                    });
                    
                    map.removeLayer(layer);
                    setTimeout(function () {
                    map.addLayer(layer);
                }, 1000);
                }
                
                layers[layerInfo.id] = layer;

                const label = document.createElement('label');
                label.className = 'd-block my-1';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = layerInfo.id;
                checkbox.checked = layerInfo.defaultVisibility;

                checkbox.addEventListener('change', (e) => {
                    
                    // if(e.target.checked == true && e.target.id == 'TNGIS_Basemap'){
                        map.removeLayer(layer);
                        map.addLayer(layer);
                    // }
                    layer.setVisible(e.target.checked);
                    updateAllLegends(jsonData);
                });

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${layerInfo.title}`));

                listings.appendChild(label);
            });

            layerControl.appendChild(accordionItem);
        });
        setTimeout(function(){
            updateAllLegends(jsonData);
        },200);
    })
    .catch(error => console.error('Error loading JSON:', error));


// Fetch the thematic JSON file and process its contents
fetch(thematicJsonFilePath)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON file');
        }
        return response.json();
    })
    .then(jsonData => {
        jsonData.forEach((category, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';

            const headerId = `thematic-header-${index}`;
            const collapseId = `thematic-collapse-${index}`;

            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="${headerId}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        ${category.category}
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}">
                    <div class="accordion-body">
                        <div class="listings"></div>
                    </div>
                </div>
            `;

            const listings = accordionItem.querySelector('.listings');

            category.layers.forEach((layerInfo) => {
                let layer;

                if (layerInfo.type === "wms") {
                    layer = new ol.layer.Tile({
                        source: new ol.source.TileWMS({
                            url: layerInfo.url,
                            params: layerInfo.params,
                            serverType: 'geoserver',
                        }),
                        opacity: layerInfo.defaultOpacity,
                        visible: layerInfo.defaultVisibility,
                        type: 'wms',
                        title:layerInfo.title,
                        layer_id:layerInfo.id,
                        category:category.category,
                        view:layerInfo.view

                    });
                } else if (layerInfo.type === "xyz") {
                    layer = new ol.layer.Tile({
                        source: new ol.source.XYZ({
                            url: layerInfo.url,
                        }),
                        opacity: layerInfo.defaultOpacity,
                        visible: layerInfo.defaultVisibility,
                    });
                }

                map.addLayer(layer);
                layers[layerInfo.id] = layer;

                const label = document.createElement('label');
                label.className = 'd-block my-1';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = layerInfo.id;
                checkbox.checked = layerInfo.defaultVisibility;

                checkbox.addEventListener('change', (e) => {
                    layer.setVisible(e.target.checked);
                    updateAllLegends(jsonData);
                });

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${layerInfo.title}`));

                listings.appendChild(label);
            });

            layerControlThematic.appendChild(accordionItem);
        });
        updateAllLegends(jsonData);
    })
    .catch(error => console.error('Error loading JSON:', error));


function updateAllLegends(layerConfig) {
    const legendContent = document.getElementById('legend-content');
    legendContent.innerHTML = ''; // Clear existing legends

    layerConfig.forEach((category) => {
        category.layers.forEach((layerInfo) => {
            let legendImage = null;
            let altText = "";
    
            if (layerInfo.type === "wms" && layers[layerInfo.id].getVisible()) {
                const resolution = map.getView().getResolution();
    
                let legendUrl = `${layerInfo.url}?REQUEST=GetLegendGraphic&VERSION=1.3.0&FORMAT=image/png&LAYER=${layerInfo.params.LAYERS}`;
                legendUrl += '&LEGEND_OPTIONS=forceLabels:on;fontColor:0xfffff;fontAntiAliasing:true&transparent=true';
                legendUrl += `&SCALE=${resolution}`;
    
                altText = `${layerInfo.title} Legend`;
                legendImage = document.createElement('img');
                legendImage.src = legendUrl;
                legendImage.alt = altText;
            } else if (layerInfo.type === "xyz" && layers[layerInfo.id].getVisible()) {
                altText = 'TNGIS - Cadastral Map';
                legendImage = document.createElement('img');
                legendImage.src = 'assets/icons/cadastral_map_legend.png';
                legendImage.alt = altText;
                legendImage.style.width = '140px';
            }
    
            if (legendImage) {
                const legendDiv = document.createElement('div');
    
                const legendLabel = document.createElement('div');
                legendLabel.textContent = altText;
                legendLabel.style.color = '#fff';
                legendLabel.style.fontSize = '10px';
    
                legendDiv.appendChild(legendLabel);
                legendDiv.appendChild(legendImage);
    
                legendContent.appendChild(legendDiv);
            }
        });
    });
    
    
}

// Clear Legend
function clearLegend() {
    const legendContent = document.getElementById('legend-content');
    legendContent.innerHTML = '';
}

document.addEventListener("DOMContentLoaded", function () {
    let rotationDegree = 0;
    const map = document.getElementById("map");

    // Apply smooth transition to the map
    map.style.transition = "transform 0.5s ease-in-out";

    // Rotate Right (+20 degrees)
    document.querySelector(".rotation-right").addEventListener("click", () => {
        rotationDegree += 20;
        map.style.transform = `rotate(${rotationDegree}deg)`;
    });

    // Rotate Left (-20 degrees)
    document.querySelector(".rotation-left").addEventListener("click", () => {
        rotationDegree -= 20;
        map.style.transform = `rotate(${rotationDegree}deg)`;
    });

    // Reset Rotation (0 degrees)
    document.getElementById("resetRotation").addEventListener("click", () => {
        rotationDegree = 0;
        map.style.transform = `rotate(0deg)`;
    });
});



// // Utility function to extract vertices from a GeoJSON geometry
// function extractVertices(geojsonGeom) {
//     const vertices = [];
//     const coordinates = geojsonGeom.coordinates;

//     if (geojsonGeom.type === 'Polygon' || geojsonGeom.type === 'MultiPolygon') {
//         // Flatten coordinates for MultiPolygon
//         const flattenedCoords = geojsonGeom.type === 'Polygon' ? [coordinates] : coordinates;

//         // Loop through each ring of the polygon
//         flattenedCoords.forEach((polygon) => {
//             polygon.forEach((ring) => {
//                 ring.forEach((coord) => {
//                     vertices.push(coord); // Push each vertex
//                 });
//             });
//         });
//     } else if (geojsonGeom.type === 'LineString' || geojsonGeom.type === 'MultiLineString') {
//         const lines = geojsonGeom.type === 'LineString' ? [coordinates] : coordinates;
//         lines.forEach((line) => {
//             line.forEach((coord) => {
//                 vertices.push(coord);
//             });
//         });
//     } else if (geojsonGeom.type === 'Point') {
//         vertices.push(coordinates);
//     }

//     return vertices;
// }


// Populate District Dropdown
async function loadDistrict(districtCode, talukCode = null, villageCode = null, surveyNumber = null, subdivision = null) {
    try {
        const response = await ajaxPromise({
            url: `${BASE_URL}/v2/admin_master_district`,
            method: 'GET',
            data: { 'request_type': 'district' },
            headers: { 'X-APP-NAME': 'demo' },
            dataType: 'json'
        });

        populateDropdown('district-dropdown', response, {
            defaultText: 'Select District',
            valueKey: 'district_code',
            textKey: 'district_english_name',
            errorCallback: (message) => showToast('error', message),
            preselectValue: districtCode,
            triggerChange: !!districtCode,
            onComplete: async () => {
                if (!districtCode) return;

                const talukResponse = await ajaxPromise({
                    url: `${BASE_URL}/v2/admin_master_taluk`,
                    method: 'GET',
                    data: { district_code: districtCode, request_type: 'taluk' },
                    headers: { 'X-APP-NAME': 'demo' },
                    dataType: 'json'
                });

                populateDropdown('taluk-dropdown', talukResponse, {
                    defaultText: 'Select Taluk',
                    valueKey: 'taluk_code',
                    textKey: 'taluk_english_name',
                    errorCallback: (message) => showToast('error', message),
                    preselectValue: talukCode,
                    triggerChange: !!talukCode,
                    onComplete: async () => {
                        if (!talukCode) return;

                        const villageResponse = await ajaxPromise({
                            url: `${BASE_URL}/v2/admin_master_village`,
                            method: 'GET',
                            data: {
                                district_code: districtCode,
                                taluk_code: talukCode,
                                request_type: 'revenue_village'
                            },
                            headers: { 'X-APP-NAME': 'demo' },
                            dataType: 'json'
                        });

                        populateDropdown('village-dropdown', villageResponse, {
                            defaultText: 'Select Village',
                            valueKey: 'village_code',
                            textKey: 'village_english_name',
                            errorCallback: (message) => showToast('error', message),
                            preselectValue: villageCode,
                            triggerChange: !!villageCode,
                            onComplete: async () => {
                                if (!villageCode) return;

                                const areaType = getSelectedAreaType();
                                const surveyResponse = await ajaxPromise({
                                    url: `${BASE_URL}/v2/admin_master_survey_number`,
                                    method: 'GET',
                                    data: {
                                        district_code: districtCode,
                                        taluk_code: talukCode,
                                        revenue_village_code: villageCode,
                                        area_type: areaType,
                                        data_type: 'cadastral',
                                        request_type: 'survey_number'
                                    },
                                    headers: { 'X-APP-NAME': 'demo' },
                                    dataType: 'json'
                                });

                                populateDropdown('survey-number-dropdown', surveyResponse, {
                                    defaultText: 'Select Survey Number',
                                    valueKey: 'survey_number',
                                    textKey: 'survey_number',
                                    errorCallback: (message) => showToast('error', message),
                                    preselectValue: surveyNumber,
                                    triggerChange: !!surveyNumber,
                                    onComplete: async () => {
                                        if (!surveyNumber) return;

                                        const subdivResponse = await ajaxPromise({
                                            url: checkAregUrl,
                                            method: 'GET',
                                            data: {
                                                district_code: districtCode,
                                                taluk_code: talukCode,
                                                village_code: villageCode,
                                                survey_number: surveyNumber,
                                                sub_division_number: 'jjj'
                                            },
                                            headers: { 'X-APP-NAME': 'demo' },
                                            dataType: 'json'
                                        });

                                        populateDropdown('sub-division-dropdown', subdivResponse, {
                                            defaultText: 'Select Sub Division',
                                            valueKey: 'subdiv_no',
                                            textKey: 'subdiv_no',
                                            errorCallback: (message) => showToast('error', message),
                                            preselectValue: subdivision,
                                            triggerChange: !!subdivision
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', error);
    }
}






// Update Taluks based on District
$('#district-dropdown').change(async function () {
    try {
        var districtCode = $(this).val();
        if (districtCode) {
            const response = await ajaxPromise({
                url: `${BASE_URL}/v2/admin_master_taluk`,
                method: 'GET',
                data: { 'district_code': districtCode, 'request_type': 'taluk' },
                headers: { 'X-APP-NAME': 'demo' },
                dataType: 'json'
            });
            console.log('Async Taluk Response:', response);
            populateDropdown('taluk-dropdown', response, {
                defaultText: 'Select Taluk',
                valueKey: 'taluk_code',
                textKey: 'taluk_english_name',
                errorCallback: (message) => showToast('error', message),
                triggerChange: false
            });
            fetchGeometry('district', districtCode, null, null,null,null);
        } else {
            // resetDropdown('taluk-dropdown', 'Select Taluk');
        }
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', error)
    }
})

// Update Villages based on Taluk
$('#taluk-dropdown').change(async function () {
    try {
        var district_code = $("#district-dropdown").val();
        var taluk_code = $(this).val();
        var area_type = getSelectedAreaType();
        // console.log(area_type);
        if (area_type == 'rural') {
            loadRevenueVillage(district_code, taluk_code, area_type);
        } else if (area_type == 'urban') {
            loadTown(district_code, taluk_code, area_type);
        }
        fetchGeometry('taluk', district_code, taluk_code, null,null);
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', `${error}`)
    }
});

async function loadTown(district_code,taluk_code) {
    try {
        const response = await ajaxPromise({
            url: `${BASE_URL}/v2/admin_master_revenue_town`,
            method: 'GET',
            data: { 'request_type': 'town','district_code':district_code,'taluk_code':taluk_code },
            headers: { 'X-APP-NAME': 'demo' },
            dataType: 'json'
        });
        console.log('Async Response District:', response);

        populateDropdown('town-dropdown', response, {
            defaultText: 'Select Town',
            valueKey: 'town_code',
            textKey: 'town_english_name',
            errorCallback: (message) => showToast('error', message),
            triggerChange: false
        });
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', response.message);
    }
}
$('#town-dropdown').change(async function () {
    try {
        var district_code = $("#district-dropdown").val();
        var taluk_code = $("#taluk-dropdown").val();
        var town_code = $(this).val();
        var area_type = getSelectedAreaType();
        // console.log(area_type);
        if (area_type == 'rural') {
            loadRevenueVillage(district_code, taluk_code, area_type);
        } else if (area_type == 'urban') {
            urbanWardRevenueCode(district_code, taluk_code,town_code,area_type);
        }
        fetchGeometryUrban('revenue_town', district_code, taluk_code, town_code,null);
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', `${error}`)
    }
});

async function urbanWardRevenueCode(district_code, taluk_code,town_code,area_type) {
    try {
        const response = await ajaxPromise({
            url: `${BASE_URL}/v2/admin_master_revenue_ward`,
            method: 'GET',
            data: { 'request_type': 'ward','district_code':district_code,'taluk_code':taluk_code,'town_code':town_code },
            headers: { 'X-APP-NAME': 'demo' },
            dataType: 'json'
        });
        console.log('Async Response District:', response);

        populateDropdown('ward-dropdown', response, {
            defaultText: 'Select Ward',
            valueKey: 'ward_code',
            textKey: 'ward_english_name',
            errorCallback: (message) => showToast('error', message),
            triggerChange: false
        });
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', response.message);
    }
}

$('#ward-dropdown').change(async function () {
    try {
        var district_code = $("#district-dropdown").val();
        var taluk_code = $("#taluk-dropdown").val();
        var town_code = $("#town-dropdown").val();
        var ward_code = $(this).val();
        var area_type = getSelectedAreaType();
        // console.log(area_type);
        if (area_type == 'rural') {
            loadRevenueVillage(district_code, taluk_code, area_type);
        } else if (area_type == 'urban') {
            urbanBlockRevenueCode(district_code, taluk_code,town_code,ward_code,area_type);
        }
        fetchGeometryUrban('revenue_ward', district_code, taluk_code, town_code,ward_code);
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', `${error}`)
    }
});

async function urbanBlockRevenueCode(district_code, taluk_code,town_code,ward_code) {
    try {
        const response = await ajaxPromise({
            url: `${BASE_URL}/v2/admin_master_revenue_block`,
            method: 'GET',
            data: { 'request_type': 'revenue_block','district_code':district_code,'taluk_code':taluk_code,'town_code':town_code,'ward_code':ward_code },
            headers: { 'X-APP-NAME': 'demo' },
            dataType: 'json'
        });
        console.log('Async Response District:', response);

        populateDropdown('block-dropdown', response, {
            defaultText: 'Select Block',
            valueKey: 'block_code',
            textKey: 'block_english_name',
            errorCallback: (message) => showToast('error', message),
            triggerChange: false
        });
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', response.message);
    }
}

$('#block-dropdown').change(async function () {
    try {
        var district_code = $("#district-dropdown").val();
        var taluk_code = $("#taluk-dropdown").val();
        var town_code = $("#town-dropdown").val();
        var ward_code = $("#ward-dropdown").val();
        var block_code = $(this).val();
        var area_type = getSelectedAreaType();
        // console.log(area_type);
        if (area_type == 'rural') {
            loadRevenueVillage(district_code, taluk_code, area_type);
        } else if (area_type == 'urban') {
            urbanSurveyNumberRevenueCode(district_code, taluk_code,town_code,ward_code,block_code,area_type);
        }
        fetchGeometryUrban('revenue_block', district_code, taluk_code, town_code,ward_code,block_code);
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', `${error}`)
    }
});

async function urbanSurveyNumberRevenueCode(district_code, taluk_code,town_code,ward_code,block_code,area_type) {
    try {
        const response = await ajaxPromise({
            url: `${BASE_URL}/v2/admin_master_survey_number`,
            method: 'GET',
            data: { 'request_type': 'survey_number','district_code':district_code,'taluk_code':taluk_code,'town_code':town_code,'ward_code':ward_code,'block_code':block_code,'area_type':area_type },
            headers: { 'X-APP-NAME': 'demo' },
            dataType: 'json'
        });
        console.log('Async Response District:', response);

        populateDropdown('urban-survey-number-dropdown', response, {
            defaultText: 'Select Survey Number',
            valueKey: 'survey_number',
            textKey: 'survey_number',
            errorCallback: (message) => showToast('error', message),
            triggerChange: false
        });
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', response.message);
    }
}
$('#urban-survey-number-dropdown').change(async function () {
    try {
        var district_code = $("#district-dropdown").val();
        var taluk_code = $("#taluk-dropdown").val();
        var town_code = $("#town-dropdown").val();
        var ward_code = $("#ward-dropdown").val();
        var block_code = $("#block-dropdown").val();
        var survey_number = $(this).val();
        var area_type = getSelectedAreaType();
        // console.log(area_type);
        if (area_type == 'rural') {
            loadRevenueVillage(district_code, taluk_code, area_type);
        } else if (area_type == 'urban') {
            // urbanSurveyNumberRevenueCode(district_code, taluk_code,town_code,ward_code,block_code,area_type);
        }
        fetchGeometrySurvey('survey_number',area_type, district_code, taluk_code, town_code,ward_code,block_code,survey_number);
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', `${error}`)
    }
});
async function loadRevenueVillage(district_code, taluk_code, area_type) {
    try {
        if (district_code && taluk_code) {
            const response = await ajaxPromise({
                url: `${BASE_URL}/v2/admin_master_village`,
                method: 'GET',
                data: { 'district_code': district_code, 'taluk_code': taluk_code, 'request_type': 'revenue_village' },
                headers: { 'X-APP-NAME': 'demo' },
                dataType: 'json'
            });
            console.log('Async Revenue Village Response:', response);
            populateDropdown('village-dropdown', response, {
                defaultText: 'Select Village',
                valueKey: 'village_code',
                textKey: 'village_english_name',
                errorCallback: (message) => showToast('error', message),
                triggerChange: true
            });
        } else {
            resetDropdown('village-dropdown', 'Select Village');
            // showToast('warning', 'Select District & Taluk Dropdown')
        }
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', error)
    }
}

// function loadTown(district_code, taluk_code, area_type) {
//     try {
//         if (district_code && taluk_code) {
//             showToast('warning', "Urban in Progress");
//         } else {
//             // showToast('warning', 'Select District & Taluk Dropdown')
//         }
//     } catch (error) {
//         console.error('Async Error:', error);
//         showToast('error', error)
//     }
// }

// Update Survey Numbers based on Village
$('#village-dropdown').change(async function () {
    try {
        var district_code = $("#district-dropdown").val();
        var taluk_code = $("#taluk-dropdown").val();
        var village_code = $(this).val();
        var area_type = getSelectedAreaType();
        // var data_type = getDataFetchType();
        if (district_code && taluk_code && village_code && area_type ) {
            const response = await ajaxPromise({
                url: `${BASE_URL}/v2/admin_master_survey_number`,
                method: 'GET',
                data: { 'district_code': district_code, 'taluk_code': taluk_code, 'revenue_village_code': village_code, 'area_type': area_type, 'data_type': 'cadastral', 'request_type': 'survey_number' },
                headers: { 'X-APP-NAME': 'demo' },
                dataType: 'json'
            });
            console.log('Async Survey Number Response:', response);
            populateDropdown('survey-number-dropdown', response, {
                defaultText: 'Select Survey Number',
                valueKey: 'survey_number',
                textKey: 'survey_number',
                errorCallback: (message) => showToast('error', message),
                triggerChange: true
            });
            // var villageCode = village_code.replace(/^0+/, '');
            fetchGeometry('revenue_village', district_code, taluk_code, village_code,null,null);
        } else {
            resetDropdown('survey-number-dropdown', 'Select Survey Number');
        }
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', error)
    }
});

// Update Sub Divisions based on Survey Number
// $('#survey-number-dropdown').change(async function () {
//     try {
//         var district_code = $("#district-dropdown").val();
//         var taluk_code = $("#taluk-dropdown").val();
//         var village_code = $("#village-dropdown").val();
//         var survey_number = $(this).val();
//         var area_type = getSelectedAreaType();
//         // var data_type = getDataFetchType();
//         if (district_code && taluk_code && village_code && survey_number && area_type ) {
//             const response = await ajaxPromise({
//                 url: `${BASE_URL}/v2/admin_master_sub_division`,
//                 method: 'GET',
//                 data: { 'district_code': district_code, 'taluk_code': taluk_code, 'revenue_village_code': village_code, 'survey_number': survey_number, 'area_type': area_type, 'data_type': 'cadastral', 'request_type': 'sub_division_number' },
//                 headers: { 'X-APP-NAME': 'demo' },
//                 dataType: 'json'
//             });
//             console.log('Async Sub Division Response:', response);
//             populateDropdown('sub-division-dropdown', response, {
//                 defaultText: 'Select Sub Division',
//                 valueKey: 'sub_division',
//                 textKey: 'sub_division',
//                 errorCallback: (message) => showToast('error', message),
//                 triggerChange: true
//             });
//             // var villageCode = village_code.replace(/^0+/, '');
//             fetchGeometry('survey_number', district_code, taluk_code, village_code,survey_number,null);
//             alert(4);
//         } else {
//             resetDropdown('sub-division-dropdown', 'Select Sub Division');
//         }
//     } catch (error) {
//         console.error('Async Error:', error);
//         showToast('error', error)
//     }
// });

$('#survey-number-dropdown').change(async function () {
    try {
        var district_code = $("#district-dropdown").val();
        var taluk_code = $("#taluk-dropdown").val();
        var village_code = $("#village-dropdown").val();
        var survey_number = $(this).val();
        var area_type = getSelectedAreaType();
        // var data_type = getDataFetchType();
        if (district_code && taluk_code && village_code && survey_number && area_type ) {
            const response = await ajaxPromise({
                url: checkAregUrl,
                method: 'GET',
                data: { 'district_code': district_code, 'taluk_code': taluk_code, 'village_code': village_code, 'survey_number': survey_number, 'sub_division_number':'jjj' },
                headers: { 'X-APP-NAME': 'demo' },
                dataType: 'json'
            });
            console.log('Async Sub Division Response:', response);
            populateDropdown('sub-division-dropdown', response, {
                defaultText: 'Select Sub Division',
                valueKey: 'subdiv_no',
                textKey: 'subdiv_no',
                errorCallback: (message) => showToast('error', message),
                triggerChange: true
            });
            // var villageCode = village_code.replace(/^0+/, '');
            fetchGeometry('survey_number', district_code, taluk_code, village_code,survey_number,);
        } else {
            resetDropdown('sub-division-dropdown', 'Select Sub Division');
        }
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', error)
    }
});

// Function to get current selected Area Type
function getSelectedAreaType() {
    const selectedRadio = document.querySelector('input[name="area-type"]:checked');
    return selectedRadio.value;
}

// Select all buttons inside .nav-item
const navButtons = document.querySelectorAll('.nav-item .nav-link');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove 'active' class from all nav-links, nav-items, and info-icons
        document.querySelectorAll('.nav-item, .nav-link, .info-icons').forEach(item => {
            item.classList.remove('active');
        });

        // Add 'active' class to the clicked nav-link and its parent nav-item
        button.classList.add('active');
        const parentNavItem = button.closest('.nav-item');
        if (parentNavItem) {
            parentNavItem.classList.add('active');
        }

        // Add 'active' class to the .info-icons container
        const infoIcons = button.closest('.info-icons');
        if (infoIcons) {
            infoIcons.classList.add('active');
        }
    });
});


function openECnfo(){
    clearVertexLabels();
    $(".error-message").empty().hide();
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('vertex-info-container')?.remove();
    document.getElementById('igr-info-container')?.remove();
    document.getElementById('JSB-info-container')?.remove();
    document.getElementById('fmb-sketch-info-panel')?.remove();
    document.getElementById('thematic-info-container')?.remove();
    $(".error-message").empty().text('Encumbrance certificate - coming soon').show();
}

function addSpaceBeforeCaps(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Handle consecutive capitals (e.g., govtPriCode)
        .replace(/\s+/g, ' ') // Replace multiple spaces with one
        .trim() // Trim leading/trailing spaces
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
}




const rotationStep = Math.PI / 8; // Rotate by 22.5 degrees per step

// Reset rotation to North (0 degrees)
document.getElementById("resetRotation").addEventListener("click", function () {
    view.animate({ rotation: 0, duration: 300 });
});

// Rotate Right (Clockwise)
document.querySelector(".rotation-right").addEventListener("click", function () {
    view.animate({ rotation: view.getRotation() - rotationStep, duration: 300 });
});

// Rotate Left (Counterclockwise)
document.querySelector(".rotation-left").addEventListener("click", function () {
    view.animate({ rotation: view.getRotation() + rotationStep, duration: 300 });
});

function verifySubDivision(response) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: checkAregUrl,
            type: "GET",
            data: {
                district_code: response.district_code,
                taluk_code: response.taluk_code,
                village_code: response.village_code,
                survey_number: response.survey_number,
                sub_division_number: $("#subDivs").text() ? $("#subDivs").text() : 'jjjj'
            },
            success: function(data) {
                resolve(data); // Return the data
            },
            error: function(xhr, status, error) {
                reject(error); // Return the error
            }
        });
    });
}

function generateDropdown(result) {
    if (!result || !result.data || result.data.length === 0) {
        console.error("No subdivision data found");
        return;
    }

    let container = document.getElementById("subdivisionid");
    
    // Get the currently selected value if it exists
    let existingDropdown = document.getElementById("subdivisionDropdown");
    let selectedValue = existingDropdown ? existingDropdown.value : "";

    // Remove existing dropdown if present
    if (existingDropdown) {
        container.removeChild(existingDropdown);
    }

    // Create the select element
    let select = document.createElement("select");
    select.id = "subdivisionDropdown";
    select.className = "form-select";

    // Create a default "Select" option
    let defaultOption = document.createElement("option");
    defaultOption.text = "Select";
    defaultOption.value = "";
    select.appendChild(defaultOption);

    // Loop through result.data and add options
    result.data.forEach(item => {
        let option = document.createElement("option");
        option.value = item.subdiv_no;
        option.text = `${item.subdiv_no}`;
        if (item.subdiv_no === selectedValue && selectedValue !== "") {
            option.selected = true; // Retain previous selection if it's not the default
        }
        select.appendChild(option);
    });

    // Append the dropdown to the container
    container.appendChild(select);
}


$("#backto").on("click", function(){
    const Offcanvas = document.getElementById('offcanvasScrolling-right');
    Offcanvas.classList.remove('show');
    const Offcanvas1 = document.getElementById('offcanvasScrolling-right1');
    Offcanvas1.classList.remove('show');
})


function LpadAdding(code, type) {
    if (code === null || code === undefined) {
        return "";
    }

    let value = code.toString();

    switch (type) {
        case 'district':
        case 'taluk':
            return value.padStart(2, "0");

        case 'village':
        case 'town':
        case 'ward':
            return value.padStart(3, "0");

        case 'block':
            return value.padStart(4, "0");

        default:
            return value;
    }
}


function closever(){
    clearVertexLabels();
}

