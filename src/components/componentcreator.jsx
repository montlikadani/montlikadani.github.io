import React from "react";

// https://mui.com
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
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
let colorPickerOpen = false;

// Listens to click events to close the color picker
window.onclick = event => {
    if (!colorPickerOpen) {
        return;
    }

    const cp = document.getElementById("color-picker");
    const target = event.target;

    if (!cp?.contains(target) && !document.getElementById("pick-color-btn")?.contains(target)) {
        document.getElementById("cp")?.removeChild(cp);
        colorPickerOpen = false;
    }
};

export default function ComponentCreator({ state }) {
    const [useTextArea, setUseTextArea] = React.useState(localStorage.useTextArea === undefined);
    const [textFields, setTextFields] = React.useState([]);
    const [textFieldOptions, setTextFieldOptions] = React.useState(null);

    let [newContent, setNewContent] = React.useState("");
    const [htmlInput, setHtmlInput] = React.useState("");

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
                const json = Array.from(JSON.parse(li));

                for (let i = 0; i < json.length; i++) {
                    const value = json[i].value;

                    if (value) {
                        storedTextAreaValue += value.replace(/%;;%/g, '\n');
                    }

                    if (i + 1 < json.length) {
                        storedTextAreaValue += "\n";
                    }
                }
            } catch (error) {
                // If the conversation fails we uses the cached input
                storedTextAreaValue = li.replace(/%;;%/g, '\n');
            }

            if (state.saveInput) {
                setNewContent(storedTextAreaValue);
            }

            const area = document.getElementById("textarea");
            if (area) {
                area.value = storedTextAreaValue;
            }
        } else if (textFields.length === 0) {
            try {
                // Try with parsing json
                setTextFields(JSON.parse(li));
            } catch (error) { // Append new lines by splitting %;;% characters
                const split = Array.from(li.split("%;;%"));

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
        saveInputToStorage(JSON.stringify(textFields));

        // Append all textFields in plain text and re-render
        let newCont = "";

        for (let i = 0; i < textFields.length; i++) {
            newCont += textFields[i].value;

            if (i + 1 < textFields.length) {
                newCont += "\n";
            }
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
            if (useTextArea) {
                if (state.saveInput) { // Remove empty content from local storage
                    localStorage.removeItem("lastInput");
                }

                setNewContent("");

                // Disable "clear input" button too
                if (!textAreaButtonDisabled) {
                    setTextAreaButtonDisabled(true);
                }

                return;
            }

            if (textFields.length === 0) {
                if (state.saveInput) {
                    localStorage.removeItem("lastInput");
                }

                setNewContent("");
                return;
            }
        } else {
            // Only § codes supported for colouring
            lastInput = lastInput.replace(/&/g, '§');
        }

        // Default text area
        if (useTextArea) {
            if (textAreaButtonDisabled) {
                setTextAreaButtonDisabled(false);
            }

            // Save input to local storage
            saveInputToStorage(lastInput.replace(/\n/g, '%;;%')); // Replace \n line breaks to %;;%

            // Rerender with the new input
            setNewContent(lastInput);
        } else { // Text fields
            updateTextFieldAtIndex(indexOfTextField, lastInput);
        }
    };

    const updateTextFieldAtIndex = (index, val) => {
        // To rerender we need to shallow copy the array
        const newArray = [...textFields];
        const element = newArray[index];

        newArray[index] = { value: val, id: !element ? 0 : element.id };
        setTextFields(newArray);
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
                    res += comp[i];

                    if (i + 1 < comp.length) {
                        res += "\n";
                    }
                }
            }

            if (textAreaButtonDisabled) {
                setTextAreaButtonDisabled(false);
            }

            res = res.replace(/&/g, '§');

            if (useTextArea) {
                saveInputToStorage(res.replace(/\n/g, '%;;%'));

                const area = document.getElementById("textarea");
                if (area) {
                    setNewContent(area.value += res);
                }
            } else {
                const copy = [...textFields];

                for (const line of res.split('\n')) {
                    const last = copy[copy.length - 1];

                    copy.push({ value: line, id: !last ? 0 : last.id + 1 });
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
                if (textFields.length === 0) {
                    return;
                }

                // Insert the formatting to the last text field (if present)
                activeTextFieldElement = document.getElementById("textfield" + textFields[textFields.length - 1].id);
            }

            if (!activeTextFieldElement) {
                return;
            }
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

    const saveInputToStorage = (text) => {
        if (state.saveInput) {
            if (localStorage.lastInput) {
                localStorage.lastInput = text;
            } else {
                localStorage.setItem("lastInput", text);
            }
        }
    };

    // Insert text to the last active element at cursor position
    const insertTextAtCursor = (val, element) => {
        const start = element.selectionStart;
        let text = element.value;

        element.value = text.substring(0, start) + val + text.substring(element.selectionEnd, text.length);
        element.selectionStart = element.selectionEnd = start + val.length;
        text = element.value;

        saveInputToStorage(text);

        if (useTextArea) {
            setNewContent(text);

            // Enable clear button if disabled
            if (textAreaButtonDisabled) {
                setTextAreaButtonDisabled(false);
            }
        } else {
            const id = parseInt(element.id.replace("textfield", ""));
            updateTextFieldAtIndex(textFields.findIndex(va => va.id === id), text);
        }
    };

    const preferredColor = state.darkMode ? '#b5b5b5' : 'initial';
    const textFieldOptionsOpen = Boolean(textFieldOptions);

    return (
        <View style={{ marginTop: '6%', marginLeft: '20%', marginRight: '20%' }}>
            <div style={{ marginBottom: 10, display: 'inline-block', width: "90%" }}>
                <Text style={{
                    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", fontSize: 20, color: preferredColor
                }}>
                    Header/footer
                </Text>

                <Stack spacing={1} direction="row" sx={{ float: 'inline-end' }}>
                    <Button disableRipple disableElevation disabled={newContent.length === 0} size="small" variant="outlined" title="Copy input"
                        onClick={() => navigator.clipboard.writeText(newContent)}>
                        <ContentCopyIcon />
                    </Button>

                    <label htmlFor="upload-file">
                        <input accept="text/plain,.yml" type="file" id="upload-file" style={{ display: 'none' }}
                            onChange={event => {
                                const selectedFile = event.target.files[0];
                                const fileName = selectedFile.name;
                                const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);

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
                                document.getElementById("cp")?.removeChild(document.getElementById("color-picker"));
                                colorPickerOpen = false;
                                return;
                            }

                            const divElement = document.createElement("div");
                            divElement.id = "color-picker";

                            document.getElementById("cp")?.appendChild(divElement);

                            new iro.ColorPicker(document.getElementById("color-picker"), {
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
                                        const index = text.indexOf(arr.name, arr.from); // Find hex color from cached index

                                        if (index !== -1) {
                                            if (index === 0) { // If there was no text specified (empty content)
                                                const nameLength = arr.name.length;

                                                if (text.length !== nameLength) { // Only slice the hex color if there was any other text specified
                                                    activeTextFieldElement.value = text.slice(nameLength, text.length);
                                                } else { // Empty value if its only the hex value exist in the content
                                                    activeTextFieldElement.value = "";
                                                }
                                            } else { // Delete hex color from the text
                                                activeTextFieldElement.value = text.substring(0, index) + text.substring(index + arr.name.length, text.length);
                                            }
                                        }
                                    }

                                    lastHexColor.length = 0;
                                }

                                // Cache last selected hex and the start of selection (cursor position)
                                lastHexColor[0] = { name: color.hexString, from: activeTextFieldElement.selectionStart };

                                insertTextAtCursor(color.hexString, activeTextFieldElement);
                            });

                            colorPickerOpen = true;
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
                        sx={{ color: preferredColor }} onChange={() => {
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

                                setTextFields([...textFields, { value: '', id: !last ? 0 : last.id + 1 }]);
                            }}>
                            Add new text line
                        </Button>
                        <Button disableRipple disabled={textFields.length === 0} color="warning" variant="outlined"
                            startIcon={<DeleteRoundedIcon />} onClick={() => {
                                textFields.length = 0; // Fully clear array
                                localStorage.removeItem("lastInput"); // Remove the lastInput cache
                                setTextFields([...textFields]); // Fire callback function to re-render the fields (remove them)
                                activeTextFieldElement = null;
                            }}>
                            Remove all
                        </Button>
                        <Button disableRipple disabled={textFields.length === 0} variant="outlined" color="info" startIcon={<ClearIcon />}
                            onClick={() => {
                                // Create a copy of textFields array
                                let newTextFields = [...textFields];

                                textFields.map((f, index) => {
                                    const tf = document.getElementById("textfield" + f.id);

                                    if (tf) {
                                        tf.value = "";
                                    }

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
                            const area = document.getElementById("textarea");

                            if (area) {
                                area.value = "";
                            }

                            localStorage.removeItem("lastInput");
                            setTextAreaButtonDisabled(true);
                            setHtmlInput("");
                        }}>
                        Clear input
                    </Button>}
            </Stack>

            {useTextArea ?
                <form spellCheck="false">
                    <textarea style={{
                        resize: 'none', width: '94%', fontSize: 16, marginTop: 10, backgroundColor: 'inherit', color: preferredColor
                    }}
                        id="textarea" wrap="hard" rows="8" cols="110" maxLength="4000"
                        defaultValue={!localStorage.lastInput ? "" : storedTextAreaValue}
                        placeholder="Here you can specify both the header and the footer"
                        onFocus={event => activeTextFieldElement = event.currentTarget}
                        onKeyUp={event => onTextChange(event, 0)}>
                    </textarea>
                </form>
                :
                <div style={{ marginTop: 5, overflow: 'auto', height: 500, maxWidth: '95%', border: '1px solid grey', padding: '0 10px 10px 10px' }}>
                    {textFields.length !== 0 && textFields.map((field, index) => <Stack key={"field_" + field.id} direction="row">
                        <TextField
                            hiddenLabel
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

                        <MoreVertIcon titleAccess='Tools' id={field.id} onClick={event => setTextFieldOptions(event.currentTarget)} color="info"
                            sx={{ cursor: 'pointer', margin: '30px 0 0 10px' }} />
                    </Stack>
                    )}

                    {textFieldOptionsOpen &&
                        <Menu
                            open={textFieldOptionsOpen}
                            onClose={onTextFieldMenuClose}
                            anchorEl={textFieldOptions}
                        >
                            <MenuItem disableRipple onClick={() => {
                                activeTextFieldElement = null;

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

                                updateTextFieldAtIndex(textFields.findIndex(va => va.id === id), "");

                                const tf = document.getElementById("textfield" + id);
                                if (tf) {
                                    tf.value = "";
                                }

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
