# Mongoose Copy Data

![Mongoose Copy Data](https://webassets.mongodb.com/_com_assets/cms/mongodb-logo-rgb-j6w271g1xn.jpg)

A utility package for copying data between MongoDB collections using Mongoose.


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation
```sh
npm install mongoose-copy-data
```

## Pakage Version Specific.
install the mongoose pakage with version v5.9.9

### Usage
```javascript
const mongooseCopyData = require('mongoose-copy-data');

// Configure process.env.SOURCEDATABASE and process.env.DESTINATIONDATABASE

async function copyData() {
  try {
    await mongooseCopyData.connectAndCopyData();
    console.log('Data copied successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}
copyData();

```
## Configuration

- Before using this package, make sure to configure the following environment variables:
- **SOURCEDATABASE**: Connection URL for the source MongoDB database.
- **DESTINATIONDATABASE**: Connection URL for the target MongoDB database.

## Examples
- Here's an example of how you might use this package to copy data between two MongoDB databases

```javascript
const mongooseCopyData = require('mongoose-copy-data');
// Configure process.env.SOURCEDATABASE and process.env.DESTINATIONDATABASE
async function copyData() {
  try {
    const config = {
      sourceDatabase: 'mongodb://source-server/source-db',
      destinationDatabase: 'mongodb://target-server/target-db',
      allCollection: true, // Set to true to copy all collections
      // collectionsToCopy: ['actionplans', 'amrutprojects'], // Uncomment and provide specific collection names
    };
    await mongooseCopyData.connectAndCopyData(config);
    console.log('Data copied successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}
copyData();
```


## Package Information

- **Package Name:** mongoose-copy-data
- **Author Name:** gautamtheprogrammer

