import React from 'react';

import {Container, Form, Menu, Modal} from 'semantic-ui-react'
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import {HOST} from "../constants/config";
import AdminPage from "./AdminPage";
import BotPage from "./BotPage";
import IconMBK from "../img/telegram.png"
import cookie from "react-cookie";

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        // this.store = props.store;
        // this.dispatch = props.dispatch;

        this.state = {
            menuFixed: false,
            overlayFixed: false,
            openModal: false,
            menuID: 1,
            options: [
                {key: 1, value: 1, text: 'Start'},
                {key: 2, value: 2, text: 'Shop'},
                {key: 3, value: 3, text: 'Payment1'},
            ],
            menuTypes: [
                {key: 1, value: 'text', text: 'Text Menu'},
                {key: 2, value: 'inline', text: 'Inline Menu'},
                {key: 3, value: 'payment', text: 'Payment'},
            ],
            menu: [],
            activeItem: "bot"
            // activeItem:"admin"
        };




    }

    handleItemClick = (e, {name}) => this.setState({activeItem: name});


    show = () => this.setState({openModal: true});

    close = () => this.setState({openModal: false});

    input = (e, {name, value}) => {
        console.log(value);
        this.setState({[name]: value});
    };

    createMenu = (e, data) => {
        this.close();
        var main = this;
        this.state.menuID = this.state.options.length + 1;

        axios.post(HOST + '/api/', {
                type: "new_menu",
                params: {
                    type: data.value,
                    data: this.state.label,
                    menuID: this.state.menu
                }
            }
        ).then((resp) => {
            main.setState({
                menu: resp.data
            });
        }).catch((e) => {
            console.log(e.response);
            toast.error(JSON.stringify(e.response));
        });

        this.state.options.push({key: this.state.menuID, value: this.state.menuID, text: this.state.label});
        this.forceUpdate();
        console.log(this.state.options);

    };


    render() {
        const {activeItem, menuID, menu, openModal, menuTypes} = this.state;

        return (
            <Container className={"Page"}>
                <ToastContainer
                    position="top-left"
                    autoClose={2500}
                />
                <Modal size={"mini"} open={openModal} onClose={this.close}>
                    <Modal.Header>Create New Menu</Modal.Header>
                    <Modal.Actions>
                        <Form>
                            <Form.Group>
                                <Form.Input widths={12}
                                            name={"label"} onChange={this.input}
                                            placeholder='Name'/>
                                <Form.Button
                                    widths={4}
                                    onClick={this.createMenu}
                                    color={"green"}
                                >Create</Form.Button>
                            </Form.Group>
                        </Form>
                    </Modal.Actions>
                </Modal>

                <Menu pointing stackable>
                    <Menu.Item>
                        <img src={IconMBK}/>
                    </Menu.Item>

                    <Menu.Item
                        name='bot'
                        active={activeItem === 'bot'}
                        onClick={this.handleItemClick}
                    >Bot constructor</Menu.Item>
                    <Menu.Item
                        name='admin'
                        active={activeItem === 'admin'}
                        onClick={this.handleItemClick}
                    >Admin panel assembly</Menu.Item>
                </Menu>

                {activeItem === 'bot' &&
                <BotPage/>}
                {activeItem === 'admin' && <AdminPage/>}
            </Container>
        )

    }
}


