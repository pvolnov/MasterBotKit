import React from 'react';

import {Container, Dimmer, Loader, Menu, Table} from 'semantic-ui-react'
import axios from "axios";
import {HOST_API} from "../constants/config";
import UserTable from "../components/UserTable";
import {toast, ToastContainer} from "react-toastify";


export default class UserPage extends React.Component {
    constructor(props) {
        super(props);
        // this.store = props.store;
        // this.dispatch = props.dispatch;

        this.state = {
            rows: [],
            columns: [],
            tables: []
        }


    }

    componentDidMount() {
        var main = this;
        axios.get(HOST_API + "tables/")
            .then((resp) => {
                main.setState({tables: resp.data});
                this.setTable(resp.data[0].name, resp.data[0].id);
            }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });

    }

    setTable = (name, id) => {
        var main = this;
        axios.get(HOST_API + "tables/" ,{
            params:{
                table_id:id
            }
        }).then((resp) => {
            console.log("Table", resp.data);
            console.log(main.state.tables);
            var columns=[];
           for(let t in main.state.tables){
               if (main.state.tables[t].id===id){
                   columns=main.state.tables[t].columns;
                   break;
               }
           }

           console.log(columns);

            main.setState({columns: []});
            main.setState(
                {
                    columns: columns,
                    rows: resp.data,
                    activeItem: name,

                });
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


                <Menu pointing widths={2} secondary color={"grey"}>
                    {
                        this.state.tables.map((table, k) => {
                            return <Menu.Item
                                name={table.name}
                                active={activeItem === table.name}
                                onClick={() => this.setTable(table.name, table.id)}
                            />
                        })
                    }
                </Menu>
                {this.state.columns.length > 0 &&
                <UserTable rows={this.state.rows} columns={this.state.columns}/>
                }
            </Container>
        )

    }
}


