import fitz  # PyMuPDF
from typing import List, Dict, Any
import re

class DocumentProcessor:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def extract_text(self, file_path: str) -> List[Dict[str, Any]]:
        """Extracts text from PDF and returns a list of page contents."""
        doc = fitz.open(file_path)
        pages = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            pages.append({
                "page_num": page_num + 1,
                "content": text
            })
        return pages

    def chunk_text(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Chunks text across pages with overlap."""
        chunks = []
        all_text = ""
        page_mappings = [] # To keep track of which page a char belongs to
        
        for p in pages:
            start_idx = len(all_text)
            all_text += p['content'] + "\n"
            end_idx = len(all_text)
            page_mappings.append({"start": start_idx, "end": end_idx, "page": p['page_num']})

        # Simple overlap chunking
        start = 0
        while start < len(all_text):
            end = start + self.chunk_size
            chunk_content = all_text[start:end]
            
            # Find which page(s) this chunk belongs to
            chunk_pages = []
            for m in page_mappings:
                if not (end <= m['start'] or start >= m['end']):
                    chunk_pages.append(m['page'])
            
            chunks.append({
                "content": chunk_content,
                "pages": list(set(chunk_pages))
            })
            
            start += (self.chunk_size - self.chunk_overlap)
            
        return chunks
