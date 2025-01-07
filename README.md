# MongoDB Data Transformation and Insertion

This project is designed to read a JSON file, transform its data by renaming fields according to a predefined mapping, and insert the transformed data into a MongoDB database.

## Features

- Reads a JSON file (`RevD-Ashrae2021.json`).
- Maps and renames specific fields based on a predefined mapping.
- Transforms the data to match a predefined set of expected fields.
- Inserts the transformed data into a MongoDB collection.
- Handles geospatial data by storing coordinates in GeoJSON format.

## Requirements

- **Node.js** (>=v14.0.0)
- **MongoDB** (>=v4.0)
- **npm** (Node Package Manager)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mongodb-data-transformation.git
cd mongodb-data-transformation
