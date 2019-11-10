import React from 'react';

import {Button, Container, Dropdown, Grid, Header, Menu, Segment} from 'semantic-ui-react'
import {toast} from 'react-toastify';
import BotConstracter from "../components/BotConstracter";
import EditorBlock from "../components/EditorBlock";
import axios from "axios";
import {HOST} from "../constants/config";


export default class BotPage extends React.Component {
    constructor(props) {
        super(props);
        this.editorBlock = React.createRef();
        this.storerage = {};
        // this.dispatch = props.dispatch;

        this.state = {
            menuFixed: false,
            overlayFixed: false,
            openModal: false,
            menuID: -1,
            type: 0,
            options: [],
            menuTypes: [
                {key: 1, value: 0, text: 'Text Menu'},
                {key: 2, value: 1, text: 'Inline Menu'},
                {key: 3, value: 2, text: 'Payment'},
            ],
            menu: [],
            menues: {},
            activeBtn: -1,
            activeItem: "bot",
            btn_coord: {}
        }


    }

    refresh = () => {
        var menuID = this.state.menuID;
        this.setState({menuID: -1});
        setTimeout(() => {
            this.update();
        }, 1);
        setTimeout(() => {
            this.changeMenu(0, {value: menuID});
        }, 1000);
    };

    update = () => {
        var main = this;
        axios.get(HOST + "menus/").then((resp) => {
            var options = [];
            for (var m in resp.data) {
                var menu = resp.data[m];
                options.push({
                    key: m,
                    text: menu.name,
                    value: menu.id,
                    type: menu.type,
                    description: main.state.menuTypes[menu.type].text,
                    label: menu.id,
                    icon: menu.type > 0 ? "clipboard outline" : "clipboard"
                });
            }
            main.setState({
                options: options
            });
            console.log("options complete", options);
            if (main.state.menuID < 1)
                main.changeMenu({}, {value: options[0].value});
            main.forceUpdate()

        }).catch((e) => {
            toast.error(e);
            toast.error(JSON.stringify(e.response));
            main.setState({
                options: []
            });
        });
    }
    ;

    componentDidMount() {
        this.update();
    }

    openBtn = (btn, row, col) => {
        var btn_coord = {x: col, y: row};
        if(!btn.id){
            btn.id=0;
        }
        this.setState({activeBtn: -1});
        setTimeout(() => this.setState({
            activeBtn: btn.id,
            btn_coord: btn_coord
        }), 1);
        // this.editorBlock.current.reload(btn);
    };

    createMenu = (e, data) => {
        var main = this;
        axios.post(HOST + "menus/", {
            "name": "No name " + main.state.options.length.toString(),
            "type": data.value,
            "buttons": [],
            "zbutton": {
                changePermit: false,
                newLevel: 0,
                saveInTable: false,
                levelPermit: false,
                constLevel: false,
                tableName: 0,
                columnName: 0,
                tableRowValue: "",
                editRow: false,
                notification: false,
                notificationText: "",
                changeGroup: false,
                response: "",
                funkParams: "",
                template: "new",
                textParsing: "None",
            } //default value
        })
            .then((resp) => {
                main.state.menuID = resp.data.id;
                main.state.options.push({
                    key: resp.data.id,
                    type: data.value,
                    value: resp.data.id,
                    text: "no name" + main.state.options.length.toString()
                });
                main.changeMenu({}, {value: resp.data.id});
                main.forceUpdate();
                toast.success("Complete");
            }).catch((e) => {
            toast.error(e.response);
        });

    };

    changeMenu = (e, data) => {
        var type;
        for (let m in this.state.options) {
            if (this.state.options[m].value === data.value) {
                console.log("find", this.state.options[m]);
                type = this.state.options[m].type;
            }
        }

        this.setState({
            menuID: -1,
            type: type
        });
        setTimeout(() => this.setState({
            menuID: data.value,
            type: type
        }), 1);
    };

    dropMenu = (e, data) => {
        var main = this;
        axios.delete(HOST + "menus/",
            {
                params: {
                    menu_id: this.state.menuID
                }
            })
            .then((resp) => {
                main.state.menuID = 0;
                main.update();
                // this.openBtn(1);
                toast.success("Drop table");
            }).catch((e) => {
            toast.error(e.response)
        });

    };


    render() {
        let {activeBtn, menuID, menu, menues, menuTypes} = this.state;

        return (
            <Container color='teal'>
                <Grid columns='equal'>
                    <Grid.Row>
                        <Grid.Column width={10}>
                            <Segment>
                                <Menu secondary widths={2}>
                                    {/*<Grid >*/}
                                    {/*<Grid.Row>*/}
                                    <Menu.Item>
                                        <Dropdown placeholder='Выбери раздел для редактирования'
                                                  search
                                                  wight
                                                  fluid
                                                  selection
                                                  value={menuID}
                                                  noResultsMessage="Раздел не найден"
                                                  onChange={this.changeMenu}
                                                  options={this.state.options}>
                                        </Dropdown>
                                    </Menu.Item>
                                    <Menu.Item width={2} position='right'>
                                        <div>
                                        <Button color={"red"} disabled={this.state.menuID === 1}
                                                onClick={this.dropMenu} icon={'trash alternate'}/>
                                    {/*</Menu.Item>*/}
                                    {/*<Menu.Item>*/}
                                        <Button icon={'redo'} onClick={this.refresh}/>
                                    {/*</Menu.Item>*/}
                                    {/*<Menu.Item>*/}
                                        <Dropdown
                                            button
                                            className='icon'
                                            labelPosition='right'
                                            floating
                                            labeled
                                            icon='add'
                                            value={""}
                                            options={menuTypes}
                                            onChange={this.createMenu}
                                            text='new menu'
                                        />
                                        </div>
                                    </Menu.Item>
                                    {/*</Grid.Row>*/}
                                    {/*</Grid>*/}
                                </Menu>
                                {menuID > -1 &&
                                <BotConstracter openBtn={this.openBtn}
                                                type={this.state.type}
                                                menuID={menuID}/>
                                }
                            </Segment>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            {(activeBtn >= 0 && menuID > -1) &&
                            <EditorBlock
                                type={this.state.type}
                                ref={this.editorBlock}
                                buttonID={this.state.activeBtn}
                                menuID={this.state.menuID}
                                btn_coord={this.state.btn_coord}
                                openBtn={this.openBtn}
                                update={this.update}/>
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        )

    }
}


