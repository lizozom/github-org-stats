import { from, of, map, catchError } from 'rxjs';

export function checkElasticMember$(octokit, username) {
  return from(octokit.request('GET /orgs/{org}/memberships/{username}', {
    org: process.env.ORG,
    username,
  })).pipe(
    map(response => response.data),
    map(({ state, role }) => {
      return {
        is_member: true,
        membership_state: state === "active",
        membership_role: role,
      }
    }
  ),
  catchError(e => {
    return of({
      is_member: false,
    });
  }))
}
