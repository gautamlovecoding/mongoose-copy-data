import mongoose from 'mongoose'
import inquirer from 'inquirer'
import ora from 'ora';

async function connectAndCopyData(config = { allCollection: true }) {
  let options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    console.clear();
    console.log('🚀 Welcome to the Database Copy Utility 🚀\n');
    const connection = await inquirer.prompt([
      {
        type: 'input',
        name: 'sourceConfig',
        message: 'Enter source database connection string :-'
      },
      {
        type: 'input',
        name: 'targetConfig',
        message: 'Enter target database connection string :-'
      },
      {
        type: 'list',
        message: 'Select Collections to be Coppied',
        name: 'isAllCollection',
        default: 0,
        choices: ['All', 'Specific Collections']
      }
    ]);

    const { sourceConfig, targetConfig, isAllCollection } = connection;

    const sourceDB = await mongoose.createConnection(sourceConfig, options);
    console.log('\x1b[32m%s\x1b[0m', 'Source Database connected...');
    const targetDB = await mongoose.createConnection(targetConfig, options);
    console.log('\x1b[32m%s\x1b[0m', `Target Database connected...\n`)

    const sourceCollectionNames = await sourceDB.db.listCollections().toArray();
    let collectionsToCopy = sourceCollectionNames.map(collection => collection.name)
    if (isAllCollection != 'All') {
      const { specifiedCollections } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'specifiedCollections',
          message: 'Selected Collections',
          choices: collectionsToCopy
        }
      ]);
      collectionsToCopy = specifiedCollections;
    }

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmation',
        message: `Are you sure to copy the data from these collections: \x1b[33m${collectionsToCopy.join(', ')}\x1b[0m`,
      }
    ]);

    if (!answer.confirmation) {
      console.log('\x1b[31mAborted. Not copying data.\x1b[0m');
      sourceDB.close();
      targetDB.close();
      return;
    }
    console.log('\x1b[32m\nAgreed..\x1b[0m');

    for (const collectionName of collectionsToCopy) {
      const sourceSchema = new mongoose.Schema({}, { strict: false });
      const targetSchema = new mongoose.Schema({}, { strict: false });

      const SourceModel = sourceDB.model(collectionName, sourceSchema);
      const TargetModel = targetDB.model(collectionName, targetSchema);

      const count = await SourceModel.countDocuments();
      const spinner = ora(`Copying data of ${collectionName} total documents: ${count}`).start();
      await TargetModel.deleteMany();
      let size = count;
      if (count > 1000) size = Math.floor(size / 10);
      if (count > 10000) size = Math.floor(size / 100);
      else if (count > 100000) size = Math.floor(size / 1000);
      for (let i = 0; i < count; i += size) {
        spinner.text = `Copying ${i + size}/${count} documents ${Math.round((i + size) / count * 100)}% done`;
        const dataToCopy = await SourceModel.find().skip(i).limit(size).lean();
        await TargetModel.insertMany(dataToCopy.slice(i, i + size));
      }
      spinner.succeed(`Copied data collection named \x1b[33m${collectionName}\x1b[0m`);

    }
    sourceDB.close();
    targetDB.close();
  } catch (error) {
    throw error;
  }
}

connectAndCopyData();
