
------------------------------

## 🚀 Problem Statement: SIH26171## 📌 Metadata

| Field | Details |
| --- | --- |
| Problem Statement ID | 26171 |
| Problem Statement Title | On-device Visual Perception for Light-weight Browser Agents |
| Organization | Indian Space Research Organisation (ISRO) |
| Department | Department of Space / ISRO |
| Category | Software |
| Theme | Smart Automation |

------------------------------

## 📝 Description## Background

AI agents are becoming omnipresent in the current era and can play an important role in our digital interactions. If an agentic AI pipeline has access to our visual context and screen states, they can assist users in complex workflows and automate many tasks.
Most agentic AI pipelines are currently deployed on the server side, which limits the type of data a user can share with it. It would open a new dimension of possibilities if a local agent is deployed on the user's machine—particularly within the browser—which can eliminate the need to share sensitive data with the server.
Local systems generally have fewer resources than servers and are unable to host a full-fledged pipeline. Therefore, only non-sensitive data (such as the structure of the screen, application fields, etc.) should be sent to the server for processing. Modern browser APIs (such as WebGPU and WebAssembly) and local inference libraries (like ONNX Runtime Web and Transformers.js) have unlocked the ability to run lightweight machine learning models directly on the client.

## The Core Objective

The aim is to bridge these two environments: leveraging the reasoning power of cloud/server-based AI while strictly enforcing data privacy at the client side.
Participants are required to build a privacy-preserving vision agent that runs in the browser. This involves implementing a client-side architecture where a local Vision Transformer (ViT) or equivalent computer vision model "reads" the user's screen and takes decisions based on it.
If it requires the visual context to be sent to the server, it shall sanitize the sensitive/PII data using DOM tags or any other method before any network request is made. It should dynamically detect and redact sensitive elements (e.g., blurring faces, blacking out passwords, and masking PII). Only this anonymized, unidentifiable data should be transmitted to the central server, which must be aware of this redaction scheme to process the data accordingly. The server will then process the sanitized context and return actionable commands for the browser agent to execute. Participants must balance the trade-offs between inference latency and accuracy
------------------------------

## ⚙️ Expected Solution

A successful submission should include a working prototype consisting of a client-side extension and a server that demonstrates an end-to-end user-assisting task.

## 1. Client-Side (Extension / JavaScript Component)

Must run in popular browsers like Chrome and Firefox.

* Local Vision Processing: Implementation of a client-side vision model running in the browser (e.g., via WebGPU) that evaluates the current screen state.
* Privacy Preserving Filter: A mechanism for sanitizing sensitive or personal visual data. This can be achieved through local bounding-box redaction, semantic obfuscation, masking, etc. This must be clearly demonstrated.

## 2. Server-Side Component

* Server-Side Integration: Transmission of the anonymized visual context to a centralized LLM/VLM. The server must successfully interpret the sanitized data and return a response (either processed data to be re-ingested by the local client or a UI action like "click the submit button" or "scroll down" for the local client to execute).
* Model Flexibility: Participants are free to use any offline-deployable (open-source / open-weights) model on the server side. During the SIH finale, cloud-hosted versions of these models can be used.

------------------------------

## 📊 Evaluation Metrics

| Metric | Weight |
| --- | --- |
| 1. Accuracy of visual context from screen | 25% |
| 2. Recall and precision for detection of sensitive/PII data | 20% |
| 3. Precision of redaction | 20% |
| 4. Client-side resource utilization | 20% |
| 5. Overall end-to-end latency of the provided task | 15% |

------------------------------

## 📂 Resources & Data

* Dataset Link: Any open-source data can be used. Use cases for evaluation will be provided during the finale.
* Youtube Link: N/A

------------------------------

## 📞 Support & Contact Info## Mentors

* Mentor 1: Gulshan Gupta (<gulshang@sac.isro.gov.in>)
* Mentor 2: Navita Jayesh Thakkar (<navitat@sac.isro.gov.in>)

------------------------------
