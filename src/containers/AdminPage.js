import React from 'react';

import {
    Button,
    Container,
    Dimmer,
    Form,
    Header,
    Icon,
    Input,
    Label,
    List,
    Loader,
    Modal,
    Segment
} from 'semantic-ui-react'
import ConfigEdit from "../components/ConfigEdit";
import {ScrollMenu} from "react-horizontal-scrolling-menu";
import axios from "axios";
import {HOST} from "../constants/config";
import {toast, ToastContainer} from "react-toastify";


export default class AdminPage extends React.Component {
    constructor(props) {
        super(props);
        // this.store = props.store;
        // this.dispatch = props.dispatch;

        this.state = {
            menuFixed: false,
            overlayFixed: false,
            openModal: false,
            menuID: 1,
            defoultOptions: [
                {key: 1, value: "%NAME%", text: 'Name'},
                {key: 2, value: "%USERNAME%", text: 'Nickname'},
                {key: 3, value: "%TIME%", text: 'Time'},
                {key: 4, value: "%USER_ID%", text: 'ID'},
            ],
            tables: [],
            activeItem: "bot",
            addTableName: "init"
        };
        this.updateList = [];


    }

    componentDidMount() {
        var main = this;
        main.loading(true);
        axios.get(HOST + "tables/")
            .then((resp) => {
                main.loading(false);
                main.setState({tables: resp.data})
            }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    }

    loading=(loading)=>{
        this.setState({
            loading:loading
        })
    };

    show = () => {
        this.setState({openModal: true});
    };

    close = () => this.setState({openModal: false});

    input = (e, {name, value}) => {
        console.log(value);
        this.setState({[name]: value});
    };

    etitTable = (index, k, name, value) => {
        if (value === undefined) {
            this.state.tables[index].columns[k][name] ^= 1;
            console.log(this.state.tables[index].columns[k])
        } else
            this.state.tables[index].columns[k][name] = value;
        this.forceUpdate();
        if (this.updateList.indexOf(index) == -1)
            this.updateList.push(index);
    };

    addColumn = (index) => {
        this.state.tables[index].columns.push({
            "name": "Name",
            "default": false,
            "defaultValue": "",
            "edit": true
        });
        this.forceUpdate()
    };

    dropColumn = (index, k) => {
        this.state.tables[index].columns.splice(k, 1);
        this.forceUpdate()
    };

    save = () => {
        for (let t in this.updateList) {
            this.saveTable(this.updateList[t]);
        }
        this.updateList = [];
    };

    saveTable = (index) => {
        axios.patch(HOST + "tables/",
            {
                ...this.state.tables[index],
            }).then((resp) => {
            console.log("Table saving...", resp.data);
            toast.success("Done");

        }).catch((e) => {
            toast.error(JSON.stringify(e.response.data));
        });
    };

    addTable = () => {
        var main = this;
        console.log(this.state.addTableName);
        axios.post(HOST + "tables/",
            {
                name: this.state.addTableName,
                columns: []
            }).then((resp) => {
            console.log(resp.data);
            main.state.tables.push(resp.data);
            main.forceUpdate();
            toast.success("Done");
        }).catch((e) => {
            console.log(e.response);
            toast.error(JSON.stringify(e.response));
        });
        this.close();
    };

    drop = (index) => {
        var tindex = this.state.tables[index].id;
        var main = this;
        axios.delete(HOST + "tables/" ,{
            params:{
                table_id:tindex
            }
        }).then((resp) => {
            console.log(resp.data);
            main.state.tables.splice(index, 1);
            main.forceUpdate();
            toast.success("Done");
        }).catch((e) => {
            console.log(e.response.data);
            toast.error(JSON.stringify(e.response.data));
        });
        this.close();
    };


    render() {
        const {options, openModal, defoultOptions, tables} = this.state;

        return (
            <Container className={"Page"}>
                {this.state.loading&&
                <Dimmer active inverted>
                    <Loader inverted>Loading</Loader>
                </Dimmer>}
                <Modal size={"mini"} open={this.state.openModal} onClose={this.close}>
                    <Modal.Header>Create New Table</Modal.Header>
                    <Modal.Actions>
                        <Form>
                            <Form.Group>
                                <Form.Input widths={12}
                                            name={"addTableName"} onChange={this.input}
                                            placeholder='Name'/>
                                <Form.Button
                                    widths={4}
                                    onClick={this.addTable}
                                    color={"green"}
                                >Create</Form.Button>
                            </Form.Group>
                        </Form>
                    </Modal.Actions>
                </Modal>


                <div>
                    <Segment.Group>
                        <Header as='h4' attached='top' block>
                            <Button.Group toggle style={{"margin-right":"30px"}}>
                            <Button icon onClick={this.save} labelPosition='left'>Save
                                <Icon name='save'/></Button>
                                <Button.Or/>
                            <Button icon onClick={this.show} labelPosition='right'>New
                                <Icon name='add circle'/></Button>
                            </Button.Group>
                             Tebles editor
                        </Header>

                        {tables.map((table, index) => {
                            var row = table.columns;
                            return <Segment color='blue' style={{"overflow-x": row.length > 2 && "scroll"}}>
                                <Label color='blue' attached='top right'>{table.name}</Label>
                                <List horizontal textAlign={"center"}
                                      verticalAlign={'middle'}
                                      style={{"width": row.length > 2 ? 500 * row.length + 2 + "px" : ""}}>
                                    {/*<ScrollMenu>*/}
                                    {row.map((column, k) => {
                                        return <List.Item>
                                            <Segment>
                                                <Label floating circular attached='top right'>{k + 1}</Label>
                                                <Form>
                                                    <Form.Field>
                                                        <Input fluid ordered
                                                               name={"name"}
                                                               value={column.name}
                                                               onChange={(e, {name, value}) => this.etitTable(index, k, name, value)}
                                                               placeholder='Name'/>
                                                    </Form.Field>
                                                    <Form.Checkbox label='По умолчанию'
                                                                   checked={column.default}
                                                                   onChange={(e, {name}) => this.etitTable(index, k, name)}
                                                                   name={"default"}/>
                                                    <Form.Select
                                                        fluid
                                                        name={"defaultValue"}
                                                        value={column.defaultValue}
                                                        options={defoultOptions}
                                                        defaultValue={"id"}
                                                        disabled={!column.default}
                                                        onChange={(e, {name, value}) => this.etitTable(index, k, name, value)}
                                                    />
                                                    <Form.Group>
                                                        <Form.Checkbox label='Разрешить редактирование' width={12}
                                                                       checked={column.edit && !column.default}
                                                                       disabled={column.default}
                                                                       onChange={(e, {name}) => this.etitTable(index, k, name)}
                                                                       name={"edit"}/>
                                                        <Button width={4} onClick={() => this.dropColumn(index, k)}
                                                                color={"red"}
                                                                icon='trash alternate outline'/>
                                                    </Form.Group>
                                                </Form>
                                            </Segment>
                                        </List.Item>
                                    })}


                                    {row.length === 0 ?
                                        <List.Item>
                                            <Segment>
                                                <Button onClick={() => this.drop(index)} width={4} size={"huge"}
                                                        color={"red"} icon='trash alternate outline'/>
                                                <Button onClick={() => this.addColumn(index)} width={4} size={"huge"}
                                                        color={"blue"} icon='add'/>
                                            </Segment>
                                        </List.Item> :
                                        <List.Item>
                                            <Segment>
                                                <Label floating circular attached='top right'>{row.length + 1}</Label>
                                                <Form>
                                                    <Form.Field>
                                                        <Input fluid ordered disabled
                                                               placeholder='Name'/>
                                                    </Form.Field>
                                                    <Form.Checkbox disabled label='По умолчанию'/>
                                                    <Form.Select
                                                        fluid
                                                        disabled
                                                    />
                                                    <Form.Group>
                                                        <Form.Checkbox label='Разрешить редактирование' disabled
                                                                       width={12}/>
                                                        <Button onClick={() => this.addColumn(index)} width={4}
                                                                color={"blue"} icon='add'/>
                                                    </Form.Group>
                                                </Form>
                                            </Segment>
                                        </List.Item>
                                    }
                                </List>
                            </Segment>
                        })
                        }

                    </Segment.Group>
                    <ConfigEdit/>
                </div>
            </Container>
        )

    }
}


