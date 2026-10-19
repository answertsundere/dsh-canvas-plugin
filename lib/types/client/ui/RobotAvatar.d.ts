import type { FC } from 'react';
import type { RobotVariant } from '../swarm/swarm-model.ts';
/** What the robot is doing; drives its animation class. */
export type RobotState = 'working' | 'idle' | 'done' | 'failed';
export interface RobotAvatarProps {
    readonly size?: number;
    readonly color: string;
    readonly state: RobotState;
    readonly variant?: RobotVariant;
    /**
     * `agent` is a person: full body, arms, chest light. `device` is equipment:
     * the instrument head on a stand with legs — no arms, no torso. Tools are
     * devices; agents are people; the silhouettes must never be confused.
     */
    readonly species?: 'agent' | 'device';
    /** Set on the wrapper so callers can keep their own status attribute. */
    readonly statusAttr?: {
        readonly name: string;
        readonly value: string;
    };
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
export declare const RobotAvatar: FC<RobotAvatarProps>;
