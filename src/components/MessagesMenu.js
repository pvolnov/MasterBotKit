import React from 'react';

import {
    Button,
    Checkbox,
    Comment,
    Dimmer, Dropdown, Feed,
    Form,
    Header,
    Icon,
    Input,
    Loader,
    Modal,
    Table,
    TextArea
} from 'semantic-ui-react'
import axios from "axios";
import {HOST} from "../constants/config";
import {toast} from "react-toastify";
import IconMBK from "../img/telegram.png"
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";

export default class MessagesMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: props.columns,
            rows: props.rows,
            usersOptions: [],
            messages: [],
            user_id: 0,
            textParsing:"None"
        };
        this.rows_ids = [];
    }

    componentDidMount() {
        var main = this;
        main.loading(true);
        axios.get(HOST + "users/", {
            params: {
                all_user: true
            }
        })
            .then((resp) => {
                console.log(resp.data);
                var usersOptions = [];
                for (var d in resp.data) {
                    usersOptions.push({
                        image: resp.data[d].avatar,
                        text: resp.data[d].name,
                        value: resp.data[d].id,
                        key: d
                    })
                }
                main.setState({usersOptions: usersOptions});
                main.state.user_id = resp.data[0].id;
                main.changeUser();
                main.loading(false);
            }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    }


    input = (e, {name, value}) => {
        this.setState({[name]: value});
        if (name === "user_id") {
            this.state.user_id = value;
            this.changeUser();
        }
    };

    select = (e, {name, value}) => {
        this.setState({[name]: value});
    };

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

        axios.post(HOST + "upload/", formData
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

    change = (e, {name}) => {
        this.setState({[name]: this.state[name] ^ 1});
    };

    show = () => {
        this.setState({openModal: true});
    };

    close = () => this.setState({openModal: false});

    changeUser = () => {
        var main = this;
        main.loading(true);
        axios.get(HOST + "users/", {
            params: {
                message_from_user: this.state.user_id
            }
        })
            .then((resp) => {
                console.log(resp.data);
                main.setState({
                    messages:resp.data
                });
                main.loading(false);
            }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    };


    distribution = () => {
        axios.post(HOST + "api/", {
            type: "send_message_to_user",
            user_id: this.state.user_id,
            message: this.state.response,
            textParsing:this.state.textParsing,
            addition:this.state.addition,
            file:this.state.file,
        }).then((r) => toast.success(r.data)).catch((e) => toast.error(e.message));
        this.close()
    };


    loading = (loading) => {
        this.setState({
            loading: loading
        })
    };

    render() {
        const {
            textParsing
        } = this.state;

        return (

            <Feed>
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
                {(this.state.loading) &&
                <Dimmer active inverted>
                    <Loader inverted>Loading</Loader>
                </Dimmer>}

                <Header as='h4' dividing>
                    <Dropdown
                        placeholder='Ivan Ivanov'
                        // fluid
                        // selection
                        name={"user_id"}
                        onChange={this.input}
                        options={this.state.usersOptions}
                    />
                </Header>


                {
                    this.state.messages.map((message, index) => {
                        var extraText = message.text;
                        if(Math.abs(message.type)>2){
                            extraText=<a href={message.info.url}>{extraText}</a>
                        }
                        return <Feed.Event
                            extraText={extraText}
                            image={message.type>0?message.avatar:IconMBK}
                            summary={message.type>0?message.name:"Bot"}
                            date={message.date}
                        />
                    })
                }
                {this.state.messages.length > 0 &&
                <Form reply style={{width: "35%"}}>
                    <Form.TextArea label='Response'
                                   name={"response"}
                                   value={this.state.response}
                                   onChange={this.input}
                                   placeholder='С вами скоро свяжется оператор'/>
                    <Form.Group inline widths={"4"}>
                        <label>Parse Mode:</label>
                        <Form.Radio
                            name={"textParsing"}
                            label='None'
                            value='None'
                            checked={textParsing === 'None'}
                            onChange={this.select}
                        />
                        <Form.Radio
                            name={"textParsing"}
                            label='Markdown'
                            value='markdown'
                            checked={textParsing === 'markdown'}
                            onChange={this.select}
                        />
                        <Form.Radio
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
                                    if (this.state.addition == label) {
                                        return (<Button name={"addition"} active secondary
                                                        value={""} icon={label} onClick={this.input}/>)
                                    } else
                                        return (<Button name={"addition"}
                                                        value={label} icon={label} onClick={this.setAddition}/>)
                                })
                            }
                        </Button.Group>
                    </Form.Group>
                    <Grid>
                        <Grid.Column width={11}>
                        </Grid.Column>
                        <Grid.Column width={4}>
                            <Button content='Send' onClick={this.distribution} labelPosition='left' icon='send'
                                    primary/>
                        </Grid.Column>
                    </Grid>
                </Form>
                }


            </Feed>
        )

    }
}


