/* global TrelloPowerUp */
console.log("Power-Up client.js loaded");
const tpu = TrelloPowerUp;

function fmt(totalSeconds){
  const h = Math.floor(totalSeconds/3600);
  const m = Math.floor((totalSeconds%3600)/60);
  return (h?`${h}h `:"")+`${m}m`;
}

async function getSessions(t){
  const s = await t.get('card','shared','sessions');
  return Array.isArray(s) ? s : [];
}
async function totalSeconds(t){
  const s = await getSessions(t);
  return s.reduce((sum, x) => sum + (x.seconds||0), 0);
}

tpu.initialize({
  // PROOF: A button on the board header
  'board-buttons': function(t){
    return [{
      text: 'Timer Hello',
      callback: function(){
        return t.alert({ message: 'Power-Up loaded ✅', duration: 3 });
      }
    }];
  },

  // Buttons on every card back
  'card-buttons': function(t){
    return [
      {
        text: 'Start Timer',
        callback: async function(t){
          const existing = await t.get('card','shared','timerStart');
          if (!existing) await t.set('card','shared','timerStart', Date.now());
          return t.alert({ message: 'Timer started.', duration: 3 });
        }
      },
      {
        text: 'Stop + Note',
        callback: async function(t){
          const start = await t.get('card','shared','timerStart');
          if (!start){
            await t.alert({ message: 'No running timer found.', duration: 3 });
            return;
          }
          const note = window.prompt('Brief description?', '') || '';
          const end = Date.now();
          const seconds = Math.max(0, Math.round((end - start)/1000));
          const member = await t.member('id');
          const sessions = await getSessions(t);
          sessions.push({ start, end, seconds, note: note.trim(), by: member });
          await t.set('card','shared','sessions', sessions);
          await t.remove('card','shared','timerStart');
          return t.alert({ message: 'Time saved.', duration: 3 });
        }
      }
    ];
  },

  // Badge with total tracked time
  'card-badges': async function(t){
    const secs = await totalSeconds(t);
    if (secs > 0) return [{ text: fmt(secs), color: 'blue', tooltip: 'Total tracked time' }];
    const running = await t.get('card','shared','timerStart');
    if (running) return [{ text: '⏱ running…', color: 'green', tooltip: 'Timer is running' }];
    return [];
  }
});
