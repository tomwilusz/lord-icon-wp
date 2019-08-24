require('./style.css');

import { ICON } from './icon';
import Select from 'react-select';
import { colors } from 'lord-icon-element';

const { data, apiFetch, i18n, blocks, components, editor } = wp;

const { __ } = i18n;
const { withSelect, registerStore } = data;
const { registerBlockType } = blocks;
const { InspectorControls, ColorPalette } = editor;
const { PanelBody, RangeControl, ServerSideRender, ToggleControl, BaseControl, Notice, ClipboardButton, Snackbar } = components;

const attributes = {
    resize: {
        type: 'boolean',
        default: false,
    },
    colorize: {
        type: 'boolean',
        default: false,
    },
    size: {
        type: 'number',
        default: 32,
    },
    icon: {
        type: 'string',
        default: '',
    },
    animation: {
        type: 'string',
        default: '',
    },
    palette: {
        type: 'string',
        default: '',
    },
};

let ANIMATION_OPTIONS = [
    { label: 'None', value: 'none' },
    { label: 'Hover', value: 'hover' },
    { label: 'Click', value: 'click' },
    { label: 'Morph', value: 'morph' },
    { label: 'Morph two way', value: 'morph-two-way' },
    { label: 'Loop', value: 'loop' },
    { label: 'Auto', value: 'auto' },
];

function findOption(options, value) {
    for (const current of options) {
        if (current.value === value) {
            return current;
        }
    }
}

function createOptions(values) {
    return (values || []).map(c => {
        return  { value: c, label: c };
    });
}

const actions = {
    setIcons(icons) {
        return {
            type: 'SET_ICONS',
            icons,
        };
    },
    receiveIcons(path) {
        return {
            type: 'RECEIVE_ICONS',
            path,
        };
    },
    setIconData(iconData, icon) {
        return {
            type: 'SET_ICON_DATA',
            iconData,
            icon,
        };
    },
    receiveIconData(path, icon) {
        return {
            type: 'RECEIVE_ICON_DATA',
            path,
            icon,
        };
    },
};

const iconsPalette = {};

const store = registerStore('lord-icon/icons', {
    reducer(state = {}, action) {
        if (action.type == 'SET_ICONS') {
            const newState = Object.assign({}, state);
            newState.icons = action.icons;
            return newState;
        } else if  (action.type == 'SET_ICON_DATA') {
            const newState = Object.assign({}, state);
            if (!newState.iconData) {
                newState.iconData = {};
            }
            newState.iconData[action.icon] = action.iconData;
            return newState;
        }

        return state;
    },

    actions,

    selectors: {
        receiveIcons(state) {
            const { icons } = state;
            return icons;
        },
        receiveIconData(state) {
            const { iconData } = state;
            return iconData;
        },
    },

    controls: {
        RECEIVE_ICONS(action) {
            return apiFetch({ path: action.path });
        },
        RECEIVE_ICON_DATA(action) {
            return apiFetch({
                path: action.path + `?icon=${action.icon || ''}`,
            });
        },
    },

    resolvers: {
        * receiveIcons(state) {
            const icons = yield actions.receiveIcons('/lord-icon/icons');
            return actions.setIcons(icons);
        },
        * receiveIconData(icon) {
            const iconData = yield actions.receiveIconData('/lord-icon/icon-data', icon);
            return actions.setIconData(iconData, icon);
        },
    },
});


registerBlockType('lord-icon/element', {
    title: 'Lordicon Element',
    icon: ICON,
    category: 'lordicon',
    keywords: [__('Icon'), __('LordIcon')],
    attributes,
    edit: withSelect( ( select, prop ) => {
        return {
            icons: select('lord-icon/icons').receiveIcons(),
            iconData: select('lord-icon/icons').receiveIconData(prop.attributes.icon),
        };
    })(function ({ isSelected, setAttributes, className, attributes, icons, iconData }) {
        const ICONS_OPTIONS = createOptions(icons);

        if (!attributes.animation) {
            attributes.animation = 'auto';
        }
        if (!attributes.icon && ICONS_OPTIONS.length) {
            setAttributes({ icon: ICONS_OPTIONS[0].value });
        }

        const { size, icon, resize, animation, colorize, palette } = attributes;
        const currentIconData = (iconData || {})[icon];
        const currentColors = currentIconData ? colors(currentIconData) : [];

        if (!iconsPalette[icon] && currentIconData) {
            iconsPalette[icon] = [ ...currentColors ];
        }

        let sizeField;
        if (resize) {
            sizeField =
                <RangeControl
                    label={__('Icon size')}
                    value={size}
                    onChange={value =>
                        setAttributes({ size: value })
                    }
                    min={16}
                    max={2000}
                    beforeIcon="minus"
                    allowReset
                />;
        }


        let colorizeField = [];
        if (colorize && currentColors.length) {
            const currentPalette = (palette || '').split(';');
            if (currentPalette.length === currentColors.length) {
                for (let i = 0; i < currentPalette.length; ++i) {
                    currentColors[i] = currentPalette[i];
                }
            }

            const usedColors = [ ...iconsPalette[icon] ];
   
            for (const current of currentColors) {
                if (!usedColors.includes(current)) {
                    usedColors.push(current);
                }
            }

            for (let i = 0; i < currentColors.length; ++i) {
                const label = `Color ${i + 1}`;
                const current = currentColors[i];
               
                const changeColor = (color) => {
                    // prevent from unset color
                    if (!color) {
                        return;
                    }

                    let newColors = [ ...currentColors ];
                    newColors[i] = color;
                    newColors = newColors.filter(c => c);

                    setAttributes({ palette: newColors.length ? newColors.join(';') : '' });
                }

                const colorsForPalette = usedColors.map(c => {
                    return {
                        name: 'Color',
                        color: c,
                    };
                });

                colorizeField.push(
                    <BaseControl label={label}>
                        <ColorPalette
			                colors={colorsForPalette}
                            value={current}
                            onChange={changeColor}

                        />
                    </BaseControl>
                );
            }
        }

        const params = [
            `icon="${icon}"`,
        ];
        if (animation) {
            params.push(`animation="${animation}"`);
        }
        if (resize) {
            params.push(`size="${size}"`);
        }
        if (palette) {
            params.push(`palette="${palette}"`);
        }
        const shortcodeHint = `[lord-icon ${params.join(' ')}][/lord-icon]`;

        const showCopiedNotice = () => {
            wp.data.dispatch( 'core/notices' ).createNotice(
                'info',
                __('Shortcode copied to clipboard!', 'block-layouts'),
                {
                    isDismissible: true,
                    type: 'snackbar'
                }
            );
        };

        return [
            isSelected && (
                <InspectorControls key="inspectors">
                    <PanelBody title={__('Icon Settings')}>
                        <BaseControl label="Icon">
                            <Select
                                value={findOption(ICONS_OPTIONS, icon)}
                                onChange={data =>
                                    setAttributes({ icon: data.value, palette: '', colorize: false })
                                }
                                options={ICONS_OPTIONS}
                            />
                        </BaseControl>
                        <BaseControl label="Animation">
                            <Select
                                value={findOption(ANIMATION_OPTIONS, animation)}
                                onChange={data =>
                                    setAttributes({ animation: data.value })
                                }
                                options={ANIMATION_OPTIONS}
                            />
                        </BaseControl>
                        <ToggleControl
                            label="Resize icon"
                            checked={resize}
                            onChange={() =>
                                setAttributes({ resize: !resize })
                            }
                        />
                        {sizeField}
                        <ToggleControl
                            label="Colorize"
                            checked={colorize}
                            onChange={() =>
                                setAttributes({ colorize: !colorize, palette: '' })
                            }
                        />
                        {colorizeField}
                    </PanelBody>

                    <PanelBody title={__('Shortcode hint')}>
                        <p>{__('You can use this icon also with shortcode:')}</p>
                      
                        <Notice isDismissible={false}>
                            {shortcodeHint}
                        </Notice>
                        <ClipboardButton
                            isPrimary
                            text={shortcodeHint}
                            onCopy={showCopiedNotice}
                        >
                        {__('Copy shortcode')}
                        </ClipboardButton>
                    </PanelBody>
                </InspectorControls>
            ),

            <ServerSideRender
                block="lord-icon/element"
                attributes={attributes}
            />,
        ];
    }),
    save(props) {
        return null;
    },
});