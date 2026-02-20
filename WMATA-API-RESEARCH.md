# WMATA API Research for NextMetro

## Overview

The WMATA Developer API provides **free** access to real-time and static transit data for the Washington Metropolitan Area. The default tier allows **10 calls/second** and **50,000 calls/day**. API keys are obtained at [developer.wmata.com](https://developer.wmata.com/).

The default tier includes **8 API categories** with **30+ endpoints**.

---

## Current NextMetro Usage

NextMetro currently uses **only 1 endpoint**:

| Endpoint | URL | Purpose |
|----------|-----|---------|
| Next Train Arrivals | `StationPrediction.svc/json/GetPrediction/{stationCode}` | Real-time train arrival predictions |

---

## All Available WMATA APIs & How NextMetro Could Use Them

### 1. Real-Time Rail Predictions (Currently Used)

| Endpoint | Description | NextMetro Use |
|----------|-------------|---------------|
| **Get Next Trains** | Returns next train arrival info for one or more stations. Supports `All` for every station at once. | **Already integrated** - powers the main station feed |

**Response fields:** Line, Destination, DestinationCode, DestinationName, LocationCode, LocationName, Min (minutes/ARR/BRD), Car (car count), Group (track)

---

### 2. Rail Station Information

| Endpoint | Description | NextMetro Use |
|----------|-------------|---------------|
| **Get Rail Station List** | All stations with address, lat/lon, line codes. Filter by LineCode (RD, BL, YL, OR, GR, SV) or omit for all. | **Replace hardcoded station list** with dynamic data. Enable line-based filtering (Line -> Station dual dropdown from roadmap). |
| **Get Rail Station Info** | Single station detail: address, lat/lon, lines served, connected stations. | **Station detail view** - show address, map pin, which lines serve it. |
| **Get Rail Lines** | All 6 lines with start/end stations and internal destinations. | **Line selector UI** - show line info, build line-based navigation. |
| **Get Rail Station Entrances** | Nearby entrances by lat/lon/radius. Includes entrance descriptions. | **Wayfinding feature** - show users nearest station entrances with descriptions. |
| **Get Path Between Stations** | Ordered stations and distances between two stations on the same line. | **Trip planner** - show the route between origin and destination with stop-by-stop path. |
| **Get Rail Station Times** | Opening time and first/last train times per day of week for a station. | **Station hours display** - show when the station opens, first/last trains for each day. |
| **Get Rail Station Parking** | Parking spots count, rider/non-rider costs, short-term parking info. | **Parking info panel** - show available parking, costs for riders vs non-riders. |
| **Get Station-to-Station Info** | Travel time, distance (miles), and fares (peak, off-peak, senior/disabled) between two stations. | **Fare calculator / trip planner** - show estimated time, distance, and cost for a trip. |

---

### 3. Train Positions

| Endpoint | Description | NextMetro Use |
|----------|-------------|---------------|
| **Get Live Train Positions** | All trains in service with their current track circuit, line, direction, destination, car count, service type, dwell time. | **Live train map** - show all trains moving through the system in real-time. |
| **Get Standard Routes** | Ordered track circuits by line and track number. Cacheable. | **Map rendering** - use as the "rail lines" backbone for plotting train positions on a map. |
| **Get Track Circuits** | All track circuits with neighbor references (including pocket tracks and crossovers). | **Advanced map** - detailed track layout for precise train position rendering. |

---

### 4. Incidents & Alerts

| Endpoint | Description | NextMetro Use |
|----------|-------------|---------------|
| **Get Rail Incidents** | Reported rail disruptions and delays. Includes description, incident type (Delay/Alert), and affected lines. | **Service alerts banner** - show active disruptions, delays, and alerts at the top of the page or per-station. |
| **Get Elevator/Escalator Outages** | Reported outages with station, unit name, type (ELEVATOR/ESCALATOR), symptom, location description, estimated return date. | **Accessibility status** - show elevator/escalator status per station, critical for riders with mobility needs. |

---

### 5. Real-Time Bus Predictions

| Endpoint | Description | NextMetro Use |
|----------|-------------|---------------|
| **Get Next Bus Arrivals** | Next bus arrival times at a specific stop. Returns route, direction, minutes to arrival, vehicle ID. | **Bus arrivals feed** - similar to current train feed but for buses. Show next buses at nearby stops. |

---

### 6. Bus Route and Stop Methods

| Endpoint | Description | NextMetro Use |
|----------|-------------|---------------|
| **Get Bus Routes** | All bus routes and variants with names and descriptions. | **Bus route browser** - let users explore available bus routes. |
| **Get Bus Route Details** | Ordered lat/lon points along a route + list of stops served. | **Bus route map** - draw bus routes on a map with stop markers. |
| **Get Bus Stops** | All bus stops, filterable by lat/lon/radius. | **Nearby bus stops** - show bus stops near a selected rail station or user location. |
| **Get Bus Positions** | Real-time bus locations with route, direction, schedule deviation, lat/lon. | **Live bus map** - show buses moving in real-time, indicate if ahead/behind schedule. |
| **Get Bus Route Schedule** | Full schedule for a route on a given date. | **Bus schedule viewer** - show the complete schedule for a bus route. |
| **Get Bus Stop Schedule** | Full schedule for a stop on a given date. | **Bus stop schedule** - show all buses serving a stop throughout the day. |

---

### 7. Bus Incidents

| Endpoint | Description | NextMetro Use |
|----------|-------------|---------------|
| **Get Bus Incidents** | Reported bus delays/alerts for a route. Includes description, incident type, affected routes. | **Bus alerts** - show service disruptions for bus routes. |

---

### 8. GTFS (General Transit Feed Specification)

| Endpoint | Description | NextMetro Use |
|----------|-------------|---------------|
| **Rail GTFS Static** | Static rail schedule data (daily updates). | Offline schedule data, trip planning. |
| **Bus GTFS Static** | Static bus schedule data. | Offline bus schedule data. |
| **Rail & Bus Combined GTFS Static** | Combined static data (daily updates). | Complete transit data in one download. |
| **Rail GTFS-RT Alerts** | Real-time service alerts feed. | Alternative to Incidents API for alerts. |
| **Rail GTFS-RT Trip Updates** | Real-time trip update feed. | Schedule deviation data for trains. |
| **Rail GTFS-RT Vehicle Positions** | Real-time vehicle positions feed. | Alternative source for live train positions. |
| **Bus GTFS-RT Alerts** | Real-time bus service alerts. | Bus alert feed. |
| **Bus GTFS-RT Trip Updates** | Real-time bus trip updates. | Bus schedule deviation data. |
| **Bus GTFS-RT Vehicle Positions** | Real-time bus vehicle positions. | Alternative source for live bus positions. |

---

## Recommended Features by Priority

### High Priority (High value, low effort)

1. **Service Alerts Banner** - Rail incidents API. Show disruptions/delays on the current station or system-wide. Users need to know if their line is delayed.
2. **Dynamic Station Data** - Replace hardcoded station list with the Rail Station List API. Keeps data current if WMATA adds/modifies stations.
3. **Elevator/Escalator Status** - Show outages per station. Critical for accessibility.
4. **Station-to-Station Fare & Time** - Trip planner with fare estimates (peak/off-peak/senior), travel time, and distance.

### Medium Priority (Significant features)

5. **Line-Based Station Filtering** - Use Rail Lines + Station List APIs to build the dual-dropdown (Line -> Station) from the roadmap.
6. **Station Detail Panel** - Address, lat/lon (map link), lines served, parking info, first/last train times.
7. **Live Train Positions** - Real-time train map showing all trains in the system.
8. **Bus Predictions** - Extend NextMetro to show next bus arrivals, turning it into a full transit tracker.

### Lower Priority (Full transit platform)

9. **Bus Routes & Stops** - Full bus route browser with maps.
10. **Live Bus Positions** - Real-time bus tracking map.
11. **Station Entrances** - Wayfinding for station entrances.
12. **GTFS Integration** - Offline schedules and comprehensive trip planning.

---

## Key API Base URLs

| API Category | Base URL |
|-------------|----------|
| Real-Time Rail Predictions | `https://api.wmata.com/StationPrediction.svc/json/` |
| Rail Station Information | `https://api.wmata.com/Rail.svc/json/` |
| Train Positions | `https://api.wmata.com/TrainPositions/` |
| Incidents (Rail) | `https://api.wmata.com/Incidents.svc/json/` |
| Incidents (Elevator/Escalator) | `https://api.wmata.com/Incidents.svc/json/` |
| Real-Time Bus Predictions | `https://api.wmata.com/NextBusService.svc/json/` |
| Bus Routes & Stops | `https://api.wmata.com/Bus.svc/json/` |
| GTFS | `https://api.wmata.com/gtfs/` |

---

## Rate Limits

- **Default tier:** 10 calls/second, 50,000 calls/day
- **Free** to use
- All endpoints require `api_key` header or query parameter

---

## Sources

- [WMATA Developer Portal](https://developer.wmata.com/)
- [WMATA Developer Resources](https://www.wmata.com/about/developers/)
- [WMATA API Connector Reference (Microsoft)](https://learn.microsoft.com/en-us/connectors/wmata/)
