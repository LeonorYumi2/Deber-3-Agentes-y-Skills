export const colors = {
  navy: "#141759",
  indigo: "#54578C",
  gold: "#D9A91A",
  sand: "#F2D194",
  mist: "#F2F2F2",
  white: "#FFFFFF",
} as const;

export const phaseTheme = {
  estudio: {
    background: colors.navy,
    text: colors.mist,
    button: colors.gold,
    buttonText: colors.navy,
  },
  descanso: {
    background: colors.gold,
    text: colors.navy,
    button: colors.navy,
    buttonText: colors.mist,
  },
} as const;