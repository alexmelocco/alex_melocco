# Init file paths here

def load_file_data(lines):    
    input_path = lines[0].strip()
    training_images_filepath = input_path + lines[1].strip()
    training_labels_filepath = input_path + lines[2].strip()
    test_images_filepath = input_path + lines[3].strip()
    test_labels_filepath = input_path + lines[4].strip()
    return training_images_filepath, training_labels_filepath, test_images_filepath, test_labels_filepath