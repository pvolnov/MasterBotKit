import React from 'react';

import {Button, Checkbox, Dimmer, Form, Icon, Input, Loader, Modal, Table, TextArea} from 'semantic-ui-react'
import axios from "axios";
import {HOST_API} from "../constants/config";
import {toast} from "react-toastify";


export default class UserTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: props.columns,
            rows: props.rows,
        };
        this.rows_ids = [];
        this.patch_table_data = {};
    }


    show = () => {
        console.log(this.rows_ids);
        this.setState({openModal: true});
    };

    close = () => this.setState({openModal: false});


    selectUser = (chatid) => {
        if (this.rows_ids.indexOf(chatid) < 0) {
            this.rows_ids.push(chatid);
        } else
            this.rows_ids.splice(this.rows_ids.indexOf(chatid), 1);
        // console.log(this.rows_ids);
    };

    distribution = () => {
        axios.post(HOST_API + "api/", {
            type:"send_message",
            chats: this.rows_ids,
            message: this.state.message
        }).then((r) => toast.success(r.data)).catch((e) => toast.error(e.message));
        this.close()
    };

    save = () => {
        axios.patch(HOST_API + "tables/", {
            patch_table_data: this.patch_table_data
        }).then((r) => {
            console.log("SUC");
            toast.success(r.data)
        })
            .catch((e) => toast.error(e.message))
    };

    dropRows = () => {
        axios.delete(HOST_API + "tables/", {
        params:{
            rows:this.rows_ids,
        }
        }).then((r) => {
            toast.success(r.data)
        })
            .catch((e) => toast.error(e.message))
    };

    editRow = (id, name, value) => {
        //We will save all changes in `this.patch_table_data`
        //We will update data in database only after put in SAVE button
        if (!this.patch_table_data[id]) {
            this.patch_table_data[id] = {}
        }
        this.patch_table_data[id][name] = value;
    };

    loading=(loading)=>{
        this.setState({
            loading:loading
        })
    };

    render() {

        return (
            <Table celled compact definition>

                <Modal size={"mini"} open={this.state.openModal} onClose={this.close}>
                    <Modal.Header>Send messeges</Modal.Header>
                    <Modal.Content>
                        <Form>
                        <TextArea widths={16}
                                  fluid
                                  name={"message"} onChange={this.input}
                                  placeholder='С новым годом'/>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            icon
                            labelPosition='left'
                            onClick={this.distribution}
                        >
                            <Icon name='send'/> Send Message
                        </Button>
                    </Modal.Actions>
                </Modal>

                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell/>
                        {
                            this.state.columns.map((col) => {
                                return <Table.HeaderCell>{col.name}</Table.HeaderCell>
                            })
                        }

                    </Table.Row>
                </Table.Header>

                <Table.Body >
                    <Table.HeaderCell/>
                    {
                        this.state.rows.map((row, y) => {
                            return <Table.Row>
                                <Table.Cell collapsing>
                                    <Checkbox slider onChange={() => this.selectUser(row.id)}/>
                                </Table.Cell>
                                {
                                    row.row.map((col, i) => {
                                        if (this.state.columns[i].edit) {
                                            return <Table.Cell>
                                                <Form.Input
                                                    placeholder='value'
                                                    name={this.state.columns[i].name}
                                                    defaultValue={col}
                                                    onChange={(e, {name, value}) => this.editRow(row.id, name, value)}
                                                />
                                            </Table.Cell>
                                        } else
                                            return <Table.Cell>{col}</Table.Cell>
                                    })
                                }
                            </Table.Row>

                        })
                    }
                </Table.Body>

                <Table.Footer fullWidth>
                    <Table.Row>
                        <Table.HeaderCell/>
                        <Table.HeaderCell colSpan='4'>
                            <Button
                                floated='right'
                                icon
                                labelPosition='left'
                                primary
                                size='small'
                                onClick={this.show}
                            >
                                <Icon name='send'/> Send Message
                            </Button>
                            <Button size='small' onClick={this.dropRows}>Drop</Button>
                            <Button onClick={this.save} size='small'>
                                Save
                            </Button>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        )

    }
}


