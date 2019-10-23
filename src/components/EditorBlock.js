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
import MenuEditor from "./MenuEditor"
import ButtonEdit from "./ButtonEdit";


export default class EditorBlock extends React.Component {


    constructor(props) {
        super(props);
        this.buttonRef = React.createRef();
        this.menuRef = React.createRef();
        this.update = props.update;
        this.openBtn = props.openBtn;
        this.storerage = props.storerage;

        this.state = {
            textParsing: "no",
            activeItem: 'Button',
            label: "Menu",
            template: "new",
            buttonID: props.buttonID,
            menuID: props.menuID,
            type: props.type,
            menu: props.menu,
            btn_coord: props.btn_coord
        };

    }

    handleItemClick = (e, {name}) => {
        this.state.menuID = this.props.menuID;
        this.setState({activeItem: name});
    };

    save = () => {
        if (this.state.activeItem === 'Button')
            this.buttonRef.current.save(this.state.btn_coord);
        else
            this.menuRef.current.save();
        // this.update();
    };

    delete = () => {
        if (this.state.activeItem === 'Button')
            this.buttonRef.current.drop();
        else
            this.menuRef.current.drop();

        this.update();
        this.openBtn(1);
    };

    render() {
        const {
            activeItem, buttonID, menuID,type
        } = this.state;

        return (
            <Container>
                <Menu attached='top' tabular>
                    <Menu.Item
                        name='Button'
                        active={activeItem === 'Button'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name='Menu'
                        active={activeItem === 'Menu'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button.Group>
                                <Button animated='vertical' onClick={this.save}>
                                    <Button.Content hidden>Save</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='save outline'/>
                                    </Button.Content>
                                </Button>
                                <Button animated='vertical' onClick={this.delete} >
                                    <Button.Content hidden>Delete</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='trash'/>
                                    </Button.Content>
                                </Button>
                            </Button.Group>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                {
                    (activeItem === 'Button') &&
                    <ButtonEdit ref={this.buttonRef} type={type} buttonID={buttonID} menuID={menuID}/>
                }
                {
                    (activeItem === 'Menu') &&
                    <MenuEditor ref={this.menuRef} type={type} menuID={menuID}/>
                }
            </Container>
        )

    }
}


