# Database Copy Utility (CLI Tool)

![Database Copy Utility (CLI Tool)](https://webassets.mongodb.com/_com_assets/cms/mongodb-logo-rgb-j6w271g1xn.jpg)

A utility package for copying data between MongoDB collections using Mongoose.

## Table of Contents

- [Overview](#overview)
- [Usage](#usage)
- [Installation](#installation)
- [Running the Tool](#running-the-tool)
- [Options](#options)
- [Usage Steps](#usage-steps)
- [Version](#version)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Author](#author)
- [Package Information](#package-information)

## Overview

The Database Copy Utility is a command-line interface (CLI) tool designed to facilitate the copying of data between two MongoDB databases. This tool allows users to specify source and target database connection strings and select specific collections to copy. It handles the connection to both databases, provides options for selecting collections, and copies data efficiently.

## Usage

### Prerequisites

Before using this tool, ensure that you have the following prerequisites installed:

- Node.js
- npm (Node Package Manager)
- MongoDB

## Installation

You can install the Database Copy Utility globally using npm:

```bash
  npm install -g database-copy-utility
```

## Running the Tool

Once installed, you can run the tool in your terminal as follows:

```bash
database-copy-utility
```

## Options

The Database Copy Utility supports the following command-line options:

- `"-s, --source <source>"`: Specify the source database connection string.
- `"-t, --target <target>"`: Specify the target database connection string.

## Usage Steps
1. When you run the tool, it will prompt you to enter the source and target database connection strings.

2. After successfully connecting to both databases, you can choose whether to copy all collections or select specific collections to copy.

3. If you choose to copy specific collections, you will be presented with a list of available collections to choose from.

4. The tool will confirm your selections before proceeding with the data copy.

5. It will then copy the selected data from the source database to the target database, providing progress updates along the way.

6. Once the data copy is complete, the tool will display a success message for each copied collection.

## Version

The current version of the Database Copy Utility is 2.0.0.

## Dependencies

The tool relies on several Node.js packages for its functionality:

- [mongoose](https://www.npmjs.com/package/mongoose) : MongoDB object modeling for Node.js.

- [inquirer](https://www.npmjs.com/package/inquirer) : A collection of common interactive command-line user interfaces.
- [ora](https://www.npmjs.com/package/ora) : Elegant terminal spinner.


## Configuration

- Before using this package, make sure to configure the following environment variables:
- **SOURCEDATABASE**: Connection URL for the source MongoDB database.
- **DESTINATIONDATABASE**: Connection URL for the target MongoDB database.

## Author
This Database Copy Utility was created by Gautam Kumar.

```vbnet
Feel free to adjust the content of the `readme.md` file as needed. This provides a comprehensive guide to compy the database collection into the other.
```

## Package Information

- **Package Name:** mongoose-copy-data
- **Author Name:** gautamtheprogrammer
- **GitHub URL:** https://github.com/gautamlovecoding/mongoose-copy-data

