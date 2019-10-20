import React from 'react';

import {
    Button,
    Card,
    Container,
    Divider,
    Grid,
    Header,
    Icon,
    Image,
    Input,
    Menu,
    Popup,
    Segment,
    Form, Radio
} from 'semantic-ui-react'
import BaseElement from "./BaseElement";
import axios from "axios";
import {HOST_API} from "../constants/config";
import {toast} from "react-toastify";


export default class MenuEditor extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            btnOptions: [
                {key: '1', value: 'new', text: 'New', icon: 'add circle'},
                {key: '2', value: '1', text: 'Главное меню',},
                {key: '3', value: '22', text: 'Товар'}
            ],
            userTables: [
                {key: '2', value: '1', text: 'Покупки',},
                {key: '3', value: '22', text: 'Товар'}
            ],
            userTablesColumns: [
                {key: '2', value: '1', text: 'Главное меню',},
                {key: '3', value: '22', text: 'Товар'}
            ],
            groupsOptions: [
                {key: '1', value: '1', text: 'Главное меню',},
                {key: '2', value: '3', text: 'Магазин товаров'}
            ],
            typesOptions: [
                {key: 1, value: 'text', text: 'Text',},
                {key: 2, value: 'photo', text: 'Photo'},
                {key: 3, value: 'video', text: 'Video'},
                {key: 4, value: 'file', text: 'File'},
            ],
            textParsing: "no",
            activeItem: 'Menu',
            name: "Menu",
            menuID: props.menuID,
        };
        this.zbutton = {};

    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        if (nextProps.menuID !== nextState.id) {
            this.state.menuID = nextProps.menuID;
            this.update();
        }
    }

    componentDidMount() {
        this.update();
    }

    update = () => {
        var main = this;
        axios.get(HOST_API + "menus/",
            {
                params:{
                    menu_id:this.state.menuID
                }
            }).then((resp) => {
            main.setState({
                    ...resp.data,
                    ...resp.data.zbutton
                }
            );
            main.zbutton = resp.data.zbutton;

        }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    };


    changeTemplate = (e, {name, value}) => {
        this.setState({[name]: value});
    };

    select = (e, {name, value}) => {
        this.setState({[name]: value});
        this.zbutton[name] = value;
    };

    input = (e, {name, value}) => {
        this.setState({[name]: value});
        this.zbutton[name] = value;
    };

    change = (e, {name}) => {
        this.setState({[name]: this.state[name] ^ 1});
        this.zbutton[name] ^= 1;
    };

    save = () => {
        console.log("SAVE");
        axios.patch(HOST_API + "menus/", {
            zbutton: this.zbutton,
            name: this.state.name,
            id: this.state.menuID
        }).then((resp => {
            toast.success(resp.data);
        })).catch(e=>toast.error(e.message));
    };

    render() {
        const {
            typesOptions, btnOptions, groupsOptions, userTablesColumns, addition,
            textParsing, createNew, userTables, notification, saveInTable, funkParamsEnable
        } = this.state;
        let newButton = (this.state.template == "new");
        let useFunk = this.state.funkParams != null && this.state.funkParams != "";

        return (
            <Segment attached='bottom'>
                <Segment.Group>
                    <Header as='h4' attached='top' block>
                        Menu Setting
                    </Header>
                    <Segment>
                        <Form>
                            <Form.Group widths='equal'>
                                <Form.Input fluid label='Menu name'
                                            value={this.state.name}
                                            name={"name"} onChange={this.input}
                                            placeholder='Menu'/>
                                <Form.Input
                                    fluid
                                    name={"type"}
                                    value={this.state.type}
                                    label='Menu Type'
                                    disabled
                                />
                            </Form.Group>
                        </Form>
                    </Segment>
                </Segment.Group>
                {(this.state.type === 0) &&
                <Segment.Group>
                    <Header as='h4' attached='top' block>
                        Defaul Responce
                    </Header>
                    <Segment>
                        <Form>
                            <Form.Select
                                fluid
                                label={"Response Type"}
                                name={"responseType"}
                                value={this.state.responseType}
                                options={typesOptions}
                                onChange={this.select}
                            />
                            <Form.Group>
                                <Form.Radio fluid name={'saveInTable'} onChange={this.change} label='Save in table'
                                            toggle checked={this.state.saveInTable} width={6}/>
                                <Form.Select
                                    width={5}
                                    fluid
                                    disabled={!saveInTable}
                                    name={"tableName"}
                                    value={this.state.tableName}
                                    options={userTables}
                                    onChange={this.select}
                                />
                                <Form.Select
                                    width={5}
                                    fluid
                                    disabled={!saveInTable}
                                    name={"columnName"}
                                    options={userTablesColumns}
                                    value={this.state.columnName}
                                    onChange={this.select}
                                />
                            </Form.Group>
                            {saveInTable ?
                                <Form.Field>
                                    <Form.Input
                                        name={"tableRowValue"}
                                        value={this.state.tableRowValue}
                                        label={"data for saving"}
                                        onChange={this.input}
                                    />
                                    <Form.Checkbox label='Добавить к последней записи этого пользователя'
                                                   checked={this.state.editRow}
                                                   onChange={this.change} name={"editRow"}/>
                                </Form.Field> : null
                            }
                            <Form.Group>
                                <Form.Radio fluid name={'notification'} onChange={this.change} label='Notification'
                                            toggle checked={this.state.notification} width={6}/>

                            </Form.Group>
                            {notification ?
                                <Form.TextArea label='Notification text'
                                               name={"notificationText"}
                                               onChange={this.input}
                                               value={this.state.notificationText}
                                               placeholder='Пользователь %USER% добавил новый товар'/> : null

                            }
                            <Form.Group>
                                <Form.Radio fluid name={'changeGroup'} onChange={this.change} label='Change group'
                                            toggle checked={this.state.changeGroup} width={8}/>
                                <Form.Select
                                    width={8}
                                    fluid
                                    disabled={!this.state.changeGroup}
                                    name={"newGroupId"}
                                    options={groupsOptions}
                                    onChange={this.change}
                                />
                            </Form.Group>
                            <Form.TextArea disabled={useFunk} label='Response'
                                           name={"response"}
                                           value={this.state.response}
                                           onChange={this.input}
                                           placeholder='С вами скоро свяжется оператор'/>
                            <Form.Group inline widths={"4"}>
                                <label>Parse Mode:</label>
                                <Form.Radio disabled={useFunk}
                                            name={"textParsing"}
                                            label='None'
                                            value='no'
                                            checked={textParsing === 'no'}
                                            onChange={this.select}
                                />
                                <Form.Radio disabled={useFunk}
                                            name={"textParsing"}
                                            label='Markup'
                                            value='markup'
                                            checked={textParsing === 'markup'}
                                            onChange={this.select}
                                />
                                <Form.Radio disabled={useFunk}
                                            name={"textParsing"}
                                            label='HTML'
                                            value='html'
                                            checked={textParsing === 'html'}
                                            onChange={this.select}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Button.Group basic fluid size='large'>
                                    {
                                        ["file", "photo", "video", "microphone"].map((label) => {
                                            if (addition == label) {
                                                return (<Button name={"addition"} active basic color={'gray'}
                                                                value={label} icon={label} onClick={this.change}/>)
                                            } else
                                                return (<Button name={"addition"} disabled={useFunk}
                                                                value={label} icon={label} onClick={this.change}/>)
                                        })
                                    }
                                </Button.Group>
                            </Form.Group>

                            <Form.Input name={"funkParams"} onChange={this.input}
                                        placeholder='-f start %TEXT%' label={"Answer from function"}/>


                        </Form>
                    </Segment>
                </Segment.Group>
                }
            </Segment>
        )


    }
}


