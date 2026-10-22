'use strict';
const $=id=>document.getElementById(id);
let report=null;
const sample=`order_id,order_date,product,quantity,unit_price,status
ORD-101,2026-10-01,Notebook,3,29.90,paid
ORD-102,2026-10-02,"Coffee, ground",2,89.50,paid
ORD-103,2026-10-03,Desk lamp,1,249.00,pending
ORD-104,2026-02-30,Keyboard,2,399.00,paid
ORD-105,2026-10-05,Mouse,-1,159.00,paid
ORD-105,2026-10-06,Mouse,1,159.00,paid
ORD-107,2026-10-07,,2,59.00,paid
ORD-108,2026-10-08,USB cable,2,79.999,paid
ORD-109,2026-10-09,Monitor,1,2299.00,refunded
ORD-110,2026-10-10,Headphones,1,499.00,complete`;
function clear(){report=null;$('export').disabled=true;for(const id of ['records','valid','errors','warnings'])$(id).textContent='—';$('issues').replaceChildren();$('bar').style.width='0%';$('count').textContent='';$('health-title').textContent='Ready to inspect';$('health-copy').textContent='Run validation for the current source.';$('empty').hidden=true;}
function render(){if(!report)return;const filtered=report.issues.filter(i=>$('severity').value==='all'||i.severity===$('severity').value);$('issues').replaceChildren();
  for(const i of filtered.slice(0,500)){const tr=document.createElement('tr');for(const value of [i.record,i.column,i.severity,i.message]){const td=document.createElement('td');if(value===i.severity){const badge=document.createElement('span');badge.className='badge '+i.severity;badge.textContent=value;td.append(badge);}else td.textContent=value;tr.append(td);}$('issues').append(tr);}
  $('count').textContent=filtered.length>500?`Showing 500 of ${filtered.length}; export for all`:`${filtered.length} issue${filtered.length===1?'':'s'}`;$('empty').hidden=filtered.length>0;
}
function run(){clear();try{report=Quality.validate($('input').value);$('status').textContent='';$('records').textContent=report.records;$('valid').textContent=report.valid_records;$('errors').textContent=report.errors;$('warnings').textContent=report.warnings;const pct=Math.round(100*report.valid_records/report.records);$('bar').style.width=pct+'%';$('health-title').textContent=pct+'% of records pass all error checks';$('health-copy').textContent=report.errors?'Resolve errors before using this dataset for reporting.':report.warnings?'No errors. Review warnings before proceeding.':'All configured checks passed.';$('export').disabled=false;render();}catch(e){$('status').textContent=e.message;}}
$('input').addEventListener('input',()=>{clear();$('label').textContent='Pasted CSV';$('status').textContent='Source changed. Validate again.';});
$('run').addEventListener('click',run);$('severity').addEventListener('change',render);
$('sample').addEventListener('click',()=>{$('input').value=sample;$('label').textContent='Synthetic orders sample';$('file').value='';run();});
$('file').addEventListener('change',async()=>{const f=$('file').files[0];if(!f)return;clear();$('input').value='';if(f.size>2*1024*1024){$('status').textContent='CSV exceeds the 2 MB limit.';return;}try{$('input').value=new TextDecoder('utf-8',{fatal:true}).decode(await f.arrayBuffer());$('label').textContent=f.name;run();}catch(e){$('status').textContent='Could not read file. Please use UTF-8 CSV.';}});
$('export').addEventListener('click',()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='quality-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('sample').click();
