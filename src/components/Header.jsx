// https://mui.com/
import Stack from '@mui/material/Stack';

import GitHubIcon from '@mui/icons-material/GitHub';

import Settings from './settings';

export default function Header({ state, setState }) {
    return (
        <header>
            <a href='/' className='header-link'>
                <h1>TabList editor</h1>
            </a>

            <Stack spacing={5} direction="row" sx={{ marginLeft: 'auto' }}>
                <a style={{ color: 'white' }} href='https://github.com/montlikadani/montlikadani.github.io' target='_blank'>
                    <GitHubIcon />
                    <p style={{ fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", fontSize: 15, marginLeft: -10, marginTop: 1, marginBottom: 0 }}>Github</p>
                </a>

                <Settings state={state} setState={setState} />
            </Stack>
        </header>
    );
}
