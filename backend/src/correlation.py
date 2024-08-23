import csv
import numpy as np

def read_csv(file_path):
    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        headers = next(reader)  # Read the header row
        data = [row for row in reader]  # Read the rest of the data
    return headers, data

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
            print(i+1, j+1)
            # Map the original indexes of the current bin to the selected bin  
            mapped_selected_bin = []
            mapped_current_bin = []
            print(len(bins_attr[i][j]))
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


def main(file_path, index1, index2, max_bins):
    headers, data = read_csv(file_path) # input file
    sorted_attribute1, original_index1 = extract_and_sort_attribute(data, index1)
    sorted_attribute2, original_index2 = extract_and_sort_attribute(data, index2)

    print(headers[index1], headers[index2]) # selected attributes
    bins_attr1, bins_index1 = bin_attributes(sorted_attribute1, original_index1, max_bins)
    bins_attr2, bins_index2 = bin_attributes(sorted_attribute2, original_index2, max_bins)
    
    # we select the second attribute at (3,3)
    selected_binattribute = bins_attr2[0][0]
    selected_index = bins_index2[0][0]
    if selected_binattribute in bins_attr2[0] or selected_binattribute in bins_attr2[1] or selected_binattribute in bins_attr2[2]:
        correlations = get_correlation(selected_binattribute, bins_attr1, bins_index1, selected_index)        
    else:
        correlations = get_correlation(selected_binattribute, bins_attr2, bins_index2, selected_index)

    print("Correlations:", correlations)


# file_path = 'housing.csv' 
# index1 = 1  # first attribute
# index2 = 1  # second attribute
# max_bins = 3 

# main(file_path, index1, index2, max_bins)
