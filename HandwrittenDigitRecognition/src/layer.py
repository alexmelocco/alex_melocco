# Defines the DenseLayer class
import numpy as np

class DenseLayer:
    def __init__(self, input_size, output_size, act_fun, weights=None, biases=None):
        # Initialize wieghts and biases
        if weights == None or biases == None:
            # weights are scaled minimise large weight initialisations
            scale_factor = np.sqrt(2.0 / (input_size + output_size))
            self.weights = np.random.randn(output_size, input_size) * scale_factor
            self.biases = np.zeros((output_size, 1))
        else:
            self.weights = weights
            self.biases = biases
        self.input = None
        self.output_a = None
        self.act_fun = act_fun
        
        # Internal place to save history
        self.weights_history = None
        self.bias_history = None
        
    def for_prop(self, input_data):
        # Store input for use in backward pass
        self.input = input_data
        
        transpose_weights = self.weights.T
        
        matMulComponent = np.matmul(input_data.T, transpose_weights)
        z = matMulComponent + self.biases.T
    
        func_a = self.act_fun(z)
        
        # storing z and a
        self.output_a = func_a

        return self.output_a.reshape(-1, 1)
    
    # 
    # Note input for softmax = gradient_dc_dz ( = dc_da * da_dz) (on first call in example)
    # Called dc_da for official purposes
    # Precalculated since output layer is linear for softmax model (reduce rounding errro)
    # 
    def back_prop(self, gradient_dc_da, learning_rate):
        gradient_da_dz = self.act_fun(self.output_a.T, True)
        
        gradient_dc_dz = gradient_dc_da * gradient_da_dz
        
        # calculate all dz vals
        gradient_dz_dw = self.input
        gradient_dz_db = np.ones_like(gradient_da_dz) # dz_db always one (constant)
        gradient_dz_prev = self.weights
        
        # calculate appropriate changes
        gradient_dc_dw = np.outer(gradient_dc_dz, gradient_dz_dw)
        gradient_dc_db = gradient_dc_dz * gradient_dz_db
        gradient_dc_daprev = np.dot(gradient_dc_dz.T, gradient_dz_prev).T
        
        # Update weights and biases
        self.weights -= learning_rate * gradient_dc_dw
        self.biases -= learning_rate * gradient_dc_db
        
        return gradient_dc_daprev
    
    def load_weights_biases(self, weights, biases=None):
        self.weights = weights
        if biases is not None:
            self.biases = biases
        
    
    def get_Weights_biases(self):
        return self.weights, self.biases
    
    #
    # Manually call function - stores currents weight and bias data
    #  
    def store_current(self):
        self.weights_history = self.weights
        self.bias_history = self.biases
    
    # 
    # Manually call function - restores stored weight and bias data
    # Returns - T/F depending on existance of history
    # 
    def restore_history(self) -> bool:
        if self.weights_history is None or self.bias_history is None:
            return False
        
        self.load_weights_biases(self.weights_history, self.bias_history)
        return True