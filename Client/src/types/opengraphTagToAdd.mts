import { ConstructorError } from "../ConstructorError.mjs";
import { Serializable } from "../serializable.mjs";

export class OpengraphTagToAdd implements Serializable<OpengraphTagToAdd> {
    linkId: number = -1;
    tag: string = "";
    content: string = "";

    constructor();
    constructor(linkId: number, tag: string, content: string);
    constructor(){
        if (arguments.length === 0) {
            return;
        }
        else if (arguments.length === 3) {
            this.linkId = arguments[0];
            this.tag = arguments[1];
            this.content = arguments[2];
            return;
        }
        throw new ConstructorError("Undefined constructor");    
    }

    deserialize(json: string | object): OpengraphTagToAdd {
        let obj = (typeof json === "string") ? JSON.parse(json) : (json as any);

        if(!("id" in obj)){
            throw new Error(`id is not present in provided JSON`)
        }
        if(!("tag" in obj)){
            throw new Error(`tag is not present in provided JSON`)
        }
        if(!("content" in obj)){
            throw new Error(`content is not present in provided JSON`)
        }

        this.linkId = obj.id;
        this.tag = obj.tag;
        this.content = obj.content;

        return this;
    }
    serialize(): string {
        return `{"id": ${this.linkId}, "tag": "${this.tag}", "content": "${this.content}"}`
    }

}