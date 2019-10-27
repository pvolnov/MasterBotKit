import React from 'react';
import axios from "axios";

import {Button, Card, Container, Dimmer, Divider, Grid, Header, Icon, Image, Loader, Popup,} from 'semantic-ui-react'
import BaseElement from "./BaseElement";
import {HOST_API} from "../constants/config";
import {toast} from "react-toastify";


export default class BotConstracter extends React.Component {

    constructor(props) {
        super(props);
        // this.store = props.store;
        // this.dispatch = props.dispatch;

        this.state = {
            actPanel: "menu",//active panel
            menuID: props.menuID,//view id
            popuot: null,
            buttons: [],
            type:props.type
        };
        this.openBtn = props.openBtn;
        console.log("type",props.type)

    }

    componentDidMount() {
        this.update();
    }

    loading=(loading)=>{
        this.setState({
            loading:loading
        })
    };


    update = () => {
        var main = this;
        main.setState({
                buttons: [],
            }
        );
        main.loading(true);
        axios.get(HOST_API + "buttons/",
            {
                params: {
                    menu_id: this.state.menuID
                }
            }).then((resp) => {
            main.loading(false);
            main.setState({
                    buttons: resp.data,
                }
            );
        }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    };

    uploadMenu = () => {
        var menu_buttons = [];
        for (var row in this.state.buttons) {
            var brow = [];
            for (var b in this.state.buttons[row]) {
                brow.push(this.state.buttons[row][b].id)
            }
            menu_buttons.push(brow);
        }
        axios.patch(HOST_API + "menus/", {
            buttons: menu_buttons,
            id: this.state.menuID

        })
            .then((resp) => {
                console.log("MENU RESP", resp.data);
            }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    };

    addButton = (index) => {
        this.state.buttons[index].push({id: 0});
        this.forceUpdate();
        this.uploadMenu();

    };
    addRow = () => {
        this.state.buttons.push([]);
        this.forceUpdate();
        this.uploadMenu();

    };

    dropRow = (index) => {
        this.state.buttons.splice(index, 1);
        this.forceUpdate();
        this.uploadMenu();

    };

    deleteBtn = (index, c) => {
        console.log(this.state.buttons[index][c]);
        var buttons=this.state.buttons;
        this.setState({buttons: []});
        setTimeout(() => {
            buttons[index].splice(c, 1);
            this.state.buttons=buttons;
            console.log(this.state.buttons);
            this.forceUpdate();
            this.uploadMenu();
        }, 1);
    };


    render() {
        let {buttons} = this.state;

        return (
            <Container>
                {this.state.loading&&
                <Dimmer active inverted>
                    <Loader inverted>Loading</Loader>
                </Dimmer>}
                <Grid columns='equal'
                      textAlign={"center"}
                      verticalAlign={'middle'}
                      centered>
                    {
                        buttons.map((row, index) => {
                            return <Grid.Row columns='equal' key={index}>
                                {row.map((button, k) =>
                                    <Grid.Column key={k}>
                                        <BaseElement onClick={() => this.openBtn(button, index, k)}
                                                     deleteBtn={() => this.deleteBtn(index, k)} button={button}/>
                                    </Grid.Column>)
                                }

                                {row.length < 5 ?
                                    <Grid.Column textAlign={"center"}>
                                        {row.length == 0 ?
                                            <Popup content='Удалить строку' trigger={
                                                <Button circular
                                                        onClick={() => this.dropRow(index)}
                                                        row={index}
                                                        color={'red'}
                                                        size={'huge'} icon={'trash alternate'}/>
                                            }/> : null}
                                        <Popup content='Добавить кнопку' trigger={
                                            <Button circular
                                                    onClick={() => this.addButton(index)}
                                                    row={index}
                                                    color={'grey'}
                                                    size={'huge'} icon={'plus'}/>
                                        }/>

                                    </Grid.Column> : null}

                            </Grid.Row>
                        })

                    }

                    {(buttons.length == 0 || buttons.length < 12 && buttons[buttons.length - 1].length > 0) ?
                        <Grid.Row textAlign={"center"}>
                            <Popup content='Добавить строку' trigger={
                                <Button circular
                                        onClick={this.addRow}
                                        color={'grey'}
                                        size={'huge'} icon={'plus'}/>
                            }/>
                        </Grid.Row> : null}
                </Grid>
            </Container>
        )

    }
}


