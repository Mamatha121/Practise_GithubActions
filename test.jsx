let teamList = await github.paginate(github.rest.teams.list,
    { org: context.payload.organization.login },
    (resp) => resp.data.map((teamItem) => ({
        "name": teamItem.name,
        "slug": teamItem.slug,
        "id": teamItem.id,
        "parent": {
            "name": teamItem.parent.name,
            "slug": teamItem.parent.slug,
            "id": teamItem.parent.id
        }
    }))
)

let teamsCorrect = []
let teamsIncorrect = []
async function getIDPMapping(slug) {
    let idpResp = await github.request(`GET /orgs/northerntrust-internal/teams/${slug}/external-groups`)
    if (idpResp.data.groups.length >= 1) {
        let groups = idpResp.data.groups[0]
        return groups.group_name
    }
    else { return null }
}
console.dir(teamList)
let suffixes = ["-Admin", "-Maintain", "-Read", "-Triage", "-Write"]
teamList.forEach((teamItem) => {
    if (suffixes.some(child => teamItem.slug.endsWith(child))) {
        let teamName = teamItem.split("-")[0]
        let teamChild = teamItem.split("-")[1]
        let idpMapping = await getIDPMapping(teamItem.slug)

        if ((teamItem.parent.slug === teamName) & idpMapping.endsWith(`-${teamName}-${teamChild}`)) {
            teamsCorrect.push(teamItem)
        } else {
            teamsIncorrect.push(teamItem)
        }

    } else {
        let idpMapping = await getIDPMapping(teamItem.slug)
        if ((teamItem.parent = null) & (idpMapping = null)) {
            teamsCorrect.push(teamItem)
        } else { teamsIncorrect.push(teamItem) }
    }

})
console.log("Teams following the convention :")
console.dir(teamsCorrect)
console.log("Teams not following convention :")
console.dir(teamsIncorrect)