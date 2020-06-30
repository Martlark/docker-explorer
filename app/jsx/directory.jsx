import React, {Component} from 'react'
import join from 'join-path'
import BootstrapInput from "bootstrap-input-react";
import {AppContext} from "./context";

class DirectoryEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props.entry,
            message: '',
            selected: false,
        };
    }

    clickDirectory = (evt, fileName) => {
        evt.preventDefault();
        this.props.parentChangeDirectory(fileName);
    }

    renderFilename() {
        if (this.state.dir_type === 'd') {
            return (<a href={"#"}
                       onClick={evt => this.clickDirectory(evt, this.state.file_name)}>{this.state.file_name}</a>)
        }
        return this.state.file_name;
    }

    checkboxOnChange = (event) => {
        this.props.selectEntry(this.state.file_name, event.target.checked);
    }

    renderSelectionMode() {
        if (this.state.dir_type !== 'd') {
            return (<>
                <td><BootstrapInput type="checkbox" name="selected" onChange={this.checkboxOnChange} parent={this}
                /></td>
                <td>{this.state.modes}</td>
            </>)
        } else {
            return <>
                <td> </td>
                <td>{this.state.modes}</td>
            </>
        }
    }

    render() {
        return (
            <tr>
                {this.renderSelectionMode()}
                <td>{this.state.size}</td>
                <td>{this.state.modified}</td>
                <td>{this.renderFilename()}</td>
                <td>{this.state.linked_file_name}</td>
            </tr>
        )
    }
}

export default class Directory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pwd: props.pwd,
            id: props.id,
            name: props.name,
            updateState: props.updateState,
            directoryPath: '',
            directoryParent: '..',
            directoryEntries: [],
        }
    }

    static contextType = AppContext;

    componentDidMount() {
        this.getDirectory(this.state.pwd);
    }

    clickUpDirectory = (evt) => {
        this.getDirectory(join(this.state.pwd, '..'));
    }

    clickDirectory = (evt, dir = '/') => {
        this.getDirectory(dir);
    }

    clickDeleteSelected = (evt) => {
        this.setState({directoryGetting: true})

        const selected = this.state.directoryEntries.filter(dir => dir.selected);

        return this.context.api.proxyPost(`/container/${this.state.id}/exec_run`, {
                name: this.state.name,
                cmd: `(cd ${this.state.directoryPath} && rm ${selected.map(dir => '"' + dir.file_name + '"').join(' ')})`,
            }
        ).then(result => {
                this.context.setMessage(result);
                return this.getDirectory(this.state.pwd);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error: ${textStatus} - ${errorThrown}`)
        ).always(() => this.setState({directoryGetting: false})
        )
    }

    /***
     * download_container_file any selected that are not directories.  they will download_container_file as tar
     * @param evt
     */
    clickDownloadSelected = (evt) => {
        const selected = this.state.directoryEntries.filter(dir => dir.selected && dir.dir_type !== 'd');
        selected.forEach(dir => {
            const filename = join(this.state.directoryPath, dir.linked_file_name || dir.file_name)
            return this.context.api.proxyPost(`/container/${this.state.id}/download`, {
                    name: this.state.name,
                    filename,
                }
            ).then((result, textStatus, request) => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(new Blob([result]));
                    a.download = dir.file_name;
                    a.click();
                }
            ).fail((xhr, textStatus, errorThrown) =>
                this.context.setErrorMessage(`Error: ${textStatus} - ${errorThrown}`)
            )
        });
    }

    /***
     * download_container_file any selected that are not directories.  they will download_container_file as tar
     * @param evt
     */
    clickEditSelected = (evt) => {
        const selected = this.state.directoryEntries.filter(dir => dir.selected && dir.dir_type !== 'd');
        selected.forEach(dir => {
            const fileName = join(this.state.directoryPath, dir.linked_file_name || dir.file_name);
            const encodedFileName = encodeURIComponent(fileName)
            window.open(`/server/${this.state.id}/container_file_edit/${this.state.name}?filename=${encodedFileName}`, "_blank")
        });
    }

    changeDirectory = (directoryName) => {
        const pwd = join(this.state.directoryPath, directoryName);
        this.getDirectory(pwd);
    }

    getDirectory(pwd) {
        this.setState({directoryGetting: true})
        return this.context.api.proxyGet(`/container/${this.state.id}/ls`, {name: this.state.name, pwd: pwd}
        ).then(result =>
            this.setState({
                pwd: result.pwd,
                directoryPath: result.path,
                directoryParent: result.parent,
                directoryTotal: result.total,
                directoryEntries: result.entries,
            })
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error: ${textStatus} - ${errorThrown}`)
        ).always(() => this.setState({directoryGetting: false})
        )
    }

    renderActions() {
        if (!this.state.directoryPath) {
            return <h3>No directory found</h3>
        }

        const upButton = (this.state.directoryPath !== '/') ?
            <a href={"#"} className={"btn"} onClick={evt => this.clickUpDirectory(evt)}
               title={"Up one level of directory"}><span
                className="material-icons">reply</span></a> : null;
        const deleteButton = <a href={"#"} className={"btn"} onClick={evt => this.clickDeleteSelected(evt)}
                                title={"Remove selected files"}><span
            className="material-icons">delete</span></a>;
        const downloadButton = <a href={"#"} className={"btn"} onClick={evt => this.clickDownloadSelected(evt)}
                                  title={"Download selected files"}><span
            className="material-icons">arrow_downward</span></a>;
        const editButton = <a href={"#"} className={"btn"} onClick={evt => this.clickEditSelected(evt)}
                              title={"Edit selected files"}><span
            className="material-icons">edit</span></a>;
        const refreshButton = <a href={"#"} className={"btn"} onClick={evt => this.clickDirectory(evt, this.state.pwd)}
                                 title={"Refresh"}><span
            className="material-icons">cached</span></a>;
        const getting = this.state.directoryGetting ? <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
        </div> : null;
        let cwd = '/';
        const directoryLinks = [];
        this.state.directoryPath.split('/').forEach((dir, index) => {
            if (index === 0 || dir.length) {
                cwd = join(cwd, dir);
                let thisCwd = cwd.toString();
                directoryLinks.push({cwd: cwd, dir: dir});
            }
        });

        return (
            <div>
                {refreshButton}
                {downloadButton}
                {editButton}
                {deleteButton}
                {upButton}
                {directoryLinks.map(d =>
                    <a href={"#"} onClick={(evt) => this.clickDirectory(evt, d.cwd)}
                       title={d.cwd}>{d.dir}&nbsp;/&nbsp;</a>
                )}
                {getting}
            </div>
        );
    }

    selectEntry = (fileName, state) => {
        let data = this.state.directoryEntries;
        data.some(entry => {
            if (entry.file_name === fileName) {
                entry.selected = state;
                return true;
            }
        })
        this.setState({directoryEntries: data})
    };

    render() {
        return (
            <div>
                {this.renderActions()}

                <table className={"table"}>
                    <thead>
                    <tr>
                        <th>&nbsp;</th>
                        <th>Modes</th>
                        <th>Size</th>
                        <th>Modified</th>
                        <th>Name</th>
                        <th>link</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.directoryEntries.map(entry => <DirectoryEntry entry={entry}
                                                                              key={entry.file_name}
                                                                              parentChangeDirectory={this.changeDirectory}
                                                                              selectEntry={this.selectEntry}/>)}
                    </tbody>
                </table>
            </div>
        )
    }
}
