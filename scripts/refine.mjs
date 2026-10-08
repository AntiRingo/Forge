import {readFile,writeFile} from 'node:fs/promises';
let css=await readFile('dist/style.css','utf8');css=css.slice(css.indexOf(':root'));css+='\n.preparing .shape-grid{grid-template-columns:repeat(5,1fr);gap:5px}.preparing .shape-option{padding:8px 1px;font-size:11px}.preparing .sword-glyph{height:31px}.preparing .shape-option small{font-size:10px}\n';await writeFile('dist/style.css',css);
let a=await readFile('dist/app.js','utf8');a=a.replace("glyph(x.id)+'<b>'+x.name+'</b><small>'","glyph(x.id)+'<b>'+({longsword:'长剑',greatsword:'双手剑',rapier:'细剑',katana:'弧刃刀',falchion:'阔刃剑'}[x.id])+'</b><small>'");await writeFile('dist/app.js',a);

