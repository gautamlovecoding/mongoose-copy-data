#!/usr/bin/env node

import mongoose from 'mongoose';
import inquirer from 'inquirer';
import { program } from 'commander';
import { SingleBar } from 'cli-progress';
import figlet from 'figlet';
import v8 from 'v8';

program
  .version('2.5.2')
  .description('Database Copy Utility')
  .option('-s, --source <source>', 'Source database connection string')
  .option('-t, --target <target>', 'Target database connection string')
  .parse(process.argv);

// Define a custom progress bar style
const customProgressBarStyle = {
  format: 'Copying {collectionName} [{bar}] {percentage}% | {value}/{total} | {downloaded} | ETA: {eta_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
};

async function connectAndCopyData() {
  const options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    console.clear();

    console.log(
      figlet.textSync('Database Copy Utility', {
        font: 'Doom',
        horizontalLayout: 'fitted',
        verticalLayout: 'fitted',
        whitespaceBreak: true,
      })
    );
    console.log('🚀 Welcome to the Database Copy Utility 🚀\n');

    const getConnection = async (message) => {
      while (true) {
        const connection = await inquirer.prompt([
          {
            type: 'input',
            name: 'connectionString',
            message,
            validate: (input) => {
              if (input.trim() === '') {
                return 'Connection string cannot be empty.';
              }
              return true;
            },
          },
        ]);

        const { connectionString } = connection;

        try {
          const db = await mongoose.createConnection(connectionString, options);
          console.log('\x1b[32m%s\x1b[0m', 'Database connected...');
          return db;
        } catch (error) {
          console.error('\x1b[31mError connecting to the database:', error.message, '\x1b[0m');
          const tryAgain = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'retry',
              message: 'Do you want to try again?',
              default: false,
            },
          ]);
          if (!tryAgain.retry) {
            throw new Error('Database connection failed.');
          }
        }
      }
    }

    const sourceDB = await getConnection('Enter source database connection string:');
    const targetDB = await getConnection('Enter target database connection string:\n');

    const sourceCollectionNames = await sourceDB.db.listCollections().toArray();
    let collectionsToCopy = sourceCollectionNames.map((collection) => collection.name);

    const { isAllCollection } = await inquirer.prompt([
      {
        type: 'list',
        message: 'Select Collections to be Copied',
        name: 'isAllCollection',
        default: 0,
        choices: ['All', 'Specific Collections'],
      },
    ]);

    if (isAllCollection === 'All') {
      const { excludeCollections } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'excludeCollections',
          message: 'Please Select Collections If You Want To Exclude Otherwise Type Enter',
          choices: collectionsToCopy,
        },
      ]);

      collectionsToCopy = collectionsToCopy.filter(collection => !excludeCollections.includes(collection));
    } else {
      const { specifiedCollections } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'specifiedCollections',
          message: 'Selected Collections',
          choices: collectionsToCopy,
          validate: (input) => {
            if (input.length === 0) {
              return 'Please select at least one collection.';
            }
            return true;
          },
        },
      ]);
      collectionsToCopy = specifiedCollections;
    }

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmation',
        message: `Are you sure to copy the data from these collections: \x1b[33m${collectionsToCopy.join(', ')}\x1b[0m`,
      },
    ]);

    if (!answer.confirmation) {
      console.log('\x1b[31mAborted. Not copying data.\x1b[0m');
      sourceDB.close();
      targetDB.close();
      return;
    }
    console.log('\x1b[32m\nAgreed..\x1b[0m');

    const startTime = Date.now(); // Record start time

    for (const collectionName of collectionsToCopy) {
      mongoose.pluralize(null);
      const sourceSchema = new mongoose.Schema({}, { strict: false });
      const targetSchema = new mongoose.Schema({}, { strict: false });

      const SourceModel = sourceDB.model(collectionName, sourceSchema);
      const TargetModel = targetDB.model(collectionName, targetSchema);

      const count = await SourceModel.estimatedDocumentCount();
      console.log("\n")
      const bar = new SingleBar(customProgressBarStyle); // Use the custom style

      const { avgObjSize = 0 } = await SourceModel.collection.stats();

      const { total_heap_size, used_heap_size } = v8.getHeapStatistics();
      const heap = total_heap_size - used_heap_size;

      const size = Math.floor(heap / avgObjSize * .70); // 70% capacity

      try {
        await TargetModel.deleteMany();
        let downloadedSize = 0;

        bar.start(count, 0, { collectionName, downloaded: formatBytes(downloadedSize) });

        let processedDocuments = 0; // Track processed documents

        while (processedDocuments < count) {
          const dataToCopy = await SourceModel.find().skip(processedDocuments).limit(size).lean();
          const dataSize = JSON.stringify(dataToCopy).length;

          downloadedSize += dataSize;
          processedDocuments += dataToCopy.length;

          const progress = (processedDocuments / count) * 100;
          bar.update(processedDocuments, { collectionName, downloaded: formatBytes(downloadedSize), progress: Math.round(progress) });

          await TargetModel.insertMany(dataToCopy);
        }

        bar.stop();
        console.log(`Copied data collection named \x1b[33m${collectionName}\x1b[0m`);
      } catch (error) {
        bar.stop();
        console.error(`Error copying data for collection \x1b[33m${collectionName}\x1b[0m: ${error.message}`);
      }
    }

    const endTime = Date.now(); // Record end time
    const totalTimeInSeconds = (endTime - startTime) / 1000;
    console.log(`\nTotal time taken: \x1b[34m${totalTimeInSeconds.toFixed(2)} seconds\x1b[0m`);
    console.log(
      `\n\x1b[35m🔥🔥🔥 Wooh... All Data Copied Successfully With Database-Copy-Utility CLI Tool. 🔥🔥🔥\x1b[0m \n\x1b[36m\x1b[33m\x1b[1mAuthor\x1b[0m:- \x1b[1;34mGautam Kumar👨‍💻\x1b[0m \x1b[33m\x1b[1memail\x1b[0m: \x1b[34mgautamku1111@gmail.com📧\x1b[0m`
    );

    sourceDB.close();
    targetDB.close();
  } catch (error) {
    console.error('\x1b[31mError:', error.message, '\x1b[0m');
    process.exit(1);
  }
}
// Function to format bytes for display
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

connectAndCopyData();
