#!/usr/bin/env python
"""
Script to parse Origin Labs files and convert them to JSON format
for use in the scientific dashboard.
"""

import sys
import json
import numpy as np
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

def parse_origin_file(file_path):
    """
    Parse an Origin Labs file and return its contents as a JSON-serializable object.
    
    Note: Since direct parsing of .opj files requires proprietary libraries,
    this function attempts to handle common text-based exports from Origin.
    """
    try:
        file_ext = os.path.splitext(file_path)[1].lower()
        
        # For .dat files (common Origin export format)
        if file_ext in ['.dat', '.txt', '.csv']:
            # Try different delimiters
            for delimiter in ['\t', ',', ';', ' ']:
                try:
                    # Skip comment lines that start with #, !, or ;
                    df = pd.read_csv(file_path, delimiter=delimiter, 
                                     comment='#', skiprows=lambda x: x > 0 and pd.read_csv(file_path, nrows=1, delimiter=delimiter).columns[0].startswith(('!', ';')))
                    
                    # Convert DataFrame to list of dictionaries
                    data = df.to_dict(orient='records')
                    
                    # Convert any numpy types to Python native types
                    for i in range(len(data)):
                        for k, v in data[i].items():
                            data[i][k] = convert_to_serializable(v)
                    
                    return {
                        "data": data,
                        "worksheets": ["Sheet1"],
                        "format": "text"
                    }
                except:
                    continue
            
            # If all delimiters fail, try a more flexible approach
            try:
                # Read the file as text
                with open(file_path, 'r') as f:
                    lines = f.readlines()
                
                # Skip comment lines
                data_lines = [line for line in lines if not line.strip().startswith(('#', '!', ';'))]
                
                # Find the first line with numbers
                header_line = None
                data_start = 0
                
                for i, line in enumerate(data_lines):
                    # Check if line contains numbers
                    tokens = line.strip().split()
                    if any(token.replace('.', '').replace('-', '').replace('e', '').replace('E', '').isdigit() for token in tokens):
                        data_start = i
                        if i > 0:
                            header_line = data_lines[i-1]
                        break
                
                # Parse the data
                data = []
                
                # If we found a header line, use it for column names
                if header_line:
                    headers = [h.strip() for h in header_line.strip().split()]
                else:
                    # Create default column names
                    sample_line = data_lines[data_start].strip().split()
                    headers = [f"Column_{i+1}" for i in range(len(sample_line))]
                
                # Parse each data line
                for line in data_lines[data_start:]:
                    values = line.strip().split()
                    if len(values) >= len(headers):
                        row = {}
                        for i, header in enumerate(headers):
                            try:
                                # Try to convert to float
                                row[header] = float(values[i])
                            except:
                                row[header] = values[i]
                        data.append(row)
                
                return {
                    "data": data,
                    "worksheets": ["Sheet1"],
                    "format": "text"
                }
            except:
                pass
        
        # For binary .opj files, we can't directly parse them without proprietary libraries
        # Return an error message
        return {
            "error": "Direct parsing of binary Origin (.opj) files is not supported. Please export your data to CSV or text format."
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python parse_origin.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    result = parse_origin_file(input_file)
    
    with open(output_file, 'w') as f:
        json.dump(result, f)

