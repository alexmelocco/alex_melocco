import numpy as np
from utils.activation_functions import softmax
import time
import math

class NeuralNetwork:
    def __init__(self, layers, loss_function):
        self.layers = layers
        self.loss_function = loss_function
        
    def forward_propogation(self, input_data):
        output = input_data
        for layer in self.layers:
            output = layer.for_prop(output)
        return output
    
    # 
    # Seperate function to reduce overhead over large datasets
    # This function should be used to convert linear output to softmax
    # 
    def forward_propogation_smax_conversion(self, input_data):
        actual_output = softmax(self.forward_propogation(input_data))
        return actual_output
        
        
    def train(self, X_train, y_train, learning_rate, epochs, recover_load=True):
        x_train_len_div = len(X_train) // 10
        loss_vals = []        
        self.save_curr_layer_hist()
        
        for epoch in range(epochs):
            total_loss = 0
            start_time = time.time()
            
            print(f"Epoch {epoch+1}/{epochs}:")

            for i in range(len(X_train)):
                # Forward propagation
                input_data = X_train[i].reshape(-1, 1)
                # IM PRETTY SURE U CAN REMOVE THE RESHAPE - DO LATER IF YOU GET IT WORKING
                output = self.forward_propogation(input_data)
                softmax_output, gradient_da_dz = softmax(output, derivative=True)

                # Compute the loss - NOT NECESSARY TO CALCULATE
                loss = self.loss_function(softmax_output, y_train[i], gradient=False)
                total_loss += loss

                # Backward propagation
                gradient_dc_da = self.loss_function(softmax_output, y_train[i], gradient=True)
                
                # Add input gradient initally = dc_da * da_dz = dc_dz 
                # (linear da_dz still calculated but = 1 so doesnt matter)
                gradient = gradient_dc_da * gradient_da_dz
                
                for layer in reversed(self.layers):
                    gradient = layer.back_prop(gradient, learning_rate)
                    
                if i % x_train_len_div == 0:
                    update_progress(i + x_train_len_div, len(X_train))

            avg_loss = total_loss / len(X_train)
            loss_vals.append(total_loss)
            print(f" Loss: {avg_loss} Time Taken: {time.time() - start_time :.5f}\n")
            
            # Restore prev if Nan raised - Check after = reduce uncessary computations
            if recover_load is True and math.isnan(avg_loss):
                print(f"Error encounted, aborting training session. Recovering data from epoch {epoch}/{epochs}")
                
                # Restore layer history from previous epoch 
                self.restore_prev_layer_hist()
                print(f"Model still useable after recovery. Check for any input error and retrain")
                return

            self.save_curr_layer_hist()
            
        # Return loss_vals for graphing purposes  
        return loss_vals
        
    def predict(self, input_data):
        # Execute forward propogation
        output = self.forward_propogation(input_data)
        # Assuming output is a probability distribution, return the index of highest probability
        return np.argmax(output)
    
    # Input must be normalised
    def test_set_accuracy(self, x_train, y_train, print_status=False):
        correct_cnt = 0
        for i in range(len(x_train)):
            pres_res = self.predict(x_train[i])
            if pres_res == y_train[i]:
                correct_cnt += 1

        result = correct_cnt / len(x_train)
        
        if print_status:
            print(f"Model outputs {result*100}% accuracy or {correct_cnt}/{len(x_train)}")
            
        return result
    
    def save_curr_layer_hist(self):
        for layer in self.layers:
            layer.store_current()
            
    def restore_prev_layer_hist(self):
        for layer in self.layers:
            if not layer.restore_history():
                raise RuntimeError("Error occurred in history restoration, model unusable")
        

def update_progress(iteration, total):
    progress = iteration / total
    bar_length = 30
    block = int(round(bar_length * progress))
    progress_text = f"{iteration}/{total}"
    bar = "[" + "=" * block + " " * (bar_length - block) + "]"
    status = f"{progress * 100:.2f}%"
    full_line = f"\r{progress_text} {bar} {status}"
    print(full_line, end="", flush=True)
    
    
