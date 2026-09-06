const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

const printBtnTarget = `          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الاستمارات</span>
          </button>`;

const printBtnReplace = `          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الاستمارات</span>
            </button>
            {window.self !== window.top && (
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">
                ملاحظة: إذا لم يعمل زر الطباعة، يرجى فتح التطبيق في نافذة جديدة.
              </span>
            )}
          </div>`;

code = code.replace(printBtnTarget, printBtnReplace);

fs.writeFileSync(file, code);
