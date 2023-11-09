import tkinter as tk
from tkinter import filedialog, messagebox
import json

BOM_DIR = r"C:\your\source\directory\path"
JSON_DIR = r"C:\your\destination\directory\path"
PRODUCT = "Product-Number"
LEVEL = "Level"
PARENT = "Parent"
CHILDREN = "_children"


def file_selection_dialog(title, error_message):
    root = tk.Tk()
    root.wm_attributes("-topmost", 1)
    root.withdraw()
    file_path = filedialog.askopenfilename(
        filetypes=[("Text Files", "*.txt")],
        initialdir=BOM_DIR,
        title=title,
        parent=root,
    )
    if file_path == "":
        messagebox.showwarning(error_message, error_message, parent=root)
        quit()
    return file_path


def add_parent(data):
    parents = {}
    # Get column locations
    col_lvl = data[0].index(LEVEL)
    col_prd = data[0].index(PRODUCT)
    # Get root and top-level
    top_level = int(data[1][col_lvl])
    root = data[1][col_prd]
    if PARENT not in data[0]:
        # Add parent header
        data[0].append(PARENT)
        # Add parent data to each row
        for row in data[1:]:
            parents[int(row[col_lvl])] = row[col_prd]
            if int(row[col_lvl]) > top_level:
                row.append(parents[int(row[col_lvl]) - 1])
            else:
                row.append("")
    return root


def write_json(file_path, data):
    # Output data to JSON file
    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)


def read_text(file_path, encoding=None):
    data = ""
    # Read the entire file as string
    with open(file_path, "r", encoding=encoding) as f:
        data = f.read()
    return data


def format_data(text, separator):
    data = []
    # Format the text as tabular data (a list of lists)
    rows = text.split("\n")
    for row in rows:
        data.append(row.split(separator))
    if data[-1] == [""]:
        return data[:-1]
    return data


def transform_to_tabular(input_data):
    table = []
    # Create table rows
    for idx, row in enumerate(input_data[1:]):
        row_data = {"Row_Nr": idx + 1}
        for jdx, col in enumerate(row):
            if col != "":
                row_data[input_data[0][jdx]] = col
        # Add row to table
        table.append(row_data)
    # Return tabular data
    return table


def transform_to_hierarchy(input_data):
    hierarchy = {}
    # Create products
    for idx, row in enumerate(input_data[1:]):
        product = {"Row_Nr": idx + 1}
        for jdx, col in enumerate(row):
            if col != "":
                product[input_data[0][jdx]] = col
        # Add product to hierarchy
        if product[PRODUCT] == ROOT:
            hierarchy = product
        elif hierarchy != {}:
            add_product(hierarchy, product)
    # Return hierarchical data
    return [hierarchy]


def add_product(root, product):
    # Add child to parent
    if root[PRODUCT] == product[PARENT]:
        if CHILDREN not in root:
            root[CHILDREN] = []
        root[CHILDREN].append(product)
    # Add child to corresponding parent using recursion
    else:
        if CHILDREN in root:
            add_product(root[CHILDREN][-1], product)


def get_headers(header_data):
    headers = header_data[:]
    headers.insert(0, "Row_Nr")
    return headers


def prompt_message(type, title, message):
    result = None
    root = tk.Tk()
    root.wm_attributes("-topmost", 1)
    root.withdraw()
    if type == "info":
        messagebox.showinfo(title, message, parent=root)
    elif type == "warning":
        messagebox.showwarning(title, message, parent=root)
    elif type == "error":
        messagebox.showerror(title, message, parent=root)
    elif type == "question":
        result = messagebox.askquestion(title, message, parent=root)
    elif type == "okcancel":
        result = messagebox.askokcancel(title, message, parent=root)
    elif type == "retrycancel":
        result = messagebox.askretrycancel(title, message, parent=root)
    elif type == "yesno":
        result = messagebox.askyesno(title, message, parent=root)
    elif type == "yesnocancel":
        result = messagebox.askyesnocancel(title, message, parent=root)
    root.destroy()
    return result


if __name__ == "__main__":

    BOM_PATH = file_selection_dialog("Select a BOM file", "No BOM file selected!")
    MODEL = BOM_PATH.split("/")[-1].split("_")[0]
    BOM_TABLE = JSON_DIR + "/" + MODEL + "_Table.json"
    BOM_HEADERS = JSON_DIR + "/" + MODEL + "_Headers.json"
    BOM_HIERARCHY = JSON_DIR + "/" + MODEL + "_Hierarchy.json"
    print(BOM_PATH)

    # Read the input data from selected file
    input_data = format_data(read_text(BOM_PATH), "\t")

    # Add parent data
    ROOT = add_parent(input_data)

    # Transform the input data to tabular JSON format
    tabular_data = transform_to_tabular(input_data)
    # Write the tabular data to JSON file
    write_json(BOM_TABLE, tabular_data)

    # Transform the input data to hierarchical JSON format
    hierarchical_data = transform_to_hierarchy(input_data)
    # Write the hierarchical data to JSON file
    json_hierarchy = hierarchical_data
    write_json(BOM_HIERARCHY, json_hierarchy)

    # Write the headers data to JSON file
    headers = get_headers(input_data[0])
    write_json(BOM_HEADERS, {"fixed_header": PRODUCT, "headers": headers})

    prompt_message("info", "Script completed", "Script successfully completed!")
