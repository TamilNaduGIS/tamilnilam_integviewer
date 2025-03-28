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
        default:
            return;
    }

    // Add the new basemap layer
    map.addLayer(basemapLayer);
    if (type == 'basemap') {
        highlightSelectedButton(basemap);
    }
}


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
    visible: true,
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

function displayInfo(data) {
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('panel-content');

    // Clear previous content
    content.innerHTML = '';

    // Title Section
    const titleDiv = document.createElement('div');
    titleDiv.className = 'info-title';
    titleDiv.textContent = 'Land Parcel Information';
    content.appendChild(titleDiv);

    // ULPIN and Centroid
    const subTitleDiv = document.createElement('div');
    subTitleDiv.className = 'info-subtitle';
    subTitleDiv.innerHTML = `
        <div><strong>ULPIN:</strong> ${data.ulpin}</div>
        <div><strong>Centroid:</strong> ${data.centroid}</div>
    `;
    content.appendChild(subTitleDiv);

    // Group Data into Sections
    const sections = [
        {
            heading: 'District',
            values: {
                'District Name': data.district_name,
                'Tamil Name': data.district_tamil_name,
                'District Code': data.district_code,
                'LGD Code': data.lgd_district_code,
            },
        },
        {
            heading: 'Taluk',
            values: {
                'Taluk Name': data.taluk_name,
                'Tamil Name': data.taluk_tamil_name,
                'Taluk Code': data.taluk_code,
                'LGD Code': data.lgd_taluk_code,
            },
        },
        {
            heading: 'Village',
            values: {
                'Village Name': data.village_name,
                'Tamil Name': data.village_tamil_name,
                'Village Code': data.village_code,
                'LGD Code': data.lgd_village_code,
            },
        },
        {
            heading: 'Survey Detail',
            values: {
                'Survey Number': data.is_fmb ? `${data.survey_number}/${data.sub_division}` : data.survey_number,
            },
        },
    ];

    sections.forEach((section) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'info-section';

        const sectionHeading = document.createElement('h3');
        sectionHeading.textContent = section.heading;
        sectionDiv.appendChild(sectionHeading);

        const sectionContent = document.createElement('div');
        sectionContent.className = 'section-content';
        for (const [key, value] of Object.entries(section.values)) {
            const valueRow = document.createElement('div');
            valueRow.className = 'value-row';
            valueRow.innerHTML = `
                <strong>${key}:</strong> ${value ?? 'N/A'}
            `;
            sectionContent.appendChild(valueRow);
        }
        sectionDiv.appendChild(sectionContent);
        content.appendChild(sectionDiv);
    });

    // Show the panel
    panel.style.display = 'block';
    panel.classList.add('show');
}

loadDistrict();
// Click event listener on the map
map.on('singleclick', function (evt) {
    // Add click listener to map to close the panel when clicking on the map
    clearVertexLabels();
    simplifiedHidePanel();
    closeAregPanel();
    closeFMBSketchPanel();
    const coordinates = ol.proj.toLonLat(evt.coordinate);
    const lon = coordinates[0].toFixed(6);
    const lat = coordinates[1].toFixed(6);

    $.ajax({
        url: `${BASE_URL}/v1/land_detail`,
        method: 'POST',
        headers: {
            'X-APP-NAME': 'demo'
        },
        data: {
            latitude: lat,
            longitude: lon,
        },
        success: function (response) {
            var responseMessage = '';
            if (response.success) {
                if(response.success == 1){
                    var response_data = response.data;
                    // console.log(response_data)
                    // displayInfo(response_data)
                    addGeoJsonLayer(response_data.geojson_geom)
                    displaySimplifiedInfo(response_data, lat, lon)
                }else{
                    responseMessage = response.message;
                    alert(responseMessage);
                }
                
            } else {
                console.error(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error fetching geometry data:', error);
        }
    });

});

// Close button event listener
document.getElementById('close-btn').addEventListener('click', hidePanel);

function displaySimplifiedInfo(data, lat, long) {
    

    const panel = document.getElementById('lpi-container');
    const content = document.getElementById('lpi-content');

    // Clear previous content
    content.innerHTML = '';

    // Group Data into Sections
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-section';

    // District, Taluk, and Village in a single line
    const districtTalukVillage = document.createElement('div');
    districtTalukVillage.className = 'district-taluk-village';
    districtTalukVillage.innerHTML = `
        <div><strong>District:</strong> <br />${data.district_name} / ${data.district_tamil_name}</div>
        <div><strong>Taluk:</strong> <br /> ${data.taluk_name} / ${data.taluk_tamil_name}</div>
        <div><strong>Village:</strong> <br /> ${data.village_name} / ${data.village_tamil_name}</div>
    `;
    infoDiv.appendChild(districtTalukVillage);

    // LGD Codes
    const lgdCodes = document.createElement('div');
    lgdCodes.className = 'lgd-codes';
    lgdCodes.innerHTML = `
        <div><strong>Village LGD Code:</strong> ${data.lgd_village_code} (${data.rural_urban})</div>
    `;
    infoDiv.appendChild(lgdCodes);

    content.appendChild(infoDiv);

    // Survey Section
    const surveySection = document.createElement('div');
    surveySection.className = 'info-survey-section';

    const surveyNumber = data.is_fmb == 1
        ? (data.sub_division ? `${data.survey_number}/${data.sub_division}` : data.survey_number)
        : data.survey_number;

    surveySection.innerHTML = `
        <div><strong>ULPIN:</strong> ${data.ulpin}</div> <div><strong>Centroid:</strong> ${data.centroid}</div><br>
        <div><strong>Survey Number:</strong> ${surveyNumber}</div>
        <br>
    `;

    // Icon Section
    const iconSection = document.createElement('div');
    iconSection.className = 'info-icons';

    iconSection.innerHTML = `
        <ul class="nav nav-tabs mb-3 d-flex flex-column" id="myTab" role="tablist">
            <li class="nav-item mx-1" role="presentation">
                <button class="nav-link district-icon" title="Patta / Chitta - A-Reg" id="profile-tab" type="button" 
                    data-bs-target="#profile-tab-pane" aria-controls="profile-tab-pane" aria-selected="false" 
                    onclick='openAregInfo(${JSON.stringify(data)})'>
                    <i class="bi bi-bank2"></i>
                </button>
            </li>
            <li class="nav-item mx-1" role="presentation">
                <button class="nav-link district-icon" title="FMB Sketch" id="next-tab" type="button" 
                    data-bs-target="#next-tab-pane" aria-controls="next-tab-pane" aria-selected="false" 
                    onclick='openFMBSketchInfo(${JSON.stringify(data)})'>
                    <i class="bi bi-rulers"></i>
                </button>
            </li>
            <li class="nav-item mx-1" role="presentation">
                <button class="nav-link district-icon" title="Vertex / Plot Corner List" id="pro-tab" type="button" 
                    data-bs-target="#pro-tab-pane" aria-controls="pro-tab-pane" aria-selected="false" 
                    onclick='highlightVertices(${JSON.stringify(data.geojson_geom)})'>
                    <i class="bi bi-globe"></i>
                </button>
            </li>
            <li class="nav-item mx-1" role="presentation">
                <button class="nav-link district-icon" title="Guideline Value" id="nex-tab" type="button" 
                    data-bs-target="#nex-tab-pane" aria-controls="nex-tab-pane" aria-selected="false" 
                    onclick='openIGRInfo(${JSON.stringify(data)}, ${lat}, ${long})'>
                    <img src="assets/icons/rubai.svg" id="rubai" alt="">
                </button>
            </li>
        </ul>
    `;

    // Append sections to content
    content.appendChild(surveySection);
    content.appendChild(iconSection);


    

    // Show the panel
    // panel.style.display = 'block';
    // panel.classList.add('show');
    $("#staticBackdrop").modal('show');
}

// Hide the info panel
function simplifiedHidePanel() {
    // const panel = document.getElementById('staticBackdrop');
    // panel.classList.remove('show');
    // panel.style.display = 'none';
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
        maxZoom: 18,
        padding: [20, 20, 20, 20]
    });
    geojsonLayer.setVisible(true);
}


// Global variable to hold reference to the vertex layer
let vertexLayer = null;

// Function to handle vertex extraction, highlighting, and coordinate display
function highlightVertices(sgeojsonGeom) {
    const geojsonGeom = JSON.parse(sgeojsonGeom);
    const vertices = extractVertices(geojsonGeom);
    console.log(vertices);

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
        maxZoom: 18,
        padding: [20, 20, 20, 20]
    });
}
function displayVertexDetails(vertices) {
    
    // document.getElementById('areg-tab-container').remove();
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('igr-info-container')?.remove();
    // Select the .info-icons div
    const iconSection = document.querySelector('.info-icons');

    // Remove any existing vertex info container
    const existingVertexContainer = document.getElementById('vertex-info-container');
    if (existingVertexContainer) {
        existingVertexContainer.remove();
    }

    // Create the container for the vertex info
    const vertexContainer = document.createElement('div');
    vertexContainer.id = 'vertex-info-container';
    vertexContainer.className = 'mt-2 p-3 border rounded';
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
        zoomLevel = 18; // Very close, high zoom
    } else if (distance < 1000) {
        zoomLevel = 16; // Close
    } else if (distance < 5000) {
        zoomLevel = 14; // Medium
    } else {
        zoomLevel = 12; // Far away, low zoom
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
    console.log(data);
    if (data.rural_urban === "rural") {
        const params = {
            district_code: data.district_code,
            taluk_code: data.taluk_code,
            village_code: data.village_code,
            survey_number: data.survey_number,
            sub_division_number: data.is_fmb == 1 ? (data.sub_division != null ? data.sub_division : '-') : '-',
            land_type: data.rural_urban,
            code_type: ADMIN_CODE_TYPE,
            search_type: AREG_SEARCH_TYPE
        };

        $.ajax({
            url: `${AREG_SEARCH_URL}`,
            method: 'POST',
            headers: { 'X-APP-NAME': 'demo' },
            data: params,
            success: function (response) {
                if (response.success) {
                    const responseData = response;
                    populateInfoPanel(responseData);
                } else {
                    console.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error in fetching AREG - ', error);
            }
        });
    } else {
        alert("Urban in Progress");
    }
}


function populateInfoPanel(response) {
    console.log(response);
    document.getElementById('vertex-info-container')?.remove();
    
    document.getElementById('igr-info-container')?.remove();
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
        tabContainer.className = 'mt-1';

        // Create tab navigation
        const tabNav = document.createElement('ul');
        tabNav.className = 'nav nav-tabs';
        tabNav.innerHTML = `
            <li class="nav-item">
                <button class="nav-link active" id="land-tab" data-bs-toggle="tab" 
                    data-bs-target="#land" type="button" role="tab" aria-controls="land" aria-selected="true">
                    Land Details
                </button>
            </li>
            <li class="nav-item">
                <button class="nav-link" id="ownership-tab" data-bs-toggle="tab" 
                    data-bs-target="#ownership" type="button" role="tab" aria-controls="ownership" aria-selected="false">
                    Ownership Details
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

        // Land Details Tab
        const landTabPane = document.createElement('div');
        landTabPane.className = 'tab-pane fade show active';
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

        // Ownership Details Tab
        const ownershipTabPane = document.createElement('div');
        ownershipTabPane.className = 'tab-pane fade';
        ownershipTabPane.id = 'ownership';
        ownershipTabPane.role = 'tabpanel';
        ownershipTabPane.innerHTML = `
            <table class="table table-bordered table-striped mt-2">
                <thead class="table-dark">
                    <tr><th>#</th><th>Owner</th><th>Relation</th><th>Relative</th></tr>
                </thead>
                <tbody id="ownership-details-table"></tbody>
            </table>
        `;

        // Append tabs and content
        tabContent.appendChild(landTabPane);
        tabContent.appendChild(ownershipTabPane);
        tabContainer.appendChild(tabNav);
        tabContainer.appendChild(tabContent);

        // Insert the tab section below the .info-icons div
        iconSection.insertAdjacentElement('afterend', tabContainer);

        // Populate Land Details Table
        const landDetailsTable = document.getElementById("land-details-table");
        landDetailsTable.innerHTML = ''; // Clear previous data
        for (const [key, value] of Object.entries(landDetail)) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${key}</td>
                <td>${value !== null && value !== "" ? value : "-"}</td>
            `;
            landDetailsTable.appendChild(row);
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
                    <td>${owner.Relation.trim()}</td>
                    <td>${owner.Relative.trim()}</td>
                `;
                ownershipDetailsTable.appendChild(row);
            });
        }

        // Show the Info Panel
        // const infoPanel = document.getElementById("areg-info-panel");
        // infoPanel.style.display = "block";

    } else {
        closeAregPanel();
        alert("No Ownership Details Found for the Selected Land Parcel");
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
    console.log(data);
    if (data.rural_urban === "rural") {
        const params = {
            districtCode: data.district_code,
            talukCode: data.taluk_code,
            villageCode: data.village_code,
            surveyNumber: data.survey_number,
            subdivisionNumber: data.is_fmb == 1 ? (data.sub_division != null ? data.sub_division : '') : '',
            type: data.rural_urban,
        };

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

                                // Show the info panel
                                const infoPanel = document.getElementById("fmb-sketch-info-panel");
                                const iframe = document.getElementById("fmb-sketch-viewer");
                                iframe.src = pdfURL;
                                infoPanel.style.display = "block";

                            } catch (error) {
                                console.error("Caught error in onloadend:", error);
                                alert('FMB Sketch could not be downloaded for visualization. Please contact the Revenue Surveyor in taluk office.');
                            }
                        };

                        // Read the blob content as ArrayBuffer to check for PDF signature
                        fileReader.readAsArrayBuffer(blob);
                    } catch (error) {
                        // Handle invalid base64 or PDF error
                        alert('FMB Sketch could not be downloaded for visualization. Please contact the Revenue Surveyor in taluk office.');
                        console.error('Error while loading PDF:', error);
                        // You can display a custom message here, e.g., "Invalid PDF data."
                    }

                    // Add event listeners for fullscreen and close
                    document.getElementById("fmb-fullscreen-btn").onclick = () => {
                        const infoPanel = document.getElementById("fmb-sketch-info-panel");
                        if (infoPanel.requestFullscreen) {
                            infoPanel.requestFullscreen();
                        } else if (infoPanel.webkitRequestFullscreen) {
                            infoPanel.webkitRequestFullscreen();
                        } else if (infoPanel.mozRequestFullScreen) {
                            infoPanel.mozRequestFullScreen();
                        } else if (infoPanel.msRequestFullscreen) {
                            infoPanel.msRequestFullscreen();
                        }
                    };
                } else {
                    alert(response.message);
                }
            },
            error: function (xhr, status, error) {
                alert('Unable to fetch data from NIC. ', error);
            }
        });
    } else {
        alert("Urban in Progress");
    }
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
    document.getElementById('areg-tab-container')?.remove();
    document.getElementById('vertex-info-container')?.remove();

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
                    const existingIGRContainer = document.getElementById('igr-info-container');
                    if (existingIGRContainer) {
                        existingIGRContainer.remove();
                    }

                    // Create the container for IGR info
                    const igrContainer = document.createElement('div');
                    igrContainer.id = 'igr-info-container';
                    igrContainer.className = 'mt-1 p-3 border rounded';
                    igrContainer.style.maxHeight = '400px';   // Max height for scrollable content
                    igrContainer.style.overflowY = 'auto';    // Vertical scroll bar
                    igrContainer.style.background = '#f9f9f9';
                    igrContainer.style.border = '1px solid #ddd';
                    igrContainer.style.marginBottom = '8px';
                    

                    // Add the title with a close button
                    const panelTitle = document.createElement('div');
                    panelTitle.className = 'd-flex justify-content-between align-items-center';
                    panelTitle.innerHTML = `
                        <h6 class="m-0">IGR Land Value</h6>
                    `;

                    // Append the title
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
                    } else {
                        alert("Guideline Value not found for the selected Land");
                    }
                } else {
                    console.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error in fetching IGR Land Value - ", error);
            }
        });
    } else {
        alert("Urban in Progress");
    }
}


function closeIGRInfoPanel(){
    const infoPanel = document.getElementById("igr-info-panel");
    if (infoPanel) {
        infoPanel.style.display = "none";
    }
    
}

// Layer configuration from JSON
const layerConfig = [
    {
        category: "Administrative Boundary",
        layers: [
            {
                id: "state_boundary",
                name: "State",
                title: "State",
                type: "wms",
                defaultOpacity: 1,
                defaultVisibility: true,
                url: "https://tngis.tnega.org/geoserver/wms",
                params: {
                    LAYERS: "generic_viewer:state_boundary",
                    STYLES: "",
                },
            },
            {
                id: "district_boundary",
                name: "District",
                title: "District",
                type: "wms",
                defaultOpacity: 0.7,
                defaultVisibility: false,
                url: "https://tngis.tnega.org/geoserver/wms",
                params: {
                    LAYERS: "generic_viewer:districts",
                    STYLES: "",
                },
            },
            {
                id: "taluk_boundary",
                name: "Taluk",
                title: "Taluk",
                type: "wms",
                defaultOpacity: 0.7,
                defaultVisibility: false,
                url: "https://tngis.tnega.org/geoserver/wms",
                params: {
                    LAYERS: "generic_viewer:taluk_boundary",
                    STYLES: "",
                },
            },
            {
                id: "revenue_villages",
                name: "Revenue Village",
                title: "Revenue Village",
                type: "wms",
                defaultOpacity: 0.7,
                defaultVisibility: false,
                url: "https://tngis.tnega.org/geoserver/wms",
                params: {
                    LAYERS: "generic_viewer:revenue_villages",
                    STYLES: "",
                },
            },
            {
                id: "TNGIS_Basemap",
                name: "TNGIS - Basemap",
                title: "TNGIS - Basemap",
                type: "xyz",
                defaultOpacity: 1,
                defaultVisibility: true,
                url: "https://tngis.tn.gov.in/data/xyz_tiles/cadastral_xyz/{z}/{x}/{y}.png",
            },
        ],
    },
    // {
    //     category: 'CRZ Layers',
    //     layers: [
    //         {
    //             id: "CRZ_crz_boundary",
    //             name: "CRZ Boundary",
    //             title: "CRZ Boundary",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crz_boundary",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_cvca_boundary",
    //             name: "CVCA Boundary",
    //             title: "CVCA Boundary",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:cvca_boundary",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_high_tide_line",
    //             name: "High Tide Line",
    //             title: "High Tide Line",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:high_tide_line",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_low_tide_line",
    //             name: "Low Tide Line",
    //             title: "Low Tide Line",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:low_tide_line",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_1a",
    //             name: "CRZ 1A",
    //             title: "CRZ 1A",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crz1a",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_crza1_mangrove_buffer",
    //             name: "CRZ 1A Mangrove Buffer",
    //             title: "CRZ 1A Mangrove Buffer",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crza1_mangrove_buffer",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_crz_ib",
    //             name: "CRZ 1B",
    //             title: "CRZ 1B",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crz_ib",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_crz2",
    //             name: "CRZ 2",
    //             title: "CRZ 2",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crz2",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_crz_3a",
    //             name: "CRZ 3A",
    //             title: "CRZ 3A",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crz_3a",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_crz_3b",
    //             name: "CRZ 3B",
    //             title: "CRZ 3B",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crz_3b",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_crz_iv_a",
    //             name: "CRZ 4A",
    //             title: "CRZ 4A",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crz_iv_a",
    //                 STYLES: "",
    //             },
    //         },
    //         {
    //             id: "CRZ_crz_4b_07_07_2022",
    //             name: "CRZ 4B",
    //             title: "CRZ 4B",
    //             type: "wms",
    //             defaultOpacity: 1,
    //             defaultVisibility: true,
    //             url: "https://tngis.tnega.org/geoserver/wms",
    //             params: {
    //                 LAYERS: "generic_viewer:crz_4b_07_07_2022",
    //                 STYLES: "",
    //             },
    //         },
    //     ]
    // },
    {
        category: "CRZ Affected Area",
        layers: [
            {
                // CRZ - Affected Land Parcel
                id: "CRZ_Survey_Number",
                name: "CRZ - Affected Land Parcel",
                title: "CRZ - Affected Land Parcel",
                type: "wms",
                defaultOpacity: 1,
                defaultVisibility: true,
                url: "https://tngis.tnega.org/geoserver/wms",
                params: {
                    LAYERS: "generic_viewer:crz_cadastral",
                    STYLES: "",
                },
            }
        ]
    }
];


const layerControl = document.getElementById('accordionPanelsStayOpenExample');
const layers = {};

layerConfig.forEach((category, index) => {
    // Create accordion item
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';

    // Accordion Header
    const headerId = `header-${index}`;
    const collapseId = `collapse-${index}`;

    accordionItem.innerHTML = `
        <h2 class="accordion-header" id="${headerId}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                ${category.category}
            </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}" data-bs-parent="#accordionPanelsStayOpenExample">
            <div class="accordion-body">
                <div class="listings"></div>
            </div>
        </div>
    `;

    const listings = accordionItem.querySelector('.listings');

    // Add layers to the accordion content
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
        } else if (layerInfo.type === "xyz") {
            layer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: layerInfo.url,
                }),
                opacity: layerInfo.defaultOpacity,
                visible: layerInfo.defaultVisibility,
            });
        }

        // Add layer to the map and reference it
        map.addLayer(layer);
        layers[layerInfo.id] = layer;

        // Create checkbox with label
        const label = document.createElement('label');
        label.className = 'd-block my-1';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = layerInfo.id;
        checkbox.checked = layerInfo.defaultVisibility;

        checkbox.addEventListener('change', (e) => {
            layer.setVisible(e.target.checked);
            // updateAllLegends();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${layerInfo.title}`));

        listings.appendChild(label);
    });

    layerControl.appendChild(accordionItem);
});
// updateAllLegends();
function updateAllLegends() {
    const legendContent = document.getElementById('legend-content');
    legendContent.innerHTML = ''; // Clear existing legends

    layerConfig.forEach((category) => {
        category.layers.forEach((layerInfo) => {
            if (layerInfo.type === "wms" && layers[layerInfo.id].getVisible()) {
                var resolution = map.getView().getResolution();

                var legendUrl = `${layerInfo.url}?REQUEST=GetLegendGraphic&VERSION=1.3.0&FORMAT=image/png&LAYER=${layerInfo.params.LAYERS}`;
                // Add custom LEGEND_OPTIONS if needed
                legendUrl += '&LEGEND_OPTIONS=forceLabels:on;fontColor:0xfffff;fontAntiAliasing:true&transparent=true';
                legendUrl += `&SCALE=${resolution}`;

                const legendImage = document.createElement('img');
                legendImage.src = legendUrl;
                legendImage.alt = `${layerInfo.title} Legend`;
                legendContent.appendChild(legendImage);
            }
        });
    });
}

// Clear Legend
function clearLegend() {
    const legendContent = document.getElementById('legend-content');
    legendContent.innerHTML = '';
}


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
async function loadDistrict() {
    try {
        const response = await ajaxPromise({
            url: `${BASE_URL}/v2/admin_master_district`,
            method: 'GET',
            data: { 'request_type': 'district' },
            headers: { 'X-APP-NAME': 'demo' },
            dataType: 'json'
        });
        console.log('Async Response District:', response);

        populateDropdown('district-dropdown', response, {
            defaultText: 'Select District',
            valueKey: 'district_code',
            textKey: 'district_english_name',
            errorCallback: (message) => showToast('error', message),
            triggerChange: true
        });
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', response.message);
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
                triggerChange: true
            });
            fetchGeometry('district', districtCode, null, null,null,null);
            alert(1);
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
        if (area_type == 'rural') {
            loadRevenueVillage(district_code, taluk_code, area_type);
        } else if (area_type == 'urban') {
            loadTown(district_code, taluk_code, area_type);
        }
        fetchGeometry('taluk', district_code, taluk_code, null,null);
        alert(2);
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

function loadTown(district_code, taluk_code, area_type) {
    try {
        if (district_code && taluk_code) {
            showToast('warning', "Urban in Progress");
        } else {
            // showToast('warning', 'Select District & Taluk Dropdown')
        }
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', error)
    }
}

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
            alert(3);
        } else {
            resetDropdown('survey-number-dropdown', 'Select Survey Number');
        }
    } catch (error) {
        console.error('Async Error:', error);
        showToast('error', error)
    }
});

// Update Sub Divisions based on Survey Number
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
                url: `${BASE_URL}/v2/admin_master_sub_division`,
                method: 'GET',
                data: { 'district_code': district_code, 'taluk_code': taluk_code, 'revenue_village_code': village_code, 'survey_number': survey_number, 'area_type': area_type, 'data_type': 'cadastral', 'request_type': 'sub_division_number' },
                headers: { 'X-APP-NAME': 'demo' },
                dataType: 'json'
            });
            console.log('Async Sub Division Response:', response);
            populateDropdown('sub-division-dropdown', response, {
                defaultText: 'Select Sub Division',
                valueKey: 'sub_division',
                textKey: 'sub_division',
                errorCallback: (message) => showToast('error', message),
                triggerChange: true
            });
            // var villageCode = village_code.replace(/^0+/, '');
            fetchGeometry('survey_number', district_code, taluk_code, village_code,survey_number,null);
            alert(4);
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


// Select the UI elements
const resetButton = document.getElementById('resetRotation');
const rotateRightButton = document.querySelector('.rotation-right');
const rotateLeftButton = document.querySelector('.rotation-left');

// Function to rotate the map
const rotationStep = Math.PI / 18;  // Rotate by 10 degrees (in radians)

rotateRightButton.addEventListener('click', () => {
    const currentRotation = map.getView().getRotation();
    map.getView().setRotation(currentRotation + rotationStep);
});

rotateLeftButton.addEventListener('click', () => {
    const currentRotation = map.getView().getRotation();
    map.getView().setRotation(currentRotation - rotationStep);
});

// Reset rotation to North
resetButton.addEventListener('click', () => {
    map.getView().setRotation(0);
});
