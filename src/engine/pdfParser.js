import * as pdfjsLib from 'pdfjs-dist';

// Cargar el worker de pdf.js localmente en Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

/**
 * Extract text from a PDF File object, preserving line structure.
 *
 * pdf.js returns text items with absolute (x, y) positions on the page.
 * We group items that share the same Y coordinate (within a tolerance)
 * into a single line, then sort lines top-to-bottom and items left-to-right.
 * This produces text that closely matches what you'd see reading the PDF.
 *
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} - The extracted text with newlines between lines
 */
export async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = async function () {
            try {
                const typedarray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // Group items by their Y position (rounded to nearest int to handle floating point variance)
                    const lineMap = new Map();
                    for (const item of textContent.items) {
                        if (!item.str) continue;
                        // PDF coordinate system: Y=0 is bottom of page, higher Y = higher on page
                        // We negate Y so that sorting ascending = top-to-bottom
                        const yKey = Math.round(-item.transform[5]);
                        if (!lineMap.has(yKey)) lineMap.set(yKey, []);
                        lineMap.get(yKey).push({ x: item.transform[4], str: item.str });
                    }

                    // Sort lines top-to-bottom (ascending yKey), then items left-to-right
                    const sortedLines = [...lineMap.entries()]
                        .sort(([ya], [yb]) => ya - yb)
                        .map(([, items]) =>
                            items
                                .sort((a, b) => a.x - b.x)
                                .map(it => it.str)
                                .join('')
                        );

                    fullText += sortedLines.join('\n') + '\n';
                }

                resolve(fullText);
            } catch (error) {
                console.error('Error extracting text from PDF:', error);
                reject(error);
            }
        };

        fileReader.onerror = (error) => reject(error);
        fileReader.readAsArrayBuffer(file);
    });
}
