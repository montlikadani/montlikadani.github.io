import React from "react";
import PropTypes from "prop-types";

// https://mui.com
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';

import { Text } from 'react-native';

import '../style/output.scss';
import '../style/mcmotdstyle.scss';
import night from '../img/night.png';
import cloudy from '../img/cloudy.jpg';
import lighttab from '../img/lighttab.jpg';
import sunset from '../img/sunset.png';

class AppendableText extends React.Component {

    static propTypes = {
        inputHtml: PropTypes.string
    };

    render() {
        return (
            <div dangerouslySetInnerHTML={{ __html: this.props.inputHtml }} />
        );
    }
}

const getImageFromTarget = (target) => {
    switch (target) {
        case "Light":
            return lighttab;
        case "Cloudy":
            return cloudy;
        case "Night":
            return night;
        case "Sunset":
            return sunset;
        default:
            return lighttab;
    }
};

export default function ComponentWriter({ state, useTextArea, htmlInput }) {
    const [backgroundImage, setBackgroundImage] = React.useState(getImageFromTarget(localStorage.backgroundImage));

    return (
        <>
            <div style={{ display: 'inline-block', paddingTop: 5 }}>
                <Text style={{
                    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", fontSize: 20, color: state.darkMode ? '#b5b5b5' : 'initial'
                }}>
                    Output
                </Text>

                <FormControl sx={{ float: 'inline-end', width: 200, marginRight: 8 }}>
                    <InputLabel variant="standard" htmlFor="sel-bgimg" sx={{
                        color: state.darkMode ? '#b5b5b5' : 'initial',
                        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", fontSize: 20
                    }}>
                        Change background image
                    </InputLabel>
                    <NativeSelect
                        defaultValue={localStorage.backgroundImage || "Light"}
                        inputProps={{
                            id: 'sel-bgimg'
                        }}
                        onChange={event => {
                            const val = event.target.value;

                            if (val === localStorage.backgroundImage) {
                                return;
                            }

                            const imgSource = getImageFromTarget(val);

                            if (imgSource === lighttab) {
                                localStorage.removeItem("backgroundImage");
                            } else {
                                localStorage.setItem("backgroundImage", val);
                            }

                            setBackgroundImage(imgSource);
                        }}
                    >
                        <option>Light</option>
                        <option>Cloudy</option>
                        <option>Night</option>
                        <option>Sunset</option>
                    </NativeSelect>
                </FormControl>
            </div>

            <div className="output-content">
                <img width={1080} height={480} src={backgroundImage} alt="tablist" />

                <div className={useTextArea ? "tablist mode-text-area" : "tablist mode-text-fields"}>
                    <AppendableText inputHtml={htmlInput} />
                </div>
            </div>
        </>
    );
}
