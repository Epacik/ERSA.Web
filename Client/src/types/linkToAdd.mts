import { Serializable } from "../serializable.mjs";

export class LinkToAdd implements Serializable<LinkToAdd> {
    path: string = "";
    target: string = "";
    hideTarget: boolean = false;

    constructor();
    constructor(path: string, target: string, hide: boolean)
    constructor() {
        if(arguments.length == 0)
        {
            return;
        }
        
        this.path = arguments[0] as string;
        this.target = arguments[1] as string;
        this.hideTarget = arguments[2] as boolean;
    }
    
    deserialize(json: string | object): LinkToAdd {
        
        let obj = (typeof json === "string") ? JSON.parse(json) : (json as any);

        if(!("path" in obj)){
            throw new Error(`path is not present in provided JSON`)
        }
        if(!("target" in obj)){
            throw new Error(`target is not present in provided JSON`)
        }
        if(!("hide_target" in obj)){
            throw new Error(`hide_target is not present in provided JSON`)
        }

        this.path = obj.path;
        this.target = obj.target;
        this.hideTarget = obj.hide_target == 1;
        
        return this;
    }
    serialize(): string {
        return `{"path": "${this.path}", "target": "${this.target}", "hide_target": ${this.hideTarget ? 1 : 0}}`
    }

}