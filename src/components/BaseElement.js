import React from 'react';

import {Button, Card, Container, Divider, Grid, Header, Icon, Image} from 'semantic-ui-react'
import TelegramIco from '../img/telegram.png'


export default class BaseElement extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = props.onClick;
        this.deleteBtn = props.deleteBtn;
        // this.store = props.store;
        // this.dispatch = props.dispatch;

        this.state = {
            name: "New Button",
            cmd: "Не выбрано",
            discr: "Discription",
            id: 0,
            ...this.props.button
        };
        this.deliting=false;


    }

    click=()=>{
        if (!this.deliting){
            this.onClick();
        }
    };

    render() {

        return (
            <Card onClick={this.click}>
                <Card.Content >
                    {/*<Image*/}
                    {/*floated='right'*/}
                    {/*size='mini'*/}
                    {/*rounded*/}
                    {/*src={TelegramIco}*/}
                    {/*/>*/}
                    <Card.Header>{this.state.name}</Card.Header>
                    <Card.Meta>{this.state.cmd}</Card.Meta>
                    {/*<Card.Description>*/}
                    {/*{this.state.discr}*/}
                    {/*</Card.Description>*/}
                </Card.Content>
                <Card.Content extra>
                    <div className='ui two buttons'>
                        <Button basic color='red' onClick={()=>{
                            this.deliting=true;
                            this.deleteBtn();
                        }}>
                            Delete
                        </Button>
                    </div>
                </Card.Content>
            </Card>
        )

    }
}


