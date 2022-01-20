import React, { ChangeEvent } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { isNull } from "util";
import { AdminApi } from "../lib/Client/js/adminApi.mjs";
import IAddLinkDialogProps from "./props/IAddLinkDialogProps";
import IAddLinkDialogState from "./states/IAddLinkDialogState";

export default class AddLinkDialog extends React.Component<IAddLinkDialogProps, IAddLinkDialogState> {
    linkSaved: Function;
    linkSaveCancelled: Function;

    constructor(props: IAddLinkDialogProps) {
        super(props);
        this.state = {
            showDialog: true,
            linkPath: "",
            linkTarget: "",
            linkhideTarget: false,
        };

        this.linkSaved = props.linkSaved;
        this.linkSaveCancelled = props.linkSaveCancelled;

        this.handleClose       = this.handleClose.bind(this);
        this.handleSave        = this.handleSave.bind(this);
        this.pathChanged       = this.pathChanged.bind(this);
        this.targetChanged     = this.targetChanged.bind(this);
        this.hideTargetChanged = this.hideTargetChanged.bind(this);
    }

    isNullishOrWhitespace(text: string | null | undefined) {
        return text === null || text === undefined || text.trim() === "";
    }

    handleClose() {
        this.setState(c => ({showDialog: false}))
        setTimeout(this.linkSaveCancelled, 400);
    }

    async handleSave() {
        if(this.isNullishOrWhitespace(this.state.linkPath) || this.isNullishOrWhitespace(this.state.linkTarget)){
            return;
        }

        const client = new AdminApi.Client();
        const response = await client.addLinkAsync(new AdminApi.LinkToAdd(this.state.linkPath, this.state.linkTarget, this.state.linkhideTarget));

        if(!response.success){
            window.prompt(`Wystąpił błąd dodawania linku\n${response.message}`);
            return;
        }

        this.setState(c => ({showDialog: false}))
        setTimeout(this.linkSaved, 400);
    }

    pathChanged(e: ChangeEvent<HTMLInputElement>){
        this.setState(c => ({
            linkPath: e.target.value
        }));
    }

    targetChanged(e: ChangeEvent<HTMLInputElement>){
        this.setState(c => ({
            linkTarget: e.target.value
        }));
    }

    hideTargetChanged(e: ChangeEvent<HTMLInputElement>){
        this.setState(c => ({
            linkhideTarget: e.target.checked,
        }));
    }

    render(){
        return (
            <Modal show={this.state.showDialog} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Dodaj link</Modal.Title>
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
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                    Anuluj
                </Button>
                <Button variant="primary" onClick={this.handleSave}>
                    Dodaj
                </Button>
                </Modal.Footer>
          </Modal> 
        );
    }
}