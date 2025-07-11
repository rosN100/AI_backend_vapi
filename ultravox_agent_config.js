// Ultravox agent configuration for Build3 - Riya
import { RIYA_SYSTEM_PROMPT, RIYA_INITIAL_GREETING } from './riya_system_prompt.js';

/**
 * Returns the Ultravox agent config payload for Build3's Riya.
 * @param {string} candidateName - The candidate's name for personalization.
 * @returns {object} - Ultravox agent config payload.
 */
export function getUltravoxAgentConfig(candidateName) {
  return {
    name: 'Riya',
    callTemplate: {
      systemPrompt: RIYA_SYSTEM_PROMPT,
      voice: 'Jessica', // Default Ultravox built-in voice
      temperature: 0.4,
      recordingEnabled: true,
      firstSpeakerSettings: {
        agent: {
          text: RIYA_INITIAL_GREETING(candidateName)
        }
      }
      // selectedTools: [] // Add if needed
    }
  };
}
