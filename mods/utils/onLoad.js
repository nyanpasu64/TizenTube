import { log } from '../ui/logConsole.js'

export function onLoad(callback) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        callback();
    } else {
        let hasRun = false;
        const callbackOnce = () => {
            if (hasRun) {
                log(`{} callbackOnce<${callback.name}>()`);
                return;
            }
            hasRun = true;
            log(`callbackOnce<${callback.name}>() executing ${callback.name}...`);
            return callback();
        };

        // May not fire at all on Switch YouTube.
        window.addEventListener('DOMContentLoaded', callbackOnce);
        window.addEventListener('load', callbackOnce);
    }
}
