Implementing a custom handwrittendigit recognition algorithm in python without the use of libaries such as Tensorflow or Pytorch. Numpy is going to be used for vectorization.
- all (lossfunctions, calculation, derivatives etc) are done manually with no assistance from libraries 
- Everything is custom - no functions borrowed from external sources (except MNIST data loader and data displayer)

Please see 'UML Diagram - HDR.png' for rough architecture outline in main directory (not a uni proj, just wanted to reference in future)

Reason for project - wanted to better understand the underlying operations of a machine learning models, instead of relying on prewritten libraries in tensorflow and pytorch soley
- This hopefully increases my perception in debugging and all aspects of ML

Current model can recognise digits 0-9 (after training has resulted in up to 97.5% accuracy on 10,000 unseen examples)
- indicative of good generalisation

Can reload a previously trained model or train a completely new one (up to preference)
- there is a save and reload feature, otherwise it just initilises with random variables (to then be trained)

Main.ipynb currently models digit recognition as per following
- One neural network with three hidden layers
    - DenseLayer(units=25, act_fun=relu)
    - DenseLayer(units=15, act_fun=relu)
    - DenseLayer(units=10, act_fun=linear)
- The reason the final layer is linear and not softmax is to minimise round off error that can occur (softmax conversion occurs after using the linear output)
    - please note softmax values are used in back propogation (even for linear layer)
- loss function is sparse categorical cross entropy 
    - code for this function can be found in /src/loss_functions

NeuralNetwork class - see UML diagram for function overview/description
- custom, adaptable class (hosts hidden layers)
- can add as many layers using what ever activation function you want
- IS NOT HARD CODED FOR DIGIT RECOGNITION - can do virtually anything you can adapt it too
- in main.ipynb just contains the customisation to work for digit recognition

DenseLayer class - see UML diagram for function overview/description
- initalises its own weigths and biases based on initialisation
- can reload previously trained models
- a lot of back_prop and for_prop functionality occurs within this class

Currently main.ipynb initalises a completely new neural network, but at the end of the document is a commented out way to load previously trained network model (if desired)

