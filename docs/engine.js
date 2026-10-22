/* Original browser implementation; see quality.py for the CLI equivalent. */
(function(root) {
'use strict';
const columns=['order_id','order_date','product','quantity','unit_price','status'];
function parseCSV(text) {
  text=text.replace(/^\uFEFF/,'');
  let rows=[], row=[], field='', quoted=false, closed=false;
  const pushField=()=>{row.push(field);field='';closed=false;};
  const pushRow=()=>{pushField();if(row.some(v=>v.trim())) rows.push(row);row=[];};
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
    if(c===','){pushField();continue;}
    if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;pushRow();continue;}
    if(closed)throw Error('Unexpected character after a closing quote.');
    if(c==='"'&&field===''){quoted=true;continue;}
    field+=c;
  }
  if(quoted)throw Error('Unclosed quoted field.');
  if(field||row.length||closed)pushRow();
  return rows;
}
function validate(text){
  if(new TextEncoder().encode(text).length>2*1024*1024)throw Error('CSV exceeds the 2 MB limit.');
  const raw=parseCSV(text);
  if(!raw.length)throw Error('CSV is empty.');
  const headers=raw.shift().map(v=>v.trim());
  if(new Set(headers).size!==headers.length)throw Error('Duplicate column headers are not allowed.');
  const missing=columns.filter(c=>!headers.includes(c)).sort();
  if(missing.length)throw Error('Missing columns: '+missing.join(', '));
  if(!raw.length)throw Error('CSV contains a header but no data rows.');
  const issues=[], counts=new Map();
  const rows=raw.map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]||'').trim()])));
  rows.forEach(r=>{if(r.order_id)counts.set(r.order_id,(counts.get(r.order_id)||0)+1);});
  const add=(record,column,rule,severity,message)=>issues.push({record,column,rule,severity,message});
  raw.forEach((r,i)=>{if(r.length!==headers.length)add(i+2,'*','row_width','error','Number of fields differs from header.');});
  rows.forEach((r,i)=>{
    const n=i+2;
    columns.forEach(c=>{if(!r[c])add(n,c,'required','error','Value is required.');});
    if(r.order_id&&counts.get(r.order_id)>1)add(n,'order_id','unique','error','Order ID appears more than once.');
    const d=r.order_date;
    if(d){const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d);let valid=false;
      if(match){const y=+match[1],m=+match[2],day=+match[3];const leap=y%4===0&&(y%100!==0||y%400===0);const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];valid=y>=1&&m>=1&&m<=12&&day>=1&&day<=days[m-1];}
      if(!valid)add(n,'order_date','date','error','Use a real calendar date: YYYY-MM-DD.');}
    for(const c of ['quantity','unit_price']){const v=r[c];if(!v)continue;const num=Number(v),decimal=(v.split('.')[1]||'').length;
      const valid=/^-?\d+(?:\.\d+)?$/.test(v)&&(c==='quantity'?Number.isInteger(num)&&num>0&&num<=1000000:num>=0&&num<=1000000000&&decimal<=2);
      if(!valid)add(n,c,'number','error',c==='quantity'?'Use a whole number from 1 to 1,000,000.':'Use an amount from 0 to 1,000,000,000 with at most 2 decimals.');}
    if(r.status&&!['paid','pending','refunded'].includes(r.status))add(n,'status','category','error','Use paid, pending or refunded (lowercase).');
    else if(r.status==='pending')add(n,'status','pending','warning','Payment is pending; review before recognising revenue.');
  });
  const invalid=new Set(issues.filter(i=>i.severity==='error').map(i=>i.record));
  return {schema_version:1,records:rows.length,valid_records:rows.length-invalid.size,errors:issues.filter(i=>i.severity==='error').length,warnings:issues.filter(i=>i.severity==='warning').length,issues};
}
const api={validate,parseCSV};if(typeof module!=='undefined')module.exports=api;else root.Quality=api;
})(typeof window!=='undefined'?window:globalThis);
