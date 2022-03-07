import React from 'react';

// https://mui.com/
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Settings from './settings';
import PlaceholderEditor from './placeholdereditor';

export default function Header({ state, setState }) {
    const [plEditor, setPlEditor] = React.useState(false);

    return (
        <header>
            <a href='/' className='header-link'>
                <h1>TabList editor</h1>
            </a>

            <Stack spacing={2} direction="row" sx={{ marginRight: 0, marginLeft: 'auto' }}>
                <Button disableRipple disableElevation size="medium" variant="outlined" title="Open placeholder editor"
                    onClick={() => setPlEditor(true)}>
                    Placeholder editor
                </Button>

                <Settings state={state} setState={setState} />
            </Stack>

            {plEditor ? <PlaceholderEditor mainstate={state} setPlEditor={setPlEditor} /> : <></>}
        </header>
    );
}
