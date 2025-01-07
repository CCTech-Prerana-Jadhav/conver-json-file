const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

const expectedFields = [
  "_id", "AllSkySolarApr", "AllSkySolarAug", "AllSkySolarDec", "AllSkySolarFeb",
  "AllSkySolarJan", "AllSkySolarJul", "AllSkySolarJun", "AllSkySolarMar",
  "AllSkySolarMay", "AllSkySolarNov", "AllSkySolarOct", "AllSkySolarSep",
  "AnnualAvgDailyTemp", "CDD50", "CDD65", "CDH74", "CDH80", "ColdestMonth",
  "Country", "Elev", "FivePercentCoolDB", "FivePercentCoolMCWB",
  "FivePercentDBDR", "FivePercentWBDR", "GrainsNintyNinePointPercentHumid",
  "GrainsOnePercentDehumid", "HDD50", "HDD65", "HottestMoDR", "HottestMonth",
  "HottestMonthtaub", "HottestMonthtaud", "MCWSToNintyNinePointSixPercentDB",
  "MCWStoZeroPointFourPercentDB", "NintyNinePercentHeatDB",
  "NintyNinePointSixPercentHeatDB", "OctDB", "OctDBDR", "OctMCWB", "OctWBDR",
  "Octtaub", "Octtaud", "OnePercentCoolDB", "OnePercentCoolMCWB", "StationName",
  "TZOffset", "Tground", "ZeroPointFourPercentCoolDB", "ZeroPointFourPercentCoolMCWB",
  "distance", "location"
];

// function renameAndMapKeys(item) {
//   const mappedItem = {};
//   Object.keys(item).forEach((key) => {
//     let newKey = key.replace(/-/g, "");

//     const percentMatch = newKey.match(/(\d+)%/);
//     if (percentMatch) {
//       const numberInWords = toWords(percentMatch[1]);
//       newKey = newKey.replace(percentMatch[0], `${numberInWords}Percent`);
//     }

//     mappedItem[newKey] = item[key];
//   });
//   return mappedItem;
// }

const keyMapping = {
  "99.6%HeatDB": "NintyNinePointSixPercentHeatDB",
  "99%HeatDB": "NintyNinePercentHeatDB",
  "MCWSto99.6%DB": "MCWSToNintyNinePointSixPercentDB",
  "Grains99%Humid": "GrainsNintyNinePointPercentHumid",
  "Grains1%Dehumid": "GrainsOnePercentDehumid",
  "0.4%CoolDB": "ZeroPointFourPercentCoolDB",
  "0.4%CoolMCWB": "ZeroPointFourPercentCoolMCWB",
  "1%CoolDB": "OnePercentCoolDB",
  "1%CoolMCWB": "OnePercentCoolMCWB",
  "5%CoolDB": "FivePercentCoolDB",
  "5%CoolMCWB": "FivePercentCoolMCWB",
  "5%DBDR": "FivePercentDBDR",
  "5%WBDR": "FivePercentWBDR",
  "T-ground": "Tground",
  "All-SkySolar-Jan": "AllSkySolarJan",
  "All-SkySolar-Feb": "AllSkySolarFeb",
  "All-SkySolar-Mar": "AllSkySolarMar",
  "All-SkySolar-Apr": "AllSkySolarApr",
  "All-SkySolar-May": "AllSkySolarMay",
  "All-SkySolar-Jun": "AllSkySolarJun",
  "All-SkySolar-Jul": "AllSkySolarJul",
  "All-SkySolar-Aug": "AllSkySolarAug",
  "All-SkySolar-Sep": "AllSkySolarSep",
  "All-SkySolar-Oct": "AllSkySolarOct",
  "All-SkySolar-Nov": "AllSkySolarNov",
  "All-SkySolar-Dec": "AllSkySolarDec", 
  "AnnualAvgDB": "AnnualAvgDailyTemp",
  "MCWSto0.4%DB": "MCWStoZeroPointFourPercentDB" 
};

function renameAndMapKeys(item) {
  const mappedItem = {};
  Object.keys(item).forEach((key) => {
    const newKey = keyMapping[key] || key.replace(/[^a-zA-Z0-9]/g, "");
    mappedItem[newKey] = item[key];
  });
  return mappedItem;
}

function transformData(data) {
  return data.map((item) => {
    const renamedItem = renameAndMapKeys(item);
    const transformedItem = {};

    expectedFields.forEach((field) => {
      if (field === "_id") {
        transformedItem["_id"] = new ObjectId();
      } else if (field === "location") {
        transformedItem["location"] = {
          coordinates: [renamedItem.Lon || 0, renamedItem.Lat || 0],
          type: "Point",
        };
      } else if (field === "distance") {
        transformedItem["distance"] = 0;
      } else {
        transformedItem[field] = renamedItem[field] !== undefined ? renamedItem[field] : null;
      }
    });

    return transformedItem;
  });
}

async function insertDataToMongoDB() {
  try {
    const filePath = path.join(__dirname, "RevD-Ashrae2021.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const transformedData = transformData(data);

    const client = await MongoClient.connect("mongodb://localhost:27017");
    const db = client.db("json-data");
    const collection = db.collection("converted-json-data");

    await collection.deleteMany({});
    await collection.insertMany(transformedData);

    console.log("Data inserted successfully!");
    client.close();
  } catch (err) {
    console.error("Error:", err);
  }
}

insertDataToMongoDB();
