const fs = require('fs');
let file = 'src/context/AppContext.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove any misplaced function definitions inside value={{ ... }}
code = code.replace(/          const addHalqaType = async[\s\S]*?deleteHalqaType\(name\);\s*  \};\s*/g, '');
code = code.replace(/    const addHalqaType = async[\s\S]*?deleteHalqaType\(name\);\s*  \};\s*/g, '');

// Ensure helper functions exist before return
if (!code.includes('const addHalqaType = async (name: string) => {')) {
  const helperFunctions = `
  const addHalqaType = async (name: string) => {
    if (!name.trim() || halqaTypes.includes(name.trim())) return;
    const trimmed = name.trim();
    setHalqaTypes(prev => [...prev, trimmed]);
    const { error } = await supabase.from('halqa_types').insert({ name: trimmed });
    if (error) console.error("Error adding halqa type:", error);
  };

  const updateHalqaType = async (oldName: string, newName: string) => {
    if (!newName.trim() || halqaTypes.includes(newName.trim())) return;
    const trimmed = newName.trim();
    setHalqaTypes(prev => prev.map(t => t === oldName ? trimmed : t));
    const { error } = await supabase.from('halqa_types').update({ name: trimmed }).eq('name', oldName);
    if (error) console.error("Error updating halqa type:", error);
  };

  const deleteHalqaType = async (name: string) => {
    setHalqaTypes(prev => prev.filter(t => t !== name));
    const { error } = await supabase.from('halqa_types').delete().eq('name', name);
    if (error) console.error("Error deleting halqa type:", error);
  };
`;
  code = code.replace(
    '  const extractDOBFromCivilID =',
    helperFunctions + '\n  const extractDOBFromCivilID ='
  );
}

fs.writeFileSync(file, code);
console.log("Cleaned AppContext successfully!");
