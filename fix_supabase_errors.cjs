const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace silently failing inserts/updates with error reporting ones.

code = code.replace(
  /\.insert\(\{(.*?)\}\)\.select\(\)\.single\(\)\.then\(\(\{ data \}\) => \{/gs,
  `.insert({$1}).select().single().then(({ data, error }) => {
      if (error) { console.error("Supabase Insert Error:", error); alert("فشل الحفظ في قاعدة البيانات: " + error.message); }`
);

// We have things like:
// await supabase.from("center_info").update({...}).eq("id", 1);
code = code.replace(
  /(await supabase\.from\([^)]+\)\.update\([^)]+\)\.eq\([^)]+\));/g,
  `const __res = $1; if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }`
);

// For deletes:
code = code.replace(
  /(await supabase\.from\([^)]+\)\.delete\(\)\.eq\([^)]+\));/g,
  `const __res = $1; if (__res.error) { console.error("Supabase Delete Error:", __res.error); alert("فشل الحذف: " + __res.error.message); }`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Updated error handling");
