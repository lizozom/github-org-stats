import { checkElasticMember } from "./check_elastic_member.js";
import { ORG } from "./constants.js";
import { getContributions } from "./get_contributions.js";
import { EMPTY, tap, map, concatMap, from, expand } from 'rxjs';

function enrichData(octokit, repo, data) {
    return Promise.all(data.map(async (user) => {
        const membership = await checkElasticMember(octokit, user.login);
        const yearlyContributions = await getContributions(repo, user.login);
        return {
          ...user,
          ...membership,
          ...yearlyContributions,
        }
      }));
}

function getContributionsPage(octokit, repo, page = 1) {
    return from(
        octokit.request('GET /repos/{owner}/{repo}/contributors', {
            owner: ORG,
            repo,
            per_page: 10,
            page,
        })
    ).pipe(
        map(results => results.data),
        tap((data) => console.log(`fetched page ${page} with ${data.length} items`)),
        concatMap(data => enrichData(octokit, repo, data))
    )
}

export function getContributors(octokit, repo) {
    let page = 1;
    return getContributionsPage(octokit, repo).pipe(
        expand(res => {
        if (res && res.length) {
            page++;
            return getContributionsPage(octokit, repo, page)
        } else {
            return EMPTY;
        }

    }));
  }
  