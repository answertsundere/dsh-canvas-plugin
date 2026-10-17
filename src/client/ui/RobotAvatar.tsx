import type { FC } from 'react'

/** What the robot is doing; drives its animation class. */
export type RobotState = 'working' | 'idle' | 'done' | 'failed'

export interface RobotAvatarProps {
  readonly size?: number
  readonly color: string
  readonly state: RobotState
  /** Set on the wrapper so callers can keep their own status attribute. */
  readonly statusAttr?: { readonly name: string; readonly value: string }
}

/**
 * A small worker robot, drawn inline (no assets) and animated by the canvas's
 * injected stylesheet: working robots bob with swinging arms and a blinking
 * antenna LED, idle ones breathe slowly, failed ones shake, finished ones
 * stand still with dim eyes. The robot is the node's identity — its color is
 * the tool family or the agent's status color.
 */
export const RobotAvatar: FC<RobotAvatarProps> = ({ size = 26, color, state, statusAttr }) => (
  <span
    data-robot
    data-robot-state={state}
    className={`dsh-robot dsh-robot-${state}`}
    style={{ display: 'inline-block', flex: '0 0 auto', width: size, height: size * 1.1 }}
    {...(statusAttr === undefined ? {} : { [statusAttr.name]: statusAttr.value })}
  >
    <svg viewBox="0 0 40 44" width="100%" height="100%" aria-hidden="true">
      {/* antenna */}
      <line x1="20" y1="5" x2="20" y2="13" stroke={color} strokeWidth="2" />
      <circle className="dsh-robot-led" cx="20" cy="4" r="3" fill={state === 'failed' ? '#e0554d' : color} />
      {/* head + visor */}
      <rect x="8" y="12" width="24" height="16" rx="5" fill={color} opacity="0.9" />
      <rect x="11" y="16" width="18" height="8" rx="3" fill="#0b0d12" />
      {/* eyes */}
      <circle className="dsh-robot-eye" cx="16" cy="20" r="1.8" fill={state === 'failed' ? '#e0554d' : '#7ce7ff'} />
      <circle className="dsh-robot-eye" cx="24" cy="20" r="1.8" fill={state === 'failed' ? '#e0554d' : '#7ce7ff'} />
      {/* body + chest light */}
      <rect x="11" y="30" width="18" height="11" rx="4" fill={color} opacity="0.75" />
      <circle className="dsh-robot-chest" cx="20" cy="35.5" r="2" fill="#0b0d12" />
      {/* arms */}
      <rect className="dsh-robot-arm dsh-robot-arm-l" x="5" y="30" width="4" height="9" rx="2" fill={color} opacity="0.8" />
      <rect className="dsh-robot-arm dsh-robot-arm-r" x="31" y="30" width="4" height="9" rx="2" fill={color} opacity="0.8" />
    </svg>
  </span>
)
