import React from 'react';
import './css/App.css';
import './css/index.css';
import 'semantic-ui-css/semantic.min.css'

import Home from "./containers/Home";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import UserPage from "./containers/UserPage";
import LoginForm from "./containers/LoginForm";
import Cookies from 'universal-cookie';
import axios from "axios";
const cookies = new Cookies();
axios.defaults.withCredentials = true;


function App() {
    var login = false;
    if (cookies.get("auth")!=="true"){
        login=true;
    }
    return (
        <BrowserRouter>
        <Switch>
            <Route exact path='/' component={login?LoginForm:Home}/>
            <Route path='/admin' component={login?LoginForm:UserPage}/>
        </Switch>
        </BrowserRouter>
    );
}

export default App;
