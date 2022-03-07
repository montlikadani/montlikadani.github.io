import React from "react";

import Header from './components/Header';
import ComponentCreator from './components/componentcreator';
import './style/base.scss';

export default class TLRoot extends React.Component {

    constructor() {
        super();

        if (typeof (Storage) === "undefined") {
            throw new Error("No Web Storage support");
        }

        document.title = "TL - Online editor";

        this.setState = this.setState.bind(this);

        this.state = {
            darkMode: localStorage.darkMode === undefined ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
            saveInput: localStorage.saveLastInput === undefined,
        };
    }

    render() {
        document.body.style.backgroundColor = this.state.darkMode ? '#1e2527' : 'white';

        return (
            <>
                <Header state={this.state} setState={this.setState} />

                <ComponentCreator state={this.state} />
            </>
        );
    }
}
