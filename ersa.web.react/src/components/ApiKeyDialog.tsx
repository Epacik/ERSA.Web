import React, { ChangeEvent } from "react";
import { Button, Card, Form } from "react-bootstrap";
import IApiKeyDialogProps from "./props/IApiKeyDialogProps";
import IApiKeyDialogState from "./states/IApiKeyDialogState";
import { AdminApi } from "../lib/Client/js/adminApi.mjs";

const defaultSubmitButtonText = "Zapisz";
const clickedSubmitButtonText = "Łączenie z API";

class ApiKeyDialog extends React.Component<IApiKeyDialogProps, IApiKeyDialogState> {
    keyUpdated: Function | undefined;

    constructor(props: IApiKeyDialogProps) {
        super(props);
        this.keyUpdated = props.keyUpdated;
        this.state = {
            buttonText: defaultSubmitButtonText,
            keyInput: "",
        };
    }

    keyInputTextChanged(event: ChangeEvent<HTMLInputElement>) {
        let currentState = this.state;
        this.setState({
            buttonText: currentState.buttonText,
            keyInput: event.target.value
        });
    }

    async submitButtonClicked() {
        const key = this.state.keyInput;

        this.setState({
            buttonText: clickedSubmitButtonText,
            keyInput: "",
        });

        const apiClient = new AdminApi.Client(key);
        
        const result = await apiClient.testConnectionAsync();
        if(!result.success) {
            alert(`Błąd połączenia z API\nSprawdź poprawność klucza\n\n${result.message}`);
            return;
        }

        localStorage.setItem(AdminApi.Client.localStorageItemKey, key);

        this.setState({
            buttonText: defaultSubmitButtonText,
            keyInput: "",
        });
        
        if(this.keyUpdated !== undefined){
            this.keyUpdated();
        }
    }

    render() {
        return (
            <section className="ApiKeyDialog">
                <Card >
                    <Card.Body>
                        <Form>
                            <Form.Group >
                                <Form.Label htmlFor="ApiKeyDialog:KeyInput">Podaj klucz API</Form.Label>
                                <Form.Control id="ApiKeyDialog:KeyInput"
                                              placeholder="Klucz API"
                                              value={this.state.keyInput}
                                              onChange={this.keyInputTextChanged.bind(this)}/>
                            </Form.Group>
                            <Button onClick={this.submitButtonClicked.bind(this)}>
                                {this.state.buttonText}
                            </Button>
                        </Form>
                    
                    </Card.Body>
                </Card>
            </section>
        );
    }
}

export default ApiKeyDialog;