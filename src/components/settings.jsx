import React from 'react';

// https://mui.com/
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
// MUI Icons
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import '../style/base.scss';

export default function Settings({ state, setState }) {
    const [settingsPosition, setSettingsPosition] = React.useState(null);
    const settingsOpen = Boolean(settingsPosition);

    return (
        <div onMouseEnter={event => {
            if (!settingsOpen) {
                setSettingsPosition(event.currentTarget);
            }
        }}
            style={{ display: 'inline-block', marginRight: 120 }}>
            <button className='settings-style' onClick={event => setSettingsPosition(settingsOpen ? null : event.currentTarget)}>
                <SettingsOutlinedIcon titleAccess="Settings" sx={{ color: 'white' }} />
            </button>

            {settingsOpen ?
                <Menu
                    open={settingsOpen}
                    onClose={() => setSettingsPosition(null)}
                    anchorEl={settingsPosition}
                >
                    <MenuItem divider onClick={() => {
                        if (state.darkMode) {
                            localStorage.setItem("darkMode", false);
                            setState({ darkMode: false })
                        } else {
                            localStorage.removeItem("darkMode");
                            setState({ darkMode: true })
                        }
                    }}>
                        <Switch disableRipple checked={state.darkMode}
                            icon={!state.darkMode ? <LightModeIcon sx={{ color: 'orange' }} /> : <></>}
                            checkedIcon={state.darkMode ? <DarkModeIcon sx={{ color: 'black' }} /> : <></>} />
                        Dark mode
                    </MenuItem>

                    <MenuItem onClick={() => {
                        if (!state.saveInput) {
                            setState({ darkMode: state.darkMode, saveInput: true });
                            localStorage.removeItem("saveLastInput");
                        } else {
                            localStorage.removeItem("lastInput");
                            localStorage.setItem("saveLastInput", false);
                            setState({ darkMode: state.darkMode, saveInput: false });
                        }
                    }}>
                        <Checkbox disableRipple checked={state.saveInput} />
                        Save my input for later use
                    </MenuItem>
                </Menu>
                : <></>
            }
        </div>
    );
}
