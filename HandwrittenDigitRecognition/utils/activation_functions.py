import numpy as np
import sympy

def relu(x, derivative=False):
    if derivative == False:
        return np.maximum(0, x)
    else:
        return np.where(x > 0, 1, 0)

def linear(x, derivative=False):
    if derivative == False:
        return x
    else:
        return np.ones_like(x)

def sigmoid(x, derivative=False):
    if derivative == False:
        return 1 / (1 + np.exp(-x))
    else:
        print(f"Derivative function for sigmoid not complete")

# 
# Please note, input x is vector, and returns derivatives in respect to all indexs (just take the one you want)
# 

# def softmax(x, derivative=False):
#     if not derivative:
#         exp_x = np.exp(x)
#         sum_val = np.sum(exp_x)
#         exp_x /= sum_val
#         return exp_x
#     else:
#         exp_x = np.exp(x)
#         sum_val = np.sum(exp_x)
#         exp_x /= sum_val

#         if np.any(exp_x == 0):
#             return exp_x, np.zeros_like(exp_x)
        
#         opp_exp_x = 1 - exp_x
#         result = exp_x * opp_exp_x

#         return exp_x, result
def softmax(x, derivative=False):
    if derivative == False:
        exp_x = np.exp(x)
        sum_val = np.sum(exp_x)

        exp_x = exp_x / sum_val
        return exp_x
    else: 
        exp_x = np.exp(x)
        sum_val = np.sum(exp_x)
        exp_x = exp_x / sum_val
        
        opp_exp_x = 1 - exp_x
        result = exp_x * opp_exp_x
        return exp_x, result

# NEED TO DO THE DERATIVE FUNCTIONS FOR ALL OF THESE
# test = np.array([[0.01136308],
#                   [0.14383577],
#                   [0.09671687],
#                   [0.04732823],
#                   [0.30593278],
#                   [0.1376051 ],
#                   [0.09127659],
#                   [0.05302226],
#                   [0.01420237],
#                   [0.09871696]])

# exp, res_test = softmax(test, True)
# print("penis")
# print(exp)
# print("res test")
# print(res_test)

# blah = 1.04 * res_test
# print(f"blah is {blah}")