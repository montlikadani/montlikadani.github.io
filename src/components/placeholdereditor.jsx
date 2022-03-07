import React from 'react';
import PropTypes from "prop-types";

// https://mui.com/
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export const placeholders = [
    { id: 0, variable: 'player', replacement: 'yourName' },
    { id: 1, variable: 'asd', replacement: '' }
];

export default class PlaceholderEditor extends React.Component {

    static propTypes = {
        mainstate: PropTypes.object,
        setPlEditor: PropTypes.any
    };

    constructor(props) {
        super(props);

        this.state = {
            variables: placeholders
        };
    }

    onCloseRequest = () => {
        this.props.setPlEditor(false);
    };

    render() {
        return (
            <Dialog maxWidth='lg' open={true} onClose={this.onCloseRequest} onBackdropClick={this.onCloseRequest}>
                <DialogTitle sx={{
                    m: 0, p: 2,
                    backgroundColor: this.props.mainstate.darkMode ? '#1e2527' : 'white',
                    color: this.props.mainstate.darkMode ? '#b5b5b5' : 'initial'
                }}>
                    <IconButton
                        aria-label="close"
                        onClick={this.onCloseRequest}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    Edit placeholders
                </DialogTitle>

                <DialogContent dividers sx={{
                    backgroundColor: this.props.mainstate.darkMode ? '#1e2527' : 'white',
                    color: this.props.mainstate.darkMode ? '#b5b5b5' : 'initial'
                }}>
                    <div style={{ fontWeight: 'bolder', fontSize: 20 }}>
                        Key<p style={{ paddingLeft: '50%', display: 'inline' }}>Replacement</p>
                    </div>

                    <Stack spacing={1} direction='column'>
                        {this.state.variables.map((pl, index) => <Stack key={pl.id === undefined ? index : pl.id} spacing={2} direction='row'>
                            <Input autoFocus inputProps={{ maxLength: 300, size: 50 }} sx={{ color: 'white' }}
                                endAdornment={<>%</>} startAdornment={<>%</>} defaultValue={pl.variable} />

                            <p style={{ textAlign: 'center', paddingTop: 10 }}>=</p>

                            <Input inputProps={{ maxLength: 300, size: 50 }} sx={{ color: 'white' }} defaultValue={pl.replacement} />

                            <Button disableRipple disableElevation id={pl.id === undefined ? index : pl.id}
                                color="error" size="small" variant="outlined" title="Delete variable"
                                onClick={event => {
                                    const id = parseInt(event.currentTarget.id);
                                    const arr = this.state.variables.filter(v => v.id !== id);

                                    placeholders.push(arr);
                                    this.setState({ variables: arr });
                                }}>
                                <DeleteForeverIcon />
                            </Button>
                        </Stack>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{
                    backgroundColor: this.props.mainstate.darkMode ? '#1e2527' : 'white',
                    color: this.props.mainstate.darkMode ? '#b5b5b5' : 'initial'
                }}>
                    <Button disableRipple variant="contained" disabled={this.state.variables.length >= 100} startIcon={<AddIcon />}
                        onClick={() => {
                            this.setState(_prevState => ({
                                variables: [...this.state.variables, {
                                    id: this.state.variables.length + 1, variable: '', replacement: ''
                                }]
                            }), () => {
                                placeholders.length = 0;
                                placeholders.push(this.state.variables);
                            });
                        }}>
                        Add new placeholder
                    </Button>
                </DialogActions>
            </Dialog >
        );
    }
}
