import { isTrueSet } from "./helpers.js";

export async function checkElasticMember(octokit, username) {
    try {
      const response = await octokit.request('GET /orgs/{org}/memberships/{username}', {
        org: 'Elastic',
        username,
      })
      const { state, role } = response.data;
      return {
        is_member: true,
        membership_state: state === "active",
        membership_role: role,
      };
    } catch (e) {
      return {
        is_member: false,
      };
    }
  }
  