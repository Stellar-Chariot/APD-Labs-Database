#!/usr/bin/env python
"""
Script to parse MATLAB .mat files and convert them to JSON format
for use in the scientific dashboard.
"""

import sys
import json
import numpy as np
import scipy.io as sio
import pandas as pd
import os

def convert_to_serializable(obj):
    """Convert numpy arrays and other non-serializable objects to Python types."""
    if isinstance(obj, np.ndarray):
        if obj.ndim == 0:
            return obj.item()
        return obj.tolist()
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, (pd.DataFrame, pd.Series)):
        return obj.to_dict()
    else:
        return obj

def parse_matlab_file(file_path):
    """Parse a MATLAB .mat file and return its contents as a JSON-serializable object."""
    try:
        # Load the .mat file
        mat_contents = sio.loadmat(file_path, squeeze_me=True, struct_as_record=False)
        
        # Remove special variables that start with '__'
        variables = {k: v for k, v in mat_contents.items() if not k.startswith('__')}
        
        # Get variable names
        var_names = list(variables.keys())
        
        # Try to find data arrays
        data = []
        
        # Check each variable
        for var_name, var_value in variables.items():
            # If it's a numpy array with 2 dimensions, it might be a data table
            if isinstance(var_value, np.ndarray) and var_value.ndim == 2:
                # Check if it has a reasonable size for data
                if var_value.shape[0] > 1 and var_value.shape[1] >= 2:
                    # Create column names
                    cols = [f"Column_{i+1}" for i in range(var_value.shape[1])]
                    
                    # Create a list of dictionaries (rows)
                    for i in range(var_value.shape[0]):
                        row = {}
                        for j in range(var_value.shape[1]):
                            row[cols[j]] = convert_to_serializable(var_value[i, j])
                        data.append(row)
            
            # If it's a structured array, it might be a data table
            elif isinstance(var_value, np.ndarray) and var_value.dtype.names is not None:
                # Create a list of dictionaries (rows)
                for i in range(len(var_value)):
                    row = {}
                    for field in var_value.dtype.names:
                        row[field] = convert_to_serializable(var_value[i][field])
                    data.append(row)
        
        # If no data was found, try to create a simple x-y dataset from the first two arrays
        if not data and len(var_names) >= 2:
            var1 = variables[var_names[0]]
            var2 = variables[var_names[1]]
            
            # Check if both are 1D arrays of the same length
            if (isinstance(var1, np.ndarray) and var1.ndim == 1 and
                isinstance(var2, np.ndarray) and var2.ndim == 1 and
                len(var1) == len(var2)):
                
                # Create x-y data
                for i in range(len(var1)):
                    data.append({
                        "x": convert_to_serializable(var1[i]),
                        "y": convert_to_serializable(var2[i])
                    })
        
        # Convert variables to serializable format
        serializable_vars = {}
        for k, v in variables.items():
            serializable_vars[k] = {
                "type": str(type(v).__name__),
                "shape": getattr(v, "shape", None),
                "size": getattr(v, "size", None)
            }
        
        return {
            "data": data,
            "variables": serializable_vars
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python parse_matlab.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    result = parse_matlab_file(input_file)
    
    with open(output_file, 'w') as f:
        json.dump(result, f)

