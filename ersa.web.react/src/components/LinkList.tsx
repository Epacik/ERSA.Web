import React, { ChangeEvent, KeyboardEvent } from "react";
import { Button, ButtonGroup, Container, ListGroup, ListGroupItem, Modal, Navbar } from "react-bootstrap";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import ILinkListState from "./states/ILinkListState";
import { AdminApi } from '../lib/Client/js/adminApi.mjs';
import AddLinkDialog from "./AddLinkDialog";
import EditLinkDialog from "./EditLinkDialog";

export default class LinkList extends React.Component<{}, ILinkListState> {
    client: AdminApi.Client;
    selectedLink: number = -1;
    
    constructor(props: {}) {
        super(props);
        this.state = {
            searchString: "",
            links: [],
            showAddLink: false,
            showEditLink: false,
        };

        this.searchInputChanged    = this.searchInputChanged.bind(this);
        this.searchInputKeyPressed = this.searchInputKeyPressed.bind(this);
        this.refreshButtonClicked  = this.refreshButtonClicked.bind(this);
        this.listGroupItemClicked  = this.listGroupItemClicked.bind(this);
        this.addButtonClick        = this.addButtonClick.bind(this);
        this.editButtonClick       = this.editButtonClick.bind(this);
        this.removeButtonClick     = this.removeButtonClick.bind(this);
        this.addOrEditLinkDialogSaved    = this.addOrEditLinkDialogSaved.bind(this);
        this.addOrEditLinkSaveCancelled  = this.addOrEditLinkSaveCancelled.bind(this);

        this.client = new AdminApi.Client();
        
    }

    componentDidMount() {
        this.search("");
    }

    searchInputChanged(event: ChangeEvent<HTMLInputElement>) {
        const currentState = this.state;

        this.setState(current => ({
            searchString: event.target.value
        }))
    }

    searchInputKeyPressed(event: KeyboardEvent<HTMLInputElement>) {
        if(event.key !== "Enter"){
            return;
        }
        this.search(this.state.searchString);
    }

    refreshButtonClicked() {
        this.search(this.state.searchString);
    }

    listGroupItemClicked(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.deselectAll();
        const target = (event.target as HTMLDivElement);

        target.classList.add("active");
        this.selectedLink = parseInt(target.dataset.index ?? "-1");
    }

    addButtonClick() {
        this.setState(current => ({
            showAddLink: true,
        }));
    }

    editButtonClick() {
        if(this.selectedLink === -1){
            return;
        }

        this.setState(current => ({
            showEditLink: true,
        }));
    }

    async removeButtonClick() {
        if(this.selectedLink == -1) {
            return;
        }

        const linkToRemove = this.state.links[this.selectedLink];

        if(!window.confirm("Czy na pewno chcesz usunąć link?")){
            return;
        }

        await this.client.removeLinkAsync(linkToRemove.id);

        await this.search(this.state.searchString);
    }

    addOrEditLinkDialogSaved() {
        this.setState(c => ({
            showAddLink: false,
            showEditLink: false,
        }));
        this.search(this.state.searchString);
    }

    addOrEditLinkSaveCancelled() {
        this.setState(c => ({
            showAddLink: false,
            showEditLink: false, 
        }));
        this.search(this.state.searchString);
    }

    async search(searchString: string) {
        let result = await this.client.listLinksAsync(searchString);
        const currentState = this.state;
        this.setState(current => ({
            links: result,
        }));

        this.deselectAll();
    }
    private deselectAll() {
        let items = document.querySelectorAll(".LinkList .LinkList-List .list-group-item");

        for (let index = 0; index < items.length; index++) {
            items[index].classList.remove("active");
        }
    }

    render() {
        return <section className="LinkList">
            <Navbar className="navbar-nav LinkList-Navbar" bg="light">
                <Container>
                    <Button variant="outline-primary" size="sm" onClick={this.refreshButtonClicked}>Odśwież</Button>
                    <p></p> 
                    
                    <span>
                        <FontAwesomeIcon icon={faSearch}/>
                        <input className="LinkList-searchInput" 
                               placeholder="Wyszukaj"
                               onChange={this.searchInputChanged}
                               onKeyPress={this.searchInputKeyPressed} />
                    </span>
                </Container>
            </Navbar>
            <div className="LinkList-List-Wrapper">
                <ListGroup className="LinkList-List">
                    {this.state.links.sort(x => x.path).map((x, i) => 
                        <ListGroup.Item id={`LinkList-List-Item-${i}`} 
                                        key={`LinkList-List-Item-${i}`} 
                                        data-index={`${i}`}
                                        onClick={this.listGroupItemClicked} >
                            <p>{x.path}</p>
                            <p>{x.target}</p>
                            <p>Cen ukryty: {x.hideTarget ? "Tak" : "Nie"}</p>
                        </ListGroup.Item>)
                    }
                </ListGroup>
            </div>
            <div className="LinkList-ButtonWrapper">
                <Button variant="outline-primary" 
                        size="sm"
                        onClick={this.addButtonClick}>
                    Dodaj
                </Button> 

                <Button variant="outline-primary" 
                        size="sm"
                        onClick={this.editButtonClick}>
                    Edytuj
                </Button> 

                <Button variant="outline-danger"
                        size="sm"
                        onClick={this.removeButtonClick}>
                    Usuń
                </Button>
            </div>
            {this.state.showAddLink &&
                <AddLinkDialog linkSaved={this.addOrEditLinkDialogSaved} linkSaveCancelled={this.addOrEditLinkSaveCancelled} />
            }
            {this.state.showEditLink && 
                <EditLinkDialog linkSaved={this.addOrEditLinkDialogSaved} linkSaveCancelled={this.addOrEditLinkSaveCancelled} linkId={this.state.links[this.selectedLink].id} />
            }

        </section>;
    }
}