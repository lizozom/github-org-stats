import fetch from "node-fetch";
import { ORG } from "./constants.js";
import { sleep } from "./helpers.js";

export async function getContributions(repo, username) {
    const headers = {
      'Authorization': `bearer ${process.env.GH_AUTH_TOKEN}`,
    }
  
    const yearlyContributions = {};
    let year = 2012;
    const curYear = new Date().getFullYear();
  
    while (year <=  curYear) {
      try {
        yearlyContributions[`contrib_${year}`] = 0;
        
        const body = {
          "query": `query { 
            user(login: "${username}") {
              name
              contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T00:00:00Z") {
                commitContributionsByRepository(maxRepositories: 100) {
                  repository {
                    nameWithOwner
                  }
                  contributions {
                    totalCount
                  }
                }
              }
            }
          }
          `
        }
        const response = await fetch('https://api.github.com/graphql', { method: 'POST', body: JSON.stringify(body), headers: headers })
        const data = await response.json()
        if (!data.data) {
            console.log(data)
        }
        const commitContributionsByRepository = data.data.user.contributionsCollection.commitContributionsByRepository;
        const repoContribution = commitContributionsByRepository.find(item => item.repository?.nameWithOwner === `${ORG}/${repo}`);
        yearlyContributions[`contrib_${year}`] = repoContribution?.contributions?.totalCount || 0;
        year++;
      } catch (e) {
        console.log(e)
      }
      await sleep(1000);
    }
  
    return yearlyContributions;
  }
  