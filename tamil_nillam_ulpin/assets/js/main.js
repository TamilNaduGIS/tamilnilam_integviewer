var img_src = "https://tngis.tnega.org/assets/apps_images/";
var apk_url = "https://tngis.tnega.org/apk/";
var ios_url = "https://tngis.tnega.org/assets/ios/";
var api = "https://tngis.tnega.org/tngis_api/api/";
var baseURL = String(document.location.href).replace(/#/, "");
var page_url = baseURL.split('/');
page = page_url[3].split('.');
page = page[0];

$(document).ajaxStart(function () {
    // Show image container
    $("#js-preloader").show();
});
$(document).ajaxComplete(function () {
    // Hide image container
    $("#js-preloader").hide();
});

function exportJsonToExcel(jsonData, file_name) {
    // Convert JSON to an array of arrays
    var data = jsonData.map(obj => Object.values(obj));

    // Create a workbook
    var ws = XLSX.utils.aoa_to_sheet([Object.keys(jsonData[0])].concat(data));

    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    console.log(ws);
    // Generate binary data
    var binaryData = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    // Convert binary data to Blob
    var blob = new Blob([s2ab(binaryData)], { type: 'application/octet-stream' });

    // Save the Blob as an Excel file
    saveAs(blob, file_name + '.xlsx');
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

function download_all_data(query, filter_type, filter_value) {
    $.ajax({
        type: 'POST',
        url: api + "api_results.php",
        data: { 'filter_type': filter_type, 'filter_value': filter_value, 'query': query, 'case': 'getdataListDownload' },
        beforeSend: function () { // Before we send the request, remove the .hidden class from the spinner and default to inline-block.
            $('#js-preloader').fadeIn();
        },
        success: function (result) {
            var data = JSON.parse(result);
            exportJsonToExcel(data, 'Layer List');
        }
    });
}

// Log Page Hits
$(window).on('load', function () {
    if (page) {
        log_page = page;
    } else {
        log_page = 'index';
    }
    $.ajax({
        type: 'POST',
        url: api + "api_results.php",
        cache: false,
        data: { 'case': 'pagelog', 'page': log_page },
        dataType: 'json',
    });
});

var login_auth = getCookie('tngis_user_info');

function download_logs(user_id, layer_id, type, file_name) {
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'user_id': user_id, 'layer_id': layer_id, 'type': type, 'file_name': file_name, 'case': 'download_logs' },
    });
}

// check login
function check_download_auth(layer_id, filter_type, layer_name) {
    var login_auth1 = getCookie('tngis_user_info');
    console.log(login_auth1);
    // console.log(layer_id,filter_type,layer_name);
    if (filter_type == 'API Document') {
        download_logs(0, 0, filter_type, layer_id);
        return true;
    } else {
        if (login_auth1 === false || login_auth1 === undefined) {
            if (page == 'data') {
                // Swal.fire({
                //     title: 'Login/Register to View Map',
                //     icon: "warning",
                //     timer: 2000,
                //     showConfirmButton: false,
                // });

                if (filter_type == 'Map View') {
                    window.open('https://tngis.tnega.org/generic_viewer/?lyr_id=' + layer_id + '&layer_name=' + layer_name + '', '_blank');
                    // window.open('http://localhost/generic_viewer/?lyr_id='+layer_id+'', '_blank');
                    return true;
                } else {
                    return true;
                }
            } else {
                Swal.fire({
                    title: 'Login/Register to Download',
                    icon: "warning",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
            return false;
        } else {
            var check_auth = getCookie('tngis_user_info');
            // check_auth = JSON.parse(login_auth);
            var user_id = check_auth['user_id'];
            if (typeof layer_id == 'number') {
                download_logs(user_id, layer_id, null, filter_type);
            } else {
                download_logs(user_id, 0, filter_type, layer_id);
            }
            if (filter_type == 'Map View') {
                window.open('https://tngis.tnega.org/generic_viewer/?lyr_id='+lyr_id+'', '_blank');
                // window.open('http://localhost/generic_viewer/?lyr_id='+layer_id+'', '_blank');
                return true;
            } else {
                return true;
            }
        }
    }

}


if (page == 'apps') {
    // Apps Counts
    $(document).ready(function () {
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'case': 'getApplicationsCount' },
            success: function (result) {
                var result = JSON.parse(result);
                result = result[0];
                $("#app_count").append(result['apps']);
                $("#dept_count").append(result['dept']);
                $("#mobile").append(result['mobile']);
                $("#mobile_public").append(result['mobile_public']);
                $("#mobile_auth").append(result['mobile_auth']);
                $("#mobile_partial").append(result['mobile_partial_public']);
                $("#web").append(result['web']);
                $("#web_public").append(result['web_public']);
                $("#web_auth").append(result['web_auth']);
                $("#web_partial").append(result['web_partial_public']);
                $("#android").append(result['android']);
                $("#ios").append(result['ios']);
            }
        });
    });
    // Apps details
    $(document).ready(function () {
        var department = null;
        var web = null;
        var public = null;
        var partial_public = null;
        var anroid = null;
        var ios = null;
        $('#applications').empty();
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'department': department, 'web': web, 'public': public, 'partial_public': partial_public, 'anroid': anroid, 'ios': ios, 'case': 'getApplications' },
            beforeSend: function () { // Before we send the request, remove the .hidden class from the spinner and default to inline-block.
                $('#js-preloader').fadeIn();
            },
            success: function (result) {
                var apps = JSON.parse(result);
                apps.forEach((datas, index, array) => {
                    var applications = `<div class="col-lg-2 mb-2" id="${datas.app_id}"> <div class="card appLayout1"><img src="${img_src + datas.application_icon}" class="appLayout1 card-img-top" alt="img" title="${datas.description}"> <div class="card-body p-2" title = "${datas.description}"><h5 title="${datas.application_name}" class="card-title mb-0">${datas.application_name}</h5><p class="card-text mb-1" title="${datas.department_name}">${datas.department_name}</p><div class="apps-link1">`;
                    if (datas['web_url'] && datas['web_public'] == 1) {
                        applications += `<i class="fa fa-laptop mx-1 public_applications" aria-hidden="true"><a class="stretched-link" title="External Link" href="${datas.web_url}" target="_blank"></a></i>`
                    } else if (datas['web_url'] && datas['web_partial_public'] == 1) {
                        applications += `<i class="fa fa-laptop mx-1 partial_public_applications" aria-hidden="true"><a class="stretched-link sso_validate_tngis" title="External Link" href="${datas.web_url}" target="_blank"></a><span class="tngis_app_id d-none">${datas.app_id}</span></i>`
                    } else if (datas['web_url'] && datas['web_authorized'] == 1) {
                        applications += `<i class="fa fa-laptop mx-1 authorized_applications" aria-hidden="true"><a class="stretched-link sso_validate_tngis" title="External Link" href="${datas.web_url}" target="_blank"></a><span class="tngis_app_id d-none">${datas.app_id}</span></i>`
                    }

                    if (datas['android_filename'] && datas['mobile_public'] == 1) {
                        applications += `<i class="fa fa-android mx-1 public_applications" aria-hidden="true" download="${datas.application_name}"><a class="stretched-link" href="${apk_url + datas.android_filename}" title="Android APK"></a></i>`;
                    } else if (datas['android_filename'] && datas['mobile_partial_public'] == 1) {
                        applications += `<i class="fa fa-android mx-1 partial_public_applications" aria-hidden="true" download="${datas.application_name}"><a class="stretched-link" href="${apk_url + datas.android_filename}" title="Android APK"></a></i>`;
                    } else if (datas['android_filename'] && datas['mobile_authorized'] == 1) {
                        applications += `<i class="fa fa-android mx-1 authorized_applications" aria-hidden="true" download="${datas.application_name}"><a class="stretched-link" href="${apk_url + datas.android_filename}" title="Android APK"></a></i>`;
                    }
                    if (datas['ios_filename'] && datas['mobile_public'] == 1) {
                        applications += `<i class="fa fa-info-circle mx-1 public_applications" aria-hidden="true" download="${datas.application_name}">
                    <a class="stretched-link" href="${ios_url + datas.ios_filename}" title="IOS"></a></i>`;
                    } else if (datas['ios_filename'] && datas['mobile_partial_public'] == 1) {
                        applications += `<i class="fa fa-info-circle mx-1 partial_public_applications" aria-hidden="true" download="${datas.application_name}">
                    <a class="stretched-link" href="${ios_url + datas.ios_filename}" title="IOS"></a></i>`;
                    } else if (datas['ios_filename'] && datas['mobile_authorized'] == 1) {
                        applications += `<i class="fa fa-info-circle mx-1 authorized_applications" aria-hidden="true" download="${datas.application_name}">
                    <a class="stretched-link" href="${ios_url + datas.ios_filename}" title="IOS"></a></i>`;
                    }
                    applications += `</div></div></div><div class="card appLayout2" style="display:none;"><div class="row g-0"><div class="col-md-5"><img src="${img_src + datas.application_icon}" class="appLayout2 img-fluid rounded-start" alt="img" title="${datas.description}"></img></div><div class="col-md-7"><div class="card-body"><h5 class="card-title mb-0" title="${datas.application_name}">${datas.application_name}</h5><p title="${datas.department_name}" class="card-text mb-1">${datas.department_name}</p><div class="apps-link1">`
                    if (datas['web_url'] && datas['web_public'] == 1) {
                        applications += `<i class="fa fa-laptop mx-1 public_applications" aria-hidden="true"><a class="stretched-link" title="External Link" href="${datas.web_url}" target="_blank"></a></i>`
                    } else if (datas['web_url'] && datas['web_partial_public'] == 1) {
                        applications += `<i class="fa fa-laptop mx-1 partial_public_applications" aria-hidden="true"><a class="stretched-link" title="External Link" href="${datas.web_url}" target="_blank"></a></i>`
                    } else if (datas['web_url'] && datas['web_authorized'] == 1) {
                        applications += `<i class="fa fa-laptop mx-1 authorized_applications" aria-hidden="true"><a class="stretched-link" title="External Link" href="${datas.web_url}" target="_blank"></a></i>`
                    }

                    if (datas['android_filename'] && datas['mobile_public'] == 1) {
                        applications += `<i class="fa fa-android mx-1 public_applications" aria-hidden="true" download="${datas.application_name}"><a class="stretched-link" href="${apk_url + datas.android_filename}" title="Android APK"></a></i>`;
                    } else if (datas['android_filename'] && datas['mobile_partial_public'] == 1) {
                        applications += `<i class="fa fa-android mx-1 partial_public_applications" aria-hidden="true" download="${datas.application_name}"><a class="stretched-link" href="${apk_url + datas.android_filename}" title="Android APK"></a></i>`;
                    } else if (datas['android_filename'] && datas['mobile_authorized'] == 1) {
                        applications += `<i class="fa fa-android mx-1 authorized_applications" aria-hidden="true" download="${datas.application_name}"><a class="stretched-link" href="${apk_url + datas.android_filename}" title="Android APK"></a></i>`;
                    }
                    if (datas['ios_filename'] && datas['mobile_public'] == 1) {
                        applications += `<i class="fa fa-info-circle mx-1 public_applications" aria-hidden="true" download="${datas.application_name}">
                    <a class="stretched-link" href="${ios_url + datas.ios_filename}" title="IOS"></a></i>`;
                    } else if (datas['ios_filename'] && datas['mobile_partial_public'] == 1) {
                        applications += `<i class="fa fa-info-circle mx-1 partial_public_applications" aria-hidden="true" download="${datas.application_name}">
                    <a class="stretched-link" href="${ios_url + datas.ios_filename}" title="IOS"></a></i>`;
                    } else if (datas['ios_filename'] && datas['mobile_authorized'] == 1) {
                        applications += `<i class="fa fa-info-circle mx-1 authorized_applications" aria-hidden="true" download="${datas.application_name}">
                    <a class="stretched-link" href="${ios_url + datas.ios_filename}" title="IOS"></a></i>`;
                    }
                    applications += `</div></div></div></div></div></div>`;
                    if ($("#applications").length) {
                        $('#applications').append(applications);
                    }
                });
            },
            complete: function () { // Set our complete callback, adding the .hidden class and hiding the spinner.
                $('#js-preloader').fadeOut()
            },
        });
    });
}

// Datatables
function buildTable(labels, objects, container, tableID) {
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    table.className = "table table-striped table-hover";
    table.id = tableID;
    var theadTr = document.createElement('tr');
    for (var i = 0; i < labels.length; i++) {
        var theadTh = document.createElement('th');
        theadTh.innerHTML = labels[i];
        theadTr.appendChild(theadTh);
    }
    thead.appendChild(theadTr);
    table.appendChild(thead);
    for (j = 0; j < objects.length; j++) {
        var tbodyTr = document.createElement('tr');
        for (k = 0; k < labels.length; k++) {
            var tbodyTd = document.createElement('td');
            tbodyTd.innerHTML = objects[j][labels[k].toLowerCase()];
            tbodyTr.appendChild(tbodyTd);
        }
        // tbodyTr.setAttribute("onclick", `getExtent(${objects[j]['id']})`);
        // tbodyTr.style.cursor = "pointer";
        tbody.appendChild(tbodyTr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
}

function layer_list_departments(filter_type, filter_value,) {
    $('#dataListDepartmentContent').empty();
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'filter_value': filter_value, 'filter_type': filter_type, 'case': 'getdataListDepartments' },
        success: function (result) {
            var result = JSON.parse(result);
            if (!jQuery.isEmptyObject(result)) {
                result.forEach((data, index, array) => {
                    var departments = `<div class="col-lg-3 d-flex align-items-stretch"><div class="card mb-2 w-100"><div class="card-body text-center bg-lg-blue p-2"><i class="mdi mdi-checkbox-marked-circle-outline font-22"></i><h6>${data.department}</h6></div></div></div>`;
                    $("#dataListDepartmentContent").append(departments);
                });
            }
        }
    });
}

function department_assets_list_departments(filter_type, filter_value,) {
    $('#dataViewDepartmentContent').empty();
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'filter_value': filter_value, 'filter_type': filter_type, 'case': 'getdataViewDepartments' },
        success: function (result) {
            var result = JSON.parse(result);
            if (!jQuery.isEmptyObject(result)) {
                result.forEach((data, index, array) => {
                    var departments = `<div class="col-lg-3 d-flex align-items-stretch"><div class="card mb-2 w-100"><div class="card-body text-center bg-lg-blue p-2"><i class="mdi mdi-checkbox-marked-circle-outline font-22"></i><h6>${data.department}</h6></div></div></div>`;
                    $("#dataViewDepartmentContent").append(departments);
                });
            }
        }
    });
}

function layer_list(dataList_offset, query, filter_type, filter_value) {
    $('#dataTableDiv').empty();
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'filter_value': filter_value, 'filter_type': filter_type, 'dataList_offset': dataList_offset, 'query': query, 'case': 'getdataList' },
        beforeSend: function () { // Before we send the request, remove the .hidden class from the spinner and default to inline-block.
            $("#js-preloader").show();
        },
        success: function (result) {
            var result = JSON.parse(result);
            lyr_count = result.slice(0, 1);
            lyr_count = lyr_count[0];
            dataList_total_count = lyr_count['count'];
            if (parseInt(dataList_total_count) <= 20) {
                $('#dataList_next').prop('disabled', true);
            } else {
                $('#dataList_next').prop('disabled', false);
            }
            $('#layer_count').html(lyr_count['layer_count']);
            $('#dept_lyr').html(lyr_count['lyr_dept']);
            $('#point').html(lyr_count['Point']);
            $('#line').html(lyr_count['Line']);
            $('#polygon').html(lyr_count['Polygon']);
            layers = result.slice(1);
            var labels = ['#', 'Theme', 'MapGroup', 'LayerGroup', 'Layers', 'Department', 'SubDepartment', 'SourceDepartment', 'View'];
            if ($('#dataTableDiv').length) {
                buildTable(labels, layers, document.getElementById('dataTableDiv'), 'dataTable');
                $('#dataTable').DataTable({
                    // responsive: true,
                    pagingType: "simple",
                    dom: 'Brtip',
                    'info': false,
                    bPaginate: false,
                    // buttons: [
                    //     {   
                    //         exportOptions: {
                    //             columns: [0,1,2,3,4,5,6,7]
                    //         },
                    //         extend: 'pdf',
                    //         orientation:'landscape',
                    //         pageSize:'A3',
                    //         title: 'Layer List',
                    //         text:'Download PDF'
                    //     },
                    //     {
                    //         extend: 'excel',
                    //         exportOptions: {
                    //             columns: [0,1,2,3,4,5,6,7]
                    //         },
                    //         title: 'Layer List',
                    //         text:'Download Excel'
                    //     }
                    // ]
                    "buttons": [
                        {
                            extend: 'excelHtml5',
                            text: 'Excel Download',
                            exportOptions: {
                                columns: [0, 1, 2, 3, 4, 5, 6, 7]
                            },
                            action: function (e, dt, node, config) {
                                download_all_data(query, filter_type, filter_value, query);
                            },
                            className: 'buttons-excel3'
                        },
                    ],
                });
            }
        },
        complete: function () { // Set our complete callback, adding the .hidden class and hiding the spinner.
            $("#js-preloader").hide();
        },
    });
}

var filter_flag = 0;

$("#point").on('click', function () { $("#filter_heading").html("Point Layer List"); layer_list(0, '', 'point'); $("#dataList_previous").val(20); $("#dataList_next").val(20); layer_list_departments('point'); filter_flag = 'point'; });
$("#line").on('click', function () { $("#filter_heading").html("Line Layer List"); layer_list(0, '', 'line'); $("#dataList_previous").val(20); $("#dataList_next").val(20); layer_list_departments('line'); filter_flag = 'line'; });
$("#polygon").on('click', function () { $("#filter_heading").html("Polygon Layer List"); layer_list(0, '', 'polygon'); $("#dataList_previous").val(20); $("#dataList_next").val(20); layer_list_departments('polygon'); filter_flag = 'polygon'; });
$("#layer_count").on('click', function () { $("#filter_heading").html("Layer List"); layer_list(0); $("#dataList_previous").val(20); $("#dataList_next").val(20); layer_list_departments(); filter_flag = 0 });

var Dept_filter_flag = 0;

$("#data_count").on('click', function () { $("#filter_heading_dept_assets").html("Department Assets"); $("#dataView_previous").val(20); $("#dataView_next").val(20); department_assets_list(0); department_assets_list_departments(); Dept_filter_flag = '0'; });
$("#data_tngis_availability").on('click', function () { $("#filter_heading_dept_assets").html("Available Assets"); $("#dataView_previous").val(20); $("#dataView_next").val(20); department_assets_list(0, '', 'withTngis'); department_assets_list_departments('withTngis'); Dept_filter_flag = 'withTngis'; });
$("#data_pending_count").on('click', function () { $("#filter_heading_dept_assets").html("Pending Assets"); $("#dataView_previous").val(20); $("#dataView_next").val(20); department_assets_list(0, '', 'pending'); department_assets_list_departments('pending'); Dept_filter_flag = 'pending'; });

if (page == 'data') {

    var dataList_offset;
    var dataList_total_count;

    $(document).on('click', '#dataList_previous', function (e) {
        dataList_offset = $('#dataList_previous').val();
        if (parseInt(dataList_offset) == 0 || parseInt(dataList_offset) == 20) {
            $('#dataList_previous').prop('disabled', true);
            $('#dataList_previous').val(dataList_offset);
        } else {
            $('#dataList_previous').prop('disabled', false);
            dataList_offset = parseInt(dataList_offset) - 20;
            filter_value = $("#DataList_filter_value").val();
            filter_type = $("#DataList_filter_condition").val();
            if (filter_value != 'all' && filter_type != 'all') {
                layer_list(parseInt(dataList_offset) - 20, '', filter_type, filter_value);
                layer_list_departments(filter_type, filter_value);
            } else if (filter_value != 'all') {
                if (filter_flag == 0) {
                    layer_list(parseInt(dataList_offset) - 20);
                    layer_list_departments();
                } else {
                    layer_list(parseInt(dataList_offset) - 20, '', filter_flag);
                    layer_list_departments(filter_flag);
                }
            } else {
                layer_list(parseInt(dataList_offset) - 20, '', filter_flag);
                layer_list_departments(filter_flag);
            }
            $('#dataList_previous').val(dataList_offset);
            $('#dataList_next').val(dataList_offset);
        }
    });

    $(document).on('click', '#dataList_next', function (e) {
        $('#dataList_previous').prop('disabled', false);
        dataList_offset = $('#dataList_next').val();
        if (parseInt(dataList_offset) >= parseInt(dataList_total_count)) {
            $('#dataList_next').prop('disabled', true);
        } else {
            filter_value = $("#DataList_filter_value").val();
            filter_type = $("#DataList_filter_condition").val();
            if (filter_value != 'all' && filter_type != 'all') {
                layer_list(dataList_offset, '', filter_type, filter_value);
                layer_list_departments(filter_type, filter_value);
            } else if (filter_value != 'all') {
                if (filter_flag == 0) {
                    layer_list(dataList_offset);
                    layer_list_departments();
                } else {
                    layer_list(dataList_offset, '', filter_flag);
                    layer_list_departments(filter_flag);
                }
            } else {
                layer_list(dataList_offset);
                layer_list_departments();
            }
            dataList_offset = parseInt(dataList_offset) + 20;
            $('#dataList_next').val(dataList_offset);
            $('#dataList_previous').val(dataList_offset);
            $('#dataList_next').prop('disabled', false);
        }
    });

    // Data List
    $(document).ready(function () {
        layer_list(0);
        layer_list_departments();
    });
    // Data View
    $(document).on('click', '#data_view_section', function (e) {
        department_assets_list();
        department_assets_list_departments();
    });

    // Spatial Assets Count
    $(document).ready(function () {
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'case': 'getSpatialAssetsCount' },
            success: function (result) {
                var result = JSON.parse(result);
                $('#layer_asset_count').html(result);
            }
        });
    });

    // layer search data List 
    $("#search_Datalayer").on("change", function () {
        var query = $("#search_Datalayer").val();
        $('#dataTableDiv').empty();
        if (query == '') {
            filter_value = $("#DataList_filter_value").val();
            filter_type = $("#DataList_filter_condition").val();
            if (filter_value != 'all' && filter_type != 'all') {
                layer_list(0, query, filter_type, filter_value);
            } else {
                layer_list(0, query);
                // layer_list_departments();
            }
        } else {
            filter_value = $("#DataList_filter_value").val();
            filter_type = $("#DataList_filter_condition").val();
            if (filter_value != 'all' && filter_type != 'all') {
                layer_list(0, query, filter_type, filter_value);
            } else {
                layer_list(0, query);
                // layer_list_departments();
            }
        }
    });

    var dataView_offset;
    var dataView_total_count;

    $(document).on('click', '#dataView_previous', function (e) {
        dataView_offset = $('#dataView_previous').val();
        if (parseInt(dataView_offset) == 0 || parseInt(dataView_offset) == 20) {
            $('#dataView_previous').prop('disabled', true);
            $('#dataView_previous').val(dataView_offset);
        } else {
            $('#dataView_previous').prop('disabled', false);
            dataView_offset = parseInt(dataView_offset) - 20;
            filter_value = $("#DataView_filters_value").val();
            filter_type = $("#DataView_filter_condition").val();
            if (filter_value != 'all' && filter_type != 'all') {
                department_assets_list(parseInt(dataView_offset) - 20, '', filter_type, filter_value);
                department_assets_list_departments(filter_type, filter_value);
            } else if (filter_value != 'all') {
                if (Dept_filter_flag == 0) {
                    department_assets_list(parseInt(dataView_offset) - 20);
                    department_assets_list_departments();
                } else {
                    department_assets_list(parseInt(dataView_offset) - 20, '', Dept_filter_flag);
                    department_assets_list_departments(Dept_filter_flag);
                }
            } else {
                department_assets_list(parseInt(dataView_offset) - 20, '', Dept_filter_flag);
                department_assets_list_departments(Dept_filter_flag);
            }
            $('#dataView_previous').val(dataView_offset);
            $('#dataView_next').val(dataView_offset);
        }
    });

    $(document).on('click', '#dataView_next', function (e) {
        $('#dataView_previous').prop('disabled', false);
        dataView_offset = $('#dataView_next').val();
        if (parseInt(dataView_offset) >= parseInt(dataView_total_count)) {
            $('#dataView_next').prop('disabled', true);
        } else {
            filter_value = $("#DataView_filters_value").val();
            filter_type = $("#DataView_filter_condition").val();
            if (filter_value != 'all' && filter_type != 'all') {
                department_assets_list(dataView_offset, '', filter_type, filter_value);
                department_assets_list_departments(filter_type, filter_value);
            } else if (filter_value != 'all') {
                if (Dept_filter_flag == 0) {
                    department_assets_list(dataView_offset);
                    department_assets_list_departments();
                } else {
                    department_assets_list(dataView_offset, '', Dept_filter_flag);
                    department_assets_list_departments(Dept_filter_flag);
                }
            } else {
                department_assets_list(dataView_offset);
                department_assets_list_departments();
            }
            dataView_offset = parseInt(dataView_offset) + 20;
            $('#dataView_next').val(dataView_offset);
            $('#dataView_previous').val(dataView_offset);
            $('#dataView_next').prop('disabled', false);
        }
    });

    // layer search data View 
    $("#search_DeptList").on("change", function () {
        var query = $("#search_DeptList").val();
        $('#dataTableDiv').empty();
        if (query == '') {
            filter_value = $("#DataView_filters_value").val();
            filter_type = $("#DataView_filter_condition").val();
            if (filter_value != 'all' && filter_type != 'all') {
                department_assets_list(0, query, filter_type, filter_value);
            } else {
                department_assets_list(0, query);
            }
        } else {
            filter_value = $("#DataView_filters_value").val();
            filter_type = $("#DataView_filter_condition").val();
            if (filter_value != 'all' && filter_type != 'all') {
                department_assets_list(0, query, filter_type, filter_value);
            } else {
                department_assets_list(0, query);
            }
        }
    });
}

function department_assets_list(dataView_offset, query, filter_type, filter_value) {
    $('#dataViewTableDiv').empty();
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'filter_type': filter_type, 'filter_value': filter_value, 'dataView_offset': dataView_offset, 'query': query, 'case': 'getdataView' },
        beforeSend: function () { // Before we send the request, remove the .hidden class from the spinner and default to inline-block.
            $("#js-preloader").show();
        },
        success: function (result) {
            var result = JSON.parse(result);
            console.log(result);
            lyr_count = result.slice(0, 1);
            lyr_count = lyr_count[0];
            dataView_total_count = lyr_count['count'];
            if (parseInt(dataView_total_count) <= 20) {
                $('#dataView_offset').prop('disabled', true);
            } else {
                $('#dataView_offset').prop('disabled', false);
            }
            $('#data_count').html(lyr_count['assets_count']);
            $('#data_dept').html(lyr_count['data_dept']);
            $('#data_tngis_availability').html(lyr_count['tngis_status']);
            $('#data_pending_count').html(lyr_count['pending']);
            layers = result.slice(1);
            var labels = ['#', 'Department', 'SubDepartment', 'DepartmentType', 'Assets', 'Availability_In_TNGIS', 'TNGIS_Nodal_Officer', 'API_Availability'];
            if ($('#dataViewTableDiv').length) {
                buildTable(labels, layers, document.getElementById('dataViewTableDiv'), 'dataViewTable');
                $('#dataViewTable').DataTable({
                    // responsive: true,
                    // responsive: {
                    //     details: {
                    //         display: $.fn.dataTable.Responsive.display.childRowImmediate,
                    //         type: 'none',
                    //         target: ''
                    //     }
                    // },
                    pagingType: "simple",
                    dom: 'Brtip',
                    'info': false,
                    bPaginate: false,
                    buttons: [
                        {
                            exportOptions: {
                                columns: [0, 1, 2, 3, 4, 5, 6, 7]
                            },
                            extend: 'pdf',
                            orientation: 'landscape',
                            pageSize: 'A3',
                            title: 'Department Pending Assets',
                            text: 'Download PDF'
                        },
                        {
                            extend: 'excel',
                            exportOptions: {
                                columns: [0, 1, 2, 3, 4, 5, 6, 7]
                            },
                            title: 'Department Pending Assets',
                            text: 'Download Excel'
                        }
                    ]
                });
            }
        },
        complete: function () { // Set our complete callback, adding the .hidden class and hiding the spinner.
            $("#js-preloader").hide();
        },
    });
}


// Search Department
$("#search_dept").on("keyup", function () {
    var query = $(this).val();
    if (query !== "") {
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'query': query, 'case': 'getApplications' },
            success: function (result) {
                var app_ids = JSON.parse(result);
                if (jQuery.isEmptyObject(app_ids[0])) {
                    $.ajax({
                        type: "POST",
                        url: api + "api_results.php",
                        data: { 'case': 'getApplications' },
                        success: function (result) {
                            var app_ids = JSON.parse(result);
                            if (!jQuery.isEmptyObject(app_ids)) {
                                app_ids.forEach((code, index, array) => {
                                    $('#' + code['app_id']).css("display", "none");
                                });
                                $('#applications').append("<h4 class='text-center text-danger'>No Result Found !!!</h4>");
                            };
                        }
                    });
                } else {
                    var app_id = app_ids[0];
                    var app_id_notIN = app_ids[1];
                    if (!jQuery.isEmptyObject(app_id)) {
                        app_id.forEach((code, index, array) => {
                            $('#' + code).css("display", "block");
                        });
                    };
                    if (!jQuery.isEmptyObject(app_id_notIN)) {
                        app_id_notIN.forEach((code, index, array) => {
                            $('#' + code).css("display", "none");
                        });
                    };
                }
            }
        });
    }
    else {
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'query': query, 'case': 'getApplications' },
            success: function (result) {
                var app_ids = JSON.parse(result);
                if (!jQuery.isEmptyObject(app_ids)) {
                    app_ids.forEach((code, index, array) => {
                        $('#' + code['app_id']).css("display", "block");
                    });
                };
            }
        });
    }
});

// Search Application 
$("#search_apps").on("keyup", function () {
    var application = $(this).val();
    if (application !== "") {
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'application': application, 'case': 'getApplications' },
            success: function (result) {
                var app_ids = JSON.parse(result);
                if (jQuery.isEmptyObject(app_ids[0])) {
                    $.ajax({
                        type: "POST",
                        url: api + "api_results.php",
                        data: { 'case': 'getApplications' },
                        success: function (result) {
                            var app_ids = JSON.parse(result);
                            if (!jQuery.isEmptyObject(app_ids)) {
                                app_ids.forEach((code, index, array) => {
                                    $('#' + code['app_id']).css("display", "none");
                                });
                                $('#applications').append("<h4 class='text-center text-danger'>No Result Found !!!</h4>");
                            };
                        }
                    });
                } else {
                    var app_id = app_ids[0];
                    var app_id_notIN = app_ids[1];
                    if (!jQuery.isEmptyObject(app_ids)) {
                        app_ids.forEach((code, index, array) => {
                            $('#' + code).css("display", "block");
                        });
                    }
                    if (!jQuery.isEmptyObject(app_id_notIN)) {
                        app_id_notIN.forEach((code, index, array) => {
                            $('#' + code).css("display", "none");
                        });
                    }
                }
            }
        });
    }
    else {
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'application': application, 'case': 'getApplications' },
            success: function (result) {
                var app_ids = JSON.parse(result);
                if (!jQuery.isEmptyObject(app_ids)) {
                    app_ids.forEach((code, index, array) => {
                        $('#' + code['app_id']).css("display", "block");
                    });
                };
            }
        });
    }
});

// Data List Filter Condition Onchange
$(document).on('change', '#DataList_filter_condition', function () {
    filter_type = $("#DataList_filter_condition").val();
    $("#DataList_filter_value").empty();
    query = $("#search_Datalayer").val();
    if (filter_type == 'all') {
        layer_list(0, query);
        layer_list_departments();
        $("#DataList_filter_value").html("<option selected value = 'all'>All</option>");
    } else if (filter_type) {
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'filter_type': filter_type, 'case': 'searchDataListfilter' },
            success: function (result) {
                $("#DataList_filter_value").html(result);
            }
        });
    }
});

// Data List Filter Value Onchange
$(document).on('change', '#DataList_filter_value', function () {
    filter_value = $("#DataList_filter_value").val();
    filter_type = $("#DataList_filter_condition").val();
    query = $("#search_Datalayer").val();
    if (filter_value != 'all' && filter_type != 'all') {
        layer_list(0, query, filter_type, filter_value);
        layer_list_departments(filter_type, filter_value);
    } else if (filter_value != 'all') {
        layer_list(0, query);
        layer_list_departments();
    } else {
        layer_list(0, query);
        layer_list_departments();
    }
});

// Data View Filter Condition Onchange
$(document).on('change', '#DataView_filter_condition', function () {
    filter_type = $("#DataView_filter_condition").val();
    $("#DataView_filter_value").empty();
    if (filter_type == 'all') {
        department_assets_list(0);
        department_assets_list_departments();
        $("#DataView_filter_value").html("<option selected value = 'all'>All</option>");
    } else if (filter_type) {
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'filter_type': filter_type, 'case': 'searchDataViewfilter' },
            success: function (result) {
                $("#DataView_filters_value").html(result);
            }
        });
    }
});

// Data View Filter Value Onchange
$(document).on('change', '#DataView_filters_value', function () {
    filter_value = $("#DataView_filters_value").val();
    filter_type = $("#DataView_filter_condition").val();
    query = $("#search_DeptList").val();
    if (filter_value != 'all' && filter_type != 'all') {
        department_assets_list(0, query, filter_type, filter_value);
        department_assets_list_departments(filter_type, filter_value);
    } else if (filter_value != 'all') {
        department_assets_list(0);
        department_assets_list_departments();
    } else {
        department_assets_list(0);
        department_assets_list_departments();
    }
});

function api_list(api_offset) {
    $('#apiTableDiv').empty();
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'api_offset': api_offset, 'case': 'getapiDetails' },
        success: function (result) {
            var result = JSON.parse(result);
            if (result == false) {
                $('#api_pag_buttons').empty();
                $('#api_pag_buttons').append('No Data');

            } else {
                var labels = ['#', 'Name', 'Description'];
                api_total_count = result[0]['total_count'];
                if (parseInt(api_total_count) <= 20) {
                    $('#api_next').prop('disabled', true);
                } else {
                    $('#api_next').prop('disabled', false);
                }
                buildTable(labels, result, document.getElementById('apiTableDiv'), 'apiTable');
                $('#apiTable').DataTable({
                    // responsive: true,
                    pagingType: "simple",
                    dom: 'Brtip',
                    'info': false,
                    bPaginate: false,
                    buttons: [
                        {
                            exportOptions: {
                                columns: [0, 1, 2]
                            },
                            extend: 'pdf',
                            orientation: 'landscape',
                            pageSize: 'A3',
                            title: 'API List',
                            text: 'Download PDF'
                        },
                        {
                            extend: 'excel',
                            exportOptions: {
                                columns: [0, 1, 2]
                            },
                            title: 'API List',
                            text: 'Download Excel'
                        }
                    ]
                });
            }
        }
    });
}

function excel_download(excel_offset) {
    $('#excelDownloadTableDiv').empty();
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'excel_offset': excel_offset, 'case': 'getexcelDownload' },
        success: function (result) {
            var result = JSON.parse(result);
            var labels = ['#', 'Name', 'Created Date', 'Last Updated Date'];
            excel_total_count = result[0]['excel_count'];
            if (parseInt(excel_total_count) <= 20) {
                $('#excel_next').prop('disabled', true);
            } else {
                $('#excel_next').prop('disabled', false);
            }
            buildTable(labels, result, document.getElementById('excelDownloadTableDiv'), 'excelDownloadTable');
            $('#excelDownloadTable').DataTable({
                // responsive: true,
                pagingType: "simple",
                dom: 'Brtip',
                'info': false,
                bPaginate: false,
                buttons: [
                    {
                        exportOptions: {
                            columns: [0, 1, 2, 3]
                        },
                        extend: 'pdf',
                        orientation: 'landscape',
                        pageSize: 'A3',
                        title: 'Masters List',
                        text: 'Download PDF'
                    },
                    {
                        extend: 'excel',
                        exportOptions: {
                            columns: [0, 1, 2, 3]
                        },
                        title: 'Masters List',
                        text: 'Download Excel'
                    }
                ]
            });
        }
    });
}

if (page == 'api') {
    // Excel download next and previous
    var excel_offset;
    var excel_total_count;
    $(document).on('click', '#excel_previous', function (e) {
        excel_offset = $('#excel_previous').val();
        if (parseInt(excel_offset) == 0 || parseInt(excel_offset) == 20) {
            $('#excel_previous').prop('disabled', true);
            $('#excel_previous').val(excel_offset);
        } else {
            $('#excel_previous').prop('disabled', false);
            excel_offset = parseInt(excel_offset) - 20;
            excel_download(parseInt(excel_offset) - 20);
            $('#excel_previous').val(excel_offset);
            $('#excel_next').val(excel_offset);
        }
    });

    $(document).on('click', '#excel_next', function (e) {
        $('#excel_previous').prop('disabled', false);
        excel_offset = $('#excel_next').val();
        if (parseInt(excel_offset) >= parseInt(excel_total_count)) {
            $('#excel_next').prop('disabled', true);
        } else {
            excel_download(excel_offset);
            excel_offset = parseInt(excel_offset) + 20;
            $('#excel_next').val(excel_offset);
            $('#excel_previous').val(excel_offset);
            $('#excel_next').prop('disabled', false);
        }
    });
    excel_download(0);

    // API next and previous
    var api_offset;
    var api_total_count;
    $(document).on('click', '#api_previous', function (e) {
        api_offset = $('#api_previous').val();
        if (parseInt(api_offset) == 0 || parseInt(api_offset) == 20) {
            $('#api_previous').prop('disabled', true);
            $('#api_previous').val(api_offset);
        } else {
            $('#api_previous').prop('disabled', false);
            api_offset = parseInt(api_offset) - 20;
            api_list(parseInt(api_offset) - 20);
            $('#api_previous').val(api_offset);
            $('#api_next').val(api_offset);
        }
    });

    $(document).on('click', '#api_next', function (e) {
        $('#api_previous').prop('disabled', false);
        api_offset = $('#api_next').val();
        if (parseInt(api_offset) >= parseInt(api_total_count)) {
            $('#api_next').prop('disabled', true);
        } else {
            api_list(api_offset);
            api_offset = parseInt(api_offset) + 20;
            $('#api_next').val(api_offset);
            $('#api_previous').val(api_offset);
            $('#api_next').prop('disabled', false);
        }
    });
    api_list(0);
}


function downloadVectorFilesList(downloadVector_offset, query) {
    $('#downloadTableDiv').empty();
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'downloadVector_offset': downloadVector_offset, 'query': query, 'case': 'getdownloadData' },
        success: function (result) {
            var result = JSON.parse(result);
            var labels = ['#', 'Layers', 'Vector Files'];
            if (result == false) {
                buildTable(labels, result, document.getElementById('downloadTableDiv'), 'downloadTable');
                $('#downloadTable').DataTable({
                    responsive: true,
                    pagingType: "simple",
                    dom: 'Brtip',
                    'info': false,
                    bPaginate: false,
                    buttons: [
                        {
                            exportOptions: {
                                columns: [0, 1]
                            },
                            extend: 'pdf',
                            orientation: 'landscape',
                            pageSize: 'A3',
                            title: 'Vector List',
                            text: 'Download PDF'
                        },
                        {
                            extend: 'excel',
                            exportOptions: {
                                columns: [0, 1]
                            },
                            title: 'Vector List',
                            text: 'Download Excel'
                        }
                    ]
                });
            } else {
                downloadVector_total_count = result[0]['vectorCount'];
                if (parseInt(downloadVector_total_count) <= 20) {
                    $('#downloadVector_next').prop('disabled', true);
                } else {
                    $('#downloadVector_next').prop('disabled', false);
                }
                buildTable(labels, result, document.getElementById('downloadTableDiv'), 'downloadTable');
                $('#downloadTable').DataTable({
                    responsive: true,
                    pagingType: "simple",
                    dom: 'Brtip',
                    'info': false,
                    bPaginate: false,
                    buttons: [
                        {
                            exportOptions: {
                                columns: [0, 1]
                            },
                            extend: 'pdf',
                            orientation: 'landscape',
                            pageSize: 'A3',
                            title: 'Vector List',
                            text: 'Download PDF'
                        },
                        {
                            extend: 'excel',
                            exportOptions: {
                                columns: [0, 1]
                            },
                            title: 'Vector List',
                            text: 'Download Excel'
                        }
                    ]
                });
            }
        }
    });
}

function downloadPDF(downloadpdf_offset, query) {
    $('#downloadPdfTableDiv').empty();
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'downloadpdf_offset': downloadpdf_offset, 'query': query, 'case': 'getpdfDownload' },
        success: function (result) {
            result = JSON.parse(result);
            var labels = ['#', 'Maps'];
            if (result == false) {
                buildTable(labels, result, document.getElementById('downloadPdfTableDiv'), 'downloadPdfTable');
                $('#downloadPdfTable').DataTable({
                    // responsive: true,
                    pagingType: "simple",
                    dom: 'Brtip',
                    'info': false,
                    bPaginate: false,
                    buttons: [
                        {
                            exportOptions: {
                                columns: [0, 1]
                            },
                            extend: 'pdf',
                            orientation: 'landscape',
                            pageSize: 'A3',
                            title: 'Downloads',
                            text: 'Download PDF'
                        },
                        {
                            extend: 'excel',
                            exportOptions: {
                                columns: [0, 1]
                            },
                            title: 'Downloads',
                            text: 'Download Excel'
                        }
                    ]
                });
            } else {
                downloadPdf_total_count = result[0]['pdf_count'];
                if (parseInt(downloadPdf_total_count) <= 20) {
                    $('#downloadPdf_next').prop('disabled', true);
                } else {
                    $('#downloadPdf_next').prop('disabled', false);
                }
                buildTable(labels, result, document.getElementById('downloadPdfTableDiv'), 'downloadPdfTable');
                $('#downloadPdfTable').DataTable({
                    // responsive: true,
                    pagingType: "simple",
                    dom: 'Brtip',
                    'info': false,
                    bPaginate: false,
                    buttons: [
                        {
                            exportOptions: {
                                columns: [0, 1]
                            },
                            extend: 'pdf',
                            orientation: 'landscape',
                            pageSize: 'A3',
                            title: 'Downloads',
                            text: 'Download PDF'
                        },
                        {
                            extend: 'excel',
                            exportOptions: {
                                columns: [0, 1]
                            },
                            title: 'Downloads',
                            text: 'Download Excel'
                        }
                    ]
                });
            }
        }
    });
}

if (page == 'downloads') {
    // Vector files Download next and previous
    var filter_layer = $("#search_vector_download").val();
    var downloadVector_offset;
    var downloadVector_total_count;
    $(document).on('click', '#downloadVector_previous', function (e) {
        downloadVector_offset = $('#downloadVector_previous').val();
        if (parseInt(downloadVector_offset) == 0 || parseInt(downloadVector_offset) == 20) {
            $('#downloadVector_previous').prop('disabled', true);
            $('#downloadVector_previous').val(downloadVector_offset);
        } else {
            $('#downloadVector_previous').prop('disabled', false);
            downloadVector_offset = parseInt(downloadVector_offset) - 20;
            downloadVectorFilesList(parseInt(downloadVector_offset) - 20, filter_layer);
            $('#downloadVector_previous').val(downloadVector_offset);
            $('#downloadVector_next').val(downloadVector_offset);
        }
    });

    $(document).on('click', '#downloadVector_next', function (e) {
        $('#downloadVector_previous').prop('disabled', false);
        downloadVector_offset = $('#downloadVector_next').val();
        if (parseInt(downloadVector_offset) >= parseInt(downloadVector_total_count)) {
            $('#downloadVector_next').prop('disabled', true);
        } else {
            downloadVectorFilesList(downloadVector_offset, filter_layer);
            downloadVector_offset = parseInt(downloadVector_offset) + 20;
            $('#downloadVector_next').val(downloadVector_offset);
            $('#downloadVector_previous').val(downloadVector_offset);
            $('#downloadVector_next').prop('disabled', false);
        }
    });
    downloadVectorFilesList(0);

    $(document).on('change', '#search_vector_download', function () {
        filter_layer = $("#search_vector_download").val();
        if (filter_layer != '') {
            downloadVectorFilesList(0, filter_layer);
        } else {
            downloadVectorFilesList(0);
        }
    });


    //download PDF 
    var downloadpdf_offset;
    var downloadPdf_total_count;
    var filter_layer_pdf = $("#searchPdf_download").val();

    $(document).on('click', '#downloadPdf_previous', function (e) {
        downloadpdf_offset = $('#downloadPdf_previous').val();
        if (parseInt(downloadpdf_offset) == 0 || parseInt(downloadpdf_offset) == 20) {
            $('#downloadPdf_previous').prop('disabled', true);
            $('#downloadPdf_previous').val(downloadpdf_offset);
        } else {
            $('#downloadPdf_previous').prop('disabled', false);
            downloadpdf_offset = parseInt(downloadpdf_offset) - 20;
            if (filter_layer_pdf != '') {
                downloadPDF(parseInt(downloadpdf_offset) - 20, filter_layer_pdf);
            } else {
                downloadPDF(parseInt(downloadpdf_offset) - 20);
            }
            $('#downloadPdf_previous').val(downloadpdf_offset);
            $('#downloadPdf_next').val(downloadpdf_offset);
        }
    });

    $(document).on('click', '#downloadPdf_next', function (e) {
        $('#downloadPdf_previous').prop('disabled', false);
        downloadpdf_offset = $('#downloadPdf_next').val();
        if (parseInt(downloadpdf_offset) >= parseInt(downloadPdf_total_count)) {
            $('#downloadPdf_next').prop('disabled', true);
        } else {
            if (filter_layer_pdf != '') {
                downloadPDF(downloadpdf_offset, filter_layer_pdf);
            } else {
                downloadPDF(downloadpdf_offset);
            }
            downloadpdf_offset = parseInt(downloadpdf_offset) + 20;
            $('#downloadPdf_next').val(downloadpdf_offset);
            $('#downloadPdf_previous').val(downloadpdf_offset);
            $('#downloadPdf_next').prop('disabled', false);
        }
    });

    downloadPDF(0);

    $(document).on('change', '#searchPdf_download', function () {
        filter_layer_pdf = $("#searchPdf_download").val();
        if (filter_layer_pdf != '') {
            downloadPDF(0, filter_layer_pdf);
        } else {
            downloadPDF(0);
        }
    });

    $(document).ready(function () {
        $('#card-container').empty();
        $.ajax({
            type: "POST",
            url: api + "api_results.php",
            data: { 'case': 'getDocumentsDownload' },
            success: function (result) {
                var result = JSON.parse(result);
                if (!jQuery.isEmptyObject(result)) {
                    const cardContainer = document.getElementById('card-container');
                    result.forEach(item => {
                        // Create the card component
                        const cardHeader = document.createElement('div');
                        cardHeader.classList.add('col-lg-3', 'col-md-6', 'col-12', 'align-items-stretch', 'd-flex');

                        const card = document.createElement('div');
                        card.classList.add('card', 'mb-2', 'w-100');

                        // Create the card body
                        const cardBody = document.createElement('div');
                        cardBody.classList.add('card-body', 'text-center');

                        // Create the heading
                        const heading = document.createElement('h6');
                        heading.textContent = item.document_name;

                        // Create the link
                        const link = document.createElement('a');
                        if (item.file_path == null) {
                            link.href = '#';
                        } else {
                            link.href = item.file_path;
                            link.download = item.document_name;
                        }

                        // Create the icon
                        const icon = document.createElement('i');
                        icon.classList.add('mdi', 'mdi-file-pdf');

                        // Create the text
                        const text = document.createElement('span');
                        text.classList.add('mx-1');
                        text.textContent = 'Download PDF';

                        // Append the icon and text to the link
                        link.appendChild(icon);
                        link.appendChild(text);

                        // Append the heading and link to the card body
                        cardBody.appendChild(heading);
                        cardBody.appendChild(link);

                        // Append the card body to the card
                        card.appendChild(cardBody);
                        cardHeader.appendChild(card);
                        // Append the card to the card container
                        cardContainer.appendChild(cardHeader);
                    });
                }
            }
        });
    });
}

//Administrative counts 
$(document).ready(function () {
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'case': 'getAdminCount' },
        success: function (result) {
            var result = JSON.parse(result);
            var owl = $('.main-content .owl-carousel').owlCarousel({
                stagePadding: 50,
                loop: true,
                margin: 10,
                nav: true,
                autoplay: true,
                autoplayTimeout: 2000,
                smartSpeed: 1000,
                autoplayHoverPause: true,
                navText: [
                    '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                    '<i class="fa fa-angle-right" aria-hidden="true"></i>'
                ],
                navContainer: '.main-content .custom-nav',
                responsive: {
                    0: {
                        items: 1
                    },
                    600: {
                        items: 3
                    },
                    1000: {
                        items: 5
                    }
                }
            });
            if (!jQuery.isEmptyObject(result)) {
                result.forEach((data, index, array) => {
                    if (data['admin_boundary_name'] == 'Revenue Village') {
                        $("#admin_owl").trigger('add.owl.carousel', ['<div class="item"><a href="' + data['file'] + '"<div class="info-item card1"><div class="icon txt-blue">' + data['gis_count'] + '</div><h4><span>' + data['admin_boundary_name'] + '</span></h4></div></a></div>']).trigger('refresh.owl.carousel');
                    } else {
                        $("#admin_owl").trigger('add.owl.carousel', ['<div class="item"><a href="' + data['file'] + '" download = "' + data['admin_boundary_name'] + '"<div class="info-item card1"><div class="icon txt-blue">' + data['gis_count'] + '</div><h4><span>' + data['admin_boundary_name'] + '</span></h4></div></a></div>']).trigger('refresh.owl.carousel');
                    }
                });
            }
        }
    });
});

function sectors() {
    var sectors;
    $.ajax({
        type: "POST",
        url: api + "api_results.php",
        data: { 'case': 'getSectorsDetails' },
        success: function (result) {
            var result = JSON.parse(result);
            if (result == false) {
                $('.gis-sector').html("No Data");
            } else {
                if (!jQuery.isEmptyObject(result)) {
                    result.forEach((data, index, array) => {
                        if (data['sector_app_url']) {
                            sectors = `<a href="${data.sector_app_url}" target="_blank" class="sector_apps"><span class="badge text-bg-primary sector-box mx-1 mb-2">`;
                        } else {
                            sectors = `<a href="#" target="_blank"><span class="badge text-bg-primary sector-box-progress mx-1 mb-2"> `;
                        }
                        sectors += ``;
                        if (data['sector_image_filename']) {
                            sectors += `<img src="${data.sector_image_filename}" class="img-fluid sector-imgs" alt="logo">`;
                        } else {
                        }
                        sectors += `<span>${data.sector_name}</span></span></a>`;
                        $(".gis-sector").append(sectors);
                    });
                }
            }
        }
    });
}

sectors();
