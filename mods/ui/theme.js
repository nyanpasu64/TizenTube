import { configRead } from '../config.js';

let style = null;
let css = '';

function updateStyle() {
    css = `
    ytlr-guide-response yt-focus-container {
        background-color: ${configRead('focusContainerColor')};
    }

    #container {
        background-color: ${configRead('routeColor')} !important;
    }
`;

    if (style) {
        document.head.removeChild(style);
        style = null;
    }

    let nonce = null;
    const existingStyle = document.querySelector('style[nonce]');
    if (existingStyle) {
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/nonce
        // Older browsers (eg. Switch) can only access via getAttribute, newer only via field.
        nonce = existingStyle.nonce || existingStyle.getAttribute('nonce');
    }

    style = document.createElement('style');
    style.textContent = css;
    if (nonce) {
        // if unsupported, https://developer.mozilla.org/en-US/docs/Glossary/Expando
        style.nonce = nonce;
        // hopefully safe if unsupported? if throws, must catch both independently
        style.setAttribute('nonce', nonce);
    }

    // On Switch, we cannot edit textContent after appendChild(), and must create a new style element.
    // Could we remove and readd the element? I don't know.
    document.head.appendChild(style);
}

updateStyle();
export default updateStyle;
