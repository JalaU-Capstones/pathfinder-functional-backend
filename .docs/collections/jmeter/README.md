# Apache JMeter Test Plan — Pathfinder API

File: Pathfinder_API_Test.jmx

## Purpose

This JMeter test plan automates HTTP calls to all major
Pathfinder API endpoints. It is used in the final
evaluation to demonstrate that every feature works
correctly by clicking Run All and executing all calls
automatically.

## Prerequisites

- Apache JMeter installed (version 5.6 or higher)
- Pathfinder backend running at http://localhost:3000
- A valid JWT token (obtain via POST /api/auth/login)

## Configuration

Before running the test plan:
1. Open Pathfinder_API_Test.jmx in JMeter.
2. Go to the User Defined Variables section.
3. Set BASE_URL to http://localhost:3000
4. Set TOKEN to a valid JWT from POST /api/auth/login.

## Running the tests

Open JMeter:
  jmeter -t Pathfinder_API_Test.jmx

Or run headless (command line):
  jmeter -n -t Pathfinder_API_Test.jmx -l results.jtl

Click Run All (green play button) to execute all test
groups in sequence.

## Test groups covered

The test plan covers all endpoint groups:
- Auth: POST /api/auth/signin, POST /api/auth/login
- Maps: GET, POST, PUT, DELETE /api/maps
- Obstacles: GET, POST, PUT, DELETE /api/obstacles
- Waypoints: GET, POST, PUT, DELETE /api/waypoints
- Routes: POST /api/routes (A* calculation), GET, DELETE
- Validation: all /api/validation/* endpoints
- Stats: GET /stats/requests, /stats/response-times,
  /stats/status-codes, /stats/popular-endpoints
- Cache: GET /api/cache/stats

## Video demonstration

The JMeter test plan is demonstrated in the final
evaluation video: capstone-alejandro-botina.mp4
Three endpoints are selected and explained in detail
during the video: their inputs, outputs, and the backend
code that handles them.
