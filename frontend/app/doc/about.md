# 1-Privacy Project médialab/AXA

This datascape is part of a larger scientific project managed by the [medialab](http://www.medialab.sciences-po.fr) of SciencesPo funded by the [Axa Research Fund](https://www.axa-research.org/fr) in collaboration with the Axa Data Innovation Lab. 

This project aims to explore and analyze the different forms of data regulation such as law, social, code and market (Lessig, 2000). It tries to understand the role that actors like insurance companies may take to manage risks and act as a third party in the context of development of personal data transactions and the rise of data breaches. The main issues consist in understanding how insurance can build trust and enable Big Data. The full project mobilizes different approaches, from use case, to text analysis, ethnographic study and also web analysis.

***

# 2-The Privacy Datascape

We defined this website as a datascape (Latour and al., 2012). A datascape is a tool that allows exploring a dataset from different levels of aggregation and different points of view related to the attributes of each element of the corpus.

The philosophy of this datascape is to always be able to qualify actors (web entities) and the terms of potential controversies (topics and text content of pages). To do this we have designed a tool that allows following the links between web entities, their pages and associated topics. We have also included two visualization tools, a graph to locate web entities, and a matrix to explore links between topics.

### What is the Privacy datascape ? 
. A structured dataset of web pages tagged with topics and topological attributes
. An interactive interface for users to search and navigate the dataset and filter information;
. A tool to explore and extract qualitative data for further investigations.

### What is not ? 
. A realtime dataset : the crawl ended in September 2016
. A final result of a reasearch project : it is a strating point for further research based on this corpus 

***

# 3-Methodology

### First corpus

In a previous module of our research project, we made a text analysis of a dataset composed of documents from cyber insurance (general conditions), web platforms (terms of use) and institutions (law text from Europe and France). Based on this work, we produced a typology of personal data as they are defined in those documents. With this typology we have designed 41 queries (each one in English and French) that cover different aspects of data privacy. We used Google to extract the first 50 results for each query and produce a first corpus of 4,100 pages. To this corpus, we added 1,464 web pages from our survey about privacy on news websites. We started to crawl this 5,564 web pages corpus.

### Final dataset and network

From May to September 2016, we used [Hyphe](http://hyphe.medialab.sciences-po.fr), the crawler developed at the medialab. To finalise the final dataset a lot of work has been done to clean and filter the crawled results.

We filtered and deleted from the corpus: 
. web pages that do not respond to privacy 
. not found web pages and other technical problems 
. big web platforms (social networks, medias, search engines, technical web sites) 
. web pages under an indegree of 5 in the corpus

We extended the corpus and crawled webpages that contain specific terms related to data privacy that we collected on Wikipedia after a mapping work of “see also” Wikipedia pages with the [Seealsology](http://tools.medialab.sciences-po.fr/seealsology/)

The final dataset is a network of 7,578 web entities composed by: 
. Web entities comprising over 300,000 web pages 
. Web entities linked by 41,625 hyperlinks

Please note that 2,256 web entities have no link between them and the core component of the network. They do not appear on the map but their web pages are indexed and accessible by the search engine.

### Topics

To determinate the topics of the web pages we analyzed the full dataset with the Linear Discriminant Analysis (LDA). We produced a list of 60 groups of words that we cleaned and combined to produce a list of 32 main topics.

A maximum of 3 topics were applied to each web pages if the score of each one was over 15%. Based on this work we added and normalized the topics for each web entity.

A last treatment consisted to analyze the overlap score between two topics. That work allows us to compare each topic with each other and analyze how many pages are shared by those pairs of topics.

Please note that 34,260 pages have no associated topic because of the low quality of their content. Those pages represent only 10% of the dataset.

***

# 4-Tutorial 

### Architecture 

The interface is structured in three sections: 
. The central homepage is the search engine that presents the network, the search engine and the topics 
. The topic explorer page (left button) presents the matrix of topics and the details of each topic along with a comparator 
. The web entities explorer page (right button) presents the web entities with a filter by topological attributes

### Search engine 

In the search engine you can write a query of your choice or click on a topic in the list to filter the dataset. 
. The list of results shows all web pages associated to the query 
. the web entities related to the results are highlighted in the network

The search engine allows combining queries to filter the dataset in details. For example you can search the web pages associated to two different topics, or a word in a specific topic. You can find help in the section “Advanced search”. 

All the nodes linked to the core component compose the network. 5,322 nodes are displayed linked by 41,520 hyperlinks. The size of the node is related to their degree. Big nodes share a lot of links with other web entities and small nodes share only a few links with other web entities.

### Text explorer 

When you click on a web page in the list of results you access to the text content explorer. This page presents the text of the web page in “clean text” version but it can be also displayed in “raw text” or “html” mode. You can also access the original web page by clicking the original link.

In the right column the topics associated to the web page are displayed and are clickable to access to the topic details.

In the left column the location of the web entity associated to the web page his highlighted and some topological attributes are displayed (degree, indegree, outdegree, number of web pages of the web entity)

### Topic explorer 

This section displayed a matrix of topics. Two topics are linked if they share web pages. Big nodes in the matrix show a high overlapping of web pages between two topics. Each node at the intersection is clickable to access the comparator of the two topics selected by clicking “more details” on the right column. You can also click on the “search overlap” button to see the pages that contain the two topics.

The comparator displayed the main list of words that composed each topic, the network of web entities related to the topic and the list of web pages associated.

You can also choose in the comparator to close one of the two topics and the list of other topics appears in the right column. By selecting another topic in this list you can compare it.

### Web entities explorer

This section of the datascape is designed to navigate in the list of web entities by a search engine. A function allows to sort results by the topological attributes of each web entity. You can sort the list of results by degree, indegree, outdegree, betweenness centrality or number of pages in a web entity and url name.

On the right part, the map highlights the web entities in the list of results and you can access to the full list of pages associated to the web entity.

When you select a web entity to explore, you access the detailed page of the web entity where all topological information are displayed, but also the distribution of topics for the web entity and the hyperlink to access the original web site.

### Advanced search 

The search engine allows advanced seacrh functions to filter the database. Here you can find some examples that can be combined.

| Query          | Definition                                                      | Example                         |
|----------------|-----------------------------------------------------------------|---------------------------------|
|Topic_name:true | Search for a topic                                              | surveillance_us:true            |
|Word            | Search for a word                                               | snowden                         |
|"Full Sentence" | Search for a sentence                                           | "Snowden's revelations"         |
|AND             | Requires both terms to be present for a match                   | surveillance_us:true AND snowden| 
|OR              | Requires that either term (or both terms) be present for a match| surveillance_us:true OR snowden |
|NOT             | Requires that the following term not be present                 | surveillance_us:true NOT snowden|
|+               | Requires that the following term be present                     | snowden +prism                  |
|-               | Prohibits the following term                                    | snowden -prism                  |
|()              | Grouping Terms to Form Sub-Queries                              | (snowden OR prism) AND nsa      |

Please also note that each query produces a specific url that can be saved by copying the url bar in the browser and paste to relaunch the query.

### Export data 

In the serach page You can click right under the map and save the gexf file of the full network. You can also click right under the results of verbatims to register the results of the query in text format.

***

# Medialab Team

Dominique Boullier, Maxime Crépel, Mathieu Jacomy, Benjamin Ooghe-Tabanou, Diego Antolinos-Basso, Paul Monsalier, Audrey Baneyx, Paul Girard

