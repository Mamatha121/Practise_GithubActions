let teamList = await github.paginate(github.rest.teams.list,
    { org: context.payload.organization.login },
    (resp) => resp.data.map((teamItem) => ({
        "name": teamItem.name,
        "slug": teamItem.slug,
        "id": teamItem.id,
        "parent": teamItem.parent ? {
            "name": teamItem.parent.name,
            "slug": teamItem.parent.slug,
            "id": teamItem.parent.id
        } : null
    }))
)

let teamsCorrect = []
let teamsIncorrect = []
let idpMapping = ''

async function getIDPMapping(slug) {
    let idpResp = {}
    try {
        idpResp = await github.request(`GET /orgs/northerntrust-internal/teams/${slug}/external-groups`)
    } catch (err) { return '' }

    if (idpResp.data.groups.length >= 1) {
        let groups = idpResp.data.groups[0]
        let groupName = String(groups.group_name).toLowerCase()
        return groupName
    }
    else { return '' }
}

let suffixes = ["-admin", "-maintain", "-read", "-triage", "-write"]
teamList.forEach((teamItem) => {
    getIDPMapping(teamItem.slug).then((mapping) => {
        console.log(`In Then - ${mapping}`)
        idpMapping = mapping
    })
    //(async()=>{idpMapping = await getIDPMapping(teamItem.slug)})()

    if (suffixes.some(child => teamItem.slug.endsWith(child))) {
        let teamName = teamItem.slug.split("-")[0]
        let teamChild = teamItem.slug.split("-")[1]
        console.log(`Inside1If ${teamItem.name}, ${idpMapping.endsWith(`-${teamName}-${teamChild}`)}`)
        if ((teamItem.parent === null)||(idpMapping.length == 0)) {
            teamsIncorrect.push(teamItem.name)
        }
        else if ((teamItem.parent.slug === teamName) & idpMapping.endsWith(`-${teamName}-${teamChild}`)) {
            teamsCorrect.push(teamItem.name)
        } else {
            teamsIncorrect.push(teamItem.name)
        }

    } else {
        console.log("Inside1Else ${teamItem.name}")
        if ((teamItem.parent === null) & (idpMapping.length == 0)) {
            teamsCorrect.push(teamItem.name)
        } else { teamsIncorrect.push(teamItem.name) }
    }

})
console.log("Teams following the convention :")
console.dir(teamsCorrect)
console.log("Teams not following convention :")
console.dir(teamsIncorrect)
