window.__ModuleLoader__.load({
	id: "dsh-canvas",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		const NS = "dsh-canvas";
		const zh = {
			"view.canvas": "画布",
			"toolbar.search": "搜索",
			"toolbar.layout": "布局",
			"toolbar.refresh": "刷新",
			"panel.detail": "详情",
			"panel.compare": "对比",
			"fork.here": "从此分叉",
			"fork.inherit": "继承",
			"fork.launch.now": "立即开跑",
			"fork.launch.later": "只建分支",
			"fork.cwdWarning": "并行分支共享同一工作目录，同时写文件可能互相覆盖",
			"compare.continue": "切换至此分支继续",
			"compare.carry": "带回结论",
			"compare.empty": "选择两个分支进行对比",
			"state.unknown": "状态未知"
		};
		const en = {
			"view.canvas": "Canvas",
			"toolbar.search": "Search",
			"toolbar.layout": "Layout",
			"toolbar.refresh": "Refresh",
			"panel.detail": "Detail",
			"panel.compare": "Compare",
			"fork.here": "Fork here",
			"fork.inherit": "inherits",
			"fork.launch.now": "Run now",
			"fork.launch.later": "Create empty branch",
			"fork.cwdWarning": "Parallel branches share one working directory; concurrent writes may overwrite each other",
			"compare.continue": "Continue in this branch",
			"compare.carry": "Carry conclusion here",
			"compare.empty": "Select two branches to compare",
			"state.unknown": "Status unknown"
		};
		//#endregion
		//#region src/client/theme.ts
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
		const byAge = (createdAt) => (a, b) => {
			const delta = createdAt(a) - createdAt(b);
			return delta !== 0 ? delta : a < b ? -1 : a > b ? 1 : 0;
		};
		/**
		* Builds the workspace lineage graph the canvas renders.
		*
		* Roots are members with no parent, an external (non-member) parent, or a parent
		* missing from the node map. A member still unreachable from those roots can
		* only sit inside a lineage cycle, so the earliest such member (by `createdAt`,
		* then id) is promoted to a root and the traversal repeats — at most
		* `members.size` iterations, since every pass appends exactly one root. A
		* promoted root keeps its raw `parentId`, so consumers must read `roots` and
		* `CanvasNode.depth` rather than testing for a parentless node.
		*
		* Duplicate ids in `summaries` are last-write-wins.
		*/
		function buildLineageGraph(summaries, memberIds) {
			const members = /* @__PURE__ */ new Map();
			for (const summary of summaries) if (memberIds.has(summary.id)) members.set(summary.id, summary);
			const children = /* @__PURE__ */ new Map();
			for (const [id, summary] of members) {
				const parentId = summary.parentId;
				if (parentId == null || !members.has(parentId)) continue;
				const siblings = children.get(parentId);
				if (siblings === void 0) children.set(parentId, [id]);
				else siblings.push(id);
			}
			const createdAt = (id) => members.get(id)?.createdAt ?? 0;
			const measureDepth = (roots) => {
				const depth = /* @__PURE__ */ new Map();
				const queue = [];
				let maxDepth = 0;
				for (const root of roots) {
					if (depth.has(root)) continue;
					depth.set(root, 0);
					queue.push(root);
				}
				for (let head = 0; head < queue.length; head += 1) {
					const id = queue[head];
					if (id === void 0) continue;
					const at = depth.get(id) ?? 0;
					for (const child of children.get(id) ?? []) {
						if (depth.has(child)) continue;
						depth.set(child, at + 1);
						if (at + 1 > maxDepth) maxDepth = at + 1;
						queue.push(child);
					}
				}
				return {
					depth,
					maxDepth
				};
			};
			const roots = [];
			for (const id of members.keys()) {
				const parentId = members.get(id)?.parentId;
				if (parentId == null || !members.has(parentId)) roots.push(id);
			}
			let measured = measureDepth(roots);
			for (;;) {
				const unreached = [...members.keys()].filter((id) => !measured.depth.has(id));
				if (unreached.length === 0) break;
				const next = [...unreached].sort(byAge(createdAt))[0];
				if (next === void 0) break;
				roots.push(next);
				measured = measureDepth(roots);
			}
			const { depth, maxDepth } = measured;
			const nodes = /* @__PURE__ */ new Map();
			for (const [id, summary] of members) {
				const parentId = summary.parentId ?? null;
				nodes.set(id, {
					id,
					parentId,
					externalParent: parentId !== null && !memberIds.has(parentId),
					title: summary.title ?? id,
					createdAt: summary.createdAt,
					running: summary.running,
					available: summary.available,
					seeded: summary.seeded ?? false,
					cwd: summary.cwd ?? null,
					childCount: children.get(id)?.length ?? 0,
					depth: depth.get(id) ?? 0
				});
			}
			roots.sort(byAge(createdAt));
			return {
				nodes,
				roots,
				maxDepth
			};
		}
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
		const SETTLERS = /* @__PURE__ */ new Set(["assistant/message", "assistant/attempt"]);
		const asRecord$1 = (value) => typeof value === "object" && value !== null ? value : null;
		const asNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
		const asString$1 = (value) => typeof value === "string" ? value : null;
		/**
		* The live tail of the window's most recent attempt, or null when nothing is
		* streaming (or the latest attempt already settled).
		*/
		function liveTailFromEntries(entries) {
			/** Settlement seqs by `turn:step`, from the durable rows. */
			const settledAt = /* @__PURE__ */ new Map();
			/** Live attempts by attemptId. */
			const attempts = /* @__PURE__ */ new Map();
			for (const entry of entries) {
				if (entry === null || typeof entry !== "object") continue;
				const event = entry.event;
				if (event === null || typeof event !== "object") continue;
				const seq = asNumber(event.seq);
				if (seq === null) continue;
				if (entry.type === "event") {
					if (SETTLERS.has(event.type)) {
						const data = asRecord$1(event.data);
						const turn = asNumber(data?.["turn"]);
						const step = asNumber(data?.["step"]);
						if (turn !== null && step !== null) {
							const key = `${turn}:${step}`;
							const seen = settledAt.get(key);
							if (seen === void 0 || seq > seen) settledAt.set(key, seq);
						}
					}
					continue;
				}
				if (entry.type !== "transient" || event.type !== "assistant/live-chunk") continue;
				const data = asRecord$1(event.data);
				const attemptId = asString$1(data?.["attemptId"]);
				const turn = asNumber(data?.["turn"]);
				const step = asNumber(data?.["step"]);
				const chunk = asRecord$1(data?.["chunk"]);
				if (attemptId === null || turn === null || step === null || chunk === null) continue;
				let attempt = attempts.get(attemptId);
				if (attempt === void 0) {
					attempt = {
						attemptId,
						turn,
						step,
						blocks: /* @__PURE__ */ new Map(),
						order: [],
						lastSeq: seq
					};
					attempts.set(attemptId, attempt);
				}
				if (seq > attempt.lastSeq) attempt.lastSeq = seq;
				const index = asNumber(chunk["index"]);
				const apply = (block, at) => {
					if (!attempt.blocks.has(at)) attempt.order.push(at);
					attempt.blocks.set(at, block);
				};
				switch (chunk["type"]) {
					case "block-start": {
						if (index === null) break;
						const kind = asString$1(chunk["blockType"]);
						if (kind === "text") apply({
							kind: "text",
							text: ""
						}, index);
						else if (kind === "reasoning") apply({
							kind: "reasoning",
							text: ""
						}, index);
						else if (kind === "tool-call") apply({
							kind: "tool",
							name: "",
							args: ""
						}, index);
						break;
					}
					case "text-delta": {
						if (index === null) break;
						const text = asString$1(chunk["text"]);
						if (text === null) break;
						const previous = attempt.blocks.get(index);
						apply({
							kind: "text",
							text: (previous?.kind === "text" ? previous.text : "") + text
						}, index);
						break;
					}
					case "reasoning-delta": {
						if (index === null) break;
						const text = asString$1(chunk["text"]);
						if (text === null) break;
						const previous = attempt.blocks.get(index);
						apply({
							kind: "reasoning",
							text: (previous?.kind === "reasoning" ? previous.text : "") + text
						}, index);
						break;
					}
					case "tool-call-delta": {
						if (index === null) break;
						const previous = attempt.blocks.get(index);
						const base = previous?.kind === "tool" ? previous : {
							kind: "tool",
							name: "",
							args: ""
						};
						apply({
							kind: "tool",
							name: base.name !== "" ? base.name : asString$1(chunk["name"]) ?? "",
							args: base.args + (asString$1(chunk["argumentsDelta"]) ?? "")
						}, index);
						break;
					}
				}
			}
			let latest;
			for (const attempt of attempts.values()) if (latest === void 0 || attempt.lastSeq > latest.lastSeq) latest = attempt;
			if (latest === void 0) return null;
			const current = latest;
			const settled = settledAt.get(`${current.turn}:${current.step}`);
			if (settled !== void 0 && settled > current.lastSeq) return null;
			const ordered = current.order.map((index) => current.blocks.get(index)).filter((block) => block !== void 0);
			const reasoning = ordered.filter((block) => block.kind === "reasoning").map((block) => block.text).join("\n");
			const text = ordered.filter((block) => block.kind === "text").map((block) => block.text).join("\n");
			const lastBlock = ordered[ordered.length - 1];
			const toolBlocks = ordered.filter((block) => block.kind === "tool");
			const tool = toolBlocks[toolBlocks.length - 1];
			return {
				attemptId: current.attemptId,
				turn: current.turn,
				step: current.step,
				reasoning,
				text,
				...tool === void 0 ? {} : { tool: {
					name: tool.name,
					arguments: tool.args
				} },
				phase: lastBlock?.kind === "tool" ? "tool" : "thinking",
				seq: current.lastSeq
			};
		}
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
		//#region src/client/ui/NodeCard.tsx
		const NodeCard = ({ node, status, position, width, height, selected, comparing, parallelWrite, highlight, live = null, active = false, dimmed = false, now, onClick, onOpen, onInspect, onContext, onMouseEnter, onMouseLeave, collapseToggle }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 6
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								fontWeight: 600,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: node.title
						}),
						node.seeded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"data-node-seeded": "true",
							title: "分叉会话",
							style: {
								color: theme.accent,
								flex: "0 0 auto"
							},
							children: "⑂"
						}),
						node.teamTasks !== void 0 && node.teamTasks.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
						node.teamRole !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
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
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
						node.externalParent && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							title: "父会话不在当前工作区",
							children: " · 外部父"
						})
					]
				}),
				collapseToggle !== void 0 && collapseToggle.visible && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
				onInspect !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
				live != null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					"data-node-live": true,
					style: {
						display: "flex",
						gap: 4,
						marginTop: 2,
						overflow: "hidden",
						whiteSpace: "nowrap",
						color: theme.muted
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"data-node-live-label": true,
						style: {
							flex: "0 0 auto",
							color: live.label === "工具" ? theme.accent : theme.muted
						},
						children: live.label
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							overflow: "hidden",
							textOverflow: "ellipsis"
						},
						children: live.text
					})]
				}),
				parallelWrite && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
		const RightPanel = ({ tab, title, headerAction, onTabChange, onClose, children }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
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
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-panel-header": true,
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8,
					padding: "6px 10px",
					borderBottom: `1px solid ${theme.border}`
				},
				children: [
					["detail", "compare"].map((candidate) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
					title !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							color: theme.muted,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap"
						},
						children: title
					}),
					headerAction !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
		const MAX_DEPTH = 2;
		const asRecord = (value) => typeof value === "object" && value !== null ? value : null;
		const asString = (value) => typeof value === "string" ? value : null;
		/** Team member descriptions folded from `team/member` events. Shared between
		*  the swarm controller (writes) and the graph-controller (reads). */
		const teamDescriptionCache = /* @__PURE__ */ new Map();
		const catalogChildren = (entries) => {
			const children = [];
			for (const entry of entries) {
				const row = asRecord(entry);
				if (row === null || row["type"] !== "event") continue;
				const event = asRecord(row["event"]);
				if (event === null || event["type"] !== "subagent/catalog") continue;
				const data = asRecord(event["data"]);
				if (data === null) continue;
				const childId = typeof data["childId"] === "string" ? data["childId"] : null;
				if (childId === null) continue;
				const mode = data["mode"] === "one-shot" || data["mode"] === "continuable" ? data["mode"] : "unknown";
				children.push({
					id: childId,
					...typeof data["label"] === "string" ? { label: data["label"] } : {},
					mode
				});
			}
			return children;
		};
		/**
		* The swarm under `rootId`, merged append-only across the windows that were
		* readable. Only the root and already-known agents contribute children, so a
		* window we could not place never invents membership; the first sighting of a
		* child wins (catalog events are append-only facts, never retractions).
		*/
		function agentsFromWindows(windows, rootId, cap = 24) {
			const agents = /* @__PURE__ */ new Map();
			agents.set(rootId, {
				id: rootId,
				parentId: null,
				depth: 0,
				mode: "continuable"
			});
			let changed = true;
			while (changed && agents.size - 1 < cap) {
				changed = false;
				for (const window of windows) {
					const parent = agents.get(window.sessionId);
					if (parent === void 0 || parent.depth >= MAX_DEPTH) continue;
					for (const child of catalogChildren(window.entries)) {
						if (agents.has(child.id) || child.id === rootId || agents.size - 1 >= cap) continue;
						agents.set(child.id, {
							id: child.id,
							parentId: window.sessionId,
							depth: parent.depth + 1,
							...child.label === void 0 ? {} : { label: child.label },
							mode: child.mode
						});
						changed = true;
					}
					for (const entry of window.entries) {
						const row = asRecord(entry);
						if (row === null || row["type"] !== "event") continue;
						const event = asRecord(row["event"]);
						if (event === null || event["type"] !== "team/member") continue;
						const data = asRecord(event["data"]);
						const member = asRecord(data?.["member"]);
						if (member === null) continue;
						const memberId = asString(member["id"]);
						const description = asString(member["description"]);
						if (memberId === null || description === null || description === "") continue;
						teamDescriptionCache.set(memberId, description);
						const known = agents.get(memberId);
						if (known !== void 0 && known.description === void 0) agents.set(memberId, {
							...known,
							description
						});
					}
				}
			}
			return [...agents.values()].filter((agent) => agent.id !== rootId);
		}
		/** One spoke per non-root agent. Edges point parent → child. */
		function swarmEdges(agents, rootId) {
			return agents.filter((agent) => agent.parentId !== null).map((agent) => ({
				from: agent.parentId,
				to: agent.id
			}));
		}
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
		const ACTIVITY_TOOL_CAP = 12;
		/**
		* The session's own work, folded from its durable events: turn counting plus
		* `tool/call`→`tool/result` pairing (the same discriminator branch-segment
		* uses). A long single-agent task shows up here as turns accumulating and a
		* permanently pending tool while it runs.
		*/
		function activityFromEntries(entries, cap = ACTIVITY_TOOL_CAP) {
			let turnCount = 0;
			let openTurn = false;
			let currentTurn = null;
			const tools = [];
			for (const entry of entries) {
				const row = asRecord(entry);
				if (row === null || row["type"] !== "event") continue;
				const event = asRecord(row["event"]);
				if (event === null) continue;
				const data = asRecord(event["data"]);
				switch (event["type"]) {
					case "turn/start":
						if (typeof data?.["turn"] === "number") {
							openTurn = true;
							currentTurn = data["turn"];
						}
						break;
					case "turn/end":
						turnCount += 1;
						openTurn = false;
						currentTurn = null;
						break;
					case "tool/call": {
						const callId = data?.["callId"];
						if (typeof callId !== "string" || callId === "") break;
						const collapsed = (typeof data?.["arguments"] === "string" ? data["arguments"] : "").replace(/\s+/g, " ").trim();
						const meaningful = collapsed !== "" && collapsed !== "{}" && collapsed !== "[]";
						tools.push({
							id: callId,
							name: typeof data?.["name"] === "string" ? data["name"] : "…",
							status: "pending",
							turn: typeof data?.["turn"] === "number" ? data["turn"] : 0,
							...meaningful ? { preview: collapsed.length > 48 ? `${collapsed.slice(0, 48)}…` : collapsed } : {}
						});
						if (tools.length > cap) tools.shift();
						break;
					}
					case "tool/result": {
						const message = asRecord(data?.["message"]);
						const callId = message === null ? void 0 : message["toolCallId"];
						if (typeof callId !== "string") break;
						const tool = [...tools].reverse().find((candidate) => candidate.id === callId && candidate.status === "pending");
						if (tool !== void 0) {
							const failure = data === null ? null : asRecord(data["error"]);
							const failed = data !== null && data["error"] !== void 0;
							const message = failure === null ? null : asString(failure["message"]);
							tool.status = failed ? "error" : "ok";
							if (failed && message !== null) tool.error = message;
						}
						break;
					}
				}
			}
			const pending = [...tools].reverse().find((tool) => tool.status === "pending");
			return {
				turnCount,
				openTurn,
				currentTurn,
				tools,
				pendingToolId: pending?.id ?? null
			};
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
		* The agent's current todo list: the last `todo/write` snapshot in its own
		* window (whole-list, last-write-wins — the same fold DSH's projection uses).
		* Null before the first write; malformed rows are skipped.
		*/
		function todosFromEntries(entries) {
			let todos = null;
			for (const entry of entries) {
				const row = asRecord(entry);
				if (row === null || row["type"] !== "event") continue;
				const event = asRecord(row["event"]);
				if (event === null || event["type"] !== "todo/write") continue;
				const data = asRecord(event["data"]);
				const list = data === null ? void 0 : data["todos"];
				if (!Array.isArray(list)) continue;
				const folded = [];
				for (const item of list) {
					const record = asRecord(item);
					const content = record === null ? void 0 : record["content"];
					const status = record?.["status"];
					if (typeof content !== "string" || content === "") continue;
					if (status !== "pending" && status !== "in_progress" && status !== "completed") continue;
					folded.push({
						content,
						status
					});
				}
				if (folded.length > 0) todos = folded;
			}
			return todos;
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
		* Team members of every projected session, keyed by member session id — the
		* canvas uses this to show a teammate's team name instead of its prompt, and
		* to badge it as a team member.
		*/
		function teamMembersFromList(snapshot) {
			const members = /* @__PURE__ */ new Map();
			if (snapshot === null || typeof snapshot !== "object") return members;
			const projections = snapshot.projectionsBySession;
			if (projections === null || typeof projections !== "object") return members;
			for (const entry of Object.values(projections)) {
				if (entry === null || typeof entry !== "object") continue;
				const values = entry.values;
				if (values === null || typeof values !== "object") continue;
				const team = values["agentTeam"];
				if (team === null || typeof team !== "object") continue;
				const rows = team.members;
				if (!Array.isArray(rows)) continue;
				for (const row of rows) {
					if (row === null || typeof row !== "object") continue;
					const record = row;
					if (typeof record["id"] !== "string" || record["id"] === "" || typeof record["name"] !== "string" || record["name"] === "") continue;
					const role = record["role"] === "lead" ? "lead" : "teammate";
					if (!members.has(record["id"])) members.set(record["id"], {
						id: record["id"],
						name: record["name"],
						role
					});
				}
			}
			return members;
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
		* In-progress shared task subjects per owning session, folded from every
		* projected team in the list snapshot — the canvas shows these on member
		* cards so the board and the map tell the same story.
		*/
		function teamTasksByOwner(snapshot) {
			const byOwner = /* @__PURE__ */ new Map();
			if (snapshot === null || typeof snapshot !== "object") return byOwner;
			const projections = snapshot.projectionsBySession;
			if (projections === null || typeof projections !== "object") return byOwner;
			for (const entry of Object.values(projections)) {
				if (entry === null || typeof entry !== "object") continue;
				const values = entry.values;
				if (values === null || typeof values !== "object") continue;
				const team = values["agentTeam"];
				if (team === null || typeof team !== "object") continue;
				const tasks = team.tasks;
				if (!Array.isArray(tasks)) continue;
				for (const task of tasks) {
					if (task === null || typeof task !== "object") continue;
					const record = task;
					if (record["status"] !== "in_progress") continue;
					const owner = record["ownerId"];
					const subject = record["subject"];
					if (typeof owner !== "string" || typeof subject !== "string") continue;
					const current = byOwner.get(owner);
					byOwner.set(owner, current === void 0 ? [subject] : [...current, subject]);
				}
			}
			return byOwner;
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
			const [copied, setCopied] = (0, react.useState)(false);
			const [expandedArgs, setExpandedArgs] = (0, react.useState)(() => /* @__PURE__ */ new Set());
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-branch-timeline": true,
				style: {
					font: "12px/1.5 system-ui, sans-serif",
					color: theme.text
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-detail-conclusion": true,
						style: {
							padding: "8px 10px",
							borderBottom: `1px solid ${theme.border}`,
							background: theme.card
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								color: theme.muted,
								marginBottom: 4,
								display: "flex",
								alignItems: "center",
								gap: 8
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: live != null ? "最新结论（正在产出…）" : "最新结论" }),
								conclusion != null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
								copied && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"data-copy-done": true,
									style: { color: theme.accent },
									children: "已复制"
								})
							]
						}), conclusion ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								whiteSpace: "pre-wrap",
								wordBreak: "break-word"
							},
							children: conclusion
						}) : live != null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							"data-conclusion-waiting": true,
							style: { color: theme.accent },
							children: "▍正在产出结论…"
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: { color: theme.muted },
							children: "还没有结论"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
					cwdWarning && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"data-timeline-cwd-warning": true,
						style: {
							color: theme.warn,
							padding: "6px 10px"
						},
						children: "⚠ 并行分支共享同一工作目录，同时写文件可能互相覆盖"
					}),
					live != null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-live-tail": true,
						"data-live-phase": live.phase,
						style: {
							padding: "8px 10px",
							borderBottom: `1px solid ${theme.border}`,
							background: theme.card
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: 8,
									color: theme.muted
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"data-live-cursor": true,
										style: { color: theme.accent },
										children: "▍"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: live.phase === "tool" ? "工具执行中" : "正在输出" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										"第 ",
										live.turn + 1,
										" 轮 · 步骤 ",
										live.step + 1
									] })
								]
							}),
							live.reasoning !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
							live.text !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								"data-live-text": true,
								style: {
									marginTop: 4,
									whiteSpace: "pre-wrap",
									wordBreak: "break-word"
								},
								children: live.text
							}),
							live.tool !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
					turns.length === 0 && live == null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"data-timeline-empty": true,
						style: {
							color: theme.muted,
							padding: 10
						},
						children: "该分支还没有自己的事件"
					}),
					turns.map((turn) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-timeline-row": turn.index,
						"data-row-synthetic": turn.synthetic ? "true" : "false",
						style: {
							padding: "8px 10px",
							borderBottom: `1px solid ${theme.border}`,
							opacity: turn.synthetic ? .6 : 1
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: 8,
									color: theme.muted
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"data-row-seq": true,
										children: `seq ${turn.firstSeq}–${turn.lastSeq}`
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										"第 ",
										turn.index + 1,
										" 轮"
									] }),
									turn.endedAs !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"data-row-ended": true,
										children: turn.endedAs
									}),
									turn.synthetic && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"data-row-synthetic-marker": true,
										title: "分叉时合成的事件",
										children: "合成"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										style: {
											marginLeft: "auto",
											display: "flex",
											alignItems: "center",
											gap: 6
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [turn.tools.length, " 次工具"] }), turn.tools.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											"data-row-tool-names": true,
											style: {
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												maxWidth: 150
											},
											children: turn.tools.map((tool, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												"data-row-tool-error": tool.status === "error" ? "true" : void 0,
												style: { color: tool.status === "error" ? "#e0554d" : "inherit" },
												children: [
													index > 0 && " · ",
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														style: { fontWeight: 600 },
														children: toolLabel(tool.name)
													}),
													tool.preview !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
									expandedArgs.has(turn.index) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										"data-row-args-detail": true,
										style: {
											marginTop: 4,
											padding: "4px 8px",
											borderRadius: 6,
											background: theme.card,
											color: theme.muted,
											font: "11px/1.6 ui-monospace, monospace"
										},
										children: turn.tools.filter((tool) => tool.preview !== void 0).map((tool, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
											tool.name,
											": ",
											tool.preview
										] }, `${index}-${tool.name}`))
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								"data-row-user": true,
								style: { marginTop: 2 },
								children: turn.userMessage ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: { color: theme.muted },
									children: "（无用户消息）"
								})
							}),
							turn.assistantSummary !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
			const [instruction, setInstruction] = (0, react.useState)("");
			const [mode, setMode] = (0, react.useState)("now");
			if (!open) return null;
			const trimmed = instruction.trim();
			const blocked = mode === "now" && trimmed === "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							fontWeight: 600,
							marginBottom: 6
						},
						children: "从此分叉"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
							inheritedCount > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								"（其中 ",
								inheritedCount,
								" 个来自更上游）"
							] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 12,
							margin: "8px 0"
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 4
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "radio",
								name: "dsh-canvas-fork-mode",
								"data-fork-mode": "now",
								checked: mode === "now",
								onChange: () => setMode("now")
							}), "立即开跑"]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 4
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "radio",
								name: "dsh-canvas-fork-mode",
								"data-fork-mode": "later",
								checked: mode === "later",
								onChange: () => setMode("later")
							}), "只建分支"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"data-fork-cwd-warning": true,
						style: {
							color: theme.warn,
							marginBottom: 8
						},
						children: "⚠ 并行分支共享同一工作目录，同时写文件可能互相覆盖"
					}),
					error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"data-fork-error": true,
						style: {
							color: theme.warn,
							marginBottom: 8
						},
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-end",
							gap: 8
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"data-fork-cancel": true,
							onClick: onCancel,
							style: buttonStyle$2,
							children: "取消"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
			const [draft, setDraft] = (0, react.useState)(null);
			const [draftSide, setDraftSide] = (0, react.useState)("a");
			if (result === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-compare-panel": true,
				style: {
					font: "12px/1.6 system-ui, sans-serif",
					color: theme.text
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-compare-summary": true,
						style: {
							padding: "8px 10px",
							borderBottom: `1px solid ${theme.border}`
						},
						children: [
							SIDES.map((side) => {
								const segment = side === "a" ? result.a : result.b;
								const tools = segment.turns.filter((t) => !t.synthetic).reduce((n, t) => n + t.tools.length, 0);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									"data-compare-side": side,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: { fontWeight: 600 },
										children: side.toUpperCase()
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								"data-compare-tool-diff": true,
								style: { color: theme.muted },
								children: ["工具调用差：", result.toolCountDiff > 0 ? `+${result.toolCountDiff}` : result.toolCountDiff]
							}),
							result.bothFailed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								"data-compare-both-failed": true,
								style: { color: theme.warn },
								children: "两边都以失败结束"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"data-compare-conclusions": true,
						style: {
							display: "flex",
							gap: 8,
							padding: "8px 10px",
							borderBottom: `1px solid ${theme.border}`
						},
						children: SIDES.map((side) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							"data-conclusion-side": side,
							style: {
								flex: "1 1 0",
								minWidth: 0
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: { color: theme.muted },
								children: [
									side.toUpperCase(),
									" 最后结论",
									result.lastConclusion.side === "both" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"data-conclusion-note": true,
										children: " · 两边一致"
									}),
									result.lastConclusion.side === side && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"data-conclusion-note": true,
										children: " · 更完整"
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								"data-conclusion-text": true,
								children: lastSummary(side) === "" ? "—" : lastSummary(side)
							})]
						}, side))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"data-compare-rows": true,
						children: result.turnDiffs.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							"data-compare-row": index,
							"data-row-equal": row.equal ? "true" : "false",
							style: {
								display: "flex",
								gap: 8,
								padding: "6px 10px",
								borderBottom: `1px solid ${theme.border}`
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								"data-compare-left": true,
								style: {
									flex: "1 1 0",
									minWidth: 0,
									color: row.equal ? theme.muted : theme.text
								},
								children: row.left?.userMessage ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: { color: theme.muted },
									children: "—"
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								"data-compare-right": true,
								style: {
									flex: "1 1 0",
									minWidth: 0,
									color: row.equal ? theme.muted : theme.text
								},
								children: row.right?.userMessage ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: { color: theme.muted },
									children: "—"
								})
							})]
						}, index))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-compare-actions": true,
						style: {
							display: "flex",
							flexWrap: "wrap",
							gap: 6,
							padding: 10
						},
						children: [SIDES.map((side) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-continue": side,
							onClick: () => onContinue(side),
							style: buttonStyle$1,
							children: [
								"切换至 ",
								side.toUpperCase(),
								" 继续"
							]
						}, `continue-${side}`)), SIDES.map((side) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
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
					draft !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-carry-editor": true,
						style: { padding: "0 10px 10px" },
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
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
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: 6,
								marginTop: 6
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"data-carry-discard": true,
								onClick: () => setDraft(null),
								style: buttonStyle$1,
								children: "取消"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
		const Arms = ({ color, species = "agent" }) => species === "device" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			className: "dsh-robot-arm dsh-robot-arm-l",
			x: "5",
			y: "30",
			width: "4",
			height: "9",
			rx: "2",
			fill: color,
			opacity: "0.8"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
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
		const VisorHead = ({ color, state, rx = 5 }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "8",
				y: "12",
				width: "24",
				height: "16",
				rx,
				fill: color,
				opacity: "0.9"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "11",
				y: "16",
				width: "18",
				height: "8",
				rx: "3",
				fill: "#0b0d12"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				className: "dsh-robot-eye",
				cx: "16",
				cy: "20",
				r: "1.8",
				fill: eyeColor(state)
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
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
		const Body = ({ color, species = "agent", children }) => species === "device" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
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
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "14.5",
				y: "37",
				width: "3",
				height: "4",
				rx: "1",
				fill: color,
				opacity: "0.6"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "22.5",
				y: "37",
				width: "3",
				height: "4",
				rx: "1",
				fill: color,
				opacity: "0.6"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				"data-robot-part": "stand",
				x: "9",
				y: "41",
				width: "22",
				height: "2.4",
				rx: "1.2",
				fill: color,
				opacity: "0.45"
			})
		] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			className: "dsh-robot-body",
			x: "11",
			y: "30",
			width: "18",
			height: "11",
			rx: "4",
			fill: color,
			opacity: "0.75"
		}), children ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			className: "dsh-robot-chest",
			cx: "20",
			cy: "35.5",
			r: "2",
			fill: "#0b0d12"
		})] });
		/** Straight antenna with one LED. */
		const Antenna = ({ color, state }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
			x1: "20",
			y1: "5",
			x2: "20",
			y2: "13",
			stroke: color,
			strokeWidth: "2"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			className: "dsh-robot-led",
			cx: "20",
			cy: "4",
			r: "3",
			fill: ledColor(state, color)
		})] });
		const VariantBody = ({ color, state, variant, species = "agent" }) => {
			switch (variant) {
				case "shell": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: "20",
						y1: "7",
						x2: "20",
						y2: "12",
						stroke: color,
						strokeWidth: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						className: "dsh-robot-led",
						x: "17",
						y: "3",
						width: "6",
						height: "5",
						rx: "1.5",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "7",
						y: "12",
						width: "26",
						height: "17",
						rx: "2.5",
						fill: color,
						opacity: "0.9"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "10",
						y: "15",
						width: "20",
						height: "11",
						rx: "1.5",
						fill: "#0b0d12"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						"data-robot-part": "terminal",
						d: "M 12 18 l 3 2.5 l -3 2.5",
						fill: "none",
						stroke: eyeColor(state),
						strokeWidth: "1.4"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: "17",
						y1: "23",
						x2: "27",
						y2: "23",
						stroke: eyeColor(state),
						strokeWidth: "1.2",
						opacity: "0.8"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Body, {
						color,
						species,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							x: "14",
							y: "33",
							width: "4",
							height: "4",
							rx: "1",
							fill: "#0b0d12"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							x: "22",
							y: "33",
							width: "4",
							height: "4",
							rx: "1",
							fill: "#0b0d12"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					})
				] });
				case "job": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: "15",
						y1: "6",
						x2: "15",
						y2: "13",
						stroke: color,
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: "dsh-robot-led",
						cx: "15",
						cy: "5",
						r: "2.4",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: "25",
						y1: "6",
						x2: "25",
						y2: "13",
						stroke: color,
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: "dsh-robot-led",
						cx: "25",
						cy: "5",
						r: "2.4",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisorHead, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
							"data-robot-part": "gauge",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									cx: "20",
									cy: "35.5",
									r: "4",
									fill: "#0b0d12"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: "M 17 34.5 A 4 4 0 0 1 23 34.5",
									fill: "none",
									stroke: color,
									strokeWidth: "1.2"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					})
				] });
				case "read": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 8 22 A 12 11 0 0 1 32 22 Z",
						fill: color,
						opacity: "0.9"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						"data-robot-part": "lens",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "20",
								cy: "19",
								r: "6",
								fill: "#0b0d12"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								className: "dsh-robot-eye",
								cx: "20",
								cy: "19",
								r: "3",
								fill: eyeColor(state)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "18.5",
								cy: "17.5",
								r: "1",
								fill: "#ffffff",
								opacity: "0.8"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					})
				] });
				case "write": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 20 12 L 17.5 6 L 22.5 6 Z",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "19.2",
						y: "11",
						width: "1.6",
						height: "3",
						fill: color
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisorHead, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						"data-robot-part": "pencil",
						transform: "rotate(24 33 32)",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							x: "31.6",
							y: "24",
							width: "2.8",
							height: "9",
							rx: "0.8",
							fill: "#f2c94c"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M 31.6 33 L 33 36 L 34.4 33 Z",
							fill: "#e0a23c"
						})]
					})
				] });
				case "search": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 13 6 A 8 8 0 0 1 27 6",
						fill: "none",
						stroke: color,
						strokeWidth: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: "dsh-robot-led",
						cx: "20",
						cy: "5",
						r: "2.6",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "8",
						y: "12",
						width: "24",
						height: "16",
						rx: "5",
						fill: color,
						opacity: "0.9"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "11",
						y: "16",
						width: "18",
						height: "8",
						rx: "3",
						fill: "#0b0d12"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: "dsh-robot-eye",
						cx: "16",
						cy: "20",
						r: "1.8",
						fill: eyeColor(state)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						"data-robot-part": "magnifier",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
							cx: "24.5",
							cy: "20",
							r: "3.4",
							fill: "none",
							stroke: eyeColor(state),
							strokeWidth: "1.6"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "27",
							y1: "22.5",
							x2: "28.6",
							y2: "24",
							stroke: eyeColor(state),
							strokeWidth: "1.6"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					})
				] });
				case "todo": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Antenna, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisorHead, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
							"data-robot-part": "checklist",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
									x: "13",
									y: "32",
									width: "14",
									height: "8",
									rx: "1.5",
									fill: "#0b0d12"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: "M 15 34.5 l 1.6 1.6 l 2.6 -3",
									fill: "none",
									stroke: "#2f9e6f",
									strokeWidth: "1.2"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
									x1: "21",
									y1: "34.5",
									x2: "25",
									y2: "34.5",
									stroke: eyeColor(state),
									strokeWidth: "1.1"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: "M 15 37.8 l 1.6 1.6 l 2.6 -3",
									fill: "none",
									stroke: eyeColor(state),
									strokeWidth: "1.2",
									opacity: "0.5"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					})
				] });
				case "fetch": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 14 8 A 7 7 0 0 1 26 8",
						fill: "none",
						stroke: color,
						strokeWidth: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: "20",
						y1: "9",
						x2: "20",
						y2: "13",
						stroke: color,
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: "dsh-robot-led",
						cx: "20",
						cy: "8",
						r: "2.2",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisorHead, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
							"data-robot-part": "globe",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									cx: "20",
									cy: "35.5",
									r: "4",
									fill: "#0b0d12"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ellipse", {
									cx: "20",
									cy: "35.5",
									rx: "4",
									ry: "1.6",
									fill: "none",
									stroke: eyeColor(state),
									strokeWidth: "0.9"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ellipse", {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					})
				] });
				case "agent": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Antenna, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisorHead, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						"data-robot-part": "headset",
						d: "M 6 20 A 14 14 0 0 1 34 20",
						fill: "none",
						stroke: color,
						strokeWidth: "2",
						opacity: "0.9"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "34",
						cy: "20",
						r: "2.6",
						fill: color,
						opacity: "0.9"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M 34 22 q -1 4 -5 5",
						fill: "none",
						stroke: color,
						strokeWidth: "1.4",
						opacity: "0.8"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					})
				] });
				case "root": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: "13",
						y1: "7",
						x2: "13",
						y2: "13",
						stroke: color,
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: "dsh-robot-led",
						cx: "13",
						cy: "6",
						r: "2.2",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: "20",
						y1: "5",
						x2: "20",
						y2: "13",
						stroke: color,
						strokeWidth: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: "dsh-robot-led",
						cx: "20",
						cy: "4",
						r: "2.8",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
						x1: "27",
						y1: "7",
						x2: "27",
						y2: "13",
						stroke: color,
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: "dsh-robot-led",
						cx: "27",
						cy: "6",
						r: "2.2",
						fill: ledColor(state, color)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisorHead, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							"data-robot-part": "collar",
							d: "M 15 30 L 20 36 L 25 30 Z",
							fill: "#0b0d12",
							opacity: "0.9"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
						color,
						state,
						species
					})
				] });
				default: return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Antenna, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisorHead, {
						color,
						state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Body, {
						color,
						species
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Arms, {
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
		const RobotAvatar = ({ size = 26, color, state, variant = "generic", species = "agent", statusAttr }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
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
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 40 44",
				width: "100%",
				height: "100%",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VariantBody, {
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-swarm-todos": true,
				style: { marginTop: 4 },
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							color: theme.muted,
							marginBottom: 2,
							display: "flex",
							alignItems: "center",
							gap: 6
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							"任务 ",
							done,
							"/",
							items.length
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"data-swarm-todo-bar": true,
							style: {
								flex: "1 1 auto",
								height: 3,
								borderRadius: 1.5,
								background: theme.border,
								overflow: "hidden",
								position: "relative"
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: {
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
					items.slice(0, limit).map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-swarm-todo-status": item.status,
						style: {
							display: "flex",
							gap: 4,
							color: item.status === "completed" ? theme.muted : theme.text
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								color: TODO_GLYPH[item.status].color,
								flex: "0 0 auto"
							},
							children: TODO_GLYPH[item.status].glyph
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: item.content
						})]
					}, item.content)),
					items.length > limit && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
		const Comet = ({ from, to, index, progress, attr, label, accent }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: [
			0,
			.05,
			.1
		].map((lag, lagIndex) => {
			const point = silkPoint(from, to, index, Math.max(0, progress - lag));
			const head = lagIndex === 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
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
			const [tick, setTick] = (0, react.useState)(() => Date.now());
			(0, react.useEffect)(() => {
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
			const [activeOnly, setActiveOnly] = (0, react.useState)(false);
			const [paletteId, setPaletteId] = (0, react.useState)(() => {
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
			const [customColor, setCustomColor] = (0, react.useState)(() => {
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
			const containerRef = (0, react.useRef)(null);
			const [scale, setScale] = (0, react.useState)(1);
			const [zoom, setZoom] = (0, react.useState)(1);
			const [pan, setPan] = (0, react.useState)({
				x: 0,
				y: 0
			});
			const dragRef = (0, react.useRef)(null);
			const palette = SWARM_PALETTES.find((candidate) => candidate.id === paletteId) ?? SWARM_PALETTES[0];
			const accent = customColor ?? paletteAccent(palette, now);
			(0, react.useEffect)(() => {
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: { fontWeight: 600 },
							children: "Agent 实况"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: { color: theme.muted },
							children: swarm.rootLabel
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							style: { color: theme.muted },
							children: [
								agents.filter((a) => a.status === "failed").length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 4
							},
							children: [
								SWARM_PALETTES.map((candidate) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								"data-swarm-web": true,
								width: VIEW.width,
								height: VIEW.height,
								style: {
									position: "absolute",
									inset: 0
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									transform: `translate(${VIEW.width / 2}, ${VIEW.height / 2})`,
									children: [
										[
											RING * .55,
											RING,
											TOOL_RING,
											410
										].map((radius) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
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
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
												"data-swarm-turn-arc": group.turn,
												d: `M ${start.x} ${start.y} A 366 366 0 0 1 ${end.x} ${end.y}`,
												fill: "none",
												stroke: accent,
												strokeWidth: 1,
												opacity: .35
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("text", {
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
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
													"data-swarm-edge": `${edge.from}->${edge.to}`,
													d: silk,
													fill: "none",
													stroke: progress === null ? theme.border : accent,
													strokeWidth: progress === null ? 1.2 : 1.8,
													opacity: progress === null ? .9 : 1,
													className: progress === null ? void 0 : "dsh-swarm-hot"
												}),
												progress !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Comet, {
													from,
													to,
													index: tools.length + edgeIndex,
													progress,
													attr: "data-swarm-pulse",
													label: `${edge.from}->${edge.to}`,
													accent
												}),
												sweep !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
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
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
												"data-swarm-assign-edge": owner.id,
												x1: 0,
												y1: 0,
												x2: to.x,
												y2: to.y,
												stroke: theme.warn,
												strokeWidth: 1.4,
												strokeDasharray: "2 5",
												opacity: .8
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
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
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
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
												progress !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Comet, {
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
												sweep !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
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
												settlePop !== null && tool.status === "ok" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
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
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: 6
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RobotAvatar, {
												size: 34,
												color: statusColor(agent.status, accent),
												state: AGENT_ROBOT[agent.status],
												variant: "agent",
												species: "agent",
												statusAttr: {
													name: "data-swarm-status",
													value: agent.status
												}
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												style: { minWidth: 0 },
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													style: {
														fontWeight: 600,
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap"
													},
													children: agent.label
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
										agent.snippet !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											"data-swarm-snippet": true,
											style: {
												color: theme.muted,
												marginTop: 2,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap"
											},
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													style: { color: agent.snippet.label === "工具" ? theme.accent : theme.muted },
													children: agent.snippet.label
												}),
												" ",
												agent.snippet.text
											]
										}),
										agent.conclusion !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
											return agentTodos === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TodoList, {
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
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RobotAvatar, {
											size: 18,
											color: failed ? "#e0554d" : visual.color,
											state: TOOL_ROBOT[tool.status],
											variant: visual.variant,
											species: "device"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											style: {
												overflow: "hidden",
												textOverflow: "ellipsis"
											},
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													style: { fontWeight: 600 },
													children: toolLabel(tool.name)
												}),
												group.count > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													"data-swarm-tool-count": true,
													children: [" ×", group.count]
												}),
												tool.preview !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													style: {
														color: theme.muted,
														marginLeft: 4
													},
													children: [" ", tool.preview]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
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
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											style: {
												flex: "0 0 auto",
												color: failed ? "#e0554d" : theme.muted
											},
											children: pending ? "…" : failed ? "✗" : "✓"
										}),
										failed && tool.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: 8
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RobotAvatar, {
											size: 38,
											color: theme.text,
											state: rootHot ? "working" : "idle",
											variant: "root"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: { minWidth: 0 },
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												style: {
													fontWeight: 700,
													fontSize: 13,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap"
												},
												children: swarm.rootLabel
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
									swarm.rootSnippet !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: { color: swarm.rootSnippet.label === "工具" ? theme.accent : theme.muted },
												children: swarm.rootSnippet.label
											}),
											" ",
											swarm.rootSnippet.text
										]
									}),
									swarm.rootConclusion !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
									rootTodos === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TodoList, {
										items: rootTodos,
										limit: 7
									}),
									teamTasks.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										"data-swarm-team-tasks": true,
										style: {
											marginTop: 6,
											borderTop: `1px solid ${theme.border}`,
											paddingTop: 4
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												color: theme.muted,
												marginBottom: 2,
												display: "flex",
												alignItems: "center",
												gap: 6
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
												"团队任务 ",
												teamTasks.filter((task) => task.status === "completed").length,
												"/",
												teamTasks.length
											] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												"data-swarm-team-bar": true,
												style: {
													flex: "1 1 auto",
													height: 3,
													borderRadius: 1.5,
													background: theme.border,
													overflow: "hidden",
													position: "relative"
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: {
													position: "absolute",
													left: 0,
													top: 0,
													bottom: 0,
													width: `${teamTasks.length === 0 ? 0 : teamTasks.filter((task) => task.status === "completed").length / teamTasks.length * 100}%`,
													background: "#2f9e6f",
													borderRadius: 1.5
												} })
											})]
										}), teamTasks.slice(0, 5).map((task) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											"data-swarm-team-task-status": task.status,
											style: {
												display: "flex",
												gap: 4,
												color: task.status === "completed" ? theme.muted : theme.text
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: {
													flex: "0 0 auto",
													color: task.status === "completed" ? "#2f9e6f" : task.status === "in_progress" ? theme.warn : theme.muted
												},
												children: task.status === "completed" ? "✓" : task.status === "in_progress" ? "◐" : "○"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
			const dragRef = (0, react.useRef)(null);
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
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
			const [query, setQuery] = (0, react.useState)("");
			const [tab, setTab] = (0, react.useState)("detail");
			const [detail, setDetail] = (0, react.useState)(null);
			const [comparison, setComparison] = (0, react.useState)(null);
			const [fork, setFork] = (0, react.useState)(null);
			const [forkBusy, setForkBusy] = (0, react.useState)(false);
			const [forkError, setForkError] = (0, react.useState)(void 0);
			const [carried, setCarried] = (0, react.useState)(false);
			const [swarm, setSwarm] = (0, react.useState)(null);
			const drag = (0, react.useRef)(null);
			const [, bump] = (0, react.useReducer)((tick) => tick + 1, 0);
			const selectedId = canvas?.selectedId;
			const compareKey = canvas?.compareIds.join("\0") ?? "";
			const liveDetail = selectedId === void 0 ? null : canvas?.liveDetail?.(selectedId) ?? null;
			const effectiveDetail = liveDetail ?? detail;
			const tail = selectedId === void 0 ? null : canvas?.tailOf?.(selectedId) ?? null;
			(0, react.useEffect)(() => canvas?.subscribe?.(() => {
				bump();
			}), [canvas]);
			const swarmRef = (0, react.useRef)(null);
			swarmRef.current = swarm;
			(0, react.useEffect)(() => swarm?.subscribe(() => {
				bump();
			}), [swarm]);
			(0, react.useEffect)(() => () => {
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
			const [pendingForkFor, setPendingForkFor] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
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
			(0, react.useEffect)(() => {
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
			(0, react.useEffect)(() => {
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
			const autoFitted = (0, react.useRef)(false);
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
			(0, react.useEffect)(() => {
				if (autoFitted.current || canvas === void 0) return;
				if (canvas.graph.nodes.size === 0) return;
				autoFitted.current = true;
				fitView();
			}, [
				canvas,
				canvas?.graph.nodes.size,
				fitView
			]);
			(0, react.useEffect)(() => {
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
			(0, react.useEffect)(() => {
				if (selectedId !== void 0) centerOn(selectedId);
			}, [selectedId]);
			const surfaceRef = (0, react.useRef)(null);
			const [stageSize, setStageSize] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
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
			const [menu, setMenu] = (0, react.useState)(null);
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
			(0, react.useEffect)(() => {
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
			(0, react.useEffect)(() => {
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
			if (canvas === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
			const [legendVisible, setLegendVisible] = (0, react.useState)(false);
			const runningCount = [...canvas.graph.nodes.values()].filter((node) => {
				const kind = canvas.statusOf(node.id).kind;
				return kind === "thinking" || kind === "tool";
			}).length;
			const matches = (needle) => needle === "" ? 0 : [...canvas.graph.nodes.values()].filter((node) => matchesNode(node, needle)).length;
			const selectedNode = selectedId === void 0 ? void 0 : canvas.graph.nodes.get(selectedId);
			const suppressClick = (0, react.useRef)(false);
			const dragStart = (0, react.useRef)(null);
			const [hoverId, setHoverId] = (0, react.useState)(void 0);
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: CANVAS_CSS }),
					swarm !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AgentSwarmView, {
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
					menu !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
						].map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
							needle !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								"data-canvas-match-count": true,
								style: {
									color: theme.muted,
									font: "11px system-ui, sans-serif"
								},
								children: [matches(needle), " 个匹配"]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								style: { color: theme.muted },
								children: [
									canvas.graph.nodes.size,
									" 个会话",
									runningCount > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"data-canvas-fit": true,
								onClick: fit,
								style: buttonStyle,
								children: "适配视图"
							}),
							canvas.refresh !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"data-canvas-refresh": true,
								onClick: () => canvas.refresh?.(),
								style: buttonStyle,
								children: "刷新"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							flex: "1 1 auto",
							minHeight: 0
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
								canvas.graph.nodes.size === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "当前工作区还没有会话" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											fontSize: 11,
											opacity: .7
										},
										children: "归档的会话不会出现在画布上"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									"data-canvas-plane": true,
									style: {
										position: "absolute",
										inset: 0,
										transform: `translate(${canvas.view.x}px, ${canvas.view.y}px) scale(${canvas.view.scale})`,
										transformOrigin: "0 0"
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
										"data-canvas-edges": true,
										width: Math.max(layout.width, 1),
										height: Math.max(layout.height, 1),
										style: {
											position: "absolute",
											left: 0,
											top: 0,
											pointerEvents: "none"
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("defs", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("filter", {
												id: "dsh-glow",
												x: "-40%",
												y: "-40%",
												width: "180%",
												height: "180%",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("feGaussianBlur", { stdDeviation: "3.5" })
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("marker", {
												id: "dsh-arrow",
												viewBox: "0 0 10 10",
												refX: "9",
												refY: "5",
												markerWidth: "5",
												markerHeight: "5",
												orient: "auto-start-reverse",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
													d: "M 0 0 L 10 5 L 0 10 z",
													fill: theme.border
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("marker", {
												id: "dsh-arrow-accent",
												viewBox: "0 0 10 10",
												refX: "9",
												refY: "5",
												markerWidth: "5",
												markerHeight: "5",
												orient: "auto-start-reverse",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
													d: "M 0 0 L 10 5 L 0 10 z",
													fill: theme.accent
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("marker", {
												id: "dsh-arrow-warn",
												viewBox: "0 0 10 10",
												refX: "9",
												refY: "5",
												markerWidth: "5",
												markerHeight: "5",
												orient: "auto-start-reverse",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
													d: "M 0 0 L 10 5 L 0 10 z",
													fill: theme.warn
												})
											})
										] }), edgePaths(displayCanvas, layout.positions, hoverId).map((edge) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: edge.d,
											fill: "none",
											stroke: edge.active ? theme.accent : edge.hover ? theme.text : edge.busy ? theme.warn : theme.border,
											strokeWidth: edge.active ? 1.8 : edge.hover ? 2 : edge.busy ? 1.6 : 1.5,
											opacity: edge.active ? 1 : edge.busy ? .8 : .7,
											className: edge.busy ? "dsh-edge-busy" : void 0,
											markerEnd: edge.active ? "url(#dsh-arrow-accent)" : edge.busy ? "url(#dsh-arrow-warn)" : "url(#dsh-arrow)"
										}), edge.busy && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
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
										return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NodeCard, {
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
								layout.width > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MiniMap, {
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
						}), selectedId !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(RightPanel, {
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
								tab === "detail" && selectedId !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									"data-panel-actions": true,
									style: {
										display: "flex",
										gap: 6,
										padding: "6px 10px",
										borderBottom: `1px solid ${theme.border}`
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
								tab === "detail" && (effectiveDetail?.turns.length ?? 0) > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
								tab === "detail" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BranchTimeline, {
									turns: effectiveDetail?.turns ?? [],
									inheritedCount: effectiveDetail?.inheritedCount ?? 0,
									cwdWarning: effectiveDetail?.cwdWarning ?? false,
									conclusion: effectiveDetail?.conclusion ?? null,
									live: tail,
									onFork: openFork
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ComparePanel, {
									result: comparison,
									onContinue: (side) => {
										const id = canvas.compareIds[side === "a" ? 0 : 1];
										if (id !== void 0) canvas.onSelect(id);
									},
									onCarry: (_side, draft) => {
										carry(draft);
									}
								}), carried && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									"data-carry-done": true,
									style: {
										color: theme.accent,
										padding: "0 10px 10px"
									},
									children: "已复制到剪贴板"
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ForkDialog, {
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
		//#region src/client/adapters/event-stream-adapter.ts
		/**
		* The retain label this plugin owns, so M0 gate 11 can attribute every retain
		* via `retainInfo().retainedBy.canvasNode`.
		*
		* DSH declares the label set as a declaration-merge-extensible map
		* (`SessionReferenceSourceMap` in `@deepseek-ai/dsh-api-session-controller/client`),
		* which every other plugin extends. `src/client/index.ts` extends it the same
		* way (`declare module` + the package as a devDependency), so this literal is
		* the typed key of the merge, not just a runtime string.
		*/
		const CANVAS_RETAIN_SOURCE = "canvasNode";
		/**
		* Retains one Session and keeps its event window open for live reading.
		*
		* Same lifecycle contract as `openTimeline`: release before rethrowing on
		* failure, and release idempotently. The default window page is the recent
		* tail, which is exactly what a live view needs; older pages are the
		* `openTimeline`/`loadOlder` path's job.
		*/
		async function openLiveWindow(sessions, sessionId) {
			const reference = sessions.retain(sessionId, { source: CANVAS_RETAIN_SOURCE });
			let binding;
			try {
				binding = await reference.ready;
			} catch (error) {
				reference.release();
				throw error;
			}
			const entries = () => {
				const snapshot = binding.eventSource.getSnapshot();
				if (snapshot === null || typeof snapshot !== "object") return [];
				const rows = snapshot.entries;
				return Array.isArray(rows) ? rows : [];
			};
			let released = false;
			return {
				sessionId,
				entries,
				subscribe: (listener) => binding.eventSource.subscribe(listener),
				release: () => {
					if (released) return;
					released = true;
					reference.release();
				}
			};
		}
		//#endregion
		//#region src/client/adapters/session-adapter.ts
		/**
		* Narrows the Session list snapshot into the flat summaries the graph model
		* consumes, without ever throwing: the shape is owned by DSH and may differ
		* between a host list RPC and the client store projection.
		*
		* Accepted forms, in order of preference:
		*   - the client store snapshot `{ ids, byId }` (`SessionListState`)
		*   - the manager snapshot `{ items }` (`SessionListSnapshot`)
		*   - a bare array of rows
		*
		* Membership is taken from `ids` when present. That field alone expresses
		* Host-list membership; `byId` additionally carries retained subagent fallback
		* rows, which must not surface as canvas nodes. For the same reason a row whose
		* declared id is not a string is skipped rather than guessed at from its key.
		*
		* Two fields the graph model wants have no client-side source and are mapped
		* deliberately rather than invented:
		*   - `createdAt` falls back to `updatedAt`. The client row carries no creation
		*     instant, so ordering is activity-based. See the ledger note: root order
		*     is therefore *not* immutable creation order.
		*   - `available` is always true. The list snapshot exposes no availability or
		*     failure signal; `agentAvailable` is deliberately NOT used, because it
		*     means "this Session currently owns a live Agent" and is false for every
		*     cold session — mapping it here would misreport idle sessions as failed.
		*
		* `seeded` is left unset: seeded-ness is an event-stream fact
		* (`inheritedEventCount` / `session/end-seed`), not a list fact.
		*/
		function toSummaries(listSnapshot) {
			const out = [];
			for (const [key, raw] of readRows(listSnapshot)) {
				const summary = toSummary(key, raw);
				if (summary !== void 0) out.push(summary);
			}
			return out;
		}
		/** Every `[key, row]` pair a snapshot form offers, skipping absent rows. */
		function readRows(listSnapshot) {
			if (Array.isArray(listSnapshot)) return listSnapshot.map((row) => [void 0, row]);
			if (!isRecord$1(listSnapshot)) return [];
			const { ids, byId, items } = listSnapshot;
			if (Array.isArray(ids)) return ids.map((id) => [typeof id === "string" ? id : void 0, isRecord$1(byId) ? byId[typeof id === "string" ? id : ""] : void 0]);
			if (Array.isArray(items)) return items.map((row) => [void 0, row]);
			return [];
		}
		function toSummary(key, raw) {
			if (!isRecord$1(raw)) return void 0;
			const declared = raw.id ?? raw.sessionId;
			if (declared !== void 0 && (typeof declared !== "string" || declared === "")) return void 0;
			const id = typeof declared === "string" ? declared : key;
			if (id === void 0) return void 0;
			return {
				id,
				parentId: text(raw.parentSessionId) ?? text(raw.parentId),
				title: text(raw.title) ?? text(raw.displayTitle) ?? id,
				cwd: text(raw.cwd),
				createdAt: finite(raw.createdAt) ?? finite(raw.updatedAt) ?? 0,
				running: raw.running === true,
				available: true
			};
		}
		function isRecord$1(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function text(value) {
			return typeof value === "string" && value !== "" ? value : void 0;
		}
		function finite(value) {
			return typeof value === "number" && Number.isFinite(value) ? value : void 0;
		}
		//#endregion
		//#region src/client/adapters/workspace-adapter.ts
		/**
		* The archived session ids the snapshot reports. Archived conversations belong
		* to the workspace's accounting but not to the canvas — the user put them
		* away, and a lineage map that keeps showing them is lying about the workspace.
		*/
		function toArchivedIds(snapshot) {
			const rows = typeof snapshot === "object" && snapshot !== null ? snapshot.archivedSessionIds : void 0;
			if (!Array.isArray(rows)) return /* @__PURE__ */ new Set();
			return new Set(rows.filter((id) => typeof id === "string"));
		}
		/**
		* Narrows a workspace snapshot into the rows this adapter reads.
		*
		* Accepts the client `WorkspaceSnapshot` (`{ items }`) or a bare array, and
		* drops rows without a usable `workspaceId` rather than inventing one.
		*/
		function toWorkspaceItems(snapshot) {
			const rows = Array.isArray(snapshot) ? snapshot : typeof snapshot === "object" && snapshot !== null && Array.isArray(snapshot.items) ? snapshot.items : [];
			const items = [];
			for (const row of rows) {
				if (typeof row !== "object" || row === null) continue;
				const candidate = row;
				if (typeof candidate.workspaceId !== "string" || candidate.workspaceId === "") continue;
				items.push({
					workspaceId: candidate.workspaceId,
					...typeof candidate.path === "string" ? { path: candidate.path } : {},
					...Array.isArray(candidate.sessionIds) ? { sessionIds: candidate.sessionIds.filter((id) => typeof id === "string") } : {}
				});
			}
			return items;
		}
		/**
		* Resolves which sessions belong on the canvas for the current workspace.
		*
		* Membership is the union of two sources, not one:
		*   - `sessionIds`, the workspace's accounted set, which also supplies the
		*     manual order the sidebar shows;
		*   - a `cwd` match against the workspace's canonical `path`.
		*
		* The union matters because `sessionIds` is an accounting list: a session just
		* created in this directory may not be accounted to the workspace yet, and the
		* canvas must never hide the session the user is sitting in. Since a workspace
		* is keyed by its canonical cwd, a cwd match cannot pull in a foreign workspace.
		*
		* The caller resolves which workspace is current — the client workspace
		* snapshot has no `recentWorkspaceId` field. When that resolution fails, or the
		* workspace rows are unavailable, the supplied `fallbackCwd` is used, and the
		* workspace id is recovered from a row whose `path` matches it.
		*
		* When membership is genuinely undecidable the result is empty rather than
		* unfiltered: cross-workspace canvases are out of scope, so an unknown
		* workspace must render an empty canvas, never a global one.
		*/
		function selectWorkspaceSummaries(workspaceItems, currentWorkspaceId, summaries, fallbackCwd, archived = /* @__PURE__ */ new Set()) {
			const items = workspaceItems ?? [];
			const current = currentWorkspaceId == null ? void 0 : items.find((item) => item.workspaceId === currentWorkspaceId);
			if (current !== void 0) {
				const members = [];
				const seen = /* @__PURE__ */ new Set();
				const byId = new Map(summaries.map((summary) => [summary.id, summary]));
				for (const id of current.sessionIds ?? []) {
					const summary = byId.get(id);
					if (summary === void 0 || seen.has(id) || archived.has(id)) continue;
					seen.add(id);
					members.push(summary);
				}
				const cwd = current.path ?? fallbackCwd;
				if (cwd !== null) for (const summary of summaries) {
					if (seen.has(summary.id) || summary.cwd !== cwd || archived.has(summary.id)) continue;
					seen.add(summary.id);
					members.push(summary);
				}
				return {
					workspaceId: current.workspaceId,
					members
				};
			}
			if (fallbackCwd === null) return {
				workspaceId: null,
				members: []
			};
			return {
				workspaceId: items.find((item) => item.path === fallbackCwd)?.workspaceId ?? null,
				members: summaries.filter((summary) => summary.cwd === fallbackCwd && !archived.has(summary.id))
			};
		}
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
		//#region src/client/adapters/runtime-status-adapter.ts
		/**
		* Reduces a session summary plus the latest live hint into a display status.
		*
		* Precedence is deliberate and total, so the caller never has to guess:
		*   1. disconnected  → `unknown`  (a stale `running:true` must not read as live)
		*   2. unavailable   → `failed`
		*   3. running       → the hint, else `thinking`
		*   4. stopped       → `idle`
		*
		* Two rules from the design spec drive the ordering. "Never infer idle from
		* silence" is why a running session without a hint degrades to `thinking`
		* (inferred, `badge().confirmed === false`) instead of `idle`. And because
		* `running:false` is a *confirmed* fact from the snapshot rather than an
		* absence of evidence, a lingering hint on a stopped session is treated as
		* stale and the result is `idle`.
		*
		* `done` and `queued` are intentionally unreachable here: turn completion and
		* queue depth are event-stream facts, so they are derived where those events
		* are read, never from a summary.
		*/
		function deriveStatus(input) {
			if (!input.connected) return "unknown";
			if (!input.available) return "failed";
			if (input.running) return input.lastHint ?? "thinking";
			return "idle";
		}
		//#endregion
		//#region src/client/compare/branch-segment.ts
		/**
		* Branch segment extraction: the branch's *own* work, with the fork plumbing
		* identified and separated.
		*
		* Verified against the local checkout at `639ed01539` (`core/session/src/types.ts`):
		*
		*   turn/start  { turn }                       turn/end  { turn, reason: { kind } }
		*   step/start  { turn, step }                 step/end  { turn, step }
		*   user/message       UserMessage   = { id, role:'user', content: ContentBlock[], source: { kind } }
		*   assistant/message  { turn, step, message: AssistantMessage, stream, usage?, interrupted? }
		*   tool/call          { turn, step, callId, name, arguments }
		*   tool/result        { turn, step, message: ToolResultMessage, error?, meta? }
		*   session/end-seed   { inherited?: true }
		*
		* There is **no `text-chunks` event type**; assistant text lives in
		* `assistant/message.data.message.content` as `{ type:'text', text }` blocks.
		* `turn/end.reason.kind` is the discriminator (`completed | aborted | blocked |
		* error | max-tokens | interrupted | forked`).
		*/
		/**
		* The inherited prefix length of a fork child, read from its own event log.
		*
		* A fork child owns exactly one `session/end-seed { inherited: true }` marker
		* **at** its cut (`core/session/src/fork.ts`, `core/session/src/types.ts`), and
		* DSH's `inheritedEventCount` is `boundary + 1` for that same inclusive
		* boundary. Reading the marker keeps the number consistent with the log instead
		* of depending on a field the client surface does not expose. A session that was
		* never forked has no marker and therefore inherits nothing.
		*/
		function inheritedPrefixLength(events) {
			let length = 0;
			for (const event of events) {
				if (event.type !== "session/end-seed") continue;
				if (!isRecord(event.data) || event.data.inherited !== true) continue;
				if (!Number.isFinite(event.seq)) continue;
				length = event.seq + 1;
			}
			return length;
		}
		/** Matches DSH's own `boundContextSummary`: a bounded one-line account. */
		const ASSISTANT_SUMMARY_MAX_CHARS = 200;
		/**
		* Extracts the turns a branch owns from its event window.
		*
		* `inheritedCount` is the fork's `inheritedEventCount`, which DSH computes as
		* `SessionLogOffset(boundary + 1)` for the inclusive cut `atSeq = boundary`
		* (`api/session-controller/src/commands.ts:273`). The inherited prefix is
		* therefore `seq < inheritedCount` and the branch's own work starts at exactly
		* `inheritedCount` — a boundary, not "after" it.
		*
		* That means the fork's synthetic balancing closers land **inside** this
		* segment: a cut inside an open turn leaves the child a `turn/end` with
		* `reason.kind === 'forked'` and no `turn/start` of its own, plus the
		* `session/end-seed` marker. Those turns are reported with `synthetic: true` so
		* the comparison can exclude them — they are identical in every branch by
		* construction, and counting them would put the same noise row in every diff.
		*/
		function segmentFromEvents(sessionId, inheritedCount, events) {
			const ordered = events.filter((event) => Number.isFinite(event.seq) && event.seq >= inheritedCount).slice().sort((left, right) => left.seq - right.seq);
			const turns = [];
			let draft;
			const ensure = () => {
				draft ??= {
					userTexts: [],
					assistantTexts: [],
					tools: [],
					callIndex: /* @__PURE__ */ new Map(),
					synthetic: false
				};
				return draft;
			};
			const flush = () => {
				if (draft === void 0) return;
				turns.push(toTurn(draft, turns.length));
				draft = void 0;
			};
			for (const event of ordered) {
				const data = isRecord(event.data) ? event.data : void 0;
				if (event.type === "turn/start") {
					flush();
					touch(ensure(), event.seq);
					continue;
				}
				const current = ensure();
				touch(current, event.seq);
				switch (event.type) {
					case "turn/end": {
						const kind = kindOf(data?.reason);
						if (kind !== void 0) current.endedAs = kind;
						if (kind === "forked") current.synthetic = true;
						flush();
						break;
					}
					case "session/end-seed":
						current.synthetic = true;
						break;
					case "user/message":
						if (kindOf(data?.source) === "user") {
							const text = textOf(data);
							if (text !== void 0 && text !== "") current.userTexts.push(text);
						}
						break;
					case "assistant/message": {
						const text = textOf(data?.message);
						if (text !== void 0 && text !== "") current.assistantTexts.push(text);
						break;
					}
					case "tool/call": {
						const name = typeof data?.name === "string" ? data.name : void 0;
						if (name === void 0) break;
						current.callIndex.set(typeof data?.callId === "string" ? data.callId : "", current.tools.length);
						const collapsed = (typeof data?.arguments === "string" ? data.arguments : "").replace(/\s+/g, " ").trim();
						const preview = collapsed !== "" && collapsed !== "{}" && collapsed !== "[]" ? collapsed.length > 40 ? `${collapsed.slice(0, 40)}…` : collapsed : void 0;
						current.tools.push({
							name,
							status: "pending",
							...preview === void 0 ? {} : { preview }
						});
						break;
					}
					case "tool/result": {
						const callId = isRecord(data?.message) ? data.message.toolCallId : void 0;
						const at = typeof callId === "string" ? current.callIndex.get(callId) : void 0;
						if (at === void 0) break;
						const failed = data?.error !== void 0 || isRecord(data?.message) && data.message.isError === true;
						const existing = current.tools[at];
						if (existing !== void 0) current.tools[at] = {
							name: existing.name,
							status: failed ? "error" : "ok",
							...existing.preview === void 0 ? {} : { preview: existing.preview }
						};
						break;
					}
				}
			}
			flush();
			return {
				sessionId,
				inheritedCount,
				turns
			};
		}
		function touch(draft, seq) {
			if (draft.firstSeq === void 0) draft.firstSeq = seq;
			draft.lastSeq = seq;
		}
		function toTurn(draft, index) {
			const userMessage = draft.userTexts.join("\n");
			const assistantSummary = bound(draft.assistantTexts.join(""));
			return {
				index,
				firstSeq: draft.firstSeq ?? 0,
				lastSeq: draft.lastSeq ?? 0,
				...userMessage === "" ? {} : { userMessage },
				...assistantSummary === void 0 ? {} : { assistantSummary },
				tools: draft.tools,
				...draft.endedAs === void 0 ? {} : { endedAs: draft.endedAs },
				synthetic: draft.synthetic
			};
		}
		/** Joins the `{ type:'text' }` blocks of one message, ignoring reasoning and images. */
		function textOf(message) {
			if (!isRecord(message) || !Array.isArray(message.content)) return void 0;
			let text = "";
			for (const block of message.content) if (isRecord(block) && block.type === "text" && typeof block.text === "string") text += block.text;
			return text;
		}
		function kindOf(value) {
			return isRecord(value) && typeof value.kind === "string" ? value.kind : void 0;
		}
		function bound(text) {
			if (text === "") return void 0;
			return text.length <= ASSISTANT_SUMMARY_MAX_CHARS ? text : `${text.slice(0, 199)}…`;
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* The session's latest conclusion: the last durable `assistant/message`'s text
		* blocks, concatenated, tail-anchored to `bound` characters — when a conclusion
		* is long, its end is the part that concludes. Null when the session has said
		* nothing yet.
		*/
		function conclusionFromEvents(events, bound = 600) {
			let conclusion = null;
			for (const event of events) {
				if (event.type !== "assistant/message") continue;
				const data = isRecord(event.data) ? event.data : void 0;
				const message = isRecord(data?.["message"]) ? data["message"] : void 0;
				const content = Array.isArray(message?.["content"]) ? message["content"] : void 0;
				if (content === void 0) continue;
				const text = content.filter((block) => isRecord(block) && block["type"] === "text").map((block) => typeof block["text"] === "string" ? block["text"] : "").join("").trim();
				if (text !== "") conclusion = text;
			}
			if (conclusion === null || conclusion.length <= bound) return conclusion;
			return `…${conclusion.slice(-(bound - 1))}`;
		}
		//#endregion
		//#region src/client/compare/diff.ts
		/**
		* Deterministic branch comparison.
		*
		* Alignment is **positional over each branch's own work**: turn 1 against turn 1,
		* and so on. There is deliberately no semantic pairing — positional alignment is
		* the only rule that produces the same answer twice, and the design spec rejects
		* semantic matching for v1. Each side's inherited prefix length is reported by
		* its segment rather than normalized away, because two branches may inherit
		* different amounts.
		*
		* Synthetic fork-closer turns are dropped before alignment. They exist only to
		* balance a cut made inside an open turn, are identical in every branch by
		* construction, and would otherwise add the same noise row to every comparison.
		* They remain visible in the segment itself, so the timeline can still show them.
		*/
		function compareBranches(a, b) {
			const left = ownWork(a);
			const right = ownWork(b);
			const rows = Math.max(left.length, right.length);
			const turnDiffs = [];
			for (let index = 0; index < rows; index += 1) {
				const leftTurn = left[index];
				const rightTurn = right[index];
				turnDiffs.push({
					...leftTurn === void 0 ? {} : { left: leftTurn },
					...rightTurn === void 0 ? {} : { right: rightTurn },
					equal: leftTurn !== void 0 && rightTurn !== void 0 && sameTurn(leftTurn, rightTurn)
				});
			}
			return {
				a,
				b,
				turnDiffs,
				toolCountDiff: countTools(right) - countTools(left),
				bothFailed: endedInError(left) && endedInError(right),
				lastConclusion: conclude(left, right)
			};
		}
		function ownWork(segment) {
			return segment.turns.filter((turn) => !turn.synthetic);
		}
		/** Equal means the same prompt and the same tool-call sequence; outcomes may differ. */
		function sameTurn(left, right) {
			return left.userMessage === right.userMessage && toolNames(left) === toolNames(right);
		}
		function toolNames(turn) {
			return turn.tools.map((tool) => tool.name).join("\0");
		}
		function countTools(turns) {
			return turns.reduce((total, turn) => total + turn.tools.length, 0);
		}
		/** Only an explicit `error` reason counts as failed; `aborted` is not a failure. */
		function endedInError(turns) {
			return turns.at(-1)?.endedAs === "error";
		}
		function conclude(left, right) {
			const leftText = lastSummary(left);
			const rightText = lastSummary(right);
			if (leftText === void 0 && rightText === void 0) return {
				side: "none",
				text: ""
			};
			if (leftText === void 0) return {
				side: "b",
				text: rightText ?? ""
			};
			if (rightText === void 0) return {
				side: "a",
				text: leftText
			};
			if (leftText === rightText) return {
				side: "both",
				text: leftText
			};
			return leftText.length >= rightText.length ? {
				side: "a",
				text: leftText
			} : {
				side: "b",
				text: rightText
			};
		}
		function lastSummary(turns) {
			return turns.at(-1)?.assistantSummary;
		}
		//#endregion
		//#region src/client/controllers/agent-swarm-controller.ts
		const shortId = (id) => id.length > 10 ? id.slice(-6) : id;
		/**
		* Live swarm over one session: the agent web for the 「实况」 view.
		*
		* Enumeration rides the parent's own event window (`subagent/catalog` durable
		* events), so a freshly spawned agent arrives as an ordinary window change.
		* Each agent gets the same live window the canvas uses, which is what feeds
		* both its snippet and its edge's heat.
		*/
		function createAgentSwarmController(deps, rootId) {
			const listeners = /* @__PURE__ */ new Set();
			const windows = /* @__PURE__ */ new Map();
			const tails = /* @__PURE__ */ new Map();
			const toolCounts = /* @__PURE__ */ new Map();
			const conclusions = /* @__PURE__ */ new Map();
			const todos = /* @__PURE__ */ new Map();
			const heat = /* @__PURE__ */ new Map();
			const failed = /* @__PURE__ */ new Set();
			/** Catalog facts merged across refreshes; a window that went away must not retract an agent. */
			const knownWindows = /* @__PURE__ */ new Map();
			let nodes = [];
			let layout = layoutSwarm([], rootId);
			let edges = [];
			let activity = activityFromEntries([]);
			let toolLayout = layoutActivity([]);
			let team = null;
			let disposed = false;
			const notify = () => {
				for (const listener of [...listeners]) listener();
			};
			const openWindow = (id) => {
				if (windows.has(id) || failed.has(id) || disposed) return;
				deps.liveWindow(id).then((source) => {
					if (disposed) {
						source.release();
						return;
					}
					const off = source.subscribe(() => {
						onWindowChange(id, source);
					});
					windows.set(id, {
						source,
						off
					});
					onWindowChange(id, source);
				}).catch(() => {
					failed.add(id);
					rebuild();
				});
			};
			/**
			* The root's own work, derived from its durable events minus the inherited
			* prefix (a fork's seed would otherwise count its parent's turns). A pending
			* tool stays hot while it runs; a tool that just completed gets one heat
			* stamp so its pulse crawls home and fades.
			*/
			let rootConclusion = null;
			const updateActivity = (source) => {
				const durable = source.entries().filter((entry) => entry.type === "event");
				const flat = durable.map((entry) => ({
					seq: Number(entry.event.seq),
					type: entry.event.type,
					data: entry.event.data
				}));
				const inherited = inheritedPrefixLength(flat);
				const ownFlat = flat.filter((event) => event.seq >= inherited);
				const next = activityFromEntries(durable.filter((entry) => Number(entry.event.seq) >= inherited));
				rootConclusion = conclusionFromEvents(ownFlat);
				const now = Date.now();
				if (next.pendingToolId !== null) heat.set(`tool:${next.pendingToolId}`, now);
				const previousPending = activity.pendingToolId;
				if (previousPending !== null && previousPending !== next.pendingToolId) {
					const settled = next.tools.find((tool) => tool.id === previousPending);
					if (settled !== void 0 && settled.status !== "pending") heat.set(`tool:${previousPending}`, now);
				}
				activity = next;
				toolLayout = layoutActivity(next.tools);
			};
			const onWindowChange = (id, source) => {
				knownWindows.set(id, source.entries());
				const tail = liveTailFromEntries(source.entries());
				tails.set(id, tail);
				toolCounts.set(id, activityFromEntries(source.entries()).tools.length);
				{
					const flat = source.entries().filter((entry) => entry.type === "event").map((entry) => ({
						seq: Number(entry.event.seq),
						type: entry.event.type,
						data: entry.event.data
					}));
					const inherited = inheritedPrefixLength(flat);
					conclusions.set(id, conclusionFromEvents(flat.filter((event) => event.seq >= inherited)));
				}
				const nodeTodos = todosFromEntries(source.entries());
				if (nodeTodos === null) todos.delete(id);
				else todos.set(id, nodeTodos);
				if (tail !== null) heat.set(id, Date.now());
				if (id === rootId) updateActivity(source);
				rebuild();
			};
			const rebuild = () => {
				team = deps.teamOf?.(rootId) ?? null;
				nodes = agentsFromWindows([...knownWindows].map(([sessionId, entries]) => ({
					sessionId,
					entries
				})), rootId);
				const memberNodes = (team?.members ?? []).filter((member) => member.id !== rootId && !nodes.some((node) => node.id === member.id)).map((member) => ({
					id: member.id,
					parentId: rootId,
					depth: 1,
					label: member.name,
					mode: "continuable"
				}));
				nodes = [...nodes, ...memberNodes];
				layout = layoutSwarm(nodes, rootId);
				edges = swarmEdges(nodes, rootId);
				const memberIds = new Set((team?.members ?? []).map((member) => member.id));
				for (const node of nodes) if (!memberIds.has(node.id)) openWindow(node.id);
				for (const member of team?.members ?? []) {
					if (member.id === rootId) continue;
					if (deps.isArchived?.(member.id) ?? false) continue;
					openWindow(member.id);
				}
				for (const id of [...windows.keys()]) if (id !== rootId && !nodes.some((node) => node.id === id)) closeWindow(id);
				notify();
			};
			const closeWindow = (id) => {
				const held = windows.get(id);
				if (held === void 0) return;
				windows.delete(id);
				tails.delete(id);
				held.off();
				held.source.release();
			};
			const state = () => {
				const rows = new Map(deps.listSummaries().map((row) => [row.id, row]));
				const nodeById = new Map(nodes.map((node) => [node.id, node]));
				const memberById = new Map((team?.members ?? []).map((member) => [member.id, member]));
				const labelOf = (id) => id === rootId ? rows.get(id)?.title ?? memberById.get(id)?.name ?? "本会话" : memberById.get(id)?.name ?? nodeById.get(id)?.label ?? rows.get(id)?.title ?? `agent ${shortId(id)}`;
				const seen = /* @__PURE__ */ new Set();
				const statusRank = {
					streaming: 0,
					running: 1,
					failed: 2,
					idle: 3
				};
				const agents = [];
				for (const id of [...windows.keys(), ...failed]) {
					if (id === rootId || seen.has(id)) continue;
					seen.add(id);
					const tail = tails.get(id) ?? null;
					const member = memberById.get(id);
					const status = tail !== null ? "streaming" : member?.phase === "failed" ? "failed" : rows.get(id)?.running === true || member?.phase === "running" ? "running" : "idle";
					agents.push({
						id,
						label: labelOf(id),
						depth: nodeById.get(id)?.depth ?? 1,
						status,
						snippet: tail === null ? null : tailSnippet(tail, 46),
						tail,
						toolCount: toolCounts.get(id) ?? 0,
						conclusion: conclusions.get(id) ?? null,
						description: nodeById.get(id)?.description,
						...member === void 0 ? {} : { role: member.role }
					});
				}
				for (const member of team?.members ?? []) {
					if (member.id === rootId || seen.has(member.id)) continue;
					seen.add(member.id);
					const archived = deps.isArchived?.(member.id) ?? false;
					agents.push({
						id: member.id,
						label: member.name,
						depth: 1,
						status: archived ? "idle" : member.phase === "failed" ? "failed" : member.phase === "running" ? "running" : "idle",
						snippet: null,
						tail: null,
						toolCount: 0,
						conclusion: null,
						description: nodeById.get(member.id)?.description,
						role: member.role
					});
				}
				agents.sort((a, b) => statusRank[a.status] - statusRank[b.status]);
				return {
					rootId,
					rootLabel: labelOf(rootId),
					rootSnippet: (() => {
						const tail = tails.get(rootId) ?? null;
						return tail === null ? null : tailSnippet(tail, 46);
					})(),
					agents,
					edges,
					layout,
					activity,
					toolLayout,
					todos: new Map(todos),
					team,
					rootConclusion,
					heat: new Map(heat)
				};
			};
			openWindow(rootId);
			rebuild();
			return {
				state,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				dispose: () => {
					disposed = true;
					for (const id of [...windows.keys()]) closeWindow(id);
					tails.clear();
					todos.clear();
					conclusions.clear();
					toolCounts.clear();
					heat.clear();
				}
			};
		}
		//#endregion
		//#region src/client/controllers/fork-controller.ts
		/**
		* Runs one branch launch: validate → fork once → optionally prompt with a single
		* retry.
		*
		* **Safety property:** `deps.fork` is called at most once on every path. Every
		* uncertain outcome resolves to `unverified` rather than a second fork, because
		* a duplicate child session is not recoverable by the user, while an
		* `unverified` node is visible and inspectable.
		*
		* Recovery does not depend on recognising the error text. A rejection with no
		* child observed always attempts a scan, so a lost receipt is recovered however
		* it was worded; the transport-vs-business heuristic only chooses between the
		* `unverified` and `failed` labels. A misclassification can therefore never
		* produce a duplicate fork — only a different label on an already-safe outcome.
		*/
		async function runForkTransaction(deps, req) {
			const instruction = req.instruction?.trim() ?? "";
			if (!Number.isInteger(req.atSeq) || req.atSeq < 0) return {
				childId: "",
				phase: "failed",
				error: `atSeq must be a non-negative integer, received ${String(req.atSeq)}`,
				retriedPrompt: false
			};
			if (req.launch === "now" && instruction === "") return {
				childId: "",
				phase: "failed",
				error: "launch \"now\" requires a non-blank instruction",
				retriedPrompt: false
			};
			const requestId = req.requestId ?? deps.newRequestId();
			const knownChildren = await childrenOf(deps, req.sessionId) ?? [];
			let observed;
			let resolved;
			let forkError;
			try {
				resolved = await deps.fork({
					sessionId: req.sessionId,
					atSeq: req.atSeq,
					increaseTitle: true,
					onCreated: (childId) => {
						observed = childId;
					}
				});
			} catch (error) {
				forkError = error;
			}
			let childId = resolved ?? observed;
			if (childId === void 0) {
				const after = await childrenOf(deps, req.sessionId);
				const fresh = after === void 0 ? void 0 : after.filter((id) => !knownChildren.includes(id));
				if (fresh !== void 0 && fresh.length === 1 && fresh[0] !== void 0) childId = fresh[0];
				else return {
					childId: "",
					phase: fresh === void 0 || fresh.length > 1 || looksLikeLostReceipt(forkError) ? "unverified" : "failed",
					...forkError === void 0 ? {} : { error: describe(forkError) },
					retriedPrompt: false
				};
			}
			if (req.launch === "later") return {
				childId,
				phase: "done",
				retriedPrompt: false
			};
			if ((await sendOnce(deps, childId, instruction, requestId)).ok) return {
				childId,
				phase: "done",
				retriedPrompt: false
			};
			const second = await sendOnce(deps, childId, instruction, requestId);
			if (second.ok) return {
				childId,
				phase: "done",
				retriedPrompt: true
			};
			return {
				childId,
				phase: "failed",
				error: second.error,
				retriedPrompt: true
			};
		}
		/** A list read that fails must not turn into a guess; `undefined` means "unknown". */
		async function childrenOf(deps, parentId) {
			try {
				return await deps.childrenOf(parentId);
			} catch {
				return;
			}
		}
		async function sendOnce(deps, childId, text, requestId) {
			try {
				return await deps.using(childId, (send) => send(text, requestId));
			} catch (error) {
				return {
					ok: false,
					error: describe(error)
				};
			}
		}
		/** Whether an error reads as a transport failure whose receipt may have been lost. */
		function looksLikeLostReceipt(error) {
			if (error === void 0) return false;
			return /ECONN|abort|timeout|timed out|network|socket|fetch|offline|reset/i.test(describe(error));
		}
		function describe(error) {
			if (error instanceof Error) return error.message;
			if (typeof error === "string") return error;
			return String(error);
		}
		//#endregion
		//#region src/client/ui/canvas-model.ts
		const IDENTITY_VIEW = {
			x: 0,
			y: 0,
			scale: 1
		};
		//#endregion
		//#region src/client/controllers/graph-controller.ts
		const EMPTY_GRAPH = {
			nodes: /* @__PURE__ */ new Map(),
			roots: [],
			maxDepth: 0
		};
		const UNKNOWN = badge("unknown");
		function createGraphController(deps) {
			let graph = EMPTY_GRAPH;
			let statuses = /* @__PURE__ */ new Map();
			let selectedId;
			let compareIds = [];
			const collapsedNodes = /* @__PURE__ */ new Set();
			let view = IDENTITY_VIEW;
			const listeners = /* @__PURE__ */ new Set();
			/**
			* Live windows, one per running node. Bounded by the number of sessions that
			* are actually running (normally 0–2), and every one of them is released the
			* moment its session stops running or the controller is disposed.
			*/
			const liveWindows = /* @__PURE__ */ new Map();
			const liveTails = /* @__PURE__ */ new Map();
			const liveDetails = /* @__PURE__ */ new Map();
			const pendingWindows = /* @__PURE__ */ new Set();
			const liveWindow = deps.liveWindow;
			const notify = () => {
				for (const listener of [...listeners]) listener();
			};
			/**
			* One node's badge. A live tail is the best hint there is: a streaming tool
			* call reads as 工具执行, streaming text or reasoning as 思考中 — the running
			* status stops being a guess while the canvas can see the stream.
			*/
			const statusFor = (node, tail) => {
				const hint = tail == null ? deps.hintOf?.(node.id) : tail.phase === "tool" ? "tool" : "thinking";
				return badge(deriveStatus({
					connected: deps.isConnected(),
					available: node.available,
					running: node.running,
					...hint === void 0 ? {} : { lastHint: hint }
				}));
			};
			/** One node's own turns, derived from its open window, for the detail panel. */
			const deriveLiveDetail = (id) => {
				const held = liveWindows.get(id);
				if (held === void 0) return null;
				const events = [];
				for (const entry of held.source.entries()) {
					if (entry.type !== "event") continue;
					events.push({
						seq: Number(entry.event.seq),
						type: entry.event.type,
						data: entry.event.data
					});
				}
				const inheritedCount = inheritedPrefixLength(events);
				return {
					sessionId: id,
					turns: segmentFromEvents(id, inheritedCount, events).turns,
					inheritedCount,
					cwdWarning: parallelWriteIds(graph).has(id),
					conclusion: conclusionFromEvents(events)
				};
			};
			const refreshNode = (id) => {
				const node = graph.nodes.get(id);
				if (node === void 0) return;
				statuses.set(id, statusFor(node, liveTails.get(id)));
			};
			const handleWindowChange = (id, source) => {
				const held = liveWindows.get(id);
				if (held === void 0 || held.source !== source) return;
				liveTails.set(id, liveTailFromEntries(source.entries()));
				const detail = deriveLiveDetail(id);
				if (detail === null) liveDetails.delete(id);
				else liveDetails.set(id, detail);
				refreshNode(id);
				notify();
			};
			const closeLiveWindow = (id) => {
				const held = liveWindows.get(id);
				if (held === void 0) return;
				liveWindows.delete(id);
				liveTails.delete(id);
				liveDetails.delete(id);
				held.off();
				held.source.release();
			};
			/** Opens windows for new running nodes and closes them for nodes that stopped. */
			const syncLiveWindows = () => {
				const open = deps.liveWindow;
				if (open === void 0) return;
				const running = /* @__PURE__ */ new Set();
				for (const node of graph.nodes.values()) if (node.running) running.add(node.id);
				for (const id of [...liveWindows.keys()]) if (!running.has(id)) closeLiveWindow(id);
				for (const id of running) {
					if (liveWindows.has(id) || pendingWindows.has(id)) continue;
					pendingWindows.add(id);
					open(id).then((source) => {
						pendingWindows.delete(id);
						if (graph.nodes.get(id)?.running !== true || liveWindows.has(id)) {
							source.release();
							return;
						}
						const off = source.subscribe(() => {
							handleWindowChange(id, source);
						});
						liveWindows.set(id, {
							source,
							off
						});
						liveTails.set(id, liveTailFromEntries(source.entries()));
						const detail = deriveLiveDetail(id);
						if (detail !== null) liveDetails.set(id, detail);
						refreshNode(id);
						notify();
					}).catch(() => {
						pendingWindows.delete(id);
					});
				}
			};
			const refresh = () => {
				const summaries = toSummaries(deps.listSnapshot());
				const { workspaceId, cwd } = deps.scope();
				const selection = selectWorkspaceSummaries(toWorkspaceItems(deps.workspaceSnapshot()), workspaceId, summaries, cwd, toArchivedIds(deps.workspaceSnapshot()));
				graph = buildLineageGraph(selection.members, new Set(selection.members.map((summary) => summary.id)));
				const memberRows = teamMembersFromList(deps.listSnapshot());
				const ownerTasks = teamTasksByOwner(deps.listSnapshot());
				if (memberRows.size > 0 || ownerTasks.size > 0) graph = {
					...graph,
					nodes: new Map([...graph.nodes].map(([id, node]) => {
						const member = memberRows.get(id);
						const tasks = ownerTasks.get(id);
						if (member === void 0 && tasks === void 0) return [id, node];
						return [id, {
							...node,
							...member === void 0 ? {} : {
								title: member.name,
								teamRole: member.role
							},
							...tasks === void 0 ? {} : { teamTasks: tasks }
						}];
					}))
				};
				statuses = /* @__PURE__ */ new Map();
				for (const node of graph.nodes.values()) statuses.set(node.id, statusFor(node, liveTails.get(node.id)));
				syncLiveWindows();
				if (selectedId !== void 0 && !graph.nodes.has(selectedId)) selectedId = void 0;
				compareIds = compareIds.filter((id) => graph.nodes.has(id));
				notify();
			};
			const select = (id) => {
				if (selectedId === id) return;
				selectedId = id;
				notify();
			};
			const toggleCompare = (id) => {
				if (compareIds.includes(id)) compareIds = compareIds.filter((candidate) => candidate !== id);
				else if (compareIds.length < 2) compareIds = [...compareIds, id];
				else compareIds = [compareIds[1], id];
				notify();
			};
			const matches = (text) => {
				const needle = text.trim().toLowerCase();
				if (needle === "") return [];
				return [...graph.nodes.values()].filter((node) => node.title.toLowerCase().includes(needle) || node.id.toLowerCase().includes(needle)).map((node) => node.id);
			};
			const search = (text) => {
				const hit = matches(text)[0];
				if (hit !== void 0 && hit !== selectedId) {
					selectedId = hit;
					notify();
				}
			};
			const searchNext = (text) => {
				const ids = matches(text);
				if (ids.length === 0) return;
				const next = ids[(ids.indexOf(selectedId) + 1) % ids.length];
				if (next !== selectedId) {
					selectedId = next;
					notify();
				}
			};
			const openInChat = (id) => {
				deps.openSession(id);
			};
			const forkFromRow = async (sessionId, atSeq, instruction, launch) => {
				const result = await runForkTransaction(deps.forkDeps, {
					sessionId,
					atSeq,
					instruction,
					launch
				});
				refresh();
				return result;
			};
			const compare = async () => {
				if (compareIds.length !== 2) return null;
				const [leftId, rightId] = compareIds;
				try {
					const [leftEvents, rightEvents] = await Promise.all([deps.readEvents(leftId), deps.readEvents(rightId)]);
					return compareBranches(segmentFromEvents(leftId, inheritedPrefixLength(leftEvents), leftEvents), segmentFromEvents(rightId, inheritedPrefixLength(rightEvents), rightEvents));
				} catch {
					return null;
				}
			};
			/**
			* One node's own turns for the detail panel.
			*
			* The read is one-shot — `readEvents` retains, reads, and releases — so
			* selecting a different node has nothing to clean up and a forgotten release
			* cannot pin a Session open. v1 therefore shows a snapshot of the branch, not a
			* live-updating one.
			*/
			const detail = async (id) => {
				try {
					const events = await deps.readEvents(id);
					const inheritedCount = inheritedPrefixLength(events);
					return {
						sessionId: id,
						turns: segmentFromEvents(id, inheritedCount, events).turns,
						inheritedCount,
						cwdWarning: parallelWriteIds(graph).has(id),
						conclusion: conclusionFromEvents(events)
					};
				} catch {
					return null;
				}
			};
			const model = () => ({
				get graph() {
					return graph;
				},
				statusOf: (id) => statuses.get(id) ?? UNKNOWN,
				get selectedId() {
					return selectedId;
				},
				get compareIds() {
					return compareIds;
				},
				get view() {
					return view;
				},
				onSelect: select,
				onToggleCompare: toggleCompare,
				onViewChange: (next) => {
					view = next;
					notify();
				},
				search,
				get collapsedNodes() {
					return collapsedNodes;
				},
				toggleSubtree: (id) => {
					if (collapsedNodes.has(id)) collapsedNodes.delete(id);
					else collapsedNodes.add(id);
					notify();
				},
				searchNext,
				refresh,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				detail,
				liveDetail: (id) => liveDetails.get(id) ?? null,
				tailOf: (id) => liveTails.get(id) ?? null,
				comparison: compare,
				inspectSwarm: liveWindow === void 0 ? void 0 : (id) => createAgentSwarmController({
					liveWindow,
					listSummaries: () => toSummaries(deps.listSnapshot()).map((summary) => ({
						id: summary.id,
						...summary.title === void 0 ? {} : { title: summary.title },
						running: summary.running
					})),
					isArchived: (id) => toArchivedIds(deps.workspaceSnapshot()).has(id),
					teamOf: (sessionId) => {
						const snapshot = deps.listSnapshot();
						if (snapshot === null || typeof snapshot !== "object") return null;
						const projections = snapshot.projectionsBySession;
						if (projections === null || typeof projections !== "object") return null;
						const entry = projections[sessionId];
						if (entry === null || typeof entry !== "object") return null;
						const values = entry.values;
						if (values === null || typeof values !== "object") return null;
						const team = values["agentTeam"];
						if (team === null || typeof team !== "object") return null;
						const record = team;
						if (!Array.isArray(record.members)) return null;
						return {
							members: record.members.flatMap((member) => {
								if (member === null || typeof member !== "object") return [];
								const row = member;
								if (typeof row["id"] !== "string" || typeof row["name"] !== "string") return [];
								const role = row["role"] === "lead" ? "lead" : "teammate";
								return [{
									id: row["id"],
									name: row["name"],
									role,
									phase: typeof row["phase"] === "string" ? row["phase"] : "inactive"
								}];
							}),
							tasks: Array.isArray(record.tasks) ? record.tasks.flatMap((task) => {
								if (task === null || typeof task !== "object") return [];
								const row = task;
								if (typeof row["id"] !== "string" || typeof row["subject"] !== "string") return [];
								return [{
									id: row["id"],
									subject: row["subject"],
									status: typeof row["status"] === "string" ? row["status"] : "pending",
									...typeof row["ownerName"] === "string" ? { ownerName: row["ownerName"] } : {}
								}];
							}) : []
						};
					}
				}, id),
				forkFromRow,
				openInChat,
				clearSelection: () => {
					if (selectedId === void 0) return;
					selectedId = void 0;
					notify();
				}
			});
			refresh();
			return {
				model,
				refresh,
				select,
				toggleCompare,
				search,
				searchNext,
				openInChat,
				forkFromRow,
				compare,
				get collapsedNodes() {
					return collapsedNodes;
				},
				toggleSubtree: (id) => {
					if (collapsedNodes.has(id)) collapsedNodes.delete(id);
					else collapsedNodes.add(id);
					notify();
				},
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				dispose: () => {
					for (const id of [...liveWindows.keys()]) closeLiveWindow(id);
					liveTails.clear();
					liveDetails.clear();
				}
			};
		}
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"sessions",
			"workspaces",
			"uiWorkspace",
			"uiConversation",
			"locale"
		];
		/**
		* The DSH boundary. Everything below this file is written against plain strings
		* and structural interfaces; DSH brands `SessionId`/`SessionRequestId`, so the
		* brand casts live here and nowhere else.
		*/
		const asSessionId = (id) => id;
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-canvas: dictionaries");
			const t = ctx.locale.bind(NS);
			const controllers = /* @__PURE__ */ new Map();
			const modelFor = (sessionId) => {
				const cached = controllers.get(sessionId);
				if (cached !== void 0) return cached.model;
				const controller = createGraphController(depsFor(ctx, sessionId));
				const model = controller.model();
				controllers.set(sessionId, {
					controller,
					model
				});
				return model;
			};
			ctx.effect(() => {
				const offs = [];
				for (const store of [ctx.sessions.list, ctx.workspaces.list]) {
					const subscribe = store.subscribe;
					if (typeof subscribe !== "function") continue;
					offs.push(subscribe.call(store, () => {
						for (const held of controllers.values()) held.controller.refresh();
					}));
				}
				return () => {
					for (const off of offs) off();
				};
			}, "dsh-canvas: snapshot subscriptions");
			ctx.effect(() => () => {
				for (const held of controllers.values()) held.controller.dispose();
				controllers.clear();
			}, "dsh-canvas: controller lifetime");
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "canvas",
				order: 20,
				locale: NS,
				label: () => t("view.canvas"),
				inject: (sessionId) => ({ canvas: modelFor(sessionId) })
			}, CanvasTab));
		}
		function depsFor(ctx, sessionId) {
			/**
			* The canvas is scoped to the workspace that owns the conversation it renders
			* in, resolved through that session's cwd. The client workspace snapshot has
			* no "current workspace" field, and the conversation's own directory is the
			* honest answer to "which workspace am I looking at".
			*/
			const scope = () => {
				const cwd = toSummaries(ctx.sessions.list.getSnapshot()).find((summary) => summary.id === sessionId)?.cwd ?? null;
				const items = toWorkspaceItems(ctx.workspaces.list.getSnapshot());
				return {
					workspaceId: items.find((item) => item.path === cwd)?.workspaceId ?? items[0]?.workspaceId ?? null,
					cwd
				};
			};
			return {
				listSnapshot: () => ctx.sessions.list.getSnapshot(),
				workspaceSnapshot: () => ctx.workspaces.list.getSnapshot(),
				scope,
				isConnected: () => {
					const snapshot = ctx.sessions.list.getSnapshot();
					return snapshot.phase === "ready" && snapshot.state !== "error";
				},
				openSession: (id) => ctx.uiWorkspace.openSession(asSessionId(id)),
				forkDeps: {
					fork: (request) => ctx.sessions.fork({
						sessionId: asSessionId(request.sessionId),
						atSeq: request.atSeq,
						increaseTitle: request.increaseTitle,
						...request.onCreated === void 0 ? {} : { onCreated: (childId) => request.onCreated?.(childId) }
					}),
					childrenOf: async (parentId) => toSummaries(ctx.sessions.list.getSnapshot()).filter((summary) => summary.parentId === parentId).map((summary) => summary.id),
					using: (id, op) => ctx.sessions.using(asSessionId(id), { source: CANVAS_RETAIN_SOURCE }, async (reference) => op(async (text, requestId) => {
						const result = await reference.binding.session.prompt([{
							type: "text",
							text
						}], "queue", void 0, requestId);
						return result.ok ? { ok: true } : {
							ok: false,
							error: result.error.message
						};
					})),
					newRequestId: () => crypto.randomUUID()
				},
				liveWindow: (id) => openLiveWindow({ retain: (target, options) => ctx.sessions.retain(asSessionId(target), options) }, id),
				readEvents: async (id) => {
					const reference = ctx.sessions.retain(asSessionId(id), { source: CANVAS_RETAIN_SOURCE });
					try {
						const binding = await reference.ready;
						const events = [];
						for (const entry of binding.eventSource.getSnapshot().entries) {
							if (entry.type !== "event") continue;
							events.push({
								seq: Number(entry.event.seq),
								type: entry.event.type,
								data: entry.event.data
							});
						}
						return events;
					} finally {
						reference.release();
					}
				}
			};
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
