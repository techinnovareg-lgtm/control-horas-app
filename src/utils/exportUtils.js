import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const formatDate = (dateStr) => {
    try {
        return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: es });
    } catch {
        return dateStr;
    }
};

const getTypeLabel = (type) => type === 'owed' ? 'Falta' : 'Recuperación';

const buildRows = (entries) =>
    [...entries]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(e => ({
            fecha: formatDate(e.date),
            tipo: getTypeLabel(e.type),
            horas: `${e.hours}h`,
            notas: e.notes || '-',
        }));

/**
 * Exporta el período activo a un archivo Excel (.xlsx)
 */
export const exportToExcel = (period, stats) => {
    const rows = buildRows(period.entries);

    const wsData = [
        ['Período:', period.name],
        ['Estado:', period.status === 'active' ? 'En Progreso' : 'Archivado'],
        ['Exportado:', format(new Date(), 'dd/MM/yyyy HH:mm')],
        [],
        ['RESUMEN'],
        ['Total Horas No Laboradas', `${stats.owed}h`],
        ['Total Horas Recuperadas', `${stats.recovered}h`],
        ['Balance Pendiente', `${stats.balance}h`],
        [],
        ['DETALLE DE REGISTROS'],
        ['Fecha', 'Tipo', 'Horas', 'Notas'],
        ...rows.map(r => [r.fecha, r.tipo, r.horas, r.notas]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Anchos de columna
    ws['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 10 }, { wch: 40 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Control de Horas');

    const fileName = `control-horas-${period.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

/**
 * Exporta el período activo a un archivo PDF
 */
export const exportToPDF = (period, stats) => {
    const doc = new jsPDF();
    const rows = buildRows(period.entries);

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(2, 132, 199); // primary-600
    doc.text('Control de Horas No Laboradas', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Período: ${period.name}`, 14, 30);
    doc.text(`Estado: ${period.status === 'active' ? 'En Progreso' : 'Archivado'}`, 14, 37);
    doc.text(`Exportado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 44);

    // Resumen en cajas
    doc.setFontSize(10);
    doc.setTextColor(50);

    const summaryY = 55;
    const boxes = [
        { label: 'Total Deuda', value: `${stats.owed}h`, color: [254, 226, 226] },
        { label: 'Recuperado', value: `${stats.recovered}h`, color: [209, 250, 229] },
        { label: 'Pendiente', value: `${stats.balance}h`, color: [254, 243, 199] },
    ];

    boxes.forEach((box, i) => {
        const x = 14 + i * 65;
        doc.setFillColor(...box.color);
        doc.roundedRect(x, summaryY, 58, 20, 3, 3, 'F');
        doc.setTextColor(80);
        doc.setFontSize(8);
        doc.text(box.label.toUpperCase(), x + 5, summaryY + 7);
        doc.setFontSize(14);
        doc.setTextColor(30);
        doc.text(box.value, x + 5, summaryY + 16);
    });

    // Tabla de registros
    autoTable(doc, {
        startY: summaryY + 30,
        head: [['Fecha', 'Tipo', 'Horas', 'Notas']],
        body: rows.map(r => [r.fecha, r.tipo, r.horas, r.notas]),
        headStyles: {
            fillColor: [2, 132, 199],
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        styles: {
            fontSize: 10,
            cellPadding: 4,
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 35 },
            2: { cellWidth: 20 },
            3: { cellWidth: 'auto' },
        },
    });

    const fileName = `control-horas-${period.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    doc.save(fileName);
};
