/* Finora storage, seed data, and safe data utilities */
(() => {
  const KEY = "finora.data.v1";
  const categories = ["Food","Transportation","Shopping","Education","Entertainment","Bills","Healthcare","Other"];
  const icons = {"Food":"utensils","Transportation":"car-front","Shopping":"shopping-bag","Education":"graduation-cap","Entertainment":"clapperboard","Bills":"receipt-text","Healthcare":"heart-pulse","Other":"circle-dollar-sign","Salary":"briefcase-business","Freelance":"laptop","Savings":"piggy-bank"};
  const today = new Date();
  const dateAt = (offset, day=12) => { const d = new Date(today.getFullYear(), today.getMonth()+offset, Math.min(day,28)); return d.toISOString().slice(0,10); };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "f-"+Date.now().toString(36)+Math.random().toString(36).slice(2,8));
  const demoData = () => {
    const transactions = [
      ["Monthly Salary",72000,"income","Salary",dateAt(-5,1),"Bank transfer","Monthly salary"],
      ["Freelance design project",12500,"income","Freelance",dateAt(-5,18),"Bank transfer",""],
      ["Grocery Shopping",2480,"expense","Food",dateAt(-5,5),"UPI","Weekly groceries"],
      ["Metro & cab rides",950,"expense","Transportation",dateAt(-5,9),"UPI",""],
      ["Internet Bill",999,"expense","Bills",dateAt(-5,12),"Auto-debit",""],
      ["College Supplies",1850,"expense","Education",dateAt(-5,16),"UPI",""],
      ["Monthly Salary",72000,"income","Salary",dateAt(-4,1),"Bank transfer","Monthly salary"],
      ["Restaurant dinner",1460,"expense","Food",dateAt(-4,7),"UPI",""],
      ["Running shoes",3299,"expense","Shopping",dateAt(-4,11),"Card",""],
      ["Electricity bill",1780,"expense","Bills",dateAt(-4,15),"UPI",""],
      ["Online course",2499,"expense","Education",dateAt(-4,21),"Card",""],
      ["Monthly Salary",75000,"income","Salary",dateAt(-3,1),"Bank transfer","Monthly salary"],
      ["Freelance website",8500,"income","Freelance",dateAt(-3,14),"Bank transfer",""],
      ["Grocery Shopping",3120,"expense","Food",dateAt(-3,4),"UPI",""],
      ["Fuel",1800,"expense","Transportation",dateAt(-3,10),"Card",""],
      ["Streaming subscription",649,"expense","Entertainment",dateAt(-3,19),"Card",""],
      ["Pharmacy",720,"expense","Healthcare",dateAt(-3,23),"UPI",""],
      ["Monthly Salary",75000,"income","Salary",dateAt(-2,1),"Bank transfer","Monthly salary"],
      ["Freelance income",6000,"income","Freelance",dateAt(-2,20),"Bank transfer",""],
      ["Grocery Shopping",2850,"expense","Food",dateAt(-2,6),"UPI",""],
      ["New backpack",2199,"expense","Shopping",dateAt(-2,12),"UPI",""],
      ["Mobile & internet",1299,"expense","Bills",dateAt(-2,16),"Auto-debit",""],
      ["Movie night",850,"expense","Entertainment",dateAt(-2,22),"UPI",""],
      ["Monthly Salary",78000,"income","Salary",dateAt(-1,1),"Bank transfer","Monthly salary"],
      ["Freelance illustration",9500,"income","Freelance",dateAt(-1,17),"Bank transfer",""],
      ["Grocery Shopping",3420,"expense","Food",dateAt(-1,5),"UPI",""],
      ["Commute pass",1200,"expense","Transportation",dateAt(-1,8),"UPI",""],
      ["Course materials",1599,"expense","Education",dateAt(-1,13),"Card",""],
      ["Electricity & water",2140,"expense","Bills",dateAt(-1,18),"UPI",""],
      ["Monthly Salary",78000,"income","Salary",dateAt(0,1),"Bank transfer","Monthly salary"],
      ["Freelance consultation",7200,"income","Freelance",dateAt(0,8),"Bank transfer",""],
      ["Grocery Shopping",2980,"expense","Food",dateAt(0,3),"UPI",""],
      ["Auto & metro",780,"expense","Transportation",dateAt(0,6),"UPI",""],
      ["Internet Bill",999,"expense","Bills",dateAt(0,9),"Auto-debit",""],
      ["College Supplies",1350,"expense","Education",dateAt(0,11),"UPI",""],
      ["Coffee with friends",620,"expense","Food",dateAt(0,13),"UPI",""]
    ].map(r=>({id:uid(),title:r[0],amount:r[1],type:r[2],category:r[3],date:r[4],payment:r[5],notes:r[6]}));
    return {version:1,transactions,budgets:[
      {id:uid(),category:"Food",limit:8000},{id:uid(),category:"Transportation",limit:4000},
      {id:uid(),category:"Shopping",limit:6000},{id:uid(),category:"Bills",limit:5000},
      {id:uid(),category:"Education",limit:4000}
    ],goals:[
      {id:uid(),name:"Emergency fund",target:100000,saved:32000,date:dateAt(8,1),description:"Build a calm, reliable safety net."},
      {id:uid(),name:"New laptop",target:85000,saved:42500,date:dateAt(5,15),description:"A capable setup for learning and creative work."},
      {id:uid(),name:"Weekend getaway",target:25000,saved:9500,date:dateAt(3,20),description:"A little room for a well-earned break."}
    ],settings:{theme:"dark",currency:"INR",name:"Alex Morgan",demo:true}};
  };
  const validState = s => !!s && s.version===1 && Array.isArray(s.transactions) && Array.isArray(s.budgets) && Array.isArray(s.goals) && s.settings && typeof s.settings==="object";
  const load = () => {
    try {
      const raw=localStorage.getItem(KEY);
      if(!raw){const seed=demoData();localStorage.setItem(KEY,JSON.stringify(seed));return seed;}
      const parsed=JSON.parse(raw);
      if(validState(parsed)) return parsed;
    } catch(e) { console.warn("Finora storage could not be read; starting with demo data.",e); }
    const seed=demoData();localStorage.setItem(KEY,JSON.stringify(seed));return seed;
  };
  let state=load();
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch(e){console.error("Finora could not save data",e);return false;}};
  const setState=next=>{state=next;save();return state;};
  const update=fn=>{const next=fn(state);if(next)state=next;save();return state;};
  const resetDemo=()=>{state=demoData();save();return state;};
  const clear=()=>{state={version:1,transactions:[],budgets:[],goals:[],settings:{theme:"dark",currency:"INR",name:"Alex Morgan",demo:false}};save();return state;};
  const exportJSON=()=>JSON.stringify({app:"Finora",version:1,exportedAt:new Date().toISOString(),data:state},null,2);
  const importJSON=raw=>{
    let obj;try{obj=JSON.parse(raw);}catch(e){throw new Error("This file is not valid JSON.");}
    const candidate=obj?.data || obj;
    if(!validState(candidate))throw new Error("This is not a valid Finora backup.");
    if(!candidate.transactions.every(t=>t && typeof t.id==="string" && typeof t.title==="string" && Number.isFinite(Number(t.amount)) && Number(t.amount)>0 && ["income","expense"].includes(t.type) && typeof t.category==="string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date)))throw new Error("Backup contains invalid transaction records.");
    if(!candidate.budgets.every(b=>b && typeof b.id==="string" && typeof b.category==="string" && Number.isFinite(Number(b.limit)) && Number(b.limit)>0))throw new Error("Backup contains invalid budgets.");
    if(!candidate.goals.every(g=>g && typeof g.id==="string" && typeof g.name==="string" && Number.isFinite(Number(g.target)) && Number(g.target)>0 && Number.isFinite(Number(g.saved)) && Number(g.saved)>=0))throw new Error("Backup contains invalid savings goals.");
    const safe={version:1,transactions:candidate.transactions,budgets:candidate.budgets,goals:candidate.goals,settings:{theme:candidate.settings.theme==="light"?"light":"dark",currency:["INR","USD","EUR","GBP"].includes(candidate.settings.currency)?candidate.settings.currency:"INR",name:String(candidate.settings.name||"Alex Morgan").slice(0,60),demo:!!candidate.settings.demo}};
    state=safe;save();return state;
  };
  window.FinoraStore={KEY,categories,icons,uid,demoData,get state(){return state;},save,setState,update,resetDemo,clear,exportJSON,importJSON};
})();
