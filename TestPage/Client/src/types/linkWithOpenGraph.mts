import { Serializable } from "../serializable.mjs";
import { LinkToAdd } from "./linkToAdd.mjs";
import { OpengraphTag } from "./openGraphTag.mjs";

export class LinkWithOpenGraph extends LinkToAdd implements Serializable<LinkWithOpenGraph> {

    id: number | null = null;
    opengraphTags: OpengraphTag[] = [];

    override deserialize(json: string | object): LinkWithOpenGraph {
        let obj = (typeof json === "string") ? JSON.parse(json) : (json as any);

        super.deserialize(obj);

        if(!("id" in obj)){
            throw new Error(`id is not present in provided JSON`)
        }
        if(!("opengraph_tags" in obj)){
            throw new Error(`opengraph_tags is not present in provided JSON`)
        }
        
        this.id = obj.id;

        for (const tag of obj.opengraph_tags) {
            this.opengraphTags.push(new OpengraphTag().deserialize(tag))
        }

        return this;
    }

    override serialize(): string {
        let tags : string[] = [];

        for (const tag of this.opengraphTags) {
            tags.push(tag.serialize());
        }

        return `{"id": ${this.id}, "path": "${this.path}", "target": "${this.target}", "hide_target": ${this.hideTarget ? 1 : 0}, "opengraph_tags": [${tags.join(", ")}]}`
    }
}