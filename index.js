/**
 * dsh-invest-skill —— bundle 入口（宿主侧无副作用）。
 *
 * 这个包会被 bundle patch 挂成一个顶层行（id: invest-skill），有两个作用：
 *   1. DSH 的客户端模块扫描按「已挂载的插件行」发现 `dsh.client`，有了这个行，
 *      左侧栏「投研看板」才会被装配；
 *   2. 宿主侧保持空实现——15 个技能的注册在 provider.js，只挂在「因维思」预设内部，
 *      因此不会把技能暴露给其他预设的会话。
 */
export const name = 'invest-skill'

export function apply() {
  // 有意留空：宿主行为全部在 provider.js
}
