/* global TrelloPowerUp */
const tpu = TrelloPowerUp;

// Format seconds as "Hh Mm"
function fmtHM(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return (h > 0 ? `${h}h ` : "") + `${m}m`;
}

async function getSessions(t) {
  const sessions = await t.get('card', 'shared', 'sessions');
  return Array.isArray(sessions) ? sessions : [];
}

async function totalSeconds(t) {
  const sessions = await getSessions(t);
  return sessions.reduce((sum, s) => sum + (s.seconds || 0), 0);
}

tpu.initialize({
  'card-buttons': function(t) {
    return [{
      text: 'Start Timer',
      callback: async function(t){
        const existing = await t.get('card','shared','timerStart');
        if (!existing) await t.set('card','shared','timerStart', Date.now());
        return t.alert({ message: 'Timer started.', duration: 3 });
      }
    },{
      text: 'Stop Timer',
      callback: function(t){
        return t.popup({
          title: 'Stop & Add Note',
          url: 'stop.html',
          height: 200
        });
      }
    }];
  },

  'card-badges': async function(t) {
    const secs = await totalSeconds(t);
    if (secs > 0) {
      return [{ text: fmtHM(secs), color: 'blue', tooltip: 'Total tracked time on this card' }];
    }
    const running = await t.get('card','shared','timerStart');
    if (running) {
      return [{ text: '⏱ running…', color: 'green', tooltip: 'Timer is running' }];
    }
    return [];
  }
});
