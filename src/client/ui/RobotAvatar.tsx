import type { FC, ReactNode } from 'react'
import type { RobotVariant } from '../swarm/swarm-model.ts'

/** What the robot is doing; drives its animation class. */
export type RobotState = 'working' | 'idle' | 'done' | 'failed'

export interface RobotAvatarProps {
  readonly size?: number
  readonly color: string
  readonly state: RobotState
  readonly variant?: RobotVariant
  /**
   * `agent` is a person: full body, arms, chest light. `device` is equipment:
   * the instrument head on a stand with legs — no arms, no torso. Tools are
   * devices; agents are people; the silhouettes must never be confused.
   */
  readonly species?: 'agent' | 'device'
  /** Set on the wrapper so callers can keep their own status attribute. */
  readonly statusAttr?: { readonly name: string; readonly value: string }
}

interface PartProps {
  readonly color: string
  readonly state: RobotState
  readonly species?: 'agent' | 'device'
}

const eyeColor = (state: RobotState): string => (state === 'failed' ? '#e0554d' : '#7ce7ff')
const ledColor = (state: RobotState, color: string): string => (state === 'failed' ? '#e0554d' : color)

/** The arms every humanoid variant shares, so the working swing animates everywhere. */
const Arms: FC<PartProps> = ({ color, species = 'agent' }) => species === 'device' ? null : (
  <>
    <rect className="dsh-robot-arm dsh-robot-arm-l" x="5" y="30" width="4" height="9" rx="2" fill={color} opacity="0.8" />
    <rect className="dsh-robot-arm dsh-robot-arm-r" x="31" y="30" width="4" height="9" rx="2" fill={color} opacity="0.8" />
  </>
)

/** Rounded head with a dark visor and two eyes — the base chassis. */
const VisorHead: FC<PartProps & { readonly rx?: number }> = ({ color, state, rx = 5 }) => (
  <>
    <rect x="8" y="12" width="24" height="16" rx={rx} fill={color} opacity="0.9" />
    <rect x="11" y="16" width="18" height="8" rx="3" fill="#0b0d12" />
    <circle className="dsh-robot-eye" cx="16" cy="20" r="1.8" fill={eyeColor(state)} />
    <circle className="dsh-robot-eye" cx="24" cy="20" r="1.8" fill={eyeColor(state)} />
  </>
)

/**
 * The chassis below the head: a humanoid torso with a chest light, or — for
 * devices — the instrument frame standing on two legs and a base plate.
 */
const Body: FC<{ readonly color: string; readonly species?: 'agent' | 'device'; readonly children?: ReactNode }> =
({ color, species = 'agent', children }) => species === 'device' ? (
  <>
    <rect className="dsh-robot-body" x="11" y="29" width="18" height="8" rx="2" fill={color} opacity="0.75" />
    {children}
    <rect x="14.5" y="37" width="3" height="4" rx="1" fill={color} opacity="0.6" />
    <rect x="22.5" y="37" width="3" height="4" rx="1" fill={color} opacity="0.6" />
    <rect data-robot-part="stand" x="9" y="41" width="22" height="2.4" rx="1.2" fill={color} opacity="0.45" />
  </>
) : (
  <>
    <rect className="dsh-robot-body" x="11" y="30" width="18" height="11" rx="4" fill={color} opacity="0.75" />
    {children ?? <circle className="dsh-robot-chest" cx="20" cy="35.5" r="2" fill="#0b0d12" />}
  </>
)

/** Straight antenna with one LED. */
const Antenna: FC<PartProps> = ({ color, state }) => (
  <>
    <line x1="20" y1="5" x2="20" y2="13" stroke={color} strokeWidth="2" />
    <circle className="dsh-robot-led" cx="20" cy="4" r="3" fill={ledColor(state, color)} />
  </>
)

const VariantBody: FC<PartProps & { readonly variant: RobotVariant }> = ({ color, state, variant, species = 'agent' }) => {
  switch (variant) {
    case 'shell':
      // Terminal bot: a square head showing a prompt screen, stub antenna.
      return (
        <>
          <line x1="20" y1="7" x2="20" y2="12" stroke={color} strokeWidth="2" />
          <rect className="dsh-robot-led" x="17" y="3" width="6" height="5" rx="1.5" fill={ledColor(state, color)} />
          <rect x="7" y="12" width="26" height="17" rx="2.5" fill={color} opacity="0.9" />
          <rect x="10" y="15" width="20" height="11" rx="1.5" fill="#0b0d12" />
          <path data-robot-part="terminal" d="M 12 18 l 3 2.5 l -3 2.5" fill="none" stroke={eyeColor(state)} strokeWidth="1.4" />
          <line x1="17" y1="23" x2="27" y2="23" stroke={eyeColor(state)} strokeWidth="1.2" opacity="0.8" />
          <Body color={color} species={species}>
            <rect x="14" y="33" width="4" height="4" rx="1" fill="#0b0d12" />
            <rect x="22" y="33" width="4" height="4" rx="1" fill="#0b0d12" />
          </Body>
          <Arms color={color} state={state} species={species} />
        </>
      )
    case 'job':
      // Job runner: twin antennas and a gauge dial on the chest.
      return (
        <>
          <line x1="15" y1="6" x2="15" y2="13" stroke={color} strokeWidth="1.6" />
          <circle className="dsh-robot-led" cx="15" cy="5" r="2.4" fill={ledColor(state, color)} />
          <line x1="25" y1="6" x2="25" y2="13" stroke={color} strokeWidth="1.6" />
          <circle className="dsh-robot-led" cx="25" cy="5" r="2.4" fill={ledColor(state, color)} />
          <VisorHead color={color} state={state} />
          <Body color={color} species={species}>
            <g data-robot-part="gauge">
              <circle cx="20" cy="35.5" r="4" fill="#0b0d12" />
              <path d="M 17 34.5 A 4 4 0 0 1 23 34.5" fill="none" stroke={color} strokeWidth="1.2" />
              <line x1="20" y1="35.5" x2="22.5" y2="33.5" stroke={eyeColor(state)} strokeWidth="1.2" />
            </g>
          </Body>
          <Arms color={color} state={state} species={species} />
        </>
      )
    case 'read':
      // Scanner: a domed head with one big lens.
      return (
        <>
          <path d="M 8 22 A 12 11 0 0 1 32 22 Z" fill={color} opacity="0.9" />
          <g data-robot-part="lens">
            <circle cx="20" cy="19" r="6" fill="#0b0d12" />
            <circle className="dsh-robot-eye" cx="20" cy="19" r="3" fill={eyeColor(state)} />
            <circle cx="18.5" cy="17.5" r="1" fill="#ffffff" opacity="0.8" />
          </g>
          <Body color={color} species={species} />
          <Arms color={color} state={state} species={species} />
        </>
      )
    case 'write':
      // Scribe: a pen-nib antenna and a pencil in the right hand.
      return (
        <>
          <path d="M 20 12 L 17.5 6 L 22.5 6 Z" fill={ledColor(state, color)} />
          <rect x="19.2" y="11" width="1.6" height="3" fill={color} />
          <VisorHead color={color} state={state} />
          <Body color={color} species={species} />
          <Arms color={color} state={state} species={species} />
          <g data-robot-part="pencil" transform="rotate(24 33 32)">
            <rect x="31.6" y="24" width="2.8" height="9" rx="0.8" fill="#f2c94c" />
            <path d="M 31.6 33 L 33 36 L 34.4 33 Z" fill="#e0a23c" />
          </g>
        </>
      )
    case 'search':
      // Investigator: one eye replaced by a magnifier, radar-arc antenna.
      return (
        <>
          <path d="M 13 6 A 8 8 0 0 1 27 6" fill="none" stroke={color} strokeWidth="2" />
          <circle className="dsh-robot-led" cx="20" cy="5" r="2.6" fill={ledColor(state, color)} />
          <rect x="8" y="12" width="24" height="16" rx="5" fill={color} opacity="0.9" />
          <rect x="11" y="16" width="18" height="8" rx="3" fill="#0b0d12" />
          <circle className="dsh-robot-eye" cx="16" cy="20" r="1.8" fill={eyeColor(state)} />
          <g data-robot-part="magnifier">
            <circle cx="24.5" cy="20" r="3.4" fill="none" stroke={eyeColor(state)} strokeWidth="1.6" />
            <line x1="27" y1="22.5" x2="28.6" y2="24" stroke={eyeColor(state)} strokeWidth="1.6" />
          </g>
          <Body color={color} species={species} />
          <Arms color={color} state={state} species={species} />
        </>
      )
    case 'todo':
      // Planner: a checklist panel on the chest.
      return (
        <>
          <Antenna color={color} state={state} />
          <VisorHead color={color} state={state} />
          <Body color={color} species={species}>
            <g data-robot-part="checklist">
              <rect x="13" y="32" width="14" height="8" rx="1.5" fill="#0b0d12" />
              <path d="M 15 34.5 l 1.6 1.6 l 2.6 -3" fill="none" stroke="#2f9e6f" strokeWidth="1.2" />
              <line x1="21" y1="34.5" x2="25" y2="34.5" stroke={eyeColor(state)} strokeWidth="1.1" />
              <path d="M 15 37.8 l 1.6 1.6 l 2.6 -3" fill="none" stroke={eyeColor(state)} strokeWidth="1.2" opacity="0.5" />
              <line x1="21" y1="37.8" x2="25" y2="37.8" stroke={eyeColor(state)} strokeWidth="1.1" opacity="0.7" />
            </g>
          </Body>
          <Arms color={color} state={state} species={species} />
        </>
      )
    case 'fetch':
      // Networker: dish antenna and a globe chest.
      return (
        <>
          <path d="M 14 8 A 7 7 0 0 1 26 8" fill="none" stroke={color} strokeWidth="2" />
          <line x1="20" y1="9" x2="20" y2="13" stroke={color} strokeWidth="1.6" />
          <circle className="dsh-robot-led" cx="20" cy="8" r="2.2" fill={ledColor(state, color)} />
          <VisorHead color={color} state={state} />
          <Body color={color} species={species}>
            <g data-robot-part="globe">
              <circle cx="20" cy="35.5" r="4" fill="#0b0d12" />
              <ellipse cx="20" cy="35.5" rx="4" ry="1.6" fill="none" stroke={eyeColor(state)} strokeWidth="0.9" />
              <ellipse cx="20" cy="35.5" rx="1.7" ry="4" fill="none" stroke={eyeColor(state)} strokeWidth="0.9" />
            </g>
          </Body>
          <Arms color={color} state={state} species={species} />
        </>
      )
    case 'agent':
      // Supervisor subagent: a headset over the visor.
      return (
        <>
          <Antenna color={color} state={state} />
          <VisorHead color={color} state={state} />
          <path data-robot-part="headset" d="M 6 20 A 14 14 0 0 1 34 20" fill="none" stroke={color} strokeWidth="2" opacity="0.9" />
          <circle cx="34" cy="20" r="2.6" fill={color} opacity="0.9" />
          <path d="M 34 22 q -1 4 -5 5" fill="none" stroke={color} strokeWidth="1.4" opacity="0.8" />
          <Body color={color} species={species} />
          <Arms color={color} state={state} species={species} />
        </>
      )
    case 'root':
      // The session itself: a crown antenna array and a collar.
      return (
        <>
          <line x1="13" y1="7" x2="13" y2="13" stroke={color} strokeWidth="1.6" />
          <circle className="dsh-robot-led" cx="13" cy="6" r="2.2" fill={ledColor(state, color)} />
          <line x1="20" y1="5" x2="20" y2="13" stroke={color} strokeWidth="2" />
          <circle className="dsh-robot-led" cx="20" cy="4" r="2.8" fill={ledColor(state, color)} />
          <line x1="27" y1="7" x2="27" y2="13" stroke={color} strokeWidth="1.6" />
          <circle className="dsh-robot-led" cx="27" cy="6" r="2.2" fill={ledColor(state, color)} />
          <VisorHead color={color} state={state} />
          <Body color={color} species={species}>
            <path data-robot-part="collar" d="M 15 30 L 20 36 L 25 30 Z" fill="#0b0d12" opacity="0.9" />
          </Body>
          <Arms color={color} state={state} species={species} />
        </>
      )
    default:
      return (
        <>
          <Antenna color={color} state={state} />
          <VisorHead color={color} state={state} />
          <Body color={color} species={species} />
          <Arms color={color} state={state} species={species} />
        </>
      )
  }
}

/**
 * A small worker robot, drawn inline (no assets). Each variant is its own
 * design — a terminal bot, a job runner with a gauge, a one-eyed scanner, a
 * scribe with a pencil, an investigator with a magnifier, a planner with a
 * checklist, a networker with a dish, a headset-wearing subagent, and the
 * crowned session itself. The canvas's injected sheet animates them: working
 * robots bob with swinging arms and a blinking antenna LED, idle ones breathe,
 * failed ones shake, finished ones stand still with green eyes.
 */
export const RobotAvatar: FC<RobotAvatarProps> = ({ size = 26, color, state, variant = 'generic', species = 'agent', statusAttr }) => (
  <span
    data-robot
    data-robot-state={state}
    data-robot-variant={variant}
    data-robot-species={species}
    className={`dsh-robot dsh-robot-${state} dsh-robot-v-${variant}${species === 'device' ? ' dsh-robot-device' : ''}`}
    style={{ display: 'inline-block', flex: '0 0 auto', width: size, height: size * 1.1 }}
    {...(statusAttr === undefined ? {} : { [statusAttr.name]: statusAttr.value })}
  >
    <svg viewBox="0 0 40 44" width="100%" height="100%" aria-hidden="true">
      <VariantBody color={color} state={state} variant={variant} species={species} />
    </svg>
  </span>
)
