import numpy as np

# This function only works 
def sparse_categorical_cross_entropy(output_train, y_train, gradient=False, y_vector=False):    
    # calculate gradients
    if gradient:
        grad = output_train.copy()
        grad[y_train] -= 1
        return grad
        # return - 1 / (output_train[y_train])
        # ans_vec = np.zeros_like(output_train)
        # ans_vec[y_train] = - 1 / (output_train[y_train])
        # return ans_vec
    # calculate loss (for unitary y_train value) - not multi output
    elif not y_vector:
    
        return -np.log(output_train[y_train])
        
    else:
        #
        # unimplemented - possible implemwentation included (not tested)
        #
        print("need to implement for vectorised y_train vector")
        
        loss = np.dot(y_train, np.log(output_train))
        return np.sum(loss)
    

        
    
    
def square_error_function(outut_train, y_train, gradient=False):
    print("INCOMPLETE")
    return None
