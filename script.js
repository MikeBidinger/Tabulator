var table;
const tables = ["Table", "Hierarchy"];
const models = ["MOD"];

// localStorage.clear();
console.log(localStorage);

// Set table height on window resize event
window.addEventListener(
    "resize",
    function (event) {
        document.getElementById("table").style.height =
            window.innerHeight -
            document.getElementById("top-bar").offsetHeight -
            18 +
            "px";
    },
    true
);

// Initialize application
createSelections(tables, "table");
createSelections(models, "model");
initTable();

function testFunction() {
    window.alert("Testing");
}

function createSelections(selections, idPrefix) {
    // Create selection options for each element
    var selectEl = document.getElementById(idPrefix + "-selection");
    var option;
    for (selection of selections) {
        option = document.createElement("option");
        option.value = selection;
        option.text = selection;
        selectEl.add(option);
    }
}

function initTable() {
    document.getElementById("filter-menu").classList.add("not-visible");
    document.getElementById("table").innerHTML = "";
    getHeaders(
        document.getElementById("table-selection").value,
        document.getElementById("model-selection").value
    );
}

function getHeaders(type, model) {
    // Get JSON headers and create the table
    fetch("data/" + model + "_Headers.json")
        .then((r) => r.json())
        .then((data) => createTable(data, type, model));
}

function createTable(headerData, type, model) {
    var dataTree = false;
    // Set columns
    var fixedCol = headerData["fixed_header"];
    columns = setTableColumns(type, fixedCol, headerData["headers"], model);
    // Set table
    if (type == tables[0]) {
        // Set filter
        initFilter(columns);
        // Show table filter rows element
        document.getElementById("filter-table").classList.remove("not-visible");
    } else if (type == tables[1]) {
        // Set nested tree data
        dataTree = true;
        // Hide table filter rows element
        document.getElementById("filter-table").classList.add("not-visible");
    }
    // Init table
    table = new Tabulator("#table", {
        height:
            window.innerHeight -
            document.getElementById("top-bar").offsetHeight -
            18,
        // layout: "fitDataTable",
        dataTree: dataTree,
        columns: columns,
        movableColumns: true,
        selectable: true,
    });
    // Add table filter event
    table.on("dataFiltered", function (filters, rows) {
        document.getElementById("filter-rows-result").innerHTML = rows.length;
        document.getElementById("filter-rows-total").innerHTML =
            table.getRows().length;
    });
    // Add table selection event
    document.getElementById("filter-rows-select").innerHTML = 0;
    table.on("rowSelectionChanged", function (data, rows) {
        document.getElementById("filter-rows-select").innerHTML = data.length;
    });
}

function setTableColumns(type, fixedCol, headers, model) {
    // Set columns
    var columns = [
        {
            title: fixedCol,
            field: fixedCol,
            frozen: true,
            responsive: 0,
            headerMenu: headerMenu,
            headerTooltip: true,
            tooltip: true,
            visible: true,
        },
    ];
    if (type == tables[0]) {
        columns[0].headerFilter = "input";
    }
    // Get user column settings
    var userType = JSON.parse(localStorage.getItem(type));
    var userColumns = { fields: [], widths: [] };
    if (userType != null) {
        if (model in userType) {
            userColumns.fields = userType[model].fields;
            userColumns.widths = userType[model].widths;
        }
    }
    // Set user column settings (visible)
    for (var i = 0; i < userColumns.fields.length; i++) {
        if (userColumns.fields[i] == fixedCol) {
            columns[0].width = userColumns.widths[i];
        } else {
            addTableColumn(
                type,
                columns,
                true,
                userColumns.fields[i],
                userColumns.widths[i]
            );
        }
    }
    // Set remaining data columns (not visible)
    for (header of headers) {
        if (userColumns.fields.includes(header) == false) {
            if (header != fixedCol) {
                addTableColumn(type, columns, false, header);
            }
        }
    }
    return columns;
}

function addTableColumn(type, columns, visible, header, width = "") {
    var column = {};
    column.title = header;
    column.field = header;
    column.headerMenu = headerMenu;
    column.visible = visible;
    column.headerTooltip = true;
    column.tooltip = true;
    if (width != "") {
        column.width = width;
    }
    if (type == tables[0]) {
        column.headerFilter = "input";
    }
    columns.push(column);
}

function loadData() {
    document.getElementsByTagName("body")[0].style.cursor = "progress";
    var type = document.getElementById("table-selection").value;
    var model = document.getElementById("model-selection").value;
    // Get JSON model data for table
    fetch("data/" + model + "_" + type + ".json")
        .then((r) => r.json())
        .then((data) =>
            table
                .setData(data)
                .then(function () {
                    document.getElementsByTagName("body")[0].style.cursor =
                        "default";
                })
                .catch(function (error) {
                    window.alert("Error occurred while loading data!");
                })
        );
}

function saveColumnSettings() {
    // Get selections
    var type = document.getElementById("table-selection").value;
    var model = document.getElementById("model-selection").value;
    // Get column settings
    var userColumns = { fields: [], widths: [] };
    var columns = table.getColumns();
    for (let column of columns) {
        if (column.isVisible()) {
            userColumns.fields.push(column._column.field);
            userColumns.widths.push(column._column.width);
        }
    }
    // Format user data for saving
    var userType = JSON.parse(localStorage.getItem(type));
    if (userType == null) {
        userType = {};
    }
    userType[model] = userColumns;
    // Save column settings
    if (
        window.confirm(
            "You're about to save/overwrite your current column settings." +
                "\nAre you sure?"
        )
    ) {
        localStorage.setItem(type, JSON.stringify(userType));
        window.alert("Column settings saved.");
    }
}

// ---------------------------------------- Header menu (column selection menu):

var headerMenu = function () {
    var menu = [];
    var columns = this.getColumns();

    for (let column of columns) {
        //create checkbox element using font awesome icons
        let icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add(
            column.isVisible() ? "fa-check-square" : "fa-square"
        );

        //build label
        let label = document.createElement("span");
        let title = document.createElement("span");

        title.textContent = " " + column.getDefinition().title;

        label.appendChild(icon);
        label.appendChild(title);

        //create menu item
        menu.push({
            label: label,
            action: function (e) {
                //prevent menu closing
                e.stopPropagation();

                //toggle current column visibility
                column.toggle();

                //change menu item icon
                if (column.isVisible()) {
                    icon.classList.remove("fa-square");
                    icon.classList.add("fa-check-square");
                } else {
                    icon.classList.remove("fa-check-square");
                    icon.classList.add("fa-square");
                }
            },
        });
    }

    return menu;
};

// ---------------------------------------------------------------- Filter menu:

var fieldEl = document.getElementById("filter-field");
var typeEl = document.getElementById("filter-type");
var valueEl = document.getElementById("filter-value");

function initFilter(columns) {
    var filterMenu = document.getElementById("filter-menu");
    // Set all headers (columns) to filter fields
    setFieldFilter(fieldEl, columns);
    // Set all filter types to filter
    setFilterTypes(typeEl);
    // Update filters on value change
    document
        .getElementById("filter-field")
        .addEventListener("change", updateFilter);
    document
        .getElementById("filter-type")
        .addEventListener("change", updateFilter);
    document
        .getElementById("filter-value")
        .addEventListener("keyup", updateFilter);
    // Clear filters on Clear Filter button
    document
        .getElementById("filter-clear")
        .addEventListener("click", function () {
            clearFilterMenu();
        });
    filterMenu.classList.remove("not-visible");
}

function setFieldFilter(fieldEl, columns) {
    // Delete all options
    fieldEl.innerHTML = "";
    // Add options
    var optionEl = document.createElement("option");
    fieldEl.appendChild(optionEl);
    for (col of columns) {
        var optionEl = document.createElement("option");
        optionEl.value = col.field;
        optionEl.textContent = col.title;
        fieldEl.appendChild(optionEl);
    }
}

function setFilterTypes(typeEl) {
    // Delete all options
    typeEl.innerHTML = "";
    // Add options
    var types = [
        "like",
        "=",
        "!=",
        "<",
        ">",
        "<=",
        ">=",
        "keywords",
        "starts",
        "ends",
        "regex",
    ];
    for (typ of types) {
        var optionEl = document.createElement("option");
        optionEl.value = typ;
        optionEl.textContent = typ;
        typeEl.appendChild(optionEl);
    }
}

function updateFilter() {
    var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
    var typeVal = typeEl.options[typeEl.selectedIndex].value;
    var filter = filterVal == "function" ? customFilter : filterVal;
    if (filterVal == "function") {
        typeEl.disabled = true;
        valueEl.disabled = true;
    } else {
        typeEl.disabled = false;
        valueEl.disabled = false;
    }
    if (filterVal) {
        table.setFilter(filter, typeVal, valueEl.value);
    }
}

function clearFilterMenu() {
    // Clear filter menu
    fieldEl.value = "";
    typeEl.value = "like";
    valueEl.value = "";
    table.clearFilter();
    // Clear header filters
    var columns = table.getColumnDefinitions();
    for (let column of columns) {
        table.setHeaderFilterValue(column.field, "");
    }
    // Clear selection
    table.deselectRow();
}

function customFilter(data) {}
