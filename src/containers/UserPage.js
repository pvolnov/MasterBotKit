import React from 'react';

import {Container, Dimmer, Loader, Menu, Table} from 'semantic-ui-react'
import axios from "axios";
import {HOST_API} from "../constants/config";
import UserTable from "../components/UserTable";
import {toast, ToastContainer} from "react-toastify";
import MessagesMenu from "../components/MessagesMenu";


export default class UserPage extends React.Component {
    constructor(props) {
        super(props);
        // this.store = props.store;
        // this.dispatch = props.dispatch;

        this.state = {
            rows: [],
            columns: [],
            tables: [],
            messages:true
        }


    }

    componentDidMount() {
        var main = this;
        main.loading(true);
        axios.get(HOST_API + "tables/")
            .then((resp) => {
                main.setState({tables: resp.data});
                main.loading(false);
                // this.setTable(resp.data[0].name, resp.data[0].id);
            }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });

    }

    loading = (loading) => {
        this.setState({
            loading: loading
        })
    };

    setTable = (name, id) => {
        var main = this;
        this.loading(true);
        main.setState(
            {
                activeItem: name,
                messages:false
            });
        axios.get(HOST_API + "tables/", {
            params: {
                table_id: id
            }
        }).then((resp) => {
            var columns = [];
            for (let t in main.state.tables) {
                if (main.state.tables[t].id === id) {
                    columns = main.state.tables[t].columns;
                    break;
                }
            }
            main.setState({columns: []});
            main.setState(
                {
                    columns: columns,
                    rows: resp.data,
                });
            this.loading(false);
        });

    };


    render() {
        const {activeItem} = this.state;

        return (
            <Container className={"Page"}>
                <ToastContainer
                    position="top-left"
                    autoClose={2500}
                />
                { (this.state.loading) &&
                <Dimmer active inverted>
                    <Loader inverted>Loading</Loader>
                </Dimmer>}


                <Menu pointing widths={this.state.tables.length+1} >
                    {
                        this.state.tables.map((table, k) => {
                            return <Menu.Item
                                name={table.name}
                                active={activeItem === table.name}
                                onClick={() => this.setTable(table.name, table.id)}
                            />
                        })
                    }
                    <Menu.Item
                        name={"messages"}
                        active={this.state.messages}
                        onClick={() => this.setState({messages:true})}
                    />
                </Menu>
                {(this.state.columns.length > 0 && !this.state.messages) &&
                <UserTable rows={this.state.rows} columns={this.state.columns}/>
                }
                {this.state.messages &&
                    <MessagesMenu/>
                }
            </Container>
        )

    }
}


