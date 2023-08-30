const mongoose = require('mongoose');

async function connectAndCopyData(config = {}) {
  let options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    const sourceConfig = config.sourceDatabase || process.env.SOURCEDATABASE;
    const targetConfig = config.destinationDatabase || process.env.DESTINATIONDATABASE;
    const allCollections = config.allCollection || false;
    const specifiedCollections = config.collectionsToCopy || [];

    const sourceDB = await mongoose.createConnection(sourceConfig, options);
    const targetDB = await mongoose.createConnection(targetConfig, options);

    const sourceCollectionNames = await sourceDB.db.listCollections().toArray();

    const collectionsToCopy = allCollections
      ? sourceCollectionNames.map(collection => collection.name)
      : specifiedCollections;

    for (const collectionName of collectionsToCopy) {
      const sourceSchema = new mongoose.Schema({}, { strict: false });
      const targetSchema = new mongoose.Schema({}, { strict: false });

      const SourceModel = sourceDB.model(collectionName, sourceSchema);
      const TargetModel = targetDB.model(collectionName, targetSchema);

      const dataToCopy = await SourceModel.find().lean();

      await TargetModel.deleteMany();
      await TargetModel.insertMany(dataToCopy);
    }

    sourceDB.close();
    targetDB.close();
  } catch (error) {
    throw error; // Throw the error to be handled by the caller
  }
}

module.exports = {
  connectAndCopyData
};
