import React from 'react'
import {Button, Form, Grid, Header, Image, Message, Segment} from 'semantic-ui-react'
import axios from "axios";
import {HOST_API} from "../constants/config";
import {toast, ToastContainer} from "react-toastify";
import Cookies from 'universal-cookie';
const cookies = new Cookies();


export default class LoginForm extends React.Component {
    constructor(props) {
        super(props);
    }

    input = (e, {name, value}) => {
        this.setState({[name]: value});
    };

    auth=()=>{
        console.log("3333");
        axios.get(HOST_API + "api/",{
            params:{
                password:this.state.password
            },
        })
            .then((resp) => {
                console.log(resp.data);
                if(resp.data!="error"){
                    cookies.set("session",resp.data);
                    cookies.set("auth",true);
                    window.location.reload();
                }
                else {
                    toast.error("Password is not correct");
                }
            }).catch((e) => {
            console.log(e);
            console.log(e.data);
            console.log(e.message);
        });
    };


    render() {
        return <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>

            <Grid.Column style={{maxWidth: 450}}>
                <Header as='h2' color='teal' textAlign='center'>
                    Log-in to your account
                </Header>
                <Form size='large'>
                    <Segment stacked>
                        <Form.Input fluid icon='user'
                                    iconPosition='left'
                                    name={"login"}
                                    onChange={this.input}
                                    placeholder='Login'/>
                        <Form.Input
                            fluid
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                            name={"password"}
                            onChange={this.input}
                        />

                        <Button color='teal' fluid size='large' onClick={this.auth}>
                            Login
                        </Button>
                        <ToastContainer
                            position="top-left"
                            autoClose={2500}
                        />
                    </Segment>
                </Form>
            </Grid.Column>
        </Grid>
    }
}