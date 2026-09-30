'use strict';
const format = n => Number(n).toFixed(3);
const names = {simple:'Simple',compound:'Compound',complex:'Complex'};
let currentComplexity='complex';
let data;
function tableMarkup(headers,rows,caption,{highlight=[],precision=[]}={}) {
  const max=headers.slice(1).map((_,i)=>Math.max(...rows.map(r=>typeof r[i+1]==='number'?r[i+1]:-Infinity)));
  return `<caption class="sr-only">${caption}</caption><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r,k)=>`<tr class="${highlight.includes(k)?'ours':''}"><th scope="row">${r[0]}</th>${r.slice(1).map((v,i)=>`<td class="${typeof v==='number'&&v===max[i]?'best':''}">${typeof v==='number'?v.toFixed(precision[i]??3):v}</td>`).join('')}</tr>`).join('')}</tbody>`;
}
function renderComparison() {
  const rows=data.comparison;
  const best=data.metrics.map((_,i)=>Math.max(...rows.map(r=>r[currentComplexity][i])));
  document.querySelector('#comparison-table tbody').innerHTML=rows.map(r=>`<tr class="${r.ours?'ours':''}"><th scope="row">${r.method}</th><td class="method-backbone">${r.backbone}</td>${r[currentComplexity].map((n,i)=>`<td class="${n===best[i]?'best':''}">${format(n)}</td>`).join('')}</tr>`).join('');
  document.querySelector('#comparison-table caption').textContent=`Baseline comparison for ${names[currentComplexity].toLowerCase()} tasks, reproduced from Table III.`;
  const insights={simple:'On simple tasks, Tri-LLM with Qwen3-Max reaches 1.000 UC and 0.972 GCR. Single-LLM with DeepSeek-V3 has the highest sUC (0.875).',compound:'On compound tasks, Tri-LLM with Qwen3-Max achieves 0.889 GCR, compared with 0.517 for Single-LLM and 0.605 for adapted ProgPrompt with the same backbone.',complex:'On complex tasks, Tri-LLM with Qwen3-Max achieves 0.789 GCR, compared with 0.446 for Single-LLM and 0.464 for adapted ProgPrompt with the same backbone.'};
  document.querySelector('#comparison-insight').textContent=insights[currentComplexity];
}
function renderAblation() {
  const kind=document.querySelector('#ablation-select').value;
  const node=document.querySelector('#ablation-table');
  if(kind==='audit') {
    node.innerHTML=tableMarkup(['Architecture / variant','Simple','Compound','Complex'],data.audit,'Audit ablation, constraint understanding rate from Table V.',{highlight:[0]});
    document.querySelector('#ablation-insight').textContent='On complex tasks, removing Audit reduces Tri-LLM CUR from 0.815 to 0.515.';
  } else {
    const label=kind==='complete'?'Without Complete':'Without functional zones';
    const rows=Object.keys(names).flatMap(k=>[[`${names[k]} · Full`,...data[kind][k][0]],[`${names[k]} · ${label}`,...data[kind][k][1]]]);
    node.innerHTML=tableMarkup(['Task / variant','UC','CUR','sUC'],rows,`${kind==='complete'?'Complete-module':'Functional-zone'} ablation from Table ${kind==='complete'?'IV':'VI'}.`,{highlight:[0,2,4]});
    [...node.querySelectorAll('tbody tr')].forEach((row,i)=>{
      const group=rows.slice(Math.floor(i/2)*2,Math.floor(i/2)*2+2);
      [...row.querySelectorAll('td')].forEach((cell,j)=>cell.classList.toggle('best',rows[i][j+1]===Math.max(...group.map(r=>r[j+1]))));
    });
    document.querySelector('#ablation-insight').textContent=kind==='complete'?'On complex tasks, removing Complete lowers sUC from 0.892 to 0.194.':'Without functional zones, complex-task sUC falls from 0.892 to 0.375, even though UC increases from 0.922 to 1.000.';
  }
}
function activateTab(button,focus=false) {
  currentComplexity=button.dataset.complexity;
  document.querySelectorAll('[data-complexity]').forEach(t=>{const active=t===button;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
  document.querySelector('#comparison-panel').setAttribute('aria-labelledby',button.id);
  if(focus)button.focus();
  renderComparison();
}
async function initResults() {
  try {
    const response=await fetch('./results.json');
    if(!response.ok)throw new Error('Results unavailable');
    data=await response.json();
    renderComparison();renderAblation();
    document.querySelector('#feedback-table').innerHTML=tableMarkup(['Strategy','Simple','Compound','Complex'],data.feedback,'Grounded completion rate by feedback strategy, Table VII.',{highlight:[0]});
    // Tasks per call and calls are descriptive quantities, so only quality metrics receive best-value emphasis.
    document.querySelector('#trigger-table').innerHTML=tableMarkup(['Strategy','UC ↑','sUC ↑','SR ↑','Tasks/call','Calls'],data.trigger,'Trigger strategies on complex scenarios with 15 total tasks, Table VIII.',{highlight:[1,2],precision:[3,3,3,2,1]});
    document.querySelectorAll('#trigger-table tbody tr').forEach(row=>[...row.querySelectorAll('td')].slice(3).forEach(cell=>cell.classList.remove('best')));
    const zeroRows=Object.keys(names).flatMap(k=>[
      [`${names[k]} · Few-shot Tri-LLM`,...data.zeroshot[k][0]],
      [`${names[k]} · Zero-shot Single`,...data.zeroshot[k][1]],
      [`${names[k]} · Zero-shot Tri-LLM`,...data.zeroshot[k][2]]]);
    document.querySelector('#zeroshot-table').innerHTML=tableMarkup(['Task / setting','UC','CUR','sUC'],zeroRows,'Few-shot and zero-shot performance, Table IX.',{highlight:[0,2,3,5,6,8]});
    // Table IX compares settings within each complexity level.
    [...document.querySelectorAll('#zeroshot-table tbody tr')].forEach((row,i)=>{
      const group=zeroRows.slice(Math.floor(i/3)*3,Math.floor(i/3)*3+3);
      [...row.querySelectorAll('td')].forEach((cell,j)=>cell.classList.toggle('best',zeroRows[i][j+1]===Math.max(...group.map(r=>r[j+1]))));
    });
    // Component ablations compare the full and ablated variants within each complexity level.
    document.querySelectorAll('[data-complexity]').forEach(button=>button.addEventListener('click',()=>activateTab(button)));
    document.querySelector('.tabs').addEventListener('keydown',e=>{
      const tabs=[...document.querySelectorAll('[data-complexity]')];const i=tabs.indexOf(document.activeElement);if(i<0)return;
      let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;
      e.preventDefault();activateTab(tabs[next],true);
    });
    document.querySelector('#ablation-select').addEventListener('change',renderAblation);
  }catch(error){
    document.querySelector('#comparison-insight').textContent='The results could not be loaded. Please reload the page.';
    console.error(error);
  }
}
const dialog=document.querySelector('#figure-dialog');
let lastFigureButton;
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
  lastFigureButton=button;
  document.querySelector('#expanded-figure').src=button.dataset.image;
  document.querySelector('#expanded-figure').alt=button.querySelector('img').alt;
  document.querySelector('#figure-dialog-caption').textContent=button.dataset.caption;
  dialog.showModal();
}));
document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>lastFigureButton?.focus());
initResults();
