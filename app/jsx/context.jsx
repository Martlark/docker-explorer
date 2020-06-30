import React, {useContext, useEffect} from "react";
import $ from "jquery";

export const ErrorMessage = ({message}) => {
    if (!message) {
        return null;
    }
    return (<h3 className={"alert alert-warning"}>{message}</h3>)
}

export const Message = ({message}) => {
    const context = useContext(AppContext);
    useEffect(() => {
        if( message)
            setTimeout(() => context.setMessage(null), 5000);
    })
    return (message && <h3 className={"alert alert-info"}>{message}</h3>)
}

export class ApiService {
    constructor(props) {
        this.csrf = $("input[name=base-csrf_token]").val();
        this.prefix_api = `/api`;
        this.prefix_command = `/command`;
    }

    container(id, name) {
        return this.proxyGet(`/container/${id}/get`, {name})
    }

    json(url, params) {
        return $.getJSON(this.prefix_api + url, params)
    }

    post(url, data) {
        data.csrf = this.csrf;
        return $.post(this.prefix_api, data);
    }

    command(method = 'GET', data = {}) {
        const url = '/command'
        switch (method) {
            case "POST":
                data.csrf_token = this.csrf;
                return $.post(url, data);
            case "PUT":
                data.csrf_token = this.csrf;
                return $.put(url, data);
            case "DELETE":
                return $.ajax({
                    url: `${url}/${data}`,
                    type: 'DELETE',
                    data: {csrf_token: this.csrf}
                });
        }
        return $.getJSON(url, data);
    }

    proxyGet(url, params) {
        return $.getJSON('/proxy' + url, params)
    }

    proxyPost(url, data) {
        data.csrf_token = this.csrf;
        return $.post('/proxy' + url, data);
    }

    projects(server_id) {
        return this.proxyGet(`/projects/${server_id}`
        ).then(result => {
                return result.map(data => {
                    data.server_id = server_id;
                    return data
                });
            }
        );
    }
}

// https://www.robinwieruch.de/react-function-component
// https://www.taniarascia.com/using-context-api-in-react/
export const AppContext = React.createContext({});
