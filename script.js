// ==UserScript==
// @name        Glassdoor paywall removal
// @namespace   Violentmonkey Scripts
// @include     http*://*glassdoor.*
// @grant       none
// @version     1.0
// @author      -
// @description 4/10/2025, 5:37:03 PM
// ==/UserScript==
(function () {
    'use strict';

    // Function to remove paywall elements
    function removePaywall() {
        const body = document.querySelector('body');
        const paywall = document.getElementById('HardsellOverlay');

        if (body) {
            body.style.removeProperty('height');
            body.style.removeProperty('overflow');
            body.style.removeProperty('position');
        }

        if (paywall) {
            paywall.remove();
            console.log('Paywall removed');
            return true; // Indicates paywall was found and removed
        }

        return false; // Indicates paywall wasn't found
    }

    // Initial check
    let checkInterval = setInterval(() => {
        if (removePaywall()) {
            clearInterval(checkInterval);
        }
    }, 500);

    // For SPA navigation changes, we need to observe DOM changes
    const observeSPANavigation = () => {
        // Clear any existing interval
        if (checkInterval) clearInterval(checkInterval);

        // Start new check interval
        checkInterval = setInterval(() => {
            if (removePaywall()) {
                clearInterval(checkInterval);
            }
        }, 500);
    };

    // Observe SPA navigation using MutationObserver
    const observer = new MutationObserver((mutations) => {
        // Check if the body content has changed significantly
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                observeSPANavigation();
                break;
            }
        }
    });

    // Start observing the body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also observe for history API changes (common in SPAs)
    const pushState = history.pushState;
    history.pushState = function() {
        pushState.apply(history, arguments);
        observeSPANavigation();
    };

    const replaceState = history.replaceState;
    history.replaceState = function() {
        replaceState.apply(history, arguments);
        observeSPANavigation();
    };

    // Handle popstate events (back/forward navigation)
    window.addEventListener('popstate', observeSPANavigation);
})();
