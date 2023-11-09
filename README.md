# Tabulator
Flexible and responsive Font-End visualisation of JSON formatted data (data structure composed of key value pairs) using the [Tabulator](https://tabulator.info/) source.
Including a Back-End solution to extract, transform and load data as JSON tabular data and/or JSON hierarhical data.

Some included features:
 - Multiple view options:
   - Table: tabular data view.
   - Hierarchy: hierarchical data view.
 - Multiple source options (different model data).
 - Column selection (show/hide)
 - Saving column selection (including column widths).
 - Multiple filter options.
 - Visual selectable rows.
 - RWD (responsive web design).

[Data](data) (JSON) format:
 - File naming format for (JSON) data: [MODEL]_[Headers/Table/Hierarchy].json
 - [Headers](data/MOD_Headers.json) data:
```JSON
{
  "fixed_header": "column_name_1",
  "headers": [
    "column_name_1",
    "column_name_2"
  ]
}
```
 - [Tabular](data/MOD_Table.json) data:
```JSON
[
  {"column_name": "row_1_value"},
  {"column_name": "row_2_value"}
]
```
 - [Hierarchical](data/MOD_Hierarchy.json) data:
```JSON
[
  {
    "column_name": "row_parent_value",
    "_children": [
      {
        "column_name": "row_child_1_value"
      },
      {
        "column_name": "row_child_2_value"
      }
    ]
  }
]
```
