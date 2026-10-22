/* Monthly category budget calculations and views */
(() => {
  const S=()=>window.FinoraStore.state;
  const money=n=>window.Finora.formatMoney(n);
  const esc=s=>window.FinoraTransactions.esc(s);
  const monthKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const spent=cat=>S().transactions.filter(t=>t.type==="expense"&&t.category===cat&&t.date.startsWith(monthKey())).reduce((sum,t)=>sum+Number(t.amount),0);
  const status=p=>p>=100?"danger":p>=80?"warning":"";
  const icon=cat=>window.FinoraTransactions.categoryIcon(cat);
  const render=()=>{
    const budgets=S().budgets,all=budgets.reduce((s,b)=>s+Number(b.limit),0),used=budgets.reduce((s,b)=>s+spent(b.category),0);
    const sum=document.getElementById("budgetSummary");
    if(sum)sum.innerHTML=`<div class="strip-stat"><span>Total monthly budget</span><strong>${money(all)}</strong></div><div class="strip-stat"><span>Spent this month</span><strong>${money(used)}</strong></div><div class="strip-stat"><span>Budget remaining</span><strong>${money(all-used)}</strong></div>`;
    const cards=document.getElementById("budgetCards");
    if(cards)cards.innerHTML=budgets.map(b=>{const actual=spent(b.category),pct=b.limit?actual/b.limit*100:0,st=status(pct);return `<article class="panel budget-card"><div class="budget-card-head"><span class="goal-icon"><i class="icon icon-${icon(b.category)}"></i></span><div class="budget-card-title"><h2>${esc(b.category)}</h2><p>Monthly spending limit</p></div><div class="card-actions"><button class="action-btn" data-edit-budget="${esc(b.id)}" aria-label="Edit ${esc(b.category)} budget"><i class="icon icon-pencil"></i></button><button class="action-btn delete" data-delete-budget="${esc(b.id)}" aria-label="Delete ${esc(b.category)} budget"><i class="icon icon-trash-2"></i></button></div></div><div class="budget-card-number">${money(actual)}</div><div class="budget-card-caption">spent of ${money(b.limit)}</div><div class="progress-track"><div class="progress-fill ${st}" style="width:${Math.min(100,pct)}%"></div></div><div class="budget-item-bottom"><span class="${st==="danger"?"danger-text":st==="warning"?"warning-text":""}">${pct.toFixed(0)}% used</span><span>${actual>b.limit?`${money(actual-b.limit)} over budget`:`${money(b.limit-actual)} remaining`}</span></div><div class="budget-card-stats"><div><span>Monthly limit</span><strong>${money(b.limit)}</strong></div><div><span>Budget status</span><strong class="${st==="danger"?"danger-text":st==="warning"?"warning-text":""}">${st==="danger"?"Over budget":st==="warning"?"Near limit":"On track"}</strong></div></div></article>`;}).join("");
    document.getElementById("budgetsEmpty")?.classList.toggle("hidden",budgets.length>0);
    document.getElementById("budgetCards")?.classList.toggle("hidden",budgets.length===0);
    const preview=document.getElementById("budgetPreview");
    if(preview)preview.innerHTML=budgets.slice(0,4).map(b=>{const actual=spent(b.category),pct=actual/b.limit*100,st=status(pct);return `<div class="budget-item"><div class="budget-item-top"><div class="budget-category"><i class="icon icon-${icon(b.category)}"></i>${esc(b.category)}</div><div class="budget-amounts"><strong>${money(actual)}</strong> / ${money(b.limit)}</div></div><div class="progress-track"><div class="progress-fill ${st}" style="width:${Math.min(100,pct)}%"></div></div><div class="budget-item-bottom"><span class="${st==="danger"?"danger-text":st==="warning"?"warning-text":""}">${pct.toFixed(0)}% used</span><span>${actual>b.limit?"Limit exceeded":money(b.limit-actual)+" left"}</span></div></div>`;}).join("");
    document.getElementById("budgetPreviewEmpty")?.classList.toggle("hidden",budgets.length>0);
  };
  window.FinoraBudgets={render,spent,monthKey};
})();
