# Weather CLI

A Node.js command-line weather application.

## Features
- Get current weather, today, or full week forecast
- Automatic cache
- Handles city names with accents


## Usage
```bash
node weather.js CITY_NAME           # Full week
node weather.js CITY_NAME --now     # Current hour             
node weather.js CITY_NAME --today   # Current day
node weather.js CITY_NAME --date YYYY-MM-DD     # Custom date within the next 7 days

```
### Examples

```bash
node weather.js dublin 
node weather.js london --now
node weather.js stockholm --today
node weather.js berlin --date 2025-12-20

```

## Installation

```bash
git clone https://github.com/MMbanni/weather-cli.git
cd weather-cli
npm install
```
