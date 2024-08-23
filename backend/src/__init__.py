from fastapi import FastAPI, UploadFile, File, HTTPException,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
# from correlation import extract_and_sort_attribute, bin_attributes, get_correlation  
from io import StringIO
from typing import List, Dict, Any
from pydantic import BaseModel
import numpy as np


def extract_attribute(data, index):
    return [float(row[index]) for row in data]

def create_bins(attribute, original_index, num_bins):
    bins = []
    bins_index = []
    
    if num_bins == 1:
        bins.append(attribute)  # One bin with all data points
        bins_index.append(original_index)  # All original indexes in one bin
    else:
        # Pair attribute values with their original indexes
        attr_with_index = list(zip(attribute, original_index))
        sorted_attr_with_index = sorted(attr_with_index, key=lambda x: x[0])  # Sort by attribute values
        bin_size = len(attribute) // num_bins
        
        for i in range(num_bins):
            if i == num_bins - 1:
                # Last bin includes remaining points
                bin_chunk = sorted_attr_with_index[i * bin_size:]
            else:
                bin_chunk = sorted_attr_with_index[i * bin_size:(i + 1) * bin_size]
            
            # Unzip the bin_chunk to separate attributes and their indexes
            binned_attr, binned_index = zip(*bin_chunk) if bin_chunk else ([], [])
            bins.append(list(binned_attr))
            bins_index.append(list(binned_index))
    
    return bins, bins_index

def bin_attributes(attribute, original_index, max_bins):
    bins_attr = []
    bins_index = []
    
    for i in range(1, max_bins + 1):
        binned_attr, binned_index = create_bins(attribute, original_index, i)
        bins_attr.append(binned_attr)
        bins_index.append(binned_index)
    
    return bins_attr, bins_index

def extract_and_sort_attribute(data, index):
    # Get the attribute and sort it
    attribute_with_index = [(i, float(row[index])) for i, row in enumerate(data)]
    sorted_attribute_with_index = sorted(attribute_with_index, key=lambda x: x[1])
    sorted_attribute = [value for _, value in sorted_attribute_with_index]
    original_indexes = [i for i, _ in sorted_attribute_with_index]
    return sorted_attribute, original_indexes



def get_correlation(selected_binattribute, bins_attr, original_index_of_bins, original_index_of_selected):
    # Calculate the correlation coefficient for each pair of bins
    correlations = []
    # example: selected bin is second attribute at (3,3)
    for i in range(len(bins_attr)):
        for j in range(len(bins_attr[i])):
            # Map the original indexes of the current bin to the selected bin  
            mapped_selected_bin = []
            mapped_current_bin = []
            for idx in original_index_of_selected:
                if idx in original_index_of_bins[i][j]:
                    mapped_selected_bin.append(selected_binattribute[original_index_of_selected.index(idx)])
                    mapped_current_bin.append(bins_attr[i][j][original_index_of_bins[i][j].index(idx)])
        
        # Calculate correlation if there are enough data points
            if len(mapped_selected_bin) > 1 and len(mapped_current_bin) > 1:
                correlation = np.corrcoef(mapped_current_bin, mapped_selected_bin)[0, 1]
                correlations.append(correlation)
            else:
                correlations.append(None)  # Not enough data points to calculate correlation
    return correlations

app = FastAPI()



origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to hold uploaded CSV data
class State:
    def __init__(self):
        self.csv_headers = None
        self.csv_data = None
        self.attribute1 = None
        self.attribute2 = None
        self.max_bins = None
        self.left_bin = None
        self.right_bin = None

state = State()



class ClickData(BaseModel):
    binIndex: str

class AttributeData(BaseModel):
    attribute: str

class MaxBinsData(BaseModel):
    maxBins: int

@app.post("/upload-csv")
async def upload_csv(data: List[Dict[str, Any]]):
    # Process the received data
    global state
    state.csv_headers = list(data[0].keys())
    state.csv_data = [list(row.values()) for row in data]
    return state.csv_headers, state.csv_data

@app.post("/attribute1")
async def attribute1(data: AttributeData):
    state.attribute1 = data.attribute
    return state.attribute1

@app.post("/attribute2")
async def attribute2(data: AttributeData):
    state.attribute2 = data.attribute
    return state.attribute2

@app.post("/max-bins")
async def max_bins(data: MaxBinsData):
    state.max_bins = data.maxBins
    return state.max_bins

@app.post("/left-click")
async def left_bin(data: ClickData):
    state.left_bin = data.binIndex
    return state.left_bin

@app.post("/right-click")
async def right_bin(data: ClickData):
    state.right_bin = data.binIndex
    return state.right_bin



@app.get("/get-correlation")
async def process():
    global state

    index1 = state.csv_headers.index(state.attribute1)
    index2 = state.csv_headers.index(state.attribute2)
    sorted_attribute1, original_index1 = extract_and_sort_attribute(state.csv_data, index1)
    sorted_attribute2, original_index2 = extract_and_sort_attribute(state.csv_data, index2)


    bins_attr1, bins_index1 = bin_attributes(sorted_attribute1, original_index1, int(state.max_bins))
    bins_attr2, bins_index2 = bin_attributes(sorted_attribute2, original_index2, int(state.max_bins))

    if state.left_bin is None:
        return {"message": "Left bin not selected yet"}
    else:
        selected_binattribute = bins_attr1[int(state.left_bin[0])-1][(int(state.left_bin[1])-1)]
        selected_index = bins_index1[int(state.left_bin[0])-1][(int(state.left_bin[1])-1)]

        if selected_binattribute in bins_attr2[0] or selected_binattribute in bins_attr2[1] or selected_binattribute in bins_attr2[2]:
            correlations = get_correlation(selected_binattribute, bins_attr1, bins_index1, selected_index)        
        else:
            correlations = get_correlation(selected_binattribute, bins_attr2, bins_index2, selected_index)

    return {"correlations": correlations}

    

    # if state.csv_headers is None:
    #     return {"message": "No CSV data uploaded yet"}
    # if state.attribute1 is None:
    #     return {"message": "Attribute 1 not selected yet"}
    # if state.attribute2 is None:
    #     return {"message": "Attribute 2 not selected yet"}
    # if state.max_bins is None:
    #     return {"message": "Max bins not selected yet"}
    # if state.left_bin is None:
    #     return {"message": "Left bin not selected yet"}
    # if state.right_bin is None:
    #     return {"message": "Right bin not selected yet"}
    
    


