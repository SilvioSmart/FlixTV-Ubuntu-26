module.exports = [
"[project]/apps/web/src/components/ChannelSwitcher.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NETWORK_OPTIONS",
    ()=>NETWORK_OPTIONS,
    "default",
    ()=>ChannelSwitcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const NETWORK_OPTIONS = [
    {
        id: "nove",
        label: "Nove",
        description: "Entertainment and prime time",
        themeColor: "#e50914",
        accentColor: "#ff6b6b"
    },
    {
        id: "real-time",
        label: "Real Time",
        description: "Lifestyle, stories, and factual",
        themeColor: "#e4519a",
        accentColor: "#f8a5c8"
    },
    {
        id: "dmax",
        label: "DMAX",
        description: "Motors, discovery, and action",
        themeColor: "#f6b445",
        accentColor: "#ffe08a"
    }
];
const DEFAULT_NETWORK = NETWORK_OPTIONS[0];
function ChannelSwitcher({ activeNetwork = "nove", onNetworkChange, className = "" }) {
    const [selectedNetworkId, setSelectedNetworkId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(activeNetwork);
    const selectedNetwork = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>NETWORK_OPTIONS.find((network)=>network.id === selectedNetworkId) ?? DEFAULT_NETWORK, [
        selectedNetworkId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setSelectedNetworkId(activeNetwork);
    }, [
        activeNetwork
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        document.documentElement.dataset.streamNetwork = selectedNetwork.id;
        document.documentElement.style.setProperty("--stream-theme", selectedNetwork.themeColor);
        document.documentElement.style.setProperty("--stream-accent", selectedNetwork.accentColor);
        onNetworkChange?.(selectedNetwork);
    }, [
        onNetworkChange,
        selectedNetwork
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        "aria-label": "Network channels",
        className: `sticky top-0 z-header border-b border-white/10 bg-canvas-950/90 backdrop-blur-xl ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto flex max-w-content items-center gap-3 px-4 py-3 sm:px-6 lg:px-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "hidden min-w-0 pr-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50 sm:block",
                    children: "Network"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ChannelSwitcher.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex w-full min-w-0 items-center gap-2 overflow-x-auto",
                    children: NETWORK_OPTIONS.map((network)=>{
                        const isActive = network.id === selectedNetwork.id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setSelectedNetworkId(network.id),
                            "aria-pressed": isActive,
                            className: "group relative flex min-w-[136px] shrink-0 flex-col items-start rounded-md border px-4 py-3 text-left transition duration-200 ease-stream-out hover:-translate-y-0.5 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/60 sm:min-w-[168px]",
                            style: {
                                borderColor: isActive ? network.themeColor : "rgba(255,255,255,0.12)",
                                backgroundColor: isActive ? `${network.themeColor}22` : "rgba(255,255,255,0.04)"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    "aria-hidden": "true",
                                    className: "absolute inset-x-3 top-2 h-0.5 rounded-full opacity-0 transition-opacity group-hover:opacity-60",
                                    style: {
                                        backgroundColor: network.themeColor,
                                        opacity: isActive ? 1 : undefined
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/ChannelSwitcher.tsx",
                                    lineNumber: 98,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-base font-black uppercase leading-none text-white sm:text-lg",
                                    children: network.label
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/ChannelSwitcher.tsx",
                                    lineNumber: 106,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mt-1 max-w-full truncate text-xs font-medium text-white/55",
                                    children: network.description
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/ChannelSwitcher.tsx",
                                    lineNumber: 109,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, network.id, true, {
                            fileName: "[project]/apps/web/src/components/ChannelSwitcher.tsx",
                            lineNumber: 87,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ChannelSwitcher.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/components/ChannelSwitcher.tsx",
            lineNumber: 77,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ChannelSwitcher.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/EpgGrid.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EpgGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarClock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-clock.mjs [app-ssr] (ecmascript) <export default as CalendarClock>");
"use client";
;
;
function toDate(value) {
    return value instanceof Date ? value : new Date(value);
}
function formatProgramTime(value) {
    return new Intl.DateTimeFormat("it-IT", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(value);
}
function getProgramProgress(startTime, endTime, now) {
    const startsAt = startTime.getTime();
    const endsAt = endTime.getTime();
    const currentTime = now.getTime();
    const duration = endsAt - startsAt;
    if (duration <= 0 || currentTime < startsAt || currentTime > endsAt) {
        return 0;
    }
    return Math.min(Math.max((currentTime - startsAt) / duration * 100, 0), 100);
}
function isProgramLive(startTime, endTime, now) {
    return startTime.getTime() <= now.getTime() && endTime.getTime() >= now.getTime();
}
function LoadingSkeleton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex gap-3 overflow-hidden",
        children: Array.from({
            length: 5
        }, (_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-36 min-w-[240px] animate-pulse rounded-md border border-white/10 bg-white/[0.06] sm:min-w-[300px]"
            }, index, false, {
                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                lineNumber: 55,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function EpgGrid({ programs = [], isLoading = false, now = new Date(), channelName, emptyMessage = "No upcoming programs available for this channel.", className = "" }) {
    const sortedPrograms = [
        ...programs
    ].sort((firstProgram, secondProgram)=>toDate(firstProgram.startTime).getTime() - toDate(secondProgram.startTime).getTime());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": channelName ? `${channelName} TV guide` : "TV guide",
        className: `rounded-lg border border-white/10 bg-canvas-900 p-4 shadow-rail sm:p-5 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4 flex items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "truncate text-lg font-bold text-white sm:text-xl",
                                children: [
                                    "TV Guide",
                                    channelName ? `: ${channelName}` : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm text-white/55",
                                children: "Live timeline and upcoming programs"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55 sm:flex",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarClock$3e$__["CalendarClock"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            "EPG"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingSkeleton, {}, void 0, false, {
                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                lineNumber: 97,
                columnNumber: 20
            }, this) : null,
            !isLoading && sortedPrograms.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-h-36 items-center justify-center rounded-md border border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "max-w-md text-sm font-medium text-white/55",
                    children: emptyMessage
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                    lineNumber: 101,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                lineNumber: 100,
                columnNumber: 9
            }, this) : null,
            !isLoading && sortedPrograms.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto pb-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex min-w-max gap-3",
                    children: sortedPrograms.map((program)=>{
                        const startTime = toDate(program.startTime);
                        const endTime = toDate(program.endTime);
                        const isLive = isProgramLive(startTime, endTime, now);
                        const progress = getProgramProgress(startTime, endTime, now);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                            className: "relative flex min-h-40 w-[260px] shrink-0 flex-col justify-between overflow-hidden rounded-md border bg-white/[0.05] p-4 transition duration-200 ease-stream-out hover:-translate-y-0.5 hover:bg-white/[0.08] sm:w-[320px]",
                            style: {
                                borderColor: isLive ? "var(--stream-theme, #e50914)" : "rgba(255,255,255,0.1)"
                            },
                            children: [
                                isLive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    "aria-hidden": "true",
                                    className: "absolute inset-x-0 top-0 h-1",
                                    style: {
                                        backgroundColor: "var(--stream-theme, #e50914)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                    lineNumber: 123,
                                    columnNumber: 21
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                                    className: "text-xs font-bold uppercase tracking-[0.14em] text-white/55",
                                                    children: [
                                                        formatProgramTime(startTime),
                                                        " - ",
                                                        formatProgramTime(endTime)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                                    lineNumber: 134,
                                                    columnNumber: 23
                                                }, this),
                                                isLive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black",
                                                    style: {
                                                        backgroundColor: "var(--stream-accent, #ff6b6b)"
                                                    },
                                                    children: "On air"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 25
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                            lineNumber: 133,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "line-clamp-2 text-base font-bold leading-snug text-white",
                                                    children: program.title
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                                    lineNumber: 150,
                                                    columnNumber: 23
                                                }, this),
                                                program.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-2 line-clamp-2 text-sm leading-5 text-white/55",
                                                    children: program.description
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                                    lineNumber: 154,
                                                    columnNumber: 25
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                            lineNumber: 149,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                    lineNumber: 132,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-2 flex items-center justify-between text-xs font-medium text-white/45",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: isLive ? "Progress" : "Scheduled"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                                    lineNumber: 163,
                                                    columnNumber: 23
                                                }, this),
                                                isLive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        Math.round(progress),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                                    lineNumber: 164,
                                                    columnNumber: 33
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                            lineNumber: 162,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-1.5 overflow-hidden rounded-full bg-white/15",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-full rounded-full transition-[width] duration-500 ease-stream-out",
                                                style: {
                                                    width: `${progress}%`,
                                                    backgroundColor: "var(--stream-theme, #e50914)"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                                lineNumber: 167,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                            lineNumber: 166,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                                    lineNumber: 161,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, program.id, true, {
                            fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                            lineNumber: 115,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                    lineNumber: 107,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
                lineNumber: 106,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/EpgGrid.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/lib/platform-config.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BACKEND_ORIGIN",
    ()=>BACKEND_ORIGIN,
    "FRONTEND_ORIGIN",
    ()=>FRONTEND_ORIGIN,
    "VAST_SERVER_ORIGIN",
    ()=>VAST_SERVER_ORIGIN,
    "buildBackendUrl",
    ()=>buildBackendUrl,
    "buildVastTagUrl",
    ()=>buildVastTagUrl
]);
const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ?? "https://www.flixtv.it";
const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "https://admin.flixtv.it";
const VAST_SERVER_ORIGIN = process.env.NEXT_PUBLIC_VAST_SERVER_ORIGIN ?? "https://adsrv.org";
function buildBackendUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return new URL(normalizedPath, BACKEND_ORIGIN).toString();
}
function buildVastTagUrl(params) {
    const url = new URL("/vast", VAST_SERVER_ORIGIN);
    Object.entries(params).forEach(([key, value])=>{
        url.searchParams.set(key, value);
    });
    return url.toString();
}
}),
"[project]/apps/web/src/components/VideoPlayer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VideoPlayer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize.mjs [app-ssr] (ecmascript) <export default as Maximize>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pause.mjs [app-ssr] (ecmascript) <export default as Pause>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.mjs [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$1$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume1$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-1.mjs [app-ssr] (ecmascript) <export default as Volume1>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-2.mjs [app-ssr] (ecmascript) <export default as Volume2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-x.mjs [app-ssr] (ecmascript) <export default as VolumeX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$video$2e$js$2f$dist$2f$video$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/video.js/dist/video.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$platform$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/platform-config.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const WATCH_HISTORY_INTERVAL_MS = 10_000;
function getSourceType(src) {
    return src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4";
}
function formatTime(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return "0:00";
    }
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    const minutes = Math.floor(totalSeconds / 60 % 60);
    const hours = Math.floor(totalSeconds / 3600);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds}`;
    }
    return `${minutes}:${seconds}`;
}
function VideoPlayer({ src, type, title, poster, videoId, vastTagUrl, autoPlay = false, muted = false, className = "" }) {
    const playerId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const videoElementRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const playerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const trackingAbortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const initialVolumeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(muted ? 0 : 0.85);
    const initialPosterRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(poster);
    const initialSrcRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(src);
    const [isReady, setIsReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(autoPlay);
    const [isMuted, setIsMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(muted);
    const [volume, setVolume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(muted ? 0 : 0.85);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [duration, setDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const isLive = type === "live";
    const shouldTrackWatchHistory = type === "vod" && Boolean(videoId);
    const syncFromPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const player = playerRef.current;
        if (!player) {
            return;
        }
        setCurrentTime(player.currentTime() ?? 0);
        setDuration(player.duration() ?? 0);
        setIsMuted(player.muted() ?? false);
        setVolume(player.volume() ?? 0);
        setIsPlaying(!player.paused());
    }, []);
    const togglePlayback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const player = playerRef.current;
        if (!player) {
            return;
        }
        if (player.paused()) {
            void player.play();
            return;
        }
        player.pause();
    }, []);
    const toggleMute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const player = playerRef.current;
        if (!player) {
            return;
        }
        const nextMuted = !player.muted();
        player.muted(nextMuted);
        if (!nextMuted && player.volume() === 0) {
            player.volume(0.65);
        }
        syncFromPlayer();
    }, [
        syncFromPlayer
    ]);
    const updateVolume = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((nextVolume)=>{
        const player = playerRef.current;
        if (!player) {
            return;
        }
        const normalizedVolume = Math.min(Math.max(nextVolume, 0), 1);
        player.volume(normalizedVolume);
        player.muted(normalizedVolume === 0);
        setVolume(normalizedVolume);
        setIsMuted(normalizedVolume === 0);
    }, []);
    const toggleFullscreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const player = playerRef.current;
        if (!player) {
            return;
        }
        if (player.isFullscreen()) {
            player.exitFullscreen();
            return;
        }
        player.requestFullscreen();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!videoElementRef.current || playerRef.current) {
            return;
        }
        const player = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$video$2e$js$2f$dist$2f$video$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(videoElementRef.current, {
            autoplay: autoPlay,
            controls: false,
            fluid: true,
            liveui: isLive,
            muted,
            playsinline: true,
            preload: isLive ? "auto" : "metadata",
            poster: initialPosterRef.current,
            responsive: true,
            sources: [
                {
                    src: initialSrcRef.current,
                    type: getSourceType(initialSrcRef.current)
                }
            ],
            html5: {
                vhs: {
                    enableLowInitialPlaylist: true,
                    smoothQualityChange: true,
                    overrideNative: true
                }
            }
        });
        playerRef.current = player;
        player.ready(()=>{
            setIsReady(true);
            player.volume(initialVolumeRef.current);
            syncFromPlayer();
        });
        player.on("play", syncFromPlayer);
        player.on("pause", syncFromPlayer);
        player.on("volumechange", syncFromPlayer);
        player.on("timeupdate", syncFromPlayer);
        player.on("durationchange", syncFromPlayer);
        const handleFullscreenChange = ()=>{
            setIsFullscreen(Boolean(player.isFullscreen()));
        };
        player.on("fullscreenchange", handleFullscreenChange);
        return ()=>{
            trackingAbortRef.current?.abort();
            player.off("play", syncFromPlayer);
            player.off("pause", syncFromPlayer);
            player.off("volumechange", syncFromPlayer);
            player.off("timeupdate", syncFromPlayer);
            player.off("durationchange", syncFromPlayer);
            player.off("fullscreenchange", handleFullscreenChange);
            player.dispose();
            playerRef.current = null;
        };
    }, [
        autoPlay,
        isLive,
        muted,
        syncFromPlayer
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const player = playerRef.current;
        if (!player) {
            return;
        }
        player.src({
            src,
            type: getSourceType(src)
        });
        if (poster) {
            player.poster(poster);
        }
    }, [
        poster,
        src
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!shouldTrackWatchHistory) {
            return;
        }
        const intervalId = window.setInterval(()=>{
            const player = playerRef.current;
            if (!player || player.paused()) {
                return;
            }
            const playbackTime = Math.floor(player.currentTime() ?? 0);
            trackingAbortRef.current?.abort();
            trackingAbortRef.current = new AbortController();
            void fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$platform$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildBackendUrl"])("/api/watch-history"), {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...vastTagUrl ? {
                        "X-Vast-Tag": vastTagUrl
                    } : {}
                },
                body: JSON.stringify({
                    videoId,
                    currentTime: playbackTime
                }),
                keepalive: true,
                signal: trackingAbortRef.current.signal
            }).catch((error)=>{
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                console.error("Unable to update watch history", error);
            });
        }, WATCH_HISTORY_INTERVAL_MS);
        return ()=>{
            window.clearInterval(intervalId);
            trackingAbortRef.current?.abort();
        };
    }, [
        shouldTrackWatchHistory,
        vastTagUrl,
        videoId
    ]);
    const VolumeIcon = isMuted || volume === 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__["VolumeX"] : volume < 0.5 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$1$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume1$3e$__["Volume1"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"];
    const progressValue = duration > 0 ? Math.min(currentTime / duration * 100, 100) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": title ? `${title} video player` : "Video player",
        className: `group relative overflow-hidden rounded-lg bg-black shadow-player ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                ref: videoElementRef,
                id: playerId,
                className: "video-js h-full min-h-[220px] w-full bg-black object-contain",
                playsInline: true
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                lineNumber: 284,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 opacity-100 transition-opacity duration-300 group-hover:opacity-100"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                lineNumber: 291,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute left-3 right-3 top-3 flex items-start justify-between gap-3 sm:left-4 sm:right-4 sm:top-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0",
                        children: title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "truncate text-sm font-semibold text-white drop-shadow sm:text-base",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                            lineNumber: 296,
                            columnNumber: 13
                        }, this) : null
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                        lineNumber: 294,
                        columnNumber: 9
                    }, this),
                    isLive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "inline-flex shrink-0 items-center gap-2 rounded-full border border-red-400/40 bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "h-2 w-2 rounded-full bg-white"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                lineNumber: 304,
                                columnNumber: 13
                            }, this),
                            "Live"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                        lineNumber: 303,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                lineNumber: 293,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-x-0 bottom-0 flex flex-col gap-3 p-3 sm:p-4",
                children: [
                    !isLive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 text-xs font-medium text-white/80",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-12 tabular-nums",
                                children: formatTime(currentTime)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                lineNumber: 313,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                "aria-hidden": "true",
                                className: "h-1.5 flex-1 overflow-hidden rounded-full bg-white/20",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-full rounded-full bg-stream-red transition-[width] duration-200",
                                    style: {
                                        width: `${progressValue}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                    lineNumber: 318,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                lineNumber: 314,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-12 text-right tabular-nums",
                                children: formatTime(duration)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                lineNumber: 323,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                        lineNumber: 312,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/45 px-3 py-2 text-white backdrop-blur-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: togglePlayback,
                                        disabled: !isReady,
                                        "aria-label": isPlaying ? "Pause video" : "Play video",
                                        className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50",
                                        children: isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                            size: 18,
                                            fill: "currentColor"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                            lineNumber: 336,
                                            columnNumber: 28
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                            size: 18,
                                            fill: "currentColor"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                            lineNumber: 336,
                                            columnNumber: 70
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                        lineNumber: 329,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: toggleMute,
                                        disabled: !isReady,
                                        "aria-label": isMuted ? "Unmute video" : "Mute video",
                                        className: "inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(VolumeIcon, {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                            lineNumber: 346,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "sr-only",
                                        htmlFor: `${playerId}-volume`,
                                        children: "Volume"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                        lineNumber: 349,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: `${playerId}-volume`,
                                        type: "range",
                                        min: "0",
                                        max: "1",
                                        step: "0.01",
                                        value: isMuted ? 0 : volume,
                                        disabled: !isReady,
                                        onChange: (event)=>updateVolume(Number(event.currentTarget.value)),
                                        className: "h-1.5 w-24 accent-white disabled:opacity-50 sm:w-32"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                        lineNumber: 352,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                lineNumber: 328,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: toggleFullscreen,
                                disabled: !isReady,
                                "aria-label": isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
                                className: "inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize$3e$__["Maximize"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                    lineNumber: 372,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                                lineNumber: 365,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                        lineNumber: 327,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
                lineNumber: 310,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/VideoPlayer.tsx",
        lineNumber: 280,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/VodCarousel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VodCarousel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.mjs [app-ssr] (ecmascript) <export default as Play>");
"use client";
;
;
function VodCarousel({ title, items, emptyMessage = "No titles available in this row.", className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: className,
        "aria-labelledby": `${title.toLowerCase().replaceAll(" ", "-")}-heading`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 flex items-end justify-between gap-4 px-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: `${title.toLowerCase().replaceAll(" ", "-")}-heading`,
                        className: "text-xl font-black text-white sm:text-2xl",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "hidden text-xs font-semibold uppercase tracking-[0.16em] text-white/40 sm:inline",
                        children: "Stream-9"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            items.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-md border border-dashed border-white/15 bg-white/[0.03] px-5 py-8 text-sm font-medium text-white/55",
                children: emptyMessage
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto pb-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex min-w-max gap-3 sm:gap-4",
                    children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                            className: "group w-[188px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.05] transition duration-200 ease-stream-out hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] sm:w-[236px] lg:w-[260px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative aspect-video overflow-hidden bg-canvas-800",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: item.thumbnailUrl,
                                            alt: "",
                                            loading: "lazy",
                                            className: "h-full w-full object-cover transition duration-500 ease-stream-out group-hover:scale-105"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                            lineNumber: 51,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                            lineNumber: 57,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            "aria-label": `Play ${item.title}`,
                                            className: "absolute bottom-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-black opacity-95 transition group-hover:scale-105",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                size: 16,
                                                fill: "currentColor"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                                lineNumber: 63,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                            lineNumber: 58,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur",
                                            children: item.duration
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                            lineNumber: 65,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                    lineNumber: 50,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2 p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[11px] font-bold uppercase tracking-[0.16em] text-white/40",
                                            children: item.category
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                            lineNumber: 71,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "line-clamp-2 min-h-10 text-sm font-bold leading-5 text-white sm:text-base",
                                            children: item.title
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                            lineNumber: 74,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "line-clamp-2 text-xs leading-5 text-white/50 sm:text-sm",
                                            children: item.description
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                            lineNumber: 77,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                                    lineNumber: 70,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, item.id, true, {
                            fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                            lineNumber: 46,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                    lineNumber: 44,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
                lineNumber: 43,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/VodCarousel.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ChannelSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ChannelSwitcher.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$EpgGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/EpgGrid.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$VideoPlayer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/VideoPlayer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$VodCarousel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/VodCarousel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$platform$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/platform-config.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const FALLBACK_CHANNELS = {
    nove: {
        id: "fallback-nove",
        name: "Nove",
        logoUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=320&q=80",
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    },
    "real-time": {
        id: "fallback-real-time",
        name: "Real Time",
        logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=320&q=80",
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    },
    dmax: {
        id: "fallback-dmax",
        name: "DMAX",
        logoUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=80",
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    }
};
const DEFAULT_FALLBACK_CHANNEL = FALLBACK_CHANNELS.nove;
const EMPTY_EPG = [];
const VOD_ITEMS = [
    {
        id: "vod-1",
        title: "Cash or Trash: la notte delle occasioni",
        description: "Oggetti rari, trattative serrate e collezionisti pronti a rischiare.",
        thumbnailUrl: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=900&q=80",
        category: "Nove",
        duration: "48m"
    },
    {
        id: "vod-2",
        title: "Primo Appuntamento: storie inaspettate",
        description: "Nuovi incontri, tavoli pieni di tensione e svolte romantiche.",
        thumbnailUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
        category: "Real Time",
        duration: "52m"
    },
    {
        id: "vod-3",
        title: "Airport Security: confini caldi",
        description: "Controlli, intuizioni e casi ad alta pressione negli scali internazionali.",
        thumbnailUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
        category: "DMAX",
        duration: "44m"
    },
    {
        id: "vod-4",
        title: "Fratelli di Crozza: best of",
        description: "Satira, imitazioni e i momenti piu taglienti della stagione.",
        thumbnailUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80",
        category: "Nove",
        duration: "66m"
    },
    {
        id: "vod-5",
        title: "Vite al limite: il nuovo percorso",
        description: "Una trasformazione personale raccontata con delicatezza e realismo.",
        thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
        category: "Real Time",
        duration: "1h 26m"
    },
    {
        id: "vod-6",
        title: "Motori impossibili",
        description: "Officine, restauri estremi e test su strada senza margine di errore.",
        thumbnailUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
        category: "DMAX",
        duration: "41m"
    }
];
const RECENT_EPISODES = [
    ...VOD_ITEMS
].reverse();
const CATEGORY_ITEMS = [
    {
        id: "cat-nove",
        title: "Nove Originals",
        description: "Talk, comedy, crime e prime serate editoriali.",
        thumbnailUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
        category: "Category",
        duration: "24 titles"
    },
    {
        id: "cat-real-time",
        title: "Real Time Stories",
        description: "Lifestyle, relazioni, cucina e storie quotidiane.",
        thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
        category: "Category",
        duration: "31 titles"
    },
    {
        id: "cat-dmax",
        title: "DMAX Action",
        description: "Motori, survival, factual e avventure ad alta energia.",
        thumbnailUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
        category: "Category",
        duration: "18 titles"
    }
];
function matchesNetwork(channel, networkId) {
    const normalizedName = channel.name.toLowerCase().replaceAll(" ", "-");
    return normalizedName.includes(networkId);
}
function getFallbackChannel(networkId) {
    return FALLBACK_CHANNELS[networkId] ?? DEFAULT_FALLBACK_CHANNEL;
}
function getFallbackEpg(channelId) {
    const now = new Date();
    const startOfCurrentProgram = new Date(now);
    startOfCurrentProgram.setMinutes(now.getMinutes() - 25);
    const endOfCurrentProgram = new Date(now);
    endOfCurrentProgram.setMinutes(now.getMinutes() + 35);
    const secondStart = new Date(endOfCurrentProgram);
    const secondEnd = new Date(secondStart);
    secondEnd.setMinutes(secondStart.getMinutes() + 55);
    const thirdStart = new Date(secondEnd);
    const thirdEnd = new Date(thirdStart);
    thirdEnd.setMinutes(thirdStart.getMinutes() + 60);
    return [
        {
            id: `${channelId}-now`,
            channelId,
            title: "In onda adesso",
            description: "Il programma live corrente del network selezionato.",
            startTime: startOfCurrentProgram,
            endTime: endOfCurrentProgram
        },
        {
            id: `${channelId}-next`,
            channelId,
            title: "Prossimo programma",
            description: "La prossima fascia del palinsesto di oggi.",
            startTime: secondStart,
            endTime: secondEnd
        },
        {
            id: `${channelId}-later`,
            channelId,
            title: "Prima serata",
            description: "Una selezione premium per il pubblico serale.",
            startTime: thirdStart,
            endTime: thirdEnd
        }
    ];
}
function HomePage() {
    const [activeNetwork, setActiveNetwork] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ChannelSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NETWORK_OPTIONS"][0]);
    const [channels, setChannels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [epgPrograms, setEpgPrograms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(EMPTY_EPG);
    const [isChannelsLoading, setIsChannelsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isEpgLoading, setIsEpgLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const activeChannel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return channels.find((channel)=>matchesNetwork(channel, activeNetwork.id)) ?? getFallbackChannel(activeNetwork.id);
    }, [
        activeNetwork.id,
        channels
    ]);
    const filteredMostWatched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return VOD_ITEMS.filter((item)=>item.category.toLowerCase().replaceAll(" ", "-") === activeNetwork.id);
    }, [
        activeNetwork.id
    ]);
    const filteredRecentEpisodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return RECENT_EPISODES.filter((item)=>item.category.toLowerCase().replaceAll(" ", "-") === activeNetwork.id);
    }, [
        activeNetwork.id
    ]);
    const handleNetworkChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((network)=>{
        setActiveNetwork(network);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController();
        async function loadChannels() {
            setIsChannelsLoading(true);
            try {
                const response = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$platform$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildBackendUrl"])("/api/channels"), {
                    credentials: "include",
                    signal: controller.signal
                });
                if (!response.ok) {
                    throw new Error("Unable to load channels");
                }
                const data = await response.json();
                setChannels(data.channels ?? []);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                setChannels([]);
            } finally{
                setIsChannelsLoading(false);
            }
        }
        void loadChannels();
        return ()=>controller.abort();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController();
        async function loadEpg() {
            if (!activeChannel) {
                setEpgPrograms(EMPTY_EPG);
                return;
            }
            setIsEpgLoading(true);
            try {
                const response = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$platform$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildBackendUrl"])(`/api/epg?channelId=${encodeURIComponent(activeChannel.id)}`), {
                    credentials: "include",
                    signal: controller.signal
                });
                if (!response.ok) {
                    throw new Error("Unable to load EPG");
                }
                const data = await response.json();
                setEpgPrograms(data.programs ?? []);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                setEpgPrograms(getFallbackEpg(activeChannel.id));
            } finally{
                setIsEpgLoading(false);
            }
        }
        void loadEpg();
        return ()=>controller.abort();
    }, [
        activeChannel
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-viewport bg-canvas-950 text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ChannelSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                activeNetwork: activeNetwork.id,
                onNetworkChange: handleNetworkChange
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/page.tsx",
                lineNumber: 287,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto flex max-w-content flex-col gap-8 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-4 flex flex-wrap items-end justify-between gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-bold uppercase tracking-[0.18em] text-white/45",
                                                        children: "Live TV"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                                        lineNumber: 294,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                        className: "mt-1 truncate text-2xl font-black text-white sm:text-4xl",
                                                        children: activeChannel.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                                        lineNumber: 297,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/page.tsx",
                                                lineNumber: 293,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black",
                                                style: {
                                                    backgroundColor: "var(--stream-accent, #ff6b6b)"
                                                },
                                                children: isChannelsLoading ? "Loading" : activeNetwork.label
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/page.tsx",
                                                lineNumber: 301,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                        lineNumber: 292,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$VideoPlayer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        src: activeChannel.streamUrl,
                                        type: "live",
                                        title: `${activeChannel.name} Live`,
                                        poster: activeChannel.logoUrl,
                                        vastTagUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$platform$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildVastTagUrl"])({
                                            placement: "live",
                                            channelId: activeChannel.id,
                                            network: activeNetwork.id
                                        }),
                                        muted: true,
                                        className: "aspect-video"
                                    }, activeChannel.id, false, {
                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                        lineNumber: 309,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/page.tsx",
                                lineNumber: 291,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                className: "rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-5 flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: activeChannel.logoUrl,
                                                alt: "",
                                                className: "h-14 w-14 rounded-md object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/page.tsx",
                                                lineNumber: 327,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "truncate text-lg font-black text-white",
                                                        children: activeNetwork.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                                        lineNumber: 333,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-white/50",
                                                        children: activeNetwork.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/page.tsx",
                                                lineNumber: 332,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                        lineNumber: 326,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3 text-sm leading-6 text-white/60",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Streaming live, guida TV e contenuti on demand in una sola esperienza responsive."
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/page.tsx",
                                                lineNumber: 338,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-md border border-white/10 bg-white/[0.04] p-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs font-bold uppercase tracking-[0.16em] text-white/40",
                                                        children: "Active stream"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-1 truncate text-sm font-semibold text-white/80",
                                                        children: activeChannel.streamUrl
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                                        lineNumber: 345,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/page.tsx",
                                                lineNumber: 341,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/page.tsx",
                                        lineNumber: 337,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/page.tsx",
                                lineNumber: 325,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/page.tsx",
                        lineNumber: 290,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$EpgGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        channelName: activeChannel.name,
                        programs: epgPrograms,
                        isLoading: isEpgLoading,
                        emptyMessage: "No programs scheduled for today on this channel."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/page.tsx",
                        lineNumber: 353,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$VodCarousel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                title: "Most Watched",
                                items: filteredMostWatched.length > 0 ? filteredMostWatched : VOD_ITEMS
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/page.tsx",
                                lineNumber: 361,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$VodCarousel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                title: "Recent Episodes",
                                items: filteredRecentEpisodes.length > 0 ? filteredRecentEpisodes : RECENT_EPISODES
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/page.tsx",
                                lineNumber: 365,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$VodCarousel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                title: "Categories",
                                items: CATEGORY_ITEMS
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/page.tsx",
                                lineNumber: 369,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/page.tsx",
                        lineNumber: 360,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/page.tsx",
                lineNumber: 289,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/page.tsx",
        lineNumber: 286,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_09g4nv4._.js.map