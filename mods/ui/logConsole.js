import { configChangeEmitter, configRead } from '../config.js';
import { showToast } from "./ytUI.js";

const MAX_LINES = 40;
const lines = [];
let container = null;

export function log(...args) {
    try {
        const message = args.map((arg) => String(arg)).join(' ');
        lines.push(message);
        if (lines.length > MAX_LINES) lines.shift();

        appendToDom(message);
        scrollToBottom();
    } catch (e) {
        showToast(e, e.message);
    }
}

// mailbox present mode ;)
let toast = "";
setInterval(() => {
  if (toast !== "") {
    showToast(toast, toast);
  }
}, 5000);


function appendToDom(line) {
    if (!container) return;

    // https://stackoverflow.com/questions/34975218/css-background-for-text-only-not-parent-span-div-body
    const lineBox = document.createElement('div');
    {
        const textSpan = document.createElement("span");
        // textSpan.classList.add("log-line");
        textSpan.textContent = line;

        // Creating a <style> tag does not work. Injecting into 'style[nonce]' does not work.
        // I no longer care. This works.
        textSpan.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        lineBox.appendChild(textSpan);
    }
    container.appendChild(lineBox);
    while (container.childElementCount > MAX_LINES) {
        container.removeChild(container.firstChild);
    }
}

function scrollToBottom() {
    // toast = `scrollHeight = ${container.scrollHeight}, clientHeight = ${container.clientHeight}`;
    // We can't set to container.scrollHeight, as Cobalt will overscroll all text off-screen.
    container.scrollTop = container.scrollHeight - container.clientHeight;
}

function createConsole() {
    if (container) return;

    container = document.createElement('div');
    container.id = 'tizentube-log-console';
    container.style.position = 'absolute';
    container.style.top = '2%';
    container.style.left = '2%';
    container.style.width = '95%';
    container.style.height = '95%';
    container.style.zIndex = '9999';
    // container.style.background = 'rgba(0, 0, 0, 0.5)';
    container.style.color = '#ffffff';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '10px';
    // Don't set padding (= 1em), it breaks scrollToBottom().
    // I'm sure there's a formula to fix it (exclude bottom padding and possibly
    // top from clientHeight), but I cannot be assed.

    // line wrap handling
    container.style.wordBreak = "break-all";  // to avoid cutoff text
    container.style.textIndent = "4ch";
    container.style.paddingLeft = "-4ch";

    container.style.overflow = 'scroll';
    container.style.pointerEvents = 'none';

    for (const line of lines) {
        appendToDom(line);
    }

    document.body.appendChild(container);
    scrollToBottom();
}

function removeConsole() {
    if (!container) return;
    container.remove();
    container = null;
}

// ignore stock yt logs
console.mylog = log;

configChangeEmitter.addEventListener('configChange', (e) => {
    if (e.detail.key === 'enableLogConsole') {
        if (e.detail.value) createConsole();
        else removeConsole();
    }
});

if (configRead('enableLogConsole')) try { createConsole(); } catch (e) { showToast(e, e.message); }

// Capture and log global errors.
function errorText(error) {
    var message;
    if (!error) {
        return "unknown error";
    }
    message = error.stack || error.message || String(error);
    return String(message).slice(0, 600);
}

var previousOnError = window.onerror;
window.onerror = function (message, source, line, column, error) {
    log(
        errorText(error) || String(message) + " at " + source + ":" + line
    );
    if (typeof previousOnError === "function") {
        return previousOnError.apply(this, arguments);
    }
    return false;
};
