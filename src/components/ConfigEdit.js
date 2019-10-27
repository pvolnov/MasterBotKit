import React from 'react';

import {Button, Form, Header, Icon, Item, Segment} from 'semantic-ui-react'
import axios from "axios";
import {HOST_API} from "../constants/config";
import {toast} from "react-toastify";


export default class ConfigEdit extends React.Component {
    constructor(props) {
        super(props);
        // this.store = props.store;
        // this.dispatch = props.dispatch;
        this.servers = [
            {key: 1, name: "EL10", discr: "Intel Xeon E3-1230v5 3.4 ГГц, 4 ядра"},
            {name: "EL10-SSD", discr: "Intel Xeon E3-1230 3.4 ГГц, 4 ядра"},
            {
                name: "AEL10-SSD", discr: "Intel Xeon E3-1230 3.4 ГГц, 4 ядра" +
                    "2 × 240 ГБ SSD" +
                    "16 ГБ DDR4" +
                    "100 $"
            },
            {
                name: "BL10-SSD", discr: "Intel Xeon E5-1650v4 3.6 ГГц, 6 ядер" +
                    "2 × 480 ГБ SSD" +
                    "64 ГБ DDR4" +
                    "215 $"
            }, {
                name: "AL10-SSD", discr: "AMD EPYC 7351P 2.4 ГГц, 16 ядер" +
                    "2 × 960 ГБ SSD + 2 × 4 ТБ SATA" +
                    "64 ГБ DDR4" +
                    "299 $"
            }, {
                name: "PL11-SSD", discr: "2 × Intel Xeon Silver 4114 2.2 ГГц, 20 ядер" +
                    "2 × 480 ГБ SSD + 2 × 4 ТБ SATA" +
                    "96 Б DDR4" +
                    "337,05 $"
            },
        ];

        this.state = {
            username: "Neafiol",
            server: 1
        }


    }

    componentDidMount() {
        var main = this;
        axios.get(HOST_API + "config/")
            .then((resp) => {
                console.log(resp.data);
                main.setState({...resp.data})
            }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    }

    save = () => {
        if(this.state.password!=this.state.password2){
            toast.error("Passwords must be similar");
            return;
        }
        axios.post(HOST_API + "config/", this.state)
            .then((resp) => {
                console.log(resp);
                toast.success(resp.data);
            }).catch((e) => {
            toast.error(JSON.stringify(e.response.data));
        });
        if(this.state.file){
            this.uploadFile();
        }
    };

    input = (e, {name, value}) => {
        console.log(value);
        this.setState({[name]: value});
    };

    buyServer = (k) => {
        this.setState({
            server: k
        });
        axios.post(HOST_API + "config/", {name: "server", "value": this.servers[k].key})
            .then((resp) => {
                toast.success("Complete");
            }).catch((e) => {
            toast.error(JSON.stringify(e.response.data));
        });
    };

    uploadFile=()=>{
        axios.post(HOST_API + "upload_file/", this.state.file, {
            headers: {
                'Content-Type': this.state.file.type
            }
        });
    };


    render() {
        const {options, value, showPas, username} = this.state;

        return (
            <Segment.Group style={{"margin-bottom": "30px"}}>
                <Header as='h4' attached='top' block>
                    Config
                </Header>
                <Segment>
                    <Form>
                        <Form.Group>
                            <Form.Input width={10} fluid label='Telegram Token'
                                        name={"ttoken"}
                                        value={this.state.ttoken}
                                        onChange={this.input}
                                        placeholder='562419797:AAExm3orWOSRgqxlqnUlHTSJmQ2SRPOZwt4'/>

                        </Form.Group>
                        <Form.Group>
                            <Form.Input onChange={this.input} width={6} fluid label='Alarmer Key'
                                        name={"alarmer_key"}
                                        value={this.state.alarmer_key}
                                        placeholder='df548f-61ac83-624ea9'/>
                            <Form.Input onChange={this.input} width={6} fluid label='Email'
                                        name={"email"}
                                        value={this.state.email}
                                        placeholder='neafiol@yandex.ru'/>
                            <Form.Input onChange={this.input} type="file" width={4} fluid
                                        name={"file"}
                                        label='Add the executable file'/>
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Input fluid label='Admin login' readOnly defaultValue={username} placeholder='Admin'/>
                            <Form.Input fluid label='Admin password'
                                        name={"password"}
                                        value={this.state.password}
                                        action={{
                                            color: 'teal',
                                            onClick: () => this.setState({showPas: !showPas}),
                                            icon: 'eye',
                                        }}
                                        onChange={this.input}
                                        type={showPas ? "text" : "password"} placeholder='Admin'/>
                            <Form.Input fluid label='Confirm password'
                                        onChange={this.input}
                                        name={"password2"}
                                        value={this.state.password2}
                                        type={showPas ? "text" : "password"} placeholder='Admin'/>
                        </Form.Group>

                        <div style={{"margin-bottom": "50px"}}>
                            <Form.Checkbox label='I agree to the Terms and Conditions'
                                           checked={this.state.udeal}
                                           onChange={()=>this.state.udeal^=1}
                                           name={"udeal"}/>
                            <Button color="green" floated='right' onClick={this.save}>Save</Button>
                        </div>
                    </Form>
                </Segment>
                <Header as='h4' attached='top' block>
                    Server
                </Header>
                <Segment>
                    <Item.Group divided>
                        {
                            this.servers.map((server, k) => {
                                return <Item>
                                    <Item.Image size='tiny'
                                                src='https://selectel.ru/assets/img/services/cloud/servers/gpu/scheme-nvidia.svg'/>
                                    <Item.Content verticalAlign='middle'>
                                        <Item.Header as='a'>{server.name}</Item.Header>
                                        <Item.Description>
                                            <p>
                                                {server.discr}
                                            </p>
                                        </Item.Description>
                                        <Item.Extra>
                                            <Button disabled={this.state.server === k} onClick={() => this.buyServer(k)}
                                                    as='div' floated='right'>
                                                Selecet
                                                <Icon name='right chevron'/>
                                                {/*<Label basic color='blue' pointing='left'>*/}
                                                {/*2,048*/}
                                                {/*</Label>*/}
                                            </Button>
                                        </Item.Extra>
                                    </Item.Content>

                                </Item>
                            })
                        }
                    </Item.Group>
                </Segment>

            </Segment.Group>
        )

    }
}


