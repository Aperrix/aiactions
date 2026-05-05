import { execFile, spawn } from "child_process";
import { createHash, randomUUID } from "crypto";
import * as r from "fs";
import { createWriteStream, realpathSync } from "fs";
import { appendFile, copyFile, mkdir, open, readFile, readdir, rename, rm, rmdir, stat, symlink, unlink, writeFile } from "fs/promises";
import { createRequire } from "module";
import { homedir, tmpdir, userInfo } from "os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "path";
import { createInterface } from "readline";
import { fileURLToPath } from "url";
import { once, setMaxListeners } from "events";
import { cwd } from "process";
import { promisify } from "util";
import { accessSync, constants } from "node:fs";
import { delimiter, isAbsolute as isAbsolute$1, join as join$1 } from "node:path";
//#region ../../../node_modules/.bun/@anthropic-ai+claude-agent-sdk@0.2.128+68a1e3a0c4588df3/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs
var wI = Object.create;
var { getPrototypeOf: BI, defineProperty: XY, getOwnPropertyNames: qI } = Object;
var DI = Object.prototype.hasOwnProperty;
function FI($) {
	return this[$];
}
var jI, LI, SJ = ($, X, J) => {
	var W = $ != null && typeof $ === "object";
	if (W) {
		var Q = X ? jI ??= /* @__PURE__ */ new WeakMap() : LI ??= /* @__PURE__ */ new WeakMap(), Y = Q.get($);
		if (Y) return Y;
	}
	J = $ != null ? wI(BI($)) : {};
	let z = X || !$ || !$.__esModule ? XY(J, "default", {
		value: $,
		enumerable: !0
	}) : J;
	for (let G of qI($)) if (!DI.call(z, G)) XY(z, G, {
		get: FI.bind($, G),
		enumerable: !0
	});
	if (W) Q.set($, z);
	return z;
};
var M = ($, X) => () => (X || $((X = { exports: {} }).exports, X), X.exports);
var MI = ($) => $;
function AI($, X) {
	this[$] = MI.bind(null, X);
}
var D1 = ($, X) => {
	for (var J in X) XY($, J, {
		get: X[J],
		enumerable: !0,
		configurable: !0,
		set: AI.bind(X, J)
	});
};
var II = Symbol.dispose || Symbol.for("Symbol.dispose"), ZI = Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose"), q$ = ($, X, J) => {
	if (X != null) {
		if (typeof X !== "object" && typeof X !== "function") throw TypeError("Object expected to be assigned to \"using\" declaration");
		var W;
		if (J) W = X[ZI];
		if (W === void 0) W = X[II];
		if (typeof W !== "function") throw TypeError("Object not disposable");
		$.push([
			J,
			W,
			X
		]);
	} else if (J) $.push([J]);
	return X;
}, D$ = ($, X, J) => {
	var W = typeof SuppressedError === "function" ? SuppressedError : function(z, G, H, U) {
		return U = Error(H), U.name = "SuppressedError", U.error = z, U.suppressed = G, U;
	}, Q = (z) => X = J ? new W(z, X, "An error was suppressed during disposal") : (J = !0, z), Y = (z) => {
		while (z = $.pop()) try {
			var G = z[1] && z[1].call(z[2]);
			if (z[0]) return Promise.resolve(G).then(Y, (H) => (Q(H), Y()));
		} catch (H) {
			Q(H);
		}
		if (J) throw X;
	};
	return Y();
};
var aN = M((oN) => {
	Object.defineProperty(oN, "__esModule", { value: !0 });
	oN._globalThis = void 0;
	oN._globalThis = typeof globalThis === "object" ? globalThis : global;
});
var sN = M((S1) => {
	var vR = S1 && S1.__createBinding || (Object.create ? function($, X, J, W) {
		if (W === void 0) W = J;
		Object.defineProperty($, W, {
			enumerable: !0,
			get: function() {
				return X[J];
			}
		});
	} : function($, X, J, W) {
		if (W === void 0) W = J;
		$[W] = X[J];
	}), CR = S1 && S1.__exportStar || function($, X) {
		for (var J in $) if (J !== "default" && !Object.prototype.hasOwnProperty.call(X, J)) vR(X, $, J);
	};
	Object.defineProperty(S1, "__esModule", { value: !0 });
	CR(aN(), S1);
});
var eN = M((v1) => {
	var kR = v1 && v1.__createBinding || (Object.create ? function($, X, J, W) {
		if (W === void 0) W = J;
		Object.defineProperty($, W, {
			enumerable: !0,
			get: function() {
				return X[J];
			}
		});
	} : function($, X, J, W) {
		if (W === void 0) W = J;
		$[W] = X[J];
	}), _R = v1 && v1.__exportStar || function($, X) {
		for (var J in $) if (J !== "default" && !Object.prototype.hasOwnProperty.call(X, J)) kR(X, $, J);
	};
	Object.defineProperty(v1, "__esModule", { value: !0 });
	_R(sN(), v1);
});
var rY = M(($O) => {
	Object.defineProperty($O, "__esModule", { value: !0 });
	$O.VERSION = void 0;
	$O.VERSION = "1.9.0";
});
var zO = M((WO) => {
	Object.defineProperty(WO, "__esModule", { value: !0 });
	WO.isCompatible = WO._makeCompatibilityCheck = void 0;
	var xR = rY(), JO = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
	function QO($) {
		let X = new Set([$]), J = /* @__PURE__ */ new Set(), W = $.match(JO);
		if (!W) return () => !1;
		let Q = {
			major: +W[1],
			minor: +W[2],
			patch: +W[3],
			prerelease: W[4]
		};
		if (Q.prerelease != null) return function(H) {
			return H === $;
		};
		function Y(G) {
			return J.add(G), !1;
		}
		function z(G) {
			return X.add(G), !0;
		}
		return function(H) {
			if (X.has(H)) return !0;
			if (J.has(H)) return !1;
			let U = H.match(JO);
			if (!U) return Y(H);
			let K = {
				major: +U[1],
				minor: +U[2],
				patch: +U[3],
				prerelease: U[4]
			};
			if (K.prerelease != null) return Y(H);
			if (Q.major !== K.major) return Y(H);
			if (Q.major === 0) {
				if (Q.minor === K.minor && Q.patch <= K.patch) return z(H);
				return Y(H);
			}
			if (Q.minor <= K.minor) return z(H);
			return Y(H);
		};
	}
	WO._makeCompatibilityCheck = QO;
	WO.isCompatible = QO(xR.VERSION);
});
var C1 = M((GO) => {
	Object.defineProperty(GO, "__esModule", { value: !0 });
	GO.unregisterGlobal = GO.getGlobal = GO.registerGlobal = void 0;
	var fR = eN(), Z0 = rY(), yR = zO(), gR = Z0.VERSION.split(".")[0], L9 = Symbol.for(`opentelemetry.js.api.${gR}`), M9 = fR._globalThis;
	function hR($, X, J, W = !1) {
		var Q;
		let Y = M9[L9] = (Q = M9[L9]) !== null && Q !== void 0 ? Q : { version: Z0.VERSION };
		if (!W && Y[$]) {
			let z = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${$}`);
			return J.error(z.stack || z.message), !1;
		}
		if (Y.version !== Z0.VERSION) {
			let z = Error(`@opentelemetry/api: Registration of version v${Y.version} for ${$} does not match previously registered API v${Z0.VERSION}`);
			return J.error(z.stack || z.message), !1;
		}
		return Y[$] = X, J.debug(`@opentelemetry/api: Registered a global for ${$} v${Z0.VERSION}.`), !0;
	}
	GO.registerGlobal = hR;
	function uR($) {
		var X, J;
		let W = (X = M9[L9]) === null || X === void 0 ? void 0 : X.version;
		if (!W || !(0, yR.isCompatible)(W)) return;
		return (J = M9[L9]) === null || J === void 0 ? void 0 : J[$];
	}
	GO.getGlobal = uR;
	function mR($, X) {
		X.debug(`@opentelemetry/api: Unregistering a global for ${$} v${Z0.VERSION}.`);
		let J = M9[L9];
		if (J) delete J[$];
	}
	GO.unregisterGlobal = mR;
});
var NO = M((KO) => {
	Object.defineProperty(KO, "__esModule", { value: !0 });
	KO.DiagComponentLogger = void 0;
	var dR = C1();
	class UO {
		constructor($) {
			this._namespace = $.namespace || "DiagComponentLogger";
		}
		debug(...$) {
			return A9("debug", this._namespace, $);
		}
		error(...$) {
			return A9("error", this._namespace, $);
		}
		info(...$) {
			return A9("info", this._namespace, $);
		}
		warn(...$) {
			return A9("warn", this._namespace, $);
		}
		verbose(...$) {
			return A9("verbose", this._namespace, $);
		}
	}
	KO.DiagComponentLogger = UO;
	function A9($, X, J) {
		let W = (0, dR.getGlobal)("diag");
		if (!W) return;
		return J.unshift(X), W[$](...J);
	}
});
var B7 = M((OO) => {
	Object.defineProperty(OO, "__esModule", { value: !0 });
	OO.DiagLogLevel = void 0;
	(function($) {
		$[$.NONE = 0] = "NONE", $[$.ERROR = 30] = "ERROR", $[$.WARN = 50] = "WARN", $[$.INFO = 60] = "INFO", $[$.DEBUG = 70] = "DEBUG", $[$.VERBOSE = 80] = "VERBOSE", $[$.ALL = 9999] = "ALL";
	})(OO.DiagLogLevel || (OO.DiagLogLevel = {}));
});
var qO = M((wO) => {
	Object.defineProperty(wO, "__esModule", { value: !0 });
	wO.createLogLevelDiagLogger = void 0;
	var w4 = B7();
	function iR($, X) {
		if ($ < w4.DiagLogLevel.NONE) $ = w4.DiagLogLevel.NONE;
		else if ($ > w4.DiagLogLevel.ALL) $ = w4.DiagLogLevel.ALL;
		X = X || {};
		function J(W, Q) {
			let Y = X[W];
			if (typeof Y === "function" && $ >= Q) return Y.bind(X);
			return function() {};
		}
		return {
			error: J("error", w4.DiagLogLevel.ERROR),
			warn: J("warn", w4.DiagLogLevel.WARN),
			info: J("info", w4.DiagLogLevel.INFO),
			debug: J("debug", w4.DiagLogLevel.DEBUG),
			verbose: J("verbose", w4.DiagLogLevel.VERBOSE)
		};
	}
	wO.createLogLevelDiagLogger = iR;
});
var k1 = M((FO) => {
	Object.defineProperty(FO, "__esModule", { value: !0 });
	FO.DiagAPI = void 0;
	var nR = NO(), rR = qO(), DO = B7(), q7 = C1(), oR = "diag";
	class tY {
		constructor() {
			function $(W) {
				return function(...Q) {
					let Y = (0, q7.getGlobal)("diag");
					if (!Y) return;
					return Y[W](...Q);
				};
			}
			let X = this, J = (W, Q = { logLevel: DO.DiagLogLevel.INFO }) => {
				var Y, z, G;
				if (W === X) {
					let K = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
					return X.error((Y = K.stack) !== null && Y !== void 0 ? Y : K.message), !1;
				}
				if (typeof Q === "number") Q = { logLevel: Q };
				let H = (0, q7.getGlobal)("diag"), U = (0, rR.createLogLevelDiagLogger)((z = Q.logLevel) !== null && z !== void 0 ? z : DO.DiagLogLevel.INFO, W);
				if (H && !Q.suppressOverrideMessage) {
					let K = (G = Error().stack) !== null && G !== void 0 ? G : "<failed to generate stacktrace>";
					H.warn(`Current logger will be overwritten from ${K}`), U.warn(`Current logger will overwrite one already registered from ${K}`);
				}
				return (0, q7.registerGlobal)("diag", U, X, !0);
			};
			X.setLogger = J, X.disable = () => {
				(0, q7.unregisterGlobal)(oR, X);
			}, X.createComponentLogger = (W) => {
				return new nR.DiagComponentLogger(W);
			}, X.verbose = $("verbose"), X.debug = $("debug"), X.info = $("info"), X.warn = $("warn"), X.error = $("error");
		}
		static instance() {
			if (!this._instance) this._instance = new tY();
			return this._instance;
		}
	}
	FO.DiagAPI = tY;
});
var AO = M((LO) => {
	Object.defineProperty(LO, "__esModule", { value: !0 });
	LO.BaggageImpl = void 0;
	class b0 {
		constructor($) {
			this._entries = $ ? new Map($) : /* @__PURE__ */ new Map();
		}
		getEntry($) {
			let X = this._entries.get($);
			if (!X) return;
			return Object.assign({}, X);
		}
		getAllEntries() {
			return Array.from(this._entries.entries()).map(([$, X]) => [$, X]);
		}
		setEntry($, X) {
			let J = new b0(this._entries);
			return J._entries.set($, X), J;
		}
		removeEntry($) {
			let X = new b0(this._entries);
			return X._entries.delete($), X;
		}
		removeEntries(...$) {
			let X = new b0(this._entries);
			for (let J of $) X._entries.delete(J);
			return X;
		}
		clear() {
			return new b0();
		}
	}
	LO.BaggageImpl = b0;
});
var bO = M((IO) => {
	Object.defineProperty(IO, "__esModule", { value: !0 });
	IO.baggageEntryMetadataSymbol = void 0;
	IO.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
});
var aY = M((RO) => {
	Object.defineProperty(RO, "__esModule", { value: !0 });
	RO.baggageEntryMetadataFromString = RO.createBaggage = void 0;
	var tR = k1(), aR = AO(), sR = bO(), eR = tR.DiagAPI.instance();
	function $P($ = {}) {
		return new aR.BaggageImpl(new Map(Object.entries($)));
	}
	RO.createBaggage = $P;
	function XP($) {
		if (typeof $ !== "string") eR.error(`Cannot create baggage metadata from unknown type: ${typeof $}`), $ = "";
		return {
			__TYPE__: sR.baggageEntryMetadataSymbol,
			toString() {
				return $;
			}
		};
	}
	RO.baggageEntryMetadataFromString = XP;
});
var I9 = M((EO) => {
	Object.defineProperty(EO, "__esModule", { value: !0 });
	EO.ROOT_CONTEXT = EO.createContextKey = void 0;
	function QP($) {
		return Symbol.for($);
	}
	EO.createContextKey = QP;
	class D7 {
		constructor($) {
			let X = this;
			X._currentContext = $ ? new Map($) : /* @__PURE__ */ new Map(), X.getValue = (J) => X._currentContext.get(J), X.setValue = (J, W) => {
				let Q = new D7(X._currentContext);
				return Q._currentContext.set(J, W), Q;
			}, X.deleteValue = (J) => {
				let W = new D7(X._currentContext);
				return W._currentContext.delete(J), W;
			};
		}
	}
	EO.ROOT_CONTEXT = new D7();
});
var _O = M((CO) => {
	Object.defineProperty(CO, "__esModule", { value: !0 });
	CO.DiagConsoleLogger = void 0;
	var sY = [
		{
			n: "error",
			c: "error"
		},
		{
			n: "warn",
			c: "warn"
		},
		{
			n: "info",
			c: "info"
		},
		{
			n: "debug",
			c: "debug"
		},
		{
			n: "verbose",
			c: "trace"
		}
	];
	class vO {
		constructor() {
			function $(X) {
				return function(...J) {
					if (console) {
						let W = console[X];
						if (typeof W !== "function") W = console.log;
						if (typeof W === "function") return W.apply(console, J);
					}
				};
			}
			for (let X = 0; X < sY.length; X++) this[sY[X].n] = $(sY[X].c);
		}
	}
	CO.DiagConsoleLogger = vO;
});
var Gz = M((xO) => {
	Object.defineProperty(xO, "__esModule", { value: !0 });
	xO.createNoopMeter = xO.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = xO.NOOP_OBSERVABLE_GAUGE_METRIC = xO.NOOP_OBSERVABLE_COUNTER_METRIC = xO.NOOP_UP_DOWN_COUNTER_METRIC = xO.NOOP_HISTOGRAM_METRIC = xO.NOOP_GAUGE_METRIC = xO.NOOP_COUNTER_METRIC = xO.NOOP_METER = xO.NoopObservableUpDownCounterMetric = xO.NoopObservableGaugeMetric = xO.NoopObservableCounterMetric = xO.NoopObservableMetric = xO.NoopHistogramMetric = xO.NoopGaugeMetric = xO.NoopUpDownCounterMetric = xO.NoopCounterMetric = xO.NoopMetric = xO.NoopMeter = void 0;
	class eY {
		constructor() {}
		createGauge($, X) {
			return xO.NOOP_GAUGE_METRIC;
		}
		createHistogram($, X) {
			return xO.NOOP_HISTOGRAM_METRIC;
		}
		createCounter($, X) {
			return xO.NOOP_COUNTER_METRIC;
		}
		createUpDownCounter($, X) {
			return xO.NOOP_UP_DOWN_COUNTER_METRIC;
		}
		createObservableGauge($, X) {
			return xO.NOOP_OBSERVABLE_GAUGE_METRIC;
		}
		createObservableCounter($, X) {
			return xO.NOOP_OBSERVABLE_COUNTER_METRIC;
		}
		createObservableUpDownCounter($, X) {
			return xO.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
		}
		addBatchObservableCallback($, X) {}
		removeBatchObservableCallback($) {}
	}
	xO.NoopMeter = eY;
	class R0 {}
	xO.NoopMetric = R0;
	class $z extends R0 {
		add($, X) {}
	}
	xO.NoopCounterMetric = $z;
	class Xz extends R0 {
		add($, X) {}
	}
	xO.NoopUpDownCounterMetric = Xz;
	class Jz extends R0 {
		record($, X) {}
	}
	xO.NoopGaugeMetric = Jz;
	class Qz extends R0 {
		record($, X) {}
	}
	xO.NoopHistogramMetric = Qz;
	class Z9 {
		addCallback($) {}
		removeCallback($) {}
	}
	xO.NoopObservableMetric = Z9;
	class Wz extends Z9 {}
	xO.NoopObservableCounterMetric = Wz;
	class Yz extends Z9 {}
	xO.NoopObservableGaugeMetric = Yz;
	class zz extends Z9 {}
	xO.NoopObservableUpDownCounterMetric = zz;
	xO.NOOP_METER = new eY();
	xO.NOOP_COUNTER_METRIC = new $z();
	xO.NOOP_GAUGE_METRIC = new Jz();
	xO.NOOP_HISTOGRAM_METRIC = new Qz();
	xO.NOOP_UP_DOWN_COUNTER_METRIC = new Xz();
	xO.NOOP_OBSERVABLE_COUNTER_METRIC = new Wz();
	xO.NOOP_OBSERVABLE_GAUGE_METRIC = new Yz();
	xO.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new zz();
	function YP() {
		return xO.NOOP_METER;
	}
	xO.createNoopMeter = YP;
});
var pO = M((dO) => {
	Object.defineProperty(dO, "__esModule", { value: !0 });
	dO.ValueType = void 0;
	(function($) {
		$[$.INT = 0] = "INT", $[$.DOUBLE = 1] = "DOUBLE";
	})(dO.ValueType || (dO.ValueType = {}));
});
var Uz = M((iO) => {
	Object.defineProperty(iO, "__esModule", { value: !0 });
	iO.defaultTextMapSetter = iO.defaultTextMapGetter = void 0;
	iO.defaultTextMapGetter = {
		get($, X) {
			if ($ == null) return;
			return $[X];
		},
		keys($) {
			if ($ == null) return [];
			return Object.keys($);
		}
	};
	iO.defaultTextMapSetter = { set($, X, J) {
		if ($ == null) return;
		$[X] = J;
	} };
});
var aO = M((oO) => {
	Object.defineProperty(oO, "__esModule", { value: !0 });
	oO.NoopContextManager = void 0;
	var FP = I9();
	class rO {
		active() {
			return FP.ROOT_CONTEXT;
		}
		with($, X, J, ...W) {
			return X.call(J, ...W);
		}
		bind($, X) {
			return X;
		}
		enable() {
			return this;
		}
		disable() {
			return this;
		}
	}
	oO.NoopContextManager = rO;
});
var b9 = M((eO) => {
	Object.defineProperty(eO, "__esModule", { value: !0 });
	eO.ContextAPI = void 0;
	var jP = aO(), Kz = C1(), sO = k1(), Vz = "context", LP = new jP.NoopContextManager();
	class Nz {
		constructor() {}
		static getInstance() {
			if (!this._instance) this._instance = new Nz();
			return this._instance;
		}
		setGlobalContextManager($) {
			return (0, Kz.registerGlobal)(Vz, $, sO.DiagAPI.instance());
		}
		active() {
			return this._getContextManager().active();
		}
		with($, X, J, ...W) {
			return this._getContextManager().with($, X, J, ...W);
		}
		bind($, X) {
			return this._getContextManager().bind($, X);
		}
		_getContextManager() {
			return (0, Kz.getGlobal)(Vz) || LP;
		}
		disable() {
			this._getContextManager().disable(), (0, Kz.unregisterGlobal)(Vz, sO.DiagAPI.instance());
		}
	}
	eO.ContextAPI = Nz;
});
var wz = M((Xw) => {
	Object.defineProperty(Xw, "__esModule", { value: !0 });
	Xw.TraceFlags = void 0;
	(function($) {
		$[$.NONE = 0] = "NONE", $[$.SAMPLED = 1] = "SAMPLED";
	})(Xw.TraceFlags || (Xw.TraceFlags = {}));
});
var F7 = M((Jw) => {
	Object.defineProperty(Jw, "__esModule", { value: !0 });
	Jw.INVALID_SPAN_CONTEXT = Jw.INVALID_TRACEID = Jw.INVALID_SPANID = void 0;
	var AP = wz();
	Jw.INVALID_SPANID = "0000000000000000";
	Jw.INVALID_TRACEID = "00000000000000000000000000000000";
	Jw.INVALID_SPAN_CONTEXT = {
		traceId: Jw.INVALID_TRACEID,
		spanId: Jw.INVALID_SPANID,
		traceFlags: AP.TraceFlags.NONE
	};
});
var j7 = M((Gw) => {
	Object.defineProperty(Gw, "__esModule", { value: !0 });
	Gw.NonRecordingSpan = void 0;
	var IP = F7();
	class zw {
		constructor($ = IP.INVALID_SPAN_CONTEXT) {
			this._spanContext = $;
		}
		spanContext() {
			return this._spanContext;
		}
		setAttribute($, X) {
			return this;
		}
		setAttributes($) {
			return this;
		}
		addEvent($, X) {
			return this;
		}
		addLink($) {
			return this;
		}
		addLinks($) {
			return this;
		}
		setStatus($) {
			return this;
		}
		updateName($) {
			return this;
		}
		end($) {}
		isRecording() {
			return !1;
		}
		recordException($, X) {}
	}
	Gw.NonRecordingSpan = zw;
});
var Dz = M((Kw) => {
	Object.defineProperty(Kw, "__esModule", { value: !0 });
	Kw.getSpanContext = Kw.setSpanContext = Kw.deleteSpan = Kw.setSpan = Kw.getActiveSpan = Kw.getSpan = void 0;
	var ZP = I9(), bP = j7(), RP = b9(), Bz = (0, ZP.createContextKey)("OpenTelemetry Context Key SPAN");
	function qz($) {
		return $.getValue(Bz) || void 0;
	}
	Kw.getSpan = qz;
	function PP() {
		return qz(RP.ContextAPI.getInstance().active());
	}
	Kw.getActiveSpan = PP;
	function Uw($, X) {
		return $.setValue(Bz, X);
	}
	Kw.setSpan = Uw;
	function EP($) {
		return $.deleteValue(Bz);
	}
	Kw.deleteSpan = EP;
	function SP($, X) {
		return Uw($, new bP.NonRecordingSpan(X));
	}
	Kw.setSpanContext = SP;
	function vP($) {
		var X;
		return (X = qz($)) === null || X === void 0 ? void 0 : X.spanContext();
	}
	Kw.getSpanContext = vP;
});
var L7 = M((Bw) => {
	Object.defineProperty(Bw, "__esModule", { value: !0 });
	Bw.wrapSpanContext = Bw.isSpanContextValid = Bw.isValidSpanId = Bw.isValidTraceId = void 0;
	var Nw = F7(), fP = j7(), yP = /^([0-9a-f]{32})$/i, gP = /^[0-9a-f]{16}$/i;
	function Ow($) {
		return yP.test($) && $ !== Nw.INVALID_TRACEID;
	}
	Bw.isValidTraceId = Ow;
	function ww($) {
		return gP.test($) && $ !== Nw.INVALID_SPANID;
	}
	Bw.isValidSpanId = ww;
	function hP($) {
		return Ow($.traceId) && ww($.spanId);
	}
	Bw.isSpanContextValid = hP;
	function uP($) {
		return new fP.NonRecordingSpan($);
	}
	Bw.wrapSpanContext = uP;
});
var Lz = M((jw) => {
	Object.defineProperty(jw, "__esModule", { value: !0 });
	jw.NoopTracer = void 0;
	var dP = b9(), Dw = Dz(), Fz = j7(), pP = L7(), jz = dP.ContextAPI.getInstance();
	class Fw {
		startSpan($, X, J = jz.active()) {
			if (Boolean(X === null || X === void 0 ? void 0 : X.root)) return new Fz.NonRecordingSpan();
			let Q = J && (0, Dw.getSpanContext)(J);
			if (iP(Q) && (0, pP.isSpanContextValid)(Q)) return new Fz.NonRecordingSpan(Q);
			else return new Fz.NonRecordingSpan();
		}
		startActiveSpan($, X, J, W) {
			let Q, Y, z;
			if (arguments.length < 2) return;
			else if (arguments.length === 2) z = X;
			else if (arguments.length === 3) Q = X, z = J;
			else Q = X, Y = J, z = W;
			let G = Y !== null && Y !== void 0 ? Y : jz.active(), H = this.startSpan($, Q, G), U = (0, Dw.setSpan)(G, H);
			return jz.with(U, z, void 0, H);
		}
	}
	jw.NoopTracer = Fw;
	function iP($) {
		return typeof $ === "object" && typeof $.spanId === "string" && typeof $.traceId === "string" && typeof $.traceFlags === "number";
	}
});
var Mz = M((Aw) => {
	Object.defineProperty(Aw, "__esModule", { value: !0 });
	Aw.ProxyTracer = void 0;
	var rP = new (Lz()).NoopTracer();
	class Mw {
		constructor($, X, J, W) {
			this._provider = $, this.name = X, this.version = J, this.options = W;
		}
		startSpan($, X, J) {
			return this._getTracer().startSpan($, X, J);
		}
		startActiveSpan($, X, J, W) {
			let Q = this._getTracer();
			return Reflect.apply(Q.startActiveSpan, Q, arguments);
		}
		_getTracer() {
			if (this._delegate) return this._delegate;
			let $ = this._provider.getDelegateTracer(this.name, this.version, this.options);
			if (!$) return rP;
			return this._delegate = $, this._delegate;
		}
	}
	Aw.ProxyTracer = Mw;
});
var Pw = M((bw) => {
	Object.defineProperty(bw, "__esModule", { value: !0 });
	bw.NoopTracerProvider = void 0;
	var oP = Lz();
	class Zw {
		getTracer($, X, J) {
			return new oP.NoopTracer();
		}
	}
	bw.NoopTracerProvider = Zw;
});
var Az = M((Sw) => {
	Object.defineProperty(Sw, "__esModule", { value: !0 });
	Sw.ProxyTracerProvider = void 0;
	var tP = Mz(), sP = new (Pw()).NoopTracerProvider();
	class Ew {
		getTracer($, X, J) {
			var W;
			return (W = this.getDelegateTracer($, X, J)) !== null && W !== void 0 ? W : new tP.ProxyTracer(this, $, X, J);
		}
		getDelegate() {
			var $;
			return ($ = this._delegate) !== null && $ !== void 0 ? $ : sP;
		}
		setDelegate($) {
			this._delegate = $;
		}
		getDelegateTracer($, X, J) {
			var W;
			return (W = this._delegate) === null || W === void 0 ? void 0 : W.getTracer($, X, J);
		}
	}
	Sw.ProxyTracerProvider = Ew;
});
var kw = M((Cw) => {
	Object.defineProperty(Cw, "__esModule", { value: !0 });
	Cw.SamplingDecision = void 0;
	(function($) {
		$[$.NOT_RECORD = 0] = "NOT_RECORD", $[$.RECORD = 1] = "RECORD", $[$.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
	})(Cw.SamplingDecision || (Cw.SamplingDecision = {}));
});
var xw = M((_w) => {
	Object.defineProperty(_w, "__esModule", { value: !0 });
	_w.SpanKind = void 0;
	(function($) {
		$[$.INTERNAL = 0] = "INTERNAL", $[$.SERVER = 1] = "SERVER", $[$.CLIENT = 2] = "CLIENT", $[$.PRODUCER = 3] = "PRODUCER", $[$.CONSUMER = 4] = "CONSUMER";
	})(_w.SpanKind || (_w.SpanKind = {}));
});
var fw = M((Tw) => {
	Object.defineProperty(Tw, "__esModule", { value: !0 });
	Tw.SpanStatusCode = void 0;
	(function($) {
		$[$.UNSET = 0] = "UNSET", $[$.OK = 1] = "OK", $[$.ERROR = 2] = "ERROR";
	})(Tw.SpanStatusCode || (Tw.SpanStatusCode = {}));
});
var hw = M((yw) => {
	Object.defineProperty(yw, "__esModule", { value: !0 });
	yw.validateValue = yw.validateKey = void 0;
	var Rz = "[_0-9a-z-*/]", JE = `[a-z]${Rz}{0,255}`, QE = `[a-z0-9]${Rz}{0,240}@[a-z]${Rz}{0,13}`, WE = new RegExp(`^(?:${JE}|${QE})$`), YE = /^[ -~]{0,255}[!-~]$/, zE = /,|=/;
	function GE($) {
		return WE.test($);
	}
	yw.validateKey = GE;
	function HE($) {
		return YE.test($) && !zE.test($);
	}
	yw.validateValue = HE;
});
var iw = M((dw) => {
	Object.defineProperty(dw, "__esModule", { value: !0 });
	dw.TraceStateImpl = void 0;
	var uw = hw(), mw = 32, KE = 512, lw = ",", cw = "=";
	class Pz {
		constructor($) {
			if (this._internalState = /* @__PURE__ */ new Map(), $) this._parse($);
		}
		set($, X) {
			let J = this._clone();
			if (J._internalState.has($)) J._internalState.delete($);
			return J._internalState.set($, X), J;
		}
		unset($) {
			let X = this._clone();
			return X._internalState.delete($), X;
		}
		get($) {
			return this._internalState.get($);
		}
		serialize() {
			return this._keys().reduce(($, X) => {
				return $.push(X + cw + this.get(X)), $;
			}, []).join(lw);
		}
		_parse($) {
			if ($.length > KE) return;
			if (this._internalState = $.split(lw).reverse().reduce((X, J) => {
				let W = J.trim(), Q = W.indexOf(cw);
				if (Q !== -1) {
					let Y = W.slice(0, Q), z = W.slice(Q + 1, J.length);
					if ((0, uw.validateKey)(Y) && (0, uw.validateValue)(z)) X.set(Y, z);
				}
				return X;
			}, /* @__PURE__ */ new Map()), this._internalState.size > mw) this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, mw));
		}
		_keys() {
			return Array.from(this._internalState.keys()).reverse();
		}
		_clone() {
			let $ = new Pz();
			return $._internalState = new Map(this._internalState), $;
		}
	}
	dw.TraceStateImpl = Pz;
});
var ow = M((nw) => {
	Object.defineProperty(nw, "__esModule", { value: !0 });
	nw.createTraceState = void 0;
	var VE = iw();
	function NE($) {
		return new VE.TraceStateImpl($);
	}
	nw.createTraceState = NE;
});
var sw = M((tw) => {
	Object.defineProperty(tw, "__esModule", { value: !0 });
	tw.context = void 0;
	tw.context = b9().ContextAPI.getInstance();
});
var XB = M((ew) => {
	Object.defineProperty(ew, "__esModule", { value: !0 });
	ew.diag = void 0;
	ew.diag = k1().DiagAPI.instance();
});
var WB = M((JB) => {
	Object.defineProperty(JB, "__esModule", { value: !0 });
	JB.NOOP_METER_PROVIDER = JB.NoopMeterProvider = void 0;
	var BE = Gz();
	class Ez {
		getMeter($, X, J) {
			return BE.NOOP_METER;
		}
	}
	JB.NoopMeterProvider = Ez;
	JB.NOOP_METER_PROVIDER = new Ez();
});
var HB = M((zB) => {
	Object.defineProperty(zB, "__esModule", { value: !0 });
	zB.MetricsAPI = void 0;
	var DE = WB(), Sz = C1(), YB = k1(), vz = "metrics";
	class Cz {
		constructor() {}
		static getInstance() {
			if (!this._instance) this._instance = new Cz();
			return this._instance;
		}
		setGlobalMeterProvider($) {
			return (0, Sz.registerGlobal)(vz, $, YB.DiagAPI.instance());
		}
		getMeterProvider() {
			return (0, Sz.getGlobal)(vz) || DE.NOOP_METER_PROVIDER;
		}
		getMeter($, X, J) {
			return this.getMeterProvider().getMeter($, X, J);
		}
		disable() {
			(0, Sz.unregisterGlobal)(vz, YB.DiagAPI.instance());
		}
	}
	zB.MetricsAPI = Cz;
});
var VB = M((UB) => {
	Object.defineProperty(UB, "__esModule", { value: !0 });
	UB.metrics = void 0;
	UB.metrics = HB().MetricsAPI.getInstance();
});
var BB = M((OB) => {
	Object.defineProperty(OB, "__esModule", { value: !0 });
	OB.NoopTextMapPropagator = void 0;
	class NB {
		inject($, X) {}
		extract($, X) {
			return $;
		}
		fields() {
			return [];
		}
	}
	OB.NoopTextMapPropagator = NB;
});
var jB = M((DB) => {
	Object.defineProperty(DB, "__esModule", { value: !0 });
	DB.deleteBaggage = DB.setBaggage = DB.getActiveBaggage = DB.getBaggage = void 0;
	var jE = b9(), kz = (0, I9().createContextKey)("OpenTelemetry Baggage Key");
	function qB($) {
		return $.getValue(kz) || void 0;
	}
	DB.getBaggage = qB;
	function ME() {
		return qB(jE.ContextAPI.getInstance().active());
	}
	DB.getActiveBaggage = ME;
	function AE($, X) {
		return $.setValue(kz, X);
	}
	DB.setBaggage = AE;
	function IE($) {
		return $.deleteValue(kz);
	}
	DB.deleteBaggage = IE;
});
var ZB = M((AB) => {
	Object.defineProperty(AB, "__esModule", { value: !0 });
	AB.PropagationAPI = void 0;
	var _z = C1(), PE = BB(), LB = Uz(), M7 = jB(), EE = aY(), MB = k1(), xz = "propagation", SE = new PE.NoopTextMapPropagator();
	class Tz {
		constructor() {
			this.createBaggage = EE.createBaggage, this.getBaggage = M7.getBaggage, this.getActiveBaggage = M7.getActiveBaggage, this.setBaggage = M7.setBaggage, this.deleteBaggage = M7.deleteBaggage;
		}
		static getInstance() {
			if (!this._instance) this._instance = new Tz();
			return this._instance;
		}
		setGlobalPropagator($) {
			return (0, _z.registerGlobal)(xz, $, MB.DiagAPI.instance());
		}
		inject($, X, J = LB.defaultTextMapSetter) {
			return this._getGlobalPropagator().inject($, X, J);
		}
		extract($, X, J = LB.defaultTextMapGetter) {
			return this._getGlobalPropagator().extract($, X, J);
		}
		fields() {
			return this._getGlobalPropagator().fields();
		}
		disable() {
			(0, _z.unregisterGlobal)(xz, MB.DiagAPI.instance());
		}
		_getGlobalPropagator() {
			return (0, _z.getGlobal)(xz) || SE;
		}
	}
	AB.PropagationAPI = Tz;
});
var PB = M((bB) => {
	Object.defineProperty(bB, "__esModule", { value: !0 });
	bB.propagation = void 0;
	bB.propagation = ZB().PropagationAPI.getInstance();
});
var _B = M((CB) => {
	Object.defineProperty(CB, "__esModule", { value: !0 });
	CB.TraceAPI = void 0;
	var fz = C1(), EB = Az(), SB = L7(), P0 = Dz(), vB = k1(), yz = "trace";
	class gz {
		constructor() {
			this._proxyTracerProvider = new EB.ProxyTracerProvider(), this.wrapSpanContext = SB.wrapSpanContext, this.isSpanContextValid = SB.isSpanContextValid, this.deleteSpan = P0.deleteSpan, this.getSpan = P0.getSpan, this.getActiveSpan = P0.getActiveSpan, this.getSpanContext = P0.getSpanContext, this.setSpan = P0.setSpan, this.setSpanContext = P0.setSpanContext;
		}
		static getInstance() {
			if (!this._instance) this._instance = new gz();
			return this._instance;
		}
		setGlobalTracerProvider($) {
			let X = (0, fz.registerGlobal)(yz, this._proxyTracerProvider, vB.DiagAPI.instance());
			if (X) this._proxyTracerProvider.setDelegate($);
			return X;
		}
		getTracerProvider() {
			return (0, fz.getGlobal)(yz) || this._proxyTracerProvider;
		}
		getTracer($, X) {
			return this.getTracerProvider().getTracer($, X);
		}
		disable() {
			(0, fz.unregisterGlobal)(yz, vB.DiagAPI.instance()), this._proxyTracerProvider = new EB.ProxyTracerProvider();
		}
	}
	CB.TraceAPI = gz;
});
var fB = M((xB) => {
	Object.defineProperty(xB, "__esModule", { value: !0 });
	xB.trace = void 0;
	xB.trace = _B().TraceAPI.getInstance();
});
var mz = M((H$) => {
	Object.defineProperty(H$, "__esModule", { value: !0 });
	H$.trace = H$.propagation = H$.metrics = H$.diag = H$.context = H$.INVALID_SPAN_CONTEXT = H$.INVALID_TRACEID = H$.INVALID_SPANID = H$.isValidSpanId = H$.isValidTraceId = H$.isSpanContextValid = H$.createTraceState = H$.TraceFlags = H$.SpanStatusCode = H$.SpanKind = H$.SamplingDecision = H$.ProxyTracerProvider = H$.ProxyTracer = H$.defaultTextMapSetter = H$.defaultTextMapGetter = H$.ValueType = H$.createNoopMeter = H$.DiagLogLevel = H$.DiagConsoleLogger = H$.ROOT_CONTEXT = H$.createContextKey = H$.baggageEntryMetadataFromString = void 0;
	var kE = aY();
	Object.defineProperty(H$, "baggageEntryMetadataFromString", {
		enumerable: !0,
		get: function() {
			return kE.baggageEntryMetadataFromString;
		}
	});
	var yB = I9();
	Object.defineProperty(H$, "createContextKey", {
		enumerable: !0,
		get: function() {
			return yB.createContextKey;
		}
	});
	Object.defineProperty(H$, "ROOT_CONTEXT", {
		enumerable: !0,
		get: function() {
			return yB.ROOT_CONTEXT;
		}
	});
	var _E = _O();
	Object.defineProperty(H$, "DiagConsoleLogger", {
		enumerable: !0,
		get: function() {
			return _E.DiagConsoleLogger;
		}
	});
	var xE = B7();
	Object.defineProperty(H$, "DiagLogLevel", {
		enumerable: !0,
		get: function() {
			return xE.DiagLogLevel;
		}
	});
	var TE = Gz();
	Object.defineProperty(H$, "createNoopMeter", {
		enumerable: !0,
		get: function() {
			return TE.createNoopMeter;
		}
	});
	var fE = pO();
	Object.defineProperty(H$, "ValueType", {
		enumerable: !0,
		get: function() {
			return fE.ValueType;
		}
	});
	var gB = Uz();
	Object.defineProperty(H$, "defaultTextMapGetter", {
		enumerable: !0,
		get: function() {
			return gB.defaultTextMapGetter;
		}
	});
	Object.defineProperty(H$, "defaultTextMapSetter", {
		enumerable: !0,
		get: function() {
			return gB.defaultTextMapSetter;
		}
	});
	var yE = Mz();
	Object.defineProperty(H$, "ProxyTracer", {
		enumerable: !0,
		get: function() {
			return yE.ProxyTracer;
		}
	});
	var gE = Az();
	Object.defineProperty(H$, "ProxyTracerProvider", {
		enumerable: !0,
		get: function() {
			return gE.ProxyTracerProvider;
		}
	});
	var hE = kw();
	Object.defineProperty(H$, "SamplingDecision", {
		enumerable: !0,
		get: function() {
			return hE.SamplingDecision;
		}
	});
	var uE = xw();
	Object.defineProperty(H$, "SpanKind", {
		enumerable: !0,
		get: function() {
			return uE.SpanKind;
		}
	});
	var mE = fw();
	Object.defineProperty(H$, "SpanStatusCode", {
		enumerable: !0,
		get: function() {
			return mE.SpanStatusCode;
		}
	});
	var lE = wz();
	Object.defineProperty(H$, "TraceFlags", {
		enumerable: !0,
		get: function() {
			return lE.TraceFlags;
		}
	});
	var cE = ow();
	Object.defineProperty(H$, "createTraceState", {
		enumerable: !0,
		get: function() {
			return cE.createTraceState;
		}
	});
	var hz = L7();
	Object.defineProperty(H$, "isSpanContextValid", {
		enumerable: !0,
		get: function() {
			return hz.isSpanContextValid;
		}
	});
	Object.defineProperty(H$, "isValidTraceId", {
		enumerable: !0,
		get: function() {
			return hz.isValidTraceId;
		}
	});
	Object.defineProperty(H$, "isValidSpanId", {
		enumerable: !0,
		get: function() {
			return hz.isValidSpanId;
		}
	});
	var uz = F7();
	Object.defineProperty(H$, "INVALID_SPANID", {
		enumerable: !0,
		get: function() {
			return uz.INVALID_SPANID;
		}
	});
	Object.defineProperty(H$, "INVALID_TRACEID", {
		enumerable: !0,
		get: function() {
			return uz.INVALID_TRACEID;
		}
	});
	Object.defineProperty(H$, "INVALID_SPAN_CONTEXT", {
		enumerable: !0,
		get: function() {
			return uz.INVALID_SPAN_CONTEXT;
		}
	});
	var hB = sw();
	Object.defineProperty(H$, "context", {
		enumerable: !0,
		get: function() {
			return hB.context;
		}
	});
	var uB = XB();
	Object.defineProperty(H$, "diag", {
		enumerable: !0,
		get: function() {
			return uB.diag;
		}
	});
	var mB = VB();
	Object.defineProperty(H$, "metrics", {
		enumerable: !0,
		get: function() {
			return mB.metrics;
		}
	});
	var lB = PB();
	Object.defineProperty(H$, "propagation", {
		enumerable: !0,
		get: function() {
			return lB.propagation;
		}
	});
	var cB = fB();
	Object.defineProperty(H$, "trace", {
		enumerable: !0,
		get: function() {
			return cB.trace;
		}
	});
	H$.default = {
		context: hB.context,
		diag: uB.diag,
		metrics: mB.metrics,
		propagation: lB.propagation,
		trace: cB.trace
	};
});
var WJ = M((cF) => {
	Object.defineProperty(cF, "__esModule", { value: !0 });
	cF.regexpCode = cF.getEsmExportName = cF.getProperty = cF.safeStringify = cF.stringify = cF.strConcat = cF.addCodeArg = cF.str = cF._ = cF.nil = cF._Code = cF.Name = cF.IDENTIFIER = cF._CodeOrName = void 0;
	class NW {}
	cF._CodeOrName = NW;
	cF.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
	class H8 extends NW {
		constructor($) {
			super();
			if (!cF.IDENTIFIER.test($)) throw Error("CodeGen: name must be a valid identifier");
			this.str = $;
		}
		toString() {
			return this.str;
		}
		emptyStr() {
			return !1;
		}
		get names() {
			return { [this.str]: 1 };
		}
	}
	cF.Name = H8;
	class p6 extends NW {
		constructor($) {
			super();
			this._items = typeof $ === "string" ? [$] : $;
		}
		toString() {
			return this.str;
		}
		emptyStr() {
			if (this._items.length > 1) return !1;
			let $ = this._items[0];
			return $ === "" || $ === "\"\"";
		}
		get str() {
			var $;
			return ($ = this._str) !== null && $ !== void 0 ? $ : this._str = this._items.reduce((X, J) => `${X}${J}`, "");
		}
		get names() {
			var $;
			return ($ = this._names) !== null && $ !== void 0 ? $ : this._names = this._items.reduce((X, J) => {
				if (J instanceof H8) X[J.str] = (X[J.str] || 0) + 1;
				return X;
			}, {});
		}
	}
	cF._Code = p6;
	cF.nil = new p6("");
	function mF($, ...X) {
		let J = [$[0]], W = 0;
		while (W < X.length) RU(J, X[W]), J.push($[++W]);
		return new p6(J);
	}
	cF._ = mF;
	var bU = new p6("+");
	function lF($, ...X) {
		let J = [QJ($[0])], W = 0;
		while (W < X.length) J.push(bU), RU(J, X[W]), J.push(bU, QJ($[++W]));
		return YT(J), new p6(J);
	}
	cF.str = lF;
	function RU($, X) {
		if (X instanceof p6) $.push(...X._items);
		else if (X instanceof H8) $.push(X);
		else $.push(HT(X));
	}
	cF.addCodeArg = RU;
	function YT($) {
		let X = 1;
		while (X < $.length - 1) {
			if ($[X] === bU) {
				let J = zT($[X - 1], $[X + 1]);
				if (J !== void 0) {
					$.splice(X - 1, 3, J);
					continue;
				}
				$[X++] = "+";
			}
			X++;
		}
	}
	function zT($, X) {
		if (X === "\"\"") return $;
		if ($ === "\"\"") return X;
		if (typeof $ == "string") {
			if (X instanceof H8 || $[$.length - 1] !== "\"") return;
			if (typeof X != "string") return `${$.slice(0, -1)}${X}"`;
			if (X[0] === "\"") return $.slice(0, -1) + X.slice(1);
			return;
		}
		if (typeof X == "string" && X[0] === "\"" && !($ instanceof H8)) return `"${$}${X.slice(1)}`;
	}
	function GT($, X) {
		return X.emptyStr() ? $ : $.emptyStr() ? X : lF`${$}${X}`;
	}
	cF.strConcat = GT;
	function HT($) {
		return typeof $ == "number" || typeof $ == "boolean" || $ === null ? $ : QJ(Array.isArray($) ? $.join(",") : $);
	}
	function UT($) {
		return new p6(QJ($));
	}
	cF.stringify = UT;
	function QJ($) {
		return JSON.stringify($).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
	}
	cF.safeStringify = QJ;
	function KT($) {
		return typeof $ == "string" && cF.IDENTIFIER.test($) ? new p6(`.${$}`) : mF`[${$}]`;
	}
	cF.getProperty = KT;
	function VT($) {
		if (typeof $ == "string" && cF.IDENTIFIER.test($)) return new p6(`${$}`);
		throw Error(`CodeGen: invalid export name: ${$}, use explicit $id name mapping`);
	}
	cF.getEsmExportName = VT;
	function NT($) {
		return new p6($.toString());
	}
	cF.regexpCode = NT;
});
var vU = M((nF) => {
	Object.defineProperty(nF, "__esModule", { value: !0 });
	nF.ValueScope = nF.ValueScopeName = nF.Scope = nF.varKinds = nF.UsedValueState = void 0;
	var U6 = WJ();
	class pF extends Error {
		constructor($) {
			super(`CodeGen: "code" for ${$} not defined`);
			this.value = $.value;
		}
	}
	var wW;
	(function($) {
		$[$.Started = 0] = "Started", $[$.Completed = 1] = "Completed";
	})(wW || (nF.UsedValueState = wW = {}));
	nF.varKinds = {
		const: new U6.Name("const"),
		let: new U6.Name("let"),
		var: new U6.Name("var")
	};
	class EU {
		constructor({ prefixes: $, parent: X } = {}) {
			this._names = {}, this._prefixes = $, this._parent = X;
		}
		toName($) {
			return $ instanceof U6.Name ? $ : this.name($);
		}
		name($) {
			return new U6.Name(this._newName($));
		}
		_newName($) {
			let X = this._names[$] || this._nameGroup($);
			return `${$}${X.index++}`;
		}
		_nameGroup($) {
			var X, J;
			if (((J = (X = this._parent) === null || X === void 0 ? void 0 : X._prefixes) === null || J === void 0 ? void 0 : J.has($)) || this._prefixes && !this._prefixes.has($)) throw Error(`CodeGen: prefix "${$}" is not allowed in this scope`);
			return this._names[$] = {
				prefix: $,
				index: 0
			};
		}
	}
	nF.Scope = EU;
	class SU extends U6.Name {
		constructor($, X) {
			super(X);
			this.prefix = $;
		}
		setValue($, { property: X, itemIndex: J }) {
			this.value = $, this.scopePath = U6._`.${new U6.Name(X)}[${J}]`;
		}
	}
	nF.ValueScopeName = SU;
	var bT = U6._`\n`;
	class iF extends EU {
		constructor($) {
			super($);
			this._values = {}, this._scope = $.scope, this.opts = {
				...$,
				_n: $.lines ? bT : U6.nil
			};
		}
		get() {
			return this._scope;
		}
		name($) {
			return new SU($, this._newName($));
		}
		value($, X) {
			var J;
			if (X.ref === void 0) throw Error("CodeGen: ref must be passed in value");
			let W = this.toName($), { prefix: Q } = W, Y = (J = X.key) !== null && J !== void 0 ? J : X.ref, z = this._values[Q];
			if (z) {
				let U = z.get(Y);
				if (U) return U;
			} else z = this._values[Q] = /* @__PURE__ */ new Map();
			z.set(Y, W);
			let G = this._scope[Q] || (this._scope[Q] = []), H = G.length;
			return G[H] = X.ref, W.setValue(X, {
				property: Q,
				itemIndex: H
			}), W;
		}
		getValue($, X) {
			let J = this._values[$];
			if (!J) return;
			return J.get(X);
		}
		scopeRefs($, X = this._values) {
			return this._reduceValues(X, (J) => {
				if (J.scopePath === void 0) throw Error(`CodeGen: name "${J}" has no value`);
				return U6._`${$}${J.scopePath}`;
			});
		}
		scopeCode($ = this._values, X, J) {
			return this._reduceValues($, (W) => {
				if (W.value === void 0) throw Error(`CodeGen: name "${W}" has no value`);
				return W.value.code;
			}, X, J);
		}
		_reduceValues($, X, J = {}, W) {
			let Q = U6.nil;
			for (let Y in $) {
				let z = $[Y];
				if (!z) continue;
				let G = J[Y] = J[Y] || /* @__PURE__ */ new Map();
				z.forEach((H) => {
					if (G.has(H)) return;
					G.set(H, wW.Started);
					let U = X(H);
					if (U) {
						let K = this.opts.es5 ? nF.varKinds.var : nF.varKinds.const;
						Q = U6._`${Q}${K} ${H} = ${U};${this.opts._n}`;
					} else if (U = W === null || W === void 0 ? void 0 : W(H)) Q = U6._`${Q}${U}${this.opts._n}`;
					else throw new pF(H);
					G.set(H, wW.Completed);
				});
			}
			return Q;
		}
	}
	nF.ValueScope = iF;
});
var a = M((K6) => {
	Object.defineProperty(K6, "__esModule", { value: !0 });
	K6.or = K6.and = K6.not = K6.CodeGen = K6.operators = K6.varKinds = K6.ValueScopeName = K6.ValueScope = K6.Scope = K6.Name = K6.regexpCode = K6.stringify = K6.getProperty = K6.nil = K6.strConcat = K6.str = K6._ = void 0;
	var Q$ = WJ(), i6 = vU(), G1 = WJ();
	Object.defineProperty(K6, "_", {
		enumerable: !0,
		get: function() {
			return G1._;
		}
	});
	Object.defineProperty(K6, "str", {
		enumerable: !0,
		get: function() {
			return G1.str;
		}
	});
	Object.defineProperty(K6, "strConcat", {
		enumerable: !0,
		get: function() {
			return G1.strConcat;
		}
	});
	Object.defineProperty(K6, "nil", {
		enumerable: !0,
		get: function() {
			return G1.nil;
		}
	});
	Object.defineProperty(K6, "getProperty", {
		enumerable: !0,
		get: function() {
			return G1.getProperty;
		}
	});
	Object.defineProperty(K6, "stringify", {
		enumerable: !0,
		get: function() {
			return G1.stringify;
		}
	});
	Object.defineProperty(K6, "regexpCode", {
		enumerable: !0,
		get: function() {
			return G1.regexpCode;
		}
	});
	Object.defineProperty(K6, "Name", {
		enumerable: !0,
		get: function() {
			return G1.Name;
		}
	});
	var LW = vU();
	Object.defineProperty(K6, "Scope", {
		enumerable: !0,
		get: function() {
			return LW.Scope;
		}
	});
	Object.defineProperty(K6, "ValueScope", {
		enumerable: !0,
		get: function() {
			return LW.ValueScope;
		}
	});
	Object.defineProperty(K6, "ValueScopeName", {
		enumerable: !0,
		get: function() {
			return LW.ValueScopeName;
		}
	});
	Object.defineProperty(K6, "varKinds", {
		enumerable: !0,
		get: function() {
			return LW.varKinds;
		}
	});
	K6.operators = {
		GT: new Q$._Code(">"),
		GTE: new Q$._Code(">="),
		LT: new Q$._Code("<"),
		LTE: new Q$._Code("<="),
		EQ: new Q$._Code("==="),
		NEQ: new Q$._Code("!=="),
		NOT: new Q$._Code("!"),
		OR: new Q$._Code("||"),
		AND: new Q$._Code("&&"),
		ADD: new Q$._Code("+")
	};
	class H1 {
		optimizeNodes() {
			return this;
		}
		optimizeNames($, X) {
			return this;
		}
	}
	class oF extends H1 {
		constructor($, X, J) {
			super();
			this.varKind = $, this.name = X, this.rhs = J;
		}
		render({ es5: $, _n: X }) {
			let J = $ ? i6.varKinds.var : this.varKind, W = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
			return `${J} ${this.name}${W};` + X;
		}
		optimizeNames($, X) {
			if (!$[this.name.str]) return;
			if (this.rhs) this.rhs = K8(this.rhs, $, X);
			return this;
		}
		get names() {
			return this.rhs instanceof Q$._CodeOrName ? this.rhs.names : {};
		}
	}
	class _U extends H1 {
		constructor($, X, J) {
			super();
			this.lhs = $, this.rhs = X, this.sideEffects = J;
		}
		render({ _n: $ }) {
			return `${this.lhs} = ${this.rhs};` + $;
		}
		optimizeNames($, X) {
			if (this.lhs instanceof Q$.Name && !$[this.lhs.str] && !this.sideEffects) return;
			return this.rhs = K8(this.rhs, $, X), this;
		}
		get names() {
			return jW(this.lhs instanceof Q$.Name ? {} : { ...this.lhs.names }, this.rhs);
		}
	}
	class tF extends _U {
		constructor($, X, J, W) {
			super($, J, W);
			this.op = X;
		}
		render({ _n: $ }) {
			return `${this.lhs} ${this.op}= ${this.rhs};` + $;
		}
	}
	class aF extends H1 {
		constructor($) {
			super();
			this.label = $, this.names = {};
		}
		render({ _n: $ }) {
			return `${this.label}:` + $;
		}
	}
	class sF extends H1 {
		constructor($) {
			super();
			this.label = $, this.names = {};
		}
		render({ _n: $ }) {
			return `break${this.label ? ` ${this.label}` : ""};` + $;
		}
	}
	class eF extends H1 {
		constructor($) {
			super();
			this.error = $;
		}
		render({ _n: $ }) {
			return `throw ${this.error};` + $;
		}
		get names() {
			return this.error.names;
		}
	}
	class $j extends H1 {
		constructor($) {
			super();
			this.code = $;
		}
		render({ _n: $ }) {
			return `${this.code};` + $;
		}
		optimizeNodes() {
			return `${this.code}` ? this : void 0;
		}
		optimizeNames($, X) {
			return this.code = K8(this.code, $, X), this;
		}
		get names() {
			return this.code instanceof Q$._CodeOrName ? this.code.names : {};
		}
	}
	class MW extends H1 {
		constructor($ = []) {
			super();
			this.nodes = $;
		}
		render($) {
			return this.nodes.reduce((X, J) => X + J.render($), "");
		}
		optimizeNodes() {
			let { nodes: $ } = this, X = $.length;
			while (X--) {
				let J = $[X].optimizeNodes();
				if (Array.isArray(J)) $.splice(X, 1, ...J);
				else if (J) $[X] = J;
				else $.splice(X, 1);
			}
			return $.length > 0 ? this : void 0;
		}
		optimizeNames($, X) {
			let { nodes: J } = this, W = J.length;
			while (W--) {
				let Q = J[W];
				if (Q.optimizeNames($, X)) continue;
				ST($, Q.names), J.splice(W, 1);
			}
			return J.length > 0 ? this : void 0;
		}
		get names() {
			return this.nodes.reduce(($, X) => o1($, X.names), {});
		}
	}
	class U1 extends MW {
		render($) {
			return "{" + $._n + super.render($) + "}" + $._n;
		}
	}
	class Xj extends MW {}
	class YJ extends U1 {}
	YJ.kind = "else";
	class P4 extends U1 {
		constructor($, X) {
			super(X);
			this.condition = $;
		}
		render($) {
			let X = `if(${this.condition})` + super.render($);
			if (this.else) X += "else " + this.else.render($);
			return X;
		}
		optimizeNodes() {
			super.optimizeNodes();
			let $ = this.condition;
			if ($ === !0) return this.nodes;
			let X = this.else;
			if (X) {
				let J = X.optimizeNodes();
				X = this.else = Array.isArray(J) ? new YJ(J) : J;
			}
			if (X) {
				if ($ === !1) return X instanceof P4 ? X : X.nodes;
				if (this.nodes.length) return this;
				return new P4(zj($), X instanceof P4 ? [X] : X.nodes);
			}
			if ($ === !1 || !this.nodes.length) return;
			return this;
		}
		optimizeNames($, X) {
			var J;
			if (this.else = (J = this.else) === null || J === void 0 ? void 0 : J.optimizeNames($, X), !(super.optimizeNames($, X) || this.else)) return;
			return this.condition = K8(this.condition, $, X), this;
		}
		get names() {
			let $ = super.names;
			if (jW($, this.condition), this.else) o1($, this.else.names);
			return $;
		}
	}
	P4.kind = "if";
	class U8 extends U1 {}
	U8.kind = "for";
	class Jj extends U8 {
		constructor($) {
			super();
			this.iteration = $;
		}
		render($) {
			return `for(${this.iteration})` + super.render($);
		}
		optimizeNames($, X) {
			if (!super.optimizeNames($, X)) return;
			return this.iteration = K8(this.iteration, $, X), this;
		}
		get names() {
			return o1(super.names, this.iteration.names);
		}
	}
	class Qj extends U8 {
		constructor($, X, J, W) {
			super();
			this.varKind = $, this.name = X, this.from = J, this.to = W;
		}
		render($) {
			let X = $.es5 ? i6.varKinds.var : this.varKind, { name: J, from: W, to: Q } = this;
			return `for(${X} ${J}=${W}; ${J}<${Q}; ${J}++)` + super.render($);
		}
		get names() {
			return jW(jW(super.names, this.from), this.to);
		}
	}
	class CU extends U8 {
		constructor($, X, J, W) {
			super();
			this.loop = $, this.varKind = X, this.name = J, this.iterable = W;
		}
		render($) {
			return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render($);
		}
		optimizeNames($, X) {
			if (!super.optimizeNames($, X)) return;
			return this.iterable = K8(this.iterable, $, X), this;
		}
		get names() {
			return o1(super.names, this.iterable.names);
		}
	}
	class BW extends U1 {
		constructor($, X, J) {
			super();
			this.name = $, this.args = X, this.async = J;
		}
		render($) {
			return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render($);
		}
	}
	BW.kind = "func";
	class qW extends MW {
		render($) {
			return "return " + super.render($);
		}
	}
	qW.kind = "return";
	class Wj extends U1 {
		render($) {
			let X = "try" + super.render($);
			if (this.catch) X += this.catch.render($);
			if (this.finally) X += this.finally.render($);
			return X;
		}
		optimizeNodes() {
			var $, X;
			return super.optimizeNodes(), ($ = this.catch) === null || $ === void 0 || $.optimizeNodes(), (X = this.finally) === null || X === void 0 || X.optimizeNodes(), this;
		}
		optimizeNames($, X) {
			var J, W;
			return super.optimizeNames($, X), (J = this.catch) === null || J === void 0 || J.optimizeNames($, X), (W = this.finally) === null || W === void 0 || W.optimizeNames($, X), this;
		}
		get names() {
			let $ = super.names;
			if (this.catch) o1($, this.catch.names);
			if (this.finally) o1($, this.finally.names);
			return $;
		}
	}
	class DW extends U1 {
		constructor($) {
			super();
			this.error = $;
		}
		render($) {
			return `catch(${this.error})` + super.render($);
		}
	}
	DW.kind = "catch";
	class FW extends U1 {
		render($) {
			return "finally" + super.render($);
		}
	}
	FW.kind = "finally";
	class Yj {
		constructor($, X = {}) {
			this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = {
				...X,
				_n: X.lines ? `
` : ""
			}, this._extScope = $, this._scope = new i6.Scope({ parent: $ }), this._nodes = [new Xj()];
		}
		toString() {
			return this._root.render(this.opts);
		}
		name($) {
			return this._scope.name($);
		}
		scopeName($) {
			return this._extScope.name($);
		}
		scopeValue($, X) {
			let J = this._extScope.value($, X);
			return (this._values[J.prefix] || (this._values[J.prefix] = /* @__PURE__ */ new Set())).add(J), J;
		}
		getScopeValue($, X) {
			return this._extScope.getValue($, X);
		}
		scopeRefs($) {
			return this._extScope.scopeRefs($, this._values);
		}
		scopeCode() {
			return this._extScope.scopeCode(this._values);
		}
		_def($, X, J, W) {
			let Q = this._scope.toName(X);
			if (J !== void 0 && W) this._constants[Q.str] = J;
			return this._leafNode(new oF($, Q, J)), Q;
		}
		const($, X, J) {
			return this._def(i6.varKinds.const, $, X, J);
		}
		let($, X, J) {
			return this._def(i6.varKinds.let, $, X, J);
		}
		var($, X, J) {
			return this._def(i6.varKinds.var, $, X, J);
		}
		assign($, X, J) {
			return this._leafNode(new _U($, X, J));
		}
		add($, X) {
			return this._leafNode(new tF($, K6.operators.ADD, X));
		}
		code($) {
			if (typeof $ == "function") $();
			else if ($ !== Q$.nil) this._leafNode(new $j($));
			return this;
		}
		object(...$) {
			let X = ["{"];
			for (let [J, W] of $) {
				if (X.length > 1) X.push(",");
				if (X.push(J), J !== W || this.opts.es5) X.push(":"), (0, Q$.addCodeArg)(X, W);
			}
			return X.push("}"), new Q$._Code(X);
		}
		if($, X, J) {
			if (this._blockNode(new P4($)), X && J) this.code(X).else().code(J).endIf();
			else if (X) this.code(X).endIf();
			else if (J) throw Error("CodeGen: \"else\" body without \"then\" body");
			return this;
		}
		elseIf($) {
			return this._elseNode(new P4($));
		}
		else() {
			return this._elseNode(new YJ());
		}
		endIf() {
			return this._endBlockNode(P4, YJ);
		}
		_for($, X) {
			if (this._blockNode($), X) this.code(X).endFor();
			return this;
		}
		for($, X) {
			return this._for(new Jj($), X);
		}
		forRange($, X, J, W, Q = this.opts.es5 ? i6.varKinds.var : i6.varKinds.let) {
			let Y = this._scope.toName($);
			return this._for(new Qj(Q, Y, X, J), () => W(Y));
		}
		forOf($, X, J, W = i6.varKinds.const) {
			let Q = this._scope.toName($);
			if (this.opts.es5) {
				let Y = X instanceof Q$.Name ? X : this.var("_arr", X);
				return this.forRange("_i", 0, Q$._`${Y}.length`, (z) => {
					this.var(Q, Q$._`${Y}[${z}]`), J(Q);
				});
			}
			return this._for(new CU("of", W, Q, X), () => J(Q));
		}
		forIn($, X, J, W = this.opts.es5 ? i6.varKinds.var : i6.varKinds.const) {
			if (this.opts.ownProperties) return this.forOf($, Q$._`Object.keys(${X})`, J);
			let Q = this._scope.toName($);
			return this._for(new CU("in", W, Q, X), () => J(Q));
		}
		endFor() {
			return this._endBlockNode(U8);
		}
		label($) {
			return this._leafNode(new aF($));
		}
		break($) {
			return this._leafNode(new sF($));
		}
		return($) {
			let X = new qW();
			if (this._blockNode(X), this.code($), X.nodes.length !== 1) throw Error("CodeGen: \"return\" should have one node");
			return this._endBlockNode(qW);
		}
		try($, X, J) {
			if (!X && !J) throw Error("CodeGen: \"try\" without \"catch\" and \"finally\"");
			let W = new Wj();
			if (this._blockNode(W), this.code($), X) {
				let Q = this.name("e");
				this._currNode = W.catch = new DW(Q), X(Q);
			}
			if (J) this._currNode = W.finally = new FW(), this.code(J);
			return this._endBlockNode(DW, FW);
		}
		throw($) {
			return this._leafNode(new eF($));
		}
		block($, X) {
			if (this._blockStarts.push(this._nodes.length), $) this.code($).endBlock(X);
			return this;
		}
		endBlock($) {
			let X = this._blockStarts.pop();
			if (X === void 0) throw Error("CodeGen: not in self-balancing block");
			let J = this._nodes.length - X;
			if (J < 0 || $ !== void 0 && J !== $) throw Error(`CodeGen: wrong number of nodes: ${J} vs ${$} expected`);
			return this._nodes.length = X, this;
		}
		func($, X = Q$.nil, J, W) {
			if (this._blockNode(new BW($, X, J)), W) this.code(W).endFunc();
			return this;
		}
		endFunc() {
			return this._endBlockNode(BW);
		}
		optimize($ = 1) {
			while ($-- > 0) this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
		}
		_leafNode($) {
			return this._currNode.nodes.push($), this;
		}
		_blockNode($) {
			this._currNode.nodes.push($), this._nodes.push($);
		}
		_endBlockNode($, X) {
			let J = this._currNode;
			if (J instanceof $ || X && J instanceof X) return this._nodes.pop(), this;
			throw Error(`CodeGen: not in block "${X ? `${$.kind}/${X.kind}` : $.kind}"`);
		}
		_elseNode($) {
			let X = this._currNode;
			if (!(X instanceof P4)) throw Error("CodeGen: \"else\" without \"if\"");
			return this._currNode = X.else = $, this;
		}
		get _root() {
			return this._nodes[0];
		}
		get _currNode() {
			let $ = this._nodes;
			return $[$.length - 1];
		}
		set _currNode($) {
			let X = this._nodes;
			X[X.length - 1] = $;
		}
	}
	K6.CodeGen = Yj;
	function o1($, X) {
		for (let J in X) $[J] = ($[J] || 0) + (X[J] || 0);
		return $;
	}
	function jW($, X) {
		return X instanceof Q$._CodeOrName ? o1($, X.names) : $;
	}
	function K8($, X, J) {
		if ($ instanceof Q$.Name) return W($);
		if (!Q($)) return $;
		return new Q$._Code($._items.reduce((Y, z) => {
			if (z instanceof Q$.Name) z = W(z);
			if (z instanceof Q$._Code) Y.push(...z._items);
			else Y.push(z);
			return Y;
		}, []));
		function W(Y) {
			let z = J[Y.str];
			if (z === void 0 || X[Y.str] !== 1) return Y;
			return delete X[Y.str], z;
		}
		function Q(Y) {
			return Y instanceof Q$._Code && Y._items.some((z) => z instanceof Q$.Name && X[z.str] === 1 && J[z.str] !== void 0);
		}
	}
	function ST($, X) {
		for (let J in X) $[J] = ($[J] || 0) - (X[J] || 0);
	}
	function zj($) {
		return typeof $ == "boolean" || typeof $ == "number" || $ === null ? !$ : Q$._`!${kU($)}`;
	}
	K6.not = zj;
	var vT = Gj(K6.operators.AND);
	function CT(...$) {
		return $.reduce(vT);
	}
	K6.and = CT;
	var kT = Gj(K6.operators.OR);
	function _T(...$) {
		return $.reduce(kT);
	}
	K6.or = _T;
	function Gj($) {
		return (X, J) => X === Q$.nil ? J : J === Q$.nil ? X : Q$._`${kU(X)} ${$} ${kU(J)}`;
	}
	function kU($) {
		return $ instanceof Q$.Name ? $ : Q$._`(${$})`;
	}
});
var W$ = M((qj) => {
	Object.defineProperty(qj, "__esModule", { value: !0 });
	qj.checkStrictMode = qj.getErrorPath = qj.Type = qj.useFunc = qj.setEvaluated = qj.evaluatedPropsToName = qj.mergeEvaluated = qj.eachItem = qj.unescapeJsonPointer = qj.escapeJsonPointer = qj.escapeFragment = qj.unescapeFragment = qj.schemaRefOrVal = qj.schemaHasRulesButRef = qj.schemaHasRules = qj.checkUnknownRules = qj.alwaysValidSchema = qj.toHash = void 0;
	var B$ = a(), yT = WJ();
	function gT($) {
		let X = {};
		for (let J of $) X[J] = !0;
		return X;
	}
	qj.toHash = gT;
	function hT($, X) {
		if (typeof X == "boolean") return X;
		if (Object.keys(X).length === 0) return !0;
		return Vj($, X), !Nj(X, $.self.RULES.all);
	}
	qj.alwaysValidSchema = hT;
	function Vj($, X = $.schema) {
		let { opts: J, self: W } = $;
		if (!J.strictSchema) return;
		if (typeof X === "boolean") return;
		let Q = W.RULES.keywords;
		for (let Y in X) if (!Q[Y]) Bj($, `unknown keyword: "${Y}"`);
	}
	qj.checkUnknownRules = Vj;
	function Nj($, X) {
		if (typeof $ == "boolean") return !$;
		for (let J in $) if (X[J]) return !0;
		return !1;
	}
	qj.schemaHasRules = Nj;
	function uT($, X) {
		if (typeof $ == "boolean") return !$;
		for (let J in $) if (J !== "$ref" && X.all[J]) return !0;
		return !1;
	}
	qj.schemaHasRulesButRef = uT;
	function mT({ topSchemaRef: $, schemaPath: X }, J, W, Q) {
		if (!Q) {
			if (typeof J == "number" || typeof J == "boolean") return J;
			if (typeof J == "string") return B$._`${J}`;
		}
		return B$._`${$}${X}${(0, B$.getProperty)(W)}`;
	}
	qj.schemaRefOrVal = mT;
	function lT($) {
		return Oj(decodeURIComponent($));
	}
	qj.unescapeFragment = lT;
	function cT($) {
		return encodeURIComponent(TU($));
	}
	qj.escapeFragment = cT;
	function TU($) {
		if (typeof $ == "number") return `${$}`;
		return $.replace(/~/g, "~0").replace(/\//g, "~1");
	}
	qj.escapeJsonPointer = TU;
	function Oj($) {
		return $.replace(/~1/g, "/").replace(/~0/g, "~");
	}
	qj.unescapeJsonPointer = Oj;
	function dT($, X) {
		if (Array.isArray($)) for (let J of $) X(J);
		else X($);
	}
	qj.eachItem = dT;
	function Uj({ mergeNames: $, mergeToName: X, mergeValues: J, resultToName: W }) {
		return (Q, Y, z, G) => {
			let H = z === void 0 ? Y : z instanceof B$.Name ? (Y instanceof B$.Name ? $(Q, Y, z) : X(Q, Y, z), z) : Y instanceof B$.Name ? (X(Q, z, Y), Y) : J(Y, z);
			return G === B$.Name && !(H instanceof B$.Name) ? W(Q, H) : H;
		};
	}
	qj.mergeEvaluated = {
		props: Uj({
			mergeNames: ($, X, J) => $.if(B$._`${J} !== true && ${X} !== undefined`, () => {
				$.if(B$._`${X} === true`, () => $.assign(J, !0), () => $.assign(J, B$._`${J} || {}`).code(B$._`Object.assign(${J}, ${X})`));
			}),
			mergeToName: ($, X, J) => $.if(B$._`${J} !== true`, () => {
				if (X === !0) $.assign(J, !0);
				else $.assign(J, B$._`${J} || {}`), fU($, J, X);
			}),
			mergeValues: ($, X) => $ === !0 ? !0 : {
				...$,
				...X
			},
			resultToName: wj
		}),
		items: Uj({
			mergeNames: ($, X, J) => $.if(B$._`${J} !== true && ${X} !== undefined`, () => $.assign(J, B$._`${X} === true ? true : ${J} > ${X} ? ${J} : ${X}`)),
			mergeToName: ($, X, J) => $.if(B$._`${J} !== true`, () => $.assign(J, X === !0 ? !0 : B$._`${J} > ${X} ? ${J} : ${X}`)),
			mergeValues: ($, X) => $ === !0 ? !0 : Math.max($, X),
			resultToName: ($, X) => $.var("items", X)
		})
	};
	function wj($, X) {
		if (X === !0) return $.var("props", !0);
		let J = $.var("props", B$._`{}`);
		if (X !== void 0) fU($, J, X);
		return J;
	}
	qj.evaluatedPropsToName = wj;
	function fU($, X, J) {
		Object.keys(J).forEach((W) => $.assign(B$._`${X}${(0, B$.getProperty)(W)}`, !0));
	}
	qj.setEvaluated = fU;
	var Kj = {};
	function pT($, X) {
		return $.scopeValue("func", {
			ref: X,
			code: Kj[X.code] || (Kj[X.code] = new yT._Code(X.code))
		});
	}
	qj.useFunc = pT;
	var xU;
	(function($) {
		$[$.Num = 0] = "Num", $[$.Str = 1] = "Str";
	})(xU || (qj.Type = xU = {}));
	function iT($, X, J) {
		if ($ instanceof B$.Name) {
			let W = X === xU.Num;
			return J ? W ? B$._`"[" + ${$} + "]"` : B$._`"['" + ${$} + "']"` : W ? B$._`"/" + ${$}` : B$._`"/" + ${$}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
		}
		return J ? (0, B$.getProperty)($).toString() : "/" + TU($);
	}
	qj.getErrorPath = iT;
	function Bj($, X, J = $.opts.strictSchema) {
		if (!J) return;
		if (X = `strict mode: ${X}`, J === !0) throw Error(X);
		$.self.logger.warn(X);
	}
	qj.checkStrictMode = Bj;
});
var E4 = M((Fj) => {
	Object.defineProperty(Fj, "__esModule", { value: !0 });
	var o$ = a();
	Fj.default = {
		data: new o$.Name("data"),
		valCxt: new o$.Name("valCxt"),
		instancePath: new o$.Name("instancePath"),
		parentData: new o$.Name("parentData"),
		parentDataProperty: new o$.Name("parentDataProperty"),
		rootData: new o$.Name("rootData"),
		dynamicAnchors: new o$.Name("dynamicAnchors"),
		vErrors: new o$.Name("vErrors"),
		errors: new o$.Name("errors"),
		this: new o$.Name("this"),
		self: new o$.Name("self"),
		scope: new o$.Name("scope"),
		json: new o$.Name("json"),
		jsonPos: new o$.Name("jsonPos"),
		jsonLen: new o$.Name("jsonLen"),
		jsonPart: new o$.Name("jsonPart")
	};
});
var zJ = M((Aj) => {
	Object.defineProperty(Aj, "__esModule", { value: !0 });
	Aj.extendErrors = Aj.resetErrorsCount = Aj.reportExtraError = Aj.reportError = Aj.keyword$DataError = Aj.keywordError = void 0;
	var Y$ = a(), IW = W$(), e$ = E4();
	Aj.keywordError = { message: ({ keyword: $ }) => Y$.str`must pass "${$}" keyword validation` };
	Aj.keyword$DataError = { message: ({ keyword: $, schemaType: X }) => X ? Y$.str`"${$}" keyword must be ${X} ($data)` : Y$.str`"${$}" keyword is invalid ($data)` };
	function Nf($, X = Aj.keywordError, J, W) {
		let { it: Q } = $, { gen: Y, compositeRule: z, allErrors: G } = Q, H = Mj($, X, J);
		if (W !== null && W !== void 0 ? W : z || G) jj(Y, H);
		else Lj(Q, Y$._`[${H}]`);
	}
	Aj.reportError = Nf;
	function Of($, X = Aj.keywordError, J) {
		let { it: W } = $, { gen: Q, compositeRule: Y, allErrors: z } = W;
		if (jj(Q, Mj($, X, J)), !(Y || z)) Lj(W, e$.default.vErrors);
	}
	Aj.reportExtraError = Of;
	function wf($, X) {
		$.assign(e$.default.errors, X), $.if(Y$._`${e$.default.vErrors} !== null`, () => $.if(X, () => $.assign(Y$._`${e$.default.vErrors}.length`, X), () => $.assign(e$.default.vErrors, null)));
	}
	Aj.resetErrorsCount = wf;
	function Bf({ gen: $, keyword: X, schemaValue: J, data: W, errsCount: Q, it: Y }) {
		if (Q === void 0) throw Error("ajv implementation error");
		let z = $.name("err");
		$.forRange("i", Q, e$.default.errors, (G) => {
			if ($.const(z, Y$._`${e$.default.vErrors}[${G}]`), $.if(Y$._`${z}.instancePath === undefined`, () => $.assign(Y$._`${z}.instancePath`, (0, Y$.strConcat)(e$.default.instancePath, Y.errorPath))), $.assign(Y$._`${z}.schemaPath`, Y$.str`${Y.errSchemaPath}/${X}`), Y.opts.verbose) $.assign(Y$._`${z}.schema`, J), $.assign(Y$._`${z}.data`, W);
		});
	}
	Aj.extendErrors = Bf;
	function jj($, X) {
		let J = $.const("err", X);
		$.if(Y$._`${e$.default.vErrors} === null`, () => $.assign(e$.default.vErrors, Y$._`[${J}]`), Y$._`${e$.default.vErrors}.push(${J})`), $.code(Y$._`${e$.default.errors}++`);
	}
	function Lj($, X) {
		let { gen: J, validateName: W, schemaEnv: Q } = $;
		if (Q.$async) J.throw(Y$._`new ${$.ValidationError}(${X})`);
		else J.assign(Y$._`${W}.errors`, X), J.return(!1);
	}
	var t1 = {
		keyword: new Y$.Name("keyword"),
		schemaPath: new Y$.Name("schemaPath"),
		params: new Y$.Name("params"),
		propertyName: new Y$.Name("propertyName"),
		message: new Y$.Name("message"),
		schema: new Y$.Name("schema"),
		parentSchema: new Y$.Name("parentSchema")
	};
	function Mj($, X, J) {
		let { createErrors: W } = $.it;
		if (W === !1) return Y$._`{}`;
		return qf($, X, J);
	}
	function qf($, X, J = {}) {
		let { gen: W, it: Q } = $, Y = [Df(Q, J), Ff($, J)];
		return jf($, X, Y), W.object(...Y);
	}
	function Df({ errorPath: $ }, { instancePath: X }) {
		let J = X ? Y$.str`${$}${(0, IW.getErrorPath)(X, IW.Type.Str)}` : $;
		return [e$.default.instancePath, (0, Y$.strConcat)(e$.default.instancePath, J)];
	}
	function Ff({ keyword: $, it: { errSchemaPath: X } }, { schemaPath: J, parentSchema: W }) {
		let Q = W ? X : Y$.str`${X}/${$}`;
		if (J) Q = Y$.str`${Q}${(0, IW.getErrorPath)(J, IW.Type.Str)}`;
		return [t1.schemaPath, Q];
	}
	function jf($, { params: X, message: J }, W) {
		let { keyword: Q, data: Y, schemaValue: z, it: G } = $, { opts: H, propertyName: U, topSchemaRef: K, schemaPath: V } = G;
		if (W.push([t1.keyword, Q], [t1.params, typeof X == "function" ? X($) : X || Y$._`{}`]), H.messages) W.push([t1.message, typeof J == "function" ? J($) : J]);
		if (H.verbose) W.push([t1.schema, z], [t1.parentSchema, Y$._`${K}${V}`], [e$.default.data, Y]);
		if (U) W.push([t1.propertyName, U]);
	}
});
var Pj = M((bj) => {
	Object.defineProperty(bj, "__esModule", { value: !0 });
	bj.boolOrEmptySchema = bj.topBoolOrEmptySchema = void 0;
	var Zf = zJ(), bf = a(), Rf = E4(), Pf = { message: "boolean schema is false" };
	function Ef($) {
		let { gen: X, schema: J, validateName: W } = $;
		if (J === !1) Zj($, !1);
		else if (typeof J == "object" && J.$async === !0) X.return(Rf.default.data);
		else X.assign(bf._`${W}.errors`, null), X.return(!0);
	}
	bj.topBoolOrEmptySchema = Ef;
	function Sf($, X) {
		let { gen: J, schema: W } = $;
		if (W === !1) J.var(X, !1), Zj($);
		else J.var(X, !0);
	}
	bj.boolOrEmptySchema = Sf;
	function Zj($, X) {
		let { gen: J, data: W } = $, Q = {
			gen: J,
			keyword: "false schema",
			data: W,
			schema: !1,
			schemaCode: !1,
			schemaValue: !1,
			params: {},
			it: $
		};
		(0, Zf.reportError)(Q, Pf, void 0, X);
	}
});
var gU = M((Ej) => {
	Object.defineProperty(Ej, "__esModule", { value: !0 });
	Ej.getRules = Ej.isJSONType = void 0;
	var kf = new Set([
		"string",
		"number",
		"integer",
		"boolean",
		"null",
		"object",
		"array"
	]);
	function _f($) {
		return typeof $ == "string" && kf.has($);
	}
	Ej.isJSONType = _f;
	function xf() {
		let $ = {
			number: {
				type: "number",
				rules: []
			},
			string: {
				type: "string",
				rules: []
			},
			array: {
				type: "array",
				rules: []
			},
			object: {
				type: "object",
				rules: []
			}
		};
		return {
			types: {
				...$,
				integer: !0,
				boolean: !0,
				null: !0
			},
			rules: [
				{ rules: [] },
				$.number,
				$.string,
				$.array,
				$.object
			],
			post: { rules: [] },
			all: {},
			keywords: {}
		};
	}
	Ej.getRules = xf;
});
var hU = M((kj) => {
	Object.defineProperty(kj, "__esModule", { value: !0 });
	kj.shouldUseRule = kj.shouldUseGroup = kj.schemaHasRulesForType = void 0;
	function ff({ schema: $, self: X }, J) {
		let W = X.RULES.types[J];
		return W && W !== !0 && vj($, W);
	}
	kj.schemaHasRulesForType = ff;
	function vj($, X) {
		return X.rules.some((J) => Cj($, J));
	}
	kj.shouldUseGroup = vj;
	function Cj($, X) {
		var J;
		return $[X.keyword] !== void 0 || ((J = X.definition.implements) === null || J === void 0 ? void 0 : J.some((W) => $[W] !== void 0));
	}
	kj.shouldUseRule = Cj;
});
var GJ = M((yj) => {
	Object.defineProperty(yj, "__esModule", { value: !0 });
	yj.reportTypeError = yj.checkDataTypes = yj.checkDataType = yj.coerceAndCheckDataType = yj.getJSONTypes = yj.getSchemaTypes = yj.DataType = void 0;
	var hf = gU(), uf = hU(), mf = zJ(), t = a(), xj = W$(), V8;
	(function($) {
		$[$.Correct = 0] = "Correct", $[$.Wrong = 1] = "Wrong";
	})(V8 || (yj.DataType = V8 = {}));
	function lf($) {
		let X = Tj($.type);
		if (X.includes("null")) {
			if ($.nullable === !1) throw Error("type: null contradicts nullable: false");
		} else {
			if (!X.length && $.nullable !== void 0) throw Error("\"nullable\" cannot be used without \"type\"");
			if ($.nullable === !0) X.push("null");
		}
		return X;
	}
	yj.getSchemaTypes = lf;
	function Tj($) {
		let X = Array.isArray($) ? $ : $ ? [$] : [];
		if (X.every(hf.isJSONType)) return X;
		throw Error("type must be JSONType or JSONType[]: " + X.join(","));
	}
	yj.getJSONTypes = Tj;
	function cf($, X) {
		let { gen: J, data: W, opts: Q } = $, Y = df(X, Q.coerceTypes), z = X.length > 0 && !(Y.length === 0 && X.length === 1 && (0, uf.schemaHasRulesForType)($, X[0]));
		if (z) {
			let G = mU(X, W, Q.strictNumbers, V8.Wrong);
			J.if(G, () => {
				if (Y.length) pf($, X, Y);
				else lU($);
			});
		}
		return z;
	}
	yj.coerceAndCheckDataType = cf;
	var fj = new Set([
		"string",
		"number",
		"integer",
		"boolean",
		"null"
	]);
	function df($, X) {
		return X ? $.filter((J) => fj.has(J) || X === "array" && J === "array") : [];
	}
	function pf($, X, J) {
		let { gen: W, data: Q, opts: Y } = $, z = W.let("dataType", t._`typeof ${Q}`), G = W.let("coerced", t._`undefined`);
		if (Y.coerceTypes === "array") W.if(t._`${z} == 'object' && Array.isArray(${Q}) && ${Q}.length == 1`, () => W.assign(Q, t._`${Q}[0]`).assign(z, t._`typeof ${Q}`).if(mU(X, Q, Y.strictNumbers), () => W.assign(G, Q)));
		W.if(t._`${G} !== undefined`);
		for (let U of J) if (fj.has(U) || U === "array" && Y.coerceTypes === "array") H(U);
		W.else(), lU($), W.endIf(), W.if(t._`${G} !== undefined`, () => {
			W.assign(Q, G), nf($, G);
		});
		function H(U) {
			switch (U) {
				case "string":
					W.elseIf(t._`${z} == "number" || ${z} == "boolean"`).assign(G, t._`"" + ${Q}`).elseIf(t._`${Q} === null`).assign(G, t._`""`);
					return;
				case "number":
					W.elseIf(t._`${z} == "boolean" || ${Q} === null
              || (${z} == "string" && ${Q} && ${Q} == +${Q})`).assign(G, t._`+${Q}`);
					return;
				case "integer":
					W.elseIf(t._`${z} === "boolean" || ${Q} === null
              || (${z} === "string" && ${Q} && ${Q} == +${Q} && !(${Q} % 1))`).assign(G, t._`+${Q}`);
					return;
				case "boolean":
					W.elseIf(t._`${Q} === "false" || ${Q} === 0 || ${Q} === null`).assign(G, !1).elseIf(t._`${Q} === "true" || ${Q} === 1`).assign(G, !0);
					return;
				case "null":
					W.elseIf(t._`${Q} === "" || ${Q} === 0 || ${Q} === false`), W.assign(G, null);
					return;
				case "array": W.elseIf(t._`${z} === "string" || ${z} === "number"
              || ${z} === "boolean" || ${Q} === null`).assign(G, t._`[${Q}]`);
			}
		}
	}
	function nf({ gen: $, parentData: X, parentDataProperty: J }, W) {
		$.if(t._`${X} !== undefined`, () => $.assign(t._`${X}[${J}]`, W));
	}
	function uU($, X, J, W = V8.Correct) {
		let Q = W === V8.Correct ? t.operators.EQ : t.operators.NEQ, Y;
		switch ($) {
			case "null": return t._`${X} ${Q} null`;
			case "array":
				Y = t._`Array.isArray(${X})`;
				break;
			case "object":
				Y = t._`${X} && typeof ${X} == "object" && !Array.isArray(${X})`;
				break;
			case "integer":
				Y = z(t._`!(${X} % 1) && !isNaN(${X})`);
				break;
			case "number":
				Y = z();
				break;
			default: return t._`typeof ${X} ${Q} ${$}`;
		}
		return W === V8.Correct ? Y : (0, t.not)(Y);
		function z(G = t.nil) {
			return (0, t.and)(t._`typeof ${X} == "number"`, G, J ? t._`isFinite(${X})` : t.nil);
		}
	}
	yj.checkDataType = uU;
	function mU($, X, J, W) {
		if ($.length === 1) return uU($[0], X, J, W);
		let Q, Y = (0, xj.toHash)($);
		if (Y.array && Y.object) {
			let z = t._`typeof ${X} != "object"`;
			Q = Y.null ? z : t._`!${X} || ${z}`, delete Y.null, delete Y.array, delete Y.object;
		} else Q = t.nil;
		if (Y.number) delete Y.integer;
		for (let z in Y) Q = (0, t.and)(Q, uU(z, X, J, W));
		return Q;
	}
	yj.checkDataTypes = mU;
	var rf = {
		message: ({ schema: $ }) => `must be ${$}`,
		params: ({ schema: $, schemaValue: X }) => typeof $ == "string" ? t._`{type: ${$}}` : t._`{type: ${X}}`
	};
	function lU($) {
		let X = of($);
		(0, mf.reportError)(X, rf);
	}
	yj.reportTypeError = lU;
	function of($) {
		let { gen: X, data: J, schema: W } = $, Q = (0, xj.schemaRefOrVal)($, W, "type");
		return {
			gen: X,
			keyword: "type",
			data: J,
			schema: W.type,
			schemaCode: Q,
			schemaValue: Q,
			parentSchema: W,
			params: {},
			it: $
		};
	}
});
var lj = M((uj) => {
	Object.defineProperty(uj, "__esModule", { value: !0 });
	uj.assignDefaults = void 0;
	var N8 = a(), Jy = W$();
	function Qy($, X) {
		let { properties: J, items: W } = $.schema;
		if (X === "object" && J) for (let Q in J) hj($, Q, J[Q].default);
		else if (X === "array" && Array.isArray(W)) W.forEach((Q, Y) => hj($, Y, Q.default));
	}
	uj.assignDefaults = Qy;
	function hj($, X, J) {
		let { gen: W, compositeRule: Q, data: Y, opts: z } = $;
		if (J === void 0) return;
		let G = N8._`${Y}${(0, N8.getProperty)(X)}`;
		if (Q) {
			(0, Jy.checkStrictMode)($, `default is ignored for: ${G}`);
			return;
		}
		let H = N8._`${G} === undefined`;
		if (z.useDefaults === "empty") H = N8._`${H} || ${G} === null || ${G} === ""`;
		W.if(H, N8._`${G} = ${(0, N8.stringify)(J)}`);
	}
});
var C6 = M((pj) => {
	Object.defineProperty(pj, "__esModule", { value: !0 });
	pj.validateUnion = pj.validateArray = pj.usePattern = pj.callValidateCode = pj.schemaProperties = pj.allSchemaProperties = pj.noPropertyInData = pj.propertyInData = pj.isOwnProperty = pj.hasPropFunc = pj.reportMissingProp = pj.checkMissingProp = pj.checkReportMissingProp = void 0;
	var M$ = a(), cU = W$(), K1 = E4(), Wy = W$();
	function Yy($, X) {
		let { gen: J, data: W, it: Q } = $;
		J.if(pU(J, W, X, Q.opts.ownProperties), () => {
			$.setParams({ missingProperty: M$._`${X}` }, !0), $.error();
		});
	}
	pj.checkReportMissingProp = Yy;
	function zy({ gen: $, data: X, it: { opts: J } }, W, Q) {
		return (0, M$.or)(...W.map((Y) => (0, M$.and)(pU($, X, Y, J.ownProperties), M$._`${Q} = ${Y}`)));
	}
	pj.checkMissingProp = zy;
	function Gy($, X) {
		$.setParams({ missingProperty: X }, !0), $.error();
	}
	pj.reportMissingProp = Gy;
	function cj($) {
		return $.scopeValue("func", {
			ref: Object.prototype.hasOwnProperty,
			code: M$._`Object.prototype.hasOwnProperty`
		});
	}
	pj.hasPropFunc = cj;
	function dU($, X, J) {
		return M$._`${cj($)}.call(${X}, ${J})`;
	}
	pj.isOwnProperty = dU;
	function Hy($, X, J, W) {
		let Q = M$._`${X}${(0, M$.getProperty)(J)} !== undefined`;
		return W ? M$._`${Q} && ${dU($, X, J)}` : Q;
	}
	pj.propertyInData = Hy;
	function pU($, X, J, W) {
		let Q = M$._`${X}${(0, M$.getProperty)(J)} === undefined`;
		return W ? (0, M$.or)(Q, (0, M$.not)(dU($, X, J))) : Q;
	}
	pj.noPropertyInData = pU;
	function dj($) {
		return $ ? Object.keys($).filter((X) => X !== "__proto__") : [];
	}
	pj.allSchemaProperties = dj;
	function Uy($, X) {
		return dj(X).filter((J) => !(0, cU.alwaysValidSchema)($, X[J]));
	}
	pj.schemaProperties = Uy;
	function Ky({ schemaCode: $, data: X, it: { gen: J, topSchemaRef: W, schemaPath: Q, errorPath: Y }, it: z }, G, H, U) {
		let K = U ? M$._`${$}, ${X}, ${W}${Q}` : X, V = [
			[K1.default.instancePath, (0, M$.strConcat)(K1.default.instancePath, Y)],
			[K1.default.parentData, z.parentData],
			[K1.default.parentDataProperty, z.parentDataProperty],
			[K1.default.rootData, K1.default.rootData]
		];
		if (z.opts.dynamicRef) V.push([K1.default.dynamicAnchors, K1.default.dynamicAnchors]);
		let N = M$._`${K}, ${J.object(...V)}`;
		return H !== M$.nil ? M$._`${G}.call(${H}, ${N})` : M$._`${G}(${N})`;
	}
	pj.callValidateCode = Ky;
	var Vy = M$._`new RegExp`;
	function Ny({ gen: $, it: { opts: X } }, J) {
		let W = X.unicodeRegExp ? "u" : "", { regExp: Q } = X.code, Y = Q(J, W);
		return $.scopeValue("pattern", {
			key: Y.toString(),
			ref: Y,
			code: M$._`${Q.code === "new RegExp" ? Vy : (0, Wy.useFunc)($, Q)}(${J}, ${W})`
		});
	}
	pj.usePattern = Ny;
	function Oy($) {
		let { gen: X, data: J, keyword: W, it: Q } = $, Y = X.name("valid");
		if (Q.allErrors) {
			let G = X.let("valid", !0);
			return z(() => X.assign(G, !1)), G;
		}
		return X.var(Y, !0), z(() => X.break()), Y;
		function z(G) {
			let H = X.const("len", M$._`${J}.length`);
			X.forRange("i", 0, H, (U) => {
				$.subschema({
					keyword: W,
					dataProp: U,
					dataPropType: cU.Type.Num
				}, Y), X.if((0, M$.not)(Y), G);
			});
		}
	}
	pj.validateArray = Oy;
	function wy($) {
		let { gen: X, schema: J, keyword: W, it: Q } = $;
		if (!Array.isArray(J)) throw Error("ajv implementation error");
		if (J.some((H) => (0, cU.alwaysValidSchema)(Q, H)) && !Q.opts.unevaluated) return;
		let z = X.let("valid", !1), G = X.name("_valid");
		X.block(() => J.forEach((H, U) => {
			let K = $.subschema({
				keyword: W,
				schemaProp: U,
				compositeRule: !0
			}, G);
			if (X.assign(z, M$._`${z} || ${G}`), !$.mergeValidEvaluated(K, G)) X.if((0, M$.not)(z));
		})), $.result(z, () => $.reset(), () => $.error(!0));
	}
	pj.validateUnion = wy;
});
var aj = M((oj) => {
	Object.defineProperty(oj, "__esModule", { value: !0 });
	oj.validateKeywordUsage = oj.validSchemaType = oj.funcKeywordCode = oj.macroKeywordCode = void 0;
	var $6 = a(), a1 = E4(), Py = C6(), Ey = zJ();
	function Sy($, X) {
		let { gen: J, keyword: W, schema: Q, parentSchema: Y, it: z } = $, G = X.macro.call(z.self, Q, Y, z), H = rj(J, W, G);
		if (z.opts.validateSchema !== !1) z.self.validateSchema(G, !0);
		let U = J.name("valid");
		$.subschema({
			schema: G,
			schemaPath: $6.nil,
			errSchemaPath: `${z.errSchemaPath}/${W}`,
			topSchemaRef: H,
			compositeRule: !0
		}, U), $.pass(U, () => $.error(!0));
	}
	oj.macroKeywordCode = Sy;
	function vy($, X) {
		var J;
		let { gen: W, keyword: Q, schema: Y, parentSchema: z, $data: G, it: H } = $;
		ky(H, X);
		let K = rj(W, Q, !G && X.compile ? X.compile.call(H.self, Y, z, H) : X.validate), V = W.let("valid");
		$.block$data(V, N), $.ok((J = X.valid) !== null && J !== void 0 ? J : V);
		function N() {
			if (X.errors === !1) {
				if (B(), X.modifying) nj($);
				F(() => $.error());
			} else {
				let j = X.async ? O() : w();
				if (X.modifying) nj($);
				F(() => Cy($, j));
			}
		}
		function O() {
			let j = W.let("ruleErrs", null);
			return W.try(() => B($6._`await `), (I) => W.assign(V, !1).if($6._`${I} instanceof ${H.ValidationError}`, () => W.assign(j, $6._`${I}.errors`), () => W.throw(I))), j;
		}
		function w() {
			let j = $6._`${K}.errors`;
			return W.assign(j, null), B($6.nil), j;
		}
		function B(j = X.async ? $6._`await ` : $6.nil) {
			let I = H.opts.passContext ? a1.default.this : a1.default.self, Z = !("compile" in X && !G || X.schema === !1);
			W.assign(V, $6._`${j}${(0, Py.callValidateCode)($, K, I, Z)}`, X.modifying);
		}
		function F(j) {
			var I;
			W.if((0, $6.not)((I = X.valid) !== null && I !== void 0 ? I : V), j);
		}
	}
	oj.funcKeywordCode = vy;
	function nj($) {
		let { gen: X, data: J, it: W } = $;
		X.if(W.parentData, () => X.assign(J, $6._`${W.parentData}[${W.parentDataProperty}]`));
	}
	function Cy($, X) {
		let { gen: J } = $;
		J.if($6._`Array.isArray(${X})`, () => {
			J.assign(a1.default.vErrors, $6._`${a1.default.vErrors} === null ? ${X} : ${a1.default.vErrors}.concat(${X})`).assign(a1.default.errors, $6._`${a1.default.vErrors}.length`), (0, Ey.extendErrors)($);
		}, () => $.error());
	}
	function ky({ schemaEnv: $ }, X) {
		if (X.async && !$.$async) throw Error("async keyword in sync schema");
	}
	function rj($, X, J) {
		if (J === void 0) throw Error(`keyword "${X}" failed to compile`);
		return $.scopeValue("keyword", typeof J == "function" ? { ref: J } : {
			ref: J,
			code: (0, $6.stringify)(J)
		});
	}
	function _y($, X, J = !1) {
		return !X.length || X.some((W) => W === "array" ? Array.isArray($) : W === "object" ? $ && typeof $ == "object" && !Array.isArray($) : typeof $ == W || J && typeof $ > "u");
	}
	oj.validSchemaType = _y;
	function xy({ schema: $, opts: X, self: J, errSchemaPath: W }, Q, Y) {
		if (Array.isArray(Q.keyword) ? !Q.keyword.includes(Y) : Q.keyword !== Y) throw Error("ajv implementation error");
		let z = Q.dependencies;
		if (z === null || z === void 0 ? void 0 : z.some((G) => !Object.prototype.hasOwnProperty.call($, G))) throw Error(`parent schema must have dependencies of ${Y}: ${z.join(",")}`);
		if (Q.validateSchema) {
			if (!Q.validateSchema($[Y])) {
				let H = `keyword "${Y}" value is invalid at path "${W}": ` + J.errorsText(Q.validateSchema.errors);
				if (X.validateSchema === "log") J.logger.error(H);
				else throw Error(H);
			}
		}
	}
	oj.validateKeywordUsage = xy;
});
var XL = M((ej) => {
	Object.defineProperty(ej, "__esModule", { value: !0 });
	ej.extendSubschemaMode = ej.extendSubschemaData = ej.getSubschema = void 0;
	var X4 = a(), sj = W$();
	function gy($, { keyword: X, schemaProp: J, schema: W, schemaPath: Q, errSchemaPath: Y, topSchemaRef: z }) {
		if (X !== void 0 && W !== void 0) throw Error("both \"keyword\" and \"schema\" passed, only one allowed");
		if (X !== void 0) {
			let G = $.schema[X];
			return J === void 0 ? {
				schema: G,
				schemaPath: X4._`${$.schemaPath}${(0, X4.getProperty)(X)}`,
				errSchemaPath: `${$.errSchemaPath}/${X}`
			} : {
				schema: G[J],
				schemaPath: X4._`${$.schemaPath}${(0, X4.getProperty)(X)}${(0, X4.getProperty)(J)}`,
				errSchemaPath: `${$.errSchemaPath}/${X}/${(0, sj.escapeFragment)(J)}`
			};
		}
		if (W !== void 0) {
			if (Q === void 0 || Y === void 0 || z === void 0) throw Error("\"schemaPath\", \"errSchemaPath\" and \"topSchemaRef\" are required with \"schema\"");
			return {
				schema: W,
				schemaPath: Q,
				topSchemaRef: z,
				errSchemaPath: Y
			};
		}
		throw Error("either \"keyword\" or \"schema\" must be passed");
	}
	ej.getSubschema = gy;
	function hy($, X, { dataProp: J, dataPropType: W, data: Q, dataTypes: Y, propertyName: z }) {
		if (Q !== void 0 && J !== void 0) throw Error("both \"data\" and \"dataProp\" passed, only one allowed");
		let { gen: G } = X;
		if (J !== void 0) {
			let { errorPath: U, dataPathArr: K, opts: V } = X;
			H(G.let("data", X4._`${X.data}${(0, X4.getProperty)(J)}`, !0)), $.errorPath = X4.str`${U}${(0, sj.getErrorPath)(J, W, V.jsPropertySyntax)}`, $.parentDataProperty = X4._`${J}`, $.dataPathArr = [...K, $.parentDataProperty];
		}
		if (Q !== void 0) {
			if (H(Q instanceof X4.Name ? Q : G.let("data", Q, !0)), z !== void 0) $.propertyName = z;
		}
		if (Y) $.dataTypes = Y;
		function H(U) {
			$.data = U, $.dataLevel = X.dataLevel + 1, $.dataTypes = [], X.definedProperties = /* @__PURE__ */ new Set(), $.parentData = X.data, $.dataNames = [...X.dataNames, U];
		}
	}
	ej.extendSubschemaData = hy;
	function uy($, { jtdDiscriminator: X, jtdMetadata: J, compositeRule: W, createErrors: Q, allErrors: Y }) {
		if (W !== void 0) $.compositeRule = W;
		if (Q !== void 0) $.createErrors = Q;
		if (Y !== void 0) $.allErrors = Y;
		$.jtdDiscriminator = X, $.jtdMetadata = J;
	}
	ej.extendSubschemaMode = uy;
});
var iU = M((LX$, JL) => {
	JL.exports = function $(X, J) {
		if (X === J) return !0;
		if (X && J && typeof X == "object" && typeof J == "object") {
			if (X.constructor !== J.constructor) return !1;
			var W, Q, Y;
			if (Array.isArray(X)) {
				if (W = X.length, W != J.length) return !1;
				for (Q = W; Q-- !== 0;) if (!$(X[Q], J[Q])) return !1;
				return !0;
			}
			if (X.constructor === RegExp) return X.source === J.source && X.flags === J.flags;
			if (X.valueOf !== Object.prototype.valueOf) return X.valueOf() === J.valueOf();
			if (X.toString !== Object.prototype.toString) return X.toString() === J.toString();
			if (Y = Object.keys(X), W = Y.length, W !== Object.keys(J).length) return !1;
			for (Q = W; Q-- !== 0;) if (!Object.prototype.hasOwnProperty.call(J, Y[Q])) return !1;
			for (Q = W; Q-- !== 0;) {
				var z = Y[Q];
				if (!$(X[z], J[z])) return !1;
			}
			return !0;
		}
		return X !== X && J !== J;
	};
});
var WL = M((MX$, QL) => {
	var V1 = QL.exports = function($, X, J) {
		if (typeof X == "function") J = X, X = {};
		J = X.cb || J;
		var W = typeof J == "function" ? J : J.pre || function() {}, Q = J.post || function() {};
		ZW(X, W, Q, $, "", $);
	};
	V1.keywords = {
		additionalItems: !0,
		items: !0,
		contains: !0,
		additionalProperties: !0,
		propertyNames: !0,
		not: !0,
		if: !0,
		then: !0,
		else: !0
	};
	V1.arrayKeywords = {
		items: !0,
		allOf: !0,
		anyOf: !0,
		oneOf: !0
	};
	V1.propsKeywords = {
		$defs: !0,
		definitions: !0,
		properties: !0,
		patternProperties: !0,
		dependencies: !0
	};
	V1.skipKeywords = {
		default: !0,
		enum: !0,
		const: !0,
		required: !0,
		maximum: !0,
		minimum: !0,
		exclusiveMaximum: !0,
		exclusiveMinimum: !0,
		multipleOf: !0,
		maxLength: !0,
		minLength: !0,
		pattern: !0,
		format: !0,
		maxItems: !0,
		minItems: !0,
		uniqueItems: !0,
		maxProperties: !0,
		minProperties: !0
	};
	function ZW($, X, J, W, Q, Y, z, G, H, U) {
		if (W && typeof W == "object" && !Array.isArray(W)) {
			X(W, Q, Y, z, G, H, U);
			for (var K in W) {
				var V = W[K];
				if (Array.isArray(V)) {
					if (K in V1.arrayKeywords) for (var N = 0; N < V.length; N++) ZW($, X, J, V[N], Q + "/" + K + "/" + N, Y, Q, K, W, N);
				} else if (K in V1.propsKeywords) {
					if (V && typeof V == "object") for (var O in V) ZW($, X, J, V[O], Q + "/" + K + "/" + cy(O), Y, Q, K, W, O);
				} else if (K in V1.keywords || $.allKeys && !(K in V1.skipKeywords)) ZW($, X, J, V, Q + "/" + K, Y, Q, K, W);
			}
			J(W, Q, Y, z, G, H, U);
		}
	}
	function cy($) {
		return $.replace(/~/g, "~0").replace(/\//g, "~1");
	}
});
var HJ = M((HL) => {
	Object.defineProperty(HL, "__esModule", { value: !0 });
	HL.getSchemaRefs = HL.resolveUrl = HL.normalizeId = HL._getFullPath = HL.getFullPath = HL.inlineRef = void 0;
	var dy = W$(), py = iU(), iy = WL(), ny = new Set([
		"type",
		"format",
		"pattern",
		"maxLength",
		"minLength",
		"maxProperties",
		"minProperties",
		"maxItems",
		"minItems",
		"maximum",
		"minimum",
		"uniqueItems",
		"multipleOf",
		"required",
		"enum",
		"const"
	]);
	function ry($, X = !0) {
		if (typeof $ == "boolean") return !0;
		if (X === !0) return !nU($);
		if (!X) return !1;
		return YL($) <= X;
	}
	HL.inlineRef = ry;
	var oy = new Set([
		"$ref",
		"$recursiveRef",
		"$recursiveAnchor",
		"$dynamicRef",
		"$dynamicAnchor"
	]);
	function nU($) {
		for (let X in $) {
			if (oy.has(X)) return !0;
			let J = $[X];
			if (Array.isArray(J) && J.some(nU)) return !0;
			if (typeof J == "object" && nU(J)) return !0;
		}
		return !1;
	}
	function YL($) {
		let X = 0;
		for (let J in $) {
			if (J === "$ref") return Infinity;
			if (X++, ny.has(J)) continue;
			if (typeof $[J] == "object") (0, dy.eachItem)($[J], (W) => X += YL(W));
			if (X === Infinity) return Infinity;
		}
		return X;
	}
	function zL($, X = "", J) {
		if (J !== !1) X = O8(X);
		return GL($, $.parse(X));
	}
	HL.getFullPath = zL;
	function GL($, X) {
		return $.serialize(X).split("#")[0] + "#";
	}
	HL._getFullPath = GL;
	var ty = /#\/?$/;
	function O8($) {
		return $ ? $.replace(ty, "") : "";
	}
	HL.normalizeId = O8;
	function ay($, X, J) {
		return J = O8(J), $.resolve(X, J);
	}
	HL.resolveUrl = ay;
	var sy = /^[a-z_][-a-z0-9._]*$/i;
	function ey($, X) {
		if (typeof $ == "boolean") return {};
		let { schemaId: J, uriResolver: W } = this.opts, Q = O8($[J] || X), Y = { "": Q }, z = zL(W, Q, !1), G = {}, H = /* @__PURE__ */ new Set();
		return iy($, { allKeys: !0 }, (V, N, O, w) => {
			if (w === void 0) return;
			let B = z + N, F = Y[w];
			if (typeof V[J] == "string") F = j.call(this, V[J]);
			I.call(this, V.$anchor), I.call(this, V.$dynamicAnchor), Y[N] = F;
			function j(Z) {
				let _ = this.opts.uriResolver.resolve;
				if (Z = O8(F ? _(F, Z) : Z), H.has(Z)) throw K(Z);
				H.add(Z);
				let T = this.refs[Z];
				if (typeof T == "string") T = this.refs[T];
				if (typeof T == "object") U(V, T.schema, Z);
				else if (Z !== O8(B)) if (Z[0] === "#") U(V, G[Z], Z), G[Z] = V;
				else this.refs[Z] = B;
				return Z;
			}
			function I(Z) {
				if (typeof Z == "string") {
					if (!sy.test(Z)) throw Error(`invalid anchor "${Z}"`);
					j.call(this, `#${Z}`);
				}
			}
		}), G;
		function U(V, N, O) {
			if (N !== void 0 && !py(V, N)) throw K(O);
		}
		function K(V) {
			return Error(`reference "${V}" resolves to more than one schema`);
		}
	}
	HL.getSchemaRefs = ey;
});
var VJ = M((ZL) => {
	Object.defineProperty(ZL, "__esModule", { value: !0 });
	ZL.getData = ZL.KeywordCxt = ZL.validateFunctionCode = void 0;
	var wL = Pj(), KL = GJ(), oU = hU(), bW = GJ(), Yg = lj(), KJ = aj(), rU = XL(), u = a(), n = E4(), zg = HJ(), S4 = W$(), UJ = zJ();
	function Gg($) {
		if (DL($)) {
			if (FL($), qL($)) {
				Kg($);
				return;
			}
		}
		BL($, () => (0, wL.topBoolOrEmptySchema)($));
	}
	ZL.validateFunctionCode = Gg;
	function BL({ gen: $, validateName: X, schema: J, schemaEnv: W, opts: Q }, Y) {
		if (Q.code.es5) $.func(X, u._`${n.default.data}, ${n.default.valCxt}`, W.$async, () => {
			$.code(u._`"use strict"; ${VL(J, Q)}`), Ug($, Q), $.code(Y);
		});
		else $.func(X, u._`${n.default.data}, ${Hg(Q)}`, W.$async, () => $.code(VL(J, Q)).code(Y));
	}
	function Hg($) {
		return u._`{${n.default.instancePath}="", ${n.default.parentData}, ${n.default.parentDataProperty}, ${n.default.rootData}=${n.default.data}${$.dynamicRef ? u._`, ${n.default.dynamicAnchors}={}` : u.nil}}={}`;
	}
	function Ug($, X) {
		$.if(n.default.valCxt, () => {
			if ($.var(n.default.instancePath, u._`${n.default.valCxt}.${n.default.instancePath}`), $.var(n.default.parentData, u._`${n.default.valCxt}.${n.default.parentData}`), $.var(n.default.parentDataProperty, u._`${n.default.valCxt}.${n.default.parentDataProperty}`), $.var(n.default.rootData, u._`${n.default.valCxt}.${n.default.rootData}`), X.dynamicRef) $.var(n.default.dynamicAnchors, u._`${n.default.valCxt}.${n.default.dynamicAnchors}`);
		}, () => {
			if ($.var(n.default.instancePath, u._`""`), $.var(n.default.parentData, u._`undefined`), $.var(n.default.parentDataProperty, u._`undefined`), $.var(n.default.rootData, n.default.data), X.dynamicRef) $.var(n.default.dynamicAnchors, u._`{}`);
		});
	}
	function Kg($) {
		let { schema: X, opts: J, gen: W } = $;
		BL($, () => {
			if (J.$comment && X.$comment) LL($);
			if (Bg($), W.let(n.default.vErrors, null), W.let(n.default.errors, 0), J.unevaluated) Vg($);
			jL($), Fg($);
		});
	}
	function Vg($) {
		let { gen: X, validateName: J } = $;
		$.evaluated = X.const("evaluated", u._`${J}.evaluated`), X.if(u._`${$.evaluated}.dynamicProps`, () => X.assign(u._`${$.evaluated}.props`, u._`undefined`)), X.if(u._`${$.evaluated}.dynamicItems`, () => X.assign(u._`${$.evaluated}.items`, u._`undefined`));
	}
	function VL($, X) {
		let J = typeof $ == "object" && $[X.schemaId];
		return J && (X.code.source || X.code.process) ? u._`/*# sourceURL=${J} */` : u.nil;
	}
	function Ng($, X) {
		if (DL($)) {
			if (FL($), qL($)) {
				Og($, X);
				return;
			}
		}
		(0, wL.boolOrEmptySchema)($, X);
	}
	function qL({ schema: $, self: X }) {
		if (typeof $ == "boolean") return !$;
		for (let J in $) if (X.RULES.all[J]) return !0;
		return !1;
	}
	function DL($) {
		return typeof $.schema != "boolean";
	}
	function Og($, X) {
		let { schema: J, gen: W, opts: Q } = $;
		if (Q.$comment && J.$comment) LL($);
		qg($), Dg($);
		let Y = W.const("_errs", n.default.errors);
		jL($, Y), W.var(X, u._`${Y} === ${n.default.errors}`);
	}
	function FL($) {
		(0, S4.checkUnknownRules)($), wg($);
	}
	function jL($, X) {
		if ($.opts.jtd) return NL($, [], !1, X);
		let J = (0, KL.getSchemaTypes)($.schema);
		NL($, J, !(0, KL.coerceAndCheckDataType)($, J), X);
	}
	function wg($) {
		let { schema: X, errSchemaPath: J, opts: W, self: Q } = $;
		if (X.$ref && W.ignoreKeywordsWithRef && (0, S4.schemaHasRulesButRef)(X, Q.RULES)) Q.logger.warn(`$ref: keywords ignored in schema at path "${J}"`);
	}
	function Bg($) {
		let { schema: X, opts: J } = $;
		if (X.default !== void 0 && J.useDefaults && J.strictSchema) (0, S4.checkStrictMode)($, "default is ignored in the schema root");
	}
	function qg($) {
		let X = $.schema[$.opts.schemaId];
		if (X) $.baseId = (0, zg.resolveUrl)($.opts.uriResolver, $.baseId, X);
	}
	function Dg($) {
		if ($.schema.$async && !$.schemaEnv.$async) throw Error("async schema in sync schema");
	}
	function LL({ gen: $, schemaEnv: X, schema: J, errSchemaPath: W, opts: Q }) {
		let Y = J.$comment;
		if (Q.$comment === !0) $.code(u._`${n.default.self}.logger.log(${Y})`);
		else if (typeof Q.$comment == "function") {
			let z = u.str`${W}/$comment`, G = $.scopeValue("root", { ref: X.root });
			$.code(u._`${n.default.self}.opts.$comment(${Y}, ${z}, ${G}.schema)`);
		}
	}
	function Fg($) {
		let { gen: X, schemaEnv: J, validateName: W, ValidationError: Q, opts: Y } = $;
		if (J.$async) X.if(u._`${n.default.errors} === 0`, () => X.return(n.default.data), () => X.throw(u._`new ${Q}(${n.default.vErrors})`));
		else {
			if (X.assign(u._`${W}.errors`, n.default.vErrors), Y.unevaluated) jg($);
			X.return(u._`${n.default.errors} === 0`);
		}
	}
	function jg({ gen: $, evaluated: X, props: J, items: W }) {
		if (J instanceof u.Name) $.assign(u._`${X}.props`, J);
		if (W instanceof u.Name) $.assign(u._`${X}.items`, W);
	}
	function NL($, X, J, W) {
		let { gen: Q, schema: Y, data: z, allErrors: G, opts: H, self: U } = $, { RULES: K } = U;
		if (Y.$ref && (H.ignoreKeywordsWithRef || !(0, S4.schemaHasRulesButRef)(Y, K))) {
			Q.block(() => AL($, "$ref", K.all.$ref.definition));
			return;
		}
		if (!H.jtd) Lg($, X);
		Q.block(() => {
			for (let N of K.rules) V(N);
			V(K.post);
		});
		function V(N) {
			if (!(0, oU.shouldUseGroup)(Y, N)) return;
			if (N.type) {
				if (Q.if((0, bW.checkDataType)(N.type, z, H.strictNumbers)), OL($, N), X.length === 1 && X[0] === N.type && J) Q.else(), (0, bW.reportTypeError)($);
				Q.endIf();
			} else OL($, N);
			if (!G) Q.if(u._`${n.default.errors} === ${W || 0}`);
		}
	}
	function OL($, X) {
		let { gen: J, schema: W, opts: { useDefaults: Q } } = $;
		if (Q) (0, Yg.assignDefaults)($, X.type);
		J.block(() => {
			for (let Y of X.rules) if ((0, oU.shouldUseRule)(W, Y)) AL($, Y.keyword, Y.definition, X.type);
		});
	}
	function Lg($, X) {
		if ($.schemaEnv.meta || !$.opts.strictTypes) return;
		if (Mg($, X), !$.opts.allowUnionTypes) Ag($, X);
		Ig($, $.dataTypes);
	}
	function Mg($, X) {
		if (!X.length) return;
		if (!$.dataTypes.length) {
			$.dataTypes = X;
			return;
		}
		X.forEach((J) => {
			if (!ML($.dataTypes, J)) tU($, `type "${J}" not allowed by context "${$.dataTypes.join(",")}"`);
		}), bg($, X);
	}
	function Ag($, X) {
		if (X.length > 1 && !(X.length === 2 && X.includes("null"))) tU($, "use allowUnionTypes to allow union type keyword");
	}
	function Ig($, X) {
		let J = $.self.RULES.all;
		for (let W in J) {
			let Q = J[W];
			if (typeof Q == "object" && (0, oU.shouldUseRule)($.schema, Q)) {
				let { type: Y } = Q.definition;
				if (Y.length && !Y.some((z) => Zg(X, z))) tU($, `missing type "${Y.join(",")}" for keyword "${W}"`);
			}
		}
	}
	function Zg($, X) {
		return $.includes(X) || X === "number" && $.includes("integer");
	}
	function ML($, X) {
		return $.includes(X) || X === "integer" && $.includes("number");
	}
	function bg($, X) {
		let J = [];
		for (let W of $.dataTypes) if (ML(X, W)) J.push(W);
		else if (X.includes("integer") && W === "number") J.push("integer");
		$.dataTypes = J;
	}
	function tU($, X) {
		let J = $.schemaEnv.baseId + $.errSchemaPath;
		X += ` at "${J}" (strictTypes)`, (0, S4.checkStrictMode)($, X, $.opts.strictTypes);
	}
	class aU {
		constructor($, X, J) {
			if ((0, KJ.validateKeywordUsage)($, X, J), this.gen = $.gen, this.allErrors = $.allErrors, this.keyword = J, this.data = $.data, this.schema = $.schema[J], this.$data = X.$data && $.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, S4.schemaRefOrVal)($, this.schema, J, this.$data), this.schemaType = X.schemaType, this.parentSchema = $.schema, this.params = {}, this.it = $, this.def = X, this.$data) this.schemaCode = $.gen.const("vSchema", IL(this.$data, $));
			else if (this.schemaCode = this.schemaValue, !(0, KJ.validSchemaType)(this.schema, X.schemaType, X.allowUndefined)) throw Error(`${J} value must be ${JSON.stringify(X.schemaType)}`);
			if ("code" in X ? X.trackErrors : X.errors !== !1) this.errsCount = $.gen.const("_errs", n.default.errors);
		}
		result($, X, J) {
			this.failResult((0, u.not)($), X, J);
		}
		failResult($, X, J) {
			if (this.gen.if($), J) J();
			else this.error();
			if (X) {
				if (this.gen.else(), X(), this.allErrors) this.gen.endIf();
			} else if (this.allErrors) this.gen.endIf();
			else this.gen.else();
		}
		pass($, X) {
			this.failResult((0, u.not)($), void 0, X);
		}
		fail($) {
			if ($ === void 0) {
				if (this.error(), !this.allErrors) this.gen.if(!1);
				return;
			}
			if (this.gen.if($), this.error(), this.allErrors) this.gen.endIf();
			else this.gen.else();
		}
		fail$data($) {
			if (!this.$data) return this.fail($);
			let { schemaCode: X } = this;
			this.fail(u._`${X} !== undefined && (${(0, u.or)(this.invalid$data(), $)})`);
		}
		error($, X, J) {
			if (X) {
				this.setParams(X), this._error($, J), this.setParams({});
				return;
			}
			this._error($, J);
		}
		_error($, X) {
			($ ? UJ.reportExtraError : UJ.reportError)(this, this.def.error, X);
		}
		$dataError() {
			(0, UJ.reportError)(this, this.def.$dataError || UJ.keyword$DataError);
		}
		reset() {
			if (this.errsCount === void 0) throw Error("add \"trackErrors\" to keyword definition");
			(0, UJ.resetErrorsCount)(this.gen, this.errsCount);
		}
		ok($) {
			if (!this.allErrors) this.gen.if($);
		}
		setParams($, X) {
			if (X) Object.assign(this.params, $);
			else this.params = $;
		}
		block$data($, X, J = u.nil) {
			this.gen.block(() => {
				this.check$data($, J), X();
			});
		}
		check$data($ = u.nil, X = u.nil) {
			if (!this.$data) return;
			let { gen: J, schemaCode: W, schemaType: Q, def: Y } = this;
			if (J.if((0, u.or)(u._`${W} === undefined`, X)), $ !== u.nil) J.assign($, !0);
			if (Q.length || Y.validateSchema) {
				if (J.elseIf(this.invalid$data()), this.$dataError(), $ !== u.nil) J.assign($, !1);
			}
			J.else();
		}
		invalid$data() {
			let { gen: $, schemaCode: X, schemaType: J, def: W, it: Q } = this;
			return (0, u.or)(Y(), z());
			function Y() {
				if (J.length) {
					if (!(X instanceof u.Name)) throw Error("ajv implementation error");
					let G = Array.isArray(J) ? J : [J];
					return u._`${(0, bW.checkDataTypes)(G, X, Q.opts.strictNumbers, bW.DataType.Wrong)}`;
				}
				return u.nil;
			}
			function z() {
				if (W.validateSchema) {
					let G = $.scopeValue("validate$data", { ref: W.validateSchema });
					return u._`!${G}(${X})`;
				}
				return u.nil;
			}
		}
		subschema($, X) {
			let J = (0, rU.getSubschema)(this.it, $);
			(0, rU.extendSubschemaData)(J, this.it, $), (0, rU.extendSubschemaMode)(J, $);
			let W = {
				...this.it,
				...J,
				items: void 0,
				props: void 0
			};
			return Ng(W, X), W;
		}
		mergeEvaluated($, X) {
			let { it: J, gen: W } = this;
			if (!J.opts.unevaluated) return;
			if (J.props !== !0 && $.props !== void 0) J.props = S4.mergeEvaluated.props(W, $.props, J.props, X);
			if (J.items !== !0 && $.items !== void 0) J.items = S4.mergeEvaluated.items(W, $.items, J.items, X);
		}
		mergeValidEvaluated($, X) {
			let { it: J, gen: W } = this;
			if (J.opts.unevaluated && (J.props !== !0 || J.items !== !0)) return W.if(X, () => this.mergeEvaluated($, u.Name)), !0;
		}
	}
	ZL.KeywordCxt = aU;
	function AL($, X, J, W) {
		let Q = new aU($, J, X);
		if ("code" in J) J.code(Q, W);
		else if (Q.$data && J.validate) (0, KJ.funcKeywordCode)(Q, J);
		else if ("macro" in J) (0, KJ.macroKeywordCode)(Q, J);
		else if (J.compile || J.validate) (0, KJ.funcKeywordCode)(Q, J);
	}
	var Rg = /^\/(?:[^~]|~0|~1)*$/, Pg = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
	function IL($, { dataLevel: X, dataNames: J, dataPathArr: W }) {
		let Q, Y;
		if ($ === "") return n.default.rootData;
		if ($[0] === "/") {
			if (!Rg.test($)) throw Error(`Invalid JSON-pointer: ${$}`);
			Q = $, Y = n.default.rootData;
		} else {
			let U = Pg.exec($);
			if (!U) throw Error(`Invalid JSON-pointer: ${$}`);
			let K = +U[1];
			if (Q = U[2], Q === "#") {
				if (K >= X) throw Error(H("property/index", K));
				return W[X - K];
			}
			if (K > X) throw Error(H("data", K));
			if (Y = J[X - K], !Q) return Y;
		}
		let z = Y, G = Q.split("/");
		for (let U of G) if (U) Y = u._`${Y}${(0, u.getProperty)((0, S4.unescapeJsonPointer)(U))}`, z = u._`${z} && ${Y}`;
		return z;
		function H(U, K) {
			return `Cannot access ${U} ${K} levels up, current level is ${X}`;
		}
	}
	ZL.getData = IL;
});
var RW = M((PL) => {
	Object.defineProperty(PL, "__esModule", { value: !0 });
	class RL extends Error {
		constructor($) {
			super("validation failed");
			this.errors = $, this.ajv = this.validation = !0;
		}
	}
	PL.default = RL;
});
var NJ = M((SL) => {
	Object.defineProperty(SL, "__esModule", { value: !0 });
	var sU = HJ();
	class EL extends Error {
		constructor($, X, J, W) {
			super(W || `can't resolve reference ${J} from id ${X}`);
			this.missingRef = (0, sU.resolveUrl)($, X, J), this.missingSchema = (0, sU.normalizeId)((0, sU.getFullPath)($, this.missingRef));
		}
	}
	SL.default = EL;
});
var EW = M((kL) => {
	Object.defineProperty(kL, "__esModule", { value: !0 });
	kL.resolveSchema = kL.getCompilingSchema = kL.resolveRef = kL.compileSchema = kL.SchemaEnv = void 0;
	var n6 = a(), kg = RW(), s1 = E4(), r6 = HJ(), vL = W$(), _g = VJ();
	class OJ {
		constructor($) {
			var X;
			this.refs = {}, this.dynamicAnchors = {};
			let J;
			if (typeof $.schema == "object") J = $.schema;
			this.schema = $.schema, this.schemaId = $.schemaId, this.root = $.root || this, this.baseId = (X = $.baseId) !== null && X !== void 0 ? X : (0, r6.normalizeId)(J === null || J === void 0 ? void 0 : J[$.schemaId || "$id"]), this.schemaPath = $.schemaPath, this.localRefs = $.localRefs, this.meta = $.meta, this.$async = J === null || J === void 0 ? void 0 : J.$async, this.refs = {};
		}
	}
	kL.SchemaEnv = OJ;
	function $K($) {
		let X = CL.call(this, $);
		if (X) return X;
		let J = (0, r6.getFullPath)(this.opts.uriResolver, $.root.baseId), { es5: W, lines: Q } = this.opts.code, { ownProperties: Y } = this.opts, z = new n6.CodeGen(this.scope, {
			es5: W,
			lines: Q,
			ownProperties: Y
		}), G;
		if ($.$async) G = z.scopeValue("Error", {
			ref: kg.default,
			code: n6._`require("ajv/dist/runtime/validation_error").default`
		});
		let H = z.scopeName("validate");
		$.validateName = H;
		let U = {
			gen: z,
			allErrors: this.opts.allErrors,
			data: s1.default.data,
			parentData: s1.default.parentData,
			parentDataProperty: s1.default.parentDataProperty,
			dataNames: [s1.default.data],
			dataPathArr: [n6.nil],
			dataLevel: 0,
			dataTypes: [],
			definedProperties: /* @__PURE__ */ new Set(),
			topSchemaRef: z.scopeValue("schema", this.opts.code.source === !0 ? {
				ref: $.schema,
				code: (0, n6.stringify)($.schema)
			} : { ref: $.schema }),
			validateName: H,
			ValidationError: G,
			schema: $.schema,
			schemaEnv: $,
			rootId: J,
			baseId: $.baseId || J,
			schemaPath: n6.nil,
			errSchemaPath: $.schemaPath || (this.opts.jtd ? "" : "#"),
			errorPath: n6._`""`,
			opts: this.opts,
			self: this
		}, K;
		try {
			this._compilations.add($), (0, _g.validateFunctionCode)(U), z.optimize(this.opts.code.optimize);
			let V = z.toString();
			if (K = `${z.scopeRefs(s1.default.scope)}return ${V}`, this.opts.code.process) K = this.opts.code.process(K, $);
			let O = Function(`${s1.default.self}`, `${s1.default.scope}`, K)(this, this.scope.get());
			if (this.scope.value(H, { ref: O }), O.errors = null, O.schema = $.schema, O.schemaEnv = $, $.$async) O.$async = !0;
			if (this.opts.code.source === !0) O.source = {
				validateName: H,
				validateCode: V,
				scopeValues: z._values
			};
			if (this.opts.unevaluated) {
				let { props: w, items: B } = U;
				if (O.evaluated = {
					props: w instanceof n6.Name ? void 0 : w,
					items: B instanceof n6.Name ? void 0 : B,
					dynamicProps: w instanceof n6.Name,
					dynamicItems: B instanceof n6.Name
				}, O.source) O.source.evaluated = (0, n6.stringify)(O.evaluated);
			}
			return $.validate = O, $;
		} catch (V) {
			if (delete $.validate, delete $.validateName, K) this.logger.error("Error compiling schema, function code:", K);
			throw V;
		} finally {
			this._compilations.delete($);
		}
	}
	kL.compileSchema = $K;
	function xg($, X, J) {
		var W;
		J = (0, r6.resolveUrl)(this.opts.uriResolver, X, J);
		let Q = $.refs[J];
		if (Q) return Q;
		let Y = yg.call(this, $, J);
		if (Y === void 0) {
			let z = (W = $.localRefs) === null || W === void 0 ? void 0 : W[J], { schemaId: G } = this.opts;
			if (z) Y = new OJ({
				schema: z,
				schemaId: G,
				root: $,
				baseId: X
			});
		}
		if (Y === void 0) return;
		return $.refs[J] = Tg.call(this, Y);
	}
	kL.resolveRef = xg;
	function Tg($) {
		if ((0, r6.inlineRef)($.schema, this.opts.inlineRefs)) return $.schema;
		return $.validate ? $ : $K.call(this, $);
	}
	function CL($) {
		for (let X of this._compilations) if (fg(X, $)) return X;
	}
	kL.getCompilingSchema = CL;
	function fg($, X) {
		return $.schema === X.schema && $.root === X.root && $.baseId === X.baseId;
	}
	function yg($, X) {
		let J;
		while (typeof (J = this.refs[X]) == "string") X = J;
		return J || this.schemas[X] || PW.call(this, $, X);
	}
	function PW($, X) {
		let J = this.opts.uriResolver.parse(X), W = (0, r6._getFullPath)(this.opts.uriResolver, J), Q = (0, r6.getFullPath)(this.opts.uriResolver, $.baseId, void 0);
		if (Object.keys($.schema).length > 0 && W === Q) return eU.call(this, J, $);
		let Y = (0, r6.normalizeId)(W), z = this.refs[Y] || this.schemas[Y];
		if (typeof z == "string") {
			let G = PW.call(this, $, z);
			if (typeof (G === null || G === void 0 ? void 0 : G.schema) !== "object") return;
			return eU.call(this, J, G);
		}
		if (typeof (z === null || z === void 0 ? void 0 : z.schema) !== "object") return;
		if (!z.validate) $K.call(this, z);
		if (Y === (0, r6.normalizeId)(X)) {
			let { schema: G } = z, { schemaId: H } = this.opts, U = G[H];
			if (U) Q = (0, r6.resolveUrl)(this.opts.uriResolver, Q, U);
			return new OJ({
				schema: G,
				schemaId: H,
				root: $,
				baseId: Q
			});
		}
		return eU.call(this, J, z);
	}
	kL.resolveSchema = PW;
	var gg = new Set([
		"properties",
		"patternProperties",
		"enum",
		"dependencies",
		"definitions"
	]);
	function eU($, { baseId: X, schema: J, root: W }) {
		var Q;
		if (((Q = $.fragment) === null || Q === void 0 ? void 0 : Q[0]) !== "/") return;
		for (let G of $.fragment.slice(1).split("/")) {
			if (typeof J === "boolean") return;
			let H = J[(0, vL.unescapeFragment)(G)];
			if (H === void 0) return;
			J = H;
			let U = typeof J === "object" && J[this.opts.schemaId];
			if (!gg.has(G) && U) X = (0, r6.resolveUrl)(this.opts.uriResolver, X, U);
		}
		let Y;
		if (typeof J != "boolean" && J.$ref && !(0, vL.schemaHasRulesButRef)(J, this.RULES)) {
			let G = (0, r6.resolveUrl)(this.opts.uriResolver, X, J.$ref);
			Y = PW.call(this, W, G);
		}
		let { schemaId: z } = this.opts;
		if (Y = Y || new OJ({
			schema: J,
			schemaId: z,
			root: W,
			baseId: X
		}), Y.schema !== Y.root.schema) return Y;
	}
});
var xL = M((PX$, cg) => {
	cg.exports = {
		$id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
		description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
		type: "object",
		required: ["$data"],
		properties: { $data: {
			type: "string",
			anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
		} },
		additionalProperties: !1
	};
});
var fL = M((EX$, TL) => {
	TL.exports = { HEX: {
		0: 0,
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		5: 5,
		6: 6,
		7: 7,
		8: 8,
		9: 9,
		a: 10,
		A: 10,
		b: 11,
		B: 11,
		c: 12,
		C: 12,
		d: 13,
		D: 13,
		e: 14,
		E: 14,
		f: 15,
		F: 15
	} };
});
var dL = M((SX$, cL) => {
	var { HEX: pg } = fL(), ig = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
	function uL($) {
		if (lL($, ".") < 3) return {
			host: $,
			isIPV4: !1
		};
		let [J] = $.match(ig) || [];
		if (J) return {
			host: rg(J, "."),
			isIPV4: !0
		};
		else return {
			host: $,
			isIPV4: !1
		};
	}
	function XK($, X = !1) {
		let J = "", W = !0;
		for (let Q of $) {
			if (pg[Q] === void 0) return;
			if (Q !== "0" && W === !0) W = !1;
			if (!W) J += Q;
		}
		if (X && J.length === 0) J = "0";
		return J;
	}
	function ng($) {
		let X = 0, J = {
			error: !1,
			address: "",
			zone: ""
		}, W = [], Q = [], Y = !1, z = !1, G = !1;
		function H() {
			if (Q.length) {
				if (Y === !1) {
					let U = XK(Q);
					if (U !== void 0) W.push(U);
					else return J.error = !0, !1;
				}
				Q.length = 0;
			}
			return !0;
		}
		for (let U = 0; U < $.length; U++) {
			let K = $[U];
			if (K === "[" || K === "]") continue;
			if (K === ":") {
				if (z === !0) G = !0;
				if (!H()) break;
				if (X++, W.push(":"), X > 7) {
					J.error = !0;
					break;
				}
				if (U - 1 >= 0 && $[U - 1] === ":") z = !0;
				continue;
			} else if (K === "%") {
				if (!H()) break;
				Y = !0;
			} else {
				Q.push(K);
				continue;
			}
		}
		if (Q.length) if (Y) J.zone = Q.join("");
		else if (G) W.push(Q.join(""));
		else W.push(XK(Q));
		return J.address = W.join(""), J;
	}
	function mL($) {
		if (lL($, ":") < 2) return {
			host: $,
			isIPV6: !1
		};
		let X = ng($);
		if (!X.error) {
			let { address: J, address: W } = X;
			if (X.zone) J += "%" + X.zone, W += "%25" + X.zone;
			return {
				host: J,
				escapedHost: W,
				isIPV6: !0
			};
		} else return {
			host: $,
			isIPV6: !1
		};
	}
	function rg($, X) {
		let J = "", W = !0, Q = $.length;
		for (let Y = 0; Y < Q; Y++) {
			let z = $[Y];
			if (z === "0" && W) {
				if (Y + 1 <= Q && $[Y + 1] === X || Y + 1 === Q) J += z, W = !1;
			} else {
				if (z === X) W = !0;
				else W = !1;
				J += z;
			}
		}
		return J;
	}
	function lL($, X) {
		let J = 0;
		for (let W = 0; W < $.length; W++) if ($[W] === X) J++;
		return J;
	}
	var yL = /^\.\.?\//u, gL = /^\/\.(?:\/|$)/u, hL = /^\/\.\.(?:\/|$)/u, og = /^\/?(?:.|\n)*?(?=\/|$)/u;
	function tg($) {
		let X = [];
		while ($.length) if ($.match(yL)) $ = $.replace(yL, "");
		else if ($.match(gL)) $ = $.replace(gL, "/");
		else if ($.match(hL)) $ = $.replace(hL, "/"), X.pop();
		else if ($ === "." || $ === "..") $ = "";
		else {
			let J = $.match(og);
			if (J) {
				let W = J[0];
				$ = $.slice(W.length), X.push(W);
			} else throw Error("Unexpected dot segment condition");
		}
		return X.join("");
	}
	function ag($, X) {
		let J = X !== !0 ? escape : unescape;
		if ($.scheme !== void 0) $.scheme = J($.scheme);
		if ($.userinfo !== void 0) $.userinfo = J($.userinfo);
		if ($.host !== void 0) $.host = J($.host);
		if ($.path !== void 0) $.path = J($.path);
		if ($.query !== void 0) $.query = J($.query);
		if ($.fragment !== void 0) $.fragment = J($.fragment);
		return $;
	}
	function sg($) {
		let X = [];
		if ($.userinfo !== void 0) X.push($.userinfo), X.push("@");
		if ($.host !== void 0) {
			let J = unescape($.host), W = uL(J);
			if (W.isIPV4) J = W.host;
			else {
				let Q = mL(W.host);
				if (Q.isIPV6 === !0) J = `[${Q.escapedHost}]`;
				else J = $.host;
			}
			X.push(J);
		}
		if (typeof $.port === "number" || typeof $.port === "string") X.push(":"), X.push(String($.port));
		return X.length ? X.join("") : void 0;
	}
	cL.exports = {
		recomposeAuthority: sg,
		normalizeComponentEncoding: ag,
		removeDotSegments: tg,
		normalizeIPv4: uL,
		normalizeIPv6: mL,
		stringArrayToHexStripped: XK
	};
});
var tL = M((vX$, oL) => {
	var eg = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu, $h = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
	function pL($) {
		return typeof $.secure === "boolean" ? $.secure : String($.scheme).toLowerCase() === "wss";
	}
	function iL($) {
		if (!$.host) $.error = $.error || "HTTP URIs must have a host.";
		return $;
	}
	function nL($) {
		let X = String($.scheme).toLowerCase() === "https";
		if ($.port === (X ? 443 : 80) || $.port === "") $.port = void 0;
		if (!$.path) $.path = "/";
		return $;
	}
	function Xh($) {
		return $.secure = pL($), $.resourceName = ($.path || "/") + ($.query ? "?" + $.query : ""), $.path = void 0, $.query = void 0, $;
	}
	function Jh($) {
		if ($.port === (pL($) ? 443 : 80) || $.port === "") $.port = void 0;
		if (typeof $.secure === "boolean") $.scheme = $.secure ? "wss" : "ws", $.secure = void 0;
		if ($.resourceName) {
			let [X, J] = $.resourceName.split("?");
			$.path = X && X !== "/" ? X : void 0, $.query = J, $.resourceName = void 0;
		}
		return $.fragment = void 0, $;
	}
	function Qh($, X) {
		if (!$.path) return $.error = "URN can not be parsed", $;
		let J = $.path.match($h);
		if (J) {
			let W = X.scheme || $.scheme || "urn";
			$.nid = J[1].toLowerCase(), $.nss = J[2];
			let Y = JK[`${W}:${X.nid || $.nid}`];
			if ($.path = void 0, Y) $ = Y.parse($, X);
		} else $.error = $.error || "URN can not be parsed.";
		return $;
	}
	function Wh($, X) {
		let J = X.scheme || $.scheme || "urn", W = $.nid.toLowerCase(), Y = JK[`${J}:${X.nid || W}`];
		if (Y) $ = Y.serialize($, X);
		let z = $, G = $.nss;
		return z.path = `${W || X.nid}:${G}`, X.skipEscape = !0, z;
	}
	function Yh($, X) {
		let J = $;
		if (J.uuid = J.nss, J.nss = void 0, !X.tolerant && (!J.uuid || !eg.test(J.uuid))) J.error = J.error || "UUID is not valid.";
		return J;
	}
	function zh($) {
		let X = $;
		return X.nss = ($.uuid || "").toLowerCase(), X;
	}
	var rL = {
		scheme: "http",
		domainHost: !0,
		parse: iL,
		serialize: nL
	}, Gh = {
		scheme: "https",
		domainHost: rL.domainHost,
		parse: iL,
		serialize: nL
	}, SW = {
		scheme: "ws",
		domainHost: !0,
		parse: Xh,
		serialize: Jh
	}, JK = {
		http: rL,
		https: Gh,
		ws: SW,
		wss: {
			scheme: "wss",
			domainHost: SW.domainHost,
			parse: SW.parse,
			serialize: SW.serialize
		},
		urn: {
			scheme: "urn",
			parse: Qh,
			serialize: Wh,
			skipNormalize: !0
		},
		"urn:uuid": {
			scheme: "urn:uuid",
			parse: Yh,
			serialize: zh,
			skipNormalize: !0
		}
	};
	oL.exports = JK;
});
var sL = M((CX$, CW) => {
	var { normalizeIPv6: Vh, normalizeIPv4: Nh, removeDotSegments: wJ, recomposeAuthority: Oh, normalizeComponentEncoding: vW } = dL(), QK = tL();
	function wh($, X) {
		if (typeof $ === "string") $ = J4(v4($, X), X);
		else if (typeof $ === "object") $ = v4(J4($, X), X);
		return $;
	}
	function Bh($, X, J) {
		let W = Object.assign({ scheme: "null" }, J);
		return J4(aL(v4($, W), v4(X, W), W, !0), {
			...W,
			skipEscape: !0
		});
	}
	function aL($, X, J, W) {
		let Q = {};
		if (!W) $ = v4(J4($, J), J), X = v4(J4(X, J), J);
		if (J = J || {}, !J.tolerant && X.scheme) Q.scheme = X.scheme, Q.userinfo = X.userinfo, Q.host = X.host, Q.port = X.port, Q.path = wJ(X.path || ""), Q.query = X.query;
		else {
			if (X.userinfo !== void 0 || X.host !== void 0 || X.port !== void 0) Q.userinfo = X.userinfo, Q.host = X.host, Q.port = X.port, Q.path = wJ(X.path || ""), Q.query = X.query;
			else {
				if (!X.path) if (Q.path = $.path, X.query !== void 0) Q.query = X.query;
				else Q.query = $.query;
				else {
					if (X.path.charAt(0) === "/") Q.path = wJ(X.path);
					else {
						if (($.userinfo !== void 0 || $.host !== void 0 || $.port !== void 0) && !$.path) Q.path = "/" + X.path;
						else if (!$.path) Q.path = X.path;
						else Q.path = $.path.slice(0, $.path.lastIndexOf("/") + 1) + X.path;
						Q.path = wJ(Q.path);
					}
					Q.query = X.query;
				}
				Q.userinfo = $.userinfo, Q.host = $.host, Q.port = $.port;
			}
			Q.scheme = $.scheme;
		}
		return Q.fragment = X.fragment, Q;
	}
	function qh($, X, J) {
		if (typeof $ === "string") $ = unescape($), $ = J4(vW(v4($, J), !0), {
			...J,
			skipEscape: !0
		});
		else if (typeof $ === "object") $ = J4(vW($, !0), {
			...J,
			skipEscape: !0
		});
		if (typeof X === "string") X = unescape(X), X = J4(vW(v4(X, J), !0), {
			...J,
			skipEscape: !0
		});
		else if (typeof X === "object") X = J4(vW(X, !0), {
			...J,
			skipEscape: !0
		});
		return $.toLowerCase() === X.toLowerCase();
	}
	function J4($, X) {
		let J = {
			host: $.host,
			scheme: $.scheme,
			userinfo: $.userinfo,
			port: $.port,
			path: $.path,
			query: $.query,
			nid: $.nid,
			nss: $.nss,
			uuid: $.uuid,
			fragment: $.fragment,
			reference: $.reference,
			resourceName: $.resourceName,
			secure: $.secure,
			error: ""
		}, W = Object.assign({}, X), Q = [], Y = QK[(W.scheme || J.scheme || "").toLowerCase()];
		if (Y && Y.serialize) Y.serialize(J, W);
		if (J.path !== void 0) if (!W.skipEscape) {
			if (J.path = escape(J.path), J.scheme !== void 0) J.path = J.path.split("%3A").join(":");
		} else J.path = unescape(J.path);
		if (W.reference !== "suffix" && J.scheme) Q.push(J.scheme, ":");
		let z = Oh(J);
		if (z !== void 0) {
			if (W.reference !== "suffix") Q.push("//");
			if (Q.push(z), J.path && J.path.charAt(0) !== "/") Q.push("/");
		}
		if (J.path !== void 0) {
			let G = J.path;
			if (!W.absolutePath && (!Y || !Y.absolutePath)) G = wJ(G);
			if (z === void 0) G = G.replace(/^\/\//u, "/%2F");
			Q.push(G);
		}
		if (J.query !== void 0) Q.push("?", J.query);
		if (J.fragment !== void 0) Q.push("#", J.fragment);
		return Q.join("");
	}
	var Dh = Array.from({ length: 127 }, ($, X) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(X)));
	function Fh($) {
		let X = 0;
		for (let J = 0, W = $.length; J < W; ++J) if (X = $.charCodeAt(J), X > 126 || Dh[X]) return !0;
		return !1;
	}
	var jh = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
	function v4($, X) {
		let J = Object.assign({}, X), W = {
			scheme: void 0,
			userinfo: void 0,
			host: "",
			port: void 0,
			path: "",
			query: void 0,
			fragment: void 0
		}, Q = $.indexOf("%") !== -1, Y = !1;
		if (J.reference === "suffix") $ = (J.scheme ? J.scheme + ":" : "") + "//" + $;
		let z = $.match(jh);
		if (z) {
			if (W.scheme = z[1], W.userinfo = z[3], W.host = z[4], W.port = parseInt(z[5], 10), W.path = z[6] || "", W.query = z[7], W.fragment = z[8], isNaN(W.port)) W.port = z[5];
			if (W.host) {
				let H = Nh(W.host);
				if (H.isIPV4 === !1) {
					let U = Vh(H.host);
					W.host = U.host.toLowerCase(), Y = U.isIPV6;
				} else W.host = H.host, Y = !0;
			}
			if (W.scheme === void 0 && W.userinfo === void 0 && W.host === void 0 && W.port === void 0 && W.query === void 0 && !W.path) W.reference = "same-document";
			else if (W.scheme === void 0) W.reference = "relative";
			else if (W.fragment === void 0) W.reference = "absolute";
			else W.reference = "uri";
			if (J.reference && J.reference !== "suffix" && J.reference !== W.reference) W.error = W.error || "URI is not a " + J.reference + " reference.";
			let G = QK[(J.scheme || W.scheme || "").toLowerCase()];
			if (!J.unicodeSupport && (!G || !G.unicodeSupport)) {
				if (W.host && (J.domainHost || G && G.domainHost) && Y === !1 && Fh(W.host)) try {
					W.host = URL.domainToASCII(W.host.toLowerCase());
				} catch (H) {
					W.error = W.error || "Host's domain name can not be converted to ASCII: " + H;
				}
			}
			if (!G || G && !G.skipNormalize) {
				if (Q && W.scheme !== void 0) W.scheme = unescape(W.scheme);
				if (Q && W.host !== void 0) W.host = unescape(W.host);
				if (W.path) W.path = escape(unescape(W.path));
				if (W.fragment) W.fragment = encodeURI(decodeURIComponent(W.fragment));
			}
			if (G && G.parse) G.parse(W, J);
		} else W.error = W.error || "URI can not be parsed.";
		return W;
	}
	var WK = {
		SCHEMES: QK,
		normalize: wh,
		resolve: Bh,
		resolveComponents: aL,
		equal: qh,
		serialize: J4,
		parse: v4
	};
	CW.exports = WK;
	CW.exports.default = WK;
	CW.exports.fastUri = WK;
});
var XM = M(($M) => {
	Object.defineProperty($M, "__esModule", { value: !0 });
	var eL = sL();
	eL.code = "require(\"ajv/dist/runtime/uri\").default";
	$M.default = eL;
});
var UM = M((C4) => {
	Object.defineProperty(C4, "__esModule", { value: !0 });
	C4.CodeGen = C4.Name = C4.nil = C4.stringify = C4.str = C4._ = C4.KeywordCxt = void 0;
	var Mh = VJ();
	Object.defineProperty(C4, "KeywordCxt", {
		enumerable: !0,
		get: function() {
			return Mh.KeywordCxt;
		}
	});
	var w8 = a();
	Object.defineProperty(C4, "_", {
		enumerable: !0,
		get: function() {
			return w8._;
		}
	});
	Object.defineProperty(C4, "str", {
		enumerable: !0,
		get: function() {
			return w8.str;
		}
	});
	Object.defineProperty(C4, "stringify", {
		enumerable: !0,
		get: function() {
			return w8.stringify;
		}
	});
	Object.defineProperty(C4, "nil", {
		enumerable: !0,
		get: function() {
			return w8.nil;
		}
	});
	Object.defineProperty(C4, "Name", {
		enumerable: !0,
		get: function() {
			return w8.Name;
		}
	});
	Object.defineProperty(C4, "CodeGen", {
		enumerable: !0,
		get: function() {
			return w8.CodeGen;
		}
	});
	var Ah = RW(), zM = NJ(), Ih = gU(), BJ = EW(), Zh = a(), qJ = HJ(), kW = GJ(), zK = W$(), JM = xL(), bh = XM(), GM = ($, X) => new RegExp($, X);
	GM.code = "new RegExp";
	var Rh = [
		"removeAdditional",
		"useDefaults",
		"coerceTypes"
	], Ph = new Set([
		"validate",
		"serialize",
		"parse",
		"wrapper",
		"root",
		"schema",
		"keyword",
		"pattern",
		"formats",
		"validate$data",
		"func",
		"obj",
		"Error"
	]), Eh = {
		errorDataPath: "",
		format: "`validateFormats: false` can be used instead.",
		nullable: "\"nullable\" keyword is supported by default.",
		jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
		extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
		missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
		processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
		sourceCode: "Use option `code: {source: true}`",
		strictDefaults: "It is default now, see option `strict`.",
		strictKeywords: "It is default now, see option `strict`.",
		uniqueItems: "\"uniqueItems\" keyword is always validated.",
		unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
		cache: "Map is used as cache, schema object as key.",
		serialize: "Map is used as cache, schema object as key.",
		ajvErrors: "It is default now."
	}, Sh = {
		ignoreKeywordsWithRef: "",
		jsPropertySyntax: "",
		unicode: "\"minLength\"/\"maxLength\" account for unicode characters by default."
	}, QM = 200;
	function vh($) {
		var X, J, W, Q, Y, z, G, H, U, K, V, N, O, w, B, F, j, I, Z, _, T, O$, x$, O6, Y4;
		let z4 = $.strict, a6 = (X = $.code) === null || X === void 0 ? void 0 : X.optimize, X0 = a6 === !0 || a6 === void 0 ? 1 : a6 || 0, k4 = (W = (J = $.code) === null || J === void 0 ? void 0 : J.regExp) !== null && W !== void 0 ? W : GM, J0 = (Q = $.uriResolver) !== null && Q !== void 0 ? Q : bh.default;
		return {
			strictSchema: (z = (Y = $.strictSchema) !== null && Y !== void 0 ? Y : z4) !== null && z !== void 0 ? z : !0,
			strictNumbers: (H = (G = $.strictNumbers) !== null && G !== void 0 ? G : z4) !== null && H !== void 0 ? H : !0,
			strictTypes: (K = (U = $.strictTypes) !== null && U !== void 0 ? U : z4) !== null && K !== void 0 ? K : "log",
			strictTuples: (N = (V = $.strictTuples) !== null && V !== void 0 ? V : z4) !== null && N !== void 0 ? N : "log",
			strictRequired: (w = (O = $.strictRequired) !== null && O !== void 0 ? O : z4) !== null && w !== void 0 ? w : !1,
			code: $.code ? {
				...$.code,
				optimize: X0,
				regExp: k4
			} : {
				optimize: X0,
				regExp: k4
			},
			loopRequired: (B = $.loopRequired) !== null && B !== void 0 ? B : QM,
			loopEnum: (F = $.loopEnum) !== null && F !== void 0 ? F : QM,
			meta: (j = $.meta) !== null && j !== void 0 ? j : !0,
			messages: (I = $.messages) !== null && I !== void 0 ? I : !0,
			inlineRefs: (Z = $.inlineRefs) !== null && Z !== void 0 ? Z : !0,
			schemaId: (_ = $.schemaId) !== null && _ !== void 0 ? _ : "$id",
			addUsedSchema: (T = $.addUsedSchema) !== null && T !== void 0 ? T : !0,
			validateSchema: (O$ = $.validateSchema) !== null && O$ !== void 0 ? O$ : !0,
			validateFormats: (x$ = $.validateFormats) !== null && x$ !== void 0 ? x$ : !0,
			unicodeRegExp: (O6 = $.unicodeRegExp) !== null && O6 !== void 0 ? O6 : !0,
			int32range: (Y4 = $.int32range) !== null && Y4 !== void 0 ? Y4 : !0,
			uriResolver: J0
		};
	}
	class _W {
		constructor($ = {}) {
			this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), $ = this.opts = {
				...$,
				...vh($)
			};
			let { es5: X, lines: J } = this.opts.code;
			this.scope = new Zh.ValueScope({
				scope: {},
				prefixes: Ph,
				es5: X,
				lines: J
			}), this.logger = fh($.logger);
			let W = $.validateFormats;
			if ($.validateFormats = !1, this.RULES = (0, Ih.getRules)(), WM.call(this, Eh, $, "NOT SUPPORTED"), WM.call(this, Sh, $, "DEPRECATED", "warn"), this._metaOpts = xh.call(this), $.formats) kh.call(this);
			if (this._addVocabularies(), this._addDefaultMetaSchema(), $.keywords) _h.call(this, $.keywords);
			if (typeof $.meta == "object") this.addMetaSchema($.meta);
			Ch.call(this), $.validateFormats = W;
		}
		_addVocabularies() {
			this.addKeyword("$async");
		}
		_addDefaultMetaSchema() {
			let { $data: $, meta: X, schemaId: J } = this.opts, W = JM;
			if (J === "id") W = { ...JM }, W.id = W.$id, delete W.$id;
			if (X && $) this.addMetaSchema(W, W[J], !1);
		}
		defaultMeta() {
			let { meta: $, schemaId: X } = this.opts;
			return this.opts.defaultMeta = typeof $ == "object" ? $[X] || $ : void 0;
		}
		validate($, X) {
			let J;
			if (typeof $ == "string") {
				if (J = this.getSchema($), !J) throw Error(`no schema with key or ref "${$}"`);
			} else J = this.compile($);
			let W = J(X);
			if (!("$async" in J)) this.errors = J.errors;
			return W;
		}
		compile($, X) {
			let J = this._addSchema($, X);
			return J.validate || this._compileSchemaEnv(J);
		}
		compileAsync($, X) {
			if (typeof this.opts.loadSchema != "function") throw Error("options.loadSchema should be a function");
			let { loadSchema: J } = this.opts;
			return W.call(this, $, X);
			async function W(U, K) {
				await Q.call(this, U.$schema);
				let V = this._addSchema(U, K);
				return V.validate || Y.call(this, V);
			}
			async function Q(U) {
				if (U && !this.getSchema(U)) await W.call(this, { $ref: U }, !0);
			}
			async function Y(U) {
				try {
					return this._compileSchemaEnv(U);
				} catch (K) {
					if (!(K instanceof zM.default)) throw K;
					return z.call(this, K), await G.call(this, K.missingSchema), Y.call(this, U);
				}
			}
			function z({ missingSchema: U, missingRef: K }) {
				if (this.refs[U]) throw Error(`AnySchema ${U} is loaded but ${K} cannot be resolved`);
			}
			async function G(U) {
				let K = await H.call(this, U);
				if (!this.refs[U]) await Q.call(this, K.$schema);
				if (!this.refs[U]) this.addSchema(K, U, X);
			}
			async function H(U) {
				let K = this._loading[U];
				if (K) return K;
				try {
					return await (this._loading[U] = J(U));
				} finally {
					delete this._loading[U];
				}
			}
		}
		addSchema($, X, J, W = this.opts.validateSchema) {
			if (Array.isArray($)) {
				for (let Y of $) this.addSchema(Y, void 0, J, W);
				return this;
			}
			let Q;
			if (typeof $ === "object") {
				let { schemaId: Y } = this.opts;
				if (Q = $[Y], Q !== void 0 && typeof Q != "string") throw Error(`schema ${Y} must be string`);
			}
			return X = (0, qJ.normalizeId)(X || Q), this._checkUnique(X), this.schemas[X] = this._addSchema($, J, X, W, !0), this;
		}
		addMetaSchema($, X, J = this.opts.validateSchema) {
			return this.addSchema($, X, !0, J), this;
		}
		validateSchema($, X) {
			if (typeof $ == "boolean") return !0;
			let J;
			if (J = $.$schema, J !== void 0 && typeof J != "string") throw Error("$schema must be a string");
			if (J = J || this.opts.defaultMeta || this.defaultMeta(), !J) return this.logger.warn("meta-schema not available"), this.errors = null, !0;
			let W = this.validate(J, $);
			if (!W && X) {
				let Q = "schema is invalid: " + this.errorsText();
				if (this.opts.validateSchema === "log") this.logger.error(Q);
				else throw Error(Q);
			}
			return W;
		}
		getSchema($) {
			let X;
			while (typeof (X = YM.call(this, $)) == "string") $ = X;
			if (X === void 0) {
				let { schemaId: J } = this.opts, W = new BJ.SchemaEnv({
					schema: {},
					schemaId: J
				});
				if (X = BJ.resolveSchema.call(this, W, $), !X) return;
				this.refs[$] = X;
			}
			return X.validate || this._compileSchemaEnv(X);
		}
		removeSchema($) {
			if ($ instanceof RegExp) return this._removeAllSchemas(this.schemas, $), this._removeAllSchemas(this.refs, $), this;
			switch (typeof $) {
				case "undefined": return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
				case "string": {
					let X = YM.call(this, $);
					if (typeof X == "object") this._cache.delete(X.schema);
					return delete this.schemas[$], delete this.refs[$], this;
				}
				case "object": {
					let X = $;
					this._cache.delete(X);
					let J = $[this.opts.schemaId];
					if (J) J = (0, qJ.normalizeId)(J), delete this.schemas[J], delete this.refs[J];
					return this;
				}
				default: throw Error("ajv.removeSchema: invalid parameter");
			}
		}
		addVocabulary($) {
			for (let X of $) this.addKeyword(X);
			return this;
		}
		addKeyword($, X) {
			let J;
			if (typeof $ == "string") {
				if (J = $, typeof X == "object") this.logger.warn("these parameters are deprecated, see docs for addKeyword"), X.keyword = J;
			} else if (typeof $ == "object" && X === void 0) {
				if (X = $, J = X.keyword, Array.isArray(J) && !J.length) throw Error("addKeywords: keyword must be string or non-empty array");
			} else throw Error("invalid addKeywords parameters");
			if (gh.call(this, J, X), !X) return (0, zK.eachItem)(J, (Q) => YK.call(this, Q)), this;
			uh.call(this, X);
			let W = {
				...X,
				type: (0, kW.getJSONTypes)(X.type),
				schemaType: (0, kW.getJSONTypes)(X.schemaType)
			};
			return (0, zK.eachItem)(J, W.type.length === 0 ? (Q) => YK.call(this, Q, W) : (Q) => W.type.forEach((Y) => YK.call(this, Q, W, Y))), this;
		}
		getKeyword($) {
			let X = this.RULES.all[$];
			return typeof X == "object" ? X.definition : !!X;
		}
		removeKeyword($) {
			let { RULES: X } = this;
			delete X.keywords[$], delete X.all[$];
			for (let J of X.rules) {
				let W = J.rules.findIndex((Q) => Q.keyword === $);
				if (W >= 0) J.rules.splice(W, 1);
			}
			return this;
		}
		addFormat($, X) {
			if (typeof X == "string") X = new RegExp(X);
			return this.formats[$] = X, this;
		}
		errorsText($ = this.errors, { separator: X = ", ", dataVar: J = "data" } = {}) {
			if (!$ || $.length === 0) return "No errors";
			return $.map((W) => `${J}${W.instancePath} ${W.message}`).reduce((W, Q) => W + X + Q);
		}
		$dataMetaSchema($, X) {
			let J = this.RULES.all;
			$ = JSON.parse(JSON.stringify($));
			for (let W of X) {
				let Q = W.split("/").slice(1), Y = $;
				for (let z of Q) Y = Y[z];
				for (let z in J) {
					let G = J[z];
					if (typeof G != "object") continue;
					let { $data: H } = G.definition, U = Y[z];
					if (H && U) Y[z] = HM(U);
				}
			}
			return $;
		}
		_removeAllSchemas($, X) {
			for (let J in $) {
				let W = $[J];
				if (!X || X.test(J)) {
					if (typeof W == "string") delete $[J];
					else if (W && !W.meta) this._cache.delete(W.schema), delete $[J];
				}
			}
		}
		_addSchema($, X, J, W = this.opts.validateSchema, Q = this.opts.addUsedSchema) {
			let Y, { schemaId: z } = this.opts;
			if (typeof $ == "object") Y = $[z];
			else if (this.opts.jtd) throw Error("schema must be object");
			else if (typeof $ != "boolean") throw Error("schema must be object or boolean");
			let G = this._cache.get($);
			if (G !== void 0) return G;
			J = (0, qJ.normalizeId)(Y || J);
			let H = qJ.getSchemaRefs.call(this, $, J);
			if (G = new BJ.SchemaEnv({
				schema: $,
				schemaId: z,
				meta: X,
				baseId: J,
				localRefs: H
			}), this._cache.set(G.schema, G), Q && !J.startsWith("#")) {
				if (J) this._checkUnique(J);
				this.refs[J] = G;
			}
			if (W) this.validateSchema($, !0);
			return G;
		}
		_checkUnique($) {
			if (this.schemas[$] || this.refs[$]) throw Error(`schema with key or id "${$}" already exists`);
		}
		_compileSchemaEnv($) {
			if ($.meta) this._compileMetaSchema($);
			else BJ.compileSchema.call(this, $);
			if (!$.validate) throw Error("ajv implementation error");
			return $.validate;
		}
		_compileMetaSchema($) {
			let X = this.opts;
			this.opts = this._metaOpts;
			try {
				BJ.compileSchema.call(this, $);
			} finally {
				this.opts = X;
			}
		}
	}
	_W.ValidationError = Ah.default;
	_W.MissingRefError = zM.default;
	C4.default = _W;
	function WM($, X, J, W = "error") {
		for (let Q in $) {
			let Y = Q;
			if (Y in X) this.logger[W](`${J}: option ${Q}. ${$[Y]}`);
		}
	}
	function YM($) {
		return $ = (0, qJ.normalizeId)($), this.schemas[$] || this.refs[$];
	}
	function Ch() {
		let $ = this.opts.schemas;
		if (!$) return;
		if (Array.isArray($)) this.addSchema($);
		else for (let X in $) this.addSchema($[X], X);
	}
	function kh() {
		for (let $ in this.opts.formats) {
			let X = this.opts.formats[$];
			if (X) this.addFormat($, X);
		}
	}
	function _h($) {
		if (Array.isArray($)) {
			this.addVocabulary($);
			return;
		}
		this.logger.warn("keywords option as map is deprecated, pass array");
		for (let X in $) {
			let J = $[X];
			if (!J.keyword) J.keyword = X;
			this.addKeyword(J);
		}
	}
	function xh() {
		let $ = { ...this.opts };
		for (let X of Rh) delete $[X];
		return $;
	}
	var Th = {
		log() {},
		warn() {},
		error() {}
	};
	function fh($) {
		if ($ === !1) return Th;
		if ($ === void 0) return console;
		if ($.log && $.warn && $.error) return $;
		throw Error("logger must implement log, warn and error methods");
	}
	var yh = /^[a-z_$][a-z0-9_$:-]*$/i;
	function gh($, X) {
		let { RULES: J } = this;
		if ((0, zK.eachItem)($, (W) => {
			if (J.keywords[W]) throw Error(`Keyword ${W} is already defined`);
			if (!yh.test(W)) throw Error(`Keyword ${W} has invalid name`);
		}), !X) return;
		if (X.$data && !("code" in X || "validate" in X)) throw Error("$data keyword must have \"code\" or \"validate\" function");
	}
	function YK($, X, J) {
		var W;
		let Q = X === null || X === void 0 ? void 0 : X.post;
		if (J && Q) throw Error("keyword with \"post\" flag cannot have \"type\"");
		let { RULES: Y } = this, z = Q ? Y.post : Y.rules.find(({ type: H }) => H === J);
		if (!z) z = {
			type: J,
			rules: []
		}, Y.rules.push(z);
		if (Y.keywords[$] = !0, !X) return;
		let G = {
			keyword: $,
			definition: {
				...X,
				type: (0, kW.getJSONTypes)(X.type),
				schemaType: (0, kW.getJSONTypes)(X.schemaType)
			}
		};
		if (X.before) hh.call(this, z, G, X.before);
		else z.rules.push(G);
		Y.all[$] = G, (W = X.implements) === null || W === void 0 || W.forEach((H) => this.addKeyword(H));
	}
	function hh($, X, J) {
		let W = $.rules.findIndex((Q) => Q.keyword === J);
		if (W >= 0) $.rules.splice(W, 0, X);
		else $.rules.push(X), this.logger.warn(`rule ${J} is not defined`);
	}
	function uh($) {
		let { metaSchema: X } = $;
		if (X === void 0) return;
		if ($.$data && this.opts.$data) X = HM(X);
		$.validateSchema = this.compile(X, !0);
	}
	var mh = { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" };
	function HM($) {
		return { anyOf: [$, mh] };
	}
});
var VM = M((KM) => {
	Object.defineProperty(KM, "__esModule", { value: !0 });
	KM.default = {
		keyword: "id",
		code() {
			throw Error("NOT SUPPORTED: keyword \"id\", use \"$id\" for schema ID");
		}
	};
});
var DM = M((BM) => {
	Object.defineProperty(BM, "__esModule", { value: !0 });
	BM.callRef = BM.getValidate = void 0;
	var ih = NJ(), NM = C6(), V6 = a(), B8 = E4(), OM = EW(), xW = W$(), nh = {
		keyword: "$ref",
		schemaType: "string",
		code($) {
			let { gen: X, schema: J, it: W } = $, { baseId: Q, schemaEnv: Y, validateName: z, opts: G, self: H } = W, { root: U } = Y;
			if ((J === "#" || J === "#/") && Q === U.baseId) return V();
			let K = OM.resolveRef.call(H, U, Q, J);
			if (K === void 0) throw new ih.default(W.opts.uriResolver, Q, J);
			if (K instanceof OM.SchemaEnv) return N(K);
			return O(K);
			function V() {
				if (Y === U) return TW($, z, Y, Y.$async);
				let w = X.scopeValue("root", { ref: U });
				return TW($, V6._`${w}.validate`, U, U.$async);
			}
			function N(w) {
				TW($, wM($, w), w, w.$async);
			}
			function O(w) {
				let B = X.scopeValue("schema", G.code.source === !0 ? {
					ref: w,
					code: (0, V6.stringify)(w)
				} : { ref: w }), F = X.name("valid"), j = $.subschema({
					schema: w,
					dataTypes: [],
					schemaPath: V6.nil,
					topSchemaRef: B,
					errSchemaPath: J
				}, F);
				$.mergeEvaluated(j), $.ok(F);
			}
		}
	};
	function wM($, X) {
		let { gen: J } = $;
		return X.validate ? J.scopeValue("validate", { ref: X.validate }) : V6._`${J.scopeValue("wrapper", { ref: X })}.validate`;
	}
	BM.getValidate = wM;
	function TW($, X, J, W) {
		let { gen: Q, it: Y } = $, { allErrors: z, schemaEnv: G, opts: H } = Y, U = H.passContext ? B8.default.this : V6.nil;
		if (W) K();
		else V();
		function K() {
			if (!G.$async) throw Error("async schema referenced by sync schema");
			let w = Q.let("valid");
			Q.try(() => {
				if (Q.code(V6._`await ${(0, NM.callValidateCode)($, X, U)}`), O(X), !z) Q.assign(w, !0);
			}, (B) => {
				if (Q.if(V6._`!(${B} instanceof ${Y.ValidationError})`, () => Q.throw(B)), N(B), !z) Q.assign(w, !1);
			}), $.ok(w);
		}
		function V() {
			$.result((0, NM.callValidateCode)($, X, U), () => O(X), () => N(X));
		}
		function N(w) {
			let B = V6._`${w}.errors`;
			Q.assign(B8.default.vErrors, V6._`${B8.default.vErrors} === null ? ${B} : ${B8.default.vErrors}.concat(${B})`), Q.assign(B8.default.errors, V6._`${B8.default.vErrors}.length`);
		}
		function O(w) {
			var B;
			if (!Y.opts.unevaluated) return;
			let F = (B = J === null || J === void 0 ? void 0 : J.validate) === null || B === void 0 ? void 0 : B.evaluated;
			if (Y.props !== !0) if (F && !F.dynamicProps) {
				if (F.props !== void 0) Y.props = xW.mergeEvaluated.props(Q, F.props, Y.props);
			} else {
				let j = Q.var("props", V6._`${w}.evaluated.props`);
				Y.props = xW.mergeEvaluated.props(Q, j, Y.props, V6.Name);
			}
			if (Y.items !== !0) if (F && !F.dynamicItems) {
				if (F.items !== void 0) Y.items = xW.mergeEvaluated.items(Q, F.items, Y.items);
			} else {
				let j = Q.var("items", V6._`${w}.evaluated.items`);
				Y.items = xW.mergeEvaluated.items(Q, j, Y.items, V6.Name);
			}
		}
	}
	BM.callRef = TW;
	BM.default = nh;
});
var jM = M((FM) => {
	Object.defineProperty(FM, "__esModule", { value: !0 });
	var th = VM(), ah = DM();
	FM.default = [
		"$schema",
		"$id",
		"$defs",
		"$vocabulary",
		{ keyword: "$comment" },
		"definitions",
		th.default,
		ah.default
	];
});
var MM = M((LM) => {
	Object.defineProperty(LM, "__esModule", { value: !0 });
	var fW = a(), N1 = fW.operators, yW = {
		maximum: {
			okStr: "<=",
			ok: N1.LTE,
			fail: N1.GT
		},
		minimum: {
			okStr: ">=",
			ok: N1.GTE,
			fail: N1.LT
		},
		exclusiveMaximum: {
			okStr: "<",
			ok: N1.LT,
			fail: N1.GTE
		},
		exclusiveMinimum: {
			okStr: ">",
			ok: N1.GT,
			fail: N1.LTE
		}
	};
	LM.default = {
		keyword: Object.keys(yW),
		type: "number",
		schemaType: "number",
		$data: !0,
		error: {
			message: ({ keyword: $, schemaCode: X }) => fW.str`must be ${yW[$].okStr} ${X}`,
			params: ({ keyword: $, schemaCode: X }) => fW._`{comparison: ${yW[$].okStr}, limit: ${X}}`
		},
		code($) {
			let { keyword: X, data: J, schemaCode: W } = $;
			$.fail$data(fW._`${J} ${yW[X].fail} ${W} || isNaN(${J})`);
		}
	};
});
var IM = M((AM) => {
	Object.defineProperty(AM, "__esModule", { value: !0 });
	var DJ = a();
	AM.default = {
		keyword: "multipleOf",
		type: "number",
		schemaType: "number",
		$data: !0,
		error: {
			message: ({ schemaCode: $ }) => DJ.str`must be multiple of ${$}`,
			params: ({ schemaCode: $ }) => DJ._`{multipleOf: ${$}}`
		},
		code($) {
			let { gen: X, data: J, schemaCode: W, it: Q } = $, Y = Q.opts.multipleOfPrecision, z = X.let("res"), G = Y ? DJ._`Math.abs(Math.round(${z}) - ${z}) > 1e-${Y}` : DJ._`${z} !== parseInt(${z})`;
			$.fail$data(DJ._`(${W} === 0 || (${z} = ${J}/${W}, ${G}))`);
		}
	};
});
var RM = M((bM) => {
	Object.defineProperty(bM, "__esModule", { value: !0 });
	function ZM($) {
		let X = $.length, J = 0, W = 0, Q;
		while (W < X) if (J++, Q = $.charCodeAt(W++), Q >= 55296 && Q <= 56319 && W < X) {
			if (Q = $.charCodeAt(W), (Q & 64512) === 56320) W++;
		}
		return J;
	}
	bM.default = ZM;
	ZM.code = "require(\"ajv/dist/runtime/ucs2length\").default";
});
var EM = M((PM) => {
	Object.defineProperty(PM, "__esModule", { value: !0 });
	var e1 = a(), Gu = W$(), Hu = RM();
	PM.default = {
		keyword: ["maxLength", "minLength"],
		type: "string",
		schemaType: "number",
		$data: !0,
		error: {
			message({ keyword: $, schemaCode: X }) {
				let J = $ === "maxLength" ? "more" : "fewer";
				return e1.str`must NOT have ${J} than ${X} characters`;
			},
			params: ({ schemaCode: $ }) => e1._`{limit: ${$}}`
		},
		code($) {
			let { keyword: X, data: J, schemaCode: W, it: Q } = $, Y = X === "maxLength" ? e1.operators.GT : e1.operators.LT, z = Q.opts.unicode === !1 ? e1._`${J}.length` : e1._`${(0, Gu.useFunc)($.gen, Hu.default)}(${J})`;
			$.fail$data(e1._`${z} ${Y} ${W}`);
		}
	};
});
var vM = M((SM) => {
	Object.defineProperty(SM, "__esModule", { value: !0 });
	var Nu = C6(), Ou = W$(), q8 = a();
	SM.default = {
		keyword: "pattern",
		type: "string",
		schemaType: "string",
		$data: !0,
		error: {
			message: ({ schemaCode: $ }) => q8.str`must match pattern "${$}"`,
			params: ({ schemaCode: $ }) => q8._`{pattern: ${$}}`
		},
		code($) {
			let { gen: X, data: J, $data: W, schema: Q, schemaCode: Y, it: z } = $, G = z.opts.unicodeRegExp ? "u" : "";
			if (W) {
				let { regExp: H } = z.opts.code, U = H.code === "new RegExp" ? q8._`new RegExp` : (0, Ou.useFunc)(X, H), K = X.let("valid");
				X.try(() => X.assign(K, q8._`${U}(${Y}, ${G}).test(${J})`), () => X.assign(K, !1)), $.fail$data(q8._`!${K}`);
			} else {
				let H = (0, Nu.usePattern)($, Q);
				$.fail$data(q8._`!${H}.test(${J})`);
			}
		}
	};
});
var kM = M((CM) => {
	Object.defineProperty(CM, "__esModule", { value: !0 });
	var FJ = a();
	CM.default = {
		keyword: ["maxProperties", "minProperties"],
		type: "object",
		schemaType: "number",
		$data: !0,
		error: {
			message({ keyword: $, schemaCode: X }) {
				let J = $ === "maxProperties" ? "more" : "fewer";
				return FJ.str`must NOT have ${J} than ${X} properties`;
			},
			params: ({ schemaCode: $ }) => FJ._`{limit: ${$}}`
		},
		code($) {
			let { keyword: X, data: J, schemaCode: W } = $, Q = X === "maxProperties" ? FJ.operators.GT : FJ.operators.LT;
			$.fail$data(FJ._`Object.keys(${J}).length ${Q} ${W}`);
		}
	};
});
var xM = M((_M) => {
	Object.defineProperty(_M, "__esModule", { value: !0 });
	var jJ = C6(), LJ = a(), Lu = W$();
	_M.default = {
		keyword: "required",
		type: "object",
		schemaType: "array",
		$data: !0,
		error: {
			message: ({ params: { missingProperty: $ } }) => LJ.str`must have required property '${$}'`,
			params: ({ params: { missingProperty: $ } }) => LJ._`{missingProperty: ${$}}`
		},
		code($) {
			let { gen: X, schema: J, schemaCode: W, data: Q, $data: Y, it: z } = $, { opts: G } = z;
			if (!Y && J.length === 0) return;
			let H = J.length >= G.loopRequired;
			if (z.allErrors) U();
			else K();
			if (G.strictRequired) {
				let O = $.parentSchema.properties, { definedProperties: w } = $.it;
				for (let B of J) if ((O === null || O === void 0 ? void 0 : O[B]) === void 0 && !w.has(B)) {
					let j = `required property "${B}" is not defined at "${z.schemaEnv.baseId + z.errSchemaPath}" (strictRequired)`;
					(0, Lu.checkStrictMode)(z, j, z.opts.strictRequired);
				}
			}
			function U() {
				if (H || Y) $.block$data(LJ.nil, V);
				else for (let O of J) (0, jJ.checkReportMissingProp)($, O);
			}
			function K() {
				let O = X.let("missing");
				if (H || Y) {
					let w = X.let("valid", !0);
					$.block$data(w, () => N(O, w)), $.ok(w);
				} else X.if((0, jJ.checkMissingProp)($, J, O)), (0, jJ.reportMissingProp)($, O), X.else();
			}
			function V() {
				X.forOf("prop", W, (O) => {
					$.setParams({ missingProperty: O }), X.if((0, jJ.noPropertyInData)(X, Q, O, G.ownProperties), () => $.error());
				});
			}
			function N(O, w) {
				$.setParams({ missingProperty: O }), X.forOf(O, W, () => {
					X.assign(w, (0, jJ.propertyInData)(X, Q, O, G.ownProperties)), X.if((0, LJ.not)(w), () => {
						$.error(), X.break();
					});
				}, LJ.nil);
			}
		}
	};
});
var fM = M((TM) => {
	Object.defineProperty(TM, "__esModule", { value: !0 });
	var MJ = a();
	TM.default = {
		keyword: ["maxItems", "minItems"],
		type: "array",
		schemaType: "number",
		$data: !0,
		error: {
			message({ keyword: $, schemaCode: X }) {
				let J = $ === "maxItems" ? "more" : "fewer";
				return MJ.str`must NOT have ${J} than ${X} items`;
			},
			params: ({ schemaCode: $ }) => MJ._`{limit: ${$}}`
		},
		code($) {
			let { keyword: X, data: J, schemaCode: W } = $, Q = X === "maxItems" ? MJ.operators.GT : MJ.operators.LT;
			$.fail$data(MJ._`${J}.length ${Q} ${W}`);
		}
	};
});
var gW = M((gM) => {
	Object.defineProperty(gM, "__esModule", { value: !0 });
	var yM = iU();
	yM.code = "require(\"ajv/dist/runtime/equal\").default";
	gM.default = yM;
});
var uM = M((hM) => {
	Object.defineProperty(hM, "__esModule", { value: !0 });
	var GK = GJ(), p$ = a(), Eu = W$(), Su = gW();
	hM.default = {
		keyword: "uniqueItems",
		type: "array",
		schemaType: "boolean",
		$data: !0,
		error: {
			message: ({ params: { i: $, j: X } }) => p$.str`must NOT have duplicate items (items ## ${X} and ${$} are identical)`,
			params: ({ params: { i: $, j: X } }) => p$._`{i: ${$}, j: ${X}}`
		},
		code($) {
			let { gen: X, data: J, $data: W, schema: Q, parentSchema: Y, schemaCode: z, it: G } = $;
			if (!W && !Q) return;
			let H = X.let("valid"), U = Y.items ? (0, GK.getSchemaTypes)(Y.items) : [];
			$.block$data(H, K, p$._`${z} === false`), $.ok(H);
			function K() {
				let w = X.let("i", p$._`${J}.length`), B = X.let("j");
				$.setParams({
					i: w,
					j: B
				}), X.assign(H, !0), X.if(p$._`${w} > 1`, () => (V() ? N : O)(w, B));
			}
			function V() {
				return U.length > 0 && !U.some((w) => w === "object" || w === "array");
			}
			function N(w, B) {
				let F = X.name("item"), j = (0, GK.checkDataTypes)(U, F, G.opts.strictNumbers, GK.DataType.Wrong), I = X.const("indices", p$._`{}`);
				X.for(p$._`;${w}--;`, () => {
					if (X.let(F, p$._`${J}[${w}]`), X.if(j, p$._`continue`), U.length > 1) X.if(p$._`typeof ${F} == "string"`, p$._`${F} += "_"`);
					X.if(p$._`typeof ${I}[${F}] == "number"`, () => {
						X.assign(B, p$._`${I}[${F}]`), $.error(), X.assign(H, !1).break();
					}).code(p$._`${I}[${F}] = ${w}`);
				});
			}
			function O(w, B) {
				let F = (0, Eu.useFunc)(X, Su.default), j = X.name("outer");
				X.label(j).for(p$._`;${w}--;`, () => X.for(p$._`${B} = ${w}; ${B}--;`, () => X.if(p$._`${F}(${J}[${w}], ${J}[${B}])`, () => {
					$.error(), X.assign(H, !1).break(j);
				})));
			}
		}
	};
});
var lM = M((mM) => {
	Object.defineProperty(mM, "__esModule", { value: !0 });
	var HK = a(), _u = W$(), xu = gW();
	mM.default = {
		keyword: "const",
		$data: !0,
		error: {
			message: "must be equal to constant",
			params: ({ schemaCode: $ }) => HK._`{allowedValue: ${$}}`
		},
		code($) {
			let { gen: X, data: J, $data: W, schemaCode: Q, schema: Y } = $;
			if (W || Y && typeof Y == "object") $.fail$data(HK._`!${(0, _u.useFunc)(X, xu.default)}(${J}, ${Q})`);
			else $.fail(HK._`${Y} !== ${J}`);
		}
	};
});
var dM = M((cM) => {
	Object.defineProperty(cM, "__esModule", { value: !0 });
	var AJ = a(), gu = W$(), hu = gW();
	cM.default = {
		keyword: "enum",
		schemaType: "array",
		$data: !0,
		error: {
			message: "must be equal to one of the allowed values",
			params: ({ schemaCode: $ }) => AJ._`{allowedValues: ${$}}`
		},
		code($) {
			let { gen: X, data: J, $data: W, schema: Q, schemaCode: Y, it: z } = $;
			if (!W && Q.length === 0) throw Error("enum must have non-empty array");
			let G = Q.length >= z.opts.loopEnum, H, U = () => H !== null && H !== void 0 ? H : H = (0, gu.useFunc)(X, hu.default), K;
			if (G || W) K = X.let("valid"), $.block$data(K, V);
			else {
				if (!Array.isArray(Q)) throw Error("ajv implementation error");
				let O = X.const("vSchema", Y);
				K = (0, AJ.or)(...Q.map((w, B) => N(O, B)));
			}
			$.pass(K);
			function V() {
				X.assign(K, !1), X.forOf("v", Y, (O) => X.if(AJ._`${U()}(${J}, ${O})`, () => X.assign(K, !0).break()));
			}
			function N(O, w) {
				let B = Q[w];
				return typeof B === "object" && B !== null ? AJ._`${U()}(${J}, ${O}[${w}])` : AJ._`${J} === ${B}`;
			}
		}
	};
});
var iM = M((pM) => {
	Object.defineProperty(pM, "__esModule", { value: !0 });
	var cu = MM(), du = IM(), pu = EM(), iu = vM(), nu = kM(), ru = xM(), ou = fM(), tu = uM(), au = lM(), su = dM();
	pM.default = [
		cu.default,
		du.default,
		pu.default,
		iu.default,
		nu.default,
		ru.default,
		ou.default,
		tu.default,
		{
			keyword: "type",
			schemaType: ["string", "array"]
		},
		{
			keyword: "nullable",
			schemaType: "boolean"
		},
		au.default,
		su.default
	];
});
var KK = M((rM) => {
	Object.defineProperty(rM, "__esModule", { value: !0 });
	rM.validateAdditionalItems = void 0;
	var $0 = a(), UK = W$(), Jm = {
		keyword: "additionalItems",
		type: "array",
		schemaType: ["boolean", "object"],
		before: "uniqueItems",
		error: {
			message: ({ params: { len: $ } }) => $0.str`must NOT have more than ${$} items`,
			params: ({ params: { len: $ } }) => $0._`{limit: ${$}}`
		},
		code($) {
			let { parentSchema: X, it: J } = $, { items: W } = X;
			if (!Array.isArray(W)) {
				(0, UK.checkStrictMode)(J, "\"additionalItems\" is ignored when \"items\" is not an array of schemas");
				return;
			}
			nM($, W);
		}
	};
	function nM($, X) {
		let { gen: J, schema: W, data: Q, keyword: Y, it: z } = $;
		z.items = !0;
		let G = J.const("len", $0._`${Q}.length`);
		if (W === !1) $.setParams({ len: X.length }), $.pass($0._`${G} <= ${X.length}`);
		else if (typeof W == "object" && !(0, UK.alwaysValidSchema)(z, W)) {
			let U = J.var("valid", $0._`${G} <= ${X.length}`);
			J.if((0, $0.not)(U), () => H(U)), $.ok(U);
		}
		function H(U) {
			J.forRange("i", X.length, G, (K) => {
				if ($.subschema({
					keyword: Y,
					dataProp: K,
					dataPropType: UK.Type.Num
				}, U), !z.allErrors) J.if((0, $0.not)(U), () => J.break());
			});
		}
	}
	rM.validateAdditionalItems = nM;
	rM.default = Jm;
});
var VK = M((sM) => {
	Object.defineProperty(sM, "__esModule", { value: !0 });
	sM.validateTuple = void 0;
	var tM = a(), hW = W$(), Wm = C6(), Ym = {
		keyword: "items",
		type: "array",
		schemaType: [
			"object",
			"array",
			"boolean"
		],
		before: "uniqueItems",
		code($) {
			let { schema: X, it: J } = $;
			if (Array.isArray(X)) return aM($, "additionalItems", X);
			if (J.items = !0, (0, hW.alwaysValidSchema)(J, X)) return;
			$.ok((0, Wm.validateArray)($));
		}
	};
	function aM($, X, J = $.schema) {
		let { gen: W, parentSchema: Q, data: Y, keyword: z, it: G } = $;
		if (K(Q), G.opts.unevaluated && J.length && G.items !== !0) G.items = hW.mergeEvaluated.items(W, J.length, G.items);
		let H = W.name("valid"), U = W.const("len", tM._`${Y}.length`);
		J.forEach((V, N) => {
			if ((0, hW.alwaysValidSchema)(G, V)) return;
			W.if(tM._`${U} > ${N}`, () => $.subschema({
				keyword: z,
				schemaProp: N,
				dataProp: N
			}, H)), $.ok(H);
		});
		function K(V) {
			let { opts: N, errSchemaPath: O } = G, w = J.length, B = w === V.minItems && (w === V.maxItems || V[X] === !1);
			if (N.strictTuples && !B) {
				let F = `"${z}" is ${w}-tuple, but minItems or maxItems/${X} are not specified or different at path "${O}"`;
				(0, hW.checkStrictMode)(G, F, N.strictTuples);
			}
		}
	}
	sM.validateTuple = aM;
	sM.default = Ym;
});
var X2 = M(($2) => {
	Object.defineProperty($2, "__esModule", { value: !0 });
	var Gm = VK();
	$2.default = {
		keyword: "prefixItems",
		type: "array",
		schemaType: ["array"],
		before: "uniqueItems",
		code: ($) => (0, Gm.validateTuple)($, "items")
	};
});
var W2 = M((Q2) => {
	Object.defineProperty(Q2, "__esModule", { value: !0 });
	var J2 = a(), Km = W$(), Vm = C6(), Nm = KK();
	Q2.default = {
		keyword: "items",
		type: "array",
		schemaType: ["object", "boolean"],
		before: "uniqueItems",
		error: {
			message: ({ params: { len: $ } }) => J2.str`must NOT have more than ${$} items`,
			params: ({ params: { len: $ } }) => J2._`{limit: ${$}}`
		},
		code($) {
			let { schema: X, parentSchema: J, it: W } = $, { prefixItems: Q } = J;
			if (W.items = !0, (0, Km.alwaysValidSchema)(W, X)) return;
			if (Q) (0, Nm.validateAdditionalItems)($, Q);
			else $.ok((0, Vm.validateArray)($));
		}
	};
});
var z2 = M((Y2) => {
	Object.defineProperty(Y2, "__esModule", { value: !0 });
	var k6 = a(), uW = W$();
	Y2.default = {
		keyword: "contains",
		type: "array",
		schemaType: ["object", "boolean"],
		before: "uniqueItems",
		trackErrors: !0,
		error: {
			message: ({ params: { min: $, max: X } }) => X === void 0 ? k6.str`must contain at least ${$} valid item(s)` : k6.str`must contain at least ${$} and no more than ${X} valid item(s)`,
			params: ({ params: { min: $, max: X } }) => X === void 0 ? k6._`{minContains: ${$}}` : k6._`{minContains: ${$}, maxContains: ${X}}`
		},
		code($) {
			let { gen: X, schema: J, parentSchema: W, data: Q, it: Y } = $, z, G, { minContains: H, maxContains: U } = W;
			if (Y.opts.next) z = H === void 0 ? 1 : H, G = U;
			else z = 1;
			let K = X.const("len", k6._`${Q}.length`);
			if ($.setParams({
				min: z,
				max: G
			}), G === void 0 && z === 0) {
				(0, uW.checkStrictMode)(Y, "\"minContains\" == 0 without \"maxContains\": \"contains\" keyword ignored");
				return;
			}
			if (G !== void 0 && z > G) {
				(0, uW.checkStrictMode)(Y, "\"minContains\" > \"maxContains\" is always invalid"), $.fail();
				return;
			}
			if ((0, uW.alwaysValidSchema)(Y, J)) {
				let B = k6._`${K} >= ${z}`;
				if (G !== void 0) B = k6._`${B} && ${K} <= ${G}`;
				$.pass(B);
				return;
			}
			Y.items = !0;
			let V = X.name("valid");
			if (G === void 0 && z === 1) O(V, () => X.if(V, () => X.break()));
			else if (z === 0) {
				if (X.let(V, !0), G !== void 0) X.if(k6._`${Q}.length > 0`, N);
			} else X.let(V, !1), N();
			$.result(V, () => $.reset());
			function N() {
				let B = X.name("_valid"), F = X.let("count", 0);
				O(B, () => X.if(B, () => w(F)));
			}
			function O(B, F) {
				X.forRange("i", 0, K, (j) => {
					$.subschema({
						keyword: "contains",
						dataProp: j,
						dataPropType: uW.Type.Num,
						compositeRule: !0
					}, B), F();
				});
			}
			function w(B) {
				if (X.code(k6._`${B}++`), G === void 0) X.if(k6._`${B} >= ${z}`, () => X.assign(V, !0).break());
				else if (X.if(k6._`${B} > ${G}`, () => X.assign(V, !1).break()), z === 1) X.assign(V, !0);
				else X.if(k6._`${B} >= ${z}`, () => X.assign(V, !0));
			}
		}
	};
});
var N2 = M((U2) => {
	Object.defineProperty(U2, "__esModule", { value: !0 });
	U2.validateSchemaDeps = U2.validatePropertyDeps = U2.error = void 0;
	var NK = a(), jm = W$(), IJ = C6();
	U2.error = {
		message: ({ params: { property: $, depsCount: X, deps: J } }) => {
			let W = X === 1 ? "property" : "properties";
			return NK.str`must have ${W} ${J} when property ${$} is present`;
		},
		params: ({ params: { property: $, depsCount: X, deps: J, missingProperty: W } }) => NK._`{property: ${$},
    missingProperty: ${W},
    depsCount: ${X},
    deps: ${J}}`
	};
	var Lm = {
		keyword: "dependencies",
		type: "object",
		schemaType: "object",
		error: U2.error,
		code($) {
			let [X, J] = Mm($);
			G2($, X), H2($, J);
		}
	};
	function Mm({ schema: $ }) {
		let X = {}, J = {};
		for (let W in $) {
			if (W === "__proto__") continue;
			let Q = Array.isArray($[W]) ? X : J;
			Q[W] = $[W];
		}
		return [X, J];
	}
	function G2($, X = $.schema) {
		let { gen: J, data: W, it: Q } = $;
		if (Object.keys(X).length === 0) return;
		let Y = J.let("missing");
		for (let z in X) {
			let G = X[z];
			if (G.length === 0) continue;
			let H = (0, IJ.propertyInData)(J, W, z, Q.opts.ownProperties);
			if ($.setParams({
				property: z,
				depsCount: G.length,
				deps: G.join(", ")
			}), Q.allErrors) J.if(H, () => {
				for (let U of G) (0, IJ.checkReportMissingProp)($, U);
			});
			else J.if(NK._`${H} && (${(0, IJ.checkMissingProp)($, G, Y)})`), (0, IJ.reportMissingProp)($, Y), J.else();
		}
	}
	U2.validatePropertyDeps = G2;
	function H2($, X = $.schema) {
		let { gen: J, data: W, keyword: Q, it: Y } = $, z = J.name("valid");
		for (let G in X) {
			if ((0, jm.alwaysValidSchema)(Y, X[G])) continue;
			J.if((0, IJ.propertyInData)(J, W, G, Y.opts.ownProperties), () => {
				let H = $.subschema({
					keyword: Q,
					schemaProp: G
				}, z);
				$.mergeValidEvaluated(H, z);
			}, () => J.var(z, !0)), $.ok(z);
		}
	}
	U2.validateSchemaDeps = H2;
	U2.default = Lm;
});
var B2 = M((w2) => {
	Object.defineProperty(w2, "__esModule", { value: !0 });
	var O2 = a(), Zm = W$();
	w2.default = {
		keyword: "propertyNames",
		type: "object",
		schemaType: ["object", "boolean"],
		error: {
			message: "property name must be valid",
			params: ({ params: $ }) => O2._`{propertyName: ${$.propertyName}}`
		},
		code($) {
			let { gen: X, schema: J, data: W, it: Q } = $;
			if ((0, Zm.alwaysValidSchema)(Q, J)) return;
			let Y = X.name("valid");
			X.forIn("key", W, (z) => {
				$.setParams({ propertyName: z }), $.subschema({
					keyword: "propertyNames",
					data: z,
					dataTypes: ["string"],
					propertyName: z,
					compositeRule: !0
				}, Y), X.if((0, O2.not)(Y), () => {
					if ($.error(!0), !Q.allErrors) X.break();
				});
			}), $.ok(Y);
		}
	};
});
var OK = M((q2) => {
	Object.defineProperty(q2, "__esModule", { value: !0 });
	var mW = C6(), o6 = a(), Em = E4(), lW = W$();
	q2.default = {
		keyword: "additionalProperties",
		type: ["object"],
		schemaType: ["boolean", "object"],
		allowUndefined: !0,
		trackErrors: !0,
		error: {
			message: "must NOT have additional properties",
			params: ({ params: $ }) => o6._`{additionalProperty: ${$.additionalProperty}}`
		},
		code($) {
			let { gen: X, schema: J, parentSchema: W, data: Q, errsCount: Y, it: z } = $;
			if (!Y) throw Error("ajv implementation error");
			let { allErrors: G, opts: H } = z;
			if (z.props = !0, H.removeAdditional !== "all" && (0, lW.alwaysValidSchema)(z, J)) return;
			let U = (0, mW.allSchemaProperties)(W.properties), K = (0, mW.allSchemaProperties)(W.patternProperties);
			V(), $.ok(o6._`${Y} === ${Em.default.errors}`);
			function V() {
				X.forIn("key", Q, (F) => {
					if (!U.length && !K.length) w(F);
					else X.if(N(F), () => w(F));
				});
			}
			function N(F) {
				let j;
				if (U.length > 8) {
					let I = (0, lW.schemaRefOrVal)(z, W.properties, "properties");
					j = (0, mW.isOwnProperty)(X, I, F);
				} else if (U.length) j = (0, o6.or)(...U.map((I) => o6._`${F} === ${I}`));
				else j = o6.nil;
				if (K.length) j = (0, o6.or)(j, ...K.map((I) => o6._`${(0, mW.usePattern)($, I)}.test(${F})`));
				return (0, o6.not)(j);
			}
			function O(F) {
				X.code(o6._`delete ${Q}[${F}]`);
			}
			function w(F) {
				if (H.removeAdditional === "all" || H.removeAdditional && J === !1) {
					O(F);
					return;
				}
				if (J === !1) {
					if ($.setParams({ additionalProperty: F }), $.error(), !G) X.break();
					return;
				}
				if (typeof J == "object" && !(0, lW.alwaysValidSchema)(z, J)) {
					let j = X.name("valid");
					if (H.removeAdditional === "failing") B(F, j, !1), X.if((0, o6.not)(j), () => {
						$.reset(), O(F);
					});
					else if (B(F, j), !G) X.if((0, o6.not)(j), () => X.break());
				}
			}
			function B(F, j, I) {
				let Z = {
					keyword: "additionalProperties",
					dataProp: F,
					dataPropType: lW.Type.Str
				};
				if (I === !1) Object.assign(Z, {
					compositeRule: !0,
					createErrors: !1,
					allErrors: !1
				});
				$.subschema(Z, j);
			}
		}
	};
});
var L2 = M((j2) => {
	Object.defineProperty(j2, "__esModule", { value: !0 });
	var km = VJ(), D2 = C6(), wK = W$(), F2 = OK();
	j2.default = {
		keyword: "properties",
		type: "object",
		schemaType: "object",
		code($) {
			let { gen: X, schema: J, parentSchema: W, data: Q, it: Y } = $;
			if (Y.opts.removeAdditional === "all" && W.additionalProperties === void 0) F2.default.code(new km.KeywordCxt(Y, F2.default, "additionalProperties"));
			let z = (0, D2.allSchemaProperties)(J);
			for (let V of z) Y.definedProperties.add(V);
			if (Y.opts.unevaluated && z.length && Y.props !== !0) Y.props = wK.mergeEvaluated.props(X, (0, wK.toHash)(z), Y.props);
			let G = z.filter((V) => !(0, wK.alwaysValidSchema)(Y, J[V]));
			if (G.length === 0) return;
			let H = X.name("valid");
			for (let V of G) {
				if (U(V)) K(V);
				else {
					if (X.if((0, D2.propertyInData)(X, Q, V, Y.opts.ownProperties)), K(V), !Y.allErrors) X.else().var(H, !0);
					X.endIf();
				}
				$.it.definedProperties.add(V), $.ok(H);
			}
			function U(V) {
				return Y.opts.useDefaults && !Y.compositeRule && J[V].default !== void 0;
			}
			function K(V) {
				$.subschema({
					keyword: "properties",
					schemaProp: V,
					dataProp: V
				}, H);
			}
		}
	};
});
var b2 = M((Z2) => {
	Object.defineProperty(Z2, "__esModule", { value: !0 });
	var M2 = C6(), cW = a(), A2 = W$(), I2 = W$();
	Z2.default = {
		keyword: "patternProperties",
		type: "object",
		schemaType: "object",
		code($) {
			let { gen: X, schema: J, data: W, parentSchema: Q, it: Y } = $, { opts: z } = Y, G = (0, M2.allSchemaProperties)(J), H = G.filter((B) => (0, A2.alwaysValidSchema)(Y, J[B]));
			if (G.length === 0 || H.length === G.length && (!Y.opts.unevaluated || Y.props === !0)) return;
			let U = z.strictSchema && !z.allowMatchingProperties && Q.properties, K = X.name("valid");
			if (Y.props !== !0 && !(Y.props instanceof cW.Name)) Y.props = (0, I2.evaluatedPropsToName)(X, Y.props);
			let { props: V } = Y;
			N();
			function N() {
				for (let B of G) {
					if (U) O(B);
					if (Y.allErrors) w(B);
					else X.var(K, !0), w(B), X.if(K);
				}
			}
			function O(B) {
				for (let F in U) if (new RegExp(B).test(F)) (0, A2.checkStrictMode)(Y, `property ${F} matches pattern ${B} (use allowMatchingProperties)`);
			}
			function w(B) {
				X.forIn("key", W, (F) => {
					X.if(cW._`${(0, M2.usePattern)($, B)}.test(${F})`, () => {
						let j = H.includes(B);
						if (!j) $.subschema({
							keyword: "patternProperties",
							schemaProp: B,
							dataProp: F,
							dataPropType: I2.Type.Str
						}, K);
						if (Y.opts.unevaluated && V !== !0) X.assign(cW._`${V}[${F}]`, !0);
						else if (!j && !Y.allErrors) X.if((0, cW.not)(K), () => X.break());
					});
				});
			}
		}
	};
});
var P2 = M((R2) => {
	Object.defineProperty(R2, "__esModule", { value: !0 });
	var ym = W$();
	R2.default = {
		keyword: "not",
		schemaType: ["object", "boolean"],
		trackErrors: !0,
		code($) {
			let { gen: X, schema: J, it: W } = $;
			if ((0, ym.alwaysValidSchema)(W, J)) {
				$.fail();
				return;
			}
			let Q = X.name("valid");
			$.subschema({
				keyword: "not",
				compositeRule: !0,
				createErrors: !1,
				allErrors: !1
			}, Q), $.failResult(Q, () => $.reset(), () => $.error());
		},
		error: { message: "must NOT be valid" }
	};
});
var S2 = M((E2) => {
	Object.defineProperty(E2, "__esModule", { value: !0 });
	E2.default = {
		keyword: "anyOf",
		schemaType: "array",
		trackErrors: !0,
		code: C6().validateUnion,
		error: { message: "must match a schema in anyOf" }
	};
});
var C2 = M((v2) => {
	Object.defineProperty(v2, "__esModule", { value: !0 });
	var dW = a(), cm = W$();
	v2.default = {
		keyword: "oneOf",
		schemaType: "array",
		trackErrors: !0,
		error: {
			message: "must match exactly one schema in oneOf",
			params: ({ params: $ }) => dW._`{passingSchemas: ${$.passing}}`
		},
		code($) {
			let { gen: X, schema: J, parentSchema: W, it: Q } = $;
			if (!Array.isArray(J)) throw Error("ajv implementation error");
			if (Q.opts.discriminator && W.discriminator) return;
			let Y = J, z = X.let("valid", !1), G = X.let("passing", null), H = X.name("_valid");
			$.setParams({ passing: G }), X.block(U), $.result(z, () => $.reset(), () => $.error(!0));
			function U() {
				Y.forEach((K, V) => {
					let N;
					if ((0, cm.alwaysValidSchema)(Q, K)) X.var(H, !0);
					else N = $.subschema({
						keyword: "oneOf",
						schemaProp: V,
						compositeRule: !0
					}, H);
					if (V > 0) X.if(dW._`${H} && ${z}`).assign(z, !1).assign(G, dW._`[${G}, ${V}]`).else();
					X.if(H, () => {
						if (X.assign(z, !0), X.assign(G, V), N) $.mergeEvaluated(N, dW.Name);
					});
				});
			}
		}
	};
});
var _2 = M((k2) => {
	Object.defineProperty(k2, "__esModule", { value: !0 });
	var nm = W$();
	k2.default = {
		keyword: "allOf",
		schemaType: "array",
		code($) {
			let { gen: X, schema: J, it: W } = $;
			if (!Array.isArray(J)) throw Error("ajv implementation error");
			let Q = X.name("valid");
			J.forEach((Y, z) => {
				if ((0, nm.alwaysValidSchema)(W, Y)) return;
				let G = $.subschema({
					keyword: "allOf",
					schemaProp: z
				}, Q);
				$.ok(Q), $.mergeEvaluated(G);
			});
		}
	};
});
var y2 = M((f2) => {
	Object.defineProperty(f2, "__esModule", { value: !0 });
	var pW = a(), T2 = W$(), am = {
		keyword: "if",
		schemaType: ["object", "boolean"],
		trackErrors: !0,
		error: {
			message: ({ params: $ }) => pW.str`must match "${$.ifClause}" schema`,
			params: ({ params: $ }) => pW._`{failingKeyword: ${$.ifClause}}`
		},
		code($) {
			let { gen: X, parentSchema: J, it: W } = $;
			if (J.then === void 0 && J.else === void 0) (0, T2.checkStrictMode)(W, "\"if\" without \"then\" and \"else\" is ignored");
			let Q = x2(W, "then"), Y = x2(W, "else");
			if (!Q && !Y) return;
			let z = X.let("valid", !0), G = X.name("_valid");
			if (H(), $.reset(), Q && Y) {
				let K = X.let("ifClause");
				$.setParams({ ifClause: K }), X.if(G, U("then", K), U("else", K));
			} else if (Q) X.if(G, U("then"));
			else X.if((0, pW.not)(G), U("else"));
			$.pass(z, () => $.error(!0));
			function H() {
				let K = $.subschema({
					keyword: "if",
					compositeRule: !0,
					createErrors: !1,
					allErrors: !1
				}, G);
				$.mergeEvaluated(K);
			}
			function U(K, V) {
				return () => {
					let N = $.subschema({ keyword: K }, G);
					if (X.assign(z, G), $.mergeValidEvaluated(N, z), V) X.assign(V, pW._`${K}`);
					else $.setParams({ ifClause: K });
				};
			}
		}
	};
	function x2($, X) {
		let J = $.schema[X];
		return J !== void 0 && !(0, T2.alwaysValidSchema)($, J);
	}
	f2.default = am;
});
var h2 = M((g2) => {
	Object.defineProperty(g2, "__esModule", { value: !0 });
	var em = W$();
	g2.default = {
		keyword: ["then", "else"],
		schemaType: ["object", "boolean"],
		code({ keyword: $, parentSchema: X, it: J }) {
			if (X.if === void 0) (0, em.checkStrictMode)(J, `"${$}" without "if" is ignored`);
		}
	};
});
var m2 = M((u2) => {
	Object.defineProperty(u2, "__esModule", { value: !0 });
	var Jl = KK(), Ql = X2(), Wl = VK(), Yl = W2(), zl = z2(), Gl = N2(), Hl = B2(), Ul = OK(), Kl = L2(), Vl = b2(), Nl = P2(), Ol = S2(), wl = C2(), Bl = _2(), ql = y2(), Dl = h2();
	function Fl($ = !1) {
		let X = [
			Nl.default,
			Ol.default,
			wl.default,
			Bl.default,
			ql.default,
			Dl.default,
			Hl.default,
			Ul.default,
			Gl.default,
			Kl.default,
			Vl.default
		];
		if ($) X.push(Ql.default, Yl.default);
		else X.push(Jl.default, Wl.default);
		return X.push(zl.default), X;
	}
	u2.default = Fl;
});
var c2 = M((l2) => {
	Object.defineProperty(l2, "__esModule", { value: !0 });
	var C$ = a();
	l2.default = {
		keyword: "format",
		type: ["number", "string"],
		schemaType: "string",
		$data: !0,
		error: {
			message: ({ schemaCode: $ }) => C$.str`must match format "${$}"`,
			params: ({ schemaCode: $ }) => C$._`{format: ${$}}`
		},
		code($, X) {
			let { gen: J, data: W, $data: Q, schema: Y, schemaCode: z, it: G } = $, { opts: H, errSchemaPath: U, schemaEnv: K, self: V } = G;
			if (!H.validateFormats) return;
			if (Q) N();
			else O();
			function N() {
				let w = J.scopeValue("formats", {
					ref: V.formats,
					code: H.code.formats
				}), B = J.const("fDef", C$._`${w}[${z}]`), F = J.let("fType"), j = J.let("format");
				J.if(C$._`typeof ${B} == "object" && !(${B} instanceof RegExp)`, () => J.assign(F, C$._`${B}.type || "string"`).assign(j, C$._`${B}.validate`), () => J.assign(F, C$._`"string"`).assign(j, B)), $.fail$data((0, C$.or)(I(), Z()));
				function I() {
					if (H.strictSchema === !1) return C$.nil;
					return C$._`${z} && !${j}`;
				}
				function Z() {
					let _ = K.$async ? C$._`(${B}.async ? await ${j}(${W}) : ${j}(${W}))` : C$._`${j}(${W})`, T = C$._`(typeof ${j} == "function" ? ${_} : ${j}.test(${W}))`;
					return C$._`${j} && ${j} !== true && ${F} === ${X} && !${T}`;
				}
			}
			function O() {
				let w = V.formats[Y];
				if (!w) {
					I();
					return;
				}
				if (w === !0) return;
				let [B, F, j] = Z(w);
				if (B === X) $.pass(_());
				function I() {
					if (H.strictSchema === !1) {
						V.logger.warn(T());
						return;
					}
					throw Error(T());
					function T() {
						return `unknown format "${Y}" ignored in schema at path "${U}"`;
					}
				}
				function Z(T) {
					let O$ = T instanceof RegExp ? (0, C$.regexpCode)(T) : H.code.formats ? C$._`${H.code.formats}${(0, C$.getProperty)(Y)}` : void 0, x$ = J.scopeValue("formats", {
						key: Y,
						ref: T,
						code: O$
					});
					if (typeof T == "object" && !(T instanceof RegExp)) return [
						T.type || "string",
						T.validate,
						C$._`${x$}.validate`
					];
					return [
						"string",
						T,
						x$
					];
				}
				function _() {
					if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
						if (!K.$async) throw Error("async format in sync schema");
						return C$._`await ${j}(${W})`;
					}
					return typeof F == "function" ? C$._`${j}(${W})` : C$._`${j}.test(${W})`;
				}
			}
		}
	};
});
var p2 = M((d2) => {
	Object.defineProperty(d2, "__esModule", { value: !0 });
	d2.default = [c2().default];
});
var r2 = M((i2) => {
	Object.defineProperty(i2, "__esModule", { value: !0 });
	i2.contentVocabulary = i2.metadataVocabulary = void 0;
	i2.metadataVocabulary = [
		"title",
		"description",
		"default",
		"deprecated",
		"readOnly",
		"writeOnly",
		"examples"
	];
	i2.contentVocabulary = [
		"contentMediaType",
		"contentEncoding",
		"contentSchema"
	];
});
var a2 = M((t2) => {
	Object.defineProperty(t2, "__esModule", { value: !0 });
	var Pl = jM(), El = iM(), Sl = m2(), vl = p2(), o2 = r2();
	t2.default = [
		Pl.default,
		El.default,
		(0, Sl.default)(),
		vl.default,
		o2.metadataVocabulary,
		o2.contentVocabulary
	];
});
var XA = M((e2) => {
	Object.defineProperty(e2, "__esModule", { value: !0 });
	e2.DiscrError = void 0;
	var s2;
	(function($) {
		$.Tag = "tag", $.Mapping = "mapping";
	})(s2 || (e2.DiscrError = s2 = {}));
});
var WA = M((QA) => {
	Object.defineProperty(QA, "__esModule", { value: !0 });
	var D8 = a(), BK = XA(), JA = EW(), _l = NJ(), xl = W$();
	QA.default = {
		keyword: "discriminator",
		type: "object",
		schemaType: "object",
		error: {
			message: ({ params: { discrError: $, tagName: X } }) => $ === BK.DiscrError.Tag ? `tag "${X}" must be string` : `value of tag "${X}" must be in oneOf`,
			params: ({ params: { discrError: $, tag: X, tagName: J } }) => D8._`{error: ${$}, tag: ${J}, tagValue: ${X}}`
		},
		code($) {
			let { gen: X, data: J, schema: W, parentSchema: Q, it: Y } = $, { oneOf: z } = Q;
			if (!Y.opts.discriminator) throw Error("discriminator: requires discriminator option");
			let G = W.propertyName;
			if (typeof G != "string") throw Error("discriminator: requires propertyName");
			if (W.mapping) throw Error("discriminator: mapping is not supported");
			if (!z) throw Error("discriminator: requires oneOf keyword");
			let H = X.let("valid", !1), U = X.const("tag", D8._`${J}${(0, D8.getProperty)(G)}`);
			X.if(D8._`typeof ${U} == "string"`, () => K(), () => $.error(!1, {
				discrError: BK.DiscrError.Tag,
				tag: U,
				tagName: G
			})), $.ok(H);
			function K() {
				let O = N();
				X.if(!1);
				for (let w in O) X.elseIf(D8._`${U} === ${w}`), X.assign(H, V(O[w]));
				X.else(), $.error(!1, {
					discrError: BK.DiscrError.Mapping,
					tag: U,
					tagName: G
				}), X.endIf();
			}
			function V(O) {
				let w = X.name("valid"), B = $.subschema({
					keyword: "oneOf",
					schemaProp: O
				}, w);
				return $.mergeEvaluated(B, D8.Name), w;
			}
			function N() {
				var O;
				let w = {}, B = j(Q), F = !0;
				for (let _ = 0; _ < z.length; _++) {
					let T = z[_];
					if ((T === null || T === void 0 ? void 0 : T.$ref) && !(0, xl.schemaHasRulesButRef)(T, Y.self.RULES)) {
						let x$ = T.$ref;
						if (T = JA.resolveRef.call(Y.self, Y.schemaEnv.root, Y.baseId, x$), T instanceof JA.SchemaEnv) T = T.schema;
						if (T === void 0) throw new _l.default(Y.opts.uriResolver, Y.baseId, x$);
					}
					let O$ = (O = T === null || T === void 0 ? void 0 : T.properties) === null || O === void 0 ? void 0 : O[G];
					if (typeof O$ != "object") throw Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${G}"`);
					F = F && (B || j(T)), I(O$, _);
				}
				if (!F) throw Error(`discriminator: "${G}" must be required`);
				return w;
				function j({ required: _ }) {
					return Array.isArray(_) && _.includes(G);
				}
				function I(_, T) {
					if (_.const) Z(_.const, T);
					else if (_.enum) for (let O$ of _.enum) Z(O$, T);
					else throw Error(`discriminator: "properties/${G}" must have "const" or "enum"`);
				}
				function Z(_, T) {
					if (typeof _ != "string" || _ in w) throw Error(`discriminator: "${G}" values must be unique strings`);
					w[_] = T;
				}
			}
		}
	};
});
var YA = M((bJ$, gl) => {
	gl.exports = {
		$schema: "http://json-schema.org/draft-07/schema#",
		$id: "http://json-schema.org/draft-07/schema#",
		title: "Core schema meta-schema",
		definitions: {
			schemaArray: {
				type: "array",
				minItems: 1,
				items: { $ref: "#" }
			},
			nonNegativeInteger: {
				type: "integer",
				minimum: 0
			},
			nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] },
			simpleTypes: { enum: [
				"array",
				"boolean",
				"integer",
				"null",
				"number",
				"object",
				"string"
			] },
			stringArray: {
				type: "array",
				items: { type: "string" },
				uniqueItems: !0,
				default: []
			}
		},
		type: ["object", "boolean"],
		properties: {
			$id: {
				type: "string",
				format: "uri-reference"
			},
			$schema: {
				type: "string",
				format: "uri"
			},
			$ref: {
				type: "string",
				format: "uri-reference"
			},
			$comment: { type: "string" },
			title: { type: "string" },
			description: { type: "string" },
			default: !0,
			readOnly: {
				type: "boolean",
				default: !1
			},
			examples: {
				type: "array",
				items: !0
			},
			multipleOf: {
				type: "number",
				exclusiveMinimum: 0
			},
			maximum: { type: "number" },
			exclusiveMaximum: { type: "number" },
			minimum: { type: "number" },
			exclusiveMinimum: { type: "number" },
			maxLength: { $ref: "#/definitions/nonNegativeInteger" },
			minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
			pattern: {
				type: "string",
				format: "regex"
			},
			additionalItems: { $ref: "#" },
			items: {
				anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
				default: !0
			},
			maxItems: { $ref: "#/definitions/nonNegativeInteger" },
			minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
			uniqueItems: {
				type: "boolean",
				default: !1
			},
			contains: { $ref: "#" },
			maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
			minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
			required: { $ref: "#/definitions/stringArray" },
			additionalProperties: { $ref: "#" },
			definitions: {
				type: "object",
				additionalProperties: { $ref: "#" },
				default: {}
			},
			properties: {
				type: "object",
				additionalProperties: { $ref: "#" },
				default: {}
			},
			patternProperties: {
				type: "object",
				additionalProperties: { $ref: "#" },
				propertyNames: { format: "regex" },
				default: {}
			},
			dependencies: {
				type: "object",
				additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] }
			},
			propertyNames: { $ref: "#" },
			const: !0,
			enum: {
				type: "array",
				items: !0,
				minItems: 1,
				uniqueItems: !0
			},
			type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, {
				type: "array",
				items: { $ref: "#/definitions/simpleTypes" },
				minItems: 1,
				uniqueItems: !0
			}] },
			format: { type: "string" },
			contentMediaType: { type: "string" },
			contentEncoding: { type: "string" },
			if: { $ref: "#" },
			then: { $ref: "#" },
			else: { $ref: "#" },
			allOf: { $ref: "#/definitions/schemaArray" },
			anyOf: { $ref: "#/definitions/schemaArray" },
			oneOf: { $ref: "#/definitions/schemaArray" },
			not: { $ref: "#" }
		},
		default: !0
	};
});
var DK = M((N6, qK) => {
	Object.defineProperty(N6, "__esModule", { value: !0 });
	N6.MissingRefError = N6.ValidationError = N6.CodeGen = N6.Name = N6.nil = N6.stringify = N6.str = N6._ = N6.KeywordCxt = N6.Ajv = void 0;
	var hl = UM(), ul = a2(), ml = WA(), zA = YA(), ll = ["/properties"], iW = "http://json-schema.org/draft-07/schema";
	class ZJ extends hl.default {
		_addVocabularies() {
			if (super._addVocabularies(), ul.default.forEach(($) => this.addVocabulary($)), this.opts.discriminator) this.addKeyword(ml.default);
		}
		_addDefaultMetaSchema() {
			if (super._addDefaultMetaSchema(), !this.opts.meta) return;
			let $ = this.opts.$data ? this.$dataMetaSchema(zA, ll) : zA;
			this.addMetaSchema($, iW, !1), this.refs["http://json-schema.org/schema"] = iW;
		}
		defaultMeta() {
			return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(iW) ? iW : void 0);
		}
	}
	N6.Ajv = ZJ;
	qK.exports = N6 = ZJ;
	qK.exports.Ajv = ZJ;
	Object.defineProperty(N6, "__esModule", { value: !0 });
	N6.default = ZJ;
	var cl = VJ();
	Object.defineProperty(N6, "KeywordCxt", {
		enumerable: !0,
		get: function() {
			return cl.KeywordCxt;
		}
	});
	var F8 = a();
	Object.defineProperty(N6, "_", {
		enumerable: !0,
		get: function() {
			return F8._;
		}
	});
	Object.defineProperty(N6, "str", {
		enumerable: !0,
		get: function() {
			return F8.str;
		}
	});
	Object.defineProperty(N6, "stringify", {
		enumerable: !0,
		get: function() {
			return F8.stringify;
		}
	});
	Object.defineProperty(N6, "nil", {
		enumerable: !0,
		get: function() {
			return F8.nil;
		}
	});
	Object.defineProperty(N6, "Name", {
		enumerable: !0,
		get: function() {
			return F8.Name;
		}
	});
	Object.defineProperty(N6, "CodeGen", {
		enumerable: !0,
		get: function() {
			return F8.CodeGen;
		}
	});
	var dl = RW();
	Object.defineProperty(N6, "ValidationError", {
		enumerable: !0,
		get: function() {
			return dl.default;
		}
	});
	var pl = NJ();
	Object.defineProperty(N6, "MissingRefError", {
		enumerable: !0,
		get: function() {
			return pl.default;
		}
	});
});
var qA = M((wA) => {
	Object.defineProperty(wA, "__esModule", { value: !0 });
	wA.formatNames = wA.fastFormats = wA.fullFormats = void 0;
	function Q4($, X) {
		return {
			validate: $,
			compare: X
		};
	}
	wA.fullFormats = {
		date: Q4(KA, MK),
		time: Q4(jK(!0), AK),
		"date-time": Q4(GA(!0), NA),
		"iso-time": Q4(jK(), VA),
		"iso-date-time": Q4(GA(), OA),
		duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
		uri: el,
		"uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
		"uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
		url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
		email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
		hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
		ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
		ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
		regex: zc,
		uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
		"json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
		"json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
		"relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
		byte: $c,
		int32: {
			type: "number",
			validate: Qc
		},
		int64: {
			type: "number",
			validate: Wc
		},
		float: {
			type: "number",
			validate: UA
		},
		double: {
			type: "number",
			validate: UA
		},
		password: !0,
		binary: !0
	};
	wA.fastFormats = {
		...wA.fullFormats,
		date: Q4(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, MK),
		time: Q4(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, AK),
		"date-time": Q4(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, NA),
		"iso-time": Q4(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, VA),
		"iso-date-time": Q4(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, OA),
		uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
		"uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
		email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
	};
	wA.formatNames = Object.keys(wA.fullFormats);
	function rl($) {
		return $ % 4 === 0 && ($ % 100 !== 0 || $ % 400 === 0);
	}
	var ol = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, tl = [
		0,
		31,
		28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	];
	function KA($) {
		let X = ol.exec($);
		if (!X) return !1;
		let J = +X[1], W = +X[2], Q = +X[3];
		return W >= 1 && W <= 12 && Q >= 1 && Q <= (W === 2 && rl(J) ? 29 : tl[W]);
	}
	function MK($, X) {
		if (!($ && X)) return;
		if ($ > X) return 1;
		if ($ < X) return -1;
		return 0;
	}
	var FK = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
	function jK($) {
		return function(J) {
			let W = FK.exec(J);
			if (!W) return !1;
			let Q = +W[1], Y = +W[2], z = +W[3], G = W[4], H = W[5] === "-" ? -1 : 1, U = +(W[6] || 0), K = +(W[7] || 0);
			if (U > 23 || K > 59 || $ && !G) return !1;
			if (Q <= 23 && Y <= 59 && z < 60) return !0;
			let V = Y - K * H, N = Q - U * H - (V < 0 ? 1 : 0);
			return (N === 23 || N === -1) && (V === 59 || V === -1) && z < 61;
		};
	}
	function AK($, X) {
		if (!($ && X)) return;
		let J = (/* @__PURE__ */ new Date("2020-01-01T" + $)).valueOf(), W = (/* @__PURE__ */ new Date("2020-01-01T" + X)).valueOf();
		if (!(J && W)) return;
		return J - W;
	}
	function VA($, X) {
		if (!($ && X)) return;
		let J = FK.exec($), W = FK.exec(X);
		if (!(J && W)) return;
		if ($ = J[1] + J[2] + J[3], X = W[1] + W[2] + W[3], $ > X) return 1;
		if ($ < X) return -1;
		return 0;
	}
	var LK = /t|\s/i;
	function GA($) {
		let X = jK($);
		return function(W) {
			let Q = W.split(LK);
			return Q.length === 2 && KA(Q[0]) && X(Q[1]);
		};
	}
	function NA($, X) {
		if (!($ && X)) return;
		let J = new Date($).valueOf(), W = new Date(X).valueOf();
		if (!(J && W)) return;
		return J - W;
	}
	function OA($, X) {
		if (!($ && X)) return;
		let [J, W] = $.split(LK), [Q, Y] = X.split(LK), z = MK(J, Q);
		if (z === void 0) return;
		return z || AK(W, Y);
	}
	var al = /\/|:/, sl = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	function el($) {
		return al.test($) && sl.test($);
	}
	var HA = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
	function $c($) {
		return HA.lastIndex = 0, HA.test($);
	}
	var Xc = -2147483648, Jc = 2147483647;
	function Qc($) {
		return Number.isInteger($) && $ <= Jc && $ >= Xc;
	}
	function Wc($) {
		return Number.isInteger($);
	}
	function UA() {
		return !0;
	}
	var Yc = /[^\\]\\Z/;
	function zc($) {
		if (Yc.test($)) return !1;
		try {
			return new RegExp($), !0;
		} catch (X) {
			return !1;
		}
	}
});
var FA = M((DA) => {
	Object.defineProperty(DA, "__esModule", { value: !0 });
	DA.formatLimitDefinition = void 0;
	var Hc = DK(), t6 = a(), O1 = t6.operators, nW = {
		formatMaximum: {
			okStr: "<=",
			ok: O1.LTE,
			fail: O1.GT
		},
		formatMinimum: {
			okStr: ">=",
			ok: O1.GTE,
			fail: O1.LT
		},
		formatExclusiveMaximum: {
			okStr: "<",
			ok: O1.LT,
			fail: O1.GTE
		},
		formatExclusiveMinimum: {
			okStr: ">",
			ok: O1.GT,
			fail: O1.LTE
		}
	};
	DA.formatLimitDefinition = {
		keyword: Object.keys(nW),
		type: "string",
		schemaType: "string",
		$data: !0,
		error: {
			message: ({ keyword: $, schemaCode: X }) => t6.str`should be ${nW[$].okStr} ${X}`,
			params: ({ keyword: $, schemaCode: X }) => t6._`{comparison: ${nW[$].okStr}, limit: ${X}}`
		},
		code($) {
			let { gen: X, data: J, schemaCode: W, keyword: Q, it: Y } = $, { opts: z, self: G } = Y;
			if (!z.validateFormats) return;
			let H = new Hc.KeywordCxt(Y, G.RULES.all.format.definition, "format");
			if (H.$data) U();
			else K();
			function U() {
				let N = X.scopeValue("formats", {
					ref: G.formats,
					code: z.code.formats
				}), O = X.const("fmt", t6._`${N}[${H.schemaCode}]`);
				$.fail$data((0, t6.or)(t6._`typeof ${O} != "object"`, t6._`${O} instanceof RegExp`, t6._`typeof ${O}.compare != "function"`, V(O)));
			}
			function K() {
				let N = H.schema, O = G.formats[N];
				if (!O || O === !0) return;
				if (typeof O != "object" || O instanceof RegExp || typeof O.compare != "function") throw Error(`"${Q}": format "${N}" does not define "compare" function`);
				let w = X.scopeValue("formats", {
					key: N,
					ref: O,
					code: z.code.formats ? t6._`${z.code.formats}${(0, t6.getProperty)(N)}` : void 0
				});
				$.fail$data(V(w));
			}
			function V(N) {
				return t6._`${N}.compare(${J}, ${W}) ${nW[Q].fail} 0`;
			}
		},
		dependencies: ["format"]
	};
	var Kc = ($) => {
		return $.addKeyword(DA.formatLimitDefinition), $;
	};
	DA.default = Kc;
});
var AA = M((bJ, MA) => {
	Object.defineProperty(bJ, "__esModule", { value: !0 });
	var j8 = qA(), Nc = FA(), bK = a(), jA = new bK.Name("fullFormats"), Oc = new bK.Name("fastFormats"), RK = ($, X = { keywords: !0 }) => {
		if (Array.isArray(X)) return LA($, X, j8.fullFormats, jA), $;
		let [J, W] = X.mode === "fast" ? [j8.fastFormats, Oc] : [j8.fullFormats, jA];
		if (LA($, X.formats || j8.formatNames, J, W), X.keywords) (0, Nc.default)($);
		return $;
	};
	RK.get = ($, X = "full") => {
		let W = (X === "fast" ? j8.fastFormats : j8.fullFormats)[$];
		if (!W) throw Error(`Unknown format "${$}"`);
		return W;
	};
	function LA($, X, J, W) {
		var Q, Y;
		(Q = (Y = $.opts.code).formats) !== null && Q !== void 0 || (Y.formats = bK._`require("ajv-formats/dist/formats").${W}`);
		for (let z of X) $.addFormat(z, J[z]);
	}
	MA.exports = bJ = RK;
	Object.defineProperty(bJ, "__esModule", { value: !0 });
	bJ.default = RK;
});
var RI = 50;
function Y0($ = RI) {
	let X = new AbortController();
	return setMaxListeners($, X.signal), X;
}
function vJ($, X, J) {
	return new Promise((W, Q) => {
		if (X?.aborted) {
			if (J?.throwOnAbort || J?.abortError) Q(J.abortError?.() ?? Error("aborted"));
			else W();
			return;
		}
		let Y = setTimeout((G, H, U) => {
			G?.removeEventListener("abort", H), U();
		}, $, X, z, W);
		function z() {
			if (clearTimeout(Y), J?.throwOnAbort || J?.abortError) Q(J.abortError?.() ?? Error("aborted"));
			else W();
		}
		if (X?.addEventListener("abort", z, { once: !0 }), J?.unref) Y.unref();
	});
}
function PI($, X) {
	$(Error(X));
}
function G4($, X, J) {
	let W, Q = new Promise((Y, z) => {
		if (W = setTimeout(PI, X, z, J), typeof W === "object") W.unref?.();
	});
	return Promise.race([$, Q]).finally(() => {
		if (W !== void 0) clearTimeout(W);
	});
}
var X6 = class extends Error {};
function z0() {
	return process.versions.bun !== void 0;
}
function J6($) {
	if (!$) return !1;
	if (typeof $ === "boolean") return $;
	let X = String($).toLowerCase().trim();
	return [
		"1",
		"true",
		"yes",
		"on"
	].includes(X);
}
function F1() {
	let $ = /* @__PURE__ */ new Set();
	return {
		subscribe(X) {
			return $.add(X), () => {
				$.delete(X);
			};
		},
		emit(...X) {
			let J;
			for (let W of $) try {
				W(...X);
			} catch (Q) {
				(J ??= []).push(Q);
			}
			if (J) throw J.length === 1 ? J[0] : AggregateError(J, "Signal listener(s) threw");
		},
		clear() {
			$.clear();
		}
	};
}
var sK = typeof global == "object" && global && global.Object === Object && global;
var hI = typeof self == "object" && self && self.Object === Object && self, G0 = sK || hI || Function("return this")();
var H0 = G0.Symbol;
var eK = Object.prototype, lI = eK.hasOwnProperty, cI = eK.toString, P8 = H0 ? H0.toStringTag : void 0;
function dI($) {
	var X = lI.call($, P8), J = $[P8];
	try {
		$[P8] = void 0;
		var W = !0;
	} catch (Y) {}
	var Q = cI.call($);
	if (W) if (X) $[P8] = J;
	else delete $[P8];
	return Q;
}
var $V = dI;
var iI = Object.prototype.toString;
function nI($) {
	return iI.call($);
}
var XV = nI;
var rI = "[object Null]", oI = "[object Undefined]", JV = H0 ? H0.toStringTag : void 0;
function tI($) {
	if ($ == null) return $ === void 0 ? oI : rI;
	return JV && JV in Object($) ? $V($) : XV($);
}
var QV = tI;
function aI($) {
	var X = typeof $;
	return $ != null && (X == "object" || X == "function");
}
var kJ = aI;
var sI = "[object AsyncFunction]", eI = "[object Function]", $Z = "[object GeneratorFunction]", XZ = "[object Proxy]";
function JZ($) {
	if (!kJ($)) return !1;
	var X = QV($);
	return X == eI || X == $Z || X == sI || X == XZ;
}
var WV = JZ;
var _J = G0["__core-js_shared__"];
var YV = function() {
	var $ = /[^.]+$/.exec(_J && _J.keys && _J.keys.IE_PROTO || "");
	return $ ? "Symbol(src)_1." + $ : "";
}();
function WZ($) {
	return !!YV && YV in $;
}
var zV = WZ;
var zZ = Function.prototype.toString;
function GZ($) {
	if ($ != null) {
		try {
			return zZ.call($);
		} catch (X) {}
		try {
			return $ + "";
		} catch (X) {}
	}
	return "";
}
var GV = GZ;
var HZ = /[\\^$.*+?()[\]{}|]/g, UZ = /^\[object .+?Constructor\]$/, KZ = Function.prototype, VZ = Object.prototype, NZ = KZ.toString, OZ = VZ.hasOwnProperty, wZ = RegExp("^" + NZ.call(OZ).replace(HZ, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
function BZ($) {
	if (!kJ($) || zV($)) return !1;
	return (WV($) ? wZ : UZ).test(GV($));
}
var HV = BZ;
function qZ($, X) {
	return $ == null ? void 0 : $[X];
}
var UV = qZ;
function DZ($, X) {
	var J = UV($, X);
	return HV(J) ? J : void 0;
}
var xJ = DZ;
var H4 = xJ(Object, "create");
function jZ() {
	this.__data__ = H4 ? H4(null) : {}, this.size = 0;
}
var KV = jZ;
function LZ($) {
	var X = this.has($) && delete this.__data__[$];
	return this.size -= X ? 1 : 0, X;
}
var VV = LZ;
var MZ = "__lodash_hash_undefined__", IZ = Object.prototype.hasOwnProperty;
function ZZ($) {
	var X = this.__data__;
	if (H4) {
		var J = X[$];
		return J === MZ ? void 0 : J;
	}
	return IZ.call(X, $) ? X[$] : void 0;
}
var NV = ZZ;
var RZ = Object.prototype.hasOwnProperty;
function PZ($) {
	var X = this.__data__;
	return H4 ? X[$] !== void 0 : RZ.call(X, $);
}
var OV = PZ;
var EZ = "__lodash_hash_undefined__";
function SZ($, X) {
	var J = this.__data__;
	return this.size += this.has($) ? 0 : 1, J[$] = H4 && X === void 0 ? EZ : X, this;
}
var wV = SZ;
function U0($) {
	var X = -1, J = $ == null ? 0 : $.length;
	this.clear();
	while (++X < J) {
		var W = $[X];
		this.set(W[0], W[1]);
	}
}
U0.prototype.clear = KV;
U0.prototype.delete = VV;
U0.prototype.get = NV;
U0.prototype.has = OV;
U0.prototype.set = wV;
var QY = U0;
function vZ() {
	this.__data__ = [], this.size = 0;
}
var BV = vZ;
function CZ($, X) {
	return $ === X || $ !== $ && X !== X;
}
var qV = CZ;
function kZ($, X) {
	var J = $.length;
	while (J--) if (qV($[J][0], X)) return J;
	return -1;
}
var x4 = kZ;
var xZ = Array.prototype.splice;
function TZ($) {
	var X = this.__data__, J = x4(X, $);
	if (J < 0) return !1;
	if (J == X.length - 1) X.pop();
	else xZ.call(X, J, 1);
	return --this.size, !0;
}
var DV = TZ;
function fZ($) {
	var X = this.__data__, J = x4(X, $);
	return J < 0 ? void 0 : X[J][1];
}
var FV = fZ;
function yZ($) {
	return x4(this.__data__, $) > -1;
}
var jV = yZ;
function gZ($, X) {
	var J = this.__data__, W = x4(J, $);
	if (W < 0) ++this.size, J.push([$, X]);
	else J[W][1] = X;
	return this;
}
var LV = gZ;
function K0($) {
	var X = -1, J = $ == null ? 0 : $.length;
	this.clear();
	while (++X < J) {
		var W = $[X];
		this.set(W[0], W[1]);
	}
}
K0.prototype.clear = BV;
K0.prototype.delete = DV;
K0.prototype.get = FV;
K0.prototype.has = jV;
K0.prototype.set = LV;
var MV = K0;
var AV = xJ(G0, "Map");
function uZ() {
	this.size = 0, this.__data__ = {
		hash: new QY(),
		map: new (AV || MV)(),
		string: new QY()
	};
}
var IV = uZ;
function mZ($) {
	var X = typeof $;
	return X == "string" || X == "number" || X == "symbol" || X == "boolean" ? $ !== "__proto__" : $ === null;
}
var ZV = mZ;
function lZ($, X) {
	var J = $.__data__;
	return ZV(X) ? J[typeof X == "string" ? "string" : "hash"] : J.map;
}
var T4 = lZ;
function cZ($) {
	var X = T4(this, $).delete($);
	return this.size -= X ? 1 : 0, X;
}
var bV = cZ;
function dZ($) {
	return T4(this, $).get($);
}
var RV = dZ;
function pZ($) {
	return T4(this, $).has($);
}
var PV = pZ;
function iZ($, X) {
	var J = T4(this, $), W = J.size;
	return J.set($, X), this.size += J.size == W ? 0 : 1, this;
}
var EV = iZ;
function V0($) {
	var X = -1, J = $ == null ? 0 : $.length;
	this.clear();
	while (++X < J) {
		var W = $[X];
		this.set(W[0], W[1]);
	}
}
V0.prototype.clear = IV;
V0.prototype.delete = bV;
V0.prototype.get = RV;
V0.prototype.has = PV;
V0.prototype.set = EV;
var WY = V0;
var nZ = "Expected a function";
function YY($, X) {
	if (typeof $ != "function" || X != null && typeof X != "function") throw TypeError(nZ);
	var J = function() {
		var W = arguments, Q = X ? X.apply(this, W) : W[0], Y = J.cache;
		if (Y.has(Q)) return Y.get(Q);
		var z = $.apply(this, W);
		return J.cache = Y.set(Q, z) || Y, z;
	};
	return J.cache = new (YY.Cache || WY)(), J;
}
YY.Cache = WY;
var f6 = YY;
var f4 = f6(() => {
	return (process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude")).normalize("NFC");
}, () => process.env.CLAUDE_CONFIG_DIR);
function C($, X, J, W, Q) {
	if (W === "m") throw TypeError("Private method is not writable");
	if (W === "a" && !Q) throw TypeError("Private accessor was defined without a setter");
	if (typeof X === "function" ? $ !== X || !Q : !X.has($)) throw TypeError("Cannot write private member to an object whose class did not declare it");
	return W === "a" ? Q.call($, J) : Q ? Q.value = J : X.set($, J), J;
}
function D($, X, J, W) {
	if (J === "a" && !W) throw TypeError("Private accessor was defined without a getter");
	if (typeof X === "function" ? $ !== X || !W : !X.has($)) throw TypeError("Cannot read private member from an object whose class did not declare it");
	return J === "m" ? W : J === "a" ? W.call($) : W ? W.value : X.get($);
}
var zY = function() {
	let { crypto: $ } = globalThis;
	if ($?.randomUUID) return zY = $.randomUUID.bind($), $.randomUUID();
	let X = new Uint8Array(1), J = $ ? () => $.getRandomValues(X)[0] : () => Math.random() * 255 & 255;
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (W) => (+W ^ J() & 15 >> +W / 4).toString(16));
};
function U4($) {
	return typeof $ === "object" && $ !== null && ("name" in $ && $.name === "AbortError" || "message" in $ && String($.message).includes("FetchRequestCanceledException"));
}
var E8 = ($) => {
	if ($ instanceof Error) return $;
	if (typeof $ === "object" && $ !== null) {
		try {
			if (Object.prototype.toString.call($) === "[object Error]") {
				let X = Error($.message, $.cause ? { cause: $.cause } : {});
				if ($.stack) X.stack = $.stack;
				if ($.cause && !X.cause) X.cause = $.cause;
				if ($.name) X.name = $.name;
				return X;
			}
		} catch {}
		try {
			return Error(JSON.stringify($));
		} catch {}
	}
	return Error($);
};
var f = class extends Error {};
var T$ = class T$ extends f {
	constructor($, X, J, W, Q) {
		super(`${T$.makeMessage($, X, J)}`);
		this.status = $, this.headers = W, this.requestID = W?.get("request-id"), this.error = X, this.type = Q ?? null;
	}
	static makeMessage($, X, J) {
		let W = X?.message ? typeof X.message === "string" ? X.message : JSON.stringify(X.message) : X ? JSON.stringify(X) : J;
		if ($ && W) return `${$} ${W}`;
		if ($) return `${$} status code (no body)`;
		if (W) return W;
		return "(no status code or body)";
	}
	static generate($, X, J, W) {
		if (!$ || !W) return new j1({
			message: J,
			cause: E8(X)
		});
		let Q = X, Y = Q?.error?.type;
		if ($ === 400) return new v8($, Q, J, W, Y);
		if ($ === 401) return new C8($, Q, J, W, Y);
		if ($ === 403) return new k8($, Q, J, W, Y);
		if ($ === 404) return new _8($, Q, J, W, Y);
		if ($ === 409) return new x8($, Q, J, W, Y);
		if ($ === 422) return new T8($, Q, J, W, Y);
		if ($ === 429) return new f8($, Q, J, W, Y);
		if ($ >= 500) return new y8($, Q, J, W, Y);
		return new T$($, Q, J, W, Y);
	}
};
var m$ = class extends T$ {
	constructor({ message: $ } = {}) {
		super(void 0, void 0, $ || "Request was aborted.", void 0);
	}
};
var j1 = class extends T$ {
	constructor({ message: $, cause: X }) {
		super(void 0, void 0, $ || "Connection error.", void 0);
		if (X) this.cause = X;
	}
};
var S8 = class extends j1 {
	constructor({ message: $ } = {}) {
		super({ message: $ ?? "Request timed out." });
	}
};
var v8 = class extends T$ {};
var C8 = class extends T$ {};
var k8 = class extends T$ {};
var _8 = class extends T$ {};
var x8 = class extends T$ {};
var T8 = class extends T$ {};
var f8 = class extends T$ {};
var y8 = class extends T$ {};
var aZ = /^[a-z][a-z0-9+.-]*:/i, SV = ($) => {
	return aZ.test($);
}, GY = ($) => (GY = Array.isArray, GY($)), HY = GY;
function TJ($) {
	if (typeof $ !== "object") return {};
	return $ ?? {};
}
function UY($) {
	if (!$) return !0;
	for (let X in $) return !1;
	return !0;
}
function vV($, X) {
	return Object.prototype.hasOwnProperty.call($, X);
}
var CV = ($, X) => {
	if (typeof X !== "number" || !Number.isInteger(X)) throw new f(`${$} must be an integer`);
	if (X < 0) throw new f(`${$} must be a positive integer`);
	return X;
};
var fJ = ($) => {
	try {
		return JSON.parse($);
	} catch (X) {
		return;
	}
};
var kV = ($) => new Promise((X) => setTimeout(X, $));
var y4 = "0.81.0";
var fV = () => {
	return typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
};
function sZ() {
	if (typeof Deno < "u" && Deno.build != null) return "deno";
	if (typeof EdgeRuntime < "u") return "edge";
	if (Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]") return "node";
	return "unknown";
}
var eZ = () => {
	let $ = sZ();
	if ($ === "deno") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": y4,
		"X-Stainless-OS": xV(Deno.build.os),
		"X-Stainless-Arch": _V(Deno.build.arch),
		"X-Stainless-Runtime": "deno",
		"X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
	};
	if (typeof EdgeRuntime < "u") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": y4,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": `other:${EdgeRuntime}`,
		"X-Stainless-Runtime": "edge",
		"X-Stainless-Runtime-Version": globalThis.process.version
	};
	if ($ === "node") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": y4,
		"X-Stainless-OS": xV(globalThis.process.platform ?? "unknown"),
		"X-Stainless-Arch": _V(globalThis.process.arch ?? "unknown"),
		"X-Stainless-Runtime": "node",
		"X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
	};
	let X = $b();
	if (X) return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": y4,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": `browser:${X.browser}`,
		"X-Stainless-Runtime-Version": X.version
	};
	return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": y4,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": "unknown",
		"X-Stainless-Runtime-Version": "unknown"
	};
};
function $b() {
	if (typeof navigator > "u" || !navigator) return null;
	for (let { key: X, pattern: J } of [
		{
			key: "edge",
			pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "ie",
			pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "ie",
			pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "chrome",
			pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "firefox",
			pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "safari",
			pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
		}
	]) {
		let W = J.exec(navigator.userAgent);
		if (W) return {
			browser: X,
			version: `${W[1] || 0}.${W[2] || 0}.${W[3] || 0}`
		};
	}
	return null;
}
var _V = ($) => {
	if ($ === "x32") return "x32";
	if ($ === "x86_64" || $ === "x64") return "x64";
	if ($ === "arm") return "arm";
	if ($ === "aarch64" || $ === "arm64") return "arm64";
	if ($) return `other:${$}`;
	return "unknown";
}, xV = ($) => {
	if ($ = $.toLowerCase(), $.includes("ios")) return "iOS";
	if ($ === "android") return "Android";
	if ($ === "darwin") return "MacOS";
	if ($ === "win32") return "Windows";
	if ($ === "freebsd") return "FreeBSD";
	if ($ === "openbsd") return "OpenBSD";
	if ($ === "linux") return "Linux";
	if ($) return `Other:${$}`;
	return "Unknown";
}, TV, yV = () => {
	return TV ?? (TV = eZ());
};
function gV() {
	if (typeof fetch < "u") return fetch;
	throw Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function KY(...$) {
	let X = globalThis.ReadableStream;
	if (typeof X > "u") throw Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
	return new X(...$);
}
function yJ($) {
	let X = Symbol.asyncIterator in $ ? $[Symbol.asyncIterator]() : $[Symbol.iterator]();
	return KY({
		start() {},
		async pull(J) {
			let { done: W, value: Q } = await X.next();
			if (W) J.close();
			else J.enqueue(Q);
		},
		async cancel() {
			await X.return?.();
		}
	});
}
function g8($) {
	if ($[Symbol.asyncIterator]) return $;
	let X = $.getReader();
	return {
		async next() {
			try {
				let J = await X.read();
				if (J?.done) X.releaseLock();
				return J;
			} catch (J) {
				throw X.releaseLock(), J;
			}
		},
		async return() {
			let J = X.cancel();
			return X.releaseLock(), await J, {
				done: !0,
				value: void 0
			};
		},
		[Symbol.asyncIterator]() {
			return this;
		}
	};
}
async function hV($) {
	if ($ === null || typeof $ !== "object") return;
	if ($[Symbol.asyncIterator]) {
		await $[Symbol.asyncIterator]().return?.();
		return;
	}
	let X = $.getReader(), J = X.cancel();
	X.releaseLock(), await J;
}
var uV = ({ headers: $, body: X }) => {
	return {
		bodyHeaders: { "content-type": "application/json" },
		body: JSON.stringify(X)
	};
};
function mV($) {
	return Object.entries($).filter(([X, J]) => typeof J < "u").map(([X, J]) => {
		if (typeof J === "string" || typeof J === "number" || typeof J === "boolean") return `${encodeURIComponent(X)}=${encodeURIComponent(J)}`;
		if (J === null) return `${encodeURIComponent(X)}=`;
		throw new f(`Cannot stringify type ${typeof J}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
	}).join("&");
}
function dV($) {
	let X = 0;
	for (let Q of $) X += Q.length;
	let J = new Uint8Array(X), W = 0;
	for (let Q of $) J.set(Q, W), W += Q.length;
	return J;
}
var lV;
function h8($) {
	let X;
	return (lV ?? (X = new globalThis.TextEncoder(), lV = X.encode.bind(X)))($);
}
var cV;
function VY($) {
	let X;
	return (cV ?? (X = new globalThis.TextDecoder(), cV = X.decode.bind(X)))($);
}
var B6, q6;
var g4 = class {
	constructor() {
		B6.set(this, void 0), q6.set(this, void 0), C(this, B6, new Uint8Array(), "f"), C(this, q6, null, "f");
	}
	decode($) {
		if ($ == null) return [];
		let X = $ instanceof ArrayBuffer ? new Uint8Array($) : typeof $ === "string" ? h8($) : $;
		C(this, B6, dV([D(this, B6, "f"), X]), "f");
		let J = [], W;
		while ((W = Qb(D(this, B6, "f"), D(this, q6, "f"))) != null) {
			if (W.carriage && D(this, q6, "f") == null) {
				C(this, q6, W.index, "f");
				continue;
			}
			if (D(this, q6, "f") != null && (W.index !== D(this, q6, "f") + 1 || W.carriage)) {
				J.push(VY(D(this, B6, "f").subarray(0, D(this, q6, "f") - 1))), C(this, B6, D(this, B6, "f").subarray(D(this, q6, "f")), "f"), C(this, q6, null, "f");
				continue;
			}
			let Q = D(this, q6, "f") !== null ? W.preceding - 1 : W.preceding, Y = VY(D(this, B6, "f").subarray(0, Q));
			J.push(Y), C(this, B6, D(this, B6, "f").subarray(W.index), "f"), C(this, q6, null, "f");
		}
		return J;
	}
	flush() {
		if (!D(this, B6, "f").length) return [];
		return this.decode(`
`);
	}
};
B6 = /* @__PURE__ */ new WeakMap(), q6 = /* @__PURE__ */ new WeakMap();
g4.NEWLINE_CHARS = new Set([`
`, "\r"]);
g4.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Qb($, X) {
	for (let Q = X ?? 0; Q < $.length; Q++) {
		if ($[Q] === 10) return {
			preceding: Q,
			index: Q + 1,
			carriage: !1
		};
		if ($[Q] === 13) return {
			preceding: Q,
			index: Q + 1,
			carriage: !0
		};
	}
	return null;
}
function pV($) {
	for (let W = 0; W < $.length - 1; W++) {
		if ($[W] === 10 && $[W + 1] === 10) return W + 2;
		if ($[W] === 13 && $[W + 1] === 13) return W + 2;
		if ($[W] === 13 && $[W + 1] === 10 && W + 3 < $.length && $[W + 2] === 13 && $[W + 3] === 10) return W + 4;
	}
	return -1;
}
var hJ = {
	off: 0,
	error: 200,
	warn: 300,
	info: 400,
	debug: 500
}, NY = ($, X, J) => {
	if (!$) return;
	if (vV(hJ, $)) return $;
	h$(J).warn(`${X} was set to ${JSON.stringify($)}, expected one of ${JSON.stringify(Object.keys(hJ))}`);
};
function u8() {}
function gJ($, X, J) {
	if (!X || hJ[$] > hJ[J]) return u8;
	else return X[$].bind(X);
}
var Wb = {
	error: u8,
	warn: u8,
	info: u8,
	debug: u8
}, iV = /* @__PURE__ */ new WeakMap();
function h$($) {
	let X = $.logger, J = $.logLevel ?? "off";
	if (!X) return Wb;
	let W = iV.get(X);
	if (W && W[0] === J) return W[1];
	let Q = {
		error: gJ("error", X, J),
		warn: gJ("warn", X, J),
		info: gJ("info", X, J),
		debug: gJ("debug", X, J)
	};
	return iV.set(X, [J, Q]), Q;
}
var K4 = ($) => {
	if ($.options) $.options = { ...$.options }, delete $.options.headers;
	if ($.headers) $.headers = Object.fromEntries(($.headers instanceof Headers ? [...$.headers] : Object.entries($.headers)).map(([X, J]) => [X, X.toLowerCase() === "x-api-key" || X.toLowerCase() === "authorization" || X.toLowerCase() === "cookie" || X.toLowerCase() === "set-cookie" ? "***" : J]));
	if ("retryOfRequestLogID" in $) {
		if ($.retryOfRequestLogID) $.retryOf = $.retryOfRequestLogID;
		delete $.retryOfRequestLogID;
	}
	return $;
};
var m8;
var D6 = class D6 {
	constructor($, X, J) {
		this.iterator = $, m8.set(this, void 0), this.controller = X, C(this, m8, J, "f");
	}
	static fromSSEResponse($, X, J) {
		let W = !1, Q = J ? h$(J) : console;
		async function* Y() {
			if (W) throw new f("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			W = !0;
			let z = !1;
			try {
				for await (let G of Yb($, X)) {
					if (G.event === "completion") try {
						yield JSON.parse(G.data);
					} catch (H) {
						throw Q.error("Could not parse message into JSON:", G.data), Q.error("From chunk:", G.raw), H;
					}
					if (G.event === "message_start" || G.event === "message_delta" || G.event === "message_stop" || G.event === "content_block_start" || G.event === "content_block_delta" || G.event === "content_block_stop") try {
						yield JSON.parse(G.data);
					} catch (H) {
						throw Q.error("Could not parse message into JSON:", G.data), Q.error("From chunk:", G.raw), H;
					}
					if (G.event === "ping") continue;
					if (G.event === "error") {
						let H = fJ(G.data) ?? G.data, U = H?.error?.type;
						throw new T$(void 0, H, void 0, $.headers, U);
					}
				}
				z = !0;
			} catch (G) {
				if (U4(G)) return;
				throw G;
			} finally {
				if (!z) X.abort();
			}
		}
		return new D6(Y, X, J);
	}
	static fromReadableStream($, X, J) {
		let W = !1;
		async function* Q() {
			let z = new g4(), G = g8($);
			for await (let H of G) for (let U of z.decode(H)) yield U;
			for (let H of z.flush()) yield H;
		}
		async function* Y() {
			if (W) throw new f("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			W = !0;
			let z = !1;
			try {
				for await (let G of Q()) {
					if (z) continue;
					if (G) yield JSON.parse(G);
				}
				z = !0;
			} catch (G) {
				if (U4(G)) return;
				throw G;
			} finally {
				if (!z) X.abort();
			}
		}
		return new D6(Y, X, J);
	}
	[(m8 = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
		return this.iterator();
	}
	tee() {
		let $ = [], X = [], J = this.iterator(), W = (Q) => {
			return { next: () => {
				if (Q.length === 0) {
					let Y = J.next();
					$.push(Y), X.push(Y);
				}
				return Q.shift();
			} };
		};
		return [new D6(() => W($), this.controller, D(this, m8, "f")), new D6(() => W(X), this.controller, D(this, m8, "f"))];
	}
	toReadableStream() {
		let $ = this, X;
		return KY({
			async start() {
				X = $[Symbol.asyncIterator]();
			},
			async pull(J) {
				try {
					let { value: W, done: Q } = await X.next();
					if (Q) return J.close();
					let Y = h8(JSON.stringify(W) + `
`);
					J.enqueue(Y);
				} catch (W) {
					J.error(W);
				}
			},
			async cancel() {
				await X.return?.();
			}
		});
	}
};
async function* Yb($, X) {
	if (!$.body) {
		if (X.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative") throw new f("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api");
		throw new f("Attempted to iterate over a response with no body");
	}
	let J = new nV(), W = new g4(), Q = g8($.body);
	for await (let Y of zb(Q)) for (let z of W.decode(Y)) {
		let G = J.decode(z);
		if (G) yield G;
	}
	for (let Y of W.flush()) {
		let z = J.decode(Y);
		if (z) yield z;
	}
}
async function* zb($) {
	let X = new Uint8Array();
	for await (let J of $) {
		if (J == null) continue;
		let W = J instanceof ArrayBuffer ? new Uint8Array(J) : typeof J === "string" ? h8(J) : J, Q = new Uint8Array(X.length + W.length);
		Q.set(X), Q.set(W, X.length), X = Q;
		let Y;
		while ((Y = pV(X)) !== -1) yield X.slice(0, Y), X = X.slice(Y);
	}
	if (X.length > 0) yield X;
}
var nV = class {
	constructor() {
		this.event = null, this.data = [], this.chunks = [];
	}
	decode($) {
		if ($.endsWith("\r")) $ = $.substring(0, $.length - 1);
		if (!$) {
			if (!this.event && !this.data.length) return null;
			let Q = {
				event: this.event,
				data: this.data.join(`
`),
				raw: this.chunks
			};
			return this.event = null, this.data = [], this.chunks = [], Q;
		}
		if (this.chunks.push($), $.startsWith(":")) return null;
		let [X, J, W] = Gb($, ":");
		if (W.startsWith(" ")) W = W.substring(1);
		if (X === "event") this.event = W;
		else if (X === "data") this.data.push(W);
		return null;
	}
};
function Gb($, X) {
	let J = $.indexOf(X);
	if (J !== -1) return [
		$.substring(0, J),
		X,
		$.substring(J + X.length)
	];
	return [
		$,
		"",
		""
	];
}
async function uJ($, X) {
	let { response: J, requestLogID: W, retryOfRequestLogID: Q, startTime: Y } = X, z = await (async () => {
		if (X.options.stream) {
			if (h$($).debug("response", J.status, J.url, J.headers, J.body), X.options.__streamClass) return X.options.__streamClass.fromSSEResponse(J, X.controller);
			return D6.fromSSEResponse(J, X.controller);
		}
		if (J.status === 204) return null;
		if (X.options.__binaryResponse) return J;
		let H = J.headers.get("content-type")?.split(";")[0]?.trim();
		if (H?.includes("application/json") || H?.endsWith("+json")) {
			if (J.headers.get("content-length") === "0") return;
			return OY(await J.json(), J);
		}
		return await J.text();
	})();
	return h$($).debug(`[${W}] response parsed`, K4({
		retryOfRequestLogID: Q,
		url: J.url,
		status: J.status,
		body: z,
		durationMs: Date.now() - Y
	})), z;
}
function OY($, X) {
	if (!$ || typeof $ !== "object" || Array.isArray($)) return $;
	return Object.defineProperty($, "_request_id", {
		value: X.headers.get("request-id"),
		enumerable: !1
	});
}
var l8;
var L1 = class L1 extends Promise {
	constructor($, X, J = uJ) {
		super((W) => {
			W(null);
		});
		this.responsePromise = X, this.parseResponse = J, l8.set(this, void 0), C(this, l8, $, "f");
	}
	_thenUnwrap($) {
		return new L1(D(this, l8, "f"), this.responsePromise, async (X, J) => OY($(await this.parseResponse(X, J), J), J.response));
	}
	asResponse() {
		return this.responsePromise.then(($) => $.response);
	}
	async withResponse() {
		let [$, X] = await Promise.all([this.parse(), this.asResponse()]);
		return {
			data: $,
			response: X,
			request_id: X.headers.get("request-id")
		};
	}
	parse() {
		if (!this.parsedPromise) this.parsedPromise = this.responsePromise.then(($) => this.parseResponse(D(this, l8, "f"), $));
		return this.parsedPromise;
	}
	then($, X) {
		return this.parse().then($, X);
	}
	catch($) {
		return this.parse().catch($);
	}
	finally($) {
		return this.parse().finally($);
	}
};
l8 = /* @__PURE__ */ new WeakMap();
var mJ;
var wY = class {
	constructor($, X, J, W) {
		mJ.set(this, void 0), C(this, mJ, $, "f"), this.options = W, this.response = X, this.body = J;
	}
	hasNextPage() {
		if (!this.getPaginatedItems().length) return !1;
		return this.nextPageRequestOptions() != null;
	}
	async getNextPage() {
		let $ = this.nextPageRequestOptions();
		if (!$) throw new f("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
		return await D(this, mJ, "f").requestAPIList(this.constructor, $);
	}
	async *iterPages() {
		let $ = this;
		yield $;
		while ($.hasNextPage()) $ = await $.getNextPage(), yield $;
	}
	async *[(mJ = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
		for await (let $ of this.iterPages()) for (let X of $.getPaginatedItems()) yield X;
	}
};
var lJ = class extends L1 {
	constructor($, X, J) {
		super($, X, async (W, Q) => new J(W, Q.response, await uJ(W, Q), Q.options));
	}
	async *[Symbol.asyncIterator]() {
		let $ = await this;
		for await (let X of $) yield X;
	}
};
var y6 = class extends wY {
	constructor($, X, J, W) {
		super($, X, J, W);
		this.data = J.data || [], this.has_more = J.has_more || !1, this.first_id = J.first_id || null, this.last_id = J.last_id || null;
	}
	getPaginatedItems() {
		return this.data ?? [];
	}
	hasNextPage() {
		if (this.has_more === !1) return !1;
		return super.hasNextPage();
	}
	nextPageRequestOptions() {
		if (this.options.query?.before_id) {
			let X = this.first_id;
			if (!X) return null;
			return {
				...this.options,
				query: {
					...TJ(this.options.query),
					before_id: X
				}
			};
		}
		let $ = this.last_id;
		if (!$) return null;
		return {
			...this.options,
			query: {
				...TJ(this.options.query),
				after_id: $
			}
		};
	}
};
var c8 = class extends wY {
	constructor($, X, J, W) {
		super($, X, J, W);
		this.data = J.data || [], this.has_more = J.has_more || !1, this.next_page = J.next_page || null;
	}
	getPaginatedItems() {
		return this.data ?? [];
	}
	hasNextPage() {
		if (this.has_more === !1) return !1;
		return super.hasNextPage();
	}
	nextPageRequestOptions() {
		let $ = this.next_page;
		if (!$) return null;
		return {
			...this.options,
			query: {
				...TJ(this.options.query),
				page: $
			}
		};
	}
};
var qY = () => {
	if (typeof File > "u") {
		let { process: $ } = globalThis, X = typeof $?.versions?.node === "string" && parseInt($.versions.node.split(".")) < 20;
		throw Error("`File` is not defined as a global, which is required for file uploads." + (X ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
	}
};
function M1($, X, J) {
	return qY(), new File($, X ?? "unknown_file", J);
}
function d8($, X) {
	let J = typeof $ === "object" && $ !== null && ("name" in $ && $.name && String($.name) || "url" in $ && $.url && String($.url) || "filename" in $ && $.filename && String($.filename) || "path" in $ && $.path && String($.path)) || "";
	return X ? J.split(/[\\/]/).pop() || void 0 : J;
}
var DY = ($) => $ != null && typeof $ === "object" && typeof $[Symbol.asyncIterator] === "function";
var N0 = async ($, X, J = !0) => {
	return {
		...$,
		body: await Kb($.body, X, J)
	};
}, rV = /* @__PURE__ */ new WeakMap();
function Ub($) {
	let X = typeof $ === "function" ? $ : $.fetch, J = rV.get(X);
	if (J) return J;
	let W = (async () => {
		try {
			let Q = "Response" in X ? X.Response : (await X("data:,")).constructor, Y = new FormData();
			if (Y.toString() === await new Q(Y).text()) return !1;
			return !0;
		} catch {
			return !0;
		}
	})();
	return rV.set(X, W), W;
}
var Kb = async ($, X, J = !0) => {
	if (!await Ub(X)) throw TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
	let W = new FormData();
	return await Promise.all(Object.entries($ || {}).map(([Q, Y]) => BY(W, Q, Y, J))), W;
}, Vb = ($) => $ instanceof Blob && "name" in $;
var BY = async ($, X, J, W) => {
	if (J === void 0) return;
	if (J == null) throw TypeError(`Received null for "${X}"; to pass null in FormData, you must use the string 'null'`);
	if (typeof J === "string" || typeof J === "number" || typeof J === "boolean") $.append(X, String(J));
	else if (J instanceof Response) {
		let Q = {}, Y = J.headers.get("Content-Type");
		if (Y) Q = { type: Y };
		$.append(X, M1([await J.blob()], d8(J, W), Q));
	} else if (DY(J)) $.append(X, M1([await new Response(yJ(J)).blob()], d8(J, W)));
	else if (Vb(J)) $.append(X, M1([J], d8(J, W), { type: J.type }));
	else if (Array.isArray(J)) await Promise.all(J.map((Q) => BY($, X + "[]", Q, W)));
	else if (typeof J === "object") await Promise.all(Object.entries(J).map(([Q, Y]) => BY($, `${X}[${Q}]`, Y, W)));
	else throw TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${J} instead`);
};
var oV = ($) => $ != null && typeof $ === "object" && typeof $.size === "number" && typeof $.type === "string" && typeof $.text === "function" && typeof $.slice === "function" && typeof $.arrayBuffer === "function", Nb = ($) => $ != null && typeof $ === "object" && typeof $.name === "string" && typeof $.lastModified === "number" && oV($), Ob = ($) => $ != null && typeof $ === "object" && typeof $.url === "string" && typeof $.blob === "function";
async function cJ($, X, J) {
	if (qY(), $ = await $, X || (X = d8($, !0)), Nb($)) {
		if ($ instanceof File && X == null && J == null) return $;
		return M1([await $.arrayBuffer()], X ?? $.name, {
			type: $.type,
			lastModified: $.lastModified,
			...J
		});
	}
	if (Ob($)) {
		let Q = await $.blob();
		return X || (X = new URL($.url).pathname.split(/[\\/]/).pop()), M1(await FY(Q), X, J);
	}
	let W = await FY($);
	if (!J?.type) {
		let Q = W.find((Y) => typeof Y === "object" && "type" in Y && Y.type);
		if (typeof Q === "string") J = {
			...J,
			type: Q
		};
	}
	return M1(W, X, J);
}
async function FY($) {
	let X = [];
	if (typeof $ === "string" || ArrayBuffer.isView($) || $ instanceof ArrayBuffer) X.push($);
	else if (oV($)) X.push($ instanceof Blob ? $ : await $.arrayBuffer());
	else if (DY($)) for await (let J of $) X.push(...await FY(J));
	else {
		let J = $?.constructor?.name;
		throw Error(`Unexpected data type: ${typeof $}${J ? `; constructor: ${J}` : ""}${wb($)}`);
	}
	return X;
}
function wb($) {
	if (typeof $ !== "object" || $ === null) return "";
	return `; props: [${Object.getOwnPropertyNames($).map((J) => `"${J}"`).join(", ")}]`;
}
var b$ = class {
	constructor($) {
		this._client = $;
	}
};
var tV = Symbol.for("brand.privateNullableHeaders");
function* qb($) {
	if (!$) return;
	if (tV in $) {
		let { values: W, nulls: Q } = $;
		yield* W.entries();
		for (let Y of Q) yield [Y, null];
		return;
	}
	let X = !1, J;
	if ($ instanceof Headers) J = $.entries();
	else if (HY($)) J = $;
	else X = !0, J = Object.entries($ ?? {});
	for (let W of J) {
		let Q = W[0];
		if (typeof Q !== "string") throw TypeError("expected header name to be a string");
		let Y = HY(W[1]) ? W[1] : [W[1]], z = !1;
		for (let G of Y) {
			if (G === void 0) continue;
			if (X && !z) z = !0, yield [Q, null];
			yield [Q, G];
		}
	}
}
var i = ($) => {
	let X = new Headers(), J = /* @__PURE__ */ new Set();
	for (let W of $) {
		let Q = /* @__PURE__ */ new Set();
		for (let [Y, z] of qb(W)) {
			let G = Y.toLowerCase();
			if (!Q.has(G)) X.delete(Y), Q.add(G);
			if (z === null) X.delete(Y), J.add(G);
			else X.append(Y, z), J.delete(G);
		}
	}
	return {
		[tV]: !0,
		values: X,
		nulls: J
	};
};
var p8 = Symbol("anthropic.sdk.stainlessHelper");
function dJ($) {
	return typeof $ === "object" && $ !== null && p8 in $;
}
function jY($, X) {
	let J = /* @__PURE__ */ new Set();
	if ($) {
		for (let W of $) if (dJ(W)) J.add(W[p8]);
	}
	if (X) for (let W of X) {
		if (dJ(W)) J.add(W[p8]);
		if (Array.isArray(W.content)) {
			for (let Q of W.content) if (dJ(Q)) J.add(Q[p8]);
		}
	}
	return Array.from(J);
}
function pJ($, X) {
	let J = jY($, X);
	if (J.length === 0) return {};
	return { "x-stainless-helper": J.join(", ") };
}
function aV($) {
	if (dJ($)) return { "x-stainless-helper": $[p8] };
	return {};
}
function eV($) {
	return $.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var sV = Object.freeze(Object.create(null)), Db = ($ = eV) => function(J, ...W) {
	if (J.length === 1) return J[0];
	let Q = !1, Y = [], z = J.reduce((K, V, N) => {
		if (/[?#]/.test(V)) Q = !0;
		let O = W[N], w = (Q ? encodeURIComponent : $)("" + O);
		if (N !== W.length && (O == null || typeof O === "object" && O.toString === Object.getPrototypeOf(Object.getPrototypeOf(O.hasOwnProperty ?? sV) ?? sV)?.toString)) w = O + "", Y.push({
			start: K.length + V.length,
			length: w.length,
			error: `Value of type ${Object.prototype.toString.call(O).slice(8, -1)} is not a valid path parameter`
		});
		return K + V + (N === W.length ? "" : w);
	}, ""), G = z.split(/[?#]/, 1)[0], H = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi, U;
	while ((U = H.exec(G)) !== null) Y.push({
		start: U.index,
		length: U[0].length,
		error: `Value "${U[0]}" can't be safely passed as a path parameter`
	});
	if (Y.sort((K, V) => K.start - V.start), Y.length > 0) {
		let K = 0, V = Y.reduce((N, O) => {
			let w = " ".repeat(O.start - K), B = "^".repeat(O.length);
			return K = O.start + O.length, N + w + B;
		}, "");
		throw new f(`Path parameters result in path with invalid segments:
${Y.map((N) => N.error).join(`
`)}
${z}
${V}`);
	}
	return z;
}, A$ = Db(eV);
var i8 = class extends b$ {
	list($ = {}, X) {
		let { betas: J, ...W } = $ ?? {};
		return this._client.getAPIList("/v1/files", y6, {
			query: W,
			...X,
			headers: i([{ "anthropic-beta": [...J ?? [], "files-api-2025-04-14"].toString() }, X?.headers])
		});
	}
	delete($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.delete(A$`/v1/files/${$}`, {
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "files-api-2025-04-14"].toString() }, J?.headers])
		});
	}
	download($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.get(A$`/v1/files/${$}/content`, {
			...J,
			headers: i([{
				"anthropic-beta": [...W ?? [], "files-api-2025-04-14"].toString(),
				Accept: "application/binary"
			}, J?.headers]),
			__binaryResponse: !0
		});
	}
	retrieveMetadata($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.get(A$`/v1/files/${$}`, {
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "files-api-2025-04-14"].toString() }, J?.headers])
		});
	}
	upload($, X) {
		let { betas: J, ...W } = $;
		return this._client.post("/v1/files", N0({
			body: W,
			...X,
			headers: i([
				{ "anthropic-beta": [...J ?? [], "files-api-2025-04-14"].toString() },
				aV(W.file),
				X?.headers
			])
		}, this._client));
	}
};
var n8 = class extends b$ {
	retrieve($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.get(A$`/v1/models/${$}?beta=true`, {
			...J,
			headers: i([{ ...W?.toString() != null ? { "anthropic-beta": W?.toString() } : void 0 }, J?.headers])
		});
	}
	list($ = {}, X) {
		let { betas: J, ...W } = $ ?? {};
		return this._client.getAPIList("/v1/models?beta=true", y6, {
			query: W,
			...X,
			headers: i([{ ...J?.toString() != null ? { "anthropic-beta": J?.toString() } : void 0 }, X?.headers])
		});
	}
};
var iJ = {
	"claude-opus-4-20250514": 8192,
	"claude-opus-4-0": 8192,
	"claude-4-opus-20250514": 8192,
	"anthropic.claude-opus-4-20250514-v1:0": 8192,
	"claude-opus-4@20250514": 8192,
	"claude-opus-4-1-20250805": 8192,
	"anthropic.claude-opus-4-1-20250805-v1:0": 8192,
	"claude-opus-4-1@20250805": 8192
};
function $N($) {
	return $?.output_format ?? $?.output_config?.format;
}
function LY($, X, J) {
	let W = $N(X);
	if (!X || !("parse" in (W ?? {}))) return {
		...$,
		content: $.content.map((Q) => {
			if (Q.type === "text") {
				let Y = Object.defineProperty({ ...Q }, "parsed_output", {
					value: null,
					enumerable: !1
				});
				return Object.defineProperty(Y, "parsed", {
					get() {
						return J.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), null;
					},
					enumerable: !1
				});
			}
			return Q;
		}),
		parsed_output: null
	};
	return MY($, X, J);
}
function MY($, X, J) {
	let W = null, Q = $.content.map((Y) => {
		if (Y.type === "text") {
			let z = Lb(X, Y.text);
			if (W === null) W = z;
			let G = Object.defineProperty({ ...Y }, "parsed_output", {
				value: z,
				enumerable: !1
			});
			return Object.defineProperty(G, "parsed", {
				get() {
					return J.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), z;
				},
				enumerable: !1
			});
		}
		return Y;
	});
	return {
		...$,
		content: Q,
		parsed_output: W
	};
}
function Lb($, X) {
	let J = $N($);
	if (J?.type !== "json_schema") return null;
	try {
		if ("parse" in J) return J.parse(X);
		return JSON.parse(X);
	} catch (W) {
		throw new f(`Failed to parse structured output: ${W}`);
	}
}
var Mb = ($) => {
	let X = 0, J = [];
	while (X < $.length) {
		let W = $[X];
		if (W === "\\") {
			X++;
			continue;
		}
		if (W === "{") {
			J.push({
				type: "brace",
				value: "{"
			}), X++;
			continue;
		}
		if (W === "}") {
			J.push({
				type: "brace",
				value: "}"
			}), X++;
			continue;
		}
		if (W === "[") {
			J.push({
				type: "paren",
				value: "["
			}), X++;
			continue;
		}
		if (W === "]") {
			J.push({
				type: "paren",
				value: "]"
			}), X++;
			continue;
		}
		if (W === ":") {
			J.push({
				type: "separator",
				value: ":"
			}), X++;
			continue;
		}
		if (W === ",") {
			J.push({
				type: "delimiter",
				value: ","
			}), X++;
			continue;
		}
		if (W === "\"") {
			let G = "", H = !1;
			W = $[++X];
			while (W !== "\"") {
				if (X === $.length) {
					H = !0;
					break;
				}
				if (W === "\\") {
					if (X++, X === $.length) {
						H = !0;
						break;
					}
					G += W + $[X], W = $[++X];
				} else G += W, W = $[++X];
			}
			if (W = $[++X], !H) J.push({
				type: "string",
				value: G
			});
			continue;
		}
		if (W && /\s/.test(W)) {
			X++;
			continue;
		}
		let Y = /[0-9]/;
		if (W && Y.test(W) || W === "-" || W === ".") {
			let G = "";
			if (W === "-") G += W, W = $[++X];
			while (W && Y.test(W) || W === ".") G += W, W = $[++X];
			J.push({
				type: "number",
				value: G
			});
			continue;
		}
		let z = /[a-z]/i;
		if (W && z.test(W)) {
			let G = "";
			while (W && z.test(W)) {
				if (X === $.length) break;
				G += W, W = $[++X];
			}
			if (G == "true" || G == "false" || G === "null") J.push({
				type: "name",
				value: G
			});
			else {
				X++;
				continue;
			}
			continue;
		}
		X++;
	}
	return J;
}, O0 = ($) => {
	if ($.length === 0) return $;
	let X = $[$.length - 1];
	switch (X.type) {
		case "separator": return $ = $.slice(0, $.length - 1), O0($);
		case "number":
			let J = X.value[X.value.length - 1];
			if (J === "." || J === "-") return $ = $.slice(0, $.length - 1), O0($);
		case "string":
			let W = $[$.length - 2];
			if (W?.type === "delimiter") return $ = $.slice(0, $.length - 1), O0($);
			else if (W?.type === "brace" && W.value === "{") return $ = $.slice(0, $.length - 1), O0($);
			break;
		case "delimiter": return $ = $.slice(0, $.length - 1), O0($);
	}
	return $;
}, Ab = ($) => {
	let X = [];
	if ($.map((J) => {
		if (J.type === "brace") if (J.value === "{") X.push("}");
		else X.splice(X.lastIndexOf("}"), 1);
		if (J.type === "paren") if (J.value === "[") X.push("]");
		else X.splice(X.lastIndexOf("]"), 1);
	}), X.length > 0) X.reverse().map((J) => {
		if (J === "}") $.push({
			type: "brace",
			value: "}"
		});
		else if (J === "]") $.push({
			type: "paren",
			value: "]"
		});
	});
	return $;
}, Ib = ($) => {
	let X = "";
	return $.map((J) => {
		switch (J.type) {
			case "string":
				X += "\"" + J.value + "\"";
				break;
			default:
				X += J.value;
				break;
		}
	}), X;
}, nJ = ($) => JSON.parse(Ib(Ab(O0(Mb($)))));
var Z6, h4, w0, r8, rJ, o8, t8, oJ, a8, V4, s8, tJ, aJ, A1, sJ, eJ, e8, AY, XN, $7, IY, ZY, bY, JN, QN = "__json_buf";
function WN($) {
	return $.type === "tool_use" || $.type === "server_tool_use" || $.type === "mcp_tool_use";
}
var $9 = class $9 {
	constructor($, X) {
		Z6.add(this), this.messages = [], this.receivedMessages = [], h4.set(this, void 0), w0.set(this, null), this.controller = new AbortController(), r8.set(this, void 0), rJ.set(this, () => {}), o8.set(this, () => {}), t8.set(this, void 0), oJ.set(this, () => {}), a8.set(this, () => {}), V4.set(this, {}), s8.set(this, !1), tJ.set(this, !1), aJ.set(this, !1), A1.set(this, !1), sJ.set(this, void 0), eJ.set(this, void 0), e8.set(this, void 0), $7.set(this, (J) => {
			if (C(this, tJ, !0, "f"), U4(J)) J = new m$();
			if (J instanceof m$) return C(this, aJ, !0, "f"), this._emit("abort", J);
			if (J instanceof f) return this._emit("error", J);
			if (J instanceof Error) {
				let W = new f(J.message);
				return W.cause = J, this._emit("error", W);
			}
			return this._emit("error", new f(String(J)));
		}), C(this, r8, new Promise((J, W) => {
			C(this, rJ, J, "f"), C(this, o8, W, "f");
		}), "f"), C(this, t8, new Promise((J, W) => {
			C(this, oJ, J, "f"), C(this, a8, W, "f");
		}), "f"), D(this, r8, "f").catch(() => {}), D(this, t8, "f").catch(() => {}), C(this, w0, $, "f"), C(this, e8, X?.logger ?? console, "f");
	}
	get response() {
		return D(this, sJ, "f");
	}
	get request_id() {
		return D(this, eJ, "f");
	}
	async withResponse() {
		C(this, A1, !0, "f");
		let $ = await D(this, r8, "f");
		if (!$) throw Error("Could not resolve a `Response` object");
		return {
			data: this,
			response: $,
			request_id: $.headers.get("request-id")
		};
	}
	static fromReadableStream($) {
		let X = new $9(null);
		return X._run(() => X._fromReadableStream($)), X;
	}
	static createMessage($, X, J, { logger: W } = {}) {
		let Q = new $9(X, { logger: W });
		for (let Y of X.messages) Q._addMessageParam(Y);
		return C(Q, w0, {
			...X,
			stream: !0
		}, "f"), Q._run(() => Q._createMessage($, {
			...X,
			stream: !0
		}, {
			...J,
			headers: {
				...J?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		})), Q;
	}
	_run($) {
		$().then(() => {
			this._emitFinal(), this._emit("end");
		}, D(this, $7, "f"));
	}
	_addMessageParam($) {
		this.messages.push($);
	}
	_addMessage($, X = !0) {
		if (this.receivedMessages.push($), X) this._emit("message", $);
	}
	async _createMessage($, X, J) {
		let W = J?.signal, Q;
		if (W) {
			if (W.aborted) this.controller.abort();
			Q = this.controller.abort.bind(this.controller), W.addEventListener("abort", Q);
		}
		try {
			D(this, Z6, "m", IY).call(this);
			let { response: Y, data: z } = await $.create({
				...X,
				stream: !0
			}, {
				...J,
				signal: this.controller.signal
			}).withResponse();
			this._connected(Y);
			for await (let G of z) D(this, Z6, "m", ZY).call(this, G);
			if (z.controller.signal?.aborted) throw new m$();
			D(this, Z6, "m", bY).call(this);
		} finally {
			if (W && Q) W.removeEventListener("abort", Q);
		}
	}
	_connected($) {
		if (this.ended) return;
		C(this, sJ, $, "f"), C(this, eJ, $?.headers.get("request-id"), "f"), D(this, rJ, "f").call(this, $), this._emit("connect");
	}
	get ended() {
		return D(this, s8, "f");
	}
	get errored() {
		return D(this, tJ, "f");
	}
	get aborted() {
		return D(this, aJ, "f");
	}
	abort() {
		this.controller.abort();
	}
	on($, X) {
		return (D(this, V4, "f")[$] || (D(this, V4, "f")[$] = [])).push({ listener: X }), this;
	}
	off($, X) {
		let J = D(this, V4, "f")[$];
		if (!J) return this;
		let W = J.findIndex((Q) => Q.listener === X);
		if (W >= 0) J.splice(W, 1);
		return this;
	}
	once($, X) {
		return (D(this, V4, "f")[$] || (D(this, V4, "f")[$] = [])).push({
			listener: X,
			once: !0
		}), this;
	}
	emitted($) {
		return new Promise((X, J) => {
			if (C(this, A1, !0, "f"), $ !== "error") this.once("error", J);
			this.once($, X);
		});
	}
	async done() {
		C(this, A1, !0, "f"), await D(this, t8, "f");
	}
	get currentMessage() {
		return D(this, h4, "f");
	}
	async finalMessage() {
		return await this.done(), D(this, Z6, "m", AY).call(this);
	}
	async finalText() {
		return await this.done(), D(this, Z6, "m", XN).call(this);
	}
	_emit($, ...X) {
		if (D(this, s8, "f")) return;
		if ($ === "end") C(this, s8, !0, "f"), D(this, oJ, "f").call(this);
		let J = D(this, V4, "f")[$];
		if (J) D(this, V4, "f")[$] = J.filter((W) => !W.once), J.forEach(({ listener: W }) => W(...X));
		if ($ === "abort") {
			let W = X[0];
			if (!D(this, A1, "f") && !J?.length) Promise.reject(W);
			D(this, o8, "f").call(this, W), D(this, a8, "f").call(this, W), this._emit("end");
			return;
		}
		if ($ === "error") {
			let W = X[0];
			if (!D(this, A1, "f") && !J?.length) Promise.reject(W);
			D(this, o8, "f").call(this, W), D(this, a8, "f").call(this, W), this._emit("end");
		}
	}
	_emitFinal() {
		if (this.receivedMessages.at(-1)) this._emit("finalMessage", D(this, Z6, "m", AY).call(this));
	}
	async _fromReadableStream($, X) {
		let J = X?.signal, W;
		if (J) {
			if (J.aborted) this.controller.abort();
			W = this.controller.abort.bind(this.controller), J.addEventListener("abort", W);
		}
		try {
			D(this, Z6, "m", IY).call(this), this._connected(null);
			let Q = D6.fromReadableStream($, this.controller);
			for await (let Y of Q) D(this, Z6, "m", ZY).call(this, Y);
			if (Q.controller.signal?.aborted) throw new m$();
			D(this, Z6, "m", bY).call(this);
		} finally {
			if (J && W) J.removeEventListener("abort", W);
		}
	}
	[(h4 = /* @__PURE__ */ new WeakMap(), w0 = /* @__PURE__ */ new WeakMap(), r8 = /* @__PURE__ */ new WeakMap(), rJ = /* @__PURE__ */ new WeakMap(), o8 = /* @__PURE__ */ new WeakMap(), t8 = /* @__PURE__ */ new WeakMap(), oJ = /* @__PURE__ */ new WeakMap(), a8 = /* @__PURE__ */ new WeakMap(), V4 = /* @__PURE__ */ new WeakMap(), s8 = /* @__PURE__ */ new WeakMap(), tJ = /* @__PURE__ */ new WeakMap(), aJ = /* @__PURE__ */ new WeakMap(), A1 = /* @__PURE__ */ new WeakMap(), sJ = /* @__PURE__ */ new WeakMap(), eJ = /* @__PURE__ */ new WeakMap(), e8 = /* @__PURE__ */ new WeakMap(), $7 = /* @__PURE__ */ new WeakMap(), Z6 = /* @__PURE__ */ new WeakSet(), AY = function() {
		if (this.receivedMessages.length === 0) throw new f("stream ended without producing a Message with role=assistant");
		return this.receivedMessages.at(-1);
	}, XN = function() {
		if (this.receivedMessages.length === 0) throw new f("stream ended without producing a Message with role=assistant");
		let X = this.receivedMessages.at(-1).content.filter((J) => J.type === "text").map((J) => J.text);
		if (X.length === 0) throw new f("stream ended without producing a content block with type=text");
		return X.join(" ");
	}, IY = function() {
		if (this.ended) return;
		C(this, h4, void 0, "f");
	}, ZY = function(X) {
		if (this.ended) return;
		let J = D(this, Z6, "m", JN).call(this, X);
		switch (this._emit("streamEvent", X, J), X.type) {
			case "content_block_delta": {
				let W = J.content.at(-1);
				switch (X.delta.type) {
					case "text_delta":
						if (W.type === "text") this._emit("text", X.delta.text, W.text || "");
						break;
					case "citations_delta":
						if (W.type === "text") this._emit("citation", X.delta.citation, W.citations ?? []);
						break;
					case "input_json_delta":
						if (WN(W) && W.input) this._emit("inputJson", X.delta.partial_json, W.input);
						break;
					case "thinking_delta":
						if (W.type === "thinking") this._emit("thinking", X.delta.thinking, W.thinking);
						break;
					case "signature_delta":
						if (W.type === "thinking") this._emit("signature", W.signature);
						break;
					case "compaction_delta":
						if (W.type === "compaction" && W.content) this._emit("compaction", W.content);
						break;
					default: YN(X.delta);
				}
				break;
			}
			case "message_stop":
				this._addMessageParam(J), this._addMessage(LY(J, D(this, w0, "f"), { logger: D(this, e8, "f") }), !0);
				break;
			case "content_block_stop":
				this._emit("contentBlock", J.content.at(-1));
				break;
			case "message_start":
				C(this, h4, J, "f");
				break;
			case "content_block_start":
			case "message_delta": break;
		}
	}, bY = function() {
		if (this.ended) throw new f("stream has ended, this shouldn't happen");
		let X = D(this, h4, "f");
		if (!X) throw new f("request ended without sending any chunks");
		return C(this, h4, void 0, "f"), LY(X, D(this, w0, "f"), { logger: D(this, e8, "f") });
	}, JN = function(X) {
		let J = D(this, h4, "f");
		if (X.type === "message_start") {
			if (J) throw new f(`Unexpected event order, got ${X.type} before receiving "message_stop"`);
			return X.message;
		}
		if (!J) throw new f(`Unexpected event order, got ${X.type} before "message_start"`);
		switch (X.type) {
			case "message_stop": return J;
			case "message_delta":
				if (J.container = X.delta.container, J.stop_reason = X.delta.stop_reason, J.stop_sequence = X.delta.stop_sequence, J.usage.output_tokens = X.usage.output_tokens, J.context_management = X.context_management, X.usage.input_tokens != null) J.usage.input_tokens = X.usage.input_tokens;
				if (X.usage.cache_creation_input_tokens != null) J.usage.cache_creation_input_tokens = X.usage.cache_creation_input_tokens;
				if (X.usage.cache_read_input_tokens != null) J.usage.cache_read_input_tokens = X.usage.cache_read_input_tokens;
				if (X.usage.server_tool_use != null) J.usage.server_tool_use = X.usage.server_tool_use;
				if (X.usage.iterations != null) J.usage.iterations = X.usage.iterations;
				return J;
			case "content_block_start": return J.content.push(X.content_block), J;
			case "content_block_delta": {
				let W = J.content.at(X.index);
				switch (X.delta.type) {
					case "text_delta":
						if (W?.type === "text") J.content[X.index] = {
							...W,
							text: (W.text || "") + X.delta.text
						};
						break;
					case "citations_delta":
						if (W?.type === "text") J.content[X.index] = {
							...W,
							citations: [...W.citations ?? [], X.delta.citation]
						};
						break;
					case "input_json_delta":
						if (W && WN(W)) {
							let Q = W[QN] || "";
							Q += X.delta.partial_json;
							let Y = { ...W };
							if (Object.defineProperty(Y, QN, {
								value: Q,
								enumerable: !1,
								writable: !0
							}), Q) try {
								Y.input = nJ(Q);
							} catch (z) {
								let G = new f(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${z}. JSON: ${Q}`);
								D(this, $7, "f").call(this, G);
							}
							J.content[X.index] = Y;
						}
						break;
					case "thinking_delta":
						if (W?.type === "thinking") J.content[X.index] = {
							...W,
							thinking: W.thinking + X.delta.thinking
						};
						break;
					case "signature_delta":
						if (W?.type === "thinking") J.content[X.index] = {
							...W,
							signature: X.delta.signature
						};
						break;
					case "compaction_delta":
						if (W?.type === "compaction") J.content[X.index] = {
							...W,
							content: (W.content || "") + X.delta.content
						};
						break;
					default: YN(X.delta);
				}
				return J;
			}
			case "content_block_stop": return J;
		}
	}, Symbol.asyncIterator)]() {
		let $ = [], X = [], J = !1;
		return this.on("streamEvent", (W) => {
			let Q = X.shift();
			if (Q) Q.resolve(W);
			else $.push(W);
		}), this.on("end", () => {
			J = !0;
			for (let W of X) W.resolve(void 0);
			X.length = 0;
		}), this.on("abort", (W) => {
			J = !0;
			for (let Q of X) Q.reject(W);
			X.length = 0;
		}), this.on("error", (W) => {
			J = !0;
			for (let Q of X) Q.reject(W);
			X.length = 0;
		}), {
			next: async () => {
				if (!$.length) {
					if (J) return {
						value: void 0,
						done: !0
					};
					return new Promise((Q, Y) => X.push({
						resolve: Q,
						reject: Y
					})).then((Q) => Q ? {
						value: Q,
						done: !1
					} : {
						value: void 0,
						done: !0
					});
				}
				return {
					value: $.shift(),
					done: !1
				};
			},
			return: async () => {
				return this.abort(), {
					value: void 0,
					done: !0
				};
			}
		};
	}
	toReadableStream() {
		return new D6(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
	}
};
function YN($) {}
var B0 = class extends Error {
	constructor($) {
		let X = typeof $ === "string" ? $ : $.map((J) => {
			if (J.type === "text") return J.text;
			return `[${J.type}]`;
		}).join(" ");
		super(X);
		this.name = "ToolError", this.content = $;
	}
};
var zN = 1e5, GN = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
1. Task Overview
The user's core request and success criteria
Any clarifications or constraints they specified
2. Current State
What has been completed so far
Files created, modified, or analyzed (with paths if relevant)
Key outputs or artifacts produced
3. Important Discoveries
Technical constraints or requirements uncovered
Decisions made and their rationale
Errors encountered and how they were resolved
What approaches were tried that didn't work (and why)
4. Next Steps
Specific actions needed to complete the task
Any blockers or open questions to resolve
Priority order if multiple steps remain
5. Context to Preserve
User preferences or style requirements
Domain-specific details that aren't obvious
Any promises made to the user
Be concise but complete—err on the side of including information that would prevent duplicate work or repeated mistakes. Write in a way that enables immediate resumption of the task.
Wrap your summary in <summary></summary> tags.`;
var X9, q0, I1, f$, J9, F6, N4, u4, Q9, HN, RY;
function UN() {
	let $, X;
	return {
		promise: new Promise((W, Q) => {
			$ = W, X = Q;
		}),
		resolve: $,
		reject: X
	};
}
var W9 = class {
	constructor($, X, J) {
		X9.add(this), this.client = $, q0.set(this, !1), I1.set(this, !1), f$.set(this, void 0), J9.set(this, void 0), F6.set(this, void 0), N4.set(this, void 0), u4.set(this, void 0), Q9.set(this, 0), C(this, f$, { params: {
			...X,
			messages: structuredClone(X.messages)
		} }, "f");
		let Q = ["BetaToolRunner", ...jY(X.tools, X.messages)].join(", ");
		C(this, J9, {
			...J,
			headers: i([{ "x-stainless-helper": Q }, J?.headers])
		}, "f"), C(this, u4, UN(), "f");
	}
	async *[(q0 = /* @__PURE__ */ new WeakMap(), I1 = /* @__PURE__ */ new WeakMap(), f$ = /* @__PURE__ */ new WeakMap(), J9 = /* @__PURE__ */ new WeakMap(), F6 = /* @__PURE__ */ new WeakMap(), N4 = /* @__PURE__ */ new WeakMap(), u4 = /* @__PURE__ */ new WeakMap(), Q9 = /* @__PURE__ */ new WeakMap(), X9 = /* @__PURE__ */ new WeakSet(), HN = async function() {
		let X = D(this, f$, "f").params.compactionControl;
		if (!X || !X.enabled) return !1;
		let J = 0;
		if (D(this, F6, "f") !== void 0) try {
			let H = await D(this, F6, "f");
			J = H.usage.input_tokens + (H.usage.cache_creation_input_tokens ?? 0) + (H.usage.cache_read_input_tokens ?? 0) + H.usage.output_tokens;
		} catch {
			return !1;
		}
		let W = X.contextTokenThreshold ?? zN;
		if (J < W) return !1;
		let Q = X.model ?? D(this, f$, "f").params.model, Y = X.summaryPrompt ?? GN, z = D(this, f$, "f").params.messages;
		if (z[z.length - 1].role === "assistant") {
			let H = z[z.length - 1];
			if (Array.isArray(H.content)) {
				let U = H.content.filter((K) => K.type !== "tool_use");
				if (U.length === 0) z.pop();
				else H.content = U;
			}
		}
		let G = await this.client.beta.messages.create({
			model: Q,
			messages: [...z, {
				role: "user",
				content: [{
					type: "text",
					text: Y
				}]
			}],
			max_tokens: D(this, f$, "f").params.max_tokens
		}, { headers: { "x-stainless-helper": "compaction" } });
		if (G.content[0]?.type !== "text") throw new f("Expected text response for compaction");
		return D(this, f$, "f").params.messages = [{
			role: "user",
			content: G.content
		}], !0;
	}, Symbol.asyncIterator)]() {
		var $;
		if (D(this, q0, "f")) throw new f("Cannot iterate over a consumed stream");
		C(this, q0, !0, "f"), C(this, I1, !0, "f"), C(this, N4, void 0, "f");
		try {
			while (!0) {
				let X;
				try {
					if (D(this, f$, "f").params.max_iterations && D(this, Q9, "f") >= D(this, f$, "f").params.max_iterations) break;
					C(this, I1, !1, "f"), C(this, N4, void 0, "f"), C(this, Q9, ($ = D(this, Q9, "f"), $++, $), "f"), C(this, F6, void 0, "f");
					let { max_iterations: J, compactionControl: W, ...Q } = D(this, f$, "f").params;
					if (Q.stream) X = this.client.beta.messages.stream({ ...Q }, D(this, J9, "f")), C(this, F6, X.finalMessage(), "f"), D(this, F6, "f").catch(() => {}), yield X;
					else C(this, F6, this.client.beta.messages.create({
						...Q,
						stream: !1
					}, D(this, J9, "f")), "f"), yield D(this, F6, "f");
					if (!await D(this, X9, "m", HN).call(this)) {
						if (!D(this, I1, "f")) {
							let { role: G, content: H } = await D(this, F6, "f");
							D(this, f$, "f").params.messages.push({
								role: G,
								content: H
							});
						}
						let z = await D(this, X9, "m", RY).call(this, D(this, f$, "f").params.messages.at(-1));
						if (z) D(this, f$, "f").params.messages.push(z);
						else if (!D(this, I1, "f")) break;
					}
				} finally {
					if (X) X.abort();
				}
			}
			if (!D(this, F6, "f")) throw new f("ToolRunner concluded without a message from the server");
			D(this, u4, "f").resolve(await D(this, F6, "f"));
		} catch (X) {
			throw C(this, q0, !1, "f"), D(this, u4, "f").promise.catch(() => {}), D(this, u4, "f").reject(X), C(this, u4, UN(), "f"), X;
		}
	}
	setMessagesParams($) {
		if (typeof $ === "function") D(this, f$, "f").params = $(D(this, f$, "f").params);
		else D(this, f$, "f").params = $;
		C(this, I1, !0, "f"), C(this, N4, void 0, "f");
	}
	async generateToolResponse() {
		let $ = await D(this, F6, "f") ?? this.params.messages.at(-1);
		if (!$) return null;
		return D(this, X9, "m", RY).call(this, $);
	}
	done() {
		return D(this, u4, "f").promise;
	}
	async runUntilDone() {
		if (!D(this, q0, "f")) for await (let $ of this);
		return this.done();
	}
	get params() {
		return D(this, f$, "f").params;
	}
	pushMessages(...$) {
		this.setMessagesParams((X) => ({
			...X,
			messages: [...X.messages, ...$]
		}));
	}
	then($, X) {
		return this.runUntilDone().then($, X);
	}
};
RY = async function(X) {
	if (D(this, N4, "f") !== void 0) return D(this, N4, "f");
	return C(this, N4, Zb(D(this, f$, "f").params, X), "f"), D(this, N4, "f");
};
async function Zb($, X = $.messages.at(-1)) {
	if (!X || X.role !== "assistant" || !X.content || typeof X.content === "string") return null;
	let J = X.content.filter((Q) => Q.type === "tool_use");
	if (J.length === 0) return null;
	return {
		role: "user",
		content: await Promise.all(J.map(async (Q) => {
			let Y = $.tools.find((z) => ("name" in z ? z.name : z.mcp_server_name) === Q.name);
			if (!Y || !("run" in Y)) return {
				type: "tool_result",
				tool_use_id: Q.id,
				content: `Error: Tool '${Q.name}' not found`,
				is_error: !0
			};
			try {
				let z = Q.input;
				if ("parse" in Y && Y.parse) z = Y.parse(z);
				let G = await Y.run(z);
				return {
					type: "tool_result",
					tool_use_id: Q.id,
					content: G
				};
			} catch (z) {
				return {
					type: "tool_result",
					tool_use_id: Q.id,
					content: z instanceof B0 ? z.content : `Error: ${z instanceof Error ? z.message : String(z)}`,
					is_error: !0
				};
			}
		}))
	};
}
var D0 = class D0 {
	constructor($, X) {
		this.iterator = $, this.controller = X;
	}
	async *decoder() {
		let $ = new g4();
		for await (let X of this.iterator) for (let J of $.decode(X)) yield JSON.parse(J);
		for (let X of $.flush()) yield JSON.parse(X);
	}
	[Symbol.asyncIterator]() {
		return this.decoder();
	}
	static fromResponse($, X) {
		if (!$.body) {
			if (X.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative") throw new f("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api");
			throw new f("Attempted to iterate over a response with no body");
		}
		return new D0(g8($.body), X);
	}
};
var Y9 = class extends b$ {
	create($, X) {
		let { betas: J, ...W } = $;
		return this._client.post("/v1/messages/batches?beta=true", {
			body: W,
			...X,
			headers: i([{ "anthropic-beta": [...J ?? [], "message-batches-2024-09-24"].toString() }, X?.headers])
		});
	}
	retrieve($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.get(A$`/v1/messages/batches/${$}?beta=true`, {
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "message-batches-2024-09-24"].toString() }, J?.headers])
		});
	}
	list($ = {}, X) {
		let { betas: J, ...W } = $ ?? {};
		return this._client.getAPIList("/v1/messages/batches?beta=true", y6, {
			query: W,
			...X,
			headers: i([{ "anthropic-beta": [...J ?? [], "message-batches-2024-09-24"].toString() }, X?.headers])
		});
	}
	delete($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.delete(A$`/v1/messages/batches/${$}?beta=true`, {
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "message-batches-2024-09-24"].toString() }, J?.headers])
		});
	}
	cancel($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.post(A$`/v1/messages/batches/${$}/cancel?beta=true`, {
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "message-batches-2024-09-24"].toString() }, J?.headers])
		});
	}
	async results($, X = {}, J) {
		let W = await this.retrieve($);
		if (!W.results_url) throw new f(`No batch \`results_url\`; Has it finished processing? ${W.processing_status} - ${W.id}`);
		let { betas: Q } = X ?? {};
		return this._client.get(W.results_url, {
			...J,
			headers: i([{
				"anthropic-beta": [...Q ?? [], "message-batches-2024-09-24"].toString(),
				Accept: "application/binary"
			}, J?.headers]),
			stream: !0,
			__binaryResponse: !0
		})._thenUnwrap((Y, z) => D0.fromResponse(z.response, z.controller));
	}
};
var KN = {
	"claude-1.3": "November 6th, 2024",
	"claude-1.3-100k": "November 6th, 2024",
	"claude-instant-1.1": "November 6th, 2024",
	"claude-instant-1.1-100k": "November 6th, 2024",
	"claude-instant-1.2": "November 6th, 2024",
	"claude-3-sonnet-20240229": "July 21st, 2025",
	"claude-3-opus-20240229": "January 5th, 2026",
	"claude-2.1": "July 21st, 2025",
	"claude-2.0": "July 21st, 2025",
	"claude-3-7-sonnet-latest": "February 19th, 2026",
	"claude-3-7-sonnet-20250219": "February 19th, 2026"
}, Rb = ["claude-opus-4-6"];
var m4 = class extends b$ {
	constructor() {
		super(...arguments);
		this.batches = new Y9(this._client);
	}
	create($, X) {
		let J = VN($), { betas: W, ...Q } = J;
		if (Q.model in KN) console.warn(`The model '${Q.model}' is deprecated and will reach end-of-life on ${KN[Q.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
		if (Q.model in Rb && Q.thinking && Q.thinking.type === "enabled") console.warn(`Using Claude with ${Q.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
		let Y = this._client._options.timeout;
		if (!Q.stream && Y == null) {
			let G = iJ[Q.model] ?? void 0;
			Y = this._client.calculateNonstreamingTimeout(Q.max_tokens, G);
		}
		let z = pJ(Q.tools, Q.messages);
		return this._client.post("/v1/messages?beta=true", {
			body: Q,
			timeout: Y ?? 6e5,
			...X,
			headers: i([
				{ ...W?.toString() != null ? { "anthropic-beta": W?.toString() } : void 0 },
				z,
				X?.headers
			]),
			stream: J.stream ?? !1
		});
	}
	parse($, X) {
		return X = {
			...X,
			headers: i([{ "anthropic-beta": [...$.betas ?? [], "structured-outputs-2025-12-15"].toString() }, X?.headers])
		}, this.create($, X).then((J) => MY(J, $, { logger: this._client.logger ?? console }));
	}
	stream($, X) {
		return $9.createMessage(this, $, X);
	}
	countTokens($, X) {
		let { betas: W, ...Q } = VN($);
		return this._client.post("/v1/messages/count_tokens?beta=true", {
			body: Q,
			...X,
			headers: i([{ "anthropic-beta": [...W ?? [], "token-counting-2024-11-01"].toString() }, X?.headers])
		});
	}
	toolRunner($, X) {
		return new W9(this._client, $, X);
	}
};
function VN($) {
	if (!$.output_format) return $;
	if ($.output_config?.format) throw new f("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
	let { output_format: X, ...J } = $;
	return {
		...J,
		output_config: {
			...$.output_config,
			format: X
		}
	};
}
m4.Batches = Y9;
m4.BetaToolRunner = W9;
m4.ToolError = B0;
var z9 = class extends b$ {
	create($, X = {}, J) {
		let { betas: W, ...Q } = X ?? {};
		return this._client.post(A$`/v1/skills/${$}/versions?beta=true`, N0({
			body: Q,
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "skills-2025-10-02"].toString() }, J?.headers])
		}, this._client));
	}
	retrieve($, X, J) {
		let { skill_id: W, betas: Q } = X;
		return this._client.get(A$`/v1/skills/${W}/versions/${$}?beta=true`, {
			...J,
			headers: i([{ "anthropic-beta": [...Q ?? [], "skills-2025-10-02"].toString() }, J?.headers])
		});
	}
	list($, X = {}, J) {
		let { betas: W, ...Q } = X ?? {};
		return this._client.getAPIList(A$`/v1/skills/${$}/versions?beta=true`, c8, {
			query: Q,
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "skills-2025-10-02"].toString() }, J?.headers])
		});
	}
	delete($, X, J) {
		let { skill_id: W, betas: Q } = X;
		return this._client.delete(A$`/v1/skills/${W}/versions/${$}?beta=true`, {
			...J,
			headers: i([{ "anthropic-beta": [...Q ?? [], "skills-2025-10-02"].toString() }, J?.headers])
		});
	}
};
var F0 = class extends b$ {
	constructor() {
		super(...arguments);
		this.versions = new z9(this._client);
	}
	create($ = {}, X) {
		let { betas: J, ...W } = $ ?? {};
		return this._client.post("/v1/skills?beta=true", N0({
			body: W,
			...X,
			headers: i([{ "anthropic-beta": [...J ?? [], "skills-2025-10-02"].toString() }, X?.headers])
		}, this._client, !1));
	}
	retrieve($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.get(A$`/v1/skills/${$}?beta=true`, {
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "skills-2025-10-02"].toString() }, J?.headers])
		});
	}
	list($ = {}, X) {
		let { betas: J, ...W } = $ ?? {};
		return this._client.getAPIList("/v1/skills?beta=true", c8, {
			query: W,
			...X,
			headers: i([{ "anthropic-beta": [...J ?? [], "skills-2025-10-02"].toString() }, X?.headers])
		});
	}
	delete($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.delete(A$`/v1/skills/${$}?beta=true`, {
			...J,
			headers: i([{ "anthropic-beta": [...W ?? [], "skills-2025-10-02"].toString() }, J?.headers])
		});
	}
};
F0.Versions = z9;
var s6 = class extends b$ {
	constructor() {
		super(...arguments);
		this.models = new n8(this._client), this.messages = new m4(this._client), this.files = new i8(this._client), this.skills = new F0(this._client);
	}
};
s6.Models = n8;
s6.Messages = m4;
s6.Files = i8;
s6.Skills = F0;
var j0 = class extends b$ {
	create($, X) {
		let { betas: J, ...W } = $;
		return this._client.post("/v1/complete", {
			body: W,
			timeout: this._client._options.timeout ?? 6e5,
			...X,
			headers: i([{ ...J?.toString() != null ? { "anthropic-beta": J?.toString() } : void 0 }, X?.headers]),
			stream: $.stream ?? !1
		});
	}
};
function NN($) {
	return $?.output_config?.format;
}
function PY($, X, J) {
	let W = NN(X);
	if (!X || !("parse" in (W ?? {}))) return {
		...$,
		content: $.content.map((Q) => {
			if (Q.type === "text") return Object.defineProperty({ ...Q }, "parsed_output", {
				value: null,
				enumerable: !1
			});
			return Q;
		}),
		parsed_output: null
	};
	return EY($, X, J);
}
function EY($, X, J) {
	let W = null, Q = $.content.map((Y) => {
		if (Y.type === "text") {
			let z = vb(X, Y.text);
			if (W === null) W = z;
			return Object.defineProperty({ ...Y }, "parsed_output", {
				value: z,
				enumerable: !1
			});
		}
		return Y;
	});
	return {
		...$,
		content: Q,
		parsed_output: W
	};
}
function vb($, X) {
	let J = NN($);
	if (J?.type !== "json_schema") return null;
	try {
		if ("parse" in J) return J.parse(X);
		return JSON.parse(X);
	} catch (W) {
		throw new f(`Failed to parse structured output: ${W}`);
	}
}
var b6, l4, L0, G9, X7, H9, U9, J7, K9, O4, V9, Q7, W7, Z1, Y7, z7, N9, SY, ON, vY, CY, kY, _Y, wN, BN = "__json_buf";
function qN($) {
	return $.type === "tool_use" || $.type === "server_tool_use";
}
var O9 = class O9 {
	constructor($, X) {
		b6.add(this), this.messages = [], this.receivedMessages = [], l4.set(this, void 0), L0.set(this, null), this.controller = new AbortController(), G9.set(this, void 0), X7.set(this, () => {}), H9.set(this, () => {}), U9.set(this, void 0), J7.set(this, () => {}), K9.set(this, () => {}), O4.set(this, {}), V9.set(this, !1), Q7.set(this, !1), W7.set(this, !1), Z1.set(this, !1), Y7.set(this, void 0), z7.set(this, void 0), N9.set(this, void 0), vY.set(this, (J) => {
			if (C(this, Q7, !0, "f"), U4(J)) J = new m$();
			if (J instanceof m$) return C(this, W7, !0, "f"), this._emit("abort", J);
			if (J instanceof f) return this._emit("error", J);
			if (J instanceof Error) {
				let W = new f(J.message);
				return W.cause = J, this._emit("error", W);
			}
			return this._emit("error", new f(String(J)));
		}), C(this, G9, new Promise((J, W) => {
			C(this, X7, J, "f"), C(this, H9, W, "f");
		}), "f"), C(this, U9, new Promise((J, W) => {
			C(this, J7, J, "f"), C(this, K9, W, "f");
		}), "f"), D(this, G9, "f").catch(() => {}), D(this, U9, "f").catch(() => {}), C(this, L0, $, "f"), C(this, N9, X?.logger ?? console, "f");
	}
	get response() {
		return D(this, Y7, "f");
	}
	get request_id() {
		return D(this, z7, "f");
	}
	async withResponse() {
		C(this, Z1, !0, "f");
		let $ = await D(this, G9, "f");
		if (!$) throw Error("Could not resolve a `Response` object");
		return {
			data: this,
			response: $,
			request_id: $.headers.get("request-id")
		};
	}
	static fromReadableStream($) {
		let X = new O9(null);
		return X._run(() => X._fromReadableStream($)), X;
	}
	static createMessage($, X, J, { logger: W } = {}) {
		let Q = new O9(X, { logger: W });
		for (let Y of X.messages) Q._addMessageParam(Y);
		return C(Q, L0, {
			...X,
			stream: !0
		}, "f"), Q._run(() => Q._createMessage($, {
			...X,
			stream: !0
		}, {
			...J,
			headers: {
				...J?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		})), Q;
	}
	_run($) {
		$().then(() => {
			this._emitFinal(), this._emit("end");
		}, D(this, vY, "f"));
	}
	_addMessageParam($) {
		this.messages.push($);
	}
	_addMessage($, X = !0) {
		if (this.receivedMessages.push($), X) this._emit("message", $);
	}
	async _createMessage($, X, J) {
		let W = J?.signal, Q;
		if (W) {
			if (W.aborted) this.controller.abort();
			Q = this.controller.abort.bind(this.controller), W.addEventListener("abort", Q);
		}
		try {
			D(this, b6, "m", CY).call(this);
			let { response: Y, data: z } = await $.create({
				...X,
				stream: !0
			}, {
				...J,
				signal: this.controller.signal
			}).withResponse();
			this._connected(Y);
			for await (let G of z) D(this, b6, "m", kY).call(this, G);
			if (z.controller.signal?.aborted) throw new m$();
			D(this, b6, "m", _Y).call(this);
		} finally {
			if (W && Q) W.removeEventListener("abort", Q);
		}
	}
	_connected($) {
		if (this.ended) return;
		C(this, Y7, $, "f"), C(this, z7, $?.headers.get("request-id"), "f"), D(this, X7, "f").call(this, $), this._emit("connect");
	}
	get ended() {
		return D(this, V9, "f");
	}
	get errored() {
		return D(this, Q7, "f");
	}
	get aborted() {
		return D(this, W7, "f");
	}
	abort() {
		this.controller.abort();
	}
	on($, X) {
		return (D(this, O4, "f")[$] || (D(this, O4, "f")[$] = [])).push({ listener: X }), this;
	}
	off($, X) {
		let J = D(this, O4, "f")[$];
		if (!J) return this;
		let W = J.findIndex((Q) => Q.listener === X);
		if (W >= 0) J.splice(W, 1);
		return this;
	}
	once($, X) {
		return (D(this, O4, "f")[$] || (D(this, O4, "f")[$] = [])).push({
			listener: X,
			once: !0
		}), this;
	}
	emitted($) {
		return new Promise((X, J) => {
			if (C(this, Z1, !0, "f"), $ !== "error") this.once("error", J);
			this.once($, X);
		});
	}
	async done() {
		C(this, Z1, !0, "f"), await D(this, U9, "f");
	}
	get currentMessage() {
		return D(this, l4, "f");
	}
	async finalMessage() {
		return await this.done(), D(this, b6, "m", SY).call(this);
	}
	async finalText() {
		return await this.done(), D(this, b6, "m", ON).call(this);
	}
	_emit($, ...X) {
		if (D(this, V9, "f")) return;
		if ($ === "end") C(this, V9, !0, "f"), D(this, J7, "f").call(this);
		let J = D(this, O4, "f")[$];
		if (J) D(this, O4, "f")[$] = J.filter((W) => !W.once), J.forEach(({ listener: W }) => W(...X));
		if ($ === "abort") {
			let W = X[0];
			if (!D(this, Z1, "f") && !J?.length) Promise.reject(W);
			D(this, H9, "f").call(this, W), D(this, K9, "f").call(this, W), this._emit("end");
			return;
		}
		if ($ === "error") {
			let W = X[0];
			if (!D(this, Z1, "f") && !J?.length) Promise.reject(W);
			D(this, H9, "f").call(this, W), D(this, K9, "f").call(this, W), this._emit("end");
		}
	}
	_emitFinal() {
		if (this.receivedMessages.at(-1)) this._emit("finalMessage", D(this, b6, "m", SY).call(this));
	}
	async _fromReadableStream($, X) {
		let J = X?.signal, W;
		if (J) {
			if (J.aborted) this.controller.abort();
			W = this.controller.abort.bind(this.controller), J.addEventListener("abort", W);
		}
		try {
			D(this, b6, "m", CY).call(this), this._connected(null);
			let Q = D6.fromReadableStream($, this.controller);
			for await (let Y of Q) D(this, b6, "m", kY).call(this, Y);
			if (Q.controller.signal?.aborted) throw new m$();
			D(this, b6, "m", _Y).call(this);
		} finally {
			if (J && W) J.removeEventListener("abort", W);
		}
	}
	[(l4 = /* @__PURE__ */ new WeakMap(), L0 = /* @__PURE__ */ new WeakMap(), G9 = /* @__PURE__ */ new WeakMap(), X7 = /* @__PURE__ */ new WeakMap(), H9 = /* @__PURE__ */ new WeakMap(), U9 = /* @__PURE__ */ new WeakMap(), J7 = /* @__PURE__ */ new WeakMap(), K9 = /* @__PURE__ */ new WeakMap(), O4 = /* @__PURE__ */ new WeakMap(), V9 = /* @__PURE__ */ new WeakMap(), Q7 = /* @__PURE__ */ new WeakMap(), W7 = /* @__PURE__ */ new WeakMap(), Z1 = /* @__PURE__ */ new WeakMap(), Y7 = /* @__PURE__ */ new WeakMap(), z7 = /* @__PURE__ */ new WeakMap(), N9 = /* @__PURE__ */ new WeakMap(), vY = /* @__PURE__ */ new WeakMap(), b6 = /* @__PURE__ */ new WeakSet(), SY = function() {
		if (this.receivedMessages.length === 0) throw new f("stream ended without producing a Message with role=assistant");
		return this.receivedMessages.at(-1);
	}, ON = function() {
		if (this.receivedMessages.length === 0) throw new f("stream ended without producing a Message with role=assistant");
		let X = this.receivedMessages.at(-1).content.filter((J) => J.type === "text").map((J) => J.text);
		if (X.length === 0) throw new f("stream ended without producing a content block with type=text");
		return X.join(" ");
	}, CY = function() {
		if (this.ended) return;
		C(this, l4, void 0, "f");
	}, kY = function(X) {
		if (this.ended) return;
		let J = D(this, b6, "m", wN).call(this, X);
		switch (this._emit("streamEvent", X, J), X.type) {
			case "content_block_delta": {
				let W = J.content.at(-1);
				switch (X.delta.type) {
					case "text_delta":
						if (W.type === "text") this._emit("text", X.delta.text, W.text || "");
						break;
					case "citations_delta":
						if (W.type === "text") this._emit("citation", X.delta.citation, W.citations ?? []);
						break;
					case "input_json_delta":
						if (qN(W) && W.input) this._emit("inputJson", X.delta.partial_json, W.input);
						break;
					case "thinking_delta":
						if (W.type === "thinking") this._emit("thinking", X.delta.thinking, W.thinking);
						break;
					case "signature_delta":
						if (W.type === "thinking") this._emit("signature", W.signature);
						break;
					default: DN(X.delta);
				}
				break;
			}
			case "message_stop":
				this._addMessageParam(J), this._addMessage(PY(J, D(this, L0, "f"), { logger: D(this, N9, "f") }), !0);
				break;
			case "content_block_stop":
				this._emit("contentBlock", J.content.at(-1));
				break;
			case "message_start":
				C(this, l4, J, "f");
				break;
			case "content_block_start":
			case "message_delta": break;
		}
	}, _Y = function() {
		if (this.ended) throw new f("stream has ended, this shouldn't happen");
		let X = D(this, l4, "f");
		if (!X) throw new f("request ended without sending any chunks");
		return C(this, l4, void 0, "f"), PY(X, D(this, L0, "f"), { logger: D(this, N9, "f") });
	}, wN = function(X) {
		let J = D(this, l4, "f");
		if (X.type === "message_start") {
			if (J) throw new f(`Unexpected event order, got ${X.type} before receiving "message_stop"`);
			return X.message;
		}
		if (!J) throw new f(`Unexpected event order, got ${X.type} before "message_start"`);
		switch (X.type) {
			case "message_stop": return J;
			case "message_delta":
				if (J.stop_reason = X.delta.stop_reason, J.stop_sequence = X.delta.stop_sequence, J.usage.output_tokens = X.usage.output_tokens, X.usage.input_tokens != null) J.usage.input_tokens = X.usage.input_tokens;
				if (X.usage.cache_creation_input_tokens != null) J.usage.cache_creation_input_tokens = X.usage.cache_creation_input_tokens;
				if (X.usage.cache_read_input_tokens != null) J.usage.cache_read_input_tokens = X.usage.cache_read_input_tokens;
				if (X.usage.server_tool_use != null) J.usage.server_tool_use = X.usage.server_tool_use;
				return J;
			case "content_block_start": return J.content.push({ ...X.content_block }), J;
			case "content_block_delta": {
				let W = J.content.at(X.index);
				switch (X.delta.type) {
					case "text_delta":
						if (W?.type === "text") J.content[X.index] = {
							...W,
							text: (W.text || "") + X.delta.text
						};
						break;
					case "citations_delta":
						if (W?.type === "text") J.content[X.index] = {
							...W,
							citations: [...W.citations ?? [], X.delta.citation]
						};
						break;
					case "input_json_delta":
						if (W && qN(W)) {
							let Q = W[BN] || "";
							Q += X.delta.partial_json;
							let Y = { ...W };
							if (Object.defineProperty(Y, BN, {
								value: Q,
								enumerable: !1,
								writable: !0
							}), Q) Y.input = nJ(Q);
							J.content[X.index] = Y;
						}
						break;
					case "thinking_delta":
						if (W?.type === "thinking") J.content[X.index] = {
							...W,
							thinking: W.thinking + X.delta.thinking
						};
						break;
					case "signature_delta":
						if (W?.type === "thinking") J.content[X.index] = {
							...W,
							signature: X.delta.signature
						};
						break;
					default: DN(X.delta);
				}
				return J;
			}
			case "content_block_stop": return J;
		}
	}, Symbol.asyncIterator)]() {
		let $ = [], X = [], J = !1;
		return this.on("streamEvent", (W) => {
			let Q = X.shift();
			if (Q) Q.resolve(W);
			else $.push(W);
		}), this.on("end", () => {
			J = !0;
			for (let W of X) W.resolve(void 0);
			X.length = 0;
		}), this.on("abort", (W) => {
			J = !0;
			for (let Q of X) Q.reject(W);
			X.length = 0;
		}), this.on("error", (W) => {
			J = !0;
			for (let Q of X) Q.reject(W);
			X.length = 0;
		}), {
			next: async () => {
				if (!$.length) {
					if (J) return {
						value: void 0,
						done: !0
					};
					return new Promise((Q, Y) => X.push({
						resolve: Q,
						reject: Y
					})).then((Q) => Q ? {
						value: Q,
						done: !1
					} : {
						value: void 0,
						done: !0
					});
				}
				return {
					value: $.shift(),
					done: !1
				};
			},
			return: async () => {
				return this.abort(), {
					value: void 0,
					done: !0
				};
			}
		};
	}
	toReadableStream() {
		return new D6(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
	}
};
function DN($) {}
var w9 = class extends b$ {
	create($, X) {
		return this._client.post("/v1/messages/batches", {
			body: $,
			...X
		});
	}
	retrieve($, X) {
		return this._client.get(A$`/v1/messages/batches/${$}`, X);
	}
	list($ = {}, X) {
		return this._client.getAPIList("/v1/messages/batches", y6, {
			query: $,
			...X
		});
	}
	delete($, X) {
		return this._client.delete(A$`/v1/messages/batches/${$}`, X);
	}
	cancel($, X) {
		return this._client.post(A$`/v1/messages/batches/${$}/cancel`, X);
	}
	async results($, X) {
		let J = await this.retrieve($);
		if (!J.results_url) throw new f(`No batch \`results_url\`; Has it finished processing? ${J.processing_status} - ${J.id}`);
		return this._client.get(J.results_url, {
			...X,
			headers: i([{ Accept: "application/binary" }, X?.headers]),
			stream: !0,
			__binaryResponse: !0
		})._thenUnwrap((W, Q) => D0.fromResponse(Q.response, Q.controller));
	}
};
var b1 = class extends b$ {
	constructor() {
		super(...arguments);
		this.batches = new w9(this._client);
	}
	create($, X) {
		if ($.model in FN) console.warn(`The model '${$.model}' is deprecated and will reach end-of-life on ${FN[$.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
		if ($.model in kb && $.thinking && $.thinking.type === "enabled") console.warn(`Using Claude with ${$.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
		let J = this._client._options.timeout;
		if (!$.stream && J == null) {
			let Q = iJ[$.model] ?? void 0;
			J = this._client.calculateNonstreamingTimeout($.max_tokens, Q);
		}
		let W = pJ($.tools, $.messages);
		return this._client.post("/v1/messages", {
			body: $,
			timeout: J ?? 6e5,
			...X,
			headers: i([W, X?.headers]),
			stream: $.stream ?? !1
		});
	}
	parse($, X) {
		return this.create($, X).then((J) => EY(J, $, { logger: this._client.logger ?? console }));
	}
	stream($, X) {
		return O9.createMessage(this, $, X, { logger: this._client.logger ?? console });
	}
	countTokens($, X) {
		return this._client.post("/v1/messages/count_tokens", {
			body: $,
			...X
		});
	}
};
var FN = {
	"claude-1.3": "November 6th, 2024",
	"claude-1.3-100k": "November 6th, 2024",
	"claude-instant-1.1": "November 6th, 2024",
	"claude-instant-1.1-100k": "November 6th, 2024",
	"claude-instant-1.2": "November 6th, 2024",
	"claude-3-sonnet-20240229": "July 21st, 2025",
	"claude-3-opus-20240229": "January 5th, 2026",
	"claude-2.1": "July 21st, 2025",
	"claude-2.0": "July 21st, 2025",
	"claude-3-7-sonnet-latest": "February 19th, 2026",
	"claude-3-7-sonnet-20250219": "February 19th, 2026",
	"claude-3-5-haiku-latest": "February 19th, 2026",
	"claude-3-5-haiku-20241022": "February 19th, 2026"
}, kb = ["claude-opus-4-6"];
b1.Batches = w9;
var M0 = class extends b$ {
	retrieve($, X = {}, J) {
		let { betas: W } = X ?? {};
		return this._client.get(A$`/v1/models/${$}`, {
			...J,
			headers: i([{ ...W?.toString() != null ? { "anthropic-beta": W?.toString() } : void 0 }, J?.headers])
		});
	}
	list($ = {}, X) {
		let { betas: J, ...W } = $ ?? {};
		return this._client.getAPIList("/v1/models", y6, {
			query: W,
			...X,
			headers: i([{ ...J?.toString() != null ? { "anthropic-beta": J?.toString() } : void 0 }, X?.headers])
		});
	}
};
var B9 = ($) => {
	if (typeof globalThis.process < "u") return globalThis.process.env?.[$]?.trim() ?? void 0;
	if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.($)?.trim();
};
var xY, TY, G7, jN, LN = "\\n\\nHuman:", MN = "\\n\\nAssistant:";
var P$ = class {
	constructor({ baseURL: $ = B9("ANTHROPIC_BASE_URL"), apiKey: X = B9("ANTHROPIC_API_KEY") ?? null, authToken: J = B9("ANTHROPIC_AUTH_TOKEN") ?? null, ...W } = {}) {
		xY.add(this), G7.set(this, void 0);
		let Q = {
			apiKey: X,
			authToken: J,
			...W,
			baseURL: $ || "https://api.anthropic.com"
		};
		if (!Q.dangerouslyAllowBrowser && fV()) throw new f(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
		this.baseURL = Q.baseURL, this.timeout = Q.timeout ?? TY.DEFAULT_TIMEOUT, this.logger = Q.logger ?? console;
		let Y = "warn";
		this.logLevel = Y, this.logLevel = NY(Q.logLevel, "ClientOptions.logLevel", this) ?? NY(B9("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? Y, this.fetchOptions = Q.fetchOptions, this.maxRetries = Q.maxRetries ?? 2, this.fetch = Q.fetch ?? gV(), C(this, G7, uV, "f"), this._options = Q, this.apiKey = typeof X === "string" ? X : null, this.authToken = J;
	}
	withOptions($) {
		return new this.constructor({
			...this._options,
			baseURL: this.baseURL,
			maxRetries: this.maxRetries,
			timeout: this.timeout,
			logger: this.logger,
			logLevel: this.logLevel,
			fetch: this.fetch,
			fetchOptions: this.fetchOptions,
			apiKey: this.apiKey,
			authToken: this.authToken,
			...$
		});
	}
	defaultQuery() {
		return this._options.defaultQuery;
	}
	validateHeaders({ values: $, nulls: X }) {
		if ($.get("x-api-key") || $.get("authorization")) return;
		if (this.apiKey && $.get("x-api-key")) return;
		if (X.has("x-api-key")) return;
		if (this.authToken && $.get("authorization")) return;
		if (X.has("authorization")) return;
		throw Error("Could not resolve authentication method. Expected either apiKey or authToken to be set. Or for one of the \"X-Api-Key\" or \"Authorization\" headers to be explicitly omitted");
	}
	async authHeaders($) {
		return i([await this.apiKeyAuth($), await this.bearerAuth($)]);
	}
	async apiKeyAuth($) {
		if (this.apiKey == null) return;
		return i([{ "X-Api-Key": this.apiKey }]);
	}
	async bearerAuth($) {
		if (this.authToken == null) return;
		return i([{ Authorization: `Bearer ${this.authToken}` }]);
	}
	stringifyQuery($) {
		return mV($);
	}
	getUserAgent() {
		return `${this.constructor.name}/JS ${y4}`;
	}
	defaultIdempotencyKey() {
		return `stainless-node-retry-${zY()}`;
	}
	makeStatusError($, X, J, W) {
		return T$.generate($, X, J, W);
	}
	buildURL($, X, J) {
		let W = !D(this, xY, "m", jN).call(this) && J || this.baseURL, Q = SV($) ? new URL($) : new URL(W + (W.endsWith("/") && $.startsWith("/") ? $.slice(1) : $)), Y = this.defaultQuery(), z = Object.fromEntries(Q.searchParams);
		if (!UY(Y) || !UY(z)) X = {
			...z,
			...Y,
			...X
		};
		if (typeof X === "object" && X && !Array.isArray(X)) Q.search = this.stringifyQuery(X);
		return Q.toString();
	}
	_calculateNonstreamingTimeout($) {
		if (3600 * $ / 128e3 > 600) throw new f("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
		return 6e5;
	}
	async prepareOptions($) {}
	async prepareRequest($, { url: X, options: J }) {}
	get($, X) {
		return this.methodRequest("get", $, X);
	}
	post($, X) {
		return this.methodRequest("post", $, X);
	}
	patch($, X) {
		return this.methodRequest("patch", $, X);
	}
	put($, X) {
		return this.methodRequest("put", $, X);
	}
	delete($, X) {
		return this.methodRequest("delete", $, X);
	}
	methodRequest($, X, J) {
		return this.request(Promise.resolve(J).then((W) => {
			return {
				method: $,
				path: X,
				...W
			};
		}));
	}
	request($, X = null) {
		return new L1(this, this.makeRequest($, X, void 0));
	}
	async makeRequest($, X, J) {
		let W = await $, Q = W.maxRetries ?? this.maxRetries;
		if (X == null) X = Q;
		await this.prepareOptions(W);
		let { req: Y, url: z, timeout: G } = await this.buildRequest(W, { retryCount: Q - X });
		await this.prepareRequest(Y, {
			url: z,
			options: W
		});
		let H = "log_" + (Math.random() * 16777216 | 0).toString(16).padStart(6, "0"), U = J === void 0 ? "" : `, retryOf: ${J}`, K = Date.now();
		if (h$(this).debug(`[${H}] sending request`, K4({
			retryOfRequestLogID: J,
			method: W.method,
			url: z,
			options: W,
			headers: Y.headers
		})), W.signal?.aborted) throw new m$();
		let V = new AbortController(), N = await this.fetchWithTimeout(z, Y, G, V).catch(E8), O = Date.now();
		if (N instanceof globalThis.Error) {
			let F = `retrying, ${X} attempts remaining`;
			if (W.signal?.aborted) throw new m$();
			let j = U4(N) || /timed? ?out/i.test(String(N) + ("cause" in N ? String(N.cause) : ""));
			if (X) return h$(this).info(`[${H}] connection ${j ? "timed out" : "failed"} - ${F}`), h$(this).debug(`[${H}] connection ${j ? "timed out" : "failed"} (${F})`, K4({
				retryOfRequestLogID: J,
				url: z,
				durationMs: O - K,
				message: N.message
			})), this.retryRequest(W, X, J ?? H);
			if (h$(this).info(`[${H}] connection ${j ? "timed out" : "failed"} - error; no more retries left`), h$(this).debug(`[${H}] connection ${j ? "timed out" : "failed"} (error; no more retries left)`, K4({
				retryOfRequestLogID: J,
				url: z,
				durationMs: O - K,
				message: N.message
			})), j) throw new S8();
			throw new j1({ cause: N });
		}
		let B = `[${H}${U}${[...N.headers.entries()].filter(([F]) => F === "request-id").map(([F, j]) => ", " + F + ": " + JSON.stringify(j)).join("")}] ${Y.method} ${z} ${N.ok ? "succeeded" : "failed"} with status ${N.status} in ${O - K}ms`;
		if (!N.ok) {
			let F = await this.shouldRetry(N);
			if (X && F) {
				let O$ = `retrying, ${X} attempts remaining`;
				return await hV(N.body), h$(this).info(`${B} - ${O$}`), h$(this).debug(`[${H}] response error (${O$})`, K4({
					retryOfRequestLogID: J,
					url: N.url,
					status: N.status,
					headers: N.headers,
					durationMs: O - K
				})), this.retryRequest(W, X, J ?? H, N.headers);
			}
			let j = F ? "error; no more retries left" : "error; not retryable";
			h$(this).info(`${B} - ${j}`);
			let I = await N.text().catch((O$) => E8(O$).message), Z = fJ(I), _ = Z ? void 0 : I;
			throw h$(this).debug(`[${H}] response error (${j})`, K4({
				retryOfRequestLogID: J,
				url: N.url,
				status: N.status,
				headers: N.headers,
				message: _,
				durationMs: Date.now() - K
			})), this.makeStatusError(N.status, Z, _, N.headers);
		}
		return h$(this).info(B), h$(this).debug(`[${H}] response start`, K4({
			retryOfRequestLogID: J,
			url: N.url,
			status: N.status,
			headers: N.headers,
			durationMs: O - K
		})), {
			response: N,
			options: W,
			controller: V,
			requestLogID: H,
			retryOfRequestLogID: J,
			startTime: K
		};
	}
	getAPIList($, X, J) {
		return this.requestAPIList(X, J && "then" in J ? J.then((W) => ({
			method: "get",
			path: $,
			...W
		})) : {
			method: "get",
			path: $,
			...J
		});
	}
	requestAPIList($, X) {
		let J = this.makeRequest(X, null, void 0);
		return new lJ(this, J, $);
	}
	async fetchWithTimeout($, X, J, W) {
		let { signal: Q, method: Y, ...z } = X || {}, G = this._makeAbort(W);
		if (Q) Q.addEventListener("abort", G, { once: !0 });
		let H = setTimeout(G, J), U = globalThis.ReadableStream && z.body instanceof globalThis.ReadableStream || typeof z.body === "object" && z.body !== null && Symbol.asyncIterator in z.body, K = {
			signal: W.signal,
			...U ? { duplex: "half" } : {},
			method: "GET",
			...z
		};
		if (Y) K.method = Y.toUpperCase();
		try {
			return await this.fetch.call(void 0, $, K);
		} finally {
			clearTimeout(H);
		}
	}
	async shouldRetry($) {
		let X = $.headers.get("x-should-retry");
		if (X === "true") return !0;
		if (X === "false") return !1;
		if ($.status === 408) return !0;
		if ($.status === 409) return !0;
		if ($.status === 429) return !0;
		if ($.status >= 500) return !0;
		return !1;
	}
	async retryRequest($, X, J, W) {
		let Q, Y = W?.get("retry-after-ms");
		if (Y) {
			let G = parseFloat(Y);
			if (!Number.isNaN(G)) Q = G;
		}
		let z = W?.get("retry-after");
		if (z && !Q) {
			let G = parseFloat(z);
			if (!Number.isNaN(G)) Q = G * 1e3;
			else Q = Date.parse(z) - Date.now();
		}
		if (Q === void 0) {
			let G = $.maxRetries ?? this.maxRetries;
			Q = this.calculateDefaultRetryTimeoutMillis(X, G);
		}
		return await kV(Q), this.makeRequest($, X - 1, J);
	}
	calculateDefaultRetryTimeoutMillis($, X) {
		let Q = X - $;
		return Math.min(.5 * Math.pow(2, Q), 8) * (1 - Math.random() * .25) * 1e3;
	}
	calculateNonstreamingTimeout($, X) {
		if (36e5 * $ / 128e3 > 6e5 || X != null && $ > X) throw new f("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
		return 6e5;
	}
	async buildRequest($, { retryCount: X = 0 } = {}) {
		let J = { ...$ }, { method: W, path: Q, query: Y, defaultBaseURL: z } = J, G = this.buildURL(Q, Y, z);
		if ("timeout" in J) CV("timeout", J.timeout);
		J.timeout = J.timeout ?? this.timeout;
		let { bodyHeaders: H, body: U } = this.buildBody({ options: J });
		return {
			req: {
				method: W,
				headers: await this.buildHeaders({
					options: $,
					method: W,
					bodyHeaders: H,
					retryCount: X
				}),
				...J.signal && { signal: J.signal },
				...globalThis.ReadableStream && U instanceof globalThis.ReadableStream && { duplex: "half" },
				...U && { body: U },
				...this.fetchOptions ?? {},
				...J.fetchOptions ?? {}
			},
			url: G,
			timeout: J.timeout
		};
	}
	async buildHeaders({ options: $, method: X, bodyHeaders: J, retryCount: W }) {
		let Q = {};
		if (this.idempotencyHeader && X !== "get") {
			if (!$.idempotencyKey) $.idempotencyKey = this.defaultIdempotencyKey();
			Q[this.idempotencyHeader] = $.idempotencyKey;
		}
		let Y = i([
			Q,
			{
				Accept: "application/json",
				"User-Agent": this.getUserAgent(),
				"X-Stainless-Retry-Count": String(W),
				...$.timeout ? { "X-Stainless-Timeout": String(Math.trunc($.timeout / 1e3)) } : {},
				...yV(),
				...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
				"anthropic-version": "2023-06-01"
			},
			await this.authHeaders($),
			this._options.defaultHeaders,
			J,
			$.headers
		]);
		return this.validateHeaders(Y), Y.values;
	}
	_makeAbort($) {
		return () => $.abort();
	}
	buildBody({ options: { body: $, headers: X } }) {
		if (!$) return {
			bodyHeaders: void 0,
			body: void 0
		};
		let J = i([X]);
		if (ArrayBuffer.isView($) || $ instanceof ArrayBuffer || $ instanceof DataView || typeof $ === "string" && J.values.has("content-type") || globalThis.Blob && $ instanceof globalThis.Blob || $ instanceof FormData || $ instanceof URLSearchParams || globalThis.ReadableStream && $ instanceof globalThis.ReadableStream) return {
			bodyHeaders: void 0,
			body: $
		};
		else if (typeof $ === "object" && (Symbol.asyncIterator in $ || Symbol.iterator in $ && "next" in $ && typeof $.next === "function")) return {
			bodyHeaders: void 0,
			body: yJ($)
		};
		else if (typeof $ === "object" && J.values.get("content-type") === "application/x-www-form-urlencoded") return {
			bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
			body: this.stringifyQuery($)
		};
		else return D(this, G7, "f").call(this, {
			body: $,
			headers: J
		});
	}
};
TY = P$, G7 = /* @__PURE__ */ new WeakMap(), xY = /* @__PURE__ */ new WeakSet(), jN = function() {
	return this.baseURL !== "https://api.anthropic.com";
};
P$.Anthropic = TY;
P$.HUMAN_PROMPT = LN;
P$.AI_PROMPT = MN;
P$.DEFAULT_TIMEOUT = 6e5;
P$.AnthropicError = f;
P$.APIError = T$;
P$.APIConnectionError = j1;
P$.APIConnectionTimeoutError = S8;
P$.APIUserAbortError = m$;
P$.NotFoundError = _8;
P$.ConflictError = x8;
P$.RateLimitError = f8;
P$.BadRequestError = v8;
P$.AuthenticationError = C8;
P$.InternalServerError = y8;
P$.PermissionDeniedError = k8;
P$.UnprocessableEntityError = T8;
P$.toFile = cJ;
var R1 = class extends P$ {
	constructor() {
		super(...arguments);
		this.completions = new j0(this), this.messages = new b1(this), this.models = new M0(this), this.beta = new s6(this);
	}
};
R1.Completions = j0;
R1.Messages = b1;
R1.Models = M0;
R1.Beta = s6;
function c4($) {
	return $ instanceof Error ? $ : Error(String($));
}
function A0($) {
	return $ instanceof Error ? $.message : String($);
}
function g6($) {
	if ($ && typeof $ === "object" && "code" in $ && typeof $.code === "string") return $.code;
}
function d4($) {
	return g6($) === "ENOENT";
}
function fY($) {
	return g6($) === "EISDIR";
}
var P1, I0 = null;
function IN() {
	if (I0) return I0;
	if (!J6(process.env.DEBUG_CLAUDE_AGENT_SDK)) return P1 = null, I0 = Promise.resolve(), I0;
	let $ = join(f4(), "debug");
	return P1 = join($, `sdk-${randomUUID()}.txt`), process.stderr.write(`SDK debug logs: ${P1}
`), I0 = mkdir($, { recursive: !0 }).then(() => {}).catch(() => {}), I0;
}
function ZN() {
	return IN(), P1 ?? null;
}
function Q6($) {
	if (P1 === null) return;
	let J = `${(/* @__PURE__ */ new Date()).toISOString()} ${$}
`;
	IN().then(() => {
		if (P1) appendFile(P1, J).catch(() => {});
	});
}
function bN() {
	return {
		sent: /* @__PURE__ */ new Set(),
		rejected: /* @__PURE__ */ new Set()
	};
}
var gb = {
	renderTarget: "ink",
	workspace: "local",
	canDrive: !0,
	transcriptSource: "local-jsonl",
	remote: null
};
function hb() {
	let $ = "";
	if (typeof process < "u" && typeof process.cwd === "function" && typeof realpathSync === "function") {
		let J = cwd();
		try {
			$ = realpathSync(J).normalize("NFC");
		} catch {
			$ = J.normalize("NFC");
		}
	}
	return {
		originalCwd: $,
		projectRoot: $,
		totalCostUSD: 0,
		totalAPIDuration: 0,
		totalAPIDurationWithoutRetries: 0,
		totalToolDuration: 0,
		startTime: Date.now(),
		lastInteractionTime: Date.now(),
		totalLinesAdded: 0,
		totalLinesRemoved: 0,
		hasUnknownModelCost: !1,
		cwd: $,
		modelUsage: {},
		mainLoopModelOverride: void 0,
		initialMainLoopModel: null,
		modelStrings: null,
		isInteractive: !1,
		attacherCaps: null,
		hasStreamingInput: !1,
		fridayFundayDisabledForSession: !1,
		kairosActive: !1,
		strictToolResultPairing: !1,
		memoryToggledOff: !1,
		teamMemoryServerStatus: void 0,
		sdkAgentProgressSummariesEnabled: !1,
		userMsgOptIn: !1,
		clientType: "cli",
		sessionSource: void 0,
		sessionStartType: "fresh",
		questionPreviewFormat: void 0,
		sessionIngressToken: void 0,
		oauthTokenFromFd: void 0,
		apiKeyFromFd: void 0,
		flagSettingsPath: void 0,
		flagSettingsInline: null,
		parentManagedSettings: null,
		allowedSettingSources: [
			"userSettings",
			"projectSettings",
			"localSettings",
			"flagSettings",
			"policySettings"
		],
		meter: null,
		sessionCounter: null,
		locCounter: null,
		prCounter: null,
		commitCounter: null,
		costCounter: null,
		tokenCounter: null,
		codeEditToolDecisionCounter: null,
		activeTimeCounter: null,
		statsStore: null,
		sessionId: randomUUID(),
		parentSessionId: void 0,
		loggerProvider: null,
		eventLogger: null,
		meterProvider: null,
		tracerProvider: null,
		agentColorMap: /* @__PURE__ */ new Map(),
		agentColorIndex: 0,
		lastAPIRequest: null,
		lastAPIRequestMessages: null,
		lastClassifierRequests: null,
		cachedClaudeMdContent: null,
		inMemoryErrorLog: [],
		inlinePlugins: [],
		chromeFlagOverride: void 0,
		useCoworkPlugins: !1,
		sessionBypassPermissionsMode: !1,
		scheduledTasksEnabled: !1,
		sessionPrResolved: !1,
		sessionCronTasks: [],
		loopChainStartedAt: Object.create(null),
		sessionCreatedTeams: /* @__PURE__ */ new Set(),
		sessionTrustAccepted: !1,
		sessionPersistenceDisabled: !1,
		hasExitedPlanMode: !1,
		needsPlanModeExitAttachment: !1,
		needsAutoModeExitAttachment: !1,
		lspRecommendationShownThisSession: !1,
		initJsonSchema: null,
		registeredHooks: null,
		planSlugCache: /* @__PURE__ */ new Map(),
		teleportedSessionInfo: null,
		invokedSkills: /* @__PURE__ */ new Map(),
		slowOperations: [],
		sdkBetas: void 0,
		sdkOAuthTokenRefreshCallback: null,
		mainThreadAgentType: void 0,
		mainThreadAgentHooks: void 0,
		sessionSkillAllowlist: void 0,
		caps: gb,
		replBridgeActive: !1,
		directConnectServerUrl: void 0,
		activeRoutine: void 0,
		systemPromptSectionCache: /* @__PURE__ */ new Map(),
		lastEmittedDate: null,
		additionalDirectoriesForClaudeMd: [],
		allowedChannels: [],
		activeInputs: /* @__PURE__ */ new Map(),
		hasDevChannels: !1,
		sessionProjectDir: null,
		promptCache1hAllowlist: null,
		stickyBetas: bN(),
		thinkingTypeOverrides: /* @__PURE__ */ new Map(),
		inferenceProfileBackingModels: /* @__PURE__ */ new Map(),
		promptId: null,
		promptIndex: 0,
		lastMainRequestId: void 0,
		lastApiCompletionTimestamp: null,
		pendingPostCompaction: !1
	};
}
var ub = hb();
function yY() {
	return ub.sessionId;
}
F1().subscribe;
F1().subscribe;
F1().subscribe;
F1().subscribe;
function PN({ writeFn: $, flushIntervalMs: X = 1e3, maxBufferSize: J = 100, maxBufferBytes: W = Infinity, immediateMode: Q = !1 }) {
	let Y = [], z = 0, G = null, H = null;
	function U() {
		if (G) clearTimeout(G), G = null;
	}
	function K() {
		if (H) $(H.join("")), H = null;
		if (Y.length === 0) return;
		$(Y.join("")), Y = [], z = 0, U();
	}
	function V() {
		if (!G) G = setTimeout(K, X);
	}
	function N() {
		if (H) {
			H.push(...Y), Y = [], z = 0, U();
			return;
		}
		let O = Y;
		Y = [], z = 0, U(), H = O, setImmediate(() => {
			let w = H;
			if (H = null, w) $(w.join(""));
		});
	}
	return {
		write(O) {
			if (Q) {
				$(O);
				return;
			}
			if (Y.push(O), z += O.length, V(), Y.length >= J || z >= W) N();
		},
		flush: K,
		dispose() {
			K();
		}
	};
}
var EN = /* @__PURE__ */ new Set();
function pb($) {
	if (typeof $ === "function") return $;
	if (Symbol.asyncDispose in $) return () => $[Symbol.asyncDispose]();
	return () => $[Symbol.dispose]();
}
function SN($) {
	let X = pb($);
	EN.add(X);
	let J = () => {
		EN.delete(X);
	};
	return Object.assign(J, { [Symbol.dispose]: J });
}
var vN = f6(($) => {
	if (!$ || $.trim() === "") return null;
	let X = $.split(",").map((Y) => Y.trim()).filter(Boolean);
	if (X.length === 0) return null;
	let J = X.some((Y) => Y.startsWith("!")), W = X.some((Y) => !Y.startsWith("!"));
	if (J && W) return null;
	let Q = X.map((Y) => Y.replace(/^!/, "").toLowerCase());
	return {
		include: J ? [] : Q,
		exclude: J ? Q : [],
		isExclusive: J
	};
});
function ib($) {
	let X = [], J = $.match(/^MCP server ["']([^"']+)["']/);
	if (J && J[1]) X.push("mcp"), X.push(J[1].toLowerCase());
	else {
		let Y = $.match(/^([^:[]+):/);
		if (Y && Y[1]) X.push(Y[1].trim().toLowerCase());
	}
	let W = $.match(/^\[([^\]]+)]/);
	if (W && W[1]) X.push(W[1].trim().toLowerCase());
	if ($.toLowerCase().includes("1p event:")) X.push("1p");
	let Q = $.match(/:\s*([^:]+?)(?:\s+(?:type|mode|status|event))?:/);
	if (Q && Q[1]) {
		let Y = Q[1].trim().toLowerCase();
		if (Y.length < 30 && !Y.includes(" ")) X.push(Y);
	}
	return Array.from(new Set(X));
}
function nb($, X) {
	if (!X) return !0;
	if ($.length === 0) return !1;
	if (X.isExclusive) return !$.some((J) => X.exclude.includes(J));
	else return $.some((J) => X.include.includes(J));
}
function CN($, X) {
	if (!X) return !0;
	return nb(ib($), X);
}
var QR = {
	cwd() {
		return process.cwd();
	},
	existsSync($) {
		let J = [];
		try {
			q$(J, R$`fs.existsSync(${$})`, 0);
			return r.existsSync($);
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	async stat($) {
		return stat($);
	},
	async readdir($) {
		return readdir($, { withFileTypes: !0 });
	},
	async unlink($) {
		return unlink($);
	},
	async rmdir($) {
		return rmdir($);
	},
	async rm($, X) {
		return rm($, X);
	},
	async mkdir($, X) {
		try {
			await mkdir($, {
				recursive: !0,
				...X
			});
		} catch (J) {
			if (g6(J) !== "EEXIST") throw J;
		}
	},
	async readFile($, X) {
		return readFile($, { encoding: X.encoding });
	},
	async rename($, X) {
		return rename($, X);
	},
	statSync($) {
		let J = [];
		try {
			q$(J, R$`fs.statSync(${$})`, 0);
			return r.statSync($);
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	lstatSync($) {
		let J = [];
		try {
			q$(J, R$`fs.lstatSync(${$})`, 0);
			return r.lstatSync($);
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	readFileSync($, X) {
		let W = [];
		try {
			q$(W, R$`fs.readFileSync(${$})`, 0);
			return r.readFileSync($, { encoding: X.encoding });
		} catch (Q) {
			var Y = Q, z = 1;
		} finally {
			D$(W, Y, z);
		}
	},
	readFileBytesSync($) {
		let J = [];
		try {
			q$(J, R$`fs.readFileBytesSync(${$})`, 0);
			return r.readFileSync($);
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	readSync($, X) {
		let Q = [];
		try {
			q$(Q, R$`fs.readSync(${$}, ${X.length} bytes)`, 0);
			let W = void 0;
			try {
				W = r.openSync($, "r");
				let H = Buffer.alloc(X.length);
				return {
					buffer: H,
					bytesRead: r.readSync(W, H, 0, X.length, 0)
				};
			} finally {
				if (W) r.closeSync(W);
			}
		} catch (Y) {
			var z = Y, G = 1;
		} finally {
			D$(Q, z, G);
		}
	},
	appendFileSync($, X, J) {
		let Q = [];
		try {
			q$(Q, R$`fs.appendFileSync(${$}, ${X.length} chars)`, 0);
			if (J?.mode !== void 0) try {
				let H = r.openSync($, "ax", J.mode);
				try {
					r.appendFileSync(H, X);
				} finally {
					r.closeSync(H);
				}
				return;
			} catch (H) {
				if (g6(H) !== "EEXIST") throw H;
			}
			r.appendFileSync($, X);
		} catch (Y) {
			var z = Y, G = 1;
		} finally {
			D$(Q, z, G);
		}
	},
	copyFileSync($, X) {
		let W = [];
		try {
			q$(W, R$`fs.copyFileSync(${$} → ${X})`, 0);
			r.copyFileSync($, X);
		} catch (Q) {
			var Y = Q, z = 1;
		} finally {
			D$(W, Y, z);
		}
	},
	unlinkSync($) {
		let J = [];
		try {
			q$(J, R$`fs.unlinkSync(${$})`, 0);
			r.unlinkSync($);
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	renameSync($, X) {
		let W = [];
		try {
			q$(W, R$`fs.renameSync(${$} → ${X})`, 0);
			r.renameSync($, X);
		} catch (Q) {
			var Y = Q, z = 1;
		} finally {
			D$(W, Y, z);
		}
	},
	linkSync($, X) {
		let W = [];
		try {
			q$(W, R$`fs.linkSync(${$} → ${X})`, 0);
			r.linkSync($, X);
		} catch (Q) {
			var Y = Q, z = 1;
		} finally {
			D$(W, Y, z);
		}
	},
	symlinkSync($, X, J) {
		let Q = [];
		try {
			q$(Q, R$`fs.symlinkSync(${$} → ${X})`, 0);
			r.symlinkSync($, X, J);
		} catch (Y) {
			var z = Y, G = 1;
		} finally {
			D$(Q, z, G);
		}
	},
	readlinkSync($) {
		let J = [];
		try {
			q$(J, R$`fs.readlinkSync(${$})`, 0);
			return r.readlinkSync($);
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	realpathSync($) {
		let J = [];
		try {
			q$(J, R$`fs.realpathSync(${$})`, 0);
			return r.realpathSync($).normalize("NFC");
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	mkdirSync($, X) {
		let Q = [];
		try {
			q$(Q, R$`fs.mkdirSync(${$})`, 0);
			let W = { recursive: !0 };
			if (X?.mode !== void 0) W.mode = X.mode;
			try {
				r.mkdirSync($, W);
			} catch (H) {
				if (g6(H) !== "EEXIST") throw H;
			}
		} catch (Y) {
			var z = Y, G = 1;
		} finally {
			D$(Q, z, G);
		}
	},
	readdirSync($) {
		let J = [];
		try {
			q$(J, R$`fs.readdirSync(${$})`, 0);
			return r.readdirSync($, { withFileTypes: !0 });
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	readdirStringSync($) {
		let J = [];
		try {
			q$(J, R$`fs.readdirStringSync(${$})`, 0);
			return r.readdirSync($);
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	isDirEmptySync($) {
		let W = [];
		try {
			q$(W, R$`fs.isDirEmptySync(${$})`, 0);
			return this.readdirSync($).length === 0;
		} catch (Q) {
			var Y = Q, z = 1;
		} finally {
			D$(W, Y, z);
		}
	},
	rmdirSync($) {
		let J = [];
		try {
			q$(J, R$`fs.rmdirSync(${$})`, 0);
			r.rmdirSync($);
		} catch (W) {
			var Q = W, Y = 1;
		} finally {
			D$(J, Q, Y);
		}
	},
	rmSync($, X) {
		let W = [];
		try {
			q$(W, R$`fs.rmSync(${$})`, 0);
			r.rmSync($, X);
		} catch (Q) {
			var Y = Q, z = 1;
		} finally {
			D$(W, Y, z);
		}
	},
	createWriteStream($) {
		return r.createWriteStream($);
	},
	async readFileBytes($, X) {
		if (X === void 0) return readFile($);
		let J = await open($, "r");
		try {
			let { size: W } = await J.stat(), Q = Math.min(W, X), Y = Buffer.allocUnsafe(Q), z = 0;
			while (z < Q) {
				let { bytesRead: G } = await J.read(Y, z, Q - z, z);
				if (G === 0) break;
				z += G;
			}
			return z < Q ? Y.subarray(0, z) : Y;
		} finally {
			await J.close();
		}
	}
};
function H7() {
	return QR;
}
function WR($, X) {
	if ($.destroyed) return;
	$.write(X);
}
function _N($) {
	WR(process.stderr, $);
}
var YR = /api[_-]?key|secret|token|password|passwd|credential|bearer|authorization|auth[_-]?header|cookie|session[_-]?(?:id|key)|connection[_-]?string|(?:private|ssh|encryption|signing|access|deploy|master|license)[_-]?key|client[_-]?secret/i, xN = "[^\\s,;&}\\])]+", TN = `\\[REDACTED\\]|"[^"]*"|'[^']*'|(?:Bearer|Basic)\\s+(?:\\[REDACTED\\]|${xN})|${xN}`, zR = [
	"sk",
	"ant",
	"api"
].join("-"), GR = [
	{
		id: "url-userinfo",
		source: ":\\/\\/([^/@\\s]+)@",
		confidence: "low"
	},
	{
		id: "gcp-service-account",
		source: "\\b([a-z0-9-]+@[a-z0-9-]+\\.iam\\.gserviceaccount\\.com)\\b",
		flags: "i",
		confidence: "low"
	},
	{
		id: "loose-anthropic-key",
		source: "\\b(sk-ant-?[\\w-]{10,})",
		confidence: "low"
	},
	{
		id: "http-auth-scheme",
		source: "\\b(?:Bearer|Basic)\\s+([A-Za-z0-9+/=._~-]{20,})",
		flags: "i",
		confidence: "low"
	},
	{
		id: "loose-jwt",
		source: "\\b(eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,})",
		confidence: "low"
	},
	{
		id: "sensitive-assign",
		source: `(?:${YR.source})[\\w.-]*["']?\\s*[=:]\\s*(${TN})`,
		flags: "i",
		confidence: "low"
	},
	{
		id: "cloud-env-var",
		source: `\\b(?:AWS|GOOGLE|GCP|GCLOUD|AZURE)_\\w+\\s*[=:]\\s*(${TN})`,
		flags: "i",
		confidence: "low"
	},
	{
		id: "aws-access-token",
		source: "\\b((?:A3T[A-Z0-9]|AKIA|ASIA|ABIA|ACCA)[A-Z2-7]{16})\\b",
		confidence: "high"
	},
	{
		id: "gcp-api-key",
		source: `\\b(AIza[\\w-]{35})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "azure-ad-client-secret",
		source: `(?:^|[\\\\'"\\x60\\s>=:(,)])([a-zA-Z0-9_~.]{3}\\dQ~[a-zA-Z0-9_~.-]{31,34})(?:$|[\\\\'"\\x60\\s<),])`,
		confidence: "high"
	},
	{
		id: "digitalocean-pat",
		source: `\\b(dop_v1_[a-f0-9]{64})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "digitalocean-access-token",
		source: `\\b(doo_v1_[a-f0-9]{64})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "anthropic-api-key",
		source: `\\b(${zR}03-[a-zA-Z0-9_\\-]{93}AA)(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "anthropic-admin-api-key",
		source: `\\b(sk-ant-admin01-[a-zA-Z0-9_\\-]{93}AA)(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "openai-api-key",
		source: `\\b(sk-(?:proj|svcacct|admin)-(?:[A-Za-z0-9_-]{74}|[A-Za-z0-9_-]{58})T3BlbkFJ(?:[A-Za-z0-9_-]{74}|[A-Za-z0-9_-]{58})\\b|sk-[a-zA-Z0-9]{20}T3BlbkFJ[a-zA-Z0-9]{20})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "huggingface-access-token",
		source: `\\b(hf_[a-zA-Z]{34})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "github-pat",
		source: "ghp_[0-9a-zA-Z]{36}",
		confidence: "high"
	},
	{
		id: "github-fine-grained-pat",
		source: "github_pat_\\w{82}",
		confidence: "high"
	},
	{
		id: "github-app-token",
		source: "(?:ghu|ghs)_[0-9a-zA-Z]{36}",
		confidence: "high"
	},
	{
		id: "github-oauth",
		source: "gho_[0-9a-zA-Z]{36}",
		confidence: "high"
	},
	{
		id: "github-refresh-token",
		source: "ghr_[0-9a-zA-Z]{36}",
		confidence: "high"
	},
	{
		id: "gitlab-pat",
		source: "glpat-[\\w-]{20}",
		confidence: "high"
	},
	{
		id: "gitlab-deploy-token",
		source: "gldt-[0-9a-zA-Z_\\-]{20}",
		confidence: "high"
	},
	{
		id: "slack-bot-token",
		source: "xoxb-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*",
		confidence: "high"
	},
	{
		id: "slack-user-token",
		source: "xox[pe](?:-[0-9]{10,13}){3}-[a-zA-Z0-9-]{28,34}",
		confidence: "high"
	},
	{
		id: "slack-app-token",
		source: "xapp-\\d-[A-Z0-9]+-\\d+-[a-z0-9]+",
		flags: "i",
		confidence: "high"
	},
	{
		id: "twilio-api-key",
		source: "SK[0-9a-fA-F]{32}",
		confidence: "high"
	},
	{
		id: "sendgrid-api-token",
		source: `\\b(SG\\.[a-zA-Z0-9=_\\-.]{66})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "npm-access-token",
		source: `\\b(npm_[a-zA-Z0-9]{36})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "pypi-upload-token",
		source: "pypi-AgEIcHlwaS5vcmc[\\w-]{50,1000}",
		confidence: "high"
	},
	{
		id: "databricks-api-token",
		source: `\\b(dapi[a-f0-9]{32}(?:-\\d)?)(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "hashicorp-tf-api-token",
		source: "[a-zA-Z0-9]{14}\\.atlasv1\\.[a-zA-Z0-9\\-_=]{60,70}",
		confidence: "high"
	},
	{
		id: "pulumi-api-token",
		source: `\\b(pul-[a-f0-9]{40})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "postman-api-token",
		source: `\\b(PMAK-[a-fA-F0-9]{24}-[a-fA-F0-9]{34})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "grafana-api-key",
		source: `\\b(eyJrIjoi[A-Za-z0-9+/]{70,400}={0,3})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "grafana-cloud-api-token",
		source: `\\b(glc_[A-Za-z0-9+/]{32,400}={0,3})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "grafana-service-account-token",
		source: `\\b(glsa_[A-Za-z0-9]{32}_[A-Fa-f0-9]{8})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "sentry-user-token",
		source: `\\b(sntryu_[a-f0-9]{64})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "sentry-org-token",
		source: "\\bsntrys_eyJpYXQiO[a-zA-Z0-9+/]{10,200}(?:LCJyZWdpb25fdXJs|InJlZ2lvbl91cmwi|cmVnaW9uX3VybCI6)[a-zA-Z0-9+/]{10,200}={0,2}_[a-zA-Z0-9+/]{43}",
		confidence: "high"
	},
	{
		id: "stripe-access-token",
		source: `\\b((?:sk|rk)_(?:test|live|prod)_[a-zA-Z0-9]{10,99})(?:[\\x60'"\\s;]|\\\\[nr]|$)`,
		confidence: "high"
	},
	{
		id: "shopify-access-token",
		source: "shpat_[a-fA-F0-9]{32}",
		confidence: "high"
	},
	{
		id: "shopify-shared-secret",
		source: "shpss_[a-fA-F0-9]{32}",
		confidence: "high"
	},
	{
		id: "private-key",
		source: "-----BEGIN[ A-Z0-9_-]{0,100}PRIVATE KEY(?: BLOCK)?-----[\\s\\S-]{64,}?-----END[ A-Z0-9_-]{0,100}PRIVATE KEY(?: BLOCK)?-----",
		flags: "i",
		confidence: "high"
	}
];
var fN = null;
function HR($) {
	return GR.map((X) => ({
		id: X.id,
		confidence: X.confidence,
		re: new RegExp(X.source, $ ? (X.flags ?? "").replace("g", "") + "g" : X.flags ?? "")
	}));
}
function yN($) {
	fN ??= HR(!0);
	for (let X of fN) $ = $.replace(X.re, (J, W) => {
		if (typeof W !== "string") return "[REDACTED]";
		let Q = J.lastIndexOf(W);
		return J.slice(0, Q) + "[REDACTED]" + J.slice(Q + W.length);
	});
	return $;
}
var mY = {
	verbose: 0,
	debug: 1,
	info: 2,
	warn: 3,
	error: 4
}, NR = f6(() => {
	let $ = process.env.CLAUDE_CODE_DEBUG_LOG_LEVEL?.toLowerCase().trim();
	if ($ && Object.hasOwn(mY, $)) return $;
	return "debug";
}), OR = !1;
function K7() {
	return typeof process < "u" && Array.isArray(process.argv) ? process.argv : [];
}
var lY = f6(() => {
	let $ = K7();
	return OR || J6(process.env.DEBUG) || J6(process.env.DEBUG_SDK) || $.includes("--debug") || $.includes("-d") || mN() || $.some((X) => X.startsWith("--debug=")) || lN() !== null;
});
var wR = f6(() => {
	let $ = K7().find((J) => J.startsWith("--debug="));
	if (!$) return null;
	return vN($.substring(8));
}), mN = f6(() => {
	let $ = K7();
	return $.includes("--debug-to-stderr") || $.includes("-d2e");
}), lN = f6(() => {
	let $ = K7();
	for (let X = 0; X < $.length; X++) {
		let J = $[X];
		if (J.startsWith("--debug-file=")) return J.substring(13);
		if (J === "--debug-file" && X + 1 < $.length) return $[X + 1];
	}
	return null;
});
function BR($) {
	if (!lY()) return !1;
	if (typeof process > "u" || typeof process.versions > "u" || typeof process.versions.node > "u") return !1;
	return CN($, wR());
}
var qR = !1;
var DR = 10485760, U7 = null, gY = Promise.resolve(), D9 = -1, hY = !1, cY = null;
async function cN($, X, J = DR) {
	if (D9 < 0) D9 = await stat($).then((W) => W.size).catch(() => 0);
	else D9 += X;
	if (D9 <= J || hY) return;
	hY = !0;
	try {
		let W = $.endsWith(".txt") ? `${$.slice(0, -4)}.1.txt` : `${$}.1`;
		try {
			await rename($, W);
		} catch (Q) {
			if (!d4(Q)) await unlink(W).catch(() => {}), await rename($, W).catch(() => unlink($).catch(() => {}));
		}
		D9 = 0;
	} finally {
		hY = !1;
	}
}
function dN($) {
	return cY = join($, `${yY()}.txt`), cY;
}
async function FR($, X, J, W) {
	if ($) await mkdir(X, { recursive: !0 }).catch(() => {});
	let Q = J;
	try {
		await appendFile(J, W);
	} catch (Y) {
		if (!fY(Y)) throw Y;
		Q = dN(J), await appendFile(Q, W);
	}
	await cN(Q, Buffer.byteLength(W)).catch(dY), iN();
}
function dY() {}
function jR() {
	if (!U7) {
		let $ = null;
		U7 = PN({
			writeFn: (X) => {
				let J = pN(), W = dirname(J), Q = $ !== W;
				if ($ = W, lY()) {
					if (Q) try {
						H7().mkdirSync(W);
					} catch {}
					let Y = J;
					try {
						H7().appendFileSync(J, X);
					} catch (z) {
						if (!fY(z)) throw z;
						Y = dN(J), H7().appendFileSync(Y, X);
					}
					cN(Y, Buffer.byteLength(X)).catch(dY), iN();
					return;
				}
				gY = gY.then(FR.bind(null, Q, W, J, X)).catch(dY);
			},
			flushIntervalMs: 1e3,
			maxBufferSize: 100,
			immediateMode: lY()
		}), SN(async () => {
			U7?.dispose(), await gY;
		});
	}
	return U7;
}
function S$($, { level: X } = { level: "debug" }) {
	if (mY[X] < mY[NR()]) return;
	if (!BR($)) return;
	if (qR && $.includes(`
`)) $ = w$($);
	let W = `${(/* @__PURE__ */ new Date()).toISOString()} [${X.toUpperCase()}] ${yN($.trim())}
`;
	if (mN()) {
		_N(W);
		return;
	}
	jR().write(W);
}
function pN() {
	return lN() ?? cY ?? process.env.CLAUDE_CODE_DEBUG_LOGS_DIR ?? join(f4(), "debug", `${yY()}.txt`);
}
var iN = f6(async () => {
	try {
		let $ = pN(), J = join(dirname($), "latest");
		await unlink(J).catch(() => {}), await symlink($, J);
	} catch {}
});
(() => {
	let $ = process.env.CLAUDE_CODE_SLOW_OPERATION_THRESHOLD_MS;
	if ($ !== void 0) {
		let X = Number($);
		if (!Number.isNaN(X) && X >= 0) return X;
	}
	return Infinity;
})();
var LR = { [Symbol.dispose]() {} };
function MR() {
	return LR;
}
var R$ = MR;
function w$($, X, J) {
	let Q = [];
	try {
		q$(Q, R$`JSON.stringify(${$})`, 0);
		return JSON.stringify($, X, J);
	} catch (Y) {
		var z = Y, G = 1;
	} finally {
		D$(Q, z, G);
	}
}
var l$ = ($, X) => {
	let W = [];
	try {
		q$(W, R$`JSON.parse(${$})`, 0);
		return typeof X > "u" ? JSON.parse($) : JSON.parse($, X);
	} catch (Q) {
		var Y = Q, z = 1;
	} finally {
		D$(W, Y, z);
	}
};
function AR($) {
	let X = $.trim();
	return X.startsWith("{") && X.endsWith("}");
}
function nN($, X) {
	let J = { ...$ };
	if (X) {
		let W = X.enabled === !0 && X.failIfUnavailable === void 0 ? {
			...X,
			failIfUnavailable: !0
		} : X, Q = J.settings;
		if (Q && !AR(Q)) throw Error("Cannot use both a settings file path and the sandbox option. Include the sandbox configuration in your settings file instead.");
		let Y = { sandbox: W };
		if (Q) try {
			Y = {
				...l$(Q),
				sandbox: W
			};
		} catch {}
		J.settings = w$(Y);
	}
	return J;
}
var bR = 2e3, V7 = /* @__PURE__ */ new Set(), rN = !1;
function RR() {
	for (let $ of V7) if (!$.killed) $.kill("SIGTERM");
}
function PR($) {
	if (V7.add($), !rN) rN = !0, process.on("exit", RR);
}
var F9 = class {
	options;
	process;
	processStdin;
	processStdout;
	ready = !1;
	abortController;
	exitError;
	exitListeners = [];
	abortHandler;
	pendingWrites = [];
	pendingEndInput = !1;
	spawnResolve;
	spawnReject;
	spawnPromise;
	constructor($) {
		this.options = $;
		if (this.abortController = $.abortController || Y0(), $.deferSpawn) this.spawnPromise = new Promise((X, J) => {
			this.spawnResolve = X, this.spawnReject = J;
		}), this.spawnPromise.catch(() => {});
		else this.initialize();
	}
	spawn() {
		try {
			this.initialize();
		} catch (X) {
			throw this.spawnAbort(c4(X)), X;
		}
		let $ = this.pendingWrites;
		if (this.pendingWrites = [], this.spawnResolve) this.spawnResolve(), this.spawnResolve = void 0, this.spawnReject = void 0;
		for (let X of $) this.write(X);
		if (this.pendingEndInput) this.pendingEndInput = !1, this.processStdin?.end();
	}
	spawnAbort($) {
		if (this.spawnReject) this.spawnReject($), this.spawnReject = void 0, this.spawnResolve = void 0, this.pendingWrites = [];
	}
	updateEnv($) {
		if (this.options.env) Object.assign(this.options.env, $);
		else this.options.env = { ...$ };
	}
	updateResume($) {
		this.options.resume = $;
	}
	getDefaultExecutable() {
		return z0() ? "bun" : "node";
	}
	spawnLocalProcess($) {
		let { command: X, args: J, cwd: W, env: Q, signal: Y } = $, G = spawn(X, J, {
			cwd: W,
			stdio: [
				"pipe",
				"pipe",
				J6(Q.DEBUG_CLAUDE_AGENT_SDK) || this.options.stderr ? "pipe" : "ignore"
			],
			signal: Y,
			env: Q,
			windowsHide: !0
		});
		if (J6(Q.DEBUG_CLAUDE_AGENT_SDK) || this.options.stderr) G.stderr.on("data", (U) => {
			let K = U.toString();
			if (Q6(K), this.options.stderr) this.options.stderr(K);
		});
		return {
			stdin: G.stdin,
			stdout: G.stdout,
			get killed() {
				return G.killed;
			},
			get exitCode() {
				return G.exitCode;
			},
			kill: G.kill.bind(G),
			on: G.on.bind(G),
			once: G.once.bind(G),
			off: G.off.bind(G)
		};
	}
	initialize() {
		try {
			let { additionalDirectories: $ = [], agent: X, betas: J, cwd: W, executable: Q = this.getDefaultExecutable(), executableArgs: Y = [], extraArgs: z = {}, pathToClaudeCodeExecutable: G, env: H = { ...process.env }, thinkingConfig: U, maxTurns: K, maxBudgetUsd: V, taskBudget: N, model: O, fallbackModel: w, jsonSchema: B, permissionMode: F, allowDangerouslySkipPermissions: j, permissionPromptToolName: I, continueConversation: Z, resume: _, settingSources: T, skills: O$, disallowedTools: x$ = [], tools: O6, mcpServers: Y4, strictMcpConfig: z4, canUseTool: a6, includePartialMessages: X0, plugins: k4, sandbox: J0 } = this.options, { allowedTools: B1 = [] } = this.options;
			if (O$ !== void 0) {
				let k$ = O$ === "all" ? ["Skill"] : O$.map((u$) => `Skill(${u$})`), x6 = new Set(B1);
				B1 = [...B1, ...k$.filter((u$) => !x6.has(u$))];
			}
			let l = [
				"--output-format",
				"stream-json",
				"--verbose",
				"--input-format",
				"stream-json"
			];
			if (U) {
				switch (U.type) {
					case "enabled":
						if (U.budgetTokens === void 0) l.push("--thinking", "adaptive");
						else l.push("--max-thinking-tokens", U.budgetTokens.toString());
						break;
					case "disabled":
						l.push("--thinking", "disabled");
						break;
					case "adaptive":
						l.push("--thinking", "adaptive");
						break;
				}
				if (U.type !== "disabled" && U.display) l.push("--thinking-display", U.display);
			}
			if (this.options.effort) l.push("--effort", this.options.effort);
			if (K) l.push("--max-turns", K.toString());
			if (V !== void 0) l.push("--max-budget-usd", V.toString());
			if (N) l.push("--task-budget", N.total.toString());
			if (O) l.push("--model", O);
			if (X) l.push("--agent", X);
			if (J && J.length > 0) l.push("--betas", J.join(","));
			if (B) l.push("--json-schema", w$(B));
			if (this.options.debugFile) l.push("--debug-file", this.options.debugFile);
			else if (this.options.debug) l.push("--debug");
			if (!this.options.debugFile && !this.options.spawnClaudeCodeProcess) {
				let k$ = ZN();
				if (k$) l.push("--debug-file", k$);
			}
			if (a6) {
				if (I) throw Error("canUseTool callback cannot be used with permissionPromptToolName. Please use one or the other.");
				l.push("--permission-prompt-tool", "stdio");
			} else if (I) l.push("--permission-prompt-tool", I);
			if (Z) l.push("--continue");
			if (_) l.push("--resume", _);
			if (this.options.assistant) l.push("--assistant");
			if (this.options.channels && this.options.channels.length > 0) l.push("--channels", ...this.options.channels);
			if (B1.length > 0) l.push("--allowedTools", B1.join(","));
			if (x$.length > 0) l.push("--disallowedTools", x$.join(","));
			if (O6 !== void 0) if (Array.isArray(O6)) if (O6.length === 0) l.push("--tools", "");
			else l.push("--tools", O6.join(","));
			else l.push("--tools", "default");
			if (Y4 && Object.keys(Y4).length > 0) l.push("--mcp-config", w$({ mcpServers: Y4 }));
			if (T !== void 0) l.push(`--setting-sources=${T.join(",")}`);
			if (z4) l.push("--strict-mcp-config");
			if (F) l.push("--permission-mode", F);
			if (j) l.push("--allow-dangerously-skip-permissions");
			if (w) {
				if (O && w === O) throw Error("Fallback model cannot be the same as the main model. Please specify a different model for fallbackModel option.");
				l.push("--fallback-model", w);
			}
			if (this.options.includeHookEvents) l.push("--include-hook-events");
			if (X0) l.push("--include-partial-messages");
			if (this.options.sessionMirror) l.push("--session-mirror");
			for (let k$ of $) l.push("--add-dir", k$);
			if (k4 && k4.length > 0) for (let k$ of k4) if (k$.type === "local") l.push("--plugin-dir", k$.path);
			else throw Error(`Unsupported plugin type: ${k$.type}`);
			if (this.options.forkSession) l.push("--fork-session");
			if (this.options.resumeSessionAt) l.push("--resume-session-at", this.options.resumeSessionAt);
			if (this.options.sessionId) l.push("--session-id", this.options.sessionId);
			if (this.options.persistSession === !1) l.push("--no-session-persistence");
			if (this.options.managedSettings) l.push("--managed-settings", this.options.managedSettings);
			let L8 = { ...z ?? {} };
			if (this.options.settings) L8.settings = this.options.settings;
			let tW = nN(L8, J0);
			for (let [k$, x6] of Object.entries(tW)) if (x6 === null) l.push(`--${k$}`);
			else l.push(`--${k$}`, x6);
			if (!H.CLAUDE_CODE_ENTRYPOINT) H.CLAUDE_CODE_ENTRYPOINT = "sdk-ts";
			if (delete H.NODE_OPTIONS, J6(H.DEBUG_CLAUDE_AGENT_SDK)) H.DEBUG = "1";
			else delete H.DEBUG;
			let Q0 = ER(G), M8 = Q0 ? G : Q, A8 = Q0 ? [...Y, ...l] : [
				...Y,
				G,
				...l
			], EJ = {
				command: M8,
				args: A8,
				cwd: W,
				env: H,
				signal: this.abortController.signal
			};
			if (this.options.spawnClaudeCodeProcess) Q6(`Spawning Claude Code (custom): ${M8} ${A8.join(" ")}`), this.process = this.options.spawnClaudeCodeProcess(EJ);
			else Q6(`Spawning Claude Code: ${M8} ${A8.join(" ")}`), this.process = this.spawnLocalProcess(EJ);
			this.processStdin = this.process.stdin, this.processStdout = this.process.stdout, PR(this.process), this.abortHandler = () => {
				if (this.process && !this.process.killed) this.process.kill("SIGTERM");
			}, this.abortController.signal.addEventListener("abort", this.abortHandler), this.process.on("error", (k$) => {
				if (this.ready = !1, this.abortController.signal.aborted) this.exitError = new X6("Claude Code process aborted by user");
				else if (d4(k$)) {
					let x6 = Q0 ? `Claude Code native binary not found at ${G}. Please ensure Claude Code is installed via native installer or specify a valid path with options.pathToClaudeCodeExecutable.` : `Claude Code executable not found at ${G}. Is options.pathToClaudeCodeExecutable set?`;
					this.exitError = ReferenceError(x6), Q6(this.exitError.message);
				} else this.exitError = Error(`Failed to spawn Claude Code process: ${k$.message}`), Q6(this.exitError.message);
			}), this.process.on("exit", (k$, x6) => {
				if (this.ready = !1, this.abortController.signal.aborted) this.exitError = new X6("Claude Code process aborted by user");
				else {
					let u$ = this.getProcessExitError(k$, x6);
					if (u$) this.exitError = u$, Q6(u$.message);
				}
			}), this.ready = !0;
		} catch ($) {
			throw this.ready = !1, $;
		}
	}
	getProcessExitError($, X) {
		if ($ !== 0 && $ !== null) return Error(`Claude Code process exited with code ${$}`);
		else if (X) return Error(`Claude Code process terminated by signal ${X}`);
	}
	write($) {
		if (this.abortController.signal.aborted) throw new X6("Operation aborted");
		if (this.spawnResolve) {
			this.pendingWrites.push($);
			return;
		}
		if (!this.ready || !this.processStdin) throw Error("ProcessTransport is not ready for writing");
		if (this.processStdin.writableEnded) {
			Q6("[ProcessTransport] Dropping write to ended stdin stream");
			return;
		}
		if (this.process?.killed || this.process?.exitCode !== null) throw Error("Cannot write to terminated process");
		if (this.exitError) throw Error(`Cannot write to process that exited with error: ${this.exitError.message}`);
		Q6(`[ProcessTransport] Writing to stdin: ${$.substring(0, 100)}`);
		try {
			if (!this.processStdin.write($)) Q6("[ProcessTransport] Write buffer full, data queued");
		} catch (X) {
			throw this.ready = !1, Error(`Failed to write to process stdin: ${A0(X)}`);
		}
	}
	[Symbol.dispose]() {
		this.close();
	}
	close() {
		if (this.spawnAbort(Error("Query closed before spawn")), this.processStdin) this.processStdin.end(), this.processStdin = void 0;
		if (this.abortHandler) this.abortController.signal.removeEventListener("abort", this.abortHandler), this.abortHandler = void 0;
		for (let { handler: X } of this.exitListeners) this.process?.off("exit", X);
		this.exitListeners = [];
		let $ = this.process;
		if ($ && !$.killed && $.exitCode === null) setTimeout((X) => {
			if (X.killed || X.exitCode !== null) return;
			X.kill("SIGTERM"), setTimeout((J) => {
				if (J.exitCode === null) J.kill("SIGKILL");
			}, 5e3, X).unref();
		}, bR, $).unref(), $.once("exit", () => V7.delete($));
		else if ($) V7.delete($);
		this.ready = !1;
	}
	isReady() {
		return this.ready;
	}
	async *readMessages() {
		if (this.spawnPromise) await this.spawnPromise, this.spawnPromise = void 0;
		if (!this.processStdout) throw Error("ProcessTransport output stream not available");
		if (this.exitError) throw this.exitError;
		let $ = createInterface({ input: this.processStdout }), X = this.process ? (() => {
			let J = this.process, W = () => $.close();
			return J.on("error", W), () => J.off("error", W);
		})() : void 0;
		if (this.exitError) $.close();
		try {
			for await (let J of $) if (J.trim()) {
				let W;
				try {
					W = l$(J);
				} catch (Q) {
					Q6(`Non-JSON stdout: ${J}`);
					continue;
				}
				yield W;
			}
			if (this.exitError) throw this.exitError;
			await this.waitForExit();
		} catch (J) {
			throw J;
		} finally {
			X?.(), $.close();
		}
	}
	endInput() {
		if (this.spawnResolve) {
			this.pendingEndInput = !0;
			return;
		}
		if (this.processStdin) this.processStdin.end();
	}
	getInputStream() {
		return this.processStdin;
	}
	onExit($) {
		if (!this.process) return () => {};
		let X = (J, W) => {
			$(this.getProcessExitError(J, W));
		};
		return this.process.on("exit", X), this.exitListeners.push({
			callback: $,
			handler: X
		}), () => {
			if (this.process) this.process.off("exit", X);
			let J = this.exitListeners.findIndex((W) => W.handler === X);
			if (J !== -1) this.exitListeners.splice(J, 1);
		};
	}
	async waitForExit() {
		if (!this.process) {
			if (this.exitError) throw this.exitError;
			return;
		}
		if (this.process.exitCode !== null || this.process.killed || this.exitError) {
			if (this.exitError) throw this.exitError;
			return;
		}
		return new Promise(($, X) => {
			let J = (Q, Y) => {
				if (this.abortController.signal.aborted) {
					X(new X6("Operation aborted"));
					return;
				}
				let z = this.getProcessExitError(Q, Y);
				if (z) X(z);
				else $();
			};
			this.process.once("exit", J);
			let W = (Q) => {
				this.process.off("exit", J), X(Q);
			};
			this.process.once("error", W), this.process.once("exit", () => {
				this.process.off("error", W);
			});
		});
	}
};
function ER($) {
	return ![
		".js",
		".mjs",
		".tsx",
		".ts",
		".jsx"
	].some((J) => $.endsWith(J));
}
function N7($, X = process.platform, J = process.arch) {
	let Q = X === "win32" ? ".exe" : "", z = (X === "linux" ? [`@anthropic-ai/claude-agent-sdk-linux-${J}-musl`, `@anthropic-ai/claude-agent-sdk-linux-${J}`] : [`@anthropic-ai/claude-agent-sdk-${X}-${J}`]).map((G) => `${G}/claude${Q}`);
	for (let G of z) try {
		return $(G);
	} catch {}
	return null;
}
var E1 = class {
	returned;
	queue = [];
	readResolve;
	readReject;
	isDone = !1;
	hasError;
	started = !1;
	constructor($) {
		this.returned = $;
	}
	[Symbol.asyncIterator]() {
		if (this.started) throw Error("Stream can only be iterated once");
		return this.started = !0, this;
	}
	next() {
		if (this.queue.length > 0) return Promise.resolve({
			done: !1,
			value: this.queue.shift()
		});
		if (this.isDone) return Promise.resolve({
			done: !0,
			value: void 0
		});
		if (this.hasError) return Promise.reject(this.hasError);
		return new Promise(($, X) => {
			this.readResolve = $, this.readReject = X;
		});
	}
	enqueue($) {
		if (this.readResolve) {
			let X = this.readResolve;
			this.readResolve = void 0, this.readReject = void 0, X({
				done: !1,
				value: $
			});
		} else this.queue.push($);
	}
	done() {
		if (this.isDone = !0, this.readResolve) {
			let $ = this.readResolve;
			this.readResolve = void 0, this.readReject = void 0, $({
				done: !0,
				value: void 0
			});
		}
	}
	error($) {
		if (this.hasError = $, this.readReject) {
			let X = this.readReject;
			this.readResolve = void 0, this.readReject = void 0, X($);
		}
	}
	return() {
		if (this.isDone = !0, this.returned) this.returned();
		return Promise.resolve({
			done: !0,
			value: void 0
		});
	}
};
var iY = class {
	sendMcpMessage;
	isClosed = !1;
	constructor($) {
		this.sendMcpMessage = $;
	}
	onclose;
	onerror;
	onmessage;
	async start() {}
	async send($) {
		if (this.isClosed) throw Error("Transport is closed");
		this.sendMcpMessage($);
	}
	async close() {
		if (this.isClosed) return;
		this.isClosed = !0, this.onclose?.();
	}
};
var j9 = class {
	transport;
	isSingleUserTurn;
	canUseTool;
	hooks;
	abortController;
	jsonSchema;
	initConfig;
	onElicitation;
	getOAuthToken;
	pendingControlResponses = /* @__PURE__ */ new Map();
	cleanupPerformed = !1;
	sdkMessages;
	inputStream = new E1();
	initialization;
	cancelControllers = /* @__PURE__ */ new Map();
	hookCallbacks = /* @__PURE__ */ new Map();
	nextCallbackId = 0;
	sdkMcpTransports = /* @__PURE__ */ new Map();
	sdkMcpServerInstances = /* @__PURE__ */ new Map();
	pendingMcpResponses = /* @__PURE__ */ new Map();
	firstResultReceivedResolve;
	firstResultReceived = !1;
	lastErrorResultText;
	transcriptMirrorBatcher;
	cleanupCallbacks = [];
	cleanupPromise;
	setIsSingleUserTurn($) {
		this.isSingleUserTurn = $;
	}
	setTranscriptMirrorBatcher($) {
		this.transcriptMirrorBatcher = $;
	}
	reportMirrorError($, X) {
		let J = {
			type: "system",
			subtype: "mirror_error",
			error: X,
			key: $,
			uuid: randomUUID(),
			session_id: $.sessionId
		};
		this.inputStream.enqueue(J);
	}
	addCleanupCallback($) {
		if (this.cleanupPerformed) $();
		else this.cleanupCallbacks.push($);
	}
	isClosed() {
		return this.cleanupPerformed;
	}
	hasBidirectionalNeeds() {
		return this.sdkMcpTransports.size > 0 || this.hooks !== void 0 && Object.keys(this.hooks).length > 0 || this.canUseTool !== void 0 || this.onElicitation !== void 0 || this.getOAuthToken !== void 0;
	}
	constructor($, X, J, W, Q, Y = /* @__PURE__ */ new Map(), z, G, H, U) {
		this.transport = $;
		this.isSingleUserTurn = X;
		this.canUseTool = J;
		this.hooks = W;
		this.abortController = Q;
		this.jsonSchema = z;
		this.initConfig = G;
		this.onElicitation = H;
		this.getOAuthToken = U;
		for (let [K, V] of Y) this.connectSdkMcpServer(K, V);
		this.sdkMessages = this.readSdkMessages(), this.readMessages(), this.initialization = this.initialize(), this.initialization.catch(() => {});
	}
	setError($) {
		this.inputStream.error($);
	}
	async stopTask($) {
		await this.request({
			subtype: "stop_task",
			task_id: $
		});
	}
	close() {
		this.cleanup();
	}
	cleanup($) {
		if (this.cleanupPromise) return this.cleanupPromise;
		return this.cleanupPerformed = !0, this.cleanupPromise = this.performCleanup($), this.cleanupPromise;
	}
	async performCleanup($) {
		for (let X of this.cleanupCallbacks) try {
			X();
		} catch {}
		if (this.cleanupCallbacks = [], this.transcriptMirrorBatcher) try {
			await this.transcriptMirrorBatcher.flush();
		} catch {}
		try {
			for (let J of this.cancelControllers.values()) J.abort();
			this.cancelControllers.clear(), this.transport.close();
			let X = $ ?? Error("Query closed before response received");
			for (let { reject: J } of this.pendingControlResponses.values()) J(X);
			this.pendingControlResponses.clear();
			for (let { reject: J } of this.pendingMcpResponses.values()) J(X);
			this.pendingMcpResponses.clear(), this.hookCallbacks.clear();
			for (let J of this.sdkMcpTransports.values()) J.close().catch(() => {});
			if (this.sdkMcpTransports.clear(), $) this.inputStream.error($);
			else this.inputStream.done();
		} catch (X) {}
	}
	next(...[$]) {
		return this.sdkMessages.next(...[$]);
	}
	async return($) {
		return await this.cleanup(), this.sdkMessages.return($);
	}
	async throw($) {
		return await this.cleanup(), this.sdkMessages.throw($);
	}
	[Symbol.asyncIterator]() {
		return this.sdkMessages;
	}
	async [Symbol.asyncDispose]() {
		await this.cleanup();
	}
	async readMessages() {
		try {
			for await (let $ of this.transport.readMessages()) {
				if ($.type === "control_response") {
					let X = this.pendingControlResponses.get($.response.request_id);
					if (X) X.handler($.response);
					continue;
				} else if ($.type === "control_request") {
					this.handleControlRequest($);
					continue;
				} else if ($.type === "control_cancel_request") {
					this.handleControlCancelRequest($);
					continue;
				} else if ($.type === "keep_alive") continue;
				else if ($.type === "transcript_mirror") {
					this.transcriptMirrorBatcher?.enqueue($.filePath, $.entries);
					continue;
				}
				if ($.type === "system" && ($.subtype === "post_turn_summary" || $.subtype === "task_summary")) {
					this.inputStream.enqueue($);
					continue;
				}
				if ($.type === "result") {
					if (this.transcriptMirrorBatcher) await this.transcriptMirrorBatcher.flush();
					if (this.lastErrorResultText = $.is_error ? $.subtype === "success" ? $.result : $.errors.join("; ") : void 0, this.firstResultReceived = !0, this.firstResultReceivedResolve) this.firstResultReceivedResolve();
					if (this.isSingleUserTurn) S$("[Query.readMessages] First result received for single-turn query, closing stdin"), this.transport.endInput();
				} else if (!($.type === "system" && $.subtype === "session_state_changed")) this.lastErrorResultText = void 0;
				this.inputStream.enqueue($);
			}
			if (this.transcriptMirrorBatcher) await this.transcriptMirrorBatcher.flush();
			if (this.firstResultReceivedResolve) this.firstResultReceivedResolve();
			this.inputStream.done(), this.cleanup();
		} catch ($) {
			if (this.transcriptMirrorBatcher) await this.transcriptMirrorBatcher.flush();
			if (this.firstResultReceivedResolve) this.firstResultReceivedResolve();
			if (this.lastErrorResultText !== void 0 && !($ instanceof X6)) {
				let X = Error(`Claude Code returned an error result: ${this.lastErrorResultText}`);
				S$(`[Query.readMessages] Replacing exit error with result text. Original: ${A0($)}`), this.inputStream.error(X), this.cleanup(X);
				return;
			}
			this.inputStream.error($), this.cleanup($);
		}
	}
	async handleControlRequest($) {
		let X = new AbortController();
		this.cancelControllers.set($.request_id, X);
		try {
			let J = await this.processControlRequest($, X.signal);
			if (this.cleanupPerformed) return;
			let W = {
				type: "control_response",
				response: {
					subtype: "success",
					request_id: $.request_id,
					response: J
				}
			};
			await Promise.resolve(this.transport.write(w$(W) + `
`));
		} catch (J) {
			if (this.cleanupPerformed) return;
			let W = {
				type: "control_response",
				response: {
					subtype: "error",
					request_id: $.request_id,
					error: A0(J)
				}
			};
			try {
				await Promise.resolve(this.transport.write(w$(W) + `
`));
			} catch (Q) {
				S$(`[Query.handleControlRequest] Error-response write failed: ${A0(Q)}`, { level: "error" });
			}
		} finally {
			this.cancelControllers.delete($.request_id);
		}
	}
	handleControlCancelRequest($) {
		let X = this.cancelControllers.get($.request_id);
		if (X) X.abort(), this.cancelControllers.delete($.request_id);
	}
	async processControlRequest($, X) {
		if ($.request.subtype === "can_use_tool") {
			if (!this.canUseTool) throw Error("canUseTool callback is not provided.");
			return {
				...await this.canUseTool($.request.tool_name, $.request.input, {
					signal: X,
					suggestions: $.request.permission_suggestions,
					blockedPath: $.request.blocked_path,
					decisionReason: $.request.decision_reason,
					title: $.request.title,
					displayName: $.request.display_name,
					description: $.request.description,
					toolUseID: $.request.tool_use_id,
					agentID: $.request.agent_id
				}),
				toolUseID: $.request.tool_use_id
			};
		} else if ($.request.subtype === "hook_callback") return await this.handleHookCallbacks($.request.callback_id, $.request.input, $.request.tool_use_id, X);
		else if ($.request.subtype === "mcp_message") {
			let J = $.request, W = this.sdkMcpTransports.get(J.server_name);
			if (!W) throw Error(`SDK MCP server not found: ${J.server_name}`);
			if ("method" in J.message && "id" in J.message && J.message.id !== null) return { mcp_response: await this.handleMcpControlRequest(J.server_name, J, W) };
			else {
				if (W.onmessage) W.onmessage(J.message);
				return { mcp_response: {
					jsonrpc: "2.0",
					result: {},
					id: 0
				} };
			}
		} else if ($.request.subtype === "elicitation") {
			let J = $.request;
			if (this.onElicitation) return await this.onElicitation({
				serverName: J.mcp_server_name,
				message: J.message,
				mode: J.mode,
				url: J.url,
				elicitationId: J.elicitation_id,
				requestedSchema: J.requested_schema,
				title: J.title,
				displayName: J.display_name,
				description: J.description
			}, { signal: X });
			return { action: "decline" };
		} else if ($.request.subtype === "oauth_token_refresh") {
			if (!this.getOAuthToken) throw Error("getOAuthToken callback is not provided.");
			return { accessToken: await this.getOAuthToken({ signal: X }) ?? null };
		}
		throw Error("Unsupported control request subtype: " + $.request.subtype);
	}
	async *readSdkMessages() {
		try {
			for await (let $ of this.inputStream) yield $;
		} finally {
			await this.cleanup();
		}
	}
	async initialize() {
		let $;
		if (this.hooks) {
			$ = {};
			for (let [Q, Y] of Object.entries(this.hooks)) if (Y.length > 0) $[Q] = Y.map((z) => {
				let G = [];
				for (let H of z.hooks) {
					let U = `hook_${this.nextCallbackId++}`;
					this.hookCallbacks.set(U, H), G.push(U);
				}
				return {
					matcher: z.matcher,
					hookCallbackIds: G,
					timeout: z.timeout
				};
			});
		}
		let X = this.sdkMcpTransports.size > 0 ? Array.from(this.sdkMcpTransports.keys()) : void 0, J = {
			subtype: "initialize",
			hooks: $,
			sdkMcpServers: X,
			jsonSchema: this.jsonSchema,
			systemPrompt: typeof this.initConfig?.systemPrompt === "string" ? [this.initConfig.systemPrompt] : this.initConfig?.systemPrompt,
			appendSystemPrompt: this.initConfig?.appendSystemPrompt,
			planModeInstructions: this.initConfig?.planModeInstructions,
			appendSubagentSystemPrompt: this.initConfig?.appendSubagentSystemPrompt,
			excludeDynamicSections: this.initConfig?.excludeDynamicSections,
			agents: this.initConfig?.agents,
			title: this.initConfig?.title,
			skills: Array.isArray(this.initConfig?.skills) ? this.initConfig.skills : void 0,
			webSearchIsolationExemptMcpServers: this.initConfig?.webSearchIsolationExemptMcpServers,
			promptSuggestions: this.initConfig?.promptSuggestions,
			agentProgressSummaries: this.initConfig?.agentProgressSummaries,
			forwardSubagentText: this.initConfig?.forwardSubagentText
		};
		return (await this.request(J)).response;
	}
	async interrupt() {
		await this.request({ subtype: "interrupt" });
	}
	async setPermissionMode($) {
		await this.request({
			subtype: "set_permission_mode",
			mode: $
		});
	}
	async setModel($) {
		await this.request({
			subtype: "set_model",
			model: $
		});
	}
	async setMaxThinkingTokens($) {
		await this.request({
			subtype: "set_max_thinking_tokens",
			max_thinking_tokens: $
		});
	}
	async applyFlagSettings($) {
		await this.request({
			subtype: "apply_flag_settings",
			settings: $
		});
	}
	async getSettings() {
		return (await this.request({ subtype: "get_settings" })).response;
	}
	async rewindFiles($, X) {
		return (await this.request({
			subtype: "rewind_files",
			user_message_id: $,
			dry_run: X?.dryRun
		})).response;
	}
	async cancelAsyncMessage($) {
		return (await this.request({
			subtype: "cancel_async_message",
			message_uuid: $
		})).response.cancelled;
	}
	async seedReadState($, X) {
		await this.request({
			subtype: "seed_read_state",
			path: $,
			mtime: X
		});
	}
	async enableRemoteControl($, X) {
		return (await this.request({
			subtype: "remote_control",
			enabled: $,
			...X !== void 0 && { name: X }
		})).response;
	}
	async submitFeedback($, X) {
		return (await this.request({
			subtype: "submit_feedback",
			description: $,
			surface: X?.surface
		})).response;
	}
	async generateSessionTitle($, X) {
		return (await this.request({
			subtype: "generate_session_title",
			description: $,
			persist: X?.persist
		})).response.title;
	}
	async askSideQuestion($) {
		let J = (await this.request({
			subtype: "side_question",
			question: $
		})).response;
		return J.response === null ? null : {
			response: J.response,
			synthetic: J.synthetic ?? !1
		};
	}
	async launchUltrareview($, X) {
		return (await this.request({
			subtype: "ultrareview_launch",
			args: $,
			confirm: X?.confirm ?? !1
		})).response;
	}
	async messageRated($) {
		await this.request({
			subtype: "message_rated",
			messageUuid: $.messageUuid,
			sentiment: $.sentiment,
			surface: $.surface,
			cleared: $.cleared ?? !1
		});
	}
	processPendingPermissionRequests($) {
		for (let X of $) if (X.request.subtype === "can_use_tool") this.handleControlRequest(X).catch(() => {});
	}
	request($) {
		let X = Math.random().toString(36).substring(2, 15), J = {
			request_id: X,
			type: "control_request",
			request: $
		};
		return new Promise((W, Q) => {
			this.pendingControlResponses.set(X, {
				handler: (Y) => {
					if (this.pendingControlResponses.delete(X), Y.subtype === "success") W(Y);
					else if (Q(Error(Y.error)), Y.pending_permission_requests) this.processPendingPermissionRequests(Y.pending_permission_requests);
				},
				reject: Q
			}), Promise.resolve(this.transport.write(w$(J) + `
`)).catch((Y) => {
				this.pendingControlResponses.delete(X), Q(Y);
			});
		});
	}
	initializationResult() {
		return this.initialization;
	}
	async supportedCommands() {
		return (await this.initialization).commands;
	}
	async supportedModels() {
		return (await this.initialization).models;
	}
	async supportedAgents() {
		return (await this.initialization).agents;
	}
	async reconnectMcpServer($) {
		await this.request({
			subtype: "mcp_reconnect",
			serverName: $
		});
	}
	async toggleMcpServer($, X) {
		await this.request({
			subtype: "mcp_toggle",
			serverName: $,
			enabled: X
		});
	}
	async enableChannel($) {
		await this.request({
			subtype: "channel_enable",
			serverName: $
		});
	}
	async mcpAuthenticate($, X) {
		return (await this.request({
			subtype: "mcp_authenticate",
			serverName: $,
			redirectUri: X
		})).response;
	}
	async mcpClearAuth($) {
		return (await this.request({
			subtype: "mcp_clear_auth",
			serverName: $
		})).response;
	}
	async mcpSubmitOAuthCallbackUrl($, X) {
		return (await this.request({
			subtype: "mcp_oauth_callback_url",
			serverName: $,
			callbackUrl: X
		})).response;
	}
	async claudeAuthenticate($) {
		return (await this.request({
			subtype: "claude_authenticate",
			loginWithClaudeAi: $
		})).response;
	}
	async claudeOAuthCallback($, X) {
		return (await this.request({
			subtype: "claude_oauth_callback",
			authorizationCode: $,
			state: X
		})).response;
	}
	async claudeOAuthWaitForCompletion() {
		return (await this.request({ subtype: "claude_oauth_wait_for_completion" })).response;
	}
	async mcpServerStatus() {
		return (await this.request({ subtype: "mcp_status" })).response.mcpServers;
	}
	async getContextUsage() {
		return (await this.request({ subtype: "get_context_usage" })).response;
	}
	async readFile($, X) {
		try {
			return (await this.request({
				subtype: "read_file",
				path: $,
				max_bytes: X?.maxBytes,
				encoding: X?.encoding
			})).response;
		} catch {
			return null;
		}
	}
	async reloadPlugins() {
		return (await this.request({ subtype: "reload_plugins" })).response;
	}
	async setMcpServers($) {
		let X = {}, J = {};
		for (let [G, H] of Object.entries($)) if (H.type === "sdk" && "instance" in H) X[G] = H.instance;
		else J[G] = H;
		let W = new Set(this.sdkMcpServerInstances.keys()), Q = new Set(Object.keys(X));
		for (let G of W) if (!Q.has(G)) await this.disconnectSdkMcpServer(G);
		for (let [G, H] of Object.entries(X)) if (!W.has(G)) this.connectSdkMcpServer(G, H);
		let Y = {};
		for (let G of Object.keys(X)) Y[G] = {
			type: "sdk",
			name: G
		};
		return (await this.request({
			subtype: "mcp_set_servers",
			servers: {
				...J,
				...Y
			}
		})).response;
	}
	async accountInfo() {
		return (await this.initialization).account;
	}
	async streamInput($) {
		S$("[Query.streamInput] Starting to process input stream");
		try {
			let X = 0;
			for await (let J of $) {
				if (X++, S$(`[Query.streamInput] Processing message ${X}: ${J.type}`), this.abortController?.signal.aborted) break;
				await Promise.resolve(this.transport.write(w$(J) + `
`));
			}
			if (S$(`[Query.streamInput] Finished processing ${X} messages from input stream`), X > 0 && this.hasBidirectionalNeeds()) S$("[Query.streamInput] Has bidirectional needs, waiting for first result"), await this.waitForFirstResult();
			S$("[Query] Calling transport.endInput() to close stdin to CLI process"), this.transport.endInput();
		} catch (X) {
			if (!(X instanceof X6)) throw X;
		}
	}
	waitForFirstResult() {
		if (this.firstResultReceived) return S$("[Query.waitForFirstResult] Result already received, returning immediately"), Promise.resolve();
		return new Promise(($) => {
			if (this.abortController?.signal.aborted) {
				$();
				return;
			}
			this.abortController?.signal.addEventListener("abort", () => $(), { once: !0 }), this.firstResultReceivedResolve = $;
		});
	}
	handleHookCallbacks($, X, J, W) {
		let Q = this.hookCallbacks.get($);
		if (!Q) throw Error(`No hook callback found for ID: ${$}`);
		return Q(X, J, { signal: W });
	}
	connectSdkMcpServer($, X) {
		let J = new iY((W) => this.sendMcpServerMessageToCli($, W));
		this.sdkMcpTransports.set($, J), this.sdkMcpServerInstances.set($, X), X.connect(J).catch((W) => {
			if (this.sdkMcpTransports.get($) === J) this.sdkMcpTransports.delete($);
			if (this.sdkMcpServerInstances.get($) === X) this.sdkMcpServerInstances.delete($);
			S$(`[Query.connectSdkMcpServer] Failed to connect MCP server '${$}': ${W}`, { level: "error" });
		});
	}
	async disconnectSdkMcpServer($) {
		let X = this.sdkMcpTransports.get($);
		if (X) await X.close(), this.sdkMcpTransports.delete($);
		this.sdkMcpServerInstances.delete($);
	}
	sendMcpServerMessageToCli($, X) {
		if ("id" in X && X.id !== null && X.id !== void 0) {
			let W = `${$}:${X.id}`, Q = this.pendingMcpResponses.get(W);
			if (Q) {
				Q.resolve(X), this.pendingMcpResponses.delete(W);
				return;
			}
		}
		let J = {
			type: "control_request",
			request_id: randomUUID(),
			request: {
				subtype: "mcp_message",
				server_name: $,
				message: X
			}
		};
		Promise.resolve(this.transport.write(w$(J) + `
`)).catch((W) => {
			S$(`[Query.sendMcpServerMessageToCli] Transport write failed: ${W}`, { level: "error" });
		});
	}
	handleMcpControlRequest($, X, J) {
		let Q = `${$}:${"id" in X.message ? X.message.id : null}`;
		return new Promise((Y, z) => {
			let G = () => {
				this.pendingMcpResponses.delete(Q);
			}, H = (K) => {
				G(), Y(K);
			}, U = (K) => {
				G(), z(K);
			};
			if (this.pendingMcpResponses.set(Q, {
				resolve: H,
				reject: U
			}), J.onmessage) J.onmessage(X.message);
			else {
				G(), z(Error("No message handler registered"));
				return;
			}
		});
	}
};
var O7 = 500, w7 = 1048576;
var SR = [200, 800];
var nY = class {
	send;
	sendTimeoutMs;
	onError;
	maxPendingEntries;
	maxPendingBytes;
	backoffMs;
	pending = [];
	pendingEntries = 0;
	pendingBytes = 0;
	flushPromise = null;
	constructor($, X = 6e4, J, W = O7, Q = w7, Y = SR) {
		this.send = $;
		this.sendTimeoutMs = X;
		this.onError = J;
		this.maxPendingEntries = W;
		this.maxPendingBytes = Q;
		this.backoffMs = Y;
	}
	enqueue($, X) {
		let J = w$(X).length;
		if (this.pending.push({
			filePath: $,
			entries: X,
			bytes: J
		}), this.pendingEntries += X.length, this.pendingBytes += J, this.pendingEntries > this.maxPendingEntries || this.pendingBytes > this.maxPendingBytes) this.flushPromise = this.drain(), this.flushPromise.catch(() => {});
	}
	async flush() {
		let $ = this.drain();
		if (this.flushPromise = $, await $, this.flushPromise === $) this.flushPromise = null;
	}
	async drain() {
		let $ = this.flushPromise, X = this.pending.splice(0);
		if (this.pendingEntries = 0, this.pendingBytes = 0, $) await $;
		if (X.length === 0) return;
		await this.doFlush(X);
	}
	async doFlush($) {
		let X = /* @__PURE__ */ new Map();
		for (let W of $) {
			let Q = X.get(W.filePath);
			if (Q) Q.push(...W.entries);
			else X.set(W.filePath, W.entries.slice());
		}
		let J = this.backoffMs.length + 1;
		for (let [W, Q] of X) {
			let Y = `SessionStore.append() timed out after ${this.sendTimeoutMs}ms for ${W}`, z, G = 1;
			for (; G <= J; G++) try {
				await G4(this.send(W, Q), this.sendTimeoutMs, Y), z = void 0;
				break;
			} catch (H) {
				if (z = c4(H), z.message === Y) break;
				let U = this.backoffMs[G - 1];
				if (U === void 0) break;
				await vJ(U);
			}
			if (z) {
				S$(`[TranscriptMirrorBatcher] flush failed for ${W} after ${G} attempt(s): ${z}`, { level: "error" });
				try {
					this.onError?.(W, z);
				} catch (H) {
					S$(`[TranscriptMirrorBatcher] onError callback threw: ${H}`, { level: "error" });
				}
			}
		}
	}
};
SJ(mz(), 1);
var oW = SJ(mz(), 1);
promisify(execFile);
function pB($) {
	let X = 0;
	for (let J = 0; J < $.length; J++) X = (X << 5) - X + $.charCodeAt(J) | 0;
	return X;
}
var JS = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function U$($) {
	if (typeof $ !== "string") return null;
	return JS.test($) ? $ : null;
}
async function E9($, X) {
	let J = createWriteStream($, { mode: 384 });
	try {
		for (let W of X) if (!J.write(JSON.stringify(W) + `
`)) await once(J, "drain");
		J.end(), await once(J, "finish");
	} catch (W) {
		throw J.destroy(), W;
	}
}
var E0 = 200;
function QS($) {
	return Math.abs(pB($)).toString(36);
}
function T1($) {
	let X = $.replace(/[^a-zA-Z0-9]/g, "-");
	if (X.length <= E0) return X;
	return `${X.slice(0, E0)}-${QS($)}`;
}
Buffer.from("{\"type\":\"attribution-snapshot\"");
Buffer.from("{\"type\":\"system\"");
Buffer.from([10]);
function Lq($) {
	return [...new Set($)];
}
function iS() {
	return "prod";
}
var nS = "user:inference", Aq = "user:profile", oS = ["org:create_api_key", Aq], tS = [
	Aq,
	nS,
	"user:sessions:claude_code",
	"user:mcp_servers",
	"user:file_upload"
];
Lq([...oS, ...tS]);
var Mq = {
	BASE_API_URL: "https://api.anthropic.com",
	CONSOLE_AUTHORIZE_URL: "https://platform.claude.com/oauth/authorize",
	CLAUDE_AI_AUTHORIZE_URL: "https://claude.com/cai/oauth/authorize",
	CLAUDE_AI_ORIGIN: "https://claude.ai",
	TOKEN_URL: "https://platform.claude.com/v1/oauth/token",
	API_KEY_URL: "https://api.anthropic.com/api/oauth/claude_cli/create_api_key",
	ROLES_URL: "https://api.anthropic.com/api/oauth/claude_cli/roles",
	CONSOLE_SUCCESS_URL: "https://platform.claude.com/buy_credits?returnUrl=/oauth/code/success%3Fapp%3Dclaude-code",
	CLAUDEAI_SUCCESS_URL: "https://platform.claude.com/oauth/code/success?app=claude-code",
	MANUAL_REDIRECT_URL: "https://platform.claude.com/oauth/code/callback",
	CLIENT_ID: "9d1c250a-e61b-44d9-88ed-5944d1962f5e",
	OAUTH_FILE_SUFFIX: "",
	MCP_PROXY_URL: "https://mcp-proxy.anthropic.com",
	MCP_PROXY_PATH: "/v1/mcp/{server_id}"
};
var aS = void 0;
function sS() {
	let $ = process.env.CLAUDE_LOCAL_OAUTH_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8000", X = process.env.CLAUDE_LOCAL_OAUTH_APPS_BASE?.replace(/\/$/, "") ?? "http://localhost:4000", J = process.env.CLAUDE_LOCAL_OAUTH_CONSOLE_BASE?.replace(/\/$/, "") ?? "http://localhost:3000";
	return {
		BASE_API_URL: $,
		CONSOLE_AUTHORIZE_URL: `${J}/oauth/authorize`,
		CLAUDE_AI_AUTHORIZE_URL: `${X}/oauth/authorize`,
		CLAUDE_AI_ORIGIN: X,
		TOKEN_URL: `${$}/v1/oauth/token`,
		API_KEY_URL: `${$}/api/oauth/claude_cli/create_api_key`,
		ROLES_URL: `${$}/api/oauth/claude_cli/roles`,
		CONSOLE_SUCCESS_URL: `${J}/buy_credits?returnUrl=/oauth/code/success%3Fapp%3Dclaude-code`,
		CLAUDEAI_SUCCESS_URL: `${J}/oauth/code/success?app=claude-code`,
		MANUAL_REDIRECT_URL: `${J}/oauth/code/callback`,
		CLIENT_ID: "22422756-60c9-4084-8eb7-27705fd5cf9a",
		OAUTH_FILE_SUFFIX: "-local-oauth",
		MCP_PROXY_URL: "http://localhost:8205",
		MCP_PROXY_PATH: "/v1/toolbox/shttp/mcp/{server_id}"
	};
}
var eS = [
	"https://beacon.claude-ai.staging.ant.dev",
	"https://claude.fedstart.com",
	"https://claude-staging.fedstart.com"
];
function Iq() {
	let $ = (() => {
		switch (iS()) {
			case "local": return sS();
			case "staging": return aS ?? Mq;
			case "prod": return Mq;
		}
	})(), X = process.env.CLAUDE_CODE_CUSTOM_OAUTH_URL;
	if (X) {
		let W = X.replace(/\/$/, "");
		if (!eS.includes(W)) throw Error("CLAUDE_CODE_CUSTOM_OAUTH_URL is not an approved endpoint.");
		$ = {
			...$,
			BASE_API_URL: W,
			CONSOLE_AUTHORIZE_URL: `${W}/oauth/authorize`,
			CLAUDE_AI_AUTHORIZE_URL: `${W}/oauth/authorize`,
			CLAUDE_AI_ORIGIN: W,
			TOKEN_URL: `${W}/v1/oauth/token`,
			API_KEY_URL: `${W}/api/oauth/claude_cli/create_api_key`,
			ROLES_URL: `${W}/api/oauth/claude_cli/roles`,
			CONSOLE_SUCCESS_URL: `${W}/oauth/code/success?app=claude-code`,
			CLAUDEAI_SUCCESS_URL: `${W}/oauth/code/success?app=claude-code`,
			MANUAL_REDIRECT_URL: `${W}/oauth/code/callback`,
			OAUTH_FILE_SUFFIX: "-custom-oauth"
		};
	}
	let J = process.env.CLAUDE_CODE_OAUTH_CLIENT_ID;
	if (J) $ = {
		...$,
		CLIENT_ID: J
	};
	return $;
}
var Zq = "-credentials";
function bq($ = "") {
	let X = f4(), W = !process.env.CLAUDE_CONFIG_DIR ? "" : `-${createHash("sha256").update(X).digest("hex").substring(0, 8)}`;
	return `Claude Code${Iq().OAUTH_FILE_SUFFIX}${$}${W}`;
}
var Jv = /^[a-zA-Z0-9._-]+$/;
function Rq() {
	let $;
	try {
		$ = process.env.USER || userInfo().username;
	} catch {
		$ = "claude-code-user";
	}
	if (!Jv.test($)) return "claude-code-user";
	return $;
}
var X$;
(function($) {
	$.assertEqual = (Q) => {};
	function X(Q) {}
	$.assertIs = X;
	function J(Q) {
		throw Error();
	}
	$.assertNever = J, $.arrayToEnum = (Q) => {
		let Y = {};
		for (let z of Q) Y[z] = z;
		return Y;
	}, $.getValidEnumValues = (Q) => {
		let Y = $.objectKeys(Q).filter((G) => typeof Q[Q[G]] !== "number"), z = {};
		for (let G of Y) z[G] = Q[G];
		return $.objectValues(z);
	}, $.objectValues = (Q) => {
		return $.objectKeys(Q).map(function(Y) {
			return Q[Y];
		});
	}, $.objectKeys = typeof Object.keys === "function" ? (Q) => Object.keys(Q) : (Q) => {
		let Y = [];
		for (let z in Q) if (Object.prototype.hasOwnProperty.call(Q, z)) Y.push(z);
		return Y;
	}, $.find = (Q, Y) => {
		for (let z of Q) if (Y(z)) return z;
	}, $.isInteger = typeof Number.isInteger === "function" ? (Q) => Number.isInteger(Q) : (Q) => typeof Q === "number" && Number.isFinite(Q) && Math.floor(Q) === Q;
	function W(Q, Y = " | ") {
		return Q.map((z) => typeof z === "string" ? `'${z}'` : z).join(Y);
	}
	$.joinValues = W, $.jsonStringifyReplacer = (Q, Y) => {
		if (typeof Y === "bigint") return Y.toString();
		return Y;
	};
})(X$ || (X$ = {}));
var Pq;
(function($) {
	$.mergeShapes = (X, J) => {
		return {
			...X,
			...J
		};
	};
})(Pq || (Pq = {}));
var S = X$.arrayToEnum([
	"string",
	"nan",
	"number",
	"integer",
	"float",
	"boolean",
	"date",
	"bigint",
	"symbol",
	"function",
	"undefined",
	"null",
	"array",
	"object",
	"unknown",
	"promise",
	"void",
	"never",
	"map",
	"set"
]), q4 = ($) => {
	switch (typeof $) {
		case "undefined": return S.undefined;
		case "string": return S.string;
		case "number": return Number.isNaN($) ? S.nan : S.number;
		case "boolean": return S.boolean;
		case "function": return S.function;
		case "bigint": return S.bigint;
		case "symbol": return S.symbol;
		case "object":
			if (Array.isArray($)) return S.array;
			if ($ === null) return S.null;
			if ($.then && typeof $.then === "function" && $.catch && typeof $.catch === "function") return S.promise;
			if (typeof Map < "u" && $ instanceof Map) return S.map;
			if (typeof Set < "u" && $ instanceof Set) return S.set;
			if (typeof Date < "u" && $ instanceof Date) return S.date;
			return S.object;
		default: return S.unknown;
	}
};
var b = X$.arrayToEnum([
	"invalid_type",
	"invalid_literal",
	"custom",
	"invalid_union",
	"invalid_union_discriminator",
	"invalid_enum_value",
	"unrecognized_keys",
	"invalid_arguments",
	"invalid_return_type",
	"invalid_date",
	"invalid_string",
	"too_small",
	"too_big",
	"invalid_intersection_types",
	"not_multiple_of",
	"not_finite"
]);
var j6 = class j6 extends Error {
	get errors() {
		return this.issues;
	}
	constructor($) {
		super();
		this.issues = [], this.addIssue = (J) => {
			this.issues = [...this.issues, J];
		}, this.addIssues = (J = []) => {
			this.issues = [...this.issues, ...J];
		};
		let X = new.target.prototype;
		if (Object.setPrototypeOf) Object.setPrototypeOf(this, X);
		else this.__proto__ = X;
		this.name = "ZodError", this.issues = $;
	}
	format($) {
		let X = $ || function(Q) {
			return Q.message;
		}, J = { _errors: [] }, W = (Q) => {
			for (let Y of Q.issues) if (Y.code === "invalid_union") Y.unionErrors.map(W);
			else if (Y.code === "invalid_return_type") W(Y.returnTypeError);
			else if (Y.code === "invalid_arguments") W(Y.argumentsError);
			else if (Y.path.length === 0) J._errors.push(X(Y));
			else {
				let z = J, G = 0;
				while (G < Y.path.length) {
					let H = Y.path[G];
					if (G !== Y.path.length - 1) z[H] = z[H] || { _errors: [] };
					else z[H] = z[H] || { _errors: [] }, z[H]._errors.push(X(Y));
					z = z[H], G++;
				}
			}
		};
		return W(this), J;
	}
	static assert($) {
		if (!($ instanceof j6)) throw Error(`Not a ZodError: ${$}`);
	}
	toString() {
		return this.message;
	}
	get message() {
		return JSON.stringify(this.issues, X$.jsonStringifyReplacer, 2);
	}
	get isEmpty() {
		return this.issues.length === 0;
	}
	flatten($ = (X) => X.message) {
		let X = {}, J = [];
		for (let W of this.issues) if (W.path.length > 0) {
			let Q = W.path[0];
			X[Q] = X[Q] || [], X[Q].push($(W));
		} else J.push($(W));
		return {
			formErrors: J,
			fieldErrors: X
		};
	}
	get formErrors() {
		return this.flatten();
	}
};
j6.create = ($) => {
	return new j6($);
};
var Qv = ($, X) => {
	let J;
	switch ($.code) {
		case b.invalid_type:
			if ($.received === S.undefined) J = "Required";
			else J = `Expected ${$.expected}, received ${$.received}`;
			break;
		case b.invalid_literal:
			J = `Invalid literal value, expected ${JSON.stringify($.expected, X$.jsonStringifyReplacer)}`;
			break;
		case b.unrecognized_keys:
			J = `Unrecognized key(s) in object: ${X$.joinValues($.keys, ", ")}`;
			break;
		case b.invalid_union:
			J = "Invalid input";
			break;
		case b.invalid_union_discriminator:
			J = `Invalid discriminator value. Expected ${X$.joinValues($.options)}`;
			break;
		case b.invalid_enum_value:
			J = `Invalid enum value. Expected ${X$.joinValues($.options)}, received '${$.received}'`;
			break;
		case b.invalid_arguments:
			J = "Invalid function arguments";
			break;
		case b.invalid_return_type:
			J = "Invalid function return type";
			break;
		case b.invalid_date:
			J = "Invalid date";
			break;
		case b.invalid_string:
			if (typeof $.validation === "object") if ("includes" in $.validation) {
				if (J = `Invalid input: must include "${$.validation.includes}"`, typeof $.validation.position === "number") J = `${J} at one or more positions greater than or equal to ${$.validation.position}`;
			} else if ("startsWith" in $.validation) J = `Invalid input: must start with "${$.validation.startsWith}"`;
			else if ("endsWith" in $.validation) J = `Invalid input: must end with "${$.validation.endsWith}"`;
			else X$.assertNever($.validation);
			else if ($.validation !== "regex") J = `Invalid ${$.validation}`;
			else J = "Invalid";
			break;
		case b.too_small:
			if ($.type === "array") J = `Array must contain ${$.exact ? "exactly" : $.inclusive ? "at least" : "more than"} ${$.minimum} element(s)`;
			else if ($.type === "string") J = `String must contain ${$.exact ? "exactly" : $.inclusive ? "at least" : "over"} ${$.minimum} character(s)`;
			else if ($.type === "number") J = `Number must be ${$.exact ? "exactly equal to " : $.inclusive ? "greater than or equal to " : "greater than "}${$.minimum}`;
			else if ($.type === "bigint") J = `Number must be ${$.exact ? "exactly equal to " : $.inclusive ? "greater than or equal to " : "greater than "}${$.minimum}`;
			else if ($.type === "date") J = `Date must be ${$.exact ? "exactly equal to " : $.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number($.minimum))}`;
			else J = "Invalid input";
			break;
		case b.too_big:
			if ($.type === "array") J = `Array must contain ${$.exact ? "exactly" : $.inclusive ? "at most" : "less than"} ${$.maximum} element(s)`;
			else if ($.type === "string") J = `String must contain ${$.exact ? "exactly" : $.inclusive ? "at most" : "under"} ${$.maximum} character(s)`;
			else if ($.type === "number") J = `Number must be ${$.exact ? "exactly" : $.inclusive ? "less than or equal to" : "less than"} ${$.maximum}`;
			else if ($.type === "bigint") J = `BigInt must be ${$.exact ? "exactly" : $.inclusive ? "less than or equal to" : "less than"} ${$.maximum}`;
			else if ($.type === "date") J = `Date must be ${$.exact ? "exactly" : $.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number($.maximum))}`;
			else J = "Invalid input";
			break;
		case b.custom:
			J = "Invalid input";
			break;
		case b.invalid_intersection_types:
			J = "Intersection results could not be merged";
			break;
		case b.not_multiple_of:
			J = `Number must be a multiple of ${$.multipleOf}`;
			break;
		case b.not_finite:
			J = "Number must be finite";
			break;
		default: J = X.defaultError, X$.assertNever($);
	}
	return { message: J };
}, n4 = Qv;
var Wv = n4;
function v9() {
	return Wv;
}
var S7 = ($) => {
	let { data: X, path: J, errorMaps: W, issueData: Q } = $, Y = [...J, ...Q.path || []], z = {
		...Q,
		path: Y
	};
	if (Q.message !== void 0) return {
		...Q,
		path: Y,
		message: Q.message
	};
	let G = "", H = W.filter((U) => !!U).slice().reverse();
	for (let U of H) G = U(z, {
		data: X,
		defaultError: G
	}).message;
	return {
		...Q,
		path: Y,
		message: G
	};
};
function k($, X) {
	let J = v9(), W = S7({
		issueData: X,
		data: $.data,
		path: $.path,
		errorMaps: [
			$.common.contextualErrorMap,
			$.schemaErrorMap,
			J,
			J === n4 ? void 0 : n4
		].filter((Q) => !!Q)
	});
	$.common.issues.push(W);
}
var i$ = class i$ {
	constructor() {
		this.value = "valid";
	}
	dirty() {
		if (this.value === "valid") this.value = "dirty";
	}
	abort() {
		if (this.value !== "aborted") this.value = "aborted";
	}
	static mergeArray($, X) {
		let J = [];
		for (let W of X) {
			if (W.status === "aborted") return c;
			if (W.status === "dirty") $.dirty();
			J.push(W.value);
		}
		return {
			status: $.value,
			value: J
		};
	}
	static async mergeObjectAsync($, X) {
		let J = [];
		for (let W of X) {
			let Q = await W.key, Y = await W.value;
			J.push({
				key: Q,
				value: Y
			});
		}
		return i$.mergeObjectSync($, J);
	}
	static mergeObjectSync($, X) {
		let J = {};
		for (let W of X) {
			let { key: Q, value: Y } = W;
			if (Q.status === "aborted") return c;
			if (Y.status === "aborted") return c;
			if (Q.status === "dirty") $.dirty();
			if (Y.status === "dirty") $.dirty();
			if (Q.value !== "__proto__" && (typeof Y.value < "u" || W.alwaysSet)) J[Q.value] = Y.value;
		}
		return {
			status: $.value,
			value: J
		};
	}
};
var c = Object.freeze({ status: "aborted" }), C0 = ($) => ({
	status: "dirty",
	value: $
}), t$ = ($) => ({
	status: "valid",
	value: $
}), $3 = ($) => $.status === "aborted", X3 = ($) => $.status === "dirty", f1 = ($) => $.status === "valid", C9 = ($) => typeof Promise < "u" && $ instanceof Promise;
var y;
(function($) {
	$.errToObj = (X) => typeof X === "string" ? { message: X } : X || {}, $.toString = (X) => typeof X === "string" ? X : X?.message;
})(y || (y = {}));
var m6 = class {
	constructor($, X, J, W) {
		this._cachedPath = [], this.parent = $, this.data = X, this._path = J, this._key = W;
	}
	get path() {
		if (!this._cachedPath.length) if (Array.isArray(this._key)) this._cachedPath.push(...this._path, ...this._key);
		else this._cachedPath.push(...this._path, this._key);
		return this._cachedPath;
	}
};
var Eq = ($, X) => {
	if (f1(X)) return {
		success: !0,
		data: X.value
	};
	else {
		if (!$.common.issues.length) throw Error("Validation failed but no issues detected.");
		return {
			success: !1,
			get error() {
				if (this._error) return this._error;
				let J = new j6($.common.issues);
				return this._error = J, this._error;
			}
		};
	}
};
function o($) {
	if (!$) return {};
	let { errorMap: X, invalid_type_error: J, required_error: W, description: Q } = $;
	if (X && (J || W)) throw Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
	if (X) return {
		errorMap: X,
		description: Q
	};
	return {
		errorMap: (z, G) => {
			let { message: H } = $;
			if (z.code === "invalid_enum_value") return { message: H ?? G.defaultError };
			if (typeof G.data > "u") return { message: H ?? W ?? G.defaultError };
			if (z.code !== "invalid_type") return { message: G.defaultError };
			return { message: H ?? J ?? G.defaultError };
		},
		description: Q
	};
}
var e = class {
	get description() {
		return this._def.description;
	}
	_getType($) {
		return q4($.data);
	}
	_getOrReturnCtx($, X) {
		return X || {
			common: $.parent.common,
			data: $.data,
			parsedType: q4($.data),
			schemaErrorMap: this._def.errorMap,
			path: $.path,
			parent: $.parent
		};
	}
	_processInputParams($) {
		return {
			status: new i$(),
			ctx: {
				common: $.parent.common,
				data: $.data,
				parsedType: q4($.data),
				schemaErrorMap: this._def.errorMap,
				path: $.path,
				parent: $.parent
			}
		};
	}
	_parseSync($) {
		let X = this._parse($);
		if (C9(X)) throw Error("Synchronous parse encountered promise.");
		return X;
	}
	_parseAsync($) {
		let X = this._parse($);
		return Promise.resolve(X);
	}
	parse($, X) {
		let J = this.safeParse($, X);
		if (J.success) return J.data;
		throw J.error;
	}
	safeParse($, X) {
		let J = {
			common: {
				issues: [],
				async: X?.async ?? !1,
				contextualErrorMap: X?.errorMap
			},
			path: X?.path || [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: $,
			parsedType: q4($)
		};
		return Eq(J, this._parseSync({
			data: $,
			path: J.path,
			parent: J
		}));
	}
	"~validate"($) {
		let X = {
			common: {
				issues: [],
				async: !!this["~standard"].async
			},
			path: [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: $,
			parsedType: q4($)
		};
		if (!this["~standard"].async) try {
			let J = this._parseSync({
				data: $,
				path: [],
				parent: X
			});
			return f1(J) ? { value: J.value } : { issues: X.common.issues };
		} catch (J) {
			if (J?.message?.toLowerCase()?.includes("encountered")) this["~standard"].async = !0;
			X.common = {
				issues: [],
				async: !0
			};
		}
		return this._parseAsync({
			data: $,
			path: [],
			parent: X
		}).then((J) => f1(J) ? { value: J.value } : { issues: X.common.issues });
	}
	async parseAsync($, X) {
		let J = await this.safeParseAsync($, X);
		if (J.success) return J.data;
		throw J.error;
	}
	async safeParseAsync($, X) {
		let J = {
			common: {
				issues: [],
				contextualErrorMap: X?.errorMap,
				async: !0
			},
			path: X?.path || [],
			schemaErrorMap: this._def.errorMap,
			parent: null,
			data: $,
			parsedType: q4($)
		}, W = this._parse({
			data: $,
			path: J.path,
			parent: J
		});
		return Eq(J, await (C9(W) ? W : Promise.resolve(W)));
	}
	refine($, X) {
		let J = (W) => {
			if (typeof X === "string" || typeof X > "u") return { message: X };
			else if (typeof X === "function") return X(W);
			else return X;
		};
		return this._refinement((W, Q) => {
			let Y = $(W), z = () => Q.addIssue({
				code: b.custom,
				...J(W)
			});
			if (typeof Promise < "u" && Y instanceof Promise) return Y.then((G) => {
				if (!G) return z(), !1;
				else return !0;
			});
			if (!Y) return z(), !1;
			else return !0;
		});
	}
	refinement($, X) {
		return this._refinement((J, W) => {
			if (!$(J)) return W.addIssue(typeof X === "function" ? X(J, W) : X), !1;
			else return !0;
		});
	}
	_refinement($) {
		return new $4({
			schema: this,
			typeName: R.ZodEffects,
			effect: {
				type: "refinement",
				refinement: $
			}
		});
	}
	superRefine($) {
		return this._refinement($);
	}
	constructor($) {
		this.spa = this.safeParseAsync, this._def = $, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
			version: 1,
			vendor: "zod",
			validate: (X) => this["~validate"](X)
		};
	}
	optional() {
		return R6.create(this, this._def);
	}
	nullable() {
		return r4.create(this, this._def);
	}
	nullish() {
		return this.nullable().optional();
	}
	array() {
		return e6.create(this);
	}
	promise() {
		return f0.create(this, this._def);
	}
	or($) {
		return f9.create([this, $], this._def);
	}
	and($) {
		return y9.create(this, $, this._def);
	}
	transform($) {
		return new $4({
			...o(this._def),
			schema: this,
			typeName: R.ZodEffects,
			effect: {
				type: "transform",
				transform: $
			}
		});
	}
	default($) {
		let X = typeof $ === "function" ? $ : () => $;
		return new m9({
			...o(this._def),
			innerType: this,
			defaultValue: X,
			typeName: R.ZodDefault
		});
	}
	brand() {
		return new Y3({
			typeName: R.ZodBranded,
			type: this,
			...o(this._def)
		});
	}
	catch($) {
		let X = typeof $ === "function" ? $ : () => $;
		return new l9({
			...o(this._def),
			innerType: this,
			catchValue: X,
			typeName: R.ZodCatch
		});
	}
	describe($) {
		return new this.constructor({
			...this._def,
			description: $
		});
	}
	pipe($) {
		return y7.create(this, $);
	}
	readonly() {
		return c9.create(this);
	}
	isOptional() {
		return this.safeParse(void 0).success;
	}
	isNullable() {
		return this.safeParse(null).success;
	}
};
var Yv = /^c[^\s-]{8,}$/i, zv = /^[0-9a-z]+$/, Gv = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Hv = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Uv = /^[a-z0-9_-]{21}$/i, Kv = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Vv = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Nv = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Ov = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", J3, wv = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Bv = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, qv = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Dv = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Fv = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, jv = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Sq = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Lv = new RegExp(`^${Sq}$`);
function vq($) {
	let X = "[0-5]\\d";
	if ($.precision) X = `${X}\\.\\d{${$.precision}}`;
	else if ($.precision == null) X = `${X}(\\.\\d+)?`;
	let J = $.precision ? "+" : "?";
	return `([01]\\d|2[0-3]):[0-5]\\d(:${X})${J}`;
}
function Mv($) {
	return new RegExp(`^${vq($)}$`);
}
function Av($) {
	let X = `${Sq}T${vq($)}`, J = [];
	if (J.push($.local ? "Z?" : "Z"), $.offset) J.push("([+-]\\d{2}:?\\d{2})");
	return X = `${X}(${J.join("|")})`, new RegExp(`^${X}$`);
}
function Iv($, X) {
	if ((X === "v4" || !X) && wv.test($)) return !0;
	if ((X === "v6" || !X) && qv.test($)) return !0;
	return !1;
}
function Zv($, X) {
	if (!Kv.test($)) return !1;
	try {
		let [J] = $.split(".");
		if (!J) return !1;
		let W = J.replace(/-/g, "+").replace(/_/g, "/").padEnd(J.length + (4 - J.length % 4) % 4, "="), Q = JSON.parse(atob(W));
		if (typeof Q !== "object" || Q === null) return !1;
		if ("typ" in Q && Q?.typ !== "JWT") return !1;
		if (!Q.alg) return !1;
		if (X && Q.alg !== X) return !1;
		return !0;
	} catch {
		return !1;
	}
}
function bv($, X) {
	if ((X === "v4" || !X) && Bv.test($)) return !0;
	if ((X === "v6" || !X) && Dv.test($)) return !0;
	return !1;
}
var F4 = class F4 extends e {
	_parse($) {
		if (this._def.coerce) $.data = String($.data);
		if (this._getType($) !== S.string) {
			let Q = this._getOrReturnCtx($);
			return k(Q, {
				code: b.invalid_type,
				expected: S.string,
				received: Q.parsedType
			}), c;
		}
		let J = new i$(), W = void 0;
		for (let Q of this._def.checks) if (Q.kind === "min") {
			if ($.data.length < Q.value) W = this._getOrReturnCtx($, W), k(W, {
				code: b.too_small,
				minimum: Q.value,
				type: "string",
				inclusive: !0,
				exact: !1,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "max") {
			if ($.data.length > Q.value) W = this._getOrReturnCtx($, W), k(W, {
				code: b.too_big,
				maximum: Q.value,
				type: "string",
				inclusive: !0,
				exact: !1,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "length") {
			let Y = $.data.length > Q.value, z = $.data.length < Q.value;
			if (Y || z) {
				if (W = this._getOrReturnCtx($, W), Y) k(W, {
					code: b.too_big,
					maximum: Q.value,
					type: "string",
					inclusive: !0,
					exact: !0,
					message: Q.message
				});
				else if (z) k(W, {
					code: b.too_small,
					minimum: Q.value,
					type: "string",
					inclusive: !0,
					exact: !0,
					message: Q.message
				});
				J.dirty();
			}
		} else if (Q.kind === "email") {
			if (!Nv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "email",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "emoji") {
			if (!J3) J3 = new RegExp(Ov, "u");
			if (!J3.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "emoji",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "uuid") {
			if (!Hv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "uuid",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "nanoid") {
			if (!Uv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "nanoid",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "cuid") {
			if (!Yv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "cuid",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "cuid2") {
			if (!zv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "cuid2",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "ulid") {
			if (!Gv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "ulid",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "url") try {
			new URL($.data);
		} catch {
			W = this._getOrReturnCtx($, W), k(W, {
				validation: "url",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		}
		else if (Q.kind === "regex") {
			if (Q.regex.lastIndex = 0, !Q.regex.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "regex",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "trim") $.data = $.data.trim();
		else if (Q.kind === "includes") {
			if (!$.data.includes(Q.value, Q.position)) W = this._getOrReturnCtx($, W), k(W, {
				code: b.invalid_string,
				validation: {
					includes: Q.value,
					position: Q.position
				},
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "toLowerCase") $.data = $.data.toLowerCase();
		else if (Q.kind === "toUpperCase") $.data = $.data.toUpperCase();
		else if (Q.kind === "startsWith") {
			if (!$.data.startsWith(Q.value)) W = this._getOrReturnCtx($, W), k(W, {
				code: b.invalid_string,
				validation: { startsWith: Q.value },
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "endsWith") {
			if (!$.data.endsWith(Q.value)) W = this._getOrReturnCtx($, W), k(W, {
				code: b.invalid_string,
				validation: { endsWith: Q.value },
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "datetime") {
			if (!Av(Q).test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				code: b.invalid_string,
				validation: "datetime",
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "date") {
			if (!Lv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				code: b.invalid_string,
				validation: "date",
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "time") {
			if (!Mv(Q).test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				code: b.invalid_string,
				validation: "time",
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "duration") {
			if (!Vv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "duration",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "ip") {
			if (!Iv($.data, Q.version)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "ip",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "jwt") {
			if (!Zv($.data, Q.alg)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "jwt",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "cidr") {
			if (!bv($.data, Q.version)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "cidr",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "base64") {
			if (!Fv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "base64",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else if (Q.kind === "base64url") {
			if (!jv.test($.data)) W = this._getOrReturnCtx($, W), k(W, {
				validation: "base64url",
				code: b.invalid_string,
				message: Q.message
			}), J.dirty();
		} else X$.assertNever(Q);
		return {
			status: J.value,
			value: $.data
		};
	}
	_regex($, X, J) {
		return this.refinement((W) => $.test(W), {
			validation: X,
			code: b.invalid_string,
			...y.errToObj(J)
		});
	}
	_addCheck($) {
		return new F4({
			...this._def,
			checks: [...this._def.checks, $]
		});
	}
	email($) {
		return this._addCheck({
			kind: "email",
			...y.errToObj($)
		});
	}
	url($) {
		return this._addCheck({
			kind: "url",
			...y.errToObj($)
		});
	}
	emoji($) {
		return this._addCheck({
			kind: "emoji",
			...y.errToObj($)
		});
	}
	uuid($) {
		return this._addCheck({
			kind: "uuid",
			...y.errToObj($)
		});
	}
	nanoid($) {
		return this._addCheck({
			kind: "nanoid",
			...y.errToObj($)
		});
	}
	cuid($) {
		return this._addCheck({
			kind: "cuid",
			...y.errToObj($)
		});
	}
	cuid2($) {
		return this._addCheck({
			kind: "cuid2",
			...y.errToObj($)
		});
	}
	ulid($) {
		return this._addCheck({
			kind: "ulid",
			...y.errToObj($)
		});
	}
	base64($) {
		return this._addCheck({
			kind: "base64",
			...y.errToObj($)
		});
	}
	base64url($) {
		return this._addCheck({
			kind: "base64url",
			...y.errToObj($)
		});
	}
	jwt($) {
		return this._addCheck({
			kind: "jwt",
			...y.errToObj($)
		});
	}
	ip($) {
		return this._addCheck({
			kind: "ip",
			...y.errToObj($)
		});
	}
	cidr($) {
		return this._addCheck({
			kind: "cidr",
			...y.errToObj($)
		});
	}
	datetime($) {
		if (typeof $ === "string") return this._addCheck({
			kind: "datetime",
			precision: null,
			offset: !1,
			local: !1,
			message: $
		});
		return this._addCheck({
			kind: "datetime",
			precision: typeof $?.precision > "u" ? null : $?.precision,
			offset: $?.offset ?? !1,
			local: $?.local ?? !1,
			...y.errToObj($?.message)
		});
	}
	date($) {
		return this._addCheck({
			kind: "date",
			message: $
		});
	}
	time($) {
		if (typeof $ === "string") return this._addCheck({
			kind: "time",
			precision: null,
			message: $
		});
		return this._addCheck({
			kind: "time",
			precision: typeof $?.precision > "u" ? null : $?.precision,
			...y.errToObj($?.message)
		});
	}
	duration($) {
		return this._addCheck({
			kind: "duration",
			...y.errToObj($)
		});
	}
	regex($, X) {
		return this._addCheck({
			kind: "regex",
			regex: $,
			...y.errToObj(X)
		});
	}
	includes($, X) {
		return this._addCheck({
			kind: "includes",
			value: $,
			position: X?.position,
			...y.errToObj(X?.message)
		});
	}
	startsWith($, X) {
		return this._addCheck({
			kind: "startsWith",
			value: $,
			...y.errToObj(X)
		});
	}
	endsWith($, X) {
		return this._addCheck({
			kind: "endsWith",
			value: $,
			...y.errToObj(X)
		});
	}
	min($, X) {
		return this._addCheck({
			kind: "min",
			value: $,
			...y.errToObj(X)
		});
	}
	max($, X) {
		return this._addCheck({
			kind: "max",
			value: $,
			...y.errToObj(X)
		});
	}
	length($, X) {
		return this._addCheck({
			kind: "length",
			value: $,
			...y.errToObj(X)
		});
	}
	nonempty($) {
		return this.min(1, y.errToObj($));
	}
	trim() {
		return new F4({
			...this._def,
			checks: [...this._def.checks, { kind: "trim" }]
		});
	}
	toLowerCase() {
		return new F4({
			...this._def,
			checks: [...this._def.checks, { kind: "toLowerCase" }]
		});
	}
	toUpperCase() {
		return new F4({
			...this._def,
			checks: [...this._def.checks, { kind: "toUpperCase" }]
		});
	}
	get isDatetime() {
		return !!this._def.checks.find(($) => $.kind === "datetime");
	}
	get isDate() {
		return !!this._def.checks.find(($) => $.kind === "date");
	}
	get isTime() {
		return !!this._def.checks.find(($) => $.kind === "time");
	}
	get isDuration() {
		return !!this._def.checks.find(($) => $.kind === "duration");
	}
	get isEmail() {
		return !!this._def.checks.find(($) => $.kind === "email");
	}
	get isURL() {
		return !!this._def.checks.find(($) => $.kind === "url");
	}
	get isEmoji() {
		return !!this._def.checks.find(($) => $.kind === "emoji");
	}
	get isUUID() {
		return !!this._def.checks.find(($) => $.kind === "uuid");
	}
	get isNANOID() {
		return !!this._def.checks.find(($) => $.kind === "nanoid");
	}
	get isCUID() {
		return !!this._def.checks.find(($) => $.kind === "cuid");
	}
	get isCUID2() {
		return !!this._def.checks.find(($) => $.kind === "cuid2");
	}
	get isULID() {
		return !!this._def.checks.find(($) => $.kind === "ulid");
	}
	get isIP() {
		return !!this._def.checks.find(($) => $.kind === "ip");
	}
	get isCIDR() {
		return !!this._def.checks.find(($) => $.kind === "cidr");
	}
	get isBase64() {
		return !!this._def.checks.find(($) => $.kind === "base64");
	}
	get isBase64url() {
		return !!this._def.checks.find(($) => $.kind === "base64url");
	}
	get minLength() {
		let $ = null;
		for (let X of this._def.checks) if (X.kind === "min") {
			if ($ === null || X.value > $) $ = X.value;
		}
		return $;
	}
	get maxLength() {
		let $ = null;
		for (let X of this._def.checks) if (X.kind === "max") {
			if ($ === null || X.value < $) $ = X.value;
		}
		return $;
	}
};
F4.create = ($) => {
	return new F4({
		checks: [],
		typeName: R.ZodString,
		coerce: $?.coerce ?? !1,
		...o($)
	});
};
function Rv($, X) {
	let J = ($.toString().split(".")[1] || "").length, W = (X.toString().split(".")[1] || "").length, Q = J > W ? J : W;
	return Number.parseInt($.toFixed(Q).replace(".", "")) % Number.parseInt(X.toFixed(Q).replace(".", "")) / 10 ** Q;
}
var _0 = class _0 extends e {
	constructor() {
		super(...arguments);
		this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
	}
	_parse($) {
		if (this._def.coerce) $.data = Number($.data);
		if (this._getType($) !== S.number) {
			let Q = this._getOrReturnCtx($);
			return k(Q, {
				code: b.invalid_type,
				expected: S.number,
				received: Q.parsedType
			}), c;
		}
		let J = void 0, W = new i$();
		for (let Q of this._def.checks) if (Q.kind === "int") {
			if (!X$.isInteger($.data)) J = this._getOrReturnCtx($, J), k(J, {
				code: b.invalid_type,
				expected: "integer",
				received: "float",
				message: Q.message
			}), W.dirty();
		} else if (Q.kind === "min") {
			if (Q.inclusive ? $.data < Q.value : $.data <= Q.value) J = this._getOrReturnCtx($, J), k(J, {
				code: b.too_small,
				minimum: Q.value,
				type: "number",
				inclusive: Q.inclusive,
				exact: !1,
				message: Q.message
			}), W.dirty();
		} else if (Q.kind === "max") {
			if (Q.inclusive ? $.data > Q.value : $.data >= Q.value) J = this._getOrReturnCtx($, J), k(J, {
				code: b.too_big,
				maximum: Q.value,
				type: "number",
				inclusive: Q.inclusive,
				exact: !1,
				message: Q.message
			}), W.dirty();
		} else if (Q.kind === "multipleOf") {
			if (Rv($.data, Q.value) !== 0) J = this._getOrReturnCtx($, J), k(J, {
				code: b.not_multiple_of,
				multipleOf: Q.value,
				message: Q.message
			}), W.dirty();
		} else if (Q.kind === "finite") {
			if (!Number.isFinite($.data)) J = this._getOrReturnCtx($, J), k(J, {
				code: b.not_finite,
				message: Q.message
			}), W.dirty();
		} else X$.assertNever(Q);
		return {
			status: W.value,
			value: $.data
		};
	}
	gte($, X) {
		return this.setLimit("min", $, !0, y.toString(X));
	}
	gt($, X) {
		return this.setLimit("min", $, !1, y.toString(X));
	}
	lte($, X) {
		return this.setLimit("max", $, !0, y.toString(X));
	}
	lt($, X) {
		return this.setLimit("max", $, !1, y.toString(X));
	}
	setLimit($, X, J, W) {
		return new _0({
			...this._def,
			checks: [...this._def.checks, {
				kind: $,
				value: X,
				inclusive: J,
				message: y.toString(W)
			}]
		});
	}
	_addCheck($) {
		return new _0({
			...this._def,
			checks: [...this._def.checks, $]
		});
	}
	int($) {
		return this._addCheck({
			kind: "int",
			message: y.toString($)
		});
	}
	positive($) {
		return this._addCheck({
			kind: "min",
			value: 0,
			inclusive: !1,
			message: y.toString($)
		});
	}
	negative($) {
		return this._addCheck({
			kind: "max",
			value: 0,
			inclusive: !1,
			message: y.toString($)
		});
	}
	nonpositive($) {
		return this._addCheck({
			kind: "max",
			value: 0,
			inclusive: !0,
			message: y.toString($)
		});
	}
	nonnegative($) {
		return this._addCheck({
			kind: "min",
			value: 0,
			inclusive: !0,
			message: y.toString($)
		});
	}
	multipleOf($, X) {
		return this._addCheck({
			kind: "multipleOf",
			value: $,
			message: y.toString(X)
		});
	}
	finite($) {
		return this._addCheck({
			kind: "finite",
			message: y.toString($)
		});
	}
	safe($) {
		return this._addCheck({
			kind: "min",
			inclusive: !0,
			value: Number.MIN_SAFE_INTEGER,
			message: y.toString($)
		})._addCheck({
			kind: "max",
			inclusive: !0,
			value: Number.MAX_SAFE_INTEGER,
			message: y.toString($)
		});
	}
	get minValue() {
		let $ = null;
		for (let X of this._def.checks) if (X.kind === "min") {
			if ($ === null || X.value > $) $ = X.value;
		}
		return $;
	}
	get maxValue() {
		let $ = null;
		for (let X of this._def.checks) if (X.kind === "max") {
			if ($ === null || X.value < $) $ = X.value;
		}
		return $;
	}
	get isInt() {
		return !!this._def.checks.find(($) => $.kind === "int" || $.kind === "multipleOf" && X$.isInteger($.value));
	}
	get isFinite() {
		let $ = null, X = null;
		for (let J of this._def.checks) if (J.kind === "finite" || J.kind === "int" || J.kind === "multipleOf") return !0;
		else if (J.kind === "min") {
			if (X === null || J.value > X) X = J.value;
		} else if (J.kind === "max") {
			if ($ === null || J.value < $) $ = J.value;
		}
		return Number.isFinite(X) && Number.isFinite($);
	}
};
_0.create = ($) => {
	return new _0({
		checks: [],
		typeName: R.ZodNumber,
		coerce: $?.coerce || !1,
		...o($)
	});
};
var x0 = class x0 extends e {
	constructor() {
		super(...arguments);
		this.min = this.gte, this.max = this.lte;
	}
	_parse($) {
		if (this._def.coerce) try {
			$.data = BigInt($.data);
		} catch {
			return this._getInvalidInput($);
		}
		if (this._getType($) !== S.bigint) return this._getInvalidInput($);
		let J = void 0, W = new i$();
		for (let Q of this._def.checks) if (Q.kind === "min") {
			if (Q.inclusive ? $.data < Q.value : $.data <= Q.value) J = this._getOrReturnCtx($, J), k(J, {
				code: b.too_small,
				type: "bigint",
				minimum: Q.value,
				inclusive: Q.inclusive,
				message: Q.message
			}), W.dirty();
		} else if (Q.kind === "max") {
			if (Q.inclusive ? $.data > Q.value : $.data >= Q.value) J = this._getOrReturnCtx($, J), k(J, {
				code: b.too_big,
				type: "bigint",
				maximum: Q.value,
				inclusive: Q.inclusive,
				message: Q.message
			}), W.dirty();
		} else if (Q.kind === "multipleOf") {
			if ($.data % Q.value !== BigInt(0)) J = this._getOrReturnCtx($, J), k(J, {
				code: b.not_multiple_of,
				multipleOf: Q.value,
				message: Q.message
			}), W.dirty();
		} else X$.assertNever(Q);
		return {
			status: W.value,
			value: $.data
		};
	}
	_getInvalidInput($) {
		let X = this._getOrReturnCtx($);
		return k(X, {
			code: b.invalid_type,
			expected: S.bigint,
			received: X.parsedType
		}), c;
	}
	gte($, X) {
		return this.setLimit("min", $, !0, y.toString(X));
	}
	gt($, X) {
		return this.setLimit("min", $, !1, y.toString(X));
	}
	lte($, X) {
		return this.setLimit("max", $, !0, y.toString(X));
	}
	lt($, X) {
		return this.setLimit("max", $, !1, y.toString(X));
	}
	setLimit($, X, J, W) {
		return new x0({
			...this._def,
			checks: [...this._def.checks, {
				kind: $,
				value: X,
				inclusive: J,
				message: y.toString(W)
			}]
		});
	}
	_addCheck($) {
		return new x0({
			...this._def,
			checks: [...this._def.checks, $]
		});
	}
	positive($) {
		return this._addCheck({
			kind: "min",
			value: BigInt(0),
			inclusive: !1,
			message: y.toString($)
		});
	}
	negative($) {
		return this._addCheck({
			kind: "max",
			value: BigInt(0),
			inclusive: !1,
			message: y.toString($)
		});
	}
	nonpositive($) {
		return this._addCheck({
			kind: "max",
			value: BigInt(0),
			inclusive: !0,
			message: y.toString($)
		});
	}
	nonnegative($) {
		return this._addCheck({
			kind: "min",
			value: BigInt(0),
			inclusive: !0,
			message: y.toString($)
		});
	}
	multipleOf($, X) {
		return this._addCheck({
			kind: "multipleOf",
			value: $,
			message: y.toString(X)
		});
	}
	get minValue() {
		let $ = null;
		for (let X of this._def.checks) if (X.kind === "min") {
			if ($ === null || X.value > $) $ = X.value;
		}
		return $;
	}
	get maxValue() {
		let $ = null;
		for (let X of this._def.checks) if (X.kind === "max") {
			if ($ === null || X.value < $) $ = X.value;
		}
		return $;
	}
};
x0.create = ($) => {
	return new x0({
		checks: [],
		typeName: R.ZodBigInt,
		coerce: $?.coerce ?? !1,
		...o($)
	});
};
var v7 = class extends e {
	_parse($) {
		if (this._def.coerce) $.data = Boolean($.data);
		if (this._getType($) !== S.boolean) {
			let J = this._getOrReturnCtx($);
			return k(J, {
				code: b.invalid_type,
				expected: S.boolean,
				received: J.parsedType
			}), c;
		}
		return t$($.data);
	}
};
v7.create = ($) => {
	return new v7({
		typeName: R.ZodBoolean,
		coerce: $?.coerce || !1,
		...o($)
	});
};
var _9 = class _9 extends e {
	_parse($) {
		if (this._def.coerce) $.data = new Date($.data);
		if (this._getType($) !== S.date) {
			let Q = this._getOrReturnCtx($);
			return k(Q, {
				code: b.invalid_type,
				expected: S.date,
				received: Q.parsedType
			}), c;
		}
		if (Number.isNaN($.data.getTime())) return k(this._getOrReturnCtx($), { code: b.invalid_date }), c;
		let J = new i$(), W = void 0;
		for (let Q of this._def.checks) if (Q.kind === "min") {
			if ($.data.getTime() < Q.value) W = this._getOrReturnCtx($, W), k(W, {
				code: b.too_small,
				message: Q.message,
				inclusive: !0,
				exact: !1,
				minimum: Q.value,
				type: "date"
			}), J.dirty();
		} else if (Q.kind === "max") {
			if ($.data.getTime() > Q.value) W = this._getOrReturnCtx($, W), k(W, {
				code: b.too_big,
				message: Q.message,
				inclusive: !0,
				exact: !1,
				maximum: Q.value,
				type: "date"
			}), J.dirty();
		} else X$.assertNever(Q);
		return {
			status: J.value,
			value: new Date($.data.getTime())
		};
	}
	_addCheck($) {
		return new _9({
			...this._def,
			checks: [...this._def.checks, $]
		});
	}
	min($, X) {
		return this._addCheck({
			kind: "min",
			value: $.getTime(),
			message: y.toString(X)
		});
	}
	max($, X) {
		return this._addCheck({
			kind: "max",
			value: $.getTime(),
			message: y.toString(X)
		});
	}
	get minDate() {
		let $ = null;
		for (let X of this._def.checks) if (X.kind === "min") {
			if ($ === null || X.value > $) $ = X.value;
		}
		return $ != null ? new Date($) : null;
	}
	get maxDate() {
		let $ = null;
		for (let X of this._def.checks) if (X.kind === "max") {
			if ($ === null || X.value < $) $ = X.value;
		}
		return $ != null ? new Date($) : null;
	}
};
_9.create = ($) => {
	return new _9({
		checks: [],
		coerce: $?.coerce || !1,
		typeName: R.ZodDate,
		...o($)
	});
};
var C7 = class extends e {
	_parse($) {
		if (this._getType($) !== S.symbol) {
			let J = this._getOrReturnCtx($);
			return k(J, {
				code: b.invalid_type,
				expected: S.symbol,
				received: J.parsedType
			}), c;
		}
		return t$($.data);
	}
};
C7.create = ($) => {
	return new C7({
		typeName: R.ZodSymbol,
		...o($)
	});
};
var x9 = class extends e {
	_parse($) {
		if (this._getType($) !== S.undefined) {
			let J = this._getOrReturnCtx($);
			return k(J, {
				code: b.invalid_type,
				expected: S.undefined,
				received: J.parsedType
			}), c;
		}
		return t$($.data);
	}
};
x9.create = ($) => {
	return new x9({
		typeName: R.ZodUndefined,
		...o($)
	});
};
var T9 = class extends e {
	_parse($) {
		if (this._getType($) !== S.null) {
			let J = this._getOrReturnCtx($);
			return k(J, {
				code: b.invalid_type,
				expected: S.null,
				received: J.parsedType
			}), c;
		}
		return t$($.data);
	}
};
T9.create = ($) => {
	return new T9({
		typeName: R.ZodNull,
		...o($)
	});
};
var k7 = class extends e {
	constructor() {
		super(...arguments);
		this._any = !0;
	}
	_parse($) {
		return t$($.data);
	}
};
k7.create = ($) => {
	return new k7({
		typeName: R.ZodAny,
		...o($)
	});
};
var y1 = class extends e {
	constructor() {
		super(...arguments);
		this._unknown = !0;
	}
	_parse($) {
		return t$($.data);
	}
};
y1.create = ($) => {
	return new y1({
		typeName: R.ZodUnknown,
		...o($)
	});
};
var j4 = class extends e {
	_parse($) {
		let X = this._getOrReturnCtx($);
		return k(X, {
			code: b.invalid_type,
			expected: S.never,
			received: X.parsedType
		}), c;
	}
};
j4.create = ($) => {
	return new j4({
		typeName: R.ZodNever,
		...o($)
	});
};
var _7 = class extends e {
	_parse($) {
		if (this._getType($) !== S.undefined) {
			let J = this._getOrReturnCtx($);
			return k(J, {
				code: b.invalid_type,
				expected: S.void,
				received: J.parsedType
			}), c;
		}
		return t$($.data);
	}
};
_7.create = ($) => {
	return new _7({
		typeName: R.ZodVoid,
		...o($)
	});
};
var e6 = class e6 extends e {
	_parse($) {
		let { ctx: X, status: J } = this._processInputParams($), W = this._def;
		if (X.parsedType !== S.array) return k(X, {
			code: b.invalid_type,
			expected: S.array,
			received: X.parsedType
		}), c;
		if (W.exactLength !== null) {
			let Y = X.data.length > W.exactLength.value, z = X.data.length < W.exactLength.value;
			if (Y || z) k(X, {
				code: Y ? b.too_big : b.too_small,
				minimum: z ? W.exactLength.value : void 0,
				maximum: Y ? W.exactLength.value : void 0,
				type: "array",
				inclusive: !0,
				exact: !0,
				message: W.exactLength.message
			}), J.dirty();
		}
		if (W.minLength !== null) {
			if (X.data.length < W.minLength.value) k(X, {
				code: b.too_small,
				minimum: W.minLength.value,
				type: "array",
				inclusive: !0,
				exact: !1,
				message: W.minLength.message
			}), J.dirty();
		}
		if (W.maxLength !== null) {
			if (X.data.length > W.maxLength.value) k(X, {
				code: b.too_big,
				maximum: W.maxLength.value,
				type: "array",
				inclusive: !0,
				exact: !1,
				message: W.maxLength.message
			}), J.dirty();
		}
		if (X.common.async) return Promise.all([...X.data].map((Y, z) => {
			return W.type._parseAsync(new m6(X, Y, X.path, z));
		})).then((Y) => {
			return i$.mergeArray(J, Y);
		});
		let Q = [...X.data].map((Y, z) => {
			return W.type._parseSync(new m6(X, Y, X.path, z));
		});
		return i$.mergeArray(J, Q);
	}
	get element() {
		return this._def.type;
	}
	min($, X) {
		return new e6({
			...this._def,
			minLength: {
				value: $,
				message: y.toString(X)
			}
		});
	}
	max($, X) {
		return new e6({
			...this._def,
			maxLength: {
				value: $,
				message: y.toString(X)
			}
		});
	}
	length($, X) {
		return new e6({
			...this._def,
			exactLength: {
				value: $,
				message: y.toString(X)
			}
		});
	}
	nonempty($) {
		return this.min(1, $);
	}
};
e6.create = ($, X) => {
	return new e6({
		type: $,
		minLength: null,
		maxLength: null,
		exactLength: null,
		typeName: R.ZodArray,
		...o(X)
	});
};
function k0($) {
	if ($ instanceof E$) {
		let X = {};
		for (let J in $.shape) {
			let W = $.shape[J];
			X[J] = R6.create(k0(W));
		}
		return new E$({
			...$._def,
			shape: () => X
		});
	} else if ($ instanceof e6) return new e6({
		...$._def,
		type: k0($.element)
	});
	else if ($ instanceof R6) return R6.create(k0($.unwrap()));
	else if ($ instanceof r4) return r4.create(k0($.unwrap()));
	else if ($ instanceof L4) return L4.create($.items.map((X) => k0(X)));
	else return $;
}
var E$ = class E$ extends e {
	constructor() {
		super(...arguments);
		this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
	}
	_getCached() {
		if (this._cached !== null) return this._cached;
		let $ = this._def.shape(), X = X$.objectKeys($);
		return this._cached = {
			shape: $,
			keys: X
		}, this._cached;
	}
	_parse($) {
		if (this._getType($) !== S.object) {
			let H = this._getOrReturnCtx($);
			return k(H, {
				code: b.invalid_type,
				expected: S.object,
				received: H.parsedType
			}), c;
		}
		let { status: J, ctx: W } = this._processInputParams($), { shape: Q, keys: Y } = this._getCached(), z = [];
		if (!(this._def.catchall instanceof j4 && this._def.unknownKeys === "strip")) {
			for (let H in W.data) if (!Y.includes(H)) z.push(H);
		}
		let G = [];
		for (let H of Y) {
			let U = Q[H], K = W.data[H];
			G.push({
				key: {
					status: "valid",
					value: H
				},
				value: U._parse(new m6(W, K, W.path, H)),
				alwaysSet: H in W.data
			});
		}
		if (this._def.catchall instanceof j4) {
			let H = this._def.unknownKeys;
			if (H === "passthrough") for (let U of z) G.push({
				key: {
					status: "valid",
					value: U
				},
				value: {
					status: "valid",
					value: W.data[U]
				}
			});
			else if (H === "strict") {
				if (z.length > 0) k(W, {
					code: b.unrecognized_keys,
					keys: z
				}), J.dirty();
			} else if (H === "strip");
			else throw Error("Internal ZodObject error: invalid unknownKeys value.");
		} else {
			let H = this._def.catchall;
			for (let U of z) {
				let K = W.data[U];
				G.push({
					key: {
						status: "valid",
						value: U
					},
					value: H._parse(new m6(W, K, W.path, U)),
					alwaysSet: U in W.data
				});
			}
		}
		if (W.common.async) return Promise.resolve().then(async () => {
			let H = [];
			for (let U of G) {
				let K = await U.key, V = await U.value;
				H.push({
					key: K,
					value: V,
					alwaysSet: U.alwaysSet
				});
			}
			return H;
		}).then((H) => {
			return i$.mergeObjectSync(J, H);
		});
		else return i$.mergeObjectSync(J, G);
	}
	get shape() {
		return this._def.shape();
	}
	strict($) {
		return y.errToObj, new E$({
			...this._def,
			unknownKeys: "strict",
			...$ !== void 0 ? { errorMap: (X, J) => {
				let W = this._def.errorMap?.(X, J).message ?? J.defaultError;
				if (X.code === "unrecognized_keys") return { message: y.errToObj($).message ?? W };
				return { message: W };
			} } : {}
		});
	}
	strip() {
		return new E$({
			...this._def,
			unknownKeys: "strip"
		});
	}
	passthrough() {
		return new E$({
			...this._def,
			unknownKeys: "passthrough"
		});
	}
	extend($) {
		return new E$({
			...this._def,
			shape: () => ({
				...this._def.shape(),
				...$
			})
		});
	}
	merge($) {
		return new E$({
			unknownKeys: $._def.unknownKeys,
			catchall: $._def.catchall,
			shape: () => ({
				...this._def.shape(),
				...$._def.shape()
			}),
			typeName: R.ZodObject
		});
	}
	setKey($, X) {
		return this.augment({ [$]: X });
	}
	catchall($) {
		return new E$({
			...this._def,
			catchall: $
		});
	}
	pick($) {
		let X = {};
		for (let J of X$.objectKeys($)) if ($[J] && this.shape[J]) X[J] = this.shape[J];
		return new E$({
			...this._def,
			shape: () => X
		});
	}
	omit($) {
		let X = {};
		for (let J of X$.objectKeys(this.shape)) if (!$[J]) X[J] = this.shape[J];
		return new E$({
			...this._def,
			shape: () => X
		});
	}
	deepPartial() {
		return k0(this);
	}
	partial($) {
		let X = {};
		for (let J of X$.objectKeys(this.shape)) {
			let W = this.shape[J];
			if ($ && !$[J]) X[J] = W;
			else X[J] = W.optional();
		}
		return new E$({
			...this._def,
			shape: () => X
		});
	}
	required($) {
		let X = {};
		for (let J of X$.objectKeys(this.shape)) if ($ && !$[J]) X[J] = this.shape[J];
		else {
			let Q = this.shape[J];
			while (Q instanceof R6) Q = Q._def.innerType;
			X[J] = Q;
		}
		return new E$({
			...this._def,
			shape: () => X
		});
	}
	keyof() {
		return Cq(X$.objectKeys(this.shape));
	}
};
E$.create = ($, X) => {
	return new E$({
		shape: () => $,
		unknownKeys: "strip",
		catchall: j4.create(),
		typeName: R.ZodObject,
		...o(X)
	});
};
E$.strictCreate = ($, X) => {
	return new E$({
		shape: () => $,
		unknownKeys: "strict",
		catchall: j4.create(),
		typeName: R.ZodObject,
		...o(X)
	});
};
E$.lazycreate = ($, X) => {
	return new E$({
		shape: $,
		unknownKeys: "strip",
		catchall: j4.create(),
		typeName: R.ZodObject,
		...o(X)
	});
};
var f9 = class extends e {
	_parse($) {
		let { ctx: X } = this._processInputParams($), J = this._def.options;
		function W(Q) {
			for (let z of Q) if (z.result.status === "valid") return z.result;
			for (let z of Q) if (z.result.status === "dirty") return X.common.issues.push(...z.ctx.common.issues), z.result;
			let Y = Q.map((z) => new j6(z.ctx.common.issues));
			return k(X, {
				code: b.invalid_union,
				unionErrors: Y
			}), c;
		}
		if (X.common.async) return Promise.all(J.map(async (Q) => {
			let Y = {
				...X,
				common: {
					...X.common,
					issues: []
				},
				parent: null
			};
			return {
				result: await Q._parseAsync({
					data: X.data,
					path: X.path,
					parent: Y
				}),
				ctx: Y
			};
		})).then(W);
		else {
			let Q = void 0, Y = [];
			for (let G of J) {
				let H = {
					...X,
					common: {
						...X.common,
						issues: []
					},
					parent: null
				}, U = G._parseSync({
					data: X.data,
					path: X.path,
					parent: H
				});
				if (U.status === "valid") return U;
				else if (U.status === "dirty" && !Q) Q = {
					result: U,
					ctx: H
				};
				if (H.common.issues.length) Y.push(H.common.issues);
			}
			if (Q) return X.common.issues.push(...Q.ctx.common.issues), Q.result;
			let z = Y.map((G) => new j6(G));
			return k(X, {
				code: b.invalid_union,
				unionErrors: z
			}), c;
		}
	}
	get options() {
		return this._def.options;
	}
};
f9.create = ($, X) => {
	return new f9({
		options: $,
		typeName: R.ZodUnion,
		...o(X)
	});
};
var D4 = ($) => {
	if ($ instanceof g9) return D4($.schema);
	else if ($ instanceof $4) return D4($.innerType());
	else if ($ instanceof h9) return [$.value];
	else if ($ instanceof g1) return $.options;
	else if ($ instanceof u9) return X$.objectValues($.enum);
	else if ($ instanceof m9) return D4($._def.innerType);
	else if ($ instanceof x9) return [void 0];
	else if ($ instanceof T9) return [null];
	else if ($ instanceof R6) return [void 0, ...D4($.unwrap())];
	else if ($ instanceof r4) return [null, ...D4($.unwrap())];
	else if ($ instanceof Y3) return D4($.unwrap());
	else if ($ instanceof c9) return D4($.unwrap());
	else if ($ instanceof l9) return D4($._def.innerType);
	else return [];
};
var W3 = class W3 extends e {
	_parse($) {
		let { ctx: X } = this._processInputParams($);
		if (X.parsedType !== S.object) return k(X, {
			code: b.invalid_type,
			expected: S.object,
			received: X.parsedType
		}), c;
		let J = this.discriminator, W = X.data[J], Q = this.optionsMap.get(W);
		if (!Q) return k(X, {
			code: b.invalid_union_discriminator,
			options: Array.from(this.optionsMap.keys()),
			path: [J]
		}), c;
		if (X.common.async) return Q._parseAsync({
			data: X.data,
			path: X.path,
			parent: X
		});
		else return Q._parseSync({
			data: X.data,
			path: X.path,
			parent: X
		});
	}
	get discriminator() {
		return this._def.discriminator;
	}
	get options() {
		return this._def.options;
	}
	get optionsMap() {
		return this._def.optionsMap;
	}
	static create($, X, J) {
		let W = /* @__PURE__ */ new Map();
		for (let Q of X) {
			let Y = D4(Q.shape[$]);
			if (!Y.length) throw Error(`A discriminator value for key \`${$}\` could not be extracted from all schema options`);
			for (let z of Y) {
				if (W.has(z)) throw Error(`Discriminator property ${String($)} has duplicate value ${String(z)}`);
				W.set(z, Q);
			}
		}
		return new W3({
			typeName: R.ZodDiscriminatedUnion,
			discriminator: $,
			options: X,
			optionsMap: W,
			...o(J)
		});
	}
};
function Q3($, X) {
	let J = q4($), W = q4(X);
	if ($ === X) return {
		valid: !0,
		data: $
	};
	else if (J === S.object && W === S.object) {
		let Q = X$.objectKeys(X), Y = X$.objectKeys($).filter((G) => Q.indexOf(G) !== -1), z = {
			...$,
			...X
		};
		for (let G of Y) {
			let H = Q3($[G], X[G]);
			if (!H.valid) return { valid: !1 };
			z[G] = H.data;
		}
		return {
			valid: !0,
			data: z
		};
	} else if (J === S.array && W === S.array) {
		if ($.length !== X.length) return { valid: !1 };
		let Q = [];
		for (let Y = 0; Y < $.length; Y++) {
			let z = $[Y], G = X[Y], H = Q3(z, G);
			if (!H.valid) return { valid: !1 };
			Q.push(H.data);
		}
		return {
			valid: !0,
			data: Q
		};
	} else if (J === S.date && W === S.date && +$ === +X) return {
		valid: !0,
		data: $
	};
	else return { valid: !1 };
}
var y9 = class extends e {
	_parse($) {
		let { status: X, ctx: J } = this._processInputParams($), W = (Q, Y) => {
			if ($3(Q) || $3(Y)) return c;
			let z = Q3(Q.value, Y.value);
			if (!z.valid) return k(J, { code: b.invalid_intersection_types }), c;
			if (X3(Q) || X3(Y)) X.dirty();
			return {
				status: X.value,
				value: z.data
			};
		};
		if (J.common.async) return Promise.all([this._def.left._parseAsync({
			data: J.data,
			path: J.path,
			parent: J
		}), this._def.right._parseAsync({
			data: J.data,
			path: J.path,
			parent: J
		})]).then(([Q, Y]) => W(Q, Y));
		else return W(this._def.left._parseSync({
			data: J.data,
			path: J.path,
			parent: J
		}), this._def.right._parseSync({
			data: J.data,
			path: J.path,
			parent: J
		}));
	}
};
y9.create = ($, X, J) => {
	return new y9({
		left: $,
		right: X,
		typeName: R.ZodIntersection,
		...o(J)
	});
};
var L4 = class L4 extends e {
	_parse($) {
		let { status: X, ctx: J } = this._processInputParams($);
		if (J.parsedType !== S.array) return k(J, {
			code: b.invalid_type,
			expected: S.array,
			received: J.parsedType
		}), c;
		if (J.data.length < this._def.items.length) return k(J, {
			code: b.too_small,
			minimum: this._def.items.length,
			inclusive: !0,
			exact: !1,
			type: "array"
		}), c;
		if (!this._def.rest && J.data.length > this._def.items.length) k(J, {
			code: b.too_big,
			maximum: this._def.items.length,
			inclusive: !0,
			exact: !1,
			type: "array"
		}), X.dirty();
		let Q = [...J.data].map((Y, z) => {
			let G = this._def.items[z] || this._def.rest;
			if (!G) return null;
			return G._parse(new m6(J, Y, J.path, z));
		}).filter((Y) => !!Y);
		if (J.common.async) return Promise.all(Q).then((Y) => {
			return i$.mergeArray(X, Y);
		});
		else return i$.mergeArray(X, Q);
	}
	get items() {
		return this._def.items;
	}
	rest($) {
		return new L4({
			...this._def,
			rest: $
		});
	}
};
L4.create = ($, X) => {
	if (!Array.isArray($)) throw Error("You must pass an array of schemas to z.tuple([ ... ])");
	return new L4({
		items: $,
		typeName: R.ZodTuple,
		rest: null,
		...o(X)
	});
};
var x7 = class x7 extends e {
	get keySchema() {
		return this._def.keyType;
	}
	get valueSchema() {
		return this._def.valueType;
	}
	_parse($) {
		let { status: X, ctx: J } = this._processInputParams($);
		if (J.parsedType !== S.object) return k(J, {
			code: b.invalid_type,
			expected: S.object,
			received: J.parsedType
		}), c;
		let W = [], Q = this._def.keyType, Y = this._def.valueType;
		for (let z in J.data) W.push({
			key: Q._parse(new m6(J, z, J.path, z)),
			value: Y._parse(new m6(J, J.data[z], J.path, z)),
			alwaysSet: z in J.data
		});
		if (J.common.async) return i$.mergeObjectAsync(X, W);
		else return i$.mergeObjectSync(X, W);
	}
	get element() {
		return this._def.valueType;
	}
	static create($, X, J) {
		if (X instanceof e) return new x7({
			keyType: $,
			valueType: X,
			typeName: R.ZodRecord,
			...o(J)
		});
		return new x7({
			keyType: F4.create(),
			valueType: $,
			typeName: R.ZodRecord,
			...o(X)
		});
	}
};
var T7 = class extends e {
	get keySchema() {
		return this._def.keyType;
	}
	get valueSchema() {
		return this._def.valueType;
	}
	_parse($) {
		let { status: X, ctx: J } = this._processInputParams($);
		if (J.parsedType !== S.map) return k(J, {
			code: b.invalid_type,
			expected: S.map,
			received: J.parsedType
		}), c;
		let W = this._def.keyType, Q = this._def.valueType, Y = [...J.data.entries()].map(([z, G], H) => {
			return {
				key: W._parse(new m6(J, z, J.path, [H, "key"])),
				value: Q._parse(new m6(J, G, J.path, [H, "value"]))
			};
		});
		if (J.common.async) {
			let z = /* @__PURE__ */ new Map();
			return Promise.resolve().then(async () => {
				for (let G of Y) {
					let H = await G.key, U = await G.value;
					if (H.status === "aborted" || U.status === "aborted") return c;
					if (H.status === "dirty" || U.status === "dirty") X.dirty();
					z.set(H.value, U.value);
				}
				return {
					status: X.value,
					value: z
				};
			});
		} else {
			let z = /* @__PURE__ */ new Map();
			for (let G of Y) {
				let { key: H, value: U } = G;
				if (H.status === "aborted" || U.status === "aborted") return c;
				if (H.status === "dirty" || U.status === "dirty") X.dirty();
				z.set(H.value, U.value);
			}
			return {
				status: X.value,
				value: z
			};
		}
	}
};
T7.create = ($, X, J) => {
	return new T7({
		valueType: X,
		keyType: $,
		typeName: R.ZodMap,
		...o(J)
	});
};
var T0 = class T0 extends e {
	_parse($) {
		let { status: X, ctx: J } = this._processInputParams($);
		if (J.parsedType !== S.set) return k(J, {
			code: b.invalid_type,
			expected: S.set,
			received: J.parsedType
		}), c;
		let W = this._def;
		if (W.minSize !== null) {
			if (J.data.size < W.minSize.value) k(J, {
				code: b.too_small,
				minimum: W.minSize.value,
				type: "set",
				inclusive: !0,
				exact: !1,
				message: W.minSize.message
			}), X.dirty();
		}
		if (W.maxSize !== null) {
			if (J.data.size > W.maxSize.value) k(J, {
				code: b.too_big,
				maximum: W.maxSize.value,
				type: "set",
				inclusive: !0,
				exact: !1,
				message: W.maxSize.message
			}), X.dirty();
		}
		let Q = this._def.valueType;
		function Y(G) {
			let H = /* @__PURE__ */ new Set();
			for (let U of G) {
				if (U.status === "aborted") return c;
				if (U.status === "dirty") X.dirty();
				H.add(U.value);
			}
			return {
				status: X.value,
				value: H
			};
		}
		let z = [...J.data.values()].map((G, H) => Q._parse(new m6(J, G, J.path, H)));
		if (J.common.async) return Promise.all(z).then((G) => Y(G));
		else return Y(z);
	}
	min($, X) {
		return new T0({
			...this._def,
			minSize: {
				value: $,
				message: y.toString(X)
			}
		});
	}
	max($, X) {
		return new T0({
			...this._def,
			maxSize: {
				value: $,
				message: y.toString(X)
			}
		});
	}
	size($, X) {
		return this.min($, X).max($, X);
	}
	nonempty($) {
		return this.min(1, $);
	}
};
T0.create = ($, X) => {
	return new T0({
		valueType: $,
		minSize: null,
		maxSize: null,
		typeName: R.ZodSet,
		...o(X)
	});
};
var k9 = class k9 extends e {
	constructor() {
		super(...arguments);
		this.validate = this.implement;
	}
	_parse($) {
		let { ctx: X } = this._processInputParams($);
		if (X.parsedType !== S.function) return k(X, {
			code: b.invalid_type,
			expected: S.function,
			received: X.parsedType
		}), c;
		function J(z, G) {
			return S7({
				data: z,
				path: X.path,
				errorMaps: [
					X.common.contextualErrorMap,
					X.schemaErrorMap,
					v9(),
					n4
				].filter((H) => !!H),
				issueData: {
					code: b.invalid_arguments,
					argumentsError: G
				}
			});
		}
		function W(z, G) {
			return S7({
				data: z,
				path: X.path,
				errorMaps: [
					X.common.contextualErrorMap,
					X.schemaErrorMap,
					v9(),
					n4
				].filter((H) => !!H),
				issueData: {
					code: b.invalid_return_type,
					returnTypeError: G
				}
			});
		}
		let Q = { errorMap: X.common.contextualErrorMap }, Y = X.data;
		if (this._def.returns instanceof f0) {
			let z = this;
			return t$(async function(...G) {
				let H = new j6([]), U = await z._def.args.parseAsync(G, Q).catch((N) => {
					throw H.addIssue(J(G, N)), H;
				}), K = await Reflect.apply(Y, this, U);
				return await z._def.returns._def.type.parseAsync(K, Q).catch((N) => {
					throw H.addIssue(W(K, N)), H;
				});
			});
		} else {
			let z = this;
			return t$(function(...G) {
				let H = z._def.args.safeParse(G, Q);
				if (!H.success) throw new j6([J(G, H.error)]);
				let U = Reflect.apply(Y, this, H.data), K = z._def.returns.safeParse(U, Q);
				if (!K.success) throw new j6([W(U, K.error)]);
				return K.data;
			});
		}
	}
	parameters() {
		return this._def.args;
	}
	returnType() {
		return this._def.returns;
	}
	args(...$) {
		return new k9({
			...this._def,
			args: L4.create($).rest(y1.create())
		});
	}
	returns($) {
		return new k9({
			...this._def,
			returns: $
		});
	}
	implement($) {
		return this.parse($);
	}
	strictImplement($) {
		return this.parse($);
	}
	static create($, X, J) {
		return new k9({
			args: $ ? $ : L4.create([]).rest(y1.create()),
			returns: X || y1.create(),
			typeName: R.ZodFunction,
			...o(J)
		});
	}
};
var g9 = class extends e {
	get schema() {
		return this._def.getter();
	}
	_parse($) {
		let { ctx: X } = this._processInputParams($);
		return this._def.getter()._parse({
			data: X.data,
			path: X.path,
			parent: X
		});
	}
};
g9.create = ($, X) => {
	return new g9({
		getter: $,
		typeName: R.ZodLazy,
		...o(X)
	});
};
var h9 = class extends e {
	_parse($) {
		if ($.data !== this._def.value) {
			let X = this._getOrReturnCtx($);
			return k(X, {
				received: X.data,
				code: b.invalid_literal,
				expected: this._def.value
			}), c;
		}
		return {
			status: "valid",
			value: $.data
		};
	}
	get value() {
		return this._def.value;
	}
};
h9.create = ($, X) => {
	return new h9({
		value: $,
		typeName: R.ZodLiteral,
		...o(X)
	});
};
function Cq($, X) {
	return new g1({
		values: $,
		typeName: R.ZodEnum,
		...o(X)
	});
}
var g1 = class g1 extends e {
	_parse($) {
		if (typeof $.data !== "string") {
			let X = this._getOrReturnCtx($), J = this._def.values;
			return k(X, {
				expected: X$.joinValues(J),
				received: X.parsedType,
				code: b.invalid_type
			}), c;
		}
		if (!this._cache) this._cache = new Set(this._def.values);
		if (!this._cache.has($.data)) {
			let X = this._getOrReturnCtx($), J = this._def.values;
			return k(X, {
				received: X.data,
				code: b.invalid_enum_value,
				options: J
			}), c;
		}
		return t$($.data);
	}
	get options() {
		return this._def.values;
	}
	get enum() {
		let $ = {};
		for (let X of this._def.values) $[X] = X;
		return $;
	}
	get Values() {
		let $ = {};
		for (let X of this._def.values) $[X] = X;
		return $;
	}
	get Enum() {
		let $ = {};
		for (let X of this._def.values) $[X] = X;
		return $;
	}
	extract($, X = this._def) {
		return g1.create($, {
			...this._def,
			...X
		});
	}
	exclude($, X = this._def) {
		return g1.create(this.options.filter((J) => !$.includes(J)), {
			...this._def,
			...X
		});
	}
};
g1.create = Cq;
var u9 = class extends e {
	_parse($) {
		let X = X$.getValidEnumValues(this._def.values), J = this._getOrReturnCtx($);
		if (J.parsedType !== S.string && J.parsedType !== S.number) {
			let W = X$.objectValues(X);
			return k(J, {
				expected: X$.joinValues(W),
				received: J.parsedType,
				code: b.invalid_type
			}), c;
		}
		if (!this._cache) this._cache = new Set(X$.getValidEnumValues(this._def.values));
		if (!this._cache.has($.data)) {
			let W = X$.objectValues(X);
			return k(J, {
				received: J.data,
				code: b.invalid_enum_value,
				options: W
			}), c;
		}
		return t$($.data);
	}
	get enum() {
		return this._def.values;
	}
};
u9.create = ($, X) => {
	return new u9({
		values: $,
		typeName: R.ZodNativeEnum,
		...o(X)
	});
};
var f0 = class extends e {
	unwrap() {
		return this._def.type;
	}
	_parse($) {
		let { ctx: X } = this._processInputParams($);
		if (X.parsedType !== S.promise && X.common.async === !1) return k(X, {
			code: b.invalid_type,
			expected: S.promise,
			received: X.parsedType
		}), c;
		return t$((X.parsedType === S.promise ? X.data : Promise.resolve(X.data)).then((W) => {
			return this._def.type.parseAsync(W, {
				path: X.path,
				errorMap: X.common.contextualErrorMap
			});
		}));
	}
};
f0.create = ($, X) => {
	return new f0({
		type: $,
		typeName: R.ZodPromise,
		...o(X)
	});
};
var $4 = class extends e {
	innerType() {
		return this._def.schema;
	}
	sourceType() {
		return this._def.schema._def.typeName === R.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
	}
	_parse($) {
		let { status: X, ctx: J } = this._processInputParams($), W = this._def.effect || null, Q = {
			addIssue: (Y) => {
				if (k(J, Y), Y.fatal) X.abort();
				else X.dirty();
			},
			get path() {
				return J.path;
			}
		};
		if (Q.addIssue = Q.addIssue.bind(Q), W.type === "preprocess") {
			let Y = W.transform(J.data, Q);
			if (J.common.async) return Promise.resolve(Y).then(async (z) => {
				if (X.value === "aborted") return c;
				let G = await this._def.schema._parseAsync({
					data: z,
					path: J.path,
					parent: J
				});
				if (G.status === "aborted") return c;
				if (G.status === "dirty") return C0(G.value);
				if (X.value === "dirty") return C0(G.value);
				return G;
			});
			else {
				if (X.value === "aborted") return c;
				let z = this._def.schema._parseSync({
					data: Y,
					path: J.path,
					parent: J
				});
				if (z.status === "aborted") return c;
				if (z.status === "dirty") return C0(z.value);
				if (X.value === "dirty") return C0(z.value);
				return z;
			}
		}
		if (W.type === "refinement") {
			let Y = (z) => {
				let G = W.refinement(z, Q);
				if (J.common.async) return Promise.resolve(G);
				if (G instanceof Promise) throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
				return z;
			};
			if (J.common.async === !1) {
				let z = this._def.schema._parseSync({
					data: J.data,
					path: J.path,
					parent: J
				});
				if (z.status === "aborted") return c;
				if (z.status === "dirty") X.dirty();
				return Y(z.value), {
					status: X.value,
					value: z.value
				};
			} else return this._def.schema._parseAsync({
				data: J.data,
				path: J.path,
				parent: J
			}).then((z) => {
				if (z.status === "aborted") return c;
				if (z.status === "dirty") X.dirty();
				return Y(z.value).then(() => {
					return {
						status: X.value,
						value: z.value
					};
				});
			});
		}
		if (W.type === "transform") if (J.common.async === !1) {
			let Y = this._def.schema._parseSync({
				data: J.data,
				path: J.path,
				parent: J
			});
			if (!f1(Y)) return c;
			let z = W.transform(Y.value, Q);
			if (z instanceof Promise) throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
			return {
				status: X.value,
				value: z
			};
		} else return this._def.schema._parseAsync({
			data: J.data,
			path: J.path,
			parent: J
		}).then((Y) => {
			if (!f1(Y)) return c;
			return Promise.resolve(W.transform(Y.value, Q)).then((z) => ({
				status: X.value,
				value: z
			}));
		});
		X$.assertNever(W);
	}
};
$4.create = ($, X, J) => {
	return new $4({
		schema: $,
		typeName: R.ZodEffects,
		effect: X,
		...o(J)
	});
};
$4.createWithPreprocess = ($, X, J) => {
	return new $4({
		schema: X,
		effect: {
			type: "preprocess",
			transform: $
		},
		typeName: R.ZodEffects,
		...o(J)
	});
};
var R6 = class extends e {
	_parse($) {
		if (this._getType($) === S.undefined) return t$(void 0);
		return this._def.innerType._parse($);
	}
	unwrap() {
		return this._def.innerType;
	}
};
R6.create = ($, X) => {
	return new R6({
		innerType: $,
		typeName: R.ZodOptional,
		...o(X)
	});
};
var r4 = class extends e {
	_parse($) {
		if (this._getType($) === S.null) return t$(null);
		return this._def.innerType._parse($);
	}
	unwrap() {
		return this._def.innerType;
	}
};
r4.create = ($, X) => {
	return new r4({
		innerType: $,
		typeName: R.ZodNullable,
		...o(X)
	});
};
var m9 = class extends e {
	_parse($) {
		let { ctx: X } = this._processInputParams($), J = X.data;
		if (X.parsedType === S.undefined) J = this._def.defaultValue();
		return this._def.innerType._parse({
			data: J,
			path: X.path,
			parent: X
		});
	}
	removeDefault() {
		return this._def.innerType;
	}
};
m9.create = ($, X) => {
	return new m9({
		innerType: $,
		typeName: R.ZodDefault,
		defaultValue: typeof X.default === "function" ? X.default : () => X.default,
		...o(X)
	});
};
var l9 = class extends e {
	_parse($) {
		let { ctx: X } = this._processInputParams($), J = {
			...X,
			common: {
				...X.common,
				issues: []
			}
		}, W = this._def.innerType._parse({
			data: J.data,
			path: J.path,
			parent: { ...J }
		});
		if (C9(W)) return W.then((Q) => {
			return {
				status: "valid",
				value: Q.status === "valid" ? Q.value : this._def.catchValue({
					get error() {
						return new j6(J.common.issues);
					},
					input: J.data
				})
			};
		});
		else return {
			status: "valid",
			value: W.status === "valid" ? W.value : this._def.catchValue({
				get error() {
					return new j6(J.common.issues);
				},
				input: J.data
			})
		};
	}
	removeCatch() {
		return this._def.innerType;
	}
};
l9.create = ($, X) => {
	return new l9({
		innerType: $,
		typeName: R.ZodCatch,
		catchValue: typeof X.catch === "function" ? X.catch : () => X.catch,
		...o(X)
	});
};
var f7 = class extends e {
	_parse($) {
		if (this._getType($) !== S.nan) {
			let J = this._getOrReturnCtx($);
			return k(J, {
				code: b.invalid_type,
				expected: S.nan,
				received: J.parsedType
			}), c;
		}
		return {
			status: "valid",
			value: $.data
		};
	}
};
f7.create = ($) => {
	return new f7({
		typeName: R.ZodNaN,
		...o($)
	});
};
var Y3 = class extends e {
	_parse($) {
		let { ctx: X } = this._processInputParams($), J = X.data;
		return this._def.type._parse({
			data: J,
			path: X.path,
			parent: X
		});
	}
	unwrap() {
		return this._def.type;
	}
};
var y7 = class y7 extends e {
	_parse($) {
		let { status: X, ctx: J } = this._processInputParams($);
		if (J.common.async) return (async () => {
			let Q = await this._def.in._parseAsync({
				data: J.data,
				path: J.path,
				parent: J
			});
			if (Q.status === "aborted") return c;
			if (Q.status === "dirty") return X.dirty(), C0(Q.value);
			else return this._def.out._parseAsync({
				data: Q.value,
				path: J.path,
				parent: J
			});
		})();
		else {
			let W = this._def.in._parseSync({
				data: J.data,
				path: J.path,
				parent: J
			});
			if (W.status === "aborted") return c;
			if (W.status === "dirty") return X.dirty(), {
				status: "dirty",
				value: W.value
			};
			else return this._def.out._parseSync({
				data: W.value,
				path: J.path,
				parent: J
			});
		}
	}
	static create($, X) {
		return new y7({
			in: $,
			out: X,
			typeName: R.ZodPipeline
		});
	}
};
var c9 = class extends e {
	_parse($) {
		let X = this._def.innerType._parse($), J = (W) => {
			if (f1(W)) W.value = Object.freeze(W.value);
			return W;
		};
		return C9(X) ? X.then((W) => J(W)) : J(X);
	}
	unwrap() {
		return this._def.innerType;
	}
};
c9.create = ($, X) => {
	return new c9({
		innerType: $,
		typeName: R.ZodReadonly,
		...o(X)
	});
};
E$.lazycreate;
var R;
(function($) {
	$.ZodString = "ZodString", $.ZodNumber = "ZodNumber", $.ZodNaN = "ZodNaN", $.ZodBigInt = "ZodBigInt", $.ZodBoolean = "ZodBoolean", $.ZodDate = "ZodDate", $.ZodSymbol = "ZodSymbol", $.ZodUndefined = "ZodUndefined", $.ZodNull = "ZodNull", $.ZodAny = "ZodAny", $.ZodUnknown = "ZodUnknown", $.ZodNever = "ZodNever", $.ZodVoid = "ZodVoid", $.ZodArray = "ZodArray", $.ZodObject = "ZodObject", $.ZodUnion = "ZodUnion", $.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", $.ZodIntersection = "ZodIntersection", $.ZodTuple = "ZodTuple", $.ZodRecord = "ZodRecord", $.ZodMap = "ZodMap", $.ZodSet = "ZodSet", $.ZodFunction = "ZodFunction", $.ZodLazy = "ZodLazy", $.ZodLiteral = "ZodLiteral", $.ZodEnum = "ZodEnum", $.ZodEffects = "ZodEffects", $.ZodNativeEnum = "ZodNativeEnum", $.ZodOptional = "ZodOptional", $.ZodNullable = "ZodNullable", $.ZodDefault = "ZodDefault", $.ZodCatch = "ZodCatch", $.ZodPromise = "ZodPromise", $.ZodBranded = "ZodBranded", $.ZodPipeline = "ZodPipeline", $.ZodReadonly = "ZodReadonly";
})(R || (R = {}));
F4.create;
_0.create;
f7.create;
x0.create;
v7.create;
_9.create;
C7.create;
x9.create;
T9.create;
k7.create;
y1.create;
j4.create;
_7.create;
e6.create;
E$.create;
E$.strictCreate;
f9.create;
W3.create;
y9.create;
L4.create;
x7.create;
T7.create;
T0.create;
k9.create;
g9.create;
h9.create;
g1.create;
u9.create;
f0.create;
$4.create;
R6.create;
r4.create;
$4.createWithPreprocess;
y7.create;
var l6 = {};
D1(l6, {
	version: () => UG,
	util: () => E,
	treeifyError: () => m7,
	toJSONSchema: () => s0,
	toDotPath: () => Tq,
	safeParseAsync: () => a4,
	safeParse: () => t4,
	registry: () => YX,
	regexes: () => s4,
	prettifyError: () => l7,
	parseAsync: () => l1,
	parse: () => m1,
	locales: () => n0,
	isValidJWT: () => eq,
	isValidBase64URL: () => sq,
	isValidBase64: () => BG,
	globalRegistry: () => G6,
	globalConfig: () => d9,
	function: () => A5,
	formatError: () => m0,
	flattenError: () => u0,
	config: () => v$,
	clone: () => n$,
	_xid: () => DX,
	_void: () => w5,
	_uuidv7: () => KX,
	_uuidv6: () => UX,
	_uuidv4: () => HX,
	_uuid: () => GX,
	_url: () => VX,
	_uppercase: () => vX,
	_unknown: () => p1,
	_union: () => dC,
	_undefined: () => K5,
	_ulid: () => qX,
	_uint64: () => H5,
	_uint32: () => W5,
	_tuple: () => wH,
	_trim: () => fX,
	_transform: () => eC,
	_toUpperCase: () => gX,
	_toLowerCase: () => yX,
	_templateLiteral: () => Hk,
	_symbol: () => U5,
	_success: () => Wk,
	_stringbool: () => L5,
	_stringFormat: () => M5,
	_string: () => aQ,
	_startsWith: () => kX,
	_size: () => PX,
	_set: () => oC,
	_safeParseAsync: () => i7,
	_safeParse: () => p7,
	_regex: () => EX,
	_refine: () => j5,
	_record: () => nC,
	_readonly: () => Gk,
	_property: () => OH,
	_promise: () => Kk,
	_positive: () => UH,
	_pipe: () => zk,
	_parseAsync: () => d7,
	_parse: () => c7,
	_overwrite: () => b4,
	_optional: () => $k,
	_number: () => eQ,
	_nullable: () => Xk,
	_null: () => V5,
	_normalize: () => TX,
	_nonpositive: () => VH,
	_nonoptional: () => Qk,
	_nonnegative: () => NH,
	_never: () => O5,
	_negative: () => KH,
	_nativeEnum: () => aC,
	_nanoid: () => OX,
	_nan: () => q5,
	_multipleOf: () => i1,
	_minSize: () => n1,
	_minLength: () => X1,
	_min: () => H6,
	_mime: () => xX,
	_maxSize: () => o0,
	_maxLength: () => t0,
	_max: () => P6,
	_map: () => rC,
	_lte: () => P6,
	_lt: () => I4,
	_lowercase: () => SX,
	_literal: () => sC,
	_length: () => a0,
	_lazy: () => Uk,
	_ksuid: () => FX,
	_jwt: () => RX,
	_isoTime: () => QH,
	_isoDuration: () => WH,
	_isoDateTime: () => XH,
	_isoDate: () => JH,
	_ipv6: () => LX,
	_ipv4: () => jX,
	_intersection: () => iC,
	_int64: () => G5,
	_int32: () => Q5,
	_int: () => $5,
	_includes: () => CX,
	_guid: () => r0,
	_gte: () => H6,
	_gt: () => Z4,
	_float64: () => J5,
	_float32: () => X5,
	_file: () => D5,
	_enum: () => tC,
	_endsWith: () => _X,
	_emoji: () => NX,
	_email: () => zX,
	_e164: () => bX,
	_discriminatedUnion: () => pC,
	_default: () => Jk,
	_date: () => B5,
	_custom: () => F5,
	_cuid2: () => BX,
	_cuid: () => wX,
	_coercedString: () => $H,
	_coercedNumber: () => YH,
	_coercedDate: () => HH,
	_coercedBoolean: () => zH,
	_coercedBigint: () => GH,
	_cidrv6: () => AX,
	_cidrv4: () => MX,
	_catch: () => Yk,
	_boolean: () => Y5,
	_bigint: () => z5,
	_base64url: () => ZX,
	_base64: () => IX,
	_array: () => hX,
	_any: () => N5,
	TimePrecision: () => sQ,
	NEVER: () => g7,
	JSONSchemaGenerator: () => I5,
	JSONSchema: () => QD,
	Doc: () => t7,
	$output: () => oQ,
	$input: () => tQ,
	$constructor: () => q,
	$brand: () => h7,
	$ZodXID: () => HQ,
	$ZodVoid: () => RQ,
	$ZodUnknown: () => d1,
	$ZodUnion: () => JX,
	$ZodUndefined: () => AQ,
	$ZodUUID: () => $Q,
	$ZodURL: () => JQ,
	$ZodULID: () => GQ,
	$ZodType: () => p,
	$ZodTuple: () => $1,
	$ZodTransform: () => p0,
	$ZodTemplateLiteral: () => pQ,
	$ZodSymbol: () => MQ,
	$ZodSuccess: () => mQ,
	$ZodStringFormat: () => K$,
	$ZodString: () => e4,
	$ZodSet: () => kQ,
	$ZodRegistry: () => WX,
	$ZodRecord: () => vQ,
	$ZodRealError: () => h0,
	$ZodReadonly: () => dQ,
	$ZodPromise: () => iQ,
	$ZodPrefault: () => hQ,
	$ZodPipe: () => i0,
	$ZodOptional: () => fQ,
	$ZodObject: () => XX,
	$ZodNumberFormat: () => jQ,
	$ZodNumber: () => e9,
	$ZodNullable: () => yQ,
	$ZodNull: () => IQ,
	$ZodNonOptional: () => uQ,
	$ZodNever: () => bQ,
	$ZodNanoID: () => WQ,
	$ZodNaN: () => cQ,
	$ZodMap: () => CQ,
	$ZodLiteral: () => xQ,
	$ZodLazy: () => nQ,
	$ZodKSUID: () => UQ,
	$ZodJWT: () => DQ,
	$ZodIntersection: () => SQ,
	$ZodISOTime: () => OG,
	$ZodISODuration: () => wG,
	$ZodISODateTime: () => VG,
	$ZodISODate: () => NG,
	$ZodIPv6: () => VQ,
	$ZodIPv4: () => KQ,
	$ZodGUID: () => e7,
	$ZodFunction: () => BH,
	$ZodFile: () => TQ,
	$ZodError: () => s9,
	$ZodEnum: () => _Q,
	$ZodEmoji: () => QQ,
	$ZodEmail: () => XQ,
	$ZodE164: () => qQ,
	$ZodDiscriminatedUnion: () => EQ,
	$ZodDefault: () => gQ,
	$ZodDate: () => PQ,
	$ZodCustomStringFormat: () => FQ,
	$ZodCustom: () => rQ,
	$ZodCheckUpperCase: () => JG,
	$ZodCheckStringFormat: () => l0,
	$ZodCheckStartsWith: () => WG,
	$ZodCheckSizeEquals: () => t3,
	$ZodCheckRegex: () => $G,
	$ZodCheckProperty: () => zG,
	$ZodCheckOverwrite: () => HG,
	$ZodCheckNumberFormat: () => i3,
	$ZodCheckMultipleOf: () => p3,
	$ZodCheckMinSize: () => o3,
	$ZodCheckMinLength: () => s3,
	$ZodCheckMimeType: () => GG,
	$ZodCheckMaxSize: () => r3,
	$ZodCheckMaxLength: () => a3,
	$ZodCheckLowerCase: () => XG,
	$ZodCheckLessThan: () => r7,
	$ZodCheckLengthEquals: () => e3,
	$ZodCheckIncludes: () => QG,
	$ZodCheckGreaterThan: () => o7,
	$ZodCheckEndsWith: () => YG,
	$ZodCheckBigIntFormat: () => n3,
	$ZodCheck: () => I$,
	$ZodCatch: () => lQ,
	$ZodCUID2: () => zQ,
	$ZodCUID: () => YQ,
	$ZodCIDRv6: () => OQ,
	$ZodCIDRv4: () => NQ,
	$ZodBoolean: () => c0,
	$ZodBigIntFormat: () => LQ,
	$ZodBigInt: () => $X,
	$ZodBase64URL: () => BQ,
	$ZodBase64: () => wQ,
	$ZodAsyncError: () => M4,
	$ZodArray: () => d0,
	$ZodAny: () => ZQ
});
var g7 = Object.freeze({ status: "aborted" });
function q($, X, J) {
	function W(G, H) {
		var U;
		Object.defineProperty(G, "_zod", {
			value: G._zod ?? {},
			enumerable: !1
		}), (U = G._zod).traits ?? (U.traits = /* @__PURE__ */ new Set()), G._zod.traits.add($), X(G, H);
		for (let K in z.prototype) if (!(K in G)) Object.defineProperty(G, K, { value: z.prototype[K].bind(G) });
		G._zod.constr = z, G._zod.def = H;
	}
	let Q = J?.Parent ?? Object;
	class Y extends Q {}
	Object.defineProperty(Y, "name", { value: $ });
	function z(G) {
		var H;
		let U = J?.Parent ? new Y() : this;
		W(U, G), (H = U._zod).deferred ?? (H.deferred = []);
		for (let K of U._zod.deferred) K();
		return U;
	}
	return Object.defineProperty(z, "init", { value: W }), Object.defineProperty(z, Symbol.hasInstance, { value: (G) => {
		if (J?.Parent && G instanceof J.Parent) return !0;
		return G?._zod?.traits?.has($);
	} }), Object.defineProperty(z, "name", { value: $ }), z;
}
var h7 = Symbol("zod_brand");
var M4 = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
};
var d9 = {};
function v$($) {
	if ($) Object.assign(d9, $);
	return d9;
}
var E = {};
D1(E, {
	unwrapMessage: () => p9,
	stringifyPrimitive: () => v,
	required: () => cv,
	randomString: () => xv,
	propertyKeyTypes: () => o9,
	promiseAllObject: () => _v,
	primitiveTypes: () => V3,
	prefixIssues: () => z6,
	pick: () => gv,
	partial: () => lv,
	optionalKeys: () => N3,
	omit: () => hv,
	numKeys: () => Tv,
	nullish: () => o4,
	normalizeParams: () => P,
	merge: () => mv,
	jsonStringifyReplacer: () => G3,
	joinValues: () => A,
	issue: () => B3,
	isPlainObject: () => g0,
	isObject: () => y0,
	getSizableOrigin: () => t9,
	getParsedType: () => fv,
	getLengthableOrigin: () => a9,
	getEnumValues: () => i9,
	getElementAtPath: () => kv,
	floatSafeRemainder: () => H3,
	finalizeIssue: () => L6,
	extend: () => uv,
	escapeRegex: () => A4,
	esc: () => h1,
	defineLazy: () => G$,
	createTransparentProxy: () => yv,
	clone: () => n$,
	cleanRegex: () => r9,
	cleanEnum: () => dv,
	captureStackTrace: () => u7,
	cached: () => n9,
	assignProp: () => U3,
	assertNotEqual: () => Ev,
	assertNever: () => vv,
	assertIs: () => Sv,
	assertEqual: () => Pv,
	assert: () => Cv,
	allowsEval: () => K3,
	aborted: () => u1,
	NUMBER_FORMAT_RANGES: () => O3,
	Class: () => _q,
	BIGINT_FORMAT_RANGES: () => w3
});
function Pv($) {
	return $;
}
function Ev($) {
	return $;
}
function Sv($) {}
function vv($) {
	throw Error();
}
function Cv($) {}
function i9($) {
	let X = Object.values($).filter((W) => typeof W === "number");
	return Object.entries($).filter(([W, Q]) => X.indexOf(+W) === -1).map(([W, Q]) => Q);
}
function A($, X = "|") {
	return $.map((J) => v(J)).join(X);
}
function G3($, X) {
	if (typeof X === "bigint") return X.toString();
	return X;
}
function n9($) {
	return { get value() {
		{
			let J = $();
			return Object.defineProperty(this, "value", { value: J }), J;
		}
		throw Error("cached value already set");
	} };
}
function o4($) {
	return $ === null || $ === void 0;
}
function r9($) {
	let X = $.startsWith("^") ? 1 : 0, J = $.endsWith("$") ? $.length - 1 : $.length;
	return $.slice(X, J);
}
function H3($, X) {
	let J = ($.toString().split(".")[1] || "").length, W = (X.toString().split(".")[1] || "").length, Q = J > W ? J : W;
	return Number.parseInt($.toFixed(Q).replace(".", "")) % Number.parseInt(X.toFixed(Q).replace(".", "")) / 10 ** Q;
}
function G$($, X, J) {
	Object.defineProperty($, X, {
		get() {
			{
				let Q = J();
				return $[X] = Q, Q;
			}
			throw Error("cached value already set");
		},
		set(Q) {
			Object.defineProperty($, X, { value: Q });
		},
		configurable: !0
	});
}
function U3($, X, J) {
	Object.defineProperty($, X, {
		value: J,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function kv($, X) {
	if (!X) return $;
	return X.reduce((J, W) => J?.[W], $);
}
function _v($) {
	let X = Object.keys($), J = X.map((W) => $[W]);
	return Promise.all(J).then((W) => {
		let Q = {};
		for (let Y = 0; Y < X.length; Y++) Q[X[Y]] = W[Y];
		return Q;
	});
}
function xv($ = 10) {
	let J = "";
	for (let W = 0; W < $; W++) J += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
	return J;
}
function h1($) {
	return JSON.stringify($);
}
var u7 = Error.captureStackTrace ? Error.captureStackTrace : (...$) => {};
function y0($) {
	return typeof $ === "object" && $ !== null && !Array.isArray($);
}
var K3 = n9(() => {
	if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return new Function(""), !0;
	} catch ($) {
		return !1;
	}
});
function g0($) {
	if (y0($) === !1) return !1;
	let X = $.constructor;
	if (X === void 0) return !0;
	let J = X.prototype;
	if (y0(J) === !1) return !1;
	if (Object.prototype.hasOwnProperty.call(J, "isPrototypeOf") === !1) return !1;
	return !0;
}
function Tv($) {
	let X = 0;
	for (let J in $) if (Object.prototype.hasOwnProperty.call($, J)) X++;
	return X;
}
var fv = ($) => {
	let X = typeof $;
	switch (X) {
		case "undefined": return "undefined";
		case "string": return "string";
		case "number": return Number.isNaN($) ? "nan" : "number";
		case "boolean": return "boolean";
		case "function": return "function";
		case "bigint": return "bigint";
		case "symbol": return "symbol";
		case "object":
			if (Array.isArray($)) return "array";
			if ($ === null) return "null";
			if ($.then && typeof $.then === "function" && $.catch && typeof $.catch === "function") return "promise";
			if (typeof Map < "u" && $ instanceof Map) return "map";
			if (typeof Set < "u" && $ instanceof Set) return "set";
			if (typeof Date < "u" && $ instanceof Date) return "date";
			if (typeof File < "u" && $ instanceof File) return "file";
			return "object";
		default: throw Error(`Unknown data type: ${X}`);
	}
}, o9 = new Set([
	"string",
	"number",
	"symbol"
]), V3 = new Set([
	"string",
	"number",
	"bigint",
	"boolean",
	"symbol",
	"undefined"
]);
function A4($) {
	return $.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function n$($, X, J) {
	let W = new $._zod.constr(X ?? $._zod.def);
	if (!X || J?.parent) W._zod.parent = $;
	return W;
}
function P($) {
	let X = $;
	if (!X) return {};
	if (typeof X === "string") return { error: () => X };
	if (X?.message !== void 0) {
		if (X?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		X.error = X.message;
	}
	if (delete X.message, typeof X.error === "string") return {
		...X,
		error: () => X.error
	};
	return X;
}
function yv($) {
	let X;
	return new Proxy({}, {
		get(J, W, Q) {
			return X ?? (X = $()), Reflect.get(X, W, Q);
		},
		set(J, W, Q, Y) {
			return X ?? (X = $()), Reflect.set(X, W, Q, Y);
		},
		has(J, W) {
			return X ?? (X = $()), Reflect.has(X, W);
		},
		deleteProperty(J, W) {
			return X ?? (X = $()), Reflect.deleteProperty(X, W);
		},
		ownKeys(J) {
			return X ?? (X = $()), Reflect.ownKeys(X);
		},
		getOwnPropertyDescriptor(J, W) {
			return X ?? (X = $()), Reflect.getOwnPropertyDescriptor(X, W);
		},
		defineProperty(J, W, Q) {
			return X ?? (X = $()), Reflect.defineProperty(X, W, Q);
		}
	});
}
function v($) {
	if (typeof $ === "bigint") return $.toString() + "n";
	if (typeof $ === "string") return `"${$}"`;
	return `${$}`;
}
function N3($) {
	return Object.keys($).filter((X) => {
		return $[X]._zod.optin === "optional" && $[X]._zod.optout === "optional";
	});
}
var O3 = {
	safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, w3 = {
	int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
	uint64: [BigInt(0), BigInt("18446744073709551615")]
};
function gv($, X) {
	let J = {}, W = $._zod.def;
	for (let Q in X) {
		if (!(Q in W.shape)) throw Error(`Unrecognized key: "${Q}"`);
		if (!X[Q]) continue;
		J[Q] = W.shape[Q];
	}
	return n$($, {
		...$._zod.def,
		shape: J,
		checks: []
	});
}
function hv($, X) {
	let J = { ...$._zod.def.shape }, W = $._zod.def;
	for (let Q in X) {
		if (!(Q in W.shape)) throw Error(`Unrecognized key: "${Q}"`);
		if (!X[Q]) continue;
		delete J[Q];
	}
	return n$($, {
		...$._zod.def,
		shape: J,
		checks: []
	});
}
function uv($, X) {
	if (!g0(X)) throw Error("Invalid input to extend: expected a plain object");
	return n$($, {
		...$._zod.def,
		get shape() {
			let W = {
				...$._zod.def.shape,
				...X
			};
			return U3(this, "shape", W), W;
		},
		checks: []
	});
}
function mv($, X) {
	return n$($, {
		...$._zod.def,
		get shape() {
			let J = {
				...$._zod.def.shape,
				...X._zod.def.shape
			};
			return U3(this, "shape", J), J;
		},
		catchall: X._zod.def.catchall,
		checks: []
	});
}
function lv($, X, J) {
	let W = X._zod.def.shape, Q = { ...W };
	if (J) for (let Y in J) {
		if (!(Y in W)) throw Error(`Unrecognized key: "${Y}"`);
		if (!J[Y]) continue;
		Q[Y] = $ ? new $({
			type: "optional",
			innerType: W[Y]
		}) : W[Y];
	}
	else for (let Y in W) Q[Y] = $ ? new $({
		type: "optional",
		innerType: W[Y]
	}) : W[Y];
	return n$(X, {
		...X._zod.def,
		shape: Q,
		checks: []
	});
}
function cv($, X, J) {
	let W = X._zod.def.shape, Q = { ...W };
	if (J) for (let Y in J) {
		if (!(Y in Q)) throw Error(`Unrecognized key: "${Y}"`);
		if (!J[Y]) continue;
		Q[Y] = new $({
			type: "nonoptional",
			innerType: W[Y]
		});
	}
	else for (let Y in W) Q[Y] = new $({
		type: "nonoptional",
		innerType: W[Y]
	});
	return n$(X, {
		...X._zod.def,
		shape: Q,
		checks: []
	});
}
function u1($, X = 0) {
	for (let J = X; J < $.issues.length; J++) if ($.issues[J]?.continue !== !0) return !0;
	return !1;
}
function z6($, X) {
	return X.map((J) => {
		var W;
		return (W = J).path ?? (W.path = []), J.path.unshift($), J;
	});
}
function p9($) {
	return typeof $ === "string" ? $ : $?.message;
}
function L6($, X, J) {
	let W = {
		...$,
		path: $.path ?? []
	};
	if (!$.message) W.message = p9($.inst?._zod.def?.error?.($)) ?? p9(X?.error?.($)) ?? p9(J.customError?.($)) ?? p9(J.localeError?.($)) ?? "Invalid input";
	if (delete W.inst, delete W.continue, !X?.reportInput) delete W.input;
	return W;
}
function t9($) {
	if ($ instanceof Set) return "set";
	if ($ instanceof Map) return "map";
	if ($ instanceof File) return "file";
	return "unknown";
}
function a9($) {
	if (Array.isArray($)) return "array";
	if (typeof $ === "string") return "string";
	return "unknown";
}
function B3(...$) {
	let [X, J, W] = $;
	if (typeof X === "string") return {
		message: X,
		code: "custom",
		input: J,
		inst: W
	};
	return { ...X };
}
function dv($) {
	return Object.entries($).filter(([X, J]) => {
		return Number.isNaN(Number.parseInt(X, 10));
	}).map((X) => X[1]);
}
var _q = class {
	constructor(...$) {}
};
var xq = ($, X) => {
	$.name = "$ZodError", Object.defineProperty($, "_zod", {
		value: $._zod,
		enumerable: !1
	}), Object.defineProperty($, "issues", {
		value: X,
		enumerable: !1
	}), Object.defineProperty($, "message", {
		get() {
			return JSON.stringify(X, G3, 2);
		},
		enumerable: !0
	});
}, s9 = q("$ZodError", xq), h0 = q("$ZodError", xq, { Parent: Error });
function u0($, X = (J) => J.message) {
	let J = {}, W = [];
	for (let Q of $.issues) if (Q.path.length > 0) J[Q.path[0]] = J[Q.path[0]] || [], J[Q.path[0]].push(X(Q));
	else W.push(X(Q));
	return {
		formErrors: W,
		fieldErrors: J
	};
}
function m0($, X) {
	let J = X || function(Y) {
		return Y.message;
	}, W = { _errors: [] }, Q = (Y) => {
		for (let z of Y.issues) if (z.code === "invalid_union" && z.errors.length) z.errors.map((G) => Q({ issues: G }));
		else if (z.code === "invalid_key") Q({ issues: z.issues });
		else if (z.code === "invalid_element") Q({ issues: z.issues });
		else if (z.path.length === 0) W._errors.push(J(z));
		else {
			let G = W, H = 0;
			while (H < z.path.length) {
				let U = z.path[H];
				if (H !== z.path.length - 1) G[U] = G[U] || { _errors: [] };
				else G[U] = G[U] || { _errors: [] }, G[U]._errors.push(J(z));
				G = G[U], H++;
			}
		}
	};
	return Q($), W;
}
function m7($, X) {
	let J = X || function(Y) {
		return Y.message;
	}, W = { errors: [] }, Q = (Y, z = []) => {
		var G, H;
		for (let U of Y.issues) if (U.code === "invalid_union" && U.errors.length) U.errors.map((K) => Q({ issues: K }, U.path));
		else if (U.code === "invalid_key") Q({ issues: U.issues }, U.path);
		else if (U.code === "invalid_element") Q({ issues: U.issues }, U.path);
		else {
			let K = [...z, ...U.path];
			if (K.length === 0) {
				W.errors.push(J(U));
				continue;
			}
			let V = W, N = 0;
			while (N < K.length) {
				let O = K[N], w = N === K.length - 1;
				if (typeof O === "string") V.properties ?? (V.properties = {}), (G = V.properties)[O] ?? (G[O] = { errors: [] }), V = V.properties[O];
				else V.items ?? (V.items = []), (H = V.items)[O] ?? (H[O] = { errors: [] }), V = V.items[O];
				if (w) V.errors.push(J(U));
				N++;
			}
		}
	};
	return Q($), W;
}
function Tq($) {
	let X = [];
	for (let J of $) if (typeof J === "number") X.push(`[${J}]`);
	else if (typeof J === "symbol") X.push(`[${JSON.stringify(String(J))}]`);
	else if (/[^\w$]/.test(J)) X.push(`[${JSON.stringify(J)}]`);
	else {
		if (X.length) X.push(".");
		X.push(J);
	}
	return X.join("");
}
function l7($) {
	let X = [], J = [...$.issues].sort((W, Q) => W.path.length - Q.path.length);
	for (let W of J) if (X.push(`✖ ${W.message}`), W.path?.length) X.push(`  → at ${Tq(W.path)}`);
	return X.join(`
`);
}
var c7 = ($) => (X, J, W, Q) => {
	let Y = W ? Object.assign(W, { async: !1 }) : { async: !1 }, z = X._zod.run({
		value: J,
		issues: []
	}, Y);
	if (z instanceof Promise) throw new M4();
	if (z.issues.length) {
		let G = new (Q?.Err ?? $)(z.issues.map((H) => L6(H, Y, v$())));
		throw u7(G, Q?.callee), G;
	}
	return z.value;
}, m1 = c7(h0), d7 = ($) => async (X, J, W, Q) => {
	let Y = W ? Object.assign(W, { async: !0 }) : { async: !0 }, z = X._zod.run({
		value: J,
		issues: []
	}, Y);
	if (z instanceof Promise) z = await z;
	if (z.issues.length) {
		let G = new (Q?.Err ?? $)(z.issues.map((H) => L6(H, Y, v$())));
		throw u7(G, Q?.callee), G;
	}
	return z.value;
}, l1 = d7(h0), p7 = ($) => (X, J, W) => {
	let Q = W ? {
		...W,
		async: !1
	} : { async: !1 }, Y = X._zod.run({
		value: J,
		issues: []
	}, Q);
	if (Y instanceof Promise) throw new M4();
	return Y.issues.length ? {
		success: !1,
		error: new ($ ?? s9)(Y.issues.map((z) => L6(z, Q, v$())))
	} : {
		success: !0,
		data: Y.value
	};
}, t4 = p7(h0), i7 = ($) => async (X, J, W) => {
	let Q = W ? Object.assign(W, { async: !0 }) : { async: !0 }, Y = X._zod.run({
		value: J,
		issues: []
	}, Q);
	if (Y instanceof Promise) Y = await Y;
	return Y.issues.length ? {
		success: !1,
		error: new $(Y.issues.map((z) => L6(z, Q, v$())))
	} : {
		success: !0,
		data: Y.value
	};
}, a4 = i7(h0);
var s4 = {};
D1(s4, {
	xid: () => j3,
	uuid7: () => ov,
	uuid6: () => rv,
	uuid4: () => nv,
	uuid: () => c1,
	uppercase: () => d3,
	unicodeEmail: () => sv,
	undefined: () => l3,
	ulid: () => F3,
	time: () => x3,
	string: () => f3,
	rfc5322Email: () => av,
	number: () => h3,
	null: () => m3,
	nanoid: () => M3,
	lowercase: () => c3,
	ksuid: () => L3,
	ipv6: () => P3,
	ipv4: () => R3,
	integer: () => g3,
	html5Email: () => tv,
	hostname: () => C3,
	guid: () => I3,
	extendedDuration: () => iv,
	emoji: () => b3,
	email: () => Z3,
	e164: () => k3,
	duration: () => A3,
	domain: () => XC,
	datetime: () => T3,
	date: () => _3,
	cuid2: () => D3,
	cuid: () => q3,
	cidrv6: () => S3,
	cidrv4: () => E3,
	browserEmail: () => ev,
	boolean: () => u3,
	bigint: () => y3,
	base64url: () => n7,
	base64: () => v3,
	_emoji: () => $C
});
var q3 = /^[cC][^\s-]{8,}$/, D3 = /^[0-9a-z]+$/, F3 = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, j3 = /^[0-9a-vA-V]{20}$/, L3 = /^[A-Za-z0-9]{27}$/, M3 = /^[a-zA-Z0-9_-]{21}$/, A3 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, iv = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, I3 = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, c1 = ($) => {
	if (!$) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${$}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
}, nv = c1(4), rv = c1(6), ov = c1(7), Z3 = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, tv = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, av = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, sv = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u, ev = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, $C = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function b3() {
	return /* @__PURE__ */ new RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
}
var R3 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, P3 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/, E3 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, S3 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, v3 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, n7 = /^[A-Za-z0-9_-]*$/, C3 = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/, XC = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, k3 = /^\+(?:[0-9]){6,14}[0-9]$/, fq = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", _3 = new RegExp(`^${fq}$`);
function yq($) {
	return typeof $.precision === "number" ? $.precision === -1 ? "(?:[01]\\d|2[0-3]):[0-5]\\d" : $.precision === 0 ? "(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d" : `(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{${$.precision}}` : "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?";
}
function x3($) {
	return new RegExp(`^${yq($)}$`);
}
function T3($) {
	let X = yq({ precision: $.precision }), J = ["Z"];
	if ($.local) J.push("");
	if ($.offset) J.push("([+-]\\d{2}:\\d{2})");
	let W = `${X}(?:${J.join("|")})`;
	return new RegExp(`^${fq}T(?:${W})$`);
}
var f3 = ($) => {
	let X = $ ? `[\\s\\S]{${$?.minimum ?? 0},${$?.maximum ?? ""}}` : "[\\s\\S]*";
	return new RegExp(`^${X}$`);
}, y3 = /^\d+n?$/, g3 = /^\d+$/, h3 = /^-?\d+(?:\.\d+)?/i, u3 = /true|false/i, m3 = /null/i;
var l3 = /undefined/i;
var c3 = /^[^A-Z]*$/, d3 = /^[^a-z]*$/;
var I$ = q("$ZodCheck", ($, X) => {
	var J;
	$._zod ?? ($._zod = {}), $._zod.def = X, (J = $._zod).onattach ?? (J.onattach = []);
}), hq = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, r7 = q("$ZodCheckLessThan", ($, X) => {
	I$.init($, X);
	let J = hq[typeof X.value];
	$._zod.onattach.push((W) => {
		let Q = W._zod.bag, Y = (X.inclusive ? Q.maximum : Q.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
		if (X.value < Y) if (X.inclusive) Q.maximum = X.value;
		else Q.exclusiveMaximum = X.value;
	}), $._zod.check = (W) => {
		if (X.inclusive ? W.value <= X.value : W.value < X.value) return;
		W.issues.push({
			origin: J,
			code: "too_big",
			maximum: X.value,
			input: W.value,
			inclusive: X.inclusive,
			inst: $,
			continue: !X.abort
		});
	};
}), o7 = q("$ZodCheckGreaterThan", ($, X) => {
	I$.init($, X);
	let J = hq[typeof X.value];
	$._zod.onattach.push((W) => {
		let Q = W._zod.bag, Y = (X.inclusive ? Q.minimum : Q.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
		if (X.value > Y) if (X.inclusive) Q.minimum = X.value;
		else Q.exclusiveMinimum = X.value;
	}), $._zod.check = (W) => {
		if (X.inclusive ? W.value >= X.value : W.value > X.value) return;
		W.issues.push({
			origin: J,
			code: "too_small",
			minimum: X.value,
			input: W.value,
			inclusive: X.inclusive,
			inst: $,
			continue: !X.abort
		});
	};
}), p3 = q("$ZodCheckMultipleOf", ($, X) => {
	I$.init($, X), $._zod.onattach.push((J) => {
		var W;
		(W = J._zod.bag).multipleOf ?? (W.multipleOf = X.value);
	}), $._zod.check = (J) => {
		if (typeof J.value !== typeof X.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		if (typeof J.value === "bigint" ? J.value % X.value === BigInt(0) : H3(J.value, X.value) === 0) return;
		J.issues.push({
			origin: typeof J.value,
			code: "not_multiple_of",
			divisor: X.value,
			input: J.value,
			inst: $,
			continue: !X.abort
		});
	};
}), i3 = q("$ZodCheckNumberFormat", ($, X) => {
	I$.init($, X), X.format = X.format || "float64";
	let J = X.format?.includes("int"), W = J ? "int" : "number", [Q, Y] = O3[X.format];
	$._zod.onattach.push((z) => {
		let G = z._zod.bag;
		if (G.format = X.format, G.minimum = Q, G.maximum = Y, J) G.pattern = g3;
	}), $._zod.check = (z) => {
		let G = z.value;
		if (J) {
			if (!Number.isInteger(G)) {
				z.issues.push({
					expected: W,
					format: X.format,
					code: "invalid_type",
					input: G,
					inst: $
				});
				return;
			}
			if (!Number.isSafeInteger(G)) {
				if (G > 0) z.issues.push({
					input: G,
					code: "too_big",
					maximum: Number.MAX_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst: $,
					origin: W,
					continue: !X.abort
				});
				else z.issues.push({
					input: G,
					code: "too_small",
					minimum: Number.MIN_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst: $,
					origin: W,
					continue: !X.abort
				});
				return;
			}
		}
		if (G < Q) z.issues.push({
			origin: "number",
			input: G,
			code: "too_small",
			minimum: Q,
			inclusive: !0,
			inst: $,
			continue: !X.abort
		});
		if (G > Y) z.issues.push({
			origin: "number",
			input: G,
			code: "too_big",
			maximum: Y,
			inst: $
		});
	};
}), n3 = q("$ZodCheckBigIntFormat", ($, X) => {
	I$.init($, X);
	let [J, W] = w3[X.format];
	$._zod.onattach.push((Q) => {
		let Y = Q._zod.bag;
		Y.format = X.format, Y.minimum = J, Y.maximum = W;
	}), $._zod.check = (Q) => {
		let Y = Q.value;
		if (Y < J) Q.issues.push({
			origin: "bigint",
			input: Y,
			code: "too_small",
			minimum: J,
			inclusive: !0,
			inst: $,
			continue: !X.abort
		});
		if (Y > W) Q.issues.push({
			origin: "bigint",
			input: Y,
			code: "too_big",
			maximum: W,
			inst: $
		});
	};
}), r3 = q("$ZodCheckMaxSize", ($, X) => {
	I$.init($, X), $._zod.when = (J) => {
		let W = J.value;
		return !o4(W) && W.size !== void 0;
	}, $._zod.onattach.push((J) => {
		let W = J._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
		if (X.maximum < W) J._zod.bag.maximum = X.maximum;
	}), $._zod.check = (J) => {
		let W = J.value;
		if (W.size <= X.maximum) return;
		J.issues.push({
			origin: t9(W),
			code: "too_big",
			maximum: X.maximum,
			input: W,
			inst: $,
			continue: !X.abort
		});
	};
}), o3 = q("$ZodCheckMinSize", ($, X) => {
	I$.init($, X), $._zod.when = (J) => {
		let W = J.value;
		return !o4(W) && W.size !== void 0;
	}, $._zod.onattach.push((J) => {
		let W = J._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
		if (X.minimum > W) J._zod.bag.minimum = X.minimum;
	}), $._zod.check = (J) => {
		let W = J.value;
		if (W.size >= X.minimum) return;
		J.issues.push({
			origin: t9(W),
			code: "too_small",
			minimum: X.minimum,
			input: W,
			inst: $,
			continue: !X.abort
		});
	};
}), t3 = q("$ZodCheckSizeEquals", ($, X) => {
	I$.init($, X), $._zod.when = (J) => {
		let W = J.value;
		return !o4(W) && W.size !== void 0;
	}, $._zod.onattach.push((J) => {
		let W = J._zod.bag;
		W.minimum = X.size, W.maximum = X.size, W.size = X.size;
	}), $._zod.check = (J) => {
		let W = J.value, Q = W.size;
		if (Q === X.size) return;
		let Y = Q > X.size;
		J.issues.push({
			origin: t9(W),
			...Y ? {
				code: "too_big",
				maximum: X.size
			} : {
				code: "too_small",
				minimum: X.size
			},
			inclusive: !0,
			exact: !0,
			input: J.value,
			inst: $,
			continue: !X.abort
		});
	};
}), a3 = q("$ZodCheckMaxLength", ($, X) => {
	I$.init($, X), $._zod.when = (J) => {
		let W = J.value;
		return !o4(W) && W.length !== void 0;
	}, $._zod.onattach.push((J) => {
		let W = J._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
		if (X.maximum < W) J._zod.bag.maximum = X.maximum;
	}), $._zod.check = (J) => {
		let W = J.value;
		if (W.length <= X.maximum) return;
		let Y = a9(W);
		J.issues.push({
			origin: Y,
			code: "too_big",
			maximum: X.maximum,
			inclusive: !0,
			input: W,
			inst: $,
			continue: !X.abort
		});
	};
}), s3 = q("$ZodCheckMinLength", ($, X) => {
	I$.init($, X), $._zod.when = (J) => {
		let W = J.value;
		return !o4(W) && W.length !== void 0;
	}, $._zod.onattach.push((J) => {
		let W = J._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
		if (X.minimum > W) J._zod.bag.minimum = X.minimum;
	}), $._zod.check = (J) => {
		let W = J.value;
		if (W.length >= X.minimum) return;
		let Y = a9(W);
		J.issues.push({
			origin: Y,
			code: "too_small",
			minimum: X.minimum,
			inclusive: !0,
			input: W,
			inst: $,
			continue: !X.abort
		});
	};
}), e3 = q("$ZodCheckLengthEquals", ($, X) => {
	I$.init($, X), $._zod.when = (J) => {
		let W = J.value;
		return !o4(W) && W.length !== void 0;
	}, $._zod.onattach.push((J) => {
		let W = J._zod.bag;
		W.minimum = X.length, W.maximum = X.length, W.length = X.length;
	}), $._zod.check = (J) => {
		let W = J.value, Q = W.length;
		if (Q === X.length) return;
		let Y = a9(W), z = Q > X.length;
		J.issues.push({
			origin: Y,
			...z ? {
				code: "too_big",
				maximum: X.length
			} : {
				code: "too_small",
				minimum: X.length
			},
			inclusive: !0,
			exact: !0,
			input: J.value,
			inst: $,
			continue: !X.abort
		});
	};
}), l0 = q("$ZodCheckStringFormat", ($, X) => {
	var J, W;
	if (I$.init($, X), $._zod.onattach.push((Q) => {
		let Y = Q._zod.bag;
		if (Y.format = X.format, X.pattern) Y.patterns ?? (Y.patterns = /* @__PURE__ */ new Set()), Y.patterns.add(X.pattern);
	}), X.pattern) (J = $._zod).check ?? (J.check = (Q) => {
		if (X.pattern.lastIndex = 0, X.pattern.test(Q.value)) return;
		Q.issues.push({
			origin: "string",
			code: "invalid_format",
			format: X.format,
			input: Q.value,
			...X.pattern ? { pattern: X.pattern.toString() } : {},
			inst: $,
			continue: !X.abort
		});
	});
	else (W = $._zod).check ?? (W.check = () => {});
}), $G = q("$ZodCheckRegex", ($, X) => {
	l0.init($, X), $._zod.check = (J) => {
		if (X.pattern.lastIndex = 0, X.pattern.test(J.value)) return;
		J.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: J.value,
			pattern: X.pattern.toString(),
			inst: $,
			continue: !X.abort
		});
	};
}), XG = q("$ZodCheckLowerCase", ($, X) => {
	X.pattern ?? (X.pattern = c3), l0.init($, X);
}), JG = q("$ZodCheckUpperCase", ($, X) => {
	X.pattern ?? (X.pattern = d3), l0.init($, X);
}), QG = q("$ZodCheckIncludes", ($, X) => {
	I$.init($, X);
	let J = A4(X.includes), W = new RegExp(typeof X.position === "number" ? `^.{${X.position}}${J}` : J);
	X.pattern = W, $._zod.onattach.push((Q) => {
		let Y = Q._zod.bag;
		Y.patterns ?? (Y.patterns = /* @__PURE__ */ new Set()), Y.patterns.add(W);
	}), $._zod.check = (Q) => {
		if (Q.value.includes(X.includes, X.position)) return;
		Q.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: X.includes,
			input: Q.value,
			inst: $,
			continue: !X.abort
		});
	};
}), WG = q("$ZodCheckStartsWith", ($, X) => {
	I$.init($, X);
	let J = new RegExp(`^${A4(X.prefix)}.*`);
	X.pattern ?? (X.pattern = J), $._zod.onattach.push((W) => {
		let Q = W._zod.bag;
		Q.patterns ?? (Q.patterns = /* @__PURE__ */ new Set()), Q.patterns.add(J);
	}), $._zod.check = (W) => {
		if (W.value.startsWith(X.prefix)) return;
		W.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: X.prefix,
			input: W.value,
			inst: $,
			continue: !X.abort
		});
	};
}), YG = q("$ZodCheckEndsWith", ($, X) => {
	I$.init($, X);
	let J = new RegExp(`.*${A4(X.suffix)}$`);
	X.pattern ?? (X.pattern = J), $._zod.onattach.push((W) => {
		let Q = W._zod.bag;
		Q.patterns ?? (Q.patterns = /* @__PURE__ */ new Set()), Q.patterns.add(J);
	}), $._zod.check = (W) => {
		if (W.value.endsWith(X.suffix)) return;
		W.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: X.suffix,
			input: W.value,
			inst: $,
			continue: !X.abort
		});
	};
});
function gq($, X, J) {
	if ($.issues.length) X.issues.push(...z6(J, $.issues));
}
var zG = q("$ZodCheckProperty", ($, X) => {
	I$.init($, X), $._zod.check = (J) => {
		let W = X.schema._zod.run({
			value: J.value[X.property],
			issues: []
		}, {});
		if (W instanceof Promise) return W.then((Q) => gq(Q, J, X.property));
		gq(W, J, X.property);
	};
}), GG = q("$ZodCheckMimeType", ($, X) => {
	I$.init($, X);
	let J = new Set(X.mime);
	$._zod.onattach.push((W) => {
		W._zod.bag.mime = X.mime;
	}), $._zod.check = (W) => {
		if (J.has(W.value.type)) return;
		W.issues.push({
			code: "invalid_value",
			values: X.mime,
			input: W.value.type,
			inst: $
		});
	};
}), HG = q("$ZodCheckOverwrite", ($, X) => {
	I$.init($, X), $._zod.check = (J) => {
		J.value = X.tx(J.value);
	};
});
var t7 = class {
	constructor($ = []) {
		if (this.content = [], this.indent = 0, this) this.args = $;
	}
	indented($) {
		this.indent += 1, $(this), this.indent -= 1;
	}
	write($) {
		if (typeof $ === "function") {
			$(this, { execution: "sync" }), $(this, { execution: "async" });
			return;
		}
		let J = $.split(`
`).filter((Y) => Y), W = Math.min(...J.map((Y) => Y.length - Y.trimStart().length)), Q = J.map((Y) => Y.slice(W)).map((Y) => " ".repeat(this.indent * 2) + Y);
		for (let Y of Q) this.content.push(Y);
	}
	compile() {
		let $ = Function, X = this?.args, W = [...(this?.content ?? [""]).map((Q) => `  ${Q}`)];
		return new $(...X, W.join(`
`));
	}
};
var UG = {
	major: 4,
	minor: 0,
	patch: 0
};
var p = q("$ZodType", ($, X) => {
	var J;
	$ ?? ($ = {}), $._zod.def = X, $._zod.bag = $._zod.bag || {}, $._zod.version = UG;
	let W = [...$._zod.def.checks ?? []];
	if ($._zod.traits.has("$ZodCheck")) W.unshift($);
	for (let Q of W) for (let Y of Q._zod.onattach) Y($);
	if (W.length === 0) (J = $._zod).deferred ?? (J.deferred = []), $._zod.deferred?.push(() => {
		$._zod.run = $._zod.parse;
	});
	else {
		let Q = (Y, z, G) => {
			let H = u1(Y), U;
			for (let K of z) {
				if (K._zod.when) {
					if (!K._zod.when(Y)) continue;
				} else if (H) continue;
				let V = Y.issues.length, N = K._zod.check(Y);
				if (N instanceof Promise && G?.async === !1) throw new M4();
				if (U || N instanceof Promise) U = (U ?? Promise.resolve()).then(async () => {
					if (await N, Y.issues.length === V) return;
					if (!H) H = u1(Y, V);
				});
				else {
					if (Y.issues.length === V) continue;
					if (!H) H = u1(Y, V);
				}
			}
			if (U) return U.then(() => {
				return Y;
			});
			return Y;
		};
		$._zod.run = (Y, z) => {
			let G = $._zod.parse(Y, z);
			if (G instanceof Promise) {
				if (z.async === !1) throw new M4();
				return G.then((H) => Q(H, W, z));
			}
			return Q(G, W, z);
		};
	}
	$["~standard"] = {
		validate: (Q) => {
			try {
				let Y = t4($, Q);
				return Y.success ? { value: Y.data } : { issues: Y.error?.issues };
			} catch (Y) {
				return a4($, Q).then((z) => z.success ? { value: z.data } : { issues: z.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	};
}), e4 = q("$ZodString", ($, X) => {
	p.init($, X), $._zod.pattern = [...$?._zod.bag?.patterns ?? []].pop() ?? f3($._zod.bag), $._zod.parse = (J, W) => {
		if (X.coerce) try {
			J.value = String(J.value);
		} catch (Q) {}
		if (typeof J.value === "string") return J;
		return J.issues.push({
			expected: "string",
			code: "invalid_type",
			input: J.value,
			inst: $
		}), J;
	};
}), K$ = q("$ZodStringFormat", ($, X) => {
	l0.init($, X), e4.init($, X);
}), e7 = q("$ZodGUID", ($, X) => {
	X.pattern ?? (X.pattern = I3), K$.init($, X);
}), $Q = q("$ZodUUID", ($, X) => {
	if (X.version) {
		let W = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[X.version];
		if (W === void 0) throw Error(`Invalid UUID version: "${X.version}"`);
		X.pattern ?? (X.pattern = c1(W));
	} else X.pattern ?? (X.pattern = c1());
	K$.init($, X);
}), XQ = q("$ZodEmail", ($, X) => {
	X.pattern ?? (X.pattern = Z3), K$.init($, X);
}), JQ = q("$ZodURL", ($, X) => {
	K$.init($, X), $._zod.check = (J) => {
		try {
			let W = J.value, Q = new URL(W), Y = Q.href;
			if (X.hostname) {
				if (X.hostname.lastIndex = 0, !X.hostname.test(Q.hostname)) J.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid hostname",
					pattern: C3.source,
					input: J.value,
					inst: $,
					continue: !X.abort
				});
			}
			if (X.protocol) {
				if (X.protocol.lastIndex = 0, !X.protocol.test(Q.protocol.endsWith(":") ? Q.protocol.slice(0, -1) : Q.protocol)) J.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid protocol",
					pattern: X.protocol.source,
					input: J.value,
					inst: $,
					continue: !X.abort
				});
			}
			if (!W.endsWith("/") && Y.endsWith("/")) J.value = Y.slice(0, -1);
			else J.value = Y;
			return;
		} catch (W) {
			J.issues.push({
				code: "invalid_format",
				format: "url",
				input: J.value,
				inst: $,
				continue: !X.abort
			});
		}
	};
}), QQ = q("$ZodEmoji", ($, X) => {
	X.pattern ?? (X.pattern = b3()), K$.init($, X);
}), WQ = q("$ZodNanoID", ($, X) => {
	X.pattern ?? (X.pattern = M3), K$.init($, X);
}), YQ = q("$ZodCUID", ($, X) => {
	X.pattern ?? (X.pattern = q3), K$.init($, X);
}), zQ = q("$ZodCUID2", ($, X) => {
	X.pattern ?? (X.pattern = D3), K$.init($, X);
}), GQ = q("$ZodULID", ($, X) => {
	X.pattern ?? (X.pattern = F3), K$.init($, X);
}), HQ = q("$ZodXID", ($, X) => {
	X.pattern ?? (X.pattern = j3), K$.init($, X);
}), UQ = q("$ZodKSUID", ($, X) => {
	X.pattern ?? (X.pattern = L3), K$.init($, X);
}), VG = q("$ZodISODateTime", ($, X) => {
	X.pattern ?? (X.pattern = T3(X)), K$.init($, X);
}), NG = q("$ZodISODate", ($, X) => {
	X.pattern ?? (X.pattern = _3), K$.init($, X);
}), OG = q("$ZodISOTime", ($, X) => {
	X.pattern ?? (X.pattern = x3(X)), K$.init($, X);
}), wG = q("$ZodISODuration", ($, X) => {
	X.pattern ?? (X.pattern = A3), K$.init($, X);
}), KQ = q("$ZodIPv4", ($, X) => {
	X.pattern ?? (X.pattern = R3), K$.init($, X), $._zod.onattach.push((J) => {
		let W = J._zod.bag;
		W.format = "ipv4";
	});
}), VQ = q("$ZodIPv6", ($, X) => {
	X.pattern ?? (X.pattern = P3), K$.init($, X), $._zod.onattach.push((J) => {
		let W = J._zod.bag;
		W.format = "ipv6";
	}), $._zod.check = (J) => {
		try {
			new URL(`http://[${J.value}]`);
		} catch {
			J.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: J.value,
				inst: $,
				continue: !X.abort
			});
		}
	};
}), NQ = q("$ZodCIDRv4", ($, X) => {
	X.pattern ?? (X.pattern = E3), K$.init($, X);
}), OQ = q("$ZodCIDRv6", ($, X) => {
	X.pattern ?? (X.pattern = S3), K$.init($, X), $._zod.check = (J) => {
		let [W, Q] = J.value.split("/");
		try {
			if (!Q) throw Error();
			let Y = Number(Q);
			if (`${Y}` !== Q) throw Error();
			if (Y < 0 || Y > 128) throw Error();
			new URL(`http://[${W}]`);
		} catch {
			J.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: J.value,
				inst: $,
				continue: !X.abort
			});
		}
	};
});
function BG($) {
	if ($ === "") return !0;
	if ($.length % 4 !== 0) return !1;
	try {
		return atob($), !0;
	} catch {
		return !1;
	}
}
var wQ = q("$ZodBase64", ($, X) => {
	X.pattern ?? (X.pattern = v3), K$.init($, X), $._zod.onattach.push((J) => {
		J._zod.bag.contentEncoding = "base64";
	}), $._zod.check = (J) => {
		if (BG(J.value)) return;
		J.issues.push({
			code: "invalid_format",
			format: "base64",
			input: J.value,
			inst: $,
			continue: !X.abort
		});
	};
});
function sq($) {
	if (!n7.test($)) return !1;
	let X = $.replace(/[-_]/g, (W) => W === "-" ? "+" : "/");
	return BG(X.padEnd(Math.ceil(X.length / 4) * 4, "="));
}
var BQ = q("$ZodBase64URL", ($, X) => {
	X.pattern ?? (X.pattern = n7), K$.init($, X), $._zod.onattach.push((J) => {
		J._zod.bag.contentEncoding = "base64url";
	}), $._zod.check = (J) => {
		if (sq(J.value)) return;
		J.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: J.value,
			inst: $,
			continue: !X.abort
		});
	};
}), qQ = q("$ZodE164", ($, X) => {
	X.pattern ?? (X.pattern = k3), K$.init($, X);
});
function eq($, X = null) {
	try {
		let J = $.split(".");
		if (J.length !== 3) return !1;
		let [W] = J;
		if (!W) return !1;
		let Q = JSON.parse(atob(W));
		if ("typ" in Q && Q?.typ !== "JWT") return !1;
		if (!Q.alg) return !1;
		if (X && (!("alg" in Q) || Q.alg !== X)) return !1;
		return !0;
	} catch {
		return !1;
	}
}
var DQ = q("$ZodJWT", ($, X) => {
	K$.init($, X), $._zod.check = (J) => {
		if (eq(J.value, X.alg)) return;
		J.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: J.value,
			inst: $,
			continue: !X.abort
		});
	};
}), FQ = q("$ZodCustomStringFormat", ($, X) => {
	K$.init($, X), $._zod.check = (J) => {
		if (X.fn(J.value)) return;
		J.issues.push({
			code: "invalid_format",
			format: X.format,
			input: J.value,
			inst: $,
			continue: !X.abort
		});
	};
}), e9 = q("$ZodNumber", ($, X) => {
	p.init($, X), $._zod.pattern = $._zod.bag.pattern ?? h3, $._zod.parse = (J, W) => {
		if (X.coerce) try {
			J.value = Number(J.value);
		} catch (z) {}
		let Q = J.value;
		if (typeof Q === "number" && !Number.isNaN(Q) && Number.isFinite(Q)) return J;
		let Y = typeof Q === "number" ? Number.isNaN(Q) ? "NaN" : !Number.isFinite(Q) ? "Infinity" : void 0 : void 0;
		return J.issues.push({
			expected: "number",
			code: "invalid_type",
			input: Q,
			inst: $,
			...Y ? { received: Y } : {}
		}), J;
	};
}), jQ = q("$ZodNumber", ($, X) => {
	i3.init($, X), e9.init($, X);
}), c0 = q("$ZodBoolean", ($, X) => {
	p.init($, X), $._zod.pattern = u3, $._zod.parse = (J, W) => {
		if (X.coerce) try {
			J.value = Boolean(J.value);
		} catch (Y) {}
		let Q = J.value;
		if (typeof Q === "boolean") return J;
		return J.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
	};
}), $X = q("$ZodBigInt", ($, X) => {
	p.init($, X), $._zod.pattern = y3, $._zod.parse = (J, W) => {
		if (X.coerce) try {
			J.value = BigInt(J.value);
		} catch (Q) {}
		if (typeof J.value === "bigint") return J;
		return J.issues.push({
			expected: "bigint",
			code: "invalid_type",
			input: J.value,
			inst: $
		}), J;
	};
}), LQ = q("$ZodBigInt", ($, X) => {
	n3.init($, X), $X.init($, X);
}), MQ = q("$ZodSymbol", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = J.value;
		if (typeof Q === "symbol") return J;
		return J.issues.push({
			expected: "symbol",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
	};
}), AQ = q("$ZodUndefined", ($, X) => {
	p.init($, X), $._zod.pattern = l3, $._zod.values = new Set([void 0]), $._zod.optin = "optional", $._zod.optout = "optional", $._zod.parse = (J, W) => {
		let Q = J.value;
		if (typeof Q > "u") return J;
		return J.issues.push({
			expected: "undefined",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
	};
}), IQ = q("$ZodNull", ($, X) => {
	p.init($, X), $._zod.pattern = m3, $._zod.values = new Set([null]), $._zod.parse = (J, W) => {
		let Q = J.value;
		if (Q === null) return J;
		return J.issues.push({
			expected: "null",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
	};
}), ZQ = q("$ZodAny", ($, X) => {
	p.init($, X), $._zod.parse = (J) => J;
}), d1 = q("$ZodUnknown", ($, X) => {
	p.init($, X), $._zod.parse = (J) => J;
}), bQ = q("$ZodNever", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		return J.issues.push({
			expected: "never",
			code: "invalid_type",
			input: J.value,
			inst: $
		}), J;
	};
}), RQ = q("$ZodVoid", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = J.value;
		if (typeof Q > "u") return J;
		return J.issues.push({
			expected: "void",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
	};
}), PQ = q("$ZodDate", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		if (X.coerce) try {
			J.value = new Date(J.value);
		} catch (G) {}
		let Q = J.value, Y = Q instanceof Date;
		if (Y && !Number.isNaN(Q.getTime())) return J;
		return J.issues.push({
			expected: "date",
			code: "invalid_type",
			input: Q,
			...Y ? { received: "Invalid Date" } : {},
			inst: $
		}), J;
	};
});
function mq($, X, J) {
	if ($.issues.length) X.issues.push(...z6(J, $.issues));
	X.value[J] = $.value;
}
var d0 = q("$ZodArray", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = J.value;
		if (!Array.isArray(Q)) return J.issues.push({
			expected: "array",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
		J.value = Array(Q.length);
		let Y = [];
		for (let z = 0; z < Q.length; z++) {
			let G = Q[z], H = X.element._zod.run({
				value: G,
				issues: []
			}, W);
			if (H instanceof Promise) Y.push(H.then((U) => mq(U, J, z)));
			else mq(H, J, z);
		}
		if (Y.length) return Promise.all(Y).then(() => J);
		return J;
	};
});
function a7($, X, J) {
	if ($.issues.length) X.issues.push(...z6(J, $.issues));
	X.value[J] = $.value;
}
function lq($, X, J, W) {
	if ($.issues.length) if (W[J] === void 0) if (J in W) X.value[J] = void 0;
	else X.value[J] = $.value;
	else X.issues.push(...z6(J, $.issues));
	else if ($.value === void 0) {
		if (J in W) X.value[J] = void 0;
	} else X.value[J] = $.value;
}
var XX = q("$ZodObject", ($, X) => {
	p.init($, X);
	let J = n9(() => {
		let V = Object.keys(X.shape);
		for (let O of V) if (!(X.shape[O] instanceof p)) throw Error(`Invalid element at key "${O}": expected a Zod schema`);
		let N = N3(X.shape);
		return {
			shape: X.shape,
			keys: V,
			keySet: new Set(V),
			numKeys: V.length,
			optionalKeys: new Set(N)
		};
	});
	G$($._zod, "propValues", () => {
		let V = X.shape, N = {};
		for (let O in V) {
			let w = V[O]._zod;
			if (w.values) {
				N[O] ?? (N[O] = /* @__PURE__ */ new Set());
				for (let B of w.values) N[O].add(B);
			}
		}
		return N;
	});
	let W = (V) => {
		let N = new t7([
			"shape",
			"payload",
			"ctx"
		]), O = J.value, w = (I) => {
			let Z = h1(I);
			return `shape[${Z}]._zod.run({ value: input[${Z}], issues: [] }, ctx)`;
		};
		N.write("const input = payload.value;");
		let B = Object.create(null), F = 0;
		for (let I of O.keys) B[I] = `key_${F++}`;
		N.write("const newResult = {}");
		for (let I of O.keys) if (O.optionalKeys.has(I)) {
			let Z = B[I];
			N.write(`const ${Z} = ${w(I)};`);
			let _ = h1(I);
			N.write(`
        if (${Z}.issues.length) {
          if (input[${_}] === undefined) {
            if (${_} in input) {
              newResult[${_}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${Z}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${_}, ...iss.path] : [${_}],
              }))
            );
          }
        } else if (${Z}.value === undefined) {
          if (${_} in input) newResult[${_}] = undefined;
        } else {
          newResult[${_}] = ${Z}.value;
        }
        `);
		} else {
			let Z = B[I];
			N.write(`const ${Z} = ${w(I)};`), N.write(`
          if (${Z}.issues.length) payload.issues = payload.issues.concat(${Z}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${h1(I)}, ...iss.path] : [${h1(I)}]
          })));`), N.write(`newResult[${h1(I)}] = ${Z}.value`);
		}
		N.write("payload.value = newResult;"), N.write("return payload;");
		let j = N.compile();
		return (I, Z) => j(V, I, Z);
	}, Q, Y = y0, z = !d9.jitless, H = z && K3.value, U = X.catchall, K;
	$._zod.parse = (V, N) => {
		K ?? (K = J.value);
		let O = V.value;
		if (!Y(O)) return V.issues.push({
			expected: "object",
			code: "invalid_type",
			input: O,
			inst: $
		}), V;
		let w = [];
		if (z && H && N?.async === !1 && N.jitless !== !0) {
			if (!Q) Q = W(X.shape);
			V = Q(V, N);
		} else {
			V.value = {};
			let Z = K.shape;
			for (let _ of K.keys) {
				let T = Z[_], O$ = T._zod.run({
					value: O[_],
					issues: []
				}, N), x$ = T._zod.optin === "optional" && T._zod.optout === "optional";
				if (O$ instanceof Promise) w.push(O$.then((O6) => x$ ? lq(O6, V, _, O) : a7(O6, V, _)));
				else if (x$) lq(O$, V, _, O);
				else a7(O$, V, _);
			}
		}
		if (!U) return w.length ? Promise.all(w).then(() => V) : V;
		let B = [], F = K.keySet, j = U._zod, I = j.def.type;
		for (let Z of Object.keys(O)) {
			if (F.has(Z)) continue;
			if (I === "never") {
				B.push(Z);
				continue;
			}
			let _ = j.run({
				value: O[Z],
				issues: []
			}, N);
			if (_ instanceof Promise) w.push(_.then((T) => a7(T, V, Z)));
			else a7(_, V, Z);
		}
		if (B.length) V.issues.push({
			code: "unrecognized_keys",
			keys: B,
			input: O,
			inst: $
		});
		if (!w.length) return V;
		return Promise.all(w).then(() => {
			return V;
		});
	};
});
function cq($, X, J, W) {
	for (let Q of $) if (Q.issues.length === 0) return X.value = Q.value, X;
	return X.issues.push({
		code: "invalid_union",
		input: X.value,
		inst: J,
		errors: $.map((Q) => Q.issues.map((Y) => L6(Y, W, v$())))
	}), X;
}
var JX = q("$ZodUnion", ($, X) => {
	p.init($, X), G$($._zod, "optin", () => X.options.some((J) => J._zod.optin === "optional") ? "optional" : void 0), G$($._zod, "optout", () => X.options.some((J) => J._zod.optout === "optional") ? "optional" : void 0), G$($._zod, "values", () => {
		if (X.options.every((J) => J._zod.values)) return new Set(X.options.flatMap((J) => Array.from(J._zod.values)));
	}), G$($._zod, "pattern", () => {
		if (X.options.every((J) => J._zod.pattern)) {
			let J = X.options.map((W) => W._zod.pattern);
			return new RegExp(`^(${J.map((W) => r9(W.source)).join("|")})$`);
		}
	}), $._zod.parse = (J, W) => {
		let Q = !1, Y = [];
		for (let z of X.options) {
			let G = z._zod.run({
				value: J.value,
				issues: []
			}, W);
			if (G instanceof Promise) Y.push(G), Q = !0;
			else {
				if (G.issues.length === 0) return G;
				Y.push(G);
			}
		}
		if (!Q) return cq(Y, J, $, W);
		return Promise.all(Y).then((z) => {
			return cq(z, J, $, W);
		});
	};
}), EQ = q("$ZodDiscriminatedUnion", ($, X) => {
	JX.init($, X);
	let J = $._zod.parse;
	G$($._zod, "propValues", () => {
		let Q = {};
		for (let Y of X.options) {
			let z = Y._zod.propValues;
			if (!z || Object.keys(z).length === 0) throw Error(`Invalid discriminated union option at index "${X.options.indexOf(Y)}"`);
			for (let [G, H] of Object.entries(z)) {
				if (!Q[G]) Q[G] = /* @__PURE__ */ new Set();
				for (let U of H) Q[G].add(U);
			}
		}
		return Q;
	});
	let W = n9(() => {
		let Q = X.options, Y = /* @__PURE__ */ new Map();
		for (let z of Q) {
			let G = z._zod.propValues[X.discriminator];
			if (!G || G.size === 0) throw Error(`Invalid discriminated union option at index "${X.options.indexOf(z)}"`);
			for (let H of G) {
				if (Y.has(H)) throw Error(`Duplicate discriminator value "${String(H)}"`);
				Y.set(H, z);
			}
		}
		return Y;
	});
	$._zod.parse = (Q, Y) => {
		let z = Q.value;
		if (!y0(z)) return Q.issues.push({
			code: "invalid_type",
			expected: "object",
			input: z,
			inst: $
		}), Q;
		let G = W.value.get(z?.[X.discriminator]);
		if (G) return G._zod.run(Q, Y);
		if (X.unionFallback) return J(Q, Y);
		return Q.issues.push({
			code: "invalid_union",
			errors: [],
			note: "No matching discriminator",
			input: z,
			path: [X.discriminator],
			inst: $
		}), Q;
	};
}), SQ = q("$ZodIntersection", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = J.value, Y = X.left._zod.run({
			value: Q,
			issues: []
		}, W), z = X.right._zod.run({
			value: Q,
			issues: []
		}, W);
		if (Y instanceof Promise || z instanceof Promise) return Promise.all([Y, z]).then(([H, U]) => {
			return dq(J, H, U);
		});
		return dq(J, Y, z);
	};
});
function KG($, X) {
	if ($ === X) return {
		valid: !0,
		data: $
	};
	if ($ instanceof Date && X instanceof Date && +$ === +X) return {
		valid: !0,
		data: $
	};
	if (g0($) && g0(X)) {
		let J = Object.keys(X), W = Object.keys($).filter((Y) => J.indexOf(Y) !== -1), Q = {
			...$,
			...X
		};
		for (let Y of W) {
			let z = KG($[Y], X[Y]);
			if (!z.valid) return {
				valid: !1,
				mergeErrorPath: [Y, ...z.mergeErrorPath]
			};
			Q[Y] = z.data;
		}
		return {
			valid: !0,
			data: Q
		};
	}
	if (Array.isArray($) && Array.isArray(X)) {
		if ($.length !== X.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let J = [];
		for (let W = 0; W < $.length; W++) {
			let Q = $[W], Y = X[W], z = KG(Q, Y);
			if (!z.valid) return {
				valid: !1,
				mergeErrorPath: [W, ...z.mergeErrorPath]
			};
			J.push(z.data);
		}
		return {
			valid: !0,
			data: J
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function dq($, X, J) {
	if (X.issues.length) $.issues.push(...X.issues);
	if (J.issues.length) $.issues.push(...J.issues);
	if (u1($)) return $;
	let W = KG(X.value, J.value);
	if (!W.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(W.mergeErrorPath)}`);
	return $.value = W.data, $;
}
var $1 = q("$ZodTuple", ($, X) => {
	p.init($, X);
	let J = X.items, W = J.length - [...J].reverse().findIndex((Q) => Q._zod.optin !== "optional");
	$._zod.parse = (Q, Y) => {
		let z = Q.value;
		if (!Array.isArray(z)) return Q.issues.push({
			input: z,
			inst: $,
			expected: "tuple",
			code: "invalid_type"
		}), Q;
		Q.value = [];
		let G = [];
		if (!X.rest) {
			let U = z.length > J.length, K = z.length < W - 1;
			if (U || K) return Q.issues.push({
				input: z,
				inst: $,
				origin: "array",
				...U ? {
					code: "too_big",
					maximum: J.length
				} : {
					code: "too_small",
					minimum: J.length
				}
			}), Q;
		}
		let H = -1;
		for (let U of J) {
			if (H++, H >= z.length) {
				if (H >= W) continue;
			}
			let K = U._zod.run({
				value: z[H],
				issues: []
			}, Y);
			if (K instanceof Promise) G.push(K.then((V) => s7(V, Q, H)));
			else s7(K, Q, H);
		}
		if (X.rest) {
			let U = z.slice(J.length);
			for (let K of U) {
				H++;
				let V = X.rest._zod.run({
					value: K,
					issues: []
				}, Y);
				if (V instanceof Promise) G.push(V.then((N) => s7(N, Q, H)));
				else s7(V, Q, H);
			}
		}
		if (G.length) return Promise.all(G).then(() => Q);
		return Q;
	};
});
function s7($, X, J) {
	if ($.issues.length) X.issues.push(...z6(J, $.issues));
	X.value[J] = $.value;
}
var vQ = q("$ZodRecord", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = J.value;
		if (!g0(Q)) return J.issues.push({
			expected: "record",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
		let Y = [];
		if (X.keyType._zod.values) {
			let z = X.keyType._zod.values;
			J.value = {};
			for (let H of z) if (typeof H === "string" || typeof H === "number" || typeof H === "symbol") {
				let U = X.valueType._zod.run({
					value: Q[H],
					issues: []
				}, W);
				if (U instanceof Promise) Y.push(U.then((K) => {
					if (K.issues.length) J.issues.push(...z6(H, K.issues));
					J.value[H] = K.value;
				}));
				else {
					if (U.issues.length) J.issues.push(...z6(H, U.issues));
					J.value[H] = U.value;
				}
			}
			let G;
			for (let H in Q) if (!z.has(H)) G = G ?? [], G.push(H);
			if (G && G.length > 0) J.issues.push({
				code: "unrecognized_keys",
				input: Q,
				inst: $,
				keys: G
			});
		} else {
			J.value = {};
			for (let z of Reflect.ownKeys(Q)) {
				if (z === "__proto__") continue;
				let G = X.keyType._zod.run({
					value: z,
					issues: []
				}, W);
				if (G instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (G.issues.length) {
					J.issues.push({
						origin: "record",
						code: "invalid_key",
						issues: G.issues.map((U) => L6(U, W, v$())),
						input: z,
						path: [z],
						inst: $
					}), J.value[G.value] = G.value;
					continue;
				}
				let H = X.valueType._zod.run({
					value: Q[z],
					issues: []
				}, W);
				if (H instanceof Promise) Y.push(H.then((U) => {
					if (U.issues.length) J.issues.push(...z6(z, U.issues));
					J.value[G.value] = U.value;
				}));
				else {
					if (H.issues.length) J.issues.push(...z6(z, H.issues));
					J.value[G.value] = H.value;
				}
			}
		}
		if (Y.length) return Promise.all(Y).then(() => J);
		return J;
	};
}), CQ = q("$ZodMap", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = J.value;
		if (!(Q instanceof Map)) return J.issues.push({
			expected: "map",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
		let Y = [];
		J.value = /* @__PURE__ */ new Map();
		for (let [z, G] of Q) {
			let H = X.keyType._zod.run({
				value: z,
				issues: []
			}, W), U = X.valueType._zod.run({
				value: G,
				issues: []
			}, W);
			if (H instanceof Promise || U instanceof Promise) Y.push(Promise.all([H, U]).then(([K, V]) => {
				pq(K, V, J, z, Q, $, W);
			}));
			else pq(H, U, J, z, Q, $, W);
		}
		if (Y.length) return Promise.all(Y).then(() => J);
		return J;
	};
});
function pq($, X, J, W, Q, Y, z) {
	if ($.issues.length) if (o9.has(typeof W)) J.issues.push(...z6(W, $.issues));
	else J.issues.push({
		origin: "map",
		code: "invalid_key",
		input: Q,
		inst: Y,
		issues: $.issues.map((G) => L6(G, z, v$()))
	});
	if (X.issues.length) if (o9.has(typeof W)) J.issues.push(...z6(W, X.issues));
	else J.issues.push({
		origin: "map",
		code: "invalid_element",
		input: Q,
		inst: Y,
		key: W,
		issues: X.issues.map((G) => L6(G, z, v$()))
	});
	J.value.set($.value, X.value);
}
var kQ = q("$ZodSet", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = J.value;
		if (!(Q instanceof Set)) return J.issues.push({
			input: Q,
			inst: $,
			expected: "set",
			code: "invalid_type"
		}), J;
		let Y = [];
		J.value = /* @__PURE__ */ new Set();
		for (let z of Q) {
			let G = X.valueType._zod.run({
				value: z,
				issues: []
			}, W);
			if (G instanceof Promise) Y.push(G.then((H) => iq(H, J)));
			else iq(G, J);
		}
		if (Y.length) return Promise.all(Y).then(() => J);
		return J;
	};
});
function iq($, X) {
	if ($.issues.length) X.issues.push(...$.issues);
	X.value.add($.value);
}
var _Q = q("$ZodEnum", ($, X) => {
	p.init($, X);
	let J = i9(X.entries);
	$._zod.values = new Set(J), $._zod.pattern = new RegExp(`^(${J.filter((W) => o9.has(typeof W)).map((W) => typeof W === "string" ? A4(W) : W.toString()).join("|")})$`), $._zod.parse = (W, Q) => {
		let Y = W.value;
		if ($._zod.values.has(Y)) return W;
		return W.issues.push({
			code: "invalid_value",
			values: J,
			input: Y,
			inst: $
		}), W;
	};
}), xQ = q("$ZodLiteral", ($, X) => {
	p.init($, X), $._zod.values = new Set(X.values), $._zod.pattern = new RegExp(`^(${X.values.map((J) => typeof J === "string" ? A4(J) : J ? J.toString() : String(J)).join("|")})$`), $._zod.parse = (J, W) => {
		let Q = J.value;
		if ($._zod.values.has(Q)) return J;
		return J.issues.push({
			code: "invalid_value",
			values: X.values,
			input: Q,
			inst: $
		}), J;
	};
}), TQ = q("$ZodFile", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = J.value;
		if (Q instanceof File) return J;
		return J.issues.push({
			expected: "file",
			code: "invalid_type",
			input: Q,
			inst: $
		}), J;
	};
}), p0 = q("$ZodTransform", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = X.transform(J.value, J);
		if (W.async) return (Q instanceof Promise ? Q : Promise.resolve(Q)).then((z) => {
			return J.value = z, J;
		});
		if (Q instanceof Promise) throw new M4();
		return J.value = Q, J;
	};
}), fQ = q("$ZodOptional", ($, X) => {
	p.init($, X), $._zod.optin = "optional", $._zod.optout = "optional", G$($._zod, "values", () => {
		return X.innerType._zod.values ? new Set([...X.innerType._zod.values, void 0]) : void 0;
	}), G$($._zod, "pattern", () => {
		let J = X.innerType._zod.pattern;
		return J ? new RegExp(`^(${r9(J.source)})?$`) : void 0;
	}), $._zod.parse = (J, W) => {
		if (X.innerType._zod.optin === "optional") return X.innerType._zod.run(J, W);
		if (J.value === void 0) return J;
		return X.innerType._zod.run(J, W);
	};
}), yQ = q("$ZodNullable", ($, X) => {
	p.init($, X), G$($._zod, "optin", () => X.innerType._zod.optin), G$($._zod, "optout", () => X.innerType._zod.optout), G$($._zod, "pattern", () => {
		let J = X.innerType._zod.pattern;
		return J ? new RegExp(`^(${r9(J.source)}|null)$`) : void 0;
	}), G$($._zod, "values", () => {
		return X.innerType._zod.values ? new Set([...X.innerType._zod.values, null]) : void 0;
	}), $._zod.parse = (J, W) => {
		if (J.value === null) return J;
		return X.innerType._zod.run(J, W);
	};
}), gQ = q("$ZodDefault", ($, X) => {
	p.init($, X), $._zod.optin = "optional", G$($._zod, "values", () => X.innerType._zod.values), $._zod.parse = (J, W) => {
		if (J.value === void 0) return J.value = X.defaultValue, J;
		let Q = X.innerType._zod.run(J, W);
		if (Q instanceof Promise) return Q.then((Y) => nq(Y, X));
		return nq(Q, X);
	};
});
function nq($, X) {
	if ($.value === void 0) $.value = X.defaultValue;
	return $;
}
var hQ = q("$ZodPrefault", ($, X) => {
	p.init($, X), $._zod.optin = "optional", G$($._zod, "values", () => X.innerType._zod.values), $._zod.parse = (J, W) => {
		if (J.value === void 0) J.value = X.defaultValue;
		return X.innerType._zod.run(J, W);
	};
}), uQ = q("$ZodNonOptional", ($, X) => {
	p.init($, X), G$($._zod, "values", () => {
		let J = X.innerType._zod.values;
		return J ? new Set([...J].filter((W) => W !== void 0)) : void 0;
	}), $._zod.parse = (J, W) => {
		let Q = X.innerType._zod.run(J, W);
		if (Q instanceof Promise) return Q.then((Y) => rq(Y, $));
		return rq(Q, $);
	};
});
function rq($, X) {
	if (!$.issues.length && $.value === void 0) $.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: $.value,
		inst: X
	});
	return $;
}
var mQ = q("$ZodSuccess", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		let Q = X.innerType._zod.run(J, W);
		if (Q instanceof Promise) return Q.then((Y) => {
			return J.value = Y.issues.length === 0, J;
		});
		return J.value = Q.issues.length === 0, J;
	};
}), lQ = q("$ZodCatch", ($, X) => {
	p.init($, X), $._zod.optin = "optional", G$($._zod, "optout", () => X.innerType._zod.optout), G$($._zod, "values", () => X.innerType._zod.values), $._zod.parse = (J, W) => {
		let Q = X.innerType._zod.run(J, W);
		if (Q instanceof Promise) return Q.then((Y) => {
			if (J.value = Y.value, Y.issues.length) J.value = X.catchValue({
				...J,
				error: { issues: Y.issues.map((z) => L6(z, W, v$())) },
				input: J.value
			}), J.issues = [];
			return J;
		});
		if (J.value = Q.value, Q.issues.length) J.value = X.catchValue({
			...J,
			error: { issues: Q.issues.map((Y) => L6(Y, W, v$())) },
			input: J.value
		}), J.issues = [];
		return J;
	};
}), cQ = q("$ZodNaN", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		if (typeof J.value !== "number" || !Number.isNaN(J.value)) return J.issues.push({
			input: J.value,
			inst: $,
			expected: "nan",
			code: "invalid_type"
		}), J;
		return J;
	};
}), i0 = q("$ZodPipe", ($, X) => {
	p.init($, X), G$($._zod, "values", () => X.in._zod.values), G$($._zod, "optin", () => X.in._zod.optin), G$($._zod, "optout", () => X.out._zod.optout), $._zod.parse = (J, W) => {
		let Q = X.in._zod.run(J, W);
		if (Q instanceof Promise) return Q.then((Y) => oq(Y, X, W));
		return oq(Q, X, W);
	};
});
function oq($, X, J) {
	if (u1($)) return $;
	return X.out._zod.run({
		value: $.value,
		issues: $.issues
	}, J);
}
var dQ = q("$ZodReadonly", ($, X) => {
	p.init($, X), G$($._zod, "propValues", () => X.innerType._zod.propValues), G$($._zod, "values", () => X.innerType._zod.values), G$($._zod, "optin", () => X.innerType._zod.optin), G$($._zod, "optout", () => X.innerType._zod.optout), $._zod.parse = (J, W) => {
		let Q = X.innerType._zod.run(J, W);
		if (Q instanceof Promise) return Q.then(tq);
		return tq(Q);
	};
});
function tq($) {
	return $.value = Object.freeze($.value), $;
}
var pQ = q("$ZodTemplateLiteral", ($, X) => {
	p.init($, X);
	let J = [];
	for (let W of X.parts) if (W instanceof p) {
		if (!W._zod.pattern) throw Error(`Invalid template literal part, no pattern found: ${[...W._zod.traits].shift()}`);
		let Q = W._zod.pattern instanceof RegExp ? W._zod.pattern.source : W._zod.pattern;
		if (!Q) throw Error(`Invalid template literal part: ${W._zod.traits}`);
		let Y = Q.startsWith("^") ? 1 : 0, z = Q.endsWith("$") ? Q.length - 1 : Q.length;
		J.push(Q.slice(Y, z));
	} else if (W === null || V3.has(typeof W)) J.push(A4(`${W}`));
	else throw Error(`Invalid template literal part: ${W}`);
	$._zod.pattern = new RegExp(`^${J.join("")}$`), $._zod.parse = (W, Q) => {
		if (typeof W.value !== "string") return W.issues.push({
			input: W.value,
			inst: $,
			expected: "template_literal",
			code: "invalid_type"
		}), W;
		if ($._zod.pattern.lastIndex = 0, !$._zod.pattern.test(W.value)) return W.issues.push({
			input: W.value,
			inst: $,
			code: "invalid_format",
			format: "template_literal",
			pattern: $._zod.pattern.source
		}), W;
		return W;
	};
}), iQ = q("$ZodPromise", ($, X) => {
	p.init($, X), $._zod.parse = (J, W) => {
		return Promise.resolve(J.value).then((Q) => X.innerType._zod.run({
			value: Q,
			issues: []
		}, W));
	};
}), nQ = q("$ZodLazy", ($, X) => {
	p.init($, X), G$($._zod, "innerType", () => X.getter()), G$($._zod, "pattern", () => $._zod.innerType._zod.pattern), G$($._zod, "propValues", () => $._zod.innerType._zod.propValues), G$($._zod, "optin", () => $._zod.innerType._zod.optin), G$($._zod, "optout", () => $._zod.innerType._zod.optout), $._zod.parse = (J, W) => {
		return $._zod.innerType._zod.run(J, W);
	};
}), rQ = q("$ZodCustom", ($, X) => {
	I$.init($, X), p.init($, X), $._zod.parse = (J, W) => {
		return J;
	}, $._zod.check = (J) => {
		let W = J.value, Q = X.fn(W);
		if (Q instanceof Promise) return Q.then((Y) => aq(Y, J, W, $));
		aq(Q, J, W, $);
	};
});
function aq($, X, J, W) {
	if (!$) {
		let Q = {
			code: "custom",
			input: J,
			inst: W,
			path: [...W._zod.def.path ?? []],
			continue: !W._zod.def.abort
		};
		if (W._zod.def.params) Q.params = W._zod.def.params;
		X.issues.push(B3(Q));
	}
}
var n0 = {};
D1(n0, {
	zhTW: () => eG,
	zhCN: () => sG,
	vi: () => aG,
	ur: () => tG,
	ua: () => oG,
	tr: () => rG,
	th: () => nG,
	ta: () => iG,
	sv: () => pG,
	sl: () => dG,
	ru: () => cG,
	pt: () => lG,
	ps: () => uG,
	pl: () => mG,
	ota: () => hG,
	no: () => gG,
	nl: () => yG,
	ms: () => fG,
	mk: () => TG,
	ko: () => xG,
	kh: () => _G,
	ja: () => kG,
	it: () => CG,
	id: () => vG,
	hu: () => SG,
	he: () => EG,
	frCA: () => PG,
	fr: () => RG,
	fi: () => bG,
	fa: () => ZG,
	es: () => IG,
	eo: () => AG,
	en: () => QX,
	de: () => MG,
	cs: () => LG,
	ca: () => jG,
	be: () => FG,
	az: () => DG,
	ar: () => qG
});
var JC = () => {
	let $ = {
		string: {
			unit: "حرف",
			verb: "أن يحوي"
		},
		file: {
			unit: "بايت",
			verb: "أن يحوي"
		},
		array: {
			unit: "عنصر",
			verb: "أن يحوي"
		},
		set: {
			unit: "عنصر",
			verb: "أن يحوي"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "مدخل",
		email: "بريد إلكتروني",
		url: "رابط",
		emoji: "إيموجي",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "تاريخ ووقت بمعيار ISO",
		date: "تاريخ بمعيار ISO",
		time: "وقت بمعيار ISO",
		duration: "مدة بمعيار ISO",
		ipv4: "عنوان IPv4",
		ipv6: "عنوان IPv6",
		cidrv4: "مدى عناوين بصيغة IPv4",
		cidrv6: "مدى عناوين بصيغة IPv6",
		base64: "نَص بترميز base64-encoded",
		base64url: "نَص بترميز base64url-encoded",
		json_string: "نَص على هيئة JSON",
		e164: "رقم هاتف بمعيار E.164",
		jwt: "JWT",
		template_literal: "مدخل"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `مدخلات غير مقبولة: يفترض إدخال ${Q.expected}، ولكن تم إدخال ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `مدخلات غير مقبولة: يفترض إدخال ${v(Q.values[0])}`;
				return `اختيار غير مقبول: يتوقع انتقاء أحد هذه الخيارات: ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return ` أكبر من اللازم: يفترض أن تكون ${Q.origin ?? "القيمة"} ${Y} ${Q.maximum.toString()} ${z.unit ?? "عنصر"}`;
				return `أكبر من اللازم: يفترض أن تكون ${Q.origin ?? "القيمة"} ${Y} ${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `أصغر من اللازم: يفترض لـ ${Q.origin} أن يكون ${Y} ${Q.minimum.toString()} ${z.unit}`;
				return `أصغر من اللازم: يفترض لـ ${Q.origin} أن يكون ${Y} ${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `نَص غير مقبول: يجب أن يبدأ بـ "${Q.prefix}"`;
				if (Y.format === "ends_with") return `نَص غير مقبول: يجب أن ينتهي بـ "${Y.suffix}"`;
				if (Y.format === "includes") return `نَص غير مقبول: يجب أن يتضمَّن "${Y.includes}"`;
				if (Y.format === "regex") return `نَص غير مقبول: يجب أن يطابق النمط ${Y.pattern}`;
				return `${W[Y.format] ?? Q.format} غير مقبول`;
			}
			case "not_multiple_of": return `رقم غير مقبول: يجب أن يكون من مضاعفات ${Q.divisor}`;
			case "unrecognized_keys": return `معرف${Q.keys.length > 1 ? "ات" : ""} غريب${Q.keys.length > 1 ? "ة" : ""}: ${A(Q.keys, "، ")}`;
			case "invalid_key": return `معرف غير مقبول في ${Q.origin}`;
			case "invalid_union": return "مدخل غير مقبول";
			case "invalid_element": return `مدخل غير مقبول في ${Q.origin}`;
			default: return "مدخل غير مقبول";
		}
	};
};
function qG() {
	return { localeError: JC() };
}
var QC = () => {
	let $ = {
		string: {
			unit: "simvol",
			verb: "olmalıdır"
		},
		file: {
			unit: "bayt",
			verb: "olmalıdır"
		},
		array: {
			unit: "element",
			verb: "olmalıdır"
		},
		set: {
			unit: "element",
			verb: "olmalıdır"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		jwt: "JWT",
		template_literal: "input"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Yanlış dəyər: gözlənilən ${Q.expected}, daxil olan ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Yanlış dəyər: gözlənilən ${v(Q.values[0])}`;
				return `Yanlış seçim: aşağıdakılardan biri olmalıdır: ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Çox böyük: gözlənilən ${Q.origin ?? "dəyər"} ${Y}${Q.maximum.toString()} ${z.unit ?? "element"}`;
				return `Çox böyük: gözlənilən ${Q.origin ?? "dəyər"} ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Çox kiçik: gözlənilən ${Q.origin} ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Çox kiçik: gözlənilən ${Q.origin} ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Yanlış mətn: "${Y.prefix}" ilə başlamalıdır`;
				if (Y.format === "ends_with") return `Yanlış mətn: "${Y.suffix}" ilə bitməlidir`;
				if (Y.format === "includes") return `Yanlış mətn: "${Y.includes}" daxil olmalıdır`;
				if (Y.format === "regex") return `Yanlış mətn: ${Y.pattern} şablonuna uyğun olmalıdır`;
				return `Yanlış ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Yanlış ədəd: ${Q.divisor} ilə bölünə bilən olmalıdır`;
			case "unrecognized_keys": return `Tanınmayan açar${Q.keys.length > 1 ? "lar" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `${Q.origin} daxilində yanlış açar`;
			case "invalid_union": return "Yanlış dəyər";
			case "invalid_element": return `${Q.origin} daxilində yanlış dəyər`;
			default: return "Yanlış dəyər";
		}
	};
};
function DG() {
	return { localeError: QC() };
}
function XD($, X, J, W) {
	let Q = Math.abs($), Y = Q % 10, z = Q % 100;
	if (z >= 11 && z <= 19) return W;
	if (Y === 1) return X;
	if (Y >= 2 && Y <= 4) return J;
	return W;
}
var WC = () => {
	let $ = {
		string: {
			unit: {
				one: "сімвал",
				few: "сімвалы",
				many: "сімвалаў"
			},
			verb: "мець"
		},
		array: {
			unit: {
				one: "элемент",
				few: "элементы",
				many: "элементаў"
			},
			verb: "мець"
		},
		set: {
			unit: {
				one: "элемент",
				few: "элементы",
				many: "элементаў"
			},
			verb: "мець"
		},
		file: {
			unit: {
				one: "байт",
				few: "байты",
				many: "байтаў"
			},
			verb: "мець"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "лік";
			case "object":
				if (Array.isArray(Q)) return "масіў";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "увод",
		email: "email адрас",
		url: "URL",
		emoji: "эмодзі",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO дата і час",
		date: "ISO дата",
		time: "ISO час",
		duration: "ISO працягласць",
		ipv4: "IPv4 адрас",
		ipv6: "IPv6 адрас",
		cidrv4: "IPv4 дыяпазон",
		cidrv6: "IPv6 дыяпазон",
		base64: "радок у фармаце base64",
		base64url: "радок у фармаце base64url",
		json_string: "JSON радок",
		e164: "нумар E.164",
		jwt: "JWT",
		template_literal: "увод"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Няправільны ўвод: чакаўся ${Q.expected}, атрымана ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Няправільны ўвод: чакалася ${v(Q.values[0])}`;
				return `Няправільны варыянт: чакаўся адзін з ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) {
					let H = XD(Number(Q.maximum), z.unit.one, z.unit.few, z.unit.many);
					return `Занадта вялікі: чакалася, што ${Q.origin ?? "значэнне"} павінна ${z.verb} ${Y}${Q.maximum.toString()} ${H}`;
				}
				return `Занадта вялікі: чакалася, што ${Q.origin ?? "значэнне"} павінна быць ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) {
					let H = XD(Number(Q.minimum), z.unit.one, z.unit.few, z.unit.many);
					return `Занадта малы: чакалася, што ${Q.origin} павінна ${z.verb} ${Y}${Q.minimum.toString()} ${H}`;
				}
				return `Занадта малы: чакалася, што ${Q.origin} павінна быць ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Няправільны радок: павінен пачынацца з "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Няправільны радок: павінен заканчвацца на "${Y.suffix}"`;
				if (Y.format === "includes") return `Няправільны радок: павінен змяшчаць "${Y.includes}"`;
				if (Y.format === "regex") return `Няправільны радок: павінен адпавядаць шаблону ${Y.pattern}`;
				return `Няправільны ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Няправільны лік: павінен быць кратным ${Q.divisor}`;
			case "unrecognized_keys": return `Нераспазнаны ${Q.keys.length > 1 ? "ключы" : "ключ"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Няправільны ключ у ${Q.origin}`;
			case "invalid_union": return "Няправільны ўвод";
			case "invalid_element": return `Няправільнае значэнне ў ${Q.origin}`;
			default: return "Няправільны ўвод";
		}
	};
};
function FG() {
	return { localeError: WC() };
}
var YC = () => {
	let $ = {
		string: {
			unit: "caràcters",
			verb: "contenir"
		},
		file: {
			unit: "bytes",
			verb: "contenir"
		},
		array: {
			unit: "elements",
			verb: "contenir"
		},
		set: {
			unit: "elements",
			verb: "contenir"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "entrada",
		email: "adreça electrònica",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "data i hora ISO",
		date: "data ISO",
		time: "hora ISO",
		duration: "durada ISO",
		ipv4: "adreça IPv4",
		ipv6: "adreça IPv6",
		cidrv4: "rang IPv4",
		cidrv6: "rang IPv6",
		base64: "cadena codificada en base64",
		base64url: "cadena codificada en base64url",
		json_string: "cadena JSON",
		e164: "número E.164",
		jwt: "JWT",
		template_literal: "entrada"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Tipus invàlid: s'esperava ${Q.expected}, s'ha rebut ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Valor invàlid: s'esperava ${v(Q.values[0])}`;
				return `Opció invàlida: s'esperava una de ${A(Q.values, " o ")}`;
			case "too_big": {
				let Y = Q.inclusive ? "com a màxim" : "menys de", z = X(Q.origin);
				if (z) return `Massa gran: s'esperava que ${Q.origin ?? "el valor"} contingués ${Y} ${Q.maximum.toString()} ${z.unit ?? "elements"}`;
				return `Massa gran: s'esperava que ${Q.origin ?? "el valor"} fos ${Y} ${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? "com a mínim" : "més de", z = X(Q.origin);
				if (z) return `Massa petit: s'esperava que ${Q.origin} contingués ${Y} ${Q.minimum.toString()} ${z.unit}`;
				return `Massa petit: s'esperava que ${Q.origin} fos ${Y} ${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Format invàlid: ha de començar amb "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Format invàlid: ha d'acabar amb "${Y.suffix}"`;
				if (Y.format === "includes") return `Format invàlid: ha d'incloure "${Y.includes}"`;
				if (Y.format === "regex") return `Format invàlid: ha de coincidir amb el patró ${Y.pattern}`;
				return `Format invàlid per a ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Número invàlid: ha de ser múltiple de ${Q.divisor}`;
			case "unrecognized_keys": return `Clau${Q.keys.length > 1 ? "s" : ""} no reconeguda${Q.keys.length > 1 ? "s" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Clau invàlida a ${Q.origin}`;
			case "invalid_union": return "Entrada invàlida";
			case "invalid_element": return `Element invàlid a ${Q.origin}`;
			default: return "Entrada invàlida";
		}
	};
};
function jG() {
	return { localeError: YC() };
}
var zC = () => {
	let $ = {
		string: {
			unit: "znaků",
			verb: "mít"
		},
		file: {
			unit: "bajtů",
			verb: "mít"
		},
		array: {
			unit: "prvků",
			verb: "mít"
		},
		set: {
			unit: "prvků",
			verb: "mít"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "číslo";
			case "string": return "řetězec";
			case "boolean": return "boolean";
			case "bigint": return "bigint";
			case "function": return "funkce";
			case "symbol": return "symbol";
			case "undefined": return "undefined";
			case "object":
				if (Array.isArray(Q)) return "pole";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "regulární výraz",
		email: "e-mailová adresa",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "datum a čas ve formátu ISO",
		date: "datum ve formátu ISO",
		time: "čas ve formátu ISO",
		duration: "doba trvání ISO",
		ipv4: "IPv4 adresa",
		ipv6: "IPv6 adresa",
		cidrv4: "rozsah IPv4",
		cidrv6: "rozsah IPv6",
		base64: "řetězec zakódovaný ve formátu base64",
		base64url: "řetězec zakódovaný ve formátu base64url",
		json_string: "řetězec ve formátu JSON",
		e164: "číslo E.164",
		jwt: "JWT",
		template_literal: "vstup"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Neplatný vstup: očekáváno ${Q.expected}, obdrženo ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Neplatný vstup: očekáváno ${v(Q.values[0])}`;
				return `Neplatná možnost: očekávána jedna z hodnot ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Hodnota je příliš velká: ${Q.origin ?? "hodnota"} musí mít ${Y}${Q.maximum.toString()} ${z.unit ?? "prvků"}`;
				return `Hodnota je příliš velká: ${Q.origin ?? "hodnota"} musí být ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Hodnota je příliš malá: ${Q.origin ?? "hodnota"} musí mít ${Y}${Q.minimum.toString()} ${z.unit ?? "prvků"}`;
				return `Hodnota je příliš malá: ${Q.origin ?? "hodnota"} musí být ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Neplatný řetězec: musí začínat na "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Neplatný řetězec: musí končit na "${Y.suffix}"`;
				if (Y.format === "includes") return `Neplatný řetězec: musí obsahovat "${Y.includes}"`;
				if (Y.format === "regex") return `Neplatný řetězec: musí odpovídat vzoru ${Y.pattern}`;
				return `Neplatný formát ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Neplatné číslo: musí být násobkem ${Q.divisor}`;
			case "unrecognized_keys": return `Neznámé klíče: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Neplatný klíč v ${Q.origin}`;
			case "invalid_union": return "Neplatný vstup";
			case "invalid_element": return `Neplatná hodnota v ${Q.origin}`;
			default: return "Neplatný vstup";
		}
	};
};
function LG() {
	return { localeError: zC() };
}
var GC = () => {
	let $ = {
		string: {
			unit: "Zeichen",
			verb: "zu haben"
		},
		file: {
			unit: "Bytes",
			verb: "zu haben"
		},
		array: {
			unit: "Elemente",
			verb: "zu haben"
		},
		set: {
			unit: "Elemente",
			verb: "zu haben"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "Zahl";
			case "object":
				if (Array.isArray(Q)) return "Array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "Eingabe",
		email: "E-Mail-Adresse",
		url: "URL",
		emoji: "Emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO-Datum und -Uhrzeit",
		date: "ISO-Datum",
		time: "ISO-Uhrzeit",
		duration: "ISO-Dauer",
		ipv4: "IPv4-Adresse",
		ipv6: "IPv6-Adresse",
		cidrv4: "IPv4-Bereich",
		cidrv6: "IPv6-Bereich",
		base64: "Base64-codierter String",
		base64url: "Base64-URL-codierter String",
		json_string: "JSON-String",
		e164: "E.164-Nummer",
		jwt: "JWT",
		template_literal: "Eingabe"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Ungültige Eingabe: erwartet ${Q.expected}, erhalten ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Ungültige Eingabe: erwartet ${v(Q.values[0])}`;
				return `Ungültige Option: erwartet eine von ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Zu groß: erwartet, dass ${Q.origin ?? "Wert"} ${Y}${Q.maximum.toString()} ${z.unit ?? "Elemente"} hat`;
				return `Zu groß: erwartet, dass ${Q.origin ?? "Wert"} ${Y}${Q.maximum.toString()} ist`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Zu klein: erwartet, dass ${Q.origin} ${Y}${Q.minimum.toString()} ${z.unit} hat`;
				return `Zu klein: erwartet, dass ${Q.origin} ${Y}${Q.minimum.toString()} ist`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Ungültiger String: muss mit "${Y.prefix}" beginnen`;
				if (Y.format === "ends_with") return `Ungültiger String: muss mit "${Y.suffix}" enden`;
				if (Y.format === "includes") return `Ungültiger String: muss "${Y.includes}" enthalten`;
				if (Y.format === "regex") return `Ungültiger String: muss dem Muster ${Y.pattern} entsprechen`;
				return `Ungültig: ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Ungültige Zahl: muss ein Vielfaches von ${Q.divisor} sein`;
			case "unrecognized_keys": return `${Q.keys.length > 1 ? "Unbekannte Schlüssel" : "Unbekannter Schlüssel"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Ungültiger Schlüssel in ${Q.origin}`;
			case "invalid_union": return "Ungültige Eingabe";
			case "invalid_element": return `Ungültiger Wert in ${Q.origin}`;
			default: return "Ungültige Eingabe";
		}
	};
};
function MG() {
	return { localeError: GC() };
}
var HC = ($) => {
	let X = typeof $;
	switch (X) {
		case "number": return Number.isNaN($) ? "NaN" : "number";
		case "object":
			if (Array.isArray($)) return "array";
			if ($ === null) return "null";
			if (Object.getPrototypeOf($) !== Object.prototype && $.constructor) return $.constructor.name;
	}
	return X;
}, UC = () => {
	let $ = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		}
	};
	function X(W) {
		return $[W] ?? null;
	}
	let J = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		jwt: "JWT",
		template_literal: "input"
	};
	return (W) => {
		switch (W.code) {
			case "invalid_type": return `Invalid input: expected ${W.expected}, received ${HC(W.input)}`;
			case "invalid_value":
				if (W.values.length === 1) return `Invalid input: expected ${v(W.values[0])}`;
				return `Invalid option: expected one of ${A(W.values, "|")}`;
			case "too_big": {
				let Q = W.inclusive ? "<=" : "<", Y = X(W.origin);
				if (Y) return `Too big: expected ${W.origin ?? "value"} to have ${Q}${W.maximum.toString()} ${Y.unit ?? "elements"}`;
				return `Too big: expected ${W.origin ?? "value"} to be ${Q}${W.maximum.toString()}`;
			}
			case "too_small": {
				let Q = W.inclusive ? ">=" : ">", Y = X(W.origin);
				if (Y) return `Too small: expected ${W.origin} to have ${Q}${W.minimum.toString()} ${Y.unit}`;
				return `Too small: expected ${W.origin} to be ${Q}${W.minimum.toString()}`;
			}
			case "invalid_format": {
				let Q = W;
				if (Q.format === "starts_with") return `Invalid string: must start with "${Q.prefix}"`;
				if (Q.format === "ends_with") return `Invalid string: must end with "${Q.suffix}"`;
				if (Q.format === "includes") return `Invalid string: must include "${Q.includes}"`;
				if (Q.format === "regex") return `Invalid string: must match pattern ${Q.pattern}`;
				return `Invalid ${J[Q.format] ?? W.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${W.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${W.keys.length > 1 ? "s" : ""}: ${A(W.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${W.origin}`;
			case "invalid_union": return "Invalid input";
			case "invalid_element": return `Invalid value in ${W.origin}`;
			default: return "Invalid input";
		}
	};
};
function QX() {
	return { localeError: UC() };
}
var KC = ($) => {
	let X = typeof $;
	switch (X) {
		case "number": return Number.isNaN($) ? "NaN" : "nombro";
		case "object":
			if (Array.isArray($)) return "tabelo";
			if ($ === null) return "senvalora";
			if (Object.getPrototypeOf($) !== Object.prototype && $.constructor) return $.constructor.name;
	}
	return X;
}, VC = () => {
	let $ = {
		string: {
			unit: "karaktrojn",
			verb: "havi"
		},
		file: {
			unit: "bajtojn",
			verb: "havi"
		},
		array: {
			unit: "elementojn",
			verb: "havi"
		},
		set: {
			unit: "elementojn",
			verb: "havi"
		}
	};
	function X(W) {
		return $[W] ?? null;
	}
	let J = {
		regex: "enigo",
		email: "retadreso",
		url: "URL",
		emoji: "emoĝio",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO-datotempo",
		date: "ISO-dato",
		time: "ISO-tempo",
		duration: "ISO-daŭro",
		ipv4: "IPv4-adreso",
		ipv6: "IPv6-adreso",
		cidrv4: "IPv4-rango",
		cidrv6: "IPv6-rango",
		base64: "64-ume kodita karaktraro",
		base64url: "URL-64-ume kodita karaktraro",
		json_string: "JSON-karaktraro",
		e164: "E.164-nombro",
		jwt: "JWT",
		template_literal: "enigo"
	};
	return (W) => {
		switch (W.code) {
			case "invalid_type": return `Nevalida enigo: atendiĝis ${W.expected}, riceviĝis ${KC(W.input)}`;
			case "invalid_value":
				if (W.values.length === 1) return `Nevalida enigo: atendiĝis ${v(W.values[0])}`;
				return `Nevalida opcio: atendiĝis unu el ${A(W.values, "|")}`;
			case "too_big": {
				let Q = W.inclusive ? "<=" : "<", Y = X(W.origin);
				if (Y) return `Tro granda: atendiĝis ke ${W.origin ?? "valoro"} havu ${Q}${W.maximum.toString()} ${Y.unit ?? "elementojn"}`;
				return `Tro granda: atendiĝis ke ${W.origin ?? "valoro"} havu ${Q}${W.maximum.toString()}`;
			}
			case "too_small": {
				let Q = W.inclusive ? ">=" : ">", Y = X(W.origin);
				if (Y) return `Tro malgranda: atendiĝis ke ${W.origin} havu ${Q}${W.minimum.toString()} ${Y.unit}`;
				return `Tro malgranda: atendiĝis ke ${W.origin} estu ${Q}${W.minimum.toString()}`;
			}
			case "invalid_format": {
				let Q = W;
				if (Q.format === "starts_with") return `Nevalida karaktraro: devas komenciĝi per "${Q.prefix}"`;
				if (Q.format === "ends_with") return `Nevalida karaktraro: devas finiĝi per "${Q.suffix}"`;
				if (Q.format === "includes") return `Nevalida karaktraro: devas inkluzivi "${Q.includes}"`;
				if (Q.format === "regex") return `Nevalida karaktraro: devas kongrui kun la modelo ${Q.pattern}`;
				return `Nevalida ${J[Q.format] ?? W.format}`;
			}
			case "not_multiple_of": return `Nevalida nombro: devas esti oblo de ${W.divisor}`;
			case "unrecognized_keys": return `Nekonata${W.keys.length > 1 ? "j" : ""} ŝlosilo${W.keys.length > 1 ? "j" : ""}: ${A(W.keys, ", ")}`;
			case "invalid_key": return `Nevalida ŝlosilo en ${W.origin}`;
			case "invalid_union": return "Nevalida enigo";
			case "invalid_element": return `Nevalida valoro en ${W.origin}`;
			default: return "Nevalida enigo";
		}
	};
};
function AG() {
	return { localeError: VC() };
}
var NC = () => {
	let $ = {
		string: {
			unit: "caracteres",
			verb: "tener"
		},
		file: {
			unit: "bytes",
			verb: "tener"
		},
		array: {
			unit: "elementos",
			verb: "tener"
		},
		set: {
			unit: "elementos",
			verb: "tener"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "número";
			case "object":
				if (Array.isArray(Q)) return "arreglo";
				if (Q === null) return "nulo";
				if (Object.getPrototypeOf(Q) !== Object.prototype) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "entrada",
		email: "dirección de correo electrónico",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "fecha y hora ISO",
		date: "fecha ISO",
		time: "hora ISO",
		duration: "duración ISO",
		ipv4: "dirección IPv4",
		ipv6: "dirección IPv6",
		cidrv4: "rango IPv4",
		cidrv6: "rango IPv6",
		base64: "cadena codificada en base64",
		base64url: "URL codificada en base64",
		json_string: "cadena JSON",
		e164: "número E.164",
		jwt: "JWT",
		template_literal: "entrada"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Entrada inválida: se esperaba ${Q.expected}, recibido ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Entrada inválida: se esperaba ${v(Q.values[0])}`;
				return `Opción inválida: se esperaba una de ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Demasiado grande: se esperaba que ${Q.origin ?? "valor"} tuviera ${Y}${Q.maximum.toString()} ${z.unit ?? "elementos"}`;
				return `Demasiado grande: se esperaba que ${Q.origin ?? "valor"} fuera ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Demasiado pequeño: se esperaba que ${Q.origin} tuviera ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Demasiado pequeño: se esperaba que ${Q.origin} fuera ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Cadena inválida: debe comenzar con "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Cadena inválida: debe terminar en "${Y.suffix}"`;
				if (Y.format === "includes") return `Cadena inválida: debe incluir "${Y.includes}"`;
				if (Y.format === "regex") return `Cadena inválida: debe coincidir con el patrón ${Y.pattern}`;
				return `Inválido ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Número inválido: debe ser múltiplo de ${Q.divisor}`;
			case "unrecognized_keys": return `Llave${Q.keys.length > 1 ? "s" : ""} desconocida${Q.keys.length > 1 ? "s" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Llave inválida en ${Q.origin}`;
			case "invalid_union": return "Entrada inválida";
			case "invalid_element": return `Valor inválido en ${Q.origin}`;
			default: return "Entrada inválida";
		}
	};
};
function IG() {
	return { localeError: NC() };
}
var OC = () => {
	let $ = {
		string: {
			unit: "کاراکتر",
			verb: "داشته باشد"
		},
		file: {
			unit: "بایت",
			verb: "داشته باشد"
		},
		array: {
			unit: "آیتم",
			verb: "داشته باشد"
		},
		set: {
			unit: "آیتم",
			verb: "داشته باشد"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "عدد";
			case "object":
				if (Array.isArray(Q)) return "آرایه";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "ورودی",
		email: "آدرس ایمیل",
		url: "URL",
		emoji: "ایموجی",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "تاریخ و زمان ایزو",
		date: "تاریخ ایزو",
		time: "زمان ایزو",
		duration: "مدت زمان ایزو",
		ipv4: "IPv4 آدرس",
		ipv6: "IPv6 آدرس",
		cidrv4: "IPv4 دامنه",
		cidrv6: "IPv6 دامنه",
		base64: "base64-encoded رشته",
		base64url: "base64url-encoded رشته",
		json_string: "JSON رشته",
		e164: "E.164 عدد",
		jwt: "JWT",
		template_literal: "ورودی"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `ورودی نامعتبر: می‌بایست ${Q.expected} می‌بود، ${J(Q.input)} دریافت شد`;
			case "invalid_value":
				if (Q.values.length === 1) return `ورودی نامعتبر: می‌بایست ${v(Q.values[0])} می‌بود`;
				return `گزینه نامعتبر: می‌بایست یکی از ${A(Q.values, "|")} می‌بود`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `خیلی بزرگ: ${Q.origin ?? "مقدار"} باید ${Y}${Q.maximum.toString()} ${z.unit ?? "عنصر"} باشد`;
				return `خیلی بزرگ: ${Q.origin ?? "مقدار"} باید ${Y}${Q.maximum.toString()} باشد`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `خیلی کوچک: ${Q.origin} باید ${Y}${Q.minimum.toString()} ${z.unit} باشد`;
				return `خیلی کوچک: ${Q.origin} باید ${Y}${Q.minimum.toString()} باشد`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `رشته نامعتبر: باید با "${Y.prefix}" شروع شود`;
				if (Y.format === "ends_with") return `رشته نامعتبر: باید با "${Y.suffix}" تمام شود`;
				if (Y.format === "includes") return `رشته نامعتبر: باید شامل "${Y.includes}" باشد`;
				if (Y.format === "regex") return `رشته نامعتبر: باید با الگوی ${Y.pattern} مطابقت داشته باشد`;
				return `${W[Y.format] ?? Q.format} نامعتبر`;
			}
			case "not_multiple_of": return `عدد نامعتبر: باید مضرب ${Q.divisor} باشد`;
			case "unrecognized_keys": return `کلید${Q.keys.length > 1 ? "های" : ""} ناشناس: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `کلید ناشناس در ${Q.origin}`;
			case "invalid_union": return "ورودی نامعتبر";
			case "invalid_element": return `مقدار نامعتبر در ${Q.origin}`;
			default: return "ورودی نامعتبر";
		}
	};
};
function ZG() {
	return { localeError: OC() };
}
var wC = () => {
	let $ = {
		string: {
			unit: "merkkiä",
			subject: "merkkijonon"
		},
		file: {
			unit: "tavua",
			subject: "tiedoston"
		},
		array: {
			unit: "alkiota",
			subject: "listan"
		},
		set: {
			unit: "alkiota",
			subject: "joukon"
		},
		number: {
			unit: "",
			subject: "luvun"
		},
		bigint: {
			unit: "",
			subject: "suuren kokonaisluvun"
		},
		int: {
			unit: "",
			subject: "kokonaisluvun"
		},
		date: {
			unit: "",
			subject: "päivämäärän"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "säännöllinen lauseke",
		email: "sähköpostiosoite",
		url: "URL-osoite",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO-aikaleima",
		date: "ISO-päivämäärä",
		time: "ISO-aika",
		duration: "ISO-kesto",
		ipv4: "IPv4-osoite",
		ipv6: "IPv6-osoite",
		cidrv4: "IPv4-alue",
		cidrv6: "IPv6-alue",
		base64: "base64-koodattu merkkijono",
		base64url: "base64url-koodattu merkkijono",
		json_string: "JSON-merkkijono",
		e164: "E.164-luku",
		jwt: "JWT",
		template_literal: "templaattimerkkijono"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Virheellinen tyyppi: odotettiin ${Q.expected}, oli ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Virheellinen syöte: täytyy olla ${v(Q.values[0])}`;
				return `Virheellinen valinta: täytyy olla yksi seuraavista: ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Liian suuri: ${z.subject} täytyy olla ${Y}${Q.maximum.toString()} ${z.unit}`.trim();
				return `Liian suuri: arvon täytyy olla ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Liian pieni: ${z.subject} täytyy olla ${Y}${Q.minimum.toString()} ${z.unit}`.trim();
				return `Liian pieni: arvon täytyy olla ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Virheellinen syöte: täytyy alkaa "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Virheellinen syöte: täytyy loppua "${Y.suffix}"`;
				if (Y.format === "includes") return `Virheellinen syöte: täytyy sisältää "${Y.includes}"`;
				if (Y.format === "regex") return `Virheellinen syöte: täytyy vastata säännöllistä lauseketta ${Y.pattern}`;
				return `Virheellinen ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Virheellinen luku: täytyy olla luvun ${Q.divisor} monikerta`;
			case "unrecognized_keys": return `${Q.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return "Virheellinen avain tietueessa";
			case "invalid_union": return "Virheellinen unioni";
			case "invalid_element": return "Virheellinen arvo joukossa";
			default: return "Virheellinen syöte";
		}
	};
};
function bG() {
	return { localeError: wC() };
}
var BC = () => {
	let $ = {
		string: {
			unit: "caractères",
			verb: "avoir"
		},
		file: {
			unit: "octets",
			verb: "avoir"
		},
		array: {
			unit: "éléments",
			verb: "avoir"
		},
		set: {
			unit: "éléments",
			verb: "avoir"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "nombre";
			case "object":
				if (Array.isArray(Q)) return "tableau";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "entrée",
		email: "adresse e-mail",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "date et heure ISO",
		date: "date ISO",
		time: "heure ISO",
		duration: "durée ISO",
		ipv4: "adresse IPv4",
		ipv6: "adresse IPv6",
		cidrv4: "plage IPv4",
		cidrv6: "plage IPv6",
		base64: "chaîne encodée en base64",
		base64url: "chaîne encodée en base64url",
		json_string: "chaîne JSON",
		e164: "numéro E.164",
		jwt: "JWT",
		template_literal: "entrée"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Entrée invalide : ${Q.expected} attendu, ${J(Q.input)} reçu`;
			case "invalid_value":
				if (Q.values.length === 1) return `Entrée invalide : ${v(Q.values[0])} attendu`;
				return `Option invalide : une valeur parmi ${A(Q.values, "|")} attendue`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Trop grand : ${Q.origin ?? "valeur"} doit ${z.verb} ${Y}${Q.maximum.toString()} ${z.unit ?? "élément(s)"}`;
				return `Trop grand : ${Q.origin ?? "valeur"} doit être ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Trop petit : ${Q.origin} doit ${z.verb} ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Trop petit : ${Q.origin} doit être ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Chaîne invalide : doit commencer par "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Chaîne invalide : doit se terminer par "${Y.suffix}"`;
				if (Y.format === "includes") return `Chaîne invalide : doit inclure "${Y.includes}"`;
				if (Y.format === "regex") return `Chaîne invalide : doit correspondre au modèle ${Y.pattern}`;
				return `${W[Y.format] ?? Q.format} invalide`;
			}
			case "not_multiple_of": return `Nombre invalide : doit être un multiple de ${Q.divisor}`;
			case "unrecognized_keys": return `Clé${Q.keys.length > 1 ? "s" : ""} non reconnue${Q.keys.length > 1 ? "s" : ""} : ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Clé invalide dans ${Q.origin}`;
			case "invalid_union": return "Entrée invalide";
			case "invalid_element": return `Valeur invalide dans ${Q.origin}`;
			default: return "Entrée invalide";
		}
	};
};
function RG() {
	return { localeError: BC() };
}
var qC = () => {
	let $ = {
		string: {
			unit: "caractères",
			verb: "avoir"
		},
		file: {
			unit: "octets",
			verb: "avoir"
		},
		array: {
			unit: "éléments",
			verb: "avoir"
		},
		set: {
			unit: "éléments",
			verb: "avoir"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "entrée",
		email: "adresse courriel",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "date-heure ISO",
		date: "date ISO",
		time: "heure ISO",
		duration: "durée ISO",
		ipv4: "adresse IPv4",
		ipv6: "adresse IPv6",
		cidrv4: "plage IPv4",
		cidrv6: "plage IPv6",
		base64: "chaîne encodée en base64",
		base64url: "chaîne encodée en base64url",
		json_string: "chaîne JSON",
		e164: "numéro E.164",
		jwt: "JWT",
		template_literal: "entrée"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Entrée invalide : attendu ${Q.expected}, reçu ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Entrée invalide : attendu ${v(Q.values[0])}`;
				return `Option invalide : attendu l'une des valeurs suivantes ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "≤" : "<", z = X(Q.origin);
				if (z) return `Trop grand : attendu que ${Q.origin ?? "la valeur"} ait ${Y}${Q.maximum.toString()} ${z.unit}`;
				return `Trop grand : attendu que ${Q.origin ?? "la valeur"} soit ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? "≥" : ">", z = X(Q.origin);
				if (z) return `Trop petit : attendu que ${Q.origin} ait ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Trop petit : attendu que ${Q.origin} soit ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Chaîne invalide : doit commencer par "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Chaîne invalide : doit se terminer par "${Y.suffix}"`;
				if (Y.format === "includes") return `Chaîne invalide : doit inclure "${Y.includes}"`;
				if (Y.format === "regex") return `Chaîne invalide : doit correspondre au motif ${Y.pattern}`;
				return `${W[Y.format] ?? Q.format} invalide`;
			}
			case "not_multiple_of": return `Nombre invalide : doit être un multiple de ${Q.divisor}`;
			case "unrecognized_keys": return `Clé${Q.keys.length > 1 ? "s" : ""} non reconnue${Q.keys.length > 1 ? "s" : ""} : ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Clé invalide dans ${Q.origin}`;
			case "invalid_union": return "Entrée invalide";
			case "invalid_element": return `Valeur invalide dans ${Q.origin}`;
			default: return "Entrée invalide";
		}
	};
};
function PG() {
	return { localeError: qC() };
}
var DC = () => {
	let $ = {
		string: {
			unit: "אותיות",
			verb: "לכלול"
		},
		file: {
			unit: "בייטים",
			verb: "לכלול"
		},
		array: {
			unit: "פריטים",
			verb: "לכלול"
		},
		set: {
			unit: "פריטים",
			verb: "לכלול"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "קלט",
		email: "כתובת אימייל",
		url: "כתובת רשת",
		emoji: "אימוג'י",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "תאריך וזמן ISO",
		date: "תאריך ISO",
		time: "זמן ISO",
		duration: "משך זמן ISO",
		ipv4: "כתובת IPv4",
		ipv6: "כתובת IPv6",
		cidrv4: "טווח IPv4",
		cidrv6: "טווח IPv6",
		base64: "מחרוזת בבסיס 64",
		base64url: "מחרוזת בבסיס 64 לכתובות רשת",
		json_string: "מחרוזת JSON",
		e164: "מספר E.164",
		jwt: "JWT",
		template_literal: "קלט"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `קלט לא תקין: צריך ${Q.expected}, התקבל ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `קלט לא תקין: צריך ${v(Q.values[0])}`;
				return `קלט לא תקין: צריך אחת מהאפשרויות  ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `גדול מדי: ${Q.origin ?? "value"} צריך להיות ${Y}${Q.maximum.toString()} ${z.unit ?? "elements"}`;
				return `גדול מדי: ${Q.origin ?? "value"} צריך להיות ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `קטן מדי: ${Q.origin} צריך להיות ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `קטן מדי: ${Q.origin} צריך להיות ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `מחרוזת לא תקינה: חייבת להתחיל ב"${Y.prefix}"`;
				if (Y.format === "ends_with") return `מחרוזת לא תקינה: חייבת להסתיים ב "${Y.suffix}"`;
				if (Y.format === "includes") return `מחרוזת לא תקינה: חייבת לכלול "${Y.includes}"`;
				if (Y.format === "regex") return `מחרוזת לא תקינה: חייבת להתאים לתבנית ${Y.pattern}`;
				return `${W[Y.format] ?? Q.format} לא תקין`;
			}
			case "not_multiple_of": return `מספר לא תקין: חייב להיות מכפלה של ${Q.divisor}`;
			case "unrecognized_keys": return `מפתח${Q.keys.length > 1 ? "ות" : ""} לא מזוה${Q.keys.length > 1 ? "ים" : "ה"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `מפתח לא תקין ב${Q.origin}`;
			case "invalid_union": return "קלט לא תקין";
			case "invalid_element": return `ערך לא תקין ב${Q.origin}`;
			default: return "קלט לא תקין";
		}
	};
};
function EG() {
	return { localeError: DC() };
}
var FC = () => {
	let $ = {
		string: {
			unit: "karakter",
			verb: "legyen"
		},
		file: {
			unit: "byte",
			verb: "legyen"
		},
		array: {
			unit: "elem",
			verb: "legyen"
		},
		set: {
			unit: "elem",
			verb: "legyen"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "szám";
			case "object":
				if (Array.isArray(Q)) return "tömb";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "bemenet",
		email: "email cím",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO időbélyeg",
		date: "ISO dátum",
		time: "ISO idő",
		duration: "ISO időintervallum",
		ipv4: "IPv4 cím",
		ipv6: "IPv6 cím",
		cidrv4: "IPv4 tartomány",
		cidrv6: "IPv6 tartomány",
		base64: "base64-kódolt string",
		base64url: "base64url-kódolt string",
		json_string: "JSON string",
		e164: "E.164 szám",
		jwt: "JWT",
		template_literal: "bemenet"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Érvénytelen bemenet: a várt érték ${Q.expected}, a kapott érték ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Érvénytelen bemenet: a várt érték ${v(Q.values[0])}`;
				return `Érvénytelen opció: valamelyik érték várt ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Túl nagy: ${Q.origin ?? "érték"} mérete túl nagy ${Y}${Q.maximum.toString()} ${z.unit ?? "elem"}`;
				return `Túl nagy: a bemeneti érték ${Q.origin ?? "érték"} túl nagy: ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Túl kicsi: a bemeneti érték ${Q.origin} mérete túl kicsi ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Túl kicsi: a bemeneti érték ${Q.origin} túl kicsi ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Érvénytelen string: "${Y.prefix}" értékkel kell kezdődnie`;
				if (Y.format === "ends_with") return `Érvénytelen string: "${Y.suffix}" értékkel kell végződnie`;
				if (Y.format === "includes") return `Érvénytelen string: "${Y.includes}" értéket kell tartalmaznia`;
				if (Y.format === "regex") return `Érvénytelen string: ${Y.pattern} mintának kell megfelelnie`;
				return `Érvénytelen ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Érvénytelen szám: ${Q.divisor} többszörösének kell lennie`;
			case "unrecognized_keys": return `Ismeretlen kulcs${Q.keys.length > 1 ? "s" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Érvénytelen kulcs ${Q.origin}`;
			case "invalid_union": return "Érvénytelen bemenet";
			case "invalid_element": return `Érvénytelen érték: ${Q.origin}`;
			default: return "Érvénytelen bemenet";
		}
	};
};
function SG() {
	return { localeError: FC() };
}
var jC = () => {
	let $ = {
		string: {
			unit: "karakter",
			verb: "memiliki"
		},
		file: {
			unit: "byte",
			verb: "memiliki"
		},
		array: {
			unit: "item",
			verb: "memiliki"
		},
		set: {
			unit: "item",
			verb: "memiliki"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "input",
		email: "alamat email",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "tanggal dan waktu format ISO",
		date: "tanggal format ISO",
		time: "jam format ISO",
		duration: "durasi format ISO",
		ipv4: "alamat IPv4",
		ipv6: "alamat IPv6",
		cidrv4: "rentang alamat IPv4",
		cidrv6: "rentang alamat IPv6",
		base64: "string dengan enkode base64",
		base64url: "string dengan enkode base64url",
		json_string: "string JSON",
		e164: "angka E.164",
		jwt: "JWT",
		template_literal: "input"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Input tidak valid: diharapkan ${Q.expected}, diterima ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Input tidak valid: diharapkan ${v(Q.values[0])}`;
				return `Pilihan tidak valid: diharapkan salah satu dari ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Terlalu besar: diharapkan ${Q.origin ?? "value"} memiliki ${Y}${Q.maximum.toString()} ${z.unit ?? "elemen"}`;
				return `Terlalu besar: diharapkan ${Q.origin ?? "value"} menjadi ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Terlalu kecil: diharapkan ${Q.origin} memiliki ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Terlalu kecil: diharapkan ${Q.origin} menjadi ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `String tidak valid: harus dimulai dengan "${Y.prefix}"`;
				if (Y.format === "ends_with") return `String tidak valid: harus berakhir dengan "${Y.suffix}"`;
				if (Y.format === "includes") return `String tidak valid: harus menyertakan "${Y.includes}"`;
				if (Y.format === "regex") return `String tidak valid: harus sesuai pola ${Y.pattern}`;
				return `${W[Y.format] ?? Q.format} tidak valid`;
			}
			case "not_multiple_of": return `Angka tidak valid: harus kelipatan dari ${Q.divisor}`;
			case "unrecognized_keys": return `Kunci tidak dikenali ${Q.keys.length > 1 ? "s" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Kunci tidak valid di ${Q.origin}`;
			case "invalid_union": return "Input tidak valid";
			case "invalid_element": return `Nilai tidak valid di ${Q.origin}`;
			default: return "Input tidak valid";
		}
	};
};
function vG() {
	return { localeError: jC() };
}
var LC = () => {
	let $ = {
		string: {
			unit: "caratteri",
			verb: "avere"
		},
		file: {
			unit: "byte",
			verb: "avere"
		},
		array: {
			unit: "elementi",
			verb: "avere"
		},
		set: {
			unit: "elementi",
			verb: "avere"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "numero";
			case "object":
				if (Array.isArray(Q)) return "vettore";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "input",
		email: "indirizzo email",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "data e ora ISO",
		date: "data ISO",
		time: "ora ISO",
		duration: "durata ISO",
		ipv4: "indirizzo IPv4",
		ipv6: "indirizzo IPv6",
		cidrv4: "intervallo IPv4",
		cidrv6: "intervallo IPv6",
		base64: "stringa codificata in base64",
		base64url: "URL codificata in base64",
		json_string: "stringa JSON",
		e164: "numero E.164",
		jwt: "JWT",
		template_literal: "input"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Input non valido: atteso ${Q.expected}, ricevuto ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Input non valido: atteso ${v(Q.values[0])}`;
				return `Opzione non valida: atteso uno tra ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Troppo grande: ${Q.origin ?? "valore"} deve avere ${Y}${Q.maximum.toString()} ${z.unit ?? "elementi"}`;
				return `Troppo grande: ${Q.origin ?? "valore"} deve essere ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Troppo piccolo: ${Q.origin} deve avere ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Troppo piccolo: ${Q.origin} deve essere ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Stringa non valida: deve iniziare con "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Stringa non valida: deve terminare con "${Y.suffix}"`;
				if (Y.format === "includes") return `Stringa non valida: deve includere "${Y.includes}"`;
				if (Y.format === "regex") return `Stringa non valida: deve corrispondere al pattern ${Y.pattern}`;
				return `Invalid ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Numero non valido: deve essere un multiplo di ${Q.divisor}`;
			case "unrecognized_keys": return `Chiav${Q.keys.length > 1 ? "i" : "e"} non riconosciut${Q.keys.length > 1 ? "e" : "a"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Chiave non valida in ${Q.origin}`;
			case "invalid_union": return "Input non valido";
			case "invalid_element": return `Valore non valido in ${Q.origin}`;
			default: return "Input non valido";
		}
	};
};
function CG() {
	return { localeError: LC() };
}
var MC = () => {
	let $ = {
		string: {
			unit: "文字",
			verb: "である"
		},
		file: {
			unit: "バイト",
			verb: "である"
		},
		array: {
			unit: "要素",
			verb: "である"
		},
		set: {
			unit: "要素",
			verb: "である"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "数値";
			case "object":
				if (Array.isArray(Q)) return "配列";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "入力値",
		email: "メールアドレス",
		url: "URL",
		emoji: "絵文字",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO日時",
		date: "ISO日付",
		time: "ISO時刻",
		duration: "ISO期間",
		ipv4: "IPv4アドレス",
		ipv6: "IPv6アドレス",
		cidrv4: "IPv4範囲",
		cidrv6: "IPv6範囲",
		base64: "base64エンコード文字列",
		base64url: "base64urlエンコード文字列",
		json_string: "JSON文字列",
		e164: "E.164番号",
		jwt: "JWT",
		template_literal: "入力値"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `無効な入力: ${Q.expected}が期待されましたが、${J(Q.input)}が入力されました`;
			case "invalid_value":
				if (Q.values.length === 1) return `無効な入力: ${v(Q.values[0])}が期待されました`;
				return `無効な選択: ${A(Q.values, "、")}のいずれかである必要があります`;
			case "too_big": {
				let Y = Q.inclusive ? "以下である" : "より小さい", z = X(Q.origin);
				if (z) return `大きすぎる値: ${Q.origin ?? "値"}は${Q.maximum.toString()}${z.unit ?? "要素"}${Y}必要があります`;
				return `大きすぎる値: ${Q.origin ?? "値"}は${Q.maximum.toString()}${Y}必要があります`;
			}
			case "too_small": {
				let Y = Q.inclusive ? "以上である" : "より大きい", z = X(Q.origin);
				if (z) return `小さすぎる値: ${Q.origin}は${Q.minimum.toString()}${z.unit}${Y}必要があります`;
				return `小さすぎる値: ${Q.origin}は${Q.minimum.toString()}${Y}必要があります`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `無効な文字列: "${Y.prefix}"で始まる必要があります`;
				if (Y.format === "ends_with") return `無効な文字列: "${Y.suffix}"で終わる必要があります`;
				if (Y.format === "includes") return `無効な文字列: "${Y.includes}"を含む必要があります`;
				if (Y.format === "regex") return `無効な文字列: パターン${Y.pattern}に一致する必要があります`;
				return `無効な${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `無効な数値: ${Q.divisor}の倍数である必要があります`;
			case "unrecognized_keys": return `認識されていないキー${Q.keys.length > 1 ? "群" : ""}: ${A(Q.keys, "、")}`;
			case "invalid_key": return `${Q.origin}内の無効なキー`;
			case "invalid_union": return "無効な入力";
			case "invalid_element": return `${Q.origin}内の無効な値`;
			default: return "無効な入力";
		}
	};
};
function kG() {
	return { localeError: MC() };
}
var AC = () => {
	let $ = {
		string: {
			unit: "តួអក្សរ",
			verb: "គួរមាន"
		},
		file: {
			unit: "បៃ",
			verb: "គួរមាន"
		},
		array: {
			unit: "ធាតុ",
			verb: "គួរមាន"
		},
		set: {
			unit: "ធាតុ",
			verb: "គួរមាន"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "មិនមែនជាលេខ (NaN)" : "លេខ";
			case "object":
				if (Array.isArray(Q)) return "អារេ (Array)";
				if (Q === null) return "គ្មានតម្លៃ (null)";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "ទិន្នន័យបញ្ចូល",
		email: "អាសយដ្ឋានអ៊ីមែល",
		url: "URL",
		emoji: "សញ្ញាអារម្មណ៍",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "កាលបរិច្ឆេទ និងម៉ោង ISO",
		date: "កាលបរិច្ឆេទ ISO",
		time: "ម៉ោង ISO",
		duration: "រយៈពេល ISO",
		ipv4: "អាសយដ្ឋាន IPv4",
		ipv6: "អាសយដ្ឋាន IPv6",
		cidrv4: "ដែនអាសយដ្ឋាន IPv4",
		cidrv6: "ដែនអាសយដ្ឋាន IPv6",
		base64: "ខ្សែអក្សរអ៊ិកូដ base64",
		base64url: "ខ្សែអក្សរអ៊ិកូដ base64url",
		json_string: "ខ្សែអក្សរ JSON",
		e164: "លេខ E.164",
		jwt: "JWT",
		template_literal: "ទិន្នន័យបញ្ចូល"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ ${Q.expected} ប៉ុន្តែទទួលបាន ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ ${v(Q.values[0])}`;
				return `ជម្រើសមិនត្រឹមត្រូវ៖ ត្រូវជាមួយក្នុងចំណោម ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `ធំពេក៖ ត្រូវការ ${Q.origin ?? "តម្លៃ"} ${Y} ${Q.maximum.toString()} ${z.unit ?? "ធាតុ"}`;
				return `ធំពេក៖ ត្រូវការ ${Q.origin ?? "តម្លៃ"} ${Y} ${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `តូចពេក៖ ត្រូវការ ${Q.origin} ${Y} ${Q.minimum.toString()} ${z.unit}`;
				return `តូចពេក៖ ត្រូវការ ${Q.origin} ${Y} ${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវចាប់ផ្តើមដោយ "${Y.prefix}"`;
				if (Y.format === "ends_with") return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវបញ្ចប់ដោយ "${Y.suffix}"`;
				if (Y.format === "includes") return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវមាន "${Y.includes}"`;
				if (Y.format === "regex") return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវតែផ្គូផ្គងនឹងទម្រង់ដែលបានកំណត់ ${Y.pattern}`;
				return `មិនត្រឹមត្រូវ៖ ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `លេខមិនត្រឹមត្រូវ៖ ត្រូវតែជាពហុគុណនៃ ${Q.divisor}`;
			case "unrecognized_keys": return `រកឃើញសោមិនស្គាល់៖ ${A(Q.keys, ", ")}`;
			case "invalid_key": return `សោមិនត្រឹមត្រូវនៅក្នុង ${Q.origin}`;
			case "invalid_union": return "ទិន្នន័យមិនត្រឹមត្រូវ";
			case "invalid_element": return `ទិន្នន័យមិនត្រឹមត្រូវនៅក្នុង ${Q.origin}`;
			default: return "ទិន្នន័យមិនត្រឹមត្រូវ";
		}
	};
};
function _G() {
	return { localeError: AC() };
}
var IC = () => {
	let $ = {
		string: {
			unit: "문자",
			verb: "to have"
		},
		file: {
			unit: "바이트",
			verb: "to have"
		},
		array: {
			unit: "개",
			verb: "to have"
		},
		set: {
			unit: "개",
			verb: "to have"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "입력",
		email: "이메일 주소",
		url: "URL",
		emoji: "이모지",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO 날짜시간",
		date: "ISO 날짜",
		time: "ISO 시간",
		duration: "ISO 기간",
		ipv4: "IPv4 주소",
		ipv6: "IPv6 주소",
		cidrv4: "IPv4 범위",
		cidrv6: "IPv6 범위",
		base64: "base64 인코딩 문자열",
		base64url: "base64url 인코딩 문자열",
		json_string: "JSON 문자열",
		e164: "E.164 번호",
		jwt: "JWT",
		template_literal: "입력"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `잘못된 입력: 예상 타입은 ${Q.expected}, 받은 타입은 ${J(Q.input)}입니다`;
			case "invalid_value":
				if (Q.values.length === 1) return `잘못된 입력: 값은 ${v(Q.values[0])} 이어야 합니다`;
				return `잘못된 옵션: ${A(Q.values, "또는 ")} 중 하나여야 합니다`;
			case "too_big": {
				let Y = Q.inclusive ? "이하" : "미만", z = Y === "미만" ? "이어야 합니다" : "여야 합니다", G = X(Q.origin), H = G?.unit ?? "요소";
				if (G) return `${Q.origin ?? "값"}이 너무 큽니다: ${Q.maximum.toString()}${H} ${Y}${z}`;
				return `${Q.origin ?? "값"}이 너무 큽니다: ${Q.maximum.toString()} ${Y}${z}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? "이상" : "초과", z = Y === "이상" ? "이어야 합니다" : "여야 합니다", G = X(Q.origin), H = G?.unit ?? "요소";
				if (G) return `${Q.origin ?? "값"}이 너무 작습니다: ${Q.minimum.toString()}${H} ${Y}${z}`;
				return `${Q.origin ?? "값"}이 너무 작습니다: ${Q.minimum.toString()} ${Y}${z}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `잘못된 문자열: "${Y.prefix}"(으)로 시작해야 합니다`;
				if (Y.format === "ends_with") return `잘못된 문자열: "${Y.suffix}"(으)로 끝나야 합니다`;
				if (Y.format === "includes") return `잘못된 문자열: "${Y.includes}"을(를) 포함해야 합니다`;
				if (Y.format === "regex") return `잘못된 문자열: 정규식 ${Y.pattern} 패턴과 일치해야 합니다`;
				return `잘못된 ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `잘못된 숫자: ${Q.divisor}의 배수여야 합니다`;
			case "unrecognized_keys": return `인식할 수 없는 키: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `잘못된 키: ${Q.origin}`;
			case "invalid_union": return "잘못된 입력";
			case "invalid_element": return `잘못된 값: ${Q.origin}`;
			default: return "잘못된 입력";
		}
	};
};
function xG() {
	return { localeError: IC() };
}
var ZC = () => {
	let $ = {
		string: {
			unit: "знаци",
			verb: "да имаат"
		},
		file: {
			unit: "бајти",
			verb: "да имаат"
		},
		array: {
			unit: "ставки",
			verb: "да имаат"
		},
		set: {
			unit: "ставки",
			verb: "да имаат"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "број";
			case "object":
				if (Array.isArray(Q)) return "низа";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "внес",
		email: "адреса на е-пошта",
		url: "URL",
		emoji: "емоџи",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO датум и време",
		date: "ISO датум",
		time: "ISO време",
		duration: "ISO времетраење",
		ipv4: "IPv4 адреса",
		ipv6: "IPv6 адреса",
		cidrv4: "IPv4 опсег",
		cidrv6: "IPv6 опсег",
		base64: "base64-енкодирана низа",
		base64url: "base64url-енкодирана низа",
		json_string: "JSON низа",
		e164: "E.164 број",
		jwt: "JWT",
		template_literal: "внес"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Грешен внес: се очекува ${Q.expected}, примено ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Invalid input: expected ${v(Q.values[0])}`;
				return `Грешана опција: се очекува една ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Премногу голем: се очекува ${Q.origin ?? "вредноста"} да има ${Y}${Q.maximum.toString()} ${z.unit ?? "елементи"}`;
				return `Премногу голем: се очекува ${Q.origin ?? "вредноста"} да биде ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Премногу мал: се очекува ${Q.origin} да има ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Премногу мал: се очекува ${Q.origin} да биде ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Неважечка низа: мора да започнува со "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Неважечка низа: мора да завршува со "${Y.suffix}"`;
				if (Y.format === "includes") return `Неважечка низа: мора да вклучува "${Y.includes}"`;
				if (Y.format === "regex") return `Неважечка низа: мора да одгоара на патернот ${Y.pattern}`;
				return `Invalid ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Грешен број: мора да биде делив со ${Q.divisor}`;
			case "unrecognized_keys": return `${Q.keys.length > 1 ? "Непрепознаени клучеви" : "Непрепознаен клуч"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Грешен клуч во ${Q.origin}`;
			case "invalid_union": return "Грешен внес";
			case "invalid_element": return `Грешна вредност во ${Q.origin}`;
			default: return "Грешен внес";
		}
	};
};
function TG() {
	return { localeError: ZC() };
}
var bC = () => {
	let $ = {
		string: {
			unit: "aksara",
			verb: "mempunyai"
		},
		file: {
			unit: "bait",
			verb: "mempunyai"
		},
		array: {
			unit: "elemen",
			verb: "mempunyai"
		},
		set: {
			unit: "elemen",
			verb: "mempunyai"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "nombor";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "input",
		email: "alamat e-mel",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "tarikh masa ISO",
		date: "tarikh ISO",
		time: "masa ISO",
		duration: "tempoh ISO",
		ipv4: "alamat IPv4",
		ipv6: "alamat IPv6",
		cidrv4: "julat IPv4",
		cidrv6: "julat IPv6",
		base64: "string dikodkan base64",
		base64url: "string dikodkan base64url",
		json_string: "string JSON",
		e164: "nombor E.164",
		jwt: "JWT",
		template_literal: "input"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Input tidak sah: dijangka ${Q.expected}, diterima ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Input tidak sah: dijangka ${v(Q.values[0])}`;
				return `Pilihan tidak sah: dijangka salah satu daripada ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Terlalu besar: dijangka ${Q.origin ?? "nilai"} ${z.verb} ${Y}${Q.maximum.toString()} ${z.unit ?? "elemen"}`;
				return `Terlalu besar: dijangka ${Q.origin ?? "nilai"} adalah ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Terlalu kecil: dijangka ${Q.origin} ${z.verb} ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Terlalu kecil: dijangka ${Q.origin} adalah ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `String tidak sah: mesti bermula dengan "${Y.prefix}"`;
				if (Y.format === "ends_with") return `String tidak sah: mesti berakhir dengan "${Y.suffix}"`;
				if (Y.format === "includes") return `String tidak sah: mesti mengandungi "${Y.includes}"`;
				if (Y.format === "regex") return `String tidak sah: mesti sepadan dengan corak ${Y.pattern}`;
				return `${W[Y.format] ?? Q.format} tidak sah`;
			}
			case "not_multiple_of": return `Nombor tidak sah: perlu gandaan ${Q.divisor}`;
			case "unrecognized_keys": return `Kunci tidak dikenali: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Kunci tidak sah dalam ${Q.origin}`;
			case "invalid_union": return "Input tidak sah";
			case "invalid_element": return `Nilai tidak sah dalam ${Q.origin}`;
			default: return "Input tidak sah";
		}
	};
};
function fG() {
	return { localeError: bC() };
}
var RC = () => {
	let $ = {
		string: { unit: "tekens" },
		file: { unit: "bytes" },
		array: { unit: "elementen" },
		set: { unit: "elementen" }
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "getal";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "invoer",
		email: "emailadres",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datum en tijd",
		date: "ISO datum",
		time: "ISO tijd",
		duration: "ISO duur",
		ipv4: "IPv4-adres",
		ipv6: "IPv6-adres",
		cidrv4: "IPv4-bereik",
		cidrv6: "IPv6-bereik",
		base64: "base64-gecodeerde tekst",
		base64url: "base64 URL-gecodeerde tekst",
		json_string: "JSON string",
		e164: "E.164-nummer",
		jwt: "JWT",
		template_literal: "invoer"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Ongeldige invoer: verwacht ${Q.expected}, ontving ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Ongeldige invoer: verwacht ${v(Q.values[0])}`;
				return `Ongeldige optie: verwacht één van ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Te lang: verwacht dat ${Q.origin ?? "waarde"} ${Y}${Q.maximum.toString()} ${z.unit ?? "elementen"} bevat`;
				return `Te lang: verwacht dat ${Q.origin ?? "waarde"} ${Y}${Q.maximum.toString()} is`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Te kort: verwacht dat ${Q.origin} ${Y}${Q.minimum.toString()} ${z.unit} bevat`;
				return `Te kort: verwacht dat ${Q.origin} ${Y}${Q.minimum.toString()} is`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Ongeldige tekst: moet met "${Y.prefix}" beginnen`;
				if (Y.format === "ends_with") return `Ongeldige tekst: moet op "${Y.suffix}" eindigen`;
				if (Y.format === "includes") return `Ongeldige tekst: moet "${Y.includes}" bevatten`;
				if (Y.format === "regex") return `Ongeldige tekst: moet overeenkomen met patroon ${Y.pattern}`;
				return `Ongeldig: ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Ongeldig getal: moet een veelvoud van ${Q.divisor} zijn`;
			case "unrecognized_keys": return `Onbekende key${Q.keys.length > 1 ? "s" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Ongeldige key in ${Q.origin}`;
			case "invalid_union": return "Ongeldige invoer";
			case "invalid_element": return `Ongeldige waarde in ${Q.origin}`;
			default: return "Ongeldige invoer";
		}
	};
};
function yG() {
	return { localeError: RC() };
}
var PC = () => {
	let $ = {
		string: {
			unit: "tegn",
			verb: "å ha"
		},
		file: {
			unit: "bytes",
			verb: "å ha"
		},
		array: {
			unit: "elementer",
			verb: "å inneholde"
		},
		set: {
			unit: "elementer",
			verb: "å inneholde"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "tall";
			case "object":
				if (Array.isArray(Q)) return "liste";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "input",
		email: "e-postadresse",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO dato- og klokkeslett",
		date: "ISO-dato",
		time: "ISO-klokkeslett",
		duration: "ISO-varighet",
		ipv4: "IPv4-område",
		ipv6: "IPv6-område",
		cidrv4: "IPv4-spekter",
		cidrv6: "IPv6-spekter",
		base64: "base64-enkodet streng",
		base64url: "base64url-enkodet streng",
		json_string: "JSON-streng",
		e164: "E.164-nummer",
		jwt: "JWT",
		template_literal: "input"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Ugyldig input: forventet ${Q.expected}, fikk ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Ugyldig verdi: forventet ${v(Q.values[0])}`;
				return `Ugyldig valg: forventet en av ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `For stor(t): forventet ${Q.origin ?? "value"} til å ha ${Y}${Q.maximum.toString()} ${z.unit ?? "elementer"}`;
				return `For stor(t): forventet ${Q.origin ?? "value"} til å ha ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `For lite(n): forventet ${Q.origin} til å ha ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `For lite(n): forventet ${Q.origin} til å ha ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Ugyldig streng: må starte med "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Ugyldig streng: må ende med "${Y.suffix}"`;
				if (Y.format === "includes") return `Ugyldig streng: må inneholde "${Y.includes}"`;
				if (Y.format === "regex") return `Ugyldig streng: må matche mønsteret ${Y.pattern}`;
				return `Ugyldig ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Ugyldig tall: må være et multiplum av ${Q.divisor}`;
			case "unrecognized_keys": return `${Q.keys.length > 1 ? "Ukjente nøkler" : "Ukjent nøkkel"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Ugyldig nøkkel i ${Q.origin}`;
			case "invalid_union": return "Ugyldig input";
			case "invalid_element": return `Ugyldig verdi i ${Q.origin}`;
			default: return "Ugyldig input";
		}
	};
};
function gG() {
	return { localeError: PC() };
}
var EC = () => {
	let $ = {
		string: {
			unit: "harf",
			verb: "olmalıdır"
		},
		file: {
			unit: "bayt",
			verb: "olmalıdır"
		},
		array: {
			unit: "unsur",
			verb: "olmalıdır"
		},
		set: {
			unit: "unsur",
			verb: "olmalıdır"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "numara";
			case "object":
				if (Array.isArray(Q)) return "saf";
				if (Q === null) return "gayb";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "giren",
		email: "epostagâh",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO hengâmı",
		date: "ISO tarihi",
		time: "ISO zamanı",
		duration: "ISO müddeti",
		ipv4: "IPv4 nişânı",
		ipv6: "IPv6 nişânı",
		cidrv4: "IPv4 menzili",
		cidrv6: "IPv6 menzili",
		base64: "base64-şifreli metin",
		base64url: "base64url-şifreli metin",
		json_string: "JSON metin",
		e164: "E.164 sayısı",
		jwt: "JWT",
		template_literal: "giren"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Fâsit giren: umulan ${Q.expected}, alınan ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Fâsit giren: umulan ${v(Q.values[0])}`;
				return `Fâsit tercih: mûteberler ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Fazla büyük: ${Q.origin ?? "value"}, ${Y}${Q.maximum.toString()} ${z.unit ?? "elements"} sahip olmalıydı.`;
				return `Fazla büyük: ${Q.origin ?? "value"}, ${Y}${Q.maximum.toString()} olmalıydı.`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Fazla küçük: ${Q.origin}, ${Y}${Q.minimum.toString()} ${z.unit} sahip olmalıydı.`;
				return `Fazla küçük: ${Q.origin}, ${Y}${Q.minimum.toString()} olmalıydı.`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Fâsit metin: "${Y.prefix}" ile başlamalı.`;
				if (Y.format === "ends_with") return `Fâsit metin: "${Y.suffix}" ile bitmeli.`;
				if (Y.format === "includes") return `Fâsit metin: "${Y.includes}" ihtivâ etmeli.`;
				if (Y.format === "regex") return `Fâsit metin: ${Y.pattern} nakşına uymalı.`;
				return `Fâsit ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Fâsit sayı: ${Q.divisor} katı olmalıydı.`;
			case "unrecognized_keys": return `Tanınmayan anahtar ${Q.keys.length > 1 ? "s" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `${Q.origin} için tanınmayan anahtar var.`;
			case "invalid_union": return "Giren tanınamadı.";
			case "invalid_element": return `${Q.origin} için tanınmayan kıymet var.`;
			default: return "Kıymet tanınamadı.";
		}
	};
};
function hG() {
	return { localeError: EC() };
}
var SC = () => {
	let $ = {
		string: {
			unit: "توکي",
			verb: "ولري"
		},
		file: {
			unit: "بایټس",
			verb: "ولري"
		},
		array: {
			unit: "توکي",
			verb: "ولري"
		},
		set: {
			unit: "توکي",
			verb: "ولري"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "عدد";
			case "object":
				if (Array.isArray(Q)) return "ارې";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "ورودي",
		email: "بریښنالیک",
		url: "یو آر ال",
		emoji: "ایموجي",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "نیټه او وخت",
		date: "نېټه",
		time: "وخت",
		duration: "موده",
		ipv4: "د IPv4 پته",
		ipv6: "د IPv6 پته",
		cidrv4: "د IPv4 ساحه",
		cidrv6: "د IPv6 ساحه",
		base64: "base64-encoded متن",
		base64url: "base64url-encoded متن",
		json_string: "JSON متن",
		e164: "د E.164 شمېره",
		jwt: "JWT",
		template_literal: "ورودي"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `ناسم ورودي: باید ${Q.expected} وای, مګر ${J(Q.input)} ترلاسه شو`;
			case "invalid_value":
				if (Q.values.length === 1) return `ناسم ورودي: باید ${v(Q.values[0])} وای`;
				return `ناسم انتخاب: باید یو له ${A(Q.values, "|")} څخه وای`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `ډیر لوی: ${Q.origin ?? "ارزښت"} باید ${Y}${Q.maximum.toString()} ${z.unit ?? "عنصرونه"} ولري`;
				return `ډیر لوی: ${Q.origin ?? "ارزښت"} باید ${Y}${Q.maximum.toString()} وي`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `ډیر کوچنی: ${Q.origin} باید ${Y}${Q.minimum.toString()} ${z.unit} ولري`;
				return `ډیر کوچنی: ${Q.origin} باید ${Y}${Q.minimum.toString()} وي`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `ناسم متن: باید د "${Y.prefix}" سره پیل شي`;
				if (Y.format === "ends_with") return `ناسم متن: باید د "${Y.suffix}" سره پای ته ورسيږي`;
				if (Y.format === "includes") return `ناسم متن: باید "${Y.includes}" ولري`;
				if (Y.format === "regex") return `ناسم متن: باید د ${Y.pattern} سره مطابقت ولري`;
				return `${W[Y.format] ?? Q.format} ناسم دی`;
			}
			case "not_multiple_of": return `ناسم عدد: باید د ${Q.divisor} مضرب وي`;
			case "unrecognized_keys": return `ناسم ${Q.keys.length > 1 ? "کلیډونه" : "کلیډ"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `ناسم کلیډ په ${Q.origin} کې`;
			case "invalid_union": return "ناسمه ورودي";
			case "invalid_element": return `ناسم عنصر په ${Q.origin} کې`;
			default: return "ناسمه ورودي";
		}
	};
};
function uG() {
	return { localeError: SC() };
}
var vC = () => {
	let $ = {
		string: {
			unit: "znaków",
			verb: "mieć"
		},
		file: {
			unit: "bajtów",
			verb: "mieć"
		},
		array: {
			unit: "elementów",
			verb: "mieć"
		},
		set: {
			unit: "elementów",
			verb: "mieć"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "liczba";
			case "object":
				if (Array.isArray(Q)) return "tablica";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "wyrażenie",
		email: "adres email",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "data i godzina w formacie ISO",
		date: "data w formacie ISO",
		time: "godzina w formacie ISO",
		duration: "czas trwania ISO",
		ipv4: "adres IPv4",
		ipv6: "adres IPv6",
		cidrv4: "zakres IPv4",
		cidrv6: "zakres IPv6",
		base64: "ciąg znaków zakodowany w formacie base64",
		base64url: "ciąg znaków zakodowany w formacie base64url",
		json_string: "ciąg znaków w formacie JSON",
		e164: "liczba E.164",
		jwt: "JWT",
		template_literal: "wejście"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Nieprawidłowe dane wejściowe: oczekiwano ${Q.expected}, otrzymano ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Nieprawidłowe dane wejściowe: oczekiwano ${v(Q.values[0])}`;
				return `Nieprawidłowa opcja: oczekiwano jednej z wartości ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Za duża wartość: oczekiwano, że ${Q.origin ?? "wartość"} będzie mieć ${Y}${Q.maximum.toString()} ${z.unit ?? "elementów"}`;
				return `Zbyt duż(y/a/e): oczekiwano, że ${Q.origin ?? "wartość"} będzie wynosić ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Za mała wartość: oczekiwano, że ${Q.origin ?? "wartość"} będzie mieć ${Y}${Q.minimum.toString()} ${z.unit ?? "elementów"}`;
				return `Zbyt mał(y/a/e): oczekiwano, że ${Q.origin ?? "wartość"} będzie wynosić ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Nieprawidłowy ciąg znaków: musi zaczynać się od "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Nieprawidłowy ciąg znaków: musi kończyć się na "${Y.suffix}"`;
				if (Y.format === "includes") return `Nieprawidłowy ciąg znaków: musi zawierać "${Y.includes}"`;
				if (Y.format === "regex") return `Nieprawidłowy ciąg znaków: musi odpowiadać wzorcowi ${Y.pattern}`;
				return `Nieprawidłow(y/a/e) ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Nieprawidłowa liczba: musi być wielokrotnością ${Q.divisor}`;
			case "unrecognized_keys": return `Nierozpoznane klucze${Q.keys.length > 1 ? "s" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Nieprawidłowy klucz w ${Q.origin}`;
			case "invalid_union": return "Nieprawidłowe dane wejściowe";
			case "invalid_element": return `Nieprawidłowa wartość w ${Q.origin}`;
			default: return "Nieprawidłowe dane wejściowe";
		}
	};
};
function mG() {
	return { localeError: vC() };
}
var CC = () => {
	let $ = {
		string: {
			unit: "caracteres",
			verb: "ter"
		},
		file: {
			unit: "bytes",
			verb: "ter"
		},
		array: {
			unit: "itens",
			verb: "ter"
		},
		set: {
			unit: "itens",
			verb: "ter"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "número";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "nulo";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "padrão",
		email: "endereço de e-mail",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "data e hora ISO",
		date: "data ISO",
		time: "hora ISO",
		duration: "duração ISO",
		ipv4: "endereço IPv4",
		ipv6: "endereço IPv6",
		cidrv4: "faixa de IPv4",
		cidrv6: "faixa de IPv6",
		base64: "texto codificado em base64",
		base64url: "URL codificada em base64",
		json_string: "texto JSON",
		e164: "número E.164",
		jwt: "JWT",
		template_literal: "entrada"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Tipo inválido: esperado ${Q.expected}, recebido ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Entrada inválida: esperado ${v(Q.values[0])}`;
				return `Opção inválida: esperada uma das ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Muito grande: esperado que ${Q.origin ?? "valor"} tivesse ${Y}${Q.maximum.toString()} ${z.unit ?? "elementos"}`;
				return `Muito grande: esperado que ${Q.origin ?? "valor"} fosse ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Muito pequeno: esperado que ${Q.origin} tivesse ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Muito pequeno: esperado que ${Q.origin} fosse ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Texto inválido: deve começar com "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Texto inválido: deve terminar com "${Y.suffix}"`;
				if (Y.format === "includes") return `Texto inválido: deve incluir "${Y.includes}"`;
				if (Y.format === "regex") return `Texto inválido: deve corresponder ao padrão ${Y.pattern}`;
				return `${W[Y.format] ?? Q.format} inválido`;
			}
			case "not_multiple_of": return `Número inválido: deve ser múltiplo de ${Q.divisor}`;
			case "unrecognized_keys": return `Chave${Q.keys.length > 1 ? "s" : ""} desconhecida${Q.keys.length > 1 ? "s" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Chave inválida em ${Q.origin}`;
			case "invalid_union": return "Entrada inválida";
			case "invalid_element": return `Valor inválido em ${Q.origin}`;
			default: return "Campo inválido";
		}
	};
};
function lG() {
	return { localeError: CC() };
}
function JD($, X, J, W) {
	let Q = Math.abs($), Y = Q % 10, z = Q % 100;
	if (z >= 11 && z <= 19) return W;
	if (Y === 1) return X;
	if (Y >= 2 && Y <= 4) return J;
	return W;
}
var kC = () => {
	let $ = {
		string: {
			unit: {
				one: "символ",
				few: "символа",
				many: "символов"
			},
			verb: "иметь"
		},
		file: {
			unit: {
				one: "байт",
				few: "байта",
				many: "байт"
			},
			verb: "иметь"
		},
		array: {
			unit: {
				one: "элемент",
				few: "элемента",
				many: "элементов"
			},
			verb: "иметь"
		},
		set: {
			unit: {
				one: "элемент",
				few: "элемента",
				many: "элементов"
			},
			verb: "иметь"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "число";
			case "object":
				if (Array.isArray(Q)) return "массив";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "ввод",
		email: "email адрес",
		url: "URL",
		emoji: "эмодзи",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO дата и время",
		date: "ISO дата",
		time: "ISO время",
		duration: "ISO длительность",
		ipv4: "IPv4 адрес",
		ipv6: "IPv6 адрес",
		cidrv4: "IPv4 диапазон",
		cidrv6: "IPv6 диапазон",
		base64: "строка в формате base64",
		base64url: "строка в формате base64url",
		json_string: "JSON строка",
		e164: "номер E.164",
		jwt: "JWT",
		template_literal: "ввод"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Неверный ввод: ожидалось ${Q.expected}, получено ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Неверный ввод: ожидалось ${v(Q.values[0])}`;
				return `Неверный вариант: ожидалось одно из ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) {
					let H = JD(Number(Q.maximum), z.unit.one, z.unit.few, z.unit.many);
					return `Слишком большое значение: ожидалось, что ${Q.origin ?? "значение"} будет иметь ${Y}${Q.maximum.toString()} ${H}`;
				}
				return `Слишком большое значение: ожидалось, что ${Q.origin ?? "значение"} будет ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) {
					let H = JD(Number(Q.minimum), z.unit.one, z.unit.few, z.unit.many);
					return `Слишком маленькое значение: ожидалось, что ${Q.origin} будет иметь ${Y}${Q.minimum.toString()} ${H}`;
				}
				return `Слишком маленькое значение: ожидалось, что ${Q.origin} будет ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Неверная строка: должна начинаться с "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Неверная строка: должна заканчиваться на "${Y.suffix}"`;
				if (Y.format === "includes") return `Неверная строка: должна содержать "${Y.includes}"`;
				if (Y.format === "regex") return `Неверная строка: должна соответствовать шаблону ${Y.pattern}`;
				return `Неверный ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Неверное число: должно быть кратным ${Q.divisor}`;
			case "unrecognized_keys": return `Нераспознанн${Q.keys.length > 1 ? "ые" : "ый"} ключ${Q.keys.length > 1 ? "и" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Неверный ключ в ${Q.origin}`;
			case "invalid_union": return "Неверные входные данные";
			case "invalid_element": return `Неверное значение в ${Q.origin}`;
			default: return "Неверные входные данные";
		}
	};
};
function cG() {
	return { localeError: kC() };
}
var _C = () => {
	let $ = {
		string: {
			unit: "znakov",
			verb: "imeti"
		},
		file: {
			unit: "bajtov",
			verb: "imeti"
		},
		array: {
			unit: "elementov",
			verb: "imeti"
		},
		set: {
			unit: "elementov",
			verb: "imeti"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "število";
			case "object":
				if (Array.isArray(Q)) return "tabela";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "vnos",
		email: "e-poštni naslov",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datum in čas",
		date: "ISO datum",
		time: "ISO čas",
		duration: "ISO trajanje",
		ipv4: "IPv4 naslov",
		ipv6: "IPv6 naslov",
		cidrv4: "obseg IPv4",
		cidrv6: "obseg IPv6",
		base64: "base64 kodiran niz",
		base64url: "base64url kodiran niz",
		json_string: "JSON niz",
		e164: "E.164 številka",
		jwt: "JWT",
		template_literal: "vnos"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Neveljaven vnos: pričakovano ${Q.expected}, prejeto ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Neveljaven vnos: pričakovano ${v(Q.values[0])}`;
				return `Neveljavna možnost: pričakovano eno izmed ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Preveliko: pričakovano, da bo ${Q.origin ?? "vrednost"} imelo ${Y}${Q.maximum.toString()} ${z.unit ?? "elementov"}`;
				return `Preveliko: pričakovano, da bo ${Q.origin ?? "vrednost"} ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Premajhno: pričakovano, da bo ${Q.origin} imelo ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Premajhno: pričakovano, da bo ${Q.origin} ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Neveljaven niz: mora se začeti z "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Neveljaven niz: mora se končati z "${Y.suffix}"`;
				if (Y.format === "includes") return `Neveljaven niz: mora vsebovati "${Y.includes}"`;
				if (Y.format === "regex") return `Neveljaven niz: mora ustrezati vzorcu ${Y.pattern}`;
				return `Neveljaven ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Neveljavno število: mora biti večkratnik ${Q.divisor}`;
			case "unrecognized_keys": return `Neprepoznan${Q.keys.length > 1 ? "i ključi" : " ključ"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Neveljaven ključ v ${Q.origin}`;
			case "invalid_union": return "Neveljaven vnos";
			case "invalid_element": return `Neveljavna vrednost v ${Q.origin}`;
			default: return "Neveljaven vnos";
		}
	};
};
function dG() {
	return { localeError: _C() };
}
var xC = () => {
	let $ = {
		string: {
			unit: "tecken",
			verb: "att ha"
		},
		file: {
			unit: "bytes",
			verb: "att ha"
		},
		array: {
			unit: "objekt",
			verb: "att innehålla"
		},
		set: {
			unit: "objekt",
			verb: "att innehålla"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "antal";
			case "object":
				if (Array.isArray(Q)) return "lista";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "reguljärt uttryck",
		email: "e-postadress",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO-datum och tid",
		date: "ISO-datum",
		time: "ISO-tid",
		duration: "ISO-varaktighet",
		ipv4: "IPv4-intervall",
		ipv6: "IPv6-intervall",
		cidrv4: "IPv4-spektrum",
		cidrv6: "IPv6-spektrum",
		base64: "base64-kodad sträng",
		base64url: "base64url-kodad sträng",
		json_string: "JSON-sträng",
		e164: "E.164-nummer",
		jwt: "JWT",
		template_literal: "mall-literal"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Ogiltig inmatning: förväntat ${Q.expected}, fick ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Ogiltig inmatning: förväntat ${v(Q.values[0])}`;
				return `Ogiltigt val: förväntade en av ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `För stor(t): förväntade ${Q.origin ?? "värdet"} att ha ${Y}${Q.maximum.toString()} ${z.unit ?? "element"}`;
				return `För stor(t): förväntat ${Q.origin ?? "värdet"} att ha ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `För lite(t): förväntade ${Q.origin ?? "värdet"} att ha ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `För lite(t): förväntade ${Q.origin ?? "värdet"} att ha ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Ogiltig sträng: måste börja med "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Ogiltig sträng: måste sluta med "${Y.suffix}"`;
				if (Y.format === "includes") return `Ogiltig sträng: måste innehålla "${Y.includes}"`;
				if (Y.format === "regex") return `Ogiltig sträng: måste matcha mönstret "${Y.pattern}"`;
				return `Ogiltig(t) ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Ogiltigt tal: måste vara en multipel av ${Q.divisor}`;
			case "unrecognized_keys": return `${Q.keys.length > 1 ? "Okända nycklar" : "Okänd nyckel"}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Ogiltig nyckel i ${Q.origin ?? "värdet"}`;
			case "invalid_union": return "Ogiltig input";
			case "invalid_element": return `Ogiltigt värde i ${Q.origin ?? "värdet"}`;
			default: return "Ogiltig input";
		}
	};
};
function pG() {
	return { localeError: xC() };
}
var TC = () => {
	let $ = {
		string: {
			unit: "எழுத்துக்கள்",
			verb: "கொண்டிருக்க வேண்டும்"
		},
		file: {
			unit: "பைட்டுகள்",
			verb: "கொண்டிருக்க வேண்டும்"
		},
		array: {
			unit: "உறுப்புகள்",
			verb: "கொண்டிருக்க வேண்டும்"
		},
		set: {
			unit: "உறுப்புகள்",
			verb: "கொண்டிருக்க வேண்டும்"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "எண் அல்லாதது" : "எண்";
			case "object":
				if (Array.isArray(Q)) return "அணி";
				if (Q === null) return "வெறுமை";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "உள்ளீடு",
		email: "மின்னஞ்சல் முகவரி",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO தேதி நேரம்",
		date: "ISO தேதி",
		time: "ISO நேரம்",
		duration: "ISO கால அளவு",
		ipv4: "IPv4 முகவரி",
		ipv6: "IPv6 முகவரி",
		cidrv4: "IPv4 வரம்பு",
		cidrv6: "IPv6 வரம்பு",
		base64: "base64-encoded சரம்",
		base64url: "base64url-encoded சரம்",
		json_string: "JSON சரம்",
		e164: "E.164 எண்",
		jwt: "JWT",
		template_literal: "input"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது ${Q.expected}, பெறப்பட்டது ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது ${v(Q.values[0])}`;
				return `தவறான விருப்பம்: எதிர்பார்க்கப்பட்டது ${A(Q.values, "|")} இல் ஒன்று`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `மிக பெரியது: எதிர்பார்க்கப்பட்டது ${Q.origin ?? "மதிப்பு"} ${Y}${Q.maximum.toString()} ${z.unit ?? "உறுப்புகள்"} ஆக இருக்க வேண்டும்`;
				return `மிக பெரியது: எதிர்பார்க்கப்பட்டது ${Q.origin ?? "மதிப்பு"} ${Y}${Q.maximum.toString()} ஆக இருக்க வேண்டும்`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `மிகச் சிறியது: எதிர்பார்க்கப்பட்டது ${Q.origin} ${Y}${Q.minimum.toString()} ${z.unit} ஆக இருக்க வேண்டும்`;
				return `மிகச் சிறியது: எதிர்பார்க்கப்பட்டது ${Q.origin} ${Y}${Q.minimum.toString()} ஆக இருக்க வேண்டும்`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `தவறான சரம்: "${Y.prefix}" இல் தொடங்க வேண்டும்`;
				if (Y.format === "ends_with") return `தவறான சரம்: "${Y.suffix}" இல் முடிவடைய வேண்டும்`;
				if (Y.format === "includes") return `தவறான சரம்: "${Y.includes}" ஐ உள்ளடக்க வேண்டும்`;
				if (Y.format === "regex") return `தவறான சரம்: ${Y.pattern} முறைபாட்டுடன் பொருந்த வேண்டும்`;
				return `தவறான ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `தவறான எண்: ${Q.divisor} இன் பலமாக இருக்க வேண்டும்`;
			case "unrecognized_keys": return `அடையாளம் தெரியாத விசை${Q.keys.length > 1 ? "கள்" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `${Q.origin} இல் தவறான விசை`;
			case "invalid_union": return "தவறான உள்ளீடு";
			case "invalid_element": return `${Q.origin} இல் தவறான மதிப்பு`;
			default: return "தவறான உள்ளீடு";
		}
	};
};
function iG() {
	return { localeError: TC() };
}
var fC = () => {
	let $ = {
		string: {
			unit: "ตัวอักษร",
			verb: "ควรมี"
		},
		file: {
			unit: "ไบต์",
			verb: "ควรมี"
		},
		array: {
			unit: "รายการ",
			verb: "ควรมี"
		},
		set: {
			unit: "รายการ",
			verb: "ควรมี"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "ไม่ใช่ตัวเลข (NaN)" : "ตัวเลข";
			case "object":
				if (Array.isArray(Q)) return "อาร์เรย์ (Array)";
				if (Q === null) return "ไม่มีค่า (null)";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "ข้อมูลที่ป้อน",
		email: "ที่อยู่อีเมล",
		url: "URL",
		emoji: "อิโมจิ",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "วันที่เวลาแบบ ISO",
		date: "วันที่แบบ ISO",
		time: "เวลาแบบ ISO",
		duration: "ช่วงเวลาแบบ ISO",
		ipv4: "ที่อยู่ IPv4",
		ipv6: "ที่อยู่ IPv6",
		cidrv4: "ช่วง IP แบบ IPv4",
		cidrv6: "ช่วง IP แบบ IPv6",
		base64: "ข้อความแบบ Base64",
		base64url: "ข้อความแบบ Base64 สำหรับ URL",
		json_string: "ข้อความแบบ JSON",
		e164: "เบอร์โทรศัพท์ระหว่างประเทศ (E.164)",
		jwt: "โทเคน JWT",
		template_literal: "ข้อมูลที่ป้อน"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น ${Q.expected} แต่ได้รับ ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `ค่าไม่ถูกต้อง: ควรเป็น ${v(Q.values[0])}`;
				return `ตัวเลือกไม่ถูกต้อง: ควรเป็นหนึ่งใน ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "ไม่เกิน" : "น้อยกว่า", z = X(Q.origin);
				if (z) return `เกินกำหนด: ${Q.origin ?? "ค่า"} ควรมี${Y} ${Q.maximum.toString()} ${z.unit ?? "รายการ"}`;
				return `เกินกำหนด: ${Q.origin ?? "ค่า"} ควรมี${Y} ${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? "อย่างน้อย" : "มากกว่า", z = X(Q.origin);
				if (z) return `น้อยกว่ากำหนด: ${Q.origin} ควรมี${Y} ${Q.minimum.toString()} ${z.unit}`;
				return `น้อยกว่ากำหนด: ${Q.origin} ควรมี${Y} ${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `รูปแบบไม่ถูกต้อง: ข้อความต้องขึ้นต้นด้วย "${Y.prefix}"`;
				if (Y.format === "ends_with") return `รูปแบบไม่ถูกต้อง: ข้อความต้องลงท้ายด้วย "${Y.suffix}"`;
				if (Y.format === "includes") return `รูปแบบไม่ถูกต้อง: ข้อความต้องมี "${Y.includes}" อยู่ในข้อความ`;
				if (Y.format === "regex") return `รูปแบบไม่ถูกต้อง: ต้องตรงกับรูปแบบที่กำหนด ${Y.pattern}`;
				return `รูปแบบไม่ถูกต้อง: ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `ตัวเลขไม่ถูกต้อง: ต้องเป็นจำนวนที่หารด้วย ${Q.divisor} ได้ลงตัว`;
			case "unrecognized_keys": return `พบคีย์ที่ไม่รู้จัก: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `คีย์ไม่ถูกต้องใน ${Q.origin}`;
			case "invalid_union": return "ข้อมูลไม่ถูกต้อง: ไม่ตรงกับรูปแบบยูเนียนที่กำหนดไว้";
			case "invalid_element": return `ข้อมูลไม่ถูกต้องใน ${Q.origin}`;
			default: return "ข้อมูลไม่ถูกต้อง";
		}
	};
};
function nG() {
	return { localeError: fC() };
}
var yC = ($) => {
	let X = typeof $;
	switch (X) {
		case "number": return Number.isNaN($) ? "NaN" : "number";
		case "object":
			if (Array.isArray($)) return "array";
			if ($ === null) return "null";
			if (Object.getPrototypeOf($) !== Object.prototype && $.constructor) return $.constructor.name;
	}
	return X;
}, gC = () => {
	let $ = {
		string: {
			unit: "karakter",
			verb: "olmalı"
		},
		file: {
			unit: "bayt",
			verb: "olmalı"
		},
		array: {
			unit: "öğe",
			verb: "olmalı"
		},
		set: {
			unit: "öğe",
			verb: "olmalı"
		}
	};
	function X(W) {
		return $[W] ?? null;
	}
	let J = {
		regex: "girdi",
		email: "e-posta adresi",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO tarih ve saat",
		date: "ISO tarih",
		time: "ISO saat",
		duration: "ISO süre",
		ipv4: "IPv4 adresi",
		ipv6: "IPv6 adresi",
		cidrv4: "IPv4 aralığı",
		cidrv6: "IPv6 aralığı",
		base64: "base64 ile şifrelenmiş metin",
		base64url: "base64url ile şifrelenmiş metin",
		json_string: "JSON dizesi",
		e164: "E.164 sayısı",
		jwt: "JWT",
		template_literal: "Şablon dizesi"
	};
	return (W) => {
		switch (W.code) {
			case "invalid_type": return `Geçersiz değer: beklenen ${W.expected}, alınan ${yC(W.input)}`;
			case "invalid_value":
				if (W.values.length === 1) return `Geçersiz değer: beklenen ${v(W.values[0])}`;
				return `Geçersiz seçenek: aşağıdakilerden biri olmalı: ${A(W.values, "|")}`;
			case "too_big": {
				let Q = W.inclusive ? "<=" : "<", Y = X(W.origin);
				if (Y) return `Çok büyük: beklenen ${W.origin ?? "değer"} ${Q}${W.maximum.toString()} ${Y.unit ?? "öğe"}`;
				return `Çok büyük: beklenen ${W.origin ?? "değer"} ${Q}${W.maximum.toString()}`;
			}
			case "too_small": {
				let Q = W.inclusive ? ">=" : ">", Y = X(W.origin);
				if (Y) return `Çok küçük: beklenen ${W.origin} ${Q}${W.minimum.toString()} ${Y.unit}`;
				return `Çok küçük: beklenen ${W.origin} ${Q}${W.minimum.toString()}`;
			}
			case "invalid_format": {
				let Q = W;
				if (Q.format === "starts_with") return `Geçersiz metin: "${Q.prefix}" ile başlamalı`;
				if (Q.format === "ends_with") return `Geçersiz metin: "${Q.suffix}" ile bitmeli`;
				if (Q.format === "includes") return `Geçersiz metin: "${Q.includes}" içermeli`;
				if (Q.format === "regex") return `Geçersiz metin: ${Q.pattern} desenine uymalı`;
				return `Geçersiz ${J[Q.format] ?? W.format}`;
			}
			case "not_multiple_of": return `Geçersiz sayı: ${W.divisor} ile tam bölünebilmeli`;
			case "unrecognized_keys": return `Tanınmayan anahtar${W.keys.length > 1 ? "lar" : ""}: ${A(W.keys, ", ")}`;
			case "invalid_key": return `${W.origin} içinde geçersiz anahtar`;
			case "invalid_union": return "Geçersiz değer";
			case "invalid_element": return `${W.origin} içinde geçersiz değer`;
			default: return "Geçersiz değer";
		}
	};
};
function rG() {
	return { localeError: gC() };
}
var hC = () => {
	let $ = {
		string: {
			unit: "символів",
			verb: "матиме"
		},
		file: {
			unit: "байтів",
			verb: "матиме"
		},
		array: {
			unit: "елементів",
			verb: "матиме"
		},
		set: {
			unit: "елементів",
			verb: "матиме"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "число";
			case "object":
				if (Array.isArray(Q)) return "масив";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "вхідні дані",
		email: "адреса електронної пошти",
		url: "URL",
		emoji: "емодзі",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "дата та час ISO",
		date: "дата ISO",
		time: "час ISO",
		duration: "тривалість ISO",
		ipv4: "адреса IPv4",
		ipv6: "адреса IPv6",
		cidrv4: "діапазон IPv4",
		cidrv6: "діапазон IPv6",
		base64: "рядок у кодуванні base64",
		base64url: "рядок у кодуванні base64url",
		json_string: "рядок JSON",
		e164: "номер E.164",
		jwt: "JWT",
		template_literal: "вхідні дані"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Неправильні вхідні дані: очікується ${Q.expected}, отримано ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Неправильні вхідні дані: очікується ${v(Q.values[0])}`;
				return `Неправильна опція: очікується одне з ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Занадто велике: очікується, що ${Q.origin ?? "значення"} ${z.verb} ${Y}${Q.maximum.toString()} ${z.unit ?? "елементів"}`;
				return `Занадто велике: очікується, що ${Q.origin ?? "значення"} буде ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Занадто мале: очікується, що ${Q.origin} ${z.verb} ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Занадто мале: очікується, що ${Q.origin} буде ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Неправильний рядок: повинен починатися з "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Неправильний рядок: повинен закінчуватися на "${Y.suffix}"`;
				if (Y.format === "includes") return `Неправильний рядок: повинен містити "${Y.includes}"`;
				if (Y.format === "regex") return `Неправильний рядок: повинен відповідати шаблону ${Y.pattern}`;
				return `Неправильний ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `Неправильне число: повинно бути кратним ${Q.divisor}`;
			case "unrecognized_keys": return `Нерозпізнаний ключ${Q.keys.length > 1 ? "і" : ""}: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Неправильний ключ у ${Q.origin}`;
			case "invalid_union": return "Неправильні вхідні дані";
			case "invalid_element": return `Неправильне значення у ${Q.origin}`;
			default: return "Неправильні вхідні дані";
		}
	};
};
function oG() {
	return { localeError: hC() };
}
var uC = () => {
	let $ = {
		string: {
			unit: "حروف",
			verb: "ہونا"
		},
		file: {
			unit: "بائٹس",
			verb: "ہونا"
		},
		array: {
			unit: "آئٹمز",
			verb: "ہونا"
		},
		set: {
			unit: "آئٹمز",
			verb: "ہونا"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "نمبر";
			case "object":
				if (Array.isArray(Q)) return "آرے";
				if (Q === null) return "نل";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "ان پٹ",
		email: "ای میل ایڈریس",
		url: "یو آر ایل",
		emoji: "ایموجی",
		uuid: "یو یو آئی ڈی",
		uuidv4: "یو یو آئی ڈی وی 4",
		uuidv6: "یو یو آئی ڈی وی 6",
		nanoid: "نینو آئی ڈی",
		guid: "جی یو آئی ڈی",
		cuid: "سی یو آئی ڈی",
		cuid2: "سی یو آئی ڈی 2",
		ulid: "یو ایل آئی ڈی",
		xid: "ایکس آئی ڈی",
		ksuid: "کے ایس یو آئی ڈی",
		datetime: "آئی ایس او ڈیٹ ٹائم",
		date: "آئی ایس او تاریخ",
		time: "آئی ایس او وقت",
		duration: "آئی ایس او مدت",
		ipv4: "آئی پی وی 4 ایڈریس",
		ipv6: "آئی پی وی 6 ایڈریس",
		cidrv4: "آئی پی وی 4 رینج",
		cidrv6: "آئی پی وی 6 رینج",
		base64: "بیس 64 ان کوڈڈ سٹرنگ",
		base64url: "بیس 64 یو آر ایل ان کوڈڈ سٹرنگ",
		json_string: "جے ایس او این سٹرنگ",
		e164: "ای 164 نمبر",
		jwt: "جے ڈبلیو ٹی",
		template_literal: "ان پٹ"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `غلط ان پٹ: ${Q.expected} متوقع تھا، ${J(Q.input)} موصول ہوا`;
			case "invalid_value":
				if (Q.values.length === 1) return `غلط ان پٹ: ${v(Q.values[0])} متوقع تھا`;
				return `غلط آپشن: ${A(Q.values, "|")} میں سے ایک متوقع تھا`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `بہت بڑا: ${Q.origin ?? "ویلیو"} کے ${Y}${Q.maximum.toString()} ${z.unit ?? "عناصر"} ہونے متوقع تھے`;
				return `بہت بڑا: ${Q.origin ?? "ویلیو"} کا ${Y}${Q.maximum.toString()} ہونا متوقع تھا`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `بہت چھوٹا: ${Q.origin} کے ${Y}${Q.minimum.toString()} ${z.unit} ہونے متوقع تھے`;
				return `بہت چھوٹا: ${Q.origin} کا ${Y}${Q.minimum.toString()} ہونا متوقع تھا`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `غلط سٹرنگ: "${Y.prefix}" سے شروع ہونا چاہیے`;
				if (Y.format === "ends_with") return `غلط سٹرنگ: "${Y.suffix}" پر ختم ہونا چاہیے`;
				if (Y.format === "includes") return `غلط سٹرنگ: "${Y.includes}" شامل ہونا چاہیے`;
				if (Y.format === "regex") return `غلط سٹرنگ: پیٹرن ${Y.pattern} سے میچ ہونا چاہیے`;
				return `غلط ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `غلط نمبر: ${Q.divisor} کا مضاعف ہونا چاہیے`;
			case "unrecognized_keys": return `غیر تسلیم شدہ کی${Q.keys.length > 1 ? "ز" : ""}: ${A(Q.keys, "، ")}`;
			case "invalid_key": return `${Q.origin} میں غلط کی`;
			case "invalid_union": return "غلط ان پٹ";
			case "invalid_element": return `${Q.origin} میں غلط ویلیو`;
			default: return "غلط ان پٹ";
		}
	};
};
function tG() {
	return { localeError: uC() };
}
var mC = () => {
	let $ = {
		string: {
			unit: "ký tự",
			verb: "có"
		},
		file: {
			unit: "byte",
			verb: "có"
		},
		array: {
			unit: "phần tử",
			verb: "có"
		},
		set: {
			unit: "phần tử",
			verb: "có"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "số";
			case "object":
				if (Array.isArray(Q)) return "mảng";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "đầu vào",
		email: "địa chỉ email",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ngày giờ ISO",
		date: "ngày ISO",
		time: "giờ ISO",
		duration: "khoảng thời gian ISO",
		ipv4: "địa chỉ IPv4",
		ipv6: "địa chỉ IPv6",
		cidrv4: "dải IPv4",
		cidrv6: "dải IPv6",
		base64: "chuỗi mã hóa base64",
		base64url: "chuỗi mã hóa base64url",
		json_string: "chuỗi JSON",
		e164: "số E.164",
		jwt: "JWT",
		template_literal: "đầu vào"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `Đầu vào không hợp lệ: mong đợi ${Q.expected}, nhận được ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `Đầu vào không hợp lệ: mong đợi ${v(Q.values[0])}`;
				return `Tùy chọn không hợp lệ: mong đợi một trong các giá trị ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `Quá lớn: mong đợi ${Q.origin ?? "giá trị"} ${z.verb} ${Y}${Q.maximum.toString()} ${z.unit ?? "phần tử"}`;
				return `Quá lớn: mong đợi ${Q.origin ?? "giá trị"} ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `Quá nhỏ: mong đợi ${Q.origin} ${z.verb} ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `Quá nhỏ: mong đợi ${Q.origin} ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `Chuỗi không hợp lệ: phải bắt đầu bằng "${Y.prefix}"`;
				if (Y.format === "ends_with") return `Chuỗi không hợp lệ: phải kết thúc bằng "${Y.suffix}"`;
				if (Y.format === "includes") return `Chuỗi không hợp lệ: phải bao gồm "${Y.includes}"`;
				if (Y.format === "regex") return `Chuỗi không hợp lệ: phải khớp với mẫu ${Y.pattern}`;
				return `${W[Y.format] ?? Q.format} không hợp lệ`;
			}
			case "not_multiple_of": return `Số không hợp lệ: phải là bội số của ${Q.divisor}`;
			case "unrecognized_keys": return `Khóa không được nhận dạng: ${A(Q.keys, ", ")}`;
			case "invalid_key": return `Khóa không hợp lệ trong ${Q.origin}`;
			case "invalid_union": return "Đầu vào không hợp lệ";
			case "invalid_element": return `Giá trị không hợp lệ trong ${Q.origin}`;
			default: return "Đầu vào không hợp lệ";
		}
	};
};
function aG() {
	return { localeError: mC() };
}
var lC = () => {
	let $ = {
		string: {
			unit: "字符",
			verb: "包含"
		},
		file: {
			unit: "字节",
			verb: "包含"
		},
		array: {
			unit: "项",
			verb: "包含"
		},
		set: {
			unit: "项",
			verb: "包含"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "非数字(NaN)" : "数字";
			case "object":
				if (Array.isArray(Q)) return "数组";
				if (Q === null) return "空值(null)";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "输入",
		email: "电子邮件",
		url: "URL",
		emoji: "表情符号",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO日期时间",
		date: "ISO日期",
		time: "ISO时间",
		duration: "ISO时长",
		ipv4: "IPv4地址",
		ipv6: "IPv6地址",
		cidrv4: "IPv4网段",
		cidrv6: "IPv6网段",
		base64: "base64编码字符串",
		base64url: "base64url编码字符串",
		json_string: "JSON字符串",
		e164: "E.164号码",
		jwt: "JWT",
		template_literal: "输入"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `无效输入：期望 ${Q.expected}，实际接收 ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `无效输入：期望 ${v(Q.values[0])}`;
				return `无效选项：期望以下之一 ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `数值过大：期望 ${Q.origin ?? "值"} ${Y}${Q.maximum.toString()} ${z.unit ?? "个元素"}`;
				return `数值过大：期望 ${Q.origin ?? "值"} ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `数值过小：期望 ${Q.origin} ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `数值过小：期望 ${Q.origin} ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `无效字符串：必须以 "${Y.prefix}" 开头`;
				if (Y.format === "ends_with") return `无效字符串：必须以 "${Y.suffix}" 结尾`;
				if (Y.format === "includes") return `无效字符串：必须包含 "${Y.includes}"`;
				if (Y.format === "regex") return `无效字符串：必须满足正则表达式 ${Y.pattern}`;
				return `无效${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `无效数字：必须是 ${Q.divisor} 的倍数`;
			case "unrecognized_keys": return `出现未知的键(key): ${A(Q.keys, ", ")}`;
			case "invalid_key": return `${Q.origin} 中的键(key)无效`;
			case "invalid_union": return "无效输入";
			case "invalid_element": return `${Q.origin} 中包含无效值(value)`;
			default: return "无效输入";
		}
	};
};
function sG() {
	return { localeError: lC() };
}
var cC = () => {
	let $ = {
		string: {
			unit: "字元",
			verb: "擁有"
		},
		file: {
			unit: "位元組",
			verb: "擁有"
		},
		array: {
			unit: "項目",
			verb: "擁有"
		},
		set: {
			unit: "項目",
			verb: "擁有"
		}
	};
	function X(Q) {
		return $[Q] ?? null;
	}
	let J = (Q) => {
		let Y = typeof Q;
		switch (Y) {
			case "number": return Number.isNaN(Q) ? "NaN" : "number";
			case "object":
				if (Array.isArray(Q)) return "array";
				if (Q === null) return "null";
				if (Object.getPrototypeOf(Q) !== Object.prototype && Q.constructor) return Q.constructor.name;
		}
		return Y;
	}, W = {
		regex: "輸入",
		email: "郵件地址",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO 日期時間",
		date: "ISO 日期",
		time: "ISO 時間",
		duration: "ISO 期間",
		ipv4: "IPv4 位址",
		ipv6: "IPv6 位址",
		cidrv4: "IPv4 範圍",
		cidrv6: "IPv6 範圍",
		base64: "base64 編碼字串",
		base64url: "base64url 編碼字串",
		json_string: "JSON 字串",
		e164: "E.164 數值",
		jwt: "JWT",
		template_literal: "輸入"
	};
	return (Q) => {
		switch (Q.code) {
			case "invalid_type": return `無效的輸入值：預期為 ${Q.expected}，但收到 ${J(Q.input)}`;
			case "invalid_value":
				if (Q.values.length === 1) return `無效的輸入值：預期為 ${v(Q.values[0])}`;
				return `無效的選項：預期為以下其中之一 ${A(Q.values, "|")}`;
			case "too_big": {
				let Y = Q.inclusive ? "<=" : "<", z = X(Q.origin);
				if (z) return `數值過大：預期 ${Q.origin ?? "值"} 應為 ${Y}${Q.maximum.toString()} ${z.unit ?? "個元素"}`;
				return `數值過大：預期 ${Q.origin ?? "值"} 應為 ${Y}${Q.maximum.toString()}`;
			}
			case "too_small": {
				let Y = Q.inclusive ? ">=" : ">", z = X(Q.origin);
				if (z) return `數值過小：預期 ${Q.origin} 應為 ${Y}${Q.minimum.toString()} ${z.unit}`;
				return `數值過小：預期 ${Q.origin} 應為 ${Y}${Q.minimum.toString()}`;
			}
			case "invalid_format": {
				let Y = Q;
				if (Y.format === "starts_with") return `無效的字串：必須以 "${Y.prefix}" 開頭`;
				if (Y.format === "ends_with") return `無效的字串：必須以 "${Y.suffix}" 結尾`;
				if (Y.format === "includes") return `無效的字串：必須包含 "${Y.includes}"`;
				if (Y.format === "regex") return `無效的字串：必須符合格式 ${Y.pattern}`;
				return `無效的 ${W[Y.format] ?? Q.format}`;
			}
			case "not_multiple_of": return `無效的數字：必須為 ${Q.divisor} 的倍數`;
			case "unrecognized_keys": return `無法識別的鍵值${Q.keys.length > 1 ? "們" : ""}：${A(Q.keys, "、")}`;
			case "invalid_key": return `${Q.origin} 中有無效的鍵值`;
			case "invalid_union": return "無效的輸入值";
			case "invalid_element": return `${Q.origin} 中有無效的值`;
			default: return "無效的輸入值";
		}
	};
};
function eG() {
	return { localeError: cC() };
}
var oQ = Symbol("ZodOutput"), tQ = Symbol("ZodInput");
var WX = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add($, ...X) {
		let J = X[0];
		if (this._map.set($, J), J && typeof J === "object" && "id" in J) {
			if (this._idmap.has(J.id)) throw Error(`ID ${J.id} already exists in the registry`);
			this._idmap.set(J.id, $);
		}
		return this;
	}
	remove($) {
		return this._map.delete($), this;
	}
	get($) {
		let X = $._zod.parent;
		if (X) {
			let J = { ...this.get(X) ?? {} };
			return delete J.id, {
				...J,
				...this._map.get($)
			};
		}
		return this._map.get($);
	}
	has($) {
		return this._map.has($);
	}
};
function YX() {
	return new WX();
}
var G6 = YX();
function aQ($, X) {
	return new $({
		type: "string",
		...P(X)
	});
}
function $H($, X) {
	return new $({
		type: "string",
		coerce: !0,
		...P(X)
	});
}
function zX($, X) {
	return new $({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function r0($, X) {
	return new $({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function GX($, X) {
	return new $({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function HX($, X) {
	return new $({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...P(X)
	});
}
function UX($, X) {
	return new $({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...P(X)
	});
}
function KX($, X) {
	return new $({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...P(X)
	});
}
function VX($, X) {
	return new $({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function NX($, X) {
	return new $({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function OX($, X) {
	return new $({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function wX($, X) {
	return new $({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function BX($, X) {
	return new $({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function qX($, X) {
	return new $({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function DX($, X) {
	return new $({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function FX($, X) {
	return new $({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function jX($, X) {
	return new $({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function LX($, X) {
	return new $({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function MX($, X) {
	return new $({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function AX($, X) {
	return new $({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function IX($, X) {
	return new $({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function ZX($, X) {
	return new $({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function bX($, X) {
	return new $({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
function RX($, X) {
	return new $({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...P(X)
	});
}
var sQ = {
	Any: null,
	Minute: -1,
	Second: 0,
	Millisecond: 3,
	Microsecond: 6
};
function XH($, X) {
	return new $({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...P(X)
	});
}
function JH($, X) {
	return new $({
		type: "string",
		format: "date",
		check: "string_format",
		...P(X)
	});
}
function QH($, X) {
	return new $({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...P(X)
	});
}
function WH($, X) {
	return new $({
		type: "string",
		format: "duration",
		check: "string_format",
		...P(X)
	});
}
function eQ($, X) {
	return new $({
		type: "number",
		checks: [],
		...P(X)
	});
}
function YH($, X) {
	return new $({
		type: "number",
		coerce: !0,
		checks: [],
		...P(X)
	});
}
function $5($, X) {
	return new $({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...P(X)
	});
}
function X5($, X) {
	return new $({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "float32",
		...P(X)
	});
}
function J5($, X) {
	return new $({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "float64",
		...P(X)
	});
}
function Q5($, X) {
	return new $({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "int32",
		...P(X)
	});
}
function W5($, X) {
	return new $({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "uint32",
		...P(X)
	});
}
function Y5($, X) {
	return new $({
		type: "boolean",
		...P(X)
	});
}
function zH($, X) {
	return new $({
		type: "boolean",
		coerce: !0,
		...P(X)
	});
}
function z5($, X) {
	return new $({
		type: "bigint",
		...P(X)
	});
}
function GH($, X) {
	return new $({
		type: "bigint",
		coerce: !0,
		...P(X)
	});
}
function G5($, X) {
	return new $({
		type: "bigint",
		check: "bigint_format",
		abort: !1,
		format: "int64",
		...P(X)
	});
}
function H5($, X) {
	return new $({
		type: "bigint",
		check: "bigint_format",
		abort: !1,
		format: "uint64",
		...P(X)
	});
}
function U5($, X) {
	return new $({
		type: "symbol",
		...P(X)
	});
}
function K5($, X) {
	return new $({
		type: "undefined",
		...P(X)
	});
}
function V5($, X) {
	return new $({
		type: "null",
		...P(X)
	});
}
function N5($) {
	return new $({ type: "any" });
}
function p1($) {
	return new $({ type: "unknown" });
}
function O5($, X) {
	return new $({
		type: "never",
		...P(X)
	});
}
function w5($, X) {
	return new $({
		type: "void",
		...P(X)
	});
}
function B5($, X) {
	return new $({
		type: "date",
		...P(X)
	});
}
function HH($, X) {
	return new $({
		type: "date",
		coerce: !0,
		...P(X)
	});
}
function q5($, X) {
	return new $({
		type: "nan",
		...P(X)
	});
}
function I4($, X) {
	return new r7({
		check: "less_than",
		...P(X),
		value: $,
		inclusive: !1
	});
}
function P6($, X) {
	return new r7({
		check: "less_than",
		...P(X),
		value: $,
		inclusive: !0
	});
}
function Z4($, X) {
	return new o7({
		check: "greater_than",
		...P(X),
		value: $,
		inclusive: !1
	});
}
function H6($, X) {
	return new o7({
		check: "greater_than",
		...P(X),
		value: $,
		inclusive: !0
	});
}
function UH($) {
	return Z4(0, $);
}
function KH($) {
	return I4(0, $);
}
function VH($) {
	return P6(0, $);
}
function NH($) {
	return H6(0, $);
}
function i1($, X) {
	return new p3({
		check: "multiple_of",
		...P(X),
		value: $
	});
}
function o0($, X) {
	return new r3({
		check: "max_size",
		...P(X),
		maximum: $
	});
}
function n1($, X) {
	return new o3({
		check: "min_size",
		...P(X),
		minimum: $
	});
}
function PX($, X) {
	return new t3({
		check: "size_equals",
		...P(X),
		size: $
	});
}
function t0($, X) {
	return new a3({
		check: "max_length",
		...P(X),
		maximum: $
	});
}
function X1($, X) {
	return new s3({
		check: "min_length",
		...P(X),
		minimum: $
	});
}
function a0($, X) {
	return new e3({
		check: "length_equals",
		...P(X),
		length: $
	});
}
function EX($, X) {
	return new $G({
		check: "string_format",
		format: "regex",
		...P(X),
		pattern: $
	});
}
function SX($) {
	return new XG({
		check: "string_format",
		format: "lowercase",
		...P($)
	});
}
function vX($) {
	return new JG({
		check: "string_format",
		format: "uppercase",
		...P($)
	});
}
function CX($, X) {
	return new QG({
		check: "string_format",
		format: "includes",
		...P(X),
		includes: $
	});
}
function kX($, X) {
	return new WG({
		check: "string_format",
		format: "starts_with",
		...P(X),
		prefix: $
	});
}
function _X($, X) {
	return new YG({
		check: "string_format",
		format: "ends_with",
		...P(X),
		suffix: $
	});
}
function OH($, X, J) {
	return new zG({
		check: "property",
		property: $,
		schema: X,
		...P(J)
	});
}
function xX($, X) {
	return new GG({
		check: "mime_type",
		mime: $,
		...P(X)
	});
}
function b4($) {
	return new HG({
		check: "overwrite",
		tx: $
	});
}
function TX($) {
	return b4((X) => X.normalize($));
}
function fX() {
	return b4(($) => $.trim());
}
function yX() {
	return b4(($) => $.toLowerCase());
}
function gX() {
	return b4(($) => $.toUpperCase());
}
function hX($, X, J) {
	return new $({
		type: "array",
		element: X,
		...P(J)
	});
}
function dC($, X, J) {
	return new $({
		type: "union",
		options: X,
		...P(J)
	});
}
function pC($, X, J, W) {
	return new $({
		type: "union",
		options: J,
		discriminator: X,
		...P(W)
	});
}
function iC($, X, J) {
	return new $({
		type: "intersection",
		left: X,
		right: J
	});
}
function wH($, X, J, W) {
	let Q = J instanceof p;
	return new $({
		type: "tuple",
		items: X,
		rest: Q ? J : null,
		...P(Q ? W : J)
	});
}
function nC($, X, J, W) {
	return new $({
		type: "record",
		keyType: X,
		valueType: J,
		...P(W)
	});
}
function rC($, X, J, W) {
	return new $({
		type: "map",
		keyType: X,
		valueType: J,
		...P(W)
	});
}
function oC($, X, J) {
	return new $({
		type: "set",
		valueType: X,
		...P(J)
	});
}
function tC($, X, J) {
	return new $({
		type: "enum",
		entries: Array.isArray(X) ? Object.fromEntries(X.map((Q) => [Q, Q])) : X,
		...P(J)
	});
}
function aC($, X, J) {
	return new $({
		type: "enum",
		entries: X,
		...P(J)
	});
}
function sC($, X, J) {
	return new $({
		type: "literal",
		values: Array.isArray(X) ? X : [X],
		...P(J)
	});
}
function D5($, X) {
	return new $({
		type: "file",
		...P(X)
	});
}
function eC($, X) {
	return new $({
		type: "transform",
		transform: X
	});
}
function $k($, X) {
	return new $({
		type: "optional",
		innerType: X
	});
}
function Xk($, X) {
	return new $({
		type: "nullable",
		innerType: X
	});
}
function Jk($, X, J) {
	return new $({
		type: "default",
		innerType: X,
		get defaultValue() {
			return typeof J === "function" ? J() : J;
		}
	});
}
function Qk($, X, J) {
	return new $({
		type: "nonoptional",
		innerType: X,
		...P(J)
	});
}
function Wk($, X) {
	return new $({
		type: "success",
		innerType: X
	});
}
function Yk($, X, J) {
	return new $({
		type: "catch",
		innerType: X,
		catchValue: typeof J === "function" ? J : () => J
	});
}
function zk($, X, J) {
	return new $({
		type: "pipe",
		in: X,
		out: J
	});
}
function Gk($, X) {
	return new $({
		type: "readonly",
		innerType: X
	});
}
function Hk($, X, J) {
	return new $({
		type: "template_literal",
		parts: X,
		...P(J)
	});
}
function Uk($, X) {
	return new $({
		type: "lazy",
		getter: X
	});
}
function Kk($, X) {
	return new $({
		type: "promise",
		innerType: X
	});
}
function F5($, X, J) {
	let W = P(J);
	return W.abort ?? (W.abort = !0), new $({
		type: "custom",
		check: "custom",
		fn: X,
		...W
	});
}
function j5($, X, J) {
	return new $({
		type: "custom",
		check: "custom",
		fn: X,
		...P(J)
	});
}
function L5($, X) {
	let J = P(X), W = J.truthy ?? [
		"true",
		"1",
		"yes",
		"on",
		"y",
		"enabled"
	], Q = J.falsy ?? [
		"false",
		"0",
		"no",
		"off",
		"n",
		"disabled"
	];
	if (J.case !== "sensitive") W = W.map((w) => typeof w === "string" ? w.toLowerCase() : w), Q = Q.map((w) => typeof w === "string" ? w.toLowerCase() : w);
	let Y = new Set(W), z = new Set(Q), G = $.Pipe ?? i0, H = $.Boolean ?? c0, U = $.String ?? e4, V = new ($.Transform ?? p0)({
		type: "transform",
		transform: (w, B) => {
			let F = w;
			if (J.case !== "sensitive") F = F.toLowerCase();
			if (Y.has(F)) return !0;
			else if (z.has(F)) return !1;
			else return B.issues.push({
				code: "invalid_value",
				expected: "stringbool",
				values: [...Y, ...z],
				input: B.value,
				inst: V
			}), {};
		},
		error: J.error
	});
	return new G({
		type: "pipe",
		in: new G({
			type: "pipe",
			in: new U({
				type: "string",
				error: J.error
			}),
			out: V,
			error: J.error
		}),
		out: new H({
			type: "boolean",
			error: J.error
		}),
		error: J.error
	});
}
function M5($, X, J, W = {}) {
	let Q = P(W), Y = {
		...P(W),
		check: "string_format",
		type: "string",
		format: X,
		fn: typeof J === "function" ? J : (G) => J.test(G),
		...Q
	};
	if (J instanceof RegExp) Y.pattern = J;
	return new $(Y);
}
var BH = class {
	constructor($) {
		this._def = $, this.def = $;
	}
	implement($) {
		if (typeof $ !== "function") throw Error("implement() must be called with a function");
		let X = (...J) => {
			let W = this._def.input ? m1(this._def.input, J, void 0, { callee: X }) : J;
			if (!Array.isArray(W)) throw Error("Invalid arguments schema: not an array or tuple schema.");
			let Q = $(...W);
			return this._def.output ? m1(this._def.output, Q, void 0, { callee: X }) : Q;
		};
		return X;
	}
	implementAsync($) {
		if (typeof $ !== "function") throw Error("implement() must be called with a function");
		let X = async (...J) => {
			let W = this._def.input ? await l1(this._def.input, J, void 0, { callee: X }) : J;
			if (!Array.isArray(W)) throw Error("Invalid arguments schema: not an array or tuple schema.");
			let Q = await $(...W);
			return this._def.output ? l1(this._def.output, Q, void 0, { callee: X }) : Q;
		};
		return X;
	}
	input(...$) {
		let X = this.constructor;
		if (Array.isArray($[0])) return new X({
			type: "function",
			input: new $1({
				type: "tuple",
				items: $[0],
				rest: $[1]
			}),
			output: this._def.output
		});
		return new X({
			type: "function",
			input: $[0],
			output: this._def.output
		});
	}
	output($) {
		return new this.constructor({
			type: "function",
			input: this._def.input,
			output: $
		});
	}
};
function A5($) {
	return new BH({
		type: "function",
		input: Array.isArray($?.input) ? wH($1, $?.input) : $?.input ?? hX(d0, p1(d1)),
		output: $?.output ?? p1(d1)
	});
}
var I5 = class {
	constructor($) {
		this.counter = 0, this.metadataRegistry = $?.metadata ?? G6, this.target = $?.target ?? "draft-2020-12", this.unrepresentable = $?.unrepresentable ?? "throw", this.override = $?.override ?? (() => {}), this.io = $?.io ?? "output", this.seen = /* @__PURE__ */ new Map();
	}
	process($, X = {
		path: [],
		schemaPath: []
	}) {
		var J;
		let W = $._zod.def, Q = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		}, Y = this.seen.get($);
		if (Y) {
			if (Y.count++, X.schemaPath.includes($)) Y.cycle = X.path;
			return Y.schema;
		}
		let z = {
			schema: {},
			count: 1,
			cycle: void 0,
			path: X.path
		};
		this.seen.set($, z);
		let G = $._zod.toJSONSchema?.();
		if (G) z.schema = G;
		else {
			let K = {
				...X,
				schemaPath: [...X.schemaPath, $],
				path: X.path
			}, V = $._zod.parent;
			if (V) z.ref = V, this.process(V, K), this.seen.get(V).isParent = !0;
			else {
				let N = z.schema;
				switch (W.type) {
					case "string": {
						let O = N;
						O.type = "string";
						let { minimum: w, maximum: B, format: F, patterns: j, contentEncoding: I } = $._zod.bag;
						if (typeof w === "number") O.minLength = w;
						if (typeof B === "number") O.maxLength = B;
						if (F) {
							if (O.format = Q[F] ?? F, O.format === "") delete O.format;
						}
						if (I) O.contentEncoding = I;
						if (j && j.size > 0) {
							let Z = [...j];
							if (Z.length === 1) O.pattern = Z[0].source;
							else if (Z.length > 1) z.schema.allOf = [...Z.map((_) => ({
								...this.target === "draft-7" ? { type: "string" } : {},
								pattern: _.source
							}))];
						}
						break;
					}
					case "number": {
						let O = N, { minimum: w, maximum: B, format: F, multipleOf: j, exclusiveMaximum: I, exclusiveMinimum: Z } = $._zod.bag;
						if (typeof F === "string" && F.includes("int")) O.type = "integer";
						else O.type = "number";
						if (typeof Z === "number") O.exclusiveMinimum = Z;
						if (typeof w === "number") {
							if (O.minimum = w, typeof Z === "number") if (Z >= w) delete O.minimum;
							else delete O.exclusiveMinimum;
						}
						if (typeof I === "number") O.exclusiveMaximum = I;
						if (typeof B === "number") {
							if (O.maximum = B, typeof I === "number") if (I <= B) delete O.maximum;
							else delete O.exclusiveMaximum;
						}
						if (typeof j === "number") O.multipleOf = j;
						break;
					}
					case "boolean": {
						let O = N;
						O.type = "boolean";
						break;
					}
					case "bigint":
						if (this.unrepresentable === "throw") throw Error("BigInt cannot be represented in JSON Schema");
						break;
					case "symbol":
						if (this.unrepresentable === "throw") throw Error("Symbols cannot be represented in JSON Schema");
						break;
					case "null":
						N.type = "null";
						break;
					case "any": break;
					case "unknown": break;
					case "undefined":
					case "never":
						N.not = {};
						break;
					case "void":
						if (this.unrepresentable === "throw") throw Error("Void cannot be represented in JSON Schema");
						break;
					case "date":
						if (this.unrepresentable === "throw") throw Error("Date cannot be represented in JSON Schema");
						break;
					case "array": {
						let O = N, { minimum: w, maximum: B } = $._zod.bag;
						if (typeof w === "number") O.minItems = w;
						if (typeof B === "number") O.maxItems = B;
						O.type = "array", O.items = this.process(W.element, {
							...K,
							path: [...K.path, "items"]
						});
						break;
					}
					case "object": {
						let O = N;
						O.type = "object", O.properties = {};
						let w = W.shape;
						for (let j in w) O.properties[j] = this.process(w[j], {
							...K,
							path: [
								...K.path,
								"properties",
								j
							]
						});
						let B = new Set(Object.keys(w)), F = new Set([...B].filter((j) => {
							let I = W.shape[j]._zod;
							if (this.io === "input") return I.optin === void 0;
							else return I.optout === void 0;
						}));
						if (F.size > 0) O.required = Array.from(F);
						if (W.catchall?._zod.def.type === "never") O.additionalProperties = !1;
						else if (!W.catchall) {
							if (this.io === "output") O.additionalProperties = !1;
						} else if (W.catchall) O.additionalProperties = this.process(W.catchall, {
							...K,
							path: [...K.path, "additionalProperties"]
						});
						break;
					}
					case "union": {
						let O = N;
						O.anyOf = W.options.map((w, B) => this.process(w, {
							...K,
							path: [
								...K.path,
								"anyOf",
								B
							]
						}));
						break;
					}
					case "intersection": {
						let O = N, w = this.process(W.left, {
							...K,
							path: [
								...K.path,
								"allOf",
								0
							]
						}), B = this.process(W.right, {
							...K,
							path: [
								...K.path,
								"allOf",
								1
							]
						}), F = (I) => "allOf" in I && Object.keys(I).length === 1;
						O.allOf = [...F(w) ? w.allOf : [w], ...F(B) ? B.allOf : [B]];
						break;
					}
					case "tuple": {
						let O = N;
						O.type = "array";
						let w = W.items.map((j, I) => this.process(j, {
							...K,
							path: [
								...K.path,
								"prefixItems",
								I
							]
						}));
						if (this.target === "draft-2020-12") O.prefixItems = w;
						else O.items = w;
						if (W.rest) {
							let j = this.process(W.rest, {
								...K,
								path: [...K.path, "items"]
							});
							if (this.target === "draft-2020-12") O.items = j;
							else O.additionalItems = j;
						}
						if (W.rest) O.items = this.process(W.rest, {
							...K,
							path: [...K.path, "items"]
						});
						let { minimum: B, maximum: F } = $._zod.bag;
						if (typeof B === "number") O.minItems = B;
						if (typeof F === "number") O.maxItems = F;
						break;
					}
					case "record": {
						let O = N;
						O.type = "object", O.propertyNames = this.process(W.keyType, {
							...K,
							path: [...K.path, "propertyNames"]
						}), O.additionalProperties = this.process(W.valueType, {
							...K,
							path: [...K.path, "additionalProperties"]
						});
						break;
					}
					case "map":
						if (this.unrepresentable === "throw") throw Error("Map cannot be represented in JSON Schema");
						break;
					case "set":
						if (this.unrepresentable === "throw") throw Error("Set cannot be represented in JSON Schema");
						break;
					case "enum": {
						let O = N, w = i9(W.entries);
						if (w.every((B) => typeof B === "number")) O.type = "number";
						if (w.every((B) => typeof B === "string")) O.type = "string";
						O.enum = w;
						break;
					}
					case "literal": {
						let O = N, w = [];
						for (let B of W.values) if (B === void 0) {
							if (this.unrepresentable === "throw") throw Error("Literal `undefined` cannot be represented in JSON Schema");
						} else if (typeof B === "bigint") if (this.unrepresentable === "throw") throw Error("BigInt literals cannot be represented in JSON Schema");
						else w.push(Number(B));
						else w.push(B);
						if (w.length === 0);
						else if (w.length === 1) {
							let B = w[0];
							O.type = B === null ? "null" : typeof B, O.const = B;
						} else {
							if (w.every((B) => typeof B === "number")) O.type = "number";
							if (w.every((B) => typeof B === "string")) O.type = "string";
							if (w.every((B) => typeof B === "boolean")) O.type = "string";
							if (w.every((B) => B === null)) O.type = "null";
							O.enum = w;
						}
						break;
					}
					case "file": {
						let O = N, w = {
							type: "string",
							format: "binary",
							contentEncoding: "binary"
						}, { minimum: B, maximum: F, mime: j } = $._zod.bag;
						if (B !== void 0) w.minLength = B;
						if (F !== void 0) w.maxLength = F;
						if (j) if (j.length === 1) w.contentMediaType = j[0], Object.assign(O, w);
						else O.anyOf = j.map((I) => {
							return {
								...w,
								contentMediaType: I
							};
						});
						else Object.assign(O, w);
						break;
					}
					case "transform":
						if (this.unrepresentable === "throw") throw Error("Transforms cannot be represented in JSON Schema");
						break;
					case "nullable":
						N.anyOf = [this.process(W.innerType, K), { type: "null" }];
						break;
					case "nonoptional":
						this.process(W.innerType, K), z.ref = W.innerType;
						break;
					case "success": {
						let O = N;
						O.type = "boolean";
						break;
					}
					case "default":
						this.process(W.innerType, K), z.ref = W.innerType, N.default = JSON.parse(JSON.stringify(W.defaultValue));
						break;
					case "prefault":
						if (this.process(W.innerType, K), z.ref = W.innerType, this.io === "input") N._prefault = JSON.parse(JSON.stringify(W.defaultValue));
						break;
					case "catch": {
						this.process(W.innerType, K), z.ref = W.innerType;
						let O;
						try {
							O = W.catchValue(void 0);
						} catch {
							throw Error("Dynamic catch values are not supported in JSON Schema");
						}
						N.default = O;
						break;
					}
					case "nan":
						if (this.unrepresentable === "throw") throw Error("NaN cannot be represented in JSON Schema");
						break;
					case "template_literal": {
						let O = N, w = $._zod.pattern;
						if (!w) throw Error("Pattern not found in template literal");
						O.type = "string", O.pattern = w.source;
						break;
					}
					case "pipe": {
						let O = this.io === "input" ? W.in._zod.def.type === "transform" ? W.out : W.in : W.out;
						this.process(O, K), z.ref = O;
						break;
					}
					case "readonly":
						this.process(W.innerType, K), z.ref = W.innerType, N.readOnly = !0;
						break;
					case "promise":
						this.process(W.innerType, K), z.ref = W.innerType;
						break;
					case "optional":
						this.process(W.innerType, K), z.ref = W.innerType;
						break;
					case "lazy": {
						let O = $._zod.innerType;
						this.process(O, K), z.ref = O;
						break;
					}
					case "custom":
						if (this.unrepresentable === "throw") throw Error("Custom types cannot be represented in JSON Schema");
						break;
					default:
				}
			}
		}
		let H = this.metadataRegistry.get($);
		if (H) Object.assign(z.schema, H);
		if (this.io === "input" && y$($)) delete z.schema.examples, delete z.schema.default;
		if (this.io === "input" && z.schema._prefault) (J = z.schema).default ?? (J.default = z.schema._prefault);
		return delete z.schema._prefault, this.seen.get($).schema;
	}
	emit($, X) {
		let J = {
			cycles: X?.cycles ?? "ref",
			reused: X?.reused ?? "inline",
			external: X?.external ?? void 0
		}, W = this.seen.get($);
		if (!W) throw Error("Unprocessed schema. This is a bug in Zod.");
		let Q = (U) => {
			let K = this.target === "draft-2020-12" ? "$defs" : "definitions";
			if (J.external) {
				let w = J.external.registry.get(U[0])?.id;
				if (w) return { ref: J.external.uri(w) };
				let B = U[1].defId ?? U[1].schema.id ?? `schema${this.counter++}`;
				return U[1].defId = B, {
					defId: B,
					ref: `${J.external.uri("__shared")}#/${K}/${B}`
				};
			}
			if (U[1] === W) return { ref: "#" };
			let N = `#/${K}/`, O = U[1].schema.id ?? `__schema${this.counter++}`;
			return {
				defId: O,
				ref: N + O
			};
		}, Y = (U) => {
			if (U[1].schema.$ref) return;
			let K = U[1], { ref: V, defId: N } = Q(U);
			if (K.def = { ...K.schema }, N) K.defId = N;
			let O = K.schema;
			for (let w in O) delete O[w];
			O.$ref = V;
		};
		for (let U of this.seen.entries()) {
			let K = U[1];
			if ($ === U[0]) {
				Y(U);
				continue;
			}
			if (J.external) {
				let N = J.external.registry.get(U[0])?.id;
				if ($ !== U[0] && N) {
					Y(U);
					continue;
				}
			}
			if (this.metadataRegistry.get(U[0])?.id) {
				Y(U);
				continue;
			}
			if (K.cycle) {
				if (J.cycles === "throw") throw Error(`Cycle detected: #/${K.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
				else if (J.cycles === "ref") Y(U);
				continue;
			}
			if (K.count > 1) {
				if (J.reused === "ref") {
					Y(U);
					continue;
				}
			}
		}
		let z = (U, K) => {
			let V = this.seen.get(U), N = V.def ?? V.schema, O = { ...N };
			if (V.ref === null) return;
			let w = V.ref;
			if (V.ref = null, w) {
				z(w, K);
				let B = this.seen.get(w).schema;
				if (B.$ref && K.target === "draft-7") N.allOf = N.allOf ?? [], N.allOf.push(B);
				else Object.assign(N, B), Object.assign(N, O);
			}
			if (!V.isParent) this.override({
				zodSchema: U,
				jsonSchema: N,
				path: V.path ?? []
			});
		};
		for (let U of [...this.seen.entries()].reverse()) z(U[0], { target: this.target });
		let G = {};
		if (this.target === "draft-2020-12") G.$schema = "https://json-schema.org/draft/2020-12/schema";
		else if (this.target === "draft-7") G.$schema = "http://json-schema.org/draft-07/schema#";
		else console.warn(`Invalid target: ${this.target}`);
		Object.assign(G, W.def);
		let H = J.external?.defs ?? {};
		for (let U of this.seen.entries()) {
			let K = U[1];
			if (K.def && K.defId) H[K.defId] = K.def;
		}
		if (!J.external && Object.keys(H).length > 0) if (this.target === "draft-2020-12") G.$defs = H;
		else G.definitions = H;
		try {
			return JSON.parse(JSON.stringify(G));
		} catch (U) {
			throw Error("Error converting schema to JSON.");
		}
	}
};
function s0($, X) {
	if ($ instanceof WX) {
		let W = new I5(X), Q = {};
		for (let G of $._idmap.entries()) {
			let [H, U] = G;
			W.process(U);
		}
		let Y = {}, z = {
			registry: $,
			uri: X?.uri || ((G) => G),
			defs: Q
		};
		for (let G of $._idmap.entries()) {
			let [H, U] = G;
			Y[H] = W.emit(U, {
				...X,
				external: z
			});
		}
		if (Object.keys(Q).length > 0) Y.__shared = { [W.target === "draft-2020-12" ? "$defs" : "definitions"]: Q };
		return { schemas: Y };
	}
	let J = new I5(X);
	return J.process($), J.emit($, X);
}
function y$($, X) {
	let J = X ?? { seen: /* @__PURE__ */ new Set() };
	if (J.seen.has($)) return !1;
	J.seen.add($);
	let Q = $._zod.def;
	switch (Q.type) {
		case "string":
		case "number":
		case "bigint":
		case "boolean":
		case "date":
		case "symbol":
		case "undefined":
		case "null":
		case "any":
		case "unknown":
		case "never":
		case "void":
		case "literal":
		case "enum":
		case "nan":
		case "file":
		case "template_literal": return !1;
		case "array": return y$(Q.element, J);
		case "object":
			for (let Y in Q.shape) if (y$(Q.shape[Y], J)) return !0;
			return !1;
		case "union":
			for (let Y of Q.options) if (y$(Y, J)) return !0;
			return !1;
		case "intersection": return y$(Q.left, J) || y$(Q.right, J);
		case "tuple":
			for (let Y of Q.items) if (y$(Y, J)) return !0;
			if (Q.rest && y$(Q.rest, J)) return !0;
			return !1;
		case "record": return y$(Q.keyType, J) || y$(Q.valueType, J);
		case "map": return y$(Q.keyType, J) || y$(Q.valueType, J);
		case "set": return y$(Q.valueType, J);
		case "promise":
		case "optional":
		case "nonoptional":
		case "nullable":
		case "readonly": return y$(Q.innerType, J);
		case "lazy": return y$(Q.getter(), J);
		case "default": return y$(Q.innerType, J);
		case "prefault": return y$(Q.innerType, J);
		case "custom": return !1;
		case "transform": return !0;
		case "pipe": return y$(Q.in, J) || y$(Q.out, J);
		case "success": return !1;
		case "catch": return !1;
		default:
	}
	throw Error(`Unknown schema type: ${Q.type}`);
}
var QD = {};
var Nk = q("ZodMiniType", ($, X) => {
	if (!$._zod) throw Error("Uninitialized schema in ZodMiniType.");
	p.init($, X), $.def = X, $.parse = (J, W) => m1($, J, W, { callee: $.parse }), $.safeParse = (J, W) => t4($, J, W), $.parseAsync = async (J, W) => l1($, J, W, { callee: $.parseAsync }), $.safeParseAsync = async (J, W) => a4($, J, W), $.check = (...J) => {
		return $.clone({
			...X,
			checks: [...X.checks ?? [], ...J.map((W) => typeof W === "function" ? { _zod: {
				check: W,
				def: { check: "custom" },
				onattach: []
			} } : W)]
		});
	}, $.clone = (J, W) => n$($, J, W), $.brand = () => $, $.register = (J, W) => {
		return J.add($, W), $;
	};
});
q("ZodMiniObject", ($, X) => {
	XX.init($, X), Nk.init($, X), E.defineLazy($, "shape", () => X.shape);
});
var W1 = {};
D1(W1, {
	xid: () => vk,
	void: () => ak,
	uuidv7: () => Ik,
	uuidv6: () => Ak,
	uuidv4: () => Mk,
	uuid: () => Lk,
	url: () => Zk,
	uppercase: () => vX,
	unknown: () => L$,
	union: () => V$,
	undefined: () => ok,
	ulid: () => Sk,
	uint64: () => nk,
	uint32: () => dk,
	tuple: () => X_,
	trim: () => fX,
	treeifyError: () => m7,
	transform: () => rH,
	toUpperCase: () => gX,
	toLowerCase: () => yX,
	toJSONSchema: () => s0,
	templateLiteral: () => K_,
	symbol: () => rk,
	superRefine: () => lD,
	success: () => H_,
	stringbool: () => O_,
	stringFormat: () => uk,
	string: () => L,
	strictObject: () => $_,
	startsWith: () => kX,
	size: () => PX,
	setErrorMap: () => q_,
	set: () => W_,
	safeParseAsync: () => ZH,
	safeParse: () => IH,
	registry: () => YX,
	regexes: () => s4,
	regex: () => EX,
	refine: () => mD,
	record: () => N$,
	readonly: () => TD,
	property: () => OH,
	promise: () => V_,
	prettifyError: () => l7,
	preprocess: () => u5,
	prefault: () => ED,
	positive: () => UH,
	pipe: () => _5,
	partialRecord: () => J_,
	parseAsync: () => AH,
	parse: () => MH,
	overwrite: () => b4,
	optional: () => j$,
	object: () => x,
	number: () => z$,
	nullish: () => G_,
	nullable: () => k5,
	null: () => x5,
	normalize: () => TX,
	nonpositive: () => VH,
	nonoptional: () => SD,
	nonnegative: () => NH,
	never: () => T5,
	negative: () => KH,
	nativeEnum: () => Y_,
	nanoid: () => Rk,
	nan: () => U_,
	multipleOf: () => i1,
	minSize: () => n1,
	minLength: () => X1,
	mime: () => xX,
	maxSize: () => o0,
	maxLength: () => t0,
	map: () => Q_,
	lte: () => P6,
	lt: () => I4,
	lowercase: () => SX,
	looseObject: () => r$,
	locales: () => n0,
	literal: () => g,
	length: () => a0,
	lazy: () => gD,
	ksuid: () => Ck,
	keyof: () => ek,
	jwt: () => hk,
	json: () => w_,
	iso: () => $8,
	ipv6: () => _k,
	ipv4: () => kk,
	intersection: () => pX,
	int64: () => ik,
	int32: () => ck,
	int: () => bH,
	instanceof: () => N_,
	includes: () => CX,
	guid: () => jk,
	gte: () => H6,
	gt: () => Z4,
	globalRegistry: () => G6,
	getErrorMap: () => D_,
	function: () => A5,
	formatError: () => m0,
	float64: () => lk,
	float32: () => mk,
	flattenError: () => u0,
	file: () => z_,
	enum: () => a$,
	endsWith: () => _X,
	emoji: () => bk,
	email: () => Fk,
	e164: () => gk,
	discriminatedUnion: () => g5,
	date: () => sk,
	custom: () => sH,
	cuid2: () => Ek,
	cuid: () => Pk,
	core: () => l6,
	config: () => v$,
	coerce: () => eH,
	clone: () => n$,
	cidrv6: () => Tk,
	cidrv4: () => xk,
	check: () => uD,
	catch: () => kD,
	boolean: () => _$,
	bigint: () => pk,
	base64url: () => yk,
	base64: () => fk,
	array: () => $$,
	any: () => tk,
	_default: () => RD,
	_ZodString: () => RH,
	ZodXID: () => xH,
	ZodVoid: () => BD,
	ZodUnknown: () => OD,
	ZodUnion: () => pH,
	ZodUndefined: () => KD,
	ZodUUID: () => R4,
	ZodURL: () => EH,
	ZodULID: () => _H,
	ZodType: () => s,
	ZodTuple: () => jD,
	ZodTransform: () => nH,
	ZodTemplateLiteral: () => fD,
	ZodSymbol: () => UD,
	ZodSuccess: () => vD,
	ZodStringFormat: () => F$,
	ZodString: () => mX,
	ZodSet: () => MD,
	ZodRecord: () => iH,
	ZodRealError: () => X8,
	ZodReadonly: () => xD,
	ZodPromise: () => hD,
	ZodPrefault: () => PD,
	ZodPipe: () => aH,
	ZodOptional: () => oH,
	ZodObject: () => y5,
	ZodNumberFormat: () => J8,
	ZodNumber: () => lX,
	ZodNullable: () => ZD,
	ZodNull: () => VD,
	ZodNonOptional: () => tH,
	ZodNever: () => wD,
	ZodNanoID: () => vH,
	ZodNaN: () => _D,
	ZodMap: () => LD,
	ZodLiteral: () => AD,
	ZodLazy: () => yD,
	ZodKSUID: () => TH,
	ZodJWT: () => cH,
	ZodIssueCode: () => B_,
	ZodIntersection: () => FD,
	ZodISOTime: () => S5,
	ZodISODuration: () => v5,
	ZodISODateTime: () => P5,
	ZodISODate: () => E5,
	ZodIPv6: () => yH,
	ZodIPv4: () => fH,
	ZodGUID: () => C5,
	ZodFile: () => ID,
	ZodError: () => qk,
	ZodEnum: () => uX,
	ZodEmoji: () => SH,
	ZodEmail: () => PH,
	ZodE164: () => lH,
	ZodDiscriminatedUnion: () => DD,
	ZodDefault: () => bD,
	ZodDate: () => f5,
	ZodCustomStringFormat: () => HD,
	ZodCustom: () => h5,
	ZodCatch: () => CD,
	ZodCUID2: () => kH,
	ZodCUID: () => CH,
	ZodCIDRv6: () => hH,
	ZodCIDRv4: () => gH,
	ZodBoolean: () => cX,
	ZodBigIntFormat: () => dH,
	ZodBigInt: () => dX,
	ZodBase64URL: () => mH,
	ZodBase64: () => uH,
	ZodArray: () => qD,
	ZodAny: () => ND,
	TimePrecision: () => sQ,
	NEVER: () => g7,
	$output: () => oQ,
	$input: () => tQ,
	$brand: () => h7
});
var $8 = {};
D1($8, {
	time: () => jH,
	duration: () => LH,
	datetime: () => DH,
	date: () => FH,
	ZodISOTime: () => S5,
	ZodISODuration: () => v5,
	ZodISODateTime: () => P5,
	ZodISODate: () => E5
});
var P5 = q("ZodISODateTime", ($, X) => {
	VG.init($, X), F$.init($, X);
});
function DH($) {
	return XH(P5, $);
}
var E5 = q("ZodISODate", ($, X) => {
	NG.init($, X), F$.init($, X);
});
function FH($) {
	return JH(E5, $);
}
var S5 = q("ZodISOTime", ($, X) => {
	OG.init($, X), F$.init($, X);
});
function jH($) {
	return QH(S5, $);
}
var v5 = q("ZodISODuration", ($, X) => {
	wG.init($, X), F$.init($, X);
});
function LH($) {
	return WH(v5, $);
}
var GD = ($, X) => {
	s9.init($, X), $.name = "ZodError", Object.defineProperties($, {
		format: { value: (J) => m0($, J) },
		flatten: { value: (J) => u0($, J) },
		addIssue: { value: (J) => $.issues.push(J) },
		addIssues: { value: (J) => $.issues.push(...J) },
		isEmpty: { get() {
			return $.issues.length === 0;
		} }
	});
}, qk = q("ZodError", GD), X8 = q("ZodError", GD, { Parent: Error });
var MH = c7(X8), AH = d7(X8), IH = p7(X8), ZH = i7(X8);
var s = q("ZodType", ($, X) => {
	return p.init($, X), $.def = X, Object.defineProperty($, "_def", { value: X }), $.check = (...J) => {
		return $.clone({
			...X,
			checks: [...X.checks ?? [], ...J.map((W) => typeof W === "function" ? { _zod: {
				check: W,
				def: { check: "custom" },
				onattach: []
			} } : W)]
		});
	}, $.clone = (J, W) => n$($, J, W), $.brand = () => $, $.register = (J, W) => {
		return J.add($, W), $;
	}, $.parse = (J, W) => MH($, J, W, { callee: $.parse }), $.safeParse = (J, W) => IH($, J, W), $.parseAsync = async (J, W) => AH($, J, W, { callee: $.parseAsync }), $.safeParseAsync = async (J, W) => ZH($, J, W), $.spa = $.safeParseAsync, $.refine = (J, W) => $.check(mD(J, W)), $.superRefine = (J) => $.check(lD(J)), $.overwrite = (J) => $.check(b4(J)), $.optional = () => j$($), $.nullable = () => k5($), $.nullish = () => j$(k5($)), $.nonoptional = (J) => SD($, J), $.array = () => $$($), $.or = (J) => V$([$, J]), $.and = (J) => pX($, J), $.transform = (J) => _5($, rH(J)), $.default = (J) => RD($, J), $.prefault = (J) => ED($, J), $.catch = (J) => kD($, J), $.pipe = (J) => _5($, J), $.readonly = () => TD($), $.describe = (J) => {
		let W = $.clone();
		return G6.add(W, { description: J }), W;
	}, Object.defineProperty($, "description", {
		get() {
			return G6.get($)?.description;
		},
		configurable: !0
	}), $.meta = (...J) => {
		if (J.length === 0) return G6.get($);
		let W = $.clone();
		return G6.add(W, J[0]), W;
	}, $.isOptional = () => $.safeParse(void 0).success, $.isNullable = () => $.safeParse(null).success, $;
}), RH = q("_ZodString", ($, X) => {
	e4.init($, X), s.init($, X);
	let J = $._zod.bag;
	$.format = J.format ?? null, $.minLength = J.minimum ?? null, $.maxLength = J.maximum ?? null, $.regex = (...W) => $.check(EX(...W)), $.includes = (...W) => $.check(CX(...W)), $.startsWith = (...W) => $.check(kX(...W)), $.endsWith = (...W) => $.check(_X(...W)), $.min = (...W) => $.check(X1(...W)), $.max = (...W) => $.check(t0(...W)), $.length = (...W) => $.check(a0(...W)), $.nonempty = (...W) => $.check(X1(1, ...W)), $.lowercase = (W) => $.check(SX(W)), $.uppercase = (W) => $.check(vX(W)), $.trim = () => $.check(fX()), $.normalize = (...W) => $.check(TX(...W)), $.toLowerCase = () => $.check(yX()), $.toUpperCase = () => $.check(gX());
}), mX = q("ZodString", ($, X) => {
	e4.init($, X), RH.init($, X), $.email = (J) => $.check(zX(PH, J)), $.url = (J) => $.check(VX(EH, J)), $.jwt = (J) => $.check(RX(cH, J)), $.emoji = (J) => $.check(NX(SH, J)), $.guid = (J) => $.check(r0(C5, J)), $.uuid = (J) => $.check(GX(R4, J)), $.uuidv4 = (J) => $.check(HX(R4, J)), $.uuidv6 = (J) => $.check(UX(R4, J)), $.uuidv7 = (J) => $.check(KX(R4, J)), $.nanoid = (J) => $.check(OX(vH, J)), $.guid = (J) => $.check(r0(C5, J)), $.cuid = (J) => $.check(wX(CH, J)), $.cuid2 = (J) => $.check(BX(kH, J)), $.ulid = (J) => $.check(qX(_H, J)), $.base64 = (J) => $.check(IX(uH, J)), $.base64url = (J) => $.check(ZX(mH, J)), $.xid = (J) => $.check(DX(xH, J)), $.ksuid = (J) => $.check(FX(TH, J)), $.ipv4 = (J) => $.check(jX(fH, J)), $.ipv6 = (J) => $.check(LX(yH, J)), $.cidrv4 = (J) => $.check(MX(gH, J)), $.cidrv6 = (J) => $.check(AX(hH, J)), $.e164 = (J) => $.check(bX(lH, J)), $.datetime = (J) => $.check(DH(J)), $.date = (J) => $.check(FH(J)), $.time = (J) => $.check(jH(J)), $.duration = (J) => $.check(LH(J));
});
function L($) {
	return aQ(mX, $);
}
var F$ = q("ZodStringFormat", ($, X) => {
	K$.init($, X), RH.init($, X);
}), PH = q("ZodEmail", ($, X) => {
	XQ.init($, X), F$.init($, X);
});
function Fk($) {
	return zX(PH, $);
}
var C5 = q("ZodGUID", ($, X) => {
	e7.init($, X), F$.init($, X);
});
function jk($) {
	return r0(C5, $);
}
var R4 = q("ZodUUID", ($, X) => {
	$Q.init($, X), F$.init($, X);
});
function Lk($) {
	return GX(R4, $);
}
function Mk($) {
	return HX(R4, $);
}
function Ak($) {
	return UX(R4, $);
}
function Ik($) {
	return KX(R4, $);
}
var EH = q("ZodURL", ($, X) => {
	JQ.init($, X), F$.init($, X);
});
function Zk($) {
	return VX(EH, $);
}
var SH = q("ZodEmoji", ($, X) => {
	QQ.init($, X), F$.init($, X);
});
function bk($) {
	return NX(SH, $);
}
var vH = q("ZodNanoID", ($, X) => {
	WQ.init($, X), F$.init($, X);
});
function Rk($) {
	return OX(vH, $);
}
var CH = q("ZodCUID", ($, X) => {
	YQ.init($, X), F$.init($, X);
});
function Pk($) {
	return wX(CH, $);
}
var kH = q("ZodCUID2", ($, X) => {
	zQ.init($, X), F$.init($, X);
});
function Ek($) {
	return BX(kH, $);
}
var _H = q("ZodULID", ($, X) => {
	GQ.init($, X), F$.init($, X);
});
function Sk($) {
	return qX(_H, $);
}
var xH = q("ZodXID", ($, X) => {
	HQ.init($, X), F$.init($, X);
});
function vk($) {
	return DX(xH, $);
}
var TH = q("ZodKSUID", ($, X) => {
	UQ.init($, X), F$.init($, X);
});
function Ck($) {
	return FX(TH, $);
}
var fH = q("ZodIPv4", ($, X) => {
	KQ.init($, X), F$.init($, X);
});
function kk($) {
	return jX(fH, $);
}
var yH = q("ZodIPv6", ($, X) => {
	VQ.init($, X), F$.init($, X);
});
function _k($) {
	return LX(yH, $);
}
var gH = q("ZodCIDRv4", ($, X) => {
	NQ.init($, X), F$.init($, X);
});
function xk($) {
	return MX(gH, $);
}
var hH = q("ZodCIDRv6", ($, X) => {
	OQ.init($, X), F$.init($, X);
});
function Tk($) {
	return AX(hH, $);
}
var uH = q("ZodBase64", ($, X) => {
	wQ.init($, X), F$.init($, X);
});
function fk($) {
	return IX(uH, $);
}
var mH = q("ZodBase64URL", ($, X) => {
	BQ.init($, X), F$.init($, X);
});
function yk($) {
	return ZX(mH, $);
}
var lH = q("ZodE164", ($, X) => {
	qQ.init($, X), F$.init($, X);
});
function gk($) {
	return bX(lH, $);
}
var cH = q("ZodJWT", ($, X) => {
	DQ.init($, X), F$.init($, X);
});
function hk($) {
	return RX(cH, $);
}
var HD = q("ZodCustomStringFormat", ($, X) => {
	FQ.init($, X), F$.init($, X);
});
function uk($, X, J = {}) {
	return M5(HD, $, X, J);
}
var lX = q("ZodNumber", ($, X) => {
	e9.init($, X), s.init($, X), $.gt = (W, Q) => $.check(Z4(W, Q)), $.gte = (W, Q) => $.check(H6(W, Q)), $.min = (W, Q) => $.check(H6(W, Q)), $.lt = (W, Q) => $.check(I4(W, Q)), $.lte = (W, Q) => $.check(P6(W, Q)), $.max = (W, Q) => $.check(P6(W, Q)), $.int = (W) => $.check(bH(W)), $.safe = (W) => $.check(bH(W)), $.positive = (W) => $.check(Z4(0, W)), $.nonnegative = (W) => $.check(H6(0, W)), $.negative = (W) => $.check(I4(0, W)), $.nonpositive = (W) => $.check(P6(0, W)), $.multipleOf = (W, Q) => $.check(i1(W, Q)), $.step = (W, Q) => $.check(i1(W, Q)), $.finite = () => $;
	let J = $._zod.bag;
	$.minValue = Math.max(J.minimum ?? Number.NEGATIVE_INFINITY, J.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, $.maxValue = Math.min(J.maximum ?? Number.POSITIVE_INFINITY, J.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, $.isInt = (J.format ?? "").includes("int") || Number.isSafeInteger(J.multipleOf ?? .5), $.isFinite = !0, $.format = J.format ?? null;
});
function z$($) {
	return eQ(lX, $);
}
var J8 = q("ZodNumberFormat", ($, X) => {
	jQ.init($, X), lX.init($, X);
});
function bH($) {
	return $5(J8, $);
}
function mk($) {
	return X5(J8, $);
}
function lk($) {
	return J5(J8, $);
}
function ck($) {
	return Q5(J8, $);
}
function dk($) {
	return W5(J8, $);
}
var cX = q("ZodBoolean", ($, X) => {
	c0.init($, X), s.init($, X);
});
function _$($) {
	return Y5(cX, $);
}
var dX = q("ZodBigInt", ($, X) => {
	$X.init($, X), s.init($, X), $.gte = (W, Q) => $.check(H6(W, Q)), $.min = (W, Q) => $.check(H6(W, Q)), $.gt = (W, Q) => $.check(Z4(W, Q)), $.gte = (W, Q) => $.check(H6(W, Q)), $.min = (W, Q) => $.check(H6(W, Q)), $.lt = (W, Q) => $.check(I4(W, Q)), $.lte = (W, Q) => $.check(P6(W, Q)), $.max = (W, Q) => $.check(P6(W, Q)), $.positive = (W) => $.check(Z4(BigInt(0), W)), $.negative = (W) => $.check(I4(BigInt(0), W)), $.nonpositive = (W) => $.check(P6(BigInt(0), W)), $.nonnegative = (W) => $.check(H6(BigInt(0), W)), $.multipleOf = (W, Q) => $.check(i1(W, Q));
	let J = $._zod.bag;
	$.minValue = J.minimum ?? null, $.maxValue = J.maximum ?? null, $.format = J.format ?? null;
});
function pk($) {
	return z5(dX, $);
}
var dH = q("ZodBigIntFormat", ($, X) => {
	LQ.init($, X), dX.init($, X);
});
function ik($) {
	return G5(dH, $);
}
function nk($) {
	return H5(dH, $);
}
var UD = q("ZodSymbol", ($, X) => {
	MQ.init($, X), s.init($, X);
});
function rk($) {
	return U5(UD, $);
}
var KD = q("ZodUndefined", ($, X) => {
	AQ.init($, X), s.init($, X);
});
function ok($) {
	return K5(KD, $);
}
var VD = q("ZodNull", ($, X) => {
	IQ.init($, X), s.init($, X);
});
function x5($) {
	return V5(VD, $);
}
var ND = q("ZodAny", ($, X) => {
	ZQ.init($, X), s.init($, X);
});
function tk() {
	return N5(ND);
}
var OD = q("ZodUnknown", ($, X) => {
	d1.init($, X), s.init($, X);
});
function L$() {
	return p1(OD);
}
var wD = q("ZodNever", ($, X) => {
	bQ.init($, X), s.init($, X);
});
function T5($) {
	return O5(wD, $);
}
var BD = q("ZodVoid", ($, X) => {
	RQ.init($, X), s.init($, X);
});
function ak($) {
	return w5(BD, $);
}
var f5 = q("ZodDate", ($, X) => {
	PQ.init($, X), s.init($, X), $.min = (W, Q) => $.check(H6(W, Q)), $.max = (W, Q) => $.check(P6(W, Q));
	let J = $._zod.bag;
	$.minDate = J.minimum ? new Date(J.minimum) : null, $.maxDate = J.maximum ? new Date(J.maximum) : null;
});
function sk($) {
	return B5(f5, $);
}
var qD = q("ZodArray", ($, X) => {
	d0.init($, X), s.init($, X), $.element = X.element, $.min = (J, W) => $.check(X1(J, W)), $.nonempty = (J) => $.check(X1(1, J)), $.max = (J, W) => $.check(t0(J, W)), $.length = (J, W) => $.check(a0(J, W)), $.unwrap = () => $.element;
});
function $$($, X) {
	return hX(qD, $, X);
}
function ek($) {
	let X = $._zod.def.shape;
	return g(Object.keys(X));
}
var y5 = q("ZodObject", ($, X) => {
	XX.init($, X), s.init($, X), E.defineLazy($, "shape", () => X.shape), $.keyof = () => a$(Object.keys($._zod.def.shape)), $.catchall = (J) => $.clone({
		...$._zod.def,
		catchall: J
	}), $.passthrough = () => $.clone({
		...$._zod.def,
		catchall: L$()
	}), $.loose = () => $.clone({
		...$._zod.def,
		catchall: L$()
	}), $.strict = () => $.clone({
		...$._zod.def,
		catchall: T5()
	}), $.strip = () => $.clone({
		...$._zod.def,
		catchall: void 0
	}), $.extend = (J) => {
		return E.extend($, J);
	}, $.merge = (J) => E.merge($, J), $.pick = (J) => E.pick($, J), $.omit = (J) => E.omit($, J), $.partial = (...J) => E.partial(oH, $, J[0]), $.required = (...J) => E.required(tH, $, J[0]);
});
function x($, X) {
	return new y5({
		type: "object",
		get shape() {
			return E.assignProp(this, "shape", { ...$ }), this.shape;
		},
		...E.normalizeParams(X)
	});
}
function $_($, X) {
	return new y5({
		type: "object",
		get shape() {
			return E.assignProp(this, "shape", { ...$ }), this.shape;
		},
		catchall: T5(),
		...E.normalizeParams(X)
	});
}
function r$($, X) {
	return new y5({
		type: "object",
		get shape() {
			return E.assignProp(this, "shape", { ...$ }), this.shape;
		},
		catchall: L$(),
		...E.normalizeParams(X)
	});
}
var pH = q("ZodUnion", ($, X) => {
	JX.init($, X), s.init($, X), $.options = X.options;
});
function V$($, X) {
	return new pH({
		type: "union",
		options: $,
		...E.normalizeParams(X)
	});
}
var DD = q("ZodDiscriminatedUnion", ($, X) => {
	pH.init($, X), EQ.init($, X);
});
function g5($, X, J) {
	return new DD({
		type: "union",
		options: X,
		discriminator: $,
		...E.normalizeParams(J)
	});
}
var FD = q("ZodIntersection", ($, X) => {
	SQ.init($, X), s.init($, X);
});
function pX($, X) {
	return new FD({
		type: "intersection",
		left: $,
		right: X
	});
}
var jD = q("ZodTuple", ($, X) => {
	$1.init($, X), s.init($, X), $.rest = (J) => $.clone({
		...$._zod.def,
		rest: J
	});
});
function X_($, X, J) {
	let W = X instanceof p, Q = W ? J : X;
	return new jD({
		type: "tuple",
		items: $,
		rest: W ? X : null,
		...E.normalizeParams(Q)
	});
}
var iH = q("ZodRecord", ($, X) => {
	vQ.init($, X), s.init($, X), $.keyType = X.keyType, $.valueType = X.valueType;
});
function N$($, X, J) {
	return new iH({
		type: "record",
		keyType: $,
		valueType: X,
		...E.normalizeParams(J)
	});
}
function J_($, X, J) {
	return new iH({
		type: "record",
		keyType: V$([$, T5()]),
		valueType: X,
		...E.normalizeParams(J)
	});
}
var LD = q("ZodMap", ($, X) => {
	CQ.init($, X), s.init($, X), $.keyType = X.keyType, $.valueType = X.valueType;
});
function Q_($, X, J) {
	return new LD({
		type: "map",
		keyType: $,
		valueType: X,
		...E.normalizeParams(J)
	});
}
var MD = q("ZodSet", ($, X) => {
	kQ.init($, X), s.init($, X), $.min = (...J) => $.check(n1(...J)), $.nonempty = (J) => $.check(n1(1, J)), $.max = (...J) => $.check(o0(...J)), $.size = (...J) => $.check(PX(...J));
});
function W_($, X) {
	return new MD({
		type: "set",
		valueType: $,
		...E.normalizeParams(X)
	});
}
var uX = q("ZodEnum", ($, X) => {
	_Q.init($, X), s.init($, X), $.enum = X.entries, $.options = Object.values(X.entries);
	let J = new Set(Object.keys(X.entries));
	$.extract = (W, Q) => {
		let Y = {};
		for (let z of W) if (J.has(z)) Y[z] = X.entries[z];
		else throw Error(`Key ${z} not found in enum`);
		return new uX({
			...X,
			checks: [],
			...E.normalizeParams(Q),
			entries: Y
		});
	}, $.exclude = (W, Q) => {
		let Y = { ...X.entries };
		for (let z of W) if (J.has(z)) delete Y[z];
		else throw Error(`Key ${z} not found in enum`);
		return new uX({
			...X,
			checks: [],
			...E.normalizeParams(Q),
			entries: Y
		});
	};
});
function a$($, X) {
	return new uX({
		type: "enum",
		entries: Array.isArray($) ? Object.fromEntries($.map((W) => [W, W])) : $,
		...E.normalizeParams(X)
	});
}
function Y_($, X) {
	return new uX({
		type: "enum",
		entries: $,
		...E.normalizeParams(X)
	});
}
var AD = q("ZodLiteral", ($, X) => {
	xQ.init($, X), s.init($, X), $.values = new Set(X.values), Object.defineProperty($, "value", { get() {
		if (X.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return X.values[0];
	} });
});
function g($, X) {
	return new AD({
		type: "literal",
		values: Array.isArray($) ? $ : [$],
		...E.normalizeParams(X)
	});
}
var ID = q("ZodFile", ($, X) => {
	TQ.init($, X), s.init($, X), $.min = (J, W) => $.check(n1(J, W)), $.max = (J, W) => $.check(o0(J, W)), $.mime = (J, W) => $.check(xX(Array.isArray(J) ? J : [J], W));
});
function z_($) {
	return D5(ID, $);
}
var nH = q("ZodTransform", ($, X) => {
	p0.init($, X), s.init($, X), $._zod.parse = (J, W) => {
		J.addIssue = (Y) => {
			if (typeof Y === "string") J.issues.push(E.issue(Y, J.value, X));
			else {
				let z = Y;
				if (z.fatal) z.continue = !1;
				z.code ?? (z.code = "custom"), z.input ?? (z.input = J.value), z.inst ?? (z.inst = $), z.continue ?? (z.continue = !0), J.issues.push(E.issue(z));
			}
		};
		let Q = X.transform(J.value, J);
		if (Q instanceof Promise) return Q.then((Y) => {
			return J.value = Y, J;
		});
		return J.value = Q, J;
	};
});
function rH($) {
	return new nH({
		type: "transform",
		transform: $
	});
}
var oH = q("ZodOptional", ($, X) => {
	fQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.innerType;
});
function j$($) {
	return new oH({
		type: "optional",
		innerType: $
	});
}
var ZD = q("ZodNullable", ($, X) => {
	yQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.innerType;
});
function k5($) {
	return new ZD({
		type: "nullable",
		innerType: $
	});
}
function G_($) {
	return j$(k5($));
}
var bD = q("ZodDefault", ($, X) => {
	gQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.innerType, $.removeDefault = $.unwrap;
});
function RD($, X) {
	return new bD({
		type: "default",
		innerType: $,
		get defaultValue() {
			return typeof X === "function" ? X() : X;
		}
	});
}
var PD = q("ZodPrefault", ($, X) => {
	hQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.innerType;
});
function ED($, X) {
	return new PD({
		type: "prefault",
		innerType: $,
		get defaultValue() {
			return typeof X === "function" ? X() : X;
		}
	});
}
var tH = q("ZodNonOptional", ($, X) => {
	uQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.innerType;
});
function SD($, X) {
	return new tH({
		type: "nonoptional",
		innerType: $,
		...E.normalizeParams(X)
	});
}
var vD = q("ZodSuccess", ($, X) => {
	mQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.innerType;
});
function H_($) {
	return new vD({
		type: "success",
		innerType: $
	});
}
var CD = q("ZodCatch", ($, X) => {
	lQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.innerType, $.removeCatch = $.unwrap;
});
function kD($, X) {
	return new CD({
		type: "catch",
		innerType: $,
		catchValue: typeof X === "function" ? X : () => X
	});
}
var _D = q("ZodNaN", ($, X) => {
	cQ.init($, X), s.init($, X);
});
function U_($) {
	return q5(_D, $);
}
var aH = q("ZodPipe", ($, X) => {
	i0.init($, X), s.init($, X), $.in = X.in, $.out = X.out;
});
function _5($, X) {
	return new aH({
		type: "pipe",
		in: $,
		out: X
	});
}
var xD = q("ZodReadonly", ($, X) => {
	dQ.init($, X), s.init($, X);
});
function TD($) {
	return new xD({
		type: "readonly",
		innerType: $
	});
}
var fD = q("ZodTemplateLiteral", ($, X) => {
	pQ.init($, X), s.init($, X);
});
function K_($, X) {
	return new fD({
		type: "template_literal",
		parts: $,
		...E.normalizeParams(X)
	});
}
var yD = q("ZodLazy", ($, X) => {
	nQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.getter();
});
function gD($) {
	return new yD({
		type: "lazy",
		getter: $
	});
}
var hD = q("ZodPromise", ($, X) => {
	iQ.init($, X), s.init($, X), $.unwrap = () => $._zod.def.innerType;
});
function V_($) {
	return new hD({
		type: "promise",
		innerType: $
	});
}
var h5 = q("ZodCustom", ($, X) => {
	rQ.init($, X), s.init($, X);
});
function uD($, X) {
	let J = new I$({
		check: "custom",
		...E.normalizeParams(X)
	});
	return J._zod.check = $, J;
}
function sH($, X) {
	return F5(h5, $ ?? (() => !0), X);
}
function mD($, X = {}) {
	return j5(h5, $, X);
}
function lD($, X) {
	let J = uD((W) => {
		return W.addIssue = (Q) => {
			if (typeof Q === "string") W.issues.push(E.issue(Q, W.value, J._zod.def));
			else {
				let Y = Q;
				if (Y.fatal) Y.continue = !1;
				Y.code ?? (Y.code = "custom"), Y.input ?? (Y.input = W.value), Y.inst ?? (Y.inst = J), Y.continue ?? (Y.continue = !J._zod.def.abort), W.issues.push(E.issue(Y));
			}
		}, $(W.value, W);
	}, X);
	return J;
}
function N_($, X = { error: `Input not instance of ${$.name}` }) {
	let J = new h5({
		type: "custom",
		check: "custom",
		fn: (W) => W instanceof $,
		abort: !0,
		...E.normalizeParams(X)
	});
	return J._zod.bag.Class = $, J;
}
var O_ = (...$) => L5({
	Pipe: aH,
	Boolean: cX,
	String: mX,
	Transform: nH
}, ...$);
function w_($) {
	let X = gD(() => {
		return V$([
			L($),
			z$(),
			_$(),
			x5(),
			$$(X),
			N$(L(), X)
		]);
	});
	return X;
}
function u5($, X) {
	return _5(rH($), X);
}
var B_ = {
	invalid_type: "invalid_type",
	too_big: "too_big",
	too_small: "too_small",
	invalid_format: "invalid_format",
	not_multiple_of: "not_multiple_of",
	unrecognized_keys: "unrecognized_keys",
	invalid_union: "invalid_union",
	invalid_key: "invalid_key",
	invalid_element: "invalid_element",
	invalid_value: "invalid_value",
	custom: "custom"
};
function q_($) {
	v$({ customError: $ });
}
function D_() {
	return v$().customError;
}
var eH = {};
D1(eH, {
	string: () => F_,
	number: () => j_,
	date: () => A_,
	boolean: () => L_,
	bigint: () => M_
});
function F_($) {
	return $H(mX, $);
}
function j_($) {
	return YH(lX, $);
}
function L_($) {
	return zH(cX, $);
}
function M_($) {
	return GH(dX, $);
}
function A_($) {
	return HH(f5, $);
}
v$(QX());
var Y1 = "io.modelcontextprotocol/related-task", l5 = "2.0", g$ = sH(($) => $ !== null && (typeof $ === "object" || typeof $ === "function")), dD = V$([L(), z$().int()]), pD = L();
r$({
	ttl: z$().optional(),
	pollInterval: z$().optional()
});
var I_ = x({ ttl: z$().optional() }), Z_ = x({ taskId: L() }), XU = r$({
	progressToken: dD.optional(),
	[Y1]: Z_.optional()
}), M6 = x({ _meta: XU.optional() }), iX = M6.extend({ task: I_.optional() }), c$ = x({
	method: L(),
	params: M6.loose().optional()
}), S6 = x({ _meta: XU.optional() }), v6 = x({
	method: L(),
	params: S6.loose().optional()
}), d$ = r$({ _meta: XU.optional() }), c5 = V$([L(), z$().int()]), nD = x({
	jsonrpc: g(l5),
	id: c5,
	...c$.shape
}).strict(), rD = x({
	jsonrpc: g(l5),
	...v6.shape
}).strict(), QU = x({
	jsonrpc: g(l5),
	id: c5,
	result: d$
}).strict();
var m;
(function($) {
	$[$.ConnectionClosed = -32e3] = "ConnectionClosed", $[$.RequestTimeout = -32001] = "RequestTimeout", $[$.ParseError = -32700] = "ParseError", $[$.InvalidRequest = -32600] = "InvalidRequest", $[$.MethodNotFound = -32601] = "MethodNotFound", $[$.InvalidParams = -32602] = "InvalidParams", $[$.InternalError = -32603] = "InternalError", $[$.UrlElicitationRequired = -32042] = "UrlElicitationRequired";
})(m || (m = {}));
var WU = x({
	jsonrpc: g(l5),
	id: c5.optional(),
	error: x({
		code: z$().int(),
		message: L(),
		data: L$().optional()
	})
}).strict();
V$([
	nD,
	rD,
	QU,
	WU
]);
V$([QU, WU]);
var d5 = d$.strict(), b_ = S6.extend({
	requestId: c5.optional(),
	reason: L().optional()
}), p5 = v6.extend({
	method: g("notifications/cancelled"),
	params: b_
}), rX = x({ icons: $$(x({
	src: L(),
	mimeType: L().optional(),
	sizes: $$(L()).optional(),
	theme: a$(["light", "dark"]).optional()
})).optional() }), Q8 = x({
	name: L(),
	title: L().optional()
}), aD = Q8.extend({
	...Q8.shape,
	...rX.shape,
	version: L(),
	websiteUrl: L().optional(),
	description: L().optional()
}), E_ = u5(($) => {
	if ($ && typeof $ === "object" && !Array.isArray($)) {
		if (Object.keys($).length === 0) return { form: {} };
	}
	return $;
}, pX(x({
	form: pX(x({ applyDefaults: _$().optional() }), N$(L(), L$())).optional(),
	url: g$.optional()
}), N$(L(), L$()).optional())), S_ = r$({
	list: g$.optional(),
	cancel: g$.optional(),
	requests: r$({
		sampling: r$({ createMessage: g$.optional() }).optional(),
		elicitation: r$({ create: g$.optional() }).optional()
	}).optional()
}), v_ = r$({
	list: g$.optional(),
	cancel: g$.optional(),
	requests: r$({ tools: r$({ call: g$.optional() }).optional() }).optional()
}), C_ = x({
	experimental: N$(L(), g$).optional(),
	sampling: x({
		context: g$.optional(),
		tools: g$.optional()
	}).optional(),
	elicitation: E_.optional(),
	roots: x({ listChanged: _$().optional() }).optional(),
	tasks: S_.optional(),
	extensions: N$(L(), g$).optional()
}), k_ = M6.extend({
	protocolVersion: L(),
	capabilities: C_,
	clientInfo: aD
}), YU = c$.extend({
	method: g("initialize"),
	params: k_
});
var __ = x({
	experimental: N$(L(), g$).optional(),
	logging: g$.optional(),
	completions: g$.optional(),
	prompts: x({ listChanged: _$().optional() }).optional(),
	resources: x({
		subscribe: _$().optional(),
		listChanged: _$().optional()
	}).optional(),
	tools: x({ listChanged: _$().optional() }).optional(),
	tasks: v_.optional(),
	extensions: N$(L(), g$).optional()
}), x_ = d$.extend({
	protocolVersion: L(),
	capabilities: __,
	serverInfo: aD,
	instructions: L().optional()
}), zU = v6.extend({
	method: g("notifications/initialized"),
	params: S6.optional()
}), i5 = c$.extend({
	method: g("ping"),
	params: M6.optional()
}), T_ = x({
	progress: z$(),
	total: j$(z$()),
	message: j$(L())
}), f_ = x({
	...S6.shape,
	...T_.shape,
	progressToken: dD
}), n5 = v6.extend({
	method: g("notifications/progress"),
	params: f_
}), y_ = M6.extend({ cursor: pD.optional() }), oX = c$.extend({ params: y_.optional() }), tX = d$.extend({ nextCursor: pD.optional() }), g_ = a$([
	"working",
	"input_required",
	"completed",
	"failed",
	"cancelled"
]), aX = x({
	taskId: L(),
	status: g_,
	ttl: V$([z$(), x5()]),
	createdAt: L(),
	lastUpdatedAt: L(),
	pollInterval: j$(z$()),
	statusMessage: j$(L())
}), W8 = d$.extend({ task: aX }), h_ = S6.merge(aX), sX = v6.extend({
	method: g("notifications/tasks/status"),
	params: h_
}), r5 = c$.extend({
	method: g("tasks/get"),
	params: M6.extend({ taskId: L() })
}), o5 = d$.merge(aX), t5 = c$.extend({
	method: g("tasks/result"),
	params: M6.extend({ taskId: L() })
});
d$.loose();
var a5 = oX.extend({ method: g("tasks/list") }), s5 = tX.extend({ tasks: $$(aX) }), e5 = c$.extend({
	method: g("tasks/cancel"),
	params: M6.extend({ taskId: L() })
});
d$.merge(aX);
var eD = x({
	uri: L(),
	mimeType: j$(L()),
	_meta: N$(L(), L$()).optional()
}), $F = eD.extend({ text: L() }), GU = L().refine(($) => {
	try {
		return atob($), !0;
	} catch {
		return !1;
	}
}, { message: "Invalid Base64 string" }), XF = eD.extend({ blob: GU }), eX = a$(["user", "assistant"]), Y8 = x({
	audience: $$(eX).optional(),
	priority: z$().min(0).max(1).optional(),
	lastModified: $8.datetime({ offset: !0 }).optional()
}), JF = x({
	...Q8.shape,
	...rX.shape,
	uri: L(),
	description: j$(L()),
	mimeType: j$(L()),
	size: j$(z$()),
	annotations: Y8.optional(),
	_meta: j$(r$({}))
}), u_ = x({
	...Q8.shape,
	...rX.shape,
	uriTemplate: L(),
	description: j$(L()),
	mimeType: j$(L()),
	annotations: Y8.optional(),
	_meta: j$(r$({}))
}), $W = oX.extend({ method: g("resources/list") }), m_ = tX.extend({ resources: $$(JF) }), XW = oX.extend({ method: g("resources/templates/list") }), l_ = tX.extend({ resourceTemplates: $$(u_) }), HU = M6.extend({ uri: L() }), c_ = HU, JW = c$.extend({
	method: g("resources/read"),
	params: c_
}), d_ = d$.extend({ contents: $$(V$([$F, XF])) }), p_ = v6.extend({
	method: g("notifications/resources/list_changed"),
	params: S6.optional()
}), i_ = HU, n_ = c$.extend({
	method: g("resources/subscribe"),
	params: i_
}), r_ = HU, o_ = c$.extend({
	method: g("resources/unsubscribe"),
	params: r_
}), t_ = S6.extend({ uri: L() }), a_ = v6.extend({
	method: g("notifications/resources/updated"),
	params: t_
}), s_ = x({
	name: L(),
	description: j$(L()),
	required: j$(_$())
}), e_ = x({
	...Q8.shape,
	...rX.shape,
	description: j$(L()),
	arguments: j$($$(s_)),
	_meta: j$(r$({}))
}), QW = oX.extend({ method: g("prompts/list") }), $x = tX.extend({ prompts: $$(e_) }), Xx = M6.extend({
	name: L(),
	arguments: N$(L(), L()).optional()
}), WW = c$.extend({
	method: g("prompts/get"),
	params: Xx
}), UU = x({
	type: g("text"),
	text: L(),
	annotations: Y8.optional(),
	_meta: N$(L(), L$()).optional()
}), KU = x({
	type: g("image"),
	data: GU,
	mimeType: L(),
	annotations: Y8.optional(),
	_meta: N$(L(), L$()).optional()
}), VU = x({
	type: g("audio"),
	data: GU,
	mimeType: L(),
	annotations: Y8.optional(),
	_meta: N$(L(), L$()).optional()
}), Jx = x({
	type: g("tool_use"),
	name: L(),
	id: L(),
	input: N$(L(), L$()),
	_meta: N$(L(), L$()).optional()
}), Qx = x({
	type: g("resource"),
	resource: V$([$F, XF]),
	annotations: Y8.optional(),
	_meta: N$(L(), L$()).optional()
}), NU = V$([
	UU,
	KU,
	VU,
	JF.extend({ type: g("resource_link") }),
	Qx
]), Yx = x({
	role: eX,
	content: NU
}), zx = d$.extend({
	description: L().optional(),
	messages: $$(Yx)
}), Gx = v6.extend({
	method: g("notifications/prompts/list_changed"),
	params: S6.optional()
}), Hx = x({
	title: L().optional(),
	readOnlyHint: _$().optional(),
	destructiveHint: _$().optional(),
	idempotentHint: _$().optional(),
	openWorldHint: _$().optional()
}), Ux = x({ taskSupport: a$([
	"required",
	"optional",
	"forbidden"
]).optional() }), QF = x({
	...Q8.shape,
	...rX.shape,
	description: L().optional(),
	inputSchema: x({
		type: g("object"),
		properties: N$(L(), g$).optional(),
		required: $$(L()).optional()
	}).catchall(L$()),
	outputSchema: x({
		type: g("object"),
		properties: N$(L(), g$).optional(),
		required: $$(L()).optional()
	}).catchall(L$()).optional(),
	annotations: Hx.optional(),
	execution: Ux.optional(),
	_meta: N$(L(), L$()).optional()
}), YW = oX.extend({ method: g("tools/list") }), Kx = tX.extend({ tools: $$(QF) }), zW = d$.extend({
	content: $$(NU).default([]),
	structuredContent: N$(L(), L$()).optional(),
	isError: _$().optional()
});
zW.or(d$.extend({ toolResult: L$() }));
var Vx = iX.extend({
	name: L(),
	arguments: N$(L(), L$()).optional()
}), z8 = c$.extend({
	method: g("tools/call"),
	params: Vx
}), Nx = v6.extend({
	method: g("notifications/tools/list_changed"),
	params: S6.optional()
});
x({
	autoRefresh: _$().default(!0),
	debounceMs: z$().int().nonnegative().default(300)
});
var $J = a$([
	"debug",
	"info",
	"notice",
	"warning",
	"error",
	"critical",
	"alert",
	"emergency"
]), Ox = M6.extend({ level: $J }), OU = c$.extend({
	method: g("logging/setLevel"),
	params: Ox
}), wx = S6.extend({
	level: $J,
	logger: L().optional(),
	data: L$()
}), Bx = v6.extend({
	method: g("notifications/message"),
	params: wx
}), Dx = x({
	hints: $$(x({ name: L().optional() })).optional(),
	costPriority: z$().min(0).max(1).optional(),
	speedPriority: z$().min(0).max(1).optional(),
	intelligencePriority: z$().min(0).max(1).optional()
}), Fx = x({ mode: a$([
	"auto",
	"required",
	"none"
]).optional() }), jx = x({
	type: g("tool_result"),
	toolUseId: L().describe("The unique identifier for the corresponding tool call."),
	content: $$(NU).default([]),
	structuredContent: x({}).loose().optional(),
	isError: _$().optional(),
	_meta: N$(L(), L$()).optional()
}), Lx = g5("type", [
	UU,
	KU,
	VU
]), m5 = g5("type", [
	UU,
	KU,
	VU,
	Jx,
	jx
]), Mx = x({
	role: eX,
	content: V$([m5, $$(m5)]),
	_meta: N$(L(), L$()).optional()
}), Ax = iX.extend({
	messages: $$(Mx),
	modelPreferences: Dx.optional(),
	systemPrompt: L().optional(),
	includeContext: a$([
		"none",
		"thisServer",
		"allServers"
	]).optional(),
	temperature: z$().optional(),
	maxTokens: z$().int(),
	stopSequences: $$(L()).optional(),
	metadata: g$.optional(),
	tools: $$(QF).optional(),
	toolChoice: Fx.optional()
}), Ix = c$.extend({
	method: g("sampling/createMessage"),
	params: Ax
}), XJ = d$.extend({
	model: L(),
	stopReason: j$(a$([
		"endTurn",
		"stopSequence",
		"maxTokens"
	]).or(L())),
	role: eX,
	content: Lx
}), wU = d$.extend({
	model: L(),
	stopReason: j$(a$([
		"endTurn",
		"stopSequence",
		"maxTokens",
		"toolUse"
	]).or(L())),
	role: eX,
	content: V$([m5, $$(m5)])
}), Zx = x({
	type: g("boolean"),
	title: L().optional(),
	description: L().optional(),
	default: _$().optional()
}), bx = x({
	type: g("string"),
	title: L().optional(),
	description: L().optional(),
	minLength: z$().optional(),
	maxLength: z$().optional(),
	format: a$([
		"email",
		"uri",
		"date",
		"date-time"
	]).optional(),
	default: L().optional()
}), Rx = x({
	type: a$(["number", "integer"]),
	title: L().optional(),
	description: L().optional(),
	minimum: z$().optional(),
	maximum: z$().optional(),
	default: z$().optional()
}), Px = x({
	type: g("string"),
	title: L().optional(),
	description: L().optional(),
	enum: $$(L()),
	default: L().optional()
}), Ex = x({
	type: g("string"),
	title: L().optional(),
	description: L().optional(),
	oneOf: $$(x({
		const: L(),
		title: L()
	})),
	default: L().optional()
}), Tx = V$([
	V$([
		x({
			type: g("string"),
			title: L().optional(),
			description: L().optional(),
			enum: $$(L()),
			enumNames: $$(L()).optional(),
			default: L().optional()
		}),
		V$([Px, Ex]),
		V$([x({
			type: g("array"),
			title: L().optional(),
			description: L().optional(),
			minItems: z$().optional(),
			maxItems: z$().optional(),
			items: x({
				type: g("string"),
				enum: $$(L())
			}),
			default: $$(L()).optional()
		}), x({
			type: g("array"),
			title: L().optional(),
			description: L().optional(),
			minItems: z$().optional(),
			maxItems: z$().optional(),
			items: x({ anyOf: $$(x({
				const: L(),
				title: L()
			})) }),
			default: $$(L()).optional()
		})])
	]),
	Zx,
	bx,
	Rx
]), gx = V$([iX.extend({
	mode: g("form").optional(),
	message: L(),
	requestedSchema: x({
		type: g("object"),
		properties: N$(L(), Tx),
		required: $$(L()).optional()
	})
}), iX.extend({
	mode: g("url"),
	message: L(),
	elicitationId: L(),
	url: L().url()
})]), hx = c$.extend({
	method: g("elicitation/create"),
	params: gx
}), ux = S6.extend({ elicitationId: L() }), mx = v6.extend({
	method: g("notifications/elicitation/complete"),
	params: ux
}), G8 = d$.extend({
	action: a$([
		"accept",
		"decline",
		"cancel"
	]),
	content: u5(($) => $ === null ? void 0 : $, N$(L(), V$([
		L(),
		z$(),
		_$(),
		$$(L())
	])).optional())
}), lx = x({
	type: g("ref/resource"),
	uri: L()
});
var cx = x({
	type: g("ref/prompt"),
	name: L()
}), dx = M6.extend({
	ref: V$([cx, lx]),
	argument: x({
		name: L(),
		value: L()
	}),
	context: x({ arguments: N$(L(), L()).optional() }).optional()
}), GW = c$.extend({
	method: g("completion/complete"),
	params: dx
});
var px = d$.extend({ completion: r$({
	values: $$(L()).max(100),
	total: j$(z$().int()),
	hasMore: j$(_$())
}) }), ix = x({
	uri: L().startsWith("file://"),
	name: L().optional(),
	_meta: N$(L(), L$()).optional()
}), nx = c$.extend({
	method: g("roots/list"),
	params: M6.optional()
}), BU = d$.extend({ roots: $$(ix) }), rx = v6.extend({
	method: g("notifications/roots/list_changed"),
	params: S6.optional()
});
V$([
	i5,
	YU,
	GW,
	OU,
	WW,
	QW,
	$W,
	XW,
	JW,
	n_,
	o_,
	z8,
	YW,
	r5,
	t5,
	a5,
	e5
]);
V$([
	p5,
	n5,
	zU,
	rx,
	sX
]);
V$([
	d5,
	XJ,
	wU,
	G8,
	BU,
	o5,
	s5,
	W8
]);
V$([
	i5,
	Ix,
	hx,
	nx,
	r5,
	t5,
	a5,
	e5
]);
V$([
	p5,
	n5,
	Bx,
	a_,
	p_,
	Nx,
	Gx,
	sX,
	mx
]);
V$([
	d5,
	x_,
	px,
	zx,
	$x,
	m_,
	l_,
	d_,
	zW,
	Kx,
	o5,
	s5,
	W8
]);
SJ(DK(), 1);
SJ(AA(), 1);
var PA;
(function($) {
	$.Completable = "McpCompletable";
})(PA || (PA = {}));
function xA($) {
	let X;
	return () => X ??= $();
}
xA(() => W1.object({
	session_id: W1.string(),
	ws_url: W1.string(),
	work_dir: W1.string().optional(),
	session_key: W1.string().optional()
}));
async function fc($, X) {
	try {
		await copyFile($, X);
	} catch (J) {
		if (!d4(J)) throw J;
	}
}
async function yc($, X) {
	if (!$) return;
	let J = $;
	try {
		let W = l$($);
		if (W?.claudeAiOauth?.refreshToken) delete W.claudeAiOauth.refreshToken, J = w$(W);
	} catch {}
	await writeFile(X, J, { mode: 384 });
}
function gc() {
	if (process.platform !== "darwin") return Promise.resolve(void 0);
	let $ = bq(Zq);
	return new Promise((X) => {
		execFile("security", [
			"find-generic-password",
			"-a",
			Rq(),
			"-w",
			"-s",
			$
		], {
			encoding: "utf-8",
			timeout: 5e3
		}, (J, W) => X(J ? void 0 : W.trim() || void 0));
	});
}
async function nA($, X, J, W, Q = 6e4) {
	if (!U$(X)) return;
	let Y = _6(J), z = await G4($.load({
		projectKey: Y,
		sessionId: X
	}), Q, `SessionStore.load() timed out after ${Q}ms for session ${X}`);
	if (!z || z.length === 0) return;
	let G = join(tmpdir(), `claude-resume-${randomUUID()}`);
	try {
		let H = join(G, "projects", Y);
		await mkdir(H, { recursive: !0 });
		await E9(join(H, `${X}.jsonl`), z);
		let K = W?.CLAUDE_CONFIG_DIR ?? process.env.CLAUDE_CONFIG_DIR, V = K ?? join(homedir(), ".claude"), N;
		try {
			N = await readFile(join(V, ".credentials.json"), "utf-8");
		} catch (O) {
			if (!d4(O)) throw O;
		}
		if (!K && !(W ?? process.env).ANTHROPIC_API_KEY && !(W ?? process.env).CLAUDE_CODE_OAUTH_TOKEN) N = await gc() ?? N;
		if (await yc(N, join(G, ".credentials.json")), await fc(join(K ?? homedir(), ".claude.json"), join(G, ".claude.json")), $.listSubkeys) {
			let O = join(H, X), w = await G4($.listSubkeys({
				projectKey: Y,
				sessionId: X
			}), Q, `SessionStore.listSubkeys() timed out after ${Q}ms for session ${X}`);
			for (let B of w) {
				let F = resolve(O, B + ".jsonl");
				if (!B || isAbsolute(B) || B.split(/[\\/]/).includes("..") || !F.startsWith(O + sep)) {
					S$(`[SessionStore] skipping unsafe subpath from listSubkeys: ${B}`, { level: "warn" });
					continue;
				}
				let j = await G4($.load({
					projectKey: Y,
					sessionId: X,
					subpath: B
				}), Q, `SessionStore.load() timed out after ${Q}ms for session ${X} subpath ${B}`);
				if (!j || j.length === 0) continue;
				let I = [], Z = [];
				for (let _ of j) if (tA(_)) I.push(_);
				else Z.push(_);
				if (Z.length > 0) await mkdir(dirname(F), { recursive: !0 }), await E9(F, Z);
				if (I.length > 0) {
					let _ = I.at(-1), T = resolve(O, B + ".meta.json");
					await mkdir(dirname(T), { recursive: !0 });
					let { type: O$, ...x$ } = _;
					await writeFile(T, w$(x$), { mode: 384 });
				}
			}
		}
		return G;
	} catch (H) {
		throw await rW(G), H;
	}
}
function yK($, X, J, W) {
	let { systemPrompt: Q, settings: Y, managedSettings: z, settingSources: G, sandbox: H, ...U } = $ ?? {}, K, V, N;
	if (Q === void 0) K = "";
	else if (typeof Q === "string") K = Q;
	else if (Array.isArray(Q)) K = Q;
	else if (Q.type === "preset") V = Q.append, N = Q.excludeDynamicSections;
	let O = U.pathToClaudeCodeExecutable;
	if (!O) {
		let I6 = createRequire(fileURLToPath(import.meta.url)), q1 = N7((W0) => I6.resolve(W0));
		if (q1) O = q1;
		else try {
			O = I6.resolve("./cli.js");
		} catch {
			throw Error(`Native CLI binary for ${process.platform}-${process.arch} not found. Reinstall @anthropic-ai/claude-agent-sdk without --omit=optional, or set options.pathToClaudeCodeExecutable.`);
		}
	}
	process.env.CLAUDE_AGENT_SDK_VERSION = "0.2.128";
	let { abortController: w = Y0(), additionalDirectories: B = [], agent: F, agents: j, allowedTools: I = [], betas: Z, canUseTool: _, continue: T, cwd: O$, debug: x$, debugFile: O6, disallowedTools: Y4 = [], tools: z4, env: a6, executable: X0 = z0() ? "bun" : "node", executableArgs: k4 = [], extraArgs: J0 = {}, fallbackModel: B1, enableFileCheckpointing: l, toolConfig: L8, forkSession: tW, hooks: Q0, includeHookEvents: M8, includePartialMessages: A8, forwardSubagentText: EJ, onElicitation: k$, persistSession: x6, sessionStore: u$, sessionStoreFlush: eA, thinking: I8, effort: $I, maxThinkingTokens: aW, maxTurns: XI, maxBudgetUsd: JI, taskBudget: QI, mcpServers: mK, model: WI, outputFormat: lK, permissionMode: YI = "default", allowDangerouslySkipPermissions: zI = !1, permissionPromptToolName: GI, plugins: HI, getOAuthToken: cK, workload: dK, resume: pK, resumeSessionAt: UI, sessionId: KI, skills: iK, stderr: VI, strictMcpConfig: NI } = U;
	if (u$ && x6 === !1) throw Error("sessionStore cannot be used with persistSession: false -- the storage adapter requires local writes to mirror from. Use CLAUDE_CONFIG_DIR=/tmp for ephemeral local writes with external mirroring.");
	if (u$ && T && !pK && !u$.listSessions) throw Error("Options.continue with sessionStore requires store.listSessions to be implemented");
	if (u$ && l) throw Error("enableFileCheckpointing is not yet supported with sessionStore (backup blobs are not mirrored, so rewindFiles() fails after a store-backed resume).");
	if (u$ && U.spawnClaudeCodeProcess) S$("sessionStore with custom spawnClaudeCodeProcess: ensure the subprocess CLAUDE_CONFIG_DIR matches the parent (same path, same separators) or transcript_mirror frames will be dropped.", { level: "warn" });
	let nK = lK?.type === "json_schema" ? lK.schema : void 0, T6 = a6 ? { ...a6 } : { ...process.env };
	if (!T6.CLAUDE_CODE_ENTRYPOINT) T6.CLAUDE_CODE_ENTRYPOINT = "sdk-ts";
	if (l) T6.CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING = "true";
	if (cK) T6.CLAUDE_CODE_SDK_HAS_OAUTH_REFRESH = "1";
	if (L8?.askUserQuestion?.previewFormat) T6.CLAUDE_CODE_QUESTION_PREVIEW_FORMAT = L8.askUserQuestion.previewFormat;
	let sW = {};
	if (oW.propagation.inject(oW.context.active(), sW), "traceparent" in sW) {
		for (let w6 of ["TRACEPARENT", "TRACESTATE"]) if (!(w6 in (a6 ?? {}))) delete T6[w6];
	}
	for (let [w6, I6] of Object.entries(sW)) {
		let q1 = w6.toUpperCase();
		if (!(q1 in (a6 ?? {}))) T6[q1] = I6;
	}
	let rK = {}, oK = /* @__PURE__ */ new Map();
	if (mK) for (let [w6, I6] of Object.entries(mK)) if (I6.type === "sdk" && I6.instance) oK.set(w6, I6.instance);
	else rK[w6] = I6;
	let Z8;
	if (I8) switch (I8.type) {
		case "adaptive":
			Z8 = {
				type: "adaptive",
				display: I8.display
			};
			break;
		case "enabled":
			Z8 = {
				type: "enabled",
				budgetTokens: I8.budgetTokens,
				display: I8.display
			};
			break;
		case "disabled":
			Z8 = { type: "disabled" };
			break;
	}
	else if (aW !== void 0) Z8 = aW === 0 ? { type: "disabled" } : {
		type: "enabled",
		budgetTokens: aW
	};
	if (J) T6.CLAUDE_CONFIG_DIR = J;
	let tK = new F9({
		abortController: w,
		additionalDirectories: B,
		agent: F,
		betas: Z,
		cwd: O$,
		debug: x$,
		debugFile: O6,
		executable: X0,
		executableArgs: k4,
		extraArgs: dK ? {
			...J0,
			workload: dK
		} : J0,
		pathToClaudeCodeExecutable: O,
		env: T6,
		forkSession: tW,
		stderr: VI,
		thinkingConfig: Z8,
		effort: $I,
		maxTurns: XI,
		maxBudgetUsd: JI,
		taskBudget: QI,
		model: WI,
		fallbackModel: B1,
		jsonSchema: nK,
		permissionMode: YI,
		allowDangerouslySkipPermissions: zI,
		permissionPromptToolName: GI,
		continueConversation: u$ ? void 0 : T,
		resume: pK,
		resumeSessionAt: UI,
		sessionId: KI,
		settings: typeof Y === "object" ? w$(Y) : Y,
		managedSettings: z ? w$(z) : void 0,
		settingSources: G,
		skills: iK,
		allowedTools: I,
		disallowedTools: Y4,
		tools: z4,
		mcpServers: rK,
		strictMcpConfig: NI,
		canUseTool: !!_,
		hooks: !!Q0,
		includeHookEvents: M8,
		includePartialMessages: A8,
		persistSession: x6,
		sessionMirror: !!u$,
		plugins: HI,
		sandbox: H,
		spawnClaudeCodeProcess: U.spawnClaudeCodeProcess,
		deferSpawn: W
	}), eW = new j9(tK, X, _, Q0, w, oK, nK, {
		systemPrompt: K,
		appendSystemPrompt: V,
		planModeInstructions: U.planModeInstructions,
		appendSubagentSystemPrompt: U.appendSubagentSystemPrompt,
		excludeDynamicSections: N,
		agents: j,
		title: U.title,
		skills: iK,
		webSearchIsolationExemptMcpServers: U.webSearchIsolationExemptMcpServers,
		promptSuggestions: U.promptSuggestions,
		agentProgressSummaries: U.agentProgressSummaries,
		forwardSubagentText: EJ
	}, k$, cK);
	if (u$) {
		let w6 = () => join(T6.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude"), "projects"), I6 = eA === "eager", q1 = new nY(async (W0, $Y) => {
			let b8 = lA(W0, w6());
			if (b8) await u$.append(b8, $Y);
			else S$(`[SessionStore] dropping mirror frame: filePath ${W0} is not under ${w6()} -- subprocess CLAUDE_CONFIG_DIR likely differs from parent (custom spawnClaudeCodeProcess / container?)`, { level: "warn" });
		}, void 0, (W0, $Y) => {
			let b8 = lA(W0, w6());
			if (b8) eW.reportMirrorError(b8, $Y.message);
		}, I6 ? 0 : O7, I6 ? 0 : w7);
		eW.setTranscriptMirrorBatcher(q1);
	}
	return {
		queryInstance: eW,
		transport: tK,
		abortController: w,
		processEnv: T6
	};
}
function gK($, X, J, W) {
	if (typeof J === "string") X.write(w$({
		type: "user",
		session_id: "",
		message: {
			role: "user",
			content: [{
				type: "text",
				text: J
			}]
		},
		parent_tool_use_id: null
	}) + `
`);
	else $.streamInput(J).catch((Q) => W.abort(Q));
}
var hc = new Set([
	"EBUSY",
	"EMFILE",
	"ENFILE",
	"ENOTEMPTY",
	"EPERM"
]);
async function rW($) {
	for (let X = 0;; X++) try {
		return await rm($, {
			recursive: !0,
			force: !0
		});
	} catch (J) {
		if (X >= 4 || !hc.has(g6(J) ?? "")) return;
		await vJ((X + 1) * 100);
	}
}
function uc($, X) {
	$.waitForExit().catch(() => {}).finally(() => rW(X));
}
function t7$({ prompt: $, options: X }) {
	if ((X?.resume || X?.continue) && X?.sessionStore) {
		let { queryInstance: Y, transport: z, abortController: G, processEnv: H } = yK({ ...X }, typeof $ === "string", void 0, !0), U = resolve(X.cwd ?? "."), K = X.sessionStore, V = X.loadTimeoutMs ?? 6e4, N = X.resume;
		return (async () => {
			if (!N) N = (await G4(K.listSessions(_6(U)), V, `SessionStore.listSessions() timed out after ${V}ms`)).slice().sort((B, F) => F.mtime - B.mtime)[0]?.sessionId;
			if (!N) return;
			return nA(K, N, U, X.env, X.loadTimeoutMs);
		})().then((w) => {
			if (w) z.updateResume(N), z.updateEnv({ CLAUDE_CONFIG_DIR: w }), H.CLAUDE_CONFIG_DIR = w, Y.addCleanupCallback(() => uc(z, w));
			if (!Y.isClosed()) z.spawn();
		}).catch((w) => {
			let B = c4(w);
			z.spawnAbort(B), Y.setError(B);
		}), gK(Y, z, $, G), Y;
	}
	let { queryInstance: J, transport: W, abortController: Q } = yK(X, typeof $ === "string");
	return gK(J, W, $, Q), J;
}
function rA($) {
	let X = resolve($ ?? "."), J;
	try {
		J = realpathSync(X);
	} catch {
		J = X;
	}
	return J.normalize("NFC");
}
function _6($) {
	return T1(rA($));
}
function tA($) {
	return typeof $ === "object" && $ !== null && "type" in $ && $.type === "agent_metadata";
}
function lA($, X) {
	let J = relative(X, $), W = J.split(sep);
	if (W[0] === ".." || isAbsolute(J)) return null;
	if (W.length < 2) return null;
	let Q = W[0], Y = W[1];
	if (W.length === 2 && Y.endsWith(".jsonl")) return {
		projectKey: Q,
		sessionId: Y.replace(/\.jsonl$/, "")
	};
	if (W.length >= 4) {
		let z = W.slice(2), G = z.length - 1;
		return z[G] = z.at(-1).replace(/\.jsonl$/, ""), {
			projectKey: Q,
			sessionId: Y,
			subpath: z.join("/")
		};
	}
	return null;
}
//#endregion
//#region src/which.ts
/**
* Tiny `which`-equivalent — scans `env.PATH` directories for an
* executable. POSIX-first; Windows fallback walks PATHEXT.
*
* Avoids a dependency on `node-which` or similar. The implementation
* is sync (called once at boot) and uses only `node:fs` and `node:path`.
*
* Contents:
* - `whichSync(name, env)` — returns the absolute path or `null`.
* - `isExecutableSync(file)` — returns whether the file exists and is executable.
*/
/**
* Scan `env.PATH` for `name` and return the absolute path, or `null`
* if not found. Handles absolute paths directly and Windows PATHEXT.
*/
function whichSync(name, env) {
	if (isAbsolute$1(name)) return isExecutableSync(name) ? name : null;
	const path = env.PATH ?? "";
	if (path.length === 0) return null;
	const pathExt = process.platform === "win32" ? (env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";") : [""];
	for (const dir of path.split(delimiter)) {
		if (dir.length === 0) continue;
		for (const ext of pathExt) {
			const candidate = join$1(dir, `${name}${ext}`);
			if (isExecutableSync(candidate)) return candidate;
		}
	}
	return null;
}
/**
* Check whether `file` exists and is executable by the current process.
* Sync, swallows access errors and returns `false` for any failure.
*/
function isExecutableSync(file) {
	try {
		accessSync(file, constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
//#endregion
//#region src/bin-resolver.ts
/**
* Resolves the user's local `claude` binary. Resolution order:
* 1. Explicit input (`path_to_claude_code_executable`).
* 2. Env override (`AIACTIONS_CLAUDE_BIN`).
* 3. PATH lookup via `whichSync("claude", env)`.
*
* Throws a friendly error pointing the user at the install + login
* commands when none of the above succeed.
*
* Contents:
* - `resolveClaudeBinary(inputOverride, env)` — returns the path or throws.
*/
const INSTALL_HINT = "`claude` binary not found. Install Claude Code (https://docs.anthropic.com/en/docs/claude-code/setup) and run `claude login`. Alternatively, set the input `path_to_claude_code_executable` or env var `AIACTIONS_CLAUDE_BIN`.";
/**
* Resolve the `claude` binary path.
*
* Resolution order:
* 1. Explicit input override (`path_to_claude_code_executable`).
* 2. Env override (`AIACTIONS_CLAUDE_BIN`).
* 3. PATH lookup via `whichSync("claude", env)`.
*
* Explicit overrides (1 and 2) are validated against `isExecutableSync`
* — fail-fast with a precise error identifying which source supplied
* the path so a typo surfaces immediately rather than as a confusing
* spawn error later.
*
* @param inputOverride - Value of the `path_to_claude_code_executable` action input (may be empty string).
* @param env - Process environment (used for `AIACTIONS_CLAUDE_BIN` and `PATH`).
* @returns Absolute (or explicit) path to the `claude` binary.
* @throws {Error} When the binary cannot be located, or when an explicit override path is not executable.
*/
function resolveClaudeBinary(inputOverride, env) {
	const fromInput = inputOverride && inputOverride.length > 0 ? inputOverride : void 0;
	const fromEnv = !fromInput && env.AIACTIONS_CLAUDE_BIN && env.AIACTIONS_CLAUDE_BIN.length > 0 ? env.AIACTIONS_CLAUDE_BIN : void 0;
	const explicit = fromInput ?? fromEnv;
	if (explicit !== void 0) {
		if (!isExecutableSync(explicit)) throw new Error(`\`claude\` binary not accessible at '${explicit}'. Check that the path exists and is executable. (Source: ${fromInput ? `"path_to_claude_code_executable" input` : `"AIACTIONS_CLAUDE_BIN" env`})`);
		return explicit;
	}
	const onPath = whichSync("claude", env);
	if (onPath) return onPath;
	throw new Error(INSTALL_HINT);
}
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/core.js
var _a$1;
/** A special constant with type `never` */
const NEVER = /* @__PURE__ */ Object.freeze({ status: "aborted" });
function $constructor(name, initializer, params) {
	function init(inst, def) {
		if (!inst._zod) Object.defineProperty(inst, "_zod", {
			value: {
				def,
				constr: _,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: false
		});
		if (inst._zod.traits.has(name)) return;
		inst._zod.traits.add(name);
		initializer(inst, def);
		const proto = _.prototype;
		const keys = Object.keys(proto);
		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (!(k in inst)) inst[k] = proto[k].bind(inst);
		}
	}
	const Parent = params?.Parent ?? Object;
	class Definition extends Parent {}
	Object.defineProperty(Definition, "name", { value: name });
	function _(def) {
		var _a;
		const inst = params?.Parent ? new Definition() : this;
		init(inst, def);
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		for (const fn of inst._zod.deferred) fn();
		return inst;
	}
	Object.defineProperty(_, "init", { value: init });
	Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
		if (params?.Parent && inst instanceof params.Parent) return true;
		return inst?._zod?.traits?.has(name);
	} });
	Object.defineProperty(_, "name", { value: name });
	return _;
}
var $ZodAsyncError = class extends Error {
	constructor() {
		super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
	}
};
var $ZodEncodeError = class extends Error {
	constructor(name) {
		super(`Encountered unidirectional transform during encode: ${name}`);
		this.name = "ZodEncodeError";
	}
};
(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
const globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
	if (newConfig) Object.assign(globalConfig, newConfig);
	return globalConfig;
}
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
	const numericValues = Object.values(entries).filter((v) => typeof v === "number");
	return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
}
function jsonStringifyReplacer(_, value) {
	if (typeof value === "bigint") return value.toString();
	return value;
}
function cached(getter) {
	return { get value() {
		{
			const value = getter();
			Object.defineProperty(this, "value", { value });
			return value;
		}
		throw new Error("cached value already set");
	} };
}
function nullish(input) {
	return input === null || input === void 0;
}
function cleanRegex(source) {
	const start = source.startsWith("^") ? 1 : 0;
	const end = source.endsWith("$") ? source.length - 1 : source.length;
	return source.slice(start, end);
}
const EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
	let value = void 0;
	Object.defineProperty(object, key, {
		get() {
			if (value === EVALUATING) return;
			if (value === void 0) {
				value = EVALUATING;
				value = getter();
			}
			return value;
		},
		set(v) {
			Object.defineProperty(object, key, { value: v });
		},
		configurable: true
	});
}
function assignProp(target, prop, value) {
	Object.defineProperty(target, prop, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
function mergeDefs(...defs) {
	const mergedDescriptors = {};
	for (const def of defs) Object.assign(mergedDescriptors, Object.getOwnPropertyDescriptors(def));
	return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
	return JSON.stringify(str);
}
function slugify(input) {
	return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
	return typeof data === "object" && data !== null && !Array.isArray(data);
}
const allowsEval = /* @__PURE__ */ cached(() => {
	if (globalConfig.jitless) return false;
	if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
	try {
		new Function("");
		return true;
	} catch (_) {
		return false;
	}
});
function isPlainObject(o) {
	if (isObject(o) === false) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	if (typeof ctor !== "function") return true;
	const prot = ctor.prototype;
	if (isObject(prot) === false) return false;
	if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
	return true;
}
function shallowClone(o) {
	if (isPlainObject(o)) return { ...o };
	if (Array.isArray(o)) return [...o];
	if (o instanceof Map) return new Map(o);
	if (o instanceof Set) return new Set(o);
	return o;
}
const propertyKeyTypes = /* @__PURE__ */ new Set([
	"string",
	"number",
	"symbol"
]);
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
	const cl = new inst._zod.constr(def ?? inst._zod.def);
	if (!def || params?.parent) cl._zod.parent = inst;
	return cl;
}
function normalizeParams(_params) {
	const params = _params;
	if (!params) return {};
	if (typeof params === "string") return { error: () => params };
	if (params?.message !== void 0) {
		if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
		params.error = params.message;
	}
	delete params.message;
	if (typeof params.error === "string") return {
		...params,
		error: () => params.error
	};
	return params;
}
function optionalKeys(shape) {
	return Object.keys(shape).filter((k) => {
		return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
	});
}
Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -Number.MAX_VALUE, Number.MAX_VALUE;
function pick(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const newShape = {};
			for (const key in mask) {
				if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				newShape[key] = currDef.shape[key];
			}
			assignProp(this, "shape", newShape);
			return newShape;
		},
		checks: []
	}));
}
function omit(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const newShape = { ...schema._zod.def.shape };
			for (const key in mask) {
				if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				delete newShape[key];
			}
			assignProp(this, "shape", newShape);
			return newShape;
		},
		checks: []
	}));
}
function extend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) {
		const existingShape = schema._zod.def.shape;
		for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const _shape = {
			...schema._zod.def.shape,
			...shape
		};
		assignProp(this, "shape", _shape);
		return _shape;
	} }));
}
function safeExtend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const _shape = {
			...schema._zod.def.shape,
			...shape
		};
		assignProp(this, "shape", _shape);
		return _shape;
	} }));
}
function merge(a, b) {
	if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	return clone(a, mergeDefs(a._zod.def, {
		get shape() {
			const _shape = {
				...a._zod.def.shape,
				...b._zod.def.shape
			};
			assignProp(this, "shape", _shape);
			return _shape;
		},
		get catchall() {
			return b._zod.def.catchall;
		},
		checks: b._zod.def.checks ?? []
	}));
}
function partial(Class, schema, mask) {
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const oldShape = schema._zod.def.shape;
			const shape = { ...oldShape };
			if (mask) for (const key in mask) {
				if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				shape[key] = Class ? new Class({
					type: "optional",
					innerType: oldShape[key]
				}) : oldShape[key];
			}
			else for (const key in oldShape) shape[key] = Class ? new Class({
				type: "optional",
				innerType: oldShape[key]
			}) : oldShape[key];
			assignProp(this, "shape", shape);
			return shape;
		},
		checks: []
	}));
}
function required(Class, schema, mask) {
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const oldShape = schema._zod.def.shape;
		const shape = { ...oldShape };
		if (mask) for (const key in mask) {
			if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
			if (!mask[key]) continue;
			shape[key] = new Class({
				type: "nonoptional",
				innerType: oldShape[key]
			});
		}
		else for (const key in oldShape) shape[key] = new Class({
			type: "nonoptional",
			innerType: oldShape[key]
		});
		assignProp(this, "shape", shape);
		return shape;
	} }));
}
function aborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
	return false;
}
function explicitlyAborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
	return false;
}
function prefixIssues(path, issues) {
	return issues.map((iss) => {
		var _a;
		(_a = iss).path ?? (_a.path = []);
		iss.path.unshift(path);
		return iss;
	});
}
function unwrapMessage(message) {
	return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
	const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
	const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
	rest.path ?? (rest.path = []);
	rest.message = message;
	if (ctx?.reportInput) rest.input = _input;
	return rest;
}
function getLengthableOrigin(input) {
	if (Array.isArray(input)) return "array";
	if (typeof input === "string") return "string";
	return "unknown";
}
function issue(...args) {
	const [iss, input, inst] = args;
	if (typeof iss === "string") return {
		message: iss,
		code: "custom",
		input,
		inst
	};
	return { ...iss };
}
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/errors.js
const initializer$1 = (inst, def) => {
	inst.name = "$ZodError";
	Object.defineProperty(inst, "_zod", {
		value: inst._zod,
		enumerable: false
	});
	Object.defineProperty(inst, "issues", {
		value: def,
		enumerable: false
	});
	inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
	Object.defineProperty(inst, "toString", {
		value: () => inst.message,
		enumerable: false
	});
};
const $ZodError = $constructor("$ZodError", initializer$1);
const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
	const fieldErrors = {};
	const formErrors = [];
	for (const sub of error.issues) if (sub.path.length > 0) {
		fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
		fieldErrors[sub.path[0]].push(mapper(sub));
	} else formErrors.push(mapper(sub));
	return {
		formErrors,
		fieldErrors
	};
}
function formatError(error, mapper = (issue) => issue.message) {
	const fieldErrors = { _errors: [] };
	const processError = (error, path = []) => {
		for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
		else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else {
			const fullpath = [...path, ...issue.path];
			if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
			else {
				let curr = fieldErrors;
				let i = 0;
				while (i < fullpath.length) {
					const el = fullpath[i];
					if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
					else {
						curr[el] = curr[el] || { _errors: [] };
						curr[el]._errors.push(mapper(issue));
					}
					curr = curr[el];
					i++;
				}
			}
		}
	};
	processError(error);
	return fieldErrors;
}
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/parse.js
const _parse = (_Err) => (schema, value, _ctx, _params) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	if (result.issues.length) {
		const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
		captureStackTrace(e, _params?.callee);
		throw e;
	}
	return result.value;
};
const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true
	} : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	if (result.issues.length) {
		const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
		captureStackTrace(e, params?.callee);
		throw e;
	}
	return result.value;
};
const _safeParse = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length ? {
		success: false,
		error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	} : {
		success: true,
		data: result.value
	};
};
const safeParse$1 = /* @__PURE__ */ _safeParse($ZodRealError);
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true
	} : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length ? {
		success: false,
		error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	} : {
		success: true,
		data: result.value
	};
};
const safeParseAsync$1 = /* @__PURE__ */ _safeParseAsync($ZodRealError);
const _encode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _parse(_Err)(schema, value, ctx);
};
const _decode = (_Err) => (schema, value, _ctx) => {
	return _parse(_Err)(schema, value, _ctx);
};
const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _parseAsync(_Err)(schema, value, ctx);
};
const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _parseAsync(_Err)(schema, value, _ctx);
};
const _safeEncode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParse(_Err)(schema, value, ctx);
};
const _safeDecode = (_Err) => (schema, value, _ctx) => {
	return _safeParse(_Err)(schema, value, _ctx);
};
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParseAsync(_Err)(schema, value, ctx);
};
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _safeParseAsync(_Err)(schema, value, _ctx);
};
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/regexes.js
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const cuid = /^[cC][0-9a-z]{6,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
*
* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
	if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
	return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^[A-Za-z0-9_-]*$/;
const httpProtocol = /^https?$/;
const e164 = /^\+[1-9]\d{6,14}$/;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
const date$1 = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
	const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
	return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time$1(args) {
	return new RegExp(`^${timeSource(args)}$`);
}
function datetime$1(args) {
	const time = timeSource({ precision: args.precision });
	const opts = ["Z"];
	if (args.local) opts.push("");
	if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
	const timeRegex = `${time}(?:${opts.join("|")})`;
	return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
const string$1 = (params) => {
	const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
	return new RegExp(`^${regex}$`);
};
const lowercase = /^[^A-Z]*$/;
const uppercase = /^[^a-z]*$/;
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/checks.js
const $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
	var _a;
	inst._zod ?? (inst._zod = {});
	inst._zod.def = def;
	(_a = inst._zod).onattach ?? (_a.onattach = []);
});
const $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
		if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (input.length <= def.maximum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.maximum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
		if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (input.length >= def.minimum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.minimum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.minimum = def.length;
		bag.maximum = def.length;
		bag.length = def.length;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		const length = input.length;
		if (length === def.length) return;
		const origin = getLengthableOrigin(input);
		const tooBig = length > def.length;
		payload.issues.push({
			origin,
			...tooBig ? {
				code: "too_big",
				maximum: def.length
			} : {
				code: "too_small",
				minimum: def.length
			},
			inclusive: true,
			exact: true,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
	var _a, _b;
	$ZodCheck.init(inst, def);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = def.format;
		if (def.pattern) {
			bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
			bag.patterns.add(def.pattern);
		}
	});
	if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: def.format,
			input: payload.value,
			...def.pattern ? { pattern: def.pattern.toString() } : {},
			inst,
			continue: !def.abort
		});
	});
	else (_b = inst._zod).check ?? (_b.check = () => {});
});
const $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: payload.value,
			pattern: def.pattern.toString(),
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
	def.pattern ?? (def.pattern = lowercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
	def.pattern ?? (def.pattern = uppercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
	$ZodCheck.init(inst, def);
	const escapedRegex = escapeRegex(def.includes);
	const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
	def.pattern = pattern;
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.includes(def.includes, def.position)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: def.includes,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.startsWith(def.prefix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: def.prefix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.endsWith(def.suffix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: def.suffix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		payload.value = def.tx(payload.value);
	};
});
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/doc.js
var Doc = class {
	constructor(args = []) {
		this.content = [];
		this.indent = 0;
		if (this) this.args = args;
	}
	indented(fn) {
		this.indent += 1;
		fn(this);
		this.indent -= 1;
	}
	write(arg) {
		if (typeof arg === "function") {
			arg(this, { execution: "sync" });
			arg(this, { execution: "async" });
			return;
		}
		const lines = arg.split("\n").filter((x) => x);
		const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
		const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
		for (const line of dedented) this.content.push(line);
	}
	compile() {
		const F = Function;
		const args = this?.args;
		const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
		return new F(...args, lines.join("\n"));
	}
};
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/versions.js
const version = {
	major: 4,
	minor: 4,
	patch: 3
};
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/schemas.js
const $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
	var _a;
	inst ?? (inst = {});
	inst._zod.def = def;
	inst._zod.bag = inst._zod.bag || {};
	inst._zod.version = version;
	const checks = [...inst._zod.def.checks ?? []];
	if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
	for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
	if (checks.length === 0) {
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred?.push(() => {
			inst._zod.run = inst._zod.parse;
		});
	} else {
		const runChecks = (payload, checks, ctx) => {
			let isAborted = aborted(payload);
			let asyncResult;
			for (const ch of checks) {
				if (ch._zod.def.when) {
					if (explicitlyAborted(payload)) continue;
					if (!ch._zod.def.when(payload)) continue;
				} else if (isAborted) continue;
				const currLen = payload.issues.length;
				const _ = ch._zod.check(payload);
				if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
				if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
					await _;
					if (payload.issues.length === currLen) return;
					if (!isAborted) isAborted = aborted(payload, currLen);
				});
				else {
					if (payload.issues.length === currLen) continue;
					if (!isAborted) isAborted = aborted(payload, currLen);
				}
			}
			if (asyncResult) return asyncResult.then(() => {
				return payload;
			});
			return payload;
		};
		const handleCanaryResult = (canary, payload, ctx) => {
			if (aborted(canary)) {
				canary.aborted = true;
				return canary;
			}
			const checkResult = runChecks(payload, checks, ctx);
			if (checkResult instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
			}
			return inst._zod.parse(checkResult, ctx);
		};
		inst._zod.run = (payload, ctx) => {
			if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
			if (ctx.direction === "backward") {
				const canary = inst._zod.parse({
					value: payload.value,
					issues: []
				}, {
					...ctx,
					skipChecks: true
				});
				if (canary instanceof Promise) return canary.then((canary) => {
					return handleCanaryResult(canary, payload, ctx);
				});
				return handleCanaryResult(canary, payload, ctx);
			}
			const result = inst._zod.parse(payload, ctx);
			if (result instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return result.then((result) => runChecks(result, checks, ctx));
			}
			return runChecks(result, checks, ctx);
		};
	}
	defineLazy(inst, "~standard", () => ({
		validate: (value) => {
			try {
				const r = safeParse$1(inst, value);
				return r.success ? { value: r.data } : { issues: r.error?.issues };
			} catch (_) {
				return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	}));
});
const $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
	inst._zod.parse = (payload, _) => {
		if (def.coerce) try {
			payload.value = String(payload.value);
		} catch (_) {}
		if (typeof payload.value === "string") return payload;
		payload.issues.push({
			expected: "string",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
const $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	$ZodString.init(inst, def);
});
const $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
	def.pattern ?? (def.pattern = guid);
	$ZodStringFormat.init(inst, def);
});
const $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
	if (def.version) {
		const v = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[def.version];
		if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
		def.pattern ?? (def.pattern = uuid(v));
	} else def.pattern ?? (def.pattern = uuid());
	$ZodStringFormat.init(inst, def);
});
const $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
	def.pattern ?? (def.pattern = email);
	$ZodStringFormat.init(inst, def);
});
const $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		try {
			const trimmed = payload.value.trim();
			if (!def.normalize && def.protocol?.source === httpProtocol.source) {
				if (!/^https?:\/\//i.test(trimmed)) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid URL format",
						input: payload.value,
						inst,
						continue: !def.abort
					});
					return;
				}
			}
			const url = new URL(trimmed);
			if (def.hostname) {
				def.hostname.lastIndex = 0;
				if (!def.hostname.test(url.hostname)) payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid hostname",
					pattern: def.hostname.source,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
			if (def.protocol) {
				def.protocol.lastIndex = 0;
				if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid protocol",
					pattern: def.protocol.source,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
			if (def.normalize) payload.value = url.href;
			else payload.value = trimmed;
			return;
		} catch (_) {
			payload.issues.push({
				code: "invalid_format",
				format: "url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
const $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
	def.pattern ?? (def.pattern = emoji());
	$ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
	def.pattern ?? (def.pattern = nanoid);
	$ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
	def.pattern ?? (def.pattern = cuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
	def.pattern ?? (def.pattern = cuid2);
	$ZodStringFormat.init(inst, def);
});
const $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
	def.pattern ?? (def.pattern = ulid);
	$ZodStringFormat.init(inst, def);
});
const $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
	def.pattern ?? (def.pattern = xid);
	$ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
	def.pattern ?? (def.pattern = ksuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
	def.pattern ?? (def.pattern = datetime$1(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
	def.pattern ?? (def.pattern = date$1);
	$ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
	def.pattern ?? (def.pattern = time$1(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
	def.pattern ?? (def.pattern = duration$1);
	$ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
	def.pattern ?? (def.pattern = ipv4);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.format = `ipv4`;
});
const $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
	def.pattern ?? (def.pattern = ipv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.format = `ipv6`;
	inst._zod.check = (payload) => {
		try {
			new URL(`http://[${payload.value}]`);
		} catch {
			payload.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
const $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv4);
	$ZodStringFormat.init(inst, def);
});
const $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		const parts = payload.value.split("/");
		try {
			if (parts.length !== 2) throw new Error();
			const [address, prefix] = parts;
			if (!prefix) throw new Error();
			const prefixNum = Number(prefix);
			if (`${prefixNum}` !== prefix) throw new Error();
			if (prefixNum < 0 || prefixNum > 128) throw new Error();
			new URL(`http://[${address}]`);
		} catch {
			payload.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
function isValidBase64(data) {
	if (data === "") return true;
	if (/\s/.test(data)) return false;
	if (data.length % 4 !== 0) return false;
	try {
		atob(data);
		return true;
	} catch {
		return false;
	}
}
const $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
	def.pattern ?? (def.pattern = base64);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.contentEncoding = "base64";
	inst._zod.check = (payload) => {
		if (isValidBase64(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
function isValidBase64URL(data) {
	if (!base64url.test(data)) return false;
	const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
	return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}
const $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
	def.pattern ?? (def.pattern = base64url);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.contentEncoding = "base64url";
	inst._zod.check = (payload) => {
		if (isValidBase64URL(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
	def.pattern ?? (def.pattern = e164);
	$ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
	try {
		const tokensParts = token.split(".");
		if (tokensParts.length !== 3) return false;
		const [header] = tokensParts;
		if (!header) return false;
		const parsedHeader = JSON.parse(atob(header));
		if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
		if (!parsedHeader.alg) return false;
		if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
		return true;
	} catch {
		return false;
	}
}
const $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidJWT(payload.value, def.alg)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
const $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.issues.push({
			expected: "never",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
function handleArrayResult(result, final, index) {
	if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
	final.value[index] = result.value;
}
const $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!Array.isArray(input)) {
			payload.issues.push({
				expected: "array",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = Array(input.length);
		const proms = [];
		for (let i = 0; i < input.length; i++) {
			const item = input[i];
			const result = def.element._zod.run({
				value: item,
				issues: []
			}, ctx);
			if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
			else handleArrayResult(result, payload, i);
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
	const isPresent = key in input;
	if (result.issues.length) {
		if (isOptionalIn && isOptionalOut && !isPresent) return;
		final.issues.push(...prefixIssues(key, result.issues));
	}
	if (!isPresent && !isOptionalIn) {
		if (!result.issues.length) final.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [key]
		});
		return;
	}
	if (result.value === void 0) {
		if (isPresent) final.value[key] = void 0;
	} else final.value[key] = result.value;
}
function normalizeDef(def) {
	const keys = Object.keys(def.shape);
	for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
	const okeys = optionalKeys(def.shape);
	return {
		...def,
		keys,
		keySet: new Set(keys),
		numKeys: keys.length,
		optionalKeys: new Set(okeys)
	};
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
	const unrecognized = [];
	const keySet = def.keySet;
	const _catchall = def.catchall._zod;
	const t = _catchall.def.type;
	const isOptionalIn = _catchall.optin === "optional";
	const isOptionalOut = _catchall.optout === "optional";
	for (const key in input) {
		if (key === "__proto__") continue;
		if (keySet.has(key)) continue;
		if (t === "never") {
			unrecognized.push(key);
			continue;
		}
		const r = _catchall.run({
			value: input[key],
			issues: []
		}, ctx);
		if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
		else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
	}
	if (unrecognized.length) payload.issues.push({
		code: "unrecognized_keys",
		keys: unrecognized,
		input,
		inst
	});
	if (!proms.length) return payload;
	return Promise.all(proms).then(() => {
		return payload;
	});
}
const $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
	$ZodType.init(inst, def);
	if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
		const sh = def.shape;
		Object.defineProperty(def, "shape", { get: () => {
			const newSh = { ...sh };
			Object.defineProperty(def, "shape", { value: newSh });
			return newSh;
		} });
	}
	const _normalized = cached(() => normalizeDef(def));
	defineLazy(inst._zod, "propValues", () => {
		const shape = def.shape;
		const propValues = {};
		for (const key in shape) {
			const field = shape[key]._zod;
			if (field.values) {
				propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
				for (const v of field.values) propValues[key].add(v);
			}
		}
		return propValues;
	});
	const isObject$1 = isObject;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$1(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = {};
		const proms = [];
		const shape = value.shape;
		for (const key of value.keys) {
			const el = shape[key];
			const isOptionalIn = el._zod.optin === "optional";
			const isOptionalOut = el._zod.optout === "optional";
			const r = el._zod.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
			else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
		}
		if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
		return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
	};
});
const $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
	$ZodObject.init(inst, def);
	const superParse = inst._zod.parse;
	const _normalized = cached(() => normalizeDef(def));
	const generateFastpass = (shape) => {
		const doc = new Doc([
			"shape",
			"payload",
			"ctx"
		]);
		const normalized = _normalized.value;
		const parseStr = (key) => {
			const k = esc(key);
			return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
		};
		doc.write(`const input = payload.value;`);
		const ids = Object.create(null);
		let counter = 0;
		for (const key of normalized.keys) ids[key] = `key_${counter++}`;
		doc.write(`const newResult = {};`);
		for (const key of normalized.keys) {
			const id = ids[key];
			const k = esc(key);
			const schema = shape[key];
			const isOptionalIn = schema?._zod?.optin === "optional";
			const isOptionalOut = schema?._zod?.optout === "optional";
			doc.write(`const ${id} = ${parseStr(key)};`);
			if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
			else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
			else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
		}
		doc.write(`payload.value = newResult;`);
		doc.write(`return payload;`);
		const fn = doc.compile();
		return (payload, ctx) => fn(shape, payload, ctx);
	};
	let fastpass;
	const isObject$2 = isObject;
	const jit = !globalConfig.jitless;
	const fastEnabled = jit && allowsEval.value;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$2(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
			if (!fastpass) fastpass = generateFastpass(def.shape);
			payload = fastpass(payload, ctx);
			if (!catchall) return payload;
			return handleCatchall([], input, payload, ctx, value, inst);
		}
		return superParse(payload, ctx);
	};
});
function handleUnionResults(results, final, inst, ctx) {
	for (const result of results) if (result.issues.length === 0) {
		final.value = result.value;
		return final;
	}
	const nonaborted = results.filter((r) => !aborted(r));
	if (nonaborted.length === 1) {
		final.value = nonaborted[0].value;
		return nonaborted[0];
	}
	final.issues.push({
		code: "invalid_union",
		input: final.value,
		inst,
		errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	});
	return final;
}
const $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
	defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
	defineLazy(inst._zod, "values", () => {
		if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
	});
	defineLazy(inst._zod, "pattern", () => {
		if (def.options.every((o) => o._zod.pattern)) {
			const patterns = def.options.map((o) => o._zod.pattern);
			return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
		}
	});
	const first = def.options.length === 1 ? def.options[0]._zod.run : null;
	inst._zod.parse = (payload, ctx) => {
		if (first) return first(payload, ctx);
		let async = false;
		const results = [];
		for (const option of def.options) {
			const result = option._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) {
				results.push(result);
				async = true;
			} else {
				if (result.issues.length === 0) return result;
				results.push(result);
			}
		}
		if (!async) return handleUnionResults(results, payload, inst, ctx);
		return Promise.all(results).then((results) => {
			return handleUnionResults(results, payload, inst, ctx);
		});
	};
});
const $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		const left = def.left._zod.run({
			value: input,
			issues: []
		}, ctx);
		const right = def.right._zod.run({
			value: input,
			issues: []
		}, ctx);
		if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
			return handleIntersectionResults(payload, left, right);
		});
		return handleIntersectionResults(payload, left, right);
	};
});
function mergeValues(a, b) {
	if (a === b) return {
		valid: true,
		data: a
	};
	if (a instanceof Date && b instanceof Date && +a === +b) return {
		valid: true,
		data: a
	};
	if (isPlainObject(a) && isPlainObject(b)) {
		const bKeys = Object.keys(b);
		const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
		const newObj = {
			...a,
			...b
		};
		for (const key of sharedKeys) {
			const sharedValue = mergeValues(a[key], b[key]);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
			};
			newObj[key] = sharedValue.data;
		}
		return {
			valid: true,
			data: newObj
		};
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return {
			valid: false,
			mergeErrorPath: []
		};
		const newArray = [];
		for (let index = 0; index < a.length; index++) {
			const itemA = a[index];
			const itemB = b[index];
			const sharedValue = mergeValues(itemA, itemB);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
			};
			newArray.push(sharedValue.data);
		}
		return {
			valid: true,
			data: newArray
		};
	}
	return {
		valid: false,
		mergeErrorPath: []
	};
}
function handleIntersectionResults(result, left, right) {
	const unrecKeys = /* @__PURE__ */ new Map();
	let unrecIssue;
	for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
		unrecIssue ?? (unrecIssue = iss);
		for (const k of iss.keys) {
			if (!unrecKeys.has(k)) unrecKeys.set(k, {});
			unrecKeys.get(k).l = true;
		}
	} else result.issues.push(iss);
	for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
		if (!unrecKeys.has(k)) unrecKeys.set(k, {});
		unrecKeys.get(k).r = true;
	}
	else result.issues.push(iss);
	const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
	if (bothKeys.length && unrecIssue) result.issues.push({
		...unrecIssue,
		keys: bothKeys
	});
	if (aborted(result)) return result;
	const merged = mergeValues(left.value, right.value);
	if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
	result.value = merged.data;
	return result;
}
const $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
	$ZodType.init(inst, def);
	const values = getEnumValues(def.entries);
	const valuesSet = new Set(values);
	inst._zod.values = valuesSet;
	inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (valuesSet.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values,
			input,
			inst
		});
		return payload;
	};
});
const $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		const _out = def.transform(payload.value, payload);
		if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
			payload.value = output;
			payload.fallback = true;
			return payload;
		});
		if (_out instanceof Promise) throw new $ZodAsyncError();
		payload.value = _out;
		payload.fallback = true;
		return payload;
	};
});
function handleOptionalResult(result, input) {
	if (input === void 0 && (result.issues.length || result.fallback)) return {
		issues: [],
		value: void 0
	};
	return result;
}
const $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	inst._zod.optout = "optional";
	defineLazy(inst._zod, "values", () => {
		return def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0;
	});
	defineLazy(inst._zod, "pattern", () => {
		const pattern = def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (def.innerType._zod.optin === "optional") {
			const input = payload.value;
			const result = def.innerType._zod.run(payload, ctx);
			if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
			return handleOptionalResult(result, input);
		}
		if (payload.value === void 0) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
	inst._zod.parse = (payload, ctx) => {
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	defineLazy(inst._zod, "pattern", () => {
		const pattern = def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
	});
	defineLazy(inst._zod, "values", () => {
		return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === null) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) {
			payload.value = def.defaultValue;
			/**
			* $ZodDefault returns the default value immediately in forward direction.
			* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
			return payload;
		}
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
		return handleDefaultResult(result, def);
	};
});
function handleDefaultResult(payload, def) {
	if (payload.value === void 0) payload.value = def.defaultValue;
	return payload;
}
const $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) payload.value = def.defaultValue;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "values", () => {
		const v = def.innerType._zod.values;
		return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
		return handleNonOptionalResult(result, inst);
	};
});
function handleNonOptionalResult(payload, inst) {
	if (!payload.issues.length && payload.value === void 0) payload.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: payload.value,
		inst
	});
	return payload;
}
const $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => {
			payload.value = result.value;
			if (result.issues.length) {
				payload.value = def.catchValue({
					...payload,
					error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
					input: payload.value
				});
				payload.issues = [];
				payload.fallback = true;
			}
			return payload;
		});
		payload.value = result.value;
		if (result.issues.length) {
			payload.value = def.catchValue({
				...payload,
				error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
				input: payload.value
			});
			payload.issues = [];
			payload.fallback = true;
		}
		return payload;
	};
});
const $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "values", () => def.in._zod.values);
	defineLazy(inst._zod, "optin", () => def.in._zod.optin);
	defineLazy(inst._zod, "optout", () => def.out._zod.optout);
	defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") {
			const right = def.out._zod.run(payload, ctx);
			if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
			return handlePipeResult(right, def.in, ctx);
		}
		const left = def.in._zod.run(payload, ctx);
		if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
		return handlePipeResult(left, def.out, ctx);
	};
});
function handlePipeResult(left, next, ctx) {
	if (left.issues.length) {
		left.aborted = true;
		return left;
	}
	return next._zod.run({
		value: left.value,
		issues: left.issues,
		fallback: left.fallback
	}, ctx);
}
const $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
	defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then(handleReadonlyResult);
		return handleReadonlyResult(result);
	};
});
function handleReadonlyResult(payload) {
	payload.value = Object.freeze(payload.value);
	return payload;
}
const $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
	$ZodCheck.init(inst, def);
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _) => {
		return payload;
	};
	inst._zod.check = (payload) => {
		const input = payload.value;
		const r = def.fn(input);
		if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
		handleRefineResult(r, payload, input, inst);
	};
});
function handleRefineResult(result, payload, input, inst) {
	if (!result) {
		const _iss = {
			code: "custom",
			input,
			inst,
			path: [...inst._zod.def.path ?? []],
			continue: !inst._zod.def.abort
		};
		if (inst._zod.def.params) _iss.params = inst._zod.def.params;
		payload.issues.push(issue(_iss));
	}
}
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/registries.js
var _a;
var $ZodRegistry = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
	}
	add(schema, ..._meta) {
		const meta = _meta[0];
		this._map.set(schema, meta);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
		return this;
	}
	clear() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
		return this;
	}
	remove(schema) {
		const meta = this._map.get(schema);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
		this._map.delete(schema);
		return this;
	}
	get(schema) {
		const p = schema._zod.parent;
		if (p) {
			const pm = { ...this.get(p) ?? {} };
			delete pm.id;
			const f = {
				...pm,
				...this._map.get(schema)
			};
			return Object.keys(f).length ? f : void 0;
		}
		return this._map.get(schema);
	}
	has(schema) {
		return this._map.has(schema);
	}
};
function registry() {
	return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/api.js
/* @__NO_SIDE_EFFECTS__ */
function _string(Class, params) {
	return new Class({
		type: "string",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _email(Class, params) {
	return new Class({
		type: "string",
		format: "email",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _guid(Class, params) {
	return new Class({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuid(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv4(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v4",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv6(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v6",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv7(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v7",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _url(Class, params) {
	return new Class({
		type: "string",
		format: "url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _emoji(Class, params) {
	return new Class({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _nanoid(Class, params) {
	return new Class({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link _cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
/* @__NO_SIDE_EFFECTS__ */
function _cuid(Class, params) {
	return new Class({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cuid2(Class, params) {
	return new Class({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ulid(Class, params) {
	return new Class({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _xid(Class, params) {
	return new Class({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ksuid(Class, params) {
	return new Class({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ipv4(Class, params) {
	return new Class({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ipv6(Class, params) {
	return new Class({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cidrv4(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cidrv6(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _base64(Class, params) {
	return new Class({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _base64url(Class, params) {
	return new Class({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _e164(Class, params) {
	return new Class({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _jwt(Class, params) {
	return new Class({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDateTime(Class, params) {
	return new Class({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: false,
		local: false,
		precision: null,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDate(Class, params) {
	return new Class({
		type: "string",
		format: "date",
		check: "string_format",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoTime(Class, params) {
	return new Class({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDuration(Class, params) {
	return new Class({
		type: "string",
		format: "duration",
		check: "string_format",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _unknown(Class) {
	return new Class({ type: "unknown" });
}
/* @__NO_SIDE_EFFECTS__ */
function _never(Class, params) {
	return new Class({
		type: "never",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _maxLength(maximum, params) {
	return new $ZodCheckMaxLength({
		check: "max_length",
		...normalizeParams(params),
		maximum
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _minLength(minimum, params) {
	return new $ZodCheckMinLength({
		check: "min_length",
		...normalizeParams(params),
		minimum
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _length(length, params) {
	return new $ZodCheckLengthEquals({
		check: "length_equals",
		...normalizeParams(params),
		length
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _regex(pattern, params) {
	return new $ZodCheckRegex({
		check: "string_format",
		format: "regex",
		...normalizeParams(params),
		pattern
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _lowercase(params) {
	return new $ZodCheckLowerCase({
		check: "string_format",
		format: "lowercase",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uppercase(params) {
	return new $ZodCheckUpperCase({
		check: "string_format",
		format: "uppercase",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _includes(includes, params) {
	return new $ZodCheckIncludes({
		check: "string_format",
		format: "includes",
		...normalizeParams(params),
		includes
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _startsWith(prefix, params) {
	return new $ZodCheckStartsWith({
		check: "string_format",
		format: "starts_with",
		...normalizeParams(params),
		prefix
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _endsWith(suffix, params) {
	return new $ZodCheckEndsWith({
		check: "string_format",
		format: "ends_with",
		...normalizeParams(params),
		suffix
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _overwrite(tx) {
	return new $ZodCheckOverwrite({
		check: "overwrite",
		tx
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _normalize(form) {
	return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
/* @__NO_SIDE_EFFECTS__ */
function _trim() {
	return /* @__PURE__ */ _overwrite((input) => input.trim());
}
/* @__NO_SIDE_EFFECTS__ */
function _toLowerCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
/* @__NO_SIDE_EFFECTS__ */
function _toUpperCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
/* @__NO_SIDE_EFFECTS__ */
function _slugify() {
	return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
/* @__NO_SIDE_EFFECTS__ */
function _array(Class, element, params) {
	return new Class({
		type: "array",
		element,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _refine(Class, fn, _params) {
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...normalizeParams(_params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _superRefine(fn, params) {
	const ch = /* @__PURE__ */ _check((payload) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	}, params);
	return ch;
}
/* @__NO_SIDE_EFFECTS__ */
function _check(fn, params) {
	const ch = new $ZodCheck({
		check: "custom",
		...normalizeParams(params)
	});
	ch._zod.check = fn;
	return ch;
}
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
	let target = params?.target ?? "draft-2020-12";
	if (target === "draft-4") target = "draft-04";
	if (target === "draft-7") target = "draft-07";
	return {
		processors: params.processors ?? {},
		metadataRegistry: params?.metadata ?? globalRegistry,
		target,
		unrepresentable: params?.unrepresentable ?? "throw",
		override: params?.override ?? (() => {}),
		io: params?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: params?.cycles ?? "ref",
		reused: params?.reused ?? "inline",
		external: params?.external ?? void 0
	};
}
function process$1(schema, ctx, _params = {
	path: [],
	schemaPath: []
}) {
	var _a;
	const def = schema._zod.def;
	const seen = ctx.seen.get(schema);
	if (seen) {
		seen.count++;
		if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
		return seen.schema;
	}
	const result = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: _params.path
	};
	ctx.seen.set(schema, result);
	const overrideSchema = schema._zod.toJSONSchema?.();
	if (overrideSchema) result.schema = overrideSchema;
	else {
		const params = {
			..._params,
			schemaPath: [..._params.schemaPath, schema],
			path: _params.path
		};
		if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
		else {
			const _json = result.schema;
			const processor = ctx.processors[def.type];
			if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
			processor(schema, ctx, _json, params);
		}
		const parent = schema._zod.parent;
		if (parent) {
			if (!result.ref) result.ref = parent;
			process$1(parent, ctx, params);
			ctx.seen.get(parent).isParent = true;
		}
	}
	const meta = ctx.metadataRegistry.get(schema);
	if (meta) Object.assign(result.schema, meta);
	if (ctx.io === "input" && isTransforming(schema)) {
		delete result.schema.examples;
		delete result.schema.default;
	}
	if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
	delete result.schema._prefault;
	return ctx.seen.get(schema).schema;
}
function extractDefs(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const idToSchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.entries()) {
		const id = ctx.metadataRegistry.get(entry[0])?.id;
		if (id) {
			const existing = idToSchema.get(id);
			if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			idToSchema.set(id, entry[0]);
		}
	}
	const makeURI = (entry) => {
		const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
		if (ctx.external) {
			const externalId = ctx.external.registry.get(entry[0])?.id;
			const uriGenerator = ctx.external.uri ?? ((id) => id);
			if (externalId) return { ref: uriGenerator(externalId) };
			const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
			entry[1].defId = id;
			return {
				defId: id,
				ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
			};
		}
		if (entry[1] === root) return { ref: "#" };
		const defUriPrefix = `#/${defsSegment}/`;
		const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
		return {
			defId,
			ref: defUriPrefix + defId
		};
	};
	const extractToDef = (entry) => {
		if (entry[1].schema.$ref) return;
		const seen = entry[1];
		const { ref, defId } = makeURI(entry);
		seen.def = { ...seen.schema };
		if (defId) seen.defId = defId;
		const schema = seen.schema;
		for (const key in schema) delete schema[key];
		schema.$ref = ref;
	};
	if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (schema === entry[0]) {
			extractToDef(entry);
			continue;
		}
		if (ctx.external) {
			const ext = ctx.external.registry.get(entry[0])?.id;
			if (schema !== entry[0] && ext) {
				extractToDef(entry);
				continue;
			}
		}
		if (ctx.metadataRegistry.get(entry[0])?.id) {
			extractToDef(entry);
			continue;
		}
		if (seen.cycle) {
			extractToDef(entry);
			continue;
		}
		if (seen.count > 1) {
			if (ctx.reused === "ref") {
				extractToDef(entry);
				continue;
			}
		}
	}
}
function finalize(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const flattenRef = (zodSchema) => {
		const seen = ctx.seen.get(zodSchema);
		if (seen.ref === null) return;
		const schema = seen.def ?? seen.schema;
		const _cached = { ...schema };
		const ref = seen.ref;
		seen.ref = null;
		if (ref) {
			flattenRef(ref);
			const refSeen = ctx.seen.get(ref);
			const refSchema = refSeen.schema;
			if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
				schema.allOf = schema.allOf ?? [];
				schema.allOf.push(refSchema);
			} else Object.assign(schema, refSchema);
			Object.assign(schema, _cached);
			if (zodSchema._zod.parent === ref) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (!(key in _cached)) delete schema[key];
			}
			if (refSchema.$ref && refSeen.def) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
			}
		}
		const parent = zodSchema._zod.parent;
		if (parent && parent !== ref) {
			flattenRef(parent);
			const parentSeen = ctx.seen.get(parent);
			if (parentSeen?.schema.$ref) {
				schema.$ref = parentSeen.schema.$ref;
				if (parentSeen.def) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
				}
			}
		}
		ctx.override({
			zodSchema,
			jsonSchema: schema,
			path: seen.path ?? []
		});
	};
	for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
	const result = {};
	if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
	else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
	else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
	else if (ctx.target === "openapi-3.0") {}
	if (ctx.external?.uri) {
		const id = ctx.external.registry.get(schema)?.id;
		if (!id) throw new Error("Schema is missing an `id` property");
		result.$id = ctx.external.uri(id);
	}
	Object.assign(result, root.def ?? root.schema);
	const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
	if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
	const defs = ctx.external?.defs ?? {};
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.def && seen.defId) {
			if (seen.def.id === seen.defId) delete seen.def.id;
			defs[seen.defId] = seen.def;
		}
	}
	if (ctx.external) {} else if (Object.keys(defs).length > 0) if (ctx.target === "draft-2020-12") result.$defs = defs;
	else result.definitions = defs;
	try {
		const finalized = JSON.parse(JSON.stringify(result));
		Object.defineProperty(finalized, "~standard", {
			value: {
				...schema["~standard"],
				jsonSchema: {
					input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
					output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
				}
			},
			enumerable: false,
			writable: false
		});
		return finalized;
	} catch (_err) {
		throw new Error("Error converting schema to JSON.");
	}
}
function isTransforming(_schema, _ctx) {
	const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
	if (ctx.seen.has(_schema)) return false;
	ctx.seen.add(_schema);
	const def = _schema._zod.def;
	if (def.type === "transform") return true;
	if (def.type === "array") return isTransforming(def.element, ctx);
	if (def.type === "set") return isTransforming(def.valueType, ctx);
	if (def.type === "lazy") return isTransforming(def.getter(), ctx);
	if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
	if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
	if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
	if (def.type === "pipe") {
		if (_schema._zod.traits.has("$ZodCodec")) return true;
		return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
	}
	if (def.type === "object") {
		for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
		return false;
	}
	if (def.type === "union") {
		for (const option of def.options) if (isTransforming(option, ctx)) return true;
		return false;
	}
	if (def.type === "tuple") {
		for (const item of def.items) if (isTransforming(item, ctx)) return true;
		if (def.rest && isTransforming(def.rest, ctx)) return true;
		return false;
	}
	return false;
}
/**
* Creates a toJSONSchema method for a schema instance.
* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
*/
const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
	const ctx = initializeContext({
		...params,
		processors
	});
	process$1(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
	const { libraryOptions, target } = params ?? {};
	const ctx = initializeContext({
		...libraryOptions ?? {},
		target,
		io,
		processors
	});
	process$1(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
const formatMap = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
};
const stringProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	json.type = "string";
	const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
	if (typeof minimum === "number") json.minLength = minimum;
	if (typeof maximum === "number") json.maxLength = maximum;
	if (format) {
		json.format = formatMap[format] ?? format;
		if (json.format === "") delete json.format;
		if (format === "time") delete json.format;
	}
	if (contentEncoding) json.contentEncoding = contentEncoding;
	if (patterns && patterns.size > 0) {
		const regexes = [...patterns];
		if (regexes.length === 1) json.pattern = regexes[0].source;
		else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
			...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: regex.source
		}))];
	}
};
const neverProcessor = (_schema, _ctx, json, _params) => {
	json.not = {};
};
const unknownProcessor = (_schema, _ctx, _json, _params) => {};
const enumProcessor = (schema, _ctx, json, _params) => {
	const def = schema._zod.def;
	const values = getEnumValues(def.entries);
	if (values.every((v) => typeof v === "number")) json.type = "number";
	if (values.every((v) => typeof v === "string")) json.type = "string";
	json.enum = values;
};
const customProcessor = (_schema, ctx, _json, _params) => {
	if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
};
const transformProcessor = (_schema, ctx, _json, _params) => {
	if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
};
const arrayProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const { minimum, maximum } = schema._zod.bag;
	if (typeof minimum === "number") json.minItems = minimum;
	if (typeof maximum === "number") json.maxItems = maximum;
	json.type = "array";
	json.items = process$1(def.element, ctx, {
		...params,
		path: [...params.path, "items"]
	});
};
const objectProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	json.type = "object";
	json.properties = {};
	const shape = def.shape;
	for (const key in shape) json.properties[key] = process$1(shape[key], ctx, {
		...params,
		path: [
			...params.path,
			"properties",
			key
		]
	});
	const allKeys = new Set(Object.keys(shape));
	const requiredKeys = new Set([...allKeys].filter((key) => {
		const v = def.shape[key]._zod;
		if (ctx.io === "input") return v.optin === void 0;
		else return v.optout === void 0;
	}));
	if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
	if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
	else if (!def.catchall) {
		if (ctx.io === "output") json.additionalProperties = false;
	} else if (def.catchall) json.additionalProperties = process$1(def.catchall, ctx, {
		...params,
		path: [...params.path, "additionalProperties"]
	});
};
const unionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const isExclusive = def.inclusive === false;
	const options = def.options.map((x, i) => process$1(x, ctx, {
		...params,
		path: [
			...params.path,
			isExclusive ? "oneOf" : "anyOf",
			i
		]
	}));
	if (isExclusive) json.oneOf = options;
	else json.anyOf = options;
};
const intersectionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const a = process$1(def.left, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			0
		]
	});
	const b = process$1(def.right, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			1
		]
	});
	const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
	json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
};
const nullableProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const inner = process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	if (ctx.target === "openapi-3.0") {
		seen.ref = def.innerType;
		json.nullable = true;
	} else json.anyOf = [inner, { type: "null" }];
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
const defaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
const prefaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
const catchProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	let catchValue;
	try {
		catchValue = def.catchValue(void 0);
	} catch {
		throw new Error("Dynamic catch values are not supported in JSON Schema");
	}
	json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	const inIsTransform = def.in._zod.traits.has("$ZodTransform");
	const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
	process$1(innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.readOnly = true;
};
const optionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/classic/iso.js
const ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function datetime(params) {
	return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
}
const ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function date(params) {
	return /* @__PURE__ */ _isoDate(ZodISODate, params);
}
const ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function time(params) {
	return /* @__PURE__ */ _isoTime(ZodISOTime, params);
}
const ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function duration(params) {
	return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
}
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/classic/errors.js
const initializer = (inst, issues) => {
	$ZodError.init(inst, issues);
	inst.name = "ZodError";
	Object.defineProperties(inst, {
		format: { value: (mapper) => formatError(inst, mapper) },
		flatten: { value: (mapper) => flattenError(inst, mapper) },
		addIssue: { value: (issue) => {
			inst.issues.push(issue);
			inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
		} },
		addIssues: { value: (issues) => {
			inst.issues.push(...issues);
			inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
		} },
		isEmpty: { get() {
			return inst.issues.length === 0;
		} }
	});
};
const ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer, { Parent: Error });
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/classic/parse.js
const parse = /* @__PURE__ */ _parse(ZodRealError);
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
const encode = /* @__PURE__ */ _encode(ZodRealError);
const decode = /* @__PURE__ */ _decode(ZodRealError);
const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
//#endregion
//#region ../../../node_modules/.bun/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
const _installedGroups = /* @__PURE__ */ new WeakMap();
function _installLazyMethods(inst, group, methods) {
	const proto = Object.getPrototypeOf(inst);
	let installed = _installedGroups.get(proto);
	if (!installed) {
		installed = /* @__PURE__ */ new Set();
		_installedGroups.set(proto, installed);
	}
	if (installed.has(group)) return;
	installed.add(group);
	for (const key in methods) {
		const fn = methods[key];
		Object.defineProperty(proto, key, {
			configurable: true,
			enumerable: false,
			get() {
				const bound = fn.bind(this);
				Object.defineProperty(this, key, {
					configurable: true,
					writable: true,
					enumerable: true,
					value: bound
				});
				return bound;
			},
			set(v) {
				Object.defineProperty(this, key, {
					configurable: true,
					writable: true,
					enumerable: true,
					value: v
				});
			}
		});
	}
}
const ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
	$ZodType.init(inst, def);
	Object.assign(inst["~standard"], { jsonSchema: {
		input: createStandardJSONSchemaMethod(inst, "input"),
		output: createStandardJSONSchemaMethod(inst, "output")
	} });
	inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
	inst.def = def;
	inst.type = def.type;
	Object.defineProperty(inst, "_def", { value: def });
	inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
	inst.safeParse = (data, params) => safeParse(inst, data, params);
	inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
	inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
	inst.spa = inst.safeParseAsync;
	inst.encode = (data, params) => encode(inst, data, params);
	inst.decode = (data, params) => decode(inst, data, params);
	inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
	inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
	inst.safeEncode = (data, params) => safeEncode(inst, data, params);
	inst.safeDecode = (data, params) => safeDecode(inst, data, params);
	inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
	inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
	_installLazyMethods(inst, "ZodType", {
		check(...chks) {
			const def = this.def;
			return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
				check: ch,
				def: { check: "custom" },
				onattach: []
			} } : ch)] }), { parent: true });
		},
		with(...chks) {
			return this.check(...chks);
		},
		clone(def, params) {
			return clone(this, def, params);
		},
		brand() {
			return this;
		},
		register(reg, meta) {
			reg.add(this, meta);
			return this;
		},
		refine(check, params) {
			return this.check(refine(check, params));
		},
		superRefine(refinement, params) {
			return this.check(superRefine(refinement, params));
		},
		overwrite(fn) {
			return this.check(/* @__PURE__ */ _overwrite(fn));
		},
		optional() {
			return optional(this);
		},
		exactOptional() {
			return exactOptional(this);
		},
		nullable() {
			return nullable(this);
		},
		nullish() {
			return optional(nullable(this));
		},
		nonoptional(params) {
			return nonoptional(this, params);
		},
		array() {
			return array(this);
		},
		or(arg) {
			return union([this, arg]);
		},
		and(arg) {
			return intersection(this, arg);
		},
		transform(tx) {
			return pipe(this, transform(tx));
		},
		default(d) {
			return _default(this, d);
		},
		prefault(d) {
			return prefault(this, d);
		},
		catch(params) {
			return _catch(this, params);
		},
		pipe(target) {
			return pipe(this, target);
		},
		readonly() {
			return readonly(this);
		},
		describe(description) {
			const cl = this.clone();
			globalRegistry.add(cl, { description });
			return cl;
		},
		meta(...args) {
			if (args.length === 0) return globalRegistry.get(this);
			const cl = this.clone();
			globalRegistry.add(cl, args[0]);
			return cl;
		},
		isOptional() {
			return this.safeParse(void 0).success;
		},
		isNullable() {
			return this.safeParse(null).success;
		},
		apply(fn) {
			return fn(this);
		}
	});
	Object.defineProperty(inst, "description", {
		get() {
			return globalRegistry.get(inst)?.description;
		},
		configurable: true
	});
	return inst;
});
/** @internal */
const _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
	const bag = inst._zod.bag;
	inst.format = bag.format ?? null;
	inst.minLength = bag.minimum ?? null;
	inst.maxLength = bag.maximum ?? null;
	_installLazyMethods(inst, "_ZodString", {
		regex(...args) {
			return this.check(/* @__PURE__ */ _regex(...args));
		},
		includes(...args) {
			return this.check(/* @__PURE__ */ _includes(...args));
		},
		startsWith(...args) {
			return this.check(/* @__PURE__ */ _startsWith(...args));
		},
		endsWith(...args) {
			return this.check(/* @__PURE__ */ _endsWith(...args));
		},
		min(...args) {
			return this.check(/* @__PURE__ */ _minLength(...args));
		},
		max(...args) {
			return this.check(/* @__PURE__ */ _maxLength(...args));
		},
		length(...args) {
			return this.check(/* @__PURE__ */ _length(...args));
		},
		nonempty(...args) {
			return this.check(/* @__PURE__ */ _minLength(1, ...args));
		},
		lowercase(params) {
			return this.check(/* @__PURE__ */ _lowercase(params));
		},
		uppercase(params) {
			return this.check(/* @__PURE__ */ _uppercase(params));
		},
		trim() {
			return this.check(/* @__PURE__ */ _trim());
		},
		normalize(...args) {
			return this.check(/* @__PURE__ */ _normalize(...args));
		},
		toLowerCase() {
			return this.check(/* @__PURE__ */ _toLowerCase());
		},
		toUpperCase() {
			return this.check(/* @__PURE__ */ _toUpperCase());
		},
		slugify() {
			return this.check(/* @__PURE__ */ _slugify());
		}
	});
});
const ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
	inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
	inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
	inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
	inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
	inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
	inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
	inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
	inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
	inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
	inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
	inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
	inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
	inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
	inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
	inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
	inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
	inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
	inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
	inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
	inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
	inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
	inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
	inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
	inst.datetime = (params) => inst.check(datetime(params));
	inst.date = (params) => inst.check(date(params));
	inst.time = (params) => inst.check(time(params));
	inst.duration = (params) => inst.check(duration(params));
});
function string(params) {
	return /* @__PURE__ */ _string(ZodString, params);
}
const ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
const ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
	return /* @__PURE__ */ _unknown(ZodUnknown);
}
const ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
	return /* @__PURE__ */ _never(ZodNever, params);
}
const ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
	inst.element = def.element;
	_installLazyMethods(inst, "ZodArray", {
		min(n, params) {
			return this.check(/* @__PURE__ */ _minLength(n, params));
		},
		nonempty(params) {
			return this.check(/* @__PURE__ */ _minLength(1, params));
		},
		max(n, params) {
			return this.check(/* @__PURE__ */ _maxLength(n, params));
		},
		length(n, params) {
			return this.check(/* @__PURE__ */ _length(n, params));
		},
		unwrap() {
			return this.element;
		}
	});
});
function array(element, params) {
	return /* @__PURE__ */ _array(ZodArray, element, params);
}
const ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
	$ZodObjectJIT.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
	defineLazy(inst, "shape", () => {
		return def.shape;
	});
	_installLazyMethods(inst, "ZodObject", {
		keyof() {
			return _enum(Object.keys(this._zod.def.shape));
		},
		catchall(catchall) {
			return this.clone({
				...this._zod.def,
				catchall
			});
		},
		passthrough() {
			return this.clone({
				...this._zod.def,
				catchall: unknown()
			});
		},
		loose() {
			return this.clone({
				...this._zod.def,
				catchall: unknown()
			});
		},
		strict() {
			return this.clone({
				...this._zod.def,
				catchall: never()
			});
		},
		strip() {
			return this.clone({
				...this._zod.def,
				catchall: void 0
			});
		},
		extend(incoming) {
			return extend(this, incoming);
		},
		safeExtend(incoming) {
			return safeExtend(this, incoming);
		},
		merge(other) {
			return merge(this, other);
		},
		pick(mask) {
			return pick(this, mask);
		},
		omit(mask) {
			return omit(this, mask);
		},
		partial(...args) {
			return partial(ZodOptional, this, args[0]);
		},
		required(...args) {
			return required(ZodNonOptional, this, args[0]);
		}
	});
});
function object(shape, params) {
	return new ZodObject({
		type: "object",
		shape: shape ?? {},
		...normalizeParams(params)
	});
}
const ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
const ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
const ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
	inst.enum = def.entries;
	inst.options = Object.values(def.entries);
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	return new ZodEnum({
		type: "enum",
		entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
		...normalizeParams(params)
	});
}
const ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
	inst._zod.parse = (payload, _ctx) => {
		if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = inst);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			payload.fallback = true;
			return payload;
		});
		payload.value = output;
		payload.fallback = true;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
const ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
const ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
	$ZodExactOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
	return new ZodExactOptional({
		type: "optional",
		innerType
	});
}
const ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
const ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
const ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
	});
}
const ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
const ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
const ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
	return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
	return /* @__PURE__ */ _superRefine(fn, params);
}
//#endregion
//#region src/inputs.ts
/**
* Parses raw string-only YAML inputs (as delivered by the runtime
* loader) into a typed `ParsedInputs` object suitable for building
* Claude Agent SDK options.
*
* Why Zod and not plain manual parsing: each input has independent
* coercion rules (CSV-to-array, JSON-to-object, optional-passthrough);
* Zod centralizes that logic in one schema and produces a single
* aggregated error message on failure.
*
* Contents:
* - `parseInputs(rawInputs)` — main entry-point.
* - `ParsedInputs` — inferred output type.
* - Internal field schemas (CSV, JSON, etc).
*/
const NON_EMPTY = (v) => v.length > 0;
const optionalNonEmpty = string().optional().transform((v) => v && NON_EMPTY(v) ? v : void 0);
const optionalNumber = string().optional().transform((v, ctx) => {
	if (!v || !NON_EMPTY(v)) return void 0;
	const n = Number(v);
	if (!Number.isFinite(n)) {
		ctx.addIssue({
			code: "custom",
			message: `not a finite number: '${v}'`
		});
		return NEVER;
	}
	return n;
});
const optionalCsv = string().optional().transform((v) => {
	if (!v || !NON_EMPTY(v)) return void 0;
	return v.split(",").map((s) => s.trim()).filter(NON_EMPTY);
});
const optionalJson = (label) => string().optional().transform((v, ctx) => {
	if (!v || !NON_EMPTY(v)) return void 0;
	try {
		return JSON.parse(v);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		ctx.addIssue({
			code: "custom",
			message: `${label}: invalid JSON (${msg})`
		});
		return NEVER;
	}
});
const PERMISSION_MODES = [
	"default",
	"acceptEdits",
	"bypassPermissions",
	"plan"
];
const permissionMode = string().optional().transform((v, ctx) => {
	const candidate = v && NON_EMPTY(v) ? v : "bypassPermissions";
	if (!PERMISSION_MODES.includes(candidate)) {
		ctx.addIssue({
			code: "custom",
			message: `permission_mode must be one of: ${PERMISSION_MODES.join(", ")} (got '${candidate}')`
		});
		return NEVER;
	}
	return candidate;
});
const SETTING_SOURCES = ["project", "user"];
const settingSources = string().optional().transform((v, ctx) => {
	const parts = (v && NON_EMPTY(v) ? v : "project,user").split(",").map((s) => s.trim()).filter(NON_EMPTY);
	const unknown = parts.filter((p) => !SETTING_SOURCES.includes(p));
	if (unknown.length > 0) {
		const list = unknown.map((u) => `'${u}'`).join(", ");
		ctx.addIssue({
			code: "custom",
			message: `setting_sources contains unknown values: ${list}. Allowed: ${SETTING_SOURCES.join(", ")}`
		});
		return NEVER;
	}
	return parts;
});
const systemPrompt = string().optional().transform((v, ctx) => {
	if (v === void 0) return {
		type: "preset",
		preset: "claude_code"
	};
	if (v.length === 0) return void 0;
	if (!v.startsWith("{")) return v;
	let parsed;
	try {
		parsed = JSON.parse(v);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		ctx.addIssue({
			code: "custom",
			message: `system_prompt: invalid JSON (${msg})`
		});
		return NEVER;
	}
	if (parsed === null || typeof parsed !== "object" || !("type" in parsed)) {
		ctx.addIssue({
			code: "custom",
			message: "system_prompt: object form must be `{ type: 'preset', preset: 'claude_code', append?: string }`"
		});
		return NEVER;
	}
	const obj = parsed;
	if (obj.type !== "preset") {
		ctx.addIssue({
			code: "custom",
			message: "system_prompt: object form must be `{ type: 'preset', preset: 'claude_code', append?: string }`"
		});
		return NEVER;
	}
	if (obj.preset !== "claude_code") {
		ctx.addIssue({
			code: "custom",
			message: `system_prompt: object form's \`preset\` must be "claude_code" (got '${String(obj.preset)}')`
		});
		return NEVER;
	}
	return parsed;
});
const inputsSchema = object({
	prompt: string().min(1, "prompt is required"),
	model: optionalNonEmpty,
	cwd: optionalNonEmpty,
	system_prompt: systemPrompt,
	max_turns: optionalNumber,
	allowed_tools: optionalCsv,
	mcp_servers: optionalJson("mcp_servers"),
	permission_mode: permissionMode,
	setting_sources: settingSources,
	resume_session_id: optionalNonEmpty,
	fallback_model: optionalNonEmpty,
	max_budget_usd: optionalNumber,
	path_to_claude_code_executable: optionalNonEmpty
});
/**
* Parse raw string-only action inputs into a typed `ParsedInputs` object.
*
* @param raw - Record of string inputs as delivered by the runtime loader.
* @returns Validated and coerced inputs.
* @throws {Error} With aggregated issue messages when validation fails.
*/
function parseInputs(raw) {
	const result = inputsSchema.safeParse(raw);
	if (result.success) return result.data;
	const issues = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
	throw new Error(`invalid action inputs:\n${issues}`);
}
//#endregion
//#region src/usage.ts
/**
* Flatten an SDK `result` event into a {@link UsageJson} payload.
* All numeric fields default to `0`; `total` falls back to `input + output`
* when `total_tokens` is absent.
*/
function buildUsage(result) {
	const u = result.usage ?? {};
	const input = u.input_tokens ?? 0;
	const output = u.output_tokens ?? 0;
	return {
		input,
		output,
		total: u.total_tokens ?? input + output,
		cost_usd: result.total_cost_usd ?? 0,
		num_turns: result.num_turns ?? 0,
		model_usage: result.model_usage ?? {}
	};
}
//#endregion
//#region src/main.ts
/**
* Action entry-point: called by the AIactions runtime loader after it
* has read `{ inputs }` from stdin and built `ctx`. Drives the Claude
* Agent SDK's `query()` to completion, surfaces incremental progress
* via `ctx.log`, and emits final outputs via `ctx.emitOutput`.
*
* Throws on terminal errors (missing binary, SDK error, agent reported
* is_error). The loader catches the throw and emits an error frame.
*
* Contents:
* - `run(ctx)` — entry-point exported to the loader.
* - Local helpers (event dispatch, abort wiring) inlined.
*/
/**
* Drive the Claude Agent SDK's `query()` to completion, log
* incremental progress via `ctx.log`, and emit final outputs via
* `ctx.emitOutput`. Throws on terminal errors.
*
* @param ctx - Loader-provided action context.
*/
async function run(ctx) {
	const inputs = parseInputs(ctx.inputs);
	const sdkOptions = buildSdkOptions(inputs, ctx, resolveClaudeBinary(inputs.path_to_claude_code_executable, ctx.env), signalToController(ctx.signal));
	let assistantText = "";
	let result;
	try {
		const events = t7$({
			prompt: inputs.prompt,
			options: sdkOptions
		});
		for await (const event of events) {
			if (ctx.signal.aborted) break;
			if (event.type === "assistant") {
				const e = event;
				for (const block of e.message.content ?? []) if (block.type === "text") {
					const text = block.text;
					if (text.length > 0) {
						assistantText += text;
						ctx.log("info", `[assistant] ${text}`);
					}
				} else if (block.type === "tool_use") {
					const tu = block;
					ctx.log("debug", `[tool_use] ${tu.name} ${JSON.stringify(tu.input ?? {})}`);
				}
			} else if (event.type === "system") {
				const e = event;
				if (e.subtype === "init" && Array.isArray(e.mcp_servers)) {
					const failed = e.mcp_servers.filter((s) => s.status !== "connected");
					if (failed.length > 0) {
						const list = failed.map((s) => `${s.name}(${s.status})`).join(", ");
						ctx.log("warn", `MCP server(s) failed to connect: ${list}`);
					}
				}
			} else if (event.type === "rate_limit_event") {
				const e = event;
				ctx.log("warn", `rate_limit: ${JSON.stringify(e.rate_limit_info ?? {})}`);
			} else if (event.type === "result") result = event;
		}
	} finally {
		if (result !== void 0) {
			ctx.emitOutput("text", assistantText);
			ctx.emitOutput("session_id", result.session_id ?? "");
			ctx.emitOutput("stop_reason", result.stop_reason ?? "");
			ctx.emitOutput("is_error", result.is_error ? "true" : "false");
			ctx.emitOutput("usage", JSON.stringify(buildUsage(result)));
		} else if (ctx.signal.aborted) {
			ctx.emitOutput("text", assistantText);
			ctx.emitOutput("session_id", "");
			ctx.emitOutput("stop_reason", "aborted");
			ctx.emitOutput("is_error", "false");
			ctx.emitOutput("usage", JSON.stringify(buildUsage({})));
		}
	}
	if (!result) {
		if (ctx.signal.aborted) return;
		throw new Error("agent stream ended without a `result` event");
	}
	if (result.is_error) {
		const subtype = result.subtype ?? "?";
		const errs = Array.isArray(result.errors) ? result.errors.join("; ") : "";
		throw new Error(`agent reported error (subtype=${subtype})${errs ? `: ${errs}` : ""}`);
	}
}
function signalToController(signal) {
	const controller = new AbortController();
	if (signal.aborted) controller.abort();
	else signal.addEventListener("abort", () => controller.abort(), { once: true });
	return controller;
}
function buildSdkOptions(inputs, ctx, claudePath, controller) {
	const options = {
		cwd: inputs.cwd ?? ctx.cwd,
		permissionMode: inputs.permission_mode,
		allowDangerouslySkipPermissions: inputs.permission_mode === "bypassPermissions",
		settingSources: inputs.setting_sources,
		pathToClaudeCodeExecutable: claudePath,
		executable: "node",
		env: ctx.env,
		abortController: controller,
		stderr: (data) => {
			const trimmed = data.trim();
			if (trimmed.length > 0) ctx.log("debug", `[stderr] ${trimmed}`);
		}
	};
	if (inputs.model !== void 0) options.model = inputs.model;
	if (inputs.system_prompt !== void 0) options.systemPrompt = inputs.system_prompt;
	if (inputs.max_turns !== void 0) options.maxTurns = inputs.max_turns;
	if (inputs.allowed_tools !== void 0) options.allowedTools = inputs.allowed_tools;
	if (inputs.mcp_servers !== void 0) options.mcpServers = inputs.mcp_servers;
	if (inputs.resume_session_id !== void 0) options.resume = inputs.resume_session_id;
	if (inputs.fallback_model !== void 0) options.fallbackModel = inputs.fallback_model;
	if (inputs.max_budget_usd !== void 0) options.maxBudgetUsd = inputs.max_budget_usd;
	return options;
}
//#endregion
export { run };
