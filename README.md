# Personal Projects Repository - Alex Melocco
This repo contains a collection of personal projects I have undertaken.

Please find the featured projects listed below. All listed should have a file in the main repository. (in no particular order)

# Projects

## [Custom Handwritten Digit Recognition Neural Network](https://github.com/alexmelocco/alex_melocco/tree/main/HandwrittenDigitRecognition)

Implemented a HDR algorithm in python without the use of libaries such as Tensorflow or Pytorch. Independently researched and designed a custom, vectorised dense-layer type neural network architecture.

The design is modular, such that the framework can be used to create any neural network, of any size, purpose, layer amount, function type, etc in any aspect. Current implementation trains on the MNIST handwritten digit dataset.

Motivations for project - wanted to better understand the underlying operations of a machine learning models, instead of relying on prewritten libraries in tensorflow and pytorch soley. This hopefully increases my perception in debugging and all aspects of ML

Current model can recognise digits 0-9 (after training has resulted in up to 97.5% accuracy on 10,000 unseen test examples).





## [Movie reccomendation system - Collaborative Filtering algorithm](https://github.com/alexmelocco/alex_melocco/tree/main/MovieReccomendation)

CURRENTLY IN DEVELOPMENT 

Implementing in Tensorflow. Currently trained on a dataset of 2.6 million training examples.

Current progress can still be viewed in main repo






## [Client/server messaging and streaming service (backend networking)](https://github.com/alexmelocco/alex_melocco/tree/main/ClientServer%20Socket%20Program)

Multi-threaded Server/client socket program appliaction which is able to send tcp/udp packets WITHOUT the use of api's. Server can support multiple client ocnnections trhough multithreaded, synchronous programming. User authentication amongst others are just some examples of its high level functionality. 

Motivations for project - Interested with inner workings of messaging services and socket programming, rather than utilise API’s learn from scratch using socket programming techniques. Intending to create the corresponding front end later on.

Currently implemented within the terminal, future motivations to implement of frontend for this program.






## [Typscript browser discord-type messaging service](https://github.com/alexmelocco/alex_melocco/tree/main/Web%20Messaging%20Service)

This was a 2 man team project where i wrote the backend of the discord/skype type messaging program. I was in charge of designing and implementing the backend. Used this applicaton to really focus on the refining my skills in applying design (ACID) principles.

I implemented this using Node.js in the Express.js web sframework. It handles various API endpoints for user authentication, channel management, message handling, and more. The code demonstrates a modular structure, with organized route handlers, middleware usage, and integration with a database for data processing."






## [DungeonMania RPG java game](https://github.com/alexmelocco/alex_melocco/tree/main/DungeonManiaRpg)

This Java program is a backend for the DungeonMania game, implemented using the Spark web framework. It manages user sessions and game-related actions through various API endpoints. The code ensures thread safety for session management, handles exceptions related to invalid actions, and integrates with Scintilla for game loop management. Gson is used for JSON serialization, and the program includes CORS headers for cross-origin support. The init() method sets up routes and initializes dependencies, while the main() method starts the Spark application. Overall, it provides a robust backend for the DungeonMania game with clear organization and functionality.
