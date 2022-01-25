import React, { ChangeEvent } from "react";
import { Button, ButtonGroup, Form, Modal, Table } from "react-bootstrap";
import { isNull } from "util";
import { AdminApi } from "../lib/Client/js/adminApi.mjs";
import IAddLinkDialogProps from "./props/IAddLinkDialogProps";
import IEditLinkDialogProps from "./props/IEditLinkDialogProps.js";
import IEditLinkDialogState from "./states/IEditLinkDialogState.js";

export default class EditLinkDialog extends React.Component<IEditLinkDialogProps, IEditLinkDialogState> {
    linkSaved: Function;
    linkSaveCancelled: Function;
    client: AdminApi.Client;
    link: AdminApi.LinkWithOpenGraph | undefined = undefined;
    mounted: any;

    constructor(props: IEditLinkDialogProps) {
        super(props);
        this.client = new AdminApi.Client();

        this.state = {
            showDialog: false,
            linkPath: "",
            linkTarget: "",
            linkhideTarget: false,
            linkId: props.linkId,
            linkOpengaphTags: [],
            linkOpengaphTagsToRemove: [],
            selectedTag: -1,
        };

        this.linkSaved = props.linkSaved;
        this.linkSaveCancelled = props.linkSaveCancelled;

        this.handleClose            = this.handleClose.bind(this);
        this.handleSave             = this.handleSave.bind(this);
        this.pathChanged            = this.pathChanged.bind(this);
        this.targetChanged          = this.targetChanged.bind(this);
        this.hideTargetChanged      = this.hideTargetChanged.bind(this);
        this.addTagButtonClicked    = this.addTagButtonClicked.bind(this);
        this.editTagButtonClicked   = this.editTagButtonClicked.bind(this);
        this.removeTagButtonClicked = this.removeTagButtonClicked.bind(this);
        this.onOpengraphTagClicked  = this.onOpengraphTagClicked.bind(this);

        
    }

    componentDidMount() {
        this.loadLink(this.props.linkId);
        this.mounted = true;
    }

    async loadLink(linkId: number) {
        const link = await this.client.getLinkDataAsync(linkId);
        this.link = link;

        this.setState(current => ({
            linkPath: link.path,
            linkTarget: link.target,
            linkhideTarget: link.hideTarget,
            linkOpengaphTags: link.opengraphTags,
            showDialog: true, 
        }));
    }

    isNullishOrWhitespace(text: string | null | undefined) {
        return text === null || text === undefined || text.trim() === "";
    }

    handleClose() {
        this.setState(c => ({showDialog: false}))
        setTimeout(this.linkSaveCancelled, 400);
    }

    async handleSave() {
        if(this.isNullishOrWhitespace(this.state.linkPath) || this.isNullishOrWhitespace(this.state.linkTarget)) {
            return;
        }

        const client = this.client;
        const link = new AdminApi.Link(this.state.linkId, this.state.linkPath, this.state.linkTarget, this.state.linkhideTarget);
        let response = await client.updateLinkAsync(link);

        if(!response.success) {
            window.prompt(`Wystąpił błąd aktualizacji linku linku\n${response.message}`);
            return;
        }


        const tagsToRemove = this.state.linkOpengaphTagsToRemove;

        for (const tag of tagsToRemove) {
            if((tag.id ?? -1) !== -1){
                response = await client.removeOpengraphTagAsync(tag.id ?? -1);
            }
        }


        const tags = this.state.linkOpengaphTags;

        for (const tag of tags) {
            if((tag.id ?? -1) === -1) {
                response = await client.addOpengraphTagAsync(new AdminApi.OpengraphTagToAdd(link.id, tag.tag, tag.content));
            }
            else {
                response = await client.updateOpengraphTagAsync(tag);
            }
        }

        this.setState(c => ({showDialog: false}))
        setTimeout(this.linkSaved, 400);
    }

    pathChanged(e: ChangeEvent<HTMLInputElement>){
        if(!this.mounted){
            return;
        }
        this.setState(c => ({
            linkPath: e.target.value
        }));
    }

    targetChanged(e: ChangeEvent<HTMLInputElement>){
        if(!this.mounted){
            return;
        }
        this.setState(c => ({
            linkTarget: e.target.value
        }));
    }

    hideTargetChanged(e: ChangeEvent<HTMLInputElement>){
        if(!this.mounted){
            return;
        }
        this.setState(c => ({
            linkhideTarget: e.target.checked,
        }));
    }

    addTagButtonClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        let tags = this.state.linkOpengaphTags;
        tags.push(new AdminApi.OpengraphTag(this.state.linkId, "Tag", "Wartość"));
        this.setState(c => ({linkOpengaphTags: tags}));
    }

    editTagButtonClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        const selectedTag = this.state.selectedTag;
        if(selectedTag < 0){
            return;
        }

        let tags = this.state.linkOpengaphTags;
        let tag = tags[selectedTag];

        const newTag = window.prompt("Edytuj tag", tag.tag);
        if(newTag === null){
            return;
        }

        const newContent = window.prompt("Edytuj wartość tagu", tag.content);
        if(newContent === null){
            return;
        }

        tag.tag = newTag;
        tag.content = newContent;

        tags[selectedTag] = tag;

        this.setState(x => ({linkOpengaphTags: tags}));
    }

    removeTagButtonClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if(this.state.selectedTag < 0 || !window.confirm("Czy na pewno chcesz usunąć tag?")){
            return;
        }

        const selectedTag = this.state.selectedTag;
        const oldTags = this.state.linkOpengaphTags;
        let newTags: AdminApi.OpengraphTag[] = [];
        let tagsToRemove = this.state.linkOpengaphTagsToRemove;

        for(let index = 0; index < oldTags.length; index++){
            if(index === selectedTag){
                tagsToRemove.push(oldTags[index]);
                continue;
            }

            newTags.push(oldTags[index]);
        }

        this.setState(c => ({
            linkOpengaphTags: newTags,
            selectedTag: -1,
        }));
        
    }

    onOpengraphTagClicked(event: React.MouseEvent<HTMLTableCellElement, MouseEvent>) {
        const target = event.target as HTMLTableCellElement;
        const row: HTMLTableRowElement | null = target.parentElement as HTMLTableRowElement;
        if(row === null) {
            return;
        }

        const allRows = document.querySelectorAll(".EditDialog-OpenGraphLinks-Table tbody tr");

        for(let index = 0; index < allRows.length; index++){
            allRows[index].classList.remove("table-primary")
        }

        row.classList.add("table-primary");
        this.setState(c => ({selectedTag: parseInt(target.dataset.index ?? "-1")}))
    }

    render(){
        return (
            <Modal show={this.state.showDialog} onHide={this.handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edytuj link</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Ścieżka</Form.Label>
                        <Form.Control type="text" value={this.state.linkPath} onChange={this.pathChanged} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Cel</Form.Label>
                        <Form.Control type="text" value={this.state.linkTarget} onChange={this.targetChanged}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Ukryj cel</Form.Label>
                        <Form.Check checked={this.state.linkhideTarget} onChange={this.hideTargetChanged} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Tagi</Form.Label>
                        <br/>
                        <ButtonGroup>
                            <Button variant="outline-primary"
                                    size="sm"
                                    onClick={this.addTagButtonClicked}>
                                Dodaj
                            </Button>
                            <Button variant="outline-primary" 
                                    size="sm"
                                    onClick={this.editTagButtonClicked}>
                                Edytuj
                            </Button>
                            <Button variant="outline-danger" 
                                    size="sm"
                                    onClick={this.removeTagButtonClicked}>
                                Usuń
                            </Button>
                        </ButtonGroup>
                    </Form.Group>

                    
                    <Table className="EditDialog-OpenGraphLinks-Table" striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Tag</th>
                                <th>Wartość</th>
                            </tr>
                        </thead>

                        <tbody>
                            {this.state.linkOpengaphTags.map((x, i) => 
                                <tr key={`EditLink-opengraphTags-table-item-${i}`} >
                                    <td onClick={this.onOpengraphTagClicked} data-index={i}>{x.tag}</td>
                                    <td onClick={this.onOpengraphTagClicked} data-index={i}>{x.content}</td>
                                </tr>)}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                    Anuluj
                </Button>
                <Button variant="primary" onClick={this.handleSave}>
                    Zapisz
                </Button>
                </Modal.Footer>
          </Modal> 
        );
    }
}