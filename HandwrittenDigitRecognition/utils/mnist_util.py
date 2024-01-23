import random
import matplotlib.pyplot as plt

# THIS WAS ALL FROM KAGGLE
# PREMADE image showing function
# https://www.kaggle.com/code/hojjatk/read-mnist-dataset/notebook

#
# Helper function to show a list of images with their relating titles
#
def show_images(images, title_texts):
    cols = 5
    rows = int(len(images)/cols) + 1
    plt.figure(figsize=(30,20))
    index = 1    
    for x in zip(images, title_texts):        
        image = x[0]        
        title_text = x[1]
        plt.subplot(rows, cols, index)        
        plt.imshow(image, cmap=plt.cm.gray)
        if (title_text != ''):
            plt.title(title_text, fontsize = 15);        
        index += 1

def show_image_random(x_train, y_train, x_test, y_test):
    #
    # Show some random training and test images 
    #
    images_2_show = []
    titles_2_show = []
    for i in range(0, 10):
        r = random.randint(1, 60000)
        images_2_show.append(x_train[r])
        titles_2_show.append('training image [' + str(r) + '] = ' + str(y_train[r]))    

    for i in range(0, 5):
        r = random.randint(1, 10000)
        images_2_show.append(x_test[r])        
        titles_2_show.append('test image [' + str(r) + '] = ' + str(y_test[r]))    

    show_images(images_2_show, titles_2_show)

def show_image_with_predict(x_train_og, x_train_norm, y_train, neural_network):
    #
    # Show some test images and predictions
    #
    images_2_show = []
    titles_2_show = []  

    for i in range(0, 10):
        r = random.randint(1, len(x_train_og))
        images_2_show.append(x_train_og[r])  
        pres_res = neural_network.predict(x_train_norm[r])
        titles_2_show.append(f'pred = {pres_res}, test image [' + str(r) + '] = ' + str(y_train[r]))    

    show_images(images_2_show, titles_2_show)