package com.hireai.file.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class PdfTextExtractionServiceTest {

    private PdfTextExtractionService service;
    private Path tempDirectory;

    @BeforeEach
    void setUp() throws IOException {

        service = new PdfTextExtractionService();

        tempDirectory =
                Files.createTempDirectory(
                        "hireai-pdf-test"
                );
    }

    @AfterEach
    void tearDown() throws IOException {

        if (tempDirectory != null
                && Files.exists(tempDirectory)) {

            try (var files =
                         Files.walk(tempDirectory)) {

                files.sorted(
                        (a, b) -> b.compareTo(a)
                ).forEach(path -> {

                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException ignored) {
                    }

                });
            }
        }
    }

    // =========================================================
    // 1. VALID PDF
    // =========================================================

    @Test
    void extractText_ShouldExtractTextFromValidPdf()
            throws Exception {

        Path pdfPath =
                createPdf("Hello HireAI");

        String result =
                service.extractText(pdfPath);

        assertNotNull(result);

        assertTrue(
                result.contains("Hello HireAI")
        );
    }

    // =========================================================
    // 2. MULTIPLE LINES
    // =========================================================

    @Test
    void extractText_ShouldExtractMultipleLines()
            throws Exception {

        Path pdfPath =
                createPdf(
                        "Java Spring Boot\n"
                        + "MySQL\n"
                        + "HireAI Project"
                );

        String result =
                service.extractText(pdfPath);

        assertNotNull(result);

        assertTrue(
                result.contains(
                        "Java Spring Boot"
                )
        );

        assertTrue(
                result.contains("MySQL")
        );

        assertTrue(
                result.contains(
                        "HireAI Project"
                )
        );
    }

    // =========================================================
    // 3. LONG TEXT
    // =========================================================

    @Test
    void extractText_ShouldExtractLongText()
            throws Exception {

        String text =
                "Candidate Name: Debashis\n"
                + "Skills: Java, Spring Boot, MySQL\n"
                + "Experience: Java Full Stack Development\n"
                + "Project: HireAI Recruitment Platform\n"
                + "Education: B.Tech Computer Science";

        Path pdfPath =
                createPdf(text);

        String result =
                service.extractText(pdfPath);

        assertNotNull(result);

        assertTrue(
                result.contains(
                        "Candidate Name: Debashis"
                )
        );

        assertTrue(
                result.contains(
                        "Java, Spring Boot, MySQL"
                )
        );

        assertTrue(
                result.contains(
                        "HireAI Recruitment Platform"
                )
        );
    }

    // =========================================================
    // 4. EMPTY PDF
    // =========================================================

    @Test
    void extractText_ShouldReturnEmptyTextForEmptyPdf()
            throws Exception {

        Path pdfPath =
                tempDirectory.resolve(
                        "empty.pdf"
                );

        try (PDDocument document =
                     new PDDocument()) {

            document.addPage(
                    new PDPage()
            );

            document.save(
                    pdfPath.toFile()
            );
        }

        String result =
                service.extractText(pdfPath);

        assertNotNull(result);

        assertTrue(
                result.isBlank()
        );
    }

    // =========================================================
    // 5. FILE DOES NOT EXIST
    // =========================================================

    @Test
    void extractText_ShouldThrowRuntimeException_WhenFileDoesNotExist() {

        Path pdfPath =
                tempDirectory.resolve(
                        "does-not-exist.pdf"
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () ->
                                service.extractText(
                                        pdfPath
                                )
                );

        assertEquals(
                "Failed to extract text from PDF.",
                exception.getMessage()
        );

        assertNotNull(
                exception.getCause()
        );

        assertInstanceOf(
                IOException.class,
                exception.getCause()
        );
    }

    // =========================================================
    // 6. INVALID PDF
    // =========================================================

    @Test
    void extractText_ShouldThrowRuntimeException_WhenPdfIsInvalid()
            throws Exception {

        Path pdfPath =
                tempDirectory.resolve(
                        "invalid.pdf"
                );

        Files.writeString(
                pdfPath,
                "This is not a valid PDF file."
        );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () ->
                                service.extractText(
                                        pdfPath
                                )
                );

        assertEquals(
                "Failed to extract text from PDF.",
                exception.getMessage()
        );

        assertNotNull(
                exception.getCause()
        );

        assertInstanceOf(
                IOException.class,
                exception.getCause()
        );
    }

    // =========================================================
    // 7. DIRECTORY INSTEAD OF FILE
    // =========================================================

    @Test
    void extractText_ShouldThrowRuntimeException_WhenPathIsDirectory()
            throws Exception {

        Path directory =
                tempDirectory.resolve(
                        "directory"
                );

        Files.createDirectory(
                directory
        );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () ->
                                service.extractText(
                                        directory
                                )
                );

        assertEquals(
                "Failed to extract text from PDF.",
                exception.getMessage()
        );

        assertNotNull(
                exception.getCause()
        );
    }

    // =========================================================
    // 8. NUMBERS
    // =========================================================

    @Test
    void extractText_ShouldExtractNumbers()
            throws Exception {

        Path pdfPath =
                createPdf(
                        "Score: 95\n"
                        + "Experience: 2 years\n"
                        + "Job ID: 12345"
                );

        String result =
                service.extractText(pdfPath);

        assertTrue(
                result.contains("95")
        );

        assertTrue(
                result.contains("2 years")
        );

        assertTrue(
                result.contains("12345")
        );
    }

    // =========================================================
    // 9. SPECIAL TEXT
    // =========================================================

    @Test
    void extractText_ShouldExtractSpecialText()
            throws Exception {

        Path pdfPath =
                createPdf(
                        "Java Developer - HireAI"
                );

        String result =
                service.extractText(pdfPath);

        assertNotNull(result);

        assertTrue(
                result.contains(
                        "Java Developer"
                )
        );

        assertTrue(
                result.contains(
                        "HireAI"
                )
        );
    }

    // =========================================================
    // 10. EXCEPTION CAUSE
    // =========================================================

    @Test
    void extractText_ShouldPreserveIOExceptionAsCause() {

        Path pdfPath =
                tempDirectory.resolve(
                        "missing-file.pdf"
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () ->
                                service.extractText(
                                        pdfPath
                                )
                );

        Throwable cause =
                exception.getCause();

        assertNotNull(cause);

        assertTrue(
                cause instanceof IOException
        );
    }

    // =========================================================
    // HELPER - CREATE PDF
    // =========================================================

    private Path createPdf(
            String text
    ) throws Exception {

        Path pdfPath =
                Files.createTempFile(
                        tempDirectory,
                        "test-",
                        ".pdf"
                );

        try (PDDocument document =
                     new PDDocument()) {

            PDPage page =
                    new PDPage();

            document.addPage(page);

            try (PDPageContentStream contentStream =
                         new PDPageContentStream(
                                 document,
                                 page
                         )) {

                contentStream.beginText();

                PDType1Font font =
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA
                        );

                contentStream.setFont(
                        font,
                        12
                );

                contentStream.newLineAtOffset(
                        50,
                        700
                );

                String[] lines =
                        text.split("\\n");

                for (String line : lines) {

                    contentStream.showText(
                            line
                    );

                    contentStream.newLineAtOffset(
                            0,
                            -20
                    );
                }

                contentStream.endText();
            }

            document.save(
                    pdfPath.toFile()
            );
        }

        return pdfPath;
    }
}