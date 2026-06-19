import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PredictionResult, StudentProfile } from '../types';

export function generateShortlistPdf(profile: StudentProfile, shortlist: PredictionResult[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const ml = 14, mr = 14;
  const contentW = pageWidth - ml - mr;

  // Banner
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 22, pageWidth, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('MY COLLEGE SHORTLIST — DSE MAHARASHTRA 2025-26', ml, 12);
  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile.name}  ·  ${profile.percentage}%  ·  ${profile.category}  ·  Generated: ${new Date().toLocaleDateString('en-IN')}`, ml, 18.5);

  // Table
  autoTable(doc, {
    startY: 32,
    head: [['#', 'College Name', 'Branch', 'Type', 'Cutoff', 'My Prob.', 'Status']],
    body: shortlist.map((r, i) => [
      i + 1,
      r.college.collegeName,
      r.college.branch,
      r.college.type,
      `${r.cutoffPercent}%\n(${r.matchedCutoffCategory})`,
      `${r.probability}%`,
      r.chanceStatus,
    ]),
    theme: 'grid',
    margin: { left: ml, right: mr },
    headStyles: { fillColor: [124, 58, 237], fontSize: 8, fontStyle: 'bold', halign: 'center', valign: 'middle' },
    bodyStyles: { fontSize: 7.5, textColor: [15, 23, 42], valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 50 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 13, halign: 'center' },
    },
    didParseCell(data: any) {
      if (data.section === 'body' && data.column.index === 6) {
        const colors: Record<string, [number, number, number]> = {
          'Safe': [22, 101, 52], 'High Chance': [30, 58, 138],
          'Moderate Chance': [113, 63, 18], 'Low Chance': [194, 65, 12], 'Dream': [153, 27, 27],
        };
        const c = colors[data.cell.text[0]];
        if (c) { data.cell.styles.textColor = c; data.cell.styles.fontStyle = 'bold'; }
      }
    },
  });

  // Notes section
  const lastY: number = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.text('Notes / Remarks', ml, lastY);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.3);
  doc.line(ml, lastY + 1.5, pageWidth - mr, lastY + 1.5);

  for (let i = 0; i < Math.min(shortlist.length, 15); i++) {
    const rowY = lastY + 8 + i * 9;
    if (rowY + 9 > pageHeight - 16) break;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(`${i + 1}. ${shortlist[i].college.collegeName.slice(0, 55)}`, ml, rowY);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(ml + 70, rowY + 1, pageWidth - mr, rowY + 1);
  }

  // Footer
  const totalPages: number = (doc.internal as any).pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = pageHeight - 8;
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
    doc.line(ml, fy - 4, pageWidth - mr, fy - 4);
    doc.setFont('Helvetica', 'italic'); doc.setFontSize(6); doc.setTextColor(148, 163, 184);
    doc.text('Advisory only — actual 2025-26 cutoffs may vary. Verify with the official CET Cell handbook.', ml, fy - 1);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - mr, fy - 1, { align: 'right' });
    doc.setFontSize(5.5); doc.setTextColor(203, 213, 225);
    doc.text('Developed by Pratik Sachin Kumbhar  |  pratik.1213.coep@gmail.com', pageWidth / 2, fy + 3, { align: 'center' });
  }

  doc.save(`DSE_Shortlist_${profile.name.replace(/\s+/g, '_')}.pdf`);
}

export function generatePdfReport(
  profile: StudentProfile,
  topColleges: PredictionResult[],
  strategyColleges: PredictionResult[],
  comparisonColleges: PredictionResult[]
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth  = doc.internal.pageSize.getWidth();   // 210
  const pageHeight = doc.internal.pageSize.getHeight();  // 297
  const ml = 14;   // left margin
  const mr = 14;   // right margin
  const contentW = pageWidth - ml - mr;                  // 182

  // ── helpers ─────────────────────────────────────────────────────────────────
  const sectionHeader = (title: string, y: number) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text(title, ml, y);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.4);
    doc.line(ml, y + 1.5, pageWidth - mr, y + 1.5);
    return y + 6;
  };

  const labelValue = (
    label: string, value: string,
    x: number, y: number,
    labelWidth = 32
  ) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label, x, y);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, x + labelWidth, y);
  };

  // wrap long text into multiple lines within a max width
  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth) as string[];
  };

  // ── PAGE 1 ──────────────────────────────────────────────────────────────────

  // Banner
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 22, pageWidth, 2, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('DSE COLLEGE PREDICTOR MAHARASHTRA 2025-26', ml, 12);
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('Direct Second Year Engineering — Personalised Admission Report', ml, 18.5);

  // ── Candidate Info Card ───────────────────────────────────────────────────
  let y = 32;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('CANDIDATE INFORMATION', ml, y);

  y += 3;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.rect(ml, y, contentW, 26, 'FD');

  const col2X = ml + contentW / 2 + 4;

  y += 7;
  labelValue('Student Name:',     profile.name,      ml + 4, y);
  labelValue('Gender:',           profile.gender,    col2X,  y);

  y += 6;
  labelValue('Diploma Score:',    `${profile.percentage}%`,             ml + 4, y);
  labelValue('Contact No:',       profile.mobile || 'Not Provided',     col2X,  y);

  y += 6;
  labelValue('Category:',         profile.category,  ml + 4, y);
  labelValue('Report Date:',      new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), col2X, y);

  // ── Preferences ──────────────────────────────────────────────────────────
  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Preferences Selected:', ml, y);

  y += 5;

  // Regions line
  const regionsStr = profile.regions.join(', ');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Regions:', ml + 2, y);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const regLines = wrapText(regionsStr, contentW - 22, 8.5);
  doc.text(regLines, ml + 22, y);
  y += regLines.length * 4.5;

  // Branches line
  y += 1;
  const branchStr = profile.branches.slice(0, 6).join(', ') + (profile.branches.length > 6 ? ` +${profile.branches.length - 6} more` : '');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Branches:', ml + 2, y);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const branchLines = wrapText(branchStr, contentW - 22, 8.5);
  doc.text(branchLines, ml + 22, y);
  y += branchLines.length * 4.5 + 6;

  // ── Top 10 Table ─────────────────────────────────────────────────────────
  y = sectionHeader('TOP 10 RECOMMENDED COLLEGES', y);

  // Column widths must sum to contentW (182)
  // #(7) + College(68) + Branch(52) + Cutoff(22) + Prob(15) + Status(18) = 182
  autoTable(doc, {
    startY: y,
    head: [['#', 'College Name', 'Branch / Course', 'Cutoff', 'Prob.', 'Status']],
    body: topColleges.slice(0, 10).map((r, i) => [
      i + 1,
      r.college.collegeName,
      r.college.branch,
      `${r.cutoffPercent}%\n(${r.matchedCutoffCategory})`,
      `${r.probability}%`,
      r.chanceStatus
    ]),
    theme: 'grid',
    margin: { left: ml, right: mr },
    headStyles: {
      fillColor: [37, 99, 235],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: { fontSize: 7.5, textColor: [15, 23, 42], valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 7,  halign: 'center' },
      1: { cellWidth: 68 },
      2: { cellWidth: 52 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' }
    },
    didParseCell(data: any) {
      if (data.section === 'body' && data.column.index === 5) {
        const t = data.cell.text[0];
        const colors: Record<string, [number,number,number]> = {
          'Safe':            [22, 101, 52],
          'High Chance':     [30,  58, 138],
          'Moderate Chance': [113,  63,  18],
          'Low Chance':      [194,  65,  12],
          'Dream':           [153,  27,  27],
        };
        if (colors[t]) {
          data.cell.styles.textColor = colors[t];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // ── PAGE 2 ──────────────────────────────────────────────────────────────────
  doc.addPage();

  // Small header bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 10, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DSE Admissions Maharashtra 2025-26 — CAP Option Form Strategy', ml, 7);

  y = 18;

  // ── CAP Strategy Table ────────────────────────────────────────────────────
  y = sectionHeader('RECOMMENDED CAP OPTION FORM ORDER', y);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Dream choices at top · Realistic targets in middle · Safe backups at bottom', ml, y);
  y += 5;

  // Order(10) + Code(22) + College(60) + Branch(45) + Type(18) + Cutoff(15) + Status(12) = 182
  autoTable(doc, {
    startY: y,
    head: [['#', 'Choice Code', 'College Name', 'Branch', 'Type', 'Cutoff', 'Status']],
    body: strategyColleges.map((r, i) => [
      i + 1,
      r.college.choiceCode,
      r.college.collegeName,
      r.college.branch,
      r.college.type,
      `${r.cutoffPercent}%`,
      r.chanceStatus
    ]),
    theme: 'striped',
    margin: { left: ml, right: mr },
    headStyles: {
      fillColor: [124, 58, 237],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: { fontSize: 7, textColor: [15, 23, 42], valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 60 },
      3: { cellWidth: 45 },
      4: { cellWidth: 18 },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 12, halign: 'center' }
    },
    didParseCell(data: any) {
      if (data.section === 'body' && data.column.index === 6) {
        const t = data.cell.text[0];
        const colors: Record<string, [number,number,number]> = {
          'Safe':            [22, 101, 52],
          'High Chance':     [30,  58, 138],
          'Moderate Chance': [113,  63,  18],
          'Low Chance':      [194,  65,  12],
          'Dream':           [153,  27,  27],
        };
        if (colors[t]) {
          data.cell.styles.textColor = colors[t];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  let lastY: number = (doc as any).lastAutoTable.finalY;

  // ── Comparison Table ──────────────────────────────────────────────────────
  if (comparisonColleges?.length > 0) {
    let cy = lastY + 10;
    if (cy + 50 > pageHeight - 20) { doc.addPage(); cy = 20; }

    cy = sectionHeader('COLLEGE COMPARISON MATRIX', cy);

    // College(62) + Branch(50) + Cutoff(20) + Type(22) + Region(16) + Prob(12) = 182
    autoTable(doc, {
      startY: cy,
      head: [['College Name', 'Branch', 'Prev. Cutoff', 'Type', 'Region', 'My Prob.']],
      body: comparisonColleges.map(r => [
        r.college.collegeName,
        r.college.branch,
        `${r.cutoffPercent}% (${r.matchedCutoffCategory})`,
        r.college.type,
        r.college.region,
        `${r.probability}%`
      ]),
      theme: 'grid',
      margin: { left: ml, right: mr },
      headStyles: { fillColor: [15, 23, 42], fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 7, textColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 62 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 22 },
        4: { cellWidth: 16, halign: 'center' },
        5: { cellWidth: 12, halign: 'center' }
      }
    });

    lastY = (doc as any).lastAutoTable.finalY;
  }

  // ── Tips Box ──────────────────────────────────────────────────────────────
  let ty = lastY + 8;
  if (ty + 28 > pageHeight - 18) { doc.addPage(); ty = 20; }

  doc.setDrawColor(253, 186, 116);
  doc.setFillColor(255, 247, 237);
  doc.rect(ml, ty, contentW, 26, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12);
  doc.text('CAP Option Form Strategy Tips:', ml + 4, ty + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 63, 18);
  const tips = [
    '1. Add at least 15-20 college choices in your CAP form to avoid being unallotted in Round I.',
    '2. Include AI & DS, Cyber Security or IT alongside CSE/Computer Engg. to maximise allotment chances.',
    '3. Dream colleges at the top, realistic targets in the middle, safe backups at the bottom.'
  ];
  tips.forEach((tip, i) => doc.text(tip, ml + 4, ty + 12 + i * 5));

  // ── Developer card (after tips, before footer) ───────────────────────────
  const cardH = 38;
  let dy = ty + 26 + 8;
  if (dy + cardH > pageHeight - 22) { doc.addPage(); dy = 20; }

  // Outer card — light blue background
  doc.setDrawColor(186, 210, 255);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(ml, dy, contentW, cardH, 2, 2, 'FD');

  // Left accent bar
  doc.setFillColor(37, 99, 235);
  doc.rect(ml, dy, 4, cardH, 'F');

  // "DEVELOPED BY" label
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(37, 99, 235);
  doc.text('DEVELOPED BY', ml + 10, dy + 7);

  // Developer name — large & prominent
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Pratik Sachin Kumbhar', ml + 10, dy + 14);

  // Tagline
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Full-Stack Developer  |  Kolhapur / Pune, Maharashtra', ml + 10, dy + 20);

  // Divider line
  doc.setDrawColor(186, 210, 255);
  doc.setLineWidth(0.3);
  doc.line(ml + 10, dy + 24, ml + contentW - 6, dy + 24);

  // Contact — row 1: email (left) + phone (right)
  doc.setFontSize(6.8);
  const row1Y = dy + 29.5;

  doc.setFillColor(37, 99, 235);
  doc.circle(ml + 11, row1Y - 1, 0.9, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(37, 99, 235);
  doc.text('pratik.1213.coep@gmail.com', ml + 14, row1Y);
  doc.link(ml + 14, row1Y - 3, 52, 4, { url: 'mailto:pratik.1213.coep@gmail.com' });

  doc.setFillColor(71, 85, 105);
  doc.circle(ml + 95, row1Y - 1, 0.9, 'F');
  doc.setTextColor(71, 85, 105);
  doc.text('+91 73855 46546', ml + 98, row1Y);

  // Contact — row 2: LinkedIn (left) + GitHub (right)
  const row2Y = dy + 35.5;

  doc.setFillColor(10, 102, 194);
  doc.circle(ml + 11, row2Y - 1, 0.9, 'F');
  doc.setTextColor(10, 102, 194);
  doc.text('linkedin.com/in/pratik-kumbhar-1213praa29b', ml + 14, row2Y);
  doc.link(ml + 14, row2Y - 3, 78, 4, { url: 'https://www.linkedin.com/in/pratik-kumbhar-1213praa29b/' });

  doc.setFillColor(36, 41, 47);
  doc.circle(ml + 95, row2Y - 1, 0.9, 'F');
  doc.setTextColor(36, 41, 47);
  doc.text('github.com/Pratik-1213', ml + 98, row2Y);
  doc.link(ml + 98, row2Y - 3, 38, 4, { url: 'https://github.com/Pratik-1213' });

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages: number = (doc.internal as any).pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = pageHeight - 8;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(ml, fy - 4, pageWidth - mr, fy - 4);

    // Line 1 — advisory disclaimer (left) + page number (right)
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Advisory only — actual 2025-26 cutoffs may vary. Verify all choices with the official CET Cell handbook.',
      ml, fy - 1
    );
    doc.setFont('Helvetica', 'normal');
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - mr, fy - 1, { align: 'right' });

    // Line 2 — developer credit centred
    doc.setFontSize(5.5);
    doc.setTextColor(203, 213, 225);
    doc.text(
      'Developed by Pratik Sachin Kumbhar  |  pratik.1213.coep@gmail.com',
      pageWidth / 2, fy + 3,
      { align: 'center' }
    );
  }

  doc.save(`DSE_Report_${profile.name.replace(/\s+/g, '_')}.pdf`);
}
