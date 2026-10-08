package com.hireai.file.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;

@Service
public class PdfTextExtractionService {

    public String extractText(Path pdfPath) {

        if (pdfPath == null) {
            throw new IllegalArgumentException(
                    "PDF file path is required."
            );
        }

        try (PDDocument document = Loader.loadPDF(pdfPath.toFile())) {

            PDFTextStripper stripper = new PDFTextStripper();

            return stripper.getText(document);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to extract text from PDF.",
                    e
            );
        }
    }
}