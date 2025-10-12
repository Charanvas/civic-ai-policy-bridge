import PyPDF2
from docx import Document
import io

class DocumentProcessor:
    @staticmethod
    def extract_text_from_pdf(file_stream):
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(file_stream)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_stream):
        """Extract text from DOCX file"""
        try:
            doc = Document(file_stream)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            raise Exception(f"Error processing DOCX: {str(e)}")
    
    @staticmethod
    def extract_text_from_txt(file_stream):
        """Extract text from TXT file"""
        try:
            text = file_stream.read().decode('utf-8')
            return text.strip()
        except Exception as e:
            raise Exception(f"Error processing TXT: {str(e)}")
    
    @staticmethod
    def process_document(file):
        """Process uploaded document and extract text"""
        filename = file.filename.lower()
        
        if filename.endswith('.pdf'):
            return DocumentProcessor.extract_text_from_pdf(io.BytesIO(file.read()))
        elif filename.endswith('.docx'):
            return DocumentProcessor.extract_text_from_docx(io.BytesIO(file.read()))
        elif filename.endswith('.txt'):
            return DocumentProcessor.extract_text_from_txt(file)
        else:
            raise Exception("Unsupported file format. Please upload PDF, DOCX, or TXT files.")