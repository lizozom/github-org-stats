import { Octokit } from "@octokit/core";
import { REPO } from './constants.js';
import { getContributors } from './get_contributors.js';
import json2csv from 'json-2-csv';
import * as fs from 'fs';
import * as dotenv from 'dotenv' 
dotenv.config()

const octokit = new Octokit({
  auth: process.env.GH_AUTH_TOKEN
});

const OUTPUT_FILE_NAME = `./contributor_${new Date().getTime()}.csv`;

async function main() {

  let prependHeader = true;
  const startTime = new Date().getTime();

  getContributors(octokit, REPO).subscribe({
    next: contributorPage => {    
      json2csv.json2csv(contributorPage, (err, csv) => {
        if (err) {
          throw err;
        }
      
        // print CSV string
        if (csv) {
          fs.writeFileSync(OUTPUT_FILE_NAME, csv, { 
            flag: "a+",
            emptyFieldValue: '',
            prependHeader: firstWrite,
          })      

          if (prependHeader) prependHeader = false;
        }
      });
    },
    complete: () => {
      const endTime = new Date().getTime();
      console.log(`took ${endTime - startTime}`)
    }
  });

  
}

main();