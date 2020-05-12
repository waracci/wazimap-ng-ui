import {format as d3format} from 'd3-format';

const queryCache = {};

export class Cache {
    constructor() {
        this.memoryCache = {}

    }

    getItem(key) {
        const val = localStorage.getItem(key);
        if (val != null)
            return JSON.parse(val);

        if (this.memoryCache[key] != undefined)
            return this.memoryCache[key]

        return null;
    }

    setItem(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (err) {
            console.log(`Error using localstorage, reverting to memory cache: ${err}`)
            this.memoryCache[key] = val;
        }
    }
}

const cache = new Cache();

export function setPopupStyle(clsName) {
    $('.leaflet-popup-close-button').html($('.map__facility-tooltip_close').html());
    $('.leaflet-popup-close-button').css('padding', 0);
    $('.map__facility-tooltip_close').css('display', 'none');
    $('.leaflet-popup-content-wrapper').css('border-radius', $('.' + clsName).css('border-radius'));
    $('.leaflet-popup-content-wrapper').css('font-family', $('.' + clsName).css('font-family'));
    $('.leaflet-popup-content-wrapper').css('font-size', $('.' + clsName).css('font-size'));
    $('.leaflet-popup-content').css('margin', $('.' + clsName).css('padding'));
    $('.leaflet-popup-content').css('min-width', $('.' + clsName).css('min-width'));
    $('.leaflet-popup-content').css('display', 'inline-table');
    $('.map__tooltip_value').css('white-space', 'nowrap');

    let popupWidth = 0;
    $('.leaflet-popup-content').each(function () {
        if ($(this).width() < popupWidth || popupWidth <= 0) {
            popupWidth = $(this).width();
        }
    });

    let leftOffset = (popupWidth - $('.map__tooltip_geography-chip').width()) / 2;
    $('.map__tooltip_geography-chip').css('left', leftOffset);
}

export function getSelectedBoundary(level, geometries, config) {
    let selectedBoundary;

    const preferredChildren = config.preferredChildren[level];

    preferredChildren.forEach((preferredChild, i) => {
        if (i === 0) {
            selectedBoundary = geometries.children[preferredChild];
        } else {
            if (selectedBoundary === null || typeof selectedBoundary === 'undefined') {
                selectedBoundary = {features: []};
            }
            let secondarySelectedBoundary = geometries.children[preferredChild];

            if (typeof secondarySelectedBoundary !== 'undefined' && secondarySelectedBoundary !== null) {
                secondarySelectedBoundary.features.forEach((feature) => {
                    let alreadyContained = false;
                    selectedBoundary.features.forEach(sb => {
                        if (sb.properties.code === feature.properties.code) {
                            alreadyContained = true;
                        }
                    })

                    if (!alreadyContained) {
                        selectedBoundary.features.push(feature);
                    }
                })
            }
        }
    })

    return selectedBoundary;
}

export class ThemeStyle {
    static replaceChildDivWithThemeIcon(themeId, colorElement, iconElement) {
        let iconClass = '.';
        switch (themeId) {
            case 1: //Health theme
                iconClass += 'icon--health';
                break;
            case 2: //Education theme
                iconClass += 'icon--education';
                break;
            case 3: //Labour theme
                iconClass += 'icon--elections';
                break;
            case 4: //Transport theme
                iconClass += 'icon--transport';
                break;
            case 5: //Social theme
                iconClass += 'icon--people';
                break;
            default:
                return false;
        }

        //clear icon element and add icon
        $(iconElement).empty().append($('.styles').find(iconClass).prop('outerHTML'));
        //remove classes
        $(colorElement).removeClass('_1 _2 _3 _4 _5');
        //Add correct color to element which requires it
        $(colorElement).addClass('_' + themeId);

        return true;
    }
}

export class Observable {
    constructor() {
        this.eventListeners = {}
    }

    on(event, func) {
        if (this.eventListeners[event] == undefined)
            this.eventListeners[event] = [];
        this.eventListeners[event].push(func);
    };

    triggerEvent(event, payload) {
        if (this.eventListeners[event] != undefined) {
            this.eventListeners[event].forEach(listener => {
                listener(payload);
            });
        }
    };
}

export const numFmt = d3format(",.2d");
export const numFmtAlt = d3format("~s");

export function hasElements(arr) {
    if (arr != null && arr != undefined && arr.length > 0)
        return true
    return false;
}

export function checkIterate(arr, func) {
    if (!hasElements(arr))
        return

    arr.forEach((el, i) => {
        func(el, i);
    })
}

