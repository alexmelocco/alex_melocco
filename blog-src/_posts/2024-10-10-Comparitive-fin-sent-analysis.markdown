---
layout: post
title: "[Research Insights] Comparative Analysis of Financial Sentiment Models"
date: 2024-10-10 16:13:45 +1100
categories: jekyll update
---

# Comparative Analysis of Financial Sentiment Models

## Table of Contents

1. [Introduction](#10-introduction)
2. [Experimental Setup](#20-experimental-setup)
3. [Methods Used](#30-methods-used)
4. [Results and Discussion](#40-results-and-discussion)
5. [Effectiveness of Selected Model](#41-effectiveness-of-selected-model)
6. [Future Research Paths](#42-future-research-paths)
7. [Conclusion](#50-conclusion)
8. [Data Source](#60-data-source)
9. [Related Work that I took inspiration from](#70-related-work-that-i-took-inspiration-from)

## GitHub Repository

The code and additional resources for this project can be found in my GitHub repository: [Financial Sentiment Analysis Modelling](https://github.com/alexmelocco/alex_melocco/tree/main/FinancialSentimentAnalysisModelling).

## 1.0 Introduction

The financial market is susceptible to public sentiment, which can significantly influence stock prices and market trends. News headlines are vital information sources that sway investor behaviour. However, the sheer volume of news articles and social media posts generated daily makes it challenging to assess sentiment accurately and promptly manually, highlighting a need for an automated solution to process and analyse vast amounts of textual data quickly and efficiently.

Financial institutions and investors can significantly benefit from a sentiment analysis model that provides real-time insights into how the market is fluctuating. Such a tool can enhance investment strategies, improve risk management, and lead to better financial outcomes.

This report, researched and compiled by Alex Melocco, presents an analysis of different models' performance in financial sentiment analysis. The primary objective is to evaluate and compare the effectiveness of various natural language processing models in classifying financial news into positive, neutral, or negative sentiments. The models examined include TextCNN, LSTM, Bi-GRU, VADER, and BERT. The analysis aims to identify the most suitable model for real-world applications in the financial sector, considering both accuracy and computational efficiency.

### 1.1 Motivations

The motivation for this project stems from the abundance of research papers covering financial sentiment analysis on extremely large datasets. I aimed to theorize the effectiveness of similar models in a less commercial environment, where access to resources is limited. Smaller datasets, especially with models such as BERT, can significantly affect performance. This research was conducted to address real-world NLP problems that lack access to large datasets, and to provide a comparison between models trained on large versus small datasets, which is crucial for understanding their practical applicability.

## 2.0 Experimental Setup

The project uses the dataset constructed in the paper Good Debt or Bad Debt: Detecting Semantic Orientations in Economic Texts. The dataset consists of 4840 English language, each with an associated class of “positive”, “neutral”, or “negative”. Each label was chosen based on the consensus of up to 12 annotators Finland’s Aalto University School of Business. The dataset is then further segmented into subsets based on the number of annotators that agreed with a given label, the splits are presented below:

| Subset                                    | Number of Entries |
| ----------------------------------------- | ----------------- |
| Sentences with 100% agreement             | 2259              |
| Sentences with greater than 75% agreement | 3448              |
| Sentences with greater than 66% agreement | 4211              |
| Sentences with greater than 50% agreement | 4840              |

This project uses the "Greater than 50%” split in order to maximize training data and expose the model to a dataset more representative of real world data. The dataset can be found [here](https://huggingface.co/datasets/takala/financial_phrasebank).

As the dataset does not contain specifically separated test and validation data, during preprocessing the dataset is split into train, test and validation data in an 80:10:10 ratio, to maximise training data. The success of a given model is evaluated on the accuracy of the trained model over the test dataset.

This dataset presents several challenges for training a model. Beyond the clear lack of data, the dataset has a significant class imbalance, featuring nearly five times as many neutral data items as negative ones. This initially led models to appear as though they were suffering from severe overfitting, when in reality it was a symptom of this class imbalance. After altering the data item distribution such that the splits were created with even proportions of labels, this problem was eliminated.

While some hyperparameters varied between models, a number were decided and maintained across all. Batch size was set to 50, learning rate to 0.001, and the maximum number of epochs to 20.

## 3.0 Methods Used

This project utilised an exploration of five alternate methods of addressing financial sentiment classification. This objective was to evaluate the usability, effectivenss and performance of different models in accurately classifying sentiment with financial texts. This was also in the context of data set limitations, where low levels of data were available to train data on (approx. 5000). By leveraging a diverse range of methodologies, I aimed to identify the strengths and weaknesses of each approach in the contextual limitations, thus proving comprehensive insight into the optimal techniques for financial sentiment analysis. The methods included VADER (Valence Aware Dictionary and Sentiment Reasoner), BERT (Bidirectional Encoder Representations from Transformers), Bi-GRU (Bidirectional Gated Recurrent Unit), Text CNN (Convolutional Neural Networks) and LSTM (Long Short-Term Memory), each chosen for their unique structure and application to natural language processing tasks. The following paragraphs outline the
efficacy of each model used.

LSTM was employed to capture the sequential dependencies in financial texts, where the ability to retain information over long sequences is particularly beneficial for sentiment analysis, as sentiment is often derived from the context rather than individual words. the team implemented LSTM through the TensorFlow library, utilizing its recurrent architecture to effectively process and analyse the sentiment of financial statements. To address overfitting, I employed various regularization techniques such as early stopping, extensive dropout layers, and kernel regularization. Data augmentation was also attempted using the NLTK library to create more data through techniques like synonym replacement, deletion, insertion, and back-translation. However, these augmentation techniques often failed to preserve the original sentiment, leading to mixed results. Despite the challenges, a balance was found between regularization techniquesbert

The TextCNN model employs a simple, yet effective architecture designed for sentence classification. The model starts with an embedding layer, where each word in a sentence is represented as a dense vector of fixed size. These embeddings capture semantic information and serve as the input to the convolutional layers. The model uses multiple convolutional layers with different filter sizes to extract various n-gram features from the sentence. Each convolutional layer applies filters that slide over the input embeddings, producing feature maps highlighting important local patterns.Max-pooling layers follow the convolutional layers, selecting the most salient features from each feature map, thus reducing the dimensionality and focusing on the most critical information.

BERT reads text in both directions to understand context. It is applied to various tasks such as text classification, question answering, and named entity recognition. Embeddings are very important for the processing and understanding of the input text in BERT. Following are three embedding types:

- Token Embeddings: This is the representation of every single token, whether words or sub-words in the input text.
- Positional Embeddings: Since transformers do not know about the order of tokens, positional embeddings are used for encoding the position of each token in the sequence. These are embeddings that enable a model to consider an order of words, which is relevant in understanding context.
- Segment Embeddings: To differentiate the two different sentences for next-sentence prediction tasks or other paired-sentence tasks, segment embeddings are used. Tokens of the first sentence receive one type of embeddings, usually all zeros, and tokens of the second, usually all ones.

These embeddings allow BERT to learn an understanding of the context and meaning of language; at its complexity— some 110 million parameters—it can be fine-tuned to do tasks such as sentiment analysis. Part of what makes Bert so powerful is its inbuilt optimization, with features such as drop out layers, regularization and weight decay the model can learn more efficiently thus using this model effectively involved using varying hyper parameters to achieve the best result.

A Gated Recurrent Unit has very similar architecture to an LSTM, with the absence of the cell gate, making it computationally faster. A Bi-directional GRU is comprised of two GRUs running parallel and inverse to one another up and down a sentence. In this way, each unit in Bi-GRU incorporates context from the previous and next word, making it highly suited as a lightweight NLP tool.

VADER (Valence Aware Dictionary and sEntiment Reader) is a pretrained, publicly available sentiment analysis model which claims to be effective in a range of scenarios, including financial texts. It was included in this

## 4.0 Results and Discussion

By comparing the output of multiple models, it is clear that under these conditions TextCNN performs the best. This is a somewhat unexpected outcome, as many of the available academic papers on the subject of natural language processing indicate BERT as the most successful model. This report argues that BERT was kneecapped in this particular scenario by the lack of available training data. Natural Language Processing models are most effective when given significant amounts of training data, as semantic and contextual patterns become more apparent. BERT specifically is designed to learn the contextual connections between words, and likely struggled with such a small dataset. Comparatively, the relatively simpler models TextCNN and Bi-GRU thrived, as they could more quickly determine and mark individual words with high semantic value.

In regards to performance, TextCNN, Bi-GRU and LSTM are all lightweight models that can be trained quickly and classify test data fast. This is owed in part to the small vocabulary of 11258 unique words and the relatively short sentences. The longest sentence present in the dataset was 52 words, and all others were padded with leading zeroes to match. Conversely, BERT, with its 110 million trainable parameters, is computationally expensive, especially when without access to a GPU.

Below is the table of models in this report scored by accuracy. Note that the accuracy of VADER in particular should not be taken as a measure of its success, for reasons explored in the VADER Results section above.

| Model   | Accuracy |
| ------- | -------- |
| TextCNN | 76.5%    |
| LSTM    | 67.0%    |
| Bi-GRU  | 66.8%    |
| VADER   | 59.0%\*  |
| BERT    | 8.5%     |

### 4.1 Effectiveness of Selected Model

With an accuracy of 76.5%, I believe the TextCNN model would be effective in a real-world scenario. The model was intentionally trained on the "greater than 50% agreement" data split in order to expose it to as much contentious, real-world data as possible. The model I've developed is highly specialized for its domain, and far surpasses general use models like VADER. When comparing it to the results achieved in "**Good Debt or Bad Debt: Detecting Semantic Orientations in Economic Texts**", which uses the same dataset, I find TextCNN falls short of the 85.8% achieved by the team, approximately a 10% drop in efficacy, possibly resulting from the simpler architecture of TextCNN. However, I still believe that the model is accurate enough to be useful in long-term classifications and trend analysis in the financial space.

This conclusion is based on results and should be taken with a grain of salt, with some important considerations that may have dictated the results including:

- Relatively small data set

With a larger dataset, i would theorise the result would be different, but that will be an interesting project to pursue in the future.

### 4.2 Future Research Paths

There are a number of paths that I undertook to improve the performance of the model but through difficulty or time constraints were unable to complete. These would be excellent avenues for future research.

The first technique examined was the possibility of augmenting pre-existing data items to generate new 'virtual' data items that would still be semantically consistent. I significantly explored this technique, and the code used to generate the virtual items can be found further up this notebook. the technique involved replacing arbitrary words in sentences with synonyms pulled from a thesaurus dataset. For instance, the sentence fragment "This is great!" might be used to generate the new virtual sentence fragment "This is amazing!". In this way, a new data item has been generated with the same semantic label of "positive". However, in practice, I found the synonym replacement was overzealous. In one particular instance, it replaced the sentence fragment "... this sentence is..." with the fragment "...this condemn is...". While condemn is a valid synonym for sentence, the program's lack of contextual understanding has created an incorrect sentence. With further work, this technique could produce usable results, but due to time constraints, it was unfortunately shelved.

Another technique for future research is ensembling. As the project consists of a number of varying models, ensembling all or some of the models has promise in producing more accurate results. However, owing to the extreme variance in accuracy between models, I reached the conclusion that I couldn't guarantee the effectiveness of an ensembled approach. This technique could be revisited after more effective models are implemented.

## 5.0 Conclusion

The key strength of my proposed solution is its lightweight nature. TextCNN is easy to train and can predict far quicker than heavier models like BERT, while achieving a reasonable accuracy. My study was largely limited by the lack of available training data and the class imbalance. I explored a number of potential solutions to this, but saw little success. My main effort was in the development of an augmentation function with which to generate artificial data items. This would have been achieved through replacement of arbitrary words with semantically similar ones, such that a new sentence is generated with the same overall sentiment. In practice, this was hampered by my replacement function not accounting for context. For instance, the sentence fragment “This sentence is” was replaced with “This condemn is.” While sentence and condemn are synonyms, the context is lost and the sentence is unusable as training data. With more time this approach could be refined to produce better results. I also intended to devote time to researching possible ensemble learning approaches that could leverage my wide variety of models, but a lack of time and sporadic accuracy across models made this infeasible.

## 6.0 Data Source

The data is sourced from a 2013 study into Semantic Analysis of financial news; **Good Debt or Bad Debt: Detecting Semantic Orientations in Economic Texts**. The dataset is comprised of 4840 English sentences, each associated with a label "positive", "neutral" or "negative". The dataset has no explicitly separate test data, so in the model I will use a random selection of 80% of the data for training, 10% for testing and 10% for validation. Hence, the training dataset will comprise of 3872 data entries, and the test and validation sets will consist of 484 data entries each.

The dataset can be accessed [here](https://huggingface.co/datasets/takala/financial_phrasebank), and the paper from which the dataset originates can be accessed [here](https://arxiv.org/abs/1307.5336).

## 7.0 Related Work that I took inspiration from

Convolutional Neural Networks for Sentence Classification by Kim Yoon (https://aclanthology.org/D14-1181): Kim Yoon's paper demonstrates the potential of CNNs for sentence classification tasks, highlighting their simplicity and effectiveness. While the model achieves impressive results, it also has limitations related to data dependency, contextual information, and hyperparameter sensitivity. this method will look to be tested on a finance sentiment task.

Good Debt or Bad Debt: Detecting Semantic Orientations in Economic Texts by Pekka Malo, Ankur Sinha, Pyry Takala, Pekka Korhonen, Jyrki Wallenius (https://arxiv.org/abs/1307.5336): This paper is the source of the project’s dataset, and examines the use of Linearized Phrase Structure (LSP) in mapping groupings of words to contextual phrases and evaluating this new data, not dissimilar to convolution in image processing. This paper is
more than a decade old and has been superseded by modern advancements, particularly BERT.
