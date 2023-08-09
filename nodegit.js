const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const fse = require('fs-extra');
const { exec } = require('child_process');

// Logger function for displaying messages
function log(message) {
  console.log(`[INFO] ${message}`);
}

async function cloneRepository(repoUrl, destinationPath) {
  try {
    //log(`Cloning repository from ${repoUrl} to ${destinationPath}`);
    
    // Remove the contents of the destination folder
    //log(`Removing contents of ${destinationPath}`);
    await fse.emptyDir(destinationPath);

    await simpleGit().clone(repoUrl, destinationPath);
   // log('Repository cloned successfully.');
     let outputLines = [];
    const repoDirectory = destinationPath;
    const outputLinesResult = processDirectory(repoDirectory, processFile,outputLines);
		log(`Output file generated: ${outputLinesResult}`);
    // Write output to a file
    const outputFilePath = path.join(destinationPath, 'output.txt');
    writeOutputToFile(outputFilePath, outputLinesResult);
    
    

    // Open the generated output file using the default application
    log('Opening the generated output file...');
    exec(`start "" "${outputFilePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error opening file:', error);
      }
    });
  } catch (error) {
    console.error('Error cloning repository:', error);
  }
}

function writeOutputToFile(filePath, lines) {
  try {
	      //log(`Output file written: ${filePath}`);
		  	      log(`Output file written: ${lines}`);


    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  } catch (error) {
    console.error('Error writing output file:', error);
  }
}

function processDirectory(directoryPath, processFileFn,outputLines) {
 

  try {
   // log(`Processing directory: ${directoryPath}`);
    fs.readdirSync(directoryPath).forEach(item => {
      const itemPath = path.join(directoryPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isFile() && item.endsWith('.ts') && !item.endsWith('specs.ts')) {
        processFileFn(itemPath, outputLines);
      } else if (stat.isDirectory()) {
        processDirectory(itemPath, processFileFn,outputLines);
      }
    });
  } catch (error) {
    console.error('Error processing directory:', error);
  }

  return outputLines;
}

function processFile(filePath, outputLines) {
  try {
    //log(`Processing file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');

    const filteredOutputLines = lines.filter(line => line.trim().startsWith('@Output'));
    outputLines.push(...filteredOutputLines);
	   log(`Filtered Output ${filteredOutputLines}`);

	const filteredInputLines = lines.filter(line => line.trim().startsWith('@Input'));
    outputLines.push(...filteredInputLines);
    log(`Filtered ${filteredInputLines}`);

    log(`test ${outputLines.length}`);
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

const repoUrl = 'https://github.com/sagar23/Story-Board-Agile-Planner.git';
const destinationPath = 'D:/Projects/nodegitClone';

cloneRepository(repoUrl, destinationPath);
