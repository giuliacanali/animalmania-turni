const defaults={"stores": [{"id": "pindaro", "name": "Pindaro", "openDays": ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab"], "sessions": [{"start": "09:00", "end": "20:00"}], "specialBands": [{"start": "09:00", "end": "10:00", "min": 2}, {"start": "14:00", "end": "16:00", "min": 2}, {"start": "19:00", "end": "20:00", "min": 2}]}, {"id": "ostiense", "name": "Ostiense", "openDays": ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab"], "sessions": [{"start": "09:00", "end": "20:00"}], "specialBands": [{"start": "09:00", "end": "10:00", "min": 2}, {"start": "14:00", "end": "16:00", "min": 2}, {"start": "19:00", "end": "20:00", "min": 2}]}], "employees": [{"id": "silvia", "name": "Silvia Casalinuovo", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "", "type": "6-8", "pauseHours": 1}, {"id": "luca_b", "name": "Luca Ballanti", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "Mer", "type": "8", "pauseHours": 1}, {"id": "leonardo", "name": "Leonardo Barbato", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "Mar", "type": "8", "pauseHours": 1}, {"id": "sofia", "name": "Sofia Tomei", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "", "type": "6-8", "pauseHours": 1}, {"id": "giulia_n", "name": "Giulia Nitrola", "weeklyHours": 40, "primaryStoreId": "pindaro", "secondaryStoreIds": [], "rest": "Lun", "type": "8", "pauseHours": 1}, {"id": "giorgia", "name": "Giorgia Quacquarelli", "weeklyHours": 40, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "Gio", "type": "8", "pauseHours": 1}, {"id": "manuel", "name": "Manuel Esposito", "weeklyHours": 40, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "Mer", "type": "8", "pauseHours": 1}, {"id": "simone", "name": "Simone Bindi", "weeklyHours": 40, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "Lun", "type": "8", "pauseHours": 1}, {"id": "luca_g", "name": "Luca Grimaldi", "weeklyHours": 40, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "Ven", "type": "8", "pauseHours": 1}, {"id": "verena", "name": "Verena Loi", "weeklyHours": 36, "primaryStoreId": "ostiense", "secondaryStoreIds": [], "rest": "", "type": "6", "pauseHours": 0}]};
const days=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
const genDays=["Lun","Mar","Mer","Gio","Ven","Sab"];


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

let stores=JSON.parse(localStorage.getItem("am134_stores")||JSON.stringify(defaults.stores));
let employees=JSON.parse(localStorage.getItem("am134_employees")||JSON.stringify(defaults.employees));
normalizeLegacyEmployees();
let schedule=JSON.parse(localStorage.getItem("am134_schedule")||"null")||emptySchedule();
let suppressAutoRender = false;

function saveData(){
  localStorage.setItem("am134_stores",JSON.stringify(stores));
  localStorage.setItem("am134_employees",JSON.stringify(employees));
  localStorage.setItem("am134_schedule",JSON.stringify(schedule));
}

function slug(x){
  return x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
}

function canWorkIn(e,storeId){return e.primaryStoreId===storeId||e.secondaryStoreIds.includes(storeId);}

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

function coverage(storeId,day,band){
  return coverageFull(storeId,day,band);
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

function isMandatoryExactHours(e){
  return !e.fixedShifts && !e.isExtra;
}
function maxWeeklyHours(e){ return Number(e.weeklyHours || 0); }
function getStoreWorkers(storeId){ return employees.filter(e=>canWorkIn(e,storeId)); }
function workerPriority(e, storeId){
  return (e.isExtra ? 1000 : 0) + (e.primaryStoreId===storeId ? 0 : 100);
}
function canWorkDay(e, day){
  if(day==="Dom") return false;
  if(e.rest && e.rest===day) return false;
  return true;
}
function employeeMissingHours(e){ return maxWeeklyHours(e)-employeeTotal(e.id); }
function canAssignShiftStrict(storeId,e,day,shift){
  if(!canWorkDay(e,day)) return false;
  if(schedule[storeId]?.[e.id]?.[day]) return false;
  return employeeTotal(e.id)+shift.workedHours<=maxWeeklyHours(e);
}
function clearGeneratedScheduleForStore(storeId){
  getStoreWorkers(storeId).forEach(e=>{
    schedule[storeId]=schedule[storeId]||{};
    schedule[storeId][e.id]=Object.fromEntries(days.map(d=>[d,null]));
  });
}
function expectedWorkDays(e){
  if(e.type==="8" && e.weeklyHours===40 && e.rest) return 5;
  if(e.type==="6-8" && e.weeklyHours===40 && !e.rest) return 6;
  return null;
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

function isShiftInsideStore(shift,store){
  if(!shift)return false;
  return (shift.segments||[]).every(seg=>{
    return store.sessions.some(session=>toMin(seg.start)>=toMin(session.start)&&toMin(seg.end)<=toMin(session.end));
  });
}

function canAssignShift(storeId,e,day,shift){
  if(day==="Dom"||e.rest===day)return false;
  const existing=shiftHours(schedule[storeId]?.[e.id]?.[day]);
  return employeeTotal(e.id)-existing+shift.workedHours<=e.weeklyHours;
}

function generateStoreSchedule(storeId){
  ensureSchedule();
  const store=stores.find(s=>s.id===storeId);
  if(!store)return;

  clearGeneratedScheduleForStore(storeId);
  applyFixedShiftsForStore(storeId);

  genDays.forEach(day=>{
    if(!store.openDays.includes(day)) return;
    const special=(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false}));
    special.forEach(band=>coverBandGeneric(storeId,day,band,true));
  });

  genDays.forEach(day=>{
    if(!store.openDays.includes(day)) return;
    const baseBands=store.sessions.flatMap(splitSessionIntoSlots);
    baseBands.forEach(band=>coverBandGeneric(storeId,day,band,false));
  });

  completeMandatoryHoursForStore(storeId);
  repairAllCoverageForStore(storeId);
  completeMandatoryHoursForStore(storeId);

  saveData();
  if(!suppressAutoRender){
    renderAll();
    showNotice("Proposta generata.","ok");
  }
}


function findBestAssignmentForBand(storeId,store,workers,day,band,allBands){
  const candidates=[];

  shuffle(workers).forEach(e=>{
    if(e.rest===day)return;
    if(schedule[storeId]?.[e.id]?.[day])return;

    const options=shuffle(shiftOptionsForStore(store,e))
      .filter(opt=>shiftCovers(opt,band))
      .filter(opt=>canAssignShift(storeId,e,day,opt));

    options.forEach(opt=>{
      candidates.push({
        employee:e,
        shift:opt,
        score:scoreShiftForCoverage(storeId,day,opt,allBands,e,storeId)
      });
    });
  });

  if(!candidates.length)return null;

  candidates.sort((a,b)=>{
    const ea=a.employee.isExtra?1:0;
    const eb=b.employee.isExtra?1:0;
    const pa=a.employee.primaryStoreId===storeId?0:1;
    const pb=b.employee.primaryStoreId===storeId?0:1;
    return ea-eb || pa-pb || b.score-a.score || employeeTotal(a.employee.id)-employeeTotal(b.employee.id) || (Math.random()-0.5);
  });

  return candidates[0];
}

function scoreShiftForCoverage(storeId,day,shift,bands,employee,currentStoreId){
  let score=0;

  bands.forEach(b=>{
    const current=coverage(storeId,day,b);
    const missing=Math.max(0,b.min-current);
    if(missing>0 && shiftCovers(shift,b)){
      score += b.base ? 10 : 100;
    }
  });

  // Premia i turni che coprono fasce speciali.
  score += bands.filter(b=>!b.base && shiftCovers(shift,b)).length*50;

  // Per 6-8 da 40h, evita di trasformare tutto in 8h.
  if(employee.type==="6-8" && employee.weeklyHours===40 && !employee.rest){
    const eightCount=genDays.filter(d=>schedule[currentStoreId]?.[employee.id]?.[d]?.workedHours===8).length;
    if(eightCount>=2 && shift.workedHours===8) score -= 80;
    if(shift.workedHours===6) score += 20;
  }

  return score;
}

function repairSpecialCoverage(storeId){ repairAllCoverageForStore(storeId); }

function findBestReplacementForBand(storeId,store,workers,day,band,allBands){
  const candidates=[];

  shuffle(workers).forEach(e=>{
    if(e.rest===day)return;

    const current=schedule[storeId]?.[e.id]?.[day];
    if(!current)return;

    // Se già copre la fascia, non serve sostituirlo.
    if(shiftCovers(current,band))return;

    const oldShift=current;
    const oldHours=shiftHours(oldShift);

    const options=shuffle(shiftOptionsForStore(store,e))
      .filter(opt=>shiftCovers(opt,band))
      .filter(opt=>employeeTotal(e.id)-oldHours+opt.workedHours<=e.weeklyHours)
      .filter(opt=>replacementDoesNotBreakSpecialCoverage(storeId,store,e.id,day,opt,band));

    options.forEach(opt=>{
      candidates.push({
        employee:e,
        shift:opt,
        score:scoreShiftForCoverage(storeId,day,opt,allBands,e,storeId)
      });
    });
  });

  if(!candidates.length)return null;

  candidates.sort((a,b)=>{
    const ea=a.employee.isExtra?1:0;
    const eb=b.employee.isExtra?1:0;
    const pa=a.employee.primaryStoreId===storeId?0:1;
    const pb=b.employee.primaryStoreId===storeId?0:1;
    return ea-eb || pa-pb || b.score-a.score || (Math.random()-0.5);
  });

  return candidates[0];
}

function replacementDoesNotBreakSpecialCoverage(storeId,store,employeeId,day,newShift,targetBand){
  const old=schedule[storeId]?.[employeeId]?.[day];
  schedule[storeId][employeeId][day]=newShift;

  const special=(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false}));

  const ok=special.every(b=>{
    // La fascia che stiamo riparando può ancora essere sotto soglia durante il ciclo,
    // ma la sostituzione deve almeno migliorarla.
    if(b.start===targetBand.start && b.end===targetBand.end)return true;
    return coverage(storeId,day,b)>=b.min;
  });

  schedule[storeId][employeeId][day]=old;
  return ok;
}

function wouldKeepCoverageAfterReplacement(storeId,store,employeeId,day,newShift){
  const old=schedule[storeId]?.[employeeId]?.[day];
  schedule[storeId][employeeId][day]=newShift;

  const ok=requiredBands(store).every(b=>coverage(storeId,day,b)>=Math.min(b.min, coverage(storeId,day,b)));

  schedule[storeId][employeeId][day]=old;
  return ok;
}


function fillWeeklyHours(storeId){
  const store=stores.find(s=>s.id===storeId);
  const workers=employees.filter(e=>canWorkIn(e,storeId));

  workers.forEach(e=>{
    // Regola speciale per chi può fare 6 o 8 ore:
    // su 40h senza riposo deve fare 6 giorni = due turni da 8h + quattro turni da 6h.
    if(e.type==="6-8" && e.weeklyHours===40 && !e.rest){
      fillFlexible40Hours(storeId, store, e);
      return;
    }

    let guard=0;
    while(employeeTotal(e.id)<e.weeklyHours && guard<100){
      guard++;
      const missing=e.weeklyHours-employeeTotal(e.id);
      const options=[];

      genDays.forEach(day=>{
        if(!store.openDays.includes(day))return;
        if(e.rest===day)return;
        if(schedule[storeId]?.[e.id]?.[day])return;

        shiftOptionsForStore(store,e).forEach(opt=>{
          if(opt.workedHours<=missing && canAssignShift(storeId,e,day,opt)){
            options.push({day,opt});
          }
        });
      });

      if(!options.length)break;

      options.sort((a,b)=>b.opt.workedHours-a.opt.workedHours || (Math.random()-0.5));
      const chosen=options[0];
      schedule[storeId][e.id][chosen.day]=chosen.opt;
    }
  });
}

function fillFlexible40Hours(storeId, store, e){
  const openDays=shuffle(genDays.filter(day=>store.openDays.includes(day)));

  // Obiettivo: 6 giorni lavorati, 40h, combinazione ideale 8+8+6+6+6+6.
  let guard=0;
  while(employeeTotal(e.id)<40 && guard<120){
    guard++;

    const missing=40-employeeTotal(e.id);
    const workedDays=openDays.filter(day=>schedule[storeId]?.[e.id]?.[day]).length;
    const emptyDays=openDays.filter(day=>!schedule[storeId]?.[e.id]?.[day]);

    if(!emptyDays.length)break;

    const remainingDays=6-workedDays;
    if(remainingDays<=0)break;

    const eightCount=openDays.filter(d=>schedule[storeId]?.[e.id]?.[d]?.workedHours===8).length;

    let targetHours=6;
    if(eightCount<2 && missing-(remainingDays-1)*6>=8){
      targetHours=8;
    }

    const day=shuffle(emptyDays)[0];
    let options=shiftOptionsForStore(store,e)
      .filter(opt=>opt.workedHours===targetHours)
      .filter(opt=>canAssignShift(storeId,e,day,opt));

    if(!options.length){
      options=shiftOptionsForStore(store,e)
        .filter(opt=>opt.workedHours<=missing)
        .filter(opt=>canAssignShift(storeId,e,day,opt));
    }

    if(!options.length)break;

    options.sort((a,b)=>{
      const special=(store.specialBands||[]).map(x=>({...x,min:Number(x.min||2),base:false}));
      return scoreShiftForCoverage(storeId,day,b,special,e,storeId)-scoreShiftForCoverage(storeId,day,a,special,e,storeId) || (Math.random()-0.5);
    });

    schedule[storeId][e.id][day]=options[0];
  }

  // Se è sotto 40h, prova a promuovere alcuni 6h a 8h senza superare 40.
  openDays.forEach(day=>{
    if(employeeTotal(e.id)>=40)return;
    const current=schedule[storeId]?.[e.id]?.[day];
    if(!current || current.workedHours!==6)return;

    const options=shiftOptionsForStore(store,e)
      .filter(opt=>opt.workedHours===8)
      .filter(opt=>employeeTotal(e.id)-6+8<=40);

    if(options.length){
      schedule[storeId][e.id][day]=shuffle(options)[0];
    }
  });
}

function generateAllSchedules(){
  const currentView=document.querySelector(".view.active")?.id || "dashboard";
  const selectedStore=storeSelect.value;

  suppressAutoRender=true;
  stores.forEach(st=>generateStoreSchedule(st.id));
  globalCrossStoreRepair();
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

function buildFixedShiftFields(existing={}){
  const dayNames={Lun:"Lunedì",Mar:"Martedì",Mer:"Mercoledì",Gio:"Giovedì",Ven:"Venerdì",Sab:"Sabato"};
  fixedShiftFields.innerHTML=genDays.map(d=>{
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
  empPrimaryStore.innerHTML=opts;

  if(typeof empProfile!=="undefined"){
    empProfile.innerHTML=employeeProfiles.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
    if(selectedProfile && employeeProfiles.some(p=>p.id===selectedProfile)) empProfile.value=selectedProfile;
  }

  if(selectedStore && stores.some(s=>s.id===selectedStore)) storeSelect.value=selectedStore;
  if(selectedPrimary && stores.some(s=>s.id===selectedPrimary)) empPrimaryStore.value=selectedPrimary;

  renderSecondaryStoreChecks(selectedSecondaries);
}

function renderWeek(){
  ensureSchedule();
  const storeId=storeSelect.value||stores[0]?.id;
  if(!storeId)return;
  const workers=employees.filter(e=>canWorkIn(e,storeId));

  weekBody.innerHTML=workers.map(e=>{
    return `<tr><td>${e.name}</td>${days.map(d=>cell(storeId,e,d)).join("")}<td><span class="hours ${employeeTotal(e.id)>e.weeklyHours?'over':employeeTotal(e.id)===e.weeklyHours?'ok':''}">${employeeTotal(e.id)}/${e.weeklyHours}h</span></td></tr>`;
  }).join("")||`<tr><td colspan="9">Nessun dipendente</td></tr>`;

  renderDays();

  document.querySelectorAll(".editable-cell").forEach(cell=>{
    cell.onclick=()=>openShiftEditor(cell.dataset.store, cell.dataset.employee, cell.dataset.day);
  });
}

function cell(storeId,e,d){
  const sh=schedule[storeId]?.[e.id]?.[d];
  const content = sh
    ? `<span class="shift">${sh.time}</span>${sh.pause && sh.pause!=="No"?`<span class="note">Pausa ${sh.pause}</span>`:""}`
    : `<span class="muted">${e.rest===d?'Riposo':'—'}</span>`;

  return `<td class="editable-cell" data-store="${storeId}" data-employee="${e.id}" data-day="${d}">${content}</td>`;
}

function renderDays(){
  const storeId=storeSelect.value||stores[0]?.id;
  const workers=employees.filter(e=>canWorkIn(e,storeId));

  storeDays.innerHTML=days.map(d=>{
    const rows=workers.map(e=>[e,schedule[storeId]?.[e.id]?.[d]])
      .filter(x=>x[1])
      .sort((a,b)=>a[1].time.localeCompare(b[1].time))
      .map(([e,s])=>`<div class="person editable-person" data-store="${storeId}" data-employee="${e.id}" data-day="${d}"><strong>${e.name}</strong><span>${s.time}</span></div>`)
      .join("");

    return `<div class="day"><h3>${d}</h3>${rows||'<span class="muted">—</span>'}</div>`;
  }).join("");

  document.querySelectorAll(".editable-person").forEach(item=>{
    item.onclick=()=>openShiftEditor(item.dataset.store, item.dataset.employee, item.dataset.day);
  });
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
  renderSecondaryStoreChecks(e.secondaryStoreIds||[]);
  if(e.fixedShifts){
    buildFixedShiftFields(e.fixedSchedule||{});
  }
  employeeSubmitBtn.textContent="Aggiorna dipendente";
  employeeCancelBtn.style.display="inline-block";
  setView("dipendenti");
}

function renderEmployees(){
  const table=document.getElementById("employeeTable");
  if(!table) return;

  table.innerHTML=employees.map(e=>{
    const primary=stores.find(s=>s.id===e.primaryStoreId)?.name||"-";
    const profile=getProfile(e.profileId);
    const label=shiftTypeLabel(e.type);
    return `<tr>
      <td><strong>${e.name}</strong></td>
      <td>${profile.name}${e.isExtra?' · Extra':''}</td>
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
    const p=Math.min(100,Math.round(h/e.weeklyHours*100));
    return `<div class="progressrow"><header><span>${e.name}</span><span>${h}/${e.weeklyHours}h</span></header><div class="progress"><span style="width:${p}%"></span></div></div>`;
  }).join("")||"Nessun dipendente";

  renderTurniIssues();
}



function enforceMandatoryFlexible40Hours(storeId){ completeMandatoryHoursForStore(storeId); }

function promoteSixToEightWithoutBreakingSpecials(storeId,store,e){
  const daysToTry=shuffle(genDays.filter(day=>store.openDays.includes(day)));

  for(const day of daysToTry){
    const current=schedule[storeId]?.[e.id]?.[day];
    if(!current || current.workedHours!==6)continue;

    const options=shiftOptionsForStore(store,e)
      .filter(opt=>opt.workedHours===8)
      .filter(opt=>employeeTotal(e.id)-6+8<=40)
      .filter(opt=>replacementPreservesSpecials(storeId,store,e.id,day,opt));

    if(options.length){
      options.sort((a,b)=>scoreShiftForCoverage(storeId,day,b,requiredBands(store),e,storeId)-scoreShiftForCoverage(storeId,day,a,requiredBands(store),e,storeId));
      schedule[storeId][e.id][day]=options[0];
      return true;
    }
  }

  return false;
}

function addMissingShiftForFlexible40(storeId,store,e){
  const missing=40-employeeTotal(e.id);
  if(missing<=0)return false;

  const emptyDays=shuffle(genDays.filter(day=>store.openDays.includes(day) && !schedule[storeId]?.[e.id]?.[day]));
  for(const day of emptyDays){
    const options=shiftOptionsForStore(store,e)
      .filter(opt=>opt.workedHours<=missing)
      .filter(opt=>canAssignShift(storeId,e,day,opt));

    if(options.length){
      options.sort((a,b)=>b.workedHours-a.workedHours);
      schedule[storeId][e.id][day]=options[0];
      return true;
    }
  }

  return false;
}

function reduceEightToSixWithoutBreakingSpecials(storeId,store,e){
  const daysToTry=shuffle(genDays.filter(day=>store.openDays.includes(day)));

  for(const day of daysToTry){
    const current=schedule[storeId]?.[e.id]?.[day];
    if(!current || current.workedHours!==8)continue;

    const options=shiftOptionsForStore(store,e)
      .filter(opt=>opt.workedHours===6)
      .filter(opt=>replacementPreservesSpecials(storeId,store,e.id,day,opt));

    if(options.length){
      schedule[storeId][e.id][day]=options[0];
      return true;
    }
  }

  return false;
}

function replacementPreservesSpecials(storeId,store,employeeId,day,newShift){
  const old=schedule[storeId]?.[employeeId]?.[day];
  schedule[storeId][employeeId][day]=newShift;

  const special=(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false}));
  const ok=special.every(b=>coverage(storeId,day,b)>=b.min);

  schedule[storeId][employeeId][day]=old;
  return ok;
}



function applyFixedShiftsForStore(storeId){
  const store=stores.find(s=>s.id===storeId);
  getStoreWorkers(storeId).filter(e=>e.fixedShifts).forEach(e=>{
    schedule[storeId][e.id]=Object.fromEntries(days.map(d=>[d,null]));
    Object.entries(e.fixedSchedule||{}).forEach(([day,f])=>{
      if(day==="Dom")return;
      const sh=fixedShiftToShift(f);
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
    .filter(e=>!e.fixedShifts)
    .filter(e=>!e.isExtra) // Extra: sempre visibili ma mai generati automaticamente
    .filter(e=>canWorkDay(e,day))
    .forEach(e=>{
      const existing=schedule[storeId]?.[e.id]?.[day];

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
          .filter(opt=>employeeTotal(e.id)-oldHours+opt.workedHours<=maxWeeklyHours(e))
          .filter(opt=>replacementPreservesCriticalCoverage(storeId,store,e.id,day,opt,band))
          .forEach(opt=>candidates.push({employee:e,shift:opt,score:genericScore(storeId,day,band,e,opt,preferSpecial)-10}));
      }
    });

  if(!candidates.length) return null;

  candidates.sort((a,b)=>{
    return workerPriority(a.employee,storeId)-workerPriority(b.employee,storeId)
      || b.score-a.score
      || employeeTotal(a.employee.id)-employeeTotal(b.employee.id)
      || (Math.random()-0.5);
  });

  return candidates[0];
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

  // I dipendenti normali devono arrivare alle ore contrattuali.
  // Gli extra invece non vengono riempiti a 30h: entrano solo sui buchi.
  if(!e.isExtra){
    if(e.isExtra) return null;
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
  const workers=getStoreWorkers(storeId).filter(e=>!e.fixedShifts && !e.isExtra);
  const ordered=workers.slice().sort((a,b)=>workerPriority(a,storeId)-workerPriority(b,storeId));

  ordered.forEach(e=>{
    let guard=0;
    while(employeeTotal(e.id)<maxWeeklyHours(e) && guard<250){
      guard++;
      const assignment=findBestHourCompletion(storeId,store,e);
      if(!assignment) break;
      schedule[storeId][e.id][assignment.day]=assignment.shift;
    }

    guard=0;
    while(employeeTotal(e.id)>maxWeeklyHours(e) && guard<120){
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
  const overflow=employeeTotal(e.id)-maxWeeklyHours(e);
  const candidates=[];

  genDays.forEach(day=>{
    const current=schedule[storeId]?.[e.id]?.[day];
    if(!current) return;

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

function repairAllCoverageForStore(storeId){
  const store=stores.find(s=>s.id===storeId);
  genDays.forEach(day=>{
    if(!store.openDays.includes(day)) return;
    const bands=[
      ...(store.specialBands||[]).map(b=>({...b,min:Number(b.min||2),base:false})),
      ...store.sessions.flatMap(splitSessionIntoSlots)
    ];
    bands.forEach(b=>coverBandGeneric(storeId,day,b,!b.base));
  });
}

function globalCrossStoreRepair(){
  stores.forEach(st=>{
    repairAllCoverageForStore(st.id);
    completeMandatoryHoursForStore(st.id);
    repairAllCoverageForStore(st.id);
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

    if(total>maxWeeklyHours(e)){
      out.push({type:"danger",text:`${e.name}: supera le ore massime ${total}/${maxWeeklyHours(e)}h`});
    }

    if(!e.isExtra && total<maxWeeklyHours(e)){
      out.push({type:"warn",text:`${e.name}: ore non raggiunte ${total}/${maxWeeklyHours(e)}h`});
    }
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

    genDays.forEach(d=>{
      if(!st.openDays.includes(d)) return;

      // Fasce speciali: controllate esattamente.
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
    rest:profile.id==="extra_30"||profile.id==="turno_fisso"?"":empRest.value,
    type:profile.type,
    pauseHours:(profile.id==="solo_6"||profile.id==="extra_30"||profile.id==="turno_fisso")?0:Number(empPause.value||0),
    profileId:profile.id,
    isExtra:!!profile.isExtra,
    fixedShifts:profile.id==="turno_fisso",
    fixedSchedule:fixedShifts
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
  employees=employees.filter(e=>e.id!==id);
  stores.forEach(s=>{if(schedule[s.id])delete schedule[s.id][id];});
  saveData();
  renderAll();
}

function deleteStore(id){
  stores=stores.filter(s=>s.id!==id);
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

function showNotice(m,t="ok"){
  notice.textContent=m;
  notice.className=`notice show ${t}`;
  setTimeout(()=>notice.classList.remove("show"),3000);
}


function openShiftEditor(storeId, employeeId, day){
  if(day==="Dom") return;

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
  if(current){
    const match=[...editShiftSelect.options].find(o=>o.dataset.time===current.time);
    if(match) editShiftSelect.value=match.value;
  }

  editShiftDialog.showModal();
}

function refreshEditShiftOptions(){
  const storeId=editStoreId.value;
  const employeeId=editEmployeeSelect.value;
  const store=stores.find(s=>s.id===storeId);
  const employee=employees.find(e=>e.id===employeeId);
  if(!store||!employee) return;

  const opts=shiftOptionsForStore(store,employee);
  editShiftSelect.innerHTML=`<option value="">— Nessun turno —</option>`+opts.map((opt,i)=>{
    const pause=(opt.pause&&opt.pause!=="No")?` · Pausa ${opt.pause}`:"";
    return `<option value="${i}" data-time="${opt.time}">${opt.time}${pause} · ${opt.workedHours}h</option>`;
  }).join("");
}

function saveManualShift(event){
  event.preventDefault();

  const storeId=editStoreId.value;
  const oldEmployeeId=editEmployeeId.value;
  const newEmployeeId=editEmployeeSelect.value;
  const day=editDaySelect.value;
  const shiftIndex=editShiftSelect.value;

  const store=stores.find(s=>s.id===storeId);
  const employee=employees.find(e=>e.id===newEmployeeId);
  if(!store||!employee) return;

  // rimuovi turno vecchio dalla posizione originale
  if(schedule[storeId]?.[oldEmployeeId]?.[editDay.value]){
    schedule[storeId][oldEmployeeId][editDay.value]=null;
  }

  if(!schedule[storeId][newEmployeeId]){
    schedule[storeId][newEmployeeId]=Object.fromEntries(days.map(d=>[d,null]));
  }

  if(shiftIndex===""){
    schedule[storeId][newEmployeeId][day]=null;
  }else{
    const option=shiftOptionsForStore(store,employee)[Number(shiftIndex)];
    if(!option){
      showNotice("Turno non valido.","warn");
      editShiftDialog.close();
      renderAll();
      return;
    }

    if(employee.rest===day){
      showNotice("Turno non salvato: giorno di riposo.","warn");
      editShiftDialog.close();
      renderAll();
      return;
    }

    const previous=schedule[storeId][newEmployeeId][day];
    schedule[storeId][newEmployeeId][day]=null;
    const wouldTotal=employeeTotal(newEmployeeId)+option.workedHours;

    if(wouldTotal>employee.weeklyHours){
      schedule[storeId][newEmployeeId][day]=previous;
      showNotice("Turno non salvato: supererebbe le ore settimanali.","warn");
      editShiftDialog.close();
      renderAll();
      return;
    }

    schedule[storeId][newEmployeeId][day]=option;
  }

  saveData();
  editShiftDialog.close();
  renderAll();
  showNotice("Turno modificato. Avvisi ricalcolati.","ok");
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

function setView(v){
  document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===v));
  document.querySelectorAll(".view").forEach(s=>s.classList.toggle("active",s.id===v));
  title.textContent={dashboard:"Dashboard",turni:"Turni",dipendenti:"Dipendenti",negozi:"Negozi"}[v];
  subtitle.textContent={dashboard:"Panoramica della settimana.",turni:"Vista settimanale per negozio.",dipendenti:"Gestione personale.",negozi:"Gestione punti vendita."}[v];
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
  renderEmployees();
  renderStores();
  renderProfiles();
  renderDashboard();
}

document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>setView(n.dataset.view));
btnGenerateAll.onclick=generateAllSchedules;
btnGenerateSelected.onclick=()=>{
  const selected=storeSelect.value;
  generateStoreSchedule(selected);
  if(stores.some(s=>s.id===selected)) storeSelect.value=selected;
  renderWeek();
};
storeSelect.onchange=()=>{renderWeek();renderTurniIssues();};
btnSave.onclick=()=>{saveData();showNotice("Salvato","ok");};
btnClear.onclick=()=>{schedule=emptySchedule();saveData();renderAll();showNotice("Turni svuotati","warn");};
storeForm.onsubmit=addStore;
employeeForm.onsubmit=addEmployee;
btnAddSpecialBand.onclick=addSpecialBandRow;
scheduleType.onchange=()=>splitRow.style.display=scheduleType.value==="split"?"grid":"none";
empType.onchange=pauseVisibility;
empPrimaryStore.onchange=()=>renderSecondaryStoreChecks(getSelectedSecondaryStores());
if(typeof empProfile!=="undefined") empProfile.onchange=applySelectedProfile;
employeeCancelBtn.onclick=resetEmployeeForm;
storeCancelBtn.onclick=resetStoreForm;

if(typeof editEmployeeSelect!=="undefined"){
  editEmployeeSelect.onchange=refreshEditShiftOptions;
  editDaySelect.onchange=refreshEditShiftOptions;
  editShiftForm.onsubmit=saveManualShift;
  btnDeleteShift.onclick=deleteManualShift;
  btnCancelEdit.onclick=()=>editShiftDialog.close();
}

pauseVisibility();
if(typeof empProfile!=="undefined") applySelectedProfile();
employeeCancelBtn.style.display='none';
storeCancelBtn.style.display='none';
renderAll();
