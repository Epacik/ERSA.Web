export interface Serializable<T> {
    deserialize(json: string | object) : T;
    serialize() : string;
}