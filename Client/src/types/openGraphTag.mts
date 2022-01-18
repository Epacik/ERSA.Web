import { Serializable } from "../serializable.mjs";

export class OpengraphTag implements Serializable<OpengraphTag> {

    id : number | null = null;
    linkId: number = -1;
    tag: string = "";
    content: string = "";

    constructor();
    constructor(linkId: number, tag: string, content: string);
    constructor(id: number, linkId: number, tag: string, content: string);
    constructor(){
        if(arguments.length === 0){
            return;
        }
        else if(arguments.length === 3){
            this.linkId = arguments[0];
            this.tag = arguments[1];
            this.content = arguments[2];
            return;
        }
        else if(arguments.length === 4){
            this.id = arguments[0];
            this.linkId = arguments[1];
            this.tag = arguments[2];
            this.content = arguments[3];
            return;
        }

        throw new Error("Unknown constructor");
    }

    deserialize(json: string | object): OpengraphTag {
        let obj = (typeof json === "string") ? JSON.parse(json) : (json as any);

        if(!("log_id" in obj)){
            throw new Error(`log_id is not present in provided JSON`)
        }
        if(!("log_link_id" in obj)){
            throw new Error(`log_link_id is not present in provided JSON`)
        }
        if(!("log_tag" in obj)){
            throw new Error(`log_tag is not present in provided JSON`)
        }
        if(!("log_content" in obj)){
            throw new Error(`log_content is not present in provided JSON`)
        }

        this.id = obj.log_id;
        this.linkId = obj.log_link_id;
        this.tag = obj.log_tag;
        this.content = obj.log_content;

        return this;
    }

    serialize(): string {
        return `{"log_id" : ${this.id}, "log_link_id": ${this.linkId}, "log_tag" : "${this.tag}", "log_content": "${this.content}"}`
    }

}