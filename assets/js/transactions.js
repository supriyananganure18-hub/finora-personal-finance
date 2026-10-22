/* Transaction CRUD, filtering, and CSV export */
(() => {
  const S=()=>window.FinoraStore.state;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const categoryIcon=c=>({"Food":"utensils","Transportation":"car-front","Shopping":"shopping-bag","Education":"graduation-cap","Entertainment":"clapperboard","Bills":"receipt-text","Healthcare":"heart-pulse","Salary":"briefcase-business","Freelance":"laptop","Other":"circle-dollar-sign"}[c]||"circle-dollar-sign");
  const sortRows=(rows,sort)=>rows.sort((a,b)=>sort==="date-asc"?a.date.localeCompare(b.date):sort==="amount-desc"?b.amount-a.amount:sort==="amount-asc"?a.amount-b.amount:b.date.localeCompare(a.date));
  const filtered=()=>{
    const search=(document.getElementById("transactionSearch")?.value||"").toLowerCase().trim(),type=document.getElementById("typeFilter")?.value||"all",cat=document.getElementById("categoryFilter")?.value||"all",date=document.getElementById("dateFilter")?.value||"all",sort=document.getElementById("sortFilter")?.value||"date-desc",now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),1),last=new Date(now.getFullYear(),now.getMonth()-1,1);
    let rows=S().transactions.filter(t=>(!search||[t.title,t.category,t.payment,t.notes].join(" ").toLowerCase().includes(search))&&(type==="all"||t.type===type)&&(cat==="all"||t.category===cat));
    if(date==="month")rows=rows.filter(t=>new Date(t.date+"T12:00:00")>=start);
    if(date==="last-month")rows=rows.filter(t=>{const d=new Date(t.date+"T12:00:00");return d.getMonth()===last.getMonth()&&d.getFullYear()===last.getFullYear();});
    if(date==="90-days"){const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-90);rows=rows.filter(t=>new Date(t.date+"T12:00:00")>=cutoff);}
    return sortRows(rows,sort);
  };
  const rowHTML=t=>`<tr><td><div class="transaction-name"><span class="transaction-icon"><i class="icon icon-${categoryIcon(t.category)}"></i></span><span><strong>${esc(t.title)}</strong><small>${esc(t.notes||"Personal transaction")}</small></span></div></td><td>${esc(t.category)}</td><td>${new Date(t.date+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td><td>${esc(t.payment||"—")}</td><td><span class="type-pill ${t.type}"><i class="icon icon-${t.type==="income"?"arrow-down-left":"arrow-up-right"}"></i>${t.type==="income"?"Income":"Expense"}</span></td><td class="align-right amount ${t.type}">${t.type==="income"?"+":"−"}${window.Finora.formatMoney(t.amount)}</td><td class="align-right"><div class="action-buttons"><button class="action-btn" data-edit-transaction="${esc(t.id)}" aria-label="Edit ${esc(t.title)}" title="Edit"><i class="icon icon-pencil"></i></button><button class="action-btn delete" data-delete-transaction="${esc(t.id)}" aria-label="Delete ${esc(t.title)}" title="Delete"><i class="icon icon-trash-2"></i></button></div></td></tr>`;
  const render=()=>{
    const body=document.getElementById("transactionsTable");if(!body)return;
    const rows=filtered();body.innerHTML=rows.map(rowHTML).join("");
    document.getElementById("transactionsEmpty").classList.toggle("hidden",rows.length>0);
    document.querySelector(".transaction-table-wrap").classList.toggle("hidden",rows.length===0);
    document.getElementById("transactionCount").textContent=`${rows.length} transaction${rows.length===1?"":"s"}`;
    const sel=document.getElementById("categoryFilter"),cur=sel.value;sel.innerHTML='<option value="all">All categories</option>'+[...new Set([...window.FinoraStore.categories,...S().transactions.map(t=>t.category)])].sort().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");sel.value=[...sel.options].some(o=>o.value===cur)?cur:"all";
  };
  const csv=rows=>{
    const cols=["id","title","amount","type","category","date","payment","notes"];
    const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
    const content=[cols.join(","),...rows.map(t=>cols.map(k=>q(t[k])).join(","))].join("\r\n");
    const blob=new Blob(["\ufeff"+content],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`finora-transactions-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  };
  window.FinoraTransactions={render,filtered,csv,categoryIcon,esc};
})();
