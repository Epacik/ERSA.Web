import { Link } from "../../lib/Client/js/index.mjs";

export default interface ILinkListState {
    searchString: string;
    links: Link[];

    showAddLink: boolean;
    showEditLink: boolean;
}