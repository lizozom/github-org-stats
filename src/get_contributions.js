import fetch from "node-fetch";
import { from, of, delay, map, concatMap, mergeMap } from "rxjs";

export function getContributions$(username, startYear) {
    const headers = {
      'Authorization': `bearer ${process.env.GH_AUTH_TOKEN}`,
    } 
    const repoNameWithOwner = `${process.env.ORG}/${process.env.PROJECT}`;
    const curYear = new Date().getFullYear();
    let years = Array.from({ length: curYear - startYear + 1 }, (v, k) => k + startYear); ;

    return from(years).pipe(
      concatMap(year => {
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

        return from(fetch('https://api.github.com/graphql', { 
          method: 'POST', 
          body: JSON.stringify(body), 
          headers: headers 
        })).pipe(
          mergeMap(response => response.json()),
          map(data => {
            const commitContributionsByRepository = data.data?.user?.contributionsCollection?.commitContributionsByRepository || [];
            const repoContribution = commitContributionsByRepository.find(item => item.repository?.nameWithOwner === repoNameWithOwner);
            return {
              year,
              year_contributions: repoContribution?.contributions?.totalCount || 0,
            }
          }),)
      }),
      delay(1000)
    )
  }
  