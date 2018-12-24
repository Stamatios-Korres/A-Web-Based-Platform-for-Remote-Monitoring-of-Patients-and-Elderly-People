#   A Web-Based Platform for Remote Monitoring of Patients and Elderly People

This repository contains the code for my Thesis and the paper "A low-cost IoT-based health monitoring platform enriched with social networking facilities". The application is splitted into two parts:

* [The patient access point](https://gitlab.com/timos/Cloud-Webrtc/tree/master/raspberry): This moduls is responsible for their everyday activities, health-monitoring routines and access to a dedicated social network.
* [The doctors/relatives access point](https://gitlab.com/timos/Cloud-Webrtc/tree/master/Cloud-Webrtc): A web application through which people related with the patient can communicate with him/her and monitor his health-condition (biosignal history, real-time health measurements, video calls).

### Description

The application is two Single Page Applications [SPA](https://en.wikipedia.org/wiki/Single-page_application) and two backend WebServers. The patient access point was built upon a [Raspberry-Pi](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/) equiped with the essential peripherals (sensors, camera, screen).
The Server integrated in the Raspberry is responsible for every off-line service. When an online-connection is requested, communication with the main Server is required. The main Server is responsible for
the *Singaling*, *JSON-messages* forwarding, *Oauth2* authentication protocol, and the *Social Network*.

### Biuld With 

* [Node.js](https://nodejs.org/en/)
* [AngularJS](https://angularjs.org/)

