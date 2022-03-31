import React from "react";

// https://mui.com
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ClearIcon from '@mui/icons-material/Clear';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// https://github.com/jaames/iro.js
import iro from '@jaames/iro';

// https://github.com/nailujx86/mcmotdparser
//import mcmotdparser from 'mcmotdparser';
import { toHtml } from '../js/motdparsernode';

// https://github.com/nodeca/js-yaml
import yaml from 'js-yaml';

import { Text, View } from 'react-native';
import ComponentWriter from './componentWriter';

let activeTextFieldElement = null;
let storedTextAreaValue = "";
let lastHexColor = [];
let colorPickerOpen = null;

// Listens to click events to close the color picker
// todo Need better impl
window.onclick = event => {

    // path, svg - the small icon on the button
    // DIV - the picker area (but can be any other div)

    const targetId = event.target.id;
    const tagName = event.target.tagName;

    if (colorPickerOpen && targetId !== 'cp' && targetId !== 'pick-color-btn' && tagName !== 'path'
        && tagName !== 'svg' && tagName !== 'DIV' || targetId === 'root') {
        const cp = document.getElementById("color-picker");

        if (cp) {
            document.getElementById("cp").removeChild(cp);
        }

        colorPickerOpen = null;
    }
};

export default function ComponentCreator({ state }) {
    const [useTextArea, setUseTextArea] = React.useState(localStorage.useTextArea === undefined);
    const [textFields, setTextFields] = React.useState([]);
    const [textFieldOptions, setTextFieldOptions] = React.useState(null);

    let [newContent, setNewContent] = React.useState("");
    let [htmlInput, setHtmlInput] = React.useState("");

    const [textAreaButtonDisabled, setTextAreaButtonDisabled] = React.useState(localStorage.lastInput === undefined);

    // Callback function used to load last content from local storage when
    // useTextArea changed
    React.useEffect(() => {
        activeTextFieldElement = null;

        const li = localStorage.lastInput;

        if (!li) {
            return;
        }

        storedTextAreaValue = "";

        if (useTextArea) {
            try {
                // Try to convert from json if possible
                const json = JSON.parse(li);

                for (let i = 0; i < json.length; i++) {
                    storedTextAreaValue += json[i].value.replace(/%;;%/g, '\n') + (i + 1 < json.length ? '\n' : "");
                }
            } catch (error) {
            }

            if (storedTextAreaValue.length === 0) { // If the conversation fails we uses the cached input
                storedTextAreaValue = li.replace(/%;;%/g, '\n');
            }

            if (state.saveInput) {
                newContent = storedTextAreaValue;
            }

            document.getElementById("textarea").value = newContent;
        } else if (textFields.length === 0) {
            try {
                // Try with parsing json
                setTextFields(JSON.parse(li));
            } catch (error) { // Append new lines by splitting %;;% characters
                const split = li.split("%;;%");

                if (split.length !== 0) {
                    for (let i = 0; i < split.length; i++) {
                        split[i] = { value: split[i], id: i };
                    }

                    setTextFields(split);
                } else {
                    setTextFields([{ value: li, id: 0 }]);
                }
            }
        }
    }, [useTextArea]);

    // Callback function for textFields when changed
    React.useEffect(() => {
        if (useTextArea) {
            return;
        }

        // Re-render if textFields was cleared
        if (textFields.length === 0) {
            setNewContent("");
            return;
        }

        // Stringify textFields into json and save to storage
        if (state.saveInput) {
            if (localStorage.lastInput === undefined) {
                localStorage.setItem("lastInput", JSON.stringify(textFields))
            } else {
                localStorage.lastInput = JSON.stringify(textFields);
            }
        }

        // Append all textFields in plain text and re-render
        let newCont = "";

        for (let i = 0; i < textFields.length; i++) {
            newCont += textFields[i].value + (i + 1 < textFields.length ? '\n' : "");
        }

        setNewContent(newCont);
    }, [textFields]);

    // Callback function when newContent changed
    React.useEffect(() => {
        if (newContent.length === 0) {
            setHtmlInput("");
            return;
        }

        try {
            toHtml(newContent, (_err, res) => setHtmlInput(res));
        } catch (error) {
        }
    }, [newContent]);

    // Function called when the text is changed in textField or textArea (keyUp event)
    const onTextChange = (event, indexOfTextField) => {
        if (!state.saveInput) {
            localStorage.removeItem("lastInput");
        }

        let lastInput = event.target.value;

        if (lastInput.length === 0) {
            if (state.saveInput) { // Remove empty content from local storage
                localStorage.removeItem("lastInput");
            }

            setNewContent("");

            // Disable "clear input" button too
            if (useTextArea && !textAreaButtonDisabled) {
                setTextAreaButtonDisabled(true);
            }

            return;
        }

        // Only § codes supported for colouring
        lastInput = lastInput.replace(/&/g, '§');

        // Default text area
        if (useTextArea) {
            if (textAreaButtonDisabled) {
                setTextAreaButtonDisabled(false);
            }

            // Save input to local storage
            if (state.saveInput) {
                if (localStorage.lastInput === undefined) {
                    localStorage.setItem("lastInput", lastInput.replace(/\n/g, '%;;%')); // Replace \n line breaks to %;;%
                } else {
                    localStorage.lastInput = lastInput.replace(/\n/g, '%;;%'); // Replace \n line breaks to %;;%
                }
            }

            // Re-render with the new input
            setNewContent(lastInput);
        } else { // Text fields
            setTextFields(updateTextFieldAtIndex(indexOfTextField, lastInput));
        }
    };

    const updateTextFieldAtIndex = (index, value) => {
        // Spread operator is fastest in copying array, but still, a minor lag can reproducable when typing
        const copy = [...textFields];
        const element = copy[index];
        const id = element === undefined ? 0 : element.id;

        copy[index] = { value: value, id: id };
        return copy;
    };

    const onTextFieldMenuClose = () => {
        setTextFieldOptions(null);
    };

    // Function used to parse and append uploaded text file
    const uploadFile = (file, fileExtension) => {
        if (file.size === 0) {
            return;
        }

        var reader = new FileReader();

        reader.onload = function () {
            let res = reader.result;

            // Find header and footer and only retrieve these if file type is yml
            if (fileExtension === 'yml' || fileExtension === 'yaml') {
                let data;

                try {
                    data = yaml.load(res);
                } catch (e) {
                    console.log(e);
                    return;
                }

                // If header is null then use footer
                let comp = data.header;
                if (!comp) {
                    comp = data.footer;
                }

                if (!comp) {
                    return; // Can not parse header/footer
                }

                res = "";

                for (let i = 0; i < comp.length; i++) {
                    res += comp[i] + (i + 1 < comp.length ? '\n' : "");
                }
            }

            if (textAreaButtonDisabled) {
                setTextAreaButtonDisabled(false);
            }

            res = res.replace(/&/g, '§');

            if (useTextArea) {
                if (state.saveInput) {
                    if (localStorage.lastInput === undefined) {
                        localStorage.setItem("lastInput", res.replace(/\n/g, '%;;%'));
                    } else {
                        localStorage.lastInput = res.replace(/\n/g, '%;;%');
                    }
                }

                setNewContent(document.getElementById("textarea").value += res);
            } else {
                const copy = [...textFields];

                for (const line of res.split('\n')) {
                    const last = copy[copy.length - 1];
                    const lastId = last === undefined ? 0 : last.id;

                    copy.push({ value: line, id: lastId + 1 });
                }

                setTextFields(copy);
            }
        };

        reader.readAsText(file);
    };

    const insertFormattingAtCursor = (type) => {
        if (!activeTextFieldElement) {
            if (useTextArea) {
                activeTextFieldElement = document.getElementById("textarea");
            } else {
                return;
            }
        }

        if (!activeTextFieldElement) {
            return;
        }

        let format;

        switch (type) {
            case "bold":
                format = "§l";
                break;
            case "italic":
                format = "§o";
                break;
            case "underlined":
                format = "§n";
                break;
            case "strikethrough":
                format = "§m";
                break;
            case "obfuscated": // TODO
                format = "§k";
                break;
            default: // Reset
                format = "§r";
                break;
        }

        insertTextAtCursor(format, activeTextFieldElement);
        activeTextFieldElement.focus();
    };

    // Insert text to the last active element at cursor position
    const insertTextAtCursor = (val, element) => {
        const start = element.selectionStart;
        const text = element.value;

        element.value = text.substring(0, start) + val + text.substring(element.selectionEnd, text.length);
        element.selectionStart = element.selectionEnd = start + val.length;

        // Re-render with the new value
        setNewContent(element.value);

        // Enable clear button if disabled
        if (useTextArea && textAreaButtonDisabled) {
            setTextAreaButtonDisabled(false);
        }
    };

    const fitColor = state.darkMode ? '#b5b5b5' : 'black';
    const textFieldOptionsOpen = Boolean(textFieldOptions);

    return (
        <View style={{ marginTop: '6%', marginLeft: '20%', marginRight: '20%', color: fitColor }}>
            <div style={{ marginBottom: 10, display: 'inline-block', width: "90%" }}>
                <Text style={{
                    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", fontSize: 20, color: fitColor
                }}>
                    Header/footer
                </Text>

                <Stack spacing={1} direction="row" sx={{ float: 'inline-end' }}>
                    <Button disableRipple disableElevation size="small" variant="outlined" title="Copy input"
                        onClick={() => {
                            if (newContent.length !== 0) {
                                navigator.clipboard.writeText(newContent);
                            }
                        }}>
                        <ContentCopyIcon />
                    </Button>

                    <label htmlFor="upload-file">
                        <input accept="text/plain,.yml" type="file" id="upload-file" style={{ display: 'none' }}
                            onChange={event => {
                                const selectedFile = event.target.files[0];
                                const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.') + 1);

                                if (fileExtension !== "txt" && fileExtension !== "text" && fileExtension !== "yml" && fileExtension !== "yaml") {
                                    return;
                                }

                                uploadFile(selectedFile, fileExtension);
                            }} />
                        <Button disableRipple disableElevation size="small" variant="outlined" title="Upload content from file"
                            component="span">
                            <UploadFileIcon />
                        </Button>
                    </label>

                    <Button disableRipple disableElevation size="small" variant="outlined" title="Pick color"
                        id='pick-color-btn' onClick={() => {
                            if (colorPickerOpen) {
                                document.getElementById("cp").removeChild(document.getElementById("color-picker"));
                                colorPickerOpen = null;
                                return;
                            }

                            const divElement = document.createElement("div");
                            divElement.id = "color-picker";

                            document.getElementById("cp").appendChild(divElement);

                            colorPickerOpen = new iro.ColorPicker(document.getElementById("color-picker"), {
                                width: 250,
                                layout: [
                                    {
                                        component: iro.ui.Box,
                                    },
                                    {
                                        component: iro.ui.Slider,
                                        options: {
                                            id: 'hue-slider',
                                            sliderType: 'hue'
                                        }
                                    }
                                ]
                            }).on("input:end", function (color) {
                                if (!activeTextFieldElement && useTextArea) {
                                    activeTextFieldElement = document.getElementById("textarea");
                                }

                                if (!activeTextFieldElement) {
                                    return;
                                }

                                // Replace last cached hex value with the new selected one if the cursor position did not changed
                                if (lastHexColor.length === 1) {
                                    const arr = lastHexColor[0]; // Last cached hex color

                                    // Make sure we are in the correct selection index
                                    if (arr.from === activeTextFieldElement.selectionEnd - arr.name.length) {
                                        const text = activeTextFieldElement.value;
                                        const name = arr.name;
                                        const index = text.indexOf(name, arr.from); // Find hex color from cached index

                                        if (index !== -1) {
                                            if (index === 0) { // If there was no text specified (empty content)
                                                const textLength = text.length;
                                                const nameLength = name.length;

                                                if (textLength !== nameLength) { // Only slice the hex color if there was any other text specified
                                                    activeTextFieldElement.value = text.slice(nameLength, textLength);
                                                } else { // Empty value if its only the hex value exist in the content
                                                    activeTextFieldElement.value = "";
                                                }
                                            } else { // Delete hex color from the text
                                                activeTextFieldElement.value = text.substring(0, index) + text.substring(index + name.length, text.length);
                                            }
                                        }
                                    }

                                    lastHexColor.length = 0;
                                }

                                // Cache last selected hex and the start of selection (cursor position)
                                lastHexColor[0] = { name: color.hexString, from: activeTextFieldElement.selectionStart };

                                insertTextAtCursor(color.hexString, activeTextFieldElement);
                            });
                        }}>
                        <ColorLensIcon />
                    </Button>

                    <Stack spacing={0.5} direction="row">
                        <Button disableRipple disableElevation size="small" variant="outlined" title="Bold"
                            onClick={() => insertFormattingAtCursor("bold")}>
                            <FormatBoldIcon />
                        </Button>
                        <Button disableRipple disableElevation size="small" variant="outlined" title="Italic"
                            onClick={() => insertFormattingAtCursor("italic")}>
                            <FormatItalicIcon />
                        </Button>
                        <Button disableRipple disableElevation size="small" variant="outlined" title="Underlined"
                            onClick={() => insertFormattingAtCursor("underlined")}>
                            <FormatUnderlinedIcon />
                        </Button>
                        <Button disableRipple disableElevation size="small" variant="outlined" title="Strikethrough"
                            onClick={() => insertFormattingAtCursor("strikethrough")}>
                            <StrikethroughSIcon />
                        </Button>
                    </Stack>
                </Stack>
            </div>

            <div id="cp" style={{ position: 'absolute', top: '4.5%', left: '51%', zIndex: 5 }}>
                <div id="color-picker"></div>
            </div>

            <Stack spacing={3} direction="row">
                <FormGroup>
                    <FormControlLabel control={<Checkbox disableRipple checked={useTextArea} />} label="Use text area"
                        onChange={() => {
                            if (useTextArea) {
                                localStorage.setItem("useTextArea", false);
                                setUseTextArea(false);
                            } else {
                                localStorage.removeItem("useTextArea");
                                setUseTextArea(true);
                                textFields.length = 0;
                            }
                        }} />
                </FormGroup>

                {!useTextArea ?
                    <>
                        <Button disableRipple disabled={textFields.length > 60} variant="contained" startIcon={<AddIcon />}
                            onClick={() => {
                                const last = textFields[textFields.length - 1];
                                const lastId = last === undefined ? 0 : last.id;

                                setTextFields([...textFields, { value: '', id: lastId + 1 }]);
                            }}>
                            Add new text line
                        </Button>
                        <Button disableRipple disabled={textFields.length === 0} color="warning" variant="outlined"
                            startIcon={<DeleteRoundedIcon />} onClick={() => {
                                textFields.length = 0; // Fully clear array
                                localStorage.removeItem("lastInput"); // Remove the lastInput cache
                                setTextFields([...textFields]); // Fire callback function to re-render the fields (remove them)
                            }}>
                            Remove all
                        </Button>
                        <Button disableRipple disabled={textFields.length === 0} variant="outlined" color="info" startIcon={<ClearIcon />}
                            onClick={() => {
                                // Create a copy of textFields array
                                let newTextFields = [...textFields];

                                textFields.map((f, index) => {
                                    document.getElementById("textfield" + f.id).value = "";
                                    newTextFields[index] = { value: "", id: f.id }; // Only resets the value in the array
                                });

                                setTextFields(newTextFields);
                            }}>
                            Clear all
                        </Button>
                    </>
                    :
                    <Button disableRipple disabled={textAreaButtonDisabled} variant="outlined" startIcon={<ClearIcon />}
                        onClick={() => {
                            document.getElementById("textarea").value = "";
                            localStorage.removeItem("lastInput");
                            setTextAreaButtonDisabled(true);
                            setHtmlInput("");
                        }}>
                        Clear input
                    </Button>}
            </Stack>

            {useTextArea ?
                <form spellCheck="false">
                    <textarea style={{ resize: 'none', maxWidth: '95%', fontSize: 16, marginTop: 10, backgroundColor: 'inherit', color: state.darkMode ? 'white' : 'initial' }}
                        id="textarea" wrap="hard" rows="8" cols="110" maxLength="4000"
                        defaultValue={localStorage.lastInput === undefined ? "" : storedTextAreaValue}
                        placeholder="Here you can specify both the header and the footer"
                        onFocus={event => activeTextFieldElement = event.currentTarget}
                        onKeyUp={event => onTextChange(event, 0)}>
                    </textarea>
                </form>
                :
                <div style={{ marginTop: 5, overflow: 'auto', height: 500, maxWidth: '95%', border: '1px solid grey', padding: '0 10px 10px 10px' }}>
                    {textFields.length === 0 ? <></> : textFields.map((field, index) => <Stack key={"field_" + field.id} direction="row">
                        <TextField
                            hiddenLabel
                            autoFocus
                            id={"textfield" + field.id}
                            defaultValue={field.value}
                            placeholder="..."
                            onFocus={event => activeTextFieldElement = event.currentTarget}
                            onKeyUp={event => onTextChange(event, index)}
                            sx={{
                                width: '100%', marginTop: 2, backgroundColor: 'white', borderRadius: 1
                            }}
                            inputProps={{
                                maxLength: 4000
                            }}
                        />

                        <IconButton
                            disableRipple
                            id={field.id}
                            onClick={event => setTextFieldOptions(event.currentTarget)}
                            sx={{ marginTop: 2 }}
                        >
                            <MoreVertIcon color="info" />
                        </IconButton>
                    </Stack>
                    )}

                    {textFieldOptionsOpen &&
                        <Menu
                            open={textFieldOptionsOpen}
                            onClose={onTextFieldMenuClose}
                            anchorEl={textFieldOptions}
                        >
                            <MenuItem disableRipple onClick={() => {

                                // Remove from storage if its the last one
                                if (textFields.length - 1 === 0) {
                                    localStorage.removeItem("lastInput");
                                }

                                const id = parseInt(textFieldOptions.id);

                                setTextFields(textFields.filter(tf => tf.id !== id));
                                onTextFieldMenuClose();
                            }}>
                                <DeleteRoundedIcon />
                                Remove text field
                            </MenuItem>
                            <MenuItem disableRipple onClick={() => {
                                const id = parseInt(textFieldOptions.id);

                                setTextFields(updateTextFieldAtIndex(textFields.findIndex(va => va.id === id), ""));
                                document.getElementById("textfield" + id).value = "";
                                onTextFieldMenuClose();
                            }}>
                                <ClearIcon />
                                Clear content
                            </MenuItem>
                        </Menu>
                    }
                </div>
            }

            <ComponentWriter state={state} useTextArea={useTextArea} htmlInput={htmlInput} />
        </View>
    );
}
