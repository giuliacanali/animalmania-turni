const defaults={"stores": [{"id": "pindaro", "name": "Pindaro", "openDays": ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab"], "sessions": [{"start": "09:00", "end": "20:00"}], "specialBands": [{"start": "09:00", "end": "10:00", "min": 2}, {"start": "14:00", "end": "16:00", "min": 2}, {"start": "19:00", "end": "20:00", "min": 2}]}, {"id": "ostiense", "name": "Ostiense", "openDays": ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab"], "sessions": [{"start": "09:00", "end": "20:00"}], "specialBands": [{"start": "09:00", "end": "10:00", "min": 2}, {"start": "14:00", "end": "16:00", "min": 2}, {"start": "19:00", "end": "20:00", "min": 2}]}], "employees": [{"id": "silvia", "name": "Silvia Casalinuovo", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "", "type": "6-8", "pauseHours": 1}, {"id": "luca_b", "name": "Luca Ballanti", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "Mer", "type": "8", "pauseHours": 1}, {"id": "leonardo", "name": "Leonardo Barbato", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "Mar", "type": "8", "pauseHours": 1}, {"id": "sofia", "name": "Sofia Tomei", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "", "type": "6-8", "pauseHours": 1}, {"id": "giulia_n", "name": "Giulia Nitrola", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "Lun", "type": "8", "pauseHours": 1}, {"id": "giorgia", "name": "Giorgia Quacquarelli", "weeklyHours": 40, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "Gio", "type": "8", "pauseHours": 1}, {"id": "manuel", "name": "Manuel Esposito", "weeklyHours": 40, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "Mer", "type": "8", "pauseHours": 1}, {"id": "simone", "name": "Simone Bindi", "weeklyHours": 40, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "Lun", "type": "8", "pauseHours": 1}, {"id": "luca_g", "name": "Luca Grimaldi", "weeklyHours": 40, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "Ven", "type": "8", "pauseHours": 1}, {"id": "verena", "name": "Verena Loi", "weeklyHours": 36, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "", "type": "6", "pauseHours": 0}]};
const days=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
const genDays=["Lun","Mar","Mer","Gio","Ven","Sab"];
// Pausa lunga per il turno spezzato: usata SOLO per coprire buchi/fasce
// speciali. Entra nei negozi aperti 11h (8h lavoro + 3h pausa = 11h).
const LONG_PAUSE_HOURS=3;
// Ogni tratto di lavoro di un turno spezzato dura almeno queste ore, per
// evitare spezzati assurdi tipo 1h + 7h.
const MIN_SPLIT_SEGMENT=3;

const monthsLong=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const monthsShort=["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

// Settimana Lun→Dom. La chiave di ogni settimana è la data ISO del lunedì.
function mondayOf(date){
  const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  const dow=(d.getDay()+6)%7; // Lun=0 … Dom=6
  d.setDate(d.getDate()-dow);
  return d;
}
function pad2(n){return String(n).padStart(2,"0");}
function isoDate(d){return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}
function weekKeyOf(date){return isoDate(mondayOf(date));}
function keyToDate(key){const [y,m,d]=key.split("-").map(Number);return new Date(y,m-1,d);}
function addWeeks(key,n){const d=keyToDate(key);d.setDate(d.getDate()+n*7);return isoDate(d);}
function dayDatesOf(key){
  const start=keyToDate(key);
  return days.map((_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
}
function formatWeekRange(key){
  const dates=dayDatesOf(key);
  const a=dates[0], b=dates[6];
  if(a.getMonth()===b.getMonth()){
    return `${a.getDate()} – ${b.getDate()} ${monthsLong[a.getMonth()]} ${a.getFullYear()}`;
  }
  const yearPart=a.getFullYear()===b.getFullYear()?` ${b.getFullYear()}`:` ${a.getFullYear()}`;
  return `${a.getDate()} ${monthsShort[a.getMonth()]} – ${b.getDate()} ${monthsShort[b.getMonth()]}${yearPart}`;
}


const employeeProfiles = [
  {id:"standard_40",name:"Standard 40h",weeklyHours:40,type:"8",restDefault:"Mer",pauseHours:1,isExtra:false,fixedShifts:false,description:"40h, 5 giorni da 8h, riposo obbligatorio Lun-Ven"},
  {id:"flessibile_40",name:"Flessibile 40h",weeklyHours:40,type:"6-8",restDefault:"",pauseHours:1,isExtra:false,fixedShifts:false,description:"40h, 6 giorni, turni 6h o 8h"},
  {id:"solo_6",name:"Solo 6h",weeklyHours:36,type:"6",restDefault:"",pauseHours:0,isExtra:false,fixedShifts:false,description:"36h, turni solo da 6h, nessuna pausa"},
  {id:"extra_30",name:"Extra 30h",weeklyHours:30,type:"4-5",restDefault:"",pauseHours:0,isExtra:true,fixedShifts:false,description:"Extra: usato solo per coprire buchi, massimo 30h, turni 4h o 5h, senza pausa"},
  {id:"turno_fisso",name:"Turno fisso",weeklyHours:0,type:"fixed",restDefault:"",pauseHours:0,isExtra:false,fixedShifts:true,description:"Orari impostati manualmente giorno per giorno"}
];

function getProfile(id){
  return employeeProfiles.find(p=>p.id===id) || employeeProfiles[0];
}

function normalizeLegacyEmployees(){
  employees = employees.map(e=>{
    if(e.profileId) return e;
    let profileId="standard_40";
    if(e.type==="6-8" && e.weeklyHours===40 && !e.rest) profileId="flessibile_40";
    if(e.type==="6") profileId="solo_6";
    if(e.weeklyHours===30 || e.isExtra) profileId="extra_30";
    const p=getProfile(profileId);
    return {...e, profileId, weeklyHours:p.id==="extra_30"?30:e.weeklyHours, type:p.id==="extra_30"?"4-5":e.type, pauseHours:p.id==="extra_30"?0:e.pauseHours, rest:p.id==="extra_30"?"":e.rest, isExtra:!!p.isExtra, fixedShifts:false};
  });
}

// Al primo avvio (localStorage vuoto) si parte dal seed precaricato
// (window.AM_SEED, definito in seed-data.js) così chi apre il link ha già
// negozi, dipendenti e turni senza dover importare nulla. Chi ha già dati
// propri in localStorage non viene toccato.
const AM_SEED=(typeof window!=="undefined" && window.AM_SEED) ? window.AM_SEED : null;
function seedClone(v){ return v==null ? null : JSON.parse(JSON.stringify(v)); }
const seedStores=(AM_SEED && AM_SEED.stores) ? AM_SEED.stores : defaults.stores;
const seedEmployees=(AM_SEED && AM_SEED.employees) ? AM_SEED.employees : defaults.employees;

let stores=JSON.parse(localStorage.getItem("am134_stores")||"null") || seedClone(seedStores);
let employees=JSON.parse(localStorage.getItem("am134_employees")||"null") || seedClone(seedEmployees);
normalizeLegacyEmployees();
function loadSchedules(){
  const stored=JSON.parse(localStorage.getItem("am134_schedules")||"null");
  if(stored && typeof stored==="object") return stored;
  // Migrazione dal vecchio formato a settimana unica.
  const legacy=JSON.parse(localStorage.getItem("am134_schedule")||"null");
  if(legacy && typeof legacy==="object") return {[weekKeyOf(new Date())]:legacy};
  if(AM_SEED && AM_SEED.schedules) return seedClone(AM_SEED.schedules); // seed iniziale
  return {};
}

let schedules=loadSchedules();
let currentWeekKey=localStorage.getItem("am134_week") || (AM_SEED && AM_SEED.week) || weekKeyOf(new Date());
if(!schedules[currentWeekKey]) schedules[currentWeekKey]=emptySchedule();
let schedule=schedules[currentWeekKey];
let suppressAutoRender = false;

function saveData(){
  try{
    schedules[currentWeekKey]=schedule;
    localStorage.setItem("am134_stores",JSON.stringify(stores));
    localStorage.setItem("am134_employees",JSON.stringify(employees));
    localStorage.setItem("am134_schedules",JSON.stringify(schedules));
    localStorage.setItem("am134_week",currentWeekKey);
  }catch(err){
    showNotice("ATTENZIONE: le modifiche non sono state salvate sul dispositivo (navigazione privata, spazio esaurito o impostazioni del browser). Chiudendo o ricaricando la pagina andranno perse.","warn",8000);
  }
  // Se il backend dati è attivo e sei admin, salva anche sul server (condiviso).
  if(typeof scheduleServerPush==="function") scheduleServerPush();
}

function setWeek(key){
  saveData();
  if(!schedules[key]) schedules[key]=emptySchedule();
  currentWeekKey=key;
  schedule=schedules[key];
  ensureSchedule();
  saveData();
  renderAll();
}

function slug(x){
  return x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
}

function canWorkIn(e,storeId){return e.primaryStoreId===storeId||e.secondaryStoreIds.includes(storeId);}

function hasShiftElsewhere(storeId,employeeId,day){
  return stores.some(s=>s.id!==storeId && schedule[s.id]?.[employeeId]?.[day]);
}

function emptySchedule(){
  const s={};
  stores.forEach(st=>{
    s[st.id]={};
    employees.filter(e=>canWorkIn(e,st.id)).forEach(e=>s[st.id][e.id]=Object.fromEntries(days.map(d=>[d,null])));
  });
  return s;
}

function ensureSchedule(){
  stores.forEach(st=>{
    schedule[st.id]=schedule[st.id]||{};
    employees.filter(e=>canWorkIn(e,st.id)).forEach(e=>{
      schedule[st.id][e.id]=schedule[st.id][e.id]||Object.fromEntries(days.map(d=>[d,null]));
    });
  });
}

function toMin(t){const [h,m]=t.split(":").map(Number);return h*60+(m||0);}
function toTime(v){return String(Math.floor(v/60)).padStart(2,"0")+":"+String(v%60).padStart(2,"0");}
function hoursBetween(a,b){return (toMin(b)-toMin(a))/60;}
function overlaps(a,b){return toMin(a.start)<toMin(b.end)&&toMin(a.end)>toMin(b.start);}

function segmentFullyCovers(seg,band){
  return toMin(seg.start)<=toMin(band.start) && toMin(seg.end)>=toMin(band.end);
}

function shiftFullyCovers(sh,band){
  if(!sh)return false;
  return (sh.segments||[]).some(seg=>segmentFullyCovers(seg,band));
}

function splitSessionIntoSlots(session){
  const slots=[];
  let start=toMin(session.start);
  const end=toMin(session.end);

  while(start<end){
    const slotEnd=Math.min(start+60,end);
    slots.push({
      start:toTime(start),
      end:toTime(slotEnd),
      min:1,
      base:true
    });
    start=slotEnd;
  }

  return slots;
}

function requiredCoverageSlots(store){
  const baseSlots=store.sessions.flatMap(splitSessionIntoSlots);
  const special=(store.specialBands||[]).map(b=>({
    start:b.start,
    end:b.end,
    min:Number(b.min||2),
    base:false
  }));
  return [...special,...baseSlots];
}


function shiftHours(sh){
  if(!sh)return 0;
  return (sh.segments||[]).reduce((s,x)=>s+hoursBetween(x.start,x.end),0);
}

function employeeTotal(eid){
  let t=0;
  stores.forEach(st=>days.forEach(d=>t+=shiftHours(schedule[st.id]?.[eid]?.[d])));
  return t;
}

function allowedHours(e){
  if(e.type==="6") return [6];
  if(e.type==="8") return [8];
  if(e.type==="4-5") return [5,4];
  return [8,6];
}

function shuffle(list){
  const arr=list.slice();
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

// Ordine dei giorni mescolato ad ogni generazione. La copertura viene
// comunque riempita per intero (i cicli girano finché ogni fascia è coperta),
// ma processare i giorni in ordine diverso cambia l'accumulo di ore/trasferte
// e quindi CHI finisce a coprire QUALE giorno: così ad ogni "Genera proposta"
// i dipendenti non restano incollati sempre agli stessi giorni.
function shuffledGenDays(){ return shuffle(genDays); }

function maxWeeklyHours(e){ return Number(e.weeklyHours || 0); }

// --- Assenze: ferie / permessi / malattia ---
// Salvate sul dipendente come e.leaves = [{id,type,start,end,from,to,note}].
// ferie/malattia = giornate intere su un intervallo start..end.
// permesso = un solo giorno (start=end) con fascia oraria from..to.
function leavesOf(e){ return (e && Array.isArray(e.leaves)) ? e.leaves : []; }
const leaveLabels={ferie:"Ferie", permesso:"Permesso", malattia:"Malattia"};

// Data ISO (YYYY-MM-DD) del giorno Lun..Dom nella settimana attiva.
function dateForDay(day){
  const i=days.indexOf(day);
  if(i<0) return null;
  return isoDate(dayDatesOf(currentWeekKey)[i]);
}
// Assenza a giornata intera (ferie/malattia) che copre quella data.
function fullDayLeaveOn(e, iso){
  return leavesOf(e).find(l=>(l.type==="ferie"||l.type==="malattia") && iso>=l.start && iso<=(l.end||l.start)) || null;
}
// Permesso a ore in quella data.
function partialLeaveOn(e, iso){
  return leavesOf(e).find(l=>l.type==="permesso" && iso>=l.start && iso<=(l.end||l.start)) || null;
}
// Qualsiasi assenza in quella data (per la visualizzazione).
function leaveOn(e, iso){ return fullDayLeaveOn(e,iso) || partialLeaveOn(e,iso); }
function fullDayLeaveOnDay(e, day){ const iso=dateForDay(day); return iso? fullDayLeaveOn(e,iso):null; }
function partialLeaveOnDay(e, day){ const iso=dateForDay(day); return iso? partialLeaveOn(e,iso):null; }
function leaveOnDay(e, day){ const iso=dateForDay(day); return iso? leaveOn(e,iso):null; }

// Ore giornaliere "tipiche": ore settimanali diviso i giorni normalmente
// lavorati (esclusa la domenica e il riposo fisso).
function typicalDailyHours(e){
  const workDays=genDays.filter(d=>!(e.rest && e.rest===d)).length;
  return workDays>0 ? maxWeeklyHours(e)/workDays : 0;
}
// Ore da scalare per assenze nella settimana attiva: giornate intere valgono
// le ore tipiche, i permessi valgono la durata della fascia.
function leaveHoursThisWeek(e){
  let h=0;
  genDays.forEach(day=>{
    const iso=dateForDay(day);
    if(!iso) return;
    if(fullDayLeaveOn(e,iso)){ h+=typicalDailyHours(e); return; }
    const p=partialLeaveOn(e,iso);
    if(p && p.from && p.to) h+=Math.max(0, hoursBetween(p.from,p.to));
  });
  return h;
}
// Target ore della settimana attiva: ore contrattuali meno le assenze, così
// chi è in ferie non si vede stipare le ore nei giorni rimasti.
function weeklyTarget(e){
  return Math.max(0, Math.round(maxWeeklyHours(e)-leaveHoursThisWeek(e)));
}

// Totale assenze di un dipendente su TUTTE le sue ferie (per il riepilogo).
// Ferie/malattia: contano solo i giorni lavorativi (no domenica né riposo),
// valorizzati con le ore giornaliere tipiche. Permessi: somma delle fasce.
function leaveStats(e){
  let ferieDays=0, ferieHours=0, permessoHours=0, malattiaDays=0, malattiaHours=0;
  const daily=typicalDailyHours(e);
  leavesOf(e).forEach(l=>{
    if(l.type==="permesso"){
      if(l.from && l.to) permessoHours+=Math.max(0, hoursBetween(l.from,l.to));
      return;
    }
    let cur=keyToDate(l.start); const end=keyToDate(l.end||l.start);
    while(cur<=end){
      const dayName=days[(cur.getDay()+6)%7];
      const workday = dayName!=="Dom" && !(e.rest && e.rest===dayName);
      if(workday){
        if(l.type==="ferie"){ ferieDays++; ferieHours+=daily; }
        else if(l.type==="malattia"){ malattiaDays++; malattiaHours+=daily; }
      }
      cur.setDate(cur.getDate()+1);
    }
  });
  const r=n=>Math.round(n*10)/10;
  return {ferieDays, ferieHours:r(ferieHours), permessoHours:r(permessoHours), malattiaDays, malattiaHours:r(malattiaHours)};
}
function getStoreWorkers(storeId){ return employees.filter(e=>canWorkIn(e,storeId)); }
function workerPriority(e, storeId){
  return (e.isExtra ? 1000 : 0) + (e.primaryStoreId===storeId ? 0 : 100);
}
// Quante "trasferte" ha già il dipendente questa settimana: turni in negozi
// diversi dal suo principale. Serve a ruotare equamente chi copre i buchi
// fuori sede, invece di mandare sempre la stessa persona.
function awayShiftCount(eid){
  const emp=employees.find(e=>e.id===eid);
  if(!emp) return 0;
  let n=0;
  stores.forEach(st=>{
    if(st.id===emp.primaryStoreId) return;
    days.forEach(d=>{ if(schedule[st.id]?.[eid]?.[d]) n++; });
  });
  return n;
}
function canWorkDay(e, day){
  if(day==="Dom") return false;
  if(e.rest && e.rest===day) return false;
  if(fullDayLeaveOnDay(e,day)) return false; // ferie / malattia: giornata intera
  return true;
}
// Un permesso a ore lascia il dipendente disponibile nel resto del giorno:
// un turno è valido solo se non si sovrappone alla fascia del permesso.
function shiftClearsPartialLeave(e,day,shift){
  const p=partialLeaveOnDay(e,day);
  if(!p || !p.from || !p.to) return true;
  const window={start:p.from, end:p.to};
  return !(shift.segments||[]).some(seg=>overlaps(seg,window));
}
// Un turno è in conflitto con un'assenza (settimana attiva): ferie/malattia
// coprono tutta la giornata, il permesso solo se il turno si sovrappone.
function shiftConflictsWithLeave(e,day,shift){
  if(fullDayLeaveOnDay(e,day)) return true;
  return !shiftClearsPartialLeave(e,day,shift);
}
// Rimuove, in TUTTE le settimane salvate, i turni in conflitto con le assenze
// del dipendente — anche quelli bloccati a mano: l'assenza vince sempre.
function pruneShiftsForEmployeeLeaves(e){
  Object.entries(schedules).forEach(([wk,wsched])=>{
    const wkDates=dayDatesOf(wk);
    days.forEach((day,i)=>{
      const iso=isoDate(wkDates[i]);
      const full=fullDayLeaveOn(e,iso);
      const part=partialLeaveOn(e,iso);
      if(!full && !part) return;
      stores.forEach(st=>{
        const cell=wsched[st.id]&&wsched[st.id][e.id];
        const sh=cell&&cell[day];
        if(!sh) return;
        if(full){ cell[day]=null; return; }
        if(part && part.from && part.to){
          const overlapsBand=(sh.segments||[]).some(seg=>overlaps(seg,{start:part.from,end:part.to}));
          if(overlapsBand) cell[day]=null;
        }
      });
    });
  });
}
function employeeMissingHours(e){ return weeklyTarget(e)-employeeTotal(e.id); }
function canAssignShiftStrict(storeId,e,day,shift){
  if(!canWorkDay(e,day)) return false;
  if(!shiftClearsPartialLeave(e,day,shift)) return false;
  if(schedule[storeId]?.[e.id]?.[day]) return false;
  if(hasShiftElsewhere(storeId,e.id,day)) return false;
  return employeeTotal(e.id)+shift.workedHours<=weeklyTarget(e);
}
function clearGeneratedScheduleForStore(storeId){
  // I dipendenti "solo manuale" non vengono mai toccati dalla generazione:
  // i loro turni restano quelli impostati a mano finché non li si cambia
  // dall'editor. I singoli turni bloccati (impostati a mano) vengono
  // preservati anche per i dipendenti normali.
  getStoreWorkers(storeId).filter(e=>!e.manual).forEach(e=>{
    schedule[storeId]=schedule[storeId]||{};
    const cur=schedule[storeId][e.id]||{};
    // Preserva i turni bloccati, tranne quelli in conflitto con un'assenza:
    // in quel caso l'assenza vince e il turno viene rimosso.
    schedule[storeId][e.id]=Object.fromEntries(days.map(d=>{
      const keep = cur[d] && cur[d].locked && !shiftConflictsWithLeave(e,d,cur[d]);
      return [d, keep ? cur[d] : null];
    }));
  });
}
function buildShiftFromSegments(segments,e){
  segments=segments.slice().sort((a,b)=>toMin(a.start)-toMin(b.start));
  const rawWork=segments.reduce((s,x)=>s+hoursBetween(x.start,x.end),0);
  const pauseHours=Number(e.pauseHours||0);

  // Turno da 8h con pausa di qualsiasi durata:
  // presenza = 8h lavorate + pausa, con lavoro prima e dopo la pausa.
  if(rawWork===8 && pauseHours>0){
    const normalized=normalizeEightHourShiftWithPause(segments,pauseHours);
    return {
      segments:normalized.segments,
      time:normalized.time,
      workedHours:8,
      pause:normalized.pauseLabel,
      pauseStart:normalized.pauseStart,
      pauseEnd:normalized.pauseEnd
    };
  }

  return {
    segments,
    time:segments.map(x=>x.start+"-"+x.end).join(" / "),
    workedHours:rawWork,
    pause:"No",
    pauseStart:null,
    pauseEnd:null
  };
}

function normalizeEightHourShiftWithPause(segments,pauseHours){
  segments=segments.slice().sort((a,b)=>toMin(a.start)-toMin(b.start));

  // Caso spezzato: la pausa è il buco tra le due sessioni.
  // Esempio 09-13 / 16-20 = 8h lavoro, pausa 13-16.
  if(segments.length>1){
    const firstEnd=segments[0].end;
    const secondStart=segments[1].start;
    return {
      segments,
      time:segments.map(x=>x.start+"-"+x.end).join(" / "),
      pauseLabel:firstEnd+"-"+secondStart,
      pauseStart:firstEnd,
      pauseEnd:secondStart
    };
  }

  // Caso continuato:
  // 8h di lavoro distribuite come 4h prima della pausa + 4h dopo pausa.
  // La pausa può essere 1h, 2h, 4h, ecc.
  const start=toMin(segments[0].start);
  const pauseStart=start+4*60;
  const pauseEnd=pauseStart+pauseHours*60;
  const presenceEnd=start+(8+pauseHours)*60;

  const first={start:segments[0].start,end:toTime(pauseStart)};
  const second={start:toTime(pauseEnd),end:toTime(presenceEnd)};

  return {
    segments:[first,second],
    time:segments[0].start+"-"+toTime(presenceEnd),
    pauseLabel:toTime(pauseStart)+"-"+toTime(pauseEnd),
    pauseStart:toTime(pauseStart),
    pauseEnd:toTime(pauseEnd)
  };
}

// Turno continuato da 8h: la pausa non è fissa a metà, ma può cadere in
// più posizioni (almeno 1h di lavoro prima e dopo). Così la generazione e
// l'editor manuale possono scegliere l'orario di pausa che NON lascia buchi
// nel negozio (es. mettere la pausa quando c'è già un collega presente).
function buildEightHourContinuousVariants(startMin,pauseHours){
  const variants=[];
  const presenceEnd=startMin+(8+pauseHours)*60;

  for(let workBefore=1;workBefore<=7;workBefore++){
    const pauseStart=startMin+workBefore*60;
    const pauseEnd=pauseStart+pauseHours*60;
    if(pauseEnd>=presenceEnd) break;

    const first={start:toTime(startMin),end:toTime(pauseStart)};
    const second={start:toTime(pauseEnd),end:toTime(presenceEnd)};

    variants.push({
      segments:[first,second],
      time:toTime(startMin)+"-"+toTime(presenceEnd),
      workedHours:8,
      pause:toTime(pauseStart)+"-"+toTime(pauseEnd),
      pauseStart:toTime(pauseStart),
      pauseEnd:toTime(pauseEnd)
    });
  }

  return variants;
}

// Turni spezzati da 8h con pausa lunga (es. 3h): 8h lavorate ma con uno
// stacco lungo in mezzo, per coprire apertura + chiusura lasciando il centro
// giornata ai colleghi. Genera tutte le posizioni valide a ogni orario di
// inizio che entra nell'orario del negozio. Solo negozi a sessione unica
// (continuati) e per chi può fare le 8h; i negozi già spezzati non servono.
function buildSplitShiftVariants(store,e,pauseHours){
  if(!store || (store.sessions||[]).length!==1) return [];
  if(!allowedHours(e).includes(8)) return [];
  const sess=store.sessions[0];
  const sStart=toMin(sess.start), sEnd=toMin(sess.end);
  const presence=(8+pauseHours)*60;
  const minSeg=MIN_SPLIT_SEGMENT*60; // ogni tratto di lavoro almeno 3h
  const out=[];
  for(let start=sStart; start+presence<=sEnd; start+=30){
    buildEightHourContinuousVariants(start,pauseHours).forEach(v=>{
      const s1=toMin(v.segments[0].end)-toMin(v.segments[0].start);
      const s2=toMin(v.segments[1].end)-toMin(v.segments[1].start);
      if(s1>=minSeg && s2>=minSeg && isShiftInsideStore(v,store)) out.push(v);
    });
  }
  return out;
}

function shiftCovers(sh,band){
  return shiftFullyCovers(sh,band);
}

function requiredBands(store){
  return requiredCoverageSlots(store);
}

function coverage(storeId,day,band){
  return employees.filter(e=>canWorkIn(e,storeId)).filter(e=>shiftCovers(schedule[storeId]?.[e.id]?.[day],band)).length;
}

function shiftOptionsForStore(store,e){
  const opts=[];
  const allowed=allowedHours(e);

  // Negozio spezzato: l'intera giornata spezzata è valida se le ore lavorate coincidono.
  if(store.sessions.length>1){
    const total=store.sessions.reduce((s,x)=>s+hoursBetween(x.start,x.end),0);
    if(allowed.includes(total)){
      const shift=buildShiftFromSegments(store.sessions,e);
      if(isShiftInsideStore(shift,store)) opts.push(shift);
    }
  }

  store.sessions.forEach(session=>{
    const sessionStart=toMin(session.start);
    const sessionEnd=toMin(session.end);

    allowed.forEach(workHours=>{
      const pauseHours=(workHours===8 && Number(e.pauseHours)>0) ? Number(e.pauseHours) : 0;
      const presenceHours=workHours+pauseHours;
      const latestStart=sessionEnd-presenceHours*60;

      if(latestStart<sessionStart) return;

      const starts=new Set([sessionStart, latestStart]);

      // Ancore su fasce speciali e scoperture.
      (store.specialBands||[]).forEach(b=>{
        const bs=toMin(b.start), be=toMin(b.end);
        starts.add(bs);
        starts.add(be-presenceHours*60);
        starts.add(be-workHours*60);
        if(workHours===8 && pauseHours>0){
          starts.add(bs-4*60);
          starts.add(be-(4+pauseHours)*60);
        }
      });

      for(let t=sessionStart;t<=latestStart;t+=60){
        starts.add(t);
      }

      [...starts].forEach(start=>{
        if(start<sessionStart || start>latestStart) return;
        const raw={start:toTime(start),end:toTime(start+workHours*60)};
        const shift=buildShiftFromSegments([raw],e);
        if(isShiftInsideStore(shift,store)) opts.push(shift);
      });
    });
  });

  const seen=new Set();
  return opts.filter(o=>{
    const key=o.time+"|"+o.pause+"|"+o.workedHours;
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Opzioni per l'editor manuale: come shiftOptionsForStore, ma ogni turno
// continuato da 8h viene espanso in tutte le posizioni di pausa possibili,
// così chi assegna a mano può scegliere l'orario di pausa che serve.
function shiftOptionsForEditor(store,e){
  const base=shiftOptionsForStore(store,e);
  const expanded=[];

  base.forEach(o=>{
    const isContinuousEight = o.workedHours===8 && o.pauseStart && o.pauseEnd && (o.segments||[]).length===2;
    if(isContinuousEight){
      const startMin=toMin(o.segments[0].start);
      const pauseHours=(toMin(o.pauseEnd)-toMin(o.pauseStart))/60;
      buildEightHourContinuousVariants(startMin,pauseHours)
        .filter(v=>isShiftInsideStore(v,store))
        .forEach(v=>expanded.push(v));
    }else{
      expanded.push(o);
    }
  });

  const seen=new Set();
  return expanded.filter(o=>{
    const key=o.time+"|"+o.pause+"|"+o.workedHours;
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isShiftInsideStore(shift,store){
  if(!shift)return false;
  return (shift.segments||[]).every(seg=>{
    return store.sessions.some(session=>toMin(seg.start)>=toMin(session.start)&&toMin(seg.end)<=toMin(session.end));
  });
}

function generateStoreSchedule(storeId){
  ensureSchedule();
  const store=stores.find(s=>s.id===storeId);
  if(!store)return;

  clearGeneratedScheduleForStore(storeId);
  applyFixedShiftsForStore(storeId);

  shuffledGenDays().forEach(day=>{
    if(!store.openDays.includes(day)) return;
    const special=(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false}));
    special.forEach(band=>coverBandGeneric(storeId,day,band,true));
  });

  shuffledGenDays().forEach(day=>{
    if(!store.openDays.includes(day)) return;
    const baseBands=store.sessions.flatMap(splitSessionIntoSlots);
    baseBands.forEach(band=>coverBandGeneric(storeId,day,band,false));
  });

  completeMandatoryHoursForStore(storeId);
  repairAllCoverageForStore(storeId);
  completeMandatoryHoursForStore(storeId);
  minimizeResidualGapsForStore(storeId);
  optimizePausePositionsForStore(storeId);

  saveData();
  if(!suppressAutoRender){
    renderAll();
    showNotice("Proposta generata.","ok");
  }
}


function generateAllSchedules(){
  const currentView=document.querySelector(".view.active")?.id || "dashboard";
  const selectedStore=storeSelect.value;

  suppressAutoRender=true;
  ensureSchedule();

  stores.forEach(st=>{
    clearGeneratedScheduleForStore(st.id);
    applyFixedShiftsForStore(st.id);
  });

  shuffle(stores).forEach(st=>{
    shuffledGenDays().forEach(day=>{
      if(!st.openDays.includes(day)) return;
      const special=(st.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false}));
      special.forEach(band=>coverBandGeneric(st.id,day,band,true));
    });
  });

  shuffle(stores).forEach(st=>{
    shuffledGenDays().forEach(day=>{
      if(!st.openDays.includes(day)) return;
      const baseBands=st.sessions.flatMap(splitSessionIntoSlots);
      baseBands.forEach(band=>coverBandGeneric(st.id,day,band,false));
    });
  });

  // Completamento ore cross-negozio: principale prima, secondario solo
  // quando il principale non ha più slot validi per quel giorno.
  completeMandatoryHoursGlobal();

  employees
    .filter(e=>!e.fixedShifts && !e.manual && employeeTotal(e.id)>weeklyTarget(e))
    .forEach(e=>reduceEmployeeHoursGlobal(e));

  stores.forEach(st=>repairAllCoverageForStore(st.id));
  stores.forEach(st=>minimizeResidualGapsForStore(st.id));
  stores.forEach(st=>optimizePausePositionsForStore(st.id));

  saveData();
  suppressAutoRender=false;

  renderAll();

  if(selectedStore && stores.some(s=>s.id===selectedStore)){
    storeSelect.value=selectedStore;
    renderWeek();
  }

  setView(currentView);

  if(currentView==="turni"){
    showNotice("Nuova proposta generata.","ok");
  }
}


function getSelectedSecondaryStores(){
  return [...document.querySelectorAll('#empSecondaryStores input[type="checkbox"]:checked')].map(x=>x.value);
}

function setSelectedSecondaryStores(ids){
  [...document.querySelectorAll('#empSecondaryStores input[type="checkbox"]')].forEach(cb=>{
    cb.checked = ids.includes(cb.value);
  });
}

function renderSecondaryStoreChecks(selected=[]){
  if(typeof empSecondaryStores==="undefined") return;
  const primary=empPrimaryStore.value;
  empSecondaryStores.innerHTML=stores
    .filter(s=>s.id!==primary)
    .map(s=>`<label class="check-row"><input type="checkbox" value="${s.id}" ${selected.includes(s.id)?"checked":""}> ${s.name}</label>`)
    .join("") || `<span class="muted">Nessun altro negozio</span>`;
}

function shiftTypeLabel(type){
  if(type==="8") return "Solo 8 ore";
  if(type==="6") return "Solo 6 ore";
  if(type==="6-8") return "6 o 8 ore";
  if(type==="4-5") return "4 o 5 ore";
  if(type==="fixed") return "Turno fisso";
  return type;
}

function buildFixedShiftFields(existing={},restValue=""){
  const dayNames={Lun:"Lunedì",Mar:"Martedì",Mer:"Mercoledì",Gio:"Giovedì",Ven:"Venerdì",Sab:"Sabato"};
  const restOptions=`<option value="">Nessuno</option>`+genDays.map(d=>`<option value="${d}" ${restValue===d?"selected":""}>${dayNames[d]}</option>`).join("");
  fixedShiftFields.innerHTML=`<div class="fixed-day"><label>Giorno di riposo<select id="fixedRest">${restOptions}</select></label></div>`+genDays.map(d=>{
    const f=existing[d]||{};
    return `<div class="fixed-day">
      <h3>${dayNames[d]}</h3>
      <div class="time-row">
        <label>Dalle<input class="fixed-start" data-day="${d}" type="time" value="${f.start||""}"></label>
        <label>Alle<input class="fixed-end" data-day="${d}" type="time" value="${f.end||""}"></label>
      </div>
      <label class="check-row"><input class="fixed-has-pause" data-day="${d}" type="checkbox" ${f.pauseStart&&f.pauseEnd?"checked":""}> Pausa</label>
      <div class="time-row fixed-pause-row" data-day="${d}" style="display:${f.pauseStart&&f.pauseEnd?"grid":"none"}">
        <label>Pausa dalle<input class="fixed-pause-start" data-day="${d}" type="time" value="${f.pauseStart||""}"></label>
        <label>Pausa alle<input class="fixed-pause-end" data-day="${d}" type="time" value="${f.pauseEnd||""}"></label>
      </div>
    </div>`;
  }).join("");

  document.querySelectorAll(".fixed-has-pause").forEach(cb=>{
    cb.onchange=()=>{
      const row=document.querySelector(`.fixed-pause-row[data-day="${cb.dataset.day}"]`);
      if(row) row.style.display=cb.checked?"grid":"none";
    };
  });
}

function collectFixedShifts(){
  const fixed={};
  genDays.forEach(d=>{
    const start=document.querySelector(`.fixed-start[data-day="${d}"]`)?.value;
    const end=document.querySelector(`.fixed-end[data-day="${d}"]`)?.value;
    if(!start&&!end) return;
    if(!start||!end) throw new Error(`Completa inizio e fine per ${d}`);
    const hasPause=document.querySelector(`.fixed-has-pause[data-day="${d}"]`)?.checked;
    const pauseStart=document.querySelector(`.fixed-pause-start[data-day="${d}"]`)?.value;
    const pauseEnd=document.querySelector(`.fixed-pause-end[data-day="${d}"]`)?.value;
    if(hasPause && (!pauseStart||!pauseEnd)) throw new Error(`Completa la pausa per ${d}`);
    fixed[d]={start,end,pauseStart:hasPause?pauseStart:null,pauseEnd:hasPause?pauseEnd:null};
  });
  return fixed;
}

function fixedShiftToShift(f){
  if(!f) return null;
  let segments;
  let worked;
  if(f.pauseStart&&f.pauseEnd){
    segments=[{start:f.start,end:f.pauseStart},{start:f.pauseEnd,end:f.end}];
    worked=hoursBetween(f.start,f.pauseStart)+hoursBetween(f.pauseEnd,f.end);
  }else{
    segments=[{start:f.start,end:f.end}];
    worked=hoursBetween(f.start,f.end);
  }
  return {
    segments,
    time:segments.map(x=>x.start+"-"+x.end).join(" / "),
    workedHours:worked,
    pause:f.pauseStart&&f.pauseEnd?`${f.pauseStart}-${f.pauseEnd}`:"No",
    pauseStart:f.pauseStart||null,
    pauseEnd:f.pauseEnd||null,
    fixed:true
  };
}

function fixedShiftInsideStore(f,store){
  const sh=fixedShiftToShift(f);
  return sh && isShiftInsideStore(sh,store);
}

function renderOptions(){
  const selectedStore = storeSelect.value;
  const selectedPrimary = empPrimaryStore.value;
  const selectedSecondaries = getSelectedSecondaryStores ? getSelectedSecondaryStores() : [];
  const selectedProfile = typeof empProfile!=="undefined" ? empProfile.value : "";

  let opts=stores.map(s=>`<option value="${s.id}">${s.name}</option>`).join("");
  storeSelect.innerHTML=opts;
  empPrimaryStore.innerHTML=`<option value="">Nessuno (gira su più negozi, es. direttore)</option>`+opts;

  if(typeof empProfile!=="undefined"){
    empProfile.innerHTML=employeeProfiles.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
    if(selectedProfile && employeeProfiles.some(p=>p.id===selectedProfile)) empProfile.value=selectedProfile;
  }

  if(selectedStore && stores.some(s=>s.id===selectedStore)) storeSelect.value=selectedStore;
  if(selectedPrimary && stores.some(s=>s.id===selectedPrimary)) empPrimaryStore.value=selectedPrimary;

  renderSecondaryStoreChecks(selectedSecondaries);

  // Selettore "Chi sei?" della vista dipendente: ordine alfabetico,
  // selezione ricordata tra le sessioni.
  const empView=document.getElementById("empViewSelect");
  if(empView){
    const prev=empView.value || localStorage.getItem("am134_empview") || "";
    const ordered=employees.slice().sort((a,b)=>a.name.localeCompare(b.name));
    empView.innerHTML=`<option value="">— seleziona il tuo nome —</option>`+
      ordered.map(e=>`<option value="${e.id}">${e.name}</option>`).join("");
    if(prev && employees.some(e=>e.id===prev)) empView.value=prev;
  }

  // Selettore dipendente nella sezione Ferie.
  const leaveEmp=document.getElementById("leaveEmp");
  if(leaveEmp){
    const prevL=leaveEmp.value;
    const ordered=employees.slice().sort((a,b)=>a.name.localeCompare(b.name));
    leaveEmp.innerHTML=ordered.map(e=>`<option value="${e.id}">${e.name}</option>`).join("");
    if(prevL && employees.some(e=>e.id===prevL)) leaveEmp.value=prevL;
  }
}

function renderWeekHeader(){
  const dates=dayDatesOf(currentWeekKey);
  const head=document.getElementById("weekHead");
  if(head){
    head.innerHTML=`<th>Dipendente</th>`+
      days.map((d,i)=>`<th>${d} ${dates[i].getDate()}</th>`).join("")+
      `<th>Ore</th>`;
  }
  const label=document.getElementById("weekLabel");
  if(label) label.textContent=formatWeekRange(currentWeekKey);
  const jump=document.getElementById("weekJump");
  if(jump) jump.value=currentWeekKey;
}

function renderWeek(){
  ensureSchedule();
  renderWeekHeader();
  const storeId=storeSelect.value||stores[0]?.id;
  if(!storeId)return;
  const workers=employees.filter(e=>canWorkIn(e,storeId));

  weekBody.innerHTML=workers.map(e=>{
    const tot=employeeTotal(e.id), tgt=weeklyTarget(e);
    return `<tr><td>${e.name}</td>${days.map(d=>cell(storeId,e,d)).join("")}<td><span class="hours ${tot>tgt?'over':tot===tgt?'ok':''}">${tot}/${tgt}h</span></td></tr>`;
  }).join("")||`<tr><td colspan="9">Nessun dipendente</td></tr>`;

  renderDays();

  document.querySelectorAll(".editable-cell").forEach(cell=>{
    cell.onclick=()=>openShiftEditor(cell.dataset.store, cell.dataset.employee, cell.dataset.day);
  });
}

function cell(storeId,e,d){
  const sh=schedule[storeId]?.[e.id]?.[d];
  const lock = sh&&sh.locked ? ` <span class="lock" title="Turno bloccato: la generazione non lo modifica">🔒</span>` : "";
  const lv=leaveOnDay(e,d);
  let content;
  if(sh){
    content=`<span class="shift${sh.locked?" locked":""}">${sh.time}${lock}</span>${sh.pause && sh.pause!=="No"?`<span class="note">Pausa ${sh.pause}</span>`:""}`;
    if(lv && lv.type==="permesso") content+=`<span class="note">Permesso ${lv.from}-${lv.to}</span>`;
  }else if(lv){
    content=leaveBadge(lv);
  }else{
    content=`<span class="muted">${e.rest===d?'Riposo':'—'}</span>`;
  }
  return `<td class="editable-cell" data-store="${storeId}" data-employee="${e.id}" data-day="${d}">${content}</td>`;
}

function leaveBadge(lv){
  const extra=lv.type==="permesso" && lv.from ? ` ${lv.from}-${lv.to}` : "";
  return `<span class="leave leave-${lv.type}">${leaveLabels[lv.type]||"Assenza"}${extra}</span>`;
}

function renderDays(){
  const storeId=storeSelect.value||stores[0]?.id;
  const workers=employees.filter(e=>canWorkIn(e,storeId));
  const dates=dayDatesOf(currentWeekKey);

  storeDays.innerHTML=days.map((d,i)=>{
    const rows=workers.map(e=>[e,schedule[storeId]?.[e.id]?.[d]])
      .filter(x=>x[1])
      .sort((a,b)=>a[1].time.localeCompare(b[1].time))
      .map(([e,s])=>`<div class="person editable-person" data-store="${storeId}" data-employee="${e.id}" data-day="${d}"><strong>${e.name}</strong><span>${s.time}${s.locked?" 🔒":""}</span></div>`)
      .join("");

    return `<div class="day"><h3>${d} ${dates[i].getDate()}</h3>${rows||'<span class="muted">—</span>'}</div>`;
  }).join("");

  document.querySelectorAll(".editable-person").forEach(item=>{
    item.onclick=()=>openShiftEditor(item.dataset.store, item.dataset.employee, item.dataset.day);
  });
}

// Vista "Il mio turno": il dipendente sceglie il suo nome e vede la propria
// settimana con TUTTI i turni, uniti da tutti i negozi in cui lavora (chi sta
// su più PDV li trova in un'unica interfaccia, con il negozio indicato).
function renderEmployeeView(){
  const sel=document.getElementById("empViewSelect");
  const label=document.getElementById("empViewLabel");
  const jump=document.getElementById("empViewJump");
  const summary=document.getElementById("empViewSummary");
  const daysBox=document.getElementById("empViewDays");
  if(!daysBox) return;

  if(label) label.textContent=formatWeekRange(currentWeekKey);
  if(jump) jump.value=currentWeekKey;

  const eid=sel?.value;
  const e=employees.find(x=>x.id===eid);
  if(!e){
    if(summary) summary.innerHTML="";
    daysBox.innerHTML=`<p class="muted" style="padding:8px">Seleziona il tuo nome per vedere i tuoi turni della settimana.</p>`;
    return;
  }

  const dates=dayDatesOf(currentWeekKey);
  const total=employeeTotal(e.id);

  // Ripartizione ore per negozio (solo dove lavora davvero questa settimana).
  const perStore=stores.map(st=>{
    let h=0; days.forEach(d=>h+=shiftHours(schedule[st.id]?.[e.id]?.[d]));
    return {name:st.name, h};
  }).filter(x=>x.h>0);

  // Conteggio assenze della settimana attiva, per tipo.
  const absCount={};
  genDays.forEach(d=>{ const lv=leaveOnDay(e,d); if(lv) absCount[lv.type]=(absCount[lv.type]||0)+1; });

  if(summary){
    const target=weeklyTarget(e);
    const storeChips=perStore.map(s=>`<span class="tag">${s.name}: ${s.h}h</span>`).join("");
    const absChips=Object.entries(absCount).map(([t,n])=>`<span class="tag leave-tag leave-${t}">${leaveLabels[t]}: ${n} ${n===1?'giorno':'giorni'}</span>`).join("");
    const chips=(storeChips+absChips) || `<span class="muted">Nessun turno questa settimana</span>`;
    summary.innerHTML=`<div class="emp-summary-head"><strong>${e.name}</strong>`+
      `<span class="hours ${total>=target?'ok':''}">${total}/${target}h</span></div>`+
      `<div class="emp-summary-stores">${chips}</div>`;
  }

  daysBox.innerHTML=days.map((d,i)=>{
    const items=stores
      .map(st=>[st,schedule[st.id]?.[e.id]?.[d]])
      .filter(x=>x[1])
      .sort((a,b)=>a[1].time.localeCompare(b[1].time));
    const lv=leaveOnDay(e,d);

    let inner;
    if(items.length){
      inner=items.map(([st,s])=>`<div class="person"><strong>${st.name}</strong><span>${s.time}</span>${s.pause&&s.pause!=="No"?`<small class="note">Pausa ${s.pause}</small>`:""}</div>`).join("");
      if(lv && lv.type==="permesso") inner+=`<div class="note">Permesso ${lv.from}-${lv.to}</div>`;
    }else if(lv){
      inner=leaveBadge(lv);
    }else{
      inner=`<span class="muted">${e.rest===d?'Riposo':'—'}</span>`;
    }

    return `<div class="day"><h3>${d} ${dates[i].getDate()}</h3>${inner}</div>`;
  }).join("");
}


// --- Sezione Ferie / assenze ---
function leaveTypeIsPartial(t){ return t==="permesso"; }

function updateLeaveFormFields(){
  const t=document.getElementById("leaveType")?.value;
  const hoursRow=document.getElementById("leaveHoursRow");
  const endField=document.getElementById("leaveEndField");
  if(!hoursRow||!endField) return;
  const partial=leaveTypeIsPartial(t);
  hoursRow.style.display=partial?"grid":"none";
  endField.style.display=partial?"none":"grid";
}

function formatDateShort(iso){
  const d=keyToDate(iso);
  return `${d.getDate()} ${monthsShort[d.getMonth()]} ${d.getFullYear()}`;
}
function formatLeaveWhen(l){
  if(l.type==="permesso") return `${formatDateShort(l.start)} · ${l.from}-${l.to}`;
  return l.start===l.end ? formatDateShort(l.start) : `${formatDateShort(l.start)} → ${formatDateShort(l.end)}`;
}

function addLeave(ev){
  ev.preventDefault();
  const emp=employees.find(x=>x.id===document.getElementById("leaveEmp").value);
  if(!emp){ showNotice("Seleziona un dipendente.","warn"); return; }
  const type=document.getElementById("leaveType").value;
  const start=document.getElementById("leaveStart").value;
  if(!start){ showNotice("Indica la data di inizio.","warn"); return; }
  const note=document.getElementById("leaveNote").value.trim();
  const leave={id:"lv_"+Date.now().toString().slice(-6), type, start, end:start, note};

  if(leaveTypeIsPartial(type)){
    const from=document.getElementById("leaveFrom").value;
    const to=document.getElementById("leaveTo").value;
    if(!from||!to||toMin(to)<=toMin(from)){ showNotice("Fascia oraria del permesso non valida.","warn"); return; }
    leave.from=from; leave.to=to; // permesso: un solo giorno
  }else{
    const end=document.getElementById("leaveEnd").value||start;
    if(end<start){ showNotice("La data finale è prima di quella iniziale.","warn"); return; }
    leave.end=end;
  }

  emp.leaves=leavesOf(emp).concat(leave);
  // L'assenza vince: rimuove subito i turni in conflitto in tutte le settimane
  // (anche quelli bloccati a mano).
  pruneShiftsForEmployeeLeaves(emp);
  saveData();
  renderAll();
  showNotice("Assenza aggiunta. Turni in conflitto rimossi; rigenera per ricoprire i buchi.","ok");
  document.getElementById("leaveNote").value="";
}

function deleteLeave(empId, leaveId){
  const emp=employees.find(x=>x.id===empId);
  if(!emp) return;
  emp.leaves=leavesOf(emp).filter(l=>l.id!==leaveId);
  saveData();
  renderAll();
  showNotice("Assenza rimossa. Rigenera la proposta.","warn");
}

function renderLeaves(){
  const box=document.getElementById("leaveList");
  if(!box) return;
  const rows=[];
  employees.forEach(e=>leavesOf(e).forEach(l=>rows.push({e,l})));
  rows.sort((a,b)=>a.l.start.localeCompare(b.l.start) || a.e.name.localeCompare(b.e.name));
  box.innerHTML=rows.length ? rows.map(({e,l})=>`
    <div class="leave-row">
      <span class="leave leave-${l.type}">${leaveLabels[l.type]||"Assenza"}</span>
      <div class="leave-info"><strong>${e.name}</strong><span>${formatLeaveWhen(l)}${l.note?` · ${l.note}`:""}</span></div>
      <button class="delete" onclick="deleteLeave('${e.id}','${l.id}')">Elimina</button>
    </div>`).join("") : `<p class="muted">Nessuna assenza registrata.</p>`;

  renderLeaveStats();
}

// Riepilogo per dipendente: quante ferie/permessi/malattia ha fatto.
function renderLeaveStats(){
  const body=document.getElementById("leaveStatsBody");
  if(!body) return;
  const ordered=employees.slice().sort((a,b)=>a.name.localeCompare(b.name));
  body.innerHTML=ordered.map(e=>{
    const s=leaveStats(e);
    const ferie = s.ferieDays ? `${s.ferieDays} ${s.ferieDays===1?'giorno':'giorni'} · <strong>${s.ferieHours}h</strong>` : "—";
    const permessi = s.permessoHours ? `<strong>${s.permessoHours}h</strong>` : "—";
    const malattia = s.malattiaDays ? `${s.malattiaDays} ${s.malattiaDays===1?'giorno':'giorni'} · ${s.malattiaHours}h` : "—";
    return `<tr><td>${e.name}</td><td>${ferie}</td><td>${permessi}</td><td>${malattia}</td></tr>`;
  }).join("") || `<tr><td colspan="4">Nessun dipendente</td></tr>`;
}

function resetEmployeeForm(){
  employeeForm.reset();
  editingEmployeeId.value="";
  employeeSubmitBtn.textContent="Salva dipendente";
  employeeCancelBtn.style.display="none";
  if(typeof empProfile!=="undefined"){
    empProfile.value="standard_40";
    applySelectedProfile();
  }
  renderSecondaryStoreChecks([]);
}

function editEmployee(id){
  const e=employees.find(x=>x.id===id);
  if(!e)return;
  editingEmployeeId.value=e.id;
  empName.value=e.name;
  empPrimaryStore.value=e.primaryStoreId;
  empProfile.value=e.profileId || "standard_40";
  applySelectedProfile();
  empHours.value=e.weeklyHours;
  empRest.value=e.rest||"";
  empType.value=e.type;
  empPause.value=e.pauseHours||0;
  empManualOnly.checked=!!e.manual;
  renderSecondaryStoreChecks(e.secondaryStoreIds||[]);
  if(e.fixedShifts){
    buildFixedShiftFields(e.fixedSchedule||{}, e.rest||"");
  }
  employeeSubmitBtn.textContent="Aggiorna dipendente";
  employeeCancelBtn.style.display="inline-block";
  setView("dipendenti");
}

function renderEmployees(){
  const table=document.getElementById("employeeTable");
  if(!table) return;

  table.innerHTML=employees.map(e=>{
    const primary=stores.find(s=>s.id===e.primaryStoreId)?.name||"Nessuno";
    const profile=getProfile(e.profileId);
    const label=shiftTypeLabel(e.type);
    return `<tr>
      <td><strong>${e.name}</strong></td>
      <td>${profile.name}${e.isExtra?' · Extra':''}${e.manual?' · Manuale':''}</td>
      <td>${primary}</td>
      <td>${e.weeklyHours}</td>
      <td>${e.rest||"Nessuno"}</td>
      <td>${label}</td>
      <td>
        <button onclick="editEmployee('${e.id}')">Modifica</button>
        <button class="delete" onclick="deleteEmployee('${e.id}')">Elimina</button>
      </td>
    </tr>`;
  }).join("") || `<tr><td colspan="7">Nessun dipendente creato</td></tr>`;
}


function resetStoreForm(){
  storeForm.reset();
  editingStoreId.value="";
  storeSubmitBtn.textContent="Salva negozio";
  storeCancelBtn.style.display="none";
  specialBands.innerHTML="";
}

function editStore(id){
  const s=stores.find(x=>x.id===id);
  if(!s)return;
  editingStoreId.value=s.id;
  storeName.value=s.name;
  document.querySelectorAll('input[name="openDays"]').forEach(cb=>cb.checked=s.openDays.includes(cb.value));
  scheduleType.value=s.sessions.length>1?"split":"continuous";
  splitRow.style.display=s.sessions.length>1?"grid":"none";
  openStart1.value=s.sessions[0]?.start||"09:00";
  openEnd1.value=s.sessions[0]?.end||"20:00";
  openStart2.value=s.sessions[1]?.start||"16:00";
  openEnd2.value=s.sessions[1]?.end||"20:00";
  specialBands.innerHTML="";
  (s.specialBands||[]).forEach(b=>addSpecialBandRow(b));
  storeSubmitBtn.textContent="Aggiorna negozio";
  storeCancelBtn.style.display="inline-block";
  setView("negozi");
}

function renderStores(){
  storeCards.innerHTML=stores.map(s=>{
    return `<div class="panel"><h2>${s.name}</h2>
      <p><strong>Giorni:</strong> ${s.openDays.join(", ")}</p>
      <p><strong>Orari:</strong><br>${s.sessions.map(x=>x.start+"-"+x.end).join("<br>")}</p>
      <p><strong>Fasce speciali:</strong><br>${s.specialBands.map(x=>x.start+"-"+x.end+" → "+x.min+" persone").join("<br>")||"—"}</p>
      <button onclick="editStore('${s.id}')">Modifica</button>
      <button class="delete" onclick="deleteStore('${s.id}')">Elimina</button>
    </div>`;
  }).join("");
}

function renderDashboard(){
  dashboardCards.innerHTML=stores.map(s=>{
    const workers=employees.filter(e=>canWorkIn(e,s.id));
    return `<div class="card"><span>${s.name}</span><strong>${workers.length} dipendenti</strong><small>${workers.reduce((a,e)=>a+e.weeklyHours,0)} ore disponibili</small></div>`;
  }).join("");

  hoursSummary.innerHTML=employees.map(e=>{
    const h=employeeTotal(e.id);
    const tgt=weeklyTarget(e);
    const p=tgt>0?Math.min(100,Math.round(h/tgt*100)):0;
    return `<div class="progressrow"><header><span>${e.name}</span><span>${h}/${tgt}h</span></header><div class="progress"><span style="width:${p}%"></span></div></div>`;
  }).join("")||"Nessun dipendente";

  renderDashboardCalendar();
  renderTurniIssues();
}

// Stato di un negozio in un giorno: chiuso, coperto, oppure con buchi.
// Usato dal calendario riepilogativo in Dashboard.
function storeDayInfo(storeId,day){
  const store=stores.find(s=>s.id===storeId);
  if(!store || !store.openDays.includes(day)) return {state:"closed",count:0};
  const bands=[
    ...(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false})),
    ...store.sessions.flatMap(splitSessionIntoSlots)
  ];
  const gap=bands.some(b=>coverage(storeId,day,b)<b.min);
  const count=employees.filter(e=>schedule[storeId]?.[e.id]?.[day]).length;
  return {state:gap?"gap":"ok", count};
}

// Calendario settimanale d'insieme: una riga per negozio, una colonna per
// giorno, con quante persone sono in turno e un avviso se resta un buco.
// Cliccando una cella si salta alla vista Turni di quel negozio.
function renderDashboardCalendar(){
  const dates=dayDatesOf(currentWeekKey);
  const head=document.getElementById("dashWeekHead");
  if(head){
    head.innerHTML=`<th>Negozio</th>`+days.map((d,i)=>`<th>${d} ${dates[i].getDate()}</th>`).join("");
  }
  const body=document.getElementById("dashWeekBody");
  if(body){
    body.innerHTML=stores.map(st=>{
      const cells=days.map(d=>{
        const info=storeDayInfo(st.id,d);
        if(info.state==="closed") return `<td class="dc closed">—</td>`;
        const mark=info.state==="gap"?` <span class="warnmark">!</span>`:"";
        const title=`${info.count} in turno${info.state==="gap"?" · manca copertura":""}`;
        return `<td class="dc ${info.state}" data-store="${st.id}" title="${title}">${info.count}${mark}</td>`;
      }).join("");
      return `<tr><td class="dc-name">${st.name}</td>${cells}</tr>`;
    }).join("")||`<tr><td colspan="8">Nessun negozio</td></tr>`;

    body.querySelectorAll("td.dc[data-store]").forEach(td=>{
      td.onclick=()=>{
        if(storeSelect) storeSelect.value=td.dataset.store;
        setView("turni");
        renderWeek();
        renderTurniIssues();
      };
    });
  }
  const label=document.getElementById("dashWeekLabel");
  if(label) label.textContent=formatWeekRange(currentWeekKey);
  const jump=document.getElementById("dashWeekJump");
  if(jump) jump.value=currentWeekKey;
}



function applyFixedShiftsForStore(storeId){
  const store=stores.find(s=>s.id===storeId);
  getStoreWorkers(storeId).filter(e=>e.fixedShifts).forEach(e=>{
    schedule[storeId][e.id]=Object.fromEntries(days.map(d=>[d,null]));
    Object.entries(e.fixedSchedule||{}).forEach(([day,f])=>{
      if(day==="Dom")return;
      if(fullDayLeaveOnDay(e,day))return;              // ferie/malattia: niente turno
      const sh=fixedShiftToShift(f);
      if(sh && !shiftClearsPartialLeave(e,day,sh))return; // permesso: turno che si sovrappone
      if(sh && isShiftInsideStore(sh,store)){
        schedule[storeId][e.id][day]=sh;
      }
    });
  });
}

function coverBandGeneric(storeId,day,band,preferSpecial){
  let guard=0;
  while(coverage(storeId,day,band)<band.min && guard<250){
    guard++;
    const assignment=findGenericAssignmentForBand(storeId,day,band,preferSpecial);
    if(!assignment) break;
    schedule[storeId][assignment.employee.id][day]=assignment.shift;
  }
}

function findGenericAssignmentForBand(storeId,day,band,preferSpecial){
  const store=stores.find(s=>s.id===storeId);
  const candidates=[];

  getStoreWorkers(storeId)
    .filter(e=>!e.fixedShifts && !e.manual)
    .filter(e=>canWorkDay(e,day))
    .forEach(e=>{
      const existing=schedule[storeId]?.[e.id]?.[day];

      // Un turno bloccato non viene mai sostituito né rimpiazzato.
      if(existing && existing.locked) return;

      if(existing && shiftCovers(existing,band)) return;

      if(!existing){
        shiftOptionsForStore(store,e)
          .filter(opt=>shiftCovers(opt,band))
          .filter(opt=>canAssignShiftStrict(storeId,e,day,opt))
          .forEach(opt=>candidates.push({employee:e,shift:opt,score:genericScore(storeId,day,band,e,opt,preferSpecial)}));
      }

      if(existing){
        const oldHours=existing.workedHours;
        shiftOptionsForStore(store,e)
          .filter(opt=>shiftCovers(opt,band))
          .filter(opt=>employeeTotal(e.id)-oldHours+opt.workedHours<=weeklyTarget(e))
          .filter(opt=>replacementPreservesCriticalCoverage(storeId,store,e.id,day,opt,band))
          .forEach(opt=>candidates.push({employee:e,shift:opt,score:genericScore(storeId,day,band,e,opt,preferSpecial)-10}));
      }
    });

  if(!candidates.length) return null;

  candidates.sort((a,b)=>{
    const pa=workerPriority(a.employee,storeId), pb=workerPriority(b.employee,storeId);
    if(pa!==pb) return pa-pb;
    // Stessa priorità: se è una copertura fuori dal negozio principale,
    // ruota preferendo chi ha fatto meno trasferte finora questa settimana.
    const awayA=a.employee.primaryStoreId!==storeId ? awayShiftCount(a.employee.id) : -1;
    const awayB=b.employee.primaryStoreId!==storeId ? awayShiftCount(b.employee.id) : -1;
    if(awayA!==awayB) return awayA-awayB;
    return b.score-a.score
      || employeeTotal(a.employee.id)-employeeTotal(b.employee.id)
      || (Math.random()-0.5);
  });

  return candidates[0];
}

function otherPresenceDuringPause(storeId,day,shift,excludeEmployeeId){
  if(!shift.pauseStart || !shift.pauseEnd) return true;
  const pause={start:shift.pauseStart,end:shift.pauseEnd};
  return employees.some(e=>{
    if(e.id===excludeEmployeeId) return false;
    const sh=schedule[storeId]?.[e.id]?.[day];
    if(!sh) return false;
    return (sh.segments||[]).some(seg=>overlaps(seg,pause));
  });
}

function storeWindow(store){
  const starts=store.sessions.map(s=>toMin(s.start));
  const ends=store.sessions.map(s=>toMin(s.end));
  return {open:Math.min(...starts), close:Math.max(...ends)};
}

// Classifica un turno come "mattina" (orientato all'apertura) o "pomeriggio"
// (orientato alla chiusura) in base a dove cade il suo baricentro rispetto
// alla metà giornata del negozio. I turni centrali/spezzati sono "centro".
function shiftDaypart(shift,store){
  if(!shift || !(shift.segments||[]).length) return "centro";
  const start=toMin(shift.segments[0].start);
  const end=toMin(shift.segments[shift.segments.length-1].end);
  const mid=(start+end)/2;
  const {open,close}=storeWindow(store);
  const storeMid=(open+close)/2;
  if(mid < storeMid-30) return "mattina";
  if(mid > storeMid+30) return "pomeriggio";
  return "centro";
}

// Conta, nell'intera settimana del dipendente (tutti i negozi), quanti turni
// di mattina e quanti di pomeriggio ha già.
function employeeDaypartCounts(eid){
  let m=0,p=0;
  stores.forEach(st=>{
    days.forEach(d=>{
      const sh=schedule[st.id]?.[eid]?.[d];
      if(!sh) return;
      const part=shiftDaypart(sh,st);
      if(part==="mattina") m++; else if(part==="pomeriggio") p++;
    });
  });
  return {m,p};
}

function genericScore(storeId,day,band,e,shift,preferSpecial){
  const store=stores.find(s=>s.id===storeId);
  const allBands=[
    ...(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false})),
    ...store.sessions.flatMap(splitSessionIntoSlots)
  ];

  let score=preferSpecial ? 500 : 200;

  allBands.forEach(b=>{
    const current=coverage(storeId,day,b);
    if(current<b.min && shiftCovers(shift,b)) score += b.base ? 50 : 250;
  });

  // Evita che la pausa di questo turno coincida con quella di un collega
  // già assegnato, lasciando il negozio scoperto in quell'ora.
  if(!otherPresenceDuringPause(storeId,day,shift,e.id)){
    score -= 300;
  }

  // I dipendenti normali devono arrivare alle ore contrattuali.
  // Gli extra invece non vengono riempiti a 30h: entrano solo sui buchi.
  if(!e.isExtra){
    const missing=employeeMissingHours(e);
    if(shift.workedHours<=missing) score += 30;
  }

  if(e.type==="6-8" && e.weeklyHours===40 && !e.rest){
    const eightCount=genDays.filter(d=>schedule[storeId]?.[e.id]?.[d]?.workedHours===8).length;
    if(eightCount<2 && shift.workedHours===8) score += 60;
    if(eightCount>=2 && shift.workedHours===6) score += 60;
  }

  // Extra 30h: preferisci 5h se copre bene il buco, ma non forzare mai il completamento ore.
  if(e.isExtra && e.weeklyHours===30){
    if(shift.workedHours===5) score += 20;
    if(shift.workedHours===4) score += 10;
  }

  // Varietà: bilancia mattina e pomeriggio nella settimana del dipendente,
  // così non gli capitano sempre gli stessi orari. Premia il turno del tipo
  // meno rappresentato finora; è una spinta secondaria, non scavalca la
  // copertura (che vale molto di più).
  const part=shiftDaypart(shift,store);
  if(part==="mattina" || part==="pomeriggio"){
    const {m,p}=employeeDaypartCounts(e.id);
    const balance = part==="mattina" ? (p-m) : (m-p);
    score += balance*25;
  }

  return score;
}

function replacementPreservesCriticalCoverage(storeId,store,employeeId,day,newShift,targetBand){
  const old=schedule[storeId]?.[employeeId]?.[day];
  schedule[storeId][employeeId][day]=newShift;

  const bands=[
    ...(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false})),
    ...store.sessions.flatMap(splitSessionIntoSlots)
  ];

  const ok=bands.every(b=>{
    if(b.start===targetBand.start && b.end===targetBand.end) return true;
    return coverage(storeId,day,b)>=b.min;
  });

  schedule[storeId][employeeId][day]=old;
  return ok;
}

function completeMandatoryHoursForStore(storeId){
  const store=stores.find(s=>s.id===storeId);
  const workers=getStoreWorkers(storeId).filter(e=>!e.fixedShifts && !e.manual);
  const ordered=workers.slice().sort((a,b)=>workerPriority(a,storeId)-workerPriority(b,storeId) || (Math.random()-0.5));

  ordered.forEach(e=>{
    let guard=0;
    while(employeeTotal(e.id)<weeklyTarget(e) && guard<250){
      guard++;
      const assignment=findBestHourCompletion(storeId,store,e);
      if(!assignment) break;
      schedule[storeId][e.id][assignment.day]=assignment.shift;
    }

    guard=0;
    while(employeeTotal(e.id)>weeklyTarget(e) && guard<120){
      guard++;
      if(!reduceEmployeeHours(storeId,store,e)) break;
    }
  });
}

function findBestHourCompletion(storeId,store,e){
  const missing=employeeMissingHours(e);
  const candidates=[];

  genDays.forEach(day=>{
    if(!store.openDays.includes(day)) return;
    if(!canWorkDay(e,day)) return;
    if(schedule[storeId]?.[e.id]?.[day]) return;

    shiftOptionsForStore(store,e)
      .filter(opt=>opt.workedHours<=missing)
      .filter(opt=>canAssignShiftStrict(storeId,e,day,opt))
      .forEach(opt=>candidates.push({day,shift:opt,score:genericScore(storeId,day,{start:opt.segments[0].start,end:opt.segments[opt.segments.length-1].end,min:1,base:true},e,opt,false)}));
  });

  if(!candidates.length) return null;

  candidates.sort((a,b)=>{
    const aExact=a.shift.workedHours===missing?1:0;
    const bExact=b.shift.workedHours===missing?1:0;
    return bExact-aExact || b.score-a.score || b.shift.workedHours-a.shift.workedHours || (Math.random()-0.5);
  });

  return candidates[0];
}

function reduceEmployeeHours(storeId,store,e){
  const overflow=employeeTotal(e.id)-weeklyTarget(e);
  const candidates=[];

  genDays.forEach(day=>{
    const current=schedule[storeId]?.[e.id]?.[day];
    if(!current || current.locked) return;

    shiftOptionsForStore(store,e)
      .filter(opt=>opt.workedHours<current.workedHours)
      .filter(opt=>current.workedHours-opt.workedHours<=overflow)
      .filter(opt=>replacementPreservesAllCoverage(storeId,store,e.id,day,opt))
      .forEach(opt=>candidates.push({day,shift:opt,saving:current.workedHours-opt.workedHours}));
  });

  if(!candidates.length) return false;
  candidates.sort((a,b)=>b.saving-a.saving);
  schedule[storeId][e.id][candidates[0].day]=candidates[0].shift;
  return true;
}

function replacementPreservesAllCoverage(storeId,store,employeeId,day,newShift){
  const old=schedule[storeId]?.[employeeId]?.[day];
  schedule[storeId][employeeId][day]=newShift;
  const ok=requiredBands(store).every(b=>coverage(storeId,day,b)>=b.min);
  schedule[storeId][employeeId][day]=old;
  return ok;
}

function eligibleStoresOrdered(e){
  // Senza negozio principale (es. un direttore che gira su più negozi)
  // nessun negozio ha la precedenza: stesso rango ovunque, decide solo
  // dove c'è davvero bisogno.
  if(!e.primaryStoreId){
    return (e.secondaryStoreIds||[])
      .map(id=>stores.find(s=>s.id===id))
      .filter(Boolean)
      .map(store=>({store,rank:0}));
  }

  const ids=[e.primaryStoreId, ...(e.secondaryStoreIds||[])];
  return ids
    .map((id,i)=>({store:stores.find(s=>s.id===id),rank:i===0?0:1}))
    .filter(x=>x.store);
}

function shiftFillsAnyGap(storeId,day,shift){
  const store=stores.find(s=>s.id===storeId);
  const bands=[
    ...(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false})),
    ...store.sessions.flatMap(splitSessionIntoSlots)
  ];
  return bands.some(b=>coverage(storeId,day,b)<b.min && shiftCovers(shift,b));
}

function findBestHourCompletionAcrossStores(e){
  const missing=employeeMissingHours(e);
  const candidates=[];

  eligibleStoresOrdered(e).forEach(({store,rank:storeRank})=>{
    genDays.forEach(day=>{
      if(!store.openDays.includes(day)) return;
      if(!canWorkDay(e,day)) return;
      if(schedule[store.id]?.[e.id]?.[day]) return;

      shiftOptionsForStore(store,e)
        .filter(opt=>opt.workedHours<=missing)
        .filter(opt=>canAssignShiftStrict(store.id,e,day,opt))
        .forEach(opt=>candidates.push({
          storeId:store.id,
          storeRank,
          day,
          shift:opt,
          fillsGap:shiftFillsAnyGap(store.id,day,opt),
          score:genericScore(store.id,day,{start:opt.segments[0].start,end:opt.segments[opt.segments.length-1].end,min:1,base:true},e,opt,false)
        }));
    });
  });

  if(!candidates.length) return null;

  // Un buco reale da coprire vince sempre, in qualsiasi negozio si trovi:
  // altrimenti (nessun buco da nessuna parte, si tratta solo di completare
  // ore contrattuali) si preferisce il negozio principale, poi i secondari
  // nell'ordine in cui sono elencati.
  candidates.sort((a,b)=>{
    const aExact=a.shift.workedHours===missing?1:0;
    const bExact=b.shift.workedHours===missing?1:0;
    return (b.fillsGap-a.fillsGap) || (a.storeRank-b.storeRank) || bExact-aExact || b.score-a.score || b.shift.workedHours-a.shift.workedHours || (Math.random()-0.5);
  });

  return candidates[0];
}

function completeMandatoryHoursGlobal(){
  // Prima i dipendenti normali, poi gli Extra: così un Extra non "ruba"
  // uno slot di cui un dipendente normale ha davvero bisogno per arrivare
  // alle sue ore contrattuali.
  const workers=employees.filter(e=>!e.fixedShifts && !e.manual).slice().sort((a,b)=>(a.isExtra?1:0)-(b.isExtra?1:0) || (Math.random()-0.5));

  workers.forEach(e=>{
    let guard=0;
    while(employeeTotal(e.id)<weeklyTarget(e) && guard<250){
      guard++;
      const assignment=findBestHourCompletionAcrossStores(e);
      if(!assignment) break;
      schedule[assignment.storeId][e.id][assignment.day]=assignment.shift;
    }
  });
}

function reduceOnceAcrossStores(e){
  const overflow=employeeTotal(e.id)-weeklyTarget(e);
  const candidates=[];

  eligibleStoresOrdered(e).forEach(({store,rank:storeRank})=>{
    genDays.forEach(day=>{
      const current=schedule[store.id]?.[e.id]?.[day];
      if(!current || current.locked) return;

      shiftOptionsForStore(store,e)
        .filter(opt=>opt.workedHours<current.workedHours)
        .filter(opt=>current.workedHours-opt.workedHours<=overflow)
        .filter(opt=>replacementPreservesAllCoverage(store.id,store,e.id,day,opt))
        .forEach(opt=>candidates.push({storeId:store.id,storeRank,day,shift:opt,saving:current.workedHours-opt.workedHours}));
    });
  });

  if(!candidates.length) return false;

  // Riduci prima nei negozi secondari, per proteggere la presenza nel principale.
  candidates.sort((a,b)=>b.storeRank-a.storeRank || b.saving-a.saving);
  const best=candidates[0];
  schedule[best.storeId][e.id][best.day]=best.shift;
  return true;
}

function reduceEmployeeHoursGlobal(e){
  let guard=0;
  while(employeeTotal(e.id)>weeklyTarget(e) && guard<120){
    guard++;
    if(!reduceOnceAcrossStores(e)) break;
  }
}

function repairAllCoverageForStore(storeId){
  const store=stores.find(s=>s.id===storeId);
  shuffledGenDays().forEach(day=>{
    if(!store.openDays.includes(day)) return;
    const bands=[
      ...(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false})),
      ...store.sessions.flatMap(splitSessionIntoSlots)
    ];
    bands.forEach(b=>coverBandGeneric(storeId,day,b,!b.base));
  });
}

function totalUncoveredMinutesForDay(storeId,day){
  const store=stores.find(s=>s.id===storeId);
  const bands=[
    ...(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false})),
    ...store.sessions.flatMap(splitSessionIntoSlots)
  ];
  return bands.reduce((total,b)=>{
    const deficit=Math.max(0,b.min-coverage(storeId,day,b));
    return total+deficit*(toMin(b.end)-toMin(b.start));
  },0);
}

// Il "repair" normale accetta solo scambi che non peggiorano nessun'altra
// fascia. Quando restano buchi che nessuno scambio sicuro può chiudere del
// tutto (es. un solo aiuto disponibile per coprire due estremi opposti
// della giornata), qui si accetta anche uno scambio che sposta il buco
// altrove, purché il totale di minuti scoperti nella giornata diminuisca.
function minimizeResidualGapsForStore(storeId){
  const store=stores.find(s=>s.id===storeId);
  genDays.forEach(day=>{
    if(!store.openDays.includes(day)) return;

    let guard=0;
    let improved=true;
    while(improved && guard<40){
      guard++;
      improved=false;
      const before=totalUncoveredMinutesForDay(storeId,day);
      if(before===0) break;

      const workers=getStoreWorkers(storeId).filter(e=>!e.fixedShifts && !e.manual && schedule[storeId]?.[e.id]?.[day] && !schedule[storeId][e.id][day].locked);

      for(const e of workers){
        const current=schedule[storeId][e.id][day];
        const options=shiftOptionsForStore(store,e).filter(opt=>{
          const delta=opt.workedHours-current.workedHours;
          return employeeTotal(e.id)+delta<=weeklyTarget(e);
        });

        let swapped=false;
        for(const opt of options){
          schedule[storeId][e.id][day]=opt;
          const after=totalUncoveredMinutesForDay(storeId,day);
          if(after<before){
            improved=true;
            swapped=true;
            break;
          }
          schedule[storeId][e.id][day]=current;
        }
        if(swapped) break;
      }
    }
  });
}

// Ottimizza i turni da 8h già assegnati per lasciare il negozio meno scoperto,
// SENZA cambiare le ore lavorate (restano 8):
//  1) sposta la pausa da 1h in una posizione migliore (stessa finestra);
//  2) se serve, ALLUNGA la pausa a 3h (turno spezzato) per coprire apertura
//     e chiusura lasciando il centro ai colleghi.
// Ogni scambio è accettato solo se riduce i minuti scoperti della giornata,
// quindi non può mai peggiorare la copertura.
function optimizePausePositionsForStore(storeId){
  const store=stores.find(s=>s.id===storeId);
  genDays.forEach(day=>{
    if(!store.openDays.includes(day)) return;

    let improved=true;
    let guard=0;
    while(improved && guard<40){
      guard++;
      improved=false;
      const before=totalUncoveredMinutesForDay(storeId,day);
      if(before===0) break;

      const workers=getStoreWorkers(storeId).filter(e=>!e.fixedShifts && !e.manual);
      for(const e of workers){
        const cur=schedule[storeId]?.[e.id]?.[day];
        if(!cur || cur.locked || cur.workedHours!==8 || !cur.pauseStart || !cur.pauseEnd) continue;
        if((cur.segments||[]).length!==2) continue;

        const startMin=toMin(cur.segments[0].start);
        const pauseHours=(toMin(cur.pauseEnd)-toMin(cur.pauseStart))/60;
        // Riposizionamenti della pausa attuale + turni spezzati con pausa lunga
        // (usati solo se migliorano la copertura). Escludo il turno attuale e
        // quelli in conflitto con eventuali assenze.
        const variants=[
          ...buildEightHourContinuousVariants(startMin,pauseHours),
          ...buildSplitShiftVariants(store,e,LONG_PAUSE_HOURS)
        ].filter(v=>isShiftInsideStore(v,store))
         .filter(v=>v.time!==cur.time || v.pause!==cur.pause)
         .filter(v=>!shiftConflictsWithLeave(e,day,v));

        let swapped=false;
        for(const v of variants){
          schedule[storeId][e.id][day]=v;
          const after=totalUncoveredMinutesForDay(storeId,day);
          if(after<before){ improved=true; swapped=true; break; }
          schedule[storeId][e.id][day]=cur;
        }
        if(swapped) break;
      }
    }
  });
}

function renderTurniIssues(){
  const selectedStoreId = storeSelect?.value;
  const selectedStore = stores.find(s=>s.id===selectedStoreId);
  const storeName = selectedStore?.name;
  let a = alerts();

  // In Turni mostriamo SOLO gli avvisi del negozio selezionato.
  // Se quel negozio non ha avvisi, deve comparire "Nessun avviso".
  if(storeName){
    a = a.filter(i => i.text.startsWith(storeName + " ") || i.text.includes("(" + storeName + " "));
  }

  issues.innerHTML = a.length
    ? a.map(i=>`<div class="issue ${i.type}">${i.text}</div>`).join("")
    : `<div class="issue ok">Nessun avviso per ${storeName || "questo negozio"}</div>`;
}

function alerts(){
  const out=[];

  employees.forEach(e=>{
    const total=employeeTotal(e.id);

    if(total>weeklyTarget(e)){
      out.push({type:"danger",text:`${e.name}: supera le ore massime ${total}/${weeklyTarget(e)}h`});
    }

    if(!e.isExtra && total<weeklyTarget(e)){
      out.push({type:"warn",text:`${e.name}: ore non raggiunte ${total}/${weeklyTarget(e)}h`});
    }

    // Rete di sicurezza: se restasse un turno su un giorno di assenza (di norma
    // viene rimosso in automatico), segnalalo così il manager può rigenerare.
    stores.forEach(st=>{
      genDays.forEach(d=>{
        const sh=schedule[st.id]?.[e.id]?.[d];
        if(sh && shiftConflictsWithLeave(e,d,sh)){
          const lv=leaveOnDay(e,d);
          out.push({type:"danger",text:`${e.name} è in ${leaveLabels[lv.type]} il ${d} ma ha ancora un turno (${st.name}): rigenera per rimuoverlo`});
        }
      });
    });
  });

  stores.forEach(st=>{
    employees.filter(e=>canWorkIn(e,st.id)).forEach(e=>{
      days.forEach(d=>{
        const sh=schedule[st.id]?.[e.id]?.[d];
        if(sh && !isShiftInsideStore(sh,st)){
          out.push({type:"danger",text:`${e.name} ha un turno fuori orario negozio (${st.name} ${d})`});
        }
      });
    });

    days.forEach(d=>{
      if(!st.openDays.includes(d)) return;

      // Fasce speciali: controllate esattamente. Include la domenica se il negozio
      // è segnato come aperto: non generiamo turni automatici quel giorno, ma
      // vogliamo comunque avvisare se risulta scoperto.
      (st.specialBands||[]).forEach(b=>{
        const band={start:b.start,end:b.end,min:Number(b.min||2),base:false};
        const c=coverage(st.id,d,band);
        if(c<band.min){
          out.push({type:"warn",text:`${st.name} ${d} ${band.start}-${band.end}: ${c}/${band.min} persone`});
        }
      });

      // Copertura base: controllata a slot e raggruppata, senza buchi nascosti.
      const uncovered=[];
      st.sessions.flatMap(splitSessionIntoSlots).forEach(slot=>{
        const c=coverage(st.id,d,slot);
        if(c<1) uncovered.push(slot);
      });

      const groups=[];
      uncovered.forEach(slot=>{
        const last=groups[groups.length-1];
        if(last && last.end===slot.start){
          last.end=slot.end;
        }else{
          groups.push({start:slot.start,end:slot.end});
        }
      });

      groups.forEach(g=>{
        out.push({type:"danger",text:`${st.name} ${d} ${g.start}-${g.end}: negozio scoperto`});
      });
    });
  });

  return out;
}

function addStore(e){
  e.preventDefault();
  const editingId=editingStoreId.value;
  const name=storeName.value.trim();
  const id=editingId || slug(name);
  if(!name)return showNotice("Inserisci il nome del negozio","warn");
  if(!editingId && stores.some(s=>s.id===id))return showNotice("Negozio già presente","warn");

  const openDays=[...document.querySelectorAll('input[name="openDays"]:checked')].map(x=>x.value);
  if(!openDays.length)return showNotice("Seleziona almeno un giorno di apertura","warn");
  if(!openStart1.value||!openEnd1.value)return showNotice("Inserisci l'orario di apertura","warn");

  const sessions=[{start:openStart1.value,end:openEnd1.value}];
  if(scheduleType.value==="split"){
    if(!openStart2.value||!openEnd2.value)return showNotice("Inserisci anche la seconda fascia oraria","warn");
    sessions.push({start:openStart2.value,end:openEnd2.value});
  }

  const specialBandsList=[...document.querySelector("#specialBands").querySelectorAll(".band")].map(r=>({
    start:r.querySelector(".bs").value,
    end:r.querySelector(".be").value,
    min:Number(r.querySelector(".bm").value||2)
  })).filter(b=>b.start&&b.end);

  const data={id,name,openDays,sessions,specialBands:specialBandsList};

  const idx=stores.findIndex(s=>s.id===id);
  if(idx>=0){
    stores[idx]=data;
    schedule[id]={};
    showNotice("Negozio modificato. Turni cancellati: rigenera la proposta.","warn");
  }else{
    stores.push(data);
    schedule[id]={};
  }

  saveData();
  resetStoreForm();
  renderAll();
}

function addEmployee(e){
  e.preventDefault();
  const profile=getProfile(empProfile.value);
  const editingId=editingEmployeeId.value;
  const id=editingId || slug(empName.value)+"_"+Date.now().toString().slice(-4);
  const secondary=getSelectedSecondaryStores().filter(x=>x!==empPrimaryStore.value);

  let fixedShifts={};
  if(profile.id==="turno_fisso"){
    if(!empPrimaryStore.value){
      showNotice("Il turno fisso richiede un negozio principale.","warn");
      return;
    }
    try{
      fixedShifts=collectFixedShifts();
    }catch(err){
      showNotice(err.message,"warn");
      return;
    }

    const store=stores.find(s=>s.id===empPrimaryStore.value);
    for(const [day,f] of Object.entries(fixedShifts)){
      if(!store.openDays.includes(day)){
        showNotice(`Turno fisso non valido: ${day} negozio chiuso`,"warn");
        return;
      }
      if(!fixedShiftInsideStore(f,store)){
        showNotice(`Turno fisso fuori orario negozio: ${day}`,"warn");
        return;
      }
    }
  }

  const employeeData={
    id,
    name:empName.value.trim(),
    weeklyHours:profile.id==="turno_fisso"?Object.values(fixedShifts).reduce((s,f)=>s+fixedShiftToShift(f).workedHours,0):Number(empHours.value),
    primaryStoreId:empPrimaryStore.value,
    secondaryStoreIds:secondary,
    rest:profile.id==="extra_30"?"":(profile.id==="turno_fisso"?(document.getElementById("fixedRest")?.value||""):empRest.value),
    type:profile.type,
    pauseHours:(profile.id==="solo_6"||profile.id==="extra_30"||profile.id==="turno_fisso")?0:Number(empPause.value||0),
    profileId:profile.id,
    isExtra:!!profile.isExtra,
    fixedShifts:profile.id==="turno_fisso",
    fixedSchedule:fixedShifts,
    manual:profile.id==="turno_fisso"?false:empManualOnly.checked,
    // Le assenze non si toccano dal form dipendente: si preservano quelle
    // già presenti (si gestiscono nella sezione Ferie).
    leaves:(employees.find(x=>x.id===id)?.leaves)||[]
  };

  const idx=employees.findIndex(x=>x.id===id);
  if(idx>=0){
    employees[idx]=employeeData;
    stores.forEach(st=>{ if(schedule[st.id]?.[id]) schedule[st.id][id]=Object.fromEntries(days.map(d=>[d,null])); });
    showNotice("Dipendente modificato. Rigenera la proposta.","warn");
  }else{
    employees.push(employeeData);
  }

  ensureSchedule();
  saveData();
  resetEmployeeForm();
  renderAll();
}

function deleteEmployee(id){
  const emp=employees.find(e=>e.id===id);
  if(!emp) return;
  if(!confirm(`Eliminare ${emp.name}? L'azione non può essere annullata.`)) return;
  employees=employees.filter(e=>e.id!==id);
  stores.forEach(s=>{if(schedule[s.id])delete schedule[s.id][id];});
  saveData();
  renderAll();
}

function deleteStore(id){
  const s=stores.find(x=>x.id===id);
  if(!s) return;
  const affected=employees.filter(e=>e.primaryStoreId===id);
  const msg=affected.length
    ? `Eliminare il negozio "${s.name}"? Verranno eliminati anche ${affected.length} dipendenti che lo hanno come negozio principale: ${affected.map(e=>e.name).join(", ")}.`
    : `Eliminare il negozio "${s.name}"?`;
  if(!confirm(msg)) return;
  stores=stores.filter(x=>x.id!==id);
  employees=employees.map(e=>({...e,secondaryStoreIds:e.secondaryStoreIds.filter(x=>x!==id)})).filter(e=>e.primaryStoreId!==id);
  delete schedule[id];
  saveData();
  renderAll();
}

function addSpecialBandRow(b={start:"09:00",end:"10:00",min:2}){
  const d=document.createElement("div");
  d.className="band";
  d.innerHTML=`<label>Da<input class="bs" type="time" value="${b.start||"09:00"}"></label><label>A<input class="be" type="time" value="${b.end||"10:00"}"></label><label>Persone<input class="bm" type="number" min="2" value="${b.min||2}"></label><button type="button">×</button>`;
  d.querySelector("button").onclick=()=>d.remove();
  document.querySelector("#specialBands").appendChild(d);
}

function pauseVisibility(){
  if(typeof empProfile!=="undefined"){
    const p=getProfile(empProfile.value);
    if(p.id==="turno_fisso"||p.id==="solo_6"||p.id==="extra_30"){
      pauseField.style.display="none";
      return;
    }
  }
  pauseField.style.display=(empType.value==="6"||empType.value==="4-5")?"none":"grid";
}

function showNotice(m,t="ok",duration=3000){
  notice.textContent=m;
  notice.className=`notice show ${t}`;
  clearTimeout(showNotice._timer);
  showNotice._timer=setTimeout(()=>notice.classList.remove("show"),duration);
}


function openShiftEditor(storeId, employeeId, day){
  // La domenica non viene mai generata automaticamente, ma può sempre
  // essere assegnata a mano da qui.
  const store=stores.find(s=>s.id===storeId);
  if(!store) return;

  editStoreId.value=storeId;
  editEmployeeId.value=employeeId;
  editDay.value=day;

  const eligible=employees.filter(e=>canWorkIn(e,storeId));
  editEmployeeSelect.innerHTML=eligible.map(e=>`<option value="${e.id}">${e.name}</option>`).join("");
  editEmployeeSelect.value=employeeId;

  editDaySelect.value=day;

  refreshEditShiftOptions();

  const current=schedule[storeId]?.[employeeId]?.[day];
  editShiftSelect.value="";
  prefillEditorCustom(current||null);

  editShiftDialog.showModal();
}

function refreshEditShiftOptions(){
  const storeId=editStoreId.value;
  const employeeId=editEmployeeSelect.value;
  const store=stores.find(s=>s.id===storeId);
  const employee=employees.find(e=>e.id===employeeId);
  if(!store||!employee) return;

  const opts=shiftOptionsForEditor(store,employee);
  editShiftSelect.innerHTML=`<option value="">— scegli un modello —</option>`+opts.map((opt,i)=>{
    const pause=(opt.pause&&opt.pause!=="No")?` · Pausa ${opt.pause}`:"";
    return `<option value="${i}" data-time="${opt.time}" data-pause="${opt.pause}">${opt.time}${pause} · ${opt.workedHours}h</option>`;
  }).join("");
}

// Costruisce un turno dagli orari liberi (dalle/alle + pausa), come il turno
// fisso. Se manca tutto ritorna null (nessun turno).
function buildManualShift(start,end,pauseStart,pauseEnd){
  if(!start && !end) return null;
  if(!start || !end) throw new Error("Completa inizio e fine del turno.");
  if(toMin(end)<=toMin(start)) throw new Error("L'ora di fine deve essere dopo l'inizio.");
  const hasPause=!!(pauseStart && pauseEnd);
  if(hasPause){
    if(!(toMin(start)<toMin(pauseStart) && toMin(pauseStart)<toMin(pauseEnd) && toMin(pauseEnd)<toMin(end)))
      throw new Error("La pausa deve stare dentro il turno, con lavoro prima e dopo.");
  }
  const segments=hasPause ? [{start,end:pauseStart},{start:pauseEnd,end}] : [{start,end}];
  const worked=segments.reduce((s,x)=>s+hoursBetween(x.start,x.end),0);
  return {
    segments,
    time:`${start}-${end}`,
    workedHours:worked,
    pause:hasPause?`${pauseStart}-${pauseEnd}`:"No",
    pauseStart:hasPause?pauseStart:null,
    pauseEnd:hasPause?pauseEnd:null
  };
}

// Riempie i campi orari liberi da un turno esistente (o li svuota).
function prefillEditorCustom(shift){
  const hasPause=!!(shift && shift.pauseStart && shift.pauseEnd);
  editStart.value = shift ? shift.segments[0].start : "";
  editEnd.value = shift ? shift.segments[shift.segments.length-1].end : "";
  editHasPause.checked = hasPause;
  editPauseStart.value = hasPause ? shift.pauseStart : "";
  editPauseEnd.value = hasPause ? shift.pauseEnd : "";
  editPauseRow.style.display = hasPause ? "grid" : "none";
}

// Quando si sceglie un modello rapido, precompila i campi orari liberi.
function fillCustomFromTemplate(){
  const idx=editShiftSelect.value;
  if(idx==="") return;
  const store=stores.find(s=>s.id===editStoreId.value);
  const employee=employees.find(e=>e.id===editEmployeeSelect.value);
  if(!store||!employee) return;
  const opt=shiftOptionsForEditor(store,employee)[Number(idx)];
  if(opt) prefillEditorCustom(opt);
}

function saveManualShift(event){
  event.preventDefault();

  const storeId=editStoreId.value;
  const oldEmployeeId=editEmployeeId.value;
  const newEmployeeId=editEmployeeSelect.value;
  const day=editDaySelect.value;

  const store=stores.find(s=>s.id===storeId);
  const employee=employees.find(e=>e.id===newEmployeeId);
  if(!store||!employee) return;

  // Turno costruito dagli orari liberi inseriti (dalle/alle + pausa).
  let option;
  try{
    option=buildManualShift(
      editStart.value, editEnd.value,
      editHasPause.checked?editPauseStart.value:"",
      editHasPause.checked?editPauseEnd.value:""
    );
  }catch(err){
    showNotice(err.message,"warn"); // dialog aperto per correggere
    return;
  }

  // Validazioni PRIMA di toccare i dati: se qualcosa non va, non si modifica
  // nulla e il dialog resta aperto.
  if(option){
    let err=null;
    if(!isShiftInsideStore(option,store)) err="gli orari sono fuori dall'apertura del negozio.";
    else if(employee.rest===day) err="è il giorno di riposo del dipendente.";
    else if(fullDayLeaveOnDay(employee,day)) err=`il dipendente è in ${leaveLabels[fullDayLeaveOnDay(employee,day).type]} quel giorno.`;
    else if(!shiftClearsPartialLeave(employee,day,option)){ const p=partialLeaveOnDay(employee,day); err=`si sovrappone al permesso ${p.from}-${p.to}.`; }
    else if(newEmployeeId!==oldEmployeeId && hasShiftElsewhere(storeId,newEmployeeId,day)) err="il dipendente è già in turno in un altro negozio quel giorno.";
    else{
      const currentAtSlot=schedule[storeId]?.[newEmployeeId]?.[day];
      const base=employeeTotal(newEmployeeId)-(currentAtSlot?currentAtSlot.workedHours:0);
      if(base+option.workedHours>weeklyTarget(employee)) err="supererebbe le ore settimanali del dipendente.";
    }
    if(err){ showNotice("Turno non salvato: "+err,"warn"); return; }
  }

  // Ok: applica la modifica. Rimuovi il turno dalla posizione originale…
  if(schedule[storeId]?.[oldEmployeeId]?.[editDay.value]){
    schedule[storeId][oldEmployeeId][editDay.value]=null;
  }
  if(!schedule[storeId][newEmployeeId]){
    schedule[storeId][newEmployeeId]=Object.fromEntries(days.map(d=>[d,null]));
  }

  if(!option){
    schedule[storeId][newEmployeeId][day]=null;
    saveData(); editShiftDialog.close(); renderAll();
    showNotice("Turno rimosso.","warn");
    return;
  }

  // Turno impostato a mano: viene bloccato. La generazione lo preserva e
  // ricalcola gli altri dipendenti attorno a questa scelta.
  schedule[storeId][newEmployeeId][day]={...option,locked:true};
  saveData();
  editShiftDialog.close();
  renderAll();
  showNotice("Turno bloccato. La generazione lavorerà attorno a questo turno.","ok");
}

function deleteManualShift(){
  const storeId=editStoreId.value;
  const employeeId=editEmployeeSelect.value;
  const day=editDaySelect.value;

  if(schedule[storeId]?.[employeeId]){
    schedule[storeId][employeeId][day]=null;
  }

  saveData();
  editShiftDialog.close();
  renderAll();
  showNotice("Turno eliminato. Avvisi ricalcolati.","warn");
}

function exportWeekPng(){
  const storeId=storeSelect.value||stores[0]?.id;
  const store=stores.find(s=>s.id===storeId);
  if(!store){showNotice("Nessun negozio selezionato.","warn");return;}
  ensureSchedule();

  const workers=employees.filter(e=>canWorkIn(e,storeId));
  const dates=dayDatesOf(currentWeekKey);
  const scale=2; // per un'immagine nitida

  // Layout
  const nameW=190, dayW=120, hoursW=90, rowH=54, headH=48, titleH=56, pad=24;
  const cols=[nameW, ...days.map(()=>dayW), hoursW];
  const tableW=cols.reduce((a,b)=>a+b,0);
  const W=tableW+pad*2;
  const H=titleH+headH+rowH*Math.max(workers.length,1)+pad*2;

  const canvas=document.createElement("canvas");
  canvas.width=W*scale; canvas.height=H*scale;
  const ctx=canvas.getContext("2d");
  ctx.scale(scale,scale);
  ctx.textBaseline="middle";

  // Sfondo
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,W,H);

  // Titolo
  ctx.fillStyle="#111111";
  ctx.font="bold 20px Arial, sans-serif";
  ctx.textAlign="left";
  ctx.fillText(`${store.name} — ${formatWeekRange(currentWeekKey)}`, pad, pad+titleH/2);

  const x0=pad, y0=pad+titleH;

  // Intestazione colonne
  ctx.fillStyle="#e8531f";
  ctx.fillRect(x0,y0,tableW,headH);
  ctx.fillStyle="#ffffff";
  ctx.font="bold 14px Arial, sans-serif";
  let cx=x0;
  const headers=["Dipendente",...days.map((d,i)=>`${d} ${dates[i].getDate()}`),"Ore"];
  headers.forEach((h,i)=>{
    ctx.textAlign="center";
    ctx.fillText(h, cx+cols[i]/2, y0+headH/2);
    cx+=cols[i];
  });

  // Righe
  workers.forEach((e,r)=>{
    const ry=y0+headH+r*rowH;
    if(r%2===1){ ctx.fillStyle="#f6f6f6"; ctx.fillRect(x0,ry,tableW,rowH); }

    ctx.fillStyle="#111111";
    ctx.font="bold 13px Arial, sans-serif";
    ctx.textAlign="left";
    ctx.fillText(e.name, x0+10, ry+rowH/2);

    let dx=x0+nameW;
    days.forEach(d=>{
      const sh=schedule[storeId]?.[e.id]?.[d];
      ctx.textAlign="center";
      if(sh){
        ctx.fillStyle="#111111";
        ctx.font="bold 12px Arial, sans-serif";
        ctx.fillText(sh.time, dx+dayW/2, ry+rowH/2-(sh.pause&&sh.pause!=="No"?8:0));
        if(sh.pause&&sh.pause!=="No"){
          ctx.fillStyle="#777777";
          ctx.font="11px Arial, sans-serif";
          ctx.fillText("pausa "+sh.pause, dx+dayW/2, ry+rowH/2+10);
        }
      }else{
        ctx.fillStyle="#bbbbbb";
        ctx.font="12px Arial, sans-serif";
        ctx.fillText(e.rest===d?"Riposo":"—", dx+dayW/2, ry+rowH/2);
      }
      dx+=dayW;
    });

    const tot=employeeTotal(e.id);
    ctx.fillStyle=tot>e.weeklyHours?"#c0392b":"#111111";
    ctx.font="bold 13px Arial, sans-serif";
    ctx.textAlign="center";
    ctx.fillText(`${tot}/${e.weeklyHours}h`, dx+hoursW/2, ry+rowH/2);
  });

  // Griglia
  ctx.strokeStyle="#dddddd";
  ctx.lineWidth=1;
  const bottomY=y0+headH+rowH*workers.length;
  let gx=x0;
  cols.forEach(w=>{ ctx.beginPath(); ctx.moveTo(gx,y0); ctx.lineTo(gx,bottomY); ctx.stroke(); gx+=w; });
  ctx.beginPath(); ctx.moveTo(gx,y0); ctx.lineTo(gx,bottomY); ctx.stroke();
  for(let r=0;r<=workers.length;r++){
    const ly=y0+headH+r*rowH;
    ctx.beginPath(); ctx.moveTo(x0,ly); ctx.lineTo(x0+tableW,ly); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x0+tableW,y0); ctx.stroke();

  canvas.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`animalmania-${slug(store.name)}-${currentWeekKey}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showNotice("Immagine settimana scaricata.","ok");
  },"image/png");
}

function exportBackup(){
  saveData();
  const data={stores,employees,schedules,week:currentWeekKey,exportedAt:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=`animalmania-turni-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showNotice("Backup scaricato.","ok");
}

function importBackupFile(file){
  const reader=new FileReader();
  reader.onload=()=>{
    let data;
    try{
      data=JSON.parse(reader.result);
    }catch(err){
      showNotice("File non valido: JSON non leggibile.","warn");
      return;
    }

    const hasSchedules=data.schedules && typeof data.schedules==="object";
    const hasLegacy=data.schedule && typeof data.schedule==="object";
    if(!Array.isArray(data.stores) || !Array.isArray(data.employees) || (!hasSchedules && !hasLegacy)){
      showNotice("File non valido: struttura dati non riconosciuta.","warn");
      return;
    }

    if(!confirm("Importare questo backup sovrascriverà tutti i dati attuali (negozi, dipendenti, turni). Continuare?")) return;

    stores=data.stores;
    employees=data.employees;
    normalizeLegacyEmployees();

    if(hasSchedules){
      schedules=data.schedules;
      currentWeekKey=(data.week && schedules[data.week])?data.week:(Object.keys(schedules)[0]||weekKeyOf(new Date()));
    }else{
      // Vecchio backup a settimana unica: lo avvolgo nella settimana corrente.
      currentWeekKey=weekKeyOf(new Date());
      schedules={[currentWeekKey]:data.schedule};
    }
    if(!schedules[currentWeekKey]) schedules[currentWeekKey]=emptySchedule();
    schedule=schedules[currentWeekKey];
    ensureSchedule();
    saveData();
    renderAll();
    showNotice("Backup importato.","ok");
  };
  reader.onerror=()=>showNotice("Errore nella lettura del file.","warn");
  reader.readAsText(file);
}

function setView(v){
  document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===v));
  document.querySelectorAll(".view").forEach(s=>s.classList.toggle("active",s.id===v));
  title.textContent={dashboard:"Dashboard",turni:"Turni",mioturno:"Il mio turno",dipendenti:"Dipendenti",ferie:"Ferie",negozi:"Negozi",accessi:"Accessi"}[v];
  subtitle.textContent={dashboard:"Panoramica della settimana.",turni:"Vista settimanale per negozio.",mioturno:"Scegli il tuo nome e vedi solo i tuoi turni.",dipendenti:"Gestione personale.",ferie:"Ferie, permessi e malattia dei dipendenti.",negozi:"Gestione punti vendita.",accessi:"Gestione password di accesso."}[v];

  // Nella vista dipendente nascondi il pulsante di generazione globale:
  // è una schermata di sola consultazione.
  if(typeof btnGenerateAll!=="undefined") btnGenerateAll.style.display = (v==="mioturno" || currentRole()==="employee") ? "none" : "";
}

// --- Autenticazione a due ruoli (admin / dipendente) ---
// Due modalità:
//  • backend collegato (livello A): le password stanno sul server (/api/auth)
//    e valgono per tutti i dispositivi;
//  • fallback locale: se il backend non c'è, si usano le password di
//    auth-config.js e il ruolo salvato in localStorage (nessun blocco).
let authBackend=false;   // true se /api/auth risponde con backend attivo
let authRole=null;       // ruolo corrente in memoria
let authEmpPw=null;      // password dipendenti (per il pannello Accessi, solo backend)

function effAdminPw(){ return localStorage.getItem("am134_pw_admin") || (window.AM_AUTH&&AM_AUTH.adminPassword) || "admin"; }
function effEmpPw(){ return localStorage.getItem("am134_pw_emp") || (window.AM_AUTH&&AM_AUTH.employeePassword) || "dipendente"; }
function currentRole(){ return authRole; }
function tryLoginLocal(pw){
  if(pw && pw===effAdminPw()) return "admin";
  if(pw && pw===effEmpPw()) return "employee";
  return null;
}

// Legge lo stato di sessione dal server (o passa al fallback locale).
async function refreshSession(){
  try{
    const r=await fetch("/api/auth?action=session",{headers:{Accept:"application/json"}});
    if(r.ok){
      const d=await r.json();
      if(d.backend){
        authBackend=true;
        authRole=d.role||null;
        authEmpPw=d.employeePassword||null;
        return;
      }
    }
  }catch(e){/* nessun backend: fallback locale */}
  authBackend=false;
  authRole=localStorage.getItem("am134_role")||null;
  authEmpPw=null;
}

async function doLogin(pw){
  if(authBackend){
    try{
      const r=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"login",password:pw})});
      if(r.status===401) return null;
      if(r.ok){ const d=await r.json(); authRole=d.role; await refreshSession(); return d.role; }
    }catch(e){/* cade al locale */}
  }
  const role=tryLoginLocal(pw);
  if(role){ authRole=role; localStorage.setItem("am134_role",role); }
  return role;
}

async function logout(){
  if(authBackend){ try{ await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"logout"})}); }catch(e){} }
  authRole=null;
  lastDataAt=0; // forza il ricaricamento dei dati al prossimo login
  localStorage.removeItem("am134_role");
  applyAuthGate();
}

// Aggiorna una password (server se disponibile, altrimenti locale).
// Ritorna "all" (vale per tutti) o "device" (solo questo dispositivo).
async function saveCredential(which, value){
  if(authBackend){
    const body={action:"set-credentials"};
    if(which==="admin") body.adminPassword=value; else body.employeePassword=value;
    const r=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!r.ok) throw new Error("save failed");
    await refreshSession();
    return "all";
  }
  if(which==="admin") localStorage.setItem("am134_pw_admin",value);
  else localStorage.setItem("am134_pw_emp",value);
  return "device";
}

// Mostra/nasconde la schermata di login e applica i permessi del ruolo.
function applyAuthGate(){
  const gate=document.getElementById("loginGate");
  const role=currentRole();
  if(!role){
    document.body.classList.add("locked");
    if(gate) gate.style.display="flex";
    return;
  }
  if(gate) gate.style.display="none";
  document.body.classList.remove("locked");
  applyRoleRestrictions(role);
}

function applyRoleRestrictions(role){
  const isEmp = role==="employee";
  // Il dipendente vede solo "Il mio turno".
  document.querySelectorAll(".nav").forEach(n=>{
    n.style.display = (!isEmp || n.dataset.view==="mioturno") ? "" : "none";
  });
  const exp=document.getElementById("btnExportBackup"), imp=document.getElementById("btnImportBackup");
  if(exp) exp.style.display = isEmp ? "none" : "";
  if(imp) imp.style.display = isEmp ? "none" : "";
  if(typeof btnGenerateAll!=="undefined") btnGenerateAll.style.display = isEmp ? "none" : "";
  if(isEmp && document.querySelector(".view.active")?.id!=="mioturno") setView("mioturno");
}

function renderAccessi(){
  const cur=document.getElementById("curEmpPw");
  if(cur) cur.textContent = authBackend ? (authEmpPw||"—") : effEmpPw();
  const scope=document.getElementById("accessScope");
  if(scope) scope.textContent = authBackend
    ? "Backend attivo: le modifiche valgono per tutti i dispositivi."
    : "Backend non collegato: le modifiche valgono solo su questo dispositivo.";
}

// --- Dati condivisi sul server: tutti vedono gli stessi turni ---
// Admin: legge all'avvio e SALVA sul server ad ogni modifica.
// Dipendenti: leggono e ricontrollano ogni 30s (sola lettura).
// Se il backend non c'è, resta tutto in locale (nessun blocco).
let dataBackend=false;
let lastDataAt=0;
let serverPushTimer=null;

async function loadServerData(){
  if(!authBackend || !currentRole()) return;
  try{
    const r=await fetch("/api/data",{headers:{Accept:"application/json"}});
    if(!r.ok){ dataBackend=false; return; }
    const d=await r.json();
    if(!d.backend){ dataBackend=false; return; }
    dataBackend=true;
    if(d.data && Array.isArray(d.data.stores)){
      if(d.data.updatedAt && d.data.updatedAt===lastDataAt) return; // già aggiornato
      lastDataAt=d.data.updatedAt||0;
      stores=d.data.stores;
      employees=d.data.employees||[];
      normalizeLegacyEmployees();
      schedules=d.data.schedules||{};
      if(!schedules[currentWeekKey]) schedules[currentWeekKey]=emptySchedule();
      schedule=schedules[currentWeekKey];
      ensureSchedule();
      renderAll();
    }else if(currentRole()==="admin"){
      await pushServerData(); // server vuoto: lo inizializzo coi dati attuali
    }
  }catch(e){ dataBackend=false; }
}

function scheduleServerPush(){
  if(!dataBackend || currentRole()!=="admin") return;
  clearTimeout(serverPushTimer);
  serverPushTimer=setTimeout(pushServerData, 1200);
}

async function pushServerData(){
  if(!dataBackend || currentRole()!=="admin") return;
  try{
    const r=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({stores,employees,schedules})});
    if(r.ok){ const d=await r.json(); if(d.updatedAt) lastDataAt=d.updatedAt; }
  }catch(e){}
}

function startDataPolling(){
  setInterval(()=>{
    if(dataBackend && currentRole() && currentRole()!=="admin") loadServerData();
  }, 30000);
}


function renderProfiles(){
  const container=document.getElementById("profileCards");
  if(!container) return;

  container.innerHTML=employeeProfiles.map(p=>{
    const turno=shiftTypeLabel(p.type);
    return `<div class="profile-card">
      <strong>${p.name}</strong>
      <span>${p.description}</span>
      <small>${p.weeklyHours}h · ${turno}${p.isExtra?" · Extra":""}</small>
    </div>`;
  }).join("");
}

function applySelectedProfile(){
  const profileSelect=document.getElementById("empProfile");
  if(!profileSelect) return;

  const p=getProfile(profileSelect.value);

  document.getElementById("empHours").value=p.weeklyHours;
  document.getElementById("empType").value=p.type;
  document.getElementById("empPause").value=p.pauseHours || 0;
  document.getElementById("empRest").value=p.restDefault || "";

  document.getElementById("empHours").readOnly=true;
  document.getElementById("empType").disabled=true;

  const summary=document.getElementById("profileSummary");
  if(summary) summary.innerHTML=`<strong>${p.name}</strong><span>${p.description}</span>`;

  const standardFields=document.getElementById("standardProfileFields");
  const fixedFields=document.getElementById("fixedShiftFields");
  const pause=document.getElementById("pauseField");
  const rest=document.getElementById("empRest");

  if(p.id==="standard_40"){
    standardFields.style.display="grid";
    fixedFields.style.display="none";
    rest.disabled=false;
    [...rest.options].forEach(o=>o.disabled=(o.value===""));
    if(rest.value==="") rest.value="Mer";
    pause.style.display="grid";
  }else if(p.id==="flessibile_40"){
    standardFields.style.display="grid";
    fixedFields.style.display="none";
    rest.disabled=false;
    [...rest.options].forEach(o=>o.disabled=false);
    pause.style.display="grid";
  }else if(p.id==="solo_6"){
    standardFields.style.display="grid";
    fixedFields.style.display="none";
    rest.disabled=false;
    [...rest.options].forEach(o=>o.disabled=false);
    pause.style.display="none";
  }else if(p.id==="extra_30"){
    standardFields.style.display="grid";
    fixedFields.style.display="none";
    rest.disabled=true;
    rest.value="";
    pause.style.display="none";
  }else if(p.id==="turno_fisso"){
    standardFields.style.display="none";
    fixedFields.style.display="grid";
    buildFixedShiftFields();
  }else{
    standardFields.style.display="grid";
    fixedFields.style.display="none";
  }
}

function renderAll(){
  ensureSchedule();
  renderOptions();
  renderWeek();
  renderEmployeeView();
  renderEmployees();
  renderStores();
  renderProfiles();
  renderLeaves();
  renderAccessi();
  renderDashboard();
}

document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>{
  setView(n.dataset.view);
  document.querySelector(".sidebar")?.classList.remove("open"); // chiudi il menù mobile
});
if(typeof navToggle!=="undefined") navToggle.onclick=()=>document.querySelector(".sidebar")?.classList.toggle("open");

// Sezione Ferie
if(typeof leaveForm!=="undefined"){
  leaveForm.onsubmit=addLeave;
  leaveType.onchange=updateLeaveFormFields;
  updateLeaveFormFields();
}
btnGenerateAll.onclick=generateAllSchedules;
btnGenerateSelected.onclick=()=>{
  const selected=storeSelect.value;
  generateStoreSchedule(selected);
  if(stores.some(s=>s.id===selected)) storeSelect.value=selected;
  renderWeek();
};
storeSelect.onchange=()=>{renderWeek();renderTurniIssues();};
btnSave.onclick=()=>{saveData();showNotice("Salvato","ok");};
function clearWeekShifts(){
  if(!confirm("Svuotare tutti i turni di questa settimana? L'azione vale per tutti i dispositivi e non è annullabile.")) return;
  schedules[currentWeekKey]=emptySchedule();
  schedule=schedules[currentWeekKey];
  saveData();
  renderAll();
  showNotice("Turni della settimana svuotati.","warn");
}
btnClear.onclick=clearWeekShifts;
if(typeof btnDashClear!=="undefined") btnDashClear.onclick=clearWeekShifts;
btnPrevWeek.onclick=()=>setWeek(addWeeks(currentWeekKey,-1));
btnNextWeek.onclick=()=>setWeek(addWeeks(currentWeekKey,1));
btnToday.onclick=()=>setWeek(weekKeyOf(new Date()));
btnExportPng.onclick=exportWeekPng;

// Salto rapido a una settimana scegliendo una data qualsiasi (va al lunedì
// di quella settimana). Presente sia in Turni sia in Dashboard.
function jumpToWeekFromInput(value){
  if(!value) return;
  setWeek(weekKeyOf(keyToDate(value)));
}
if(typeof weekJump!=="undefined") weekJump.onchange=e=>jumpToWeekFromInput(e.target.value);
if(typeof btnDashPrevWeek!=="undefined") btnDashPrevWeek.onclick=()=>setWeek(addWeeks(currentWeekKey,-1));
if(typeof btnDashNextWeek!=="undefined") btnDashNextWeek.onclick=()=>setWeek(addWeeks(currentWeekKey,1));
if(typeof btnDashToday!=="undefined") btnDashToday.onclick=()=>setWeek(weekKeyOf(new Date()));
if(typeof dashWeekJump!=="undefined") dashWeekJump.onchange=e=>jumpToWeekFromInput(e.target.value);

// Vista dipendente "Il mio turno"
if(typeof empViewSelect!=="undefined") empViewSelect.onchange=()=>{
  localStorage.setItem("am134_empview", empViewSelect.value||"");
  renderEmployeeView();
};
if(typeof btnEmpPrevWeek!=="undefined") btnEmpPrevWeek.onclick=()=>setWeek(addWeeks(currentWeekKey,-1));
if(typeof btnEmpNextWeek!=="undefined") btnEmpNextWeek.onclick=()=>setWeek(addWeeks(currentWeekKey,1));
if(typeof btnEmpToday!=="undefined") btnEmpToday.onclick=()=>setWeek(weekKeyOf(new Date()));
if(typeof empViewJump!=="undefined") empViewJump.onchange=e=>jumpToWeekFromInput(e.target.value);
storeForm.onsubmit=addStore;
employeeForm.onsubmit=addEmployee;
btnAddSpecialBand.onclick=addSpecialBandRow;
scheduleType.onchange=()=>splitRow.style.display=scheduleType.value==="split"?"grid":"none";
empType.onchange=pauseVisibility;
empPrimaryStore.onchange=()=>renderSecondaryStoreChecks(getSelectedSecondaryStores());
if(typeof empProfile!=="undefined") empProfile.onchange=applySelectedProfile;
employeeCancelBtn.onclick=resetEmployeeForm;
storeCancelBtn.onclick=resetStoreForm;
btnExportBackup.onclick=exportBackup;
btnImportBackup.onclick=()=>importBackupInput.click();
importBackupInput.onchange=()=>{
  const file=importBackupInput.files[0];
  if(file) importBackupFile(file);
  importBackupInput.value="";
};

if(typeof editEmployeeSelect!=="undefined"){
  editEmployeeSelect.onchange=refreshEditShiftOptions;
  editDaySelect.onchange=refreshEditShiftOptions;
  editShiftSelect.onchange=fillCustomFromTemplate;
  editHasPause.onchange=()=>{ editPauseRow.style.display=editHasPause.checked?"grid":"none"; };
  editShiftForm.onsubmit=saveManualShift;
  btnDeleteShift.onclick=deleteManualShift;
  btnCancelEdit.onclick=()=>editShiftDialog.close();
}

// Login / logout / gestione password
if(typeof loginForm!=="undefined"){
  loginForm.onsubmit=async e=>{
    e.preventDefault();
    const pwInput=document.getElementById("loginPassword");
    const err=document.getElementById("loginError");
    const btn=loginForm.querySelector("button[type=submit]");
    if(btn) btn.disabled=true;
    const r=await doLogin(pwInput.value);
    if(btn) btn.disabled=false;
    if(!r){ if(err) err.textContent="Password errata."; return; }
    if(err) err.textContent="";
    pwInput.value="";
    applyAuthGate();
    renderAccessi();
    await loadServerData();   // carica i turni condivisi dopo il login
    setView(r==="employee" ? "mioturno" : "dashboard");
    document.querySelector(".sidebar")?.classList.remove("open");
  };
}
if(typeof btnLogout!=="undefined") btnLogout.onclick=logout;
if(typeof empPwForm!=="undefined") empPwForm.onsubmit=async e=>{
  e.preventDefault();
  const v=document.getElementById("newEmpPw").value.trim();
  if(!v){ showNotice("Inserisci una password.","warn"); return; }
  try{
    const scope=await saveCredential("emp",v);
    document.getElementById("newEmpPw").value="";
    renderAccessi();
    showNotice(scope==="all" ? "Password dipendenti aggiornata per tutti i dispositivi." : "Password dipendenti aggiornata (solo su questo dispositivo).","ok");
  }catch(err){ showNotice("Errore nell'aggiornare la password.","warn"); }
};
if(typeof adminPwForm!=="undefined") adminPwForm.onsubmit=async e=>{
  e.preventDefault();
  const v=document.getElementById("newAdminPw").value.trim();
  if(!v){ showNotice("Inserisci una password.","warn"); return; }
  try{
    const scope=await saveCredential("admin",v);
    document.getElementById("newAdminPw").value="";
    showNotice(scope==="all" ? "Password admin aggiornata per tutti i dispositivi." : "Password admin aggiornata (solo su questo dispositivo).","ok");
  }catch(err){ showNotice("Errore nell'aggiornare la password.","warn"); }
};

pauseVisibility();
if(typeof empProfile!=="undefined") applySelectedProfile();
employeeCancelBtn.style.display='none';
storeCancelBtn.style.display='none';
renderAll();
refreshSession().then(async ()=>{
  applyAuthGate();
  renderAccessi();
  await loadServerData();   // carica i dati condivisi dal server (se attivo)
  startDataPolling();       // i dipendenti ricontrollano periodicamente
});
