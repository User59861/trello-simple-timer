/* global TrelloPowerUp */
console.log("Power-Up client.js loaded");
const tpu = TrelloPowerUp;

function fmt(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return (h?`${h}h `:"")+`${m}m`;}
async function getSessions(t){const s=await t.get('card','shared','sessions');return Array.isArray(s)?s:[];}
async function totalSeconds(t){return (await getSessions(t)).reduce((a,x)=>a+(x.seconds||0),0);}

tpu.initialize({
  'board-buttons': function(t){
    return [{ text:'Timer Hello', callback: () => t.alert({message:'Power-Up loaded ✅', duration:3}) }];
  },
  'card-buttons': function(t){
    return [
      { text:'Start Timer',
        callback: async (t)=>{ const st=await t.get('card','shared','timerStart'); if(!st) await t.set('card','shared','timerStart', Date.now()); return t.alert({message:'Timer started.',duration:3}); }
      },
      { text:'Stop + Note',
        callback: async (t)=>{
          const start=await t.get('card','shared','timerStart');
          if(!start){ await t.alert({message:'No running timer found.',duration:3}); return; }
          const note=(window.prompt('Brief description?', '')||'').trim();
          const end=Date.now(), seconds=Math.max(0, Math.round((end-start)/1000));
          const sessions=await getSessions(t); sessions.push({start,end,seconds,note});
          await t.set('card','shared','sessions', sessions);
          await t.remove('card','shared','timerStart');
          return t.alert({message:'Time saved.', duration:3});
        }
      }
    ];
  },
  'card-badges': async function(t){
    const secs=await totalSeconds(t);
    if(secs>0) return [{ text: fmt(secs), color:'blue', tooltip:'Total tracked time' }];
    const running=await t.get('card','shared','timerStart');
    if(running) return [{ text:'⏱ running…', color:'green', tooltip:'Timer is running' }];
    return [];
  }
});
