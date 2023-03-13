export const calcDuration = (dur: number) => {
  let timeLeft = dur;

  const ms = timeLeft % 1000;
  timeLeft = (timeLeft - ms) / 1000;

  const s = timeLeft % 60;
  timeLeft = (timeLeft - s) / 60;

  const m = timeLeft % 60;
  timeLeft = (timeLeft - m) / 60;

  const h = timeLeft % 24;
  timeLeft = (timeLeft - h) / 24;

  const d = timeLeft % 365;
  timeLeft = (timeLeft - d) / 365;

  const y = timeLeft;

  return { y, d, h, m, s, ms };
};
