#!/usr/bin/env node

import mongoose from 'mongoose';
import inquirer from 'inquirer';
import ora from 'ora';
import { program } from 'commander';

program
  .version('2.0.0')
  .description('Database Copy Utility')
  .option('-s, --source <source>', 'Source database connection string')
  .option('-t, --target <target>', 'Target database connection string')
  .parse(process.argv);

async function connectAndCopyData() {
  const options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    console.clear();
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
    };

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

    if (isAllCollection !== 'All') {
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
    console.error('\x1b[31mError:', error.message, '\x1b[0m');
    process.exit(1);
  }
}

connectAndCopyData();
