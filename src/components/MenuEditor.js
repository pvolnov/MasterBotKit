import React from 'react';

import {Button, Dimmer, Dropdown, Form, Header, Input, Loader, Modal, Segment} from 'semantic-ui-react'
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
            textParsing: "None",
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
                params: {
                    menu_id: this.state.menuID
                }
            }).then((resp) => {
            console.log(resp.data);
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
    loading = (loading) => {
        this.setState({
            loading: loading
        })
    };


    reload(btn) {
        var extend = require('util')._extend;
        this.state = extend(this.state, btn);
        this.forceUpdate();
    }

    addFile = (e) => {
        this.setState({file: e.target.files[0]});
    };

    setAddition = (e, {name, value}) => {
        this.setState({addition: value});
        this.show();
    };

    saveAddition = () => {
        var main = this;
        let formData = new FormData();
        formData.append('file', this.state.file);

        axios.post(HOST_API + "upload/", formData
            , {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((r) => {
            toast.info("Файл загружен");
            main.setState({"file_url": r.data});
            console.log(r.data);
        });
        this.close();
    };

    drop = () => {
        axios.delete(HOST_API + "buttons/",
            {
                params: {
                    button_id: this.state.buttonID
                }
            }).then((resp) => {
            toast.success(resp.data);
        }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    };

    show = () => {
        this.setState({openModal: true});
    };

    close = () => this.setState({openModal: false});


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
        })).catch(e => toast.error(e.message));
    };

    render() {
        const {
            typesOptions, btnOptions, groupsOptions, userTablesColumns, addition,changeGroup,
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
                    <Segment attached='bottom'>
                        {this.state.loading &&
                        <Dimmer active inverted>
                            <Loader inverted>Loading</Loader>
                        </Dimmer>}

                        <Modal size={"mini"} open={this.state.openModal} onClose={this.close}>
                            <Modal.Header>Сhoose File</Modal.Header>
                            <Modal.Content>
                                <Form>
                                    <Form.Group>
                                        <Form.Input onChange={this.addFile} type="file" width={11} fluid
                                                    name={"file"}/>
                                        <Form.Button
                                            widths={4}
                                            onClick={this.saveAddition}
                                            color={"green"}
                                        >Save</Form.Button>
                                    </Form.Group>
                                </Form>
                            </Modal.Content>
                        </Modal>
                        <Form>
                            <Form.Group>
                                <Form.Radio fluid name={'levelPermit'} onChange={this.change} label='Only for level'
                                            toggle checked={this.state.levelPermit} width={12}/>
                                <Form.Input
                                    width={4}
                                    fluid
                                    type={"number"}
                                    min={0}
                                    max={10}
                                    disabled={!this.state.levelPermit}
                                    name={"constLevel"}
                                    value={this.state.constLevel}
                                    onChange={this.input}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Radio fluid name={'changePermit'} onChange={this.change} label='Change user level'
                                            toggle checked={this.state.changePermit} width={12}/>
                                <Form.Input
                                    width={4}
                                    fluid
                                    type={"number"}
                                    min={0}
                                    max={10}
                                    disabled={!this.state.changePermit}
                                    name={"newLevel"}
                                    value={this.state.newLevel}
                                    onChange={this.input}
                                />
                            </Form.Group>
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
                                    options={userTablesColumns[this.state.tableName]}
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
                                               placeholder='Пользователь %NAME% добавил новый товар в %TIME%'/> : null

                            }
                            <Form.Group>
                                <Form.Radio fluid name={'changeGroup'} onChange={this.change} label='Change group'
                                            toggle checked={changeGroup} width={8}/>
                                <Form.Select
                                    width={8}
                                    fluid
                                    disabled={!this.state.changeGroup}
                                    value={this.state.newGroupId}
                                    name={"newGroupId"}
                                    options={groupsOptions}
                                    onChange={this.select}
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
                                            value='None'
                                            checked={textParsing === 'None'}
                                            onChange={this.select}
                                />
                                <Form.Radio disabled={useFunk}
                                            name={"textParsing"}
                                            label='Markdown'
                                            value='markdown'
                                            checked={textParsing === 'markdown'}
                                            onChange={this.select}
                                />
                                <Form.Radio disabled={useFunk}
                                            name={"textParsing"}
                                            label='HTML'
                                            value='HTML'
                                            checked={textParsing === 'HTML'}
                                            onChange={this.select}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Button.Group basic fluid size='large'>
                                    {
                                        ["file", "photo", "video", "microphone"].map((label) => {
                                            if (addition == label) {
                                                return (<Button name={"addition"} active secondary
                                                                value={""} icon={label} onClick={this.input}/>)
                                            } else
                                                return (<Button name={"addition"} disabled={useFunk}
                                                                value={label} icon={label} onClick={this.setAddition}/>)
                                        })
                                    }
                                </Button.Group>
                            </Form.Group>

                            <Form.Checkbox label='Не отвечать'
                                           checked={this.state.autoResponse}
                                           onChange={this.change} name={"autoResponse"}/>

                            <Form.Input name={"funkParams"} onChange={this.input} value={this.state.funkParams}
                                        placeholder='-f start menu' label={"Answer from function"}/>

                        </Form>
                    </Segment>
                </Segment.Group>
                }
            </Segment>
        )


    }
}


