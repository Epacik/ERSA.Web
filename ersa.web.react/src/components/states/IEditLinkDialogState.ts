import { AdminApi } from "../../lib/Client/js/adminApi.mjs";
import IAddLinkDialogState from "./IAddLinkDialogState";

export default interface IEditLinkDialogState extends IAddLinkDialogState {
    linkId: number;
    linkOpengaphTags: AdminApi.OpengraphTag[];
    linkOpengaphTagsToRemove: AdminApi.OpengraphTag[];
    selectedTag: number;
}