# Personal Projects Repository - Alex Melocco

This repo contains a collection of personal projects I have undertaken. (Click titles for link)

Please find the featured projects listed below. All listed should have a file in the main repository. (in no particular order)

# Projects

## [Financial Sentiment Analysis Modelling Comparison Research Report](https://github.com/alexmelocco/alex_melocco/tree/main/FinancialSentimentAnalysisModelling)

This research project aims to leverage natural language processing (NLP) techniques and deep learning models to classify the sentiment of financial news headlines into positive, neutral, or negative categories. The study evaluates the effectiveness of various models, including TextCNN, LSTM, Bi-GRU, VADER, and BERT, in real-world financial applications. The research focuses on model performance, robustness, and applicability in the financial sector, providing valuable insights for AI-driven financial sentiment analysis.

The motivation for this project stems from the abundance of research papers covering financial sentiment analysis on extremely large datasets. I aimed to theorize the effectiveness of similar models in a less commercial environment, where access to resources is limited. Smaller datasets, especially with models such as BERT, can significantly affect performance. This research was conducted to address real-world NLP problems that lack access to large datasets, and to provide a comparison between models trained on large versus small datasets, which is crucial for understanding their practical applicability.

An extensive report on this project is available in the README.md file in this project's root.

Date: 10 October 2024

## [Custom Neural Network Library - Currently implements Handwritten Digit Recognition ](https://github.com/alexmelocco/alex_melocco/tree/main/HandwrittenDigitRecognition)

Complete and custom Neural Network library architecture that is modular to any input/output specifications. Can be used similar to how TensorFlow Neural Networks are put together (documented). I have implemented a neural network that can recognise handwritten Digits to 97% accuracy. Current architecture only has Dense layers, but future plans to add more layers (convolutional, etc). This has complete modularity so you can add as many hidden layers as needed.

Currently, modeled to implement a custom handwritten digit recognition algorithm without the use of libaries such as Tensorflow or Pytorch (purely my own library). Numpy is going to be used for vectorization.

The design is modular, such that the framework can be used to create any neural network, of any size, purpose, layer amount, function type, etc in any aspect. Current implementation trains on the MNIST handwritten digit dataset.

Motivations for project - wanted to better understand the underlying operations of a machine learning models, instead of relying on prewritten libraries in tensorflow and pytorch soley. This hopefully increases my perception in debugging and all aspects of ML

Current model can recognise digits 0-9 (after training has resulted in up to 97.5% accuracy on 10,000 unseen test examples).

## [Typscript browser discord-type messaging service](https://github.com/alexmelocco/alex_melocco/tree/main/Web%20Messaging%20Service)

This was a 2 man team project where i wrote the backend of the discord/skype type messaging program. I was in charge of designing and implementing the backend. Used this applicaton to really focus on the refining my skills in applying design (ACID) principles.

I implemented this using Node.js in the Express.js web sframework. It handles various API endpoints for user authentication, channel management, message handling, and more. The code demonstrates a modular structure, with organized route handlers, middleware usage, and integration with a database for data processing."

## [Lunar Lander Reinforcement Learning Algorithm](https://github.com/alexmelocco/alex_melocco/tree/main/LunarLander)

Deep Q network Algorithm implemented in python using Tensorflow. Uses OpenAI's gym enviornment to train within.

## [Client/server messaging and streaming service (backend networking)](https://github.com/alexmelocco/alex_melocco/tree/main/ClientServer%20Socket%20Program)

Multi-threaded Server/client socket program appliaction which is able to send tcp/udp packets WITHOUT the use of api's. Server can support multiple client ocnnections trhough multithreaded, synchronous programming. User authentication amongst others are just some examples of its high level functionality.

Motivations for project - Interested with inner workings of messaging services and socket programming, rather than utilise API’s learn from scratch using socket programming techniques. Intending to create the corresponding front end later on.

Currently implemented within the terminal, future motivations to implement of frontend for this program.

## [DungeonMania RPG java game](https://github.com/alexmelocco/alex_melocco/tree/main/DungeonManiaRpg)

This game written in Java is called DungeonMania, implemented using the Spark web framework. It manages user sessions and game-related actions through various API endpoints. The code ensures thread safety for session management, handles exceptions related to invalid actions, and integrates with Scintilla for game loop management. Gson is used for JSON serialization, and the program includes CORS headers for cross-origin support. The init() method sets up routes and initializes dependencies, while the main() method starts the Spark application. Overall, it provides a robust backend for the DungeonMania game with clear organization and functionality.

## [Movie reccomendation system - Collaborative Filtering algorithm](https://github.com/alexmelocco/alex_melocco/tree/main/MovieReccomendation)

CURRENTLY IN DEVELOPMENT

Implementing in Tensorflow. Currently trained on a dataset of 2.6 million training examples.

Current progress can still be viewed in main repo
