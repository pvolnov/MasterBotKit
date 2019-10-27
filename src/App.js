import React from 'react';
import './css/App.css';
import './css/index.css';
import 'semantic-ui-css/semantic.min.css'


import Home from "./containers/Home";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import UserPage from "./containers/UserPage";


function App() {
    return (
        <BrowserRouter>
        <Switch>
            <Route exact path='/' component={Home}/>
            <Route path='/admin' component={UserPage}/>
        </Switch>
        </BrowserRouter>
    );
}

export default App;
