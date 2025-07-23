const { contextBridge } = require("electron");
const XLSX = require("xlsx");

contextBridge.exposeInMainWorld("xlsxAPI", {
  readExcel: (buffer) => {
    return XLSX.read(buffer, { type: "buffer" });
  },
  writeExcel: (json, sheetName = "Sheet1") => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(json);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  },
});
