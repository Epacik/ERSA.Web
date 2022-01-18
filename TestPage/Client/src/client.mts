import { Link, LinkToAdd, LinkWithOpenGraph } from "./index.mjs";
import { Result } from "./result.mjs";

type HttpMethod = "POST" | "GET" | "PUT" | "DELETE";
type HttpBodyType = "text/json" | "text/html"

export class Client {
    #address: string = "https://admin-lnk.epat.xyz";
    // #address: string = "http://localhost:8079";
    #key: string | null = null;

    async #executeRequest(endpoint: string, method: HttpMethod, body: string | undefined = undefined, bodyMimeType: HttpBodyType | undefined = undefined) : Promise<Response> {
        try {
            let headers = new Headers({
                "Authorization": `Bearer ${this.#key}`,
            });

            if(bodyMimeType != undefined){
                headers.append("content-type", bodyMimeType);
            }

            return await fetch(this.#address + endpoint, {
                mode: "cors",
                method: method,
                body: body,
                credentials: "include",
                headers: headers,
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    //#region test connection

    public async testConnectionAsync(): Promise<Result> {
        let response = await this.#executeRequest("/api/test_connection", "GET");
        return new Result(response.ok, await response.text());
    }

    //#endregion

    //#region links

    public async addLinkAsync(linkToAdd: LinkToAdd) : Promise<Result> {
        let response = await this.#executeRequest("/api/v1/add_link", "PUT", linkToAdd.serialize(), "text/json");
        return new Result(response.status == 201, await response.text());
    }

    public async getLinkDataAsync(idOrPath: bigint | string): Promise<LinkWithOpenGraph> {
        let response = await this.#executeRequest(`/api/v1/get_link/${idOrPath}`, "GET");
        return new LinkWithOpenGraph().deserialize(await response.text());
    }

    //#endregion

    

    public async listLinksAsync(searchString: string | null = null): Promise<Link[]>  {
        let response = await this.#executeRequest(`/api/v1/list_links/${searchString ?? ""}`, "GET");
        let json = (await response.json()) as Array<any>;
        let links: Link[] = [];
        for (const link of json) {
            links.push(new Link().deserialize(link));
        }

        return links;
    }

    constructor();
    constructor(key: string);
    constructor() {
        this.#key = arguments.length == 0 ? localStorage.getItem("ersa_admin_key") : arguments[0];
    }
}
