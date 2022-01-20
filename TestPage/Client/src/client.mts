import { Link, LinkToAdd, LinkWithOpenGraph, OpengraphTag, OpengraphTagToAdd } from "./index.mjs";
import { Result } from "./result.mjs";

type HttpMethod = "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
type HttpBodyType = "text/json" | "text/html"


export class Client {
    /**
     * Address of remote server
     */
    #address: string = "https://admin-lnk.epat.xyz";
    // #address: string = "http://localhost:8079";

    /**
     * Api key to access a remote server
     */
    #key: string | null = null;

    /**
     * Send a request to remote server and return a response
     * @param endpoint Endpoint of an remote server
     * @param method HTTP Method used to send a request
     * @param body Body of a request
     * @param bodyMimeType MIME type of a request body
     * @returns Response from remote server
     */
    async #executeRequest(endpoint: string, method: HttpMethod, body: string | undefined = undefined, bodyMimeType: HttpBodyType | undefined = undefined): Promise<Response> {
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

    /**
     * Check if connection to a server is possible
     * @returns Result of connection test
     */
    public async testConnectionAsync(): Promise<Result> {
        let response = await this.#executeRequest("/api/test_connection", "GET");
        return new Result(response.ok, await response.text());
    }

    //#endregion

    //#region links

    /**
     * Add a link
     * @param linkToAdd Link that is going to be added
     * @returns Result of adding a link
     */
    public async addLinkAsync(linkToAdd: LinkToAdd): Promise<Result> {
        let response = await this.#executeRequest("/api/v1/add_link", "PUT", linkToAdd.serialize(), "text/json");
        return new Result(response.status == 201, await response.text());
    }

    /**
     * Get a link data
     * @param idOrPath Id or path to link
     * @returns Link data 
     */
    public async getLinkDataAsync(idOrPath: number | string): Promise<LinkWithOpenGraph> {
        let response = await this.#executeRequest(`/api/v1/get_link/${idOrPath}`, "GET");
        return new LinkWithOpenGraph().deserialize(await response.text());
    }

    /**
     * Update a link
     * @param linkToUpdate Link you want to update
     * @returns Result of updating a link
     */
    public async updateLinkAsync(linkToUpdate: Link): Promise<Result> {
        let response = await this.#executeRequest("/api/v1/update_link", "PATCH", linkToUpdate.serialize(), "text/json");
        return new Result(response.ok, await response.text());
    }

    /**
     * Remove a link
     * @param idOrPath Id or path to link 
     * @returns Result of removing a link
     */
    public async removeLinkAsync(idOrPath: number | string): Promise<Result> {
        let response = await this.#executeRequest(`/api/v1/remove_link/${idOrPath}`, "DELETE");
        return new Result(response.ok, await response.text());
    }

    //#endregion

    //#region openGraph

    public async addOpengraphTagAsync(tagToAdd: OpengraphTagToAdd): Promise<Result> {
        let response = await this.#executeRequest("/api/v1/add_opengraph_tag", "PUT", tagToAdd.serialize(), "text/json");
        return new Result(response.ok, await response.text());
    }

    public async getOpengraphTagAsync(tagId: number): Promise<OpengraphTag> {
        let response = await this.#executeRequest(`/api/v1/get_opengraph_tag/${tagId}`, "GET");
        return new OpengraphTag().deserialize(await response.text());
    }

    public async updateOpengraphTagAsync(tagToUpdate: OpengraphTag): Promise<Result> {
        let response = await this.#executeRequest("/api/v1/update_opengraph_tag", "PATCH", tagToUpdate.serialize(), "text/json");
        return new Result(response.ok, await response.text());
    }

    public async removeOpengraphTagAsync(tagId: number): Promise<Result> {
        let response = await this.#executeRequest(`/api/v1/remove_opengraph_tag/${tagId}`, "DELETE");
        return new Result(response.ok, await response.text());
    }


    //#endregion

    public async listLinksAsync(searchString: string): Promise<Link[]>  {
        let response = await this.#executeRequest(`/api/v1/list_links/${searchString ?? ""}`, "GET");
        if(!response.ok) {
            return [];
        }

        let json = (await response.json()) as Array<any>;
        let links: Link[] = [];
        for (const link of json) {
            links.push(new Link().deserialize(link));
        }

        return links;
    }

    static localStorageItemKey = "ersa_admin_key";
    constructor();
    constructor(key: string);
    constructor() {
        this.#key = arguments.length == 0 ? localStorage.getItem(Client.localStorageItemKey) : arguments[0];
    }
}
