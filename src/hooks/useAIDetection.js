import { useState, useEffect, useRef } from 'react';

export const useAIDetection = (onFocusLost) => {
    const [metrics, setMetrics] = useState({
        tabSwitches: 0,
        pasteEvents: 0,
        idleTime: 0
    });

    const [isWarningActive, setIsWarningActive] = useState(false);
    const cbRef = useRef(onFocusLost);
    const lastWarningTime = useRef(0);

    useEffect(() => {
        cbRef.current = onFocusLost;
    }, [onFocusLost]);

    useEffect(() => {

        const triggerWarning = (type) => {
            const now = Date.now();
            // Debounce: prevent duplicate increments within 500ms
            if (now - lastWarningTime.current < 500) return;
            lastWarningTime.current = now;

            setMetrics((prev) => ({
                ...prev,
                tabSwitches: type === 'tabSwitch' ? prev.tabSwitches + 1 : prev.tabSwitches,
                pasteEvents: type === 'paste' ? prev.pasteEvents + 1 : prev.pasteEvents,
            }));

            setIsWarningActive(true);

            if (cbRef.current) {
                cbRef.current(type);
            }

            setTimeout(() => {
                setIsWarningActive(false);
            }, 3000);
        };

        // Primary detection: visibilitychange is the most reliable for tab switches
        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerWarning('tabSwitch');
            }
        };

        // Secondary detection: window blur catches Alt+Tab and window switches
        const handleBlur = () => {
            // Only trigger if the document is also hidden (real tab switch)
            // or if focus genuinely left the browser window
            setTimeout(() => {
                if (document.hidden || !document.hasFocus()) {
                    triggerWarning('tabSwitch');
                }
            }, 100);
        };

        const handlePaste = (e) => {
            triggerWarning('paste');
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        // capture phase helps detect paste inside Monaco editor
        document.addEventListener("paste", handlePaste, { capture: true });
        window.addEventListener("paste", handlePaste, { capture: true });

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("paste", handlePaste, { capture: true });
            window.removeEventListener("paste", handlePaste, { capture: true });
        };

    }, []);

    return { metrics, isWarningActive };
};