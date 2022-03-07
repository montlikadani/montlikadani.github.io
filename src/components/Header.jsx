import React from 'react';

// https://mui.com/
import Stack from '@mui/material/Stack';

import Settings from './settings';

export default function Header({ state, setState }) {
    return (
        <header>
            <a href='/' className='header-link'>
                <h1>TabList editor</h1>
            </a>

            <Stack spacing={2} direction="row" sx={{ marginRight: 0, marginLeft: 'auto' }}>
                <Settings state={state} setState={setState} />
            </Stack>
        </header>
    );
}
