/* Reports and data-derived insights */
(() => {
  const S=()=>window.FinoraStore.state,money=n=>window.Finora.formatMoney(n);
  let trendChart=null;
  const monthDate=k=>new Date(Number(k.slice(0,4)),Number(k.slice(5,7))-1,1);
  const monthKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const sum=(rows,type)=>rows.filter(t=>!type||t.type===type).reduce((s,t)=>s+Number(t.amount),0);
  const render=()=>{
    const input=document.getElementById("reportMonth");if(!input.value)input.value=monthKey(new Date());
    const selected=input.value||monthKey(new Date()),rows=S().transactions.filter(t=>t.date.startsWith(selected)),income=sum(rows,"income"),expenses=sum(rows,"expense"),net=income-expenses,rate=income?net/income*100:0;
    const monthly={};S().transactions.forEach(t=>{const k=t.date.slice(0,7);if(!monthly[k])monthly[k]={income:0,expense:0};monthly[k][t.type]+=Number(t.amount);});
    const monthKeys=Array.from({length:6},(_,i)=>{const d=monthDate(selected);d.setMonth(d.getMonth()+i-5);return monthKey(d);});
    const labels=monthKeys.map(k=>monthDate(k).toLocaleDateString("en-IN",{month:"short",year:"2-digit"}));
    const metrics=[["Income",income,"Selected month"],["Expenses",expenses,"Selected month"],["Net cash flow",net,net>=0?"Positive cash flow":"Negative cash flow"],["Savings rate",`${rate.toFixed(1)}%`,"Net cash flow ÷ income"]];
    document.getElementById("reportMetrics").innerHTML=metrics.map(([title,value,sub])=>`<div class="report-metric"><span>${title}</span><strong>${typeof value==="number"?money(value):value}</strong><small>${sub}</small></div>`).join("");
    const grouped={};rows.filter(t=>t.type==="expense").forEach(t=>grouped[t.category]=(grouped[t.category]||0)+Number(t.amount));const sorted=Object.entries(grouped).sort((a,b)=>b[1]-a[1]),max=sorted[0]?.[1]||1;
    document.getElementById("reportCategories").innerHTML=sorted.length?sorted.map(([cat,val])=>`<div class="report-category-row"><div class="category-name"><i class="category-swatch" style="background:#10b981"></i><span>${window.FinoraTransactions.esc(cat)}</span></div><span class="category-amount">${money(val)}</span><div class="progress-track"><div class="progress-fill" style="width:${val/max*100}%"></div></div></div>`).join(""):'<div class="empty-state"><strong>No expenses for this month</strong><span>Once transactions are recorded, your category breakdown will appear here.</span></div>';
    const largest=[...rows].filter(t=>t.type==="expense").sort((a,b)=>b.amount-a.amount)[0],avg=Object.values(monthly).length?Object.values(monthly).reduce((s,m)=>s+m.expense,0)/Object.values(monthly).length:0,highest=sorted[0],insights=[];
    insights.push({icon:"calendar-days",title:"Monthly spending",text:expenses?`You recorded ${money(expenses)} in expenses during ${monthDate(selected).toLocaleDateString("en-IN",{month:"long",year:"numeric"})}.`:"No expense transactions were recorded for the selected month."});
    insights.push({icon:"chart-no-axes-combined",title:"Top category",text:highest?`${highest[0]} is your largest spending category at ${money(highest[1])}.`:"No category data is available for this month."});
    insights.push({icon:"receipt",title:"Largest expense",text:largest?`${largest.title} was your largest expense at ${money(largest.amount)}.`:"No expenses are available for this month."});
    insights.push({icon:"wallet",title:"Average monthly spend",text:`Across ${Object.keys(monthly).length} month(s) with transactions, the average expense is ${money(avg)}.`});
    insights.push({icon:"piggy-bank",title:"Cash flow",text:income?`${rate.toFixed(1)}% of recorded income remains after expenses this month.`:"Add income transactions to calculate a savings rate."});
    document.getElementById("insightsList").innerHTML=insights.map(i=>`<div class="insight-item"><i class="icon icon-${i.icon}"></i><strong>${i.title}</strong><p>${i.text}</p></div>`).join("");
    if(window.Chart){const c={text:getComputedStyle(document.documentElement).getPropertyValue("--muted").trim(),grid:getComputedStyle(document.documentElement).getPropertyValue("--line").trim()};const ctx=document.getElementById("reportTrendChart");trendChart?.destroy();trendChart=new Chart(ctx,{type:"bar",data:{labels,datasets:[{label:"Income",data:monthKeys.map(k=>monthly[k]?.income||0),backgroundColor:"#10b981",borderRadius:5},{label:"Expenses",data:monthKeys.map(k=>monthly[k]?.expense||0),backgroundColor:"#fb7185",borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"top",align:"end",labels:{usePointStyle:true,boxWidth:7,boxHeight:7,padding:16}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${money(c.raw)}`}}},scales:{x:{grid:{display:false},border:{display:false}},y:{beginAtZero:true,grid:{color:c.grid},border:{display:false},ticks:{callback:v=>v>=100000?`₹${(v/100000).toFixed(1)}L`:v>=1000?`₹${Math.round(v/1000)}k`:`₹${v}`}}}}});}
  };
  window.FinoraReports={render};
})();
