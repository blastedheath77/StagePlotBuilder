import { jsPDF } from 'jspdf';
import { StagePlotExportSchema, ProjectMetadata } from '../types/stage';
import { VENUE_TEMPLATES, TEMPLATE_MAP } from '../assets/templates';
import Konva from 'konva';

export class ExportService {
  static exportToPng(stage: Konva.Stage, projectName: string): void {
    const dataUrl = stage.toDataURL({
      pixelRatio: 2.5,
      mimeType: 'image/png',
    });

    const link = document.createElement('a');
    link.download = `${this.slugify(projectName || 'stage_plot')}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportToPdf(
    stage: Konva.Stage,
    metadata: ProjectMetadata,
    plotData: StagePlotExportSchema
  ): void {
    const template = TEMPLATE_MAP.get(plotData.templateId) || VENUE_TEMPLATES[0];
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 12;

    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(margin, margin, pageWidth - margin * 2, 24, 2, 2, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(248, 250, 252);
    pdf.text(
      (metadata.name || 'STAGE SOUND REINFORCEMENT PLOT').toUpperCase(),
      margin + 6,
      margin + 8
    );

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    const bandInfo = metadata.bandName ? `Band/Act: ${metadata.bandName} | ` : '';
    const venueInfo = `Venue Template: ${template.name} (${template.stageDimensions})`;
    pdf.text(`${bandInfo}${venueInfo}`, margin + 6, margin + 14);

    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const engineerInfo = metadata.engineerName ? `Engineer: ${metadata.engineerName} | ` : '';
    pdf.text(`${engineerInfo}Generated: ${dateStr} | StagePlot Builder v1.0`, margin + 6, margin + 19);

    const stageImgData = stage.toDataURL({ pixelRatio: 2 });

    const maxImgWidth = pageWidth - margin * 2;
    const maxImgHeight = pageHeight - margin * 2 - 30;
    const imgAspect = stage.width() / stage.height();

    let imgW = maxImgWidth;
    let imgH = imgW / imgAspect;

    if (imgH > maxImgHeight) {
      imgH = maxImgHeight;
      imgW = imgH * imgAspect;
    }

    const imgX = margin + (maxImgWidth - imgW) / 2;
    const imgY = margin + 26;

    pdf.setDrawColor(51, 65, 85);
    pdf.setFillColor(9, 13, 22);
    pdf.roundedRect(imgX - 1, imgY - 1, imgW + 2, imgH + 2, 2, 2, 'FD');

    pdf.addImage(stageImgData, 'PNG', imgX, imgY, imgW, imgH);

    pdf.save(`${this.slugify(metadata.name || 'stage_plot')}.pdf`);
  }

  static exportToJson(plotData: StagePlotExportSchema, projectName: string): void {
    const jsonString = JSON.stringify(plotData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `${this.slugify(projectName || 'stage_plot')}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static parseImportJson(jsonString: string): StagePlotExportSchema {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON format');
      }

      if (!data.templateId || !Array.isArray(data.elements)) {
        throw new Error('JSON is missing required stage plot schema fields');
      }

      return {
        templateId: data.templateId,
        version: data.version || '1.0',
        elements: data.elements.map((el: any) => ({
          id: String(el.id),
          type: String(el.type),
          label: String(el.label || ''),
          x: Number(el.x) || 0,
          y: Number(el.y) || 0,
          rotation: Number(el.rotation) || 0,
        })),
        connections: Array.isArray(data.connections)
          ? data.connections.map((c: any) => ({
              type: 'multicore',
              from: String(c.from),
              to: String(c.to),
            }))
          : [],
      };
    } catch (err: any) {
      throw new Error(`Failed to import JSON: ${err.message}`);
    }
  }

  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '');
  }
}
