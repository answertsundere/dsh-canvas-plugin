export declare const NS = "dsh-canvas";
/**
 * DSH types the slot `locale:` field as `keyof LocaleNamespaceMap`, an interface
 * each dictionary owner extends by declaration merging. Merging here is what
 * makes `locale.register(NS, ...)` type-check against this namespace's own key
 * union, so every future zh/en key is checked for exact parity at compile time.
 */
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'dsh-canvas': keyof typeof zh;
    }
}
export declare const zh: {
    readonly 'view.canvas': "画布";
    readonly 'toolbar.search': "搜索";
    readonly 'toolbar.layout': "布局";
    readonly 'toolbar.refresh': "刷新";
    readonly 'panel.detail': "详情";
    readonly 'panel.compare': "对比";
    readonly 'fork.here': "从此分叉";
    readonly 'fork.inherit': "继承";
    readonly 'fork.launch.now': "立即开跑";
    readonly 'fork.launch.later': "只建分支";
    readonly 'fork.cwdWarning': "并行分支共享同一工作目录，同时写文件可能互相覆盖";
    readonly 'compare.continue': "切换至此分支继续";
    readonly 'compare.carry': "带回结论";
    readonly 'compare.empty': "选择两个分支进行对比";
    readonly 'state.unknown': "状态未知";
};
export declare const en: Record<keyof typeof zh, string>;
