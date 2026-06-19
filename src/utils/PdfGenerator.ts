import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PredictionResult, StudentProfile } from '../types';

export function generatePdfReport(
  profile: StudentProfile,
  topColleges: PredictionResult[],
  strategyColleges: PredictionResult[],
  comparisonColleges: PredictionResult[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Helpers
  const addHeader = (title: string, y: number) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235); // Blue primary
    doc.text(title, margin, y);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
  };

  // --- Title & Header Banner ---
  doc.setFillColor(37, 99, 235); // Blue
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setFillColor(124, 58, 237); // Purple accent
  doc.rect(0, 25, pageWidth, 2, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('DSE COLLEGE PREDICTOR MAHARASHTRA 2025-26', margin, 15);
  doc.setFontSize(10);
  doc.text('Direct Second Year Engineering Admission Report', margin, 21);

  // --- Candidate Profile Card ---
  let currentY = 37;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CANDIDATE INFORMATION', margin, currentY);
  
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY + 3, pageWidth - (margin * 2), 24, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Student Name:', margin + 5, currentY + 10);
  doc.setFont('Helvetica', 'normal');
  doc.text(profile.name, margin + 35, currentY + 10);

  doc.setFont('Helvetica', 'bold');
  doc.text('Diploma Score:', margin + 5, currentY + 16);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile.percentage}%`, margin + 35, currentY + 16);

  doc.setFont('Helvetica', 'bold');
  doc.text('Category Selected:', margin + 5, currentY + 22);
  doc.setFont('Helvetica', 'normal');
  doc.text(profile.category, margin + 35, currentY + 22);

  doc.setFont('Helvetica', 'bold');
  doc.text('Gender:', margin + 110, currentY + 10);
  doc.setFont('Helvetica', 'normal');
  doc.text(profile.gender, margin + 130, currentY + 10);

  doc.setFont('Helvetica', 'bold');
  doc.text('Contact No:', margin + 110, currentY + 16);
  doc.setFont('Helvetica', 'normal');
  doc.text(profile.mobile || 'Not Provided', margin + 130, currentY + 16);

  doc.setFont('Helvetica', 'bold');
  doc.text('Report Date:', margin + 110, currentY + 22);
  doc.setFont('Helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), margin + 130, currentY + 22);

  // --- Preferences Info ---
  currentY += 34;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Preferences Selected:', margin, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  const regionsStr = profile.regions.join(', ');
  doc.text(`Regions: ${regionsStr.length > 80 ? regionsStr.substring(0, 80) + '...' : regionsStr}`, margin + 35, currentY);
  
  const branchesJoined = profile.branches.length > 4 ? `${profile.branches.slice(0, 4).join(', ')} ...` : profile.branches.join(', ');
  doc.text(`Branches: ${branchesJoined}`, margin + 35, currentY + 5);

  // --- Table 1: Top 10 College Recommendations ---
  currentY += 12;
  addHeader('TOP 10 RECOMMENDED COLLEGES', currentY);
  
  const topCollegesRows = topColleges.slice(0, 10).map((r, index) => [
    index + 1,
    r.college.collegeName,
    r.college.branch,
    `${r.cutoffPercent}% (${r.matchedCutoffCategory})`,
    `${r.probability}%`,
    r.chanceStatus
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['#', 'College Name', 'Branch / Course Name', 'Cutoff (Seat)', 'Probability', 'Admission Chance']],
    body: topCollegesRows,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 70 },
      2: { cellWidth: 50 },
      3: { cellWidth: 25 },
      4: { cellWidth: 17 },
      5: { cellWidth: 20 }
    },
    didParseCell: function(data: any) {
      if (data.section === 'body' && data.column.index === 5) {
        const text = data.cell.text[0];
        if (text === 'Safe') {
          data.cell.styles.textColor = [22, 101, 52]; // Dark green
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'High Chance') {
          data.cell.styles.textColor = [30, 58, 138]; // Dark blue
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'Moderate Chance') {
          data.cell.styles.textColor = [113, 63, 18]; // Dark yellow
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'Low Chance') {
          data.cell.styles.textColor = [194, 65, 12]; // Dark orange
        } else if (text === 'Dream') {
          data.cell.styles.textColor = [153, 27, 27]; // Dark red
        }
      }
    }
  });

  // --- Add Page 2 for CAP Form Order & Comparison ---
  doc.addPage();
  currentY = 20;

  // Banner at top of page 2
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('DSE Admissions Maharashtra - Option Form strategy', margin, 8);

  addHeader('RECOMMENDED CAP OPTION FORM ORDER', currentY);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('This order is strategically structured: Dream choices at top, Moderate in middle, and Safe backups at bottom.', margin, currentY + 5);

  const strategyRows = strategyColleges.map((r, index) => [
    index + 1,
    r.college.choiceCode,
    r.college.collegeName,
    r.college.branch,
    r.college.type,
    `${r.cutoffPercent}%`,
    r.chanceStatus
  ]);

  autoTable(doc, {
    startY: currentY + 8,
    head: [['Order', 'Choice Code', 'College Name', 'Branch', 'Type', 'Cutoff', 'Status']],
    body: strategyRows,
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 22 },
      2: { cellWidth: 65 },
      3: { cellWidth: 40 },
      4: { cellWidth: 20 },
      5: { cellWidth: 16 },
      6: { cellWidth: 15 }
    }
  });

  let lastTableY = (doc as any).lastAutoTable.finalY;

  // --- Comparison Table (If colleges selected) ---
  if (comparisonColleges && comparisonColleges.length > 0) {
    currentY = lastTableY + 12;
    if (currentY + 50 > pageHeight - margin) {
      doc.addPage();
      currentY = 20;
    }
    
    addHeader('COLLEGE COMPARISON', currentY);

    const compRows = comparisonColleges.map(r => [
      r.college.collegeName,
      r.college.branch,
      `${r.cutoffPercent}%`,
      r.college.type,
      r.college.location,
      `${r.probability}%`
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['College', 'Branch', 'Previous Cutoff', 'Type', 'Location', 'My Probability']],
      body: compRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5 },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 }
      }
    });
    
    lastTableY = (doc as any).lastAutoTable.finalY;
  }

  // --- Strategic CAP Advice text box ---
  currentY = lastTableY + 10;
  if (currentY + 30 > pageHeight - margin) {
    doc.addPage();
    currentY = 20;
  }

  doc.setDrawColor(253, 186, 116);
  doc.setFillColor(255, 247, 237);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 22, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(194, 65, 12); // Orange warning text
  doc.text('CAP Option Form Strategy Tips:', margin + 5, currentY + 5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 63, 18);
  doc.text('1. Add at least 15-20 college choices in your CAP form to avoid getting unallotted in CAP Round I.', margin + 5, currentY + 10);
  doc.text('2. Keep AI & DS, Cyber Security, or IT branches along with CSE/Computer Engineering to double your allotment chances.', margin + 5, currentY + 14);
  doc.text('3. Put the most ambitious dream colleges at the top, followed by realistic targets, and safe backup colleges at the bottom.', margin + 5, currentY + 18);

  // --- Footer Disclaimer (Draw at the bottom of the current page) ---
  const footerY = pageHeight - 15;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This report is generated using previous CAP cutoff analysis and does not guarantee admission. actual cutoffs can vary based on student registrations.', margin, footerY + 2);
  doc.text(`Page ${doc.internal.pages.length - 1} of ${doc.internal.pages.length - 1}`, pageWidth - margin - 20, footerY + 2);

  // Save report PDF
  doc.save(`DSE_College_Prediction_Report_${profile.name.replace(/\s+/g, '_')}.pdf`);
}
