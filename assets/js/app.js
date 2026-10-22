/* Finora application controller, modal forms, navigation, settings */
(() => {
  const Store=window.FinoraStore, S=()=>Store.state, $=id=>document.getElementById(id);
  let modalKind=null,editingId=null,lastFocus=null;
  const esc=s=>window.FinoraTransactions.esc(s);
  const money=n=>window.Finora.formatMoney(n);
  const dateToday=()=>new Date().toISOString().slice(0,10);
  const notify=(message,error=false)=>{const el=document.createElement("div");el.className="toast"+(error?" error":"");const i=document.createElement("i");i.className="icon icon-"+(error?"alert-circle":"check-circle-2");const span=document.createElement("span");span.textContent=message;el.append(i,span);$("toastRegion").appendChild(el);setTimeout(()=>el.remove(),3400);};
  const confirmAction=message=>window.confirm(message);
  const download=(name,content,type)=>{const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const renderAll=()=>{window.FinoraDashboard.render();window.FinoraTransactions.render();window.FinoraBudgets.render();window.FinoraGoals.render();window.FinoraReports.render();applySettings();$("demoBanner").classList.toggle("hidden",!S().settings.demo);};
  const applySettings=()=>{
    const settings=S().settings;document.documentElement.dataset.theme=settings.theme==="light"?"light":"dark";
    document.querySelectorAll("[data-theme-choice]").forEach(b=>b.classList.toggle("active",b.dataset.themeChoice===document.documentElement.dataset.theme));
    $("currencySetting").value=settings.currency||"INR";$("nameSetting").value=settings.name||"Alex Morgan";
    // Theme changes chart colors; redraw on the next render cycle.
  };
  const pageNames={overview:"Overview",transactions:"Transactions",budgets:"Budgets","goals":"Savings goals",reports:"Reports",settings:"Settings"};
  const navigate=page=>{
    if(!pageNames[page])return;
    document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${page}`));
    document.querySelectorAll(".nav-item[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    $("pageCrumb").textContent=pageNames[page];$("sidebar").classList.remove("open");
    if(page==="reports")window.FinoraReports.render();
    if(page==="overview")window.FinoraDashboard.render();
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const field=(label,name,type="text",value="",opts={})=>`<div class="field ${opts.full?"full":""}"><label for="field-${name}">${label}${opts.required===false?"":" *"}${type==="select"?`<select id="field-${name}" name="${name}" ${opts.required===false?"":"required"}>${opts.options.map(o=>`<option value="${esc(o)}" ${o===value?"selected":""}>${esc(o)}</option>`).join("")}</select>`:type==="textarea"?`<textarea id="field-${name}" name="${name}" ${opts.required===false?"":"required"} maxlength="${opts.maxlength||500}" placeholder="${esc(opts.placeholder||"")}">${esc(value)}</textarea>`:`<input id="field-${name}" name="${name}" type="${type}" value="${esc(value)}" ${opts.required===false?"":"required"} ${type==="number"?'min="0.01" step="0.01"':''} ${opts.maxlength?`maxlength="${opts.maxlength}"`:""} placeholder="${esc(opts.placeholder||"")}">`}</label></div>`;
  const openModal=(kind,id=null)=>{
    modalKind=kind;editingId=id;lastFocus=document.activeElement;const state=S();let item=null,fields="",title="",desc="",submit="";
    if(id){item=kind==="transaction"?state.transactions.find(x=>x.id===id):kind==="budget"?state.budgets.find(x=>x.id===id):state.goals.find(x=>x.id===id);}
    if(kind==="transaction"){
      title=item?"Edit transaction":"Add transaction";desc="Keep your financial picture accurate with a few details.";submit=item?"Save changes":"Save transaction";
      const cats=[...new Set([...Store.categories,...state.transactions.map(t=>t.category)])].sort();
      fields=field("Transaction title","title","text",item?.title||"",{full:true,maxlength:100,placeholder:"e.g. Grocery shopping"})+
      field("Amount","amount","number",item?.amount??"",{placeholder:"0.00"})+
      field("Type","type","select",item?.type||"expense",{options:["expense","income"]})+
      field("Category","category","select",item?.category||"Food",{options:cats})+
      field("Date","date","date",item?.date||dateToday())+
      field("Payment method","payment","select",item?.payment||"UPI",{options:["UPI","Cash","Debit card","Credit card","Bank transfer","Auto-debit","Other"]})+
      field("Notes","notes","textarea",item?.notes||"",{full:true,required:false,placeholder:"Optional details"});
    } else if(kind==="budget"){
      title=item?"Edit budget":"Create budget";desc="Set a monthly category limit. Spending is calculated from expense transactions.";submit=item?"Save budget":"Create budget";
      const used=state.budgets.map(b=>b.category),cats=Store.categories.filter(c=>!used.includes(c)||c===item?.category);
      fields=field("Category","category","select",item?.category||cats[0]||"Other",{options:cats.length?cats:["Other"]})+
      field("Monthly limit","limit","number",item?.limit??"",{placeholder:"e.g. 5000"});
    } else if(kind==="goal"){
      title=item?"Edit savings goal":"Create savings goal";desc="Give a future milestone a name, target, and date.";submit=item?"Save goal":"Create goal";
      fields=field("Goal name","name","text",item?.name||"",{full:true,maxlength:80,placeholder:"e.g. Emergency fund"})+
      field("Target amount","target","number",item?.target??"",{placeholder:"e.g. 50000"})+
      field("Already saved","saved","number",item?.saved??0,{placeholder:"0"})+
      field("Target date","date","date",item?.date||"",{required:false})+
      field("Description","description","textarea",item?.description||"",{full:true,required:false,placeholder:"What are you saving for?"});
    } else if(kind==="contribution"){
      title="Add savings";desc="This updates the goal tracker only. It does not create an expense transaction or move money.";submit="Add to goal";
      fields=`<div class="field full"><label>Goal <input value="${esc(item.name)}" disabled></label></div>`+field("Contribution amount","contribution","number","",{placeholder:"e.g. 1000"});
    }
    $("modalEyebrow").textContent=kind==="transaction"?"TRANSACTION DETAILS":kind==="budget"?"BUDGET PLANNING":kind==="contribution"?"KEEP THE MOMENTUM":"YOUR NEXT MILESTONE";
    $("modalTitle").textContent=title;$("modalDescription").textContent=desc;$("modalSubmit").textContent=submit;$("modalFields").innerHTML=fields;$("formError").classList.add("hidden");$("modalOverlay").classList.remove("hidden");document.body.style.overflow="hidden";
    setTimeout(()=>$("modalFields").querySelector("input:not([disabled]),select")?.focus(),30);
  };
  const closeModal=()=>{$("modalOverlay").classList.add("hidden");document.body.style.overflow="";modalKind=null;editingId=null;if(lastFocus?.focus)lastFocus.focus();};
  const values=()=>Object.fromEntries(new FormData($("modalForm")).entries());
  const saveModal=e=>{
    e.preventDefault();const v=values(),err=$("formError");err.classList.add("hidden");
    try{
      if(modalKind==="transaction"){
        const amount=Number(v.amount);if(!v.title.trim())throw Error("Enter a transaction title.");if(!Number.isFinite(amount)||amount<=0)throw Error("Amount must be greater than zero.");if(!v.date||! /^\d{4}-\d{2}-\d{2}$/.test(v.date))throw Error("Choose a valid date.");
        const obj={id:editingId||Store.uid(),title:v.title.trim(),amount,type:v.type,category:v.category,date:v.date,payment:v.payment,notes:(v.notes||"").trim()};
        Store.update(s=>({...s,transactions:editingId?s.transactions.map(t=>t.id===editingId?obj:t):[obj,...s.transactions],settings:{...s.settings,demo:false}}));notify(editingId?"Transaction updated":"Transaction added");
      }else if(modalKind==="budget"){
        const limit=Number(v.limit);if(!Number.isFinite(limit)||limit<=0)throw Error("Budget limit must be greater than zero.");
        const existing=S().budgets.find(b=>b.category===v.category&&b.id!==editingId);if(existing)throw Error("A budget already exists for this category.");
        const obj={id:editingId||Store.uid(),category:v.category,limit};Store.update(s=>({...s,budgets:editingId?s.budgets.map(b=>b.id===editingId?obj:b):[...s.budgets,obj],settings:{...s.settings,demo:false}}));notify(editingId?"Budget updated":"Budget created");
      }else if(modalKind==="goal"){
        const target=Number(v.target),saved=Number(v.saved);if(!v.name.trim())throw Error("Enter a goal name.");if(!Number.isFinite(target)||target<=0)throw Error("Target must be greater than zero.");if(!Number.isFinite(saved)||saved<0)throw Error("Saved amount cannot be negative.");
        const obj={id:editingId||Store.uid(),name:v.name.trim(),target,saved:Math.min(saved,Number.MAX_SAFE_INTEGER),date:v.date||"",description:(v.description||"").trim()};Store.update(s=>({...s,goals:editingId?s.goals.map(g=>g.id===editingId?obj:g):[...s.goals,obj],settings:{...s.settings,demo:false}}));notify(editingId?"Goal updated":"Goal created");
      }else if(modalKind==="contribution"){
        const amount=Number(v.contribution);if(!Number.isFinite(amount)||amount<=0)throw Error("Contribution must be greater than zero.");Store.update(s=>({...s,goals:s.goals.map(g=>g.id===editingId?{...g,saved:Number(g.saved)+amount}:g),settings:{...s.settings,demo:false}}));notify("Savings progress updated");
      }
      closeModal();renderAll();
    }catch(error){err.textContent=error.message||"Please check the information and try again.";err.classList.remove("hidden");}
  };
  const remove=(kind,id)=>{
    const list=kind==="transaction"?"transactions":kind==="budget"?"budgets":"goals",item=S()[list].find(x=>x.id===id);if(!item)return;
    if(!confirmAction(`Delete ${kind==="transaction"?"transaction":kind==="budget"?"budget":"savings goal"} "${item.title||item.category||item.name}"? This cannot be undone.`))return;
    Store.update(s=>({...s,[list]:s[list].filter(x=>x.id!==id),settings:{...s.settings,demo:false}}));notify(`${kind==="transaction"?"Transaction":kind==="budget"?"Budget":"Goal"} deleted`);renderAll();
  };
  const exportCsv=()=>window.FinoraTransactions.csv(S().transactions);
  const exportBackup=()=>download(`finora-backup-${dateToday()}.json`,Store.exportJSON(),"application/json");
  const init=()=>{
    document.addEventListener("click",e=>{
      const page=e.target.closest("[data-page]");if(page){e.preventDefault();navigate(page.dataset.page);return;}
      const action=e.target.closest("[data-action]")?.dataset.action;if(action==="add-transaction")openModal("transaction");if(action==="add-budget")openModal("budget");if(action==="add-goal")openModal("goal");
      const editT=e.target.closest("[data-edit-transaction]");if(editT)openModal("transaction",editT.dataset.editTransaction);
      const deleteT=e.target.closest("[data-delete-transaction]");if(deleteT)remove("transaction",deleteT.dataset.deleteTransaction);
      const editB=e.target.closest("[data-edit-budget]");if(editB)openModal("budget",editB.dataset.editBudget);
      const deleteB=e.target.closest("[data-delete-budget]");if(deleteB)remove("budget",deleteB.dataset.deleteBudget);
      const editG=e.target.closest("[data-edit-goal]");if(editG)openModal("goal",editG.dataset.editGoal);
      const deleteG=e.target.closest("[data-delete-goal]");if(deleteG)remove("goal",deleteG.dataset.deleteGoal);
      const contrib=e.target.closest("[data-contribute-goal]");if(contrib)openModal("contribution",contrib.dataset.contributeGoal);
    });
    $("modalForm").addEventListener("submit",saveModal);$("modalClose").addEventListener("click",closeModal);$("modalCancel").addEventListener("click",closeModal);
    $("modalOverlay").addEventListener("click",e=>{if(e.target===$("modalOverlay"))closeModal();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("modalOverlay").classList.contains("hidden"))closeModal();if(e.key==="Escape")$("sidebar").classList.remove("open");});
    ["transactionSearch","typeFilter","categoryFilter","dateFilter","sortFilter"].forEach(id=>$(id).addEventListener(id==="transactionSearch"?"input":"change",()=>window.FinoraTransactions.render()));
    $("resetFilters").addEventListener("click",()=>{["transactionSearch"].forEach(id=>$(id).value="");["typeFilter","categoryFilter","dateFilter"].forEach(id=>$(id).value="all");$("sortFilter").value="date-desc";window.FinoraTransactions.render();});
    $("exportCsv").addEventListener("click",exportCsv);$("reportExport").addEventListener("click",exportCsv);$("reportMonth").addEventListener("change",()=>window.FinoraReports.render());
    $("themeToggle").addEventListener("click",toggleTheme);$("topThemeToggle").addEventListener("click",toggleTheme);$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
    document.querySelectorAll("[data-theme-choice]").forEach(b=>b.addEventListener("click",()=>{Store.update(s=>({...s,settings:{...s.settings,theme:b.dataset.themeChoice}}));applySettings();window.FinoraDashboard.renderCharts();notify("Theme updated");}));
    $("currencySetting").addEventListener("change",e=>{Store.update(s=>({...s,settings:{...s.settings,currency:e.target.value}}));renderAll();notify("Display currency updated");});
    $("profileForm").addEventListener("submit",e=>{e.preventDefault();const name=$("nameSetting").value.trim();if(!name)return;Store.update(s=>({...s,settings:{...s.settings,name}}));renderAll();notify("Profile updated");});
    $("backupExport").addEventListener("click",exportBackup);
    $("backupImport").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;try{if(!confirmAction("Restore this backup and replace all current Finora data? Export a backup first if you need to keep the current data."))return;const text=await file.text();Store.importJSON(text);renderAll();notify("Backup restored successfully");}catch(error){notify(error.message||"Could not restore backup",true);}finally{e.target.value="";}});
    $("resetDemo").addEventListener("click",()=>{if(confirmAction("Reset Finora to the original sample dataset? Current transactions, budgets, goals, and settings will be replaced.")){Store.resetDemo();renderAll();navigate("overview");notify("Sample data restored");}});
    $("clearData").addEventListener("click",()=>{if(confirmAction("Clear ALL Finora application data in this browser? This cannot be undone. Export a JSON backup first if needed.")){Store.clear();renderAll();navigate("overview");notify("Application data cleared");}});
    $("dismissDemo").addEventListener("click",()=>{$("demoBanner").classList.add("hidden");});
    renderAll();
  };
  function toggleTheme(){const next=S().settings.theme==="light"?"dark":"light";Store.update(s=>({...s,settings:{...s.settings,theme:next}}));applySettings();window.FinoraDashboard.renderCharts();window.FinoraReports.render();notify(`${next==="dark"?"Dark":"Light"} theme enabled`);}
  window.Finora={formatMoney(n){const currency=S().settings.currency||"INR";try{return new Intl.NumberFormat("en-IN",{style:"currency",currency,maximumFractionDigits:0}).format(Number(n)||0);}catch(e){return `${currency} ${Number(n||0).toLocaleString("en-IN")}`;}},navigate,notify};
  document.addEventListener("DOMContentLoaded",init);
})();
