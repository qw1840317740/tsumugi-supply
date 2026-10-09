const fs=require('fs'),path=require('path');
const folder=path.resolve(__dirname,'../assets/data');
function read(file){const p=path.join(folder,file);return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{};}
module.exports=function(){
 const records={...read('verified-product-specs.json').products,...read('verified-sweets-specs.json'),...read('verified-major-brand-specs.json'),...read('verified-retailer-title-specs.json')};
 for(const [jan,range] of Object.entries(read('verified-lion-range-specs.json'))){
  if(records[jan])records[jan]={...records[jan],specs:[...records[jan].specs,...range.specs],range_source:range.source_url,range_note:range.match_note};
  else records[jan]=range;
 }
 return records;
};
