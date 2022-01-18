import { Serializable } from "../serializable.mjs";


export class Link implements Serializable<Link> {
    id: bigint | null = null;
    path: string = "";
    target: string = "";
    hideTarget: boolean = false;

    constructor();
    constructor(id: bigint | null, path: string, target: string, hide: boolean)
    constructor() {
        if(arguments.length == 0)
        {
            return;
        }
        
        this.id = arguments[0];
        this.path = arguments[1];
        this.target = arguments[2];
        this.hideTarget = arguments[3];
    }

    deserialize(json: string | object): Link {
        
        let obj = (typeof json === "string") ? JSON.parse(json) : (json as any);

        if(!("lnk_id" in obj)){
            throw new Error(`lnk_id is not present in provided JSON`)
        }
        if(!("lnk_path" in obj)){
            throw new Error(`lnk_path is not present in provided JSON`)
        }
        if(!("lnk_target" in obj)){
            throw new Error(`lnk_target is not present in provided JSON`)
        }
        if(!("lnk_hide_target" in obj)){
            throw new Error(`lnk_hide_target is not present in provided JSON`)
        }

        this.id = obj.lnk_id;
        this.path = obj.lnk_path;
        this.target = obj.lnk_target;
        this.hideTarget = obj.lnk_hide_target == 1;
        
        return this;
    }
    serialize(): string {
        return `{"lnk_id": ${this.id}, "lnk_path": "${this.path}", "lnk_target": "${this.target}", "lnk_hide_target": ${this.hideTarget ? 1 : 0}}`
    }
}