export type GithubTag = {
    "ref": string,
    "node_id": string,
    "url": string,
    "object": {
        "sha": string,
        "type": 'commit' | 'tag',
        "url": string,
    }
}

// TODO: This is a tag for github, to see if we get similar with gitlab
export type Tag = GithubTag;
export type Service = 'github';

/**
 * A class to fetch information about the repo independantly from the 
 * service (gitlab/github) used.
 * NOTE: For now, we support only github.
 */
export default class VersionControlSystem {
    private owner: string;
    private repo: string;
    private service: Service;

    constructor(service: Service, owner: string, repo: string) {
        this.owner = owner;
        this.repo = repo;
        this.service = service;
    }

    /**
     * Fetch the list of tags. it returns only the latest 30 tags.
     */
    async getTags(): Promise<Tag[]> {
        return new Promise(async (resolve, reject) => {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/git/matching-refs/tag`;
            console.log(`Fetching tags using ${url}`);
            const response = await fetch(url, {
                method: 'get',
                headers: { 'Content-Type': 'application/json' },
            });

            // TODO: It would be nice to avoid getting all and truncating after
            if (response.status === 200) {
                const json = await response.json();
                const sorted = json.reverse().slice(0, 30); // TODO: we show only the last 30, we may want a setting for that or let the user use free text
                resolve(sorted)
            } else {
                reject(new Error(`Something went wrong fetching the tags from ${url}. Status: ${response.status}`))
            }
        })
    }

    /**
     * Fetch a given version from a given repo and store it as
     * `destination`.
     * @param tag The tag of the version to fetch. ie `v0.8.28`
     * @param destination Destination file
     */
    public async fetchSourceArchive(tag: string, destination: string): Promise<void> {
        const { owner, repo, service } = this;

        console.log(`Fetching tag ${tag} of ${owner}/${repo} from ${service}`);

        if (service !== 'github') throw new Error(`${service} not supported yet`)
        const url = `https://codeload.github.com/${owner}/${repo}/zip/${tag}`;

        const { writeFile } = require('fs');
        const { promisify } = require('util');
        const writeFilePromise = promisify(writeFile);

        await fetch(url)
            .then(x => x.arrayBuffer())
            .then(x => writeFilePromise(destination, Buffer.from(x)));

        return;
    }

    /**
     * WIP: It would be better to handle the zip as a stream and unzip it
     * right away, taking away the download and cleanup of the zip away from the runner.
     * @param tag 
     * @param destination 
     */
    public async fetchSource(tag: string, destination: string): Promise<void> {
        const { owner, repo, service } = this;
        // const outputFile = `${owner}-${repo}-${tag}.zip`;
        throw new Error("Method not implemented.");
    }
}
