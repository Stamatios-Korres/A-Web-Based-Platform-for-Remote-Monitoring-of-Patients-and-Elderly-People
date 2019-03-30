#   A Web-Based Platform for Remote Monitoring of Patients and Elderly People

In this work social and health services were integrated into one advanced homecare service to enrich the experience of elderly and chronic patients. This repository contains the code for my Thesis and the paper "A low-cost IoT-based health monitoring platform enriched with social networking facilities". The application is splitted into two parts:

* [The patient access point](https://github.com/Stamatios-Korres/A-Web-Based-Platform-for-Remote-Monitoring-of-Patients-and-Elderly-People/tree/master/Raspberry): This moduls is responsible for their everyday activities, health-monitoring routines and access to a dedicated social network.
* [The doctors/relatives access point](https://github.com/Stamatios-Korres/A-Web-Based-Platform-for-Remote-Monitoring-of-Patients-and-Elderly-People/tree/master/Cloud-Webrtc): A web application through which people related with the patient can communicate with him/her and monitor his health-condition (biosignal history, real-time health measurements, video calls).

### Description

The application is a combination of two Single Page Applications [SPA](https://en.wikipedia.org/wiki/Single-page_application) and two Web-Servers. The patient access point was built upon a [Raspberry-Pi](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/) equiped with the essential peripherals (sensors, camera, screen).
The Server integrated in the Raspberry is responsible for every off-line service. When an online-connection is requested, communication with the main Server is required. The main Server is also responsible for
the *Signaling*, *message forwarding* , *Oauth2 authentication protocol*, and the *Social Network*. The SPA for the doctors/relatives also requires internet connection, and it is serviced only by the main Server.
Emphasis has been put for security reasons, due to the sensitive nature of the patient's health history. The main countermeasure was that the data were only locally stored in the access point of the patient and only being forwarded thrgough the internet; No cloud-storage takes place.


### Biuld With 

* [Node.js](https://nodejs.org/en/)
* [AngularJS](https://angularjs.org/)
* [Websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
* [jQuery](https://jquery.com/)
* [MongoDB](https://www.mongodb.com/)
* [OAtuh2](https://oauth.net/2/)
* [WebRTC](https://webrtc.org/)

