import { checkElasticMember$ } from "./check_elastic_member.js";
import { getContributions$ } from "./get_contributions.js";
import { EMPTY, tap, map, concatMap, from, expand, of, delay, mergeMap, combineLatest, toArray } from 'rxjs';

function enrichData$(octokit, data) {
    return from(data).pipe(
        tap(user => console.log(`fetching user ${user.login} membership`)),
        mergeMap(user => {
            return combineLatest([
                of(user),
                checkElasticMember$(octokit, user.login)
            ])
        }),
        mergeMap(([user, membership]) => {
            return combineLatest([
                of(user),
                of(membership),
                getContributions$(user.login, process.env.START_YEAR)
            ]);
        }),
    )
}

function getContributionsPage$(octokit, repo, page = 1) {
    return from(
        octokit.request('GET /repos/{owner}/{repo}/contributors', {
            owner: process.env.ORG,
            repo,
            per_page: 5,
            page,
        })
    ).pipe(
        map(results => results.data),
        tap((data) => console.log(`fetched page ${page} with ${data.length} items`)),
        concatMap(data => enrichData$(octokit, data)),
        map(([user, membership, contribution]) => {
            return {
                project: process.env.PROJECT,
                ...user,
                ...membership,
                ...contribution,
            }
        }),
        toArray(),
        delay(5000)

    )
}

export function getContributors$(octokit, repo) {
    let page = 1;
    return getContributionsPage$(octokit, repo).pipe(
        expand(res => {
            // console.log(res)
            if (res && res.length) {
                page++;
                return getContributionsPage$(octokit, repo, page)
            } else {
                return EMPTY;
            }

    }));
  }
  