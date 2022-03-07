import React from "react";
import PropTypes from "prop-types";

// https://mui.com
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';

import { Text, View } from 'react-native';

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

const bgImg = localStorage.backgroundImage;

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
    const [backgroundImage, setBackgroundImage] = React.useState(getImageFromTarget(bgImg));
    const mode = useTextArea ? "tablist mode-text-area" : "tablist mode-text-fields"

    return (
        <>
            <View style={{ display: 'inline-block', paddingTop: 15 }}>
                <Text style={{
                    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", fontSize: 20, color: state.darkMode ? '#b5b5b5' : 'black', width: '10%'
                }}>
                    Output
                </Text>

                <FormControl sx={{ float: 'inline-end', width: 200, marginRight: 9 }}>
                    <InputLabel variant="standard" htmlFor="sel-bgimg" sx={{
                        color: state.darkMode ? 'white' : 'initial',
                        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", fontSize: 20
                    }}>
                        Change background image
                    </InputLabel>
                    <NativeSelect
                        defaultValue={bgImg || "Light"}
                        inputProps={{
                            name: 'native-bgImg',
                            id: 'sel-bgimg',
                        }}
                        onChange={event => {
                            const val = event.target.value;
                            const imgSource = getImageFromTarget(val);

                            if (imgSource === lighttab) {
                                localStorage.removeItem("backgroundImage");
                            } else {
                                localStorage.setItem("backgroundImage", val);
                            }

                            setBackgroundImage(imgSource);
                        }}
                    >
                        <option value="Light">Light</option>
                        <option value="Cloudy">Cloudy</option>
                        <option value="Night">Night</option>
                        <option value="Sunset">Sunset</option>
                    </NativeSelect>
                </FormControl>
            </View>

            <div className="output-content">
                <img width={1080} height={480} src={backgroundImage} alt="tablist" />

                <div className={mode}>
                    <AppendableText inputHtml={htmlInput} />
                </div>
            </div>
        </>
    );
}
