(function() {
	//#region \0rolldown/runtime.js
	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
	//#endregion
	//#region node_modules/.pnpm/react@18.2.0/node_modules/react/cjs/react.production.min.js
	/**
	* @license React
	* react.production.min.js
	*
	* Copyright (c) Facebook, Inc. and its affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var require_react_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
		var l = Symbol.for("react.element");
		var n = Symbol.for("react.portal");
		var p = Symbol.for("react.fragment");
		var q = Symbol.for("react.strict_mode");
		var r = Symbol.for("react.profiler");
		var t = Symbol.for("react.provider");
		var u = Symbol.for("react.context");
		var v = Symbol.for("react.forward_ref");
		var w = Symbol.for("react.suspense");
		var x = Symbol.for("react.memo");
		var y = Symbol.for("react.lazy");
		var z = Symbol.iterator;
		function A(a) {
			if (null === a || "object" !== typeof a) return null;
			a = z && a[z] || a["@@iterator"];
			return "function" === typeof a ? a : null;
		}
		var B = {
			isMounted: function() {
				return !1;
			},
			enqueueForceUpdate: function() {},
			enqueueReplaceState: function() {},
			enqueueSetState: function() {}
		};
		var C = Object.assign;
		var D = {};
		function E(a, b, e) {
			this.props = a;
			this.context = b;
			this.refs = D;
			this.updater = e || B;
		}
		E.prototype.isReactComponent = {};
		E.prototype.setState = function(a, b) {
			if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, a, b, "setState");
		};
		E.prototype.forceUpdate = function(a) {
			this.updater.enqueueForceUpdate(this, a, "forceUpdate");
		};
		function F() {}
		F.prototype = E.prototype;
		function G(a, b, e) {
			this.props = a;
			this.context = b;
			this.refs = D;
			this.updater = e || B;
		}
		var H = G.prototype = new F();
		H.constructor = G;
		C(H, E.prototype);
		H.isPureReactComponent = !0;
		var I = Array.isArray;
		var J = Object.prototype.hasOwnProperty;
		var K = { current: null };
		var L = {
			key: !0,
			ref: !0,
			__self: !0,
			__source: !0
		};
		function M(a, b, e) {
			var d, c = {}, k = null, h = null;
			if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
			var g = arguments.length - 2;
			if (1 === g) c.children = e;
			else if (1 < g) {
				for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
				c.children = f;
			}
			if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
			return {
				$$typeof: l,
				type: a,
				key: k,
				ref: h,
				props: c,
				_owner: K.current
			};
		}
		function N(a, b) {
			return {
				$$typeof: l,
				type: a.type,
				key: b,
				ref: a.ref,
				props: a.props,
				_owner: a._owner
			};
		}
		function O(a) {
			return "object" === typeof a && null !== a && a.$$typeof === l;
		}
		function escape(a) {
			var b = {
				"=": "=0",
				":": "=2"
			};
			return "$" + a.replace(/[=:]/g, function(a) {
				return b[a];
			});
		}
		var P = /\/+/g;
		function Q(a, b) {
			return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
		}
		function R(a, b, e, d, c) {
			var k = typeof a;
			if ("undefined" === k || "boolean" === k) a = null;
			var h = !1;
			if (null === a) h = !0;
			else switch (k) {
				case "string":
				case "number":
					h = !0;
					break;
				case "object": switch (a.$$typeof) {
					case l:
					case n: h = !0;
				}
			}
			if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a) {
				return a;
			})) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
			h = 0;
			d = "" === d ? "." : d + ":";
			if (I(a)) for (var g = 0; g < a.length; g++) {
				k = a[g];
				var f = d + Q(k, g);
				h += R(k, b, e, f, c);
			}
			else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done;) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
			else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
			return h;
		}
		function S(a, b, e) {
			if (null == a) return a;
			var d = [], c = 0;
			R(a, d, "", "", function(a) {
				return b.call(e, a, c++);
			});
			return d;
		}
		function T(a) {
			if (-1 === a._status) {
				var b = a._result;
				b = b();
				b.then(function(b) {
					if (0 === a._status || -1 === a._status) a._status = 1, a._result = b;
				}, function(b) {
					if (0 === a._status || -1 === a._status) a._status = 2, a._result = b;
				});
				-1 === a._status && (a._status = 0, a._result = b);
			}
			if (1 === a._status) return a._result.default;
			throw a._result;
		}
		var U = { current: null };
		var V = { transition: null };
		var W = {
			ReactCurrentDispatcher: U,
			ReactCurrentBatchConfig: V,
			ReactCurrentOwner: K
		};
		exports.Children = {
			map: S,
			forEach: function(a, b, e) {
				S(a, function() {
					b.apply(this, arguments);
				}, e);
			},
			count: function(a) {
				var b = 0;
				S(a, function() {
					b++;
				});
				return b;
			},
			toArray: function(a) {
				return S(a, function(a) {
					return a;
				}) || [];
			},
			only: function(a) {
				if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
				return a;
			}
		};
		exports.Component = E;
		exports.Fragment = p;
		exports.Profiler = r;
		exports.PureComponent = G;
		exports.StrictMode = q;
		exports.Suspense = w;
		exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
		exports.cloneElement = function(a, b, e) {
			if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
			var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
			if (null != b) {
				void 0 !== b.ref && (k = b.ref, h = K.current);
				void 0 !== b.key && (c = "" + b.key);
				if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
				for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
			}
			var f = arguments.length - 2;
			if (1 === f) d.children = e;
			else if (1 < f) {
				g = Array(f);
				for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
				d.children = g;
			}
			return {
				$$typeof: l,
				type: a.type,
				key: c,
				ref: k,
				props: d,
				_owner: h
			};
		};
		exports.createContext = function(a) {
			a = {
				$$typeof: u,
				_currentValue: a,
				_currentValue2: a,
				_threadCount: 0,
				Provider: null,
				Consumer: null,
				_defaultValue: null,
				_globalName: null
			};
			a.Provider = {
				$$typeof: t,
				_context: a
			};
			return a.Consumer = a;
		};
		exports.createElement = M;
		exports.createFactory = function(a) {
			var b = M.bind(null, a);
			b.type = a;
			return b;
		};
		exports.createRef = function() {
			return { current: null };
		};
		exports.forwardRef = function(a) {
			return {
				$$typeof: v,
				render: a
			};
		};
		exports.isValidElement = O;
		exports.lazy = function(a) {
			return {
				$$typeof: y,
				_payload: {
					_status: -1,
					_result: a
				},
				_init: T
			};
		};
		exports.memo = function(a, b) {
			return {
				$$typeof: x,
				type: a,
				compare: void 0 === b ? null : b
			};
		};
		exports.startTransition = function(a) {
			var b = V.transition;
			V.transition = {};
			try {
				a();
			} finally {
				V.transition = b;
			}
		};
		exports.unstable_act = function() {
			throw Error("act(...) is not supported in production builds of React.");
		};
		exports.useCallback = function(a, b) {
			return U.current.useCallback(a, b);
		};
		exports.useContext = function(a) {
			return U.current.useContext(a);
		};
		exports.useDebugValue = function() {};
		exports.useDeferredValue = function(a) {
			return U.current.useDeferredValue(a);
		};
		exports.useEffect = function(a, b) {
			return U.current.useEffect(a, b);
		};
		exports.useId = function() {
			return U.current.useId();
		};
		exports.useImperativeHandle = function(a, b, e) {
			return U.current.useImperativeHandle(a, b, e);
		};
		exports.useInsertionEffect = function(a, b) {
			return U.current.useInsertionEffect(a, b);
		};
		exports.useLayoutEffect = function(a, b) {
			return U.current.useLayoutEffect(a, b);
		};
		exports.useMemo = function(a, b) {
			return U.current.useMemo(a, b);
		};
		exports.useReducer = function(a, b, e) {
			return U.current.useReducer(a, b, e);
		};
		exports.useRef = function(a) {
			return U.current.useRef(a);
		};
		exports.useState = function(a) {
			return U.current.useState(a);
		};
		exports.useSyncExternalStore = function(a, b, e) {
			return U.current.useSyncExternalStore(a, b, e);
		};
		exports.useTransition = function() {
			return U.current.useTransition();
		};
		exports.version = "18.2.0";
	}));
	//#endregion
	//#region node_modules/.pnpm/react@18.2.0/node_modules/react/index.js
	var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = require_react_production_min();
	}));
	//#endregion
	//#region node_modules/.pnpm/scheduler@0.23.0/node_modules/scheduler/cjs/scheduler.production.min.js
	/**
	* @license React
	* scheduler.production.min.js
	*
	* Copyright (c) Facebook, Inc. and its affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var require_scheduler_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
		function f(a, b) {
			var c = a.length;
			a.push(b);
			a: for (; 0 < c;) {
				var d = c - 1 >>> 1, e = a[d];
				if (0 < g(e, b)) a[d] = b, a[c] = e, c = d;
				else break a;
			}
		}
		function h(a) {
			return 0 === a.length ? null : a[0];
		}
		function k(a) {
			if (0 === a.length) return null;
			var b = a[0], c = a.pop();
			if (c !== b) {
				a[0] = c;
				a: for (var d = 0, e = a.length, w = e >>> 1; d < w;) {
					var m = 2 * (d + 1) - 1, C = a[m], n = m + 1, x = a[n];
					if (0 > g(C, c)) n < e && 0 > g(x, C) ? (a[d] = x, a[n] = c, d = n) : (a[d] = C, a[m] = c, d = m);
					else if (n < e && 0 > g(x, c)) a[d] = x, a[n] = c, d = n;
					else break a;
				}
			}
			return b;
		}
		function g(a, b) {
			var c = a.sortIndex - b.sortIndex;
			return 0 !== c ? c : a.id - b.id;
		}
		if ("object" === typeof performance && "function" === typeof performance.now) {
			var l = performance;
			exports.unstable_now = function() {
				return l.now();
			};
		} else {
			var p = Date, q = p.now();
			exports.unstable_now = function() {
				return p.now() - q;
			};
		}
		var r = [];
		var t = [];
		var u = 1;
		var v = null;
		var y = 3;
		var z = !1;
		var A = !1;
		var B = !1;
		var D = "function" === typeof setTimeout ? setTimeout : null;
		var E = "function" === typeof clearTimeout ? clearTimeout : null;
		var F = "undefined" !== typeof setImmediate ? setImmediate : null;
		"undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
		function G(a) {
			for (var b = h(t); null !== b;) {
				if (null === b.callback) k(t);
				else if (b.startTime <= a) k(t), b.sortIndex = b.expirationTime, f(r, b);
				else break;
				b = h(t);
			}
		}
		function H(a) {
			B = !1;
			G(a);
			if (!A) if (null !== h(r)) A = !0, I(J);
			else {
				var b = h(t);
				null !== b && K(H, b.startTime - a);
			}
		}
		function J(a, b) {
			A = !1;
			B && (B = !1, E(L), L = -1);
			z = !0;
			var c = y;
			try {
				G(b);
				for (v = h(r); null !== v && (!(v.expirationTime > b) || a && !M());) {
					var d = v.callback;
					if ("function" === typeof d) {
						v.callback = null;
						y = v.priorityLevel;
						var e = d(v.expirationTime <= b);
						b = exports.unstable_now();
						"function" === typeof e ? v.callback = e : v === h(r) && k(r);
						G(b);
					} else k(r);
					v = h(r);
				}
				if (null !== v) var w = !0;
				else {
					var m = h(t);
					null !== m && K(H, m.startTime - b);
					w = !1;
				}
				return w;
			} finally {
				v = null, y = c, z = !1;
			}
		}
		var N = !1;
		var O = null;
		var L = -1;
		var P = 5;
		var Q = -1;
		function M() {
			return exports.unstable_now() - Q < P ? !1 : !0;
		}
		function R() {
			if (null !== O) {
				var a = exports.unstable_now();
				Q = a;
				var b = !0;
				try {
					b = O(!0, a);
				} finally {
					b ? S() : (N = !1, O = null);
				}
			} else N = !1;
		}
		var S;
		if ("function" === typeof F) S = function() {
			F(R);
		};
		else if ("undefined" !== typeof MessageChannel) {
			var T = new MessageChannel(), U = T.port2;
			T.port1.onmessage = R;
			S = function() {
				U.postMessage(null);
			};
		} else S = function() {
			D(R, 0);
		};
		function I(a) {
			O = a;
			N || (N = !0, S());
		}
		function K(a, b) {
			L = D(function() {
				a(exports.unstable_now());
			}, b);
		}
		exports.unstable_IdlePriority = 5;
		exports.unstable_ImmediatePriority = 1;
		exports.unstable_LowPriority = 4;
		exports.unstable_NormalPriority = 3;
		exports.unstable_Profiling = null;
		exports.unstable_UserBlockingPriority = 2;
		exports.unstable_cancelCallback = function(a) {
			a.callback = null;
		};
		exports.unstable_continueExecution = function() {
			A || z || (A = !0, I(J));
		};
		exports.unstable_forceFrameRate = function(a) {
			0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P = 0 < a ? Math.floor(1e3 / a) : 5;
		};
		exports.unstable_getCurrentPriorityLevel = function() {
			return y;
		};
		exports.unstable_getFirstCallbackNode = function() {
			return h(r);
		};
		exports.unstable_next = function(a) {
			switch (y) {
				case 1:
				case 2:
				case 3:
					var b = 3;
					break;
				default: b = y;
			}
			var c = y;
			y = b;
			try {
				return a();
			} finally {
				y = c;
			}
		};
		exports.unstable_pauseExecution = function() {};
		exports.unstable_requestPaint = function() {};
		exports.unstable_runWithPriority = function(a, b) {
			switch (a) {
				case 1:
				case 2:
				case 3:
				case 4:
				case 5: break;
				default: a = 3;
			}
			var c = y;
			y = a;
			try {
				return b();
			} finally {
				y = c;
			}
		};
		exports.unstable_scheduleCallback = function(a, b, c) {
			var d = exports.unstable_now();
			"object" === typeof c && null !== c ? (c = c.delay, c = "number" === typeof c && 0 < c ? d + c : d) : c = d;
			switch (a) {
				case 1:
					var e = -1;
					break;
				case 2:
					e = 250;
					break;
				case 5:
					e = 1073741823;
					break;
				case 4:
					e = 1e4;
					break;
				default: e = 5e3;
			}
			e = c + e;
			a = {
				id: u++,
				callback: b,
				priorityLevel: a,
				startTime: c,
				expirationTime: e,
				sortIndex: -1
			};
			c > d ? (a.sortIndex = c, f(t, a), null === h(r) && a === h(t) && (B ? (E(L), L = -1) : B = !0, K(H, c - d))) : (a.sortIndex = e, f(r, a), A || z || (A = !0, I(J)));
			return a;
		};
		exports.unstable_shouldYield = M;
		exports.unstable_wrapCallback = function(a) {
			var b = y;
			return function() {
				var c = y;
				y = b;
				try {
					return a.apply(this, arguments);
				} finally {
					y = c;
				}
			};
		};
	}));
	//#endregion
	//#region node_modules/.pnpm/scheduler@0.23.0/node_modules/scheduler/index.js
	var require_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = require_scheduler_production_min();
	}));
	//#endregion
	//#region node_modules/.pnpm/react-dom@18.2.0_react@18.2.0/node_modules/react-dom/cjs/react-dom.production.min.js
	/**
	* @license React
	* react-dom.production.min.js
	*
	* Copyright (c) Facebook, Inc. and its affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var require_react_dom_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
		var aa = require_react();
		var ca = require_scheduler();
		function p(a) {
			for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) b += "&args[]=" + encodeURIComponent(arguments[c]);
			return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
		}
		var da = /* @__PURE__ */ new Set();
		var ea = {};
		function fa(a, b) {
			ha(a, b);
			ha(a + "Capture", b);
		}
		function ha(a, b) {
			ea[a] = b;
			for (a = 0; a < b.length; a++) da.add(b[a]);
		}
		var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
		var ja = Object.prototype.hasOwnProperty;
		var ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
		var la = {};
		var ma = {};
		function oa(a) {
			if (ja.call(ma, a)) return !0;
			if (ja.call(la, a)) return !1;
			if (ka.test(a)) return ma[a] = !0;
			la[a] = !0;
			return !1;
		}
		function pa(a, b, c, d) {
			if (null !== c && 0 === c.type) return !1;
			switch (typeof b) {
				case "function":
				case "symbol": return !0;
				case "boolean":
					if (d) return !1;
					if (null !== c) return !c.acceptsBooleans;
					a = a.toLowerCase().slice(0, 5);
					return "data-" !== a && "aria-" !== a;
				default: return !1;
			}
		}
		function qa(a, b, c, d) {
			if (null === b || "undefined" === typeof b || pa(a, b, c, d)) return !0;
			if (d) return !1;
			if (null !== c) switch (c.type) {
				case 3: return !b;
				case 4: return !1 === b;
				case 5: return isNaN(b);
				case 6: return isNaN(b) || 1 > b;
			}
			return !1;
		}
		function v(a, b, c, d, e, f, g) {
			this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
			this.attributeName = d;
			this.attributeNamespace = e;
			this.mustUseProperty = c;
			this.propertyName = a;
			this.type = b;
			this.sanitizeURL = f;
			this.removeEmptyString = g;
		}
		var z = {};
		"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
			z[a] = new v(a, 0, !1, a, null, !1, !1);
		});
		[
			["acceptCharset", "accept-charset"],
			["className", "class"],
			["htmlFor", "for"],
			["httpEquiv", "http-equiv"]
		].forEach(function(a) {
			var b = a[0];
			z[b] = new v(b, 1, !1, a[1], null, !1, !1);
		});
		[
			"contentEditable",
			"draggable",
			"spellCheck",
			"value"
		].forEach(function(a) {
			z[a] = new v(a, 2, !1, a.toLowerCase(), null, !1, !1);
		});
		[
			"autoReverse",
			"externalResourcesRequired",
			"focusable",
			"preserveAlpha"
		].forEach(function(a) {
			z[a] = new v(a, 2, !1, a, null, !1, !1);
		});
		"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
			z[a] = new v(a, 3, !1, a.toLowerCase(), null, !1, !1);
		});
		[
			"checked",
			"multiple",
			"muted",
			"selected"
		].forEach(function(a) {
			z[a] = new v(a, 3, !0, a, null, !1, !1);
		});
		["capture", "download"].forEach(function(a) {
			z[a] = new v(a, 4, !1, a, null, !1, !1);
		});
		[
			"cols",
			"rows",
			"size",
			"span"
		].forEach(function(a) {
			z[a] = new v(a, 6, !1, a, null, !1, !1);
		});
		["rowSpan", "start"].forEach(function(a) {
			z[a] = new v(a, 5, !1, a.toLowerCase(), null, !1, !1);
		});
		var ra = /[\-:]([a-z])/g;
		function sa(a) {
			return a[1].toUpperCase();
		}
		"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
			var b = a.replace(ra, sa);
			z[b] = new v(b, 1, !1, a, null, !1, !1);
		});
		"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
			var b = a.replace(ra, sa);
			z[b] = new v(b, 1, !1, a, "http://www.w3.org/1999/xlink", !1, !1);
		});
		[
			"xml:base",
			"xml:lang",
			"xml:space"
		].forEach(function(a) {
			var b = a.replace(ra, sa);
			z[b] = new v(b, 1, !1, a, "http://www.w3.org/XML/1998/namespace", !1, !1);
		});
		["tabIndex", "crossOrigin"].forEach(function(a) {
			z[a] = new v(a, 1, !1, a.toLowerCase(), null, !1, !1);
		});
		z.xlinkHref = new v("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
		[
			"src",
			"href",
			"action",
			"formAction"
		].forEach(function(a) {
			z[a] = new v(a, 1, !1, a.toLowerCase(), null, !0, !0);
		});
		function ta(a, b, c, d) {
			var e = z.hasOwnProperty(b) ? z[b] : null;
			if (null !== e ? 0 !== e.type : d || !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1]) qa(b, c, e, d) && (c = null), d || null === e ? oa(b) && (null === c ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = null === c ? 3 === e.type ? !1 : "" : c : (b = e.attributeName, d = e.attributeNamespace, null === c ? a.removeAttribute(b) : (e = e.type, c = 3 === e || 4 === e && !0 === c ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c)));
		}
		var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
		var va = Symbol.for("react.element");
		var wa = Symbol.for("react.portal");
		var ya = Symbol.for("react.fragment");
		var za = Symbol.for("react.strict_mode");
		var Aa = Symbol.for("react.profiler");
		var Ba = Symbol.for("react.provider");
		var Ca = Symbol.for("react.context");
		var Da = Symbol.for("react.forward_ref");
		var Ea = Symbol.for("react.suspense");
		var Fa = Symbol.for("react.suspense_list");
		var Ga = Symbol.for("react.memo");
		var Ha = Symbol.for("react.lazy");
		var Ia = Symbol.for("react.offscreen");
		var Ja = Symbol.iterator;
		function Ka(a) {
			if (null === a || "object" !== typeof a) return null;
			a = Ja && a[Ja] || a["@@iterator"];
			return "function" === typeof a ? a : null;
		}
		var A = Object.assign;
		var La;
		function Ma(a) {
			if (void 0 === La) try {
				throw Error();
			} catch (c) {
				var b = c.stack.trim().match(/\n( *(at )?)/);
				La = b && b[1] || "";
			}
			return "\n" + La + a;
		}
		var Na = !1;
		function Oa(a, b) {
			if (!a || Na) return "";
			Na = !0;
			var c = Error.prepareStackTrace;
			Error.prepareStackTrace = void 0;
			try {
				if (b) if (b = function() {
					throw Error();
				}, Object.defineProperty(b.prototype, "props", { set: function() {
					throw Error();
				} }), "object" === typeof Reflect && Reflect.construct) {
					try {
						Reflect.construct(b, []);
					} catch (l) {
						var d = l;
					}
					Reflect.construct(a, [], b);
				} else {
					try {
						b.call();
					} catch (l) {
						d = l;
					}
					a.call(b.prototype);
				}
				else {
					try {
						throw Error();
					} catch (l) {
						d = l;
					}
					a();
				}
			} catch (l) {
				if (l && d && "string" === typeof l.stack) {
					for (var e = l.stack.split("\n"), f = d.stack.split("\n"), g = e.length - 1, h = f.length - 1; 1 <= g && 0 <= h && e[g] !== f[h];) h--;
					for (; 1 <= g && 0 <= h; g--, h--) if (e[g] !== f[h]) {
						if (1 !== g || 1 !== h) do
							if (g--, h--, 0 > h || e[g] !== f[h]) {
								var k = "\n" + e[g].replace(" at new ", " at ");
								a.displayName && k.includes("<anonymous>") && (k = k.replace("<anonymous>", a.displayName));
								return k;
							}
						while (1 <= g && 0 <= h);
						break;
					}
				}
			} finally {
				Na = !1, Error.prepareStackTrace = c;
			}
			return (a = a ? a.displayName || a.name : "") ? Ma(a) : "";
		}
		function Pa(a) {
			switch (a.tag) {
				case 5: return Ma(a.type);
				case 16: return Ma("Lazy");
				case 13: return Ma("Suspense");
				case 19: return Ma("SuspenseList");
				case 0:
				case 2:
				case 15: return a = Oa(a.type, !1), a;
				case 11: return a = Oa(a.type.render, !1), a;
				case 1: return a = Oa(a.type, !0), a;
				default: return "";
			}
		}
		function Qa(a) {
			if (null == a) return null;
			if ("function" === typeof a) return a.displayName || a.name || null;
			if ("string" === typeof a) return a;
			switch (a) {
				case ya: return "Fragment";
				case wa: return "Portal";
				case Aa: return "Profiler";
				case za: return "StrictMode";
				case Ea: return "Suspense";
				case Fa: return "SuspenseList";
			}
			if ("object" === typeof a) switch (a.$$typeof) {
				case Ca: return (a.displayName || "Context") + ".Consumer";
				case Ba: return (a._context.displayName || "Context") + ".Provider";
				case Da:
					var b = a.render;
					a = a.displayName;
					a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
					return a;
				case Ga: return b = a.displayName || null, null !== b ? b : Qa(a.type) || "Memo";
				case Ha:
					b = a._payload;
					a = a._init;
					try {
						return Qa(a(b));
					} catch (c) {}
			}
			return null;
		}
		function Ra(a) {
			var b = a.type;
			switch (a.tag) {
				case 24: return "Cache";
				case 9: return (b.displayName || "Context") + ".Consumer";
				case 10: return (b._context.displayName || "Context") + ".Provider";
				case 18: return "DehydratedFragment";
				case 11: return a = b.render, a = a.displayName || a.name || "", b.displayName || ("" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
				case 7: return "Fragment";
				case 5: return b;
				case 4: return "Portal";
				case 3: return "Root";
				case 6: return "Text";
				case 16: return Qa(b);
				case 8: return b === za ? "StrictMode" : "Mode";
				case 22: return "Offscreen";
				case 12: return "Profiler";
				case 21: return "Scope";
				case 13: return "Suspense";
				case 19: return "SuspenseList";
				case 25: return "TracingMarker";
				case 1:
				case 0:
				case 17:
				case 2:
				case 14:
				case 15:
					if ("function" === typeof b) return b.displayName || b.name || null;
					if ("string" === typeof b) return b;
			}
			return null;
		}
		function Sa(a) {
			switch (typeof a) {
				case "boolean":
				case "number":
				case "string":
				case "undefined": return a;
				case "object": return a;
				default: return "";
			}
		}
		function Ta(a) {
			var b = a.type;
			return (a = a.nodeName) && "input" === a.toLowerCase() && ("checkbox" === b || "radio" === b);
		}
		function Ua(a) {
			var b = Ta(a) ? "checked" : "value", c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = "" + a[b];
			if (!a.hasOwnProperty(b) && "undefined" !== typeof c && "function" === typeof c.get && "function" === typeof c.set) {
				var e = c.get, f = c.set;
				Object.defineProperty(a, b, {
					configurable: !0,
					get: function() {
						return e.call(this);
					},
					set: function(a) {
						d = "" + a;
						f.call(this, a);
					}
				});
				Object.defineProperty(a, b, { enumerable: c.enumerable });
				return {
					getValue: function() {
						return d;
					},
					setValue: function(a) {
						d = "" + a;
					},
					stopTracking: function() {
						a._valueTracker = null;
						delete a[b];
					}
				};
			}
		}
		function Va(a) {
			a._valueTracker || (a._valueTracker = Ua(a));
		}
		function Wa(a) {
			if (!a) return !1;
			var b = a._valueTracker;
			if (!b) return !0;
			var c = b.getValue();
			var d = "";
			a && (d = Ta(a) ? a.checked ? "true" : "false" : a.value);
			a = d;
			return a !== c ? (b.setValue(a), !0) : !1;
		}
		function Xa(a) {
			a = a || ("undefined" !== typeof document ? document : void 0);
			if ("undefined" === typeof a) return null;
			try {
				return a.activeElement || a.body;
			} catch (b) {
				return a.body;
			}
		}
		function Ya(a, b) {
			var c = b.checked;
			return A({}, b, {
				defaultChecked: void 0,
				defaultValue: void 0,
				value: void 0,
				checked: null != c ? c : a._wrapperState.initialChecked
			});
		}
		function Za(a, b) {
			var c = null == b.defaultValue ? "" : b.defaultValue, d = null != b.checked ? b.checked : b.defaultChecked;
			c = Sa(null != b.value ? b.value : c);
			a._wrapperState = {
				initialChecked: d,
				initialValue: c,
				controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value
			};
		}
		function ab(a, b) {
			b = b.checked;
			null != b && ta(a, "checked", b, !1);
		}
		function bb(a, b) {
			ab(a, b);
			var c = Sa(b.value), d = b.type;
			if (null != c) if ("number" === d) {
				if (0 === c && "" === a.value || a.value != c) a.value = "" + c;
			} else a.value !== "" + c && (a.value = "" + c);
			else if ("submit" === d || "reset" === d) {
				a.removeAttribute("value");
				return;
			}
			b.hasOwnProperty("value") ? cb(a, b.type, c) : b.hasOwnProperty("defaultValue") && cb(a, b.type, Sa(b.defaultValue));
			null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
		}
		function db(a, b, c) {
			if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
				var d = b.type;
				if (!("submit" !== d && "reset" !== d || void 0 !== b.value && null !== b.value)) return;
				b = "" + a._wrapperState.initialValue;
				c || b === a.value || (a.value = b);
				a.defaultValue = b;
			}
			c = a.name;
			"" !== c && (a.name = "");
			a.defaultChecked = !!a._wrapperState.initialChecked;
			"" !== c && (a.name = c);
		}
		function cb(a, b, c) {
			if ("number" !== b || Xa(a.ownerDocument) !== a) null == c ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
		}
		var eb = Array.isArray;
		function fb(a, b, c, d) {
			a = a.options;
			if (b) {
				b = {};
				for (var e = 0; e < c.length; e++) b["$" + c[e]] = !0;
				for (c = 0; c < a.length; c++) e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = !0);
			} else {
				c = "" + Sa(c);
				b = null;
				for (e = 0; e < a.length; e++) {
					if (a[e].value === c) {
						a[e].selected = !0;
						d && (a[e].defaultSelected = !0);
						return;
					}
					null !== b || a[e].disabled || (b = a[e]);
				}
				null !== b && (b.selected = !0);
			}
		}
		function gb(a, b) {
			if (null != b.dangerouslySetInnerHTML) throw Error(p(91));
			return A({}, b, {
				value: void 0,
				defaultValue: void 0,
				children: "" + a._wrapperState.initialValue
			});
		}
		function hb(a, b) {
			var c = b.value;
			if (null == c) {
				c = b.children;
				b = b.defaultValue;
				if (null != c) {
					if (null != b) throw Error(p(92));
					if (eb(c)) {
						if (1 < c.length) throw Error(p(93));
						c = c[0];
					}
					b = c;
				}
				b ??= "";
				c = b;
			}
			a._wrapperState = { initialValue: Sa(c) };
		}
		function ib(a, b) {
			var c = Sa(b.value), d = Sa(b.defaultValue);
			null != c && (c = "" + c, c !== a.value && (a.value = c), null == b.defaultValue && a.defaultValue !== c && (a.defaultValue = c));
			null != d && (a.defaultValue = "" + d);
		}
		function jb(a) {
			var b = a.textContent;
			b === a._wrapperState.initialValue && "" !== b && null !== b && (a.value = b);
		}
		function kb(a) {
			switch (a) {
				case "svg": return "http://www.w3.org/2000/svg";
				case "math": return "http://www.w3.org/1998/Math/MathML";
				default: return "http://www.w3.org/1999/xhtml";
			}
		}
		function lb(a, b) {
			return null == a || "http://www.w3.org/1999/xhtml" === a ? kb(b) : "http://www.w3.org/2000/svg" === a && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a;
		}
		var mb;
		var nb = function(a) {
			return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b, c, d, e) {
				MSApp.execUnsafeLocalFunction(function() {
					return a(b, c, d, e);
				});
			} : a;
		}(function(a, b) {
			if ("http://www.w3.org/2000/svg" !== a.namespaceURI || "innerHTML" in a) a.innerHTML = b;
			else {
				mb = mb || document.createElement("div");
				mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
				for (b = mb.firstChild; a.firstChild;) a.removeChild(a.firstChild);
				for (; b.firstChild;) a.appendChild(b.firstChild);
			}
		});
		function ob(a, b) {
			if (b) {
				var c = a.firstChild;
				if (c && c === a.lastChild && 3 === c.nodeType) {
					c.nodeValue = b;
					return;
				}
			}
			a.textContent = b;
		}
		var pb = {
			animationIterationCount: !0,
			aspectRatio: !0,
			borderImageOutset: !0,
			borderImageSlice: !0,
			borderImageWidth: !0,
			boxFlex: !0,
			boxFlexGroup: !0,
			boxOrdinalGroup: !0,
			columnCount: !0,
			columns: !0,
			flex: !0,
			flexGrow: !0,
			flexPositive: !0,
			flexShrink: !0,
			flexNegative: !0,
			flexOrder: !0,
			gridArea: !0,
			gridRow: !0,
			gridRowEnd: !0,
			gridRowSpan: !0,
			gridRowStart: !0,
			gridColumn: !0,
			gridColumnEnd: !0,
			gridColumnSpan: !0,
			gridColumnStart: !0,
			fontWeight: !0,
			lineClamp: !0,
			lineHeight: !0,
			opacity: !0,
			order: !0,
			orphans: !0,
			tabSize: !0,
			widows: !0,
			zIndex: !0,
			zoom: !0,
			fillOpacity: !0,
			floodOpacity: !0,
			stopOpacity: !0,
			strokeDasharray: !0,
			strokeDashoffset: !0,
			strokeMiterlimit: !0,
			strokeOpacity: !0,
			strokeWidth: !0
		};
		var qb = [
			"Webkit",
			"ms",
			"Moz",
			"O"
		];
		Object.keys(pb).forEach(function(a) {
			qb.forEach(function(b) {
				b = b + a.charAt(0).toUpperCase() + a.substring(1);
				pb[b] = pb[a];
			});
		});
		function rb(a, b, c) {
			return null == b || "boolean" === typeof b || "" === b ? "" : c || "number" !== typeof b || 0 === b || pb.hasOwnProperty(a) && pb[a] ? ("" + b).trim() : b + "px";
		}
		function sb(a, b) {
			a = a.style;
			for (var c in b) if (b.hasOwnProperty(c)) {
				var d = 0 === c.indexOf("--"), e = rb(c, b[c], d);
				"float" === c && (c = "cssFloat");
				d ? a.setProperty(c, e) : a[c] = e;
			}
		}
		var tb = A({ menuitem: !0 }, {
			area: !0,
			base: !0,
			br: !0,
			col: !0,
			embed: !0,
			hr: !0,
			img: !0,
			input: !0,
			keygen: !0,
			link: !0,
			meta: !0,
			param: !0,
			source: !0,
			track: !0,
			wbr: !0
		});
		function ub(a, b) {
			if (b) {
				if (tb[a] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(p(137, a));
				if (null != b.dangerouslySetInnerHTML) {
					if (null != b.children) throw Error(p(60));
					if ("object" !== typeof b.dangerouslySetInnerHTML || !("__html" in b.dangerouslySetInnerHTML)) throw Error(p(61));
				}
				if (null != b.style && "object" !== typeof b.style) throw Error(p(62));
			}
		}
		function vb(a, b) {
			if (-1 === a.indexOf("-")) return "string" === typeof b.is;
			switch (a) {
				case "annotation-xml":
				case "color-profile":
				case "font-face":
				case "font-face-src":
				case "font-face-uri":
				case "font-face-format":
				case "font-face-name":
				case "missing-glyph": return !1;
				default: return !0;
			}
		}
		var wb = null;
		function xb(a) {
			a = a.target || a.srcElement || window;
			a.correspondingUseElement && (a = a.correspondingUseElement);
			return 3 === a.nodeType ? a.parentNode : a;
		}
		var yb = null;
		var zb = null;
		var Ab = null;
		function Bb(a) {
			if (a = Cb(a)) {
				if ("function" !== typeof yb) throw Error(p(280));
				var b = a.stateNode;
				b && (b = Db(b), yb(a.stateNode, a.type, b));
			}
		}
		function Eb(a) {
			zb ? Ab ? Ab.push(a) : Ab = [a] : zb = a;
		}
		function Fb() {
			if (zb) {
				var a = zb, b = Ab;
				Ab = zb = null;
				Bb(a);
				if (b) for (a = 0; a < b.length; a++) Bb(b[a]);
			}
		}
		function Gb(a, b) {
			return a(b);
		}
		function Hb() {}
		var Ib = !1;
		function Jb(a, b, c) {
			if (Ib) return a(b, c);
			Ib = !0;
			try {
				return Gb(a, b, c);
			} finally {
				if (Ib = !1, null !== zb || null !== Ab) Hb(), Fb();
			}
		}
		function Kb(a, b) {
			var c = a.stateNode;
			if (null === c) return null;
			var d = Db(c);
			if (null === d) return null;
			c = d[b];
			a: switch (b) {
				case "onClick":
				case "onClickCapture":
				case "onDoubleClick":
				case "onDoubleClickCapture":
				case "onMouseDown":
				case "onMouseDownCapture":
				case "onMouseMove":
				case "onMouseMoveCapture":
				case "onMouseUp":
				case "onMouseUpCapture":
				case "onMouseEnter":
					(d = !d.disabled) || (a = a.type, d = !("button" === a || "input" === a || "select" === a || "textarea" === a));
					a = !d;
					break a;
				default: a = !1;
			}
			if (a) return null;
			if (c && "function" !== typeof c) throw Error(p(231, b, typeof c));
			return c;
		}
		var Lb = !1;
		if (ia) try {
			var Mb = {};
			Object.defineProperty(Mb, "passive", { get: function() {
				Lb = !0;
			} });
			window.addEventListener("test", Mb, Mb);
			window.removeEventListener("test", Mb, Mb);
		} catch (a) {
			Lb = !1;
		}
		function Nb(a, b, c, d, e, f, g, h, k) {
			var l = Array.prototype.slice.call(arguments, 3);
			try {
				b.apply(c, l);
			} catch (m) {
				this.onError(m);
			}
		}
		var Ob = !1;
		var Pb = null;
		var Qb = !1;
		var Rb = null;
		var Sb = { onError: function(a) {
			Ob = !0;
			Pb = a;
		} };
		function Tb(a, b, c, d, e, f, g, h, k) {
			Ob = !1;
			Pb = null;
			Nb.apply(Sb, arguments);
		}
		function Ub(a, b, c, d, e, f, g, h, k) {
			Tb.apply(this, arguments);
			if (Ob) {
				if (Ob) {
					var l = Pb;
					Ob = !1;
					Pb = null;
				} else throw Error(p(198));
				Qb || (Qb = !0, Rb = l);
			}
		}
		function Vb(a) {
			var b = a, c = a;
			if (a.alternate) for (; b.return;) b = b.return;
			else {
				a = b;
				do
					b = a, 0 !== (b.flags & 4098) && (c = b.return), a = b.return;
				while (a);
			}
			return 3 === b.tag ? c : null;
		}
		function Wb(a) {
			if (13 === a.tag) {
				var b = a.memoizedState;
				null === b && (a = a.alternate, null !== a && (b = a.memoizedState));
				if (null !== b) return b.dehydrated;
			}
			return null;
		}
		function Xb(a) {
			if (Vb(a) !== a) throw Error(p(188));
		}
		function Yb(a) {
			var b = a.alternate;
			if (!b) {
				b = Vb(a);
				if (null === b) throw Error(p(188));
				return b !== a ? null : a;
			}
			for (var c = a, d = b;;) {
				var e = c.return;
				if (null === e) break;
				var f = e.alternate;
				if (null === f) {
					d = e.return;
					if (null !== d) {
						c = d;
						continue;
					}
					break;
				}
				if (e.child === f.child) {
					for (f = e.child; f;) {
						if (f === c) return Xb(e), a;
						if (f === d) return Xb(e), b;
						f = f.sibling;
					}
					throw Error(p(188));
				}
				if (c.return !== d.return) c = e, d = f;
				else {
					for (var g = !1, h = e.child; h;) {
						if (h === c) {
							g = !0;
							c = e;
							d = f;
							break;
						}
						if (h === d) {
							g = !0;
							d = e;
							c = f;
							break;
						}
						h = h.sibling;
					}
					if (!g) {
						for (h = f.child; h;) {
							if (h === c) {
								g = !0;
								c = f;
								d = e;
								break;
							}
							if (h === d) {
								g = !0;
								d = f;
								c = e;
								break;
							}
							h = h.sibling;
						}
						if (!g) throw Error(p(189));
					}
				}
				if (c.alternate !== d) throw Error(p(190));
			}
			if (3 !== c.tag) throw Error(p(188));
			return c.stateNode.current === c ? a : b;
		}
		function Zb(a) {
			a = Yb(a);
			return null !== a ? $b(a) : null;
		}
		function $b(a) {
			if (5 === a.tag || 6 === a.tag) return a;
			for (a = a.child; null !== a;) {
				var b = $b(a);
				if (null !== b) return b;
				a = a.sibling;
			}
			return null;
		}
		var ac = ca.unstable_scheduleCallback;
		var bc = ca.unstable_cancelCallback;
		var cc = ca.unstable_shouldYield;
		var dc = ca.unstable_requestPaint;
		var B = ca.unstable_now;
		var ec = ca.unstable_getCurrentPriorityLevel;
		var fc = ca.unstable_ImmediatePriority;
		var gc = ca.unstable_UserBlockingPriority;
		var hc = ca.unstable_NormalPriority;
		var ic = ca.unstable_LowPriority;
		var jc = ca.unstable_IdlePriority;
		var kc = null;
		var lc = null;
		function mc(a) {
			if (lc && "function" === typeof lc.onCommitFiberRoot) try {
				lc.onCommitFiberRoot(kc, a, void 0, 128 === (a.current.flags & 128));
			} catch (b) {}
		}
		var oc = Math.clz32 ? Math.clz32 : nc;
		var pc = Math.log;
		var qc = Math.LN2;
		function nc(a) {
			a >>>= 0;
			return 0 === a ? 32 : 31 - (pc(a) / qc | 0) | 0;
		}
		var rc = 64;
		var sc = 4194304;
		function tc(a) {
			switch (a & -a) {
				case 1: return 1;
				case 2: return 2;
				case 4: return 4;
				case 8: return 8;
				case 16: return 16;
				case 32: return 32;
				case 64:
				case 128:
				case 256:
				case 512:
				case 1024:
				case 2048:
				case 4096:
				case 8192:
				case 16384:
				case 32768:
				case 65536:
				case 131072:
				case 262144:
				case 524288:
				case 1048576:
				case 2097152: return a & 4194240;
				case 4194304:
				case 8388608:
				case 16777216:
				case 33554432:
				case 67108864: return a & 130023424;
				case 134217728: return 134217728;
				case 268435456: return 268435456;
				case 536870912: return 536870912;
				case 1073741824: return 1073741824;
				default: return a;
			}
		}
		function uc(a, b) {
			var c = a.pendingLanes;
			if (0 === c) return 0;
			var d = 0, e = a.suspendedLanes, f = a.pingedLanes, g = c & 268435455;
			if (0 !== g) {
				var h = g & ~e;
				0 !== h ? d = tc(h) : (f &= g, 0 !== f && (d = tc(f)));
			} else g = c & ~e, 0 !== g ? d = tc(g) : 0 !== f && (d = tc(f));
			if (0 === d) return 0;
			if (0 !== b && b !== d && 0 === (b & e) && (e = d & -d, f = b & -b, e >= f || 16 === e && 0 !== (f & 4194240))) return b;
			0 !== (d & 4) && (d |= c & 16);
			b = a.entangledLanes;
			if (0 !== b) for (a = a.entanglements, b &= d; 0 < b;) c = 31 - oc(b), e = 1 << c, d |= a[c], b &= ~e;
			return d;
		}
		function vc(a, b) {
			switch (a) {
				case 1:
				case 2:
				case 4: return b + 250;
				case 8:
				case 16:
				case 32:
				case 64:
				case 128:
				case 256:
				case 512:
				case 1024:
				case 2048:
				case 4096:
				case 8192:
				case 16384:
				case 32768:
				case 65536:
				case 131072:
				case 262144:
				case 524288:
				case 1048576:
				case 2097152: return b + 5e3;
				case 4194304:
				case 8388608:
				case 16777216:
				case 33554432:
				case 67108864: return -1;
				case 134217728:
				case 268435456:
				case 536870912:
				case 1073741824: return -1;
				default: return -1;
			}
		}
		function wc(a, b) {
			for (var c = a.suspendedLanes, d = a.pingedLanes, e = a.expirationTimes, f = a.pendingLanes; 0 < f;) {
				var g = 31 - oc(f), h = 1 << g, k = e[g];
				if (-1 === k) {
					if (0 === (h & c) || 0 !== (h & d)) e[g] = vc(h, b);
				} else k <= b && (a.expiredLanes |= h);
				f &= ~h;
			}
		}
		function xc(a) {
			a = a.pendingLanes & -1073741825;
			return 0 !== a ? a : a & 1073741824 ? 1073741824 : 0;
		}
		function yc() {
			var a = rc;
			rc <<= 1;
			0 === (rc & 4194240) && (rc = 64);
			return a;
		}
		function zc(a) {
			for (var b = [], c = 0; 31 > c; c++) b.push(a);
			return b;
		}
		function Ac(a, b, c) {
			a.pendingLanes |= b;
			536870912 !== b && (a.suspendedLanes = 0, a.pingedLanes = 0);
			a = a.eventTimes;
			b = 31 - oc(b);
			a[b] = c;
		}
		function Bc(a, b) {
			var c = a.pendingLanes & ~b;
			a.pendingLanes = b;
			a.suspendedLanes = 0;
			a.pingedLanes = 0;
			a.expiredLanes &= b;
			a.mutableReadLanes &= b;
			a.entangledLanes &= b;
			b = a.entanglements;
			var d = a.eventTimes;
			for (a = a.expirationTimes; 0 < c;) {
				var e = 31 - oc(c), f = 1 << e;
				b[e] = 0;
				d[e] = -1;
				a[e] = -1;
				c &= ~f;
			}
		}
		function Cc(a, b) {
			var c = a.entangledLanes |= b;
			for (a = a.entanglements; c;) {
				var d = 31 - oc(c), e = 1 << d;
				e & b | a[d] & b && (a[d] |= b);
				c &= ~e;
			}
		}
		var C = 0;
		function Dc(a) {
			a &= -a;
			return 1 < a ? 4 < a ? 0 !== (a & 268435455) ? 16 : 536870912 : 4 : 1;
		}
		var Ec;
		var Fc;
		var Gc;
		var Hc;
		var Ic;
		var Jc = !1;
		var Kc = [];
		var Lc = null;
		var Mc = null;
		var Nc = null;
		var Oc = /* @__PURE__ */ new Map();
		var Pc = /* @__PURE__ */ new Map();
		var Qc = [];
		var Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
		function Sc(a, b) {
			switch (a) {
				case "focusin":
				case "focusout":
					Lc = null;
					break;
				case "dragenter":
				case "dragleave":
					Mc = null;
					break;
				case "mouseover":
				case "mouseout":
					Nc = null;
					break;
				case "pointerover":
				case "pointerout":
					Oc.delete(b.pointerId);
					break;
				case "gotpointercapture":
				case "lostpointercapture": Pc.delete(b.pointerId);
			}
		}
		function Tc(a, b, c, d, e, f) {
			if (null === a || a.nativeEvent !== f) return a = {
				blockedOn: b,
				domEventName: c,
				eventSystemFlags: d,
				nativeEvent: f,
				targetContainers: [e]
			}, null !== b && (b = Cb(b), null !== b && Fc(b)), a;
			a.eventSystemFlags |= d;
			b = a.targetContainers;
			null !== e && -1 === b.indexOf(e) && b.push(e);
			return a;
		}
		function Uc(a, b, c, d, e) {
			switch (b) {
				case "focusin": return Lc = Tc(Lc, a, b, c, d, e), !0;
				case "dragenter": return Mc = Tc(Mc, a, b, c, d, e), !0;
				case "mouseover": return Nc = Tc(Nc, a, b, c, d, e), !0;
				case "pointerover":
					var f = e.pointerId;
					Oc.set(f, Tc(Oc.get(f) || null, a, b, c, d, e));
					return !0;
				case "gotpointercapture": return f = e.pointerId, Pc.set(f, Tc(Pc.get(f) || null, a, b, c, d, e)), !0;
			}
			return !1;
		}
		function Vc(a) {
			var b = Wc(a.target);
			if (null !== b) {
				var c = Vb(b);
				if (null !== c) {
					if (b = c.tag, 13 === b) {
						if (b = Wb(c), null !== b) {
							a.blockedOn = b;
							Ic(a.priority, function() {
								Gc(c);
							});
							return;
						}
					} else if (3 === b && c.stateNode.current.memoizedState.isDehydrated) {
						a.blockedOn = 3 === c.tag ? c.stateNode.containerInfo : null;
						return;
					}
				}
			}
			a.blockedOn = null;
		}
		function Xc(a) {
			if (null !== a.blockedOn) return !1;
			for (var b = a.targetContainers; 0 < b.length;) {
				var c = Yc(a.domEventName, a.eventSystemFlags, b[0], a.nativeEvent);
				if (null === c) {
					c = a.nativeEvent;
					var d = new c.constructor(c.type, c);
					wb = d;
					c.target.dispatchEvent(d);
					wb = null;
				} else return b = Cb(c), null !== b && Fc(b), a.blockedOn = c, !1;
				b.shift();
			}
			return !0;
		}
		function Zc(a, b, c) {
			Xc(a) && c.delete(b);
		}
		function $c() {
			Jc = !1;
			null !== Lc && Xc(Lc) && (Lc = null);
			null !== Mc && Xc(Mc) && (Mc = null);
			null !== Nc && Xc(Nc) && (Nc = null);
			Oc.forEach(Zc);
			Pc.forEach(Zc);
		}
		function ad(a, b) {
			a.blockedOn === b && (a.blockedOn = null, Jc || (Jc = !0, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
		}
		function bd(a) {
			function b(b) {
				return ad(b, a);
			}
			if (0 < Kc.length) {
				ad(Kc[0], a);
				for (var c = 1; c < Kc.length; c++) {
					var d = Kc[c];
					d.blockedOn === a && (d.blockedOn = null);
				}
			}
			null !== Lc && ad(Lc, a);
			null !== Mc && ad(Mc, a);
			null !== Nc && ad(Nc, a);
			Oc.forEach(b);
			Pc.forEach(b);
			for (c = 0; c < Qc.length; c++) d = Qc[c], d.blockedOn === a && (d.blockedOn = null);
			for (; 0 < Qc.length && (c = Qc[0], null === c.blockedOn);) Vc(c), null === c.blockedOn && Qc.shift();
		}
		var cd = ua.ReactCurrentBatchConfig;
		var dd = !0;
		function ed(a, b, c, d) {
			var e = C, f = cd.transition;
			cd.transition = null;
			try {
				C = 1, fd(a, b, c, d);
			} finally {
				C = e, cd.transition = f;
			}
		}
		function gd(a, b, c, d) {
			var e = C, f = cd.transition;
			cd.transition = null;
			try {
				C = 4, fd(a, b, c, d);
			} finally {
				C = e, cd.transition = f;
			}
		}
		function fd(a, b, c, d) {
			if (dd) {
				var e = Yc(a, b, c, d);
				if (null === e) hd(a, b, d, id, c), Sc(a, d);
				else if (Uc(e, a, b, c, d)) d.stopPropagation();
				else if (Sc(a, d), b & 4 && -1 < Rc.indexOf(a)) {
					for (; null !== e;) {
						var f = Cb(e);
						null !== f && Ec(f);
						f = Yc(a, b, c, d);
						null === f && hd(a, b, d, id, c);
						if (f === e) break;
						e = f;
					}
					null !== e && d.stopPropagation();
				} else hd(a, b, d, null, c);
			}
		}
		var id = null;
		function Yc(a, b, c, d) {
			id = null;
			a = xb(d);
			a = Wc(a);
			if (null !== a) if (b = Vb(a), null === b) a = null;
			else if (c = b.tag, 13 === c) {
				a = Wb(b);
				if (null !== a) return a;
				a = null;
			} else if (3 === c) {
				if (b.stateNode.current.memoizedState.isDehydrated) return 3 === b.tag ? b.stateNode.containerInfo : null;
				a = null;
			} else b !== a && (a = null);
			id = a;
			return null;
		}
		function jd(a) {
			switch (a) {
				case "cancel":
				case "click":
				case "close":
				case "contextmenu":
				case "copy":
				case "cut":
				case "auxclick":
				case "dblclick":
				case "dragend":
				case "dragstart":
				case "drop":
				case "focusin":
				case "focusout":
				case "input":
				case "invalid":
				case "keydown":
				case "keypress":
				case "keyup":
				case "mousedown":
				case "mouseup":
				case "paste":
				case "pause":
				case "play":
				case "pointercancel":
				case "pointerdown":
				case "pointerup":
				case "ratechange":
				case "reset":
				case "resize":
				case "seeked":
				case "submit":
				case "touchcancel":
				case "touchend":
				case "touchstart":
				case "volumechange":
				case "change":
				case "selectionchange":
				case "textInput":
				case "compositionstart":
				case "compositionend":
				case "compositionupdate":
				case "beforeblur":
				case "afterblur":
				case "beforeinput":
				case "blur":
				case "fullscreenchange":
				case "focus":
				case "hashchange":
				case "popstate":
				case "select":
				case "selectstart": return 1;
				case "drag":
				case "dragenter":
				case "dragexit":
				case "dragleave":
				case "dragover":
				case "mousemove":
				case "mouseout":
				case "mouseover":
				case "pointermove":
				case "pointerout":
				case "pointerover":
				case "scroll":
				case "toggle":
				case "touchmove":
				case "wheel":
				case "mouseenter":
				case "mouseleave":
				case "pointerenter":
				case "pointerleave": return 4;
				case "message": switch (ec()) {
					case fc: return 1;
					case gc: return 4;
					case hc:
					case ic: return 16;
					case jc: return 536870912;
					default: return 16;
				}
				default: return 16;
			}
		}
		var kd = null;
		var ld = null;
		var md = null;
		function nd() {
			if (md) return md;
			var a, b = ld, c = b.length, d, e = "value" in kd ? kd.value : kd.textContent, f = e.length;
			for (a = 0; a < c && b[a] === e[a]; a++);
			var g = c - a;
			for (d = 1; d <= g && b[c - d] === e[f - d]; d++);
			return md = e.slice(a, 1 < d ? 1 - d : void 0);
		}
		function od(a) {
			var b = a.keyCode;
			"charCode" in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
			10 === a && (a = 13);
			return 32 <= a || 13 === a ? a : 0;
		}
		function pd() {
			return !0;
		}
		function qd() {
			return !1;
		}
		function rd(a) {
			function b(b, d, e, f, g) {
				this._reactName = b;
				this._targetInst = e;
				this.type = d;
				this.nativeEvent = f;
				this.target = g;
				this.currentTarget = null;
				for (var c in a) a.hasOwnProperty(c) && (b = a[c], this[c] = b ? b(f) : f[c]);
				this.isDefaultPrevented = (null != f.defaultPrevented ? f.defaultPrevented : !1 === f.returnValue) ? pd : qd;
				this.isPropagationStopped = qd;
				return this;
			}
			A(b.prototype, {
				preventDefault: function() {
					this.defaultPrevented = !0;
					var a = this.nativeEvent;
					a && (a.preventDefault ? a.preventDefault() : "unknown" !== typeof a.returnValue && (a.returnValue = !1), this.isDefaultPrevented = pd);
				},
				stopPropagation: function() {
					var a = this.nativeEvent;
					a && (a.stopPropagation ? a.stopPropagation() : "unknown" !== typeof a.cancelBubble && (a.cancelBubble = !0), this.isPropagationStopped = pd);
				},
				persist: function() {},
				isPersistent: pd
			});
			return b;
		}
		var sd = {
			eventPhase: 0,
			bubbles: 0,
			cancelable: 0,
			timeStamp: function(a) {
				return a.timeStamp || Date.now();
			},
			defaultPrevented: 0,
			isTrusted: 0
		};
		var td = rd(sd);
		var ud = A({}, sd, {
			view: 0,
			detail: 0
		});
		var vd = rd(ud);
		var wd;
		var xd;
		var yd;
		var Ad = A({}, ud, {
			screenX: 0,
			screenY: 0,
			clientX: 0,
			clientY: 0,
			pageX: 0,
			pageY: 0,
			ctrlKey: 0,
			shiftKey: 0,
			altKey: 0,
			metaKey: 0,
			getModifierState: zd,
			button: 0,
			buttons: 0,
			relatedTarget: function(a) {
				return void 0 === a.relatedTarget ? a.fromElement === a.srcElement ? a.toElement : a.fromElement : a.relatedTarget;
			},
			movementX: function(a) {
				if ("movementX" in a) return a.movementX;
				a !== yd && (yd && "mousemove" === a.type ? (wd = a.screenX - yd.screenX, xd = a.screenY - yd.screenY) : xd = wd = 0, yd = a);
				return wd;
			},
			movementY: function(a) {
				return "movementY" in a ? a.movementY : xd;
			}
		});
		var Bd = rd(Ad);
		var Dd = rd(A({}, Ad, { dataTransfer: 0 }));
		var Fd = rd(A({}, ud, { relatedTarget: 0 }));
		var Hd = rd(A({}, sd, {
			animationName: 0,
			elapsedTime: 0,
			pseudoElement: 0
		}));
		var Jd = rd(A({}, sd, { clipboardData: function(a) {
			return "clipboardData" in a ? a.clipboardData : window.clipboardData;
		} }));
		var Ld = rd(A({}, sd, { data: 0 }));
		var Md = {
			Esc: "Escape",
			Spacebar: " ",
			Left: "ArrowLeft",
			Up: "ArrowUp",
			Right: "ArrowRight",
			Down: "ArrowDown",
			Del: "Delete",
			Win: "OS",
			Menu: "ContextMenu",
			Apps: "ContextMenu",
			Scroll: "ScrollLock",
			MozPrintableKey: "Unidentified"
		};
		var Nd = {
			8: "Backspace",
			9: "Tab",
			12: "Clear",
			13: "Enter",
			16: "Shift",
			17: "Control",
			18: "Alt",
			19: "Pause",
			20: "CapsLock",
			27: "Escape",
			32: " ",
			33: "PageUp",
			34: "PageDown",
			35: "End",
			36: "Home",
			37: "ArrowLeft",
			38: "ArrowUp",
			39: "ArrowRight",
			40: "ArrowDown",
			45: "Insert",
			46: "Delete",
			112: "F1",
			113: "F2",
			114: "F3",
			115: "F4",
			116: "F5",
			117: "F6",
			118: "F7",
			119: "F8",
			120: "F9",
			121: "F10",
			122: "F11",
			123: "F12",
			144: "NumLock",
			145: "ScrollLock",
			224: "Meta"
		};
		var Od = {
			Alt: "altKey",
			Control: "ctrlKey",
			Meta: "metaKey",
			Shift: "shiftKey"
		};
		function Pd(a) {
			var b = this.nativeEvent;
			return b.getModifierState ? b.getModifierState(a) : (a = Od[a]) ? !!b[a] : !1;
		}
		function zd() {
			return Pd;
		}
		var Rd = rd(A({}, ud, {
			key: function(a) {
				if (a.key) {
					var b = Md[a.key] || a.key;
					if ("Unidentified" !== b) return b;
				}
				return "keypress" === a.type ? (a = od(a), 13 === a ? "Enter" : String.fromCharCode(a)) : "keydown" === a.type || "keyup" === a.type ? Nd[a.keyCode] || "Unidentified" : "";
			},
			code: 0,
			location: 0,
			ctrlKey: 0,
			shiftKey: 0,
			altKey: 0,
			metaKey: 0,
			repeat: 0,
			locale: 0,
			getModifierState: zd,
			charCode: function(a) {
				return "keypress" === a.type ? od(a) : 0;
			},
			keyCode: function(a) {
				return "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
			},
			which: function(a) {
				return "keypress" === a.type ? od(a) : "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
			}
		}));
		var Td = rd(A({}, Ad, {
			pointerId: 0,
			width: 0,
			height: 0,
			pressure: 0,
			tangentialPressure: 0,
			tiltX: 0,
			tiltY: 0,
			twist: 0,
			pointerType: 0,
			isPrimary: 0
		}));
		var Vd = rd(A({}, ud, {
			touches: 0,
			targetTouches: 0,
			changedTouches: 0,
			altKey: 0,
			metaKey: 0,
			ctrlKey: 0,
			shiftKey: 0,
			getModifierState: zd
		}));
		var Xd = rd(A({}, sd, {
			propertyName: 0,
			elapsedTime: 0,
			pseudoElement: 0
		}));
		var Zd = rd(A({}, Ad, {
			deltaX: function(a) {
				return "deltaX" in a ? a.deltaX : "wheelDeltaX" in a ? -a.wheelDeltaX : 0;
			},
			deltaY: function(a) {
				return "deltaY" in a ? a.deltaY : "wheelDeltaY" in a ? -a.wheelDeltaY : "wheelDelta" in a ? -a.wheelDelta : 0;
			},
			deltaZ: 0,
			deltaMode: 0
		}));
		var $d = [
			9,
			13,
			27,
			32
		];
		var ae = ia && "CompositionEvent" in window;
		var be = null;
		ia && "documentMode" in document && (be = document.documentMode);
		var ce = ia && "TextEvent" in window && !be;
		var de = ia && (!ae || be && 8 < be && 11 >= be);
		var ee = String.fromCharCode(32);
		var fe = !1;
		function ge(a, b) {
			switch (a) {
				case "keyup": return -1 !== $d.indexOf(b.keyCode);
				case "keydown": return 229 !== b.keyCode;
				case "keypress":
				case "mousedown":
				case "focusout": return !0;
				default: return !1;
			}
		}
		function he(a) {
			a = a.detail;
			return "object" === typeof a && "data" in a ? a.data : null;
		}
		var ie = !1;
		function je(a, b) {
			switch (a) {
				case "compositionend": return he(b);
				case "keypress":
					if (32 !== b.which) return null;
					fe = !0;
					return ee;
				case "textInput": return a = b.data, a === ee && fe ? null : a;
				default: return null;
			}
		}
		function ke(a, b) {
			if (ie) return "compositionend" === a || !ae && ge(a, b) ? (a = nd(), md = ld = kd = null, ie = !1, a) : null;
			switch (a) {
				case "paste": return null;
				case "keypress":
					if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
						if (b.char && 1 < b.char.length) return b.char;
						if (b.which) return String.fromCharCode(b.which);
					}
					return null;
				case "compositionend": return de && "ko" !== b.locale ? null : b.data;
				default: return null;
			}
		}
		var le = {
			color: !0,
			date: !0,
			datetime: !0,
			"datetime-local": !0,
			email: !0,
			month: !0,
			number: !0,
			password: !0,
			range: !0,
			search: !0,
			tel: !0,
			text: !0,
			time: !0,
			url: !0,
			week: !0
		};
		function me(a) {
			var b = a && a.nodeName && a.nodeName.toLowerCase();
			return "input" === b ? !!le[a.type] : "textarea" === b ? !0 : !1;
		}
		function ne(a, b, c, d) {
			Eb(d);
			b = oe(b, "onChange");
			0 < b.length && (c = new td("onChange", "change", null, c, d), a.push({
				event: c,
				listeners: b
			}));
		}
		var pe = null;
		var qe = null;
		function re(a) {
			se(a, 0);
		}
		function te(a) {
			if (Wa(ue(a))) return a;
		}
		function ve(a, b) {
			if ("change" === a) return b;
		}
		var we = !1;
		if (ia) {
			var xe;
			if (ia) {
				var ye = "oninput" in document;
				if (!ye) {
					var ze = document.createElement("div");
					ze.setAttribute("oninput", "return;");
					ye = "function" === typeof ze.oninput;
				}
				xe = ye;
			} else xe = !1;
			we = xe && (!document.documentMode || 9 < document.documentMode);
		}
		function Ae() {
			pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
		}
		function Be(a) {
			if ("value" === a.propertyName && te(qe)) {
				var b = [];
				ne(b, qe, a, xb(a));
				Jb(re, b);
			}
		}
		function Ce(a, b, c) {
			"focusin" === a ? (Ae(), pe = b, qe = c, pe.attachEvent("onpropertychange", Be)) : "focusout" === a && Ae();
		}
		function De(a) {
			if ("selectionchange" === a || "keyup" === a || "keydown" === a) return te(qe);
		}
		function Ee(a, b) {
			if ("click" === a) return te(b);
		}
		function Fe(a, b) {
			if ("input" === a || "change" === a) return te(b);
		}
		function Ge(a, b) {
			return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
		}
		var He = "function" === typeof Object.is ? Object.is : Ge;
		function Ie(a, b) {
			if (He(a, b)) return !0;
			if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return !1;
			var c = Object.keys(a), d = Object.keys(b);
			if (c.length !== d.length) return !1;
			for (d = 0; d < c.length; d++) {
				var e = c[d];
				if (!ja.call(b, e) || !He(a[e], b[e])) return !1;
			}
			return !0;
		}
		function Je(a) {
			for (; a && a.firstChild;) a = a.firstChild;
			return a;
		}
		function Ke(a, b) {
			var c = Je(a);
			a = 0;
			for (var d; c;) {
				if (3 === c.nodeType) {
					d = a + c.textContent.length;
					if (a <= b && d >= b) return {
						node: c,
						offset: b - a
					};
					a = d;
				}
				a: {
					for (; c;) {
						if (c.nextSibling) {
							c = c.nextSibling;
							break a;
						}
						c = c.parentNode;
					}
					c = void 0;
				}
				c = Je(c);
			}
		}
		function Le(a, b) {
			return a && b ? a === b ? !0 : a && 3 === a.nodeType ? !1 : b && 3 === b.nodeType ? Le(a, b.parentNode) : "contains" in a ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : !1 : !1;
		}
		function Me() {
			for (var a = window, b = Xa(); b instanceof a.HTMLIFrameElement;) {
				try {
					var c = "string" === typeof b.contentWindow.location.href;
				} catch (d) {
					c = !1;
				}
				if (c) a = b.contentWindow;
				else break;
				b = Xa(a.document);
			}
			return b;
		}
		function Ne(a) {
			var b = a && a.nodeName && a.nodeName.toLowerCase();
			return b && ("input" === b && ("text" === a.type || "search" === a.type || "tel" === a.type || "url" === a.type || "password" === a.type) || "textarea" === b || "true" === a.contentEditable);
		}
		function Oe(a) {
			var b = Me(), c = a.focusedElem, d = a.selectionRange;
			if (b !== c && c && c.ownerDocument && Le(c.ownerDocument.documentElement, c)) {
				if (null !== d && Ne(c)) {
					if (b = d.start, a = d.end, void 0 === a && (a = b), "selectionStart" in c) c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
					else if (a = (b = c.ownerDocument || document) && b.defaultView || window, a.getSelection) {
						a = a.getSelection();
						var e = c.textContent.length, f = Math.min(d.start, e);
						d = void 0 === d.end ? f : Math.min(d.end, e);
						!a.extend && f > d && (e = d, d = f, f = e);
						e = Ke(c, f);
						var g = Ke(c, d);
						e && g && (1 !== a.rangeCount || a.anchorNode !== e.node || a.anchorOffset !== e.offset || a.focusNode !== g.node || a.focusOffset !== g.offset) && (b = b.createRange(), b.setStart(e.node, e.offset), a.removeAllRanges(), f > d ? (a.addRange(b), a.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), a.addRange(b)));
					}
				}
				b = [];
				for (a = c; a = a.parentNode;) 1 === a.nodeType && b.push({
					element: a,
					left: a.scrollLeft,
					top: a.scrollTop
				});
				"function" === typeof c.focus && c.focus();
				for (c = 0; c < b.length; c++) a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
			}
		}
		var Pe = ia && "documentMode" in document && 11 >= document.documentMode;
		var Qe = null;
		var Re = null;
		var Se = null;
		var Te = !1;
		function Ue(a, b, c) {
			var d = c.window === c ? c.document : 9 === c.nodeType ? c : c.ownerDocument;
			Te || null == Qe || Qe !== Xa(d) || (d = Qe, "selectionStart" in d && Ne(d) ? d = {
				start: d.selectionStart,
				end: d.selectionEnd
			} : (d = (d.ownerDocument && d.ownerDocument.defaultView || window).getSelection(), d = {
				anchorNode: d.anchorNode,
				anchorOffset: d.anchorOffset,
				focusNode: d.focusNode,
				focusOffset: d.focusOffset
			}), Se && Ie(Se, d) || (Se = d, d = oe(Re, "onSelect"), 0 < d.length && (b = new td("onSelect", "select", null, b, c), a.push({
				event: b,
				listeners: d
			}), b.target = Qe)));
		}
		function Ve(a, b) {
			var c = {};
			c[a.toLowerCase()] = b.toLowerCase();
			c["Webkit" + a] = "webkit" + b;
			c["Moz" + a] = "moz" + b;
			return c;
		}
		var We = {
			animationend: Ve("Animation", "AnimationEnd"),
			animationiteration: Ve("Animation", "AnimationIteration"),
			animationstart: Ve("Animation", "AnimationStart"),
			transitionend: Ve("Transition", "TransitionEnd")
		};
		var Xe = {};
		var Ye = {};
		ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
		function Ze(a) {
			if (Xe[a]) return Xe[a];
			if (!We[a]) return a;
			var b = We[a], c;
			for (c in b) if (b.hasOwnProperty(c) && c in Ye) return Xe[a] = b[c];
			return a;
		}
		var $e = Ze("animationend");
		var af = Ze("animationiteration");
		var bf = Ze("animationstart");
		var cf = Ze("transitionend");
		var df = /* @__PURE__ */ new Map();
		var ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
		function ff(a, b) {
			df.set(a, b);
			fa(b, [a]);
		}
		for (var gf = 0; gf < ef.length; gf++) {
			var hf = ef[gf];
			ff(hf.toLowerCase(), "on" + (hf[0].toUpperCase() + hf.slice(1)));
		}
		ff($e, "onAnimationEnd");
		ff(af, "onAnimationIteration");
		ff(bf, "onAnimationStart");
		ff("dblclick", "onDoubleClick");
		ff("focusin", "onFocus");
		ff("focusout", "onBlur");
		ff(cf, "onTransitionEnd");
		ha("onMouseEnter", ["mouseout", "mouseover"]);
		ha("onMouseLeave", ["mouseout", "mouseover"]);
		ha("onPointerEnter", ["pointerout", "pointerover"]);
		ha("onPointerLeave", ["pointerout", "pointerover"]);
		fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
		fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
		fa("onBeforeInput", [
			"compositionend",
			"keypress",
			"textInput",
			"paste"
		]);
		fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
		fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
		fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
		var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
		var mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
		function nf(a, b, c) {
			var d = a.type || "unknown-event";
			a.currentTarget = c;
			Ub(d, b, void 0, a);
			a.currentTarget = null;
		}
		function se(a, b) {
			b = 0 !== (b & 4);
			for (var c = 0; c < a.length; c++) {
				var d = a[c], e = d.event;
				d = d.listeners;
				a: {
					var f = void 0;
					if (b) for (var g = d.length - 1; 0 <= g; g--) {
						var h = d[g], k = h.instance, l = h.currentTarget;
						h = h.listener;
						if (k !== f && e.isPropagationStopped()) break a;
						nf(e, h, l);
						f = k;
					}
					else for (g = 0; g < d.length; g++) {
						h = d[g];
						k = h.instance;
						l = h.currentTarget;
						h = h.listener;
						if (k !== f && e.isPropagationStopped()) break a;
						nf(e, h, l);
						f = k;
					}
				}
			}
			if (Qb) throw a = Rb, Qb = !1, Rb = null, a;
		}
		function D(a, b) {
			var c = b[of];
			void 0 === c && (c = b[of] = /* @__PURE__ */ new Set());
			var d = a + "__bubble";
			c.has(d) || (pf(b, a, 2, !1), c.add(d));
		}
		function qf(a, b, c) {
			var d = 0;
			b && (d |= 4);
			pf(c, a, d, b);
		}
		var rf = "_reactListening" + Math.random().toString(36).slice(2);
		function sf(a) {
			if (!a[rf]) {
				a[rf] = !0;
				da.forEach(function(b) {
					"selectionchange" !== b && (mf.has(b) || qf(b, !1, a), qf(b, !0, a));
				});
				var b = 9 === a.nodeType ? a : a.ownerDocument;
				null === b || b[rf] || (b[rf] = !0, qf("selectionchange", !1, b));
			}
		}
		function pf(a, b, c, d) {
			switch (jd(b)) {
				case 1:
					var e = ed;
					break;
				case 4:
					e = gd;
					break;
				default: e = fd;
			}
			c = e.bind(null, b, c, a);
			e = void 0;
			!Lb || "touchstart" !== b && "touchmove" !== b && "wheel" !== b || (e = !0);
			d ? void 0 !== e ? a.addEventListener(b, c, {
				capture: !0,
				passive: e
			}) : a.addEventListener(b, c, !0) : void 0 !== e ? a.addEventListener(b, c, { passive: e }) : a.addEventListener(b, c, !1);
		}
		function hd(a, b, c, d, e) {
			var f = d;
			if (0 === (b & 1) && 0 === (b & 2) && null !== d) a: for (;;) {
				if (null === d) return;
				var g = d.tag;
				if (3 === g || 4 === g) {
					var h = d.stateNode.containerInfo;
					if (h === e || 8 === h.nodeType && h.parentNode === e) break;
					if (4 === g) for (g = d.return; null !== g;) {
						var k = g.tag;
						if (3 === k || 4 === k) {
							if (k = g.stateNode.containerInfo, k === e || 8 === k.nodeType && k.parentNode === e) return;
						}
						g = g.return;
					}
					for (; null !== h;) {
						g = Wc(h);
						if (null === g) return;
						k = g.tag;
						if (5 === k || 6 === k) {
							d = f = g;
							continue a;
						}
						h = h.parentNode;
					}
				}
				d = d.return;
			}
			Jb(function() {
				var d = f, e = xb(c), g = [];
				a: {
					var h = df.get(a);
					if (void 0 !== h) {
						var k = td, n = a;
						switch (a) {
							case "keypress": if (0 === od(c)) break a;
							case "keydown":
							case "keyup":
								k = Rd;
								break;
							case "focusin":
								n = "focus";
								k = Fd;
								break;
							case "focusout":
								n = "blur";
								k = Fd;
								break;
							case "beforeblur":
							case "afterblur":
								k = Fd;
								break;
							case "click": if (2 === c.button) break a;
							case "auxclick":
							case "dblclick":
							case "mousedown":
							case "mousemove":
							case "mouseup":
							case "mouseout":
							case "mouseover":
							case "contextmenu":
								k = Bd;
								break;
							case "drag":
							case "dragend":
							case "dragenter":
							case "dragexit":
							case "dragleave":
							case "dragover":
							case "dragstart":
							case "drop":
								k = Dd;
								break;
							case "touchcancel":
							case "touchend":
							case "touchmove":
							case "touchstart":
								k = Vd;
								break;
							case $e:
							case af:
							case bf:
								k = Hd;
								break;
							case cf:
								k = Xd;
								break;
							case "scroll":
								k = vd;
								break;
							case "wheel":
								k = Zd;
								break;
							case "copy":
							case "cut":
							case "paste":
								k = Jd;
								break;
							case "gotpointercapture":
							case "lostpointercapture":
							case "pointercancel":
							case "pointerdown":
							case "pointermove":
							case "pointerout":
							case "pointerover":
							case "pointerup": k = Td;
						}
						var t = 0 !== (b & 4), J = !t && "scroll" === a, x = t ? null !== h ? h + "Capture" : null : h;
						t = [];
						for (var w = d, u; null !== w;) {
							u = w;
							var F = u.stateNode;
							5 === u.tag && null !== F && (u = F, null !== x && (F = Kb(w, x), null != F && t.push(tf(w, F, u))));
							if (J) break;
							w = w.return;
						}
						0 < t.length && (h = new k(h, n, null, c, e), g.push({
							event: h,
							listeners: t
						}));
					}
				}
				if (0 === (b & 7)) {
					a: {
						h = "mouseover" === a || "pointerover" === a;
						k = "mouseout" === a || "pointerout" === a;
						if (h && c !== wb && (n = c.relatedTarget || c.fromElement) && (Wc(n) || n[uf])) break a;
						if (k || h) {
							h = e.window === e ? e : (h = e.ownerDocument) ? h.defaultView || h.parentWindow : window;
							if (k) {
								if (n = c.relatedTarget || c.toElement, k = d, n = n ? Wc(n) : null, null !== n && (J = Vb(n), n !== J || 5 !== n.tag && 6 !== n.tag)) n = null;
							} else k = null, n = d;
							if (k !== n) {
								t = Bd;
								F = "onMouseLeave";
								x = "onMouseEnter";
								w = "mouse";
								if ("pointerout" === a || "pointerover" === a) t = Td, F = "onPointerLeave", x = "onPointerEnter", w = "pointer";
								J = null == k ? h : ue(k);
								u = null == n ? h : ue(n);
								h = new t(F, w + "leave", k, c, e);
								h.target = J;
								h.relatedTarget = u;
								F = null;
								Wc(e) === d && (t = new t(x, w + "enter", n, c, e), t.target = u, t.relatedTarget = J, F = t);
								J = F;
								if (k && n) b: {
									t = k;
									x = n;
									w = 0;
									for (u = t; u; u = vf(u)) w++;
									u = 0;
									for (F = x; F; F = vf(F)) u++;
									for (; 0 < w - u;) t = vf(t), w--;
									for (; 0 < u - w;) x = vf(x), u--;
									for (; w--;) {
										if (t === x || null !== x && t === x.alternate) break b;
										t = vf(t);
										x = vf(x);
									}
									t = null;
								}
								else t = null;
								null !== k && wf(g, h, k, t, !1);
								null !== n && null !== J && wf(g, J, n, t, !0);
							}
						}
					}
					a: {
						h = d ? ue(d) : window;
						k = h.nodeName && h.nodeName.toLowerCase();
						if ("select" === k || "input" === k && "file" === h.type) var na = ve;
						else if (me(h)) if (we) na = Fe;
						else {
							na = De;
							var xa = Ce;
						}
						else (k = h.nodeName) && "input" === k.toLowerCase() && ("checkbox" === h.type || "radio" === h.type) && (na = Ee);
						if (na && (na = na(a, d))) {
							ne(g, na, c, e);
							break a;
						}
						xa && xa(a, h, d);
						"focusout" === a && (xa = h._wrapperState) && xa.controlled && "number" === h.type && cb(h, "number", h.value);
					}
					xa = d ? ue(d) : window;
					switch (a) {
						case "focusin":
							if (me(xa) || "true" === xa.contentEditable) Qe = xa, Re = d, Se = null;
							break;
						case "focusout":
							Se = Re = Qe = null;
							break;
						case "mousedown":
							Te = !0;
							break;
						case "contextmenu":
						case "mouseup":
						case "dragend":
							Te = !1;
							Ue(g, c, e);
							break;
						case "selectionchange": if (Pe) break;
						case "keydown":
						case "keyup": Ue(g, c, e);
					}
					var $a;
					if (ae) b: {
						switch (a) {
							case "compositionstart":
								var ba = "onCompositionStart";
								break b;
							case "compositionend":
								ba = "onCompositionEnd";
								break b;
							case "compositionupdate":
								ba = "onCompositionUpdate";
								break b;
						}
						ba = void 0;
					}
					else ie ? ge(a, c) && (ba = "onCompositionEnd") : "keydown" === a && 229 === c.keyCode && (ba = "onCompositionStart");
					ba && (de && "ko" !== c.locale && (ie || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie && ($a = nd()) : (kd = e, ld = "value" in kd ? kd.value : kd.textContent, ie = !0)), xa = oe(d, ba), 0 < xa.length && (ba = new Ld(ba, a, null, c, e), g.push({
						event: ba,
						listeners: xa
					}), $a ? ba.data = $a : ($a = he(c), null !== $a && (ba.data = $a))));
					if ($a = ce ? je(a, c) : ke(a, c)) d = oe(d, "onBeforeInput"), 0 < d.length && (e = new Ld("onBeforeInput", "beforeinput", null, c, e), g.push({
						event: e,
						listeners: d
					}), e.data = $a);
				}
				se(g, b);
			});
		}
		function tf(a, b, c) {
			return {
				instance: a,
				listener: b,
				currentTarget: c
			};
		}
		function oe(a, b) {
			for (var c = b + "Capture", d = []; null !== a;) {
				var e = a, f = e.stateNode;
				5 === e.tag && null !== f && (e = f, f = Kb(a, c), null != f && d.unshift(tf(a, f, e)), f = Kb(a, b), null != f && d.push(tf(a, f, e)));
				a = a.return;
			}
			return d;
		}
		function vf(a) {
			if (null === a) return null;
			do
				a = a.return;
			while (a && 5 !== a.tag);
			return a ? a : null;
		}
		function wf(a, b, c, d, e) {
			for (var f = b._reactName, g = []; null !== c && c !== d;) {
				var h = c, k = h.alternate, l = h.stateNode;
				if (null !== k && k === d) break;
				5 === h.tag && null !== l && (h = l, e ? (k = Kb(c, f), null != k && g.unshift(tf(c, k, h))) : e || (k = Kb(c, f), null != k && g.push(tf(c, k, h))));
				c = c.return;
			}
			0 !== g.length && a.push({
				event: b,
				listeners: g
			});
		}
		var xf = /\r\n?/g;
		var yf = /\u0000|\uFFFD/g;
		function zf(a) {
			return ("string" === typeof a ? a : "" + a).replace(xf, "\n").replace(yf, "");
		}
		function Af(a, b, c) {
			b = zf(b);
			if (zf(a) !== b && c) throw Error(p(425));
		}
		function Bf() {}
		var Cf = null;
		var Df = null;
		function Ef(a, b) {
			return "textarea" === a || "noscript" === a || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
		}
		var Ff = "function" === typeof setTimeout ? setTimeout : void 0;
		var Gf = "function" === typeof clearTimeout ? clearTimeout : void 0;
		var Hf = "function" === typeof Promise ? Promise : void 0;
		var Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a) {
			return Hf.resolve(null).then(a).catch(If);
		} : Ff;
		function If(a) {
			setTimeout(function() {
				throw a;
			});
		}
		function Kf(a, b) {
			var c = b, d = 0;
			do {
				var e = c.nextSibling;
				a.removeChild(c);
				if (e && 8 === e.nodeType) if (c = e.data, "/$" === c) {
					if (0 === d) {
						a.removeChild(e);
						bd(b);
						return;
					}
					d--;
				} else "$" !== c && "$?" !== c && "$!" !== c || d++;
				c = e;
			} while (c);
			bd(b);
		}
		function Lf(a) {
			for (; null != a; a = a.nextSibling) {
				var b = a.nodeType;
				if (1 === b || 3 === b) break;
				if (8 === b) {
					b = a.data;
					if ("$" === b || "$!" === b || "$?" === b) break;
					if ("/$" === b) return null;
				}
			}
			return a;
		}
		function Mf(a) {
			a = a.previousSibling;
			for (var b = 0; a;) {
				if (8 === a.nodeType) {
					var c = a.data;
					if ("$" === c || "$!" === c || "$?" === c) {
						if (0 === b) return a;
						b--;
					} else "/$" === c && b++;
				}
				a = a.previousSibling;
			}
			return null;
		}
		var Nf = Math.random().toString(36).slice(2);
		var Of = "__reactFiber$" + Nf;
		var Pf = "__reactProps$" + Nf;
		var uf = "__reactContainer$" + Nf;
		var of = "__reactEvents$" + Nf;
		var Qf = "__reactListeners$" + Nf;
		var Rf = "__reactHandles$" + Nf;
		function Wc(a) {
			var b = a[Of];
			if (b) return b;
			for (var c = a.parentNode; c;) {
				if (b = c[uf] || c[Of]) {
					c = b.alternate;
					if (null !== b.child || null !== c && null !== c.child) for (a = Mf(a); null !== a;) {
						if (c = a[Of]) return c;
						a = Mf(a);
					}
					return b;
				}
				a = c;
				c = a.parentNode;
			}
			return null;
		}
		function Cb(a) {
			a = a[Of] || a[uf];
			return !a || 5 !== a.tag && 6 !== a.tag && 13 !== a.tag && 3 !== a.tag ? null : a;
		}
		function ue(a) {
			if (5 === a.tag || 6 === a.tag) return a.stateNode;
			throw Error(p(33));
		}
		function Db(a) {
			return a[Pf] || null;
		}
		var Sf = [];
		var Tf = -1;
		function Uf(a) {
			return { current: a };
		}
		function E(a) {
			0 > Tf || (a.current = Sf[Tf], Sf[Tf] = null, Tf--);
		}
		function G(a, b) {
			Tf++;
			Sf[Tf] = a.current;
			a.current = b;
		}
		var Vf = {};
		var H = Uf(Vf);
		var Wf = Uf(!1);
		var Xf = Vf;
		function Yf(a, b) {
			var c = a.type.contextTypes;
			if (!c) return Vf;
			var d = a.stateNode;
			if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
			var e = {}, f;
			for (f in c) e[f] = b[f];
			d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
			return e;
		}
		function Zf(a) {
			a = a.childContextTypes;
			return null !== a && void 0 !== a;
		}
		function $f() {
			E(Wf);
			E(H);
		}
		function ag(a, b, c) {
			if (H.current !== Vf) throw Error(p(168));
			G(H, b);
			G(Wf, c);
		}
		function bg(a, b, c) {
			var d = a.stateNode;
			b = b.childContextTypes;
			if ("function" !== typeof d.getChildContext) return c;
			d = d.getChildContext();
			for (var e in d) if (!(e in b)) throw Error(p(108, Ra(a) || "Unknown", e));
			return A({}, c, d);
		}
		function cg(a) {
			a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Vf;
			Xf = H.current;
			G(H, a);
			G(Wf, Wf.current);
			return !0;
		}
		function dg(a, b, c) {
			var d = a.stateNode;
			if (!d) throw Error(p(169));
			c ? (a = bg(a, b, Xf), d.__reactInternalMemoizedMergedChildContext = a, E(Wf), E(H), G(H, a)) : E(Wf);
			G(Wf, c);
		}
		var eg = null;
		var fg = !1;
		var gg = !1;
		function hg(a) {
			null === eg ? eg = [a] : eg.push(a);
		}
		function ig(a) {
			fg = !0;
			hg(a);
		}
		function jg() {
			if (!gg && null !== eg) {
				gg = !0;
				var a = 0, b = C;
				try {
					var c = eg;
					for (C = 1; a < c.length; a++) {
						var d = c[a];
						do
							d = d(!0);
						while (null !== d);
					}
					eg = null;
					fg = !1;
				} catch (e) {
					throw null !== eg && (eg = eg.slice(a + 1)), ac(fc, jg), e;
				} finally {
					C = b, gg = !1;
				}
			}
			return null;
		}
		var kg = [];
		var lg = 0;
		var mg = null;
		var ng = 0;
		var og = [];
		var pg = 0;
		var qg = null;
		var rg = 1;
		var sg = "";
		function tg(a, b) {
			kg[lg++] = ng;
			kg[lg++] = mg;
			mg = a;
			ng = b;
		}
		function ug(a, b, c) {
			og[pg++] = rg;
			og[pg++] = sg;
			og[pg++] = qg;
			qg = a;
			var d = rg;
			a = sg;
			var e = 32 - oc(d) - 1;
			d &= ~(1 << e);
			c += 1;
			var f = 32 - oc(b) + e;
			if (30 < f) {
				var g = e - e % 5;
				f = (d & (1 << g) - 1).toString(32);
				d >>= g;
				e -= g;
				rg = 1 << 32 - oc(b) + e | c << e | d;
				sg = f + a;
			} else rg = 1 << f | c << e | d, sg = a;
		}
		function vg(a) {
			null !== a.return && (tg(a, 1), ug(a, 1, 0));
		}
		function wg(a) {
			for (; a === mg;) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
			for (; a === qg;) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
		}
		var xg = null;
		var yg = null;
		var I = !1;
		var zg = null;
		function Ag(a, b) {
			var c = Bg(5, null, null, 0);
			c.elementType = "DELETED";
			c.stateNode = b;
			c.return = a;
			b = a.deletions;
			null === b ? (a.deletions = [c], a.flags |= 16) : b.push(c);
		}
		function Cg(a, b) {
			switch (a.tag) {
				case 5:
					var c = a.type;
					b = 1 !== b.nodeType || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
					return null !== b ? (a.stateNode = b, xg = a, yg = Lf(b.firstChild), !0) : !1;
				case 6: return b = "" === a.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a.stateNode = b, xg = a, yg = null, !0) : !1;
				case 13: return b = 8 !== b.nodeType ? null : b, null !== b ? (c = null !== qg ? {
					id: rg,
					overflow: sg
				} : null, a.memoizedState = {
					dehydrated: b,
					treeContext: c,
					retryLane: 1073741824
				}, c = Bg(18, null, null, 0), c.stateNode = b, c.return = a, a.child = c, xg = a, yg = null, !0) : !1;
				default: return !1;
			}
		}
		function Dg(a) {
			return 0 !== (a.mode & 1) && 0 === (a.flags & 128);
		}
		function Eg(a) {
			if (I) {
				var b = yg;
				if (b) {
					var c = b;
					if (!Cg(a, b)) {
						if (Dg(a)) throw Error(p(418));
						b = Lf(c.nextSibling);
						var d = xg;
						b && Cg(a, b) ? Ag(d, c) : (a.flags = a.flags & -4097 | 2, I = !1, xg = a);
					}
				} else {
					if (Dg(a)) throw Error(p(418));
					a.flags = a.flags & -4097 | 2;
					I = !1;
					xg = a;
				}
			}
		}
		function Fg(a) {
			for (a = a.return; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag;) a = a.return;
			xg = a;
		}
		function Gg(a) {
			if (a !== xg) return !1;
			if (!I) return Fg(a), I = !0, !1;
			var b;
			(b = 3 !== a.tag) && !(b = 5 !== a.tag) && (b = a.type, b = "head" !== b && "body" !== b && !Ef(a.type, a.memoizedProps));
			if (b && (b = yg)) {
				if (Dg(a)) throw Hg(), Error(p(418));
				for (; b;) Ag(a, b), b = Lf(b.nextSibling);
			}
			Fg(a);
			if (13 === a.tag) {
				a = a.memoizedState;
				a = null !== a ? a.dehydrated : null;
				if (!a) throw Error(p(317));
				a: {
					a = a.nextSibling;
					for (b = 0; a;) {
						if (8 === a.nodeType) {
							var c = a.data;
							if ("/$" === c) {
								if (0 === b) {
									yg = Lf(a.nextSibling);
									break a;
								}
								b--;
							} else "$" !== c && "$!" !== c && "$?" !== c || b++;
						}
						a = a.nextSibling;
					}
					yg = null;
				}
			} else yg = xg ? Lf(a.stateNode.nextSibling) : null;
			return !0;
		}
		function Hg() {
			for (var a = yg; a;) a = Lf(a.nextSibling);
		}
		function Ig() {
			yg = xg = null;
			I = !1;
		}
		function Jg(a) {
			null === zg ? zg = [a] : zg.push(a);
		}
		var Kg = ua.ReactCurrentBatchConfig;
		function Lg(a, b) {
			if (a && a.defaultProps) {
				b = A({}, b);
				a = a.defaultProps;
				for (var c in a) void 0 === b[c] && (b[c] = a[c]);
				return b;
			}
			return b;
		}
		var Mg = Uf(null);
		var Ng = null;
		var Og = null;
		var Pg = null;
		function Qg() {
			Pg = Og = Ng = null;
		}
		function Rg(a) {
			var b = Mg.current;
			E(Mg);
			a._currentValue = b;
		}
		function Sg(a, b, c) {
			for (; null !== a;) {
				var d = a.alternate;
				(a.childLanes & b) !== b ? (a.childLanes |= b, null !== d && (d.childLanes |= b)) : null !== d && (d.childLanes & b) !== b && (d.childLanes |= b);
				if (a === c) break;
				a = a.return;
			}
		}
		function Tg(a, b) {
			Ng = a;
			Pg = Og = null;
			a = a.dependencies;
			null !== a && null !== a.firstContext && (0 !== (a.lanes & b) && (Ug = !0), a.firstContext = null);
		}
		function Vg(a) {
			var b = a._currentValue;
			if (Pg !== a) if (a = {
				context: a,
				memoizedValue: b,
				next: null
			}, null === Og) {
				if (null === Ng) throw Error(p(308));
				Og = a;
				Ng.dependencies = {
					lanes: 0,
					firstContext: a
				};
			} else Og = Og.next = a;
			return b;
		}
		var Wg = null;
		function Xg(a) {
			null === Wg ? Wg = [a] : Wg.push(a);
		}
		function Yg(a, b, c, d) {
			var e = b.interleaved;
			null === e ? (c.next = c, Xg(b)) : (c.next = e.next, e.next = c);
			b.interleaved = c;
			return Zg(a, d);
		}
		function Zg(a, b) {
			a.lanes |= b;
			var c = a.alternate;
			null !== c && (c.lanes |= b);
			c = a;
			for (a = a.return; null !== a;) a.childLanes |= b, c = a.alternate, null !== c && (c.childLanes |= b), c = a, a = a.return;
			return 3 === c.tag ? c.stateNode : null;
		}
		var $g = !1;
		function ah(a) {
			a.updateQueue = {
				baseState: a.memoizedState,
				firstBaseUpdate: null,
				lastBaseUpdate: null,
				shared: {
					pending: null,
					interleaved: null,
					lanes: 0
				},
				effects: null
			};
		}
		function bh(a, b) {
			a = a.updateQueue;
			b.updateQueue === a && (b.updateQueue = {
				baseState: a.baseState,
				firstBaseUpdate: a.firstBaseUpdate,
				lastBaseUpdate: a.lastBaseUpdate,
				shared: a.shared,
				effects: a.effects
			});
		}
		function ch(a, b) {
			return {
				eventTime: a,
				lane: b,
				tag: 0,
				payload: null,
				callback: null,
				next: null
			};
		}
		function dh(a, b, c) {
			var d = a.updateQueue;
			if (null === d) return null;
			d = d.shared;
			if (0 !== (K & 2)) {
				var e = d.pending;
				null === e ? b.next = b : (b.next = e.next, e.next = b);
				d.pending = b;
				return Zg(a, c);
			}
			e = d.interleaved;
			null === e ? (b.next = b, Xg(d)) : (b.next = e.next, e.next = b);
			d.interleaved = b;
			return Zg(a, c);
		}
		function eh(a, b, c) {
			b = b.updateQueue;
			if (null !== b && (b = b.shared, 0 !== (c & 4194240))) {
				var d = b.lanes;
				d &= a.pendingLanes;
				c |= d;
				b.lanes = c;
				Cc(a, c);
			}
		}
		function fh(a, b) {
			var c = a.updateQueue, d = a.alternate;
			if (null !== d && (d = d.updateQueue, c === d)) {
				var e = null, f = null;
				c = c.firstBaseUpdate;
				if (null !== c) {
					do {
						var g = {
							eventTime: c.eventTime,
							lane: c.lane,
							tag: c.tag,
							payload: c.payload,
							callback: c.callback,
							next: null
						};
						null === f ? e = f = g : f = f.next = g;
						c = c.next;
					} while (null !== c);
					null === f ? e = f = b : f = f.next = b;
				} else e = f = b;
				c = {
					baseState: d.baseState,
					firstBaseUpdate: e,
					lastBaseUpdate: f,
					shared: d.shared,
					effects: d.effects
				};
				a.updateQueue = c;
				return;
			}
			a = c.lastBaseUpdate;
			null === a ? c.firstBaseUpdate = b : a.next = b;
			c.lastBaseUpdate = b;
		}
		function gh(a, b, c, d) {
			var e = a.updateQueue;
			$g = !1;
			var f = e.firstBaseUpdate, g = e.lastBaseUpdate, h = e.shared.pending;
			if (null !== h) {
				e.shared.pending = null;
				var k = h, l = k.next;
				k.next = null;
				null === g ? f = l : g.next = l;
				g = k;
				var m = a.alternate;
				null !== m && (m = m.updateQueue, h = m.lastBaseUpdate, h !== g && (null === h ? m.firstBaseUpdate = l : h.next = l, m.lastBaseUpdate = k));
			}
			if (null !== f) {
				var q = e.baseState;
				g = 0;
				m = l = k = null;
				h = f;
				do {
					var r = h.lane, y = h.eventTime;
					if ((d & r) === r) {
						null !== m && (m = m.next = {
							eventTime: y,
							lane: 0,
							tag: h.tag,
							payload: h.payload,
							callback: h.callback,
							next: null
						});
						a: {
							var n = a, t = h;
							r = b;
							y = c;
							switch (t.tag) {
								case 1:
									n = t.payload;
									if ("function" === typeof n) {
										q = n.call(y, q, r);
										break a;
									}
									q = n;
									break a;
								case 3: n.flags = n.flags & -65537 | 128;
								case 0:
									n = t.payload;
									r = "function" === typeof n ? n.call(y, q, r) : n;
									if (null === r || void 0 === r) break a;
									q = A({}, q, r);
									break a;
								case 2: $g = !0;
							}
						}
						null !== h.callback && 0 !== h.lane && (a.flags |= 64, r = e.effects, null === r ? e.effects = [h] : r.push(h));
					} else y = {
						eventTime: y,
						lane: r,
						tag: h.tag,
						payload: h.payload,
						callback: h.callback,
						next: null
					}, null === m ? (l = m = y, k = q) : m = m.next = y, g |= r;
					h = h.next;
					if (null === h) if (h = e.shared.pending, null === h) break;
					else r = h, h = r.next, r.next = null, e.lastBaseUpdate = r, e.shared.pending = null;
				} while (1);
				null === m && (k = q);
				e.baseState = k;
				e.firstBaseUpdate = l;
				e.lastBaseUpdate = m;
				b = e.shared.interleaved;
				if (null !== b) {
					e = b;
					do
						g |= e.lane, e = e.next;
					while (e !== b);
				} else null === f && (e.shared.lanes = 0);
				hh |= g;
				a.lanes = g;
				a.memoizedState = q;
			}
		}
		function ih(a, b, c) {
			a = b.effects;
			b.effects = null;
			if (null !== a) for (b = 0; b < a.length; b++) {
				var d = a[b], e = d.callback;
				if (null !== e) {
					d.callback = null;
					d = c;
					if ("function" !== typeof e) throw Error(p(191, e));
					e.call(d);
				}
			}
		}
		var jh = new aa.Component().refs;
		function kh(a, b, c, d) {
			b = a.memoizedState;
			c = c(d, b);
			c = null === c || void 0 === c ? b : A({}, b, c);
			a.memoizedState = c;
			0 === a.lanes && (a.updateQueue.baseState = c);
		}
		var nh = {
			isMounted: function(a) {
				return (a = a._reactInternals) ? Vb(a) === a : !1;
			},
			enqueueSetState: function(a, b, c) {
				a = a._reactInternals;
				var d = L(), e = lh(a), f = ch(d, e);
				f.payload = b;
				void 0 !== c && null !== c && (f.callback = c);
				b = dh(a, f, e);
				null !== b && (mh(b, a, e, d), eh(b, a, e));
			},
			enqueueReplaceState: function(a, b, c) {
				a = a._reactInternals;
				var d = L(), e = lh(a), f = ch(d, e);
				f.tag = 1;
				f.payload = b;
				void 0 !== c && null !== c && (f.callback = c);
				b = dh(a, f, e);
				null !== b && (mh(b, a, e, d), eh(b, a, e));
			},
			enqueueForceUpdate: function(a, b) {
				a = a._reactInternals;
				var c = L(), d = lh(a), e = ch(c, d);
				e.tag = 2;
				void 0 !== b && null !== b && (e.callback = b);
				b = dh(a, e, d);
				null !== b && (mh(b, a, d, c), eh(b, a, d));
			}
		};
		function oh(a, b, c, d, e, f, g) {
			a = a.stateNode;
			return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f, g) : b.prototype && b.prototype.isPureReactComponent ? !Ie(c, d) || !Ie(e, f) : !0;
		}
		function ph(a, b, c) {
			var d = !1, e = Vf;
			var f = b.contextType;
			"object" === typeof f && null !== f ? f = Vg(f) : (e = Zf(b) ? Xf : H.current, d = b.contextTypes, f = (d = null !== d && void 0 !== d) ? Yf(a, e) : Vf);
			b = new b(c, f);
			a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
			b.updater = nh;
			a.stateNode = b;
			b._reactInternals = a;
			d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f);
			return b;
		}
		function qh(a, b, c, d) {
			a = b.state;
			"function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
			"function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
			b.state !== a && nh.enqueueReplaceState(b, b.state, null);
		}
		function rh(a, b, c, d) {
			var e = a.stateNode;
			e.props = c;
			e.state = a.memoizedState;
			e.refs = jh;
			ah(a);
			var f = b.contextType;
			"object" === typeof f && null !== f ? e.context = Vg(f) : (f = Zf(b) ? Xf : H.current, e.context = Yf(a, f));
			e.state = a.memoizedState;
			f = b.getDerivedStateFromProps;
			"function" === typeof f && (kh(a, b, f, c), e.state = a.memoizedState);
			"function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && nh.enqueueReplaceState(e, e.state, null), gh(a, c, e, d), e.state = a.memoizedState);
			"function" === typeof e.componentDidMount && (a.flags |= 4194308);
		}
		function sh(a, b, c) {
			a = c.ref;
			if (null !== a && "function" !== typeof a && "object" !== typeof a) {
				if (c._owner) {
					c = c._owner;
					if (c) {
						if (1 !== c.tag) throw Error(p(309));
						var d = c.stateNode;
					}
					if (!d) throw Error(p(147, a));
					var e = d, f = "" + a;
					if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f) return b.ref;
					b = function(a) {
						var b = e.refs;
						b === jh && (b = e.refs = {});
						null === a ? delete b[f] : b[f] = a;
					};
					b._stringRef = f;
					return b;
				}
				if ("string" !== typeof a) throw Error(p(284));
				if (!c._owner) throw Error(p(290, a));
			}
			return a;
		}
		function th(a, b) {
			a = Object.prototype.toString.call(b);
			throw Error(p(31, "[object Object]" === a ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
		}
		function uh(a) {
			var b = a._init;
			return b(a._payload);
		}
		function vh(a) {
			function b(b, c) {
				if (a) {
					var d = b.deletions;
					null === d ? (b.deletions = [c], b.flags |= 16) : d.push(c);
				}
			}
			function c(c, d) {
				if (!a) return null;
				for (; null !== d;) b(c, d), d = d.sibling;
				return null;
			}
			function d(a, b) {
				for (a = /* @__PURE__ */ new Map(); null !== b;) null !== b.key ? a.set(b.key, b) : a.set(b.index, b), b = b.sibling;
				return a;
			}
			function e(a, b) {
				a = wh(a, b);
				a.index = 0;
				a.sibling = null;
				return a;
			}
			function f(b, c, d) {
				b.index = d;
				if (!a) return b.flags |= 1048576, c;
				d = b.alternate;
				if (null !== d) return d = d.index, d < c ? (b.flags |= 2, c) : d;
				b.flags |= 2;
				return c;
			}
			function g(b) {
				a && null === b.alternate && (b.flags |= 2);
				return b;
			}
			function h(a, b, c, d) {
				if (null === b || 6 !== b.tag) return b = xh(c, a.mode, d), b.return = a, b;
				b = e(b, c);
				b.return = a;
				return b;
			}
			function k(a, b, c, d) {
				var f = c.type;
				if (f === ya) return m(a, b, c.props.children, d, c.key);
				if (null !== b && (b.elementType === f || "object" === typeof f && null !== f && f.$$typeof === Ha && uh(f) === b.type)) return d = e(b, c.props), d.ref = sh(a, b, c), d.return = a, d;
				d = yh(c.type, c.key, c.props, null, a.mode, d);
				d.ref = sh(a, b, c);
				d.return = a;
				return d;
			}
			function l(a, b, c, d) {
				if (null === b || 4 !== b.tag || b.stateNode.containerInfo !== c.containerInfo || b.stateNode.implementation !== c.implementation) return b = zh(c, a.mode, d), b.return = a, b;
				b = e(b, c.children || []);
				b.return = a;
				return b;
			}
			function m(a, b, c, d, f) {
				if (null === b || 7 !== b.tag) return b = Ah(c, a.mode, d, f), b.return = a, b;
				b = e(b, c);
				b.return = a;
				return b;
			}
			function q(a, b, c) {
				if ("string" === typeof b && "" !== b || "number" === typeof b) return b = xh("" + b, a.mode, c), b.return = a, b;
				if ("object" === typeof b && null !== b) {
					switch (b.$$typeof) {
						case va: return c = yh(b.type, b.key, b.props, null, a.mode, c), c.ref = sh(a, null, b), c.return = a, c;
						case wa: return b = zh(b, a.mode, c), b.return = a, b;
						case Ha:
							var d = b._init;
							return q(a, d(b._payload), c);
					}
					if (eb(b) || Ka(b)) return b = Ah(b, a.mode, c, null), b.return = a, b;
					th(a, b);
				}
				return null;
			}
			function r(a, b, c, d) {
				var e = null !== b ? b.key : null;
				if ("string" === typeof c && "" !== c || "number" === typeof c) return null !== e ? null : h(a, b, "" + c, d);
				if ("object" === typeof c && null !== c) {
					switch (c.$$typeof) {
						case va: return c.key === e ? k(a, b, c, d) : null;
						case wa: return c.key === e ? l(a, b, c, d) : null;
						case Ha: return e = c._init, r(a, b, e(c._payload), d);
					}
					if (eb(c) || Ka(c)) return null !== e ? null : m(a, b, c, d, null);
					th(a, c);
				}
				return null;
			}
			function y(a, b, c, d, e) {
				if ("string" === typeof d && "" !== d || "number" === typeof d) return a = a.get(c) || null, h(b, a, "" + d, e);
				if ("object" === typeof d && null !== d) {
					switch (d.$$typeof) {
						case va: return a = a.get(null === d.key ? c : d.key) || null, k(b, a, d, e);
						case wa: return a = a.get(null === d.key ? c : d.key) || null, l(b, a, d, e);
						case Ha:
							var f = d._init;
							return y(a, b, c, f(d._payload), e);
					}
					if (eb(d) || Ka(d)) return a = a.get(c) || null, m(b, a, d, e, null);
					th(b, d);
				}
				return null;
			}
			function n(e, g, h, k) {
				for (var l = null, m = null, u = g, w = g = 0, x = null; null !== u && w < h.length; w++) {
					u.index > w ? (x = u, u = null) : x = u.sibling;
					var n = r(e, u, h[w], k);
					if (null === n) {
						null === u && (u = x);
						break;
					}
					a && u && null === n.alternate && b(e, u);
					g = f(n, g, w);
					null === m ? l = n : m.sibling = n;
					m = n;
					u = x;
				}
				if (w === h.length) return c(e, u), I && tg(e, w), l;
				if (null === u) {
					for (; w < h.length; w++) u = q(e, h[w], k), null !== u && (g = f(u, g, w), null === m ? l = u : m.sibling = u, m = u);
					I && tg(e, w);
					return l;
				}
				for (u = d(e, u); w < h.length; w++) x = y(u, e, w, h[w], k), null !== x && (a && null !== x.alternate && u.delete(null === x.key ? w : x.key), g = f(x, g, w), null === m ? l = x : m.sibling = x, m = x);
				a && u.forEach(function(a) {
					return b(e, a);
				});
				I && tg(e, w);
				return l;
			}
			function t(e, g, h, k) {
				var l = Ka(h);
				if ("function" !== typeof l) throw Error(p(150));
				h = l.call(h);
				if (null == h) throw Error(p(151));
				for (var u = l = null, m = g, w = g = 0, x = null, n = h.next(); null !== m && !n.done; w++, n = h.next()) {
					m.index > w ? (x = m, m = null) : x = m.sibling;
					var t = r(e, m, n.value, k);
					if (null === t) {
						null === m && (m = x);
						break;
					}
					a && m && null === t.alternate && b(e, m);
					g = f(t, g, w);
					null === u ? l = t : u.sibling = t;
					u = t;
					m = x;
				}
				if (n.done) return c(e, m), I && tg(e, w), l;
				if (null === m) {
					for (; !n.done; w++, n = h.next()) n = q(e, n.value, k), null !== n && (g = f(n, g, w), null === u ? l = n : u.sibling = n, u = n);
					I && tg(e, w);
					return l;
				}
				for (m = d(e, m); !n.done; w++, n = h.next()) n = y(m, e, w, n.value, k), null !== n && (a && null !== n.alternate && m.delete(null === n.key ? w : n.key), g = f(n, g, w), null === u ? l = n : u.sibling = n, u = n);
				a && m.forEach(function(a) {
					return b(e, a);
				});
				I && tg(e, w);
				return l;
			}
			function J(a, d, f, h) {
				"object" === typeof f && null !== f && f.type === ya && null === f.key && (f = f.props.children);
				if ("object" === typeof f && null !== f) {
					switch (f.$$typeof) {
						case va:
							a: {
								for (var k = f.key, l = d; null !== l;) {
									if (l.key === k) {
										k = f.type;
										if (k === ya) {
											if (7 === l.tag) {
												c(a, l.sibling);
												d = e(l, f.props.children);
												d.return = a;
												a = d;
												break a;
											}
										} else if (l.elementType === k || "object" === typeof k && null !== k && k.$$typeof === Ha && uh(k) === l.type) {
											c(a, l.sibling);
											d = e(l, f.props);
											d.ref = sh(a, l, f);
											d.return = a;
											a = d;
											break a;
										}
										c(a, l);
										break;
									} else b(a, l);
									l = l.sibling;
								}
								f.type === ya ? (d = Ah(f.props.children, a.mode, h, f.key), d.return = a, a = d) : (h = yh(f.type, f.key, f.props, null, a.mode, h), h.ref = sh(a, d, f), h.return = a, a = h);
							}
							return g(a);
						case wa:
							a: {
								for (l = f.key; null !== d;) {
									if (d.key === l) if (4 === d.tag && d.stateNode.containerInfo === f.containerInfo && d.stateNode.implementation === f.implementation) {
										c(a, d.sibling);
										d = e(d, f.children || []);
										d.return = a;
										a = d;
										break a;
									} else {
										c(a, d);
										break;
									}
									else b(a, d);
									d = d.sibling;
								}
								d = zh(f, a.mode, h);
								d.return = a;
								a = d;
							}
							return g(a);
						case Ha: return l = f._init, J(a, d, l(f._payload), h);
					}
					if (eb(f)) return n(a, d, f, h);
					if (Ka(f)) return t(a, d, f, h);
					th(a, f);
				}
				return "string" === typeof f && "" !== f || "number" === typeof f ? (f = "" + f, null !== d && 6 === d.tag ? (c(a, d.sibling), d = e(d, f), d.return = a, a = d) : (c(a, d), d = xh(f, a.mode, h), d.return = a, a = d), g(a)) : c(a, d);
			}
			return J;
		}
		var Bh = vh(!0);
		var Ch = vh(!1);
		var Dh = {};
		var Eh = Uf(Dh);
		var Fh = Uf(Dh);
		var Gh = Uf(Dh);
		function Hh(a) {
			if (a === Dh) throw Error(p(174));
			return a;
		}
		function Ih(a, b) {
			G(Gh, b);
			G(Fh, a);
			G(Eh, Dh);
			a = b.nodeType;
			switch (a) {
				case 9:
				case 11:
					b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
					break;
				default: a = 8 === a ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = lb(b, a);
			}
			E(Eh);
			G(Eh, b);
		}
		function Jh() {
			E(Eh);
			E(Fh);
			E(Gh);
		}
		function Kh(a) {
			Hh(Gh.current);
			var b = Hh(Eh.current);
			var c = lb(b, a.type);
			b !== c && (G(Fh, a), G(Eh, c));
		}
		function Lh(a) {
			Fh.current === a && (E(Eh), E(Fh));
		}
		var M = Uf(0);
		function Mh(a) {
			for (var b = a; null !== b;) {
				if (13 === b.tag) {
					var c = b.memoizedState;
					if (null !== c && (c = c.dehydrated, null === c || "$?" === c.data || "$!" === c.data)) return b;
				} else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
					if (0 !== (b.flags & 128)) return b;
				} else if (null !== b.child) {
					b.child.return = b;
					b = b.child;
					continue;
				}
				if (b === a) break;
				for (; null === b.sibling;) {
					if (null === b.return || b.return === a) return null;
					b = b.return;
				}
				b.sibling.return = b.return;
				b = b.sibling;
			}
			return null;
		}
		var Nh = [];
		function Oh() {
			for (var a = 0; a < Nh.length; a++) Nh[a]._workInProgressVersionPrimary = null;
			Nh.length = 0;
		}
		var Ph = ua.ReactCurrentDispatcher;
		var Qh = ua.ReactCurrentBatchConfig;
		var Rh = 0;
		var N = null;
		var O = null;
		var P = null;
		var Sh = !1;
		var Th = !1;
		var Uh = 0;
		var Vh = 0;
		function Q() {
			throw Error(p(321));
		}
		function Wh(a, b) {
			if (null === b) return !1;
			for (var c = 0; c < b.length && c < a.length; c++) if (!He(a[c], b[c])) return !1;
			return !0;
		}
		function Xh(a, b, c, d, e, f) {
			Rh = f;
			N = b;
			b.memoizedState = null;
			b.updateQueue = null;
			b.lanes = 0;
			Ph.current = null === a || null === a.memoizedState ? Yh : Zh;
			a = c(d, e);
			if (Th) {
				f = 0;
				do {
					Th = !1;
					Uh = 0;
					if (25 <= f) throw Error(p(301));
					f += 1;
					P = O = null;
					b.updateQueue = null;
					Ph.current = $h;
					a = c(d, e);
				} while (Th);
			}
			Ph.current = ai;
			b = null !== O && null !== O.next;
			Rh = 0;
			P = O = N = null;
			Sh = !1;
			if (b) throw Error(p(300));
			return a;
		}
		function bi() {
			var a = 0 !== Uh;
			Uh = 0;
			return a;
		}
		function ci() {
			var a = {
				memoizedState: null,
				baseState: null,
				baseQueue: null,
				queue: null,
				next: null
			};
			null === P ? N.memoizedState = P = a : P = P.next = a;
			return P;
		}
		function di() {
			if (null === O) {
				var a = N.alternate;
				a = null !== a ? a.memoizedState : null;
			} else a = O.next;
			var b = null === P ? N.memoizedState : P.next;
			if (null !== b) P = b, O = a;
			else {
				if (null === a) throw Error(p(310));
				O = a;
				a = {
					memoizedState: O.memoizedState,
					baseState: O.baseState,
					baseQueue: O.baseQueue,
					queue: O.queue,
					next: null
				};
				null === P ? N.memoizedState = P = a : P = P.next = a;
			}
			return P;
		}
		function ei(a, b) {
			return "function" === typeof b ? b(a) : b;
		}
		function fi(a) {
			var b = di(), c = b.queue;
			if (null === c) throw Error(p(311));
			c.lastRenderedReducer = a;
			var d = O, e = d.baseQueue, f = c.pending;
			if (null !== f) {
				if (null !== e) {
					var g = e.next;
					e.next = f.next;
					f.next = g;
				}
				d.baseQueue = e = f;
				c.pending = null;
			}
			if (null !== e) {
				f = e.next;
				d = d.baseState;
				var h = g = null, k = null, l = f;
				do {
					var m = l.lane;
					if ((Rh & m) === m) null !== k && (k = k.next = {
						lane: 0,
						action: l.action,
						hasEagerState: l.hasEagerState,
						eagerState: l.eagerState,
						next: null
					}), d = l.hasEagerState ? l.eagerState : a(d, l.action);
					else {
						var q = {
							lane: m,
							action: l.action,
							hasEagerState: l.hasEagerState,
							eagerState: l.eagerState,
							next: null
						};
						null === k ? (h = k = q, g = d) : k = k.next = q;
						N.lanes |= m;
						hh |= m;
					}
					l = l.next;
				} while (null !== l && l !== f);
				null === k ? g = d : k.next = h;
				He(d, b.memoizedState) || (Ug = !0);
				b.memoizedState = d;
				b.baseState = g;
				b.baseQueue = k;
				c.lastRenderedState = d;
			}
			a = c.interleaved;
			if (null !== a) {
				e = a;
				do
					f = e.lane, N.lanes |= f, hh |= f, e = e.next;
				while (e !== a);
			} else null === e && (c.lanes = 0);
			return [b.memoizedState, c.dispatch];
		}
		function gi(a) {
			var b = di(), c = b.queue;
			if (null === c) throw Error(p(311));
			c.lastRenderedReducer = a;
			var d = c.dispatch, e = c.pending, f = b.memoizedState;
			if (null !== e) {
				c.pending = null;
				var g = e = e.next;
				do
					f = a(f, g.action), g = g.next;
				while (g !== e);
				He(f, b.memoizedState) || (Ug = !0);
				b.memoizedState = f;
				null === b.baseQueue && (b.baseState = f);
				c.lastRenderedState = f;
			}
			return [f, d];
		}
		function hi() {}
		function ii(a, b) {
			var c = N, d = di(), e = b(), f = !He(d.memoizedState, e);
			f && (d.memoizedState = e, Ug = !0);
			d = d.queue;
			ji(ki.bind(null, c, d, a), [a]);
			if (d.getSnapshot !== b || f || null !== P && P.memoizedState.tag & 1) {
				c.flags |= 2048;
				li(9, mi.bind(null, c, d, e, b), void 0, null);
				if (null === R) throw Error(p(349));
				0 !== (Rh & 30) || ni(c, b, e);
			}
			return e;
		}
		function ni(a, b, c) {
			a.flags |= 16384;
			a = {
				getSnapshot: b,
				value: c
			};
			b = N.updateQueue;
			null === b ? (b = {
				lastEffect: null,
				stores: null
			}, N.updateQueue = b, b.stores = [a]) : (c = b.stores, null === c ? b.stores = [a] : c.push(a));
		}
		function mi(a, b, c, d) {
			b.value = c;
			b.getSnapshot = d;
			oi(b) && pi(a);
		}
		function ki(a, b, c) {
			return c(function() {
				oi(b) && pi(a);
			});
		}
		function oi(a) {
			var b = a.getSnapshot;
			a = a.value;
			try {
				var c = b();
				return !He(a, c);
			} catch (d) {
				return !0;
			}
		}
		function pi(a) {
			var b = Zg(a, 1);
			null !== b && mh(b, a, 1, -1);
		}
		function qi(a) {
			var b = ci();
			"function" === typeof a && (a = a());
			b.memoizedState = b.baseState = a;
			a = {
				pending: null,
				interleaved: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ei,
				lastRenderedState: a
			};
			b.queue = a;
			a = a.dispatch = ri.bind(null, N, a);
			return [b.memoizedState, a];
		}
		function li(a, b, c, d) {
			a = {
				tag: a,
				create: b,
				destroy: c,
				deps: d,
				next: null
			};
			b = N.updateQueue;
			null === b ? (b = {
				lastEffect: null,
				stores: null
			}, N.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
			return a;
		}
		function si() {
			return di().memoizedState;
		}
		function ti(a, b, c, d) {
			var e = ci();
			N.flags |= a;
			e.memoizedState = li(1 | b, c, void 0, void 0 === d ? null : d);
		}
		function ui(a, b, c, d) {
			var e = di();
			d = void 0 === d ? null : d;
			var f = void 0;
			if (null !== O) {
				var g = O.memoizedState;
				f = g.destroy;
				if (null !== d && Wh(d, g.deps)) {
					e.memoizedState = li(b, c, f, d);
					return;
				}
			}
			N.flags |= a;
			e.memoizedState = li(1 | b, c, f, d);
		}
		function vi(a, b) {
			return ti(8390656, 8, a, b);
		}
		function ji(a, b) {
			return ui(2048, 8, a, b);
		}
		function wi(a, b) {
			return ui(4, 2, a, b);
		}
		function xi(a, b) {
			return ui(4, 4, a, b);
		}
		function yi(a, b) {
			if ("function" === typeof b) return a = a(), b(a), function() {
				b(null);
			};
			if (null !== b && void 0 !== b) return a = a(), b.current = a, function() {
				b.current = null;
			};
		}
		function zi(a, b, c) {
			c = null !== c && void 0 !== c ? c.concat([a]) : null;
			return ui(4, 4, yi.bind(null, b, a), c);
		}
		function Ai() {}
		function Bi(a, b) {
			var c = di();
			b = void 0 === b ? null : b;
			var d = c.memoizedState;
			if (null !== d && null !== b && Wh(b, d[1])) return d[0];
			c.memoizedState = [a, b];
			return a;
		}
		function Ci(a, b) {
			var c = di();
			b = void 0 === b ? null : b;
			var d = c.memoizedState;
			if (null !== d && null !== b && Wh(b, d[1])) return d[0];
			a = a();
			c.memoizedState = [a, b];
			return a;
		}
		function Di(a, b, c) {
			if (0 === (Rh & 21)) return a.baseState && (a.baseState = !1, Ug = !0), a.memoizedState = c;
			He(c, b) || (c = yc(), N.lanes |= c, hh |= c, a.baseState = !0);
			return b;
		}
		function Ei(a, b) {
			var c = C;
			C = 0 !== c && 4 > c ? c : 4;
			a(!0);
			var d = Qh.transition;
			Qh.transition = {};
			try {
				a(!1), b();
			} finally {
				C = c, Qh.transition = d;
			}
		}
		function Fi() {
			return di().memoizedState;
		}
		function Gi(a, b, c) {
			var d = lh(a);
			c = {
				lane: d,
				action: c,
				hasEagerState: !1,
				eagerState: null,
				next: null
			};
			if (Hi(a)) Ii(b, c);
			else if (c = Yg(a, b, c, d), null !== c) {
				var e = L();
				mh(c, a, d, e);
				Ji(c, b, d);
			}
		}
		function ri(a, b, c) {
			var d = lh(a), e = {
				lane: d,
				action: c,
				hasEagerState: !1,
				eagerState: null,
				next: null
			};
			if (Hi(a)) Ii(b, e);
			else {
				var f = a.alternate;
				if (0 === a.lanes && (null === f || 0 === f.lanes) && (f = b.lastRenderedReducer, null !== f)) try {
					var g = b.lastRenderedState, h = f(g, c);
					e.hasEagerState = !0;
					e.eagerState = h;
					if (He(h, g)) {
						var k = b.interleaved;
						null === k ? (e.next = e, Xg(b)) : (e.next = k.next, k.next = e);
						b.interleaved = e;
						return;
					}
				} catch (l) {}
				c = Yg(a, b, e, d);
				null !== c && (e = L(), mh(c, a, d, e), Ji(c, b, d));
			}
		}
		function Hi(a) {
			var b = a.alternate;
			return a === N || null !== b && b === N;
		}
		function Ii(a, b) {
			Th = Sh = !0;
			var c = a.pending;
			null === c ? b.next = b : (b.next = c.next, c.next = b);
			a.pending = b;
		}
		function Ji(a, b, c) {
			if (0 !== (c & 4194240)) {
				var d = b.lanes;
				d &= a.pendingLanes;
				c |= d;
				b.lanes = c;
				Cc(a, c);
			}
		}
		var ai = {
			readContext: Vg,
			useCallback: Q,
			useContext: Q,
			useEffect: Q,
			useImperativeHandle: Q,
			useInsertionEffect: Q,
			useLayoutEffect: Q,
			useMemo: Q,
			useReducer: Q,
			useRef: Q,
			useState: Q,
			useDebugValue: Q,
			useDeferredValue: Q,
			useTransition: Q,
			useMutableSource: Q,
			useSyncExternalStore: Q,
			useId: Q,
			unstable_isNewReconciler: !1
		};
		var Yh = {
			readContext: Vg,
			useCallback: function(a, b) {
				ci().memoizedState = [a, void 0 === b ? null : b];
				return a;
			},
			useContext: Vg,
			useEffect: vi,
			useImperativeHandle: function(a, b, c) {
				c = null !== c && void 0 !== c ? c.concat([a]) : null;
				return ti(4194308, 4, yi.bind(null, b, a), c);
			},
			useLayoutEffect: function(a, b) {
				return ti(4194308, 4, a, b);
			},
			useInsertionEffect: function(a, b) {
				return ti(4, 2, a, b);
			},
			useMemo: function(a, b) {
				var c = ci();
				b = void 0 === b ? null : b;
				a = a();
				c.memoizedState = [a, b];
				return a;
			},
			useReducer: function(a, b, c) {
				var d = ci();
				b = void 0 !== c ? c(b) : b;
				d.memoizedState = d.baseState = b;
				a = {
					pending: null,
					interleaved: null,
					lanes: 0,
					dispatch: null,
					lastRenderedReducer: a,
					lastRenderedState: b
				};
				d.queue = a;
				a = a.dispatch = Gi.bind(null, N, a);
				return [d.memoizedState, a];
			},
			useRef: function(a) {
				var b = ci();
				a = { current: a };
				return b.memoizedState = a;
			},
			useState: qi,
			useDebugValue: Ai,
			useDeferredValue: function(a) {
				return ci().memoizedState = a;
			},
			useTransition: function() {
				var a = qi(!1), b = a[0];
				a = Ei.bind(null, a[1]);
				ci().memoizedState = a;
				return [b, a];
			},
			useMutableSource: function() {},
			useSyncExternalStore: function(a, b, c) {
				var d = N, e = ci();
				if (I) {
					if (void 0 === c) throw Error(p(407));
					c = c();
				} else {
					c = b();
					if (null === R) throw Error(p(349));
					0 !== (Rh & 30) || ni(d, b, c);
				}
				e.memoizedState = c;
				var f = {
					value: c,
					getSnapshot: b
				};
				e.queue = f;
				vi(ki.bind(null, d, f, a), [a]);
				d.flags |= 2048;
				li(9, mi.bind(null, d, f, c, b), void 0, null);
				return c;
			},
			useId: function() {
				var a = ci(), b = R.identifierPrefix;
				if (I) {
					var c = sg;
					var d = rg;
					c = (d & ~(1 << 32 - oc(d) - 1)).toString(32) + c;
					b = ":" + b + "R" + c;
					c = Uh++;
					0 < c && (b += "H" + c.toString(32));
					b += ":";
				} else c = Vh++, b = ":" + b + "r" + c.toString(32) + ":";
				return a.memoizedState = b;
			},
			unstable_isNewReconciler: !1
		};
		var Zh = {
			readContext: Vg,
			useCallback: Bi,
			useContext: Vg,
			useEffect: ji,
			useImperativeHandle: zi,
			useInsertionEffect: wi,
			useLayoutEffect: xi,
			useMemo: Ci,
			useReducer: fi,
			useRef: si,
			useState: function() {
				return fi(ei);
			},
			useDebugValue: Ai,
			useDeferredValue: function(a) {
				return Di(di(), O.memoizedState, a);
			},
			useTransition: function() {
				return [fi(ei)[0], di().memoizedState];
			},
			useMutableSource: hi,
			useSyncExternalStore: ii,
			useId: Fi,
			unstable_isNewReconciler: !1
		};
		var $h = {
			readContext: Vg,
			useCallback: Bi,
			useContext: Vg,
			useEffect: ji,
			useImperativeHandle: zi,
			useInsertionEffect: wi,
			useLayoutEffect: xi,
			useMemo: Ci,
			useReducer: gi,
			useRef: si,
			useState: function() {
				return gi(ei);
			},
			useDebugValue: Ai,
			useDeferredValue: function(a) {
				var b = di();
				return null === O ? b.memoizedState = a : Di(b, O.memoizedState, a);
			},
			useTransition: function() {
				return [gi(ei)[0], di().memoizedState];
			},
			useMutableSource: hi,
			useSyncExternalStore: ii,
			useId: Fi,
			unstable_isNewReconciler: !1
		};
		function Ki(a, b) {
			try {
				var c = "", d = b;
				do
					c += Pa(d), d = d.return;
				while (d);
				var e = c;
			} catch (f) {
				e = "\nError generating stack: " + f.message + "\n" + f.stack;
			}
			return {
				value: a,
				source: b,
				stack: e,
				digest: null
			};
		}
		function Li(a, b, c) {
			return {
				value: a,
				source: null,
				stack: null != c ? c : null,
				digest: null != b ? b : null
			};
		}
		function Mi(a, b) {
			try {
				console.error(b.value);
			} catch (c) {
				setTimeout(function() {
					throw c;
				});
			}
		}
		var Ni = "function" === typeof WeakMap ? WeakMap : Map;
		function Oi(a, b, c) {
			c = ch(-1, c);
			c.tag = 3;
			c.payload = { element: null };
			var d = b.value;
			c.callback = function() {
				Pi || (Pi = !0, Qi = d);
				Mi(a, b);
			};
			return c;
		}
		function Ri(a, b, c) {
			c = ch(-1, c);
			c.tag = 3;
			var d = a.type.getDerivedStateFromError;
			if ("function" === typeof d) {
				var e = b.value;
				c.payload = function() {
					return d(e);
				};
				c.callback = function() {
					Mi(a, b);
				};
			}
			var f = a.stateNode;
			null !== f && "function" === typeof f.componentDidCatch && (c.callback = function() {
				Mi(a, b);
				"function" !== typeof d && (null === Si ? Si = /* @__PURE__ */ new Set([this]) : Si.add(this));
				var c = b.stack;
				this.componentDidCatch(b.value, { componentStack: null !== c ? c : "" });
			});
			return c;
		}
		function Ti(a, b, c) {
			var d = a.pingCache;
			if (null === d) {
				d = a.pingCache = new Ni();
				var e = /* @__PURE__ */ new Set();
				d.set(b, e);
			} else e = d.get(b), void 0 === e && (e = /* @__PURE__ */ new Set(), d.set(b, e));
			e.has(c) || (e.add(c), a = Ui.bind(null, a, b, c), b.then(a, a));
		}
		function Vi(a) {
			do {
				var b;
				if (b = 13 === a.tag) b = a.memoizedState, b = null !== b ? null !== b.dehydrated ? !0 : !1 : !0;
				if (b) return a;
				a = a.return;
			} while (null !== a);
			return null;
		}
		function Wi(a, b, c, d, e) {
			if (0 === (a.mode & 1)) return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, 1 === c.tag && (null === c.alternate ? c.tag = 17 : (b = ch(-1, 1), b.tag = 2, dh(c, b, 1))), c.lanes |= 1), a;
			a.flags |= 65536;
			a.lanes = e;
			return a;
		}
		var Xi = ua.ReactCurrentOwner;
		var Ug = !1;
		function Yi(a, b, c, d) {
			b.child = null === a ? Ch(b, null, c, d) : Bh(b, a.child, c, d);
		}
		function Zi(a, b, c, d, e) {
			c = c.render;
			var f = b.ref;
			Tg(b, e);
			d = Xh(a, b, c, d, f, e);
			c = bi();
			if (null !== a && !Ug) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, $i(a, b, e);
			I && c && vg(b);
			b.flags |= 1;
			Yi(a, b, d, e);
			return b.child;
		}
		function aj(a, b, c, d, e) {
			if (null === a) {
				var f = c.type;
				if ("function" === typeof f && !bj(f) && void 0 === f.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = f, cj(a, b, f, d, e);
				a = yh(c.type, null, d, b, b.mode, e);
				a.ref = b.ref;
				a.return = b;
				return b.child = a;
			}
			f = a.child;
			if (0 === (a.lanes & e)) {
				var g = f.memoizedProps;
				c = c.compare;
				c = null !== c ? c : Ie;
				if (c(g, d) && a.ref === b.ref) return $i(a, b, e);
			}
			b.flags |= 1;
			a = wh(f, d);
			a.ref = b.ref;
			a.return = b;
			return b.child = a;
		}
		function cj(a, b, c, d, e) {
			if (null !== a) {
				var f = a.memoizedProps;
				if (Ie(f, d) && a.ref === b.ref) if (Ug = !1, b.pendingProps = d = f, 0 !== (a.lanes & e)) 0 !== (a.flags & 131072) && (Ug = !0);
				else return b.lanes = a.lanes, $i(a, b, e);
			}
			return dj(a, b, c, d, e);
		}
		function ej(a, b, c) {
			var d = b.pendingProps, e = d.children, f = null !== a ? a.memoizedState : null;
			if ("hidden" === d.mode) if (0 === (b.mode & 1)) b.memoizedState = {
				baseLanes: 0,
				cachePool: null,
				transitions: null
			}, G(fj, gj), gj |= c;
			else {
				if (0 === (c & 1073741824)) return a = null !== f ? f.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = {
					baseLanes: a,
					cachePool: null,
					transitions: null
				}, b.updateQueue = null, G(fj, gj), gj |= a, null;
				b.memoizedState = {
					baseLanes: 0,
					cachePool: null,
					transitions: null
				};
				d = null !== f ? f.baseLanes : c;
				G(fj, gj);
				gj |= d;
			}
			else null !== f ? (d = f.baseLanes | c, b.memoizedState = null) : d = c, G(fj, gj), gj |= d;
			Yi(a, b, e, c);
			return b.child;
		}
		function hj(a, b) {
			var c = b.ref;
			if (null === a && null !== c || null !== a && a.ref !== c) b.flags |= 512, b.flags |= 2097152;
		}
		function dj(a, b, c, d, e) {
			var f = Zf(c) ? Xf : H.current;
			f = Yf(b, f);
			Tg(b, e);
			c = Xh(a, b, c, d, f, e);
			d = bi();
			if (null !== a && !Ug) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, $i(a, b, e);
			I && d && vg(b);
			b.flags |= 1;
			Yi(a, b, c, e);
			return b.child;
		}
		function ij(a, b, c, d, e) {
			if (Zf(c)) {
				var f = !0;
				cg(b);
			} else f = !1;
			Tg(b, e);
			if (null === b.stateNode) jj(a, b), ph(b, c, d), rh(b, c, d, e), d = !0;
			else if (null === a) {
				var g = b.stateNode, h = b.memoizedProps;
				g.props = h;
				var k = g.context, l = c.contextType;
				"object" === typeof l && null !== l ? l = Vg(l) : (l = Zf(c) ? Xf : H.current, l = Yf(b, l));
				var m = c.getDerivedStateFromProps, q = "function" === typeof m || "function" === typeof g.getSnapshotBeforeUpdate;
				q || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k !== l) && qh(b, g, d, l);
				$g = !1;
				var r = b.memoizedState;
				g.state = r;
				gh(b, d, g, e);
				k = b.memoizedState;
				h !== d || r !== k || Wf.current || $g ? ("function" === typeof m && (kh(b, c, m, d), k = b.memoizedState), (h = $g || oh(b, c, h, d, r, k, l)) ? (q || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k), g.props = d, g.state = k, g.context = l, d = h) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), d = !1);
			} else {
				g = b.stateNode;
				bh(a, b);
				h = b.memoizedProps;
				l = b.type === b.elementType ? h : Lg(b.type, h);
				g.props = l;
				q = b.pendingProps;
				r = g.context;
				k = c.contextType;
				"object" === typeof k && null !== k ? k = Vg(k) : (k = Zf(c) ? Xf : H.current, k = Yf(b, k));
				var y = c.getDerivedStateFromProps;
				(m = "function" === typeof y || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== q || r !== k) && qh(b, g, d, k);
				$g = !1;
				r = b.memoizedState;
				g.state = r;
				gh(b, d, g, e);
				var n = b.memoizedState;
				h !== q || r !== n || Wf.current || $g ? ("function" === typeof y && (kh(b, c, y, d), n = b.memoizedState), (l = $g || oh(b, c, l, d, r, n, k) || !1) ? (m || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, n, k), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, n, k)), "function" === typeof g.componentDidUpdate && (b.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = n), g.props = d, g.state = n, g.context = k, d = l) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 1024), d = !1);
			}
			return kj(a, b, c, d, f, e);
		}
		function kj(a, b, c, d, e, f) {
			hj(a, b);
			var g = 0 !== (b.flags & 128);
			if (!d && !g) return e && dg(b, c, !1), $i(a, b, f);
			d = b.stateNode;
			Xi.current = b;
			var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
			b.flags |= 1;
			null !== a && g ? (b.child = Bh(b, a.child, null, f), b.child = Bh(b, null, h, f)) : Yi(a, b, h, f);
			b.memoizedState = d.state;
			e && dg(b, c, !0);
			return b.child;
		}
		function lj(a) {
			var b = a.stateNode;
			b.pendingContext ? ag(a, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a, b.context, !1);
			Ih(a, b.containerInfo);
		}
		function mj(a, b, c, d, e) {
			Ig();
			Jg(e);
			b.flags |= 256;
			Yi(a, b, c, d);
			return b.child;
		}
		var nj = {
			dehydrated: null,
			treeContext: null,
			retryLane: 0
		};
		function oj(a) {
			return {
				baseLanes: a,
				cachePool: null,
				transitions: null
			};
		}
		function pj(a, b, c) {
			var d = b.pendingProps, e = M.current, f = !1, g = 0 !== (b.flags & 128), h;
			(h = g) || (h = null !== a && null === a.memoizedState ? !1 : 0 !== (e & 2));
			if (h) f = !0, b.flags &= -129;
			else if (null === a || null !== a.memoizedState) e |= 1;
			G(M, e & 1);
			if (null === a) {
				Eg(b);
				a = b.memoizedState;
				if (null !== a && (a = a.dehydrated, null !== a)) return 0 === (b.mode & 1) ? b.lanes = 1 : "$!" === a.data ? b.lanes = 8 : b.lanes = 1073741824, null;
				g = d.children;
				a = d.fallback;
				return f ? (d = b.mode, f = b.child, g = {
					mode: "hidden",
					children: g
				}, 0 === (d & 1) && null !== f ? (f.childLanes = 0, f.pendingProps = g) : f = qj(g, d, 0, null), a = Ah(a, d, c, null), f.return = b, a.return = b, f.sibling = a, b.child = f, b.child.memoizedState = oj(c), b.memoizedState = nj, a) : rj(b, g);
			}
			e = a.memoizedState;
			if (null !== e && (h = e.dehydrated, null !== h)) return sj(a, b, g, d, h, e, c);
			if (f) {
				f = d.fallback;
				g = b.mode;
				e = a.child;
				h = e.sibling;
				var k = {
					mode: "hidden",
					children: d.children
				};
				0 === (g & 1) && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k, b.deletions = null) : (d = wh(e, k), d.subtreeFlags = e.subtreeFlags & 14680064);
				null !== h ? f = wh(h, f) : (f = Ah(f, g, c, null), f.flags |= 2);
				f.return = b;
				d.return = b;
				d.sibling = f;
				b.child = d;
				d = f;
				f = b.child;
				g = a.child.memoizedState;
				g = null === g ? oj(c) : {
					baseLanes: g.baseLanes | c,
					cachePool: null,
					transitions: g.transitions
				};
				f.memoizedState = g;
				f.childLanes = a.childLanes & ~c;
				b.memoizedState = nj;
				return d;
			}
			f = a.child;
			a = f.sibling;
			d = wh(f, {
				mode: "visible",
				children: d.children
			});
			0 === (b.mode & 1) && (d.lanes = c);
			d.return = b;
			d.sibling = null;
			null !== a && (c = b.deletions, null === c ? (b.deletions = [a], b.flags |= 16) : c.push(a));
			b.child = d;
			b.memoizedState = null;
			return d;
		}
		function rj(a, b) {
			b = qj({
				mode: "visible",
				children: b
			}, a.mode, 0, null);
			b.return = a;
			return a.child = b;
		}
		function tj(a, b, c, d) {
			null !== d && Jg(d);
			Bh(b, a.child, null, c);
			a = rj(b, b.pendingProps.children);
			a.flags |= 2;
			b.memoizedState = null;
			return a;
		}
		function sj(a, b, c, d, e, f, g) {
			if (c) {
				if (b.flags & 256) return b.flags &= -257, d = Li(Error(p(422))), tj(a, b, g, d);
				if (null !== b.memoizedState) return b.child = a.child, b.flags |= 128, null;
				f = d.fallback;
				e = b.mode;
				d = qj({
					mode: "visible",
					children: d.children
				}, e, 0, null);
				f = Ah(f, e, g, null);
				f.flags |= 2;
				d.return = b;
				f.return = b;
				d.sibling = f;
				b.child = d;
				0 !== (b.mode & 1) && Bh(b, a.child, null, g);
				b.child.memoizedState = oj(g);
				b.memoizedState = nj;
				return f;
			}
			if (0 === (b.mode & 1)) return tj(a, b, g, null);
			if ("$!" === e.data) {
				d = e.nextSibling && e.nextSibling.dataset;
				if (d) var h = d.dgst;
				d = h;
				f = Error(p(419));
				d = Li(f, d, void 0);
				return tj(a, b, g, d);
			}
			h = 0 !== (g & a.childLanes);
			if (Ug || h) {
				d = R;
				if (null !== d) {
					switch (g & -g) {
						case 4:
							e = 2;
							break;
						case 16:
							e = 8;
							break;
						case 64:
						case 128:
						case 256:
						case 512:
						case 1024:
						case 2048:
						case 4096:
						case 8192:
						case 16384:
						case 32768:
						case 65536:
						case 131072:
						case 262144:
						case 524288:
						case 1048576:
						case 2097152:
						case 4194304:
						case 8388608:
						case 16777216:
						case 33554432:
						case 67108864:
							e = 32;
							break;
						case 536870912:
							e = 268435456;
							break;
						default: e = 0;
					}
					e = 0 !== (e & (d.suspendedLanes | g)) ? 0 : e;
					0 !== e && e !== f.retryLane && (f.retryLane = e, Zg(a, e), mh(d, a, e, -1));
				}
				uj();
				d = Li(Error(p(421)));
				return tj(a, b, g, d);
			}
			if ("$?" === e.data) return b.flags |= 128, b.child = a.child, b = vj.bind(null, a), e._reactRetry = b, null;
			a = f.treeContext;
			yg = Lf(e.nextSibling);
			xg = b;
			I = !0;
			zg = null;
			null !== a && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a.id, sg = a.overflow, qg = b);
			b = rj(b, d.children);
			b.flags |= 4096;
			return b;
		}
		function wj(a, b, c) {
			a.lanes |= b;
			var d = a.alternate;
			null !== d && (d.lanes |= b);
			Sg(a.return, b, c);
		}
		function xj(a, b, c, d, e) {
			var f = a.memoizedState;
			null === f ? a.memoizedState = {
				isBackwards: b,
				rendering: null,
				renderingStartTime: 0,
				last: d,
				tail: c,
				tailMode: e
			} : (f.isBackwards = b, f.rendering = null, f.renderingStartTime = 0, f.last = d, f.tail = c, f.tailMode = e);
		}
		function yj(a, b, c) {
			var d = b.pendingProps, e = d.revealOrder, f = d.tail;
			Yi(a, b, d.children, c);
			d = M.current;
			if (0 !== (d & 2)) d = d & 1 | 2, b.flags |= 128;
			else {
				if (null !== a && 0 !== (a.flags & 128)) a: for (a = b.child; null !== a;) {
					if (13 === a.tag) null !== a.memoizedState && wj(a, c, b);
					else if (19 === a.tag) wj(a, c, b);
					else if (null !== a.child) {
						a.child.return = a;
						a = a.child;
						continue;
					}
					if (a === b) break a;
					for (; null === a.sibling;) {
						if (null === a.return || a.return === b) break a;
						a = a.return;
					}
					a.sibling.return = a.return;
					a = a.sibling;
				}
				d &= 1;
			}
			G(M, d);
			if (0 === (b.mode & 1)) b.memoizedState = null;
			else switch (e) {
				case "forwards":
					c = b.child;
					for (e = null; null !== c;) a = c.alternate, null !== a && null === Mh(a) && (e = c), c = c.sibling;
					c = e;
					null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
					xj(b, !1, e, c, f);
					break;
				case "backwards":
					c = null;
					e = b.child;
					for (b.child = null; null !== e;) {
						a = e.alternate;
						if (null !== a && null === Mh(a)) {
							b.child = e;
							break;
						}
						a = e.sibling;
						e.sibling = c;
						c = e;
						e = a;
					}
					xj(b, !0, c, null, f);
					break;
				case "together":
					xj(b, !1, null, null, void 0);
					break;
				default: b.memoizedState = null;
			}
			return b.child;
		}
		function jj(a, b) {
			0 === (b.mode & 1) && null !== a && (a.alternate = null, b.alternate = null, b.flags |= 2);
		}
		function $i(a, b, c) {
			null !== a && (b.dependencies = a.dependencies);
			hh |= b.lanes;
			if (0 === (c & b.childLanes)) return null;
			if (null !== a && b.child !== a.child) throw Error(p(153));
			if (null !== b.child) {
				a = b.child;
				c = wh(a, a.pendingProps);
				b.child = c;
				for (c.return = b; null !== a.sibling;) a = a.sibling, c = c.sibling = wh(a, a.pendingProps), c.return = b;
				c.sibling = null;
			}
			return b.child;
		}
		function zj(a, b, c) {
			switch (b.tag) {
				case 3:
					lj(b);
					Ig();
					break;
				case 5:
					Kh(b);
					break;
				case 1:
					Zf(b.type) && cg(b);
					break;
				case 4:
					Ih(b, b.stateNode.containerInfo);
					break;
				case 10:
					var d = b.type._context, e = b.memoizedProps.value;
					G(Mg, d._currentValue);
					d._currentValue = e;
					break;
				case 13:
					d = b.memoizedState;
					if (null !== d) {
						if (null !== d.dehydrated) return G(M, M.current & 1), b.flags |= 128, null;
						if (0 !== (c & b.child.childLanes)) return pj(a, b, c);
						G(M, M.current & 1);
						a = $i(a, b, c);
						return null !== a ? a.sibling : null;
					}
					G(M, M.current & 1);
					break;
				case 19:
					d = 0 !== (c & b.childLanes);
					if (0 !== (a.flags & 128)) {
						if (d) return yj(a, b, c);
						b.flags |= 128;
					}
					e = b.memoizedState;
					null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
					G(M, M.current);
					if (d) break;
					else return null;
				case 22:
				case 23: return b.lanes = 0, ej(a, b, c);
			}
			return $i(a, b, c);
		}
		var Aj = function(a, b) {
			for (var c = b.child; null !== c;) {
				if (5 === c.tag || 6 === c.tag) a.appendChild(c.stateNode);
				else if (4 !== c.tag && null !== c.child) {
					c.child.return = c;
					c = c.child;
					continue;
				}
				if (c === b) break;
				for (; null === c.sibling;) {
					if (null === c.return || c.return === b) return;
					c = c.return;
				}
				c.sibling.return = c.return;
				c = c.sibling;
			}
		};
		var Cj = function(a, b, c, d) {
			var e = a.memoizedProps;
			if (e !== d) {
				a = b.stateNode;
				Hh(Eh.current);
				var f = null;
				switch (c) {
					case "input":
						e = Ya(a, e);
						d = Ya(a, d);
						f = [];
						break;
					case "select":
						e = A({}, e, { value: void 0 });
						d = A({}, d, { value: void 0 });
						f = [];
						break;
					case "textarea":
						e = gb(a, e);
						d = gb(a, d);
						f = [];
						break;
					default: "function" !== typeof e.onClick && "function" === typeof d.onClick && (a.onclick = Bf);
				}
				ub(c, d);
				var g;
				c = null;
				for (l in e) if (!d.hasOwnProperty(l) && e.hasOwnProperty(l) && null != e[l]) if ("style" === l) {
					var h = e[l];
					for (g in h) h.hasOwnProperty(g) && (c || (c = {}), c[g] = "");
				} else "dangerouslySetInnerHTML" !== l && "children" !== l && "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && "autoFocus" !== l && (ea.hasOwnProperty(l) ? f || (f = []) : (f = f || []).push(l, null));
				for (l in d) {
					var k = d[l];
					h = null != e ? e[l] : void 0;
					if (d.hasOwnProperty(l) && k !== h && (null != k || null != h)) if ("style" === l) if (h) {
						for (g in h) !h.hasOwnProperty(g) || k && k.hasOwnProperty(g) || (c || (c = {}), c[g] = "");
						for (g in k) k.hasOwnProperty(g) && h[g] !== k[g] && (c || (c = {}), c[g] = k[g]);
					} else c || (f || (f = []), f.push(l, c)), c = k;
					else "dangerouslySetInnerHTML" === l ? (k = k ? k.__html : void 0, h = h ? h.__html : void 0, null != k && h !== k && (f = f || []).push(l, k)) : "children" === l ? "string" !== typeof k && "number" !== typeof k || (f = f || []).push(l, "" + k) : "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && (ea.hasOwnProperty(l) ? (null != k && "onScroll" === l && D("scroll", a), f || h === k || (f = [])) : (f = f || []).push(l, k));
				}
				c && (f = f || []).push("style", c);
				var l = f;
				if (b.updateQueue = l) b.flags |= 4;
			}
		};
		var Dj = function(a, b, c, d) {
			c !== d && (b.flags |= 4);
		};
		function Ej(a, b) {
			if (!I) switch (a.tailMode) {
				case "hidden":
					b = a.tail;
					for (var c = null; null !== b;) null !== b.alternate && (c = b), b = b.sibling;
					null === c ? a.tail = null : c.sibling = null;
					break;
				case "collapsed":
					c = a.tail;
					for (var d = null; null !== c;) null !== c.alternate && (d = c), c = c.sibling;
					null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
			}
		}
		function S(a) {
			var b = null !== a.alternate && a.alternate.child === a.child, c = 0, d = 0;
			if (b) for (var e = a.child; null !== e;) c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
			else for (e = a.child; null !== e;) c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
			a.subtreeFlags |= d;
			a.childLanes = c;
			return b;
		}
		function Fj(a, b, c) {
			var d = b.pendingProps;
			wg(b);
			switch (b.tag) {
				case 2:
				case 16:
				case 15:
				case 0:
				case 11:
				case 7:
				case 8:
				case 12:
				case 9:
				case 14: return S(b), null;
				case 1: return Zf(b.type) && $f(), S(b), null;
				case 3:
					d = b.stateNode;
					Jh();
					E(Wf);
					E(H);
					Oh();
					d.pendingContext && (d.context = d.pendingContext, d.pendingContext = null);
					if (null === a || null === a.child) Gg(b) ? b.flags |= 4 : null === a || a.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== zg && (Gj(zg), zg = null));
					S(b);
					return null;
				case 5:
					Lh(b);
					var e = Hh(Gh.current);
					c = b.type;
					if (null !== a && null != b.stateNode) Cj(a, b, c, d, e), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
					else {
						if (!d) {
							if (null === b.stateNode) throw Error(p(166));
							S(b);
							return null;
						}
						a = Hh(Eh.current);
						if (Gg(b)) {
							d = b.stateNode;
							c = b.type;
							var f = b.memoizedProps;
							d[Of] = b;
							d[Pf] = f;
							a = 0 !== (b.mode & 1);
							switch (c) {
								case "dialog":
									D("cancel", d);
									D("close", d);
									break;
								case "iframe":
								case "object":
								case "embed":
									D("load", d);
									break;
								case "video":
								case "audio":
									for (e = 0; e < lf.length; e++) D(lf[e], d);
									break;
								case "source":
									D("error", d);
									break;
								case "img":
								case "image":
								case "link":
									D("error", d);
									D("load", d);
									break;
								case "details":
									D("toggle", d);
									break;
								case "input":
									Za(d, f);
									D("invalid", d);
									break;
								case "select":
									d._wrapperState = { wasMultiple: !!f.multiple };
									D("invalid", d);
									break;
								case "textarea": hb(d, f), D("invalid", d);
							}
							ub(c, f);
							e = null;
							for (var g in f) if (f.hasOwnProperty(g)) {
								var h = f[g];
								"children" === g ? "string" === typeof h ? d.textContent !== h && (!0 !== f.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", h]) : "number" === typeof h && d.textContent !== "" + h && (!0 !== f.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", "" + h]) : ea.hasOwnProperty(g) && null != h && "onScroll" === g && D("scroll", d);
							}
							switch (c) {
								case "input":
									Va(d);
									db(d, f, !0);
									break;
								case "textarea":
									Va(d);
									jb(d);
									break;
								case "select":
								case "option": break;
								default: "function" === typeof f.onClick && (d.onclick = Bf);
							}
							d = e;
							b.updateQueue = d;
							null !== d && (b.flags |= 4);
						} else {
							g = 9 === e.nodeType ? e : e.ownerDocument;
							"http://www.w3.org/1999/xhtml" === a && (a = kb(c));
							"http://www.w3.org/1999/xhtml" === a ? "script" === c ? (a = g.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild)) : "string" === typeof d.is ? a = g.createElement(c, { is: d.is }) : (a = g.createElement(c), "select" === c && (g = a, d.multiple ? g.multiple = !0 : d.size && (g.size = d.size))) : a = g.createElementNS(a, c);
							a[Of] = b;
							a[Pf] = d;
							Aj(a, b, !1, !1);
							b.stateNode = a;
							a: {
								g = vb(c, d);
								switch (c) {
									case "dialog":
										D("cancel", a);
										D("close", a);
										e = d;
										break;
									case "iframe":
									case "object":
									case "embed":
										D("load", a);
										e = d;
										break;
									case "video":
									case "audio":
										for (e = 0; e < lf.length; e++) D(lf[e], a);
										e = d;
										break;
									case "source":
										D("error", a);
										e = d;
										break;
									case "img":
									case "image":
									case "link":
										D("error", a);
										D("load", a);
										e = d;
										break;
									case "details":
										D("toggle", a);
										e = d;
										break;
									case "input":
										Za(a, d);
										e = Ya(a, d);
										D("invalid", a);
										break;
									case "option":
										e = d;
										break;
									case "select":
										a._wrapperState = { wasMultiple: !!d.multiple };
										e = A({}, d, { value: void 0 });
										D("invalid", a);
										break;
									case "textarea":
										hb(a, d);
										e = gb(a, d);
										D("invalid", a);
										break;
									default: e = d;
								}
								ub(c, e);
								h = e;
								for (f in h) if (h.hasOwnProperty(f)) {
									var k = h[f];
									"style" === f ? sb(a, k) : "dangerouslySetInnerHTML" === f ? (k = k ? k.__html : void 0, null != k && nb(a, k)) : "children" === f ? "string" === typeof k ? ("textarea" !== c || "" !== k) && ob(a, k) : "number" === typeof k && ob(a, "" + k) : "suppressContentEditableWarning" !== f && "suppressHydrationWarning" !== f && "autoFocus" !== f && (ea.hasOwnProperty(f) ? null != k && "onScroll" === f && D("scroll", a) : null != k && ta(a, f, k, g));
								}
								switch (c) {
									case "input":
										Va(a);
										db(a, d, !1);
										break;
									case "textarea":
										Va(a);
										jb(a);
										break;
									case "option":
										null != d.value && a.setAttribute("value", "" + Sa(d.value));
										break;
									case "select":
										a.multiple = !!d.multiple;
										f = d.value;
										null != f ? fb(a, !!d.multiple, f, !1) : null != d.defaultValue && fb(a, !!d.multiple, d.defaultValue, !0);
										break;
									default: "function" === typeof e.onClick && (a.onclick = Bf);
								}
								switch (c) {
									case "button":
									case "input":
									case "select":
									case "textarea":
										d = !!d.autoFocus;
										break a;
									case "img":
										d = !0;
										break a;
									default: d = !1;
								}
							}
							d && (b.flags |= 4);
						}
						null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
					}
					S(b);
					return null;
				case 6:
					if (a && null != b.stateNode) Dj(a, b, a.memoizedProps, d);
					else {
						if ("string" !== typeof d && null === b.stateNode) throw Error(p(166));
						c = Hh(Gh.current);
						Hh(Eh.current);
						if (Gg(b)) {
							d = b.stateNode;
							c = b.memoizedProps;
							d[Of] = b;
							if (f = d.nodeValue !== c) {
								if (a = xg, null !== a) switch (a.tag) {
									case 3:
										Af(d.nodeValue, c, 0 !== (a.mode & 1));
										break;
									case 5: !0 !== a.memoizedProps.suppressHydrationWarning && Af(d.nodeValue, c, 0 !== (a.mode & 1));
								}
							}
							f && (b.flags |= 4);
						} else d = (9 === c.nodeType ? c : c.ownerDocument).createTextNode(d), d[Of] = b, b.stateNode = d;
					}
					S(b);
					return null;
				case 13:
					E(M);
					d = b.memoizedState;
					if (null === a || null !== a.memoizedState && null !== a.memoizedState.dehydrated) {
						if (I && null !== yg && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) Hg(), Ig(), b.flags |= 98560, f = !1;
						else if (f = Gg(b), null !== d && null !== d.dehydrated) {
							if (null === a) {
								if (!f) throw Error(p(318));
								f = b.memoizedState;
								f = null !== f ? f.dehydrated : null;
								if (!f) throw Error(p(317));
								f[Of] = b;
							} else Ig(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
							S(b);
							f = !1;
						} else null !== zg && (Gj(zg), zg = null), f = !0;
						if (!f) return b.flags & 65536 ? b : null;
					}
					if (0 !== (b.flags & 128)) return b.lanes = c, b;
					d = null !== d;
					d !== (null !== a && null !== a.memoizedState) && d && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a || 0 !== (M.current & 1) ? 0 === T && (T = 3) : uj()));
					null !== b.updateQueue && (b.flags |= 4);
					S(b);
					return null;
				case 4: return Jh(), null === a && sf(b.stateNode.containerInfo), S(b), null;
				case 10: return Rg(b.type._context), S(b), null;
				case 17: return Zf(b.type) && $f(), S(b), null;
				case 19:
					E(M);
					f = b.memoizedState;
					if (null === f) return S(b), null;
					d = 0 !== (b.flags & 128);
					g = f.rendering;
					if (null === g) if (d) Ej(f, !1);
					else {
						if (0 !== T || null !== a && 0 !== (a.flags & 128)) for (a = b.child; null !== a;) {
							g = Mh(a);
							if (null !== g) {
								b.flags |= 128;
								Ej(f, !1);
								d = g.updateQueue;
								null !== d && (b.updateQueue = d, b.flags |= 4);
								b.subtreeFlags = 0;
								d = c;
								for (c = b.child; null !== c;) f = c, a = d, f.flags &= 14680066, g = f.alternate, null === g ? (f.childLanes = 0, f.lanes = a, f.child = null, f.subtreeFlags = 0, f.memoizedProps = null, f.memoizedState = null, f.updateQueue = null, f.dependencies = null, f.stateNode = null) : (f.childLanes = g.childLanes, f.lanes = g.lanes, f.child = g.child, f.subtreeFlags = 0, f.deletions = null, f.memoizedProps = g.memoizedProps, f.memoizedState = g.memoizedState, f.updateQueue = g.updateQueue, f.type = g.type, a = g.dependencies, f.dependencies = null === a ? null : {
									lanes: a.lanes,
									firstContext: a.firstContext
								}), c = c.sibling;
								G(M, M.current & 1 | 2);
								return b.child;
							}
							a = a.sibling;
						}
						null !== f.tail && B() > Hj && (b.flags |= 128, d = !0, Ej(f, !1), b.lanes = 4194304);
					}
					else {
						if (!d) if (a = Mh(g), null !== a) {
							if (b.flags |= 128, d = !0, c = a.updateQueue, null !== c && (b.updateQueue = c, b.flags |= 4), Ej(f, !0), null === f.tail && "hidden" === f.tailMode && !g.alternate && !I) return S(b), null;
						} else 2 * B() - f.renderingStartTime > Hj && 1073741824 !== c && (b.flags |= 128, d = !0, Ej(f, !1), b.lanes = 4194304);
						f.isBackwards ? (g.sibling = b.child, b.child = g) : (c = f.last, null !== c ? c.sibling = g : b.child = g, f.last = g);
					}
					if (null !== f.tail) return b = f.tail, f.rendering = b, f.tail = b.sibling, f.renderingStartTime = B(), b.sibling = null, c = M.current, G(M, d ? c & 1 | 2 : c & 1), b;
					S(b);
					return null;
				case 22:
				case 23: return Ij(), d = null !== b.memoizedState, null !== a && null !== a.memoizedState !== d && (b.flags |= 8192), d && 0 !== (b.mode & 1) ? 0 !== (gj & 1073741824) && (S(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S(b), null;
				case 24: return null;
				case 25: return null;
			}
			throw Error(p(156, b.tag));
		}
		function Jj(a, b) {
			wg(b);
			switch (b.tag) {
				case 1: return Zf(b.type) && $f(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
				case 3: return Jh(), E(Wf), E(H), Oh(), a = b.flags, 0 !== (a & 65536) && 0 === (a & 128) ? (b.flags = a & -65537 | 128, b) : null;
				case 5: return Lh(b), null;
				case 13:
					E(M);
					a = b.memoizedState;
					if (null !== a && null !== a.dehydrated) {
						if (null === b.alternate) throw Error(p(340));
						Ig();
					}
					a = b.flags;
					return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
				case 19: return E(M), null;
				case 4: return Jh(), null;
				case 10: return Rg(b.type._context), null;
				case 22:
				case 23: return Ij(), null;
				case 24: return null;
				default: return null;
			}
		}
		var Kj = !1;
		var U = !1;
		var Lj = "function" === typeof WeakSet ? WeakSet : Set;
		var V = null;
		function Mj(a, b) {
			var c = a.ref;
			if (null !== c) if ("function" === typeof c) try {
				c(null);
			} catch (d) {
				W(a, b, d);
			}
			else c.current = null;
		}
		function Nj(a, b, c) {
			try {
				c();
			} catch (d) {
				W(a, b, d);
			}
		}
		var Oj = !1;
		function Pj(a, b) {
			Cf = dd;
			a = Me();
			if (Ne(a)) {
				if ("selectionStart" in a) var c = {
					start: a.selectionStart,
					end: a.selectionEnd
				};
				else a: {
					c = (c = a.ownerDocument) && c.defaultView || window;
					var d = c.getSelection && c.getSelection();
					if (d && 0 !== d.rangeCount) {
						c = d.anchorNode;
						var e = d.anchorOffset, f = d.focusNode;
						d = d.focusOffset;
						try {
							c.nodeType, f.nodeType;
						} catch (F) {
							c = null;
							break a;
						}
						var g = 0, h = -1, k = -1, l = 0, m = 0, q = a, r = null;
						b: for (;;) {
							for (var y;;) {
								q !== c || 0 !== e && 3 !== q.nodeType || (h = g + e);
								q !== f || 0 !== d && 3 !== q.nodeType || (k = g + d);
								3 === q.nodeType && (g += q.nodeValue.length);
								if (null === (y = q.firstChild)) break;
								r = q;
								q = y;
							}
							for (;;) {
								if (q === a) break b;
								r === c && ++l === e && (h = g);
								r === f && ++m === d && (k = g);
								if (null !== (y = q.nextSibling)) break;
								q = r;
								r = q.parentNode;
							}
							q = y;
						}
						c = -1 === h || -1 === k ? null : {
							start: h,
							end: k
						};
					} else c = null;
				}
				c = c || {
					start: 0,
					end: 0
				};
			} else c = null;
			Df = {
				focusedElem: a,
				selectionRange: c
			};
			dd = !1;
			for (V = b; null !== V;) if (b = V, a = b.child, 0 !== (b.subtreeFlags & 1028) && null !== a) a.return = b, V = a;
			else for (; null !== V;) {
				b = V;
				try {
					var n = b.alternate;
					if (0 !== (b.flags & 1024)) switch (b.tag) {
						case 0:
						case 11:
						case 15: break;
						case 1:
							if (null !== n) {
								var t = n.memoizedProps, J = n.memoizedState, x = b.stateNode;
								x.__reactInternalSnapshotBeforeUpdate = x.getSnapshotBeforeUpdate(b.elementType === b.type ? t : Lg(b.type, t), J);
							}
							break;
						case 3:
							var u = b.stateNode.containerInfo;
							1 === u.nodeType ? u.textContent = "" : 9 === u.nodeType && u.documentElement && u.removeChild(u.documentElement);
							break;
						case 5:
						case 6:
						case 4:
						case 17: break;
						default: throw Error(p(163));
					}
				} catch (F) {
					W(b, b.return, F);
				}
				a = b.sibling;
				if (null !== a) {
					a.return = b.return;
					V = a;
					break;
				}
				V = b.return;
			}
			n = Oj;
			Oj = !1;
			return n;
		}
		function Qj(a, b, c) {
			var d = b.updateQueue;
			d = null !== d ? d.lastEffect : null;
			if (null !== d) {
				var e = d = d.next;
				do {
					if ((e.tag & a) === a) {
						var f = e.destroy;
						e.destroy = void 0;
						void 0 !== f && Nj(b, c, f);
					}
					e = e.next;
				} while (e !== d);
			}
		}
		function Rj(a, b) {
			b = b.updateQueue;
			b = null !== b ? b.lastEffect : null;
			if (null !== b) {
				var c = b = b.next;
				do {
					if ((c.tag & a) === a) {
						var d = c.create;
						c.destroy = d();
					}
					c = c.next;
				} while (c !== b);
			}
		}
		function Sj(a) {
			var b = a.ref;
			if (null !== b) {
				var c = a.stateNode;
				switch (a.tag) {
					case 5:
						a = c;
						break;
					default: a = c;
				}
				"function" === typeof b ? b(a) : b.current = a;
			}
		}
		function Tj(a) {
			var b = a.alternate;
			null !== b && (a.alternate = null, Tj(b));
			a.child = null;
			a.deletions = null;
			a.sibling = null;
			5 === a.tag && (b = a.stateNode, null !== b && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
			a.stateNode = null;
			a.return = null;
			a.dependencies = null;
			a.memoizedProps = null;
			a.memoizedState = null;
			a.pendingProps = null;
			a.stateNode = null;
			a.updateQueue = null;
		}
		function Uj(a) {
			return 5 === a.tag || 3 === a.tag || 4 === a.tag;
		}
		function Vj(a) {
			a: for (;;) {
				for (; null === a.sibling;) {
					if (null === a.return || Uj(a.return)) return null;
					a = a.return;
				}
				a.sibling.return = a.return;
				for (a = a.sibling; 5 !== a.tag && 6 !== a.tag && 18 !== a.tag;) {
					if (a.flags & 2) continue a;
					if (null === a.child || 4 === a.tag) continue a;
					else a.child.return = a, a = a.child;
				}
				if (!(a.flags & 2)) return a.stateNode;
			}
		}
		function Wj(a, b, c) {
			var d = a.tag;
			if (5 === d || 6 === d) a = a.stateNode, b ? 8 === c.nodeType ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (8 === c.nodeType ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, null !== c && void 0 !== c || null !== b.onclick || (b.onclick = Bf));
			else if (4 !== d && (a = a.child, null !== a)) for (Wj(a, b, c), a = a.sibling; null !== a;) Wj(a, b, c), a = a.sibling;
		}
		function Xj(a, b, c) {
			var d = a.tag;
			if (5 === d || 6 === d) a = a.stateNode, b ? c.insertBefore(a, b) : c.appendChild(a);
			else if (4 !== d && (a = a.child, null !== a)) for (Xj(a, b, c), a = a.sibling; null !== a;) Xj(a, b, c), a = a.sibling;
		}
		var X = null;
		var Yj = !1;
		function Zj(a, b, c) {
			for (c = c.child; null !== c;) ak(a, b, c), c = c.sibling;
		}
		function ak(a, b, c) {
			if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
				lc.onCommitFiberUnmount(kc, c);
			} catch (h) {}
			switch (c.tag) {
				case 5: U || Mj(c, b);
				case 6:
					var d = X, e = Yj;
					X = null;
					Zj(a, b, c);
					X = d;
					Yj = e;
					null !== X && (Yj ? (a = X, c = c.stateNode, 8 === a.nodeType ? a.parentNode.removeChild(c) : a.removeChild(c)) : X.removeChild(c.stateNode));
					break;
				case 18:
					null !== X && (Yj ? (a = X, c = c.stateNode, 8 === a.nodeType ? Kf(a.parentNode, c) : 1 === a.nodeType && Kf(a, c), bd(a)) : Kf(X, c.stateNode));
					break;
				case 4:
					d = X;
					e = Yj;
					X = c.stateNode.containerInfo;
					Yj = !0;
					Zj(a, b, c);
					X = d;
					Yj = e;
					break;
				case 0:
				case 11:
				case 14:
				case 15:
					if (!U && (d = c.updateQueue, null !== d && (d = d.lastEffect, null !== d))) {
						e = d = d.next;
						do {
							var f = e, g = f.destroy;
							f = f.tag;
							void 0 !== g && (0 !== (f & 2) ? Nj(c, b, g) : 0 !== (f & 4) && Nj(c, b, g));
							e = e.next;
						} while (e !== d);
					}
					Zj(a, b, c);
					break;
				case 1:
					if (!U && (Mj(c, b), d = c.stateNode, "function" === typeof d.componentWillUnmount)) try {
						d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
					} catch (h) {
						W(c, b, h);
					}
					Zj(a, b, c);
					break;
				case 21:
					Zj(a, b, c);
					break;
				case 22:
					c.mode & 1 ? (U = (d = U) || null !== c.memoizedState, Zj(a, b, c), U = d) : Zj(a, b, c);
					break;
				default: Zj(a, b, c);
			}
		}
		function bk(a) {
			var b = a.updateQueue;
			if (null !== b) {
				a.updateQueue = null;
				var c = a.stateNode;
				null === c && (c = a.stateNode = new Lj());
				b.forEach(function(b) {
					var d = ck.bind(null, a, b);
					c.has(b) || (c.add(b), b.then(d, d));
				});
			}
		}
		function dk(a, b) {
			var c = b.deletions;
			if (null !== c) for (var d = 0; d < c.length; d++) {
				var e = c[d];
				try {
					var f = a, g = b, h = g;
					a: for (; null !== h;) {
						switch (h.tag) {
							case 5:
								X = h.stateNode;
								Yj = !1;
								break a;
							case 3:
								X = h.stateNode.containerInfo;
								Yj = !0;
								break a;
							case 4:
								X = h.stateNode.containerInfo;
								Yj = !0;
								break a;
						}
						h = h.return;
					}
					if (null === X) throw Error(p(160));
					ak(f, g, e);
					X = null;
					Yj = !1;
					var k = e.alternate;
					null !== k && (k.return = null);
					e.return = null;
				} catch (l) {
					W(e, b, l);
				}
			}
			if (b.subtreeFlags & 12854) for (b = b.child; null !== b;) ek(b, a), b = b.sibling;
		}
		function ek(a, b) {
			var c = a.alternate, d = a.flags;
			switch (a.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					dk(b, a);
					fk(a);
					if (d & 4) {
						try {
							Qj(3, a, a.return), Rj(3, a);
						} catch (t) {
							W(a, a.return, t);
						}
						try {
							Qj(5, a, a.return);
						} catch (t) {
							W(a, a.return, t);
						}
					}
					break;
				case 1:
					dk(b, a);
					fk(a);
					d & 512 && null !== c && Mj(c, c.return);
					break;
				case 5:
					dk(b, a);
					fk(a);
					d & 512 && null !== c && Mj(c, c.return);
					if (a.flags & 32) {
						var e = a.stateNode;
						try {
							ob(e, "");
						} catch (t) {
							W(a, a.return, t);
						}
					}
					if (d & 4 && (e = a.stateNode, null != e)) {
						var f = a.memoizedProps, g = null !== c ? c.memoizedProps : f, h = a.type, k = a.updateQueue;
						a.updateQueue = null;
						if (null !== k) try {
							"input" === h && "radio" === f.type && null != f.name && ab(e, f);
							vb(h, g);
							var l = vb(h, f);
							for (g = 0; g < k.length; g += 2) {
								var m = k[g], q = k[g + 1];
								"style" === m ? sb(e, q) : "dangerouslySetInnerHTML" === m ? nb(e, q) : "children" === m ? ob(e, q) : ta(e, m, q, l);
							}
							switch (h) {
								case "input":
									bb(e, f);
									break;
								case "textarea":
									ib(e, f);
									break;
								case "select":
									var r = e._wrapperState.wasMultiple;
									e._wrapperState.wasMultiple = !!f.multiple;
									var y = f.value;
									null != y ? fb(e, !!f.multiple, y, !1) : r !== !!f.multiple && (null != f.defaultValue ? fb(e, !!f.multiple, f.defaultValue, !0) : fb(e, !!f.multiple, f.multiple ? [] : "", !1));
							}
							e[Pf] = f;
						} catch (t) {
							W(a, a.return, t);
						}
					}
					break;
				case 6:
					dk(b, a);
					fk(a);
					if (d & 4) {
						if (null === a.stateNode) throw Error(p(162));
						e = a.stateNode;
						f = a.memoizedProps;
						try {
							e.nodeValue = f;
						} catch (t) {
							W(a, a.return, t);
						}
					}
					break;
				case 3:
					dk(b, a);
					fk(a);
					if (d & 4 && null !== c && c.memoizedState.isDehydrated) try {
						bd(b.containerInfo);
					} catch (t) {
						W(a, a.return, t);
					}
					break;
				case 4:
					dk(b, a);
					fk(a);
					break;
				case 13:
					dk(b, a);
					fk(a);
					e = a.child;
					e.flags & 8192 && (f = null !== e.memoizedState, e.stateNode.isHidden = f, !f || null !== e.alternate && null !== e.alternate.memoizedState || (gk = B()));
					d & 4 && bk(a);
					break;
				case 22:
					m = null !== c && null !== c.memoizedState;
					a.mode & 1 ? (U = (l = U) || m, dk(b, a), U = l) : dk(b, a);
					fk(a);
					if (d & 8192) {
						l = null !== a.memoizedState;
						if ((a.stateNode.isHidden = l) && !m && 0 !== (a.mode & 1)) for (V = a, m = a.child; null !== m;) {
							for (q = V = m; null !== V;) {
								r = V;
								y = r.child;
								switch (r.tag) {
									case 0:
									case 11:
									case 14:
									case 15:
										Qj(4, r, r.return);
										break;
									case 1:
										Mj(r, r.return);
										var n = r.stateNode;
										if ("function" === typeof n.componentWillUnmount) {
											d = r;
											c = r.return;
											try {
												b = d, n.props = b.memoizedProps, n.state = b.memoizedState, n.componentWillUnmount();
											} catch (t) {
												W(d, c, t);
											}
										}
										break;
									case 5:
										Mj(r, r.return);
										break;
									case 22: if (null !== r.memoizedState) {
										hk(q);
										continue;
									}
								}
								null !== y ? (y.return = r, V = y) : hk(q);
							}
							m = m.sibling;
						}
						a: for (m = null, q = a;;) {
							if (5 === q.tag) {
								if (null === m) {
									m = q;
									try {
										e = q.stateNode, l ? (f = e.style, "function" === typeof f.setProperty ? f.setProperty("display", "none", "important") : f.display = "none") : (h = q.stateNode, k = q.memoizedProps.style, g = void 0 !== k && null !== k && k.hasOwnProperty("display") ? k.display : null, h.style.display = rb("display", g));
									} catch (t) {
										W(a, a.return, t);
									}
								}
							} else if (6 === q.tag) {
								if (null === m) try {
									q.stateNode.nodeValue = l ? "" : q.memoizedProps;
								} catch (t) {
									W(a, a.return, t);
								}
							} else if ((22 !== q.tag && 23 !== q.tag || null === q.memoizedState || q === a) && null !== q.child) {
								q.child.return = q;
								q = q.child;
								continue;
							}
							if (q === a) break a;
							for (; null === q.sibling;) {
								if (null === q.return || q.return === a) break a;
								m === q && (m = null);
								q = q.return;
							}
							m === q && (m = null);
							q.sibling.return = q.return;
							q = q.sibling;
						}
					}
					break;
				case 19:
					dk(b, a);
					fk(a);
					d & 4 && bk(a);
					break;
				case 21: break;
				default: dk(b, a), fk(a);
			}
		}
		function fk(a) {
			var b = a.flags;
			if (b & 2) {
				try {
					a: {
						for (var c = a.return; null !== c;) {
							if (Uj(c)) {
								var d = c;
								break a;
							}
							c = c.return;
						}
						throw Error(p(160));
					}
					switch (d.tag) {
						case 5:
							var e = d.stateNode;
							d.flags & 32 && (ob(e, ""), d.flags &= -33);
							Xj(a, Vj(a), e);
							break;
						case 3:
						case 4:
							var g = d.stateNode.containerInfo;
							Wj(a, Vj(a), g);
							break;
						default: throw Error(p(161));
					}
				} catch (k) {
					W(a, a.return, k);
				}
				a.flags &= -3;
			}
			b & 4096 && (a.flags &= -4097);
		}
		function ik(a, b, c) {
			V = a;
			jk(a, b, c);
		}
		function jk(a, b, c) {
			for (var d = 0 !== (a.mode & 1); null !== V;) {
				var e = V, f = e.child;
				if (22 === e.tag && d) {
					var g = null !== e.memoizedState || Kj;
					if (!g) {
						var h = e.alternate, k = null !== h && null !== h.memoizedState || U;
						h = Kj;
						var l = U;
						Kj = g;
						if ((U = k) && !l) for (V = e; null !== V;) g = V, k = g.child, 22 === g.tag && null !== g.memoizedState ? kk(e) : null !== k ? (k.return = g, V = k) : kk(e);
						for (; null !== f;) V = f, jk(f, b, c), f = f.sibling;
						V = e;
						Kj = h;
						U = l;
					}
					lk(a, b, c);
				} else 0 !== (e.subtreeFlags & 8772) && null !== f ? (f.return = e, V = f) : lk(a, b, c);
			}
		}
		function lk(a) {
			for (; null !== V;) {
				var b = V;
				if (0 !== (b.flags & 8772)) {
					var c = b.alternate;
					try {
						if (0 !== (b.flags & 8772)) switch (b.tag) {
							case 0:
							case 11:
							case 15:
								U || Rj(5, b);
								break;
							case 1:
								var d = b.stateNode;
								if (b.flags & 4 && !U) if (null === c) d.componentDidMount();
								else {
									var e = b.elementType === b.type ? c.memoizedProps : Lg(b.type, c.memoizedProps);
									d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
								}
								var f = b.updateQueue;
								null !== f && ih(b, f, d);
								break;
							case 3:
								var g = b.updateQueue;
								if (null !== g) {
									c = null;
									if (null !== b.child) switch (b.child.tag) {
										case 5:
											c = b.child.stateNode;
											break;
										case 1: c = b.child.stateNode;
									}
									ih(b, g, c);
								}
								break;
							case 5:
								var h = b.stateNode;
								if (null === c && b.flags & 4) {
									c = h;
									var k = b.memoizedProps;
									switch (b.type) {
										case "button":
										case "input":
										case "select":
										case "textarea":
											k.autoFocus && c.focus();
											break;
										case "img": k.src && (c.src = k.src);
									}
								}
								break;
							case 6: break;
							case 4: break;
							case 12: break;
							case 13:
								if (null === b.memoizedState) {
									var l = b.alternate;
									if (null !== l) {
										var m = l.memoizedState;
										if (null !== m) {
											var q = m.dehydrated;
											null !== q && bd(q);
										}
									}
								}
								break;
							case 19:
							case 17:
							case 21:
							case 22:
							case 23:
							case 25: break;
							default: throw Error(p(163));
						}
						U || b.flags & 512 && Sj(b);
					} catch (r) {
						W(b, b.return, r);
					}
				}
				if (b === a) {
					V = null;
					break;
				}
				c = b.sibling;
				if (null !== c) {
					c.return = b.return;
					V = c;
					break;
				}
				V = b.return;
			}
		}
		function hk(a) {
			for (; null !== V;) {
				var b = V;
				if (b === a) {
					V = null;
					break;
				}
				var c = b.sibling;
				if (null !== c) {
					c.return = b.return;
					V = c;
					break;
				}
				V = b.return;
			}
		}
		function kk(a) {
			for (; null !== V;) {
				var b = V;
				try {
					switch (b.tag) {
						case 0:
						case 11:
						case 15:
							var c = b.return;
							try {
								Rj(4, b);
							} catch (k) {
								W(b, c, k);
							}
							break;
						case 1:
							var d = b.stateNode;
							if ("function" === typeof d.componentDidMount) {
								var e = b.return;
								try {
									d.componentDidMount();
								} catch (k) {
									W(b, e, k);
								}
							}
							var f = b.return;
							try {
								Sj(b);
							} catch (k) {
								W(b, f, k);
							}
							break;
						case 5:
							var g = b.return;
							try {
								Sj(b);
							} catch (k) {
								W(b, g, k);
							}
					}
				} catch (k) {
					W(b, b.return, k);
				}
				if (b === a) {
					V = null;
					break;
				}
				var h = b.sibling;
				if (null !== h) {
					h.return = b.return;
					V = h;
					break;
				}
				V = b.return;
			}
		}
		var mk = Math.ceil;
		var nk = ua.ReactCurrentDispatcher;
		var ok = ua.ReactCurrentOwner;
		var pk = ua.ReactCurrentBatchConfig;
		var K = 0;
		var R = null;
		var Y = null;
		var Z = 0;
		var gj = 0;
		var fj = Uf(0);
		var T = 0;
		var qk = null;
		var hh = 0;
		var rk = 0;
		var sk = 0;
		var tk = null;
		var uk = null;
		var gk = 0;
		var Hj = Infinity;
		var vk = null;
		var Pi = !1;
		var Qi = null;
		var Si = null;
		var wk = !1;
		var xk = null;
		var yk = 0;
		var zk = 0;
		var Ak = null;
		var Bk = -1;
		var Ck = 0;
		function L() {
			return 0 !== (K & 6) ? B() : -1 !== Bk ? Bk : Bk = B();
		}
		function lh(a) {
			if (0 === (a.mode & 1)) return 1;
			if (0 !== (K & 2) && 0 !== Z) return Z & -Z;
			if (null !== Kg.transition) return 0 === Ck && (Ck = yc()), Ck;
			a = C;
			if (0 !== a) return a;
			a = window.event;
			a = void 0 === a ? 16 : jd(a.type);
			return a;
		}
		function mh(a, b, c, d) {
			if (50 < zk) throw zk = 0, Ak = null, Error(p(185));
			Ac(a, c, d);
			if (0 === (K & 2) || a !== R) a === R && (0 === (K & 2) && (rk |= c), 4 === T && Dk(a, Z)), Ek(a, d), 1 === c && 0 === K && 0 === (b.mode & 1) && (Hj = B() + 500, fg && jg());
		}
		function Ek(a, b) {
			var c = a.callbackNode;
			wc(a, b);
			var d = uc(a, a === R ? Z : 0);
			if (0 === d) null !== c && bc(c), a.callbackNode = null, a.callbackPriority = 0;
			else if (b = d & -d, a.callbackPriority !== b) {
				null != c && bc(c);
				if (1 === b) 0 === a.tag ? ig(Fk.bind(null, a)) : hg(Fk.bind(null, a)), Jf(function() {
					0 === (K & 6) && jg();
				}), c = null;
				else {
					switch (Dc(d)) {
						case 1:
							c = fc;
							break;
						case 4:
							c = gc;
							break;
						case 16:
							c = hc;
							break;
						case 536870912:
							c = jc;
							break;
						default: c = hc;
					}
					c = Gk(c, Hk.bind(null, a));
				}
				a.callbackPriority = b;
				a.callbackNode = c;
			}
		}
		function Hk(a, b) {
			Bk = -1;
			Ck = 0;
			if (0 !== (K & 6)) throw Error(p(327));
			var c = a.callbackNode;
			if (Ik() && a.callbackNode !== c) return null;
			var d = uc(a, a === R ? Z : 0);
			if (0 === d) return null;
			if (0 !== (d & 30) || 0 !== (d & a.expiredLanes) || b) b = Jk(a, d);
			else {
				b = d;
				var e = K;
				K |= 2;
				var f = Kk();
				if (R !== a || Z !== b) vk = null, Hj = B() + 500, Lk(a, b);
				do
					try {
						Mk();
						break;
					} catch (h) {
						Nk(a, h);
					}
				while (1);
				Qg();
				nk.current = f;
				K = e;
				null !== Y ? b = 0 : (R = null, Z = 0, b = T);
			}
			if (0 !== b) {
				2 === b && (e = xc(a), 0 !== e && (d = e, b = Ok(a, e)));
				if (1 === b) throw c = qk, Lk(a, 0), Dk(a, d), Ek(a, B()), c;
				if (6 === b) Dk(a, d);
				else {
					e = a.current.alternate;
					if (0 === (d & 30) && !Pk(e) && (b = Jk(a, d), 2 === b && (f = xc(a), 0 !== f && (d = f, b = Ok(a, f))), 1 === b)) throw c = qk, Lk(a, 0), Dk(a, d), Ek(a, B()), c;
					a.finishedWork = e;
					a.finishedLanes = d;
					switch (b) {
						case 0:
						case 1: throw Error(p(345));
						case 2:
							Qk(a, uk, vk);
							break;
						case 3:
							Dk(a, d);
							if ((d & 130023424) === d && (b = gk + 500 - B(), 10 < b)) {
								if (0 !== uc(a, 0)) break;
								e = a.suspendedLanes;
								if ((e & d) !== d) {
									L();
									a.pingedLanes |= a.suspendedLanes & e;
									break;
								}
								a.timeoutHandle = Ff(Qk.bind(null, a, uk, vk), b);
								break;
							}
							Qk(a, uk, vk);
							break;
						case 4:
							Dk(a, d);
							if ((d & 4194240) === d) break;
							b = a.eventTimes;
							for (e = -1; 0 < d;) {
								var g = 31 - oc(d);
								f = 1 << g;
								g = b[g];
								g > e && (e = g);
								d &= ~f;
							}
							d = e;
							d = B() - d;
							d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3e3 > d ? 3e3 : 4320 > d ? 4320 : 1960 * mk(d / 1960)) - d;
							if (10 < d) {
								a.timeoutHandle = Ff(Qk.bind(null, a, uk, vk), d);
								break;
							}
							Qk(a, uk, vk);
							break;
						case 5:
							Qk(a, uk, vk);
							break;
						default: throw Error(p(329));
					}
				}
			}
			Ek(a, B());
			return a.callbackNode === c ? Hk.bind(null, a) : null;
		}
		function Ok(a, b) {
			var c = tk;
			a.current.memoizedState.isDehydrated && (Lk(a, b).flags |= 256);
			a = Jk(a, b);
			2 !== a && (b = uk, uk = c, null !== b && Gj(b));
			return a;
		}
		function Gj(a) {
			null === uk ? uk = a : uk.push.apply(uk, a);
		}
		function Pk(a) {
			for (var b = a;;) {
				if (b.flags & 16384) {
					var c = b.updateQueue;
					if (null !== c && (c = c.stores, null !== c)) for (var d = 0; d < c.length; d++) {
						var e = c[d], f = e.getSnapshot;
						e = e.value;
						try {
							if (!He(f(), e)) return !1;
						} catch (g) {
							return !1;
						}
					}
				}
				c = b.child;
				if (b.subtreeFlags & 16384 && null !== c) c.return = b, b = c;
				else {
					if (b === a) break;
					for (; null === b.sibling;) {
						if (null === b.return || b.return === a) return !0;
						b = b.return;
					}
					b.sibling.return = b.return;
					b = b.sibling;
				}
			}
			return !0;
		}
		function Dk(a, b) {
			b &= ~sk;
			b &= ~rk;
			a.suspendedLanes |= b;
			a.pingedLanes &= ~b;
			for (a = a.expirationTimes; 0 < b;) {
				var c = 31 - oc(b), d = 1 << c;
				a[c] = -1;
				b &= ~d;
			}
		}
		function Fk(a) {
			if (0 !== (K & 6)) throw Error(p(327));
			Ik();
			var b = uc(a, 0);
			if (0 === (b & 1)) return Ek(a, B()), null;
			var c = Jk(a, b);
			if (0 !== a.tag && 2 === c) {
				var d = xc(a);
				0 !== d && (b = d, c = Ok(a, d));
			}
			if (1 === c) throw c = qk, Lk(a, 0), Dk(a, b), Ek(a, B()), c;
			if (6 === c) throw Error(p(345));
			a.finishedWork = a.current.alternate;
			a.finishedLanes = b;
			Qk(a, uk, vk);
			Ek(a, B());
			return null;
		}
		function Rk(a, b) {
			var c = K;
			K |= 1;
			try {
				return a(b);
			} finally {
				K = c, 0 === K && (Hj = B() + 500, fg && jg());
			}
		}
		function Sk(a) {
			null !== xk && 0 === xk.tag && 0 === (K & 6) && Ik();
			var b = K;
			K |= 1;
			var c = pk.transition, d = C;
			try {
				if (pk.transition = null, C = 1, a) return a();
			} finally {
				C = d, pk.transition = c, K = b, 0 === (K & 6) && jg();
			}
		}
		function Ij() {
			gj = fj.current;
			E(fj);
		}
		function Lk(a, b) {
			a.finishedWork = null;
			a.finishedLanes = 0;
			var c = a.timeoutHandle;
			-1 !== c && (a.timeoutHandle = -1, Gf(c));
			if (null !== Y) for (c = Y.return; null !== c;) {
				var d = c;
				wg(d);
				switch (d.tag) {
					case 1:
						d = d.type.childContextTypes;
						null !== d && void 0 !== d && $f();
						break;
					case 3:
						Jh();
						E(Wf);
						E(H);
						Oh();
						break;
					case 5:
						Lh(d);
						break;
					case 4:
						Jh();
						break;
					case 13:
						E(M);
						break;
					case 19:
						E(M);
						break;
					case 10:
						Rg(d.type._context);
						break;
					case 22:
					case 23: Ij();
				}
				c = c.return;
			}
			R = a;
			Y = a = wh(a.current, null);
			Z = gj = b;
			T = 0;
			qk = null;
			sk = rk = hh = 0;
			uk = tk = null;
			if (null !== Wg) {
				for (b = 0; b < Wg.length; b++) if (c = Wg[b], d = c.interleaved, null !== d) {
					c.interleaved = null;
					var e = d.next, f = c.pending;
					if (null !== f) {
						var g = f.next;
						f.next = e;
						d.next = g;
					}
					c.pending = d;
				}
				Wg = null;
			}
			return a;
		}
		function Nk(a, b) {
			do {
				var c = Y;
				try {
					Qg();
					Ph.current = ai;
					if (Sh) {
						for (var d = N.memoizedState; null !== d;) {
							var e = d.queue;
							null !== e && (e.pending = null);
							d = d.next;
						}
						Sh = !1;
					}
					Rh = 0;
					P = O = N = null;
					Th = !1;
					Uh = 0;
					ok.current = null;
					if (null === c || null === c.return) {
						T = 1;
						qk = b;
						Y = null;
						break;
					}
					a: {
						var f = a, g = c.return, h = c, k = b;
						b = Z;
						h.flags |= 32768;
						if (null !== k && "object" === typeof k && "function" === typeof k.then) {
							var l = k, m = h, q = m.tag;
							if (0 === (m.mode & 1) && (0 === q || 11 === q || 15 === q)) {
								var r = m.alternate;
								r ? (m.updateQueue = r.updateQueue, m.memoizedState = r.memoizedState, m.lanes = r.lanes) : (m.updateQueue = null, m.memoizedState = null);
							}
							var y = Vi(g);
							if (null !== y) {
								y.flags &= -257;
								Wi(y, g, h, f, b);
								y.mode & 1 && Ti(f, l, b);
								b = y;
								k = l;
								var n = b.updateQueue;
								if (null === n) {
									var t = /* @__PURE__ */ new Set();
									t.add(k);
									b.updateQueue = t;
								} else n.add(k);
								break a;
							} else {
								if (0 === (b & 1)) {
									Ti(f, l, b);
									uj();
									break a;
								}
								k = Error(p(426));
							}
						} else if (I && h.mode & 1) {
							var J = Vi(g);
							if (null !== J) {
								0 === (J.flags & 65536) && (J.flags |= 256);
								Wi(J, g, h, f, b);
								Jg(Ki(k, h));
								break a;
							}
						}
						f = k = Ki(k, h);
						4 !== T && (T = 2);
						null === tk ? tk = [f] : tk.push(f);
						f = g;
						do {
							switch (f.tag) {
								case 3:
									f.flags |= 65536;
									b &= -b;
									f.lanes |= b;
									var x = Oi(f, k, b);
									fh(f, x);
									break a;
								case 1:
									h = k;
									var w = f.type, u = f.stateNode;
									if (0 === (f.flags & 128) && ("function" === typeof w.getDerivedStateFromError || null !== u && "function" === typeof u.componentDidCatch && (null === Si || !Si.has(u)))) {
										f.flags |= 65536;
										b &= -b;
										f.lanes |= b;
										var F = Ri(f, h, b);
										fh(f, F);
										break a;
									}
							}
							f = f.return;
						} while (null !== f);
					}
					Tk(c);
				} catch (na) {
					b = na;
					Y === c && null !== c && (Y = c = c.return);
					continue;
				}
				break;
			} while (1);
		}
		function Kk() {
			var a = nk.current;
			nk.current = ai;
			return null === a ? ai : a;
		}
		function uj() {
			if (0 === T || 3 === T || 2 === T) T = 4;
			null === R || 0 === (hh & 268435455) && 0 === (rk & 268435455) || Dk(R, Z);
		}
		function Jk(a, b) {
			var c = K;
			K |= 2;
			var d = Kk();
			if (R !== a || Z !== b) vk = null, Lk(a, b);
			do
				try {
					Uk();
					break;
				} catch (e) {
					Nk(a, e);
				}
			while (1);
			Qg();
			K = c;
			nk.current = d;
			if (null !== Y) throw Error(p(261));
			R = null;
			Z = 0;
			return T;
		}
		function Uk() {
			for (; null !== Y;) Vk(Y);
		}
		function Mk() {
			for (; null !== Y && !cc();) Vk(Y);
		}
		function Vk(a) {
			var b = Wk(a.alternate, a, gj);
			a.memoizedProps = a.pendingProps;
			null === b ? Tk(a) : Y = b;
			ok.current = null;
		}
		function Tk(a) {
			var b = a;
			do {
				var c = b.alternate;
				a = b.return;
				if (0 === (b.flags & 32768)) {
					if (c = Fj(c, b, gj), null !== c) {
						Y = c;
						return;
					}
				} else {
					c = Jj(c, b);
					if (null !== c) {
						c.flags &= 32767;
						Y = c;
						return;
					}
					if (null !== a) a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
					else {
						T = 6;
						Y = null;
						return;
					}
				}
				b = b.sibling;
				if (null !== b) {
					Y = b;
					return;
				}
				Y = b = a;
			} while (null !== b);
			0 === T && (T = 5);
		}
		function Qk(a, b, c) {
			var d = C, e = pk.transition;
			try {
				pk.transition = null, C = 1, Xk(a, b, c, d);
			} finally {
				pk.transition = e, C = d;
			}
			return null;
		}
		function Xk(a, b, c, d) {
			do
				Ik();
			while (null !== xk);
			if (0 !== (K & 6)) throw Error(p(327));
			c = a.finishedWork;
			var e = a.finishedLanes;
			if (null === c) return null;
			a.finishedWork = null;
			a.finishedLanes = 0;
			if (c === a.current) throw Error(p(177));
			a.callbackNode = null;
			a.callbackPriority = 0;
			var f = c.lanes | c.childLanes;
			Bc(a, f);
			a === R && (Y = R = null, Z = 0);
			0 === (c.subtreeFlags & 2064) && 0 === (c.flags & 2064) || wk || (wk = !0, Gk(hc, function() {
				Ik();
				return null;
			}));
			f = 0 !== (c.flags & 15990);
			if (0 !== (c.subtreeFlags & 15990) || f) {
				f = pk.transition;
				pk.transition = null;
				var g = C;
				C = 1;
				var h = K;
				K |= 4;
				ok.current = null;
				Pj(a, c);
				ek(c, a);
				Oe(Df);
				dd = !!Cf;
				Df = Cf = null;
				a.current = c;
				ik(c, a, e);
				dc();
				K = h;
				C = g;
				pk.transition = f;
			} else a.current = c;
			wk && (wk = !1, xk = a, yk = e);
			f = a.pendingLanes;
			0 === f && (Si = null);
			mc(c.stateNode, d);
			Ek(a, B());
			if (null !== b) for (d = a.onRecoverableError, c = 0; c < b.length; c++) e = b[c], d(e.value, {
				componentStack: e.stack,
				digest: e.digest
			});
			if (Pi) throw Pi = !1, a = Qi, Qi = null, a;
			0 !== (yk & 1) && 0 !== a.tag && Ik();
			f = a.pendingLanes;
			0 !== (f & 1) ? a === Ak ? zk++ : (zk = 0, Ak = a) : zk = 0;
			jg();
			return null;
		}
		function Ik() {
			if (null !== xk) {
				var a = Dc(yk), b = pk.transition, c = C;
				try {
					pk.transition = null;
					C = 16 > a ? 16 : a;
					if (null === xk) var d = !1;
					else {
						a = xk;
						xk = null;
						yk = 0;
						if (0 !== (K & 6)) throw Error(p(331));
						var e = K;
						K |= 4;
						for (V = a.current; null !== V;) {
							var f = V, g = f.child;
							if (0 !== (V.flags & 16)) {
								var h = f.deletions;
								if (null !== h) {
									for (var k = 0; k < h.length; k++) {
										var l = h[k];
										for (V = l; null !== V;) {
											var m = V;
											switch (m.tag) {
												case 0:
												case 11:
												case 15: Qj(8, m, f);
											}
											var q = m.child;
											if (null !== q) q.return = m, V = q;
											else for (; null !== V;) {
												m = V;
												var r = m.sibling, y = m.return;
												Tj(m);
												if (m === l) {
													V = null;
													break;
												}
												if (null !== r) {
													r.return = y;
													V = r;
													break;
												}
												V = y;
											}
										}
									}
									var n = f.alternate;
									if (null !== n) {
										var t = n.child;
										if (null !== t) {
											n.child = null;
											do {
												var J = t.sibling;
												t.sibling = null;
												t = J;
											} while (null !== t);
										}
									}
									V = f;
								}
							}
							if (0 !== (f.subtreeFlags & 2064) && null !== g) g.return = f, V = g;
							else b: for (; null !== V;) {
								f = V;
								if (0 !== (f.flags & 2048)) switch (f.tag) {
									case 0:
									case 11:
									case 15: Qj(9, f, f.return);
								}
								var x = f.sibling;
								if (null !== x) {
									x.return = f.return;
									V = x;
									break b;
								}
								V = f.return;
							}
						}
						var w = a.current;
						for (V = w; null !== V;) {
							g = V;
							var u = g.child;
							if (0 !== (g.subtreeFlags & 2064) && null !== u) u.return = g, V = u;
							else b: for (g = w; null !== V;) {
								h = V;
								if (0 !== (h.flags & 2048)) try {
									switch (h.tag) {
										case 0:
										case 11:
										case 15: Rj(9, h);
									}
								} catch (na) {
									W(h, h.return, na);
								}
								if (h === g) {
									V = null;
									break b;
								}
								var F = h.sibling;
								if (null !== F) {
									F.return = h.return;
									V = F;
									break b;
								}
								V = h.return;
							}
						}
						K = e;
						jg();
						if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
							lc.onPostCommitFiberRoot(kc, a);
						} catch (na) {}
						d = !0;
					}
					return d;
				} finally {
					C = c, pk.transition = b;
				}
			}
			return !1;
		}
		function Yk(a, b, c) {
			b = Ki(c, b);
			b = Oi(a, b, 1);
			a = dh(a, b, 1);
			b = L();
			null !== a && (Ac(a, 1, b), Ek(a, b));
		}
		function W(a, b, c) {
			if (3 === a.tag) Yk(a, a, c);
			else for (; null !== b;) {
				if (3 === b.tag) {
					Yk(b, a, c);
					break;
				} else if (1 === b.tag) {
					var d = b.stateNode;
					if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === Si || !Si.has(d))) {
						a = Ki(c, a);
						a = Ri(b, a, 1);
						b = dh(b, a, 1);
						a = L();
						null !== b && (Ac(b, 1, a), Ek(b, a));
						break;
					}
				}
				b = b.return;
			}
		}
		function Ui(a, b, c) {
			var d = a.pingCache;
			null !== d && d.delete(b);
			b = L();
			a.pingedLanes |= a.suspendedLanes & c;
			R === a && (Z & c) === c && (4 === T || 3 === T && (Z & 130023424) === Z && 500 > B() - gk ? Lk(a, 0) : sk |= c);
			Ek(a, b);
		}
		function Zk(a, b) {
			0 === b && (0 === (a.mode & 1) ? b = 1 : (b = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
			var c = L();
			a = Zg(a, b);
			null !== a && (Ac(a, b, c), Ek(a, c));
		}
		function vj(a) {
			var b = a.memoizedState, c = 0;
			null !== b && (c = b.retryLane);
			Zk(a, c);
		}
		function ck(a, b) {
			var c = 0;
			switch (a.tag) {
				case 13:
					var d = a.stateNode;
					var e = a.memoizedState;
					null !== e && (c = e.retryLane);
					break;
				case 19:
					d = a.stateNode;
					break;
				default: throw Error(p(314));
			}
			null !== d && d.delete(b);
			Zk(a, c);
		}
		var Wk = function(a, b, c) {
			if (null !== a) if (a.memoizedProps !== b.pendingProps || Wf.current) Ug = !0;
			else {
				if (0 === (a.lanes & c) && 0 === (b.flags & 128)) return Ug = !1, zj(a, b, c);
				Ug = 0 !== (a.flags & 131072) ? !0 : !1;
			}
			else Ug = !1, I && 0 !== (b.flags & 1048576) && ug(b, ng, b.index);
			b.lanes = 0;
			switch (b.tag) {
				case 2:
					var d = b.type;
					jj(a, b);
					a = b.pendingProps;
					var e = Yf(b, H.current);
					Tg(b, c);
					e = Xh(null, b, d, a, e, c);
					var f = bi();
					b.flags |= 1;
					"object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d) ? (f = !0, cg(b)) : f = !1, b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, ah(b), e.updater = nh, b.stateNode = e, e._reactInternals = b, rh(b, d, a, c), b = kj(null, b, d, !0, f, c)) : (b.tag = 0, I && f && vg(b), Yi(null, b, e, c), b = b.child);
					return b;
				case 16:
					d = b.elementType;
					a: {
						jj(a, b);
						a = b.pendingProps;
						e = d._init;
						d = e(d._payload);
						b.type = d;
						e = b.tag = $k(d);
						a = Lg(d, a);
						switch (e) {
							case 0:
								b = dj(null, b, d, a, c);
								break a;
							case 1:
								b = ij(null, b, d, a, c);
								break a;
							case 11:
								b = Zi(null, b, d, a, c);
								break a;
							case 14:
								b = aj(null, b, d, Lg(d.type, a), c);
								break a;
						}
						throw Error(p(306, d, ""));
					}
					return b;
				case 0: return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Lg(d, e), dj(a, b, d, e, c);
				case 1: return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Lg(d, e), ij(a, b, d, e, c);
				case 3:
					a: {
						lj(b);
						if (null === a) throw Error(p(387));
						d = b.pendingProps;
						f = b.memoizedState;
						e = f.element;
						bh(a, b);
						gh(b, d, null, c);
						var g = b.memoizedState;
						d = g.element;
						if (f.isDehydrated) if (f = {
							element: d,
							isDehydrated: !1,
							cache: g.cache,
							pendingSuspenseBoundaries: g.pendingSuspenseBoundaries,
							transitions: g.transitions
						}, b.updateQueue.baseState = f, b.memoizedState = f, b.flags & 256) {
							e = Ki(Error(p(423)), b);
							b = mj(a, b, d, c, e);
							break a;
						} else if (d !== e) {
							e = Ki(Error(p(424)), b);
							b = mj(a, b, d, c, e);
							break a;
						} else for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I = !0, zg = null, c = Ch(b, null, d, c), b.child = c; c;) c.flags = c.flags & -3 | 4096, c = c.sibling;
						else {
							Ig();
							if (d === e) {
								b = $i(a, b, c);
								break a;
							}
							Yi(a, b, d, c);
						}
						b = b.child;
					}
					return b;
				case 5: return Kh(b), null === a && Eg(b), d = b.type, e = b.pendingProps, f = null !== a ? a.memoizedProps : null, g = e.children, Ef(d, e) ? g = null : null !== f && Ef(d, f) && (b.flags |= 32), hj(a, b), Yi(a, b, g, c), b.child;
				case 6: return null === a && Eg(b), null;
				case 13: return pj(a, b, c);
				case 4: return Ih(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Bh(b, null, d, c) : Yi(a, b, d, c), b.child;
				case 11: return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Lg(d, e), Zi(a, b, d, e, c);
				case 7: return Yi(a, b, b.pendingProps, c), b.child;
				case 8: return Yi(a, b, b.pendingProps.children, c), b.child;
				case 12: return Yi(a, b, b.pendingProps.children, c), b.child;
				case 10:
					a: {
						d = b.type._context;
						e = b.pendingProps;
						f = b.memoizedProps;
						g = e.value;
						G(Mg, d._currentValue);
						d._currentValue = g;
						if (null !== f) if (He(f.value, g)) {
							if (f.children === e.children && !Wf.current) {
								b = $i(a, b, c);
								break a;
							}
						} else for (f = b.child, null !== f && (f.return = b); null !== f;) {
							var h = f.dependencies;
							if (null !== h) {
								g = f.child;
								for (var k = h.firstContext; null !== k;) {
									if (k.context === d) {
										if (1 === f.tag) {
											k = ch(-1, c & -c);
											k.tag = 2;
											var l = f.updateQueue;
											if (null !== l) {
												l = l.shared;
												var m = l.pending;
												null === m ? k.next = k : (k.next = m.next, m.next = k);
												l.pending = k;
											}
										}
										f.lanes |= c;
										k = f.alternate;
										null !== k && (k.lanes |= c);
										Sg(f.return, c, b);
										h.lanes |= c;
										break;
									}
									k = k.next;
								}
							} else if (10 === f.tag) g = f.type === b.type ? null : f.child;
							else if (18 === f.tag) {
								g = f.return;
								if (null === g) throw Error(p(341));
								g.lanes |= c;
								h = g.alternate;
								null !== h && (h.lanes |= c);
								Sg(g, c, b);
								g = f.sibling;
							} else g = f.child;
							if (null !== g) g.return = f;
							else for (g = f; null !== g;) {
								if (g === b) {
									g = null;
									break;
								}
								f = g.sibling;
								if (null !== f) {
									f.return = g.return;
									g = f;
									break;
								}
								g = g.return;
							}
							f = g;
						}
						Yi(a, b, e.children, c);
						b = b.child;
					}
					return b;
				case 9: return e = b.type, d = b.pendingProps.children, Tg(b, c), e = Vg(e), d = d(e), b.flags |= 1, Yi(a, b, d, c), b.child;
				case 14: return d = b.type, e = Lg(d, b.pendingProps), e = Lg(d.type, e), aj(a, b, d, e, c);
				case 15: return cj(a, b, b.type, b.pendingProps, c);
				case 17: return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Lg(d, e), jj(a, b), b.tag = 1, Zf(d) ? (a = !0, cg(b)) : a = !1, Tg(b, c), ph(b, d, e), rh(b, d, e, c), kj(null, b, d, !0, a, c);
				case 19: return yj(a, b, c);
				case 22: return ej(a, b, c);
			}
			throw Error(p(156, b.tag));
		};
		function Gk(a, b) {
			return ac(a, b);
		}
		function al(a, b, c, d) {
			this.tag = a;
			this.key = c;
			this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
			this.index = 0;
			this.ref = null;
			this.pendingProps = b;
			this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
			this.mode = d;
			this.subtreeFlags = this.flags = 0;
			this.deletions = null;
			this.childLanes = this.lanes = 0;
			this.alternate = null;
		}
		function Bg(a, b, c, d) {
			return new al(a, b, c, d);
		}
		function bj(a) {
			a = a.prototype;
			return !(!a || !a.isReactComponent);
		}
		function $k(a) {
			if ("function" === typeof a) return bj(a) ? 1 : 0;
			if (void 0 !== a && null !== a) {
				a = a.$$typeof;
				if (a === Da) return 11;
				if (a === Ga) return 14;
			}
			return 2;
		}
		function wh(a, b) {
			var c = a.alternate;
			null === c ? (c = Bg(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
			c.flags = a.flags & 14680064;
			c.childLanes = a.childLanes;
			c.lanes = a.lanes;
			c.child = a.child;
			c.memoizedProps = a.memoizedProps;
			c.memoizedState = a.memoizedState;
			c.updateQueue = a.updateQueue;
			b = a.dependencies;
			c.dependencies = null === b ? null : {
				lanes: b.lanes,
				firstContext: b.firstContext
			};
			c.sibling = a.sibling;
			c.index = a.index;
			c.ref = a.ref;
			return c;
		}
		function yh(a, b, c, d, e, f) {
			var g = 2;
			d = a;
			if ("function" === typeof a) bj(a) && (g = 1);
			else if ("string" === typeof a) g = 5;
			else a: switch (a) {
				case ya: return Ah(c.children, e, f, b);
				case za:
					g = 8;
					e |= 8;
					break;
				case Aa: return a = Bg(12, c, b, e | 2), a.elementType = Aa, a.lanes = f, a;
				case Ea: return a = Bg(13, c, b, e), a.elementType = Ea, a.lanes = f, a;
				case Fa: return a = Bg(19, c, b, e), a.elementType = Fa, a.lanes = f, a;
				case Ia: return qj(c, e, f, b);
				default:
					if ("object" === typeof a && null !== a) switch (a.$$typeof) {
						case Ba:
							g = 10;
							break a;
						case Ca:
							g = 9;
							break a;
						case Da:
							g = 11;
							break a;
						case Ga:
							g = 14;
							break a;
						case Ha:
							g = 16;
							d = null;
							break a;
					}
					throw Error(p(130, null == a ? a : typeof a, ""));
			}
			b = Bg(g, c, b, e);
			b.elementType = a;
			b.type = d;
			b.lanes = f;
			return b;
		}
		function Ah(a, b, c, d) {
			a = Bg(7, a, d, b);
			a.lanes = c;
			return a;
		}
		function qj(a, b, c, d) {
			a = Bg(22, a, d, b);
			a.elementType = Ia;
			a.lanes = c;
			a.stateNode = { isHidden: !1 };
			return a;
		}
		function xh(a, b, c) {
			a = Bg(6, a, null, b);
			a.lanes = c;
			return a;
		}
		function zh(a, b, c) {
			b = Bg(4, null !== a.children ? a.children : [], a.key, b);
			b.lanes = c;
			b.stateNode = {
				containerInfo: a.containerInfo,
				pendingChildren: null,
				implementation: a.implementation
			};
			return b;
		}
		function bl(a, b, c, d, e) {
			this.tag = b;
			this.containerInfo = a;
			this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
			this.timeoutHandle = -1;
			this.callbackNode = this.pendingContext = this.context = null;
			this.callbackPriority = 0;
			this.eventTimes = zc(0);
			this.expirationTimes = zc(-1);
			this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
			this.entanglements = zc(0);
			this.identifierPrefix = d;
			this.onRecoverableError = e;
			this.mutableSourceEagerHydrationData = null;
		}
		function cl(a, b, c, d, e, f, g, h, k) {
			a = new bl(a, b, c, h, k);
			1 === b ? (b = 1, !0 === f && (b |= 8)) : b = 0;
			f = Bg(3, null, null, b);
			a.current = f;
			f.stateNode = a;
			f.memoizedState = {
				element: d,
				isDehydrated: c,
				cache: null,
				transitions: null,
				pendingSuspenseBoundaries: null
			};
			ah(f);
			return a;
		}
		function dl(a, b, c) {
			var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
			return {
				$$typeof: wa,
				key: null == d ? null : "" + d,
				children: a,
				containerInfo: b,
				implementation: c
			};
		}
		function el(a) {
			if (!a) return Vf;
			a = a._reactInternals;
			a: {
				if (Vb(a) !== a || 1 !== a.tag) throw Error(p(170));
				var b = a;
				do {
					switch (b.tag) {
						case 3:
							b = b.stateNode.context;
							break a;
						case 1: if (Zf(b.type)) {
							b = b.stateNode.__reactInternalMemoizedMergedChildContext;
							break a;
						}
					}
					b = b.return;
				} while (null !== b);
				throw Error(p(171));
			}
			if (1 === a.tag) {
				var c = a.type;
				if (Zf(c)) return bg(a, c, b);
			}
			return b;
		}
		function fl(a, b, c, d, e, f, g, h, k) {
			a = cl(c, d, !0, a, e, f, g, h, k);
			a.context = el(null);
			c = a.current;
			d = L();
			e = lh(c);
			f = ch(d, e);
			f.callback = void 0 !== b && null !== b ? b : null;
			dh(c, f, e);
			a.current.lanes = e;
			Ac(a, e, d);
			Ek(a, d);
			return a;
		}
		function gl(a, b, c, d) {
			var e = b.current, f = L(), g = lh(e);
			c = el(c);
			null === b.context ? b.context = c : b.pendingContext = c;
			b = ch(f, g);
			b.payload = { element: a };
			d = void 0 === d ? null : d;
			null !== d && (b.callback = d);
			a = dh(e, b, g);
			null !== a && (mh(a, e, g, f), eh(a, e, g));
			return g;
		}
		function hl(a) {
			a = a.current;
			if (!a.child) return null;
			switch (a.child.tag) {
				case 5: return a.child.stateNode;
				default: return a.child.stateNode;
			}
		}
		function il(a, b) {
			a = a.memoizedState;
			if (null !== a && null !== a.dehydrated) {
				var c = a.retryLane;
				a.retryLane = 0 !== c && c < b ? c : b;
			}
		}
		function jl(a, b) {
			il(a, b);
			(a = a.alternate) && il(a, b);
		}
		function kl() {
			return null;
		}
		var ll = "function" === typeof reportError ? reportError : function(a) {
			console.error(a);
		};
		function ml(a) {
			this._internalRoot = a;
		}
		nl.prototype.render = ml.prototype.render = function(a) {
			var b = this._internalRoot;
			if (null === b) throw Error(p(409));
			gl(a, b, null, null);
		};
		nl.prototype.unmount = ml.prototype.unmount = function() {
			var a = this._internalRoot;
			if (null !== a) {
				this._internalRoot = null;
				var b = a.containerInfo;
				Sk(function() {
					gl(null, a, null, null);
				});
				b[uf] = null;
			}
		};
		function nl(a) {
			this._internalRoot = a;
		}
		nl.prototype.unstable_scheduleHydration = function(a) {
			if (a) {
				var b = Hc();
				a = {
					blockedOn: null,
					target: a,
					priority: b
				};
				for (var c = 0; c < Qc.length && 0 !== b && b < Qc[c].priority; c++);
				Qc.splice(c, 0, a);
				0 === c && Vc(a);
			}
		};
		function ol(a) {
			return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType);
		}
		function pl(a) {
			return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType && (8 !== a.nodeType || " react-mount-point-unstable " !== a.nodeValue));
		}
		function ql() {}
		function rl(a, b, c, d, e) {
			if (e) {
				if ("function" === typeof d) {
					var f = d;
					d = function() {
						var a = hl(g);
						f.call(a);
					};
				}
				var g = fl(b, d, a, 0, null, !1, !1, "", ql);
				a._reactRootContainer = g;
				a[uf] = g.current;
				sf(8 === a.nodeType ? a.parentNode : a);
				Sk();
				return g;
			}
			for (; e = a.lastChild;) a.removeChild(e);
			if ("function" === typeof d) {
				var h = d;
				d = function() {
					var a = hl(k);
					h.call(a);
				};
			}
			var k = cl(a, 0, !1, null, null, !1, !1, "", ql);
			a._reactRootContainer = k;
			a[uf] = k.current;
			sf(8 === a.nodeType ? a.parentNode : a);
			Sk(function() {
				gl(b, k, c, d);
			});
			return k;
		}
		function sl(a, b, c, d, e) {
			var f = c._reactRootContainer;
			if (f) {
				var g = f;
				if ("function" === typeof e) {
					var h = e;
					e = function() {
						var a = hl(g);
						h.call(a);
					};
				}
				gl(b, g, a, e);
			} else g = rl(c, b, a, e, d);
			return hl(g);
		}
		Ec = function(a) {
			switch (a.tag) {
				case 3:
					var b = a.stateNode;
					if (b.current.memoizedState.isDehydrated) {
						var c = tc(b.pendingLanes);
						0 !== c && (Cc(b, c | 1), Ek(b, B()), 0 === (K & 6) && (Hj = B() + 500, jg()));
					}
					break;
				case 13: Sk(function() {
					var b = Zg(a, 1);
					if (null !== b) mh(b, a, 1, L());
				}), jl(a, 1);
			}
		};
		Fc = function(a) {
			if (13 === a.tag) {
				var b = Zg(a, 134217728);
				if (null !== b) mh(b, a, 134217728, L());
				jl(a, 134217728);
			}
		};
		Gc = function(a) {
			if (13 === a.tag) {
				var b = lh(a), c = Zg(a, b);
				if (null !== c) mh(c, a, b, L());
				jl(a, b);
			}
		};
		Hc = function() {
			return C;
		};
		Ic = function(a, b) {
			var c = C;
			try {
				return C = a, b();
			} finally {
				C = c;
			}
		};
		yb = function(a, b, c) {
			switch (b) {
				case "input":
					bb(a, c);
					b = c.name;
					if ("radio" === c.type && null != b) {
						for (c = a; c.parentNode;) c = c.parentNode;
						c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + "][type=\"radio\"]");
						for (b = 0; b < c.length; b++) {
							var d = c[b];
							if (d !== a && d.form === a.form) {
								var e = Db(d);
								if (!e) throw Error(p(90));
								Wa(d);
								bb(d, e);
							}
						}
					}
					break;
				case "textarea":
					ib(a, c);
					break;
				case "select": b = c.value, null != b && fb(a, !!c.multiple, b, !1);
			}
		};
		Gb = Rk;
		Hb = Sk;
		var tl = {
			usingClientEntryPoint: !1,
			Events: [
				Cb,
				ue,
				Db,
				Eb,
				Fb,
				Rk
			]
		};
		var ul = {
			findFiberByHostInstance: Wc,
			bundleType: 0,
			version: "18.2.0",
			rendererPackageName: "react-dom"
		};
		var vl = {
			bundleType: ul.bundleType,
			version: ul.version,
			rendererPackageName: ul.rendererPackageName,
			rendererConfig: ul.rendererConfig,
			overrideHookState: null,
			overrideHookStateDeletePath: null,
			overrideHookStateRenamePath: null,
			overrideProps: null,
			overridePropsDeletePath: null,
			overridePropsRenamePath: null,
			setErrorHandler: null,
			setSuspenseHandler: null,
			scheduleUpdate: null,
			currentDispatcherRef: ua.ReactCurrentDispatcher,
			findHostInstanceByFiber: function(a) {
				a = Zb(a);
				return null === a ? null : a.stateNode;
			},
			findFiberByHostInstance: ul.findFiberByHostInstance || kl,
			findHostInstancesForRefresh: null,
			scheduleRefresh: null,
			scheduleRoot: null,
			setRefreshHandler: null,
			getCurrentFiber: null,
			reconcilerVersion: "18.2.0-next-9e3b772b8-20220608"
		};
		if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
			var wl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
			if (!wl.isDisabled && wl.supportsFiber) try {
				kc = wl.inject(vl), lc = wl;
			} catch (a) {}
		}
		exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = tl;
		exports.createPortal = function(a, b) {
			var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
			if (!ol(b)) throw Error(p(200));
			return dl(a, b, null, c);
		};
		exports.createRoot = function(a, b) {
			if (!ol(a)) throw Error(p(299));
			var c = !1, d = "", e = ll;
			null !== b && void 0 !== b && (!0 === b.unstable_strictMode && (c = !0), void 0 !== b.identifierPrefix && (d = b.identifierPrefix), void 0 !== b.onRecoverableError && (e = b.onRecoverableError));
			b = cl(a, 1, !1, null, null, c, !1, d, e);
			a[uf] = b.current;
			sf(8 === a.nodeType ? a.parentNode : a);
			return new ml(b);
		};
		exports.findDOMNode = function(a) {
			if (null == a) return null;
			if (1 === a.nodeType) return a;
			var b = a._reactInternals;
			if (void 0 === b) {
				if ("function" === typeof a.render) throw Error(p(188));
				a = Object.keys(a).join(",");
				throw Error(p(268, a));
			}
			a = Zb(b);
			a = null === a ? null : a.stateNode;
			return a;
		};
		exports.flushSync = function(a) {
			return Sk(a);
		};
		exports.hydrate = function(a, b, c) {
			if (!pl(b)) throw Error(p(200));
			return sl(null, a, b, !0, c);
		};
		exports.hydrateRoot = function(a, b, c) {
			if (!ol(a)) throw Error(p(405));
			var d = null != c && c.hydratedSources || null, e = !1, f = "", g = ll;
			null !== c && void 0 !== c && (!0 === c.unstable_strictMode && (e = !0), void 0 !== c.identifierPrefix && (f = c.identifierPrefix), void 0 !== c.onRecoverableError && (g = c.onRecoverableError));
			b = fl(b, null, a, 1, null != c ? c : null, e, !1, f, g);
			a[uf] = b.current;
			sf(a);
			if (d) for (a = 0; a < d.length; a++) c = d[a], e = c._getVersion, e = e(c._source), null == b.mutableSourceEagerHydrationData ? b.mutableSourceEagerHydrationData = [c, e] : b.mutableSourceEagerHydrationData.push(c, e);
			return new nl(b);
		};
		exports.render = function(a, b, c) {
			if (!pl(b)) throw Error(p(200));
			return sl(null, a, b, !1, c);
		};
		exports.unmountComponentAtNode = function(a) {
			if (!pl(a)) throw Error(p(40));
			return a._reactRootContainer ? (Sk(function() {
				sl(null, null, a, !1, function() {
					a._reactRootContainer = null;
					a[uf] = null;
				});
			}), !0) : !1;
		};
		exports.unstable_batchedUpdates = Rk;
		exports.unstable_renderSubtreeIntoContainer = function(a, b, c, d) {
			if (!pl(c)) throw Error(p(200));
			if (null == a || void 0 === a._reactInternals) throw Error(p(38));
			return sl(a, b, c, !1, d);
		};
		exports.version = "18.2.0-next-9e3b772b8-20220608";
	}));
	//#endregion
	//#region node_modules/.pnpm/react-dom@18.2.0_react@18.2.0/node_modules/react-dom/index.js
	var require_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function checkDCE() {
			if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
			try {
				__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
			} catch (err) {
				console.error(err);
			}
		}
		checkDCE();
		module.exports = require_react_dom_production_min();
	}));
	//#endregion
	//#region node_modules/.pnpm/react-dom@18.2.0_react@18.2.0/node_modules/react-dom/client.js
	var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
		var m = require_react_dom();
		exports.createRoot = m.createRoot;
		exports.hydrateRoot = m.hydrateRoot;
	}));
	//#endregion
	//#region src/client/theme.ts
	var import_react = require_react();
	var import_client = require_client();
	const theme = {
		bg: "#11131a",
		panel: "#181b23",
		border: "#262a35",
		text: "#e6e9ef",
		muted: "#9aa4b2",
		accent: "#6af",
		warn: "#e0a23c",
		card: "#1c2029",
		cardActive: "#232a38"
	};
	//#endregion
	//#region src/client/graph/graph-layout.ts
	const DEFAULT_COLUMN_GAP = 240;
	const DEFAULT_ROW_GAP = 96;
	const DEFAULT_NODE_WIDTH = 200;
	const DEFAULT_NODE_HEIGHT = 72;
	function layoutLayered(graph, options = {}) {
		const columnGap = options.columnGap ?? DEFAULT_COLUMN_GAP;
		const rowGap = options.rowGap ?? DEFAULT_ROW_GAP;
		const nodeWidth = options.nodeWidth ?? DEFAULT_NODE_WIDTH;
		const nodeHeight = options.nodeHeight ?? DEFAULT_NODE_HEIGHT;
		const children = /* @__PURE__ */ new Map();
		for (const [id, node] of graph.nodes) {
			const parentId = node.parentId;
			if (parentId === null || !graph.nodes.has(parentId)) continue;
			const siblings = children.get(parentId);
			if (siblings === void 0) children.set(parentId, [id]);
			else siblings.push(id);
		}
		/** Row index per node; fractional when a node is centred between two children. */
		const rows = /* @__PURE__ */ new Map();
		const settled = /* @__PURE__ */ new Set();
		let nextRow = 0;
		const place = (id) => {
			if (settled.has(id)) return rows.get(id);
			settled.add(id);
			const childRows = (children.get(id) ?? []).filter((child) => !settled.has(child)).map((child) => place(child)).filter((row) => row !== void 0);
			const row = childRows.length === 0 ? nextRow++ : (Math.min(...childRows) + Math.max(...childRows)) / 2;
			rows.set(id, row);
			return row;
		};
		for (const root of graph.roots) place(root);
		for (const id of graph.nodes.keys()) place(id);
		const positions = /* @__PURE__ */ new Map();
		let maxX = 0;
		let maxY = 0;
		for (const [id, row] of rows) {
			const node = graph.nodes.get(id);
			if (node === void 0) continue;
			const point = {
				x: node.depth * columnGap,
				y: row * rowGap
			};
			positions.set(id, point);
			if (point.x > maxX) maxX = point.x;
			if (point.y > maxY) maxY = point.y;
		}
		if (positions.size === 0) return {
			positions,
			width: 0,
			height: 0
		};
		return {
			positions,
			width: maxX + nodeWidth,
			height: maxY + nodeHeight
		};
	}
	//#endregion
	//#region src/client/graph/graph-model.ts
	/**
	* Nodes hidden because their subtree root is collapsed: each collapsed node
	* hides its entire descendant set (BFS over children), but never itself.
	*/
	function hiddenByCollapse(nodes, collapsed) {
		const children = /* @__PURE__ */ new Map();
		for (const node of nodes.values()) {
			if (node.parentId === null) continue;
			const bucket = children.get(node.parentId);
			if (bucket === void 0) children.set(node.parentId, [node.id]);
			else bucket.push(node.id);
		}
		const hidden = /* @__PURE__ */ new Set();
		const queue = [];
		for (const id of collapsed) if (nodes.has(id)) queue.push(id);
		while (queue.length > 0) {
			const current = queue.shift();
			for (const child of children.get(current) ?? []) if (!hidden.has(child)) {
				hidden.add(child);
				queue.push(child);
			}
		}
		return hidden;
	}
	//#endregion
	//#region src/client/graph/parallel-write.ts
	/**
	* Which nodes should carry the 「⚠ 并行写入」 badge.
	*
	* A node is flagged when a **different running session shares its directory** —
	* someone else may be writing the same files. Two consequences worth stating:
	* a node that is the only running session in its directory has nobody to collide
	* with, so it is not flagged; and an *idle* node in a directory someone else is
	* running in **is** flagged, because forking it would put a second writer there.
	*
	* Counted per directory rather than scanned pairwise, so this stays linear on the
	* 500-node stress fixture.
	*/
	function parallelWriteIds(graph) {
		const runningByCwd = /* @__PURE__ */ new Map();
		for (const node of graph.nodes.values()) {
			if (!node.running || node.cwd === null) continue;
			runningByCwd.set(node.cwd, (runningByCwd.get(node.cwd) ?? 0) + 1);
		}
		const flagged = /* @__PURE__ */ new Set();
		for (const node of graph.nodes.values()) {
			if (node.cwd === null) continue;
			if ((runningByCwd.get(node.cwd) ?? 0) - (node.running ? 1 : 0) > 0) flagged.add(node.id);
		}
		return flagged;
	}
	//#endregion
	//#region src/client/live/live-tail.ts
	/**
	* The most recent output as a bounded one-liner: the answer text wins, then
	* the reasoning. Both are shown tail-anchored — a streaming line is read from
	* its end, so the newest characters are the ones worth the width.
	*/
	function tailSnippet(tail, limit) {
		if (tail.phase === "tool" && tail.tool !== void 0) return {
			label: "工具",
			text: tail.tool.name !== "" ? tail.tool.name : "…"
		};
		const source = tail.text !== "" ? tail.text : tail.reasoning;
		if (source === "") return null;
		const collapsed = source.replace(/\s+/g, " ").trim();
		if (collapsed === "") return null;
		return {
			label: tail.text !== "" ? "输出" : "推理",
			text: collapsed.length <= limit ? collapsed : collapsed.slice(-limit)
		};
	}
	//#endregion
	//#region node_modules/.pnpm/react@18.2.0/node_modules/react/cjs/react-jsx-runtime.production.min.js
	/**
	* @license React
	* react-jsx-runtime.production.min.js
	*
	* Copyright (c) Facebook, Inc. and its affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var require_react_jsx_runtime_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
		var f = require_react();
		var k = Symbol.for("react.element");
		var l = Symbol.for("react.fragment");
		var m = Object.prototype.hasOwnProperty;
		var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
		var p = {
			key: !0,
			ref: !0,
			__self: !0,
			__source: !0
		};
		function q(c, a, g) {
			var b, d = {}, e = null, h = null;
			void 0 !== g && (e = "" + g);
			void 0 !== a.key && (e = "" + a.key);
			void 0 !== a.ref && (h = a.ref);
			for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
			if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
			return {
				$$typeof: k,
				type: c,
				key: e,
				ref: h,
				props: d,
				_owner: n.current
			};
		}
		exports.Fragment = l;
		exports.jsx = q;
		exports.jsxs = q;
	}));
	//#endregion
	//#region src/client/ui/NodeCard.tsx
	var import_jsx_runtime = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = require_react_jsx_runtime_production_min();
	})))();
	const NodeCard = ({ node, status, position, width, height, selected, comparing, parallelWrite, highlight, live = null, active = false, dimmed = false, now, onClick, onOpen, onInspect, onContext, onMouseEnter, onMouseLeave, collapseToggle }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-canvas-node": node.id,
		className: "dsh-node-card",
		title: node.title,
		"data-selected": selected ? "true" : "false",
		"data-comparing": comparing ? "true" : "false",
		"data-highlight": highlight ? "true" : "false",
		"data-node-active": active ? "true" : "false",
		onClick: (event) => onClick(event, node.id),
		onDoubleClick: (event) => {
			event.stopPropagation();
			onOpen?.(node.id);
		},
		onContextMenu: onContext === void 0 ? void 0 : (event) => {
			event.preventDefault();
			onContext(event, node.id);
		},
		onMouseEnter: onMouseEnter === void 0 ? void 0 : () => onMouseEnter(node.id),
		onMouseLeave: onMouseLeave === void 0 ? void 0 : () => onMouseLeave(node.id),
		style: {
			position: "absolute",
			left: position.x,
			top: position.y,
			width,
			height,
			boxSizing: "border-box",
			padding: "8px 10px",
			borderRadius: 10,
			background: selected ? theme.cardActive : theme.card,
			border: `1px solid ${selected ? theme.accent : highlight ? theme.warn : theme.border}`,
			outline: comparing ? `2px solid ${theme.accent}` : void 0,
			outlineOffset: 2,
			color: theme.text,
			font: "12px/1.45 system-ui, sans-serif",
			cursor: "pointer",
			overflow: "hidden",
			userSelect: "none",
			opacity: dimmed ? .72 : 1,
			...active ? {
				animation: "dshCanvasBreath 1.6s ease-in-out infinite",
				["--breath-color"]: status.color
			} : {}
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 6
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-node-status": status.kind,
						title: status.confirmed ? status.label : `${status.label}（推断）`,
						style: {
							width: 8,
							height: 8,
							borderRadius: 4,
							flex: "0 0 auto",
							background: status.color,
							opacity: status.confirmed ? 1 : .65
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontWeight: 600,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap"
						},
						children: node.title
					}),
					node.seeded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-node-seeded": "true",
						title: "分叉会话",
						style: {
							color: theme.accent,
							flex: "0 0 auto"
						},
						children: "⑂"
					}),
					node.teamTasks !== void 0 && node.teamTasks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-node-team-task": true,
						title: node.teamTasks.join(" | "),
						style: {
							color: theme.warn,
							marginTop: 2,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							fontSize: 10
						},
						children: [
							"⚡ ",
							node.teamTasks[0],
							node.teamTasks.length > 1 ? ` +${node.teamTasks.length - 1}` : ""
						]
					}),
					node.teamRole !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-node-team": node.teamRole,
						title: node.teamRole === "lead" ? "团队主管" : "团队成员",
						style: {
							flex: "0 0 auto",
							color: theme.warn,
							border: `1px solid ${theme.warn}88`,
							borderRadius: 4,
							padding: "0 3px",
							fontSize: 10,
							lineHeight: "14px"
						},
						children: node.teamRole === "lead" ? "主管" : "成员"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					color: theme.muted,
					marginTop: 4,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap"
				},
				children: [
					status.label,
					" · ",
					relativeTime(now, node.createdAt),
					" · ",
					node.childCount,
					" 分支",
					node.externalParent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						title: "父会话不在当前工作区",
						children: " · 外部父"
					})
				]
			}),
			collapseToggle !== void 0 && collapseToggle.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-node-collapse": node.id,
				title: collapseToggle.collapsed ? "展开子树" : "收起子树",
				onClick: (event) => {
					event.stopPropagation();
					collapseToggle.onToggle();
				},
				style: {
					position: "absolute",
					top: 5,
					right: 28,
					width: 18,
					height: 18,
					lineHeight: "16px",
					textAlign: "center",
					background: theme.card,
					color: theme.muted,
					border: `1px solid ${theme.border}`,
					borderRadius: 5,
					font: "11px system-ui, sans-serif",
					cursor: "pointer",
					padding: 0
				},
				children: collapseToggle.collapsed ? "+" : "−"
			}),
			onInspect !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-node-inspect": node.id,
				title: "Agent 实况：查看这个会话的 agent 蛛网",
				className: "dsh-canvas-inspect",
				onClick: (event) => {
					event.stopPropagation();
					onInspect(node.id);
				},
				style: {
					position: "absolute",
					top: 5,
					right: 5,
					width: 20,
					height: 20,
					lineHeight: "17px",
					textAlign: "center",
					background: theme.card,
					color: theme.muted,
					border: `1px solid ${theme.border}`,
					borderRadius: 6,
					font: "12px system-ui, sans-serif",
					cursor: "pointer",
					padding: 0
				},
				children: "⌖"
			}),
			live != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-node-live": true,
				style: {
					display: "flex",
					gap: 4,
					marginTop: 2,
					overflow: "hidden",
					whiteSpace: "nowrap",
					color: theme.muted
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-node-live-label": true,
					style: {
						flex: "0 0 auto",
						color: live.label === "工具" ? theme.accent : theme.muted
					},
					children: live.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						overflow: "hidden",
						textOverflow: "ellipsis"
					},
					children: live.text
				})]
			}),
			parallelWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-node-parallel-write": "true",
				style: {
					color: theme.warn,
					marginTop: 2
				},
				children: "⚠ 并行写入"
			})
		]
	});
	/** Coarse relative time; the canvas only needs "how long ago" at a glance. */
	function relativeTime(now, at) {
		const seconds = Math.max(0, Math.round((now - at) / 1e3));
		if (seconds < 60) return "刚刚";
		const minutes = Math.round(seconds / 60);
		if (minutes < 60) return `${minutes} 分钟前`;
		const hours = Math.round(minutes / 60);
		if (hours < 24) return `${hours} 小时前`;
		return `${Math.round(hours / 24)} 天前`;
	}
	//#endregion
	//#region src/client/ui/RightPanel.tsx
	/** Sliding right-hand container holding the 详情 and 对比 views. */
	const RightPanel = ({ tab, title, headerAction, onTabChange, onClose, children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		"data-right-panel": true,
		style: {
			width: 360,
			flex: "0 0 360px",
			display: "flex",
			flexDirection: "column",
			background: theme.panel,
			borderLeft: `1px solid ${theme.border}`,
			font: "12px system-ui, sans-serif",
			color: theme.text
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-panel-header": true,
			style: {
				display: "flex",
				alignItems: "center",
				gap: 8,
				padding: "6px 10px",
				borderBottom: `1px solid ${theme.border}`
			},
			children: [
				["detail", "compare"].map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-panel-tab": candidate,
					"data-active": tab === candidate ? "true" : "false",
					onClick: () => onTabChange(candidate),
					style: {
						background: "transparent",
						color: tab === candidate ? theme.text : theme.muted,
						border: "none",
						borderBottom: `2px solid ${tab === candidate ? theme.accent : "transparent"}`,
						padding: "4px 6px",
						font: "inherit",
						cursor: "pointer"
					},
					children: candidate === "detail" ? "详情" : "对比"
				}, candidate)),
				title !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						color: theme.muted,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap"
					},
					children: title
				}),
				headerAction !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-panel-action": true,
					title: headerAction.title,
					onClick: headerAction.onClick,
					style: {
						marginLeft: "auto",
						background: theme.card,
						color: theme.accent,
						border: `1px solid ${theme.accent}66`,
						borderRadius: 6,
						padding: "3px 10px",
						font: "inherit",
						cursor: "pointer",
						whiteSpace: "nowrap"
					},
					children: headerAction.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-panel-close": true,
					onClick: onClose,
					"aria-label": "关闭",
					style: {
						marginLeft: headerAction === void 0 ? "auto" : 0,
						background: "transparent",
						color: theme.muted,
						border: "none",
						font: "inherit",
						cursor: "pointer"
					},
					children: "✕"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-panel-body": true,
			style: {
				flex: "1 1 auto",
				overflow: "auto",
				position: "relative"
			},
			children
		})]
	});
	//#endregion
	//#region src/client/swarm/swarm-model.ts
	/**
	* Radial web layout: the root at the origin, depth-1 agents evenly spaced on
	* the main ring, deeper agents orbiting their own parent on a smaller ring.
	* The ring radius adapts to the member count so station cards never overlap.
	* Deterministic — the same agent set always draws the same web.
	*/
	function layoutSwarm(agents, rootId, opts = {}) {
		const cardWidth = opts.cardWidth ?? 230;
		const minRing = opts.radius ?? 230;
		const childRadius = opts.childRadius ?? 95;
		const positions = /* @__PURE__ */ new Map();
		positions.set(rootId, {
			x: 0,
			y: 0
		});
		const byParent = /* @__PURE__ */ new Map();
		for (const agent of agents) {
			if (agent.id === rootId) continue;
			const key = agent.parentId ?? "__orphan__";
			const bucket = byParent.get(key);
			if (bucket === void 0) byParent.set(key, [agent]);
			else bucket.push(agent);
		}
		const ringRadiusFor = (count, min) => count <= 1 ? min : Math.max(min, Math.ceil(count * cardWidth / (2 * Math.PI)));
		const ring = (center, ringRadius, nodes) => {
			const count = nodes.length;
			nodes.forEach((node, index) => {
				const angle = -Math.PI / 2 + 2 * Math.PI * index / count;
				positions.set(node.id, {
					x: center.x + ringRadius * Math.cos(angle),
					y: center.y + ringRadius * Math.sin(angle)
				});
			});
		};
		const rootRing = byParent.get(rootId) ?? [];
		const radius = ringRadiusFor(rootRing.length, minRing);
		ring({
			x: 0,
			y: 0
		}, radius, rootRing);
		ring({
			x: 0,
			y: 0
		}, radius + 60, byParent.get("__orphan__") ?? []);
		for (const [parentId, nodes] of byParent) {
			if (parentId === rootId || parentId === "__orphan__") continue;
			const center = positions.get(parentId);
			if (center === void 0) continue;
			ring(center, childRadius, nodes);
		}
		for (const agent of agents) if (!positions.has(agent.id)) positions.set(agent.id, {
			x: radius + 120,
			y: 0
		});
		return {
			positions,
			radius
		};
	}
	/**
	* Crawl progress of an edge's pulse: 0→1 per cycle while the edge is hot
	* (recent activity), then one full grace cycle to crawl home, then `null` —
	* a cold edge draws no dot. Pure in `now`, so tests and the rAF loop share it.
	*/
	function pulseProgress(lastActivityAt, now, cycleMs = 1800, graceMs = 1500) {
		const elapsed = now - lastActivityAt;
		if (elapsed < 0) return 0;
		if (elapsed >= cycleMs + graceMs) return null;
		return elapsed % cycleMs / cycleMs;
	}
	/**
	* The activity spiral: tools laid along a spider-web spiral in execution
	* order — each step turns further and drifts outward, and a turn boundary
	* adds an extra angular gap plus a small radial lift, so the shape reads as a
	* process (turn 1 here, turn 2 there) instead of a uniform ring. Newest work
	* sits furthest out, which is where the eye lands last.
	*/
	function layoutActivity(tools, opts = {}) {
		const baseRadius = opts.baseRadius ?? 200;
		const maxRadius = opts.maxRadius ?? 340;
		const angularStep = opts.angularStep ?? .62;
		const turnGap = opts.turnGap ?? .5;
		const positions = /* @__PURE__ */ new Map();
		const radialStep = tools.length > 1 ? (maxRadius - baseRadius) / (tools.length - 1) : 0;
		let angle = -Math.PI / 2;
		let radius = baseRadius;
		let previousTurn = null;
		tools.forEach((tool) => {
			if (previousTurn !== null && tool.turn !== previousTurn) angle += turnGap;
			positions.set(tool.id, {
				x: radius * Math.cos(angle),
				y: radius * Math.sin(angle)
			});
			previousTurn = tool.turn;
			angle += angularStep;
			radius = Math.min(maxRadius, radius + radialStep);
		});
		return {
			positions,
			maxRadius
		};
	}
	/**
	* Scale that fits the fixed-size web plane into the measured container
	* (never enlarging past 1:1, never shrinking past 0.35 so labels stay
	* legible). Zero or unknown measurements read as 1 — jsdom and the first
	* paint before measurement.
	*/
	function fitScale(containerWidth, containerHeight, viewWidth, viewHeight, margin = 32) {
		if (containerWidth <= 0 || containerHeight <= 0) return 1;
		const scale = Math.min((containerWidth - margin) / viewWidth, (containerHeight - margin) / viewHeight, 1);
		return Math.max(.35, scale);
	}
	/**
	* Ambient sweep: while nothing is hot, history still breathes. Each edge gets
	* a dim pulse in staggered order — one lap of the web per period — so an idle
	* session shows the ORDER its tools ran in, on repeat. Hot edges keep their
	* own brighter pulse; the sweep only fills the cold ones.
	*/
	function sweepProgress(index, now, opts = {}) {
		const period = opts.period ?? 6e3;
		const step = opts.step ?? 300;
		const travel = opts.travel ?? 1500;
		const t = (now % period + period) % period - index * step;
		if (t < 0 || t > travel) return null;
		return t / travel;
	}
	const TOOL_VISUALS = [
		{
			pattern: /^(pwsh|powershell|shell|bash|cmd|terminal|subprocess)/i,
			visual: {
				glyph: "▸",
				color: "#2f9e6f",
				variant: "shell"
			}
		},
		{
			pattern: /^job_/i,
			visual: {
				glyph: "▤",
				color: "#2f9e6f",
				variant: "job"
			}
		},
		{
			pattern: /^(read|cat|view|open|ls|list)/i,
			visual: {
				glyph: "◧",
				color: "#4aa3df",
				variant: "read"
			}
		},
		{
			pattern: /^(write|edit|create|patch|apply)/i,
			visual: {
				glyph: "✎",
				color: "#8a7dff",
				variant: "write"
			}
		},
		{
			pattern: /^(grep|search|find|query)/i,
			visual: {
				glyph: "⌕",
				color: "#d98a2b",
				variant: "search"
			}
		},
		{
			pattern: /^(todo|task|plan)/i,
			visual: {
				glyph: "☑",
				color: "#2f9e6f",
				variant: "todo"
			}
		},
		{
			pattern: /^(fetch|web|http|curl)/i,
			visual: {
				glyph: "☍",
				color: "#4aa3df",
				variant: "fetch"
			}
		}
	];
	const GENERIC_TOOL = {
		glyph: "⚙",
		color: "#9aa4b2",
		variant: "generic"
	};
	/** The tool's family glyph and color — one home for the mapping the view draws. */
	function toolGlyph(name) {
		for (const { pattern, visual } of TOOL_VISUALS) if (pattern.test(name)) return visual;
		return GENERIC_TOOL;
	}
	/**
	* Consecutive same-turn tools as groups, so the ring can mark where each turn
	* begins and ends. Tools arrive in log order, so a turn's work is contiguous.
	*/
	function turnGroups(tools) {
		const groups = [];
		tools.forEach((tool, index) => {
			const last = groups[groups.length - 1];
			if (last !== void 0 && last.turn === tool.turn) groups[groups.length - 1] = {
				turn: last.turn,
				startIndex: last.startIndex,
				endIndex: index
			};
			else groups.push({
				turn: tool.turn,
				startIndex: index,
				endIndex: index
			});
		});
		return groups;
	}
	const SWARM_PALETTES = [
		{
			id: "aurora",
			label: "律动渐变"
		},
		{
			id: "cyan",
			label: "极光青",
			accent: "#39d0d8"
		},
		{
			id: "amber",
			label: "琥珀",
			accent: "#e0a23c"
		},
		{
			id: "violet",
			label: "紫罗兰",
			accent: "#8a7dff"
		},
		{
			id: "green",
			label: "松绿",
			accent: "#2f9e6f"
		}
	];
	/**
	* The palette's accent at `now`. A fixed palette is constant; the default
	* animated one walks the hue wheel slowly (a full cycle every 18s) so the
	* web's light keeps breathing even when nothing is running.
	*/
	function paletteAccent(palette, now) {
		if (palette.accent !== void 0) return palette.accent;
		return `hsl(${Math.round(now / 50 % 360)}, 72%, 64%)`;
	}
	/**
	* Pan adjustment that keeps the point under the cursor fixed while the scale
	* changes from `oldScale` to `newScale` — zoom-at-cursor, not zoom-at-center.
	*/
	function anchoredPan(pan, oldScale, newScale, cursor, center) {
		const contentX = (cursor.x - center.x - pan.x) / oldScale;
		const contentY = (cursor.y - center.y - pan.y) / oldScale;
		return {
			x: cursor.x - center.x - contentX * newScale,
			y: cursor.y - center.y - contentY * newScale
		};
	}
	/**
	* Collapse CONSECUTIVE same-name tools into one chip with a ×N badge — a
	* teammate that fired send_message four times in a row is one job done four
	* times, not four chips of clutter. Non-consecutive same-name tools stay
	* separate: their positions tell the order, and merging them would lie.
	*/
	function collapseTools(tools) {
		const ordered = [...tools].sort((a, b) => (a.status === "error" ? -1 : 0) - (b.status === "error" ? -1 : 0));
		const collapsed = [];
		for (const tool of ordered) {
			const last = collapsed[collapsed.length - 1];
			if (last !== void 0 && last.tool.name === tool.name && last.tool.status === tool.status) collapsed[collapsed.length - 1] = {
				tool,
				count: last.count + 1
			};
			else collapsed.push({
				tool,
				count: 1
			});
		}
		return collapsed;
	}
	/**
	* Team tasks ordered for the board: in-progress work on top, then pending,
	* then finished — the order the user needs, not the order the log happened
	* to record. Stable within each band.
	*/
	function orderTeamTasks(tasks) {
		const rank = (status) => status === "in_progress" ? 0 : status === "pending" ? 1 : 2;
		return tasks.map((task, index) => ({
			task,
			index,
			rank: rank(task.status)
		})).sort((a, b) => a.rank - b.rank || a.index - b.index).map((entry) => entry.task);
	}
	/**
	* Chinese labels for known DSH tool families. A tool whose name matches a
	* pattern gets a readable Chinese label; unknown tools fall back to the raw
	* name so nothing becomes less readable than before.
	*/
	const TOOL_LABELS = [
		{
			pattern: /^(pwsh|powershell|shell|bash|cmd|terminal|subprocess)/i,
			zh: "终端"
		},
		{
			pattern: /^job_/i,
			zh: "后台任务"
		},
		{
			pattern: /^(read|cat|view|open|ls|list)/i,
			zh: "读取"
		},
		{
			pattern: /^(write|edit|create|patch|apply)/i,
			zh: "写入"
		},
		{
			pattern: /^(grep|search|find|query)/i,
			zh: "搜索"
		},
		{
			pattern: /^(todo|task|plan)/i,
			zh: "任务"
		},
		{
			pattern: /^(fetch|web|http|curl)/i,
			zh: "网络"
		},
		{
			pattern: /^(send_message|team_message)/i,
			zh: "发消息"
		},
		{
			pattern: /^(spawn_teammate|team_create)/i,
			zh: "创建队友"
		},
		{
			pattern: /^(team_task_list|team_task)/i,
			zh: "团队任务"
		},
		{
			pattern: /^(wait_agent|agent_wait)/i,
			zh: "等待"
		},
		{
			pattern: /^(list_agents|list_agent)/i,
			zh: "列出成员"
		},
		{
			pattern: /^(working_directory|cwd)/i,
			zh: "工作目录"
		},
		{
			pattern: /^(glob|glob_file)/i,
			zh: "文件匹配"
		},
		{
			pattern: /^(update_goal|goal)/i,
			zh: "更新目标"
		}
	];
	/** Maps a raw tool name to its Chinese label; unknown tools keep the raw name. */
	function toolLabel(name) {
		for (const { pattern, zh } of TOOL_LABELS) if (pattern.test(name)) return zh;
		return name;
	}
	//#endregion
	//#region src/client/ui/BranchTimeline.tsx
	/**
	* The fork cut for a timeline row: the last event seq that row owns.
	*
	* The design spec words this as "the seq immediately before the next row's
	* first event", which is equivalent **only while seqs are contiguous**. They are
	* not: a gap between rows makes that value a seq that is not an event, and DSH
	* refuses a fork whose `atSeq` is not a real event
	* (`api/session-controller/src/commands.ts:246-254` — "event N does not exist").
	* This row's own last seq is always real, and cutting there inherits the row in
	* full while excluding the next one, which is exactly what "fork here" means.
	*/
	function cutSeqAt(turns, rowIndex) {
		return turns[rowIndex]?.lastSeq;
	}
	const BranchTimeline = ({ turns, inheritedCount, onFork, cwdWarning, live = null, conclusion }) => {
		const [copied, setCopied] = (0, import_react.useState)(false);
		const [expandedArgs, setExpandedArgs] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
		const toggleArgs = (index) => {
			setExpandedArgs((current) => {
				const next = new Set(current);
				if (next.has(index)) next.delete(index);
				else next.add(index);
				return next;
			});
		};
		const copyConclusion = () => {
			if (conclusion === null || conclusion === void 0) return;
			const clipboard = globalThis.navigator?.clipboard;
			if (clipboard === void 0) return;
			clipboard.writeText(conclusion).then(() => {
				setCopied(true);
				window.setTimeout(() => setCopied(false), 2e3);
			}).catch(() => {});
		};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-branch-timeline": true,
			style: {
				font: "12px/1.5 system-ui, sans-serif",
				color: theme.text
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-detail-conclusion": true,
					style: {
						padding: "8px 10px",
						borderBottom: `1px solid ${theme.border}`,
						background: theme.card
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							color: theme.muted,
							marginBottom: 4,
							display: "flex",
							alignItems: "center",
							gap: 8
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: live != null ? "最新结论（正在产出…）" : "最新结论" }),
							conclusion != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-copy-conclusion": true,
								onClick: copyConclusion,
								style: {
									background: "transparent",
									color: theme.accent,
									border: "none",
									font: "inherit",
									cursor: "pointer",
									padding: 0
								},
								children: "复制"
							}),
							copied && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-copy-done": true,
								style: { color: theme.accent },
								children: "已复制"
							})
						]
					}), conclusion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							whiteSpace: "pre-wrap",
							wordBreak: "break-word"
						},
						children: conclusion
					}) : live != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-conclusion-waiting": true,
						style: { color: theme.accent },
						children: "▍正在产出结论…"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { color: theme.muted },
						children: "还没有结论"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-timeline-inherited": true,
					style: {
						color: theme.muted,
						padding: "6px 10px",
						borderBottom: `1px solid ${theme.border}`
					},
					children: [
						"继承 ",
						inheritedCount,
						" 个事件（不计入对比）"
					]
				}),
				cwdWarning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-timeline-cwd-warning": true,
					style: {
						color: theme.warn,
						padding: "6px 10px"
					},
					children: "⚠ 并行分支共享同一工作目录，同时写文件可能互相覆盖"
				}),
				live != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-live-tail": true,
					"data-live-phase": live.phase,
					style: {
						padding: "8px 10px",
						borderBottom: `1px solid ${theme.border}`,
						background: theme.card
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 8,
								color: theme.muted
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-live-cursor": true,
									style: { color: theme.accent },
									children: "▍"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: live.phase === "tool" ? "工具执行中" : "正在输出" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"第 ",
									live.turn + 1,
									" 轮 · 步骤 ",
									live.step + 1
								] })
							]
						}),
						live.reasoning !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-live-reasoning": true,
							style: {
								color: theme.muted,
								fontStyle: "italic",
								marginTop: 4,
								whiteSpace: "pre-wrap",
								wordBreak: "break-word"
							},
							children: live.reasoning
						}),
						live.text !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-live-text": true,
							style: {
								marginTop: 4,
								whiteSpace: "pre-wrap",
								wordBreak: "break-word"
							},
							children: live.text
						}),
						live.tool !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-live-tool": true,
							style: {
								color: theme.accent,
								marginTop: 4,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							title: `${live.tool.name} ${live.tool.arguments}`,
							children: [
								"⚙ ",
								live.tool.name,
								" ",
								live.tool.arguments
							]
						})
					]
				}),
				turns.length === 0 && live == null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-timeline-empty": true,
					style: {
						color: theme.muted,
						padding: 10
					},
					children: "该分支还没有自己的事件"
				}),
				turns.map((turn) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-timeline-row": turn.index,
					"data-row-synthetic": turn.synthetic ? "true" : "false",
					style: {
						padding: "8px 10px",
						borderBottom: `1px solid ${theme.border}`,
						opacity: turn.synthetic ? .6 : 1
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 8,
								color: theme.muted
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-row-seq": true,
									children: `seq ${turn.firstSeq}–${turn.lastSeq}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"第 ",
									turn.index + 1,
									" 轮"
								] }),
								turn.endedAs !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-row-ended": true,
									children: turn.endedAs
								}),
								turn.synthetic && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-row-synthetic-marker": true,
									title: "分叉时合成的事件",
									children: "合成"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										marginLeft: "auto",
										display: "flex",
										alignItems: "center",
										gap: 6
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [turn.tools.length, " 次工具"] }), turn.tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-row-tool-names": true,
										style: {
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											maxWidth: 150
										},
										children: turn.tools.map((tool, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-row-tool-error": tool.status === "error" ? "true" : void 0,
											style: { color: tool.status === "error" ? "#e0554d" : "inherit" },
											children: [
												index > 0 && " · ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: { fontWeight: 600 },
													children: toolLabel(tool.name)
												}),
												tool.preview !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													"data-row-tool-args": true,
													title: "点击展开本轮参数",
													onClick: () => toggleArgs(turn.index),
													style: {
														cursor: "pointer",
														opacity: .75
													},
													children: [" ", expandedArgs.has(turn.index) ? "⌃" : "⌄"]
												})
											]
										}, `${index}-${tool.name}`))
									})]
								}),
								expandedArgs.has(turn.index) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-row-args-detail": true,
									style: {
										marginTop: 4,
										padding: "4px 8px",
										borderRadius: 6,
										background: theme.card,
										color: theme.muted,
										font: "11px/1.6 ui-monospace, monospace"
									},
									children: turn.tools.filter((tool) => tool.preview !== void 0).map((tool, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										tool.name,
										": ",
										tool.preview
									] }, `${index}-${tool.name}`))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"data-fork-row": turn.index,
									disabled: turn.synthetic,
									onClick: () => onFork(turn.index),
									style: {
										background: theme.card,
										color: theme.text,
										border: `1px solid ${theme.border}`,
										borderRadius: 6,
										padding: "2px 8px",
										font: "inherit",
										cursor: turn.synthetic ? "not-allowed" : "pointer",
										opacity: turn.synthetic ? .5 : 1
									},
									children: "⑂ 从此分叉"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-row-user": true,
							style: { marginTop: 2 },
							children: turn.userMessage ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: theme.muted },
								children: "（无用户消息）"
							})
						}),
						turn.assistantSummary !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-row-assistant": true,
							style: {
								color: theme.muted,
								marginTop: 2
							},
							children: turn.assistantSummary
						})
					]
				}, turn.index))
			]
		});
	};
	//#endregion
	//#region src/client/ui/ForkDialog.tsx
	/**
	* The fork confirmation.
	*
	* It shows the real cut rather than a vague "from here": the number of events
	* the child will inherit is `atSeq + 1`, because DSH records
	* `inheritedEventCount = boundary + 1` for an inclusive boundary. The design
	* spec's own example prose says "seq 47 · inherits 47 events", which is off by
	* one; the code is what runs.
	*
	* The shared-directory warning is permanent, not a dismissible toast: v1
	* branches always share the source cwd (the fork API has no cwd parameter), so
	* two parallel branches can overwrite each other's files.
	*/
	const ForkDialog = ({ open, atSeq, inheritedCount, busy = false, error, onCancel, onConfirm }) => {
		const [instruction, setInstruction] = (0, import_react.useState)("");
		const [mode, setMode] = (0, import_react.useState)("now");
		if (!open) return null;
		const trimmed = instruction.trim();
		const blocked = mode === "now" && trimmed === "";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-fork-dialog": true,
			style: {
				position: "absolute",
				right: 16,
				bottom: 16,
				width: 320,
				zIndex: 5,
				background: theme.panel,
				border: `1px solid ${theme.border}`,
				borderRadius: 10,
				padding: 12,
				boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
				font: "12px system-ui, sans-serif",
				color: theme.text
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontWeight: 600,
						marginBottom: 6
					},
					children: "从此分叉"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-fork-cut": true,
					style: {
						color: theme.muted,
						marginBottom: 8
					},
					children: [
						"切点：seq ",
						atSeq,
						" · 新分支继承 ",
						atSeq + 1,
						" 个事件",
						inheritedCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							"（其中 ",
							inheritedCount,
							" 个来自更上游）"
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					"data-fork-instruction": true,
					value: instruction,
					onChange: (event) => setInstruction(event.target.value),
					placeholder: "给新分支的指令",
					rows: 3,
					style: {
						width: "100%",
						boxSizing: "border-box",
						resize: "vertical",
						background: theme.bg,
						color: theme.text,
						border: `1px solid ${theme.border}`,
						borderRadius: 6,
						padding: 6,
						font: "inherit"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 12,
						margin: "8px 0"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 4
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "radio",
							name: "dsh-canvas-fork-mode",
							"data-fork-mode": "now",
							checked: mode === "now",
							onChange: () => setMode("now")
						}), "立即开跑"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 4
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "radio",
							name: "dsh-canvas-fork-mode",
							"data-fork-mode": "later",
							checked: mode === "later",
							onChange: () => setMode("later")
						}), "只建分支"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-fork-cwd-warning": true,
					style: {
						color: theme.warn,
						marginBottom: 8
					},
					children: "⚠ 并行分支共享同一工作目录，同时写文件可能互相覆盖"
				}),
				error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-fork-error": true,
					style: {
						color: theme.warn,
						marginBottom: 8
					},
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "flex-end",
						gap: 8
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-fork-cancel": true,
						onClick: onCancel,
						style: buttonStyle$2,
						children: "取消"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-fork-confirm": true,
						disabled: blocked || busy,
						onClick: () => onConfirm(trimmed, mode),
						style: {
							...buttonStyle$2,
							borderColor: theme.accent,
							opacity: blocked || busy ? .5 : 1
						},
						children: "创建"
					})]
				})
			]
		});
	};
	const buttonStyle$2 = {
		background: theme.card,
		color: theme.text,
		border: `1px solid ${theme.border}`,
		borderRadius: 6,
		padding: "3px 12px",
		font: "inherit",
		cursor: "pointer"
	};
	//#endregion
	//#region src/client/ui/ComparePanel.tsx
	const SIDES = ["a", "b"];
	/**
	* Deterministic A|B comparison.
	*
	* 「带回结论」 deliberately stops at an **editable draft**. The other branch's
	* conclusion is reference material, not an instruction: it carries no execution
	* authority, so it is never submitted on the user's behalf. A second, explicit
	* action is what hands the text over, and by then the user has seen and edited it.
	*
	* Only each branch's own work is shown — the diff rows come from
	* `ComparisonResult.turnDiffs`, which already excludes the inherited prefix and
	* the synthetic fork closers. Each side's inherited count is displayed rather
	* than normalized away, because two branches may inherit different amounts.
	*/
	const ComparePanel = ({ result, onContinue, onCarry }) => {
		const [draft, setDraft] = (0, import_react.useState)(null);
		const [draftSide, setDraftSide] = (0, import_react.useState)("a");
		if (result === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-compare-empty": true,
			style: {
				padding: 16,
				color: theme.muted,
				font: "12px system-ui, sans-serif"
			},
			children: "选择两个分支进行对比"
		});
		const lastSummary = (side) => {
			return (side === "a" ? result.a : result.b).turns.filter((turn) => !turn.synthetic).at(-1)?.assistantSummary ?? "";
		};
		const conclusionOf = (side) => {
			const text = lastSummary(side === "a" ? "b" : "a");
			return text === "" ? "（对方没有结论）" : text;
		};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-compare-panel": true,
			style: {
				font: "12px/1.6 system-ui, sans-serif",
				color: theme.text
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-compare-summary": true,
					style: {
						padding: "8px 10px",
						borderBottom: `1px solid ${theme.border}`
					},
					children: [
						SIDES.map((side) => {
							const segment = side === "a" ? result.a : result.b;
							const tools = segment.turns.filter((t) => !t.synthetic).reduce((n, t) => n + t.tools.length, 0);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-compare-side": side,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { fontWeight: 600 },
									children: side.toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: { color: theme.muted },
									children: [
										" ",
										"· 继承 ",
										segment.inheritedCount,
										" 个事件 · ",
										tools,
										" 次工具"
									]
								})]
							}, side);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-compare-tool-diff": true,
							style: { color: theme.muted },
							children: ["工具调用差：", result.toolCountDiff > 0 ? `+${result.toolCountDiff}` : result.toolCountDiff]
						}),
						result.bothFailed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-compare-both-failed": true,
							style: { color: theme.warn },
							children: "两边都以失败结束"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-compare-conclusions": true,
					style: {
						display: "flex",
						gap: 8,
						padding: "8px 10px",
						borderBottom: `1px solid ${theme.border}`
					},
					children: SIDES.map((side) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-conclusion-side": side,
						style: {
							flex: "1 1 0",
							minWidth: 0
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { color: theme.muted },
							children: [
								side.toUpperCase(),
								" 最后结论",
								result.lastConclusion.side === "both" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-conclusion-note": true,
									children: " · 两边一致"
								}),
								result.lastConclusion.side === side && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-conclusion-note": true,
									children: " · 更完整"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-conclusion-text": true,
							children: lastSummary(side) === "" ? "—" : lastSummary(side)
						})]
					}, side))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-compare-rows": true,
					children: result.turnDiffs.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-compare-row": index,
						"data-row-equal": row.equal ? "true" : "false",
						style: {
							display: "flex",
							gap: 8,
							padding: "6px 10px",
							borderBottom: `1px solid ${theme.border}`
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-compare-left": true,
							style: {
								flex: "1 1 0",
								minWidth: 0,
								color: row.equal ? theme.muted : theme.text
							},
							children: row.left?.userMessage ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: theme.muted },
								children: "—"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-compare-right": true,
							style: {
								flex: "1 1 0",
								minWidth: 0,
								color: row.equal ? theme.muted : theme.text
							},
							children: row.right?.userMessage ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: theme.muted },
								children: "—"
							})
						})]
					}, index))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-compare-actions": true,
					style: {
						display: "flex",
						flexWrap: "wrap",
						gap: 6,
						padding: 10
					},
					children: [SIDES.map((side) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-continue": side,
						onClick: () => onContinue(side),
						style: buttonStyle$1,
						children: [
							"切换至 ",
							side.toUpperCase(),
							" 继续"
						]
					}, `continue-${side}`)), SIDES.map((side) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-carry": side,
						onClick: () => {
							setDraftSide(side);
							setDraft(`参考另一分支的结论：${conclusionOf(side)}。现在结合两者继续：`);
						},
						style: buttonStyle$1,
						children: [
							"带回 ",
							side === "a" ? "B" : "A",
							" 的结论"
						]
					}, `carry-${side}`))]
				}),
				draft !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-carry-editor": true,
					style: { padding: "0 10px 10px" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						"data-carry-draft": true,
						value: draft,
						rows: 3,
						onChange: (event) => setDraft(event.target.value),
						style: {
							width: "100%",
							boxSizing: "border-box",
							resize: "vertical",
							background: theme.bg,
							color: theme.text,
							border: `1px solid ${theme.border}`,
							borderRadius: 6,
							padding: 6,
							font: "inherit"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-end",
							gap: 6,
							marginTop: 6
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-carry-discard": true,
							onClick: () => setDraft(null),
							style: buttonStyle$1,
							children: "取消"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-carry-send": true,
							onClick: () => onCarry(draftSide, draft),
							style: {
								...buttonStyle$1,
								borderColor: theme.accent
							},
							children: "放入输入框"
						})]
					})]
				})
			]
		});
	};
	const buttonStyle$1 = {
		background: theme.card,
		color: theme.text,
		border: `1px solid ${theme.border}`,
		borderRadius: 6,
		padding: "3px 10px",
		font: "inherit",
		cursor: "pointer"
	};
	//#endregion
	//#region src/client/ui/RobotAvatar.tsx
	const eyeColor = (state) => state === "failed" ? "#e0554d" : "#7ce7ff";
	const ledColor = (state, color) => state === "failed" ? "#e0554d" : color;
	/** The arms every humanoid variant shares, so the working swing animates everywhere. */
	const Arms = ({ color, species = "agent" }) => species === "device" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		className: "dsh-robot-arm dsh-robot-arm-l",
		x: "5",
		y: "30",
		width: "4",
		height: "9",
		rx: "2",
		fill: color,
		opacity: "0.8"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		className: "dsh-robot-arm dsh-robot-arm-r",
		x: "31",
		y: "30",
		width: "4",
		height: "9",
		rx: "2",
		fill: color,
		opacity: "0.8"
	})] });
	/** Rounded head with a dark visor and two eyes — the base chassis. */
	const VisorHead = ({ color, state, rx = 5 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "8",
			y: "12",
			width: "24",
			height: "16",
			rx,
			fill: color,
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "11",
			y: "16",
			width: "18",
			height: "8",
			rx: "3",
			fill: "#0b0d12"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			className: "dsh-robot-eye",
			cx: "16",
			cy: "20",
			r: "1.8",
			fill: eyeColor(state)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			className: "dsh-robot-eye",
			cx: "24",
			cy: "20",
			r: "1.8",
			fill: eyeColor(state)
		})
	] });
	/**
	* The chassis below the head: a humanoid torso with a chest light, or — for
	* devices — the instrument frame standing on two legs and a base plate.
	*/
	const Body = ({ color, species = "agent", children }) => species === "device" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			className: "dsh-robot-body",
			x: "11",
			y: "29",
			width: "18",
			height: "8",
			rx: "2",
			fill: color,
			opacity: "0.75"
		}),
		children,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "14.5",
			y: "37",
			width: "3",
			height: "4",
			rx: "1",
			fill: color,
			opacity: "0.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "22.5",
			y: "37",
			width: "3",
			height: "4",
			rx: "1",
			fill: color,
			opacity: "0.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			"data-robot-part": "stand",
			x: "9",
			y: "41",
			width: "22",
			height: "2.4",
			rx: "1.2",
			fill: color,
			opacity: "0.45"
		})
	] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		className: "dsh-robot-body",
		x: "11",
		y: "30",
		width: "18",
		height: "11",
		rx: "4",
		fill: color,
		opacity: "0.75"
	}), children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
		className: "dsh-robot-chest",
		cx: "20",
		cy: "35.5",
		r: "2",
		fill: "#0b0d12"
	})] });
	/** Straight antenna with one LED. */
	const Antenna = ({ color, state }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: "20",
		y1: "5",
		x2: "20",
		y2: "13",
		stroke: color,
		strokeWidth: "2"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
		className: "dsh-robot-led",
		cx: "20",
		cy: "4",
		r: "3",
		fill: ledColor(state, color)
	})] });
	const VariantBody = ({ color, state, variant, species = "agent" }) => {
		switch (variant) {
			case "shell": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "20",
					y1: "7",
					x2: "20",
					y2: "12",
					stroke: color,
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					className: "dsh-robot-led",
					x: "17",
					y: "3",
					width: "6",
					height: "5",
					rx: "1.5",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "7",
					y: "12",
					width: "26",
					height: "17",
					rx: "2.5",
					fill: color,
					opacity: "0.9"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "10",
					y: "15",
					width: "20",
					height: "11",
					rx: "1.5",
					fill: "#0b0d12"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					"data-robot-part": "terminal",
					d: "M 12 18 l 3 2.5 l -3 2.5",
					fill: "none",
					stroke: eyeColor(state),
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "17",
					y1: "23",
					x2: "27",
					y2: "23",
					stroke: eyeColor(state),
					strokeWidth: "1.2",
					opacity: "0.8"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Body, {
					color,
					species,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "14",
						y: "33",
						width: "4",
						height: "4",
						rx: "1",
						fill: "#0b0d12"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "22",
						y: "33",
						width: "4",
						height: "4",
						rx: "1",
						fill: "#0b0d12"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
			case "job": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "15",
					y1: "6",
					x2: "15",
					y2: "13",
					stroke: color,
					strokeWidth: "1.6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "dsh-robot-led",
					cx: "15",
					cy: "5",
					r: "2.4",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "25",
					y1: "6",
					x2: "25",
					y2: "13",
					stroke: color,
					strokeWidth: "1.6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "dsh-robot-led",
					cx: "25",
					cy: "5",
					r: "2.4",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisorHead, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						"data-robot-part": "gauge",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "20",
								cy: "35.5",
								r: "4",
								fill: "#0b0d12"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M 17 34.5 A 4 4 0 0 1 23 34.5",
								fill: "none",
								stroke: color,
								strokeWidth: "1.2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "20",
								y1: "35.5",
								x2: "22.5",
								y2: "33.5",
								stroke: eyeColor(state),
								strokeWidth: "1.2"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
			case "read": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M 8 22 A 12 11 0 0 1 32 22 Z",
					fill: color,
					opacity: "0.9"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					"data-robot-part": "lens",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "20",
							cy: "19",
							r: "6",
							fill: "#0b0d12"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							className: "dsh-robot-eye",
							cx: "20",
							cy: "19",
							r: "3",
							fill: eyeColor(state)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "18.5",
							cy: "17.5",
							r: "1",
							fill: "#ffffff",
							opacity: "0.8"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
			case "write": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M 20 12 L 17.5 6 L 22.5 6 Z",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "19.2",
					y: "11",
					width: "1.6",
					height: "3",
					fill: color
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisorHead, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					"data-robot-part": "pencil",
					transform: "rotate(24 33 32)",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "31.6",
						y: "24",
						width: "2.8",
						height: "9",
						rx: "0.8",
						fill: "#f2c94c"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 31.6 33 L 33 36 L 34.4 33 Z",
						fill: "#e0a23c"
					})]
				})
			] });
			case "search": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M 13 6 A 8 8 0 0 1 27 6",
					fill: "none",
					stroke: color,
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "dsh-robot-led",
					cx: "20",
					cy: "5",
					r: "2.6",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "8",
					y: "12",
					width: "24",
					height: "16",
					rx: "5",
					fill: color,
					opacity: "0.9"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "11",
					y: "16",
					width: "18",
					height: "8",
					rx: "3",
					fill: "#0b0d12"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "dsh-robot-eye",
					cx: "16",
					cy: "20",
					r: "1.8",
					fill: eyeColor(state)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					"data-robot-part": "magnifier",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "24.5",
						cy: "20",
						r: "3.4",
						fill: "none",
						stroke: eyeColor(state),
						strokeWidth: "1.6"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "27",
						y1: "22.5",
						x2: "28.6",
						y2: "24",
						stroke: eyeColor(state),
						strokeWidth: "1.6"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
			case "todo": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Antenna, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisorHead, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						"data-robot-part": "checklist",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: "13",
								y: "32",
								width: "14",
								height: "8",
								rx: "1.5",
								fill: "#0b0d12"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M 15 34.5 l 1.6 1.6 l 2.6 -3",
								fill: "none",
								stroke: "#2f9e6f",
								strokeWidth: "1.2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "21",
								y1: "34.5",
								x2: "25",
								y2: "34.5",
								stroke: eyeColor(state),
								strokeWidth: "1.1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M 15 37.8 l 1.6 1.6 l 2.6 -3",
								fill: "none",
								stroke: eyeColor(state),
								strokeWidth: "1.2",
								opacity: "0.5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "21",
								y1: "37.8",
								x2: "25",
								y2: "37.8",
								stroke: eyeColor(state),
								strokeWidth: "1.1",
								opacity: "0.7"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
			case "fetch": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M 14 8 A 7 7 0 0 1 26 8",
					fill: "none",
					stroke: color,
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "20",
					y1: "9",
					x2: "20",
					y2: "13",
					stroke: color,
					strokeWidth: "1.6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "dsh-robot-led",
					cx: "20",
					cy: "8",
					r: "2.2",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisorHead, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						"data-robot-part": "globe",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "20",
								cy: "35.5",
								r: "4",
								fill: "#0b0d12"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
								cx: "20",
								cy: "35.5",
								rx: "4",
								ry: "1.6",
								fill: "none",
								stroke: eyeColor(state),
								strokeWidth: "0.9"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
								cx: "20",
								cy: "35.5",
								rx: "1.7",
								ry: "4",
								fill: "none",
								stroke: eyeColor(state),
								strokeWidth: "0.9"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
			case "agent": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Antenna, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisorHead, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					"data-robot-part": "headset",
					d: "M 6 20 A 14 14 0 0 1 34 20",
					fill: "none",
					stroke: color,
					strokeWidth: "2",
					opacity: "0.9"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "34",
					cy: "20",
					r: "2.6",
					fill: color,
					opacity: "0.9"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M 34 22 q -1 4 -5 5",
					fill: "none",
					stroke: color,
					strokeWidth: "1.4",
					opacity: "0.8"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
			case "root": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "13",
					y1: "7",
					x2: "13",
					y2: "13",
					stroke: color,
					strokeWidth: "1.6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "dsh-robot-led",
					cx: "13",
					cy: "6",
					r: "2.2",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "20",
					y1: "5",
					x2: "20",
					y2: "13",
					stroke: color,
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "dsh-robot-led",
					cx: "20",
					cy: "4",
					r: "2.8",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "27",
					y1: "7",
					x2: "27",
					y2: "13",
					stroke: color,
					strokeWidth: "1.6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "dsh-robot-led",
					cx: "27",
					cy: "6",
					r: "2.2",
					fill: ledColor(state, color)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisorHead, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						"data-robot-part": "collar",
						d: "M 15 30 L 20 36 L 25 30 Z",
						fill: "#0b0d12",
						opacity: "0.9"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Antenna, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisorHead, {
					color,
					state
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
					color,
					species
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arms, {
					color,
					state,
					species
				})
			] });
		}
	};
	/**
	* A small worker robot, drawn inline (no assets). Each variant is its own
	* design — a terminal bot, a job runner with a gauge, a one-eyed scanner, a
	* scribe with a pencil, an investigator with a magnifier, a planner with a
	* checklist, a networker with a dish, a headset-wearing subagent, and the
	* crowned session itself. The canvas's injected sheet animates them: working
	* robots bob with swinging arms and a blinking antenna LED, idle ones breathe,
	* failed ones shake, finished ones stand still with green eyes.
	*/
	const RobotAvatar = ({ size = 26, color, state, variant = "generic", species = "agent", statusAttr }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"data-robot": true,
		"data-robot-state": state,
		"data-robot-variant": variant,
		"data-robot-species": species,
		className: `dsh-robot dsh-robot-${state} dsh-robot-v-${variant}${species === "device" ? " dsh-robot-device" : ""}`,
		style: {
			display: "inline-block",
			flex: "0 0 auto",
			width: size,
			height: size * 1.1
		},
		...statusAttr === void 0 ? {} : { [statusAttr.name]: statusAttr.value },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 40 44",
			width: "100%",
			height: "100%",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VariantBody, {
				color,
				state,
				variant,
				species
			})
		})
	});
	//#endregion
	//#region src/client/ui/AgentSwarmView.tsx
	const VIEW = {
		width: 980,
		height: 800
	};
	const RING = 230;
	const TOOL_RING = 340;
	const chipStyle = (streaming, accent) => ({
		position: "absolute",
		transform: "translate(-50%, -50%)",
		maxWidth: 200,
		padding: "6px 10px",
		borderRadius: 10,
		background: theme.card,
		border: `1px solid ${streaming ? accent : theme.border}`,
		boxShadow: streaming ? `0 0 12px ${accent}55` : "none",
		color: theme.text,
		font: "12px/1.4 system-ui, sans-serif",
		cursor: "default",
		userSelect: "none"
	});
	const statusColor = (status, accent) => status === "streaming" ? accent : status === "running" ? theme.warn : status === "failed" ? "#e0554d" : theme.muted;
	const AGENT_ROBOT = {
		streaming: "working",
		running: "working",
		idle: "idle",
		failed: "failed"
	};
	const TOOL_ROBOT = {
		pending: "working",
		ok: "done",
		error: "failed"
	};
	const TODO_GLYPH = {
		completed: {
			glyph: "✓",
			color: "#2f9e6f"
		},
		in_progress: {
			glyph: "◐",
			color: theme.warn
		},
		pending: {
			glyph: "○",
			color: theme.muted
		}
	};
	/**
	* The agent's checklist — the task list its own todo tool wrote into the
	* session log (`todo/write`, whole-list snapshots). Completed count first, so
	* progress is readable at a glance.
	*/
	const TodoList = ({ items, limit }) => {
		const done = items.filter((item) => item.status === "completed").length;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-swarm-todos": true,
			style: { marginTop: 4 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						color: theme.muted,
						marginBottom: 2,
						display: "flex",
						alignItems: "center",
						gap: 6
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"任务 ",
						done,
						"/",
						items.length
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-swarm-todo-bar": true,
						style: {
							flex: "1 1 auto",
							height: 3,
							borderRadius: 1.5,
							background: theme.border,
							overflow: "hidden",
							position: "relative"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
							position: "absolute",
							left: 0,
							top: 0,
							bottom: 0,
							width: `${items.length === 0 ? 0 : done / items.length * 100}%`,
							background: "#2f9e6f",
							borderRadius: 1.5
						} })
					})]
				}),
				items.slice(0, limit).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-swarm-todo-status": item.status,
					style: {
						display: "flex",
						gap: 4,
						color: item.status === "completed" ? theme.muted : theme.text
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							color: TODO_GLYPH[item.status].color,
							flex: "0 0 auto"
						},
						children: TODO_GLYPH[item.status].glyph
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap"
						},
						children: item.content
					})]
				}, item.content)),
				items.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { color: theme.muted },
					children: [
						"+",
						items.length - limit,
						" 项"
					]
				})
			]
		});
	};
	/**
	* A silk thread: the spoke sags to one side of the straight line, so the web
	* reads as woven rather than as a sunburst. Deterministic per endpoint pair.
	*/
	function silkPath(from, to, index) {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const length = Math.hypot(dx, dy) || 1;
		const sag = Math.min(46, length * .14) * (index % 2 === 0 ? 1 : -1);
		const cx = (from.x + to.x) / 2 + -dy / length * sag;
		const cy = (from.y + to.y) / 2 + dx / length * sag;
		return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
	}
	/** Point at `t` along the same quadratic the silk draws. */
	function silkPoint(from, to, index, t) {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const length = Math.hypot(dx, dy) || 1;
		const sag = Math.min(46, length * .14) * (index % 2 === 0 ? 1 : -1);
		const cx = (from.x + to.x) / 2 + -dy / length * sag;
		const cy = (from.y + to.y) / 2 + dx / length * sag;
		const u = 1 - t;
		return {
			x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
			y: u * u * from.y + 2 * u * t * cy + t * t * to.y
		};
	}
	/** A comet: the bright head plus two fading tail dots. */
	const Comet = ({ from, to, index, progress, attr, label, accent }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: [
		0,
		.05,
		.1
	].map((lag, lagIndex) => {
		const point = silkPoint(from, to, index, Math.max(0, progress - lag));
		const head = lagIndex === 0;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			[attr]: head ? label : void 0,
			"data-swarm-pulse-tail": head ? void 0 : label,
			cx: point.x,
			cy: point.y,
			r: head ? 4 : 3 - lagIndex * .6,
			fill: accent,
			opacity: head ? 1 : .5 - lagIndex * .15
		}, lag);
	}) });
	/**
	* The 「Agent 实况」 overlay: one session's agent web.
	*
	* Structure: concentric silk rings, the root at the center, its subagents on
	* the inner ring, the session's own tool history on the outer ring grouped by
	* turn (each group's span marked on the rim). Motion: while an agent or tool
	* is hot, a comet crawls its silk toward the parent; when nothing is hot, a
	* dim sweep walks every thread in work order, on repeat — the web is never
	* still, and the sweep reads as the order the work actually ran in.
	*/
	const AgentSwarmView = ({ swarm, onClose, onSelectAgent, onOpenRoot, nowMs }) => {
		const [tick, setTick] = (0, import_react.useState)(() => Date.now());
		(0, import_react.useEffect)(() => {
			if (nowMs !== void 0) return;
			const timer = window.setInterval(() => {
				if (document.visibilityState === "hidden") return;
				setTick(Date.now());
			}, 60);
			return () => {
				window.clearInterval(timer);
			};
		}, [nowMs]);
		const now = nowMs ?? tick;
		const [activeOnly, setActiveOnly] = (0, import_react.useState)(false);
		const [paletteId, setPaletteId] = (0, import_react.useState)(() => {
			try {
				return window.localStorage.getItem("dsh-canvas-palette") ?? "aurora";
			} catch {
				return "aurora";
			}
		});
		const choosePalette = (id) => {
			setPaletteId(id);
			setCustomColor(void 0);
			try {
				window.localStorage.removeItem("dsh-canvas-custom-color");
			} catch {}
			try {
				window.localStorage.setItem("dsh-canvas-palette", id);
			} catch {}
		};
		const [customColor, setCustomColor] = (0, import_react.useState)(() => {
			try {
				return window.localStorage.getItem("dsh-canvas-custom-color") ?? void 0;
			} catch {
				return;
			}
		});
		const chooseCustomColor = (color) => {
			setCustomColor(color);
			try {
				window.localStorage.setItem("dsh-canvas-custom-color", color);
			} catch {}
		};
		const containerRef = (0, import_react.useRef)(null);
		const [scale, setScale] = (0, import_react.useState)(1);
		const [zoom, setZoom] = (0, import_react.useState)(1);
		const [pan, setPan] = (0, import_react.useState)({
			x: 0,
			y: 0
		});
		const dragRef = (0, import_react.useRef)(null);
		const palette = SWARM_PALETTES.find((candidate) => candidate.id === paletteId) ?? SWARM_PALETTES[0];
		const accent = customColor ?? paletteAccent(palette, now);
		(0, import_react.useEffect)(() => {
			const element = containerRef.current;
			if (element === null || typeof ResizeObserver === "undefined") return;
			const measure = () => {
				setScale(fitScale(element.clientWidth, element.clientHeight, VIEW.width, VIEW.height));
			};
			measure();
			const observer = new ResizeObserver(measure);
			observer.observe(element);
			return () => {
				observer.disconnect();
			};
		}, []);
		const positionOf = (id) => swarm.layout.positions.get(id) ?? {
			x: 0,
			y: 0
		};
		const toolPositionOf = (id) => swarm.toolLayout.positions.get(id) ?? {
			x: 0,
			y: 0
		};
		const allAgents = swarm.agents;
		const agents = activeOnly ? allAgents.filter((agent) => agent.status !== "idle") : allAgents;
		const tools = swarm.activity.tools;
		const busyOwners = new Set((swarm.team?.tasks ?? []).filter((task) => task.status === "in_progress" && task.ownerName !== void 0).map((task) => task.ownerName));
		const pendingTool = tools.find((tool) => tool.id === swarm.activity.pendingToolId) ?? null;
		const groups = turnGroups(tools);
		const rootTodos = swarm.todos.get(swarm.rootId);
		const teamTasks = orderTeamTasks((swarm.team?.tasks ?? []).filter((task) => task.status !== "deleted"));
		const rootHeat = swarm.heat.get(swarm.rootId);
		const rootHot = rootHeat !== void 0 && pulseProgress(rootHeat, now) !== null;
		const angleOf = (index) => -Math.PI / 2 + 2 * Math.PI * index / Math.max(tools.length, 1);
		const polar = (angle, radius) => ({
			x: radius * Math.cos(angle),
			y: radius * Math.sin(angle)
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-swarm-root": true,
			style: {
				position: "absolute",
				inset: 0,
				zIndex: 5,
				background: theme.bg,
				color: theme.text,
				display: "flex",
				flexDirection: "column"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 10,
					padding: "8px 12px",
					borderBottom: `1px solid ${theme.border}`,
					background: theme.panel,
					font: "13px system-ui, sans-serif"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontWeight: 600 },
						children: "Agent 实况"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { color: theme.muted },
						children: swarm.rootLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: { color: theme.muted },
						children: [
							agents.filter((a) => a.status === "failed").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: { color: "#e0554d" },
								children: [
									"失败 ",
									agents.filter((a) => a.status === "failed").length,
									" · "
								]
							}),
							agents.length,
							" 个 agent · 设备 ",
							tools.length,
							" · 近 ",
							swarm.activity.turnCount + (swarm.activity.openTurn ? 1 : 0),
							" 轮",
							swarm.activity.openTurn ? "（进行中）" : "",
							swarm.team != null ? ` · 团队 ${swarm.team.members.length} 人` : "",
							pendingTool !== null ? ` · 正在 ${pendingTool.name}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-swarm-active-only": true,
						"data-active": activeOnly ? "true" : "false",
						title: "只显示非空闲的成员",
						onClick: () => setActiveOnly((current) => !current),
						style: {
							marginLeft: "auto",
							background: theme.card,
							color: activeOnly ? theme.accent : theme.muted,
							border: `1px solid ${activeOnly ? theme.accent : theme.border}`,
							borderRadius: 6,
							padding: "2px 8px",
							font: "inherit",
							cursor: "pointer"
						},
						children: "只看活跃"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 4
						},
						children: [
							SWARM_PALETTES.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-swarm-palette": candidate.id,
								"data-active": candidate.id === paletteId ? "true" : "false",
								title: candidate.label,
								onClick: () => choosePalette(candidate.id),
								style: {
									width: 14,
									height: 14,
									borderRadius: 7,
									padding: 0,
									cursor: "pointer",
									background: candidate.accent ?? "linear-gradient(120deg, #f66, #6af, #2f9)",
									border: candidate.id === paletteId && customColor === void 0 ? `2px solid ${theme.text}` : `1px solid ${theme.border}`
								}
							}, candidate.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "color",
								"data-swarm-custom-color": true,
								title: "自定义颜色",
								"aria-label": "自定义颜色",
								value: customColor ?? "#39d0d8",
								onChange: (event) => chooseCustomColor(event.target.value),
								style: {
									width: 18,
									height: 18,
									padding: 0,
									border: "none",
									background: "none",
									cursor: "pointer"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-swarm-reset": true,
								title: "重置缩放与平移",
								onClick: () => {
									setZoom(1);
									setPan({
										x: 0,
										y: 0
									});
								},
								style: {
									background: theme.card,
									color: theme.muted,
									border: `1px solid ${theme.border}`,
									borderRadius: 6,
									padding: "2px 8px",
									font: "inherit",
									cursor: "pointer"
								},
								children: "⟲"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-swarm-close": true,
						onClick: onClose,
						style: {
							marginLeft: "auto",
							background: theme.card,
							color: theme.text,
							border: `1px solid ${theme.border}`,
							borderRadius: 6,
							padding: "3px 10px",
							font: "inherit",
							cursor: "pointer"
						},
						children: "返回画布"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: containerRef,
				"data-swarm-stage": true,
				onWheel: (event) => {
					const rect = event.currentTarget.getBoundingClientRect();
					const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
					const nextZoom = Math.min(3, Math.max(.5, zoom * factor));
					setPan(anchoredPan(pan, scale * zoom, scale * nextZoom, {
						x: event.clientX - rect.left,
						y: event.clientY - rect.top
					}, {
						x: rect.width / 2,
						y: rect.height / 2
					}));
					setZoom(nextZoom);
				},
				onMouseDown: (event) => {
					dragRef.current = {
						x: event.clientX,
						y: event.clientY,
						panX: pan.x,
						panY: pan.y
					};
				},
				onMouseMove: (event) => {
					const started = dragRef.current;
					if (started === null) return;
					setPan({
						x: started.panX + (event.clientX - started.x),
						y: started.panY + (event.clientY - started.y)
					});
				},
				onMouseUp: () => {
					dragRef.current = null;
				},
				onMouseLeave: () => {
					dragRef.current = null;
				},
				style: {
					position: "relative",
					flex: "1 1 auto",
					overflow: "hidden",
					cursor: "grab"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-swarm-plane": true,
					style: {
						position: "absolute",
						left: "50%",
						top: "50%",
						width: VIEW.width,
						height: VIEW.height,
						transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale * zoom})`,
						transformOrigin: "center center"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							"data-swarm-web": true,
							width: VIEW.width,
							height: VIEW.height,
							style: {
								position: "absolute",
								inset: 0
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								transform: `translate(${VIEW.width / 2}, ${VIEW.height / 2})`,
								children: [
									[
										RING * .55,
										RING,
										TOOL_RING,
										410
									].map((radius) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										"data-swarm-guide": Math.round(radius),
										cx: 0,
										cy: 0,
										r: radius,
										fill: "none",
										stroke: theme.border,
										strokeWidth: 1,
										opacity: radius === RING || radius === TOOL_RING ? .55 : .25
									}, radius)),
									tools.length > 1 && groups.map((group) => {
										if (group.endIndex <= group.startIndex) return null;
										const startAngle = angleOf(group.startIndex);
										const endAngle = angleOf(group.endIndex);
										const start = polar(startAngle, 366);
										const end = polar(endAngle, 366);
										const mid = polar((startAngle + endAngle) / 2, 392);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											"data-swarm-turn-arc": group.turn,
											d: `M ${start.x} ${start.y} A 366 366 0 0 1 ${end.x} ${end.y}`,
											fill: "none",
											stroke: accent,
											strokeWidth: 1,
											opacity: .35
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
											"data-swarm-turn-label": group.turn,
											x: mid.x,
											y: mid.y,
											fill: theme.muted,
											fontSize: 10,
											textAnchor: "middle",
											children: [
												"第 ",
												group.turn + 1,
												" 轮"
											]
										})] }, `turn-${group.turn}`);
									}),
									swarm.edges.map((edge, edgeIndex) => {
										const from = positionOf(edge.from);
										const to = positionOf(edge.to);
										const heatAt = swarm.heat.get(edge.to);
										const progress = heatAt === void 0 ? null : pulseProgress(heatAt, now);
										const sweep = progress === null ? sweepProgress(tools.length + edgeIndex, now) : null;
										const silk = silkPath(from, to, tools.length + edgeIndex);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												"data-swarm-edge": `${edge.from}->${edge.to}`,
												d: silk,
												fill: "none",
												stroke: progress === null ? theme.border : accent,
												strokeWidth: progress === null ? 1.2 : 1.8,
												opacity: progress === null ? .9 : 1,
												className: progress === null ? void 0 : "dsh-swarm-hot"
											}),
											progress !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comet, {
												from,
												to,
												index: tools.length + edgeIndex,
												progress,
												attr: "data-swarm-pulse",
												label: `${edge.from}->${edge.to}`,
												accent
											}),
											sweep !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
												"data-swarm-sweep": `${edge.from}->${edge.to}`,
												cx: silkPoint(from, to, tools.length + edgeIndex, sweep).x,
												cy: silkPoint(from, to, tools.length + edgeIndex, sweep).y,
												r: 3,
												fill: accent,
												opacity: .55
											})
										] }, `${edge.from}->${edge.to}`);
									}),
									(swarm.team?.tasks ?? []).filter((task) => task.status === "in_progress").map((task) => {
										const owner = agents.find((agent) => agent.label === task.ownerName);
										if (owner === void 0) return null;
										const to = positionOf(owner.id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											"data-swarm-assign-edge": owner.id,
											x1: 0,
											y1: 0,
											x2: to.x,
											y2: to.y,
											stroke: theme.warn,
											strokeWidth: 1.4,
											strokeDasharray: "2 5",
											opacity: .8
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
											"data-swarm-assign-label": owner.id,
											x: to.x / 2 + 6,
											y: to.y / 2 - 4,
											fill: theme.warn,
											fontSize: 10,
											children: task.subject.slice(0, 12)
										})] }, `assign->${owner.id}`);
									}),
									collapseTools(tools).map((group, toolIndex) => {
										const tool = group.tool;
										const to = toolPositionOf(tool.id);
										const heatAt = swarm.heat.get(`tool:${tool.id}`);
										const progress = heatAt === void 0 ? null : pulseProgress(heatAt, now);
										const sweep = progress === null ? sweepProgress(toolIndex, now) : null;
										const sinceSettle = tool.status !== "pending" && heatAt !== void 0 ? now - heatAt : Infinity;
										const settlePop = sinceSettle <= 600 ? sinceSettle / 600 : null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												"data-swarm-tool-edge": tool.id,
												d: silkPath({
													x: 0,
													y: 0
												}, to, toolIndex),
												fill: "none",
												stroke: progress === null ? theme.border : accent,
												strokeWidth: progress === null ? 1 : 1.6,
												strokeDasharray: tool.status === "pending" ? void 0 : "3 4",
												opacity: progress === null ? .7 : 1,
												className: progress === null ? void 0 : "dsh-swarm-hot"
											}),
											progress !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comet, {
												from: {
													x: 0,
													y: 0
												},
												to,
												index: toolIndex,
												progress,
												attr: "data-swarm-pulse",
												label: `tool:${tool.id}`,
												accent
											}),
											sweep !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
												"data-swarm-sweep": `tool:${tool.id}`,
												cx: silkPoint({
													x: 0,
													y: 0
												}, to, toolIndex, sweep).x,
												cy: silkPoint({
													x: 0,
													y: 0
												}, to, toolIndex, sweep).y,
												r: 3,
												fill: theme.accent,
												opacity: .55
											}),
											settlePop !== null && tool.status === "ok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
												"data-swarm-pop": `tool:${tool.id}`,
												cx: to.x,
												cy: to.y,
												r: 6 + settlePop * 14,
												fill: "none",
												stroke: "#2f9e6f",
												strokeWidth: 2 - settlePop,
												opacity: 1 - settlePop
											})
										] }, `tool->${tool.id}`);
									})
								]
							})
						}),
						agents.map((agent) => {
							const p = positionOf(agent.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-swarm-agent": agent.id,
								role: onSelectAgent === void 0 ? void 0 : "button",
								tabIndex: onSelectAgent === void 0 ? void 0 : 0,
								onKeyDown: onSelectAgent === void 0 ? void 0 : (event) => {
									if (event.key === "Enter" || event.key === " ") onSelectAgent(agent.id);
								},
								onClick: onSelectAgent === void 0 ? void 0 : () => onSelectAgent(agent.id),
								style: {
									...chipStyle(agent.status === "streaming", accent),
									cursor: onSelectAgent === void 0 ? "default" : "pointer",
									opacity: agent.status === "idle" ? .62 : 1,
									left: VIEW.width / 2 + p.x,
									top: VIEW.height / 2 + p.y,
									outline: `1px dashed ${statusColor(agent.status, accent)}`,
									outlineOffset: 4,
									...busyOwners.has(agent.label) ? {
										border: `2px solid ${theme.warn}`,
										boxShadow: `0 0 10px ${theme.warn}66`
									} : {}
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: 6
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RobotAvatar, {
											size: 34,
											color: statusColor(agent.status, accent),
											state: AGENT_ROBOT[agent.status],
											variant: "agent",
											species: "agent",
											statusAttr: {
												name: "data-swarm-status",
												value: agent.status
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: { minWidth: 0 },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontWeight: 600,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap"
												},
												children: agent.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													color: theme.muted,
													fontSize: 10
												},
												children: [
													agent.role === "teammate" ? "团队成员" : agent.role === "lead" ? "团队主管" : "子代理",
													agent.toolCount > 0 ? ` · ${agent.toolCount} 工具` : "",
													agent.status === "failed" ? " · 失败" : "",
													busyOwners.has(agent.label) ? " · 执行任务中" : ""
												]
											})]
										})]
									}),
									agent.snippet !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-swarm-snippet": true,
										style: {
											color: theme.muted,
											marginTop: 2,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { color: agent.snippet.label === "工具" ? theme.accent : theme.muted },
												children: agent.snippet.label
											}),
											" ",
											agent.snippet.text
										]
									}),
									agent.conclusion !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-swarm-agent-conclusion": true,
										style: {
											color: theme.muted,
											marginTop: 2,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											maxWidth: 190
										},
										children: ["结论：", agent.conclusion]
									}),
									(() => {
										const agentTodos = swarm.todos.get(agent.id);
										return agentTodos === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodoList, {
											items: agentTodos,
											limit: 4
										});
									})()
								]
							}, agent.id);
						}),
						collapseTools(tools).map((group) => {
							const tool = group.tool;
							const p = toolPositionOf(tool.id);
							const pending = tool.status === "pending";
							const failed = tool.status === "error";
							const visual = toolGlyph(tool.name);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-swarm-tool": tool.id,
								"data-swarm-tool-status": tool.status,
								title: tool.error ?? (tool.preview !== void 0 ? `点击复制：${tool.name} ${tool.preview}` : void 0),
								onClick: () => {
									if (tool.preview === void 0) return;
									(globalThis.navigator?.clipboard)?.writeText(`${tool.name} ${tool.preview}`).catch(() => {});
								},
								style: {
									position: "absolute",
									transform: "translate(-50%, -50%)",
									left: VIEW.width / 2 + p.x,
									top: VIEW.height / 2 + p.y,
									display: "flex",
									alignItems: "center",
									gap: 6,
									maxWidth: 180,
									padding: "4px 10px 4px 8px",
									borderRadius: 8,
									background: theme.card,
									border: `1px solid ${pending ? accent : failed ? "#e0554d" : theme.border}`,
									borderLeft: `3px solid ${failed ? "#e0554d" : visual.color}`,
									boxShadow: pending ? `0 0 12px ${accent}55` : "none",
									color: pending ? theme.text : failed ? "#e0554d" : theme.muted,
									font: "11px/1.4 system-ui, sans-serif",
									whiteSpace: "nowrap",
									userSelect: "none",
									cursor: tool.preview !== void 0 ? "copy" : "default"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RobotAvatar, {
										size: 18,
										color: failed ? "#e0554d" : visual.color,
										state: TOOL_ROBOT[tool.status],
										variant: visual.variant,
										species: "device"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											overflow: "hidden",
											textOverflow: "ellipsis"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { fontWeight: 600 },
												children: toolLabel(tool.name)
											}),
											group.count > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												"data-swarm-tool-count": true,
												children: [" ×", group.count]
											}),
											tool.preview !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													color: theme.muted,
													marginLeft: 4
												},
												children: [" ", tool.preview]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: theme.muted,
													opacity: .6,
													marginLeft: 4,
													fontSize: 10
												},
												children: tool.name
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											flex: "0 0 auto",
											color: failed ? "#e0554d" : theme.muted
										},
										children: pending ? "…" : failed ? "✗" : "✓"
									}),
									failed && tool.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-swarm-tool-error": true,
										style: {
											overflow: "hidden",
											textOverflow: "ellipsis",
											maxWidth: 90,
											color: "#e0554d"
										},
										children: tool.error
									})
								]
							}, tool.id);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-swarm-agent": swarm.rootId,
							"data-swarm-root-agent": "true",
							onDoubleClick: onOpenRoot,
							title: onOpenRoot === void 0 ? void 0 : "双击打开对话",
							style: {
								position: "absolute",
								transform: "translate(-50%, -50%)",
								left: VIEW.width / 2,
								top: VIEW.height / 2,
								maxWidth: 280,
								padding: "10px 14px",
								borderRadius: 12,
								background: theme.cardActive,
								border: `1.5px solid ${rootHot ? accent : theme.border}`,
								boxShadow: rootHot ? `0 0 16px ${accent}66` : "none",
								color: theme.text,
								font: "12px/1.5 system-ui, sans-serif",
								userSelect: "none"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 8
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RobotAvatar, {
										size: 38,
										color: theme.text,
										state: rootHot ? "working" : "idle",
										variant: "root"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: { minWidth: 0 },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontWeight: 700,
												fontSize: 13,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap"
											},
											children: swarm.rootLabel
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: { color: theme.muted },
											children: [
												agents.length,
												" 个 agent · ",
												tools.length,
												" 个工具"
											]
										})]
									})]
								}),
								swarm.rootSnippet !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-swarm-snippet": true,
									style: {
										color: theme.muted,
										marginTop: 2,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										maxWidth: 240
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: { color: swarm.rootSnippet.label === "工具" ? theme.accent : theme.muted },
											children: swarm.rootSnippet.label
										}),
										" ",
										swarm.rootSnippet.text
									]
								}),
								swarm.rootConclusion !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-swarm-root-conclusion": true,
									style: {
										color: theme.muted,
										marginTop: 4,
										maxHeight: 72,
										overflow: "hidden",
										whiteSpace: "pre-wrap",
										wordBreak: "break-word"
									},
									children: ["结论：", swarm.rootConclusion]
								}),
								rootTodos === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodoList, {
									items: rootTodos,
									limit: 7
								}),
								teamTasks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-swarm-team-tasks": true,
									style: {
										marginTop: 6,
										borderTop: `1px solid ${theme.border}`,
										paddingTop: 4
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											color: theme.muted,
											marginBottom: 2,
											display: "flex",
											alignItems: "center",
											gap: 6
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"团队任务 ",
											teamTasks.filter((task) => task.status === "completed").length,
											"/",
											teamTasks.length
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-swarm-team-bar": true,
											style: {
												flex: "1 1 auto",
												height: 3,
												borderRadius: 1.5,
												background: theme.border,
												overflow: "hidden",
												position: "relative"
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
												position: "absolute",
												left: 0,
												top: 0,
												bottom: 0,
												width: `${teamTasks.length === 0 ? 0 : teamTasks.filter((task) => task.status === "completed").length / teamTasks.length * 100}%`,
												background: "#2f9e6f",
												borderRadius: 1.5
											} })
										})]
									}), teamTasks.slice(0, 5).map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-swarm-team-task-status": task.status,
										style: {
											display: "flex",
											gap: 4,
											color: task.status === "completed" ? theme.muted : theme.text
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												flex: "0 0 auto",
												color: task.status === "completed" ? "#2f9e6f" : task.status === "in_progress" ? theme.warn : theme.muted
											},
											children: task.status === "completed" ? "✓" : task.status === "in_progress" ? "◐" : "○"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap"
											},
											children: [task.subject, task.ownerName !== void 0 ? ` · ${task.ownerName}` : ""]
										})]
									}, task.id))]
								})
							]
						})
					]
				})
			})]
		});
	};
	//#endregion
	//#region src/client/ui/CanvasTab.tsx
	const NODE_WIDTH = 200;
	const NODE_HEIGHT = 72;
	const MIN_SCALE = .4;
	const MAX_SCALE = 2;
	/** Nominal viewport the fit-view button targets, in canvas units. */
	const FIT_VIEWPORT = {
		width: 1e3,
		height: 600
	};
	/**
	* The canvas has no CSS pipeline (inline styles only), so the few things that
	* need real CSS — the breathing halo keyframes and the ⌖ hover — ride in as a
	* single injected sheet. The halo color comes from each card's --breath-color,
	* which is the status's own color.
	*/
	const CANVAS_CSS = `
@keyframes dshCanvasBreath {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: 0 0 18px 3px var(--breath-color); }
}
.dsh-canvas-inspect:hover { color: ${theme.text}; border-color: ${theme.accent}; }

/* Worker robots: each node's avatar animates by what it is doing. */
@keyframes dshRobotBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes dshRobotBreathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.78; } }
@keyframes dshRobotLed { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
@keyframes dshRobotArmL { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-16deg); } }
@keyframes dshRobotArmR { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(16deg); } }
@keyframes dshRobotShake { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
@keyframes dshDashFlow { to { stroke-dashoffset: -24; } }

.dsh-robot-working { animation: dshRobotBob 1.1s ease-in-out infinite; }
.dsh-robot-working .dsh-robot-led { animation: dshRobotLed 0.7s ease-in-out infinite; }
.dsh-robot-working .dsh-robot-arm-l { animation: dshRobotArmL 1.1s ease-in-out infinite; transform-origin: 7px 31px; }
.dsh-robot-working .dsh-robot-arm-r { animation: dshRobotArmR 1.1s ease-in-out infinite; transform-origin: 33px 31px; }
.dsh-robot-idle { animation: dshRobotBreathe 3.4s ease-in-out infinite; }
.dsh-robot-idle .dsh-robot-led { opacity: 0.55; }
.dsh-robot-done .dsh-robot-eye { fill: #2f9e6f; }
.dsh-robot-failed { animation: dshRobotShake 0.5s ease-in-out infinite; }
.dsh-robot-failed .dsh-robot-led { animation: dshRobotLed 0.35s ease-in-out infinite; }

/* A hot thread is a conveyor: dashes flow toward the parent while work runs,
   and the thread itself breathes its width. */
@keyframes dshHotWidth { 0%, 100% { stroke-width: 1.8; } 50% { stroke-width: 3; } }
.dsh-swarm-hot { stroke-dasharray: 6 6; animation: dshDashFlow 0.8s linear infinite, dshHotWidth 1.2s ease-in-out infinite; }

/* Idle robots fidget with their own tool: the investigator swings the
   magnifier, the scribe taps the pencil, the scanner lens glints. */
@keyframes dshIdleSwing { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
@keyframes dshIdleTap { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes dshIdleGlint { 0%, 70%, 100% { opacity: 0.8; } 80% { opacity: 0.1; } }
@keyframes dshWaitBreath { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
[data-conclusion-waiting] { animation: dshWaitBreath 1.6s ease-in-out infinite; }

/* Canvas texture: a 24px dot grid turns the flat void into a workbench. */
.dsh-canvas-surface {
  background-image: radial-gradient(${theme.border} 1px, transparent 1px);
  background-size: 24px 24px;
}
/* Node cards lift on hover — the standard affordance for "this is grabbable". */
.dsh-node-card { transition: transform 0.15s ease, box-shadow 0.15s ease, left 0.3s ease, top 0.3s ease; }
[data-canvas-node]:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4); }
/* Threads feeding working sessions flow, like the swarm's silk. */
.dsh-edge-busy { stroke-dasharray: 6 6; animation: dshDashFlow 0.9s linear infinite; }
/* The selected card breathes a soft accent ring. */
@keyframes dshSelectedBreath { 0%, 100% { box-shadow: 0 0 0 0 transparent; } 50% { box-shadow: 0 0 0 3px #6af55; } }
[data-canvas-node][data-selected='true'] { animation: dshSelectedBreath 2.2s ease-in-out infinite; }
@keyframes dshWaitBreath { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
[data-conclusion-waiting] { animation: dshWaitBreath 1.6s ease-in-out infinite; }
.dsh-robot-v-search.dsh-robot-idle [data-robot-part='magnifier'] { transform-origin: 24px 20px; animation: dshIdleSwing 3.6s ease-in-out infinite; }
.dsh-robot-v-write.dsh-robot-idle [data-robot-part='pencil'] { animation: dshIdleTap 2.8s ease-in-out infinite; }
.dsh-robot-v-read.dsh-robot-idle .dsh-robot-eye { animation: dshIdleGlint 4.2s ease-in-out infinite; }
`;
	/**
	* Corner overview: every node as a status dot, the current viewport as a
	* frame, and a click that recenters the view on the chosen spot.
	*/
	const MiniMap = ({ canvas, layout, stage, onViewChange, onSelectNode }) => {
		const dragRef = (0, import_react.useRef)(null);
		const onDragMove = (event) => {
			const started = dragRef.current;
			if (started === null) return;
			onViewChange({
				x: started.viewX - (event.clientX - started.x),
				y: started.viewY - (event.clientY - started.y),
				scale: canvas.view.scale
			});
		};
		const BOX = {
			width: 148,
			height: 96,
			pad: 6
		};
		const scale = Math.min(BOX.width / Math.max(layout.width, 1), BOX.height / Math.max(layout.height, 1));
		const stageWidth = stage?.width ?? FIT_VIEWPORT.width;
		const stageHeight = stage?.height ?? FIT_VIEWPORT.height;
		const viewportWidth = Math.max(stageWidth / canvas.view.scale * scale, 10);
		const viewportHeight = Math.max(stageHeight / canvas.view.scale * scale, 10);
		const viewportX = BOX.pad - canvas.view.x * scale;
		const viewportY = BOX.pad - canvas.view.y * scale;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-canvas-minimap": true,
			title: "点击跳转到对应位置",
			style: {
				position: "absolute",
				right: 10,
				bottom: 10,
				zIndex: 4,
				width: BOX.width,
				height: BOX.height,
				background: theme.panel,
				border: `1px solid ${theme.border}`,
				borderRadius: 8,
				opacity: .85,
				cursor: "crosshair"
			},
			onMouseDown: (event) => {
				dragRef.current = {
					x: event.clientX,
					y: event.clientY,
					viewX: canvas.view.x,
					viewY: canvas.view.y
				};
			},
			onMouseMove: onDragMove,
			onMouseUp: () => {
				dragRef.current = null;
			},
			onMouseLeave: () => {
				dragRef.current = null;
			},
			onClick: (event) => {
				const rect = event.currentTarget.getBoundingClientRect();
				const contentX = (event.clientX - rect.left - BOX.pad) / scale;
				const contentY = (event.clientY - rect.top - BOX.pad) / scale;
				onViewChange({
					x: FIT_VIEWPORT.width / 2 - contentX * canvas.view.scale,
					y: FIT_VIEWPORT.height / 2 - contentY * canvas.view.scale,
					scale: canvas.view.scale
				});
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-minimap-frame": true,
				style: {
					position: "absolute",
					left: viewportX,
					top: viewportY,
					width: viewportWidth,
					height: viewportHeight,
					border: `1px solid ${theme.accent}`,
					borderRadius: 2,
					opacity: .9
				}
			}), [...layout.positions.entries()].map(([id, point]) => {
				const selected = canvas.selectedId === id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-minimap-node": id,
					"data-minimap-selected": selected ? "true" : "false",
					title: canvas.graph.nodes.get(id)?.title,
					onClick: (event) => {
						if (onSelectNode === void 0) return;
						event.stopPropagation();
						onSelectNode(id);
					},
					style: {
						position: "absolute",
						left: BOX.pad + point.x * scale - 1.5,
						top: BOX.pad + point.y * scale - 1.5,
						width: selected ? 5 : 3,
						height: selected ? 5 : 3,
						borderRadius: 1.5,
						background: canvas.statusOf(id).color,
						outline: selected ? `1px solid ${theme.accent}` : void 0,
						cursor: onSelectNode === void 0 ? "default" : "pointer"
					}
				}, id);
			})]
		});
	};
	const CanvasTab = ({ canvas }) => {
		const [query, setQuery] = (0, import_react.useState)("");
		const [tab, setTab] = (0, import_react.useState)("detail");
		const [detail, setDetail] = (0, import_react.useState)(null);
		const [comparison, setComparison] = (0, import_react.useState)(null);
		const [fork, setFork] = (0, import_react.useState)(null);
		const [forkBusy, setForkBusy] = (0, import_react.useState)(false);
		const [forkError, setForkError] = (0, import_react.useState)(void 0);
		const [carried, setCarried] = (0, import_react.useState)(false);
		const [swarm, setSwarm] = (0, import_react.useState)(null);
		const drag = (0, import_react.useRef)(null);
		const [, bump] = (0, import_react.useReducer)((tick) => tick + 1, 0);
		const selectedId = canvas?.selectedId;
		const compareKey = canvas?.compareIds.join("\0") ?? "";
		const liveDetail = selectedId === void 0 ? null : canvas?.liveDetail?.(selectedId) ?? null;
		const effectiveDetail = liveDetail ?? detail;
		const tail = selectedId === void 0 ? null : canvas?.tailOf?.(selectedId) ?? null;
		(0, import_react.useEffect)(() => canvas?.subscribe?.(() => {
			bump();
		}), [canvas]);
		const swarmRef = (0, import_react.useRef)(null);
		swarmRef.current = swarm;
		(0, import_react.useEffect)(() => swarm?.subscribe(() => {
			bump();
		}), [swarm]);
		(0, import_react.useEffect)(() => () => {
			swarmRef.current?.dispose();
		}, []);
		const openSwarm = (id) => {
			if (canvas?.inspectSwarm === void 0) return;
			swarmRef.current?.dispose();
			const next = canvas.inspectSwarm(id);
			swarmRef.current = next;
			setSwarm(next);
		};
		const closeSwarm = () => {
			swarmRef.current?.dispose();
			swarmRef.current = null;
			setSwarm(null);
		};
		const [pendingForkFor, setPendingForkFor] = (0, import_react.useState)(null);
		(0, import_react.useEffect)(() => {
			if (pendingForkFor === null || effectiveDetail?.sessionId !== pendingForkFor) return;
			const rows = effectiveDetail.turns;
			let lastIdx = -1;
			for (let i = rows.length - 1; i >= 0; i -= 1) {
				const row = rows[i];
				if (row !== void 0 && !row.synthetic) {
					lastIdx = i;
					break;
				}
			}
			setPendingForkFor(null);
			if (lastIdx < 0) return;
			const atSeq = cutSeqAt(rows, lastIdx);
			if (atSeq === void 0) return;
			setTab("detail");
			setFork({
				rowIndex: lastIdx,
				atSeq
			});
		}, [pendingForkFor, effectiveDetail]);
		(0, import_react.useEffect)(() => {
			const onKey = (event) => {
				const target = event.target;
				if (target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
				if (canvas === void 0) return;
				const PAN = 60;
				switch (event.key) {
					case "ArrowLeft":
						canvas.onViewChange({
							...canvas.view,
							x: canvas.view.x + PAN
						});
						break;
					case "ArrowRight":
						canvas.onViewChange({
							...canvas.view,
							x: canvas.view.x - PAN
						});
						break;
					case "ArrowUp":
						canvas.onViewChange({
							...canvas.view,
							y: canvas.view.y + PAN
						});
						break;
					case "ArrowDown":
						canvas.onViewChange({
							...canvas.view,
							y: canvas.view.y - PAN
						});
						break;
					case "+":
					case "=":
						canvas.onViewChange({
							...canvas.view,
							scale: Math.min(2, canvas.view.scale * 1.12)
						});
						break;
					case "-":
					case "_":
						canvas.onViewChange({
							...canvas.view,
							scale: Math.max(.4, canvas.view.scale / 1.12)
						});
						break;
					default: return;
				}
				event.preventDefault();
			};
			window.addEventListener("keydown", onKey);
			return () => {
				window.removeEventListener("keydown", onKey);
			};
		}, [canvas]);
		(0, import_react.useEffect)(() => {
			const onKey = (event) => {
				if (event.key !== "Escape") return;
				if (menu !== null) {
					setMenu(null);
					return;
				}
				if (swarmRef.current !== null) {
					closeSwarm();
					return;
				}
				if (selectedId !== void 0) canvas?.clearSelection?.();
			};
			window.addEventListener("keydown", onKey);
			return () => {
				window.removeEventListener("keydown", onKey);
			};
		});
		const autoFitted = (0, import_react.useRef)(false);
		const fitView = () => {
			if (canvas === void 0) return;
			const layout = layoutLayered(canvas.graph, {
				nodeWidth: NODE_WIDTH,
				nodeHeight: NODE_HEIGHT
			});
			if (layout.width === 0 || layout.height === 0) return;
			const fitScale = Math.min((FIT_VIEWPORT.width - 40) / layout.width, (FIT_VIEWPORT.height - 40) / layout.height, 1);
			const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, fitScale === 0 ? 1 : fitScale));
			canvas.onViewChange({
				x: (FIT_VIEWPORT.width - layout.width * clamped) / 2,
				y: (FIT_VIEWPORT.height - layout.height * clamped) / 2,
				scale: clamped
			});
		};
		(0, import_react.useEffect)(() => {
			if (autoFitted.current || canvas === void 0) return;
			if (canvas.graph.nodes.size === 0) return;
			autoFitted.current = true;
			fitView();
		}, [
			canvas,
			canvas?.graph.nodes.size,
			fitView
		]);
		(0, import_react.useEffect)(() => {
			let timer;
			const onResize = () => {
				window.clearTimeout(timer);
				timer = window.setTimeout(() => {
					fitView();
				}, 200);
			};
			window.addEventListener("resize", onResize);
			return () => {
				window.clearTimeout(timer);
				window.removeEventListener("resize", onResize);
			};
		}, [fitView]);
		const centerOn = (id) => {
			if (canvas === void 0) return;
			const point = layout.positions.get(id);
			if (point === void 0) return;
			const screenX = point.x * canvas.view.scale + canvas.view.x;
			const screenY = point.y * canvas.view.scale + canvas.view.y;
			if (screenX >= 0 && screenX <= FIT_VIEWPORT.width && screenY >= 0 && screenY <= FIT_VIEWPORT.height) return;
			canvas.onViewChange({
				x: FIT_VIEWPORT.width / 2 - (point.x + NODE_WIDTH / 2) * canvas.view.scale,
				y: FIT_VIEWPORT.height / 2 - (point.y + NODE_HEIGHT / 2) * canvas.view.scale,
				scale: canvas.view.scale
			});
		};
		(0, import_react.useEffect)(() => {
			if (selectedId !== void 0) centerOn(selectedId);
		}, [selectedId]);
		const surfaceRef = (0, import_react.useRef)(null);
		const [stageSize, setStageSize] = (0, import_react.useState)(void 0);
		(0, import_react.useEffect)(() => {
			const element = surfaceRef.current;
			if (element === null || typeof ResizeObserver === "undefined") return;
			const measure = () => {
				setStageSize({
					width: element.clientWidth,
					height: element.clientHeight
				});
			};
			measure();
			const observer = new ResizeObserver(measure);
			observer.observe(element);
			return () => {
				observer.disconnect();
			};
		}, []);
		const [menu, setMenu] = (0, import_react.useState)(null);
		const openContext = (event, id) => {
			setMenu({
				x: event.clientX,
				y: event.clientY,
				id
			});
		};
		const menuFork = () => {
			const id = menu?.id;
			setMenu(null);
			if (id === void 0) return;
			if (canvas?.selectedId !== id) canvas?.onSelect(id);
			setPendingForkFor(id);
		};
		const hasLiveDetail = liveDetail !== null;
		(0, import_react.useEffect)(() => {
			setTab("detail");
			if (pendingForkFor === null) {
				setFork(null);
				setForkError(void 0);
			}
			if (canvas?.detail === void 0 || selectedId === void 0 || hasLiveDetail) {
				setDetail(null);
				return;
			}
			let live = true;
			canvas.detail(selectedId).then((next) => {
				if (live) setDetail(next);
			});
			return () => {
				live = false;
			};
		}, [
			canvas,
			selectedId,
			hasLiveDetail
		]);
		(0, import_react.useEffect)(() => {
			if (tab !== "compare" || canvas?.comparison === void 0) return;
			let live = true;
			canvas.comparison().then((next) => {
				if (live) setComparison(next);
			});
			return () => {
				live = false;
			};
		}, [
			canvas,
			tab,
			compareKey
		]);
		if (canvas === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-canvas-root": true,
			"data-canvas-unwired": "true",
			style: {
				height: "100%",
				background: theme.bg,
				color: theme.muted,
				padding: 16,
				font: "12px system-ui, sans-serif"
			},
			children: "画布尚未接线"
		});
		const now = Date.now();
		const needle = query.trim().toLowerCase();
		const [legendVisible, setLegendVisible] = (0, import_react.useState)(false);
		const runningCount = [...canvas.graph.nodes.values()].filter((node) => {
			const kind = canvas.statusOf(node.id).kind;
			return kind === "thinking" || kind === "tool";
		}).length;
		const matches = (needle) => needle === "" ? 0 : [...canvas.graph.nodes.values()].filter((node) => matchesNode(node, needle)).length;
		const selectedNode = selectedId === void 0 ? void 0 : canvas.graph.nodes.get(selectedId);
		const suppressClick = (0, import_react.useRef)(false);
		const dragStart = (0, import_react.useRef)(null);
		const [hoverId, setHoverId] = (0, import_react.useState)(void 0);
		const hidden = hiddenByCollapse(canvas.graph.nodes, canvas.collapsedNodes ?? /* @__PURE__ */ new Set());
		const displayGraph = hidden.size === 0 ? canvas.graph : {
			...canvas.graph,
			nodes: new Map([...canvas.graph.nodes].filter(([id]) => !hidden.has(id))),
			roots: canvas.graph.roots.filter((id) => !hidden.has(id))
		};
		const layout = layoutLayered(displayGraph, {
			nodeWidth: NODE_WIDTH,
			nodeHeight: NODE_HEIGHT
		});
		const parallelWrite = parallelWriteIds(displayGraph);
		const displayCanvas = {
			...canvas,
			graph: displayGraph
		};
		const handleNodeClick = (event, id) => {
			if (suppressClick.current) return;
			if (event.metaKey || event.ctrlKey) canvas.onToggleCompare(id);
			else canvas.onSelect(id);
		};
		const fit = () => {
			fitView();
		};
		const openFork = (rowIndex) => {
			const atSeq = cutSeqAt(effectiveDetail?.turns ?? [], rowIndex);
			if (atSeq === void 0) return;
			setForkError(void 0);
			setFork({
				rowIndex,
				atSeq
			});
		};
		const confirmFork = async (instruction, mode) => {
			const sessionId = effectiveDetail?.sessionId;
			if (sessionId === void 0 || fork === null || canvas.forkFromRow === void 0) return;
			setForkBusy(true);
			setForkError(void 0);
			const outcome = await canvas.forkFromRow(sessionId, fork.atSeq, instruction, mode);
			setForkBusy(false);
			if (outcome.phase === "done") {
				setFork(null);
				return;
			}
			setForkError(outcome.error ?? (outcome.phase === "unverified" ? "分支可能已创建，但无法确认，请刷新后检查" : "分支创建失败"));
		};
		const carry = (draft) => {
			(globalThis.navigator?.clipboard)?.writeText(draft);
			setCarried(true);
		};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-canvas-root": true,
			style: {
				height: "100%",
				display: "flex",
				flexDirection: "column",
				background: theme.bg,
				color: theme.text,
				position: "relative"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: CANVAS_CSS }),
				swarm !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentSwarmView, {
					swarm: swarm.state(),
					onClose: closeSwarm,
					onSelectAgent: (id) => {
						closeSwarm();
						canvas.onSelect(id);
					},
					onOpenRoot: selectedId === void 0 ? void 0 : () => {
						closeSwarm();
						canvas.openInChat?.(selectedId);
					}
				}),
				menu !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-context-backdrop": true,
					onClick: () => setMenu(null),
					onContextMenu: (event) => {
						event.preventDefault();
						setMenu(null);
					},
					style: {
						position: "fixed",
						inset: 0,
						zIndex: 20
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-context-menu": true,
					style: {
						position: "fixed",
						left: menu.x,
						top: menu.y,
						zIndex: 21,
						minWidth: 180,
						padding: 4,
						background: theme.panel,
						border: `1px solid ${theme.border}`,
						borderRadius: 8,
						boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
						font: "12px system-ui, sans-serif",
						color: theme.text
					},
					children: [
						{
							key: "fork",
							label: "⑂ 从最新消息分叉",
							run: menuFork
						},
						...canvas.inspectSwarm !== void 0 ? [{
							key: "inspect",
							label: "⌖ Agent 实况",
							run: () => {
								setMenu(null);
								openSwarm(menu.id);
							}
						}] : [],
						...canvas.openInChat !== void 0 ? [{
							key: "open",
							label: "打开对话",
							run: () => {
								setMenu(null);
								canvas.openInChat?.(menu.id);
							}
						}] : []
					].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-context-item": item.key,
						onClick: item.run,
						style: {
							padding: "6px 10px",
							borderRadius: 6,
							cursor: "pointer"
						},
						onMouseEnter: (event) => {
							event.currentTarget.style.background = theme.cardActive;
						},
						onMouseLeave: (event) => {
							event.currentTarget.style.background = "transparent";
						},
						children: item.label
					}, item.key))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-canvas-toolbar": true,
					style: {
						display: "flex",
						alignItems: "center",
						gap: 8,
						padding: "6px 10px",
						borderBottom: `1px solid ${theme.border}`,
						background: theme.panel,
						font: "12px system-ui, sans-serif"
					},
					children: [
						needle !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-canvas-match-count": true,
							style: {
								color: theme.muted,
								font: "11px system-ui, sans-serif"
							},
							children: [matches(needle), " 个匹配"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"data-canvas-search": true,
							value: query,
							placeholder: "搜索会话（Enter 跳下一个）",
							"aria-label": "搜索会话",
							onChange: (event) => {
								setQuery(event.target.value);
								canvas.search(event.target.value);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter") canvas.searchNext?.(query);
							},
							style: {
								background: theme.bg,
								color: theme.text,
								border: `1px solid ${theme.border}`,
								borderRadius: 6,
								padding: "3px 8px",
								width: 180,
								font: "inherit"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: { color: theme.muted },
							children: [
								canvas.graph.nodes.size,
								" 个会话",
								runningCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-canvas-running-count": true,
									style: {
										color: theme.warn,
										marginLeft: 6
									},
									children: [
										"· ",
										runningCount,
										" 运行中"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-canvas-fit": true,
							onClick: fit,
							style: buttonStyle,
							children: "适配视图"
						}),
						canvas.refresh !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-canvas-refresh": true,
							onClick: () => canvas.refresh?.(),
							style: buttonStyle,
							children: "刷新"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flex: "1 1 auto",
						minHeight: 0
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: surfaceRef,
						"data-canvas-surface": true,
						className: "dsh-canvas-surface",
						onMouseDown: (event) => {
							drag.current = {
								startX: event.clientX,
								startY: event.clientY,
								viewX: canvas.view.x,
								viewY: canvas.view.y
							};
							dragStart.current = {
								x: event.clientX,
								y: event.clientY
							};
							suppressClick.current = false;
						},
						onMouseMove: (event) => {
							const started = drag.current;
							if (started === null) return;
							const origin = dragStart.current;
							if (origin !== null && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 4) suppressClick.current = true;
							canvas.onViewChange({
								x: started.viewX + (event.clientX - started.startX),
								y: started.viewY + (event.clientY - started.startY),
								scale: canvas.view.scale
							});
						},
						onMouseUp: () => {
							drag.current = null;
						},
						onMouseLeave: () => {
							drag.current = null;
						},
						onDoubleClick: (event) => {
							if (event.target.closest("[data-canvas-node]")) return;
							fitView();
						},
						onWheel: (event) => {
							const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
							canvas.onViewChange({
								...canvas.view,
								scale: clamp(canvas.view.scale * factor, MIN_SCALE, MAX_SCALE)
							});
						},
						style: {
							position: "relative",
							flex: "1 1 auto",
							overflow: "hidden",
							cursor: "grab"
						},
						children: [
							canvas.graph.nodes.size === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-canvas-empty": true,
								style: {
									position: "absolute",
									inset: 0,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									color: theme.muted,
									font: "13px system-ui, sans-serif",
									gap: 6
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "当前工作区还没有会话" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: 11,
										opacity: .7
									},
									children: "归档的会话不会出现在画布上"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-canvas-plane": true,
								style: {
									position: "absolute",
									inset: 0,
									transform: `translate(${canvas.view.x}px, ${canvas.view.y}px) scale(${canvas.view.scale})`,
									transformOrigin: "0 0"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									"data-canvas-edges": true,
									width: Math.max(layout.width, 1),
									height: Math.max(layout.height, 1),
									style: {
										position: "absolute",
										left: 0,
										top: 0,
										pointerEvents: "none"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
											id: "dsh-glow",
											x: "-40%",
											y: "-40%",
											width: "180%",
											height: "180%",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feGaussianBlur", { stdDeviation: "3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("marker", {
											id: "dsh-arrow",
											viewBox: "0 0 10 10",
											refX: "9",
											refY: "5",
											markerWidth: "5",
											markerHeight: "5",
											orient: "auto-start-reverse",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												d: "M 0 0 L 10 5 L 0 10 z",
												fill: theme.border
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("marker", {
											id: "dsh-arrow-accent",
											viewBox: "0 0 10 10",
											refX: "9",
											refY: "5",
											markerWidth: "5",
											markerHeight: "5",
											orient: "auto-start-reverse",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												d: "M 0 0 L 10 5 L 0 10 z",
												fill: theme.accent
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("marker", {
											id: "dsh-arrow-warn",
											viewBox: "0 0 10 10",
											refX: "9",
											refY: "5",
											markerWidth: "5",
											markerHeight: "5",
											orient: "auto-start-reverse",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												d: "M 0 0 L 10 5 L 0 10 z",
												fill: theme.warn
											})
										})
									] }), edgePaths(displayCanvas, layout.positions, hoverId).map((edge) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										d: edge.d,
										fill: "none",
										stroke: edge.active ? theme.accent : edge.hover ? theme.text : edge.busy ? theme.warn : theme.border,
										strokeWidth: edge.active ? 1.8 : edge.hover ? 2 : edge.busy ? 1.6 : 1.5,
										opacity: edge.active ? 1 : edge.busy ? .8 : .7,
										className: edge.busy ? "dsh-edge-busy" : void 0,
										markerEnd: edge.active ? "url(#dsh-arrow-accent)" : edge.busy ? "url(#dsh-arrow-warn)" : "url(#dsh-arrow)"
									}), edge.busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										"data-edge-glow": `${edge.from}->${edge.to}`,
										d: edge.d,
										fill: "none",
										stroke: theme.warn,
										strokeWidth: 4,
										opacity: .35,
										filter: "url(#dsh-glow)"
									})] }, `${edge.from}->${edge.to}`))]
								}), [...displayGraph.nodes.values()].map((node) => {
									const nodeTail = canvas.tailOf?.(node.id) ?? null;
									const nodeStatus = canvas.statusOf(node.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeCard, {
										node,
										status: nodeStatus,
										position: layout.positions.get(node.id) ?? {
											x: 0,
											y: 0
										},
										width: NODE_WIDTH,
										height: NODE_HEIGHT,
										selected: canvas.selectedId === node.id,
										comparing: canvas.compareIds.includes(node.id),
										parallelWrite: parallelWrite.has(node.id),
										highlight: needle !== "" && matchesNode(node, needle),
										live: nodeTail === null ? null : tailSnippet(nodeTail, 40),
										active: nodeStatus.kind === "thinking" || nodeStatus.kind === "tool" || nodeTail !== null,
										dimmed: now - node.createdAt > 864e5,
										now,
										onClick: handleNodeClick,
										onOpen: (id) => canvas.openInChat?.(id),
										onInspect: canvas.inspectSwarm === void 0 ? void 0 : openSwarm,
										onContext: openContext,
										onMouseEnter: () => setHoverId(node.id),
										onMouseLeave: () => setHoverId(void 0),
										collapseToggle: {
											visible: node.childCount > 0,
											collapsed: (canvas.collapsedNodes ?? /* @__PURE__ */ new Set()).has(node.id),
											onToggle: () => canvas.toggleSubtree?.(node.id)
										}
									}, node.id);
								})]
							}),
							layout.width > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniMap, {
								canvas,
								layout,
								stage: stageSize,
								onViewChange: (view) => canvas.onViewChange(view),
								onSelectNode: (id) => {
									canvas.onSelect(id);
									centerOn(id);
								}
							})
						]
					}), selectedId !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RightPanel, {
						tab,
						title: selectedNode?.title,
						headerAction: canvas.inspectSwarm !== void 0 && selectedId !== void 0 ? {
							label: "⌖ Agent 实况",
							title: "查看这个会话的 agent 蛛网：谁在跑、正在输出什么",
							onClick: () => openSwarm(selectedId)
						} : void 0,
						onTabChange: setTab,
						onClose: () => canvas.clearSelection?.(),
						children: [
							tab === "detail" && selectedId !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-panel-actions": true,
								style: {
									display: "flex",
									gap: 6,
									padding: "6px 10px",
									borderBottom: `1px solid ${theme.border}`
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"data-action-open-chat": true,
									onClick: () => canvas.openInChat?.(selectedId),
									style: {
										background: theme.card,
										color: theme.text,
										border: `1px solid ${theme.border}`,
										borderRadius: 6,
										padding: "3px 8px",
										font: "inherit",
										cursor: "pointer"
									},
									children: "打开对话"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"data-action-fork-latest": true,
									title: "从最新一条消息之后分叉",
									onClick: () => {
										setPendingForkFor(selectedId);
										setTab("detail");
									},
									style: {
										background: theme.card,
										color: theme.text,
										border: `1px solid ${theme.border}`,
										borderRadius: 6,
										padding: "3px 8px",
										font: "inherit",
										cursor: "pointer"
									},
									children: "⑂ 从最新分叉"
								})]
							}),
							tab === "detail" && (effectiveDetail?.turns.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-panel-stats": true,
								style: {
									padding: "6px 10px",
									color: theme.muted,
									font: "11px system-ui, sans-serif",
									borderBottom: `1px solid ${theme.border}`
								},
								children: [
									"共 ",
									effectiveDetail?.turns.length,
									" 轮 · ",
									effectiveDetail?.turns.reduce((sum, turn) => sum + turn.tools.length, 0),
									" 次工具",
									swarm !== null && swarm.state().activity.turnCount > 0 ? "" : ""
								]
							}),
							tab === "detail" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BranchTimeline, {
								turns: effectiveDetail?.turns ?? [],
								inheritedCount: effectiveDetail?.inheritedCount ?? 0,
								cwdWarning: effectiveDetail?.cwdWarning ?? false,
								conclusion: effectiveDetail?.conclusion ?? null,
								live: tail,
								onFork: openFork
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComparePanel, {
								result: comparison,
								onContinue: (side) => {
									const id = canvas.compareIds[side === "a" ? 0 : 1];
									if (id !== void 0) canvas.onSelect(id);
								},
								onCarry: (_side, draft) => {
									carry(draft);
								}
							}), carried && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-carry-done": true,
								style: {
									color: theme.accent,
									padding: "0 10px 10px"
								},
								children: "已复制到剪贴板"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForkDialog, {
								open: fork !== null,
								atSeq: fork?.atSeq ?? 0,
								inheritedCount: effectiveDetail?.inheritedCount ?? 0,
								busy: forkBusy,
								...forkError === void 0 ? {} : { error: forkError },
								onCancel: () => {
									setFork(null);
									setForkError(void 0);
								},
								onConfirm: (instruction, mode) => {
									confirmFork(instruction, mode);
								}
							})
						]
					})]
				})
			]
		});
	};
	function edgePaths(canvas, positions, hoverId) {
		const edges = [];
		for (const node of canvas.graph.nodes.values()) {
			if (node.parentId === null) continue;
			const from = positions.get(node.parentId);
			const to = positions.get(node.id);
			if (from === void 0 || to === void 0) continue;
			const x1 = from.x + NODE_WIDTH;
			const y1 = from.y + NODE_HEIGHT / 2;
			const x2 = to.x;
			const y2 = to.y + NODE_HEIGHT / 2;
			const status = canvas.statusOf(node.id).kind;
			edges.push({
				from: node.parentId,
				to: node.id,
				d: `M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`,
				active: canvas.selectedId === node.id || canvas.compareIds.includes(node.id),
				busy: status === "thinking" || status === "tool",
				hover: hoverId !== void 0 && (node.id === hoverId || node.parentId === hoverId)
			});
		}
		return edges;
	}
	function matches(title, id, needle) {
		return title.toLowerCase().includes(needle) || id.toLowerCase().includes(needle);
	}
	function matchesNode(node, needle) {
		return matches(node.title, node.id, needle);
	}
	function clamp(value, min, max) {
		return value < min ? min : value > max ? max : value;
	}
	const buttonStyle = {
		background: theme.card,
		color: theme.text,
		border: `1px solid ${theme.border}`,
		borderRadius: 6,
		padding: "3px 10px",
		font: "inherit",
		cursor: "pointer"
	};
	//#endregion
	//#region src/shared/status.ts
	const BADGES = {
		idle: {
			kind: "idle",
			confirmed: true,
			label: "空闲",
			color: "#9aa4b2"
		},
		queued: {
			kind: "queued",
			confirmed: true,
			label: "排队",
			color: "#8a7dff"
		},
		thinking: {
			kind: "thinking",
			confirmed: false,
			label: "思考中",
			color: "#f2a33c"
		},
		tool: {
			kind: "tool",
			confirmed: false,
			label: "工具执行",
			color: "#2f9e6f"
		},
		"awaiting-approval": {
			kind: "awaiting-approval",
			confirmed: true,
			label: "待批准",
			color: "#d98a2b"
		},
		failed: {
			kind: "failed",
			confirmed: true,
			label: "失败",
			color: "#e0554d"
		},
		done: {
			kind: "done",
			confirmed: true,
			label: "已完成",
			color: "#4aa3df"
		},
		unknown: {
			kind: "unknown",
			confirmed: false,
			label: "状态未知",
			color: "#5b6472"
		}
	};
	function badge(kind) {
		return BADGES[kind];
	}
	//#endregion
	//#region demo/demo-entry.tsx
	const NOW = Date.now();
	const min = 6e4;
	const n = (id, extra = {}) => ({
		id,
		parentId: null,
		externalParent: false,
		title: id,
		createdAt: NOW - 40 * min,
		running: false,
		available: true,
		seeded: false,
		cwd: "D:/demo/新品上线",
		childCount: 0,
		depth: 0,
		...extra
	});
	const nodes = [
		n("root", {
			title: "新品上线作战室",
			running: true,
			childCount: 2,
			teamRole: "lead",
			teamTasks: ["敲定首周上线时间线"]
		}),
		n("a", {
			parentId: "root",
			depth: 1,
			title: "方案 A · 社媒裂变",
			running: true,
			createdAt: NOW - 32 * min,
			childCount: 2,
			teamRole: "teammate",
			teamTasks: ["产出三版裂变短文案"]
		}),
		n("a1", {
			parentId: "a",
			depth: 2,
			title: "A-1 卖点文案生成",
			createdAt: NOW - 26 * min
		}),
		n("a2", {
			parentId: "a",
			depth: 2,
			title: "A-2 素材整理与去重",
			createdAt: NOW - 22 * min
		}),
		n("b", {
			parentId: "root",
			depth: 1,
			title: "方案 B · 付费投放",
			createdAt: NOW - 30 * min,
			childCount: 2,
			teamRole: "teammate",
			teamTasks: ["测算首周投放预算"]
		}),
		n("b1", {
			parentId: "b",
			depth: 2,
			title: "B-1 预算测算",
			createdAt: NOW - 24 * min
		}),
		n("b2", {
			parentId: "b",
			depth: 2,
			title: "B-2 渠道比稿",
			createdAt: NOW - 18 * min
		})
	];
	const graph = {
		nodes: new Map(nodes.map((x) => [x.id, x])),
		roots: ["root"],
		maxDepth: 2
	};
	const STATUS = {
		root: badge("tool"),
		a: badge("thinking"),
		a1: badge("done"),
		a2: badge("done"),
		b: badge("idle"),
		b1: badge("failed"),
		b2: badge("done")
	};
	const turnsOf = (id) => ({
		a1: [{
			index: 1,
			firstSeq: 2,
			lastSeq: 9,
			userMessage: "把产品卖点提炼成三条 20 字以内的短文案",
			assistantSummary: "已产出三版初稿，倾向场景化表达，第二条最贴近目标人群",
			tools: [{
				name: "read",
				status: "ok",
				preview: "product-brief.md"
			}, {
				name: "grep",
				status: "ok",
				preview: "卖点 · 目标人群 · 场景"
			}],
			synthetic: false
		}, {
			index: 2,
			firstSeq: 10,
			lastSeq: 18,
			userMessage: "第二条再口语化一点，加一个生活场景",
			assistantSummary: "重写第二条：早八通勤场景 + 一句话行动号召，其余两版微调标点",
			tools: [{
				name: "write",
				status: "ok",
				preview: "copy-v2.md"
			}, {
				name: "todo",
				status: "ok"
			}],
			synthetic: false
		}],
		root: [{
			index: 1,
			firstSeq: 2,
			lastSeq: 14,
			userMessage: "新品下周上线，并行跑两个推广方案，最后给我对比结论",
			assistantSummary: "已拆出方案 A（社媒裂变）与方案 B（付费投放）两个子分支并行推进",
			tools: [
				{
					name: "read",
					status: "ok",
					preview: "launch-plan.md"
				},
				{
					name: "agent",
					status: "ok",
					preview: "spawn 方案A"
				},
				{
					name: "agent",
					status: "ok",
					preview: "spawn 方案B"
				}
			],
			synthetic: false
		}]
	})[id] ?? [];
	const detailOf = (id) => ({
		sessionId: id,
		turns: turnsOf(id),
		inheritedCount: id === "root" ? 0 : 16,
		cwdWarning: true,
		conclusion: id === "a1" ? "三条文案已定稿：①早八通勤，一杯搞定；②宿舍熬夜党的救星；③周末出行，说走就走。建议主推第二条。" : id === "root" ? "两方案并行中：A 侧文案已定稿待投放，B 侧预算测算失败需人工复核渠道报价。" : null
	});
	const tailOf = (id) => {
		if (id === "root") return {
			attemptId: "t-root",
			turn: 3,
			step: 2,
			reasoning: "A 侧素材已齐，等裂变文案终稿；B 侧预算测算失败，先汇总两侧进度再决定是否补一次渠道比稿。",
			text: "",
			tool: {
				name: "pwsh",
				arguments: "node scripts/collect-progress.mjs"
			},
			lastKind: "tool"
		};
		if (id === "a") return {
			attemptId: "t-a",
			turn: 4,
			step: 1,
			reasoning: "第二条场景化文案反响最好，把这套「时间锚点 + 行动号召」句式迁移到第一条，同时保留 20 字上限。",
			text: "①早八通勤，一杯咖啡的时间搞定今日穿搭。",
			lastKind: "thinking"
		};
		return null;
	};
	const noop = () => {};
	const canvasModel = {
		graph,
		statusOf: (id) => STATUS[id] ?? badge("idle"),
		selectedId: "a1",
		compareIds: ["b2"],
		view: {
			x: 330,
			y: 290,
			scale: 1
		},
		onSelect: noop,
		onToggleCompare: noop,
		onViewChange: noop,
		search: noop,
		detail: (id) => Promise.resolve(detailOf(id)),
		tailOf,
		openInChat: noop,
		clearSelection: noop
	};
	const swarm = {
		rootId: "root",
		rootLabel: "新品上线作战室",
		rootSnippet: {
			label: "工具",
			text: "node scripts/collect-progress.mjs"
		},
		activity: {
			turnCount: 15,
			openTurn: true,
			currentTurn: 15,
			tools: [
				{
					id: "c1",
					name: "read",
					status: "ok",
					turn: 12
				},
				{
					id: "c2",
					name: "pwsh",
					status: "ok",
					turn: 13
				},
				{
					id: "c3",
					name: "grep",
					status: "ok",
					turn: 14
				},
				{
					id: "c4",
					name: "pwsh",
					status: "pending",
					turn: 15
				}
			],
			pendingToolId: "c4"
		},
		toolLayout: layoutActivity([
			{
				id: "c1",
				name: "read",
				status: "ok",
				turn: 12
			},
			{
				id: "c2",
				name: "pwsh",
				status: "ok",
				turn: 13
			},
			{
				id: "c3",
				name: "grep",
				status: "ok",
				turn: 14
			},
			{
				id: "c4",
				name: "pwsh",
				status: "pending",
				turn: 15
			}
		]),
		todos: /* @__PURE__ */ new Map([["writer", [
			{
				content: "第一条：场景化开头",
				status: "completed"
			},
			{
				content: "第二条：口语化重写",
				status: "in_progress"
			},
			{
				content: "第三条：行动号召收尾",
				status: "pending"
			}
		]], ["retriever", [{
			content: "竞品近 30 天素材清单",
			status: "completed"
		}, {
			content: "去重与标签归类",
			status: "completed"
		}]]]),
		team: null,
		rootConclusion: "首周转化预估 3.2%：建议主推方案 A 的第二条文案，B 侧预算测算失败待人工复核。",
		agents: [
			{
				id: "retriever",
				label: "检索器",
				depth: 1,
				status: "idle",
				role: "teammate",
				snippet: null,
				tail: null,
				toolCount: 6,
				conclusion: "竞品素材 42 条已归档，重复率 18%。",
				description: "收集竞品近 30 天投放素材并去重"
			},
			{
				id: "writer",
				label: "文案写手",
				depth: 1,
				status: "streaming",
				role: "teammate",
				snippet: {
					label: "推理",
					text: "把「时间锚点 + 行动号召」句式迁移到第一条…"
				},
				tail: null,
				toolCount: 4,
				conclusion: null,
				description: "产出三版 20 字以内社媒短文案"
			},
			{
				id: "crawler",
				label: "数据爬虫",
				depth: 1,
				status: "running",
				role: "teammate",
				snippet: {
					label: "工具",
					text: "pwsh · fetch竞品价格页"
				},
				tail: null,
				toolCount: 9,
				conclusion: null,
				description: "盯竞品价格与库存变化，小时级回报"
			},
			{
				id: "budget",
				label: "预算测算员",
				depth: 1,
				status: "failed",
				role: "teammate",
				snippet: {
					label: "错误",
					text: "渠道报价接口超时，重试 3 次失败"
				},
				tail: null,
				toolCount: 3,
				conclusion: null,
				description: "测算首周投放预算与保本 ROI"
			},
			{
				id: "reviewer",
				label: "审校员",
				depth: 1,
				status: "idle",
				role: "teammate",
				snippet: null,
				tail: null,
				toolCount: 2,
				conclusion: "前两稿合规无风险词。",
				description: "文案合规与风险词审查"
			}
		],
		edges: [
			{
				from: "root",
				to: "retriever"
			},
			{
				from: "root",
				to: "writer"
			},
			{
				from: "root",
				to: "crawler"
			},
			{
				from: "root",
				to: "budget"
			},
			{
				from: "root",
				to: "reviewer"
			}
		],
		layout: layoutSwarm([
			{
				id: "root",
				parentId: null,
				depth: 0,
				mode: "continuable"
			},
			{
				id: "retriever",
				parentId: "root",
				depth: 1,
				mode: "continuable"
			},
			{
				id: "writer",
				parentId: "root",
				depth: 1,
				mode: "continuable"
			},
			{
				id: "crawler",
				parentId: "root",
				depth: 1,
				mode: "continuable"
			},
			{
				id: "budget",
				parentId: "root",
				depth: 1,
				mode: "continuable"
			},
			{
				id: "reviewer",
				parentId: "root",
				depth: 1,
				mode: "continuable"
			}
		], "root", { radius: 350 }),
		heat: /* @__PURE__ */ new Map([
			["writer", NOW - 800],
			["crawler", NOW - 4e3],
			["budget", NOW - 6e4]
		])
	};
	const screen = new URLSearchParams(location.search).get("screen") ?? "canvas";
	(0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.StrictMode, { children: screen === "swarm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentSwarmView, {
		swarm,
		onClose: noop,
		nowMs: NOW
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasTab, { canvas: canvasModel }) }));
	//#endregion
})();
