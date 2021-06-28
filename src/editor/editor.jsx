require('./style.css');

import { ICON } from './icon';
import { colors as allColors, deepClone } from './lottie';

const { data, apiFetch, i18n, blocks, blockEditor, components, serverSideRender: ServerSideRender } = wp;

const { __ } = i18n;
const { withSelect, registerStore } = data;
const { registerBlockType } = blocks;
const { InspectorControls, } = blockEditor;
const { PanelBody, RangeControl, ColorPalette, CardDivider, ToggleControl, BaseControl, CustomSelectControl, ClipboardButton, Button, Card, CardBody, TextControl } = components;

console.log('components', components);

const ICONS_PALETTE = {};

const PLACEHOLDER_DATA_INDEX = Symbol("Placeholder");

const SUPPORTED_ATTRIBUTES = {
    resize: {
        type: 'boolean',
        default: false,
    },
    restroke: {
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
    stroke: {
        type: 'number',
        default: 50,
    },
    delay: {
        type: 'number',
        default: 0,
    },
    icon: {
        type: 'string',
        default: '',
    },
    src: {
        type: 'string',
        default: '',
    },
    trigger: {
        type: 'string',
        default: 'none',
    },
    colors: {
        type: 'string',
        default: '',
    },
};

let TRIGGER_OPTIONS = [
    { name: 'None', key: 'none' },
    { name: 'Click', key: 'click' },
    { name: 'Hover', key: 'hover' },
    { name: 'Loop', key: 'loop' },
    { name: 'Loop on hover', key: 'loop-on-hover' },
    { name: 'Morph', key: 'morph' },
    { name: 'Morph two way', key: 'morph-two-way' },
];

function findOption(options, key) {
    for (const current of options) {
        if (current.key === key) {
            return current;
        }
    }
}

async function fetchIconData(src) {
    const response = await fetch(src);
    return await response.json();
}

const actions = {
    setIconData(iconData, src, icon) {
        return {
            type: 'SET_ICON_DATA',
            iconData,
            src,
            icon,
        };
    },
    receiveIconData(path, src, icon) {
        return {
            type: 'RECEIVE_ICON_DATA',
            path,
            src,
            icon,
        };
    },
};

const store = registerStore('lord-icon', {
    reducer(state = {}, action) {
        if (action.type == 'SET_ICON_DATA') {
            const newState = Object.assign({}, state);
            if (!newState.iconData) {
                newState.iconData = {};
            }

            newState.iconData[action.src || action.icon || PLACEHOLDER_DATA_INDEX] = action.iconData;

            return newState;
        }

        return state;
    },

    actions,

    selectors: {
        receiveIconData(state) {
            const { iconData } = state;
            return iconData;
        },
    },

    controls: {
        RECEIVE_ICON_DATA(action) {
            if (action.src) {
                return fetchIconData(action.src);
            } else {
                const extraParams = (action && action.icon) ? (`?icon=${action.icon || ''}`) : '';

                return apiFetch({
                    path: action.path + extraParams,
                });
            }
        },
    },

    resolvers: {
        * receiveIconData(src, icon) {
            const iconData = yield actions.receiveIconData('/lord-icon/icon-data', src, icon);
            return actions.setIconData(iconData, src, icon);
        },
    },
});

registerBlockType('lord-icon/element', {
    title: __('Lordicon Element'),
    icon: ICON,
    category: 'lordicon',
    keywords: [__('Icon'), __('LordIcon')],
    attributes: SUPPORTED_ATTRIBUTES,
    edit: withSelect((select, prop) => {
        return {
            iconData: select('lord-icon').receiveIconData(prop.attributes.src, prop.attributes.icon),
        };
    })(function ({ isSelected, setAttributes, className, attributes, iconData }) {
        const { size, icon, src, resize, stroke, restroke, trigger, colorize, colors, delay } = attributes;

        let currentIconData = null;
        if (iconData) {
            if (!src && !icon) {
                currentIconData = iconData[PLACEHOLDER_DATA_INDEX];
            } else {
                currentIconData = iconData[icon || src] || null;
            }

            if (currentIconData) {
                const currentColors = allColors(currentIconData);

                if (!src && !icon) {
                    ICONS_PALETTE[PLACEHOLDER_DATA_INDEX] = deepClone(currentColors);
                } else {
                    ICONS_PALETTE[icon || src] = deepClone(currentColors);
                }
            }
        }

        let currentColors = [];
        if (!src && !icon) {
            currentColors = ICONS_PALETTE[PLACEHOLDER_DATA_INDEX] || [];
        } else {
            currentColors = ICONS_PALETTE[icon || src] || [];
        }

        let sizeField;
        if (resize) {
            sizeField =
                <RangeControl
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

        let strokeField;
        if (restroke) {
            strokeField =
                <RangeControl
                    value={stroke}
                    onChange={value =>
                        setAttributes({ stroke: value })
                    }
                    min={0}
                    max={100}
                    beforeIcon="minus"
                    allowReset
                />;
        }

        let delayField;
        if (trigger == 'loop' || trigger == 'loop-on-hover') {
            delayField = <TextControl
                label={__('Delay (ms)')}
                type="number"
                value={delay}
                onChange={(delay) => setAttributes({ delay: Math.max(0, delay) })}
            />;
        }

        let colorizeField = [];
        if (colorize && currentColors.length) {
            const usedColors = currentColors.map(c => c.color);

            const paletteColors = currentColors.map(c => {
                return {
                    name: __('Original'),
                    color: c.color,
                };
            });

            const colorsAfterChange = (colors || '').split(',').filter(Boolean).map(c => {
                const [name, color] = c.split(':');
                return { name, color };
            });
            for (const ca of colorsAfterChange) {
                if (usedColors.includes(ca.color)) {
                    continue;
                }
                paletteColors.push({
                    name: __('Custom'),
                    color: ca.color,
                });
                usedColors.push(ca.color);
            }

            for (let i = 0; i < currentColors.length; ++i) {
                const current = currentColors[i];
                const label = current.name;

                const changeColor = (color) => {
                    // prevent from unset color
                    if (!color) {
                        return;
                    }

                    const newColors = colorsAfterChange.length ? colorsAfterChange : deepClone(currentColors);
                    for (const cc of newColors) {
                        if (cc.name.toLowerCase() == current.name.toLowerCase()) {
                            cc.color = color;
                        }
                    }

                    setAttributes({ colors: newColors.length ? newColors.map(c => `${c.name.toLowerCase()}:${c.color}`).join(',') : '' });
                }

                const currentValue = colorsAfterChange.length ? colorsAfterChange[i].color : current.color;

                colorizeField.push(
                    <BaseControl label={label}>
                        <ColorPalette
                            colors={paletteColors}
                            value={currentValue}
                            onChange={changeColor}

                        />
                    </BaseControl>
                );
            }
        }

        const params = [];

        if (src) {
            params.push(`src="${src}"`);
        }

        if (trigger && trigger != 'none') {
            params.push(`trigger="${trigger}"`);
        }

        if (resize) {
            params.push(`size="${size}"`);
        }

        if (restroke) {
            params.push(`stroke="${stroke}"`);
        }

        if (colors) {
            params.push(`colors="${colors}"`);
        }

        if (delay && (trigger === 'loop' || trigger == 'loop-on-hover')) {
            params.push(`delay="${delay}"`);
        }

        const shortcodeHint = `[lord-icon ${params.join(' ')}][/lord-icon]`;

        const showCopiedNotice = () => {
            wp.data.dispatch('core/notices').createNotice(
                'info',
                __('Shortcode copied to clipboard!', 'block-layouts'),
                {
                    isDismissible: true,
                    type: 'snackbar'
                },
            );
        };

        const showMultimediaPopup = () => {
            const wpMedia = wp.media({
                title: __('Upload or select icon'),
                multiple: false,
                library: {
                    type: ['text/plain']
                },
            }).open().on('select', (e) => {
                const uploaded_image = wpMedia.state().get('selection').first();
                const fileURL = uploaded_image.toJSON().url;

                setAttributes({ src: fileURL, colors: '', colorize: false })
            });
        }
        return [
            isSelected && (
                <InspectorControls key="inspectors">
                    <PanelBody title={__('Icon')}>
                        <TextControl
                            label={__('URL')}
                            value={src}
                            onChange={(fileURL) => setAttributes({ src: fileURL, colors: '', colorize: false })}
                        />

                        <Button isPrimary onClick={showMultimediaPopup}>{__('Select icon')}</Button>
                    </PanelBody>

                    <PanelBody title={__('Editor')}>
                        <BaseControl label={__('Trigger')}>
                            <CustomSelectControl
                                options={TRIGGER_OPTIONS}
                                value={findOption(TRIGGER_OPTIONS, trigger)}
                                onChange={({ selectedItem }) => setAttributes({ delay: 0, trigger: selectedItem.key })}
                            />
                        </BaseControl>

                        {delayField}

                        <CardDivider />

                        <ToggleControl
                            label={__('Size')}
                            checked={resize}
                            onChange={() =>
                                setAttributes({ resize: !resize })
                            }
                        />
                        {sizeField}
                        <ToggleControl
                            label={__('Stroke')}
                            checked={restroke}
                            onChange={() =>
                                setAttributes({ restroke: !restroke })
                            }
                        />
                        {strokeField}
                        <ToggleControl
                            label={__('Colors')}
                            checked={colorize}
                            onChange={() =>
                                setAttributes({ colorize: !colorize, colors: '' })
                            }
                        />
                        {colorizeField}
                    </PanelBody>

                    <PanelBody title={__('Shortcode')} initialOpen={false}>
                        <p>{__('You can use this icon with shortcode as well:')}</p>

                        <Card>
                            <CardBody>
                                <small>{shortcodeHint}</small>
                            </CardBody>
                        </Card>
                        <br />

                        <ClipboardButton
                            isPrimary
                            variant="primary"
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