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

    // On Switch (not Firefox), we cannot edit the textContent of a style already in the DOM.
    // Could we remove the element, change textContent, and appendChild() the same element?
    // IDK, but updateStyle() is rarely called so we can just remove it.
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
        // This line alone is sufficient for Switch and Firefox, though Firefox does not
        // support getAttribute so setAttribute may not be recommended?
        style.setAttribute('nonce', nonce);
    }

    document.head.appendChild(style);
}

updateStyle();
export default updateStyle;
