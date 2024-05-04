/// <reference types="node" resolution-mode="require"/>
import * as mupdf from "mupdf";
export declare function loadPDF(data: Buffer | ArrayBuffer | Uint8Array): mupdf.PDFDocument;
