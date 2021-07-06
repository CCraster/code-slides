export const PROJECT_TAG = 'projects'

export const HIGHLIGHT_MODE_MAP = {
  weaken: 'Weaken Unhighliht Line',
  strengthen: 'Strengthen Highliht Line',
  both: 'Both',
}

export const CODE_SLIDES_DEFAULT_CONFIG = {
  highlightMode: HIGHLIGHT_MODE_MAP.weaken,
  lineWeakenColor: {
    opacity: '0.2',
  },
  lineStrengthenColor: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  hideStatusBar: false,
  statusBarNormalColor: '#fff',
  statusBarPlayingColor: '#0f0',
}
