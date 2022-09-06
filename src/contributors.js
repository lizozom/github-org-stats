import { Octokit } from "octokit";
import { AUTH_TOKEN, REPOS } from './constants.js';
import { getContributors } from './get_contributors.js';
import json2csv from 'json-2-csv';
import * as fs from 'fs';

const octokit = new Octokit({
  auth: AUTH_TOKEN
});

async function main() {
  fs.writeFileSync('contributor.csv', '', { flag: "a+" }) 

  getContributors(octokit, REPOS[0]).subscribe(contributorPage => {    
    json2csv.json2csv(contributorPage, (err, csv) => {
      if (err) {
        throw err;
      }
    
      // print CSV string
      if (csv) {
        fs.writeFileSync('contributor.csv', csv, { flag: "a+" })      
      }
    });
  });
  
}

main();